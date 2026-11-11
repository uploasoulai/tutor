/** Compile reviewed storyboard/audio with the installed native kit. No network/model calls. */
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const work = join(root, 'data/narrated-fractions');
const kit = join(
  root,
  'third_party/personal-ai-tutor-runtime/deeptutor/agents/video_lesson/remotion',
);
const runtime = join(root, 'data/video-lesson-pilot');
const story = JSON.parse(
  readFileSync(join(root, 'lib/curriculum/fractions-storyboard.json'), 'utf8'),
);
const voice = JSON.parse(
  readFileSync(join(work, 'voice.ts'), 'utf8')
    .replace(/^export const VOICE = /, '')
    .trim()
    .replace(/;$/, ''),
);
let offset = 0;
const shots = [];
const chapters = story.chapters.map((chapter) => {
  const start = offset;
  for (const shot of chapter.shots) {
    const clip = voice[shot.id];
    if (
      !clip?.src?.startsWith('data:audio/mpeg;base64,') ||
      !Number.isInteger(clip.frames) ||
      clip.frames <= 0
    )
      throw new Error('Missing measured narration for ' + shot.id);
    shots.push({ ...shot, start: offset, frames: 30 + clip.frames });
    offset += 30 + clip.frames;
  }
  return { id: chapter.id, title: chapter.title, start, end: offset - 1 };
});
const manifest = {
  version: 2,
  asset: '/lessons/fractions-narrated-v2.html',
  fps: story.fps,
  durationInFrames: offset,
  chapters,
  shots: shots.map((s) => ({
    id: s.id,
    start: s.start,
    end: s.start + s.frames - 1,
    audioStart: s.start + 10,
    audioEnd: s.start + 10 + voice[s.id].frames - 1,
    shaded: s.shaded,
  })),
};
mkdirSync(work, { recursive: true });
for (const name of ['kit.tsx', 'china_outline.json'])
  copyFileSync(join(kit, name), join(work, name));
