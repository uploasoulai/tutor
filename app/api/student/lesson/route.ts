import { NextRequest } from 'next/server';
import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import { getOrCreateLessonArtifact } from '@/lib/curriculum/lesson-artifact';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return apiError('INVALID_REQUEST', 401, 'Authentication required');
    }

    const body = (await req.json()) as {
      grade?: string;
      subject?: string;
      title?: string;
      outcomeId?: string;
      outcomeCode?: string;
      sessionId?: string;
    };

    const subject = body.subject ?? DEFAULT_SUBJECT;
    const title = body.title ?? subject;
    const artifact = await getOrCreateLessonArtifact({
      studentId: user.id,
      grade: body.grade ?? DEFAULT_GRADE_LABEL,
      subject,
      title,
      outcomeId: body.outcomeId,
      outcomeCode: body.outcomeCode,
      sessionId: body.sessionId,
    });

    return apiSuccess(artifact);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lesson generation failed';
    if (message.includes('VOYAGE_API_KEY')) {
      return apiError('MISSING_API_KEY', 400, message);
    }

    return apiError('INTERNAL_ERROR', 500, message);
  }
}
