import { createReviewedLessonApi } from '@/lib/server/reviewed-lesson-api';
import { REVIEWED_LESSONS } from '@/lib/curriculum/reviewed-lessons';
export const dynamic = 'force-dynamic';
export const { GET, POST } = createReviewedLessonApi(REVIEWED_LESSONS[0]);
