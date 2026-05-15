import type { User } from '@supabase/supabase-js';

import { hasAccountRole } from '@/lib/auth/account-role';

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

  if (!(await hasAccountRole(user, 'admin'))) {
    throw new AdminAuthError('Admin account required', 403);
  }

  return user;
}
