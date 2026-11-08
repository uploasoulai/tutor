# CoastalTutor implementation status

This short file is the working index. **The latest user-approved decisions in chat take precedence over older design documents.** Detailed audits and architecture notes remain historical references unless this file or a later chat confirms them.

## Product map

- **School Learning / China K–12:** CoastalTutor course path and knowledge graph drive sequential learning; generate interactive classroom lessons through the integrated OpenMAIC classroom engine. China is the first delivery priority.
- **School Learning / BC:** keep the existing route, improve after the China flow has been tried with learners.
- **Personal AI Tutor:** integrated DeepTutor, with CoastalTutor identity and the same platform learner/workspace identity as School Learning.
- **Interactive Classroom:** integrated OpenMAIC. It shares platform identity and is an auxiliary classroom module.
- Moodle is deferred. Revisit only when a school needs LMS roster, gradebook, or LTI interoperability.

## AI and billing decisions

- A learner with their own compatible key uses BYOK. Their key is never silently replaced by a platform-paid key.
- A learner without BYOK uses the configured platform-hosted model; provider details stay out of the learner-facing product UI. During tester onboarding SiliconFlow is the temporary primary, with DeepSeek as the planned next primary.
- Billing and usage limits are a later rollout phase. `PLATFORM_AI_ENFORCE_USAGE_LIMITS=false` keeps student testing unblocked; retain the configurable USD 25 cap and enable enforcement before paid/general release. BYOK does not consume Platform AI allowance.
- The user explicitly approved the existing SiliconFlow key as the temporary **primary** Platform AI provider for private testing. This is an explicit provider setting, not an automatic fallback. Switch to DeepSeek when its key is ready. Do not enable SiliconFlow as a general commercial SaaS fallback without the separate forwarding-terms review.
- Only text teaching is required for initial launch; optional media providers must not block ordinary lessons.

## Delivery sequence

1. Make student testers able to use China K–12 courses, classroom generation, and DeepTutor with the temporary SiliconFlow platform key.
2. Fix learner-facing course quality and interaction issues from real student/parent testing.
3. Complete shared learner identity, workspace, and learning-history behavior across the three modules.
4. Finish usage ledger, provider rates, billing, and monthly USD 25 enforcement after the learning flow is working.
5. Improve the student and parent-facing learning UI; selectively reuse successful China classroom patterns in BC.

## Current implementation

