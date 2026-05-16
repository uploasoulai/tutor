import { NextRequest } from 'next/server';
import { recordLessonAttempt } from '@/lib/curriculum/lesson-progress';
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
      outcomeId?: string | null;
      isCorrect?: boolean;
      attemptNumber?: number;
      correctCount?: number;
      responseLatencyMs?: number;
      hintLevelUsed?: number;
      activity?: {
        type?: 'quiz' | 'widget';
        index?: number;
        id?: string;
        value?: string | number | boolean | null;
      };
    };

    if (!body.sessionId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'sessionId is required');
    }

    if (typeof body.isCorrect !== 'boolean') {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'isCorrect is required');
    }

    const result = await recordLessonAttempt({
      studentId: user.id,
      sessionId: body.sessionId,
      outcomeId: body.outcomeId,
      isCorrect: body.isCorrect,
      attemptNumber: body.attemptNumber ?? 1,
      correctCount: body.correctCount ?? (body.isCorrect ? 1 : 0),
      responseLatencyMs: body.responseLatencyMs,
      hintLevelUsed: body.hintLevelUsed,
      activity: parseActivityProgress(body.activity),
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to record lesson attempt',
    );
  }
}

function parseActivityProgress(
  activity:
    | {
        type?: 'quiz' | 'widget';
        index?: number;
        id?: string;
        value?: string | number | boolean | null;
      }
    | undefined,
) {
  if (!activity) return undefined;
  if (activity.type !== 'quiz' && activity.type !== 'widget') return undefined;
  if (typeof activity.index !== 'number' || !Number.isInteger(activity.index)) return undefined;
  if (typeof activity.id !== 'string' || !activity.id) return undefined;

  return {
    type: activity.type,
    index: activity.index,
    id: activity.id,
    value: activity.value,
  };
}
