import { PassThrough } from 'node:stream';
import path from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mocks = vi.hoisted(() => ({
  user: { id: 'student' } as { id: string } | null,
  read: vi.fn(),
  realpath: vi.fn(),
  stat: vi.fn(),
  stream: vi.fn(),
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user: mocks.user } }) } }),
}));
vi.mock('@/lib/server/classroom-storage', () => ({
  CLASSROOMS_DIR: path.resolve('data/classrooms'),
  isValidClassroomId: (id: string) => /^[a-zA-Z0-9_-]+$/.test(id),
  readClassroom: mocks.read,
}));
vi.mock('fs', () => ({
  promises: { realpath: mocks.realpath, stat: mocks.stat },
  createReadStream: mocks.stream,
}));
import { GET } from '@/app/api/classroom-media/[classroomId]/[...path]/route';

const request = (segments = ['audio', 'voice.mp3'], id = 'lesson') =>
  GET(new NextRequest('https://example.test/api/classroom-media/lesson/audio/voice.mp3'), {
    params: Promise.resolve({ classroomId: id, path: segments }),
  });
describe('classroom media access', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.user = { id: 'student' };
    mocks.read.mockResolvedValue({ id: 'lesson' });
    mocks.realpath.mockResolvedValue(path.resolve('data/classrooms/lesson/audio/voice.mp3'));
    mocks.stat.mockResolvedValue({ isFile: () => true, size: 3 });
    mocks.stream.mockImplementation(() => {
      const stream = new PassThrough();
      queueMicrotask(() => stream.end(Buffer.from('mp3')));
      return stream;
    });
  });
  it('requires sign-in before checking ownership or accessing files', async () => {
    mocks.user = null;
    const response = await request();
    expect(response.status).toBe(401);
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.realpath).not.toHaveBeenCalled();
  });
  it('does not reveal whether another student’s media exists', async () => {
    mocks.read.mockResolvedValue(null);
    expect((await request()).status).toBe(404);
    expect(mocks.read).toHaveBeenCalledWith('lesson', 'student');
    expect(mocks.realpath).not.toHaveBeenCalled();
    expect(mocks.stream).not.toHaveBeenCalled();
  });
  it('streams authorized media without public caching', async () => {
    const response = await request();
    expect(response.status).toBe(200);
    expect(await response.text()).toBe('mp3');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
    expect(response.headers.get('vary')).toBe('Cookie');
    expect(response.headers.get('content-type')).toBe('audio/mpeg');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
  });
  it('does not serve classroom JSON through the media entry', async () => {
    expect((await request(['lesson.json'])).status).toBe(404);
    expect(mocks.realpath).not.toHaveBeenCalled();
  });
  it.each([
    ['..', 'voice.mp3'],
    ['audio', '..', 'secret'],
    ['audio', 'bad\0.mp3'],
  ])('rejects path traversal %j', async (...segments) => {
    expect((await request(segments)).status).toBe(400);
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.realpath).not.toHaveBeenCalled();
  });
  it('rejects a symlink that escapes this classroom', async () => {
    mocks.realpath.mockResolvedValue(path.resolve('data/classrooms/other/audio/private.mp3'));
    expect((await request()).status).toBe(404);
    expect(mocks.stream).not.toHaveBeenCalled();
  });
  it('does not expose storage errors or cache missing files', async () => {
    mocks.realpath.mockRejectedValue(
      Object.assign(new Error('private filesystem path'), { code: 'ENOENT' }),
    );
    const response = await request();
    expect(response.status).toBe(404);
    expect(await response.text()).not.toContain('filesystem');
    expect(response.headers.get('cache-control')).toBe('private, no-store');
  });
});
