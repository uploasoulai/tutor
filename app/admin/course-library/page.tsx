import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { assertAdminUser } from '@/lib/admin/auth';
import { CourseLibraryBoard } from '@/components/learning/course-library-board';

export default async function LibraryReviewPage() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser();
  try {
    await assertAdminUser(user);
  } catch {
    redirect('/school-learning/library');
  }
  return (
    <main className="min-h-screen bg-[#f2f7f4] p-6 text-[#173e49]">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="underline">
          返回管理首页
        </Link>
        <h1 className="mt-6 text-3xl font-bold">课程库审核</h1>
        <p className="mt-3 leading-7">
          推荐会按用户合并计数，不按票数自动发布。先检查内容、年级适配与操作，再决定是否替换同一版本课纲的默认课程。
        </p>
        <CourseLibraryBoard admin />
      </div>
    </main>
  );
}
