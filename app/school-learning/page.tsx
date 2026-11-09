'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Compass,
  Globe2,
  Loader2,
  Map,
} from 'lucide-react';

import { getDevPreviewUser } from '@/lib/auth/dev-preview';
import { createClient } from '@/lib/supabase/client';

const subscribeToNoChanges = () => () => {};
const getStudentPreviewSnapshot = () => Boolean(getDevPreviewUser('student'));
const getServerStudentPreviewSnapshot = (): boolean | null => null;

const tracks = [
  {
    id: 'bc',
    title: 'BC 课程',
    subtitle: 'British Columbia · Grades K–9',
    description: '按 BC 学习成果循序学习，进入互动课程、练习和复习。',
    icon: Map,
    color: 'border-sky-200 bg-sky-50 text-sky-800',
    action: '继续 BC 学习',
    available: true,
  },
  {
    id: 'china',
    title: '中国课程',
    subtitle: '小学 · 初中 · 高中',
    description: '按年级、学科、教材章节和知识图谱安排互动课程与练习。',
    icon: BookOpen,
    color: 'border-rose-200 bg-rose-50 text-rose-800',
    action: '进入中国课程',
    available: true,
  },
  {
    id: 'general',
    title: '通用 K–12',
    subtitle: '跨地区主题学习',
    description: '先从小学主题学习开始，后续逐步补充不同国家和地区的课程路线。',
    icon: Globe2,
    color: 'border-amber-200 bg-amber-50 text-amber-800',
    action: '课程路线准备中',
    available: false,
  },
];

export default function SchoolLearningPage() {
  const router = useRouter();
  const isDevPreview = useSyncExternalStore(
    subscribeToNoChanges,
    getStudentPreviewSnapshot,
    getServerStudentPreviewSnapshot,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDevPreview !== false) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.replace('/login');
        return;
      }
      setLoading(false);
    });
  }, [isDevPreview]);

  if (loading && isDevPreview !== true) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#174c70]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f0f8fc_0%,#fff_42%,#fffaf0_100%)] px-4 py-6 text-[#172b43] sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => router.push('/student')}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold text-[#4c647a] transition hover:bg-white"
        >
          <ArrowLeft className="h-4 w-4" />
          返回学习首页
        </button>

        <section className="mt-8 rounded-[2rem] border border-white/80 bg-white/80 p-6 shadow-sm backdrop-blur sm:p-10">
          <div className="flex items-start gap-4">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e1f2f3] text-[#236e76]">
              <Compass className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#56838a]">
                School Learning
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                选择你的课程路线
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-[#607286]">
                课程学习会跟着所选大纲或知识图谱一步一步前进。每个知识点都可以进入互动课堂、动手练习，再回来看自己的学习进度。
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {tracks.map(
              ({ id, title, subtitle, description, icon: Icon, color, action, available }) => (
                <article
                  key={id}
                  className={`flex min-h-[270px] flex-col rounded-3xl border p-5 sm:p-6 ${color} ${available ? 'shadow-sm' : 'opacity-75'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/80">
                      <Icon className="h-6 w-6" />
                    </span>
                    {available && <Check className="mt-1 h-5 w-5 opacity-70" aria-label="Ready" />}
                  </div>
                  <div className="mt-5">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-70">
                      {subtitle}
                    </p>
                    <p className="mt-3 text-sm leading-6 opacity-85">{description}</p>
                  </div>
                  <button
                    disabled={!available}
                    onClick={() =>
                      router.push(
                        id === 'china'
                          ? '/school-learning/china'
                          : id === 'bc'
                            ? '/school-learning/bc'
                            : '/student',
                      )
                    }
                    className="mt-auto inline-flex min-h-12 items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 text-left text-sm font-bold shadow-sm transition hover:-translate-y-0.5 hover:shadow disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {action}
                    {available && <ChevronRight className="h-4 w-4" />}
                  </button>
                </article>
              ),
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
