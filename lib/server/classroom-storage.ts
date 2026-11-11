import { promises as fs } from 'fs';
import path from 'path';
import type { NextRequest } from 'next/server';
import type { Scene, Stage } from '@/lib/types/stage';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  readCachedClassroomById,
  saveCurriculumLessonArtifact,
  type CurriculumLessonCacheDescriptor,
} from '@/lib/server/curriculum-lesson-cache';
import { createLogger } from '@/lib/logger';

const log = createLogger('ClassroomStorage');

export const CLASSROOMS_DIR = path.join(process.cwd(), 'data', 'classrooms');
export const CLASSROOM_JOBS_DIR = path.join(process.cwd(), 'data', 'classroom-jobs');

export function usesPersistentClassroomStore(): boolean {
  return (
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    Boolean(process.env.VERCEL_URL)
  );
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function ensureClassroomsDir() {
  await ensureDir(CLASSROOMS_DIR);
}

export async function ensureClassroomJobsDir() {
  await ensureDir(CLASSROOM_JOBS_DIR);
}

export async function writeJsonFileAtomic(filePath: string, data: unknown) {
  const dir = path.dirname(filePath);
  await ensureDir(dir);

  const tempFilePath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  const content = JSON.stringify(data, null, 2);
  await fs.writeFile(tempFilePath, content, 'utf-8');
  await fs.rename(tempFilePath, filePath);
}

export function buildRequestOrigin(req: NextRequest): string {
  return req.headers.get('x-forwarded-host')
    ? `${req.headers.get('x-forwarded-proto') || 'http'}://${req.headers.get('x-forwarded-host')}`
    : req.nextUrl.origin;
}

export interface PersistedClassroomData {
  id: string;
  stage: Stage;
  scenes: Scene[];
  createdAt: string;
}

export function isValidClassroomId(id: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(id);
}

export async function readClassroom(
  id: string,
  ownerId: string,
): Promise<PersistedClassroomData | null> {
  if (!ownerId || !isValidClassroomId(id)) return null;
  if (usesPersistentClassroomStore()) {
    const { data, error } = await createSupabaseAdminClient()
      .from('generated_classrooms')
      .select('classroom_data,owner_id')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    const classroom = (data?.classroom_data as PersistedClassroomData | undefined) ?? null;
    if (data) return data.owner_id === ownerId ? classroom : null;
    return readCachedClassroomById(id);
  }
  const filePath = path.join(CLASSROOMS_DIR, `${id}.json`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const stored = JSON.parse(content) as PersistedClassroomData & { ownerId?: string };
    if (stored.ownerId !== ownerId) return null;
    const { ownerId: _ownerId, ...classroom } = stored;
    return classroom;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

export async function persistClassroom(
  data: {
    id: string;
    stage: Stage;
    scenes: Scene[];
  },
  baseUrl: string,
  ownerId?: string,
  cacheDescriptor?: CurriculumLessonCacheDescriptor,
): Promise<PersistedClassroomData & { url: string }> {
  if (!isValidClassroomId(data.id)) throw new Error('Invalid classroom id');
  const classroomData: PersistedClassroomData = {
    id: data.id,
    stage: data.stage,
    scenes: data.scenes,
    createdAt: new Date().toISOString(),
  };

  if (usesPersistentClassroomStore()) {
    if (!ownerId) throw new Error('Classroom owner is required in hosted mode');
    let savedToCurriculumStore = false;
    if (cacheDescriptor) {
      try {
        savedToCurriculumStore = await saveCurriculumLessonArtifact(cacheDescriptor, classroomData);
      } catch (cacheError) {
        log.warn(
          'Could not save reusable curriculum lesson; falling back to learner classroom storage:',
          cacheError,
        );
      }
    }
    if (!savedToCurriculumStore) {
      const admin = createSupabaseAdminClient();
      const { data: existing, error: lookupError } = await admin
        .from('generated_classrooms')
        .select('owner_id')
        .eq('id', data.id)
        .maybeSingle();
      if (lookupError) throw lookupError;
      if (existing && existing.owner_id !== ownerId) throw new Error('Classroom is unavailable');
      // An insert collision fails atomically; updates remain constrained to this owner.
      const table = admin.from('generated_classrooms');
      const { error } = existing
        ? await table
            .update({ classroom_data: classroomData })
            .eq('id', data.id)
            .eq('owner_id', ownerId)
        : await table.insert({ id: data.id, owner_id: ownerId, classroom_data: classroomData });
      if (error) throw error;
    }
  } else {
    await ensureClassroomsDir();
    const filePath = path.join(CLASSROOMS_DIR, `${data.id}.json`);
    try {
      const existing = JSON.parse(await fs.readFile(filePath, 'utf-8')) as { ownerId?: string };
      if (!ownerId || existing.ownerId !== ownerId) throw new Error('Classroom is unavailable');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    await writeJsonFileAtomic(filePath, { ...classroomData, ownerId });
  }

  return {
    ...classroomData,
    url: `${baseUrl}/classroom/${data.id}`,
  };
}
