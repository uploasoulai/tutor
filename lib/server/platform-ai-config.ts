import { resolveApiKey } from '@/lib/server/provider-config';

export type PlatformAiProviderId = 'deepseek' | 'siliconflow';

export function isPlatformAiUsageEnforcementEnabled() {
  return process.env.PLATFORM_AI_ENFORCE_USAGE_LIMITS === 'true';
}

const DEFAULT_MODELS: Record<PlatformAiProviderId, string> = {
  deepseek: 'deepseek:deepseek-flash',
  siliconflow: 'siliconflow:deepseek-ai/DeepSeek-V3',
};

export function getPlatformAiConfig() {
  const configuredProvider = (process.env.PLATFORM_AI_PROVIDER || 'siliconflow')
    .trim()
    .toLowerCase();
  if (configuredProvider !== 'deepseek' && configuredProvider !== 'siliconflow') {
    throw new Error('PLATFORM_AI_PROVIDER must be deepseek or siliconflow');
  }
  const providerId = configuredProvider as PlatformAiProviderId;
  const modelString = process.env.PLATFORM_AI_MODEL?.trim() || DEFAULT_MODELS[providerId];
  if (
    !modelString.startsWith(`${providerId}:`) ||
    !modelString.slice(providerId.length + 1).trim()
  ) {
    throw new Error(
      `PLATFORM_AI_MODEL must select a model under the active ${providerId} provider`,
    );
  }
  return {
    providerId,
    modelString,
    apiKey: resolveApiKey(providerId),
    keyEnvName: providerId === 'deepseek' ? 'DEEPSEEK_API_KEY' : 'SILICONFLOW_API_KEY',
  };
}

export function getPlatformAiRates() {
  const input = process.env.PLATFORM_AI_INPUT_USD_PER_MILLION;
  const output = process.env.PLATFORM_AI_OUTPUT_USD_PER_MILLION;
  // Backward compatibility for the already configured DeepSeek rate pair.
  const config = getPlatformAiConfig();
  const inputValue =
    input ??
    (config.providerId === 'deepseek'
      ? process.env.PLATFORM_AI_DEEPSEEK_INPUT_USD_PER_MILLION
      : undefined);
  const outputValue =
    output ??
    (config.providerId === 'deepseek'
      ? process.env.PLATFORM_AI_DEEPSEEK_OUTPUT_USD_PER_MILLION
      : undefined);
  const inputRate = Number(inputValue);
  const outputRate = Number(outputValue);
  if (
    inputValue === undefined ||
    outputValue === undefined ||
    !Number.isFinite(inputRate) ||
    inputRate < 0 ||
    !Number.isFinite(outputRate) ||
    outputRate < 0
  ) {
    throw new Error(
      'Platform AI input/output USD token rates must be configured for the active provider and model',
    );
  }
  return { inputRate, outputRate };
}
