// Bondline admin dashboard. Reads usage records, feedback and Bondle results from Firestore.
// Only accounts with a document at admins/{their user id} can read any of it (see firestore.rules).
(function(){'use strict';
// "admin" in the username box signs in with this email. Change it if your admin login uses another address.
const ADMIN_LOGINS={admin:'bondlinenotes@gmail.com'};

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtN=n=>(n||0).toLocaleString();
const DAY=864e5;
const dayKey=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const ago=t=>{if(!t)return'–';const s=Math.round((Date.now()-t)/1000);if(s<60)return'just now';if(s<3600)return Math.round(s/60)+' min ago';if(s<86400)return Math.round(s/3600)+' h ago';if(s<86400*30)return Math.round(s/86400)+' d ago';return new Date(t).toLocaleDateString()};
const when=t=>t?new Date(t).toLocaleString([], {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'–';
const shortDate=t=>t?new Date(t).toLocaleDateString([], {day:'numeric',month:'short',year:'2-digit'}):'–';
function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2600)}

firebase.initializeApp(window.BONDLINE_FIREBASE);
const auth=firebase.auth(),db=firebase.firestore();
const S={tab:'overview',range:7,cache:{},user:null};

/* ---------- sign-in ---------- */
function show(id){for(const x of['login','denied','app'])$('#'+x).hidden=x!==id}
auth.onAuthStateChanged(async u=>{
  S.user=u;S.cache={};
  if(!u){show('login');setTimeout(()=>$('#pass').focus(),50);return}
  let ok=false;try{ok=(await db.doc('admins/'+u.uid).get()).exists}catch(e){ok=false}
  if(!ok){$('#deniedWho').textContent=u.email||u.uid;$('#deniedUid').textContent=u.uid;show('denied');return}
  try{localStorage.setItem('bondline.admin','1');localStorage.setItem('bondline.notrack','1')}catch(e){}
  show('app');render();
});
$('#loginForm').addEventListener('submit',async e=>{
  e.preventDefault();const raw=$('#user').value.trim(),email=ADMIN_LOGINS[raw.toLowerCase()]||raw,pass=$('#pass').value,err=$('#loginErr'),b=$('#loginBtn');
  err.hidden=true;b.disabled=true;b.textContent='Signing in…';
  try{await auth.signInWithEmailAndPassword(email,pass)}
  catch(x){const c=x&&x.code||'';err.textContent=/too-many/.test(c)?'Too many attempts. Wait a few minutes and try again.':/network/.test(c)?'No connection. Check your internet and try again.':'That username and password don’t match an account.';err.hidden=false}
  b.disabled=false;b.textContent='Sign in';
});
$('#googleBtn').addEventListener('click',async()=>{try{await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())}catch(x){if(x&&x.code!=='auth/popup-closed-by-user'){$('#loginErr').textContent='Google sign-in didn’t work: '+(x.message||x.code);$('#loginErr').hidden=false}}});
$('#deniedOut').addEventListener('click',()=>auth.signOut());
$('#copyUid').addEventListener('click',()=>{navigator.clipboard.writeText($('#deniedUid').textContent).then(()=>toast('Copied'))});
$('#signOut').addEventListener('click',()=>{try{localStorage.removeItem('bondline.admin')}catch(e){}auth.signOut()});
$('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]');if(!b)return;S.tab=b.dataset.tab;$$('#tabs [data-tab]').forEach(x=>x.classList.toggle('on',x===b));render()});
$('#range').addEventListener('change',()=>{S.range=+$('#range').value;delete S.cache.visits;render()});
$('#refresh').addEventListener('click',()=>{S.cache={};render();toast('Reloaded')});

/* ---------- data ---------- */
const docs=q=>q.get().then(s=>s.docs.map(d=>Object.assign({_id:d.id},d.data())));
async function get(k,fn){if(!S.cache[k])S.cache[k]=fn().catch(e=>{delete S.cache[k];throw e});return S.cache[k]}
const since=()=>{const d=new Date();d.setHours(0,0,0,0);return d.getTime()-(S.range-1)*DAY};
const getVisits=()=>get('visits',()=>docs(db.collection('visits').where('t','>=',since()).orderBy('t','desc').limit(10000)));
const getDevices=()=>get('devices',()=>docs(db.collection('devices').orderBy('last','desc').limit(5000)));
const getFeedback=()=>get('feedback',()=>docs(db.collection('feedback').orderBy('t','desc').limit(500)));
const getAnn=()=>get('ann',()=>db.doc('config/announcement').get().then(d=>d.exists?d.data():null));
const getWait=()=>get('wait',()=>Promise.all([docs(db.collection('waitlist')).catch(()=>[]),docs(db.collection('entitlements')).catch(()=>[])]));

