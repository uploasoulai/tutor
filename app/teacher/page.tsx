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
  studentId: string;
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

type TeacherStudent = {
  studentId: string;
  studentName: string;
  grade: string;
  averageMastery: number;
  completedSessions: number;
  lastActiveAt: string | null;
  unresolvedAlerts: number;
};

type TeacherStudentDetail = TeacherStudent & {
  masteryRows: {
    outcomeId: string;
    outcomeCode: string;
    contentKnowledge: string;
    masteryLevel: number;
    attempts: number;
    correctAttempts: number;
  }[];
  recentSessions: {
    id: string;
    lessonTitle: string;
    status: string;
    startedAt: string | null;
    accuracyRate: number | null;
    xpEarned: number;
  }[];
  unresolvedAlertSummaries: {
    id: string;
    alertType: string;
    createdAt: string | null;
  }[];
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
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<TeacherStudentDetail | null>(null);
  const [selectedStudentLoading, setSelectedStudentLoading] = useState(false);

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

      if (role !== 'teacher') {
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
    if (!students[0] || selectedStudentId) return;
    setSelectedStudentId(students[0].studentId);
  }, [selectedStudentId, students]);

  useEffect(() => {
    if (!selectedStudentId) return;

    let cancelled = false;
    setSelectedStudentLoading(true);
    fetch(`/api/teacher/students/${selectedStudentId}`)
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && data.student) {
          setSelectedStudent(data.student);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setSelectedStudentLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setStudentsLoading(true);
    fetch('/api/teacher/students')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && Array.isArray(data.students)) {
          setStudents(data.students);
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

  const handleResolveAlert = async (alertId: string, studentId?: string) => {
    setResolvingAlertId(alertId);
    try {
      const response = await fetch('/api/teacher/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId, action: 'resolve' }),
      });

      if (response.ok) {
        const resolvedAlert = alerts.find((alert) => alert.id === alertId);
        const resolvedStudentId = studentId ?? resolvedAlert?.studentId;
        setAlerts((current) => current.filter((alert) => alert.id !== alertId));
        setStudents((current) =>
          current.map((student) =>
            student.studentId === resolvedStudentId
              ? { ...student, unresolvedAlerts: Math.max(0, student.unresolvedAlerts - 1) }
              : student,
          ),
        );
        setSelectedStudent((current) =>
          current && current.studentId === resolvedStudentId
            ? buildResolvedStudentDetail(current, alertId)
            : current,
        );
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

          {activeNav === 'classes' ? (
            <ClassRoster
              students={students}
              loading={studentsLoading}
              selectedStudentId={selectedStudentId}
              selectedStudent={selectedStudent}
              selectedStudentLoading={selectedStudentLoading}
              onSelectStudent={setSelectedStudentId}
              resolvingAlertId={resolvingAlertId}
              onResolveAlert={handleResolveAlert}
            />
          ) : (
            <PriorityInterventions
              alerts={alerts}
              loading={alertsLoading}
              resolvingAlertId={resolvingAlertId}
              onResolveAlert={handleResolveAlert}
            />
          )}

          <p className="text-sm text-[#727781] text-center">
            More features coming soon: class analytics, curriculum alignment, bulk interventions.
          </p>
        </div>
      </main>
    </div>
  );
}

function PriorityInterventions({
  alerts,
  loading,
  resolvingAlertId,
  onResolveAlert,
}: {
  alerts: TutorAlert[];
  loading: boolean;
  resolvingAlertId: string | null;
  onResolveAlert: (alertId: string) => void;
}) {
  return (
    <>
      <h2 className="text-lg font-semibold text-[#191c1d] mb-4">Priority Interventions</h2>
      <div className="flex flex-col gap-3 mb-8">
        {loading && (
          <div className="bg-white border border-[#e7e8e9] rounded-xl p-5 text-sm text-[#727781]">
            Loading priority interventions...
          </div>
        )}
        {!loading && alerts.length === 0 && (
          <div className="bg-white border border-[#e7e8e9] rounded-xl p-5 text-sm text-[#727781]">
            No unresolved tutor alerts right now.
          </div>
        )}
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white border border-[#e7e8e9] rounded-xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  'w-2 h-8 rounded-full',
                  alert.severity === 'high'
                    ? 'bg-red-500'
                    : alert.severity === 'medium'
                      ? 'bg-yellow-500'
                      : 'bg-gray-300',
                )}
              />
              <div>
                <p className="font-semibold text-[#191c1d]">
                  {alert.studentName}{' '}
                  <span className="text-sm text-[#727781] font-normal">- {alert.grade}</span>
                </p>
                <p className="text-sm text-[#424750]">{alert.issue}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-sm font-medium border border-[#c2c6d1] rounded-lg hover:bg-gray-50 transition-colors">
                Message
              </button>
              <button
                onClick={() => onResolveAlert(alert.id)}
                disabled={resolvingAlertId === alert.id}
                className="px-4 py-2 text-sm font-medium bg-[#003461] text-white rounded-lg hover:bg-[#002b50] disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
              >
                {resolvingAlertId === alert.id ? 'Resolving...' : 'Mark resolved'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ClassRoster({
  students,
  loading,
  selectedStudentId,
  selectedStudent,
  selectedStudentLoading,
  resolvingAlertId,
  onSelectStudent,
  onResolveAlert,
}: {
  students: TeacherStudent[];
  loading: boolean;
  selectedStudentId: string | null;
  selectedStudent: TeacherStudentDetail | null;
  selectedStudentLoading: boolean;
  resolvingAlertId: string | null;
  onSelectStudent: (studentId: string) => void;
  onResolveAlert: (alertId: string, studentId?: string) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-[#191c1d]">My Classes</h2>
          <p className="text-sm text-[#727781]">Grade 2 students sorted by attention priority.</p>
        </div>
      </div>
      <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)] gap-5 mb-8">
        <div className="bg-white border border-[#e7e8e9] rounded-xl overflow-hidden">
          <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-4 px-5 py-3 bg-[#f8f9fa] text-xs font-semibold uppercase tracking-wide text-[#727781]">
            <span>Student</span>
            <span>Mastery</span>
            <span>Lessons</span>
            <span>Alerts</span>
            <span>Last Active</span>
          </div>
          {loading && <RosterRowSkeleton />}
          {!loading && students.length === 0 && (
            <div className="px-5 py-6 text-sm text-[#727781]">
              No linked students yet. Once a Grade 2 student is linked to this teacher, their
              mastery and lesson activity will appear here.
            </div>
          )}
          {!loading &&
            students.map((student) => (
              <button
                key={student.studentId}
                onClick={() => onSelectStudent(student.studentId)}
                className={cn(
                  'grid grid-cols-[1.4fr_0.8fr_0.8fr_0.9fr_0.9fr] gap-4 px-5 py-4 border-t border-[#e7e8e9] items-center text-left w-full transition-colors',
                  selectedStudentId === student.studentId ? 'bg-blue-50' : 'hover:bg-[#f8f9fa]',
                )}
              >
                <div>
                  <p className="font-semibold text-[#191c1d]">{student.studentName}</p>
                  <p className="text-sm text-[#727781]">{student.grade} Math</p>
                </div>
                <MasteryMeter value={student.averageMastery} />
                <span className="text-sm font-medium text-[#424750]">
                  {student.completedSessions}
                </span>
                <span
                  className={cn(
                    'w-fit rounded-full px-2.5 py-1 text-xs font-semibold',
                    student.unresolvedAlerts > 0
                      ? 'bg-red-50 text-red-600'
                      : 'bg-green-50 text-green-700',
                  )}
                >
                  {student.unresolvedAlerts > 0 ? `${student.unresolvedAlerts} open` : 'Clear'}
                </span>
                <span className="text-sm text-[#727781]">
                  {formatLastActive(student.lastActiveAt)}
                </span>
              </button>
            ))}
        </div>
        <StudentDetailPanel
          student={selectedStudent}
          loading={selectedStudentLoading}
          resolvingAlertId={resolvingAlertId}
          onResolveAlert={onResolveAlert}
        />
      </div>
    </>
  );
}

function StudentDetailPanel({
  student,
  loading,
  resolvingAlertId,
  onResolveAlert,
}: {
  student: TeacherStudentDetail | null;
  loading: boolean;
  resolvingAlertId: string | null;
  onResolveAlert: (alertId: string, studentId?: string) => void;
}) {
  if (loading) {
    return (
      <div className="bg-white border border-[#e7e8e9] rounded-xl p-5 text-sm text-[#727781]">
        Loading student detail...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="bg-white border border-[#e7e8e9] rounded-xl p-5 text-sm text-[#727781]">
        Select a student to review mastery, recent lessons, and open alerts.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#e7e8e9] rounded-xl p-5 h-fit">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-[#191c1d]">{student.studentName}</h3>
          <p className="text-sm text-[#727781]">{student.grade} Math intervention view</p>
        </div>
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-xs font-semibold',
            student.unresolvedAlerts > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700',
          )}
        >
          {student.unresolvedAlerts > 0 ? `${student.unresolvedAlerts} alerts` : 'Clear'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <MiniStat label="Mastery" value={`${Math.round(student.averageMastery * 100)}%`} />
        <MiniStat label="Lessons" value={String(student.completedSessions)} />
      </div>

      <h4 className="mt-6 text-sm font-semibold text-[#191c1d]">Open alerts</h4>
      <div className="mt-2 flex flex-col gap-2">
        {student.unresolvedAlertSummaries.length === 0 && (
          <p className="text-sm text-[#727781]">No open alerts for this student.</p>
        )}
        {student.unresolvedAlertSummaries.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between gap-3 rounded-lg border border-[#e7e8e9] p-3"
          >
            <div>
              <p className="text-sm font-medium text-[#191c1d]">
                {formatAlertType(alert.alertType)}
              </p>
              <p className="text-xs text-[#727781]">{formatLastActive(alert.createdAt)}</p>
            </div>
            <button
              onClick={() => onResolveAlert(alert.id, student.studentId)}
              disabled={resolvingAlertId === alert.id}
              className="rounded-md bg-[#003461] px-3 py-2 text-xs font-semibold text-white hover:bg-[#002b50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {resolvingAlertId === alert.id ? 'Resolving...' : 'Resolve'}
            </button>
          </div>
        ))}
      </div>

      <h4 className="mt-6 text-sm font-semibold text-[#191c1d]">Lowest mastery</h4>
      <div className="mt-2 flex flex-col gap-2">
        {student.masteryRows.length === 0 && (
          <p className="text-sm text-[#727781]">No mastery records yet.</p>
        )}
        {student.masteryRows.slice(0, 4).map((row) => (
          <div key={row.outcomeId} className="rounded-lg border border-[#e7e8e9] p-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[#191c1d]">{row.outcomeCode}</p>
              <span className="text-sm font-semibold text-[#003461]">
                {Math.round(row.masteryLevel * 100)}%
              </span>
            </div>
            <p className="mt-1 line-clamp-2 text-xs text-[#727781]">{row.contentKnowledge}</p>
            <p className="mt-2 text-xs text-[#727781]">
              {row.correctAttempts}/{row.attempts} correct attempts
            </p>
          </div>
        ))}
      </div>

      <h4 className="mt-6 text-sm font-semibold text-[#191c1d]">Recent lessons</h4>
      <div className="mt-2 flex flex-col gap-2">
        {student.recentSessions.length === 0 && (
          <p className="text-sm text-[#727781]">No lesson sessions yet.</p>
        )}
        {student.recentSessions.map((session) => (
          <div key={session.id} className="rounded-lg bg-[#f8f9fa] p-3">
            <p className="text-sm font-medium text-[#191c1d]">{session.lessonTitle}</p>
            <p className="text-xs text-[#727781]">
              {session.status} - {formatLastActive(session.startedAt)} -{' '}
              {session.accuracyRate == null
                ? 'No accuracy yet'
                : `${Math.round(session.accuracyRate * 100)}% accuracy`}{' '}
              - {session.xpEarned} XP
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildResolvedStudentDetail(student: TeacherStudentDetail, alertId: string) {
  return {
    ...student,
    unresolvedAlerts: Math.max(0, student.unresolvedAlerts - 1),
    unresolvedAlertSummaries: student.unresolvedAlertSummaries.filter(
      (alert) => alert.id !== alertId,
    ),
  };
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f8f9fa] p-3">
      <p className="text-xs text-[#727781]">{label}</p>
      <p className="text-lg font-semibold text-[#191c1d]">{value}</p>
    </div>
  );
}

function RosterRowSkeleton() {
  return (
    <div className="px-5 py-6 text-sm text-[#727781] border-t border-[#e7e8e9]">
      Loading linked students...
    </div>
  );
}

function MasteryMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 rounded-full bg-[#e7e8e9] overflow-hidden">
        <div className="h-full bg-green-600" style={{ width: `${Math.round(value * 100)}%` }} />
      </div>
      <span className="text-sm font-medium text-[#424750]">{Math.round(value * 100)}%</span>
    </div>
  );
}

function formatLastActive(value: string | null) {
  if (!value) {
    return 'No sessions';
  }

  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function formatAlertType(value: string) {
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
