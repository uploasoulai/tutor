import { describe, expect, it } from 'vitest';

import { mapParentLinkedStudents } from '@/lib/reports/parent-students';

describe('mapParentLinkedStudents', () => {
  it('maps linked students with profile names and grade labels', () => {
    expect(
      mapParentLinkedStudents([
        {
          id: 'student-2',
          grade_level: 3,
          profiles: { full_name: 'Ada Chen', preferred_name: 'Ada' },
        },
        {
          id: 'student-1',
          grade_level: 2,
          profiles: { full_name: 'Ming Li', preferred_name: null },
        },
      ]),
    ).toEqual([
      { studentId: 'student-2', studentName: 'Ada', grade: 'Grade 3' },
      { studentId: 'student-1', studentName: 'Ming Li', grade: 'Grade 2' },
    ]);
  });

  it('uses safe fallbacks for incomplete student rows', () => {
    expect(
      mapParentLinkedStudents([{ id: 'student-1', grade_level: null, profiles: null }]),
    ).toEqual([{ studentId: 'student-1', studentName: 'Unnamed student', grade: 'Grade 2' }]);
  });
});
