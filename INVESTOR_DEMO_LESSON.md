# Grade-2 multimedia demonstration — 2026-11-13

Latest explicit user decision authorizes one concentrated SiliconFlow image/speech/video demonstration for today's investor presentation. This is an exception for this prepared course; ordinary course-generation media flags and BYOK routing remain unchanged.

## Demonstrate

After signing in, open **School Learning → 二年级 · 乘法探索课**, or `/school-learning/china/multiplication-lab`.

Already-completed accounts can choose **重看欢迎动画 → 从头回看这节课** on the completion page. This preserves the existing grades and adds no learner writes.

1. Click **播放欢迎动画和声音**: a five-second generated, silent coastal-classroom animation loops underneath a 14.4-second welcome narration. Pause controls both. Reduced-motion devices retain the illustration and speech without starting the animation. Starting the lesson removes/stops the opener.
2. Start the lesson and identify equal groups. The three narrated chapters provide 144.27 seconds of authored teaching, linked to matching exact diagrams and subtitles, alongside the existing real WebGL teacher. Play, pause, seek, focus and phone controls remain available.
3. Place six counters into three equal groups, explain repeated addition, distinguish unequal groups, answer the two canonical curriculum questions, then recap. Watching a video never grants mastery. Wrong answers still offer the same-learner Personal AI Tutor coaching handoff.
4. Learner bookmarks, attempts and completion remain individually owned. Parents/admins retain a read-only experience. Everyone shares these prepared media files; no media request is made during replay. The existing lesson/topic ID and learning history are preserved, with old v1/v2 assets retained.

## Actually prepared

- Image: one successful `Qwen/Qwen-Image` request, reviewed coastal classroom/otter illustration, provider watermark retained, converted locally to an 88 KB WebP.
- Speech: nine successful `FunAudioLLM/CosyVoice2-0.5B` requests, preset `diana`, warm primary-school delivery instruction, measured MP3 durations. Eight teaching clips are embedded in the native compiled player; one is the welcome.
- Video: one successful `MiniMaxAI/MiniMax-H3` request, five seconds, requested 768p / 16:9. Saved MP4 is ~1.84 MB. No retired Wan model was called.
- Shared v4 player, MP4, welcome MP3 and WebP total **5,798,599 bytes**. See `eval/video-lesson/investor-demo-assets.json` for hashes and exact file sizes. No claim about actual dollar cost is made; provider billing must supply it.

The imagery supplies context and appeal. All teaching quantities, groups and equations are code-native, not generated image assertions. The short cinematic opening is not presented as the entire lesson or an AI teacher with generated lip synchronization. This is a curated best-effort demonstration, not evidence that arbitrary topics will automatically attain the same quality.

## Preparation and operation

`scripts/prepare-investor-lesson.py --generate` is an explicit operator action using the existing local temporary platform key. It caches successful calls, persists submissions before requests and refuses automatic paid resubmission after ambiguous failure. `--poll-video` retrieves the existing job without submitting a new one. No learner information is sent. Key, signed URLs and provider response bodies are not published.

Build the verified cached narration with `node scripts/build-fractions-video.mjs --multiplication --siliconflow`. Normal non-SiliconFlow builds still produce v2 assets; the current v4 player is deliberate and separate. It fixes the reported text overlap by moving narration below the canvas, with responsive iframe sizing; original named classmate portraits sit below the teacher. Earlier media versions remain available. This follow-up reuses all recordings and makes no generation calls. No package, GPU, worker, Supabase migration or ECS change is required. The local image-conversion dependency was corrected after the original download; the same image was reused without a second API call.

These authored demonstration assets are deliberately shareable static website files served from the existing deployment. They contain no private uploaded materials or learner records. General generated/student media still needs the separate private-object-store path; this single demonstration does not replace that storage architecture.

## Checks and limits

The native compiler checks 25 frame samples. Real-browser checks cover non-silent decoded speech, all three chapters, pause/seek/restart, decoded opening video, synchronized opening pause, no autoplay, reduced motion, media-failure continuation, mobile layout, real WebGL/static teacher fallback, the six-step assessment/save/replay flow and parent preview with zero learner API calls. API persistence is mocked in the local UI harness; production student writes still depend on the existing authenticated service.

Whole-repository formatting, lint, unit tests and production build are checked before push. Publication is established separately from local checks; do not infer Vercel Ready from a local build.

Official provider references: [image API](https://api-docs.siliconflow.cn/docs/api/images-generations-post), [speech API](https://api-docs.siliconflow.cn/docs/api/audio-speech-post), [video submission](https://api-docs.siliconflow.cn/docs/api/video-submit-post), [video retrieval](https://api-docs.siliconflow.cn/docs/api/video-status-post).