/* ---------- labels ---------- */
const TZ_COUNTRY={'Asia/Kuala_Lumpur':'Malaysia','Asia/Kuching':'Malaysia','Asia/Singapore':'Singapore','Asia/Jakarta':'Indonesia','Asia/Makassar':'Indonesia','Asia/Pontianak':'Indonesia','Asia/Jayapura':'Indonesia','Asia/Bangkok':'Thailand','Asia/Manila':'Philippines','Asia/Ho_Chi_Minh':'Vietnam','Asia/Saigon':'Vietnam','Asia/Brunei':'Brunei','Asia/Kolkata':'India','Asia/Calcutta':'India','Asia/Karachi':'Pakistan','Asia/Dhaka':'Bangladesh','Asia/Colombo':'Sri Lanka','Asia/Kathmandu':'Nepal','Asia/Shanghai':'China','Asia/Hong_Kong':'Hong Kong','Asia/Taipei':'Taiwan','Asia/Tokyo':'Japan','Asia/Seoul':'South Korea','Asia/Dubai':'UAE','Asia/Riyadh':'Saudi Arabia','Asia/Qatar':'Qatar','Asia/Tehran':'Iran','Asia/Jerusalem':'Israel','Asia/Yangon':'Myanmar','Asia/Phnom_Penh':'Cambodia','Europe/London':'United Kingdom','Europe/Dublin':'Ireland','Europe/Paris':'France','Europe/Berlin':'Germany','Europe/Madrid':'Spain','Europe/Rome':'Italy','Europe/Amsterdam':'Netherlands','Europe/Brussels':'Belgium','Europe/Zurich':'Switzerland','Europe/Vienna':'Austria','Europe/Stockholm':'Sweden','Europe/Oslo':'Norway','Europe/Copenhagen':'Denmark','Europe/Helsinki':'Finland','Europe/Warsaw':'Poland','Europe/Prague':'Czechia','Europe/Lisbon':'Portugal','Europe/Athens':'Greece','Europe/Istanbul':'Türkiye','Europe/Moscow':'Russia','Europe/Kiev':'Ukraine','Europe/Kyiv':'Ukraine','Europe/Bucharest':'Romania','Africa/Lagos':'Nigeria','Africa/Cairo':'Egypt','Africa/Johannesburg':'South Africa','Africa/Nairobi':'Kenya','Africa/Accra':'Ghana','Australia/Sydney':'Australia','Australia/Melbourne':'Australia','Australia/Brisbane':'Australia','Australia/Perth':'Australia','Australia/Adelaide':'Australia','Pacific/Auckland':'New Zealand','America/Toronto':'Canada','America/Vancouver':'Canada','America/Edmonton':'Canada','America/Winnipeg':'Canada','America/Halifax':'Canada','America/Mexico_City':'Mexico','America/Sao_Paulo':'Brazil','America/Argentina/Buenos_Aires':'Argentina','America/Bogota':'Colombia','America/Lima':'Peru','America/Santiago':'Chile'};
const country=tz=>!tz?'Unknown':TZ_COUNTRY[tz]||(/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Indiana|Kentucky|Boise)/.test(tz)||tz==='Pacific/Honolulu'?'United States':tz.replace(/_/g,' '));
const SRC_NAMES={instagram:'Instagram',tiktok:'TikTok',youtube:'YouTube',search:'Search engine',friend:'Friend or classmate',teacher:'Teacher or lecturer',reddit:'Reddit',other:'Somewhere else'};
function refName(h){if(!h)return'';h=h.toLowerCase();
  const R=[[/(^|\.)google\./,'Google'],[/instagram/,'Instagram'],[/facebook|fb\.com|m\.me/,'Facebook'],[/tiktok/,'TikTok'],[/youtube|youtu\.be/,'YouTube'],[/reddit/,'Reddit'],[/^t\.co$|twitter|x\.com/,'X (Twitter)'],[/bing\./,'Bing'],[/duckduckgo/,'DuckDuckGo'],[/yahoo/,'Yahoo'],[/chatgpt|openai/,'ChatGPT'],[/perplexity/,'Perplexity'],[/claude\.ai/,'Claude'],[/linkedin|lnkd/,'LinkedIn'],[/whatsapp|wa\.me/,'WhatsApp'],[/telegram|t\.me/,'Telegram'],[/discord/,'Discord'],[/netlify\.app$/,'bondline.netlify.app']];
  for(const [r,n] of R)if(r.test(h))return n;return h}
function visitSource(v){if(v.u)return(SRC_NAMES[v.u]||v.u.charAt(0).toUpperCase()+v.u.slice(1))+' (link)';const r=refName(v.r);return r||'Direct or app'}
const FEAT={home:'Home',notes:'Notes',cards:'Flashcards',naming:'Naming',spectra:'Spectra',orbitals:'Orbitals',synth:'Synthesis',classes:'Classes',progress:'Progress',stereo:'Stereo',course:'IChO course',guide:'Guide',bondle:'Bondle',present:'Lecture mode',pptx:'PowerPoint export',pro:'Pro window',newnote:'New note',
  'menu:predict':'Reaction predictor','menu:rxn':'Reaction library','menu:prac':'Mechanism practice','menu:gloss':'Glossary','menu:ref':'Quick reference','menu:cmd':'Command palette','menu:new':'What’s new','menu:tour':'Tour','menu:guide':'Guide','menu:trash':'Trash','menu:settings':'Settings','menu:signin':'Sign in'};
const featName=k=>FEAT[k]||k;
function eventText(k){const [a,b]=String(k).split(':');
  return a==='open'?(b==='app'?'Opened the installed app':'Opened the app'):a==='bondle'?(b==='start'?'Started today’s Bondle':b==='practice'?'Played a Bondle practice round':b==='share'?'Shared a Bondle result':`Finished Bondle: ${b} kJ/mol`):a==='feedback'?`Sent feedback (${b})`:a==='heard'?(b==='skip'?'Skipped “how did you find us”':`Found Bondline via ${SRC_NAMES[b]||b}`):a==='ann'?'Clicked the announcement':k}
const CHART_COLORS=['var(--c1)','var(--c2)','var(--c3)','var(--c4)','var(--c5)','var(--c6)'];
function bars(rows,opt){opt=opt||{};if(!rows.length)return'<div class="empty">Nothing yet.</div>';const max=Math.max(...rows.map(r=>r[1]),1),tot=rows.reduce((a,r)=>a+r[1],0);
  return`<div class="bars">${rows.slice(0,opt.limit||10).map(([l,n],i)=>`<div class="bar" title="${esc(l)}: ${n}"><span class="l">${esc(l)}</span><span class="t"><i style="width:${100*n/max}%;${opt.color?`background:${CHART_COLORS[i%6]}`:''}"></i></span><span class="n">${opt.pct?Math.round(100*n/tot)+'%':fmtN(n)}</span></div>`).join('')}</div>`}
function count(arr,fn){const m=new Map();for(const x of arr){const k=fn(x);if(k==null||k==='')continue;m.set(k,(m.get(k)||0)+1)}return[...m].sort((a,b)=>b[1]-a[1])}
function uniqCount(arr,keyFn,idFn){const m=new Map();for(const x of arr){const k=keyFn(x);if(k==null)continue;if(!m.has(k))m.set(k,new Set());m.get(k).add(idFn(x))}return[...m].map(([k,s])=>[k,s.size]).sort((a,b)=>b[1]-a[1])}

/* ---------- render ---------- */
async function render(){
  const view=$('#view'),v=document.createElement('div');view.innerHTML='';view.appendChild(v);v.innerHTML='<div class="loading">Loading…</div>';
  $('#range').hidden=!['overview','activity'].includes(S.tab);
  try{await({overview:rOverview,users:rUsers,activity:rActivity,feedback:rFeedback,bondle:rBondle,announce:rAnnounce,teachers:rTeachers}[S.tab])(v)}
  catch(e){console.error(e);v.innerHTML=`<div class="card"><h2 class="sec">Couldn’t load this</h2><p>${esc(e.message||e)}</p><p class="fine">If it says “Missing or insufficient permissions”, publish the new <code>firestore.rules</code> in the Firebase console. If it mentions an index, open the link in the browser console to create it.</p></div>`}
  getFeedback().then(f=>{const n=f.filter(x=>x.st==='new').length,b=$('#fbBadge');b.hidden=!n;b.textContent=n}).catch(()=>{});
  getTeachers().then(([t])=>{const n=t.filter(x=>x.st==='pending').length,b=$('#tBadge');if(b){b.hidden=!n;b.textContent=n}}).catch(()=>{});
}

