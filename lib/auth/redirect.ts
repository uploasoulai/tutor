export type SignupRole = 'student' | 'parent';

export function getRoleLandingPath(role: SignupRole) {
  if (role === 'student') return '/onboarding';
  return '/parent';
}

export function buildAuthCallbackUrl({
  origin,
  next,
  role,
}: {
  origin: string;
  next: string;
  role?: SignupRole;
}) {
  const params = new URLSearchParams({ next });
  if (role) {
    params.set('role', role);
  }

  return `${origin}/auth/callback?${params.toString()}`;
}
