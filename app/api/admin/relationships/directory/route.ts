import { listRelationshipDirectory } from '@/lib/admin/relationship-directory';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import { AdminAuthError, assertAdminUser } from '@/lib/admin/auth';

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await assertAdminUser(user);

    const directory = await listRelationshipDirectory();

    return apiSuccess({ directory });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return apiError('INVALID_REQUEST', error.status, error.message);
    }

    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to load relationship directory',
    );
  }
}
