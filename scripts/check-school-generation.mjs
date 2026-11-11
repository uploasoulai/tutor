/** Explicit operator-only curriculum fixture. Never writes a learner or production artifact. */
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
if (!process.argv.includes('--live')) {
  throw new Error('Use --live to authorize bounded calls to the locally configured provider.');
}
const root = resolve(import.meta.dirname, '..');
const require = createRequire(join(root, 'data/video-lesson-pilot/package.json'));
const { buildSync } = require('esbuild');
const work = join(root, 'data/school-generation-check');
mkdirSync(work, { recursive: true });
const repair = process.argv.includes('--repair-interaction');
const reviewed = process.argv.includes('--reviewed');
const source = `
import {writeFileSync,readFileSync} from 'node:fs';
import {generateSchoolStep,schoolGenerationUserPrompt} from '../../lib/server/school-generation-runner';
import {initialSchoolGeneration} from '../../lib/server/school-generation-state';
import {resolveModel} from '../../lib/server/resolve-model';
import {callLLM} from '../../lib/ai/llm';
async function main() {
  process.loadEnvFile('.env.local');
  const state=initialSchoolGeneration('operator-fixture',{requirement:
    '为二年级中国数学制作6个简短场景：生活问题(slide)、乘法表示几个相同加数的直观讲解(slide)、可点击的分组互动(interactive)、用3组每组2个的例题推理(slide)、两道理解检查(quiz)、回顾迁移(slide)。同一个故事贯穿。不能只说点击却没有控件。不要付费媒体。中文短句，参考答案在学生思考前不直接给出。',
    maxScenes:6,maxOutputTokens:4096,curriculumLessonCache:{cacheKey:'0'.repeat(64),track:'china',canonicalId:'operator-fixture',sourceRevision:'operator-fixture',schemaVersion:2}});
  const repair=${repair};
  const reviewed=${reviewed};
  let original;
  if(repair) {
    original=JSON.parse(readFileSync('data/school-generation-check/result.json','utf8'));
    Object.assign(state,structuredClone(original.state));
    state.sceneIndex=state.outlines.findIndex(o=>o.type==='interactive');
    if(state.sceneIndex<0) throw new Error('No interaction fixture');
    const outline=state.outlines[state.sceneIndex];
    outline.widgetType='simulation';
    outline.widgetOutline={concept:outline.title+'。用点击或触摸替代拖动，展示分组及乘法关系，不计时不计分。'};
    if(reviewed) state.input.curriculumLessonCache.canonicalId='fixture:cnm_p038';
    state.phase='content';state.pendingContent=undefined;
    state.scenes=state.scenes.slice(0,state.sceneIndex);
  }
  const repairIndex=state.sceneIndex;
  const {model}=reviewed?{model:null}:await resolveModel({});
  const usage={calls:0,inputTokens:0,outputTokens:0};
  const started=Date.now();
  while(state.phase!=='publish') {
    const phase=state.phase;const index=state.sceneIndex;let calls=0;
    await generateSchoolStep(state,async(system,user)=>{
      if(++calls>1 || ++usage.calls>13) throw new Error('Fixture call budget exceeded');
      const result=await callLLM({model,messages:[{role:'system',content:system},{role:'user',content:schoolGenerationUserPrompt(state,user)}],maxOutputTokens:state.phase==='content'&&state.outlines?.[state.sceneIndex]?.type==='interactive'?2400:4096,maxRetries:0,abortSignal:AbortSignal.timeout(120000)},'school-operator-fixture');
      usage.inputTokens+=Number(result.usage.inputTokens??0);usage.outputTokens+=Number(result.usage.outputTokens??0);
      writeFileSync('data/school-generation-check/last-call.json',JSON.stringify({usage,elapsedMs:Date.now()-started,finishReason:result.finishReason}));
      if(result.finishReason==='length') throw new Error('Truncated fixture output');
      return result.text;
    });
    writeFileSync('data/school-generation-check/'+(reviewed?'reviewed-result.json':repair?'repaired-result.json':'result.json'),JSON.stringify({state,usage,elapsedMs:Date.now()-started},null,2));
    console.log(JSON.stringify({phase,index,scenes:state.scenes.length,...usage,elapsedMs:Date.now()-started}));
    if(repair && state.sceneIndex>repairIndex) {
      state.scenes.push(...original.state.scenes.slice(repairIndex+1));
      state.phase='publish';
      writeFileSync('data/school-generation-check/'+(reviewed?'reviewed-result.json':'repaired-result.json'),JSON.stringify({state,usage,elapsedMs:Date.now()-started},null,2));
      break;
    }
  }
  if(state.scenes.length!==6) throw new Error('Expected six complete teaching steps');
  console.log(reviewed?'REVIEWED_NATIVE_INTERACTION_PASSED_WITHOUT_MODEL_CALLS':repair?'INTERACTION_REPAIR_STRUCTURE_PASSED_REVIEW_STILL_REQUIRED':'SIX_SCENE_STRUCTURE_PASSED_REVIEW_STILL_REQUIRED');
}
main().catch((error)=>{const safe=['Truncated fixture output','Scene unavailable','School interaction requires untimed touch controls','Visible interaction unavailable'];console.error(JSON.stringify({failed:true,name:error?.name,status:error?.statusCode,reason:safe.includes(error?.message)?error.message:'fixture_failed'}));process.exitCode=1;});
`;
writeFileSync(join(work, 'entry.ts'), source);
buildSync({
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
