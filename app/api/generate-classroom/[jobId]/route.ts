import { after, type NextRequest } from 'next/server';
import { advanceSchoolGeneration } from '@/lib/server/school-generation-runner';
import { canAdvanceSchoolGeneration } from '@/lib/server/school-generation-state';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import {
  isValidClassroomJobId,
  readClassroomGenerationJob,
  compareAndSwapSchoolJob,
} from '@/lib/server/classroom-job-store';
import { buildRequestOrigin } from '@/lib/server/classroom-storage';
import { createLogger } from '@/lib/logger';
import { createClient } from '@/lib/supabase/server';

const log = createLogger('ClassroomJob API');

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/** Explicit retry keeps the same curriculum job and saved artifacts. */
export async function POST(req: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  try {
    const { jobId } = await context.params;
    if (!isValidClassroomJobId(jobId)) return apiError('INVALID_REQUEST', 400, 'Invalid lesson');
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');
    const job = await readClassroomGenerationJob(jobId, user.id);
    if (!job?.schoolGeneration) return apiError('INVALID_REQUEST', 404, 'Lesson not found');
    if (job.status === 'succeeded') return apiSuccess({ jobId, status: job.status });
    if (!canAdvanceSchoolGeneration(job.schoolGeneration)) {
      return apiError('INVALID_REQUEST', 409, '课程正在准备中，或本次重试次数已用完。');
    }
    if (job.status === 'failed') {
      const saved = await compareAndSwapSchoolJob(
        job,
        {
          ...job,
          status: 'queued',
          error: undefined,
          message: '保留已有内容，从未完成的环节继续…',
        },
        user.id,
      );
      if (!saved) return apiError('INVALID_REQUEST', 409, '课程状态已更新，请刷新后继续。');
    }
    after(() => advanceSchoolGeneration(jobId, user.id, buildRequestOrigin(req)));
    return apiSuccess({ jobId, status: 'queued' }, 202);
  } catch {
    return apiError('INTERNAL_ERROR', 500, '暂时无法继续准备课程，请稍后重试。已有内容仍保留。');
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ jobId: string }> }) {
  let resolvedJobId: string | undefined;
  try {
    const { jobId } = await context.params;
    resolvedJobId = jobId;

    if (!isValidClassroomJobId(jobId)) {
      return apiError('INVALID_REQUEST', 400, 'Invalid classroom generation job id');
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');

    const job = await readClassroomGenerationJob(jobId, user.id);
    if (!job) {
      return apiError('INVALID_REQUEST', 404, 'Classroom generation job not found');
    }
    if (job.schoolGeneration && job.status !== 'succeeded' && job.status !== 'failed') {
      after(() => advanceSchoolGeneration(job.id, user.id, buildRequestOrigin(req)));
    }

    const pollUrl = `${buildRequestOrigin(req)}/api/generate-classroom/${jobId}`;

    return apiSuccess({
      jobId: job.id,
      resumable: !!job.schoolGeneration && canAdvanceSchoolGeneration(job.schoolGeneration),
      status: job.status,
      step: job.step,
      progress: job.progress,
      message: job.message,
      pollUrl,
      pollIntervalMs: 5000,
      scenesGenerated: job.scenesGenerated,
      totalScenes: job.totalScenes,
      result: job.result,
      error: job.error,
      done: job.status === 'succeeded' || job.status === 'failed',
    });
  } catch (error) {
    log.error(`Classroom job retrieval failed [jobId=${resolvedJobId ?? 'unknown'}]:`, error);
    return apiError(
      'INTERNAL_ERROR',
      500,
      'Failed to retrieve classroom generation job',
      error instanceof Error ? error.message : String(error),
    );
  }
}
