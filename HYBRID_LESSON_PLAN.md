# Hybrid School Learning — current delivery

The latest user approval authorizes one course to combine short Video Lesson segments with classroom interaction. One teaching blueprint owns the goals, examples, sequence and assessment. Select a renderer per segment; do not have both applications independently generate two full courses. The reviewed pilot now has six learner-controlled steps. General course preparation uses separate saved steps rather than packing the whole course into one 300-second request.

## Implemented pilot scope

- Route: `/school-learning/china/fractions-lab`; entry inside China topic `cnm_p226` (grade 3, recognising fractions).
- Six-step flow: notice equal parts → narrated explanation → shade a fraction → narrated reasoning → two existing bank questions → narrated recap. Content is reviewed/authored, not automatic video generation for all topics. The manipulative remains controlled platform UI, not a generated classroom widget.
- Three chapters share one versioned native Remotion player (~1 MB, 58.2 seconds total). Eight short voice clips use the pinned Tutor narration code's existing Edge path at operator build time, with actual MP3 durations measured before computing frame ranges. Only fixed authored text was sent; no learner text, LLM, key or paid provider is used. The serving app/ECS needs no voice or rendering dependency.
- Each picture, subtitle and audio utterance is connected to the same scene timeline. Chinese play/pause, seek, restart and fullscreen controls preserve the current chapter; no loop or automatic advance into an assessment. A larger phone caption and equivalent text/diagram fallback preserve access.
- The iframe exists only during its chapter. Advancing or choosing fallback unmounts it; no outer narration competes with it. Ready/error messages are bound to the actual iframe window and chapter. Video ending does not save completion. Static output replays without voice/model calls or per-learner media copies.
- Existing Supabase learner UUID, `learning_sessions`, curriculum attempt RPC and mastery records are reused. No migration, extra user account, worker, GPU, model key or payment configuration is introduced.
- The existing student history opens this pilot at its owner-scoped session URL. Completed lessons can replay explanation/interaction without new writes or attempts; verified assessment IDs supply the history activity count. Checkpoints resume through the owner-scoped session URL. Correct question IDs are read server-side. Entering recap or completing requires both distinct existing curriculum questions to have a correct attempt in this learner/session/topic; repeated answers to one question or another session do not qualify. Completion means assessment passed, not independently verified video watch time.
- Wrong answers can be prefilled into the same learner's Personal AI Tutor through the existing signed bridge. No answer key is included and nothing is auto-sent.

## Verification and limits

The native compiler validates 25 sample frames. Real browser checks play all three audio chapters, decode non-silent audio, verify pause stops audio/picture, compare post-seek audio position, inspect eight matching shot/caption pairs, verify end/replay boundaries and fullscreen controls, and inspect desktop/390px layouts. The full lesson harness covers six steps, incorrect-answer handoff, recap assessment gate, fallback including blocked media, read-only replay and session resume. APIs are mocked there; signed-in production tester acceptance remains open.

Run `node scripts/check-narrated-fractions.mjs` and `node scripts/check-hybrid-ui.mjs` using the existing isolated pilot tooling. Source storyboard is `lib/curriculum/fractions-storyboard.json`. `scripts/prepare-fractions-narration.py` requires explicit `--record` for network recording; existing text/voice-matched clips are cached. Operator tooling was isolated under `data/narration-tooling` (edge-tts 7.3.1, mutagen 1.48.1). `node scripts/build-fractions-video.mjs` only consumes prepared clips and the pinned kit; it makes no network/model call. These operator/browser scripts are separate from ordinary CI and application dependencies.

`data/` runtime/pilot/deployment artifacts are excluded from the application TypeScript compile; video tooling is not an application dependency.

## Next gates for general generation

1. Validate this complete learner flow with testers before adding more subject matter.
2. Generate one validated segment blueprint from the curriculum and allowed learner context. Prepare only required outputs, with separate durable step results/retries and a clear per-course cost budget.
3. Accept native Video Lesson clips only after timing, narration linkage, layout and educational review pass. Use ordinary teaching content when a clip fails; do not silently charge for a second complete course.
4. Extend to six meaningful steps where useful: question → short explanation → manipulation → worked reasoning → assessment → recap. Interaction pauses are learner-controlled; there is one narration owner at a time.
5. Extend narration beyond the reviewed authored pilot only when the generated-course voice provider is configured and pause/seek/segment-switch synchronization passes. Reuse successful artifacts and keep student records separate.

