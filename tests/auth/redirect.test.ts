import { describe, expect, it } from 'vitest';

import { buildAuthCallbackUrl, getRoleLandingPath } from '@/lib/auth/redirect';

describe('getRoleLandingPath', () => {
  it('routes signup roles to the correct first screen', () => {
    expect(getRoleLandingPath('student')).toBe('/onboarding');
    expect(getRoleLandingPath('teacher')).toBe('/teacher');
    expect(getRoleLandingPath('parent')).toBe('/parent');
  });
});

describe('buildAuthCallbackUrl', () => {
  it('builds a site-local callback URL with next and role parameters', () => {
    expect(
      buildAuthCallbackUrl({
        origin: 'https://tutor.uploadsoul.com',
        next: '/onboarding',
        role: 'student',
      }),
    ).toBe('https://tutor.uploadsoul.com/auth/callback?next=%2Fonboarding&role=student');
  });
});
