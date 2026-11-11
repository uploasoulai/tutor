import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { reviewedSchoolActivity } from '@/lib/curriculum/reviewed-school-activities';
import { InteractiveRenderer } from '@/components/scene-renderers/interactive-renderer';

export default async function PlaceValueLabPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect('/login');
  const topic = (await searchParams).topic === 'cnm_p055' ? 'cnm_p055' : 'cnm_p053';
  const activity = reviewedSchoolActivity('china', `pep:${topic}`)!;
  return (
    <main className="min-h-screen bg-[#fff8ec] px-4 pb-28 pt-20 text-[#173e49]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="font-semibold underline">
          ← 回到平台首页
        </Link>
        <p className="mt-6 text-sm font-bold text-[#52716e]">二年级数学 · 数位探索</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">把数字搭出来，看看每一位的秘密</h1>
        <p className="my-4 leading-7">
          用百块、十条和小方块搭数。可以慢慢试，搭错了也能调整。这两个探索已经准备好，无需等待生成。
        </p>
        <nav aria-label="选择数位探索" className="mb-5 flex flex-wrap gap-3">
          {[
            ['cnm_p053', '搭出 243'],
            ['cnm_p055', '搭出 2046，认识中间的零'],
          ].map(([id, label]) => (
            <Link
              key={id}
              href={`?topic=${id}`}
              aria-current={topic === id ? 'page' : undefined}
              className={`min-h-12 rounded-2xl border-2 border-[#126e75] px-4 py-3 font-bold ${topic === id ? 'bg-[#126e75] text-white' : 'bg-white'}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <p className="mb-4 rounded-2xl bg-[#e1efea] p-4 leading-7">{activity.narration}</p>
        <section
          aria-label={activity.title}
          className="relative h-[75vh] min-h-[620px] overflow-hidden rounded-3xl border-2 border-[#b6d2c7] bg-white"
        >
          <InteractiveRenderer
            key={topic}
            content={{ type: 'interactive', html: activity.html, url: '' }}
            sceneId={topic}
          />
        </section>
        <p className="mt-4 text-sm leading-7 text-[#52716e]">
          这里是可反复体验的动手探索，不写入学习记录或成绩。学生回到课程后，可继续完整课堂与理解检查；课堂内容共用，学生记录各自保存。
        </p>
      </div>
    </main>
  );
}
