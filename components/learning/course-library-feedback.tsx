'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export function CourseLibraryFeedback({
  courseId,
  initialCourse,
}: {
  courseId: string;
  initialCourse?: { status: string; submitted: boolean };
}) {
  const [course, setCourse] = useState<{ status: string; submitted: boolean } | null>(
    initialCourse ?? null,
  );
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('');
  const [recommended, setRecommended] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (initialCourse && !open) return;
    const controller = new AbortController();
    void fetch(`/api/course-library?id=${encodeURIComponent(courseId)}`, {
      signal: controller.signal,
      cache: 'no-store',
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (controller.signal.aborted) return;
        if (data?.success) {
          setCourse(data.course);
          setKind(data.feedback?.kind ?? '');
          setRecommended(data.feedback?.recommend ?? false);
        } else setCourse(initialCourse ?? null);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [courseId, initialCourse, open]);
  async function save(update: { kind?: string; recommend?: boolean }) {
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/api/course-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'feedback', courseId, ...update }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error('暂时没能保存，稍后可以再试。');
      if (update.kind) setKind(update.kind);
      if (update.recommend !== undefined) setRecommended(update.recommend);
      setMessage(
        update.recommend === true
          ? '收到推荐啦！平台会检查，不会直接替换大家的课程。'
          : '收到啦，谢谢你！',
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '暂时没能保存。');
    } finally {
      setBusy(false);
    }
  }
  if (!course) return null;
  const button =
    'min-h-11 rounded-xl border border-[#aacbbf] bg-white px-4 py-2 text-sm font-bold disabled:opacity-50';
  return (
    <details
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className="rounded-2xl border border-[#d7e8df] bg-[#f1f8f3] p-3 text-[#173e49]"
    >
      <summary className="cursor-pointer text-sm font-bold">这节课怎么样？（可以跳过）</summary>
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          ['understood', '听懂了'],
          ['difficult', '有点难'],
          ['another_way', '想换个讲法'],
        ].map(([id, label]) => (
          <button
            key={id}
            className={button}
            aria-pressed={kind === id}
            disabled={busy}
            onClick={() => void save({ kind: id })}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          className={button}
          disabled={busy}
          aria-pressed={recommended}
          onClick={() => void save({ recommend: !recommended })}
        >
          {recommended ? '已推荐 · 撤回' : '推荐这堂课'}
        </button>
        <Link href="/school-learning/library" className="px-3 py-3 text-sm underline">
          看看课程库
        </Link>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer py-2">发现具体问题</summary>
        <div className="flex flex-wrap gap-2">
          {[
            ['content_issue', '知识或答案有问题'],
            ['interaction_issue', '按钮或画面有问题'],
          ].map(([id, label]) => (
            <button
              key={id}
              className={button}
              disabled={busy}
              onClick={() => void save({ kind: id })}
            >
              {label}
            </button>
          ))}
        </div>
      </details>
      <p role="status" className="mt-2 text-sm leading-6">
        {message}
      </p>
    </details>
  );
}