const source = `import React from 'react';import {AbsoluteFill} from 'remotion';import {Scenes,lessonLength} from './kit';
const SHOTS=${JSON.stringify(shots)};
function Picture({shot}){return <AbsoluteFill style={{background:'#f2f8f5',fontFamily:'system-ui,sans-serif',color:'#173e49'}}>
  <div style={{position:'absolute',top:28,left:70,fontSize:24,color:'#427d78'}}>CoastalTutor · 分数小课堂</div>
  <h1 style={{position:'absolute',top:76,left:70,right:70,margin:0,fontSize:44}}>{shot.title}</h1>
  <p style={{position:'absolute',top:146,left:70,right:70,margin:0,fontSize:30}}>{shot.cue}</p>
  <div style={{position:'absolute',top:235,left:70,width:820,display:'flex'}}>{[0,1,2,3].map(i=><div key={i} style={{boxSizing:'border-box',width:205,height:150,border:'3px solid #126e75',borderLeftWidth:i?0:3,background:i<shot.shaded?'#65cbb0':'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:38}}>1/4</div>)}</div>
  {shot.label ? <div style={{position:'absolute',top:406,left:80,right:80,display:'flex',justifyContent:'center',alignItems:'center',gap:35,fontSize:30}}>
    <div style={{display:'flex',flexDirection:'column',textAlign:'center',fontSize:44,lineHeight:1.05}}><strong style={{color:shot.label==='numerator'?'#126e75':'#173e49'}}>3</strong><span style={{borderTop:'3px solid #173e49',padding:'4px 12px',color:shot.label==='denominator'?'#126e75':'#173e49'}}>4</span></div>
    <span>{shot.label==='numerator'?'分子：选中的份数':'分母：平均分的总份数'}</span></div> : <p style={{position:'absolute',top:417,left:70,right:70,margin:0,textAlign:'center',fontSize:34}}>选中 {shot.shaded} 份 / 一共 4 份</p>}
</AbsoluteFill>}
const SCENES=SHOTS.map(shot=>({voice:shot.id,frames:1,content:<Picture shot={shot}/>}));
export const LESSON={width:960,height:720,fps:30,durationInFrames:lessonLength(SCENES)};
export const Lesson=()=> <Scenes scenes={SCENES}/>;`;
writeFileSync(join(work, 'Lesson.tsx'), source);
const report = execFileSync(
  process.execPath,
  [join(kit, 'build.mjs'), join(work, 'Lesson.tsx'), join(work, 'native-check.js')],
  { cwd: root, env: { ...process.env, DEEPTUTOR_REMOTION_RUNTIME: runtime }, encoding: 'utf8' },
);
const checked = JSON.parse(report.trim().split('\n').at(-1));
if (!checked.ok) throw new Error('Native composition check failed');
writeFileSync(join(work, 'manifest.json'), JSON.stringify(manifest));
copyFileSync(join(root, 'lib/curriculum/fractions-storyboard.json'), join(work, 'storyboard.json'));
copyFileSync(
  join(root, 'eval/video-lesson/reviewed-player.tsx.txt'),
  join(work, 'reviewed-player.tsx'),
);
const require = createRequire(join(runtime, 'package.json'));
require('esbuild').buildSync({
  entryPoints: [join(work, 'reviewed-player.tsx')],
  outfile: join(work, 'player.js'),
  bundle: true,
  jsx: 'automatic',
  platform: 'browser',
  format: 'iife',
  minify: true,
  nodePaths: [join(runtime, 'node_modules')],
  alias: {
    react: join(runtime, 'node_modules/react'),
    'react-dom': join(runtime, 'node_modules/react-dom'),
  },
  define: { 'process.env.NODE_ENV': '"production"' },
});
const js = readFileSync(join(work, 'player.js'), 'utf8').replaceAll('</script', '<\\/script');
const html = `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; media-src data: blob:; connect-src data: blob:; base-uri 'none'; form-action 'none'">
<title>CoastalTutor 分数讲解</title><style>*{box-sizing:border-box}body{margin:0;background:#f2f8f5;color:#173e49;font:16px system-ui,sans-serif}#player{max-width:960px;margin:auto}.readable-caption{display:none}@media(max-width:600px){.readable-caption{display:block;margin:0;padding:10px 14px;background:#e7f1ec;font-size:16px;line-height:1.65}}.tools{padding:8px 12px;background:white}.seek{display:flex;align-items:center;gap:10px;font-size:14px}.seek input{flex:1;min-width:60px;min-height:28px}.buttons{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}button{min-height:44px;border:1px solid #126e75;border-radius:10px;color:#173e49;background:#f2f8f5;font:600 14px system-ui,sans-serif;cursor:pointer}button:focus-visible,input:focus-visible{outline:3px solid #d38d19;outline-offset:1px}output{display:block;font-size:12px;margin-top:3px;color:#52716e}</style><div id="player"></div><script>${js}</script></html>`;
// Native kit CSS templates contain trailing spaces; normalize this generated asset.
const cleanHtml = html
  .split('\n')
  .map((line) => line.trimEnd())
  .join('\n');
writeFileSync(join(root, 'public/lessons/fractions-narrated-v2.html'), cleanHtml);
writeFileSync(
  join(root, 'lib/curriculum/fractions-media.json'),
  JSON.stringify(manifest, null, 2) + '\n',
);
writeFileSync(
  join(work, 'build-report.json'),
  JSON.stringify(
    {
      nativeFramesChecked: checked.frames.length,
      assetBytes: Buffer.byteLength(cleanHtml),
      manifest,
    },
    null,
    2,
  ),
);
console.log(
  JSON.stringify({
    nativeFramesChecked: checked.frames.length,
    assetBytes: statSync(join(root, 'public/lessons/fractions-narrated-v2.html')).size,
    seconds: offset / 30,
    chapters: chapters.length,
  }),
);
