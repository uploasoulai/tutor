'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookMarked,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ExternalLink,
  Loader2,
  Network,
  Search,
  Sparkles,
  X,
} from 'lucide-react';

import { LearningAdventure } from '@/components/learning/learning-adventure';
import { createClient } from '@/lib/supabase/client';

type Topic = {
  id: string;
  name: string;
  domain: string;
  grade: number;
  gradeLabel?: string;
  semester: string;
  chapter: string;
  type: string;
  description: string;
  mastery_criteria: string[];
  subjectId?: string;
  prerequisiteCount?: number;
  progress?: { mastery_level: number; attempts: number } | null;
  lessons?: { lessons: number; completedLessons: number };
};

type Catalog = {
  subjects: { id: string; label: string; topicCount: number }[];
  grades: { value: number; label: string }[];
  semesters: string[];
  textbooks: { id: string; label: string; status: string; topicCount: number }[];
  topics: Topic[];
  recommendedTopic: {
    id: string;
    name: string;
    chapter: string;
    gradeLabel: string;
    editionId: string;
    reason: string;
  } | null;
  total: number;
  truncated: boolean;
  progressAvailable: boolean;
};

type TopicDetails = {
  topic: Topic;
  subject: string;
  textbook: { id: string; label: string; status: string; note?: string };
  prerequisites: {
    topicId: string;
    prerequisiteId: string;
    topic: Topic | null;
    strength: 'hard' | 'soft';
    reason: string;
  }[];
  nextTopics: {
    topicId: string;
    prerequisiteId: string;
    topic: Topic | null;
    strength: 'hard' | 'soft';
    reason: string;
  }[];
  questions: {
    id: string;
    type: string;
    difficulty: string;
    prompt: string;
    explanation?: string;
    choices?: { key: string; text: string }[];
  }[];
  standards: { id: string; confidence?: string; detail?: { text?: string } | null }[];
};

type AnswerResult = {
  correct: boolean;
  explanation: string | null;
  mastery: number;
  attempts: number;
  correctAttempts: number;
};

const SUBJECT_NAMES: Record<string, string> = {
  math: '数学',
  english: '英语',
  physics: '物理',
  chinese: '语文',
  science: '科学',
  morality: '道德与法治',
  history: '历史',
  geography: '地理',
  biology: '生物学',
  chemistry: '化学',
};

