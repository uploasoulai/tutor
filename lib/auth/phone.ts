export const PHONE_COUNTRIES = [
  { code: 'CA', label: 'Canada', dialCode: '+1' },
  { code: 'US', label: 'United States', dialCode: '+1' },
  { code: 'CN', label: 'China', dialCode: '+86' },
  { code: 'HK', label: 'Hong Kong', dialCode: '+852' },
  { code: 'TW', label: 'Taiwan', dialCode: '+886' },
  { code: 'GB', label: 'United Kingdom', dialCode: '+44' },
  { code: 'AU', label: 'Australia', dialCode: '+61' },
  { code: 'NZ', label: 'New Zealand', dialCode: '+64' },
  { code: 'JP', label: 'Japan', dialCode: '+81' },
  { code: 'KR', label: 'South Korea', dialCode: '+82' },
  { code: 'SG', label: 'Singapore', dialCode: '+65' },
  { code: 'IN', label: 'India', dialCode: '+91' },
  { code: 'FR', label: 'France', dialCode: '+33' },
  { code: 'DE', label: 'Germany', dialCode: '+49' },
  { code: 'BR', label: 'Brazil', dialCode: '+55' },
] as const;

export function normalizePhoneNumber(countryDialCode: string, rawPhone: string) {
  const trimmedPhone = rawPhone.trim();
  if (!trimmedPhone) return '';
  if (trimmedPhone.startsWith('+')) {
    return `+${trimmedPhone.slice(1).replace(/\D/g, '')}`;
  }

  const dialCode = countryDialCode.startsWith('+') ? countryDialCode : `+${countryDialCode}`;
  const digits = trimmedPhone.replace(/\D/g, '').replace(/^0+/, '');
  return digits ? `${dialCode}${digits}` : '';
}

export function isLikelyE164Phone(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value);
}
