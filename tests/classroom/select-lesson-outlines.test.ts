import { describe, expect, it } from 'vitest';
import { selectCurriculumOutlines } from '@/lib/curriculum/select-lesson-outlines';
const outline = (id: string, type: string, order: number) => ({ id, type, order });
describe('bounded curriculum lesson selection', () => {
  it('retains manipulation and an exit quiz from an overlong draft', () => {
    const result = selectCurriculumOutlines(
      [
        outline('explain', 'slide', 0),
        outline('extra', 'slide', 1),
        outline('practice', 'interactive', 2),
        outline('more', 'slide', 3),
        outline('check', 'quiz', 4),
      ],
      3,
    );
    expect(result.map((item) => item.id)).toEqual(['explain', 'practice', 'check']);
    expect(result.map((item) => item.order)).toEqual([0, 1, 2]);
  });
  it('keeps a correctly sized lesson intact', () => {
    const input = [
      outline('explain', 'slide', 0),
      outline('practice', 'interactive', 1),
      outline('check', 'quiz', 2),
    ];
    expect(selectCurriculumOutlines(input, 3)).toEqual(input);
  });
  it('places the final check after an interaction written later in the draft', () => {
    const result = selectCurriculumOutlines(
      [
        outline('explain', 'slide', 0),
        outline('check', 'quiz', 1),
        outline('extra', 'slide', 2),
        outline('practice', 'interactive', 3),
      ],
      3,
    );
    expect(result.map((item) => item.id)).toEqual(['explain', 'practice', 'check']);
  });
  it('supports a draft without a quiz without inventing content', () => {
    const result = selectCurriculumOutlines(
      [
        outline('intro', 'slide', 0),
        outline('more', 'slide', 1),
        outline('practice', 'interactive', 2),
        outline('end', 'slide', 3),
      ],
      3,
    );
    expect(result.map((item) => item.id)).toEqual(['intro', 'more', 'practice']);
  });
});
