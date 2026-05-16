import { describe, expect, it } from 'vitest';
import { buildFallbackSceneOutlines } from '@/lib/generation/outline-generator';

describe('CoastalTutor outline fallback', () => {
  it('builds a Grade 2 friendly three-scene outline from CoastalTutor requirements', () => {
    const outlines = buildFallbackSceneOutlines({
      requirement: `Create a Grade 2-first CoastalTutor interactive classroom lesson.

Audience:
- Grade: Grade 2
- Subject: Math
- Knowledge point: number concepts to 100`,
    });

    expect(outlines).toHaveLength(4);
    expect(outlines[0].title).toBe('number concepts to 100');
    expect(outlines.map((outline) => outline.order)).toEqual([1, 2, 3, 4]);
    expect(outlines[1]).toMatchObject({
      type: 'interactive',
      widgetType: 'game',
    });
    expect(outlines[1].keyPoints.join(' ')).toContain('Misconception repair');
    expect(outlines[3].type).toBe('quiz');
    expect(outlines[3].quizConfig?.questionCount).toBe(3);
  });
});
