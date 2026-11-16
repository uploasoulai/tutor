'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { CourseLibraryFeedback } from './course-library-feedback';

type Course = {
  id: string;
  cacheKey: string;
  createdAt: string;
  track: string;
  canonicalId: string;
  title: string;
  kind: string;
  path: string;
  status: string;
  submitted: boolean;
  eligibleForReview: boolean;
  checks: { pass?: boolean };
  feedbackCount: number;
  recommendations: number;
  understood: number;
  difficult: number;
  issues: number;
};
const statuses: Record<string, string> = {
  draft: '个人候选',
  testing: '试用中',
  recommended: '平台推荐',
  retired: '历史版本',
};
export function CourseLibraryBoard({
  admin = false,
  preview = false,
}: {
  admin?: boolean;
  preview?: boolean;
}) {
  const [courses, setCourses] = useState<Course[]>([]),
    [tab, setTab] = useState('library'),
    [track, setTrack] = useState('all');
  const [loading, setLoading] = useState(true),
    [available, setAvailable] = useState(true),
    [error, setError] = useState(''),
    [busy, setBusy] = useState('');
  const [checklist, setChecklist] = useState<Record<string, Record<string, boolean>>>({});
  const [showAlternatives, setShowAlternatives] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const query = new URLSearchParams(
        admin
          ? { admin: '1' }
          : tab === 'mine'
            ? { mine: '1' }
            : tab === 'library'
              ? { trials: '1' }
              : {},
      );
      if (track !== 'all') query.set('track', track);
      const response = await fetch(`/api/course-library?${query}`, { cache: 'no-store' });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || '课程库暂时无法读取');
      setCourses(body.courses);
      setAvailable(body.available);
    } catch (e) {
      setError(e instanceof Error ? e.message : '读取失败');
    } finally {
      setLoading(false);
    }
  }, [admin, tab, track]);
  useEffect(() => {
    void load();
  }, [load]);
  async function review(course: Course, status: string) {
    setBusy(course.id);
    setError('');
    try {
      const response = await fetch('/api/course-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          courseId: course.id,
          status,
          checklist: checklist[course.id] ?? {},
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || '保存失败');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setBusy('');
    }
  }
  async function start(course: Course) {
    if (preview || course.kind === 'prepared' || course.track !== 'china') {
      location.assign(course.path);
      return;
    }
    setBusy(course.id);
    setError('');
    const [editionId, ...topic] = course.canonicalId.split(':');
    try {
      const response = await fetch('/api/china-curriculum/lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic.join(':'),
          editionId,
          libraryClassroomId: course.id,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || '暂时无法开始');
      location.assign(
        `/school-learning/china?topicId=${encodeURIComponent(topic.join(':'))}&edition=${encodeURIComponent(editionId)}&sessionId=${encodeURIComponent(body.sessionId)}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : '开始失败');
      setBusy('');
    }
  }
  const button =
    'min-h-11 rounded-xl border border-[#abcbbd] bg-white px-4 py-2 font-bold disabled:opacity-50';
  const mainVersions = new Map<string, Course>();
  for (const course of courses) {
    const previous = mainVersions.get(course.cacheKey);
    if (
      !previous ||
      (course.status === 'recommended' && previous.status !== 'recommended') ||
      (course.status === previous.status && course.createdAt < previous.createdAt)
    )
      mainVersions.set(course.cacheKey, course);
  }
  const displayedCourses =
    admin || tab === 'mine' || showAlternatives ? courses : [...mainVersions.values()];
  return (
    <div>
      <div className="my-5 flex flex-wrap gap-3">
        {!admin &&
          [
            ['recommended', '推荐课程'],
            ['library', '全部可用课程'],
            ['mine', '我的版本'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={button}
              aria-pressed={tab === id}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        <label className="flex items-center gap-2">
          课程路线
          <select className={button} value={track} onChange={(e) => setTrack(e.target.value)}>
            <option value="all">全部</option>
            <option value="china">中国课程</option>
            <option value="bc">BC课程</option>
          </select>
        </label>
      </div>
      {!admin && tab !== 'mine' && courses.length > mainVersions.size && (
        <button className={button} onClick={() => setShowAlternatives(!showAlternatives)}>
          {showAlternatives ? '只看每课的首选版本' : '想换个讲法？看看其他版本'}
        </button>
      )}
      {error && (
        <p role="alert" className="my-4 rounded-xl bg-amber-50 p-4">
          {error}
          <button className="ml-3 underline" onClick={() => void load()}>
            再读一次
          </button>
        </p>
      )}
      {loading ? (
        <p role="status">正在打开课程书架…</p>
      ) : !available ? (
        <p>课程库正在准备中，原来的课纲和学习记录仍可使用。</p>
      ) : courses.length === 0 ? (
        <p className="rounded-2xl bg-white p-6">
          这里还没有课程。可以先从课纲学习；准备好的新版本会逐步加入。
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {displayedCourses.map((course) => (
            <article
              key={course.id}
              className="rounded-3xl border border-[#d6e6dc] bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-bold text-[#52716e]">
                {course.track === 'china' ? '中国课程' : 'BC课程'} · {statuses[course.status]}
              </p>
              <h2 className="my-3 text-xl font-bold">{course.title}</h2>
              <p className="mb-4 text-sm leading-6 text-[#52716e]">
                {course.status === 'recommended'
                  ? '内容已准备好，直接进入，不用等待生成。'
                  : course.status === 'draft'
                    ? '这是个人候选版本，推荐后由平台检查，不会覆盖公共课程。'
                    : '这是一堂试用课程，欢迎体验和反馈。'}
              </p>
              <div className="flex flex-wrap gap-2">
                {admin ? (
                  <Link
                    href={`${course.path}${course.path.includes('?') ? '&' : '?'}review=1`}
                    className={button}
                  >
                    打开检查
                  </Link>
                ) : (
                  <button
                    className={`${button} bg-[#fff1c9]`}
                    disabled={busy === course.id}
                    onClick={() => void start(course)}
                  >
                    {preview || course.track === 'bc'
                      ? '预览课程'
                      : busy === course.id
                        ? '正在准备…'
                        : '开始学习'}
                  </button>
                )}
                {course.track === 'bc' && !admin && (
                  <Link href="/school-learning/bc" className="px-3 py-3 text-sm underline">
                    从BC课纲记录学习
                  </Link>
                )}
              </div>
              {admin ? (
                <div className="mt-4 space-y-3 border-t pt-4">
                  <p className="text-sm">
                    {course.feedbackCount}人反馈 · {course.recommendations}人推荐 ·{' '}
                    {course.understood}人听懂 · {course.difficult}人觉得难 · {course.issues}
                    项问题反馈
                  </p>
                  <p className="text-sm">
                    基本检查：{course.checks.pass ? '通过（不代表知识审核通过）' : '待检查'}
                    {course.submitted ? ' · 已提交推荐' : ''}
                  </p>
                  <div className="space-y-2">
                    {[
                      ['accurate', '已核对知识、例题与答案'],
                      ['ageAppropriate', '孩子能听懂，节奏适合该年级'],
                      ['works', '已检查画面、手机操作和媒体'],
                    ].map(([id, label]) => (
                      <label key={id} className="flex min-h-11 items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={checklist[course.id]?.[id] ?? false}
                          onChange={(e) =>
                            setChecklist((old) => ({
                              ...old,
                              [course.id]: { ...old[course.id], [id]: e.target.checked },
                            }))
                          }
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      ['testing', '开放试用'],
                      ['recommended', '设为默认推荐'],
                      ['retired', '保留为历史版本'],
                    ].map(([id, label]) => (
                      <button
                        key={id}
                        className={button}
                        disabled={
                          busy === course.id ||
                          (id !== 'retired' && !course.eligibleForReview) ||
                          (id === 'recommended' &&
                            !['accurate', 'ageAppropriate', 'works'].every(
                              (key) => checklist[course.id]?.[key],
                            ))
                        }
                        onClick={() => void review(course, id)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs leading-6">
                    同一课纲版本只保留一个默认推荐。换默认课会保留旧版本和既有学习记录。
                  </p>
                </div>
              ) : (
                <div className="mt-4">
                  <CourseLibraryFeedback courseId={course.id} initialCourse={course} />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
