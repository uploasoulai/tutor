import type { User } from '@supabase/supabase-js';

import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export class AdminAuthError extends Error {
  constructor(
    message: string,
    public readonly status: 401 | 403,
  ) {
    super(message);
    this.name = 'AdminAuthError';
  }
}

export async function assertAdminUser(user: User | null): Promise<User> {
  if (!user) {
    throw new AdminAuthError('Authentication required', 401);
  }

  if (user.user_metadata?.role === 'admin') {
    return user;
  }

  const isProfileAdmin = await isAdminProfile(user.id);
  if (!isProfileAdmin) {
    throw new AdminAuthError('Admin account required', 403);
  }

  return user;
}

export async function isAdminProfile(userId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.role === 'admin';
}
