import { redirect } from 'next/navigation';

import { resolveAccountRole } from '@/lib/auth/account-role';
import { Home } from '@/components/marketing-home';
import { createClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    let role: Awaited<ReturnType<typeof resolveAccountRole>> = 'student';
    try {
      role = await resolveAccountRole(user);
    } catch {
      // Keep a valid signed-in learner in the product if profile lookup is briefly unavailable.
    }
    redirect(role === 'admin' ? '/admin' : role === 'parent' ? '/parent' : '/student');
  }

  return <Home />;
}
