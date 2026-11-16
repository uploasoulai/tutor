import { describe, expect, it } from 'vitest';
import {
  assessmentCorrect,
  buildAssessment,
  gradeAssessment,
  publicAssessmentQuestions,
  assessmentTutorPrompt,
  type PaperQuestion,
} from '@/lib/curriculum/assessments';
import type { ChinaTopic, ChinaQuestion } from '@/lib/china-curriculum/catalog';
const topics = [
  { id: 't1', name: '数一数', grade: 2, subject: 'math', semester: '上', chapter: '第一单元' },
  { id: 't2', name: '分组', grade: 2, subject: 'math', semester: '上', chapter: '第二单元' },
  { id: 't3', name: '长度', grade: 2, subject: 'math', semester: '下', chapter: '第三单元' },
  { id: 't4', name: '高年级', grade: 5, subject: 'math', semester: '上', chapter: '第一单元' },
] as ChinaTopic[];
const bank = [
  { id: 'q1', topicId: 't1', type: 'numeric', prompt: '1+1', answer: '2' },
  {
    id: 'q2',
    topicId: 't2',
    type: 'choice',
    prompt: '选两个',
    answer: 'B',
    choices: [
      { key: 'A', text: '一个' },
      { key: 'B', text: '两个' },
    ],
  },
  { id: 'q3', topicId: 't3', type: 'numeric', prompt: '3+1', answer: '4' },
  { id: 'q4', topicId: 't4', type: 'numeric', prompt: '5+1', answer: '6' },
  { id: 'q5', topicId: 't1', type: 'short', prompt: '讲解', answer: '自由表达' },
] as ChinaQuestion[];
describe('curriculum assessments', () => {
  it('spreads a small final paper across early and late knowledge points', () => {
    const manyTopics = Array.from({ length: 12 }, (_, i) => ({
      ...topics[0],
      id: `t${i}`,
      chapter: `单元${i}`,
    }));
    const manyQuestions = manyTopics.map((t, i) => ({ ...bank[0], id: `q${i}`, topicId: t.id }));
    const paper = buildAssessment(manyTopics, manyQuestions, {
      grade: 2,
      subject: 'math',
      term: '上',
      scope: 'final',
      count: 5,
    });
    expect(paper.questions).toHaveLength(5);
    expect(paper.questions.at(-1)?.topicId).toBe('t11');
  });
  it('respects grade, subject, term and unit rather than mixing unrelated paper questions', () => {
    const paper = buildAssessment(topics, bank, {
      grade: 2,
      subject: 'math',
      term: '上',
      scope: 'unit',
      unit: '第二单元',
      count: 10,
    });
    expect(paper.questions.map((q) => q.id)).toEqual(['q2']);
    const mid = buildAssessment(topics, bank, {
      grade: 2,
      subject: 'math',
      term: '上',
      scope: 'midterm',
      count: 10,
    });
    expect(mid.questions.map((q) => q.id)).toEqual(['q1']);
    const final = buildAssessment(topics, bank, {
      grade: 2,
      subject: 'math',
      term: '上',
      scope: 'final',
      count: 10,
    });
    expect(final.questions.map((q) => q.id)).toEqual(['q1', 'q2']);
  });
  it('does not send answers, aliases or explanation keys before submission', () => {
    const publicQuestions = publicAssessmentQuestions([
      { ...bank[0], accept: ['２'], topicName: '数一数' },
    ]);
    expect(publicQuestions[0]).not.toHaveProperty('answer');
    expect(publicQuestions[0]).not.toHaveProperty('accept');
  });
  it('keeps decimal punctuation meaningful and compares exact rational values without evaluation', () => {
    const q = { ...bank[0], topicName: '数字', answer: '0.5' } as PaperQuestion;
    expect(assessmentCorrect(q, '05')).toBe(false);
    expect(assessmentCorrect(q, '1/2')).toBe(true);
    expect(assessmentCorrect(q, '０.５０')).toBe(true);
    expect(assessmentCorrect(q, '1/0')).toBe(false);
    expect(assessmentCorrect(q, 'process.exit()')).toBe(false);
  });
  it('counts blanks separately and hands coaching to the tutor without publishing a hidden answer key', () => {
    const questions = buildAssessment(topics, bank, {
      grade: 2,
      subject: 'math',
      term: '上',
      scope: 'final',
      count: 10,
    }).questions;
    const report = gradeAssessment(questions, { q1: '3' });
    expect(report.score).toBe(0);
    expect(report.answered).toBe(1);
    expect(report.results[1].answered).toBe(false);
    const prompt = assessmentTutorPrompt(report, 2);
    expect(prompt).toContain('我的回答：3');
    expect(prompt).toContain('不要一开始直接给答案');
    expect(prompt).not.toContain('q2');
    expect(prompt).not.toContain('参考答案');
  });
});
