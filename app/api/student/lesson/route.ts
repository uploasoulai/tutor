import { after, NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import {
  buildOpenMAICRequirement,
  getOrCreateLessonArtifact,
  updateLessonOpenMAICJob,
} from '@/lib/curriculum/lesson-artifact';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import { createClassroomGenerationJob } from '@/lib/server/classroom-job-store';
import { runClassroomGenerationJob } from '@/lib/server/classroom-job-runner';
import { buildRequestOrigin } from '@/lib/server/classroom-storage';
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
    let artifact = await getOrCreateLessonArtifact({
      studentId: user.id,
      grade: body.grade ?? DEFAULT_GRADE_LABEL,
      subject,
      title,
      outcomeId: body.outcomeId,
      outcomeCode: body.outcomeCode,
      sessionId: body.sessionId,
    });

    if (!artifact.payload.openmaic) {
      const baseUrl = buildRequestOrigin(req);
      const jobId = nanoid(10);
      const requirement = buildOpenMAICRequirement(artifact.payload);
      const generationInput = {
        requirement,
        enableImageGeneration: false,
        enableVideoGeneration: false,
        enableTTS: false,
        agentMode: 'default' as const,
      };
      const job = await createClassroomGenerationJob(jobId, generationInput);
      const openmaic = {
        jobId,
        status: job.status,
        pollUrl: `${baseUrl}/api/generate-classroom/${jobId}`,
        pollIntervalMs: 5000,
        requirement,
        createdAt: job.createdAt,
      };
      const payload = await updateLessonOpenMAICJob({
        sessionId: artifact.sessionId,
        payload: artifact.payload,
        openmaic,
      });

      artifact = {
        ...artifact,
        lessonId: jobId,
        payload,
      };

      after(() => runClassroomGenerationJob(jobId, generationInput, baseUrl));
    }

    return apiSuccess(artifact);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lesson generation failed';
    if (message.includes('VOYAGE_API_KEY')) {
      return apiError('MISSING_API_KEY', 400, message);
    }

    return apiError('INTERNAL_ERROR', 500, message);
  }
}
