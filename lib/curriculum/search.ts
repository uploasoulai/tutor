import { DEFAULT_GRADE_LEVEL, DEFAULT_SUBJECT, parseGradeLevel } from '@/lib/curriculum/grade';
import { createVoyageEmbeddings } from '@/lib/curriculum/voyage';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type BCCurriculumMatch = {
  id: string;
  subject_id: string;
  outcome_code: string;
  big_idea: string | null;
  content_knowledge: string | null;
  elaboration: string | null;
  chunk_text: string | null;
  grade_level: number;
  subject_area: string | null;
  similarity: number;
};

export type SearchBCCurriculumOptions = {
  query: string;
  grade?: string | number;
  subject?: string;
  matchCount?: number;
};

export async function searchBCCurriculum({
  query,
  grade = DEFAULT_GRADE_LEVEL,
  subject = DEFAULT_SUBJECT,
  matchCount = 5,
}: SearchBCCurriculumOptions) {
  const gradeLevel = typeof grade === 'number' ? grade : parseGradeLevel(grade);
  const { embeddings, model } = await createVoyageEmbeddings({
    input: query,
    inputType: 'query',
  });

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.rpc('match_bc_learning_outcomes', {
    query_embedding: `[${embeddings[0].join(',')}]`,
    match_count: matchCount,
    filter_grade: gradeLevel,
    filter_subject_area: subject,
  });

  if (error) throw error;

  return {
    matches: (data ?? []) as BCCurriculumMatch[],
    embeddingModel: model,
    embeddingInputType: 'query' as const,
    gradeLevel,
    subject,
  };
}
