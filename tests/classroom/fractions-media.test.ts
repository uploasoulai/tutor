import { describe, expect, it } from 'vitest';
import media from '@/lib/curriculum/fractions-media.json';
import story from '@/lib/curriculum/fractions-storyboard.json';
import { HYBRID_PHASES } from '@/lib/curriculum/hybrid-fractions';

describe('reviewed fraction chapter timeline', () => {
  it('covers the whole native composition once, with no gap or overlap', () => {
    expect(media.chapters.map((c) => c.id)).toEqual(['explain', 'reason', 'recap']);
    expect(media.chapters[0].start).toBe(0);
    media.chapters.forEach((c, i) => {
      expect(c.end).toBeGreaterThan(c.start);
      if (i) expect(c.start).toBe(media.chapters[i - 1].end + 1);
    });
    expect(media.chapters.at(-1)!.end).toBe(media.durationInFrames - 1);
  });
  it('keeps each recorded utterance within its matching picture and chapter', () => {
    expect(media.shots.map((s) => s.id)).toEqual(
      story.chapters.flatMap((c) => c.shots.map((s) => s.id)),
    );
    media.shots.forEach((shot) => {
      expect(shot.audioStart).toBe(shot.start + 10);
      expect(shot.audioEnd).toBeLessThan(shot.end);
      const chapter = media.chapters.find((c) => shot.start >= c.start && shot.end <= c.end);
      expect(chapter).toBeDefined();
      const source = story.chapters
        .find((c) => c.id === chapter!.id)!
        .shots.find((s) => s.id === shot.id)!;
      expect(source.shaded).toBe(shot.shaded);
    });
  });
  it('preserves existing checkpoints while adding question, reasoning and recap in order', () => {
    expect(HYBRID_PHASES).toEqual([
      'question',
      'video',
      'practice',
      'reasoning',
      'check',
      'recap',
      'completed',
    ]);
  });
});
