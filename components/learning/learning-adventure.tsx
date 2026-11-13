import Link from 'next/link';
import { ArrowRight, Play, Sparkles, Shapes } from 'lucide-react';

/** Original code-native illustration; no network media, generation or learner records. */
export function LearningAdventure() {
  return (
    <section
      aria-label="准备好，一起发现新知识"
      className="relative mt-6 overflow-hidden rounded-[2rem] border-2 border-[#efd49c] bg-[linear-gradient(120deg,#fff3d5_0%,#fff9ed_52%,#dff4eb_100%)] p-5 shadow-[0_6px_0_#eedbb7] sm:p-7"
    >
      <div className="relative grid gap-5 md:grid-cols-[minmax(0,1fr)_250px] md:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-sm font-bold text-[#865315]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            每一个“为什么”，都值得发现
          </span>
          <h2 className="mt-4 text-2xl font-extrabold leading-tight text-[#173e49] sm:text-3xl">
            今天，和小海老师一起探索吧！
          </h2>
          <p className="mt-3 max-w-xl text-base leading-7 text-[#526b63]">
            先看一看，再动手试一试。想不明白也没关系，我们一步一步来。
          </p>
          <ol
            aria-label="怎样开始学习"
            className="my-5 flex flex-wrap gap-2 text-sm font-bold text-[#365b5a]"
          >
            {['看老师讲', '亲手试一试', '说说你的发现'].map((step, index) => (
              <li key={step} className="flex items-center gap-2 rounded-xl bg-white/75 px-3 py-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#d6eee5]">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/school-learning/china/multiplication-lab"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-b-4 border-[#084b55] bg-[#127888] px-5 py-3 font-bold text-white transition hover:bg-[#086978] motion-safe:active:translate-y-0.5 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#cf8e1c]"
            >
              <Play className="h-5 w-5" aria-hidden="true" />
              二年级 · 乘法探索课
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/school-learning/china/place-value-lab"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border-2 border-b-4 border-[#d4aa69] bg-white px-5 py-3 font-bold text-[#785019] transition hover:bg-[#fff9e9] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#127888]"
            >
              <Shapes className="h-5 w-5" aria-hidden="true" />
              动手搭数字
            </Link>
          </div>
          <p className="mt-3 text-xs leading-6 text-[#647766]">
            这两项探索已准备好，不用等待生成。也可以在下方选择自己的课程。
          </p>
        </div>
        <svg
          viewBox="0 0 270 220"
          aria-hidden="true"
          className="mx-auto hidden w-full max-w-[250px] md:block"
        >
          <circle cx="141" cy="111" r="99" fill="#c9e9df" />
          <circle cx="227" cy="35" r="17" fill="#f5c55f" />
          <path d="M42 166Q101 150 142 168Q193 148 242 166V196H42Z" fill="#efc689" />
          <path
            d="M64 122Q100 112 140 129V179Q101 163 64 173Z"
            fill="#fffdf5"
            stroke="#397d7a"
            strokeWidth="4"
          />
          <path
            d="M140 129Q178 111 219 122V173Q180 163 140 179Z"
            fill="#fffdf5"
            stroke="#397d7a"
            strokeWidth="4"
          />
          <path
            d="M140 130V179M79 137L123 142M158 141L201 134M80 152L113 156M159 155L191 151"
            stroke="#8abbb0"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <rect x="87" y="41" width="106" height="63" rx="14" fill="#24747b" />
          <circle cx="110" cy="73" r="8" fill="#f5d275" />
          <circle cx="139" cy="73" r="8" fill="#f5d275" />
          <circle cx="168" cy="73" r="8" fill="#f5d275" />
          <path d="M43 56L47 67L59 68L50 76L52 88L42 82L32 88L34 76L25 68L37 67Z" fill="#eeab6d" />
          <path
            d="M219 92L225 103L238 106L228 114L229 127L218 121L206 126L210 113L202 102L215 102Z"
            fill="#6ab8b1"
          />
        </svg>
      </div>
    </section>
  );
}
