/* Bondline version 34: diagrams. Titration curves, graphs, Lewis structures and tables.
   Used by "Add diagram" blocks in notes, by figures in course questions, and by drawing questions.
   window.BL_DIAG:
     is(d)              true if d is diagram data (d.k is one of KINDS)
     empty(k)           a new, blank diagram of kind k
     clean(d)           checks and trims stored data (notes come from storage and other people)
     svg(d,{print})     an SVG string; print:true uses fixed colours for PDFs, slides and images
     canvas(d,scale)    a promise of a <canvas> with the diagram drawn on white
     editor(host,d,onChange,{lock})   mounts an editor. lock:true hides the kind switcher (drawing questions)
     check(model,ans,start)   marks a drawn answer: {auto, ok, msg}
     text(d)            searchable text
     label(k)           the name of a kind */
(function(){
'use strict';
const KINDS=['titration','graph','lewis','table'];
const NAMES={titration:'Titration curve',graph:'Graph',lewis:'Lewis structure',table:'Table'};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=(v,d,lo,hi)=>{v=+v;if(!isFinite(v))v=d;return Math.min(hi,Math.max(lo,v))};
const str=(v,n)=>String(v==null?'':v).slice(0,n||200);
const r2=v=>Math.round(v*100)/100;
const uid=()=>Math.random().toString(36).slice(2,9);

/* colours: on screen they follow the theme; printed copies use fixed ones */
const SCR={ink:'var(--ink)',muted:'var(--muted)',line:'var(--line)',grid:'color-mix(in srgb,var(--line) 70%,transparent)',bg:'none',
  ser:['var(--accent)','var(--accent2)','#d9480f','#2f9e44','#7048e8','#0c8599'],band:'color-mix(in srgb,var(--accent2) 16%,transparent)'};
const PRT={ink:'#151515',muted:'#555555',line:'#b8b8b8',grid:'#e3e3e3',bg:'#ffffff',ser:['#1c5fb8','#b4531f','#d9480f','#2f9e44','#7048e8','#0c8599'],band:'rgba(180,83,31,.13)'};

/* text with _sub and ^sup: H_2O, SO_4^{2-}, cm^3 */
function parts(t){const out=[];t=String(t||'');let i=0,buf='';
  const push=(s,m)=>{if(s)out.push([s,m])};
  while(i<t.length){const c=t[i];
    if((c==='_'||c==='^')&&i+1<t.length){push(buf,0);buf='';const m=c==='_'?1:2;let s;
      if(t[i+1]==='{'){const j=t.indexOf('}',i+2);s=j<0?t.slice(i+2):t.slice(i+2,j);i=j<0?t.length:j+1}
      else{const mt=/^[0-9]+[+\-−]?|^[+\-−]|^[A-Za-z]/.exec(t.slice(i+1));s=mt?mt[0]:t[i+1];i+=1+s.length}
      push(s.replace(/-/g,'−'),m);continue}
    buf+=c;i++}
  push(buf,0);return out}
const fmtHTML=t=>parts(t).map(([s,m])=>m===1?`<sub>${esc(s)}</sub>`:m===2?`<sup>${esc(s)}</sup>`:esc(s)).join('');
const fmtSVG=t=>{let lvl=0;return parts(t).map(([s,m])=>{const sh=m===1?'.3em':m===2?'-.45em':'0';const back=lvl;lvl=m;const dy=(m===1?.3:m===2?-.45:0)-(back===1?.3:back===2?-.45:0);
  return`<tspan dy="${dy}em"${m?' font-size="75%"':''}>${esc(s)}</tspan>`}).join('')+(lvl?`<tspan dy="${lvl===1?-.3:.45}em"></tspan>`:'')};
const plainTxt=t=>String(t||'').replace(/[_^]\{([^}]*)\}/g,'$1').replace(/[_^]/g,'');

/* ---------------- empty data and presets ---------------- */
function empty(k){
  if(k==='titration')return{k,flask:'acid',acid:'strong',pka:[4.76],base:'strong',pkb:4.75,ca:0.1,cb:0.1,vf:25,vmax:0,ind:'none',marks:true,title:''};
  if(k==='graph')return{k,title:'',x:{label:'x',min:0,max:10},y:{label:'y',min:0,max:10},series:[{id:uid(),name:'',mode:'smooth',fn:'',pts:[],c:0}],notes:[],grid:true};
  if(k==='lewis')return{k,atoms:[],bonds:[],br:'',dots:false};
  if(k==='table')return{k,cap:'',head:true,rows:[['','',''],['','',''],['','','']]};
  return{k:''}}
const GRAPH_PRESETS={
  blank:['Blank axes',()=>empty('graph')],
  exo:['Energy profile, exothermic',()=>({k:'graph',title:'',x:{label:'Progress of reaction',min:0,max:10},y:{label:'Energy',min:0,max:10},grid:false,noTicks:true,
    series:[{id:uid(),name:'',mode:'smooth',fn:'',c:0,pts:[[0,6],[1.5,6],[3.5,8.6],[5,9.2],[6.5,8.6],[8.5,3],[10,3]]}],
    notes:[{x:0.4,y:6.6,t:'Reactants'},{x:8.3,y:2.3,t:'Products'},{x:5.2,y:9.6,t:'E_a'},{x:7.4,y:4.6,t:'ΔH < 0'}]})],
  endo:['Energy profile, endothermic',()=>({k:'graph',title:'',x:{label:'Progress of reaction',min:0,max:10},y:{label:'Energy',min:0,max:10},grid:false,noTicks:true,
    series:[{id:uid(),name:'',mode:'smooth',fn:'',c:0,pts:[[0,3],[1.5,3],[3.5,7.8],[5,9],[6.5,8.4],[8.5,6],[10,6]]}],
    notes:[{x:0.4,y:2.3,t:'Reactants'},{x:8.3,y:6.6,t:'Products'},{x:5.2,y:9.5,t:'E_a'},{x:7.6,y:4.6,t:'ΔH > 0'}]})],
  cat:['Energy profile with a catalyst',()=>({k:'graph',title:'',x:{label:'Progress of reaction',min:0,max:10},y:{label:'Energy',min:0,max:10},grid:false,noTicks:true,
    series:[{id:uid(),name:'Uncatalysed',mode:'smooth',fn:'',c:0,pts:[[0,6],[1.5,6],[3.5,8.6],[5,9.2],[6.5,8.6],[8.5,3],[10,3]]},
      {id:uid(),name:'Catalysed',mode:'smooth',fn:'',c:1,dash:true,pts:[[0,6],[1.5,6],[3.5,7],[5,7.4],[6.5,7],[8.5,3],[10,3]]}],notes:[{x:0.4,y:6.6,t:'Reactants'},{x:8.3,y:2.3,t:'Products'}]})],
  mb:['Maxwell–Boltzmann distribution',()=>({k:'graph',title:'',x:{label:'Kinetic energy',min:0,max:10},y:{label:'Number of molecules',min:0,max:1},grid:false,noTicks:true,
    series:[{id:uid(),name:'T₁',mode:'line',fn:'2.2*x*exp(-x*x/3.2)/1.8',pts:[],c:0},{id:uid(),name:'T₂ > T₁',mode:'line',fn:'1.25*x*exp(-x*x/6.5)/1.25',pts:[],c:1}],
    notes:[{x:7.4,y:0.32,t:'E_a'}],vlines:[{x:7.2,t:''}]})],
  decay:['Concentration against time',()=>({k:'graph',title:'',x:{label:'Time / s',min:0,max:100},y:{label:'Concentration / mol dm^{-3}',min:0,max:1},grid:true,
    series:[{id:uid(),name:'',mode:'line',fn:'exp(-0.0347*x)',pts:[],c:0}],notes:[]})],
  rate:['Rate against concentration',()=>({k:'graph',title:'',x:{label:'[A] / mol dm^{-3}',min:0,max:1},y:{label:'Rate',min:0,max:1},grid:true,
    series:[{id:uid(),name:'Zero order',mode:'line',fn:'0.4',pts:[],c:0},{id:uid(),name:'First order',mode:'line',fn:'x',pts:[],c:1},{id:uid(),name:'Second order',mode:'line',fn:'x*x',pts:[],c:2}],notes:[]})],
  ie:['Successive ionisation energies',()=>({k:'graph',title:'',x:{label:'Electron removed',min:0,max:12},y:{label:'log(IE / kJ mol^{-1})',min:2,max:5.5},grid:true,
    series:[{id:uid(),name:'',mode:'points',fn:'',c:0,pts:[[1,2.86],[2,3.18],[3,3.86],[4,4.02],[5,4.14],[6,4.26],[7,4.39],[8,4.47],[9,4.58],[10,4.69],[11,5.02]]}],notes:[]})]};
const LEWIS_PRESETS={
  h2o:['H_2O',()=>L([['O',280,140,2],['H',230,180],['H',330,180]],[[0,1,1],[0,2,1]])],
  nh3:['NH_3',()=>L([['N',280,130,1],['H',225,170],['H',280,190],['H',335,170]],[[0,1,1],[0,2,1],[0,3,1]])],
  ch4:['CH_4',()=>L([['C',280,150],['H',280,90],['H',220,150],['H',340,150],['H',280,210]],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]])],
  co2:['CO_2',()=>L([['O',220,150,2],['C',280,150],['O',340,150,2]],[[0,1,2],[1,2,2]])],
  hcn:['HCN',()=>L([['H',220,150],['C',280,150],['N',340,150,1]],[[0,1,1],[1,2,3]])],
  nh4:['NH_4^+',()=>{const d=L([['N',280,150],['H',280,90],['H',220,150],['H',340,150],['H',280,210]],[[0,1,1],[0,2,1],[0,3,1],[0,4,1]]);d.br='+';return d}],
  bf3:['BF_3',()=>L([['B',280,150],['F',280,90,3],['F',228,180,3],['F',332,180,3]],[[0,1,1],[0,2,1],[0,3,1]])],
  o3:['O_3',()=>{const d=L([['O',220,170,3],['O',280,140,1],['O',340,170,2]],[[0,1,1],[1,2,2]]);d.atoms[0].q=-1;d.atoms[1].q=1;return d}]};
