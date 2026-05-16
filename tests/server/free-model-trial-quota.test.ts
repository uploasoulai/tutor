import { afterEach, describe, expect, it } from 'vitest';
import { canUseCoastalTutorFreeModelTrial } from '@/lib/server/free-model-trial-quota';

describe('CoastalTutor free model trial quota', () => {
  afterEach(() => {
    delete process.env.COASTALTUTOR_FREE_MODEL_TRIAL_LIMIT;
    delete process.env.COASTALTUTOR_FREE_MODEL_TRIALS_ENABLED;
  });

  it('allows a CoastalTutor generation session when a trial client id is present', () => {
    expect(
      canUseCoastalTutorFreeModelTrial({
        sessionId: 'coastaltutor-session-1',
        trialClientId: 'client-a',
      }),
    ).toBe(true);
  });

  it('does not allow non-CoastalTutor sessions', () => {
    expect(
      canUseCoastalTutorFreeModelTrial({
        sessionId: 'manual-session-1',
        trialClientId: 'client-b',
      }),
    ).toBe(false);
  });

  it('limits unique course generation sessions per trial client', () => {
    process.env.COASTALTUTOR_FREE_MODEL_TRIAL_LIMIT = '1';

    expect(
      canUseCoastalTutorFreeModelTrial({
        sessionId: 'coastaltutor-session-2',
        trialClientId: 'client-c',
      }),
    ).toBe(true);
    expect(
      canUseCoastalTutorFreeModelTrial({
        sessionId: 'coastaltutor-session-2',
        trialClientId: 'client-c',
      }),
    ).toBe(true);
    expect(
      canUseCoastalTutorFreeModelTrial({
        sessionId: 'coastaltutor-session-3',
        trialClientId: 'client-c',
      }),
    ).toBe(false);
  });

  it('can be disabled from the server environment', () => {
    process.env.COASTALTUTOR_FREE_MODEL_TRIALS_ENABLED = 'false';

    expect(
      canUseCoastalTutorFreeModelTrial({
        sessionId: 'coastaltutor-session-4',
        trialClientId: 'client-d',
      }),
    ).toBe(false);
  });
});
