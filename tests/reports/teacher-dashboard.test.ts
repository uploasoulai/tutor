import { describe, expect, it } from 'vitest';

import {
  buildTeacherDashboardSummary,
  buildTeacherStudentSummaries,
} from '@/lib/reports/teacher-dashboard';

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

describe('buildTeacherStudentSummaries', () => {
  it('prioritizes students with unresolved alerts and low mastery', () => {
    const students = buildTeacherStudentSummaries({
      students: [
        {
          id: 'student-a',
          grade_level: 2,
          profiles: { preferred_name: 'Ming', full_name: 'Xiao Ming' },
        },
        {
          id: 'student-b',
          grade_level: 2,
          profiles: { full_name: 'Ada Chen' },
        },
      ],
      masteryRows: [
        { student_id: 'student-a', mastery_level: 0.75 },
        { student_id: 'student-b', mastery_level: 0.25 },
      ],
      sessions: [
        { student_id: 'student-a', status: 'completed', started_at: '2026-05-14T17:00:00.000Z' },
        { student_id: 'student-a', status: 'started', started_at: '2026-05-14T18:00:00.000Z' },
        { student_id: 'student-b', status: 'completed', started_at: '2026-05-13T17:00:00.000Z' },
      ],
      unresolvedAlerts: [{ id: 'alert-1', student_id: 'student-b' }],
    });

    expect(students).toEqual([
      {
        studentId: 'student-b',
        studentName: 'Ada Chen',
        grade: 'Grade 2',
        averageMastery: 0.25,
        completedSessions: 1,
        lastActiveAt: '2026-05-13T17:00:00.000Z',
        unresolvedAlerts: 1,
      },
      {
        studentId: 'student-a',
        studentName: 'Ming',
        grade: 'Grade 2',
        averageMastery: 0.75,
        completedSessions: 1,
        lastActiveAt: '2026-05-14T18:00:00.000Z',
        unresolvedAlerts: 0,
      },
    ]);
  });

  it('keeps students with no activity visible for teacher onboarding', () => {
    const students = buildTeacherStudentSummaries({
      students: [{ id: 'student-c', grade_level: 2, profiles: null }],
      masteryRows: [],
      sessions: [],
      unresolvedAlerts: [],
    });

    expect(students).toEqual([
      {
        studentId: 'student-c',
        studentName: 'Student',
        grade: 'Grade 2',
        averageMastery: 0,
        completedSessions: 0,
        lastActiveAt: null,
        unresolvedAlerts: 0,
      },
    ]);
  });
});
