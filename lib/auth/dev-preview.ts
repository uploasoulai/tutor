import type { User } from '@supabase/supabase-js';

export type DevPreviewRole = 'student' | 'parent' | 'admin';

const PREVIEW_USERS: Record<DevPreviewRole, User> = {
  student: {
    id: '00000000-0000-4000-8000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'student@local.invalid',
    app_metadata: { provider: 'dev-preview', providers: ['dev-preview'], role: 'student' },
    user_metadata: { dev_preview: true, role: 'student', first_name: 'Demo Student' },
    created_at: '2026-01-01T00:00:00.000Z',
  } as User,
  parent: {
    id: '00000000-0000-4000-8000-000000000002',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'parent@local.invalid',
    app_metadata: { provider: 'dev-preview', providers: ['dev-preview'], role: 'parent' },
    user_metadata: { dev_preview: true, role: 'parent', first_name: 'Demo Parent' },
    created_at: '2026-01-01T00:00:00.000Z',
  } as User,
  admin: {
    id: '00000000-0000-4000-8000-000000000003',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'admin@local.invalid',
    app_metadata: { provider: 'dev-preview', providers: ['dev-preview'], role: 'admin' },
    user_metadata: { dev_preview: true, role: 'admin', first_name: 'Demo Admin' },
    created_at: '2026-01-01T00:00:00.000Z',
  } as User,
};

/** UI-only preview identity. Never enabled in production or off localhost. */
export function getDevPreviewUser(role: DevPreviewRole): User | null {
  if (
    process.env.NODE_ENV !== 'development' ||
    typeof window === 'undefined' ||
    !['localhost', '127.0.0.1', '::1'].includes(window.location.hostname)
  ) {
    return null;
  }

  return PREVIEW_USERS[role];
}

export function isDevPreviewUser(user: User | null): boolean {
  return user?.user_metadata?.dev_preview === true;
}
