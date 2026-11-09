import { resolveAccountRole } from '@/lib/auth/account-role';
import { Home } from '@/components/marketing-home';
import { createClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: Awaited<ReturnType<typeof resolveAccountRole>> = 'student';
  if (user) {
    try {
      role = await resolveAccountRole(user);
    } catch {
      // Keep the platform homepage usable if profile lookup is briefly unavailable.
    }
  }

  const dashboardHref = role === 'admin' ? '/admin' : role === 'parent' ? '/parent' : '/student';
  return <Home isAuthenticated={Boolean(user)} dashboardHref={dashboardHref} />;
}
