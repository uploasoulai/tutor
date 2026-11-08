import { NextRequest } from 'next/server';

import { resolveAccountRole } from '@/lib/auth/account-role';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return apiError('INVALID_REQUEST', 401, 'Authentication required');
    if ((await resolveAccountRole(user)) !== 'student') {
      return apiError('INVALID_REQUEST', 403, 'Only a learner can complete this lesson');
    }

    const body = (await request.json()) as { sessionId?: string };
    if (!body.sessionId) return apiError('MISSING_REQUIRED_FIELD', 400, 'sessionId is required');

    const admin = createSupabaseAdminClient();
    const { data: session, error: readError } = await admin
      .from('learning_sessions')
      .select('id,lesson_payload,status')
      .eq('id', body.sessionId)
      .eq('student_id', user.id)
      .maybeSingle();
    if (readError) throw readError;
    if (!session) return apiError('INVALID_REQUEST', 404, 'Learning session not found');

    const payload = session.lesson_payload as {
      curriculumTrack?: string;
      classroomUrl?: string;
      completedAt?: string;
    } | null;
    if (payload?.curriculumTrack !== 'china' || !payload.classroomUrl) {
      return apiError(
        'INVALID_REQUEST',
        409,
        'Finish the generated classroom before recording completion',
      );
    }

    const completedAt = new Date().toISOString();
    const { error: updateError } = await admin
      .from('learning_sessions')
      .update({
        status: 'completed',
        ended_at: completedAt,
        lesson_payload: { ...payload, completedAt },
      })
      .eq('id', session.id)
      .eq('student_id', user.id);
    if (updateError) throw updateError;

    return apiSuccess({ sessionId: session.id, status: 'completed' });
  } catch (error) {
    return apiError(
      'INTERNAL_ERROR',
      500,
      error instanceof Error ? error.message : 'Could not save lesson completion',
    );
  }
}
