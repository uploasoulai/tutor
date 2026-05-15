import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT, subjectCodeFor } from '@/lib/curriculum/grade';
import { buildFallbackGoals } from '@/lib/curriculum/planner';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface StudentMasteryOverviewItem {
  outcomeId: string;
  outcomeCode: string;
  title: string;
  mastery: number;
  attempts: number;
  nextReviewAt: string | null;
}

export interface StudentMasteryOverview {
  grade: string;
  subject: string;
  subjectCode: string;
  items: StudentMasteryOverviewItem[];
  source: 'supabase' | 'fallback';
}

export function buildStudentMasteryOverview({
  grade,
  subject,
  subjectCode,
  outcomes,
  masteryRows,
}: {
  grade: string;
  subject: string;
  subjectCode: string;
  outcomes: Array<{ id: string; outcome_code?: string | null; content_knowledge?: string | null }>;
  masteryRows: Array<{
    outcome_id?: string | null;
    mastery_level?: number | null;
    attempts?: number | null;
    next_review_at?: string | null;
  }>;
}): StudentMasteryOverview {
  const masteryByOutcome = new Map(masteryRows.map((row) => [row.outcome_id, row]));

  return {
    grade,
    subject,
    subjectCode,
    source: 'supabase',
    items: outcomes.map((outcome) => {
      const mastery = masteryByOutcome.get(outcome.id);

      return {
        outcomeId: outcome.id,
        outcomeCode: outcome.outcome_code ?? 'BC outcome',
        title: outcome.content_knowledge ?? 'Grade 2 math skill',
        mastery: roundRatio(mastery?.mastery_level ?? 0),
        attempts: mastery?.attempts ?? 0,
        nextReviewAt: mastery?.next_review_at ?? null,
      };
    }),
  };
}

export function buildFallbackMasteryOverview({
  grade = DEFAULT_GRADE_LABEL,
  subject = DEFAULT_SUBJECT,
}: {
  grade?: string;
  subject?: string;
}): StudentMasteryOverview {
  const subjectCode = subjectCodeFor(grade, subject);

  return {
    grade,
    subject,
    subjectCode,
    source: 'fallback',
    items: buildFallbackGoals(grade, subject).map((goal) => ({
      outcomeId: goal.id,
      outcomeCode: goal.outcomeCode,
      title: goal.title,
      mastery: goal.mastery,
      attempts: 0,
      nextReviewAt: null,
    })),
  };
}

export async function getStudentMasteryOverview({
  studentId,
  grade = DEFAULT_GRADE_LABEL,
  subject = DEFAULT_SUBJECT,
}: {
  studentId: string;
  grade?: string;
  subject?: string;
}): Promise<StudentMasteryOverview> {
  const fallback = buildFallbackMasteryOverview({ grade, subject });
  const supabase = createSupabaseAdminClient();
  const subjectCode = subjectCodeFor(grade, subject);
  const { data: subjectRow, error: subjectError } = await supabase
    .from('bc_subjects')
    .select('id')
    .eq('code', subjectCode)
    .maybeSingle();

  if (subjectError) throw subjectError;
  if (!subjectRow?.id) return fallback;

  const { data: outcomes, error: outcomesError } = await supabase
    .from('bc_learning_outcomes')
    .select('id,outcome_code,content_knowledge,sequence_order')
    .eq('subject_id', subjectRow.id)
    .order('sequence_order', { ascending: true })
    .limit(40);

  if (outcomesError) throw outcomesError;
  if (!outcomes?.length) return fallback;

  const { data: masteryRows, error: masteryError } = await supabase
    .from('student_mastery')
    .select('outcome_id,mastery_level,attempts,next_review_at')
    .eq('student_id', studentId)
    .in(
      'outcome_id',
      outcomes.map((outcome) => outcome.id),
    );

  if (masteryError) throw masteryError;

  return buildStudentMasteryOverview({
    grade,
    subject,
    subjectCode,
    outcomes: outcomes as Array<{
      id: string;
      outcome_code?: string | null;
      content_knowledge?: string | null;
    }>,
    masteryRows: masteryRows ?? [],
  });
}

function roundRatio(value: number) {
  return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
}
