import { buildKeepaliveStatusView } from '@/lib/ops/keepalive-status';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import { pingSupabase } from '@/lib/supabase/keepalive';

export async function POST() {
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

    const result = buildKeepaliveStatusView(await pingSupabase());

    return apiSuccess({ result });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Supabase keepalive failed',
    );
  }
}
