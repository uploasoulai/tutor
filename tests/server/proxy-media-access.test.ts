import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({
  user: { id: 'student' } as { id: string } | null,
  ssrf: vi.fn(),
  fetch: vi.fn(),
  log: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: mocks.user } }) } }),
}));
vi.mock('@/lib/server/ssrf-guard', () => ({ validateUrlForSSRF: mocks.ssrf }));
vi.mock('@/lib/logger', () => ({ createLogger: () => ({ error: mocks.log }) }));
import { POST } from '@/app/api/proxy-media/route';
const url = 'https://media.example.test/image.png?signature=private-token';
const request = () =>
  POST(
    new NextRequest('https://example.test/api/proxy-media', {
      method: 'POST',
      body: JSON.stringify({ url }),
    }),
  );
describe('media proxy privacy', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.user = { id: 'student' };
    mocks.ssrf.mockResolvedValue(null);
    vi.stubGlobal('fetch', mocks.fetch);
  });
  afterEach(() => vi.unstubAllGlobals());
  it('does not fetch anonymous requests', async () => {
    mocks.user = null;
    expect((await request()).status).toBe(401);
    expect(mocks.ssrf).not.toHaveBeenCalled();
    expect(mocks.fetch).not.toHaveBeenCalled();
  });
  it('preserves private-network and redirect blocking', async () => {
    mocks.ssrf.mockResolvedValueOnce('Blocked');
    expect((await request()).status).toBe(403);
    expect(mocks.fetch).not.toHaveBeenCalled();
    mocks.fetch.mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { location: 'http://127.0.0.1' } }),
    );
    expect((await request()).status).toBe(403);
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.fetch.mock.calls[0][1].redirect).toBe('manual');
  });
  it('returns media to the signed-in browser without reusable caching', async () => {
    mocks.fetch.mockResolvedValue(
      new Response('png', { headers: { 'content-type': 'image/png' } }),
    );
    const response = await request();
    expect(await response.text()).toBe('png');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('content-type')).toBe('image/png');
  });
  it('does not leak signed URLs through logs or error responses', async () => {
    mocks.fetch.mockRejectedValue(new Error(`Failed to fetch ${url}`));
    const response = await request();
    expect(response.status).toBe(500);
    expect(await response.text()).not.toContain('private-token');
    expect(JSON.stringify(mocks.log.mock.calls)).not.toContain('private-token');
  });
});
