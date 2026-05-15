import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface StudentSessionListItem {
  id: string;
  lessonTitle: string;
  status: string;
  startedAt: string | null;
  accuracyRate: number | null;
  xpEarned: number;
  reuseKey: string | null;
  canReuse: boolean;
}

export function mapStudentSession(row: Record<string, unknown>): StudentSessionListItem {
  const status = String(row.status ?? 'planned');
  const reuseKey = typeof row.reuse_key === 'string' && row.reuse_key ? row.reuse_key : null;

  return {
    id: String(row.id),
    lessonTitle: String(row.lesson_title ?? 'Grade 2 lesson'),
    status,
    startedAt: (row.started_at as string | null) ?? null,
    accuracyRate: typeof row.accuracy_rate === 'number' ? roundRatio(row.accuracy_rate) : null,
    xpEarned: Number(row.xp_earned ?? 0),
    reuseKey,
    canReuse: !!reuseKey && ['planned', 'generated', 'started', 'completed'].includes(status),
  };
}

export async function listStudentSessions({
  studentId,
  limit = 12,
}: {
  studentId: string;
  limit?: number;
}): Promise<StudentSessionListItem[]> {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('learning_sessions')
    .select('id, lesson_title, status, started_at, accuracy_rate, xp_earned, reuse_key')
    .eq('student_id', studentId)
    .order('started_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapStudentSession(row as Record<string, unknown>));
}

function roundRatio(value: number) {
  return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
}
