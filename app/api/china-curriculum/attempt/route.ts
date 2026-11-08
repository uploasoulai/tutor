import { NextRequest } from 'next/server';

import { resolveAccountRole } from '@/lib/auth/account-role';
import { getChinaTopicDetails } from '@/lib/china-curriculum/catalog';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function normalizeAnswer(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('zh-CN')
    .replace(/[\s，,。.;；:：]/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');

    const role = await resolveAccountRole(user);
    if (role !== 'student') {
      return apiError('INVALID_REQUEST', 403, 'Only the learner can record a curriculum answer');
    }

    const body = (await request.json()) as {
      topicId?: string;
      questionId?: string;
      response?: string;
      learningSessionId?: string;
      responseLatencyMs?: number;
    };
    if (!body.topicId || !body.questionId || typeof body.response !== 'string') {
      return apiError(
        'MISSING_REQUIRED_FIELD',
        400,
        'topicId, questionId, and response are required',
      );
    }

    const details = await getChinaTopicDetails(body.topicId);
    const question = details?.questions.find((candidate) => candidate.id === body.questionId);
    if (!question) return apiError('INVALID_REQUEST', 404, 'Practice question not found');
    if (question.type === 'self') {
      return apiError('INVALID_REQUEST', 422, 'Reflection questions are not auto-graded');
    }

    if (body.learningSessionId && !UUID_RE.test(body.learningSessionId)) {
      return apiError('INVALID_REQUEST', 400, 'Invalid learning session');
    }

    const response = normalizeAnswer(body.response);
    const accepted = [question.answer, ...(question.accept ?? [])].map(normalizeAnswer);
    const correct =
      question.type === 'choice'
        ? accepted.includes(response) ||
          (question.choices ?? []).some(
            (choice) =>
              normalizeAnswer(choice.key) === response &&
              accepted.includes(normalizeAnswer(choice.key)),
          )
        : accepted.includes(response);

    const admin = createSupabaseAdminClient();
    if (body.learningSessionId) {
      const { data: session, error: sessionError } = await admin
        .from('learning_sessions')
        .select('id')
        .eq('id', body.learningSessionId)
        .eq('student_id', user.id)
        .maybeSingle();
      if (sessionError) throw sessionError;
      if (!session) return apiError('INVALID_REQUEST', 404, 'Learning session not found');
    }

    const { data: mastery, error } = await admin.rpc('record_student_curriculum_attempt', {
      p_student_id: user.id,
      p_learning_session_id: body.learningSessionId ?? null,
      p_curriculum_track: 'china',
      p_topic_id: body.topicId,
      p_question_id: body.questionId,
      p_is_correct: correct,
      p_response_latency_ms:
        typeof body.responseLatencyMs === 'number' && Number.isFinite(body.responseLatencyMs)
          ? Math.max(0, Math.round(body.responseLatencyMs))
          : null,
    });
    if (error) throw error;

    return apiSuccess({
      correct,
      explanation: question.explanation ?? null,
      mastery: Number(mastery?.mastery_level ?? 0),
      attempts: Number(mastery?.attempts ?? 0),
      correctAttempts: Number(mastery?.correct_attempts ?? 0),
    });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Could not save this answer',
    );
  }
}
