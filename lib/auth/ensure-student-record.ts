import type { User } from '@supabase/supabase-js';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

/**
 * Make sure an authenticated learner has the shared platform records that
 * student-owned rows reference. Some older accounts completed auth without
 * completing the browser onboarding writes.
 */
export async function ensureStudentRecord(user: User) {
  const admin = createSupabaseAdminClient();
  const metadata = user.user_metadata ?? {};
  const firstName =
    typeof metadata.first_name === 'string' && metadata.first_name.trim()
      ? metadata.first_name.trim().slice(0, 100)
      : undefined;

  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: user.id,
      role: 'student',
      ...(firstName ? { full_name: firstName, preferred_name: firstName } : {}),
    },
    { onConflict: 'id', ignoreDuplicates: true },
  );
  if (profileError) throw profileError;

  const { error: studentError } = await admin
    .from('students')
    .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true });
  if (studentError) throw studentError;
}