function L(at,bd){const atoms=at.map(([el,x,y,lp])=>({id:uid(),el,x,y,lp:lp||0,e:0,q:0}));return{k:'lewis',atoms,bonds:bd.map(([a,b,o])=>({a:atoms[a].id,b:atoms[b].id,o})),br:'',dots:false}}

/* ---------------- clean ---------------- */
function clean(d){
  if(!d||typeof d!=='object'||!KINDS.includes(d.k))return{k:''};
  if(d.k==='titration'){const e=empty('titration');
    return{k:'titration',flask:d.flask==='base'?'base':'acid',acid:d.acid==='weak'?'weak':'strong',pka:(Array.isArray(d.pka)&&d.pka.length?d.pka:e.pka).slice(0,3).map(v=>num(v,4.76,-2,14)),
      base:d.base==='weak'?'weak':'strong',pkb:num(d.pkb,4.75,-2,14),ca:num(d.ca,.1,.0001,20),cb:num(d.cb,.1,.0001,20),vf:num(d.vf,25,1,1000),vmax:num(d.vmax,0,0,2000),
      ind:['none','pp','mo','btb','mr','tb'].includes(d.ind)?d.ind:'none',marks:d.marks!==false,title:str(d.title,120),hide:!!d.hide}}
  if(d.k==='graph'){const ax=(a,l)=>{a=a||{};const lo=num(a.min,0,-1e9,1e9),hi=num(a.max,10,-1e9,1e9);return{label:str(a.label,80)||l,min:lo,max:hi>lo?hi:lo+1}};
    return{k:'graph',title:str(d.title,120),x:ax(d.x,'x'),y:ax(d.y,'y'),grid:d.grid!==false,noTicks:!!d.noTicks,
      series:(Array.isArray(d.series)?d.series:[]).slice(0,6).map((s,i)=>({id:str(s.id||uid(),20),name:str(s.name,60),mode:['line','smooth','points','bar'].includes(s.mode)?s.mode:'line',fn:str(s.fn,160),c:num(s.c,i,0,5)|0,dash:!!s.dash,
        pts:(Array.isArray(s.pts)?s.pts:[]).slice(0,400).filter(p=>Array.isArray(p)&&isFinite(+p[0])&&isFinite(+p[1])).map(p=>[+p[0],+p[1]])})),
      notes:(Array.isArray(d.notes)?d.notes:[]).slice(0,30).filter(n=>n&&isFinite(+n.x)&&isFinite(+n.y)).map(n=>({x:+n.x,y:+n.y,t:str(n.t,60)})),
      vlines:(Array.isArray(d.vlines)?d.vlines:[]).slice(0,6).filter(v=>v&&isFinite(+v.x)).map(v=>({x:+v.x,t:str(v.t,40)})),
      hlines:(Array.isArray(d.hlines)?d.hlines:[]).slice(0,6).filter(v=>v&&isFinite(+v.y)).map(v=>({y:+v.y,t:str(v.t,40)}))}}
  if(d.k==='lewis'){const atoms=(Array.isArray(d.atoms)?d.atoms:[]).slice(0,60).filter(a=>a&&a.el).map(a=>({id:str(a.id||uid(),20),el:str(a.el,3).replace(/[^A-Za-z]/g,'')||'C',x:num(a.x,0,0,2000),y:num(a.y,0,0,2000),lp:num(a.lp,0,0,4)|0,e:num(a.e,0,0,3)|0,q:num(a.q,0,-4,4)|0}));
    const ids=new Set(atoms.map(a=>a.id));
    const bonds=(Array.isArray(d.bonds)?d.bonds:[]).slice(0,120).filter(b=>b&&ids.has(b.a)&&ids.has(b.b)&&b.a!==b.b).map(b=>({a:b.a,b:b.b,o:num(b.o,1,1,3)|0,dat:!!b.dat}));
    return{k:'lewis',atoms,bonds,br:str(d.br,4).replace(/[^0-9+\-−]/g,''),dots:!!d.dots}}
  if(d.k==='table'){let rows=(Array.isArray(d.rows)?d.rows:[]).slice(0,30).map(r=>(Array.isArray(r)?r:[]).slice(0,10).map(c=>str(c,200)));
    const w=Math.max(1,...rows.map(r=>r.length));rows=rows.map(r=>{while(r.length<w)r.push('');return r});if(!rows.length)rows=[['']];
    return{k:'table',cap:str(d.cap,160),head:d.head!==false,rows}}
  return{k:''}}

/* ---------------- titration maths ---------------- */
const KW=1e-14;
function tiPH(d,v){
  const vt=(d.vf+v)/1000,nA=d.flask==='acid'?d.ca*d.vf/1000:d.ca*v/1000,nB=d.flask==='acid'?d.cb*v/1000:d.cb*d.vf/1000;
  const CA=nA/vt,CB=nB/vt,K=d.pka.map(p=>10**-p),Kbh=d.base==='weak'?KW/10**-d.pkb:0;
  const neg=h=>{if(d.acid==='strong')return CA;let t=1,den=1,num=0;for(let j=0;j<K.length;j++){t*=K[j]/h;den+=t;num+=(j+1)*t}return CA*num/den};
  const pos=h=>d.base==='strong'?CB:CB*h/(h+Kbh);
  const f=lh=>{const h=10**lh;return h+pos(h)-KW/h-neg(h)};
  let lo=-15.5,hi=1.5;for(let i=0;i<60;i++){const m=(lo+hi)/2;if(f(m)>0)hi=m;else lo=m}
  return -(lo+hi)/2}
function tiInfo(d){const np=d.acid==='strong'?1:d.pka.length;let eq=[];
  if(d.flask==='acid')for(let j=1;j<=np;j++)eq.push(j*d.ca*d.vf/d.cb);
  else eq.push(d.cb*d.vf/(d.ca*np));
  const last=eq[eq.length-1];const vmax=d.vmax>0?d.vmax:Math.max(5,Math.ceil(last*2/5)*5);
  return{eq,vmax,np}}
