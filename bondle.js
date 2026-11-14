// Bondle: the daily science puzzle (standalone page at /bondle/).
// The day's six prompts come from bondle-core.js (picked by date from bondle-data.js and bondle-science.js),
// or from bondle/{date} in Firestore when the admin page set that day by hand.
// Progress and stats live in this browser (localStorage "bondline.bondle"), shared with the Bondline app.
(function(){'use strict';
const C=window.BondleCore,BANK=window.BONDLE_BANK||[],CFG=window.BONDLINE_FIREBASE||{};
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const COLORS=['var(--muted)','#3b9ae1','#22a06b','#f0663c','#9b5de5','#e6b400'];
const TOPIC_EMO={chem:'⚗️',phys:'🧲',bio:'🧬',earth:'🌍',space:'🪐',sci:'🔬'};
const DAY=864e5;
const ls={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}},raw(k){try{return localStorage.getItem(k)}catch(e){return null}},rawSet(k,v){try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}};
const dayKey=t=>C.dayKey(t);
const fmtDay=k=>{const m=/^(\d+)-(\d+)-(\d+)$/.exec(k);return m?new Date(+m[1],+m[2]-1,+m[3]).toLocaleDateString([], {weekday:'long',day:'numeric',month:'long'}):''};
const shortDay=k=>{const m=/^(\d+)-(\d+)-(\d+)$/.exec(k);return m?new Date(+m[1],+m[2]-1,+m[3]).toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'}):''};
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}
const statsOn=()=>ls.raw('bondline.stats')!=='off'&&ls.raw('bondline.notrack')!=='1'&&!navigator.globalPrivacyControl;
function vid(){let v=ls.raw('bondline.vid');if(!v||!/^[a-z0-9]{16,40}$/.test(v)){const a=new Uint8Array(20);crypto.getRandomValues(a);v=[...a].map(x=>'abcdefghijklmnopqrstuvwxyz0123456789'[x%36]).join('');ls.rawSet('bondline.vid',v)}return v}
const isMob=()=>matchMedia('(max-width:700px)').matches||/Mobi|Android|iPhone/.test(navigator.userAgent);

/* ---------- Firestore (REST, no sign-in needed) ---------- */
const BASE=()=>`https://firestore.googleapis.com/v1/projects/${CFG.projectId}/databases/(default)/documents`;
function enc(v){if(v===null||v===undefined)return{nullValue:null};if(typeof v==='boolean')return{booleanValue:v};if(typeof v==='number')return Number.isInteger(v)?{integerValue:String(v)}:{doubleValue:v};if(typeof v==='string')return{stringValue:v};if(Array.isArray(v))return{arrayValue:{values:v.map(enc)}};const f={};for(const k in v)if(v[k]!==undefined)f[k]=enc(v[k]);return{mapValue:{fields:f}}}
function dec(x){if(!x)return null;if('stringValue'in x)return x.stringValue;if('integerValue'in x)return +x.integerValue;if('doubleValue'in x)return x.doubleValue;if('booleanValue'in x)return x.booleanValue;if('nullValue'in x)return null;if('arrayValue'in x)return(x.arrayValue.values||[]).map(dec);if('mapValue'in x){const o={},f=x.mapValue.fields||{};for(const k in f)o[k]=dec(f[k]);return o}return null}
async function req(method,path,body){if(!CFG.projectId)throw new Error('no config');const r=await fetch(BASE()+path+(path.includes('?')?'&':'?')+'key='+encodeURIComponent(CFG.apiKey),{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined,cache:'no-store'});if(!r.ok)throw new Error('firestore '+r.status);return r.json()}
async function fget(path,ms){try{const d=await Promise.race([req('GET','/'+path),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),ms||4000))]);return dec({mapValue:{fields:d.fields||{}}})}catch(e){return e&&/404/.test(e.message)?{}:null}}

