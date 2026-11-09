import { after, NextRequest } from 'next/server';
import { nanoid } from 'nanoid';

import { resolveAccountRole } from '@/lib/auth/account-role';
import { ensureStudentRecord } from '@/lib/auth/ensure-student-record';
import { assertPlatformAiWithinLimit } from '@/lib/server/platform-ai-usage';
import {
  CHINA_SUBJECTS,
  chinaGradeLabel,
  getChinaTopicDetails,
} from '@/lib/china-curriculum/catalog';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { type GenerateClassroomInput } from '@/lib/server/classroom-generation';
import { runClassroomGenerationJob } from '@/lib/server/classroom-job-runner';
import { createClassroomGenerationJob } from '@/lib/server/classroom-job-store';
import { markClassroomGenerationJobSucceeded } from '@/lib/server/classroom-job-store';
import { buildRequestOrigin } from '@/lib/server/classroom-storage';
import {
  describeCurriculumLesson,
  findCurriculumLessonArtifact,
} from '@/lib/server/curriculum-lesson-cache';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { randomUUID } from 'node:crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function makeClassroomRequirement(
  details: NonNullable<Awaited<ReturnType<typeof getChinaTopicDetails>>>,
) {
  const { topic, subject, prerequisites, standards, textbook } = details;
  const grade = chinaGradeLabel(topic.grade, subject);
  const standardLines = standards
    .map((standard) => {
      const record = standard.detail as { text?: string } | null;
      return record?.text ? `- ${record.text}` : `- ${standard.id}`;
    })
    .join('\n');
  const questionLines = details.questions
    .filter((question) => question.type !== 'self')
    .slice(0, 3)
    .map(
      (question, index) =>
        `${index + 1}. ${question.prompt}\n   参考答案（仅供课堂设计校准，不能在学生思考前直接展示）：${question.answer}`,
    )
    .join('\n');
  const prerequisiteLines = prerequisites
    .map(
      (edge) => `- ${edge.topic?.name ?? edge.prerequisiteId} (${edge.strength}): ${edge.reason}`,
    )
    .join('\n');

  return `请为 CoastalTutor 的中国课程学习制作一堂虚拟互动课，共 3 个课堂场景。

学习者：${grade} 学生
学科：${CHINA_SUBJECTS[subject] ?? subject}
教材章节：${topic.chapter}
教材路线：${textbook.label}${textbook.status === 'draft' ? '（当前为草案目录映射）' : ''}
本课知识点：${topic.name}
知识点说明：${topic.description}
掌握目标：\n${topic.mastery_criteria.map((item) => `- ${item}`).join('\n')}
课标依据：\n${standardLines || '按以上知识点和年级组织教学，不要臆造标准原文。'}
图谱前置知识：\n${prerequisiteLines || topic.root_reason || '无更早的图谱前置节点。'}
题库参考：\n${questionLines || '根据知识点掌握目标创作新练习。'}

教学要求：
- 三个场景依次承担：生活化引入与直观讲解；一个可操作的互动练习；检查理解、纠错提示与回顾。不要额外扩展成更多场景。
- 先用小问题引导学生思考，不要一开始直接给最终答案；答错时指出可能卡住的步骤，再用更小的例子提示。
- 适配 ${grade} 儿童的中文表达与注意力时长，句子短、一次只讲一个新概念。
- 使用浏览器可运行的 SVG、HTML、CSS 或 Canvas 做图表、卡片、数轴、几何或其他适合本知识点的交互演示。
- 如果要求学生点击、拖动、连线、摆放物品或操作模拟器，必须在该场景里实际生成可见、可操作的控件；没有对应控件时，改写为口头思考或选择题，不得只在讲解文字里声称“拖动/点击”。
- 至少安排两次学生主动操作或作答，并在答错时给温和、具体的反馈。
- 课堂内容必须围绕本课知识点和列出的掌握目标；可以复习前置知识，不要跳到更高年级内容。
- 不调用图片、视频、语音等额外付费生成服务；优先使用浏览器原生图形和文字。
- 结束时给出一个简短退出题和下一步建议。

请输出可直接给学生使用的互动课堂，不要向教师解释生成过程。`;
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID();
  let failedStage = 'authentication';
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');
    failedStage = 'learner_access';
    if ((await resolveAccountRole(user)) !== 'student') {
      return apiError('INVALID_REQUEST', 403, 'Only a learner can start this lesson');
    }
    failedStage = 'request_validation';
    const body = (await request.json()) as {
      topicId?: string;
      editionId?: string;
      forceRegenerate?: boolean;
    };
    if (!body.topicId) return apiError('MISSING_REQUIRED_FIELD', 400, 'topicId is required');
    const details = await getChinaTopicDetails(
      body.topicId,
      body.editionId === 'pep' ? null : body.editionId,
    );
    if (!details) return apiError('INVALID_REQUEST', 404, 'Learning topic not found');

    const requirement = makeClassroomRequirement(details);
    const curriculumLessonCache = describeCurriculumLesson({
      track: 'china',
      canonicalId: `${details.textbook.id}:${details.topic.id}`,
      requirement,
    });
    const input: GenerateClassroomInput = {
      requirement,
      curriculumLessonCache,
      maxScenes: 3,
      // Keep one concise built-in interaction, while bounding each model response.
      maxInteractiveScenes: 1,
      maxOutputTokens: 4096,
      agentMode: 'default',
      enableWebSearch: false,
      enableImageGeneration: false,
      enableVideoGeneration: false,
      enableTTS: false,
    };
    const origin = buildRequestOrigin(request);
    const jobId = nanoid(12);
    failedStage = 'learner_profile_storage';
    await ensureStudentRecord(user);

    failedStage = 'curriculum_lesson_cache';
    const reusableLesson = body.forceRegenerate
      ? null
      : await findCurriculumLessonArtifact(curriculumLessonCache.cacheKey);
    if (!reusableLesson) {
      failedStage = 'platform_ai_check';
      await assertPlatformAiWithinLimit(user.id);
    }

    failedStage = 'classroom_job_storage';
    const job = await createClassroomGenerationJob(jobId, input, user.id);
    const classroomUrl = reusableLesson ? `${origin}/classroom/${reusableLesson.id}` : undefined;
    if (reusableLesson && classroomUrl) {
      await markClassroomGenerationJobSucceeded(jobId, {
        id: reusableLesson.id,
        url: classroomUrl,
        stage: reusableLesson.stage,
        scenes: reusableLesson.scenes,
        scenesCount: reusableLesson.scenes.length,
        createdAt: reusableLesson.createdAt,
      });
    }

    failedStage = 'learning_history_storage';
    const admin = createSupabaseAdminClient();
    const { data: session, error } = await admin
      .from('learning_sessions')
      .insert({
        student_id: user.id,
        session_type: 'lesson',
        coastaltutor_lesson_id: jobId,
        bc_outcome_ids: [],
        lesson_title: details.topic.name,
        lesson_payload: {
          curriculumTrack: 'china',
          curriculumTopicId: details.topic.id,
          curriculumEditionId: details.textbook.id,
          curriculumSubject: details.subject,
          curriculumChapter: details.topic.chapter,
          curriculumGrade: details.topic.grade,
          classroomJobId: jobId,
          classroomStatus: reusableLesson ? 'succeeded' : job.status,
          ...(reusableLesson && classroomUrl
            ? { classroomId: reusableLesson.id, classroomUrl }
            : {}),
        },
        reuse_key: `${user.id}:china:${details.topic.id}:${jobId}`,
        status: reusableLesson ? 'generated' : 'planned',
      })
      .select('id')
      .single();
    if (error) throw error;

    if (!reusableLesson) {
      after(() => runClassroomGenerationJob(jobId, input, origin, { billingUserId: user.id }));
    }

    return apiSuccess(
      {
        sessionId: session.id,
        jobId,
        pollUrl: `/api/china-curriculum/lesson?sessionId=${encodeURIComponent(session.id)}`,
        pollIntervalMs: 4000,
      },
      202,
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('platform_usage_limit_reached:')) {
      return apiError(
        'PLATFORM_USAGE_LIMIT_REACHED',
        402,
        error.message.replace(/^platform_usage_limit_reached:\s*/, ''),
      );
    }
    if (error instanceof Error && error.message.startsWith('PLATFORM_AI_NOT_CONFIGURED:')) {
      return apiError(
        'PLATFORM_AI_NOT_CONFIGURED',
        503,
        error.message.replace(/^PLATFORM_AI_NOT_CONFIGURED:\s*/, ''),
      );
    }
    const diagnostic = describeStartError(error);
    console.error('[china-lesson-start-failed]', {
      requestId,
      stage: failedStage,
      ...diagnostic,
    });
    return apiError(
      'INTERNAL_ERROR',
      500,
      `课程服务暂时无法启动，请稍后再试。（错误编号：${requestId.slice(0, 8)}）`,
    );
  }
}