export default function ChinaSchoolLearningPage() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [subject, setSubject] = useState('math');
  const [grade, setGrade] = useState(1);
  const [edition, setEdition] = useState('pep');
  const [semester, setSemester] = useState('全部');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<TopicDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [answerResult, setAnswerResult] = useState<AnswerResult | null>(null);
  const [answerLoading, setAnswerLoading] = useState(false);
  const [generation, setGeneration] = useState<{
    sessionId: string;
    pollUrl: string;
    status: string;
    jobId?: string;
    resumable?: boolean;
    message?: string;
    classroomUrl?: string;
    error?: string;
  } | null>(null);
  const [classOpened, setClassOpened] = useState(false);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [completedLesson, setCompletedLesson] = useState(false);
  const catalogRequestId = useRef(0);
  const detailRequestId = useRef(0);
  const answerRequestId = useRef(0);
  const classroomRequestId = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.replace('/login');
        return;
      }
      const savedGrade = String(data.user.user_metadata?.grade ?? '').trim();
      const gradeMatch = savedGrade.match(/(?:grade|年级)\s*(\d+)/i);
      const savedGradeNumber = gradeMatch ? Number(gradeMatch[1]) : Number(savedGrade);
      if (/^(?:k|kindergarten|幼儿园)$/i.test(savedGrade)) {
        setGrade(1);
      } else if (
        Number.isInteger(savedGradeNumber) &&
        savedGradeNumber >= 1 &&
        savedGradeNumber <= 14
      ) {
        setGrade(savedGradeNumber);
      }
      setAuthLoading(false);
    });
  }, []);

  const loadCatalog = useCallback(async () => {
    const requestId = ++catalogRequestId.current;
    setLoading(true);
    setError('');
    const params = new URLSearchParams({
      subject,
      grade: String(grade),
      limit: '600',
    });
    if (edition !== 'pep') params.set('edition', edition);
    if (semester !== '全部') params.set('semester', semester);
    if (debouncedSearch) params.set('q', debouncedSearch);
    try {
      const response = await fetch(`/api/china-curriculum?${params.toString()}`);
      const body = (await response.json()) as Catalog & { success?: boolean; error?: string };
      if (!response.ok || !body.success) throw new Error(body.error || '课程内容暂时无法加载');
      if (requestId !== catalogRequestId.current) return;
      setCatalog(body);
    } catch (loadError) {
      if (requestId === catalogRequestId.current) {
        setError(loadError instanceof Error ? loadError.message : '课程内容暂时无法加载');
      }
    } finally {
      if (requestId === catalogRequestId.current) setLoading(false);
    }
  }, [debouncedSearch, edition, grade, semester, subject]);

  useEffect(() => {
    if (!authLoading) void loadCatalog();
  }, [authLoading, loadCatalog]);

  useEffect(() => {
    if (catalog?.grades.length && !catalog.grades.some((item) => item.value === grade)) {
      setGrade(catalog.grades[0].value);
    }
  }, [catalog?.grades, grade]);

  useEffect(() => {
    if (semester !== '全部' && catalog?.semesters && !catalog.semesters.includes(semester)) {
      setSemester('全部');
    }
  }, [catalog?.semesters, semester]);

  useEffect(() => {
    if (catalog?.textbooks.length && !catalog.textbooks.some((item) => item.id === edition)) {
      setEdition('pep');
    }
  }, [catalog?.textbooks, edition]);

  const openTopic = async (topicId: string, editionId = edition, resumeSessionId?: string) => {
    answerRequestId.current += 1;
    classroomRequestId.current += 1;
    const requestId = ++detailRequestId.current;
    setDetailLoading(true);
    setAnswerLoading(false);
    setError('');
    setAnswer('');
    setAnswerResult(null);
    setQuestionIndex(0);
    setGeneration(null);
    setClassOpened(false);
    setCompletedLesson(false);
    setCompletingLesson(false);
    try {
      const params = new URLSearchParams({ topicId });
      if (editionId !== 'pep') params.set('edition', editionId);
      const response = await fetch(`/api/china-curriculum?${params.toString()}`);
      const body = (await response.json()) as TopicDetails & { success?: boolean; error?: string };
      if (!response.ok || !body.success) throw new Error(body.error || '知识点暂时无法打开');
      if (requestId !== detailRequestId.current) return;
      setSelected(body);
      if (resumeSessionId) {
        const pollUrl = `/api/china-curriculum/lesson?sessionId=${encodeURIComponent(resumeSessionId)}`;
        const savedResponse = await fetch(pollUrl, { cache: 'no-store' });
        const saved = await savedResponse.json();
        if (!savedResponse.ok || !saved.success || saved.topicId !== topicId)
          throw new Error('暂时无法恢复这节课，请从学习记录中重新打开');
        if (requestId !== detailRequestId.current) return;
        setGeneration({
          sessionId: resumeSessionId,
          pollUrl,
          jobId: saved.jobId,
          status: saved.status,
          resumable: saved.resumable,
          classroomUrl: saved.classroomUrl,
          message: saved.message,
          error: saved.error,
        });
      }
    } catch (detailError) {
      if (requestId === detailRequestId.current) {
        setError(detailError instanceof Error ? detailError.message : '知识点暂时无法打开');
      }
    } finally {
      if (requestId === detailRequestId.current) setDetailLoading(false);
    }
  };

  const closeTopic = useCallback(() => {
    answerRequestId.current += 1;
    classroomRequestId.current += 1;
    detailRequestId.current += 1;
    setDetailLoading(false);
    setAnswerLoading(false);
    setSelected(null);
  }, []);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeTopic();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeTopic, selected]);

  useEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams(window.location.search);
    const topicId = params.get('topicId');
    const editionId = params.get('edition');
    if (editionId) setEdition(editionId);
    if (topicId) void openTopic(topicId, editionId ?? 'pep', params.get('sessionId') ?? undefined);
    // Open a curriculum topic when continuing it from the shared learning history.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const topicGroups = useMemo(() => {
    const groups = new Map<string, Topic[]>();
    for (const topic of catalog?.topics ?? []) {
      const group = groups.get(topic.chapter) ?? [];
      group.push(topic);
      groups.set(topic.chapter, group);
    }
    return [...groups.entries()];
  }, [catalog?.topics]);

  const practiceQuestions =
    selected?.questions.filter((question) => question.type !== 'self') ?? [];
  const activeQuestion = practiceQuestions[questionIndex] ?? null;
  const reflectionQuestion =
    selected?.questions.find((question) => question.type === 'self') ?? null;
  const nextPrerequisite =
    selected?.prerequisites.find((edge) => edge.strength === 'hard' && edge.topic) ?? null;

  const advanceQuestion = () => {
    setQuestionIndex((index) => Math.min(index + 1, Math.max(0, practiceQuestions.length - 1)));
    setAnswer('');
    setAnswerResult(null);
  };

  const submitAnswer = async (responseValue = answer) => {
    if (!selected || !activeQuestion || !responseValue.trim()) return;
    const requestId = ++answerRequestId.current;
    setAnswerLoading(true);
    try {
      const response = await fetch('/api/china-curriculum/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selected.topic.id,
          questionId: activeQuestion.id,
          response: responseValue,
        }),
      });
      const body = (await response.json()) as AnswerResult & { success?: boolean; error?: string };
      if (!response.ok || !body.success) throw new Error(body.error || '答案暂时没有保存');
      if (requestId !== answerRequestId.current) return;
      setAnswerResult(body);
      void loadCatalog();
    } catch (submitError) {
      if (requestId === answerRequestId.current) {
        setError(submitError instanceof Error ? submitError.message : '答案暂时没有保存');
      }
    } finally {
      if (requestId === answerRequestId.current) setAnswerLoading(false);
    }
  };

  const askPersonalTutorAboutMistake = () => {
    if (!selected || !activeQuestion || !answerResult || answerResult.correct) return;
    const learnerAnswer =
      activeQuestion.choices?.find((choice) => choice.key === answer)?.text ?? answer;
    const choices = activeQuestion.choices?.length
      ? `\n选项：\n${activeQuestion.choices.map((choice) => `${choice.key}. ${choice.text}`).join('\n')}`
      : '';
    const prompt = [
      `我正在学习${selected.topic.gradeLabel ?? `第${selected.topic.grade}年级`}的${SUBJECT_NAMES[selected.subject] ?? selected.subject}，知识点是“${selected.topic.name}”。`,
      `题目：${activeQuestion.prompt}${choices}`,
      `我的回答：${learnerAnswer}`,
      '请按你的学习辅导方式帮我弄懂这道错题：先问我一个小问题，听完我的想法后再给下一步提示，不要一开始直接告诉我答案；用适合小学生的短句，一次只问一个问题。等我理解后，再给一道相似题检查我是否学会。请把这道错题和我的回答记录到我的错题本，供之后复习。',
    ].join('\n\n');
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/api/deeptutor/launch';
    form.target = '_blank';
    form.setAttribute('rel', 'noopener');
    for (const [name, value] of [
      ['mode', 'personal'],
      ['prompt', prompt],
    ]) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.append(input);
    }
    document.body.append(form);
    form.submit();
    window.setTimeout(() => form.remove(), 1000);
  };

  const startClassroom = async (forceRegenerate = false) => {
    if (!selected) return;
    const requestId = ++classroomRequestId.current;
    setClassOpened(false);
    setCompletedLesson(false);
    setGeneration({ sessionId: '', pollUrl: '', status: 'starting', message: '正在准备课堂内容…' });
    try {
      const response = await fetch('/api/china-curriculum/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: selected.topic.id,
          editionId: edition,
          ...(forceRegenerate ? { forceRegenerate: true } : {}),
        }),
      });
      const body = (await response.json()) as {
        success?: boolean;
        sessionId?: string;
        jobId?: string;
        pollUrl?: string;
        error?: string;
      };
      if (!response.ok || !body.success || !body.sessionId || !body.pollUrl) {
        throw new Error(body.error || '课堂暂时无法开始');
      }
      if (requestId !== classroomRequestId.current) return;
      setGeneration({
        sessionId: body.sessionId,
        jobId: body.jobId,
        pollUrl: body.pollUrl,
        status: 'queued',
        message: '课堂正在准备中…',
      });
      const resumeUrl = new URL(window.location.href);
      resumeUrl.searchParams.set('topicId', selected.topic.id);
      resumeUrl.searchParams.set('edition', edition);
      resumeUrl.searchParams.set('sessionId', body.sessionId);
      window.history.replaceState(window.history.state, '', resumeUrl);
      void loadCatalog();
    } catch (generationError) {
      if (requestId !== classroomRequestId.current) return;
      setGeneration({
        sessionId: '',
        pollUrl: '',
        status: 'failed',
        error: generationError instanceof Error ? generationError.message : '课堂暂时无法开始',
      });
    }
  };

  const retryClassroom = async () => {
    if (!generation?.jobId || !generation.resumable) return;
    const requestId = classroomRequestId.current;
    try {
      const response = await fetch(
        `/api/generate-classroom/${encodeURIComponent(generation.jobId)}`,
        { method: 'POST' },
      );
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || '暂时无法继续，请稍后重试');
      if (requestId !== classroomRequestId.current) return;
      setGeneration((current) =>
        current
          ? { ...current, status: 'queued', error: undefined, message: '从上次保存的地方继续…' }
          : current,
      );
    } catch (failure) {
      if (requestId !== classroomRequestId.current) return;
      setGeneration((current) =>
        current
          ? { ...current, error: failure instanceof Error ? failure.message : '暂时无法继续' }
          : current,
      );
    }
  };

  useEffect(() => {
    if (
      !generation?.sessionId ||
      !generation.pollUrl ||
      generation.classroomUrl ||
      generation.status === 'failed'
    )
      return;
    let stopped = false;
    const poll = async () => {
      try {
        const response = await fetch(generation.pollUrl, { cache: 'no-store' });
        const body = (await response.json()) as {
          success?: boolean;
          status?: string;
          jobId?: string;
          resumable?: boolean;
          message?: string;
          classroomUrl?: string;
          error?: string;
        };
        if (!response.ok || !body.success) throw new Error(body.error || '课堂状态暂时无法读取');
        if (stopped) return;
        setGeneration((current) =>
          current
            ? {
                ...current,
                status: body.status ?? current.status,
                jobId: body.jobId ?? current.jobId,
                resumable: body.resumable,
                message: body.message ?? current.message,
                classroomUrl: body.classroomUrl ?? current.classroomUrl,
                error: body.error ?? current.error,
              }
            : current,
        );
      } catch (pollError) {
        if (!stopped)
          setGeneration((current) =>
            current
              ? {
                  ...current,
                  message: pollError instanceof Error ? pollError.message : '课堂状态暂时无法读取',
                }
              : current,
          );
      }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 4000);
    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [generation?.classroomUrl, generation?.pollUrl, generation?.sessionId, generation?.status]);

  const completeClassroom = async () => {
    if (!generation?.sessionId) return;
    const sessionId = generation.sessionId;
    const topicRequestId = detailRequestId.current;
    setCompletingLesson(true);
    try {
      const response = await fetch('/api/china-curriculum/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const body = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok || !body.success) throw new Error(body.error || '学习记录暂时无法保存');
      if (topicRequestId !== detailRequestId.current || generation?.sessionId !== sessionId) return;
      setCompletedLesson(true);
      void loadCatalog();
    } catch (completeError) {
      if (topicRequestId === detailRequestId.current) {
        setError(completeError instanceof Error ? completeError.message : '学习记录暂时无法保存');
      }
    } finally {
      setCompletingLesson(false);
    }
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <Loader2 className="h-8 w-8 animate-spin text-[#315c8c]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eff7ff_0%,#f7f8fc_35%,#fffaf1_100%)] px-4 py-5 text-[#20324b] sm:px-7 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <button
          onClick={() => router.push('/school-learning')}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#55708c] hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" /> 选择课程路线
        </button>

        {grade <= 3 && <LearningAdventure />}

        <header className="mt-5 rounded-[2rem] border border-white/90 bg-white/85 p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#fff0e5] text-[#bd6138]">
                <BookOpen className="h-7 w-7" />
              </span>
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.15em] text-[#bc7150]">
                  School Learning
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">中国课程学习</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#62758b] sm:text-base">
                  按年级和知识点顺序学习。先看清楚今天要学什么，再进入互动课堂、练习和复习。
                </p>
              </div>
            </div>
            <div className="rounded-2xl bg-[#f4f7fb] px-4 py-3 text-sm text-[#596c82]">
              {catalog?.progressAvailable
                ? '学习进度已同步到你的学习档案'
                : '课程可以浏览；学习进度服务暂未连接'}
            </div>
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.15fr_0.75fr_0.9fr]">
            <label className="relative block">
              <span className="sr-only">搜索知识点</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#8391a4]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="找一个知识点或章节"
                className="h-14 w-full rounded-2xl border border-[#dfe7ef] bg-white pl-12 pr-4 text-base outline-none transition focus:border-[#6e9bc4] focus:ring-2 focus:ring-[#dcecff]"
              />
            </label>
            <label className="relative block">
              <span className="sr-only">选择学科</span>
              <select
                value={subject}
                onChange={(event) => {
                  setSubject(event.target.value);
                  setEdition('pep');
                }}
                className="h-14 w-full appearance-none rounded-2xl border border-[#dfe7ef] bg-white px-4 pr-10 text-base font-semibold outline-none focus:border-[#6e9bc4]"
              >
                {(
                  catalog?.subjects ??
                  Object.entries(SUBJECT_NAMES).map(([id, label]) => ({ id, label, topicCount: 0 }))
                ).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8391a4]" />
            </label>
            <label className="relative block">
              <span className="sr-only">选择教材路线</span>
              <select
                value={edition}
                onChange={(event) => setEdition(event.target.value)}
                className="h-14 w-full appearance-none rounded-2xl border border-[#dfe7ef] bg-white px-4 pr-10 text-sm font-semibold outline-none focus:border-[#6e9bc4]"
              >
                {(
                  catalog?.textbooks ?? [
                    { id: 'pep', label: '主图谱教材版本', status: 'current', topicCount: 0 },
                  ]
                ).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                    {item.status === 'draft' ? ' · 目录草案' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8391a4]" />
            </label>
          </div>
          <div className="mt-4">
            <p className="mb-2 text-xs font-bold text-[#8190a1]">选一个年级开始</p>
            <div className="flex gap-2 overflow-x-auto pb-2" role="group" aria-label="选择年级">
              {(catalog?.grades ?? []).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={grade === item.value}
                  onClick={() => setGrade(item.value)}
                  className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition ${grade === item.value ? 'bg-[#345f91] text-white shadow-sm' : 'border border-[#dfe7ef] bg-white text-[#62758b] hover:bg-[#e9f2fb]'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {[
              '全部',
              ...(catalog?.semesters ?? []).filter((item) => item !== '上' && item !== '下'),
              '上',
              '下',
            ]
              .filter((item, index, items) => items.indexOf(item) === index)
              .map((item) => (
                <button
                  key={item}
                  onClick={() => setSemester(item)}
                  className={`min-h-11 rounded-full px-5 text-sm font-semibold transition ${semester === item ? 'bg-[#345f91] text-white shadow-sm' : 'bg-white text-[#62758b] hover:bg-[#e9f2fb]'}`}
                >
                  {item === '全部' ? '全部' : item === '全' ? '全册' : `${item}册`}
                </button>
              ))}
            <span className="ml-auto text-sm font-medium text-[#718298]">
              {catalog?.total ?? 0} 个知识点
            </span>
          </div>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800"
          >
            {error}
          </div>
        )}

        {!loading && !search.trim() && catalog?.recommendedTopic && (
          <section className="mt-5 flex flex-col gap-4 rounded-3xl border border-[#d7e7f3] bg-[linear-gradient(120deg,#e9f5ff,#f4f4ff)] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#5f82a2]">
                <Sparkles className="h-4 w-4" />
                按你的学习路线推荐
              </p>
              <h2 className="mt-2 text-xl font-bold text-[#2a4562]">
                {catalog.recommendedTopic.name}
              </h2>
              <p className="mt-1 text-sm text-[#687d93]">
                {catalog.recommendedTopic.gradeLabel} · {catalog.recommendedTopic.chapter} ·{' '}
                {catalog.recommendedTopic.reason}
              </p>
            </div>
            <button
              onClick={() =>
                void openTopic(catalog.recommendedTopic!.id, catalog.recommendedTopic!.editionId)
              }
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#345f91] px-5 font-bold text-white transition hover:bg-[#274e7c]"
            >
              开始学习 <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        )}

        <section className="mt-6 space-y-5" aria-live="polite">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center rounded-3xl bg-white/80">
              <Loader2 className="h-7 w-7 animate-spin text-[#527da7]" />
            </div>
          ) : topicGroups.length ? (
            topicGroups.map(([chapter, topics]) => (
              <article
                key={chapter}
                className="overflow-hidden rounded-3xl border border-white bg-white/90 shadow-sm"
              >
                <div className="flex items-center gap-3 border-b border-[#edf1f5] px-5 py-4 sm:px-7">
                  <BookMarked className="h-5 w-5 text-[#7192b1]" />
                  <h2 className="text-base font-bold leading-6 text-[#344b67] sm:text-lg">
                    {chapter}
                  </h2>
                  <span className="ml-auto shrink-0 rounded-full bg-[#f0f5fa] px-3 py-1 text-xs font-semibold text-[#718298]">
                    {topics.length}
                  </span>
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-3">
                  {topics.map((topic, topicIndex) => {
                    const progress = topic.progress?.mastery_level ?? 0;
                    return (
                      <button
                        key={topic.id}
                        onClick={() => void openTopic(topic.id)}
                        className={`group flex min-h-[170px] flex-col rounded-3xl border-2 p-4 text-left transition motion-safe:hover:-translate-y-1 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#127888] sm:p-5 ${grade <= 3 ? ['border-[#eed3a5] bg-[#fff8e8] shadow-[0_4px_0_#ecd9b9]', 'border-[#b7dcd0] bg-[#eef9f1] shadow-[0_4px_0_#c8e2d6]', 'border-[#cbdaf0] bg-[#f0f6ff] shadow-[0_4px_0_#d7e2f0]'][topicIndex % 3] : 'border-[#e7edf3] bg-white hover:border-[#a9c7e1] hover:shadow-md'}`}
                      >
                        <span className="flex w-full items-center gap-2 text-xs font-semibold text-[#8290a2]">
                          <span
                            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/85 text-sm font-extrabold text-[#38776f]"
                            aria-hidden="true"
                          >
                            {topicIndex + 1}
                          </span>
                          <span>{topic.domain}</span>
                          {(topic.prerequisiteCount ?? 0) > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Network className="h-3.5 w-3.5" /> 前置 {topic.prerequisiteCount}
                            </span>
                          )}
                          <ChevronRight className="ml-auto h-4 w-4 transition group-hover:translate-x-0.5" />
                        </span>
                        <span className="mt-3 text-base font-bold leading-6 text-[#253a53]">
                          {topic.name}
                        </span>
                        <span className="mt-2 line-clamp-2 text-sm leading-5 text-[#718197]">
                          {topic.description}
                        </span>
                        <span className="mt-auto flex items-center gap-3 pt-3 text-xs font-semibold text-[#597795]">
                          <span>
                            {topic.lessons?.completedLessons ?? 0}/{topic.lessons?.lessons ?? 0}{' '}
                            课完成
                          </span>
                          {topic.progress && <span>{Math.round(progress * 100)}% 掌握</span>}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl bg-white/90 px-6 py-14 text-center text-[#718197]">
              <p>这个筛选条件下暂时没有知识点，试试换个年级或搜索词。</p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSemester('全部');
                }}
                className="mt-4 min-h-11 rounded-xl bg-[#345f91] px-4 font-bold text-white hover:bg-[#274e7c]"
              >
                清除搜索和册别筛选
              </button>
            </div>
          )}
          {catalog?.truncated && (
            <p className="text-center text-sm text-[#718197]">结果较多，请用搜索框缩小范围。</p>
          )}
        </section>

        <footer className="mt-8 rounded-2xl border border-[#e2e9ef] bg-white/65 px-5 py-4 text-xs leading-5 text-[#7b8999]">
          课程知识点会持续核对与完善。当前学科、教材版本和课标条目以课程详情中的说明为准。
          <a
            href="/curriculum/china/NOTICE.md"
            target="_blank"
            rel="noreferrer"
            className="ml-2 font-semibold text-[#566f89] underline underline-offset-2"
          >
            数据来源与许可
          </a>
        </footer>
      </div>

      {detailLoading && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#14253a]/35 p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-[#345f91]" />
            <span className="font-semibold">正在打开知识点…</span>
          </div>
        </div>
      )}

      {selected && !detailLoading && (
        <div
          className="fixed inset-0 z-40 flex justify-end bg-[#14253a]/40"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTopic();
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-labelledby="topic-title"
            className="flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-[#fffaf1] shadow-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-[#e6ebf1] bg-[#fff8e9]/95 px-5 py-4 backdrop-blur sm:px-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf4fc] text-[#52789d]">
                <BookOpen className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#73849a]">
                  {selected.topic.gradeLabel ?? `第${selected.topic.grade}年级`} ·{' '}
                  {SUBJECT_NAMES[selected.subject] ?? selected.subject} · {selected.textbook.label}
                </p>
                <p className="truncate text-sm font-bold text-[#263b53]">
                  {selected.topic.chapter}
                </p>
              </div>
              <button
                onClick={closeTopic}
                aria-label="关闭"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#677b91] hover:bg-[#f0f4f8]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-7">
              <section className="rounded-3xl bg-[linear-gradient(135deg,#eaf4ff,#f7f4ff)] p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-wide text-[#6884a3]">
                  今天来学这个
                </p>
                <h2 id="topic-title" className="mt-2 text-2xl font-bold leading-8 text-[#223b58]">
                  {selected.topic.name}
                </h2>
                <div className="mt-4 grid grid-cols-3 gap-2" aria-label="本课学习步骤">
                  {[
                    ['1', '先想一想'],
                    ['2', '互动课堂'],
                    ['3', '练习巩固'],
                  ].map(([number, label]) => (
                    <div key={number} className="rounded-2xl bg-white/80 px-2 py-3 text-center">
                      <span className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f1fb] text-xs font-extrabold text-[#345f91]">
                        {number}
                      </span>
                      <span className="mt-2 block text-xs font-bold text-[#526b84] sm:text-sm">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-base leading-7 text-[#586d84]">
                  {selected.topic.description}
                </p>
                <div className="mt-5 space-y-2">
                  <p className="text-sm font-bold text-[#445d77]">学完后，你可以：</p>
                  {selected.topic.mastery_criteria.map((criterion) => (
                    <p key={criterion} className="flex gap-2 text-sm leading-6 text-[#5c7086]">
                      <Check className="mt-1 h-4 w-4 shrink-0 text-[#4d9477]" />
                      {criterion}
                    </p>
                  ))}
                </div>
              </section>

              {(selected.prerequisites.length > 0 || selected.nextTopics.length > 0) && (
                <section className="rounded-3xl border border-[#e2eaf2] bg-white p-5">
                  <h3 className="flex items-center gap-2 font-bold text-[#344d69]">
                    <Network className="h-4 w-4 text-[#688bab]" />
                    知识图谱路线
                  </h3>
                  {selected.prerequisites.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-[#8190a1]">建议先会这些</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.prerequisites.map(
                          (edge) =>
                            edge.topic && (
                              <button
                                key={edge.prerequisiteId}
                                onClick={() => void openTopic(edge.prerequisiteId)}
                                className="min-h-10 rounded-xl border border-[#e0eaf2] bg-[#f5f9fc] px-3 py-2 text-left text-sm font-semibold text-[#4c6884] hover:border-[#a7c2db]"
                              >
                                {edge.topic.name}
                                <span className="ml-1 text-xs opacity-60">
                                  {edge.strength === 'hard' ? '必备' : '相关'}
                                </span>
                              </button>
                            ),
                        )}
                      </div>
                    </div>
                  )}
                  {selected.nextTopics.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-[#8190a1]">接下来会用到它的知识点</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selected.nextTopics.slice(0, 8).map(
                          (edge) =>
                            edge.topic && (
                              <button
                                key={edge.topicId}
                                onClick={() => void openTopic(edge.topicId)}
                                className="min-h-10 rounded-xl bg-[#f7f7fb] px-3 py-2 text-left text-sm text-[#65778c] hover:bg-[#edf1f7]"
                              >
                                {edge.topic.name}
                              </button>
                            ),
                        )}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {selected.standards.length > 0 && (
                <details className="rounded-3xl border border-[#e2eaf2] bg-white p-5">
                  <summary className="cursor-pointer font-bold text-[#344d69]">
                    课程标准依据{' '}
                    <span className="ml-1 text-xs font-medium text-[#8190a1]">
                      {selected.standards.length}
                    </span>
                  </summary>
                  <div className="mt-4 space-y-3">
                    {selected.standards.map((standard) => (
                      <p
                        key={standard.id}
                        className="rounded-xl bg-[#f6f8fa] p-3 text-sm leading-6 text-[#607287]"
                      >
                        {standard.detail?.text ?? standard.id}
                        <span className="mt-1 block text-xs text-[#8a98a8]">
                          {standard.confidence === 'exact'
                            ? '条目精确对应'
                            : '关联条目，待课程审核'}
                        </span>
                      </p>
                    ))}
                  </div>
                </details>
              )}

              <section className="rounded-3xl border border-[#e2eaf2] bg-white p-5 sm:p-6">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff5d9] text-[#a17a20]">
                    <CircleHelp className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-[#344d69]">试试看</h3>
                    <p className="mt-1 text-sm text-[#79889a]">先想一想，再选答案或写下来。</p>
                  </div>
                </div>
                {activeQuestion ? (
                  <div className="mt-4">
                    <p className="rounded-2xl bg-[#f5f8fb] p-4 text-base font-semibold leading-7 text-[#3e536b]">
                      {activeQuestion.prompt}
                    </p>
                    {activeQuestion.choices?.length ? (
                      <div className="mt-3 grid gap-2">
                        {activeQuestion.choices.map((choice) => (
                          <button
                            key={choice.key}
                            onClick={() => {
                              setAnswer(choice.key);
                              void submitAnswer(choice.key);
                            }}
                            disabled={answerLoading || !!answerResult}
                            className="flex min-h-12 items-center gap-3 rounded-xl border border-[#e2e9f0] px-4 text-left text-sm font-semibold text-[#4d627a] hover:border-[#8fb0ce] hover:bg-[#f4f9fe] disabled:opacity-60"
                          >
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#edf3f8] text-xs">
                              {choice.key}
                            </span>
                            {choice.text}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={answer}
                          onChange={(event) => setAnswer(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') void submitAnswer();
                          }}
                          placeholder="写下你的答案"
                          className="h-12 min-w-0 flex-1 rounded-xl border border-[#dfe7ef] px-4 outline-none focus:border-[#8fb0ce]"
                        />
                        <button
                          onClick={() => void submitAnswer()}
                          disabled={answerLoading || !!answerResult || !answer.trim()}
                          className="min-h-12 rounded-xl bg-[#345f91] px-4 font-bold text-white disabled:opacity-50"
                        >
                          {answerLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : '提交'}
                        </button>
                      </div>
                    )}
                    {answerResult && (
                      <div
                        className={`mt-4 rounded-2xl p-4 ${answerResult.correct ? 'bg-[#eaf7ef] text-[#356b4b]' : 'bg-[#fff4e6] text-[#8c6330]'}`}
                      >
                        <p className="flex items-center gap-2 font-bold">
                          {answerResult.correct ? (
                            <CheckCircle2 className="h-5 w-5" />
                          ) : (
                            <CircleHelp className="h-5 w-5" />
                          )}
                          {answerResult.correct
                            ? '答对了！'
                            : '再看看题目中的条件，找找是哪一步卡住了。'}
                        </p>
                        {answerResult.correct && answerResult.explanation && (
                          <p className="mt-2 text-sm leading-6">{answerResult.explanation}</p>
                        )}
                        {!answerResult.correct && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setAnswer('');
                                setAnswerResult(null);
                              }}
                              className="min-h-10 rounded-xl bg-white/80 px-3 text-sm font-bold"
                            >
                              再想一想，再试一次
                            </button>
                            <button
                              type="button"
                              onClick={askPersonalTutorAboutMistake}
                              className="min-h-10 rounded-xl bg-white/80 px-3 text-sm font-bold"
                            >
                              请 AI 导师陪我找原因
                            </button>
                          </div>
                        )}
                        <p className="mt-2 text-xs opacity-75">
                          已记录到你的学习进度：掌握度 {Math.round(answerResult.mastery * 100)}%
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            onClick={advanceQuestion}
                            disabled={
                              !answerResult.correct || questionIndex >= practiceQuestions.length - 1
                            }
                            className="min-h-10 rounded-xl bg-white/80 px-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {questionIndex >= practiceQuestions.length - 1
                              ? '这一组练习完成'
                              : '再练一道'}
                          </button>
                          {!answerResult.correct && nextPrerequisite?.topic && (
                            <button
                              onClick={() => void openTopic(nextPrerequisite.prerequisiteId)}
                              className="min-h-10 rounded-xl bg-white/80 px-3 text-sm font-bold"
                            >
                              先补前置：{nextPrerequisite.topic.name}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 rounded-2xl bg-[#f5f8fb] p-4 text-sm leading-6 text-[#718197]">
                    <p>
                      {reflectionQuestion?.prompt ??
                        '这个知识点以课堂活动和自我表达为主，可以先听课，再和家长或老师一起讨论。'}
                    </p>
                    <p className="mt-2 text-xs text-[#8b98a7]">
                      这是开放思考题，不自动判分。可以先自己说一说，再和家长或老师讨论。
                    </p>
                  </div>
                )}
              </section>

              {['cnm_p053', 'cnm_p055'].includes(selected.topic.id) && (
                <section className="rounded-3xl border border-[#aac9bd] bg-[#fff5db] p-5 sm:p-6">
                  <h3 className="font-bold text-[#173e49]">先搭一搭，再开始课堂</h3>
                  <p className="my-3 text-sm leading-7 text-[#52716e]">
                    用计数块看看每个数位怎样组成一个数。探索已经准备好，不用等待生成；这里不计分，课程理解检查会单独记录。
                  </p>
                  <a
                    href={`/school-learning/china/place-value-lab?topic=${selected.topic.id}`}
                    className="inline-flex min-h-12 items-center rounded-2xl bg-[#126e75] px-5 font-bold text-white"
                  >
                    打开数位探索 →
                  </a>
                </section>
              )}
              {selected.topic.id === 'cnm_p038' && (
                <section className="rounded-3xl border border-[#aac9bd] bg-[#edf6ee] p-5 sm:p-6">
                  <h3 className="font-bold text-[#173e49]">二年级配音互动试课</h3>
                  <p className="my-3 text-sm leading-7 text-[#52716e]">
                    跟着讲解看分组，亲手摆出几个几，再做两道理解检查。打开后会保存到你自己的学习档案，方便反复测试。
                  </p>
                  <a
                    href="/school-learning/china/multiplication-lab"
                    className="inline-flex min-h-12 items-center rounded-2xl bg-[#126e75] px-5 font-bold text-white"
                  >
                    打开并保存二年级试课 →
                  </a>
                </section>
              )}
              {selected.topic.id === 'cnm_p226' && (
                <section className="rounded-3xl border border-[#aac9bd] bg-[#edf6ee] p-5 sm:p-6">
                  <h3 className="font-bold text-[#173e49]">试试新的学习方式</h3>
                  <p className="my-3 text-sm leading-7 text-[#52716e]">
                    先发现平均分，再看配音讲解、亲手涂色，完成理解检查和回顾。进度会保存到你的学习记录。
                  </p>
                  <a
                    href="/school-learning/china/fractions-lab"
                    className="inline-flex min-h-12 items-center rounded-2xl bg-[#126e75] px-5 font-bold text-white"
                  >
                    进入分数混合课堂 →
                  </a>
                </section>
              )}

              <section
                className={`rounded-3xl p-5 text-white sm:p-6 ${selected.topic.grade <= 3 ? 'bg-[linear-gradient(135deg,#127888,#185e6b)] shadow-[0_5px_0_#cde4d6]' : 'bg-[#203c5d]'}`}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold">互动课堂</h3>
                    <p className="mt-1 text-sm leading-6 text-white/75">
                      系统会按本年级、章节、前置知识和掌握目标生成一堂互动课。
                    </p>
                  </div>
                </div>
                {!generation && (
                  <button
                    onClick={() => void startClassroom()}
                    className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-[#d8b45c] bg-[#ffe59a] px-4 text-base font-extrabold text-[#405743] transition hover:bg-[#ffedb7] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
                  >
                    <Sparkles className="h-4 w-4" />
                    生成这节互动课
                  </button>
                )}
                {generation && !generation.classroomUrl && generation.status !== 'failed' && (
                  <div className="mt-5 flex items-center gap-3 rounded-2xl bg-white/10 p-4">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <div>
                      <p className="font-semibold">课堂正在准备</p>
                      <p className="mt-1 text-sm text-white/70">{generation.message}</p>
                    </div>
                  </div>
                )}
                {generation?.error && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl bg-rose-100 p-3 text-sm text-rose-800"
                  >
                    {generation.error}
                    <button
                      onClick={() =>
                        void (generation.resumable ? retryClassroom() : startClassroom())
                      }
                      className="ml-2 font-bold underline"
                    >
                      {generation.resumable ? '保留内容，继续准备' : '重新准备课程'}
                    </button>
                  </div>
                )}
                {generation?.classroomUrl && (
                  <div className="mt-5 space-y-3">
                    <a
                      href={generation.classroomUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={() => setClassOpened(true)}
                      className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-white px-4 font-bold text-[#203c5d] hover:bg-[#edf5fd]"
                    >
                      进入互动课堂 <ExternalLink className="h-4 w-4" />
                    </a>
                    <button
                      onClick={() => void startClassroom(true)}
                      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/35 px-4 text-sm font-semibold text-white hover:bg-white/10"
                    >
                      重新生成这节课
                    </button>
                    {classOpened && !completedLesson && (
                      <button
                        onClick={() => void completeClassroom()}
                        disabled={completingLesson}
                        className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/35 px-4 font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                      >
                        {completingLesson ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        我学完了
                      </button>
                    )}
                    {completedLesson && (
                      <p className="flex items-center justify-center gap-2 rounded-xl bg-emerald-400/15 p-3 text-sm font-bold">
                        <CheckCircle2 className="h-5 w-5" />
                        课程已记入学习历史
                      </p>
                    )}
                  </div>
                )}
              </section>

              <div className="pb-5 text-center text-xs leading-5 text-[#8b98a7]">
                本学习路线使用 CoastalTutor 的平台学习档案。图谱条目会按课程版本逐步复核。
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
