import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasAccountRole } from '@/lib/auth/account-role';
import {
  preparedCatalog,
  readablePreparedLesson,
  publicPreparedLesson,
} from '@/lib/curriculum/prepared-courses';
import { apiError, apiSuccess } from '@/lib/server/api-response';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, '请先登录');
    const review =
      request.nextUrl.searchParams.get('review') === '1' && (await hasAccountRole(user, 'admin'));
    const id = request.nextUrl.searchParams.get('id');
    const candidates = id ? [{ id }] : (await preparedCatalog()).lessons;
    const lessons = (
      await Promise.all(candidates.map((l) => readablePreparedLesson(l.id, user.id, review)))
    )
      .filter((l) => l !== null)
      .map(publicPreparedLesson);
    if (id && !lessons.length) return apiError('INVALID_REQUEST', 404, '这节课暂未开放');
    const response = apiSuccess({ lessons });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch {
    return apiError('INTERNAL_ERROR', 503, '课程正在准备中，请稍后再试');
  }
}
