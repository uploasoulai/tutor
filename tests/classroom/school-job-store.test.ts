import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClassroomGenerationJob } from '@/lib/server/classroom-job-store';
import { initialSchoolGeneration } from '@/lib/server/school-generation-state';
const mock = vi.hoisted(() => ({
  owner: 'learner',
  job: null as ClassroomGenerationJob | null,
  filters: vi.fn(),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createSupabaseAdminClient: () => ({
    from: () => {
      let patch: { job_data: ClassroomGenerationJob } | undefined;
      const filters: [string, string][] = [];
      const matches = () =>
        filters.every(([field, value]) => {
          if (field === 'id') return value === mock.job?.id;
          if (field === 'owner_id') return value === mock.owner;
          if (field === 'job_data->schoolGeneration->>revision')
            return value === String(mock.job?.schoolGeneration?.revision);
          return false;
        });
      const chain = {
        update: (value: typeof patch) => {
          patch = value;
          return chain;
        },
        eq: (field: string, value: string) => {
          mock.filters(field, value);
          filters.push([field, value]);
          return chain;
        },
        select: () => chain,
        maybeSingle: async () => ({
          data: matches() ? { job_data: structuredClone(mock.job) } : null,
          error: null,
        }),
        then: (resolve: (result: unknown) => void) => {
          const matched = matches();
          if (matched && patch) mock.job = structuredClone(patch.job_data);
          return Promise.resolve({ data: matched ? [{ id: mock.job!.id }] : [], error: null }).then(
            resolve,
          );
        },
      };
      return chain;
    },
  }),
}));
import {
  compareAndSwapSchoolJob,
  readClassroomGenerationJob,
} from '@/lib/server/classroom-job-store';

describe('school job revision storage', () => {
  beforeEach(() => {
    vi.stubEnv('VERCEL', '1');
    mock.owner = 'learner';
    mock.filters.mockClear();
    mock.job = {
      id: 'job',
      status: 'running',
      step: 'generating_scenes',
      message: '',
      progress: 0,
      createdAt: '',
      updatedAt: '2000-01-01',
      scenesGenerated: 0,
      inputSummary: { requirementPreview: '', hasPdf: false, pdfImageCount: 0, pdfTextLength: 0 },
      schoolGeneration: initialSchoolGeneration('learner', { requirement: 'topic' }),
    };
  });
  it('a stale writer cannot overwrite the winner, even with the same owner', async () => {
    const previous = structuredClone(mock.job!);
    const a = structuredClone(previous);
    a.message = 'winner';
    const b = structuredClone(previous);
    b.message = 'stale';
    expect(await compareAndSwapSchoolJob(previous, a, 'learner')).toBe(true);
    expect(await compareAndSwapSchoolJob(previous, b, 'learner')).toBe(false);
    expect(mock.job?.message).toBe('winner');
    expect(mock.filters).toHaveBeenCalledWith('owner_id', 'learner');
    expect(mock.filters).toHaveBeenCalledWith('job_data->schoolGeneration->>revision', '0');
  });
  it('does not return another owner job', async () => {
    expect(await readClassroomGenerationJob('job', 'other')).toBeNull();
  });
  it('old durable jobs remain recoverable rather than becoming a synthetic stale failure', async () => {
    expect((await readClassroomGenerationJob('job', 'learner'))?.status).toBe('running');
  });
  it('rejects a caller whose identity differs from the checkpoint owner', async () => {
    expect(await compareAndSwapSchoolJob(mock.job!, structuredClone(mock.job!), 'other')).toBe(
      false,
    );
    expect(mock.filters).not.toHaveBeenCalled();
  });
});
