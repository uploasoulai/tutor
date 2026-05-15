import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT, subjectCodeFor } from '@/lib/curriculum/grade';
import {
  buildFallbackGoals,
  planTodayGoals,
  type CurriculumOutcome,
  type LearningSessionSummary,
  type MasteryRow,
  type TodayGoal,
} from '@/lib/curriculum/planner';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type TodayPlanSource = 'supabase' | 'fallback';

export type TodayPlan = {
  studentId: string;
  grade: string;
  subject: string;
  subjectCode: string;
  goals: TodayGoal[];
  planSource: TodayPlanSource;
};

export function buildFallbackTodayPlan({
  studentId,
  grade = DEFAULT_GRADE_LABEL,
  subject = DEFAULT_SUBJECT,
}: {
  studentId: string;
  grade?: string;
  subject?: string;
}): TodayPlan {
  return {
    studentId,
    grade,
    subject,
    subjectCode: subjectCodeFor(grade, subject),
    goals: buildFallbackGoals(grade, subject),
    planSource: 'fallback',
  };
}

export async function getTodayPlan({
  studentId,
  grade = DEFAULT_GRADE_LABEL,
  subject = DEFAULT_SUBJECT,
}: {
  studentId: string;
  grade?: string;
  subject?: string;
}): Promise<TodayPlan> {
  const fallback = buildFallbackTodayPlan({ studentId, grade, subject });
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
    .select('id,outcome_code,content_knowledge,elaboration,sequence_order')
    .eq('subject_id', subjectRow.id)
    .order('sequence_order', { ascending: true })
    .limit(30);

  if (outcomesError) throw outcomesError;
  if (!outcomes?.length) return fallback;

  const outcomeIds = outcomes.map((outcome) => outcome.id);
  const [{ data: masteryRows, error: masteryError }, { data: sessions, error: sessionsError }] =
    await Promise.all([
      supabase
        .from('student_mastery')
        .select('outcome_id,mastery_level,next_review_at,attempts')
        .eq('student_id', studentId)
        .in('outcome_id', outcomeIds),
      supabase
        .from('learning_sessions')
        .select(
          'id,bc_outcome_ids,status,coastaltutor_lesson_id,lesson_payload,lesson_title,started_at',
        )
        .eq('student_id', studentId)
        .order('started_at', { ascending: false })
        .limit(50),
    ]);

  if (masteryError) throw masteryError;
  if (sessionsError) throw sessionsError;

  const goals = planTodayGoals({
    outcomes: outcomes as CurriculumOutcome[],
    masteryRows: (masteryRows ?? []) as MasteryRow[],
    sessions: (sessions ?? []) as LearningSessionSummary[],
  });

  if (!goals.length) return fallback;

  return {
    studentId,
    grade,
    subject,
    subjectCode,
    goals,
    planSource: 'supabase',
  };
}
