'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CoastalMark } from '@/components/coastal-mark';
import { assessmentTutorPrompt, type AssessmentReport } from '@/lib/curriculum/assessments';
import { CourseLibraryFeedback } from './course-library-feedback';
import { MultiplicationStoryPicture } from './multiplication-story-picture';

export type PublicPreparedLesson = {
  id: string;
  title: string;
  topicId: string;
  grade: number;
  activity: string;
  blocks: { id: string; label: string; text: string; audioId: string }[];
  questions: {
    id: string;
    prompt: string;
    type: string;
    choices?: { key: string; text: string }[];
    promptAudioId: string;
    choiceAudioIds?: string[];
  }[];
};
const button =
  'min-h-12 rounded-2xl border-2 border-[#b5d9cf] bg-white px-5 py-3 text-base font-bold text-[#245953] shadow-[0_3px_0_#cee5da] transition-transform active:translate-y-0.5 disabled:opacity-50';
async function read(url: string, options?: RequestInit) {
  const r = await fetch(url, { cache: 'no-store', ...options });
  const b = await r.json();
  if (!r.ok || !b.success) throw new Error(b.error || '暂时没有连接好，请再试一次');
  return b;
}
function stars(score: number) {
  return score >= 80 ? 3 : score >= 50 ? 2 : 1;
}
export function PreparedAdventure({ preview }: { preview: boolean }) {
  const [lessons, setLessons] = useState<PublicPreparedLesson[]>([]),
    [reports, setReports] = useState<Record<string, number>>({}),
    [error, setError] = useState(''),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const c = new AbortController();
    void Promise.all([
      read('/api/prepared-courses', { signal: c.signal }),
      preview
        ? Promise.resolve({ papers: [] })
        : read('/api/school-assessments?history=1', { signal: c.signal }),
    ])
      .then(([courses, history]) => {
        if (c.signal.aborted) return;
        setLessons(courses.lessons);
        const scores: Record<string, number> = {};
        for (const paper of history.papers) {
          const id = paper.config.preparedLessonId;
          if (id && paper.report && scores[id] === undefined) scores[id] = paper.report.score;
        }
        setReports(scores);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      })
      .finally(() => {
        if (!c.signal.aborted) setLoading(false);
      });
    return () => c.abort();
  }, [preview]);
  return (
    <div>
      <section className="my-7 rounded-[2rem] border-2 border-white bg-gradient-to-br from-[#fff2ba] via-[#fff8e5] to-[#e1f6ef] p-6 sm:p-9">
        <p className="font-bold text-[#ad6b21]">二年级 · 乘法小岛 · 首堂试学</p>
        <h1 className="my-3 text-3xl font-black text-[#255b61] sm:text-4xl">
          数一数，原来乘法这么好玩！
        </h1>
        <p className="max-w-2xl leading-8 text-[#52736e]">
          听一小段，动手摆一摆，再试六道小挑战。不会没关系，海边家教会陪你慢慢想。课程已经准备好，随时都能回来学。
        </p>
        <p className="mt-4 font-bold text-[#7e612b]">
          {preview ? '家长 / 管理预览，不记录学生成绩' : '你的练习单独保存，课程和声音大家共享。'}{' '}
          所有站点都可以直接进入。
        </p>
      </section>
      {error && (
        <p role="alert" className="rounded-xl bg-amber-50 p-4">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status">正在打开乘法小岛…</p>
      ) : lessons.length === 0 ? (
        <p>课程正在准备中。你仍可从中国课纲或课程书架选择其他课程。</p>
      ) : (
        <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lessons.map((lesson, i) => (
            <li key={lesson.id}>
              <Link
                href={`/school-learning/china/adventure/${lesson.id}`}
                className="flex h-full flex-col rounded-[2rem] border-2 border-[#d1e6db] bg-white p-6 shadow-[0_5px_0_#deebe1] transition-transform hover:-translate-y-1"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#ffde88] text-2xl font-black text-[#7b5527]">
                  {i + 1}
                </span>
                <p className="mt-5 text-sm font-bold text-[#718d7d]">第{i + 1}站 · 动手探索</p>
                <h2 className="my-2 text-xl font-black text-[#255b61]">{lesson.title}</h2>
                <p className="mb-5 text-sm leading-7 text-[#59766e]">
                  短讲解 · 摆一摆 · 六道小挑战
                </p>
                <p className="mt-auto font-bold text-[#9a6a28]">
                  {reports[lesson.id] !== undefined
                    ? '★'.repeat(stars(reports[lesson.id])) + ' · 再来探索'
                    : preview
                      ? '看看这节课 →'
                      : '出发吧 →'}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      )}
      <p className="my-7 text-sm leading-7 text-[#607a73]">
        星星用于鼓励这次练习，不代表已经掌握全部知识。最近报告中的表现会显示在这里；所有报告可在“小测验与错题”查看。试用课按知识概念匹配现有课纲，不会改动原来的教材顺序。
      </p>
    </div>
  );
}

function CounterGame({ kind }: { kind: string }) {
  const per =
    kind === 'fives' ? 5 : kind === 'sixes' ? 6 : kind === 'tables' ? 3 : kind === 'extra' ? 4 : 3;
  const [groups, setGroups] = useState(1),
    [extra, setExtra] = useState(0);
  const [feedback, setFeedback] = useState('');
  return (
    <div className="my-5 rounded-3xl border-2 border-[#b7ddd2] bg-[#f0faf4] p-5">
      <h3 className="text-xl font-black">给海边小伙伴分贝壳</h3>
      <p className="my-3 leading-8">
        每个小篮子放{per}颗。点一下“再加一组”，看看总数会怎样变？先说说你的想法，再动手。
      </p>
      <p className="rounded-2xl bg-[#fff0bb] p-4 font-bold">
        小任务：帮小海豹摆出2个篮子，每个篮子{per}颗贝壳。
      </p>
      <div
        className="my-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
        aria-label={`${groups}组，每组${per}颗`}
      >
        {Array.from({ length: groups }, (_, g) => (
          <div key={g} className="rounded-2xl border-2 border-[#a5cfc4] bg-white p-3 text-center">
            <span className="mb-2 block text-sm font-bold">第{g + 1}篮</span>
            <div className="flex min-h-16 flex-wrap justify-center gap-2">
              {Array.from({ length: per }, (_, i) => (
                <svg
                  key={i}
                  aria-hidden="true"
                  viewBox="0 0 28 28"
                  className="h-7 w-7 motion-safe:animate-[fadeIn_0.25s_ease]"
                >
                  <path
                    d="M4 18C-1 3 28 0 24 18L17 25H11Z"
                    fill="#ffb082"
                    stroke="#b16846"
                    strokeWidth="1.5"
                  />
                  <path d="M14 6v16M8 8l4 14M21 8l-5 14" stroke="#fff6df" strokeWidth="2" />
                </svg>
              ))}
            </div>
          </div>
        ))}
      </div>
      {kind === 'extra' && (
        <p className="my-3 text-lg">另外散放的贝壳：{'● '.repeat(extra) || '还没有'}</p>
      )}
      <p aria-live="polite" className="my-4 text-xl font-black text-[#236b6b]">
        {groups}个{per}相加：{Array.from({ length: groups }, () => per).join(' + ')}
        {extra ? ` + ${extra}` : ''} = {groups * per + extra}
      </p>
      <div className="flex flex-wrap gap-3">
        <button className={button} disabled={groups === 4} onClick={() => setGroups((n) => n + 1)}>
          再加一组
        </button>
        {kind === 'extra' && (
          <button className={button} disabled={extra === 4} onClick={() => setExtra((n) => n + 1)}>
            再来1颗
          </button>
        )}
        <button
          className={button}
          onClick={() => {
            setGroups(1);
            setExtra(0);
            setFeedback('');
          }}
        >
          重新摆一摆
        </button>
        <button
          className={button}
          onClick={() =>
            setFeedback(
              groups === 2 && extra === 0
                ? '★ 做到了！两个篮子里一样多，可以说成2个' + per + '。'
                : '我们再看看：需要2个篮子，每个篮子一样多。不急，继续摆一摆。',
            )
          }
        >
          检查我的小任务
        </button>
      </div>
      {feedback && (
        <p role="status" className="mt-4 rounded-2xl bg-[#fff0bb] p-4 font-bold leading-8">
          {feedback}
        </p>
      )}
      <p className="mt-4 text-sm text-[#5e7f73]">
        这是动手练习，不计时、不扣分。摆完后，再去试试自己的理解。
      </p>
    </div>
  );
}

export function PreparedCoursePlayer({
  lesson,
  preview,
}: {
  lesson: PublicPreparedLesson;
  preview: boolean;
}) {
  const [phase, setPhase] = useState<'welcome' | 'learn' | 'game' | 'quiz' | 'report'>('welcome'),
    [block, setBlock] = useState(0),
    [paperId, setPaperId] = useState(''),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [report, setReport] = useState<AssessmentReport | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(''),
    [audioError, setAudioError] = useState(''),
    [playing, setPlaying] = useState('');
  const voice = useRef<HTMLAudioElement>(null);
  const stop = () => {
    voice.current?.pause();
    setPlaying('');
  };
  useEffect(() => {
    const c = new AbortController();
    const id = new URLSearchParams(location.search).get('paperId');
    if (!id || preview) return;
    void read(`/api/school-assessments?id=${encodeURIComponent(id)}`, { signal: c.signal })
      .then((data) => {
        if (c.signal.aborted) return;
        if (data.config.preparedLessonId !== lesson.id) throw new Error('这份记录不属于这节课');
        setPaperId(id);
        if (data.report) {
          setReport(data.report);
          setPhase('report');
        } else setPhase('learn');
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [lesson.id, preview]);
  function play(id: string) {
    const audio = voice.current;
    if (!audio) return;
    if (playing === id) {
      stop();
      return;
    }
    audio.pause();
    audio.src = `/api/prepared-course-media/${lesson.id}/${id}${paperId ? `?paperId=${encodeURIComponent(paperId)}` : ''}`;
    setAudioError('');
    setPlaying(id);
    void audio.play().catch(() => {
      setPlaying('');
      setAudioError('声音暂时没有播放，请点一次重试，也可以继续看文字。');
    });
  }
  function go(next: typeof phase) {
    stop();
    setPhase(next);
  }
  async function start() {
    setBusy(true);
    setError('');
    try {
      const data = await read('/api/school-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', preparedLessonId: lesson.id }),
      });
      setPaperId(data.id ?? '');
      if (data.id) {
        const url = new URL(location.href);
        url.searchParams.set('paperId', data.id);
        window.history.replaceState(window.history.state, '', url);
      }
      go('learn');
    } catch (e) {
      setError(e instanceof Error ? e.message : '暂时无法开始');
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    setBusy(true);
    setError('');
    stop();
    try {
      const data = await read('/api/school-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          preview
            ? { action: 'preview-grade', preparedLessonId: lesson.id, answers }
            : { action: 'submit', id: paperId, answers },
        ),
      });
      setReport(data.report);
      go('report');
    } catch (e) {
      setError(e instanceof Error ? e.message : '暂时没有保存，请再试一次');
    } finally {
      setBusy(false);
    }
  }
  const step =
    phase === 'welcome'
      ? 0
      : phase === 'learn'
        ? 1
        : phase === 'game'
          ? 2
          : phase === 'quiz'
            ? 3
            : 4;
  return (
    <div className="mx-auto max-w-4xl">
      <audio
        ref={voice}
        preload="none"
        onEnded={() => setPlaying('')}
        onError={() => {
          setPlaying('');
          setAudioError('音频暂时不可用，文字和动手练习仍可使用。');
        }}
      />
      <header className="my-6 rounded-3xl bg-[#dff3ed] p-5">
        <p className="font-bold text-[#5f8178]">二年级 · 乘法小岛 · 试用课</p>
        <h1 className="mt-2 text-2xl font-black text-[#245e64] sm:text-3xl">{lesson.title}</h1>
        <div aria-label="学习环节" className="mt-4 flex flex-wrap gap-2">
          {['出发', '听一小段', '摆一摆', '试一试', '收获'].map((name, i) => (
            <span
              key={name}
              aria-current={step === i ? 'step' : undefined}
              className={`rounded-full px-3 py-2 text-sm font-bold ${step === i ? 'bg-[#246c70] text-white' : 'bg-white text-[#57766e]'}`}
            >
              {i + 1} {name}
            </span>
          ))}
        </div>
      </header>
      {preview && (
        <p className="my-4 rounded-xl bg-[#fff0c9] p-4">
          家长 / 管理预览：可以体验，不写入学生成绩。
        </p>
      )}
      {error && (
        <p role="alert" className="my-4 rounded-xl bg-amber-50 p-4">
          {error}
        </p>
      )}
      {audioError && (
        <p role="status" className="my-3 rounded-xl bg-[#fff3d7] p-3">
          {audioError}
        </p>
      )}
      <section className="rounded-[2rem] border-2 border-[#d3e7dc] bg-white p-5 sm:p-8">
        {phase === 'welcome' ? (
          <>
            <div className="flex items-center gap-4">
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#ffd584] text-[#6f5a31]">
                <CoastalMark className="h-12 w-12" />
              </span>
              <h2 className="text-2xl font-black">准备好出发了吗？</h2>
            </div>
            <p className="my-6 text-lg leading-9">
              今天不用赶。我们听一小段，停下来动手玩，再试试有没有学会。答错也没关系，可以请家教陪你找到办法。
            </p>
            <button
              className={`${button} bg-[#fff0bd]`}
              disabled={busy}
              onClick={() => void start()}
            >
              {busy ? '正在准备…' : preview ? '开始预览' : '开始我的探索'}
            </button>
          </>
        ) : phase === 'learn' ? (
          <>
            <p className="text-sm font-bold text-[#a8782d]">
              第{block + 1}小段 / {lesson.blocks.length} · 听完后由你决定下一步
            </p>
            <h2 className="my-4 text-2xl font-black">{lesson.blocks[block].label}</h2>
            {block === 0 && <MultiplicationStoryPicture />}
            <p className="my-5 text-xl leading-10 text-[#345d5c]">{lesson.blocks[block].text}</p>
            <div className="flex flex-wrap gap-3">
              <button className={button} onClick={() => play(lesson.blocks[block].audioId)}>
                {playing === lesson.blocks[block].audioId ? '暂停声音' : '听老师说'}
              </button>
              <button
                className={button}
                onClick={() => {
                  stop();
                  if (block + 1 < lesson.blocks.length) setBlock(block + 1);
                  else go('game');
                }}
              >
                {block + 1 < lesson.blocks.length ? '想明白了，下一小段 →' : '我来摆一摆 →'}
              </button>
            </div>
            <p className="mt-6 text-sm text-[#6f8479]">
              不自动连播。你可以先想一想，也可以再听一次。
            </p>
          </>
        ) : phase === 'game' ? (
          <>
            <CounterGame kind={lesson.activity} />
            <button className={`${button} bg-[#ffefba]`} onClick={() => go('quiz')}>
              我准备好，去试一试 →
            </button>
          </>
        ) : phase === 'quiz' ? (
          <>
            <h2 className="text-2xl font-black">六个小挑战，慢慢来</h2>
            <p className="my-4 leading-8">
              先完成自己的尝试，再一起看结果。不会的题也可以先空着，不计时。
            </p>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault();
                void submit();
              }}
            >
              {lesson.questions.map((q, i) => (
                <fieldset key={q.id} className="rounded-2xl border-2 border-[#d9e9df] p-4">
                  <legend className="px-2 font-bold text-[#648274]">第{i + 1}题</legend>
                  <p className="mb-3 text-lg leading-9">{q.prompt}</p>
                  <button
                    type="button"
                    className={`${button} mb-4 text-sm`}
                    onClick={() => play(q.promptAudioId)}
                  >
                    {playing === q.promptAudioId ? '暂停题目' : '听题目'}
                  </button>
                  {q.choices ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {q.choices.map((choice, j) => (
                        <div key={choice.key} className="flex gap-2">
                          <label
                            className={`flex min-h-14 flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${answers[q.id] === choice.key ? 'border-[#2a8783] bg-[#e5f6ee]' : 'border-[#dce9e0] bg-[#fafcf9]'}`}
                          >
                            <input
                              type="radio"
                              name={q.id}
                              value={choice.key}
                              checked={answers[q.id] === choice.key}
                              onChange={() => setAnswers((old) => ({ ...old, [q.id]: choice.key }))}
                            />
                            {choice.text}
                          </label>
                          {q.choiceAudioIds?.[j] && (
                            <button
                              type="button"
                              className="min-h-12 min-w-12 rounded-xl border bg-[#fff5da]"
                              aria-label={`朗读选项${choice.key}，第${i + 1}题`}
                              onClick={() => play(q.choiceAudioIds![j])}
                            >
                              ♫
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <label className="flex flex-wrap items-center gap-3 font-bold">
                      我的答案
                      <input
                        className="min-h-14 w-36 rounded-xl border-2 border-[#b6d2c5] px-3 text-xl"
                        aria-label={`第${i + 1}题答案`}
                        value={answers[q.id] ?? ''}
                        maxLength={100}
                        onChange={(e) => setAnswers((old) => ({ ...old, [q.id]: e.target.value }))}
                      />
                    </label>
                  )}
                </fieldset>
              ))}
              <button className={`${button} bg-[#ffefba]`} disabled={busy}>
                {busy ? '正在保存…' : '完成挑战，看看收获 ★'}
              </button>
            </form>
          </>
        ) : (
          report && (
            <>
              <p
                className="text-4xl text-[#c18c22]"
                aria-label={`${stars(report.score)}颗学习星星`}
              >
                {'★'.repeat(stars(report.score))}
              </p>
              <h2 className="my-4 text-2xl font-black">你完成了这次探索！</h2>
              <p className="mb-5 text-lg leading-9">
                {report.correct}/{report.total}题答对。
                {preview ? '这是预览，没有保存学生成绩。' : '这次结果已保存在你的学习档案里。'}
                星星鼓励你的尝试，没懂的地方继续练。
              </p>
              {report.results.map((item, i) => (
                <article key={item.questionId} className="my-4 rounded-2xl bg-[#f0f7f1] p-4">
                  <h3 className="whitespace-pre-line font-bold leading-8">
                    {i + 1}. {item.prompt}
                  </h3>
                  <p className="my-2">
                    {item.correct ? '✓ 答对啦' : item.answered ? '一起找找办法' : '还没尝试'} ·
                    我的回答：{item.response || '暂时空着'}
                  </p>
                  {item.explanation && <p className="my-3 leading-8">{item.explanation}</p>}
                  <div className="flex flex-wrap gap-3">
                    {item.explanationAudioId && (
                      <button className={button} onClick={() => play(item.explanationAudioId!)}>
                        听这题的讲解
                      </button>
                    )}
                    {!item.correct && item.answered && !preview && (
                      <form
                        method="post"
                        action="/api/learning/launch"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <input type="hidden" name="mode" value="personal" />
                        <input
                          type="hidden"
                          name="prompt"
                          value={assessmentTutorPrompt(report, 2, item.questionId)}
                        />
                        <button className={button}>请家教陪我想一想 ↗</button>
                      </form>
                    )}
                  </div>
                </article>
              ))}
              <div className="my-6 flex flex-wrap gap-3">
                <Link className={button} href="/school-learning/china/adventure">
                  回到小岛，选下一站 →
                </Link>
                <Link className={button} href="/school-learning/assessments">
                  我的报告与错题
                </Link>
              </div>
              <CourseLibraryFeedback courseId={lesson.id} />
            </>
          )
        )}
      </section>
      <nav className="my-7 flex flex-wrap gap-4 text-sm font-bold text-[#48746c]">
        <Link href="/school-learning/china/adventure" onClick={stop}>
          乘法小岛
        </Link>
        <Link href={`/school-learning/china?topicId=${lesson.topicId}`} onClick={stop}>
          回到这个知识点
        </Link>
        <Link href="/school-learning/library" onClick={stop}>
          课程书架
        </Link>
        <a href="/legal/prepared-course-notice.txt" target="_blank" rel="noopener noreferrer">
          资源说明
        </a>
      </nav>
    </div>
  );
}
