'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Home,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  MessageSquare,
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsDialog } from '@/components/settings';

type DailyReportMetrics = {
  learningMinutes: number;
  masteryAverage: number;
  xpEarned: number;
  activitiesCompleted?: number;
};

type DailyReport = {
  summaryText: string;
  metrics: DailyReportMetrics;
};

type ReportHistoryItem = {
  id: string;
  reportType: string;
  summaryText: string;
  metrics: DailyReportMetrics | null;
  deliveryStatus: string;
  createdAt: string;
};

type ParentLinkedStudent = {
  studentId: string;
  studentName: string;
  grade: string;
};

export default function ParentDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportHistory, setReportHistory] = useState<ReportHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [linkedStudents, setLinkedStudents] = useState<ParentLinkedStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }

      const roleResponse = await fetch('/api/auth/role');
      const roleData = roleResponse.ok
        ? ((await roleResponse.json()) as { success?: boolean; role?: string })
        : null;
      const role = roleData?.role ?? data.user.user_metadata?.role;

      if (role !== 'parent') {
        router.replace('/student');
        return;
      }
      setUser(data.user);
      setLoading(false);
    });
  }, [router, supabase.auth]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    fetch('/api/parent/students')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && Array.isArray(data.students)) {
          setLinkedStudents(data.students);
          setSelectedStudentId((current) => current || data.students[0]?.studentId || '');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStudentsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !selectedStudentId) {
      return;
    }

    let cancelled = false;
    fetch('/api/parent/daily-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: selectedStudentId }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && data.report) {
          setDailyReport(data.report);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setReportLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudentId, user]);

  useEffect(() => {
    if (!user || !selectedStudentId) {
      return;
    }

    let cancelled = false;
    fetch(`/api/parent/reports?studentId=${encodeURIComponent(selectedStudentId)}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && Array.isArray(data.reports)) {
          setReportHistory(data.reports);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudentId, user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-8 h-8 border-4 border-[#003461] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.user_metadata?.first_name ?? 'Parent';
  const selectedStudent = linkedStudents.find((student) => student.studentId === selectedStudentId);
  const summaryCards = [
    {
      label: 'Learning Time',
      value: `${dailyReport?.metrics.learningMinutes ?? 0} mins`,
      icon: Clock,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Mastery Score',
      value: `${Math.round((dailyReport?.metrics.masteryAverage ?? 0) * 100)}%`,
      icon: TrendingUp,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Activities',
      value: `${dailyReport?.metrics.activitiesCompleted ?? 0}`,
      icon: BookOpen,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'XP Earned',
      value: `${dailyReport?.metrics.xpEarned ?? 0} XP`,
      icon: Star,
      color: 'text-orange-500 bg-orange-50',
    },
  ];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'progress', label: 'Progress Reports', icon: BarChart3 },
    { id: 'messages', label: 'Teacher Messages', icon: MessageSquare },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'resources', label: 'Resources', icon: BookOpen },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] font-sans">
      <aside className="w-64 shrink-0 bg-white border-r border-[#e7e8e9] flex flex-col sticky top-0 h-screen">
        <div className="px-6 py-5 border-b border-[#e7e8e9]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#003461] rounded flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-lg font-bold text-[#003461] tracking-tight">
              Coastal<span className="text-[#0057a8]">Tutor</span>
            </span>
          </div>
          <p className="text-[10px] text-[#727781] mt-1 font-medium uppercase tracking-widest">
            Parent Portal
          </p>
        </div>
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="flex flex-col gap-0.5">
            {navItems.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left transition-all',
                  activeNav === id
                    ? 'bg-[#003461] text-white'
                    : 'text-[#424750] hover:bg-[#f0f4ff] hover:text-[#003461]',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" /> {label}
              </button>
            ))}
          </div>
        </nav>
        <div className="px-3 py-4 border-t border-[#e7e8e9] flex flex-col gap-2">
          <button
            onClick={() => router.push('/coastaltutor')}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#003461] bg-blue-50 hover:bg-blue-100 transition-all w-full"
          >
            <Sparkles className="w-4 h-4" /> Explore Mode
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-[#727781] hover:bg-red-50 hover:text-red-500 transition-all w-full"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-[#e7e8e9] px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-semibold text-[#191c1d]">Parent Dashboard</h1>
            <p className="text-sm text-[#727781]">
              Hello, {firstName}
              {selectedStudent ? ` · ${selectedStudent.studentName}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StudentSelector
              students={linkedStudents}
              value={selectedStudentId}
              loading={studentsLoading}
              onChange={setSelectedStudentId}
            />
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 rounded-full hover:bg-[#f0f4ff] text-[#727781]"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

        <div className="p-8">
          {activeNav === 'progress' ? (
            <ReportHistory reports={reportHistory} loading={historyLoading} />
          ) : (
            <DashboardSummary
              summaryCards={summaryCards}
              dailyReport={dailyReport}
              reportLoading={reportLoading}
            />
          )}

          <p className="text-sm text-[#727781] text-center">
            More features coming soon: detailed reports, teacher chat, weekly summaries.
          </p>
        </div>
      </main>
    </div>
  );
}

function StudentSelector({
  students,
  value,
  loading,
  onChange,
}: {
  students: ParentLinkedStudent[];
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
}) {
  if (loading) {
    return <div className="h-10 w-44 rounded-lg bg-[#f8f9fa]" />;
  }

  if (students.length === 0) {
    return (
      <span className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
        No linked students
      </span>
    );
  }

  return (
    <label className="flex items-center gap-2">
      <span className="text-sm font-medium text-[#727781]">Student</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-lg border border-[#c2c6d1] bg-white px-3 text-sm font-semibold text-[#191c1d] outline-none focus:border-[#003461] focus:ring-2 focus:ring-[#003461]/20"
      >
        {students.map((student) => (
          <option key={student.studentId} value={student.studentId}>
            {student.studentName} ({student.grade})
          </option>
        ))}
      </select>
    </label>
  );
}

function DashboardSummary({
  summaryCards,
  dailyReport,
  reportLoading,
}: {
  summaryCards: Array<{
    label: string;
    value: string;
    icon: typeof Clock;
    color: string;
  }>;
  dailyReport: DailyReport | null;
  reportLoading: boolean;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#191c1d] mb-4">Today&apos;s Summary</h2>
      <div className="grid gap-4 mb-8 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((s) => (
          <div
            key={s.label}
            className="bg-white border border-[#e7e8e9] rounded-xl p-5 flex items-center gap-4"
          >
            <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', s.color)}>
              <s.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-[#727781]">{s.label}</p>
              <p className="text-2xl font-bold text-[#191c1d]">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold text-[#191c1d] mb-4">AI Insights</h2>
      <div className="bg-white border border-[#e7e8e9] rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-[#003461]/10 rounded-full flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#003461]" />
          </div>
          <div>
            <p className="font-semibold text-[#191c1d]">
              {reportLoading
                ? "Preparing today's report..."
                : dailyReport
                  ? "Today's AI daily report is ready"
                  : 'No completed learning activity yet today'}
            </p>
            <p className="text-sm text-[#424750] mt-1 leading-relaxed">
              {dailyReport?.summaryText ??
                'Once your child finishes a Grade 2 lesson or quiz, CoastalTutor will generate a reusable daily summary here for parent review.'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function ReportHistory({ reports, loading }: { reports: ReportHistoryItem[]; loading: boolean }) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#191c1d] mb-4">Progress Reports</h2>
      <div className="bg-white border border-[#e7e8e9] rounded-xl overflow-hidden mb-8">
        <div className="grid grid-cols-[0.8fr_0.8fr_1fr_1fr] gap-4 px-5 py-3 bg-[#f8f9fa] text-xs font-semibold uppercase tracking-wide text-[#727781]">
          <span>Date</span>
          <span>Learning</span>
          <span>Mastery</span>
          <span>Status</span>
        </div>
        {loading && <div className="px-5 py-6 text-sm text-[#727781]">Loading reports...</div>}
        {!loading && reports.length === 0 && (
          <div className="px-5 py-6 text-sm text-[#727781]">
            No parent reports yet. Daily reports will appear here after Grade 2 lessons are
            completed.
          </div>
        )}
        {!loading &&
          reports.map((report) => (
            <div
              key={report.id}
              className="grid grid-cols-[0.8fr_0.8fr_1fr_1fr] gap-4 px-5 py-4 border-t border-[#e7e8e9] items-start"
            >
              <div>
                <p className="font-semibold text-[#191c1d]">{formatReportDate(report.createdAt)}</p>
                <p className="text-xs text-[#727781]">{report.reportType}</p>
              </div>
              <p className="text-sm text-[#424750]">
                {report.metrics?.learningMinutes ?? 0} mins, {report.metrics?.xpEarned ?? 0} XP
              </p>
              <p className="text-sm text-[#424750]">
                {Math.round((report.metrics?.masteryAverage ?? 0) * 100)}% mastery
              </p>
              <div>
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  {report.deliveryStatus}
                </span>
                <p className="mt-2 line-clamp-2 text-xs text-[#727781]">{report.summaryText}</p>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

function formatReportDate(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}
