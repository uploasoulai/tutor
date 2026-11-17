import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { libraryCourse, canReadLibraryCourse } from '@/lib/server/course-library';
import { publicAssessmentQuestions, type PaperQuestion } from './assessments';

export type PreparedQuestion = PaperQuestion & {
  explanation: string;
  promptAudioId: string;
  choiceAudioIds?: string[];
  explanationAudioId: string;
};
export type PreparedLesson = {
  id: string;
  title: string;
  topicId: string;
  grade: number;
  subject: string;
  term: '上';
  sourceLessonId: string;
  sourceContentSha256: string;
  activity: string;
  status: string;
  blocks: { id: string; label: string; text: string; audioId: string }[];
  questions: PreparedQuestion[];
  bindings: {
    assetId: string;
    textSha256: string;
    text: string;
    purpose: string;
    lessonId: string;
  }[];
};
export type PreparedAsset = {
  id: string;
  key: string;
  bytes: number;
  sha256: string;
  format: string;
  language: string;
  sourcePath: string;
};
export type PreparedCatalog = {
  schemaVersion: number;
  id: string;
  source: Record<string, unknown>;
  lessons: PreparedLesson[];
  assets: PreparedAsset[];
};
let loaded: Promise<PreparedCatalog> | undefined;
export function preparedCatalog(): Promise<PreparedCatalog> {
  return (loaded ??= readFile(
    path.join(process.cwd(), 'curriculum_data/china/prepared/grade2-multiplication-v1.json'),
    'utf8',
  ).then((raw) => JSON.parse(raw)));
}
export async function readablePreparedLesson(id: string, userId: string, review = false) {
  const catalog = await preparedCatalog(),
    lesson = catalog.lessons.find((l) => l.id === id);
  if (!lesson) return null;
  const { row } = await libraryCourse(id);
  if (
    !row ||
    !canReadLibraryCourse(row, userId, review) ||
    row.status === 'retired' ||
    row.checks.pass !== true ||
    (row.checks as { courseContractSha256?: string }).courseContractSha256 !==
      createHash('sha256').update(JSON.stringify(lesson)).digest('hex')
  )
    return null;
  // A withdrawal gates both content and all media routes. Source data stays immutable.
  return lesson;
}
export function publicPreparedLesson(lesson: PreparedLesson) {
  return {
    id: lesson.id,
    title: lesson.title,
    topicId: lesson.topicId,
    grade: lesson.grade,
    activity: lesson.activity,
    blocks: lesson.blocks,
    questions: publicAssessmentQuestions(lesson.questions).map((q, i) => ({
      ...q,
      promptAudioId: lesson.questions[i].promptAudioId,
      choiceAudioIds: lesson.questions[i].choiceAudioIds,
    })),
    version: 'v1',
    status: 'testing',
  };
}
export function validMediaBinding(lesson: PreparedLesson, assetId: string) {
  const currentTexts = new Set([
    ...lesson.blocks.filter((b) => b.audioId === assetId).map((b) => b.text),
    ...lesson.questions.flatMap((q) => [
      ...(q.promptAudioId === assetId ? [q.prompt] : []),
      ...(q.explanationAudioId === assetId ? [q.explanation] : []),
      ...(q.choices ?? []).filter((_, i) => q.choiceAudioIds?.[i] === assetId).map((c) => c.text),
    ]),
  ]);
  return lesson.bindings.filter(
    (b) =>
      b.assetId === assetId &&
      currentTexts.has(b.text) &&
      createHash('sha256').update(b.text).digest('hex') === b.textSha256,
  );
}