function dailySeries(visits){
  const days=[],start=since();
  if(S.range===1){for(let h=0;h<24;h++)days.push({k:h,l:h%6===0?String(h).padStart(2,'0')+':00':'',v:0,u:new Set()});for(const x of visits){const h=new Date(x.t).getHours();days[h].v++;days[h].u.add(x.v)}}
  else{for(let i=0;i<S.range;i++){const t=start+i*DAY,k=dayKey(t);days.push({k,l:new Date(t).toLocaleDateString([], {day:'numeric',month:'short'}),v:0,u:new Set()})}
    const ix=new Map(days.map((d,i)=>[d.k,i]));for(const x of visits){const i=ix.get(x.d||dayKey(x.t));if(i!=null){days[i].v++;days[i].u.add(x.v)}}}
  return days.map(d=>({l:d.l,v:d.v,u:d.u.size}));
}
function chart(series){
  const W=760,H=220,P={l:34,r:8,t:10,b:26},n=series.length,max=Math.max(4,...series.map(s=>s.v)),bw=(W-P.l-P.r)/n;
  const y=v=>P.t+(H-P.t-P.b)*(1-v/max),ticks=[0,Math.round(max/2),max];
  const every=Math.ceil(n/10);
  return`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Page views and visitors over time">
   ${ticks.map(t=>`<line class="ax" x1="${P.l}" x2="${W-P.r}" y1="${y(t)}" y2="${y(t)}"/><text x="${P.l-6}" y="${y(t)+3.5}" text-anchor="end">${t}</text>`).join('')}
   ${series.map((s,i)=>`<rect x="${P.l+i*bw+bw*.18}" y="${y(s.v)}" width="${bw*.64}" height="${Math.max(0,H-P.b-y(s.v))}" rx="3" fill="var(--c1)" opacity=".85"><title>${esc(s.l)}: ${s.v} views, ${s.u} visitors</title></rect>`).join('')}
   <polyline fill="none" stroke="var(--c3)" stroke-width="2.5" stroke-linejoin="round" points="${series.map((s,i)=>`${P.l+i*bw+bw/2},${y(s.u)}`).join(' ')}"/>
   ${series.map((s,i)=>`<circle cx="${P.l+i*bw+bw/2}" cy="${y(s.u)}" r="2.8" fill="var(--c3)"/>`).join('')}
   ${series.map((s,i)=>(S.range===1?s.l:(i%every===0?s.l:''))?`<text x="${P.l+i*bw+bw/2}" y="${H-8}" text-anchor="middle">${esc(s.l)}</text>`:'').join('')}
  </svg><div class="legend"><span><i style="background:var(--c1)"></i>Page views</span><span><i style="background:var(--c3)"></i>Unique visitors</span></div>`;
}

async function rOverview(v){
  const [visits,devices]=await Promise.all([getVisits(),getDevices()]),from=since();
  const today=dayKey(Date.now());
  const bday=await get('bday:'+today,()=>db.doc('bondleDay/'+today).get().then(d=>d.exists?d.data():{})).catch(()=>({}));
  const fb=await getFeedback().catch(()=>[]);
  const vis=new Set(visits.map(x=>x.v)),newV=new Set(visits.filter(x=>x.n).map(x=>x.v)),sess=new Set(visits.map(x=>x.s));
  const act=devices.filter(d=>d.last>=from),users=new Set(act.filter(d=>d.uid).map(d=>d.uid)),allUsers=new Set(devices.filter(d=>d.uid).map(d=>d.uid));
  const newUsers=new Set();{const firstBy=new Map();for(const d of devices)if(d.uid)firstBy.set(d.uid,Math.min(firstBy.get(d.uid)||Infinity,d.first||Infinity));for(const [u,f] of firstBy)if(f>=from)newUsers.add(u)}
  const bplays=Object.values(bday||{}).reduce((a,x)=>a+(+x||0),0);
  // Sources: the first page view of each session.
  const firstOfSess=new Map();for(const x of visits){const p=firstOfSess.get(x.s);if(!p||x.t<p.t)firstOfSess.set(x.s,x)}
  const sessions=[...firstOfSess.values()];
  const feats=new Map();for(const d of act)for(const [k,n] of Object.entries(d.feat||{}))feats.set(k,(feats.get(k)||0)+n);
  const heard=count(devices.filter(d=>d.src&&d.src!=='skip'),d=>SRC_NAMES[d.src]||d.src),skipped=devices.filter(d=>d.src==='skip').length;
  const rangeLabel=$('#range').selectedOptions[0].textContent.toLowerCase();
  v.innerHTML=`
  ${visits.length>=10000?'<p class="note">Showing the latest 10,000 page views. Pick a shorter range for exact numbers.</p>':''}
  <div class="grid kpis">
    <div class="kpi"><span>Page views</span><b>${fmtN(visits.length)}</b><small>${rangeLabel}</small></div>
    <div class="kpi"><span>Unique visitors</span><b>${fmtN(vis.size)}</b><small>${fmtN(newV.size)} first-time</small></div>
    <div class="kpi"><span>Visits (sessions)</span><b>${fmtN(sess.size)}</b><small>${vis.size?(sess.size/vis.size).toFixed(1):0} per visitor</small></div>
    <div class="kpi"><span>Active signed-in users</span><b>${fmtN(users.size)}</b><small>${fmtN(allUsers.size)} users in total</small></div>
    <div class="kpi"><span>New accounts</span><b>${fmtN(newUsers.size)}</b><small>first seen ${rangeLabel}</small></div>
    <div class="kpi"><span>Bondle players today</span><b>${fmtN(bplays)}</b><small>#${window.BondleCore?BondleCore.keyToIndex(today)+1:''}</small></div>
    <div class="kpi"><span>New feedback</span><b>${fmtN(fb.filter(x=>x.st==='new').length)}</b><small>${fmtN(fb.length)} messages in all</small></div>
  </div>
  <div class="grid two">
    <div class="card chart"><h2 class="sec">Traffic <small>${S.range===1?'by hour':'by day'}</small></h2>${chart(dailySeries(visits))}</div>
    <div class="card"><h2 class="sec">Where visits come from <small>first page of each visit</small></h2>${bars(count(sessions,visitSource),{limit:10})}</div>
  </div>
  <div class="grid three">
    <div class="card"><h2 class="sec">Top pages</h2>${bars(count(visits,x=>x.p),{limit:12})}</div>
    <div class="card"><h2 class="sec">Most used in the app <small>active devices</small></h2>${bars([...feats].sort((a,b)=>b[1]-a[1]).map(([k,n])=>[featName(k),n]),{limit:12})}</div>
    <div class="card"><h2 class="sec">“How did you find Bondline?” <small>all time · ${skipped} skipped</small></h2>${bars(heard,{color:true})}</div>
    <div class="card"><h2 class="sec">Countries <small>from time zone · visitors</small></h2>${bars(uniqCount(visits,x=>country(x.tz),x=>x.v),{limit:10})}</div>
    <div class="card"><h2 class="sec">Devices <small>visitors</small></h2>${bars(uniqCount(visits,x=>x.dev.charAt(0).toUpperCase()+x.dev.slice(1)+(x.app==='pwa'?' (installed app)':''),x=>x.v),{color:true,pct:true})}</div>
    <div class="card"><h2 class="sec">Campaigns <small>utm_campaign links</small></h2>${bars(count(sessions.filter(x=>x.c),x=>x.c+(x.u?' · '+x.u:'')))}<p class="fine">Tag reel links like <code>bondline.site/?utm_source=instagram&amp;utm_campaign=nmr-reel</code> to see them here.</p></div>
  </div>
  <div class="grid two">${await proCard()}</div>`;
}
async function proCard(){try{const [w,e]=await getWait();const act=e.filter(x=>x.status==='active'||x.status==='on_trial'||(x.until&&x.until>Date.now())||(x.grantUntil&&x.grantUntil>Date.now()));
  return`<div class="card"><h2 class="sec">Bondline Pro</h2><div class="grid kpis"><div class="kpi"><span>On the waitlist</span><b>${fmtN(w.length)}</b><small>${w.filter(x=>x.plan==='monthly').length} monthly · ${w.filter(x=>x.plan==='semester').length} semester</small></div><div class="kpi"><span>With Pro now</span><b>${fmtN(act.length)}</b><small>${fmtN(e.length)} records</small></div></div></div>`}catch(x){return''}}

