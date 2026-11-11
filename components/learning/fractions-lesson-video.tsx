'use client';

import { useEffect, useRef, useState } from 'react';
import media from '@/lib/curriculum/fractions-media.json';
import story from '@/lib/curriculum/fractions-storyboard.json';

export type FractionChapter = 'explain' | 'reason' | 'recap';
export function FractionsLessonVideo({ chapter }: { chapter: FractionChapter }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [fallback, setFallback] = useState(false);
  const [status, setStatus] = useState('loading');
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
              <div
                aria-label={`四个相等部分，${shot.shaded} 份涂色`}
                className="my-3 grid grid-cols-4 overflow-hidden rounded-xl border-2 border-[#126e75]"
              >
                {[0, 1, 2, 3].map((part) => (
                  <div
                    key={part}
                    className={`flex min-h-16 items-center justify-center border-r border-[#126e75] text-lg last:border-r-0 ${part < shot.shaded ? 'bg-[#65cbb0]' : 'bg-white'}`}
                  >
                    1/4
                  </div>
                ))}
              </div>
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
          if (fallback) setStatus('loading');
        }}
      >
        {fallback ? '回到配音讲解' : '看不到或听不清？查看图解'}
      </button>
    </div>
  );
}
