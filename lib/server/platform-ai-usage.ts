import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import type { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getLearnerCredential } from '@/lib/server/byok-vault';
import {
  getPlatformAiConfig,
  getPlatformAiRates,
  isPlatformAiUsageEnforcementEnabled,
} from '@/lib/server/platform-ai-config';
import { apiError } from '@/lib/server/api-response';
import type { NextResponse } from 'next/server';

type PlatformAiUsageContext = { userId: string; requestId: string; callIndex: number };
const usageContext = new AsyncLocalStorage<PlatformAiUsageContext>();

function createPlatformUsageAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase server secret is required for Platform AI usage');
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function runWithPlatformAiUsage<T>(
  context: { userId: string; requestId: string },
  callback: () => T,
) {
  return usageContext.run({ ...context, callIndex: 0 }, callback);
}

export function getPlatformAiUsageContext() {
  const context = usageContext.getStore();
  if (!context) return null;
  context.callIndex += 1;
  return { userId: context.userId, requestId: `${context.requestId}:${context.callIndex}` };
}

export function getCurrentPlatformAiUserId() {
  return usageContext.getStore()?.userId ?? null;
}

export async function withPlatformAiRequest<T>(request: NextRequest, callback: () => Promise<T>) {
  if (request.headers.get('x-api-key') || request.headers.get('x-base-url')) {
    return callback();
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Authentication required for Platform AI');
  const savedCredential = await getLearnerCredential(user.id);
  const verifiedProviders = (process.env.BYOK_VERIFIED_PROVIDERS || '')
    .split(',')
    .map((v) => v.trim());
  if (savedCredential && verifiedProviders.includes(savedCredential.providerId)) {
    return callback();
  }
  await assertPlatformAiWithinLimit(user.id);
  return runWithPlatformAiUsage({ userId: user.id, requestId: randomUUID() }, callback);
}

export function platformAiErrorResponse(error: unknown): NextResponse | null {
  if (!(error instanceof Error)) return null;
  if (error.message.startsWith('platform_usage_limit_reached:')) {
    return apiError(
      'PLATFORM_USAGE_LIMIT_REACHED',
      402,
      error.message.replace(/^platform_usage_limit_reached:\s*/, ''),
    );
  }
  if (error.message.startsWith('PLATFORM_AI_NOT_CONFIGURED:')) {
    return apiError(
      'PLATFORM_AI_NOT_CONFIGURED',
      503,
      error.message.replace(/^PLATFORM_AI_NOT_CONFIGURED:\s*/, ''),
    );
  }
  if (error.message === 'Authentication required for Platform AI') {
    return apiError('INVALID_REQUEST', 401, 'Authentication required');
  }
  return null;
}

export type PlatformAiUsage = {
  inputTokens: number;
  outputTokens: number;
  providerId: string;
  modelId: string;
  source: string;
};

export function getPlatformAiMonthlyLimitUsd() {
  return getConfiguredRate('PLATFORM_AI_MONTHLY_LIMIT_USD');
}

function getConfiguredRate(name: string) {
  const value = process.env[name];
  const configured = value === undefined ? Number.NaN : Number(value);
  if (!Number.isFinite(configured) || configured < 0) {
    throw new Error(`${name} must be configured as a non-negative number on the server`);
  }
  return configured;
}

function monthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getPlatformAiMonthlyUsage(userId: string) {
  const admin = createPlatformUsageAdminClient();
  const { data, error } = await admin.rpc('platform_ai_monthly_usage', {
    p_user_id: userId,
    p_month_start: monthStartIso(),
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    costUsd: Number(row?.cost_usd ?? 0),
    inputTokens: Number(row?.input_tokens ?? 0),
    outputTokens: Number(row?.output_tokens ?? 0),
  };
}

export async function assertPlatformAiWithinLimit(userId: string) {
  const platformAi = getPlatformAiConfig();
  if (!platformAi.apiKey) {
    throw new Error(
      `PLATFORM_AI_NOT_CONFIGURED: 管理员需要先在服务器环境配置 ${platformAi.keyEnvName}。`,
    );
  }
  if (!isPlatformAiUsageEnforcementEnabled()) {
    return { costUsd: 0, inputTokens: 0, outputTokens: 0, limitUsd: getOptionalMonthlyLimit() };
  }
  const limitUsd = getPlatformAiMonthlyLimitUsd();
  try {
    getPlatformAiRates();
  } catch (error) {
    throw new Error(
      `PLATFORM_AI_NOT_CONFIGURED: ${error instanceof Error ? error.message : '平台模型价格未配置。'}`,
    );
  }
  const usage = await getPlatformAiMonthlyUsage(userId);
  if (usage.costUsd >= limitUsd) {
    const nextMonth = new Date();
    nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1, 1);
    nextMonth.setUTCHours(0, 0, 0, 0);
    const date = new Intl.DateTimeFormat('zh-CN', {
      timeZone: 'UTC',
      month: 'numeric',
      day: 'numeric',
    }).format(nextMonth);
    const error = new Error(
      `platform_usage_limit_reached: 本月平台 AI 使用额度已用完，将于 ${date} 恢复。`,
    );
    Object.assign(error, { code: 'platform_usage_limit_reached', status: 402 });
    throw error;
  }
  return { ...usage, limitUsd };
}

export async function recordPlatformAiUsage(
  userId: string,
  requestId: string,
  usage: PlatformAiUsage,
) {
  const config = getPlatformAiConfig();
  if (usage.providerId !== config.providerId) return false;
  let inputRate: number;
  let outputRate: number;
  try {
    ({ inputRate, outputRate } = getPlatformAiRates());
  } catch (error) {
    if (!isPlatformAiUsageEnforcementEnabled()) return false;
    throw error;
  }
  const costUsd = (usage.inputTokens * inputRate + usage.outputTokens * outputRate) / 1_000_000;
  const admin = createPlatformUsageAdminClient();
  const { error } = await admin.from('platform_ai_usage').insert({
    user_id: userId,
    request_id: requestId,
    source: usage.source,
    provider_id: usage.providerId,
    model_id: usage.modelId,
    input_tokens: usage.inputTokens,
    output_tokens: usage.outputTokens,
    cost_usd: costUsd,
  });
  if (error && error.code !== '23505') throw error;
  return true;
}

function getOptionalMonthlyLimit() {
  const value = Number(process.env.PLATFORM_AI_MONTHLY_LIMIT_USD);
  return Number.isFinite(value) && value >= 0 ? value : null;
}