/* ---------- users ---------- */
function groupUsers(devices){const m=new Map();
  for(const d of devices){const key=d.uid||('guest:'+d.v);let u=m.get(key);
    if(!u){u={key,uid:d.uid||'',e:'',n:'',first:Infinity,last:0,days:0,sess:0,ans:0,ok:0,notes:0,bondle:0,bbest:0,src:'',srcO:'',utm:'',camp:'',ref:'',tz:'',os:new Set(),feat:{},recent:[],devices:[]};m.set(key,u)}
    u.devices.push(d);u.e=u.e||d.e||'';u.n=u.n||d.n||'';u.first=Math.min(u.first,d.first||Infinity);u.last=Math.max(u.last,d.last||0);u.days=Math.max(u.days,d.days||0);u.sess+=d.sess||0;u.ans+=d.ans||0;u.ok+=d.ok||0;u.notes=Math.max(u.notes,d.notes||0);u.bondle+=d.bondle||0;u.bbest=Math.max(u.bbest,d.bbest||0);
    if(d.src&&(!u.src||u.src==='skip'))u.src=d.src;u.srcO=u.srcO||d.srcO||'';u.utm=u.utm||d.utm||'';u.camp=u.camp||d.camp||'';u.ref=u.ref||d.ref||'';u.tz=u.tz||d.tz||'';if(d.os)u.os.add(d.os+(d.dev?' '+d.dev:''));
    for(const [k,n] of Object.entries(d.feat||{}))u.feat[k]=(u.feat[k]||0)+n;for(const r of d.recent||[])u.recent.push(r)}
  for(const u of m.values()){u.recent.sort((a,b)=>+b.split('|')[0]-+a.split('|')[0]);if(u.first===Infinity)u.first=0}
  return[...m.values()]}
const srcText=u=>u.src&&u.src!=='skip'?(SRC_NAMES[u.src]||u.src)+(u.srcO?': '+u.srcO:''):u.utm?u.utm+' (link)':u.ref?refName(u.ref):'';
const USER_COLS=[['User','name'],['First seen','first'],['Last active','last'],['Active days','days',1],['Sessions','sess',1],['Answers','ans',1],['Notes','notes',1],['Bondle','bondle',1],['Came from','src'],['Devices','dc',1]];
async function rUsers(v){
  const devices=await getDevices(),all=groupUsers(devices);
  S.us=S.us||{guests:false,q:'',sort:'last',dir:-1};
  v.innerHTML=`<div class="toolbar"><input type="search" id="uq" placeholder="Search name, email, country, source" value="${esc(S.us.q)}"><label class="check"><input type="checkbox" id="ug"${S.us.guests?' checked':''}> Include guests (not signed in)</label><span class="fine" id="ucount"></span><span style="flex:1"></span><button class="btn small" id="ucsv">Download CSV</button></div><div class="tablewrap"><table><thead><tr>${USER_COLS.map(([l,k,num])=>`<th data-k="${k}" class="${num?'num':''}">${l}${S.us.sort===k?(S.us.dir<0?' ↓':' ↑'):''}</th>`).join('')}</tr></thead><tbody id="ub"></tbody></table></div>`;
  const rows=()=>{const q=S.us.q.toLowerCase();let L=all.filter(u=>S.us.guests||u.uid);
    if(q)L=L.filter(u=>[u.n,u.e,country(u.tz),srcText(u),[...u.os].join(' '),u.uid].join(' ').toLowerCase().includes(q));
    const k=S.us.sort,val=u=>k==='name'?(u.n||u.e||'~').toLowerCase():k==='src'?srcText(u).toLowerCase():k==='dc'?u.devices.length:u[k]||0;
    return L.sort((a,b)=>{const x=val(a),y=val(b);return(x<y?-1:x>y?1:0)*S.us.dir})};
  const draw=()=>{const L=rows();$('#ucount').textContent=`${L.length} ${S.us.guests?'people':'signed-in users'}`;
    $('#ub').innerHTML=L.slice(0,1000).map(u=>`<tr data-u="${esc(u.key)}"><td><b>${esc(u.n||u.e||('Guest '+u.devices[0].v.slice(0,6)))}</b><span class="sub">${esc(u.n&&u.e?u.e:country(u.tz))}</span></td><td>${shortDate(u.first)}</td><td>${ago(u.last)}</td><td class="num">${u.days}</td><td class="num">${u.sess}</td><td class="num">${fmtN(u.ans)}</td><td class="num">${u.notes}</td><td class="num">${u.bondle||''}</td><td>${esc(srcText(u))}</td><td class="num">${u.devices.length}</td></tr>`).join('')||`<tr><td colspan="10" class="empty">No ${S.us.guests?'people':'signed-in users'} yet. Usage records appear after people open the new version of the app.</td></tr>`};
  draw();
  $('#uq').addEventListener('input',e=>{S.us.q=e.target.value;draw()});
  $('#ug').addEventListener('change',e=>{S.us.guests=e.target.checked;draw()});
  v.querySelector('thead').addEventListener('click',e=>{const th=e.target.closest('th');if(!th)return;const k=th.dataset.k;S.us.dir=S.us.sort===k?-S.us.dir:(['name','src'].includes(k)?1:-1);S.us.sort=k;rUsers(v)});
  $('#ub').addEventListener('click',e=>{const tr=e.target.closest('tr[data-u]');if(tr)userDrawer(all.find(u=>u.key===tr.dataset.u))});
  $('#ucsv').addEventListener('click',()=>{const L=rows(),hd=['name','email','uid','first_seen','last_active','active_days','sessions','answers','correct','notes','bondle_played','bondle_best','came_from','utm','campaign','referrer','country','devices'];
    const csv=[hd].concat(L.map(u=>[u.n,u.e,u.uid,u.first?new Date(u.first).toISOString():'',u.last?new Date(u.last).toISOString():'',u.days,u.sess,u.ans,u.ok,u.notes,u.bondle,u.bbest,srcText(u),u.utm,u.camp,u.ref,country(u.tz),u.devices.length])).map(r=>r.map(x=>`"${String(x==null?'':x).replace(/"/g,'""')}"`).join(',')).join('\n');
    const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='bondline-users-'+dayKey(Date.now())+'.csv';a.click()});
}
async function userDrawer(u){
  if(!u)return;let dr=$('#drawer');if(!dr){dr=document.createElement('aside');dr.id='drawer';dr.className='drawer';document.body.appendChild(dr)}
  const visits=await getVisits().catch(()=>[]),ids=new Set(u.devices.map(d=>d.v)),pv=visits.filter(x=>ids.has(x.v)||(u.uid&&x.uid===u.uid));
  const feats=Object.entries(u.feat).sort((a,b)=>b[1]-a[1]).map(([k,n])=>[featName(k),n]);
  const feed=u.recent.map(r=>{const i=r.indexOf('|');return{t:+r.slice(0,i),x:eventText(r.slice(i+1))}}).concat(pv.map(x=>({t:x.t,x:'Viewed '+x.p+(x.u||x.r?' from '+visitSource(x):'')}))).sort((a,b)=>b.t-a.t).slice(0,80);
  dr.innerHTML=`<button class="btn small close" id="drClose">Close</button>
   <h3>${esc(u.n||u.e||'Guest')}</h3><div class="fine">${esc([u.e&&u.n?u.e:'',country(u.tz),[...u.os].join(', ')].filter(Boolean).join(' · '))}</div>
   ${u.uid?`<div class="fine">User ID <code>${esc(u.uid)}</code></div>`:''}
   <div class="facts"><div><b>${shortDate(u.first)}</b><span>First seen</span></div><div><b>${ago(u.last)}</b><span>Last active</span></div><div><b>${u.days}</b><span>Active days</span></div><div><b>${u.sess}</b><span>Sessions</span></div><div><b>${fmtN(u.ans)}</b><span>Practice answers (${u.ans?Math.round(100*u.ok/u.ans):0}% right)</span></div><div><b>${u.notes}</b><span>Notes</span></div><div><b>${u.bondle||0}</b><span>Bondles played (best ${u.bbest||0})</span></div><div><b>${esc(srcText(u)||'–')}</b><span>Came from</span></div></div>
   ${u.e?`<p><a class="btn small" href="mailto:${esc(u.e)}">Email ${esc(u.e)}</a></p>`:''}
   <h2 class="sec">What they use</h2>${bars(feats,{limit:12})}
   <h2 class="sec" style="margin-top:16px">Recent activity <small>latest ${feed.length}</small></h2>
   <ul class="feed">${feed.map(f=>`<li><time>${when(f.t)}</time><span>${esc(f.x)}</span></li>`).join('')||'<li><span class="empty">No recent activity recorded.</span></li>'}</ul>`;
  dr.hidden=false;$('#drClose').onclick=()=>dr.remove();
}

