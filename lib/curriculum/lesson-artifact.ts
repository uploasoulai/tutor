import { nanoid } from 'nanoid';
import type { BCCurriculumMatch } from '@/lib/curriculum/search';
import { searchBCCurriculum } from '@/lib/curriculum/search';
import type { ClassroomGenerationJob } from '@/lib/server/classroom-job-store';
import { readClassroomGenerationJob } from '@/lib/server/classroom-job-store';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import {
  DEFAULT_TEACHER_PERSONA,
  formatTeacherPersonaForLessonPrompt,
  toTeacherPersonaSnapshot,
  type TeacherPersona,
  type TeacherPersonaSnapshot,
} from '@/lib/curriculum/teacher-personas';
import {
  buildGrade2MathWidgets,
  getFallbackLessonWidget,
  type LessonWidget,
} from '@/lib/curriculum/lesson-widgets';
import type { LessonProgressState } from '@/lib/curriculum/lesson-progress';
import {
  buildLessonBlueprint,
  evaluateLessonQuality,
  type LessonBlueprint,
  type LessonQualityReport,
} from '@/lib/curriculum/lesson-blueprint';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type LessonArtifactRequest = {
  studentId: string;
  grade: string;
  subject: string;
  title: string;
  outcomeId?: string;
  outcomeCode?: string;
  sessionId?: string;
  teacherPersona?: TeacherPersona;
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
  teacher: TeacherPersonaSnapshot;
  slides: {
    title: string;
    body: string;
    voiceCue: string;
    visualCue: string;
    interaction: string;
    visualSpec?: string;
    manipulativeSpec?: string;
    avatarCue?: string;
    misconceptionCheck?: string;
    repairMove?: string;
    widget: LessonWidget;
  }[];
  quiz: {
    prompt: string;
    answer: string;
    outcomeCode?: string;
    choices: string[];
    correctChoice: string;
    hint: string;
    gameType: 'choice-card' | 'strategy-pick' | 'reflection';
  }[];
  generator: {
    type: 'structured-local';
    retrieval: 'voyage-query-pgvector';
    estimatedDurationSeconds: number;
  };
  blueprint: LessonBlueprint;
  quality: LessonQualityReport;
  progress?: LessonProgressState;
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
  const teacher = payload.teacher ?? toTeacherPersonaSnapshot(DEFAULT_TEACHER_PERSONA);
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
  const blueprint = payload.blueprint;
  const blueprintScenes = blueprint.scenes
    .map(
      (scene, index) =>
        `${index + 1}. ${scene.phase}: ${scene.teachingMove}
   Visual: ${scene.visualSpec}
   Manipulative: ${scene.manipulativeSpec}
   Misconception check: ${scene.misconceptionCheck}
   Repair move: ${scene.repairMove}`,
    )
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
- Use concrete examples, visual representations, simple image prompts, and gentle tutor feedback
- Include a short Rive-avatar-friendly teacher narration cue for each scene
- Include the quiz checks below as active mini-games, not text-only slides
- Follow the instructional design blueprint exactly before adding extra decoration

BC curriculum context:
${context || 'Use the selected BC outcome and Grade 2 Math expectations as source of truth.'}

Instructional design blueprint:
- Child objective: ${blueprint.childFriendlyObjective}
- Real-world story: ${blueprint.realWorldStory}
- Worked example: ${blueprint.workedExample}
- Guided practice: ${blueprint.guidedPractice}
- Mini-game goal: ${blueprint.miniGameGoal}
- Required concrete representations: ${blueprint.concreteRepresentations.join(', ')}
- Common misconceptions: ${blueprint.commonMisconceptions.join(' | ')}

Scene blueprint:
${blueprintScenes}

Required quiz checks:
${quiz}

Personalization:
- Use the selected teacher style below
${formatTeacherPersonaForLessonPrompt(teacher)}
- If the student struggles, offer one scaffold instead of giving the final answer immediately
- Update mastery from quiz performance after the lesson in CoastalTutor`;
}

export function buildLessonPayloadFromMatches({
  grade,
  subject,
  title,
  outcomeCode = '',
  matches,
  teacherPersona,
}: {
  grade: string;
  subject: string;
  title: string;
  outcomeCode?: string;
  matches: BCCurriculumMatch[];
  teacherPersona?: TeacherPersona;
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
  const teacher = toTeacherPersonaSnapshot(teacherPersona ?? DEFAULT_TEACHER_PERSONA);
  const teacherPrompt = formatTeacherPersonaForLessonPrompt(teacher);
  const widgets = buildGrade2MathWidgets(focusedTitle);
  const blueprint = buildLessonBlueprint({
    grade,
    subject,
    title: focusedTitle,
    outcomeCode: selectedOutcomeCode,
    matches,
  });
  const quality = evaluateLessonQuality(blueprint);

  return {
    version: 1,
    bc_context: {
      grade,
      subject,
      outcome_code: selectedOutcomeCode,
      knowledge_point: focusedTitle,
      matches,
    },
    teacher,
    prompt: `Create a 2 minute ${grade} ${subject} lesson for ${focusedTitle}. Use the Voyage query-retrieved BC curriculum context below. First follow the instructional blueprint: child objective, real-world story, worked example, guided practice, mini-game check, misconception repair, and multimodal cues. Then render short slides, voiceover cues, concrete visuals, and a 3 question mini-game quiz.\n\n${teacherPrompt}\n\nInstructional blueprint:\n- Objective: ${blueprint.childFriendlyObjective}\n- Story: ${blueprint.realWorldStory}\n- Worked example: ${blueprint.workedExample}\n- Guided practice: ${blueprint.guidedPractice}\n- Mini-game: ${blueprint.miniGameGoal}\n- Misconceptions: ${blueprint.commonMisconceptions.join(' | ')}\n- Quality score target: ${quality.score}/100\n\nBC context:\n${contextLines || 'Use the selected BC learning outcome as the source of truth.'}`,
    slides: [
      {
        title: focusedTitle,
        body: `${blueprint.realWorldStory} ${blueprint.childFriendlyObjective}`,
        voiceCue: blueprint.scenes[0].voiceCue,
        visualCue: blueprint.scenes[0].visualSpec,
        interaction: blueprint.scenes[0].manipulativeSpec,
        visualSpec: blueprint.scenes[0].visualSpec,
        manipulativeSpec: blueprint.scenes[0].manipulativeSpec,
        avatarCue: blueprint.scenes[0].avatarCue,
        misconceptionCheck: blueprint.scenes[0].misconceptionCheck,
        repairMove: blueprint.scenes[0].repairMove,
        widget: widgets[0],
      },
      {
        title: 'Try it together',
        body: `${blueprint.workedExample} ${blueprint.guidedPractice}`,
        voiceCue: blueprint.scenes[1].voiceCue,
        visualCue: blueprint.scenes[1].visualSpec,
        interaction: blueprint.scenes[1].manipulativeSpec,
        visualSpec: blueprint.scenes[1].visualSpec,
        manipulativeSpec: blueprint.scenes[1].manipulativeSpec,
        avatarCue: blueprint.scenes[1].avatarCue,
        misconceptionCheck: blueprint.scenes[1].misconceptionCheck,
        repairMove: blueprint.scenes[1].repairMove,
        widget: widgets[1],
      },
      {
        title: 'Quick check',
        body: `${blueprint.miniGameGoal} Exit ticket: ${blueprint.exitTicket}`,
        voiceCue: blueprint.scenes[3].voiceCue,
        visualCue: blueprint.scenes[3].visualSpec,
        interaction: blueprint.scenes[3].manipulativeSpec,
        visualSpec: blueprint.scenes[3].visualSpec,
        manipulativeSpec: blueprint.scenes[3].manipulativeSpec,
        avatarCue: blueprint.scenes[3].avatarCue,
        misconceptionCheck: blueprint.scenes[3].misconceptionCheck,
        repairMove: blueprint.scenes[3].repairMove,
        widget: widgets[2] ?? getFallbackLessonWidget(2, focusedTitle),
      },
    ],
    quiz: [
      {
        prompt: `What is one way to show ${focusedTitle}?`,
        answer: 'Use a drawing, objects, a number line, or a number sentence.',
        outcomeCode: selectedOutcomeCode,
        choices: ['Draw it', 'Skip it', 'Guess silently'],
        correctChoice: 'Draw it',
        hint: 'Grade 2 math is easier when the idea is visible.',
        gameType: 'choice-card',
      },
      {
        prompt: 'Which strategy would you try first?',
        answer: 'Choose a strategy and explain why it helps.',
        outcomeCode: selectedOutcomeCode,
        choices: ['Use objects', 'Hide the numbers', 'Rush to the end'],
        correctChoice: 'Use objects',
        hint: 'A strategy should help you see or organize the math.',
        gameType: 'strategy-pick',
      },
      {
        prompt: 'What should we review next?',
        answer: 'Name the part that felt hardest or slowest.',
        outcomeCode: selectedOutcomeCode,
        choices: ['The tricky part', 'Nothing ever', 'Only the answer'],
        correctChoice: 'The tricky part',
        hint: 'Good learners name the next small step.',
        gameType: 'reflection',
      },
    ],
    generator: {
      type: 'structured-local',
      retrieval: 'voyage-query-pgvector',
      estimatedDurationSeconds: 120,
    },
    blueprint,
    quality,
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

export function mergeOpenMAICJobStatus(
  payload: LessonPayload,
  job: ClassroomGenerationJob | null,
): LessonPayload {
  if (!payload.openmaic || !job || payload.openmaic.jobId !== job.id) return payload;

  return {
    ...payload,
    openmaic: {
      ...payload.openmaic,
      status: job.status,
      classroomId: job.result?.classroomId ?? payload.openmaic.classroomId,
      classroomUrl: job.result?.url ?? payload.openmaic.classroomUrl,
    },
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

export async function syncLessonOpenMAICJob({
  studentId,
  sessionId,
}: {
  studentId: string;
  sessionId: string;
}) {
  const supabase = createSupabaseAdminClient();
  const { data: session, error: readError } = await supabase
    .from('learning_sessions')
    .select('id,coastaltutor_lesson_id,lesson_payload')
    .eq('id', sessionId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (readError) throw readError;
  if (!session?.lesson_payload) {
    throw new Error('Learning session not found');
  }

  const payload = session.lesson_payload as LessonPayload;
  if (!payload.openmaic?.jobId) {
    return {
      sessionId,
      synced: false,
      payload,
    };
  }

  const job = await readClassroomGenerationJob(payload.openmaic.jobId);
  const nextPayload = mergeOpenMAICJobStatus(payload, job);

  if (nextPayload !== payload) {
    const { error: updateError } = await supabase
      .from('learning_sessions')
      .update({
        lesson_payload: nextPayload,
        coastaltutor_lesson_id: nextPayload.openmaic?.classroomId ?? session.coastaltutor_lesson_id,
      })
      .eq('id', sessionId)
      .eq('student_id', studentId);

    if (updateError) throw updateError;
  }

  return {
    sessionId,
    synced: nextPayload !== payload,
    payload: nextPayload,
  };
}

export async function getOrCreateLessonArtifact({
  studentId,
  grade,
  subject,
  title,
  outcomeId,
  outcomeCode,
  sessionId,
  teacherPersona,
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
    teacherPersona,
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
