'use client';

import { useRouter } from 'next/navigation';

import { Home } from '@/components/marketing-home';

export default function LandingPage() {
  const router = useRouter();

  return (
    <Home
      start={() => router.push('/signup')}
      signIn={() => router.push('/login')}
    />
  );
}
