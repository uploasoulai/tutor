import { describe, expect, it } from 'vitest';

import {
  normalizeRelationshipSubjects,
  relationshipSubjectsOrDefault,
} from '@/lib/admin/relationship-links';

describe('normalizeRelationshipSubjects', () => {
  it('trims empty values and removes duplicates', () => {
    expect(normalizeRelationshipSubjects([' Math ', '', 'Math', 'Language Arts'])).toEqual([
      'Math',
      'Language Arts',
    ]);
  });
});

describe('relationshipSubjectsOrDefault', () => {
  it('falls back to Math when subjects are empty', () => {
    expect(relationshipSubjectsOrDefault(['', '  '])).toEqual(['Math']);
  });

  it('keeps normalized subjects when provided', () => {
    expect(relationshipSubjectsOrDefault([' Math ', 'Language Arts'])).toEqual([
      'Math',
      'Language Arts',
    ]);
  });
});
