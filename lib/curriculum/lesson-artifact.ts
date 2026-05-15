import { nanoid } from 'nanoid';
import type { BCCurriculumMatch } from '@/lib/curriculum/search';
import { searchBCCurriculum } from '@/lib/curriculum/search';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type LessonArtifactRequest = {
  studentId: string;
  grade: string;
  subject: string;
  title: string;
  outcomeId?: string;
  outcomeCode?: string;
  sessionId?: string;
};

export type LessonPayload = {
  version: 1;
  prompt: string;
  bc_context: {
    grade: string;
    subject: string;
    outcome_code: string;
    knowledge_point: string;
    matches: BCCurriculumMatch[];
  };
  slides: { title: string; body: string; voiceCue: string }[];
  quiz: { prompt: string; answer: string; outcomeCode?: string }[];
  generator: {
    type: 'structured-local';
    retrieval: 'voyage-query-pgvector';
    estimatedDurationSeconds: number;
  };
  openmaic?: OpenMAICLessonJob;
};

export type LessonArtifact = {
  sessionId: string;
  lessonId: string;
  reused: boolean;
  payload: LessonPayload;
};

export type OpenMAICLessonJob = {
  jobId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  pollUrl: string;
  pollIntervalMs: number;
  requirement: string;
  classroomUrl?: string;
  classroomId?: string;
  createdAt: string;
};

export function buildLessonReuseKey({
  studentId,
  grade,
  subject,
  outcomeCode,
  title,
}: Pick<LessonArtifactRequest, 'studentId' | 'grade' | 'subject' | 'outcomeCode' | 'title'>) {
  return `${studentId}:${grade}:${subject}:${outcomeCode || title}`;
}

export function buildOpenMAICRequirement(payload: LessonPayload) {
  const context = payload.bc_context.matches
    .slice(0, 3)
    .map(
      (match, index) =>
        `${index + 1}. ${match.outcome_code} — ${match.content_knowledge ?? 'BC outcome'}\n${
          match.elaboration || match.chunk_text || 'No elaboration available.'
        }`,
    )
    .join('\n\n');
  const quiz = payload.quiz
    .map((item, index) => `${index + 1}. ${item.prompt} Expected answer: ${item.answer}`)
    .join('\n');

  return `Create a Grade 2-first OpenMAIC interactive classroom lesson.

Audience:
- Grade: ${payload.bc_context.grade}
- Subject: ${payload.bc_context.subject}
- Knowledge point: ${payload.bc_context.knowledge_point}
- BC outcome: ${payload.bc_context.outcome_code || 'Use the strongest matched BC outcome'}

Duration and structure:
- Target length: about 2 minutes
- Generate 3 concise scenes: warm intro, guided practice, quick quiz
- Keep all wording age-appropriate for Grade 2
- Use concrete examples, visual representations, and gentle tutor feedback
- Include a short Rive-avatar-friendly teacher narration cue for each scene
- Include the quiz checks below and make the learner answer actively

BC curriculum context:
${context || 'Use the selected BC outcome and Grade 2 Math expectations as source of truth.'}

Required quiz checks:
${quiz}

Personalization:
- Prefer a patient coach tone
- If the student struggles, offer one scaffold instead of giving the final answer immediately
- Update mastery from quiz performance after the lesson in CoastalTutor`;
}

export function buildLessonPayloadFromMatches({
  grade,
  subject,
  title,
  outcomeCode = '',
  matches,
}: {
  grade: string;
  subject: string;
  title: string;
  outcomeCode?: string;
  matches: BCCurriculumMatch[];
}): LessonPayload {
  const primary = matches[0];
  const contextLines = matches
    .slice(0, 3)
    .map(
      (match, index) =>
        `${index + 1}. ${match.content_knowledge ?? match.outcome_code}: ${
          match.elaboration?.slice(0, 420) ?? 'No elaboration available.'
        }`,
    )
    .join('\n');
  const focusedTitle = primary?.content_knowledge ?? title;
  const selectedOutcomeCode = outcomeCode || primary?.outcome_code || '';

  return {
    version: 1,
    bc_context: {
      grade,
      subject,
      outcome_code: selectedOutcomeCode,
      knowledge_point: focusedTitle,
      matches,
    },
    prompt: `Create a 2 minute ${grade} ${subject} lesson for ${focusedTitle}. Use the Voyage query-retrieved BC curriculum context below. Include short slides, voiceover cues, a warm tutor persona, one worked example, and a 3 question quiz.\n\nBC context:\n${contextLines || 'Use the selected BC learning outcome as the source of truth.'}`,
    slides: [
      {
        title: focusedTitle,
        body: `Connect ${focusedTitle} to a concrete Grade 2 example. Keep the explanation short and invite the student to say what they notice.`,
        voiceCue: 'Warm, curious, and slow enough for a Grade 2 learner.',
      },
      {
        title: 'Try it together',
        body:
          primary?.elaboration?.slice(0, 220) ||
          'Use drawings, objects, number lines, or a short story to make the idea visible.',
        voiceCue: 'Ask one question, pause, then model one strategy.',
      },
      {
        title: 'Quick check',
        body: 'Ask three short questions. Update mastery and XP after each answer, then save a session snapshot.',
        voiceCue: 'Celebrate effort and name the next tiny step.',
      },
    ],
    quiz: [
      {
        prompt: `What is one way to show ${focusedTitle}?`,
        answer: 'Use a drawing, objects, a number line, or a number sentence.',
        outcomeCode: selectedOutcomeCode,
      },
      {
        prompt: 'Which strategy would you try first?',
        answer: 'Choose a strategy and explain why it helps.',
        outcomeCode: selectedOutcomeCode,
      },
      {
        prompt: 'What should we review next?',
        answer: 'Name the part that felt hardest or slowest.',
        outcomeCode: selectedOutcomeCode,
      },
    ],
    generator: {
      type: 'structured-local',
      retrieval: 'voyage-query-pgvector',
      estimatedDurationSeconds: 120,
    },
  };
}

