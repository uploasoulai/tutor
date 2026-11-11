'use client';
import {
  MessageCircle,
  ClipboardCheck,
  Route,
  BookOpen,
  Brain,
  BarChart3,
  ArrowUpRight,
} from 'lucide-react';
import { useI18n } from '@/lib/hooks/use-i18n';

/** Navigation and honest feature discovery only; never invents learner statistics. */
export function LearningSupportGuide({
  audience = 'student',
}: {
  audience?: 'student' | 'parent';
}) {
  const { locale } = useI18n();
  const zh = locale.startsWith('zh');
  const parent = audience === 'parent';
  const features = [
    {
      icon: MessageCircle,
      mode: 'personal',
      title: zh ? '卡住时，有人耐心陪着想' : 'Stuck? Work it out with a patient tutor',
      copy: zh
        ? '作业、一道题、一个没听懂的概念，随时问。一步步找思路，不只是拿到答案。'
        : 'Bring a homework question or a confusing idea. Get step-by-step guidance that helps you understand the why.',
      action: zh ? '问问私人家教' : 'Ask my tutor',
    },
    {
      icon: ClipboardCheck,
      mode: 'practice',
      title: zh ? '把错题变成下次的进步' : 'Turn tricky questions into lasting learning',
      copy: zh
        ? '把值得再练的问题保存到家教题库，做练习、回顾错题，逐步补上没有掌握的地方。'
        : 'Keep useful questions in your tutor question bank, practise, revisit mistakes and build confidence through review.',
      action: zh ? '练习与错题' : 'Practice & mistake review',
    },
    {
      icon: Route,
      mode: 'mastery',
      title: zh ? '有目标，也知道下一步怎么学' : 'A goal, a path and a next step',
      copy: zh
        ? '和家教一起制定个人学习路径，把大目标拆成知识点，按掌握情况继续学习与复习。'
        : 'Build a personal learning path with your tutor, break goals into knowledge points and revisit what needs practice.',
      action: zh ? '探索学习路径' : 'Explore learning paths',
    },
    {
      icon: BookOpen,
      mode: 'personal',
      title: zh ? '读资料、做笔记，不必独自摸索' : 'Read, research and keep the good ideas',
      copy: zh
        ? '带上自己的学习材料，让家教陪读、解释和总结；用笔记与资料库整理学到的内容。'
        : 'Study your own materials with help explaining and summarising them. Organise discoveries in notebooks and your study library.',
      action: zh ? '打开家教学习空间' : 'Open my study workspace',
    },
    {
      icon: Brain,
      mode: 'profile',
      title: zh ? '家教更懂你的学习需要' : 'Support shaped around your learner',
      copy: zh
        ? '设置学习档案，并在家教里管理学习记忆，让后续对话有上下文；记住的内容可以查看和管理。'
        : 'Set learning preferences and manage tutor memory so future conversations have context. You can review what is remembered.',
      action: zh ? '查看学习档案' : 'My learning profile',
    },
    {
      icon: BarChart3,
      mode: 'progress',
      title: zh ? '看见学过什么，再决定怎么继续' : 'See the learning, then choose what comes next',
      copy: zh
        ? '学校课程保存自己的进度与答题记录，私人家教也有学习活动记录，方便回看和继续。'
        : 'School lessons keep course progress and answers; your tutor keeps its own learning activity. Revisit your work and pick up where you left off.',
      action: zh ? '家教学习活动' : 'Tutor learning activity',
    },
  ];
  return (
    <section
      aria-label={zh ? '私人家教能为你做什么' : 'What your personal tutor can do'}
      className="rounded-3xl border border-[#dbe5ef] bg-white p-5 sm:p-7"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-[#126e75]">
        {zh ? '不止回答问题，更陪伴学习' : 'More than an answer. A partner in learning.'}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[#172b43]">
        {zh
          ? parent
            ? '给孩子一位随时可以请教的私人家教'
            : '你的全天候私人家教，陪你越学越明白'
          : parent
            ? 'A 24/7 tutor for the moments your child needs help'
            : 'Your 24/7 tutor, for the whole learning journey'}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#536579]">
        {zh
          ? '按课程系统学，遇到困难再找家教一起想，也可以从孩子自己的好奇心出发。一个 CoastalTutor 账号，连接课堂、个人辅导与复习。'
          : 'Follow a course, ask for help when something is difficult, or follow your own curiosity. One CoastalTutor account connects lessons, personal coaching and review.'}
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {features.map(({ icon: Icon, mode, title, copy, action }) => (
          <a
            key={mode + title}
            href={`/api/learning/launch?mode=${parent ? 'personal' : mode}`}
            className="group flex flex-col rounded-2xl border border-[#e0e9ef] bg-[#f8fbfc] p-5 transition-colors hover:border-[#8bbcaf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#126e75]"
          >
            <Icon className="mb-3 h-6 w-6 text-[#126e75]" aria-hidden="true" />
            <h3 className="font-bold leading-6 text-[#173e49]">{title}</h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-[#536579]">{copy}</p>
            <span className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#005b84]">
              {parent ? (zh ? '在我的家教中体验' : 'Explore in my own tutor') : action}
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>
        ))}
      </div>
      <div className="mt-5 rounded-2xl bg-[#edf6ee] p-4 text-sm leading-7 text-[#36584e]">
        <strong>
          {zh
            ? '课堂遇到错题，下一步是什么？'
            : 'A tricky answer in School Learning? Here is the next step.'}
        </strong>
        <p>
          {zh
            ? '选择“请我的家教引导一下”，把题目和自己的回答带到家教，确认后再开始对话。家教继续引导思路，你可以把值得复习的问题留在家教题库。'
            : 'Choose “Ask my tutor” on a supported mistake to bring the question and your response into your tutor. Review it before sending, then work through the reasoning and keep questions worth revisiting in your tutor question bank.'}
        </p>
      </div>
      <p className="mt-4 text-xs leading-6 text-[#64758a]">
        {parent
          ? zh
            ? '上面的入口用于体验你自己的家教。孩子在自己的账号中学习；下方家庭报告展示已关联孩子的学校学习情况。'
            : 'These links explore your own tutor. Your child learns in their own account; family reports below show linked learners’ school activity.'
          : zh
            ? '课堂与家教使用同一个平台身份；学校课程记录和家教学习记录目前分别查看。'
            : 'Your account connects both spaces. School records and tutor learning activity are currently viewed separately.'}
      </p>
    </section>
  );
}
