'use client';

import Link from 'next/link';
import { MessageCircle, Route, ClipboardCheck, NotebookPen, Library, Brain, BookOpen, BarChart3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { scopedUrl } from '@/lib/workspace-scope';

/** Navigation only: all records remain in the learner's native workspace. */
export function StudyShortcuts() {
  const { i18n } = useTranslation();
  const zh = i18n.language.startsWith('zh');
  const links = [
    { href: '/learning/mastery', icon: Route, title: zh ? '学习路径' : 'Learning paths', copy: zh ? '和家教一起把大目标拆成知识点，逐步学习并安排复习。' : 'Turn a goal into knowledge points with your tutor, study step by step and revisit what needs practice.' },
    { href: '/learning/practice', icon: ClipboardCheck, title: zh ? '练习与错题' : 'Practice & mistakes', copy: zh ? '把值得再练的问题保存在题库，回顾错题、练习和复习，逐步弄懂原因。' : 'Save questions worth practising, revisit mistakes and work toward understanding rather than memorising an answer.' },
    { href: '/notebooks', icon: NotebookPen, title: zh ? '我的笔记' : 'My notebooks', copy: zh ? '把思路、总结和学习收获整理成笔记，方便以后继续。' : 'Keep explanations, your own ideas and study discoveries organised for your next session.' },
    { href: '/knowledge-bases', icon: Library, title: zh ? '学习资料库' : 'Study library', copy: zh ? '带上自己的参考资料，让家教根据学习材料协助查找与理解。' : 'Bring your reference materials into your workspace and use them to support questions and research.' },
    { href: '/memory', icon: Brain, title: zh ? '学习记忆' : 'Learning memory', copy: zh ? '查看和管理家教记住的学习背景，让后续对话有上下文。' : 'Review and manage the learning context your tutor remembers for future conversations.' },
    { href: '/learning/reading', icon: BookOpen, title: zh ? '陪读与理解' : 'Read with your tutor', copy: zh ? '带着材料阅读，遇到不明白的地方就提问，边读边整理理解。' : 'Study your materials, ask about difficult passages and build understanding as you read.' },
    { href: '/learning/books', icon: BookOpen, title: zh ? '我的学习书' : 'My learning books', copy: zh ? '按自己想学的主题组织章节，生成并继续阅读学习书。' : 'Organise a subject into chapters, create a learning book and continue reading where you left off.' },
    { href: '/settings/progress', icon: BarChart3, title: zh ? '家教学习活动' : 'Tutor learning activity', copy: zh ? '回看在家教里进行的学习活动，看看下一步想继续什么。' : 'Look back at activity in your tutor workspace and decide what to continue next.' },
  ];
  return <section aria-label={zh ? '我的学习工具' : 'My learning tools'} className="mb-7">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-muted/30 p-5">
      <div><h2 className="text-xl font-semibold">{zh ? '不止解答一道题，而是陪你学会' : 'More than a homework answer. Your 24/7 learning companion.'}</h2><p className="mt-1 max-w-xl text-sm text-muted-foreground">{zh ? '卡住时一起找思路，读资料时有人陪着理解，再把学到的内容整理、练习、复习。先选一件你现在想做的事。' : 'Work through a tricky idea, study your own materials, then keep, practise and revisit what you learn. Choose what would help you right now.'}</p></div>
      <Link href={scopedUrl('/chat')} prefetch={false} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><MessageCircle size={18} />{zh ? '问问我的家教' : 'Ask my tutor'}</Link>
    </div>
    <p className="mb-4 text-sm leading-6 text-muted-foreground">{zh ? 'School Learning 中可选择“请我的家教引导一下”，把题目和回答带来继续思考。课程记录和这里的家教活动目前分别查看。' : 'Coming from a school lesson? Use its Ask my tutor option to bring a tricky question and your response here. School records and tutor activity are currently viewed separately.'}</p>
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{links.map(({ href, icon: Icon, title, copy }) => <Link key={href} href={scopedUrl(href)} prefetch={false} className="group rounded-xl border border-border p-4 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"><div className="flex items-center gap-2 text-sm font-semibold"><Icon size={17} className="text-muted-foreground" />{title}<span aria-hidden className="ml-auto text-muted-foreground">↗</span></div><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{copy}</p></Link>)}</div>
  </section>;
}