/* ---------- activity feed ---------- */
async function rActivity(v){
  const [visits,devices]=await Promise.all([getVisits(),getDevices()]),from=since();
  const byV=new Map(devices.map(d=>[d.v,d]));
  const who=(vid,uid)=>{const d=byV.get(vid);if(d&&(d.n||d.e))return`<b>${esc(d.n||d.e)}</b>`;const g=d?country(d.tz):'';return`<span class="fine">Guest ${esc(vid.slice(0,6))}${g?' · '+esc(g):''}</span>`};
  S.af=S.af||'all';
  const items=[];
  if(S.af!=='app')for(const x of visits.slice(0,600))items.push({t:x.t,h:`${who(x.v,x.uid)} viewed <b>${esc(x.p)}</b>${x.u||x.r?` <span class="pill b">${esc(visitSource(x))}</span>`:''} <span class="pill">${esc(x.dev)}</span>${x.n?' <span class="pill g">new</span>':''}`});
  if(S.af!=='views')for(const d of devices){if(d.last<from)break;for(const r of d.recent||[]){const i=r.indexOf('|'),t=+r.slice(0,i);if(t>=from)items.push({t,h:`${who(d.v)} ${esc(eventText(r.slice(i+1)).replace(/^./,c=>c.toLowerCase()))}`})}}
  items.sort((a,b)=>b.t-a.t);
  v.innerHTML=`<div class="toolbar"><select id="af"><option value="all">Everything</option><option value="views">Page views</option><option value="app">In-app activity</option></select><span class="fine">${items.length>500?'Latest 500 of '+fmtN(items.length):fmtN(items.length)+' events'}</span></div>
   <div class="card"><ul class="feed">${items.slice(0,500).map(i=>`<li><time title="${esc(new Date(i.t).toLocaleString())}">${esc(ago(i.t))}</time><span>${i.h}</span></li>`).join('')||'<li><span class="empty">No activity in this range yet.</span></li>'}</ul></div>`;
  $('#af').value=S.af;$('#af').addEventListener('change',e=>{S.af=e.target.value;rActivity(v)});
}