/* ---------- state ---------- */
const DEF={days:{},played:0,streak:0,maxStreak:0,best:0,sum:0,last:'',hist:[0,0,0,0,0,0,0]};
const store=()=>Object.assign({},DEF,ls.get('bondline.bondle',{})||{});
function save(s){const ks=Object.keys(s.days).sort();while(ks.length>60)delete s.days[ks.shift()];ls.set('bondline.bondle',s)}
const limit=()=>ls.raw('bondline.bondleTime')==='60'?60:30;
const todayKey=()=>dayKey(Date.now());
const G={run:null,timer:0,over:{}};
const byId=()=>{const m={};BANK.forEach(p=>m[p.id]=p);return m};
function roundsFor(rec){const m=byId();(rec.custom||[]).forEach(p=>m[p.id]=p);return rec.ids.map(id=>m[id]).filter(Boolean)}
const emo=rec=>rec.r.map(r=>C.TIERS[r.t].emo).join('');
const hex=(cls,fills,cur)=>{const P=[[50,6],[88,28],[88,72],[50,94],[12,72],[12,28]];
  return`<svg class="${cls}" viewBox="0 0 100 100" aria-hidden="true"><path class="hx-ring" d="M50 6L88 28V72L50 94L12 72V28Z"/><path class="hx-in" d="M50 22L74 36V64L50 78L26 64V36Z"/>${P.map(([x,y],i)=>{const f=fills&&fills[i];return`<circle class="hx-d${i===cur?' cur':''}${f!=null?' on':''}" cx="${x}" cy="${y}" r="${i===cur?8:7}"${f!=null?` style="fill:${COLORS[f]}"`:''}/>`}).join('')}</svg>`};
const topicChip=p=>{const t=C.topic(p);return`<span class="topic t-${t}">${TOPIC_EMO[t]||''} ${esc(C.TOPICS[t]||'Science')}</span>`};
function countdown(){const n=new Date();n.setHours(24,0,0,0);const s=Math.max(0,Math.round((n-Date.now())/1000));return`${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor(s/60)%60).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`}
async function override(k){if(k in G.over)return G.over[k];const d=await fget('bondle/'+k,3500);if(d===null)return null;G.over[k]=d&&Array.isArray(d.rounds)&&d.rounds.length?d:false;return G.over[k]}
const game=()=>$('#game');

