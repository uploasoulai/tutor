import { timingSafeEqual } from 'node:crypto';
import { NextRequest } from 'next/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import {
  assertPlatformAiWithinLimit,
  recordPlatformAiUsage,
} from '@/lib/server/platform-ai-usage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function authorized(request: NextRequest) {
  const expected = process.env.PLATFORM_AI_INTERNAL_TOKEN ?? '';
  const supplied = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? '';
  if (expected.length < 32 || supplied.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return apiError('INVALID_REQUEST', 401, 'Invalid internal service token');
  try {
    const body = (await request.json()) as {
      action?: string;
      userId?: string;
      requestId?: string;
      providerId?: string;
      modelId?: string;
      inputTokens?: number;
      outputTokens?: number;
      source?: string;
    };
    if (!body.userId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.userId)) {
      return apiError('INVALID_REQUEST', 400, 'A platform learner UUID is required');
    }
    if (body.action === 'check') return apiSuccess(await assertPlatformAiWithinLimit(body.userId));
    if (body.action !== 'record') return apiError('INVALID_REQUEST', 400, 'Unknown usage action');
    if (!body.requestId || !body.providerId || !body.modelId) {
      return apiError('MISSING_REQUIRED_FIELD', 400, 'Usage identifiers are required');
    }
    const inputTokens = Number(body.inputTokens);
    const outputTokens = Number(body.outputTokens);
    if (!Number.isSafeInteger(inputTokens) || inputTokens < 0 || !Number.isSafeInteger(outputTokens) || outputTokens < 0) {
      return apiError('INVALID_REQUEST', 400, 'Token counts must be non-negative integers');
    }
    const recorded = await recordPlatformAiUsage(body.userId, body.requestId, {
      providerId: body.providerId,
      modelId: body.modelId,
      source: String(body.source ?? 'deeptutor').slice(0, 80),
      inputTokens,
      outputTokens,
    });
    return apiSuccess({ recorded });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('platform_usage_limit_reached:')) {
      return apiError('PLATFORM_USAGE_LIMIT_REACHED', 402, error.message.replace(/^platform_usage_limit_reached:\s*/, ''));
    }
    return apiError('INTERNAL_ERROR', 500, error instanceof Error ? error.message : 'Usage request failed');
  }
}
