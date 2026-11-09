import { NextRequest } from 'next/server';
import { generateText } from 'ai';
import { createClient } from '@/lib/supabase/server';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import {
  deleteLearnerCredential,
  getLearnerCredentialStatus,
  markLearnerCredentialVerified,
  saveLearnerCredential,
} from '@/lib/server/byok-vault';
import { resolveModel } from '@/lib/server/resolve-model';

// A provider is exposed only after the pinned CoastalTutor/OpenMAIC and DeepTutor
// integration checks have been recorded in PROVIDER_COMPATIBILITY_MATRIX.md.
function verifiedProviders() {
  return (process.env.BYOK_VERIFIED_PROVIDERS || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

async function authenticatedUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await authenticatedUser();
  if (!user) return apiError('INVALID_REQUEST', 401, '请先登录');
  try {
    return apiSuccess({
      credential: await getLearnerCredentialStatus(user.id),
      providers: verifiedProviders(),
    });
  } catch {
    return apiError('INTERNAL_ERROR', 503, 'AI 凭证服务暂不可用');
  }
}

export async function POST(request: NextRequest) {
  const user = await authenticatedUser();
  if (!user) return apiError('INVALID_REQUEST', 401, '请先登录');
  try {
    const body = (await request.json()) as { providerId?: unknown; apiKey?: unknown };
    const providerId = typeof body.providerId === 'string' ? body.providerId.trim() : '';
    const apiKey = typeof body.apiKey === 'string' ? body.apiKey.trim() : '';
    if (!providerId || !apiKey || apiKey.length > 4096)
      return apiError('INVALID_REQUEST', 400, 'Provider 和有效的 API Key 为必填项');
    if (!verifiedProviders().includes(providerId))
      return apiError('INVALID_REQUEST', 409, '该 Provider 尚未完成双系统兼容验证，暂不能使用');
    let defaults: Record<string, string>;
    try {
      defaults = JSON.parse(process.env.BYOK_DEFAULT_MODELS_JSON || '{}') as Record<string, string>;
    } catch {
      return apiError('INTERNAL_ERROR', 503, '平台 Provider 配置暂不可用');
    }
    const modelId = defaults[providerId];
    if (!modelId) return apiError('INTERNAL_ERROR', 503, '平台尚未配置该 Provider 的默认模型');
    try {
      const { model } = await resolveModel({ modelString: `${providerId}:${modelId}`, apiKey });
      await generateText({ model, prompt: 'Reply with OK.', maxOutputTokens: 4, maxRetries: 0 });
    } catch {
      return apiError(
        'INVALID_REQUEST',
        400,
        '连接测试失败。请检查 API Key、供应商账户额度和网络后重试；凭证未保存。',
      );
    }
    try {
      await saveLearnerCredential(user.id, providerId, apiKey);
      await markLearnerCredentialVerified(user.id);
      return apiSuccess({ saved: true, tested: true });
    } catch {
      return apiError('INTERNAL_ERROR', 503, '连接测试通过，但安全保存未完成。请稍后重试。');
    }
  } catch {
    return apiError('INTERNAL_ERROR', 503, 'AI Provider 设置暂不可用');
  }
}

export async function DELETE() {
  const user = await authenticatedUser();
  if (!user) return apiError('INVALID_REQUEST', 401, '请先登录');
  try {
    await deleteLearnerCredential(user.id);
    return apiSuccess({ deleted: true });
  } catch {
    return apiError('INTERNAL_ERROR', 503, '无法删除 AI 凭证');
  }
}
