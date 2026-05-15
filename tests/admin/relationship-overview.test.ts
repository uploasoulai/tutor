import { describe, expect, it } from 'vitest';

import { buildRelationshipOverview } from '@/lib/admin/relationship-overview';

describe('buildRelationshipOverview', () => {
  it('counts links and missing relationships without exposing profile data', () => {
    const overview = buildRelationshipOverview({
      studentIds: ['student-1', 'student-2', 'student-3'],
      parentIds: ['parent-1'],
      teacherIds: ['teacher-1', 'teacher-2'],
      parentLinks: [{ student_id: 'student-1', parent_id: 'parent-1' }],
      teacherLinks: [
        { student_id: 'student-1', teacher_id: 'teacher-1' },
        { student_id: 'student-2', teacher_id: 'teacher-2' },
      ],
    });

    expect(overview).toEqual({
      students: 3,
      parents: 1,
      teachers: 2,
      parentLinks: 1,
      teacherLinks: 2,
      studentsWithoutParent: 2,
      studentsWithoutTeacher: 1,
    });
  });
});
