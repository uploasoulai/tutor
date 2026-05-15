import { describe, expect, it } from 'vitest';

import { getPhoneCountryDialCode, isLikelyE164Phone, normalizePhoneNumber } from '@/lib/auth/phone';

describe('getPhoneCountryDialCode', () => {
  it('keeps Canada and United States as separate country options with the shared +1 dial code', () => {
    expect(getPhoneCountryDialCode('CA')).toBe('+1');
    expect(getPhoneCountryDialCode('US')).toBe('+1');
  });

  it('resolves non-NANP country dial codes', () => {
    expect(getPhoneCountryDialCode('CN')).toBe('+86');
    expect(getPhoneCountryDialCode('GB')).toBe('+44');
  });
});

describe('normalizePhoneNumber', () => {
  it('adds the selected country dial code to local numbers', () => {
    expect(normalizePhoneNumber('CA', '(604) 555-0123')).toBe('+16045550123');
  });

  it('keeps an explicit international phone number', () => {
    expect(normalizePhoneNumber('CN', '+44 20 7946 0958')).toBe('+442079460958');
  });

  it('drops a local trunk prefix after the country code', () => {
    expect(normalizePhoneNumber('GB', '020 7946 0958')).toBe('+442079460958');
  });

  it('still accepts an explicit dial code for backward compatibility', () => {
    expect(normalizePhoneNumber('+1', '604 555 0123')).toBe('+16045550123');
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
