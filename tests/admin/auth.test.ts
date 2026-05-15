import { describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: (_column: string, id: string) => ({
          maybeSingle: async () => ({
            data: { role: id === 'profile-admin' ? 'admin' : 'student' },
            error: null,
          }),
        }),
      }),
    }),
  }),
}));

const user = (id: string, role?: string) =>
  ({
    id,
    user_metadata: role ? { role } : {},
  }) as User;

describe('assertAdminUser', () => {
  it('accepts auth metadata admins', async () => {
    const { assertAdminUser } = await import('@/lib/admin/auth');

    await expect(assertAdminUser(user('metadata-admin', 'admin'))).resolves.toMatchObject({
      id: 'metadata-admin',
    });
  });

  it('accepts profiles.role admins', async () => {
    const { assertAdminUser } = await import('@/lib/admin/auth');

    await expect(assertAdminUser(user('profile-admin'))).resolves.toMatchObject({
      id: 'profile-admin',
    });
  });

  it('rejects non-admin users', async () => {
    const { assertAdminUser, AdminAuthError } = await import('@/lib/admin/auth');

    await expect(assertAdminUser(user('student'))).rejects.toBeInstanceOf(AdminAuthError);
  });
});
