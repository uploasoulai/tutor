import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export interface DailyReportSession {
  id: string;
  lesson_title?: string | null;
  duration_seconds?: number | null;
  accuracy_rate?: number | null;
  xp_earned?: number | null;
  needs_tutor_review?: boolean | null;
  started_at?: string | null;
  ended_at?: string | null;
  status?: string | null;
}

export interface DailyReportAttempt {
  is_correct?: boolean | null;
  hint_level_used?: number | null;
  outcome_id?: string | null;
  created_at?: string | null;
}

export interface DailyReportMastery {
  mastery_level?: number | null;
  outcome_id?: string | null;
}

export interface DailyReportMetrics {
  date: string;
  sessionsCompleted: number;
  learningMinutes: number;
  averageAccuracy: number;
  xpEarned: number;
  questionsAnswered: number;
  correctAnswers: number;
  masteryAverage: number;
  needsTutorReview: boolean;
  strengths: string[];
  focusAreas: string[];
}

interface BuildDailyReportMetricsInput {
  sessions: DailyReportSession[];
  attempts: DailyReportAttempt[];
  masteryRows: DailyReportMastery[];
  date: string;
}

interface BuildDailyReportSummaryInput {
  studentName: string;
  grade?: string;
  subject?: string;
  metrics: DailyReportMetrics;
}

export interface ParentDailyReport {
  id: string;
  parentId: string;
  studentId: string;
  reportType: 'daily';
  summaryText: string;
  metrics: DailyReportMetrics;
  deliveryStatus: string;
  createdAt: string;
}

export function buildDailyReportMetrics({
  sessions,
  attempts,
  masteryRows,
  date,
}: BuildDailyReportMetricsInput): DailyReportMetrics {
  const completedSessions = sessions.filter((session) => session.status === 'completed');
  const sessionAccuracy = sessions
    .map((session) => session.accuracy_rate)
    .filter((accuracy): accuracy is number => typeof accuracy === 'number');
  const correctAnswers = attempts.filter((attempt) => attempt.is_correct).length;
  const masteryValues = masteryRows
    .map((row) => row.mastery_level)
    .filter((mastery): mastery is number => typeof mastery === 'number');
  const averageAccuracy =
    attempts.length > 0
      ? correctAnswers / attempts.length
      : average(sessionAccuracy, completedSessions.length > 0 ? 0 : 0);
  const masteryAverage = average(masteryValues, 0);
  const learningMinutes = Math.round(
    sessions.reduce((total, session) => total + (session.duration_seconds ?? 0), 0) / 60,
  );
  const xpEarned = sessions.reduce((total, session) => total + (session.xp_earned ?? 0), 0);
  const usedHints = attempts.filter((attempt) => (attempt.hint_level_used ?? 0) > 0).length;
  const needsTutorReview =
    sessions.some((session) => session.needs_tutor_review) ||
    (attempts.length >= 3 && averageAccuracy < 0.5);

  return {
    date,
    sessionsCompleted: completedSessions.length,
    learningMinutes,
    averageAccuracy: roundRatio(averageAccuracy),
    xpEarned,
    questionsAnswered: attempts.length,
    correctAnswers,
    masteryAverage: roundRatio(masteryAverage),
    needsTutorReview,
    strengths: buildStrengths({
      learningMinutes,
      averageAccuracy,
      masteryAverage,
      xpEarned,
      completedSessions: completedSessions.length,
    }),
    focusAreas: buildFocusAreas({
      questionsAnswered: attempts.length,
      averageAccuracy,
      usedHints,
      needsTutorReview,
    }),
  };
}

export function buildDailyReportSummary({
  studentName,
  grade = DEFAULT_GRADE_LABEL,
  subject = DEFAULT_SUBJECT,
  metrics,
}: BuildDailyReportSummaryInput): string {
  const subjectLabel = subject || DEFAULT_SUBJECT;

  if (metrics.sessionsCompleted === 0 && metrics.questionsAnswered === 0) {
    return `${studentName} has no completed ${grade} ${subjectLabel} learning activity recorded for ${metrics.date} yet. The next lesson can continue from the current Grade 2 priority plan when they return.`;
  }

  const accuracy = `${Math.round(metrics.averageAccuracy * 100)}%`;
  const mastery = `${Math.round(metrics.masteryAverage * 100)}%`;
  const activity = `${metrics.learningMinutes} minutes, ${metrics.questionsAnswered} questions, and ${metrics.xpEarned} XP`;
  const strength =
    metrics.strengths[0] ?? `steady progress in ${grade} ${subjectLabel.toLowerCase()}`;
  const focus = metrics.focusAreas[0] ?? 'the next recommended Grade 2 skill';
  const review = metrics.needsTutorReview
    ? ' A tutor review is recommended because today showed signs of struggle.'
    : '';

  return `${studentName} worked on ${grade} ${subjectLabel} today: ${activity}. Accuracy was ${accuracy}, with current mastery averaging ${mastery}. Strong point: ${strength}. Next focus: ${focus}.${review}`;
}

