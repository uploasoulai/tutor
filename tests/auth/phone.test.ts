import { describe, expect, it } from 'vitest';

import { isLikelyE164Phone, normalizePhoneNumber } from '@/lib/auth/phone';

describe('normalizePhoneNumber', () => {
  it('adds the selected country dial code to local numbers', () => {
    expect(normalizePhoneNumber('+1', '(604) 555-0123')).toBe('+16045550123');
  });

  it('keeps an explicit international phone number', () => {
    expect(normalizePhoneNumber('+86', '+44 20 7946 0958')).toBe('+442079460958');
  });

  it('drops a local trunk prefix after the country code', () => {
    expect(normalizePhoneNumber('+44', '020 7946 0958')).toBe('+442079460958');
  });
});

describe('isLikelyE164Phone', () => {
  it('accepts a plausible E.164 phone number', () => {
    expect(isLikelyE164Phone('+16045550123')).toBe(true);
  });

  it('rejects numbers without a country code', () => {
    expect(isLikelyE164Phone('6045550123')).toBe(false);
  });
});
