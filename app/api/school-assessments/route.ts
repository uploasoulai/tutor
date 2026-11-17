import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { resolveAccountRole } from '@/lib/auth/account-role';
import { ensureStudentRecord } from '@/lib/auth/ensure-student-record';
import { CHINA_SUBJECTS, getChinaTopics, getChinaQuestions } from '@/lib/china-curriculum/catalog';
import {
  assessmentScope,
  assessmentSubject,
  buildAssessment,
  eligibleAssessmentQuestion,
  gradeAssessment,
  publicAssessmentQuestions,
  type AssessmentConfig,
  type PaperQuestion,
} from '@/lib/curriculum/assessments';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { readablePreparedLesson } from '@/lib/curriculum/prepared-courses';

export const dynamic = 'force-dynamic';
function success(value: Record<string, unknown>) {
  const response = apiSuccess(value);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
function configuration(value: Record<string, unknown>): AssessmentConfig {
  const grade = Number(value.grade ?? 2),
    count = Number(value.count ?? 10),
    subject = String(value.subject ?? 'math');
  const term = String(value.term ?? '上'),
    scope = String(value.scope ?? 'unit');
  if (
    !Number.isInteger(grade) ||
    grade < 1 ||
    grade > 6 ||
    ![5, 10, 15, 20].includes(count) ||
    !CHINA_SUBJECTS[subject] ||
    !['上', '下'].includes(term) ||
    !['unit', 'midterm', 'final'].includes(scope)
  )
    throw new Error('invalid_config');
  return {
    grade,
    count,
    subject,
    term: term as AssessmentConfig['term'],
    scope: scope as AssessmentConfig['scope'],
    ...(typeof value.unit === 'string' ? { unit: value.unit.slice(0, 180) } : {}),
  };
}
function answers(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('invalid_answers');
  const entries = Object.entries(value);
  if (
    entries.length > 20 ||
    entries.some(([id, text]) => id.length > 100 || typeof text !== 'string' || text.length > 1000)
  )
    throw new Error('invalid_answers');
  return Object.fromEntries(entries) as Record<string, string>;
}
const idPattern = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
export async function GET(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, '请先登录');
    const params = request.nextUrl.searchParams,
      db = createSupabaseAdminClient();
    if (params.has('id')) {
      const id = params.get('id')!;
      if (!idPattern.test(id)) return apiError('INVALID_REQUEST', 400, '测验编号不正确');
      const { data, error } = await db
        .from('school_assessments')
        .select('*')
        .eq('id', id)
        .eq('student_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) return apiError('INVALID_REQUEST', 404, '找不到你的这次测验');
      return success({
        id: data.id,
        config: data.config,
        status: data.status,
        questions: publicAssessmentQuestions(data.questions as PaperQuestion[]),
        report: data.report,
        preview: false,
      });
    }
    if (params.get('history') === '1') {
      const { data, error } = await db
        .from('school_assessments')
        .select('id,config,status,report,created_at')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return success({ papers: data ?? [] });
    }
    const config = configuration(Object.fromEntries(params));
    const [topics, bank] = await Promise.all([getChinaTopics(), getChinaQuestions()]);
    const scope = assessmentScope(topics, bank, config),
      eligible = new Set(bank.filter(eligibleAssessmentQuestion).map((q) => q.topicId));
    const subjects = [
      ...new Set(
        topics.filter((t) => t.grade === config.grade && eligible.has(t.id)).map(assessmentSubject),
      ),
    ]
      .filter((s) => CHINA_SUBJECTS[s])
      .map((id) => ({ id, label: CHINA_SUBJECTS[id] }));
    return success({
      units: scope.units,
      selectedUnits: scope.selectedUnits,
      subjects,
      topicCount: scope.topics.length,
      preview: (await resolveAccountRole(user)) !== 'student',
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'invalid_config')
      return apiError('INVALID_REQUEST', 400, '请选择小学年级、学科和测验范围');
    return apiError('INTERNAL_ERROR', 503, '测验服务暂时无法读取，请稍后再试');
  }
}
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await (await createClient()).auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, '请先登录');
    const role = await resolveAccountRole(user),
      body = await request.json(),
      db = createSupabaseAdminClient();
    if (body.action === 'start' || body.action === 'preview-grade') {
      const preparedId = body.preparedLessonId ?? body.config?.preparedLessonId;
      const lesson =
        typeof preparedId === 'string'
          ? await readablePreparedLesson(preparedId, user.id, role === 'admin')
          : null;
      if (preparedId && !lesson) return apiError('INVALID_REQUEST', 404, '这节课暂未开放');
      const config: AssessmentConfig = lesson
        ? {
            grade: lesson.grade,
            subject: 'math',
            term: '上',
            scope: 'unit',
            count: lesson.questions.length,
            unit: lesson.title,
            preparedLessonId: lesson.id,
          }
        : configuration(body.config ?? {});
      const paper = lesson
        ? { questions: lesson.questions, units: [lesson.title] }
        : await (async () => {
            const [topics, bank] = await Promise.all([getChinaTopics(), getChinaQuestions()]);
            return buildAssessment(topics, bank, config);
          })();
      if (body.action === 'preview-grade') {
        if (role === 'student') return apiError('INVALID_REQUEST', 403, '请提交你已开始的测验');
        return success({
          report: gradeAssessment(paper.questions, answers(body.answers)),
          preview: true,
        });
      }
      if (role !== 'student')
        return success({
          questions: publicAssessmentQuestions(paper.questions),
          config: { ...config, units: paper.units },
          preview: true,
        });
      await ensureStudentRecord(user);
      const title = lesson
        ? `二年级数学 · ${lesson.title} · 小岛探索`
        : `${config.grade}年级${CHINA_SUBJECTS[config.subject]} · ${config.scope === 'unit' ? '单元' : config.scope === 'midterm' ? '期中范围' : '期末范围'}小测`;
      const { data: id, error } = await db.rpc('create_school_assessment', {
        p_student_id: user.id,
        p_title: title,
        p_config: { ...config, units: paper.units },
        p_questions: paper.questions,
      });
      if (error) throw error;
      return success({
        id,
        questions: publicAssessmentQuestions(paper.questions),
        config: { ...config, units: paper.units },
        preview: false,
      });
    }
    if (body.action === 'submit') {
      if (role !== 'student')
        return apiError('INVALID_REQUEST', 403, '只有学生账号可以保存测验成绩');
      if (typeof body.id !== 'string' || !idPattern.test(body.id))
        return apiError('INVALID_REQUEST', 400, '测验编号不正确');
      const { data: paper, error } = await db
        .from('school_assessments')
        .select('*')
        .eq('id', body.id)
        .eq('student_id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!paper) return apiError('INVALID_REQUEST', 404, '找不到你的测验');
      if (paper.status === 'completed') return success({ report: paper.report, preview: false });
      const responses = answers(body.answers),
        questions = paper.questions as PaperQuestion[];
      if (Object.keys(responses).some((id) => !questions.some((q) => q.id === id)))
        return apiError('INVALID_REQUEST', 400, '答案与这份试卷不一致');
      const report = gradeAssessment(questions, responses);
      const { data, error: saveError } = await db.rpc('submit_school_assessment', {
        p_student_id: user.id,
        p_id: body.id,
        p_answers: responses,
        p_report: report,
      });
      if (saveError) throw saveError;
      return success({ report: data, preview: false });
    }
    return apiError('INVALID_REQUEST', 400, '请选择开始或提交测验');
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.startsWith('invalid_'))
      return apiError('INVALID_REQUEST', 400, '请选择有效范围，并填写合适长度的答案');
    if (message.includes('暂时没有可自动判分')) return apiError('INVALID_REQUEST', 400, message);
    return apiError('INTERNAL_ERROR', 503, '测验暂时未能保存，请保留页面稍后再试');
  }
}
