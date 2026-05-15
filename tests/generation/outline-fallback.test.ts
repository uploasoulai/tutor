import { describe, expect, it } from 'vitest';
import { buildFallbackSceneOutlines } from '@/lib/generation/outline-generator';

describe('CoastalTutor outline fallback', () => {
  it('builds a Grade 2 friendly three-scene outline from OpenMAIC requirements', () => {
    const outlines = buildFallbackSceneOutlines({
      requirement: `Create a Grade 2-first OpenMAIC interactive classroom lesson.

Audience:
- Grade: Grade 2
- Subject: Math
- Knowledge point: number concepts to 100`,
    });

    expect(outlines).toHaveLength(3);
    expect(outlines[0].title).toBe('number concepts to 100');
    expect(outlines.map((outline) => outline.order)).toEqual([1, 2, 3]);
    expect(outlines[2].type).toBe('quiz');
    expect(outlines[2].quizConfig?.questionCount).toBe(3);
  });
});
