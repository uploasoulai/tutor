import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export type TutorAlertType =
  | 'triple_failure'
  | 'missed_sessions'
  | 'low_engagement'
  | 'mastery_plateau';

export interface TutorAlertDecision {
  shouldAlert: boolean;
  alertType: TutorAlertType;
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

export interface TutorAlertSummary {
  id: string;
  studentId: string;
  studentName: string;
  grade: string;
  alertType: TutorAlertType;
  severity: 'low' | 'medium' | 'high';
  issue: string;
  createdAt: string;
}

export function decideTutorAlert({
  correctCount,
  attempts,
  accuracyRate,
  durationSeconds,
}: {
  correctCount: number;
  attempts: number;
  accuracyRate: number;
  durationSeconds?: number;
}): TutorAlertDecision {
  if (attempts >= 3 && correctCount === 0) {
    return {
      shouldAlert: true,
      alertType: 'triple_failure',
      severity: 'high',
      reason: 'Missed three or more questions in the lesson',
    };
  }

  if (attempts >= 3 && accuracyRate < 0.5) {
    return {
      shouldAlert: true,
      alertType: 'triple_failure',
      severity: 'medium',
      reason: 'Accuracy stayed below 50% after multiple attempts',
    };
  }

  if (durationSeconds != null && durationSeconds < 45 && attempts <= 1) {
    return {
      shouldAlert: true,
      alertType: 'low_engagement',
      severity: 'low',
      reason: 'Lesson ended quickly with little practice',
    };
  }

  return {
    shouldAlert: false,
    alertType: 'mastery_plateau',
    severity: 'low',
    reason: 'No tutor alert needed',
  };
}

export async function createTutorAlertForLesson({
  studentId,
  correctCount,
  attempts,
  accuracyRate,
  durationSeconds,
}: {
  studentId: string;
  correctCount: number;
  attempts: number;
  accuracyRate: number;
  durationSeconds?: number;
}) {
  const decision = decideTutorAlert({
    correctCount,
    attempts,
    accuracyRate,
    durationSeconds,
  });

  if (!decision.shouldAlert) {
    return { created: false, decision };
  }

  const supabase = createSupabaseAdminClient();
  const teacherId = await findPrimaryTeacherId(studentId);
  const existingQuery = supabase
    .from('tutor_alerts')
    .select('id')
    .eq('student_id', studentId)
    .eq('alert_type', decision.alertType)
    .eq('is_resolved', false)
    .limit(1);
  const { data: existing, error: existingError } = teacherId
    ? await existingQuery.eq('teacher_id', teacherId).maybeSingle()
    : await existingQuery.is('teacher_id', null).maybeSingle();

  if (existingError) {
    throw existingError;
  }
  if (existing) {
    return { created: false, alertId: existing.id as string, decision };
  }

  const { data: inserted, error: insertError } = await supabase
    .from('tutor_alerts')
    .insert({
      student_id: studentId,
      teacher_id: teacherId,
      alert_type: decision.alertType,
      is_resolved: false,
    })
    .select('id')
    .single();

  if (insertError) {
    throw insertError;
  }

  return { created: true, alertId: inserted.id as string, decision };
}

export async function listTeacherTutorAlerts(teacherId: string): Promise<TutorAlertSummary[]> {
  const supabase = createSupabaseAdminClient();
  const { data: alerts, error } = await supabase
    .from('tutor_alerts')
    .select(
      'id, student_id, alert_type, created_at, students(grade_level, profiles(full_name, preferred_name))',
    )
    .eq('teacher_id', teacherId)
    .eq('is_resolved', false)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw error;
  }

  return (alerts ?? []).map((alert) => mapTutorAlert(alert as TutorAlertRow));
}

async function findPrimaryTeacherId(studentId: string) {
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from('teacher_student_links')
    .select('teacher_id')
    .eq('student_id', studentId)
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.teacher_id as string | undefined) ?? null;
}

type TutorAlertRow = {
  id: string;
  student_id: string;
  alert_type: TutorAlertType;
  created_at: string;
  students?:
    | {
        grade_level?: number | null;
        profiles?:
          | { full_name?: string | null; preferred_name?: string | null }
          | { full_name?: string | null; preferred_name?: string | null }[]
          | null;
      }
    | {
        grade_level?: number | null;
        profiles?:
          | { full_name?: string | null; preferred_name?: string | null }
          | { full_name?: string | null; preferred_name?: string | null }[]
          | null;
      }[]
    | null;
};

function mapTutorAlert(alert: TutorAlertRow): TutorAlertSummary {
  const student = Array.isArray(alert.students) ? alert.students[0] : alert.students;
  const profile = Array.isArray(student?.profiles) ? student?.profiles[0] : student?.profiles;
  const decision = decisionForAlertType(alert.alert_type);

  return {
    id: alert.id,
    studentId: alert.student_id,
    studentName: profile?.preferred_name ?? profile?.full_name ?? 'Student',
    grade: student?.grade_level ? `Grade ${student.grade_level}` : 'Grade 2',
    alertType: alert.alert_type,
    severity: decision.severity,
    issue: decision.reason,
    createdAt: alert.created_at,
  };
}

function decisionForAlertType(alertType: TutorAlertType) {
  if (alertType === 'triple_failure') {
    return {
      severity: 'high' as const,
      reason: 'Needs review after repeated missed answers',
    };
  }
  if (alertType === 'low_engagement') {
    return {
      severity: 'low' as const,
      reason: 'May need help staying engaged with practice',
    };
  }

  return {
    severity: 'medium' as const,
    reason: 'Mastery has not moved after recent practice',
  };
}
