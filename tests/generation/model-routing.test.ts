import { describe, expect, it } from 'vitest';
import {
  isCoastalTutorGenerationSession,
  shouldUseServerFreeModelFallback,
} from '@/lib/generation/model-routing';

describe('CoastalTutor generation model routing', () => {
  it('recognizes CoastalTutor lesson generation sessions', () => {
    expect(isCoastalTutorGenerationSession('coastaltutor-session-1')).toBe(true);
    expect(isCoastalTutorGenerationSession('manual-session-1')).toBe(false);
  });

  it('uses server free fallback only when the user has no client key', () => {
    expect(
      shouldUseServerFreeModelFallback({
        sessionId: 'coastaltutor-session-1',
        clientApiKey: '',
      }),
    ).toBe(true);
    expect(
      shouldUseServerFreeModelFallback({
        sessionId: 'coastaltutor-session-1',
        clientApiKey: 'user-key',
      }),
    ).toBe(false);
  });

  it('can disable server fallback for production policy', () => {
    expect(
      shouldUseServerFreeModelFallback({
        sessionId: 'coastaltutor-session-1',
        clientApiKey: '',
        allowServerFallback: false,
      }),
    ).toBe(false);
  });
});
