# Classroom v6 and homepage — 2026-11-16

## Latest approved scope

The user prioritizes one excellent low-grade experimental lesson and a clear, attractive homepage. Good reusable public resources can be selected later; missing content can still be prepared with AI. Do not force a weaker imported recording or player into a course. Billing and bulk public-library imports are deferred. No new application, learner identity, payment system or infrastructure is introduced.

ChinaStudyFree/congcong-school's useful gamification patterns are short tasks, immediate feedback, a visible learning route, optional encouragement and returning to practice. This delivery adapts those ideas in our existing classroom: eight thinking stops, two counter games, per-chapter exploration stamps, retry without a timer or penalty, and fictional companions. It does not import the upstream wardrobe, gem economy, local profiles or a second progress store. No new upstream source/media was copied in this delivery; existing source notices remain intact.

## Experimental lesson

- Full course stays at `/school-learning/china/multiplication-lab`. Existing exact topic, two canonical checks, learner session, attempts, save/replay and parent preview are retained. Previously completed learners can use the welcome/replay controls; prior scores are not reset.
- The new authored teaching media is `/lessons/multiplication-narrated-v6.html`; v5 and older published files remain available. Same learning objectives and assessment contract; this is a new teaching edition of the multiplication experiment, not a claim of a different curriculum topic or automatic mastery.
- Three short chapters have eight child-controlled thinking stops and two tap-to-fill grouping games. Added warm colour treatments, gentle diagram motion, exploration stamps and a consistent teacher/room during the course's observation, operation and assessment steps. Motion-reduced/static fallbacks remain.
- Three scripted classmate turns: 朵朵 counts boxes but forgets objects inside; 乐乐 assumes unequal groups still represent three twos; 小宇 demonstrates a correct way of checking the diagram. Both misconceptions have an explicit, separately recorded teacher correction. These are fictional authored roles, not live children or independently running agents.
- Child tries before hearing a classmate. When a misconception is revealed, continuing stays disabled until the teacher correction finishes or the child explicitly confirms reading/understanding it. Audio failure retains visible text and explicit read-through. Teacher and classmate speech use one audio element; the main lesson remains paused. No automatic simultaneous dialogue.
- Graphics remain the existing WebGL teacher/classroom and animated SVG classmate portraits, not a fully navigable 3D school. Mathematical diagrams stay exact native quantities. Existing shared illustration, opener video and welcome are reused; ordinary replay makes no model requests.

## Recording quality correction

Initial new speech exposed instruction leakage and truncated content. Those four drafts were replaced. The recording tool now sends **plain authored speech text only**, without the previous style-instruction prefix. All thirteen active lesson clips (eight teacher, three companions, two corrections) were rechecked against ASR transcripts. Normalized text similarity is at least 0.941, with no detected style-instruction leakage in the final set. ASR is a content check, not human judgment of pronunciation, naturalness or teaching quality.

Seventeen new speech requests were made during this delivery, including four superseded drafts. Final speech uses the already configured SiliconFlow `FunAudioLLM/CosyVoice2-0.5B`; transcription checks used `FunAudioLLM/SenseVoiceSmall`. No learner data was sent. No dollar cost is inferred from request counts. `eval/video-lesson/child-paced-v6-assets.json` records exact active text, durations, bytes, hashes and recognized text; no credential or signed provider URL is included.

The main narration timeline is about 78.77 seconds, excluding all child thinking/game time and optional companion/correction turns. It is not the total lesson duration. The unchanged welcome recording is separate from the thirteen new-edition clips.

## Homepage and public preview

- Real homepage remains `/` at `tutor.uploadsoul.com`. Keeps authenticated server role resolution; no sign-out is performed. No `/home` alias or replacement identity flow.
- Chinese/English homepage explains each mode with **when to choose it → how to use it → what it helps with**. School follows the curriculum, Tutor handles personal questions/materials/practice, Interactive Classroom creates topic/material-based classes. Authenticated buttons route to the relevant existing module; unauthenticated visitors register/sign in through existing flows.
- Removed inactive plan buttons, placeholder contact email and fabricated family statistics from this homepage. No payment or subscription claims are introduced. Tutor memory/practice/path descriptions reflect existing native features; School and native records are not falsely described as one merged history.
- `/classroom-preview` is an openly shareable **authored media preview**, with all three narrated chapters, real games and the existing teacher/classmates. No login, learner record requests, personal prompt, AI generation or mastery writes. Full saved learning still uses the existing authenticated lesson.
- Three real, privacy-safe screenshots of our own components are published in `/images/classroom-preview.webp`, `/images/classmate-preview.webp`, `/images/game-preview.webp`. They contain no learner profile, scores, uploaded materials or account information. The two other homepage module illustrations remain illustrations, not claimed screenshots of native apps.
- `/media/classroom-tour.webm` is a recorded real operation clip with the teacher, classmate discussion and grouping game. It is explicitly labelled a **silent preview**. The adjacent link opens the real narrated interactive preview. No synthetic video pretends to show real functionality. Media uses controls, no autoplay and `preload=none`.
- Captures come from `scripts/check-classroom-showcase.mjs`, which mounts the actual public components with local published assets and no learner APIs. Trimming the blank recording lead-in uses Playwright's existing bundled FFmpeg; it adds no runtime dependency. Captures demonstrate the interface, not a production student-record test.

## Validation and remaining acceptance

- Existing 541 unit tests passed; lint retains only the pre-existing layout custom-font warning.
- Production build and TypeScript passed after the player/home integration.
- Native composition checks sampled 25 frames. Narrated-player checks pass for all eight pauses, gentle retries, both games, teacher-correction gating, audio playback/seek and 390px caption layout.
- Full multiplication component checks passed: WebGL/focus/static teacher, actual grouping gate, same-session assessment, native handoff form, replay without new writes, phone resume and parent preview.
- Public showcase check verifies WebGL, hand-raising, correction speech, one active audio owner, three screenshots, decoded operation clip, language switch, mobile width and **zero learner API requests** from the public preview.
- Final formatting, i18n key alignment and the original four E2E flows passed. Deployment publication is verified separately after push. Child testing remains the quality acceptance gate; do not mark all low-grade automatic generation or all School courses upgraded by this one edition.

Next work follows user feedback on this lesson/homepage, then returns to selecting public-library resources. No bulk source download or library rollout is needed before testing this delivery.
