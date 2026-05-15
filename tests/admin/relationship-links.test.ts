import { describe, expect, it } from 'vitest';

import { normalizeRelationshipSubjects } from '@/lib/admin/relationship-links';

describe('normalizeRelationshipSubjects', () => {
  it('trims empty values and removes duplicates', () => {
    expect(normalizeRelationshipSubjects([' Math ', '', 'Math', 'Language Arts'])).toEqual([
      'Math',
      'Language Arts',
    ]);
  });
});
