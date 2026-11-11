/** Reviewed, offline manipulative for introductory multiplication; no generated JS. */
export const GROUPING_ACTIVITY_HTML = `<!doctype html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
*{box-sizing:border-box}body{margin:0;padding:20px;background:#f1f7f5;color:#173e49;font:18px/1.6 system-ui,sans-serif}
main{max-width:840px;margin:auto}h1{font-size:clamp(22px,4vw,32px);margin:0 0 10px}
button{font:inherit;cursor:pointer;touch-action:manipulation}button:focus-visible{outline:3px solid #e09e28;outline-offset:3px}
#pool{display:flex;gap:12px;flex-wrap:wrap;min-height:78px;padding:15px;background:white;border-radius:18px;margin:20px 0}
.chip{width:52px;height:52px;border:2px solid #126e75;background:#65cbb0;border-radius:50%;color:#173e49;font-weight:bold}
.chip[aria-pressed=true]{outline:4px solid #e09e28;outline-offset:2px}.chip[hidden]{display:none}
#groups{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.group{min-height:142px;border:2px dashed #126e75;background:white;border-radius:18px;padding:12px;color:inherit}
.pieces{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-top:12px;min-height:40px}.dot{display:inline-block;width:34px;height:34px;border-radius:50%;background:#65cbb0;border:2px solid #126e75}
#feedback{min-height:88px;margin:18px 0;padding:16px;background:#e1efea;border-radius:16px}
#reset{min-height:48px;border:1px solid #126e75;background:white;border-radius:12px;padding:8px 20px;color:inherit}
@media(max-width:480px){body{padding:14px;font-size:16px}#groups{gap:7px}.group{padding:8px;min-height:132px}.dot{width:28px;height:28px}}
</style></head><body><main>
<h1>每组放 2 个，一共能放几组？</h1>
<p>先点一个圆片，再点下面的盒子。让每个盒子都有 2 个圆片。</p>
<div id="pool" role="group" aria-label="待分组的六个圆片"></div>
<div id="groups" role="group" aria-label="三个分组盒子"></div>
<p id="feedback" role="status" aria-live="polite">不用着急，先选一个圆片吧。</p>
<button id="reset" type="button">重新分一分</button>
</main><script>
const assignment=Array(6).fill(-1);let selected=-1;
const pool=document.getElementById('pool'),groups=document.getElementById('groups'),feedback=document.getElementById('feedback');
const chips=assignment.map((_,i)=>{const b=document.createElement('button');b.type='button';b.className='chip';b.textContent=String(i+1);b.setAttribute('aria-label','第 '+(i+1)+' 个圆片');b.addEventListener('click',()=>{selected=selected===i?-1:i;render();feedback.textContent=selected<0?'先选一个圆片吧。':'选好了，请点一个还没放满的盒子。'});pool.appendChild(b);return b});
const boxes=Array.from({length:3},(_,g)=>{const b=document.createElement('button');b.type='button';b.className='group';b.addEventListener('click',()=>{if(selected<0){feedback.textContent='先点上面的一个圆片，再选盒子。';return}if(assignment.filter(n=>n===g).length>=2){feedback.textContent='这个盒子已有 2 个。试试还没放满的盒子。';return}assignment[selected]=g;selected=-1;render();const placed=assignment.filter(n=>n>=0).length;parent.postMessage({channel:'coastaltutor-grouping',version:1,event:'progress',complete:placed===6},'*');feedback.textContent=placed===6?'每组 2 个，有 3 组：2 + 2 + 2 = 6，也就是 3 个 2，可以用 2 × 3 = 6 表示。':'已放好 '+placed+' 个圆片。继续让每个盒子都放 2 个。'});groups.appendChild(b);return b});
function render(){chips.forEach((b,i)=>{b.hidden=assignment[i]>=0;b.setAttribute('aria-pressed',String(selected===i))});boxes.forEach((b,g)=>{const count=assignment.filter(n=>n===g).length;b.setAttribute('aria-label','第 '+(g+1)+' 个盒子，已放 '+count+' 个');b.replaceChildren();const label=document.createElement('span');label.textContent='第 '+(g+1)+' 组';b.appendChild(label);const pieces=document.createElement('span');pieces.className='pieces';for(let i=0;i<count;i++){const dot=document.createElement('span');dot.className='dot';dot.setAttribute('aria-hidden','true');pieces.appendChild(dot)}b.appendChild(pieces);const number=document.createElement('span');number.textContent=count+' / 2';b.appendChild(number)})}
document.getElementById('reset').addEventListener('click',()=>{assignment.fill(-1);selected=-1;render();parent.postMessage({channel:'coastaltutor-grouping',version:1,event:'progress',complete:false},'*');feedback.textContent='重新开始了。先选一个圆片吧。'});render();
</script></body></html>`;
