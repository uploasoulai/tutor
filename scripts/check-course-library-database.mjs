/** Real isolated Postgres/WASM checks. No cloud credentials or learner data. */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const require = createRequire(join(root, 'data/course-library-db-check/package.json'));
const { PGlite } = require('@electric-sql/pglite');
const db = new PGlite();
const owner = '11111111-1111-4111-8111-111111111111',
  other = '22222222-2222-4222-8222-222222222222';
try {
  await db.exec(`CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;
  CREATE TABLE curriculum_lesson_artifacts(classroom_id text,cache_key text,curriculum_track text,canonical_id text,storage_path text,artifact_sha256 text,status text);
  INSERT INTO auth.users VALUES('${owner}'),('${other}');`);
  const migration = readFileSync(join(root, 'supabase_course_library_migration.sql'), 'utf8');
  await db.exec(migration);
  await db.query(
    `INSERT INTO course_library_candidates(classroom_id,cache_key,curriculum_track,canonical_id,title,owner_id,entry_path,checks) VALUES
    ('first','same-key','china','pep:cnm_p038','First',$1,'/classroom/first','{"pass":true}'),
    ('second','same-key','china','pep:cnm_p038','Second',$1,'/classroom/second','{"pass":true}'),
    ('broken','other-key','china','pep:cnm_p039','Broken',$1,'/classroom/broken','{"pass":false}')`,
    [owner],
  );
  const review = (id, status, checks = { accurate: true, ageAppropriate: true, works: true }) =>
    db.query('SELECT review_course_library_candidate($1,$2,$3,$4)', [
      id,
      status,
      owner,
      JSON.stringify(checks),
    ]);
  const feedback = (id, user, kind, recommend) =>
    db.query('SELECT record_course_library_feedback($1,$2,$3,$4)', [id, user, kind, recommend]);
  await assert.rejects(() => review('first', 'recommended'), /submission/i);
  await assert.rejects(() => feedback('first', other, 'understood', true), /unavailable/i);
  await feedback('first', owner, 'understood', true);
  await feedback('first', owner, 'difficult', true);
  let row = (await db.query("SELECT * FROM course_library_summary WHERE classroom_id='first'"))
    .rows[0];
  assert.equal(row.feedback_count, 1);
  assert.equal(row.recommendation_count, 1);
  assert.equal(row.difficult_count, 1);
  assert.equal(row.understood_count, 0);
  await assert.rejects(() => review('first', 'recommended', {}), /Human review/i);
  await review('first', 'recommended');
  await feedback('first', other, 'understood', true);
  row = (await db.query("SELECT * FROM course_library_summary WHERE classroom_id='first'")).rows[0];
  assert.equal(row.recommendation_count, 2);
  await feedback('second', owner, 'understood', true);
  await review('second', 'recommended');
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int n FROM course_library_candidates WHERE cache_key='same-key' AND status='recommended'",
      )
    ).rows[0].n,
    1,
  );
  row = (await db.query("SELECT * FROM course_library_candidates WHERE classroom_id='first'"))
    .rows[0];
  assert.equal(row.status, 'retired');
  assert.equal(row.is_public, true);
  await feedback('broken', owner, 'interaction_issue', true);
  await assert.rejects(() => review('broken', 'testing'), /Basic checks/i);
  await db.exec(migration);
  assert.equal(
    (
      await db.query(
        "SELECT count(*)::int n FROM course_library_feedback WHERE classroom_id='first'",
      )
    ).rows[0].n,
    2,
  );
  await db.exec('SET ROLE authenticated');
  await assert.rejects(
    () => db.query('SELECT * FROM course_library_candidates'),
    /permission denied/i,
  );
  await assert.rejects(() => review('second', 'recommended'), /permission denied/i);
  await db.exec('RESET ROLE');
  console.log(
    'Library database passed: executable/idempotent migration, author consent, one vote per learner, multiple recommendations, mandatory review, atomic default replacement, old versions retained, bad candidate rejection and direct-client permission denial.',
  );
} finally {
  await db.close();
}
