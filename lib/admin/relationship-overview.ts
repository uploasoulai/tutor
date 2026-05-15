import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface RelationshipOverview {
  students: number;
  parents: number;
  teachers: number;
  parentLinks: number;
  teacherLinks: number;
  studentsWithoutParent: number;
  studentsWithoutTeacher: number;
}

export function buildRelationshipOverview({
  studentIds,
  parentIds,
  teacherIds,
  parentLinks,
  teacherLinks,
}: {
  studentIds: string[];
  parentIds: string[];
  teacherIds: string[];
  parentLinks: Array<{ student_id?: string | null; parent_id?: string | null }>;
  teacherLinks: Array<{ student_id?: string | null; teacher_id?: string | null }>;
}): RelationshipOverview {
  const studentsWithParents = new Set(
    parentLinks.map((link) => link.student_id).filter((id): id is string => !!id),
  );
  const studentsWithTeachers = new Set(
    teacherLinks.map((link) => link.student_id).filter((id): id is string => !!id),
  );

  return {
    students: studentIds.length,
    parents: parentIds.length,
    teachers: teacherIds.length,
    parentLinks: parentLinks.length,
    teacherLinks: teacherLinks.length,
    studentsWithoutParent: studentIds.filter((id) => !studentsWithParents.has(id)).length,
    studentsWithoutTeacher: studentIds.filter((id) => !studentsWithTeachers.has(id)).length,
  };
}

export async function getRelationshipOverview(): Promise<RelationshipOverview> {
  const supabase = createSupabaseAdminClient();
  const [studentsResult, parentsResult, teachersResult, parentLinksResult, teacherLinksResult] =
    await Promise.all([
      supabase.from('students').select('id'),
      supabase.from('parents').select('id'),
      supabase.from('teachers').select('id'),
      supabase.from('parent_student_links').select('student_id, parent_id'),
      supabase.from('teacher_student_links').select('student_id, teacher_id'),
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

  return buildRelationshipOverview({
    studentIds: (studentsResult.data ?? []).map((row) => row.id as string).filter(Boolean),
    parentIds: (parentsResult.data ?? []).map((row) => row.id as string).filter(Boolean),
    teacherIds: (teachersResult.data ?? []).map((row) => row.id as string).filter(Boolean),
    parentLinks: parentLinksResult.data ?? [],
    teacherLinks: teacherLinksResult.data ?? [],
  });
}
