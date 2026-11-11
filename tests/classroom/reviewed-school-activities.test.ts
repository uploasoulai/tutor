import { describe, expect, it, vi } from 'vitest';
import {
  reviewedSchoolActivity,
  bindReviewedActivity,
} from '@/lib/curriculum/reviewed-school-activities';
import { buildPlaceValueActivity } from '@/lib/curriculum/place-value-activity';
import { generateSceneActions } from '@/lib/generation/scene-generator';
import type { SceneOutline } from '@/lib/types/generation';
const outline: SceneOutline = {
  id: 'activity',
  type: 'interactive',
  title: '拖动五把椅子',
  description: 'Different generated task',
  order: 2,
  keyPoints: ['Unrelated quantities'],
};
describe('reviewed School activity contracts', () => {
  it.each(['cnm_p038', 'cnm_p053', 'cnm_p055'])(
    'uses native teacher actions without another model call for %s',
    async (topic) => {
      const activity = reviewedSchoolActivity('china', 'pep:' + topic)!;
      const bound = bindReviewedActivity(outline, activity);
      expect(bound.id).toBe(outline.id);
      expect(bound.order).toBe(2);
      expect(bound.description).toBe(activity.description);
      expect(bound.title).not.toContain('椅子');
      const ai = vi.fn().mockRejectedValue(new Error('No model should be called'));
      const actions = await generateSceneActions(
        bound,
        {
          html: activity.html,
          widgetType: 'simulation',
          teacherActions: [{ id: activity.id, type: 'speech', content: activity.narration }],
        },
        ai,
      );
      expect(ai).not.toHaveBeenCalled();
      expect(actions).toEqual([
        expect.objectContaining({ type: 'speech', text: activity.narration }),
      ]);
    },
  );
  it.each(['cnm_p054', 'cnm_p053_extra', '__proto__', 'constructor'])(
    'does not replace another topic %s with a generic activity',
    (topic) => {
      expect(reviewedSchoolActivity('china', 'pep:' + topic)).toBeNull();
    },
  );
  it('does not infer a BC mapping or accept an unqualified topic', () => {
    expect(reviewedSchoolActivity('bc', 'pep:cnm_p053')).toBeNull();
    expect(reviewedSchoolActivity('china', 'cnm_p053')).toBeNull();
    expect(reviewedSchoolActivity(undefined, undefined)).toBeNull();
  });
  it.each([-1, 1000, 1.5, NaN])('rejects an invalid three-place target %s', (target) => {
    expect(() => buildPlaceValueActivity(target, 3)).toThrow('Invalid place-value example');
  });
});
