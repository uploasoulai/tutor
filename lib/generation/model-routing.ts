export function isCoastalTutorGenerationSession(sessionId?: string | null) {
  return !!sessionId?.startsWith('coastaltutor-');
}

export function shouldUseServerFreeModelFallback({
  sessionId,
  clientApiKey,
  allowServerFallback = true,
}: {
  sessionId?: string | null;
  clientApiKey?: string | null;
  allowServerFallback?: boolean;
}) {
  return isCoastalTutorGenerationSession(sessionId) && allowServerFallback && !clientApiKey;
}
