import { createClient } from '@supabase/supabase-js';
import { DEFAULT_GRADE_LEVEL, DEFAULT_SUBJECT, parseGradeLevel } from '@/lib/curriculum/grade';
import { createVoyageEmbeddings } from '@/lib/curriculum/voyage';

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

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and server key are not configured');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

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

  const supabase = getSupabaseAdminClient();
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
