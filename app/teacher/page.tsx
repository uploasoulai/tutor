'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  Home,
  Users,
  BarChart3,
  Calendar,
  Settings,
  LogOut,
  AlertTriangle,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SettingsDialog } from '@/components/settings';

type TutorAlert = {
  id: string;
  studentName: string;
  grade: string;
  issue: string;
  severity: 'low' | 'medium' | 'high';
};

type TeacherSummary = {
  totalStudents: number;
  averageMastery: number;
  activeToday: number;
  needsAttention: number;
};

export default function TeacherDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<import('@supabase/supabase-js').User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [alerts, setAlerts] = useState<TutorAlert[]>([]);
  const [alertsLoading, setAlertsLoading] = useState(false);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [summary, setSummary] = useState<TeacherSummary | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }
      if (data.user.user_metadata?.role !== 'teacher') {
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
    setAlertsLoading(true);
    fetch('/api/teacher/alerts')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && Array.isArray(data.alerts)) {
          setAlerts(data.alerts);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAlertsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setSummaryLoading(true);
    fetch('/api/teacher/summary')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && data.summary) {
          setSummary(data.summary);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSummaryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleResolveAlert = async (alertId: string) => {
    setResolvingAlertId(alertId);
    try {
      const response = await fetch('/api/teacher/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'resolve' }),
      });

      if (response.ok) {
        setAlerts((current) => current.filter((alert) => alert.id !== alertId));
        setSummary((current) =>
          current
            ? { ...current, needsAttention: Math.max(0, current.needsAttention - 1) }
            : current,
        );
      }
    } finally {
      setResolvingAlertId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-8 h-8 border-4 border-[#003461] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstName = user?.user_metadata?.first_name ?? 'Teacher';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'classes', label: 'My Classes', icon: Users },
    { id: 'interventions', label: 'Interventions', icon: AlertTriangle },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
  ];

  const stats = [
    {
      label: 'Total Students',
      value: summaryLoading ? '...' : String(summary?.totalStudents ?? '-'),
      color: 'text-[#003461]',
    },
    {
      label: 'Avg. Mastery',
      value: summaryLoading
        ? '...'
        : summary
          ? `${Math.round(summary.averageMastery * 100)}%`
          : '-',
      color: 'text-green-600',
    },
    {
      label: 'Active Today',
      value: summaryLoading ? '...' : String(summary?.activeToday ?? '-'),
      color: 'text-blue-600',
    },
    {
      label: 'Needs Attention',
      value: summaryLoading ? '...' : String(summary?.needsAttention ?? alerts.length),
      color: 'text-red-500',
    },
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
            Teacher Portal
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
            <h1 className="text-xl font-semibold text-[#191c1d]">Teacher Dashboard</h1>
            <p className="text-sm text-[#727781]">Hello, {firstName}</p>
          </div>
          <button
            onClick={() => setSettingsOpen(true)}
            className="p-2 rounded-full hover:bg-[#f0f4ff] text-[#727781]"
          >
            <Settings className="w-4 h-4" />
          </button>
        </header>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

        <div className="p-8">
          <div className="grid grid-cols-4 gap-4 mb-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white border border-[#e7e8e9] rounded-xl p-5">
                <p className="text-sm text-[#727781]">{s.label}</p>
                <p className={cn('text-3xl font-bold mt-1', s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          <h2 className="text-lg font-semibold text-[#191c1d] mb-4">Priority Interventions</h2>
          <div className="flex flex-col gap-3 mb-8">
            {alertsLoading && (
              <div className="bg-white border border-[#e7e8e9] rounded-xl p-5 text-sm text-[#727781]">
                Loading priority interventions...
              </div>
            )}
            {!alertsLoading && alerts.length === 0 && (
              <div className="bg-white border border-[#e7e8e9] rounded-xl p-5 text-sm text-[#727781]">
                No unresolved tutor alerts right now.
              </div>
            )}
            {alerts.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-[#e7e8e9] rounded-xl p-5 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      'w-2 h-8 rounded-full',
                      a.severity === 'high'
                        ? 'bg-red-500'
                        : a.severity === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-gray-300',
                    )}
                  />
                  <div>
                    <p className="font-semibold text-[#191c1d]">
                      {a.studentName}{' '}
                      <span className="text-sm text-[#727781] font-normal">- {a.grade}</span>
                    </p>
                    <p className="text-sm text-[#424750]">{a.issue}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 text-sm font-medium border border-[#c2c6d1] rounded-lg hover:bg-gray-50 transition-colors">
                    Message
                  </button>
                  <button
                    onClick={() => void handleResolveAlert(a.id)}
                    disabled={resolvingAlertId === a.id}
                    className="px-4 py-2 text-sm font-medium bg-[#003461] text-white rounded-lg hover:bg-[#002b50] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                  >
                    {resolvingAlertId === a.id ? 'Resolving...' : 'Mark resolved'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-[#727781] text-center">
            More features coming soon: class analytics, curriculum alignment, bulk interventions.
          </p>
        </div>
      </main>
    </div>
  );
}
