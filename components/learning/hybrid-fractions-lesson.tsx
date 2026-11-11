'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { PlayCircle, Hand, CheckCircle2, Loader2, RotateCcw } from 'lucide-react';
import {
  FRACTIONS_HYBRID,
  HYBRID_PHASES,
  fractionPracticeFeedback,
  hasHybridAssessment,
  type HybridPhase,
} from '@/lib/curriculum/hybrid-fractions';

type Question = { id: string; prompt: string };
async function save(action: string, sessionId: string, phase?: HybridPhase) {
  const response = await fetch('/api/china-curriculum/hybrid', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, sessionId, phase }),
  });
  const body = await response.json();
  if (!response.ok || !body.success) throw new Error(body.error || '学习进度暂时未保存，请重试');
  return body;
}
export function HybridFractionsLesson({ questions }: { questions: Question[] }) {
  const [phase, setPhase] = useState<HybridPhase | 'intro'>('intro');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reviewOnly, setReviewOnly] = useState(false);
  const [error, setError] = useState('');
  const [resumeFailed, setResumeFailed] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [selected, setSelected] = useState<boolean[]>([false, false, false, false]);
  const [practiceChecked, setPracticeChecked] = useState(false);
  const [answer, setAnswer] = useState('');
  const [correctIds, setCorrectIds] = useState<string[]>([]);
  const [answerCorrect, setAnswerCorrect] = useState<boolean | null>(null);
  const sessionId = useRef('');
  const count = selected.filter(Boolean).length;
  const question = questions.find((item) => !correctIds.includes(item.id));
  useEffect(() => {
    const controller = new AbortController();
    async function resume() {
      try {
        const id = new URL(window.location.href).searchParams.get('sessionId');
        if (id) {
          const response = await fetch(
            `/api/china-curriculum/hybrid?sessionId=${encodeURIComponent(id)}`,
            { signal: controller.signal, cache: 'no-store' },
          );
          const body = await response.json();
          if (!response.ok || !body.success) throw new Error(body.error || '暂时无法读取学习进度');
          sessionId.current = id;
          setPhase(HYBRID_PHASES.includes(body.phase) ? body.phase : 'video');
          setCorrectIds(body.correctQuestionIds ?? []);
          setReviewOnly(body.phase === 'completed');
        } else {
          await Promise.resolve();
        }
      } catch (failure) {
        if (!controller.signal.aborted) setResumeFailed(true);
        if (!controller.signal.aborted)
          setError(failure instanceof Error ? failure.message : '暂时无法读取进度');
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void resume();
    return () => controller.abort();
  }, []);
  async function start() {
    setBusy(true);
    setError('');
    try {
      sessionId.current ||= crypto.randomUUID();
      await save('start', sessionId.current);
      const url = new URL(window.location.href);
      url.searchParams.set('sessionId', sessionId.current);
      window.history.replaceState(window.history.state, '', url);
      setPhase('video');
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '暂时无法开始');
    } finally {
      setBusy(false);
    }
  }
  async function advance(target: HybridPhase) {
    if (reviewOnly) {
      setPhase(target);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const saved = await save(
        target === 'completed' ? 'complete' : 'checkpoint',
        sessionId.current,
        target,
      );
      setPhase(saved.phase === 'completed' ? 'completed' : target);
      if (saved.phase === 'completed' || target === 'completed') setReviewOnly(true);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '进度尚未保存');
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    if (!question || !answer.trim() || busy) return;
    setBusy(true);
    setError('');
    setAnswerCorrect(null);
    try {
      const response = await fetch('/api/china-curriculum/attempt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: FRACTIONS_HYBRID.topicId,
          questionId: question.id,
          response: answer,
          learningSessionId: sessionId.current,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || '答案暂时未保存');
      setAnswerCorrect(body.correct);
      if (body.correct) {
        setCorrectIds((ids) => [...new Set([...ids, question.id])]);
        setAnswer('');
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : '答案暂时未保存');
    } finally {
      setBusy(false);
    }
  }
  const tutorPrompt = question
    ? `我正在学习三年级的“认识几分之几”。题目：${question.prompt}\n我的回答：${answer}\n请先用一个小问题引导我，不要直接给答案；请用你的错题流程帮助我理解，并记录这道错题供复习。`
    : '';
  const button =
    'inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#126e75] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50';
  return (
    <main className="min-h-screen bg-[#f3f7f4] px-4 pb-28 pt-20 text-[#173e49]">
      <div className="mx-auto max-w-5xl">
        <Link href="/school-learning/china" className="text-sm font-semibold text-[#52716e]">
          ← 回到中国课程
        </Link>
        <p className="mt-5 text-sm font-semibold text-[#52716e]">三年级数学 · 混合课堂试学</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">认识几分之几</h1>
        <p className="mt-3 max-w-2xl leading-7 text-[#52716e]">
          先看分数是怎么来的，再亲手涂一涂，最后试着解决一个新问题。
        </p>
        <ol aria-label="学习步骤" className="my-6 grid grid-cols-3 gap-2 text-sm">
          {[
            { name: '看一看', icon: PlayCircle, step: 'video' },
            { name: '动手试', icon: Hand, step: 'practice' },
            { name: '我会了', icon: CheckCircle2, step: 'check' },
          ].map(({ name, icon: Icon, step }, index) => (
            <li
              key={step}
              aria-current={phase === step ? 'step' : undefined}
              className={`flex items-center justify-center gap-1 rounded-2xl border p-2 sm:gap-2 sm:p-3 ${phase === step ? 'border-[#126e75] bg-white font-bold' : 'border-transparent bg-[#e5eeea]'}`}
            >
              <Icon size={18} />
              <span>
                {index + 1}. {name}
              </span>
            </li>
          ))}
        </ol>
        {error && (
          <div role="alert" className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            {error}
            <p className="mt-2 text-sm">你的学习内容还在，可以重试。请勿反复提交答案。</p>
          </div>
        )}
        <section className="rounded-3xl border border-[#d9e7df] bg-white p-5 shadow-sm sm:p-8">
          {loading ? (
            <div role="status" className="flex items-center gap-2">
              <Loader2 className="animate-spin" />
              正在读取你的学习进度…
            </div>
          ) : phase === 'intro' ? (
            <>
              <h2 className="text-xl font-bold">今天的小目标</h2>
              <p className="my-4 leading-8">
                知道“平均分”是什么意思，能用分数说出选中的部分，并分清分子和分母。
              </p>
              <p className="mb-6 text-sm text-[#52716e]">
                这是一节分数试课。讲解为字幕模式，不需要额外 API
                Key。答题结果会保存到你的课程学习记录。
              </p>
              {questions.length !== 2 && (
                <p role="alert" className="mb-4 text-amber-800">
                  试课题目暂时不可用，请返回课程学习其他知识点。
                </p>
              )}
              {resumeFailed && (
                <div className="mb-4 flex flex-wrap gap-4">
                  <button
                    className="min-h-11 rounded-xl border px-4"
                    onClick={() => window.location.reload()}
                  >
                    重新读取进度
                  </button>
                  <a href="/school-learning/china/fractions-lab" className="min-h-11 p-3 underline">
                    开始新一轮，保留原记录
                  </a>
                </div>
              )}
              <button
                className={button}
                disabled={busy || resumeFailed || questions.length !== 2}
                onClick={() => void start()}
              >
                {busy && <Loader2 className="size-4 animate-spin" />}开始这节课
              </button>
            </>
          ) : phase === 'video' ? (
            <>
              <h2 className="mb-2 text-xl font-bold">把一个整体平均分成四份</h2>
              <p className="mb-3 text-sm font-semibold text-[#52716e]">字幕讲解 · 本片段无语音</p>
              <p className="mb-4 text-[#52716e]">点击播放，观察涂色的份数。可以随时暂停和回看。</p>
              {!fallback ? (
                <iframe
                  key="fractions-video"
                  src={FRACTIONS_HYBRID.videoUrl}
                  title="认识四分之三：字幕动态讲解"
                  sandbox="allow-scripts"
                  allow="fullscreen"
                  allowFullScreen
                  className="aspect-video w-full rounded-2xl border-0 bg-[#f2f8f5]"
                />
              ) : (
                <div className="rounded-2xl bg-[#f2f8f5] p-5">
                  <p className="mb-5 leading-7">
                    四份必须同样大。每一份是四分之一；涂色三份，就是四分之三。
                  </p>
                  <div aria-label="四个相等部分，前三份涂色" className="grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`flex h-24 items-center justify-center border-2 border-[#126e75] text-lg ${i < 3 ? 'bg-[#65cbb0]' : 'bg-white'}`}
                      >
                        1/4
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-3 text-sm leading-6 text-[#52716e] sm:hidden">
                手机上可以点播放器右下角全屏观看，也可以选择下面的图解。
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <button
                  className="min-h-11 rounded-xl px-3 text-sm font-semibold underline"
                  onClick={() => setFallback(!fallback)}
                >
                  {fallback ? '回到动态讲解' : '视频字小或无法播放？查看图解'}
                </button>
                <button className={button} disabled={busy} onClick={() => void advance('practice')}>
                  我来动手试试 →
                </button>
              </div>
            </>
          ) : phase === 'practice' ? (
            <>
              <h2 className="text-xl font-bold">请涂出这个整体的四分之三</h2>
              <p className="mb-6 mt-3 leading-7 text-[#52716e]">
                点击一份就能涂色，再点一次可以取消。先自己数一数，不着急。
              </p>
              <div
                role="group"
                aria-label="四个相等的部分，点击涂色"
                className="grid grid-cols-4 overflow-hidden rounded-2xl border-2 border-[#126e75]"
              >
                {selected.map((value, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-pressed={value}
                    aria-label={`第 ${index + 1} 份${value ? '，已涂色' : '，未涂色'}`}
                    onClick={() => {
                      setSelected((parts) => parts.map((part, i) => (i === index ? !part : part)));
                      setPracticeChecked(false);
                    }}
                    style={{ borderRight: index < 3 ? '2px solid #126e75' : undefined }}
                    className={`min-h-28 text-2xl font-bold transition-colors focus-visible:outline-4 focus-visible:outline-offset-[-4px] focus-visible:outline-[#126e75] ${value ? 'bg-[#65cbb0]' : 'bg-white'}`}
                  >
                    {value ? '✓' : '○'}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-center">平均分成 4 份，你涂了 {count} 份。</p>
              {practiceChecked && (
                <p role="status" className="mt-5 rounded-xl bg-[#edf6ee] p-4 leading-7">
                  {fractionPracticeFeedback(count)}
                </p>
              )}
              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <button
                  className="min-h-11 rounded-xl px-3 font-semibold underline"
                  onClick={() => {
                    setSelected([false, false, false, false]);
                    setPracticeChecked(false);
                  }}
                >
                  <RotateCcw className="mr-2 inline size-4" />
                  重新涂色
                </button>
                {practiceChecked && count === 3 ? (
                  <button
                    className={button}
                    disabled={busy}
                    onClick={() => void advance(reviewOnly ? 'completed' : 'check')}
                  >
                    {reviewOnly ? '结束回看 →' : '试试新的问题 →'}
                  </button>
                ) : (
                  <button className={button} onClick={() => setPracticeChecked(true)}>
                    检查一下
                  </button>
                )}
              </div>
            </>
          ) : phase === 'check' ? (
            <>
              <h2 className="text-xl font-bold">现在，让我看看你理解了吗</h2>
              <p className="mb-6 mt-2 text-[#52716e]">
                已完成 {FRACTIONS_HYBRID.questionIds.filter((id) => correctIds.includes(id)).length}{' '}
                / 2 道题。答案用 1/2 这样的格式填写。
              </p>
              {answerCorrect === true && (
                <p role="status" className="mb-4 rounded-xl bg-[#edf6ee] p-4">
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
                      htmlFor="fraction-answer"
                      className="block text-lg font-semibold leading-8"
                    >
                      {question.prompt}
                    </label>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <input
                        id="fraction-answer"
                        autoComplete="off"
                        maxLength={80}
                        value={answer}
                        onChange={(event) => {
                          setAnswer(event.target.value);
                          setAnswerCorrect(null);
                        }}
                        placeholder="例如：1/2"
                        className="min-h-12 w-44 rounded-xl border border-[#aac9bd] px-4 text-xl focus:outline-[#126e75]"
                      />
                      <button className={button} disabled={busy || !answer.trim()}>
                        {busy ? '正在保存…' : '提交答案'}
                      </button>
                    </div>
                  </form>
                  {answerCorrect === false && (
                    <div className="mt-5 rounded-xl bg-amber-50 p-4">
                      <p role="status" className="leading-7">
                        再想一想：先数总份数，再数题目选中的份数。需要帮助时，可以问问你的家教。
                      </p>
                      <form
                        method="post"
                        action="/api/learning/launch"
                        target="_blank"
                        rel="noopener"
                      >
                        <input type="hidden" name="mode" value="personal" />
                        <input type="hidden" name="prompt" value={tutorPrompt} />
                        <button className="mt-3 min-h-11 rounded-xl border border-[#aac9bd] bg-white px-4 font-semibold">
                          请我的家教引导一下 ↗
                        </button>
                      </form>
                    </div>
                  )}
                </>
              ) : (
                <button
                  className={button}
                  disabled={busy || !hasHybridAssessment(correctIds)}
                  onClick={() => void advance('completed')}
                >
                  {busy ? '正在保存…' : '完成并保存学习记录'}
                </button>
              )}
            </>
          ) : (
            <>
              <CheckCircle2 className="mb-4 size-12 text-[#126e75]" />
              <h2 className="text-2xl font-bold">这次学习完成了！</h2>
              <p className="my-4 leading-8">
                你练习了平均分、分子和分母，并通过了两道理解检查。这次结果已经保存在你的课程学习记录中。
              </p>
              <button
                className="mb-4 mr-4 min-h-12 rounded-2xl border border-[#aac9bd] px-5 font-bold"
                onClick={() => {
                  setReviewOnly(true);
                  setPhase('video');
                }}
              >
                回看讲解和操作
              </button>
              <Link className={button} href="/school-learning/china">
                回到课程，继续学习 →
              </Link>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