const IND={pp:['Phenolphthalein',8.3,10],mo:['Methyl orange',3.1,4.4],btb:['Bromothymol blue',6,7.6],mr:['Methyl red',4.4,6.2],tb:['Thymol blue',8,9.6]};
const tiName=d=>{const a=d.acid==='strong'?'strong acid':d.pka.length>1?'weak '+(d.pka.length===2?'diprotic':'triprotic')+' acid':'weak acid',b=d.base==='strong'?'strong base':'weak base';
  return d.flask==='acid'?`${b[0].toUpperCase()+b.slice(1)} added to a ${a}`:`${a[0].toUpperCase()+a.slice(1)} added to a ${b}`};

/* ---------------- shared plot frame ---------------- */
const W=560,H=340,PL=62,PR=18,PT=26,PB=50;
function niceStep(span,n){const raw=span/n,p=10**Math.floor(Math.log10(raw)),m=raw/p;return(m<1.5?1:m<3?2:m<7?5:10)*p}
function frame(C,o){const X=v=>PL+(v-o.x0)/(o.x1-o.x0)*(W-PL-PR),Y=v=>H-PB-(v-o.y0)/(o.y1-o.y0)*(H-PT-PB);let s='';
  if(o.grid||!o.noTicks){const sx=niceStep(o.x1-o.x0,8),sy=niceStep(o.y1-o.y0,7);
    for(let v=Math.ceil(o.x0/sx)*sx;v<=o.x1+1e-9;v+=sx){const x=X(v);if(o.grid)s+=`<line x1="${x}" y1="${PT}" x2="${x}" y2="${H-PB}" stroke="${C.grid}" stroke-width="1"/>`;if(!o.noTicks)s+=`<line x1="${x}" y1="${H-PB}" x2="${x}" y2="${H-PB+5}" stroke="${C.ink}"/><text x="${x}" y="${H-PB+18}" text-anchor="middle" font-size="11.5" fill="${C.muted}">${r2(v)}</text>`}
    for(let v=Math.ceil(o.y0/sy)*sy;v<=o.y1+1e-9;v+=sy){const y=Y(v);if(o.grid)s+=`<line x1="${PL}" y1="${y}" x2="${W-PR}" y2="${y}" stroke="${C.grid}" stroke-width="1"/>`;if(!o.noTicks)s+=`<line x1="${PL-5}" y1="${y}" x2="${PL}" y2="${y}" stroke="${C.ink}"/><text x="${PL-8}" y="${y+4}" text-anchor="end" font-size="11.5" fill="${C.muted}">${r2(v)}</text>`}}
  s+=`<path d="M${PL} ${PT-6}V${H-PB}H${W-PR+4}" fill="none" stroke="${C.ink}" stroke-width="1.6"/><path d="M${PL-4} ${PT-1}L${PL} ${PT-8}L${PL+4} ${PT-1}M${W-PR-1} ${H-PB-4}L${W-PR+6} ${H-PB}L${W-PR-1} ${H-PB+4}" fill="none" stroke="${C.ink}" stroke-width="1.6"/>`;
  s+=`<text x="${(PL+W-PR)/2}" y="${H-12}" text-anchor="middle" font-size="13" fill="${C.ink}">${fmtSVG(o.xl)}</text>`;
  s+=`<text transform="translate(16 ${(PT+H-PB)/2}) rotate(-90)" text-anchor="middle" font-size="13" fill="${C.ink}">${fmtSVG(o.yl)}</text>`;
  if(o.title)s+=`<text x="${(PL+W-PR)/2}" y="14" text-anchor="middle" font-size="13.5" font-weight="600" fill="${C.ink}">${fmtSVG(o.title)}</text>`;
  return{s,X,Y}}
const wrap=(inner,w,h,C,label)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(label)}" font-family="Inter,Segoe UI,system-ui,sans-serif" class="dg-svg">${C.bg!=='none'?`<rect width="${w}" height="${h}" fill="${C.bg}"/>`:''}${inner}</svg>`;
function smoothPath(P){const n=P.length;if(n<3||P.some((p,i)=>i&&p[0]<=P[i-1][0]))return P.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('');
  /* monotone cubic (Fritsch–Carlson): smooth, but never overshoots the points */
  const h=[],dl=[];for(let i=0;i<n-1;i++){h[i]=P[i+1][0]-P[i][0];dl[i]=(P[i+1][1]-P[i][1])/h[i]}
  const m=[dl[0]];for(let i=1;i<n-1;i++)m[i]=dl[i-1]*dl[i]<=0?0:3*(h[i-1]+h[i])/((2*h[i]+h[i-1])/dl[i-1]+(h[i]+2*h[i-1])/dl[i]);m[n-1]=dl[n-2];
  let s=`M${P[0][0].toFixed(1)} ${P[0][1].toFixed(1)}`;for(let i=0;i<n-1;i++){const k=h[i]/3;s+=`C${(P[i][0]+k).toFixed(1)} ${(P[i][1]+m[i]*k).toFixed(1)} ${(P[i+1][0]-k).toFixed(1)} ${(P[i+1][1]-m[i+1]*k).toFixed(1)} ${P[i+1][0].toFixed(1)} ${P[i+1][1].toFixed(1)}`}return s}

function titrationSVG(d,C){const I=tiInfo(d);const tl=d.flask==='acid'?'base':'acid';
  const F=frame(C,{x0:0,x1:I.vmax,y0:0,y1:14,grid:true,xl:`Volume of ${tl} added / cm^3`,yl:'pH',title:d.title});let s=F.s;
  if(d.ind!=='none'&&IND[d.ind]){const[n,a,b]=IND[d.ind];s+=`<rect x="${PL}" y="${F.Y(b)}" width="${W-PL-PR}" height="${F.Y(a)-F.Y(b)}" fill="${C.band}"/><text x="${W-PR-6}" y="${F.Y(b)-5}" text-anchor="end" font-size="11.5" fill="${C.muted}">${esc(n)} (pH ${a}–${b})</text>`}
  if(!d.hide){const P=[];const N=360;for(let i=0;i<=N;i++){const v=I.vmax*i/N;P.push([F.X(v),F.Y(Math.max(0,Math.min(14,tiPH(d,v))))])}
    s+=`<path d="${P.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('')}" fill="none" stroke="${C.ser[0]}" stroke-width="2.4" stroke-linejoin="round"/>`;
    if(d.marks){I.eq.forEach((v,i)=>{if(v>I.vmax)return;const ph=tiPH(d,v),x=F.X(v),y=F.Y(ph);
        s+=`<path d="M${x} ${H-PB}V${y}" stroke="${C.muted}" stroke-dasharray="4 4"/><circle cx="${x}" cy="${y}" r="4.5" fill="${C.ser[1]}"/><text x="${x+8}" y="${y+(i%2?16:-8)}" font-size="11.5" fill="${C.ink}">${I.eq.length>1?(i+1)+(i?'nd':'st')+' equivalence':'Equivalence'}: ${r2(v)} cm³, pH ${ph.toFixed(1)}</text>`});
      if(d.acid==='weak'&&d.flask==='acid')d.pka.forEach((pk,i)=>{const v=(I.eq[i]+(i?I.eq[i-1]:0))/2;if(v>I.vmax)return;const ph=tiPH(d,v),x=F.X(v),y=F.Y(ph);
        s+=`<circle cx="${x}" cy="${y}" r="3.5" fill="none" stroke="${C.ser[1]}" stroke-width="1.6"/><text x="${x-6}" y="${y-9}" text-anchor="end" font-size="11.5" fill="${C.muted}">pH = pK_a${d.pka.length>1?i+1:''} = ${pk}</text>`.replace('pK_a','pK<tspan dy=".3em" font-size="75%">a</tspan><tspan dy="-.3em"></tspan>')})}}
  return wrap(s,W,H,C,d.title||tiName(d))}

