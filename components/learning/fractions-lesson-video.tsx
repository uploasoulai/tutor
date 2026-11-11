'use client';

import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import media from '@/lib/curriculum/fractions-media.json';
import story from '@/lib/curriculum/fractions-storyboard.json';
const LittleClassroom = lazy(() =>
  import('./little-classroom').then((module) => ({ default: module.LittleClassroom })),
);

export type FractionChapter = 'explain' | 'reason' | 'recap';
export interface ReviewedVideoStory {
  chapters: {
    id: string;
    title: string;
    shots: {
      id: string;
      title: string;
      text: string;
      cue?: string;
      shaded?: number;
      groups?: number;
      each?: number;
      groupSizes?: number[];
      formula?: string;
    }[];
  }[];
}
export function FractionsLessonVideo({ chapter }: { chapter: FractionChapter }) {
  return <ReviewedLessonVideo chapter={chapter} media={media} story={story} />;
}
export function ReviewedLessonVideo({
  chapter,
  media,
  story,
  playful = false,
}: {
  chapter: FractionChapter;
  media: { asset: string };
  story: ReviewedVideoStory;
  playful?: boolean;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [fallback, setFallback] = useState(false);
  const [status, setStatus] = useState('loading');
  const [room, setRoom] = useState(true);
  const content = story.chapters.find((item) => item.id === chapter)!;
  useEffect(() => {
    if (fallback) return;
    const timer = window.setTimeout(() => setStatus('slow'), 12000);
    const message = (event: MessageEvent) => {
      if (
        event.source !== frame.current?.contentWindow ||
        event.data?.channel !== 'coastaltutor-reviewed-video' ||
        event.data?.version !== 2 ||
        event.data?.chapter !== chapter
      )
        return;
      if (!['ready', 'play', 'pause', 'ended', 'error'].includes(event.data.event)) return;
      window.clearTimeout(timer);
      setStatus(event.data.event);
    };
    window.addEventListener('message', message);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('message', message);
    };
  }, [chapter, fallback]);
  return (
    <div>
      <h2 className="text-xl font-bold">{content.title}</h2>
      <p className="mb-3 mt-2 text-sm leading-6 text-[#52716e]">
        {fallback
          ? '图解模式 · 每一步都可以慢慢看，也可以随时回到配音讲解。'
          : '配音与图形同步讲解 · 点播放开始，可暂停、拖动进度或从头再看。'}
      </p>
      {playful && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-semibold text-[#9a5a21]">一起看图，一起找到小发现</span>
          <button
            type="button"
            aria-pressed={room}
            onClick={() => setRoom(!room)}
            className="min-h-11 rounded-xl border border-[#d6b873] bg-[#fff5db] px-4 text-sm font-bold text-[#72531d]"
          >
            {room ? '切换专注模式' : '进入虚拟教室'}
          </button>
        </div>
      )}
      {playful && room && (
        <Suspense
          fallback={<p className="mb-4 rounded-2xl bg-[#fff5db] p-4">小海老师正在准备教室…</p>}
        >
          <LittleClassroom speaking={status === 'play' && !fallback} />
        </Suspense>
      )}
      {!fallback ? (
        <iframe
          ref={frame}
          src={`${media.asset}#chapter=${chapter}`}
          title={`${content.title}：配音动态讲解`}
          sandbox="allow-scripts"
          allow="autoplay; fullscreen"
          allowFullScreen
          onError={() => setStatus('error')}
          className="h-[520px] w-full rounded-2xl border-0 bg-[#f2f8f5] sm:h-[620px] lg:h-[760px]"
        />
      ) : (
        <div className="space-y-5 rounded-2xl bg-[#f2f8f5] p-4 sm:p-6">
          {content.shots.map((shot) => (
            <div key={shot.id}>
              <h3 className="font-bold">{shot.title}</h3>
              {shot.groups ? (
                <div className="my-3 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label={shot.cue}>
                  {(shot.groupSizes ?? Array(shot.groups).fill(shot.each ?? 2)).map(
                    (count: number, i: number) => (
                      <div
                        key={i}
                        className="rounded-xl border-2 border-[#126e75] bg-white p-3 text-center"
                      >
                        <span>第 {i + 1} 组</span>
                        <div className="my-2 flex flex-wrap justify-center gap-2">
                          {Array.from({ length: count }, (_, j) => (
                            <span
                              key={j}
                              className="size-6 rounded-full border border-[#126e75] bg-[#65cbb0]"
                            />
                          ))}
                        </div>
                        <span>{count} 个</span>
                      </div>
                    ),
                  )}
                </div>
              ) : (
                <div
                  aria-label={`四个相等部分，${shot.shaded} 份涂色`}
                  className="my-3 grid grid-cols-4 overflow-hidden rounded-xl border-2 border-[#126e75]"
                >
                  {[0, 1, 2, 3].map((part) => (
                    <div
                      key={part}
                      className={`flex min-h-16 items-center justify-center border-r border-[#126e75] text-lg last:border-r-0 ${part < (shot.shaded ?? 0) ? 'bg-[#65cbb0]' : 'bg-white'}`}
                    >
                      1/4
                    </div>
                  ))}
                </div>
              )}
              <p className="leading-7">{shot.text}</p>
            </div>
          ))}
        </div>
      )}
      {!fallback && ['error', 'slow'].includes(status) && (
        <p role="status" className="mt-3 rounded-xl bg-amber-50 p-3 text-sm">
          讲解暂时无法播放？可以先查看图解，课程仍能继续。
        </p>
      )}
      {!fallback && status === 'ended' && (
        <p role="status" className="mt-3 text-sm text-[#52716e]">
          这段讲解结束了。可以从头回看，准备好后再继续。
        </p>
      )}
      <button
        className="mt-3 min-h-11 rounded-xl px-3 text-sm font-semibold underline"
        onClick={() => {
          setFallback(!fallback);
          setStatus('loading');
        }}
      >
        {fallback ? '回到配音讲解' : '看不到或听不清？查看图解'}
      </button>
    </div>
  );
}
