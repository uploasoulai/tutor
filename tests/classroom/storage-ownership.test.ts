import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Stage } from '@/lib/types/stage';

const mocks = vi.hoisted(() => ({ from: vi.fn(), cache: vi.fn() }));
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({ from: mocks.from }),
}));
vi.mock('@/lib/server/curriculum-lesson-cache', () => ({
  readCachedClassroomById: mocks.cache,
  saveCurriculumLessonArtifact: vi.fn(),
}));
import { persistClassroom, readClassroom } from '@/lib/server/classroom-storage';

function query(result: unknown) {
  const chain = { select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn().mockResolvedValue(result) };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  return chain;
}

describe('private classroom ownership', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubEnv('VERCEL', '1');
  });
  it('does not disclose another learner classroom or fall through to the shared cache', async () => {
    mocks.from.mockReturnValue(
      query({ data: { owner_id: 'other', classroom_data: { id: 'lesson' } }, error: null }),
    );
    expect(await readClassroom('lesson', 'student')).toBeNull();
    expect(mocks.cache).not.toHaveBeenCalled();
  });
  it('rejects invalid storage IDs before accessing the database', async () => {
    await expect(
      persistClassroom(
        { id: '../other', stage: {} as Stage, scenes: [] },
        'https://example.test',
        'student',
      ),
    ).rejects.toThrow('Invalid classroom id');
    expect(mocks.from).not.toHaveBeenCalled();
  });
  it('returns the owner classroom', async () => {
    const classroom = { id: 'lesson', scenes: [] };
    mocks.from.mockReturnValue(
      query({ data: { owner_id: 'student', classroom_data: classroom }, error: null }),
    );
    expect(await readClassroom('lesson', 'student')).toEqual(classroom);
  });
  it('requires an identity even for reusable curriculum artifacts', async () => {
    expect(await readClassroom('lesson', '')).toBeNull();
    expect(mocks.from).not.toHaveBeenCalled();
    expect(mocks.cache).not.toHaveBeenCalled();
  });
  it('keeps authenticated curriculum reuse when there is no private record', async () => {
    mocks.from.mockReturnValue(query({ data: null, error: null }));
    mocks.cache.mockResolvedValue({ id: 'lesson' });
    expect(await readClassroom('lesson', 'student')).toEqual({ id: 'lesson' });
  });
  it('refuses to overwrite a classroom owned by someone else', async () => {
    mocks.from.mockReturnValue(query({ data: { owner_id: 'other' }, error: null }));
    await expect(
      persistClassroom(
        { id: 'lesson', stage: {} as Stage, scenes: [] },
        'https://example.test',
        'student',
      ),
    ).rejects.toThrow('Classroom is unavailable');
    expect(mocks.from).toHaveBeenCalledTimes(1);
  });
});
