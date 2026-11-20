/* Bondline Daily: shows the story for today (in the reader's own time zone), with an archive of earlier days.
   ?d=YYYY-MM-DD opens a given day (never a future one). */
(function(){'use strict';
const A=window.BL_DAILY||[],START=window.BL_DAILY_START||'2026-11-20',DAY=864e5;
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||'');return m?new Date(+m[1],+m[2]-1,+m[3]):null};
const today=parse(iso(new Date())),start=parse(START);
const idx=d=>{const n=Math.round((d-start)/DAY);return((n%A.length)+A.length)%A.length};
const nice=d=>d.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const short=d=>d.toLocaleDateString(undefined,{day:'numeric',month:'short'});
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const plain=s=>String(s).replace(/<[^>]+>/g,'');

function show(d,push){
  if(d>today)d=today;if(d<start)d=start;
  const a=A[idx(d)],isToday=+d===+today,n=Math.round((d-start)/DAY)+1;
  document.title=`${plain(a.t)} · Bondline Daily`;
  $('dyTitle').innerHTML=a.t;
  $('dyLede').textContent=a.h;
  $('dyMeta').innerHTML=`<span class="dy-cat">${esc(a.c)}</span>${isToday?'Today · ':''}${esc(nice(d))} · Story ${n}`;
  $('dyArticle').innerHTML=a.p.map(x=>`<p>${x}</p>`).join('')+`<div class="dy-x"><b>Where this is on your syllabus</b>${esc(a.x)}</div>`;
  const prev=new Date(d-DAY),next=new Date(+d+DAY);
  $('dyNav').innerHTML=`<button class="dy-btn" id="dyPrev"${prev<start?' disabled':''}>← Previous day</button><button class="dy-btn" id="dyNext"${next>today?' disabled':''}>Next day →</button>${isToday?'':'<button class="dy-btn" id="dyToday">Today’s story</button>'}<button class="dy-btn pri" id="dyShare">Share</button>`;
  $('dyPrev').onclick=()=>show(prev,true);$('dyNext').onclick=()=>show(next,true);
  if($('dyToday'))$('dyToday').onclick=()=>show(today,true);
  $('dyShare').onclick=()=>share(a,d);
  archive(d);
  if(push){const url=isToday?'/daily/':`/daily/?d=${iso(d)}`;history.pushState({d:iso(d)},'',url);window.scrollTo({top:0,behavior:'smooth'})}
  try{localStorage.setItem('bondline.daily.seen',iso(today))}catch(e){}
}
function archive(cur){
  const items=[];for(let d=new Date(today),i=0;d>=start&&i<A.length;d=new Date(d-DAY),i++)items.push(new Date(d));
  $('dyArch').innerHTML=items.map(d=>{const a=A[idx(d)];return`<li><a href="/daily/?d=${iso(d)}" data-d="${iso(d)}"${+d===+cur?' class="on" aria-current="page"':''}><time datetime="${iso(d)}">${+d===+today?'Today':esc(short(d))}</time><span>${a.t}</span></a></li>`}).join('');
}
function toast(m){const t=$('dyToast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),1800)}
async function share(a,d){
  const url=`https://bondline.site/daily/?d=${iso(d)}`,title=plain(a.t);
  if(navigator.share){try{await navigator.share({title,text:a.h,url});return}catch(e){if(e&&e.name==='AbortError')return}}
  try{await navigator.clipboard.writeText(`${title}: ${url}`);toast('Link copied')}catch(e){prompt('Copy this link',url)}
}
$('dyArch').addEventListener('click',e=>{const l=e.target.closest('a[data-d]');if(!l)return;e.preventDefault();show(parse(l.dataset.d),true)});
window.addEventListener('popstate',()=>show(parse(new URLSearchParams(location.search).get('d'))||today,false));
if(!A.length){$('dyArticle').textContent='No stories yet.';return}
show(parse(new URLSearchParams(location.search).get('d'))||today,false);
})();
