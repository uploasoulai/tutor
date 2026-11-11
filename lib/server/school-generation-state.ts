import type { GenerateClassroomInput } from './classroom-generation';
import type { Scene, Stage } from '@/lib/types/stage';
import type { SceneOutline } from '@/lib/types/generation';
import type { generateSceneContent } from '@/lib/generation/scene-generator';

export type SchoolSceneContent = NonNullable<Awaited<ReturnType<typeof generateSceneContent>>>;
export interface SchoolGenerationState {
  version: 1;
  revision: number;
  ownerId: string;
  input: GenerateClassroomInput;
  leaseUntil?: number;
  phase: 'outline' | 'content' | 'actions' | 'publish';
  sceneIndex: number;
  attempts: Record<string, number>;
  reservedCalls: number;
  maxCalls: number;
  maxAttempts: number;
  outlines?: SceneOutline[];
  languageDirective?: string;
  stage?: Stage;
  scenes: Scene[];
  pendingContent?: SchoolSceneContent;
}

function configuredLimit(name: string, fallback: number, maximum: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? Math.min(value, maximum) : fallback;
}

export function initialSchoolGeneration(
  ownerId: string,
  input: GenerateClassroomInput,
): SchoolGenerationState {
  // Persist only curriculum inputs, never request headers, keys, or personal material.
  return {
    version: 1,
    revision: 0,
    ownerId,
    input: {
      requirement: input.requirement,
      curriculumLessonCache: input.curriculumLessonCache,
      maxScenes: input.maxScenes,
      maxInteractiveScenes: input.maxInteractiveScenes,
      maxOutputTokens: input.maxOutputTokens,
      agentMode: 'default',
      resumableSchoolLesson: true,
    },
    phase: 'outline',
    sceneIndex: 0,
    attempts: {},
    reservedCalls: 0,
    maxCalls: configuredLimit('SCHOOL_LESSON_MAX_CALLS', 28, 40),
    maxAttempts: configuredLimit('SCHOOL_LESSON_STEP_ATTEMPTS', 2, 3),
    scenes: [],
  };
}

export function schoolStepKey(state: SchoolGenerationState) {
  return `${state.phase}:${state.sceneIndex}`;
}

export function canAdvanceSchoolGeneration(state: SchoolGenerationState, now = Date.now()) {
  return (
    (!state.leaseUntil || state.leaseUntil < now) &&
    (state.attempts[schoolStepKey(state)] ?? 0) < state.maxAttempts &&
    (state.phase === 'publish' || state.reservedCalls < state.maxCalls)
  );
}
