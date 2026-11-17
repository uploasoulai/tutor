# Public library and classroom quality decision — 2026-11-16

Latest user feedback overrides the earlier assumption that the prepared resource pilot is an acceptable teaching experience. Passing playback, grading and persistence checks proves integration, not educational quality. This document is the next delivery plan, not a claim that its classroom migration is already implemented.

## Findings and corrections

- The imported Grade-2 audio comes from the checksum-verified upstream `audio-ios-g2up-2026.zip` package recorded in `curriculum_data/china/prepared/grade2-multiplication-v1.json`. It was not newly synthesized through the platform key. The pinned upstream README describes TTS, including Edge speech. Exact individual voice/model metadata was not established for every selected file; do not claim human recordings or a particular voice per file.
- The upstream application includes interactive visuals, illustrated story reading, textbook-page reading and reward screens. The earlier import selected only concept text, questions, explanations and matched recordings. The new seal illustration and grouping game were authored locally; the upstream complete visuals/player were not imported. This distinction explains why a functioning source application can still yield a weak partial adaptation.
- Original prepared multimedia remains at `/school-learning/china/multiplication-lab`. Its v5 player has short authored speech, visual timing, thinking stops and scripted classmate turns. `LittleClassroom`, `ClassroomFriends` and `ReviewedLessonVideo` remain in the repository. The new `/adventure` player never included them; the earlier classroom was not intentionally removed from the old lesson.
- Current graphics are a WebGL teacher/classroom with animated SVG classmate portraits and lightweight fallback. Do not call that a complete navigable 3D school or imply every classmate is a 3D avatar.

