export const FRACTIONS_HYBRID = {
  id: 'fractions-hybrid-v1',
  topicId: 'cnm_p226',
  title: '认识几分之几 · 看一看，动手试试',
  videoUrl: '/lessons/fractions-intro-v1.html',
  questionIds: ['cnm_p226_q1', 'cnm_p226_q3'],
} as const;
export type HybridPhase = 'video' | 'practice' | 'check' | 'completed';
export const HYBRID_PHASES: HybridPhase[] = ['video', 'practice', 'check', 'completed'];
export function hasHybridAssessment(questionIds: readonly string[]) {
  return FRACTIONS_HYBRID.questionIds.every((id) => questionIds.includes(id));
}
export function fractionPracticeFeedback(selected: number) {
  return selected === 3
    ? '你选出了四份中的三份！下面的 4 表示总份数，上面的 3 表示选中的份数。'
    : selected < 3
      ? '已经分成同样大的四份。数一数，还需要涂几份才能表示四分之三？'
      : '你把整个图形都涂满了。四分之三需要留下几份不涂色呢？';
}