export function attachOpenMAICJob(
  payload: LessonPayload,
  openmaic: OpenMAICLessonJob,
): LessonPayload {
  return {
    ...payload,
    openmaic,
  };
}

export async function updateLessonOpenMAICJob({
  sessionId,
  payload,
  openmaic,
}: {
  sessionId: string;
  payload: LessonPayload;
  openmaic: OpenMAICLessonJob;
}) {
  const supabase = createSupabaseAdminClient();
  const nextPayload = attachOpenMAICJob(payload, openmaic);
  const { error } = await supabase
    .from('learning_sessions')
    .update({
      lesson_payload: nextPayload,
      coastaltutor_lesson_id: openmaic.jobId,
    })
    .eq('id', sessionId);

  if (error) throw error;
  return nextPayload;
}

export async function getOrCreateLessonArtifact({
  studentId,
  grade,
  subject,
  title,
  outcomeId,
  outcomeCode,
  sessionId,
}: LessonArtifactRequest): Promise<LessonArtifact> {
  const supabase = createSupabaseAdminClient();

  if (sessionId && UUID_RE.test(sessionId)) {
    const { data: existingById, error } = await supabase
      .from('learning_sessions')
      .select('id,coastaltutor_lesson_id,lesson_payload')
      .eq('id', sessionId)
      .eq('student_id', studentId)
      .maybeSingle();

    if (error) throw error;
    if (existingById?.lesson_payload) {
      return {
        sessionId: existingById.id,
        lessonId: existingById.coastaltutor_lesson_id,
        reused: true,
        payload: existingById.lesson_payload as LessonPayload,
      };
    }
  }

  const reuseKey = buildLessonReuseKey({ studentId, grade, subject, outcomeCode, title });
  const { data: reusable, error: reusableError } = await supabase
    .from('learning_sessions')
    .select('id,coastaltutor_lesson_id,lesson_payload')
    .eq('student_id', studentId)
    .eq('reuse_key', reuseKey)
    .not('lesson_payload', 'is', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (reusableError) throw reusableError;
  if (reusable?.lesson_payload) {
    return {
      sessionId: reusable.id,
      lessonId: reusable.coastaltutor_lesson_id,
      reused: true,
      payload: reusable.lesson_payload as LessonPayload,
    };
  }

  const { matches } = await searchBCCurriculum({
    query: `${grade} ${subject}: ${title}`,
    grade,
    subject,
    matchCount: 4,
  });
  const payload = buildLessonPayloadFromMatches({
    grade,
    subject,
    title,
    outcomeCode,
    matches,
  });
  const lessonId = `lesson-${nanoid(10)}`;
  const validOutcomeId = outcomeId && UUID_RE.test(outcomeId) ? outcomeId : matches[0]?.id;

  const { data: inserted, error: insertError } = await supabase
    .from('learning_sessions')
    .insert({
      student_id: studentId,
      session_type: 'lesson',
      coastaltutor_lesson_id: lessonId,
      bc_outcome_ids: validOutcomeId ? [validOutcomeId] : [],
      lesson_title: payload.bc_context.knowledge_point,
      lesson_payload: payload,
      reuse_key: reuseKey,
      status: 'generated',
    })
    .select('id,coastaltutor_lesson_id,lesson_payload')
    .single();

  if (insertError) throw insertError;

  return {
    sessionId: inserted.id,
    lessonId: inserted.coastaltutor_lesson_id,
    reused: false,
    payload: inserted.lesson_payload as LessonPayload,
  };
}