Evidence: [pinned upstream README](https://github.com/wuwangzhang1216/congcong-school/blob/aca01f61446b8550b0215b7186b8df4740a97287/README.md), the local source/package hashes, `INVESTOR_DEMO_LESSON.md`, and current player code.

## Product decision

Keep one CoastalTutor School classroom experience. Imported resources are ingredients, not a reason to introduce another learner app, player, account, reward wallet or history database. Ordinary School lessons should enter the existing branded virtual room by default; explicit focus mode, small-screen layout, reduced motion and static rendering remain available without blocking learning. Personal AI Tutor and Interactive Classroom retain their full native features and are not rewritten by this plan.

Retain the stronger curated multiplication demonstration as the visual/pacing reference. The resource pilot is an import experiment, not its quality replacement. Do not bulk-publish the other five candidates or resynthesize a whole audio catalog before a child accepts the integrated replacement sample.

## Reusable resource assessment

Research date: 2026-11-16. Repository descriptions establish candidates, not child-tested quality or audited curriculum coverage. Download selected pinned source files for review; do not fork or deploy another full platform.

| Source | Finding | Decision |
| --- | --- | --- |
| [KidsLab](https://github.com/talkincode/kidslab) | Independent static HTML/JS activities, including grouping/operations, time, money, fractions and some Three.js work. Code MIT; educational content explicitly CC BY 4.0 in a separate content license. | First candidate for reusable games/visuals. Select one exact-topic activity, inspect code/assets, preserve attribution and mark modifications. Do not install its service worker or replace CoastalTutor records. |
| [QiMath](https://github.com/shengshuyuan/QiMath) | Visual arrays, grouping, number lines, clocks, money and stepwise practice. Current `LICENSE` is Apache 2.0 while README still says MIT. | Strong mechanics candidate; pin the actual LICENSE and resolve discrepancy before copying. Piper recordings/models and third-party assets need separate provenance. Do not adopt its local mistake/account system. |
| [mini-classroom](https://github.com/JeetChan/mini-classroom) | MIT source, static focused lessons and flashcards. The folder name includes grades 1–2, but README identifies the present math sequence as Grade-1 lower term and lists Grade-2 expansion as future work. | Supplement/reference, not a ready complete Grade-2 catalog. Check underlying passages/art individually. |
| [early-math](https://github.com/kangchuh/early-math) | MIT project aimed at ages 4–6 and hands-on numeracy. | Candidate for preschool/Grade-1 interaction patterns, not evidence of Grade-2 or K–9 coverage. |
| [congcong-school](https://github.com/wuwangzhang1216/congcong-school) | Prepared exercises/explanations, synthetic narration, illustrated reading and rewards. Source license does not grant third-party textbook rights; teacher review remains open. | Retain useful reviewed questions/text selectively. Do not keep inferior audio merely because it is available. Do not copy textbook scans into public lessons. |
| [TeachAny](https://github.com/weponusa/teachany) | Rich interactive-design examples. README states AGPL 3.0 plus commercial licensing; gallery and component asset terms require their own checks. | Secondary evaluation, not another integrated generation engine. Do not assume unrestricted proprietary reuse or count advertised gallery size as tested courses. |

License evidence: [KidsLab content](https://github.com/talkincode/kidslab/blob/main/LICENSE-CONTENT.md), [QiMath actual license](https://github.com/shengshuyuan/QiMath/blob/main/LICENSE), [early-math license](https://github.com/kangchuh/early-math/blob/main/LICENSE), and each repository's pinned file notices before actual import.

The earlier shortlist remains useful for specific supplements: Illustrative Mathematics **first edition** for English/general mathematics; individually CC-BY-licensed StoryWeaver/Global Storybooks material for illustrated reading. These are not automatically Chinese-curriculum aligned. Do not mix IM v.360's noncommercial terms into the first-edition import.

## The four suggested download platforms

- [basic.smartedu.cn](https://basic.smartedu.cn/): official study/teacher-resource reference and candidate outbound links. The national page did not expose a readable redistribution agreement during this research. Regional SmartEdu agreements are not treated as this site's national license. Do not claim it grants platform-wide import, revoicing, video embedding or public redistribution rights. Assess each specific resource/authorization first.
- [seewo.com](https://www.seewo.com/): official help confirms resource downloads, while the [legal notice](https://www.seewo.com/support/announce/detail/2) reserves site rights and [published service terms](https://cstore-public.seewo.com/momAdmin/3fa970db1a034eca81c65bd011612b79.html) restrict republication without relevant permission. These documents do not prove one blanket license for all teacher-uploaded courseware. Seek specific creator authorization for redistribution/adaptation. A downloaded proprietary lesson may also depend on native software; PPT conversion can lose animation, voice and interactive scoring.
- `qiketang.com` and `wuketang.cn`: exact domains could not be accessed or verified in this research, and searches did not establish an official reusable-content agreement. Keep them as unverified leads, not approved sources. Do not substitute similarly named sites or invent a license conclusion.

Usable paths are: authorized import into the public library; original-author contribution with explicit media/adaptation rights; ordinary outbound reference links; and separately authorized private materials in the existing personal workspace. A download button, paid download membership or free learner access is not itself proof that public redistribution is permitted. Do not bypass access controls or bulk-copy catalogs.

## One preparation pipeline, inexpensive learner playback

1. **Curriculum identity:** retain existing China graph/topic IDs, grade/term and optional textbook/outcome mappings. BC has a separate outcome mapping; sharing an activity does not establish BC alignment.
2. **Source selection:** select a small resource for one learning objective. Record its version, author/license, media rights, language and pedagogical scope. Preserve notices in resource information, not product brand names.
3. **Prepare a lesson once:** human/AI-assisted authoring produces one reviewed storyboard with synchronized pictures/actions/speech, untimed child stops and specific feedback. AI preparation costs are paid once, not at every learner play. Prefer existing strong recordings; generate or record only genuinely missing/weak clips, then cache them by edition.
4. **Classroom playback:** reuse the current teacher/room/classmate components and a single audio owner. Each storyboard step binds visible objects/highlights, short speech, a question/game, feedback and optional authored classmate turn. Advance only after child action. A clip ending does not automatically start the next idea.
5. **Interactions:** begin with a small family of parameterized grouping, place-value, number-line, sorting/matching, clock and shopping activities. Reuse vetted static games where suitable. Foreign HTML stays isolated; no child credentials, analytics, arbitrary network access or unvalidated progress messages. Record only canonical assessed answers as mastery, not animation watching or a game saying “success”.
6. **Review and publication:** draft → technical/math/media review → child trial → recommended public edition. Existing labeled trials and approved/recommended content must remain visibly distinct. Keep alternate editions and version-bound feedback; do not overwrite reports when a lesson is repaired.
7. **Free learner path:** existing course, prerecorded media, deterministic practice/feedback, stars/history and correction reports use no model calls. Missing coverage shows availability, without automatically generating at platform expense. Personal changes and live tutoring use the existing future Pro policy; do not activate incomplete billing gates during this pilot.

Virtual classmates are prewritten fictional companions. At a question they can raise a hand; offer their hint/answer **after the child's attempt or explicit request**, stop teacher audio while they speak, and let the child decide when to continue. No live multi-agent class is required. Avoid showing the answer immediately or making continuous background movement that distracts children.

## Resource-aware storage and execution

- Supabase: source/license metadata, course index/review state, existing learner sessions/reports. Do not store copies of media or duplicate histories per student.
- R2: immutable shared audio/art/video objects keyed by hashes/edition; private pilot bucket and read-only website credentials remain unchanged. Only changed media is uploaded for an edition. Do not route video through the current 500 KB audio-only validator.
- Website/browser: cached static storyboards, deterministic games and lazy-loaded reusable 3D teacher/room. One active renderer; pause animation offscreen and provide fallback. No GPU inference/server rendering is required on the 2-core/4 GB host.
- Vercel: existing auth/index/record APIs and bounded authoring steps. Prepared playback does not require a 300-second generation request. The current private no-store audio proxy is adequate for a small pilot; broader free traffic needs measured delivery/request costs and an explicit caching/CDN/access design before changing public access.
- Do not promise free unlimited traffic: model-free learning still has storage, requests and hosting costs. Monitor those separately from Managed AI credits. There is no hardware purchase or new paid service in this decision.

## Delivery order and acceptance

1. Rework the **same introductory multiplication sample** around the existing stronger virtual classroom, teacher and classmate turns. Preserve existing pilot/version access and learner reports; a changed teaching/answer contract requires a new immutable edition. No five-candidate bulk rollout.
2. Evaluate one KidsLab activity against the exact concept and existing reviewed grouping game. Import only if it improves clarity or engagement; otherwise retain the stronger native game. Do not spend a day integrating a weaker alternative for the sake of reuse.
3. Use a short storyboard: concrete two-basket story → teacher demonstrates equal groups in sync → child manipulates → classmate raises hand and offers a hint after an attempt → short independent practice → visual recap/report. This is a proposal to trial, not a fixed claim about lesson length.
4. Review actual sound naturalness, visual/action synchronization, child vocabulary, pauses, interaction correctness, hand-raising, mobile layout and persistence **on the website**. Ask for child feedback on comprehension and enjoyment; technical pass alone is insufficient.
5. After that sample is accepted, prepare a small Grade-2 unit with the same templates. Expand one unit at a time, then Grade-1/3/4 and separately mapped BC activities. Do not advertise a complete K–9 library from README counts.

Completion of this research/planning step does not mean the revised room is deployed. Next implementation is the one-course integration and child-quality comparison, not more unrelated storage, billing or engine work.
