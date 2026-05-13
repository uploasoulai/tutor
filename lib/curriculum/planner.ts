import { subjectCodeFor } from '@/lib/curriculum/grade';

export type CurriculumOutcome = {
  id: string;
  outcome_code: string;
  content_knowledge: string | null;
  elaboration?: string | null;
  sequence_order: number | null;
};

export type MasteryRow = {
  outcome_id: string;
  mastery_level: number | null;
  next_review_at?: string | null;
  attempts?: number | null;
};

export type LearningSessionSummary = {
  id: string;
  bc_outcome_ids: string[] | null;
  coastaltutor_lesson_id?: string | null;
  lesson_payload?: unknown | null;
  lesson_title?: string | null;
  started_at?: string | null;
};

export type TodayGoal = {
  id: string;
  title: string;
  outcomeCode: string;
  mastery: number;
  priority: number;
  reusedSessionId?: string;
};

export function buildFallbackGoals(grade: string, subject: string): TodayGoal[] {
  const subjectCode = subjectCodeFor(grade, subject);

  if (subjectCode === 'MATH-2') {
    return [
      {
        id: 'fallback-grade-2-place-value',
        title: 'Number concepts to 100',
        outcomeCode: 'MATH-2-01-number-concepts-to-100',
        mastery: 0.26,
        priority: 1,
      },
      {
        id: 'fallback-grade-2-add-sub-facts',
        title: 'Addition and subtraction facts to 20',
        outcomeCode: 'MATH-2-02-addition-and-subtraction-facts-to-20',
        mastery: 0.34,
        priority: 2,
      },
      {
        id: 'fallback-grade-2-add-sub-100',
        title: 'Addition and subtraction to 100',
        outcomeCode: 'MATH-2-03-addition-and-subtraction-to-100',
        mastery: 0.41,
        priority: 3,
      },
    ];
  }

  return [
    {
      id: 'fallback-number-20',
      title: 'Number concepts to 20',
      outcomeCode: 'MATH-1-01-number-concepts-to-20',
      mastery: 0.28,
      priority: 1,
    },
    {
      id: 'fallback-make-10',
      title: 'Ways to make 10',
      outcomeCode: 'MATH-1-02-make-10',
      mastery: 0.42,
      priority: 2,
    },
    {
      id: 'fallback-add-sub-20',
      title: 'Addition and subtraction to 20',
      outcomeCode: 'MATH-1-03-addition-and-subtraction-to-20',
      mastery: 0.36,
      priority: 3,
    },
  ];
}

export function planTodayGoals({
  outcomes,
  masteryRows,
  sessions,
  limit = 3,
}: {
  outcomes: CurriculumOutcome[];
  masteryRows: MasteryRow[];
  sessions: LearningSessionSummary[];
  limit?: number;
}): TodayGoal[] {
  const masteryByOutcome = new Map(
    masteryRows.map((row) => [row.outcome_id, Number(row.mastery_level ?? 0)]),
  );
  const sessionByOutcome = new Map<string, LearningSessionSummary>();

  sessions.forEach((session) => {
    session.bc_outcome_ids?.forEach((outcomeId) => {
      if (!sessionByOutcome.has(outcomeId)) sessionByOutcome.set(outcomeId, session);
    });
  });

  return outcomes
    .map((outcome) => {
      const mastery = masteryByOutcome.get(outcome.id) ?? 0;
      const session = sessionByOutcome.get(outcome.id);

      return {
        id: outcome.id,
        title: outcome.content_knowledge ?? outcome.outcome_code,
        outcomeCode: outcome.outcome_code,
        mastery,
        priority: outcome.sequence_order ?? 999,
        reusedSessionId:
          session?.coastaltutor_lesson_id || session?.lesson_payload ? session.id : undefined,
      };
    })
    .sort((a, b) => a.mastery - b.mastery || a.priority - b.priority)
    .slice(0, limit)
    .map((goal, index) => ({ ...goal, priority: index + 1 }));
}
