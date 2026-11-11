import { createStageAPI } from '@/lib/api/stage-api';
import { callLLM } from '@/lib/ai/llm';
import { selectCurriculumOutlines } from '@/lib/curriculum/select-lesson-outlines';
import {
  applyOutlineFallbacks,
  generateSceneOutlinesFromRequirements,
} from '@/lib/generation/outline-generator';
import {
  generateSceneContent,
  generateSceneActions,
  createSceneWithActions,
} from '@/lib/generation/scene-generator';
import type { AICallFn } from '@/lib/generation/pipeline-types';
import { getDefaultAgents } from '@/lib/orchestration/registry/store';
import { createInMemoryStore } from './classroom-generation';
import {
  compareAndSwapSchoolJob,
  readClassroomGenerationJob,
  type ClassroomGenerationJob,
} from './classroom-job-store';
import {
  canAdvanceSchoolGeneration,
  schoolStepKey,
  type SchoolGenerationState,
} from './school-generation-state';
import { resolveLearnerJobModel } from './resolve-model';
import { runWithPlatformAiUsage, assertPlatformAiWithinLimit } from './platform-ai-usage';
import { persistClassroom } from './classroom-storage';
import { GROUPING_ACTIVITY_HTML } from '@/lib/curriculum/grouping-activity';

export async function assertSchoolAiAvailable(ownerId: string) {
  const { byok } = await resolveLearnerJobModel(ownerId);
  if (!byok) await assertPlatformAiWithinLimit(ownerId);
}

export function schoolGenerationError(error: unknown) {
  const value = error as { statusCode?: number; status?: number; name?: string; message?: string };
  const status = value?.statusCode ?? value?.status;
  // Do not persist provider response bodies, headers, credentials, or raw learner prompts.
  if (value?.message?.includes('platform_usage_limit_reached'))
    return 'platform_usage_limit_reached';
  if (value?.message === 'BYOK_PROVIDER_UNAVAILABLE') return 'byok_provider_unavailable';
  if (status === 401) return 'provider_authentication_failed';
  if (status === 402) return 'provider_balance_required';
  if (status === 429) return 'provider_rate_limited';
  if (status && status >= 500) return 'provider_unavailable';
  if (value?.name?.includes('Timeout') || value?.name === 'AbortError') return 'provider_timeout';
  return 'lesson_step_failed';
}

export function schoolGenerationMessage(code?: string) {
  const messages: Record<string, string> = {
    provider_authentication_failed: '你的 AI 服务认证未通过，请检查 AI 设置。已完成内容仍保留。',
    provider_balance_required: '你的 AI 服务账户余额不足，请检查供应商账户。已完成内容仍保留。',
    provider_rate_limited: 'AI 服务暂时繁忙，请稍等后从断点继续。',
    provider_unavailable: 'AI 服务暂时无法连接，请稍后从断点继续。',
    provider_timeout: '这个环节等待太久，已完成内容仍保留，可以从断点继续。',
    byok_provider_unavailable:
      '你的 AI 设置暂不可用，请到设置中检查；系统不会自动改用平台付费服务。',
    platform_usage_limit_reached: '本月平台 AI 使用额度已用完，将在下月恢复。',
    lesson_generation_budget_reached: '本次课程已达到重试上限，已完成内容仍保留。',
  };
  return messages[code ?? ''] ?? '这个环节暂时未完成，已完成内容仍保留，可以从断点继续。';
}

export function schoolGenerationUserPrompt(state: SchoolGenerationState, user: string) {
  if (state.phase === 'actions')
    return `${user}\n\nSchool Learning teaching delivery: use the learner age/grade and language specified in this curriculum, without assuming every learner is Grade 2. Explain the idea behind the visible example rather than reading slide text aloud. Keep each speech turn to one short idea. Refer only to objects, labels and controls that actually exist in the current supplied scene; never invent a chair, draggable object, animation, or button. For slide emphasis, use only actual supplied element IDs and place the spotlight/laser immediately before the matching explanation. For an activity, explain its real touch/click controls, invite the learner to try, and do not narrate a successful learner action as if it already happened. Use one brief observation question where useful, with warm specific encouragement rather than speed pressure. Do not repeat the course greeting on later pages. Keep the existing structured action output format.`;
  if (state.phase !== 'content' || state.outlines?.[state.sceneIndex]?.type !== 'interactive')
    return user;
  return `${user}\n\nSchool Learning delivery constraints: use ONE small touch/click teaching activity, not a timed arcade game. Replace any drag instruction in the outline with a touch/click equivalent, keeping the same mathematical goal. No countdown, speed score, external images, or external game libraries. Make buttons at least 44px, use border-box sizing, wrap for 390px screens. Use addEventListener for controls. All referenced objects and event handlers must exist. Keep HTML compact: at most 100 lines and about 1800 output tokens, simple CSS, no decorative animation. Tie feedback to the learning objective. Do not remove the underlying subject-learning task.`;
}

