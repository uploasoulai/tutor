import { describe, expect, it } from 'vitest';

import { mapStudentSession } from '@/lib/curriculum/student-sessions';

describe('mapStudentSession', () => {
  it('marks reusable generated sessions', () => {
    const session = mapStudentSession({
      id: 'session-1',
      lesson_title: 'Number concepts to 100',
      status: 'generated',
      started_at: '2026-05-14T12:00:00.000Z',
      accuracy_rate: 0.678,
      xp_earned: 24,
      reuse_key: 'grade-2-math-number-concepts',
    });

    expect(session).toMatchObject({
      id: 'session-1',
      lessonTitle: 'Number concepts to 100',
      accuracyRate: 0.68,
      xpEarned: 24,
      canReuse: true,
      openPath: '/student/lesson?sessionId=session-1',
    });
  });
});
