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
  student_id?: string | null;
}

export interface TeacherStudentProfileRow {
  id?: string | null;
  grade_level?: number | null;
  profiles?:
    | { full_name?: string | null; preferred_name?: string | null }
    | { full_name?: string | null; preferred_name?: string | null }[]
    | null;
}

export interface TeacherStudentSummary {
  studentId: string;
  studentName: string;
  grade: string;
  averageMastery: number;
  completedSessions: number;
  lastActiveAt: string | null;
  unresolvedAlerts: number;
}

export interface TeacherStudentDetail extends TeacherStudentSummary {
  masteryRows: Array<{
    outcomeId: string;
    outcomeCode: string;
    contentKnowledge: string;
    masteryLevel: number;
    attempts: number;
    correctAttempts: number;
  }>;
  recentSessions: Array<{
    id: string;
    lessonTitle: string;
    status: string;
    startedAt: string | null;
    accuracyRate: number | null;
    xpEarned: number;
  }>;
  unresolvedAlertSummaries: Array<{
    id: string;
    alertType: string;
    createdAt: string | null;
  }>;
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

export function buildTeacherStudentSummaries({
  students,
  masteryRows,
  sessions,
  unresolvedAlerts,
}: {
  students: TeacherStudentProfileRow[];
  masteryRows: TeacherDashboardMasteryRow[];
  sessions: Array<TeacherDashboardSessionRow & { status?: string | null }>;
  unresolvedAlerts: TeacherDashboardAlertRow[];
}): TeacherStudentSummary[] {
  const masteryByStudent = groupByStudent(masteryRows);
  const sessionsByStudent = groupByStudent(sessions);
  const alertsByStudent = countByStudent(unresolvedAlerts);

  return students
    .map((student) => {
      const studentId = student.id ?? '';
      const studentMastery = masteryByStudent.get(studentId) ?? [];
      const studentSessions = sessionsByStudent.get(studentId) ?? [];
      const completedSessions = studentSessions.filter((session) => session.status === 'completed');
      const lastSession = [...studentSessions].sort((a, b) =>
        String(b.started_at ?? '').localeCompare(String(a.started_at ?? '')),
      )[0];
      const profile = Array.isArray(student.profiles) ? student.profiles[0] : student.profiles;

      return {
        studentId,
        studentName: profile?.preferred_name ?? profile?.full_name ?? 'Student',
        grade: student.grade_level ? `Grade ${student.grade_level}` : 'Grade 2',
        averageMastery: roundRatio(
          average(
            studentMastery
              .map((row) => row.mastery_level)
              .filter((value): value is number => typeof value === 'number'),
            0,
          ),
        ),
        completedSessions: completedSessions.length,
        lastActiveAt: lastSession?.started_at ?? null,
        unresolvedAlerts: alertsByStudent.get(studentId) ?? 0,
      };
    })
    .filter((student) => !!student.studentId)
    .sort((a, b) => {
      if (b.unresolvedAlerts !== a.unresolvedAlerts) {
        return b.unresolvedAlerts - a.unresolvedAlerts;
      }

      return a.averageMastery - b.averageMastery;
    });
}

export async function listTeacherStudentSummaries(
  teacherId: string,
): Promise<TeacherStudentSummary[]> {
  const supabase = createSupabaseAdminClient();
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
    return [];
  }

  const [studentsResult, masteryResult, sessionsResult, alertsResult] = await Promise.all([
    supabase
      .from('students')
      .select('id, grade_level, profiles(full_name, preferred_name)')
      .in('id', studentIds),
    supabase
      .from('student_mastery')
      .select('student_id, mastery_level')
      .in('student_id', studentIds),
    supabase
      .from('learning_sessions')
      .select('student_id, started_at, status')
      .in('student_id', studentIds)
      .order('started_at', { ascending: false }),
    supabase
      .from('tutor_alerts')
      .select('id, student_id')
      .eq('teacher_id', teacherId)
      .eq('is_resolved', false),
  ]);

