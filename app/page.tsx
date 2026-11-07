'use client';

import { Home } from '@/components/marketing-home';

export default function LandingPage() {
  return (
    <Home
      start={() => window.location.assign('/signup')}
      signIn={() => window.location.assign('/login')}
    />
  );
}
