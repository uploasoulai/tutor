import { NextRequest } from 'next/server';
import { syncLessonOpenMAICJob } from '@/lib/curriculum/lesson-artifact';
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

    const body = (await req.json()) as { sessionId?: string };
    if (!body.sessionId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'sessionId is required');
    }

    const result = await syncLessonOpenMAICJob({
      studentId: user.id,
      sessionId: body.sessionId,
    });

    return apiSuccess(result);
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to sync OpenMAIC lesson job',
    );
  }
}
