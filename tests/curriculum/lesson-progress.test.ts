import { describe, expect, it } from 'vitest';
import { calculateAttemptXp, calculateMasteryLevel } from '@/lib/curriculum/lesson-progress';

describe('Grade 2 lesson progress scoring', () => {
  it('awards more XP for correct answers and reduces XP when hints are used', () => {
    expect(calculateAttemptXp(true)).toBe(12);
    expect(calculateAttemptXp(false)).toBe(4);
    expect(calculateAttemptXp(true, 2)).toBe(8);
    expect(calculateAttemptXp(false, 3)).toBe(2);
  });

  it('raises mastery with accuracy and practice while staying bounded', () => {
    const earlyStruggle = calculateMasteryLevel({ correctCount: 0, attempts: 1 });
    const mixedPractice = calculateMasteryLevel({ correctCount: 2, attempts: 3 });
    const strongPractice = calculateMasteryLevel({ correctCount: 5, attempts: 5 });

    expect(earlyStruggle).toBeGreaterThanOrEqual(0.05);
    expect(mixedPractice).toBeGreaterThan(earlyStruggle);
    expect(strongPractice).toBeGreaterThan(mixedPractice);
    expect(strongPractice).toBeLessThanOrEqual(1);
  });
});
