import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { isAuthorizedKeepaliveRequest, pingSupabase } from '@/lib/supabase/keepalive';

export async function GET(req: NextRequest) {
  if (!isAuthorizedKeepaliveRequest(req.headers.get('authorization'))) {
    return apiError('INVALID_REQUEST', 401, 'Unauthorized');
  }

  try {
    const result = await pingSupabase();
    return apiSuccess(result);
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Supabase keepalive failed',
    );
  }
}
