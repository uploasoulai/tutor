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
  Link2,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
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
    configuredFreeModelProviders: string[];
    eligibleAutoFreeModels: string[];
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
  const [parentLinkStudentId, setParentLinkStudentId] = useState('');
  const [parentLinkParentId, setParentLinkParentId] = useState('');
  const [teacherLinkStudentId, setTeacherLinkStudentId] = useState('');
  const [teacherLinkTeacherId, setTeacherLinkTeacherId] = useState('');
  const [teacherLinkSubject, setTeacherLinkSubject] = useState('Math');
  const [linkLoading, setLinkLoading] = useState(false);
  const [unlinkLoadingKey, setUnlinkLoadingKey] = useState('');
  const [linkMessage, setLinkMessage] = useState('');
  const [linkError, setLinkError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/login');
        return;
      }

      const response = await fetch('/api/admin/me');
      if (!response.ok) {
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

  const loadRelationshipData = async () => {
    const [overviewResponse, directoryResponse] = await Promise.all([
      fetch('/api/admin/relationships/overview'),
      fetch('/api/admin/relationships/directory'),
    ]);
    const overviewData = overviewResponse.ok ? await overviewResponse.json() : null;
    const directoryData = directoryResponse.ok ? await directoryResponse.json() : null;

    if (overviewData?.success && overviewData.overview) {
      setRelationshipOverview(overviewData.overview);
    }
    if (directoryData?.success && directoryData.directory) {
      setRelationshipDirectory(directoryData.directory);
    }
  };

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

  const handleCreateParentLink = async () => {
    if (!parentLinkStudentId || !parentLinkParentId) {
      setLinkError('Choose both a student and a parent.');
      return;
    }

    await createRelationshipLink({
      kind: 'parent',
      studentId: parentLinkStudentId,
      parentId: parentLinkParentId,
    });
  };

  const handleCreateTeacherLink = async () => {
    if (!teacherLinkStudentId || !teacherLinkTeacherId) {
      setLinkError('Choose both a student and a teacher.');
      return;
    }

    await createRelationshipLink({
      kind: 'teacher',
      studentId: teacherLinkStudentId,
      teacherId: teacherLinkTeacherId,
      subjects: [teacherLinkSubject],
    });
  };

  const createRelationshipLink = async (payload: Record<string, unknown>) => {
    setLinkLoading(true);
    setLinkError('');
    setLinkMessage('');
    try {
      const response = await fetch('/api/admin/relationships/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = response.ok ? ((await response.json()) as { success?: boolean }) : null;

      if (!data?.success) {
        setLinkError('Relationship link failed. Check the selected accounts.');
        return;
      }

      setLinkMessage('Relationship link saved.');
      await loadRelationshipData();
    } catch {
      setLinkError('Relationship link failed. Check the selected accounts.');
    } finally {
      setLinkLoading(false);
    }
  };

  const deleteRelationshipLink = async (payload: {
    kind: 'parent' | 'teacher';
    studentId: string;
    parentId?: string;
    teacherId?: string;
  }) => {
    const accountId = payload.parentId ?? payload.teacherId ?? '';
    const loadingKey = `${payload.kind}:${accountId}:${payload.studentId}`;
    setUnlinkLoadingKey(loadingKey);
    setLinkError('');
    setLinkMessage('');
    try {
      const response = await fetch('/api/admin/relationships/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = response.ok ? ((await response.json()) as { success?: boolean }) : null;

      if (!data?.success) {
        setLinkError('Relationship unlink failed. Refresh the directory and try again.');
        return;
      }

      setLinkMessage('Relationship link removed.');
      await loadRelationshipData();
    } catch {
      setLinkError('Relationship unlink failed. Refresh the directory and try again.');
    } finally {
      setUnlinkLoadingKey('');
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
            {
              label: `Configured free providers: ${
                status.aiRouting.configuredFreeModelProviders.join(', ') || 'none'
              }`,
              ok: status.aiRouting.configuredFreeModelProviders.length > 0,
            },
            {
              label: `Eligible free models: ${
                status.aiRouting.eligibleAutoFreeModels.join(', ') || 'none'
              }`,
              ok: status.aiRouting.eligibleAutoFreeModels.length > 0,
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
              <RelationshipExistingLinks
                directory={relationshipDirectory}
                unlinkLoadingKey={unlinkLoadingKey}
                onDeleteLink={deleteRelationshipLink}
              />
              <RelationshipLinkForms
                directory={relationshipDirectory}
                parentLinkStudentId={parentLinkStudentId}
                parentLinkParentId={parentLinkParentId}
                teacherLinkStudentId={teacherLinkStudentId}
                teacherLinkTeacherId={teacherLinkTeacherId}
                teacherLinkSubject={teacherLinkSubject}
                loading={linkLoading}
                message={linkMessage}
                error={linkError}
                onParentStudentChange={setParentLinkStudentId}
                onParentParentChange={setParentLinkParentId}
                onTeacherStudentChange={setTeacherLinkStudentId}
                onTeacherTeacherChange={setTeacherLinkTeacherId}
                onTeacherSubjectChange={setTeacherLinkSubject}
                onCreateParentLink={handleCreateParentLink}
                onCreateTeacherLink={handleCreateTeacherLink}
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

function RelationshipLinkForms({
  directory,
  parentLinkStudentId,
  parentLinkParentId,
  teacherLinkStudentId,
  teacherLinkTeacherId,
  teacherLinkSubject,
  loading,
  message,
  error,
  onParentStudentChange,
  onParentParentChange,
  onTeacherStudentChange,
  onTeacherTeacherChange,
  onTeacherSubjectChange,
  onCreateParentLink,
  onCreateTeacherLink,
}: {
  directory: RelationshipDirectory | null;
  parentLinkStudentId: string;
  parentLinkParentId: string;
  teacherLinkStudentId: string;
  teacherLinkTeacherId: string;
  teacherLinkSubject: string;
  loading: boolean;
  message: string;
  error: string;
  onParentStudentChange: (value: string) => void;
  onParentParentChange: (value: string) => void;
  onTeacherStudentChange: (value: string) => void;
  onTeacherTeacherChange: (value: string) => void;
  onTeacherSubjectChange: (value: string) => void;
  onCreateParentLink: () => void;
  onCreateTeacherLink: () => void;
}) {
  if (!directory) return null;

  return (
    <div className="mt-5 rounded-lg border border-[#e7e8e9] p-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-[#003461]" />
        <h3 className="text-sm font-semibold text-[#191c1d]">Create relationship links</h3>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-[#f8f9fa] p-4">
          <h4 className="text-sm font-semibold text-[#191c1d]">Parent to student</h4>
          <div className="mt-3 grid gap-3">
            <RelationshipSelect
              label="Student"
              value={parentLinkStudentId}
              options={directory.students.map((student) => ({
                value: student.id,
                label: `${student.name} (${student.grade})`,
              }))}
              onChange={onParentStudentChange}
            />
            <RelationshipSelect
              label="Parent"
              value={parentLinkParentId}
              options={directory.parents.map((parent) => ({
                value: parent.id,
                label: parent.name,
              }))}
              onChange={onParentParentChange}
            />
            <button
              onClick={onCreateParentLink}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#003461] px-3 text-sm font-semibold text-white hover:bg-[#002b50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save parent link
            </button>
          </div>
        </div>
        <div className="rounded-lg bg-[#f8f9fa] p-4">
          <h4 className="text-sm font-semibold text-[#191c1d]">Teacher to student</h4>
          <div className="mt-3 grid gap-3">
            <RelationshipSelect
              label="Student"
              value={teacherLinkStudentId}
              options={directory.students.map((student) => ({
                value: student.id,
                label: `${student.name} (${student.grade})`,
              }))}
              onChange={onTeacherStudentChange}
            />
            <RelationshipSelect
              label="Teacher"
              value={teacherLinkTeacherId}
              options={directory.teachers.map((teacher) => ({
                value: teacher.id,
                label: teacher.name,
              }))}
              onChange={onTeacherTeacherChange}
            />
            <RelationshipSelect
              label="Subject"
              value={teacherLinkSubject}
              options={[
                { value: 'Math', label: 'Math' },
                { value: 'Language Arts', label: 'Language Arts' },
                { value: 'Arts', label: 'Arts' },
                { value: 'ADST', label: 'ADST' },
              ]}
              onChange={onTeacherSubjectChange}
            />
            <button
              onClick={onCreateTeacherLink}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md bg-[#003461] px-3 text-sm font-semibold text-white hover:bg-[#002b50] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save teacher link
            </button>
          </div>
        </div>
      </div>
      {message && (
        <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">{message}</div>
      )}
      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    </div>
  );
}

function RelationshipSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#727781]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-[#c2c6d1] bg-white px-3 text-sm text-[#191c1d] outline-none focus:border-[#003461] focus:ring-2 focus:ring-[#003461]/20"
      >
        <option value="">Choose {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
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

function RelationshipExistingLinks({
  directory,
  unlinkLoadingKey,
  onDeleteLink,
}: {
  directory: RelationshipDirectory | null;
  unlinkLoadingKey: string;
  onDeleteLink: (payload: {
    kind: 'parent' | 'teacher';
    studentId: string;
    parentId?: string;
    teacherId?: string;
  }) => void;
}) {
  if (!directory) return null;

  const studentsById = new Map(directory.students.map((student) => [student.id, student]));
  const parentsById = new Map(directory.parents.map((parent) => [parent.id, parent]));
  const teachersById = new Map(directory.teachers.map((teacher) => [teacher.id, teacher]));
  const hasLinks = directory.parentLinks.length > 0 || directory.teacherLinks.length > 0;

  if (!hasLinks) {
    return (
      <div className="mt-5 rounded-lg border border-dashed border-[#c2c6d1] px-4 py-3 text-sm text-[#727781]">
        No relationship links have been created yet.
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-lg border border-[#e7e8e9] p-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-[#003461]" />
        <h3 className="text-sm font-semibold text-[#191c1d]">Existing relationship links</h3>
      </div>
      <div className="mt-4 grid gap-3">
        {directory.parentLinks.map((link) => {
          const student = studentsById.get(link.studentId);
          const parent = parentsById.get(link.parentId);
          const loadingKey = `parent:${link.parentId}:${link.studentId}`;
          return (
            <RelationshipLinkRow
              key={loadingKey}
              title={`${parent?.name ?? 'Unknown parent'} -> ${student?.name ?? 'Unknown student'}`}
              detail="Parent access"
              loading={unlinkLoadingKey === loadingKey}
              onDelete={() =>
                onDeleteLink({
                  kind: 'parent',
                  parentId: link.parentId,
                  studentId: link.studentId,
                })
              }
            />
          );
        })}
        {directory.teacherLinks.map((link) => {
          const student = studentsById.get(link.studentId);
          const teacher = teachersById.get(link.teacherId);
          const loadingKey = `teacher:${link.teacherId}:${link.studentId}`;
          return (
            <RelationshipLinkRow
              key={loadingKey}
              title={`${teacher?.name ?? 'Unknown teacher'} -> ${student?.name ?? 'Unknown student'}`}
              detail={`Teacher access · ${link.subjects.join(', ') || 'Math'}`}
              loading={unlinkLoadingKey === loadingKey}
              onDelete={() =>
                onDeleteLink({
                  kind: 'teacher',
                  teacherId: link.teacherId,
                  studentId: link.studentId,
                })
              }
            />
          );
        })}
      </div>
    </div>
  );
}

function RelationshipLinkRow({
  title,
  detail,
  loading,
  onDelete,
}: {
  title: string;
  detail: string;
  loading: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-[#f8f9fa] px-3 py-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-[#191c1d]">{title}</p>
        <p className="mt-0.5 text-xs text-[#727781]">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        disabled={loading}
        className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={`Remove ${title}`}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
        Remove
      </button>
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
