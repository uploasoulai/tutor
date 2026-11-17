'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CoastalMark } from '@/components/coastal-mark';
import './marketing-home.css';

type Intent = 'school' | 'tutor' | 'classroom' | 'general';
const modes = [
  {
    id: 'school' as Intent,
    title: 'School Learning',
    zh: '跟着课程，一步一步学',
    en: 'Follow a course, one idea at a time',
    color: 'mint',
    image: '/images/classroom-preview.webp',
    question: [
      '想按年级系统学习？从这里开始。',
      'Want a clear route through school subjects? Start here.',
    ],
    steps: [
      '选择课程路线和知识点 → 打开课程 → 边听边玩，再做练习。',
      'Choose a curriculum and topic → open a lesson → learn, play and practise.',
    ],
    benefits: [
      [
        '虚拟老师和同学陪伴，留出思考与动手时间',
        '学习进度和答题记录保存，方便回来继续',
        '中国课程、BC课程按各自路线学习',
      ],
      [
        'A virtual teacher and classmates, with time to think and try',
        'Saved course progress and answers to revisit',
        'Separate China and BC curriculum routes',
      ],
    ],
    action: ['进入学校课程', 'Explore school learning'],
  },
  {
    id: 'tutor' as Intent,
    title: 'Personal AI Tutor',
    zh: '随时提问的私人家教',
    en: 'Your personal tutor, whenever a question comes up',
    color: 'peach',
    image: '/images/ai-tutor.svg',
    question: [
      '作业卡住了？有个问题想弄明白？',
      'Stuck on homework, a mistake or an interesting question?',
    ],
    steps: [
      '带上题目或学习资料 → 说说哪里不懂 → 跟家教一步步找思路。',
      'Bring a question or learning material → say where you are stuck → work it out together.',
    ],
    benefits: [
      [
        '24小时可提问，耐心解释，也可以换一种讲法',
        '练习、题库与错题复习，学习路径和记忆',
        '阅读资料、整理笔记，支持自主学习',
      ],
      [
        'Patient, step-by-step explanations, available around the clock',
        'Practice, question notebook, review, learning paths and memory',
        'Read materials, organise notes and explore independently',
      ],
    ],
    action: ['问问我的私人家教', 'Ask my personal tutor'],
  },
  {
    id: 'classroom' as Intent,
    title: 'Interactive Classroom',
    zh: '把好奇心变成一堂课',
    en: 'Turn a topic into an interactive class',
    color: 'lavender',
    image: '/images/interactive-class.svg',
    question: [
      '想学一个特别的主题，或用自己的资料上课？',
      'Have a special topic or your own material to explore?',
    ],
    steps: [
      '输入主题或上传资料 → 准备互动课堂 → 看演示、做活动和测验。',
      'Enter a topic or add material → prepare a class → explore explanations, activities and quizzes.',
    ],
    benefits: [
      [
        '从孩子的兴趣出发，也适合家长准备特色课',
        '把抽象概念变成图解、演示和互动',
        '自由创建主题课堂，不必跟着学校目录',
      ],
      [
        'Follow a child’s interests or prepare a special family lesson',
        'Explore ideas through diagrams, demonstrations and interactions',
        'Create freely beyond the school course sequence',
      ],
    ],
    action: ['创建我的互动课', 'Create an interactive class'],
  },
];
export function Home({
  start,
  signIn,
  isAuthenticated = false,
  dashboardHref = '/student',
}: {
  start?: (intent?: Intent) => void;
  signIn?: () => void;
  isAuthenticated?: boolean;
  dashboardHref?: string;
}) {
  const [english, setEnglish] = useState(false);
  const t = (zh: string, en: string) => (english ? en : zh);
  const go = (intent: Intent = 'general') => {
    if (!isAuthenticated) {
      if (start) return start(intent);
      window.location.assign('/signup');
      return;
    }
    const paths = {
      school: '/school-learning',
      tutor: '/api/learning/launch',
      classroom: '/explore',
      general: dashboardHref,
    };
    window.location.assign(paths[intent]);
  };
  return (
    <div className="public-site" lang={english ? 'en' : 'zh-CN'}>
      <header className="public-header">
        <Link className="brand" href="/" aria-label="CoastalTutor">
          <span className="brand-mark">
            <CoastalMark className="h-6 w-6 text-white" />
          </span>
          <b>CoastalTutor</b>
        </Link>
        <nav aria-label={t('主页导航', 'Main navigation')}>
          <a href="#learning">{t('三个学习空间', 'Three ways to learn')}</a>
          <a href="#classroom">{t('看看真实课堂', 'See the classroom')}</a>
          <button
            onClick={() => setEnglish(!english)}
            aria-label={t('Switch to English', '切换中文')}
          >
            {english ? '中文' : 'EN'}
          </button>
          <button
            className="sign-in-link"
            onClick={() =>
              isAuthenticated ? go() : signIn ? signIn() : window.location.assign('/login')
            }
          >
            {isAuthenticated ? t('我的学习空间', 'My learning space') : t('登录', 'Sign in')}
          </button>
        </nav>
      </header>
      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="pill">
              ✦{' '}
              {t(
                '为孩子的好奇心，也为家长的安心',
                'For curious children and the families beside them',
              )}
            </span>
            <h1>
              {t('有老师陪着学，', 'A place to learn,')}
              <br />
              <em>{t('也有一起发现的快乐。', 'with someone beside you.')}</em>
            </h1>
            <p>
              {t(
                '按课程在虚拟教室里学，遇到难题问私人家教，想探索新主题就创建互动课。三个清楚的入口，一个 CoastalTutor 账号。',
                'Follow a course in a virtual classroom, ask your personal tutor for help, or create a class around something you love. Three clear starting points. One CoastalTutor account.',
              )}
            </p>
            <div className="hero-actions">
              <button className="button" onClick={() => go('school')}>
                {t('开始学习', 'Start learning')} →
              </button>
              <a className="text-button" href="/classroom-preview">
                ▷ {t('先免费看看课堂', 'Preview a class first')}
              </a>
            </div>
            <p className="trust-line">
              {t(
                '短讲解 · 动手小游戏 · 错题与复习 · 自己的学习记录',
                'Short explanations · Hands-on games · Mistake review · Your learning records',
              )}
            </p>
          </div>
          <figure className="classroom-hero">
            <img
              src="/images/classroom-preview.webp"
              alt={t(
                'CoastalTutor 实验课画面：虚拟老师、同学与乘法教学屏幕',
                'CoastalTutor experimental lesson with a virtual teacher, classmates and a multiplication board',
              )}
              width="1200"
              height="850"
              fetchPriority="high"
            />
            <figcaption>
              ✦{' '}
              {t(
                '我们的二年级实验课 · 实际界面',
                'Our Grade 2 experimental class · actual interface',
              )}
            </figcaption>
            <span className="classroom-bubble">
              {t('“老师，我有一个猜想！”', '“Teacher, I have an idea!”')}
            </span>
          </figure>
        </section>
        <section className="section entries" id="learning">
          <div className="section-heading">
            <span className="eyebrow">{t('今天想怎么学？', 'WHAT DO YOU NEED TODAY?')}</span>
            <h2>{t('选对入口，就知道下一步。', 'Choose your starting point.')}</h2>
            <p>
              {t(
                '系统学课程、随时问家教、自由创课堂。它们各有分工，可以配合使用。',
                'Follow a course, ask for personal help, or create a class. Each has a different job; use them together.',
              )}
            </p>
          </div>
          <div className="entry-grid">
            {modes.map((mode, i) => (
              <article className={`entry-card ${mode.color}`} key={mode.id}>
                <div className="entry-image">
                  <img src={mode.image} alt={english ? mode.en : mode.zh} loading="lazy" />
                  <span>0{i + 1}</span>
                </div>
                <div className="entry-body">
                  <p className="mode-name">{mode.title}</p>
                  <h3>{english ? mode.en : mode.zh}</h3>
                  <p className="mode-question">{mode.question[english ? 1 : 0]}</p>
                  <ol className="mode-benefits">
                    {mode.benefits[english ? 1 : 0].map((item) => (
                      <li key={item}>✦ {item}</li>
                    ))}
                  </ol>
                  <div className="mode-steps">
                    <b>{t('怎么用', 'How to use it')}</b>
                    <p>{mode.steps[english ? 1 : 0]}</p>
                  </div>
                  <button onClick={() => go(mode.id)}>{mode.action[english ? 1 : 0]} →</button>
                </div>
              </article>
            ))}
          </div>
          <p className="shared-note">
            {t(
              '一个账号连接三个板块。学校课程保留自己的进度和答题记录，私人家教保留自己的学习空间；遇到错题，可以主动把题目带给同一个家教。',
              'One account connects all three. School courses keep their progress and answers; the personal tutor keeps your own workspace. Bring a course mistake to that same tutor when you want help.',
            )}
          </p>
        </section>
        <section className="section showcase" id="classroom">
          <div className="section-heading">
            <span className="eyebrow">{t('先看见，再决定', 'SEE IT BEFORE YOU START')}</span>
            <h2>{t('不只听讲，还要想、要玩、要试。', 'Watch. Think. Play. Try.')}</h2>
            <p>
              {t(
                '这是我们精心准备的实验课，不代表每个自动生成课程都已达到相同效果。',
                'This is our curated experimental lesson; automatically generated classes may vary in quality and available media.',
              )}
            </p>
          </div>
          <div className="tour-grid">
            <div>
              <video
                controls
                playsInline
                preload="none"
                poster="/images/classroom-preview.webp"
                aria-label={t(
                  '真实课堂操作短片，无声预览',
                  'Actual classroom interaction clip, silent preview',
                )}
              >
                <source src="/media/classroom-tour.webm" type="video/webm" />
                {t(
                  '浏览器无法播放短片，请打开下方课堂预览。',
                  'Open the classroom preview below if this clip does not play.',
                )}
              </video>
              <p className="media-caption">
                {t(
                  '课堂操作短片 · 无声预览。点击下方进入课堂，可听配音并亲手体验。',
                  'Actual interaction clip · silent preview. Open the class below to hear the narration and try it yourself.',
                )}
              </p>
              <a className="button" href="/classroom-preview">
                ▷ {t('进入有声音的课堂预览', 'Open the narrated classroom preview')}
              </a>
            </div>
            <div className="tour-notes">
              <h3>
                {t(
                  '孩子可以慢慢来，同学也会犯错。',
                  'Take your time. Classmates make mistakes too.',
                )}
              </h3>
              <p>
                {t(
                  '短讲解后停下来，由孩子作答或动手。虚拟同学举手分享猜想，老师会解释常见错误，鼓励大家一起找办法。',
                  'Short explanations stop for a question or activity. Fictional classmates raise a hand, share ideas and sometimes make common mistakes; the teacher helps everyone check the reasoning.',
                )}
              </p>
              <ul>
                <li>
                  {t(
                    '3D 虚拟老师与教室，配合动态同学头像',
                    'A 3D teacher and classroom, with animated classmate portraits',
                  )}
                </li>
                <li>
                  {t(
                    '插画、彩色图形和可操作的小游戏',
                    'Illustrations, colourful diagrams and hands-on games',
                  )}
                </li>
                <li>
                  {t(
                    '随时暂停、重听，不用赶着跟上',
                    'Pause or replay, without pressure to keep up',
                  )}
                </li>
              </ul>
            </div>
          </div>
          <div className="lesson-gallery">
            <figure>
              <img
                src="/images/classmate-preview.webp"
                loading="lazy"
                alt={t(
                  '实验课中虚拟同学举手，分享需要检查的想法',
                  'A fictional classmate raises a hand to share an idea to check',
                )}
              />
              <figcaption>
                {t(
                  '同学举手，我们一起检查想法',
                  'A classmate has an idea. Let’s check it together.',
                )}
              </figcaption>
            </figure>
            <figure>
              <img
                src="/images/game-preview.webp"
                loading="lazy"
                alt={t(
                  '孩子通过点击小盒摆放圆片完成分组游戏',
                  'A child fills little boxes to explore equal groups',
                )}
              />
              <figcaption>
                {t(
                  '动手摆一摆，把“几个几”看明白',
                  'Make equal groups and see what multiplication means.',
                )}
              </figcaption>
            </figure>
          </div>
        </section>
        <section className="section getting-started" id="how">
          <span className="eyebrow">{t('第一次来？', 'FIRST VISIT?')}</span>
          <h2>{t('从一堂课开始，就这么简单。', 'Start with one lesson.')}</h2>
          <ol>
            {[
              [
                t('先看看', 'Take a look'),
                t(
                  '无需登录，先体验公开课堂预览。',
                  'Try the public classroom preview without signing in.',
                ),
              ],
              [
                t('选入口', 'Choose a space'),
                t(
                  '学学校内容选 School；问问题选 Tutor；自选主题选 Classroom。',
                  'School for a course, Tutor for a question, Classroom for your own topic.',
                ),
              ],
              [
                t('慢慢学', 'Learn at your pace'),
                t(
                  '登录后保留个人课程进度与答题记录，遇到困难再找家教。',
                  'Sign in to save your course progress and answers. Ask your tutor when you need help.',
                ),
              ],
            ].map(([title, copy], i) => (
              <li key={title}>
                <span>{i + 1}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </li>
            ))}
          </ol>
          <button className="button" onClick={() => go()}>
            {isAuthenticated
              ? t('回到我的学习空间', 'Return to my learning space')
              : t('创建账号，开始探索', 'Create an account and explore')}{' '}
            →
          </button>
        </section>
      </main>
      <footer>
        <Link className="brand" href="/">
          <CoastalMark className="size-6" />
          <b>CoastalTutor</b>
        </Link>
        <p>
          {t(
            '基础学习与好奇心，从这里开始。为孩子、家庭，也为自主学习者。',
            'A place for learning and curiosity. For children, families and independent learners.',
          )}
        </p>
        <nav>
          <a href="#learning">{t('三个学习空间', 'Learning spaces')}</a>
          <a href="/classroom-preview">{t('课堂预览', 'Classroom preview')}</a>
          <a href="/legal/prepared-course-notice.txt">
            {t('试课资源说明', 'Pilot resource notices')}
          </a>
        </nav>
        <small>© {new Date().getFullYear()} CoastalTutor</small>
      </footer>
    </div>
  );
}
