# Course quality audit — 2026-11-13

The supplied advisory is a reference. Latest user decision: this week's investor demonstration targets elementary learners; higher-grade acceptance is deferred. No server, framework upgrade, model migration or paid video pipeline is introduced.

## Actual generation path

School Learning uses the China/BC curriculum adapters and the existing classroom engine, not a DeepTutor planning call. Personal AI Tutor retains its separate native capabilities and shares the platform identity. This corrects the advisory's description without changing the architecture.

`school-generation-runner.ts` runs one saved phase per invocation: outline → content → actions for each selected scene → publish. Six scenes are requested, not six independent agents or six simultaneous jobs. Scene types/outlines determine actual contents. Current role mapping distinguishes opening, concept, practice, worked example, assessment and recap; a legacy three-scene lesson keeps its only explanatory slide as concept teaching.

| Work | Existing implementation | Format / current bounds |
| --- | --- | --- |
| Shared plan | `generateSceneOutlinesFromRequirements`, outline templates | JSON; up to 4,096 output tokens |
| Visual/interactive content | `generateSceneContent`, slide/widget/quiz templates | JSON or HTML; reviewed exact-topic activities use local authored code; other interactions capped at 2,400, other content at 4,096 |
| Teacher delivery | `generateSceneActions`, slide/quiz/widget action templates | Structured actions; opening/recap capped at 2,048, concept/worked/other actions at 4,096, always respecting a lower caller limit |
| Save | `persistClassroom` and shared artifact cache | No model call; individual student history remains separate |

Local safe configuration inspection confirms SiliconFlow with `siliconflow:deepseek-ai/DeepSeek-V3`. This is not an inspection of today's Vercel environment. Each paid step resolves the actual learner BYOK or platform provider at runtime; private `callMetrics` now capture resolved provider/model, actual returned input/output tokens, elapsed time and finish reason per step/attempt. Missing usage is null, not zero. Temperature is not explicitly set by this runner; no numeric SDK/provider default is asserted. Existing usage ledger remains authoritative for configured-price billing. Cached-token breakdown, multimedia costing and a course-cost admin dashboard are not delivered here.

## Teaching and failure findings

- Slide templates deliberately restrict screen text to short labels; speech is supposed to carry explanations. The action template's 1–2 sentences applies per turn, not to the complete lesson. Longer paragraphs on slides would worsen the problem. New School-only directions assign explanation, reasoning, misconception and learner-attempt responsibilities to each role.
- Current-scene content, outline titles and the previous scene's last speech are available to teacher action generation. A full semantic cross-section contradiction checker is not present.
- `finishReason === length` is rejected before accepting a response. Parsing/shape failures and empty actions already stop that phase. New rules reject an empty slide or missing nonblank teacher speech; short speech is only a review warning. These checks are not mathematical or pedagogical certification.
- Each step has a 120-second model deadline and no SDK retry; durable attempt/call reservations, owner/revision leases and explicit retry preserve prior sections and pending content. A failed action can retry without regenerating its saved content. Quality reports retain safe issue codes. No automatic paid repair model is added.
- Hosting's 300-second limit applies per invocation. It does not prove why explanations were shallow. The earlier six-scene fixture took 387.515 seconds overall, illustrating the value of checkpoints, not a teaching-quality benchmark.
- Existing successful cached courses are intentionally retained for demo stability. This patch changes newly prepared sections; it does not silently regenerate every existing learner course. Use the explicit regenerate flow for an older generic course when an upgraded draft is wanted.

## Media and display

Ordinary new China text courses disable image/video generation and server TTS; the shared playback engine retains browser speech/reading fallbacks. Image/video/TTS/ASR adapters exist but a chat key does not configure them. No new ASR, embedding or image provider is enabled here. The reviewed multiplication lesson uses the pinned native narration recorder in operator tooling with its existing Xiaoxiao voice, then native compiled static audio/graphics; playback makes no voice-service request.

The teacher is real lightweight browser WebGL, not an AI classroom image. The old separate teacher panel and player are now a single framed classroom with an actual DOM lesson screen beside the teacher on desktop, stacked inside the same frame on small screens. A teacher-focused camera removes the unrelated decorative board. The screen remains the real player, with chapter/timeline updates and normal controls; no perspective transform distorts hit targets. Focus mode retains playback, reduced-motion/static fallbacks remain. Gesture follows playback state; lip sync and physical 3D screen-texture rendering are not claimed.

## Priority decision

Ship the improved Grade-2 prepared lesson and this bounded teaching-policy foundation first. Keep the current provider, existing keys, durable jobs and native applications. Model A/B, automatic semantic assessment/repair, upper-grade benchmarks, cost UI and broad automatic video generation follow after the demonstration. Risks still needing real testers: instructional pacing, device audio restrictions, and quality of unconstrained generated topics. Vercel deployment and real-user educational acceptance must not be inferred from local checks.
