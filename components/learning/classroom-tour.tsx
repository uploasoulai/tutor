'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CoastalMark } from '@/components/coastal-mark';
import { ReviewedLessonVideo, type FractionChapter } from './fractions-lesson-video';
import media from '@/lib/curriculum/multiplication-media.json';
import story from '@/lib/curriculum/multiplication-storyboard.json';

/** Public, authored course media only. No learner APIs, prompts or personal records. */
export function ClassroomTour() {
  const [chapter, setChapter] = useState<FractionChapter>('explain');
  return (
    <main className="min-h-screen bg-[#fff8ec] px-4 pb-24 pt-20 text-[#173e49]">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 font-bold">
          <CoastalMark className="size-6" />
          CoastalTutor · 回到主页
        </Link>
        <p className="mt-6 font-bold text-[#ac6b25]">公开课堂预览 · 二年级数学实验课</p>
        <h1 className="my-3 text-3xl font-black">跟小海老师和同学，一起发现乘法</h1>
        <p className="mb-5 leading-7">
          无需登录。点播放开始，短讲解后会停下来等你。先试一试，再听同学的猜想；同学也会犯错，老师会陪你检查。这是公开预览，不写入个人学习记录。
        </p>
        <nav aria-label="预览章节" className="mb-6 flex flex-wrap gap-3">
          {story.chapters.map((c) => (
            <button
              key={c.id}
              aria-pressed={chapter === c.id}
              onClick={() => setChapter(c.id as FractionChapter)}
              className={`min-h-12 rounded-2xl border-2 border-[#b5d9cf] px-4 py-3 font-bold ${chapter === c.id ? 'bg-[#126e75] text-white' : 'bg-white'}`}
            >
              {c.title}
            </button>
          ))}
        </nav>
        <ReviewedLessonVideo key={chapter} chapter={chapter} media={media} story={story} playful />
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/school-learning/china/multiplication-lab"
            className="rounded-2xl bg-[#126e75] px-6 py-4 font-bold text-white"
          >
            进入完整课程，保存我的学习记录 →
          </Link>
          <Link href="/#learning" className="px-4 py-4 font-bold underline">
            看看三个学习空间
          </Link>
        </div>
      </div>
    </main>
  );
}
