import Link from 'next/link';
import { CoastalMark } from '@/components/coastal-mark';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveAccountRole } from '@/lib/auth/account-role';
import { AssessmentSpace } from '@/components/learning/assessment-space';
export default async function AssessmentsPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect('/login?next=%2Fschool-learning%2Fassessments');
  const role = await resolveAccountRole(user);
  return (
    <main className="min-h-screen bg-[#fff9ed] px-4 py-8 text-[#173e49]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold">
          <CoastalMark className="h-8 w-8" />
          CoastalTutor
        </Link>
        <Link href="/school-learning" className="ml-5 text-sm underline">
          返回课程学习
        </Link>
        <h1 className="mt-8 text-3xl font-bold">小测验，发现下一步</h1>
        <p className="mt-3 leading-7 text-[#52716e]">
          按年级和学习范围选题，看看哪些已经会了，哪些还需要帮助。客观题自动判分，难题再请私人家教一步一步讲。
        </p>
        <AssessmentSpace preview={role !== 'student'} guardian={role === 'parent'} />
      </div>
    </main>
  );
}
