import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface RelationshipPerson {
  id: string;
  name: string;
}

export interface RelationshipStudent extends RelationshipPerson {
  grade: string;
}

export interface RelationshipDirectory {
  students: RelationshipStudent[];
  parents: RelationshipPerson[];
  teachers: RelationshipPerson[];
  parentLinks: Array<{ parentId: string; studentId: string }>;
  teacherLinks: Array<{ teacherId: string; studentId: string; subjects: string[] }>;
}

export function buildRelationshipDirectory({
  students,
  parents,
  teachers,
  parentLinks,
  teacherLinks,
}: {
  students: Array<{
    id?: string | null;
    grade_level?: number | null;
    profiles?: ProfileRelation | ProfileRelation[] | null;
  }>;
  parents: Array<{ id?: string | null; profiles?: ProfileRelation | ProfileRelation[] | null }>;
  teachers: Array<{ id?: string | null; profiles?: ProfileRelation | ProfileRelation[] | null }>;
  parentLinks: Array<{ parent_id?: string | null; student_id?: string | null }>;
  teacherLinks: Array<{
    teacher_id?: string | null;
    student_id?: string | null;
    subjects?: string[] | null;
  }>;
}): RelationshipDirectory {
  return {
    students: students
      .map((student) => ({
        id: student.id ?? '',
        name: readProfileName(student.profiles),
        grade: student.grade_level ? `Grade ${student.grade_level}` : 'Grade 2',
      }))
      .filter((student) => !!student.id),
    parents: parents
      .map((parent) => ({
        id: parent.id ?? '',
        name: readProfileName(parent.profiles),
      }))
      .filter((parent) => !!parent.id),
    teachers: teachers
      .map((teacher) => ({
        id: teacher.id ?? '',
        name: readProfileName(teacher.profiles),
      }))
      .filter((teacher) => !!teacher.id),
    parentLinks: parentLinks
      .map((link) => ({
        parentId: link.parent_id ?? '',
        studentId: link.student_id ?? '',
      }))
      .filter((link) => !!link.parentId && !!link.studentId),
    teacherLinks: teacherLinks
      .map((link) => ({
        teacherId: link.teacher_id ?? '',
        studentId: link.student_id ?? '',
        subjects: link.subjects ?? [],
      }))
      .filter((link) => !!link.teacherId && !!link.studentId),
  };
}

export async function listRelationshipDirectory(): Promise<RelationshipDirectory> {
  const supabase = createSupabaseAdminClient();
  const [studentsResult, parentsResult, teachersResult, parentLinksResult, teacherLinksResult] =
    await Promise.all([
      supabase.from('students').select('id, grade_level, profiles(full_name, preferred_name)'),
      supabase.from('parents').select('id, profiles(full_name, preferred_name)'),
      supabase.from('teachers').select('id, profiles(full_name, preferred_name)'),
      supabase.from('parent_student_links').select('parent_id, student_id'),
      supabase.from('teacher_student_links').select('teacher_id, student_id, subjects'),
    ]);

  for (const result of [
    studentsResult,
    parentsResult,
    teachersResult,
    parentLinksResult,
    teacherLinksResult,
  ]) {
    if (result.error) {
      throw result.error;
    }
  }

  return buildRelationshipDirectory({
    students: studentsResult.data ?? [],
    parents: parentsResult.data ?? [],
    teachers: teachersResult.data ?? [],
    parentLinks: parentLinksResult.data ?? [],
    teacherLinks: teacherLinksResult.data ?? [],
  });
}

type ProfileRelation = {
  full_name?: string | null;
  preferred_name?: string | null;
};

function readProfileName(value: ProfileRelation | ProfileRelation[] | null | undefined) {
  const profile = Array.isArray(value) ? value[0] : value;

  return profile?.preferred_name ?? profile?.full_name ?? 'Unnamed account';
}
