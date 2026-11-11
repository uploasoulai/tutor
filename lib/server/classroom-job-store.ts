import { promises as fs } from 'fs';
import path from 'path';
import type {
  ClassroomGenerationProgress,
  ClassroomGenerationStep,
  GenerateClassroomInput,
  GenerateClassroomResult,
} from '@/lib/server/classroom-generation';
import {
  CLASSROOM_JOBS_DIR,
  ensureClassroomJobsDir,
  usesPersistentClassroomStore,
  writeJsonFileAtomic,
} from '@/lib/server/classroom-storage';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { initialSchoolGeneration, type SchoolGenerationState } from './school-generation-state';

export type ClassroomGenerationJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface ClassroomGenerationJob {
  id: string;
  status: ClassroomGenerationJobStatus;
  step: ClassroomGenerationStep | 'queued' | 'failed';
  progress: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
  inputSummary: {
    requirementPreview: string;
    hasPdf: boolean;
    pdfTextLength: number;
    pdfImageCount: number;
  };
  scenesGenerated: number;
  totalScenes?: number;
  result?: {
    classroomId: string;
    url: string;
    scenesCount: number;
  };
  error?: string;
  providerStatus?: number;
  schoolGeneration?: SchoolGenerationState;
}

function jobFilePath(jobId: string) {
  return path.join(CLASSROOM_JOBS_DIR, `${jobId}.json`);
}

async function persistJob(jobId: string, job: ClassroomGenerationJob) {
  if (usesPersistentClassroomStore()) {
    const { error } = await createSupabaseAdminClient()
      .from('classroom_generation_jobs')
      .update({ job_data: job })
      .eq('id', jobId);
    if (error) throw error;
    return;
  }
  await writeJsonFileAtomic(jobFilePath(jobId), job);
}

function buildInputSummary(input: GenerateClassroomInput): ClassroomGenerationJob['inputSummary'] {
  return {
    requirementPreview:
      input.requirement.length > 200 ? `${input.requirement.slice(0, 197)}...` : input.requirement,
    hasPdf: !!input.pdfContent,
    pdfTextLength: input.pdfContent?.text.length || 0,
    pdfImageCount: input.pdfContent?.images.length || 0,
  };
}

/** Simple per-job mutex to serialize read-modify-write on the same job file. */
const jobLocks = new Map<string, Promise<void>>();

async function withJobLock<T>(jobId: string, fn: () => Promise<T>): Promise<T> {
  const prev = jobLocks.get(jobId) ?? Promise.resolve();
  let resolve: () => void;
  const next = new Promise<void>((r) => {
    resolve = r;
  });
  jobLocks.set(jobId, next);
  try {
    await prev;
    return await fn();
  } finally {
    resolve!();
    if (jobLocks.get(jobId) === next) jobLocks.delete(jobId);
  }
}

/** Max age (ms) before a "running" job without an active runner is considered stale. */
const STALE_JOB_TIMEOUT_MS = 6 * 60 * 1000; // Allow margin after Vercel's 5-minute Hobby limit.

