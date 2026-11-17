import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { hasAccountRole, resolveAccountRole } from '@/lib/auth/account-role';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  preparedCatalog,
  readablePreparedLesson,
  validMediaBinding,
} from '@/lib/curriculum/prepared-courses';
import { readR2CourseAsset, mediaResponse } from '@/lib/server/r2-course-media';
export const dynamic = 'force-dynamic';
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ lessonId: string; assetId: string }> },
) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (!user) return new Response('请先登录', { status: 401 });
    const { lessonId, assetId } = await params;
    const review =
      request.nextUrl.searchParams.get('review') === '1' && (await hasAccountRole(user, 'admin'));
    const lesson = await readablePreparedLesson(lessonId, user.id, review);
    if (!lesson) return new Response('资源不可用', { status: 404 });
    const bindings = validMediaBinding(lesson, assetId);
    if (!bindings.length) return new Response('资源不可用', { status: 404 });
    if (
      bindings.every((b) => b.purpose === 'explanation') &&
      (await resolveAccountRole(user)) === 'student'
    ) {
      const paperId = request.nextUrl.searchParams.get('paperId');
      if (!paperId) return new Response('请先完成自己的尝试', { status: 403 });
      const { data, error } = await createSupabaseAdminClient()
        .from('school_assessments')
        .select('config,status')
        .eq('id', paperId)
        .eq('student_id', user.id)
        .maybeSingle();
      if (error || data?.status !== 'completed' || data.config?.preparedLessonId !== lesson.id)
        return new Response('请先完成自己的尝试', { status: 403 });
    }
    const asset = (await preparedCatalog()).assets.find((a) => a.id === assetId);
    if (!asset) return new Response('资源不可用', { status: 404 });
    return mediaResponse(await readR2CourseAsset(asset), request.headers.get('range'));
  } catch {
    return new Response('音频暂时无法播放，请继续阅读文字。', {
      status: 503,
      headers: { 'Cache-Control': 'private, no-store' },
    });
  }
}
