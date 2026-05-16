import { describe, expect, it } from 'vitest';
import {
  calculateAttemptXp,
  calculateMasteryLevel,
  mergeLessonProgress,
} from '@/lib/curriculum/lesson-progress';
import {
  calculateWidgetXp,
  evaluateWidgetResult,
  type LessonWidget,
} from '@/lib/curriculum/lesson-widgets';

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

  it('scores lesson widgets with the same correctness signal shape as quiz attempts', () => {
    const tenFrame: LessonWidget = {
      kind: 'ten-frame',
      target: 7,
      max: 10,
      prompt: 'Build seven',
    };
    const numberLine: LessonWidget = {
      kind: 'number-line',
      min: 0,
      max: 100,
      step: 10,
      target: 70,
      prompt: 'Find seventy',
    };
    const choiceCard: LessonWidget = {
      kind: 'choice-card',
      prompt: 'Choose a strategy',
      choices: ['Draw it', 'Guess'],
      correctChoice: 'Draw it',
    };

    expect(evaluateWidgetResult(tenFrame, 7)).toBe(true);
    expect(evaluateWidgetResult(tenFrame, 6)).toBe(false);
    expect(evaluateWidgetResult(numberLine, 80)).toBe(true);
    expect(evaluateWidgetResult(numberLine, 50)).toBe(false);
    expect(evaluateWidgetResult(choiceCard, 'Draw it')).toBe(true);
    expect(calculateWidgetXp(true)).toBeGreaterThan(calculateWidgetXp(false));
  });

  it('merges quiz and widget attempts into reusable lesson progress', () => {
    const first = mergeLessonProgress({
      activity: { type: 'widget', index: 0, id: 'widget-0', value: 7 },
      correctCount: 1,
      isCorrect: true,
      attemptNumber: 1,
      now: '2026-05-15T00:00:00.000Z',
    });
    const next = mergeLessonProgress({
      activity: { type: 'quiz', index: 0, id: 'quiz-0', value: 'Draw it' },
      correctCount: 2,
      existingProgress: first,
      isCorrect: true,
      attemptNumber: 2,
      now: '2026-05-15T00:01:00.000Z',
    });

    expect(next.attempts).toBe(2);
    expect(next.correct).toBe(2);
    expect(next.widgets['widget-0']).toMatchObject({ isCorrect: true, value: 7 });
    expect(next.quiz['quiz-0']).toMatchObject({ isCorrect: true, value: 'Draw it' });
  });
});
