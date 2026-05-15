import { NextRequest } from 'next/server';
import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import { buildFallbackTodayPlan, getTodayPlan } from '@/lib/curriculum/today-plan';
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
      grade?: string;
      subject?: string;
    };
    const grade = body.grade ?? user.user_metadata?.grade ?? DEFAULT_GRADE_LABEL;
    const subject = body.subject ?? user.user_metadata?.subjects?.[0] ?? DEFAULT_SUBJECT;

    try {
      const plan = await getTodayPlan({
        studentId: user.id,
        grade,
        subject,
      });

      return apiSuccess(plan);
    } catch {
      return apiSuccess(buildFallbackTodayPlan({ studentId: user.id, grade, subject }));
    }
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to build today plan',
    );
  }
}
