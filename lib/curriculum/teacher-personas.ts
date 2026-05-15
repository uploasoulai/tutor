export type TeacherPersonaId = 'mira' | 'leo' | 'sage';

export type TeacherPersona = {
  id: TeacherPersonaId;
  name: string;
  style: string;
  tone: string;
  persona: string;
  avatar: string;
  color: string;
  riveState: 'calm' | 'playful' | 'focused';
};

export const TEACHER_PERSONAS: TeacherPersona[] = [
  {
    id: 'mira',
    name: 'Mira',
    style: 'Patient coach',
    tone: 'Warm, visual, step by step',
    persona:
      'Mira teaches with patience and concrete visuals. She asks one small question at a time, celebrates effort, and scaffolds mistakes without rushing to the answer.',
    avatar: 'M',
    color: '#0f766e',
    riveState: 'calm',
  },
  {
    id: 'leo',
    name: 'Leo',
    style: 'Game guide',
    tone: 'Energetic, rewards strategy',
    persona:
      'Leo turns practice into quick challenges. He keeps lessons upbeat, rewards strategy choices, and uses playful mini-games while keeping the math accurate.',
    avatar: 'L',
    color: '#7c3aed',
    riveState: 'playful',
  },
  {
    id: 'sage',
    name: 'Sage',
    style: 'Calm explainer',
    tone: 'Quiet, precise, confidence first',
    persona:
      'Sage is calm and precise. They slow down abstract ideas, name the thinking step clearly, and help learners rebuild confidence after uncertainty.',
    avatar: 'S',
    color: '#003461',
    riveState: 'focused',
  },
];

export const DEFAULT_TEACHER_PERSONA = TEACHER_PERSONAS[0];

export type TeacherPersonaSnapshot = Pick<
  TeacherPersona,
  'id' | 'name' | 'style' | 'tone' | 'persona' | 'avatar' | 'color' | 'riveState'
>;

export function getTeacherPersonaById(value: unknown): TeacherPersona {
  return TEACHER_PERSONAS.find((persona) => persona.id === value) ?? DEFAULT_TEACHER_PERSONA;
}

export function getTeacherPersonaByStyle(value: unknown): TeacherPersona {
  return TEACHER_PERSONAS.find((persona) => persona.style === value) ?? DEFAULT_TEACHER_PERSONA;
}

export function resolveTeacherPersonaPreference(
  metadata: Record<string, unknown> | null | undefined,
) {
  if (!metadata) return DEFAULT_TEACHER_PERSONA;
  return metadata.tutor_persona_id
    ? getTeacherPersonaById(metadata.tutor_persona_id)
    : getTeacherPersonaByStyle(metadata.tutor_style);
}

export function toTeacherPersonaSnapshot(persona: TeacherPersona): TeacherPersonaSnapshot {
  return {
    id: persona.id,
    name: persona.name,
    style: persona.style,
    tone: persona.tone,
    persona: persona.persona,
    avatar: persona.avatar,
    color: persona.color,
    riveState: persona.riveState,
  };
}

export function formatTeacherPersonaForLessonPrompt(persona: TeacherPersonaSnapshot) {
  return `Teacher persona:
- Name: ${persona.name}
- Style: ${persona.style}
- Tone: ${persona.tone}
- Behavior: ${persona.persona}
- Avatar state target: ${persona.riveState}`;
}