- China graph catalog, topic detail, practice, mastery/session endpoints, and lesson-generation flow are in the app.
- The China course route now starts at the learner's saved grade from their shared platform profile; students can still choose another grade.
- China lessons use the shared classroom generator. Requests without a learner key use the configured platform provider/model (currently SiliconFlow for testing); requests with their own key retain their requested model.
- DeepSeek's current `deepseek-flash` identifier is present in the provider catalog.
- CoastalTutor chat, quiz grading, PBL chat, OpenMAIC scene generation, and classroom jobs can use the configured platform provider. Cost-rate checks and monthly caps are deliberately non-blocking while `PLATFORM_AI_ENFORCE_USAGE_LIMITS=false`; missing rates no longer break lesson generation.
- DeepTutor resolves the same server platform provider when a learner has no saved personal provider key and has an authenticated internal usage bridge. The bridge also honors the temporary no-blocking test mode.
- **DeepTutor learning features and identity:** its native Learner preset/profile, personal Mastery Paths, Practice/Question Notebook (including wrong-answer review), and personal learning activity are available inside each learner's isolated workspace. Host SSO maps the same CoastalTutor UUID and parent-child links, and syncs platform grade/curriculum/language metadata into DeepTutor profiles when available. DeepTutor's guardian screen manages access, approved materials, and grants; it does not report learner study activity or mastery. School Learning attempts/mastery remain in CoastalTutor, so the two apps do not yet present one combined history or family report.
- The learner dashboard now links directly to DeepTutor practice, personal learning paths, progress, and profile; the parent dashboard links to DeepTutor guardian access settings and the parent's own tutor. SSO destinations are allowlisted by CoastalTutor role and DeepTutor validates the same role/mode pairing before redirecting.
- DeepTutor's learner chat composer now shows a CoastalTutor tutor label instead of the underlying provider/model selector.
- The service returns a clear setup error instead of silently falling back when the configured platform key is missing.
- **Unified BYOK progress:** added an AES-256-GCM encrypted, per-learner Supabase credential vault, authenticated owner-only settings API, test-before-save flow, delete path, and token-protected server-to-server credential retrieval. CoastalTutor/OpenMAIC and DeepTutor now resolve the same learner credential by Supabase identity at request time; DeepTutor does not copy it into model catalog files. Verified BYOK calls bypass Platform AI cost metering. A branded one-provider/one-key settings surface is in place. The migration is `supabase_learner_ai_credentials_migration.sql`. Vault use requires `LEARNER_CREDENTIALS_ENCRYPTION_KEY`; `BYOK_VERIFIED_PROVIDERS` intentionally defaults empty, since no provider has passed the required real dual-system checks yet, so the UI correctly reports that BYOK setup is not open.
- **Platform provider transition:** Platform AI supports an explicit `PLATFORM_AI_PROVIDER` for `deepseek` or `siliconflow`, with matching model/key across CoastalTutor and DeepTutor. The temporary test default is SiliconFlow. Usage limits are still USD-based; configure current active-model USD input/output rates before serving paid platform requests. Switch `PLATFORM_AI_PROVIDER` and `PLATFORM_AI_MODEL` to DeepSeek once that key is confirmed usable.
- The configured SiliconFlow credential completed one minimal live connectivity call against `deepseek-ai/DeepSeek-V3` (7 input tokens, 1 output token). The same local-only key and provider/model settings are in Git-ignored CoastalTutor `.env.local` and `DeepTutor/.env`. No key was printed or added to tracked files. `PLATFORM_AI_ENFORCE_USAGE_LIMITS=false` now allows student course testing before pricing and billing are finished; the USD 25 cap remains configured for the later paid phase. The local Next app is running at port 3000 and returned HTTP 200; the configured DeepTutor public site also returned HTTP 200. Local env changes do not alter the remote DeepTutor deployment; copy the same provider/key/bridge settings there and restart it before expecting unified hosted-key behavior remotely.
- **Remaining for the unified AI design:** apply both usage and credential migrations; configure the platform model rates, credential-vault encryption key, and strong internal bridge token in the required services; remove or migrate legacy browser-local LLM keys after a safe user migration path is selected; complete compatibility and real provider tests before enabling any BYOK provider; configure production runtime.

## Operator actions before end-to-end AI trial

1. Keep `PLATFORM_AI_ENFORCE_USAGE_LIMITS=false` for the student-testing phase and restart both services so the temporary SiliconFlow config is loaded.
2. When DeepSeek is ready, set `PLATFORM_AI_PROVIDER=deepseek`, `PLATFORM_AI_MODEL=deepseek:deepseek-flash`, and add `DEEPSEEK_API_KEY` to both services.
3. Before billing launch, set current model USD input/output rates, apply the usage migration, then enable `PLATFORM_AI_ENFORCE_USAGE_LIMITS=true`.
4. Keep all provider keys in server-only environments, never in the browser bundle or repository.

## Website testing / deployment status

- The tester-facing site is `https://tutor.uploadsoul.com`; it currently returns HTTP 200 and the CoastalTutor Vercel project in Chrome shows its production deployment as Ready. The production source is GitHub `main` at commit `d9065f085df63afab875d79b367179a20d3f72d0`; local `main` matches `origin/main`.
- The current implementation changes remain local and uncommitted, so the live site is still on that production commit. Vercel's existing GitHub deployment integration is healthy; finish the course and learner-facing work before moving the completed changes to tester-facing deployment.

No production deployment or external-service mutation is performed by this file's implementation work.
