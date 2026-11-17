# One prepared Grade-2 lesson — resource reuse pilot

## Scope and source

The first public trial is “乘法的初步认识”, `g2-multiply-01-v1`, mapped to existing graph topic `cnm_p038`. Five additional inspected candidates remain unpublished. No new curriculum or learner system is installed. Runtime routes are `/school-learning/china/adventure` and `/school-learning/china/adventure/g2-multiply-01-v1`.

Source release: [congcong-school v1.8.3](https://github.com/wuwangzhang1216/congcong-school/releases/tag/v1.8.3), commit `aca01f61446b8550b0215b7186b8df4740a97287`. The downloaded release manifest and the selected Grade-2 data/audio packages were checksum-verified. The other suggested repository, `tanle-mtr/ChinaStudyFree`, is a distinct multi-platform derivative; its source and data are not mixed into this edition.

`eval/resources/grade2-import-audit.json` contains the 85-book source inventory and decisions for 28 Grade-2 lesson candidates. This is an availability inventory, not a statement that all books were imported or approved. Historical v1.4.2 coverage regression was restored in v1.4.3; it is not used as a permanent blocklist. Current teacher/child acceptance remains open.

The code/data source retains its MIT notice at `/legal/prepared-course-notice.txt`. Only selected AI-generated explanation/exercise material is adapted. No textbook scan, passage, PDF or unclear third-party image is imported. Narration provenance is preserved; a source package being available is not a blanket commercial-rights guarantee for voice-provider services.

## What this lesson actually reuses

- Six reviewed questions, their explanations and three short concept/tip teaching blocks.
- **23** matched AAC/M4A files, **217,542 bytes**, for the first lesson. The six local candidates contain 119 distinct recordings, but that larger directory is not this upload batch.
- Existing Supabase assessment sessions, deterministic grading, reports, mastery attempts and same-learner Tutor handoff. No LLM, live TTS, image or video generation is called for ordinary study or grading.
- Existing course-library feedback and human-review process. It is a labeled public **trial**, not automatically “teacher approved”. Personal learning records remain private.

The two-seal story illustration and shell/basket manipulative are original reusable SVG/React work. They are not attributed to the upstream story-image pack. The 550 MB upstream story-image archive was not downloaded just to decorate this mathematics sample. A later reading sample can use an individually licensed illustration with its own author/title/license record.

Neither inspected repository tree nor the selected release manifest exposed a collection of ready video lesson files. “Interactive course” does not mean MP4. Existing CoastalTutor narrated/virtual-classroom demonstrations remain available for comparison. This pilot adds short controlled narration, visual story context, deterministic manipulation/retry encouragement and completion stars; it does not claim a new 3D engine or an imported complete game economy.

## Version, access and media contract

Course relationships live in the typed versioned manifest plus the existing library record, not in R2 filenames alone. Every narration binding records text and its fingerprint; every file has a SHA-256 key, expected size, format and provenance. Changed visible text invalidates the corresponding narration binding. Changed course content invalidates the library's publication fingerprint. New versions use new edition IDs and retain old manifests.

R2 bucket: `coastaltutor-course-media`, Standard, private. Website credential is read-only and scoped to this bucket. No user key, provider key, raw R2 secret or signed authorization header is sent to the student. The media route checks authentication, current course access and withdrawal status before reading the allowlisted object, then checks its size/checksum/container. Explanation-only audio for a student requires that student's completed paper for this course. No arbitrary object path or remote URL is accepted.

Audio uses one player with `preload=none`; changing a teaching segment pauses it. Browser Range requests are supported. Responses currently use private/no-store for immediate withdrawal behavior at small tester scale. CDN/public-bucket optimization is deferred; bucket publication is not needed. Normal text/game study survives unavailable audio.

## Operator steps and acceptance

`node scripts/publish-prepared-pilot.mjs` is a dry run that verifies and stages **only 23 files** in `data/resource-audit-20261116/pilot-upload/sha256`. Upload the `sha256` folder into the dedicated bucket. Do not select the older 119-file candidate folder; the dashboard limit is 100 files. No Wrangler or upload-capable website key is needed for this small batch.

Configure the server-only `COASTALTUTOR_R2_ACCOUNT_ID`, `COASTALTUTOR_R2_BUCKET`, `COASTALTUTOR_R2_ACCESS_KEY_ID`, `COASTALTUTOR_R2_SECRET_ACCESS_KEY` in the verified Vercel project. Use the authorized read-only bucket token, never an admin token. Then `node scripts/publish-prepared-pilot.mjs --apply` registers this one trial without overwriting an existing edition. A retry verifies the same publication fingerprint.

Browser harness: `node scripts/check-prepared-pilot-ui.mjs`. It exercises real components with local source recordings and mock learner APIs: short narration pause, mobile story art, wrong/right formative feedback, conserved shell counts, all six questions, report reload without another start, wrong-answer Tutor prefill and all 23 non-silent AAC decodes. It does not substitute for a signed-in website run or certify all audio pronunciations/teacher semantics.

The first upload is bounded to 0.218 MB, far below the 10 GB-month Standard free tier; this is not a guarantee of zero future billing. Broader imports need an account-usage check, per-import size cap and item-level rights/mapping review. No new server, GPU, TTS service, cloud plan or payment product is enabled.

Membership and broader resource decisions are in `MEMBERSHIP_AND_FREE_CONTENT_PLAN.md`. Production payment/credit enforcement is a later phase; the pure access-policy contract is tested but deliberately not activated as an incomplete paywall.
