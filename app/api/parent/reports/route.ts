import { listParentReportHistory } from '@/lib/reports/parent-daily-report';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import { hasAccountRole } from '@/lib/auth/account-role';

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

    const reports = await listParentReportHistory({ parentId: user.id });

    return apiSuccess({ reports });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load parent reports',
    );
  }
}
