import { createHash } from 'node:crypto';
import { gunzipSync, gzipSync } from 'node:zlib';
import type { Scene, Stage } from '@/lib/types/stage';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

const BUCKET = 'curriculum-lessons';
const CACHE_SCHEMA_VERSION = 2;

function usesPersistentClassroomStore() {
  return (
    process.env.VERCEL === '1' ||
    process.env.VERCEL_ENV === 'production' ||
    process.env.VERCEL_ENV === 'preview' ||
    Boolean(process.env.VERCEL_URL)
  );
}

export type CurriculumTrack = 'bc' | 'china';

export interface CurriculumLessonCacheDescriptor {
  cacheKey: string;
  track: CurriculumTrack;
  canonicalId: string;
  sourceRevision: string;
  schemaVersion: number;
}

export interface CurriculumLessonArtifact {
  id: string;
  stage: Stage;
  scenes: Scene[];
  createdAt: string;
}

interface CacheIndexRow {
  cache_key: string;
  classroom_id: string;
  storage_path: string;
  artifact_bytes: number;
  artifact_sha256: string;
  metadata: Record<string, unknown>;
}

export function describeCurriculumLesson({
  track,
  canonicalId,
  requirement,
}: {
  track: CurriculumTrack;
  canonicalId: string;
  requirement: string;
}): CurriculumLessonCacheDescriptor {
  const sourceRevision = createHash('sha256').update(requirement).digest('hex');
  const identity = JSON.stringify({
    track,
    canonicalId,
    sourceRevision,
    schemaVersion: CACHE_SCHEMA_VERSION,
  });

  return {
    cacheKey: createHash('sha256').update(identity).digest('hex'),
    track,
    canonicalId,
    sourceRevision,
    schemaVersion: CACHE_SCHEMA_VERSION,
  };
}

function isMissingCacheSchema(error: { code?: string; message?: string }) {
  return error.code === '42P01' || error.code === 'PGRST205';
}

function isValidArtifact(value: unknown): value is CurriculumLessonArtifact {
  if (!value || typeof value !== 'object') return false;
  const artifact = value as Partial<CurriculumLessonArtifact>;
  return (
    typeof artifact.id === 'string' &&
    !!artifact.stage &&
    Array.isArray(artifact.scenes) &&
    artifact.scenes.length >= 3 &&
    artifact.scenes.every(
      (scene) =>
        !!scene &&
        typeof scene === 'object' &&
        typeof scene.id === 'string' &&
        Array.isArray(scene.actions) &&
        scene.actions.length > 0 &&
        (scene.type !== 'interactive' ||
          (scene.content?.type === 'interactive' &&
            (typeof scene.content.html === 'string' || typeof scene.content.url === 'string'))),
    ) &&
    typeof artifact.createdAt === 'string'
  );
}

async function findReadyArtifactByKey(cacheKey: string): Promise<CacheIndexRow | null> {
  const { data, error } = await createSupabaseAdminClient()
    .from('curriculum_lesson_artifacts')
    .select('cache_key,classroom_id,storage_path,artifact_bytes,artifact_sha256,metadata')
    .eq('cache_key', cacheKey)
    .eq('status', 'ready')
    .maybeSingle();

  if (error) {
    if (isMissingCacheSchema(error)) return null;
    throw error;
  }
  return (data as CacheIndexRow | null) ?? null;
}

async function readArtifactAtPath(
  storagePath: string,
  expectedSha256?: string,
): Promise<CurriculumLessonArtifact | null> {
  const { data, error } = await createSupabaseAdminClient()
    .storage.from(BUCKET)
    .download(storagePath);
  if (error) {
    if (error.message.toLowerCase().includes('not found')) return null;
    throw error;
  }

  try {
    const compressed = Buffer.from(await data.arrayBuffer());
    if (
      expectedSha256 &&
      createHash('sha256').update(compressed).digest('hex') !== expectedSha256
    ) {
      return null;
    }
    const encoded = gunzipSync(compressed).toString('utf8');
    const parsed = JSON.parse(encoded) as unknown;
    return isValidArtifact(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function findCurriculumLessonArtifact(
  cacheKey: string,
): Promise<CurriculumLessonArtifact | null> {
  if (!usesPersistentClassroomStore()) return null;
  const row = await findReadyArtifactByKey(cacheKey);
  return row ? readArtifactAtPath(row.storage_path, row.artifact_sha256) : null;
}

export async function readCachedClassroomById(
  classroomId: string,
): Promise<CurriculumLessonArtifact | null> {
  if (!usesPersistentClassroomStore()) return null;
  const { data, error } = await createSupabaseAdminClient()
    .from('curriculum_lesson_artifacts')
    .select('storage_path,artifact_sha256')
    .eq('classroom_id', classroomId)
    .eq('status', 'ready')
    .maybeSingle();

  if (error) {
    if (isMissingCacheSchema(error)) return null;
    throw error;
  }
  return data?.storage_path ? readArtifactAtPath(data.storage_path, data.artifact_sha256) : null;
}

export async function saveCurriculumLessonArtifact(
  descriptor: CurriculumLessonCacheDescriptor,
  artifact: CurriculumLessonArtifact,
): Promise<boolean> {
  if (!usesPersistentClassroomStore() || !isValidArtifact(artifact)) return false;

  const encoded = JSON.stringify(artifact);
  const bytes = gzipSync(Buffer.from(encoded, 'utf8'), { level: 6 });
  const checksum = createHash('sha256').update(bytes).digest('hex');
  // Upload a complete new version before switching the index, so regeneration
  // never leaves the shared cache pointing at a partially replaced object.
  const storagePath = `${descriptor.cacheKey.slice(0, 2)}/${descriptor.cacheKey}/${checksum}.json.gz`;
  const supabase = createSupabaseAdminClient();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, {
    contentType: 'application/gzip',
    upsert: true,
    cacheControl: '31536000',
  });
  if (uploadError) throw uploadError;

  const { error: indexError } = await supabase.from('curriculum_lesson_artifacts').upsert(
    {
      cache_key: descriptor.cacheKey,
      classroom_id: artifact.id,
      storage_path: storagePath,
      curriculum_track: descriptor.track,
      canonical_id: descriptor.canonicalId,
      source_revision: descriptor.sourceRevision,
      schema_version: descriptor.schemaVersion,
      artifact_bytes: bytes.byteLength,
      artifact_sha256: checksum,
      status: 'ready',
      metadata: { sceneCount: artifact.scenes.length },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'cache_key' },
  );

  if (indexError) {
    if (isMissingCacheSchema(indexError)) return false;
    throw indexError;
  }
  return true;
}
