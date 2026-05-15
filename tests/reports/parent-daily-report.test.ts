import { describe, expect, it } from 'vitest';
import {
  buildDailyReportMetrics,
  buildDailyReportSummary,
  mapParentReportHistoryItem,
} from '@/lib/reports/parent-daily-report';

describe('Grade 2 parent daily report', () => {
  it('aggregates sessions, attempts, mastery, and review risk', () => {
    const metrics = buildDailyReportMetrics({
      date: '2026-05-14',
      sessions: [
        {
          id: 'session-1',
          duration_seconds: 960,
          accuracy_rate: 0.67,
          xp_earned: 28,
          needs_tutor_review: false,
          status: 'completed',
        },
      ],
      attempts: [
        { is_correct: true, hint_level_used: 0 },
        { is_correct: false, hint_level_used: 1 },
        { is_correct: true, hint_level_used: 2 },
      ],
      masteryRows: [{ mastery_level: 0.4 }, { mastery_level: 0.8 }],
    });

    expect(metrics.sessionsCompleted).toBe(1);
    expect(metrics.learningMinutes).toBe(16);
    expect(metrics.averageAccuracy).toBe(0.67);
    expect(metrics.xpEarned).toBe(28);
    expect(metrics.questionsAnswered).toBe(3);
    expect(metrics.correctAnswers).toBe(2);
    expect(metrics.masteryAverage).toBe(0.6);
    expect(metrics.needsTutorReview).toBe(false);
    expect(metrics.strengths).toContain('finished the planned lesson');
    expect(metrics.focusAreas).toContain('revisit missed examples');
  });

  it('writes a parent-friendly Grade 2 summary that can be reused for delivery', () => {
    const metrics = buildDailyReportMetrics({
      date: '2026-05-14',
      sessions: [
        {
          id: 'session-1',
          duration_seconds: 1200,
          accuracy_rate: 1,
          xp_earned: 32,
          status: 'completed',
        },
      ],
      attempts: [{ is_correct: true }, { is_correct: true }],
      masteryRows: [{ mastery_level: 0.75 }],
    });

    const summary = buildDailyReportSummary({
      studentName: '小明',
      grade: 'Grade 2',
      subject: 'Math',
      metrics,
    });

    expect(summary).toContain('小明 worked on Grade 2 Math today');
    expect(summary).toContain('20 minutes');
    expect(summary).toContain('Accuracy was 100%');
    expect(summary).not.toContain('tutor review is recommended');
  });

  it('maps stored reports into parent history rows', () => {
    const item = mapParentReportHistoryItem({
      id: 'report-1',
      student_id: 'student-1',
      report_type: 'daily',
      summary_text: 'A useful Grade 2 summary',
      metrics: {
        date: '2026-05-14',
        sessionsCompleted: 1,
        learningMinutes: 12,
        averageAccuracy: 0.8,
        xpEarned: 20,
        questionsAnswered: 3,
        correctAnswers: 2,
        masteryAverage: 0.55,
        needsTutorReview: false,
        strengths: [],
        focusAreas: [],
      },
      delivery_status: 'generated',
      created_at: '2026-05-14T21:00:00.000Z',
    });

    expect(item.id).toBe('report-1');
    expect(item.metrics?.learningMinutes).toBe(12);
    expect(item.createdAt).toBe('2026-05-14T21:00:00.000Z');
  });
});
