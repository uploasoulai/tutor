import type { BCCurriculumMatch } from '@/lib/curriculum/search';

export type PrimaryGradeBand = 'early-elementary' | 'middle-years';

export type InstructionalDesignRules = {
  gradeBand: PrimaryGradeBand;
  languageLevel: string;
  requiredMoves: string[];
  concreteRepresentations: string[];
  interactionPattern: string;
  maxTeacherTalkSeconds: number;
};

export type LessonBlueprintScene = {
  phase: 'warm-intro' | 'worked-example' | 'guided-practice' | 'mini-game-check';
  teachingMove: string;
  visualSpec: string;
  manipulativeSpec: string;
  avatarCue: string;
  voiceCue: string;
  misconceptionCheck: string;
  repairMove: string;
};

export type LessonBlueprint = {
  version: 1;
  gradeBand: PrimaryGradeBand;
  learningGoal: string;
  prerequisite: string;
  bigIdeaBridge: string;
  childFriendlyObjective: string;
  realWorldStory: string;
  concreteRepresentations: string[];
  keyVocabulary: string[];
  commonMisconceptions: string[];
  workedExample: string;
  guidedPractice: string;
  miniGameGoal: string;
  exitTicket: string;
  scenes: LessonBlueprintScene[];
};

export type LessonQualityReport = {
  score: number;
  passed: boolean;
  checks: {
    bcAligned: boolean;
    ageAppropriate: boolean;
    concreteRepresentations: boolean;
    workedExample: boolean;
    guidedPractice: boolean;
    miniGame: boolean;
    misconceptionRepair: boolean;
    multimodalCues: boolean;
  };
  revisionNotes: string[];
};

export function getInstructionalDesignRules({
  grade,
  subject,
}: {
  grade: string;
  subject: string;
}): InstructionalDesignRules {
  const gradeNumber = Number(grade.match(/\d+/)?.[0] ?? 2);
  const isEarlyElementary = gradeNumber <= 4;
  const isMath = subject.toLowerCase().includes('math');

  return {
    gradeBand: isEarlyElementary ? 'early-elementary' : 'middle-years',
    languageLevel: isEarlyElementary
      ? 'Short Grade 1-4 sentences, one idea per sentence, concrete nouns before symbols.'
      : 'Clear middle-years wording with explicit strategy names.',
    requiredMoves: [
      'Name the learning goal in child-friendly language.',
      'Connect the idea to a familiar real-world story.',
      'Model one worked example before asking the learner to answer independently.',
      'Ask one guided-practice question with a visible scaffold.',
      'End with a mini-game check and one reflection prompt.',
    ],
    concreteRepresentations: isMath
      ? ['ten-frame', 'number line', 'base-ten blocks', 'counters', 'simple story picture']
      : ['picture card', 'word card', 'sound-it-out prompt', 'story sequence'],
    interactionPattern: isEarlyElementary
      ? 'Tap, drag, count, choose, and explain aloud; avoid long text-only slides.'
      : 'Choose a strategy, justify it, then apply it to a new example.',
    maxTeacherTalkSeconds: isEarlyElementary ? 25 : 40,
  };
}

