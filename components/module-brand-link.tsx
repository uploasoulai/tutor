'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { CoastalMark } from '@/components/coastal-mark';

function isModulePath(pathname: string) {
  return (
    pathname === '/explore' ||
    pathname === '/generation-preview' ||
    pathname.startsWith('/school-learning') ||
    pathname.startsWith('/student/lesson')
  );
}

/** Brand route back to the public CoastalTutor homepage for active learning modules. */
export function ModuleBrandLink() {
  const pathname = usePathname();
  if (!pathname || !isModulePath(pathname)) return null;

  return (
    <Link
      href="/"
      aria-label="CoastalTutor home"
      title="CoastalTutor home"
      className="fixed left-4 top-3 z-[100] inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200/70 bg-white/90 px-2.5 text-slate-800 shadow-sm backdrop-blur transition-colors hover:bg-white dark:border-slate-700/70 dark:bg-slate-900/90 dark:text-slate-100 dark:hover:bg-slate-900"
    >
      <CoastalMark className="h-6 w-6 text-[#0c5b7a] dark:text-[#8ce0d0]" />
      <span className="text-sm font-semibold tracking-tight">CoastalTutor</span>
    </Link>
  );
}
