import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createTutorAlertForLesson } from '@/lib/reports/tutor-alerts';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type LessonAttemptInput = {
  studentId: string;
  sessionId: string;
  outcomeId?: string | null;
  isCorrect: boolean;
  attemptNumber: number;
  correctCount: number;
  responseLatencyMs?: number;
  hintLevelUsed?: number;
  activity?: LessonActivityProgressInput;
};

export type LessonAttemptResult = {
  xpEarned: number;
  masteryLevel: number | null;
  attempts: number;
  correctAttempts: number;
  progress?: LessonProgressState;
};

export type LessonCompleteInput = {
  studentId: string;
  sessionId: string;
  xpEarned: number;
  correctCount: number;
  attempts: number;
  durationSeconds?: number;
  reason: string;
};

export type LessonActivityProgressInput = {
  type: 'quiz' | 'widget';
  index: number;
  id: string;
  value?: string | number | boolean | null;
};

export type LessonProgressItem = {
  type: 'quiz' | 'widget';
  index: number;
  id: string;
  isCorrect: boolean;
  value?: string | number | boolean | null;
  updatedAt: string;
};

export type LessonProgressState = {
  version: 1;
  attempts: number;
  correct: number;
  quiz: Record<string, LessonProgressItem>;
  widgets: Record<string, LessonProgressItem>;
  updatedAt: string;
};

export function calculateAttemptXp(isCorrect: boolean, hintLevelUsed = 0) {
  return Math.max(2, (isCorrect ? 12 : 4) - hintLevelUsed * 2);
}

export function calculateMasteryLevel({
  correctCount,
  attempts,
}: {
  correctCount: number;
  attempts: number;
}) {
  if (attempts <= 0) return 0;

  const accuracy = correctCount / attempts;
  const practiceBoost = Math.min(0.18, attempts * 0.04);
  return Math.min(1, Math.max(0.05, 0.22 + accuracy * 0.55 + practiceBoost));
}

function isUuid(value: string | null | undefined) {
  return !!value && UUID_RE.test(value);
}

export function mergeLessonProgress({
  activity,
  correctCount,
  existingProgress,
  isCorrect,
  attemptNumber,
  now = new Date().toISOString(),
}: {
  activity?: LessonActivityProgressInput;
  correctCount: number;
  existingProgress?: Partial<LessonProgressState> | null;
  isCorrect: boolean;
  attemptNumber: number;
  now?: string;
}): LessonProgressState {
  const base: LessonProgressState = {
    version: 1,
    attempts: Math.max(1, attemptNumber),
    correct: Math.max(0, Math.min(correctCount, Math.max(1, attemptNumber))),
    quiz: existingProgress?.quiz ?? {},
    widgets: existingProgress?.widgets ?? {},
    updatedAt: now,
  };

  if (!activity) return base;

  const item: LessonProgressItem = {
    type: activity.type,
    index: activity.index,
    id: activity.id,
    isCorrect,
    value: activity.value,
    updatedAt: now,
  };

  return {
    ...base,
    quiz: activity.type === 'quiz' ? { ...base.quiz, [activity.id]: item } : base.quiz,
    widgets: activity.type === 'widget' ? { ...base.widgets, [activity.id]: item } : base.widgets,
  };
}

async function resolveSessionContext(sessionId: string, requestedOutcomeId?: string | null) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('bc_outcome_ids,lesson_payload')
    .eq('id', sessionId)
    .maybeSingle();

  if (error) throw error;
  return {
    outcomeId: isUuid(requestedOutcomeId)
      ? requestedOutcomeId
      : ((data?.bc_outcome_ids?.[0] as string | undefined) ?? null),
    lessonPayload: (data?.lesson_payload as Record<string, unknown> | null | undefined) ?? null,
  };
}

