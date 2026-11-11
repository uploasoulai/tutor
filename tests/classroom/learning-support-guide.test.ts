import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
const state = vi.hoisted(() => ({ locale: 'en-US' }));
vi.mock('@/lib/hooks/use-i18n', () => ({ useI18n: () => state }));
import { LearningSupportGuide } from '@/components/learning-support-guide';
describe('learning discovery guide', () => {
  beforeEach(() => {
    state.locale = 'en-US';
  });
  it('uses the existing learner-bound launch modes rather than a second account or raw tutor URL', () => {
    const html = renderToStaticMarkup(createElement(LearningSupportGuide));
    for (const mode of ['personal', 'practice', 'mastery', 'profile', 'progress'])
      expect(html).toContain(`/api/learning/launch?mode=${mode}`);
    expect(html).not.toContain('trycloudflare');
    expect(html).toContain(
      'School records and tutor learning activity are currently viewed separately',
    );
  });
  it('does not send a parent to a student-only or another child’s tutor mode', () => {
    const html = renderToStaticMarkup(createElement(LearningSupportGuide, { audience: 'parent' }));
    const modes = [...html.matchAll(/\/api\/learning\/launch\?mode=([a-z]+)/g)].map(
      (match) => match[1],
    );
    expect(modes).toHaveLength(6);
    expect(new Set(modes)).toEqual(new Set(['personal']));
    expect(html).toContain('your own tutor');
  });
  it('explains the mistake handoff and record boundaries in Chinese without promising automatic question saving', () => {
    state.locale = 'zh-CN';
    const html = renderToStaticMarkup(createElement(LearningSupportGuide));
    expect(html).toContain('确认后再开始对话');
    expect(html).toContain('目前分别查看');
    expect(html).not.toContain('DeepTutor');
  });
});
