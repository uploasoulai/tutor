'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';
import { CheckCircle2, Loader2, LogOut, Settings, ShieldCheck, XCircle } from 'lucide-react';

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

export default function AdminDashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(true);
  const [status, setStatus] = useState<RuntimeStatus | null>(null);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
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
