import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createHash } from 'node:crypto';
import type {
  CurriculumLessonArtifact,
  CurriculumLessonCacheDescriptor,
} from './curriculum-lesson-cache';

export type LibraryStatus = 'draft' | 'testing' | 'recommended' | 'retired';
export const LIBRARY_FEEDBACK = [
  'understood',
  'difficult',
  'another_way',
  'content_issue',
  'interaction_issue',
] as const;
/** Latest testing decision: official curriculum lessons are shared as trials. */
export function isOpenLibraryTesting() {
  return process.env.COURSE_LIBRARY_TEST_REUSE !== 'false';
}
export interface LibraryRow {
  classroom_id: string;
  cache_key: string;
  curriculum_track: 'china' | 'bc';
  canonical_id: string;
  title: string;
  owner_id: string | null;
  kind: 'prepared' | 'generated';
  entry_path: string;
  storage_path: string | null;
  artifact_sha256: string | null;
  status: LibraryStatus;
  is_public: boolean;
  submitted: boolean;
  checks: { pass?: boolean; sceneCount?: number; contentSha256?: string };
  created_at: string;
  feedback_count?: number;
  recommendation_count?: number;
  understood_count?: number;
  difficult_count?: number;
  issue_count?: number;
}
export function isMissingLibrary(error: { code?: string } | null) {
  return error?.code === '42P01' || error?.code === 'PGRST205';
}
export function canReadLibraryCourse(
  row: Pick<LibraryRow, 'owner_id' | 'is_public'>,
  userId: string,
  admin = false,
) {
  return Boolean(userId && (admin || row.is_public || row.owner_id === userId));
}
export function publicLibraryCourse(row: LibraryRow) {
  return {
    id: row.classroom_id,
    cacheKey: row.cache_key,
    track: row.curriculum_track,
    canonicalId: row.canonical_id,
    title: row.title,
    kind: row.kind,
    path: row.entry_path,
    status: row.status,
    submitted: row.submitted,
    eligibleForReview:
      row.kind === 'prepared' || row.owner_id === null || row.submitted || row.is_public,
    checks: row.checks,
    createdAt: row.created_at,
    feedbackCount: row.feedback_count ?? 0,
    recommendations: row.recommendation_count ?? 0,
    understood: row.understood_count ?? 0,
    difficult: row.difficult_count ?? 0,
    issues: row.issue_count ?? 0,
  };
}
export async function libraryCourse(id: string) {
  const { data, error } = await createSupabaseAdminClient()
    .from('course_library_summary')
    .select('*')
    .eq('classroom_id', id)
    .maybeSingle();
  if (error && !isMissingLibrary(error)) throw error;
  return { available: !error, row: data as LibraryRow | null };
}
export async function recommendedLibraryCourse(cacheKey: string) {
  const db = createSupabaseAdminClient();
  const { data, error } = await db
    .from('course_library_candidates')
    .select('*')
    .eq('cache_key', cacheKey)
    .eq('status', 'recommended')
    .maybeSingle();
  if (error && !isMissingLibrary(error)) throw error;
  if (!error && !data && isOpenLibraryTesting()) {
    const trial = await db
      .from('course_library_candidates')
      .select('*')
      .eq('cache_key', cacheKey)
      .eq('is_public', true)
      .eq('status', 'testing')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (trial.error) throw trial.error;
    return { available: true, row: trial.data as LibraryRow | null };
  }
  return { available: !error, row: data as LibraryRow | null };
}
export async function registerLibraryCandidate(
  descriptor: CurriculumLessonCacheDescriptor,
  artifact: CurriculumLessonArtifact,
  ownerId: string,
  storagePath: string,
  checksum: string,
) {
  const db = createSupabaseAdminClient();
  const contentSha256 = createHash('sha256')
    .update(JSON.stringify({ stage: artifact.stage, scenes: artifact.scenes }))
    .digest('hex');
  const { error } = await db.from('course_library_candidates').insert({
    classroom_id: artifact.id,
    cache_key: descriptor.cacheKey,
    curriculum_track: descriptor.track,
    canonical_id: descriptor.canonicalId,
    title: artifact.stage.name?.slice(0, 180) || '互动探索课程',
    owner_id: ownerId,
    kind: 'generated',
    entry_path: `/classroom/${artifact.id}`,
    storage_path: storagePath,
    artifact_sha256: checksum,
    status: isOpenLibraryTesting() ? 'testing' : 'draft',
    is_public: isOpenLibraryTesting(),
    checks: {
      contentSha256,
      pass: true,
      sceneCount: artifact.scenes.length,
      structuralOnly: true,
      humanReviewRequired: true,
    },
  });
  if (isMissingLibrary(error)) return false;
  if (error?.code === '23505') {
    const existing = await libraryCourse(artifact.id);
    if (
      existing.row?.owner_id === ownerId &&
      (existing.row?.storage_path === storagePath ||
        existing.row.checks.contentSha256 === contentSha256)
    )
      return true;
    throw new Error('Course versions are immutable');
  }
  if (error) throw error;
  return true;
}
export async function listLibraryCourses(
  userId: string,
  options: { admin?: boolean; trials?: boolean; mine?: boolean; track?: string } = {},
) {
  let query = createSupabaseAdminClient()
    .from('course_library_summary')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  if (!options.admin)
    query = options.mine
      ? query.eq('owner_id', userId)
      : query
          .eq('is_public', true)
          .in('status', options.trials ? ['recommended', 'testing'] : ['recommended']);
  if (options.track === 'china' || options.track === 'bc')
    query = query.eq('curriculum_track', options.track);
  const { data, error } = await query;
  if (error && !isMissingLibrary(error)) throw error;
  return { available: !error, courses: ((data ?? []) as LibraryRow[]).map(publicLibraryCourse) };
}
