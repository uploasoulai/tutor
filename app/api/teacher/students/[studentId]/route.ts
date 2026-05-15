import { getTeacherStudentDetail } from '@/lib/reports/teacher-dashboard';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import { hasAccountRole } from '@/lib/auth/account-role';

export async function GET(_req: Request, { params }: { params: Promise<{ studentId: string }> }) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { studentId } = await params;

    if (!user) {
      return apiError('INVALID_REQUEST', 401, 'Authentication required');
    }
    if (!(await hasAccountRole(user, 'teacher'))) {
      return apiError('INVALID_REQUEST', 403, 'Teacher account required');
    }
    if (!studentId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'studentId is required');
    }

    const student = await getTeacherStudentDetail({ teacherId: user.id, studentId });

    if (!student) {
      return apiError('INVALID_REQUEST', 404, 'Student not found for this teacher');
    }

    return apiSuccess({ student });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load teacher student detail',
    );
  }
}
