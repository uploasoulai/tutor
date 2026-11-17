import { expect, it, vi } from 'vitest';
import { createHash } from 'node:crypto';
vi.mock('server-only', () => ({}));
vi.mock('@/lib/server/course-library', () => ({
  libraryCourse: vi.fn(),
  canReadLibraryCourse: (row: { is_public: boolean }, id: string) => Boolean(id && row.is_public),
}));
import {
  preparedCatalog,
  publicPreparedLesson,
  readablePreparedLesson,
  validMediaBinding,
} from '@/lib/curriculum/prepared-courses';
import { libraryCourse } from '@/lib/server/course-library';
import { gradeAssessment } from '@/lib/curriculum/assessments';
import { mediaResponse } from '@/lib/server/r2-course-media';
it('retains six reviewed source candidates but publishes only through the existing library gate', async () => {
  const catalog = await preparedCatalog();
  expect(catalog.lessons).toHaveLength(6);
  expect(catalog.assets).toHaveLength(119);
  vi.mocked(libraryCourse).mockResolvedValue({ available: true, row: null });
  expect(await readablePreparedLesson(catalog.lessons[0].id, 'learner')).toBeNull();
  vi.mocked(libraryCourse).mockResolvedValue({
    available: true,
    row: {
      is_public: true,
      status: 'testing',
      checks: {
        pass: true,
        courseContractSha256: createHash('sha256')
          .update(JSON.stringify(catalog.lessons[0]))
          .digest('hex'),
      },
    } as never,
  });
  expect(await readablePreparedLesson(catalog.lessons[0].id, 'learner')).not.toBeNull();
  vi.mocked(libraryCourse).mockResolvedValue({
    available: true,
    row: { is_public: true, status: 'retired', checks: { pass: true } } as never,
  });
  expect(await readablePreparedLesson(catalog.lessons[0].id, 'learner')).toBeNull();
});
it('keeps keys, solutions and audio for solutions out of the pre-attempt DTO', async () => {
  const lesson = (await preparedCatalog()).lessons[0],
    dto = publicPreparedLesson(lesson);
  expect(dto.questions).toHaveLength(6);
  for (const q of dto.questions) {
    expect(q).not.toHaveProperty('answer');
    expect(q).not.toHaveProperty('explanation');
    expect(q).not.toHaveProperty('explanationAudioId');
  }
  expect(dto).not.toHaveProperty('bindings');
  const report = gradeAssessment(
    lesson.questions,
    Object.fromEntries(lesson.questions.map((q) => [q.id, q.answer])),
  );
  expect(report.score).toBe(100);
  expect(report.results[0].explanation).toBeTruthy();
});
it('invalidates voice when the corresponding visible text changes', async () => {
  const original = (await preparedCatalog()).lessons[0],
    lesson = structuredClone(original),
    id = lesson.blocks[0].audioId;
  expect(validMediaBinding(lesson, id)).not.toHaveLength(0);
  lesson.blocks[0].text = 'Changed teaching text';
  expect(validMediaBinding(lesson, id)).toHaveLength(0);
});
it('every current audio binding exists, matches its text and fits the bounded first-lesson upload', async () => {
  const catalog = await preparedCatalog();
  for (const lesson of catalog.lessons)
    for (const b of lesson.bindings) {
      expect(catalog.assets.some((a) => a.id === b.assetId)).toBe(true);
      expect(validMediaBinding(lesson, b.assetId)).toContainEqual(b);
    }
  const ids = new Set(catalog.lessons[0].bindings.map((b) => b.assetId)),
    assets = catalog.assets.filter((a) => ids.has(a.id));
  expect(assets).toHaveLength(23);
  expect(assets.reduce((n, a) => n + a.bytes, 0)).toBe(217542);
});
it('serves exact media ranges and rejects invalid or multiple ranges', async () => {
  const data = Buffer.from('abcdefghij');
  const r = mediaResponse(data, 'bytes=2-5');
  expect(r.status).toBe(206);
  expect(r.headers.get('Content-Range')).toBe('bytes 2-5/10');
  expect(await r.text()).toBe('cdef');
  expect(await mediaResponse(data, 'bytes=-3').text()).toBe('hij');
  for (const range of ['bytes=20-', 'bytes=5-2', 'bytes=0-1,3-4', 'bytes=-0'])
    expect(mediaResponse(data, range).status).toBe(416);
  expect(mediaResponse(data, null).headers.get('Cache-Control')).toBe('private, no-store');
});
