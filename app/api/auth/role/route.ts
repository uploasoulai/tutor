import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
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

    const metadataRole = user.user_metadata?.role;
    if (typeof metadataRole === 'string' && metadataRole) {
      return apiSuccess({ role: metadataRole });
    }

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return apiSuccess({ role: data?.role ?? 'student' });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load account role',
    );
  }
}
