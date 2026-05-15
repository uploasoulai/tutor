'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  DatabaseZap,
  Loader2,
  LogOut,
  Send,
  Settings,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

type RuntimeStatus = {
  parentReports: {
    appBaseUrlConfigured: boolean;
    cronSecretConfigured: boolean;
  };
  keepalive: {
    secretConfigured: boolean;
  };
  aiRouting: {
    serverFreeModelsAllowed: boolean;
    autoFreeModelsConfigured: boolean;
    gemini3FreeTierAllowed: boolean;
  };
};

type KeepaliveResult = {
  ok: boolean;
  checkedAt: string;
  subjectCount: number;
  message: string;
};

type ParentReportRunResult = {
  ok: boolean;
  checkedAt: string;
  date: string;
  generated: number;
  skipped: number;
  failed: number;
  message: string;
};

type RelationshipOverview = {
  students: number;
  parents: number;
  teachers: number;
  parentLinks: number;
  teacherLinks: number;
  studentsWithoutParent: number;
  studentsWithoutTeacher: number;
};

type RelationshipDirectory = {
  students: Array<{ id: string; name: string; grade: string }>;
  parents: Array<{ id: string; name: string }>;
  teachers: Array<{ id: string; name: string }>;
  parentLinks: Array<{ parentId: string; studentId: string }>;
  teacherLinks: Array<{ teacherId: string; studentId: string; subjects: string[] }>;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState<RuntimeStatus | null>(null);
  const [keepaliveLoading, setKeepaliveLoading] = useState(false);
  const [keepaliveResult, setKeepaliveResult] = useState<KeepaliveResult | null>(null);
  const [keepaliveError, setKeepaliveError] = useState('');
  const [parentReportLoading, setParentReportLoading] = useState(false);
  const [parentReportResult, setParentReportResult] = useState<ParentReportRunResult | null>(null);
  const [parentReportError, setParentReportError] = useState('');
  const [relationshipOverview, setRelationshipOverview] = useState<RelationshipOverview | null>(
    null,
  );
  const [relationshipLoading, setRelationshipLoading] = useState(true);
  const [relationshipDirectory, setRelationshipDirectory] = useState<RelationshipDirectory | null>(
    null,
  );
  const [directoryLoading, setDirectoryLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }
      if (data.user.user_metadata?.role !== 'admin') {
        router.replace('/student');
        return;
      }
      setLoading(false);
    });
  }, [router, supabase.auth]);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    fetch('/api/ops/status')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && data.status) {
          setStatus(data.status);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setStatusLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading]);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    fetch('/api/admin/relationships/directory')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && data.directory) {
          setRelationshipDirectory(data.directory);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setDirectoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading]);

  useEffect(() => {
    if (loading) return;

    let cancelled = false;
    fetch('/api/admin/relationships/overview')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data?.success && data.overview) {
          setRelationshipOverview(data.overview);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setRelationshipLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [loading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  const handleRunKeepalive = async () => {
    setKeepaliveLoading(true);
    setKeepaliveError('');
    try {
      const response = await fetch('/api/ops/keepalive', { method: 'POST' });
      const data = response.ok
        ? ((await response.json()) as { success?: boolean; result?: KeepaliveResult })
        : null;

      if (!data?.success || !data.result) {
        setKeepaliveError('Keepalive check failed. Review server logs for details.');
        return;
      }

      setKeepaliveResult(data.result);
    } catch {
      setKeepaliveError('Keepalive check failed. Review server logs for details.');
    } finally {
      setKeepaliveLoading(false);
    }
  };

  const handleRunParentReports = async () => {
    setParentReportLoading(true);
    setParentReportError('');
    try {
      const response = await fetch('/api/ops/parent-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = response.ok
        ? ((await response.json()) as { success?: boolean; result?: ParentReportRunResult })
        : null;

      if (!data?.success || !data.result) {
        setParentReportError('Parent report run failed. Review server logs for details.');
        return;
      }

      setParentReportResult(data.result);
    } catch {
      setParentReportError('Parent report run failed. Review server logs for details.');
    } finally {
      setParentReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="h-8 w-8 animate-spin text-[#003461]" />
      </div>
    );
  }

  const checks = status
    ? [
        {
          group: 'Parent reports',
          items: [
            { label: 'APP_BASE_URL configured', ok: status.parentReports.appBaseUrlConfigured },
            {
              label: 'PARENT_REPORT_CRON_SECRET configured',
              ok: status.parentReports.cronSecretConfigured,
            },
          ],
        },
        {
          group: 'Supabase keepalive',
          items: [{ label: 'KEEPALIVE_SECRET configured', ok: status.keepalive.secretConfigured }],
        },
        {
          group: 'AI routing',
          items: [
            { label: 'AUTO_FREE_MODELS configured', ok: status.aiRouting.autoFreeModelsConfigured },
            {
              label: 'Server free model fallback allowed',
              ok: status.aiRouting.serverFreeModelsAllowed,
            },
            {
              label: 'Gemini 3 free-tier override disabled',
              ok: !status.aiRouting.gemini3FreeTierAllowed,
            },
          ],
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e7e8e9] bg-white px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#003461] text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#191c1d]">Admin Operations</h1>
            <p className="text-sm text-[#727781]">
              Runtime configuration without exposing secrets.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e7e8e9] px-3 text-sm font-semibold text-[#424750] hover:bg-[#f0f4ff]"
          >
            <Settings className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleSignOut}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#e7e8e9] px-3 text-sm font-semibold text-[#424750] hover:bg-red-50 hover:text-red-500"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-8">
        {statusLoading && (
          <div className="rounded-lg border border-[#e7e8e9] bg-white p-6 text-sm text-[#727781]">
            Loading runtime status...
          </div>
        )}
        {!statusLoading && !status && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-6 text-sm text-red-700">
            Runtime status is unavailable. Check admin permissions and server logs.
          </div>
        )}
        {!statusLoading && status && (
          <div className="grid gap-5">
            <section className="rounded-lg border border-[#e7e8e9] bg-white p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-[#191c1d]">Relationship overview</h2>
                  <p className="mt-1 text-sm text-[#727781]">
                    Tracks whether students are linked to parent and teacher accounts.
                  </p>
                </div>
              </div>
              {relationshipLoading && (
                <div className="mt-4 rounded-lg bg-[#f8f9fa] px-4 py-3 text-sm text-[#727781]">
                  Loading relationships...
                </div>
              )}
              {!relationshipLoading && relationshipOverview && (
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <AdminMetric label="Students" value={relationshipOverview.students} />
                  <AdminMetric label="Parents" value={relationshipOverview.parents} />
                  <AdminMetric label="Teachers" value={relationshipOverview.teachers} />
                  <AdminMetric
                    label="Student-parent links"
                    value={relationshipOverview.parentLinks}
                  />
                  <AdminMetric
                    label="Student-teacher links"
                    value={relationshipOverview.teacherLinks}
                  />
                  <AdminMetric
                    label="Missing parent"
                    value={relationshipOverview.studentsWithoutParent}
                    danger={relationshipOverview.studentsWithoutParent > 0}
                  />
                  <AdminMetric
                    label="Missing teacher"
                    value={relationshipOverview.studentsWithoutTeacher}
                    danger={relationshipOverview.studentsWithoutTeacher > 0}
                  />
                </div>
              )}
              {!relationshipLoading && !relationshipOverview && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  Relationship overview is unavailable.
                </div>
              )}
              <RelationshipDirectoryPanel
                directory={relationshipDirectory}
                loading={directoryLoading}
              />
            </section>

            <section className="rounded-lg border border-[#e7e8e9] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-[#191c1d]">
                    Manual Supabase keepalive
                  </h2>
                  <p className="mt-1 text-sm text-[#727781]">
                    Runs a server-side pg query through the admin client. No secret is sent to the
                    browser.
                  </p>
                </div>
                <button
                  onClick={() => void handleRunKeepalive()}
                  disabled={keepaliveLoading}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#003461] px-3 text-sm font-semibold text-white hover:bg-[#002b50] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {keepaliveLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <DatabaseZap className="h-4 w-4" />
                  )}
                  Run check
                </button>
              </div>
              {keepaliveResult && (
                <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                  <p className="font-semibold">{keepaliveResult.message}</p>
                  <p className="mt-1 text-xs">
                    Checked at {formatStatusTime(keepaliveResult.checkedAt)}
                  </p>
                </div>
              )}
              {keepaliveError && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {keepaliveError}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-[#e7e8e9] bg-white p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold text-[#191c1d]">
                    Manual parent report run
                  </h2>
                  <p className="mt-1 text-sm text-[#727781]">
                    Generates or updates daily parent reports for linked students. The response only
                    returns counts.
                  </p>
                </div>
                <button
                  onClick={() => void handleRunParentReports()}
                  disabled={parentReportLoading}
                  className="inline-flex h-9 items-center gap-2 rounded-md bg-[#003461] px-3 text-sm font-semibold text-white hover:bg-[#002b50] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {parentReportLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Run reports
                </button>
              </div>
              {parentReportResult && (
                <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800">
                  <p className="font-semibold">{parentReportResult.message}</p>
                  <p className="mt-1 text-xs">
                    {parentReportResult.skipped} skipped, {parentReportResult.failed} failed.
                    Checked at {formatStatusTime(parentReportResult.checkedAt)}.
                  </p>
                </div>
              )}
              {parentReportError && (
                <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                  {parentReportError}
                </div>
              )}
            </section>

            {checks.map((group) => (
              <section
                key={group.group}
                className="rounded-lg border border-[#e7e8e9] bg-white p-6"
              >
                <h2 className="text-base font-semibold text-[#191c1d]">{group.group}</h2>
                <div className="mt-4 grid gap-3">
                  {group.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-lg bg-[#f8f9fa] px-4 py-3"
                    >
                      <span className="text-sm font-medium text-[#424750]">{item.label}</span>
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                          item.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600',
                        )}
                      >
                        {item.ok ? (
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5" />
                        )}
                        {item.ok ? 'Ready' : 'Missing'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function RelationshipDirectoryPanel({
  directory,
  loading,
}: {
  directory: RelationshipDirectory | null;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="mt-4 rounded-lg bg-[#f8f9fa] px-4 py-3 text-sm text-[#727781]">
        Loading account directory...
      </div>
    );
  }

  if (!directory) {
    return (
      <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        Account directory is unavailable.
      </div>
    );
  }

  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-3">
      <DirectoryColumn
        title="Students"
        rows={directory.students.slice(0, 5).map((student) => ({
          id: student.id,
          primary: student.name,
          secondary: student.grade,
        }))}
      />
      <DirectoryColumn
        title="Parents"
        rows={directory.parents.slice(0, 5).map((parent) => ({
          id: parent.id,
          primary: parent.name,
          secondary: `${directory.parentLinks.filter((link) => link.parentId === parent.id).length} linked`,
        }))}
      />
      <DirectoryColumn
        title="Teachers"
        rows={directory.teachers.slice(0, 5).map((teacher) => ({
          id: teacher.id,
          primary: teacher.name,
          secondary: `${directory.teacherLinks.filter((link) => link.teacherId === teacher.id).length} linked`,
        }))}
      />
    </div>
  );
}

function DirectoryColumn({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ id: string; primary: string; secondary: string }>;
}) {
  return (
    <div className="rounded-lg border border-[#e7e8e9] p-4">
      <h3 className="text-sm font-semibold text-[#191c1d]">{title}</h3>
      <div className="mt-3 grid gap-2">
        {rows.length === 0 && <p className="text-sm text-[#727781]">No accounts yet.</p>}
        {rows.map((row) => (
          <div key={row.id} className="rounded-md bg-[#f8f9fa] px-3 py-2">
            <p className="truncate text-sm font-medium text-[#191c1d]">{row.primary}</p>
            <p className="mt-0.5 text-xs text-[#727781]">{row.secondary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminMetric({
  label,
  value,
  danger = false,
}: {
  label: string;
  value: number;
  danger?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#f8f9fa] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#727781]">{label}</p>
      <p className={cn('mt-2 text-2xl font-bold', danger ? 'text-red-600' : 'text-[#191c1d]')}>
        {value}
      </p>
    </div>
  );
}

function formatStatusTime(value: string) {
  return new Intl.DateTimeFormat('en-CA', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}
