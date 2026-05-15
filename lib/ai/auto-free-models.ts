import type { ProviderId } from '@/lib/types/provider';

export type AutoFreeModelChoice = {
  providerId: ProviderId;
  modelId: string;
  modelString: string;
};

export const DEFAULT_AUTO_FREE_MODELS: AutoFreeModelChoice[] = [
  toChoice('siliconflow', 'Qwen/Qwen2.5-7B-Instruct'),
  toChoice('siliconflow', 'deepseek-ai/DeepSeek-V3'),
  toChoice('google', 'gemini-2.5-flash-lite'),
  toChoice('google', 'gemini-2.5-flash'),
  toChoice('groq', 'llama-3.1-8b-instant'),
  toChoice('groq', 'gemma2-9b-it'),
];

export function parseAutoFreeModels(value?: string | null): AutoFreeModelChoice[] {
  if (!value) return DEFAULT_AUTO_FREE_MODELS;

  const parsed = value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((modelString) => {
      const colonIndex = modelString.indexOf(':');
      if (colonIndex <= 0) return null;

      const providerId = modelString.slice(0, colonIndex) as ProviderId;
      const modelId = modelString.slice(colonIndex + 1);
      if (!providerId || !modelId) return null;

      return toChoice(providerId, modelId);
    })
    .filter((choice): choice is AutoFreeModelChoice => !!choice);

  return parsed.length > 0 ? parsed : DEFAULT_AUTO_FREE_MODELS;
}

export function pickAutoFreeModel({
  configuredProviderIds,
  configuredModels,
  cursor = 0,
  envValue,
}: {
  configuredProviderIds?: Iterable<string>;
  configuredModels?: Record<string, string[] | undefined>;
  cursor?: number;
  envValue?: string | null;
} = {}): AutoFreeModelChoice {
  const pool = parseAutoFreeModels(envValue);
  const configuredProviders = configuredProviderIds ? new Set(configuredProviderIds) : null;
  const eligible = pool.filter((choice) => {
    if (configuredProviders && !configuredProviders.has(choice.providerId)) return false;

    const providerModels = configuredModels?.[choice.providerId];
    if (providerModels?.length && !providerModels.includes(choice.modelId)) return false;

    return true;
  });
  const candidates = eligible.length > 0 ? eligible : pool;
  const index = Math.abs(cursor) % candidates.length;

  return candidates[index];
}

function toChoice(providerId: ProviderId, modelId: string): AutoFreeModelChoice {
  return {
    providerId,
    modelId,
    modelString: `${providerId}:${modelId}`,
  };
}
