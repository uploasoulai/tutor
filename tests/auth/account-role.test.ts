import { describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';

const profileRoles = new Map<string, string | null>();

vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: (_column: string, id: string) => ({
          maybeSingle: async () => ({
            data: { role: profileRoles.get(id) ?? null },
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

describe('resolveAccountRole', () => {
  it('uses a non-student profiles.role before metadata', async () => {
    profileRoles.set('teacher-profile', 'teacher');
    const { resolveAccountRole } = await import('@/lib/auth/account-role');

    await expect(resolveAccountRole(user('teacher-profile', 'student'))).resolves.toBe('teacher');
  });

  it('keeps metadata roles when profiles.role is the default student role', async () => {
    profileRoles.set('metadata-parent', 'student');
    const { resolveAccountRole } = await import('@/lib/auth/account-role');

    await expect(resolveAccountRole(user('metadata-parent', 'parent'))).resolves.toBe('parent');
  });

  it('falls back to student when neither source has a supported role', async () => {
    profileRoles.set('unknown-role', 'owner');
    const { resolveAccountRole } = await import('@/lib/auth/account-role');

    await expect(resolveAccountRole(user('unknown-role', 'owner'))).resolves.toBe('student');
  });
});
