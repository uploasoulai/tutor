import { describe, expect, it } from 'vitest';
import { decideTutorAlert } from '@/lib/reports/tutor-alerts';

describe('Grade 2 tutor alert decisions', () => {
  it('raises a high priority alert after three missed questions', () => {
    const decision = decideTutorAlert({
      correctCount: 0,
      attempts: 3,
      accuracyRate: 0,
      durationSeconds: 120,
    });

    expect(decision.shouldAlert).toBe(true);
    expect(decision.alertType).toBe('triple_failure');
    expect(decision.severity).toBe('high');
  });

  it('raises a medium alert when accuracy stays below 50%', () => {
    const decision = decideTutorAlert({
      correctCount: 1,
      attempts: 4,
      accuracyRate: 0.25,
      durationSeconds: 150,
    });

    expect(decision.shouldAlert).toBe(true);
    expect(decision.alertType).toBe('triple_failure');
    expect(decision.severity).toBe('medium');
  });

  it('does not alert for a solid Grade 2 lesson', () => {
    const decision = decideTutorAlert({
      correctCount: 2,
      attempts: 3,
      accuracyRate: 0.67,
      durationSeconds: 140,
    });

    expect(decision.shouldAlert).toBe(false);
  });
});
