import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveAccountRole } from '@/lib/auth/account-role';
import { CoastalMark } from '@/components/coastal-mark';
import { PreparedAdventure } from '@/components/learning/prepared-adventure';
export default async function AdventurePage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect('/login?next=%2Fschool-learning%2Fchina%2Fadventure');
  return (
    <main className="min-h-screen bg-[#fff9ed] px-4 py-7 text-[#294f51]">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold">
          <CoastalMark className="h-8 w-8" />
          CoastalTutor
        </Link>
        <Link href="/school-learning" className="ml-5 text-sm underline">
          返回课程学习
        </Link>
        <PreparedAdventure preview={(await resolveAccountRole(user)) !== 'student'} />
      </div>
    </main>
  );
}
