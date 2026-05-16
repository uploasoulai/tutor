export type LessonEngineMediaFlags = {
  enableImageGeneration: boolean;
  enableVideoGeneration: boolean;
  enableTTS: boolean;
};

function readBooleanEnv(name: string) {
  const value = process.env[name]?.trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

function readAllowlist() {
  return (process.env.LESSON_ENGINE_MEDIA_ALLOWLIST ?? '')
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

function isAllowedTester(userId?: string | null, email?: string | null) {
  const allowlist = readAllowlist();
  if (allowlist.length === 0) return true;

  const candidates = [userId, email].filter(Boolean).map((entry) => String(entry).toLowerCase());
  return candidates.some((candidate) => allowlist.includes(candidate));
}

export function resolveLessonEngineMediaFlags({
  userId,
  email,
}: {
  userId?: string | null;
  email?: string | null;
}): LessonEngineMediaFlags {
  if (!isAllowedTester(userId, email)) {
    return {
      enableImageGeneration: false,
      enableVideoGeneration: false,
      enableTTS: false,
    };
  }

  return {
    enableImageGeneration: readBooleanEnv('LESSON_ENGINE_ENABLE_IMAGE_GENERATION'),
    enableVideoGeneration: readBooleanEnv('LESSON_ENGINE_ENABLE_VIDEO_GENERATION'),
    enableTTS: readBooleanEnv('LESSON_ENGINE_ENABLE_TTS'),
  };
}
