import type { ChinaTopic, ChinaQuestion } from '@/lib/china-curriculum/catalog';

export type AssessmentConfig = {
  grade: number;
  subject: string;
  term: '上' | '下';
  scope: 'unit' | 'midterm' | 'final';
  unit?: string;
  count: number;
  preparedLessonId?: string;
};
export type PaperQuestion = Pick<
  ChinaQuestion,
  'id' | 'topicId' | 'type' | 'prompt' | 'answer' | 'accept' | 'choices'
> & { topicName: string; explanation?: string; explanationAudioId?: string };
export function assessmentSubject(topic: ChinaTopic) {
  return topic.subject === 'cnm' || (!topic.subject && topic.id.startsWith('cnm'))
    ? 'math'
    : (topic.subject ?? 'other');
}
export function normalizeAssessmentAnswer(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase('zh-CN')
    .replace(/[\s，,。;；]/g, '');
}
function rational(value: string): { n: bigint; d: bigint } | null {
  if (value.length > 100) return null;
  const fraction = value.match(/^(-?\d+)\/(\d+)$/);
  if (fraction) {
    const d = BigInt(fraction[2]);
    return d ? { n: BigInt(fraction[1]), d } : null;
  }
  if (!/^-?\d+(?:\.\d+)?$/.test(value)) return null;
  const [whole, dec = ''] = value.split('.');
  return {
    n: BigInt((whole.startsWith('-') ? '-' : '') + whole.replace('-', '') + dec),
    d: BigInt(10) ** BigInt(dec.length),
  };
}
export function eligibleAssessmentQuestion(question: ChinaQuestion) {
  if (question.type === 'choice')
    return Boolean(
      question.choices?.length &&
      question.choices.some(
        (c) => normalizeAssessmentAnswer(c.key) === normalizeAssessmentAnswer(question.answer),
      ),
    );
  return (
    question.type === 'numeric' && Boolean(rational(normalizeAssessmentAnswer(question.answer)))
  );
}
export function assessmentCorrect(question: PaperQuestion, response: string) {
  const value = normalizeAssessmentAnswer(response);
  if (!value) return false;
  const accepted = [question.answer, ...(question.accept ?? [])].map(normalizeAssessmentAnswer);
  if (accepted.includes(value)) return true;
  if (question.type === 'choice')
    return Boolean(
      question.choices?.some(
        (c) =>
          accepted.includes(normalizeAssessmentAnswer(c.key)) &&
          normalizeAssessmentAnswer(c.text) === value,
      ),
    );
  const actual = rational(value);
  return Boolean(
    actual &&
    accepted.some((v) => {
      const expected = rational(v);
      return expected && expected.n * actual.d === actual.n * expected.d;
    }),
  );
}
export function assessmentScope(
  topics: ChinaTopic[],
  questions: ChinaQuestion[],
  config: AssessmentConfig,
) {
  const eligibleIds = new Set(questions.filter(eligibleAssessmentQuestion).map((q) => q.topicId));
  const matching = topics.filter(
    (t) =>
      t.grade === config.grade &&
      assessmentSubject(t) === config.subject &&
      t.semester === config.term &&
      eligibleIds.has(t.id),
  );
  const units = [...new Set(matching.map((t) => t.chapter))];
  const selected =
    config.scope === 'unit'
      ? [config.unit || units[0]]
      : config.scope === 'midterm'
        ? units.slice(0, Math.max(1, Math.ceil(units.length / 2)))
        : units;
  return {
    units,
    selectedUnits: selected,
    topics: matching.filter((t) => selected.includes(t.chapter)),
  };
}
export function buildAssessment(
  topics: ChinaTopic[],
  questions: ChinaQuestion[],
  config: AssessmentConfig,
) {
  const scope = assessmentScope(topics, questions, config),
    ordered = new Map(scope.topics.map((t) => [t.id, t]));
  const allGroups = scope.topics.map((t) =>
    questions.filter((q) => q.topicId === t.id && eligibleAssessmentQuestion(q)),
  );
  // Small end-of-term papers must reach later units, too.
  const groups =
    allGroups.length > config.count
      ? Array.from(
          { length: config.count },
          (_, i) =>
            allGroups[Math.floor((i * (allGroups.length - 1)) / Math.max(1, config.count - 1))],
        )
      : allGroups;
  const chosen: PaperQuestion[] = [];
  // Round-robin by knowledge point avoids filling the paper with one topic.
  for (let round = 0; chosen.length < config.count && groups.some((g) => g[round]); round++)
    for (const group of groups) {
      const q = group[round];
      if (q && chosen.length < config.count)
        chosen.push({ ...q, topicName: ordered.get(q.topicId)!.name });
    }
  if (!chosen.length) throw new Error('这个范围暂时没有可自动判分的题目，请换一个单元或学期。');
  return { questions: chosen, units: scope.selectedUnits };
}
export function publicAssessmentQuestions(questions: PaperQuestion[]) {
  return questions.map(({ id, topicId, topicName, type, prompt, choices }) => ({
    id,
    topicId,
    topicName,
    type,
    prompt,
    choices,
  }));
}
export function gradeAssessment(questions: PaperQuestion[], responses: Record<string, string>) {
  const results = questions.map((q) => {
    const response = responses[q.id]?.trim() ?? '';
    return {
      questionId: q.id,
      topicId: q.topicId,
      topicName: q.topicName,
      prompt:
        q.prompt +
        (q.type === 'choice' ? '\n' + q.choices?.map((c) => `${c.key}. ${c.text}`).join('；') : ''),
      response,
      answered: Boolean(response),
      correct: assessmentCorrect(q, response),
      ...(q.explanation
        ? { explanation: q.explanation, explanationAudioId: q.explanationAudioId }
        : {}),
    };
  });
  const correct = results.filter((q) => q.correct).length,
    answered = results.filter((q) => q.answered).length;
  const topics = [...new Set(results.map((q) => q.topicId))].map((topicId) => {
    const rows = results.filter((q) => q.topicId === topicId);
    return {
      topicId,
      name: rows[0].topicName,
      total: rows.length,
      answered: rows.filter((q) => q.answered).length,
      correct: rows.filter((q) => q.correct).length,
    };
  });
  return {
    total: results.length,
    correct,
    answered,
    score: Math.round((100 * correct) / results.length),
    results,
    topics,
    createdAt: new Date().toISOString(),
  };
}
export type AssessmentReport = ReturnType<typeof gradeAssessment>;
export function assessmentTutorPrompt(
  report: AssessmentReport,
  grade: number,
  questionId?: string,
) {
  const mistakes = report.results
    .filter((q) => q.answered && !q.correct && (!questionId || q.questionId === questionId))
    .slice(0, 3);
  return `我在CoastalTutor做了${grade}年级小测，想和我的私人家教一起弄明白这些题。\n${mistakes.map((q, i) => `${i + 1}. 知识点：${q.topicName}\n题目：${q.prompt}\n我的回答：${q.response}`).join('\n\n')}\n请先问问我是怎么想的，用适合我年级的短句引导，不要一开始直接给答案。需要时使用你原生的题库/错题工具整理错题，再建议一个针对性的练习。`.slice(
    0,
    4800,
  );
}
