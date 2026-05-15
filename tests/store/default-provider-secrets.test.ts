import { describe, expect, it } from 'vitest';
import { useSettingsStore } from '@/lib/store/settings';

describe('default provider config secrets', () => {
  it('does not ship API keys in client defaults', () => {
    const providers = useSettingsStore.getState().providersConfig;

    expect(providers.siliconflow.apiKey).toBe('');
    expect(providers.google.apiKey).toBe('');
    expect(providers.groq.apiKey).toBe('');
  });
});
