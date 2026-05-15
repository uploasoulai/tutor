import { hasAccountRole } from '@/lib/auth/account-role';
import { listParentLinkedStudents } from '@/lib/reports/parent-students';
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
    if (!(await hasAccountRole(user, 'parent'))) {
      return apiError('INVALID_REQUEST', 403, 'Parent account required');
    }

    const students = await listParentLinkedStudents(user.id);

    return apiSuccess({ students });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load linked students',
    );
  }
}
