import { describe, expect, it } from 'vitest';

import {
  buildLessonBlueprint,
  evaluateLessonQuality,
  getInstructionalDesignRules,
} from '@/lib/curriculum/lesson-blueprint';

describe('early-elementary lesson blueprint', () => {
  it('uses concrete Grade 1-4 instructional rules for math', () => {
    const rules = getInstructionalDesignRules({ grade: 'Grade 2', subject: 'Math' });

    expect(rules.gradeBand).toBe('early-elementary');
    expect(rules.concreteRepresentations).toContain('ten-frame');
    expect(rules.requiredMoves).toContain(
      'Model one worked example before asking the learner to answer independently.',
    );
    expect(rules.interactionPattern).toContain('Tap');
  });

  it('builds a blueprint with story, misconception repair, and mini-game scenes', () => {
    const blueprint = buildLessonBlueprint({
      grade: 'Grade 2',
      subject: 'Math',
      title: 'Number concepts to 100',
      outcomeCode: 'MATH-2-01-number-concepts-to-100',
      matches: [
        {
          id: 'outcome-1',
          subject_id: 'subject-1',
          outcome_code: 'MATH-2-01-number-concepts-to-100',
          big_idea: null,
          content_knowledge: 'Number concepts to 100',
          elaboration: 'Use counting, benchmarks, and concrete materials.',
          chunk_text: 'Number concepts plus elaboration',
          grade_level: 2,
          subject_area: 'Math',
          similarity: 0.9,
        },
      ],
    });

    expect(blueprint.childFriendlyObjective).toContain('I can show');
    expect(blueprint.realWorldStory).toContain('beach stones');
    expect(blueprint.concreteRepresentations).toContain('number line');
    expect(blueprint.commonMisconceptions.length).toBeGreaterThanOrEqual(2);
    expect(blueprint.scenes.map((scene) => scene.phase)).toContain('mini-game-check');
    expect(blueprint.scenes.every((scene) => scene.repairMove.length > 0)).toBe(true);
  });

  it('scores a complete low-grade blueprint as ready for generation', () => {
    const blueprint = buildLessonBlueprint({
      grade: 'Grade 2',
      subject: 'Math',
      title: 'Addition and subtraction to 100',
      matches: [],
    });

    const quality = evaluateLessonQuality(blueprint);

    expect(quality.score).toBeGreaterThanOrEqual(85);
    expect(quality.passed).toBe(true);
    expect(quality.revisionNotes).toEqual([]);
  });
});
