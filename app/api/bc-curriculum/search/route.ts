import { NextRequest } from 'next/server';
import { DEFAULT_GRADE_LEVEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import { searchBCCurriculum } from '@/lib/curriculum/search';
import { apiError, apiSuccess } from '@/lib/server/api-response';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      query?: string;
      grade?: string | number;
      subject?: string;
      matchCount?: number;
    };

    if (!body.query?.trim()) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'query is required');
    }

    const result = await searchBCCurriculum({
      query: body.query,
      grade: body.grade ?? DEFAULT_GRADE_LEVEL,
      subject: body.subject ?? DEFAULT_SUBJECT,
      matchCount: Math.min(Math.max(body.matchCount ?? 5, 1), 10),
    });

    return apiSuccess(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'BC curriculum search failed';
    if (message.includes('VOYAGE_API_KEY')) {
      return apiError('MISSING_API_KEY', 400, message);
    }

    return apiError('INTERNAL_ERROR', 500, message);
  }
}
