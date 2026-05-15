import { describe, expect, it } from 'vitest';
import { isSupportedTutorAlertAction } from '@/lib/reports/tutor-alerts';

describe('teacher tutor alert API contract', () => {
  it('accepts resolve and the default action', () => {
    expect(isSupportedTutorAlertAction('resolve')).toBe(true);
    expect(isSupportedTutorAlertAction()).toBe(true);
  });

  it('rejects unsupported alert actions', () => {
    expect(isSupportedTutorAlertAction('delete')).toBe(false);
    expect(isSupportedTutorAlertAction('assign')).toBe(false);
  });
});
