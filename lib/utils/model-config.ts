import { useSettingsStore } from '@/lib/store/settings';
import {
  getThinkingConfigKey,
  normalizeThinkingConfig,
  supportsConfigurableThinking,
} from '@/lib/ai/thinking-config';

/**
 * Get current model configuration from settings store
 */
export function getCurrentModelConfig() {
  const storeState = useSettingsStore.getState();
  let providerId = storeState.providerId;
  let modelId = storeState.modelId;

  // Implement auto free model load-balancing
  if (providerId === 'auto') {
    const freeModels = [
      { p: 'siliconflow', m: 'Qwen/Qwen2.5-7B-Instruct' },
      { p: 'siliconflow', m: 'deepseek-ai/DeepSeek-V3' },
      { p: 'google', m: 'gemini-3.1-pro-preview' }, // user mentioned gemini 3 flash, or other free
      { p: 'groq', m: 'llama-3.3-70b-versatile' },
    ];
    // pick one randomly
    const choice = freeModels[Math.floor(Math.random() * freeModels.length)];
    providerId = choice.p as any;
    modelId = choice.m;
  }

  const modelString = `${providerId}:${modelId}`;
  const providersConfig = storeState.providersConfig;
  const thinkingConfigs = storeState.thinkingConfigs;

  // Get current provider's config
  const providerConfig = providersConfig[providerId];
  const modelInfo = providerConfig?.models.find((model) => model.id === modelId);
  const thinking = modelInfo?.capabilities?.thinking;
  const thinkingConfig = supportsConfigurableThinking(thinking)
    ? normalizeThinkingConfig(thinking, thinkingConfigs[getThinkingConfigKey(providerId, modelId)])
    : undefined;

  return {
    providerId,
    modelId,
    modelString,
    apiKey: providerConfig?.apiKey || '',
    baseUrl: providerConfig?.baseUrl || '',
    providerType: providerConfig?.type,
    requiresApiKey: providerConfig?.requiresApiKey,
    isServerConfigured: providerConfig?.isServerConfigured,
    thinkingConfig,
  };
}
