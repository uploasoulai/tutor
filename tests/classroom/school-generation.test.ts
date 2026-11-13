import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClassroomGenerationJob } from '@/lib/server/classroom-job-store';
import { initialSchoolGeneration } from '@/lib/server/school-generation-state';

const mock = vi.hoisted(() => ({
  job: null as ClassroomGenerationJob | null,
  ai: vi.fn(),
  content: vi.fn(),
  actions: vi.fn(),
  publish: vi.fn(),
  resolve: vi.fn(),
  metered: vi.fn(),
  limit: vi.fn(),
}));
vi.mock('@/lib/server/classroom-job-store', () => ({
  readClassroomGenerationJob: async (_id: string, owner: string) =>
    mock.job?.schoolGeneration?.ownerId === owner ? structuredClone(mock.job) : null,
  compareAndSwapSchoolJob: async (
    previous: ClassroomGenerationJob,
    next: ClassroomGenerationJob,
    owner: string,
  ) => {
    if (
      mock.job?.schoolGeneration?.ownerId !== owner ||
      mock.job.schoolGeneration.revision !== previous.schoolGeneration?.revision
    )
      return false;
    next.schoolGeneration!.revision = previous.schoolGeneration!.revision + 1;
    mock.job = structuredClone(next);
    return true;
  },
}));
vi.mock('@/lib/server/resolve-model', () => ({ resolveLearnerJobModel: mock.resolve }));
vi.mock('@/lib/ai/llm', () => ({ callLLM: mock.ai }));
vi.mock('@/lib/server/platform-ai-usage', () => ({
  assertPlatformAiWithinLimit: mock.limit,
  runWithPlatformAiUsage: (context: unknown, fn: () => Promise<void>) => {
    mock.metered(context);
    return fn();
  },
}));
vi.mock('@/lib/generation/outline-generator', () => ({
  applyOutlineFallbacks: (o: unknown) => o,
  generateSceneOutlinesFromRequirements: async (
    _req: unknown,
    _pdf: unknown,
    _images: unknown,
    ai: () => Promise<string>,
  ) => {
    await ai();
    return {
      success: true,
      data: {
        languageDirective: 'zh',
        outlines: [
          { id: 'intro', type: 'slide', title: '引入', order: 0, keyPoints: [] },
          { id: 'practice', type: 'interactive', title: '操作', order: 1, keyPoints: [] },
          { id: 'check', type: 'quiz', title: '检查', order: 2, keyPoints: [] },
        ],
      },
    };
  },
}));
vi.mock('@/lib/generation/scene-generator', () => ({
  generateSceneContent: mock.content,
  generateSceneActions: mock.actions,
  createSceneWithActions: (
    outline: { id: string },
    content: unknown,
    actions: unknown,
    store: {
      getState: () => { scenes: unknown[] };
      setState: (value: unknown) => void;
    },
  ) => {
    store.setState({ scenes: [...store.getState().scenes, { id: outline.id, content, actions }] });
    return outline.id;
  },
}));
vi.mock('@/lib/api/stage-api', () => ({ createStageAPI: (store: unknown) => store }));
vi.mock('@/lib/server/classroom-generation', () => ({
  createInMemoryStore: () => {
    let state = { scenes: [] };
    return {
      getState: () => state,
      setState: (patch: object) => {
        state = { ...state, ...patch };
      },
    };
  },
}));
vi.mock('@/lib/orchestration/registry/store', () => ({ getDefaultAgents: () => [] }));
vi.mock('@/lib/server/classroom-storage', () => ({ persistClassroom: mock.publish }));
import {
  advanceSchoolGeneration,
  schoolGenerationError,
  assertSchoolAiAvailable,
  schoolGenerationUserPrompt,
} from '@/lib/server/school-generation-runner';

const run = (retry = false) =>
  advanceSchoolGeneration('job', 'learner', 'https://example.test', retry);
