import Link from 'next/link';
import { CoastalMark } from '@/components/coastal-mark';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CourseLibraryBoard } from '@/components/learning/course-library-board';
import { resolveAccountRole } from '@/lib/auth/account-role';

export default async function CourseLibraryPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  if (!user) redirect('/login?next=%2Fschool-learning%2Flibrary');
  const preview = (await resolveAccountRole(user)) !== 'student';
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
        <h1 className="mt-8 text-3xl font-bold">大家的课程书架</h1>
        <p className="mt-3 max-w-3xl leading-7 text-[#52716e]">
          好课程一起用。内容共享，你的学习进度和答题记录单独保存。测试阶段，推荐课程和试用课程都可以直接复用，无需重复生成。
          {preview ? '当前为家长或管理预览，不会写入学生成绩。' : ''}
        </p>
        <CourseLibraryBoard preview={preview} />
      </div>
    </main>
  );
}
