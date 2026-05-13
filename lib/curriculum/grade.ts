export const DEFAULT_GRADE_LABEL = 'Grade 2';
export const DEFAULT_GRADE_LEVEL = 2;
export const DEFAULT_SUBJECT = 'Math';

export const SUBJECT_PREFIX: Record<string, string> = {
  Math: 'MATH',
  'Language Arts': 'ELA',
  Arts: 'ARTS',
  ADST: 'ADST',
};

export function parseGradeLevel(grade: string | null | undefined) {
  if (!grade) return DEFAULT_GRADE_LEVEL;
  if (grade === 'Kindergarten') return 0;

  const match = grade.match(/\d+/);
  if (!match) return DEFAULT_GRADE_LEVEL;

  const gradeLevel = Number(match[0]);
  return Number.isFinite(gradeLevel) ? gradeLevel : DEFAULT_GRADE_LEVEL;
}

export function toGradeLabel(gradeLevel: number) {
  return gradeLevel === 0 ? 'Kindergarten' : `Grade ${gradeLevel}`;
}

export function subjectCodeFor(grade: string | number, subject: string) {
  const gradeLevel = typeof grade === 'number' ? grade : parseGradeLevel(grade);
  const gradeCode = gradeLevel === 0 ? 'K' : String(gradeLevel);
  return `${SUBJECT_PREFIX[subject] ?? SUBJECT_PREFIX[DEFAULT_SUBJECT]}-${gradeCode}`;
}
