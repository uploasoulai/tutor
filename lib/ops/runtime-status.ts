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
  };
}

export function getRuntimeStatus(
  env: Record<string, string | undefined> = process.env,
): RuntimeStatus {
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
    },
  };
}

function hasValue(value: string | undefined) {
  return typeof value === 'string' && value.trim().length > 0;
}