/* ---------- feedback ---------- */
const FB_K={bug:'🐞 Bug',idea:'💡 Idea',love:'❤️ Love',bondle:'🧪 Bondle',other:'💬 Other'};
async function rFeedback(v){
  const fb=await getFeedback();S.ff=S.ff||{st:'open',k:''};
  const L=fb.filter(x=>(S.ff.st==='all'||(S.ff.st==='open'?x.st!=='done':x.st===S.ff.st))&&(!S.ff.k||x.k===S.ff.k));
  v.innerHTML=`<div class="toolbar"><select id="fst"><option value="open">New and read</option><option value="new">New only</option><option value="done">Done</option><option value="all">All</option></select><select id="fk"><option value="">Every kind</option>${Object.entries(FB_K).map(([k,l])=>`<option value="${k}">${l}</option>`).join('')}</select><span class="fine">${L.length} shown · ${fb.filter(x=>x.st==='new').length} new</span></div>
   <div class="fb">${L.map(x=>`<article class="fbi ${esc(x.st)}" data-id="${esc(x._id)}"><header><span><b>${FB_K[x.k]||esc(x.k)}</b> · <span class="fine">${when(x.t)}</span></span><span class="pill ${x.st==='new'?'b':x.st==='done'?'g':''}">${esc(x.st)}</span></header>
     <div class="msg">${esc(x.m)}</div><div class="meta">${[x.e?'✉ '+esc(x.e):'',x.p?'In: '+esc(x.p):'',x.dev?esc(x.dev):'',x.ver?'v'+esc(x.ver):'',x.uid?'signed in':'guest'].filter(Boolean).join(' · ')}</div>
     <div class="acts">${x.st==='new'?'<button class="btn small" data-a="read">Mark read</button>':''}${x.st!=='done'?'<button class="btn small" data-a="done">Done</button>':'<button class="btn small" data-a="new">Reopen</button>'}${x.e?`<a class="btn small" href="mailto:${esc(x.e)}?subject=${encodeURIComponent('Re: your Bondline feedback')}&body=${encodeURIComponent('\n\n> '+x.m.slice(0,500).replace(/\n/g,'\n> '))}">Reply</a>`:''}<button class="btn small danger" data-a="del">Delete</button></div></article>`).join('')||'<div class="card empty">No feedback here.</div>'}</div>`;
  $('#fst').value=S.ff.st;$('#fk').value=S.ff.k;
  $('#fst').addEventListener('change',e=>{S.ff.st=e.target.value;rFeedback(v)});$('#fk').addEventListener('change',e=>{S.ff.k=e.target.value;rFeedback(v)});
  v.querySelector('.fb').addEventListener('click',async e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=b.closest('[data-id]').dataset.id,a=b.dataset.a,item=fb.find(x=>x._id===id);
    try{if(a==='del'){if(!confirm('Delete this feedback for good?'))return;await db.doc('feedback/'+id).delete();fb.splice(fb.indexOf(item),1)}
      else{await db.doc('feedback/'+id).update({st:a});item.st=a}
      rFeedback(v);const n=fb.filter(x=>x.st==='new').length,bg=$('#fbBadge');bg.hidden=!n;bg.textContent=n}catch(x){toast('Couldn’t save: '+x.message)}});
}

/* ---------- Bondle ---------- */
const C=()=>window.BondleCore,BANK=()=>window.BONDLE_BANK||[];
async function overrideFor(k){return get('bo:'+k,()=>db.doc('bondle/'+k).get().then(d=>d.exists?d.data():null))}
async function puzzleFor(k){const ov=await overrideFor(k);return{ov,day:C().daily(BANK(),C().keyToIndex(k),ov)}}
async function rBondle(v){
  S.bd=S.bd||dayKey(Date.now());const k=S.bd,core=C();
  const [{ov,day},plays,bday]=await Promise.all([puzzleFor(k),get('bp:'+k,()=>docs(db.collection('bondlePlays').where('d','==',k).limit(3000))),get('bday:'+k,()=>db.doc('bondleDay/'+k).get().then(d=>d.exists?d.data():{}))]);
  const tot=plays.map(p=>p.tot||0),avg=tot.length?Math.round(tot.reduce((a,b)=>a+b,0)/tot.length):0,hist=[0,1,2,3,4,5,6].map(i=>tot.filter(t=>Math.min(6,Math.floor(t/100))===i).length),hmax=Math.max(1,...hist);
  const counted=Object.values(bday||{}).reduce((a,x)=>a+(+x||0),0);
  const TC=['var(--c6)','#3b9ae1','#22a06b','#f0663c','#9b5de5','#e6b400'];
  const roundStats=day.rounds.map((p,i)=>{const rs=plays.map(pl=>(pl.r||[]).find(r=>r.q===p.id)||(pl.r||[])[i]).filter(Boolean),tiers=[0,0,0,0,0,0];rs.forEach(r=>tiers[r.t||0]++);
    const names=count(rs.filter(r=>r.t>0),r=>{const m=core.match(p,r.a);return m?m.name:r.a}),miss=count(plays.flatMap(pl=>(pl.x||[]).filter(x=>x.startsWith(p.id+'|')).map(x=>x.slice(p.id.length+1))).concat(rs.filter(r=>!r.t&&r.a).map(r=>r.a)),x=>x.trim().toLowerCase());
    return{p,n:rs.length,tiers,names,miss}});
  const upcoming=[];for(let i=0;i<14;i++){const kk=dayKey(Date.now()+i*DAY);upcoming.push(kk)}
  const ovs=await Promise.all(upcoming.map(kk=>overrideFor(kk).catch(()=>null)));
  v.innerHTML=`<div id="bwrap"><div class="toolbar"><label class="check">Day <input type="date" id="bdk" value="${k}"></label><b>Bondle #${core.keyToIndex(k)+1}</b>${ov?'<span class="pill b">set by hand</span>':'<span class="pill">automatic</span>'}${day.theme?`<span class="pill g">${esc(day.theme)}</span>`:''}</div>
  <div class="grid kpis"><div class="kpi"><span>Finished games</span><b>${fmtN(plays.length)}</b><small>${counted!==plays.length?`${fmtN(counted)} counted for percentiles`:'with usage statistics on'}</small></div><div class="kpi"><span>Average</span><b>${avg}</b><small>kJ/mol</small></div><div class="kpi"><span>Best</span><b>${tot.length?Math.max(...tot):0}</b><small>kJ/mol</small></div><div class="kpi"><span>Signed in</span><b>${plays.filter(p=>p.uid).length}</b><small>of the players</small></div></div>
  <div class="grid two"><div class="card"><h2 class="sec">Scores</h2><div class="hist">${hist.map((n,i)=>`<div><span>${n}</span><i style="height:${100*n/hmax}%"></i><span>${i*100}${i<6?'+':''}</span></div>`).join('')}</div></div>
   <div class="card"><h2 class="sec">Next 14 days</h2>${upcoming.map((kk,i)=>{const d=core.daily(BANK(),core.keyToIndex(kk),ovs[i]);return`<div class="day"><b>${i===0?'Today':new Date(Date.now()+i*DAY).toLocaleDateString([], {weekday:'short',day:'numeric',month:'short'})}${ovs[i]?' ✎':''}</b><span>${d.rounds.map(r=>esc(r.q.replace(/^Name (a|an) /,''))).join(' · ')} <button class="linkbtn" data-day="${kk}">Open</button></span></div>`}).join('')}</div></div>
  <h2 class="sec" style="margin-top:18px">Rounds <small>tiers players reached, popular answers, and answers that weren’t accepted (add good ones below)</small></h2>
  <div class="grid three">${roundStats.map((r,i)=>`<div class="card"><div class="fine">Round ${i+1} · ${esc(C().TOPICS[C().topic(r.p)])}${r.p.id.startsWith('c')&&!BANK().some(b=>b.id===r.p.id)?' · custom':''}</div><b>${esc(r.p.q)}</b>
    <div class="tiers" title="No bond → One in a Mole">${r.tiers.map((n,t)=>n?`<i style="width:${100*n/Math.max(1,r.n)}%;background:${TC[t]}" title="${core.TIERS[t].name}: ${n}"></i>`:'').join('')}</div>
    <div class="fine">${r.n} answers</div>${r.names.length?`<h2 class="sec" style="margin-top:10px">Accepted</h2>${bars(r.names,{limit:6})}`:''}
    ${r.miss.length?`<h2 class="sec" style="margin-top:10px">Not accepted</h2><div class="miss">${r.miss.slice(0,20).map(([a,n])=>`<span>${esc(a)}${n>1?' ×'+n:''}</span>`).join('')}</div>`:''}</div>`).join('')}</div>
  <div class="card" style="margin-top:18px"><h2 class="sec">Set this day’s prompts by hand <small>players see it the next time they open Bondle that day; no upload needed</small></h2>
   <form class="form" id="bform"><label>Theme <small>optional, shown above the rules, e.g. “Halloween special”</small></label><input type="text" id="btheme" maxlength="80" value="${esc((ov&&ov.theme)||'')}">
   <p class="fine">Answers: one per line as <code>Shown name|other spelling|another=TIER</code>, where TIER is 1 (obvious, 10 kJ/mol) to 5 (deep cut, 100 kJ/mol). Capitals, spaces, hyphens and subscripts are ignored when matching.</p>
   <div class="rounds">${day.rounds.map((p,i)=>`<div class="rnd" data-i="${i}" data-id="${esc(p.id)}"><h4>Round ${i+1}</h4><label>Topic</label><select class="rt">${Object.entries(C().TOPICS).map(([tk,tl])=>`<option value="${tk}"${C().topic(p)===tk?' selected':''}>${tl}</option>`).join('')}</select><label>Prompt</label><input type="text" class="rq" maxlength="120" value="${esc(p.q)}"><div class="row"><div><label>Small print <small>optional</small></label><input type="text" class="rh" maxlength="140" value="${esc(p.h||'')}"></div><div><label>Fact after the round <small>optional</small></label><input type="text" class="rf" maxlength="300" value="${esc(p.f||'')}"></div></div><label>Answers <small class="rc"></small></label><textarea class="ra" rows="7">${esc(String(p.a).trim())}</textarea></div>`).join('')}</div>
   <div class="row" style="margin-top:8px"><button class="btn primary" type="submit">Save prompts for ${k}</button>${ov?'<button class="btn danger" type="button" id="bdel">Go back to automatic prompts</button>':''}<span></span></div></form></div></div>`;
  const rc=()=>$$('.rnd').forEach(el=>{const n=C().parse({a:el.querySelector('.ra').value}).length;el.querySelector('.rc').textContent=`(${n} accepted)`});rc();
  const W=$('#bwrap');W.addEventListener('input',e=>{if(e.target.classList.contains('ra'))rc()});
  $('#bdk').addEventListener('change',e=>{if(e.target.value){S.bd=e.target.value;rBondle(v)}});
  W.addEventListener('click',e=>{const d=e.target.closest('[data-day]');if(d){S.bd=d.dataset.day;rBondle(v);scrollTo(0,0)}});
  $('#bform').addEventListener('submit',async e=>{e.preventDefault();const bank=new Map(BANK().map(p=>[p.id,p])),rounds=[];
    for(const el of $$('.rnd')){const i=+el.dataset.i,q=el.querySelector('.rq').value.trim(),h=el.querySelector('.rh').value.trim(),f=el.querySelector('.rf').value.trim(),a=el.querySelector('.ra').value.trim(),orig=bank.get(el.dataset.id);
      if(!q){toast(`Round ${i+1} needs a prompt`);return}if(C().parse({a}).length<3){toast(`Round ${i+1} needs at least 3 answers`);return}
      const same=orig&&orig.q===q&&(orig.h||'')===h&&(orig.f||'')===f&&String(orig.a).trim()===a;
      rounds.push({id:same?orig.id:'c'+k.replace(/-/g,'')+'_'+i,lv:(orig&&orig.lv)||2,t:(orig&&orig.t)||el.querySelector('.rt').value,q,h,f,a})}
    try{await db.doc('bondle/'+k).set({theme:$('#btheme').value.trim(),rounds,at:Date.now(),by:S.user.email||S.user.uid});delete S.cache['bo:'+k];toast('Saved. Players get these prompts on '+k);rBondle(v)}catch(x){toast('Couldn’t save: '+x.message)}});
  const del=$('#bdel');if(del)del.addEventListener('click',async()=>{if(!confirm('Use the automatic prompts for '+k+' again?'))return;try{await db.doc('bondle/'+k).delete();delete S.cache['bo:'+k];toast('Back to automatic');rBondle(v)}catch(x){toast('Couldn’t delete: '+x.message)}});
}

