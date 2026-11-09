# School Learning architecture decisions

## Product responsibilities

- CoastalTutor owns the learner identity, curriculum route, course sequence, mastery progress, and family-facing learning experience.
- School Learning follows a selected curriculum or knowledge graph and generates a guided, interactive classroom for each learning goal.
- Personal AI Tutor opens the branded DeepTutor workspace for learner-initiated questions, mistakes, reading, research, notes, and personal study.
- Interactive Classroom remains the existing classroom authoring and playback module.
- All three routes use the platform learner identity. DeepTutor receives the same stable learner UUID through host SSO and keeps its own account-scoped Personal AI Tutor workspace.
- CoastalTutor remains the source of truth for School Learning curriculum sequence, course attempts, and mastery. DeepTutor's personal mastery paths, Practice/Question Notebook, tutor memory, and reading progress stay in the learner's DeepTutor workspace; do not copy them into CoastalTutor or create a second student account to display them.
- The host SSO bridge synchronizes saved learner profile fields (grade and, when present, curriculum/language) into DeepTutor so its tutor can adapt explanations. A parent's SSO also syncs these fields for linked child accounts. DeepTutor-specific profile preferences remain managed by DeepTutor.
- Parent-child links are platform-owned and synchronized to DeepTutor's guardian relationship model at sign-in. DeepTutor's current guardian screen manages approved materials and access grants; it does not report the learner's study activity or mastery. CoastalTutor family reports cover School Learning activity. A combined family report is a later integration task, not an assumed feature.
- CoastalTutor provides role-checked single-sign-on shortcuts to DeepTutor Practice/mistake review, Mastery Paths, personal learning progress, learner profile, and parent Guardian reports. These open DeepTutor's native screens in the same per-learner workspace instead of reproducing them in CoastalTutor.
- An incorrect School Learning answer stays in CoastalTutor's curriculum mastery record and can be handed to the learner's same-identity DeepTutor chat using a signed, short-lived SSO claim. DeepTutor receives the prompt through a one-time HttpOnly cookie bound to that learner ID and pre-fills its composer for the learner to review. The request asks the tutor to coach step by step and save the mistake through DeepTutor's native question-bank tool. The handoff omits the answer key and does not reveal the course explanation before the learner asks DeepTutor for help.

## Learning record ownership and family view

- Keep one CoastalTutor/Supabase learner UUID and one corresponding DeepTutor workspace. Do not create mirrored learner accounts or copy raw DeepTutor chat, notes, or question-bank records into CoastalTutor.
- CoastalTutor is authoritative for BC/China curriculum enrollment, course sessions, answers, completion, and curriculum mastery. DeepTutor is authoritative for Personal AI Tutor conversations, its native mastery paths, practice/question notebook, and study activity.
- The learner and parent experience should present one learning timeline by reading each system's authorized summaries at request time. Keep source labels and timestamps; retain only a short-lived cache for performance if needed. Parent access must use the platform's verified parent-child link and DeepTutor's guardian grant. If DeepTutor is unavailable, show CoastalTutor records and clearly mark tutor activity as temporarily unavailable; never imply its records are empty.
- Wrong answers from School Learning remain attached to the curriculum session and are handed to the same learner's Personal AI Tutor. DeepTutor owns the coaching conversation and its native saved-mistake entry. Do not store a duplicate copy of the tutor conversation in the School Learning database.

## Reusable curriculum lessons and storage

