import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface TeacherDashboardSummary {
  totalStudents: number;
  averageMastery: number;
  activeToday: number;
  needsAttention: number;
}

export interface TeacherDashboardMasteryRow {
  student_id?: string | null;
  mastery_level?: number | null;
}

export interface TeacherDashboardSessionRow {
  student_id?: string | null;
  started_at?: string | null;
}

export interface TeacherDashboardAlertRow {
  id?: string | null;
}

export function buildTeacherDashboardSummary({
  studentIds,
  masteryRows,
  sessions,
  unresolvedAlerts,
}: {
  studentIds: string[];
  masteryRows: TeacherDashboardMasteryRow[];
  sessions: TeacherDashboardSessionRow[];
  unresolvedAlerts: TeacherDashboardAlertRow[];
}): TeacherDashboardSummary {
  const masteryValues = masteryRows
    .map((row) => row.mastery_level)
    .filter((value): value is number => typeof value === 'number');
  const activeStudentIds = new Set(
    sessions.map((session) => session.student_id).filter((id): id is string => !!id),
  );

  return {
    totalStudents: studentIds.length,
    averageMastery: roundRatio(average(masteryValues, 0)),
    activeToday: activeStudentIds.size,
    needsAttention: unresolvedAlerts.length,
  };
}

export async function getTeacherDashboardSummary(
  teacherId: string,
  date: Date = new Date(),
): Promise<TeacherDashboardSummary> {
  const supabase = createSupabaseAdminClient();
  const { dayStart, dayEnd } = getVancouverDayRange(date);
  const { data: links, error: linksError } = await supabase
    .from('teacher_student_links')
    .select('student_id')
    .eq('teacher_id', teacherId);

  if (linksError) {
    throw linksError;
  }

  const studentIds = (links ?? [])
    .map((link) => link.student_id as string | undefined)
    .filter((studentId): studentId is string => !!studentId);

  if (studentIds.length === 0) {
    return buildTeacherDashboardSummary({
      studentIds,
      masteryRows: [],
      sessions: [],
      unresolvedAlerts: [],
    });
  }

  const [masteryResult, sessionsResult, alertsResult] = await Promise.all([
    supabase
      .from('student_mastery')
      .select('student_id, mastery_level')
      .in('student_id', studentIds),
    supabase
      .from('learning_sessions')
      .select('student_id, started_at')
      .in('student_id', studentIds)
      .gte('started_at', dayStart.toISOString())
      .lt('started_at', dayEnd.toISOString()),
    supabase.from('tutor_alerts').select('id').eq('teacher_id', teacherId).eq('is_resolved', false),
  ]);

  for (const result of [masteryResult, sessionsResult, alertsResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  return buildTeacherDashboardSummary({
    studentIds,
    masteryRows: (masteryResult.data ?? []) as TeacherDashboardMasteryRow[],
    sessions: (sessionsResult.data ?? []) as TeacherDashboardSessionRow[],
    unresolvedAlerts: (alertsResult.data ?? []) as TeacherDashboardAlertRow[],
  });
}

function average(values: number[], fallback: number) {
  if (values.length === 0) {
    return fallback;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function roundRatio(value: number) {
  return Math.max(0, Math.min(1, Math.round(value * 100) / 100));
}

function getVancouverDayRange(date: Date) {
  const timeZone = 'America/Vancouver';
  const parts = getZonedDateParts(date, timeZone);
  const dayStart = zonedTimeToUtc(parts.year, parts.month, parts.day, timeZone);
  const nextDay = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + 1, 12));
  const nextParts = getZonedDateParts(nextDay, timeZone);
  const dayEnd = zonedTimeToUtc(nextParts.year, nextParts.month, nextParts.day, timeZone);

  return { dayStart, dayEnd };
}

function getZonedDateParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value),
    month: Number(parts.find((part) => part.type === 'month')?.value),
    day: Number(parts.find((part) => part.type === 'day')?.value),
  };
}

function zonedTimeToUtc(year: number, month: number, day: number, timeZone: string) {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offsetMs = getTimeZoneOffsetMs(utcGuess, timeZone);

  return new Date(utcGuess.getTime() - offsetMs);
}

function getTimeZoneOffsetMs(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const getPart = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const zonedAsUtc = Date.UTC(
    getPart('year'),
    getPart('month') - 1,
    getPart('day'),
    getPart('hour'),
    getPart('minute'),
    getPart('second'),
  );

  return zonedAsUtc - date.getTime();
}
