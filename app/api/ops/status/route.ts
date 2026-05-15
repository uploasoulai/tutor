import { getRuntimeStatus } from '@/lib/ops/runtime-status';
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
    if (user.user_metadata?.role !== 'admin') {
      return apiError('INVALID_REQUEST', 403, 'Admin account required');
    }

    return apiSuccess({ status: getRuntimeStatus() });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load runtime status',
    );
  }
}
