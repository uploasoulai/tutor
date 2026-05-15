'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { SettingsDialog } from '@/components/settings';
import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import { buildFallbackGoals, type TodayGoal } from '@/lib/curriculum/planner';
import {
  BarChart3,
  BookOpen,
  BookMarked,
  Calendar,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Home,
  Loader2,
  LogOut,
  RefreshCw,
  Settings,
  Sparkles,
  Target,
  Users,
  Zap,
} from 'lucide-react';

const GRADES = [
  'Grade 1',
  'Grade 2',
  'Grade 3',
  'Grade 4',
  'Grade 5',
  'Grade 6',
  'Grade 7',
  'Grade 8',
  'Grade 9',
];
const SUBJECTS = ['Math', 'Language Arts', 'Arts', 'ADST'];

export default function StudentDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loading, setLoading] = useState(true);
  const [planLoading, setPlanLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(DEFAULT_GRADE_LABEL);
  const [selectedSubject, setSelectedSubject] = useState(DEFAULT_SUBJECT);
  const [todayGoals, setTodayGoals] = useState<TodayGoal[]>(
    buildFallbackGoals(DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT),
  );
  const [planSource, setPlanSource] = useState<'supabase' | 'fallback'>('fallback');
  const [activeNav, setActiveNav] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }

      const metadata = data.user.user_metadata ?? {};
      setUser(data.user);
      setSelectedGrade(metadata.grade ?? DEFAULT_GRADE_LABEL);
      setSelectedSubject(metadata.subjects?.[0] ?? DEFAULT_SUBJECT);
      setLoading(false);
    });
  }, [router, supabase.auth]);

  useEffect(() => {
    if (!user) return;
    void loadTodayPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, selectedGrade, selectedSubject]);

  const averageMastery = useMemo(() => {
    const value =
      todayGoals.reduce((total, goal) => total + goal.mastery, 0) / Math.max(1, todayGoals.length);
    return Math.round(value * 100);
  }, [todayGoals]);

  const firstName =
    user?.user_metadata?.first_name ?? user?.user_metadata?.preferred_name ?? 'Student';

  async function loadTodayPlan() {
    if (!user) return;

    setPlanLoading(true);

    try {
      const fallbackGoals = buildFallbackGoals(selectedGrade, selectedSubject);
      const response = await fetch('/api/student/today-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grade: selectedGrade,
          subject: selectedSubject,
        }),
      });

      if (!response.ok) {
        setTodayGoals(fallbackGoals);
        setPlanSource('fallback');
        return;
      }

      const plan = (await response.json()) as {
        goals?: TodayGoal[];
        planSource?: 'supabase' | 'fallback';
      };

      setTodayGoals(plan.goals?.length ? plan.goals : fallbackGoals);
      setPlanSource(plan.planSource ?? 'fallback');
    } catch {
      setTodayGoals(buildFallbackGoals(selectedGrade, selectedSubject));
      setPlanSource('fallback');
    } finally {
      setPlanLoading(false);
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleSelectGrade = async (grade: string) => {
    setSelectedGrade(grade);
    await supabase.auth.updateUser({ data: { grade } });
  };

  const handleStartGoal = (goal: TodayGoal) => {
    const params = new URLSearchParams({
      grade: selectedGrade,
      subject: selectedSubject,
      outcomeId: goal.id,
      outcomeCode: goal.outcomeCode,
      title: goal.title,
    });
    if (goal.reusedSessionId) params.set('sessionId', goal.reusedSessionId);
    router.push(`/student/lesson?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#003461]" />
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'learning', label: 'My Learning', icon: BookOpen },
    { id: 'mastery', label: 'Mastery', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'community', label: 'Community', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-[#e7e8e9] bg-white">
        <div className="border-b border-[#e7e8e9] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-[#003461]">
              <span className="text-sm font-bold text-white">C</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#003461]">
              Coastal<span className="text-[#0057a8]">Tutor</span>
            </span>
          </div>
          <p className="mt-1 text-[10px] font-medium uppercase tracking-widest text-[#727781]">
            Student Portal
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="flex flex-col gap-0.5">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all',
                  activeNav === id
                    ? 'bg-[#003461] text-white'
                    : 'text-[#424750] hover:bg-[#f0f4ff] hover:text-[#003461]',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="flex flex-col gap-2 border-t border-[#e7e8e9] px-3 py-4">
          <button
            onClick={() => router.push('/generation-preview')}
            className="flex w-full items-center gap-2 rounded-lg bg-blue-50 px-3 py-2.5 text-sm font-medium text-[#003461] transition-all hover:bg-blue-100"
          >
            <Sparkles className="h-4 w-4" />
            Free explore
          </button>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#727781] transition-all hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e7e8e9] bg-white px-8 py-4">
          <div>
            <h1 className="text-xl font-semibold text-[#191c1d]">Today&apos;s learning path</h1>
            <p className="text-sm text-[#727781]">
              Hello, {firstName}. {selectedGrade} · {selectedSubject}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => void loadTodayPlan()}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e7e8e9] px-3 text-sm font-medium text-[#424750] hover:bg-[#f0f4ff]"
            >
              <RefreshCw className={cn('h-4 w-4', planLoading && 'animate-spin')} />
              Recalculate
            </button>
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-full p-2 text-[#727781] transition-all hover:bg-[#f0f4ff]"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </header>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

        <div className="space-y-8 p-8">
          <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#003461]">Adaptive planner</p>
                  <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#191c1d]">
                    3 targets for today
                  </h2>
                </div>
                <span className="rounded-full bg-[#f0f4ff] px-3 py-1 text-xs font-semibold text-[#003461]">
                  {planSource === 'supabase' ? 'Live mastery' : 'Demo fallback'}
                </span>
              </div>

              <div className="grid gap-3">
                {todayGoals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => handleStartGoal(goal)}
                    className="group flex items-center gap-4 rounded-lg border border-[#e7e8e9] bg-white p-4 text-left transition-all hover:border-[#003461] hover:shadow-sm"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003461]/10 text-sm font-bold text-[#003461]">
                      {goal.priority}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#191c1d]">{goal.title}</p>
                      <p className="mt-1 text-xs text-[#727781]">
                        {goal.outcomeCode} · mastery {Math.round(goal.mastery * 100)}%
                      </p>
                    </div>
                    {goal.reusedSessionId ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Reuse
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                        <Zap className="h-3.5 w-3.5" />
                        Generate
                      </span>
                    )}
                    <ChevronRight className="h-4 w-4 text-[#c2c6d1] transition-colors group-hover:text-[#003461]" />
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#003461]">Progress ring</p>
                  <h2 className="mt-1 text-lg font-semibold text-[#191c1d]">Current mastery</h2>
                </div>
                <Target className="h-5 w-5 text-[#003461]" />
              </div>
              <div className="mt-8 flex justify-center">
                <ProgressRing value={averageMastery} />
              </div>
              <p className="mt-6 text-sm leading-6 text-[#424750]">
                Mastery is recalculated after each question using correctness, hint use, response
                latency, and emotion signal snapshots.
              </p>
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#191c1d]">Grade</h2>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {GRADES.map((grade) => (
                  <button
                    key={grade}
                    onClick={() => void handleSelectGrade(grade)}
                    className={cn(
                      'flex h-12 items-center justify-center rounded-lg border text-xs font-semibold',
                      selectedGrade === grade
                        ? 'border-[#003461] bg-[#f0f4ff] text-[#003461]'
                        : 'border-[#e7e8e9] text-[#424750] hover:border-[#003461]',
                    )}
                  >
                    <GraduationCap className="mr-1.5 h-4 w-4" />
                    {grade.replace('Grade ', 'G')}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-[#191c1d]">Subject</h2>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={cn(
                      'flex h-12 items-center justify-center rounded-lg border text-sm font-semibold',
                      selectedSubject === subject
                        ? 'border-[#003461] bg-[#f0f4ff] text-[#003461]'
                        : 'border-[#e7e8e9] text-[#424750] hover:border-[#003461]',
                    )}
                  >
                    <BookMarked className="mr-2 h-4 w-4" />
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function ProgressRing({ value }: { value: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative h-36 w-36">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} fill="none" stroke="#e7e8e9" strokeWidth="12" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#003461"
          strokeLinecap="round"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#191c1d]">{value}%</span>
        <span className="text-xs font-semibold uppercase tracking-wider text-[#727781]">ready</span>
      </div>
    </div>
  );
}
