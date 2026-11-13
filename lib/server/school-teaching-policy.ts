import type { SchoolGenerationState, SchoolSceneContent } from './school-generation-state';
import type { Action } from '@/lib/types/action';

export function schoolTeachingRole(state: SchoolGenerationState) {
  const outline = state.outlines?.[state.sceneIndex];
  if (outline?.type === 'interactive') return 'practice';
  if (outline?.type === 'quiz') return 'check';
  if ((state.outlines?.length ?? 0) <= 3) return 'concept';
  if (state.sceneIndex === 0) return 'opening';
  if (state.sceneIndex === (state.outlines?.length ?? 0) - 1) return 'recap';
  return state.sceneIndex === 1 ? 'concept' : 'worked-example';
}
export function schoolTeachingPrompt(state: SchoolGenerationState) {
  if (!['content', 'actions'].includes(state.phase)) return '';
  const moves = {
    opening:
      'Start with one familiar situation and one curiosity question. Name the learning goal. Keep the introduction short; leave the full explanation to the next section.',
    concept:
      'Show one concrete example first. Explain the new term, what it represents, and WHY the representation works. Connect the picture to the symbols. Contrast one common misconception with the correct reasoning. Never replace the explanation with a definition or list of conclusions.',
    'worked-example':
      'Work through one example in small, visible steps. Explain WHY each step follows, not only what calculation to perform. Keep quantities consistent. Invite the learner to predict the next step, then model the reasoning. End with a nearby real-life application, clearly distinguished from the example.',
    practice:
      'Use the real visible controls to practise the learning objective. Explain what the learner should try, offer a useful hint, and provide specific feedback. Do not pretend the learner has already acted or understood. Keep this learner-controlled and untimed.',
    check:
      'Check understanding of the objective, not speed or recall alone. Include a confidence-building question and a question exposing a common misconception. Keep answer explanations available after an attempt; never narrate the answer before the learner tries.',
    recap:
      'Connect the example, representation and key idea in a short recap. Ask the learner to explain the idea in their own words and suggest one next practice step. Do not introduce a new unexplained concept.',
  };
  return `\n\nSchool teaching focus (${schoolTeachingRole(state)}): ${moves[schoolTeachingRole(state)]} Use the grade, prerequisites and objective already supplied. For early elementary learners use short warm turns and familiar objects; for older learners keep the vocabulary precise and tone age-appropriate. The visible screen needs concise labels, while teacher speech carries the reasoning. Do not merely read the slide. Do not add decorative paragraphs or repeat earlier sections to make the output longer.${state.phase === 'content' ? ' Build the teaching example from actual native shapes, charts, mathematical notation or the real supplied activity. Show the quantities and relationships you explain. No image-generation service is configured for this text-only step: do not invent remote image URLs or gen_img placeholders. Prefer one large readable model over a wall of bullets or tiny decorative objects.' : ''}`;
}
export function schoolStepTokenBudget(state: SchoolGenerationState) {
  const cap = state.input.maxOutputTokens ?? 4096;
  if (state.phase === 'outline') return Math.min(cap, 4096);
  if (state.phase === 'content')
    return Math.min(cap, schoolTeachingRole(state) === 'practice' ? 2400 : 4096);
  return Math.min(cap, ['opening', 'recap'].includes(schoolTeachingRole(state)) ? 2048 : 4096);
}
export interface SchoolQualityReport {
  pass: boolean;
  issues: { severity: 'error' | 'warning'; code: string }[];
}
export function checkSchoolVisual(content: SchoolSceneContent): SchoolQualityReport {
  const issues: SchoolQualityReport['issues'] = [];
  if ('elements' in content) {
    if (content.elements.length === 0)
      issues.push({ severity: 'error', code: 'empty_visual_content' });
    if (
      content.elements.some(
        (element) =>
          element.type === 'image' &&
          (typeof element.src !== 'string' ||
            !element.src.trim() ||
            /^(?:gen_img_|img_\d+$)/i.test(element.src.trim())),
      )
    )
      issues.push({ severity: 'error', code: 'unresolved_teaching_image' });
  }
  return { pass: !issues.length, issues };
}
export function checkSchoolScene(
  content: SchoolSceneContent,
  actions: Action[],
): SchoolQualityReport {
  const issues: SchoolQualityReport['issues'] = [...checkSchoolVisual(content).issues];
  const speech = actions.filter(
    (a) => a.type === 'speech' && typeof a.text === 'string' && a.text.trim(),
  );
  if (!speech.length) issues.push({ severity: 'error', code: 'missing_teacher_explanation' });
  else if (speech.reduce((n, a) => n + (a.type === 'speech' ? a.text.length : 0), 0) < 40)
    issues.push({ severity: 'warning', code: 'brief_explanation_review' });
  return { pass: !issues.some((issue) => issue.severity === 'error'), issues };
}
export class SchoolQualityError extends Error {
  constructor(public report: SchoolQualityReport) {
    super('lesson_quality_check_failed');
  }
}