/* ---------- announcement ---------- */
async function rAnnounce(v){
  const a=await getAnn()||{on:false,text:'',kind:'new',link:'',linkText:''};
  const untilVal=a.until?new Date(a.until-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,16):'';
  v.innerHTML=`<div class="grid two"><div class="card"><h2 class="sec">Announcement bar <small>shown at the top of the app; no upload needed</small></h2>
   <form class="form" id="aform">
    <label class="check"><input type="checkbox" id="aon"${a.on?' checked':''}> Show it</label>
    <label>Message <small>up to 280 characters</small></label><input type="text" id="atext" maxlength="280" value="${esc(a.text||'')}" placeholder="New: Bondle, a daily science puzzle. Can you find a One in a Mole answer?">
    <div class="row"><div><label>Style</label><select id="akind"><option value="info">Info (blue)</option><option value="new">New feature (green)</option><option value="party">Celebration</option><option value="warn">Warning</option></select></div><div><label>Hide after <small>optional</small></label><input type="datetime-local" id="auntil" value="${untilVal}"></div></div>
    <div class="row"><div><label>Link <small>optional</small></label><select id="alinkk"><option value="">No link</option><option value="app:bondle">Open Bondle</option><option value="app:feedback">Open feedback</option><option value="app:pro">Open Bondline Pro</option><option value="app:whatsnew">Open What’s new</option><option value="url">A web address…</option></select></div><div><label>Button text</label><input type="text" id="alinkt" maxlength="40" value="${esc(a.linkText||'')}" placeholder="Take a look"></div></div>
    <input type="url" id="aurl" placeholder="https://bondline.site/guides/…" value="${esc(/^app:/.test(a.link||'')?'':a.link||'')}" hidden>
    <p class="fine">Changing the message shows it again to people who dismissed the previous one.</p>
    <div class="row"><button class="btn primary" type="submit">Save</button><span></span></div>
   </form></div>
   <div class="card"><h2 class="sec">Preview</h2><div class="preview" id="aprev"></div><p class="fine">Each app load reads this once (cached for 10 minutes), so changes reach people within about 10 minutes.</p></div></div>`;
  $('#akind').value=a.kind||'new';$('#alinkk').value=/^app:/.test(a.link||'')?a.link:(a.link?'url':'');$('#aurl').hidden=$('#alinkk').value!=='url';
  const prev=()=>{const t=$('#atext').value||'Your message';$('#aprev').innerHTML=`<span>${esc(t)}</span>${$('#alinkk').value?`<b style="text-decoration:underline">${esc($('#alinkt').value||'Take a look')}</b>`:''}`;$('#aprev').style.opacity=$('#aon').checked?1:.45};prev();
  v.addEventListener('input',prev);v.addEventListener('change',()=>{$('#aurl').hidden=$('#alinkk').value!=='url';prev()});
  $('#aform').addEventListener('submit',async e=>{e.preventDefault();const text=$('#atext').value.trim(),lk=$('#alinkk').value,link=lk==='url'?$('#aurl').value.trim():lk;
    if($('#aon').checked&&!text){toast('Write a message first');return}
    if(lk==='url'&&!/^https:\/\/\S+$|^\/\S*$/.test(link)){toast('The link must start with https:// or /');return}
    const u=$('#auntil').value?new Date($('#auntil').value).getTime():0;
    const doc={on:$('#aon').checked,text,kind:$('#akind').value,link,linkText:$('#alinkt').value.trim(),id:text===(a.text||'')&&a.id?a.id:'a'+Date.now(),at:Date.now()};if(u)doc.until=u;
    try{await db.doc('config/announcement').set(doc);S.cache.ann=Promise.resolve(doc);toast(doc.on?'Announcement is live':'Announcement saved (hidden)')}catch(x){toast('Couldn’t save: '+x.message)}});
}

