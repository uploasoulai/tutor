import type { ParentDailyReportBatchResult } from '@/lib/reports/parent-daily-report';

export interface ParentReportRunView {
  ok: boolean;
  checkedAt: string;
  date: string;
  generated: number;
  skipped: number;
  failed: number;
  message: string;
}

export function buildParentReportRunView(
  result: ParentDailyReportBatchResult,
): ParentReportRunView {
  return {
    ok: result.ok,
    checkedAt: result.checkedAt,
    date: result.date,
    generated: result.generated,
    skipped: result.skipped,
    failed: result.failed,
    message: `Generated ${result.generated} parent reports for ${result.date}.`,
  };
}
