/**
 * Shared model resolution utilities for API routes.
 *
 * Extracts the repeated parseModelString → resolveApiKey → resolveBaseUrl →
 * resolveProxy → getModel boilerplate into a single call.
 */

import type { NextRequest } from 'next/server';
import { parseAutoFreeModels, pickAutoFreeModel } from '@/lib/ai/auto-free-models';
import { getModel, parseModelString, type ModelWithInfo } from '@/lib/ai/providers';
import type { ThinkingConfig } from '@/lib/types/provider';
import {
  getServerProviders,
  resolveApiKey,
  resolveBaseUrl,
  resolveProxy,
} from '@/lib/server/provider-config';
import { validateUrlForSSRF } from '@/lib/server/ssrf-guard';
import {
  canUseCoastalTutorFreeModelTrial,
  getCoastalTutorFreeModelTrialLimit,
} from '@/lib/server/free-model-trial-quota';

export interface ResolvedModel extends ModelWithInfo {
  /** Original model string (e.g. "openai/gpt-4o-mini") */
  modelString: string;
  /** Resolved provider ID (e.g. "openai", "ollama") */
  providerId: string;
  /** Resolved model ID (e.g. "gpt-4o-mini") */
  modelId: string;
  /** Effective API key after server-side fallback resolution */
  apiKey: string;
  /** Effective base URL after server/client resolution */
  baseUrl?: string;
  /** Optional per-request thinking configuration from the client. */
  thinkingConfig?: ThinkingConfig;
}

let autoFreeCursor = 0;

/**
 * Resolve a language model from explicit parameters.
 *
 * Use this when model config comes from the request body.
 */
export async function resolveModel(params: {
  modelString?: string;
  apiKey?: string;
  baseUrl?: string;
  providerType?: string;
  thinkingConfig?: ThinkingConfig;
  generationSessionId?: string;
  trialClientId?: string;
}): Promise<ResolvedModel> {
  let modelString = params.modelString || process.env.DEFAULT_MODEL || 'auto:free';
  let { providerId, modelId } = parseModelString(modelString);
  const isAutoFreeRequest = providerId === 'auto';
  const serverFreeModelsAllowed =
    process.env.NODE_ENV !== 'production' ||
    process.env.ALLOW_SERVER_FREE_MODELS === 'true' ||
    canUseCoastalTutorFreeModelTrial({
      sessionId: params.generationSessionId,
      trialClientId: params.trialClientId,
    });

  if (isAutoFreeRequest && !serverFreeModelsAllowed) {
    throw new Error(
      `This free CoastalTutor trial is limited to ${getCoastalTutorFreeModelTrialLimit()} course generations. Add your own model API key in settings to keep generating courses and unlock stronger models.`,
    );
  }

  const shouldAvoidGemini3 =
    providerId === 'google' &&
    modelId.startsWith('gemini-3') &&
    process.env.ALLOW_GEMINI_3_FREE_TIER !== 'true';

  if (isAutoFreeRequest || shouldAvoidGemini3) {
    const serverProviders = getServerProviders();
    const configuredProviderIds = Object.keys(serverProviders);
    if (configuredProviderIds.length === 0) {
      throw new Error(
        'No server-configured free model provider is available. Configure SILICONFLOW_API_KEY, GOOGLE_API_KEY, or GROQ_API_KEY in the server environment. On Vercel, add it under Project Settings > Environment Variables, then redeploy. For local development, add it to .env.local and restart the dev server.',
      );
    }

    const configuredModels = Object.fromEntries(
      Object.entries(serverProviders).map(([id, entry]) => [id, entry.models]),
    );
    const pool = parseAutoFreeModels(process.env.AUTO_FREE_MODELS);
    const hasEligibleConfiguredModel = pool.some((choice) => {
      if (!configuredProviderIds.includes(choice.providerId)) return false;

      const providerModels = configuredModels[choice.providerId];
      return !providerModels?.length || providerModels.includes(choice.modelId);
    });

    if (!hasEligibleConfiguredModel) {
      throw new Error(
        `No configured provider matches AUTO_FREE_MODELS. Configured providers: ${configuredProviderIds.join(
          ', ',
        )}. Update AUTO_FREE_MODELS or provider *_MODELS in .env.local.`,
      );
    }

    const choice = pickAutoFreeModel({
      configuredProviderIds,
      configuredModels,
      cursor: autoFreeCursor++,
      envValue: process.env.AUTO_FREE_MODELS,
    });

    providerId = choice.providerId;
    modelId = choice.modelId;
    modelString = choice.modelString;
  }

  // SSRF validation applies only to client-supplied base URLs.
  // Server-configured URLs (e.g. OLLAMA_BASE_URL from env/YAML) flow through
  // resolveBaseUrl() and bypass this check — they're trusted by the operator.
  const clientBaseUrl = params.baseUrl || undefined;
  if (clientBaseUrl && process.env.NODE_ENV === 'production') {
    const ssrfError = await validateUrlForSSRF(clientBaseUrl);
    if (ssrfError) {
      throw new Error(ssrfError);
    }
  }

  const apiKey = clientBaseUrl
    ? params.apiKey || ''
    : resolveApiKey(providerId, params.apiKey || '');
  const baseUrl = clientBaseUrl ? clientBaseUrl : resolveBaseUrl(providerId, params.baseUrl);
  const proxy = resolveProxy(providerId);
  const { model, modelInfo } = getModel({
    providerId,
    modelId,
    apiKey,
    baseUrl,
    proxy,
    providerType: params.providerType as 'openai' | 'anthropic' | 'google' | undefined,
  });

  return {
    model,
    modelInfo,
    modelString,
    providerId,
    modelId,
    apiKey,
    baseUrl,
    thinkingConfig: params.thinkingConfig,
  };
}

function getThinkingConfigFromBody(body: unknown): ThinkingConfig | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const record = body as { thinkingConfig?: unknown; thinking?: unknown };
  const config = record.thinkingConfig ?? record.thinking;
  return config && typeof config === 'object' ? (config as ThinkingConfig) : undefined;
}

/**
 * Resolve a language model from standard request headers.
 *
 * Reads: x-model, x-api-key, x-base-url, x-provider-type
 * Note: requiresApiKey is derived server-side from the provider registry,
 * never from client headers, to prevent auth bypass.
 */
export async function resolveModelFromHeaders(req: NextRequest): Promise<ResolvedModel> {
  return resolveModel({
    modelString: req.headers.get('x-model') || undefined,
    apiKey: req.headers.get('x-api-key') || undefined,
    baseUrl: req.headers.get('x-base-url') || undefined,
    providerType: req.headers.get('x-provider-type') || undefined,
    generationSessionId: req.headers.get('x-generation-session-id') || undefined,
    trialClientId: req.headers.get('x-trial-client-id') || undefined,
  });
}

/**
 * Resolve a language model from standard request headers plus body fields.
 *
 * Reads model credentials from headers and per-request thinking config from
 * the JSON body field `thinkingConfig` (or legacy/eval field `thinking`).
 */
export async function resolveModelFromRequest(
  req: NextRequest,
  body: unknown,
): Promise<ResolvedModel> {
  const resolved = await resolveModelFromHeaders(req);
  return {
    ...resolved,
    thinkingConfig: getThinkingConfigFromBody(body) ?? resolved.thinkingConfig,
  };
}
