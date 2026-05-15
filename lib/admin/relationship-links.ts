import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type RelationshipLinkKind = 'parent' | 'teacher';

export interface RelationshipLinkResult {
  kind: RelationshipLinkKind;
  studentId: string;
  accountId: string;
  subjects: string[];
}

export function normalizeRelationshipSubjects(subjects?: string[]) {
  return [...new Set((subjects ?? []).map((subject) => subject.trim()).filter(Boolean))];
}

export function relationshipSubjectsOrDefault(subjects?: string[]) {
  const normalizedSubjects = normalizeRelationshipSubjects(subjects);
  return normalizedSubjects.length ? normalizedSubjects : ['Math'];
}

export async function createParentStudentLink({
  parentId,
  studentId,
}: {
  parentId: string;
  studentId: string;
}): Promise<RelationshipLinkResult> {
  const supabase = createSupabaseAdminClient();
  await assertRowExists('parents', parentId, 'Parent account not found');
  await assertRowExists('students', studentId, 'Student account not found');

  const { error } = await supabase.from('parent_student_links').upsert(
    {
      parent_id: parentId,
      student_id: studentId,
    },
    { onConflict: 'parent_id,student_id' },
  );

  if (error) {
    throw error;
  }

  return {
    kind: 'parent',
    studentId,
    accountId: parentId,
    subjects: [],
  };
}

export async function createTeacherStudentLink({
  teacherId,
  studentId,
  subjects,
}: {
  teacherId: string;
  studentId: string;
  subjects?: string[];
}): Promise<RelationshipLinkResult> {
  const supabase = createSupabaseAdminClient();
  await assertRowExists('teachers', teacherId, 'Teacher account not found');
  await assertRowExists('students', studentId, 'Student account not found');

  const linkSubjects = relationshipSubjectsOrDefault(subjects);
  const { error } = await supabase.from('teacher_student_links').upsert(
    {
      teacher_id: teacherId,
      student_id: studentId,
      subjects: linkSubjects,
    },
    { onConflict: 'teacher_id,student_id' },
  );

  if (error) {
    throw error;
  }

  return {
    kind: 'teacher',
    studentId,
    accountId: teacherId,
    subjects: linkSubjects,
  };
}

export async function deleteParentStudentLink({
  parentId,
  studentId,
}: {
  parentId: string;
  studentId: string;
}): Promise<RelationshipLinkResult> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('parent_student_links')
    .delete()
    .eq('parent_id', parentId)
    .eq('student_id', studentId);

  if (error) {
    throw error;
  }

  return {
    kind: 'parent',
    studentId,
    accountId: parentId,
    subjects: [],
  };
}

export async function deleteTeacherStudentLink({
  teacherId,
  studentId,
}: {
  teacherId: string;
  studentId: string;
}): Promise<RelationshipLinkResult> {
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from('teacher_student_links')
    .delete()
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId);

  if (error) {
    throw error;
  }

  return {
    kind: 'teacher',
    studentId,
    accountId: teacherId,
    subjects: [],
  };
}

async function assertRowExists(
  table: 'parents' | 'teachers' | 'students',
  id: string,
  message: string,
) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.from(table).select('id').eq('id', id).maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(message);
  }
}
