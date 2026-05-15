import { listRelationshipDirectory } from '@/lib/admin/relationship-directory';
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

    const directory = await listRelationshipDirectory();

    return apiSuccess({ directory });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load relationship directory',
    );
  }
}
