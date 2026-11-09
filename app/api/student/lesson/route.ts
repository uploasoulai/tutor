import { after, NextRequest } from 'next/server';
import { nanoid } from 'nanoid';
import { DEFAULT_GRADE_LABEL, DEFAULT_SUBJECT } from '@/lib/curriculum/grade';
import {
  buildLessonEngineRequirement,
  getOrCreateLessonArtifact,
  syncLessonEngineJob,
  updateLessonEngineJob,
} from '@/lib/curriculum/lesson-artifact';
import { apiError, apiSuccess } from '@/lib/server/api-response';
import {
  createClassroomGenerationJob,
  markClassroomGenerationJobSucceeded,
} from '@/lib/server/classroom-job-store';
import { runClassroomGenerationJob } from '@/lib/server/classroom-job-runner';
import { buildRequestOrigin } from '@/lib/server/classroom-storage';
import {
  describeCurriculumLesson,
  findCurriculumLessonArtifact,
} from '@/lib/server/curriculum-lesson-cache';
import { resolveLessonEngineMediaFlags } from '@/lib/server/lesson-engine-media-flags';
import { createClient } from '@/lib/supabase/server';
import { resolveTeacherPersonaPreference } from '@/lib/curriculum/teacher-personas';
import { assertPlatformAiWithinLimit } from '@/lib/server/platform-ai-usage';

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
    const teacherPersona = resolveTeacherPersonaPreference(user.user_metadata);
    let artifact = await getOrCreateLessonArtifact({
      studentId: user.id,
      grade: body.grade ?? DEFAULT_GRADE_LABEL,
      subject,
      title,
      outcomeId: body.outcomeId,
      outcomeCode: body.outcomeCode,
      sessionId: body.sessionId,
      teacherPersona,
    });

    if (!artifact.payload.lessonEngine) {
      const baseUrl = buildRequestOrigin(req);
      const jobId = nanoid(10);
      const requirement = buildLessonEngineRequirement(artifact.payload);
      const mediaFlags = resolveLessonEngineMediaFlags({
        userId: user.id,
        email: user.email,
      });
      const curriculumLessonCache = Object.values(mediaFlags).some(Boolean)
        ? undefined
        : describeCurriculumLesson({
            track: 'bc',
            canonicalId: `${artifact.payload.bc_context.grade}:${artifact.payload.bc_context.subject}:${artifact.payload.bc_context.outcome_code || artifact.payload.bc_context.knowledge_point}`,
            requirement,
          });
      const reusableLesson = curriculumLessonCache
        ? await findCurriculumLessonArtifact(curriculumLessonCache.cacheKey)
        : null;
      if (!reusableLesson) await assertPlatformAiWithinLimit(user.id);
      const generationInput = {
        requirement,
        ...(curriculumLessonCache ? { curriculumLessonCache } : {}),
        ...mediaFlags,
        agentMode: 'default' as const,
      };
      const job = await createClassroomGenerationJob(jobId, generationInput, user.id);
      const classroomUrl = reusableLesson ? `${baseUrl}/classroom/${reusableLesson.id}` : undefined;
      const lessonEngine = {
        jobId,
        status: reusableLesson ? ('succeeded' as const) : job.status,
        pollUrl: `${baseUrl}/api/generate-classroom/${jobId}`,
        pollIntervalMs: 5000,
        requirement,
        ...(reusableLesson && classroomUrl ? { classroomId: reusableLesson.id, classroomUrl } : {}),
        createdAt: job.createdAt,
      };
      if (reusableLesson && classroomUrl) {
        await markClassroomGenerationJobSucceeded(jobId, {
          id: reusableLesson.id,
          url: classroomUrl,
          stage: reusableLesson.stage,
          scenes: reusableLesson.scenes,
          scenesCount: reusableLesson.scenes.length,
          createdAt: reusableLesson.createdAt,
        });
      }
      const payload = await updateLessonEngineJob({
        sessionId: artifact.sessionId,
        payload: artifact.payload,
        lessonEngine,
      });

      artifact = {
        ...artifact,
        lessonId: jobId,
        payload,
      };

      if (!reusableLesson) {
        after(() =>
          runClassroomGenerationJob(jobId, generationInput, baseUrl, { billingUserId: user.id }),
        );
      }
    } else {
      const synced = await syncLessonEngineJob({
        studentId: user.id,
        sessionId: artifact.sessionId,
      });
      artifact = {
        ...artifact,
        payload: synced.payload,
        lessonId:
          synced.payload.lessonEngine?.classroomId ??
          synced.payload.lessonEngine?.jobId ??
          artifact.lessonId,
      };
    }

    return apiSuccess(artifact);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Lesson generation failed';
    if (message.startsWith('platform_usage_limit_reached:')) {
      return apiError(
        'PLATFORM_USAGE_LIMIT_REACHED',
        402,
        message.replace(/^platform_usage_limit_reached:\s*/, ''),
      );
    }
    if (message.startsWith('PLATFORM_AI_NOT_CONFIGURED:')) {
      return apiError(
        'PLATFORM_AI_NOT_CONFIGURED',
        503,
        message.replace(/^PLATFORM_AI_NOT_CONFIGURED:\s*/, ''),
      );
    }
    if (message.includes('VOYAGE_API_KEY')) {
      return apiError('MISSING_API_KEY', 400, message);
    }

    return apiError('INTERNAL_ERROR', 500, message);
  }
}