export function buildLessonBlueprint({
  grade,
  subject,
  title,
  outcomeCode = '',
  matches,
}: {
  grade: string;
  subject: string;
  title: string;
  outcomeCode?: string;
  matches: BCCurriculumMatch[];
}): LessonBlueprint {
  const rules = getInstructionalDesignRules({ grade, subject });
  const primary = matches[0];
  const learningGoal = primary?.content_knowledge ?? title;
  const elaboration = primary?.elaboration ?? primary?.chunk_text ?? '';
  const vocabulary = buildVocabulary(learningGoal, subject);
  const representations = rules.concreteRepresentations.slice(0, 4);
  const story = buildRealWorldStory(learningGoal, subject);
  const misconception = buildMisconceptions(learningGoal, subject);

  return {
    version: 1,
    gradeBand: rules.gradeBand,
    learningGoal,
    prerequisite: buildPrerequisite(learningGoal, subject),
    bigIdeaBridge:
      elaboration.slice(0, 220) ||
      `Use ${representations.slice(0, 2).join(' and ')} so the learner can see the idea before naming the rule.`,
    childFriendlyObjective: `I can show ${learningGoal.toLowerCase()} with a picture, tool, or story.`,
    realWorldStory: story,
    concreteRepresentations: representations,
    keyVocabulary: vocabulary,
    commonMisconceptions: misconception,
    workedExample: `The tutor models one ${learningGoal.toLowerCase()} example using ${representations[0]} and says each step out loud.`,
    guidedPractice: `The learner tries a similar example with ${representations[1]} while the tutor asks one guiding question.`,
    miniGameGoal: `Match, build, or choose a representation that proves the ${outcomeCode || 'BC'} learning goal.`,
    exitTicket: `Tell ${learningGoal.toLowerCase()} in your own words and name the strategy that helped most.`,
    scenes: [
      {
        phase: 'warm-intro',
        teachingMove: `Start with the story: ${story}`,
        visualSpec: `Show a friendly scene with ${representations[0]} and a clear label for ${learningGoal}.`,
        manipulativeSpec: `Learner taps the objects they notice before the tutor names the math.`,
        avatarCue: 'Smile, wave, then point toward the model.',
        voiceCue: 'Warm and curious, with a short pause after the noticing question.',
        misconceptionCheck: misconception[0],
        repairMove: `If the learner guesses, ask them to touch or count the model first.`,
      },
      {
        phase: 'worked-example',
        teachingMove: `Model one example before asking the learner to solve.`,
        visualSpec: `Animate one step at a time with ${representations[0]} and ${representations[1]}.`,
        manipulativeSpec: `Tutor highlights the next object, benchmark, or group while narrating.`,
        avatarCue: 'Point, nod, then pause with an encouraging expression.',
        voiceCue: 'Think-aloud style: short sentence, pause, next step.',
        misconceptionCheck: misconception[1] ?? misconception[0],
        repairMove: `Return to a smaller number or simpler picture, then rebuild the example.`,
      },
      {
        phase: 'guided-practice',
        teachingMove: `Invite the learner to choose a strategy and try a parallel example.`,
        visualSpec: `Keep the scaffold visible, with one blank space for the learner's choice.`,
        manipulativeSpec: `Learner taps or slides to complete the model; feedback appears immediately.`,
        avatarCue: 'Lean in, listen, then celebrate the strategy choice.',
        voiceCue: 'Ask one question and wait; avoid explaining over the learner.',
        misconceptionCheck: misconception[2] ?? misconception[0],
        repairMove: `Offer two choices instead of the final answer: model it or count it.`,
      },
      {
        phase: 'mini-game-check',
        teachingMove: `Use a quick mini-game to check transfer, not memorization.`,
        visualSpec: `Show three choice cards with one clearly matching representation.`,
        manipulativeSpec: `Learner chooses, receives feedback, then says why it works.`,
        avatarCue: 'Celebrate effort first; show a calm retry face after mistakes.',
        voiceCue: 'Upbeat and brief, with a final reflection prompt.',
        misconceptionCheck: 'Can the learner explain the representation, not just choose it?',
        repairMove: `Show the worked example beside the new problem and ask what is the same.`,
      },
    ],
  };
}

export function evaluateLessonQuality(blueprint: LessonBlueprint): LessonQualityReport {
  const checks = {
    bcAligned: blueprint.learningGoal.length > 0 && blueprint.bigIdeaBridge.length > 0,
    ageAppropriate:
      blueprint.gradeBand === 'early-elementary' &&
      blueprint.childFriendlyObjective.split(' ').length <= 18,
    concreteRepresentations: blueprint.concreteRepresentations.length >= 3,
    workedExample: blueprint.workedExample.length > 20,
    guidedPractice: blueprint.guidedPractice.length > 20,
    miniGame:
      blueprint.miniGameGoal.length > 20 &&
      blueprint.scenes.some((scene) => scene.phase === 'mini-game-check'),
    misconceptionRepair:
      blueprint.commonMisconceptions.length >= 2 &&
      blueprint.scenes.every((scene) => scene.misconceptionCheck && scene.repairMove),
    multimodalCues: blueprint.scenes.every(
      (scene) => scene.visualSpec && scene.manipulativeSpec && scene.avatarCue && scene.voiceCue,
    ),
  };
  const passedCount = Object.values(checks).filter(Boolean).length;
  const score = Math.round((passedCount / Object.keys(checks).length) * 100);
  const revisionNotes = Object.entries(checks)
    .filter(([, passed]) => !passed)
    .map(([name]) => `Improve ${name} before using this lesson with a student.`);

  return {
    score,
    passed: score >= 85,
    checks,
    revisionNotes,
  };
}

function buildVocabulary(goal: string, subject: string) {
  if (subject.toLowerCase().includes('math')) {
    return ['show', 'count', 'compare', 'strategy', ...goal.split(/\s+/).slice(0, 3)].slice(0, 6);
  }

  return ['notice', 'explain', 'evidence', ...goal.split(/\s+/).slice(0, 3)].slice(0, 6);
}

function buildPrerequisite(goal: string, subject: string) {
  if (subject.toLowerCase().includes('math')) {
    return `Comfort counting, comparing, or grouping small quantities before working on ${goal.toLowerCase()}.`;
  }

  return `Comfort naming what they notice before explaining ${goal.toLowerCase()}.`;
}

function buildRealWorldStory(goal: string, subject: string) {
  if (subject.toLowerCase().includes('math')) {
    return `A child is organizing beach stones, stickers, or game tokens and needs a clear way to show ${goal.toLowerCase()}.`;
  }

  return `A child is sharing a short story card and needs a clear way to explain ${goal.toLowerCase()}.`;
}

function buildMisconceptions(goal: string, subject: string) {
  if (subject.toLowerCase().includes('math')) {
    return [
      `The learner may count too fast and skip one object while working on ${goal.toLowerCase()}.`,
      'The learner may name the answer without showing how the model proves it.',
      'The learner may confuse the representation with the final number sentence.',
    ];
  }

  return [
    `The learner may repeat words from the prompt without explaining ${goal.toLowerCase()}.`,
    'The learner may choose a detail that is interesting but not important.',
    'The learner may need sentence starters before answering independently.',
  ];
}
