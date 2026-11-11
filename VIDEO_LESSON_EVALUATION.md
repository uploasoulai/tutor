# Video Lesson and classroom presentation decision — 2026-11-10

## Decision

Retain native Video Lesson and prioritize a bounded pilot. Do not automatically route School Learning to it yet. It complements, rather than replaces, courses requiring manipulation, discussion or quizzes. No duplicate full lesson generation. Personal AI Tutor retains its installed features.

## Evidence from the pinned source

- `deeptutor/agents/video_lesson/runtime.py`: compiles a browser Remotion player, validates sample frames in an isolated interpreter, and writes a page. It does not encode a server-side movie. This favors small server resources compared with full video rendering.
- First use installs pinned npm tooling. Install/build/frame-check timeouts are 900/600/180 seconds. These bounds demonstrate potentially long work, not observed durations or a memory guarantee.
- `capability.py`: up to four generation/repair attempts plus layout checks. A failed first draft can multiply model usage; a short video is not necessarily cheaper than three classroom scenes.
- `services/setup/init.py`: source defaults allow up to 48,000 output tokens for video_lesson. This is a ceiling, not measured consumption; production settings may differ. Do not assume a low monthly cost or apply this budget to ordinary courses.
- `narration.py`: includes configured voice handling, Edge narration and silent estimated-caption clips. Availability depends on deployment/network/services. The source alone does not establish usable narration or accurate timing on production.

## Pilot acceptance

Start with one short China elementary-math concept, a single job, a modest scene count, and no parallel indexing/research. Preserve the same learning goal and questions as the classroom comparison. Confirm real host CPU/RAM first, then record wall time, peak resource usage, attempts, provider usage where available, teaching accuracy, screen fit, caption/audio alignment, pause/seek and mobile playback. Reuse generated output rather than repeating generation merely to replay it.

Promote Video Lesson only if its teaching and playback quality justify its generation time and cost. For a failed video, preserve the teaching specification and offer ordinary guided explanation; do not automatically launch a second full renderer and bill another generation without a deliberate policy.

Current status: production read-only preflight and an isolated local compiler pilot completed. Production has Node v22.23.4/npm 10.9.9, but no installed video runtime packages or edge_tts dependency. No production video dependency installation or model generation was performed.

The local pinned runtime installed 16 packages in 15 seconds. An original scripted 20-second fraction lesson compiled and passed 25 isolated frame samples in approximately 1.3 seconds, producing a 583,097-byte player bundle. This is a compiler smoke test, not a measurement of AI generation, visual acceptance, narration sync, mobile usability or resource peak. The silent, public demo at `/demos/fractions-video.html` contains authored sample teaching content only, no learner material. The fixture is `eval/video-lesson/fractions.tsx.txt`.

## Classroom shell implemented in this patch

The first spatial classroom is CSS perspective scenery plus an original SVG teacher around the existing live DOM screen. It adds no Three.js, GPU server, external models, media API or generation calls. Student interactions remain normal HTML with unchanged hit coordinates. The teacher gesture is decorative playback feedback, not lip synchronization. Focus view removes scenery; presentation/authoring bypass it; narrow/short layouts show the ordinary lesson, and reduced-motion disables gestures.

This is a lightweight spatial prototype, not a WebGL 3D world. Measure classroom usability and customer reaction before investing in low-poly GLB assets, WebGL loading and device compatibility. A later true 3D shell should remain optional, lazy-loaded and independent of the teaching engine.

Grade-2 reviewed-trial update (2026-11-11): the multiplication trial now includes a separate, lazy-loaded real WebGL teacher/classroom built from small local meshes. It uses no downloaded models, runtime dependency, server GPU, or generation call. Playback drives a gentle gesture; focus mode preserves the active player, reduced-motion keeps a static pose, and graphics failure shows the original static teacher. This changes only the reviewed Grade-2 trial; the full Interactive Classroom's earlier CSS prototype described above remains separate. General AI-generated video/classroom quality is still under evaluation.

## Read-only production preflight

Run `scripts/tutor_video_preflight.py` inside only the confirmed Tutor container. It reports Node/npm, pinned runtime package readiness, narration dependency, free disk and cgroup memory where available. It installs nothing, sends no model request and prints no secrets. These checks do not prove the module is enabled, that narration can reach its service or that a generated lesson passes acceptance.

## Native AI generation pilot and decision

Two bounded native model calls used only an operator-authored fractions question and no learner history. First generation: 33.47s, 10,172 input / 847 output tokens, 108.1 MiB peak RSS for the isolated writer process. One targeted repair: 42.10s, 11,178 input / 1,301 output tokens; the provider reported 10,112 cached input tokens; 110.6 MiB process peak. These are not whole-container peaks or server rendering measurements. Total reported usage: 23,498 tokens. No verified USD calculation was made.

The initial draft passed the old frame checks but declared 300 frames against a 455-frame narration timeline, cutting off the final teaching question. The repair used lessonLength correctly but left two narration entries disconnected; source review also found content overlap risk and CSS transition timing. Neither draft is published as a course. The earlier public demo remains the scripted baseline.

The kit now rejects a Scenes composition shorter than its narration timeline or containing disconnected narration entries. The compiler stops checking duplicate frames on these static failures, returning one concise repair message. Both writer prompts emphasize derived duration, complete endings, requested short-course length and plain integer counts. No capabilities or rendering engines were removed.

Five offline regression cases cover complete output, a short timeline, orphan narration, and both captured native AI failures. Correct output still passes 25 sampled frames. Run `node scripts/check-video-timeline.mjs` with the isolated pinned tooling already installed; it makes no model call. Fixture text is test data and is not served to learners.

Production Tutor image `1.7.1-sso1-ecs-20261110-video-guards` is deployed and healthy. The prompt and guards were confirmed loaded and public/local login returned 200. Production Remotion package installation and voice availability remain separate, uncompleted gates; no production package/voice installation was performed. Layout, audio alignment, mobile playback and cost comparisons remain unaccepted. School Learning stays on its existing classroom renderer.

Preflight scope: runtime package readiness was checked in the operator process context. Native runtime directories may be learner-specific; this was not an audit of every learner workspace. No learner directories were scanned or modified.

## Reviewed narrated pilot — 2026-11-11

The fraction course now uses three chapters compiled from one authored storyboard through the installed native Remotion kit. Eight short utterances were recorded through the existing native `speak` Edge path using isolated local Python tooling. Each actual MP3 duration determines its frames; the native kit connects audio and captions to the same scene. This uses no LLM and sends only fixed authored text to the recording service. It is an operator preparation step, not an automatic student-facing TTS call. The ~1 MB static asset is reused across learners without copying media into their records. Production runtime dependencies remain unchanged.

25 native frame samples and real browser playback checks pass: non-silent audio decoding, pause, seek alignment, full-screen controls, restart/end/chapter bounds, eight matched pictures/captions and phone width. Full six-step lesson flow and blocked-media fallback are checked separately with mock APIs. The authored materials and visual layout were reviewed; voice naturalness, educational results and real signed-in website acceptance still need student/parent feedback. These observations do not promote unrestricted native model-written video to automatic School routing.
