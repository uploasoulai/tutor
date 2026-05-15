import { NextRequest } from 'next/server';
import {
  generateDailyReportsForAllParents,
  isAuthorizedParentReportCronRequest,
  parseDailyReportDate,
} from '@/lib/reports/parent-daily-report';
import { apiError, apiSuccess } from '@/lib/server/api-response';

export async function GET(req: NextRequest) {
  if (!isAuthorizedParentReportCronRequest(req.headers.get('authorization'))) {
    return apiError('INVALID_REQUEST', 401, 'Unauthorized');
  }

  try {
    const date = parseDailyReportDate(req.nextUrl.searchParams.get('date'));
    const result = await generateDailyReportsForAllParents({ date });
    return apiSuccess({ ...result });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Failed to generate parent daily reports',
    );
  }
}