/* ---------- screens ---------- */
function meta(){const k=todayKey();$('#meta').innerHTML=`<b>Bondle #${C.keyToIndex(k)+1}</b> · ${esc(fmtDay(k))} · next puzzle in <span id="cd">${countdown()}</span>`}
async function intro(){
  const k=todayKey(),s=store(),idx=C.keyToIndex(k),ov=await override(k),y=s.days[dayKey(Date.now()-DAY)];
  const day=C.daily(BANK,idx,ov||null),topics=[...new Set(day.rounds.map(C.topic))];
  const streak=s.last===dayKey(Date.now()-DAY)||s.last===k?s.streak:0;
  game().innerHTML=`<div class="intro">
   <div class="kick">Bondle #${idx+1}</div>
   <h2 class="big">Six rounds. Find the rarest answer.</h2>
   ${ov&&ov.theme?`<div class="theme">${esc(String(ov.theme).slice(0,80))}</div>`:''}
   <p class="today">Today: ${topics.map(t=>`<span class="topic t-${t}">${TOPIC_EMO[t]} ${esc(C.TOPICS[t])}</span>`).join(' ')}</p>
   <ul class="tiers compact">${tierList()}</ul>
   <div class="go"><button class="btn primary huge" data-go="start">Play today’s Bondle</button><label class="chk"><input type="checkbox" data-extra${limit()===60?' checked':''}> Extra time (60 s)</label></div>
   ${s.played?`<div class="mini"><span><b>${streak}</b> day streak</span><span><b>${s.played}</b> played</span><span><b>${s.best}</b> best</span>${y&&y.done&&!y.past?`<span>Yesterday <b>${y.tot}</b> ${esc(emo(y))}</span>`:''}</div>`:''}
   <p class="fine">One go per day. The clock keeps running if you leave the page mid-round.</p></div>`;
}
const tierList=()=>C.TIERS.slice(1).map(T=>`<li style="--c:${COLORS[T.n]}"><i aria-hidden="true">${T.emo}</i><b>${esc(T.name)}</b><small>${T.pts} kJ/mol</small></li>`).join('');
async function begin(kind,k){
  clearInterval(G.timer);
  if(kind==='practice'){const rounds=C.practice(BANK,(Date.now()^Math.floor(Math.random()*1e9))>>>0,k||'mix');
    G.run={rec:{ids:rounds.map(p=>p.id),r:[],tot:0,done:false,began:Date.now()},mode:'practice',kind:k||'mix',k:'practice',num:0,rounds};return round()}
  k=k||todayKey();const s=store(),past=k!==todayKey();
  if(s.days[k]){G.run=mk(s.days[k],k);return s.days[k].done?results():round()}
  const ov=await override(k),day=C.daily(BANK,C.keyToIndex(k),ov||null),ids=new Set(BANK.map(p=>p.id));
  const rec={ids:day.rounds.map(p=>p.id),custom:day.rounds.filter(p=>!ids.has(p.id)).map(p=>({id:p.id,lv:p.lv,t:p.t,q:p.q,h:p.h||'',f:p.f||'',a:p.a})),theme:day.theme||'',r:[],x:[],tot:0,done:false,began:Date.now()};
  if(past)rec.past=true;s.days[k]=rec;save(s);G.run=mk(rec,k);round();
}
const mk=(rec,k)=>({rec,mode:rec.past?'past':'daily',k,num:C.keyToIndex(k)+1,rounds:roundsFor(rec)});
function persist(){const R=G.run;if(!R||R.mode==='practice')return;const s=store();s.days[R.k]=R.rec;save(s)}
const label=R=>R.mode==='practice'?`Practice · ${({chem:'Chemistry only',sci:'No chemistry',mix:'General science'})[R.kind]}`:R.mode==='past'?`Bondle #${R.num} · past puzzle`:`Bondle #${R.num}`;
function head(R,i,cur){return`<div class="rtop">${hex('prog',R.rec.r.map(r=>r.t),cur)}<div><div class="kick">${esc(label(R))} · Round ${i+1} of ${R.rounds.length}</div><div class="run"><b>${R.rec.tot}</b> kJ/mol</div></div><button class="quit" data-go="leave" aria-label="Leave this puzzle" title="Leave">×</button></div>`}
function round(){
  const R=G.run,rec=R.rec,i=rec.r.length;clearInterval(G.timer);
  if(i>=R.rounds.length)return finish();
  const p=R.rounds[i],lim=limit();
  if(rec.sti!==i||!rec.st){rec.st=Date.now();rec.sti=i;rec.tries=2;rec.lim=lim;persist()}
  game().innerHTML=`<div class="round">${head(R,i,i)}
   ${topicChip(p)}<h2 class="q" id="q">${esc(p.q)}</h2>${p.h?`<p class="hint">${esc(p.h)}</p>`:''}
   <div class="timer" role="timer" aria-label="Time left"><i id="bar"></i><span id="sec"></span></div>
   <form class="answer" id="form" autocomplete="off"><input id="in" type="text" maxlength="80" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go" aria-labelledby="q" placeholder="Type your answer"><button class="btn primary" type="submit">Bond</button></form>
   <div class="tries" id="tries">${rec.tries===2?'Two tries. Go rare, or play it safe.':'One try left.'}</div><div class="msg" id="msg" aria-live="polite"></div></div>`;
  const inp=$('#in');setTimeout(()=>inp.focus({preventScroll:true}),30);
  if(isMob())game().scrollIntoView({block:'start',behavior:'smooth'});
  const tick=()=>{const L=(rec.lim||lim)*1000,left=Math.max(0,L-(Date.now()-rec.st)),bar=$('#bar');if(!bar){clearInterval(G.timer);return}
    bar.style.width=(100*left/L)+'%';bar.classList.toggle('low',left<8000);$('#sec').textContent=Math.ceil(left/1000)+' s';if(left<=0){clearInterval(G.timer);resolve(null,inp.value.trim(),'time')}};
  tick();G.timer=setInterval(tick,100);
}
function guess(){
  const R=G.run;if(!R)return;const rec=R.rec,p=R.rounds[rec.r.length],inp=$('#in');if(!p||!inp)return;const v=inp.value.trim();
  const shake=()=>{inp.classList.remove('shake');void inp.offsetWidth;inp.classList.add('shake')};
  if(!v)return shake();
  const m=C.match(p,v);if(m)return resolve(m,v);
  if(R.mode==='daily'&&rec.x&&rec.x.length<12)rec.x.push(p.id+'|'+v.slice(0,60));
  rec.tries=(rec.tries||2)-1;persist();
  if(rec.tries>0){shake();inp.select();$('#msg').innerHTML=`<span class="miss">“${esc(v.slice(0,40))}” isn’t on our list. One more try.</span>`;$('#tries').textContent='One try left.';return}
  resolve(null,v);
}
function resolve(m,v,why){
  clearInterval(G.timer);const R=G.run,rec=R.rec,i=rec.r.length,p=R.rounds[i],T=C.TIERS[m?m.tier:0];
  rec.r.push({q:p.id,a:String(v||'').slice(0,60),m:m?m.name:'',t:m?m.tier:0,p:T.pts});rec.tot+=T.pts;rec.st=null;persist();
  const rarer=C.parse(p).filter(a=>a.tier>(m?m.tier:0)&&a.tier>=4).sort((a,b)=>b.tier-a.tier||Math.random()-.5).slice(0,3),last=rec.r.length>=R.rounds.length;
  game().innerHTML=`<div class="round after">${head(R,i,-1)}${topicChip(p)}<h2 class="q sm">${esc(p.q)}</h2>
   <div class="verdict t${T.n}" style="--c:${COLORS[T.n]}"><span class="ve" aria-hidden="true">${T.emo}</span><div><div class="vt">${m?esc(T.name):why==='time'?'Time’s up':'No bond'}</div><div class="vs">${m?`<b>${esc(m.name)}</b>${C.norm(m.name)!==C.norm(v)?` <small>(you typed “${esc(v.slice(0,40))}”)</small>`:''}`:v?`“${esc(v.slice(0,40))}” isn’t on our list`:'No answer'}</div></div><span class="vp">+${T.pts}</span></div>
   ${rarer.length?`<p class="deeper">${m&&m.tier===5?'Also one in a mole:':'Deeper cuts:'} ${rarer.map(a=>`<b>${esc(a.name)}</b>`).join(', ')}</p>`:m&&m.tier===5?'<p class="deeper">That’s as rare as it gets. ⚛️</p>':''}
   ${p.f?`<p class="fact">${esc(p.f)}</p>`:''}
   <button class="btn primary huge" data-go="next" id="next">${last?'See my results':'Next round'} →</button></div>`;
  setTimeout(()=>{const n=$('#next');if(n)n.focus({preventScroll:true})},30);
  if(m&&m.tier===5)burst();
}
function burst(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const g=game();
  for(let i=0;i<24;i++){const s=document.createElement('span');s.className='p';s.textContent=['⬡','⚛','✦','⬢'][i%4];const a=Math.random()*Math.PI*2,d=90+Math.random()*160;
    s.style.cssText=`--x:${Math.cos(a)*d}px;--y:${Math.sin(a)*d-40}px;--r:${Math.random()*360}deg;color:${COLORS[1+(i%5)]};animation-delay:${Math.random()*80}ms`;g.appendChild(s);setTimeout(()=>s.remove(),1300)}}
