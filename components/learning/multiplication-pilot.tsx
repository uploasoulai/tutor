'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ReviewedLessonVideo } from './fractions-lesson-video';
import media from '@/lib/curriculum/multiplication-media.json';
import story from '@/lib/curriculum/multiplication-storyboard.json';
import { MULTIPLICATION_PILOT, hasReviewedAssessment } from '@/lib/curriculum/reviewed-lessons';
import { HYBRID_PHASES, type HybridPhase } from '@/lib/curriculum/hybrid-fractions';
import { GROUPING_ACTIVITY_HTML } from '@/lib/curriculum/grouping-activity';

type Question = { id: string; prompt: string };
const endpoint = '/api/china-curriculum/multiplication-pilot';
async function request(url: string, options?: RequestInit) {
  const response = await fetch(url, { cache: 'no-store', ...options });
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error('学习服务暂时没有回应，请稍后重新读取档案');
  }
  if (!response.ok || !body.success) throw new Error(body.error || '学习记录暂时无法保存，请重试');
  return body;
}
export function MultiplicationPilot({
  questions,
  preview = false,
}: {
  questions: Question[];
  preview?: boolean;
}) {
  const [phase, setPhase] = useState<HybridPhase | 'intro'>('intro');
  const [loading, setLoading] = useState(!preview);
  const [previewAnswer, setPreviewAnswer] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [reviewOnly, setReviewOnly] = useState(false);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [practiceDone, setPracticeDone] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<boolean | null>(null);
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const sessionId = useRef('');
  const activity = useRef<HTMLIFrameElement>(null);
  const question = questions.find((q) => !correctIds.includes(q.id));
  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    async function open() {
      try {
        const savedId = new URL(location.href).searchParams.get('sessionId');
        const saved = savedId
          ? await request(`${endpoint}?sessionId=${encodeURIComponent(savedId)}`, {
              signal: controller.signal,
            })
          : await request(endpoint, {
              method: 'POST',
              signal: controller.signal,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'bookmark' }),
            });
        if (controller.signal.aborted) return;
        sessionId.current = saved.sessionId;
        setCorrectIds(saved.correctQuestionIds ?? []);
        setReviewOnly(saved.phase === 'completed');
        setPhase(
          saved.status === 'planned'
            ? 'intro'
            : HYBRID_PHASES.includes(saved.phase)
              ? saved.phase
              : 'intro',
        );
        const url = new URL(location.href);
        url.searchParams.set('sessionId', saved.sessionId);
        history.replaceState(history.state, '', url);
      } catch (failure) {
        if (!controller.signal.aborted)
          setError(failure instanceof Error ? failure.message : '暂时无法读取学习档案');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void open();
    return () => controller.abort();
  }, [preview]);
  useEffect(() => {
    const progress = (event: MessageEvent) => {
      if (
        event.source !== activity.current?.contentWindow ||
        event.data?.channel !== 'coastaltutor-grouping' ||
        event.data?.version !== 1 ||
        event.data?.event !== 'progress' ||
        typeof event.data.complete !== 'boolean'
      )
        return;
      setPracticeDone(event.data.complete);
    };
    window.addEventListener('message', progress);
    return () => window.removeEventListener('message', progress);
  }, []);
  async function advance(target: HybridPhase) {
    if (preview) {
      setPhase(target);
      if (target === 'completed') setReviewOnly(true);
      return;
    }
    if (reviewOnly) {
      setPhase(target);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const result = await request(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: phase === 'intro' ? 'start' : target === 'completed' ? 'complete' : 'checkpoint',
          sessionId: sessionId.current,
          phase: target,
        }),
      });
      setPhase(result.phase === 'completed' ? 'completed' : target);
      if (target === 'completed' || result.phase === 'completed') setReviewOnly(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '暂时无法保存学习进度');
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!question || !answer.trim() || busy) return;
    setBusy(true);
    setError('');
    setFeedback(null);
    try {
      const result = await request('/api/china-curriculum/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: MULTIPLICATION_PILOT.topicId,
          questionId: question.id,
          response: answer,
          learningSessionId: sessionId.current,
        }),
      });
      setFeedback(result.correct);
      if (result.correct) {
        setCorrectIds((ids) => [...new Set([...ids, question.id])]);
        setAnswer('');
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '答案暂时未保存');
    } finally {
      setBusy(false);
    }
  }
  const button =
    'min-h-12 rounded-2xl bg-[#126e75] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50';
  const steps: { id: HybridPhase; label: string }[] = [
    { id: 'question', label: '找一找' },
    { id: 'video', label: '看一看' },
    { id: 'practice', label: '摆一摆' },
    { id: 'reasoning', label: '说一说' },
    { id: 'check', label: '试一试' },
    { id: 'recap', label: '记一记' },
  ];
  const prompt = question
    ? `我正在学习二年级“乘法的初步认识”。题目：${question.prompt}\n我的回答：${answer}\n请先用一个小问题引导我，不要直接给答案。请用你的错题流程帮助我理解，并记录供复习。`
    : '';
  return (
    <main className="min-h-screen bg-[#fff8ec] px-4 pb-28 pt-20 text-[#173e49]">
      <div className="mx-auto max-w-5xl">
        <Link
          href={preview ? '/' : '/school-learning/china?topicId=cnm_p038'}
          className="text-sm font-semibold text-[#52716e]"
        >
          {preview ? '← 回到平台首页' : '← 回到二年级课程'}
        </Link>
        <p className="mt-5 text-sm font-semibold text-[#52716e]">二年级数学 · 配音互动试课</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">乘法的初步认识</h1>
        <p className="mt-3 leading-7 text-[#52716e]">
          从几个相同的“小组”出发，摆一摆、数一数，说清楚“几个几”。
        </p>
        <p className="mt-4 rounded-2xl border border-[#efd295] bg-[#fff1cd] p-4 text-sm leading-7 text-[#72531d]">
          朋友也能用自己的平台账号打开这节试课，无需重新生成。课堂内容共用，学生进度各自保存。{' '}
          <Link href={MULTIPLICATION_PILOT.path} className="font-bold underline">
            试课分享入口 ↗
          </Link>
        </p>
        <ol aria-label="学习步骤" className="my-6 grid grid-cols-3 gap-2 text-sm sm:grid-cols-6">
          {steps.map((step, i) => (
            <li
              key={step.id}
              aria-current={phase === step.id ? 'step' : undefined}
              className={`rounded-2xl border p-3 text-center ${phase === step.id ? 'border-[#126e75] bg-white font-bold' : 'border-transparent bg-[#e5eeea]'}`}
            >
              {i + 1}. {step.label}
            </li>
          ))}
        </ol>
        {error && (
          <div role="alert" className="mb-5 rounded-2xl bg-amber-50 p-4">
            {error}
            <button className="ml-3 min-h-11 underline" onClick={() => location.reload()}>
              重新读取档案
            </button>
          </div>
        )}
        <section className="rounded-3xl border border-[#d9e7df] bg-white p-5 shadow-sm sm:p-8">
          {loading ? (
            <p role="status">正在保存试课、读取你的学习档案…</p>
          ) : phase === 'intro' ? (
            <>
              <h2 className="text-xl font-bold">
                {preview
                  ? '欢迎来到小海老师的数学教室'
                  : sessionId.current
                    ? '这节试课已存入你的学习档案'
                    : '暂时还没有保存这节试课'}
              </h2>
              <p className="my-4 leading-8">
                {preview
                  ? '讲解和练习都已经准备好，跟着小海老师看一看、摆一摆吧。这是体验模式，不会写入任何学生的学习档案；学生账号进入后会保存自己的进度。'
                  : sessionId.current
                    ? '目前标记为“已保存、未开始”。点开始以后，才会记录学习和答题进度。讲解已经准备好，反复观看不需要重新生成。'
                    : '请重新读取学习档案。保存成功后就可以开始，已有的学习记录仍会保留。'}
              </p>
              {!preview && questions.length !== 2 && (
                <p role="alert" className="mb-4 text-amber-800">
                  理解检查题目暂时未就绪，请稍后重新打开。
                </p>
              )}
              <button
                className={button}
                disabled={busy || (!preview && (!sessionId.current || questions.length !== 2))}
                onClick={() => void advance('question')}
              >
                {preview ? '开始二年级体验' : '开始二年级试课'}
              </button>
            </>
          ) : phase === 'question' ? (
            <>
              <h2 className="text-xl font-bold">哪幅图的每组同样多？</h2>
              <p className="my-4 leading-7">先看看每组有几个。这一步不计分。</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {[true, false].map((equal) => (
                  <button
                    key={String(equal)}
                    aria-label={equal ? '图形一' : '图形二'}
                    aria-pressed={choice === equal}
                    className="min-h-32 rounded-2xl border-2 border-[#aac9bd] p-4"
                    onClick={() => setChoice(equal)}
                  >
                    <span className="font-bold">{equal ? '图形一' : '图形二'}</span>
                    <span className="mt-3 flex justify-center gap-3">
                      {(equal ? [2, 2, 2] : [2, 3, 2]).map((n, i) => (
                        <span
                          key={i}
                          className="flex min-h-20 flex-wrap items-center justify-center gap-1 rounded-xl border border-[#126e75] p-2"
                          aria-label={`第${i + 1}组有${n}个`}
                        >
                          {Array.from({ length: n }, (_, j) => (
                            <span
                              key={j}
                              className="inline-block size-4 rounded-full bg-[#126e75]"
                            />
                          ))}
                        </span>
                      ))}
                    </span>
                  </button>
                ))}
              </div>
              {choice !== null && (
                <p role="status" className="my-4 rounded-xl bg-[#edf6ee] p-4">
                  {choice
                    ? '找得真仔细！每组都是 2 个。我们一起看看几组放在一起会怎样。'
                    : '看看中间一组，它有 3 个。再找找每组同样多的那幅图。'}
                </p>
              )}
              <button
                className={`${button} mt-5`}
                disabled={busy || choice !== true}
                onClick={() => void advance('video')}
              >
                看老师讲一讲 →
              </button>
            </>
          ) : phase === 'video' || phase === 'reasoning' || phase === 'recap' ? (
            <>
              <ReviewedLessonVideo
                key={phase}
                chapter={phase === 'video' ? 'explain' : phase === 'reasoning' ? 'reason' : 'recap'}
                media={media}
                story={story}
                playful
              />
              <div className="mt-5 flex justify-end">
                <button
                  className={button}
                  disabled={
                    busy ||
                    (phase === 'recap' &&
                      !preview &&
                      !reviewOnly &&
                      !hasReviewedAssessment(MULTIPLICATION_PILOT, correctIds))
                  }
                  onClick={() =>
                    void advance(
                      phase === 'video'
                        ? 'practice'
                        : phase === 'reasoning'
                          ? reviewOnly
                            ? 'recap'
                            : 'check'
                          : 'completed',
                    )
                  }
                >
                  {phase === 'video'
                    ? '我来摆一摆 →'
                    : phase === 'reasoning'
                      ? reviewOnly
                        ? '回看今天的发现 →'
                        : preview
                          ? '试试一个小问题 →'
                          : '试试两个新问题 →'
                      : reviewOnly
                        ? '结束回看'
                        : preview
                          ? '结束体验'
                          : '完成并保存学习记录'}
                </button>
              </div>
            </>
          ) : phase === 'practice' ? (
            <>
              <h2 className="text-xl font-bold">亲手摆出 3 个 2</h2>
              <p className="my-3 leading-7">先点圆片，再点盒子。让三个盒子每个都有两个圆片。</p>
              <iframe
                ref={activity}
                srcDoc={GROUPING_ACTIVITY_HTML}
                title="二年级乘法分组练习"
                sandbox="allow-scripts"
                className="h-[700px] w-full rounded-2xl border-0 sm:h-[560px]"
              />
              {practiceDone && (
                <p role="status" className="my-3 rounded-xl bg-[#edf6ee] p-4">
                  你摆出了三组，每组两个。现在听听为什么能用乘法表示。
                </p>
              )}
              <button
                className={`${button} mt-4`}
                disabled={busy || (!practiceDone && !reviewOnly)}
                onClick={() => void advance('reasoning')}
              >
                看看为什么这样写 →
              </button>
            </>
          ) : phase === 'check' ? (
            preview ? (
              <>
                <h2 className="text-xl font-bold">体验小练习：摆出几个几</h2>
                <p className="my-4 text-lg leading-8">
                  每组有 2 颗星星，有这样的 3 组。一共有几颗星星？
                </p>
                <p className="mb-4 text-sm text-[#72531d]">这是体验练习，不写入学习档案。</p>
                <div className="flex flex-wrap gap-3">
                  {[4, 6, 8].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={previewAnswer === value}
                      onClick={() => setPreviewAnswer(value)}
                      className="min-h-14 min-w-20 rounded-2xl border-2 border-[#d9b975] bg-[#fff5db] px-6 text-2xl font-bold"
                    >
                      {value}
                    </button>
                  ))}
                </div>
                {previewAnswer !== null && (
                  <p role="status" className="my-4 rounded-xl bg-[#edf6ee] p-4">
                    {previewAnswer === 6
                      ? '找到了！3 个 2 是 6。试着说说你是怎么数的吧。'
                      : '不着急，摆出三组小物品，每组两个，再一起数一数。'}
                  </p>
                )}
                <button
                  className={`${button} mt-4`}
                  disabled={previewAnswer !== 6}
                  onClick={() => void advance('recap')}
                >
                  记住今天的发现 →
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold">我能说清楚几个几</h2>
                <p className="my-4 leading-7">
                  已完成{' '}
                  {MULTIPLICATION_PILOT.questionIds.filter((id) => correctIds.includes(id)).length}{' '}
                  / 2 道理解检查。
                </p>
                {feedback === true && (
                  <p role="status" className="my-3 rounded-xl bg-[#edf6ee] p-4">
                    这道题答对了！
                  </p>
                )}
                {question ? (
                  <>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        void submit();
                      }}
                    >
                      <label
                        htmlFor="multiplication-answer"
                        className="block text-lg font-bold leading-8"
                      >
                        {question.prompt}
                      </label>
                      <div className="my-4 flex flex-wrap gap-3">
                        <input
                          id="multiplication-answer"
                          inputMode="numeric"
                          autoComplete="off"
                          maxLength={40}
                          value={answer}
                          onChange={(event) => {
                            setAnswer(event.target.value);
                            setFeedback(null);
                          }}
                          placeholder="写下你的答案"
                          className="min-h-12 w-44 rounded-xl border border-[#aac9bd] px-4 text-xl"
                        />
                        <button className={button} disabled={busy || !answer.trim()}>
                          提交答案
                        </button>
                      </div>
                    </form>
                    {feedback === false && (
                      <div className="rounded-xl bg-amber-50 p-4">
                        <p role="status">
                          先找每组有几个，再找有几组。需要帮助时，可以请家教引导你。
                        </p>
                        <form
                          method="post"
                          action="/api/learning/launch"
                          target="_blank"
                          rel="noopener"
                        >
                          <input type="hidden" name="mode" value="personal" />
                          <input type="hidden" name="prompt" value={prompt} />
                          <button className="mt-3 min-h-11 rounded-xl border bg-white px-4">
                            请我的家教引导一下 ↗
                          </button>
                        </form>
                      </div>
                    )}
                  </>
                ) : (
                  <button
                    className={button}
                    disabled={busy || !hasReviewedAssessment(MULTIPLICATION_PILOT, correctIds)}
                    onClick={() => void advance('recap')}
                  >
                    记住今天的发现 →
                  </button>
                )}
              </>
            )
          ) : (
            <>
              <h2 className="text-2xl font-bold">
                {preview ? '二年级课堂体验完成了！' : '二年级试课完成了！'}
              </h2>
              <p className="my-4 leading-8">
                {preview
                  ? '你已经体验了讲解、分组操作和小练习。这里没有写入任何学生记录；使用学生账号学习，就可以保存自己的进度。'
                  : '这节课和两道理解检查已经保存在你的学习档案中。以后可以从学习空间再次打开。'}
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  className={button}
                  onClick={() => {
                    setReviewOnly(true);
                    setPhase('video');
                  }}
                >
                  回看讲解和操作
                </button>
                <Link
                  href={preview ? '/' : '/student'}
                  className="min-h-12 rounded-2xl border border-[#aac9bd] px-5 py-3 font-bold"
                >
                  {preview ? '回到平台首页 →' : '回到我的学习档案 →'}
                </Link>
              </div>
            </>
          )}
        </section>
        <p className="mt-5 text-sm leading-6 text-[#52716e]">
          本课为已审校测试内容，练习使用现有课程题库。观看讲解本身不会自动记为掌握。
        </p>
      </div>
    </main>
  );
}
