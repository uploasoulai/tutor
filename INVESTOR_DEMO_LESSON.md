# Grade-2 multimedia demonstration — 2026-11-13

Latest explicit user decision authorizes one concentrated SiliconFlow image/speech/video demonstration for today's investor presentation. This is an exception for this prepared course; ordinary course-generation media flags and BYOK routing remain unchanged.

## Demonstrate

After signing in, open **School Learning → 二年级 · 乘法探索课**, or `/school-learning/china/multiplication-lab`.

Already-completed accounts can choose **重看欢迎动画 → 从头回看这节课** on the completion page. This preserves the existing grades and adds no learner writes.

1. Click **播放欢迎动画和声音**: a five-second generated, silent coastal-classroom animation loops underneath a 14.4-second welcome narration. Pause controls both. Reduced-motion devices retain the illustration and speech without starting the animation. Starting the lesson removes/stops the opener.
2. Start the lesson and identify equal groups. The v5 three-chapter lesson uses eight short, child-friendly teacher turns (recorded clips ~4–9 seconds each) rather than uninterrupted long paragraphs. Default playback is 0.85× with a plain-language speed toggle. Each turn automatically stops for a question or activity, without a countdown. The 56.43-second native teaching timeline excludes the child's thinking/game time and optional classmate replies; it is not the lesson duration.
3. Place six counters into three equal groups, explain repeated addition, distinguish unequal groups, answer the two canonical curriculum questions, then recap. Watching a video never grants mastery. Wrong answers still offer the same-learner Personal AI Tutor coaching handoff.
4. Learner bookmarks, attempts and completion remain individually owned. Parents/admins retain a read-only experience. Everyone shares these prepared media files; no media request is made during replay. The existing lesson/topic ID and learning history are preserved, with old v1/v2 assets retained.

At the eight thinking stops, choose an answer or fill three little boxes by tapping them. Wrong attempts offer a concrete hint. At three selected stops, 朵朵、小宇 or 乐乐 raises a hand; after trying, click **听…怎么想** for a short recorded explanation. The teacher remains silent while the classmate answers. Click **准备好啦，继续** when ready. These are scripted fictional companions and ungraded activities. Completion still requires the existing bank checks. Restarting a chapter repeats its stops; deliberate seeking remains available for review.

## Actually prepared

- Image: one successful `Qwen/Qwen-Image` request, reviewed coastal classroom/otter illustration, provider watermark retained, converted locally to an 88 KB WebP.
- Speech: the original nine successful requests are retained in earlier editions. The child-paced revision adds eleven successful `FunAudioLLM/CosyVoice2-0.5B` requests: eight shorter teacher clips (`diana`) and three classmate replies (`claire`/`david`). The active edition has twelve clips including the reused welcome. All durations are measured; replay makes no speech request.
- Video: one successful `MiniMaxAI/MiniMax-H3` request, five seconds, requested 768p / 16:9. Saved MP4 is ~1.84 MB. No retired Wan model was called.
- Shared v5 player, MP4, welcome MP3 and WebP total **4,384,696 bytes**. See `eval/video-lesson/investor-demo-assets.json` for hashes, cumulative/edition call counts and exact file sizes. No claim about actual dollar cost is made; provider billing must supply it.

The imagery supplies context and appeal. All teaching quantities, groups and equations are code-native, not generated image assertions. The short cinematic opening is not presented as the entire lesson or an AI teacher with generated lip synchronization. This is a curated best-effort demonstration, not evidence that arbitrary topics will automatically attain the same quality.

## Preparation and operation

`scripts/prepare-investor-lesson.py --generate` is an explicit operator action using the existing local temporary platform key. It caches successful calls, persists submissions before requests and refuses automatic paid resubmission after ambiguous failure. `--poll-video` retrieves the existing job without submitting a new one. No learner information is sent. Key, signed URLs and provider response bodies are not published.

Record v5 only with the explicit operator command `data/narration-tooling/Scripts/python.exe scripts/prepare-child-paced-narration.py --record`. The fixed eleven-clip job caches each exact payload and never automatically resubmits an ambiguous request. It sends only authored lesson text. Original illustration, video and welcome are unchanged. Cached recordings can be assembled without `--record`.

Build with `node scripts/build-fractions-video.mjs --multiplication --siliconflow`. Normal non-SiliconFlow builds still produce v2 assets; the current v5 player is deliberate and separate. Wrapping narration stays below the canvas with responsive iframe sizing. Classmate audio, questions and games are bundled, and original portraits sit below the teacher. Earlier media versions remain available. No package, GPU, worker, Supabase migration or ECS change is required.

These authored demonstration assets are deliberately shareable static website files served from the existing deployment. They contain no private uploaded materials or learner records. General generated/student media still needs the separate private-object-store path; this single demonstration does not replace that storage architecture.

## Checks and limits

The native compiler checks 25 frame samples. Real-browser checks cover non-silent decoded speech, all three chapters, pause/seek/restart, decoded opening video, synchronized opening pause, no autoplay, reduced motion, media-failure continuation, mobile layout, real WebGL/static teacher fallback, the six-step assessment/save/replay flow and parent preview with zero learner API calls. API persistence is mocked in the local UI harness; production student writes still depend on the existing authenticated service.

Whole-repository formatting, lint, unit tests and production build are checked before push. Publication is established separately from local checks; do not infer Vercel Ready from a local build.

Official provider references: [image API](https://api-docs.siliconflow.cn/docs/api/images-generations-post), [speech API](https://api-docs.siliconflow.cn/docs/api/audio-speech-post), [video submission](https://api-docs.siliconflow.cn/docs/api/video-submit-post), [video retrieval](https://api-docs.siliconflow.cn/docs/api/video-status-post).
