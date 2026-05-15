'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function RootPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace('/signup');
        return;
      }
      // User is logged in — route by role
      const response = await fetch('/api/auth/role');
      const roleData = response.ok ? ((await response.json()) as { role?: string }) : null;
      const role = roleData?.role ?? data.user.user_metadata?.role ?? 'student';
      if (role === 'admin') router.replace('/admin');
      else if (role === 'teacher') router.replace('/teacher');
      else if (role === 'parent') router.replace('/parent');
      else router.replace('/student');
    });
  }, [router, supabase.auth]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#f8f9fa]">
      <div className="w-8 h-8 border-4 border-[#003461] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