function describeStartError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  if (error && typeof error === 'object') {
    const value = error as Record<string, unknown>;
    return {
      name: typeof value.name === 'string' ? value.name : 'DatabaseError',
      message: typeof value.message === 'string' ? value.message : 'Unknown database error',
      code: typeof value.code === 'string' ? value.code : undefined,
      details: typeof value.details === 'string' ? value.details : undefined,
      hint: typeof value.hint === 'string' ? value.hint : undefined,
    };
  }

  return { name: 'UnknownError', message: String(error) };
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');

    const sessionId = request.nextUrl.searchParams.get('sessionId');
    if (!sessionId) return apiError('MISSING_REQUIRED_FIELD', 400, 'sessionId is required');

    const admin = createSupabaseAdminClient();
    const { data: session, error } = await admin
      .from('learning_sessions')
      .select('id,student_id,lesson_payload,status')
      .eq('id', sessionId)
      .eq('student_id', user.id)
      .maybeSingle();
    if (error) throw error;
    if (!session) return apiError('INVALID_REQUEST', 404, 'Learning session not found');

    const payload = session.lesson_payload as {
      curriculumTrack?: string;
      classroomJobId?: string;
      classroomUrl?: string;
      classroomId?: string;
    } | null;
    if (payload?.curriculumTrack !== 'china' || !payload.classroomJobId) {
      return apiError('INVALID_REQUEST', 404, 'China lesson job not found');
    }

    const { readClassroomGenerationJob } = await import('@/lib/server/classroom-job-store');
    const job = await readClassroomGenerationJob(payload.classroomJobId, user.id);
    if (!job) return apiError('INVALID_REQUEST', 404, 'Lesson generation job not found');

    if (
      job.status === 'succeeded' &&
      job.result?.url &&
      (payload.classroomUrl !== job.result.url || session.status === 'planned')
    ) {
      const { error: updateError } = await admin
        .from('learning_sessions')
        .update({
          status: 'generated',
          lesson_payload: {
            ...payload,
            classroomStatus: job.status,
            classroomUrl: job.result.url,
            classroomId: job.result.classroomId,
          },
        })
        .eq('id', session.id)
        .eq('student_id', user.id);
      if (updateError) throw updateError;
    }

    return apiSuccess({
      sessionId: session.id,
      status: job.status,
      progress: job.progress,
      message: job.message,
      classroomUrl: job.result?.url ?? payload.classroomUrl ?? null,
      classroomId: job.result?.classroomId ?? payload.classroomId ?? null,
      error:
        job.status === 'failed'
          ? job.error?.includes('Platform AI is not configured')
            ? '平台 AI 尚未连接，请管理员配置服务后再试。'
            : job.error?.includes('platform_usage_limit_reached')
              ? '本月平台 AI 使用额度已用完，将在下月恢复。'
              : '课堂生成遇到问题，请稍后再试。'
          : null,
    });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Could not check lesson progress',
    );
  }
}
