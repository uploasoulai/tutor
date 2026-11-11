/** Offline integration regression: uses installed native pilot tooling, no model calls. */
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const assets = join(
  root,
  'third_party/personal-ai-tutor-runtime/deeptutor/agents/video_lesson/remotion',
);
const runtime = process.env.DEEPTUTOR_REMOTION_RUNTIME || join(root, 'data/video-lesson-pilot');
const work = join(root, 'data/video-lesson-pilot/timeline-regression');
mkdirSync(work, { recursive: true });
for (const name of ['kit.tsx', 'china_outline.json'])
  copyFileSync(join(assets, name), join(work, name));
writeFileSync(
  join(work, 'voice.ts'),
  'export const VOICE = { s1:{text:"First",frames:120,captions:[{at:0,text:"First"}]}, s2:{text:"Final check",frames:120,captions:[{at:0,text:"Final check"}]} };',
);
function check(duration) {
  writeFileSync(
    join(work, 'Lesson.tsx'),
    `import React from 'react'; import {Scenes,Stage,Body,lessonLength} from './kit';
const SCENES=[{voice:'s1',frames:90,content:<Stage><Body x={120} y={250}>Explain equal parts</Body></Stage>},{voice:'s2',frames:90,content:<Stage><Body x={120} y={250}>Final learning check</Body></Stage>}];
export const LESSON={durationInFrames:${duration},fps:30,width:1920,height:1080}; export const Lesson=()=> <Scenes scenes={SCENES}/>;`,
  );
  return compile();
}
function compile() {
  let output;
  try {
    output = execFileSync(
      process.execPath,
      [join(assets, 'build.mjs'), join(work, 'Lesson.tsx'), join(work, 'player.js')],
      {
        env: { ...process.env, DEEPTUTOR_REMOTION_RUNTIME: runtime },
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    );
  } catch (error) {
    if (!error.stdout) throw error;
    output = String(error.stdout);
  }
  return JSON.parse(output.trim().split('\n').at(-1));
}
const short = check('200');
assert.equal(short.ok, false);
assert.equal(short.stage, 'render');
assert.equal(
  short.errors.length,
  1,
  'Reject a static timeline failure once rather than spending all frame checks',
);
assert.match(short.errors[0], /timeline is truncated/);
const complete = check('lessonLength(SCENES)');
assert.equal(complete.ok, true);
assert.equal(complete.frames.length, 25);
writeFileSync(
  join(work, 'voice.ts'),
  'export const VOICE = { s1:{text:"First",frames:120,captions:[]}, s2:{text:"Final",frames:120,captions:[]}, orphan:{text:"Lost teaching step",frames:120,captions:[]} };',
);
const orphan = check('lessonLength(SCENES)');
assert.equal(orphan.ok, false);
assert.equal(orphan.errors.length, 1);
assert.match(orphan.errors[0], /narration is not connected/);
for (const [name, expected] of [
  ['truncated', /timeline is truncated/],
  ['disconnected', /narration is not connected/],
]) {
  const fixtures = join(root, 'eval/video-lesson/regression');
  copyFileSync(join(fixtures, `${name}-lesson.tsx.txt`), join(work, 'Lesson.tsx'));
  copyFileSync(join(fixtures, `${name}-voice.ts.txt`), join(work, 'voice.ts'));
  const result = compile();
  assert.equal(result.ok, false, `Previously accepted AI draft ${name} must be rejected`);
  assert.match(result.errors[0], expected);
}
console.log(
  'Video regression passed: truncated ending and disconnected narration rejected; complete lesson passes 25 frame checks.',
);
