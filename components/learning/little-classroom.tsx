'use client';
import { useEffect, useRef, useState } from 'react';
import { createClassroom3D } from '@/lib/learning/classroom-webgl';

export function LittleClassroom({ speaking }: { speaking: boolean }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const painter = useRef<{ update: (speaking: boolean) => void } | null>(null);
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    const node = canvas.current;
    if (!node) return;
    let disposed = false,
      frame = 0,
      last = 0,
      active = false;
    let renderer: ReturnType<typeof createClassroom3D> = null;
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const paint = (time = 0) => {
      if (disposed || !renderer) return;
      if (time - last >= 32 || !active) {
        renderer?.draw(time, active && !motion.matches);
        last = time;
      }
      if (active && !motion.matches && !document.hidden) frame = requestAnimationFrame(paint);
    };
    const update = (next: boolean) => {
      active = next;
      cancelAnimationFrame(frame);
      last = -100;
      paint(performance.now());
    };
    const lost = (event: Event) => {
      event.preventDefault();
      active = false;
      painter.current = null;
      cancelAnimationFrame(frame);
      renderer?.dispose();
      renderer = null;
      setAvailable(false);
    };
    const resize = new ResizeObserver(() => {
      last = -100;
      renderer?.draw(performance.now(), active && !motion.matches);
    });
    frame = requestAnimationFrame(() => {
      if (disposed) return;
      try {
        renderer = createClassroom3D(node);
      } catch {
        renderer = null;
      }
      setAvailable(Boolean(renderer));
      if (renderer) {
        painter.current = { update };
        resize.observe(node);
        node.addEventListener('webglcontextlost', lost);
        paint();
      }
    });
    const visibility = () => update(active);
    document.addEventListener('visibilitychange', visibility);
    motion.addEventListener('change', visibility);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resize.disconnect();
      node.removeEventListener('webglcontextlost', lost);
      renderer?.dispose();
      painter.current = null;
      document.removeEventListener('visibilitychange', visibility);
      motion.removeEventListener('change', visibility);
    };
  }, []);
  useEffect(() => {
    painter.current?.update(speaking);
  }, [speaking, available]);
  return (
    <aside
      className="mb-4 overflow-hidden rounded-3xl border-2 border-[#f0cf8a] bg-[#fff5db]"
      aria-label="小海老师的立体教室"
      data-speaking={speaking}
      data-renderer={available === true ? 'webgl' : available === false ? 'static' : 'loading'}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <strong className="text-[#72531d]">✦ 小海老师的探索教室</strong>
        <span className="text-xs text-[#72531d]">
          {speaking ? '老师正在讲，看看图里的小发现' : '准备好了，我们一起发现！'}
        </span>
      </div>
      <canvas
        ref={canvas}
        aria-label="3D 虚拟老师、黑板、课桌和明亮的教室"
        className={`h-[190px] w-full sm:h-[260px] ${available === false ? 'hidden' : ''}`}
      />
      {available === false && (
        <div className="flex min-h-36 items-center gap-5 px-6 pb-5">
          <svg
            viewBox="0 0 100 130"
            className="h-32 w-24 shrink-0"
            role="img"
            aria-label="微笑的小海老师"
          >
            <rect x="20" y="69" width="60" height="60" rx="24" fill="#138c94" />
            <circle cx="50" cy="42" r="30" fill="#f2c6a4" />
            <path d="M20 40Q15 1 50 8Q90 2 80 40L67 23Q43 34 30 23Z" fill="#263b4c" />
            <circle cx="40" cy="43" r="3" fill="#263b4c" />
            <circle cx="60" cy="43" r="3" fill="#263b4c" />
            <path d="M39 57Q50 67 61 57" fill="none" stroke="#9f5c43" strokeWidth="3" />
          </svg>
          <p className="leading-7 text-[#72531d]">
            这台设备使用轻量教室。老师陪你看图、摆一摆，课程照常学习。
          </p>
        </div>
      )}
    </aside>
  );
}
