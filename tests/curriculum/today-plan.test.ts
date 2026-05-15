import { describe, expect, it } from 'vitest';
import { buildFallbackTodayPlan } from '@/lib/curriculum/today-plan';

describe('Grade 2 today plan response', () => {
  it('builds a Grade 2 Math fallback plan that matches the API response contract', () => {
    const plan = buildFallbackTodayPlan({
      studentId: 'student-1',
      grade: 'Grade 2',
      subject: 'Math',
    });

    expect(plan).toMatchObject({
      studentId: 'student-1',
      grade: 'Grade 2',
      subject: 'Math',
      subjectCode: 'MATH-2',
      planSource: 'fallback',
    });
    expect(plan.goals).toHaveLength(3);
    expect(plan.goals[0].outcomeCode).toBe('MATH-2-01-number-concepts-to-100');
  });
});
