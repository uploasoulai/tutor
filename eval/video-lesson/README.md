# Video Lesson compiler pilot

`fractions.tsx.txt` is an original, scripted twenty-second fraction lesson. It is a fixture, not AI-generated output and not a learner upload. Copy it to an isolated `.tsx` work file before invoking the pinned native `remotion/build.mjs` compiler. Tooling lives under the Git-ignored `data/video-lesson-pilot` directory; the application dependency tree is unchanged.

2026-11-10 local result: pinned package install added 16 packages in 15s; compilation and 25 isolated sampled-frame checks passed in about 1.3s. Bundle: 583,097 bytes. This does not measure provider latency, token usage, visual layout acceptance, audio/caption synchronization, mobile performance, or server memory peaks.

`public/demos/fractions-video.html` is the bundled caption-only browser preview. It uses the native player controls and an explicit platform-home link. No model/media API is called while replaying it. The page includes its generated dependency notices; preserve these when rebuilding.

Two native AI draft failures are retained under `regression/` as unserved text fixtures. `ai-pilot-results.json` records provider-reported usage and acceptance failures. `node scripts/check-video-timeline.mjs` runs five offline compiler regressions using the isolated pinned runtime; no model request is made. These fixtures must never replace the public teaching demo.
