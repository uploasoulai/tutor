import { createSupabaseAdminClient } from '@/lib/supabase/admin';

type ProfileRelation =
  | { full_name?: string | null; preferred_name?: string | null }
  | { full_name?: string | null; preferred_name?: string | null }[]
  | null;

export interface ParentLinkedStudent {
  studentId: string;
  studentName: string;
  grade: string;
}

export function mapParentLinkedStudents(
  students: Array<{
    id?: string | null;
    grade_level?: number | null;
    profiles?: ProfileRelation;
  }>,
): ParentLinkedStudent[] {
  return students
    .filter((student) => student.id)
    .map((student) => {
      const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;
      return {
        studentId: String(student.id),
        studentName: profile?.preferred_name ?? profile?.full_name ?? 'Unnamed student',
        grade: student.grade_level ? `Grade ${student.grade_level}` : 'Grade 2',
      };
    })
    .sort((a, b) => a.studentName.localeCompare(b.studentName));
}

export async function listParentLinkedStudents(parentId: string): Promise<ParentLinkedStudent[]> {
  const supabase = createSupabaseAdminClient();
  const { data: links, error: linksError } = await supabase
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', parentId);

  if (linksError) {
    throw new Error(linksError.message);
  }

  const studentIds = (links ?? [])
    .map((link) => link.student_id as string | undefined)
    .filter((studentId): studentId is string => !!studentId);

  if (studentIds.length === 0) {
    return [];
  }

  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('id, grade_level, profiles(full_name, preferred_name)')
    .in('id', studentIds);

  if (studentsError) {
    throw new Error(studentsError.message);
  }

  return mapParentLinkedStudents(students ?? []);
}
