import { buildKeepaliveStatusView } from '@/lib/ops/keepalive-status';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import { pingSupabase } from '@/lib/supabase/keepalive';
import { AdminAuthError, assertAdminUser } from '@/lib/admin/auth';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await assertAdminUser(user);

    const result = buildKeepaliveStatusView(await pingSupabase());

    return apiSuccess({ result });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return apiError('INVALID_REQUEST', error.status, error.message);
    }

    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Supabase keepalive failed',
    );
  }
}
