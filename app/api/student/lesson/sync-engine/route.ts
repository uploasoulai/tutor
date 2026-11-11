import { after, NextRequest } from 'next/server';
import { advanceSchoolGeneration } from '@/lib/server/school-generation-runner';
import { buildRequestOrigin } from '@/lib/server/classroom-storage';
import { syncLessonEngineJob } from '@/lib/curriculum/lesson-artifact';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError('INVALID_REQUEST', 401, 'Authentication required');
    }

    const body = (await req.json()) as { sessionId?: string };
    if (!body.sessionId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'sessionId is required');
    }

    const result = await syncLessonEngineJob({
      studentId: user.id,
      sessionId: body.sessionId,
    });

    const engine = result.payload.lessonEngine;
    if (engine && engine.status !== 'failed' && engine.status !== 'succeeded') {
      after(() => advanceSchoolGeneration(engine.jobId, user.id, buildRequestOrigin(req)));
    }
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to sync lesson generation job',
    );
  }
}
