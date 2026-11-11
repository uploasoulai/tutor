import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { FRACTIONS_HYBRID } from '@/lib/curriculum/hybrid-fractions';
const state = vi.hoisted(() => ({
  user: { id: 'learner' } as { id: string } | null,
  role: 'student',
  session: null as Record<string, unknown> | null,
  attempts: [] as Record<string, unknown>[],
  writes: vi.fn(),
  filters: vi.fn(),
}));
vi.mock('@/lib/auth/account-role', () => ({ resolveAccountRole: async () => state.role }));
vi.mock('@/lib/auth/ensure-student-record', () => ({ ensureStudentRecord: async () => {} }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.user } }) } }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    from: (table: string) => {
      const filters: [string, unknown][] = [];
      const matches = (row: Record<string, unknown>) =>
        filters.every(([key, value]) => row[key] === value);
      const chain = {
        select: () => chain,
        eq: (key: string, value: unknown) => {
          filters.push([key, value]);
          state.filters(table, key, value);
          return chain;
        },
        neq: () => chain,
        maybeSingle: async () => ({
          data: state.session && matches(state.session) ? state.session : null,
          error: null,
        }),
        update: (payload: unknown) => {
          state.writes(table, payload);
          return chain;
        },
        insert: async (payload: unknown) => {
          state.writes(table, payload);
          return { error: state.session ? { code: '23505' } : null };
        },
        then: (resolve: (value: unknown) => unknown) =>
          Promise.resolve({
            data: table === 'student_curriculum_attempts' ? state.attempts.filter(matches) : null,
            error: null,
          }).then(resolve),
      };
      return chain;
    },
  }),
}));
import { GET, POST } from '@/app/api/china-curriculum/hybrid/route';
import {
  GET as getMultiplication,
  POST as postMultiplication,
} from '@/app/api/china-curriculum/multiplication-pilot/route';
import { MULTIPLICATION_PILOT } from '@/lib/curriculum/reviewed-lessons';
import { reviewedBookmarkId } from '@/lib/server/reviewed-lesson-api';
const id = '11111111-1111-4111-8111-111111111111';
const session = (owner = 'learner') => ({
  id,
  student_id: owner,
  status: 'started',
  lesson_payload: { hybridLessonId: FRACTIONS_HYBRID.id, hybridPhase: 'check' },
});
const attempt = (question: string, sessionId = id) => ({
  student_id: 'learner',
  learning_session_id: sessionId,
  curriculum_track: 'china',
  topic_id: FRACTIONS_HYBRID.topicId,
  question_id: question,
  is_correct: true,
});
const post = (action: string) =>
  POST(
    new NextRequest('https://example.test/api/china-curriculum/hybrid', {
      method: 'POST',
      body: JSON.stringify({ action, sessionId: id }),
    }),
  );
