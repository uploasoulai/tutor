/** Authored, ungraded manipulative. Values are internal curriculum examples, never learner data. */
export function buildPlaceValueActivity(target: number, places: 3 | 4): string {
  if (!Number.isInteger(target) || target < 0 || target >= 10 ** places)
    throw new Error('Invalid place-value example');
  return `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'">
<style>
*{box-sizing:border-box}body{margin:0;padding:20px;background:#fff8ec;color:#173e49;font:18px/1.6 "Microsoft YaHei","PingFang SC",system-ui,sans-serif}main{max-width:940px;margin:auto}h1{font-size:1.5rem;margin:0 0 8px}p{margin:8px 0 16px}button{min-height:48px;font:inherit;border:2px solid #387c7c;border-radius:12px;padding:8px 14px;background:white;color:inherit;cursor:pointer}button:focus-visible{outline:4px solid #dc9c28;outline-offset:3px}button:disabled{opacity:.45;cursor:default}
#places{display:grid;grid-template-columns:repeat(${places},minmax(0,1fr));gap:12px}.place{border:2px solid #b6d2c7;border-radius:18px;padding:12px;background:white;min-width:0}.place h2{font-size:1.2rem;margin:0}.value{display:block;font-weight:700}.controls{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.controls button{flex:1;min-width:68px;font-size:16px;padding:8px}.blocks{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;min-height:90px;padding:8px;background:#eef6ef;border-radius:10px}.blocks svg{flex-shrink:0}.empty{font-size:15px;color:#536b67}#number{display:block;padding:14px;margin:16px 0;background:#e1efea;border-radius:14px;font-size:1.2rem}#feedback{display:block;min-height:64px;padding:12px;background:#fff0c9;border-radius:14px}footer{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
@media(max-width:600px){body{padding:14px}#places{grid-template-columns:repeat(2,minmax(0,1fr))}.place{padding:10px}h1{font-size:1.3rem}}
</style></head><body><main>
<h1>用计数块搭出 ${target}</h1>
<p>点“加一个”或“减一个”调整各位的数量。每一位最多放 9 个。零表示这一位暂时没有计数块。</p>
<div id="places" aria-label="数位操作区"></div>
<output id="number" aria-live="polite"></output>
<p id="feedback" role="status" aria-live="polite">先看看目标数，想一想每个数字在哪一位。不用着急。</p>
<footer><button id="check" type="button">检查我的搭法</button><button id="reset" type="button">重新搭一搭</button></footer>
<p style="font-size:14px;margin-top:16px">这是动手探索，不计分。课程中的理解检查会单独记录。</p>
</main><script>
const target=${target},count=Array(${places}).fill(0),names=['一','十','百','千'],positions=['个','十','百','千'];
const root=document.querySelector('#places'),feedback=document.querySelector('#feedback'),number=document.querySelector('#number');
const columns=[];
function block(p){
 const ns='http://www.w3.org/2000/svg',s=document.createElementNS(ns,'svg');s.setAttribute('viewBox',p===0?'0 0 10 10':p===1?'0 0 10 82':'0 0 82 82');s.setAttribute('width',p<2?'10':'60');s.setAttribute('height',p===0?'10':p===1?'80':'60');s.setAttribute('aria-hidden','true');
 if(p===3){s.innerHTML='<path d="M5 20L50 5L77 21L32 37Z" fill="#99cfc3" stroke="#387c7c"/><path d="M5 20L32 37V77L5 59Z" fill="#65b4a9" stroke="#387c7c"/><path d="M32 37L77 21V61L32 77Z" fill="#388b85" stroke="#387c7c"/>';return s}
 const r=document.createElementNS(ns,'rect');r.setAttribute('x','1');r.setAttribute('y','1');r.setAttribute('width',p===2?'80':'8');r.setAttribute('height',p===0?'8':'80');r.setAttribute('fill',p===0?'#edb34f':p===1?'#7ec4cc':'#93ceb1');r.setAttribute('stroke','#387c7c');s.append(r);
 if(p>0){const grid=document.createElementNS(ns,'path');let d='';for(let i=1;i<10;i++){const at=1+i*8;d+='M1 '+at+'H'+(p===2?81:9)+' ';if(p===2)d+='M'+at+' 1V81 ';}grid.setAttribute('d',d);grid.setAttribute('stroke','#387c7c');grid.setAttribute('stroke-width','.6');s.append(grid)}return s;
}
function render(){
 let total=0;columns.forEach(({p,amount,blocks,plus,minus})=>{total+=count[p]*10**p;amount.textContent=count[p]+' 个'+names[p]+' = '+count[p]*10**p;blocks.replaceChildren();blocks.setAttribute('aria-label',count[p]+' 个'+names[p]);if(!count[p]){const empty=document.createElement('span');empty.className='empty';empty.textContent='这一位是 0';blocks.append(empty)}for(let i=0;i<count[p];i++)blocks.append(block(p));plus.disabled=count[p]===9;minus.disabled=count[p]===0;});
 number.textContent='现在搭出的数：'+total;document.body.dataset.complete='false';return total;
}
for(let p=count.length-1;p>=0;p--){
 const card=document.createElement('section');card.className='place';const h=document.createElement('h2');h.textContent=positions[p]+'位';const hint=document.createElement('p');hint.className='empty';hint.textContent=p===3?'1 个千 = 10 个百':p===2?'1 个百 = 10 个十':p===1?'1 个十 = 10 个一':'1 个方块表示 1';
 const amount=document.createElement('span');amount.className='value';amount.setAttribute('aria-label',positions[p]+'位的数量');const controls=document.createElement('div');controls.className='controls';const plus=document.createElement('button'),minus=document.createElement('button');plus.type=minus.type='button';plus.textContent='加一个';minus.textContent='减一个';plus.setAttribute('aria-label','加一个'+names[p]);minus.setAttribute('aria-label','减一个'+names[p]);
 for(const [button,delta] of [[plus,1],[minus,-1]])button.addEventListener('click',()=>{count[p]=Math.max(0,Math.min(9,count[p]+delta));render();feedback.textContent='看看'+positions[p]+'位变了，整个数怎样变？搭好以后可以检查。'});
 controls.append(minus,plus);const blocks=document.createElement('div');blocks.className='blocks';blocks.setAttribute('role','img');card.append(h,hint,amount,controls,blocks);root.append(card);columns.push({p,amount,blocks,plus,minus});
}
document.querySelector('#check').addEventListener('click',()=>{const total=render();const correct=total===target;document.body.dataset.complete=String(correct);feedback.textContent=correct?'你把数位和数量对应起来了！'+count.map((n,p)=>n? n+' 个'+names[p]+'（'+n*10**p+'）':'').reverse().filter(Boolean).join(' + ')+'，合起来是 '+target+'。':'现在搭出的是 '+total+'，还不是 '+target+'。从最高位开始，对比目标数的每一位，再调整一下。';});
document.querySelector('#reset').addEventListener('click',()=>{count.fill(0);render();feedback.textContent='已经清空。先从最高位想起，再搭一次吧。'});render();
</script></body></html>`;
}
