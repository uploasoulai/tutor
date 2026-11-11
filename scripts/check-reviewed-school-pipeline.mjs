/** Offline native pipeline fixture: no model, publication, learner or database writes. */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { execFileSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/reviewed-school-pipeline-check');
mkdirSync(work, { recursive: true });
const require = createRequire(join(root, 'data/video-lesson-pilot/package.json'));
writeFileSync(
  join(work, 'entry.ts'),
  `
import assert from 'node:assert/strict';
import {generateSchoolStep} from '../../lib/server/school-generation-runner';
import {initialSchoolGeneration} from '../../lib/server/school-generation-state';
import {reviewedSchoolActivity} from '../../lib/curriculum/reviewed-school-activities';
async function main(){
 for(const topic of ['cnm_p038','cnm_p053','cnm_p055']){
  const activity=reviewedSchoolActivity('china','pep:'+topic)!;
  const state=initialSchoolGeneration('operator-only',{requirement:'Offline reviewed activity fixture',curriculumLessonCache:{cacheKey:'0'.repeat(64),track:'china',canonicalId:'pep:'+topic,sourceRevision:'fixture',schemaVersion:3}});
  state.phase='content';state.languageDirective='zh-CN';
  state.stage={id:'fixture-'+topic,name:activity.title,style:'interactive',createdAt:0,updatedAt:0,agentIds:[]};
  state.outlines=[{id:'fixture-outline',type:'interactive',title:'Old mismatched draft',description:'Drag invisible chairs',keyPoints:[],order:0}];
  let calls=0;const ai=async()=>{calls++;throw new Error('Model call forbidden in offline reviewed fixture')};
  await generateSchoolStep(state,ai);assert.equal(state.phase,'actions');
  await generateSchoolStep(state,ai);assert.equal(state.phase,'publish');
  assert.equal(calls,0);assert.equal(state.scenes.length,1);
  assert.equal(state.scenes[0].title,activity.title);
  assert.equal(state.scenes[0].content.type,'interactive');
  assert.equal(state.scenes[0].actions[0].type,'speech');
  assert.equal(state.scenes[0].actions[0].text,activity.narration);
  console.log(topic+': native content/actions assembly passed with zero model calls; nothing published');
 }
}
main().catch(()=>{console.error('Reviewed pipeline fixture failed');process.exitCode=1});
`,
);
require('esbuild').buildSync({
  entryPoints: [join(work, 'entry.ts')],
  outfile: join(work, 'check.cjs'),
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  logLevel: 'silent',
  tsconfig: join(root, 'tsconfig.json'),
});
execFileSync(process.execPath, [join(work, 'check.cjs')], { cwd: root, stdio: 'inherit' });
