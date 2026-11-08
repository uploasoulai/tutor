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
