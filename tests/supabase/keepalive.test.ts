import { describe, expect, it, vi } from 'vitest';
import { isAuthorizedKeepaliveRequest } from '@/lib/supabase/keepalive';

describe('Supabase keepalive auth', () => {
  it('rejects requests when no keepalive secret is configured', () => {
    vi.stubEnv('KEEPALIVE_SECRET', '');

    expect(isAuthorizedKeepaliveRequest('Bearer any')).toBe(false);
  });

  it('requires an exact bearer token match', () => {
    vi.stubEnv('KEEPALIVE_SECRET', 'test-secret');

    expect(isAuthorizedKeepaliveRequest('Bearer test-secret')).toBe(true);
    expect(isAuthorizedKeepaliveRequest('test-secret')).toBe(false);
    expect(isAuthorizedKeepaliveRequest('Bearer wrong')).toBe(false);
    expect(isAuthorizedKeepaliveRequest(null)).toBe(false);
  });
});