  for (const result of [studentsResult, masteryResult, sessionsResult, alertsResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  return buildTeacherStudentSummaries({
    students: (studentsResult.data ?? []) as TeacherStudentProfileRow[],
    masteryRows: (masteryResult.data ?? []) as TeacherDashboardMasteryRow[],
    sessions: (sessionsResult.data ?? []) as Array<
      TeacherDashboardSessionRow & { status?: string }
    >,
    unresolvedAlerts: (alertsResult.data ?? []) as TeacherDashboardAlertRow[],
  });
}

export async function getTeacherStudentDetail({
  teacherId,
  studentId,
}: {
  teacherId: string;
  studentId: string;
}): Promise<TeacherStudentDetail | null> {
  const supabase = createSupabaseAdminClient();
  const { data: link, error: linkError } = await supabase
    .from('teacher_student_links')
    .select('student_id')
    .eq('teacher_id', teacherId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (linkError) {
    throw linkError;
  }
  if (!link) {
    return null;
  }

  const [studentResult, masteryResult, sessionsResult, alertsResult] = await Promise.all([
    supabase
      .from('students')
      .select('id, grade_level, profiles(full_name, preferred_name)')
      .eq('id', studentId)
      .maybeSingle(),
    supabase
      .from('student_mastery')
      .select(
        'outcome_id, mastery_level, attempts, correct_attempts, bc_learning_outcomes(outcome_code, content_knowledge)',
      )
      .eq('student_id', studentId)
      .order('mastery_level', { ascending: true })
      .limit(8),
    supabase
      .from('learning_sessions')
      .select('id, lesson_title, status, started_at, accuracy_rate, xp_earned')
      .eq('student_id', studentId)
      .order('started_at', { ascending: false })
      .limit(5),
    supabase
      .from('tutor_alerts')
      .select('id, student_id, alert_type, created_at')
      .eq('teacher_id', teacherId)
      .eq('student_id', studentId)
      .eq('is_resolved', false)
      .order('created_at', { ascending: false }),
  ]);

  for (const result of [studentResult, masteryResult, sessionsResult, alertsResult]) {
    if (result.error) {
      throw result.error;
    }
  }

  const summaries = buildTeacherStudentSummaries({
    students: studentResult.data ? [studentResult.data as TeacherStudentProfileRow] : [],
    masteryRows: (masteryResult.data ?? []).map((row) => ({
      student_id: studentId,
      mastery_level: row.mastery_level as number | null,
    })),
    sessions: (sessionsResult.data ?? []).map((session) => ({
      student_id: studentId,
      started_at: session.started_at as string | null,
      status: session.status as string | null,
    })),
    unresolvedAlerts: (alertsResult.data ?? []) as TeacherDashboardAlertRow[],
  });
  const summary = summaries[0];

  if (!summary) {
    return null;
  }

  return {
    ...summary,
    masteryRows: (masteryResult.data ?? []).map(mapStudentMasteryDetail),
    recentSessions: (sessionsResult.data ?? []).map(mapRecentSession),
    unresolvedAlertSummaries: (alertsResult.data ?? []).map((alert) => ({
      id: String(alert.id),
      alertType: String(alert.alert_type ?? 'mastery_plateau'),
      createdAt: (alert.created_at as string | null) ?? null,
    })),
  };
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

function groupByStudent<T extends { student_id?: string | null }>(rows: T[]) {
  const grouped = new Map<string, T[]>();

  for (const row of rows) {
    if (!row.student_id) continue;
    grouped.set(row.student_id, [...(grouped.get(row.student_id) ?? []), row]);
  }

  return grouped;
}

function countByStudent(rows: Array<{ student_id?: string | null }>) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    if (!row.student_id) continue;
    counts.set(row.student_id, (counts.get(row.student_id) ?? 0) + 1);
  }

  return counts;
}

function mapStudentMasteryDetail(row: Record<string, unknown>) {
  const outcome = Array.isArray(row.bc_learning_outcomes)
    ? row.bc_learning_outcomes[0]
    : row.bc_learning_outcomes;
  const outcomeRecord = (outcome ?? {}) as Record<string, unknown>;

  return {
    outcomeId: String(row.outcome_id ?? ''),
    outcomeCode: String(outcomeRecord.outcome_code ?? 'BC outcome'),
    contentKnowledge: String(outcomeRecord.content_knowledge ?? 'Grade 2 math skill'),
    masteryLevel: roundRatio(Number(row.mastery_level ?? 0)),
    attempts: Number(row.attempts ?? 0),
    correctAttempts: Number(row.correct_attempts ?? 0),
  };
}

function mapRecentSession(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    lessonTitle: String(row.lesson_title ?? 'Grade 2 lesson'),
    status: String(row.status ?? 'planned'),
    startedAt: (row.started_at as string | null) ?? null,
    accuracyRate: typeof row.accuracy_rate === 'number' ? roundRatio(row.accuracy_rate) : null,
    xpEarned: Number(row.xp_earned ?? 0),
  };
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
