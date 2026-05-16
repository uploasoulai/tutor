import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface StudentSessionListItem {
  id: string;
  lessonTitle: string;
  status: string;
  startedAt: string | null;
  accuracyRate: number | null;
  xpEarned: number;
  activitiesCompleted: number;
  lessonQualityScore: number | null;
  lessonEngineQualityScore: number | null;
  reuseKey: string | null;
  canReuse: boolean;
  openPath: string;
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
    activitiesCompleted: countLessonProgressActivities(row.lesson_payload),
    lessonQualityScore: readLessonQualityScore(row.lesson_payload, 'score'),
    lessonEngineQualityScore: readLessonEngineQualityScore(row.lesson_payload),
    reuseKey,
    canReuse: !!reuseKey && ['planned', 'generated', 'started', 'completed'].includes(status),
    openPath: `/student/lesson?sessionId=${encodeURIComponent(String(row.id))}`,
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
    .select(
      'id, lesson_title, status, started_at, accuracy_rate, xp_earned, reuse_key, lesson_payload',
    )
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

function countLessonProgressActivities(payload: unknown) {
  const progress =
    payload && typeof payload === 'object' ? (payload as { progress?: unknown }).progress : null;
  if (!progress || typeof progress !== 'object') return 0;

  const quiz = (progress as { quiz?: unknown }).quiz;
  const widgets = (progress as { widgets?: unknown }).widgets;

  return countRecordKeys(quiz) + countRecordKeys(widgets);
}

function countRecordKeys(value: unknown) {
  return value && typeof value === 'object' ? Object.keys(value).length : 0;
}

function readLessonQualityScore(payload: unknown, key: 'score') {
  const quality =
    payload && typeof payload === 'object' ? (payload as { quality?: unknown }).quality : null;
  if (!quality || typeof quality !== 'object') return null;

  const value = (quality as Record<string, unknown>)[key];
  return typeof value === 'number' ? value : null;
}

function readLessonEngineQualityScore(payload: unknown) {
  const quality =
    payload && typeof payload === 'object' ? (payload as { quality?: unknown }).quality : null;
  if (!quality || typeof quality !== 'object') return null;

  const lessonEngine = (quality as { lessonEngine?: unknown }).lessonEngine;
  if (!lessonEngine || typeof lessonEngine !== 'object') return null;

  const value = (lessonEngine as { score?: unknown }).score;
  return typeof value === 'number' ? value : null;
}
