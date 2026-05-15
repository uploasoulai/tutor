import { describe, expect, it, vi } from 'vitest';
import {
  isAuthorizedParentReportCronRequest,
  parseDailyReportDate,
} from '@/lib/reports/parent-daily-report';

describe('parent daily report cron helpers', () => {
  it('requires the dedicated parent report cron secret', () => {
    vi.stubEnv('PARENT_REPORT_CRON_SECRET', 'report-secret');
    vi.stubEnv('KEEPALIVE_SECRET', 'keepalive-secret');

    expect(isAuthorizedParentReportCronRequest('Bearer report-secret')).toBe(true);
    expect(isAuthorizedParentReportCronRequest('Bearer keepalive-secret')).toBe(false);
    expect(isAuthorizedParentReportCronRequest(null)).toBe(false);
  });

  it('parses date-only inputs at midday to avoid timezone rollover', () => {
    const date = parseDailyReportDate('2026-05-14');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(4);
    expect(date.getDate()).toBe(14);
    expect(date.getHours()).toBe(12);
  });
});
