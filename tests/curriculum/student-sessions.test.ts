import { describe, expect, it } from 'vitest';

import { mapStudentSession } from '@/lib/curriculum/student-sessions';
import { MULTIPLICATION_PILOT } from '@/lib/curriculum/reviewed-lessons';

describe('mapStudentSession', () => {
  it('opens saved grade-2 media at its learner session and keeps unstarted work unscored', () => {
    const saved = mapStudentSession({
      id: 'saved-multiplication',
      status: 'planned',
      reuse_key: 'owned-reference',
      lesson_payload: { curriculumTrack: 'china', hybridLessonId: MULTIPLICATION_PILOT.id },
    });
    expect(saved.openPath).toBe(
      '/school-learning/china/multiplication-lab?sessionId=saved-multiplication',
    );
    expect(saved.canReuse).toBe(true);
    expect(saved.accuracyRate).toBeNull();
    expect(saved.activitiesCompleted).toBe(0);
  });
  it('marks reusable generated sessions', () => {
    const session = mapStudentSession({
      id: 'session-1',
      lesson_title: 'Number concepts to 100',
      status: 'generated',
      started_at: '2026-05-14T12:00:00.000Z',
      accuracy_rate: 0.678,
      xp_earned: 24,
      reuse_key: 'grade-2-math-number-concepts',
      lesson_payload: {
        progress: {
          quiz: {
            'quiz-0': { isCorrect: true },
          },
          widgets: {
            'widget-0': { isCorrect: true },
            'widget-1': { isCorrect: false },
          },
        },
        quality: {
          score: 100,
          lessonEngine: {
            score: 93,
          },
        },
      },
    });

    expect(session).toMatchObject({
      id: 'session-1',
      lessonTitle: 'Number concepts to 100',
      accuracyRate: 0.68,
      xpEarned: 24,
      activitiesCompleted: 3,
      lessonQualityScore: 100,
      lessonEngineQualityScore: 93,
      canReuse: true,
      openPath: '/student/lesson?sessionId=session-1',
    });
  });
});

it('opens a hybrid session at its saved classroom and counts only verified distinct checks', () => {
  const item = mapStudentSession({
    id: 'hybrid-session',
    status: 'completed',
    lesson_payload: {
      curriculumTrack: 'china',
      hybridLessonId: 'fractions-hybrid-v1',
      hybridAssessmentQuestionIds: ['cnm_p226_q1', 'cnm_p226_q1', 'cnm_p226_q3', 'unknown'],
    },
  });
  expect(item.openPath).toBe('/school-learning/china/fractions-lab?sessionId=hybrid-session');
  expect(item.activitiesCompleted).toBe(2);
});
it('keeps ordinary China lessons pointed at their course topic', () => {
  expect(
    mapStudentSession({
      id: 'normal',
      lesson_payload: { curriculumTrack: 'china', curriculumTopicId: 'topic' },
    }).openPath,
  ).toBe('/school-learning/china?topicId=topic');
});
it('resumes a generated China job from history using the same learner session', () => {
  expect(
    mapStudentSession({
      id: 'saved-session',
      lesson_payload: {
        curriculumTrack: 'china',
        curriculumTopicId: 'topic',
        classroomJobId: 'job',
        curriculumEditionId: 'hujiao',
      },
    }).openPath,
  ).toBe('/school-learning/china?topicId=topic&edition=hujiao&sessionId=saved-session');
});
