# CoastalTutor improvement roadmap — 2026-11-10

Recommendations_v3.md is advisory. Latest user decisions and observed code take precedence. Work only in C:\CoastalTutor. GitHub/Vercel/Supabase: Chrome; Aliyun: Edge, with explicit target verification. Preserve unrelated services and user data.

## Decisions

- Preserve all three modules and the existing shared learner/workspace identity. School Learning owns curriculum progress; the integrated Tutor owns its native personal learning records. Do not move authoritative records merely to match the advisory diagram.
- Keep the existing classroom engine and curriculum adapters. Do not upgrade the vendored apps or introduce Moodle, a second database, a generic model gateway, or a new renderer now.
- Platform homepage is https://tutor.uploadsoul.com/ for both signed-in and signed-out users. Dashboard is a separate destination.
- Latest approved hybrid direction: use one teaching blueprint per course, with a renderer selected per segment. Start with the reviewed fraction pilot; general School Learning keeps its classroom engine until automated hybrid generation passes acceptance. Do not generate duplicate full courses. Preserve full functionality in the other modules.
- Evaluate native browser Video Lesson before enabling curriculum routing to it. Presence in source is not proof of production readiness.
- Prioritize a lightweight optional spatial classroom prototype in parallel with lesson improvements, per the latest user decision. Use CSS perspective and an original SVG teacher first; preserve the live DOM lesson and focus/mobile fallback. Evaluate customer response before adding a true WebGL/GLB scene.

## Findings from current source

| Area | Evidence | Judgment |
| --- | --- | --- |
| Personal landing | Tutor auth.py maps personal to /; workspace root redirects to /chat. /learning already renders native LearningDashboard in both layout variants. | Targeted improvement: evaluate the existing learning dashboard as the personal entry, with explicit chat entry. Mistake handoffs must still open chat and prefill without sending. |
| China curriculum | app/api/china-curriculum/lesson/route.ts uses graph topic, prerequisites, mastery criteria and questions. | Preserve structured curriculum source; do not replace with PDF-only retrieval. |
| Teaching decision | China/BC adapters prepare requirements for lib/server/classroom-generation.ts. No Tutor planning call in this path. | Current route is platform curriculum adapter to classroom engine, not Tutor to classroom engine. No evidence of two engines generating the same full lesson. |
| Generation lifetime | app/api/generate-classroom/route.ts uses after(), maxDuration=300; classroom-job-runner.ts invokes the whole generator; progress is persisted but execution deduplication is an in-memory Map. | Persisted status is not a durable worker/checkpoint system. Overall lesson generation remains bounded by this function execution. Nested requests may have their own limits. |
| Playback | lib/playback/engine.ts waits for audio ended; missing audio uses browser TTS or an estimated reading timer; spotlight/laser events are fire-and-forget. | Some sequencing exists. A universal sync root cause is not established; reproduce a specific lesson before replacing playback control. |
| Video Lesson | Pinned runtime includes agents/video_lesson, bounded Node compiler/install processes, isolated frame checks and a browser player; no server video encoding in runtime.py. | Source available; production enablement, dependencies, narration, resource peak and teaching quality remain unverified. |
| Classroom privacy | GET /api/classroom previously read with admin permissions by ID without auth/owner check; persistence used upsert on client-selected ID. Job polling already checks learner owner. | Confirmed private read/overwrite exposure; first repair implemented locally with regression tests. Sharing is separate from job persistence. |
| Shared curriculum cache | Ready curriculum artifacts are a separate private-storage/cache path. | Preserve authenticated reuse, but separately audit content for learner-specific context and every media/export route before claiming full privacy. |
| Server capacity | Previous confirmed deployment was Beijing 2 CPU / 4 GB and frontend building triggered OOM. Advisory says 4 CPU / 2 GB. | Reconfirm real capacity before workload tests. Build Tutor frontend away from the shared ECS host; do not infer spare capacity. |
| AI provider | Project status retains approved SiliconFlow primary for private testing pending DeepSeek availability. | Do not infer a completed provider switch from the advisory text. |

## Ordered execution and acceptance

1. **Private classroom access (deployed; user confirmed Vercel Ready for `4c148bb`).** Require authenticated reads, check private owner, owner-scope updates and reject ID collisions. Validate owner/non-owner and shared curriculum reuse. Ship through the verified Chrome project; inspect playback after deployment. The user confirmed the release is deployed.
2. **Complete asset/privacy audit.** Trace classroom HTML/widgets, media, exports, job results and reusable artifact payloads. Scope fixes to confirmed paths. Acceptance: a second account cannot read private course material by ID/URL; explicit shared curriculum content contains no learner records. Existing public-share behavior needs a deliberate product decision if encountered.
3. **Native personal learning entry (Tutor image deployed and healthy).** Inventory deployed learning dashboard, mastery, practice/mistakes, reading/books, notebooks, KB and memory. Prefer native /learning entry over adding another platform dashboard. Keep a visible Ask My Tutor path and preserve signed mistake handoffs. Acceptance: one workspace, real saved records, no invented counters or disabled-feature cards.
4. **Lesson generation recovery.** Measure outline/scene/widget/media timings first. Design persisted phase outputs plus safe retry/claim semantics. A status row or a second HTTP request alone does not guarantee recovery. Choose a minimal executor after confirming current hosting resources; do not move workloads to shared ECS without capacity evidence. Acceptance: interrupt after one completed phase and resume without regenerating that phase or double-publishing/billing.
5. **Teaching contract and feedback.** Extend the existing curriculum adapter/spec only where missing. Trace objectives, prerequisites, examples, interactions and checks through the generated output and learner session. Keep curriculum mastery authoritative in CoastalTutor; native Tutor mistake coaching owns its records. Acceptance: one China lesson completes the full learning loop and changes the next recommendation; then apply to BC.
6. **Video Lesson comparison.** Confirm production module toggle, Node/npm, dependency installation, narration/text fallback and sandbox. Run one bounded comparison first, then the recommended three lesson types if useful. Record duration, usage/cost where measurable, errors, audio/text alignment, mobile behavior and host resource peaks. No claim of superiority or default switch before results.
7. **Reusable teaching interactions and playback.** Start with a small number of elementary mathematics scenes based on tested demand; validate actual dragging/parameter changes. Reproduce pause/resume/seek and audio fallback on saved lessons. Acceptance: narrated actions correspond to visible working controls, including mobile and no-media-key mode.
8. **Optional classroom shell.** Add only after the prior gates: fixed scene, one teacher, DOM lesson region, lazy loading, reduced-motion/2D fallback. Measure browser performance and bundle/asset size. Do not generate two complete courses to populate the shell.

## First patch verification

- tests/classroom/storage-ownership.test.ts: 6 tests passed (private read isolation, owner access, identity required, authenticated shared reuse, private overwrite rejection).
- Scope: /api/classroom GET and classroom storage. This is not a complete audit of media/export routes.
- Hosted writes use insert for new IDs (unique-key collision cannot overwrite an existing owner) and owner-filtered update for existing records. Local stored records carry owner metadata; legacy local records lacking ownership are denied rather than guessed. Hosted records use the existing owner_id.
