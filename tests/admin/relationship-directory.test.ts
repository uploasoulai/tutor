import { describe, expect, it } from 'vitest';

import { buildRelationshipDirectory } from '@/lib/admin/relationship-directory';

describe('buildRelationshipDirectory', () => {
  it('maps accounts and existing links into safe directory data', () => {
    const directory = buildRelationshipDirectory({
      students: [
        {
          id: 'student-1',
          grade_level: 2,
          profiles: { preferred_name: 'Ming', full_name: 'Xiao Ming' },
        },
      ],
      parents: [{ id: 'parent-1', profiles: { full_name: 'Parent One' } }],
      teachers: [{ id: 'teacher-1', profiles: null }],
      parentLinks: [{ parent_id: 'parent-1', student_id: 'student-1' }],
      teacherLinks: [{ teacher_id: 'teacher-1', student_id: 'student-1', subjects: ['Math'] }],
    });

    expect(directory).toEqual({
      students: [{ id: 'student-1', name: 'Ming', grade: 'Grade 2' }],
      parents: [{ id: 'parent-1', name: 'Parent One' }],
      teachers: [{ id: 'teacher-1', name: 'Unnamed account' }],
      parentLinks: [{ parentId: 'parent-1', studentId: 'student-1' }],
      teacherLinks: [{ teacherId: 'teacher-1', studentId: 'student-1', subjects: ['Math'] }],
    });
  });
});
