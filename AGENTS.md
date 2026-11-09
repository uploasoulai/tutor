# CoastalTutor project constraints

These rules are the operating contract for work in this repository. Follow them before making changes.

## Project and browser identity

- The CoastalTutor project is `C:\CoastalTutor`. This computer is shared by several projects. Never infer the target project from a similarly named folder, an arbitrary current browser tab, another project's login, or a global CLI account.
- If the current directory is not `C:\CoastalTutor`, switch to the project path before inspecting or editing CoastalTutor. `C:\SmartTutor` is not this project.
- The user's CoastalTutor Vercel project is the authenticated project in **Chrome**: team `UploadSoul AI`, project `tutor`, at `vercel.com/upload-soul-ai-s-projects/tutor`; production domain `tutor.uploadsoul.com`. When Vercel UI inspection or operation is needed, use that project in Chrome and confirm its project name/domain. Do not use Edge, another browser profile, or the globally logged-in Vercel CLI to identify or operate the project.
- DeepTutor's production server is the user's Aliyun Light Server in Beijing. The user manages it through the signed-in Aliyun ECS Cloud Assistant in **Edge**. Use Edge and confirm the target instance before any remote operation; do not treat missing local SSH config as lack of access or infer this server from Vercel. Use read-only inspection first, preserve its existing service/data/config, and never print API keys or internal bridge/SSO secrets in command output.
- Treat Vercel production as healthy unless a concrete user-facing failure is observed. Do not spend work on speculative deployment troubleshooting. Prioritize student courses and platform features; use the Chrome project only when the actual work needs deployment or website inspection.

## Decisions and documentation

- Read `IMPLEMENTATION_STATUS.md` and the relevant sections of `SCHOOL_LEARNING_ARCHITECTURE.md` before product or integration work. Read the applicable detailed requirements/provider matrix and the current pinned DeepTutor code/docs when the task touches those areas.
- The latest explicit user decisions in the conversation override older plans and documents. Update the short status/architecture documents when decisions or implementation state change; do not ask the user to repeat approved requirements.
- China K–12 and the student/parent testing path are the highest delivery priority. School Learning follows the selected curriculum/knowledge graph and generates an interactive virtual lesson. Personal AI Tutor uses the integrated DeepTutor product; Interactive Classroom uses the existing OpenMAIC module. Do not surface underlying project names as product-facing brands or menus.
- Preserve one platform learner identity and the connected DeepTutor workspace. Reuse the native DeepTutor capabilities that fit the product (learner profile, mastery paths, practice/question notebook and mistake review, memory, guardian controls) instead of rebuilding duplicates. Verify exactly what each current screen/API reports before presenting it as learner progress. Keep clear ownership for records and make cross-product progress visible through shared identity or read-through integration, not duplicate student accounts or copied histories.
- For a School Learning wrong answer, keep curriculum mastery in CoastalTutor and hand the problem plus learner response to that same learner's DeepTutor tutor using a short-lived, learner-bound SSO handoff. Let DeepTutor handle its native coaching and question-bank workflow; do not build a parallel explanation/mistake-review system in CoastalTutor. Prefill for the learner to review; never auto-send the handoff.
- China curriculum source material was downloaded for local use, not forked. Do not push taxonomy source/data or attribution changes to public GitHub as a way to conceal provenance. Preserve required notices and follow the latest user-approved handling instructions.

## How to execute

- When the user says continue or has already approved a design, implement the next concrete feature autonomously. Read the relevant documents and code, then make the change; do not stop after explaining interfaces, architecture, or an implementation plan.
- Resolve routine implementation choices independently. Do not pause for permission or ask the user to restate settled requirements. Ask only when a real blocker or a product decision that cannot be inferred prevents safe progress.
- Keep commentary short and about meaningful progress. Do not send long interface/API reports and wait. Report what changed, material limits, and actual next blocker only after useful work is complete.
- Configure files and services yourself when the change is local and authorized. Keep secrets out of tracked files, browser code, logs, and messages. Do not perform unrelated repository or external-service changes.
- The user's acceptance target is that student testers can use the website. Keep the site experience and end-to-end learner path in view; do not call local-only work deployed. When a feature is ready for the already-authorized tester workflow, use the correct Chrome CoastalTutor Vercel project and report the resulting live state.