/** One saved unit per invocation; maximum one paid call, no implicit provider retries. */
export async function advanceSchoolGeneration(
  jobId: string,
  ownerId: string,
  baseUrl: string,
  retry = false,
) {
  const previous = await readClassroomGenerationJob(jobId, ownerId);
  const state = previous?.schoolGeneration;
  if (!previous || !state || state.ownerId !== ownerId || previous.status === 'succeeded') return;
  if (previous.status === 'failed' && !retry) return;
  if (!canAdvanceSchoolGeneration(state)) {
    if (!state.leaseUntil || state.leaseUntil < Date.now()) {
      await compareAndSwapSchoolJob(
        previous,
        {
          ...previous,
          status: 'failed',
          step: 'failed',
          message: '本次课程已达到重试上限，已完成内容仍保留。',
          error: 'lesson_generation_budget_reached',
        },
        ownerId,
      );
    }
    return;
  }
  const key = schoolStepKey(state);
  const locked: ClassroomGenerationJob = {
    ...previous,
    status: 'running',
    error: undefined,
    providerStatus: undefined,
    startedAt: previous.startedAt ?? new Date().toISOString(),
    message:
      state.phase === 'outline'
        ? '正在准备整堂课的教学安排…'
        : state.phase === 'publish'
          ? '正在保存完整课堂…'
          : `正在准备第 ${state.sceneIndex + 1}/${state.outlines?.length} 个教学环节…`,
    schoolGeneration: {
      ...state,
      leaseUntil: Date.now() + 330_000,
      attempts: { ...state.attempts, [key]: (state.attempts[key] ?? 0) + 1 },
      reservedCalls: state.reservedCalls + (state.phase === 'publish' ? 0 : 1),
    },
  };
  if (!(await compareAndSwapSchoolJob(previous, locked, ownerId))) return;
  let providerFailure: unknown;
  try {
    const next = structuredClone(locked.schoolGeneration!);
    let result: ClassroomGenerationJob['result'];
    if (next.phase === 'publish') {
      if (!next.stage || next.scenes.length !== next.outlines?.length)
        throw new Error('Incomplete lesson');
      const artifact = await persistClassroom(
        { id: next.stage.id, stage: next.stage, scenes: next.scenes },
        baseUrl,
        ownerId,
        next.input.curriculumLessonCache,
      );
      result = { classroomId: artifact.id, url: artifact.url, scenesCount: artifact.scenes.length };
      // Completed job retains only the compact checkpoint; shared artifacts own scene data.
      next.scenes = [];
      next.pendingContent = undefined;
    } else {
      const { resolved, byok } = await resolveLearnerJobModel(ownerId);
      let calls = 0;
      const aiCall: AICallFn = async (system, user) => {
        if (++calls > 1) throw new Error('School step call budget exceeded');
        const response = await callLLM(
          {
            model: resolved.model,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: schoolGenerationUserPrompt(next, user) },
            ],
            maxOutputTokens: Math.min(
              next.input.maxOutputTokens ?? 4096,
              next.phase === 'content' && next.outlines?.[next.sceneIndex]?.type === 'interactive'
                ? 2400
                : 4096,
            ),
            maxRetries: 0,
            abortSignal: AbortSignal.timeout(120_000),
          },
          'school-lesson-step',
        ).catch((error: unknown) => {
          providerFailure = error;
          throw error;
        });
        if (response.finishReason === 'length') throw new Error('Incomplete model output');
        return response.text;
      };
      const generate = () => generateSchoolStep(next, aiCall);
      if (byok) await generate();
      else
        await runWithPlatformAiUsage(
          { userId: ownerId, requestId: `${jobId}:${key}:${next.attempts[key]}` },
          generate,
        );
    }
    next.leaseUntil = undefined;
    const count = result?.scenesCount ?? next.scenes.length;
    const saved = await compareAndSwapSchoolJob(
      locked,
      {
        ...locked,
        schoolGeneration: next,
        result,
        status: result ? 'succeeded' : 'running',
        step: result ? 'completed' : next.phase === 'publish' ? 'persisting' : 'generating_scenes',
        scenesGenerated: count,
        totalScenes: next.outlines?.length,
        progress: result
          ? 100
          : next.outlines
            ? Math.min(95, 15 + Math.floor((80 * count) / next.outlines.length))
            : 10,
        message: result ? '课堂已准备好，可以开始学习。' : '已保存当前进度，继续准备下一环节…',
        ...(result ? { completedAt: new Date().toISOString() } : {}),
      },
      ownerId,
    );
    if (!saved) console.warn('[school-generation] stale step result discarded', jobId);
  } catch (error) {
    const failure = providerFailure ?? error;
    const status =
      (failure as { statusCode?: number; status?: number })?.statusCode ??
      (failure as { status?: number })?.status;
    const code = schoolGenerationError(failure);
    await compareAndSwapSchoolJob(
      locked,
      {
        ...locked,
        status: 'failed',
        step: 'failed',
        error: code,
        providerStatus:
          Number.isInteger(status) && status! >= 400 && status! <= 599 ? status : undefined,
        message: schoolGenerationMessage(code),
        schoolGeneration: { ...locked.schoolGeneration!, leaseUntil: undefined },
      },
      ownerId,
    );
  }
}

