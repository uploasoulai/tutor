'use client';

import Link from 'next/link';
import { MessageCircle, Route, ClipboardCheck, NotebookPen, Library, Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { scopedUrl } from '@/lib/workspace-scope';

/** Navigation only: all records remain in the learner's native workspace. */
export function StudyShortcuts() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const links = [
    { href: '/learning/mastery', icon: Route, title: zh ? '学习路径' : 'Learning paths', copy: zh ? '一步一步掌握目标，按时复习' : 'Work toward a goal and revisit what needs practice' },
    { href: '/learning/practice', icon: ClipboardCheck, title: zh ? '练习与错题' : 'Practice & mistakes', copy: zh ? '查看题库，练习和复习错题' : 'Open your question bank and review mistakes' },
    { href: '/notebooks', icon: NotebookPen, title: zh ? '我的笔记' : 'My notebooks', copy: zh ? '整理想法，保存学习收获' : 'Organise ideas and keep what you learn' },
    { href: '/knowledge-bases', icon: Library, title: zh ? '学习资料库' : 'Study library', copy: zh ? '把资料带进你的学习空间' : 'Bring your reference materials into your workspace' },
    { href: '/memory', icon: Brain, title: zh ? '学习记忆' : 'Learning memory', copy: zh ? '查看和管理家教记住的内容' : 'Review and manage what your tutor remembers' },
  ];
  return <section aria-label={zh ? '我的学习工具' : 'My learning tools'} className="mb-7">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-5">
      <div><h2 className="text-base font-semibold">{zh ? '你的私人家教，随时在这里' : 'Your personal tutor is here for you'}</h2><p className="mt-1 max-w-xl text-sm text-muted-foreground">{zh ? '提问、读资料、做练习。每一步都在同一个学习空间里继续。' : 'Ask a question, study your materials or practise. Keep learning in your own workspace.'}</p></div>
      <Link href={scopedUrl('/chat')} prefetch={false} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><MessageCircle size={18} />{zh ? '问问我的家教' : 'Ask my tutor'}</Link>
    </div>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{links.map(({ href, icon: Icon, title, copy }) => <Link key={href} href={scopedUrl(href)} prefetch={false} className="group rounded-xl border border-border p-4 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><div className="flex items-center gap-2 text-sm font-semibold"><Icon size={17} className="text-muted-foreground" />{title}<span aria-hidden className="ml-auto text-muted-foreground">↗</span></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p></Link>)}</div>
  </section>;
}