The general School Learning generator and both full native applications retain their existing capabilities. This pilot is a dedicated alternative for one curriculum topic.

## Durable classroom preparation (2026-11-11)

The next delivery is the reusable preparation foundation, not a declaration that automatic mixed video courses are complete. China/BC text curriculum requests now ask the existing classroom engine for six short teaching scenes. The outline, each content/action pair, and final publish are separately persisted in `classroom_generation_jobs.job_data.schoolGeneration`. An owner-scoped JSON revision compare-and-swap claims each step, with a lease longer than the hosting function limit. Completed steps are never automatically repeated; failed steps require explicit retry. Reservations/attempts are persisted before a call, including crash recovery. Per-job defaults are 28 call reservations and two attempts per step, configurable through `SCHOOL_LESSON_MAX_CALLS` and `SCHOOL_LESSON_STEP_ATTEMPTS`; these are operational bounds, not user-visible credits or dollar allowances. Platform billing still uses its separate actual-token ledger/configured rates.

A polling page schedules one step through the existing hosting lifecycle. If all pages close, only the current step finishes; returning to the saved session continues. There is no promise of unattended generation. China history links and refreshed URLs restore the same learner/session/job. Explicit retries preserve the outline, earlier scenes and pending content. Completed artifacts remain in compressed shared storage, while job scene duplicates are released. No migration or additional hosted runtime is required.

A real operator fixture produced six scenes across 387.515 seconds (13 calls; 75,020 input / 10,981 output tokens). Runtime/code review rejected its generated game, and a bounded simulation refinement still showed counter-state concerns. Structural completeness is not educational acceptance. For exact introductory multiplication topic `cnm_p038`, a reviewed six-object grouping activity now passes native classroom content/action integration without extra model calls and real browser controls/reset/keyboard/mobile checks. It does not substitute for other topics or count as a graded mastery attempt. General generated widgets remain subject to further review; timed/drag-only drafts are rejected, with compact touch activities preferred.

Remaining work: validated cross-renderer teaching specifications, accepted automatic native video clips, synchronized narration for general generated courses, wider topic-quality coverage and signed-in tester acceptance. The reviewed fraction pilot now has recorded narration; automatic generation remains separate.

## Grade-2 archive trial (latest user preference)

`/school-learning/china/multiplication-lab` is the primary next test course, using exact graph topic `cnm_p038` and questions `cnm_p038_q2`/`cnm_p038_q3`. Eight reviewed group pictures/utterances form three native chapters around the existing controlled grouping manipulative. They share the recorded-player controls and operator tooling (`--multiplication` selects the Grade 2 storyboard). No generated JS or second full course planner is introduced.

Opening saves one owner-bound deterministic bookmark per learner and lesson, labeled test content. It is `planned`, not studied/completed, until explicit learner actions. The learning profile stores only the media reference and progress; the shared ~1.1 MB asset is served once per version. Dashboard history and the China topic link reopen the same owner session. Existing fraction sessions remain valid. Completed replay creates no new attempts or record rows. The current account must be signed in to verify an actual production archive write; no fabricated test identity or learner history is created.

## Shared access and the visible Grade-2 classroom

The multiplication trial is shared by all signed-in accounts at the same base URL. Student bookmarks/progress remain owner-bound. Parent/teacher/admin viewers see the same prepared media and controlled manipulation with a local, ungraded authored mini-check; their preview never creates a student record or reads private bank answers. Do not call the preview a completed learner session. Unauthenticated visitors sign in first.

The Grade-2 video wrapper now offers a lazily loaded browser WebGL classroom/teacher and a focus view. Render only small authored meshes, cap pixel density and gesture frame rate, stop background/paused work, and dispose resources on unmount. Keep playback as ordinary DOM so controls and tap coordinates are unchanged. Graphics-disabled and reduced-motion paths must preserve access to teaching. No server GPU or new generation request is introduced. This extends the prepared trial, not general automatic video-course generation.
