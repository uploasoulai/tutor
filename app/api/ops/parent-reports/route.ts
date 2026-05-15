import {
  generateDailyReportsForAllParents,
  parseDailyReportDate,
} from '@/lib/reports/parent-daily-report';
import { buildParentReportRunView } from '@/lib/ops/parent-report-run-status';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';
import { AdminAuthError, assertAdminUser } from '@/lib/admin/auth';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await assertAdminUser(user);

    const body = (await req.json().catch(() => ({}))) as { date?: string };
    const result = await generateDailyReportsForAllParents({
      date: parseDailyReportDate(body.date ?? null),
    });

    return apiSuccess({ result: buildParentReportRunView(result) });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return apiError('INVALID_REQUEST', error.status, error.message);
    }

    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to generate parent daily reports',
    );
  }
}
