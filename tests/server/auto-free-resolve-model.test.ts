import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/ai/providers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/ai/providers')>();
  return {
    ...actual,
    getModel: vi.fn((config) => ({
      model: { providerId: config.providerId, modelId: config.modelId },
      modelInfo: { id: config.modelId, outputWindow: 8192 },
    })),
  };
});

describe('resolveModel auto:free', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it('uses configured SiliconFlow free models before Gemini fallback', async () => {
    vi.stubEnv('SILICONFLOW_API_KEY', 'sf-test');
    vi.stubEnv('GOOGLE_API_KEY', 'google-test');

    const { resolveModel } = await import('@/lib/server/resolve-model');
    const resolved = await resolveModel({ modelString: 'auto:free' });

    expect(resolved.modelString).toBe('siliconflow:Qwen/Qwen2.5-7B-Instruct');
    expect(resolved.providerId).toBe('siliconflow');
    expect(resolved.modelId).toBe('Qwen/Qwen2.5-7B-Instruct');
    expect(resolved.apiKey).toBe('sf-test');
  });

  it('reroutes explicit Gemini 3 requests to the free rotation unless allowed', async () => {
    vi.stubEnv('SILICONFLOW_API_KEY', 'sf-test');
    vi.stubEnv('GOOGLE_API_KEY', 'google-test');

    const { resolveModel } = await import('@/lib/server/resolve-model');
    const resolved = await resolveModel({ modelString: 'google:gemini-3.1-pro-preview' });

    expect(resolved.modelString).toBe('siliconflow:Qwen/Qwen2.5-7B-Instruct');
    expect(resolved.providerId).toBe('siliconflow');
  });

  it('reports missing server-side free provider keys clearly', async () => {
    const { resolveModel } = await import('@/lib/server/resolve-model');

    await expect(resolveModel({ modelString: 'auto:free' })).rejects.toThrow(
      'No server-configured free model provider is available',
    );
  });
});
