# School illustration decision — 2026-11-13

**Later explicit decision:** the user subsequently authorized actual SiliconFlow image, speech and video generation for one investor demonstration. That prepared multiplication course is delivered in `INVESTOR_DEMO_LESSON.md`; the zero-generation evidence below refers to the earlier read-only audit. Ordinary automatic course image generation remains disabled.

Latest user decision: continue improving course quality and elementary pre-class UI; the project lead chooses whether image generation helps. Do not confuse an illustration model with a teaching-quality fix.

## Evidence

- Read-only `/v1/models` request using the existing locally configured SiliconFlow credential succeeded. Returned candidates included `Qwen/Qwen-Image`, two Qwen image-edit variants, `Kwai-Kolors/Kolors` and `OpenMOSS-Team/MOSS-Image`. No credential was printed, no student data was sent, and **zero images were generated**. Catalog access does not establish generation authorization, quality, current price or available balance.
- Current pinned School image provider registry has no SiliconFlow image adapter. Its OpenAI image adapter sends `size` and expects the OpenAI response shape; SiliconFlow documents `image_size` and an `images` response. Merely changing a model name/base URL is not a verified integration. [Official API](https://api-docs.siliconflow.cn/docs/api/images-generations-post).
- That API documents one-hour generated-image URLs. Accepted images need durable storage rather than direct temporary-URL reuse. The existing classroom-media generator still writes generated media to `CLASSROOMS_DIR`; enabling this legacy path in Vercel can reintroduce read-only filesystem failures. The durable text School path deliberately avoids it.

## Decision for this elementary demonstration

Keep ordinary course generation independent of image services. Use exact native diagrams, SVG, manipulatives and mathematical notation for quantities, geometric relations and worked steps. Use original code-native illustration for the welcoming entry screen; it adds no media API request, tracking or generation wait.

AI illustration remains a useful optional addition for a story setting, reading scene or scientific context that actually benefits from it. Before enabling: add the minimal provider adapter, require an explicit configured model and price, bound a one-image trial, store the accepted result in the existing private object-store architecture, and reuse it by curriculum/artifact version. Missing/failing images must leave the ordinary explanation usable. No model ranking, silent paid fallback, student-visible provider menu or automatic per-lesson image generation is introduced by this release.

## Quality improvement delivered now

School content prompts explicitly require visible native representations and prohibit invented image URLs/placeholders when image services are absent. Structural validation rejects empty visuals and unresolved image sources **before** spending on teacher-action generation. Retry regenerates only the affected content checkpoint, preserving prior scenes. Actual supplied sources remain allowed; this is not a network-reachability, factual-accuracy or semantic image review.

Elementary entry now offers warm illustration, explicit look/try/explain steps, large tactile buttons and immediately reusable Grade-2 examples. Grade 1–3 topic cards and the pre-class drawer receive brighter coherent colors and larger primary actions. Higher grades keep the quieter catalog treatment. No account, record, source attribution, provider key, billing mode, infrastructure or native Tutor feature is changed.
