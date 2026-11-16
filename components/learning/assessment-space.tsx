'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  assessmentTutorPrompt,
  type AssessmentConfig,
  type AssessmentReport,
} from '@/lib/curriculum/assessments';

type Question = {
  id: string;
  topicId: string;
  topicName: string;
  type: string;
  prompt: string;
  choices?: { key: string; text: string }[];
};
type Paper = {
  id?: string;
  preview: boolean;
  config: AssessmentConfig & { units?: string[] };
  questions: Question[];
  report?: AssessmentReport | null;
  status?: string;
};
const subjects: Record<string, string> = {
  math: '数学',
  chinese: '语文',
  english: '英语',
  science: '科学',
  morality: '道德与法治',
};
const scopes: Record<string, string> = {
  unit: '单元小测',
  midterm: '期中范围练习',
  final: '期末范围练习',
};
export function AssessmentSpace({
  preview,
  guardian = false,
}: {
  preview: boolean;
  guardian?: boolean;
}) {
  const [tab, setTab] = useState('start'),
    [grade, setGrade] = useState(2),
    [subject, setSubject] = useState('math'),
    [term, setTerm] = useState<'上' | '下'>('上'),
    [scope, setScope] = useState<AssessmentConfig['scope']>('unit'),
    [unit, setUnit] = useState(''),
    [count, setCount] = useState(10);
  const [meta, setMeta] = useState<{
    key: string;
    units: string[];
    selectedUnits: string[];
    subjects: { id: string; label: string }[];
    topicCount: number;
  } | null>(null);
  const [paper, setPaper] = useState<Paper | null>(null),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [history, setHistory] = useState<Paper[]>([]),
    [historyLoading, setHistoryLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  const config: AssessmentConfig = { grade, subject, term, scope, unit, count };
  const key = new URLSearchParams({
    grade: String(grade),
    subject,
    term,
    scope,
    unit,
    count: String(count),
  }).toString();
  async function request(url: string, options?: RequestInit) {
    const response = await fetch(url, { cache: 'no-store', ...options });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.error || '暂时没有保存成功，请重试');
    return data;
  }
  useEffect(() => {
    const controller = new AbortController();
    void fetch(`/api/school-assessments?${key}`, { signal: controller.signal, cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || '题库暂时无法读取');
        if (!controller.signal.aborted) setMeta({ key, ...data });
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, [key]);
  useEffect(() => {
    const id = new URLSearchParams(location.search).get('id');
    if (!id) return;
    const controller = new AbortController();
    void fetch(`/api/school-assessments?id=${encodeURIComponent(id)}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || '测验暂时无法打开');
        if (!controller.signal.aborted) {
          setPaper(data);
          setTab('start');
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(e.message);
      });
    return () => controller.abort();
  }, []);
  async function start() {
    setBusy(true);
    setError('');
    try {
      const data = await request('/api/school-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start',
          config: { ...config, unit: unit || meta?.units[0] },
        }),
      });
      setPaper(data);
      setAnswers({});
      if (data.id) {
        historyReplace(data.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '暂时无法开始');
    } finally {
      setBusy(false);
    }
  }
  function historyReplace(id: string) {
    const url = new URL(location.href);
    url.searchParams.set('id', id);
    window.history.replaceState(window.history.state, '', url);
  }
  async function submit() {
    if (!paper) return;
    setBusy(true);
    setError('');
    try {
      const data = await request('/api/school-assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          paper.preview
            ? { action: 'preview-grade', config: paper.config, answers }
            : { action: 'submit', id: paper.id, answers },
        ),
      });
      setPaper({ ...paper, report: data.report, status: 'completed' });
    } catch (e) {
      setError(e instanceof Error ? e.message : '暂时未能保存');
    } finally {
      setBusy(false);
    }
  }
  async function showHistory(nextTab = 'history') {
    setTab(nextTab);
    setError('');
    if (preview) return;
    setHistoryLoading(true);
    try {
      const data = await request('/api/school-assessments?history=1');
      setHistory(data.papers);
    } catch (e) {
      setError(e instanceof Error ? e.message : '暂时无法读取报告');
    } finally {
      setHistoryLoading(false);
    }
  }
  const button =
    'min-h-12 rounded-2xl border-2 border-[#b7d3c6] bg-white px-4 py-3 font-bold disabled:opacity-50';
  const primary = `${button} border-[#126e75] bg-[#126e75] text-white`;
  const ready = meta?.key === key;
  const recentQuestions = new Map<
    string,
    { item: AssessmentReport['results'][number]; paper: Paper }
  >();
  for (const saved of history)
    for (const item of saved.report?.results ?? [])
      if (!recentQuestions.has(item.questionId) && item.answered)
        recentQuestions.set(item.questionId, { item, paper: saved });
  const recentMistakes = [...recentQuestions.values()].filter(({ item }) => !item.correct);
  const recentTopics = new Map<string, { name: string; total: number; correct: number }>();
  for (const { item } of recentQuestions.values()) {
    const topic = recentTopics.get(item.topicId) ?? { name: item.topicName, total: 0, correct: 0 };
    topic.total++;
    if (item.correct) topic.correct++;
    recentTopics.set(item.topicId, topic);
  }
  return (
    <div>
      <nav aria-label="测验与错题" className="my-6 flex flex-wrap gap-3">
        {[
          ['start', '做小测'],
          ['history', '我的测验报告'],
          ['tools', '错题与家教'],
        ].map(([id, label]) => (
          <button
            className={button}
            aria-pressed={tab === id}
            key={id}
            onClick={() => (id === 'history' || id === 'tools' ? void showHistory(id) : setTab(id))}
          >
            {label}
          </button>
        ))}
      </nav>
      {preview && (
        <p className="my-4 rounded-2xl bg-[#fff0ce] p-4 leading-7">
          当前为家长或管理预览。可以体验试卷和判分，不会写入学生成绩。
        </p>
      )}
      {error && (
        <p role="alert" className="my-4 rounded-2xl bg-amber-50 p-4">
          {error}
        </p>
      )}
      {tab === 'tools' ? (
        <section className="grid gap-4 sm:grid-cols-3">
          {!preview && (
            <div className="rounded-3xl border bg-white p-5 sm:col-span-3">
              <h2 className="text-xl font-bold">我的课程错题与待巩固知识点</h2>
              <p className="my-3 text-sm leading-7 text-[#52716e]">
                根据最近20份测验中每道题最近一次已作答的结果整理。答对后的旧错题不再列出；这只是练习线索，家教会继续了解你的想法。
              </p>
              {historyLoading ? (
                <p role="status">正在整理最近的练习…</p>
              ) : recentMistakes.length === 0 ? (
                <p>这里暂时没有待巩固的已作答错题。先做一次小测，或到家教错题本继续练习。</p>
              ) : (
                <>
                  <ul className="my-4 space-y-2">
                    {[...recentTopics.entries()]
                      .filter(([, t]) => t.correct < t.total)
                      .map(([id, t]) => (
                        <li key={id} className="rounded-xl bg-[#fff4dd] p-3">
                          {t.name} · {t.correct}/{t.total}题答对 · 可以再练一练
                        </li>
                      ))}
                  </ul>
                  {recentMistakes.slice(0, 6).map(({ item, paper: saved }) => (
                    <article key={item.questionId} className="my-3 rounded-2xl border p-4">
                      <h3 className="font-bold whitespace-pre-line">{item.prompt}</h3>
                      <p className="my-3">我的回答：{item.response}</p>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className={button}
                          href={`/school-learning/assessments?id=${saved.id}`}
                        >
                          查看这份报告
                        </Link>
                        <Link
                          className={button}
                          href={`/school-learning/china?topicId=${encodeURIComponent(item.topicId)}`}
                        >
                          回到这个知识点
                        </Link>
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
                            value={assessmentTutorPrompt(
                              saved.report!,
                              saved.config.grade,
                              item.questionId,
                            )}
                          />
                          <button className={button}>陪我弄懂这道题 ↗</button>
                        </form>
                      </div>
                    </article>
                  ))}
                  {recentMistakes.length > 6 && (
                    <p>还有{recentMistakes.length - 6}道，可在“我的测验报告”中查看。</p>
                  )}
                </>
              )}
            </div>
          )}
          {(guardian
            ? [['guardian', '孩子的家教空间', '查看已授权的家庭管理与学习支持。']]
            : [
                ['mistakes', '我的家教错题本', '把题目和自己的想法带给家教，找出卡住的那一步。'],
                ['practice', '每日复习', '让需要巩固的题目在合适的时候再练一次。'],
                ['mastery', '我的掌握路径', '围绕想学会的知识点，安排下一步学习。'],
              ]
          ).map(([mode, title, copy]) => (
            <a
              key={mode}
              href={`/api/learning/launch?mode=${mode}`}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-3xl border bg-white p-5"
            >
              <h2 className="text-xl font-bold">{title} ↗</h2>
              <p className="mt-3 leading-7 text-[#52716e]">{copy}</p>
            </a>
          ))}
          <p className="sm:col-span-3 text-sm leading-7 text-[#52716e]">
            这里打开同一个私人家教工作区。课程测验成绩在“我的测验报告”查看；家教自己的错题与复习记录在家教里查看。
          </p>
        </section>
      ) : tab === 'history' ? (
        <section className="space-y-3">
          {preview ? (
            <p>学生账号完成测验后，报告会保存在自己的学习档案中。</p>
          ) : history.length === 0 ? (
            <p>还没有测验记录，先做一个轻松的小测吧。</p>
          ) : (
            history.map((item) => (
              <Link
                className="block rounded-2xl border bg-white p-5"
                key={item.id}
                href={`/school-learning/assessments?id=${item.id}`}
              >
                {item.config.grade}年级{subjects[item.config.subject] ?? '课程'} ·{' '}
                {scopes[item.config.scope]} · {item.report ? `${item.report.score}分` : '尚未提交'}{' '}
                →
              </Link>
            ))
          )}
        </section>
      ) : paper ? (
        <section className="rounded-3xl border border-[#d7e5db] bg-white p-5 sm:p-8">
          <h2 className="text-2xl font-bold">
            {paper.config.grade}年级{subjects[paper.config.subject] ?? '课程'} ·{' '}
            {scopes[paper.config.scope]}
          </h2>
          {paper.report ? (
            <>
              <p className="my-5 text-xl font-bold">
                完成啦！{paper.report.correct} / {paper.report.total} 题答对 · {paper.report.score}
                分
              </p>
              <p className="mb-5 leading-7 text-[#52716e]">
                {paper.preview
                  ? '这是预览结果，没有保存学生成绩。'
                  : '成绩已保存。再看看哪些地方值得练一练。'}
                这只是本次小测的表现，不代表孩子的全部能力。
              </p>
              <h3 className="font-bold">这次各知识点的表现</h3>
              <ul className="my-3 space-y-2">
                {paper.report.topics.map((topic) => (
                  <li className="rounded-xl bg-[#edf6f0] p-3" key={topic.topicId}>
                    {topic.name}：{topic.correct}/{topic.total}题答对
                    {topic.answered < topic.total ? ' · 还有未作答的题' : ''}
                    {topic.answered > topic.correct ? ' · 值得再练一练' : ''}
                  </li>
                ))}
              </ul>
              <h3 className="mt-6 font-bold">需要再看一看的题</h3>
              {paper.report.results
                .filter((q) => !q.correct)
                .map((item, index) => (
                  <div className="my-3 rounded-2xl border p-4" key={item.questionId}>
                    <p className="font-bold">
                      {index + 1}. {item.prompt}
                    </p>
                    <p className="my-3">我的回答：{item.response || '还没作答'}</p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className={button}
                        href={`/school-learning/china?topicId=${encodeURIComponent(item.topicId)}`}
                      >
                        回到这个知识点
                      </Link>
                      {item.answered && !preview && (
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
                            value={assessmentTutorPrompt(
                              paper.report!,
                              paper.config.grade,
                              item.questionId,
                            )}
                          />
                          <button className={button}>请我的家教引导一下 ↗</button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              <button
                className={`${button} mt-5`}
                onClick={() => {
                  setPaper(null);
                  const url = new URL(location.href);
                  url.searchParams.delete('id');
                  window.history.replaceState(window.history.state, '', url);
                }}
              >
                选择下一次练习
              </button>
            </>
          ) : (
            <>
              <p className="my-4 leading-7 text-[#52716e]">
                共{paper.questions.length}题，不计时。慢慢想，先完成自己的尝试，再提交看看。范围：
                {paper.config.units?.join('、')}
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void submit();
                }}
                className="space-y-5"
              >
                {paper.questions.map((question, index) => (
                  <fieldset className="rounded-2xl border border-[#d6e7dc] p-4" key={question.id}>
                    <legend className="px-2 font-bold">
                      第{index + 1}题 · {question.topicName}
                    </legend>
                    <p className="mb-4 leading-8">{question.prompt}</p>
                    {question.choices?.length ? (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {question.choices.map((choice) => (
                          <label
                            key={choice.key}
                            className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl bg-[#f3f8f4] p-3"
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={choice.key}
                              checked={answers[question.id] === choice.key}
                              onChange={() =>
                                setAnswers((old) => ({ ...old, [question.id]: choice.key }))
                              }
                            />
                            {choice.key}. {choice.text}
                          </label>
                        ))}
                      </div>
                    ) : (
                      <label className="flex flex-wrap items-center gap-3">
                        我的答案
                        <input
                          className="min-h-12 w-44 rounded-xl border px-3"
                          aria-label={`第${index + 1}题答案`}
                          maxLength={1000}
                          value={answers[question.id] ?? ''}
                          onChange={(e) =>
                            setAnswers((old) => ({ ...old, [question.id]: e.target.value }))
                          }
                        />
                      </label>
                    )}
                  </fieldset>
                ))}
                <p className="text-sm text-[#52716e]">
                  还有{paper.questions.filter((q) => !answers[q.id]?.trim()).length}
                  题未作答。提交后会保留这一次结果，再练可以另开一份。
                </p>
                <button className={primary} disabled={busy}>
                  {busy ? '正在保存…' : '完成并查看报告'}
                </button>
              </form>
            </>
          )}
        </section>
      ) : (
        <section className="rounded-3xl border border-[#d7e5db] bg-white p-5 sm:p-8">
          <h2 className="text-2xl font-bold">选一个范围，轻松试一试</h2>
          <div className="my-5 grid gap-4 sm:grid-cols-3">
            <label>
              年级
              <select
                className={`${button} mt-2 block w-full`}
                value={grade}
                onChange={(e) => {
                  setGrade(Number(e.target.value));
                  setUnit('');
                }}
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}年级
                  </option>
                ))}
              </select>
            </label>
            <label>
              学科
              <select
                className={`${button} mt-2 block w-full`}
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setUnit('');
                }}
              >
                {(ready && meta.subjects.length
                  ? meta.subjects
                  : [{ id: 'math', label: '数学' }]
                ).map((item) => (
                  <option value={item.id} key={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              学期
              <select
                className={`${button} mt-2 block w-full`}
                value={term}
                onChange={(e) => {
                  setTerm(e.target.value as '上' | '下');
                  setUnit('');
                }}
              >
                <option value="上">上学期</option>
                <option value="下">下学期</option>
              </select>
            </label>
            <label>
              练习范围
              <select
                className={`${button} mt-2 block w-full`}
                value={scope}
                onChange={(e) => setScope(e.target.value as AssessmentConfig['scope'])}
              >
                {Object.entries(scopes).map(([id, label]) => (
                  <option value={id} key={id}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            {scope === 'unit' && (
              <label>
                单元
                <select
                  className={`${button} mt-2 block w-full`}
                  value={unit || meta?.units[0] || ''}
                  onChange={(e) => setUnit(e.target.value)}
                >
                  {(ready ? meta.units : []).map((name) => (
                    <option value={name} key={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              题量
              <select
                className={`${button} mt-2 block w-full`}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
              >
                {[5, 10, 15, 20].map((n) => (
                  <option value={n} key={n}>
                    {n}题
                  </option>
                ))}
              </select>
            </label>
          </div>
          <p className="my-4 leading-7 text-[#52716e]">
            {ready
              ? `将从${meta.topicCount}个知识点选题。范围：${meta.selectedUnits.join('、') || '暂无可用题目'}`
              : '正在查看题库…'}
          </p>
          <p className="mb-5 text-sm leading-7 text-[#52716e]">
            期中按当前学期目录前半部分选题，期末覆盖本学期目录，供复习使用；请先核对是否符合学校已教范围。这里先做选择和数字填空题，写作等主观题可请私人家教一起点评。
          </p>
          <button
            className={primary}
            disabled={busy || !ready || !meta.topicCount}
            onClick={() => void start()}
          >
            {busy ? '正在准备…' : preview ? '预览这份小测' : '开始我的小测'}
          </button>
        </section>
      )}
    </div>
  );
}
