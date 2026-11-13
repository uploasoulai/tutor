import { describe, expect, it } from 'vitest';
import {
  schoolTeachingRole,
  schoolStepTokenBudget,
  schoolTeachingPrompt,
  checkSchoolScene,
} from '@/lib/server/school-teaching-policy';
import { initialSchoolGeneration } from '@/lib/server/school-generation-state';
import type { SceneOutline } from '@/lib/types/generation';
function fixture(index: number) {
  const state = initialSchoolGeneration('learner', { requirement: 'Grade 2 mathematics' });
  state.phase = 'actions';
  state.sceneIndex = index;
  state.outlines = ['slide', 'slide', 'interactive', 'slide', 'quiz', 'slide'].map(
    (type, order) => ({
      id: String(order),
      type,
      title: 'Lesson',
      description: 'Teaching step',
      keyPoints: [],
      order,
    }),
  ) as SceneOutline[];
  return state;
}
describe('School teaching depth and safe budgets', () => {
  it('protects explanatory budget while keeping opening and recap concise', () => {
    expect(schoolTeachingRole(fixture(1))).toBe('concept');
    expect(schoolTeachingRole(fixture(3))).toBe('worked-example');
    expect(schoolStepTokenBudget(fixture(1))).toBe(4096);
    expect(schoolStepTokenBudget(fixture(0))).toBe(2048);
    expect(schoolStepTokenBudget(fixture(5))).toBe(2048);
    const state = fixture(1);
    state.input.maxOutputTokens = 1200;
    expect(schoolStepTokenBudget(state)).toBe(1200);
  });
  it('does not turn a short legacy lesson’s only explanation into a greeting', () => {
    const state = fixture(0);
    state.outlines = state.outlines!.slice(0, 3);
    expect(schoolTeachingRole(state)).toBe('concept');
    expect(schoolTeachingPrompt(state)).toContain('WHY');
  });
  it('asks for worked reasoning and age adaptation without forcing childish language on older learners', () => {
    expect(schoolTeachingPrompt(fixture(3))).toContain('WHY each step');
    expect(schoolTeachingPrompt(fixture(3))).toContain('older learners');
    expect(schoolTeachingPrompt(fixture(4))).toContain('before the learner tries');
  });
  it('blocks an empty visual or absent explanation, but does not equate short content with incorrect content', () => {
    expect(
      checkSchoolScene({ elements: [] }, [{ id: 's', type: 'speech', text: 'Explanation' }]).pass,
    ).toBe(false);
    const report = checkSchoolScene({ elements: [{ id: 'a', type: 'text' }] } as never, [
      { id: 's', type: 'speech', text: 'Two equal groups.' },
    ]);
    expect(report.pass).toBe(true);
    expect(report.issues[0].severity).toBe('warning');
  });
});
