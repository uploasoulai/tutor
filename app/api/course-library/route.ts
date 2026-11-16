import { type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { assertAdminUser, AdminAuthError } from '@/lib/admin/auth';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import {
  canReadLibraryCourse,
  LIBRARY_FEEDBACK,
  libraryCourse,
  listLibraryCourses,
  publicLibraryCourse,
} from '@/lib/server/course-library';

export const dynamic = 'force-dynamic';
function success(value: Record<string, unknown>) {
  const response = apiSuccess(value);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, '请先登录');
    const params = request.nextUrl.searchParams;
    const admin = params.get('admin') === '1';
    if (admin) await assertAdminUser(user);
    const id = params.get('id');
    if (id) {
      const course = await libraryCourse(id);
      if (!course.available || !course.row || !canReadLibraryCourse(course.row, user.id, admin))
        return apiError('INVALID_REQUEST', 404, '课程不在可访问的课程库中');
      const { data: feedback, error } = await createSupabaseAdminClient()
        .from('course_library_feedback')
        .select('kind,recommend')
        .eq('classroom_id', id)
        .eq('user_id', user.id)
        .maybeSingle();
      if (error) throw error;
      return success({ course: publicLibraryCourse(course.row), feedback });
    }
    return success(
      await listLibraryCourses(user.id, {
        admin,
        mine: params.get('mine') === '1',
        trials: params.get('trials') === '1',
        track: params.get('track') ?? undefined,
      }),
    );
  } catch (error) {
    if (error instanceof AdminAuthError)
      return apiError('INVALID_REQUEST', error.status, error.message);
    return apiError('INTERNAL_ERROR', 503, '课程库暂时无法读取，请稍后再试');
  }
}
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, '请先登录');
    const body = await request.json();
    if (typeof body.courseId !== 'string' || !/^[\w-]{1,120}$/.test(body.courseId))
      return apiError('INVALID_REQUEST', 400, '课程编号不正确');
    const db = createSupabaseAdminClient();
    if (body.action === 'review') {
      await assertAdminUser(user);
      if (!['testing', 'recommended', 'retired'].includes(body.status))
        return apiError('INVALID_REQUEST', 400, '审核状态不正确');
      const checklist = {
        accurate: body.checklist?.accurate === true,
        ageAppropriate: body.checklist?.ageAppropriate === true,
        works: body.checklist?.works === true,
      };
      if (body.status === 'recommended' && !Object.values(checklist).every(Boolean))
        return apiError('INVALID_REQUEST', 400, '请先确认内容、年级适配和操作检查');
      const { error } = await db.rpc('review_course_library_candidate', {
        p_classroom_id: body.courseId,
        p_status: body.status,
        p_reviewer: user.id,
        p_checklist: checklist,
      });
      if (error) throw error;
    } else if (body.action === 'feedback') {
      if (
        (body.kind !== undefined && !LIBRARY_FEEDBACK.includes(body.kind)) ||
        (body.recommend !== undefined && typeof body.recommend !== 'boolean') ||
        (body.kind === undefined && body.recommend === undefined)
      )
        return apiError('INVALID_REQUEST', 400, '请选择一种反馈');
      const course = await libraryCourse(body.courseId);
      if (!course.row || !canReadLibraryCourse(course.row, user.id))
        return apiError('INVALID_REQUEST', 404, '课程不可用');
      const { error } = await db.rpc('record_course_library_feedback', {
        p_classroom_id: body.courseId,
        p_user_id: user.id,
        p_kind: body.kind ?? null,
        p_recommend: body.recommend ?? null,
      });
      if (error) throw error;
    } else return apiError('INVALID_REQUEST', 400, '操作不正确');
    return apiSuccess({ saved: true });
  } catch (error) {
    if (error instanceof AdminAuthError)
      return apiError('INVALID_REQUEST', error.status, error.message);
    return apiError('INTERNAL_ERROR', 503, '暂时未能保存，请稍后再试');
  }
}
