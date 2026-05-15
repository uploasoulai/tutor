import { describe, expect, it } from 'vitest';

import { buildStudentMasteryOverview } from '@/lib/curriculum/mastery-overview';

describe('buildStudentMasteryOverview', () => {
  it('merges BC outcomes with student mastery rows', () => {
    const overview = buildStudentMasteryOverview({
      grade: 'Grade 2',
      subject: 'Math',
      subjectCode: 'MATH-2',
      outcomes: [
        { id: 'outcome-1', outcome_code: 'M2-1', content_knowledge: 'Number concepts to 100' },
        { id: 'outcome-2', outcome_code: 'M2-2', content_knowledge: 'Addition facts' },
      ],
      masteryRows: [
        {
          outcome_id: 'outcome-1',
          mastery_level: 0.456,
          attempts: 3,
          next_review_at: '2026-05-16T12:00:00.000Z',
        },
      ],
    });

    expect(overview.items).toEqual([
      {
        outcomeId: 'outcome-1',
        outcomeCode: 'M2-1',
        title: 'Number concepts to 100',
        mastery: 0.46,
        attempts: 3,
        nextReviewAt: '2026-05-16T12:00:00.000Z',
      },
      {
        outcomeId: 'outcome-2',
        outcomeCode: 'M2-2',
        title: 'Addition facts',
        mastery: 0,
        attempts: 0,
        nextReviewAt: null,
      },
    ]);
  });
});