/* ---------------- graph ---------------- */
function compile(src){src=String(src||'').toLowerCase().replace(/\s+/g,'').replace(/×/g,'*').replace(/−/g,'-');if(!src)return null;let i=0;
  const peek=()=>src[i],eat=c=>{if(src[i]===c){i++;return true}return false};
  const FN={exp:Math.exp,ln:Math.log,log:Math.log10,sqrt:Math.sqrt,sin:Math.sin,cos:Math.cos,tan:Math.tan,abs:Math.abs};
  function prim(){if(eat('(')){const e=ex();if(!eat(')'))throw 0;return e}
    const m=/^(\d+\.?\d*(e[+-]?\d+)?|\.\d+)/.exec(src.slice(i));if(m){i+=m[0].length;const v=+m[0];return()=>v}
    const w=/^[a-z]+/.exec(src.slice(i));if(!w)throw 0;i+=w[0].length;const n=w[0];
    if(n==='x')return x=>x;if(n==='e')return()=>Math.E;if(n==='pi')return()=>Math.PI;
    if(FN[n]){if(!eat('('))throw 0;const a=ex();if(!eat(')'))throw 0;const f=FN[n];return x=>f(a(x))}throw 0}
  function un(){if(eat('-')){const a=un();return x=>-a(x)}if(eat('+'))return un();return pw()}
  function pw(){const a=prim();if(eat('^')){const b=un();return x=>Math.pow(a(x),b(x))}return a}
  function te(){let a=un();for(;;){if(eat('*')){const l=a,r=un();a=x=>l(x)*r(x)}else if(eat('/')){const l=a,r=un();a=x=>l(x)/r(x)}else if(peek()==='('||/[a-z]/.test(peek()||'')){const l=a,r=un();a=x=>l(x)*r(x)}else return a}}
  function ex(){let a=te();for(;;){if(eat('+')){const l=a,r=te();a=x=>l(x)+r(x)}else if(eat('-')){const l=a,r=te();a=x=>l(x)-r(x)}else return a}}
  try{const f=ex();if(i!==src.length)return null;return f}catch(e){return null}}
function graphSVG(d,C){const F=frame(C,{x0:d.x.min,x1:d.x.max,y0:d.y.min,y1:d.y.max,grid:d.grid,noTicks:d.noTicks,xl:d.x.label,yl:d.y.label,title:d.title});let s=F.s;
  const clipId='c'+uid();s+=`<clipPath id="${clipId}"><rect x="${PL}" y="${PT-6}" width="${W-PL-PR+6}" height="${H-PB-PT+6}"/></clipPath><g clip-path="url(#${clipId})">`;
  for(const v of d.vlines||[]){const x=F.X(v.x);s+=`<path d="M${x} ${H-PB}V${PT}" stroke="${C.muted}" stroke-dasharray="5 4"/>`}
  for(const v of d.hlines||[]){const y=F.Y(v.y);s+=`<path d="M${PL} ${y}H${W-PR}" stroke="${C.muted}" stroke-dasharray="5 4"/>`}
  const legend=[];
  d.series.forEach(se=>{const col=C.ser[se.c%6];let P=[];const f=compile(se.fn);
    if(f){for(let k=0;k<=300;k++){const x=d.x.min+(d.x.max-d.x.min)*k/300,y=f(x);if(isFinite(y))P.push([F.X(x),F.Y(Math.max(d.y.min-(d.y.max-d.y.min),Math.min(d.y.max*2+1,y)))]);else if(P.length){s+=`<path d="${smoothPath(P)}" fill="none" stroke="${col}" stroke-width="2.3"/>`;P=[]}}
      if(P.length)s+=`<path d="${P.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('')}" fill="none" stroke="${col}" stroke-width="2.3"${se.dash?' stroke-dasharray="7 5"':''}/>`}
    const pts=se.pts.slice();if(se.mode!=='points'&&se.mode!=='bar')pts.sort((a,b)=>a[0]-b[0]);const Q=pts.map(p=>[F.X(p[0]),F.Y(p[1])]);
    if(Q.length){if(se.mode==='bar'){const bw=Math.max(4,Math.min(40,(W-PL-PR)/Math.max(8,Q.length*1.6)));for(const q of Q)s+=`<rect x="${q[0]-bw/2}" y="${Math.min(q[1],F.Y(Math.max(0,d.y.min)))}" width="${bw}" height="${Math.abs(F.Y(Math.max(0,d.y.min))-q[1])}" fill="${col}" opacity=".85"/>`}
      else{if(se.mode!=='points'&&Q.length>1)s+=`<path d="${se.mode==='smooth'?smoothPath(Q):Q.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join('')}" fill="none" stroke="${col}" stroke-width="2.3"${se.dash?' stroke-dasharray="7 5"':''}/>`;
        if(se.mode==='points'||Q.length===1)for(const q of Q)s+=`<circle cx="${q[0].toFixed(1)}" cy="${q[1].toFixed(1)}" r="4" fill="${col}"/>`}}
    if(se.name)legend.push([se.name,col,se.dash])});
  s+='</g>';
  for(const n of d.notes||[])s+=`<text x="${F.X(n.x).toFixed(1)}" y="${F.Y(n.y).toFixed(1)}" font-size="12.5" fill="${C.ink}">${fmtSVG(n.t)}</text>`;
  for(const v of d.vlines||[])if(v.t)s+=`<text x="${F.X(v.x)+4}" y="${PT+10}" font-size="12" fill="${C.muted}">${fmtSVG(v.t)}</text>`;
  for(const v of d.hlines||[])if(v.t)s+=`<text x="${W-PR-4}" y="${F.Y(v.y)-5}" text-anchor="end" font-size="12" fill="${C.muted}">${fmtSVG(v.t)}</text>`;
  legend.forEach(([n,c,da],i)=>{const y=PT+4+i*18,x=W-PR-150;s+=`<path d="M${x} ${y}h22" stroke="${c}" stroke-width="2.5"${da?' stroke-dasharray="6 4"':''}/><text x="${x+28}" y="${y+4}" font-size="12" fill="${C.ink}">${fmtSVG(n)}</text>`});
  return wrap(s,W,H,C,d.title||'Graph')}

/* ---------------- Lewis structures ---------------- */
const LW=560,LH=320;
function lpSlots(d,a){const ang=[];for(const b of d.bonds){if(b.a!==a.id&&b.b!==a.id)continue;const o=d.atoms.find(x=>x.id===(b.a===a.id?b.b:b.a));if(o)ang.push(Math.atan2(o.y-a.y,o.x-a.x))}
  const cand=[-Math.PI/2,0,Math.PI/2,Math.PI,-Math.PI/4,Math.PI/4,3*Math.PI/4,-3*Math.PI/4];
  const gap=t=>ang.length?Math.min(...ang.map(b=>{let x=Math.abs(t-b)%(2*Math.PI);return x>Math.PI?2*Math.PI-x:x})):Math.PI;
  const n=a.lp+(a.e?1:0);const pick=[];
  const pool=cand.map((t,i)=>({t,g:gap(t),i})).sort((p,q)=>q.g-p.g||p.i-q.i);
  for(const c of pool){if(pick.length>=n)break;if(pick.every(p=>{let x=Math.abs(p-c.t)%(2*Math.PI);x=x>Math.PI?2*Math.PI-x:x;return x>Math.PI/3}))pick.push(c.t)}
  for(const c of pool){if(pick.length>=n)break;if(!pick.includes(c.t))pick.push(c.t)}
  return pick}
