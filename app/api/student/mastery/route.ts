import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import {
  buildFallbackMasteryOverview,
  getStudentMasteryOverview,
} from '@/lib/curriculum/mastery-overview';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError('INVALID_REQUEST', 401, 'Authentication required');
    }

    const body = (await req.json().catch(() => ({}))) as {
      grade?: string;
      subject?: string;
    };
    const grade = body.grade ?? user.user_metadata?.grade ?? DEFAULT_GRADE_LABEL;
    const subject = body.subject ?? user.user_metadata?.subjects?.[0] ?? DEFAULT_SUBJECT;

    try {
      return apiSuccess({
        overview: await getStudentMasteryOverview({ studentId: user.id, grade, subject }),
      });
    } catch {
      return apiSuccess({ overview: buildFallbackMasteryOverview({ grade, subject }) });
    }
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load mastery overview',
    );
  }
}
