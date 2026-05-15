import { describe, expect, it } from 'vitest';

import { buildKeepaliveStatusView } from '@/lib/ops/keepalive-status';

describe('buildKeepaliveStatusView', () => {
  it('formats a safe keepalive result without exposing secrets', () => {
    const view = buildKeepaliveStatusView({
      ok: true,
      checkedAt: '2026-05-15T17:00:00.000Z',
      subjectCount: 9,
    });

    expect(view).toEqual({
      ok: true,
      checkedAt: '2026-05-15T17:00:00.000Z',
      subjectCount: 9,
      message: 'Supabase responded with 9 curriculum subjects.',
    });
  });
});
