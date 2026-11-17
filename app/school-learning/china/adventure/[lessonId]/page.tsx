import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { resolveAccountRole } from '@/lib/auth/account-role';
import { CoastalMark } from '@/components/coastal-mark';
import { readablePreparedLesson, publicPreparedLesson } from '@/lib/curriculum/prepared-courses';
import { PreparedCoursePlayer } from '@/components/learning/prepared-adventure';
export default async function PreparedLessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user)
    redirect(`/login?next=${encodeURIComponent('/school-learning/china/adventure/' + lessonId)}`);
  const role = await resolveAccountRole(user);
  const lesson = await readablePreparedLesson(lessonId, user.id, role === 'admin');
  if (!lesson) notFound();
  return (
    <main className="min-h-screen bg-[#fff9ed] px-4 py-6 text-[#294f51]">
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="inline-flex items-center gap-2 text-lg font-bold">
          <CoastalMark className="h-8 w-8" />
          CoastalTutor
        </Link>
        <PreparedCoursePlayer lesson={publicPreparedLesson(lesson)} preview={role !== 'student'} />
      </div>
    </main>
  );
}
