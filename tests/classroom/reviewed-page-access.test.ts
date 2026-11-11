import { beforeEach, describe, it, expect, vi } from 'vitest';
const state = vi.hoisted(() => ({
  user: { id: 'learner' } as { id: string } | null,
  role: 'student',
  catalog: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: state.user } }) } }),
}));
vi.mock('@/lib/auth/account-role', () => ({ resolveAccountRole: async () => state.role }));
vi.mock('@/lib/china-curriculum/catalog', () => ({ getChinaTopicDetails: state.catalog }));
vi.mock('@/components/learning/multiplication-pilot', () => ({ MultiplicationPilot: () => null }));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error('redirect:' + path);
  },
}));
import Page from '@/app/school-learning/china/multiplication-lab/page';
describe('shared reviewed trial access', () => {
  beforeEach(() => {
    state.user = { id: 'learner' };
    state.role = 'student';
    state.catalog.mockReset();
  });
  for (const role of ['parent', 'teacher', 'admin'])
    it(`allows ${role} to preview without private bank data or a learner identity`, async () => {
      state.role = role;
      const page = await Page();
      expect(page.props.preview).toBe(true);
      expect(page.props.questions).toEqual([]);
      expect(state.catalog).not.toHaveBeenCalled();
    });
  it('uses the same prepared course for another student while stripping answer keys', async () => {
    state.user = { id: 'friend-student' };
    state.catalog.mockResolvedValue({
      questions: [
        { id: 'cnm_p038_q2', prompt: 'Question', answer: '6' },
        { id: 'not-used', prompt: 'Other', answer: 'secret' },
      ],
    });
    const page = await Page();
    expect(page.props.preview).toBeUndefined();
    expect(page.props.questions).toEqual([{ id: 'cnm_p038_q2', prompt: 'Question' }]);
    expect(state.catalog).toHaveBeenCalledWith('cnm_p038');
  });
  it('retains sign-in for the shared trial, without exposing anyone’s saved session', async () => {
    state.user = null;
    await expect(Page()).rejects.toThrow('redirect:/login');
    expect(state.catalog).not.toHaveBeenCalled();
  });
});
