'use client';

import { useEffect, useRef, useState } from 'react';

const base = '/lessons/multiplication-demo-v3';

/** Prepared assets only. One audio owner; no API calls, autoplay or learner writes. */
export function MultiplicationWelcome() {
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);
  const [audioFailed, setAudioFailed] = useState(false);
  useEffect(() => {
    const voice = audio.current;
    const film = video.current;
    const pause = () => {
      if (document.hidden) {
        audio.current?.pause();
        video.current?.pause();
      }
    };
    document.addEventListener('visibilitychange', pause);
    return () => {
      document.removeEventListener('visibilitychange', pause);
      voice?.pause();
      film?.pause();
    };
  }, []);

  return (
    <aside
      aria-label="海边数学乐园开场"
      className="my-5 overflow-hidden rounded-3xl border border-[#efd295] bg-[#fff8e6]"
    >
      <div className="relative aspect-video overflow-hidden bg-[#e6f3ec]">
        {videoFailed ? (
          // Generated illustration is contextual scenery; mathematical counts are native diagrams.
          <img
            src={`${base}/welcome.webp`}
            alt="背着绿色书包的小海獭在明亮的海边教室欢迎你"
            className="size-full object-cover"
          />
        ) : (
          <video
            ref={video}
            data-demo-opening
            poster={`${base}/welcome.webp`}
            src={`${base}/opening.mp4`}
            muted
            loop
            playsInline
            preload="none"
            aria-label="小海獭欢迎动画，旁白在下方播放"
            className="size-full object-cover"
            onError={() => setVideoFailed(true)}
          />
        )}
        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-2 text-xs font-bold text-[#126e75]">
          海边数学乐园 · AI 情境动画
        </span>
      </div>
      <div className="space-y-3 p-5">
        <h3 className="text-xl font-bold">小小数学家，一起出发！</h3>
        <p className="leading-7 text-[#52716e]">
          帮小伙伴整理探险圆片，发现“几个几”的秘密。先看、再摆、最后讲给老师听。
        </p>
        <audio
          ref={audio}
          src={`${base}/welcome.mp3`}
          preload="none"
          onPlay={() => {
            setPlaying(true);
            if (!matchMedia('(prefers-reduced-motion: reduce)').matches)
              void video.current?.play().catch(() => {});
          }}
          onPause={() => {
            setPlaying(false);
            video.current?.pause();
          }}
          onEnded={() => {
            setPlaying(false);
            video.current?.pause();
          }}
          onError={() => {
            setAudioFailed(true);
            setPlaying(false);
            video.current?.pause();
          }}
        />
        <button
          className="min-h-12 rounded-2xl border-2 border-[#e9bf58] bg-[#ffdc79] px-5 py-3 font-bold text-[#593f13] disabled:opacity-50"
          disabled={audioFailed}
          onClick={() => {
            const player = audio.current;
            if (!player) return;
            if (!player.paused) {
              player.pause();
              video.current?.pause();
            } else {
              if (player.ended) player.currentTime = 0;
              void player.play().catch(() => setAudioFailed(true));
            }
          }}
        >
          {playing ? '暂停开场' : '播放欢迎动画和声音'}
        </button>
        <p role="status" className="text-sm text-[#52716e]">
          {audioFailed
            ? '声音暂时无法播放，可以直接开始下方课程。'
            : '点一下才播放声音；开始课程后，开场会自动停止。'}
        </p>
        <details className="text-sm leading-7 text-[#52716e]">
          <summary className="cursor-pointer">看开场文字</summary>
          <p>
            小小数学家，你好呀！欢迎来到海边数学乐园。今天，我们要帮小伙伴整理探险圆片。先看一看，再摆一摆，最后说说你的发现。准备好了吗？我们一起出发！
          </p>
        </details>
      </div>
    </aside>
  );
}
