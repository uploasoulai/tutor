import { afterEach, describe, expect, it } from 'vitest';
import { resolveLessonEngineMediaFlags } from '@/lib/server/lesson-engine-media-flags';

const ENV_KEYS = [
  'LESSON_ENGINE_ENABLE_IMAGE_GENERATION',
  'LESSON_ENGINE_ENABLE_VIDEO_GENERATION',
  'LESSON_ENGINE_ENABLE_TTS',
  'LESSON_ENGINE_MEDIA_ALLOWLIST',
] as const;

describe('lesson engine media flags', () => {
  afterEach(() => {
    for (const key of ENV_KEYS) {
      delete process.env[key];
    }
  });

  it('keeps paid media features disabled by default', () => {
    expect(
      resolveLessonEngineMediaFlags({ userId: 'student-1', email: 'kid@example.com' }),
    ).toEqual({
      enableImageGeneration: false,
      enableVideoGeneration: false,
      enableTTS: false,
    });
  });

  it('enables selected media features through server-side environment flags', () => {
    process.env.LESSON_ENGINE_ENABLE_IMAGE_GENERATION = 'true';
    process.env.LESSON_ENGINE_ENABLE_TTS = '1';

    expect(
      resolveLessonEngineMediaFlags({ userId: 'student-1', email: 'kid@example.com' }),
    ).toEqual({
      enableImageGeneration: true,
      enableVideoGeneration: false,
      enableTTS: true,
    });
  });

  it('limits media features to an allowlisted tester when configured', () => {
    process.env.LESSON_ENGINE_ENABLE_IMAGE_GENERATION = 'true';
    process.env.LESSON_ENGINE_ENABLE_VIDEO_GENERATION = 'true';
    process.env.LESSON_ENGINE_ENABLE_TTS = 'true';
    process.env.LESSON_ENGINE_MEDIA_ALLOWLIST = 'pilot@example.com, student-2';

    expect(
      resolveLessonEngineMediaFlags({ userId: 'student-1', email: 'kid@example.com' }),
    ).toEqual({
      enableImageGeneration: false,
      enableVideoGeneration: false,
      enableTTS: false,
    });
    expect(
      resolveLessonEngineMediaFlags({ userId: 'student-2', email: 'kid@example.com' }),
    ).toEqual({
      enableImageGeneration: true,
      enableVideoGeneration: true,
      enableTTS: true,
    });
    expect(
      resolveLessonEngineMediaFlags({ userId: 'student-3', email: 'pilot@example.com' }),
    ).toEqual({
      enableImageGeneration: true,
      enableVideoGeneration: true,
      enableTTS: true,
    });
  });
});
