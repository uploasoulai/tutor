import { describe, expect, it } from 'vitest';
import {
  DEFAULT_AUTO_FREE_MODELS,
  parseAutoFreeModels,
  pickAutoFreeModel,
} from '@/lib/ai/auto-free-models';

describe('auto free model rotation', () => {
  it('does not include Gemini 3.x in the default free pool', () => {
    expect(DEFAULT_AUTO_FREE_MODELS.map((model) => model.modelString)).not.toContain(
      'google:gemini-3.1-pro-preview',
    );
    expect(DEFAULT_AUTO_FREE_MODELS.some((model) => model.modelId.startsWith('gemini-3'))).toBe(
      false,
    );
  });

  it('prioritizes configured SiliconFlow models when available', () => {
    const choice = pickAutoFreeModel({
      configuredProviderIds: ['siliconflow', 'google'],
      configuredModels: {
        siliconflow: ['Qwen/Qwen2.5-7B-Instruct'],
        google: ['gemini-2.5-flash-lite'],
      },
      cursor: 0,
    });

    expect(choice.modelString).toBe('siliconflow:Qwen/Qwen2.5-7B-Instruct');
  });

  it('allows an operator-defined rotation pool', () => {
    const pool = parseAutoFreeModels(
      'siliconflow:Qwen/Qwen2.5-7B-Instruct,google:gemini-2.5-flash-lite',
    );

    expect(pool.map((model) => model.modelString)).toEqual([
      'siliconflow:Qwen/Qwen2.5-7B-Instruct',
      'google:gemini-2.5-flash-lite',
    ]);
  });
});