describe('durable school generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const input = {
      requirement: 'curriculum only',
      curriculumLessonCache: {
        cacheKey: 'a'.repeat(64),
        track: 'china' as const,
        canonicalId: 'topic',
        sourceRevision: '1',
        schemaVersion: 2,
      },
    };
    mock.job = {
      id: 'job',
      status: 'queued',
      step: 'queued',
      progress: 0,
      message: '',
      createdAt: '',
      updatedAt: '',
      inputSummary: { requirementPreview: '', hasPdf: false, pdfTextLength: 0, pdfImageCount: 0 },
      scenesGenerated: 0,
      schoolGeneration: initialSchoolGeneration('learner', input),
    };
    mock.resolve.mockResolvedValue({ resolved: { model: {} }, byok: false });
    mock.ai.mockResolvedValue({ text: 'valid', finishReason: 'stop' });
    mock.content.mockImplementation(async (outline, ai) => {
      await ai('system', 'content');
      return outline.type === 'interactive'
        ? { html: '<button>try</button>' }
        : { elements: [{ id: 'model', type: 'text', content: 'Visible example' }] };
    });
    mock.actions.mockImplementation(async (_outline, _content, ai) => {
      await ai('system', 'actions');
      return [
        {
          id: 'speech',
          type: 'speech',
          text: 'We explain the visible example step by step and connect it to the learning goal.',
        },
      ];
    });
    mock.publish.mockImplementation(async (value) => ({
      ...value,
      url: 'https://example.test/classroom/result',
    }));
  });

  it('two concurrent pollers reserve only one paid call', async () => {
    await Promise.all([run(), run()]);
    expect(mock.ai).toHaveBeenCalledTimes(1);
    expect(mock.job?.schoolGeneration?.phase).toBe('content');
    expect(mock.job?.schoolGeneration?.reservedCalls).toBe(1);
  });
  it('keeps a quality failure local and retains content for an explicit action retry', async () => {
    await run();
    await run();
    mock.actions.mockResolvedValueOnce([{ id: 's', type: 'speech', text: ' ' }]);
    await run();
    expect(mock.job?.error).toBe('lesson_quality_check_failed');
    expect(mock.job?.schoolGeneration?.pendingContent).toBeDefined();
    expect(mock.job?.schoolGeneration?.qualityReports?.['0'].pass).toBe(false);
    await run(true);
    expect(mock.content).toHaveBeenCalledTimes(1);
    expect(mock.job?.schoolGeneration?.sceneIndex).toBe(1);
  });
  it('stores actual step usage and keeps unavailable usage unknown', async () => {
    mock.ai.mockResolvedValueOnce({
      text: 'valid',
      finishReason: 'stop',
      usage: { inputTokens: 21, outputTokens: 8 },
    });
    await run();
    await run();
    expect(mock.job?.schoolGeneration?.callMetrics?.['outline:0:1']).toMatchObject({
      inputTokens: 21,
      outputTokens: 8,
      finishReason: 'stop',
    });
    expect(mock.job?.schoolGeneration?.callMetrics?.['content:0:1'].inputTokens).toBeNull();
  });
  it('retries an empty visual at the content checkpoint rather than repeatedly replacing its narration', async () => {
    await run();
    mock.content.mockImplementationOnce(async (_outline, ai) => {
      await ai('system', 'content');
      return { elements: [] };
    });
    await run();
    await run();
    expect(mock.job?.schoolGeneration?.phase).toBe('content');
    expect(mock.job?.schoolGeneration?.pendingContent).toBeUndefined();
    await run(true);
    expect(mock.content).toHaveBeenCalledTimes(2);
    expect(mock.job?.schoolGeneration?.phase).toBe('actions');
    expect(mock.job?.schoolGeneration?.attempts['outline:0']).toBe(1);
  });
  it('continues from the previous saved narration after a step resumes', async () => {
    await run();
    await run();
    await run();
    const state = mock.job!.schoolGeneration!;
    state.scenes[0].actions = [
      { id: 'earlier', type: 'speech', text: 'Earlier explanation' },
      { id: 'last', type: 'speech', text: '现在我们已经发现每组同样多。' },
      { id: 'point', type: 'laser', elementId: 'group-picture' },
    ];
    await run();
    await run();
    expect(mock.actions.mock.calls.at(-1)?.[3].ctx.previousSpeeches).toEqual([
      '现在我们已经发现每组同样多。',
    ]);
    expect(mock.actions.mock.calls.at(-1)?.[3].ctx.pageIndex).toBe(2);
    expect(mock.ai).toHaveBeenCalledTimes(5);
  });
  it('applies grounded teaching directions only to School action generation', async () => {
    const state = mock.job!.schoolGeneration!;
    state.phase = 'actions';
    const prompt = schoolGenerationUserPrompt(state, 'Actual scene content');
    expect(prompt).toContain('Actual scene content');
    expect(prompt).toContain('objects, labels and controls that actually exist');
    expect(prompt).toContain('rather than reading slide text aloud');
    state.phase = 'outline';
    expect(schoolGenerationUserPrompt(state, 'Outline')).toBe('Outline');
  });
  it('saves each phase and publishes only a complete lesson; completed reads spend nothing', async () => {
    for (let i = 0; i < 8; i++) await run();
    expect(mock.job?.status).toBe('succeeded');
    expect(mock.publish.mock.calls[0][0].scenes).toHaveLength(3);
    expect(mock.job?.schoolGeneration?.scenes).toEqual([]);
    expect(mock.ai).toHaveBeenCalledTimes(7);
    await run();
    expect(mock.ai).toHaveBeenCalledTimes(7);
  });
  it('failed actions retain content; explicit retry does not regenerate that content', async () => {
    await run();
    await run();
    mock.actions.mockRejectedValueOnce(new Error('private provider payload API_KEY=secret'));
    await run();
    expect(mock.job?.status).toBe('failed');
    expect(mock.job?.schoolGeneration?.pendingContent).toEqual({
      elements: [{ id: 'model', type: 'text', content: 'Visible example' }],
    });
    expect(JSON.stringify(mock.job)).not.toContain('secret');
    await run();
    expect(mock.actions).toHaveBeenCalledTimes(1);
    await run(true);
    expect(mock.content).toHaveBeenCalledTimes(1);
    expect(mock.job?.schoolGeneration?.sceneIndex).toBe(1);
  });
  it('rejects another learner without accessing models or shared artifacts', async () => {
    await advanceSchoolGeneration('job', 'other', 'https://example.test');
    expect(mock.resolve).not.toHaveBeenCalled();
    expect(mock.publish).not.toHaveBeenCalled();
  });
  it('never meters verified BYOK as platform use, and does not switch on BYOK errors', async () => {
    mock.resolve.mockResolvedValueOnce({ resolved: { model: {} }, byok: true });
    await run();
    expect(mock.metered).not.toHaveBeenCalled();
    mock.resolve.mockRejectedValueOnce(new Error('BYOK_PROVIDER_UNAVAILABLE'));
    await run();
    expect(mock.job?.error).toBe('byok_provider_unavailable');
    expect(mock.ai).toHaveBeenCalledTimes(1);
  });
  it('expires a crashed lease without rerunning successful phases', async () => {
    await run();
    mock.job!.schoolGeneration!.leaseUntil = Date.now() - 1;
    mock.job!.schoolGeneration!.attempts['content:0'] = 1;
    await run();
    expect(mock.ai).toHaveBeenCalledTimes(2);
    expect(mock.job?.schoolGeneration?.phase).toBe('actions');
  });
  it('blocks further calls once the durable attempt or whole-course budget is used', async () => {
    mock.job!.schoolGeneration!.attempts['outline:0'] = 2;
    await run(true);
    expect(mock.job?.error).toBe('lesson_generation_budget_reached');
    expect(mock.ai).not.toHaveBeenCalled();
    mock.job!.schoolGeneration!.attempts = {};
    mock.job!.schoolGeneration!.reservedCalls = 28;
    await run(true);
    expect(mock.ai).not.toHaveBeenCalled();
  });
  it('rejects truncated output instead of publishing a partial lesson', async () => {
    mock.ai.mockResolvedValueOnce({ text: 'partial', finishReason: 'length' });
    await run();
    expect(mock.job?.status).toBe('failed');
    expect(mock.publish).not.toHaveBeenCalled();
    expect(mock.ai.mock.calls[0][0].maxRetries).toBe(0);
  });
  it('allows verified BYOK without platform quota or platform-key setup', async () => {
    mock.resolve.mockResolvedValueOnce({ resolved: { model: {} }, byok: true });
    await assertSchoolAiAvailable('learner');
    expect(mock.limit).not.toHaveBeenCalled();
    mock.resolve.mockResolvedValueOnce({ resolved: { model: {} }, byok: false });
    await assertSchoolAiAvailable('learner');
    expect(mock.limit).toHaveBeenCalledWith('learner');
  });
  it('uses the reviewed manipulative without another model call only for its exact China topic', async () => {
    await run();
    const state = mock.job!.schoolGeneration!;
    state.sceneIndex = 1;
    state.phase = 'content';
    state.input.curriculumLessonCache!.canonicalId = 'pep:cnm_p038';
    await run();
    expect(mock.ai).toHaveBeenCalledTimes(1);
    expect(mock.content).not.toHaveBeenCalled();
    expect(mock.job!.schoolGeneration!.pendingContent).toMatchObject({ widgetType: 'simulation' });
  });
  it('keeps neighbouring topics on their own generated activity', async () => {
    await run();
    const state = mock.job!.schoolGeneration!;
    state.sceneIndex = 1;
    state.phase = 'content';
    state.input.curriculumLessonCache!.canonicalId = 'pep:cnm_p039';
    await run();
    expect(mock.content).toHaveBeenCalledTimes(1);
    expect(mock.ai).toHaveBeenCalledTimes(2);
  });
  it.each(['cnm_p053', 'cnm_p055'])(
    'restores the same reviewed task at a saved %s checkpoint without generating widget code',
    async (topic) => {
      mock.job!.schoolGeneration!.input.curriculumLessonCache!.canonicalId = 'pep:' + topic;
      await run();
      expect(mock.job!.schoolGeneration!.outlines![1].title).toContain(
        topic === 'cnm_p053' ? '243' : '2046',
      );
      const state = mock.job!.schoolGeneration!;
      state.phase = 'content';
      state.sceneIndex = 1;
      state.outlines![1].title = 'Unrelated old draft';
      state.outlines![1].description = 'Drag chairs';
      await run();
      expect(mock.ai).toHaveBeenCalledTimes(1);
      expect(mock.content).not.toHaveBeenCalled();
      expect(mock.job!.schoolGeneration!.outlines![1].description).not.toContain('chairs');
      expect(mock.job!.schoolGeneration!.pendingContent).toMatchObject({
        teacherActions: [expect.objectContaining({ type: 'speech' })],
      });
    },
  );
  it('grounds planning in the same quantities and real controls as the reviewed activity', () => {
    const state = mock.job!.schoolGeneration!;
    state.input.curriculumLessonCache!.canonicalId = 'pep:cnm_p053';
    const prompt = schoolGenerationUserPrompt(state, 'Curriculum requirements');
    expect(prompt).toContain('Curriculum requirements');
    expect(prompt).toContain('243');
    expect(prompt).toContain('加一个');
    expect(prompt).toContain('Do not promise different objects');
  });
  it('retains provider status when content catches the original exception', async () => {
    await run();
    mock.ai.mockRejectedValueOnce(Object.assign(new Error('private body'), { statusCode: 401 }));
    mock.content.mockImplementationOnce(async (_outline, ai) => {
      try {
        await ai('system', 'content');
      } catch {}
      return null;
    });
    await run();
    expect(mock.job?.providerStatus).toBe(401);
    expect(mock.job?.error).toBe('provider_authentication_failed');
    expect(JSON.stringify(mock.job)).not.toContain('private body');
  });
  it('rejects countdown games instead of accepting controls as proof they work', async () => {
    await run();
    await run();
    await run();
    mock.content.mockResolvedValueOnce({
      html: '<button>Play</button><script>timeLeft--</script>',
    });
    await run();
    expect(mock.job?.status).toBe('failed');
    expect(mock.job?.scenesGenerated).toBe(1);
    expect(mock.publish).not.toHaveBeenCalled();
  });
  it('keeps safe provider error categories distinct', () => {
    expect(schoolGenerationError({ statusCode: 401 })).toBe('provider_authentication_failed');
    expect(schoolGenerationError({ statusCode: 402 })).toBe('provider_balance_required');
    expect(schoolGenerationError({ statusCode: 429 })).toBe('provider_rate_limited');
    expect(schoolGenerationError({ statusCode: 503 })).toBe('provider_unavailable');
    expect(schoolGenerationError({ name: 'TimeoutError' })).toBe('provider_timeout');
  });
});