describe('hybrid classroom learner records', () => {
  beforeEach(() => {
    state.user = { id: 'learner' };
    state.role = 'student';
    state.session = session();
    state.attempts = [];
    state.writes.mockReset();
    state.filters.mockReset();
  });
  it('does not let a parent record work as a student', async () => {
    state.role = 'parent';
    expect((await post('start')).status).toBe(401);
    expect(state.writes).not.toHaveBeenCalled();
  });
  it('does not roll back a saved checkpoint after a stale request', async () => {
    const result = await POST(
      new NextRequest('https://example.test/api/china-curriculum/hybrid', {
        method: 'POST',
        body: JSON.stringify({ action: 'checkpoint', sessionId: id, phase: 'video' }),
      }),
    );
    expect(await result.json()).toEqual(expect.objectContaining({ phase: 'check' }));
    expect(state.writes).not.toHaveBeenCalled();
  });
  it('starts a learner-owned lesson without storing answer keys', async () => {
    state.session = null;
    expect((await post('start')).status).toBe(201);
    expect(state.writes).toHaveBeenCalledWith(
      'learning_sessions',
      expect.objectContaining({
        student_id: 'learner',
        status: 'started',
        lesson_payload: expect.objectContaining({
          hybridLessonId: FRACTIONS_HYBRID.id,
          hybridPhase: 'question',
          hybridContentVersion: 2,
        }),
      }),
    );
  });
  it('does not let a recap checkpoint bypass the understanding checks', async () => {
    const result = await POST(
      new NextRequest('https://example.test/api/china-curriculum/hybrid', {
        method: 'POST',
        body: JSON.stringify({ action: 'checkpoint', sessionId: id, phase: 'recap' }),
      }),
    );
    expect(result.status).toBe(409);
    expect(state.writes).not.toHaveBeenCalled();
  });
  it('allows the recap after both distinct questions in the same learner session', async () => {
    state.attempts = FRACTIONS_HYBRID.questionIds.map((question) => attempt(question));
    const result = await POST(
      new NextRequest('https://example.test/api/china-curriculum/hybrid', {
        method: 'POST',
        body: JSON.stringify({ action: 'checkpoint', sessionId: id, phase: 'recap' }),
      }),
    );
    expect(result.status).toBe(200);
    expect(state.writes).toHaveBeenCalledWith(
      'learning_sessions',
      expect.objectContaining({
        lesson_payload: expect.objectContaining({ hybridPhase: 'recap' }),
      }),
    );
  });
  it('requires authentication', async () => {
    state.user = null;
    expect((await post('complete')).status).toBe(401);
    expect(state.writes).not.toHaveBeenCalled();
  });
  it('rejects access to another learner session', async () => {
    state.session = session('other');
    expect(
      (
        await GET(
          new NextRequest(`https://example.test/api/china-curriculum/hybrid?sessionId=${id}`),
        )
      ).status,
    ).toBe(404);
  });
  it('does not count repeated answers to one question as both checks', async () => {
    state.attempts = [
      attempt(FRACTIONS_HYBRID.questionIds[0]),
      attempt(FRACTIONS_HYBRID.questionIds[0]),
    ];
    expect((await post('complete')).status).toBe(409);
    expect(state.writes).not.toHaveBeenCalled();
  });
  it('does not use another session answers to complete this one', async () => {
    state.attempts = FRACTIONS_HYBRID.questionIds.map((question) =>
      attempt(question, 'another-session'),
    );
    expect((await post('complete')).status).toBe(409);
  });
  it('completes after both distinct checks and constrains updates to the learner', async () => {
    state.attempts = FRACTIONS_HYBRID.questionIds.map((question) => attempt(question));
    expect((await post('complete')).status).toBe(200);
    expect(state.writes).toHaveBeenCalledWith(
      'learning_sessions',
      expect.objectContaining({ status: 'completed' }),
    );
    expect(state.filters).toHaveBeenCalledWith('learning_sessions', 'student_id', 'learner');
  });
  it('returns a bookmark and question IDs without answer keys', async () => {
    state.attempts = [attempt(FRACTIONS_HYBRID.questionIds[0])];
    const result = await GET(
      new NextRequest(`https://example.test/api/china-curriculum/hybrid?sessionId=${id}`),
    );
    expect(await result.json()).toEqual(
      expect.objectContaining({
        phase: 'check',
        correctQuestionIds: [FRACTIONS_HYBRID.questionIds[0]],
      }),
    );
    expect(result.headers.get('cache-control')).toBe('private, no-store');
  });
  it('never overwrites an ID belonging to someone else during start', async () => {
    state.session = session('other');
    expect((await post('start')).status).toBe(503);
    expect(state.writes).not.toHaveBeenCalledWith(
      'learning_sessions',
      expect.objectContaining({ status: 'completed' }),
    );
  });
  it('treats a duplicate start as the same session', async () => {
    expect((await post('start')).status).toBe(200);
    expect(state.writes).not.toHaveBeenCalled();
  });
  const multiplicationPost = (body: object) =>
    postMultiplication(
      new NextRequest('https://example.test/api/china-curriculum/multiplication-pilot', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
  it('saves one owner-bound grade-2 media reference without claiming study or copying bytes', async () => {
    state.session = null;
    const first = await multiplicationPost({ action: 'bookmark', sessionId: id });
    expect(first.status).toBe(201);
    const stored = state.writes.mock.calls[0][1];
    expect(stored).toMatchObject({
      id: reviewedBookmarkId('learner', MULTIPLICATION_PILOT.id),
      student_id: 'learner',
      status: 'planned',
      lesson_payload: {
        curriculumGrade: 2,
        curriculumTopicId: 'cnm_p038',
        isTestLesson: true,
        reviewedMediaAsset: MULTIPLICATION_PILOT.mediaAsset,
      },
    });
    expect(JSON.stringify(stored)).not.toContain('base64');
    expect(stored.xp_earned).toBeUndefined();
    state.session = stored;
    state.writes.mockClear();
    const repeated = await multiplicationPost({ action: 'bookmark' });
    expect((await repeated.json()).sessionId).toBe(stored.id);
    expect(state.writes).not.toHaveBeenCalled();
  });
  it('starts a saved course explicitly, preserving the same profile row', async () => {
    const savedId = reviewedBookmarkId('learner', MULTIPLICATION_PILOT.id);
    state.session = {
      id: savedId,
      student_id: 'learner',
      status: 'planned',
      lesson_payload: { hybridLessonId: MULTIPLICATION_PILOT.id, hybridPhase: 'question' },
    };
    expect(
      (await multiplicationPost({ action: 'checkpoint', sessionId: savedId, phase: 'video' }))
        .status,
    ).toBe(409);
    state.writes.mockClear();
    const result = await multiplicationPost({ action: 'start', sessionId: savedId });
    expect((await result.json()).status).toBe('started');
    expect(state.writes).toHaveBeenCalledWith(
      'learning_sessions',
      expect.objectContaining({ status: 'started', started_at: expect.any(String) }),
    );
    expect(state.filters).toHaveBeenCalledWith('learning_sessions', 'student_id', 'learner');
  });
  it('never reveals an owner session through the wrong reviewed course route', async () => {
    expect(
      (
        await getMultiplication(
          new NextRequest(
            `https://example.test/api/china-curriculum/multiplication-pilot?sessionId=${id}`,
          ),
        )
      ).status,
    ).toBe(404);
    state.session = {
      ...session(),
      lesson_payload: { hybridLessonId: MULTIPLICATION_PILOT.id, hybridPhase: 'check' },
    };
    state.attempts = FRACTIONS_HYBRID.questionIds.map((q) => attempt(q));
    expect((await multiplicationPost({ action: 'complete', sessionId: id })).status).toBe(409);
  });
  it('requires the two grade-2 questions, not answers from a different topic/session', async () => {
    state.session = {
      ...session(),
      lesson_payload: { hybridLessonId: MULTIPLICATION_PILOT.id, hybridPhase: 'check' },
    };
    state.attempts = MULTIPLICATION_PILOT.questionIds.map((q) => ({
      ...attempt(q),
      topic_id: MULTIPLICATION_PILOT.topicId,
    }));
    expect((await multiplicationPost({ action: 'complete', sessionId: id })).status).toBe(200);
    expect(state.writes).toHaveBeenCalledWith(
      'learning_sessions',
      expect.objectContaining({
        lesson_payload: expect.objectContaining({
          hybridAssessmentQuestionIds: MULTIPLICATION_PILOT.questionIds,
        }),
      }),
    );
  });
  it('does not reset completed work when the saved test lesson is reopened', async () => {
    state.session = {
      id: reviewedBookmarkId('learner', MULTIPLICATION_PILOT.id),
      student_id: 'learner',
      status: 'completed',
      lesson_payload: { hybridLessonId: MULTIPLICATION_PILOT.id, hybridPhase: 'completed' },
    };
    expect((await (await multiplicationPost({ action: 'bookmark' })).json()).phase).toBe(
      'completed',
    );
    expect(state.writes).not.toHaveBeenCalled();
    expect(reviewedBookmarkId('other', MULTIPLICATION_PILOT.id)).not.toBe(state.session.id);
  });
});
