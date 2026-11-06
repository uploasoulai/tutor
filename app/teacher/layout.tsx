import { redirect } from 'next/navigation';

/** Teacher accounts are retained for existing data but dormant in this release. */
export default function TeacherDormantLayout({ children }: { children: React.ReactNode }) {
  void children;
  redirect('/login?account=teacher-inactive');
}
