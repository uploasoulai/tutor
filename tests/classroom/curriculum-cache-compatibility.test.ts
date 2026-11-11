import { describe, expect, it } from 'vitest';
import { describeCurriculumLesson } from '@/lib/server/curriculum-lesson-cache';
describe('reviewed-activity cache compatibility', () => {
  it('keeps an unrelated topic’s existing revision-3 key instead of regenerating it', () => {
    const descriptor = describeCurriculumLesson({
      track: 'china',
      canonicalId: 'pep:cnm_p054',
      requirement: 'confirmed requirements',
    });
    // Captured before reviewed activity identities were added to cache keys.
    expect(descriptor.cacheKey).toBe(
      'acd7e4b720a61b28cbb2cdb5a2ab6ba083d0fbd49ee3f94f1cd39bbd7ede4b88',
    );
  });
  it('gives the reviewed topic a new reusable artifact while retaining its curriculum source identity', () => {
    const input = {
      track: 'china' as const,
      canonicalId: 'pep:cnm_p053',
      requirement: 'confirmed requirements',
    };
    const descriptor = describeCurriculumLesson(input);
    expect(descriptor.cacheKey).not.toBe(
      '0cd9b34e3f39fae0088513de2fb71a9c960c68eceedde5438812c08b5221592e',
    );
    expect(describeCurriculumLesson(input)).toEqual(descriptor);
    expect(descriptor.canonicalId).toBe(input.canonicalId);
  });
});
