import { listTeacherStudentSummaries } from '@/lib/reports/teacher-dashboard';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError('INVALID_REQUEST', 401, 'Authentication required');
    }
    if (user.user_metadata?.role && user.user_metadata.role !== 'teacher') {
      return apiError('INVALID_REQUEST', 403, 'Teacher account required');
    }

    const students = await listTeacherStudentSummaries(user.id);

    return apiSuccess({ students });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load teacher students',
    );
  }
}
