'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { createClient } from '@/lib/supabase/client';
import { isSupabasePublicConfigured } from '@/lib/supabase/public-config';

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();
  const configured = isSupabasePublicConfigured();

  useEffect(() => {
    if (!configured) return;

    supabase.auth
      .getUser()
      .then(async ({ data }) => {
        if (!data.user) {
          router.replace('/signup');
          return;
        }

        const response = await fetch('/api/auth/role');
        const roleData = response.ok ? ((await response.json()) as { role?: string }) : null;
        const role = roleData?.role ?? data.user.user_metadata?.role ?? 'student';
        if (role === 'admin') router.replace('/admin');
        else if (role === 'teacher') router.replace('/teacher');
        else if (role === 'parent') router.replace('/parent');
        else router.replace('/student');
      })
      .catch(() => {
        router.replace('/signup');
      });
  }, [configured, router, supabase.auth]);

  if (!configured) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa] px-6">
        <div className="max-w-md rounded-lg border border-red-100 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-[#191c1d]">Supabase Auth is not configured</h1>
          <p className="mt-2 text-sm leading-6 text-[#424750]">
            Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in the deployment
            environment, then redeploy.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#003461] border-t-transparent" />
    </div>
  );
}
