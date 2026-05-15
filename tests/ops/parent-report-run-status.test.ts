import { describe, expect, it } from 'vitest';

import { buildParentReportRunView } from '@/lib/ops/parent-report-run-status';

describe('buildParentReportRunView', () => {
  it('summarizes a parent report batch without including report bodies', () => {
    const view = buildParentReportRunView({
      ok: true,
      checkedAt: '2026-05-15T17:30:00.000Z',
      date: '2026-05-15',
      generated: 2,
      skipped: 1,
      failed: 0,
      reports: [
        {
          id: 'report-1',
          parentId: 'parent-1',
          studentId: 'student-1',
          reportType: 'daily',
          summaryText: 'private summary',
          metrics: {
            date: '2026-05-15',
            sessionsCompleted: 1,
            learningMinutes: 10,
            averageAccuracy: 0.8,
            xpEarned: 20,
            questionsAnswered: 3,
            correctAnswers: 2,
            masteryAverage: 0.5,
            needsTutorReview: false,
            strengths: [],
            focusAreas: [],
          },
          deliveryStatus: 'generated',
          createdAt: '2026-05-15T17:30:00.000Z',
        },
      ],
      errors: [],
    });

    expect(view).toEqual({
      ok: true,
      checkedAt: '2026-05-15T17:30:00.000Z',
      date: '2026-05-15',
      generated: 2,
      skipped: 1,
      failed: 0,
      message: 'Generated 2 parent reports for 2026-05-15.',
    });
    expect(JSON.stringify(view)).not.toContain('private summary');
  });
});
