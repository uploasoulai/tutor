'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import {
  getTeacherPersonaById,
  resolveTeacherPersonaPreference,
  TEACHER_PERSONAS,
  type TeacherPersonaSnapshot,
} from '@/lib/curriculum/teacher-personas';
import { getFallbackLessonWidget, type LessonWidget } from '@/lib/curriculum/lesson-widgets';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Lightbulb,
  Loader2,
  Mic,
  Play,
  Sparkles,
  Trophy,
  Volume2,
} from 'lucide-react';
import { nanoid } from 'nanoid';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LessonSession = {
  id: string;
  coastaltutor_lesson_id: string | null;
  lesson_payload: {
    prompt?: string;
    bc_context?: {
      grade: string;
      subject: string;
      outcome_code: string;
      knowledge_point: string;
      matches?: BCCurriculumContextMatch[];
    };
    teacher?: TeacherPersonaSnapshot;
    slides?: {
      title: string;
      body: string;
      voiceCue?: string;
      visualCue?: string;
      interaction?: string;
      widget?: LessonWidget;
    }[];
    quiz?: {
      prompt: string;
      answer: string;
      choices?: string[];
      correctChoice?: string;
      hint?: string;
      gameType?: 'choice-card' | 'strategy-pick' | 'reflection';
    }[];
    openmaic?: {
      jobId: string;
      status: 'queued' | 'running' | 'succeeded' | 'failed';
      pollUrl: string;
      pollIntervalMs: number;
      requirement: string;
      classroomUrl?: string;
      classroomId?: string;
      createdAt: string;
    };
  } | null;
};

type BCCurriculumContextMatch = {
  outcome_code: string;
  content_knowledge: string | null;
  elaboration: string | null;
  similarity: number;
};

function LessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const grade = searchParams.get('grade') ?? DEFAULT_GRADE_LABEL;
  const subject = searchParams.get('subject') ?? DEFAULT_SUBJECT;
  const outcomeId = searchParams.get('outcomeId') ?? '';
  const outcomeCode = searchParams.get('outcomeCode') ?? '';
  const title = searchParams.get('title') ?? subject;
  const incomingSessionId = searchParams.get('sessionId');

  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [session, setSession] = useState<LessonSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [answered, setAnswered] = useState<boolean[]>([]);
  const [selectedChoices, setSelectedChoices] = useState<Record<number, string>>({});
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [teacherId, setTeacherId] = useState(TEACHER_PERSONAS[0].id);
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [syncingOpenMAIC, setSyncingOpenMAIC] = useState(false);

  const quiz = useMemo(
    () =>
      session?.lesson_payload?.quiz ?? [
        {
          prompt: `Show one way to practice ${title}.`,
          answer: 'Use objects, drawings, or numbers to explain your thinking.',
          choices: ['Use objects', 'Guess', 'Skip the picture'],
          correctChoice: 'Use objects',
          hint: 'Make the idea visible first.',
          gameType: 'choice-card' as const,
        },
        {
          prompt: `How confident do you feel about ${title}?`,
          answer: 'Pick a strategy and explain it out loud.',
          choices: ['Explain a strategy', 'Say only the answer', 'Move on fast'],
          correctChoice: 'Explain a strategy',
          hint: 'Explaining your strategy helps mastery grow.',
          gameType: 'strategy-pick' as const,
        },
        {
          prompt: `Try one more ${subject} example with your tutor.`,
          answer: 'Check the answer and name what changed.',
          choices: ['Name what changed', 'Hide the mistake', 'Stop early'],
          correctChoice: 'Name what changed',
          hint: 'Noticing change is part of learning.',
          gameType: 'reflection' as const,
        },
      ],
    [session?.lesson_payload?.quiz, subject, title],
  );

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }
      setTeacherId(resolveTeacherPersonaPreference(data.user.user_metadata).id);
      setUser(data.user);
      try {
        await prepareSession();
      } catch {
        setSession({
          id: `local-${Date.now()}`,
          coastaltutor_lesson_id: null,
          lesson_payload: await buildLessonPayload(),
        });
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, supabase.auth]);

  useEffect(() => {
    const openmaic = session?.lesson_payload?.openmaic;
    if (!session?.id || !UUID_RE.test(session.id) || !openmaic) return;
    if (openmaic.status === 'succeeded' || openmaic.status === 'failed') return;

    const timer = window.setInterval(() => {
      void syncOpenMAICJob();
    }, openmaic.pollIntervalMs || 5000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.lesson_payload?.openmaic?.status]);

  async function prepareSession() {
    const response = await fetch('/api/student/lesson', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grade,
        subject,
        title,
        outcomeId,
        outcomeCode,
        sessionId: incomingSessionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Lesson artifact API failed');
    }

    const artifact = (await response.json()) as {
      sessionId: string;
      lessonId: string;
      payload: LessonSession['lesson_payload'];
    };

    setSession({
      id: artifact.sessionId,
      coastaltutor_lesson_id: artifact.lessonId,
      lesson_payload: artifact.payload,
    });
    if (artifact.payload?.teacher?.id) {
      setTeacherId(artifact.payload.teacher.id);
    }
  }

  async function syncOpenMAICJob() {
    if (!session?.id || !UUID_RE.test(session.id)) return;

    try {
      setSyncingOpenMAIC(true);
      const response = await fetch('/api/student/lesson/sync-openmaic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (!response.ok) return;

      const result = (await response.json()) as {
        payload?: LessonSession['lesson_payload'];
      };

      if (result.payload) {
        setSession((current) =>
          current
            ? {
                ...current,
                lesson_payload: result.payload ?? current.lesson_payload,
              }
            : current,
        );
      }
    } catch {
      // Polling is opportunistic; the poll URL remains available for manual checks.
    } finally {
      setSyncingOpenMAIC(false);
    }
  }

  async function buildLessonPayload() {
    const selectedTeacher = getTeacherPersonaById(teacherId);
    return {
      bc_context: {
        grade,
        subject,
        outcome_code: outcomeCode,
        knowledge_point: title,
        matches: [],
      },
      teacher: {
        id: selectedTeacher.id,
        name: selectedTeacher.name,
        style: selectedTeacher.style,
        tone: selectedTeacher.tone,
        persona: selectedTeacher.persona,
        avatar: selectedTeacher.avatar,
        color: selectedTeacher.color,
        riveState: selectedTeacher.riveState,
      },
      prompt: `Create a 2 minute ${grade} ${subject} lesson for ${title}. Include BC context, a warm tutor persona, short slides, voiceover cues, and a 3 question quiz.`,
      slides: [
        {
          title,
          body: `Today we connect ${title} to a small real-life example and say our thinking out loud.`,
          voiceCue: 'Warm, curious, and slow enough for a Grade 2 learner.',
          visualCue: 'Show ten-frames, counters, or a number line that makes the idea visible.',
          interaction: 'Ask the learner to choose what they notice first.',
          widget: getFallbackLessonWidget(0, title),
        },
        {
          title: 'Try it together',
          body: 'Use a drawing, objects, or a number sentence. The tutor checks emotion and confidence after each step.',
          voiceCue: 'Ask one question, pause, then model one strategy.',
          visualCue: 'Highlight one step on a number line or with counters.',
          interaction: 'Let the learner pick a strategy card.',
          widget: getFallbackLessonWidget(1, title),
        },
        {
          title: 'Quick check',
          body: 'Three short questions update mastery and XP, then the dashboard recalculates tomorrow.',
          voiceCue: 'Celebrate effort and name the next tiny step.',
          visualCue: 'Show three compact quiz cards with success and retry states.',
          interaction: 'Turn quiz answers into tap-friendly mini-game choices.',
          widget: getFallbackLessonWidget(2, title),
        },
      ],
      quiz: [
        {
          prompt: `What is the main idea in ${title}?`,
          answer: 'Explain it in your own words.',
          choices: ['Show it with a picture', 'Only memorize words', 'Skip the example'],
          correctChoice: 'Show it with a picture',
          hint: 'A picture or model makes the idea easier to explain.',
          gameType: 'choice-card' as const,
        },
        {
          prompt: 'Choose a strategy you can use.',
          answer: 'Draw, count, compare, or tell a story.',
          choices: ['Draw or count', 'Guess quickly', 'Wait for the answer'],
          correctChoice: 'Draw or count',
          hint: 'Strategies are tools you can choose.',
          gameType: 'strategy-pick' as const,
        },
        {
          prompt: 'What should we review next?',
          answer: 'Pick the part that felt hardest.',
          choices: ['The hardest part', 'Nothing', 'Only the final answer'],
          correctChoice: 'The hardest part',
          hint: 'Naming the hard part helps your next lesson fit you.',
          gameType: 'reflection' as const,
        },
      ],
    };
  }

  async function answerQuestion(index: number, correct: boolean) {
    if (!user || answered[index] !== undefined) return;

    const nextAnswered = [...answered];
    nextAnswered[index] = correct;
    setAnswered(nextAnswered);

    const earned = correct ? 12 : 4;
    setXp((current) => current + earned);

    if (session?.id && UUID_RE.test(session.id)) {
      const correctCount = nextAnswered.filter(Boolean).length;
      const attempts = nextAnswered.filter((item) => item !== undefined).length;

      try {
        const response = await fetch('/api/student/lesson/attempt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            outcomeId: UUID_RE.test(outcomeId) ? outcomeId : undefined,
            isCorrect: correct,
            attemptNumber: attempts,
            correctCount,
            responseLatencyMs: 12000 + index * 1500,
            hintLevelUsed: correct ? 0 : 1,
          }),
        });

        if (response.ok) {
          const result = (await response.json()) as { xpEarned?: number };
          if (typeof result.xpEarned === 'number' && result.xpEarned !== earned) {
            setXp((current) => current - earned + result.xpEarned!);
          }
        }
      } catch {
        // Keep the local quiz flow moving; server persistence retries on the next answer/finish path.
      }
    }
  }

  function handleChoiceAnswer(index: number, choice: string) {
    const item = quiz[index];
    const correctChoice = item.correctChoice ?? item.choices?.[0] ?? item.answer;
    setSelectedChoices((current) => ({ ...current, [index]: choice }));
    void answerQuestion(index, choice === correctChoice);
  }

  async function handleTeacherSelect(nextTeacherId: string) {
    const nextTeacher = getTeacherPersonaById(nextTeacherId);
    setTeacherId(nextTeacher.id);
    try {
      await supabase.auth.updateUser({
        data: {
          tutor_persona_id: nextTeacher.id,
          tutor_style: nextTeacher.style,
        },
      });
    } catch {
      // Local choice still applies to this lesson; persistence can retry on the next selection.
    }
  }

  async function finishLesson() {
    if (!user || completed) return;

    const attempts = answered.filter((item) => item !== undefined).length || 1;
    const correct = answered.filter(Boolean).length;

    if (session?.id && UUID_RE.test(session.id)) {
      try {
        await fetch('/api/student/lesson/complete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: session.id,
            xpEarned: xp,
            correctCount: correct,
            attempts,
            durationSeconds: 120,
            reason: `Completed ${grade} ${subject}: ${title}`,
          }),
        });
      } catch {
        // The UI can still mark completion locally; dashboard recalculation will use saved attempts.
      }
    }

    setCompleted(true);
  }

  const handleOpenGenerator = () => {
    const classroomUrl = session?.lesson_payload?.openmaic?.classroomUrl;
    if (classroomUrl) {
      window.open(classroomUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    if (session?.lesson_payload?.openmaic?.jobId) {
      void syncOpenMAICJob();
      return;
    }

    const prompt =
      session?.lesson_payload?.openmaic?.requirement ??
      session?.lesson_payload?.prompt ??
      `Create an interactive lesson on ${title} for a ${grade} student aligned with BC curriculum.`;
    const generationSession = {
      sessionId: `coastaltutor-${session?.id ?? nanoid(10)}`,
      requirements: {
        requirement: prompt,
        userNickname: user?.user_metadata?.first_name ?? firstName,
        userBio: `${grade} ${subject} learner. Current focus: ${title}. Preferred teacher: ${teacher.name}, ${teacher.style}.`,
        webSearch: false,
        interactiveMode: false,
      },
      pdfText: '',
      pdfImages: [],
      imageStorageIds: [],
      sceneOutlines: null,
      currentStep: 'generating' as const,
    };

    sessionStorage.setItem('generationSession', JSON.stringify(generationSession));
    router.push('/generation-preview');
  };

  const openmaic = session?.lesson_payload?.openmaic;
  const firstName = user?.user_metadata?.first_name ?? 'Student';
  const slides = session?.lesson_payload?.slides ?? [];
  const currentSlide = slides[currentSlideIndex];
  const teacher = getTeacherPersonaById(teacherId);
  const attemptedCount = answered.filter((item) => item !== undefined).length;
  const correctCount = answered.filter(Boolean).length;
  const accuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;
  const masteryEstimate =
    attemptedCount > 0
      ? Math.min(100, Math.round(26 + (correctCount / attemptedCount) * 58 + attemptedCount * 4))
      : 0;
  const lessonProgress = Math.round(
    ((currentSlideIndex + (attemptedCount > 0 ? attemptedCount / Math.max(1, quiz.length) : 0)) /
      Math.max(1, slides.length + 1)) *
      100,
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#003461]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#e7e8e9] bg-white px-4 py-4 sm:gap-4 sm:px-8">
        <button
          onClick={() => router.push('/student')}
          className="rounded-full p-2 text-[#727781] transition-all hover:bg-[#f0f4ff]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg font-semibold text-[#191c1d]">{title}</h1>
          <p className="truncate text-sm text-[#727781]">
            {grade} · {subject} · {outcomeCode || 'BC aligned'}
          </p>
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-2 rounded-full bg-[#f0f4ff] px-3 py-1 text-sm font-semibold text-[#003461]">
          <Trophy className="h-4 w-4" />
          <span>{xp} XP</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-5">
          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#003461]">2 minute lesson</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#191c1d]">
                  Hi {firstName}, start here.
                </h2>
                <p className="mt-2 text-sm text-[#727781]">
                  {teacher.name} is guiding this round: {teacher.tone}.
                </p>
              </div>
              <button
                onClick={handleOpenGenerator}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#003461] px-4 text-sm font-semibold text-white hover:bg-[#002b50]"
              >
                <Sparkles className="h-4 w-4" />
                {openmaic?.classroomUrl
                  ? 'Open classroom'
                  : openmaic?.jobId
                    ? syncingOpenMAIC
                      ? 'Checking...'
                      : 'Check generation'
                    : 'Open generator'}
              </button>
            </div>

            <div className="mb-5 h-2 overflow-hidden rounded-full bg-[#e7e8e9]">
              <div
                className="h-full rounded-full bg-[#003461] transition-all"
                style={{ width: `${Math.min(100, lessonProgress)}%` }}
              />
            </div>

            {currentSlide ? (
              <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
                <div className="rounded-lg border border-[#e7e8e9] bg-[#f8f9fa] p-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#727781]">
                    Scene {currentSlideIndex + 1} of {slides.length}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#191c1d]">
                    {currentSlide.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#424750]">{currentSlide.body}</p>
                  <div className="mt-4 rounded-md bg-white p-3 text-sm text-[#424750]">
                    <p className="font-semibold text-[#003461]">Tutor cue</p>
                    <p className="mt-1">
                      {currentSlide.voiceCue ?? 'Keep the explanation warm and short.'}
                    </p>
                  </div>
                  <div className="mt-3 rounded-md bg-white p-3 text-sm text-[#424750]">
                    <p className="font-semibold text-[#003461]">Student action</p>
                    <p className="mt-1">
                      {currentSlide.interaction ?? 'Say what you notice and choose one strategy.'}
                    </p>
                  </div>
                </div>
                <LessonWidgetPanel
                  title={currentSlide.title}
                  cue={currentSlide.visualCue}
                  widget={currentSlide.widget ?? getFallbackLessonWidget(currentSlideIndex, title)}
                />
              </div>
            ) : null}

            <div className="mt-5 flex items-center justify-between">
              <button
                onClick={() => setCurrentSlideIndex((index) => Math.max(0, index - 1))}
                disabled={currentSlideIndex === 0}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#e7e8e9] px-3 text-sm font-semibold text-[#424750] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentSlideIndex((index) =>
                    Math.min(Math.max(0, slides.length - 1), index + 1),
                  )
                }
                disabled={currentSlideIndex >= slides.length - 1}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-[#e7e8e9] px-3 text-sm font-semibold text-[#424750] disabled:opacity-40"
              >
                Next scene
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#003461]">Mini-game check</p>
                <h2 className="text-lg font-semibold text-[#191c1d]">Quick quiz</h2>
              </div>
              <p className="text-sm font-semibold text-[#727781]">
                {attemptedCount}/{quiz.length} answered · {accuracy}% accuracy
              </p>
            </div>
            <div className="mt-4 grid gap-3">
              {quiz.map((item, index) => (
                <div key={item.prompt} className="rounded-lg border border-[#e7e8e9] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#191c1d]">{item.prompt}</p>
                      <p className="mt-1 text-sm text-[#727781]">{item.answer}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-[#f0f4ff] px-2.5 py-1 text-xs font-semibold text-[#003461]">
                      {item.gameType ?? 'choice-card'}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {(item.choices?.length ? item.choices : ['Correct', 'Needs help']).map(
                      (choice) => {
                        const wasSelected = selectedChoices[index] === choice;
                        const wasAnswered = answered[index] !== undefined;
                        const isCorrectChoice =
                          choice === (item.correctChoice ?? item.choices?.[0]);

                        return (
                          <button
                            key={choice}
                            onClick={() => handleChoiceAnswer(index, choice)}
                            disabled={wasAnswered}
                            className={[
                              'rounded-md border px-3 py-2 text-sm font-semibold transition-all disabled:cursor-default',
                              wasAnswered && wasSelected && isCorrectChoice
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : wasAnswered && wasSelected
                                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                                  : 'border-[#e7e8e9] text-[#424750] hover:bg-[#f8f9fa]',
                            ].join(' ')}
                          >
                            {choice}
                          </button>
                        );
                      },
                    )}
                  </div>
                  {answered[index] !== undefined ? (
                    <div className="mt-3 flex items-start gap-2 rounded-md bg-[#f8f9fa] p-3 text-sm text-[#424750]">
                      {answered[index] ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      ) : (
                        <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                      )}
                      <p>
                        {answered[index]
                          ? `${teacher.name}: Nice strategy. I saved your XP and mastery signal.`
                          : `${teacher.name}: ${item.hint ?? 'Try one scaffold, then answer again next time.'}`}
                      </p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {completed ? (
              <div className="mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-semibold text-emerald-800">Lesson snapshot saved</p>
                <p className="mt-1 text-sm text-emerald-700">
                  Accuracy {accuracy}% · estimated mastery {masteryEstimate}% · {xp} XP earned. The
                  next dashboard plan will use this signal.
                </p>
              </div>
            ) : null}

            <button
              onClick={() => void finishLesson()}
              disabled={attemptedCount === 0}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-[#003461] px-5 text-sm font-semibold text-white hover:bg-[#002b50] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {completed ? 'Snapshot saved' : 'Finish lesson'}
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[#003461]/10">
              <div
                className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-bold text-white shadow-lg transition-all"
                style={{ backgroundColor: teacher.color }}
              >
                {teacher.avatar}
              </div>
            </div>
            <h2 className="mt-5 text-center text-lg font-semibold text-[#191c1d]">
              {teacher.name}, {teacher.style}
            </h2>
            <p className="mt-1 text-center text-sm text-[#727781]">{teacher.tone}</p>
            <div className="mt-4 grid gap-2">
              {TEACHER_PERSONAS.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => void handleTeacherSelect(persona.id)}
                  className={[
                    'rounded-md border px-3 py-2 text-left text-sm font-semibold transition-all',
                    teacherId === persona.id
                      ? 'border-[#003461] bg-[#f0f4ff] text-[#003461]'
                      : 'border-[#e7e8e9] text-[#424750] hover:bg-[#f8f9fa]',
                  ].join(' ')}
                >
                  {persona.name} · {persona.style}
                </button>
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e7e8e9] px-3 py-2 text-sm font-semibold text-[#424750]">
                <Volume2 className="h-4 w-4" />
                Voice
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e7e8e9] px-3 py-2 text-sm font-semibold text-[#424750]">
                <Mic className="h-4 w-4" />
                Emotion
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#191c1d]">Learning loop</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <MetricTile label="Accuracy" value={`${accuracy}%`} />
              <MetricTile label="Mastery" value={masteryEstimate ? `${masteryEstimate}%` : '--'} />
              <MetricTile label="Answered" value={`${attemptedCount}/${quiz.length}`} />
            </div>
          </div>

          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#191c1d]">Run logic</h2>
            <ol className="mt-4 space-y-3 text-sm text-[#424750]">
              <li className="flex gap-2">
                <Play className="mt-0.5 h-4 w-4 text-[#003461]" /> Session generated or reused.
              </li>
              <li className="flex gap-2">
                <Play className="mt-0.5 h-4 w-4 text-[#003461]" /> Each answer writes mastery and
                XP.
              </li>
              <li className="flex gap-2">
                <Play className="mt-0.5 h-4 w-4 text-[#003461]" /> Finish saves the session
                snapshot.
              </li>
              <li className="flex gap-2">
                <Play className="mt-0.5 h-4 w-4 text-[#003461]" /> Next dashboard load recalculates
                goals.
              </li>
            </ol>
          </div>

          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#191c1d]">OpenMAIC engine</h2>
            {openmaic ? (
              <div className="mt-4 space-y-3">
                <div className="rounded-md bg-[#f8f9fa] p-3">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#727781]">
                    Job
                  </p>
                  <p className="mt-1 text-sm font-semibold text-[#191c1d]">{openmaic.jobId}</p>
                  <p className="mt-1 text-xs text-[#727781]">status: {openmaic.status}</p>
                </div>
                <a
                  href={openmaic.classroomUrl ?? openmaic.pollUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e7e8e9] px-3 text-sm font-semibold text-[#003461] hover:bg-[#f0f4ff]"
                >
                  <ExternalLink className="h-4 w-4" />
                  {openmaic.classroomUrl ? 'Open classroom' : 'Check generation'}
                </a>
                {openmaic.status !== 'succeeded' && openmaic.status !== 'failed' ? (
                  <button
                    onClick={() => void syncOpenMAICJob()}
                    className="ml-2 inline-flex h-9 items-center gap-2 rounded-md border border-[#e7e8e9] px-3 text-sm font-semibold text-[#424750] hover:bg-[#f8f9fa]"
                  >
                    Sync
                  </button>
                ) : null}
              </div>
            ) : (
              <p className="mt-4 text-sm text-[#727781]">
                Structured lesson is ready. OpenMAIC generation will attach when the server job is
                queued.
              </p>
            )}
          </div>

          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-[#191c1d]">BC context</h2>
            <div className="mt-4 space-y-3">
              {(session?.lesson_payload?.bc_context?.matches ?? []).slice(0, 3).map((match) => (
                <div key={match.outcome_code} className="rounded-md bg-[#f8f9fa] p-3">
                  <p className="text-xs font-semibold text-[#003461]">{match.outcome_code}</p>
                  <p className="mt-1 text-sm font-medium text-[#191c1d]">
                    {match.content_knowledge}
                  </p>
                  <p className="mt-1 text-xs text-[#727781]">
                    similarity {Math.round(match.similarity * 100)}%
                  </p>
                </div>
              ))}
              {!session?.lesson_payload?.bc_context?.matches?.length ? (
                <p className="text-sm text-[#727781]">Using selected outcome fallback.</p>
              ) : null}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

function LessonWidgetPanel({
  title,
  cue,
  widget,
}: {
  title: string;
  cue?: string;
  widget: LessonWidget;
}) {
  return (
    <div className="rounded-lg border border-[#dbe5ef] bg-white p-4">
      {widget.kind === 'ten-frame' ? <TenFrameWidget widget={widget} /> : null}
      {widget.kind === 'number-line' ? <NumberLineWidget widget={widget} /> : null}
      {widget.kind === 'choice-card' ? <ChoiceCardPreview widget={widget} /> : null}
      <div className="mt-4 rounded-md bg-[#f0f4ff] p-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#003461]">
          Visual prompt
        </p>
        <p className="mt-1 text-sm leading-5 text-[#424750]">
          {cue ?? `Make ${title} visible with counters, a number line, or a simple picture.`}
        </p>
      </div>
    </div>
  );
}

function TenFrameWidget({ widget }: { widget: Extract<LessonWidget, { kind: 'ten-frame' }> }) {
  const [count, setCount] = useState(Math.max(0, Math.min(widget.target - 2, widget.max)));
  const isMatched = count === widget.target;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[#191c1d]">{widget.prompt}</p>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: widget.max }).map((_, index) => {
          const active = index < count;
          return (
            <button
              key={index}
              type="button"
              onClick={() => setCount(index + 1)}
              className={[
                'aspect-square rounded-md border transition-all',
                active ? 'border-[#003461] bg-[#003461]' : 'border-[#c9d5df] bg-[#f8f9fa]',
              ].join(' ')}
              aria-label={`Set counter ${index + 1}`}
            />
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-[#424750]">
          {count} of {widget.target}
        </span>
        <span className={isMatched ? 'font-semibold text-emerald-700' : 'text-[#727781]'}>
          {isMatched ? 'Matched' : 'Keep tapping'}
        </span>
      </div>
    </div>
  );
}

function NumberLineWidget({ widget }: { widget: Extract<LessonWidget, { kind: 'number-line' }> }) {
  const [value, setValue] = useState(widget.min);
  const isClose = Math.abs(value - widget.target) <= widget.step;

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[#191c1d]">{widget.prompt}</p>
      <div className="rounded-lg border border-[#e7e8e9] bg-[#f8f9fa] p-4">
        <input
          type="range"
          min={widget.min}
          max={widget.max}
          step={widget.step}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          className="w-full accent-[#003461]"
          aria-label="Number line value"
        />
        <div className="mt-2 flex justify-between text-xs font-semibold text-[#727781]">
          <span>{widget.min}</span>
          <span>{widget.max}</span>
        </div>
        <div className="mt-4 rounded-md bg-white p-3 text-center">
          <p className="text-2xl font-bold text-[#191c1d]">{value}</p>
          <p
            className={
              isClose ? 'text-sm font-semibold text-emerald-700' : 'text-sm text-[#727781]'
            }
          >
            {isClose ? 'Useful benchmark' : `Try to get near ${widget.target}`}
          </p>
        </div>
      </div>
    </div>
  );
}

function ChoiceCardPreview({ widget }: { widget: Extract<LessonWidget, { kind: 'choice-card' }> }) {
  const [selected, setSelected] = useState('');

  return (
    <div>
      <p className="mb-3 text-sm font-semibold text-[#191c1d]">{widget.prompt}</p>
      <div className="grid gap-2">
        {widget.choices.map((choice) => {
          const isSelected = selected === choice;
          const isCorrect = choice === widget.correctChoice;
          return (
            <button
              key={choice}
              type="button"
              onClick={() => setSelected(choice)}
              className={[
                'rounded-md border px-3 py-2 text-left text-sm font-semibold transition-all',
                isSelected && isCorrect
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                  : isSelected
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-[#e7e8e9] text-[#424750] hover:bg-[#f8f9fa]',
              ].join(' ')}
            >
              {choice}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-[#f8f9fa] p-3 text-center">
      <p className="text-lg font-bold text-[#191c1d]">{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#727781]">
        {label}
      </p>
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
          <Loader2 className="h-8 w-8 animate-spin text-[#003461]" />
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
