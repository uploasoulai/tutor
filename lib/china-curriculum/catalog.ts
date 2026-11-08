import 'server-only';

import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

export type ChinaTopic = {
  id: string;
  name: string;
  domain: string;
  grade: number;
  semester: string;
  chapter: string;
  type: string;
  description: string;
  mastery_criteria: string[];
  diagnostic_question?: { question: string; answer: string };
  external: boolean;
  standards: { id: string; confidence?: string }[];
  root_reason?: string;
  subject?: string;
  mathLinks?: string[];
};

export type ChinaDependency = {
  topicId: string;
  prerequisiteId: string;
  strength: 'hard' | 'soft';
  reason: string;
};

export type ChinaQuestion = {
  id: string;
  topicId: string;
  difficulty: string;
  type: string;
  prompt: string;
  answer: string;
  explanation?: string;
  verify?: string;
  choices?: { key: string; text: string }[];
  accept?: string[];
};

export type ChinaTextbookEntry = {
  topicId: string;
  grade: number;
  term: string;
  unit: string;
  chapter?: string;
  note?: string;
};

export type ChinaTextbookMapping = {
  edition: string;
  label: string;
  status: 'draft' | 'example' | string;
  source?: string;
  entries: ChinaTextbookEntry[];
};

export const CHINA_SUBJECTS: Record<string, string> = {
  math: '数学',
  english: '英语',
  physics: '物理',
  chinese: '语文',
  science: '科学',
  morality: '道德与法治',
  history: '历史',
  geography: '地理',
  biology: '生物学',
  chemistry: '化学',
};

function subjectOf(topic: ChinaTopic): string {
  if (topic.subject) return topic.subject === 'cnm' ? 'math' : topic.subject;
  const prefix = topic.id.slice(0, 3);
  if (prefix === 'cnm') return 'math';
  if (prefix === 'cne') return 'english';
  if (prefix === 'cnp') return 'physics';
  if (prefix === 'cnc') return 'chinese';
  if (prefix === 'cns') return 'science';
  if (prefix === 'cnd') return 'morality';
  if (prefix === 'cnh') return 'history';
  if (prefix === 'cng') return 'geography';
  if (prefix === 'cnb') return 'biology';
  if (prefix === 'cnk') return 'chemistry';
  return 'other';
}

const dataRoot = path.join(process.cwd(), 'curriculum_data', 'china');
let topicsPromise: Promise<ChinaTopic[]> | undefined;
let dependenciesPromise: Promise<ChinaDependency[]> | undefined;
let questionsPromise: Promise<ChinaQuestion[]> | undefined;
let standardsPromise: Promise<unknown> | undefined;
let textbookMappingsPromise: Promise<ChinaTextbookMapping[]> | undefined;

async function readJson<T>(name: string): Promise<T> {
  const content = await readFile(path.join(dataRoot, name), 'utf8');
  return JSON.parse(content) as T;
}

export function getChinaTopics() {
  topicsPromise ??= readJson<ChinaTopic[]>('topics.json');
  return topicsPromise;
}

export function getChinaDependencies() {
  dependenciesPromise ??= readJson<ChinaDependency[]>('dependencies.json');
  return dependenciesPromise;
}

export function getChinaQuestions() {
  questionsPromise ??= readJson<ChinaQuestion[]>('questions.json');
  return questionsPromise;
}

export function getChinaStandards() {
  standardsPromise ??= readJson<unknown>('standards.json');
  return standardsPromise;
}

export function getChinaTextbookMappings() {
  textbookMappingsPromise ??= (async () => {
    const directory = path.join(dataRoot, 'mappings');
    const files = (await readdir(directory)).filter((file) => file.endsWith('.json'));
    const mappings = await Promise.all(
      files.map((file) => readJson<ChinaTextbookMapping>(path.join('mappings', file))),
    );
    return mappings.filter((mapping) => mapping.status !== 'example');
  })();
  return textbookMappingsPromise;
}

export function chinaTopicSubject(topic: ChinaTopic) {
  return subjectOf(topic);
}

export function chinaGradeLabel(grade: number, subject?: string | null) {
  if (grade <= 6) return `小学${grade}年级`;
  if (grade <= 9) return `初中${grade - 6}年级`;
  if (subject === 'math') {
    if (grade <= 11) return `高中${grade - 9}年级 · 必修`;
    return `高中选择性必修${grade - 11}`;
  }
  if (subject === 'english') {
    if (grade <= 12) return `高中必修${grade - 9}`;
    return `高中选择性必修${grade - 12}`;
  }
  if (subject === 'physics') {
    if (grade <= 12) return `高中必修${grade - 9}`;
    return `高中选择性必修${grade - 12}`;
  }
  if (grade <= 12) return `高中${grade - 9}年级`;
  return `高中选择性必修${grade - 12}`;
}

export async function getChinaTopicById(id: string) {
  const topics = await getChinaTopics();
  return topics.find((topic) => topic.id === id) ?? null;
}

export async function getChinaTopicDetails(id: string, editionId?: string | null) {
  const [topics, dependencies, questions, standards, mappings] = await Promise.all([
    getChinaTopics(),
    getChinaDependencies(),
    getChinaQuestions(),
    getChinaStandards(),
    getChinaTextbookMappings(),
  ]);
  const baseTopic = topics.find((candidate) => candidate.id === id);
  if (!baseTopic) return null;
  const subject = subjectOf(baseTopic);
  const requestedMapping = editionId
    ? mappings.find((item) => item.edition === editionId)
    : undefined;
  if (editionId && !requestedMapping) return null;
  const entry = requestedMapping?.entries.find((item) => item.topicId === id);
  const mapping = entry ? requestedMapping : undefined;
  const topic = entry
    ? {
        ...baseTopic,
        grade: entry.grade,
        semester: entry.term,
        chapter: `${entry.unit}${entry.chapter ? ` · ${entry.chapter}` : ''}`,
      }
    : baseTopic;

  const byId = new Map(topics.map((candidate) => [candidate.id, candidate]));
  const prerequisites = dependencies
    .filter((edge) => edge.topicId === id)
    .map((edge) => ({ ...edge, topic: byId.get(edge.prerequisiteId) ?? null }));
  const nextTopics = dependencies
    .filter((edge) => edge.prerequisiteId === id)
    .map((edge) => ({ ...edge, topic: byId.get(edge.topicId) ?? null }));

  const standardMap = new Map<string, unknown>();
  function collectStandards(value: unknown) {
    if (Array.isArray(value)) {
      for (const item of value) collectStandards(item);
    } else if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (typeof record.id === 'string') standardMap.set(record.id, record);
      for (const nested of Object.values(record)) collectStandards(nested);
    }
  }
  collectStandards(standards);

  return {
    topic: {
      ...topic,
      gradeLabel: chinaGradeLabel(topic.grade, subject),
      subjectId: subject,
    },
    subject,
    textbook: mapping
      ? { id: mapping.edition, label: mapping.label, status: mapping.status, note: entry?.note }
      : { id: 'pep', label: '人教版主图谱', status: 'current' },
    prerequisites,
    nextTopics,
    questions: questions.filter((question) => question.topicId === id),
    standards: topic.standards.map((standard) => ({
      ...standard,
      detail: standardMap.get(standard.id) ?? null,
    })),
  };
}
