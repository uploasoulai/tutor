# Hybrid School Learning — first delivery

The latest user approval authorizes one course to combine short Video Lesson segments with classroom interaction. One teaching blueprint owns the goals, examples, sequence and assessment. Select a renderer per segment; do not have both applications independently generate two full courses. Six teaching steps are a future course design, not six outputs packed into one 300-second request.

## Implemented pilot scope

- Route: `/school-learning/china/fractions-lab`; entry inside China topic `cnm_p226` (grade 3, recognising fractions).
- Flow: native compiled caption-only explanation → reusable click-to-shade manipulative → two existing bank questions → saved completion. The explanation asset and interaction are pre-authored/reviewed; this is not automatic hybrid generation for all topics and the interaction is not an OpenMAIC-generated scene.
- The video iframe is present only during explanation; switching/fallback unmounts it, preventing audio continuing under another segment. No outer classroom narration plays over it. The learner explicitly advances; ending a video never automatically completes a lesson.
- Native player controls handle its own timeline. The pilot deliberately has no voice. A text/diagram fallback and phone fullscreen hint preserve access; this does not claim synchronized voice has been delivered.
- Static versioned lesson content is shared; no learner material is published. Replays add no model or media requests. The only runtime server work is authenticated record/answer access.
- Existing Supabase learner UUID, `learning_sessions`, curriculum attempt RPC and mastery records are reused. No migration, extra user account, worker, GPU, model key or payment configuration is introduced.
- The existing student history opens this pilot at its owner-scoped session URL. Completed lessons can replay explanation/interaction without new writes or attempts; verified assessment IDs supply the history activity count. Checkpoints resume through the owner-scoped session URL. Correct question IDs are read server-side. Completion requires both distinct existing curriculum questions to have a correct attempt in this learner/session/topic; repeated answers to one question or another session do not qualify. Completion means assessment passed, not independently verified video watch time.
- Wrong answers can be prefilled into the same learner's Personal AI Tutor through the existing signed bridge. No answer key is included and nothing is auto-sent.

## Verification and limits

24 focused server/outline/ownership tests passed. An isolated browser harness exercises the actual React lesson with mock APIs and the real native player artifact: mounts/unmounts, manipulation gate, wrong-answer handoff, two questions, completion, read-only replay, resume and 390px layout. Desktop/mobile screenshots were inspected. It uses no real account or student database and does not substitute for signed-in website acceptance. `scripts/check-hybrid-ui.mjs` uses the existing isolated esbuild pilot tooling and installed Playwright browser; it is not part of the default CI suite.

`data/` runtime/pilot/deployment artifacts are excluded from the application TypeScript compile; video tooling is not an application dependency.

## Next gates for general generation

1. Validate this complete learner flow with testers before adding more subject matter.
2. Generate one validated segment blueprint from the curriculum and allowed learner context. Prepare only required outputs, with separate durable step results/retries and a clear per-course cost budget.
3. Accept native Video Lesson clips only after timing, narration linkage, layout and educational review pass. Use ordinary teaching content when a clip fails; do not silently charge for a second complete course.
4. Extend to six meaningful steps where useful: question → short explanation → manipulation → worked reasoning → assessment → recap. Interaction pauses are learner-controlled; there is one narration owner at a time.
5. Add configured narration and verify pause/seek/segment-switch synchronization before advertising voiced hybrid courses. Reuse successful artifacts and keep student records separate.

The general School Learning generator and both full native applications retain their existing capabilities. This pilot is a dedicated alternative for one curriculum topic.