function markStaleIfNeeded(job: ClassroomGenerationJob): ClassroomGenerationJob {
  // Durable School steps recover through their database lease, not a synthetic failure.
  if (job.schoolGeneration) return job;
  if (job.status !== 'running') return job;
  const updatedAt = new Date(job.updatedAt).getTime();
  if (Date.now() - updatedAt > STALE_JOB_TIMEOUT_MS) {
    return {
      ...job,
      status: 'failed',
      step: 'failed',
      message: 'Job appears stale (no progress update for 30 minutes)',
      error: 'Stale job: process may have restarted during generation',
      completedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  return job;
}

export function isValidClassroomJobId(jobId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(jobId);
}

export async function createClassroomGenerationJob(
  jobId: string,
  input: GenerateClassroomInput,
  ownerId?: string,
): Promise<ClassroomGenerationJob> {
  const now = new Date().toISOString();
  const job: ClassroomGenerationJob = {
    id: jobId,
    status: 'queued',
    step: 'queued',
    progress: 0,
    message: 'Classroom generation job queued',
    createdAt: now,
    updatedAt: now,
    inputSummary: buildInputSummary(input),
    scenesGenerated: 0,
    ...(input.resumableSchoolLesson && input.curriculumLessonCache && ownerId
      ? { schoolGeneration: initialSchoolGeneration(ownerId, input) }
      : {}),
  };

  if (usesPersistentClassroomStore()) {
    if (!ownerId) throw new Error('Classroom job owner is required in hosted mode');
    const { error } = await createSupabaseAdminClient().from('classroom_generation_jobs').insert({
      id: jobId,
      owner_id: ownerId,
      job_data: job,
    });
    if (error) throw error;
  } else {
    await ensureClassroomJobsDir();
    await writeJsonFileAtomic(jobFilePath(jobId), job);
  }
  return job;
}

export async function readClassroomGenerationJob(
  jobId: string,
  ownerId?: string,
): Promise<ClassroomGenerationJob | null> {
  try {
    if (usesPersistentClassroomStore()) {
      let query = createSupabaseAdminClient()
        .from('classroom_generation_jobs')
        .select('job_data')
        .eq('id', jobId);
      if (ownerId) query = query.eq('owner_id', ownerId);
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      if (!data) return null;
      return markStaleIfNeeded(data.job_data as ClassroomGenerationJob);
    }
    const content = await fs.readFile(jobFilePath(jobId), 'utf-8');
    const job = JSON.parse(content) as ClassroomGenerationJob;
    if (job.schoolGeneration && job.schoolGeneration.ownerId !== ownerId && ownerId) return null;
    return markStaleIfNeeded(job);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

/** Owner-scoped revision compare-and-swap: polling in two tabs cannot buy two steps. */
export async function compareAndSwapSchoolJob(
  previous: ClassroomGenerationJob,
  next: ClassroomGenerationJob,
  ownerId: string,
): Promise<boolean> {
  const state = previous.schoolGeneration;
  if (!state || state.ownerId !== ownerId || !next.schoolGeneration) return false;
  next.schoolGeneration = { ...next.schoolGeneration, revision: state.revision + 1 };
  next.updatedAt = new Date().toISOString();
  if (usesPersistentClassroomStore()) {
    const { data, error } = await createSupabaseAdminClient()
      .from('classroom_generation_jobs')
      .update({ job_data: next, updated_at: next.updatedAt })
      .eq('id', previous.id)
      .eq('owner_id', ownerId)
      .eq('job_data->schoolGeneration->>revision', String(state.revision))
      .select('id');
    if (error) throw error;
    return !!data?.length;
  }
  return withJobLock(previous.id, async () => {
    const current = await readClassroomGenerationJob(previous.id, ownerId);
    if (current?.schoolGeneration?.revision !== state.revision) return false;
    await persistJob(previous.id, next);
    return true;
  });
}

export async function updateClassroomGenerationJob(
  jobId: string,
  patch: Partial<ClassroomGenerationJob>,
): Promise<ClassroomGenerationJob> {
  return withJobLock(jobId, async () => {
    const existing = await readClassroomGenerationJob(jobId);
    if (!existing) {
      throw new Error(`Classroom generation job not found: ${jobId}`);
    }

    const updated: ClassroomGenerationJob = {
      ...existing,
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    await persistJob(jobId, updated);
    return updated;
  });
}

export async function markClassroomGenerationJobRunning(
  jobId: string,
): Promise<ClassroomGenerationJob> {
  return withJobLock(jobId, async () => {
    const existing = await readClassroomGenerationJob(jobId);
    if (!existing) {
      throw new Error(`Classroom generation job not found: ${jobId}`);
    }

    const updated: ClassroomGenerationJob = {
      ...existing,
      status: 'running',
      startedAt: existing.startedAt || new Date().toISOString(),
      message: 'Classroom generation started',
      updatedAt: new Date().toISOString(),
    };

    await persistJob(jobId, updated);
    return updated;
  });
}

export async function updateClassroomGenerationJobProgress(
  jobId: string,
  progress: ClassroomGenerationProgress,
): Promise<ClassroomGenerationJob> {
  return updateClassroomGenerationJob(jobId, {
    status: 'running',
    step: progress.step,
    progress: progress.progress,
    message: progress.message,
    scenesGenerated: progress.scenesGenerated,
    totalScenes: progress.totalScenes,
  });
}

export async function markClassroomGenerationJobSucceeded(
  jobId: string,
  result: GenerateClassroomResult,
): Promise<ClassroomGenerationJob> {
  return updateClassroomGenerationJob(jobId, {
    status: 'succeeded',
    step: 'completed',
    progress: 100,
    message: 'Classroom generation completed',
    completedAt: new Date().toISOString(),
    scenesGenerated: result.scenesCount,
    result: {
      classroomId: result.id,
      url: result.url,
      scenesCount: result.scenesCount,
    },
  });
}

export async function markClassroomGenerationJobFailed(
  jobId: string,
  error: string,
): Promise<ClassroomGenerationJob> {
  return updateClassroomGenerationJob(jobId, {
    status: 'failed',
    step: 'failed',
    message: 'Classroom generation failed',
    completedAt: new Date().toISOString(),
    error,
  });
}