function lewisInner(d,C,sel){let s='';const at=id=>d.atoms.find(a=>a.id===id);const R=12;
  for(const b of d.bonds){const p=at(b.a),q=at(b.b);if(!p||!q)continue;const dx=q.x-p.x,dy=q.y-p.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L,nx=-uy,ny=ux;
    const x1=p.x+ux*R,y1=p.y+uy*R,x2=q.x-ux*R,y2=q.y-uy*R;const offs=b.o===1?[0]:b.o===2?[-3.2,3.2]:[-5,0,5];
    if(d.dots){/* dot-and-cross: shared pairs drawn between the atoms */const mx=(p.x+q.x)/2,my=(p.y+q.y)/2;offs.forEach((o,i)=>{const k=b.o===1?0:(i-(b.o-1)/2)*7;
        s+=`<circle cx="${mx+nx*k-ux*3.2}" cy="${my+ny*k-uy*3.2}" r="2.3" fill="${C.ink}"/><text x="${mx+nx*k+ux*3.6}" y="${my+ny*k+uy*3.6+3.2}" text-anchor="middle" font-size="10" font-weight="700" fill="${C.ser[1]}">×</text>`})}
    else{for(const o of offs)s+=`<line x1="${x1+nx*o}" y1="${y1+ny*o}" x2="${x2+nx*o}" y2="${y2+ny*o}" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>`;
      if(b.dat)s+=`<path d="M${x2-ux*7+nx*4} ${y2-uy*7+ny*4}L${x2} ${y2}L${x2-ux*7-nx*4} ${y2-uy*7-ny*4}" fill="none" stroke="${C.ink}" stroke-width="1.8"/>`}}
  for(const a of d.atoms){const on=sel===a.id;
    s+=`<g data-atom="${esc(a.id)}"><circle cx="${a.x}" cy="${a.y}" r="${R+2}" fill="${on?C.band:'transparent'}" stroke="${on?C.ser[0]:'none'}" stroke-width="1.5"/><text x="${a.x}" y="${a.y+6}" text-anchor="middle" font-size="18" font-weight="600" fill="${C.ink}">${esc(a.el)}</text></g>`;
    const sl=lpSlots(d,a);sl.forEach((t,i)=>{const cx=a.x+Math.cos(t)*17,cy=a.y+Math.sin(t)*17,px=-Math.sin(t),py=Math.cos(t);
      if(i<a.lp){s+=`<circle cx="${cx+px*3.4}" cy="${cy+py*3.4}" r="2.2" fill="${C.ink}"/><circle cx="${cx-px*3.4}" cy="${cy-py*3.4}" r="2.2" fill="${C.ink}"/>`}
      else s+=`<circle cx="${cx}" cy="${cy}" r="2.2" fill="${C.ink}"/>`});
    if(a.q){const t=Math.abs(a.q)>1?Math.abs(a.q)+(a.q>0?'+':'−'):a.q>0?'+':'−';s+=`<circle cx="${a.x+15}" cy="${a.y-15}" r="7.5" fill="none" stroke="${C.ink}" stroke-width="1.1"/><text x="${a.x+15}" y="${a.y-11}" text-anchor="middle" font-size="${t.length>1?9:12}" fill="${C.ink}">${t}</text>`}}
  return s}
function lewisBox(d){if(!d.atoms.length)return[0,0,LW,LH];let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;for(const a of d.atoms){x0=Math.min(x0,a.x);y0=Math.min(y0,a.y);x1=Math.max(x1,a.x);y1=Math.max(y1,a.y)}const p=34;return[x0-p,y0-p,x1-x0+2*p,y1-y0+2*p]}
function lewisSVG(d,C){if(!d.atoms.length)return wrap(`<text x="${LW/2}" y="${LH/2}" text-anchor="middle" fill="${C.muted}" font-size="14">Empty Lewis structure</text>`,LW,LH,C,'Empty Lewis structure');
  let[x,y,w,h]=lewisBox(d);let s=lewisInner(d,C,null);
  if(d.br){const t=d.br.replace(/-/g,'−');s+=`<path d="M${x+10} ${y+4}h-6v${h-8}h6M${x+w-10} ${y+4}h6v${h-8}h-6" fill="none" stroke="${C.ink}" stroke-width="1.8"/><text x="${x+w+4}" y="${y+12}" font-size="14" fill="${C.ink}">${esc(t)}</text>`;w+=22}
  const sc=Math.min(1.6,Math.max(1,180/h));return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${Math.round(w*sc)}" height="${Math.round(h*sc)}" role="img" aria-label="Lewis structure" font-family="Inter,Segoe UI,system-ui,sans-serif" class="dg-svg">${C.bg!=='none'?`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.bg}"/>`:''}${s}</svg>`}

