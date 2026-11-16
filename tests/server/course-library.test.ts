import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
const mocks = vi.hoisted(() => ({
  user: { id: '11111111-1111-4111-8111-111111111111' } as { id: string } | null,
  admin: false,
  rpc: vi.fn(),
  lookup: vi.fn(),
  list: vi.fn(),
  download: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: mocks.user } }) } }),
}));
vi.mock('@/lib/auth/account-role', () => ({ hasAccountRole: async () => mocks.admin }));
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    rpc: mocks.rpc,
    storage: { from: () => ({ download: mocks.download }) },
  }),
}));
vi.mock('@/lib/server/course-library', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/server/course-library')>()),
  libraryCourse: mocks.lookup,
  listLibraryCourses: mocks.list,
}));
import { GET, POST } from '@/app/api/course-library/route';
import {
  canReadLibraryCourse,
  publicLibraryCourse,
  type LibraryRow,
} from '@/lib/server/course-library';
import { findSelectedLibraryArtifact } from '@/lib/server/curriculum-lesson-cache';

const owner = '11111111-1111-4111-8111-111111111111';
const row: LibraryRow = {
  classroom_id: 'lesson-1',
  cache_key: 'edition-language-objective-key',
  curriculum_track: 'china',
  canonical_id: 'pep:cnm_p038',
  title: '一起数圆片',
  owner_id: owner,
  kind: 'generated',
  entry_path: '/classroom/lesson-1',
  storage_path: 'private/course.json.gz',
  artifact_sha256: 'checksum',
  status: 'draft',
  is_public: false,
  submitted: false,
  checks: { pass: true },
  created_at: '2026-11-15',
};
const post = (body: unknown) =>
  POST(
    new NextRequest('http://localhost/api/course-library', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  );
beforeEach(() => {
  vi.clearAllMocks();
  mocks.user = { id: owner };
  mocks.admin = false;
  mocks.rpc.mockResolvedValue({ error: null });
  mocks.lookup.mockResolvedValue({ available: true, row: { ...row } });
  mocks.list.mockResolvedValue({ available: true, courses: [] });
});
describe('course library access and curation', () => {
  it('keeps private candidates owner-bound and permits explicitly public versions', () => {
    expect(canReadLibraryCourse(row, 'someone-else')).toBe(false);
    expect(canReadLibraryCourse(row, owner)).toBe(true);
    expect(canReadLibraryCourse({ ...row, is_public: true }, 'someone-else')).toBe(true);
    expect(canReadLibraryCourse({ ...row, is_public: true }, '')).toBe(false);
  });
  it('never exposes storage pointers or author IDs in library metadata', () => {
    const dto = publicLibraryCourse(row);
    expect(dto).not.toHaveProperty('owner_id');
    expect(dto).not.toHaveProperty('storage_path');
    expect(dto).not.toHaveProperty('artifact_sha256');
    expect(dto.eligibleForReview).toBe(false);
  });
  it('requires sign-in for browsing and feedback', async () => {
    mocks.user = null;
    expect((await GET(new NextRequest('http://localhost/api/course-library'))).status).toBe(401);
    expect(
      (await post({ action: 'feedback', courseId: 'lesson-1', kind: 'understood' })).status,
    ).toBe(401);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('rejects a student opening the review list or changing the default', async () => {
    expect((await GET(new NextRequest('http://localhost/api/course-library?admin=1'))).status).toBe(
      403,
    );
    expect(
      (
        await post({
          action: 'review',
          courseId: 'lesson-1',
          status: 'recommended',
          checklist: { accurate: true, ageAppropriate: true, works: true },
        })
      ).status,
    ).toBe(403);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('binds feedback to authenticated identity rather than a submitted user ID', async () => {
    expect(
      (
        await post({
          action: 'feedback',
          courseId: 'lesson-1',
          kind: 'understood',
          recommend: true,
          userId: 'another-user',
        })
      ).status,
    ).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith('record_course_library_feedback', {
      p_classroom_id: 'lesson-1',
      p_user_id: owner,
      p_kind: 'understood',
      p_recommend: true,
    });
  });
  it('does not accept another owner’s private candidate or arbitrary feedback fields', async () => {
    mocks.lookup.mockResolvedValue({ available: true, row: { ...row, owner_id: 'someone-else' } });
    expect(
      (await post({ action: 'feedback', courseId: 'lesson-1', kind: 'understood' })).status,
    ).toBe(404);
    expect(
      (await post({ action: 'feedback', courseId: 'lesson-1', kind: 'write-sql' })).status,
    ).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('requires a real checklist even for an administrator', async () => {
    mocks.admin = true;
    expect(
      (
        await post({
          action: 'review',
          courseId: 'lesson-1',
          status: 'recommended',
          checklist: { accurate: 'true', ageAppropriate: true, works: true },
        })
      ).status,
    ).toBe(400);
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(
      (
        await post({
          action: 'review',
          courseId: 'lesson-1',
          status: 'recommended',
          checklist: { accurate: true, ageAppropriate: true, works: true },
          reviewer: 'spoofed',
        })
      ).status,
    ).toBe(200);
    expect(mocks.rpc).toHaveBeenCalledWith(
      'review_course_library_candidate',
      expect.objectContaining({ p_reviewer: owner, p_status: 'recommended' }),
    );
  });
  it('rejects a selected course from a different exact curriculum version before reading its object', async () => {
    expect(await findSelectedLibraryArtifact('lesson-1', 'different-edition', owner)).toBeNull();
    expect(await findSelectedLibraryArtifact('lesson-1', row.cache_key, 'someone-else')).toBeNull();
    expect(mocks.download).not.toHaveBeenCalled();
  });
});
