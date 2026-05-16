import { parseAutoFreeModels } from '@/lib/ai/auto-free-models';

export interface RuntimeStatus {
  parentReports: {
    appBaseUrlConfigured: boolean;
    cronSecretConfigured: boolean;
  };
  keepalive: {
    secretConfigured: boolean;
  };
  aiRouting: {
    serverFreeModelsAllowed: boolean;
    autoFreeModelsConfigured: boolean;
    gemini3FreeTierAllowed: boolean;
    configuredFreeModelProviders: string[];
    eligibleAutoFreeModels: string[];
  };
}

const FREE_MODEL_PROVIDER_ENV = {
  siliconflow: {
    key: 'SILICONFLOW_API_KEY',
    models: 'SILICONFLOW_MODELS',
  },
  google: {
    key: 'GOOGLE_API_KEY',
    models: 'GOOGLE_MODELS',
  },
  groq: {
    key: 'GROQ_API_KEY',
    models: 'GROQ_MODELS',
  },
} as const;

export function getRuntimeStatus(
  env: Record<string, string | undefined> = process.env,
): RuntimeStatus {
  const configuredFreeModelProviders = getConfiguredFreeModelProviders(env);

  return {
    parentReports: {
      appBaseUrlConfigured: hasValue(env.APP_BASE_URL),
      cronSecretConfigured: hasValue(env.PARENT_REPORT_CRON_SECRET),
    },
    keepalive: {
      secretConfigured: hasValue(env.KEEPALIVE_SECRET),
    },
    aiRouting: {
      serverFreeModelsAllowed: env.ALLOW_SERVER_FREE_MODELS === 'true',
      autoFreeModelsConfigured: hasValue(env.AUTO_FREE_MODELS),
      gemini3FreeTierAllowed: env.ALLOW_GEMINI_3_FREE_TIER === 'true',
      configuredFreeModelProviders,
      eligibleAutoFreeModels: getEligibleAutoFreeModels(env, configuredFreeModelProviders),
    },
  };
}

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}

function getConfiguredFreeModelProviders(env: Record<string, string | undefined>) {
  return Object.entries(FREE_MODEL_PROVIDER_ENV)
    .filter(([, config]) => hasValue(env[config.key]))
    .map(([providerId]) => providerId);
}

function parseModelList(value: string | undefined) {
  const raw = value ?? '';
  if (!hasValue(raw)) return undefined;

  const models = raw
    .trim()
    .split(',')
    .map((model) => model.trim())
    .filter(Boolean);
  return models.length > 0 ? models : undefined;
}

function getEligibleAutoFreeModels(
  env: Record<string, string | undefined>,
  configuredFreeModelProviders: string[],
) {
  const configured = new Set(configuredFreeModelProviders);
  const providerModels = Object.fromEntries(
    Object.entries(FREE_MODEL_PROVIDER_ENV).map(([providerId, config]) => [
      providerId,
      parseModelList(env[config.models]),
    ]),
  );

  return parseAutoFreeModels(env.AUTO_FREE_MODELS)
    .filter((choice) => {
      if (!configured.has(choice.providerId)) return false;

      const models = providerModels[choice.providerId];
      return !models?.length || models.includes(choice.modelId);
    })
    .map((choice) => choice.modelString);
}