function finish(){
  const R=G.run,rec=R.rec;if(rec.done)return results();rec.done=true;rec.end=Date.now();
  if(R.mode==='daily'){const s=store(),y=dayKey(Date.now()-DAY);s.days[R.k]=rec;s.played++;s.sum+=rec.tot;s.best=Math.max(s.best,rec.tot);
    s.streak=(s.last===y?s.streak:0)+1;s.last=R.k;s.maxStreak=Math.max(s.maxStreak||0,s.streak);const b=Math.min(6,Math.floor(rec.tot/100));s.hist[b]=(s.hist[b]||0)+1;save(s);
    if(statsOn())report(R).catch(()=>{})}
  else persist();
  results();days();
}
async function report(R){
  const rec=R.rec,doc={d:R.k,n:R.num,v:vid(),tot:rec.tot,r:rec.r.map(r=>({q:String(r.q).slice(0,40),a:r.a.slice(0,60),t:r.t})),x:(rec.x||[]).slice(0,12),ms:Math.max(0,(rec.end||Date.now())-(rec.began||Date.now())),t:Date.now()};
  try{await req('PATCH','/bondlePlays/'+R.k+'_'+doc.v+'?currentDocument.exists=false',{fields:enc(doc).mapValue.fields})}catch(e){return}
  try{await fetch(`https://firestore.googleapis.com/v1/projects/${CFG.projectId}/databases/(default)/documents:commit?key=${encodeURIComponent(CFG.apiKey)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({writes:[{update:{name:`projects/${CFG.projectId}/databases/(default)/documents/bondleDay/${R.k}`,fields:{}},updateMask:{fieldPaths:[]},updateTransforms:[{fieldPath:'b'+Math.min(6,Math.floor(rec.tot/100)),increment:{integerValue:'1'}}]}]})})}catch(e){}
}
function shareText(R){const rec=R.rec,b=C.bondFor(rec.tot);
  const line=rec.tot>=600?'Perfect bond! 6 × One in a Mole':rec.tot===0?'Inert as a noble gas':`Stronger than ${b[2]} (${b[0]})`;
  return`Bondle #${R.num} · ${rec.tot} kJ/mol${R.mode==='past'?' (late)':''}\n${emo(rec)}\n${line}\nbondline.site/bondle`}
async function share(){const R=G.run;if(!R)return;const txt=shareText(R);
  try{if(navigator.share&&isMob()){await navigator.share({text:txt});return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(txt);toast('Copied! Paste it anywhere to share.')}catch(e){prompt('Copy your result:',txt)}}
function results(){
  const R=G.run,rec=R.rec,s=store();clearInterval(G.timer);const b=C.bondFor(rec.tot);
  const bond=rec.tot>=600?'A perfect bond. Six answers, all One in a Mole.':rec.tot===0?'Inert as a noble gas. Tomorrow’s another reaction.':`Stronger than ${esc(b[2])} (${esc(b[1])}, ${b[0]} kJ/mol).`;
  const row=(r,i)=>{const p=R.rounds[i];if(!p)return'';const T=C.TIERS[r.t],all=C.parse(p),groups=[5,4,3,2,1].map(t=>({t,a:all.filter(a=>a.tier===t)})).filter(g=>g.a.length);
    return`<li class="rr"><div class="rrh"><span class="rre" style="--c:${COLORS[r.t]}">${T.emo}</span><div class="rrq"><b>${esc(p.q)}</b><small>${r.m?`${esc(r.m)} · ${esc(T.name)}`:r.a?`“${esc(r.a)}” · not on the list`:'No answer'}</small></div><span class="rrp">${r.p}</span></div>
     <details><summary>All ${all.length} answers</summary>${groups.map(g=>`<div class="ag"><span class="agt" style="--c:${COLORS[g.t]}">${C.TIERS[g.t].emo} ${esc(C.TIERS[g.t].name)}</span><span class="agl">${g.a.map(a=>esc(a.name)).join(' · ')}</span></div>`).join('')}</details></li>`};
  const isDaily=R.mode==='daily';
  game().innerHTML=`<div class="res">
   <div class="kick">${esc(label(R))}${R.mode!=='practice'?' · '+esc(fmtDay(R.k)):''}</div>
   <div class="score">${hex('bighex',rec.r.map(r=>r.t),-1)}<div class="total"><b>${rec.tot}</b><span>kJ/mol</span></div></div>
   <p class="bond">${bond}</p><div class="emo" aria-label="Your rounds">${emo(rec)}</div>
   <div class="acts">${R.mode==='practice'?`<button class="btn primary" data-practice="${R.kind}">Another practice round</button>`:`<button class="btn primary" data-go="share">Share</button>`}${s.days[todayKey()]?'':'<button class="btn" data-go="today">Play today’s Bondle</button>'}${R.mode!=='practice'?'<button class="btn" data-practice="mix">Practice round</button>':''}</div>
   ${isDaily?`<p class="pct" id="pct"></p><div class="stats4">${stat4(s)}</div><div class="next">Next Bondle in <b id="cd2">${countdown()}</b></div>`:''}
   <h3 class="rh">Your rounds</h3><ol class="rl">${rec.r.map(row).join('')}</ol>
   ${R.mode!=='practice'?'<p class="fine">Think an answer should have counted? <button class="link" data-go="suggest">Suggest an answer we missed</button></p>':''}</div>`;
  if(isDaily)percentile(R);
}
const stat4=s=>{const avg=s.played?Math.round(s.sum/s.played):0,streak=s.last===todayKey()||s.last===dayKey(Date.now()-DAY)?s.streak:0;return`<div><b>${s.played}</b><span>Played</span></div><div><b>${streak}</b><span>Streak</span></div><div><b>${s.maxStreak||0}</b><span>Best streak</span></div><div><b>${avg}</b><span>Average</span></div>`};
async function percentile(R){if(!statsOn())return;let d=null;
  for(let i=0;i<2;i++){d=await fget('bondleDay/'+R.k,4000);if(d&&Object.keys(d).length)break;await new Promise(r=>setTimeout(r,1500))}
  const el=$('#pct');if(!el||!d)return;const b=[0,1,2,3,4,5,6].map(i=>+d['b'+i]||0),n=b.reduce((a,x)=>a+x,0);if(!n)return;
  const me=Math.min(6,Math.floor(R.rec.tot/100)),below=b.slice(0,me).reduce((a,x)=>a+x,0),same=Math.max(0,b[me]-1);
  el.innerHTML=n<=1?'You’re the first to finish today’s Bondle! 🥇':`You beat about <b>${Math.round(100*(below+same/2)/Math.max(1,n-1))}%</b> of today’s ${n} players`}

/* ---------- side panels and dialogs ---------- */
function days(){
  const s=store(),out=[];
  for(let i=1;i<=7;i++){const k=dayKey(Date.now()-i*DAY),idx=C.keyToIndex(k);if(idx<0)break;const r=s.days[k];
    out.push(`<li><span class="dn">#${idx+1}</span><span class="dd">${esc(shortDay(k))}</span>${r&&r.done?`<span class="ds"><b>${r.tot}</b> ${esc(emo(r))}</span><button class="link" data-past="${k}">Review</button>`:r?`<span class="ds">In progress</span><button class="link" data-past="${k}">Continue</button>`:`<span class="ds muted">Not played</span><button class="btn small" data-past="${k}">Play</button>`}</li>`)}
  $('#days').innerHTML=out.join('')||'<li class="note">Past puzzles appear here from tomorrow.</li>';
  if(!out.length)$('#past').classList.add('empty');
}
function statsDialog(){const s=store(),max=Math.max(1,...s.hist);
  $('#statsBody').innerHTML=s.played?`<div class="stats4">${stat4(s)}</div><h3 class="rh c">Your scores</h3><div class="dist">${s.hist.map((n,i)=>`<div class="drow"><span>${i*100}${i<6?'+':''}</span><i style="--w:${Math.max(n?6:0,100*n/max)}%"></i><b>${n}</b></div>`).join('')}</div><p class="fine">Best score: <b>${s.best}</b> kJ/mol. Stats are kept in this browser.</p>`:'<p>Play your first Bondle to start your stats.</p>';
  $('#stats').showModal()}
function suggestDialog(){const R=G.run;$('#sugQ').innerHTML=(R?R.rounds:[]).map(p=>`<option value="${esc(p.id)}">${esc(p.q)}</option>`).join('')+'<option value="">Something else</option>';
  $('#sugA').value='';$('#sugErr').hidden=true;$('#sugForm').hidden=false;$('#sugThx').hidden=true;$('#suggest').showModal();setTimeout(()=>$('#sugA').focus(),40)}
$('#sugForm').addEventListener('submit',async e=>{e.preventDefault();const R=G.run,msg=$('#sugA').value.trim(),email=$('#sugE').value.trim(),q=$('#sugQ').selectedOptions[0];
  if(msg.length<2)return;if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){$('#sugErr').textContent='That email doesn’t look right.';$('#sugErr').hidden=false;return}
  const doc={k:'bondle',m:(`Bondle #${R?R.num:''}, “${q?q.textContent:''}”: `+msg).slice(0,2000),t:Date.now(),st:'new',v:vid(),ver:'22',p:'Bondle page'};if(email)doc.e=email;
  $('#sugSend').disabled=true;try{await req('POST','/feedback',{fields:enc(doc).mapValue.fields});$('#sugForm').hidden=true;$('#sugThx').hidden=false}catch(x){$('#sugErr').innerHTML='That didn’t send. Try again, or email <a href="mailto:bondlinenotes@gmail.com">bondlinenotes@gmail.com</a>.';$('#sugErr').hidden=false}
  $('#sugSend').disabled=false});

/* ---------- events ---------- */
document.addEventListener('click',e=>{
  const go=e.target.closest('[data-go]');
  if(go){const a=go.dataset.go;({start:()=>begin('daily'),next:round,share,suggest:suggestDialog,today:()=>{G.run=null;start()},leave:()=>{if(G.run&&G.run.mode==='practice'){G.run=null;clearInterval(G.timer);start();return}clearInterval(G.timer);G.run=null;start()}}[a]||(()=>{}))();return}
  const pr=e.target.closest('[data-practice]');if(pr){begin('practice',pr.dataset.practice);game().scrollIntoView({behavior:'smooth',block:'start'});return}
  const pa=e.target.closest('[data-past]');if(pa){begin('past',pa.dataset.past);game().scrollIntoView({behavior:'smooth',block:'start'});return}
  const op=e.target.closest('[data-open]');if(op){op.dataset.open==='stats'?statsDialog():$('#'+op.dataset.open).showModal()}
  if(e.target.matches('dialog.dlg'))e.target.close();
});
document.addEventListener('submit',e=>{if(e.target.id==='form'){e.preventDefault();guess()}});
document.addEventListener('change',e=>{if(e.target.matches('[data-extra],#extra')){const on=e.target.checked;ls.rawSet('bondline.bondleTime',on?'60':'30');$$('[data-extra],#extra').forEach(x=>x.checked=on)}});

/* ---------- start ---------- */
function start(){
  const k=todayKey(),s=store(),rec=s.days[k];
  if(rec&&rec.done){G.run=mk(rec,k);results()}else if(rec){G.run=mk(rec,k);round()}else intro();
}
function boot(){
  if(!C||!BANK.length){game().innerHTML='<p class="ns">Bondle couldn’t load. Refresh the page to try again.</p>';return}
  $('#tiers').innerHTML=tierList();$('#tiers2').innerHTML=tierList();$('#extra').checked=limit()===60;
  meta();setInterval(()=>{const c=$('#cd'),c2=$('#cd2');if(c)c.textContent=countdown();if(c2)c2.textContent=countdown();
    if(G.day&&G.day!==todayKey()){G.day=todayKey();meta();if(!G.run||G.run.mode!=='practice'){G.run=null;start()}days()}},1000);G.day=todayKey();
  const q=new URLSearchParams(location.search);
  if(q.has('practice'))begin('practice',['chem','sci','mix'].includes(q.get('practice'))?q.get('practice'):'mix');else start();
  days();
  if(!ls.raw('bondline.bondleSeen')){ls.rawSet('bondline.bondleSeen','1');if(!store().played)setTimeout(()=>{try{$('#help').showModal()}catch(e){}},500)}
  if(/[?&]bltest\b/.test(location.search))window.__bondle={G,begin,start,store};
}
boot();
})();
