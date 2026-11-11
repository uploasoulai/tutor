import type { SceneOutline } from '@/lib/types/generation';
import { GROUPING_ACTIVITY_HTML } from './grouping-activity';
import { buildPlaceValueActivity } from './place-value-activity';

interface ReviewedActivity {
  id: string;
  title: string;
  description: string;
  objective: string;
  keyPoints: string[];
  narration: string;
  html: string;
}
const activities: Record<string, ReviewedActivity> = {
  cnm_p038: {
    id: 'equal-groups-v1',
    title: '每组两个，分成三组',
    description: '将六个圆片放入三个盒子，每组两个。先点圆片，再点盒子，不使用拖动。',
    objective: '用三组每组两个的直观模型解释几个相同加数的和。',
    keyPoints: [
      '六个圆片，三个盒子，每个盒子放两个',
      '三个二相加得到六',
      '先点圆片，再点盒子；重新分一分可以清空',
    ],
    narration:
      '我们来分一分。每个盒子放两个圆片。先点圆片，再点盒子；放好以后数一数，一共有几个二。',
    html: GROUPING_ACTIVITY_HTML,
  },
  cnm_p053: {
    id: 'place-value-243-v1',
    title: '用百、十、个搭出 243',
    description:
      '目标数为243，用加一个、减一个按钮调整百位、十位和个位的计数块。搭好后检查，每位最多九个；可清空重试。',
    objective: '将三位数的数字位置与百、十、个表示的数量对应起来。',
    keyPoints: [
      '目标数固定为243，百块表示100、十条表示10、个位方块表示1',
      '每位最多九个，零表示这一位没有计数块',
      '通过加一个、减一个调整，再检查或重新搭一搭',
    ],
    narration:
      '试着用百块、十条和个位方块搭出二百四十三。点加一个或减一个调整数量，再检查你的搭法。先想想，数字二在哪一位？',
    html: buildPlaceValueActivity(243, 3),
  },
  cnm_p055: {
    id: 'place-value-2046-v1',
    title: '用千、百、十、个搭出 2046',
    description:
      '目标数为2046，用加一个、减一个按钮调整千、百、十、个位的计数块，观察百位的零。搭好后检查，可清空重试。',
    objective: '用数位模型理解四位数的组成，特别是中间的零。',
    keyPoints: [
      '目标数固定为2046，千块表示1000，百块表示100，十条表示10，个位方块表示1',
      '百位的零需要保留位置，不放百块',
      '用加一个、减一个调整各位，再检查或重新搭一搭',
    ],
    narration:
      '我们来搭出二千零四十六。每个千块表示一千，百块表示一百，十条表示十。想一想，零在哪一位？那个位置需要放计数块吗？你可以用加一个和减一个慢慢试。',
    html: buildPlaceValueActivity(2046, 4),
  },
};
export function reviewedSchoolActivity(track?: string, canonicalId?: string) {
  if (track !== 'china' || !canonicalId?.includes(':')) return null;
  const topic = canonicalId.split(':').at(-1)!;
  return Object.hasOwn(activities, topic) ? activities[topic] : null;
}
export function bindReviewedActivity(
  outline: SceneOutline,
  activity: ReviewedActivity,
): SceneOutline {
  return {
    ...outline,
    title: activity.title,
    description: activity.description,
    teachingObjective: activity.objective,
    keyPoints: [...activity.keyPoints],
    widgetType: 'simulation',
    widgetOutline: { concept: activity.description },
  };
}
