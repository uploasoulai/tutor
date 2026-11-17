# Free learning, paid personalized AI — 2026-11-16

Latest user decision replaces the older “no visible credits” business assumption. Prices and credit amounts are not confirmed. This is the phased delivery contract, not a claim that subscriptions or checkout already work.

## What exists and is reused

- Supabase learner/profile identity, verified parent links, School sessions, objective grading, curriculum mastery and course-library feedback/review exist.
- Compatible BYOK credentials and provider defaults are already stored through the shared platform adapter. Platform-hosted text uses the configured provider; keys stay private and provider/model names stay out of student-facing teaching.
- `platform_ai_usage` records per-user real model token counts and cost. The native Tutor internal bridge uses the same ledger. A configurable monthly USD safety cap and testing enforcement switch exist. This is a cost ledger, **not** a subscription, wallet, prepaid credit balance or payment provider.
- No working checkout, payment webhook, subscription table or membership expiry handler was found in this checkout. Do not invent a working payment integration, create another user system, or replace existing auth.

## Product rules

| Capability | Free | Pro BYOK | Pro Managed AI |
|---|---|---|---|
| Approved public lessons, recorded audio, authorized images, exercises | Yes | Yes | Yes |
| Deterministic grading, game feedback, learning stars/history | Yes | Yes | Yes |
| Content errors, audio errors and bug feedback | Yes | Yes | Yes |
| Personalized explanations/practice/generation and native AI modules | No paid AI entitlement | Own verified key | Platform-funded allowance |
| Platform AI credits consumed | No | Never | Yes |

“Free K–9” is an access policy for available approved content, not a claim of complete K–9 coverage. Missing lessons must show what is available, not automatically charge the platform to fill the gap. Ordinary Free completion has no LLM/TTS/image generation dependency. Storage/network costs still exist.

Free correction reports must be separate from requests for a different teaching style. “The answer/audio is wrong” never requires an upgrade. “Make a personalized version for me” can offer Pro. Public fixes undergo the existing review workflow. Production Pro contributions require explicit author consent; never automatically publish a personal conversation, uploaded file or customized course. The present shared testing policy remains a distinct, explicitly labeled pilot, not the production contribution rule.

## Small, phased implementation

1. Deliver and evaluate **one** Grade-2 prepared lesson. Reuse existing reports/mastery and feedback, add original reusable story art and deterministic tactile play, and private R2 audio. Six source candidates can remain in the private manifest; only one is opened for testing. The remaining candidates are not automatically approved or bad.
2. Make the public catalog/coverage clear and expand accepted, license-checked materials. Reuse game templates and static narration. Prepare any AI-assisted common material once, review and publish it as a versioned asset; users then reuse it without runtime generation.
3. Add a server-owned membership record keyed by the existing learner/account UUID and a small editable plan configuration. Free access stays independent of expiry/credits. During development keep existing authorized AI testing available; do not activate a partial paywall that leaves another API or native module ungated.
4. Before paid launch, wire one entitlement resolver into ALL generation routes, resumed jobs at execution time, native SSO and **each native AI request** through the existing bridge. SSO alone is insufficient because sessions can outlive a membership. A removed/expired Pro entitlement disables paid requests but retains free content and read-only personal records.
5. Select a checkout provider only after price/merchant setup is agreed. Reuse it if a real integration appears later. Payment-created credit grants require verified webhooks, idempotent transaction IDs, refund handling and adult/parent purchase controls. No “purchase successful” button based on client state.

## Managed credits without a second cost engine

- Keep real token/model pricing in the existing cost ledger. Add user-visible Credits as a configured conversion of actual platform cost, with a versioned conversion/rate snapshot. Do not call raw tokens “credits” or hardcode $25/plan prices in business logic.
- Store monthly included grants and separately purchased top-ups as explicit ledger entries, with chosen expiry/rollover terms shown before purchase. Meter/reserve credits atomically before costly work, settle actual usage once, release unused reservations and retain a configurable platform currency safety cap.
- Show the member's own dated usage, credit debits and remaining balance; the learner need not know the underlying provider. BYOK displays “paid to your provider” and never debits Managed Credits or silently switches to a platform key.
- Unpriced media or model calls cannot be offered as “covered by credits” until metering exists. Existing prepared audio/art do not debit credits. Provider 401/402/429 errors remain distinct from plan expiry or platform allowance errors.
- A fresh billing entitlement starts after trusted payment confirmation. No auto-renew/top-up or paid-provider fallback is introduced during the current classroom pilot.

## Open resource shortlist (checked 2026-11-16)

| Source | Useful material | Decision |
|---|---|---|
| [Illustrative Mathematics first edition](https://illustrativemathematics.org/terms-of-use/) | Structured K–8/9 math lessons, activities, tasks | Priority for the English/general supplement: first edition ©2019–2021 is CC BY 4.0; **v.360 is CC BY-NC**, so pin editions and verify individual assets. Map concepts to BC separately, never call it BC-aligned just because grades match. Import licensed materials, not the website/branding. |
| [Open Up Resources](https://www.openupresources.org/help-support/licensing-questions/) | K–5 and 6–8 math sequences/teacher guides | Strong candidate; verify license on each specific edition and third-party component. Search/download access being free is not enough. |
| [StoryWeaver attribution guide](https://storyweaver.org.in/en/attributions) | Leveled picture books, authorized illustrations, multilingual stories | Priority for story/picture supplements: select item-level CC BY 4.0 records, retain author/illustrator/translator attribution, and check whether matching audio is included separately. Not a complete Chinese mathematics curriculum. |
| [Global Storybooks](https://globalstorybooks.net/guidelines/translation/) / [African Storybook](https://www.africanstorybook.org/) | Illustrated Chinese/English graded reading, some prerecorded voices | Strong selective source. The catalog mixes CC BY and CC BY-NC originals; filter **each story and media item**, not the platform as a whole. |
| [PhET](https://phet.colorado.edu/en/licensing/) | Excellent science/math interactive simulations | Current regular HTML terms are CC BY-NC 4.0. Do not import current packs into this prospective commercial product without appropriate permission. Older file licenses, if considered later, require their own verified version record. |
| [Core Knowledge](https://www.coreknowledge.org/terms-of-use/), Khan Academy, CK-12 | Large established education collections | Not selected as unrestricted commercial import sources. Their noncommercial/custom terms and third-party exclusions need separate permission/version review. Free public lessons alongside paid Pro do not automatically make the whole use noncommercial. |

No researched third-party curriculum has been bulk downloaded or represented as officially approved. Prioritize Chinese math practice already in the project, the bounded upstream Grade-2 pilot, and licensed stories/art. A complete high-quality Chinese K–9 multimedia catalog cannot yet be promised from one reusable open repository.
