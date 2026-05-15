import type { SupabaseKeepaliveResult } from '@/lib/supabase/keepalive';

export interface KeepaliveStatusView {
  ok: boolean;
  checkedAt: string;
  subjectCount: number;
  message: string;
}

export function buildKeepaliveStatusView(result: SupabaseKeepaliveResult): KeepaliveStatusView {
  return {
    ok: result.ok,
    checkedAt: result.checkedAt,
    subjectCount: result.subjectCount,
    message: `Supabase responded with ${result.subjectCount} curriculum subjects.`,
  };
}
