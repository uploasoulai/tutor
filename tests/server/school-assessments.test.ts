import { beforeEach, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
vi.mock('@/lib/curriculum/prepared-courses', () => ({
  readablePreparedLesson: vi.fn().mockResolvedValue(null),
}));
const state = vi.hoisted(() => ({
  user: { id: '11111111-1111-4111-8111-111111111111' } as { id: string } | null,
  role: 'student',
  paper: null as unknown,
  rpc: vi.fn(),
  eq: vi.fn(),
  ensure: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.user } }) } }),
}));
vi.mock('@/lib/auth/account-role', () => ({ resolveAccountRole: async () => state.role }));
vi.mock('@/lib/auth/ensure-student-record', () => ({ ensureStudentRecord: state.ensure }));
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => {
    const query = {
      select: () => query,
      eq: (...args: unknown[]) => {
        state.eq(...args);
        return query;
      },
      maybeSingle: async () => ({ data: state.paper, error: null }),
    };
    return { from: () => query, rpc: state.rpc };
  },
}));
vi.mock('@/lib/china-curriculum/catalog', () => ({
  CHINA_SUBJECTS: { math: '数学' },
  getChinaTopics: async () => [
    { id: 't', name: '数一数', grade: 2, subject: 'math', semester: '上', chapter: '第一单元' },
  ],
  getChinaQuestions: async () => [
    { id: 'q', topicId: 't', type: 'numeric', prompt: '1+1', answer: '2', accept: ['二'] },
  ],
}));
import { GET, POST } from '@/app/api/school-assessments/route';
const id = '22222222-2222-4222-8222-222222222222';
const question = {
  id: 'q',
  topicId: 't',
  topicName: '数一数',
  type: 'numeric',
  prompt: '1+1',
  answer: '2',
  accept: ['二'],
};
const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/school-assessments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  );
beforeEach(() => {
  vi.clearAllMocks();
  state.user = { id: '11111111-1111-4111-8111-111111111111' };
  state.role = 'student';
  state.paper = { id, questions: [question], status: 'started', config: { grade: 2 } };
  state.rpc.mockImplementation(async (name, args) => ({
    data: name === 'create_school_assessment' ? id : args.p_report,
    error: null,
  }));
});
it('requires authentication before reading questions or saving any score', async () => {
  state.user = null;
  expect((await GET(new NextRequest('http://localhost/api/school-assessments'))).status).toBe(401);
  expect((await post({ action: 'start' })).status).toBe(401);
  expect(state.rpc).not.toHaveBeenCalled();
});
it('defaults an empty initial unit to the first available unit so the start button is usable', async () => {
  const body = await (
    await GET(
      new NextRequest(
        'http://localhost/api/school-assessments?grade=2&subject=math&term=%E4%B8%8A&scope=unit&unit=&count=10',
      ),
    )
  ).json();
  expect(body.topicCount).toBe(1);
  expect(body.selectedUnits).toEqual(['第一单元']);
});
it('creates a private answer snapshot but never returns the answer key', async () => {
  const response = await post({ action: 'start', config: { grade: 2, count: 5 } });
  const body = await response.json();
  expect(body.questions[0]).not.toHaveProperty('answer');
  expect(body.questions[0]).not.toHaveProperty('accept');
  expect(state.rpc.mock.calls[0][1].p_questions[0].answer).toBe('2');
  expect(response.headers.get('Cache-Control')).toBe('private, no-store');
});
it('previews for parents without creating student identities or sessions', async () => {
  state.role = 'parent';
  const body = await (await post({ action: 'start', config: { grade: 2, count: 5 } })).json();
  expect(body.preview).toBe(true);
  expect(body.id).toBeUndefined();
  expect(state.ensure).not.toHaveBeenCalled();
  expect(state.rpc).not.toHaveBeenCalled();
});
it('binds the snapshot to the signed-in learner and computes score on server', async () => {
  const body = await (
    await post({
      action: 'submit',
      id,
      student_id: 'other',
      answers: { q: '9' },
      report: { score: 100 },
    })
  ).json();
  expect(state.eq).toHaveBeenCalledWith('student_id', state.user!.id);
  expect(body.report.score).toBe(0);
  expect(state.rpc.mock.calls[0][1].p_student_id).toBe(state.user!.id);
});
it('rejects missing/foreign papers and answers for other question IDs', async () => {
  state.paper = null;
  expect((await post({ action: 'submit', id, answers: { q: '2' } })).status).toBe(404);
  state.paper = { questions: [question], status: 'started' };
  expect((await post({ action: 'submit', id, answers: { foreign: '2' } })).status).toBe(400);
  expect(state.rpc).not.toHaveBeenCalled();
});
it('reopening a completed paper retains the original report without scoring again', async () => {
  state.paper = { questions: [question], status: 'completed', report: { score: 0 } };
  const body = await (await post({ action: 'submit', id, answers: { q: '2' } })).json();
  expect(body.report.score).toBe(0);
  expect(state.rpc).not.toHaveBeenCalled();
});
