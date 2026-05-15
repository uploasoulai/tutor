'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
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
    slides?: { title: string; body: string }[];
    quiz?: { prompt: string; answer: string }[];
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
  const [xp, setXp] = useState(0);
  const [completed, setCompleted] = useState(false);

  const quiz = useMemo(
    () =>
      session?.lesson_payload?.quiz ?? [
        {
          prompt: `Show one way to practice ${title}.`,
          answer: 'Use objects, drawings, or numbers to explain your thinking.',
        },
        {
          prompt: `How confident do you feel about ${title}?`,
          answer: 'Pick a strategy and explain it out loud.',
        },
        {
          prompt: `Try one more ${subject} example with your tutor.`,
          answer: 'Check the answer and name what changed.',
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
  }

  async function syncOpenMAICJob() {
    if (!session?.id || !UUID_RE.test(session.id)) return;

    try {
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
    }
  }

  async function buildLessonPayload() {
    return {
      bc_context: {
        grade,
        subject,
        outcome_code: outcomeCode,
        knowledge_point: title,
        matches: [],
      },
      prompt: `Create a 2 minute ${grade} ${subject} lesson for ${title}. Include BC context, a warm tutor persona, short slides, voiceover cues, and a 3 question quiz.`,
      slides: [
        {
          title,
          body: `Today we connect ${title} to a small real-life example and say our thinking out loud.`,
        },
        {
          title: 'Try it together',
          body: 'Use a drawing, objects, or a number sentence. The tutor checks emotion and confidence after each step.',
        },
        {
          title: 'Quick check',
          body: 'Three short questions update mastery and XP, then the dashboard recalculates tomorrow.',
        },
      ],
      quiz: [
        { prompt: `What is the main idea in ${title}?`, answer: 'Explain it in your own words.' },
        {
          prompt: 'Choose a strategy you can use.',
          answer: 'Draw, count, compare, or tell a story.',
        },
        { prompt: 'What should we review next?', answer: 'Pick the part that felt hardest.' },
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

  async function finishLesson() {
    if (!user || completed) return;

    const attempts = answered.filter((item) => item !== undefined).length || 1;
    const correct = answered.filter(Boolean).length;
    const accuracy = correct / attempts;

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
    const prompt =
      session?.lesson_payload?.openmaic?.requirement ??
      session?.lesson_payload?.prompt ??
      `Create an interactive lesson on ${title} for a ${grade} student aligned with BC curriculum.`;
    const generationSession = {
      sessionId: `coastaltutor-${session?.id ?? nanoid(10)}`,
      requirements: {
        requirement: prompt,
        userNickname: user?.user_metadata?.first_name ?? firstName,
        userBio: `${grade} ${subject} learner. Current focus: ${title}.`,
        webSearch: false,
        interactiveMode: true,
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#003461]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-[#e7e8e9] bg-white px-8 py-4">
        <button
          onClick={() => router.push('/student')}
          className="rounded-full p-2 text-[#727781] transition-all hover:bg-[#f0f4ff]"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-[#191c1d]">{title}</h1>
          <p className="text-sm text-[#727781]">
            {grade} · {subject} · {outcomeCode || 'BC aligned'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2 rounded-full bg-[#f0f4ff] px-3 py-1 text-sm font-semibold text-[#003461]">
          <Trophy className="h-4 w-4" />
          {xp} XP
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_340px]">
        <section className="space-y-5">
          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#003461]">2 minute lesson</p>
                <h2 className="mt-1 text-2xl font-semibold text-[#191c1d]">
                  Hi {firstName}, start here.
                </h2>
              </div>
              <button
                onClick={handleOpenGenerator}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-[#003461] px-4 text-sm font-semibold text-white hover:bg-[#002b50]"
              >
                <Sparkles className="h-4 w-4" />
                Open generator
              </button>
            </div>

            <div className="grid gap-3">
              {(session?.lesson_payload?.slides ?? []).map((slide, index) => (
                <div
                  key={slide.title}
                  className="rounded-lg border border-[#e7e8e9] bg-[#f8f9fa] p-4"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#727781]">
                    Slide {index + 1}
                  </p>
                  <h3 className="mt-1 text-base font-semibold text-[#191c1d]">{slide.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#424750]">{slide.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-[#191c1d]">Quick quiz</h2>
            <div className="mt-4 grid gap-3">
              {quiz.map((item, index) => (
                <div key={item.prompt} className="rounded-lg border border-[#e7e8e9] p-4">
                  <p className="text-sm font-semibold text-[#191c1d]">{item.prompt}</p>
                  <p className="mt-1 text-sm text-[#727781]">{item.answer}</p>
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => void answerQuestion(index, true)}
                      className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      Correct
                    </button>
                    <button
                      onClick={() => void answerQuestion(index, false)}
                      className="rounded-md border border-[#e7e8e9] px-3 py-2 text-sm font-semibold text-[#424750] hover:bg-[#f8f9fa]"
                    >
                      Needs help
                    </button>
                    {answered[index] !== undefined ? (
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                        <CheckCircle2 className="h-4 w-4" />
                        Saved
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => void finishLesson()}
              className="mt-5 inline-flex h-11 items-center gap-2 rounded-md bg-[#003461] px-5 text-sm font-semibold text-white hover:bg-[#002b50]"
            >
              <CheckCircle2 className="h-4 w-4" />
              {completed ? 'Snapshot saved' : 'Finish lesson'}
            </button>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[#003461]/10">
              <div className="flex h-24 w-24 animate-pulse items-center justify-center rounded-full bg-[#003461] text-3xl font-bold text-white">
                R
              </div>
            </div>
            <h2 className="mt-5 text-center text-lg font-semibold text-[#191c1d]">
              Rive avatar ready
            </h2>
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
