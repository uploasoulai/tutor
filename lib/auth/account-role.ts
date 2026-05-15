import type { User } from '@supabase/supabase-js';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type AccountRole = 'student' | 'parent' | 'teacher' | 'admin';

const ACCOUNT_ROLES = new Set(['student', 'parent', 'teacher', 'admin']);

export function readMetadataRole(user: User | null): AccountRole | null {
  const role = user?.user_metadata?.role;
  return typeof role === 'string' && ACCOUNT_ROLES.has(role) ? (role as AccountRole) : null;
}

export async function readProfileRole(userId: string): Promise<AccountRole | null> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const role = data?.role;
  return typeof role === 'string' && ACCOUNT_ROLES.has(role) ? (role as AccountRole) : null;
}

export async function resolveAccountRole(user: User): Promise<AccountRole> {
  const profileRole = await readProfileRole(user.id);
  const metadataRole = readMetadataRole(user);

  if (profileRole && profileRole !== 'student') {
    return profileRole;
  }

  return metadataRole ?? profileRole ?? 'student';
}

export async function hasAccountRole(user: User, expectedRole: AccountRole): Promise<boolean> {
  return (await resolveAccountRole(user)) === expectedRole;
}
