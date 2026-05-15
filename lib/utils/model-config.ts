import { useSettingsStore } from '@/lib/store/settings';
import { pickAutoFreeModel } from '@/lib/ai/auto-free-models';
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
    const configuredProviderIds = Object.entries(storeState.providersConfig)
      .filter(([, config]) => config.isServerConfigured || !!config.apiKey)
      .map(([id]) => id);
    const configuredModels = Object.fromEntries(
      Object.entries(storeState.providersConfig).map(([id, config]) => [
        id,
        config.serverModels?.length ? config.serverModels : undefined,
      ]),
    );
    const choice = pickAutoFreeModel({
      configuredProviderIds,
      configuredModels,
      cursor: Math.floor(Date.now() / 300000),
    });

    providerId = choice.providerId;
    modelId = choice.modelId;
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
