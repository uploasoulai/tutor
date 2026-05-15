import { afterEach, describe, expect, it } from 'vitest';

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe('getSupabasePublicConfig', () => {
  it('accepts normal Supabase public env values', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
    const { getSupabasePublicConfig } = await import('@/lib/supabase/public-config');

    expect(getSupabasePublicConfig()).toEqual({
      configured: true,
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'sb_publishable_test',
    });
  });

  it('normalizes env values pasted with their variable names', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_test';
    const { getSupabasePublicConfig } = await import('@/lib/supabase/public-config');

    expect(getSupabasePublicConfig()).toEqual({
      configured: true,
      supabaseUrl: 'https://example.supabase.co',
      supabaseKey: 'sb_publishable_test',
    });
  });

  it('falls back to a prerender placeholder for invalid URLs', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'not a url';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_test';
    const { getSupabasePublicConfig } = await import('@/lib/supabase/public-config');

    expect(getSupabasePublicConfig()).toMatchObject({
      configured: false,
      supabaseUrl: 'http://127.0.0.1:54321',
      supabaseKey: 'sb_publishable_test',
    });
  });
});