export async function generateParentDailyReport({
  parentId,
  studentId,
  date = new Date(),
}: {
  parentId: string;
  studentId: string;
  date?: Date;
}): Promise<ParentDailyReport> {
  const supabase = createSupabaseAdminClient();
  const { dayStart, dayEnd, dateKey } = getDayRange(date);

  const { data: link, error: linkError } = await supabase
    .from('parent_student_links')
    .select('student_id')
    .eq('parent_id', parentId)
    .eq('student_id', studentId)
    .maybeSingle();

  if (linkError) {
    throw new Error(linkError.message);
  }
  if (!link) {
    throw new Error('Parent is not linked to this student');
  }

  const [studentResult, sessionsResult, attemptsResult, masteryResult, existingResult] =
    await Promise.all([
      supabase
        .from('students')
        .select('grade_level, profiles(full_name, preferred_name)')
        .eq('id', studentId)
        .maybeSingle(),
      supabase
        .from('learning_sessions')
        .select(
          'id, lesson_title, duration_seconds, accuracy_rate, xp_earned, needs_tutor_review, started_at, ended_at, status',
        )
        .eq('student_id', studentId)
        .gte('started_at', dayStart.toISOString())
        .lt('started_at', dayEnd.toISOString())
        .order('started_at', { ascending: false }),
      supabase
        .from('question_attempts')
        .select('is_correct, hint_level_used, outcome_id, created_at')
        .eq('student_id', studentId)
        .gte('created_at', dayStart.toISOString())
        .lt('created_at', dayEnd.toISOString()),
      supabase
        .from('student_mastery')
        .select('mastery_level, outcome_id')
        .eq('student_id', studentId),
      supabase
        .from('parent_reports')
        .select('id')
        .eq('parent_id', parentId)
        .eq('student_id', studentId)
        .eq('report_type', 'daily')
        .gte('created_at', dayStart.toISOString())
        .lt('created_at', dayEnd.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  for (const result of [
    studentResult,
    sessionsResult,
    attemptsResult,
    masteryResult,
    existingResult,
  ]) {
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  const profile = readStudentProfile(studentResult.data);
  const grade = profile.grade ? `Grade ${profile.grade}` : DEFAULT_GRADE_LABEL;
  const metrics = buildDailyReportMetrics({
    sessions: (sessionsResult.data ?? []) as DailyReportSession[],
    attempts: (attemptsResult.data ?? []) as DailyReportAttempt[],
    masteryRows: (masteryResult.data ?? []) as DailyReportMastery[],
    date: dateKey,
  });
  const summaryText = buildDailyReportSummary({
    studentName: profile.name,
    grade,
    subject: DEFAULT_SUBJECT,
    metrics,
  });
  const payload = {
    parent_id: parentId,
    student_id: studentId,
    report_type: 'daily',
    summary_text: summaryText,
    metrics,
    delivery_status: 'generated',
  };
  const existingId = existingResult.data?.id as string | undefined;
  const reportQuery = existingId
    ? supabase.from('parent_reports').update(payload).eq('id', existingId).select('*').single()
    : supabase.from('parent_reports').insert(payload).select('*').single();
  const { data: report, error: reportError } = await reportQuery;

  if (reportError) {
    throw new Error(reportError.message);
  }

  return mapParentReport(report);
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

function buildStrengths({
  learningMinutes,
  averageAccuracy,
  masteryAverage,
  xpEarned,
  completedSessions,
}: {
  learningMinutes: number;
  averageAccuracy: number;
  masteryAverage: number;
  xpEarned: number;
  completedSessions: number;
}) {
  const strengths: string[] = [];

  if (completedSessions > 0) strengths.push('finished the planned lesson');
  if (learningMinutes >= 15) strengths.push('kept a solid learning rhythm');
  if (averageAccuracy >= 0.75) strengths.push('answered most quiz questions correctly');
  if (masteryAverage >= 0.7) strengths.push('maintained strong mastery across active skills');
  if (xpEarned >= 20) strengths.push('earned meaningful practice XP');

  return strengths.slice(0, 3);
}

function buildFocusAreas({
  questionsAnswered,
  averageAccuracy,
  usedHints,
  needsTutorReview,
}: {
  questionsAnswered: number;
  averageAccuracy: number;
  usedHints: number;
  needsTutorReview: boolean;
}) {
  const focusAreas: string[] = [];

  if (questionsAnswered === 0) focusAreas.push('complete the next short quiz');
  if (averageAccuracy < 0.7 && questionsAnswered > 0) focusAreas.push('revisit missed examples');
  if (usedHints >= 2) focusAreas.push('practice with fewer hints');
  if (needsTutorReview) focusAreas.push('ask a tutor to review confusing steps');

  return focusAreas.slice(0, 3);
}

function getDayRange(date: Date) {
  const dayStart = new Date(date);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  return {
    dayStart,
    dayEnd,
    dateKey: dayStart.toISOString().slice(0, 10),
  };
}

function readStudentProfile(
  student: {
    grade_level?: number | null;
    profiles?:
      | { full_name?: string | null; preferred_name?: string | null }
      | { full_name?: string | null; preferred_name?: string | null }[]
      | null;
  } | null,
) {
  const profile = Array.isArray(student?.profiles) ? student?.profiles[0] : student?.profiles;

  return {
    grade: student?.grade_level ?? 2,
    name: profile?.preferred_name ?? profile?.full_name ?? 'Your child',
  };
}

function mapParentReport(report: Record<string, unknown>): ParentDailyReport {
  return {
    id: String(report.id),
    parentId: String(report.parent_id),
    studentId: String(report.student_id),
    reportType: 'daily',
    summaryText: String(report.summary_text ?? ''),
    metrics: report.metrics as DailyReportMetrics,
    deliveryStatus: String(report.delivery_status ?? 'generated'),
    createdAt: String(report.created_at ?? new Date().toISOString()),
  };
}