/* ---------- version 27: teachers, free Pro and class passes ---------- */
const getTeachers=()=>get('teachers',()=>Promise.all([docs(db.collection('teachers')),docs(db.collection('passes')).catch(()=>[])]));
const T_ROLE={school:'School teacher',lecturer:'Lecturer',tutor:'Private tutor',centre:'Tuition centre',other:'Other'};
async function rTeachers(v){
  const [list,passes]=await getTeachers();const P=Object.fromEntries(passes.map(p=>[p._id,p]));
  const order={pending:0,ok:1,no:2};list.sort((a,b)=>(order[a.st]??3)-(order[b.st]??3)||(b.at||0)-(a.at||0));
  const yr=new Date(Date.now()+365*DAY).toISOString().slice(0,10);
  const card=t=>{const p=P[t._id]||{};return`<div class="card tcard" data-uid="${esc(t._id)}">
    <h2 class="sec">${esc(t.n)} <span class="pill">${t.st==='ok'?'Approved':t.st==='no'?'Declined':'Waiting'}</span></h2>
    <p><b>${esc(T_ROLE[t.role]||t.role||'')}</b> at <b>${esc(t.school||'')}</b>${t.country?' · '+esc(t.country):''}${t.students?' · '+fmtN(t.students)+' students':''}</p>
    <p class="fine">${t.e?`<a href="mailto:${esc(t.e)}">${esc(t.e)}</a> · `:''}sent ${when(t.at)} · user ID <code>${esc(t._id)}</code></p>
    ${t.use?`<p>${esc(t.use)}</p>`:''}
    <div class="row">${t.st!=='ok'?`<button class="btn primary small" data-ta="ok">Approve: Pro for a year</button>`:''}${t.st!=='no'?`<button class="btn small" data-ta="no">Decline</button>`:''}</div>
    <form class="form row tpass"><div><label>Class pass seats <small>per class; 0 = none</small></label><input type="number" min="0" max="500" name="seats" value="${esc(p.seats||0)}"></div><div><label>Until</label><input type="date" name="until" value="${esc(p.until?new Date(p.until).toISOString().slice(0,10):yr)}"></div><button class="btn small" type="submit">Save class pass</button></form>
    ${p.seats&&p.until>Date.now()?`<p class="fine">Students in this teacher’s classes get Pro until ${shortDate(p.until)} (the first ${p.seats} in each class).</p>`:''}</div>`};
  v.innerHTML=`<div class="grid two"><div class="card"><h2 class="sec">Teacher requests <small>${list.filter(x=>x.st==='pending').length} waiting</small></h2>
    <p class="fine">Teachers ask from Classes → Free Pro for teachers. Check the school or centre (its website, or the email domain) before approving. Approving gives that account Pro for a year. Class passes give Pro to the students in that teacher’s classes, for centres that pay for them.</p></div>
    <div class="card"><h2 class="sec">Give Pro to any account</h2><form class="form" id="grantF"><label>User ID</label><input type="text" id="gUid" placeholder="From the Users tab or the teacher’s request"><label>Until</label><input type="date" id="gUntil" value="${yr}"><label class="check"><input type="checkbox" id="gTeach"> Mark as a teacher</label><button class="btn primary" type="submit">Give Pro</button></form></div></div>
    <div class="grid two">${list.map(card).join('')||'<div class="card"><p class="empty">No requests yet.</p></div>'}</div>`;
  const grant=async(uid,until,teacher)=>db.doc('entitlements/'+uid).set({grantUntil:until,teacher:!!teacher,grantBy:S.user.uid,updated:Date.now()},{merge:true});
  v.addEventListener('click',async e=>{const b=e.target.closest('[data-ta]');if(!b)return;const uid=b.closest('[data-uid]').dataset.uid;b.disabled=true;
    try{if(b.dataset.ta==='ok'){await grant(uid,Date.now()+365*DAY,true);await db.doc('teachers/'+uid).update({st:'ok',by:S.user.uid,dec:Date.now()});toast('Approved. Pro is on for a year.')}
      else{await db.doc('teachers/'+uid).update({st:'no',by:S.user.uid,dec:Date.now()});toast('Declined')}
      delete S.cache.teachers;render()}catch(x){b.disabled=false;toast('Couldn’t save: '+x.message)}});
  v.addEventListener('submit',async e=>{e.preventDefault();const f=e.target;
    if(f.id==='grantF'){const uid=$('#gUid').value.trim(),u=new Date($('#gUntil').value+'T23:59:00').getTime();if(!/^[A-Za-z0-9_-]{6,128}$/.test(uid)||!u){toast('Check the user ID and date');return}
      try{await grant(uid,u,$('#gTeach').checked);toast('Pro given until '+shortDate(u))}catch(x){toast('Couldn’t save: '+x.message)}return}
    if(f.classList.contains('tpass')){const uid=f.closest('[data-uid]').dataset.uid,t=list.find(x=>x._id===uid)||{},seats=Math.max(0,Math.min(500,parseInt(f.seats.value,10)||0)),u=new Date(f.until.value+'T23:59:00').getTime();
      try{await db.doc('passes/'+uid).set({seats,until:u||0,n:String(t.n||'').slice(0,80),school:String(t.school||'').slice(0,120),at:Date.now()});delete S.cache.teachers;toast(seats?'Class pass saved':'Class pass removed');render()}catch(x){toast('Couldn’t save: '+x.message)}}});
}
})();
