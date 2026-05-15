import { describe, expect, it } from 'vitest';

import { getRuntimeStatus } from '@/lib/ops/runtime-status';

describe('getRuntimeStatus', () => {
  it('reports only boolean configuration state without exposing secret values', () => {
    const status = getRuntimeStatus({
      APP_BASE_URL: 'https://example.com',
      PARENT_REPORT_CRON_SECRET: 'secret-value',
      KEEPALIVE_SECRET: '',
      ALLOW_SERVER_FREE_MODELS: 'true',
      AUTO_FREE_MODELS: 'siliconflow:Qwen/Qwen2.5-7B-Instruct',
      ALLOW_GEMINI_3_FREE_TIER: 'false',
    });

    expect(status).toEqual({
      parentReports: {
        appBaseUrlConfigured: true,
        cronSecretConfigured: true,
      },
      keepalive: {
        secretConfigured: false,
      },
      aiRouting: {
        serverFreeModelsAllowed: true,
        autoFreeModelsConfigured: true,
        gemini3FreeTierAllowed: false,
      },
    });
    expect(JSON.stringify(status)).not.toContain('secret-value');
  });
});
