import { NextResponse, type NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import type { AccountRole } from '@/lib/auth/account-role';

const SIGNUP_ROLES = new Set<AccountRole>(['student', 'teacher', 'parent']);

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') ?? '/';
  const role = requestUrl.searchParams.get('role') as AccountRole | null;

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    if (role && SIGNUP_ROLES.has(role)) {
      await supabase.auth.updateUser({ data: { role } });
    }
  }

  return NextResponse.redirect(new URL(next.startsWith('/') ? next : '/', requestUrl.origin));
}