- Separate a reusable course artifact from a learner's learning session. A course artifact contains the curriculum-grounded lesson and interactions; each learner gets an independent session row for attempts, completion, mastery, and review scheduling.
- Reuse a published artifact across learners only when its cache identity matches the curriculum track, jurisdiction, textbook/edition, grade, subject, canonical outcome/topic ID, language, learning objectives, and lesson-generation schema/prompt version. Include relevant source-data revisions so a changed graph or BC outcome invalidates the old artifact.
- Cache only successful, quality-checked artifacts. A first generation remains a draft until its structure and answer paths pass server-side validation; bad or partial generations must not become the shared lesson. Keep explicit revisioning and an admin invalidation path.
- For current tester scale, use Supabase Storage for versioned lesson JSON and media objects, with a small Supabase metadata row for cache key, status, size, checksum, timestamps, and storage path. Do not keep growing course JSONB blobs in `learning_sessions`; the session should reference the reusable artifact. Keep storage behind a server adapter so the object store can move to an S3-compatible service (for example Cloudflare R2) as volume/cost needs become clear. Put media in object storage from the start; do not store generated video/image bytes in Postgres.
- Generated classroom JSON already stored in `generated_classrooms` is the current persistence path, not yet the long-term shared curriculum cache. Existing per-student `reuse_key` behavior reopens that student's session and does not provide cross-learner course reuse.

## BC and China lesson generation

- BC and China use the same underlying OpenMAIC-derived classroom generation engine (`generateClassroom`) for the interactive classroom output. Their curriculum adapters differ: China builds the prompt from a canonical knowledge-graph topic, standards, prerequisites, mastery criteria, and local questions; BC currently retrieves matching BC curriculum outcomes, builds a local instructional blueprint/quiz artifact, then asks the shared classroom engine to render it.
- The BC route therefore has more preprocessing and a legacy per-student lesson artifact layer; it is not yet the same end-to-end pipeline as China. The target is one curriculum-neutral pipeline: curriculum adapter → validated lesson specification → shared classroom engine → quality-checked reusable course artifact → learner-specific session/progress. Keep the adapter responsible for province, grade, subject, outcome, elaborations, and provenance.
- When BC source outcomes or elaborations are missing, generate only from the confirmed selected outcome and clearly mark the lesson as provisional; do not fabricate official curriculum text or block the student from a useful lesson. As the user adds curriculum data, the source revision changes the cache identity and lessons can be regenerated.
- The BC instructional blueprint and teacher-persona preference should remain lesson inputs where educationally useful. They must not create a second rendering engine or cause a fresh full classroom to be generated every time a learner opens the same outcome.

## China curriculum implementation

- The China route uses a downloaded, versioned knowledge graph for its complete included scope: topic nodes, hard/soft prerequisites, question bank, standards mapping, and available textbook mappings.
- CoastalTutor generates lesson prompts from the selected topic, mastery criteria, standards, prerequisite nodes, and sample questions. The legacy classroom generator renders the student-facing activity.
- The route records lesson sessions in `learning_sessions` and curriculum attempts/mastery against the same Supabase learner UUID.
- Private runtime data files live in `curriculum_data/china`; do not move the answer-bearing bank back under `public/`.
- Data provenance and the source-declared license are recorded in `THIRD_PARTY_NOTICES.md` and `public/curriculum/china/NOTICE.md`. The consumer-facing product name remains CoastalTutor.
- Classroom generation currently resolves the platform/server-configured model through the legacy generation service. It does not yet use one per-learner BYOK vault shared with DeepTutor; that remains a separate provider-integration milestone.

## Moodle decision: defer as a runtime platform

Do not add a second Moodle LMS instance to the current MVP. Moodle's courses, enrolments, accounts, gradebook, completion tracking, and competency tools overlap with CoastalTutor's current learner, curriculum, and progress responsibilities. Making Moodle authoritative now would create a second student identity and duplicate learning history; synchronizing both would add account matching, course mapping, grading, privacy, and operational work before the product's family-first learning path is ready.

Keep the current split: CoastalTutor is the learner-facing platform and source of truth; DeepTutor is the Personal AI Tutor; the existing classroom renderer powers School Learning sessions.

If a school customer later requires institutional rostering, formal class administration, or a Moodle gradebook, evaluate an optional LTI 1.3 integration. In that design, Moodle may launch a CoastalTutor activity, while CoastalTutor keeps the learner's primary record and accepts only the minimum school context required. Do not mirror conversations, notes, or the full learning history into Moodle.

Moodle provides both an LTI tool consumer and LTI 1.3 provider route, plus external web services. These are future integration options, not a reason to host Moodle now. Any later implementation must separately check Moodle core GPL obligations and plugin licenses.
