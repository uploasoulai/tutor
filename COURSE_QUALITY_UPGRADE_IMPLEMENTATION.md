# Elementary demonstration upgrade — 2026-11-13

## Recommended presentation

Sign in, then open **School Learning → China** or directly:

- `/school-learning/china/multiplication-lab`: primary Grade-2 narrated interactive lesson. All signed-in users can enter; students have private progress and parents/admins get non-writing preview.
- `/school-learning/china/place-value-lab`: immediately available 243/2046 block exploration, no generation and no grades.
- Personal AI Tutor: show the existing capabilities page and CoastalTutor sidebar. It retains its native learning tools; no separate Tutor deployment is needed for this School-only update.

Use the prepared lesson for a reliable demonstration; a freshly generated arbitrary topic still needs time and educational review. Complete the actual learner questions before presenting a finished record. Never represent a parent preview or video viewing as mastered learning.

## Before / after of the same Grade-2 topic

| Aspect | Previous reviewed version | This release |
| --- | --- | --- |
| Topic / learning flow | `cnm_p038`, six learner phases | Same topic, questions, owner-bound session and six phases |
| Teacher explanation | Basic eight utterances, 70.77 seconds | Eight expanded utterances, 137.63 seconds; explains equal addends, meaning of each factor, why 2+3 is not the grouping total, and unequal-group misconception |
| Voice | Xiaoxiao, native recorder | Same voice and native path; durations remeasured, matching visual shot durations rebuilt |
| Lesson display | Teacher classroom above a separate player | One classroom frame, teacher beside the live lesson screen, chapter-synchronised screen, unchanged interactive hit targets |
| Published asset | Versioned v1, retained | Versioned v2, ~1.64 MB, three chapters; shared static artifact, no per-user media copy |
| Generation at playback | None | None; prepared asset, zero LLM/image/video-service calls |

More duration alone is not evidence of better teaching. Specific new reasoning and misconception explanations are the quality change; actual child pacing feedback remains necessary. Only reviewed text is sent to the existing operator recorder, never student data. No paid video generation is involved. A USD cost estimate is not invented where prices are not configured.

## Generic School generation improvements

School-only role-specific teaching moves and weighted action budgets; empty-visual/missing-speech checks with safe local reports; preserved checkpoint-local retry; actual per-call token/time/finish metadata. No second planning engine, model swap, automatic fallback or repeated LLM judge. Existing cached lessons and native Tutor/Classroom capabilities remain intact. See the audit for exact boundaries and unfinished work.

## Acceptance record

Native compiled player passes 25 sampled frames. Decoded narration plays for all three chapters; pause and seek checks pass. Full Grade-2 browser flow covers real grouping, learner attempts, tutor handoff, review, role-safe preview, focus continuity and graphics-disabled fallback. Final unit/build/format and browser results are recorded in `IMPLEMENTATION_STATUS.md` before push. These local checks do not assert Vercel Ready or full production student acceptance.

Higher-grade comparison, provider A/B, full automatic hybrid videos, semantic LLM quality judging, unified family history and course-cost dashboard are deferred. This week's focus is explicitly elementary demonstration quality and reliability.
