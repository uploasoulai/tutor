import { describe, expect, it } from 'vitest';

import { buildTeacherDashboardSummary } from '@/lib/reports/teacher-dashboard';

describe('buildTeacherDashboardSummary', () => {
  it('summarizes linked students, mastery, activity, and unresolved alerts', () => {
    const summary = buildTeacherDashboardSummary({
      studentIds: ['student-1', 'student-2', 'student-3'],
      masteryRows: [
        { student_id: 'student-1', mastery_level: 0.8 },
        { student_id: 'student-2', mastery_level: 0.4 },
        { student_id: 'student-3', mastery_level: 0.6 },
      ],
      sessions: [
        { student_id: 'student-1', started_at: '2026-05-14T15:00:00.000Z' },
        { student_id: 'student-1', started_at: '2026-05-14T15:10:00.000Z' },
        { student_id: 'student-3', started_at: '2026-05-14T16:00:00.000Z' },
      ],
      unresolvedAlerts: [{ id: 'alert-1' }, { id: 'alert-2' }],
    });

    expect(summary).toEqual({
      totalStudents: 3,
      averageMastery: 0.6,
      activeToday: 2,
      needsAttention: 2,
    });
  });

  it('returns zeroed stats for a teacher without linked students', () => {
    const summary = buildTeacherDashboardSummary({
      studentIds: [],
      masteryRows: [],
      sessions: [],
      unresolvedAlerts: [],
    });

    expect(summary).toEqual({
      totalStudents: 0,
      averageMastery: 0,
      activeToday: 0,
      needsAttention: 0,
    });
  });
});