export async function recordLessonAttempt({
  studentId,
  sessionId,
  outcomeId,
  isCorrect,
  attemptNumber,
  correctCount,
  responseLatencyMs,
  hintLevelUsed = isCorrect ? 0 : 1,
  activity,
}: LessonAttemptInput): Promise<LessonAttemptResult> {
  const supabase = createSupabaseAdminClient();
  const sessionContext = await resolveSessionContext(sessionId, outcomeId);
  const resolvedOutcomeId = sessionContext.outcomeId;
  const xpEarned = calculateAttemptXp(isCorrect, hintLevelUsed);
  const safeAttempts = Math.max(1, attemptNumber);
  const safeCorrectCount = Math.max(0, Math.min(correctCount, safeAttempts));
  const masteryLevel = resolvedOutcomeId
    ? calculateMasteryLevel({ correctCount: safeCorrectCount, attempts: safeAttempts })
    : null;

  const { error: attemptError } = await supabase.from('question_attempts').insert({
    session_id: sessionId,
    student_id: studentId,
    outcome_id: resolvedOutcomeId,
    is_correct: isCorrect,
    attempt_number: safeAttempts,
    hint_level_used: hintLevelUsed,
    response_latency_ms: responseLatencyMs ?? 12000 + safeAttempts * 1500,
    ai_feedback: isCorrect
      ? 'Strong strategy and clear explanation.'
      : 'Needs another scaffolded example.',
  });

  if (attemptError) throw attemptError;

  const progress = mergeLessonProgress({
    activity,
    correctCount: safeCorrectCount,
    existingProgress: sessionContext.lessonPayload?.progress as Partial<LessonProgressState> | null,
    isCorrect,
    attemptNumber: safeAttempts,
  });

  if (sessionContext.lessonPayload) {
    const { error: progressError } = await supabase
      .from('learning_sessions')
      .update({
        lesson_payload: {
          ...sessionContext.lessonPayload,
          progress,
        },
      })
      .eq('id', sessionId)
      .eq('student_id', studentId);

    if (progressError) throw progressError;
  }

  if (resolvedOutcomeId && masteryLevel != null) {
    const { error: masteryError } = await supabase.from('student_mastery').upsert(
      {
        student_id: studentId,
        outcome_id: resolvedOutcomeId,
        mastery_level: masteryLevel,
        attempts: safeAttempts,
        correct_attempts: safeCorrectCount,
        consecutive_correct: isCorrect ? safeCorrectCount : 0,
        next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
      { onConflict: 'student_id,outcome_id' },
    );

    if (masteryError) throw masteryError;
  }

  return {
    xpEarned,
    masteryLevel,
    attempts: safeAttempts,
    correctAttempts: safeCorrectCount,
    progress,
  };
}

export async function completeLessonSession({
  studentId,
  sessionId,
  xpEarned,
  correctCount,
  attempts,
  durationSeconds = 120,
  reason,
}: LessonCompleteInput) {
  const supabase = createSupabaseAdminClient();
  const safeAttempts = Math.max(1, attempts);
  const accuracyRate = Math.max(0, Math.min(1, correctCount / safeAttempts));

  const { data: existing, error: readError } = await supabase
    .from('learning_sessions')
    .select('status,xp_earned')
    .eq('id', sessionId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (readError) throw readError;
  if (!existing) throw new Error('Learning session not found');

  const alreadyCompleted = existing.status === 'completed';
  const finalXp = alreadyCompleted ? Number(existing.xp_earned ?? 0) : xpEarned;

  if (!alreadyCompleted) {
    const { error: updateError } = await supabase
      .from('learning_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        accuracy_rate: accuracyRate,
        emotion_trajectory: [
          { t: 0, state: 'curious' },
          { t: 60, state: accuracyRate >= 0.67 ? 'confident' : 'needs_support' },
        ],
        xp_earned: finalXp,
        needs_tutor_review: accuracyRate < 0.5,
      })
      .eq('id', sessionId)
      .eq('student_id', studentId);

    if (updateError) throw updateError;

    if (finalXp > 0) {
      const { error: xpError } = await supabase.from('xp_transactions').insert({
        student_id: studentId,
        amount: finalXp,
        reason,
      });

      if (xpError) throw xpError;
    }

    if (accuracyRate < 0.5 || (durationSeconds < 45 && safeAttempts <= 1)) {
      try {
        await createTutorAlertForLesson({
          studentId,
          correctCount,
          attempts: safeAttempts,
          accuracyRate,
          durationSeconds,
        });
      } catch (error) {
        console.warn('Tutor alert creation failed', error);
      }
    }
  }

  return {
    completed: true,
    alreadyCompleted,
    xpEarned: finalXp,
    accuracyRate,
    needsTutorReview: accuracyRate < 0.5,
  };
}
