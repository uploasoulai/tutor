import { describe, expect, it } from 'vitest';
import { buildFallbackGoals, planTodayGoals } from '@/lib/curriculum/planner';
import { subjectCodeFor } from '@/lib/curriculum/grade';

describe('Grade 2 curriculum planner', () => {
  it('defaults fallback goals to Grade 2 Math priorities', () => {
    const goals = buildFallbackGoals('Grade 2', 'Math');

    expect(goals.map((goal) => goal.outcomeCode)).toEqual([
      'MATH-2-01-number-concepts-to-100',
      'MATH-2-02-addition-and-subtraction-facts-to-20',
      'MATH-2-03-addition-and-subtraction-to-100',
    ]);
  });

  it('builds Grade 2 subject codes', () => {
    expect(subjectCodeFor('Grade 2', 'Math')).toBe('MATH-2');
    expect(subjectCodeFor(2, 'Language Arts')).toBe('ELA-2');
  });

  it('selects the three lowest mastery Grade 2 outcomes and marks reusable sessions', () => {
    const goals = planTodayGoals({
      outcomes: [
        {
          id: 'place-value',
          outcome_code: 'MATH-2-01-number-concepts-to-100',
          content_knowledge: 'Number concepts to 100',
          sequence_order: 1,
        },
        {
          id: 'facts-20',
          outcome_code: 'MATH-2-02-addition-and-subtraction-facts-to-20',
          content_knowledge: 'Addition and subtraction facts to 20',
          sequence_order: 2,
        },
        {
          id: 'add-100',
          outcome_code: 'MATH-2-03-addition-and-subtraction-to-100',
          content_knowledge: 'Addition and subtraction to 100',
          sequence_order: 3,
        },
        {
          id: 'skip-counting',
          outcome_code: 'MATH-2-04-skip-counting',
          content_knowledge: 'Skip-counting by 2, 5, and 10',
          sequence_order: 4,
        },
      ],
      masteryRows: [
        { outcome_id: 'place-value', mastery_level: 0.8 },
        { outcome_id: 'facts-20', mastery_level: 0.15 },
        { outcome_id: 'add-100', mastery_level: 0.35 },
        { outcome_id: 'skip-counting', mastery_level: 0.25 },
      ],
      sessions: [
        {
          id: 'session-reuse',
          bc_outcome_ids: ['skip-counting'],
          coastaltutor_lesson_id: 'lesson-123',
        },
      ],
    });

    expect(goals.map((goal) => goal.id)).toEqual(['facts-20', 'skip-counting', 'add-100']);
    expect(goals[1]).toMatchObject({
      reusedSessionId: 'session-reuse',
      priority: 2,
    });
  });
});
