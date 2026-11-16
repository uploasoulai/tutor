/** Isolated Postgres test of exam snapshots, ownership and exactly-once scoring. */
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..'),
  require = createRequire(join(root, 'data/course-library-db-check/package.json')),
  { PGlite } = require('@electric-sql/pglite');
const db = new PGlite(),
  owner = '11111111-1111-4111-8111-111111111111',
  other = '22222222-2222-4222-8222-222222222222';
try {
  await db.exec(`CREATE SCHEMA auth;CREATE TABLE auth.users(id uuid PRIMARY KEY);CREATE ROLE anon;CREATE ROLE authenticated;CREATE ROLE service_role BYPASSRLS;
 CREATE TABLE learning_sessions(id uuid PRIMARY KEY,student_id uuid,session_type text,lesson_title text,status text,reuse_key text,lesson_payload jsonb,accuracy_rate numeric);
 CREATE TABLE attempts(student_id uuid,paper_id uuid,topic_id text,question_id text,correct boolean);
 CREATE FUNCTION record_student_curriculum_attempt(uuid,uuid,text,text,text,boolean,integer) RETURNS void LANGUAGE sql AS 'INSERT INTO attempts VALUES($1,$2,$4,$5,$6)';
 INSERT INTO auth.users VALUES('${owner}'),('${other}');`);
  const migration = readFileSync(join(root, 'supabase_school_assessments_migration.sql'), 'utf8');
  await db.exec(migration);
  const questions = [
    { id: 'q1', topicId: 'topic1', answer: '2' },
    { id: 'q2', topicId: 'topic2', answer: '3' },
  ];
  const id = (
    await db.query("SELECT create_school_assessment($1,'Math', '{}'::jsonb,$2) id", [
      owner,
      JSON.stringify(questions),
    ])
  ).rows[0].id;
  const report = {
    total: 2,
    correct: 1,
    answered: 1,
    results: [
      { questionId: 'q1', topicId: 'topic1', answered: true, correct: true },
      { questionId: 'q2', topicId: 'topic2', answered: false, correct: false },
    ],
  };
  const submit = (student, body = report) =>
    db.query('SELECT submit_school_assessment($1,$2,$3,$4) report', [
      student,
      id,
      '{"q1":"2"}',
      JSON.stringify(body),
    ]);
  await assert.rejects(() => submit(other), /unavailable/i);
  await assert.rejects(
    () =>
      submit(owner, {
        ...report,
        results: [
          report.results[0],
          { ...report.results[1], questionId: 'foreign', answered: true },
        ],
      }),
    /mismatch/i,
  );
  assert.equal((await db.query('SELECT count(*)::int n FROM attempts')).rows[0].n, 0);
  const saved = (await submit(owner)).rows[0].report;
  assert.equal(saved.correct, 1);
  await submit(owner, { ...report, correct: 2 });
  assert.equal((await db.query('SELECT count(*)::int n FROM attempts')).rows[0].n, 1);
  assert.equal(
    (await db.query('SELECT accuracy_rate::float n FROM learning_sessions WHERE id=$1', [id]))
      .rows[0].n,
    0.5,
  );
  assert.equal(
    (await db.query('SELECT report FROM school_assessments WHERE id=$1', [id])).rows[0].report
      .correct,
    1,
  );
  await db.exec(migration);
  await db.exec('SET ROLE authenticated');
  await assert.rejects(
    () => db.query('SELECT questions FROM school_assessments'),
    /permission denied/i,
  );
  await assert.rejects(() => submit(owner), /permission denied/i);
  console.log(
    'Assessment database passed: private answer snapshots, owner-only submission, transactional rollback, blank answers do not lower mastery, duplicate submission retains original score and cannot double-count, migration idempotence and browser-role denial.',
  );
} finally {
  await db.close();
}
