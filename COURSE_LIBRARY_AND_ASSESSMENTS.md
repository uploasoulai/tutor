# Shared lessons and curriculum assessments

## Current product decision

During testing, all signed-in users can reuse structurally valid **official curriculum** lessons. New generated editions are public trials, not automatically quality-endorsed. Set `COURSE_LIBRARY_TEST_REUSE=false` only when moving to the future private-candidate policy. Personal tutor chats, files, responses and learner histories are never published by this mechanism.

The library normally shows one edition per exact curriculum/language/version cache key: a manually recommended edition first, otherwise the oldest available trial. Other explanations are optional. Opening another learner's edition creates/reuses the current learner's own School session; it never copies the author's progress. BC gallery opening is a preview; the BC curriculum board records learning. A new generation gets a new classroom ID and compressed private storage snapshot, so old links and histories remain intact. The bucket remains private; the authenticated server checks access.

Feedback is optional, one current response/recommendation per learner and edition. Several recommendations accumulate on the same candidate; they never create copies or automatically elect a winner. Admin review checks accuracy, age suitability and working interactions. Exactly one edition per exact cache key can be recommended, using an atomic review operation. Previously shared editions remain available to their existing links.

## Easy-to-find assessment and tutor tools

`/school-learning/assessments` is linked from **Your learning space** and School Learning. Select primary grade, subject, semester and unit/midterm/final practice scope. The existing China curriculum question bank supplies objective items; no additional model call is needed to assemble or grade them. Midterm means the first half of the available term directory; final covers that term. These are revision papers, not claims of official school exam alignment. A small paper spreads selection across the selected knowledge-point range. Actual question count can be less than requested if the pool is small.

Only unambiguous single-choice and numeric items receive automatic scores. Numeric grading compares exact integer/decimal/fraction values without evaluating arbitrary expressions. Writing, open explanations and subjective work are not automatically graded as right/wrong. Those can be discussed with the tutor. Answer keys stay in a server-private snapshot, not the browser payload. The server ignores client-supplied scores and binds every read/submit to the authenticated learner.

Submission stores a report in the existing learner's history and records answered-item attempts through the existing curriculum mastery function. Blank items count toward the paper's score but do not reduce mastery. Row locking and a transaction retain the first submitted result, prevent double counting and roll back partial writes. Parents/admins can preview without student/session creation or mastery writes.

Reports show the missed/unanswered items and this paper's knowledge-point performance, with a direct return to the curriculum topic. The “错题与家教” tab also reads recent reports directly: latest answered result per question across the last 20 papers, unresolved mistakes and counts by knowledge point. A later correct answer removes the stale mistake from this summary; full reports remain unchanged. An answered mistake can be explicitly handed to the same Personal AI Tutor workspace for Socratic coaching. The prompt includes the question/options and learner response, is one-time/learner-bound, and is prefilled for review, never auto-sent. Native question-notebook/mistake tools remain responsible for their own coaching records; the platform does **not** claim every exam error has already been inserted into the native notebook. The report remains the durable record of every exam error.

The “错题与家教” tab links straight to the native mistake notebook, spaced review and mastery paths. Native tutor records and School curriculum records share identity but are distinct sources, clearly labeled. The native grader itself currently conservatively grades MCQs; it is not a ready-made grade/term exam organizer. No duplicate tutor workspace or parallel explanation agent was added.

## Delivery and verification

- Additive migrations: `supabase_course_library_migration.sql`, `supabase_school_assessments_migration.sql`; both applied to the verified project `xattfglcjiojuozvqsjw` through Chrome. Both tables are RLS-enabled and server-only. Local Postgres checks cover execution/idempotence, access denial, atomic review, immutable first score, rollback and no duplicate mastery.
- Runtime backend-only image: `coastaltutor/deeptutor:1.7.1-sso1-ecs-20261115-practice-shortcuts`. Adds only native SSO modes for question bank/mistakes; existing mounts, environment, UI and tunnel are retained. No GPU, additional server, paid-model dependency or frontend rebuild.
- UI check: `node scripts/check-learning-library-ui.mjs` uses real components with isolated mock APIs, including mobile report layout, preview isolation, wrong-answer handoff and alternative edition display. It does not impersonate a production student.
- Course generation guidance now distinguishes Grades 1–2, 3–4 and 5–6. Existing curated Grade-2 media is not a guarantee of identical prerecorded media quality in every other lesson. Existing authorized provider/key configuration is preserved; BYOK never silently falls back to a platform key.

## Deferred, without blocking testing

Subjective answer rubric scoring, a teacher-curated exam bank, varied paper seeds, pagination beyond the initial 100 library editions and more comprehensive curriculum coverage can follow real tester feedback. Before charging for service, revisit publication consent and any personal content filtering. Generic generated lessons still use their existing configured media capabilities; this release does not silently enable every paid image/video/audio provider.
