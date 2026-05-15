import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type SupabaseKeepaliveResult = {
  ok: true;
  checkedAt: string;
  subjectCount: number;
};

export async function pingSupabase(): Promise<SupabaseKeepaliveResult> {
  const supabase = createSupabaseAdminClient();
  const { count, error } = await supabase
    .from('bc_subjects')
    .select('id', { count: 'exact', head: true });

  if (error) throw error;

  return {
    ok: true,
    checkedAt: new Date().toISOString(),
    subjectCount: count ?? 0,
  };
}

export function isAuthorizedKeepaliveRequest(authHeader: string | null) {
  const secret = process.env.KEEPALIVE_SECRET;
  if (!secret) return false;

  return authHeader === `Bearer ${secret}`;
}
