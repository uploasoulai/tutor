import { describe, expect, it } from 'vitest';

import { validateNewPassword } from '@/lib/auth/password';

describe('validateNewPassword', () => {
  it('requires both password fields', () => {
    expect(validateNewPassword('', '')).toBe('Please fill in both password fields.');
  });

  it('requires at least 8 characters', () => {
    expect(validateNewPassword('short', 'short')).toBe(
      'Password must be at least 8 characters long.',
    );
  });

  it('requires matching passwords', () => {
    expect(validateNewPassword('long-enough', 'different')).toBe('Passwords do not match.');
  });

  it('accepts a valid password pair', () => {
    expect(validateNewPassword('long-enough', 'long-enough')).toBe('');
  });
});
