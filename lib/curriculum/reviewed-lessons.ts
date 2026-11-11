import { FRACTIONS_HYBRID } from './hybrid-fractions';
export interface ReviewedLessonDefinition {
  id: string;
  topicId: string;
  title: string;
  grade: number;
  path: string;
  mediaAsset: string;
  questionIds: readonly string[];
}
export const MULTIPLICATION_PILOT: ReviewedLessonDefinition = {
  id: 'multiplication-reviewed-v1',
  topicId: 'cnm_p038',
  grade: 2,
  title: '二年级数学 · 乘法的初步认识 · 配音互动试课',
  path: '/school-learning/china/multiplication-lab',
  mediaAsset: '/lessons/multiplication-narrated-v1.html',
  questionIds: ['cnm_p038_q2', 'cnm_p038_q3'],
};
export const REVIEWED_LESSONS: ReviewedLessonDefinition[] = [
  {
    ...FRACTIONS_HYBRID,
    grade: 3,
    path: '/school-learning/china/fractions-lab',
    mediaAsset: '/lessons/fractions-narrated-v2.html',
  },
  MULTIPLICATION_PILOT,
];
export function reviewedLessonById(id: unknown) {
  return REVIEWED_LESSONS.find((lesson) => lesson.id === id);
}
export function hasReviewedAssessment(lesson: ReviewedLessonDefinition, ids: readonly string[]) {
  return lesson.questionIds.every((id) => ids.includes(id));
}
