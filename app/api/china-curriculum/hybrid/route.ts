import { NextRequest } from 'next/server';
import { randomUUID } from 'node:crypto';
import { resolveAccountRole } from '@/lib/auth/account-role';
import { ensureStudentRecord } from '@/lib/auth/ensure-student-record';
import {
  FRACTIONS_HYBRID,
  HYBRID_PHASES,
  hasHybridAssessment,
} from '@/lib/curriculum/hybrid-fractions';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
async function learner() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) return null;
  return (await resolveAccountRole(user)) === 'student' ? user : null;
}
async function readSession(id: string, learnerId: string) {
  const { data, error } = await createSupabaseAdminClient()
    .from('learning_sessions')
    .select('id,status,lesson_payload')
    .eq('id', id)
    .eq('student_id', learnerId)
    .maybeSingle();
  if (error) throw error;
  return data?.lesson_payload?.hybridLessonId === FRACTIONS_HYBRID.id ? data : null;
}
async function correctQuestions(id: string, learnerId: string) {
  const { data, error } = await createSupabaseAdminClient()
    .from('student_curriculum_attempts')
    .select('question_id')
    .eq('student_id', learnerId)
    .eq('learning_session_id', id)
    .eq('curriculum_track', 'china')
    .eq('topic_id', FRACTIONS_HYBRID.topicId)
    .eq('is_correct', true);
  if (error) throw error;
  return [...new Set((data ?? []).map((row) => String(row.question_id)))];
}
export async function GET(request: NextRequest) {
  try {
    const user = await learner();
    if (!user) return apiError('INVALID_REQUEST', 401, '请先使用学生账号登录');
    const id = request.nextUrl.searchParams.get('sessionId') ?? '';
    if (!UUID.test(id)) return apiError('INVALID_REQUEST', 400, '学习记录编号无效');
    const session = await readSession(id, user.id);
    if (!session) return apiError('INVALID_REQUEST', 404, '找不到这次学习记录');
    const response = apiSuccess({
      sessionId: id,
      phase:
        session.status === 'completed'
          ? 'completed'
          : (session.lesson_payload.hybridPhase ?? 'video'),
      correctQuestionIds: await correctQuestions(id, user.id),
    });
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch {
    return apiError('INTERNAL_ERROR', 503, '暂时无法读取学习进度，请重试');
  }
}
export async function POST(request: NextRequest) {
  try {
    const user = await learner();
    if (!user) return apiError('INVALID_REQUEST', 401, '请先使用学生账号登录');
    const body = (await request.json()) as { action?: string; sessionId?: string; phase?: string };
    const id = body.sessionId ?? randomUUID();
    if (!UUID.test(id)) return apiError('INVALID_REQUEST', 400, '学习记录编号无效');
    const session = await readSession(id, user.id);
    const admin = createSupabaseAdminClient();
    if (body.action === 'start') {
      if (session) return apiSuccess({ sessionId: id });
      await ensureStudentRecord(user);
      const { error } = await admin.from('learning_sessions').insert({
        id,
        student_id: user.id,
        session_type: 'lesson',
        lesson_title: FRACTIONS_HYBRID.title,
        coastaltutor_lesson_id: FRACTIONS_HYBRID.id,
        bc_outcome_ids: [],
        status: 'started',
        lesson_payload: {
          curriculumTrack: 'china',
          curriculumTopicId: FRACTIONS_HYBRID.topicId,
          curriculumGrade: 3,
          curriculumSubject: 'math',
          hybridLessonId: FRACTIONS_HYBRID.id,
          hybridPhase: 'video',
          primaryRenderer: 'hybrid-reviewed-pilot',
        },
      });
      if (error) {
        if (error.code === '23505' && (await readSession(id, user.id)))
          return apiSuccess({ sessionId: id });
        throw error;
      }
      return apiSuccess({ sessionId: id }, 201);
    }
    if (!session) return apiError('INVALID_REQUEST', 404, '找不到这次学习记录');
    if (session.status === 'completed') return apiSuccess({ phase: 'completed' });
    const phase = body.action === 'complete' ? 'completed' : body.phase;
    if (body.action !== 'complete' && body.action !== 'checkpoint')
      return apiError('INVALID_REQUEST', 400, '学习操作无效');
    if (!phase || !HYBRID_PHASES.some((item) => item === phase))
      return apiError('INVALID_REQUEST', 400, '学习步骤无效');
    const verifiedQuestions = phase === 'completed' ? await correctQuestions(id, user.id) : [];
    if (phase === 'completed' && !hasHybridAssessment(verifiedQuestions))
      return apiError('INVALID_REQUEST', 409, '请先完成两道理解检查，再结束这节课');
    const savedPhase = session.lesson_payload.hybridPhase;
    if (HYBRID_PHASES.indexOf(savedPhase) > HYBRID_PHASES.findIndex((item) => item === phase)) {
      return apiSuccess({ sessionId: id, phase: savedPhase });
    }
    const { error } = await admin
      .from('learning_sessions')
      .update({
        ...(phase === 'completed'
          ? { status: 'completed', ended_at: new Date().toISOString() }
          : {}),
        lesson_payload: {
          ...session.lesson_payload,
          hybridPhase: phase,
          ...(phase === 'completed'
            ? {
                hybridAssessmentQuestionIds: FRACTIONS_HYBRID.questionIds.filter((id) =>
                  verifiedQuestions.includes(id),
                ),
              }
            : {}),
        },
      })
      .eq('id', id)
      .eq('student_id', user.id)
      .neq('status', 'completed');
    if (error) throw error;
    return apiSuccess({ sessionId: id, phase });
  } catch {
    return apiError('INTERNAL_ERROR', 503, '学习进度暂时未保存，请重试');
  }
}
