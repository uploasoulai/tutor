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

Current status: source audit complete; production dependency preflight and actual generated/playback comparison not performed. No new dependency installation or production toggle change in this patch.

## Classroom shell implemented in this patch

The first spatial classroom is CSS perspective scenery plus an original SVG teacher around the existing live DOM screen. It adds no Three.js, GPU server, external models, media API or generation calls. Student interactions remain normal HTML with unchanged hit coordinates. The teacher gesture is decorative playback feedback, not lip synchronization. Focus view removes scenery; presentation/authoring bypass it; narrow/short layouts show the ordinary lesson, and reduced-motion disables gestures.

This is a lightweight spatial prototype, not a WebGL 3D world. Measure classroom usability and customer reaction before investing in low-poly GLB assets, WebGL loading and device compatibility. A later true 3D shell should remain optional, lazy-loaded and independent of the teaching engine.
