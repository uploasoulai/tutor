import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import {
  isSupportedTutorAlertAction,
  listTeacherTutorAlerts,
  resolveTeacherTutorAlert,
} from '@/lib/reports/tutor-alerts';

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

    const alerts = await listTeacherTutorAlerts(user.id);

    return apiSuccess({ alerts });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load tutor alerts',
    );
  }
}

export async function PATCH(req: Request) {
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

    const body = (await req.json()) as { alertId?: string; action?: string };
    if (!body.alertId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'alertId is required');
    }
    if (!isSupportedTutorAlertAction(body.action)) {
      return apiError('INVALID_REQUEST', 400, 'Unsupported alert action');
    }

    const result = await resolveTeacherTutorAlert({
      teacherId: user.id,
      alertId: body.alertId,
    });

    if (!result.resolved) {
      return apiError('INVALID_REQUEST', 404, 'Alert not found or already resolved');
    }

    return apiSuccess(result);
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to resolve tutor alert',
    );
  }
}