export async function generateSchoolStep(state: SchoolGenerationState, aiCall: AICallFn) {
  const agents = getDefaultAgents();
  if (state.phase === 'outline') {
    const result = await generateSceneOutlinesFromRequirements(
      { requirement: state.input.requirement },
      '',
      undefined,
      aiCall,
      undefined,
      { imageGenerationEnabled: false, videoGenerationEnabled: false },
    );
    if (!result.success || !result.data?.outlines?.length) throw new Error('Outline unavailable');
    const outlines = selectCurriculumOutlines(
      result.data.outlines,
      Math.min(state.input.maxScenes ?? 6, 6),
    );
    if (
      outlines.length < 3 ||
      !outlines.some((o) => o.type === 'quiz') ||
      !outlines.some((o) => o.type === 'interactive')
    ) {
      throw new Error('Lesson missing interaction or assessment');
    }
    let widgets = 0;
    state.outlines = outlines.map((outline, i) =>
      applyOutlineFallbacks(
        {
          ...outline,
          order: i,
          type:
            outline.type === 'pbl' || (outline.type === 'interactive' && ++widgets > 1)
              ? 'slide'
              : outline.type,
          mediaGenerations: [],
          ...(outline.type === 'interactive'
            ? {
                widgetType: 'simulation' as const,
                widgetOutline: {
                  concept: `${outline.title}: ${outline.keyPoints.join('; ')}. Use a small touch/click activity, no countdown or speed scoring.`,
                },
              }
            : {}),
        },
        true,
      ),
    );
    state.languageDirective = result.data.languageDirective;
    state.stage = {
      id: `course-${state.input.curriculumLessonCache!.cacheKey.slice(0, 32)}`,
      name: state.outlines[0].title,
      style: 'interactive',
      languageDirective: state.languageDirective,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      agentIds: agents.map((a) => a.id),
    };
    state.phase = 'content';
    return;
  }
  const outline = state.outlines![state.sceneIndex];
  const options = { agents, languageDirective: state.languageDirective };
  if (state.phase === 'content') {
    // A reviewed manipulative replaces uncertain generated JS only for this exact graph topic.
    const reviewedGrouping =
      outline.type === 'interactive' &&
      state.input.curriculumLessonCache?.track === 'china' &&
      state.input.curriculumLessonCache.canonicalId.endsWith(':cnm_p038');
    const content = reviewedGrouping
      ? {
          html: GROUPING_ACTIVITY_HTML,
          widgetType: 'simulation' as const,
          teacherActions: [
            {
              id: 'grouping-intro',
              type: 'speech' as const,
              content:
                '我们来分一分。每个盒子放两个圆片。先点圆片，再点盒子；放好以后数一数，一共有几个二。',
            },
          ],
        }
      : await generateSceneContent(outline, aiCall, options);
    if (!content) throw new Error('Scene unavailable');
    if (
      outline.type === 'interactive' &&
      (!('html' in content) ||
        !content.html ||
        !/<(?:button|input|select|canvas|svg)\b/i.test(content.html))
    )
      throw new Error('Visible interaction unavailable');
    if (
      outline.type === 'interactive' &&
      'html' in content &&
      (/timeLeft\s*--|--\s*timeLeft/.test(content.html) ||
        (/dragstart|draggable\s*=/.test(content.html) &&
          !/addEventListener\s*\(\s*['"](?:click|pointerdown|touchstart)/.test(content.html)))
    ) {
      throw new Error('School interaction requires untimed touch controls');
    }
    state.pendingContent = content;
    state.phase = 'actions';
    return;
  }
  if (!state.pendingContent || !state.stage) throw new Error('Checkpoint unavailable');
  const actions = await generateSceneActions(outline, state.pendingContent, aiCall, {
    ...options,
    ctx: {
      pageIndex: state.sceneIndex + 1,
      totalPages: state.outlines!.length,
      allTitles: state.outlines!.map((o) => o.title),
      previousSpeeches:
        state.scenes
          .at(-1)
          ?.actions?.filter((action) => action.type === 'speech' && typeof action.text === 'string')
          .slice(-1)
          .map((action) => (action.type === 'speech' ? action.text.slice(-150) : '')) ?? [],
    },
  });
  if (!actions.length) throw new Error('Teaching actions unavailable');
  const store = createInMemoryStore(state.stage);
  store.setState({ scenes: state.scenes });
  if (!createSceneWithActions(outline, state.pendingContent, actions, createStageAPI(store)))
    throw new Error('Scene unavailable');
  state.scenes = store.getState().scenes;
  state.pendingContent = undefined;
  state.sceneIndex++;
  state.phase = state.sceneIndex === state.outlines!.length ? 'publish' : 'content';
}
