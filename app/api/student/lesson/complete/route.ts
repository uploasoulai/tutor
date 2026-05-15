import { NextRequest } from 'next/server';
import { completeLessonSession } from '@/lib/curriculum/lesson-progress';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError('INVALID_REQUEST', 401, 'Authentication required');
    }

    const body = (await req.json()) as {
      sessionId?: string;
      xpEarned?: number;
      correctCount?: number;
      attempts?: number;
      durationSeconds?: number;
      reason?: string;
    };

    if (!body.sessionId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'sessionId is required');
    }

    const result = await completeLessonSession({
      studentId: user.id,
      sessionId: body.sessionId,
      xpEarned: body.xpEarned ?? 0,
      correctCount: body.correctCount ?? 0,
      attempts: body.attempts ?? 1,
      durationSeconds: body.durationSeconds,
      reason: body.reason ?? 'Completed lesson',
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to complete lesson',
    );
  }
}
