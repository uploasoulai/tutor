/** Bounded operator command. Default is dry-run; --apply inserts ONLY the first pilot. */
import { createRequire } from 'node:module';
import { readFileSync, mkdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
const root = resolve(import.meta.dirname, '..'),
  require = createRequire(import.meta.url);
const catalog = JSON.parse(
  readFileSync(join(root, 'curriculum_data/china/prepared/grade2-multiplication-v1.json'), 'utf8'),
);
const lesson = catalog.lessons[0],
  ids = new Set(lesson.bindings.map((b) => b.assetId)),
  assets = catalog.assets.filter((a) => ids.has(a.id));
const sha = (raw) => createHash('sha256').update(raw).digest('hex');
if (
  lesson.id !== 'g2-multiply-01-v1' ||
  assets.length !== 23 ||
  assets.reduce((n, a) => n + a.bytes, 0) !== 217542
)
  throw new Error('Pilot allowlist changed; review first');
const upload = join(root, 'data/resource-audit-20261116/pilot-upload/sha256');
mkdirSync(upload, { recursive: true });
for (const asset of assets) {
  const file = join(root, 'data/resource-audit-20261116/r2-upload', `${asset.id}.m4a`);
  if (sha(readFileSync(file)) !== asset.sha256) throw new Error('Invalid local asset');
  copyFileSync(file, join(upload, `${asset.id}.m4a`));
}
const row = {
  classroom_id: lesson.id,
  cache_key: `prepared:china:${lesson.id}`,
  curriculum_track: 'china',
  canonical_id: `pep:${lesson.topicId}`,
  title: `二年级数学 · ${lesson.title} · 海边探索`,
  owner_id: null,
  kind: 'prepared',
  entry_path: `/school-learning/china/adventure/${lesson.id}`,
  status: 'testing',
  is_public: true,
  submitted: true,
  checks: {
    pass: true,
    sourceContentSha256: lesson.sourceContentSha256,
    courseContractSha256: sha(JSON.stringify(lesson)),
    sourceRelease: 'v1.8.3',
    sourceCommit: catalog.source.commit,
    semanticReview: 'bounded-operator-review',
    teacherSignoff: false,
    questionCount: lesson.questions.length,
    mediaCount: assets.length,
    mediaBytes: 217542,
  },
};
writeFileSync(
  join(root, 'data/resource-audit-20261116/pilot-publication.json'),
  JSON.stringify(row, null, 2),
);
console.log(
  'One pilot prepared: 6 questions, 23 files, 217542 bytes. No AI call. Other five candidates remain unopened.',
);
if (process.argv.includes('--apply')) {
  const { loadEnvConfig } = createRequire(require.resolve('next/package.json'))('@next/env');
  loadEnvConfig(root);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (new URL(url).hostname !== 'xattfglcjiojuozvqsjw.supabase.co')
    throw new Error('Wrong Supabase project');
  const db = createClient(
    url,
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  const { error } = await db.from('course_library_candidates').insert(row);
  if (error && error.code !== '23505') throw new Error(`Publication failed: ${error.code}`);
  const { data, error: readError } = await db
    .from('course_library_candidates')
    .select('classroom_id,checks')
    .eq('classroom_id', lesson.id)
    .single();
  if (readError || data?.checks?.courseContractSha256 !== row.checks.courseContractSha256)
    throw new Error('Stored edition differs; existing course was not overwritten');
  console.log('Verified: the single pilot is registered in the existing public testing library.');
}
