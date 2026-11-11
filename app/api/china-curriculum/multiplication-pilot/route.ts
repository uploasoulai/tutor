import { createReviewedLessonApi } from '@/lib/server/reviewed-lesson-api';
import { MULTIPLICATION_PILOT } from '@/lib/curriculum/reviewed-lessons';
export const dynamic = 'force-dynamic';
export const { GET, POST } = createReviewedLessonApi(MULTIPLICATION_PILOT);