/* ---------------- tables ---------------- */
function tableHTML(d,print){const st=print?' style="border-collapse:collapse;font:14px/1.4 Inter,Segoe UI,sans-serif;color:#151515"':'';const td=print?' style="border:1px solid #b8b8b8;padding:6px 10px"':'';const th=print?' style="border:1px solid #b8b8b8;padding:6px 10px;background:#f0f0f0;text-align:left"':'';
  return`<table class="dg-table"${st}>${d.cap?`<caption>${fmtHTML(d.cap)}</caption>`:''}<tbody>${d.rows.map((r,i)=>`<tr>${r.map(c=>i===0&&d.head?`<th${th}>${fmtHTML(c)}</th>`:`<td${td}>${fmtHTML(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`}
function tableSVG(d,C){const cw=d.rows[0].map((_,j)=>Math.max(60,Math.min(220,10+7.6*Math.max(...d.rows.map(r=>plainTxt(r[j]).length))))),rh=30,top=d.cap?26:2;
  const w=cw.reduce((a,b)=>a+b,0)+2,h=top+rh*d.rows.length+2;let s='';if(d.cap)s+=`<text x="${w/2}" y="17" text-anchor="middle" font-size="13" font-style="italic" fill="${C.muted}">${fmtSVG(d.cap)}</text>`;
  d.rows.forEach((r,i)=>{let x=1;r.forEach((c,j)=>{const y=top+i*rh;s+=`<rect x="${x}" y="${y}" width="${cw[j]}" height="${rh}" fill="${i===0&&d.head?(C.bg==='none'?C.band:'#f0f0f0'):'none'}" stroke="${C.line}"/><text x="${x+8}" y="${y+19.5}" font-size="13" font-weight="${i===0&&d.head?600:400}" fill="${C.ink}">${fmtSVG(c)}</text>`;x+=cw[j]})});
  return wrap(s,w,h,C,d.cap||'Table')}

/* ---------------- public render ---------------- */
function svg(d,o){o=o||{};const C=o.print?PRT:SCR;if(!d||!KINDS.includes(d.k))return'';
  try{return d.k==='titration'?titrationSVG(d,C):d.k==='graph'?graphSVG(d,C):d.k==='lewis'?lewisSVG(d,C):tableSVG(d,C)}catch(e){return''}}
function html(d){if(!d||!KINDS.includes(d.k))return'';if(d.k==='table')return`<div class="dg-fig dg-fig-table">${tableHTML(clean(d))}</div>`;return`<div class="dg-fig">${svg(clean(d))}</div>`}
async function canvas(d,scale){const s=svg(d,{print:true});if(!s)return null;scale=scale||2;
  const m=/width="(\d+)" height="(\d+)"/.exec(s);const w=+m[1],h=+m[2];const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(s);
  await img.decode().catch(()=>{});const c=document.createElement('canvas');c.width=w*scale;c.height=h*scale;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);c.dataset.w=w;c.dataset.h=h;return c}
function text(d){if(!d)return'';if(d.k==='table')return[d.cap,...d.rows.flat()].map(plainTxt).join(' ');if(d.k==='graph')return[d.title,d.x.label,d.y.label,...d.series.map(s=>s.name),...(d.notes||[]).map(n=>n.t)].map(plainTxt).join(' ');
  if(d.k==='titration')return(d.title||'')+' titration curve '+tiName(d);if(d.k==='lewis')return'Lewis structure '+d.atoms.map(a=>a.el).join(' ');return''}

/* ---------------- marking drawn answers ---------------- */
const normCell=s=>plainTxt(s).toLowerCase().replace(/[−–]/g,'-').replace(/[₀-₉]/g,c=>'0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(c)]).replace(/[⁰¹²³⁴-⁹]/g,c=>({'⁰':0,'¹':1,'²':2,'³':3,'⁴':4,'⁵':5,'⁶':6,'⁷':7,'⁸':8,'⁹':9})[c]).replace(/[\s.]+$/,'').replace(/\s+/g,'');
function lewisSig(d){const deg={};for(const a of d.atoms)deg[a.id]=0;for(const b of d.bonds){deg[b.a]+=b.o;deg[b.b]+=b.o}
  const at=d.atoms.map(a=>`${a.el.toLowerCase()}|${deg[a.id]}|${a.lp}|${a.e}|${a.q}`).sort();
  const el=id=>(d.atoms.find(a=>a.id===id)||{}).el.toLowerCase();const bd=d.bonds.map(b=>[el(b.a),el(b.b)].sort().join('-')+b.o).sort();
  const q=d.atoms.reduce((s,a)=>s+a.q,0);return{at,bd,q}}
function checkOne(m,a,start){m=clean(m);a=clean(a);
  if(m.k!==a.k)return{auto:true,ok:false,msg:'This answer is a different kind of diagram.'};
  if(m.k==='lewis'){if(!a.atoms.length)return{auto:true,ok:false,msg:'Draw the structure first.'};const M=lewisSig(m),A=lewisSig(a);
    const elM=m.atoms.map(x=>x.el.toLowerCase()).sort().join(),elA=a.atoms.map(x=>x.el.toLowerCase()).sort().join();
    if(elM!==elA)return{auto:true,ok:false,msg:'Check the atoms: the structure needs '+m.atoms.map(x=>x.el).sort().join(', ')+'.'};
    if(M.bd.join()!==A.bd.join())return{auto:true,ok:false,msg:'The atoms are right, but some bonds are missing, extra or of the wrong order.'};
    const lpM=m.atoms.reduce((s,x)=>s+x.lp,0),lpA=a.atoms.reduce((s,x)=>s+x.lp,0);
    if(lpM!==lpA)return{auto:true,ok:false,msg:`The bonds are right. Count the lone pairs: there should be ${lpM} in total and you have ${lpA}.`};
    if(M.at.join()!==A.at.join())return{auto:true,ok:false,msg:M.q!==A.q?'Bonds and lone pairs total up, but the charges are wrong.':'Bonds are right, but a lone pair or charge is on the wrong atom.'};
    if(m.br&&m.br.replace('−','-')!==a.br.replace('−','-')&&M.q!==0&&!a.atoms.some(x=>x.q))return{auto:true,ok:false,msg:'Show the overall charge of the ion.'};
    return{auto:true,ok:true,msg:'Atoms, bonds, lone pairs and charges all match.'}}
  if(m.k==='table'){const S=start&&start.k==='table'?clean(start):null;let n=0,bad=0;
    m.rows.forEach((r,i)=>r.forEach((c,j)=>{if(!c||c==='*')return;if(S&&S.rows[i]&&S.rows[i][j])return;n++;const got=normCell((a.rows[i]||[])[j]);if(!c.split('|').some(alt=>normCell(alt)===got))bad++}));
    return{auto:true,ok:n>0&&!bad,msg:!n?'':bad?`${bad} of ${n} cells don’t match the model answer.`:`All ${n} cells match.`}}
  if(m.k==='titration'){const e=[];if(m.flask!==a.flask)e.push(`the flask should hold the ${m.flask}`);if(m.acid!==a.acid)e.push(`the acid is ${m.acid}`);if(m.base!==a.base)e.push(`the base is ${m.base}`);
    if(m.acid==='weak'&&a.acid==='weak'){if(m.pka.length!==a.pka.length)e.push(`the acid has ${m.pka.length} acidic proton${m.pka.length>1?'s':''}`);else if(m.pka.some((p,i)=>Math.abs(p-a.pka[i])>.35))e.push('check the pKa value')}
    if(!e.length){const vm=tiInfo(m).eq.slice(-1)[0],va=tiInfo(a).eq.slice(-1)[0];if(Math.abs(vm-va)>Math.max(.5,.04*vm))e.push(`the equivalence point should be at ${r2(vm)} cm³, not ${r2(va)} cm³`)}
    return{auto:true,ok:!e.length,msg:e.length?'Not yet: '+e.join('; ')+'.':'Right shape, right equivalence point.'}}
  return{auto:false,ok:false,msg:'Compare your graph with the model answer.'}}
function check(model,ans,start){const ms=Array.isArray(model)?model:[model];let first=null;for(const m of ms){const r=checkOne(m,ans,start);if(r.ok)return r;if(!first)first=r}return first}

/* ---------------- editors ---------------- */
const field=(lab,inner,cls)=>`<label class="dg-f${cls?' '+cls:''}"><span>${lab}</span>${inner}</label>`;
const sel=(name,val,opts)=>`<select data-f="${name}">${opts.map(([v,t])=>`<option value="${v}"${String(v)===String(val)?' selected':''}>${esc(t)}</option>`).join('')}</select>`;
const inp=(name,val,type,extra)=>`<input data-f="${name}" type="${type||'text'}" value="${esc(val)}"${extra||''}>`;

function editor(host,d,onChange,opt){opt=opt||{};const E={d,host,sel:null,tool:'atom',el:'C',ser:0};
  const save=()=>{onChange&&onChange(E.d)};
  host.classList.add('dg-ed');
  function setKind(k){const keep=E.d;for(const x of Object.keys(keep))delete keep[x];Object.assign(keep,empty(k));E.sel=null;draw();save()}
  function draw(){const d=E.d;
    if(!KINDS.includes(d.k)){host.innerHTML=`<div class="dg-pick"><p>What would you like to add?</p><div>${KINDS.map(k=>`<button class="btn" data-kind="${k}">${NAMES[k]}</button>`).join('')}</div></div>`;return}
    const tabs=opt.lock?'':`<div class="dg-tabs" role="tablist">${KINDS.map(k=>`<button role="tab" aria-selected="${k===d.k}" class="${k===d.k?'on':''}" data-kind="${k}">${NAMES[k]}</button>`).join('')}</div>`;
    host.innerHTML=tabs+`<div class="dg-bar">${bar(d)}</div><div class="dg-view" data-view></div>${foot(d)}`;view()}
  function view(){const v=host.querySelector('[data-view]');if(!v)return;const d=E.d;
    if(d.k==='lewis'){v.innerHTML=`<svg class="dg-svg dg-lw" viewBox="0 0 ${LW} ${LH}" data-lw>${gridDots()}${lewisInner(d,SCR,E.sel)}${d.br?`<text x="${LW-24}" y="22" font-size="14" fill="var(--ink)">[ ]${esc(d.br.replace(/-/g,'−'))}</text>`:''}</svg>`;return}
    if(d.k==='table'){v.innerHTML=`<div class="dg-tw"><table class="dg-table dg-tedit"><tbody>${d.rows.map((r,i)=>`<tr>${r.map((c,j)=>`<td class="${i===0&&d.head?'h':''}"><input data-cell="${i},${j}" value="${esc(c)}" aria-label="Row ${i+1}, column ${j+1}"${opt.fixed&&opt.fixed(i,j)?' readonly class="fx"':''}></td>`).join('')}</tr>`).join('')}</tbody></table></div>${opt.lock?'':`<div class="dg-prev">${/[_^]/.test(d.rows.flat().join('')+d.cap)?tableHTML(d):''}</div>`}`;return}
    v.innerHTML=svg(d)}
  const gridDots=()=>{let s='';for(let x=20;x<LW;x+=20)for(let y=20;y<LH;y+=20)s+=`<circle cx="${x}" cy="${y}" r=".9" fill="var(--line)"/>`;return s};
  function bar(d){
    if(d.k==='titration')return field('In the flask',sel('flask',d.flask,[['acid','Acid (base from burette)'],['base','Base (acid from burette)']]))+
      field('Acid',sel('acid',d.acid,[['strong','Strong'],['weak','Weak']]))+(d.acid==='weak'?field('pK<sub>a</sub> values',inp('pka',d.pka.join(', '),'text',' inputmode="decimal" placeholder="4.76"'),'sm'):'')+
      field('Base',sel('base',d.base,[['strong','Strong'],['weak','Weak']]))+(d.base==='weak'?field('pK<sub>b</sub>',inp('pkb',d.pkb,'number',' step="0.01"'),'xs'):'')+
      field('Acid / mol dm⁻³',inp('ca',d.ca,'number',' step="0.01" min="0"'),'xs')+field('Base / mol dm⁻³',inp('cb',d.cb,'number',' step="0.01" min="0"'),'xs')+field('Flask volume / cm³',inp('vf',d.vf,'number',' step="1" min="1"'),'xs')+
      field('Indicator',sel('ind',d.ind,[['none','None'],['pp','Phenolphthalein'],['mo','Methyl orange'],['mr','Methyl red'],['btb','Bromothymol blue'],['tb','Thymol blue']]))+
      (opt.lock?'':field('Title',inp('title',d.title,'text',' placeholder="Optional"'),'md'))+`<label class="dg-chk"><input type="checkbox" data-f="marks"${d.marks?' checked':''}> Label key points</label>`;
    if(d.k==='graph'){const s=d.series[E.ser]||d.series[0];
      return`${opt.lock?'':`<div class="dg-row">${field('Start from',sel('preset','',[['','Choose…'],...Object.entries(GRAPH_PRESETS).map(([k,v])=>[k,v[0]])]))}${field('Title',inp('title',d.title),'md')}</div>`}
      <div class="dg-row">${field('x-axis label',inp('x.label',d.x.label),'md')}${field('from',inp('x.min',d.x.min,'number',' step="any"'),'xs')}${field('to',inp('x.max',d.x.max,'number',' step="any"'),'xs')}
      ${field('y-axis label',inp('y.label',d.y.label),'md')}${field('from',inp('y.min',d.y.min,'number',' step="any"'),'xs')}${field('to',inp('y.max',d.y.max,'number',' step="any"'),'xs')}
      <label class="dg-chk"><input type="checkbox" data-f="grid"${d.grid?' checked':''}> Grid</label><label class="dg-chk"><input type="checkbox" data-f="ticks"${d.noTicks?'':' checked'}> Numbers</label></div>
      <div class="dg-row dg-sers">${d.series.map((x,i)=>`<button class="dg-chip${i===E.ser?' on':''}" data-ser="${i}"><i style="background:${SCR.ser[x.c%6]}"></i>${esc(x.name||'Line '+(i+1))}</button>`).join('')}${d.series.length<6?'<button class="dg-chip" data-act="addser">+ Line</button>':''}</div>
      ${s?`<div class="dg-row">${field('Name',inp('s.name',s.name),'sm')}${field('Style',sel('s.mode',s.mode,[['smooth','Smooth curve'],['line','Straight lines'],['points','Points only'],['bar','Bars']]))}${field('Colour',sel('s.c',s.c,[[0,'Blue'],[1,'Orange'],[2,'Red'],[3,'Green'],[4,'Purple'],[5,'Teal']]))}
       <label class="dg-chk"><input type="checkbox" data-f="s.dash"${s.dash?' checked':''}> Dashed</label>${field('or a formula, y =',inp('s.fn',s.fn,'text',' placeholder="e.g. exp(-0.1*x)" spellcheck="false"'),'md')}${d.series.length>1?'<button class="linkbtn" data-act="delser">Remove line</button>':''}</div>
       <p class="dg-hint">Click the graph to add a point to this line; click a point to remove it. ${s.pts.length?`<button class="linkbtn" data-act="clrpts">Clear ${s.pts.length} point${s.pts.length>1?'s':''}</button>`:''}</p>`:''}`}
    if(d.k==='lewis'){const els=['H','C','N','O','F','Cl','Br','I','S','P','B','Be','Al','Si','Xe','Na'];const T=[['atom','Atom'],['bond','Bond'],['pair','Lone pair'],['elec','Single electron'],['charge','Charge'],['move','Move'],['erase','Erase']];
      return`<div class="dg-row dg-tools" role="toolbar">${T.map(([k,t])=>`<button class="dg-chip${E.tool===k?' on':''}" data-tool="${k}">${t}</button>`).join('')}</div>
      ${E.tool==='atom'?`<div class="dg-row dg-els">${els.map(x=>`<button class="dg-el${E.el===x?' on':''}" data-el="${x}">${x}</button>`).join('')}<input class="dg-elx" data-f="elx" maxlength="2" placeholder="Other" aria-label="Other element symbol"></div>`:''}
      <div class="dg-row">${opt.lock?'':field('Start from',sel('lpre','',[['','Choose…'],...Object.entries(LEWIS_PRESETS).map(([k,v])=>[k,plainTxt(v[0])])]))}${field('Ion in brackets, charge',inp('br',d.br,'text',' placeholder="e.g. 2- or +" maxlength="3"'),'xs')}<label class="dg-chk"><input type="checkbox" data-f="dots"${d.dots?' checked':''}> Dot-and-cross</label>${d.atoms.length?'<button class="linkbtn" data-act="clrlw">Clear</button>':''}</div>
      <p class="dg-hint">${{atom:'Click the grid to place an atom; click an atom to change it to the selected element.',bond:'Click two atoms to join them. Click a bond again to make it double, then triple, then single.',pair:'Click an atom to add a lone pair (up to 4, then back to none).',elec:'Click an atom to add or remove an unpaired electron.',charge:'Click an atom to cycle its formal charge: +, −, 2+, 2−, none.',move:'Drag atoms to move them.',erase:'Click an atom or bond to delete it.'}[E.tool]}</p>`}
    if(d.k==='table')return`${opt.lock?'':field('Caption',inp('cap',d.cap,'text',' placeholder="Optional"'),'md')}${opt.lock?'':`<label class="dg-chk"><input type="checkbox" data-f="head"${d.head?' checked':''}> Header row</label>
      <button class="dg-chip" data-act="addrow">+ Row</button><button class="dg-chip" data-act="addcol">+ Column</button>${d.rows.length>1?'<button class="dg-chip" data-act="delrow">− Row</button>':''}${d.rows[0].length>1?'<button class="dg-chip" data-act="delcol">− Column</button>':''}`}
      <p class="dg-hint">Type H_2O for H₂O and SO_4^{2-} for SO₄²⁻.</p>`;
    return''}
  const foot=d=>d.k==='graph'&&!opt.lock?`<details class="dg-pts"><summary>Edit points as numbers</summary><textarea data-f="s.pts" rows="4" spellcheck="false" placeholder="x, y on each line">${esc(((d.series[E.ser]||{}).pts||[]).map(p=>p.join(', ')).join('\n'))}</textarea></details>`:'';

  host.addEventListener('click',e=>{const t=e.target;const d=E.d;
    const k=t.closest('[data-kind]');if(k){if(k.dataset.kind===d.k)return;const has=d.k==='lewis'?d.atoms.length:d.k==='graph'?d.series.some(s=>s.pts.length||s.fn):d.k==='table'?d.rows.flat().some(Boolean):d.k==='titration';
      if(has&&!confirm('Switch to a '+NAMES[k.dataset.kind].toLowerCase()+'? This diagram will be cleared.'))return;return setKind(k.dataset.kind)}
    const s=t.closest('[data-ser]');if(s){E.ser=+s.dataset.ser;return draw()}
    const tl=t.closest('[data-tool]');if(tl){E.tool=tl.dataset.tool;E.sel=null;E.pend=null;return draw()}
    const el=t.closest('[data-el]');if(el){E.el=el.dataset.el;return draw()}
    const a=t.closest('[data-act]');if(a){const act=a.dataset.act;
      if(act==='addser'){d.series.push({id:uid(),name:'',mode:'smooth',fn:'',pts:[],c:d.series.length%6});E.ser=d.series.length-1}
      if(act==='delser'){d.series.splice(E.ser,1);E.ser=0}
      if(act==='clrpts')d.series[E.ser].pts=[];
      if(act==='clrlw'){d.atoms=[];d.bonds=[];E.sel=null}
      if(act==='addrow')d.rows.push(d.rows[0].map(()=>''));if(act==='delrow')d.rows.pop();
      if(act==='addcol')d.rows.forEach(r=>r.push(''));if(act==='delcol')d.rows.forEach(r=>r.pop());
      draw();return save()}
    if(d.k==='graph'){const sv=t.closest('svg');if(!sv||!host.querySelector('[data-view]').contains(sv))return;const se=d.series[E.ser];if(!se)return;
      const P=pt(sv,e),F=frame(SCR,{x0:d.x.min,x1:d.x.max,y0:d.y.min,y1:d.y.max,noTicks:true,xl:'',yl:''});
      const hit=se.pts.findIndex(p=>Math.hypot(F.X(p[0])-P.x,F.Y(p[1])-P.y)<9);
      if(hit>=0)se.pts.splice(hit,1);else{if(P.x<PL||P.x>W-PR||P.y<PT||P.y>H-PB)return;const sx=(d.x.max-d.x.min)/200,sy=(d.y.max-d.y.min)/200;
        const x=d.x.min+(P.x-PL)/(W-PL-PR)*(d.x.max-d.x.min),y=d.y.min+(H-PB-P.y)/(H-PT-PB)*(d.y.max-d.y.min);se.pts.push([r2(Math.round(x/sx)*sx),r2(Math.round(y/sy)*sy)])}
      view();const ta=host.querySelector('[data-f="s.pts"]');if(ta)ta.value=se.pts.map(p=>p.join(', ')).join('\n');save()}});
  const pt=(sv,e)=>{const r=sv.getBoundingClientRect(),vb=sv.viewBox.baseVal;return{x:vb.x+(e.clientX-r.left)/r.width*vb.width,y:vb.y+(e.clientY-r.top)/r.height*vb.height}};

  /* Lewis canvas: pointer events so it works with a finger, mouse or pen */
  host.addEventListener('pointerdown',e=>{const d=E.d;if(d.k!=='lewis')return;const sv=e.target.closest('[data-lw]');if(!sv)return;e.preventDefault();
    const P=pt(sv,e),snap=v=>Math.round(v/20)*20;const near=d.atoms.find(a=>Math.hypot(a.x-P.x,a.y-P.y)<16);
    const nearBond=()=>d.bonds.find(b=>{const p=d.atoms.find(a=>a.id===b.a),q=d.atoms.find(a=>a.id===b.b);if(!p||!q)return false;const dx=q.x-p.x,dy=q.y-p.y,L2=dx*dx+dy*dy||1;let u=((P.x-p.x)*dx+(P.y-p.y)*dy)/L2;if(u<.15||u>.85)return false;return Math.hypot(p.x+u*dx-P.x,p.y+u*dy-P.y)<8});
    const T=E.tool;let changed=false;
    if(T==='atom'){if(near){near.el=E.el;changed=true}else{const x=Math.min(LW-20,Math.max(20,snap(P.x))),y=Math.min(LH-20,Math.max(20,snap(P.y)));if(!d.atoms.some(a=>a.x===x&&a.y===y)){const n={id:uid(),el:E.el,x,y,lp:0,e:0,q:0};
          /* new atom next to the selected one gets bonded to it */if(E.sel){const s=d.atoms.find(a=>a.id===E.sel);if(s&&Math.hypot(s.x-x,s.y-y)<90)d.bonds.push({a:s.id,b:n.id,o:1})}d.atoms.push(n);E.sel=n.id;changed=true}}}
    else if(T==='bond'){if(near){if(!E.sel||E.sel===near.id)E.sel=E.sel===near.id?null:near.id;else{const b=d.bonds.find(b=>(b.a===E.sel&&b.b===near.id)||(b.b===E.sel&&b.a===near.id));if(b)b.o=b.o%3+1;else d.bonds.push({a:E.sel,b:near.id,o:1});E.sel=null;changed=true}}
      else{const b=nearBond();if(b){b.o=b.o%3+1;changed=true}else E.sel=null}}
    else if(T==='pair'&&near){near.lp=(near.lp+1)%5;changed=true}
    else if(T==='elec'&&near){near.e=near.e?0:1;changed=true}
    else if(T==='charge'&&near){const cyc=[0,1,-1,2,-2];near.q=cyc[(cyc.indexOf(near.q)+1)%cyc.length];changed=true}
    else if(T==='erase'){if(near){d.atoms=d.atoms.filter(a=>a!==near);d.bonds=d.bonds.filter(b=>b.a!==near.id&&b.b!==near.id);changed=true}else{const b=nearBond();if(b){d.bonds=d.bonds.filter(x=>x!==b);changed=true}}}
    else if(T==='move'&&near){E.drag=near;sv.setPointerCapture(e.pointerId)}
    view();if(changed)save()});
  host.addEventListener('pointermove',e=>{if(!E.drag)return;const sv=host.querySelector('[data-lw]');if(!sv)return;const P=pt(sv,e);E.drag.x=Math.min(LW-14,Math.max(14,Math.round(P.x/10)*10));E.drag.y=Math.min(LH-14,Math.max(14,Math.round(P.y/10)*10));view()});
  host.addEventListener('pointerup',()=>{if(E.drag){E.drag=null;save()}});

  host.addEventListener('input',e=>{const t=e.target,d=E.d;
    if(t.dataset.cell){const[i,j]=t.dataset.cell.split(',').map(Number);d.rows[i][j]=t.value.slice(0,200);const p=host.querySelector('.dg-prev');if(p)p.innerHTML=/[_^]/.test(d.rows.flat().join('')+d.cap)?tableHTML(d):'';return save()}
    const f=t.dataset.f;if(!f)return;const v=t.type==='checkbox'?t.checked:t.value;const s=d.series&&d.series[E.ser];
    if(f==='preset'){if(!v)return;const keep=E.d;const nd=GRAPH_PRESETS[v][1]();for(const x of Object.keys(keep))delete keep[x];Object.assign(keep,nd);E.ser=0;draw();return save()}
    if(f==='lpre'){if(!v)return;const nd=LEWIS_PRESETS[v][1]();d.atoms=nd.atoms;d.bonds=nd.bonds;d.br=nd.br;E.sel=null;draw();return save()}
    if(f==='elx'){const x=v.replace(/[^A-Za-z]/g,'');if(x){E.el=x[0].toUpperCase()+x.slice(1).toLowerCase()}return}
    if(f==='pka'){const a=v.split(/[,;\s]+/).map(Number).filter(x=>isFinite(x)&&String(x)!=='').slice(0,3);if(!a.length)return;d.pka=a}
    else if(f==='marks'||f==='grid'||f==='dots'||f==='head')d[f]=!!v;
    else if(f==='ticks')d.noTicks=!v;
    else if(/^[xy]\./.test(f)){const[ax,key]=f.split('.');d[ax][key]=key==='label'?v:+v;if(key!=='label'&&!(d[ax].max>d[ax].min))return}
    else if(f==='s.pts'&&s){s.pts=v.split('\n').map(l=>l.split(/[,;\t ]+/).filter(Boolean).map(Number)).filter(p=>p.length>=2&&isFinite(p[0])&&isFinite(p[1])).map(p=>[p[0],p[1]]).slice(0,400)}
    else if(f.startsWith('s.')&&s){const key=f.slice(2);s[key]=key==='c'?+v:key==='dash'?!!v:v;if(key==='name'||key==='c'){const c=host.querySelector(`[data-ser="${E.ser}"]`);if(c)c.innerHTML=`<i style="background:${SCR.ser[s.c%6]}"></i>${esc(s.name||'Line '+(E.ser+1))}`}}
    else if(['ca','cb','vf','pkb'].includes(f)){if(!(+v>0)&&f!=='pkb')return;d[f]=+v}
    else d[f]=v;
    if(t.tagName==='SELECT'&&['flask','acid','base','s.mode'].includes(f)||f==='marks'){draw()}else view();save()});
  draw();
  return{redraw:draw,get data(){return E.d}}}

window.BL_DIAG={KINDS,NAMES,is:d=>!!d&&KINDS.includes(d.k),empty,clean,svg,html,canvas,editor,check,text,label:k=>NAMES[k]||'Diagram',fmtHTML,tiPH,tiInfo};
})();
