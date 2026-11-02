(()=>{'use strict';
const W=720, L=30, FS=13, LS_KEY='bondline.notes.v1';
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-3);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const f=n=>Math.round(n*100)/100;
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const angDiff=(a,b)=>{let x=Math.abs(a-b)%(2*Math.PI);return x>Math.PI?2*Math.PI-x:x};
function segDist(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,l2=dx*dx+dy*dy||1;let t=((p.x-a.x)*dx+(p.y-a.y)*dy)/l2;t=Math.max(0,Math.min(1,t));return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy))}
function toward(a,b,r){const l=dist(a,b)||1;return{x:a.x+(b.x-a.x)/l*r,y:a.y+(b.y-a.y)/l*r}}
function qpt(s,c,t,u){const v=1-u;return{x:v*v*s.x+2*v*u*c.x+u*u*t.x,y:v*v*s.y+2*v*u*c.y+u*u*t.y}}

/* ---------- chemistry text ---------- */
function chemSegs(s){
  const out=[];const push=(t,k)=>{const l=out[out.length-1];if(l&&l.k===k)l.t+=t;else out.push({t,k})};
  for(let i=0;i<s.length;i++){
    const ch=s[i],prev=s[i-1],next=s[i+1];
    if(/\d/.test(ch)&&prev&&/[A-Za-z\)\]]/.test(prev)&&(out.length&&out[out.length-1].k!=='sup')){push(ch,'sub');continue}
    if(/\d/.test(ch)&&out.length&&out[out.length-1].k==='sub'&&/\d/.test(prev)){push(ch,'sub');continue}
    if(/[+\-−]/.test(ch)&&prev&&/[A-Za-z0-9\)\]]/.test(prev)&&(next===undefined||/[\s,;\)]/.test(next))){push(ch==='-'?'−':ch,'sup');continue}
    push(ch,'');
  }
  return out;
}
function segsSVG(segs,fs){let o='',cur=0;for(const g of segs){const tg=g.k==='sub'?fs*.3:g.k==='sup'?-fs*.42:0;const dy=tg-cur;cur=tg;o+=`<tspan${dy?` dy="${f(dy)}"`:''}${g.k?` style="font-size:${f(fs*.72)}px"`:''}>${esc(g.t)}</tspan>`}return o}
function textW(t,fs){let w=0;for(const g of chemSegs(t||''))for(const c of g.t){const k=g.k?.72:1;w+=fs*k*(/[A-Z]/.test(c)?(c==='I'?.3:/[MW]/.test(c)?.82:.67):/[a-z]/.test(c)?(/[ilj]/.test(c)?.24:/[mw]/.test(c)?.78:.52):/\d/.test(c)?.56:c===' '?.28:.55)}return w}

/* ---------- model ---------- */
const VAL={C:4,Si:4,N:3,P:3,B:3,O:2,S:2,F:1,Cl:1,Br:1,I:1,H:1};
function emptyScheme(h=240){return{h,atoms:[],bonds:[],arrows:[],curls:[],texts:[]}}
function cleanScheme(d){const num=v=>Number.isFinite(+v)?Math.max(-5000,Math.min(5000,+v)):0,str=(v,n)=>String(v==null?'':v).slice(0,n),ids=new Set();
  d.atoms=(Array.isArray(d.atoms)?d.atoms:[]).slice(0,2000).filter(a=>a&&a.id!=null).map(a=>{const o={id:str(a.id,40),x:num(a.x),y:num(a.y),el:str(a.el||'C',16).replace(/[<>"&]/g,'')||'C'};if(a.charge)o.charge=Math.max(-4,Math.min(4,Math.round(+a.charge)||0));if(a.lp)o.lp=Math.max(0,Math.min(3,Math.round(+a.lp)||0));if(a.show)o.show=true;ids.add(o.id);return o});
  d.bonds=(Array.isArray(d.bonds)?d.bonds:[]).slice(0,4000).filter(b=>b&&ids.has(String(b.a))&&ids.has(String(b.b))).map(b=>{const o={id:str(b.id,40),a:String(b.a),b:String(b.b),order:[1,2,3].includes(+b.order)?+b.order:1};if(b.stereo==='wedge'||b.stereo==='hash')o.stereo=b.stereo;return o});
  d.texts=(Array.isArray(d.texts)?d.texts:[]).slice(0,500).map(t=>({id:str(t.id,40),x:num(t.x),y:num(t.y),text:str(t.text,300)}));
  d.arrows=(Array.isArray(d.arrows)?d.arrows:[]).slice(0,200).map(a=>({id:str(a.id,40),kind:['arr','eq','res','retro'].includes(a.kind)?a.kind:'arr',x1:num(a.x1),y1:num(a.y1),x2:num(a.x2),y2:num(a.y2),above:str(a.above,200),below:str(a.below,200)}));
  d.curls=(Array.isArray(d.curls)?d.curls:[]).slice(0,300).filter(c=>c&&c.from&&c.to);
  return d}
function normScheme(d){d=cleanScheme(d||{});d.h=Math.max(120,Math.min(1200,+d.h||240));for(const k of['atoms','bonds','arrows','curls','texts'])if(!Array.isArray(d[k]))d[k]=[];return d}
const getAtom=(d,id)=>d.atoms.find(a=>a.id===id);
const bondsOf=(d,id)=>d.bonds.filter(b=>b.a===id||b.b===id);
const other=(b,id)=>b.a===id?b.b:b.a;
const nbrs=(d,id)=>bondsOf(d,id).map(b=>getAtom(d,other(b,id))).filter(Boolean);
const findBond=(d,a,b)=>d.bonds.find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a));
function addAtom(d,x,y,el='C'){const a={id:uid(),x:f(x),y:f(y),el};d.atoms.push(a);return a}
function addBond(d,a,b,order=1,stereo=null){if(!a||!b||a.id===b.id)return null;let bd=findBond(d,a.id,b.id);if(bd)return bd;bd={id:uid(),a:a.id,b:b.id,order};if(stereo)bd.stereo=stereo;d.bonds.push(bd);return bd}
function atomNear(d,p,r=9,excl){let best=null,bd=r;for(const a of d.atoms){if(a.id===excl)continue;const q=dist(a,p);if(q<bd){bd=q;best=a}}return best}
function blocked(d,a,ang){const p={x:a.x+L*Math.cos(ang),y:a.y+L*Math.sin(ang)};return d.atoms.some(o=>o.id!==a.id&&dist(o,p)<10)}
function bestAngle(d,a){
  const nb=nbrs(d,a.id);
  if(!nb.length)return -Math.PI/6;
  if(nb.length===1){
    const n=nb[0],th=Math.atan2(a.y-n.y,a.x-n.x),vy=a.y-n.y,c1=th+Math.PI/3,c2=th-Math.PI/3;
    const pick=Math.abs(vy)<.5?(Math.sin(c1)<0?c1:c2):(Math.sign(Math.sin(c1))!==Math.sign(vy)?c1:c2);
    const alt=pick===c1?c2:c1;
    if(!blocked(d,a,pick))return pick;if(!blocked(d,a,alt))return alt;return pick;
  }
  const occ=nb.map(n=>Math.atan2(n.y-a.y,n.x-a.x));let best=0,sc=-9;
  for(let k=0;k<12;k++){const ang=k*Math.PI/6;let m=Math.min(...occ.map(o=>angDiff(o,ang)));if(blocked(d,a,ang))m-=1;if(m>sc+1e-6){sc=m;best=ang}}
  return best;
}
function addRing(d,n,arom,at){
  const step=2*Math.PI/n;let R=L/(2*Math.sin(Math.PI/n)),cx,cy,start,dir=1,fixed=[];
  if(at.bond){
    const A=getAtom(d,at.bond.a),B=getAtom(d,at.bond.b),len=dist(A,B)||1,mx=(A.x+B.x)/2,my=(A.y+B.y)/2,ux=(B.x-A.x)/len,uy=(B.y-A.y)/len,nx=-uy,ny=ux;
    let s=0;for(const q of[...nbrs(d,A.id),...nbrs(d,B.id)]){if(q.id===A.id||q.id===B.id)continue;s+=Math.sign((q.x-mx)*nx+(q.y-my)*ny)}
    const side=s>0?-1:1,ap=len/(2*Math.tan(Math.PI/n));R=len/(2*Math.sin(Math.PI/n));
    cx=mx+nx*ap*side;cy=my+ny*ap*side;start=Math.atan2(A.y-cy,A.x-cx);
    dir=Math.sin(Math.atan2(B.y-cy,B.x-cx)-start)>0?1:-1;fixed=[A,B];
  }else if(at.atom){const A=at.atom,ang=bestAngle(d,A);cx=A.x+R*Math.cos(ang);cy=A.y+R*Math.sin(ang);start=ang+Math.PI;fixed=[A]}
  else{cx=at.x;cy=at.y;start=n===4?-3*Math.PI/4:-Math.PI/2}
  const vs=[];
  for(let i=0;i<n;i++){if(fixed[i]){vs.push(fixed[i]);continue}const ang=start+dir*i*step,p={x:cx+R*Math.cos(ang),y:cy+R*Math.sin(ang)};vs.push(atomNear(d,p,7)||addAtom(d,p.x,p.y))}
  const rb=[];for(let i=0;i<n;i++)rb.push(addBond(d,vs[i],vs[(i+1)%n]));
  if(arom){const hasD=a=>bondsOf(d,a.id).some(b=>b.order===2);for(let i=0;i<n;i++){const b=rb[i];if(!b||b.order!==1||b.stereo)continue;if(!hasD(vs[i])&&!hasD(vs[(i+1)%n]))b.order=2}}
  return{atoms:vs,bonds:rb};
}
function fragment(d,id){const seen=new Set([id]),st=[id];while(st.length){const x=st.pop();for(const b of bondsOf(d,x)){const o=other(b,x);if(!seen.has(o)){seen.add(o);st.push(o)}}}return seen}
function pruneCurls(d,ids){d.curls=d.curls.filter(c=>!ids.has(c.from.id)&&!ids.has(c.to.id))}
function delAtom(d,id){const gone=bondsOf(d,id).map(b=>b.id);d.atoms=d.atoms.filter(a=>a.id!==id);d.bonds=d.bonds.filter(b=>b.a!==id&&b.b!==id);pruneCurls(d,new Set([id,...gone]))}
function delBond(d,id){const b=d.bonds.find(x=>x.id===id);d.bonds=d.bonds.filter(x=>x.id!==id);pruneCurls(d,new Set([id]));if(b)for(const aid of[b.a,b.b]){const a=getAtom(d,aid);if(a&&a.el==='C'&&!a.charge&&!a.lp&&!bondsOf(d,aid).length)delAtom(d,aid)}}
function anchorPos(d,an){if(an.kind==='atom'){const a=getAtom(d,an.id);return a?{x:a.x,y:a.y}:null}if(an.kind==='bond'){const b=d.bonds.find(x=>x.id===an.id);if(!b)return null;const A=getAtom(d,b.a),B=getAtom(d,b.b);if(!A||!B)return null;return{x:(A.x+B.x)/2,y:(A.y+B.y)/2}}return{x:an.x,y:an.y}}
function curlGeom(d,c){
  const s0=anchorPos(d,c.from),t0=anchorPos(d,c.to);if(!s0||!t0)return null;
  const dx=t0.x-s0.x,dy=t0.y-s0.y,len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,off=(c.bend??.4)*Math.max(len,36);
  const cp={x:(s0.x+t0.x)/2+nx*off,y:(s0.y+t0.y)/2+ny*off};
  return{s:toward(s0,cp,c.from.kind==='atom'?8:3),t:toward(t0,cp,c.to.kind==='atom'?9:c.to.kind==='bond'?4:0),c:cp,len,nx,ny,m:{x:(s0.x+t0.x)/2,y:(s0.y+t0.y)/2}};
}

/* ---------- rendering ---------- */
function hCount(a,bsum){
  let v=VAL[a.el];if(v==null)return 0;const c=a.charge||0;
  if(a.el==='C'||a.el==='Si')v=c?3:4;else if(a.el==='B')v=c===-1?4:c===1?2:3;
  else if(['N','O','S','P'].includes(a.el))v=v+c;else v=v-Math.abs(c);
  return Math.max(0,v-bsum);
}
function labelInfo(a,bonds,amap){
  const nb=bonds.map(b=>amap[other(b,a.id)]).filter(Boolean);
  if(a.el==='C'&&nb.length&&!a.show)return null;
  const bsum=bonds.reduce((s,b)=>s+(b.order||1),0),h=hCount(a,bsum);
  let toks=a.el.match(/[A-Z][a-z]?\d*|[a-z]+\d*|\d+|./g)||[a.el];
  if(/^(Boc|Cbz|Fmoc|Bn|Bz|Piv|Tr|Ts|Ms|Tf|Ac|Ph|Me|Et|Pr|Bu|tBu|iPr|nBu|TMS|TBS|TBDMS|TIPS|TBDPS|PMB|MOM|THP|Ar|Nu|LG|Lg|PG)$/.test(a.el))toks=[a.el];
  if(h)toks.splice(1,0,'H'+(h>1?h:''));
  let flip=false;
  if(toks.length>1){if(nb.length){const dx=nb.reduce((s,n)=>s+(n.x-a.x),0)/nb.length;flip=dx>L*.25}else flip=['O','S','F','Cl','Br','I'].includes(a.el)}
  if(flip)toks.reverse();
  const ai=flip?toks.length-1:0,ws=toks.map(t=>textW(t,FS)),before=ws.slice(0,ai).reduce((s,w)=>s+w,0),aw=ws[ai],total=ws.reduce((s,w)=>s+w,0);
  return{str:toks.join(''),x0:a.x-before-aw/2,aw,total,occ:toks.length>1?[flip?Math.PI:0]:[]};
}
function ctxOf(d){const amap={},bmap={},lab={};for(const a of d.atoms){amap[a.id]=a;bmap[a.id]=[]}for(const b of d.bonds)if(bmap[b.a]&&bmap[b.b]){bmap[b.a].push(b);bmap[b.b].push(b)}for(const a of d.atoms)lab[a.id]=labelInfo(a,bmap[a.id],amap);return{amap,bmap,lab}}
function trim(ctx,a,ux,uy){const l=ctx.lab[a.id];if(!l)return 0;const rx=l.aw/2+2.4,ry=7.4;return 1/Math.sqrt((ux/rx)**2+(uy/ry)**2)}
function freeAngles(occ,count){const cands=[-Math.PI/2,0,Math.PI/2,Math.PI,-Math.PI/4,-3*Math.PI/4,Math.PI/4,3*Math.PI/4],res=[],o=[...occ];for(let k=0;k<count;k++){let best=null,bs=-1;for(const c of cands){if(res.includes(c))continue;const s=o.length?Math.min(...o.map(x=>angDiff(x,c))):Math.PI;if(s>bs+1e-6){bs=s;best=c}}res.push(best);o.push(best)}return res}
const ln=(a,b,c,e)=>`<line x1="${f(a)}" y1="${f(b)}" x2="${f(c)}" y2="${f(e)}"/>`;
function headPts(tx,ty,ux,uy,s){const nx=-uy,ny=ux;return[[tx,ty],[tx-ux*s+nx*s*.42,ty-uy*s+ny*s*.42],[tx-ux*s*.7,ty-uy*s*.7],[tx-ux*s-nx*s*.42,ty-uy*s-ny*s*.42]].map(p=>f(p[0])+','+f(p[1])).join(' ')}

function bondSVG(b,A,B,ctx,P){
  const len=dist(A,B)||1,ux=(B.x-A.x)/len,uy=(B.y-A.y)/len,nx=-uy,ny=ux,ta=trim(ctx,A,ux,uy),tb=trim(ctx,B,ux,uy);
  const x1=A.x+ux*ta,y1=A.y+uy*ta,x2=B.x-ux*tb,y2=B.y-uy*tb;
  if(b.stereo==='wedge'){const w=3.6;return`<polygon points="${f(x1)},${f(y1)} ${f(x2+nx*w)},${f(y2+ny*w)} ${f(x2-nx*w)},${f(y2-ny*w)}" style="fill:${P.ink};stroke:${P.ink};stroke-width:.6;stroke-linejoin:round"/>`}
  if(b.stereo==='hash'){const L2=Math.hypot(x2-x1,y2-y1),n=Math.max(4,Math.round(L2/3.3));let g='';for(let i=0;i<n;i++){const t=i/(n-1),px=x1+(x2-x1)*t,py=y1+(y2-y1)*t,h=.6+3.1*t;g+=ln(px+nx*h,py+ny*h,px-nx*h,py-ny*h)}return`<g style="stroke:${P.ink};stroke-width:1.2">${g}</g>`}
  const o=b.order||1;let g='';
  if(o===1)g=ln(x1,y1,x2,y2);
  else if(o===3)g=ln(x1,y1,x2,y2)+ln(x1+nx*4,y1+ny*4,x2+nx*4,y2+ny*4)+ln(x1-nx*4,y1-ny*4,x2-nx*4,y2-ny*4);
  else{
    const nA=ctx.bmap[A.id].filter(x=>x!==b).map(x=>ctx.amap[other(x,A.id)]),nB=ctx.bmap[B.id].filter(x=>x!==b).map(x=>ctx.amap[other(x,B.id)]);
    let s=0;for(const q of[...nA,...nB])s+=Math.sign((q.x-A.x)*nx+(q.y-A.y)*ny);
    if(!nA.length||!nB.length){g=ln(x1+nx*2.6,y1+ny*2.6,x2+nx*2.6,y2+ny*2.6)+ln(x1-nx*2.6,y1-ny*2.6,x2-nx*2.6,y2-ny*2.6)}
    else{const sd=s>=0?1:-1,sh=Math.min(5,len*.16);g=ln(x1,y1,x2,y2)+ln(x1+nx*5*sd+ux*sh,y1+ny*5*sd+uy*sh,x2+nx*5*sd-ux*sh,y2+ny*5*sd-uy*sh)}
  }
  return`<g style="stroke:${P.ink};stroke-width:1.6;stroke-linecap:round;fill:none">${g}</g>`;
}
function atomSVG(a,ctx,P){
  const l=ctx.lab[a.id],bonds=ctx.bmap[a.id];let s='';
  const occ=bonds.map(b=>{const o=ctx.amap[other(b,a.id)];return Math.atan2(o.y-a.y,o.x-a.x)});
  const ch=a.charge||0,chs=ch?(Math.abs(ch)>1?Math.abs(ch):'')+(ch>0?'+':'−'):'';
  if(l){
    const segs=chemSegs(l.str);if(chs)segs.push({t:chs,k:'sup'});
    s+=`<text x="${f(l.x0)}" y="${f(a.y+FS*.36)}" style="fill:${P.ink};font-size:${FS}px;font-family:${P.font}">${segsSVG(segs,FS)}</text>`;
    occ.push(...l.occ);if(chs)occ.push(-Math.PI/4,0);
  }else if(chs){
    const[ang]=freeAngles(occ,1),cx=a.x+10*Math.cos(ang),cy=a.y+10*Math.sin(ang);
    s+=`<g style="stroke:${P.ink};stroke-width:1;fill:none"><circle cx="${f(cx)}" cy="${f(cy)}" r="4.6"/>${ln(cx-2.4,cy,cx+2.4,cy)}${ch>0?ln(cx,cy-2.4,cx,cy+2.4):''}</g>`;
    if(Math.abs(ch)>1)s+=`<text x="${f(cx+5.5)}" y="${f(cy-3)}" style="fill:${P.ink};font-size:8px;font-family:${P.font}">${Math.abs(ch)}</text>`;
    occ.push(ang);
  }
  if(a.lp){
    for(const ang of freeAngles(occ,Math.min(3,a.lp))){
      const c=Math.cos(ang),sn=Math.sin(ang);let r=7.5;if(l){const rx=l.aw/2+4,ry=9.5;r=1/Math.sqrt((c/rx)**2+(sn/ry)**2)}
      const px=a.x+c*r,py=a.y+sn*r;
      s+=`<circle cx="${f(px-sn*2.3)}" cy="${f(py+c*2.3)}" r="1.25" style="fill:${P.ink}"/><circle cx="${f(px+sn*2.3)}" cy="${f(py-c*2.3)}" r="1.25" style="fill:${P.ink}"/>`;
    }
  }
  return s;
}
function arrowSVG(ar,P){
  const{x1,y1,x2,y2}=ar,len=Math.hypot(x2-x1,y2-y1)||1,ux=(x2-x1)/len,uy=(y2-y1)/len,nx=-uy,ny=ux;
  const S=`style="stroke:${P.ink};stroke-width:1.5;fill:none;stroke-linecap:round;stroke-linejoin:round"`,F=`style="fill:${P.ink}"`;let g='';
  if(ar.kind==='eq'){const o=2.4,b=8,bs=4.5;
    g+=`<path ${S} d="M${f(x1-nx*o)} ${f(y1-ny*o)}L${f(x2-nx*o)} ${f(y2-ny*o)}l${f(-ux*b-nx*bs)} ${f(-uy*b-ny*bs)}M${f(x2+nx*o)} ${f(y2+ny*o)}L${f(x1+nx*o)} ${f(y1+ny*o)}l${f(ux*b+nx*bs)} ${f(uy*b+ny*bs)}"/>`}
  else if(ar.kind==='res'){g+=`<path ${S} d="M${f(x1+ux*6)} ${f(y1+uy*6)}L${f(x2-ux*6)} ${f(y2-uy*6)}"/><polygon ${F} points="${headPts(x2,y2,ux,uy,9)}"/><polygon ${F} points="${headPts(x1,y1,-ux,-uy,9)}"/>`}
  else if(ar.kind==='retro'){const o=3;g+=`<path ${S} d="M${f(x1+nx*o)} ${f(y1+ny*o)}L${f(x2+nx*o-ux*3.5)} ${f(y2+ny*o-uy*3.5)}M${f(x1-nx*o)} ${f(y1-ny*o)}L${f(x2-nx*o-ux*3.5)} ${f(y2-ny*o-uy*3.5)}M${f(x2-ux*8+nx*8)} ${f(y2-uy*8+ny*8)}L${f(x2)} ${f(y2)}L${f(x2-ux*8-nx*8)} ${f(y2-uy*8-ny*8)}"/>`}
  else{g+=`<path ${S} d="M${f(x1)} ${f(y1)}L${f(x2-ux*6)} ${f(y2-uy*6)}"/><polygon ${F} points="${headPts(x2,y2,ux,uy,9.5)}"/>`}
  const mx=(x1+x2)/2,my=(y1+y2)/2,fs=12,horiz=Math.abs(ux)>=.5;
  const lab=(t,x,y,anc)=>`<text x="${f(x)}" y="${f(y)}" text-anchor="${anc}" style="fill:${P.ink};font-size:${fs}px;font-family:${P.font}">${segsSVG(chemSegs(t),fs)}</text>`;
  if(ar.above)g+=horiz?lab(ar.above,mx,my-8,'middle'):lab(ar.above,mx-9,my+4,'end');
  if(ar.below)g+=horiz?lab(ar.below,mx,my+18,'middle'):lab(ar.below,mx+9,my+4,'start');
  return g;
}
function curlSVG(d,c,P){
  const g=curlGeom(d,c);if(!g)return'';const{s,t}=g,cp=g.c,tl=Math.hypot(t.x-cp.x,t.y-cp.y)||1,ux=(t.x-cp.x)/tl,uy=(t.y-cp.y)/tl,hs=7.5,e={x:t.x-ux*hs*.7,y:t.y-uy*hs*.7};
  let o=`<path d="M${f(s.x)} ${f(s.y)}Q${f(cp.x)} ${f(cp.y)} ${f(e.x)} ${f(e.y)}" style="stroke:${P.curl};stroke-width:1.4;fill:none;stroke-linecap:round"/>`;
  if(c.half){const nx=-uy,ny=ux,side=((s.x-t.x)*nx+(s.y-t.y)*ny)>0?-1:1;o+=`<polygon points="${f(t.x)},${f(t.y)} ${f(t.x-ux*hs+nx*side*hs*.55)},${f(t.y-uy*hs+ny*side*hs*.55)} ${f(t.x-ux*hs*.72)},${f(t.y-uy*hs*.72)}" style="fill:${P.curl}"/>`}
  else o+=`<polygon points="${headPts(t.x,t.y,ux,uy,hs)}" style="fill:${P.curl}"/>`;
  return o;
}
function textSVG(t,P){return`<text x="${f(t.x)}" y="${f(t.y)}" style="fill:${P.ink};font-size:${FS}px;font-family:${P.font}">${segsSVG(chemSegs(t.text),FS)}</text>`}
function drawScheme(d,P){
  const ctx=ctxOf(d);let s='';
  for(const b of d.bonds){const A=ctx.amap[b.a],B=ctx.amap[b.b];if(A&&B)s+=bondSVG(b,A,B,ctx,P)}
  for(const a of d.atoms)s+=atomSVG(a,ctx,P);
  for(const a of d.arrows)s+=arrowSVG(a,P);
  for(const c of d.curls)s+=curlSVG(d,c,P);
  for(const t of d.texts)s+=textSVG(t,P);
  if(d.cip)s+=cipLabelsSVG(d,P);
  return s;
}
function bbox(d){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;const add=(x,y)=>{x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y)};
  const ctx=ctxOf(d);
  for(const a of d.atoms){const l=ctx.lab[a.id];if(l){add(l.x0-4,a.y-12);add(l.x0+l.total+10,a.y+12)}else{add(a.x-10,a.y-10);add(a.x+10,a.y+10)}}
  for(const a of d.arrows){add(a.x1,a.y1);add(a.x2,a.y2);const mx=(a.x1+a.x2)/2,my=(a.y1+a.y2)/2,w=Math.max(textW(a.above,12),textW(a.below,12));if(a.above){add(mx-w/2-10,my-22);add(mx+w/2+10,my)}if(a.below){add(mx-w/2-10,my);add(mx+w/2+10,my+24)}add(a.x1-6,a.y1-8);add(a.x2+6,a.y2+8)}
  for(const t of d.texts){add(t.x,t.y-14);add(t.x+textW(t.text,FS),t.y+5)}
  for(const c of d.curls){const g=curlGeom(d,c);if(!g)continue;for(let i=0;i<=10;i++){const p=qpt(g.s,g.c,g.t,i/10);add(p.x-6,p.y-6);add(p.x+6,p.y+6)}}
  return x1<x0?null:{x:x0,y:y0,w:x1-x0,h:y1-y0};
}
const THEME={ink:'currentColor',curl:'var(--curl)',font:'var(--font-chem)'};
const PRINT={ink:'#111111',curl:'#c4313a',a2:'#0b7d72',font:'Arial, Helvetica, sans-serif'};

/* ---------- tools ---------- */
const I=p=>`<svg viewBox="0 0 20 20">${p}</svg>`;
const ICON={
  select:I('<path d="M5 3.5l9.5 6.2-4.3 1 2.5 4.5-1.9 1-2.5-4.5L5 14.6z" fill="currentColor" stroke="none"/>'),
  erase:I('<path d="M3.6 13.2l7.2-7.2 5 5-4.3 4.3H5.7z"/><path d="M7.5 9.3l5 5M8.5 16.5h8"/>'),
  b1:I('<path d="M4 15.5L16 4.5"/>'),
  b2:I('<path d="M3.5 13.4L14 3.8M6 16.2L16.5 6.6"/>'),
  b3:I('<path d="M3 12L13 3M4.8 14.4L14.8 5.4M6.6 16.8L16.6 7.8"/>'),
  wedge:I('<path d="M3.8 15.8L17 6.4 14.9 3.5z" fill="currentColor"/>'),
  hash:I('<path d="M5.4 14.4l-.4-.5M7.6 13.4l-1-1.4M9.8 12.4l-1.6-2.2M12 11.4l-2.2-3M14.2 10.4l-2.8-3.8M16.4 9.4l-3.4-4.6"/>'),
  r3:I('<path d="M10 4l6.5 11.5h-13z"/>'),
  r4:I('<path d="M4.5 4.5h11v11h-11z"/>'),
  r5:I('<path d="M10 3.2l6.8 4.9-2.6 8H5.8l-2.6-8z"/>'),
  r6:I('<path d="M10 2.8l6.2 3.6v7.2L10 17.2l-6.2-3.6V6.4z"/>'),
  benz:I('<path d="M10 2.8l6.2 3.6v7.2L10 17.2l-6.2-3.6V6.4z"/><path d="M10 5.5l4 2.3M14.1 12.4l-4.1 2.3M5.8 7.8v4.6"/>'),
  plus:I('<circle cx="10" cy="10" r="6.2"/><path d="M10 7v6M7 10h6"/>'),
  minus:I('<circle cx="10" cy="10" r="6.2"/><path d="M7 10h6"/>'),
  lp:I('<circle cx="7.5" cy="10" r="1.7" fill="currentColor" stroke="none"/><circle cx="12.5" cy="10" r="1.7" fill="currentColor" stroke="none"/>'),
  arr:I('<path d="M2.5 10h12"/><path d="M17.5 10l-5-3.2 1.1 3.2-1.1 3.2z" fill="currentColor"/>'),
  eq:I('<path d="M2.5 8h15l-4-3M17.5 12h-15l4 3"/>'),
  res:I('<path d="M5.5 10h9"/><path d="M18 10l-4.4-2.9.9 2.9-.9 2.9zM2 10l4.4-2.9-.9 2.9.9 2.9z" fill="currentColor"/>'),
  retro:I('<path d="M2.5 8h12M2.5 12h12M12 4.5L17.5 10 12 15.5"/>'),
  curl:I('<path d="M4 16C4 8.5 9.5 5 14.8 7.6" stroke="var(--curl)"/><path d="M17 9.3l-2.1-5.4-1.2 3.3-3.4.8z" fill="var(--curl)" stroke="none"/>'),
  fish:I('<path d="M4 16C4 8.5 9.5 5 14.8 7.6" stroke="var(--curl)"/><path d="M17 9.3l-2.1-5.4-1.2 3.3z" fill="var(--curl)" stroke="none"/>'),
  text:I('<path d="M5 5h10M10 5v11M8 16h4"/>'),
  undo:I('<path d="M7.5 4.5L4 8l3.5 3.5"/><path d="M4.5 8h7.3a4 4 0 010 8H9"/>'),
  redo:I('<path d="M12.5 4.5L16 8l-3.5 3.5"/><path d="M15.5 8H8.2a4 4 0 000 8H11"/>'),
  save:I('<path d="M10 3v9.5M6 8.8l4 4 4-4M4 16h12"/>'),
  copy:I('<rect x="6.5" y="6.5" width="10" height="10" rx="1.5"/><path d="M13.5 4h-8A1.5 1.5 0 004 5.5v8"/>'),
  help:I('<circle cx="10" cy="10" r="7"/><path d="M7.8 7.8a2.3 2.3 0 114 1.6c-.9.6-1.8 1.1-1.8 2.3"/><circle cx="10" cy="14.3" r=".6" fill="currentColor"/>'),
};
const ELS=['C','N','O','S','P','F','Cl','Br','I','H'];
const GROUPS=[
  ['Edit',[['select','Select and move','V'],['erase','Eraser','E']]],
  ['Bonds',[['b1','Single bond','1'],['b2','Double bond','2'],['b3','Triple bond','3'],['wedge','Wedge bond','W'],['hash','Hashed bond','Q']]],
  ['Rings',[['r3','Cyclopropane',''],['r4','Cyclobutane',''],['r5','Cyclopentane',''],['r6','Cyclohexane',''],['benz','Benzene','B']]],
  ['Atoms',null],
  ['Charge',[['plus','Positive charge','+'],['minus','Negative charge','-'],['lp','Lone pair','L']]],
  ['Arrows',[['arr','Reaction arrow','A'],['eq','Equilibrium arrow',''],['res','Resonance arrow',''],['retro','Retrosynthesis arrow','']]],
  ['Mechanism',[['curl','Curly arrow (electron pair)','M'],['fish','Fishhook arrow (one electron)','']]],
  ['Text',[['text','Text and custom atom labels','T']]],
];
const HINTS={
  select:['Select','Drag a molecule to move it. Shift-drag moves one atom. Drag empty space to box-select. Drag a curly arrow to reshape it.'],
  erase:['Eraser','Click or drag across atoms, bonds, arrows and labels to remove them.'],
  b1:['Single bond','Click empty space or an atom to grow a chain. Drag to aim. Click a bond to cycle single, double, triple.'],
  b2:['Double bond','Click an atom to add a double bond, or click an existing bond to toggle it.'],
  b3:['Triple bond','Click an atom to add a triple bond, or click an existing bond to toggle it.'],
  wedge:['Wedge','Click an atom to add a wedge (toward you). Click a wedge again to flip its direction.'],
  hash:['Hashed bond','Click an atom to add a hashed bond (away from you). Click it again to flip its direction.'],
  ring:['Ring','Click empty space to place it, click an atom to attach it, or click a bond to fuse a new ring onto it.'],
  el:['Atom','Click an atom to relabel it, click empty space for a lone atom, or drag from an atom to attach one.'],
  plus:['Positive charge','Click an atom to add +1. Labels and implicit hydrogens update automatically.'],
  minus:['Negative charge','Click an atom to add −1. Labels and implicit hydrogens update automatically.'],
  lp:['Lone pair','Click an atom to add a lone pair. A fourth click clears them.'],
  arrow:['Reaction arrow','Drag to draw, or click to drop one. Click an arrow to write reagents above and conditions below.'],
  curl:['Curly arrow','Drag from a lone pair (atom) or a bond to where the electrons go. Click an arrow to flip its curve.'],
  text:['Text','Click to place a label such as “+” or “major”. Click an atom to give it a custom label like OMe, Ph or CO2Et.'],
};
const toolHint=t=>t.startsWith('tpl:')?(()=>{const tp=TPL_BY[t.slice(4)]||{name:'Template'};return[tp.name,tp.cat==='Groups'||tp.cat==='Protecting groups'?`Click an atom to attach ${tp.label||tp.name.toLowerCase()}. Click empty space to place it on its own.`:`Click empty space to place ${tp.name}.${tp.atoms&&tp.atoms.some(a=>a[0]==='*')?'':' Click an atom to place it beside that atom.'}`]})():t.startsWith('el:')?HINTS.el:/^r\d|benz/.test(t)?HINTS.ring:['arr','eq','res','retro'].includes(t)?HINTS.arrow:['curl','fish'].includes(t)?HINTS.curl:HINTS[t];
const isBondTool=t=>['b1','b2','b3','wedge','hash'].includes(t);
const RINGS={r3:[3,false],r4:[4,false],r5:[5,false],r6:[6,false],benz:[6,true]};
const keyOf=h=>h?h.type+':'+h.obj.id:'';

/* ---------- editor ---------- */
class Editor{
  constructor(block,host,note){
    this.block=block;this.d=block.data=normScheme(block.data);this.note=note;this.host=host;
    this.undoS=[];this.redoS=[];this.sel=new Set();this.hover=null;this.drag=null;this.preview='';
    host.innerHTML=`<div class="canvas-wrap"><div class="svg-scroll"><svg class="scheme-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Structure drawing"><defs><pattern id="g-${block.id}" width="15" height="15" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r=".9" class="griddot"/></pattern></defs><rect width="100%" height="100%" fill="url(#g-${block.id})"/><g class="l-sel"></g><g class="l-content"></g><g class="l-hov"></g></svg></div><div class="resize" title="Drag to resize"></div></div>`;
    this.info=document.createElement('div');this.info.className='mol-info';this.info.hidden=true;host.appendChild(this.info);
    const zb=document.createElement('div');zb.className='zoom';zb.innerHTML='<button data-z="-1" aria-label="Zoom out" title="Zoom out">−</button><span class="z-val">100%</span><button data-z="1" aria-label="Zoom in" title="Zoom in">+</button><button class="z-pan" aria-pressed="false" aria-label="Move around (scroll the drawing)" title="Move around" hidden>✋</button>';host.firstChild.appendChild(zb);{const vb=document.createElement('button');vb.className='val-badge';vb.hidden=true;vb.type='button';vb.onclick=()=>{if(!this.d.info){this.d.info=true;this.render();this.updateInfo();syncChem();App.noteChanged(this.note)}else toast(vb.title.split('\n')[0])};host.firstChild.appendChild(vb)}
    this.zoom=1;zb.addEventListener('click',e=>{if(e.target.closest('.z-pan')){this.setPan(!this.pan);return}const b=e.target.closest('[data-z]');if(!b)return;const Z=[1,1.5,2,3];let i=Z.indexOf(this.zoom);i=Math.max(0,Math.min(Z.length-1,i+(+b.dataset.z)));this.setZoom(Z[i])});
    this.wrap=host.firstChild;this.svg=host.querySelector('svg');this.gSel=host.querySelector('.l-sel');this.gC=host.querySelector('.l-content');this.gH=host.querySelector('.l-hov');
    this.svg.addEventListener('pointerdown',e=>this.down(e));
    this.svg.addEventListener('pointermove',e=>this.move(e));
    this.svg.addEventListener('pointerup',e=>this.up(e));
    this.svg.addEventListener('pointercancel',()=>{this.drag=null;this.preview='';this.overlay()});
    this.svg.addEventListener('pointerleave',()=>{if(!this.drag&&this.hover){this.hover=null;this.overlay()}});
    this.svg.addEventListener('dblclick',e=>{const h=this.hit(this.pt(e));if(App.tool==='select'&&h){if(h.type==='arrow')this.editArrow(h.obj);else if(h.type==='text')this.editText(h.obj);else if(h.type==='atom')this.editLabel(h.obj)}});
    const rz=host.querySelector('.resize');
    rz.addEventListener('pointerdown',e=>{e.preventDefault();rz.setPointerCapture(e.pointerId);this.snap();this.rz={y:e.clientY,h:this.d.h,sc:W/this.svg.getBoundingClientRect().width}});
    rz.addEventListener('pointermove',e=>{if(!this.rz)return;this.d.h=Math.round(Math.max(120,Math.min(1200,this.rz.h+(e.clientY-this.rz.y)*this.rz.sc)));this.render()});
    rz.addEventListener('pointerup',()=>{if(!this.rz)return;const ch=this.rz.h!==this.d.h;this.rz=null;if(ch)this.changed();else this.undoS.pop()});
    this.render();
  }
  setZoom(z){this.zoom=z;this.svg.style.width=(z*100)+'%';this.svg.parentNode.classList.toggle('zoomed',z>1);this.svg.parentNode.style.aspectRatio=z>1?`${W}/${this.d.h}`:'';this.host.querySelector('.z-val').textContent=Math.round(z*100)+'%';this.host.querySelector('.z-pan').hidden=z<=1;if(z<=1)this.setPan(false)}
  setPan(on){this.pan=on;this.wrap.classList.toggle('panning',on);const b=this.host.querySelector('.z-pan');b.setAttribute('aria-pressed',on);b.classList.toggle('on',on)}
  pt(e){const r=this.svg.getBoundingClientRect(),s=W/r.width;return{x:(e.clientX-r.left)*s,y:(e.clientY-r.top)*s}}
  render(){this.svg.setAttribute('viewBox',`0 0 ${W} ${this.d.h}`);this.svg.style.aspectRatio=`${W}/${this.d.h}`;this.gC.innerHTML=drawScheme(this.d,THEME);this.svg.classList.toggle('sel-mode',App.tool==='select');this.overlay();clearTimeout(this._infoT);this._infoT=setTimeout(()=>{if(this.d.info)this.updateInfo();else if(this.info&&!this.info.hidden)this.info.hidden=true;this.describe()},this.drag?400:150)}
  snap(){this.undoS.push(JSON.stringify(this.d));if(this.undoS.length>100)this.undoS.shift();this.redoS=[]}
  changed(){this.render();App.noteChanged(this.note)}
  setData(nd){for(const k of Object.keys(this.d))delete this.d[k];Object.assign(this.d,normScheme(nd));this.sel.clear();this.hover=null;this.changed()}
  undo(){if(!this.undoS.length)return toast('Nothing to undo');this.redoS.push(JSON.stringify(this.d));this.setData(JSON.parse(this.undoS.pop()))}
  redo(){if(!this.redoS.length)return toast('Nothing to redo');this.undoS.push(JSON.stringify(this.d));this.setData(JSON.parse(this.redoS.pop()))}
  hitScale(){const r=this.svg.getBoundingClientRect();const sc=r.width/W||1;const touch=App.coarse?1.6:1;return Math.max(1,touch/Math.min(1,sc))}
  hit(p){
    const d=this.d,K=this.hitScale();let best=null,bd=9.5*K;
    for(const a of d.atoms){const q=dist(a,p);if(q<bd){bd=q;best={type:'atom',obj:a}}}
    if(best)return best;
    for(const t of d.texts){const w=textW(t.text,FS);if(p.x>=t.x-4&&p.x<=t.x+w+4&&p.y>=t.y-15&&p.y<=t.y+6)return{type:'text',obj:t}}
    for(const c of d.curls){const g=curlGeom(d,c);if(!g)continue;for(let i=0;i<=24;i++)if(dist(qpt(g.s,g.c,g.t,i/24),p)<6)return{type:'curl',obj:c}}
    bd=6.5*K;for(const b of d.bonds){const A=getAtom(d,b.a),B=getAtom(d,b.b);if(!A||!B)continue;const q=segDist(p,A,B);if(q<bd){bd=q;best={type:'bond',obj:b}}}
    if(best)return best;
    for(const a of d.arrows){if(segDist(p,{x:a.x1,y:a.y1},{x:a.x2,y:a.y2})<8)return{type:'arrow',obj:a};const mx=(a.x1+a.x2)/2,my=(a.y1+a.y2)/2,w=Math.max(textW(a.above,12),textW(a.below,12))/2+4;if((a.above||a.below)&&Math.abs(p.x-mx)<w&&p.y>my-22&&p.y<my+22)return{type:'arrow',obj:a}}
    return null;
  }
  down(e){if(this.pan)return;
    if(e.button>0)return;
    App.setActive(this);closePop();
    if(document.activeElement&&document.activeElement!==document.body)document.activeElement.blur();
    e.preventDefault();this.svg.setPointerCapture(e.pointerId);
    const p=this.pt(e),hit=this.hit(p),t=App.tool;
    this.drag={p0:p,p,hit,moved:false,tool:t,shift:e.shiftKey||e.altKey};
    if(t==='erase'){this.snap();this.erased=false;this.eraseAt(p)}
    if(t==='select'){
      if(hit){
        const k=keyOf(hit);if(!this.sel.has(k)){if(!e.shiftKey)this.sel.clear();this.sel.add(k)}
        if(hit.type==='curl'&&this.sel.size===1){this.drag.bend=hit.obj}
        else this.drag.mv=this.moveSet(hit,e.shiftKey||e.altKey);
      }else{if(!e.shiftKey)this.sel.clear();this.drag.box=true}
    }
    this.overlay();
  }
  moveSet(hit,single){
    const d=this.d,atoms=new Set(),arrows=new Set(),texts=new Set(),curls=new Set();
    if(this.sel.size>1){for(const k of this.sel){const[ty,id]=k.split(':');if(ty==='atom')atoms.add(id);if(ty==='bond'){const b=d.bonds.find(x=>x.id===id);if(b){atoms.add(b.a);atoms.add(b.b)}}if(ty==='arrow')arrows.add(id);if(ty==='text')texts.add(id);if(ty==='curl')curls.add(id)}}
    else if(hit.type==='atom'){(single?new Set([hit.obj.id]):fragment(d,hit.obj.id)).forEach(x=>atoms.add(x))}
    else if(hit.type==='bond'){fragment(d,hit.obj.a).forEach(x=>atoms.add(x))}
    else if(hit.type==='arrow')arrows.add(hit.obj.id);else if(hit.type==='text')texts.add(hit.obj.id);
    for(const c of d.curls){if(c.from.kind==='pt'||c.to.kind==='pt'){const ins=an=>an.kind==='atom'?atoms.has(an.id):an.kind==='bond'?(()=>{const b=d.bonds.find(x=>x.id===an.id);return b&&atoms.has(b.a)})():false;if(ins(c.from)||ins(c.to))curls.add(c.id)}}
    const orig={a:{},r:{},t:{},c:{}};
    for(const a of d.atoms)if(atoms.has(a.id))orig.a[a.id]=[a.x,a.y];
    for(const a of d.arrows)if(arrows.has(a.id))orig.r[a.id]=[a.x1,a.y1,a.x2,a.y2];
    for(const t of d.texts)if(texts.has(t.id))orig.t[t.id]=[t.x,t.y];
    for(const c of d.curls)if(curls.has(c.id))orig.c[c.id]=[c.from.x,c.from.y,c.to.x,c.to.y];
    return orig;
  }
  move(e){
    const p=this.pt(e),dr=this.drag;
    if(!dr){const h=this.hit(p);if(keyOf(h)!==keyOf(this.hover)){this.hover=h;this.overlay()}return}
    dr.p=p;if(!dr.moved&&dist(p,dr.p0)>4)dr.moved=true;if(!dr.moved)return;
    const t=dr.tool,d=this.d;
    if(t==='select'){
      if(dr.mv){if(!dr.snapped){this.snap();dr.snapped=true}const dx=p.x-dr.p0.x,dy=p.y-dr.p0.y,o=dr.mv;
        for(const a of d.atoms)if(o.a[a.id]){a.x=f(o.a[a.id][0]+dx);a.y=f(o.a[a.id][1]+dy)}
        for(const a of d.arrows)if(o.r[a.id]){const v=o.r[a.id];a.x1=f(v[0]+dx);a.y1=f(v[1]+dy);a.x2=f(v[2]+dx);a.y2=f(v[3]+dy)}
        for(const x of d.texts)if(o.t[x.id]){x.x=f(o.t[x.id][0]+dx);x.y=f(o.t[x.id][1]+dy)}
        for(const c of d.curls)if(o.c[c.id]){const v=o.c[c.id];if(c.from.kind==='pt'){c.from.x=f(v[0]+dx);c.from.y=f(v[1]+dy)}if(c.to.kind==='pt'){c.to.x=f(v[2]+dx);c.to.y=f(v[3]+dy)}}
        this.render();
      }else if(dr.bend){if(!dr.snapped){this.snap();dr.snapped=true}const g=curlGeom(d,dr.bend);if(g){const k=2*((p.x-g.m.x)*g.nx+(p.y-g.m.y)*g.ny)/Math.max(g.len,36);dr.bend.bend=f(Math.max(-1.6,Math.min(1.6,k)))}this.render()}
      else if(dr.box)this.overlay();
      return;
    }
    if(t==='erase'){this.eraseAt(p);return}
    if(isBondTool(t)||t.startsWith('el:')){const g=this.dragTarget(dr);this.preview=`<line class="pv" x1="${f(g.ox)}" y1="${f(g.oy)}" x2="${f(g.ex)}" y2="${f(g.ey)}"/><circle class="pv-dot" cx="${f(g.ex)}" cy="${f(g.ey)}" r="2.6"/>`;this.overlay();return}
    if(['arr','eq','res','retro'].includes(t)){const e2=this.arrowEnd(dr);this.preview=`<g style="color:var(--accent);opacity:.75">${arrowSVG({kind:t,x1:dr.p0.x,y1:dr.p0.y,x2:e2.x,y2:e2.y},THEME)}</g>`;this.overlay();return}
    if((t==='curl'||t==='fish')&&dr.hit&&(dr.hit.type==='atom'||dr.hit.type==='bond')){
      const tg=this.hit(p),to=tg&&(tg.type==='atom'||tg.type==='bond')&&tg.obj.id!==dr.hit.obj.id?{kind:tg.type,id:tg.obj.id}:{kind:'pt',x:p.x,y:p.y};
      const c={from:{kind:dr.hit.type,id:dr.hit.obj.id},to,half:t==='fish'};c.bend=this.autoBend(c);
      this.preview=`<g style="opacity:.75">${curlSVG(d,c,{...THEME,curl:'var(--accent)'})}</g>`+(to.kind!=='pt'?this.hl({type:to.kind,obj:tg.obj},'hl'):'');this.overlay();
    }
  }
  up(e){
    const dr=this.drag;if(!dr)return;this.drag=null;const p=this.pt(e),t=dr.tool,hit=dr.hit;this.preview='';
    if(isBondTool(t)||t.startsWith('el:'))this.bondUp(dr);
    else if(RINGS[t]){if(!dr.moved){this.snap();const[n,ar]=RINGS[t];addRing(this.d,n,ar,hit?.type==='atom'?{atom:hit.obj}:hit?.type==='bond'?{bond:hit.obj}:{x:p.x,y:p.y});this.changed()}}
    else if(t==='plus'||t==='minus'){if(hit?.type==='atom'&&!dr.moved){this.snap();hit.obj.charge=Math.max(-3,Math.min(3,(hit.obj.charge||0)+(t==='plus'?1:-1)));if(!hit.obj.charge)delete hit.obj.charge;this.changed()}}
    else if(t==='lp'){if(hit?.type==='atom'&&!dr.moved){this.snap();hit.obj.lp=((hit.obj.lp||0)+1)%4;if(!hit.obj.lp)delete hit.obj.lp;this.changed()}}
    else if(['arr','eq','res','retro'].includes(t))this.arrowUp(dr);
    else if(t==='curl'||t==='fish')this.curlUp(dr,p);
    else if(t.startsWith('tpl:')){if(!dr.moved)this.placeTemplate(t.slice(4),hit,p)}
    else if(t==='text'){if(!dr.moved){if(hit?.type==='text')this.editText(hit.obj);else if(hit?.type==='arrow')this.editArrow(hit.obj);else if(hit?.type==='atom')this.editLabel(hit.obj);else this.editText({id:uid(),x:f(p.x),y:f(p.y+4),text:''},true)}}
    else if(t==='erase'){if(this.erased)this.changed();else this.undoS.pop()}
    else if(t==='select'){
      if(dr.box&&dr.moved){const x0=Math.min(dr.p0.x,p.x),x1=Math.max(dr.p0.x,p.x),y0=Math.min(dr.p0.y,p.y),y1=Math.max(dr.p0.y,p.y),inn=q=>q.x>=x0&&q.x<=x1&&q.y>=y0&&q.y<=y1,d=this.d;
        for(const a of d.atoms)if(inn(a))this.sel.add('atom:'+a.id);
        for(const b of d.bonds){const A=getAtom(d,b.a),B=getAtom(d,b.b);if(A&&B&&inn(A)&&inn(B))this.sel.add('bond:'+b.id)}
        for(const a of d.arrows)if(inn({x:a.x1,y:a.y1})&&inn({x:a.x2,y:a.y2}))this.sel.add('arrow:'+a.id);
        for(const x of d.texts)if(inn(x))this.sel.add('text:'+x.id);
        for(const c of d.curls){const s=anchorPos(d,c.from),q=anchorPos(d,c.to);if(s&&q&&inn(s)&&inn(q))this.sel.add('curl:'+c.id)}}
      else if(dr.moved&&dr.snapped)this.changed();
    }
    this.overlay();
  }
  dragTarget(dr){
    const o=dr.hit?.type==='atom'?dr.hit.obj:null,ox=o?o.x:dr.p0.x,oy=o?o.y:dr.p0.y;let tg=atomNear(this.d,dr.p,10,o?.id),ex,ey;
    if(tg){ex=tg.x;ey=tg.y}else{const ang=Math.round(Math.atan2(dr.p.y-oy,dr.p.x-ox)/(Math.PI/6))*(Math.PI/6);ex=ox+L*Math.cos(ang);ey=oy+L*Math.sin(ang);tg=atomNear(this.d,{x:ex,y:ey},6,o?.id);if(tg){ex=tg.x;ey=tg.y}}
    return{origin:o,ox,oy,target:tg,ex,ey};
  }
  spec(t){return t==='b2'?{order:2}:t==='b3'?{order:3}:t==='wedge'||t==='hash'?{order:1,stereo:t}:{order:1}}
  growFrom(a,t,el){const ang=bestAngle(this.d,a),e={x:a.x+L*Math.cos(ang),y:a.y+L*Math.sin(ang)},s=this.spec(t);const b=atomNear(this.d,e,7,a.id)||addAtom(this.d,e.x,e.y,el||'C');const ex=findBond(this.d,a.id,b.id);if(ex)this.modBond(ex,t);else addBond(this.d,a,b,s.order,s.stereo)}
  modBond(b,t){
    if(t==='b1'){if(b.stereo){delete b.stereo;b.order=1}else b.order=(b.order||1)>=3?1:(b.order||1)+1}
    else if(t==='b2'){delete b.stereo;b.order=b.order===2?1:2}
    else if(t==='b3'){delete b.stereo;b.order=b.order===3?1:3}
    else{if(b.stereo===t){const x=b.a;b.a=b.b;b.b=x}else{b.stereo=t;b.order=1}}
  }
  bondUp(dr){
    const t=dr.tool,hit=dr.hit,el=t.startsWith('el:')?t.slice(3):null,d=this.d;
    if(!dr.moved){
      if(hit?.type==='atom'){if(el){if(hit.obj.el===el)return;this.snap();hit.obj.el=el}else{this.snap();this.growFrom(hit.obj,t)}return this.changed()}
      if(hit?.type==='bond'){if(el)return;this.snap();this.modBond(hit.obj,t);return this.changed()}
      if(!hit){this.snap();if(el)addAtom(d,dr.p0.x,dr.p0.y,el);else this.growFrom(addAtom(d,dr.p0.x,dr.p0.y),t);return this.changed()}
      return;
    }
    const g=this.dragTarget(dr);if(Math.hypot(g.ex-g.ox,g.ey-g.oy)<5)return;
    this.snap();const A=g.origin||atomNear(d,{x:g.ox,y:g.oy},4)||addAtom(d,g.ox,g.oy),B=g.target||addAtom(d,g.ex,g.ey,el||'C');
    const ex=findBond(d,A.id,B.id),s=this.spec(el?'b1':t);if(ex){if(!el)this.modBond(ex,t)}else addBond(d,A,B,s.order,s.stereo);
    this.changed();
  }
  arrowEnd(dr){const dx=dr.p.x-dr.p0.x,dy=dr.p.y-dr.p0.y,len=Math.hypot(dx,dy),ang=Math.round(Math.atan2(dy,dx)/(Math.PI/12))*(Math.PI/12);return{x:dr.p0.x+len*Math.cos(ang),y:dr.p0.y+len*Math.sin(ang)}}
  arrowUp(dr){
    const t=dr.tool;let a;
    if(!dr.moved){if(dr.hit?.type==='arrow')return this.editArrow(dr.hit.obj);a={id:uid(),kind:t,x1:f(dr.p0.x),y1:f(dr.p0.y),x2:f(dr.p0.x+90),y2:f(dr.p0.y),above:'',below:''}}
    else{const e=this.arrowEnd(dr);if(Math.hypot(e.x-dr.p0.x,e.y-dr.p0.y)<24)return;a={id:uid(),kind:t,x1:f(dr.p0.x),y1:f(dr.p0.y),x2:f(e.x),y2:f(e.y),above:'',below:''}}
    this.snap();this.d.arrows.push(a);this.changed();if(t!=='res')this.editArrow(a);
  }
  autoBend(c){
    const d=this.d,s=anchorPos(d,c.from),t=anchorPos(d,c.to);if(!s||!t)return .4;
    const m={x:(s.x+t.x)/2,y:(s.y+t.y)/2},near=d.atoms.filter(a=>dist(a,m)<70);if(!near.length)return -.4;
    const cx=near.reduce((q,a)=>q+a.x,0)/near.length,cy=near.reduce((q,a)=>q+a.y,0)/near.length;
    const g=curlGeom(d,{...c,bend:.4});if(!g)return .4;const gn=curlGeom(d,{...c,bend:-.4});
    return Math.hypot(g.c.x-cx,g.c.y-cy)>=Math.hypot(gn.c.x-cx,gn.c.y-cy)?.4:-.4;
  }
  curlUp(dr,p){
    const src=dr.hit;
    if(!dr.moved){if(src?.type==='curl'){this.snap();src.obj.bend=-(src.obj.bend??.4);this.changed()}else if(!src||(src.type!=='atom'&&src.type!=='bond'))toast('Start a curly arrow on an atom or a bond');return}
    if(!src||(src.type!=='atom'&&src.type!=='bond'))return;
    const tg=this.hit(p);let to;
    if(tg&&(tg.type==='atom'||tg.type==='bond'))to={kind:tg.type,id:tg.obj.id};else to={kind:'pt',x:f(p.x),y:f(p.y)};
    if(to.id&&to.id===src.obj.id)return;
    const c={id:uid(),from:{kind:src.type,id:src.obj.id},to};if(dr.tool==='fish')c.half=true;c.bend=this.autoBend(c);
    this.snap();this.d.curls.push(c);this.changed();
  }
  eraseAt(p){
    const h=this.hit(p);if(!h)return;const d=this.d;
    if(h.type==='atom')delAtom(d,h.obj.id);else if(h.type==='bond')delBond(d,h.obj.id);
    else if(h.type==='arrow')d.arrows=d.arrows.filter(x=>x!==h.obj);else if(h.type==='text')d.texts=d.texts.filter(x=>x!==h.obj);else if(h.type==='curl')d.curls=d.curls.filter(x=>x!==h.obj);
    this.erased=true;this.hover=null;this.sel.delete(keyOf(h));this.render();
  }
  removeKeys(keys){const d=this.d;for(const k of keys){const[ty,id]=k.split(':');if(ty==='atom'&&getAtom(d,id))delAtom(d,id);else if(ty==='bond')delBond(d,id);else if(ty==='arrow')d.arrows=d.arrows.filter(x=>x.id!==id);else if(ty==='text')d.texts=d.texts.filter(x=>x.id!==id);else if(ty==='curl')d.curls=d.curls.filter(x=>x.id!==id)}}
  deleteSel(){const keys=this.sel.size?[...this.sel]:this.hover?[keyOf(this.hover)]:[];if(!keys.length)return;this.snap();this.removeKeys(keys);this.sel.clear();this.hover=null;this.changed()}
  clearSel(){this.sel.clear();this.overlay()}
  hl(h,cls){
    const f2=cls+'-f',s2=cls+'-s',d=this.d;
    if(h.type==='atom')return`<circle class="${f2}" cx="${f(h.obj.x)}" cy="${f(h.obj.y)}" r="9"/>`;
    if(h.type==='bond'){const A=getAtom(d,h.obj.a),B=getAtom(d,h.obj.b);return A&&B?`<line class="${s2}" stroke-width="10" x1="${f(A.x)}" y1="${f(A.y)}" x2="${f(B.x)}" y2="${f(B.y)}"/>`:''}
    if(h.type==='arrow'){const a=h.obj;return`<line class="${s2}" stroke-width="12" x1="${f(a.x1)}" y1="${f(a.y1)}" x2="${f(a.x2)}" y2="${f(a.y2)}"/>`}
    if(h.type==='text'){const t=h.obj;return`<rect class="${f2}" rx="3" x="${f(t.x-3)}" y="${f(t.y-14)}" width="${f(textW(t.text,FS)+6)}" height="19"/>`}
    if(h.type==='curl'){const g=curlGeom(d,h.obj);return g?`<path class="${s2}" stroke-width="9" d="M${f(g.s.x)} ${f(g.s.y)}Q${f(g.c.x)} ${f(g.c.y)} ${f(g.t.x)} ${f(g.t.y)}"/>`:''}
    return'';
  }
  overlay(){
    const d=this.d;let s='';
    for(const k of this.sel){const[ty,id]=k.split(':'),coll={atom:d.atoms,bond:d.bonds,arrow:d.arrows,text:d.texts,curl:d.curls}[ty],o=coll&&coll.find(x=>x.id===id);if(o)s+=this.hl({type:ty,obj:o},'sl')}
    this.gSel.innerHTML=s;
    let h='';if(this.hover&&!this.drag&&!this.sel.has(keyOf(this.hover)))h+=this.hl(this.hover,'hl');
    if(this.drag?.box&&this.drag.moved){const a=this.drag.p0,b=this.drag.p;h+=`<rect class="box" x="${f(Math.min(a.x,b.x))}" y="${f(Math.min(a.y,b.y))}" width="${f(Math.abs(a.x-b.x))}" height="${f(Math.abs(a.y-b.y))}"/>`}
    h+=validationSVG(this);
    this.gH.innerHTML=h+this.preview;
  }
  /* popovers */
  popAt(x,y,fields,onSave,onDelete){
    closePop();const sec=this.host.closest('.block'),r=this.svg.getBoundingClientRect(),br=sec.getBoundingClientRect(),sc=r.width/W;
    const pop=document.createElement('div');pop.className='pop';
    pop.innerHTML=fields.map((fl,i)=>`<label>${esc(fl.label)}<input id="pop-${i}" value="${esc(fl.value||'')}" placeholder="${esc(fl.ph||'')}" autocomplete="off" spellcheck="false"></label>`).join('')+
      `<div class="chips">${['Δ','hν','°C','H⁺','→','·'].map(c=>`<button type="button" data-ins="${c}">${c}</button>`).join('')}</div>`+
      `<div class="row">${onDelete?'<button class="btn del" data-a="del" type="button">Remove</button>':''}<button class="btn" data-a="cancel" type="button">Cancel</button><button class="btn primary" data-a="ok" type="button">Done</button></div>`;
    sec.appendChild(pop);
    const left=Math.max(4,Math.min(r.left-br.left+x*sc-pop.offsetWidth/2,br.width-pop.offsetWidth-4)),top=r.top-br.top+y*sc+14;
    pop.style.left=left+'px';pop.style.top=top+'px';
    const ins=[...pop.querySelectorAll('input')];let last=ins[0];ins.forEach(i=>i.addEventListener('focus',()=>last=i));
    const done=()=>{onSave(ins.map(i=>i.value.trim()));closePop()};
    pop.addEventListener('mousedown',e=>{if(e.target.dataset.ins)e.preventDefault()});
    pop.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.ins){const s=last.selectionStart??last.value.length;last.value=last.value.slice(0,s)+b.dataset.ins+last.value.slice(last.selectionEnd??s);last.focus();last.setSelectionRange(s+b.dataset.ins.length,s+b.dataset.ins.length)}else if(b.dataset.a==='ok')done();else if(b.dataset.a==='cancel')closePop();else if(b.dataset.a==='del'){onDelete();closePop()}});
    pop.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();done()}else if(e.key==='Escape'){e.preventDefault();closePop()}});
    App.pop=pop;ins[0].focus();ins[0].select();
  }
  editArrow(a){const mx=(a.x1+a.x2)/2,my=Math.max(a.y1,a.y2);setTimeout(()=>addReagentPicker(App.pop),0);this.popAt(mx,my+(a.below?16:4),[{label:'Above the arrow (reagents)',value:a.above,ph:'e.g. 1. NaBH4  2. H3O+'},{label:'Below the arrow (conditions)',value:a.below,ph:'e.g. EtOH, 0 °C'}],([ab,be])=>{if(ab===(a.above||'')&&be===(a.below||''))return;this.snap();a.above=ab;a.below=be;this.changed()},()=>{this.snap();this.d.arrows=this.d.arrows.filter(x=>x!==a);this.changed()})}
  editText(t,isNew){this.popAt(t.x+20,t.y,[{label:'Label',value:t.text,ph:'e.g. +, major product, (S)-isomer'}],([v])=>{if(!v){if(!isNew){this.snap();this.d.texts=this.d.texts.filter(x=>x!==t);this.changed()}return}if(v===t.text)return;this.snap();t.text=v;if(isNew)this.d.texts.push(t);this.changed()},isNew?null:()=>{this.snap();this.d.texts=this.d.texts.filter(x=>x!==t);this.changed()})}
  editLabel(a){this.popAt(a.x,a.y,[{label:'Atom label',value:a.el==='C'&&!a.show?'':a.el,ph:'e.g. OMe, Ph, NO2 (C shows the carbon, blank hides it)'}],([v])=>{v=v.replace(/\s+/g,'');const show=v==='C';v=v||'C';if(v===a.el&&!!a.show===show)return;this.snap();a.el=v;if(show)a.show=true;else delete a.show;this.changed()})}
  /* export */
  exportSVG(bg){return schemeSVG(this.d,bg)}
  async exportPNG(){const cv=await schemeCanvas(this.d,3);return cv?new Promise(r=>cv.toBlob(r,'image/png')):null}
}
function schemeSVG(d,bg){const bb=bbox(d);if(!bb)return null;const p=14,w=Math.ceil(bb.w+2*p),h=Math.ceil(bb.h+2*p);return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${f(bb.x-p)} ${f(bb.y-p)} ${w} ${h}" width="${w}" height="${h}">${bg?`<rect x="${f(bb.x-p)}" y="${f(bb.y-p)}" width="${w}" height="${h}" fill="#ffffff"/>`:''}${drawScheme(d,PRINT)}</svg>`}
async function schemeCanvas(d,sc){const svg=schemeSVG(d,true);if(!svg)return null;const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const cv=document.createElement('canvas');cv.width=img.width*sc;cv.height=img.height*sc;const c=cv.getContext('2d');c.scale(sc,sc);c.drawImage(img,0,0);cv.dataset.w=img.width;return cv}
const REAGENTS=['NaBH4','LiAlH4','DIBAL-H','H2, Pd/C','H3O+','PCC','DMP','KMnO4','K2Cr2O7, H2SO4','CrO3, H2SO4','mCPBA','OsO4, NMO','O3; then Me2S','LDA','n-BuLi','MeMgBr','PhMgBr','NaOH','HCl','H2SO4','HNO3, H2SO4','Br2','Br2, FeBr3','Cl2, AlCl3','CH3COCl, AlCl3','NBS, hν','SOCl2','PBr3','TsCl, pyridine','Et3N','NaH','K2CO3','NaCN','NaN3','Boc2O','TFA','DCC','Ph3P=CH2','THF','Et2O','DCM','EtOH','MeOH','H2O','DMF','DMSO','reflux','rt','0 °C','−78 °C'];
function addReagentPicker(pop){
  if(!pop||pop.querySelector('.rg-sel'))return;const ins=[...pop.querySelectorAll('input')];if(ins.length<2)return;let last=ins[0];ins.forEach(i=>i.addEventListener('focus',()=>last=i));
  const sel=document.createElement('select');sel.className='rg-sel';sel.setAttribute('aria-label','Insert a common reagent');sel.innerHTML='<option value="">Insert a reagent or solvent…</option>'+REAGENTS.map(r=>`<option>${esc(r)}</option>`).join('');
  sel.onchange=()=>{const v=sel.value;if(!v)return;last.value=last.value?last.value.replace(/[,;\s]*$/,'')+', '+v:v;sel.value='';last.focus()};
  pop.querySelector('.chips').after(sel);
}
function closePop(){if(App.pop){App.pop.remove();App.pop=null}}

/* ---------- storage ---------- */
const Store={mode:'local',col:null,
  async connect(){return false;try{const[db,user]=await Promise.all([window.claude.use('db'),window.claude.use('user')]);if(!db||!user)return false;const id=await user.id();if(!id)return false;this.col=db.collection('data/users/'+id);this.mode='cloud';return true}catch(e){return false}},
  async loadAll(){const snap=await this.col.get();let meta=null,quiz=null;const notes=[];for(const d of snap.docs){if(!d.exists)continue;if(d.id==='_meta'){meta=JSON.parse(JSON.stringify(d.data()));continue}if(d.id==='_quiz'){quiz=JSON.parse(JSON.stringify(d.data()));continue}if(d.id[0]==='_')continue;notes.push(normNote({...JSON.parse(JSON.stringify(d.data())),id:d.id}))}return{notes,meta,quiz}},
  async save(n){const body={title:String(n.title||'').slice(0,500),tag:String(n.tag||'').slice(0,100),tags:noteTags(n).slice(0,20),folder:String(n.folder||'').slice(0,24),pinned:!!n.pinned,comments:n.comments||[],updated:+n.updated||Date.now(),blocks:n.blocks};if(n.deleted)body.deleted=+n.deleted;if(n.share)body.share=String(n.share).slice(0,40);await this.col.doc(n.id).set(JSON.parse(JSON.stringify(body)))},
  async remove(id){await this.col.doc(id).delete()},
  async meta(){await this.col.doc('_meta').set(JSON.parse(JSON.stringify({dismissed:[...App.dismissed],folders:App.folders,foldersAt:App.foldersAt||0})))}
};
/* ---------- rich text: document styles, fonts, colours and maths ---------- */
const FONTS={serif:{n:'Serif',css:'var(--font-note)'},sans:{n:'Sans',css:'var(--font-ui)'},round:{n:'Rounded',css:'"Nunito",ui-rounded,system-ui,sans-serif'},hand:{n:'Handwriting',css:'"Caveat","Segoe Print","Bradley Hand",cursive'},classic:{n:'Classic',css:'Georgia,"Times New Roman",Times,serif'},mono:{n:'Typewriter',css:'"JetBrains Mono",ui-monospace,Menlo,Consolas,monospace'}};
const TCOL={accent:'Main colour',a2:'Second colour',curl:'Red',ok:'Green',muted:'Grey'};
const HLS={yellow:'Yellow',green:'Green',pink:'Pink',blue:'Blue'};
const CALLOUTS={key:'Key idea',def:'Definition',ex:'Example',warn:'Watch out',tip:'Tip'};
const PSTYLES=[['p','Normal text'],['h1','Heading 1'],['h2','Heading 2'],['h3','Heading 3'],['blockquote','Quote'],['pre','Code']];
const ATTR_OK={'data-font':v=>!!FONTS[v],'data-color':v=>!!TCOL[v],'data-hl':v=>!!HLS[v],'data-align':v=>['center','right','justify'].includes(v),'data-callout':v=>!!CALLOUTS[v],'data-tex':v=>v.length>0&&v.length<=4000,'data-display':v=>v==='1','data-cmt':v=>/^[a-z0-9]{4,24}$/i.test(v)};
const ALLOW=new Set(['B','STRONG','I','EM','U','S','SUB','SUP','BR','DIV','P','UL','OL','LI','SPAN','MARK','H1','H2','H3','BLOCKQUOTE','HR','PRE','CODE']);
function sanitize(html){
  const doc=new DOMParser().parseFromString('<div>'+(html||'')+'</div>','text/html'),root=doc.body.firstChild;
  (function walk(n){for(const c of[...n.childNodes]){
    if(c.nodeType===1){
      if(!ALLOW.has(c.tagName)){if(['SCRIPT','STYLE','IFRAME','OBJECT','EMBED','SVG','IMG','MJX-CONTAINER','TEMPLATE','FORM','INPUT','TEXTAREA','BUTTON','SELECT','LINK','META'].includes(c.tagName)){c.remove();continue}walk(c);c.replaceWith(...c.childNodes);continue}
      for(const at of[...c.attributes]){const ok=ATTR_OK[at.name];if(!ok||!ok(at.value))c.removeAttribute(at.name)}
      if(c.hasAttribute('data-tex')){c.textContent=c.getAttribute('data-tex');continue}
      walk(c)
    }else if(c.nodeType!==3)c.remove()}})(root);
  return root.innerHTML}

/* maths: MathJax (SVG output, with \ce{} for chemistry) loaded on first use */
const MJ_URLS=['vendor/tex-svg-full.js'];
let mjP=null;
function mathReady(){
  if(window.MathJax&&window.MathJax.tex2svg)return Promise.resolve(true);
  if(mjP)return mjP;
  window.MathJax={tex:{packages:{'[+]':['mhchem']},inlineMath:[],displayMath:[]},svg:{fontCache:'none'},options:{enableMenu:false,enableAssistiveMml:false},startup:{typeset:false},loader:{load:[]}};
  mjP=(async()=>{for(const u of MJ_URLS){try{await new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.async=true;s.onload=res;s.onerror=rej;document.head.appendChild(s)});await window.MathJax.startup.promise;return true}catch(e){}}mjP=null;return false})();
  return mjP;
}
const mjCache=new Map();
function texSVG(tex,display){
  const k=(display?'D':'I')+tex;if(mjCache.has(k))return mjCache.get(k);
  let out;try{const node=window.MathJax.tex2svg(tex,{display:!!display});const err=node.querySelector('[data-mjx-error]');const sv=node.querySelector('svg');out=err?{err:err.getAttribute('data-mjx-error')}:sv?{svg:sv.outerHTML}:{err:'Could not draw this'}}catch(e){out={err:String(e.message||e)}}
  if(mjCache.size>800)mjCache.clear();mjCache.set(k,out);return out}
function renderMathIn(root){
  const els=[...root.querySelectorAll('span[data-tex]')];if(!els.length)return;
  const ready=window.MathJax&&window.MathJax.tex2svg;
  for(const el of els){
    el.contentEditable='false';const tex=el.getAttribute('data-tex'),disp=el.getAttribute('data-display')==='1',key=(disp?'D':'I')+tex;
    if(el.dataset.r===key)continue;
    if(!ready){el.classList.add('math-wait');el.textContent=tex;continue}
    const r=texSVG(tex,disp);el.classList.remove('math-wait');
    if(r.err){el.classList.add('math-err');el.textContent=tex;el.title='LaTeX error: '+r.err}else{el.classList.remove('math-err');el.innerHTML=r.svg;el.removeAttribute('title');el.setAttribute('role','img');el.setAttribute('aria-label',tex)}
    el.dataset.r=key}
  if(!ready)mathReady().then(ok=>{if(ok)renderMathIn(root);else els.forEach(el=>el.title='Couldn\'t load the maths tools. Reload the app.')})}
function serializeBody(body){const c=body.cloneNode(true);c.querySelectorAll('[class]').forEach(e=>{if(!e.hasAttribute('data-tex'))e.removeAttribute('class')});for(const m of c.querySelectorAll('span[data-tex]')){m.textContent=m.getAttribute('data-tex');for(const a of['contenteditable','data-r','role','aria-label','title','class'])m.removeAttribute(a)}return c.innerHTML}

/* text editing state: the last text block and selection, so palette buttons act on it */
const TX={body:null,block:null,note:null,range:null};
document.addEventListener('selectionchange',()=>{const s=getSelection();if(!s.rangeCount)return;const r=s.getRangeAt(0),b=r.startContainer.nodeType===1?r.startContainer:r.startContainer.parentElement;const body=b&&b.closest&&b.closest('.text-body');if(body){TX.range=r.cloneRange();if(TX.body!==body)setTextTarget(body)}if(body)updateTextState()});
function setTextTarget(body){TX.body=body;const sec=body.closest('.block');TX.block=App.cur&&App.cur.blocks.find(b=>b.id===sec.dataset.id);TX.note=App.cur;setCtx('text')}
function restoreSel(){if(!TX.body)return false;const cs=getSelection();if(cs.rangeCount&&TX.body.contains(cs.anchorNode)&&document.activeElement===TX.body){TX.range=cs.getRangeAt(0).cloneRange();return true}TX.body.focus({preventScroll:true});if(TX.range&&TX.body.contains(TX.range.startContainer)){const s=getSelection();s.removeAllRanges();s.addRange(TX.range)}return true}
function textChanged(){if(!TX.body||!TX.block)return;TX.block.html=serializeBody(TX.body);App.noteChanged(TX.note);refreshOutline()}
function topBlock(node){const body=TX.body;if(!node||!body.contains(node))return null;while(node&&node.parentNode!==body)node=node.parentNode;return node}
function ensureBlock(){const s=getSelection();if(!s.rangeCount)return null;let n=topBlock(s.getRangeAt(0).startContainer);if(n&&(n.nodeType===3||!/^(P|DIV|H1|H2|H3|BLOCKQUOTE|PRE|UL|OL)$/.test(n.tagName))){document.execCommand('formatBlock',false,'<p>');n=topBlock(getSelection().getRangeAt(0).startContainer)}return n}
function selBlocks(){const s=getSelection();if(!s.rangeCount)return[];const r=s.getRangeAt(0);let a=topBlock(r.startContainer),b=topBlock(r.endContainer);if(!a)return[];const out=[];for(let n=a;n;n=n.nextSibling){out.push(n);if(n===b)break}return out}
/* execCommand gives <font> tags; turn them into Bondline's own marked-up spans */
const SENT={font:k=>'bl-'+k,color:k=>'#0000'+('0'+(Object.keys(TCOL).indexOf(k)+1)).slice(-2),hl:k=>'rgb(1, 2, '+(Object.keys(HLS).indexOf(k)+3)+')'};
function fixSentinels(){
  const body=TX.body,made=[];const mk0=el=>{made.push(el);return el};
  for(const f of[...body.querySelectorAll('font')]){let el=f;const face=f.getAttribute('face'),col=f.getAttribute('color');
    if(face&&face.startsWith('bl-')){const k=face.slice(3);const sp=mk0(document.createElement('span'));if(k!=='none')sp.setAttribute('data-font',k);sp.append(...f.childNodes);f.replaceWith(sp);el=sp;
      sp.querySelectorAll('[data-font]').forEach(x=>x.removeAttribute('data-font'));if(k==='none'){sp.replaceWith(...sp.childNodes);continue}}
    if(col){const i=parseInt(col.slice(1),16)-1,k=Object.keys(TCOL)[i];const sp=document.createElement('span');if(k)sp.setAttribute('data-color',k);sp.append(...el.childNodes);el.replaceWith(sp);sp.querySelectorAll('[data-color]').forEach(x=>x.removeAttribute('data-color'));if(!k)sp.replaceWith(...sp.childNodes)}}
  for(const sp of[...body.querySelectorAll('span[style]')]){const bg=sp.style.backgroundColor,m=/^rgb\(1, 2, (\d+)\)$/.exec(bg);sp.removeAttribute('style');
    if(m){const k=Object.keys(HLS)[+m[1]-3];const mk=mk0(document.createElement('mark'));if(k&&k!=='yellow')mk.setAttribute('data-hl',k);if(sp.attributes.length){sp.replaceWith(mk);mk.appendChild(sp)}else{mk.append(...sp.childNodes);sp.replaceWith(mk)}mk.querySelectorAll('mark').forEach(x=>x.replaceWith(...x.childNodes));if(!k)mk.replaceWith(...mk.childNodes)}
    else if(!sp.attributes.length)sp.replaceWith(...sp.childNodes)}
  for(const sp of[...body.querySelectorAll('span:not([data-font]):not([data-color]):not([data-tex])')])if(!sp.attributes.length)sp.replaceWith(...sp.childNodes);
  const live=made.filter(m=>m.isConnected);if(live.length){const r=document.createRange();r.setStartBefore(live[0]);r.setEndAfter(live[live.length-1]);const sl=getSelection();sl.removeAllRanges();sl.addRange(r);TX.range=r.cloneRange()}
}
function unwrapInSel(sel){const s=getSelection();if(!s.rangeCount)return;const r=s.getRangeAt(0);for(const el of[...TX.body.querySelectorAll(sel)])if(r.intersectsNode(el))el.replaceWith(...el.childNodes)}

/* lists, built by hand so they never end up nested inside paragraphs */
function caretTo(node,end){const r=document.createRange();if(end){r.selectNodeContents(node);r.collapse(false)}else{r.setStart(node,0)}const s=getSelection();s.removeAllRanges();s.addRange(r)}
function selLis(){const s=getSelection();if(!s.rangeCount)return[];const r=s.getRangeAt(0);const el=n=>(n.nodeType===3?n.parentElement:n);const a=el(r.startContainer).closest('li'),b=el(r.endContainer).closest('li');if(!a||!TX.body.contains(a))return[];if(!b||a.parentNode!==b.parentNode)return[a];const out=[];for(let n=a;n;n=n.nextElementSibling){out.push(n);if(n===b)break}return out}
function toggleList(tag){
  const s=getSelection();if(!s.rangeCount)return;const keep=s.getRangeAt(0).cloneRange();
  const lis=selLis();
  if(lis.length){const list=lis[0].parentNode;
    if(list.tagName.toLowerCase()===tag){/* unwrap these items into paragraphs */
      const after=lis[lis.length-1].nextElementSibling;let anchor=list;const ps=lis.map(li=>{const p=document.createElement('p');for(const c of[...li.childNodes]){if(c.nodeType===1&&(c.tagName==='UL'||c.tagName==='OL'))continue;p.appendChild(c)}if(!p.firstChild)p.appendChild(document.createElement('br'));return p});
      if(list.parentNode!==TX.body){/* nested: lift out as items of parent list */const pl=list.closest('li');ps.forEach(p=>{const li=document.createElement('li');li.append(...p.childNodes);pl.after(li)});lis.forEach(l=>l.remove());if(!list.children.length)list.remove();return}
      if(after){const tail=document.createElement(list.tagName);let n=after;while(n){const nx=n.nextElementSibling;tail.appendChild(n);n=nx}list.after(tail)}
      lis.forEach(l=>l.remove());let ref=list;ps.forEach(p=>{ref.after(p);ref=p});if(!list.children.length)list.remove();
      try{s.removeAllRanges();s.addRange(keep)}catch(e){caretTo(ps[0])}return}
    const nl=document.createElement(tag);nl.append(...list.childNodes);list.replaceWith(nl);try{s.removeAllRanges();s.addRange(keep)}catch(e){}return}
  let bl=selBlocks().filter(n=>n.nodeType===1||n.textContent.trim());if(!bl.length||bl.some(n=>n.nodeType===3)){ensureBlock();bl=selBlocks()}
  const list=document.createElement(tag);bl[0].before(list);
  for(const n of bl){if(n.nodeType===1&&(n.tagName==='UL'||n.tagName==='OL')){list.append(...n.childNodes);n.remove();continue}if(n.nodeType===1&&n.hasAttribute&&n.hasAttribute('data-callout')){list.before(n);continue}const li=document.createElement('li');if(n.nodeType===3)li.appendChild(n);else{li.append(...n.childNodes);n.remove()}if(!li.firstChild)li.appendChild(document.createElement('br'));list.appendChild(li)}
  if(!list.children.length){list.remove();return}
  try{s.removeAllRanges();s.addRange(keep)}catch(e){caretTo(list.firstChild,true)}
  if(!TX.body.contains(getSelection().anchorNode))caretTo(list.lastChild,true);
}
function indentLi(out){
  const lis=selLis();if(!lis.length){document.execCommand(out?'outdent':'indent');return}
  const s=getSelection(),keep=s.getRangeAt(0).cloneRange();
  if(!out){const prev=lis[0].previousElementSibling;if(!prev)return;let sub=[...prev.children].find(c=>c.tagName==='UL'||c.tagName==='OL');if(!sub){sub=document.createElement(lis[0].parentNode.tagName);prev.appendChild(sub)}lis.forEach(l=>sub.appendChild(l))}
  else{const list=lis[0].parentNode,pli=list.parentNode&&list.parentNode.closest&&list.parentNode.closest('li');
    if(pli&&TX.body.contains(pli)){let ref=pli;const rest=[];let n=lis[lis.length-1].nextElementSibling;while(n){rest.push(n);n=n.nextElementSibling}lis.forEach(l=>{ref.after(l);ref=l});if(rest.length){const nl=document.createElement(list.tagName);rest.forEach(r=>nl.appendChild(r));lis[lis.length-1].appendChild(nl)}if(!list.children.length)list.remove()}
    else{toggleList(list.tagName.toLowerCase());return}}
  try{s.removeAllRanges();s.addRange(keep)}catch(e){}
}
function textCmd(c,v){
  if(!restoreSel())return toast('Click in some text first.');
  document.execCommand('styleWithCSS',false,false);
  const s=getSelection(),collapsed=s.isCollapsed;
  switch(c){
    case'style':{if(v==='p'){const bl=selBlocks();document.execCommand('formatBlock',false,'<p>');}else document.execCommand('formatBlock',false,'<'+v+'>');break}
    case'font':{if(collapsed){const n=ensureBlock();if(n&&n.nodeType===1){v==='none'?n.removeAttribute('data-font'):n.setAttribute('data-font',v)}}else{document.execCommand('fontName',false,SENT.font(v));fixSentinels()}break}
    case'color':{if(v==='none'){unwrapInSel('span[data-color]')}else if(!collapsed){document.execCommand('foreColor',false,SENT.color(v));fixSentinels()}else return toast('Select some text to colour.');break}
    case'hl':{if(v==='none'){unwrapInSel('mark')}else if(!collapsed){document.execCommand('hiliteColor',false,SENT.hl(v));fixSentinels()}else return toast('Select some text to highlight.');break}
    case'align':{for(const n of selBlocks().length?selBlocks():[ensureBlock()]){if(n&&n.nodeType===1){v==='left'?n.removeAttribute('data-align'):n.setAttribute('data-align',v)}}break}
    case'callout':{let bl=selBlocks();if(!bl.length||bl.some(n=>n.nodeType===3||!n.tagName)){ensureBlock();bl=selBlocks()}if(!bl.length)break;
      const inC=bl.length===1&&bl[0].hasAttribute&&bl[0].hasAttribute('data-callout');
      if(inC){if(v==='none'||bl[0].getAttribute('data-callout')===v)bl[0].replaceWith(...[...bl[0].childNodes]);else bl[0].setAttribute('data-callout',v)}
      else if(v!=='none'){const box=document.createElement('div');box.setAttribute('data-callout',v);bl[0].before(box);bl.forEach(n=>box.appendChild(n));if(!box.firstChild||box.firstChild.nodeType===3){const p=document.createElement('p');p.append(...box.childNodes);box.appendChild(p)}}break}
    case'clear':{document.execCommand('removeFormat');unwrapInSel('span[data-font],span[data-color],mark');break}
    case'formula':{const t=s.toString();if(!t)return toast('Select some text first, e.g. CH3CH2OH');document.execCommand('insertHTML',false,chemSegs(t).map(g=>g.k==='sub'?`<sub>${esc(g.t)}</sub>`:g.k==='sup'?`<sup>${esc(g.t)}</sup>`:esc(g.t)).join(''));break}
    case'arrow':document.execCommand('insertText',false,' → ');break;
    case'hr':document.execCommand('insertHorizontalRule');break;
    case'comment':addTextComment();return;
    case'card':cardFromSelection();return;
    case'insertUnorderedList':toggleList('ul');break;
    case'insertOrderedList':toggleList('ol');break;
    case'indent':indentLi(false);break;
    case'outdent':indentLi(true);break;
    default:document.execCommand(c,false,v||null);
  }
  textChanged();updateTextState();
}
function updateTextState(){
  const pane=$('#textTools');if(!pane||pane.classList.contains('off'))return;const s=getSelection();if(!s.rangeCount||!TX.body)return;
  const n=topBlock(s.getRangeAt(0).startContainer),tag=n&&n.nodeType===1?n.tagName.toLowerCase():'p',st=PSTYLES.find(p=>p[0]===tag);
  const lbl=$('#txStyle .lbl');if(lbl)lbl.textContent=st?st[1]:'Normal text';
  let el=s.getRangeAt(0).startContainer;if(el.nodeType===3)el=el.parentElement;const fe=el&&el.closest('[data-font]');const fk=fe&&TX.body.contains(fe)?fe.getAttribute('data-font'):(TX.block&&TX.block.font)||'serif';
  const fl=$('#txFont .lbl');if(fl){fl.textContent=FONTS[fk]?FONTS[fk].n:'Serif';fl.style.fontFamily=FONTS[fk]?FONTS[fk].css:''}
  for(const[c,q]of[['bold','bold'],['italic','italic'],['underline','underline'],['subscript','subscript'],['superscript','superscript'],['insertUnorderedList','UL'],['insertOrderedList','OL']]){const b=document.querySelector(`#textTools [data-tx="${c}"]`);if(b){let on=false;if(q==='UL'||q==='OL'){const li=el&&el.closest('li');on=!!(li&&TX.body.contains(li)&&li.parentNode.tagName===q)}else try{on=document.queryCommandState(q)}catch(e){}b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)}}
}

/* markdown-style shortcuts and $maths$ while typing */
function textInput(e,body){
  if(e.inputType==='insertParagraph'){const s=getSelection();if(s.rangeCount){const n=topBlock(s.getRangeAt(0).startContainer);if(n&&n.nodeType===1&&/^(H1|H2|H3|BLOCKQUOTE)$/.test(n.tagName)&&!n.textContent.trim()){document.execCommand('formatBlock',false,'<p>');}}return}
  if(e.inputType==='insertText'&&(e.data===' '||e.data==='$')){
    const s=getSelection();if(!s.rangeCount)return;const r=s.getRangeAt(0),node=r.startContainer;if(node.nodeType!==3)return;const before=node.textContent.slice(0,r.startOffset);
    if(e.data===' '){
      const li=node.parentElement&&node.parentElement.closest('li'),cont=li&&body.contains(li)?li:topBlock(node);
      const firstText=cont&&(cont.nodeType===3?cont:document.createTreeWalker(cont,NodeFilter.SHOW_TEXT).nextNode());
      if(firstText===node){const mk=before.replace(/ /g,' ');const map={'# ':['style','h1'],'## ':['style','h2'],'### ':['style','h3'],'> ':['style','blockquote'],'- ':['insertUnorderedList'],'* ':['insertUnorderedList'],'1. ':['insertOrderedList'],'--- ':['hr']};const m=map[mk];
        if(m&&!li){
          const strip=()=>{let t=node;if(!t.isConnected){const s3=getSelection();if(!s3.rangeCount)return;const c=s3.getRangeAt(0).startContainer,hb=(c.nodeType===3?c.parentElement:c).closest('li,h1,h2,h3,blockquote,p');if(!hb)return;t=document.createTreeWalker(hb,NodeFilter.SHOW_TEXT).nextNode();if(!t)return}if(!t.textContent.replace(/\u00a0/g,' ').startsWith(mk))return;const host=t.parentElement;
            const rr=document.createRange();rr.setStart(t,0);rr.setEnd(t,mk.length);rr.deleteContents();const sel=getSelection(),r2=document.createRange();if(!t.textContent&&!host.textContent){t.remove();if(!host.querySelector('br'))host.appendChild(document.createElement('br'));r2.setStart(host,0)}else r2.setStart(t,t.textContent.length);sel.removeAllRanges();sel.addRange(r2)};
          if(m[0]==='hr'){strip();textCmd('hr')}
          else{if(m[0]!=='style'&&cont&&cont.nodeType===1&&/^H[123]$/.test(cont.tagName))document.execCommand('formatBlock',false,'<p>');textCmd(m[0],m[1]);strip();textChanged()}
          return true}}
    }else{
      const m=/(\$\$)([^$]+?)\$\$$|(?:^|[^\\$])\$([^$\s](?:[^$]*[^$\s])?)\$$/.exec(before);if(!m)return;
      const disp=!!m[1],tex=(disp?m[2]:m[3]).trim();if(!tex)return;const len=disp?m[0].length:m[3].length+2;
      const rr=document.createRange();rr.setStart(node,r.startOffset-len);rr.setEnd(node,r.startOffset);rr.deleteContents();
      insertMathAt(rr,tex,disp);return true}
  }
}
function insertMathAt(range,tex,disp){
  const sp=document.createElement('span');sp.setAttribute('data-tex',tex);if(disp)sp.setAttribute('data-display','1');sp.textContent=tex;
  range.insertNode(sp);const after=document.createTextNode(' ');sp.after(after);const s=getSelection(),r=document.createRange();r.setStart(after,1);s.removeAllRanges();s.addRange(r);
  renderMathIn(TX.body);textChanged()}

/* equation dialog */
const EQ_SNIPS=[
 ['Basics',[['x^{2}','Power'],['x_{i}','Subscript'],['\\frac{a}{b}','Fraction'],['\\sqrt{x}','Square root'],['\\pm','±'],['\\times','×'],['\\cdot','·'],['\\approx','≈'],['\\neq','≠'],['\\leq','≤'],['\\geq','≥'],['\\propto','∝'],['\\infty','∞'],['\\degree','°']]],
 ['Greek',[['\\alpha'],['\\beta'],['\\gamma'],['\\delta'],['\\Delta'],['\\epsilon'],['\\lambda'],['\\mu'],['\\nu'],['\\pi'],['\\sigma'],['\\theta'],['\\chi'],['\\Omega']]],
 ['Chemistry',[['\\ce{H2O}','Formula'],['\\ce{SO4^2-}','Ion'],['\\ce{A + B -> C}','Reaction'],['\\ce{A <=> B}','Equilibrium'],['\\ce{A ->[H+][\\Delta] B}','Conditions'],['\\ce{^{14}_{6}C}','Isotope'],['\\ce{CuSO4.5H2O}','Hydrate'],['\\ce{AgCl v}','Precipitate']]],
 ['Equations',[['\\Delta G = \\Delta H - T\\Delta S','Gibbs'],['K_a = \\frac{[\\ce{H+}][\\ce{A-}]}{[\\ce{HA}]}','Ka'],['\\mathrm{pH} = -\\log_{10}[\\ce{H+}]','pH'],['k = A\\,e^{-E_a/RT}','Arrhenius'],['\\text{rate} = k[\\ce{A}]^m[\\ce{B}]^n','Rate law'],['\\Delta G^\\circ = -RT\\ln K','ΔG° and K'],['PV = nRT','Ideal gas'],['c = \\frac{n}{V}','Concentration']]]];
let EQ={sp:null,range:null};
function openEq(span){
  if(!span&&!restoreSel())return toast('Click in some text first, then add an equation.');
  EQ={sp:span||null,range:span?null:(getSelection().rangeCount?getSelection().getRangeAt(0).cloneRange():null)};
  const sel=!span&&EQ.range?EQ.range.toString():'';
  $('#eqIn').value=span?span.getAttribute('data-tex'):sel;$('#eqDisp').checked=span?span.getAttribute('data-display')==='1':false;
  $('#eqDel').hidden=!span;$('#eqOk').textContent=span?'Save':'Insert';$('#eqTitle').textContent=span?'Edit equation':'Insert equation';
  $('#eqScrim').hidden=false;$('#eqIn').focus();$('#eqIn').select();eqPreview();
  mathReady().then(ok=>{if(!ok){$('#eqErr').textContent='Couldn\'t load the maths tools. Reload the app and try again.';return}eqPreview();renderSnips()})}
function closeEq(){$('#eqScrim').hidden=true;if(TX.body)restoreSel()}
function eqPreview(){const tex=$('#eqIn').value.trim(),box=$('#eqPrev');$('#eqErr').textContent='';$('#eqOk').disabled=!tex;
  if(!tex){box.innerHTML='<span class="eq-ph">Preview appears here</span>';return}
  if(!(window.MathJax&&window.MathJax.tex2svg)){box.textContent=tex;return}
  const r=texSVG(tex,$('#eqDisp').checked||true);if(r.err){$('#eqErr').textContent=r.err;box.textContent=tex}else box.innerHTML=r.svg}
function renderSnips(){const box=$('#eqSnips');if(box.dataset.done)return;box.dataset.done='1';
  box.innerHTML=EQ_SNIPS.map(([g,items])=>`<div class="eq-g"><div class="eq-gh">${g}</div><div class="eq-gb">${items.map(([t,l])=>{const r=texSVG(t,false);return`<button type="button" data-snip="${esc(t)}" title="${esc(l||t)}">${r.svg||esc(t)}</button>`}).join('')}</div></div>`).join('')}
function eqSave(){
  const tex=$('#eqIn').value.trim();if(!tex)return;const disp=$('#eqDisp').checked;
  if(EQ.sp){EQ.sp.setAttribute('data-tex',tex);disp?EQ.sp.setAttribute('data-display','1'):EQ.sp.removeAttribute('data-display');delete EQ.sp.dataset.r;$('#eqScrim').hidden=true;renderMathIn(TX.body);textChanged();return}
  $('#eqScrim').hidden=true;restoreSel();const s=getSelection();let r=EQ.range&&TX.body.contains(EQ.range.startContainer)?EQ.range:(s.rangeCount?s.getRangeAt(0):null);if(!r)return;
  s.removeAllRanges();s.addRange(r);if(!r.collapsed)r.deleteContents();insertMathAt(getSelection().getRangeAt(0),tex,disp)}
function eqDelete(){if(EQ.sp){const b=EQ.sp.closest('.text-body');EQ.sp.remove();$('#eqScrim').hidden=true;if(b){TX.body=b;textChanged()}}}

/* outline: headings across the note */
let olT;function refreshOutline(){clearTimeout(olT);olT=setTimeout(()=>{const box=$('#outline');if(!box)return;const hs=App.mode==='notes'?[...document.querySelectorAll('#blocks .text-body h1,#blocks .text-body h2,#blocks .text-body h3')].filter(h=>h.textContent.trim()):[];
  box.hidden=hs.length<2;box.innerHTML=hs.length<2?'':'<div class="ol-h">On this page</div>'+hs.map((h,i)=>`<button class="ol-${h.tagName.toLowerCase()}" data-ol="${i}">${esc(h.textContent.trim().slice(0,80))}</button>`).join('');box._hs=hs},250)}

/* palette context: structure tools, text tools */
function setCtx(k){App.ctx=k;const tt=$('#textTools'),ps=$('#palStruct');if(!tt)return;const tx=k==='text';tt.classList.toggle('off',!tx);tt.inert=!tx;tt.setAttribute('aria-hidden',!tx);ps.classList.toggle('off',tx);ps.inert=tx;ps.setAttribute('aria-hidden',tx);document.querySelectorAll('.ctx-tab').forEach(b=>{const on=b.dataset.ctx===k;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});if(k==='text')updateTextState()}
function menuHTML(id,items,cls=''){return`<div class="tx-menu ${cls}" id="${id}m" role="menu" hidden>${items}</div>`}
function buildTextTools(){
  try{document.execCommand('defaultParagraphSeparator',false,'p')}catch(e){}
  const svg=p=>`<svg viewBox="0 0 16 16" aria-hidden="true">${p}</svg>`;
  const I={ul:svg('<circle cx="3" cy="4.5" r="1"/><circle cx="3" cy="8" r="1"/><circle cx="3" cy="11.5" r="1"/><path d="M6 4.5h7M6 8h7M6 11.5h7"/>'),ol:svg('<path d="M6 4.5h7M6 8h7M6 11.5h7"/><text x="1.2" y="6" font-size="4.6" stroke="none" fill="currentColor">1</text><text x="1.2" y="9.6" font-size="4.6" stroke="none" fill="currentColor">2</text><text x="1.2" y="13.2" font-size="4.6" stroke="none" fill="currentColor">3</text>'),
    al:svg('<path d="M2.5 4h11M2.5 7h7M2.5 10h11M2.5 13h7"/>'),ac:svg('<path d="M2.5 4h11M4.5 7h7M2.5 10h11M4.5 13h7"/>'),ar:svg('<path d="M2.5 4h11M6.5 7h7M2.5 10h11M6.5 13h7"/>'),hr:svg('<path d="M2 8h12"/>'),clr:svg('<path d="M4 3h8M8 3l-2 10M3 13l10-10" />'),undo:svg('<path d="M4.5 6.5h5a3 3 0 010 6H7"/><path d="M6.5 4l-2.5 2.5L6.5 9"/>'),redo:svg('<path d="M11.5 6.5h-5a3 3 0 000 6H9"/><path d="M9.5 4l2.5 2.5L9.5 9"/>'),out:svg('<path d="M9 4.5H3M13 8H3M9 11.5H3"/><path d="M13 3.5l-2 1 2 1"/>'),ind:svg('<path d="M13 4.5H7M13 8H3M13 11.5H7"/><path d="M3 3.5l2 1-2 1"/>')};
  const styles=PSTYLES.map(([t,l])=>`<button role="menuitem" data-tx="style" data-v="${t}" class="ps-${t}">${l}</button>`).join('');
  const fonts=Object.entries(FONTS).map(([k,v])=>`<button role="menuitem" data-tx="font" data-v="${k}" style="font-family:${v.css}">${v.n}</button>`).join('');
  const cols=`<div class="tx-mh">Text colour</div><div class="tx-sw">${Object.entries(TCOL).map(([k,l])=>`<button role="menuitem" data-tx="color" data-v="${k}" title="${l}" aria-label="${l} text"><i data-color="${k}">A</i></button>`).join('')}<button role="menuitem" data-tx="color" data-v="none" title="Default colour" aria-label="Default text colour"><i>A</i></button></div><div class="tx-mh">Highlight</div><div class="tx-sw">${Object.entries(HLS).map(([k,l])=>`<button role="menuitem" data-tx="hl" data-v="${k}" title="${l} highlight" aria-label="${l} highlight"><mark data-hl="${k}">ab</mark></button>`).join('')}<button role="menuitem" data-tx="hl" data-v="none" title="Remove highlight" aria-label="Remove highlight">✕</button></div>`;
  const calls=Object.entries(CALLOUTS).map(([k,l])=>`<button role="menuitem" data-tx="callout" data-v="${k}"><span class="co-dot" data-callout-dot="${k}"></span>${l}</button>`).join('')+`<button role="menuitem" data-tx="callout" data-v="none">Remove box</button>`;
  const g=(lbl,inner)=>`<div class="tgroup"><div class="tglabel">${lbl}</div><div class="tgbody">${inner}</div></div>`;
  $('#textTools').innerHTML=
   g('Style',`<div class="tx-dd"><button class="tx-ddb" id="txStyle" aria-haspopup="menu" title="Paragraph style (Ctrl+Alt+1, 2, 3, 0)"><span class="lbl">Normal text</span>▾</button>${menuHTML('txStyle',styles,'styles')}</div><div class="tx-dd"><button class="tx-ddb" id="txFont" aria-haspopup="menu" title="Font"><span class="lbl">Serif</span>▾</button>${menuHTML('txFont',fonts)}</div>`)+
   g('Format',`<button class="tb" data-tx="bold" title="Bold (Ctrl+B)" aria-label="Bold"><b>B</b></button><button class="tb" data-tx="italic" title="Italic (Ctrl+I)" aria-label="Italic"><i style="font-family:var(--font-note)">I</i></button><button class="tb" data-tx="underline" title="Underline (Ctrl+U)" aria-label="Underline"><u>U</u></button><button class="tb" data-tx="subscript" title="Subscript (Ctrl+,)" aria-label="Subscript"><span>x<sub>2</sub></span></button><button class="tb" data-tx="superscript" title="Superscript (Ctrl+.)" aria-label="Superscript"><span>x<sup>2</sup></span></button><div class="tx-dd"><button class="tb tx-ddb" id="txCol" aria-haspopup="menu" title="Text colour and highlight" aria-label="Text colour and highlight"><span class="tx-a">A</span></button>${menuHTML('txCol',cols,'cols')}</div><button class="tb" data-tx="clear" title="Clear formatting" aria-label="Clear formatting">${I.clr}</button>`)+
   g('Paragraph',`<button class="tb" data-tx="insertUnorderedList" title="Bulleted list (type - then space)" aria-label="Bulleted list">${I.ul}</button><button class="tb" data-tx="insertOrderedList" title="Numbered list (type 1. then space)" aria-label="Numbered list">${I.ol}</button><button class="tb" data-tx="outdent" title="Decrease indent (Shift+Tab)" aria-label="Decrease indent">${I.out}</button><button class="tb" data-tx="indent" title="Increase indent (Tab)" aria-label="Increase indent">${I.ind}</button><button class="tb" data-tx="align" data-v="left" title="Align left" aria-label="Align left">${I.al}</button><button class="tb" data-tx="align" data-v="center" title="Centre" aria-label="Centre">${I.ac}</button><button class="tb" data-tx="align" data-v="right" title="Align right" aria-label="Align right">${I.ar}</button>`)+
   g('Insert',`<button class="tb wide" id="txEq" title="Equation (Ctrl+M, or type $…$)" aria-label="Insert equation"><span style="font-family:var(--font-note);font-style:italic">∑x²</span></button><button class="tb" data-tx="formula" title="Format selected text as a formula, e.g. CH3CO2H" aria-label="Format as chemical formula"><span>H<sub>2</sub>O</span></button><button class="tb" data-tx="arrow" title="Reaction arrow" aria-label="Insert reaction arrow">→</button><div class="tx-dd"><button class="tb tx-ddb wide" id="txBox" aria-haspopup="menu" title="Callout box: key idea, definition, example…" aria-label="Callout box">▣ Box</button>${menuHTML('txBox',calls)}</div><button class="tb" data-tx="hr" title="Divider line (type --- then space)" aria-label="Divider line">${I.hr}</button>`)+
   g('Review',`<button class="tb wide" data-tx="comment" title="Comment on the selected text (Ctrl+Alt+C)" aria-label="Comment on the selected text">💬 Comment</button><button class="tb wide" data-tx="card" title="Make a flashcard from the selected text" aria-label="Make a flashcard from the selected text">+ Card</button>`)+
   g('Edit',`<button class="tb" data-tx="undo" title="Undo (Ctrl+Z)" aria-label="Undo">${I.undo}</button><button class="tb" data-tx="redo" title="Redo (Ctrl+Shift+Z)" aria-label="Redo">${I.redo}</button>`);
  const tt=$('#textTools');
  tt.addEventListener('mousedown',e=>{if(e.target.closest('button'))e.preventDefault()});
  tt.addEventListener('click',e=>{const dd=e.target.closest('.tx-ddb');
    if(dd){const m=$('#'+dd.id+'m'),open=m.hidden;tt.querySelectorAll('.tx-menu').forEach(x=>x.hidden=true);m.hidden=!open;dd.setAttribute('aria-expanded',open);return}
    if(e.target.closest('#txEq')){tt.querySelectorAll('.tx-menu').forEach(x=>x.hidden=true);return openEq()}
    const b=e.target.closest('[data-tx]');if(!b)return;tt.querySelectorAll('.tx-menu').forEach(x=>x.hidden=true);textCmd(b.dataset.tx,b.dataset.v)});
  document.addEventListener('pointerdown',e=>{if(!e.target.closest('.tx-dd'))tt.querySelectorAll('.tx-menu').forEach(x=>x.hidden=true)});
}
/* keyboard shortcuts while typing */
function textKeys(e,body){
  const mod=e.ctrlKey||e.metaKey;
  if(e.key==='Tab'&&!mod){const li=getSelection().anchorNode;const inList=li&&(li.nodeType===1?li:li.parentElement).closest('li');if(inList){e.preventDefault();textCmd(e.shiftKey?'outdent':'indent');return}}
  if(!mod)return;const k=e.key.toLowerCase();
  if(e.altKey&&'0123'.includes(k)&&k.length===1){e.preventDefault();textCmd('style',k==='0'?'p':'h'+k);return}
  if(e.altKey&&(e.code==='Digit1'||e.code==='Digit2'||e.code==='Digit3'||e.code==='Digit0')){e.preventDefault();const d=e.code.slice(-1);textCmd('style',d==='0'?'p':'h'+d);return}
  if(e.altKey&&e.code==='KeyC'){e.preventDefault();addTextComment();return}
  if(k==='m'&&!e.shiftKey){e.preventDefault();openEq();return}
  if(k===','){e.preventDefault();textCmd('subscript');return}
  if(k==='.'){e.preventDefault();textCmd('superscript');return}
  if(e.shiftKey&&(e.code==='Digit7'||k==='7')){e.preventDefault();textCmd('insertOrderedList');return}
  if(e.shiftKey&&(e.code==='Digit8'||k==='8')){e.preventDefault();textCmd('insertUnorderedList');return}
  if(k==='b'||k==='i'||k==='u'){setTimeout(()=>{textChanged();updateTextState()})}
}
function wireTextBody(body,b,n){
  body.innerHTML=b.html||'';if(b.font)body.setAttribute('data-font',b.font);renderMathIn(body);
  body.addEventListener('focus',()=>{if(TX.body!==body)setTextTarget(body);else setCtx('text')});
  body.addEventListener('input',e=>{TX.body=body;TX.block=b;TX.note=n;if(textInput(e,body))return;textChanged()});
  body.addEventListener('keydown',e=>{TX.body=body;TX.block=b;TX.note=n;textKeys(e,body)});
  body.addEventListener('click',e=>{const m=e.target.closest('span[data-tex]');if(m&&body.contains(m)){TX.body=body;TX.block=b;TX.note=n;openEq(m)}});
  body.addEventListener('paste',e=>{const cd=e.clipboardData||window.clipboardData;const fs=cd&&cd.files?[...cd.files].filter(f=>f.type.startsWith('image/')):[];e.preventDefault();if(fs.length){addImages(fs,b);return}const t=cd.getData('text/plain');document.execCommand('insertText',false,t)});
}

/* ---------- sketch / whiteboard blocks ---------- */
const SKW=1000;
const SK_COL={ink:'var(--ink)',accent:'var(--accent)',a2:'var(--accent2)',curl:'var(--curl)',green:'#2f9e44',orange:'#e8590c'};
const SK_HL={yellow:'rgba(255,212,0,.42)',green:'rgba(64,192,87,.34)',pink:'rgba(240,101,149,.34)',blue:'rgba(77,171,247,.36)'};
const SK_TOOLS=[['pen','Pen','P','<path d="M3 13l1-3.5 6.5-6.5 2.5 2.5L6.5 12z"/><path d="M9 4.5l2.5 2.5"/>'],['hl','Highlighter','H','<path d="M4 12.5l1.5-4 5-5 2.5 2.5-5 5z"/><path d="M3 14h6" stroke-width="2.6" opacity=".45"/>'],['line','Line','L','<path d="M3 13L13 3"/>'],['arrow','Arrow','A','<path d="M3 13L13 3M7.5 3H13v5.5"/>'],['rect','Rectangle','R','<rect x="2.5" y="4" width="11" height="8" rx="1"/>'],['ellipse','Ellipse','O','<ellipse cx="8" cy="8" rx="5.5" ry="4"/>'],['erase','Eraser','E','<path d="M6 13.5h7.5M2.8 9.7l5.6-5.6a1.2 1.2 0 011.7 0l2.3 2.3a1.2 1.2 0 010 1.7L8 12.5H5.6z"/>']];
const SK_W={pen:[1.6,3,6],hl:[12,20,30],line:[1.6,3,6],arrow:[1.6,3,6],rect:[1.6,3,6],ellipse:[1.6,3,6]};
const SKS={tool:'pen',color:'ink',hl:'yellow',size:1,penOnly:false};
try{const s=JSON.parse(localStorage.getItem('bondline.sketch')||'{}');Object.assign(SKS,{tool:SK_TOOLS.some(t=>t[0]===s.tool)?s.tool:'pen',color:SK_COL[s.color]?s.color:'ink',hl:SK_HL[s.hl]?s.hl:'yellow',size:[0,1,2].includes(s.size)?s.size:1,penOnly:!!s.penOnly})}catch(e){}
const skSave=()=>{try{localStorage.setItem('bondline.sketch',JSON.stringify(SKS))}catch(e){}};
function emptySketch(h=520){return{h,bg:'dots',strokes:[]}}
function cleanSketch(d){d=d&&typeof d==='object'?d:{};const out={h:Math.max(160,Math.min(8000,Math.round(+d.h)||520)),bg:['dots','grid','lines','plain'].includes(d.bg)?d.bg:'dots',strokes:[]};
  for(const s of(Array.isArray(d.strokes)?d.strokes:[]).slice(0,6000)){if(!s||!SK_W[s.k])continue;const isHl=s.k==='hl';if(isHl?!SK_HL[s.c]:!SK_COL[s.c])continue;const p=String(s.p||'');if(p.length>400000||!/^-?\d+(,-?\d+)*$/.test(p))continue;out.strokes.push({k:s.k,c:s.c,w:Math.max(0.5,Math.min(40,+s.w||2)),p})}
  return out}
/* points are stored as delta-encoded integers (x, y and, for pens, pressure 0–20) to keep notes small enough to sync */
const skStride=k=>k==='pen'?3:2;
function skEncode(pts,st){const o=[],prev=[0,0,0];for(let i=0;i<pts.length;i+=st)for(let j=0;j<st;j++){const v=Math.round(pts[i+j]);o.push(v-prev[j]);prev[j]=v}return o.join(',')}
const skDec=new WeakMap();
function skDecode(s){let r=skDec.get(s);if(r)return r;const st=skStride(s.k),v=s.p.split(',').map(Number),prev=[0,0,0];r=new Array(v.length);for(let i=0;i<v.length;i++){const j=i%st;prev[j]+=v[i];r[i]=prev[j]}skDec.set(s,r);return r}
function rdp(pts,st,eps){const n=pts.length/st;if(n<3)return pts;const keep=new Uint8Array(n);keep[0]=keep[n-1]=1;const stack=[[0,n-1]];
  while(stack.length){const[a,b]=stack.pop();const ax=pts[a*st],ay=pts[a*st+1],bx=pts[b*st],by=pts[b*st+1],dx=bx-ax,dy=by-ay,L=Math.hypot(dx,dy)||1;let mi=-1,md=0;
    for(let i=a+1;i<b;i++){const d=Math.abs(dy*pts[i*st]-dx*pts[i*st+1]+bx*ay-by*ax)/L+(st===3?Math.abs(pts[i*st+2]-(pts[a*st+2]+pts[b*st+2])/2)*0.15:0);if(d>md){md=d;mi=i}}
    if(md>eps&&mi>0){keep[mi]=1;stack.push([a,mi],[mi,b])}}
  const o=[];for(let i=0;i<n;i++)if(keep[i])for(let j=0;j<st;j++)o.push(pts[i*st+j]);return o}
const r1=n=>Math.round(n*10)/10;
function smoothPath(p,st){const n=p.length/st;if(n<2)return'';if(n===2)return`M${r1(p[0])} ${r1(p[1])}L${r1(p[st])} ${r1(p[st+1])}`;let d=`M${r1(p[0])} ${r1(p[1])}`;
  for(let i=1;i<n-1;i++){const x=p[i*st],y=p[i*st+1],nx=p[(i+1)*st],ny=p[(i+1)*st+1];d+=`Q${r1(x)} ${r1(y)} ${r1((x+nx)/2)} ${r1((y+ny)/2)}`}
  return d+`L${r1(p[(n-1)*st])} ${r1(p[(n-1)*st+1])}`}
function penOutline(p,w){const n=p.length/3,L=[],R=[];for(let i=0;i<n;i++){const x=p[i*3],y=p[i*3+1],pr=p[i*3+2]/20,a=Math.max(0,i-1),b=Math.min(n-1,i+1);let dx=p[b*3]-p[a*3],dy=p[b*3+1]-p[a*3+1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const hw=w*(0.25+0.9*pr)/2;L.push([x-dy*hw,y+dx*hw]);R.push([x+dy*hw,y-dx*hw])}
  const pts=L.concat(R.reverse());let d=`M${r1(pts[0][0])} ${r1(pts[0][1])}`;for(let i=1;i<pts.length;i++){const[x,y]=pts[i],[px,py]=pts[i-1];d+=`Q${r1(px)} ${r1(py)} ${r1((x+px)/2)} ${r1((y+py)/2)}`}return d+'Z'}
function strokeSVG(s,col,pts){
  pts=pts||skDecode(s);const st=skStride(s.k),c=col(s),n=pts.length/st,w=s.w;if(!n)return'';
  if(s.k==='pen'){if(n===1)return`<circle cx="${pts[0]}" cy="${pts[1]}" r="${r1(w*0.6)}" fill="${c}"/>`;let mn=99,mx=-1;for(let i=2;i<pts.length;i+=3){mn=Math.min(mn,pts[i]);mx=Math.max(mx,pts[i])}
    if(mx-mn>2)return`<path d="${penOutline(pts,w*1.6)}" fill="${c}"/><circle cx="${pts[0]}" cy="${pts[1]}" r="${r1(w*(0.25+0.9*pts[2]/20)*0.8)}" fill="${c}"/>`;
    return`<path d="${smoothPath(pts,3)}" fill="none" stroke="${c}" stroke-width="${r1(w*(0.25+0.9*mx/20)*1.6)}" stroke-linecap="round" stroke-linejoin="round"/>`}
  if(s.k==='hl')return`<path d="${n===1?`M${pts[0]} ${pts[1]}l.1 0`:smoothPath(pts,2)}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const[x1,y1]=[pts[0],pts[1]],[x2,y2]=[pts[pts.length-2],pts[pts.length-1]],sw=`fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  if(s.k==='line')return`<path d="M${x1} ${y1}L${x2} ${y2}" ${sw}/>`;
  if(s.k==='arrow'){const a=Math.atan2(y2-y1,x2-x1),h=8+w*3;return`<path d="M${x1} ${y1}L${x2} ${y2}M${r1(x2-h*Math.cos(a-0.45))} ${r1(y2-h*Math.sin(a-0.45))}L${x2} ${y2}L${r1(x2-h*Math.cos(a+0.45))} ${r1(y2-h*Math.sin(a+0.45))}" ${sw}/>`}
  if(s.k==='rect')return`<rect x="${Math.min(x1,x2)}" y="${Math.min(y1,y2)}" width="${Math.abs(x2-x1)}" height="${Math.abs(y2-y1)}" rx="3" ${sw}/>`;
  if(s.k==='ellipse')return`<ellipse cx="${r1((x1+x2)/2)}" cy="${r1((y1+y2)/2)}" rx="${r1(Math.abs(x2-x1)/2)}" ry="${r1(Math.abs(y2-y1)/2)}" ${sw}/>`;
  return''}
const skScreenCol=s=>s.k==='hl'?SK_HL[s.c]:SK_COL[s.c];
function skPrintCol(s){if(s.k==='hl')return SK_HL[s.c];return{ink:'#151515',accent:PRINT.accent||'#1f5fd1',a2:PRINT.a2,curl:PRINT.curl}[s.c]||SK_COL[s.c]}
function sketchSVGString(d,col,bg){const bb=d.h;return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SKW} ${bb}" width="${SKW}" height="${bb}">${bg?`<rect width="${SKW}" height="${bb}" fill="${bg}"/>`:''}${d.strokes.map(s=>strokeSVG(s,col)).join('')}</svg>`}
function sketchBounds(d){let y=0;for(const s of d.strokes){const p=skDecode(s),st=skStride(s.k);for(let i=1;i<p.length;i+=st)y=Math.max(y,p[i])}return Math.min(d.h,Math.ceil(y+30))}
async function sketchCanvas(d,sc,col,bg){if(!d.strokes.length)return null;const h=sketchBounds(d);const svg=sketchSVGString({...d,h},col||skPrintCol,bg||'#ffffff');const img=new Image();img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);await img.decode();const cv=document.createElement('canvas');cv.width=SKW*sc;cv.height=h*sc;const c=cv.getContext('2d');c.scale(sc,sc);c.drawImage(img,0,0);cv.dataset.w=SKW;return cv}
function distSeg(px,py,ax,ay,bx,by){const dx=bx-ax,dy=by-ay,l=dx*dx+dy*dy;let t=l?((px-ax)*dx+(py-ay)*dy)/l:0;t=Math.max(0,Math.min(1,t));return Math.hypot(px-ax-t*dx,py-ay-t*dy)}
function strokeHit(s,x,y,r){const p=skDecode(s),st=skStride(s.k),n=p.length/st,R=r+s.w/2;
  if(s.k==='rect'||s.k==='ellipse'){const x1=p[0],y1=p[1],x2=p[p.length-2],y2=p[p.length-1];if(s.k==='rect'){const xs=[x1,x2],ys=[y1,y2];return distSeg(x,y,x1,y1,x2,y1)<R||distSeg(x,y,x2,y1,x2,y2)<R||distSeg(x,y,x2,y2,x1,y2)<R||distSeg(x,y,x1,y2,x1,y1)<R}
    const cx=(x1+x2)/2,cy=(y1+y2)/2,rx=Math.abs(x2-x1)/2||1,ry=Math.abs(y2-y1)/2||1;for(let t=0;t<64;t++){const a=t/32*Math.PI,b=(t+1)/32*Math.PI;if(distSeg(x,y,cx+rx*Math.cos(a),cy+ry*Math.sin(a),cx+rx*Math.cos(b),cy+ry*Math.sin(b))<R)return true}return false}
  if(n===1)return Math.hypot(x-p[0],y-p[1])<R;if(s.k==='line'||s.k==='arrow')return distSeg(x,y,p[0],p[1],p[p.length-2],p[p.length-1])<R;
  for(let i=0;i<n-1;i++)if(distSeg(x,y,p[i*st],p[i*st+1],p[(i+1)*st],p[(i+1)*st+1])<R)return true;return false}

class Sketch{
  constructor(b,host,n){
    this.b=b;this.n=n;this.d=b.data=cleanSketch(b.data);this.host=host;this.undoS=[];this.redoS=[];this.cur=null;
    const sw=(k,t,body)=>`<button class="sk-t" data-sk-tool="${k}" title="${t} (${body})" aria-label="${t}">`;
    host.innerHTML=`<div class="sk-bar" role="toolbar" aria-label="Sketch tools">
      <div class="sk-grp">${SK_TOOLS.map(([k,t,key,p])=>`<button class="sk-b" data-sk-tool="${k}" title="${t} (${key})" aria-label="${t}"><svg viewBox="0 0 16 16" aria-hidden="true">${p}</svg></button>`).join('')}</div>
      <div class="sk-grp sk-cols"></div>
      <div class="sk-grp">${[0,1,2].map(i=>`<button class="sk-b sk-size" data-sk-size="${i}" title="${['Thin','Medium','Thick'][i]}" aria-label="${['Thin','Medium','Thick'][i]} line"><i style="width:${[4,7,11][i]}px;height:${[4,7,11][i]}px"></i></button>`).join('')}</div>
      <div class="sk-grp"><button class="sk-b" data-sk="undo" title="Undo (Ctrl+Z)" aria-label="Undo"><svg viewBox="0 0 16 16"><path d="M4.5 6.5h5a3 3 0 010 6H7"/><path d="M6.5 4l-2.5 2.5L6.5 9"/></svg></button><button class="sk-b" data-sk="redo" title="Redo (Ctrl+Shift+Z)" aria-label="Redo"><svg viewBox="0 0 16 16"><path d="M11.5 6.5h-5a3 3 0 000 6H9"/><path d="M9.5 4l2.5 2.5L9.5 9"/></svg></button></div>
      <div class="sk-grp sk-right"><button class="sk-b sk-txt" data-sk="bg" title="Background: dots, grid, lines or plain" aria-label="Change background"></button><button class="sk-b sk-txt" data-sk="pen" title="Pen only: fingers scroll and only a stylus draws" aria-pressed="false">✍ Pen only</button><button class="sk-b" data-sk="png" title="Save as image" aria-label="Save sketch as PNG"><svg viewBox="0 0 16 16"><path d="M8 2.5v8M4.5 7L8 10.5 11.5 7M3 13.5h10"/></svg></button><button class="sk-b" data-sk="full" title="Full screen (F)" aria-label="Full screen"><svg viewBox="0 0 16 16"><path d="M3 6.5V3h3.5M13 6.5V3H9.5M3 9.5V13h3.5M13 9.5V13H9.5"/></svg></button><button class="sk-b sk-txt sk-clear" data-sk="clear" title="Erase everything">Clear</button></div>
    </div><div class="sk-wrap"><svg class="sk-svg" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sketch"><defs>
      <pattern id="skd-${b.id}" width="25" height="25" patternUnits="userSpaceOnUse"><circle cx="12.5" cy="12.5" r="1.3" fill="var(--grid)"/></pattern>
      <pattern id="skg-${b.id}" width="25" height="25" patternUnits="userSpaceOnUse"><path d="M25 0H0V25" fill="none" stroke="var(--grid)" stroke-width="1"/></pattern>
      <pattern id="skl-${b.id}" width="1000" height="32" patternUnits="userSpaceOnUse"><path d="M0 31.5H1000" stroke="var(--grid)" stroke-width="1"/></pattern></defs>
      <rect class="sk-bg" x="0" y="0" width="${SKW}" height="100%"/><g class="sk-strokes"></g><g class="sk-live"></g><circle class="sk-cursor" r="0" fill="none" stroke="var(--muted)" stroke-dasharray="3 3"/></svg><div class="resize" title="Drag to resize"></div></div>`;
    this.svg=host.querySelector('.sk-svg');this.gS=host.querySelector('.sk-strokes');this.gL=host.querySelector('.sk-live');this.cursor=host.querySelector('.sk-cursor');this.wrap=host.querySelector('.sk-wrap');
    host.querySelector('.sk-bar').addEventListener('click',e=>this.barClick(e));
    this.svg.addEventListener('pointerdown',e=>this.down(e));this.svg.addEventListener('pointermove',e=>this.move(e));
    this.svg.addEventListener('pointerup',e=>this.up(e));this.svg.addEventListener('pointercancel',()=>{this.cur=null;this.gL.innerHTML=''});
    this.svg.addEventListener('pointerleave',()=>this.cursor.setAttribute('r',0));
    const rz=host.querySelector('.resize');
    rz.addEventListener('pointerdown',e=>{e.preventDefault();rz.setPointerCapture(e.pointerId);this.rz={y:e.clientY,h:this.d.h,sc:SKW/this.svg.getBoundingClientRect().width}});
    rz.addEventListener('pointermove',e=>{if(!this.rz)return;this.d.h=Math.round(Math.max(160,Math.min(8000,this.rz.h+(e.clientY-this.rz.y)*this.rz.sc)));this.layout()});
    rz.addEventListener('pointerup',()=>{if(!this.rz)return;const ch=this.rz.h!==this.d.h;this.rz=null;if(ch)this.changed()});
    this.syncBar();this.layout();this.render();
  }
  layout(){this.svg.setAttribute('viewBox',`0 0 ${SKW} ${this.d.h}`);this.host.querySelector('.sk-bg').setAttribute('fill',this.d.bg==='plain'?'var(--surface)':`url(#sk${this.d.bg[0]}-${this.b.id})`);this.host.querySelector('.sk-bg').setAttribute('height',this.d.h);this.host.querySelector('[data-sk="bg"]').textContent={dots:'⋯ Dots',grid:'▦ Grid',lines:'☰ Lines',plain:'□ Plain'}[this.d.bg];this.svg.style.touchAction=SKS.penOnly?'pan-x pan-y':'none'}
  render(){this.gS.innerHTML=this.d.strokes.map(s=>strokeSVG(s,skScreenCol)).join('');const n=this.d.strokes.length;this.svg.setAttribute('aria-label',n?`Sketch with ${n} stroke${n>1?'s':''}`:'Empty sketch')}
  syncBar(){const h=this.host;h.querySelectorAll('[data-sk-tool]').forEach(b=>{const on=b.dataset.skTool===SKS.tool;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
    const hl=SKS.tool==='hl',cols=hl?SK_HL:SK_COL,curC=hl?SKS.hl:SKS.color;
    h.querySelector('.sk-cols').innerHTML=Object.entries(cols).map(([k,v])=>`<button class="sk-b sk-col${k===curC?' on':''}" data-sk-col="${k}" title="${k}" aria-label="Colour ${k}" aria-pressed="${k===curC}"><i style="background:${v}"></i></button>`).join('');
    h.querySelector('.sk-cols').hidden=SKS.tool==='erase';
    h.querySelectorAll('[data-sk-size]').forEach(b=>{const on=+b.dataset.skSize===SKS.size;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
    const pb=h.querySelector('[data-sk="pen"]');pb.classList.toggle('on',SKS.penOnly);pb.setAttribute('aria-pressed',SKS.penOnly)}
  barClick(e){App.sketch=this;const t=e.target.closest('[data-sk-tool]');if(t){SKS.tool=t.dataset.skTool;skSave();skSyncAll();return}
    const c=e.target.closest('[data-sk-col]');if(c){if(SKS.tool==='hl')SKS.hl=c.dataset.skCol;else SKS.color=c.dataset.skCol;skSave();skSyncAll();return}
    const z=e.target.closest('[data-sk-size]');if(z){SKS.size=+z.dataset.skSize;skSave();skSyncAll();return}
    const a=e.target.closest('[data-sk]');if(!a)return;const k=a.dataset.sk;
    if(k==='undo')this.undo();else if(k==='redo')this.redo();
    else if(k==='bg'){const L=['dots','grid','lines','plain'];this.d.bg=L[(L.indexOf(this.d.bg)+1)%4];this.layout();this.changed()}
    else if(k==='pen'){SKS.penOnly=!SKS.penOnly;skSave();skSyncAll();toast(SKS.penOnly?'Pen only: fingers scroll, only a stylus draws.':'Fingers and stylus both draw.')}
    else if(k==='full')this.full(!this.host.closest('.block').classList.contains('sk-full'));
    else if(k==='png')this.png();
    else if(k==='clear'){if(!a.classList.contains('armed')){a.classList.add('armed');a.textContent='Clear all?';setTimeout(()=>{a.classList.remove('armed');a.textContent='Clear'},3000);return}a.classList.remove('armed');a.textContent='Clear';if(!this.d.strokes.length)return;this.snap();this.d.strokes=[];this.render();this.changed()}}
  full(on){const sec=this.host.closest('.block');sec.classList.toggle('sk-full',on);document.body.classList.toggle('sk-lock',on);
    if(on){const r=this.wrap.getBoundingClientRect();const need=Math.round(SKW*(innerHeight-60)/Math.max(320,r.width));if(this.d.h<need){this.d.h=need;this.layout();this.changed()}this.host.querySelector('[data-sk="full"]').focus()}
    App.sketch=this}
  async png(){const cs=getComputedStyle(document.documentElement),V={ink:'--ink',accent:'--accent',a2:'--accent2',curl:'--curl'};
    const col=s=>s.k==='hl'?SK_HL[s.c]:V[s.c]?(cs.getPropertyValue(V[s.c]).trim()||'#151515'):SK_COL[s.c];
    const bg=cs.getPropertyValue('--surface').trim()||'#ffffff';
    const cv=await sketchCanvas(this.d,2,col,bg);if(!cv)return toast('The sketch is empty.');
    const blob=await new Promise(r=>cv.toBlob(r,'image/png'));const dl=await getDownloads();if(!dl)return toast('Saving files isn\'t available in this view.');
    try{await dl.save({filename:fileBase()+'-sketch.png',data:blob});toast('Image saved')}catch(e){if(!e||e.code!=='declined')toast('Couldn\'t save the image.')}}
  pt(e){const r=this.svg.getBoundingClientRect(),s=SKW/r.width;return[(e.clientX-r.left)*s,(e.clientY-r.top)*s]}
  pres(e){return e.pointerType==='pen'||(e.pressure>0&&e.pressure!==0.5)?Math.round(Math.max(0.05,e.pressure||0.5)*20):10}
  snap(){this.undoS.push(this.d.strokes.slice());if(this.undoS.length>200)this.undoS.shift();this.redoS=[]}
  undo(){if(!this.undoS.length)return;this.redoS.push(this.d.strokes);this.d.strokes=this.undoS.pop();this.render();this.changed()}
  redo(){if(!this.redoS.length)return;this.undoS.push(this.d.strokes);this.d.strokes=this.redoS.pop();this.render();this.changed()}
  changed(){this.b.data=this.d;App.noteChanged(this.n);const size=JSON.stringify(this.n).length;if(size>850000&&!this._warned){this._warned=true;toast('This note is getting very large. Start a new whiteboard note so it keeps syncing.')}}
  down(e){
    App.sketch=this;if(typeof setCtx==='function'&&App.ctx==='text')setCtx('struct');
    if(e.pointerType==='pen'&&!SKS.penSeen){SKS.penSeen=true;if(!SKS.penOnly){SKS.penOnly=true;skSave();skSyncAll();toast('Stylus detected: fingers now scroll and the pen draws. Tap “Pen only” to change.')}}
    if(SKS.penOnly&&e.pointerType==='touch')return;
    if(e.button>0)return;e.preventDefault();const ae=document.activeElement;if(ae&&ae!==document.body&&ae.blur&&!this.host.contains(ae))ae.blur();this.svg.setPointerCapture(e.pointerId);const[x,y]=this.pt(e);
    if(SKS.tool==='erase'){this.snap();this.erased=false;this.eraseAt(x,y);this.cur={k:'erase'};return}
    const k=SKS.tool,st=skStride(k);this.cur={k,c:k==='hl'?SKS.hl:SKS.color,w:SK_W[k][SKS.size],pts:st===3?[x,y,this.pres(e)]:[x,y]};this.live()}
  move(e){
    const[x,y]=this.pt(e);
    if(SKS.tool==='erase'){this.cursor.setAttribute('cx',x);this.cursor.setAttribute('cy',y);this.cursor.setAttribute('r',10)}else this.cursor.setAttribute('r',0);
    if(!this.cur)return;
    if(this.cur.k==='erase'){for(const ev of(e.getCoalescedEvents?e.getCoalescedEvents():[e])){const[a,b]=this.pt(ev);this.eraseAt(a,b)}return}
    const st=skStride(this.cur.k),P=this.cur.pts;
    if(this.cur.k==='pen'||this.cur.k==='hl'){for(const ev of(e.getCoalescedEvents?e.getCoalescedEvents():[e])){const[a,b]=this.pt(ev);const lx=P[P.length-st],ly=P[P.length-st+1];if(Math.hypot(a-lx,b-ly)<1.2)continue;P.push(a,b);if(st===3)P.push(this.pres(ev))}}
    else{let a=x,b=y;if(e.shiftKey){if(this.cur.k==='line'||this.cur.k==='arrow'){const ang=Math.round(Math.atan2(b-P[1],a-P[0])/(Math.PI/12))*(Math.PI/12),l=Math.hypot(a-P[0],b-P[1]);a=P[0]+l*Math.cos(ang);b=P[1]+l*Math.sin(ang)}else{const m=Math.max(Math.abs(a-P[0]),Math.abs(b-P[1]));a=P[0]+Math.sign(a-P[0])*m;b=P[1]+Math.sign(b-P[1])*m}}this.cur.pts=[P[0],P[1],a,b]}
    this.live()}
  live(){const c=this.cur;if(!c||c.k==='erase')return;this.gL.innerHTML=strokeSVG({k:c.k,c:c.c,w:c.w},skScreenCol,c.pts.length>=skStride(c.k)?c.pts:null)}
  up(e){const c=this.cur;this.cur=null;this.gL.innerHTML='';if(!c)return;
    if(c.k==='erase'){if(this.erased){this.render();this.changed()}else this.undoS.pop();return}
    const st=skStride(c.k);let pts=c.pts;
    if((c.k==='line'||c.k==='arrow'||c.k==='rect'||c.k==='ellipse')&&(pts.length<4||Math.hypot(pts[2]-pts[0],pts[3]-pts[1])<3))return;
    if(c.k==='pen'||c.k==='hl')pts=rdp(pts,st,c.k==='hl'?1.2:0.5);
    const s={k:c.k,c:c.c,w:c.w,p:skEncode(pts,st)};this.snap();this.d.strokes.push(s);this.render();this.changed()}
  eraseAt(x,y){const before=this.d.strokes.length;this.d.strokes=this.d.strokes.filter(s=>!strokeHit(s,x,y,8));if(this.d.strokes.length!==before){this.erased=true;this.render()}}
}
function skSyncAll(){for(const s of App.sketches||[]){s.syncBar();s.layout()}}
function skKeys(e){const s=App.sketch;if(!s||!document.contains(s.svg))return false;const k=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;
  if(mod&&k==='z'){e.preventDefault();e.shiftKey?s.redo():s.undo();return true}if(mod&&k==='y'){e.preventDefault();s.redo();return true}
  if(e.key==='Escape'&&s.host.closest('.block').classList.contains('sk-full')){s.full(false);return true}
  if(mod||e.altKey)return false;
  const T={p:'pen',h:'hl',l:'line',a:'arrow',r:'rect',o:'ellipse',e:'erase'};if(T[k]){SKS.tool=T[k];skSave();skSyncAll();return true}
  if(k==='f'){s.full(!s.host.closest('.block').classList.contains('sk-full'));return true}
  if('123'.includes(k)&&k.length===1){SKS.size=+k-1;skSave();skSyncAll();return true}
  return false}

function normNote(n){n.title=n.title||'';n.tag=n.tag||'';n.updated=n.updated||Date.now();n.blocks=Array.isArray(n.blocks)?n.blocks:[];n.blocks=n.blocks.filter(b=>b&&typeof b==='object').slice(0,400);for(const b of n.blocks){b.id=String(b.id||uid()).slice(0,40);if(b.type==='scheme')b.data=normScheme(b.data);else if(b.type==='sketch')b.data=cleanSketch(b.data);else if(b.type==='cards')b.data=cleanDeck(b.data);else if(b.type==='image')b.data=cleanImage(b.data);else{b.type='text';b.html=sanitize(b.html);delete b.data}}return normOrg(n)}

/* ---------- built-in notes ---------- */
function makeLibrary(){
  const base=Date.now();let k=0;const notes=[];
  const N=(id,title,tag,blocks)=>notes.push({id:'lib-'+id,example:true,title,tag,updated:base-(k++)*60000,blocks:blocks.map(b=>typeof b==='string'?{id:uid(),type:'text',html:b}:{id:uid(),type:'scheme',data:b})});
  const at=(d,x,y,el,o)=>{const a=addAtom(d,x,y,el||'C');if(o)Object.assign(a,o);return a};
  const bd=(d,a,b,o,st)=>addBond(d,a,b,o||1,st);
  const tx=(d,cx,y,t)=>d.texts.push({id:uid(),x:f(cx-textW(t,FS)/2),y,text:t});
  const tl=(d,x,y,t)=>d.texts.push({id:uid(),x,y,text:t});
  const ar=(d,x1,x2,y,ab,be,kind)=>d.arrows.push({id:uid(),kind:kind||'arr',x1,y1:y,x2,y2:y,above:ab||'',below:be||''});
  const an=o=>o.a!==undefined?{kind:'bond',id:o.id}:o.id?{kind:'atom',id:o.id}:{kind:'pt',x:o.x,y:o.y};
  const cu=(d,from,to,bend,half)=>{const c={id:uid(),from:an(from),to:an(to),bend};if(half)c.half=true;d.curls.push(c);return c};
  const carbonyl=(d,x,y,l,r,oo)=>{const C=at(d,x,y),O=at(d,x,y-30,'O',oo),co=bd(d,C,O,2),Lg=at(d,x-26,y+15,l||'C'),Rg=at(d,x+26,y+15,r||'C');bd(d,C,Lg);bd(d,C,Rg);return{C,O,co,L:Lg,R:Rg}};

  /* 1 Hybridisation */
  {const d1=emptyScheme(200);
    const c=at(d1,90,100,'C',{show:true});bd(d1,c,at(d1,90,70,'H'));bd(d1,c,at(d1,64,115,'H'));bd(d1,c,at(d1,112,121,'H'),1,'wedge');bd(d1,c,at(d1,119,103,'H'),1,'hash');
    tx(d1,90,160,'methane');tx(d1,90,178,'sp³ · 109.5°');
    const e1=at(d1,245,100,'C',{show:true}),e2=at(d1,275,100,'C',{show:true});bd(d1,e1,e2,2);
    bd(d1,e1,at(d1,230,74,'H'));bd(d1,e1,at(d1,230,126,'H'));bd(d1,e2,at(d1,290,74,'H'));bd(d1,e2,at(d1,290,126,'H'));
    tx(d1,260,160,'ethene');tx(d1,260,178,'sp² · 120° · planar');
    const y1=at(d1,425,100,'C',{show:true}),y2=at(d1,455,100,'C',{show:true});bd(d1,y1,y2,3);bd(d1,y1,at(d1,395,100,'H'));bd(d1,y2,at(d1,485,100,'H'));
    tx(d1,440,160,'ethyne');tx(d1,440,178,'sp · 180° · linear');
    const m=at(d1,595,100,'C',{show:true}),mo=at(d1,625,100,'O',{lp:2});bd(d1,m,mo,2);bd(d1,m,at(d1,580,74,'H'));bd(d1,m,at(d1,580,126,'H'));
    tx(d1,605,160,'methanal');tx(d1,605,178,'sp² carbon and oxygen');
    const d2=emptyScheme(200);
    const n=at(d2,90,100,'N',{lp:1});bd(d2,n,at(d2,64,115,'H'));bd(d2,n,at(d2,116,115,'H'));bd(d2,n,at(d2,90,130,'H'),1,'hash');
    tx(d2,90,165,'ammonia');tx(d2,90,183,'sp³ · 107°');
    const o=at(d2,260,100,'O',{lp:2});bd(d2,o,at(d2,234,115,'H'));bd(d2,o,at(d2,286,115,'H'));
    tx(d2,260,165,'water');tx(d2,260,183,'sp³ · 104.5°');
    const cp=at(d2,430,105,'C',{show:true,charge:1});bd(d2,cp,at(d2,430,75,'H'));bd(d2,cp,at(d2,404,120,'H'));bd(d2,cp,at(d2,456,120,'H'));
    tx(d2,430,165,'methyl cation');tx(d2,430,183,'sp² · empty p orbital');
    const cm=at(d2,600,100,'C',{show:true,charge:-1,lp:1});bd(d2,cm,at(d2,574,115,'H'));bd(d2,cm,at(d2,626,115,'H'));bd(d2,cm,at(d2,600,130,'H'),1,'hash');
    tx(d2,600,165,'methyl anion');tx(d2,600,183,'sp³ · lone pair');
    N('hybrid','Hybridisation','Structure & bonding',[
      '<p>Atomic orbitals on one atom mix (<b>hybridise</b>) to make orbitals that point at the atoms it bonds to. To predict the hybridisation, count the σ bonds plus lone pairs on the atom (its steric number).</p>',d1,
      '<ul><li><b>sp³</b>: 4 groups, tetrahedral, 109.5°. One s + three p orbitals. Examples: CH<sub>4</sub>, the carbons of alkanes.</li><li><b>sp²</b>: 3 groups, trigonal planar, 120°, plus one unhybridised p orbital at right angles to the plane. Examples: alkene carbons, the C and O of C=O, carbocations.</li><li><b>sp</b>: 2 groups, linear, 180°, plus two p orbitals at right angles. Examples: alkyne carbons, nitrile C≡N, the central carbon of CO<sub>2</sub>.</li></ul><p>A σ bond is head-on overlap of hybrid orbitals. A π bond is side-on overlap of parallel p orbitals; it is weaker and sits above and below the bond axis, so it is usually where reactions happen.</p>',
      '<p>Lone pairs count as groups too. They repel more than bonding pairs, which squeezes the bond angles: NH<sub>3</sub> is 107° and H<sub>2</sub>O is 104.5°, both close to tetrahedral.</p>',d2,
      '<p><b>More s character holds electrons closer to the nucleus.</b></p><ul><li>Bonds get shorter: C–C 154 pm, C=C 134 pm, C≡C 120 pm.</li><li>C–H acidity rises: ethane pK<sub>a</sub> ≈ 50, ethene ≈ 44, ethyne ≈ 25, because an sp carbanion is the most stable.</li><li>sp-hybridised atoms behave as more electronegative than sp³ ones.</li></ul>']);}

  /* 2 Nucleophiles and electrophiles */
  {const d1=emptyScheme(200);
    const n=at(d1,65,100,'N',{lp:1});tl(d1,125,105,'+');
    const b=at(d1,215,100,'B');bd(d1,b,at(d1,215,70,'F'));bd(d1,b,at(d1,189,115,'F'));bd(d1,b,at(d1,241,115,'F'));
    cu(d1,n,b,-0.35);ar(d1,280,350,100);
    const np=at(d1,400,100,'N',{charge:1}),bp=at(d1,430,100,'B',{charge:-1});bd(d1,np,bp);bd(d1,bp,at(d1,430,70,'F'));bd(d1,bp,at(d1,456,115,'F'));bd(d1,bp,at(d1,430,130,'F'));
    tx(d1,65,160,'nucleophile');tx(d1,65,176,'(lone pair = HOMO)');tx(d1,215,160,'electrophile');tx(d1,215,176,'(empty p orbital = LUMO)');tx(d1,425,170,'new N–B bond');
    const d2=emptyScheme(190);
    const c1=at(d2,50,105,'C',{show:true}),c2=at(d2,80,105,'C',{show:true});const pi=bd(d2,c1,c2,2);
    const h=at(d2,135,75,'H'),br=at(d2,165,75,'Br');const hb=bd(d2,h,br);
    cu(d2,pi,h,-0.4);cu(d2,hb,br,-1.0);ar(d2,215,285,95);
    const p1=at(d2,330,105,'C',{show:true}),p2=at(d2,360,105,'C',{show:true,charge:1});bd(d2,p1,p2);
    tl(d2,398,110,'+');at(d2,432,100,'Br',{charge:-1});
    tx(d2,65,150,'π bond (nucleophile)');tx(d2,160,120,'σ* of H–Br');tx(d2,160,136,'(electrophile)');tx(d2,355,150,'carbocation');
    N('nu-e','Nucleophiles and electrophiles','Reactivity',[
      '<p>Most polar organic reactions are a <b>nucleophile</b> (electron-rich, "nucleus-loving") giving a pair of electrons to an <b>electrophile</b> (electron-poor, "electron-loving") to form a new bond.</p><p>In orbital terms, a filled orbital of the nucleophile, usually its HOMO, overlaps with an empty orbital of the electrophile, usually its LUMO. The closer these orbitals are in energy and the better they overlap, the faster the reaction.</p>',d1,
      '<p><b>Curly arrows</b> show where electron pairs move. The tail starts at the electrons (a lone pair or a bond) and the head shows where they end up: a new bond or a lone pair. A fishhook (half-headed) arrow moves a single electron.</p><p><b>Nucleophiles</b> have a filled, relatively high-energy orbital:</p><ul><li>Lone pairs: H<sub>2</sub>O, ROH, NH<sub>3</sub>, amines, phosphines</li><li>Anions: HO<sup>−</sup>, RO<sup>−</sup>, CN<sup>−</sup>, halides, carboxylates</li><li>π bonds: alkenes, enols and enolates, aromatic rings</li><li>σ bonds: B–H in BH<sub>4</sub><sup>−</sup>, Al–H in AlH<sub>4</sub><sup>−</sup>, C–metal in RLi and RMgBr</li></ul><p><b>Electrophiles</b> have an empty, relatively low-energy orbital:</p><ul><li>Empty orbitals: H<sup>+</sup>, BF<sub>3</sub>, AlCl<sub>3</sub>, carbocations</li><li>Low-lying π*: C=O, C≡N, C=C next to a carbonyl group</li><li>Low-lying σ*: C–X in alkyl halides, H–X in acids</li></ul>',d2,
      '<p><b>Nucleophilicity is not basicity.</b> Basicity is thermodynamic: the pK<sub>a</sub> of the conjugate acid, attack on H<sup>+</sup>. Nucleophilicity is kinetic: the rate of attack on carbon, which also depends on size, polarisability and solvation. I<sup>−</sup> is a weak base but a good nucleophile; t-BuO<sup>−</sup> is a strong base but a poor nucleophile because it is bulky.</p>']);}

  /* 3 Cyanide and angle of attack */
  {const d1=emptyScheme(210);
    const cn=at(d1,50,112,'CN',{charge:-1,lp:1});const k1=carbonyl(d1,140,120,'C','H');
    cu(d1,cn,k1.C,-0.35);cu(d1,k1.co,k1.O,0.9);ar(d1,195,250,112);
    const m=at(d1,300,120),om=at(d1,300,90,'O',{charge:-1,lp:2});bd(d1,m,om);bd(d1,m,at(d1,274,135));bd(d1,m,at(d1,326,135,'CN'));
    const hh=at(d1,342,90,'H'),hc=at(d1,372,90,'CN');const hb=bd(d1,hh,hc);
    cu(d1,om,hh,-0.6);cu(d1,hb,hc,-1.0);ar(d1,415,475,112);
    const p=at(d1,530,120);bd(d1,p,at(d1,530,90,'O'));bd(d1,p,at(d1,504,135));bd(d1,p,at(d1,556,135,'CN'));tl(d1,592,117,'+ CN-');
    tx(d1,140,180,'aldehyde');tx(d1,305,185,'alkoxide');tx(d1,530,180,'cyanohydrin');
    const d2=emptyScheme(200);
    const c=at(d2,400,130),o=at(d2,430,130,'O',{lp:2});bd(d2,c,o,2);bd(d2,c,at(d2,386,156,'R'),1,'wedge');bd(d2,c,at(d2,372,145,'R'),1,'hash');
    at(d2,382,70,'Nu',{charge:-1});d2.arrows.push({id:uid(),kind:'arr',x1:385.5,y1:81,x2:397.4,y2:119,above:'',below:''});
    tl(d2,409,116,'107°');tx(d2,410,182,'Bürgi–Dunitz trajectory');
    tx(d2,170,90,'attacks the π* orbital,');tx(d2,170,108,'not along the C=O bond');tx(d2,170,126,'and not at 90° to it');
    tx(d2,600,90,'avoids the filled π orbital');tx(d2,600,108,'and the O lone pairs');
    N('cn','Nucleophilic addition to C=O: cyanide and the angle of attack','Carbonyl addition',[
      '<p>The C=O bond is polarised: oxygen is more electronegative, so the carbon is δ+. The empty π* orbital is larger on carbon, so nucleophiles add to carbon. The π bond breaks, oxygen takes the negative charge, and the carbon goes from trigonal planar (sp², 120°) to tetrahedral (sp³, 109.5°).</p><p><b>Aldehydes are more reactive than ketones</b>: they have only one alkyl group donating electrons into the C=O, and only one group to crowd the tetrahedral product.</p><p><b>Cyanohydrin formation</b></p>',d1,
      '<ul><li>HCN with a catalytic amount of base (NaCN or KCN) adds to aldehydes and unhindered ketones.</li><li>Cyanide is the nucleophile. The alkoxide then takes a proton from HCN, which regenerates CN<sup>−</sup>, so only a little base is needed.</li><li>HCN is a weak acid (pK<sub>a</sub> ≈ 9.2), so on its own it provides too little CN<sup>−</sup> to react quickly.</li><li>The equilibrium favours the cyanohydrin for aldehydes and small ketones, but not for hindered ketones.</li><li>Useful products: hydrolysing the CN gives α-hydroxy acids; reducing it gives amino alcohols.</li><li>HCN is extremely toxic, so it is usually generated in the flask from NaCN and acid.</li></ul><p><b>The angle of attack</b></p>',d2,
      '<p>Nucleophiles approach the carbonyl carbon at about <b>107°</b> to the C=O bond, from above or below the plane of the carbonyl group. This is the Bürgi–Dunitz trajectory.</p><ul><li>It gives the best overlap with the π* orbital, which is larger on carbon and points away from oxygen.</li><li>It avoids repulsion from the electrons in the filled π orbital and the oxygen lone pairs.</li><li>Large groups on either side of the C=O get in the way of this path, which is another reason ketones react more slowly than aldehydes.</li></ul>']);}

  /* 4 Hydride */
  {const d1=emptyScheme(210);
    const b=at(d1,55,115,'B',{charge:-1});bd(d1,b,at(d1,55,85,'H'));bd(d1,b,at(d1,25,115,'H'));bd(d1,b,at(d1,55,145,'H'));const bh=bd(d1,b,at(d1,85,115,'H'));
    const r=addRing(d1,6,false,{x:175,y:135});const o=at(d1,175,75,'O',{lp:2});const co=bd(d1,r.atoms[0],o,2);
    cu(d1,bh,r.atoms[0],-0.35);cu(d1,co,o,0.9);ar(d1,230,290,120);
    const r2=addRing(d1,6,false,{x:350,y:135});bd(d1,r2.atoms[0],at(d1,335,79,'O',{charge:-1}));bd(d1,r2.atoms[0],at(d1,365,79,'H'));
    ar(d1,410,490,120,'EtOH','proton source');
    const r3=addRing(d1,6,false,{x:560,y:135});bd(d1,r3.atoms[0],at(d1,545,79,'O'));bd(d1,r3.atoms[0],at(d1,575,79,'H'));
    tx(d1,55,180,'borohydride');tx(d1,175,195,'cyclohexanone');tx(d1,350,195,'alkoxide');tx(d1,560,195,'cyclohexanol');
    const d2=emptyScheme(180);
    const ra=addRing(d2,6,true,{x:90,y:110});const ca=at(d2,116,65);bd(d2,ra.atoms[0],ca);bd(d2,ca,at(d2,142,80,'O'),2);
    ar(d2,185,305,95,'1. LiAlH4, Et2O','2. H3O+');
    const rb=addRing(d2,6,true,{x:380,y:110});const cb=at(d2,406,65);bd(d2,rb.atoms[0],cb);bd(d2,cb,at(d2,432,80,'O'));
    tx(d2,100,162,'benzaldehyde');tx(d2,395,162,'benzyl alcohol');
    N('hydride','Hydride addition: NaBH₄ and LiAlH₄','Carbonyl addition',[
      '<p>Hydride reducing agents add H<sup>−</sup> to the carbonyl carbon, turning aldehydes into primary alcohols and ketones into secondary alcohols. The hydride is not free: sodium hydride (NaH) is a strong base but not a nucleophile, because H<sup>−</sup> is tiny and its 1s orbital overlaps poorly with π*. Instead the hydride is delivered from a B–H or Al–H bond.</p>',d1,
      '<p><b>Sodium borohydride, NaBH<sub>4</sub></b></p><ul><li>Mild and selective: reduces aldehydes and ketones, but not esters, acids or amides under normal conditions.</li><li>Used in water, methanol or ethanol; the solvent protonates the alkoxide.</li><li>Each BH<sub>4</sub><sup>−</sup> can in principle transfer all four hydrides.</li></ul><p><b>Lithium aluminium hydride, LiAlH<sub>4</sub></b></p><ul><li>Much more reactive, because the Al–H bond is more polar (Al is less electronegative than B).</li><li>Reduces aldehydes, ketones, esters, carboxylic acids and amides.</li><li>Reacts violently with water and alcohols, so use dry ether or THF, then add water or dilute acid in a separate workup step.</li></ul>',d2,
      '<p>The metal counter-ion (Li<sup>+</sup> or Na<sup>+</sup>) coordinates to the carbonyl oxygen and acts as a weak Lewis acid, making the carbon more electrophilic.</p>']);}

  /* 5 Organometallics */
  {const d1=emptyScheme(210);
    const cm=at(d1,45,112,'C',{show:true}),mg=at(d1,78,112,'MgBr');const cmb=bd(d1,cm,mg);
    const k1=carbonyl(d1,165,122,'C','C');cu(d1,cmb,k1.C,-0.45);cu(d1,k1.co,k1.O,0.9);
    ar(d1,220,285,115,'dry Et2O');
    const c=at(d1,340,122);bd(d1,c,at(d1,340,92,'O',{charge:-1}));bd(d1,c,at(d1,314,137));bd(d1,c,at(d1,366,137));bd(d1,c,at(d1,340,152));tl(d1,358,97,'MgBr+');
    ar(d1,420,490,115,'H3O+','workup');
    const p=at(d1,550,122);bd(d1,p,at(d1,550,92,'O'));bd(d1,p,at(d1,524,137));bd(d1,p,at(d1,576,137));bd(d1,p,at(d1,550,152));
    tx(d1,65,190,'Grignard reagent');tx(d1,165,190,'ketone');tx(d1,345,190,'magnesium alkoxide');tx(d1,550,190,'tertiary alcohol');
    N('organomet','Organometallic addition: Grignard and organolithium reagents','Carbonyl addition',[
      '<p>Grignard reagents (RMgX) and organolithiums (RLi) have a very polar C–metal bond with the electrons concentrated on carbon, so the carbon behaves like a carbanion. Adding them to aldehydes and ketones makes a <b>new C–C bond</b>.</p>',d1,
      '<ul><li>Formaldehyde gives primary alcohols, other aldehydes give secondary alcohols, and ketones give tertiary alcohols.</li><li>Preparation: R–Br + Mg in dry ether or THF gives RMgBr; R–Br + 2 Li gives RLi + LiBr.</li><li>They are also very strong bases, so water, alcohols, acids and N–H groups must be excluded. These would simply protonate the reagent to give R–H.</li><li>The Mg<sup>2+</sup> or Li<sup>+</sup> coordinates to the carbonyl oxygen as a Lewis acid, which helps the addition.</li><li>A separate acidic workup (dilute HCl or aqueous NH<sub>4</sub>Cl) protonates the alkoxide.</li><li>With very hindered ketones, Grignard reagents may act as bases (making enolates) or as reducing agents instead of adding.</li></ul>']);}

  /* 6 Hydrates */
  {const d1=emptyScheme(200);
    const ho=at(d1,50,112,'O',{charge:-1,lp:2});const k1=carbonyl(d1,135,120,'C','H');cu(d1,ho,k1.C,-0.35);cu(d1,k1.co,k1.O,0.9);
    ar(d1,190,250,112,'','','eq');
    const c=at(d1,305,120),om=at(d1,305,90,'O',{charge:-1,lp:2});bd(d1,c,om);bd(d1,c,at(d1,279,135));bd(d1,c,at(d1,331,135,'O'));
    const hw=at(d1,345,90,'H'),ow=at(d1,375,90,'O');const hwb=bd(d1,hw,ow);cu(d1,om,hw,-0.6);cu(d1,hwb,ow,-1.0);
    ar(d1,415,475,112,'','','eq');
    const p=at(d1,530,120);bd(d1,p,at(d1,530,90,'O'));bd(d1,p,at(d1,504,135));bd(d1,p,at(d1,556,135,'O'));tl(d1,590,117,'+ HO-');
    tx(d1,135,180,'aldehyde');tx(d1,530,180,'hydrate (gem-diol)');tx(d1,330,185,'base-catalysed');
    N('hydrate','Addition of water: hydrates','Carbonyl addition',[
      '<p>Water adds reversibly to aldehydes and ketones to give <b>hydrates</b> (1,1-diols, also called gem-diols). Acid or base catalyses the addition, but catalysis only changes the rate. How much hydrate forms depends on the stability of the carbonyl compound relative to its hydrate.</p>',d1,
      '<p>Equilibrium constants for hydration in water, K = [hydrate]/[carbonyl]:</p><ul><li>Hexafluoroacetone (CF<sub>3</sub>)<sub>2</sub>C=O: K ≈ 10<sup>6</sup></li><li>Chloral, Cl<sub>3</sub>CCHO: K ≈ 3 × 10<sup>4</sup>; chloral hydrate is a stable crystalline solid</li><li>Formaldehyde: K ≈ 2 × 10<sup>3</sup>, essentially all hydrate</li><li>Acetaldehyde: K ≈ 1, about half hydrated</li><li>Acetone: K ≈ 1.4 × 10<sup>−3</sup>, almost none</li></ul><p><b>What favours the hydrate</b></p><ul><li>Electron-withdrawing groups (CF<sub>3</sub>, CCl<sub>3</sub>) make the carbonyl carbon more δ+ and destabilise the C=O.</li><li>Fewer and smaller substituents: alkyl groups stabilise the C=O by donating electrons, and they crowd the tetrahedral hydrate.</li><li>Ring strain: cyclopropanone is mostly hydrated, because an sp³ carbon (109.5°) suits a three-membered ring better than an sp² carbon (120°).</li></ul><p>Hydrates usually cannot be isolated: removing the water drives the equilibrium back to the carbonyl compound.</p>']);}

  /* 7 Hemiacetals */
  {const d1=emptyScheme(180);
    carbonyl(d1,70,112,'C','H');tl(d1,112,108,'+ MeOH');
    ar(d1,180,260,100,'H+ or HO-','(catalytic)','eq');
    const c=at(d1,320,112);bd(d1,c,at(d1,320,82,'O'));bd(d1,c,at(d1,294,127));const o=at(d1,346,127,'O');bd(d1,c,o);bd(d1,o,at(d1,372,112));
    ar(d1,425,510,100,'MeOH, H+','−H2O','eq');
    const a=at(d1,580,112);const o1=at(d1,580,82,'O');bd(d1,a,o1);bd(d1,o1,at(d1,606,67));bd(d1,a,at(d1,554,127));const o2=at(d1,606,127,'O');bd(d1,a,o2);bd(d1,o2,at(d1,632,112));
    tx(d1,85,160,'aldehyde + alcohol');tx(d1,330,160,'hemiacetal');tx(d1,590,160,'acetal');
    const d2=emptyScheme(200);
    const ch=[at(d2,40,125,'O'),at(d2,66,110),at(d2,92,125),at(d2,118,110),at(d2,144,125),at(d2,170,110)];for(let i=0;i<5;i++)bd(d2,ch[i],ch[i+1]);bd(d2,ch[5],at(d2,196,125,'O'),2);
    ar(d2,230,300,115,'','','eq');
    const r=addRing(d2,6,false,{x:370,y:115});r.atoms[1].el='O';bd(d2,r.atoms[2],at(d2,422,145,'O'));
    tx(d2,118,175,'5-hydroxypentanal');tx(d2,385,185,'cyclic hemiacetal (favoured)');
    N('hemiacetal','Hemiacetals from alcohols and aldehydes','Carbonyl addition',[
      '<p>Alcohols add to aldehydes and ketones just as water does. The product has an OH and an OR on the same carbon and is called a <b>hemiacetal</b>. Further reaction with acid and a second alcohol gives an acetal.</p>',d1,
      '<ul><li>Like hydrates, most simple hemiacetals are unstable: the equilibrium lies on the side of the aldehyde and alcohol, and they usually cannot be isolated.</li><li>The reaction is slow with neutral reagents and is catalysed by acid or base (see the next note).</li><li>A hemiacetal is not an acetal. Acetals, C(OR)<sub>2</sub>, form from a hemiacetal only with acid, by loss of water and addition of a second alcohol.</li></ul><p><b>Cyclic hemiacetals are stable</b></p>',d2,
      '<p>When the OH and C=O are in the same molecule and can form a five- or six-membered ring, the hemiacetal is favoured. The intramolecular reaction does not pay the entropy cost of bringing two molecules together. Sugars exist mainly as cyclic hemiacetals: in water, glucose is more than 99% in the six-membered pyranose form.</p>']);}

  /* 8 Acid and base catalysis */
  {const d1=emptyScheme(205);
    const ob=at(d1,51,105,'O',{charge:-1,lp:2});bd(d1,at(d1,25,120),ob);const k1=carbonyl(d1,135,125,'C','H');cu(d1,ob,k1.C,-0.3);cu(d1,k1.co,k1.O,0.9);
    ar(d1,185,245,118,'','','eq');
    const c=at(d1,300,125),om=at(d1,300,95,'O',{charge:-1,lp:2});bd(d1,c,om);bd(d1,c,at(d1,274,140));const oc=at(d1,326,140,'O');bd(d1,c,oc);bd(d1,oc,at(d1,352,125));
    const hm=at(d1,338,95,'H'),om2=at(d1,368,95,'O');const hb=bd(d1,hm,om2);bd(d1,om2,at(d1,394,80));cu(d1,om,hm,-0.6);cu(d1,hb,om2,-1.0);
    ar(d1,420,480,118,'','','eq');
    const p=at(d1,535,125);bd(d1,p,at(d1,535,95,'O'));bd(d1,p,at(d1,509,140));const po=at(d1,561,140,'O');bd(d1,p,po);bd(d1,po,at(d1,587,125));tl(d1,612,120,'+ MeO-');
    tx(d1,330,192,'base catalysis: methoxide is the nucleophile');
    const d2=emptyScheme(220);
    const k2=carbonyl(d2,55,130,'C','H',{lp:2});const hp=at(d2,100,78,'H',{charge:1});cu(d2,k2.O,hp,-0.5);
    ar(d2,125,170,118,'','','eq');
    const c2=at(d2,215,130),op=at(d2,215,100,'O',{charge:1,lp:1});const co2=bd(d2,c2,op,2);bd(d2,c2,at(d2,189,145));bd(d2,c2,at(d2,241,145,'H'));
    const mo=at(d2,272,122,'O',{lp:2});bd(d2,mo,at(d2,298,107));cu(d2,mo,c2,0.2);cu(d2,co2,op,-0.9);
    ar(d2,320,365,118,'','','eq');
    const c3=at(d2,405,130);bd(d2,c3,at(d2,405,100,'O'));bd(d2,c3,at(d2,379,145));const ox=at(d2,431,145,'O',{charge:1});bd(d2,c3,ox);bd(d2,ox,at(d2,431,175));
    ar(d2,490,550,118,'−H+','','eq');
    const c4=at(d2,600,130);bd(d2,c4,at(d2,600,100,'O'));bd(d2,c4,at(d2,574,145));const o4=at(d2,626,145,'O');bd(d2,c4,o4);bd(d2,o4,at(d2,652,130));tl(d2,668,135,'+ H+');
    tx(d2,55,202,'aldehyde');tx(d2,225,202,'activated C=O');tx(d2,415,202,'oxonium ion');tx(d2,613,202,'hemiacetal');
    N('catalysis','Acid and base catalysis of hemiacetal formation','Carbonyl addition',[
      '<p>Neutral alcohols are weak nucleophiles and neutral carbonyl groups are only moderate electrophiles, so uncatalysed hemiacetal formation is slow. A small amount of acid or base speeds up both the forward and reverse reactions. Equilibrium is reached faster, but its position does not change.</p><p><b>Base catalysis: make the nucleophile better</b></p>',d1,
      '<ol><li>Base removes the O–H proton from the alcohol, giving the much more nucleophilic alkoxide RO<sup>−</sup>.</li><li>RO<sup>−</sup> adds to the carbonyl carbon.</li><li>The new alkoxide takes a proton from another alcohol molecule, giving the hemiacetal and regenerating RO<sup>−</sup>.</li></ol><p><b>Acid catalysis: make the electrophile better</b></p>',d2,
      '<ol><li>Acid protonates the carbonyl oxygen. The positive charge is shared with carbon, making it far more electrophilic.</li><li>The neutral alcohol adds to the carbon.</li><li>The oxonium ion loses H<sup>+</sup>, giving the hemiacetal and regenerating the acid catalyst.</li></ol><p>Every step is reversible. Only acid can take the reaction on to an acetal: it protonates the hemiacetal OH, turning it into a good leaving group (water). Base cannot do this, because HO<sup>−</sup> is a poor leaving group.</p>']);}

  /* 9 Bisulfite */
  {const d1=emptyScheme(210);
    const s=at(d1,70,115,'S',{lp:1});bd(d1,s,at(d1,70,85,'O'),2);bd(d1,s,at(d1,44,130,'O'));bd(d1,s,at(d1,70,145,'O',{charge:-1}));
    const k1=carbonyl(d1,160,125,'C','H');cu(d1,s,k1.C,-0.3);cu(d1,k1.co,k1.O,0.9);
    ar(d1,215,285,118,'','proton transfer','eq');
    const c=at(d1,340,125);bd(d1,c,at(d1,340,95,'O'));bd(d1,c,at(d1,314,140));const s2=at(d1,366,140,'S');bd(d1,c,s2);bd(d1,s2,at(d1,392,125,'O'),2);bd(d1,s2,at(d1,366,170,'O'),2);bd(d1,s2,at(d1,392,155,'O',{charge:-1}));tl(d1,416,160,'Na+');
    ar(d1,470,560,118,'H3O+ or HO-');
    carbonyl(d1,615,125,'C','H');
    tx(d1,60,192,'hydrogen sulfite');tx(d1,160,192,'aldehyde');tx(d1,365,198,'bisulfite adduct');tx(d1,615,192,'pure aldehyde');
    N('bisulfite','Bisulfite addition','Carbonyl addition',[
      '<p>Sodium hydrogen sulfite (sodium bisulfite, NaHSO<sub>3</sub>) adds to aldehydes and to some unhindered ketones, such as methyl ketones. The nucleophile is the lone pair on <b>sulfur</b>, which is more nucleophilic than oxygen, so a new C–S bond forms. A proton transfer from the S–OH to the alkoxide then gives the sodium salt of a sulfonic acid: the bisulfite adduct.</p>',d1,
      '<ul><li>The adducts are crystalline salts, soluble in water but not in organic solvents.</li><li><b>Purifying aldehydes</b>: shake the crude mixture with aqueous NaHSO<sub>3</sub>, separate the adduct (as a solid or in the water layer), then add acid or base. This destroys the bisulfite and pushes the equilibrium back to the pure aldehyde.</li><li>Hindered ketones do not react, so the method can separate aldehydes from ketones.</li><li>The adducts are a stable, solid source of the aldehyde. Treating them with NaCN, for example, gives cyanohydrins without handling HCN.</li></ul>']);}

  /* 10 Aromaticity and conjugation */
  {const d1=emptyScheme(180);
    addRing(d1,6,true,{x:70,y:95});
    ar(d1,125,185,95,'','','res');
    const r2=addRing(d1,6,false,{x:240,y:95});[1,3,5].forEach(i=>r2.bonds[i].order=2);
    const a1=at(d1,330,105),a2=at(d1,356,90),a3=at(d1,382,105,'C',{charge:1});const db=bd(d1,a1,a2,2),sb=bd(d1,a2,a3);cu(d1,db,sb,-0.6);
    ar(d1,410,470,98,'','','res');
    const b1=at(d1,500,105,'C',{charge:1}),b2=at(d1,526,90),b3=at(d1,552,105);bd(d1,b1,b2);bd(d1,b2,b3,2);
    tx(d1,155,162,'benzene: two Kekulé structures');tx(d1,440,162,'allyl cation: + shared by both ends');
    const d2=emptyScheme(205);
    const py=addRing(d2,6,true,{x:70,y:105});py.atoms[0].el='N';py.atoms[0].lp=1;
    const pr=addRing(d2,5,false,{x:195,y:110});pr.atoms[0].el='N';pr.atoms[0].lp=1;pr.bonds[1].order=2;pr.bonds[3].order=2;
    const cp=addRing(d2,5,false,{x:320,y:110});cp.atoms[0].charge=-1;cp.atoms[0].lp=1;cp.bonds[1].order=2;cp.bonds[3].order=2;
    const cb=addRing(d2,4,false,{x:445,y:110});cb.bonds[0].order=2;cb.bonds[2].order=2;
    const tr=addRing(d2,7,false,{x:580,y:110});[0,2,4].forEach(i=>tr.bonds[i].order=2);tr.atoms[6].charge=1;
    [[70,'pyridine','6π · aromatic'],[195,'pyrrole','6π · aromatic'],[320,'cyclopentadienyl','anion · 6π · aromatic'],[445,'cyclobutadiene','4π · antiaromatic'],[580,'tropylium cation','6π · aromatic']].forEach(([x,a,b])=>{tx(d2,x,172,a);tx(d2,x,190,b)});
    N('aromatic','Aromaticity and conjugation','Structure & bonding',[
      '<p><b>Conjugation</b> means p orbitals on neighbouring atoms overlap continuously: alternating single and double bonds, or a π bond next to a lone pair, a radical or an empty p orbital. The π electrons are then delocalised over the whole system, which lowers the energy.</p><p><b>Resonance structures</b>, linked by a double-headed ↔ arrow, are different drawings of the same delocalised electrons. The real molecule is a single hybrid, not an equilibrium between them. Only electrons move between resonance forms, never atoms.</p>',d1,
      '<p><b>Evidence that benzene is special</b></p><ul><li>All six C–C bonds are the same length (139 pm), between a single bond (154 pm) and a double bond (134 pm).</li><li>Hydrogenation shows benzene is about 150 kJ mol<sup>−1</sup> more stable than three separate C=C bonds would predict. This is its aromatic stabilisation energy.</li><li>It undergoes substitution rather than addition, which keeps the aromatic ring intact.</li></ul><p><b>Hückel\'s rule</b>: a ring is aromatic if it is cyclic, planar, fully conjugated (a p orbital on every ring atom) and has <b>4n + 2 π electrons</b> (2, 6, 10, 14…). A planar, conjugated ring with 4n π electrons (4, 8…) is antiaromatic and destabilised.</p>',d2,
      '<ul><li><b>Pyridine</b>: 6π. The N lone pair is in an sp² orbital in the ring plane, not part of the π system, so pyridine is basic (pK<sub>a</sub> of its conjugate acid ≈ 5.2).</li><li><b>Pyrrole</b>: 6π. The N lone pair is part of the aromatic sextet, so pyrrole is barely basic.</li><li><b>Cyclopentadienyl anion</b>: 6π, which is why cyclopentadiene is unusually acidic for a hydrocarbon (pK<sub>a</sub> ≈ 16).</li><li><b>Tropylium cation</b>, C<sub>7</sub>H<sub>7</sub><sup>+</sup>: 6π, an unusually stable carbocation.</li><li><b>Cyclobutadiene</b>: 4π, antiaromatic; it can only be observed trapped at very low temperature.</li><li><b>Cyclooctatetraene</b>: 8π, but it adopts a non-planar tub shape, so it behaves as an ordinary non-aromatic polyene.</li></ul>']);}

  /* earlier examples */
  {const s1=emptyScheme(200);
    const O=at(s1,62,100,'O',{charge:-1,lp:2});tl(s1,94,105,'+');
    const c1=at(s1,128,108),c2=at(s1,154,93),br=at(s1,180,108,'Br');bd(s1,c1,c2);const cbr=bd(s1,c2,br);
    cu(s1,O,c2,-.42);cu(s1,cbr,br,1.15);ar(s1,226,322,100,'acetone','25 °C');
    const e1=at(s1,352,108),e2=at(s1,378,93),eo=at(s1,404,108,'O',{lp:2});bd(s1,e1,e2);bd(s1,e2,eo);
    tl(s1,440,105,'+');at(s1,482,100,'Br',{charge:-1});
    N('sn2','SN2: hydroxide + bromoethane','Substitution',[
      '<p><b>S<sub>N</sub>2</b> happens in one concerted step. The nucleophile attacks carbon from the side opposite the leaving group while the C–Br bond breaks.</p>',s1,
      '<ul><li>Rate = k[R–Br][OH<sup>−</sup>], second order overall</li><li>Inversion of configuration at the reacting carbon (Walden inversion)</li><li>Reactivity: methyl &gt; 1° &gt; 2°; 3° halides don\'t react by S<sub>N</sub>2</li><li>Polar aprotic solvents (acetone, DMSO, DMF) speed it up</li></ul>']);}
  {const s2=emptyScheme(210);
    const r1=addRing(s2,6,true,{x:72,y:118});const no=at(s2,150,70,'NO2',{charge:1});cu(s2,r1.bonds[0],no,-.45);
    ar(s2,196,268,118);
    const r2=addRing(s2,6,true,{x:330,y:122});r2.bonds[0].order=1;r2.atoms[1].charge=1;
    const top=r2.atoms[0];bd(s2,top,at(s2,top.x+15,top.y-26,'NO2'));const ch=bd(s2,top,at(s2,top.x-15,top.y-26,'H'));
    cu(s2,ch,r2.bonds[0],-.7);tl(s2,282,178,'arenium ion');ar(s2,392,474,118,'−H+','fast');
    const r3=addRing(s2,6,true,{x:540,y:128});bd(s2,r3.atoms[0],at(s2,r3.atoms[0].x,r3.atoms[0].y-30,'NO2'));
    N('nitration','Nitration of benzene','Aromatic substitution',[
      '<p>Electrophilic aromatic substitution. Concentrated H<sub>2</sub>SO<sub>4</sub> protonates HNO<sub>3</sub>, which loses water to give the nitronium ion, NO<sub>2</sub><sup>+</sup>.</p>',s2,
      '<ol><li>The π bond attacks NO<sub>2</sub><sup>+</sup>; this slow step breaks aromaticity.</li><li>The arenium ion (σ-complex) is resonance stabilised.</li><li>Loss of H<sup>+</sup> restores the aromatic ring.</li></ol>']);}
  return notes;
}
function mergeLibrary(){const titles=new Set(App.notes.map(n=>(n.title||'').trim().toLowerCase()));for(const n of makeLibrary()){if(App.dismissed.has(n.id)||App.notes.some(x=>x.id===n.id)||titles.has(n.title.toLowerCase()))continue;App.notes.push(normNote(n))}}

/* ---------- structure engine: SMILES subset → drawing ---------- */
const STD_VAL={B:[3],C:[4],N:[3,5],O:[2],P:[3,5],S:[2,4,6],F:[1],Cl:[1],Br:[1],I:[1]};
function parseSmiles(s){
  const atoms=[],bonds=[],ring={},stack=[];let prev=null,pend=null,i=0;
  const mk=(a,b,sym)=>{let order=1,dir=null,arom=false;
    if(sym==='=')order=2;else if(sym==='#')order=3;else if(sym==='/'||sym==='\\')dir=sym;
    else if(sym==null&&atoms[a].arom&&atoms[b].arom)arom=true;
    bonds.push({a,b,order,dir,arom});return bonds.length-1};
  while(i<s.length){
    const ch=s[i];
    if(ch==='('){stack.push(prev);i++;continue}
    if(ch===')'){prev=stack.pop();i++;continue}
    if(ch==='.'){prev=null;i++;continue}
    if('-=#/\\:'.includes(ch)){pend=ch===':'||ch==='-'?null:ch;i++;continue}
    if(/[0-9%]/.test(ch)){
      let num;if(ch==='%'){num=s.substr(i+1,2);i+=3}else{num=ch;i++}
      if(ring[num]){const r=ring[num],bi=mk(r.atom,prev,pend!=null?pend:r.sym);bonds[bi].ring=true;atoms[r.atom].nb[r.slot]=bi;atoms[prev].nb.push(bi);delete ring[num]}
      else{ring[num]={atom:prev,sym:pend,slot:atoms[prev].nb.length};atoms[prev].nb.push(null)}
      pend=null;continue;
    }
    const at={el:'',charge:0,h:null,arom:false,chir:null,nb:[],hasPrev:prev!==null};
    if(ch==='['){
      const j=s.indexOf(']',i),body=s.slice(i+1,j);i=j+1;
      const m=body.match(/^(\d+)?([A-Z][a-z]?|[a-z][a-z]?)(@@|@)?(H\d*)?(\+\d*|-\d*|\++|-+)?$/);
      if(!m)throw new Error('Bad atom ['+body+']');
      let el=m[2];if(/^[a-z]/.test(el)){at.arom=true;el=el[0].toUpperCase()+el.slice(1)}
      at.el=el;at.chir=m[3]||null;at.h=m[4]?(m[4].length>1?+m[4].slice(1):1):0;
      if(m[5]){const c=m[5],sg=c[0]==='+'?1:-1;at.charge=/\d/.test(c)?sg*+c.slice(1):sg*c.length}
    }else{
      const two=s.substr(i,2);
      if(two==='Cl'||two==='Br'){at.el=two;i+=2}
      else if('BCNOPSFI'.includes(ch)){at.el=ch;i++}
      else if('bcnops'.includes(ch)){at.el=ch.toUpperCase();at.arom=true;i++}
      else throw new Error('Unexpected "'+ch+'" in SMILES');
    }
    const idx=atoms.length;atoms.push(at);
    if(prev!==null){const bi=mk(prev,idx,pend);atoms[prev].nb.push(bi);at.nb.push(bi)}
    pend=null;prev=idx;
  }
  const m={atoms,bonds};kekulize(m);
  atoms.forEach((a,k)=>{if(a.h!==null){a.hImp=a.h;return}const v=bonds.reduce((s2,b)=>s2+((b.a===k||b.b===k)?b.order:0),0),vals=STD_VAL[a.el]||[0];const t=vals.find(x=>x>=v);a.hImp=t==null?0:t-v});
  return m;
}
function kekulize(m){
  const ab=m.bonds.filter(b=>b.arom);if(!ab.length)return;
  const deg=i=>m.bonds.filter(b=>b.a===i||b.b===i).length;
  const need=m.atoms.map((a,i)=>{
    if(!a.arom)return false;
    if(m.bonds.some(b=>!b.arom&&b.order===2&&(b.a===i||b.b===i)))return false;
    if(a.el==='C')return a.charge===0;
    if(a.el==='N'||a.el==='P')return (a.charge===0&&!a.h&&deg(i)===2)||(a.charge===1);
    return false;
  });
  ab.forEach(b=>b.order=1);
  const done=new Set(),order=m.atoms.map((_,i)=>i).filter(i=>need[i]);
  const solve=k=>{
    while(k<order.length&&done.has(order[k]))k++;
    if(k>=order.length)return true;
    const i=order[k];
    for(const b of ab){if(b.order===2)continue;const o=b.a===i?b.b:b.b===i?b.a:-1;if(o<0||!need[o]||done.has(o))continue;
      b.order=2;done.add(i);done.add(o);if(solve(k+1))return true;b.order=1;done.delete(i);done.delete(o)}
    return false;
  };
  solve(0);
}
function smilesToScheme(smi){
  const m=parseSmiles(smi),n=m.atoms.length,adj=m.atoms.map(()=>[]);
  m.bonds.forEach((b,bi)=>{adj[b.a].push(bi);adj[b.b].push(bi)});
  const oth=(bi,i)=>m.bonds[bi].a===i?m.bonds[bi].b:m.bonds[bi].a;
  const isSp=i=>{let d2=0;for(const bi of adj[i]){const o=m.bonds[bi].order;if(o===3)return true;if(o===2)d2++}return d2>=2};
  const rings=[];
  for(const rb of m.bonds.filter(b=>b.ring)){
    const pr=new Array(n).fill(-1);pr[rb.a]=rb.a;const q=[rb.a];
    while(q.length){const x=q.shift();if(x===rb.b)break;for(const bi of adj[x]){if(m.bonds[bi].ring)continue;const y=oth(bi,x);if(pr[y]<0){pr[y]=x;q.push(y)}}}
    const path=[];let x=rb.b;while(x!==rb.a){path.push(x);x=pr[x]}path.push(rb.a);rings.push(path.reverse());
  }
  const ringOf=new Array(n).fill(-1);rings.forEach((r,k)=>r.forEach(i=>{if(ringOf[i]<0)ringOf[i]=k}));
  const d=emptyScheme(200),sa=new Array(n).fill(null),placedRing=new Set(),placedBond=new Set(),q=[];
  const mkAtom=(i,x,y)=>{const a=m.atoms[i],s=addAtom(d,x,y,a.el);if(a.charge)s.charge=a.charge;sa[i]=s;return s};
  const addSB=bi=>{if(placedBond.has(bi))return;const b=m.bonds[bi];if(!sa[b.a]||!sa[b.b])return;placedBond.add(bi);addBond(d,sa[b.a],sa[b.b],b.order)};
  const placeRing=(k,start,cx,cy,ang0)=>{const r=rings[k],N=r.length,R=L/(2*Math.sin(Math.PI/N)),st=2*Math.PI/N,j=r.indexOf(start),ord=r.slice(j).concat(r.slice(0,j));
    ord.forEach((ai,t)=>{if(!sa[ai])mkAtom(ai,cx+R*Math.cos(ang0+t*st),cy+R*Math.sin(ang0+t*st))});placedRing.add(k);ord.forEach(i=>q.push(i))};
  if(rings.length)placeRing(0,rings[0][0],0,0,-Math.PI/2);
  else{
    const far=s0=>{const dist=new Array(n).fill(-1),pr=new Array(n).fill(-1);dist[s0]=0;const qq=[s0];while(qq.length){const x=qq.shift();for(const bi of adj[x]){const y=oth(bi,x);if(dist[y]<0){dist[y]=dist[x]+1;pr[y]=x;qq.push(y)}}}let best=s0;for(let i=0;i<n;i++)if(dist[i]>dist[best])best=i;return{best,pr}};
    const a0=far(0).best,{best:a1,pr}=far(a0),path=[];let x=a1;while(x!==-1){path.push(x);x=pr[x]}
    let px=0,py=0,ang=-Math.PI/6;
    path.forEach((ai,t)=>{if(t>0){px+=L*Math.cos(ang);py+=L*Math.sin(ang)}mkAtom(ai,px,py);q.push(ai);if(t>0&&!isSp(ai))ang=Math.abs(ang)<1e-6?-Math.PI/6:-ang;else if(t===0&&isSp(ai))ang=0});
    if(path.length>1&&isSp(path[0])){}
  }
  for(let bi=0;bi<m.bonds.length;bi++)addSB(bi);
  while(q.length){
    const i=q.shift(),pl=adj[i].filter(bi=>sa[oth(bi,i)]),un=adj[i].filter(bi=>!sa[oth(bi,i)]);let preset=null,pk=0;
    if(adj[i].length===4&&!isSp(i)){
      const s=sa[i],dirs=pl.map(bi=>{const o=sa[oth(bi,i)];return Math.atan2(o.y-s.y,o.x-s.x)});
      if(pl.length===2&&un.length===2){const o=Math.atan2(-(Math.sin(dirs[0])+Math.sin(dirs[1])),-(Math.cos(dirs[0])+Math.cos(dirs[1])));preset=[o-Math.PI/6,o+Math.PI/6]}
      else if(pl.length===1&&un.length===3){const u=dirs[0];preset=[u+Math.PI/2,u+Math.PI,u-Math.PI/2]}
    }
    for(const bi of adj[i]){
      const j=oth(bi,i);if(sa[j]){addSB(bi);continue}
      const s=sa[i],pn=nbrs(d,s.id);
      const ang=preset?preset[pk++]:isSp(i)&&pn.length===1?Math.atan2(s.y-pn[0].y,s.x-pn[0].x):bestAngle(d,s);
      if(ringOf[j]>=0&&!placedRing.has(ringOf[j])){
        const k=ringOf[j],N=rings[k].length,R=L/(2*Math.sin(Math.PI/N)),jx=s.x+L*Math.cos(ang),jy=s.y+L*Math.sin(ang);
        placeRing(k,j,jx+R*Math.cos(ang),jy+R*Math.sin(ang),ang+Math.PI);
        for(let b2=0;b2<m.bonds.length;b2++)addSB(b2);
      }else{mkAtom(j,s.x+L*Math.cos(ang),s.y+L*Math.sin(ang));addSB(bi);q.push(j)}
    }
  }
  const flip=c=>c==='/'?'\\':'/';
  m.bonds.forEach((b,bi)=>{
    if(b.order!==2||(ringOf[b.a]>=0&&ringOf[b.a]===ringOf[b.b]))return;
    const A=b.a,B=b.b,side=atom=>{for(const x of adj[atom]){if(x===bi)continue;const bb=m.bonds[x];if(bb.dir)return{nbr:oth(x,atom),bond:bb}}return null};
    const sA=side(A),sB=side(B);if(!sA||!sB)return;
    const c1=sA.bond.b===A?sA.bond.dir:flip(sA.bond.dir),c2=sB.bond.a===B?sB.bond.dir:flip(sB.bond.dir),wantTrans=c1===c2;
    const pA=sa[A],pB=sa[B],cr=p=>(pB.x-pA.x)*(p.y-pA.y)-(pB.y-pA.y)*(p.x-pA.x),isTrans=cr(sa[sA.nbr])*cr(sa[sB.nbr])<0;
    if(isTrans===wantTrans)return;
    const set=new Set([B]),st=[B];while(st.length){const x=st.pop();for(const e of adj[x]){if(e===bi)continue;const y=oth(e,x);if(!set.has(y)){set.add(y);st.push(y)}}}
    set.delete(B);if(set.has(A))return;
    const dx=pB.x-pA.x,dy=pB.y-pA.y,l2=dx*dx+dy*dy;
    set.forEach(k=>{const p=sa[k],t=((p.x-pA.x)*dx+(p.y-pA.y)*dy)/l2,fx=pA.x+t*dx,fy=pA.y+t*dy;p.x=f(2*fx-p.x);p.y=f(2*fy-p.y)});
  });
  m.atoms.forEach((a,i)=>{
    if(!a.chir)return;
    const order=a.nb.map(bi=>oth(bi,i));
    if(a.h===1){if(a.hasPrev)order.splice(1,0,'H');else order.unshift('H')}
    if(order.length!==4)return;
    const c=sa[i],bIdx=o=>adj[i].find(bi=>oth(bi,i)===o);
    const cand=order.filter(o=>o!=='H').filter(o=>m.bonds[bIdx(o)].order===1&&!(ringOf[o]>=0&&ringOf[o]===ringOf[i])).sort((p,r)=>adj[p].length-adj[r].length);
    if(!cand.length)return;
    const w=cand[0];
    const P=o=>{if(o==='H'){let sx=0,sy=0;order.forEach(x=>{if(x==='H')return;const s=sa[x],l=Math.hypot(s.x-c.x,s.y-c.y)||1;sx+=(s.x-c.x)/l;sy+=(s.y-c.y)/l});return[-sx*.3,sy*.3,-1]}
      const s=sa[o];return[(s.x-c.x)/L,-(s.y-c.y)/L,o===w?.9:0]};
    const v=order.map(P),sub=(p,r)=>[p[0]-r[0],p[1]-r[1],p[2]-r[2]],u=sub(v[1],v[0]),vv=sub(v[2],v[0]),ww=sub(v[3],v[0]);
    const V=u[0]*(vv[1]*ww[2]-vv[2]*ww[1])-u[1]*(vv[0]*ww[2]-vv[2]*ww[0])+u[2]*(vv[0]*ww[1]-vv[1]*ww[0]);
    const sb=findBond(d,c.id,sa[w].id);sb.a=c.id;sb.b=sa[w].id;sb.stereo=((V<0)===(a.chir==='@'))?'wedge':'hash';
  });
  const bb=bbox(d);if(bb){const p=16;for(const a of d.atoms){a.x=f(a.x-bb.x+p);a.y=f(a.y-bb.y+p)}d.h=Math.ceil(bb.h+2*p)}
  SMI_MAP=sa;return d;
}
let SMI_MAP=null;const _svgCache=new Map();
function structSVG(d,scale=1.25,cls='struct'){
  const bb=bbox(d);if(!bb)return'';const p=10,w=bb.w+2*p,h=bb.h+2*p;
  return`<svg class="${cls}" xmlns="http://www.w3.org/2000/svg" viewBox="${f(bb.x-p)} ${f(bb.y-p)} ${f(w)} ${f(h)}" width="${f(w*scale)}" height="${f(h*scale)}" role="img">${drawScheme(d,THEME)}</svg>`;
}
function smilesSVG(smi,scale,cls){const k=smi+'|'+scale+'|'+cls;if(!_svgCache.has(k))_svgCache.set(k,structSVG(smilesToScheme(smi),scale,cls));return _svgCache.get(k)}

/* ---------- 3D: models from drawings ---------- */
const S3=1.5/L;
const COV={H:.31,C:.76,N:.71,O:.66,F:.57,B:.84,Si:1.11,P:1.07,S:1.05,Cl:1.02,Br:1.2,I:1.39,Li:1.28,Na:1.66,K:2.03,Mg:1.41,Al:1.21,Zn:1.22,Cu:1.32,Sn:1.39,Se:1.2,'*':.76};
const ELEMS=new Set('H He Li Be B C N O F Ne Na Mg Al Si P S Cl K Ca Ti Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Pd Ag Cd In Sn Sb Te I Xe Cs Ba Pt Au Hg Pb Bi'.split(' '));
const PSEUDO_RE=/^(R\d*'{0,2}|Ar|Nu|E|X|Y|Z|LG|Lg|M|Base|PG|Pg|Ln)$/;
const GROUPS3={Boc:'C(=O)OC(C)(C)C',Cbz:'C(=O)OCc1ccccc1',Fmoc:'C(=O)OCC1c2ccccc2-c2ccccc21',PMB:'Cc1ccc(OC)cc1',Bz:'C(=O)c1ccccc1',Piv:'C(=O)C(C)(C)C',TBS:'[Si](C)(C)C(C)(C)C',TBDMS:'[Si](C)(C)C(C)(C)C',TIPS:'[Si](C(C)C)(C(C)C)C(C)C',TBDPS:'[Si](c1ccccc1)(c1ccccc1)C(C)(C)C',MOM:'COC',THP:'C1CCCCO1',Tr:'C(c1ccccc1)(c1ccccc1)c1ccccc1',Tf:'S(=O)(=O)C(F)(F)F',OBoc:'OC(=O)OC(C)(C)C',NHBoc:'NC(=O)OC(C)(C)C',OTBS:'O[Si](C)(C)C(C)(C)C',OBn:'OCc1ccccc1',OMe:'OC',MeO:'OC',OEt:'OCC',EtO:'OCC',OtBu:'OC(C)(C)C',tBuO:'OC(C)(C)C',OPh:'Oc1ccccc1',PhO:'Oc1ccccc1',OAc:'OC(C)=O',AcO:'OC(C)=O',Me:'C',Et:'CC',Pr:'CCC',nPr:'CCC',iPr:'C(C)C',Bu:'CCCC',nBu:'CCCC',tBu:'C(C)(C)C',Ph:'c1ccccc1',Bn:'Cc1ccccc1',Ac:'C(C)=O',COMe:'C(C)=O',CHO:'C=O',OHC:'C=O',CO2H:'C(=O)O',COOH:'C(=O)O',HO2C:'C(=O)O',HOOC:'C(=O)O',CO2Me:'C(=O)OC',COOMe:'C(=O)OC',MeO2C:'C(=O)OC',CO2Et:'C(=O)OCC',COOEt:'C(=O)OCC',EtO2C:'C(=O)OCC',CONH2:'C(N)=O',COCl:'C(Cl)=O',CN:'C#N',NC:'N#C',NO2:'[N+](=O)[O-]',O2N:'[N+](=O)[O-]',SO3H:'S(=O)(=O)O',SO3:'S(=O)(=O)[O-]',CF3:'C(F)(F)F',F3C:'C(F)(F)F',CCl3:'C(Cl)(Cl)Cl',MgBr:'[Mg]Br',MgCl:'[Mg]Cl',MgI:'[Mg]I',BrMg:'[Mg]Br',OMs:'OS(C)(=O)=O',MsO:'OS(C)(=O)=O',OTs:'OS(=O)(=O)c1ccc(C)cc1',TsO:'OS(=O)(=O)c1ccc(C)cc1',Ms:'S(C)(=O)=O',Ts:'S(=O)(=O)c1ccc(C)cc1',TMS:'[Si](C)(C)C',NMe2:'N(C)C',Me2N:'N(C)C',NEt2:'N(CC)CC',NHMe:'NC',SMe:'SC',MeS:'SC',BF3:'B(F)(F)F',N3:'N=[N+]=[N-]',NCO:'N=C=O',SCN:'SC#N'};
const VAL3={H:1,B:3,C:4,Si:4,N:3,P:3,O:2,S:2,F:1,Cl:1,Br:1,I:1,Al:3,Se:2};
function h3(el,charge,bsum){let v=VAL3[el];if(v==null)return 0;const c=charge||0;
  if(el==='C'||el==='Si')v=c?3:4;else if(el==='B'||el==='Al')v=c===-1?4:c===1?2:3;else if(['N','O','S','P','Se'].includes(el))v=v+c;else v=v-Math.abs(c);
  return Math.max(0,Math.round(v-bsum))}
function fromSmiles3(smi,charge){const m=parseSmiles(smi);return{atoms:m.atoms.map((a,k)=>({el:a.el,charge:a.charge+(k===0?charge:0),hFix:a.h!==null?a.h:null})),bonds:m.bonds.map(b=>[b.a,b.b,b.order])}}
function expandLabel(lab,charge){
  if(ELEMS.has(lab))return{atoms:[{el:lab,charge,hFix:null}],bonds:[]};
  if(lab==='NO2'&&charge===1)return fromSmiles3('[N+](=O)=O',0);
  if(GROUPS3[lab])return fromSmiles3(GROUPS3[lab],charge);
  if(PSEUDO_RE.test(lab))return{atoms:[{el:'*',pseudo:lab,charge}],bonds:[]};
  const toks=[...lab.matchAll(/([A-Z][a-z]?)(\d*)/g)];
  if(toks.length&&toks.map(t=>t[0]).join('')===lab&&toks.every(t=>ELEMS.has(t[1]))){
    const heavy=[];toks.forEach(t=>{const n=t[2]?+t[2]:1;if(t[1]!=='H')for(let k=0;k<n;k++)heavy.push(t[1])});
    if(!heavy.length)return{atoms:[{el:'H',charge,hFix:null}],bonds:[]};
    return{atoms:heavy.map((el,k)=>({el,charge:k===0?charge:0,hFix:null})),bonds:heavy.slice(1).map((_,k)=>[0,k+1,1])};
  }
  return{atoms:[{el:'*',pseudo:lab,charge}],bonds:[]};
}
const v3={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],len:a=>Math.hypot(a[0],a[1],a[2]),norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]},lerp:(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t]};
function rng3(seed){let s=(seed*2654435761)>>>0||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}}

/* split a drawing into steps at the straight reaction arrows */
function splitStages(d){
  const frags=[],comp={};
  for(const a of d.atoms){if(comp[a.id]!=null)continue;const ids=[...fragment(d,a.id)],fi=frags.length;ids.forEach(id=>comp[id]=fi);const pts=ids.map(id=>getAtom(d,id));frags.push({ids,cx:pts.reduce((s,p)=>s+p.x,0)/pts.length,cy:pts.reduce((s,p)=>s+p.y,0)/pts.length})}
  const ROW=70,nearAtom=(x,y)=>d.atoms.some(t=>Math.hypot(t.x-x,t.y-y)<17),arrows=d.arrows.filter(a=>!nearAtom(a.x1,a.y1)&&!nearAtom(a.x2,a.y2)).map(a=>({a,mx:(a.x1+a.x2)/2,my:(a.y1+a.y2)/2,vert:Math.abs(a.y2-a.y1)>Math.abs(a.x2-a.x1)}));
  arrows.sort((p,q)=>Math.abs(p.my-q.my)<ROW?p.mx-q.mx:p.my-q.my);
  const pre=(ar,x,y)=>ar.vert?y>Math.max(ar.a.y1,ar.a.y2)-5:(Math.abs(ar.my-y)<ROW&&ar.mx<x)||ar.my<y-ROW;
  const idx=(x,y)=>arrows.reduce((s,ar)=>s+(pre(ar,x,y)?1:0),0);
  const raw=[];for(let k=0;k<=arrows.length;k++)raw.push({atomIds:[],texts:[],curls:[]});
  frags.forEach(fr=>raw[idx(fr.cx,fr.cy)].atomIds.push(...fr.ids));
  d.texts.forEach(t=>raw[idx(t.x+textW(t.text,FS)/2,t.y-4)].texts.push(t.text));
  d.curls.forEach(c=>{const an=c.from.kind==='atom'?c.from.id:c.from.kind==='bond'?(d.bonds.find(b=>b.id===c.from.id)||{}).a:null;if(an!=null&&comp[an]!=null){const fr=frags[comp[an]];raw[idx(fr.cx,fr.cy)].curls.push(c)}});
  const out=[];let pendArrows=[];
  raw.forEach((s,k)=>{if(k>0)pendArrows.push(arrows[k-1].a);if(!s.atomIds.length)return;s.arrowIn=out.length?pendArrows.slice():[];pendArrows=[];out.push(s)});
  return out;
}

function buildStage(d,st,seed){
  const R=rng3(seed),atoms=[],bonds=[],anchor={},ids=new Set(st.atomIds);
  const add=o=>{atoms.push(Object.assign({p:[0,0,0],charge:0,h:false,lp:false,pseudo:null,src:null},o));return atoms.length-1};
  const bond=(i,j,o,x)=>bonds.push(Object.assign({i,j,o},x||{}));
  for(const id of st.atomIds){
    const a=getAtom(d,id),ex=expandLabel(a.el||'C',a.charge||0),base=atoms.length;
    let ox=0,oy=0;nbrs(d,id).filter(n=>ids.has(n.id)).forEach(n=>{const l=Math.hypot(n.x-a.x,n.y-a.y)||1;ox+=(n.x-a.x)/l;oy+=(n.y-a.y)/l});
    let out=Math.hypot(ox,oy)>.2?v3.norm([-ox,oy,0]):[1,0,0];const perp=[-out[1],out[0],0],ap=[a.x*S3,-a.y*S3,0];
    const depth=[0],seen=new Set([0]),qq=[0],adj=ex.atoms.map(()=>[]);ex.bonds.forEach(([i,j])=>{adj[i].push(j);adj[j].push(i)});
    while(qq.length){const x=qq.shift();for(const y of adj[x])if(!seen.has(y)){seen.add(y);depth[y]=depth[x]+1;qq.push(y)}}
    const cnt={};
    ex.atoms.forEach((g,k)=>{const dp=depth[k]||0,c=cnt[dp]=(cnt[dp]||0)+1,spread=(c-1)%2?-(Math.ceil((c-1)/2)):Math.ceil((c-1)/2);
      const p=k===0?ap:v3.add(ap,v3.add(v3.mul(out,1.3*dp),v3.add(v3.mul(perp,.9*spread),[0,0,(R()-.5)*.4])));
      add({el:g.el,charge:g.charge||0,pseudo:g.pseudo||null,hFix:g.hFix,src:k===0?id:null,lpN:k===0?(a.lp||0):0,p,h:g.el==='H'});
    });
    ex.bonds.forEach(([i,j,o])=>bond(base+i,base+j,o));
    anchor[id]=base;
  }
  for(const b of d.bonds){if(!ids.has(b.a)||!ids.has(b.b))continue;bond(anchor[b.a],anchor[b.b],b.order||1,b.stereo?{stereo:b.stereo,narrow:anchor[b.a]}:null);
    if(b.stereo){const w=atoms[anchor[b.b]];w.p=[w.p[0],w.p[1],w.p[2]+(b.stereo==='wedge'?.9:-.9)]}}
  const heavyN=i=>bonds.filter(b=>b.i===i||b.j===i).map(b=>b.i===i?b.j:b.i);
  const hyb=i=>{const a=atoms[i];if(a.h||a.lp||a.el==='*')return 3;let t=0,d2=0;bonds.forEach(b=>{if(b.i!==i&&b.j!==i)return;if(b.o===3)t++;if(b.o===2)d2++});
    if(['S','P','Cl','Br','I','Se','Mg','Li','Na','K','Al','Si'].includes(a.el))return 3;
    if(t||d2>=2)return 1;if(d2)return 2;if(a.el==='C'&&a.charge>0)return 2;if((a.el==='B'||a.el==='Al')&&a.charge===0)return 2;
    if(a.el==='N'&&a.charge===0&&heavyN(i).some(j=>bonds.some(b=>(b.i===j||b.j===j)&&b.o>=2)))return 2;
    return 3};
  // ring puckers for saturated six-membered rings
  const rings=findRings3(atoms,bonds);
  rings.forEach(r=>{if(r.length===6&&r.every(i=>hyb(i)===3))r.forEach((i,k)=>{atoms[i].p=[atoms[i].p[0],atoms[i].p[1],atoms[i].p[2]+(k%2?.25:-.25)]})});
  // hydrogens and lone pairs
  const nHeavy=atoms.length;
  for(let i=0;i<nHeavy;i++){
    const a=atoms[i];if(a.el==='*')continue;
    const bs=bonds.filter(b=>b.i===i||b.j===i).reduce((s,b)=>s+b.o,0);
    const nH=a.h?0:a.hFix!=null?a.hFix:h3(a.el,a.charge,bs),nL=a.lpN||0,k=nH+nL;if(!k)continue;
    const U=heavyN(i).map(j=>v3.norm(v3.sub(atoms[j].p,a.p))),hy=hyb(i);
    let sum=U.reduce((s,u)=>v3.add(s,u),[0,0,0]),out=U.length?(v3.len(sum)>.15?v3.norm(v3.mul(sum,-1)):null):[1,0,0];
    const wedge=bonds.find(b=>b.narrow===i),zs=wedge?(wedge.stereo==='wedge'?-1:1):(R()<.5?1:-1);
    if(!out)out=[0,0,zs];
    let perp=v3.cross([0,0,1],out);perp=v3.len(perp)<.1?[1,0,0]:v3.norm(perp);const zz=v3.norm(v3.cross(out,perp));
    let dirs=[];
    if(!U.length)dirs=k===1?[[1,0,0]]:k===2&&hy!==3?[[1,0,0],[-1,0,0]]:hy===2?[[1,0,0],[-.5,.866,0],[-.5,-.866,0]]:[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(v3.norm);
    else if(hy===1)dirs=[out];
    else if(hy===2)dirs=U.length===1?[v3.add(v3.mul(out,.5),v3.mul(perp,.866)),v3.add(v3.mul(out,.5),v3.mul(perp,-.866))]:[out];
    else if(U.length===1)dirs=[0,120,240].map(t=>{const r=t*Math.PI/180;return v3.norm(v3.add(v3.mul(out,.334),v3.mul(v3.add(v3.mul(perp,Math.cos(r)),v3.mul(zz,Math.sin(r))),.943)))});
    else if(U.length===2)dirs=[v3.norm(v3.add(v3.mul(out,.58),v3.mul([0,0,1],.82*zs))),v3.norm(v3.add(v3.mul(out,.58),v3.mul([0,0,1],-.82*zs)))];
    else dirs=[v3.norm(v3.add(v3.mul(out,.35),[0,0,zs]))];
    for(let q=0;q<k;q++){
      const isLP=q>=nH,dv=dirs[q%dirs.length],len=isLP?.55:(COV[a.el]||.76)+.31;
      const j=add({el:isLP?'LP':'H',h:!isLP,lp:isLP,p:v3.add(a.p,v3.mul(dv,len*(q>=dirs.length?.8:1)))});
      bond(i,j,isLP?0:1,isLP?{lpb:true}:null);
    }
  }
  atoms.forEach(a=>{a.p=[a.p[0]+(R()-.5)*.03,a.p[1]+(R()-.5)*.03,a.p[2]+(R()-.5)*.12]});
  minimize3(atoms,bonds,hyb,rings);
  const st3={atoms,bonds,anchor,texts:st.texts,arrowIn:st.arrowIn,curls2D:st.curls,hyb};
  st3.curls=st.curls.map(c=>curl3D(d,st3,c)).filter(Boolean);
  return st3;
}
function findRings3(atoms,bonds){
  const adj=atoms.map(()=>[]);bonds.forEach(b=>{if(b.lpb||atoms[b.i].h||atoms[b.j].h)return;adj[b.i].push(b.j);adj[b.j].push(b.i)});
  const seen=new Set(),out=[];
  bonds.forEach(b=>{if(b.lpb||atoms[b.i].h||atoms[b.j].h)return;
    const pr=new Map([[b.j,-1]]),q=[b.j];
    while(q.length){const x=q.shift();if(x===b.i)break;for(const y of adj[x]){if((x===b.j&&y===b.i)||pr.has(y))continue;pr.set(y,x);q.push(y)}}
    if(!pr.has(b.i))return;const path=[];let x=b.i;while(x!==-1){path.push(x);x=pr.get(x)}
    if(path.length>8)return;const key=[...path].sort((p,q2)=>p-q2).join(',');if(!seen.has(key)){seen.add(key);out.push(path)}});
  return out;
}
function minimize3(atoms,bonds,hyb,rings){
  const n=atoms.length,P=new Float64Array(n*3);atoms.forEach((a,i)=>{P[3*i]=a.p[0];P[3*i+1]=a.p[1];P[3*i+2]=a.p[2]});
  const nb=atoms.map(()=>[]),blen={};
  const r0=(i,j,o)=>{const A=atoms[i],B=atoms[j];if(A.lp||B.lp)return .55;let r=(COV[A.el]||.76)+(COV[B.el]||.76);if(o===2)r-=.2;else if(o===3)r-=.34;return r};
  const springs=[];
  bonds.forEach(b=>{nb[b.i].push(b.j);nb[b.j].push(b.i);const r=r0(b.i,b.j,b.o);blen[b.i+'-'+b.j]=blen[b.j+'-'+b.i]=r;springs.push([b.i,b.j,r,1.2])});
  const near=new Set(),k13=(i,j)=>near.add(i<j?i+'-'+j:j+'-'+i);
  bonds.forEach(b=>k13(b.i,b.j));
  for(let i=0;i<n;i++){
    const a=atoms[i];if(a.h||a.lp)continue;const N=nb[i];if(N.length<2||N.length>4)continue;
    const hy=N.length===4?3:hyb(i),th=hy===1?Math.PI:hy===2?2*Math.PI/3:1.9106;
    const inRing=(rings.find(r=>r.includes(i))||[]).length;
    for(let x=0;x<N.length;x++)for(let y=x+1;y<N.length;y++){
      const j=N[x],k=N[y],r1=blen[i+'-'+j],r2=blen[i+'-'+k];let t=th;
      const rr=rings.find(r=>r.includes(i)&&r.includes(j)&&r.includes(k));
      if(rr&&inRing){const ia=Math.PI*(rr.length-2)/rr.length;if(rr.length<6)t=Math.min(th,ia);else if(rr.length>6&&hy===2)t=ia}
      springs.push([j,k,Math.sqrt(r1*r1+r2*r2-2*r1*r2*Math.cos(t)),.6]);k13(j,k);
    }
  }
  const pos=i=>[P[3*i],P[3*i+1],P[3*i+2]];
  bonds.forEach(b=>{
    if(b.o!==2||atoms[b.i].h||atoms[b.j].h||hyb(b.i)!==2||hyb(b.j)!==2)return;
    const i=b.i,j=b.j,v=v3.norm(v3.sub(pos(j),pos(i))),rij=blen[i+'-'+j];
    nb[i].filter(x=>x!==j).forEach(a=>nb[j].filter(x=>x!==i).forEach(c=>{
      if(a===c||nb[a].includes(c)||rings.some(r=>r.length<6&&r.includes(i)&&r.includes(j)&&r.includes(a)&&r.includes(c)))return;
      const pa=v3.sub(pos(a),pos(i)),pc=v3.sub(pos(c),pos(j)),qa=v3.sub(pa,v3.mul(v,v3.dot(pa,v))),qc=v3.sub(pc,v3.mul(v,v3.dot(pc,v))),cis=v3.dot(qa,qc)>0;
      const ra=blen[i+'-'+a],rc=blen[j+'-'+c],A=[-ra*.5,ra*.866,0],C=[rij+rc*.5,(cis?1:-1)*rc*.866,0];
      springs.push([a,c,v3.len(v3.sub(A,C)),.4]);
    }));
  });
  const topo=atoms.map(()=>new Map());
  for(let i=0;i<n;i++){const q=[[i,0]],m=topo[i];m.set(i,0);while(q.length){const[x,dd]=q.shift();if(dd>=3)continue;for(const y of nb[x])if(!m.has(y)){m.set(y,dd+1);q.push([y,dd+1])}}}
  const rep=[];
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    if(near.has(i+'-'+j))continue;const td=topo[i].get(j),A=atoms[i],B=atoms[j],far=td===undefined;
    let dm;if(A.lp||B.lp)dm=A.lp&&B.lp?1.3:(td===3?1.5:1.9);else if(A.h&&B.h)dm=td===3?1.9:2.1;else if(A.h||B.h)dm=td===3?2.3:2.6;else dm=td===3?2.6:3.1;
    if(far&&!(A.lp||B.lp))dm+=.5;rep.push([i,j,dm]);
  }
  const chir=[];
  bonds.forEach(b=>{if(!b.stereo)return;const c=b.narrow,N=nb[c].filter(x=>!atoms[x].lp);if(N.length!==4)return;
    const p=N.map(pos),u=v3.sub(p[1],p[0]),w=v3.sub(p[2],p[0]),x=v3.sub(p[3],p[0]),V=v3.dot(u,v3.cross(w,x));if(Math.abs(V)>.05)chir.push([N,Math.sign(V)])});
  const G=new Float64Array(n*3),Vel=new Float64Array(n*3),IT=1400;
  for(let it=0;it<IT;it++){
    G.fill(0);
    for(const[i,j,d0,k]of springs){const dx=P[3*i]-P[3*j],dy=P[3*i+1]-P[3*j+1],dz=P[3*i+2]-P[3*j+2],dd=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-6,g=2*k*(dd-d0)/dd;
      G[3*i]+=g*dx;G[3*i+1]+=g*dy;G[3*i+2]+=g*dz;G[3*j]-=g*dx;G[3*j+1]-=g*dy;G[3*j+2]-=g*dz}
    for(const[i,j,dm]of rep){const dx=P[3*i]-P[3*j],dy=P[3*i+1]-P[3*j+1],dz=P[3*i+2]-P[3*j+2],d2=dx*dx+dy*dy+dz*dz;if(d2>=dm*dm)continue;const dd=Math.sqrt(d2)||1e-6,g=.8*(dd-dm)/dd;
      G[3*i]+=g*dx;G[3*i+1]+=g*dy;G[3*i+2]+=g*dz;G[3*j]-=g*dx;G[3*j+1]-=g*dy;G[3*j+2]-=g*dz}
    for(const[N,s]of chir){const p=N.map(pos),u=v3.sub(p[1],p[0]),w=v3.sub(p[2],p[0]),x=v3.sub(p[3],p[0]),V=v3.dot(u,v3.cross(w,x)),vmin=1.5;if(s*V>=vmin)continue;
      const f2=2*(s*V-vmin)*s,g1=v3.cross(w,x),g2=v3.cross(x,u),g3=v3.cross(u,w),g0=v3.mul(v3.add(g1,v3.add(g2,g3)),-1);
      [g0,g1,g2,g3].forEach((g,k)=>{const a=N[k];G[3*a]+=f2*g[0];G[3*a+1]+=f2*g[1];G[3*a+2]+=f2*g[2]})}
    const lr=.045*(1-.6*it/IT);
    for(let q=0;q<3*n;q++){let v=.75*Vel[q]-lr*G[q];if(v>.2)v=.2;else if(v<-.2)v=-.2;Vel[q]=v;P[q]+=v}
  }
  atoms.forEach((a,i)=>{a.p=[P[3*i],P[3*i+1],P[3*i+2]]});
}
function curl3D(d,st,c){
  const A=st.atoms,an=x=>{if(x.kind==='atom'){const i=st.anchor[x.id];return i==null?null:{atom:i,p:A[i].p}}
    if(x.kind==='bond'){const b=d.bonds.find(q=>q.id===x.id);if(!b)return null;const i=st.anchor[b.a],j=st.anchor[b.b];if(i==null||j==null)return null;return{bond:[i,j],p:v3.lerp(A[i].p,A[j].p,.5)}}
    let best=null,bd=1e9;for(const id in st.anchor){const a2=getAtom(d,id);if(!a2)continue;const q=Math.hypot(a2.x-x.x,a2.y-x.y);if(q<bd){bd=q;best=a2}}
    if(!best)return null;const i=st.anchor[best.id];return{pt:true,p:v3.add(A[i].p,[(x.x-best.x)*S3,-(x.y-best.y)*S3,0])}};
  const F=an(c.from),T=an(c.to);if(!F||!T)return null;
  const g=curlGeom(d,c);let off=[0,0,0];if(g){off=[(g.c.x-g.m.x)*S3,-(g.c.y-g.m.y)*S3,0]}
  let p0=F.p;const tgt=T.p,mid=v3.lerp(p0,tgt,.5),chord=v3.len(v3.sub(tgt,p0));
  const p1=v3.add(mid,v3.add(v3.mul(off,.9),[0,0,.55+.2*chord]));
  if(F.atom!=null){const lps=A.map((a,k)=>({a,k})).filter(o=>o.a.lp&&st.bonds.some(b=>b.lpb&&((b.i===F.atom&&b.j===o.k)||(b.j===F.atom&&b.i===o.k))));
    if(lps.length){lps.sort((x,y)=>v3.len(v3.sub(x.a.p,p1))-v3.len(v3.sub(y.a.p,p1)));p0=v3.add(A[F.atom].p,v3.mul(v3.norm(v3.sub(lps[0].a.p,A[F.atom].p)),.62))}
    else p0=v3.add(p0,v3.mul(v3.norm(v3.sub(p1,p0)),.38))}
  const p2=v3.sub(tgt,v3.mul(v3.norm(v3.sub(tgt,p1)),T.atom!=null?.42:T.bond?.12:0));
  return{p0,p1,p2,half:!!c.half,from:F,to:T,src:c};
}
/* atom mapping between consecutive steps */
function editedBonds(S){
  const ord=new Map(),key=(i,j)=>i<j?i+'-'+j:j+'-'+i;
  S.bonds.forEach(b=>{if(!b.lpb)ord.set(key(b.i,b.j),b.o)});
  const inc=(i,j,v)=>{const k=key(i,j);ord.set(k,(ord.get(k)||0)+v)};
  const nearest=(pair,p)=>v3.len(v3.sub(S.atoms[pair[0]].p,p))<=v3.len(v3.sub(S.atoms[pair[1]].p,p))?pair[0]:pair[1];
  for(const c of S.curls){const w=c.half?.5:1,F=c.from,T=c.to;
    if(F.atom!=null){if(T.atom!=null)inc(F.atom,T.atom,w);else if(T.bond){if(T.bond.includes(F.atom))inc(T.bond[0],T.bond[1],w);else inc(F.atom,nearest(T.bond,S.atoms[F.atom].p),w)}}
    else if(F.bond){inc(F.bond[0],F.bond[1],-w);
      if(T.atom!=null){if(!F.bond.includes(T.atom))inc(nearest(F.bond,S.atoms[T.atom].p),T.atom,w)}
      else if(T.bond)inc(T.bond[0],T.bond[1],w)}}
  const out=[];ord.forEach((o,k)=>{const r=Math.round(o);if(r>0){const[i,j]=k.split('-').map(Number);out.push({i,j,o:r})}});return out;
}
function graphOf(atoms,bonds){const nb=atoms.map(()=>[]);bonds.forEach(b=>{if(b.lpb)return;nb[b.i].push({to:b.j,o:b.o});nb[b.j].push({to:b.i,o:b.o})});return nb}
function quatAlign(P,Q){ // rotation taking Q points onto P points (both centred)
  let S=[[0,0,0],[0,0,0],[0,0,0]];P.forEach((p,k)=>{const q=Q[k];for(let a=0;a<3;a++)for(let b=0;b<3;b++)S[a][b]+=q[a]*p[b]});
  const[[xx,xy,xz],[yx,yy,yz],[zx,zy,zz]]=S;
  const N=[[xx+yy+zz,yz-zy,zx-xz,xy-yx],[yz-zy,xx-yy-zz,xy+yx,zx+xz],[zx-xz,xy+yx,-xx+yy-zz,yz+zy],[xy-yx,zx+xz,yz+zy,-xx-yy+zz]];
  const sh=N.flat().reduce((s,v)=>s+Math.abs(v),0)+1;let v=[1,.01,.02,.03];
  for(let it=0;it<200;it++){const w=[0,1,2,3].map(r=>N[r].reduce((s,x,c)=>s+x*v[c],0)+sh*v[r]);const l=Math.hypot(...w);v=w.map(x=>x/l)}
  const[w,x,y,z]=v;return[[1-2*(y*y+z*z),2*(x*y-w*z),2*(x*z+w*y)],[2*(x*y+w*z),1-2*(x*x+z*z),2*(y*z-w*x)],[2*(x*z-w*y),2*(y*z+w*x),1-2*(x*x+y*y)]];
}
const applyR=(M,p)=>[M[0][0]*p[0]+M[0][1]*p[1]+M[0][2]*p[2],M[1][0]*p[0]+M[1][1]*p[1]+M[1][2]*p[2],M[2][0]*p[0]+M[2][1]*p[1]+M[2][2]*p[2]];
function transformStage(T,fn){T.atoms.forEach(a=>a.p=fn(a.p));T.curls.forEach(c=>{c.p0=fn(c.p0);c.p1=fn(c.p1);c.p2=fn(c.p2)})}
function centerStage(S){const hv=S.atoms.filter(a=>!a.lp);const c=hv.reduce((s,a)=>v3.add(s,a.p),[0,0,0]).map(x=>x/(hv.length||1));transformStage(S,p=>v3.sub(p,c))}
function mapStages(S,T){
  const SE=editedBonds(S),gS=graphOf(S.atoms,SE),gT=graphOf(T.atoms,T.bonds);
  const heavy=(A,i)=>!A[i].h&&!A[i].lp,lab=a=>a.el==='*'?'*'+a.pseudo:a.el;
  const Sh=S.atoms.map((_,i)=>i).filter(i=>heavy(S.atoms,i)),Th=T.atoms.map((_,i)=>i).filter(i=>heavy(T.atoms,i));
  const hdeg=(g,A,i)=>g[i].filter(e=>!A[e.to].h&&!A[e.to].lp).length,hcnt=(g,A,i)=>g[i].filter(e=>A[e.to].h).length;
  const m=new Map(),used=new Set();
  const extend=(s0,t0)=>{const lm=new Map([[s0,t0]]),lu=new Set([t0]),q=[[s0,t0]];let bm=0;
    while(q.length){const[a,b]=q.shift();
      const ns=gS[a].filter(e=>heavy(S.atoms,e.to)&&!m.has(e.to)&&!lm.has(e.to)).sort((x,y)=>hdeg(gS,S.atoms,y.to)-hdeg(gS,S.atoms,x.to));
      for(const e of ns){let best=null,bs=-1;
        for(const f of gT[b]){if(!heavy(T.atoms,f.to)||used.has(f.to)||lu.has(f.to)||lab(T.atoms[f.to])!==lab(S.atoms[e.to]))continue;
          const sc=(f.o===e.o?2:0)+(hdeg(gT,T.atoms,f.to)===hdeg(gS,S.atoms,e.to)?1:0)+(hcnt(gT,T.atoms,f.to)===hcnt(gS,S.atoms,e.to)?.5:0);if(sc>bs){bs=sc;best=f}}
        if(best){lm.set(e.to,best.to);lu.add(best.to);if(best.o===e.o)bm++;q.push([e.to,best.to])}}}
    return{lm,score:lm.size*10+bm+(hdeg(gS,S.atoms,s0)===hdeg(gT,T.atoms,t0)?.3:0)}};
  for(;;){let best=null;
    for(const s of Sh){if(m.has(s))continue;for(const t of Th){if(used.has(t)||lab(S.atoms[s])!==lab(T.atoms[t]))continue;const r=extend(s,t);if(!best||r.score>best.score)best=r}}
    if(!best||best.lm.size<2)break;best.lm.forEach((t,s)=>{m.set(s,t);used.add(t)});}
  for(const s of Sh){if(m.has(s)||hdeg(gS,S.atoms,s))continue;const t=Th.find(t2=>!used.has(t2)&&!hdeg(gT,T.atoms,t2)&&lab(T.atoms[t2])===lab(S.atoms[s]));if(t!=null){m.set(s,t);used.add(t)}}
  // align T onto S
  const pairs=[...m.entries()];
  if(pairs.length){
    const cS=pairs.reduce((a,[s])=>v3.add(a,S.atoms[s].p),[0,0,0]).map(x=>x/pairs.length),cT=pairs.reduce((a,[,t])=>v3.add(a,T.atoms[t].p),[0,0,0]).map(x=>x/pairs.length);
    let M=null;if(pairs.length>=3){M=quatAlign(pairs.map(([s])=>v3.sub(S.atoms[s].p,cS)),pairs.map(([,t])=>v3.sub(T.atoms[t].p,cT)))}
    transformStage(T,p=>{const q=v3.sub(p,cT);return v3.add(M?applyR(M,q):q,cS)});
  }else{const c=S.atoms.reduce((s,a)=>v3.add(s,a.p),[0,0,0]).map(x=>x/S.atoms.length);centerStage(T);transformStage(T,p=>v3.add(p,c))}
  // hydrogens follow their parents
  const perms=a=>a.length<=1?[a]:a.flatMap((x,i)=>perms(a.slice(0,i).concat(a.slice(i+1))).map(r=>[x,...r]));
  m.forEach((t,s)=>{const hs=gS[s].filter(e=>S.atoms[e.to].h).map(e=>e.to),ht=gT[t].filter(e=>T.atoms[e.to].h).map(e=>e.to);if(!hs.length||!ht.length)return;
    const small=hs.length<=ht.length?hs:ht,big=small===hs?ht:hs;let best=null,bc=1e9;
    for(const p of perms(big).slice(0,720)){let c=0;small.forEach((x,k)=>{const y=p[k];c+=v3.len(v3.sub((small===hs?S.atoms[x]:S.atoms[y]).p,(small===hs?T.atoms[y]:T.atoms[x]).p))});if(c<bc){bc=c;best=p}}
    small.forEach((x,k)=>{const y=best[k];if(small===hs)m.set(x,y);else m.set(y,x)});
  });
  const inv=new Map();m.forEach((t,s)=>inv.set(t,s));
  return{s2t:m,t2s:inv,heavyMapped:pairs.length};
}
function build3D(d){
  const st=splitStages(d);if(!st.length)return null;
  const stages=st.map((s,k)=>buildStage(d,s,k+7));
  centerStage(stages[0]);
  for(let k=1;k<stages.length;k++)stages[k].map=mapStages(stages[k-1],stages[k]);
  return{stages};
}

/* ---------- molecule analysis: graph, formula, mass, checks ---------- */
const AW={H:1.008,He:4.0026,Li:6.94,Be:9.0122,B:10.81,C:12.011,N:14.007,O:15.999,F:18.998,Ne:20.180,Na:22.990,Mg:24.305,Al:26.982,Si:28.085,P:30.974,S:32.06,Cl:35.45,Ar:39.95,K:39.098,Ca:40.078,Ti:47.867,Cr:51.996,Mn:54.938,Fe:55.845,Co:58.933,Ni:58.693,Cu:63.546,Zn:65.38,Ga:69.723,Ge:72.630,As:74.922,Se:78.971,Br:79.904,Kr:83.798,Rb:85.468,Sr:87.62,Pd:106.42,Ag:107.87,Cd:112.41,In:114.82,Sn:118.71,Sb:121.76,Te:127.60,I:126.90,Xe:131.29,Cs:132.91,Ba:137.33,Os:190.23,Pt:195.08,Au:196.97,Hg:200.59,Pb:207.2,Bi:208.98};
const ZNUM={H:1,He:2,Li:3,Be:4,B:5,C:6,N:7,O:8,F:9,Ne:10,Na:11,Mg:12,Al:13,Si:14,P:15,S:16,Cl:17,Ar:18,K:19,Ca:20,Ti:22,Cr:24,Mn:25,Fe:26,Co:27,Ni:28,Cu:29,Zn:30,Ga:31,Ge:32,As:33,Se:34,Br:35,Kr:36,Rb:37,Sr:38,Pd:46,Ag:47,Cd:48,In:49,Sn:50,Sb:51,Te:52,I:53,Xe:54,Cs:55,Ba:56,Os:76,Pt:78,Au:79,Hg:80,Pb:82,Bi:83};
/* allowed bond totals for the valence check (by element, adjusted for charge) */
function maxValence(el,c){
  c=c||0;
  if(el==='C'||el==='Si')return c?3:4;
  if(el==='N'||el==='P')return el==='P'?5+c:3+c;
  if(el==='O')return 2+c;
  if(el==='S')return 6;
  if(el==='B'||el==='Al')return c<0?4:3;
  if(el==='H')return 1;
  if(el==='F')return 1;
  if(el==='Cl'||el==='Br'||el==='I')return 7;
  return null;
}
function buildMol(d,ids){
  const set=new Set(ids),atoms=[],bonds=[],anchor={};
  for(const id of ids){
    const a=getAtom(d,id);if(!a)continue;
    const ex=expandLabel(a.el||'C',a.charge||0),base=atoms.length;
    ex.atoms.forEach((g,k)=>atoms.push({el:g.el,charge:g.charge||0,pseudo:g.pseudo||null,hFix:g.hFix!=null?g.hFix:null,src:k===0?id:null,x:a.x,y:a.y,inLabel:ex.atoms.length>1}));
    ex.bonds.forEach(([i,j,o])=>bonds.push({a:base+i,b:base+j,o,stereo:null}));
    anchor[id]=base;
  }
  for(const b of d.bonds){if(!set.has(b.a)||!set.has(b.b))continue;bonds.push({a:anchor[b.a],b:anchor[b.b],o:b.order||1,stereo:b.stereo||null,src:b.id})}
  const bs=atoms.map(()=>0);bonds.forEach(b=>{bs[b.a]+=b.o;bs[b.b]+=b.o});
  atoms.forEach((a,i)=>{a.bs=bs[i];a.h=a.el==='*'?0:a.hFix!=null?a.hFix:h3(a.el,a.charge,bs[i])});
  const adj=atoms.map(()=>[]);bonds.forEach((b,bi)=>{adj[b.a].push({to:b.b,o:b.o,bi});adj[b.b].push({to:b.a,o:b.o,bi})});
  return{atoms,bonds,adj,anchor};
}
/* fold drawn H atoms into their heavy neighbour so the graph is hydrogen-suppressed */
function foldH(m){
  const keep=[],map=new Map();
  m.atoms.forEach((a,i)=>{const nb=m.adj[i];if(a.el==='H'&&!a.charge&&nb.length===1&&m.atoms[nb[0].to].el!=='H'&&nb[0].o===1)return;map.set(i,keep.length);keep.push(i)});
  const atoms=keep.map(i=>Object.assign({},m.atoms[i],{orig:i}));
  m.atoms.forEach((a,i)=>{if(map.has(i))return;const p=m.adj[i][0].to;atoms[map.get(p)].h+=1});
  const bonds=[];m.bonds.forEach(b=>{if(map.has(b.a)&&map.has(b.b))bonds.push(Object.assign({},b,{a:map.get(b.a),b:map.get(b.b)}))});
  const adj=atoms.map(()=>[]);bonds.forEach((b,bi)=>{adj[b.a].push({to:b.b,o:b.o,bi});adj[b.b].push({to:b.a,o:b.o,bi})});
  return{atoms,bonds,adj,map};
}
function molComponents(d){
  const seen=new Set(),out=[];
  for(const a of d.atoms){if(seen.has(a.id))continue;const ids=[...fragment(d,a.id)];ids.forEach(x=>seen.add(x));
    const pts=ids.map(x=>getAtom(d,x));out.push({ids,cx:pts.reduce((s,p)=>s+p.x,0)/pts.length,cy:pts.reduce((s,p)=>s+p.y,0)/pts.length,
      x0:Math.min(...pts.map(p=>p.x)),x1:Math.max(...pts.map(p=>p.x)),y0:Math.min(...pts.map(p=>p.y)),y1:Math.max(...pts.map(p=>p.y))})}
  const ROW=60;out.sort((p,q)=>Math.abs(p.cy-q.cy)<ROW?p.cx-q.cx:p.cy-q.cy);
  return out;
}
function molFormula(m){
  const c={},pseudo=[];let q=0;
  m.atoms.forEach(a=>{if(a.el==='*'){pseudo.push(a.pseudo||'R');return}c[a.el]=(c[a.el]||0)+1;if(a.h)c.H=(c.H||0)+a.h;q+=a.charge||0});
  const keys=Object.keys(c).sort((x,y)=>{if(c.C){if(x==='C')return -1;if(y==='C')return 1;if(x==='H')return -1;if(y==='H')return 1}return x<y?-1:x>y?1:0});
  let mass=0,known=!pseudo.length;keys.forEach(k=>{if(AW[k]==null)known=false;else mass+=AW[k]*c[k]});
  let dbe=null;
  if(c.C&&!pseudo.length&&keys.every(k=>'C H N O S P F Cl Br I Si'.split(' ').includes(k))){
    const X=(c.F||0)+(c.Cl||0)+(c.Br||0)+(c.I||0);dbe=(c.C+(c.Si||0))+1+((c.N||0)+(c.P||0))/2-((c.H||0)+X)/2-0;
    if(q)dbe=null;
  }
  const text=keys.map(k=>k+(c[k]>1?c[k]:'')).join('')+pseudo.join('');
  return{counts:c,charge:q,pseudo,text,mass:known?mass:null,dbe};
}
function molChecks(m){
  const issues=[];
  m.atoms.forEach((a,i)=>{
    if(a.el==='*')return;const mx=maxValence(a.el,a.charge);if(mx==null)return;
    const tot=a.bs+(a.hFix!=null?a.hFix:0);
    if(tot>mx)issues.push({atom:i,src:a.src,kind:'valence',msg:`${a.el}${a.charge?(a.charge>0?'⁺':'⁻'):''} has ${tot} bonds; it can have at most ${mx}.`});
  });
  if(m.atoms.some(a=>a.el==='*')){const labs=[...new Set(m.atoms.filter(a=>a.el==='*').map(a=>a.pseudo||'R'))];issues.push({kind:'pseudo',msg:`Contains ${labs.join(', ')}, which Bondline can't turn into atoms, so the formula is incomplete.`})}
  return issues;
}
const fmtFormulaHTML=f=>(f.text||'').replace(/(\d+)/g,'<sub>$1</sub>')+(f.charge?`<sup>${Math.abs(f.charge)>1?Math.abs(f.charge):''}${f.charge>0?'+':'−'}</sup>`:'');

/* ---------- CIP priorities, R/S and E/Z ---------- */
const CIP_MAXD=12;
function cipZ(el){return el==='*'?0:(ZNUM[el]||0)}
function cipCtx(m){return{m,budget:60000}}
function cipNode(C,atom,from,path,depth){return{z:cipZ(C.m.atoms[atom].el),atom,from,path,depth,dup:false}}
function cipKids(C,n){
  if(n.kids)return n.kids;
  const k=[];
  if(n.atom>=0&&!n.dup&&n.depth<CIP_MAXD){
    if(--C.budget<0)throw new Error('cip-budget');
    const A=C.m.atoms[n.atom];
    for(const e of C.m.adj[n.atom]){
      if(e.to===n.from){for(let t=1;t<e.o;t++)k.push({z:cipZ(C.m.atoms[e.to].el),atom:e.to,dup:true,depth:n.depth+1});continue}
      if(n.path.includes(e.to)){for(let t=0;t<e.o;t++)k.push({z:cipZ(C.m.atoms[e.to].el),atom:e.to,dup:true,depth:n.depth+1});continue}
      k.push(cipNode(C,e.to,n.atom,n.path.concat(e.to),n.depth+1));
      for(let t=1;t<e.o;t++)k.push({z:cipZ(C.m.atoms[e.to].el),atom:e.to,dup:true,depth:n.depth+1});
    }
    for(let t=0;t<(A.h||0);t++)k.push({z:1,atom:-1,depth:n.depth+1});
  }
  n.kids=k;k.sort((a,b)=>cipCmp(C,b,a));
  return k;
}
function cipCmp(C,a,b){
  if(a.z!==b.z)return a.z-b.z;
  let LA=[[a]],LB=[[b]];
  for(let lvl=0;lvl<CIP_MAXD+1;lvl++){
    const NA=[],NB=[];
    for(const s of LA)for(const n of s)NA.push(cipKids(C,n));
    for(const s of LB)for(const n of s)NB.push(cipKids(C,n));
    const len=Math.max(NA.length,NB.length);let any=false;
    for(let i=0;i<len;i++){const sa=NA[i]||[],sb=NB[i]||[],l=Math.max(sa.length,sb.length);
      for(let j=0;j<l;j++){const za=sa[j]?sa[j].z:0,zb=sb[j]?sb[j].z:0;if(za!==zb)return za-zb;if(za||zb)any=true}}
    if(!any)return 0;LA=NA;LB=NB;
  }
  return 0;
}
/* rank the substituents around `atom` (excluding `skip`); returns branches high→low, or null if two tie */
function cipRank(C,atom,skip){
  const br=[];
  for(const e of C.m.adj[atom]){if(e.to===skip)continue;br.push({n:cipNode(C,e.to,atom,[atom,e.to],1),to:e.to})}
  for(let t=0;t<(C.m.atoms[atom].h||0);t++)br.push({n:{z:1,atom:-1,depth:1},to:-1});
  br.sort((p,q)=>cipCmp(C,q.n,p.n));
  for(let i=1;i<br.length;i++)if(cipCmp(C,br[i-1].n,br[i].n)===0)return{ranked:br,tie:true};
  return{ranked:br,tie:false};
}
function ringBondSmall(m,a,b,max){
  // is there another path a→b of at most max-1 bonds (bond a-b lies in a ring of size ≤ max)?
  const seen=new Map([[a,0]]),q=[a];
  while(q.length){const x=q.shift(),dx=seen.get(x);if(dx>=max-1)continue;
    for(const e of m.adj[x]){if((x===a&&e.to===b)||(x===b&&e.to===a))continue;if(e.to===b&&dx+1<=max-1)return true;if(!seen.has(e.to)){seen.set(e.to,dx+1);q.push(e.to)}}}
  return false;
}
function stereoCandidates(m){
  const C=cipCtx(m),centres=[],dbs=[];
  m.atoms.forEach((a,i)=>{
    if(a.el!=='C'&&a.el!=='Si')return;
    const nb=m.adj[i];if(nb.some(e=>e.o!==1))return;
    if(nb.length+(a.h||0)!==4||(a.h||0)>1)return;
    const r=cipRank(C,i,-1);if(r.tie)return;
    centres.push({atom:i,ranked:r.ranked.map(x=>x.to)});
  });
  m.bonds.forEach((b,bi)=>{
    if(b.o!==2)return;const A=m.atoms[b.a],B=m.atoms[b.b];
    if(!['C','N'].includes(A.el)||!['C','N'].includes(B.el))return;
    if(A.el==='N'||B.el==='N')return;
    const sa=m.adj[b.a].length-1+(A.h||0),sb=m.adj[b.b].length-1+(B.h||0);
    if(sa!==2||sb!==2)return;
    if(ringBondSmall(m,b.a,b.b,7))return;
    const ra=cipRank(C,b.a,b.b),rb=cipRank(C,b.b,b.a);if(ra.tie||rb.tie)return;
    dbs.push({bond:bi,a:b.a,b:b.b,ra:ra.ranked.map(x=>x.to),rb:rb.ranked.map(x=>x.to)});
  });
  return{centres,dbs};
}
/* read R/S and E/Z from a drawing-derived molecule (unfolded: drawn H atoms keep their positions) */
function cipFromDrawing(m){
  let cand;try{cand=stereoCandidates(m)}catch(e){return{centres:[],dbs:[],failed:true}}
  const P=i=>({x:m.atoms[i].x,y:m.atoms[i].y});
  const centres=cand.centres.map(c=>{
    const i=c.atom,O=P(i),vec={};let anyZ=false;
    for(const e of m.adj[i]){
      const b=m.bonds[e.bi],p=P(e.to),dx=p.x-O.x,dy=-(p.y-O.y),l=Math.hypot(dx,dy);
      if(l<1e-6)return{atom:i,label:null,ranked:c.ranked};
      let z=0;if(b.stereo&&b.a===i){z=b.stereo==='wedge'?.85:-.85;anyZ=true}
      vec[e.to]=[dx/l,dy/l,z];
    }
    if(!anyZ)return{atom:i,label:null,ranked:c.ranked};
    if(c.ranked.includes(-1)){
      const vs=Object.values(vec),s=vs.reduce((t,v)=>[t[0]+v[0],t[1]+v[1],t[2]+v[2]],[0,0,0]),l=Math.hypot(...s);
      vec[-1]=l<1e-6?[0,0,-1]:[-s[0]/l,-s[1]/l,-s[2]/l];
    }
    const [a,b,cc,d]=c.ranked.map(k=>vec[k]);
    const sub=(p,q)=>[p[0]-q[0],p[1]-q[1],p[2]-q[2]],u=sub(b,a),v=sub(cc,a);
    const n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],s=n[0]*d[0]+n[1]*d[1]+n[2]*d[2];
    return{atom:i,label:Math.abs(s)<1e-4?null:(s>0?'R':'S'),ranked:c.ranked};
  });
  const dbs=cand.dbs.map(x=>{
    const A=P(x.a),B=P(x.b),side=p=>{const v=(B.x-A.x)*(p.y-A.y)-(B.y-A.y)*(p.x-A.x);return Math.abs(v)<1e-3?0:Math.sign(v)};
    const sd=(ranked)=>{const hi=ranked[0],lo=ranked[1];if(hi===-1){const s=side(P(lo));return -s}return side(P(hi))};
    const s1=sd(x.ra),s2=sd(x.rb);
    return Object.assign(x,{label:!s1||!s2?null:(s1===s2?'Z':'E')});
  });
  return{centres,dbs};
}

/* ---------- SMILES writer (bracket atoms, with stereo) ---------- */
// G: {atoms:[{el,charge,h}], bonds:[{a,b,o}], adj}; stereo: {centres:{atom:'R'|'S'}, dbs:{bondIndex:'E'|'Z'}}
function toSmiles(G,stereo){
  stereo=stereo||{};
  const n=G.atoms.length;if(!n)return'';
  const C=cipCtx(G);
  const visited=new Array(n).fill(false),pos=new Array(n).fill(-1),parent=new Array(n).fill(-1),kids=G.atoms.map(()=>[]),rc=G.atoms.map(()=>[]),closureBi=new Set(),roots=[];
  let counter=0;
  for(let s0=0;s0<n;s0++){
    if(visited[s0])continue;
    const comp=[],st=[s0],seen=new Set([s0]);while(st.length){const x=st.pop();comp.push(x);for(const e of G.adj[x])if(!seen.has(e.to)){seen.add(e.to);st.push(e.to)}}
    comp.sort((a,b)=>G.adj[a].length-G.adj[b].length||a-b);const root=comp[0];roots.push(root);
    const onStack=new Set();
    const dfs=v=>{visited[v]=true;pos[v]=counter++;onStack.add(v);
      for(const e of G.adj[v]){const u=e.to;if(u===parent[v])continue;
        if(visited[u]){if(onStack.has(u)&&!closureBi.has(e.bi)){closureBi.add(e.bi);const c={open:u,close:v,bi:e.bi,o:e.o};rc[u].push(c);rc[v].push(c)}continue}
        parent[u]=v;kids[v].push(u);dfs(u)}
      onStack.delete(v)};
    dfs(root);
  }
  const other=(c,v)=>c.open===v?c.close:c.open;
  rc.forEach((list,v)=>list.sort((p,q)=>pos[other(p,v)]-pos[other(q,v)]));
  const nbOrder=v=>{const o=[];if(parent[v]>=0)o.push(parent[v]);if(G.atoms[v].h)o.push(-1);rc[v].forEach(c=>o.push(other(c,v)));kids[v].forEach(k=>o.push(k));return o};
  // directional single bonds for E/Z
  const dir=new Map(),bkey=(a,b)=>G.adj[a].find(e=>e.to===b).bi;
  const aFirst=(a,b)=>parent[b]===a?true:parent[a]===b?false:pos[a]<pos[b];
  const sideOf=(A,R)=>{const d=dir.get(bkey(A,R));if(!d)return 0;return aFirst(A,R)?(d==='/'?1:-1):(d==='/'?-1:1)};
  const setSide=(A,R,s)=>dir.set(bkey(A,R),aFirst(A,R)?(s>0?'/':'\\'):(s>0?'\\':'/'));
  for(const[bis,lab]of Object.entries(stereo.dbs||{})){
    const b=G.bonds[+bis];if(!b||b.o!==2)continue;
    const ra=cipRank(C,b.a,b.b),rb=cipRank(C,b.b,b.a);if(ra.tie||rb.tie)continue;
    const pick=(x,y)=>{const c=G.adj[x].filter(e=>e.to!==y&&e.o===1&&!closureBi.has(e.bi)).map(e=>e.to);const pre=c.find(t=>dir.has(bkey(x,t)));return pre!=null?pre:c[0]};
    const r1=pick(b.a,b.b),r2=pick(b.b,b.a);if(r1==null||r2==null)continue;
    const cis=((lab==='Z')!==(r1!==ra.ranked[0].to))!==(r2!==rb.ranked[0].to);
    let s1=sideOf(b.a,r1),s2=sideOf(b.b,r2);
    if(!s1&&!s2){setSide(b.a,r1,1);setSide(b.b,r2,cis?1:-1)}
    else if(s1&&!s2)setSide(b.b,r2,cis?s1:-s1);
    else if(!s1&&s2)setSide(b.a,r1,cis?s2:-s2);
  }
  const tag=new Map();
  for(const[as,lab]of Object.entries(stereo.centres||{})){
    const v=+as,r=cipRank(C,v,-1);if(r.tie||r.ranked.length!==4)continue;
    const pr=r.ranked.map(x=>x.to),ref=[pr[3],pr[0],pr[1],pr[2]],o=nbOrder(v);if(o.length!==4)continue;
    const p=o.map(x=>ref.indexOf(x));if(p.includes(-1))continue;
    let par=0;for(let i=0;i<4;i++)while(p[i]!==i){const j=p[i];[p[i],p[j]]=[p[j],p[i]];par^=1}
    tag.set(v,(lab==='R')!==(par===1)?'@':'@@');
  }
  const used=new Set(),num=new Map();
  const bch=(o,bi)=>o===2?'=':o===3?'#':(dir.get(bi)||'');
  const sym=v=>{const a=G.atoms[v];let s='['+a.el+(tag.get(v)||'');if(a.h)s+='H'+(a.h>1?a.h:'');if(a.charge)s+=(a.charge>0?'+':'-')+(Math.abs(a.charge)>1?Math.abs(a.charge):'');return s+']'};
  const emit=v=>{
    let s=sym(v);const free=[];
    for(const c of rc[v]){
      if(c.open===v){let k=1;while(used.has(k))k++;used.add(k);num.set(c,k);s+=bch(c.o,c.bi)+(k>9?'%'+k:k)}
      else{const k=num.get(c);free.push(k);s+=(k>9?'%'+k:k)}
    }
    free.forEach(k=>used.delete(k));
    kids[v].forEach((u,i)=>{const e=G.adj[v].find(x=>x.to===u);const piece=bch(e.o,e.bi)+emit(u);s+=i<kids[v].length-1?'('+piece+')':piece});
    return s;
  };
  return roots.map(emit).join('.');
}

/* ---------- IUPAC naming: structure → name ---------- */
function NameErr(msg){const e=new Error(msg);e.nameErr=true;return e}
const STEMS=['','meth','eth','prop','but','pent','hex','hept','oct','non','dec','undec','dodec','tridec','tetradec','pentadec','hexadec','heptadec','octadec','nonadec','icos'];
const MULT=['','','di','tri','tetra','penta','hexa','hepta','octa','nona','deca'];
const MULTC=['','','bis','tris','tetrakis','pentakis','hexakis','heptakis','octakis'];
const HALO={F:'fluoro',Cl:'chloro',Br:'bromo',I:'iodo'},HALIDE={F:'fluoride',Cl:'chloride',Br:'bromide',I:'iodide'};
const PRIO=['acid','ester','halide','amide','nitrile','aldehyde','ketone','alcohol','amine'];
const CTYPE=new Set(['acid','ester','halide','amide','nitrile','aldehyde']);
const SFX_CHAIN={acid:['oic acid','dioic acid'],ester:['oate','dioate'],amide:['amide','diamide'],nitrile:['nitrile','dinitrile'],aldehyde:['al','dial']};
const SFX_RING={acid:'carboxylic acid',ester:'carboxylate',halide:'carbonyl',amide:'carboxamide',nitrile:'carbonitrile',aldehyde:'carbaldehyde'};
const RETAINED_BZ={acid:'benzoic acid',ester:'benzoate',halide:'benzoyl',amide:'benzamide',nitrile:'benzonitrile',aldehyde:'benzaldehyde',alcohol:'phenol',amine:'aniline'};
const COMMON_NAMES={'methanenitrile':'hydrogen cyanide','2-hydroxypropanenitrile':'acetaldehyde cyanohydrin','2-hydroxy-2-methylpropanenitrile':'acetone cyanohydrin','ethanoic acid':'acetic acid','methanoic acid':'formic acid','propanone':'acetone','ethanal':'acetaldehyde','methanal':'formaldehyde','methylbenzene':'toluene','ethenylbenzene':'styrene','phenylmethanol':'benzyl alcohol','1-phenylethan-1-one':'acetophenone','ethoxyethane':'diethyl ether','methoxymethane':'dimethyl ether','ethanenitrile':'acetonitrile','trichloromethane':'chloroform','dichloromethane':'methylene chloride (DCM)','tetrachloromethane':'carbon tetrachloride','propan-2-ol':'isopropyl alcohol','2-methylpropan-2-ol':'tert-butanol','ethane-1,2-diol':'ethylene glycol','propane-1,2,3-triol':'glycerol','ethyl ethanoate':'ethyl acetate','methyl ethanoate':'methyl acetate','ethanamide':'acetamide','ethanoyl chloride':'acetyl chloride','benzene-1,2-dicarboxylic acid':'phthalic acid','benzene-1,4-dicarboxylic acid':'terephthalic acid','2-hydroxypropanoic acid':'lactic acid','ethene':'ethylene','ethyne':'acetylene','propene':'propylene','2-hydroxybenzoic acid':'salicylic acid','1,2-dimethylbenzene':'o-xylene','1,3-dimethylbenzene':'m-xylene','1,4-dimethylbenzene':'p-xylene','butanedioic acid':'succinic acid','ethanedioic acid':'oxalic acid','propanedioic acid':'malonic acid','hexanedioic acid':'adipic acid','2-aminoethanoic acid':'glycine','methoxybenzene':'anisole','N,N-dimethylmethanamine':'trimethylamine','N-ethylethanamine':'diethylamine','N,N-diethylethanamine':'triethylamine','buta-1,3-diene':'butadiene','2-methylbuta-1,3-diene':'isoprene','prop-2-enal':'acrolein','prop-2-enoic acid':'acrylic acid','2-methylprop-2-enoic acid':'methacrylic acid','N,N-dimethylmethanamide':'DMF (dimethylformamide)','butan-2-one':'methyl ethyl ketone (MEK)','4-methylpentan-2-one':'methyl isobutyl ketone','propane-1,2-diol':'propylene glycol','benzene-1,2-diol':'catechol','benzene-1,3-diol':'resorcinol','benzene-1,4-diol':'hydroquinone','4-methylphenol':'p-cresol','2-methylphenol':'o-cresol','3-methylphenol':'m-cresol','methyl 2-hydroxybenzoate':'methyl salicylate','2-(acetyloxy)benzoic acid':'aspirin','ethylbenzene':'ethylbenzene','propan-2-ylbenzene':'cumene','isopropylbenzene':'cumene','cyclohexa-1,3-diene':'1,3-cyclohexadiene','2-methylpropane':'isobutane','2,2-dimethylpropane':'neopentane','2-methylbutane':'isopentane','hexane-1,6-diamine':'hexamethylenediamine','ethane-1,2-diamine':'ethylenediamine','methanamide':'formamide','3-methylbutyl ethanoate':'isoamyl acetate (banana oil)','2-aminopropanoic acid':'alanine','(S)-2-aminopropanoic acid':'L-alanine','4-hydroxybenzoic acid':'p-hydroxybenzoic acid','benzenecarboxylic acid':'benzoic acid','N-phenylethanamide':'acetanilide','N-methylaniline':'N-methylaniline','1,1,1-trichloroethane':'methyl chloroform','chloroethene':'vinyl chloride','tetrafluoroethene':'tetrafluoroethylene (TFE)','prop-2-enenitrile':'acrylonitrile','propanoic acid':'propionic acid','butanoic acid':'butyric acid','pentanoic acid':'valeric acid','octadecanoic acid':'stearic acid','hexadecanoic acid':'palmitic acid','2-oxopropanoic acid':'pyruvic acid','3-oxobutanoic acid':'acetoacetic acid','2-hydroxypropane-1,2,3-tricarboxylic acid':'citric acid'};
function nmCmpArr(a,b){const n=Math.max(a.length,b.length);for(let i=0;i<n;i++){const x=a[i],y=b[i];if(x===undefined)return -1;if(y===undefined)return 1;if(Array.isArray(x)){const c=nmCmpArr(x,y);if(c)return c;continue}if(typeof x==='string'||typeof y==='string'){const c=String(x)<String(y)?-1:String(x)>String(y)?1:0;if(c)return c;continue}if(x!==y)return x-y}return 0}
const sortNum=a=>a.slice().sort((x,y)=>x-y);
function locJoin(locs){const nums=locs.filter(x=>typeof x==='number').sort((a,b)=>a-b),ns=locs.filter(x=>typeof x!=='number').sort();return ns.concat(nums).join(',')}

function nameMolecule(G,stereo){
  stereo=stereo||{centres:{},dbs:{}};
  const A=G.atoms,adj=G.adj,n=A.length,notes=[];
  /* ---- validation ---- */
  if(!n)throw NameErr('Nothing to name.');
  if(A.some(a=>a.el==='*'))throw NameErr('Replace R, X or other placeholder groups with real atoms to get a name.');
  const bad=A.find(a=>!['C','N','O','F','Cl','Br','I'].includes(a.el));
  if(bad)throw NameErr(bad.el==='H'?'Bondline can only name molecules made of C, H, N, O and halogens.':`Bondline can't name compounds containing ${bad.el} yet.`);
  if(!A.some(a=>a.el==='C'))throw NameErr('Draw an organic compound (one with carbon) to get a name.');
  const nb=i=>adj[i],deg=i=>adj[i].length,bo=(i,j)=>{const e=adj[i].find(x=>x.to===j);return e?e.o:0};
  const isNitroN=i=>A[i].el==='N'&&A[i].charge===1&&nb(i).filter(e=>A[e.to].el==='O').length===2&&nb(i).some(e=>e.o===2&&A[e.to].el==='O')&&nb(i).some(e=>e.o===1&&A[e.to].el==='O'&&A[e.to].charge===-1)&&nb(i).filter(e=>A[e.to].el==='C').length===1&&deg(i)===3;
  const nitroO=new Set();A.forEach((a,i)=>{if(isNitroN(i))nb(i).forEach(e=>{if(A[e.to].el==='O')nitroO.add(e.to)})});
  A.forEach((a,i)=>{
    if(a.charge&&!(isNitroN(i)||nitroO.has(i)))throw NameErr('Bondline can\'t name ions or charged species yet.');
    if(a.el==='O'&&!nitroO.has(i)){if(nb(i).some(e=>A[e.to].el!=='C'))throw NameErr('Bondline can\'t name compounds with O–O or N–O bonds yet.');}
    if(a.el==='N'&&!isNitroN(i)){
      if(nb(i).some(e=>A[e.to].el!=='C'))throw NameErr('Bondline can\'t name compounds with N–N, N–O or N–halogen bonds yet.');
      if(nb(i).some(e=>e.o===2))throw NameErr('Bondline can\'t name imines (C=N) yet.');
      if(nb(i).some(e=>e.o===3)&&deg(i)!==1)throw NameErr('Bondline can\'t name this nitrogen group yet.');
    }
    if(HALO[a.el]&&(deg(i)!==1||nb(i)[0].o!==1))throw NameErr(`${a.el} should have exactly one single bond.`);
    if(a.el==='C'&&nb(i).some(e=>e.o>1&&A[e.to].el==='N')&&!nb(i).some(e=>e.o===3&&A[e.to].el==='N'&&deg(e.to)===1))throw NameErr('Bondline can\'t name imines (C=N) yet.');
  });
  /* ---- rings ---- */
  const tin=new Array(n).fill(-1),low=new Array(n).fill(0);let tm=0;const bridge=new Set();
  const dfsB=(v,pe)=>{tin[v]=low[v]=tm++;for(const e of adj[v]){if(e.bi===pe)continue;if(tin[e.to]>=0)low[v]=Math.min(low[v],tin[e.to]);else{dfsB(e.to,e.bi);low[v]=Math.min(low[v],low[e.to]);if(low[e.to]>tin[v])bridge.add(e.bi)}}};
  for(let i=0;i<n;i++)if(tin[i]<0)dfsB(i,-1);
  const ringAdj=A.map(()=>[]);G.bonds.forEach((b,bi)=>{if(!bridge.has(bi)){ringAdj[b.a].push(b.b);ringAdj[b.b].push(b.a)}});
  const ringOf=new Array(n).fill(-1),rings=[];
  for(let i=0;i<n;i++){
    if(!ringAdj[i].length||ringOf[i]>=0)continue;
    const comp=[],st=[i],seen=new Set([i]);while(st.length){const x=st.pop();comp.push(x);for(const y of ringAdj[x])if(!seen.has(y)){seen.add(y);st.push(y)}}
    if(comp.some(x=>ringAdj[x].length!==2))throw NameErr('Bondline can\'t name fused, bridged or spiro ring systems yet.');
    if(comp.some(x=>A[x].el!=='C'))throw NameErr('Bondline can\'t name rings containing N or O (heterocycles) yet.');
    const cyc=[i];let prev=-1,cur=i;for(;;){const nx=ringAdj[cur].find(y=>y!==prev&&(cyc.length<2||y!==cyc[cyc.length-2]));if(nx===i||nx==null)break;cyc.push(nx);prev=cur;cur=nx;if(cyc.length>comp.length)break}
    const k=rings.length;cyc.forEach(x=>ringOf[x]=k);
    const bondsO=cyc.map((x,t)=>bo(x,cyc[(t+1)%cyc.length]));
    const benz=cyc.length===6&&bondsO.filter(o=>o===2).length===3&&bondsO.every((o,t)=>o!==bondsO[(t+1)%6]);
    if(cyc.length>20)throw NameErr('That ring is too large for Bondline to name.');
    rings.push({atoms:cyc,benz,size:cyc.length,mb:benz?3:bondsO.filter(o=>o>1).length});
  }
  G.bonds.forEach(b=>{const r1=rings[ringOf[b.a]],r2=rings[ringOf[b.b]];if(ringOf[b.a]>=0&&ringOf[b.b]>=0&&ringOf[b.a]!==ringOf[b.b]&&r1.size===r2.size&&r1.benz===r2.benz&&r1.mb===r2.mb)throw NameErr('Bondline can\'t name ring assemblies (two rings joined directly, like biphenyl) yet.')});
  /* ---- functional groups ---- */
  const grp=[],cType=new Array(n).fill(null);
  const oDbl=c=>nb(c).find(e=>e.o===2&&A[e.to].el==='O');
  const acylC=c=>A[c].el==='C'&&!!oDbl(c);
  A.forEach((a,c)=>{
    if(a.el!=='C')return;const od=oDbl(c);
    const tripN=nb(c).find(e=>e.o===3&&A[e.to].el==='N');
    if(tripN){if(ringOf[c]>=0)throw NameErr('Bondline can\'t name this ring.');grp.push({type:'nitrile',X:c,parts:[tripN.to]});cType[c]='nitrile';return}
    if(!od)return;
    const het=nb(c).filter(e=>e.o===1&&A[e.to].el!=='C');
    if(ringOf[c]>=0){if(het.length)throw NameErr('Bondline can\'t name lactones, lactams or other heterocycles yet.');grp.push({type:'ketone',X:c,parts:[od.to]});cType[c]='ketone';return}
    if(het.length>1)throw NameErr('Bondline can\'t name carbonates, carbamates or ureas yet.');
    if(!het.length){const cn=nb(c).filter(e=>A[e.to].el==='C').length;if(cn>=2){grp.push({type:'ketone',X:c,parts:[od.to]});cType[c]='ketone'}else{grp.push({type:'aldehyde',X:c,parts:[od.to]});cType[c]='aldehyde'}return}
    const h=het[0].to,he=A[h].el;
    if(he==='O'){
      const other=nb(h).find(e=>e.to!==c);
      if(!other){grp.push({type:'acid',X:c,parts:[od.to,h]});cType[c]='acid';return}
      if(acylC(other.to))throw NameErr('Bondline can\'t name acid anhydrides yet.');
      grp.push({type:'ester',X:c,parts:[od.to,h],O:h,R:other.to});cType[c]='ester';return}
    if(he==='N'){if(isNitroN(h))throw NameErr('Bondline can\'t name this group yet.');if(nb(h).filter(e=>acylC(e.to)).length>1)throw NameErr('Bondline can\'t name imides yet.');grp.push({type:'amide',X:c,parts:[od.to,h],N:h});cType[c]='amide';return}
    if(HALO[he]){grp.push({type:'halide',X:c,parts:[od.to,h],hal:he});cType[c]='halide';return}
    throw NameErr('Bondline can\'t name this group yet.');
  });
  A.forEach((a,i)=>{
    if(a.el==='O'&&!nitroO.has(i)&&deg(i)===1&&nb(i)[0].o===1&&!acylC(nb(i)[0].to))grp.push({type:'alcohol',C:nb(i)[0].to,parts:[i],O:i});
    if(a.el==='N'&&!isNitroN(i)&&nb(i).every(e=>e.o===1)&&!nb(i).some(e=>acylC(e.to)))grp.push({type:'amine',N:i,parts:[i],Cs:nb(i).map(e=>e.to)});
  });
  const pType=PRIO.find(t=>grp.some(g=>g.type===t))||null;
  const pGroups=grp.filter(g=>g.type===pType);
  /* carbons that may not be part of a parent chain */
  const EX=new Set();
  grp.forEach(g=>{if((CTYPE.has(g.type)&&g.type!=='aldehyde')&&g.type!==pType)EX.add(g.X)});
  if(pType==='ester'){
    const acidCs=new Set(pGroups.map(g=>g.X));
    pGroups.forEach(g=>{const st=[g.R],seen=new Set([g.R,g.O]);while(st.length){const x=st.pop();EX.add(x);if(acidCs.has(x))throw NameErr('Bondline can\'t name this ester yet (it links two acid groups).');for(const e of nb(x))if(!seen.has(e.to)){seen.add(e.to);st.push(e.to)}}});
  }
  const halEls=new Set(pGroups.filter(g=>g.type==='halide').map(g=>g.hal));if(halEls.size>1)throw NameErr('Bondline can\'t name mixed acid halides yet.');
  /* ---- substituent naming ---- */
  const memo=new Map();
  const isSimple=s=>s.simple;
  function subName(q,from,order){
    const key=q+'|'+from+'|'+order;if(memo.has(key))return memo.get(key);
    const r=subName0(q,from,order);r.key=r.simple?r.name.replace(/^(tert|sec)-/,''):r.name.replace(/[^a-z]/gi,'').toLowerCase();memo.set(key,r);return r;
  }
  function subName0(q,from,order){
    const a=A[q];
    if(HALO[a.el])return{name:HALO[a.el],simple:true};
    if(a.el==='O'){
      if(order!==1)throw NameErr('Bondline can\'t name this group yet.');
      const o=nb(q).find(e=>e.to!==from);if(!o)return{name:'hydroxy',simple:true};
      if(acylC(o.to))return{name:acylName(o.to,q).name+'oxy',simple:false};
      return alkoxy(o.to,q);
    }
    if(a.el==='N'){
      if(isNitroN(q))return{name:'nitro',simple:true};
      const others=nb(q).filter(e=>e.to!==from).map(e=>e.to);
      const acyl=others.filter(acylC);
      if(acyl.length){if(others.length>1)throw NameErr('Bondline can\'t name this amide group yet.');const an=acylName(acyl[0],q);if(!an.amido)throw NameErr('Bondline can\'t name this amide group yet.');return{name:an.amido,simple:!!an.simple}}
      if(!others.length)return{name:'amino',simple:true};
      return{name:groupWords(others.map(c=>subName(c,q,1)))+'amino',simple:false};
    }
    // carbon
    if(ringOf[q]>=0)return ringSub(q,from,order,order===2?'ylidene':'yl');
    if(order===1){
      if(cType[q]==='nitrile')return{name:'cyano',simple:true};
      if(oDbl(q)){
        const t=cType[q];
        if(t==='acid')return{name:'carboxy',simple:true};
        if(t==='ester'){const g=grp.find(x=>x.X===q),ak=alkoxy(g.R,g.O);return{name:(ak.simple?ak.name:'('+ak.name+')')+'carbonyl',simple:false}}
        if(t==='halide'){const g=grp.find(x=>x.X===q);return{name:HALO[g.hal]+'carbonyl',simple:false}}
        if(t==='amide'){const g=grp.find(x=>x.X===q),subs=nb(g.N).filter(e=>e.to!==q).map(e=>subName(e.to,g.N,1));return subs.length?{name:groupWords(subs)+'carbamoyl',simple:false}:{name:'carbamoyl',simple:true}}
        if(t==='aldehyde'&&!nb(q).some(e=>e.to!==from&&A[e.to].el==='C'))return{name:'formyl',simple:true};
        return acylName(q,from);
      }
    }
    return chainSub(q,from,order,order===2?'ylidene':'yl');
  }
  function groupWords(subs){
    // e.g. methyl, methyl → dimethyl ; ethyl, methyl → ethyl(methyl)
    const by=new Map();subs.forEach(s=>{if(!by.has(s.name))by.set(s.name,{s,c:0});by.get(s.name).c++});
    const items=[...by.values()].sort((x,y)=>x.s.key<y.s.key?-1:x.s.key>y.s.key?1:0);
    const one=(it)=>{const m=it.c>1?(it.s.simple?MULT[it.c]:MULTC[it.c]):'';return m+(it.s.simple?it.s.name:'('+it.s.name+')')};
    return items.map((it,k)=>k===0?one(it):'('+(it.c>1?(it.s.simple?MULT[it.c]:MULTC[it.c]):'')+it.s.name+')').join('');
  }
  function alkoxy(r,o){
    const s=subName(r,o,1),nm=s.name;
    const map={isopropyl:'isopropoxy','tert-butyl':'tert-butoxy','sec-butyl':'sec-butoxy',isobutyl:'isobutoxy',benzyl:'benzyloxy',phenyl:'phenoxy'};
    if(map[nm])return{name:map[nm],simple:true};
    if(ringOf[r]<0&&/(meth|eth|prop|but)yl$/.test(nm)&&!/-yl$/.test(nm)&&!/en|yn/.test(nm.replace(/(meth|eth|prop|but)yl$/,'')))return{name:nm.replace(/yl$/,'oxy'),simple:s.simple};
    if(/phenyl$/.test(nm))return{name:nm.replace(/phenyl$/,'phenoxy'),simple:s.simple};
    return{name:(s.simple?nm:'('+nm+')')+'oxy',simple:false};
  }
  function acylName(X,from){
    const r=nb(X).filter(e=>e.to!==from&&A[e.to].el==='C');
    if(!r.length)return{name:'formyl',simple:true,amido:'formamido'};
    if(ringOf[r[0].to]>=0){const rs=ringSub(r[0].to,X,1,'carbonyl');return Object.assign(rs,{amido:rs.name==='benzoyl'?'benzamido':null})}
    const cs=chainSub(X,from,1,'oyl');
    return cs;
  }
  /* collect prefixes on a set of skeleton atoms (path or ring), skipping `skip` atoms */
  function prefixesOn(atoms,skipSet,consumed,from){
    const inSet=new Set(atoms),out=[];
    atoms.forEach(p=>{for(const e of nb(p)){const q=e.to;if(inSet.has(q)||q===from||skipSet.has(q)||consumed.has(q))continue;
      if(e.o===2&&A[q].el==='O'){out.push({atom:p,name:'oxo',simple:true,key:'oxo'});continue}
      if(e.o===3)throw NameErr('Bondline can\'t name this structure yet.');
      const s=subName(q,p,e.o);out.push({atom:p,name:s.name,simple:s.simple,key:s.key})}});
    return out;
  }
  function chainSub(q,from,order,kind){
    // longest chain starting at q among acyclic carbons that are not acid-type/nitrile (except q itself for acyl)
    const ok=x=>A[x].el==='C'&&ringOf[x]<0&&(x===q||!(cType[x]&&cType[x]!=='aldehyde'&&cType[x]!=='ketone'));
    const paths=[];const walk=(v,path)=>{paths.push(path);for(const e of nb(v)){if(e.to===from||path.includes(e.to)||!ok(e.to))continue;walk(e.to,path.concat(e.to))}};
    walk(q,[q]);
    let best=null;
    for(const P of paths){try{
      const unsat=[];for(let i=0;i+1<P.length;i++){const o=bo(P[i],P[i+1]);if(o>1)unsat.push({loc:i+1,o})}
      const consumed=new Set();if(kind==='oyl'){const od=oDbl(q);if(od)consumed.add(od.to)}
      const pre=prefixesOn(P,new Set(),consumed,from).map(x=>Object.assign(x,{loc:P.indexOf(x.atom)+1}));
      const alpha=pre.slice().sort((x,y)=>x.key<y.key?-1:x.key>y.key?1:x.loc-y.loc).map(x=>x.loc);
      const k=[-P.length,-unsat.length,-unsat.filter(u=>u.o===2).length,sortNum(unsat.map(u=>u.loc)),sortNum(unsat.filter(u=>u.o===2).map(u=>u.loc)),-pre.length,sortNum(pre.map(x=>x.loc)),alpha,pre.map(x=>x.key).sort()];
      if(!best||nmCmpArr(k,best.k)<0)best={P,unsat,pre,k};
    }catch(e){if(!e.nameErr)throw e}}
    if(!best)throw NameErr('Bondline can\'t name this structure yet.');
    const{P,unsat,pre}=best,len=P.length;if(len>20)throw NameErr('That chain is too long for Bondline to name.');
    const showLoc=len>1;
    const pstr=formatPrefixes(pre.map(x=>({loc:x.loc,name:x.name,simple:x.simple,key:x.key})),showLoc);
    const enes=unsat.filter(u=>u.o===2).map(u=>u.loc),ynes=unsat.filter(u=>u.o===3).map(u=>u.loc);
    if(kind==='oyl'){
      if(len===2&&!unsat.length&&!pre.length)return{name:'acetyl',simple:true,amido:'acetamido'};
      const core=unsat.length?unsatCore(STEMS[len],enes,ynes,true):STEMS[len]+'an';
      return{name:pstr+core+'oyl',simple:!pre.length&&!unsat.length,amido:pre.length?null:core+'amido'};
    }
    const suf=kind==='ylidene'?'ylidene':'yl';
    let name;
    if(!unsat.length)name=pstr+STEMS[len]+suf;
    else if(len===2)name=pstr+STEMS[2]+(enes.length?'en':'yn')+suf;
    else name=pstr+unsatCore(STEMS[len],enes,ynes,true)+'-1-'+suf;
    const map={'1-methylethyl':'isopropyl','1,1-dimethylethyl':'tert-butyl','2-methylpropyl':'isobutyl','1-methylpropyl':'sec-butyl','phenylmethyl':'benzyl'};
    if(map[name])return{name:map[name],simple:true};
    return{name,simple:!pre.length&&(!unsat.length||len===2)};
  }
  function unsatCore(stem,enes,ynes,show){
    const needA=enes.length>1||(!enes.length&&ynes.length>1);let s=stem+(needA?'a':'');
    if(enes.length)s+=(show?'-'+enes.join(',')+'-':'')+MULT[enes.length]+'en';
    if(ynes.length)s+=(show?'-'+ynes.join(',')+'-':'')+MULT[ynes.length]+'yn';
    if(!enes.length&&!ynes.length)s+='an';
    return s;
  }
  function ringNumberings(R,startAtom){
    const cyc=R.atoms,N=cyc.length,out=[];
    const starts=startAtom!=null?[cyc.indexOf(startAtom)]:cyc.map((_,i)=>i);
    for(const s of starts)for(const d of [1,-1]){const o=[];for(let t=0;t<N;t++)o.push(cyc[((s+d*t)%N+N)%N]);out.push(o)}
    return out;
  }
  function ringUnsat(R,order){if(R.benz)return[];const N=order.length,u=[];for(let i=0;i<N;i++){const o=bo(order[i],order[(i+1)%N]);if(o>1)u.push({loc:i+1,o})}return u}
  function ringSub(q,from,order,kind){
    const R=rings[ringOf[q]];let best=null;
    for(const O of ringNumberings(R,q)){
      const unsat=ringUnsat(R,O);
      const pre=prefixesOn(O,new Set(),new Set(),from).map(x=>Object.assign(x,{loc:O.indexOf(x.atom)+1}));
      const alpha=pre.slice().sort((x,y)=>x.key<y.key?-1:x.key>y.key?1:x.loc-y.loc).map(x=>x.loc);
      const k=[sortNum(unsat.map(u=>u.loc)),sortNum(pre.map(x=>x.loc)),alpha];
      if(!best||nmCmpArr(k,best.k)<0)best={O,unsat,pre,k};
    }
    const{unsat,pre}=best;const pstr=formatPrefixes(pre.map(x=>({loc:x.loc,name:x.name,simple:x.simple,key:x.key})),true);
    const enes=unsat.filter(u=>u.o===2).map(u=>u.loc),ynes=unsat.filter(u=>u.o===3).map(u=>u.loc);
    let name;
    if(R.benz){if(kind==='ylidene')throw NameErr('Bondline can\'t name this structure.');name=pstr+(kind==='carbonyl'?'benzoyl':'phenyl')}
    else{
      const stem='cyclo'+STEMS[R.size];
      if(kind==='carbonyl')name=pstr+(unsat.length?unsatCore(stem,enes,ynes,true)+'e-1-carbonyl':stem+'anecarbonyl');
      else if(!unsat.length)name=pstr+stem+(kind==='ylidene'?'ylidene':'yl');
      else name=pstr+unsatCore(stem,enes,ynes,true)+'-1-'+(kind==='ylidene'?'ylidene':'yl');
    }
    return{name,simple:!pre.length&&!unsat.length};
  }
  function formatPrefixes(list,showLoc){
    const by=new Map();list.forEach(x=>{if(!by.has(x.name))by.set(x.name,{name:x.name,simple:x.simple,key:x.key,locs:[]});by.get(x.name).locs.push(x.loc)});
    const items=[...by.values()].sort((x,y)=>x.key<y.key?-1:x.key>y.key?1:x.name<y.name?-1:1);
    let s='';
    items.forEach(it=>{
      const c=it.locs.length,amb=!showLoc&&s&&!/^(fluoro|chloro|bromo|iodo|hydroxy|amino|nitro|oxo|cyano|formyl|carboxy|carbamoyl)$/.test(it.name),mult=c>1?(it.simple?MULT[c]:MULTC[c]):'',nm=it.simple&&!amb?it.name:'('+it.name+')';
      const show=showLoc||it.locs.some(l=>typeof l!=='number');
      const locs=showLoc?it.locs:it.locs.filter(l=>typeof l!=='number');
      const piece=(show&&locs.length?locJoin(locs)+'-':'')+mult+nm;
      s+=(s&&/^[0-9N]/.test(piece)?'-':'')+piece;
    });
    return s;
  }
  /* ---- parent candidates ---- */
  const cands=[];
  rings.forEach((R,k)=>{if(R.atoms.some(x=>EX.has(x)))return;cands.push({ring:true,R,atoms:R.atoms})});
  const chainOK=x=>A[x].el==='C'&&ringOf[x]<0&&!EX.has(x);
  const cc=[];for(let i=0;i<n;i++)if(chainOK(i))cc.push(i);
  const cadj=new Map(cc.map(i=>[i,nb(i).filter(e=>chainOK(e.to)).map(e=>e.to)]));
  for(const u of cc){
    const par=new Map([[u,-1]]),q=[u];while(q.length){const x=q.shift();for(const y of cadj.get(x))if(!par.has(y)){par.set(y,x);q.push(y)}}
    for(const v of cc){if(v<u||!par.has(v))continue;const P=[];let x=v;while(x!==-1){P.push(x);x=par.get(x)}cands.push({ring:false,atoms:P.reverse()})}
  }
  const inCand=(c,set)=>{const S=c.set||(c.set=new Set(c.atoms));return set.filter(x=>S.has(x))};
  function pInCand(c){
    const S=c.set||(c.set=new Set(c.atoms));
    return pGroups.filter(g=>{
      if(CTYPE.has(g.type)){if(!c.ring)return S.has(g.X);return nb(g.X).some(e=>S.has(e.to))}
      if(g.type==='ketone')return S.has(g.X);
      if(g.type==='alcohol')return S.has(g.C);
      if(g.type==='amine')return g.Cs.some(x=>S.has(x));
      return false});
  }
  cands.forEach(c=>{c.pg=pInCand(c);c.pc=c.pg.length;
    if(c.ring){c.size=c.R.size;c.mb=c.R.mb;c.db=c.R.benz?3:0}
    else{let mb=0,db=0;for(let i=0;i+1<c.atoms.length;i++){const o=bo(c.atoms[i],c.atoms[i+1]);if(o>1)mb++;if(o===2)db++}c.size=c.atoms.length;c.mb=mb;c.db=db}
    if(!c.ring&&c.pg.filter(g=>CTYPE.has(g.type)).length>2)c.bad=true;
  });
  let pool=cands.filter(c=>!c.bad);
  if(!pool.length)throw NameErr('Bondline can\'t find a parent chain for this structure.');
  const maxpc=Math.max(...pool.map(c=>c.pc));pool=pool.filter(c=>c.pc===maxpc);
  if(pool.some(c=>c.ring))pool=pool.filter(c=>c.ring);
  const k0=c=>[-c.size,-c.mb,-c.db];
  pool.sort((x,y)=>nmCmpArr(k0(x),k0(y)));pool=pool.filter(c=>nmCmpArr(k0(c),k0(pool[0]))===0);
  /* ---- evaluate numbering for remaining candidates ---- */
  function evalCand(c){
    const S=new Set(c.atoms),consumed=new Set(),words=[],nPre=[];
    c.pg.forEach(g=>{
      g.parts.forEach(x=>consumed.add(x));
      if(c.ring&&CTYPE.has(g.type)){consumed.add(g.X);g.parts.forEach(x=>consumed.add(x))}
      if(g.type==='ester'){const st=[g.R],seen=new Set([g.R,g.O]);while(st.length){const x=st.pop();consumed.add(x);for(const e of nb(x))if(!seen.has(e.to)){seen.add(e.to);st.push(e.to)}}words.push(subName(g.R,g.O,1))}
      if(g.type==='amide'){nb(g.N).forEach(e=>{if(e.to!==g.X)nPre.push({att:g.X,...pick(subName(e.to,g.N,1))})})}
      if(g.type==='amine'){const att=g.Cs.find(x=>S.has(x));nb(g.N).forEach(e=>{if(!S.has(e.to))nPre.push({att,...pick(subName(e.to,g.N,1))})});g.Cs.forEach(x=>{if(!S.has(x))consumed.add(x)})}
    });
    const multiN=c.pg.filter(g=>g.type==='amine'||g.type==='amide').length>1;
    if(multiN&&nPre.length){const at=c.pg.filter(g=>g.type==='amine'||g.type==='amide').map(g=>g.type==='amide'?(c.ring?nb(g.X).find(e=>S.has(e.to)).to:g.X):g.Cs.find(x=>S.has(x)));if(new Set(at).size<at.length)throw NameErr('Bondline can\'t name this compound yet (two substituted N groups on one carbon).')}
    const pre0=prefixesOn(c.atoms,new Set(),consumed,-1);
    const nums=c.ring?ringNumberings(c.R,null):(c.atoms.length>1?[c.atoms,c.atoms.slice().reverse()]:[c.atoms]);
    let best=null;
    for(const O of nums){
      const loc=x=>O.indexOf(x)+1;
      const pl=sortNum(c.pg.map(g=>{if(CTYPE.has(g.type)){if(!c.ring)return loc(g.X);return loc(nb(g.X).find(e=>S.has(e.to)).to)}if(g.type==='ketone')return loc(g.X);if(g.type==='alcohol')return loc(g.C);return loc(g.Cs.find(x=>S.has(x)))}));
      const unsat=c.ring?ringUnsat(c.R,O):(()=>{const u=[];for(let i=0;i+1<O.length;i++){const o=bo(O[i],O[i+1]);if(o>1)u.push({loc:i+1,o})}return u})();
      const pre=pre0.map(x=>Object.assign({},x,{loc:loc(x.atom)}));
      const npre=nPre.map(x=>Object.assign({},x,{loc:multiN?'N'+(c.ring&&x.att!=null&&!S.has(x.att)?loc(nb(x.att).find(e=>S.has(e.to)).to):loc(x.att)):'N'}));
      const alpha=pre.slice().sort((x,y)=>x.key<y.key?-1:x.key>y.key?1:x.loc-y.loc).map(x=>x.loc);
      const sd=stereoDesc(O,c);
      const k=[pl,sortNum(unsat.map(u=>u.loc)),sortNum(unsat.filter(u=>u.o===2).map(u=>u.loc)),-(pre.length+nPre.length),sortNum(pre.map(x=>x.loc)),alpha,sd.order];
      if(!best||nmCmpArr(k,best.k)<0)best={O,pl,unsat,pre,npre,k,sd};
    }
    return Object.assign(best,{words,c});
  }
  function pick(s){return{name:s.name,simple:s.simple,key:s.key}}
  function stereoDesc(O,c){
    const loc=x=>O.indexOf(x)+1,list=[];let outside=0;
    for(const[as,lab]of Object.entries(stereo.centres||{})){const a=+as;if(O.includes(a))list.push({loc:loc(a),lab});else{outside++;list.push({loc:null,lab})}}
    for(const[bs,lab]of Object.entries(stereo.dbs||{})){const b=G.bonds[+bs];if(!b)continue;const i=O.indexOf(b.a),j=O.indexOf(b.b);
      if(i>=0&&j>=0&&(Math.abs(i-j)===1||(c.ring&&Math.abs(i-j)===O.length-1))){const l=Math.abs(i-j)===1?Math.min(i,j)+1:O.length;list.push({loc:l,lab})}else{outside++;list.push({loc:null,lab})}}
    list.sort((x,y)=>(x.loc||99)-(y.loc||99));
    return{list,outside,order:list.map(x=>({Z:0,E:1,R:0,S:1})[x.lab])};
  }
  const evals=[];let lastErr=null;for(const c of pool){try{evals.push(evalCand(c))}catch(e){if(!e.nameErr)throw e;lastErr=e}}
  if(!evals.length)throw lastErr||NameErr('Bondline can\'t name this structure yet.');
  evals.sort((x,y)=>nmCmpArr(x.k,y.k)||nmCmpArr(x.pre.map(p=>p.key).sort(),y.pre.map(p=>p.key).sort()));
  const E=evals[0],c=E.c,N=c.atoms.length;
  /* ---- assemble ---- */
  const pg=c.pg,pk=pg.length;
  const isBz=c.ring&&c.R.benz,ringC=c.ring&&!isBz;
  const numPre=E.pre.length,ene=E.unsat.filter(u=>u.o===2).map(u=>u.loc),yne=E.unsat.filter(u=>u.o===3).map(u=>u.loc);
  const nFeat=pk+E.unsat.length+numPre;
  let showPre=true,showSfx=true,showUns=true;
  if(!c.ring){
    if(N===1){showPre=showSfx=showUns=false}
    else if(N===2&&nFeat===1){showPre=showSfx=showUns=false}
    else{if(nFeat===1&&pType==='ketone'&&N===3&&pk===1)showSfx=false;if(nFeat===1&&E.unsat.length===1&&N<=3)showUns=false}
  }else if(ringC){
    if(nFeat===1){showPre=showSfx=showUns=false}
    if(ene.length===1&&!yne.length&&ene[0]===1&&!pk)showUns=false;
  }else{ // benzene
    if(!pk&&numPre===1)showPre=false;
  }
  if(pType&&CTYPE.has(pType)&&!c.ring)showSfx=false;
  const allPre=E.pre.map(x=>({loc:x.loc,name:x.name,simple:x.simple,key:x.key})).concat(E.npre.map(x=>({loc:x.loc,name:x.name,simple:x.simple,key:x.key})));
  const pstr=formatPrefixes(allPre,showPre);
  let parent;
  const sfxLocs=E.pl;
  if(isBz){
    if(!pk)parent='benzene';
    else if(pk===1&&RETAINED_BZ[pType]){parent=RETAINED_BZ[pType];if(pType==='halide')parent+=' '+HALIDE[pg[0].hal]}
    else{
      if(pType==='ketone')throw NameErr('Bondline can\'t name this structure.');
      const base=CTYPE.has(pType)?SFX_RING[pType]:(pType==='alcohol'?'ol':'amine');
      let sf=MULT[pk]+base;if(pType==='halide')sf+=' '+MULT[pk]+HALIDE[pg[0].hal];
      parent='benzene-'+sfxLocs.join(',')+'-'+sf;
    }
  }else{
    const stem=(ringC?'cyclo':'')+STEMS[N];if(N>20)throw NameErr('That chain is too long for Bondline to name.');
    let core=unsatCore(stem,ene,yne,showUns);
    let sf='';
    if(pType){
      if(c.ring&&CTYPE.has(pType)){sf=(pk>1?MULT[pk]:'')+SFX_RING[pType];if(pType==='halide')sf+=' '+(pk>1?MULT[pk]:'')+HALIDE[pg[0].hal]}
      else if(CTYPE.has(pType)){sf=pType==='halide'?(pk>1?'dioyl '+MULT[pk]+HALIDE[pg[0].hal]:'oyl '+HALIDE[pg[0].hal]):SFX_CHAIN[pType][pk>1?1:0]}
      else sf=MULT[pk]+({ketone:'one',alcohol:'ol',amine:'amine'})[pType];
      if(pType==='ester'&&c.ring)sf=(pk>1?MULT[pk]:'')+'carboxylate';
    }
    if(!sf)parent=core+'e';
    else{
      const vowel=/^[aeiouy]/.test(sf);
      const locPart=(showSfx&&(c.ring||!CTYPE.has(pType)))?'-'+sfxLocs.join(',')+'-':'';
      parent=core+(vowel?'':'e')+locPart+sf;
      if(locPart&&vowel)parent=core+locPart+sf;
    }
  }
  let name=pstr+parent;
  const sd=E.sd;let sp='';
  if(sd.list.length===1)sp='('+sd.list[0].lab+')-';
  else if(sd.list.length>1){if(sd.outside)notes.push('Some stereocentres are outside the main chain, so R/S and E/Z labels are left out of this name.');else sp='('+sd.list.map(x=>x.loc+x.lab).join(',')+')-'}
  if(pType==='ester'){
    const S=new Set(c.atoms),locOf=g=>{const at=c.ring?nb(g.X).find(e=>S.has(e.to)).to:g.X;return E.O.indexOf(at)+1};
    const ws=pg.map(g=>({w:subName(g.R,g.O,1),loc:locOf(g)}));
    const names=new Set(ws.map(x=>x.w.name));
    let words;
    if(names.size===1){const w=ws[0].w,k=ws.length;words=k>1?(w.simple?MULT[k]+w.name:MULTC[k]+'('+w.name+')'):w.name}
    else words=ws.sort((x,y)=>x.w.key<y.w.key?-1:x.w.key>y.w.key?1:x.loc-y.loc).map(x=>x.loc+'-'+(x.w.simple?x.w.name:'('+x.w.name+')')).join(' ');
    // a single stereocentre in the alkyl (alcohol) part belongs in front of that word
    const rAtoms=new Set();pg.forEach(g=>{const st=[g.R],seen=new Set([g.R,g.O]);while(st.length){const x=st.pop();rAtoms.add(x);for(const e of nb(x))if(!seen.has(e.to)){seen.add(e.to);st.push(e.to)}}});
    const inR=Object.keys(stereo.centres||{}).filter(a=>rAtoms.has(+a)).length+Object.keys(stereo.dbs||{}).filter(b=>{const bb=G.bonds[+b];return bb&&rAtoms.has(bb.a)}).length;
    if(sd.list.length===1&&inR===1)name=sp+words+' '+name;
    else if(inR>0&&sd.list.length>1){notes.push('Some stereocentres are in the ester\'s alkyl group, so R/S and E/Z labels are left out of this name.');name=words+' '+name}
    else name=words+' '+sp+name;
  }else name=sp+name;
  const plain=name.replace(/^\([^)]*\)-/,'');
  const common=COMMON_NAMES[name]||COMMON_NAMES[plain]||null;
  return{name,common:common&&common!==name?common:null,notes};
}
/* name each separate molecule in a drawing */
function analyseDrawing(d){
  const out=[];
  for(const comp of molComponents(d)){
    const m=buildMol(d,comp.ids),F=molFormula(m),issues=molChecks(m).concat(extraChecks(m,d));
    const cip=cipFromDrawing(m);
    const G=foldH(m),st={centres:{},dbs:{}};
    cip.centres.forEach(c=>{if(c.label&&G.map.has(c.atom))st.centres[G.map.get(c.atom)]=c.label});
    cip.dbs.forEach(x=>{if(!x.label)return;const b=m.bonds[x.bond],ga=G.map.get(b.a),gb=G.map.get(b.b);const bi=G.bonds.findIndex(q=>(q.a===ga&&q.b===gb)||(q.a===gb&&q.b===ga));if(bi>=0)st.dbs[bi]=x.label});
    let nm=null,err=null;
    if(!issues.some(i=>i.kind==='valence')){try{nm=nameMolecule(G,st)}catch(e){err=e.nameErr?e.message:'Bondline couldn\'t name this structure.';if(!e.nameErr)console.warn(e)}}
    else err='Fix the bonding problem to get a name.';
    const undef=cip.centres.filter(c=>!c.label).length+cip.dbs.filter(x=>!x.label).length;
    const labelled=new Set(cip.centres.filter(c=>c.label).map(c=>c.atom));
    const wedgedUnlabelled=m.bonds.some(b=>b.stereo&&!labelled.has(b.a)&&m.atoms[b.a].el!=='H');
    if(nm&&wedgedUnlabelled)nm.notes.push('Bondline can\'t include ring cis/trans (or this kind of stereocentre) in names yet, so the name doesn\'t say which isomer this is.');
    let smiles=null;try{smiles=toSmiles(G,st)}catch(e){}
    out.push({comp,m,formula:F,issues,cip,name:nm,nameErr:err,undefStereo:undef,smiles});
  }
  return out;
}

/* ---------- IUPAC name → structure ---------- */
const NP_STEMS=STEMS.slice(1).map((s,i)=>[s,i+1]).concat([['eicos',20]]).sort((a,b)=>b[0].length-a[0].length);
const NP_MULT={di:2,tri:3,tetra:4,penta:5,hexa:6,bis:2,tris:3,tetrakis:4};
const NP_COMMON={
  'acetic acid':'CC(=O)O','formic acid':'OC=O','acetone':'CC(C)=O','acetaldehyde':'CC=O','formaldehyde':'C=O','toluene':'Cc1ccccc1','styrene':'C=Cc1ccccc1',
  'benzyl alcohol':'OCc1ccccc1','acetophenone':'CC(=O)c1ccccc1','diethyl ether':'CCOCC','ether':'CCOCC','dimethyl ether':'COC','acetonitrile':'CC#N','chloroform':'ClC(Cl)Cl',
  'dcm':'ClCCl','methylene chloride':'ClCCl','carbon tetrachloride':'ClC(Cl)(Cl)Cl','isopropanol':'CC(C)O','isopropyl alcohol':'CC(C)O','ipa':'CC(C)O','tert-butanol':'CC(C)(C)O','t-butanol':'CC(C)(C)O','tert-butyl alcohol':'CC(C)(C)O',
  'ethylene glycol':'OCCO','glycerol':'OCC(O)CO','glycerine':'OCC(O)CO','ethyl acetate':'CCOC(C)=O','methyl acetate':'COC(C)=O','acetamide':'CC(N)=O','acetyl chloride':'CC(Cl)=O',
  'phthalic acid':'OC(=O)c1ccccc1C(=O)O','terephthalic acid':'OC(=O)c1ccc(C(=O)O)cc1','lactic acid':'CC(O)C(=O)O','ethylene':'C=C','acetylene':'C#C','propylene':'CC=C',
  'salicylic acid':'OC(=O)c1ccccc1O','o-xylene':'Cc1ccccc1C','m-xylene':'Cc1cccc(C)c1','p-xylene':'Cc1ccc(C)cc1','succinic acid':'OC(=O)CCC(=O)O','oxalic acid':'OC(=O)C(=O)O',
  'malonic acid':'OC(=O)CC(=O)O','adipic acid':'OC(=O)CCCCC(=O)O','glycine':'NCC(=O)O','anisole':'COc1ccccc1','trimethylamine':'CN(C)C','diethylamine':'CCNCC','triethylamine':'CCN(CC)CC',
  'butadiene':'C=CC=C','isoprene':'C=CC(C)=C','acrolein':'C=CC=O','acrylic acid':'C=CC(=O)O','methacrylic acid':'C=C(C)C(=O)O','dmf':'CN(C)C=O','dimethylformamide':'CN(C)C=O',
  'mek':'CCC(C)=O','methyl ethyl ketone':'CCC(C)=O','ethyl methyl ketone':'CCC(C)=O','methyl isobutyl ketone':'CC(=O)CC(C)C','propylene glycol':'CC(O)CO','catechol':'Oc1ccccc1O','resorcinol':'Oc1cccc(O)c1','hydroquinone':'Oc1ccc(O)cc1',
  'p-cresol':'Cc1ccc(O)cc1','o-cresol':'Cc1ccccc1O','m-cresol':'Cc1cccc(O)c1','methyl salicylate':'COC(=O)c1ccccc1O','aspirin':'CC(=O)Oc1ccccc1C(=O)O','acetylsalicylic acid':'CC(=O)Oc1ccccc1C(=O)O',
  'cumene':'CC(C)c1ccccc1','isobutane':'CC(C)C','neopentane':'CC(C)(C)C','isopentane':'CCC(C)C','acetanilide':'CC(=O)Nc1ccccc1','vinyl chloride':'C=CCl','acrylonitrile':'C=CC#N',
  'propionic acid':'CCC(=O)O','butyric acid':'CCCC(=O)O','valeric acid':'CCCCC(=O)O','stearic acid':'CCCCCCCCCCCCCCCCCC(=O)O','palmitic acid':'CCCCCCCCCCCCCCCC(=O)O','pyruvic acid':'CC(=O)C(=O)O','citric acid':'OC(=O)CC(O)(CC(=O)O)C(=O)O',
  'benzene':'c1ccccc1','phenol':'Oc1ccccc1','aniline':'Nc1ccccc1','benzoic acid':'OC(=O)c1ccccc1','benzaldehyde':'O=Cc1ccccc1','nitrobenzene':'O=[N+]([O-])c1ccccc1','benzonitrile':'N#Cc1ccccc1','benzamide':'NC(=O)c1ccccc1',
  'pyridine':'c1ccncc1','pyrrole':'c1cc[nH]c1','furan':'c1ccoc1','thiophene':'c1ccsc1','imidazole':'c1c[nH]cn1','indole':'c1ccc2[nH]ccc2c1','naphthalene':'c1ccc2ccccc2c1','anthracene':'c1ccc2cc3ccccc3cc2c1',
  'quinoline':'c1ccc2ncccc2c1','thf':'C1CCOC1','tetrahydrofuran':'C1CCOC1','dioxane':'C1COCCO1','1,4-dioxane':'C1COCCO1','dmso':'CS(C)=O','dimethyl sulfoxide':'CS(C)=O','dmap':'CN(C)c1ccncc1','4-dimethylaminopyridine':'CN(C)c1ccncc1',
  'paracetamol':'CC(=O)Nc1ccc(O)cc1','acetaminophen':'CC(=O)Nc1ccc(O)cc1','ibuprofen':'CC(C)Cc1ccc(C(C)C(=O)O)cc1','caffeine':'Cn1c(=O)c2c(ncn2C)n(C)c1=O','urea':'NC(N)=O','water':'O','ammonia':'N','methane':'C',
  'l-alanine':'C[C@H](N)C(=O)O','alanine':'C[C@H](N)C(=O)O','d-alanine':'C[C@@H](N)C(=O)O','l-serine':'N[C@@H](CO)C(=O)O','serine':'N[C@@H](CO)C(=O)O','l-valine':'CC(C)[C@H](N)C(=O)O','valine':'CC(C)[C@H](N)C(=O)O',
  'l-leucine':'CC(C)C[C@H](N)C(=O)O','leucine':'CC(C)C[C@H](N)C(=O)O','l-phenylalanine':'N[C@@H](Cc1ccccc1)C(=O)O','phenylalanine':'N[C@@H](Cc1ccccc1)C(=O)O','l-cysteine':'N[C@@H](CS)C(=O)O','cysteine':'N[C@@H](CS)C(=O)O',
  'l-aspartic acid':'N[C@@H](CC(=O)O)C(=O)O','aspartic acid':'N[C@@H](CC(=O)O)C(=O)O','l-glutamic acid':'N[C@@H](CCC(=O)O)C(=O)O','glutamic acid':'N[C@@H](CCC(=O)O)C(=O)O','l-lysine':'NCCCC[C@H](N)C(=O)O','lysine':'NCCCC[C@H](N)C(=O)O',
  'l-proline':'OC(=O)[C@@H]1CCCN1','proline':'OC(=O)[C@@H]1CCCN1','l-tyrosine':'N[C@@H](Cc1ccc(O)cc1)C(=O)O','tyrosine':'N[C@@H](Cc1ccc(O)cc1)C(=O)O','glucose':'OC[C@H]1OC(O)[C@H](O)[C@@H](O)[C@@H]1O',
  'ethanol':'CCO','methanol':'CO','acetic anhydride':'CC(=O)OC(C)=O','benzoyl chloride':'O=C(Cl)c1ccccc1','mcpba':'OOC(=O)c1cccc(Cl)c1','nbs':'O=C1CCC(=O)N1Br','lda':'[Li+].CC(C)[N-]C(C)C','n-butyllithium':'CCCC[Li]','nbuli':'CCCC[Li]','n-buli':'CCCC[Li]',
  'sodium borohydride':'[Na+].[BH4-]','nabh4':'[Na+].[BH4-]','lithium aluminium hydride':'[Li+].[AlH4-]','lithium aluminum hydride':'[Li+].[AlH4-]','lialh4':'[Li+].[AlH4-]','methylmagnesium bromide':'C[Mg]Br','phenylmagnesium bromide':'Br[Mg]c1ccccc1','sodium hydride':'[Na+].[H-]',
  'n,n-dimethylacetamide':'CC(=O)N(C)C','dma':'CC(=O)N(C)C','benzophenone':'O=C(c1ccccc1)c1ccccc1','benzylamine':'NCc1ccccc1','butyraldehyde':'CCCC=O','butyronitrile':'CCCC#N','propionaldehyde':'CCC=O','valeraldehyde':'CCCCC=O',
  'ethanolamine':'NCCO','ethylamine':'CCN','methylamine':'CN','dimethylamine':'CNC','propylamine':'CCCN','isopropylamine':'CC(C)N','isobutyric acid':'CC(C)C(=O)O','isooctane':'CC(C)CC(C)(C)C','isovaleraldehyde':'CC(C)CC=O','isobutylene':'C=C(C)C',
  'meta-xylene':'Cc1cccc(C)c1','ortho-xylene':'Cc1ccccc1C','para-xylene':'Cc1ccc(C)cc1','methylacetylene':'CC#C','phenylamine':'Nc1ccccc1','allyl alcohol':'C=CCO','propargyl alcohol':'C#CCO','vinyl acetate':'C=COC(C)=O','ethylene oxide':'C1CO1',
  'cis-but-2-ene':'C/C=C\\C','cis-2-butene':'C/C=C\\C','trans-but-2-ene':'C/C=C/C','trans-2-butene':'C/C=C/C'
};
function npNorm(s){return String(s||'').normalize('NFKC').toLowerCase().replace(/[‐-―−]/g,'-').replace(/[‘’′]/g,"'").replace(/\s*-\s*/g,'-').replace(/\s*,\s*/g,',').replace(/\(\s+/g,'(').replace(/\s+\)/g,')').replace(/\s+/g,' ').replace(/^\s|\s$|\.$/g,'').trim()}
/* molecule under construction */
function NPMol(){this.atoms=[];this.bonds=[]}
NPMol.prototype.add=function(el,charge){this.atoms.push({el,charge:charge||0});return this.atoms.length-1};
NPMol.prototype.bond=function(a,b,o){this.bonds.push({a,b,o:o||1})};
NPMol.prototype.frag=function(smi){const m=parseSmiles(smi),base=this.atoms.length;m.atoms.forEach(a=>this.add(a.el,a.charge));m.bonds.forEach(b=>this.bond(base+b.a,base+b.b,b.order));return base};
function npFail(msg){const e=new Error(msg||'');e.np=true;return e}
/* ---- simple substituent lexicon: SMILES with the attachment atom first ---- */
const NP_LEX=(()=>{
  const L={fluoro:'F',chloro:'Cl',bromo:'Br',iodo:'I',hydroxy:'O',amino:'N',nitro:'[N+](=O)[O-]',cyano:'C#N',
    isopropyl:'C(C)C','tert-butyl':'C(C)(C)C','t-butyl':'C(C)(C)C','sec-butyl':'C(C)CC',isobutyl:'CC(C)C',isopentyl:'CCC(C)C',neopentyl:'CC(C)(C)C',
    phenyl:'c1ccccc1',benzyl:'Cc1ccccc1',vinyl:'C=C',ethenyl:'C=C',ethynyl:'C#C',allyl:'CC=C',
    methoxy:'OC',ethoxy:'OCC',propoxy:'OCCC',butoxy:'OCCCC',isopropoxy:'OC(C)C','propan-2-yl':'C(C)C','butan-2-yl':'C(C)CC','2-methylpropan-2-yl':'C(C)(C)C','2-methylpropyl':'CC(C)C','1-methylethyl':'C(C)C','1,1-dimethylethyl':'C(C)(C)C','tert-butoxy':'OC(C)(C)C',isobutoxy:'OCC(C)C','sec-butoxy':'OC(C)CC',phenoxy:'Oc1ccccc1',benzyloxy:'OCc1ccccc1',
    formyl:'C=O',acetyl:'C(C)=O',benzoyl:'C(=O)c1ccccc1',carboxy:'C(=O)O',carbamoyl:'C(N)=O',methoxycarbonyl:'C(=O)OC',ethoxycarbonyl:'C(=O)OCC',
    acetyloxy:'OC(C)=O',acetoxy:'OC(C)=O',benzoyloxy:'OC(=O)c1ccccc1',acetamido:'NC(C)=O',benzamido:'NC(=O)c1ccccc1',formamido:'NC=O',
    methylamino:'NC',dimethylamino:'N(C)C',ethylamino:'NCC',diethylamino:'N(CC)CC',chlorocarbonyl:'C(Cl)=O',trifluoromethyl:'C(F)(F)F',mercapto:'S',sulfanyl:'S',methylsulfanyl:'SC'};
  const out={};for(const[k,v]of Object.entries(L))out[k]={smi:v,o:1};
  out.oxo={smi:'O',o:2};out.methylidene={smi:'C',o:2};out.methylene={smi:'C',o:2};out.ethylidene={smi:'CC',o:2};
  STEMS.slice(1).forEach((s,i)=>{out[s+'yl']={smi:'C'.repeat(i+1),o:1};out[s+'ylidene']={smi:'C'.repeat(i+1),o:2};if(i>0&&i<12){out[s+'anoyl']={smi:'C(=O)'+'C'.repeat(i),o:1};out[s+'anamido']={smi:'NC(=O)'+'C'.repeat(i),o:1}}});
  for(let n=3;n<=12;n++)out['cyclo'+STEMS[n]+'yl']={smi:'C1'+'C'.repeat(n-1)+'1',o:1};
  return out;
})();
const NP_LEX_KEYS=Object.keys(NP_LEX).sort((a,b)=>b.length-a.length);
/* ---- skeleton parsing: parent hydride + unsaturation + suffix ---- */
const NP_SFX=['oic acid','oyl chloride','oyl bromide','oyl iodide','oyl fluoride','oyl dichloride','oyl dibromide','carboxylic acid','carboxylate','carbonyl chloride','carbonyl bromide','carbonyl iodide','carbonyl fluoride','carbonyl dichloride','carbonyl dibromide','carboxamide','carbonitrile','carbaldehyde','oate','amide','nitrile','amine','one','al','ol'];
function npParseSkeleton(p){
  // returns {cyclo,n,ene:[...],yne:[...],sfx,sfxN,sfxLocs,noUnsatLoc}
  let m=p.match(/^(cyclo)?/),i=m[0].length;const cyclo=!!m[1];
  const st=NP_STEMS.find(([s])=>p.startsWith(s,i));if(!st)return null;const n=st[1];i+=st[0].length;
  if(p[i]==='a'&&p.slice(i,i+2)!=='an')i++;
  const rest=p.slice(i);
  const re=/^(?:(an)|(?:-([\d,]+)-)?(di|tri|tetra)?en(?:(?:-([\d,]+)-)?(di|tri|tetra)?(yn))?|(?:-([\d,]+)-)?(di|tri|tetra)?(yn))(e)?(?:-([\d,]+)-)?(di|tri|tetra)?(.*)$/;
  const r=rest.match(re);if(!r)return null;
  let ene=[],yne=[];
  const cnt=w=>w?NP_MULT[w]:1,locs=s=>s?s.split(',').map(Number):null;
  if(!r[1]){
    if(r[9]){yne=locs(r[7])||null;if(yne&&yne.length!==cnt(r[8]))return null;if(!yne)yne=Array(cnt(r[8])).fill(null)}
    else{ene=locs(r[2])||null;if(ene&&ene.length!==cnt(r[3]))return null;if(!ene)ene=Array(cnt(r[3])).fill(null);
      if(r[6]){yne=locs(r[4])||null;if(yne&&yne.length!==cnt(r[5]))return null;if(!yne)yne=Array(cnt(r[5])).fill(null)}else if(r[4]||r[5])return null}
  }
  let sfx=r[13]||'';if(sfx&&!NP_SFX.includes(sfx))return null;
  const sfxN=cnt(r[12]);const sfxLocs=locs(r[11]);if(sfxLocs&&sfxLocs.length!==sfxN)return null;
  if(!sfx&&(r[11]||r[12]))return null;
  if(!sfx&&!r[10])return null; // hydrides end in -e
  if(sfx&&/^[aeiouy]/.test(sfx)&&r[10]&&!r[12])return null;
  return{cyclo,n,ene,yne,sfx,sfxN,sfxLocs};
}
const NP_BZ={'benzenecarbaldehyde':'carbaldehyde','benzenecarbonitrile':'carbonitrile','benzenecarboxylic acid':'carboxylic acid','benzene':null,'phenol':'ol','aniline':'amine','benzenamine':'amine','benzenol':'ol','benzoic acid':'carboxylic acid','benzaldehyde':'carbaldehyde','benzonitrile':'carbonitrile','benzamide':'carboxamide','benzoate':'carboxylate','benzoyl chloride':'carbonyl chloride','benzoyl bromide':'carbonyl bromide','toluene':'TOL'};
const NP_ALIAS={'acetic acid':'ethanoic acid','acetate':'ethanoate','acetamide':'ethanamide','acetaldehyde':'ethanal','acetonitrile':'ethanenitrile','acetyl chloride':'ethanoyl chloride','formic acid':'methanoic acid','formate':'methanoate','formamide':'methanamide','propionic acid':'propanoic acid','propionate':'propanoate','butyric acid':'butanoic acid','butyrate':'butanoate','acetone':'propanone','ethylene':'ethene','acetylene':'ethyne','propylene':'propene'};
function npParseParent(p){
  if(NP_ALIAS[p])p=NP_ALIAS[p];
  p=p.replace(/carboxaldehyde$/,'carbaldehyde');
  if(p in NP_BZ){const s=NP_BZ[p];return{benz:true,n:6,sfx:s==='TOL'?null:s,sfxN:s&&s!=='TOL'?1:0,sfxLocs:s&&s!=='TOL'?[1]:null,tol:s==='TOL',ene:[],yne:[]}}
  const bm=p.match(/^benzene-([\d,]+)-(di|tri|tetra)?(.*)$/);
  if(bm){const locs=bm[1].split(',').map(Number),k=bm[2]?NP_MULT[bm[2]]:1;if(locs.length!==k||!NP_SFX.includes(bm[3]))return null;return{benz:true,n:6,sfx:bm[3],sfxN:k,sfxLocs:locs,ene:[],yne:[]}}
  const s=npParseSkeleton(p);if(!s)return null;
  if(!s.cyclo&&(['carboxylic acid','carboxylate','carboxamide','carbonitrile','carbaldehyde'].includes(s.sfx)||(s.sfx||'').startsWith('carbonyl')))return null;
  if(s.cyclo&&s.n<3)return null;
  if(s.cyclo&&(['oic acid','oate','amide','nitrile','al'].includes(s.sfx)||(s.sfx||'').startsWith('oyl')))return null;
  return s;
}
/* build the parent; returns locant map and principal N atoms */
function npBuildParent(M,P,esterO){
  const loc=[null],n=P.n,ring=P.benz||P.cyclo;
  for(let i=1;i<=n;i++)loc.push(M.add('C'));
  for(let i=1;i<n;i++)M.bond(loc[i],loc[i+1],1);if(ring)M.bond(loc[n],loc[1],1);
  const setO=(a,b,o)=>{const bd=M.bonds.find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a));if(!bd)throw npFail();bd.o=o};
  if(P.benz){setO(loc[1],loc[2],2);setO(loc[3],loc[4],2);setO(loc[5],loc[6],2)}
  const place=(arr,o)=>arr.forEach((l,k)=>{let L=l;if(L==null)L=arr.length===1?1:k*2+1;if(L<1||L>n||(!ring&&L>=n))throw npFail('locant');setO(loc[L],L===n?loc[1]:loc[L+1],o)});
  place(P.ene||[],2);place(P.yne||[],3);
  const N={},Ns=[];const sf=P.sfx;let carbonType=false;
  if(sf){
    const k=P.sfxN;let locs=P.sfxLocs;
    const chainC=['oic acid','oate','amide','nitrile','al'].includes(sf)||sf.startsWith('oyl');
    if(chainC&&!ring){carbonType=true;locs=k===1?[1]:k===2?[1,n]:null;if(!locs||(k===2&&n<2))throw npFail()}
    if(!locs)locs=k===1?[sf==='one'&&!ring?(n>=3?2:1):1]:null;
    if(!locs)throw npFail('Add locants to say where the groups are.');
    locs.forEach(L=>{
      if(L<1||L>n)throw npFail('locant');let X=loc[L];
      const ringC=ring&&(['carboxylic acid','carboxylate','carboxamide','carbonitrile','carbaldehyde'].includes(sf)||sf.startsWith('carbonyl'));
      if(ringC){const c=M.add('C');M.bond(X,c,1);X=c}
      const halo=sf.match(/(chloride|bromide|iodide|fluoride)$/);
      if(['oic acid','carboxylic acid'].includes(sf)){M.bond(X,M.add('O'),2);M.bond(X,M.add('O'),1)}
      else if(['oate','carboxylate'].includes(sf)){M.bond(X,M.add('O'),2);const o=M.add('O');M.bond(X,o,1);esterO.push({o,loc:L})}
      else if(halo){M.bond(X,M.add('O'),2);M.bond(X,M.add({chloride:'Cl',bromide:'Br',iodide:'I',fluoride:'F'}[halo[1]]),1)}
      else if(['amide','carboxamide'].includes(sf)){M.bond(X,M.add('O'),2);const nn=M.add('N');M.bond(X,nn,1);Ns.push({n:nn,loc:L})}
      else if(['nitrile','carbonitrile'].includes(sf)){M.bond(X,M.add('N'),3)}
      else if(['al','carbaldehyde'].includes(sf)){M.bond(X,M.add('O'),2)}
      else if(sf==='one'){M.bond(X,M.add('O'),2)}
      else if(sf==='ol'){M.bond(X,M.add('O'),1)}
      else if(sf==='amine'){const nn=M.add('N');M.bond(X,nn,1);Ns.push({n:nn,loc:L})}
    });
  }
  if(P.tol)M.bond(loc[1],M.add('C'),1);
  return{loc,Ns,n,ring,carbonType};
}
/* ---- prefixes ---- */
function npParsePrefixes(h){
  // returns {items:[{locs,count,sub}],dangling} or null
  const res=[];let dangling=null;
  const go=(i)=>{
    if(i>=h.length)return true;
    if(h[i]==='-')i++;
    if(i>=h.length)return true;
    let locs=null;const lm=h.slice(i).match(/^((?:n\d*'*|\d+'*)(?:,(?:n\d*'*|\d+'*))*)-/);
    if(lm){locs=lm[1].split(',');i+=lm[0].length;if(i>=h.length){dangling=locs;return true}}
    const opts=[];
    const tryAt=(j,mult)=>{
      if(h[j]==='('){let d=0,k=j;for(;k<h.length;k++){if(h[k]==='(')d++;else if(h[k]===')'){d--;if(!d)break}}if(d)return;opts.push({end:k+1,inner:h.slice(j+1,k),mult})}
      else for(const key of NP_LEX_KEYS)if(h.startsWith(key,j))opts.push({end:j+key.length,lex:key,mult});
    };
    tryAt(i,null);
    for(const[w,c]of Object.entries(NP_MULT))if(h.startsWith(w,i))tryAt(i+w.length,w);
    for(const op of opts){
      const count=op.mult?NP_MULT[op.mult]:1;
      if(locs&&locs.length!==count)continue;
      let sub;if(op.lex)sub={lex:op.lex};else{sub={inner:op.inner};if(!npParseSub(op.inner))continue}
      res.push({locs,count,sub});
      if(go(op.end))return true;
      res.pop();
    }
    return false;
  };
  if(!go(0))return null;
  return{items:res,dangling};
}
/* a substituent: returns a builder (M) -> {att, o, loc} */
const npSubCache=new Map();
function npParseSub(s){
  if(npSubCache.has(s))return npSubCache.get(s);
  let r=null;
  if(NP_LEX[s]){const L=NP_LEX[s];r={build:M=>({att:M.frag(L.smi),o:L.o})}}
  else{
    for(let i=0;i<s.length&&!r;i++){
      const tail=s.slice(i),core=npSubParent(tail);if(!core)continue;
      const pre=npParsePrefixes(s.slice(0,i));if(!pre||pre.dangling)continue;
      r={build:M=>{const c=core(M);npApplyPrefixes(M,pre.items,c.loc,c.N?[{n:c.N,loc:null}]:[],c.defLoc||1);return c}};
    }
  }
  npSubCache.set(s,r);return r;
}
function npSubParent(t){
  // simple parents for substituents; each returns (M) => {att,o,loc:[null,a1,a2..],N?}
  if(t==='phenyl'||t==='phenoxy'||t==='benzoyl'){return M=>{const P=npBuildParent(M,{benz:true,n:6,ene:[],yne:[]},[]);let att=P.loc[1];if(t==='phenoxy'){const o=M.add('O');M.bond(o,att,1);att=o}if(t==='benzoyl'){const c=M.add('C');M.bond(c,att,1);M.bond(c,M.add('O'),2);att=c}return{att,o:1,loc:P.loc}}}
  if(t==='amino')return M=>{const n=M.add('N');return{att:n,o:1,loc:[null],N:n,defLoc:'n'}};
  if(t==='carbamoyl')return M=>{const c=M.add('C'),n=M.add('N');M.bond(c,M.add('O'),2);M.bond(c,n,1);return{att:c,o:1,loc:[null],N:n,defLoc:'n'}};
  if(t==='carbonyl')return M=>{const c=M.add('C');M.bond(c,M.add('O'),2);return{att:c,o:1,loc:[null,c],defLoc:1}};
  if(t==='oxy')return M=>{const o=M.add('O');return{att:o,o:1,loc:[null,o],defLoc:1}};
  let m;
  // propan-2-yl style
  if((m=t.match(/^(.+?)an-(\d+)-yl(idene)?$/))){const st=NP_STEMS.find(([x])=>x===m[1]);if(!st)return null;const k=+m[2];if(k<1||k>st[1])return null;return M=>{const P=npBuildParent(M,{n:st[1],ene:[],yne:[]},[]);return{att:P.loc[k],o:m[3]?2:1,loc:P.loc}}}
  // alkoxy: methoxy..butoxy with prefixes, (…yl)oxy
  if((m=t.match(/^(meth|eth|prop|but)oxy$/))){const n=STEMS.indexOf(m[1]);return M=>{const P=npBuildParent(M,{n,ene:[],yne:[]},[]);const o=M.add('O');M.bond(o,P.loc[1],1);return{att:o,o:1,loc:P.loc}}}
  if((m=t.match(/^(.+yl)oxy$/))&&!t.endsWith('oyloxy')){const inner=npSubParent(m[1]);if(!inner)return null;return M=>{const c=inner(M);const o=M.add('O');M.bond(o,c.att,1);return{att:o,o:1,loc:c.loc}}}
  if((m=t.match(/^(.+oyl)oxy$/))){const inner=npSubParent(m[1]);if(!inner)return null;return M=>{const c=inner(M);const o=M.add('O');M.bond(o,c.att,1);return{att:o,o:1,loc:c.loc}}}
  if((m=t.match(/^(.+)amido$/))){const inner=npSubParent(m[1]+'oyl')||(m[1]==='acet'?npSubParent('acetyl'):null);if(!inner)return null;return M=>{const c=inner(M);const nn=M.add('N');M.bond(nn,c.att,1);return{att:nn,o:1,loc:c.loc}}}
  if(t==='acetyl')return M=>{const P=npBuildParent(M,{n:2,ene:[],yne:[]},[]);M.bond(P.loc[1],M.add('O'),2);return{att:P.loc[1],o:1,loc:P.loc}};
  // cyclo…carbonyl
  if((m=t.match(/^(cyclo.+?)(?:-1-)?carbonyl$/))){const sk=npParseSkeleton(m[1].replace(/e$/,'e'));if(!sk||!sk.cyclo||sk.sfx)return null;return M=>{const P=npBuildParent(M,sk,[]);const c=M.add('C');M.bond(c,P.loc[1],1);M.bond(c,M.add('O'),2);return{att:c,o:1,loc:P.loc}}}
  // acyl: propanoyl, but-2-enoyl
  if((m=t.match(/^(.+?)oyl$/))){const sk=npParseSkeleton(m[1]+'e');if(!sk||sk.cyclo||sk.sfx)return null;return M=>{const P=npBuildParent(M,sk,[]);M.bond(P.loc[1],M.add('O'),2);return{att:P.loc[1],o:1,loc:P.loc}}}
  // alkyl / alkenyl / ylidene (attachment at C1)
  if((m=t.match(/^(.+?)(?:-1-)?(yl|ylidene)$/))){
    let base=m[1];const o=m[2]==='ylidene'?2:1;
    let sk=npParseSkeleton(base+'e');if(!sk){sk=npParseSkeleton(base+'ane');}
    if(!sk||sk.sfx)return null;
    return M=>{const P=npBuildParent(M,sk,[]);return{att:P.loc[1],o,loc:P.loc}};
  }
  return null;
}
function npApplyPrefixes(M,items,loc,Ns,defLoc){
  for(const it of items){
    const targets=[];
    for(let k=0;k<it.count;k++){
      let L=it.locs?it.locs[k]:null;
      if(L==null){L=defLoc;}
      if(typeof L==='string'&&L[0]==='n'){const sub=L.slice(1).replace(/'/g,'');const g=sub?Ns.find(x=>String(x.loc)===sub):Ns[0];if(!g)throw npFail('No N atom for an N-locant.');targets.push(g.n);continue}
      const ln=typeof L==='string'?+L.replace(/'/g,''):L;if(loc[ln]==null)throw npFail('A locant points past the end of the chain.');targets.push(loc[ln]);
    }
    for(const t of targets){
      const sb=it.sub.lex?{build:M2=>({att:M2.frag(NP_LEX[it.sub.lex].smi),o:NP_LEX[it.sub.lex].o})}:npParseSub(it.sub.inner);
      if(!sb)throw npFail();const r=sb.build(M);M.bond(t,r.att,r.o);
    }
  }
}
/* ---- whole name ---- */
function npStereo(s){
  const m=s.match(/^\(([0-9a-z,'±]+)\)-?(.*)$/);
  if(m&&/^((\d+'*)?[rsez]|±|rs)(,((\d+'*)?[rsez]))*$/.test(m[1]))return{desc:m[1]==='±'||m[1]==='rs'?[]:m[1].split(',').map(x=>({loc:x.slice(0,-1)?+x.slice(0,-1).replace(/'/g,''):null,lab:x.slice(-1).toUpperCase()})),rest:m[2]};
  let c=s.match(/^(cis|trans|[ezrs])-(.*)$/);if(c)return{desc:[{loc:null,lab:c[1].length===1?c[1].toUpperCase():c[1]}],rest:c[2]};
  return{desc:[],rest:s};
}
function npParseWord(M,w,esterO){
  // prefixes + parent
  for(let i=0;i<=w.length;i++){
    const P=npParsePrefixes(w.slice(0,i));if(!P)continue;
    const par=npParseParent(w.slice(i));if(!par)continue;
    // old style "2-butanol": dangling locant applies to suffix, else to the multiple bond
    if(P.dangling){const L=P.dangling.map(Number);if(L.some(isNaN))continue;
      if(par.sfx&&!['oic acid','oate','amide','nitrile','al'].includes(par.sfx)&&!par.sfx.startsWith('oyl')&&!par.sfxLocs&&L.length===par.sfxN)par.sfxLocs=L;
      else if((par.ene||[]).length===L.length&&par.ene.every(x=>x==null))par.ene=L;
      else if((par.yne||[]).length===L.length&&par.yne.every(x=>x==null))par.yne=L;
      else continue}
    const snap={a:M.atoms.length,b:M.bonds.length,e:esterO.length};
    try{
      const B=npBuildParent(M,par,esterO);
      const def=B.carbonType&&B.n>=2?2:1;
      npApplyPrefixes(M,P.items,B.loc,B.Ns,def);
      return B;
    }catch(e){if(!e.np)throw e;M.atoms.length=snap.a;M.bonds.length=snap.b;esterO.length=snap.e;continue}
  }
  return null;
}
function nameToSmiles(input){
  let s=npNorm(input);if(!s)throw npFail('Type a name first.');
  {const st0=npStereo(s);if(st0.desc.length&&NP_COMMON[st0.rest]&&!NP_COMMON[s])return npApplyStereoSmiles(NP_COMMON[st0.rest],st0.desc)}
  if(NP_COMMON[s])return{smiles:NP_COMMON[s],via:'common'};
  {const om=s.match(/^(o|ortho|m|meta|p|para)-(.+)$/);if(om){const k={o:2,ortho:2,m:3,meta:3,p:4,para:4}[om[1]];let r=om[2];const di=r.match(/^(di|bis)(.+)$/);r=di?'1,'+k+'-di'+di[2]:k+'-'+r;try{return nameToSmiles(r)}catch(e){if(!e.np)throw e}}}
  {const w2=s.split(' ');const lastW=w2[w2.length-1];
   if(w2.length===2&&['chloride','bromide','iodide','fluoride','cyanide'].includes(lastW)&&npParseSub(w2[0])&&!/(oyl|carbonyl)$/.test(w2[0])){const M=new NPMol(),r=npParseSub(w2[0]).build(M);if(lastW==='cyanide')M.bond(r.att,M.frag('C#N'),1);else M.bond(r.att,M.add({chloride:'Cl',bromide:'Br',iodide:'I',fluoride:'F'}[lastW]),1);return npFinish(M,null,[])}
   if(w2.length>=2&&lastW==='ketone'){const subs=[];w2.slice(0,-1).forEach(a=>{const m=a.match(/^(di)?(.+)$/);const sb=npParseSub(m[2]);if(!sb)throw npFail();subs.push(sb);if(m[1])subs.push(sb)});if(subs.length!==2)throw npFail();const M=new NPMol(),c=M.add('C');M.bond(c,M.add('O'),2);subs.forEach(sb=>{const r=sb.build(M);M.bond(c,r.att,1)});return npFinish(M,null,[])}
   if(w2.length===1&&/amine$/.test(s)){const head=s.slice(0,-5);const P=head&&npParsePrefixes(head);if(P&&!P.dangling&&P.items.length&&P.items.every(it=>!it.locs)){try{const M0=new NPMol();const B0=npParseWord(M0,s,[]);if(B0)return npFinish(M0,B0,[])}catch(e){if(!e.np)throw e}
     const M=new NPMol(),nn=M.add('N');npApplyPrefixes(M,P.items,[null],[{n:nn,loc:null}],'n');return npFinish(M,null,[])}}}
  for(const[sys,com]of Object.entries(COMMON_NAMES))if(npNorm(com)===s&&npNorm(sys)!==s&&!NP_COMMON[s])return nameToSmiles(sys);
  const ST=npStereo(s);s=ST.rest;let desc=ST.desc;
  const M=new NPMol();const esterO=[];let B=null;
  let words=s.split(' ');
  // "X acid", "X chloride", "X ether", "X alcohol", esters
  let last=words[words.length-1];
  if(words.length>=2&&['acid','chloride','bromide','iodide','fluoride','dichloride'].includes(last)&&/(oic|carboxylic|oyl|carbonyl|dioyl|benzoic|benzoyl|acetic|formic|propionic|butyric|acetyl)$/.test(words[words.length-2])){words=words.slice(0,-2).concat(words.slice(-2).join(' '))}
  if(words.length>=2&&last==='ether'){
    const alk=words.slice(0,-1);const subs=[];alk.forEach(a=>{const m=a.match(/^(di)?(.+)$/);const sb=npParseSub(m[2]);if(!sb)throw npFail();subs.push(sb);if(m[1])subs.push(sb)});
    if(subs.length!==2)throw npFail('Name the two groups on the oxygen, e.g. ethyl methyl ether.');
    const o=M.add('O');subs.forEach(sb=>{const r=sb.build(M);M.bond(o,r.att,1)});
  }else if(words.length===2&&last==='alcohol'){const sb=npParseSub(words[0]);if(!sb)throw npFail();const r=sb.build(M);M.bond(r.att,M.add('O'),1)}
  else if(words.length>=2){
    let acidWord=words[words.length-1];const aw=npStereo(acidWord);if(aw.desc.length){desc=desc.concat(aw.desc);acidWord=aw.rest}
    B=npParseWord(M,acidWord,esterO);if(!B||!esterO.length)throw npFail();
    // alkyl words, possibly with locants ("1-ethyl 4-methyl") or a multiplier ("diethyl")
    const alks=[];for(let w of words.slice(0,-1)){
      const ws=npStereo(w);if(ws.desc.length){desc=desc.concat(ws.desc);w=ws.rest}
      let m=w.match(/^(\d+)-(.+)$/),L=null;if(m&&!npParseSub(w)){L=+m[1];w=m[2]}
      let mult=1;const mm=w.match(/^(di|tri|tetra|bis|tris)\(?(.+?)\)?$/);
      if(mm&&!npParseSub(w)){mult=NP_MULT[mm[1]];w=mm[2]}
      for(let k=0;k<mult;k++)alks.push({L,w});
    }
    if(alks.length!==esterO.length)throw npFail('The number of alkyl groups doesn\'t match the number of ester groups.');
    alks.forEach((a,k)=>{const sb=npParseSub(a.w.replace(/^\((.*)\)$/,'$1'));if(!sb)throw npFail();const tgt=a.L!=null?esterO.find(x=>x.loc===a.L&&!x.used):esterO.find(x=>!x.used);if(!tgt)throw npFail();tgt.used=true;const r=sb.build(M);M.bond(tgt.o,r.att,1)});
  }else{
    B=npParseWord(M,s,esterO);if(!B)throw npFail();
    if(esterO.length)throw npFail('Add the alkyl group for the ester, e.g. "methyl ethanoate".');
  }
  return npFinish(M,B,desc);
}
function npGraph(M){
  const G={atoms:M.atoms.map(a=>({el:a.el,charge:a.charge,h:0})),bonds:M.bonds.map(b=>({a:b.a,b:b.b,o:b.o})),adj:null};
  G.adj=G.atoms.map(()=>[]);G.bonds.forEach((b,bi)=>{G.adj[b.a].push({to:b.b,o:b.o,bi});G.adj[b.b].push({to:b.a,o:b.o,bi})});
  G.atoms.forEach((a,i)=>{const bs=G.adj[i].reduce((t,e)=>t+e.o,0);const mx=maxValence(a.el,a.charge);if(mx!=null&&bs>mx)throw npFail('That name gives an atom too many bonds. Check the locants.');a.h=h3(a.el,a.charge,bs)});
  return G;
}
function npFinish(M,B,desc){
  const G=npGraph(M);const st={centres:{},dbs:{}};
  if(desc&&desc.length){
    const cand=stereoCandidates(G);
    for(const d of desc){
      if(d.lab==='R'||d.lab==='S'){
        let c;if(d.loc!=null){const at=B&&B.loc[d.loc];c=cand.centres.find(x=>x.atom===at)}else c=cand.centres.length===1?cand.centres[0]:null;
        if(!c)throw npFail(`There's no stereocentre${d.loc!=null?' at C'+d.loc:''} to label ${d.lab}.`);st.centres[c.atom]=d.lab;
      }else{
        let x;if(d.loc!=null){const a1=B&&B.loc[d.loc],a2=B&&B.loc[d.loc+1];x=cand.dbs.find(q=>(q.a===a1&&q.b===a2)||(q.a===a2&&q.b===a1))}else x=cand.dbs.length===1?cand.dbs[0]:null;
        if(!x)throw npFail(`There's no double bond${d.loc!=null?' at C'+d.loc:''} that can be ${d.lab}.`);
        let lab=d.lab;
        if(lab==='cis'||lab==='trans'){
          const inP=new Set(B?B.loc.filter(v=>v!=null):[]);
          const ra=G.adj[x.a].map(e=>e.to).find(t=>t!==x.b&&inP.has(t)),rb=G.adj[x.b].map(e=>e.to).find(t=>t!==x.a&&inP.has(t));
          if(ra==null||rb==null)throw npFail('cis/trans needs the double bond inside the main chain.');
          const same=lab==='cis',flip=(x.ra[0]!==ra)!==(x.rb[0]!==rb);lab=(same!==flip)?'Z':'E';
        }
        st.dbs[x.bond]=lab;
      }
    }
  }
  return{smiles:toSmiles(G,st),via:'name'};
}
function npApplyStereoSmiles(smi,desc){
  const M=new NPMol();M.frag(smi);return npFinish(M,null,desc.map(d=>Object.assign({},d,{loc:null})));
}
function nameToScheme(name){const r=nameToSmiles(name);return Object.assign(r,{scheme:smilesToScheme(r.smiles)})}

/* ---------- 3D viewer ---------- */
const CPK={H:'#f2f2f2',C:'#4b5058',N:'#3d66e3',O:'#e2412f',F:'#86d65a',Cl:'#2fbf55',Br:'#a43a2a',I:'#8e44ad',S:'#f0c02c',P:'#f08a24',B:'#f2a0a0',Mg:'#2e9e5b',Li:'#b06fe8',Na:'#9b5de5',K:'#8e44ad',Si:'#d4b483',Al:'#a6a6b8','*':'#8d99ae'};
const RBALL={H:.2,C:.31,N:.3,O:.29,F:.27,Cl:.37,Br:.41,I:.45,S:.37,P:.37,B:.29,Mg:.42,Li:.38,Na:.42,Si:.37,'*':.34};
const RVDW={H:1.1,C:1.7,N:1.55,O:1.52,F:1.47,Cl:1.75,Br:1.85,I:1.98,S:1.8,P:1.8,B:1.92,Mg:1.73,Li:1.82,Na:2.27,Si:2.1,'*':1.7};
const V3={open:false,showH:true,showLP:true,style:'bs',speed:1,k:0,mode:'rest',time:0,playing:false,zoom:1};
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,smooth=(a,b,t)=>{const x=Math.max(0,Math.min(1,(t-a)/(b-a)));return x*x*(3-2*x)};
async function open3D(scheme,title){
  if(!scheme||!scheme.atoms.length)return toast('Draw a structure first, then view it in 3D.');
  try{await loadLib('THREE')}catch(e){return toast('Couldn\'t load the 3D viewer. Check your connection and try again.')}
  let model;try{model=build3D(JSON.parse(JSON.stringify(scheme)))}catch(e){console.error(e);return toast('Couldn\'t build a 3D model of this drawing.')}
  if(!model)return toast('Draw a structure first, then view it in 3D.');
  try{ensureViewer()}catch(e){console.error(e);return toast('3D needs WebGL, which isn\'t available in this browser.')}
  V3.model=model;V3.title=title||'3D view';$('#v3dTitle').textContent=V3.title;
  $('#v3d').hidden=false;V3.open=true;V3.prevFocus=document.activeElement;document.body.style.overflow='hidden';
  readTheme3D();V3.k=0;V3.mode='rest';V3.time=0;V3.playing=false;V3.zoom=1;resetRot();
  V3.multi=model.stages.length>1;V3.hasCurls=model.stages.some(s=>s.curls.length);
  $('#v3dBar').hidden=!V3.multi&&!V3.hasCurls;$('#v3dNext').hidden=$('#v3dPrev').hidden=!V3.multi;
  renderSteps3D();setFrame(staticFrame(0));V3.center=V3.target.slice();V3.dist=V3.fitDist;
  $('#v3dHelp').hidden=false;resize3D();$('#v3dClose').focus();updatePlayBtn();
  V3.last=0;requestAnimationFrame(loop3D);
}
function close3D(){if(!V3.open)return;V3.open=false;$('#v3d').hidden=true;document.body.style.overflow='';clearFrame();if(V3.prevFocus&&V3.prevFocus.focus)V3.prevFocus.focus()}
function ensureViewer(){
  if(V3.renderer)return;
  const el=document.createElement('div');el.className='v3d';el.id='v3d';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','3D view');
  el.innerHTML=`<div class="v3d-top"><div class="v3d-titles"><span class="v3d-kicker">3D view</span><b id="v3dTitle"></b></div>
  <div class="v3d-tools"><label class="v3d-check"><input type="checkbox" id="v3dH" checked> Hydrogens</label><label class="v3d-check"><input type="checkbox" id="v3dLP" checked> Lone pairs</label>
  <select id="v3dStyle" aria-label="Model style"><option value="bs">Ball and stick</option><option value="stick">Sticks</option><option value="sf">Space-filling</option></select>
  <button class="btn small" id="v3dReset">Reset view</button></div><button class="btn small" id="v3dClose">Close</button></div>
  <div class="v3d-stage" id="v3dStage"><canvas id="v3dCanvas"></canvas><div class="v3d-caption" id="v3dCaption"></div><div class="v3d-help" id="v3dHelp">Drag to rotate · Scroll or pinch to zoom · Double-click to reset</div></div>
  <div class="v3d-bar" id="v3dBar"><div class="v3d-ctrls"><button class="v3d-btn" id="v3dPrev" aria-label="Previous step"><svg viewBox="0 0 20 20"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg></button><button class="v3d-btn play" id="v3dPlay"><svg viewBox="0 0 20 20"><path d="M6.5 4.5v11l9-5.5z" fill="currentColor"/></svg><span>Play</span></button><button class="v3d-btn" id="v3dNext" aria-label="Next step"><svg viewBox="0 0 20 20"><path d="M7.5 4.5L13 10l-5.5 5.5"/></svg></button></div>
  <div class="v3d-steps" id="v3dSteps"></div><label class="v3d-speed">Speed <select id="v3dSpeed"><option value="0.5">0.5×</option><option value="1" selected>1×</option><option value="1.6">1.5×</option></select></label></div>`;
  document.body.appendChild(el);
  const canvas=$('#v3dCanvas'),renderer=new THREE.WebGLRenderer({canvas,antialias:true});
  renderer.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,1,.1,500);
  scene.add(new THREE.HemisphereLight(0xffffff,0x3a4250,.8));const dl=new THREE.DirectionalLight(0xffffff,.75);dl.position.set(3,4,6);camera.add(dl);scene.add(camera);
  const pivot=new THREE.Group(),world=new THREE.Group();pivot.add(world);scene.add(pivot);
  Object.assign(V3,{Y:new THREE.Vector3(0,1,0),renderer,scene,camera,pivot,world,sph:new THREE.SphereGeometry(1,28,20),cyl:new THREE.CylinderGeometry(1,1,1,14,1),dotG:new THREE.SphereGeometry(1,12,10)});
  $('#v3dClose').onclick=close3D;$('#v3dReset').onclick=()=>{resetRot();V3.zoom=1};
  $('#v3dH').onchange=e=>{V3.showH=e.target.checked};$('#v3dLP').onchange=e=>{V3.showLP=e.target.checked};
  $('#v3dStyle').onchange=e=>{V3.style=e.target.value;const df=V3.frame&&V3.frame.def;if(df)setFrame(df.kind==='static'?staticFrame(df.k):transFrame(df.k))};
  $('#v3dSpeed').onchange=e=>{V3.speed=+e.target.value};
  $('#v3dPlay').onclick=togglePlay3D;$('#v3dNext').onclick=()=>next3D();$('#v3dPrev').onclick=()=>jump3D(V3.k-1);
  $('#v3dSteps').addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(b)jump3D(+b.dataset.step)});
  const ptrs=new Map();let pinch=null;
  canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});$('#v3dHelp').hidden=true;if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:V3.zoom}}});
  canvas.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;
    if(ptrs.size===2&&pinch){p.x=e.clientX;p.y=e.clientY;const[a,b]=[...ptrs.values()];V3.zoom=Math.max(.35,Math.min(4,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d));return}
    const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;const ang=Math.hypot(dx,dy)*.008;if(!ang)return;
    const q=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(dy,dx,0).normalize(),ang);V3.pivot.quaternion.premultiply(q)});
  const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null};canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
  canvas.addEventListener('wheel',e=>{e.preventDefault();V3.zoom=Math.max(.35,Math.min(4,V3.zoom*Math.exp(-e.deltaY*.0012)));$('#v3dHelp').hidden=true},{passive:false});
  canvas.addEventListener('dblclick',()=>{resetRot();V3.zoom=1});
  if(window.ResizeObserver)new ResizeObserver(resize3D).observe($('#v3dStage'));else window.addEventListener('resize',resize3D);
}
function resetRot(){if(V3.pivot){V3.pivot.quaternion.setFromEuler(new THREE.Euler(-.32,.42,0))}}
function resize3D(){if(!V3.renderer)return;const st=$('#v3dStage'),w=st.clientWidth||1,h=st.clientHeight||1;V3.renderer.setSize(w,h,false);V3.camera.aspect=w/h;V3.camera.updateProjectionMatrix();if(V3.frame)fitFrame(V3.frame)}
function readTheme3D(){
  const cs=getComputedStyle($('#v3dStage')),bg=new THREE.Color(cs.backgroundColor||'#ffffff');V3.renderer.setClearColor(bg,1);
  const lum=.2126*bg.r+.7152*bg.g+.0722*bg.b;V3.dark=lum<.4;V3.ink=getComputedStyle(document.body).color;V3.curlCol=getComputedStyle(document.documentElement).getPropertyValue('--curl').trim()||'#c4313a';
}
function stageCaption(k){const s=V3.model.stages[k];return(s.texts||[]).filter(t=>t.trim()&&!/^\+\s*$/.test(t)).join(' · ')}
function arrowCaption(k){const s=V3.model.stages[k];return(s.arrowIn||[]).map(a=>[a.above,a.below].filter(Boolean).join(', ')||(a.kind==='res'?'resonance':a.kind==='eq'?'equilibrium':'')).filter(Boolean).join(' · ')}
function renderSteps3D(){
  const st=V3.model.stages;let h='';
  st.forEach((s,k)=>{if(k){const c=arrowCaption(k);h+=`<span class="v3d-arrow" aria-hidden="true"><svg viewBox="0 0 24 12"><path d="M1 6h19M15 2l5 4-5 4"/></svg>${c?`<i>${segsHTML(c)}</i>`:''}</span>`}
    const cap=stageCaption(k);h+=`<button class="v3d-pill${k===V3.k?' on':''}" data-step="${k}"><b>${k+1}</b>${cap?`<span>${segsHTML(cap)}</span>`:''}</button>`});
  $('#v3dSteps').innerHTML=h;
  const on=$('#v3dSteps .v3d-pill.on');if(on)on.scrollIntoView({block:'nearest',inline:'nearest'});
  setCaption3D();
}
function segsHTML(t){return chemSegs(t).map(g=>g.k==='sub'?`<sub>${esc(g.t)}</sub>`:g.k==='sup'?`<sup>${esc(g.t)}</sup>`:esc(g.t)).join('')}
function setCaption3D(){
  const n=V3.model.stages.length;let t='';
  if(V3.mode==='trans'){const c=arrowCaption(V3.k+1);t=`<b>Step ${V3.k+1} → ${V3.k+2}</b>${c?` · ${segsHTML(c)}`:''}`}
  else{const c=stageCaption(V3.k);t=n>1?`<b>Step ${V3.k+1} of ${n}</b>${c?` · ${segsHTML(c)}`:''}`:(c?segsHTML(c):'')}
  const el=$('#v3dCaption');el.innerHTML=t;el.hidden=!t;
}
function updatePlayBtn(){const b=$('#v3dPlay');b.querySelector('span').textContent=V3.playing?'Pause':(V3.multi&&V3.k===V3.model.stages.length-1?'Replay':'Play');
  b.querySelector('svg').innerHTML=V3.playing?'<path d="M6 4.5h3v11H6zM11 4.5h3v11h-3z" fill="currentColor"/>':'<path d="M6.5 4.5v11l9-5.5z" fill="currentColor"/>'}
function togglePlay3D(){
  if(V3.playing){V3.playing=false;updatePlayBtn();return}
  if(V3.multi&&V3.k===V3.model.stages.length-1&&V3.mode==='rest')jump3D(0);
  V3.playing=true;if(V3.mode==='rest')V3.time=V3.multi?1:0;updatePlayBtn();
}
function next3D(){if(V3.mode==='trans'||V3.k>=V3.model.stages.length-1)return;startTrans3D()}
function jump3D(k){k=Math.max(0,Math.min(V3.model.stages.length-1,k));V3.k=k;V3.mode='rest';V3.time=0;setFrame(staticFrame(k));renderSteps3D();updatePlayBtn()}
function startTrans3D(){V3.mode='trans';V3.time=0;setFrame(transFrame(V3.k));setCaption3D()}
function loop3D(now){
  if(!V3.open)return;requestAnimationFrame(loop3D);
  const dt=V3.last?Math.min(.05,(now-V3.last)/1000):0;V3.last=now;V3.time+=dt*V3.speed;
  const F=V3.frame,last=V3.model.stages.length-1;let t=0,dots=-1,curlA=1;
  if(V3.mode==='trans'){
    const A=1.3,B=1.9;
    if(V3.time<A){dots=V3.time/A}else{t=ease(Math.min(1,(V3.time-A)/B));curlA=1-smooth(0,.25,t)}
    if(V3.time>=A+B){V3.k++;V3.mode='rest';V3.time=0;setFrame(staticFrame(V3.k));renderSteps3D();if(V3.k===last){V3.playing=false}updatePlayBtn();return}
  }else{
    curlA=V3.k>0?smooth(0,.4,V3.time):1;
    if(V3.playing){
      if(V3.multi){if(V3.time>1.3&&V3.k<last)startTrans3D()}
      else{const per=1.8;dots=(V3.time%per)/1.3;if(dots>1)dots=-1}
    }
  }
  updateFrame(F,t,dots,curlA);
  V3.center=v3.lerp(V3.center,v3.lerp(F.c0,F.c1,t),Math.min(1,dt*5));V3.dist+=(F.fitDist-V3.dist)*Math.min(1,dt*4);
  V3.world.position.set(-V3.center[0],-V3.center[1],-V3.center[2]);V3.camera.position.set(0,0,V3.dist/V3.zoom);V3.camera.lookAt(0,0,0);
  V3.renderer.render(V3.scene,V3.camera);
}
/* frames: entities with start (p0) and end (p1) states */
function staticFrame(k){
  const S=V3.model.stages[k],ents=[],eIdx=new Map();
  S.atoms.forEach((a,i)=>{if(a.lp)return;eIdx.set(i,ents.length);ents.push({el:a.el,pseudo:a.pseudo,h:a.h,c0:a.charge,c1:a.charge,p0:a.p,p1:a.p})});
  const bonds=S.bonds.filter(b=>!b.lpb).map(b=>({i:eIdx.get(b.i),j:eIdx.get(b.j),o0:b.o,o1:b.o}));
  const lps=S.bonds.filter(b=>b.lpb).map(b=>({par:eIdx.get(b.i),d0:v3.norm(v3.sub(S.atoms[b.j].p,S.atoms[b.i].p)),d1:null,keep:true}));
  return{def:{k,kind:'static'},ents,bonds,lps,curls:S.curls};
}
function transFrame(k){
  const S=V3.model.stages[k],T=V3.model.stages[k+1],mp=T.map,ents=[],sE=new Map(),tE=new Map();
  S.atoms.forEach((a,i)=>{if(a.lp)return;const t=mp.s2t.get(i),b=t!=null?T.atoms[t]:null;sE.set(i,ents.length);if(t!=null)tE.set(t,ents.length);
    ents.push({el:a.el,pseudo:a.pseudo,h:a.h,c0:a.charge,c1:b?b.charge:0,p0:a.p,p1:b?b.p:null,el1:b?b.el:null})});
  T.atoms.forEach((a,i)=>{if(a.lp||tE.has(i))return;tE.set(i,ents.length);ents.push({el:a.el,pseudo:a.pseudo,h:a.h,c0:0,c1:a.charge,p0:null,p1:a.p})});
  const bonds=[],seen=new Map(),key=(i,j)=>i<j?i+'-'+j:j+'-'+i;
  S.bonds.forEach(b=>{if(b.lpb)return;const e={i:sE.get(b.i),j:sE.get(b.j),o0:b.o,o1:0};seen.set(key(e.i,e.j),e);bonds.push(e)});
  T.bonds.forEach(b=>{if(b.lpb)return;const i=tE.get(b.i),j=tE.get(b.j),kk=key(i,j);if(seen.has(kk))seen.get(kk).o1=b.o;else{const e={i,j,o0:0,o1:b.o};seen.set(kk,e);bonds.push(e)}});
  const lps=[];
  S.bonds.forEach(b=>{if(b.lpb)lps.push({par:sE.get(b.i),d0:v3.norm(v3.sub(S.atoms[b.j].p,S.atoms[b.i].p)),d1:null})});
  T.bonds.forEach(b=>{if(b.lpb)lps.push({par:tE.get(b.i),d0:null,d1:v3.norm(v3.sub(T.atoms[b.j].p,T.atoms[b.i].p))})});
  return{def:{k,kind:'trans'},ents,bonds,lps,curls:S.curls};
}
function clearFrame(){if(!V3.frame)return;const g=V3.frame.group;V3.world.remove(g);g.traverse(o=>{if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}if(o.geometry&&![V3.sph,V3.cyl,V3.dotG].includes(o.geometry))o.geometry.dispose()});V3.frame=null}
function mat(col,op){return new THREE.MeshStandardMaterial({color:new THREE.Color(col),roughness:.42,metalness:.04,transparent:true,opacity:op==null?1:op})}
function atomCol(el){if(el==='C'&&V3.dark)return'#9aa2ac';return CPK[el]||'#c06ad6'}
function labelSprite(text,opts){
  const o=Object.assign({ring:false,col:V3.ink,size:.42,bg:null},opts||{}),cv=document.createElement('canvas'),S=128;cv.width=cv.height=S;const g=cv.getContext('2d');
  if(o.bg){g.fillStyle=o.bg;g.beginPath();g.arc(S/2,S/2,S/2-6,0,7);g.fill()}
  if(o.ring){g.strokeStyle=o.col;g.lineWidth=9;g.beginPath();g.arc(S/2,S/2,S/2-10,0,7);g.stroke()}
  g.fillStyle=o.col;g.font=`700 ${o.ring?78:62}px Arial, Helvetica, sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(text,S/2,S/2+(o.ring?4:3));
  const tx=new THREE.CanvasTexture(cv),sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,depthTest:false,transparent:true}));sp.scale.set(o.size,o.size,1);sp.renderOrder=20;return sp;
}
const chargeText=c=>c?(Math.abs(c)>1?Math.abs(c):'')+(c>0?'+':'−'):'';
function setFrame(fr){
  clearFrame();const g=new THREE.Group();V3.world.add(g);fr.group=g;V3.frame=fr;const sty=V3.style;
  fr.ents.forEach(e=>{
    const r=sty==='sf'?(RVDW[e.el]||1.7)*.95:sty==='stick'?(e.h?.09:.13):(RBALL[e.el]||.34);
    const m=new THREE.Mesh(V3.sph,mat(atomCol(e.el)));m.scale.setScalar(r);g.add(m);e.mesh=m;e.r=r;
    if(e.el1&&e.el1!==e.el){const m2=new THREE.Mesh(V3.sph,mat(atomCol(e.el1),0));m2.scale.setScalar(r);g.add(m2);e.mesh2=m2}
    e.spr=[];[[e.c0,0],[e.c1,1]].forEach(([c,w])=>{if(!c)return;if(w===1&&e.c0===e.c1)return;const sp=labelSprite(chargeText(c),{ring:true,size:.44});sp.center.set(-.25,-.25);g.add(sp);e.spr.push({sp,w,same:e.c0===e.c1})});
    if(e.pseudo){const sp=labelSprite(e.pseudo,{col:'#ffffff',size:.5});g.add(sp);e.lab=sp}
  });
  const bcol=V3.dark?'#7c8591':'#aeb5bd';
  fr.bonds.forEach(b=>{const n=Math.max(b.o0,b.o1,1);b.st=[];for(let k=0;k<n;k++){const m=new THREE.Mesh(V3.cyl,mat(bcol));g.add(m);b.st.push(m)}
    const ref=x=>fr.bonds.find(q=>q!==b&&(q.i===x||q.j===x)&&!fr.ents[q.i===x?q.j:q.i].h);
    const r1=ref(b.i),r2=ref(b.j);b.refI=r1?(r1.i===b.i?r1.j:r1.i):null;b.refJ=r2?(r2.i===b.j?r2.j:r2.i):null});
  fr.lps.forEach(l=>{const grp=new THREE.Group(),lobe=new THREE.Mesh(V3.sph,mat('#7aa2ff',.5));lobe.scale.set(.17,.3,.17);lobe.position.y=.42;grp.add(lobe);
    [-1,1].forEach(s=>{const d=new THREE.Mesh(V3.dotG,mat(V3.dark?'#e6ecff':'#24304a'));d.scale.setScalar(.045);d.position.set(s*.075,.47,0);grp.add(d)});g.add(grp);l.grp=grp;l.mats=grp.children.map(c=>c.material)});
  const cc=new THREE.Color(V3.curlCol);
  fr.curlObjs=(fr.curls||[]).map(c=>{
    const P=x=>new THREE.Vector3(x[0],x[1],x[2]),curve=new THREE.QuadraticBezierCurve3(P(c.p0),P(c.p1),P(c.p2)),tan=curve.getTangent(1).normalize(),hl=.28;
    const end=P(c.p2).sub(tan.clone().multiplyScalar(hl*.8)),body=new THREE.QuadraticBezierCurve3(P(c.p0),P(c.p1),end);
    const m=new THREE.MeshStandardMaterial({color:cc,emissive:cc,emissiveIntensity:.25,roughness:.5,transparent:true});
    const tube=new THREE.Mesh(new THREE.TubeGeometry(body,48,.045,8,false),m);
    const cone=new THREE.Mesh(new THREE.ConeGeometry(.13,hl,16,1,false,0,c.half?Math.PI:Math.PI*2),m);cone.position.copy(P(c.p2).sub(tan.clone().multiplyScalar(hl/2)));cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),tan);
    const grp=new THREE.Group();grp.add(tube);grp.add(cone);g.add(grp);
    const dots=[];for(let k=0;k<(c.half?1:2);k++){const d=new THREE.Mesh(V3.dotG,new THREE.MeshBasicMaterial({color:'#ffcf4d',transparent:true}));d.scale.setScalar(.085);d.visible=false;g.add(d);dots.push(d)}
    return{curve,m,dots};
  });
  fitFrame(fr);
}
function fitFrame(fr){
  const pts=[];fr.ents.forEach(e=>{if(e.p0)pts.push(e.p0);if(e.p1)pts.push(e.p1)});
  const cen=ps=>{const v=ps.filter(Boolean);return v.length?v.reduce((s,p)=>v3.add(s,p),[0,0,0]).map(x=>x/v.length):[0,0,0]};
  fr.c0=cen(fr.ents.map(e=>e.p0||e.p1));fr.c1=cen(fr.ents.map(e=>e.p1||e.p0));
  const c=v3.lerp(fr.c0,fr.c1,.5);let r=1.5;pts.forEach(p=>{r=Math.max(r,v3.len(v3.sub(p,c))+1.1)});r+=v3.len(v3.sub(fr.c0,fr.c1))*.2;
  const cam=V3.camera,fov=cam.fov*Math.PI/180,fovH=2*Math.atan(Math.tan(fov/2)*cam.aspect);
  fr.fitDist=r/Math.sin(Math.min(fov,fovH)/2)*1.02;if(!V3.target)V3.target=c;V3.target=c;V3.fitDist=fr.fitDist;
}
function updateFrame(fr,t,dots,curlA){
  const pos=fr.ents.map(e=>e.p0&&e.p1?v3.lerp(e.p0,e.p1,t):(e.p0||e.p1));
  const aop=fr.ents.map(e=>{const v=e.p0&&e.p1?1:e.p0?1-smooth(0,.55,t):smooth(.45,1,t);return e.h&&!V3.showH?0:v});
  fr.ents.forEach((e,k)=>{const p=pos[k],o=aop[k];e.mesh.position.set(p[0],p[1],p[2]);
    if(e.mesh2){const w=smooth(.3,.8,t);e.mesh.material.opacity=o*(1-w);e.mesh2.material.opacity=o*w;e.mesh2.position.copy(e.mesh.position);e.mesh2.visible=o*w>.01;e.mesh.visible=o*(1-w)>.01}
    else{e.mesh.material.opacity=o;e.mesh.visible=o>.01;e.mesh.material.depthWrite=o>.98}
    e.spr.forEach(s=>{const w=s.same?1:(s.w===0?1-smooth(.35,.7,t):smooth(.35,.7,t));s.sp.position.set(p[0],p[1],p[2]);s.sp.material.opacity=w*Math.min(1,o*1.2);s.sp.visible=w*o>.02});
    if(e.lab){e.lab.position.set(p[0],p[1],p[2]);e.lab.material.opacity=o;e.lab.visible=o>.02}});
  const sty=V3.style,br=sty==='stick'?.13:.085,mr=sty==='stick'?.075:.06,gap=sty==='stick'?.19:.15;
  fr.bonds.forEach(b=>{
    const pa=pos[b.i],pb=pos[b.j],dir=v3.sub(pb,pa),L2=v3.len(dir)||1e-6,u=v3.mul(dir,1/L2);
    const baseO=Math.min(aop[b.i],aop[b.j]),tb=b.o0===0?smooth(.4,.95,t):b.o1===0?smooth(.05,.6,t):smooth(.25,.75,t);
    let ref=b.refI!=null?pos[b.refI]:b.refJ!=null?pos[b.refJ]:null,perp;
    if(ref){const nn=v3.cross(u,v3.sub(ref,pa));perp=v3.len(nn)>1e-3?v3.norm(v3.cross(nn,u)):null}
    if(!perp){perp=v3.cross(u,[0,0,1]);if(v3.len(perp)<.1)perp=v3.cross(u,[0,1,0]);perp=v3.norm(perp)}
    const offs=o=>o<=1?[0]:o===2?[-.5,.5]:[-1,0,1],oa=offs(b.o0),ob=offs(b.o1);
    b.st.forEach((m,k)=>{
      const a0=k<b.o0?1:0,a1=k<b.o1?1:0,op=(a0*(1-tb)+a1*tb)*baseO*(sty==='sf'?0:1);
      const off=(oa[Math.min(k,oa.length-1)]*(1-tb)+ob[Math.min(k,ob.length-1)]*tb)*gap,mid=v3.add(v3.lerp(pa,pb,.5),v3.mul(perp,off));
      const r=(Math.max(b.o0,b.o1)>1?mr:br)*(b.o0===0||b.o1===0?.85:1);
      m.position.set(mid[0],mid[1],mid[2]);m.scale.set(r,L2,r);m.quaternion.setFromUnitVectors(V3.Y,new THREE.Vector3(u[0],u[1],u[2]));
      m.material.opacity=op;m.visible=op>.01;m.material.depthWrite=op>.98;
    });
  });
  fr.lps.forEach(l=>{const p=pos[l.par],o=aop[l.par];let w,dv;
    if(l.d0&&l.d1){w=1;dv=l.d0}else if(l.d0){w=fr.def.kind==='static'?1:1-smooth(0,.5,t);dv=l.d0}else{w=smooth(.5,1,t);dv=l.d1}
    const vis=w*o*(V3.showLP&&V3.style!=='sf'?1:0);l.grp.position.set(p[0],p[1],p[2]);l.grp.quaternion.setFromUnitVectors(V3.Y,new THREE.Vector3(dv[0],dv[1],dv[2]));
    l.mats.forEach((m2,i)=>{m2.opacity=vis*(i===0?.5:1)});l.grp.visible=vis>.01});
  (fr.curlObjs||[]).forEach(c=>{c.m.opacity=curlA;c.m.visible=curlA>.01;
    c.dots.forEach((d,k)=>{if(dots<0||dots>1){d.visible=false;return}const u=Math.max(0,Math.min(1,ease(dots)-k*.07)),p=c.curve.getPoint(u);d.position.copy(p);d.visible=true;d.material.opacity=1-smooth(.85,1,dots)})});
}

/* ---------- Naming: lessons and quiz ---------- */
const NM_BANK=[{"id": "a1", "t": "alkanes", "s": "CCC(C)CC", "n": "3-methylpentane", "alt": [], "d": ["2-ethylbutane", "3-methylbutane", "2-methylpentane"], "why": "The longest chain has five carbons. The methyl group is on C3 whichever end you number from."}, {"id": "a2", "t": "alkanes", "s": "CC(C)CCC", "n": "2-methylpentane", "alt": [], "d": ["4-methylpentane", "2-methylhexane", "1,1-dimethylbutane"], "why": "Number from the end nearer the branch, so the methyl gets locant 2, not 4."}, {"id": "a3", "t": "alkanes", "s": "CCC(C)C(C)C", "n": "2,3-dimethylpentane", "alt": [], "d": ["3,4-dimethylpentane", "2,3-methylpentane", "2-methyl-3-methylpentane"], "why": "Identical groups are combined with di- and each one gets a locant. Numbering from the right gives 2,3 rather than 3,4."}, {"id": "a4", "t": "alkanes", "s": "CC(C)(C)CC", "n": "2,2-dimethylbutane", "alt": [], "d": ["2-dimethylbutane", "3,3-dimethylbutane", "2,2-methylbutane"], "why": "Both methyls are on C2, so the locant is written twice: 2,2-dimethyl."}, {"id": "a5", "t": "alkanes", "s": "CCC(CC)CCC", "n": "3-ethylhexane", "alt": [], "d": ["4-ethylhexane", "3-propylpentane", "3-ethylheptane"], "why": "Run the chain through one of the branches to find six carbons. The ethyl group is then on C3 from the nearer end."}, {"id": "a6", "t": "alkanes", "s": "CC(C)CC(C)C", "n": "2,4-dimethylpentane", "alt": [], "d": ["2,4-methylpentane", "2-methyl-4-methylpentane", "2,4-dimethylhexane"], "why": "Two methyls on a five-carbon chain, at C2 and C4 from either end. Combine them as 2,4-dimethyl."}, {"id": "a7", "t": "alkanes", "s": "CCC(C)(C)CC(C)C", "n": "2,4,4-trimethylhexane", "alt": [], "d": ["3,3,5-trimethylhexane", "2,4-dimethyl-4-methylhexane", "2,2,4-trimethylhexane"], "why": "Compare the locant sets {2,4,4} and {3,3,5} term by term. The first difference is 2 against 3, so 2,4,4 wins."}, {"id": "a8", "t": "alkanes", "s": "CC(C)C(CC)CC", "n": "3-ethyl-2-methylpentane", "alt": [], "d": ["3-isopropylpentane", "2-methyl-3-ethylpentane", "3-ethyl-4-methylpentane"], "why": "Several five-carbon chains are possible. Pick the one with more substituents (two rather than one), then list them alphabetically: ethyl before methyl."}, {"id": "a9", "t": "alkanes", "s": "CCCC(C)CCC(C)C", "n": "2,5-dimethyloctane", "alt": [], "d": ["4,7-dimethyloctane", "2,5-dimethylheptane", "2,5-methyloctane"], "why": "The chain has eight carbons. Numbering from the right gives 2,5, which is lower than 4,7."}, {"id": "a10", "t": "alkanes", "s": "CC(Cl)CC", "n": "2-chlorobutane", "alt": [], "d": ["3-chlorobutane", "1-chloro-1-methylpropane", "1-chlorobutane"], "why": "Halogens are always written as prefixes (chloro-). Number so the chlorine gets 2, not 3."}, {"id": "a11", "t": "alkanes", "s": "CC(Br)C(C)C", "n": "2-bromo-3-methylbutane", "alt": [], "d": ["3-bromo-2-methylbutane", "2-methyl-3-bromobutane", "2-bromo-3-methylpentane"], "why": "Both directions give locants 2 and 3. On a tie, the group that comes first alphabetically (bromo) gets the lower number."}, {"id": "a12", "t": "alkanes", "s": "ClC(Cl)CC", "n": "1,1-dichloropropane", "alt": [], "d": ["3,3-dichloropropane", "1-dichloropropane", "1,1-dichlorobutane"], "why": "Both chlorines are on the end carbon, so number from that end: 1,1-dichloro."}, {"id": "a13", "t": "alkanes", "s": "CC(C)(C)Br", "n": "2-bromo-2-methylpropane", "alt": ["tert-butyl bromide", "t-butyl bromide"], "d": ["1-bromo-1,1-dimethylethane", "2-bromo-2-methylbutane", "2-methyl-2-bromopropane"], "why": "The longest chain has three carbons. The bromine and the methyl are both on C2, and bromo is listed first alphabetically."}, {"id": "a14", "t": "alkanes", "s": "CC(C)CC(C)(C)C", "n": "2,2,4-trimethylpentane", "alt": ["isooctane"], "d": ["2,4,4-trimethylpentane", "2,2-dimethyl-4-methylpentane", "2,2,4-trimethylhexane"], "why": "Compare {2,2,4} with {2,4,4}: the sets match at the first term and differ at the second (2 against 4), so 2,2,4 wins."}, {"id": "r1", "t": "rings", "s": "CC1CCCCC1", "n": "methylcyclohexane", "alt": ["1-methylcyclohexane"], "d": ["methylcyclopentane", "toluene", "heptane"], "why": "A ring with one substituent needs no locant: the substituted carbon is C1 by definition."}, {"id": "r2", "t": "rings", "s": "CC1CCC(C)CC1", "n": "1,4-dimethylcyclohexane", "alt": [], "d": ["1,3-dimethylcyclohexane", "2,5-dimethylcyclohexane", "1,4-dimethylcyclopentane"], "why": "Start at one substituted carbon and count round the ring the short way to the other: 1,4."}, {"id": "r3", "t": "rings", "s": "CCC1CCCC1C", "n": "1-ethyl-2-methylcyclopentane", "alt": [], "d": ["2-ethyl-1-methylcyclopentane", "1-methyl-2-ethylcyclopentane", "1-ethyl-5-methylcyclopentane"], "why": "Number round the ring to give 1,2. With a tie, alphabetical order decides which group gets C1: ethyl comes before methyl."}, {"id": "r4", "t": "rings", "s": "CC1(C)CC1", "n": "1,1-dimethylcyclopropane", "alt": [], "d": ["2,2-dimethylcyclopropane", "1,2-dimethylcyclopropane", "1,1-dimethylcyclobutane"], "why": "Both methyls are on the same ring carbon, which becomes C1: 1,1-dimethyl."}, {"id": "r5", "t": "rings", "s": "CCCCC1CCCCC1", "n": "butylcyclohexane", "alt": [], "d": ["butylcyclopentane", "pentylcyclohexane", "cyclohexylpropane"], "why": "Under current IUPAC rules a ring is chosen as the parent ahead of a chain. Older rules picked whichever had more carbons, which also gives butylcyclohexane here."}, {"id": "r6", "t": "rings", "s": "CC(C)C1CCCCC1", "n": "isopropylcyclohexane", "alt": ["(propan-2-yl)cyclohexane", "propan-2-ylcyclohexane", "(1-methylethyl)cyclohexane"], "d": ["propylcyclohexane", "isobutylcyclohexane", "isopropylcyclopentane"], "why": "The ring is the parent. The branched three-carbon group attached by its middle carbon is isopropyl, written propan-2-yl in current IUPAC names."}, {"id": "r7", "t": "rings", "s": "CC1CCCC(C)(C)C1", "n": "1,1,3-trimethylcyclohexane", "alt": [], "d": ["1,3,3-trimethylcyclohexane", "1,1,5-trimethylcyclohexane", "1,3-dimethyl-1-methylcyclohexane"], "why": "Give C1 to the carbon with two methyls, then count towards the third methyl the short way: {1,1,3} beats {1,3,3}."}, {"id": "e1", "t": "alkenes", "s": "C=CCC", "n": "but-1-ene", "alt": ["1-butene", "butene"], "d": ["but-2-ene", "but-3-ene", "butane"], "why": "Number from the end nearer the double bond. Its locant goes just before -ene: but-1-ene."}, {"id": "e2", "t": "alkenes", "s": "C/C=C/C", "n": "(E)-but-2-ene", "alt": ["trans-but-2-ene", "trans-2-butene", "(E)-2-butene", "E-but-2-ene", "(2E)-but-2-ene"], "d": ["(Z)-but-2-ene", "(E)-but-1-ene", "but-2-yne"], "why": "The two methyl groups are on opposite sides of the double bond, so it is E (trans)."}, {"id": "e3", "t": "alkenes", "s": "C/C=C\\C", "n": "(Z)-but-2-ene", "alt": ["cis-but-2-ene", "cis-2-butene", "(Z)-2-butene", "Z-but-2-ene", "(2Z)-but-2-ene"], "d": ["(E)-but-2-ene", "(Z)-but-1-ene", "but-1-ene"], "why": "The two methyl groups are on the same side of the double bond, so it is Z (cis)."}, {"id": "e4", "t": "alkenes", "s": "CC(C)=CC", "n": "2-methylbut-2-ene", "alt": ["2-methyl-2-butene"], "d": ["3-methylbut-2-ene", "2-methylbut-1-ene", "(E)-2-methylbut-2-ene"], "why": "Number so the double bond gets 2, which also gives the methyl 2. No E/Z is needed because C2 carries two identical methyl groups."}, {"id": "e5", "t": "alkenes", "s": "C=CC(C)C", "n": "3-methylbut-1-ene", "alt": ["3-methyl-1-butene"], "d": ["2-methylbut-3-ene", "3-methylbut-1-yne", "2-methylbut-1-ene"], "why": "The double bond decides the numbering and must get locant 1, so the methyl is on C3."}, {"id": "e6", "t": "alkenes", "s": "C=CC=C", "n": "buta-1,3-diene", "alt": ["1,3-butadiene", "butadiene"], "d": ["but-1,3-diene", "buta-1,2-diene", "but-1-ene"], "why": "With two double bonds the ending is -diene, and an 'a' is added to the root for easier pronunciation: buta-1,3-diene."}, {"id": "e7", "t": "alkenes", "s": "C#CC", "n": "propyne", "alt": ["prop-1-yne", "methylacetylene"], "d": ["propene", "propane", "ethyne"], "why": "A triple bond gives the ending -yne. In propyne it can only start at C1, so no locant is needed."}, {"id": "e8", "t": "alkenes", "s": "CC#CC(C)C", "n": "4-methylpent-2-yne", "alt": ["4-methyl-2-pentyne"], "d": ["2-methylpent-3-yne", "4-methylpent-3-yne", "4-methylhex-2-yne"], "why": "Number from the end nearer the triple bond (locant 2). The methyl then lands on C4."}, {"id": "e9", "t": "alkenes", "s": "C1=CCCCC1", "n": "cyclohexene", "alt": ["cyclohex-1-ene"], "d": ["cyclohexane", "benzene", "cyclopentene"], "why": "In a ring the double bond is placed between C1 and C2 by definition, so no locant is needed."}, {"id": "e10", "t": "alkenes", "s": "CC1=CCCCC1", "n": "1-methylcyclohexene", "alt": ["1-methylcyclohex-1-ene"], "d": ["2-methylcyclohexene", "6-methylcyclohexene", "methylenecyclohexane"], "why": "The double bond takes C1 and C2. Choose the direction that gives the methyl the lowest locant, here 1."}, {"id": "e11", "t": "alkenes", "s": "C=CC#C", "n": "but-1-en-3-yne", "alt": ["1-buten-3-yne"], "d": ["but-3-en-1-yne", "but-1-yn-3-ene", "but-1-ene"], "why": "Locants are 1 and 3 from either end. On a tie the double bond gets the lower number, and -en- is written before -yne."}, {"id": "e12", "t": "alkenes", "s": "C/C=C/CC", "n": "(E)-pent-2-ene", "alt": ["trans-pent-2-ene", "trans-2-pentene", "(E)-2-pentene", "(2E)-pent-2-ene"], "d": ["(Z)-pent-2-ene", "(E)-pent-3-ene", "(E)-pent-2-yne"], "why": "Number from the end nearer the double bond (2, not 3). The chain carbons on each end are on opposite sides, so it is E."}, {"id": "o1", "t": "alcohols", "s": "CCO", "n": "ethanol", "alt": ["ethyl alcohol"], "d": ["methanol", "ethanal", "propan-1-ol"], "why": "Two carbons (eth-), single bonds (-an-) and an OH group (-ol). The final 'e' of ethane is dropped before a vowel."}, {"id": "o2", "t": "alcohols", "s": "CC(O)C", "n": "propan-2-ol", "alt": ["2-propanol", "isopropanol", "isopropyl alcohol"], "d": ["propan-1-ol", "2-hydroxypropane", "propanone"], "why": "The OH is on the middle carbon. Its locant goes just before -ol: propan-2-ol."}, {"id": "o3", "t": "alcohols", "s": "CC(C)(C)O", "n": "2-methylpropan-2-ol", "alt": ["2-methyl-2-propanol", "tert-butanol", "tert-butyl alcohol", "t-butanol"], "d": ["1,1-dimethylethanol", "2-methylpropan-1-ol", "butan-2-ol"], "why": "The longest chain that includes the OH carbon has three carbons. The OH and the methyl are both on C2."}, {"id": "o4", "t": "alcohols", "s": "OCC(C)CC", "n": "2-methylbutan-1-ol", "alt": ["2-methyl-1-butanol"], "d": ["3-methylbutan-1-ol", "2-ethylpropan-1-ol", "3-methylbutan-4-ol"], "why": "The OH gets the lowest locant, so its carbon is C1. The methyl is then on C2."}, {"id": "o5", "t": "alcohols", "s": "CC(O)CC(C)C", "n": "4-methylpentan-2-ol", "alt": ["4-methyl-2-pentanol"], "d": ["2-methylpentan-4-ol", "4-methylhexan-2-ol", "4-methylpentan-2-one"], "why": "The OH decides the numbering: it gets the lowest locant (2), even though the methyl then gets 4."}, {"id": "o6", "t": "alcohols", "s": "OC1CCCCC1", "n": "cyclohexanol", "alt": ["cyclohexan-1-ol"], "d": ["phenol", "cyclohexanone", "cyclopentanol"], "why": "The ring is the parent and the OH carbon is C1, so no locant is needed."}, {"id": "o7", "t": "alcohols", "s": "OCCO", "n": "ethane-1,2-diol", "alt": ["1,2-ethanediol", "ethylene glycol"], "d": ["ethan-1,2-diol", "ethane-1,1-diol", "propane-1,2-diol"], "why": "Keep the 'e' of ethane before a consonant: ethane + diol. Each OH gets a locant."}, {"id": "o8", "t": "alcohols", "s": "COC", "n": "methoxymethane", "alt": ["dimethyl ether"], "d": ["methoxyethane", "ethanol", "ethoxyethane"], "why": "Ethers are named alkoxy + alkane. Here both groups are methyl, giving methoxymethane."}, {"id": "o9", "t": "alcohols", "s": "CCOC", "n": "methoxyethane", "alt": ["ethyl methyl ether"], "d": ["ethoxymethane", "methoxymethane", "propan-1-ol"], "why": "The larger group (ethane) is the parent and the smaller one becomes methoxy-."}, {"id": "o10", "t": "alcohols", "s": "CCOCC", "n": "ethoxyethane", "alt": ["diethyl ether"], "d": ["ethoxymethane", "butan-1-ol", "methoxypropane"], "why": "Two ethyl groups on oxygen. The commonly used name is diethyl ether."}, {"id": "o11", "t": "alcohols", "s": "CCN", "n": "ethanamine", "alt": ["ethylamine", "aminoethane"], "d": ["ethanamide", "methanamine", "ethanimine"], "why": "Amines take the suffix -amine: ethane becomes ethanamine."}, {"id": "o12", "t": "alcohols", "s": "CC(N)C", "n": "propan-2-amine", "alt": ["2-propanamine", "isopropylamine", "2-aminopropane"], "d": ["propan-1-amine", "propanamide", "propan-2-ol"], "why": "The NH2 is on the middle carbon: propan-2-amine."}, {"id": "o13", "t": "alcohols", "s": "CN(C)C", "n": "N,N-dimethylmethanamine", "alt": ["trimethylamine"], "d": ["trimethanamine", "N,N-dimethylethanamine", "N-methylmethanamine"], "why": "The parent is methanamine. The two other methyls are on nitrogen, so their locants are N,N."}, {"id": "o14", "t": "alcohols", "s": "CCNC", "n": "N-methylethanamine", "alt": ["ethylmethylamine", "ethyl(methyl)amine"], "d": ["N-ethylmethanamine", "propan-1-amine", "N-methylmethanamine"], "why": "Choose the larger alkyl group (ethyl) as the parent amine. The methyl on nitrogen gets the locant N."}, {"id": "o15", "t": "alcohols", "s": "NCCO", "n": "2-aminoethan-1-ol", "alt": ["2-aminoethanol", "ethanolamine"], "d": ["2-hydroxyethanamine", "1-aminoethan-2-ol", "2-aminoethanal"], "why": "Alcohols outrank amines, so -ol is the suffix and the NH2 becomes the prefix amino-."}, {"id": "k1", "t": "carbonyls", "s": "CC=O", "n": "ethanal", "alt": ["acetaldehyde"], "d": ["ethanol", "ethanone", "methanal"], "why": "Aldehydes end in -al. The CHO carbon is always C1, so no locant is needed."}, {"id": "k2", "t": "carbonyls", "s": "CCCC=O", "n": "butanal", "alt": ["butyraldehyde"], "d": ["butanone", "butan-1-ol", "propanal"], "why": "Four carbons including the CHO carbon, which is C1: butanal."}, {"id": "k3", "t": "carbonyls", "s": "CC(C)CC=O", "n": "3-methylbutanal", "alt": ["isovaleraldehyde"], "d": ["2-methylbutanal", "3-methylpentanal", "3-methylbutan-2-one"], "why": "Number from the CHO carbon (C1). The methyl branch is then on C3."}, {"id": "k4", "t": "carbonyls", "s": "CC(C)=O", "n": "propanone", "alt": ["acetone", "propan-2-one", "2-propanone", "dimethyl ketone"], "d": ["propanal", "propan-2-ol", "ethanone"], "why": "Ketones end in -one. In propanone the C=O can only be on C2, so the locant is usually left out."}, {"id": "k5", "t": "carbonyls", "s": "CCC(=O)CC", "n": "pentan-3-one", "alt": ["3-pentanone", "diethyl ketone"], "d": ["pentan-2-one", "pentan-3-ol", "pentanal"], "why": "The C=O is on C3 counting from either end: pentan-3-one."}, {"id": "k6", "t": "carbonyls", "s": "CC(=O)CC(C)C", "n": "4-methylpentan-2-one", "alt": ["4-methyl-2-pentanone", "methyl isobutyl ketone"], "d": ["2-methylpentan-4-one", "4-methylpentanal", "4-methylpentan-2-ol"], "why": "The ketone gets the lowest locant (2), so the methyl ends up on C4."}, {"id": "k7", "t": "carbonyls", "s": "O=C1CCCCC1", "n": "cyclohexanone", "alt": ["cyclohexan-1-one"], "d": ["cyclohexanal", "cyclohexanol", "cyclopentanone"], "why": "The C=O carbon in the ring is C1, so no locant is needed."}, {"id": "k8", "t": "carbonyls", "s": "O=CC1CCCCC1", "n": "cyclohexanecarbaldehyde", "alt": ["cyclohexanecarboxaldehyde", "formylcyclohexane"], "d": ["cyclohexanal", "cyclohexylmethanol", "cyclohexanone"], "why": "When a CHO group is attached to a ring, the ring is the parent and the suffix is -carbaldehyde."}, {"id": "k9", "t": "carbonyls", "s": "CC(=O)CC=O", "n": "3-oxobutanal", "alt": [], "d": ["4-oxobutan-2-one", "2-oxobutanal", "butane-1,3-dione"], "why": "Aldehydes outrank ketones, so the name ends in -al and the ketone becomes the prefix oxo- on C3."}, {"id": "k10", "t": "carbonyls", "s": "CC(=O)C(C)C", "n": "3-methylbutan-2-one", "alt": ["3-methyl-2-butanone", "methyl isopropyl ketone"], "d": ["2-methylbutan-3-one", "3-methylbutanal", "3-methylpentan-2-one"], "why": "Give the C=O the lowest locant (2). The methyl branch is then on C3."}, {"id": "c1", "t": "acids", "s": "CC(=O)O", "n": "ethanoic acid", "alt": ["acetic acid"], "d": ["methanoic acid", "ethanal", "ethanol"], "why": "Carboxylic acids end in -oic acid. The COOH carbon is C1 and counts as part of the chain."}, {"id": "c2", "t": "acids", "s": "CCCC(=O)O", "n": "butanoic acid", "alt": ["butyric acid"], "d": ["propanoic acid", "butanal", "pentanoic acid"], "why": "Four carbons including the COOH carbon: butanoic acid."}, {"id": "c3", "t": "acids", "s": "CC(C)C(=O)O", "n": "2-methylpropanoic acid", "alt": ["isobutyric acid"], "d": ["3-methylpropanoic acid", "2-methylbutanoic acid", "butanoic acid"], "why": "Count from the COOH carbon (C1): a three-carbon chain with a methyl on C2."}, {"id": "c4", "t": "acids", "s": "CC(=O)OC", "n": "methyl ethanoate", "alt": ["methyl acetate"], "d": ["ethyl methanoate", "methyl propanoate", "propanoic acid"], "why": "Esters are two words: the group on the single-bonded oxygen (methyl), then the acid part ending in -oate (ethanoate)."}, {"id": "c5", "t": "acids", "s": "CCC(=O)OCC", "n": "ethyl propanoate", "alt": ["ethyl propionate"], "d": ["propyl ethanoate", "ethyl ethanoate", "propyl propanoate"], "why": "The part containing C=O has three carbons (propanoate). The ethyl group is on the single-bonded oxygen."}, {"id": "c6", "t": "acids", "s": "CC(N)=O", "n": "ethanamide", "alt": ["acetamide"], "d": ["ethanamine", "methanamide", "propanamide"], "why": "Amides end in -amide; the C=O carbon is C1."}, {"id": "c7", "t": "acids", "s": "CC(=O)N(C)C", "n": "N,N-dimethylethanamide", "alt": ["N,N-dimethylacetamide"], "d": ["N,N-dimethylethanamine", "N-methylethanamide", "N,N-dimethylpropanamide"], "why": "The parent is ethanamide. Both methyls are on nitrogen, so they are N,N-dimethyl."}, {"id": "c8", "t": "acids", "s": "CC(Cl)=O", "n": "ethanoyl chloride", "alt": ["acetyl chloride"], "d": ["2-chloroethanal", "ethanoic acid", "propanoyl chloride"], "why": "Acid chlorides replace -oic acid with -oyl chloride: ethanoyl chloride."}, {"id": "c9", "t": "acids", "s": "CC#N", "n": "ethanenitrile", "alt": ["acetonitrile", "methyl cyanide"], "d": ["methanenitrile", "propanenitrile", "ethanamine"], "why": "The nitrile carbon counts as C1, so CH3CN has two carbons: ethanenitrile."}, {"id": "c10", "t": "acids", "s": "CCCC#N", "n": "butanenitrile", "alt": ["butyronitrile", "propyl cyanide"], "d": ["propanenitrile", "pentanenitrile", "butan-1-amine"], "why": "Four carbons including the C≡N carbon: butanenitrile."}, {"id": "c11", "t": "acids", "s": "CC(O)C(=O)O", "n": "2-hydroxypropanoic acid", "alt": ["lactic acid"], "d": ["3-hydroxypropanoic acid", "2-hydroxypropanal", "propane-1,2-diol"], "why": "The carboxylic acid is the principal group, so the OH becomes the prefix hydroxy-, on C2."}, {"id": "c12", "t": "acids", "s": "CCOC(=O)c1ccccc1", "n": "ethyl benzoate", "alt": [], "d": ["phenyl propanoate", "benzyl ethanoate", "ethyl phenylethanoate"], "why": "The acid part is benzoic acid, so the ester is a benzoate. The ethyl group sits on the single-bonded oxygen."}, {"id": "c13", "t": "acids", "s": "CC(=O)OCc1ccccc1", "n": "benzyl ethanoate", "alt": ["benzyl acetate"], "d": ["phenyl ethanoate", "ethyl benzoate", "benzyl methanoate"], "why": "The acid part has two carbons (ethanoate) and the group on oxygen is benzyl (C6H5CH2–)."}, {"id": "b1", "t": "benzene", "s": "Cc1ccccc1", "n": "methylbenzene", "alt": ["toluene"], "d": ["methylcyclohexane", "phenol", "ethylbenzene"], "why": "Name simple substituted benzenes as prefix + benzene. Methylbenzene is usually called toluene, a name IUPAC still accepts."}, {"id": "b2", "t": "benzene", "s": "Oc1ccccc1", "n": "phenol", "alt": ["benzenol", "hydroxybenzene"], "d": ["cyclohexanol", "phenylmethanol", "benzoic acid"], "why": "An OH directly on a benzene ring gives phenol, which is also the parent name for its derivatives."}, {"id": "b3", "t": "benzene", "s": "Nc1ccccc1", "n": "aniline", "alt": ["benzenamine", "phenylamine", "aminobenzene"], "d": ["benzylamine", "cyclohexanamine", "benzamide"], "why": "An NH2 directly on a benzene ring gives aniline (benzenamine)."}, {"id": "b4", "t": "benzene", "s": "O=C(O)c1ccccc1", "n": "benzoic acid", "alt": ["benzenecarboxylic acid"], "d": ["phenol", "benzaldehyde", "phenylacetic acid"], "why": "A COOH directly on a benzene ring gives benzoic acid."}, {"id": "b5", "t": "benzene", "s": "O=Cc1ccccc1", "n": "benzaldehyde", "alt": ["benzenecarbaldehyde"], "d": ["benzoic acid", "phenylmethanol", "acetophenone"], "why": "A CHO directly on a benzene ring gives benzaldehyde (benzenecarbaldehyde)."}, {"id": "b6", "t": "benzene", "s": "CC(=O)c1ccccc1", "n": "1-phenylethan-1-one", "alt": ["acetophenone", "1-phenylethanone", "phenylethanone", "methyl phenyl ketone"], "d": ["2-phenylethanal", "1-phenylethan-1-ol", "1-phenylpropan-1-one"], "why": "The ketone chain (ethanone) is the parent with a phenyl substituent on C1. The common name acetophenone is widely used."}, {"id": "b7", "t": "benzene", "s": "OCc1ccccc1", "n": "phenylmethanol", "alt": ["benzyl alcohol"], "d": ["phenol", "2-methylphenol", "benzaldehyde"], "why": "The OH is on the CH2 group, not the ring, so this is an alcohol: methanol with a phenyl substituent."}, {"id": "b8", "t": "benzene", "s": "Clc1ccc(Cl)cc1", "n": "1,4-dichlorobenzene", "alt": ["p-dichlorobenzene", "para-dichlorobenzene"], "d": ["1,3-dichlorobenzene", "1,2-dichlorobenzene", "1,4-dichlorocyclohexane"], "why": "The chlorines are opposite each other (para), giving locants 1,4."}, {"id": "b9", "t": "benzene", "s": "Cc1cccc(C)c1", "n": "1,3-dimethylbenzene", "alt": ["m-xylene", "meta-xylene"], "d": ["1,2-dimethylbenzene", "1,4-dimethylbenzene", "1,5-dimethylbenzene"], "why": "The methyls are separated by one ring carbon (meta). Counting the short way gives 1,3, not 1,5."}, {"id": "b10", "t": "benzene", "s": "Cc1ccccc1Br", "n": "1-bromo-2-methylbenzene", "alt": ["2-bromotoluene", "o-bromotoluene"], "d": ["2-bromo-1-methylbenzene", "1-methyl-2-bromobenzene", "1-bromo-3-methylbenzene"], "why": "Locants are 1,2 either way. On a tie, the group first in the alphabet (bromo) gets C1."}, {"id": "b11", "t": "benzene", "s": "O=[N+]([O-])c1ccccc1", "n": "nitrobenzene", "alt": [], "d": ["benzonitrile", "nitrocyclohexane", "aniline"], "why": "The nitro group (–NO2) is always a prefix: nitrobenzene."}, {"id": "b12", "t": "benzene", "s": "N#Cc1ccccc1", "n": "benzonitrile", "alt": ["benzenecarbonitrile", "cyanobenzene", "phenyl cyanide"], "d": ["nitrobenzene", "phenylacetonitrile", "benzamide"], "why": "A C≡N directly on a benzene ring gives benzonitrile. Don't confuse it with nitrobenzene (–NO2)."}, {"id": "b13", "t": "benzene", "s": "Oc1ccc(Cl)cc1", "n": "4-chlorophenol", "alt": ["p-chlorophenol", "para-chlorophenol"], "d": ["2-chlorophenol", "3-chlorophenol", "(4-chlorophenyl)methanol"], "why": "Phenol is the parent, so the OH carbon is C1 and the chlorine is on C4."}, {"id": "b14", "t": "benzene", "s": "C=Cc1ccccc1", "n": "ethenylbenzene", "alt": ["styrene", "vinylbenzene", "phenylethene"], "d": ["ethylbenzene", "ethynylbenzene", "1-phenylethan-1-ol"], "why": "A CH=CH2 group on benzene is ethenyl (vinyl). The common name is styrene."}, {"id": "s1", "t": "stereo", "s": "C[C@@H](O)CC", "n": "(R)-butan-2-ol", "alt": ["(2R)-butan-2-ol", "(R)-2-butanol", "R-butan-2-ol"], "d": ["(S)-butan-2-ol", "(R)-butan-1-ol", "(R)-butan-3-ol"], "why": "Priorities: OH > CH2CH3 > CH3 > H. The H points away (hashed), and OH → ethyl → methyl runs clockwise, so it is R."}, {"id": "s2", "t": "stereo", "s": "C[C@H](Br)CC", "n": "(S)-2-bromobutane", "alt": ["(2S)-2-bromobutane", "S-2-bromobutane"], "d": ["(R)-2-bromobutane", "(S)-3-bromobutane", "(S)-1-bromobutane"], "why": "Priorities: Br > CH2CH3 > CH3 > H. With the H pointing away, Br → ethyl → methyl runs anticlockwise, so it is S."}, {"id": "s3", "t": "stereo", "s": "C[C@H](N)C(=O)O", "n": "(S)-2-aminopropanoic acid", "alt": ["(2S)-2-aminopropanoic acid", "L-alanine", "S-2-aminopropanoic acid"], "d": ["(R)-2-aminopropanoic acid", "(S)-3-aminopropanoic acid", "(S)-2-aminopropanamide"], "why": "Priorities: NH2 > COOH > CH3 > H. Trace them with the H at the back: anticlockwise, so S. This is natural L-alanine."}, {"id": "s4", "t": "stereo", "s": "CCC[C@H](C)CC", "n": "(R)-3-methylhexane", "alt": ["(3R)-3-methylhexane", "R-3-methylhexane"], "d": ["(S)-3-methylhexane", "(R)-4-methylhexane", "(R)-3-ethylpentane"], "why": "Priorities: propyl > ethyl > methyl > H (propyl wins at the second carbon out). Clockwise with H at the back, so R."}, {"id": "s5", "t": "stereo", "s": "C[C@H](O)c1ccccc1", "n": "(S)-1-phenylethan-1-ol", "alt": ["(1S)-1-phenylethan-1-ol", "(S)-1-phenylethanol", "S-1-phenylethanol"], "d": ["(R)-1-phenylethan-1-ol", "(S)-2-phenylethan-1-ol", "(S)-1-phenylethan-1-one"], "why": "Priorities: OH > phenyl > CH3 > H. With the H pointing away the order runs anticlockwise, so it is S."}, {"id": "s6", "t": "stereo", "s": "Br\\C=C(\\C)/Cl", "n": "(Z)-1-bromo-2-chloroprop-1-ene", "alt": ["(1Z)-1-bromo-2-chloroprop-1-ene", "Z-1-bromo-2-chloroprop-1-ene"], "d": ["(E)-1-bromo-2-chloroprop-1-ene", "(Z)-2-bromo-1-chloroprop-1-ene", "(Z)-1-bromo-2-chloropropene-1"], "why": "On C1, Br beats H. On C2, Cl beats CH3. Br and Cl are on the same side, so it is Z, even though the carbon chain itself looks trans."}, {"id": "s7", "t": "stereo", "s": "C/C=C(\\C)CC", "n": "(E)-3-methylpent-2-ene", "alt": ["(2E)-3-methylpent-2-ene", "E-3-methylpent-2-ene"], "d": ["(Z)-3-methylpent-2-ene", "(E)-3-methylpent-3-ene", "(E)-3-ethylbut-2-ene"], "why": "On C2, CH3 beats H. On C3, ethyl beats methyl. The higher-priority groups (CH3 on C2, ethyl on C3) are on opposite sides, so it is E."}, {"id": "s8", "t": "stereo", "s": "C[C@@H](N)CC", "n": "(R)-butan-2-amine", "alt": ["(2R)-butan-2-amine", "R-butan-2-amine", "(R)-2-butanamine"], "d": ["(S)-butan-2-amine", "(R)-butan-1-amine", "(R)-butan-3-amine"], "why": "Priorities: NH2 > ethyl > methyl > H. Clockwise with the H at the back, so R."}];
const NM_BY=Object.fromEntries(NM_BANK.map(q=>[q.id,q]));
const NM_TOPICS=[
  {id:'alkanes',title:'Alkanes and substituents'},{id:'rings',title:'Rings'},{id:'alkenes',title:'Alkenes and alkynes'},
  {id:'alcohols',title:'Alcohols, ethers and amines'},{id:'carbonyls',title:'Aldehydes and ketones'},{id:'acids',title:'Carboxylic acids and derivatives'},
  {id:'benzene',title:'Benzene derivatives'},{id:'stereo',title:'Stereodescriptors: E/Z and R/S'}];
const NM_LESSONS=[
 {id:'intro',title:'How naming works',lede:'Every systematic (IUPAC) name is built from the same four parts. Learn the order once and you can name most simple molecules.',sections:[
  {h:'The four parts of a name',html:'<p class="nm-anatomy"><span class="p1">4-methyl</span><span class="p2">pent</span><span class="p3">an</span><span class="p4">-2-ol</span></p><dl class="nm-legend"><div><dt class="p1">Prefixes</dt><dd>Substituents, in alphabetical order, each with a locant (its carbon number).</dd></div><div><dt class="p2">Parent</dt><dd>How many carbons are in the main chain or ring.</dd></div><div><dt class="p3">Saturation</dt><dd>-an- for all single bonds, -en- for a C=C, -yn- for a C≡C.</dd></div><div><dt class="p4">Suffix</dt><dd>The most important functional group, with its locant.</dd></div></dl>',ex:['o5']},
  {h:'Five steps to a name',html:'<ol><li>Find the <b>principal functional group</b>: the highest one in the priority table below. It becomes the suffix.</li><li>Find the <b>parent</b>: the longest chain (or the ring) that contains the principal group.</li><li><b>Number</b> the parent so that, in this order, the principal group gets the lowest locant, then any double and triple bonds, then all the substituents together.</li><li>If there\'s still a tie, the substituent that comes <b>first in the alphabet</b> gets the lower number.</li><li><b>Assemble</b> the name: prefixes in alphabetical order, then the parent, then the suffix. Use commas between numbers and hyphens between numbers and letters.</li></ol><p class="nm-note">The 2013 IUPAC rules choose the longest chain first and then the chain with the most multiple bonds. Older rules did it the other way round. The questions here avoid cases where the two give different answers.</p>'},
  {h:'Chain lengths',html:'<div class="nm-tablewrap"><table class="nm-table"><thead><tr><th>Carbons</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr></thead><tbody><tr><th>Root</th><td>meth</td><td>eth</td><td>prop</td><td>but</td><td>pent</td><td>hex</td><td>hept</td><td>oct</td><td>non</td><td>dec</td></tr></tbody></table></div>'},
  {h:'Functional group priority',html:'<p>When a molecule has several groups, the highest one in this list gets the suffix and the rest become prefixes.</p><div class="nm-tablewrap"><table class="nm-table nm-prio"><thead><tr><th>Group</th><th>As suffix</th><th>As prefix</th></tr></thead><tbody><tr><td>Carboxylic acid, –COOH</td><td>-oic acid</td><td>carboxy-</td></tr><tr><td>Ester, –COOR</td><td>-oate</td><td>alkoxycarbonyl-</td></tr><tr><td>Acid chloride, –COCl</td><td>-oyl chloride</td><td>chlorocarbonyl-</td></tr><tr><td>Amide, –CONH<sub>2</sub></td><td>-amide</td><td>carbamoyl-</td></tr><tr><td>Nitrile, –C≡N</td><td>-nitrile</td><td>cyano-</td></tr><tr><td>Aldehyde, –CHO</td><td>-al</td><td>oxo- (or formyl-)</td></tr><tr><td>Ketone, C=O</td><td>-one</td><td>oxo-</td></tr><tr><td>Alcohol, –OH</td><td>-ol</td><td>hydroxy-</td></tr><tr><td>Amine, –NH<sub>2</sub></td><td>-amine</td><td>amino-</td></tr></tbody></table></div><p>Always prefixes, never suffixes: halogens (fluoro, chloro, bromo, iodo), nitro, alkyl groups and alkoxy groups (ethers).</p><p class="nm-note">Drop the final "e" of the parent before a suffix that starts with a vowel (propane → propan-2-ol), but keep it before a consonant (ethane-1,2-diol).</p>'}]},
 {id:'alkanes',title:'Alkanes and substituents',lede:'Alkanes are the backbone of every name. Get chains, branches and numbering right here and the rest follows.',sections:[
  {h:'Find the longest chain',html:'<p>The parent is the longest continuous chain of carbons, even if it bends round corners in the drawing. Branches become alkyl groups: methyl (–CH<sub>3</sub>), ethyl (–CH<sub>2</sub>CH<sub>3</sub>), propyl, butyl and so on. If two chains are equally long, choose the one with more substituents.</p>',ex:['a5','a8']},
  {h:'Number for the lowest locants',html:'<p>Number from the end that gives the substituents the lowest set of locants. Compare the two possible sets term by term and stop at the first difference.</p>',ex:['a2','a7','a14']},
  {h:'Several substituents',html:'<p>Identical groups take di-, tri- or tetra-, with one locant each (2,2-dimethyl). List different groups alphabetically, ignoring di-, tri-, sec- and tert- (but not iso-). If the numbering still ties, the group first in the alphabet gets the lower locant.</p>',ex:['a4','a11']},
  {h:'Halogens',html:'<p>Halogens are always prefixes: fluoro, chloro, bromo, iodo. Treat them exactly like alkyl groups for numbering and alphabetical order.</p>',ex:['a10','a13']},
  {h:'Branched alkyl groups',html:'<div class="nm-tablewrap"><table class="nm-table"><thead><tr><th>Common name</th><th>IUPAC name</th><th>Structure</th></tr></thead><tbody><tr><td>isopropyl</td><td>propan-2-yl</td><td>–CH(CH<sub>3</sub>)<sub>2</sub></td></tr><tr><td>sec-butyl</td><td>butan-2-yl</td><td>–CH(CH<sub>3</sub>)CH<sub>2</sub>CH<sub>3</sub></td></tr><tr><td>isobutyl</td><td>2-methylpropyl</td><td>–CH<sub>2</sub>CH(CH<sub>3</sub>)<sub>2</sub></td></tr><tr><td>tert-butyl</td><td>2-methylpropan-2-yl</td><td>–C(CH<sub>3</sub>)<sub>3</sub></td></tr></tbody></table></div>'}]},
 {id:'rings',title:'Rings',lede:'Rings are named like chains, with the prefix cyclo-.',sections:[
  {h:'Cycloalkanes',html:'<p>Add cyclo- to the alkane name for the number of ring carbons: cyclopropane, cyclobutane, cyclopentane, cyclohexane. With only one substituent, no locant is needed.</p>',ex:['r1','r4']},
  {h:'Numbering a ring',html:'<p>With two or more substituents, start at a substituted carbon and go round the ring in whichever direction gives the lowest locants. On a tie, the group first in the alphabet gets C1.</p>',ex:['r2','r3','r7']},
  {h:'Ring or chain?',html:'<p>Under the current IUPAC rules, a ring is always the parent when a ring and a chain are joined. Older rules chose whichever had more carbons, so older books may write names such as 1-cyclopropylbutane.</p>',ex:['r5','r6']}]},
 {id:'alkenes',title:'Alkenes and alkynes',lede:'Double and triple bonds change the -an- of the parent to -en- or -yn-, with a locant showing where they start.',sections:[
  {h:'Alkenes',html:'<p>Number from the end nearer the double bond (unless a suffix group such as -ol needs the lower number) and put the locant of its first carbon just before -ene: but-1-ene. Older names put the number first (1-butene); you will see both.</p>',ex:['e1','e5']},
  {h:'More than one multiple bond',html:'<p>Two double bonds give -diene, with an "a" added to the root: buta-1,3-diene. With a double and a triple bond, write -en- before -yne. The multiple bonds together get the lowest locants; on a tie, the double bond gets the lower number.</p>',ex:['e6','e11']},
  {h:'Alkynes',html:'<p>Triple bonds use -yne in the same way: propyne, pent-2-yne.</p>',ex:['e7','e8']},
  {h:'In rings',html:'<p>In a cycloalkene, the double bond is C1=C2 by definition. Number through the double bond in the direction that gives substituents the lowest locants.</p>',ex:['e9','e10']},
  {h:'cis/trans and E/Z',html:'<p>If both carbons of a double bond carry two different groups, there are two stereoisomers. <b>cis</b> means the matching groups are on the same side, <b>trans</b> that they are on opposite sides. The general system is <b>E/Z</b>: rank the two groups on each carbon by atomic number. <b>Z</b> (zusammen, together) means the higher-ranked groups are on the same side; <b>E</b> (entgegen, opposite) means opposite sides. The descriptor goes in brackets at the front: (E)-but-2-ene.</p>',ex:['e2','e3','e4']}]},
 {id:'alcohols',title:'Alcohols, ethers and amines',lede:'Alcohols and amines are named with suffixes; ethers are named with a prefix.',sections:[
  {h:'Alcohols',html:'<p>Replace the final "e" of the alkane with -ol and give the OH the lowest possible locant, even if that pushes substituents to higher numbers.</p>',ex:['o2','o5','o3']},
  {h:'Diols',html:'<p>With two OH groups, keep the "e" and use -diol: ethane-1,2-diol. Each OH needs its own locant.</p>',ex:['o7']},
  {h:'Ethers',html:'<p>Name the larger group as the alkane and the smaller one as alkoxy- (methoxy, ethoxy). Simple ethers are often named after their two groups instead: diethyl ether.</p>',ex:['o9','o10']},
  {h:'Amines',html:'<p>Add -amine to the parent: ethanamine, propan-2-amine. Extra alkyl groups on the nitrogen take the locant N: N-methylethanamine, N,N-dimethylmethanamine.</p>',ex:['o12','o14','o13']},
  {h:'OH and NH₂ together',html:'<p>The alcohol outranks the amine, so -ol is the suffix and amino- the prefix.</p>',ex:['o15']}]},
 {id:'carbonyls',title:'Aldehydes and ketones',lede:'Aldehydes and ketones both contain C=O. Where it sits decides the ending.',sections:[
  {h:'Aldehydes',html:'<p>Use the ending -al. The CHO carbon is always C1, so it never needs a locant.</p>',ex:['k1','k3']},
  {h:'Ketones',html:'<p>Use -one with a locant, numbering so the C=O gets the lowest number. In propanone the locant is usually left out because only one position is possible.</p>',ex:['k4','k6','k10']},
  {h:'Rings',html:'<p>A ketone inside a ring: cyclohexanone. A CHO attached to a ring uses the suffix -carbaldehyde: cyclohexanecarbaldehyde, benzaldehyde.</p>',ex:['k7','k8']},
  {h:'Aldehyde and ketone together',html:'<p>The aldehyde wins, so the ketone oxygen becomes the prefix oxo-.</p>',ex:['k9']}]},
 {id:'acids',title:'Carboxylic acids and derivatives',lede:'Carboxylic acids are top of the priority list, and their derivatives are named from them.',sections:[
  {h:'Carboxylic acids',html:'<p>Replace the final "e" with -oic acid. The COOH carbon is C1 and counts as part of the chain.</p>',ex:['c1','c3']},
  {h:'Esters',html:'<p>Esters have two words: first the group on the single-bonded oxygen (methyl, ethyl…), then the acid part ending in -oate. The part that contains the C=O names the -oate.</p>',ex:['c4','c5','c12']},
  {h:'Amides and acid chlorides',html:'<p>Amides end in -amide, and groups on the nitrogen get the locant N. Acid chlorides end in -oyl chloride.</p>',ex:['c6','c7','c8']},
  {h:'Nitriles',html:'<p>Use -nitrile. The C≡N carbon counts as C1, so CH<sub>3</sub>CN is ethanenitrile (acetonitrile).</p>',ex:['c9','c10']},
  {h:'With other groups',html:'<p>The acid is still the suffix. Other groups become prefixes such as hydroxy-, amino- and oxo-.</p>',ex:['c11']}]},
 {id:'benzene',title:'Benzene derivatives',lede:'Benzene rings use a mix of systematic names and a few common names that IUPAC still accepts.',sections:[
  {h:'One substituent',html:'<p>Add the prefix to benzene: methylbenzene, chlorobenzene, nitrobenzene. No locant is needed.</p>',ex:['b1','b11']},
  {h:'Names to learn',html:'<div class="nm-tablewrap"><table class="nm-table"><thead><tr><th>Name</th><th>Structure</th><th>Systematic name</th></tr></thead><tbody><tr><td>toluene</td><td>C<sub>6</sub>H<sub>5</sub>CH<sub>3</sub></td><td>methylbenzene</td></tr><tr><td>phenol</td><td>C<sub>6</sub>H<sub>5</sub>OH</td><td>phenol</td></tr><tr><td>aniline</td><td>C<sub>6</sub>H<sub>5</sub>NH<sub>2</sub></td><td>benzenamine</td></tr><tr><td>benzoic acid</td><td>C<sub>6</sub>H<sub>5</sub>COOH</td><td>benzoic acid</td></tr><tr><td>benzaldehyde</td><td>C<sub>6</sub>H<sub>5</sub>CHO</td><td>benzaldehyde</td></tr><tr><td>acetophenone</td><td>C<sub>6</sub>H<sub>5</sub>COCH<sub>3</sub></td><td>1-phenylethan-1-one</td></tr><tr><td>styrene</td><td>C<sub>6</sub>H<sub>5</sub>CH=CH<sub>2</sub></td><td>ethenylbenzene</td></tr></tbody></table></div><p>Names like phenol and aniline also act as parents, so their carbon with the OH or NH<sub>2</sub> is C1.</p>',ex:['b2','b3','b13']},
  {h:'Two substituents',html:'<p>Number round the ring for the lowest locants: 1,2 (ortho, o-), 1,3 (meta, m-) or 1,4 (para, p-). On a tie, the group first in the alphabet gets C1.</p>',ex:['b8','b9','b10']},
  {h:'Benzene as a substituent',html:'<p>C<sub>6</sub>H<sub>5</sub>– is <b>phenyl</b> and C<sub>6</sub>H<sub>5</sub>CH<sub>2</sub>– is <b>benzyl</b>. Use them when a chain or another group is the parent.</p>',ex:['b7','b6','c13']}]},
 {id:'stereo',title:'Stereodescriptors: E/Z and R/S',lede:'Stereodescriptors describe the 3D arrangement of a molecule. E/Z and R/S both use the same priority rules. Open the 3D view on any example to turn it round.',sections:[
  {h:'Ranking groups (CIP rules)',html:'<ol><li>Look at the atoms attached directly. The higher atomic number wins: Br > Cl > O > N > C > H.</li><li>If two are the same, compare the sets of atoms attached to them, highest first, and stop at the first difference.</li><li>A double bond counts as two single bonds to the same atom: C=O counts as (O, O) on the carbon.</li></ol>'},
  {h:'R and S',html:'<ol><li>Rank the four groups on the stereocentre.</li><li>Picture the molecule with the lowest-ranked group (often H) pointing away from you.</li><li>Trace 1 → 2 → 3. Clockwise is <b>R</b>, anticlockwise is <b>S</b>.</li></ol><p>If the lowest-ranked group is on a wedge, pointing towards you, trace as normal and then swap the answer.</p>',ex:['s1','s2','s3']},
  {h:'E and Z',html:'<p>Rank the two groups on each end of the double bond. <b>Z</b>: the higher-ranked groups are on the same side. <b>E</b>: opposite sides. E/Z can disagree with cis/trans, as the second example shows.</p>',ex:['s7','s6']},
  {h:'Writing the name',html:'<p>Put the descriptor in brackets at the front: (R)-butan-2-ol, (E)-pent-2-ene. When there is more than one, add locants: (2R,3S)-…</p>'}]},
];
const QZ_KEY='bondline.quiz.v1';
function loadQuiz(){try{const q=JSON.parse(localStorage.getItem(QZ_ACTIVE)||'null');if(q&&q.q)App.quiz=q}catch(e){}if(!App.quiz||!App.quiz.q)App.quiz={v:1,q:{}}}
let qzSaveT;function saveQuiz(){clearTimeout(qzSaveT);qzSaveT=setTimeout(()=>{try{localStorage.setItem(QZ_ACTIVE,JSON.stringify(App.quiz))}catch(e){}if(Store.mode==='cloud')Store.col.doc('_quiz').set(JSON.parse(JSON.stringify(App.quiz))).catch(()=>{})},600)}
function mergeQuiz(remote){if(!remote||!remote.q)return;for(const[id,r]of Object.entries(remote.q)){const l=App.quiz.q[id];if(!l||(r.at||0)>(l.at||0))App.quiz.q[id]=r}}
function topicStats(t){const qs=NM_BANK.filter(q=>q.t===t);const m=qs.filter(q=>(App.quiz.q[q.id]||{}).last===1).length;return{m,n:qs.length}}
function setMode(mode){
  if(!['home','notes','cards','naming','guide','spectra','orbitals'].includes(mode))mode='home';if(mode!=='notes'&&CM.open)closeComments();
  App.mode=mode;closePop();
  document.querySelectorAll('.mode').forEach(b=>{const on=b.dataset.mode===mode;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  $('#notesSide').hidden=!(mode==='notes'||mode==='home');$('#namingSide').hidden=mode!=='naming';$('#specSide').hidden=mode!=='spectra';$('#orbSide').hidden=mode!=='orbitals';$('#guideSide').hidden=mode!=='guide';$('#cardsSide').hidden=mode!=='cards';
  $('#notesPage').hidden=mode!=='notes';$('#cardsPage').hidden=mode!=='cards';$('#namingPage').hidden=mode!=='naming';$('#specPage').hidden=mode!=='spectra';$('#orbPage').hidden=mode!=='orbitals';$('#homePage').hidden=mode!=='home';$('#guidePage').hidden=mode!=='guide';$('#newNote2').hidden=['naming','spectra','orbitals'].includes(mode);
  if(mode==='naming'){renderNamingSide();if(!NM.view)openLesson('intro')}
  if(mode==='spectra')spOpen();if(mode==='orbitals')obOpen();
  if(mode==='home')renderHome();
  if(mode==='cards')renderCardsPage();
  if(mode==='guide'&&!$('#guidePage').firstChild)renderGuide();
  refreshOutline();
  try{localStorage.setItem('bondline.mode',mode)}catch(e){}
  $('#side').classList.remove('open');$('#main').scrollTop=0;
}
const NM={view:null,lesson:null,qz:null};
function renderNamingSide(){
  const cur=NM.view==='lesson'?NM.lesson:null;
  $('#lessonList').innerHTML=NM_LESSONS.map((l,i)=>{let meta='Start here';if(l.id!=='intro'){const s=topicStats(l.id);meta=`${s.m} of ${s.n} mastered`;}
    const s=l.id!=='intro'?topicStats(l.id):null;
    return`<button class="item${cur===l.id?' on':''}" data-lesson="${l.id}"><span class="t">${esc(l.title)}</span><span class="m">${esc(meta)}</span>${s?`<span class="nm-meter" aria-hidden="true"><i style="width:${Math.round(100*s.m/s.n)}%"></i></span>`:''}</button>`}).join('');
}
function exCard(id){const q=NM_BY[id];if(!q)return'';return`<figure class="nm-ex"><div class="nm-struct">${smilesSVG(q.s,1.15)}</div><figcaption><b class="nm-name">${esc(q.n)}</b><span>${esc(q.why)}</span></figcaption><button class="linkbtn nm-3d" data-3d="${esc(q.s)}" data-name="${esc(q.n)}">View in 3D</button></figure>`}
function openLesson(id){
  const i=NM_LESSONS.findIndex(l=>l.id===id),l=NM_LESSONS[i];if(!l)return;NM.view='lesson';NM.lesson=id;
  const next=NM_LESSONS[i+1],topic=l.id!=='intro';
  $('#namingPage').innerHTML=`<article class="nm-lesson"><header class="nm-head"><div class="nm-kicker">${i===0?'Start here':`Lesson ${i} of ${NM_LESSONS.length-1}`}</div><h1>${esc(l.title)}</h1><p class="nm-lede">${esc(l.lede)}</p></header>
   ${l.sections.map(s=>`<section class="nm-sec"><h2>${esc(s.h)}</h2>${s.html}${s.ex?`<div class="nm-exgrid">${s.ex.map(exCard).join('')}</div>`:''}</section>`).join('')}
   <div class="nm-actions">${topic?`<button class="btn primary" data-quiz-topic="${l.id}">Practise this topic</button>`:`<button class="btn primary" data-quiz-setup="1">Start a quiz</button>`}${next?`<button class="btn" data-lesson="${next.id}">Next: ${esc(next.title)}</button>`:''}</div></article>`;
  renderNamingSide();$('#main').scrollTop=0;$('#side').classList.remove('open');
}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function quizSetup(topics){
  NM.view='setup';const sel=new Set(topics&&topics.length?topics:NM_TOPICS.map(t=>t.id));NM.setupSel=sel;NM.setupStyle=NM.setupStyle||'mix';NM.setupLen=NM.setupLen||10;
  const styles=[['name','Choose the name','Pick the correct name from four options.'],['type','Type the name','Write the name yourself.'],['struct','Choose the structure','Pick the structure that matches a name.'],['mix','Mixed','A mix of all three.']];
  $('#namingPage').innerHTML=`<section class="qz-setup"><header class="nm-head"><div class="nm-kicker">Quiz</div><h1>Test your naming</h1><p class="nm-lede">Choose topics and a question style. Questions you haven't seen or got wrong last time come up first.</p></header>
   <h2 class="qz-h">Topics</h2><div class="qz-chips" id="qzTopics">${NM_TOPICS.map(t=>{const s=topicStats(t.id);return`<button class="qz-chip${sel.has(t.id)?' on':''}" data-topic="${t.id}" aria-pressed="${sel.has(t.id)}"><span>${esc(t.title)}</span><small>${s.m}/${s.n}</small></button>`}).join('')}</div>
   <div class="qz-row"><button class="linkbtn" id="qzAll">Select all</button><button class="linkbtn" id="qzNone">Clear</button></div>
   <h2 class="qz-h">Question style</h2><div class="qz-styles">${styles.map(([v,t,dsc])=>`<label class="qz-style"><input type="radio" name="qzstyle" value="${v}"${NM.setupStyle===v?' checked':''}><span><b>${t}</b><small>${dsc}</small></span></label>`).join('')}</div>
   <h2 class="qz-h">Length</h2><div class="qz-len">${[10,20,0].map(n=>`<label class="qz-lenopt"><input type="radio" name="qzlen" value="${n}"${NM.setupLen===n?' checked':''}><span>${n?n+' questions':'All in topics'}</span></label>`).join('')}</div>
   <div class="nm-actions"><button class="btn primary" id="qzStart">Start quiz</button></div></section>`;
  const sync=()=>{document.querySelectorAll('#qzTopics .qz-chip').forEach(b=>{const on=sel.has(b.dataset.topic);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});$('#qzStart').disabled=!sel.size};
  $('#qzTopics').onclick=e=>{const b=e.target.closest('.qz-chip');if(!b)return;sel.has(b.dataset.topic)?sel.delete(b.dataset.topic):sel.add(b.dataset.topic);sync()};
  $('#qzAll').onclick=()=>{NM_TOPICS.forEach(t=>sel.add(t.id));sync()};$('#qzNone').onclick=()=>{sel.clear();sync()};
  $('#qzStart').onclick=()=>{NM.setupStyle=document.querySelector('input[name="qzstyle"]:checked').value;NM.setupLen=+document.querySelector('input[name="qzlen"]:checked').value;startQuiz({topics:[...sel],style:NM.setupStyle,len:NM.setupLen})};
  sync();renderNamingSide();$('#main').scrollTop=0;$('#side').classList.remove('open');
}
function pickQuestions(pool,len){
  const w=q=>{const r=App.quiz.q[q.id];return!r?0:r.last===0?1:2};
  const groups=[0,1,2].map(k=>shuffle(pool.filter(q=>w(q)===k)));return groups.flat().slice(0,len||pool.length);
}
function invertStereo(s){if(s.includes('@'))return s.replace(/@@|@/g,m=>m==='@@'?'@':'@@');const i=s.search(/[\/\\]/);return i<0?null:s.slice(0,i)+(s[i]==='/'?'\\':'/')+s.slice(i+1)}
function structOptions(q){
  const opts=[q.s],seen=new Set([q.s]);
  if(q.t==='stereo'){const inv=invertStereo(q.s);if(inv&&!seen.has(inv)){opts.push(inv);seen.add(inv)}}
  for(const o of shuffle(NM_BANK.filter(x=>x.t===q.t&&x.id!==q.id)).concat(shuffle(NM_BANK.filter(x=>x.t!==q.t)))){if(opts.length>=4)break;if(!seen.has(o.s)){opts.push(o.s);seen.add(o.s)}}
  return shuffle(opts);
}
function startQuiz(cfg){
  const pool=cfg.ids?cfg.ids.map(id=>NM_BY[id]).filter(Boolean):NM_BANK.filter(q=>cfg.topics.includes(q.t));
  if(!pool.length)return toast('Choose at least one topic.');
  const items=(cfg.ids?shuffle(pool):pickQuestions(pool,cfg.len)).map(q=>{const type=cfg.style==='mix'?['name','type','struct'][Math.floor(Math.random()*3)]:cfg.style;return{q,type,opts:type==='name'?shuffle([q.n,...q.d]):type==='struct'?structOptions(q):null}});
  NM.qz={cfg,items,i:0,score:0,answered:false,results:[]};NM.view='quiz';renderQuestion();
}
const normName=s=>s.toLowerCase().normalize('NFKC').replace(/[\u2010-\u2015\u2212]/g,'-').replace(/\s+/g,' ').trim().replace(/\s*-\s*/g,'-').replace(/\s*,\s*/g,',').replace(/\s*\(\s*/g,'(').replace(/\s*\)\s*/g,')');
const looseName=s=>normName(s).replace(/[\s\-,()\[\]'’]/g,'');
function renderQuestion(){
  const Z=NM.qz,it=Z.items[Z.i],q=it.q,n=Z.items.length,topic=NM_TOPICS.find(t=>t.id===q.t);
  let body='';
  if(it.type==='struct'){body=`<p class="qz-prompt">Which structure is <b class="nm-name">${esc(q.n)}</b>?</p><div class="qz-sopts" role="group" aria-label="Structures">${it.opts.map((s,k)=>`<button class="qz-sopt" data-k="${k}" aria-label="Option ${k+1}"><span class="qz-key">${k+1}</span>${smilesSVG(s,.95)}</button>`).join('')}</div>`}
  else{body=`<p class="qz-prompt">${it.type==='type'?'Type the IUPAC name of this compound.':'What is the IUPAC name of this compound?'}</p><div class="qz-struct">${smilesSVG(q.s,1.3)}<button class="linkbtn nm-3d" data-3d="${esc(q.s)}" data-name="">View in 3D</button></div>`+
    (it.type==='type'?`<form class="qz-type" id="qzForm" autocomplete="off"><input id="qzInput" class="qz-input" spellcheck="false" autocapitalize="off" placeholder="e.g. 2-methylbutan-1-ol" aria-label="Your answer"><button class="btn primary" type="submit">Check</button></form>`
      :`<div class="qz-opts" role="group" aria-label="Answers">${it.opts.map((o,k)=>`<button class="qz-opt" data-k="${k}"><span class="qz-key">${k+1}</span><span class="nm-name">${esc(o)}</span></button>`).join('')}</div>`)}
  $('#namingPage').innerHTML=`<section class="qz"><div class="qz-top"><span><b>Question ${Z.i+1}</b> of ${n}</span><span class="qz-topic">${esc(topic?topic.title:'')}</span><span class="qz-score">Score ${Z.score}</span><button class="linkbtn" id="qzQuit">End quiz</button></div>
    <div class="qz-bar" aria-hidden="true"><i style="width:${Math.round(100*Z.i/n)}%"></i></div><div class="qz-card">${body}<div class="qz-fb" id="qzFb" hidden></div></div></section>`;
  Z.answered=false;
  if(it.type==='type'){$('#qzForm').onsubmit=e=>{e.preventDefault();const v=$('#qzInput').value;if(!v.trim()){toast('Type a name first.');return}gradeTyped(v)};setTimeout(()=>{const x=$('#qzInput');if(x)x.focus()},30)}
  $('#qzQuit').onclick=()=>finishQuiz(true);
  renderNamingSide();$('#main').scrollTop=0;
}
function recordAns(ok){const Z=NM.qz,q=Z.items[Z.i].q,r=App.quiz.q[q.id]||{c:0,w:0};ok?r.c++:r.w++;r.last=ok?1:0;r.at=Date.now();App.quiz.q[q.id]=r;if(ok)Z.score++;Z.results.push({q,ok,type:Z.items[Z.i].type});Z.answered=true;saveQuiz()}
function showFb(ok,head,extra){
  const Z=NM.qz,q=Z.items[Z.i].q,last=Z.i===Z.items.length-1,fb=$('#qzFb');
  fb.className='qz-fb '+(ok?'ok':'bad');fb.hidden=false;
  fb.innerHTML=`<p class="qz-verdict">${head}</p>${extra||''}<p class="qz-why">${esc(q.why)}</p>${q.alt.length?`<p class="qz-alt">Also accepted: ${q.alt.map(a=>`<span class="nm-name">${esc(a)}</span>`).join(', ')}</p>`:''}<div class="qz-next"><button class="btn primary" id="qzNext">${last?'See results':'Next question'}</button><span class="qz-hint">or press Enter</span></div>`;
  $('#qzNext').onclick=nextQuestion;$('.qz-score').textContent='Score '+Z.score;
  fb.scrollIntoView({block:'nearest',behavior:'smooth'});setTimeout(()=>{const b=$('#qzNext');if(b)b.focus({preventScroll:true})},50);
}
function answerOption(k){
  const Z=NM.qz;if(!Z||Z.answered)return;const it=Z.items[Z.i],q=it.q;
  if(it.type==='name'){const ok=it.opts[k]===q.n;document.querySelectorAll('.qz-opt').forEach((b,j)=>{b.disabled=true;if(it.opts[j]===q.n)b.classList.add('right');else if(j===k)b.classList.add('wrong')});recordAns(ok);
    showFb(ok,ok?'Correct.':`Not quite. The answer is <b class="nm-name">${esc(q.n)}</b>.`)}
  else if(it.type==='struct'){const ok=it.opts[k]===q.s;document.querySelectorAll('.qz-sopt').forEach((b,j)=>{b.disabled=true;if(it.opts[j]===q.s)b.classList.add('right');else if(j===k)b.classList.add('wrong')});recordAns(ok);
    showFb(ok,ok?'Correct.':'Not quite. The highlighted structure is the right one.')}
}
function gradeTyped(v){
  const Z=NM.qz;if(Z.answered)return;const q=Z.items[Z.i].q,all=[q.n,...q.alt],nv=normName(v);
  const exact=all.some(a=>normName(a)===nv),loose=!exact&&all.some(a=>looseName(a)===looseName(v)),slip=q.d.find(d=>normName(d)===nv||looseName(d)===looseName(v));
  const ok=exact||loose;$('#qzInput').disabled=true;document.querySelector('#qzForm button').disabled=true;$('#qzInput').classList.add(ok?'right':'wrong');recordAns(ok);
  if(exact)showFb(true,'Correct.');
  else if(loose)showFb(true,`Correct, but check the punctuation: <b class="nm-name">${esc(q.n)}</b>.`);
  else showFb(false,`Not quite. The answer is <b class="nm-name">${esc(q.n)}</b>.`,`<p class="qz-yours">You wrote <span class="nm-name">${esc(v)}</span>${slip?', which is a common slip':''}.</p>`);
}
function nextQuestion(){const Z=NM.qz;if(!Z||!Z.answered)return;if(Z.i>=Z.items.length-1)return finishQuiz(false);Z.i++;renderQuestion()}
function finishQuiz(early){
  const Z=NM.qz;if(!Z)return;
  if(early&&!Z.results.length){NM.qz=null;return quizSetup(Z.cfg.topics)}
  NM.view='summary';const res=Z.results,n=res.length,sc=res.filter(r=>r.ok).length,missed=res.filter(r=>!r.ok);
  const byT={};res.forEach(r=>{const b=byT[r.q.t]=byT[r.q.t]||{ok:0,n:0};b.n++;if(r.ok)b.ok++});
  const pct=n?Math.round(100*sc/n):0,msg=pct===100?'Perfect score.':pct>=80?'Strong work.':pct>=50?'Good progress. Review the ones you missed below.':'Keep going. The lessons cover each rule with examples.';
  $('#namingPage').innerHTML=`<section class="qz-sum"><header class="nm-head"><div class="nm-kicker">Quiz results</div><h1>${sc} out of ${n}</h1><p class="nm-lede">${msg}</p></header>
    <div class="qz-break">${Object.entries(byT).map(([t,b])=>`<div class="qz-brow"><span>${esc((NM_TOPICS.find(x=>x.id===t)||{}).title||t)}</span><span class="nm-meter"><i style="width:${Math.round(100*b.ok/b.n)}%"></i></span><b>${b.ok}/${b.n}</b></div>`).join('')}</div>
    ${missed.length?`<h2 class="qz-h">To review</h2><div class="nm-exgrid">${missed.map(r=>exCard(r.q.id)).join('')}</div>`:''}
    <div class="nm-actions">${missed.length?`<button class="btn primary" id="qzRetry">Retry the ${missed.length} I missed</button>`:''}<button class="btn${missed.length?'':' primary'}" id="qzNew">New quiz</button><button class="btn" data-lesson="${Z.cfg.topics&&Z.cfg.topics.length===1?Z.cfg.topics[0]:'intro'}">Back to lessons</button></div></section>`;
  if(missed.length)$('#qzRetry').onclick=()=>startQuiz({ids:missed.map(r=>r.q.id),style:Z.cfg.style,topics:Z.cfg.topics});
  $('#qzNew').onclick=()=>quizSetup(Z.cfg.topics);
  NM.qz=null;renderNamingSide();$('#main').scrollTop=0;
}
function quizKey(e){
  if(NM.view!=='quiz'||!NM.qz)return false;const Z=NM.qz,it=Z.items[Z.i];
  if(e.key==='Enter'&&Z.answered&&!(e.target&&e.target.id==='qzNext')){e.preventDefault();nextQuestion();return true}
  if(!Z.answered&&it.type!=='type'&&/^[1-4]$/.test(e.key)){answerOption(+e.key-1);return true}
  return false;
}
document.addEventListener('click',e=>{
  const t=e.target.closest('[data-lesson],[data-quiz-topic],[data-quiz-setup],[data-3d],.qz-opt,.qz-sopt,.mode');if(!t)return;
  if(t.classList.contains('mode'))return setMode(t.dataset.mode);
  if(t.dataset.lesson)return openLesson(t.dataset.lesson);
  if(t.dataset.quizTopic)return quizSetup([t.dataset.quizTopic]);
  if(t.dataset.quizSetup)return quizSetup();
  if(t.dataset['3d']!=null)return open3D(smilesToScheme(t.dataset['3d']),t.dataset.name||'3D view');
  if(t.classList.contains('qz-opt')||t.classList.contains('qz-sopt'))return answerOption(+t.dataset.k);
});

/* ---------- templates: groups, rings, protecting groups, amino acids, reagents ---------- */
const TEMPLATES=[{"id":"COOH","cat":"Groups","name":"Carboxylic acid","smi":"*C(=O)O","atoms":[["*",-26.0,14.9,0],["C",0.0,0.0,0],["O",0.1,-30.0,0],["O",25.9,15.1,0]],"bonds":[[0,1,1,0],[1,2,2,0],[1,3,1,0]]},{"id":"CHO","cat":"Groups","name":"Aldehyde","smi":"*C=O","atoms":[["*",26.0,-5.0,0],["C",0.0,10.0,0],["O",-26.0,-5.0,0]],"bonds":[[0,1,1,0],[1,2,2,0]]},{"id":"CO2Me","cat":"Groups","name":"Methyl ester","smi":"*C(=O)OC","atoms":[["*",36.4,14.9,0],["C",10.4,-0.0,0],["O",10.3,-30.0,0],["O",-15.6,15.0,0],["C",-41.6,0.1,0]],"bonds":[[0,1,1,0],[1,2,2,0],[1,3,1,0],[3,4,1,0]]},{"id":"CO2Et","cat":"Groups","name":"Ethyl ester","smi":"*C(=O)OCC","atoms":[["*",47.7,12.4,0],["C",21.6,-2.5,0],["O",21.6,-32.5,0],["O",-4.3,12.5,0],["C",-30.3,-2.4,0],["C",-56.3,12.6,0]],"bonds":[[0,1,1,0],[1,2,2,0],[1,3,1,0],[3,4,1,0],[4,5,1,0]]},{"id":"CONH2","cat":"Groups","name":"Amide","smi":"*C(N)=O","atoms":[["*",-26.0,14.9,0],["C",0.0,0.0,0],["N",25.9,15.1,0],["O",0.1,-30.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,2,0]]},{"id":"Ac","cat":"Groups","name":"Acetyl","smi":"*C(C)=O","atoms":[["*",-26.0,14.9,0],["C",0.0,0.0,0],["C",25.9,15.1,0],["O",0.1,-30.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,2,0]]},{"id":"CN","cat":"Groups","name":"Nitrile","smi":"*C#N","atoms":[["*",-26.0,14.9,0],["C",0.0,-0.0,0],["N",26.0,-14.9,0]],"bonds":[[0,1,1,0],[1,2,3,0]]},{"id":"NO2","cat":"Groups","name":"Nitro","smi":"*[N+](=O)[O-]","atoms":[["*",-26.0,14.9,0],["N",0.0,0.0,1],["O",0.1,-30.0,0],["O",25.9,15.1,-1]],"bonds":[[0,1,1,0],[1,2,2,0],[1,3,1,0]]},{"id":"OH","cat":"Groups","name":"Hydroxyl","smi":"*O","atoms":[["*",-15.0,-0.0,0],["O",15.0,-0.0,0]],"bonds":[[0,1,1,0]]},{"id":"NH2","cat":"Groups","name":"Amino","smi":"*N","atoms":[["*",-15.0,-0.0,0],["N",15.0,-0.0,0]],"bonds":[[0,1,1,0]]},{"id":"OMe","cat":"Groups","name":"Methoxy","smi":"*OC","atoms":[["*",26.0,5.0,0],["O",0.0,-10.0,0],["C",-26.0,5.0,0]],"bonds":[[0,1,1,0],[1,2,1,0]]},{"id":"OAc","cat":"Groups","name":"Acetoxy","smi":"*OC(C)=O","atoms":[["*",20.7,-36.0,0],["O",20.8,-6.0,0],["C",-5.2,9.0,0],["C",-5.1,39.0,0],["O",-31.2,-5.9,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[2,4,2,0]]},{"id":"NHAc","cat":"Groups","name":"Acetamido","smi":"*NC(C)=O","atoms":[["*",20.7,-36.0,0],["N",20.8,-6.0,0],["C",-5.2,9.0,0],["C",-5.1,39.0,0],["O",-31.2,-5.9,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[2,4,2,0]]},{"id":"iPr","cat":"Groups","name":"Isopropyl","smi":"*C(C)C","atoms":[["*",-26.0,14.9,0],["C",0.0,0.0,0],["C",0.1,-30.0,0],["C",25.9,15.1,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,1,0]]},{"id":"tBu","cat":"Groups","name":"tert-Butyl","smi":"*C(C)(C)C","atoms":[["*",15.1,-21.5,0],["C",-0.0,4.4,0],["C",-14.9,-21.7,0],["C",25.9,19.5,0],["C",-26.1,19.3,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,1,0],[1,4,1,0]]},{"id":"Ph","cat":"Groups","name":"Phenyl","smi":"*c1ccccc1","atoms":[["*",-44.6,25.7,0],["C",-18.6,10.7,0],["C",-18.5,-19.3,0],["C",7.5,-34.3,0],["C",33.4,-19.3,0],["C",33.4,10.7,0],["C",7.4,25.7,0]],"bonds":[[0,1,1,0],[1,2,2,0],[2,3,1,0],[3,4,2,0],[4,5,1,0],[5,6,2,0],[6,1,1,0]]},{"id":"Bn","cat":"Groups","name":"Benzyl","smi":"*Cc1ccccc1","atoms":[["*",22.8,-58.1,0],["C",-3.2,-43.1,0],["C",-3.2,-13.1,0],["C",-29.2,1.8,0],["C",-29.3,31.8,0],["C",-3.3,46.9,0],["C",22.7,31.9,0],["C",22.7,1.9,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,2,0],[3,4,1,0],[4,5,2,0],[5,6,1,0],[6,7,2,0],[7,2,1,0]]},{"id":"vinyl","cat":"Groups","name":"Vinyl","smi":"*C=C","atoms":[["*",26.0,-5.0,0],["C",0.0,10.0,0],["C",-26.0,-5.0,0]],"bonds":[[0,1,1,0],[1,2,2,0]]},{"id":"alkyne","cat":"Groups","name":"Ethynyl","smi":"*C#C","atoms":[["*",-26.0,14.9,0],["C",0.0,-0.0,0],["C",26.0,-14.9,0]],"bonds":[[0,1,1,0],[1,2,3,0]]},{"id":"CF3","cat":"Groups","name":"Trifluoromethyl","smi":"*C(F)(F)F","atoms":[["*",-26.0,19.3,0],["C",-0.0,4.4,0],["F",15.1,-21.5,0],["F",-14.9,-21.6,0],["F",25.9,19.5,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,1,0],[1,4,1,0]]},{"id":"SO3H","cat":"Groups","name":"Sulfonic acid","smi":"*S(=O)(=O)O","atoms":[["*",0.0,-30.0,0],["S",0.0,-0.0,0],["O",-30.0,-0.0,0],["O",30.0,-0.0,0],["O",0.0,30.0,0]],"bonds":[[0,1,1,0],[1,2,2,0],[1,3,2,0],[1,4,1,0]]},{"id":"naph","cat":"Rings","name":"Naphthalene","smi":"c1ccc2ccccc2c1","atoms":[["C",-51.9,-15.0,0],["C",-52.0,15.0,0],["C",-26.0,30.0,0],["C",-0.0,15.0,0],["C",26.0,30.0,0],["C",51.9,15.0,0],["C",52.0,-15.0,0],["C",26.0,-30.0,0],["C",0.0,-15.0,0],["C",-26.0,-30.0,0]],"bonds":[[0,1,2,0],[1,2,1,0],[2,3,2,0],[3,4,1,0],[4,5,2,0],[5,6,1,0],[6,7,2,0],[7,8,1,0],[8,9,2,0],[9,0,1,0],[8,3,1,0]]},{"id":"pyr","cat":"Rings","name":"Pyridine","smi":"c1ccncc1","atoms":[["C",26.0,-15.0,0],["C",0.0,-30.0,0],["C",-26.0,-15.0,0],["N",-26.0,15.0,0],["C",-0.0,30.0,0],["C",26.0,15.0,0]],"bonds":[[0,1,2,0],[1,2,1,0],[2,3,2,0],[3,4,1,0],[4,5,2,0],[5,0,1,0]]},{"id":"furan","cat":"Rings","name":"Furan","smi":"c1ccoc1","atoms":[["C",-2.8,-25.4,0],["C",-25.0,-5.2,0],["C",-12.6,22.2,0],["O",17.2,18.9,0],["C",23.3,-10.5,0]],"bonds":[[0,1,1,0],[1,2,2,0],[2,3,1,0],[3,4,1,0],[4,0,2,0]]},{"id":"thio","cat":"Rings","name":"Thiophene","smi":"c1ccsc1","atoms":[["C",-2.8,-25.4,0],["C",-25.0,-5.2,0],["C",-12.6,22.2,0],["S",17.2,18.9,0],["C",23.3,-10.5,0]],"bonds":[[0,1,1,0],[1,2,2,0],[2,3,1,0],[3,4,1,0],[4,0,2,0]]},{"id":"pyrrole","cat":"Rings","name":"Pyrrole","smi":"c1cc[nH]c1","atoms":[["C",-2.8,-25.4,0],["C",-25.0,-5.2,0],["C",-12.6,22.2,0],["N",17.2,18.9,0],["C",23.3,-10.5,0]],"bonds":[[0,1,1,0],[1,2,2,0],[2,3,1,0],[3,4,1,0],[4,0,2,0]]},{"id":"imid","cat":"Rings","name":"Imidazole","smi":"c1c[nH]cn1","atoms":[["C",-25.0,-5.2,0],["C",-12.6,22.2,0],["N",17.2,18.9,0],["C",23.3,-10.5,0],["N",-2.8,-25.4,0]],"bonds":[[0,1,2,0],[1,2,1,0],[2,3,1,0],[3,4,2,0],[4,0,1,0]]},{"id":"indole","cat":"Rings","name":"Indole","smi":"c1ccc2[nH]ccc2c1","atoms":[["C",-46.1,15.0,0],["C",-46.1,-15.0,0],["C",-20.1,-30.0,0],["C",5.9,-15.0,0],["N",34.4,-24.2,0],["C",52.0,0.0,0],["C",34.4,24.3,0],["C",5.8,15.0,0],["C",-20.2,30.0,0]],"bonds":[[0,1,2,0],[1,2,1,0],[2,3,2,0],[3,4,1,0],[4,5,1,0],[5,6,2,0],[6,7,1,0],[7,8,2,0],[8,0,1,0],[7,3,1,0]]},{"id":"quin","cat":"Rings","name":"Quinoline","smi":"c1ccc2ncccc2c1","atoms":[["C",-52.0,-15.0,0],["C",-51.9,15.0,0],["C",-26.0,30.0,0],["C",0.0,15.0,0],["N",26.0,30.0,0],["C",52.0,15.0,0],["C",51.9,-15.0,0],["C",26.0,-30.0,0],["C",-0.0,-15.0,0],["C",-26.0,-30.0,0]],"bonds":[[0,1,2,0],[1,2,1,0],[2,3,2,0],[3,4,1,0],[4,5,2,0],[5,6,1,0],[6,7,2,0],[7,8,1,0],[8,9,2,0],[9,0,1,0],[8,3,1,0]]},{"id":"thf","cat":"Rings","name":"Tetrahydrofuran","smi":"C1CCOC1","atoms":[["C",-2.8,-25.4,0],["C",-25.0,-5.2,0],["C",-12.6,22.2,0],["O",17.2,18.9,0],["C",23.3,-10.5,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,0,1,0]]},{"id":"pip","cat":"Rings","name":"Piperidine","smi":"C1CCNCC1","atoms":[["C",26.0,-15.0,0],["C",0.0,-30.0,0],["C",-26.0,-15.0,0],["N",-26.0,15.0,0],["C",-0.0,30.0,0],["C",26.0,15.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,5,1,0],[5,0,1,0]]},{"id":"morph","cat":"Rings","name":"Morpholine","smi":"C1COCCN1","atoms":[["C",0.0,-30.0,0],["C",-26.0,-15.0,0],["O",-26.0,15.0,0],["C",-0.0,30.0,0],["C",26.0,15.0,0],["N",26.0,-15.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,5,1,0],[5,0,1,0]]},{"id":"cp","cat":"Rings","name":"Cyclopentadiene","smi":"C1=CCC=C1","atoms":[["C",17.2,18.9,0],["C",-12.6,22.2,0],["C",-25.0,-5.2,0],["C",-2.8,-25.4,0],["C",23.3,-10.5,0]],"bonds":[[0,1,2,0],[1,2,1,0],[2,3,1,0],[3,4,2,0],[4,0,1,0]]},{"id":"epox","cat":"Rings","name":"Epoxide","smi":"C1CO1","atoms":[["C",-17.3,0.0,0],["C",8.6,-15.0,0],["O",8.7,15.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,0,1,0]]},{"id":"anth","cat":"Rings","name":"Anthracene","smi":"c1ccc2cc3ccccc3cc2c1","atoms":[["C",-77.9,-15.1,0],["C",-78.0,14.9,0],["C",-52.0,30.0,0],["C",-26.0,15.0,0],["C",-0.0,30.0,0],["C",26.0,15.0,0],["C",51.9,30.0,0],["C",77.9,15.1,0],["C",78.0,-14.9,0],["C",52.0,-30.0,0],["C",26.0,-15.0,0],["C",0.0,-30.0,0],["C",-26.0,-15.0,0],["C",-51.9,-30.0,0]],"bonds":[[0,1,2,0],[1,2,1,0],[2,3,2,0],[3,4,1,0],[4,5,2,0],[5,6,1,0],[6,7,2,0],[7,8,1,0],[8,9,2,0],[9,10,1,0],[10,11,2,0],[11,12,1,0],[12,13,2,0],[13,0,1,0],[12,3,1,0],[10,5,1,0]]},{"id":"Gly","cat":"Amino acids","name":"Glycine","smi":"NCC(=O)O","atoms":[["N",-41.6,0.0,0],["C",-15.6,15.0,0],["C",10.4,-0.0,0],["O",10.4,-30.0,0],["O",36.4,15.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,2,0],[2,4,1,0]],"cip":[]},{"id":"Ala","cat":"Amino acids","name":"Alanine","smi":"C[C@H](N)C(=O)O","atoms":[["C",-13.0,-37.5,0],["C",-13.0,-7.5,0],["N",-39.0,7.5,0],["C",13.0,7.5,0],["O",39.0,-7.5,0],["O",13.0,37.5,0]],"bonds":[[1,0,1,1],[1,2,1,0],[1,3,1,0],[3,4,2,0],[3,5,1,0]],"cip":["S"]},{"id":"Val","cat":"Amino acids","name":"Valine","smi":"CC(C)[C@H](N)C(=O)O","atoms":[["C",-35.6,-39.5,0],["C",-9.7,-24.4,0],["C",16.4,-39.3,0],["C",-9.8,5.6,0],["N",-35.8,20.5,0],["C",16.2,20.7,0],["O",42.2,5.8,0],["O",16.1,50.7,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,1,0],[3,4,1,1],[3,5,1,0],[5,6,2,0],[5,7,1,0]],"cip":["S"]},{"id":"Leu","cat":"Amino acids","name":"Leucine","smi":"CC(C)C[C@H](N)C(=O)O","atoms":[["C",-23.1,-63.3,0],["C",-23.1,-33.3,0],["C",-49.1,-18.3,0],["C",2.9,-18.3,0],["C",2.9,11.7,0],["N",-23.1,26.7,0],["C",28.9,26.6,0],["O",54.9,11.6,0],["O",28.9,56.6,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,1,0],[3,4,1,0],[4,5,1,1],[4,6,1,0],[6,7,2,0],[6,8,1,0]],"cip":["S"]},{"id":"Ile","cat":"Amino acids","name":"Isoleucine","smi":"CC[C@H](C)[C@H](N)C(=O)O","atoms":[["C",-31.8,-61.6,0],["C",-31.8,-31.6,0],["C",-5.8,-16.7,0],["C",20.2,-31.7,0],["C",-5.8,13.3,0],["N",-31.7,28.4,0],["C",20.2,28.3,0],["O",46.2,13.3,0],["O",20.3,58.3,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,2],[2,4,1,0],[4,5,1,1],[4,6,1,0],[6,7,2,0],[6,8,1,0]],"cip":["S","S"]},{"id":"Phe","cat":"Amino acids","name":"Phenylalanine","smi":"N[C@@H](Cc1ccccc1)C(=O)O","atoms":[["N",-6.5,41.3,0],["C",19.5,26.2,0],["C",19.5,-3.8,0],["C",-6.5,-18.7,0],["C",-6.5,-48.7,0],["C",-32.5,-63.7,0],["C",-58.5,-48.7,0],["C",-58.5,-18.7,0],["C",-32.5,-3.7,0],["C",45.5,41.2,0],["O",71.5,26.2,0],["O",45.5,71.2,0]],"bonds":[[1,0,1,1],[1,2,1,0],[2,3,1,0],[3,4,2,0],[4,5,1,0],[5,6,2,0],[6,7,1,0],[7,8,2,0],[1,9,1,0],[9,10,2,0],[9,11,1,0],[8,3,1,0]],"cip":["S"]},{"id":"Tyr","cat":"Amino acids","name":"Tyrosine","smi":"N[C@@H](Cc1ccc(O)cc1)C(=O)O","atoms":[["N",0.0,46.2,0],["C",26.0,31.1,0],["C",26.0,1.1,0],["C",-0.0,-13.8,0],["C",-0.0,-43.9,0],["C",-26.0,-58.8,0],["C",-52.0,-43.8,0],["O",-78.0,-58.8,0],["C",-52.0,-13.8,0],["C",-26.0,1.2,0],["C",52.0,46.1,0],["O",78.0,31.1,0],["O",52.0,76.1,0]],"bonds":[[1,0,1,1],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,5,2,0],[5,6,1,0],[6,7,1,0],[6,8,2,0],[8,9,1,0],[1,10,1,0],[10,11,2,0],[10,12,1,0],[9,3,2,0]],"cip":["S"]},{"id":"Trp","cat":"Amino acids","name":"Tryptophan","smi":"N[C@@H](Cc1c[nH]c2ccccc12)C(=O)O","atoms":[["N",9.4,36.0,0],["C",35.4,21.1,0],["C",35.5,-8.9,0],["C",9.5,-24.0,0],["C",6.5,-53.8,0],["N",-22.9,-60.1,0],["C",-37.9,-34.2,0],["C",-67.3,-28.0,0],["C",-76.6,0.5,0],["C",-56.6,22.9,0],["C",-27.2,16.7,0],["C",-17.9,-11.8,0],["C",61.4,36.2,0],["O",87.4,21.2,0],["O",61.3,66.2,0]],"bonds":[[1,0,1,1],[1,2,1,0],[2,3,1,0],[3,4,2,0],[4,5,1,0],[5,6,1,0],[6,7,2,0],[7,8,1,0],[8,9,2,0],[9,10,1,0],[10,11,2,0],[1,12,1,0],[12,13,2,0],[12,14,1,0],[11,3,1,0],[11,6,1,0]],"cip":["S"]},{"id":"Ser","cat":"Amino acids","name":"Serine","smi":"N[C@@H](CO)C(=O)O","atoms":[["N",-33.4,15.0,0],["C",-7.4,0.0,0],["C",-7.4,-30.0,0],["O",-33.4,-45.0,0],["C",18.6,15.0,0],["O",44.5,-0.0,0],["O",18.6,45.0,0]],"bonds":[[1,0,1,1],[1,2,1,0],[2,3,1,0],[1,4,1,0],[4,5,2,0],[4,6,1,0]],"cip":["S"]},{"id":"Thr","cat":"Amino acids","name":"Threonine","smi":"C[C@@H](O)[C@H](N)C(=O)O","atoms":[["C",-35.8,-39.3,0],["C",-9.8,-24.4,0],["O",16.2,-39.4,0],["C",-9.7,5.6,0],["N",-35.7,20.7,0],["C",16.3,20.6,0],["O",42.2,5.5,0],["O",16.3,50.6,0]],"bonds":[[1,0,1,1],[1,2,1,0],[1,3,1,0],[3,4,1,1],[3,5,1,0],[5,6,2,0],[5,7,1,0]],"cip":["R","S"]},{"id":"Cys","cat":"Amino acids","name":"Cysteine","smi":"N[C@@H](CS)C(=O)O","atoms":[["N",-33.4,15.0,0],["C",-7.4,0.0,0],["C",-7.4,-30.0,0],["S",-33.4,-45.0,0],["C",18.6,15.0,0],["O",44.5,-0.0,0],["O",18.6,45.0,0]],"bonds":[[1,0,1,1],[1,2,1,0],[2,3,1,0],[1,4,1,0],[4,5,2,0],[4,6,1,0]],"cip":["R"]},{"id":"Met","cat":"Amino acids","name":"Methionine","smi":"CSCC[C@H](N)C(=O)O","atoms":[["C",-49.1,-71.6,0],["S",-23.1,-56.6,0],["C",-23.1,-26.6,0],["C",2.9,-11.7,0],["C",2.9,18.3,0],["N",-23.1,33.4,0],["C",28.9,33.3,0],["O",54.9,18.3,0],["O",28.9,63.3,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,5,1,1],[4,6,1,0],[6,7,2,0],[6,8,1,0]],"cip":["S"]},{"id":"Asp","cat":"Amino acids","name":"Aspartic acid","smi":"N[C@@H](CC(=O)O)C(=O)O","atoms":[["N",-23.1,26.7,0],["C",2.9,11.7,0],["C",2.9,-18.3,0],["C",-23.1,-33.3,0],["O",-49.1,-18.3,0],["O",-23.1,-63.3,0],["C",28.9,26.6,0],["O",54.9,11.6,0],["O",28.9,56.6,0]],"bonds":[[1,0,1,1],[1,2,1,0],[2,3,1,0],[3,4,2,0],[3,5,1,0],[1,6,1,0],[6,7,2,0],[6,8,1,0]],"cip":["S"]},{"id":"Glu","cat":"Amino acids","name":"Glutamic acid","smi":"N[C@@H](CCC(=O)O)C(=O)O","atoms":[["N",-23.4,40.5,0],["C",2.6,25.5,0],["C",2.6,-4.5,0],["C",-23.4,-19.5,0],["C",-23.4,-49.5,0],["O",2.5,-64.5,0],["O",-49.4,-64.5,0],["C",28.6,40.5,0],["O",54.6,25.5,0],["O",28.6,70.5,0]],"bonds":[[1,0,1,1],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,5,2,0],[4,6,1,0],[1,7,1,0],[7,8,2,0],[7,9,1,0]],"cip":["S"]},{"id":"Asn","cat":"Amino acids","name":"Asparagine","smi":"NC(=O)C[C@H](N)C(=O)O","atoms":[["N",-23.1,-63.3,0],["C",-23.1,-33.3,0],["O",-49.1,-18.3,0],["C",2.9,-18.3,0],["C",2.9,11.7,0],["N",-23.1,26.7,0],["C",28.9,26.6,0],["O",54.9,11.6,0],["O",28.9,56.6,0]],"bonds":[[0,1,1,0],[1,2,2,0],[1,3,1,0],[3,4,1,0],[4,5,1,1],[4,6,1,0],[6,7,2,0],[6,8,1,0]],"cip":["S"]},{"id":"Gln","cat":"Amino acids","name":"Glutamine","smi":"NC(=O)CC[C@H](N)C(=O)O","atoms":[["N",-49.4,-64.5,0],["C",-23.4,-49.5,0],["O",2.5,-64.5,0],["C",-23.4,-19.5,0],["C",2.6,-4.5,0],["C",2.6,25.5,0],["N",-23.4,40.5,0],["C",28.6,40.5,0],["O",54.6,25.5,0],["O",28.6,70.5,0]],"bonds":[[0,1,1,0],[1,2,2,0],[1,3,1,0],[3,4,1,0],[4,5,1,0],[5,6,1,1],[5,7,1,0],[7,8,2,0],[7,9,1,0]],"cip":["S"]},{"id":"Lys","cat":"Amino acids","name":"Lysine","smi":"NCCCC[C@H](N)C(=O)O","atoms":[["N",-44.2,-91.5,0],["C",-44.2,-61.5,0],["C",-18.2,-46.5,0],["C",-18.2,-16.5,0],["C",7.8,-1.5,0],["C",7.8,28.5,0],["N",-18.2,43.5,0],["C",33.8,43.5,0],["O",59.8,28.5,0],["O",33.8,73.5,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,5,1,0],[5,6,1,1],[5,7,1,0],[7,8,2,0],[7,9,1,0]],"cip":["S"]},{"id":"Arg","cat":"Amino acids","name":"Arginine","smi":"N=C(N)NCCC[C@H](N)C(=O)O","atoms":[["N",-10.9,-88.7,0],["C",-36.9,-73.7,0],["N",-62.9,-88.7,0],["N",-36.8,-43.7,0],["C",-10.8,-28.7,0],["C",-10.8,1.3,0],["C",15.2,16.2,0],["C",15.2,46.2,0],["N",-10.8,61.3,0],["C",41.2,61.2,0],["O",67.2,46.2,0],["O",41.2,91.2,0]],"bonds":[[0,1,2,0],[1,2,1,0],[1,3,1,0],[3,4,1,0],[4,5,1,0],[5,6,1,0],[6,7,1,0],[7,8,1,1],[7,9,1,0],[9,10,2,0],[9,11,1,0]],"cip":["S"]},{"id":"His","cat":"Amino acids","name":"Histidine","smi":"N[C@@H](Cc1c[nH]cn1)C(=O)O","atoms":[["N",-11.4,37.1,0],["C",14.7,22.2,0],["C",14.8,-7.8,0],["C",-11.1,-22.9,0],["C",-38.6,-10.8,0],["N",-58.6,-33.2,0],["C",-43.5,-59.1,0],["N",-14.1,-52.7,0],["C",40.6,37.3,0],["O",66.6,22.4,0],["O",40.5,67.3,0]],"bonds":[[1,0,1,1],[1,2,1,0],[2,3,1,0],[3,4,2,0],[4,5,1,0],[5,6,1,0],[6,7,2,0],[1,8,1,0],[8,9,2,0],[8,10,1,0],[7,3,1,0]],"cip":["S"]},{"id":"Pro","cat":"Amino acids","name":"Proline","smi":"OC(=O)[C@@H]1CCCN1","atoms":[["O",52.7,2.2,0],["C",27.6,-14.1,0],["O",29.1,-44.0,0],["C",0.8,-0.4,0],["C",-3.8,29.2,0],["C",-33.4,33.9,0],["C",-47.1,7.2,0],["N",-25.9,-14.0,0]],"bonds":[[0,1,1,0],[1,2,2,0],[3,1,1,2],[3,4,1,0],[4,5,1,0],[5,6,1,0],[6,7,1,0],[7,3,1,0]],"cip":["S"]},{"id":"NaBH4","cat":"Reagents","name":"NaBH\u2084","smi":"[Na+].[BH4-]","atoms":[["Na",10.0,-0.0,1],["B",-10.0,-0.0,-1]],"bonds":[]},{"id":"LiAlH4","cat":"Reagents","name":"LiAlH\u2084","smi":"[Li+].[AlH4-]","atoms":[["Li",-10.0,-0.0,1],["Al",10.0,-0.0,-1]],"bonds":[]},{"id":"DIBAL","cat":"Reagents","name":"DIBAL-H","smi":"CC(C)C[AlH]CC(C)C","atoms":[["C",-78.0,14.9,0],["C",-52.0,-0.0,0],["C",-51.9,-30.0,0],["C",-26.0,15.0,0],["Al",-0.0,0.0,0],["C",26.0,15.0,0],["C",52.0,0.0,0],["C",77.9,15.1,0],["C",52.0,-30.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,1,0],[3,4,1,0],[4,5,1,0],[5,6,1,0],[6,7,1,0],[6,8,1,0]]},{"id":"LDA","cat":"Reagents","name":"LDA","smi":"[Li+].CC(C)[N-]C(C)C","atoms":[["Li",-0.0,41.3,1],["C",-52.0,11.2,0],["C",-26.0,-3.8,0],["C",-26.0,-33.8,0],["N",-0.0,11.2,-1],["C",26.0,-3.7,0],["C",52.0,11.3,0],["C",26.0,-33.7,0]],"bonds":[[1,2,1,0],[2,3,1,0],[2,4,1,0],[4,5,1,0],[5,6,1,0],[5,7,1,0]]},{"id":"nBuLi","cat":"Reagents","name":"n-BuLi","smi":"CCCC[Li]","atoms":[["C",-52.0,6.0,0],["C",-26.0,-9.0,0],["C",-0.0,6.0,0],["C",26.0,-9.0,0],["Li",52.0,6.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[3,4,1,0]]},{"id":"MeMgBr","cat":"Reagents","name":"MeMgBr","smi":"C[Mg]Br","atoms":[["C",26.0,5.0,0],["Mg",0.0,-10.0,0],["Br",-26.0,5.0,0]],"bonds":[[0,1,1,0],[1,2,1,0]]},{"id":"PhMgBr","cat":"Reagents","name":"PhMgBr","smi":"Br[Mg]c1ccccc1","atoms":[["Br",22.8,-58.1,0],["Mg",-3.2,-43.1,0],["C",-3.2,-13.1,0],["C",-29.2,1.8,0],["C",-29.3,31.8,0],["C",-3.3,46.9,0],["C",22.7,31.9,0],["C",22.7,1.9,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,2,0],[3,4,1,0],[4,5,2,0],[5,6,1,0],[6,7,2,0],[7,2,1,0]]},{"id":"mCPBA","cat":"Reagents","name":"mCPBA","smi":"OOC(=O)c1cccc(Cl)c1","atoms":[["O",-82.6,-15.3,0],["O",-56.7,-0.2,0],["C",-30.7,-15.1,0],["O",-30.5,-45.1,0],["C",-4.7,-0.0,0],["C",-4.8,30.0,0],["C",21.1,45.1,0],["C",47.1,30.2,0],["C",47.2,0.2,0],["Cl",73.3,-14.7,0],["C",21.3,-14.9,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,2,0],[2,4,1,0],[4,5,2,0],[5,6,1,0],[6,7,2,0],[7,8,1,0],[8,9,1,0],[8,10,2,0],[10,4,1,0]]},{"id":"PCC","cat":"Reagents","name":"PCC","smi":"[O-][Cr](=O)(=O)Cl.c1cc[nH+]cc1","atoms":[["O",-61.8,29.2,-1],["Cr",-46.9,3.2,0],["O",-20.9,-11.9,0],["O",-72.9,-11.7,0],["Cl",-31.8,29.1,0],["C",65.1,-21.3,0],["C",39.1,-36.3,0],["C",13.1,-21.3,0],["N",13.1,8.7,1],["C",39.0,23.7,0],["C",65.0,8.7,0]],"bonds":[[0,1,1,0],[1,2,2,0],[1,3,2,0],[1,4,1,0],[5,6,2,0],[6,7,1,0],[7,8,2,0],[8,9,1,0],[9,10,2,0],[10,5,1,0]]},{"id":"OsO4","cat":"Reagents","name":"OsO\u2084","smi":"O=[Os](=O)(=O)=O","atoms":[["O",-14.9,-21.6,0],["Os",-0.0,4.4,0],["O",15.1,-21.5,0],["O",-26.0,19.3,0],["O",25.9,19.5,0]],"bonds":[[0,1,2,0],[1,2,2,0],[1,3,2,0],[1,4,2,0]]},{"id":"KMnO4","cat":"Reagents","name":"KMnO\u2084","smi":"[K+].[O-][Mn](=O)(=O)=O","atoms":[["K",-37.5,18.0,1],["O",-7.5,18.0,-1],["Mn",7.5,-8.0,0],["O",22.6,17.9,0],["O",-18.5,-22.9,0],["O",33.4,-23.1,0]],"bonds":[[1,2,1,0],[2,3,2,0],[2,4,2,0],[2,5,2,0]]},{"id":"NBS","cat":"Reagents","name":"NBS","smi":"O=C1CCC(=O)N1Br","atoms":[["O",-43.0,31.2,0],["C",-15.7,18.8,0],["C",10.4,33.7,0],["C",32.5,13.5,0],["C",20.2,-13.9,0],["O",35.1,-39.9,0],["N",-9.6,-10.6,0],["Br",-29.8,-32.8,0]],"bonds":[[0,1,2,0],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,5,2,0],[4,6,1,0],[6,7,1,0],[6,1,1,0]]},{"id":"TsCl","cat":"Reagents","name":"TsCl","smi":"Cc1ccc(S(=O)(=O)Cl)cc1","atoms":[["C",-68.7,39.1,0],["C",-42.7,24.3,0],["C",-42.5,-5.7,0],["C",-16.4,-20.6,0],["C",9.5,-5.4,0],["S",35.6,-20.2,0],["O",20.7,-46.3,0],["O",50.4,5.8,0],["Cl",61.6,-35.1,0],["C",9.3,24.6,0],["C",-16.8,39.4,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,2,0],[3,4,1,0],[4,5,1,0],[5,6,2,0],[5,7,2,0],[5,8,1,0],[4,9,2,0],[9,10,1,0],[10,1,2,0]]},{"id":"DCC","cat":"Reagents","name":"DCC","smi":"C1CCC(CC1)N=C=NC1CCCCC1","atoms":[["C",46.9,-68.9,0],["C",72.9,-53.9,0],["C",72.8,-23.9,0],["C",46.8,-8.9,0],["C",20.8,-24.0,0],["C",20.9,-54.0,0],["N",46.7,21.1,0],["C",20.7,36.0,0],["N",-5.3,51.0,0],["C",-31.2,35.9,0],["C",-31.2,5.9,0],["C",-57.1,-9.1,0],["C",-83.1,5.8,0],["C",-83.2,35.8,0],["C",-57.3,50.9,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[3,4,1,0],[4,5,1,0],[3,6,1,0],[6,7,2,0],[7,8,2,0],[8,9,1,0],[9,10,1,0],[10,11,1,0],[11,12,1,0],[12,13,1,0],[13,14,1,0],[5,0,1,0],[14,9,1,0]]},{"id":"Et3N","cat":"Reagents","name":"Et\u2083N","smi":"CCN(CC)CC","atoms":[["C",33.3,-45.1,0],["C",33.4,-15.1,0],["N",7.4,-0.0,0],["C",-18.6,-15.0,0],["C",-44.5,0.1,0],["C",7.5,30.0,0],["C",-18.5,45.0,0]],"bonds":[[0,1,1,0],[1,2,1,0],[2,3,1,0],[3,4,1,0],[2,5,1,0],[5,6,1,0]]},{"id":"DMAP","cat":"Reagents","name":"DMAP","smi":"CN(C)c1ccncc1","atoms":[["C",-26.1,51.6,0],["N",-0.1,36.7,0],["C",25.9,51.7,0],["C",-0.0,6.7,0],["C",26.0,-8.3,0],["C",26.1,-38.3,0],["N",0.1,-53.3,0],["C",-25.9,-38.4,0],["C",-26.0,-8.4,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,1,0],[3,4,1,0],[4,5,2,0],[5,6,1,0],[6,7,2,0],[7,8,1,0],[8,3,2,0]]},{"id":"NaH","cat":"Reagents","name":"NaH","smi":"[Na+].[H-]","atoms":[["Na",10.0,-0.0,1],["H",-10.0,-0.0,-1]],"bonds":[]},{"id":"Boc2O","cat":"Reagents","name":"Boc\u2082O","smi":"CC(C)(C)OC(=O)OC(=O)OC(C)(C)C","atoms":[["C",63.0,-20.0,0],["C",77.9,6.0,0],["C",93.0,-20.0,0],["C",103.9,21.0,0],["O",51.9,21.0,0],["C",26.0,5.9,0],["O",26.0,-24.1,0],["O",-0.0,20.9,0],["C",-26.0,5.9,0],["O",-26.0,-24.1,0],["O",-52.0,20.9,0],["C",-77.9,5.9,0],["C",-62.9,-20.1,0],["C",-92.9,-20.1,0],["C",-103.9,20.8,0]],"bonds":[[0,1,1,0],[1,2,1,0],[1,3,1,0],[1,4,1,0],[4,5,1,0],[5,6,2,0],[5,7,1,0],[7,8,1,0],[8,9,2,0],[8,10,1,0],[10,11,1,0],[11,12,1,0],[11,13,1,0],[11,14,1,0]]},{"id":"pg-Boc","cat":"Protecting groups","name":"tert-Butoxycarbonyl","label":"Boc"},{"id":"pg-Cbz","cat":"Protecting groups","name":"Benzyloxycarbonyl","label":"Cbz"},{"id":"pg-Fmoc","cat":"Protecting groups","name":"Fluorenylmethoxycarbonyl","label":"Fmoc"},{"id":"pg-Bn","cat":"Protecting groups","name":"Benzyl","label":"Bn"},{"id":"pg-PMB","cat":"Protecting groups","name":"p-Methoxybenzyl","label":"PMB"},{"id":"pg-Ac","cat":"Protecting groups","name":"Acetyl","label":"Ac"},{"id":"pg-Bz","cat":"Protecting groups","name":"Benzoyl","label":"Bz"},{"id":"pg-Piv","cat":"Protecting groups","name":"Pivaloyl","label":"Piv"},{"id":"pg-TMS","cat":"Protecting groups","name":"Trimethylsilyl","label":"TMS"},{"id":"pg-TBS","cat":"Protecting groups","name":"tert-Butyldimethylsilyl","label":"TBS"},{"id":"pg-TIPS","cat":"Protecting groups","name":"Triisopropylsilyl","label":"TIPS"},{"id":"pg-TBDPS","cat":"Protecting groups","name":"tert-Butyldiphenylsilyl","label":"TBDPS"},{"id":"pg-MOM","cat":"Protecting groups","name":"Methoxymethyl","label":"MOM"},{"id":"pg-THP","cat":"Protecting groups","name":"Tetrahydropyranyl","label":"THP"},{"id":"pg-Tr","cat":"Protecting groups","name":"Trityl","label":"Tr"},{"id":"pg-Ts","cat":"Protecting groups","name":"Tosyl","label":"Ts"},{"id":"pg-Ms","cat":"Protecting groups","name":"Mesyl","label":"Ms"},{"id":"pg-Tf","cat":"Protecting groups","name":"Triflyl","label":"Tf"}];
const TPL_BY=Object.fromEntries(TEMPLATES.map(t=>[t.id,t]));
const TPL_CATS=['Groups','Rings','Protecting groups','Amino acids','Reagents'];
function tplScheme(t){
  if(t.label){const d=emptyScheme(80);addAtom(d,0,0,t.label);return d}
  const d=emptyScheme(200),ids=t.atoms.map(([el,x,y,c])=>{const a=addAtom(d,x,y,el);if(c)a.charge=c;return a});
  t.bonds.forEach(([a,b,o,st])=>{const bd=addBond(d,ids[a],ids[b],o);if(st)bd.stereo=st===1?'wedge':'hash'});
  return d;
}
const _tplSvg=new Map();
function tplPreview(t){
  if(_tplSvg.has(t.id))return _tplSvg.get(t.id);
  let svg;
  if(t.label)svg=`<span class="tpl-label">${esc(t.label)}</span>`;
  else{const d=tplScheme(t);d.atoms.filter(a=>a.el==='*').forEach(a=>{a.el='R';a.show=true});svg=structSVG(d,.55,'tpl-svg')}
  _tplSvg.set(t.id,svg);return svg;
}
Editor.prototype.placeTemplate=function(id,hit,p){
  const t=TPL_BY[id];if(!t)return;const d=this.d;
  const target=hit&&hit.type==='atom'?hit.obj:null;
  this.snap();
  if(t.label){
    if(target){const ang=bestAngle(d,target),a=addAtom(d,target.x+L*Math.cos(ang),target.y+L*Math.sin(ang),t.label);addBond(d,target,a,1)}
    else addAtom(d,p.x,p.y,t.label);
    return this.changed();
  }
  const src=tplScheme(t),star=src.atoms.find(a=>a.el==='*');
  let pts=src.atoms.map(a=>({x:a.x,y:a.y}));
  let attach=null;
  if(star&&target){
    const nbA=nbrs(src,star.id)[0];
    const ang=bestAngle(d,target),v=Math.atan2(nbA.y-star.y,nbA.x-star.x),th=ang-v;
    const place=(mirror)=>src.atoms.map(a=>{let x=a.x-star.x,y=a.y-star.y;if(mirror){const c=Math.cos(2*v),s=Math.sin(2*v);[x,y]=[x*c+y*s,x*s-y*c]}return{x:target.x+x*Math.cos(th)-y*Math.sin(th),y:target.y+x*Math.sin(th)+y*Math.cos(th)}});
    const clash=P=>P.reduce((s,q,i)=>src.atoms[i]===star?s:s+d.atoms.filter(o=>Math.hypot(o.x-q.x,o.y-q.y)<22).length,0);
    const A=place(false),B=place(true);pts=clash(B)<clash(A)?B:A;attach=nbA;
  }else{
    const keep=src.atoms.filter(a=>a!==star),cx=keep.reduce((s,a)=>s+a.x,0)/keep.length,cy=keep.reduce((s,a)=>s+a.y,0)/keep.length;
    pts=src.atoms.map(a=>({x:a.x-cx+p.x,y:a.y-cy+p.y}));
  }
  const map=new Map();
  src.atoms.forEach((a,i)=>{if(a===star)return;const na=addAtom(d,pts[i].x,pts[i].y,a.el);if(a.charge)na.charge=a.charge;map.set(a.id,na)});
  src.bonds.forEach(b=>{const A=map.get(b.a),B=map.get(b.b);if(!A||!B)return;const nb=addBond(d,A,B,b.order);if(b.stereo){nb.stereo=b.stereo;nb.a=A.id;nb.b=B.id}});
  if(attach&&target)addBond(d,target,map.get(attach.id),1);
  // grow the canvas if the template went past the bottom edge
  const maxY=Math.max(...[...map.values()].map(a=>a.y));if(maxY>d.h-20)d.h=Math.min(1200,Math.ceil(maxY+30));
  this.changed();
};

/* ---------- analysis UI: molecule info, R/S labels, name ⇄ structure, templates ---------- */
const ONLINE_LOOKUP=true;
const _anCache=new Map();
function compKey(d,ids){
  const S=new Set(ids),a0=getAtom(d,ids[0]);
  return ids.map(id=>{const a=getAtom(d,id);return a.el+(a.charge||'')+':'+Math.round(a.x-a0.x)+','+Math.round(a.y-a0.y)}).join('|')+'#'+d.bonds.filter(b=>S.has(b.a)).map(b=>ids.indexOf(b.a)+'-'+ids.indexOf(b.b)+':'+b.order+(b.stereo||'')).join('|');
}
function analyseCached(d){
  const comps=molComponents(d),out=[];
  for(const comp of comps){
    const k=compKey(d,comp.ids);let r=_anCache.get(k);
    if(!r){const tmp={atoms:comp.ids.map(id=>getAtom(d,id)),bonds:d.bonds,arrows:[],curls:[],texts:[]};try{r=analyseDrawing(tmp)[0]}catch(e){console.warn(e);r=null}if(_anCache.size>300)_anCache.clear();_anCache.set(k,r)}
    if(r)out.push(Object.assign({},r,{comp}));
  }
  return out;
}
/* R/S and E/Z labels drawn into the structure (screen, PNG and PDF) */
function cipLabelsSVG(d,P){
  let s='';const col=P===THEME?'var(--accent2)':PRINT.a2;
  let res;try{res=analyseCached(d)}catch(e){return''}
  for(const r of res){
    const m=r.m;
    for(const c of r.cip.centres){if(!c.label)continue;const a=m.atoms[c.atom];if(!a||!a.src)continue;const A=getAtom(d,a.src);if(!A)continue;
      const occ=nbrs(d,A.id).map(n=>Math.atan2(n.y-A.y,n.x-A.x)),[ang]=freeAngles(occ,1),x=A.x+15*Math.cos(ang),y=A.y+15*Math.sin(ang)+4;
      s+=`<text x="${f(x)}" y="${f(y)}" text-anchor="middle" style="fill:${col};font-size:10.5px;font-style:italic;font-weight:700;font-family:${P.font}">(${c.label})</text>`}
    for(const x of r.cip.dbs){if(!x.label)continue;const b=m.bonds[x.bond];if(!b||!b.src)continue;const B=d.bonds.find(q=>q.id===b.src);if(!B)continue;const A1=getAtom(d,B.a),A2=getAtom(d,B.b);
      const mx=(A1.x+A2.x)/2,my=(A1.y+A2.y)/2,l=Math.hypot(A2.x-A1.x,A2.y-A1.y)||1,nx=-(A2.y-A1.y)/l,ny=(A2.x-A1.x)/l;
      const side=nbrs(d,A1.id).concat(nbrs(d,A2.id)).reduce((t,q)=>t+Math.sign((q.x-mx)*nx+(q.y-my)*ny),0)>0?-1:1;
      s+=`<text x="${f(mx+nx*13*side)}" y="${f(my+ny*13*side+4)}" text-anchor="middle" style="fill:${col};font-size:10.5px;font-style:italic;font-weight:700;font-family:${P.font}">(${x.label})</text>`}
  }
  return s;
}
/* info panel under a drawing */
Editor.prototype.describe=function(){try{const res=analyseCached(this.d).filter(r=>r.m.atoms.length),names=res.map(r=>r.name?r.name.name:r.formula.text);const arrows=this.d.arrows.length;this.svg.setAttribute('aria-label',names.length?`Drawing of ${names.join(', ')}${arrows?`, with ${arrows} reaction arrow${arrows>1?'s':''}`:''}`:'Empty drawing')}catch(e){}};
Editor.prototype.updateInfo=function(){
  const el=this.info;if(!el)return;
  if(!this.d.info){el.hidden=true;return}
  el.hidden=false;
  const res=analyseCached(this.d).filter(r=>r.m.atoms.length);
  if(!res.length){el.innerHTML='<p class="mi-empty">Draw a molecule to see its name, formula and molar mass.</p>';return}
  el.innerHTML=res.map((r,k)=>{
    const F=r.formula,nm=r.name;
    const warn=r.issues.filter(i=>i.kind==='valence').map(i=>`<li class="mi-warn">${esc(i.msg)}</li>`).join('')+r.issues.filter(i=>i.kind!=='valence').map(i=>`<li class="mi-note">${esc(i.msg)}</li>`).join('');
    const notes=(nm?nm.notes:[]).map(n=>`<li class="mi-note">${esc(n)}</li>`).join('')+(nm&&r.undefStereo&&!r.cip.centres.some(c=>c.label)?`<li class="mi-note">${r.undefStereo>1?'There are stereocentres':'There\'s a stereocentre'} with no wedge or hash, so R/S isn't specified.</li>`:'');
    const nameHTML=nm?`<b class="mi-name">${esc(nm.name)}</b>${nm.common?`<span class="mi-common">also called ${esc(nm.common)}</span>`:''}`:`<span class="mi-noname">${esc(r.nameErr||'')}</span>`;
    return`<div class="mi-row" data-k="${k}"><div class="mi-head">${res.length>1?`<span class="mi-num">${k+1}</span>`:''}<div class="mi-namebox">${nameHTML}</div>
      <div class="mi-btns">${nm?`<button class="linkbtn" data-mi="copy">Copy name</button><button class="linkbtn" data-mi="label">Add name to drawing</button>`:''}${!r.formula.pseudo.length?`<button class="linkbtn" data-mi="spec" aria-pressed="${!!(this._spec&&this._spec.has(k))}">${this._spec&&this._spec.has(k)?'Hide spectra':'Predict spectra'}</button>`:''}${ONLINE_LOOKUP&&r.smiles&&!r.formula.pseudo.length?`<button class="linkbtn" data-mi="pubchem">${nm?'Check in PubChem':'Look up in PubChem'}</button>`:''}</div></div>
      <div class="mi-facts"><span><i>Formula</i> ${fmtFormulaHTML(F)}</span>${F.mass!=null?`<span><i>Molar mass</i> ${F.mass.toFixed(2)} g/mol</span>`:''}${F.dbe!=null&&F.dbe>=0&&Number.isInteger(F.dbe)?`<span><i>Degrees of unsaturation</i> ${F.dbe}</span>`:''}</div>
      ${warn||notes?`<ul class="mi-list">${warn}${notes}</ul>`:''}<div class="mi-pc" hidden></div>${this._spec&&this._spec.has(k)?`<div class="mi-spec">${spectraHTML(r)}</div>`:''}</div>`;
  }).join('');
  el.onclick=e=>{const b=e.target.closest('[data-mi]');if(!b)return;const k=+b.closest('.mi-row').dataset.k,r=res[k];
    if(b.dataset.mi==='copy'){const t=r.name.name;(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(()=>toast('Name copied'),()=>{const rg=document.createRange();rg.selectNodeContents(b.closest('.mi-row').querySelector('.mi-name'));const sl=getSelection();sl.removeAllRanges();sl.addRange(rg);toast('Press Ctrl+C to copy the selected name')})}
    if(b.dataset.mi==='label'){this.snap();const c=r.comp,txt=r.name.name,w=textW(txt,FS);this.d.texts.push({id:uid(),x:f((c.x0+c.x1)/2-w/2),y:f(c.y1+30),text:txt});if(c.y1+40>this.d.h)this.d.h=Math.min(1200,Math.ceil(c.y1+50));this.changed()}
    if(b.dataset.mi==='spec'){this._spec=this._spec||new Set();this._spec.has(k)?this._spec.delete(k):this._spec.add(k);this.updateInfo();return}
    if(b.dataset.mi==='pubchem')pubchemName(r,b.closest('.mi-row').querySelector('.mi-pc'));
  };
};
async function pubchemName(r,box){
  box.hidden=false;box.textContent='Looking this up in PubChem…';
  try{
    const res=await fetch('https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/property/IUPACName,Title/JSON',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:'smiles='+encodeURIComponent(r.smiles)});
    if(!res.ok)throw new Error('http');const js=await res.json(),p=js.PropertyTable&&js.PropertyTable.Properties&&js.PropertyTable.Properties[0];
    if(!p||!p.CID||(!p.IUPACName&&!p.Title)){box.textContent='PubChem doesn\'t have this compound.';return}
    const cid=Math.floor(Number(p.CID))||0;box.innerHTML=`<span class="mi-pcl">PubChem</span> ${p.IUPACName?`<b>${esc(String(p.IUPACName))}</b>`:''}${p.Title&&String(p.Title).toLowerCase()!==String(p.IUPACName||'').toLowerCase()?` <span class="mi-common">(${esc(String(p.Title))})</span>`:''}${cid?` <a href="https://pubchem.ncbi.nlm.nih.gov/compound/${cid}" target="_blank" rel="noopener noreferrer">Open</a>`:''}`;
  }catch(e){box.textContent=navigator.onLine===false?'You\'re offline. Connect to the internet to search PubChem.':'Couldn\'t reach PubChem. Try again later.'}
}
/* name → structure dialog */
let nmT=null,nmLast=null;
function openNameDialog(){
  if(!App.active){toast('Click a drawing first, or add one with “Add drawing”.');return}
  $('#nameScrim').hidden=false;const inp=$('#nameIn');inp.value='';nmLast=null;$('#namePrev').innerHTML='<p class="np-hint">Try <button class="linkbtn" data-ex="4-methylpentan-2-one">4-methylpentan-2-one</button>, <button class="linkbtn" data-ex="(E)-but-2-enal">(E)-but-2-enal</button> or <button class="linkbtn" data-ex="aspirin">aspirin</button>.</p>';$('#nameErr').textContent='';$('#nameIns').disabled=true;$('#namePC').hidden=true;setTimeout(()=>inp.focus(),30);
}
function closeNameDialog(){$('#nameScrim').hidden=true;clearTimeout(nmT)}
function namePreview(){
  const v=$('#nameIn').value.trim();nmLast=null;$('#nameIns').disabled=true;$('#nameErr').textContent='';$('#namePC').hidden=true;
  if(!v){$('#namePrev').innerHTML='';return}
  try{const r=nameToScheme(v);nmLast={scheme:r.scheme,name:v};$('#namePrev').innerHTML=structSVG(r.scheme,1.05,'np-svg');$('#nameIns').disabled=false}
  catch(e){if(!e.np)console.warn(e);$('#namePrev').innerHTML='';$('#nameErr').textContent=(e.np&&e.message)?e.message:'Bondline doesn\'t recognise that name. Check the spelling and locants, or try the systematic name.';if(ONLINE_LOOKUP)$('#namePC').hidden=false}
}
async function namePubchem(){
  const v=$('#nameIn').value.trim();if(!v)return;$('#nameErr').textContent='Searching PubChem…';
  try{
    let smi=null;for(const prop of['SMILES','IsomericSMILES']){const r=await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(v)}/property/${prop}/JSON`);if(r.status===404){break}if(!r.ok)continue;const js=await r.json();const p=js.PropertyTable&&js.PropertyTable.Properties[0];smi=p&&(p[prop]||p.SMILES||p.IsomericSMILES);if(smi)break}
    if(!smi){$('#nameErr').textContent='PubChem doesn\'t recognise that name either. Check the spelling.';return}
    if(typeof smi!=='string'||smi.length>2000)throw new Error('bad');const sc=smilesToScheme(smi);if(sc.atoms.length>400)throw new Error('big');nmLast={scheme:sc,name:v};$('#namePrev').innerHTML=structSVG(sc,1.05,'np-svg');$('#nameErr').textContent='Found in PubChem.';$('#nameIns').disabled=false;$('#namePC').hidden=true;
  }catch(e){$('#nameErr').textContent=navigator.onLine===false?'You\'re offline. Connect to the internet to search PubChem.':'Couldn\'t reach PubChem. Try again later.'}
}
function insertNamed(){
  const ed=App.active;if(!ed||!nmLast)return;const src=nmLast.scheme,d=ed.d;
  ed.snap();
  const bb=bbox(d),sb=bbox(src),need=sb.h+($('#nameAddLabel').checked?30:0);
  let cy=bb?bb.y+bb.h/2:d.h/2;cy=Math.max(cy,sb.h/2+18);if(cy+need-sb.h/2>d.h-14)d.h=Math.min(1200,Math.ceil(cy+need-sb.h/2+24));
  const dx=(bb?bb.x+bb.w+50:60)-sb.x,dy=cy-(sb.y+sb.h/2);
  const map=new Map();src.atoms.forEach(a=>{const na=addAtom(d,a.x+dx,a.y+dy,a.el);if(a.charge)na.charge=a.charge;map.set(a.id,na)});
  src.bonds.forEach(b=>{const nb=addBond(d,map.get(b.a),map.get(b.b),b.order);if(b.stereo){nb.stereo=b.stereo}});
  if($('#nameAddLabel').checked){const w=textW(nmLast.name,FS);d.texts.push({id:uid(),x:f(sb.x+dx+sb.w/2-w/2),y:f(sb.y+dy+sb.h+22),text:nmLast.name})}
  const nb2=bbox(d);if(nb2){if(nb2.x+nb2.w>W-10){const sx=Math.min(0,W-20-(nb2.x+nb2.w));if(sx){/* shift everything left */const all=d.atoms;all.forEach(a=>a.x=f(a.x+sx));d.texts.forEach(t=>t.x=f(t.x+sx));d.arrows.forEach(a=>{a.x1=f(a.x1+sx);a.x2=f(a.x2+sx)})}}if(nb2.y+nb2.h>d.h-10)d.h=Math.min(1200,Math.ceil(nb2.y+nb2.h+30))}
  ed.changed();closeNameDialog();toast('Structure added');
}
/* template picker */
let tplCat='Groups';
function openTplPicker(){
  const pk=$('#tplPick');if(!pk.hidden){pk.hidden=true;return}
  renderTplPicker();pk.hidden=false;
}
function renderTplPicker(){
  const pk=$('#tplPick');
  pk.innerHTML=`<div class="tp-tabs" role="tablist">${TPL_CATS.map(c=>`<button class="tp-tab${c===tplCat?' on':''}" data-cat="${esc(c)}" role="tab" aria-selected="${c===tplCat}">${esc(c)}</button>`).join('')}</div>
   <p class="tp-help">${tplCat==='Groups'||tplCat==='Protecting groups'?'Pick one, then click an atom to attach it.':'Pick one, then click empty space to place it. Rings can also be attached to an atom.'}</p>
   <div class="tp-grid">${TEMPLATES.filter(t=>t.cat===tplCat).map(t=>`<button class="tp-item${App.tool==='tpl:'+t.id?' on':''}" data-tpl="${esc(t.id)}" title="${esc(t.name)}"><span class="tp-art">${tplPreview(t)}</span><span class="tp-name">${esc(t.name)}</span></button>`).join('')}</div>
   <div class="tp-foot"><button class="linkbtn" id="tpClose">Close</button></div>`;
}
document.addEventListener('click',e=>{
  const pk=$('#tplPick');if(!pk||pk.hidden)return;
  const tab=e.target.closest('.tp-tab');if(tab){tplCat=tab.dataset.cat;renderTplPicker();return}
  const it=e.target.closest('.tp-item');if(it){setTool('tpl:'+it.dataset.tpl);pk.hidden=true;return}
  if(e.target.closest('#tpClose')){pk.hidden=true;return}
  if(!e.target.closest('#tplPick')&&!e.target.closest('[data-act="tpl"]'))pk.hidden=true;
});

/* ---------- home page ---------- */
function noteSnippet(n){for(const b of n.blocks)if(b.type==='text'){const t=plain(sanitize(b.html).replace(/<\/(p|div|h[123]|li|blockquote|pre)>/g,' ').replace(/<br>/g,' ')).replace(/\\ce\{([^{}]*)\}/g,'$1').replace(/\s+/g,' ').trim();if(t)return t.slice(0,160)}return''}
function noteThumb(n){const s=n.blocks.find(b=>b.type==='scheme'&&b.data.atoms.length);if(s){const svg=schemeSVG(s.data,false);if(svg)return svg.replace(/#111111/g,'currentColor').replace(/ width="\d+" height="\d+"/,'')}
  const k=n.blocks.find(b=>b.type==='sketch'&&b.data.strokes.length);if(k){const h=sketchBounds(k.data);return`<svg viewBox="0 0 ${SKW} ${h}" preserveAspectRatio="xMidYMin meet">${k.data.strokes.map(s=>strokeSVG(s,skScreenCol)).join('')}</svg>`}const im=n.blocks.find(b=>b.type==='image'&&b.data.src);if(im)return`<img src="${im.data.src}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`;return''}
function noteCard(n,big){const th=noteThumb(n),sn=noteSnippet(n),k=n.blocks.filter(b=>b.type==='scheme').length,sk=n.blocks.some(b=>b.type==='sketch');
  return`<button class="hm-card${big?' big':''}" data-open="${esc(n.id)}"><span class="hm-th${th?'':' none'}" aria-hidden="true">${th||(sk?'✎':'⬡')}</span><span class="hm-cb"><span class="hm-ct">${esc(n.title||'Untitled note')}</span><span class="hm-cm">${n.tag?`<span class="tag">${esc(n.tag)}</span>`:''}<span>${fmtDate(n.updated)}</span>${k?`<span>${k} drawing${k>1?'s':''}</span>`:''}${sk?'<span>sketch</span>':''}</span>${sn?`<span class="hm-cs">${esc(sn)}</span>`:''}</span></button>`}
const TIPS=['Type <code>$\\ce{H2SO4}$</code> in a note to write a formula with proper subscripts.','Type <code>## </code> at the start of a line to make a heading.','Hover an atom and press <kbd>N</kbd> to turn it into nitrogen.','Press <kbd>D</kbd> with a drawing selected to see it in 3D.','Select text and choose ▣ Box to make a “Key idea” or “Definition” callout.','On a tablet, a stylus draws in sketches while your finger scrolls.','The C<sub>x</sub>H<sub>y</sub> button names every molecule in a drawing.','Press <kbd>?</kbd> anywhere for drawing shortcuts.'];
function greet(){const h=new Date().getHours();return h<5?'Working late':h<12?'Good morning':h<18?'Good afternoon':'Good evening'}
function renderHome(){
  const notes=[...App.notes].sort((a,b)=>b.updated-a.updated),own=notes.filter(n=>!n.example),last=own[0]||null;
  const rest=notes.filter(n=>n!==last).slice(0,3);
  const tags={};for(const n of notes)for(const t of noteTags(n))tags[t]=(tags[t]||0)+1;
  const drawings=notes.reduce((s,n)=>s+n.blocks.filter(b=>b.type==='scheme').length,0),sketches=notes.reduce((s,n)=>s+n.blocks.filter(b=>b.type==='sketch').length,0);
  const eqs=notes.reduce((s,n)=>s+n.blocks.reduce((t,b)=>t+(b.type==='text'?((b.html||'').match(/data-tex=/g)||[]).length:0),0),0);
  const topics=NM_LESSONS.filter(l=>l.id!=='intro').map(l=>({l,s:topicStats(l.id)})),mast=topics.reduce((a,t)=>a+t.s.m,0),tot=topics.reduce((a,t)=>a+t.s.n,0);
  const ds=allDecks();let due=0,nw=0;ds.forEach(x=>{const st=deckStats(x.d);due+=st.due;nw+=st.nw});
  const tip=TIPS[Math.floor(Date.now()/86400000)%TIPS.length];
  const act=(id,ic,t,c)=>`<button class="hm-act${c?' '+c:''}" data-go="${id}"><span class="hm-ai" aria-hidden="true">${ic}</span><b>${t}</b></button>`;
  const lead=last?`<section class="hm-sec"><h2>Continue where you left off</h2>${noteCard(last,true)}</section>`
    :`<section class="hm-sec"><h2>Get started</h2><div class="hm-first"><h3>Start your first note</h3><p>Write, add a drawing and sketch out a mechanism, all on one page. Have a look at an example first if you like.</p><div class="hm-fbtns"><button class="btn primary" data-go="new">Start a blank note</button><button class="btn" data-go="example">Open an example</button></div></div></section>`;
  $('#homePage').innerHTML=`<header class="hm-hero"><div class="hm-kicker">${esc(new Date().toLocaleDateString([],{weekday:'long',day:'numeric',month:'long'}))}</div><h1>${greet()}</h1>${last?'':'<p>Your organic chemistry notebook. Write notes, draw structures and mechanisms, and study, all in one place.</p>'}</header>
  <div class="hm-actions">${act('new','<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>','New note','primary')}${act('board','<svg viewBox="0 0 24 24"><path d="M4 18c3-1 4-9 7-9s2 6 5 6 3-4 4-5"/></svg>','New whiteboard')}${act('predict','<svg viewBox="0 0 24 24"><path d="M3 12h12M11 8l4 4-4 4"/><path d="M19 5.5l.8 1.7 1.7.8-1.7.8-.8 1.7-.8-1.7-1.7-.8 1.7-.8z"/></svg>','Predict a reaction')}</div>
  ${lead}
  <section class="hm-sec"><h2>Study today</h2><div class="hm-today">
   <div class="hm-td"><span class="hm-tdn${due?'':' zero'}">${due}</span><span class="hm-tdl"><b>Flashcard${due===1?'':'s'} due</b><small>${ds.length?`${nw?nw+' new · ':''}${ds.length} deck${ds.length>1?'s':''}`:'Select text in a note and press + Card'}</small></span><button class="btn small${due+nw?' primary':''}" data-go="cards">${due+nw?'Study':'Open'}</button></div>
   <div class="hm-td"><span class="hm-tdn${mast?'':' zero'}">${tot?Math.round(100*mast/tot):0}%</span><span class="hm-tdl"><b>IUPAC naming</b><small>${mast} of ${tot} questions mastered</small></span><button class="btn small" data-go="quiz">${mast?'Practise':'Start'}</button></div>
   ${(()=>{const s=spAllStats();return`<div class="hm-td"><span class="hm-tdn${s.m?'':' zero'}">${Math.round(100*s.m/s.n)}%</span><span class="hm-tdl"><b>Spectroscopy</b><small>${s.m} of ${s.n} questions mastered</small></span><button class="btn small" data-go="spprac">${s.m?'Practise':'Start'}</button></div>`})()}
  </div></section>
  ${rest.length?`<section class="hm-sec"><div class="hm-sh"><h2>${last?'Recent notes':'Examples to explore'}</h2>${last?`<button class="linkbtn" data-go="notes">All notes (${notes.length})</button>`:''}</div><div class="hm-grid">${rest.map(n=>noteCard(n)).join('')}</div></section>`:''}
  ${Object.keys(tags).length?`<section class="hm-sec"><h2>Topics</h2><div class="hm-tags">${Object.entries(tags).sort((a,b)=>b[1]-a[1]).map(([t,c])=>`<button class="hm-tag" data-tag="${esc(t)}">${esc(t)}<span>${c}</span></button>`).join('')}</div></section>`:''}
  <footer class="hm-foot"><nav class="hm-links" aria-label="More tools"><button data-go="spectra">Spectroscopy</button><button data-go="orbitals">Orbitals and MO diagrams</button><button data-go="gloss">Glossary</button><button data-go="rxn">Reaction library</button><button data-go="prac">Mechanism practice</button><button data-go="ref">Quick reference</button><button data-go="guide">Guide</button><button data-go="cmd">Command palette <kbd>Ctrl K</kbd></button></nav>
   <p class="hm-tip2"><b>Tip</b>${tip}<button class="linkbtn" data-go="guide">More in the guide</button></p>
   <p class="hm-count">${notes.length} note${notes.length===1?'':'s'} · ${drawings} drawing${drawings===1?'':'s'} · ${eqs} equation${eqs===1?'':'s'} · ${sketches} sketch${sketches===1?'':'es'}</p></footer>`;
}
function newWhiteboard(){const n={id:uid(),title:'Whiteboard',tag:'',updated:Date.now(),blocks:[{id:uid(),type:'sketch',data:emptySketch(1300)}]};App.notes.push(n);App.noteChanged(n);setMode('notes');openNote(n.id)}
function homeClick(e){
  const o=e.target.closest('[data-open]');if(o){setMode('notes');openNote(o.dataset.open);return}
  const g=e.target.closest('[data-go]');if(g){const k=g.dataset.go;if(k==='new'){setMode('notes');newNote()}else if(k==='board')newWhiteboard();else if(k==='quiz'){setMode('naming');quizSetup()}else if(k==='guide')openGuide();else if(k==='predict')openPredictor();else if(k==='gloss')openGlossary();else if(k==='rxn')openLibrary();else if(k==='prac')openPractice();else if(k==='ref')openRef();else if(k==='cmd')openCmd();else if(k==='naming')setMode('naming');else if(k==='spectra')setMode('spectra');else if(k==='spprac'){setMode('spectra');spSetup()}else if(k==='orbitals')setMode('orbitals');else if(k==='example'){const n=App.notes.find(x=>x.id==='lib-hybrid')||App.notes.find(x=>x.example)||App.notes[0];setMode('notes');if(n)openNote(n.id)}else if(k==='cards')setMode('cards');else if(k==='notes'){setMode('notes');if(App.coarse||innerWidth<=820)$('#side').classList.add('open')}return}
  const t=e.target.closest('[data-tag]');if(t){setMode('notes');$('#search').value='';VIEW.tag=t.dataset.tag;VIEW.folder='all';renderFolders();renderList();$('#side').classList.add('open');return}
  const l=e.target.closest('[data-lessonhome]');if(l){setMode('naming');openLesson(l.dataset.lessonhome)}
}

/* ---------- guide ---------- */
const K=(...ks)=>ks.map(k=>`<kbd>${k}</kbd>`).join(' ');
const KT=rows=>`<dl class="gd-keys">${rows.map(([k,d])=>`<dt>${k}</dt><dd>${d}</dd>`).join('')}</dl>`;
const GUIDE=[
 {id:'start',t:'Getting started',h:`<p>Bondline has six parts, switched with the icons down the left edge:</p><ul><li><b>Home</b>: recent notes, quick actions and your progress.</li><li><b>Notes</b>: your notebook. Each note is a stack of <b>blocks</b>: text, structure drawings and sketches. Add blocks with the buttons at the bottom of a note.</li><li><b>Cards</b>: your flashcard decks and study sessions.</li><li><b>Naming</b>: IUPAC lessons and a quiz.</li><li><b>Spectra</b>: lessons and practice for IR, NMR and mass spectrometry.</li><li><b>Orbitals</b>: MO diagrams, π molecular orbitals and 3D atomic and hybrid orbitals.</li></ul><p>Everything saves automatically. The dot at the bottom of the sidebar shows where your notes are saved.</p><p>The toolbar at the top of a note changes with what you're doing: click in text for <b>text tools</b>, click a drawing for <b>structure tools</b>. You can also switch with the <b>Text</b> and <b>Structure</b> tabs at its left.</p>`},
 {id:'text',t:'Writing and formatting text',h:`<p>Click in a text block and the toolbar shows text tools.</p><ul><li><b>Style</b>: Normal text, Heading 1–3, Quote and Code. Headings appear in the “On this page” list beside long notes, on wide screens.</li><li><b>Font</b>: Serif, Sans, Rounded, Handwriting, Classic and Typewriter. Select text to change just that text, or click in a paragraph to change the whole paragraph.</li><li><b>A</b>: text colour and highlighter. Colours follow your colour scheme.</li><li><b>▣ Box</b>: callout boxes for a Key idea, Definition, Example, Watch out or Tip.</li><li><b>H₂O</b>: select text like CH3CO2H and press it to subscript the numbers.</li></ul><h3>Type to format</h3>${KT([['<code>#</code> + space','Heading 1 (<code>##</code> and <code>###</code> for smaller headings)'],['<code>-</code> + space','Bulleted list'],['<code>1.</code> + space','Numbered list'],['<code>&gt;</code> + space','Quote'],['<code>---</code> + space','Divider line'],['<code>$…$</code>','Inline equation'],['<code>$$…$$</code>','Equation on its own line']])}`},
 {id:'maths',t:'Equations and LaTeX',h:`<p>Type LaTeX between dollar signs and it turns into a typeset equation as soon as you type the closing <code>$</code>. Use <code>$$…$$</code> for an equation on its own line. Or press <b>∑x²</b> (${K('Ctrl','M')}) to write one with a live preview and a palette of symbols.</p><p>Click any equation to edit or delete it.</p><h3>Chemistry with \\ce</h3>${KT([['<code>\\ce{H2SO4}</code>','Formula with subscripts'],['<code>\\ce{SO4^2-}</code>','Ion charges'],['<code>\\ce{A + B -&gt; C}</code>','Reaction arrow'],['<code>\\ce{A &lt;=&gt; B}</code>','Equilibrium'],['<code>\\ce{A -&gt;[H+][heat] B}</code>','Conditions above and below the arrow']])}<h3>Common maths</h3>${KT([['<code>x^{2}</code>, <code>x_{i}</code>','Powers and subscripts'],['<code>\\frac{a}{b}</code>','Fraction'],['<code>\\sqrt{x}</code>','Square root'],['<code>\\Delta</code>, <code>\\alpha</code>, <code>\\pi</code>','Greek letters'],['<code>\\times</code>, <code>\\pm</code>, <code>\\approx</code>','×, ±, ≈'],['<code>\\ln</code>, <code>\\log_{10}</code>','Logarithms'],['<code>\\text{rate}</code>','Ordinary words inside an equation']])}`},
 {id:'draw',t:'Drawing structures',h:`<p>Click a drawing to use the structure tools.</p><ul><li><b>Bonds</b>: click empty space to start a chain, or click an atom to grow from it. Drag to aim. Click a bond to cycle single, double and triple.</li><li><b>Rings</b>: click empty space to place one, or an atom or bond to fuse it.</li><li><b>Atoms</b>: pick an element, then click atoms. Type any label (like OMe or CO2Et) in the box.</li><li><b>Charges and lone pairs</b>: pick ⊕, ⊖ or •• and click atoms.</li><li><b>Select</b>: drag to select, then move, or press Delete.</li></ul><h3>Chemistry tools</h3><ul><li><b>Templates</b>: groups, rings, protecting groups, amino acids and reagents. Pick one, then click an atom to attach it.</li><li><b>Aa→</b>: type a name (IUPAC or common) to draw the structure.</li><li><b>C<sub>x</sub>H<sub>y</sub></b>: name, formula, molar mass and checks for every molecule.</li><li><b>R/S</b>: label stereocentres and E/Z double bonds.</li></ul>`},
 {id:'mech',t:'Mechanisms, arrows and 3D',h:`<ul><li><b>Reaction arrows</b>: pick an arrow type and drag. Click an arrow to add reagents above and conditions below.</li><li><b>Curly arrows</b>: pick a full or half (fishhook) arrow, then drag from a lone pair, atom or bond to where the electrons go.</li><li><b>3D</b>: press the 3D button on a drawing (or ${K('D')}). Each reaction arrow becomes a step, and curly arrows animate between steps. Drag to rotate, scroll or pinch to zoom.</li></ul>`},
 {id:'sketch',t:'Whiteboard and sketches',h:`<p>Add a <b>Sketch</b> block to any note, or press <b>New whiteboard</b> on the Home page for a large blank board.</p><ul><li>Tools: pen, highlighter, line, arrow, rectangle, ellipse and eraser. Hold ${K('Shift')} to snap lines to 15° and draw perfect squares and circles.</li><li>Colours follow your colour scheme, so black ink turns light in dark mode.</li><li><b>Pen only</b>: on a tablet, only the stylus draws and fingers scroll the page. It turns on by itself the first time you use a stylus. Pen pressure changes the line width.</li><li><b>Full screen</b> (${K('F')}) gives you the whole screen. Press ${K('Esc')} to leave.</li><li>Drag the bar under the sketch to make it taller. Change the background with the Dots button.</li></ul>`},
 {id:'naming',t:'Naming and quizzes',h:`<p>Open <b>Naming</b> for lessons on each family of compounds, from alkanes to stereodescriptors. Each lesson has worked examples you can open in 3D.</p><p>Start a quiz from any lesson or the sidebar. Questions are a mix of multiple choice, typed names and picking the right structure. Bondline remembers what you got right and wrong and shows progress for each topic on the Home page.</p>${KT([[K('1')+' – '+K('4'),'Choose an answer'],[K('Enter'),'Check, then next question']])}`},
 {id:'org',t:'Folders, tags and pinning',h:`<ul><li><b>Folders</b>: press <b>+</b> next to Folders in the sidebar. Use <b>⋯</b> on a folder to rename it, add a subfolder, start a note in it or delete it (its notes move up a level). Double-click a folder to rename it.</li><li><b>Move a note</b>: drag it from the list onto a folder, or choose a folder from <b>▤</b> at the top of the note.</li><li><b>Tags</b>: type in the Tags box at the top of a note and press Enter. A note can have several tags. Open <b>Tags</b> in the sidebar and click a tag to show only notes with that tag.</li><li><b>★ Pin</b> keeps a note at the top of the list. <b>Recent</b> and <b>A–Z</b> change the order.</li><li><b>Search</b> looks through every note, including tags, flashcards and comments.</li></ul>`},
 {id:'cards',t:'Flashcards',h:`<ul><li>Make a deck with <b>Cards → + New deck</b>, add a <b>Flashcards</b> block to any note, or select text in a note and press <b>+ Card</b>.</li><li>Each side can be text (with $…$ maths, and formulas like H2SO4 get their subscripts) or <b>⬡</b> a structure: type a name such as <i>2-methylpropan-2-ol</i> or a SMILES string and Bondline draws it.</li><li><b>Study</b> shows cards that are due plus new ones. Rate each card: <b>Again</b> brings it back in this session; <b>Hard</b>, <b>Good</b> and <b>Easy</b> space it out further each time.</li><li>Decks print as a question-and-answer table in PDFs.</li></ul>${KT([[K('Space'),'Show the answer'],[K('1')+' '+K('2')+' '+K('3')+' '+K('4'),'Again, Hard, Good, Easy'],[K('Ctrl','Enter'),'Add a card while editing a deck'],[K('Esc'),'End the session']])}`},
 {id:'comments',t:'Comments',h:`<ul><li>Select text and press <b>💬 Comment</b> in the text tools (${K('Ctrl','Alt','C')}). The text gets a coloured underline.</li><li>Press <b>💬</b> on any block (a drawing, sketch or deck) to comment on the whole block.</li><li><b>Comments</b> at the top of a note opens the list. You can reply, edit, resolve or delete each one. Resolved comments are kept under “Resolved”.</li><li>Click underlined text to jump to its comment. Comments don't appear in PDFs.</li></ul>`},
 {id:'chemtools',t:'Spectra, reactions and practice',h:`<ul><li><b>Predict spectra</b>: turn on C<sub>x</sub>H<sub>y</sub> for a drawing, then press <b>Predict spectra</b> under a molecule. You get the number of ¹H and ¹³C NMR signals with typical shifts, how many H each signal represents and its splitting (n + 1 rule), the main IR peaks, and the molecular ion pattern for mass spectrometry, including Cl and Br isotope peaks.</li><li><b>Reaction library</b> (📖 in the structure tools): 34 core reactions with the conditions and every mechanism step drawn with curly arrows. Add one to a note and press <b>3D</b> to watch it.</li><li><b>Mechanism practice</b> (↷): each problem shows a step and its product; draw the curly arrows yourself and press <b>Check</b>. Bondline tells you which arrows are right, which are missing and which don't belong.</li><li><b>Quick reference</b> (▦): periodic table, pKa table, functional groups with naming endings, and IR and NMR tables.</li></ul>${KT([[K('M')+' '+K('V')+' '+K('E'),'Curly arrow, move, eraser (in practice)'],[K('Enter'),'Check, then next problem'],[K('Ctrl','Z'),'Undo an arrow']])}`},
 {id:'chem2',t:'Checking structures, resonance and reactions',h:`<ul><li><b>Structure checks</b>: Bondline circles atoms that can't exist as drawn, such as a carbon with five bonds, a chlorine with two or a triple bond in a small ring. A badge on the drawing says how many problems there are; click it for details. Turn this off in ⚙ Settings.</li><li><b>Resonance structures</b>: click a molecule or ion, then <b>More → Resonance structures</b>. Bondline draws every contributor with the curly arrows between them and marks the major ones.</li><li><b>Reaction builder</b>: press <b>Add reaction</b> at the bottom of a note. Type reactants and products as names, formulas or SMILES, add reagents and conditions, and Bondline checks the atoms balance (or balances it for you).</li><li><b>Formula calculator</b>: <b>More → Formula calculator</b> works out molar mass, % composition, exact mass and degrees of unsaturation for formulas like CuSO<sub>4</sub>·5H<sub>2</sub>O. It also converts mass to moles and finds empirical and molecular formulas from percentages.</li></ul>`},
 {id:'safety',t:'Trash, history, images and sharing',h:`<ul><li><b>Trash</b>: deleted notes stay in Trash (in the sidebar) for 30 days. Restore them or delete them for good. You can also press <b>Undo</b> straight after deleting.</li><li><b>History</b> at the top of a note shows earlier versions saved on this device (at most one every 10 minutes while you edit). Preview one and press <b>Restore</b>; the version you replace is kept too.</li><li><b>Images</b>: press <b>Add image</b>, paste a picture into a text block, or drag image files onto a note. Pictures are shrunk to save space and sync with the note. Choose Small, Medium, Large or Full width and add a caption. Click a picture to see it full size.</li><li><b>Share</b> (installed app, when signed in): make a read-only link to a note. Anyone with the link can view it and save a copy; press <b>Stop sharing</b> to turn the link off.</li><li><b>Command palette</b>: press ${K('Ctrl','K')} anywhere and type to jump to a note, folder, reaction, guide section or action.</li></ul>`},
 {id:'gloss',t:'Glossary',h:`<p>Bondline knows over 300 organic chemistry terms: solvents (DMSO, THF), reagents (LiAlH₄, PCC, mCPBA), abbreviations (Et, Ts, Boc), concepts (nucleophile, enolate, Zaitsev's rule) and named reactions (SN2, aldol, Diels–Alder).</p><ul><li>Terms in your notes are <b>highlighted</b>. Hover over one, or tap it on a phone or tablet, to see what it means. Solvents and reagents show their structure.</li><li>Open the full <b>Glossary</b> from Home, the command palette (${K('Ctrl','K')}) or ⚙ Settings. Search it, or filter by type.</li><li><b>Add your own terms</b> with “Add a term”. They are highlighted in your notes too, and sync with your account.</li><li>In ⚙ Settings → Glossary, highlight every mention, only the first in each note, or turn highlighting off.</li></ul>`},
 {id:'predict',t:'Reaction predictor',h:`<p>Open it from Home, the command palette, or <b>Predict reaction</b> at the bottom of a note. Type a starting material (a name such as <i>2-bromobutane</i> or a SMILES string) and the reagents and conditions, for example <code>NaOEt, EtOH, heat</code> or <code>1. BH3·THF 2. H2O2, NaOH</code>. If a drawing is selected you can pick a molecule from it.</p><ul><li>For alkyl halides and sulfonates, Bondline weighs <b>SN1, SN2, E1 and E2</b> using the substrate, the nucleophile or base, the solvent and heat, and explains why one wins.</li><li>It also predicts additions to alkenes and alkynes, oxidations and reductions, Grignard, Wittig, acetal, imine, aldol and Claisen reactions, acid derivative reactions, alcohol reactions and aromatic substitution (with directing effects).</li><li>Where a carbocation forms, Bondline shows <b>rearrangements</b> (1,2-hydride and methyl shifts).</li><li><b>Add to note</b> inserts the reaction as an editable drawing.</li></ul><p class="hm-muted">Predictions follow textbook rules. Real reactions can give mixtures, so check against your course.</p>`},
 {id:'shared',t:'Shared notebooks',h:`<p>Share a notebook with classmates or colleagues (installed app, signed in). Everyone sees the same notes, and changes appear live.</p><ul><li>Press <b>+</b> next to <b>Shared</b> in the sidebar to make one, then invite people <b>by email</b> (they see the invitation in their sidebar after signing in with that email) or with an <b>invite link</b> you can paste into a group chat.</li><li>Choose whether each person <b>can edit</b> or <b>can only view</b>. Viewers can still read and comment. Only the owner can invite or remove people, or delete the notebook.</li><li>Move a note in by dragging it onto the notebook, or by choosing the notebook in the folder menu at the top of the note. Moving a note out removes it from the notebook for everyone; viewers can use <b>Copy to my notes</b> instead.</li><li>Two people can edit different paragraphs or drawings of the same note at once. If you both edit the same block, the last one saved wins.</li><li>The letters next to the notebook name at the top of a note show who else is looking at it.</li><li>Deleting a shared note removes it for everyone, but keeps a copy in your Trash.</li></ul>`},
 {id:'spectra',t:'Spectroscopy',h:`<p>Open <b>Spectra</b> in the bar on the left for six short lessons: how to solve a structure, IR, ¹H NMR, ¹³C NMR, mass spectrometry and a worked example using all four. Each has tables and example spectra.</p><ul><li><b>Practise spectra</b> asks you to identify compounds from their spectra, count NMR signals, predict splitting, read isotope patterns and work out degrees of unsaturation. Questions you haven't seen or got wrong come first, and your progress syncs with your account.</li><li>Answer with the mouse or keys ${K('1')} – ${K('4')}, then ${K('Enter')} for the next question.</li><li>To predict the spectra of a molecule you have drawn, turn on C<sub>x</sub>H<sub>y</sub> and press <b>Predict spectra</b> under it.</li></ul>`},
 {id:'orbitals',t:'Orbitals and MO diagrams',h:`<p>Open <b>Orbitals</b> in the bar on the left.</p><ul><li><b>Atomic orbitals in 3D</b>: s, p and d orbitals, coloured by phase. Drag to rotate, scroll or pinch to zoom, and turn on <b>Cutaway</b> to see nodes inside.</li><li><b>Hybrid orbitals</b>: sp, sp² and sp³, with the leftover p orbitals.</li><li><b>Diatomic MO diagrams</b>: H₂ to Ne₂, ions such as O₂⁻, and CO, CN⁻ and NO. Bondline fills the electrons and works out the bond order and whether the molecule is magnetic. Click any orbital to see it in 3D.</li><li><b>π molecular orbitals</b>: Hückel calculations for conjugated chains and rings, with HOMO and LUMO, delocalisation energy and whether a ring is aromatic.</li></ul>`},
 {id:'save',t:'Saving, syncing and printing',h:`<ul><li><b>Export PDF</b> (at the top of a note) offers two kinds of PDF. <b>Print or save as PDF</b> uses your browser's printer: choose “Save as PDF” to get a file with real, selectable text and sharp drawings. <b>Download PDF (image)</b> saves a file that looks exactly like the screen. Both are in ⚙ Settings for all notes at once.</li><li><b>Back up</b> saves all your notes to a file. <b>Restore</b> brings them back on any device.</li><li>In the installed app, <b>Sign in</b> to sync notes across your devices. Without an account, notes stay on the device.</li><li>Drawings and sketches can be saved as PNG or SVG images.</li></ul>`},
 {id:'look',t:'Appearance and devices',h:`<p>Open <b>⚙ Settings</b> at the bottom of the sidebar to choose Light, Dark or Auto, and one of four colour schemes: Copper Sulfate, Malachite, Potassium Flame or Sodium Lamp.</p><p>On phones and tablets, use the − and + zoom buttons on a drawing for precise work, and ✋ to move around when zoomed in. Bondline can be installed as an app from your browser's menu, and it then works offline.</p>`},
 {id:'keys',t:'Keyboard shortcuts',h:`<h3>Text</h3>${KT([[K('Ctrl','B')+' '+K('Ctrl','I')+' '+K('Ctrl','U'),'Bold, italic, underline'],[K('Ctrl',',')+' '+K('Ctrl','.'),'Subscript, superscript'],[K('Ctrl','Alt','1')+' – '+K('3'),'Heading 1–3'],[K('Ctrl','Alt','0'),'Normal text'],[K('Ctrl','Shift','8')+' '+K('Ctrl','Shift','7'),'Bulleted, numbered list'],[K('Tab')+' '+K('Shift','Tab'),'Indent, outdent a list item'],[K('Ctrl','M'),'Insert an equation'],[K('Ctrl','K'),'Command palette (anywhere)'],[K('Ctrl','\\'),'Hide or show the sidebar'],[K('Ctrl','Alt','C'),'Comment on the selection'],[K('Ctrl','Z'),'Undo']])}
  <h3>Structure tools (click a drawing first)</h3>${KT([[K('V'),'Select and move'],[K('E'),'Eraser'],[K('1')+' '+K('2')+' '+K('3'),'Single, double, triple bond'],[K('W')+' '+K('Q'),'Wedge, hashed bond'],[K('B'),'Benzene ring'],[K('A'),'Reaction arrow'],[K('M'),'Curly arrow'],[K('T'),'Text'],[K('+')+' '+K('-')+' '+K('L'),'Charges, lone pairs'],[K('D'),'View in 3D'],[K('Ctrl','Z')+' / '+K('Ctrl','Shift','Z'),'Undo, redo'],[K('Delete'),'Delete the selection or hovered item'],[K('?'),'Shortcut card']])}
  <h3>Hover an atom or bond, then type</h3>${KT([[K('C')+' '+K('N')+' '+K('O')+' '+K('S')+' '+K('P')+' '+K('F')+' '+K('I')+' '+K('H'),'Change the element'],[K('l')+' '+K('b'),'Chlorine, bromine'],[K('+')+' '+K('-'),'Add a charge'],[K('.'),'Add a lone pair'],[K('1')+' '+K('2')+' '+K('3'),'Bond order (on a bond)'],[K('W')+' '+K('Q'),'Wedge or hash (on a bond)']])}
  <h3>Sketches (click a sketch first)</h3>${KT([[K('P'),'Pen'],[K('H'),'Highlighter'],[K('L')+' '+K('A'),'Line, arrow'],[K('R')+' '+K('O'),'Rectangle, ellipse'],[K('E'),'Eraser'],[K('1')+' '+K('2')+' '+K('3'),'Thin, medium, thick'],[K('F'),'Full screen'],[K('Ctrl','Z'),'Undo']])}
  <h3>3D viewer</h3>${KT([[K('Space'),'Play or pause'],[K('←')+' '+K('→'),'Previous, next step'],[K('Esc'),'Close']])}<p class="hm-muted">On a Mac, use ${K('⌘')} instead of ${K('Ctrl')}.</p>`}
];
function renderGuide(){
  $('#guidePage').innerHTML=`<header class="gd-head"><div class="hm-kicker">Guide</div><h1>How to use Bondline</h1><input class="search gd-search" id="gdSearch" type="search" placeholder="Search the guide, e.g. heading, wedge, pen" aria-label="Search the guide"></header>`+GUIDE.map(s=>`<section class="gd-sec" id="gd-${s.id}"><h2>${s.t}</h2>${s.h}</section>`).join('')+`<p class="gd-none" id="gdNone" hidden>Nothing in the guide matches that.</p>`;
  $('#guideList').innerHTML=GUIDE.map(s=>`<button class="item" data-gd="${s.id}"><span class="t">${s.t}</span></button>`).join('');
  $('#gdSearch').addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();let any=false;for(const s of GUIDE){const el=$('#gd-'+s.id),hit=!q||el.textContent.toLowerCase().includes(q);el.hidden=!hit;any=any||hit;const it=document.querySelector(`[data-gd="${s.id}"]`);if(it)it.hidden=!hit}$('#gdNone').hidden=any});
}
function openGuide(sec){setMode('guide');if(sec){const el=$('#gd-'+sec);if(el)el.scrollIntoView({block:'start'})}}

/* ---------- organisation: folders, tags, pinning, sorting ---------- */
const VIEW={folder:'all',tag:null,sort:'recent'};
try{const v=JSON.parse(localStorage.getItem('bondline.view')||'{}');if(['recent','az'].includes(v.sort))VIEW.sort=v.sort}catch(e){}
const saveView=()=>{try{localStorage.setItem('bondline.view',JSON.stringify({sort:VIEW.sort}))}catch(e){}};
function cleanFolders(list){const out=[],ids=new Set();for(const f of(Array.isArray(list)?list:[]).slice(0,300)){if(!f||!f.id)continue;const id=String(f.id).replace(/[^a-z0-9]/gi,'').slice(0,24);if(!id||ids.has(id))continue;ids.add(id);out.push({id,name:String(f.name||'Folder').slice(0,60),parent:f.parent?String(f.parent).slice(0,24):''})}
  for(const f of out)if(f.parent&&(!ids.has(f.parent)||f.parent===f.id))f.parent='';
  /* break any cycles */for(const f of out){let p=f.parent,seen=new Set([f.id]);while(p){if(seen.has(p)){f.parent='';break}seen.add(p);p=(out.find(x=>x.id===p)||{}).parent}}
  return out}
function noteTags(n){return Array.isArray(n.tags)?n.tags:[]}
function normOrg(n){let t=Array.isArray(n.tags)?n.tags:[];if(!t.length&&n.tag)t=[n.tag];n.tags=[...new Set(t.map(x=>String(x).trim().slice(0,40)).filter(Boolean))].slice(0,20);n.tag=n.tags[0]||'';n.folder=n.folder?String(n.folder).slice(0,24):'';if(n.pinned)n.pinned=true;else delete n.pinned;n.comments=cleanComments(n.comments);return n}
const folderById=id=>App.folders.find(f=>f.id===id);
function folderPath(id){const p=[];let f=folderById(id),k=0;while(f&&k++<20){p.unshift(f.name);f=folderById(f.parent)}return p.join(' / ')}
function folderDesc(id){const out=new Set([id]);let grew=true;while(grew){grew=false;for(const f of App.folders)if(f.parent&&out.has(f.parent)&&!out.has(f.id)){out.add(f.id);grew=true}}return out}
let fT;function foldersChanged(){App.foldersAt=Date.now();persistLocal();clearTimeout(fT);fT=setTimeout(()=>{if(Store.mode==='cloud')Store.meta().catch(()=>setStatus('err'))},600);renderFolders();renderList()}
function newFolder(parent){const f={id:uid(),name:'New folder',parent:parent||''};App.folders.push(f);App.openFolders.add(parent);foldersChanged();setTimeout(()=>renameFolder(f.id),30)}
function renameFolder(id){const row=document.querySelector(`.fd-item[data-folder="${id}"] .fd-name`);if(!row)return;const f=folderById(id);const inp=document.createElement('input');inp.className='fd-in';inp.value=f.name;inp.maxLength=60;inp.setAttribute('aria-label','Folder name');row.replaceWith(inp);inp.focus();inp.select();
  let done=false;const fin=ok=>{if(done)return;done=true;if(ok){const v=inp.value.trim();if(v)f.name=v}foldersChanged()};
  inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();fin(true)}else if(e.key==='Escape')fin(false)});inp.addEventListener('blur',()=>fin(true));inp.addEventListener('click',e=>e.stopPropagation())}
function deleteFolder(id){const f=folderById(id);if(!f)return;for(const c of App.folders)if(c.parent===id)c.parent=f.parent;for(const n of App.notes)if(n.folder===id){n.folder=f.parent;App.noteChanged(n)}App.folders=App.folders.filter(x=>x!==f);if(VIEW.folder===id)VIEW.folder=f.parent||'all';foldersChanged();toast(`Folder deleted. Its notes moved to ${f.parent?'“'+folderById(f.parent).name+'”':'Unfiled'}.`)}
function moveNote(n,folder){n.folder=folder||'';App.noteChanged(n);renderFolders();renderList();if(App.cur===n){const s=$('#noteFolder');if(s)s.value=n.folder}}
function inView(n){if(VIEW.tag&&!noteTags(n).includes(VIEW.tag))return false;
  if(VIEW.folder==='all')return true;if(VIEW.folder==='pinned')return!!n.pinned;if(VIEW.folder==='unfiled')return!n.folder||!folderById(n.folder);return folderDesc(VIEW.folder).has(n.folder)}
function noteText(n){return n.title+' '+noteTags(n).join(' ')+' '+n.blocks.map(b=>b.type==='text'?plain(b.html):b.type==='scheme'?b.data.texts.map(t=>t.text).join(' ')+b.data.arrows.map(a=>a.above+' '+a.below).join(' '):b.type==='cards'?(b.data.title+' '+b.data.cards.map(c=>c.f+' '+c.b).join(' ')):'').join(' ')+' '+(n.comments||[]).map(c=>c.t+' '+c.r.map(r=>r.t).join(' ')).join(' ')}
function sortedNotes(list){return list.sort((a,b)=>(!!b.pinned-!!a.pinned)||(VIEW.sort==='az'?(a.title||'Untitled').localeCompare(b.title||'Untitled',undefined,{numeric:true,sensitivity:'base'}):b.updated-a.updated))}
function renderFolders(){
  const box=$('#folderTree');if(!box)return;const cnt=id=>App.notes.filter(n=>folderDesc(id).has(n.folder)).length;
  const kids=p=>App.folders.filter(f=>f.parent===p).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
  const row=(f,d)=>{const ch=kids(f.id),open=App.openFolders.has(f.id);return`<div class="fd-item${VIEW.folder===f.id?' on':''}" data-folder="${f.id}" style="--d:${d}" role="treeitem" aria-expanded="${ch.length?open:''}" tabindex="0">${ch.length?`<button class="fd-tw" data-tw="${f.id}" aria-label="${open?'Collapse':'Expand'}">${open?'▾':'▸'}</button>`:'<span class="fd-tw"></span>'}<span class="fd-ic" aria-hidden="true">▤</span><span class="fd-name">${esc(f.name)}</span><span class="fd-n">${cnt(f.id)||''}</span><button class="fd-more" data-fmenu="${f.id}" aria-label="Folder options for ${esc(f.name)}">⋯</button></div>${open?ch.map(c=>row(c,d+1)).join(''):''}`};
  const pinned=App.notes.filter(n=>n.pinned).length,unf=App.notes.filter(n=>!n.folder||!folderById(n.folder)).length;
  const sp=(id,ic,l,c)=>`<div class="fd-item fd-sys${VIEW.folder===id?' on':''}" data-folder="${id}" tabindex="0" role="treeitem"><span class="fd-tw"></span><span class="fd-ic" aria-hidden="true">${ic}</span><span class="fd-name">${l}</span><span class="fd-n">${c||''}</span></div>`;
  box.innerHTML=sp('all','◎','All notes',App.notes.length)+(pinned?sp('pinned','★','Pinned',pinned):'')+kids('').map(f=>row(f,0)).join('')+(App.folders.length?sp('unfiled','○','Unfiled',unf):'');
  const tags={};for(const n of App.notes)for(const t of noteTags(n))tags[t]=(tags[t]||0)+1;
  const tl=Object.entries(tags).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  $('#tagFilter').innerHTML=tl.length?tl.slice(0,App.allTags?99:10).map(([t,c])=>`<button class="tf${VIEW.tag===t?' on':''}" data-tagf="${esc(t)}" aria-pressed="${VIEW.tag===t}">${esc(t)}<span>${c}</span></button>`).join('')+(tl.length>10?`<button class="tf more" data-tagmore="1">${App.allTags?'Fewer':'+'+(tl.length-10)+' more'}</button>`:''):'';
  document.querySelectorAll('.sort-b').forEach(b=>{const on=b.dataset.sort===VIEW.sort;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
  const lbl=$('#viewLabel');if(lbl){const fl=VIEW.folder==='all'?'All notes':VIEW.folder==='pinned'?'Pinned':VIEW.folder==='unfiled'?'Unfiled':(folderById(VIEW.folder)||{}).name||'All notes';lbl.innerHTML=esc(fl)+(VIEW.tag?` · <span class="tag">${esc(VIEW.tag)}</span> <button class="linkbtn" data-cleartag="1" aria-label="Clear tag filter">✕</button>`:'')}
}
function folderMenu(id,anchor){closeFolderMenu();const f=folderById(id);const m=document.createElement('div');m.className='fd-menu';m.setAttribute('role','menu');
  m.innerHTML=`<button data-fm="rename">Rename</button><button data-fm="sub">New subfolder</button><button data-fm="note">New note here</button><button data-fm="del" class="danger">Delete folder</button>`;
  document.body.appendChild(m);const r=anchor.getBoundingClientRect();m.style.left=Math.min(innerWidth-190,r.left)+'px';m.style.top=(r.bottom+4)+'px';App.fmenu=m;
  m.addEventListener('click',e=>{const b=e.target.closest('[data-fm]');if(!b)return;const k=b.dataset.fm;
    if(k==='del'&&!b.classList.contains('armed')){b.classList.add('armed');b.textContent='Click again to delete';return}
    closeFolderMenu();if(k==='rename')renameFolder(id);else if(k==='sub')newFolder(id);else if(k==='note'){VIEW.folder=id;newNote()}else if(k==='del')deleteFolder(id)})}
function closeFolderMenu(){if(App.fmenu){App.fmenu.remove();App.fmenu=null}}
function wireOrg(){
  const tree=$('#folderTree');
  tree.addEventListener('click',e=>{const tw=e.target.closest('[data-tw]');if(tw){const id=tw.dataset.tw;App.openFolders.has(id)?App.openFolders.delete(id):App.openFolders.add(id);renderFolders();return}
    const mo=e.target.closest('[data-fmenu]');if(mo){folderMenu(mo.dataset.fmenu,mo);return}
    const it=e.target.closest('[data-folder]');if(it){VIEW.folder=it.dataset.folder;if(folderById(VIEW.folder))App.openFolders.add(VIEW.folder);renderFolders();renderList();if(App.mode!=='notes'&&App.mode!=='home')setMode('notes')}});
  tree.addEventListener('dblclick',e=>{const it=e.target.closest('.fd-item:not(.fd-sys)');if(it)renameFolder(it.dataset.folder)});
  tree.addEventListener('keydown',e=>{const it=e.target.closest('[data-folder]');if(!it)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();it.click()}else if(e.key==='F2'&&!it.classList.contains('fd-sys'))renameFolder(it.dataset.folder);else if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const all=[...tree.querySelectorAll('[data-folder]')],i=all.indexOf(it);const nx=all[i+(e.key==='ArrowDown'?1:-1)];if(nx)nx.focus()}});
  /* drag notes onto folders */
  $('#noteList').addEventListener('dragstart',e=>{const it=e.target.closest('.item');if(!it)return;e.dataTransfer.setData('text/x-bondline-note',it.dataset.id);e.dataTransfer.effectAllowed='move';document.body.classList.add('dragging-note')});
  $('#noteList').addEventListener('dragend',()=>{document.body.classList.remove('dragging-note');tree.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop'))});
  tree.addEventListener('dragover',e=>{const it=e.target.closest('[data-folder]');if(!it||!e.dataTransfer.types.includes('text/x-bondline-note'))return;const k=it.dataset.folder;if(k==='all'||k==='pinned')return;e.preventDefault();tree.querySelectorAll('.drop').forEach(x=>x!==it&&x.classList.remove('drop'));it.classList.add('drop')});
  tree.addEventListener('dragleave',e=>{const it=e.target.closest('[data-folder]');if(it&&!it.contains(e.relatedTarget))it.classList.remove('drop')});
  tree.addEventListener('drop',e=>{document.body.classList.remove('dragging-note');const it=e.target.closest('[data-folder]');const id=e.dataTransfer.getData('text/x-bondline-note');if(!it||!id)return;e.preventDefault();it.classList.remove('drop');const n=App.notes.find(x=>x.id===id);if(!n)return;const k=it.dataset.folder;moveNote(n,k==='unfiled'?'':k);if(!k.startsWith('nb:'))toast(`Moved to ${k==='unfiled'?'Unfiled':folderById(k).name}`)});
  $('#newFolder').onclick=()=>newFolder(folderById(VIEW.folder)?VIEW.folder:'');
  $('#tagFilter').addEventListener('click',e=>{const m=e.target.closest('[data-tagmore]');if(m){App.allTags=!App.allTags;renderFolders();return}const t=e.target.closest('[data-tagf]');if(!t)return;VIEW.tag=VIEW.tag===t.dataset.tagf?null:t.dataset.tagf;renderFolders();renderList()});
  $('#viewLabel').addEventListener('click',e=>{if(e.target.closest('[data-cleartag]')){VIEW.tag=null;renderFolders();renderList()}});
  document.querySelectorAll('.sort-b').forEach(b=>b.onclick=()=>{VIEW.sort=b.dataset.sort;saveView();renderFolders();renderList()});
  $('#orgToggle').onclick=()=>{const o=$('#org'),open=o.classList.toggle('closed');$('#orgToggle').setAttribute('aria-expanded',!open);try{localStorage.setItem('bondline.orgClosed',open?'1':'')}catch(e){}};
  try{if(localStorage.getItem('bondline.orgClosed')){$('#org').classList.add('closed');$('#orgToggle').setAttribute('aria-expanded','false')}}catch(e){}
  document.addEventListener('pointerdown',e=>{if(App.fmenu&&!e.target.closest('.fd-menu'))closeFolderMenu()});
}
/* note header: folder picker, tag chips, pin */
function folderOptions(sel){const out=['<option value="">Unfiled</option>'];const walk=(p,d)=>{for(const f of App.folders.filter(f=>f.parent===p).sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}))){out.push(`<option value="${f.id}"${f.id===sel?' selected':''}>${' '.repeat(d)}${esc(f.name)}</option>`);walk(f.id,d+1)}};walk('',0);return out.join('')}
function wireNoteOrg(n){
  const fs=$('#noteFolder');fs.innerHTML=folderOptions(n.folder);fs.value=n.folder||'';fs.onchange=()=>{if(fs.value==='__new'){return}moveNote(n,fs.value)};
  const pin=$('#notePin');const syncPin=()=>{pin.classList.toggle('on',!!n.pinned);pin.setAttribute('aria-pressed',!!n.pinned);pin.title=n.pinned?'Unpin':'Pin to the top of the list'};syncPin();
  pin.onclick=()=>{if(n.pinned)delete n.pinned;else n.pinned=true;syncPin();App.noteChanged(n);renderFolders()};
  const box=$('#noteTags'),inp=box.querySelector('input');
  const draw=()=>{box.querySelectorAll('.chip').forEach(c=>c.remove());for(const t of noteTags(n)){const c=document.createElement('span');c.className='chip';c.innerHTML=`${esc(t)}<button aria-label="Remove tag ${esc(t)}" data-rm="${esc(t)}">×</button>`;box.insertBefore(c,inp)}inp.placeholder=noteTags(n).length?'Add tag':'Add tags, e.g. Substitution'};
  const add=v=>{v=v.replace(/,/g,' ').trim().slice(0,40);if(!v)return;if(!noteTags(n).some(t=>t.toLowerCase()===v.toLowerCase())){n.tags=[...noteTags(n),v].slice(0,20);n.tag=n.tags[0];App.noteChanged(n);renderFolders()}draw()};
  draw();
  const dl=$('#tagList');const all=new Set();App.notes.forEach(x=>noteTags(x).forEach(t=>all.add(t)));dl.innerHTML=[...all].sort().map(t=>`<option value="${esc(t)}">`).join('');
  inp.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===','||e.key==='Tab'&&inp.value.trim()){e.preventDefault();add(inp.value);inp.value=''}else if(e.key==='Backspace'&&!inp.value&&noteTags(n).length){n.tags=noteTags(n).slice(0,-1);n.tag=n.tags[0]||'';App.noteChanged(n);draw();renderFolders()}});
  inp.addEventListener('change',()=>{if(inp.value.trim()){add(inp.value);inp.value=''}});
  inp.addEventListener('blur',()=>{if(inp.value.trim()){add(inp.value);inp.value=''}});
  box.addEventListener('click',e=>{const r=e.target.closest('[data-rm]');if(r){n.tags=noteTags(n).filter(t=>t!==r.dataset.rm);n.tag=n.tags[0]||'';App.noteChanged(n);draw();renderFolders()}else inp.focus()});
}

/* ---------- comments on text and blocks ---------- */
function cleanComments(list){const out=[];for(const c of(Array.isArray(list)?list:[]).slice(0,500)){if(!c||!c.id)continue;const id=String(c.id).replace(/[^a-z0-9]/gi,'').slice(0,24);if(!id)continue;
  out.push({id,a:/^(t|b:[A-Za-z0-9]{1,40})$/.test(c.a)?c.a:'t',q:String(c.q||'').slice(0,200),t:String(c.t||'').slice(0,4000),at:+c.at||Date.now(),done:!!c.done,r:(Array.isArray(c.r)?c.r:[]).slice(0,100).map(r=>({t:String(r&&r.t||'').slice(0,4000),at:+(r&&r.at)||Date.now()})).filter(r=>r.t)})}
  return out}
const CM={open:false,draft:null,focus:null};
function cmtCount(n){return(n.comments||[]).filter(c=>!c.done).length}
function syncCmtButton(){const b=$('#cmtBtn');if(!b||!App.cur)return;const k=cmtCount(App.cur);b.querySelector('.cm-n').textContent=k||'';b.classList.toggle('has',k>0);b.setAttribute('aria-expanded',CM.open)}
function markCommentSpans(){const n=App.cur;if(!n)return;const by=new Map((n.comments||[]).map(c=>[c.id,c]));
  document.querySelectorAll('#blocks span[data-cmt]').forEach(sp=>{const c=by.get(sp.getAttribute('data-cmt'));sp.classList.toggle('cm-done',!c||c.done);sp.classList.toggle('cm-on',!!c&&CM.focus===c.id)});
  document.querySelectorAll('#blocks .block').forEach(sec=>{const k=(n.comments||[]).filter(c=>!c.done&&c.a==='b:'+sec.dataset.id).length;let bd=sec.querySelector(':scope > .cm-badge');if(k){if(!bd){bd=document.createElement('button');bd.className='cm-badge';bd.setAttribute('aria-label','Show comments on this block');sec.appendChild(bd);bd.onclick=()=>{const c=(n.comments||[]).find(c=>!c.done&&c.a==='b:'+sec.dataset.id);openComments(c&&c.id)}}bd.textContent='💬 '+k}else if(bd)bd.remove()})}
function addTextComment(){
  if(!restoreSel())return toast('Select some text first.');const s=getSelection();if(s.isCollapsed||!s.toString().trim())return toast('Select the text you want to comment on.');
  const id=uid(),q=s.toString().replace(/\s+/g,' ').trim().slice(0,200);
  document.execCommand('styleWithCSS',false,false);document.execCommand('fontName',false,'bl-cmt-'+id);
  for(const f of[...TX.body.querySelectorAll('font[face="bl-cmt-'+id+'"]')]){const sp=document.createElement('span');sp.setAttribute('data-cmt',id);sp.append(...f.childNodes);f.replaceWith(sp)}
  if(!TX.body.querySelector(`[data-cmt="${id}"]`))return toast('Couldn\'t attach a comment there.');
  CM.draft={id,a:'t',q};textChanged();openComments(null,true)}
function addBlockComment(b){CM.draft={id:uid(),a:'b:'+b.id,q:''};openComments(null,true)}
function openComments(focusId,compose){CM.open=true;CM.focus=focusId||null;$('#cmtPanel').hidden=false;document.body.classList.add('cm-open');renderComments();syncCmtButton();markCommentSpans();
  if(compose){const ta=$('#cmtPanel .cm-new textarea');if(ta)ta.focus()}
  else if(focusId){const el=$(`#cmtPanel [data-c="${focusId}"]`);if(el)el.scrollIntoView({block:'nearest'});jumpToComment(focusId)}}
function closeComments(){if(CM.draft&&CM.draft.a==='t')dropAnchor(CM.draft.id);CM.draft=null;CM.open=false;CM.focus=null;$('#cmtPanel').hidden=true;document.body.classList.remove('cm-open');syncCmtButton();markCommentSpans()}
function dropAnchor(id){let changed=false;document.querySelectorAll(`#blocks span[data-cmt="${id}"]`).forEach(sp=>{const body=sp.closest('.text-body');sp.replaceWith(...sp.childNodes);changed=body;if(body){const sec=body.closest('.block'),b=App.cur.blocks.find(x=>x.id===sec.dataset.id);if(b){b.html=serializeBody(body)}}});if(changed)App.noteChanged(App.cur)}
function jumpToComment(id){const c=(App.cur.comments||[]).find(x=>x.id===id);if(!c)return;let el=c.a==='t'?document.querySelector(`#blocks span[data-cmt="${id}"]`):document.querySelector(`#blocks .block[data-id="${c.a.slice(2)}"]`);if(!el)return;el.scrollIntoView({block:'center',behavior:'smooth'});el.classList.remove('cm-flash');void el.offsetWidth;el.classList.add('cm-flash')}
function renderComments(){
  const n=App.cur,box=$('#cmtList');if(!n||!box)return;const L=n.comments||[];
  const order=new Map();[...document.querySelectorAll('#blocks .block')].forEach((sec,i)=>{order.set('b:'+sec.dataset.id,i*1000);sec.querySelectorAll('span[data-cmt]').forEach((sp,j)=>{if(!order.has(sp.getAttribute('data-cmt')))order.set(sp.getAttribute('data-cmt'),i*1000+j+1)})});
  const pos=c=>c.a==='t'?(order.has(c.id)?order.get(c.id):1e9):(order.has(c.a)?order.get(c.a):1e9);
  const open=L.filter(c=>!c.done).sort((a,b)=>pos(a)-pos(b)),done=L.filter(c=>c.done);
  const quote=c=>c.a==='t'?(document.querySelector(`#blocks span[data-cmt="${c.id}"]`)?`<blockquote>${esc(c.q)}</blockquote>`:`<blockquote class="gone">${esc(c.q)} <i>(text deleted)</i></blockquote>`):`<div class="cm-on-block">On a ${(()=>{const b=n.blocks.find(x=>'b:'+x.id===c.a);return b?{scheme:'drawing',sketch:'sketch',cards:'flashcard deck',text:'text block'}[b.type]:'deleted block'})()}</div>`;
  const card=c=>`<article class="cm-card${c.done?' done':''}${CM.focus===c.id?' on':''}" data-c="${c.id}">${quote(c)}<div class="cm-t">${esc(c.t).replace(/\n/g,'<br>')}</div><div class="cm-time">${fmtDate(c.at)}</div>${c.r.map((r,i)=>`<div class="cm-r"><div class="cm-t">${esc(r.t).replace(/\n/g,'<br>')}</div><div class="cm-time">${fmtDate(r.at)} <button class="linkbtn" data-cdelr="${i}">Delete</button></div></div>`).join('')}
    <div class="cm-acts">${c.done?'<button class="linkbtn" data-cact="reopen">Reopen</button>':'<button class="linkbtn" data-cact="reply">Reply</button><button class="linkbtn" data-cact="done">Resolve</button>'}<button class="linkbtn" data-cact="edit">Edit</button><button class="linkbtn danger" data-cact="del">Delete</button></div></article>`;
  box.innerHTML=(CM.draft?`<div class="cm-new">${CM.draft.q?`<blockquote>${esc(CM.draft.q)}</blockquote>`:'<div class="cm-on-block">Comment on this block</div>'}<textarea rows="3" placeholder="Write a comment…" aria-label="New comment" maxlength="4000"></textarea><div class="cm-row"><button class="btn small" data-cnew="cancel">Cancel</button><button class="btn small primary" data-cnew="save">Comment</button></div></div>`:'')+
    (open.length?open.map(card).join(''):(!CM.draft?`<p class="cm-empty">No open comments. Select text and press <b>Comment</b> in the text tools (or <kbd>Ctrl</kbd>+<kbd>Alt</kbd>+<kbd>C</kbd>), or use 💬 on a drawing.</p>`:''))+
    (done.length?`<details class="cm-donebox"><summary>Resolved (${done.length})</summary>${done.map(card).join('')}</details>`:'');
}
function wireComments(){
  const P=$('#cmtPanel');
  $('#cmtClose').onclick=closeComments;
  P.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){const ta=e.target.closest('textarea');if(!ta)return;e.preventDefault();const b=ta.parentNode.querySelector('[data-cnew="save"],[data-crep="save"],[data-cedit="save"]');if(b)b.click()}if(e.key==='Escape'){e.stopPropagation();closeComments()}});
  P.addEventListener('click',e=>{const n=App.cur;if(!n)return;
    const nw=e.target.closest('[data-cnew]');if(nw){if(nw.dataset.cnew==='save'){const t=P.querySelector('.cm-new textarea').value.trim();if(!t)return toast('Write something first.');n.comments=[...(n.comments||[]),{...CM.draft,t,at:Date.now(),done:false,r:[]}];const id=CM.draft.id;CM.draft=null;CM.focus=id;App.noteChanged(n)}else{if(CM.draft.a==='t')dropAnchor(CM.draft.id);CM.draft=null}renderComments();syncCmtButton();markCommentSpans();return}
    const card=e.target.closest('.cm-card');if(!card)return;const c=n.comments.find(x=>x.id===card.dataset.c);if(!c)return;
    const rp=e.target.closest('[data-crep]');if(rp){if(rp.dataset.crep==='save'){const t=card.querySelector('.cm-reply textarea').value.trim();if(t){c.r.push({t,at:Date.now()});App.noteChanged(n)}}renderComments();return}
    const ed=e.target.closest('[data-cedit]');if(ed){if(ed.dataset.cedit==='save'){const t=card.querySelector('.cm-edit textarea').value.trim();if(t){c.t=t;App.noteChanged(n)}}renderComments();return}
    const dr=e.target.closest('[data-cdelr]');if(dr){c.r.splice(+dr.dataset.cdelr,1);App.noteChanged(n);renderComments();return}
    const a=e.target.closest('[data-cact]');
    if(!a){CM.focus=c.id;renderComments();markCommentSpans();jumpToComment(c.id);return}
    const k=a.dataset.cact;
    if(k==='reply'){if(card.querySelector('.cm-reply'))return;const d=document.createElement('div');d.className='cm-reply';d.innerHTML='<textarea rows="2" placeholder="Reply…" aria-label="Reply" maxlength="4000"></textarea><div class="cm-row"><button class="btn small" data-crep="cancel">Cancel</button><button class="btn small primary" data-crep="save">Reply</button></div>';card.appendChild(d);d.querySelector('textarea').focus()}
    else if(k==='edit'){if(card.querySelector('.cm-edit'))return;const d=document.createElement('div');d.className='cm-edit';d.innerHTML=`<textarea rows="3" aria-label="Edit comment" maxlength="4000">${esc(c.t)}</textarea><div class="cm-row"><button class="btn small" data-cedit="cancel">Cancel</button><button class="btn small primary" data-cedit="save">Save</button></div>`;card.querySelector('.cm-t').replaceWith(d);d.querySelector('textarea').focus()}
    else if(k==='done'||k==='reopen'){c.done=k==='done';App.noteChanged(n);renderComments();syncCmtButton();markCommentSpans();toast(c.done?'Comment resolved':'Comment reopened')}
    else if(k==='del'){if(!a.classList.contains('armed')){a.classList.add('armed');a.textContent='Delete?';setTimeout(()=>{if(a.isConnected){a.classList.remove('armed');a.textContent='Delete'}},3000);return}
      n.comments=n.comments.filter(x=>x!==c);if(c.a==='t')dropAnchor(c.id);App.noteChanged(n);renderComments();syncCmtButton();markCommentSpans()}
  });
  $('#blocks').addEventListener('click',e=>{const sp=e.target.closest('span[data-cmt]');if(sp&&!sp.classList.contains('cm-done')&&App.cur&&(App.cur.comments||[]).some(c=>c.id===sp.getAttribute('data-cmt'))){openComments(sp.getAttribute('data-cmt'))}});
}

/* ---------- flashcards: deck blocks in notes, spaced-repetition study ---------- */
const DAY=86400000;
function emptyDeck(){return{title:'',cards:[{id:uid(),f:'',b:'',ft:'t',bt:'t'}]}}
function cleanDeck(d){d=d&&typeof d==='object'?d:{};const out={title:String(d.title||'').slice(0,120),cards:[]};
  for(const c of(Array.isArray(d.cards)?d.cards:[]).slice(0,1000)){if(!c)continue;const k={id:String(c.id||uid()).replace(/[^a-z0-9]/gi,'').slice(0,24)||uid(),f:String(c.f||'').slice(0,2000),b:String(c.b||'').slice(0,2000),ft:c.ft==='m'?'m':'t',bt:c.bt==='m'?'m':'t'};
    if(c.s&&typeof c.s==='object'){const s=c.s;k.s={due:+s.due||0,iv:Math.max(0,Math.min(3650,+s.iv||0)),ef:Math.max(1.3,Math.min(3,+s.ef||2.5)),n:Math.max(0,Math.min(9999,+s.n||0)),l:Math.max(0,Math.min(9999,+s.l||0))}}
    out.cards.push(k)}
  return out}
/* text side: plain text with $maths$ and automatic formula subscripts for things like H2SO4 */
function cardTextHTML(t){if(!t.trim())return'<span class="fc-empty">Empty</span>';const parts=t.split(/(\$\$[^$]+\$\$|\$[^$\n]+\$)/g);
  return parts.map(p=>{const m=/^\$\$([^$]+)\$\$$/.exec(p)||/^\$([^$\n]+)\$$/.exec(p);if(m)return`<span data-tex="${esc(m[1])}"${p.startsWith('$$')?' data-display="1"':''}>${esc(m[1])}</span>`;return p.split(/(\s+)/).map(w=>{const mm=/^(.*?)([.,;:!?]*)$/.exec(w),core=mm[1];if(/\d/.test(core)&&/^(?:[A-Z][a-z]?\d*|\(|\)\d*)+(?:\d*[+\-−])?$/.test(core))return chemSegs(core).map(g=>g.k==='sub'?`<sub>${esc(g.t)}</sub>`:g.k==='sup'?`<sup>${esc(g.t)}</sup>`:esc(g.t)).join('')+esc(mm[2]);return esc(w)}).join('').replace(/\n/g,'<br>')}).join('')}
const _molCache=new Map();
function cardMolHTML(t){t=t.trim();if(!t)return'<span class="fc-empty">Type a name or SMILES</span>';if(_molCache.has(t))return _molCache.get(t);let smi=null;
  try{smi=nameToSmiles(t).smiles}catch(e){if(/^[A-Za-z0-9@+\-\[\]\(\)=#\\\/%.*]+$/.test(t)&&!/\s/.test(t))smi=t}
  let out;try{out=smi?`<div class="fc-mol">${smilesSVG(smi,1.1)}</div>`:''}catch(e){out=''}
  if(!out)out=`<span class="fc-bad">Couldn't draw “${esc(t)}”. Try another name or a SMILES string.</span>`;
  if(_molCache.size>300)_molCache.clear();_molCache.set(t,out);return out}
const sideHTML=(t,ty)=>ty==='m'?cardMolHTML(t):cardTextHTML(t);
const isDue=(c,now)=>!c.s||c.s.due<=now;
function deckStats(d,now=Date.now()){let due=0,nw=0;for(const c of d.cards){if(!c.f.trim()&&!c.b.trim())continue;if(!c.s)nw++;else if(c.s.due<=now)due++}return{due,nw,total:d.cards.filter(c=>c.f.trim()||c.b.trim()).length}}
function allDecks(){const out=[];for(const n of App.notes)for(const b of n.blocks)if(b.type==='cards')out.push({n,b,d:b.data});return out}
/* scheduling, a simplified SM-2: Again 1 / Hard 2 / Good 3 / Easy 4 */
function schedule(c,g,now=Date.now()){const s=c.s||{due:0,iv:0,ef:2.5,n:0,l:0};
  if(g===1){s.l++;s.n=0;s.iv=0;s.ef=Math.max(1.3,s.ef-0.2);s.due=now+60000}
  else{if(g===2){s.iv=s.iv?Math.max(1,Math.round(s.iv*1.2)):1;s.ef=Math.max(1.3,s.ef-0.15)}
    else if(g===3){s.iv=s.iv?Math.max(s.iv+1,Math.round(s.iv*s.ef)):1}
    else{s.iv=s.iv?Math.max(s.iv+2,Math.round(s.iv*s.ef*1.3)):4;s.ef=Math.min(3,s.ef+0.15)}
    s.n++;s.due=now+s.iv*DAY}
  c.s=s;return s}
function ivLabel(c,g){const t={s:c.s?{...c.s}:null};const s=schedule(t,g,0);if(g===1)return'1 min';const d=s.iv;return d<1?'today':d===1?'1 day':d<31?d+' days':d<365?Math.round(d/30)+' mo':Math.round(d/365*10)/10+' yr'}

class DeckEditor{
  constructor(b,host,n){this.b=b;this.n=n;this.d=b.data=cleanDeck(b.data);this.host=host;this.render()}
  changed(){this.b.data=this.d;App.noteChanged(this.n);this.stats()}
  stats(){const s=deckStats(this.d),el=this.host.querySelector('.fc-stats');if(el)el.innerHTML=`${s.total} card${s.total===1?'':'s'}${s.due?` · <b>${s.due} due</b>`:''}${s.nw?` · ${s.nw} new`:''}`;const sb=this.host.querySelector('[data-fc="study"]');if(sb)sb.disabled=!s.total}
  row(c,i){return`<div class="fc-row" data-card="${c.id}"><span class="fc-i">${i+1}</span>${['f','b'].map(k=>`<div class="fc-side"><div class="fc-sh"><span>${k==='f'?'Front':'Back'}</span><span class="fc-ty" role="radiogroup" aria-label="${k==='f'?'Front':'Back'} type"><button data-ty="t" data-k="${k}" class="${c[k+'t']==='t'?'on':''}" aria-pressed="${c[k+'t']==='t'}" title="Text, with $maths$">Aa</button><button data-ty="m" data-k="${k}" class="${c[k+'t']==='m'?'on':''}" aria-pressed="${c[k+'t']==='m'}" title="Structure from a name or SMILES">⬡</button></span></div><textarea rows="2" data-k="${k}" placeholder="${c[k+'t']==='m'?'Compound name or SMILES, e.g. ethanoic acid':k==='f'?'Question, e.g. What is the hybridisation of C in CO2?':'Answer'}" aria-label="Card ${i+1} ${k==='f'?'front':'back'}" maxlength="2000">${esc(c[k])}</textarea><div class="fc-prev" data-pk="${k}"></div></div>`).join('')}<button class="fc-del" data-fc="del" aria-label="Delete card ${i+1}" title="Delete card">${BI.del}</button></div>`}
  render(){const d=this.d;
    this.host.innerHTML=`<div class="fc-head"><span class="fc-ic" aria-hidden="true">▭▭</span><input class="fc-title" placeholder="Deck name, e.g. Reagents" value="${esc(d.title)}" aria-label="Deck name" maxlength="120"><span class="fc-stats"></span><span class="fc-sp"></span><button class="btn small primary" data-fc="study">Study</button></div><div class="fc-list">${d.cards.map((c,i)=>this.row(c,i)).join('')}</div><div class="fc-foot"><button class="btn small" data-fc="add">+ Add card</button><span class="fc-hint">Tip: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> adds a card. Use $…$ for maths and ⬡ for a structure.</span></div>`;
    this.host.querySelectorAll('.fc-row').forEach(r=>this.preview(r));this.stats();
    const H=this.host;
    H.querySelector('.fc-title').addEventListener('input',e=>{d.title=e.target.value;this.changed()});
    H.addEventListener('input',e=>{const ta=e.target.closest('textarea');if(!ta)return;const r=ta.closest('.fc-row'),c=d.cards.find(x=>x.id===r.dataset.card);c[ta.dataset.k]=ta.value;clearTimeout(r._t);r._t=setTimeout(()=>this.preview(r),250);this.changed()});
    H.addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)&&e.target.closest('.fc-row')){e.preventDefault();this.add()}});
    H.addEventListener('click',e=>{const t=e.target.closest('[data-ty]');if(t){const r=t.closest('.fc-row'),c=d.cards.find(x=>x.id===r.dataset.card);c[t.dataset.k+'t']=t.dataset.ty;t.parentNode.querySelectorAll('button').forEach(b=>{const on=b===t;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});r.querySelector(`textarea[data-k="${t.dataset.k}"]`).placeholder=t.dataset.ty==='m'?'Compound name or SMILES, e.g. ethanoic acid':'Text';this.preview(r);this.changed();return}
      const a=e.target.closest('[data-fc]');if(!a)return;const k=a.dataset.fc;
      if(k==='add')this.add();else if(k==='study')startStudy([this.b],false);
      else if(k==='del'){const r=a.closest('.fc-row');d.cards=d.cards.filter(x=>x.id!==r.dataset.card);r.remove();H.querySelectorAll('.fc-i').forEach((x,i)=>x.textContent=i+1);this.changed()}})}
  add(){const c={id:uid(),f:'',b:'',ft:'t',bt:'t'};this.d.cards.push(c);const w=document.createElement('div');w.innerHTML=this.row(c,this.d.cards.length-1);const r=w.firstChild;this.host.querySelector('.fc-list').appendChild(r);r.querySelector('textarea').focus();this.changed()}
  preview(r){const c=this.d.cards.find(x=>x.id===r.dataset.card);if(!c)return;for(const k of['f','b']){const p=r.querySelector(`[data-pk="${k}"]`),t=c[k],ty=c[k+'t'];const show=ty==='m'||/\$|[A-Z][a-z]?\d/.test(t);p.hidden=!show||!t.trim();if(!p.hidden){p.innerHTML=sideHTML(t,ty);renderMathIn(p)}}}
}
/* add the selected text as a new card in this note's deck */
function cardFromSelection(){
  if(!restoreSel())return toast('Select some text first.');const t=getSelection().toString().trim();if(!t)return toast('Select the text you want on a card.');
  const n=TX.note||App.cur;let b=n.blocks.find(x=>x.type==='cards');let fresh=false;
  if(!b){b={id:uid(),type:'cards',data:{title:n.title||'',cards:[]}};n.blocks.push(b);fresh=true}
  const c={id:uid(),f:t.slice(0,2000),b:'',ft:'t',bt:'t'};b.data.cards.push(c);App.noteChanged(n);openNoteKeep(n);
  const r=document.querySelector(`.fc-row[data-card="${c.id}"]`);if(r){r.scrollIntoView({block:'center',behavior:'smooth'});r.querySelector('textarea[data-k="b"]').focus()}
  toast(fresh?'Added a flashcard deck to this note. Now write the answer.':'Card added. Now write the answer.')}

/* study session */
const ST={q:[],i:0,flipped:false,done:0,again:0,decks:[]};
function startStudy(blocks,cram){const now=Date.now();let q=[];for(const b of blocks){const n=App.notes.find(x=>x.blocks.includes(b));for(const c of b.data.cards){if(!c.f.trim()&&!c.b.trim())continue;if(cram||isDue(c,now))q.push({c,b,n})}}
  if(!q.length){toast('Nothing is due. Choose “Practise all” to go through every card.');return}
  const due=q.filter(x=>x.c.s),nw=q.filter(x=>!x.c.s);q=[...shuffle(due),...shuffle(nw)].slice(0,cram?500:200);
  Object.assign(ST,{q,i:0,flipped:false,done:0,again:0,decks:blocks,cram,total:q.length});$('#studyScrim').hidden=false;document.body.classList.add('sk-lock');showCard()}
function showCard(){const it=ST.q[ST.i],box=$('#studyCard');
  if(!it){$('#studyBody').innerHTML=`<div class="st-end"><div class="st-big">✓</div><h2>Session complete</h2><p>You reviewed ${ST.done} card${ST.done===1?'':'s'}${ST.again?`, and went back over ${ST.again} you missed`:''}.</p><div class="st-endrow"><button class="btn" data-st="close">Done</button><button class="btn primary" data-st="again">Practise all again</button></div></div>`;$('#studyBar i').style.width='100%';$('#studyCount').textContent='';return}
  const c=it.c;$('#studyBody').innerHTML=`<div class="st-deck">${esc(it.b.data.title||it.n.title||'Flashcards')}${!c.s?' <span class="st-new">New</span>':''}</div><button class="st-card" id="studyCard" aria-live="polite"><div class="st-face st-front">${sideHTML(c.f,c.ft)}</div><div class="st-face st-back" hidden><div class="st-q">${sideHTML(c.f,c.ft)}</div><hr>${sideHTML(c.b,c.bt)}</div><span class="st-tap">${App.coarse?'Tap':'Click or press Space'} to show the answer</span></button>
   <div class="st-grade" hidden>${[[1,'Again'],[2,'Hard'],[3,'Good'],[4,'Easy']].map(([g,l])=>`<button class="st-g g${g}" data-g="${g}"><b>${l}</b><small>${ivLabel(c,g)}</small><kbd>${g}</kbd></button>`).join('')}</div>`;
  renderMathIn($('#studyBody'));$('#studyCount').textContent=`${ST.i+1} / ${ST.q.length}`;$('#studyBar i').style.width=Math.round(100*ST.i/ST.q.length)+'%';ST.flipped=false;$('#studyCard').focus()}
function flipCard(){if(ST.flipped||!ST.q[ST.i])return;ST.flipped=true;const b=$('#studyBody');b.querySelector('.st-front').hidden=true;b.querySelector('.st-back').hidden=false;b.querySelector('.st-tap').hidden=true;b.querySelector('.st-grade').hidden=false;b.querySelector('.st-g.g3').focus()}
function gradeCard(g){const it=ST.q[ST.i];if(!it||!ST.flipped)return;schedule(it.c,g);ST.done++;if(g===1){ST.again++;ST.q.push(it)}App.noteChanged(it.n);ST.i++;showCard()}
function closeStudy(){$('#studyScrim').hidden=true;document.body.classList.remove('sk-lock');if(App.mode==='cards')renderCardsPage();document.querySelectorAll('.block-cards').forEach(s=>{const ed=App.decks&&App.decks.find(d=>d.host.closest('.block')===s);if(ed)ed.stats()})}
function wireStudy(){
  $('#studyScrim').addEventListener('click',e=>{if(e.target.closest('#studyCard'))return flipCard();const g=e.target.closest('[data-g]');if(g)return gradeCard(+g.dataset.g);const s=e.target.closest('[data-st]');if(s){if(s.dataset.st==='close')closeStudy();else startStudy(ST.decks,true)}});
  $('#studyClose').onclick=closeStudy;
  document.addEventListener('keydown',e=>{if($('#studyScrim').hidden)return;e.stopPropagation();if(e.key==='Escape'){e.preventDefault();closeStudy()}else if(e.key===' '||e.key==='Enter'){if(!ST.flipped&&ST.q[ST.i]){e.preventDefault();flipCard()}}else if(ST.flipped&&/^[1-4]$/.test(e.key)){e.preventDefault();gradeCard(+e.key)}},true);
}
/* Flashcards section */
function newDeck(){const n={id:uid(),title:'New flashcards',tag:'',tags:[],folder:folderById(VIEW.folder)?VIEW.folder:'',updated:Date.now(),blocks:[{id:uid(),type:'cards',data:emptyDeck()}]};App.notes.push(n);App.noteChanged(n);setMode('notes');openNote(n.id);const t=document.querySelector('.fc-title');if(t)t.focus()}
function renderCardsPage(){
  const decks=allDecks(),now=Date.now();let due=0,nw=0,tot=0;const rows=decks.map(x=>{const s=deckStats(x.d,now);due+=s.due;nw+=s.nw;tot+=s.total;return{...x,s}});
  $('#cardsPage').innerHTML=`<header class="gd-head"><div class="hm-kicker">Flashcards</div><h1>Study</h1><p class="hm-muted">Bondline shows each card again just before you'd forget it. Cards you find hard come back sooner.</p></header>
  <div class="fc-sum"><div><b>${due}</b><span>due now</span></div><div><b>${nw}</b><span>new</span></div><div><b>${tot}</b><span>cards</span></div><div class="fc-sumb"><button class="btn primary" data-fcall="due" ${due+nw?'':'disabled'}>Study ${due+nw?due+nw+' ':''}due and new</button><button class="btn" data-fcall="all" ${tot?'':'disabled'}>Practise all</button></div></div>
  ${rows.length?`<div class="fc-decks">${rows.map((x,i)=>`<div class="fc-deck"><div class="fc-dt"><b>${esc(x.d.title||x.n.title||'Untitled deck')}</b>${x.d.title&&x.n.title&&x.d.title!==x.n.title?`<small>in ${esc(x.n.title)}</small>`:''}</div><div class="fc-dm">${x.s.total} cards${x.s.due?` · <b>${x.s.due} due</b>`:''}${x.s.nw?` · ${x.s.nw} new`:''}</div><div class="fc-db"><button class="btn small primary" data-deck="${i}" data-dk="due" ${x.s.due+x.s.nw?'':'disabled'}>Study</button><button class="btn small" data-deck="${i}" data-dk="all" ${x.s.total?'':'disabled'}>Practise all</button><button class="linkbtn" data-deck="${i}" data-dk="edit">Edit cards</button></div></div>`).join('')}</div>`
  :`<div class="fc-emptybox"><p>No flashcards yet. Make a deck here, add a Flashcards block to any note, or select text in a note and press <b>+ Card</b>.</p></div>`}
  <div style="margin-top:16px"><button class="btn" data-fcall="new">+ New deck</button></div>`;
  App._decks=rows;
  $('#deckList').innerHTML=rows.map((x,i)=>`<button class="item" data-deckside="${i}"><span class="t">${esc(x.d.title||x.n.title||'Untitled deck')}</span><span class="m"><span>${x.s.total} cards</span>${x.s.due?`<span class="tag">${x.s.due} due</span>`:''}</span></button>`).join('')||'<div class="empty-list">No decks yet.</div>';
}
function cardsClick(e){const a=e.target.closest('[data-fcall]');if(a){const k=a.dataset.fcall;if(k==='new')return newDeck();return startStudy(allDecks().map(x=>x.b),k==='all')}
  const d=e.target.closest('[data-deck],[data-deckside]');if(!d)return;const x=App._decks[+(d.dataset.deck||d.dataset.deckside)];if(!x)return;const k=d.dataset.dk||'due';
  if(k==='edit'){setMode('notes');openNote(x.n.id);const s=document.querySelector(`.block[data-id="${x.b.id}"]`);if(s)s.scrollIntoView({block:'start'});return}
  startStudy([x.b],k==='all')}

/* ---------- spectroscopy helpers: NMR environments, IR peaks, mass spectrum isotope pattern ---------- */
function specGraph(m){
  const G=foldH(m),n=G.atoms.length;
  /* aromatic six-membered rings drawn as Kekulé structures: treat their bonds as 1.5 so symmetry isn't broken by where the double bonds were drawn */
  const ord=G.bonds.map(b=>b.o),arom=new Array(n).fill(false);
  const nb=i=>G.adj[i].map(e=>e.to);
  const seen=new Set();
  for(let s=0;s<n;s++){const st=[[s,[s]]];while(st.length){const[x,p]=st.pop();if(p.length===6){if(nb(x).includes(s)){const ring=p,key=[...ring].sort((a,b)=>a-b).join(',');if(seen.has(key))continue;seen.add(key);
        const bis=ring.map((a,i)=>G.adj[a].find(e=>e.to===ring[(i+1)%6]).bi),os=bis.map(bi=>G.bonds[bi].o);
        const alt=os.every((o,i)=>o!==os[(i+1)%6]&&(o===1||o===2))||os.every(o=>o===1.5);
        if(alt&&ring.every(a=>['C','N'].includes(G.atoms[a].el))){ring.forEach(a=>arom[a]=true);bis.forEach(bi=>ord[bi]=1.5)}}continue}
      for(const y of nb(x))if(y>s&&!p.includes(y))st.push([y,p.concat(y)])}}
  /* Weisfeiler–Lehman refinement → topologically equivalent atoms */
  let lab=G.atoms.map((a,i)=>[a.el,a.charge||0,a.h||0,G.adj[i].length,arom[i]?1:0].join('|'));
  for(let it=0;it<n+1;it++){
    const next=G.atoms.map((a,i)=>lab[i]+'['+G.adj[i].map(e=>ord[e.bi]+':'+lab[e.to]).sort().join(',')+']');
    const uniq=[...new Set(next)].sort(),id=new Map(uniq.map((x,k)=>[x,'c'+k]));const nl=next.map(x=>id.get(x));
    const same=new Set(nl).size===new Set(lab).size;lab=nl;if(same&&it>0)break}
  return{G,ord,arom,cls:lab}}
const SPMULT=['s','d','t','q','quintet','sextet','septet'];const SPMULT_LONG={s:'singlet',d:'doublet',t:'triplet',q:'quartet'};
function hasDouble(G,ord,i,el){return G.adj[i].some(e=>ord[e.bi]===2&&G.atoms[e.to].el===el)}
function isCarbonyl(G,ord,i){return G.atoms[i].el==='C'&&hasDouble(G,ord,i,'O')}
const A2=(G,j)=>{const e=G.atoms[j].el;return e==='O'?'O':e==='N'?'N':['F','Cl','Br','I'].includes(e)?e:null};
function hShift(G,ord,arom,i){
  const a=G.atoms[i],nbs=G.adj[i].map(e=>({j:e.to,o:ord[e.bi],a:G.atoms[e.to]}));
  if(a.el==='O'){const c=nbs[0];if(c&&isCarbonyl(G,ord,c.j))return['10–12','carboxylic acid O–H (broad)'];if(c&&arom[c.j])return['4–7','phenol O–H (broad)'];return['1–5','alcohol O–H (broad, position varies)']}
  if(a.el==='N'){const c=nbs.find(x=>isCarbonyl(G,ord,x.j));return c?['5–8','amide N–H (broad)']:['1–3','amine N–H (broad, position varies)']}
  if(a.el==='S')return['1–2','thiol S–H'];
  if(a.el!=='C')return['?',''];
  if(arom[i])return['6.5–8','aromatic C–H'];
  if(hasDouble(G,ord,i,'O'))return['9–10','aldehyde C–H'];
  if(nbs.some(x=>x.o===3))return['2–3','alkyne C–H'];
  if(nbs.some(x=>x.o===2&&x.a.el==='C'))return['4.5–6.5','alkene C–H'];
  const near=[];for(const x of nbs){const e=x.a.el;if(e==='O')near.push(G.adj[x.j].some(y=>y.to!==i&&isCarbonyl(G,ord,y.to))?['3.7–4.1','next to the O of an ester']:['3.3–4','next to O']);else if(e==='N')near.push(['2.2–2.9','next to N']);else if(e==='F')near.push(['4.2–4.5','next to F']);else if(e==='Cl')near.push(['3.4–3.6','next to Cl']);else if(e==='Br')near.push(['3.2–3.5','next to Br']);else if(e==='I')near.push(['3.0–3.2','next to I']);
    else if(e==='C'){if(isCarbonyl(G,ord,x.j))near.push(['2.0–2.7','next to C=O']);else if(arom[x.j])near.push(['2.2–2.9','next to a benzene ring']);else if(G.adj[x.j].some(y=>ord[y.bi]===3&&G.atoms[y.to].el==='N'))near.push(['2.0–2.5','next to C≡N']);else if(G.adj[x.j].some(y=>ord[y.bi]===2&&G.atoms[y.to].el==='C'))near.push(['1.6–2.3','next to C=C'])}}
  const lo=x=>parseFloat(x[0]);near.sort((p,q)=>lo(q)-lo(p));
  if(near.length>1&&lo(near[0])>=2.5)return[near[0][0].replace(/–.*/,'')+'–'+(parseFloat(near[0][0].split('–')[1])+1).toFixed(1),near.map(x=>x[1]).join(', ')];
  if(near.length)return near[0];
  const beta=nbs.filter(x=>x.a.el==='C').map(x=>G.adj[x.j].filter(y=>y.to!==i).map(y=>A2(G,y.to)).find(Boolean)).find(Boolean);if(beta)return['1.0–2.0','one carbon away from '+beta];
  return a.h===3?['0.8–1.0','CH₃ on an alkyl chain']:a.h===2?['1.2–1.4','CH₂ on an alkyl chain']:['1.4–1.7','CH on an alkyl chain']}
function cShift(G,ord,arom,i){
  const nbs=G.adj[i].map(e=>({j:e.to,o:ord[e.bi],a:G.atoms[e.to]}));
  if(isCarbonyl(G,ord,i)){const het=nbs.filter(x=>x.o===1&&['O','N','Cl','Br'].includes(x.a.el));return het.length?['160–185','C=O of an acid, ester, amide or acyl chloride']:['190–220','C=O of a ketone or aldehyde']}
  if(nbs.some(x=>x.o===3&&x.a.el==='N'))return['115–125','nitrile C≡N'];
  if(nbs.some(x=>x.o===3))return['65–90','alkyne C'];
  if(arom[i])return nbs.some(x=>x.a.el==='O'||x.a.el==='N')?['140–160','aromatic C bonded to O or N']:['110–150','aromatic C'];
  if(nbs.some(x=>x.o===2))return['100–150','alkene C'];
  if(nbs.some(x=>x.a.el==='O'))return['50–90','C–O'];
  if(nbs.some(x=>x.a.el==='N'))return['30–65','C–N'];
  if(nbs.some(x=>x.a.el==='Cl'))return['30–50','C–Cl'];if(nbs.some(x=>x.a.el==='Br'))return['25–40','C–Br'];if(nbs.some(x=>x.a.el==='I'))return['0–20','C–I'];if(nbs.some(x=>x.a.el==='F'))return['80–95','C–F'];
  return['0–50','alkyl C']}
function irPeaks(G,ord,arom){
  const P=[],add=(r,t,s)=>{if(!P.some(p=>p[1]===t))P.push([r,t,s||''])};const A=G.atoms;
  A.forEach((a,i)=>{const nbs=G.adj[i].map(e=>({j:e.to,o:ord[e.bi],a:A[e.to]}));
    if(a.el==='O'&&a.h){const c=nbs[0];if(c&&isCarbonyl(G,ord,c.j))add('2500–3300','O–H (carboxylic acid)','very broad');else add('3200–3550','O–H (alcohol or phenol)','broad, strong')}
    if(a.el==='N'&&a.h)add('3300–3500','N–H',a.h>=2?'two bands (NH₂)':'one band');
    if(a.el==='C'&&a.h){if(arom[i]||nbs.some(x=>x.o===2&&x.a.el==='C'))add('3000–3100','C–H (sp², alkene or aromatic)');else if(nbs.some(x=>x.o===3))add('≈3300','C–H (alkyne, sharp)');else if(!hasDouble(G,ord,i,'O'))add('2850–2960','C–H (sp³)')}
    if(a.el==='C'&&a.h&&hasDouble(G,ord,i,'O'))add('2720 and 2820','C–H (aldehyde)','two weak peaks');
    if(a.el==='C'&&nbs.some(x=>x.o===3&&x.a.el==='N'))add('2210–2260','C≡N','sharp');
    if(a.el==='C'&&nbs.some(x=>x.o===3&&x.a.el==='C'))add('2100–2260','C≡C','weak');
    if(isCarbonyl(G,ord,i)){const s=nbs.filter(x=>x.o===1);const has=el=>s.some(x=>x.a.el===el);
      if(has('Cl'))add('1785–1815','C=O (acyl chloride)','strong');
      else if(has('N'))add('1630–1690','C=O (amide)','strong');
      else if(has('O')){const o=s.find(x=>x.a.el==='O');if(o.a.h)add('1700–1725','C=O (carboxylic acid)','strong');else if(G.adj[o.j].some(y=>y.to!==i&&isCarbonyl(G,ord,y.to)))add('1820 and 1760','C=O (anhydride)','two strong peaks');else add('1735–1750','C=O (ester)','strong')}
      else if(a.h)add('1720–1740','C=O (aldehyde)','strong');else add('1705–1725','C=O (ketone)','strong')}
    if(a.el==='C'&&!arom[i]&&nbs.some(x=>x.o===2&&x.a.el==='C'))add('1620–1680','C=C (alkene)','medium');
    if(arom[i])add('1450–1600','C=C (aromatic ring)','several peaks');
    if(a.el==='N'&&(a.charge===1)&&nbs.filter(x=>x.a.el==='O').length===2)add('1515–1560 and 1345–1385','N–O (nitro)','two strong peaks');
    if(a.el==='O'&&nbs.length&&nbs.every(x=>x.o===1&&(x.a.el==='C')))add('1000–1300','C–O','strong');
    if(a.el==='Cl'&&nbs[0]&&nbs[0].a.el==='C')add('600–800','C–Cl','fingerprint region');if(a.el==='Br'&&nbs[0]&&nbs[0].a.el==='C')add('500–600','C–Br','fingerprint region');
  });
  return P.sort((p,q)=>parseFloat(q[0].replace('≈',''))-parseFloat(p[0].replace('≈','')))}
const MONO={H:1,C:12,N:14,O:16,F:19,Si:28,P:31,S:32,Cl:35,Br:79,I:127,B:11,Na:23,K:39,Li:7,Mg:24};
function msPattern(F){
  const c=F.counts;if(Object.keys(c).some(k=>MONO[k]==null)||F.pseudo.length)return null;
  let M=0;for(const[k,v]of Object.entries(c))M+=MONO[k]*v;
  let dist=[1];const conv=(p,step)=>{const out=new Array(dist.length+step).fill(0);dist.forEach((x,i)=>p.forEach((y,j)=>{out[i+j*step]+=x*y}));dist=out};
  for(let k=0;k<(c.Cl||0);k++)conv([1,0.3199],2);for(let k=0;k<(c.Br||0);k++)conv([1,0.9728],2);for(let k=0;k<(c.S||0);k++)conv([1,0.0443],2);
  const m1=0.0108*(c.C||0)+0.0037*(c.N||0),peaks=[];
  const mx=Math.max(...dist);dist.forEach((v,i)=>{if(v/mx>0.005)peaks.push([M+i,v/mx])});
  peaks.splice(1,0,[M+1,peaks[0][1]*m1]);peaks.sort((a,b)=>a[0]-b[0]);
  const merged=[];for(const p of peaks){const q=merged.find(x=>x[0]===p[0]);if(q)q[1]+=p[1];else merged.push(p.slice())}
  const top=Math.max(...merged.map(p=>p[1]));return{M,peaks:merged.map(p=>[p[0],p[1]/top]).filter(p=>p[1]>0.01)}}
function predictSpectra(r){
  const{G,ord,arom,cls}=specGraph(r.m);const A=G.atoms;
  if(A.some(a=>a.el==='*'))return{err:'Spectra can\'t be predicted for structures with R groups or abbreviations.'};
  if(A.reduce((s,a)=>s+(a.charge||0),0))return{err:'Spectra are only predicted for neutral molecules.'};
  /* 1H */
  const H=new Map();A.forEach((a,i)=>{if(!a.h)return;const k=cls[i];if(!H.has(k))H.set(k,{i,n:0,atoms:[]});const e=H.get(k);e.n+=a.h;e.atoms.push(i)});
  const hRows=[...H.values()].map(e=>{const i=e.i,a=A[i];const ex=a.el!=='C';let n=0,multi=false;
    if(!ex&&!arom[i]){const seenCls=new Set();for(const x of G.adj[i]){const b=A[x.to];if(b.el==='C'&&b.h&&cls[x.to]!==cls[i]){n+=b.h;seenCls.add(cls[x.to])}}multi=seenCls.size>1}
    const[sh,why]=hShift(G,ord,arom,i);const mult=ex?'broad s':arom[i]?'m':n<=6?SPMULT[n]:'m';
    return{sh,why,n:e.n,mult,lbl:ex?'broad singlet (exchangeable)':arom[i]?'multiplet':mult==='m'?'multiplet':(SPMULT_LONG[mult]||mult),nbH:n,multi,el:a.el}}).sort((p,q)=>parseFloat(q.sh)-parseFloat(p.sh));
  /* 13C */
  const C=new Map();A.forEach((a,i)=>{if(a.el!=='C')return;const k=cls[i];if(!C.has(k))C.set(k,{i,n:0});C.get(k).n++});
  const cRows=[...C.values()].map(e=>{const[sh,why]=cShift(G,ord,arom,e.i);return{sh,why,n:e.n}}).sort((p,q)=>parseFloat(q.sh)-parseFloat(p.sh));
  return{hRows,cRows,ir:irPeaks(G,ord,arom),ms:msPattern(r.formula)}}
function spectraHTML(r){
  const S=predictSpectra(r);if(S.err)return`<p class="sp-note">${esc(S.err)}</p>`;
  const sub=s=>esc(s).replace(/H(\d)/g,'H<sub>$1</sub>');
  const h=S.hRows.length?`<table class="sp-t"><thead><tr><th>δ (ppm)</th><th>H</th><th>Splitting</th><th>Environment</th></tr></thead><tbody>${S.hRows.map(x=>`<tr><td>${x.sh}</td><td>${x.n}H</td><td>${esc(x.lbl)}${x.el==='C'&&!x.lbl.startsWith('multi')&&x.nbH?` <small>(${x.nbH} neighbouring H${x.multi?', approx.':''})</small>`:''}</td><td>${sub(x.why)}</td></tr>`).join('')}</tbody></table>`:'<p class="sp-note">No hydrogens, so no ¹H NMR signals.</p>';
  const c=S.cRows.length?`<table class="sp-t"><thead><tr><th>δ (ppm)</th><th>C</th><th>Environment</th></tr></thead><tbody>${S.cRows.map(x=>`<tr><td>${x.sh}</td><td>${x.n}</td><td>${esc(x.why)}</td></tr>`).join('')}</tbody></table>`:'<p class="sp-note">No carbons.</p>';
  const ir=S.ir.length?`<table class="sp-t"><thead><tr><th>cm⁻¹</th><th>Bond</th><th></th></tr></thead><tbody>${S.ir.map(p=>`<tr><td>${p[0]}</td><td>${esc(p[1])}</td><td>${esc(p[2])}</td></tr>`).join('')}</tbody></table>`:'<p class="sp-note">No characteristic peaks.</p>';
  let ms='';if(S.ms){const W2=Math.max(...S.ms.peaks.map(p=>p[0]))-S.ms.M+2;ms=`<div class="sp-ms" role="img" aria-label="Molecular ion peaks ${S.ms.peaks.map(p=>'m/z '+p[0]+' '+Math.round(p[1]*100)+'%').join(', ')}">${S.ms.peaks.map(p=>`<div class="sp-bar" style="--h:${Math.max(2,Math.round(p[1]*100))}%"><i></i><span>${p[0]}</span><small>${Math.round(p[1]*100)}</small></div>`).join('')}</div><p class="sp-note">M⁺ at m/z ${S.ms.M}. ${r.formula.counts.Cl?`Each Cl gives an M+2 peak about ⅓ the height of M (³⁵Cl : ³⁷Cl ≈ 3 : 1). `:''}${r.formula.counts.Br?`Each Br gives an M+2 peak about as tall as M (⁷⁹Br : ⁸¹Br ≈ 1 : 1). `:''}The small M+1 peak comes from ¹³C (about 1.1% per carbon).</p>`}
  return`<div class="sp-grid"><section><h4>¹H NMR <small>${S.hRows.length} signal${S.hRows.length===1?'':'s'}</small></h4>${h}</section><section><h4>¹³C NMR <small>${S.cRows.length} signal${S.cRows.length===1?'':'s'}</small></h4>${c}</section><section><h4>IR</h4>${ir}</section>${ms?`<section><h4>Mass spectrum: molecular ion</h4>${ms}</section>`:''}</div><p class="sp-note">Predictions from textbook rules. Signal counts assume symmetry-equivalent atoms give one signal; diastereotopic H, long-range and aromatic coupling can split signals further. Shifts are typical ranges, not exact values.</p>`}

/* ---------- named reactions, mechanism rows, mechanism practice ---------- */
const RXN=[{"id": "sn2", "name": "SN2 substitution", "cat": "Substitution", "sum": "A nucleophile replaces a leaving group in one concerted step. Best for methyl and primary substrates; the carbon inverts like an umbrella.", "cond": "Good nucleophile, polar aprotic solvent (e.g. acetone, DMSO). Rate = k[RX][Nu⁻].", "steps": [{"s": "[OH-].CBr", "a": [["0", "1"], ["1-2", "2"]], "r": "", "n": "Hydroxide attacks carbon from the side opposite bromine while the C–Br bond breaks, all in one step."}, {"s": "OC.[Br-]"}]}, {"id": "sn1", "name": "SN1 substitution", "cat": "Substitution", "sum": "The leaving group departs first to give a carbocation, which the nucleophile then traps. Best for tertiary substrates; gives a racemic mixture at a stereocentre.", "cond": "Weak nucleophile (often the solvent, e.g. water or ethanol), polar protic solvent. Rate = k[RX].", "steps": [{"s": "CC(C)(C)Br", "a": [["1-4", "4"]], "r": "", "n": "Slow, rate-determining step: the C–Br bond breaks on its own, giving a planar tertiary carbocation."}, {"s": "C[C+](C)C.O", "add": ["O"], "out": ["[Br-]"], "a": [["4", "1"]], "r": "H₂O", "n": "Water attacks the flat carbocation (from either face)."}, {"s": "CC(C)(C)[OH+][H].O", "add": ["O"], "a": [["6", "5"], ["4-5", "4"]], "r": "H₂O", "n": "A second water molecule removes the proton from the oxonium ion."}, {"s": "CC(C)(C)O.[OH3+]"}]}, {"id": "e2", "name": "E2 elimination", "cat": "Elimination", "sum": "A strong base removes a proton next to the leaving group as the C=C forms and the leaving group departs, in one step. The H and leaving group must be anti-periplanar.", "cond": "Strong, often bulky base (e.g. EtO⁻, t-BuO⁻), heat. Rate = k[RX][base].", "steps": [{"s": "CC[O-].[H]CC(C)Br", "a": [["2", "3"], ["3-4", "4-5"], ["5-7", "7"]], "r": "", "n": "Ethoxide takes a β-hydrogen; the C–H electrons form the π bond while bromide leaves."}, {"s": "CCO.C=CC.[Br-]"}]}, {"id": "e1", "name": "Acid-catalysed dehydration (E1)", "cat": "Elimination", "sum": "An alcohol is protonated so water can leave, the carbocation loses a neighbouring proton and an alkene forms. Follows Zaitsev: the more substituted alkene usually wins.", "cond": "Concentrated H₂SO₄ or H₃PO₄, heat.", "steps": [{"s": "CC(C)(C)O.[H][OH2+]", "a": [["4", "5"], ["5-6", "6"]], "r": "", "n": "The OH group is protonated, turning it into a good leaving group (water)."}, {"s": "CC(C)(C)[OH2+]", "out": ["O"], "a": [["1-4", "4"]], "r": "", "n": "Water leaves, giving a tertiary carbocation (slow step)."}, {"s": "[H]C[C+](C)C.O", "add": ["O"], "out": ["O"], "a": [["5", "0"], ["0-1", "1-2"]], "r": "H₂O", "n": "Water removes a proton from a carbon next to C⁺; those electrons form the C=C."}, {"s": "C=C(C)C.[OH3+]"}]}, {"id": "hbr", "name": "Addition of HBr to an alkene", "cat": "Addition to alkenes", "sum": "The π bond grabs H⁺ to make the more stable carbocation (Markovnikov), then bromide adds.", "cond": "HBr, no peroxides (peroxides switch to anti-Markovnikov radical addition).", "steps": [{"s": "C=CC.[H]Br", "a": [["1-0", "3"], ["3-4", "4"]], "r": "", "n": "The π electrons attack H, so H adds to the end carbon and the more stable secondary carbocation forms."}, {"s": "C[CH+]C.[Br-]", "a": [["3", "1"]], "r": "", "n": "Bromide attacks the carbocation."}, {"s": "CC(C)Br"}]}, {"id": "br2", "name": "Bromination of an alkene", "cat": "Addition to alkenes", "sum": "Br₂ adds across the C=C through a cyclic bromonium ion, so the two bromines end up anti (on opposite faces).", "cond": "Br₂ in CH₂Cl₂ (in water, a bromohydrin forms instead). Decolourises bromine water: a test for C=C.", "steps": [{"s": "C=C.BrBr", "a": [["0-1", "2"], ["2", "0"], ["2-3", "3"]], "r": "", "n": "The π bond attacks the nearer bromine, which uses a lone pair to bond to the other carbon; bromide leaves. A three-membered bromonium ion forms."}, {"s": "C1C[Br+]1.[Br-]", "a": [["3", "0"], ["0-2", "2"]], "r": "", "n": "Bromide opens the ring from the back face, giving anti addition."}, {"s": "BrCCBr"}]}, {"id": "hydration", "name": "Acid-catalysed hydration of an alkene", "cat": "Addition to alkenes", "sum": "The alkene is protonated to give the more stable carbocation, water adds, and the oxonium ion loses H⁺. Markovnikov alcohol.", "cond": "Dilute H₂SO₄ in water, or H₃PO₄ and steam (industrial).", "steps": [{"s": "C=C(C)C.[H][OH2+]", "a": [["1-0", "4"], ["4-5", "5"]], "r": "", "n": "The π bond takes a proton from H₃O⁺, forming a tertiary carbocation."}, {"s": "C[C+](C)C.O", "a": [["4", "1"]], "r": "", "n": "Water attacks the carbocation."}, {"s": "CC(C)(C)[OH+][H].O", "add": ["O"], "a": [["6", "5"], ["4-5", "4"]], "r": "H₂O", "n": "Another water removes the proton, giving the alcohol and regenerating H₃O⁺."}, {"s": "CC(C)(C)O.[OH3+]"}]}, {"id": "cyanohydrin", "name": "Cyanohydrin formation", "cat": "Carbonyl addition", "sum": "Cyanide attacks the carbonyl carbon (at about 107°, the Bürgi–Dunitz angle); the alkoxide is then protonated by HCN, regenerating cyanide.", "cond": "HCN with a little KCN or NaCN as catalyst.", "steps": [{"s": "[C-]#N.CC=O", "a": [["0", "3"], ["3-4", "4"]], "r": "", "n": "Cyanide attacks the δ+ carbonyl carbon; the π electrons move onto oxygen."}, {"s": "CC([O-])C#N.[H]C#N", "add": ["[H]C#N"], "a": [["2", "5"], ["5-6", "6"]], "r": "HCN", "n": "The alkoxide takes a proton from HCN, giving the cyanohydrin and a new cyanide ion."}, {"s": "CC(O)C#N.[C-]#N"}]}, {"id": "nabh4", "name": "Reduction with NaBH₄", "cat": "Carbonyl addition", "sum": "Borohydride delivers hydride (H⁻) to the carbonyl carbon; protonation of the alkoxide gives the alcohol. Ketones give secondary alcohols, aldehydes primary.", "cond": "NaBH₄ in methanol or ethanol. Mild: does not reduce esters or acids.", "steps": [{"s": "[H][BH3-].CC(C)=O", "a": [["1-0", "3"], ["3-5", "5"]], "r": "", "n": "A B–H bond delivers hydride to carbon; the C=O π electrons move onto oxygen."}, {"s": "CC(C)[O-].[H]OC", "add": ["[H]OC"], "out": ["B"], "a": [["3", "4"], ["4-5", "5"]], "r": "MeOH", "n": "The alkoxide is protonated by the solvent."}, {"s": "CC(C)O.C[O-]"}]}, {"id": "grignard", "name": "Grignard addition", "cat": "Carbonyl addition", "sum": "The C–Mg bond is polarised so carbon is nucleophilic; it adds to the carbonyl carbon making a new C–C bond. Acidic workup gives the alcohol. Ketones give tertiary alcohols.", "cond": "RMgBr in dry ether or THF (water destroys the reagent), then H₃O⁺ workup.", "steps": [{"s": "C[Mg]Br.CC(C)=O", "a": [["1-0", "4"], ["4-6", "6"]], "r": "", "n": "The C–Mg electrons attack the carbonyl carbon, forming a C–C bond; the π electrons move to oxygen."}, {"s": "CC(C)(C)[O-].[H][OH2+]", "add": ["[H][OH2+]"], "out": ["[Mg+]Br"], "a": [["4", "5"], ["5-6", "6"]], "r": "H₃O⁺", "n": "Acidic workup protonates the alkoxide."}, {"s": "CC(C)(C)O.O"}]}, {"id": "hemiacetal", "name": "Hemiacetal formation (acid)", "cat": "Carbonyl addition", "sum": "Protonating the carbonyl makes it more electrophilic so a weak nucleophile, an alcohol, can add. Loss of H⁺ gives the hemiacetal.", "cond": "Alcohol with a trace of acid. With excess alcohol and removal of water, the reaction continues to the acetal.", "steps": [{"s": "CC=O.[H][OH2+]", "a": [["2", "3"], ["3-4", "4"]], "r": "", "n": "The carbonyl oxygen is protonated, making the carbon much more electrophilic."}, {"s": "CC=[OH+].OC", "add": ["OC"], "out": ["O"], "a": [["3", "1"], ["1-2", "2"]], "r": "MeOH", "n": "Methanol attacks the activated carbonyl carbon."}, {"s": "CC(O)[O+]([H])C.O", "add": ["O"], "a": [["6", "4"], ["3-4", "3"]], "r": "", "n": "Water removes the proton from the new O⁺, giving the hemiacetal and regenerating the acid catalyst."}, {"s": "CC(O)OC.[OH3+]"}]}, {"id": "aldol", "name": "Aldol reaction", "cat": "Enolates", "sum": "Base removes an α-hydrogen to give an enolate, which attacks a second carbonyl molecule. Protonation gives a β-hydroxy carbonyl; heating can eliminate water to an enone.", "cond": "Dilute NaOH, room temperature (heat for the aldol condensation).", "steps": [{"s": "[OH-].[H]CC=O", "a": [["0", "1"], ["1-2", "2-3"], ["3-4", "4"]], "r": "", "n": "Hydroxide removes an α-proton; the C–H electrons form C=C and push the C=O electrons onto oxygen (enolate)."}, {"s": "C=C[O-].CC=O", "add": ["CC=O"], "out": ["O"], "a": [["2", "2-1"], ["1-0", "4"], ["4-5", "5"]], "r": "CH₃CHO", "n": "The enolate carbon attacks the carbonyl carbon of a second ethanal molecule as the C=O reforms."}, {"s": "O=CCC(C)[O-].[H]O", "add": ["[H]O"], "a": [["5", "6"], ["6-7", "7"]], "r": "H₂O", "n": "The alkoxide takes a proton from water, regenerating hydroxide."}, {"s": "O=CCC(C)O.[OH-]"}]}, {"id": "saponification", "name": "Ester hydrolysis (saponification)", "cat": "Acyl substitution", "sum": "Hydroxide adds to the ester C=O to form a tetrahedral intermediate, which collapses and expels the alkoxide. The final proton transfer makes the reaction irreversible.", "cond": "NaOH(aq), heat, then acidify to obtain the carboxylic acid.", "steps": [{"s": "[OH-].CC(=O)OC", "a": [["0", "2"], ["2-3", "3"]], "r": "", "n": "Hydroxide adds to the carbonyl carbon, forming a tetrahedral intermediate."}, {"s": "CC([O-])(O)OC", "a": [["2", "2-1"], ["1-4", "4"]], "r": "", "n": "The C=O reforms and methoxide is expelled."}, {"s": "CC(=O)O[H].[O-]C", "a": [["5", "4"], ["4-3", "3"]], "r": "", "n": "Methoxide removes the acidic proton: carboxylate and methanol. This step is irreversible."}, {"s": "CC(=O)[O-].CO"}]}, {"id": "amide", "name": "Amide from an acyl chloride", "cat": "Acyl substitution", "sum": "Ammonia adds to the very electrophilic acyl chloride; the tetrahedral intermediate expels chloride, the best leaving group. A second NH₃ takes the proton.", "cond": "Two equivalents of NH₃ or amine (or one plus a base such as pyridine), cold.", "steps": [{"s": "N.CC(=O)Cl", "a": [["0", "2"], ["2-3", "3"]], "r": "", "n": "Ammonia uses its lone pair to attack the carbonyl carbon."}, {"s": "CC([O-])(Cl)[NH3+]", "a": [["2", "2-1"], ["1-3", "3"]], "r": "", "n": "The tetrahedral intermediate collapses, expelling chloride."}, {"s": "CC(=O)[NH2+][H].N", "add": ["N"], "out": ["[Cl-]"], "a": [["5", "4"], ["3-4", "3"]], "r": "NH₃", "n": "A second ammonia removes a proton from nitrogen."}, {"s": "CC(N)=O.[NH4+]"}]}, {"id": "wittig", "name": "Wittig reaction", "cat": "Carbonyl addition", "sum": "A phosphorus ylide adds to an aldehyde or ketone; a four-membered oxaphosphetane forms and falls apart into an alkene and a very strong P=O bond. Drawn here with Me₃P instead of Ph₃P to keep it small.", "cond": "Ph₃P=CHR (made from a phosphonium salt and a strong base such as BuLi), THF.", "steps": [{"s": "[CH2-][P+](C)(C)C.CC=O", "a": [["0", "6"], ["6-7", "7"]], "r": "", "n": "The ylide carbon attacks the carbonyl carbon."}, {"s": "C[P+](C)(C)CC(C)[O-]", "a": [["7", "1"]], "r": "", "n": "The oxygen anion bonds to phosphorus, closing a four-membered ring (oxaphosphetane)."}, {"s": "CP1(C)(C)CC(C)O1", "a": [["1-4", "4-5"], ["5-7", "7-1"]], "r": "", "n": "The ring breaks apart: a C=C and a P=O form. The strong P=O bond drives the reaction."}, {"s": "C=CC.CP(C)(C)=O"}]}, {"id": "dielsalder", "name": "Diels–Alder reaction", "cat": "Pericyclic", "sum": "A diene and a dienophile join in one concerted step through a cyclic six-electron transition state, making a cyclohexene and two new C–C σ bonds.", "cond": "Heat. Electron-poor dienophiles (C=C–C=O, C=C–CN) react fastest; the diene must be s-cis.", "steps": [{"s": "C=CC=C.C=C", "a": [["2-3", "4"], ["4-5", "0"], ["0-1", "1-2"]], "r": "", "n": "Three curly arrows move round the ring at the same time: two new σ bonds form and the remaining π bond shifts to the middle."}, {"s": "C1=CCCCC1"}]}, {"id": "nitration", "name": "Nitration of benzene", "cat": "Aromatic substitution", "sum": "Electrophilic aromatic substitution: the ring attacks NO₂⁺ to give a cation (Wheland intermediate), then loses H⁺ to restore aromaticity.", "cond": "Concentrated HNO₃ + H₂SO₄ (which makes NO₂⁺), below 55 °C.", "steps": [{"s": "[H]C1=CC=CC=C1.O=[N+]=O", "a": [["2-1", "8"], ["8-7", "7"]], "r": "", "n": "A π bond of the ring attacks the nitronium ion. Aromaticity is lost (slow step)."}, {"s": "[H]C1([N+](=O)[O-])[CH+]C=CC=C1.O", "add": ["O"], "a": [["10", "0"], ["0-1", "1-5"]], "r": "H₂O", "n": "A base removes the proton from the sp³ carbon and the ring becomes aromatic again."}, {"s": "[O-][N+](=O)C1=CC=CC=C1.[OH3+]"}]}, {"id": "fcacyl", "name": "Friedel–Crafts acylation", "cat": "Aromatic substitution", "sum": "AlCl₃ turns an acyl chloride into an acylium ion, which the benzene ring attacks. Loss of H⁺ restores the ring. The product ketone deactivates the ring, so only one acyl group adds.", "cond": "RCOCl with AlCl₃, then aqueous workup.", "steps": [{"s": "[H]C1=CC=CC=C1.CC#[O+]", "a": [["2-1", "8"], ["8-9", "9"]], "r": "", "n": "The ring attacks the acylium ion carbon."}, {"s": "[H]C1(C(C)=O)[CH+]C=CC=C1.Cl[Al-](Cl)(Cl)Cl", "add": ["Cl[Al-](Cl)(Cl)Cl"], "a": [["11-10", "0"], ["0-1", "1-5"]], "r": "AlCl₄⁻", "n": "An Al–Cl bond delivers chloride to the proton; the C–H electrons restore the aromatic ring. HCl and AlCl₃ are released."}, {"s": "CC(=O)C1=CC=CC=C1.Cl.Cl[Al](Cl)Cl"}]}, {"id": "acidbase", "name": "Acid–base proton transfer", "cat": "Acids and bases", "sum": "The base uses a lone pair to take the proton; the O–H electrons stay on oxygen. The equilibrium favours the side with the weaker acid (higher pKa).", "cond": "Ethanoic acid (pKa 4.8) and hydroxide (water pKa 15.7): lies far to the right.", "steps": [{"s": "CC(=O)O[H].[OH-]", "a": [["5", "4"], ["4-3", "3"]], "r": "", "n": "Hydroxide takes the acidic proton; the O–H bonding pair becomes a lone pair on the carboxylate oxygen."}, {"s": "CC(=O)[O-].O"}]}, {"id": "epoxide", "name": "Epoxide ring opening (base)", "cat": "Substitution", "sum": "Under basic conditions a nucleophile opens the strained three-membered ring by SN2 at the less hindered carbon.", "cond": "NaOMe in MeOH (or other nucleophiles: OH⁻, RNH₂, RMgBr). Under acid, attack moves to the more substituted carbon.", "steps": [{"s": "C[O-].CC1CO1", "a": [["1", "4"], ["4-5", "5"]], "r": "", "n": "Methoxide attacks the less hindered CH₂ carbon; ring strain is released as the C–O bond breaks."}, {"s": "COCC(C)[O-].[H]OC", "add": ["[H]OC"], "a": [["5", "6"], ["6-7", "7"]], "r": "MeOH", "n": "The alkoxide is protonated by the solvent."}, {"s": "COCC(C)O.C[O-]"}]}, {"id": "williamson", "name": "Williamson ether synthesis", "cat": "Substitution", "sum": "An alkoxide displaces a halide by SN2 to make an ether. Use a primary halide, otherwise elimination competes.", "cond": "Alcohol + NaH (to make the alkoxide), then a primary alkyl halide, in THF or DMF.", "steps": [{"s": "CC[O-].CI", "a": [["2", "3"], ["3-4", "4"]], "r": "", "n": "The ethoxide oxygen attacks the methyl carbon as iodide leaves."}, {"s": "CCOC.[I-]"}]}, {"id": "enol", "name": "Keto–enol tautomerism (acid)", "cat": "Enolates", "sum": "Protonation of the carbonyl oxygen, then loss of an α-proton, converts the keto form into the enol. The keto form is usually far more stable.", "cond": "Trace acid (or base) catalyst. Explains α-halogenation and racemisation at α-carbons.", "steps": [{"s": "CC(C)=O.[H][OH2+]", "a": [["3", "4"], ["4-5", "5"]], "r": "", "n": "The carbonyl oxygen is protonated."}, {"s": "[H]CC(C)=[OH+].O", "a": [["5", "0"], ["0-1", "1-2"], ["2-4", "4"]], "r": "", "n": "Water removes an α-proton; the C–H electrons form C=C and the C=O π electrons move onto oxygen."}, {"s": "C=C(C)O.[OH3+]"}]}, {"id": "imine", "name": "Imine formation", "cat": "Carbonyl addition", "sum": "A primary amine adds to an aldehyde or ketone, then water is lost to give C=N. Fastest at about pH 5: enough acid to protonate the OH, but not so much that the amine is all protonated.", "cond": "RNH₂ with a trace of acid, removing water. With secondary amines the same route gives an enamine.", "steps": [{"s": "CC=O.NC", "a": [["3", "1"], ["1-2", "2"]], "r": "", "n": "The amine nitrogen attacks the carbonyl carbon."}, {"s": "CC([O-])[NH+]([H])C", "a": [["2", "4"], ["4-3", "3"]], "r": "", "n": "A proton moves from nitrogen to oxygen (in practice via the solvent), giving a neutral carbinolamine."}, {"s": "CC(O)NC.[H][OH2+]", "add": ["[H][OH2+]"], "a": [["2", "5"], ["5-6", "6"]], "r": "H₃O⁺", "n": "The OH group is protonated so it can leave as water."}, {"s": "CC([OH2+])NC", "out": ["O"], "a": [["3", "3-1"], ["1-2", "2"]], "r": "", "n": "The nitrogen lone pair pushes out water, forming an iminium ion."}, {"s": "CC=[N+]([H])C.O", "add": ["O"], "out": ["O"], "a": [["5", "3"], ["3-2", "2"]], "r": "H₂O", "n": "Water removes the N–H proton to give the neutral imine."}, {"s": "CC=NC.[OH3+]"}]}, {"id": "acetal", "name": "Acetal formation", "cat": "Carbonyl addition", "sum": "A hemiacetal loses water (helped by the neighbouring oxygen) to give an oxonium ion, which a second alcohol traps. Acetals are stable to base, so they protect aldehydes and ketones.", "cond": "Excess alcohol, acid catalyst, water removed (e.g. Dean–Stark). Reversed by aqueous acid.", "steps": [{"s": "CC(O)OC.[H][OH2+]", "a": [["2", "5"], ["5-6", "6"]], "r": "", "n": "The hemiacetal OH is protonated."}, {"s": "CC([OH2+])OC", "out": ["O"], "a": [["3", "3-1"], ["1-2", "2"]], "r": "", "n": "The OMe lone pair pushes out water, giving an oxonium ion."}, {"s": "CC=[O+]C.OC", "add": ["OC"], "out": ["O"], "a": [["4", "1"], ["1-2", "2"]], "r": "MeOH", "n": "A second methanol attacks the oxonium carbon."}, {"s": "CC(OC)[O+]([H])C.O", "add": ["O"], "a": [["7", "5"], ["5-4", "4"]], "r": "", "n": "Loss of a proton gives the acetal and regenerates the acid."}, {"s": "CC(OC)OC.[OH3+]"}]}, {"id": "fischer", "name": "Fischer esterification", "cat": "Acyl substitution", "sum": "Acid makes the carboxylic acid carbonyl more electrophilic; the alcohol adds, a proton moves, water leaves and a proton is lost. Every step is reversible.", "cond": "Carboxylic acid + alcohol (often in excess) with conc. H₂SO₄, heat; remove water to drive it forward.", "steps": [{"s": "CC(=O)O.[H][OH2+]", "a": [["2", "4"], ["4-5", "5"]], "r": "", "n": "The carbonyl oxygen is protonated."}, {"s": "CC(O)=[OH+].OC", "add": ["OC"], "out": ["O"], "a": [["4", "1"], ["1-3", "3"]], "r": "MeOH", "n": "Methanol attacks the carbonyl carbon."}, {"s": "CC(O)(O)[O+]([H])C", "a": [["2", "5"], ["5-4", "4"]], "r": "", "n": "A proton moves to one of the OH groups (in practice via the solvent), making a good leaving group."}, {"s": "CC([OH2+])(O)OC", "a": [["3", "3-1"], ["1-2", "2"]], "r": "", "n": "Water leaves as the C=O reforms."}, {"s": "CC(OC)=[O+][H].O", "add": ["O"], "out": ["O"], "a": [["6", "5"], ["5-4", "4"]], "r": "", "n": "Loss of a proton gives the ester."}, {"s": "CC(=O)OC.[OH3+]"}]}, {"id": "claisen", "name": "Claisen condensation", "cat": "Enolates", "sum": "An ester enolate attacks a second ester; the tetrahedral intermediate expels alkoxide to give a β-keto ester. Deprotonation of the acidic product drives the reaction.", "cond": "NaOR matching the ester’s alkoxy group (e.g. NaOMe for methyl esters), then acid workup.", "steps": [{"s": "C[O-].[H]CC(=O)OC", "a": [["1", "2"], ["2-3", "3-4"], ["4-5", "5"]], "r": "", "n": "Methoxide removes an α-proton, giving the ester enolate."}, {"s": "C=C([O-])OC.CC(=O)OC", "add": ["CC(=O)OC"], "out": ["CO"], "a": [["2", "2-1"], ["1-0", "6"], ["6-7", "7"]], "r": "", "n": "The enolate attacks the carbonyl carbon of a second ester molecule."}, {"s": "COC(=O)CC(C)([O-])OC", "a": [["7", "7-5"], ["5-8", "8"]], "r": "", "n": "The tetrahedral intermediate collapses and expels methoxide."}, {"s": "COC(=O)CC(C)=O.C[O-]"}]}, {"id": "michael", "name": "Conjugate (Michael) addition", "cat": "Enolates", "sum": "Soft nucleophiles add to the end carbon (β-carbon) of a C=C–C=O system. The enolate formed is then protonated on carbon.", "cond": "α,β-Unsaturated carbonyl with a soft nucleophile (CN⁻, enolates, R₂CuLi, thiols, amines).", "steps": [{"s": "[C-]#N.C=CC(C)=O", "a": [["0", "2"], ["2-3", "3-4"], ["4-6", "6"]], "r": "", "n": "Cyanide attacks the β-carbon; the electrons move along to the oxygen, giving an enolate."}, {"s": "N#CCC=C(C)[O-].[H]O", "add": ["[H]O"], "a": [["6", "6-4"], ["4-3", "7"], ["7-8", "8"]], "r": "H₂O", "n": "The enolate is protonated on carbon as the C=O reforms."}, {"s": "N#CCCC(C)=O.[OH-]"}]}, {"id": "brbenzene", "name": "Bromination of benzene", "cat": "Aromatic substitution", "sum": "FeBr₃ polarises Br₂ so the ring can attack it. The cationic intermediate then loses H⁺ and aromaticity returns. Benzene doesn’t react with Br₂ alone.", "cond": "Br₂ with FeBr₃ (or Fe filings), room temperature, dark.", "steps": [{"s": "[H]C1=CC=CC=C1.Br[Br+][Fe-](Br)(Br)Br", "a": [["2-1", "7"], ["7-8", "8"]], "r": "", "n": "The ring attacks the outer bromine as the Br–Br bond breaks onto the FeBr₃."}, {"s": "[H]C1(Br)[CH+]C=CC=C1.Br[Fe-](Br)(Br)Br", "a": [["9-8", "0"], ["0-1", "1-3"]], "r": "", "n": "FeBr₄⁻ delivers a bromide to the proton; the C–H electrons restore the aromatic ring."}, {"s": "BrC1=CC=CC=C1.Br.Br[Fe](Br)Br"}]}, {"id": "fcalkyl", "name": "Friedel–Crafts alkylation", "cat": "Aromatic substitution", "sum": "A carbocation (made from an alkyl halide and AlCl₃) is attacked by the ring, then H⁺ is lost. Problems: rearrangements and over-alkylation, because the product is more reactive.", "cond": "RCl with AlCl₃. Here 2-chloropropane gives the isopropyl cation.", "steps": [{"s": "[H]C1=CC=CC=C1.C[CH+]C", "a": [["2-1", "8"]], "r": "", "n": "The ring attacks the carbocation."}, {"s": "[H]C1(C(C)C)[CH+]C=CC=C1.Cl[Al-](Cl)(Cl)Cl", "add": ["Cl[Al-](Cl)(Cl)Cl"], "a": [["11-10", "0"], ["0-1", "1-5"]], "r": "AlCl₄⁻", "n": "The proton is removed and the ring becomes aromatic again."}, {"s": "CC(C)C1=CC=CC=C1.Cl.Cl[Al](Cl)Cl"}]}, {"id": "epoxidation", "name": "Epoxidation with a peroxyacid", "cat": "Addition to alkenes", "sum": "The alkene attacks the weak O–O bond of a peroxyacid in one concerted step, so both C–O bonds form on the same face (stereospecific: cis stays cis). Drawn with peracetic acid; mCPBA works the same way.", "cond": "mCPBA in CH₂Cl₂, room temperature.", "steps": [{"s": "C=C.CC(=O)OO[H]", "a": [["0-1", "6"], ["6", "0"], ["6-5", "5"], ["4", "7"], ["7-6", "6"], ["3-4", "4"], ["5", "5-3"]], "r": "", "n": "All in one step: the π bond attacks the outer oxygen, which bonds to both carbons; the O–O bond breaks and the proton moves to the carbonyl oxygen."}, {"s": "C1CO1.CC(=O)O"}]}, {"id": "epoxideacid", "name": "Epoxide ring opening (acid)", "cat": "Substitution", "sum": "Under acid the epoxide oxygen is protonated first; the nucleophile then attacks the more substituted carbon, which carries more positive charge.", "cond": "Dilute acid in an alcohol or water (compare base, which attacks the less hindered carbon).", "steps": [{"s": "CC1(C)CO1.[H][OH2+]", "a": [["4", "5"], ["5-6", "6"]], "r": "", "n": "The epoxide oxygen is protonated."}, {"s": "CC1(C)C[OH+]1.OC", "add": ["OC"], "out": ["O"], "a": [["5", "1"], ["1-4", "4"]], "r": "MeOH", "n": "Methanol attacks the more substituted carbon, opening the ring."}, {"s": "CC(C)(CO)[O+]([H])C.O", "add": ["O"], "a": [["8", "6"], ["6-5", "5"]], "r": "", "n": "Loss of a proton gives the neutral ether-alcohol."}, {"s": "CC(C)(CO)OC.[OH3+]"}]}, {"id": "lialh4", "name": "Reduction of an ester with LiAlH₄", "cat": "Acyl substitution", "sum": "Hydride adds to the ester, the tetrahedral intermediate expels alkoxide to give an aldehyde, and a second hydride reduces that straight away. Two primary alcohols form after workup.", "cond": "LiAlH₄ in dry ether or THF, then H₃O⁺ workup. NaBH₄ is too weak to reduce esters.", "steps": [{"s": "[H][AlH3-].CC(=O)OC", "a": [["1-0", "3"], ["3-4", "4"]], "r": "", "n": "An Al–H bond delivers hydride to the ester carbonyl carbon."}, {"s": "CC([O-])OC", "out": ["[AlH3]"], "a": [["2", "2-1"], ["1-3", "3"]], "r": "", "n": "The intermediate collapses, expelling methoxide and giving an aldehyde."}, {"s": "[H][AlH3-].CC=O", "add": ["[H][AlH3-]"], "out": ["C[O-]"], "a": [["1-0", "3"], ["3-4", "4"]], "r": "", "n": "The aldehyde is more reactive than the ester, so a second hydride adds at once."}, {"s": "CC[O-].[H][OH2+]", "add": ["[H][OH2+]"], "out": ["[AlH3]"], "a": [["2", "3"], ["3-4", "4"]], "r": "H₃O⁺", "n": "Acidic workup protonates the alkoxide."}, {"s": "CCO.O"}]}, {"id": "aldolcond", "name": "Aldol condensation (E1cB)", "cat": "Enolates", "sum": "On heating, the aldol product loses water: base forms the enolate, which then pushes out hydroxide (E1cB). The product is a conjugated enone or enal.", "cond": "NaOH, heat.", "steps": [{"s": "[OH-].[H]C(C=O)C(C)O", "a": [["0", "1"], ["1-2", "2-3"], ["3-4", "4"]], "r": "", "n": "Hydroxide removes the acidic α-proton, giving an enolate."}, {"s": "[O-]C=CC(C)O", "out": ["O"], "a": [["0", "0-1"], ["1-2", "2-3"], ["3-5", "5"]], "r": "", "n": "The enolate reforms C=O and expels hydroxide from the β-carbon (E1cB)."}, {"s": "O=CC=CC.[OH-]"}]}, {"id": "acylhydrolysis", "name": "Hydrolysis of an acyl chloride", "cat": "Acyl substitution", "sum": "Even water is nucleophilic enough to attack an acyl chloride. Addition, then elimination of chloride, gives the carboxylic acid and HCl (steamy fumes).", "cond": "Water, room temperature. Vigorous; acyl chlorides must be kept dry.", "steps": [{"s": "O.CC(=O)Cl", "a": [["0", "2"], ["2-3", "3"]], "r": "", "n": "Water attacks the carbonyl carbon."}, {"s": "CC([O-])(Cl)[OH2+]", "a": [["2", "2-1"], ["1-3", "3"]], "r": "", "n": "The C=O reforms and chloride leaves."}, {"s": "CC(=O)[OH+][H].O", "add": ["O"], "out": ["[Cl-]"], "a": [["5", "4"], ["4-3", "3"]], "r": "H₂O", "n": "Water removes the proton, giving the carboxylic acid."}, {"s": "CC(=O)O.[OH3+]"}]}];
const RXN_BY=Object.fromEntries(RXN.map(r=>[r.id,r]));
function lpFor(a){const q=a.charge||0;if(a.el==='O')return Math.max(1,Math.min(3,2-q));if(a.el==='N')return Math.max(1,Math.min(3,1-q));if(['F','Cl','Br','I'].includes(a.el))return 3;if(a.el==='S')return 2;if(a.el==='C'&&q<0)return 1;if(a.el==='P')return 1;return 0}
/* lay out a dot-separated species string; returns atoms indexed by the SMILES atom numbers */
function layoutSpecies(d,smi,x0){
  const map=[];let x=x0;const comps=smi.split('.');
  comps.forEach((c,ci)=>{
    const sd=smilesToScheme(c),sa=SMI_MAP.slice();const bb=bbox(sd);const dx=x-bb.x,dy=-(bb.y+bb.h/2);
    for(const a of sd.atoms){a.x=f(a.x+dx);a.y=f(a.y+dy);d.atoms.push(a)}for(const b of sd.bonds)d.bonds.push(b);
    sa.forEach(a=>map.push(a));x+=bb.w;
    if(ci<comps.length-1){x+=14;d.texts.push({id:uid(),x:f(x),y:f(5),text:'+'});x+=textW('+',FS)+14}
  });
  return{map,x}}
function tokAnchor(d,map,tok){if(tok.includes('-')){const[i,j]=tok.split('-').map(Number),A=map[i],B=map[j];const b=d.bonds.find(b=>(b.a===A.id&&b.b===B.id)||(b.a===B.id&&b.b===A.id));return b?{kind:'bond',id:b.id}:{kind:'atom',id:B.id}}return{kind:'atom',id:map[+tok].id}}
/* one mechanism step as a drawing: species, curly arrows, reaction arrow, next species */
function mechRow(rx,k,opts={}){
  const st=rx.steps[k],nx=rx.steps[k+1],d=emptyScheme(200);
  const L1=layoutSpecies(d,st.s,16);const answer=(st.a||[]).map(([fr,to])=>({from:tokAnchor(d,L1.map,fr),to:tokAnchor(d,L1.map,to)}));
  for(const c of answer)if(c.from.kind==='atom'){const a=getAtom(d,c.from.id);if(a&&!a.lp){const n=lpFor(a);if(n)a.lp=n}}
  if(nx){let x=L1.x+18;const aw=Math.max(70,textW(st.r||'',FS)+20);
    const nxW=(()=>{const t=emptyScheme(200);return layoutSpecies(t,nx.s,0).x})();
    if(x+aw+16+nxW>W-10){/* second line for the products */const yOff=Math.max(...d.atoms.map(a=>a.y))+70;const t=emptyScheme(200);const L2=layoutSpecies(t,nx.s,16+aw+16);
      d.arrows.push({id:uid(),kind:'arr',x1:16,y1:yOff,x2:16+aw,y2:yOff,above:st.r||'',below:''});for(const a of t.atoms){a.y=f(a.y+yOff);d.atoms.push(a)}d.bonds.push(...t.bonds);t.texts.forEach(q=>{q.y=f(q.y+yOff);d.texts.push(q)})}
    else{d.arrows.push({id:uid(),kind:'arr',x1:f(x),y1:0,x2:f(x+aw),y2:0,above:st.r||'',below:''});layoutSpecies(d,nx.s,x+aw+16)}}
  if(!opts.noCurls)for(const c of answer){const cu={id:uid(),from:c.from,to:c.to,bend:.4};d.curls.push(cu)}
  /* shift into view */
  const bb=bbox(d);const top=Math.min(bb.y,...d.arrows.map(a=>a.y1-24));const dy=34-top;for(const a of d.atoms)a.y=f(a.y+dy);for(const t of d.texts)t.y=f(t.y+dy);for(const a of d.arrows){a.y1=f(a.y1+dy);a.y2=f(a.y2+dy)}
  for(const cu of d.curls)cu.bend=Editor.prototype.autoBend.call({d},cu);
  const bb2=bbox(d);d.h=Math.max(160,Math.ceil(bb2.y+bb2.h+30));
  return{d,answer}}
/* ---------- library dialog ---------- */
const RL={q:'',cat:null,cur:null};
function openLibrary(id){$('#rxnScrim').hidden=false;document.body.classList.add('sk-lock');if(id)RL.cur=id;renderLibrary();(id?$('#rxnDetail'):$('#rxnSearch')).focus()}
function closeLibrary(){$('#rxnScrim').hidden=true;document.body.classList.remove('sk-lock')}
function renderLibrary(){
  const cats=[...new Set(RXN.map(r=>r.cat))],q=RL.q.toLowerCase();
  $('#rxnCats').innerHTML=`<button class="tf${!RL.cat?' on':''}" data-rcat="">All</button>`+cats.map(c=>`<button class="tf${RL.cat===c?' on':''}" data-rcat="${esc(c)}">${esc(c)}</button>`).join('');
  const list=RXN.filter(r=>(!RL.cat||r.cat===RL.cat)&&(!q||(r.name+' '+r.cat+' '+r.sum+' '+r.cond).toLowerCase().includes(q)));
  $('#rxnList').innerHTML=list.map(r=>`<button class="item${RL.cur===r.id?' on':''}" data-rx="${r.id}"><span class="t">${esc(r.name)}</span><span class="m"><span>${esc(r.cat)}</span><span>${r.steps.filter(s=>s.a).length} step${r.steps.filter(s=>s.a).length>1?'s':''}</span></span></button>`).join('')||'<div class="empty-list">No reactions match.</div>';
  const r=RXN_BY[RL.cur];
  if(!r){$('#rxnDetail').innerHTML=`<div class="rx-empty"><h2>Reaction library</h2><p>${RXN.length} core reactions, each with its mechanism drawn step by step. Pick one to see it, add it to a note, or practise drawing the curly arrows.</p></div>`;return}
  const rows=r.steps.slice(0,-1).map((s,k)=>{const{d}=mechRow(r,k);return`<div class="rx-step"><div class="rx-sn">Step ${k+1}</div><p>${esc(s.n||'')}</p><div class="rx-svg">${structSVG(d,1)}</div></div>`}).join('');
  $('#rxnDetail').innerHTML=`<div class="rx-head"><div class="hm-kicker">${esc(r.cat)}</div><h2>${esc(r.name)}</h2><p>${esc(r.sum)}</p><p class="rx-cond"><b>Conditions</b> ${esc(r.cond)}</p><div class="rx-btns"><button class="btn primary" data-rxa="insert">Add to ${App.cur&&App.mode==='notes'?'this note':'a new note'}</button><button class="btn" data-rxa="practise">Practise this mechanism</button>${App.cur&&App.mode==='notes'?'<button class="btn" data-rxa="new">Add to a new note</button>':''}</div></div>${rows}`;
}
function insertReaction(r,newNote){
  let n=App.mode==='notes'&&App.cur&&!newNote?App.cur:null;
  if(!n){n={id:uid(),title:r.name,tag:'',tags:[r.cat],folder:folderById(VIEW.folder)?VIEW.folder:'',updated:Date.now(),blocks:[]};App.notes.push(n)}
  n.blocks.push({id:uid(),type:'text',html:`<h2>${esc(r.name)}</h2><p>${esc(r.sum)}</p><div data-callout="key"><p><b>Conditions:</b> ${esc(r.cond)}</p></div>`});
  r.steps.slice(0,-1).forEach((s,k)=>{n.blocks.push({id:uid(),type:'text',html:`<p><b>Step ${k+1}.</b> ${esc(s.n||'')}</p>`});n.blocks.push({id:uid(),type:'scheme',data:mechRow(r,k).d})});
  App.noteChanged(n);closeLibrary();setMode('notes');openNote(n.id);toast(`Added “${r.name}”. Press 3D on a drawing to watch it.`)}
function wireLibrary(){
  $('#rxnSearch').addEventListener('input',e=>{RL.q=e.target.value;renderLibrary()});
  $('#rxnScrim').addEventListener('click',e=>{if(e.target.id==='rxnScrim'||e.target.closest('#rxnClose'))return closeLibrary();
    const c=e.target.closest('[data-rcat]');if(c){RL.cat=c.dataset.rcat||null;renderLibrary();return}
    const it=e.target.closest('[data-rx]');if(it){RL.cur=it.dataset.rx;renderLibrary();$('#rxnDetail').scrollTop=0;return}
    const a=e.target.closest('[data-rxa]');if(a){const r=RXN_BY[RL.cur];if(a.dataset.rxa==='practise'){closeLibrary();openPractice(r.id)}else insertReaction(r,a.dataset.rxa==='new')}});
}
/* ---------- mechanism practice ---------- */
const MP={queue:[],i:0,ed:null,prevTool:null,score:0,tried:0};
function practiceItems(id){const out=[];for(const r of RXN){if(id&&r.id!==id)continue;r.steps.forEach((s,k)=>{if(s.a&&s.a.length)out.push({r,k})})}return out}
function openPractice(id){MP.queue=id?practiceItems(id):shuffle(practiceItems());MP.i=0;MP.score=0;MP.tried=0;MP.prevTool=App.tool;MP.prevActive=App.active;$('#mechScrim').hidden=false;document.body.classList.add('sk-lock');
  $('#mpWhich').innerHTML=`<option value="">All reactions (mixed)</option>`+RXN.map(r=>`<option value="${r.id}"${r.id===id?' selected':''}>${esc(r.name)}</option>`).join('');showProblem()}
function closePractice(){$('#mechScrim').hidden=true;document.body.classList.remove('sk-lock');if(MP.prevTool)setTool(MP.prevTool);App.active=null;App.setActive(App.editors.includes(MP.prevActive)?MP.prevActive:(App.editors[0]||null));MP.ed=null}
function showProblem(){
  const it=MP.queue[MP.i];if(!it){$('#mpBody').innerHTML=`<div class="st-end"><div class="st-big">✓</div><h2>Practice complete</h2><p>You got ${MP.score} of ${MP.tried} steps right first time.</p><div class="st-endrow"><button class="btn" data-mp="close">Done</button><button class="btn primary" data-mp="restart">Practise again</button></div></div>`;$('#mpCount').textContent='';return}
  const{r,k}=it,{d,answer}=mechRow(r,k,{noCurls:true});MP.answer=answer;MP.first=true;MP.shown=false;
  const st=r.steps[k];
  $('#mpCount').textContent=`${MP.i+1} / ${MP.queue.length}`;
  $('#mpBody').innerHTML=`<div class="mp-q"><div class="hm-kicker">${esc(r.name)} · step ${k+1} of ${r.steps.length-1}</div><h2>Draw the curly arrows for this step</h2><p class="hm-muted">The product is shown on the right. Drag from a lone pair (an atom) or a bond to where the electrons go. This step needs <b>${answer.length}</b> arrow${answer.length>1?'s':''}.</p></div>
   <div class="mp-tools" role="toolbar" aria-label="Practice tools"><button class="btn small on" data-mpt="curl">↷ Curly arrow</button><button class="btn small" data-mpt="select">Move arrow</button><button class="btn small" data-mpt="erase">Eraser</button><button class="btn small" data-mp="undo">Undo</button></div>
   <div class="mp-ed" id="mpEd"></div><div class="mp-fb" id="mpFb" role="status"></div>
   <div class="mp-row"><button class="btn" data-mp="hint">Hint</button><button class="btn" data-mp="show">Show answer</button><span class="np-sp"></span><button class="btn" data-mp="next">Skip</button><button class="btn primary" data-mp="check">Check</button></div>`;
  const blk={id:'mp'+uid(),type:'scheme',data:d};const note={id:'__practice',virtual:true,blocks:[blk],title:''};
  MP.ed=new Editor(blk,$('#mpEd'),note);App.active=null;App.setActive(MP.ed);setTool('curl');if(innerWidth<640)MP.ed.setZoom(1.5);
}
function anchorText(d,a){if(a.kind==='bond'){const b=d.bonds.find(x=>x.id===a.id);if(!b)return'a bond';const A=getAtom(d,b.a),B=getAtom(d,b.b);return`the ${A.el}${['','–','=','≡'][b.order||1]}${B.el} bond`}const x=getAtom(d,a.id);return x?`${x.el}${x.charge?(x.charge>0?'⁺':'⁻'):''}`:'a point'}
function matchArrow(d,ans,c){
  if(c.half)return false;
  if(c.from.kind!==ans.from.kind||c.from.id!==ans.from.id)return false;
  if(c.to.kind===ans.to.kind&&c.to.id===ans.to.id)return true;
  const pa=anchorPos(d,ans.to),pc=anchorPos(d,c.to);if(pa&&pc&&Math.hypot(pa.x-pc.x,pa.y-pc.y)<22)return true;
  if(ans.to.kind==='atom'&&ans.from.kind==='atom'){const ps=anchorPos(d,ans.from);if(ps&&pc&&pa&&Math.hypot((ps.x+pa.x)/2-pc.x,(ps.y+pa.y)/2-pc.y)<24)return true}
  /* a bond pushed onto one of its own atoms: accept the atom, or a point near it */
  return false}
function checkPractice(){
  const d=MP.ed.d,user=d.curls.slice(),ans=MP.answer,used=new Set();let ok=0;const miss=[];
  for(const a of ans){const i=user.findIndex((c,j)=>!used.has(j)&&matchArrow(d,a,c));if(i>=0){used.add(i);ok++}else miss.push(a)}
  const extra=user.length-used.size,fb=$('#mpFb');
  if(!miss.length&&!extra){if(MP.first&&!MP.shown)MP.score++;if(MP.first)MP.tried++;MP.first=false;fb.className='mp-fb ok';fb.innerHTML=`<b>Correct!</b> ${esc(MP.queue[MP.i].r.steps[MP.queue[MP.i].k].n||'')}`;
    const nb=$('#mpBody [data-mp="next"]');nb.textContent='Next';nb.classList.add('primary');$('#mpBody [data-mp="check"]').classList.remove('primary');return}
  if(MP.first){MP.tried++;MP.first=false}
  const hints=[];if(ok)hints.push(`${ok} of ${ans.length} arrow${ans.length>1?'s are':' is'} right.`);
  if(miss.length)hints.push(`Missing: an arrow starting from ${miss.map(a=>a.from.kind==='atom'?'a lone pair on '+anchorText(d,a.from):anchorText(d,a.from)).join(', and one from ')}.`);
  if(extra)hints.push(`${extra} arrow${extra>1?'s don\'t':' doesn\'t'} belong here (or ${extra>1?'point':'points'} to the wrong place).`);
  if(user.some(c=>c.half))hints.push('Use full curly arrows: these steps move electron pairs.');
  fb.className='mp-fb bad';fb.innerHTML=hints.join(' ')}
function showAnswer(){MP.shown=true;const d=MP.ed.d;MP.ed.snap&&MP.ed.snap();d.curls=MP.answer.map(a=>({id:uid(),from:a.from,to:a.to,bend:Editor.prototype.autoBend.call({d},{from:a.from,to:a.to})}));MP.ed.render();const it=MP.queue[MP.i];$('#mpFb').className='mp-fb';$('#mpFb').innerHTML=`<b>Answer:</b> ${esc(it.r.steps[it.k].n||'')}`;if(MP.first){MP.tried++;MP.first=false}}
function wirePractice(){
  $('#mechScrim').addEventListener('click',e=>{const t=e.target.closest('[data-mpt]');if(t){setTool(t.dataset.mpt);$('#mpBody').querySelectorAll('[data-mpt]').forEach(b=>b.classList.toggle('on',b===t));return}
    const a=e.target.closest('[data-mp]');if(!a)return;const k=a.dataset.mp;
    if(k==='close')closePractice();else if(k==='restart'){MP.queue=shuffle(MP.queue);MP.i=0;MP.score=0;MP.tried=0;showProblem()}
    else if(k==='undo')MP.ed&&MP.ed.undo();else if(k==='check')checkPractice();else if(k==='show')showAnswer();
    else if(k==='hint'){const it=MP.queue[MP.i],a0=MP.answer[0];$('#mpFb').className='mp-fb';$('#mpFb').innerHTML=`<b>Hint:</b> start with ${a0.from.kind==='atom'?'a lone pair on '+anchorText(MP.ed.d,a0.from):anchorText(MP.ed.d,a0.from)}. ${esc((it.r.steps[it.k].n||'').split('.')[0])}.`}
    else if(k==='next'){MP.i++;showProblem()}});
  $('#mpClose').onclick=closePractice;
  $('#mpWhich').onchange=e=>{MP.queue=e.target.value?practiceItems(e.target.value):shuffle(practiceItems());MP.i=0;MP.score=0;MP.tried=0;showProblem()};
  document.addEventListener('keydown',e=>{if($('#mechScrim').hidden)return;const k=e.key.toLowerCase(),mod=e.ctrlKey||e.metaKey;
    if(e.target.closest&&e.target.closest('select,input,textarea'))return;
    e.stopPropagation();
    if(e.key==='Escape'){e.preventDefault();closePractice()}
    else if(mod&&k==='z'){e.preventDefault();e.shiftKey?MP.ed.redo():MP.ed.undo()}
    else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();MP.ed.deleteSel()}
    else if(e.key==='Enter'){e.preventDefault();const nb=$('#mpBody [data-mp="next"]');if(nb&&nb.classList.contains('primary'))nb.click();else checkPractice()}
    else if(!mod&&{m:'curl',v:'select',e:'erase'}[k]){setTool({m:'curl',v:'select',e:'erase'}[k]);$('#mpBody').querySelectorAll('[data-mpt]').forEach(b=>b.classList.toggle('on',b.dataset.mpt===App.tool))}},true);
}

/* ---------- quick reference: periodic table, pKa values, functional groups, spectroscopy tables ---------- */
const PT_RAW='H Hydrogen 1.008 2.20|He Helium 4.0026 -|Li Lithium 6.94 0.98|Be Beryllium 9.0122 1.57|B Boron 10.81 2.04|C Carbon 12.011 2.55|N Nitrogen 14.007 3.04|O Oxygen 15.999 3.44|F Fluorine 18.998 3.98|Ne Neon 20.180 -|Na Sodium 22.990 0.93|Mg Magnesium 24.305 1.31|Al Aluminium 26.982 1.61|Si Silicon 28.085 1.90|P Phosphorus 30.974 2.19|S Sulfur 32.06 2.58|Cl Chlorine 35.45 3.16|Ar Argon 39.95 -|K Potassium 39.098 0.82|Ca Calcium 40.078 1.00|Sc Scandium 44.956 1.36|Ti Titanium 47.867 1.54|V Vanadium 50.942 1.63|Cr Chromium 51.996 1.66|Mn Manganese 54.938 1.55|Fe Iron 55.845 1.83|Co Cobalt 58.933 1.88|Ni Nickel 58.693 1.91|Cu Copper 63.546 1.90|Zn Zinc 65.38 1.65|Ga Gallium 69.723 1.81|Ge Germanium 72.630 2.01|As Arsenic 74.922 2.18|Se Selenium 78.971 2.55|Br Bromine 79.904 2.96|Kr Krypton 83.798 3.00|Rb Rubidium 85.468 0.82|Sr Strontium 87.62 0.95|Y Yttrium 88.906 1.22|Zr Zirconium 91.224 1.33|Nb Niobium 92.906 1.6|Mo Molybdenum 95.95 2.16|Tc Technetium (98) 1.9|Ru Ruthenium 101.07 2.2|Rh Rhodium 102.91 2.28|Pd Palladium 106.42 2.20|Ag Silver 107.87 1.93|Cd Cadmium 112.41 1.69|In Indium 114.82 1.78|Sn Tin 118.71 1.96|Sb Antimony 121.76 2.05|Te Tellurium 127.60 2.1|I Iodine 126.90 2.66|Xe Xenon 131.29 2.6|Cs Caesium 132.91 0.79|Ba Barium 137.33 0.89|La Lanthanum 138.91 1.10|Ce Cerium 140.12 1.12|Pr Praseodymium 140.91 1.13|Nd Neodymium 144.24 1.14|Pm Promethium (145) -|Sm Samarium 150.36 1.17|Eu Europium 151.96 -|Gd Gadolinium 157.25 1.20|Tb Terbium 158.93 -|Dy Dysprosium 162.50 1.22|Ho Holmium 164.93 1.23|Er Erbium 167.26 1.24|Tm Thulium 168.93 1.25|Yb Ytterbium 173.05 -|Lu Lutetium 174.97 1.27|Hf Hafnium 178.49 1.3|Ta Tantalum 180.95 1.5|W Tungsten 183.84 2.36|Re Rhenium 186.21 1.9|Os Osmium 190.23 2.2|Ir Iridium 192.22 2.20|Pt Platinum 195.08 2.28|Au Gold 196.97 2.54|Hg Mercury 200.59 2.00|Tl Thallium 204.38 1.62|Pb Lead 207.2 2.33|Bi Bismuth 208.98 2.02|Po Polonium (209) 2.0|At Astatine (210) 2.2|Rn Radon (222) -|Fr Francium (223) 0.7|Ra Radium (226) 0.9|Ac Actinium (227) 1.1|Th Thorium 232.04 1.3|Pa Protactinium 231.04 1.5|U Uranium 238.03 1.38|Np Neptunium (237) 1.36|Pu Plutonium (244) 1.28|Am Americium (243) 1.3|Cm Curium (247) 1.3|Bk Berkelium (247) 1.3|Cf Californium (251) 1.3|Es Einsteinium (252) 1.3|Fm Fermium (257) 1.3|Md Mendelevium (258) 1.3|No Nobelium (259) 1.3|Lr Lawrencium (266) -|Rf Rutherfordium (267) -|Db Dubnium (268) -|Sg Seaborgium (269) -|Bh Bohrium (270) -|Hs Hassium (277) -|Mt Meitnerium (278) -|Ds Darmstadtium (281) -|Rg Roentgenium (282) -|Cn Copernicium (285) -|Nh Nihonium (286) -|Fl Flerovium (289) -|Mc Moscovium (290) -|Lv Livermorium (293) -|Ts Tennessine (294) -|Og Oganesson (294) -';
const PT=PT_RAW.split('|').map((s,i)=>{const[sym,name,mass,en]=s.split(' ');const z=i+1;return{z,sym,name,mass,en:en==='-'?null:en}});
function ptPos(z){/* returns [row, column] on an 18-column grid; f-block on rows 9 and 10 */
  if(z===1)return[1,1];if(z===2)return[1,18];
  const per=[[3,10,2],[11,18,3],[19,36,4],[37,54,5],[55,86,6],[87,118,7]];
  for(const[a,b,p]of per){if(z<a||z>b)continue;const k=z-a;
    if(p<=3)return[p,k<2?k+1:k+11];
    if(p<=5)return[p,k+1];
    if(k<2)return[p,k+1];if(k<=16)return[p===6?9:10,k+1];return[p,k-13]}
  return[0,0]}
function ptCat(z,sym){if([2,10,18,36,54,86,118].includes(z))return'noble';if([9,17,35,53,85,117].includes(z))return'halogen';if([1,6,7,8,15,16,34].includes(z))return'nonmetal';if([5,14,32,33,51,52].includes(z))return'metalloid';if([3,11,19,37,55,87].includes(z))return'alkali';if([4,12,20,38,56,88].includes(z))return'alkaline';if(z>=57&&z<=71)return'lanth';if(z>=89&&z<=103)return'actin';if((z>=21&&z<=30)||(z>=39&&z<=48)||(z>=72&&z<=80)||(z>=104&&z<=112))return'transition';return'post'}
const PT_CATS={alkali:'Alkali metal',alkaline:'Alkaline earth metal',transition:'Transition metal',post:'Other metal',metalloid:'Metalloid',nonmetal:'Non-metal',halogen:'Halogen',noble:'Noble gas',lanth:'Lanthanide',actin:'Actinide'};
const PKA=[['HI','I⁻',-10],['HBr','Br⁻',-9],['HCl','Cl⁻',-7],['H₂SO₄','HSO₄⁻',-3],['R–C≡N⁺–H (protonated nitrile)','R–C≡N',-10],['R₂C=OH⁺ (protonated ketone)','R₂C=O',-7],['ROH₂⁺ (protonated alcohol)','ROH',-2],['H₃O⁺','H₂O',-1.7],['HNO₃','NO₃⁻',-1.4],['CF₃COOH','CF₃COO⁻',0.2],['HF','F⁻',3.2],['PhCOOH (benzoic acid)','PhCOO⁻',4.2],['CH₃COOH (ethanoic acid)','CH₃COO⁻',4.8],['PhNH₃⁺ (anilinium)','PhNH₂',4.6],['pyridinium','pyridine',5.2],['H₂CO₃','HCO₃⁻',6.4],['H₂S','HS⁻',7.0],['NH₄⁺','NH₃',9.2],['HCN','CN⁻',9.2],['PhOH (phenol)','PhO⁻',10.0],['RSH (thiol)','RS⁻',10.5],['R₃NH⁺ (trialkylammonium)','R₃N',10.7],['CH₂(CO₂Et)₂ (malonate)','⁻CH(CO₂Et)₂',13],['H₂O','HO⁻',15.7],['CH₃OH','CH₃O⁻',15.5],['CH₃CH₂OH','CH₃CH₂O⁻',16],['(CH₃)₃COH','(CH₃)₃CO⁻',18],['CH₃COCH₃ (α-H of a ketone)','enolate',19],['CH₃CO₂Et (α-H of an ester)','enolate',25],['HC≡CH','HC≡C⁻',25],['CH₃CN','⁻CH₂CN',25],['H₂','H⁻',35],['iPr₂NH','iPr₂N⁻ (LDA)',36],['NH₃','NH₂⁻',38],['C₆H₆ (benzene)','C₆H₅⁻',43],['CH₂=CH₂','CH₂=CH⁻',44],['CH₄','CH₃⁻',50]];
const FGS=[['Alkene','C=C','-ene','but-2-ene','CC=CC'],['Alkyne','C≡C','-yne','propyne','CC#C'],['Arene','benzene ring','-benzene / phenyl-','methylbenzene','Cc1ccccc1'],['Haloalkane','C–X','halo- (chloro-, bromo-)','2-bromopropane','CC(C)Br'],['Alcohol','C–OH','-ol / hydroxy-','propan-2-ol','CC(C)O'],['Phenol','Ar–OH','phenol','phenol','Oc1ccccc1'],['Ether','C–O–C','alkoxy- (methoxy-)','methoxyethane','CCOC'],['Thiol','C–SH','-thiol / sulfanyl-','ethanethiol','CCS'],['Amine','C–NH₂','-amine / amino-','ethylamine','CCN'],['Aldehyde','–CHO','-al / formyl-','propanal','CCC=O'],['Ketone','C–CO–C','-one / oxo-','butanone','CCC(C)=O'],['Carboxylic acid','–COOH','-oic acid / carboxy-','propanoic acid','CCC(=O)O'],['Ester','–COO–C','alkyl -oate','methyl ethanoate','CC(=O)OC'],['Acyl chloride','–COCl','-oyl chloride','ethanoyl chloride','CC(=O)Cl'],['Acid anhydride','–CO–O–CO–','-oic anhydride','ethanoic anhydride','CC(=O)OC(C)=O'],['Amide','–CONH₂','-amide / carbamoyl-','ethanamide','CC(N)=O'],['Nitrile','–C≡N','-nitrile / cyano-','propanenitrile','CCC#N'],['Imine','C=N','-imine','propan-2-imine','CC(C)=N'],['Nitro','–NO₂','nitro-','nitrobenzene','[O-][N+](=O)c1ccccc1'],['Epoxide','three-membered C–O–C ring','oxirane','2-methyloxirane','CC1CO1']];
const QR={tab:'pt',sel:6};
function openRef(tab){$('#refScrim').hidden=false;document.body.classList.add('sk-lock');if(tab)QR.tab=tab;renderRef();$('#refClose').focus()}
function closeRef(){$('#refScrim').hidden=true;document.body.classList.remove('sk-lock')}
function renderRef(){
  document.querySelectorAll('#refScrim [data-rtab]').forEach(b=>{const on=b.dataset.rtab===QR.tab;b.classList.toggle('on',on);b.setAttribute('aria-selected',on)});
  const B=$('#refBody');
  if(QR.tab==='calc')return renderCalcTab();
  if(QR.tab==='pt'){const e=PT[QR.sel-1];
    B.innerHTML=`<div class="pt-wrap"><div class="pt">${PT.map(x=>{const[r,c]=ptPos(x.z);return`<button class="pt-el pt-${ptCat(x.z)}${x.z===QR.sel?' on':''}" style="grid-row:${r};grid-column:${c}" data-z="${x.z}" title="${x.name}" aria-label="${x.z} ${x.name}"><small>${x.z}</small><b>${x.sym}</b></button>`}).join('')}<div class="pt-gap" style="grid-row:8;grid-column:1/-1"></div>
      <div class="pt-info" style="grid-row:1/4;grid-column:3/13"><div class="pt-big pt-${ptCat(e.z)}"><small>${e.z}</small><b>${e.sym}</b></div><div><h3>${e.name}</h3><dl><dt>Atomic number</dt><dd>${e.z}</dd><dt>Relative atomic mass</dt><dd>${e.mass}</dd><dt>Electronegativity (Pauling)</dt><dd>${e.en||'—'}</dd><dt>Type</dt><dd>${PT_CATS[ptCat(e.z)]}</dd></dl></div></div></div>
      <div class="pt-key">${Object.entries(PT_CATS).map(([k,v])=>`<span><i class="pt-${k}"></i>${v}</span>`).join('')}</div></div>`}
  else if(QR.tab==='pka'){B.innerHTML=`<p class="hm-muted">Approximate pKa values (in water, or extrapolated). The lower the pKa, the stronger the acid. An acid–base reaction favours the side with the weaker acid (higher pKa).</p><table class="ref-t"><thead><tr><th>Acid</th><th>Conjugate base</th><th>pKa</th></tr></thead><tbody>${PKA.slice().sort((a,b)=>a[2]-b[2]).map(r=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td class="num">${r[2]}</td></tr>`).join('')}</tbody></table>`}
  else if(QR.tab==='fg'){B.innerHTML=`<div class="fg-grid">${FGS.map(g=>`<div class="fg"><div class="fg-mol">${(()=>{try{return smilesSVG(g[4],.85)}catch(e){return''}})()}</div><b>${g[0]}</b><span class="fg-f">${g[1]}</span><span><i>Name ending</i> ${g[2]}</span><span class="hm-muted">e.g. ${g[3]}</span></div>`).join('')}</div>`}
  else{B.innerHTML=`<h3 class="ref-h">IR absorptions</h3><table class="ref-t"><thead><tr><th>Bond</th><th>Wavenumber / cm⁻¹</th><th>Appearance</th></tr></thead><tbody>${[['O–H (alcohol, phenol)','3200–3550','strong, broad'],['O–H (carboxylic acid)','2500–3300','very broad'],['N–H','3300–3500','medium'],['C–H (sp³)','2850–2960','medium–strong'],['C–H (sp², alkene/arene)','3000–3100','medium'],['C–H (alkyne)','≈3300','sharp'],['C–H (aldehyde)','2720 and 2820','weak, two peaks'],['C≡N','2210–2260','sharp'],['C≡C','2100–2260','weak'],['C=O (acyl chloride)','1785–1815','strong'],['C=O (ester)','1735–1750','strong'],['C=O (aldehyde)','1720–1740','strong'],['C=O (ketone)','1705–1725','strong'],['C=O (carboxylic acid)','1700–1725','strong'],['C=O (amide)','1630–1690','strong'],['C=C (alkene)','1620–1680','medium'],['C=C (arene)','1450–1600','several peaks'],['N–O (nitro)','1515–1560, 1345–1385','strong'],['C–O','1000–1300','strong']].map(r=>`<tr><td>${r[0]}</td><td class="num">${r[1]}</td><td>${r[2]}</td></tr>`).join('')}</tbody></table>
   <h3 class="ref-h">¹H NMR chemical shifts</h3><table class="ref-t"><thead><tr><th>Proton</th><th>δ / ppm</th></tr></thead><tbody>${[['CH₃, CH₂, CH on alkyl chains','0.8–1.7'],['next to C=C (allylic)','1.6–2.3'],['next to C=O','2.0–2.7'],['next to a benzene ring (benzylic)','2.2–2.9'],['next to N','2.2–2.9'],['next to Br or Cl','3.2–3.6'],['next to O (alcohol, ether)','3.3–4.0'],['next to the O of an ester','3.7–4.1'],['alkene C=C–H','4.5–6.5'],['aromatic Ar–H','6.5–8.0'],['aldehyde CHO','9–10'],['carboxylic acid COOH','10–12'],['alcohol O–H, amine N–H','1–5 (variable, broad)']].map(r=>`<tr><td>${r[0]}</td><td class="num">${r[1]}</td></tr>`).join('')}</tbody></table>
   <h3 class="ref-h">¹³C NMR chemical shifts</h3><table class="ref-t"><thead><tr><th>Carbon</th><th>δ / ppm</th></tr></thead><tbody>${[['alkyl C','0–50'],['C–N','30–65'],['C–O','50–90'],['alkyne C≡C','65–90'],['alkene C=C','100–150'],['aromatic C','110–160'],['nitrile C≡N','115–125'],['C=O of acids, esters, amides','160–185'],['C=O of aldehydes, ketones','190–220']].map(r=>`<tr><td>${r[0]}</td><td class="num">${r[1]}</td></tr>`).join('')}</tbody></table>
   <h3 class="ref-h">¹H splitting (n + 1 rule)</h3><p class="hm-muted">A signal is split into n + 1 lines by n hydrogens on neighbouring carbons: singlet (0), doublet (1), triplet (2), quartet (3), quintet (4). Hydrogens on O and N usually appear as broad singlets.</p>`}
}
function wireRef(){
  $('#refScrim').addEventListener('click',e=>{if(e.target.id==='refScrim'||e.target.closest('#refClose'))return closeRef();const t=e.target.closest('[data-rtab]');if(t){QR.tab=t.dataset.rtab;renderRef();return}const z=e.target.closest('[data-z]');if(z){QR.sel=+z.dataset.z;renderRef();const b=document.querySelector(`#refBody [data-z="${QR.sel}"]`);if(b)b.focus()}});
}

/* ---------- trash, version history, images, command palette ---------- */
const TRASH_DAYS=30;
function reconcileTrash(){const by=new Map();for(const n of[...App.notes,...App.trash]){const o=by.get(n.id);if(!o||(o.updated||0)<(n.updated||0)||(!!n.deleted&&(o.updated||0)===(n.updated||0)))by.set(n.id,n)}
  App.notes=[...by.values()].filter(n=>!n.deleted);App.trash=[...by.values()].filter(n=>n.deleted).sort((a,b)=>b.deleted-a.deleted)}
function purgeTrash(){const cut=Date.now()-TRASH_DAYS*DAY;const old=App.trash.filter(n=>n.deleted<cut);if(!old.length)return;App.trash=App.trash.filter(n=>n.deleted>=cut);if(Store.mode==='cloud')old.forEach(n=>{if(!n.example)Store.remove(n.id).catch(()=>{})});persistLocal()}
function toastAction(msg,label,fn){const t=$('#toast');t.innerHTML=`<span>${esc(msg)}</span><button class="toast-btn">${esc(label)}</button>`;t.hidden=false;t.querySelector('button').onclick=()=>{t.hidden=true;fn()};clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,6000)}
function trashNote(n){
  App.notes=App.notes.filter(x=>x!==n);const lib=n.id.startsWith('lib-');
  if(lib){App.dismissed.add(n.id);if(Store.mode==='cloud')Store.meta().catch(()=>{})}
  n.deleted=Date.now();n.updated=n.deleted;App.trash.unshift(n);
  if(Store.mode==='cloud'&&!n.example)Store.save(n).catch(()=>setStatus('err'));
  persistLocal();
  const next=sortedNotes(App.notes.filter(inView))[0]||sortedNotes(App.notes.slice())[0];openNote(next?next.id:null);
  toastAction('Note moved to Trash','Undo',()=>restoreNote(n.id));renderTrashLink()}
function restoreNote(id){const n=App.trash.find(x=>x.id===id);if(!n)return;App.trash=App.trash.filter(x=>x!==n);delete n.deleted;n.updated=Date.now();App.notes.push(n);
  if(n.id.startsWith('lib-')){App.dismissed.delete(n.id);if(Store.mode==='cloud')Store.meta().catch(()=>{})}
  persistLocal();flush(n.id);renderList();renderFolders();renderTrashLink();if($('#trashScrim')&&!$('#trashScrim').hidden)renderTrash();toast(`Restored “${n.title||'Untitled note'}”`)}
function deleteForever(id){const n=App.trash.find(x=>x.id===id);if(!n)return;App.trash=App.trash.filter(x=>x!==n);if(Store.mode==='cloud'&&!n.example)Store.remove(n.id).catch(()=>setStatus('err'));persistLocal();renderTrash();renderTrashLink()}
function renderTrashLink(){const b=$('#openTrash');if(b)b.querySelector('b').textContent=App.trash.length?`Trash (${App.trash.length})`:'Trash';const n=$('#sfTrash .sf-n');if(n)n.textContent=App.trash.length||''}
function openTrash(){$('#trashScrim').hidden=false;renderTrash();$('#trashClose').focus()}
function renderTrash(){const L=App.trash;
  $('#trashList').innerHTML=L.length?L.map(n=>{const left=Math.max(0,Math.ceil((n.deleted+TRASH_DAYS*DAY-Date.now())/DAY));return`<div class="tr-row"><div><b>${esc(n.title||'Untitled note')}</b><small>Deleted ${fmtDate(n.deleted)} · ${left} day${left===1?'':'s'} left</small></div><button class="btn small" data-tr="restore" data-id="${esc(n.id)}">Restore</button><button class="linkbtn danger" data-tr="kill" data-id="${esc(n.id)}">Delete forever</button></div>`}).join(''):'<p class="hm-muted">Trash is empty. Deleted notes stay here for 30 days.</p>';
  $('#trashEmpty').hidden=!L.length}
function wireTrash(){$('#trashScrim').addEventListener('click',e=>{if(e.target.id==='trashScrim'||e.target.closest('#trashClose')){$('#trashScrim').hidden=true;return}
  const b=e.target.closest('[data-tr]');if(b){if(b.dataset.tr==='restore')restoreNote(b.dataset.id);else{if(!b.classList.contains('armed')){b.classList.add('armed');b.textContent='Click again';return}deleteForever(b.dataset.id)}return}
  const em=e.target.closest('#trashEmpty');if(em){if(!em.classList.contains('armed')){em.classList.add('armed');em.textContent='Click again to empty';setTimeout(()=>{em.classList.remove('armed');em.textContent='Empty trash'},3000);return}[...App.trash].forEach(n=>deleteForever(n.id));em.classList.remove('armed');em.textContent='Empty trash'}});
  $('#openTrash').onclick=openTrash;renderTrashLink()}

/* version history: snapshots in IndexedDB on this device */
const HIST={db:null,last:{}};
function histDB(){if(HIST.db)return HIST.db;HIST.db=new Promise((res,rej)=>{try{const r=indexedDB.open('bondline-history',1);r.onupgradeneeded=()=>{const s=r.result.createObjectStore('snaps',{keyPath:'k',autoIncrement:true});s.createIndex('note','note')};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}catch(e){rej(e)}});HIST.db.catch(()=>{});return HIST.db}
async function histAll(noteId){const db=await histDB();return new Promise((res,rej)=>{const out=[];const rq=db.transaction('snaps').objectStore('snaps').index('note').openCursor(IDBKeyRange.only(noteId));rq.onsuccess=()=>{const c=rq.result;if(c){out.push(c.value);c.continue()}else res(out.sort((a,b)=>b.at-a.at))};rq.onerror=()=>rej(rq.error)})}
async function snapshot(n,force,why){
  if(!n||n.example||n.virtual)return;const now=Date.now();if(!force&&HIST.last[n.id]&&now-HIST.last[n.id]<10*60000)return;
  try{const db=await histDB();const list=await histAll(n.id);if(!force&&list[0]&&now-list[0].at<10*60000){HIST.last[n.id]=list[0].at;return}
    const body=JSON.stringify({title:n.title,tags:n.tags,blocks:n.blocks,comments:n.comments});if(list[0]&&list[0].body===body){HIST.last[n.id]=now;return}
    const tx=db.transaction('snaps','readwrite'),st=tx.objectStore('snaps');st.add({note:n.id,at:now,why:why||'',body});
    list.slice(39).forEach(s=>st.delete(s.k));list.filter(s=>now-s.at>60*DAY).forEach(s=>st.delete(s.k));HIST.last[n.id]=now}catch(e){}}
const HV={list:[],sel:0};
async function openHistory(){const n=App.cur;if(!n)return;if(n.example)return toast('Built-in notes don\'t have history until you edit them.');
  try{await histDB()}catch(e){return toast('Version history isn\'t available in this browser view.')}
  await snapshot(n,false,'');HV.list=await histAll(n.id);HV.sel=0;$('#histScrim').hidden=false;renderHistory()}
async function renderHistory(){const L=HV.list,box=$('#histList');
  box.innerHTML=L.length?L.map((s,i)=>{const b=JSON.parse(s.body);const k=b.blocks.length;return`<button class="item${i===HV.sel?' on':''}" data-hv="${i}"><span class="t">${new Date(s.at).toLocaleString([],{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})}</span><span class="m"><span>${esc(b.title||'Untitled')}</span><span>${k} block${k===1?'':'s'}</span>${i===0?'<span class="tag">latest</span>':''}${s.why?`<span>${esc(s.why)}</span>`:''}</span></button>`}).join(''):'<p class="hm-muted">No earlier versions yet. Bondline saves a version at most every 10 minutes while you edit.</p>';
  const pv=$('#histPrev');pv.innerHTML='';$('#histRestore').disabled=!L.length;if(!L.length)return;
  const s=L[HV.sel],b=JSON.parse(s.body),note=normNote({id:'hist',title:b.title,tags:b.tags||[],blocks:b.blocks,comments:b.comments||[],updated:s.at});
  const root=await buildPrint(note);root.classList.add('view');pv.appendChild(root);if(root.querySelector('[data-tex]')&&await mathReady())renderMathIn(root)}
async function restoreVersion(){const n=App.cur,s=HV.list[HV.sel];if(!n||!s)return;await snapshot(n,true,'before restoring');const b=JSON.parse(s.body);
  n.title=b.title;n.tags=b.tags||[];n.tag=n.tags[0]||'';n.blocks=b.blocks;n.comments=b.comments||[];normNote(n);App.noteChanged(n);$('#histScrim').hidden=true;openNote(n.id);toast('Earlier version restored. The version you replaced is in History.')}
function wireHistory(){document.addEventListener('visibilitychange',()=>{if(document.hidden&&App.cur)snapshot(App.cur,true,'')});$('#histScrim').addEventListener('click',e=>{if(e.target.id==='histScrim'||e.target.closest('#histClose')){$('#histScrim').hidden=true;return}const it=e.target.closest('[data-hv]');if(it){HV.sel=+it.dataset.hv;renderHistory();return}if(e.target.closest('#histRestore'))restoreVersion()})}

/* images: compressed in the browser and stored inside the note, so they sync with it */
const IMG_MAX=450000;
function cleanImage(d){d=d&&typeof d==='object'?d:{};const src=String(d.src||'');return{src:/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(src)&&src.length<=900000?src:'',w:['s','m','l','f'].includes(d.w)?d.w:'l',cap:String(d.cap||'').slice(0,300)}}
async function compressImage(file){
  if(!/^image\/(png|jpeg|webp|gif)$/.test(file.type))throw new Error('type');
  const url=URL.createObjectURL(file);try{const img=new Image();img.src=url;await img.decode();
    let scale=Math.min(1,1600/Math.max(img.naturalWidth,img.naturalHeight)),q=0.82,out='';
    for(let k=0;k<7;k++){const cv=document.createElement('canvas');cv.width=Math.max(1,Math.round(img.naturalWidth*scale));cv.height=Math.max(1,Math.round(img.naturalHeight*scale));const c=cv.getContext('2d');c.fillStyle='#ffffff';c.fillRect(0,0,cv.width,cv.height);c.drawImage(img,0,0,cv.width,cv.height);out=cv.toDataURL('image/jpeg',q);if(out.length<=IMG_MAX)break;scale*=0.8;q=Math.max(0.6,q-0.06)}
    return out}finally{URL.revokeObjectURL(url)}}
async function addImages(files,afterBlock){const n=App.cur;if(!n)return;let added=0;
  for(const f of files){if(!f.type.startsWith('image/'))continue;let src;try{src=await compressImage(f)}catch(e){toast('That file type isn\'t supported. Use PNG, JPEG, WebP or GIF.');continue}
    if(JSON.stringify(n).length+src.length>950000){toast('This note is too full for another image. Put it in a new note.');break}
    const b={id:uid(),type:'image',data:{src,w:'l',cap:''}};const i=afterBlock?n.blocks.indexOf(afterBlock):-1;if(i>=0){n.blocks.splice(i+1+added,0,b)}else n.blocks.push(b);added++}
  if(added){App.noteChanged(n);openNoteKeep(n);toast(added>1?`${added} images added`:'Image added')}}
function imageBlock(b,n,sec){const d=b.data=cleanImage(b.data);const host=document.createElement('figure');host.className='img-fig w-'+d.w;
  host.innerHTML=d.src?`<div class="img-bar" role="toolbar" aria-label="Image size">${[['s','Small'],['m','Medium'],['l','Large'],['f','Full width']].map(([k,l])=>`<button data-iw="${k}" class="${d.w===k?'on':''}" aria-pressed="${d.w===k}">${l}</button>`).join('')}</div><button class="img-open" aria-label="View image full size"><img src="${d.src}" alt="${esc(d.cap||'Image')}" loading="lazy"></button><figcaption><input value="${esc(d.cap)}" placeholder="Add a caption" aria-label="Caption" maxlength="300"></figcaption>`:'<p class="hm-muted">This image couldn\'t be loaded.</p>';
  host.addEventListener('click',e=>{const w=e.target.closest('[data-iw]');if(w){d.w=w.dataset.iw;host.className='img-fig w-'+d.w;host.querySelectorAll('[data-iw]').forEach(x=>{const on=x===w;x.classList.toggle('on',on);x.setAttribute('aria-pressed',on)});App.noteChanged(n);return}
    if(e.target.closest('.img-open')){const lb=$('#lightbox');lb.querySelector('img').src=d.src;lb.querySelector('img').alt=d.cap||'Image';lb.querySelector('p').textContent=d.cap;lb.hidden=false;lb.focus()}});
  const cap=host.querySelector('figcaption input');if(cap)cap.addEventListener('input',()=>{d.cap=cap.value;App.noteChanged(n)});
  sec.appendChild(host)}
function pickImages(after){const inp=document.createElement('input');inp.type='file';inp.accept='image/png,image/jpeg,image/webp,image/gif';inp.multiple=true;inp.onchange=()=>addImages([...inp.files],after);inp.click()}

/* command palette (Ctrl+K) */
const CMD={items:[],res:[],sel:0};
function fuzzy(q,s){q=q.toLowerCase();s=s.toLowerCase();if(!q)return 1;const i=s.indexOf(q);if(i>=0)return 100-i+(i===0||s[i-1]===' '?30:0);let j=0,score=0,run=0;for(let k=0;k<s.length&&j<q.length;k++){if(s[k]===q[j]){j++;run++;score+=run*2+(k===0||s[k-1]===' '?5:0)}else run=0}return j===q.length?score:0}
function cmdItems(){const I=[],A=(label,kind,fn,kw)=>I.push({label,kind,fn,kw:kw||''});
  A('New note','Action',()=>newNote(),'create add');A('New whiteboard','Action',()=>newWhiteboard(),'sketch draw');A('New flashcard deck','Action',()=>newDeck(),'cards');
  A('Study flashcards','Action',()=>startStudy(allDecks().map(x=>x.b),false),'review cards');A('Mechanism practice','Chemistry',()=>openPractice(),'curly arrows quiz');A('Reaction library','Chemistry',()=>openLibrary(),'named reactions mechanisms');
  A('Formula calculator','Chemistry',()=>openRef('calc'),'molar mass moles empirical molecular percentage composition');A('Reaction builder','Chemistry',()=>openBuilder(App.active?'after':'end'),'equation balance draw full reaction');A('Resonance structures','Chemistry',()=>drawResonance(),'contributors delocalised hybrid');A('Print or save note as PDF','Action',()=>App.cur&&printNotes([App.cur],App.cur.title||'note'),'pdf export text');
  A('Periodic table','Reference',()=>openRef('pt'),'elements');A('pKa table','Reference',()=>openRef('pka'),'acids bases');A('Functional groups','Reference',()=>openRef('fg'),'names suffix');A('Spectroscopy tables','Reference',()=>openRef('spec'),'ir nmr');
  A('Naming quiz','Action',()=>{setMode('naming');quizSetup()},'iupac');A('Spectroscopy practice','Action',()=>{setMode('spectra');spSetup()},'ir nmr mass spec quiz spectra');A('MO diagrams','Chemistry',()=>{setMode('orbitals');obPage('dia')},'molecular orbital bond order paramagnetic o2 n2 diatomic');A('Atomic orbitals in 3D','Chemistry',()=>{setMode('orbitals');obPage('atomic')},'s p d orbital shape nodes');A('Hybrid orbitals','Chemistry',()=>{setMode('orbitals');obPage('hybrid')},'sp sp2 sp3 hybridisation hybridization');A('π molecular orbitals (Hückel)','Chemistry',()=>{setMode('orbitals');obPage('pi')},'huckel pi aromatic antiaromatic benzene butadiene frost homo lumo');A('Guide and shortcuts','Help',()=>openGuide(),'help keyboard');
  for(const[m,l]of[['home','Go to Home'],['notes','Go to Notes'],['cards','Go to Cards'],['naming','Go to Naming'],['spectra','Go to Spectroscopy'],['orbitals','Go to Orbitals']])A(l,'Go to',()=>setMode(m));
  A('Light mode','Appearance',()=>applyAppearance({...getAppearance(),mode:'light'},true));A('Dark mode','Appearance',()=>applyAppearance({...getAppearance(),mode:'dark'},true));A('Auto light/dark','Appearance',()=>applyAppearance({...getAppearance(),mode:'auto'},true));
  for(const[k,nm]of Object.entries(SCHEME_NAMES))A('Colour scheme: '+nm,'Appearance',()=>applyAppearance({...getAppearance(),scheme:k},true));
  if(App.cur&&App.mode==='notes'){A('Export this note to PDF','This note',()=>exportPDF([App.cur],fileBase()+'.pdf'),'print');A('Version history of this note','This note',()=>openHistory(),'restore undo');A('Add an image','This note',()=>pickImages(),'photo picture');A('Comments on this note','This note',()=>openComments())}
  A('Trash','Action',()=>openTrash(),'deleted restore');A('Welcome tour','Help',()=>openWelcome(),'intro start onboarding');A('Welcome page','Help',()=>openHello(),'intro first start');A('Hide or show sidebar','Action',()=>toggleSide(),'collapse menu panel navigation');A('Glossary','Chemistry',()=>openGlossary(),'terms definitions dictionary abbreviations solvents reagents');{const st=glSelectionText();A(st?`Add “${st}” to the glossary`:'Add a term to the glossary','Chemistry',()=>openGlossary(null,st),'new term define my terms')}A('Reaction predictor','Chemistry',()=>openPredictor(),'predict product sn1 sn2 e1 e2 mechanism reagents');A('Glossary highlights: every mention','Appearance',()=>setGlossMode('all'),'glossary underline');A('Glossary highlights: first mention only','Appearance',()=>setGlossMode('first'),'glossary underline');A('Glossary highlights: off','Appearance',()=>setGlossMode('off'),'glossary underline');A('New shared notebook','Action',()=>newNotebook(),'collaborate share invite group class');for(const d of SH.nbs.values())A(d.name,'Shared notebook',()=>shShowNb(d.id));if(App.cur&&App.cur.nb)A('Copy this note to my notes','This note',()=>shCopyOut(App.cur),'duplicate personal');A('Settings','Action',()=>openSettings(),'preferences account');A('Back up notes','Action',()=>backupNotes(),'export json');A('New folder','Action',()=>{setMode('notes');newFolder('')});
  for(const n of App.notes)A(n.title||'Untitled note','Note',()=>{setMode('notes');openNote(n.id)},noteTags(n).join(' ')+' '+(n.folder&&folderById(n.folder)?folderPath(n.folder):''));
  for(const f of App.folders)A(folderPath(f.id),'Folder',()=>{VIEW.folder=f.id;setMode('notes');renderFolders();renderList();$('#side').classList.add('open')});
  for(const r of RXN)A(r.name,'Reaction',()=>openLibrary(r.id),r.cat);
  for(const g of GUIDE)A(g.t,'Guide',()=>openGuide(g.id));
  for(const l of NM_LESSONS)A(l.title,'Naming lesson',()=>{setMode('naming');openLesson(l.id)});
  return I}
function openCmd(){CMD.items=cmdItems();$('#cmdScrim').hidden=false;$('#cmdIn').value='';cmdFilter();$('#cmdIn').focus()}
function closeCmd(){$('#cmdScrim').hidden=true}
function cmdFilter(){const q=$('#cmdIn').value.trim();CMD.res=CMD.items.map(it=>({it,s:Math.max(fuzzy(q,it.label)*1.2,fuzzy(q,it.kw)*0.6,q?0:1)})).filter(x=>x.s>0).sort((a,b)=>b.s-a.s).slice(0,50).map(x=>x.it);
  if(!q)CMD.res=CMD.items.filter(it=>['Action','Chemistry','Reference'].includes(it.kind)).concat(CMD.items.filter(it=>it.kind==='Note').slice(0,8));CMD.sel=0;cmdRender()}
function cmdRender(){$('#cmdList').innerHTML=CMD.res.length?CMD.res.map((it,i)=>`<button class="cmd-it${i===CMD.sel?' on':''}" data-ci="${i}" role="option" aria-selected="${i===CMD.sel}"><span>${esc(it.label)}</span><small>${esc(it.kind)}</small></button>`).join(''):'<p class="hm-muted" style="padding:10px 14px">Nothing matches.</p>';const on=$('#cmdList .on');if(on)on.scrollIntoView({block:'nearest'})}
function cmdRun(i){const it=CMD.res[i];if(!it)return;closeCmd();it.fn()}
function wireCmd(){$('#cmdIn').addEventListener('input',cmdFilter);
  $('#cmdIn').addEventListener('keydown',e=>{if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();CMD.sel=(CMD.sel+(e.key==='ArrowDown'?1:-1)+CMD.res.length)%Math.max(1,CMD.res.length);cmdRender()}else if(e.key==='Enter'){e.preventDefault();cmdRun(CMD.sel)}else if(e.key==='Escape'){e.preventDefault();closeCmd()}});
  $('#cmdScrim').addEventListener('click',e=>{if(e.target.id==='cmdScrim')return closeCmd();const b=e.target.closest('[data-ci]');if(b)cmdRun(+b.dataset.ci)});
  document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&e.key.toLowerCase()==='k'){e.preventDefault();e.stopPropagation();$('#cmdScrim').hidden?openCmd():closeCmd()}},true);
  $('#lightbox').addEventListener('click',()=>$('#lightbox').hidden=true);$('#lightbox').addEventListener('keydown',e=>{if(e.key==='Escape')$('#lightbox').hidden=true});
}

/* ---------- welcome tour for new users ---------- */
const WT={i:0};
function welcomeSteps(){const app=typeof FB!=='undefined'&&FB.cfg;
  const sn2=(()=>{try{return structSVG(mechRow(RXN_BY.sn2,0).d,1)}catch(e){return''}})();
  const tool=(ic,t,s)=>`<div class="wt-tool"><span class="wt-ic" aria-hidden="true">${ic}</span><span><b>${t}</b><small>${s}</small></span></div>`;
  return[
  {t:'Welcome to Bondline',h:`<p class="wt-lede">A notebook made for organic chemistry: write notes, draw structures and curly-arrow mechanisms, and revise with flashcards and quizzes.</p>
    <div class="wt-tools">${tool('✎','Notes','Text, maths, drawings and sketches together')}${tool('⬡','Chemistry','Names, spectra, 3D and a reaction library')}${tool('▭','Study','Flashcards and an IUPAC naming quiz')}</div>
    <div class="wt-pick"><span>Pick a look</span><div class="ap-seg wt-seg" role="radiogroup" aria-label="Mode"><button data-wmode="light" role="radio">☀ Light</button><button data-wmode="dark" role="radio">☾ Dark</button><button data-wmode="auto" role="radio">Auto</button></div><span class="hm-muted">More colour schemes in ⚙ Settings.</span></div>`},
  {t:'Write and draw in one place',h:`<p>Each note is a stack of blocks. Add text, a structure drawing, a sketch, flashcards or a picture with the buttons at the bottom of a note.</p>
    <div class="wt-art">${sn2}</div>
    <ul class="wt-list"><li><b>Drawing:</b> pick a bond and click to grow chains; hover an atom and type <kbd>O</kbd> or <kbd>N</kbd> to change it.</li><li><b>Mechanisms:</b> the red curly arrow tool, then drag from a lone pair or bond. Press <b>3D</b> to watch it happen.</li><li><b>Text:</b> type <code>#</code> for a heading, <code>-</code> for a list and <code>$\\ce{H2O}$</code> for formulas and maths.</li></ul>`},
  {t:'Chemistry tools that check your work',h:`<div class="wt-tools two">${tool('Aa→','Draw from a name','Type “butan-2-ol” and get the structure')}${tool('CₓHᵧ','Name, formula and spectra','IUPAC name, molar mass, predicted NMR and IR')}${tool('📖','Reaction library','34 reactions with every mechanism step drawn')}${tool('↷','Mechanism practice','Draw the arrows yourself and get feedback')}${tool('▦','Quick reference','Periodic table, pKa, groups and a formula calculator')}${tool('⇌','Reaction builder','Type names or formulas, check the balance, insert it')}${tool('↔','Resonance','Every resonance structure, with major contributors marked')}${tool('R/S','Stereochemistry','R/S and E/Z labels on any drawing')}</div><p class="hm-muted">You'll find these in the Chemistry group of the toolbar when a drawing is selected.</p>`},
  {t:'Revise what you write',h:`<div class="wt-tools two">${tool('▭','Flashcards','Select text and press + Card, then study in the Cards tab. Cards you find hard come back sooner.')}${tool('✓','Naming quiz','Lessons and a quiz for every family of compounds, with progress on Home.')}${tool('▤','Folders and tags','Keep each module or topic tidy. Drag notes onto folders.')}${tool('⌘','Command palette','Press Ctrl K to jump to any note, reaction or tool.')}</div>`},
  {t:'Keep your notes safe',h:`<ul class="wt-list">${app?'<li><b>Sign in</b> (bottom of the sidebar) to sync your notes across your phone, tablet and computer.</li>':''}<li><b>Install Bondline</b> from your browser menu to use it like an app, even offline.</li><li><b>Trash and History</b> let you undo mistakes: deleted notes stay in Trash for 30 days, and every note keeps earlier versions.</li><li><b>Back up</b> everything to a file any time from ⚙ Settings.</li></ul>
    <div class="wt-start"><button class="btn primary" data-wgo="sample">Open an example note</button><button class="btn" data-wgo="new">Start a blank note</button>${app?'<button class="btn" data-wgo="signin">Sign in</button>':''}</div>`}]}
function openWelcome(){WT.i=0;$('#welcome').hidden=false;document.body.classList.add('sk-lock');renderWelcome()}
function closeWelcome(){$('#welcome').hidden=true;document.body.classList.remove('sk-lock');try{localStorage.setItem('bondline.welcomed','1')}catch(e){}}
function renderWelcome(){const S=welcomeSteps(),s=S[WT.i],last=WT.i===S.length-1;
  $('#wtBody').innerHTML=`<div class="wt-kicker">Step ${WT.i+1} of ${S.length}</div><h2 id="wtTitle">${s.t}</h2>${s.h}`;
  $('#wtDots').innerHTML=S.map((_,k)=>`<button class="wt-dot${k===WT.i?' on':''}" data-wdot="${k}" aria-label="Step ${k+1}"${k===WT.i?' aria-current="step"':''}></button>`).join('');
  $('#wtBack').hidden=WT.i===0;$('#wtNext').textContent=last?'Finish':'Next';
  const m=getAppearance().mode;document.querySelectorAll('[data-wmode]').forEach(b=>{const on=b.dataset.wmode===m;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});
  $('#wtNext').focus()}
/* ---------- calm welcome screen for first-time visitors ---------- */
function syncHelloMode(){const m=getAppearance().mode;document.querySelectorAll('#hello [data-hmode]').forEach(b=>{const on=b.dataset.hmode===m;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)})}
function openHello(){const h=$('#hello');h.hidden=false;document.body.classList.add('sk-lock');syncHelloMode();h.setAttribute('tabindex','-1');setTimeout(()=>h.focus({preventScroll:true}),60)}
function closeHello(){$('#hello').hidden=true;document.body.classList.remove('sk-lock');try{localStorage.setItem('bondline.welcomed','1')}catch(e){}}
function wireHello(){
  $('#hello').addEventListener('click',e=>{
    const m=e.target.closest('[data-hmode]');if(m){applyAppearance({...getAppearance(),mode:m.dataset.hmode},true);syncHelloMode();return}
    const g=e.target.closest('[data-hgo]');if(!g)return;closeHello();const k=g.dataset.hgo;
    if(k==='blank'){setMode('notes');newNote()}
    else if(k==='sample'){const n=App.notes.find(x=>x.id==='lib-hybrid')||App.notes.find(x=>x.example)||App.notes[0];setMode('notes');if(n)openNote(n.id)}
    else if(k==='tour')openWelcome()});
  document.addEventListener('keydown',e=>{if($('#hello').hidden)return;e.stopPropagation();
    if(e.key==='Escape'){closeHello();return}
    if(e.key==='Tab'){const f=[...$('#hello').querySelectorAll('button')].filter(b=>b.offsetParent!==null);if(!f.length)return;const i=f.indexOf(document.activeElement);
      if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}}},true);
}
function wireWelcome(){wireHello();
  $('#welcome').addEventListener('click',e=>{
    const m=e.target.closest('[data-wmode]');if(m){applyAppearance({...getAppearance(),mode:m.dataset.wmode},true);renderWelcome();return}
    const d=e.target.closest('[data-wdot]');if(d){WT.i=+d.dataset.wdot;renderWelcome();return}
    const g=e.target.closest('[data-wgo]');if(g){closeWelcome();const k=g.dataset.wgo;
      if(k==='sample'){const n=App.notes.find(x=>x.id==='lib-hybrid')||App.notes.find(x=>x.example)||App.notes[0];setMode('notes');if(n)openNote(n.id)}
      else if(k==='new')newNote();else if(k==='signin'){if(typeof openAuth==='function')openAuth('in')}return}
    if(e.target.closest('#wtNext')){if(WT.i>=welcomeSteps().length-1)closeWelcome();else{WT.i++;renderWelcome()}return}
    if(e.target.closest('#wtBack')){WT.i=Math.max(0,WT.i-1);renderWelcome();return}
    if(e.target.closest('#wtSkip'))closeWelcome()});
  document.addEventListener('keydown',e=>{if($('#welcome').hidden)return;e.stopPropagation();if(e.key==='Escape')closeWelcome();else if(e.key==='ArrowRight'&&WT.i<welcomeSteps().length-1){WT.i++;renderWelcome()}else if(e.key==='ArrowLeft'&&WT.i>0){WT.i--;renderWelcome()}},true);
  let seen=false;try{seen=!!localStorage.getItem('bondline.welcomed')}catch(e){seen=true}
  if((!seen&&!App.notes.some(n=>!n.example)&&!/[#&]share=/.test(location.hash))||/[?&]welcome\b/.test(location.search))openHello();
  else if(!seen){try{localStorage.setItem('bondline.welcomed','1')}catch(e){}}
}

/* ---------- structure checks, formula calculator, resonance, reaction builder ---------- */
/* extra checks on top of the valence check */
function extraChecks(m,d){
  const out=[];const A=m.atoms;
  A.forEach((a,i)=>{if(!a.src||a.el==='*')return;const nb=m.adj[i];
    if(['Cl','Br','I'].includes(a.el)&&a.bs>1&&!nb.some(e=>A[e.to].el==='O')&&!a.charge)out.push({atom:i,src:a.src,kind:'valence',msg:`${a.el} normally forms only one bond (unless it is bonded to oxygen).`});
    if(a.el==='C'&&!a.charge&&a.bs===3&&a.hFix===0)out.push({atom:i,src:a.src,kind:'warn',msg:'This carbon has only three bonds and no charge. Add a charge or a hydrogen.'});
    if(a.el==='C'&&Math.abs(a.charge||0)>1)out.push({atom:i,src:a.src,kind:'valence',msg:'Carbon with a charge of 2 or more is not realistic.'});
    if((a.el==='O'||a.el==='N')&&(a.charge||0)<-1)out.push({atom:i,src:a.src,kind:'warn',msg:`${a.el} with a ${a.charge} charge is very unusual.`});
  });
  /* triple bond in a small ring */
  m.bonds.forEach(b=>{if(b.o!==3)return;const ring=ringSizeThrough(m,b.a,b.b);if(ring&&ring<8)out.push({atom:b.a,src:A[b.a].src,kind:'warn',msg:`A triple bond in a ${ring}-membered ring is too strained to exist (C≡C needs a straight line).`})});
  /* atoms drawn on top of each other */
  if(d){const pts=m.atoms.filter(a=>a.src&&!a.inLabel).map(a=>getAtom(d,a.src)).filter(Boolean);for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)if(Math.hypot(pts[i].x-pts[j].x,pts[i].y-pts[j].y)<4){out.push({src:pts[i].id,kind:'warn',msg:'Two atoms are drawn on top of each other. Drag one away or delete it.'});break}}
  return out}
function ringSizeThrough(m,a,b){/* shortest path a→b not using the a–b bond */const dist=new Map([[a,0]]),q=[a];while(q.length){const x=q.shift();for(const e of m.adj[x]){if((x===a&&e.to===b)||(x===b&&e.to===a))continue;if(!dist.has(e.to)){dist.set(e.to,dist.get(x)+1);if(e.to===b)return dist.get(e.to)+1;q.push(e.to)}}}return 0}
const VCHK={on:true};try{VCHK.on=localStorage.getItem('bondline.validate')!=='0'}catch(e){}
function validationSVG(ed){const d=ed.d;if(!VCHK.on&&!d.info){const bd=ed.wrap&&ed.wrap.querySelector('.val-badge');if(bd)bd.hidden=true;return''}let h='',n=0,msgs=[];try{for(const r of analyseCached(d))for(const i of r.issues){if(!i.src||(i.kind!=='valence'&&i.kind!=='warn'))continue;const a=getAtom(d,i.src);if(!a)continue;n++;msgs.push(i.msg);h+=`<circle class="bad-ring${i.kind==='warn'?' warn':''}" cx="${f(a.x)}" cy="${f(a.y)}" r="11"><title>${esc(i.msg)}</title></circle>`}}catch(e){}
  const bd=ed.wrap&&ed.wrap.querySelector('.val-badge');if(bd){bd.hidden=!n;bd.textContent=`⚠ ${n} problem${n>1?'s':''}`;bd.title=msgs.join('\n')}
  return h}
/* ---------- formula calculator ---------- */
const MASS=(()=>{const m={};for(const e of PT){const v=parseFloat(String(e.mass).replace(/[()]/g,''));if(!isNaN(v))m[e.sym]=v}Object.assign(m,AW);return m})();
function parseFormula(str){
  let s=String(str).replace(/\s+/g,'').replace(/[·•*]/g,'.').replace(/[₀-₉]/g,c=>'0123456789'['₀₁₂₃₄₅₆₇₈₉'.indexOf(c)]).replace(/\^?\d*[+\-−]$/,'');
  if(!s)throw new Error('Type a formula, e.g. C6H12O6');
  const total={};
  for(const part of s.split('.')){if(!part)continue;const mm=/^(\d+)(.*)$/.exec(part);const mult=mm&&/[A-Z(\[]/.test(mm[2][0]||'')?+mm[1]:1;const body=mm&&mult!==1||(mm&&/[A-Z(\[]/.test(mm[2][0]||''))?mm[2]:part;
    let i=0;const stack=[{}];
    while(i<body.length){const c=body[i];
      if(c==='('||c==='['){stack.push({});i++;continue}
      if(c===')'||c===']'){i++;let n='';while(/\d/.test(body[i]||''))n+=body[i++];const g=stack.pop();if(!stack.length)throw new Error('Brackets don\'t match.');const k=n?+n:1;for(const[e,v]of Object.entries(g))stack[stack.length-1][e]=(stack[stack.length-1][e]||0)+v*k;continue}
      const em=/^[A-Z][a-z]?/.exec(body.slice(i));if(!em)throw new Error(`I don't recognise “${body.slice(i,i+3)}”. Element symbols start with a capital letter.`);
      const el=em[0];if(MASS[el]==null)throw new Error(`“${el}” isn't an element symbol.`);i+=el.length;let n='';while(/\d/.test(body[i]||''))n+=body[i++];const top=stack[stack.length-1];top[el]=(top[el]||0)+(n?+n:1)}
    if(stack.length!==1)throw new Error('Brackets don\'t match.');for(const[e,v]of Object.entries(stack[0]))total[e]=(total[e]||0)+v*mult}
  return total}
function hillOrder(c){const k=Object.keys(c);return c.C?['C',...(c.H?['H']:[]),...k.filter(x=>x!=='C'&&x!=='H').sort()]:k.sort()}
function formulaHTML(c){return hillOrder(c).map(e=>e+(c[e]>1?`<sub>${c[e]}</sub>`:'')).join('')}
const MONO2={H:1.007825,C:12,N:14.003074,O:15.994915,F:18.998403,P:30.973762,S:31.972071,Cl:34.968853,Br:78.918338,I:126.904473,Si:27.976927,B:11.009305,Na:22.989770,K:38.963707};
function calcFormula(){const out=$('#fcOut');const v=$('#fcIn').value.trim();if(!v){out.innerHTML='<p class="hm-muted">Try C6H12O6, CuSO4·5H2O, Ca(OH)2 or (NH4)2SO4.</p>';return}
  try{const c=parseFormula(v);const els=hillOrder(c);const M=els.reduce((s,e)=>s+MASS[e]*c[e],0);
    const mono=els.every(e=>MONO2[e])?els.reduce((s,e)=>s+MONO2[e]*c[e],0):null;
    const X=(c.F||0)+(c.Cl||0)+(c.Br||0)+(c.I||0),onlyOrg=els.every(e=>'C H N O S F Cl Br I'.split(' ').includes(e))&&c.C;const dbe=onlyOrg?c.C+1+(c.N||0)/2-((c.H||0)+X)/2:null;
    const g=els.reduce((a,e)=>{const x=c[e];return a?gcdN(a,x):x},0);const emp=Object.fromEntries(els.map(e=>[e,c[e]/g]));
    const typed=esc(v).replace(/[·•*.]/g,'·').replace(/([A-Za-z)\]])(\d+)/g,'$1<sub>$2</sub>');out.innerHTML=`<div class="fc-res"><div><span>Formula</span><b>${typed}</b></div>${v.includes('·')||v.includes('.')||/[()\[]/.test(v)?`<div><span>Atoms in total</span><b>${formulaHTML(c)}</b></div>`:''}<div><span>Molar mass</span><b>${M.toFixed(2)} g/mol</b></div>${mono?`<div><span>Exact (monoisotopic) mass</span><b>${mono.toFixed(4)}</b></div>`:''}${g>1?`<div><span>Empirical formula</span><b>${formulaHTML(emp)}</b></div>`:''}${dbe!=null&&dbe>=0&&Number.isInteger(dbe)?`<div><span>Degrees of unsaturation</span><b>${dbe}</b></div>`:''}</div>
      <table class="ref-t"><thead><tr><th>Element</th><th>Atoms</th><th>Mass</th><th>% by mass</th></tr></thead><tbody>${els.map(e=>`<tr><td>${e}</td><td class="num">${c[e]}</td><td class="num">${(MASS[e]*c[e]).toFixed(2)}</td><td class="num">${(100*MASS[e]*c[e]/M).toFixed(2)}%</td></tr>`).join('')}</tbody></table>`;
    FC.M=M;calcMoles()}catch(e){out.innerHTML=`<p class="fc-err">${esc(e.message)}</p>`;FC.M=null;calcMoles()}}
function gcdN(a,b){while(b){[a,b]=[b,a%b]}return a}
const FC={M:null,last:'g'};
function calcMoles(){const box=$('#fcMol');if(!box)return;if(!FC.M){box.querySelector('.fc-mm').textContent='—';return}box.querySelector('.fc-mm').textContent=FC.M.toFixed(2)+' g/mol';const g=$('#fcG'),n=$('#fcN');
  if(FC.last==='g'&&g.value!=='')n.value=+(parseFloat(g.value)/FC.M).toPrecision(4);else if(FC.last==='n'&&n.value!=='')g.value=+(parseFloat(n.value)*FC.M).toPrecision(4)}
function calcEmpirical(){const out=$('#fcEmpOut');const rows=[...document.querySelectorAll('.fc-er')].map(r=>({el:r.querySelector('.fe').value.trim(),p:parseFloat(r.querySelector('.fp').value)})).filter(r=>r.el&&!isNaN(r.p));
  if(rows.length<2){out.innerHTML='<p class="hm-muted">Enter at least two elements and their percentages.</p>';return}
  for(const r of rows)if(MASS[r.el]==null){out.innerHTML=`<p class="fc-err">“${esc(r.el)}” isn't an element symbol.</p>`;return}
  const tot=rows.reduce((s,r)=>s+r.p,0);const mol=rows.map(r=>r.p/MASS[r.el]),mn=Math.min(...mol),rat=mol.map(x=>x/mn);
  let k=1;for(;k<=8;k++)if(rat.every(x=>Math.abs(x*k-Math.round(x*k))<0.1))break;if(k>8)k=1;
  const c=Object.fromEntries(rows.map((r,i)=>[r.el,Math.round(rat[i]*k)]));const Me=Object.entries(c).reduce((s,[e,v])=>s+MASS[e]*v,0);
  const Mr=parseFloat($('#fcMr').value);let mol2='';if(!isNaN(Mr)&&Mr>0){const n=Math.max(1,Math.round(Mr/Me));const c2=Object.fromEntries(Object.entries(c).map(([e,v])=>[e,v*n]));mol2=`<div><span>Molecular formula (M<sub>r</sub> ${Mr})</span><b>${formulaHTML(c2)}</b></div>`}
  out.innerHTML=`${Math.abs(tot-100)>1.5?`<p class="hm-muted">Your percentages add up to ${tot.toFixed(1)}%. If one element is missing (often oxygen), add it as the remainder.</p>`:''}<table class="ref-t"><thead><tr><th>Element</th><th>%</th><th>÷ A<sub>r</sub></th><th>Ratio</th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${r.el}</td><td class="num">${r.p}</td><td class="num">${mol[i].toFixed(3)}</td><td class="num">${(rat[i]*k).toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="fc-res"><div><span>Empirical formula</span><b>${formulaHTML(c)}</b></div><div><span>Empirical mass</span><b>${Me.toFixed(2)}</b></div>${mol2}</div>`}
function renderCalcTab(){
  $('#refBody').innerHTML=`<div class="fc-cols"><section><h3 class="ref-h">Formula → molar mass and composition</h3><input class="np-in" id="fcIn" placeholder="e.g. C6H12O6 or CuSO4·5H2O" spellcheck="false" autocomplete="off" aria-label="Formula"><div id="fcOut"></div>
    <h3 class="ref-h">Mass ↔ moles</h3><div class="fc-mol" id="fcMol"><label>Mass (g)<input id="fcG" type="number" step="any" inputmode="decimal"></label><span class="fc-x">÷ <span class="fc-mm">—</span> =</span><label>Amount (mol)<input id="fcN" type="number" step="any" inputmode="decimal"></label></div></section>
    <section><h3 class="ref-h">% composition → empirical formula</h3><div id="fcEmp">${[['C','40.0'],['H','6.7'],['O','53.3'],['','']].map(([e,p])=>`<div class="fc-er"><input class="fe" value="${e}" placeholder="El" aria-label="Element" maxlength="2"><input class="fp" value="${p}" type="number" step="any" placeholder="%" aria-label="Percent by mass"><span>%</span></div>`).join('')}</div><button class="linkbtn" id="fcAddRow">+ Add element</button><label class="fc-mr"><span>M<sub>r</sub> (optional, for the molecular formula)</span><input id="fcMr" type="number" step="any" placeholder="e.g. 180"></label><div id="fcEmpOut"></div></section></div>`;
  $('#fcIn').addEventListener('input',calcFormula);$('#fcG').addEventListener('input',()=>{FC.last='g';calcMoles()});$('#fcN').addEventListener('input',()=>{FC.last='n';calcMoles()});
  $('#fcEmp').addEventListener('input',calcEmpirical);$('#fcMr').addEventListener('input',calcEmpirical);
  $('#fcAddRow').onclick=()=>{const d=document.createElement('div');d.className='fc-er';d.innerHTML='<input class="fe" placeholder="El" aria-label="Element" maxlength="2"><input class="fp" type="number" step="any" placeholder="%" aria-label="Percent by mass"><span>%</span>';$('#fcEmp').appendChild(d);d.querySelector('input').focus()};
  calcFormula();calcEmpirical();$('#fcIn').focus()}

/* ---------- resonance structures ---------- */
const VE={C:4,N:5,O:6,S:6,P:5,F:7,Cl:7,Br:7,I:7,B:3,Si:4};
function resonanceOf(d,ids){
  const m=buildMol(d,ids);if(m.atoms.some(a=>a.el==='*'||a.inLabel))return{err:'Resonance works on fully drawn structures. Expand labels like OMe or Ph into atoms first.'};
  const n=m.atoms.length,B=m.bonds.map(b=>b.o),Q=m.atoms.map(a=>a.charge||0),H=m.atoms.map(a=>a.h||0),E=m.atoms.map(a=>a.el);
  const bi=(i,j)=>m.bonds.findIndex(b=>(b.a===i&&b.b===j)||(b.a===j&&b.b===i));
  const nbr=i=>m.adj[i].map(e=>e.to);
  const lp=(st,i)=>{const bs=m.adj[i].reduce((s,e)=>s+st.B[e.bi],0);return VE[E[i]]==null?0:Math.floor((VE[E[i]]-st.Q[i]-bs-H[i])/2)};
  const ringsAlt=[];/* six-membered rings for Kekulé normalisation */
  {const seen=new Set();for(let s=0;s<n;s++){const st=[[s,[s]]];while(st.length){const[x,p]=st.pop();if(p.length===6){if(nbr(x).includes(s)){const k=[...p].sort((a,b)=>a-b).join(',');if(!seen.has(k)){seen.add(k);ringsAlt.push(p.map((a,i)=>bi(a,p[(i+1)%6])))}}continue}for(const y of nbr(x))if(y>s&&!p.includes(y))st.push([y,p.concat(y)])}}}
  const key=st=>{const Bn=st.B.slice();for(const r of ringsAlt){const os=r.map(b=>Bn[b]);if(os.every((o,i)=>o!==os[(i+1)%6]&&(o===1||o===2)))r.forEach(b=>Bn[b]=1.5)}return Bn.join(',')+'|'+st.Q.join(',')};
  const S0={B,Q,parent:-1,moves:[]},list=[S0],keys=new Set([key(S0)]);
  const q0=Q.filter(q=>q).length,maxQ=q0?q0:2;const ok=(st)=>st.Q.every(q=>Math.abs(q)<=1)&&st.Q.filter(q=>q).length<=maxQ&&m.atoms.every((a,i)=>lp(st,i)>=0)&&!(st.Q.some((q,i)=>q>0&&E[i]==='C')&&st.Q.some((q,i)=>q<0&&E[i]==='C'));
  let polar=false;const run=()=>{for(let k=0;k<list.length&&list.length<14;k++){const st=list[k];
    const push=(ns,moves)=>{if(!ok(ns))return;const kk=key(ns);if(keys.has(kk))return;keys.add(kk);ns.parent=k;ns.moves=moves;list.push(ns)};
    for(let x=0;x<n;x++){
      /* lone pair next to a π bond (or next to a cation) */
      if(lp(st,x)>0&&['O','N','S','C','Cl','Br','I'].includes(E[x])&&(E[x]!=='C'||st.Q[x]<0)&&st.Q[x]<=0){
        for(const y of nbr(x)){const xy=bi(x,y);if(st.B[xy]!==1)continue;
          if(st.Q[y]>0&&['C','B'].includes(E[y])){const ns={B:st.B.slice(),Q:st.Q.slice()};ns.B[xy]=2;ns.Q[x]++;ns.Q[y]--;push(ns,[{f:['a',x],t:['b',x,y]}]);continue}
          for(const z of nbr(y)){if(z===x)continue;const yz=bi(y,z);if(st.B[yz]!==2)continue;if(!['C','N','O','S'].includes(E[z]))continue;
            const ns={B:st.B.slice(),Q:st.Q.slice()};ns.B[xy]=2;ns.B[yz]=1;ns.Q[x]++;ns.Q[z]--;push(ns,[{f:['a',x],t:['b',x,y]},{f:['b',y,z],t:['a',z]}])}}}
      /* C=O or C=N: push the π electrons onto the electronegative atom */
      if(polar&&E[x]==='C'&&st.Q[x]===0){for(const z of nbr(x)){const xz=bi(x,z);if(st.B[xz]!==2||!['O','N'].includes(E[z])||st.Q[z]!==0)continue;const ns={B:st.B.slice(),Q:st.Q.slice()};ns.B[xz]=1;ns.Q[x]=1;ns.Q[z]=-1;push(ns,[{f:['b',x,z],t:['a',z]}])}}
      /* π bond next to a cation */
      if(st.Q[x]>0&&E[x]==='C'){for(const z of nbr(x)){const zx=bi(z,x);if(st.B[zx]!==1)continue;for(const y of nbr(z)){if(y===x)continue;const yz=bi(y,z);if(st.B[yz]!==2||E[y]!=='C')continue;
            const ns={B:st.B.slice(),Q:st.Q.slice()};ns.B[yz]=1;ns.B[zx]=2;ns.Q[y]++;ns.Q[x]--;push(ns,[{f:['b',y,z],t:['b',z,x]}])}}}
    }}};run();if(list.length===1){polar=true;run()}
  /* plain aromatic rings: show the two Kekulé structures */
  if(list.length===1)for(const r of ringsAlt){const os=r.map(b=>B[b]);if(os.every((o,i)=>o!==os[(i+1)%6]&&(o===1||o===2))){const ns={B:B.slice(),Q:Q.slice(),parent:0};const moves=[];r.forEach((b,i)=>{if(B[b]===2){ns.B[b]=1;ns.B[r[(i+1)%6]]=2;const bb=m.bonds[b],nb2=m.bonds[r[(i+1)%6]];const shared=[bb.a,bb.b].find(a=>a===nb2.a||a===nb2.b),oth=[nb2.a,nb2.b].find(a=>a!==shared),oth1=[bb.a,bb.b].find(a=>a!==shared);moves.push({f:['b',oth1,shared],t:['b',shared,oth]})}});ns.moves=moves;list.push(ns);break}}
  /* rank: fewer charges, negative on electronegative atoms, positive not on O/N without octet */
  const EN={C:2.55,N:3.04,O:3.44,S:2.58,F:3.98,Cl:3.16,Br:2.96,I:2.66,B:2.04,P:2.19};
  list.forEach(st=>{let s=0;st.Q.forEach((q,i)=>{if(!q)return;s+=2;if(q<0)s-=(EN[E[i]]||2.5)-2.5;else s+=(EN[E[i]]||2.5)-2.5})
    m.atoms.forEach((a,i)=>{if(E[i]==='C'&&st.Q[i]>0)s+=1.5});st.score=s});
  const best=Math.min(...list.map(s=>s.score));list.forEach(s=>s.major=s.score-best<0.6);
  return{m,list}}
function resonanceScheme(d,comp){
  const R=resonanceOf(d,comp.ids);if(R.err)return R;const{m,list}=R;if(list.length<2)return{err:'No other resonance structures: there is no lone pair, charge or π bond that can move.'};
  const pts=m.atoms.map(a=>getAtom(d,a.src)),x0=Math.min(...pts.map(p=>p.x)),y0=Math.min(...pts.map(p=>p.y)),w=Math.max(...pts.map(p=>p.x))-x0,h=Math.max(...pts.map(p=>p.y))-y0;
  const out=emptyScheme(200),gap=70,perRow=Math.max(1,Math.floor((W-40+gap)/(w+gap+50)));
  const maps=[];
  list.forEach((st,k)=>{const col=k%perRow,row=Math.floor(k/perRow),ox=30+col*(w+gap+50)-x0,oy=40+row*(h+110)-y0;const map=[];
    m.atoms.forEach((a,i)=>{const p=pts[i];const na={id:uid(),x:f(p.x+ox),y:f(p.y+oy),el:a.el};if(st.Q[i])na.charge=st.Q[i];out.atoms.push(na);map[i]=na});
    m.bonds.forEach((b,j)=>{const o=st.B[j];if(o>0)out.bonds.push({id:uid(),a:map[b.a].id,b:map[b.b].id,order:o})});
    maps.push(map);
    const cx=f(30+col*(w+gap+50)+w/2);out.texts.push({id:uid(),x:f(cx-textW(st.major?'major':'minor',FS)/2),y:f(oy+y0+h+34),text:st.major?'major':'minor'});
    if(col<perRow-1&&k<list.length-1){const ax=30+col*(w+gap+50)+w+18;out.arrows.push({id:uid(),kind:'res',x1:f(ax),y1:f(oy+y0+h/2),x2:f(ax+gap-6),y2:f(oy+y0+h/2),above:'',below:''})}
  });
  /* curly arrows on each structure that leads straight to the next one */
  list.forEach((st,k)=>{if(k===0||st.parent!==k-1)return;const map=maps[k-1];const bid=(i,j)=>{const b=out.bonds.find(b=>(b.a===map[i].id&&b.b===map[j].id)||(b.a===map[j].id&&b.b===map[i].id));return b?{kind:'bond',id:b.id}:{kind:'atom',id:map[j].id}};
    for(const mv of st.moves){const from=mv.f[0]==='a'?{kind:'atom',id:map[mv.f[1]].id}:bid(mv.f[1],mv.f[2]);const to=mv.t[0]==='a'?{kind:'atom',id:map[mv.t[1]].id}:bid(mv.t[1],mv.t[2]);
      if(mv.f[0]==='a'){const at=getAtom(out,map[mv.f[1]].id);if(at&&!at.lp){const l=lpFor(at);if(l)at.lp=l}}
      const c={id:uid(),from,to,bend:.4};c.bend=Editor.prototype.autoBend.call({d:out},c);out.curls.push(c)}});
  const bb=bbox(out);out.h=Math.max(160,Math.ceil(bb.y+bb.h+30));
  return{d:out,n:list.length,majors:list.filter(s=>s.major).length}}
function drawResonance(){const ed=App.active;if(!ed)return toast('Click a drawing first.');const comps=molComponents(ed.d).filter(c=>c.ids.length>1);if(!comps.length)return toast('Draw a molecule or ion first.');
  let comp=comps[0];if(ed.sel&&ed.sel.size){const s=[...ed.sel].find(k=>k.startsWith('atom:'));if(s){const id=s.slice(5);comp=comps.find(c=>c.ids.includes(id))||comp}}
  const R=resonanceScheme(ed.d,comp);if(R.err)return toast(R.err);
  const n=ed.note;const i=n.blocks.indexOf(ed.block);n.blocks.splice(i+1,0,{id:uid(),type:'text',html:`<p><b>Resonance structures</b> (${R.n}). The real structure is a hybrid of these, closest to the major contributor${R.majors>1?'s':''}.</p>`},{id:uid(),type:'scheme',data:R.d});
  App.noteChanged(n);openNoteKeep(n);const el=document.querySelectorAll('#blocks .block')[i+2];if(el)el.scrollIntoView({block:'center',behavior:'smooth'});toast(`Found ${R.n} resonance structures`)}

/* ---------- reaction builder ---------- */
const RB={rows:{r:[{t:'',c:1}],p:[{t:'',c:1}]},kind:'arr',above:'',below:''};
function rbParse(t){t=t.trim();if(!t)return null;try{const r=nameToSmiles(t);return{smi:r.smiles,label:t}}catch(e){}
  if(/^[A-Za-z0-9@+\-\[\]\(\)=#\\\/%.]+$/.test(t)&&!/^[A-Z][a-z]?\d*$/.test(t)&&/[a-z]|=|#|\(|\[/.test(t)){try{const d=smilesToScheme(t);if(d.atoms.length)return{smi:t,label:t}}catch(e){}}
  try{parseFormula(t);return{formula:t,label:t}}catch(e){}return{bad:t}}
function rbCounts(x){if(!x)return null;if(x.smi){try{const d=smilesToScheme(x.smi),m=buildMol(d,d.atoms.map(a=>a.id)),F=molFormula(m);return F.counts}catch(e){return null}}if(x.formula){try{return parseFormula(x.formula)}catch(e){return null}}return null}
function rbBuild(){
  const d=emptyScheme(200);let x=16;const add=(row)=>{const items=row.map(r=>({r,p:rbParse(r.t)})).filter(z=>z.p);items.forEach((z,i)=>{
      if(i){x+=12;d.texts.push({id:uid(),x:f(x),y:5,text:'+'});x+=textW('+',FS)+12}
      if(z.r.c>1){d.texts.push({id:uid(),x:f(x),y:5,text:String(z.r.c)});x+=textW(String(z.r.c),FS)+6}
      if(z.p.smi){const L=layoutSpecies(d,z.p.smi,x);x=L.x}else{const t=z.p.formula||z.p.bad;d.texts.push({id:uid(),x:f(x),y:5,text:t});x+=textW(t,FS)}});return items};
  const R=add(RB.rows.r);x+=18;const aw=Math.max(80,textW(RB.above,FS)+24,textW(RB.below,FS)+24);d.arrows.push({id:uid(),kind:RB.kind,x1:f(x),y1:0,x2:f(x+aw),y2:0,above:RB.above,below:RB.below});x+=aw+18;const Pp=add(RB.rows.p);
  const bb=bbox(d)||{y:0,h:0};const dy=40-Math.min(bb.y,-26);for(const a of d.atoms)a.y=f(a.y+dy);for(const t of d.texts)t.y=f(t.y+dy);for(const a of d.arrows){a.y1=f(a.y1+dy);a.y2=f(a.y2+dy)}
  const bb2=bbox(d);d.h=Math.max(150,Math.ceil((bb2?bb2.y+bb2.h:100)+30));
  return{d,R,P:Pp,width:x}}
function rbBalance(R,P){const side=items=>{const t={};let ok=true;for(const z of items){const c=rbCounts(z.p);if(!c){ok=false;continue}for(const[e,v]of Object.entries(c))t[e]=(t[e]||0)+v*z.r.c}return ok?t:null};
  const L=side(R),Rt=side(P);if(!L||!Rt||!R.length||!P.length)return null;const els=[...new Set([...Object.keys(L),...Object.keys(Rt)])].sort();return{els,L,R:Rt,ok:els.every(e=>(L[e]||0)===(Rt[e]||0))}}
function rbAutoBalance(){const R=RB.rows.r.filter(r=>rbParse(r.t)),P=RB.rows.p.filter(r=>rbParse(r.t));const all=[...R,...P];if(all.length<2||all.length>6)return toast('Add 2 to 6 species to balance.');
  const counts=all.map(r=>rbCounts(rbParse(r.t)));if(counts.some(c=>!c))return toast('Some species couldn\'t be read, so I can\'t balance this.');
  const els=[...new Set(counts.flatMap(c=>Object.keys(c)))];const nR=R.length,max=all.length>4?6:10;const co=new Array(all.length).fill(1);let best=null;
  const test=()=>els.every(e=>{let s=0;for(let i=0;i<all.length;i++)s+=(i<nR?1:-1)*(counts[i][e]||0)*co[i];return s===0});
  const rec=i=>{if(best)return;if(i===all.length){if(test())best=co.slice();return}for(let v=1;v<=max&&!best;v++){co[i]=v;rec(i+1)}};rec(0);
  if(!best)return toast('Couldn\'t find small whole-number coefficients. Check the species.');all.forEach((r,i)=>r.c=best[i]);renderBuilder();toast('Balanced')}
function openBuilder(where){RB.where=where||'after';$('#rbScrim').hidden=false;renderBuilder();const f0=$('#rbScrim input');if(f0)f0.focus()}
function closeBuilder(){$('#rbScrim').hidden=true}
function renderBuilder(){
  const row=(side,r,i)=>`<div class="rb-row" data-side="${side}" data-i="${i}"><input class="rb-c" type="number" min="1" max="20" value="${r.c}" aria-label="Coefficient"><input class="rb-t" value="${esc(r.t)}" placeholder="${side==='r'?'e.g. ethanol, CH3CH2Br or CCO':'e.g. ethene or H2O'}" aria-label="${side==='r'?'Reactant':'Product'}" spellcheck="false"><button class="linkbtn" data-rbdel aria-label="Remove">✕</button></div>`;
  $('#rbForm').innerHTML=`<div class="rb-side"><h3 class="ref-h">Reactants</h3>${RB.rows.r.map((r,i)=>row('r',r,i)).join('')}<button class="linkbtn" data-rbadd="r">+ Add reactant</button></div>
   <div class="rb-mid"><label>Arrow<select id="rbKind"><option value="arr">→ reaction</option><option value="eq">⇌ equilibrium</option><option value="retro">⇒ retrosynthesis</option></select></label><label>Above the arrow<input id="rbAbove" value="${esc(RB.above)}" placeholder="e.g. H2SO4"></label><label>Below the arrow<input id="rbBelow" value="${esc(RB.below)}" placeholder="e.g. heat, 170 °C"></label></div>
   <div class="rb-side"><h3 class="ref-h">Products</h3>${RB.rows.p.map((r,i)=>row('p',r,i)).join('')}<button class="linkbtn" data-rbadd="p">+ Add product</button></div>`;
  $('#rbKind').value=RB.kind;rbPreview()}
function rbPreview(){const{d,R,P}=rbBuild();const bad=[...R,...P].filter(z=>z.p.bad).map(z=>z.p.bad);
  $('#rbPrev').innerHTML=d.atoms.length||d.texts.length?structSVG(d,1):'<span class="eq-ph">Type names, SMILES or formulas</span>';
  const bal=rbBalance(R,P);$('#rbBal').innerHTML=(bad.length?`<p class="fc-err">Couldn't read: ${bad.map(esc).join(', ')}. Use a name (ethanol), a SMILES string (CCO) or a formula (H2O).</p>`:'')+(bal?(bal.ok?'<p class="rb-ok">✓ Balanced: the same atoms appear on both sides.</p>':`<p class="rb-bad">Not balanced: ${bal.els.filter(e=>(bal.L[e]||0)!==(bal.R[e]||0)).map(e=>`${e} ${bal.L[e]||0} → ${bal.R[e]||0}`).join(', ')}. <button class="linkbtn" id="rbAuto">Balance it</button></p>`):'');
  const ab=$('#rbAuto');if(ab)ab.onclick=rbAutoBalance}
function rbInsert(){const{d,width}=rbBuild();if(!d.atoms.length&&!d.texts.length)return toast('Add at least one species.');
  if(width>W-10)toast('This reaction is wide; it may run off the drawing. Shorten names or split it.');
  const n=App.cur&&App.mode==='notes'?App.cur:null;if(!n){toast('Open a note first.');return}
  const ed=RB.where==='end'?null:App.active;const i=ed?n.blocks.indexOf(ed.block):-1;const b={id:uid(),type:'scheme',data:d};
  if(ed&&!ed.d.atoms.length&&!ed.d.arrows.length&&!ed.d.texts.length){ed.block.data=d}else if(i>=0)n.blocks.splice(i+1,0,b);else n.blocks.push(b);
  RB.rows={r:[{t:'',c:1}],p:[{t:'',c:1}]};RB.above=RB.below='';RB.kind='arr';App.noteChanged(n);closeBuilder();openNoteKeep(n);const k=ed&&ed.block.data===d?i:i>=0?i+1:n.blocks.length-1;const el=document.querySelectorAll('#blocks .block')[k];if(el)el.scrollIntoView({block:'center',behavior:'smooth'});toast('Reaction added. Click it to edit with the drawing tools.')}
function wireBuilder(){const S=$('#rbScrim');
  S.addEventListener('input',e=>{const r=e.target.closest('.rb-row');if(r){const row=RB.rows[r.dataset.side][+r.dataset.i];if(e.target.classList.contains('rb-t'))row.t=e.target.value;else row.c=Math.max(1,Math.min(20,parseInt(e.target.value)||1))}
    if(e.target.id==='rbAbove')RB.above=e.target.value;if(e.target.id==='rbBelow')RB.below=e.target.value;clearTimeout(RB.t);RB.t=setTimeout(rbPreview,200)});
  S.addEventListener('change',e=>{if(e.target.id==='rbKind'){RB.kind=e.target.value;rbPreview()}});
  S.addEventListener('click',e=>{if(e.target.id==='rbScrim'||e.target.closest('#rbCancel'))return closeBuilder();if(e.target.closest('#rbIns'))return rbInsert();
    const a=e.target.closest('[data-rbadd]');if(a){RB.rows[a.dataset.rbadd].push({t:'',c:1});renderBuilder();const ins=S.querySelectorAll(`.rb-row[data-side="${a.dataset.rbadd}"] .rb-t`);ins[ins.length-1].focus();return}
    const dl=e.target.closest('[data-rbdel]');if(dl){const r=dl.closest('.rb-row');RB.rows[r.dataset.side].splice(+r.dataset.i,1);if(!RB.rows[r.dataset.side].length)RB.rows[r.dataset.side].push({t:'',c:1});renderBuilder()}});
}

/* ---------- chemistry menu ---------- */
const CM_ITEMS=[['build','⇌','Reaction builder','Type a full reaction and check it balances'],['res','↔','Resonance structures','Draw every contributor of the selected molecule'],['rxn','📖','Reaction library','34 reactions with mechanisms'],['prac','↷','Mechanism practice','Draw the curly arrows yourself'],['calc','M','Formula calculator','Molar mass, moles and empirical formulae'],['ref','▦','Quick reference','Periodic table, pKa, groups, spectra']];
function openChemMenu(btn){const m=$('#chemMenu');if(!m.hidden){m.hidden=true;return}
  m.innerHTML=CM_ITEMS.map(([k,ic,t,sub])=>`<button class="cm-it" data-cm="${k}" role="menuitem"><span class="cm-ic" aria-hidden="true">${ic}</span><span><b>${t}</b><small>${sub}</small></span></button>`).join('')+`<label class="cm-chk"><input type="checkbox" id="cmVal"${VCHK.on?' checked':''}> Check structures as I draw</label>`;
  const r=btn.getBoundingClientRect();m.hidden=false;const w=m.offsetWidth;m.style.left=Math.max(8,Math.min(innerWidth-w-8,r.left))+'px';const below=r.bottom+6,h=m.offsetHeight;m.style.top=(below+h>innerHeight-8?Math.max(8,r.top-h-6):below)+'px';btn.setAttribute('aria-expanded','true');m.querySelector('button').focus()}
function closeChemMenu(){const m=$('#chemMenu');if(m.hidden)return;m.hidden=true;const b=document.querySelector('[data-act="more"]');if(b)b.setAttribute('aria-expanded','false')}
function setValidate(on){VCHK.on=on;try{localStorage.setItem('bondline.validate',on?'1':'0')}catch(e){}for(const ed of App.editors||[])try{ed.render()}catch(e){}if(App.active)try{App.active.render()}catch(e){}const c=$('#setVal');if(c)c.checked=on}
function wireChem(){const m=$('#chemMenu');
  m.addEventListener('click',e=>{const b=e.target.closest('[data-cm]');if(!b)return;closeChemMenu();const k=b.dataset.cm;
    if(k==='build')openBuilder();else if(k==='res')drawResonance();else if(k==='rxn')openLibrary();else if(k==='prac')openPractice();else if(k==='calc')openRef('calc');else openRef()});
  m.addEventListener('change',e=>{if(e.target.id==='cmVal')setValidate(e.target.checked)});
  document.addEventListener('pointerdown',e=>{if(!m.hidden&&!e.target.closest('#chemMenu,[data-act="more"]'))closeChemMenu()});
  m.addEventListener('keydown',e=>{const its=[...m.querySelectorAll('button,input')],i=its.indexOf(document.activeElement);if(e.key==='ArrowDown'){e.preventDefault();its[(i+1)%its.length].focus()}else if(e.key==='ArrowUp'){e.preventDefault();its[(i-1+its.length)%its.length].focus()}});
  const sv=$('#setVal');if(sv){sv.checked=VCHK.on;sv.addEventListener('change',()=>setValidate(sv.checked))}
  wireBuilder()}

/* ---------- PDFs with real, selectable text (the browser's print to PDF) ---------- */
async function printNotes(notes,title){notes=notes.filter(Boolean);if(!notes.length)return toast('There are no notes to print.');
  if(App.printing)return;App.printing=true;toast(notes.length>1?`Preparing ${notes.length} notes…`:'Preparing the note…');
  const area=document.createElement('div');area.id='printArea';
  try{for(const n of notes){const r=await buildPrint(n,true);r.classList.add('p-vec');area.appendChild(r)}
    document.body.appendChild(area);
    if(area.querySelector('[data-tex]')){if(await mathReady())renderMathIn(area)}
    if(document.fonts&&document.fonts.ready)await document.fonts.ready;
    const old=document.title;document.title=title||'Bondline';document.body.classList.add('printing');
    const done=()=>{document.body.classList.remove('printing');area.remove();document.title=old;App.printing=false;window.removeEventListener('afterprint',done)};
    window.addEventListener('afterprint',done);
    toast('Choose “Save as PDF” as the printer to get a PDF with selectable text.');
    try{window.print()}catch(e){done();toast('Printing isn\'t available here. Use “Download PDF (image)” instead.');return}
    setTimeout(()=>{if(App.printing&&!matchMedia('print').matches)done()},1500)}
  catch(e){console.error(e);area.remove();App.printing=false;toast('Couldn\'t prepare the note for printing.')}}
function pdfMenu(btn,notes,base){const m=$('#pdfMenu');if(!m.hidden){m.hidden=true;return}
  m.innerHTML=`<button class="cm-it" data-pdf="text" role="menuitem"><span class="cm-ic" aria-hidden="true">T</span><span><b>Print or save as PDF</b><small>Selectable, searchable text and sharp drawings</small></span></button><button class="cm-it" data-pdf="img" role="menuitem"><span class="cm-ic" aria-hidden="true">▣</span><span><b>Download PDF (image)</b><small>Looks exactly like the screen; text can't be selected</small></span></button>`;
  m._go=k=>{m.hidden=true;if(k==='text')printNotes(notes,base);else exportPDF(notes,base+'.pdf')};
  const r=btn.getBoundingClientRect();m.hidden=false;const w=m.offsetWidth;m.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';m.style.top=(r.bottom+6)+'px';m.querySelector('button').focus()}
/* ---------- appearance ---------- */
const SCHEME_NAMES={copper:'Copper Sulfate',malachite:'Malachite',potassium:'Potassium Flame',sodium:'Sodium Lamp'};
const SCHEME_CURL={copper:'#d33f49',malachite:'#d9480f',potassium:'#e03e52',sodium:'#c2255c'};
const SCHEME_LIGHT={"copper": {"accent": "#1f5fd1", "soft": "#e3ecfc", "a2": "#0b7d72", "a2soft": "#d9f2ee", "curl": "#d33f49"}, "malachite": {"accent": "#0b7a57", "soft": "#ddf1e8", "a2": "#3b5bdb", "a2soft": "#e4e9fd", "curl": "#d9480f"}, "potassium": {"accent": "#6941c6", "soft": "#ece6fb", "a2": "#9a5b00", "a2soft": "#fbefd9", "curl": "#e03e52"}, "sodium": {"accent": "#a35a06", "soft": "#fbefdc", "a2": "#1c6e8c", "a2soft": "#dcedf4", "curl": "#c2255c"}};
const SCHEME_A2={copper:'#0b7d72',malachite:'#3b5bdb',potassium:'#9a5b00',sodium:'#1c6e8c'};
function getAppearance(){try{const a=JSON.parse(localStorage.getItem('bondline.appearance')||'{}');return{scheme:SCHEME_NAMES[a.scheme]?a.scheme:'copper',mode:['light','dark'].includes(a.mode)?a.mode:'auto'}}catch(e){return{scheme:'copper',mode:'auto'}}}
function applyAppearance(a,save){
  const r=document.documentElement;
  if(a.scheme&&a.scheme!=='copper')r.setAttribute('data-scheme',a.scheme);else r.removeAttribute('data-scheme');
  if(a.mode==='light'||a.mode==='dark')r.setAttribute('data-mode',a.mode);else r.removeAttribute('data-mode');
  if(save){try{localStorage.setItem('bondline.appearance',JSON.stringify(a))}catch(e){}}
  PRINT.curl=SCHEME_CURL[a.scheme]||PRINT.curl;PRINT.a2=SCHEME_A2[a.scheme]||PRINT.a2;PRINT.accent=(SCHEME_LIGHT[a.scheme]||SCHEME_LIGHT.copper).accent;PRINT.scheme=a.scheme;
  document.querySelectorAll('.ap-seg [data-mode]').forEach(b=>{const on=b.dataset.mode===a.mode;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});
  document.querySelectorAll('.ap-sch').forEach(b=>{const on=b.dataset.scheme===a.scheme;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});
  const cur=$('#apCur');if(cur)cur.textContent=SCHEME_NAMES[a.scheme]+' · '+({light:'Light',dark:'Dark',auto:'Auto'})[a.mode];
  const tc=document.querySelector('meta[name="theme-color"]:not([media])');if(tc)tc.setAttribute('content',getComputedStyle(document.body).backgroundColor);
  if(typeof V3!=='undefined'&&V3.open&&V3.frame){readTheme3D();const df=V3.frame.def;setFrame(df.kind==='static'?staticFrame(df.k):transFrame(df.k))}
}
$('#appearPop').addEventListener('click',e=>{const m=e.target.closest('[data-mode]'),sc=e.target.closest('.ap-sch');const a=getAppearance();if(m)a.mode=m.dataset.mode;if(sc)a.scheme=sc.dataset.scheme;if(m||sc)applyAppearance(a,true)});
applyAppearance(getAppearance(),false);
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>applyAppearance(getAppearance(),false))}catch(e){}
/* ---------- app ---------- */
const App={trash:[],folders:[],foldersAt:0,openFolders:new Set(),decks:[],coarse:matchMedia('(pointer:coarse)').matches,mode:'notes',quiz:{v:1,q:{}},notes:[],cur:null,tool:'b1',editors:[],active:null,dismissed:new Set(),pop:null,
  setActive(ed){if(this.active===ed)return;this.active?.wrap.classList.remove('active');this.active=ed;ed?.wrap.classList.add('active');if(typeof syncChem==='function')syncChem()},
  noteChanged(n){if(!n||n.virtual)return;if(n.example)delete n.example;n.updated=Date.now();scheduleSave(n);refreshMeta()}};
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,2600)}
function setStatus(kind){const el=$('#store'),txt={local:'On this device',connecting:'Connecting…',saving:'Saving…',cloud:'Synced',err:'Couldn\'t sync'}[kind];el.title={local:'Your notes are saved in this browser.',connecting:'Connecting to your account',saving:'Saving your changes',cloud:'Saved to your account',err:'Couldn\'t save to your account. A copy is kept in this browser.'}[kind]||'';el.className='store '+(kind==='cloud'?'ok':kind==='saving'||kind==='connecting'?'busy':kind==='err'?'err':'');el.querySelector('span').textContent=txt}
function persistLocal(){try{localStorage.setItem(LS_ACTIVE,JSON.stringify({dismissed:[...App.dismissed],folders:App.folders,foldersAt:App.foldersAt,notes:App.notes,trash:App.trash}));return true}catch(e){setStatus('err');toast('This device has run out of space for notes. Back up and delete some notes.');return false}}
const saveT={},busy={},again={};
function scheduleSave(n){setStatus('saving');clearTimeout(saveT[n.id]);saveT[n.id]=setTimeout(()=>flush(n.id),650)}
async function flush(id){
  persistLocal();{const sn=App.notes.find(x=>x.id===id);if(sn)snapshot(sn,false,'')}
  if(Store.mode!=='cloud'){setStatus('local');return}
  const n=App.notes.find(x=>x.id===id);if(!n||n.example){setStatus('cloud');return}
  if(busy[id]){again[id]=true;return}busy[id]=true;
  try{await Store.save(n);setStatus('cloud')}
  catch(e){setStatus('err');if(e&&e.code==='quota_exceeded')toast('Your notebook storage is full. Delete some notes to keep saving.');else if(e&&e.code==='invalid_argument')toast('This note is too large to save. Try splitting it into two notes.')}
  finally{busy[id]=false;if(again[id]){again[id]=false;flush(id)}}
}
const fmtDate=t=>{const d=new Date(t),n=new Date();return d.toDateString()===n.toDateString()?'Today '+d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):d.toLocaleDateString([],{day:'numeric',month:'short',year:d.getFullYear()===n.getFullYear()?undefined:'numeric'})};
const plain=h=>{const d=document.createElement('div');d.innerHTML=h||'';return d.textContent};

function renderList(){
  const q=$('#search').value.trim().toLowerCase(),nav=$('#noteList');
  if(App.mode==='home'){clearTimeout(App._hmT);App._hmT=setTimeout(renderHome,200)}
  if(App.mode==='cards'){clearTimeout(App._cpT);App._cpT=setTimeout(renderCardsPage,200)}
  const list=sortedNotes(App.notes.filter(n=>q?noteText(n).toLowerCase().includes(q):inView(n)));
  const lbl=$('#viewLabel');if(lbl&&q)lbl.textContent='Search results';else if(lbl)renderFolders();
  nav.innerHTML=list.length?list.map(n=>{const k=n.blocks.filter(b=>b.type==='scheme').length,tg=noteTags(n),fc=n.blocks.filter(b=>b.type==='cards').reduce((a,b)=>a+b.data.cards.length,0),cm=cmtCount(n),fd=q&&n.folder&&folderById(n.folder);
    return`<button class="item${App.cur&&App.cur.id===n.id?' on':''}" data-id="${n.id}" draggable="true" title="${esc(n.title||'Untitled note')}"><span class="t">${n.pinned?'<span class="pin" aria-label="Pinned">★</span> ':''}${esc(n.title||'Untitled note')}</span><span class="m"><span>${fmtDate(n.updated)}</span>${cm?`<span>💬 ${cm}</span>`:''}${fd?`<span>▤ ${esc(fd.name)}</span>`:''}${tg.length?`<span>${esc(tg[0])}${tg.length>1?` +${tg.length-1}`:''}</span>`:''}</span></button>`}).join('')
    :`<div class="empty-list">${q?'No notes match “'+esc(q)+'”.':(VIEW.folder!=='all'||VIEW.tag)?'Nothing here yet. Drag a note onto a folder to file it.':'No notes yet.'}</div>`;
}
let metaT;function refreshMeta(){clearTimeout(metaT);metaT=setTimeout(()=>{renderList();const d=$('#noteDate');if(d&&App.cur)d.textContent='Edited '+fmtDate(App.cur.updated)},300)}

function openNote(id){
  closePop();if(App.cur&&App.cur.id!==id)snapshot(App.cur,true,'');if(CM.draft){if(CM.draft.a==='t'&&App.cur)dropAnchor(CM.draft.id);CM.draft=null}const n=App.notes.find(x=>x.id===id);if(!n&&CM.open)closeComments();App.cur=n||null;App.editors=[];App.active=null;App.sketches=[];App.sketch=null;App.decks=[];TX.body=null;TX.range=null;
  const head=$('#noteHead'),blocks=$('#blocks');
  $('#side').classList.remove('open');
  if(!n){head.innerHTML=`<div class="empty"><h2>No note open</h2><p>Start a note to draw structures, reactions and mechanisms.</p><button class="btn primary" id="emptyNew">New note</button></div>`;blocks.innerHTML='';$('#palette').hidden=true;$('#addbar').hidden=true;$('#emptyNew').onclick=newNote;renderList();return}
  $('#palette').hidden=false;$('#addbar').hidden=false;
  head.innerHTML=`<header class="note-head"><textarea class="note-title" id="noteTitle" rows="1" placeholder="Untitled note" aria-label="Note title">${esc(n.title)}</textarea><div class="note-meta"><label class="nm-folder" title="Folder"><span aria-hidden="true">▤</span><select id="noteFolder" aria-label="Folder"></select></label><div class="tagchips" id="noteTags"><span class="lbl">Tags</span><input list="tagList" aria-label="Add a tag, then press Enter" maxlength="40"></div><datalist id="tagList"></datalist><div class="nh-acts" role="toolbar" aria-label="Note actions"><button class="nh-b" id="notePin" aria-pressed="false" aria-label="Pin"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.6l-3.8 2 .7-4.3-3.1-3 4.3-.6z"/></svg></button><button class="nh-b" id="cmtBtn" aria-controls="cmtPanel" aria-expanded="false" title="Comments" aria-label="Comments"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 3.5h11v7.5H7l-3 2.5V11H2.5z"/></svg><span class="cm-n"></span></button><button class="nh-b" id="histBtn" title="History: earlier versions of this note" aria-label="History"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8.5" cy="8" r="5.5"/><path d="M8.5 5v3.2l2 1.3M1.5 7.5l1.4 1.6 1.5-1.6"/></svg></button><button class="nh-b" id="shareBtn" hidden title="Share a read-only link" aria-label="Share"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="12" cy="3.5" r="1.8"/><circle cx="4" cy="8" r="1.8"/><circle cx="12" cy="12.5" r="1.8"/><path d="M5.6 7.1l4.8-2.7M5.6 8.9l4.8 2.7"/></svg></button><button class="nh-b" id="pdfNote" title="Export this note to PDF" aria-label="Export PDF"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 1.8h5.5L12.5 5v9.2H4z"/><path d="M9.3 2v3.2h3M8.2 7.5v4.2M6.4 10l1.8 1.8L10 10"/></svg></button><button class="nh-b nh-del" id="delNote" title="Move to Trash" aria-label="Delete note"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 4.5h9M6.5 4.5V3h3v1.5M5 4.5l.6 8.5h4.8l.6-8.5"/></svg></button></div></div><div class="note-date" id="noteDate">Edited ${fmtDate(n.updated)}</div></header>`;
  const ti=$('#noteTitle'),fit=()=>{ti.style.height='auto';ti.style.height=ti.scrollHeight+'px'};fit();requestAnimationFrame(fit);
  ti.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();const tb=document.querySelector('.text-body');if(tb)tb.focus()}});
  ti.addEventListener('input',e=>{const v=e.target.value.replace(/\n+/g,' ');if(v!==e.target.value)e.target.value=v;n.title=v;fit();App.noteChanged(n)});
  wireNoteOrg(n);$('#cmtBtn').onclick=()=>CM.open?closeComments():openComments();
  $('#delNote').onclick=()=>deleteNote(n);$('#histBtn').onclick=openHistory;if(window.BL_SHARE)BL_SHARE.wire(n);if(!n.example)snapshot(n,false,'');
  $('#pdfNote').onclick=e=>pdfMenu(e.currentTarget,[n],fileBase());
  blocks.innerHTML='';for(const b of n.blocks)blocks.appendChild(blockEl(b,n));
  App.setActive(App.editors[0]||null);setCtx('struct');renderList();refreshOutline();if(CM.open)renderComments();syncCmtButton();markCommentSpans();if(App.mode==='notes')$('#main').scrollTop=0;
}
function armButton(btn,armedText,fn){const orig=btn.innerHTML;let t;btn.addEventListener('click',()=>{if(btn.classList.contains('armed')){clearTimeout(t);fn();return}btn.classList.add('armed');btn.textContent=armedText;t=setTimeout(()=>{btn.classList.remove('armed');btn.innerHTML=orig},3000)})}
function deleteNote(n){trashNote(n)}
const BI={up:'<svg viewBox="0 0 16 16"><path d="M8 13V3M4 7l4-4 4 4"/></svg>',down:'<svg viewBox="0 0 16 16"><path d="M8 3v10M4 9l4 4 4-4"/></svg>',del:'<svg viewBox="0 0 16 16"><path d="M3.5 4.5h9M6.5 4.5V3h3v1.5M5 4.5l.6 8.5h4.8l.6-8.5"/></svg>'};
function blockEl(b,n){
  const sec=document.createElement('section');sec.className='block block-'+b.type;sec.dataset.id=b.id;
  sec.innerHTML=`<div class="block-tools"><button data-act="up" title="Move up" aria-label="Move block up">${BI.up}</button><button data-act="down" title="Move down" aria-label="Move block down">${BI.down}</button>${b.type==='scheme'?`<button data-act="3d" title="View in 3D" aria-label="View this drawing in 3D" class="b3d">3D</button>`:''}<button data-act="cmt" title="Comment on this block" aria-label="Comment on this block">💬</button><button data-act="del" title="Delete block" aria-label="Delete block">${BI.del}</button></div>`;
  const b3=sec.querySelector('[data-act="3d"]');if(b3)b3.onclick=()=>open3D(b.data,(n.title||'Untitled note'));
  sec.querySelector('[data-act="cmt"]').onclick=()=>addBlockComment(b);
  sec.querySelector('[data-act="up"]').onclick=()=>moveBlock(n,b,-1);
  sec.querySelector('[data-act="down"]').onclick=()=>moveBlock(n,b,1);
  armButton(sec.querySelector('[data-act="del"]'),'Delete?',()=>{n.blocks=n.blocks.filter(x=>x!==b);App.noteChanged(n);openNoteKeep(n)});
  if(b.type==='text'){
    const body=document.createElement('div');body.className='text-body';body.contentEditable='true';body.dataset.ph='Write notes… type # for a heading, - for a list, $x^2$ for maths';body.setAttribute('role','textbox');body.setAttribute('aria-multiline','true');body.setAttribute('aria-label','Note text');
    wireTextBody(body,b,n);sec.append(body);
  }else if(b.type==='image'){imageBlock(b,n,sec)}
  else if(b.type==='cards'){const host=document.createElement('div');sec.appendChild(host);App.decks.push(new DeckEditor(b,host,n))}
  else if(b.type==='sketch'){const host=document.createElement('div');sec.appendChild(host);(App.sketches=App.sketches||[]).push(new Sketch(b,host,n))}
  else{const host=document.createElement('div');sec.appendChild(host);App.editors.push(new Editor(b,host,n))}
  return sec;
}
function openNoteKeep(n){const sc=$('#main').scrollTop;openNote(n.id);$('#main').scrollTop=sc}
function moveBlock(n,b,dir){const i=n.blocks.indexOf(b),j=i+dir;if(j<0||j>=n.blocks.length)return;[n.blocks[i],n.blocks[j]]=[n.blocks[j],n.blocks[i]];App.noteChanged(n);openNoteKeep(n)}
function addBlock(type){const n=App.cur;if(!n)return;if(type==='image')return pickImages();const b=type==='text'?{id:uid(),type:'text',html:''}:type==='cards'?{id:uid(),type:'cards',data:emptyDeck()}:type==='sketch'?{id:uid(),type:'sketch',data:emptySketch(520)}:{id:uid(),type:'scheme',data:emptyScheme(240)};n.blocks.push(b);App.noteChanged(n);const el=blockEl(b,n);$('#blocks').appendChild(el);if(type==='text')el.querySelector('.text-body').focus();else if(type==='sketch'){App.sketch=App.sketches[App.sketches.length-1]}else if(type==='cards'){const t=el.querySelector('.fc-title');if(t)t.focus()}else{App.setActive(App.editors[App.editors.length-1]);setCtx('struct')}el.scrollIntoView({block:'nearest',behavior:'smooth'})}
function newNote(){if(App.mode!=='notes')setMode('notes');const n={id:uid(),title:'',tag:VIEW.tag||'',tags:VIEW.tag?[VIEW.tag]:[],folder:folderById(VIEW.folder)?VIEW.folder:'',updated:Date.now(),blocks:[{id:uid(),type:'text',html:''},{id:uid(),type:'scheme',data:emptyScheme(240)}]};App.notes.push(n);App.noteChanged(n);openNote(n.id);$('#noteTitle').focus()}

/* palette */
function buildPalette(){
  let h='';
  for(const[g,items]of GROUPS){
    h+=`<div class="grp"><span>${g}</span><div>`;
    if(items)for(const[id,name,key]of items)h+=`<button class="tb" data-tool="${id}" title="${esc(name)}${key?' ('+key+')':''}" aria-label="${esc(name)}">${ICON[id]}</button>`;
    else{for(const el of ELS)h+=`<button class="tb el${el.length>1?' wide':''}" data-tool="el:${el}" title="${el} atom" aria-label="${el} atom">${el}</button>`;h+=`<input class="custom" id="customEl" placeholder="OMe" title="Custom label: type e.g. OMe, Ph, NO2 and press Enter" aria-label="Custom atom label">`}
    h+='</div></div>';
  }
  h+=`<div class="grp"><span>Chemistry</span><div><button class="tb" data-act="tpl" title="Templates: groups, rings, amino acids, reagents" aria-label="Templates"><svg viewBox="0 0 20 20" style="fill:none"><path d="M6 2.8l3.1 1.8v3.6L6 10 2.9 8.2V4.6zM14 2.8l3.1 1.8v3.6L14 10l-3.1-1.8V4.6zM10 10l3.1 1.8v3.6L10 17.2l-3.1-1.8v-3.6z"/></svg></button><button class="tb" data-act="fromname" title="Draw a structure from its name" aria-label="Draw from a name"><span class="tb-txt">Aa→</span></button><button class="tb" data-act="info" title="Show name, formula and molar mass" aria-label="Molecule info" aria-pressed="false"><span class="tb-txt">C<sub>x</sub>H<sub>y</sub></span></button><button class="tb" data-act="cip" title="Label R/S and E/Z" aria-label="Label R/S and E/Z" aria-pressed="false"><span class="tb-txt"><i>R/S</i></span></button><button class="tb tb-more" data-act="more" title="More chemistry tools" aria-label="More chemistry tools" aria-haspopup="menu" aria-expanded="false"><span class="tb-txt">More</span><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></button></div></div>`;
  h+=`<div class="grp"><span>Drawing</span><div><button class="tb" data-act="undo" title="Undo (Ctrl+Z)" aria-label="Undo">${ICON.undo}</button><button class="tb" data-act="redo" title="Redo (Ctrl+Shift+Z)" aria-label="Redo">${ICON.redo}</button><button class="tb" data-act="png" title="Save as PNG image" aria-label="Save as PNG">${ICON.save}</button><button class="tb" data-act="copy" title="Copy as image" aria-label="Copy as image">${ICON.copy}</button><button class="tb" data-act="svgdl" title="Save as SVG" aria-label="Save as SVG" style="font:700 10px var(--font-ui)">SVG</button><button class="tb" data-act="3d" title="View in 3D (D)" aria-label="View in 3D"><svg viewBox="0 0 20 20" style="fill:none"><path d="M10 2.5l6.5 3.75v7.5L10 17.5l-6.5-3.75v-7.5z"/><path d="M10 10l6.5-3.75M10 10v7.5M10 10L3.5 6.25"/></svg></button><button class="tb" data-act="help" title="Shortcuts (?)" aria-label="Shortcuts">${ICON.help}</button></div></div>`;
  const tools=$('#tools');tools.innerHTML=h;
  tools.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.tool)setTool(b.dataset.tool);else if(b.dataset.act)paletteAct(b.dataset.act)});
  const ci=$('#customEl');
  ci.addEventListener('keydown',e=>{if(e.key==='Enter'){const v=ci.value.replace(/\s+/g,'');if(v){setTool('el:'+v);ci.blur()}}});
  ci.addEventListener('focus',()=>{const v=ci.value.replace(/\s+/g,'');if(v)setTool('el:'+v)});
}
function setTool(t){
  App.tool=t;closePop();
  const known=GROUPS.some(([,it])=>it&&it.some(x=>x[0]===t))||ELS.some(e=>'el:'+e===t);
  document.querySelectorAll('.tb[data-tool]').forEach(b=>b.classList.toggle('on',b.dataset.tool===t));
  const ci=$('#customEl');ci.classList.toggle('on',t.startsWith('el:')&&!known);
  const[name,txt]=toolHint(t);$('#hint').innerHTML=`<b>${esc(t.startsWith('el:')?t.slice(3)+' atom':name)}</b><span>${esc(txt)}</span>`;
  for(const ed of App.editors){ed.sel.clear();ed.render()}
}
const MIME={png:'image/png',svg:'image/svg+xml',pdf:'application/pdf',json:'application/json'};
async function saveFile(name,data){
  const ext=name.split('.').pop(),blob=data instanceof Blob?new Blob([data],{type:MIME[ext]||data.type}):new Blob([data],{type:MIME[ext]||'application/octet-stream'});
  if(matchMedia('(pointer:coarse)').matches&&navigator.canShare){const file=new File([blob],name,{type:blob.type});if(navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e&&e.name==='AbortError')throw{code:'declined'}}}}
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
}
async function getDownloads(){return{save:async({filename,data})=>{await saveFile(filename,data);return{status:'saved'}}}}
function fileBase(){return((App.cur&&App.cur.title)||'structure').replace(/[^\w\- ]+/g,'').trim().replace(/\s+/g,'-').toLowerCase()||'structure'}
function syncChem(){const ed=App.active;['info','cip'].forEach(k=>{const b=document.querySelector(`.tb[data-act="${k}"]`);if(b){const on=!!(ed&&ed.d[k]);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)}})}
async function paletteAct(a){
  const ed=App.active;
  if(a==='help')return showHelp(true);
  if(a==='tpl')return openTplPicker();
  if(a==='more')return openChemMenu(document.querySelector('[data-act="more"]'));
  if(a==='rxn')return openLibrary();
  if(a==='prac')return openPractice();
  if(a==='ref')return openRef();
  if(a==='fromname')return openNameDialog();
  if(a==='info'||a==='cip'){const ed=App.active;if(!ed)return toast('Click a drawing first');ed.d[a]=!ed.d[a];if(!ed.d[a])delete ed.d[a];ed.render();if(a==='info')ed.updateInfo();syncChem();App.noteChanged(ed.note);return}
  if(a==='3d'){if(!App.active)return toast('Click a drawing first');return open3D(App.active.d,(App.cur&&App.cur.title)||'Drawing')}
  if(!ed){toast('Click a drawing first');return}
  if(a==='undo')return ed.undo();if(a==='redo')return ed.redo();
  if(a==='copy'){
    if(!bbox(ed.d))return toast('This drawing is empty');
    try{if(!window.ClipboardItem||!navigator.clipboard?.write)throw 0;await navigator.clipboard.write([new ClipboardItem({'image/png':ed.exportPNG()})]);toast('Image copied. Paste it into your slides or docs.')}
    catch(e){toast('Copying images isn\'t allowed here. Use Save as PNG instead.')}
    return;
  }
  if(a==='png'||a==='svgdl'){
    if(!bbox(ed.d))return toast('This drawing is empty');
    const dl=await getDownloads();if(!dl)return toast('Saving files isn\'t available in this view.');
    try{const data=a==='png'?await ed.exportPNG():ed.exportSVG(false);await dl.save({filename:fileBase()+(a==='png'?'.png':'.svg'),data});toast('Saved to your downloads')}
    catch(e){if(e&&e.code==='declined')return;toast(e&&e.code==='rate_limited'?'A save is already waiting for your answer.':'Couldn\'t save the file.')}
  }
}
const PDF_ICON='<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 1.8h5.5L12.5 5v9.2H4z"/><path d="M9.3 2v3.2h3M6.2 8.6l2 2 2-2M8.2 6.4v4"/></svg>';
const LIBS={THREE:'vendor/three.min.js',jspdf:'vendor/jspdf.umd.min.js',html2canvas:'vendor/html2canvas.min.js'};
function loadLib(name){if(window[name])return Promise.resolve();return new Promise((res,rej)=>{const s=document.createElement('script');s.src=LIBS[name];s.onload=()=>res();s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)})}
async function buildPrint(note,vec){
  const root=document.createElement('div');root.className='print-root';const LP=SCHEME_LIGHT[PRINT.scheme]||SCHEME_LIGHT.copper;
  for(const[k,v]of Object.entries({'--ink':'#151515','--muted':'#555555','--line':'#d4d4d4','--paper':'#f5f5f5','--surface':'#ffffff','--grid':'#cccccc','--accent':LP.accent,'--accent-soft':LP.soft,'--accent2':LP.a2,'--accent2-soft':LP.a2soft,'--curl':LP.curl,'--ok':'#1f8a4c','--ok-soft':'#e3f4e9','--bad-soft':'#fdece3','--hl':'transparent'}))root.style.setProperty(k,v);
  root.innerHTML=`<div class="pu p-head">${note.tag?`<div class="p-kicker">${esc(note.tag)}</div>`:''}<h1>${esc(note.title||'Untitled note')}</h1><div class="p-date">Bondline · ${esc(new Date(note.updated).toLocaleDateString([],{day:'numeric',month:'long',year:'numeric'}))}</div></div>`;
  const addLi=(li,mark)=>{const row=document.createElement('div');row.className='pu p-li';row.innerHTML=`<span class="mk">${mark}</span>`;const body=document.createElement('div');body.append(...li.childNodes);row.appendChild(body);root.appendChild(row)};
  for(const b of note.blocks){
    if(b.type==='text'){
      const tmp=document.createElement('div');tmp.innerHTML=sanitize(b.html);let buf=null;
      for(const node of[...tmp.childNodes]){
        if(node.nodeType===1&&(node.tagName==='UL'||node.tagName==='OL')){let i=1;for(const li of[...node.children])addLi(li,node.tagName==='OL'?(i++)+'.':'•');buf=null;continue}
        if(node.nodeType===1&&/^(P|DIV|H1|H2|H3|BLOCKQUOTE|PRE|HR)$/.test(node.tagName)){if(node.tagName!=='HR'&&!node.textContent.trim()&&!node.querySelector('br,[data-tex]'))continue;node.className='pu p-text';root.appendChild(node);buf=null;continue}
        if(node.nodeType===3&&!node.textContent.trim())continue;
        if(!buf){buf=document.createElement('div');buf.className='pu p-text';root.appendChild(buf)}buf.appendChild(node);
      }
    }else if(b.type==='image'){
      if(!b.data.src)continue;const img=new Image();img.className='pu p-fig';img.src=b.data.src;img.style.width={s:'240px',m:'420px',l:'620px',f:'700px'}[b.data.w]||'620px';await img.decode().catch(()=>{});root.appendChild(img);if(b.data.cap){const c=document.createElement('div');c.className='pu p-text';c.style.cssText='text-align:center;font-style:italic;color:#555;font-size:13px';c.textContent=b.data.cap;root.appendChild(c)}
    }else if(b.type==='cards'){
      const cs=b.data.cards.filter(c=>c.f.trim()||c.b.trim());if(!cs.length)continue;
      const h=document.createElement('div');h.className='pu p-ch';h.textContent=(b.data.title||'Flashcards')+' ('+cs.length+')';root.appendChild(h);
      cs.forEach((c,i)=>{const r=document.createElement('div');r.className='pu p-card'+(i===0?' first':'');r.innerHTML=`<div>${sideHTML(c.f,c.ft)}</div><div>${sideHTML(c.b,c.bt)}</div>`;root.appendChild(r)});
    }else if(b.type==='sketch'&&vec){
      if(!b.data.strokes.length)continue;const h=sketchBounds(b.data);const w=document.createElement('div');w.className='pu p-fig p-svg';w.innerHTML=sketchSVGString({...b.data,h},skPrintCol,'#ffffff');w.firstChild.removeAttribute('width');w.firstChild.removeAttribute('height');w.style.width='100%';root.appendChild(w);
    }else if(b.type==='sketch'){
      const cv=await sketchCanvas(b.data,2);if(!cv)continue;
      const img=new Image();img.className='pu p-fig';img.src=cv.toDataURL('image/png');img.style.width='700px';await img.decode().catch(()=>{});root.appendChild(img);
    }else if(vec){
      const sv=schemeSVG(b.data,false);if(!sv)continue;const w=document.createElement('div');w.className='pu p-fig p-svg';w.innerHTML=sv;const g=w.firstChild,ww=+g.getAttribute('width');g.removeAttribute('width');g.removeAttribute('height');w.style.width=Math.min(100,ww*100/W).toFixed(1)+'%';root.appendChild(w);
    }else{
      const cv=await schemeCanvas(b.data,3);if(!cv)continue;
      const img=new Image();img.className='pu p-fig';img.src=cv.toDataURL('image/png');img.style.width=f(+cv.dataset.w*700/W)+'px';await img.decode().catch(()=>{});root.appendChild(img);
    }
  }
  return root;
}
async function addNotePages(pdf,note,first){
  const root=await buildPrint(note);document.body.appendChild(root);
  try{
    if(root.querySelector('[data-tex]')){if(await mathReady())renderMathIn(root)}
    if(document.fonts&&document.fonts.ready)await document.fonts.ready;
    const H=root.scrollHeight,scale=Math.min(2.5,15000/H);
    const canvas=await window.html2canvas(root,{scale,backgroundColor:'#ffffff',logging:false,windowWidth:1200});
    const units=[...root.querySelectorAll('.pu')].map(u=>({t:u.offsetTop,b:u.offsetTop+u.offsetHeight}));
    const M=16,CW=210-2*M,mmpp=CW/700,PH=(297-2*M-8)/mmpp;
    const cuts=[...new Set(units.flatMap(u=>[u.t,u.b]))].sort((a,b)=>a-b);
    const ok=y=>!units.some(u=>u.t<y-0.5&&u.b>y+0.5);
    const pages=[];let start=0;
    while(start<H-2){
      const end=start+PH;if(end>=H){pages.push([start,H]);break}
      let brk=start;for(const c of cuts)if(c>start+1&&c<=end&&ok(c))brk=c;
      if(brk<=start)brk=end;pages.push([start,brk]);start=brk;
    }
    pages.forEach(([a,b],i)=>{
      if(!(first&&i===0))pdf.addPage();
      const pc=document.createElement('canvas');pc.width=canvas.width;pc.height=Math.max(1,Math.round((b-a)*scale));
      const cx=pc.getContext('2d');cx.fillStyle='#ffffff';cx.fillRect(0,0,pc.width,pc.height);cx.drawImage(canvas,0,Math.round(a*scale),canvas.width,pc.height,0,0,canvas.width,pc.height);
      pdf.addImage(pc.toDataURL('image/png'),'PNG',M,M,CW,(b-a)*mmpp,undefined,'FAST');
    });
  }finally{root.remove()}
}
async function exportPDF(notes,filename){
  if(App.exporting)return;notes=notes.filter(Boolean);if(!notes.length)return toast('There are no notes to export.');
  const btns=[$('#pdfNote'),$('#pdfAll')].filter(Boolean);App.exporting=true;btns.forEach(b=>b.disabled=true);toast(notes.length>1?`Building a PDF of ${notes.length} notes…`:'Building the PDF…');
  try{
    const dlP=getDownloads();
    try{await loadLib('jspdf');await loadLib('html2canvas')}catch(e){toast('Couldn\'t load the PDF tools. Reload the app and try again.');return}
    const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true});
    for(let i=0;i<notes.length;i++)await addNotePages(pdf,notes[i],i===0);
    const n=pdf.getNumberOfPages();pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(120);
    for(let p=1;p<=n;p++){pdf.setPage(p);pdf.text(`${p} / ${n}`,105,290,{align:'center'})}
    const blob=pdf.output('blob'),dl=await dlP;
    if(!dl)return toast('Saving files isn\'t available in this view.');
    await dl.save({filename,data:blob});toast('PDF saved to your downloads. Open it to print.');
  }catch(e){if(e&&e.code==='declined')return;toast(e&&e.code==='rate_limited'?'A save is already waiting for your answer.':'Couldn\'t create the PDF.');console.error(e)}
  finally{App.exporting=false;btns.forEach(b=>b.disabled=false)}
}
function showHelp(on){$('#helpScrim').hidden=!on;if(on)$('#helpClose').focus()}

/* keyboard */
const TOOLKEYS={v:'select',e:'erase','1':'b1','2':'b2','3':'b3',w:'wedge',q:'hash',b:'benz',a:'arr',m:'curl',t:'text','+':'plus','=':'plus','-':'minus',l:'lp'};
const ELKEYS={c:'C',n:'N',o:'O',s:'S',p:'P',f:'F',i:'I',h:'H',l:'Cl',b:'Br'};
document.addEventListener('keydown',e=>{
  if(V3.open){if(e.key==='Escape'){e.preventDefault();close3D()}else if(e.target.closest&&e.target.closest('select,input'))return;else if(e.key===' '){e.preventDefault();togglePlay3D()}else if(e.key==='ArrowRight'){next3D()}else if(e.key==='ArrowLeft'){jump3D(V3.k-1)}return}
  if(!$('#chemMenu').hidden||!$('#pdfMenu').hidden){if(e.key==='Escape'){closeChemMenu();$('#pdfMenu').hidden=true}if(e.key==='Escape'||e.target.closest('.pop-menu'))return}
  for(const[id,fn]of[['rbScrim',closeBuilder],['setScrim',closeSettings],['trashScrim',()=>$('#trashScrim').hidden=true],['histScrim',()=>$('#histScrim').hidden=true],['shareScrim',()=>$('#shareScrim').hidden=true],['rxnScrim',closeLibrary],['refScrim',closeRef],['lightbox',()=>$('#lightbox').hidden=true]]){if(!$('#'+id).hidden){if(e.key==='Escape')fn();return}}
  if(!$('#eqScrim').hidden){if(e.key==='Escape')closeEq();return}
  if(!$('#nameScrim').hidden){if(e.key==='Escape')closeNameDialog();return}
  if(!$('#tplPick').hidden&&e.key==='Escape'){$('#tplPick').hidden=true;return}
  if(!$('#authScrim').hidden){if(e.key==='Escape')closeAuth();return}
  if(!$('#helpScrim').hidden){if(e.key==='Escape')showHelp(false);return}
  if(App.mode==='naming'){quizKey(e);return}
  if(App.mode==='spectra'){spKey(e);return}
  if(e.target.closest&&e.target.closest('input,textarea,[contenteditable="true"]'))return;
  if(App.mode!=='notes'){if(e.key==='?')showHelp(true);return}
  if(App.sketch&&skKeys(e)){e.preventDefault();return}
  const ed=App.active,k=e.key,lk=k.toLowerCase();
  if((e.metaKey||e.ctrlKey)&&lk==='z'){if(ed){e.preventDefault();e.shiftKey?ed.redo():ed.undo()}return}
  if((e.metaKey||e.ctrlKey)&&lk==='y'){if(ed){e.preventDefault();ed.redo()}return}
  if(e.metaKey||e.ctrlKey||e.altKey)return;
  if(k==='Delete'||k==='Backspace'){if(ed){e.preventDefault();ed.deleteSel()}return}
  if(k==='Escape'){closePop();ed&&ed.clearSel();return}
  if(k==='?'){showHelp(true);return}
  const h=ed&&ed.hover;
  if(h&&h.type==='atom'){
    const a=h.obj;
    if(ELKEYS[k]){ed.snap();a.el=ELKEYS[k];ed.changed();return}
    if(k==='+'||k==='='||k==='-'){ed.snap();a.charge=Math.max(-3,Math.min(3,(a.charge||0)+(k==='-'?-1:1)));if(!a.charge)delete a.charge;ed.changed();return}
    if(k==='.'){ed.snap();a.lp=((a.lp||0)+1)%4;if(!a.lp)delete a.lp;ed.changed();return}
  }
  if(h&&h.type==='bond'){
    const b=h.obj;
    if('123'.includes(k)){ed.snap();delete b.stereo;b.order=+k;ed.changed();return}
    if(lk==='w'||lk==='q'){ed.snap();ed.modBond(b,lk==='w'?'wedge':'hash');ed.changed();return}
  }
  if(lk==='d'&&k.length===1){if(App.active)open3D(App.active.d,(App.cur&&App.cur.title)||'Drawing');return}
  if(TOOLKEYS[lk]&&k.length===1){setTool(TOOLKEYS[lk]);e.preventDefault()}
});


/* ---------- settings window ---------- */
function openSettings(sec){$('#side').classList.remove('open');$('#setScrim').hidden=false;const a=$('#acct');if(a&&!a.hidden&&$('#setAcct')&&a.parentNode!==$('#setAcct'))$('#setAcct').appendChild(a);$('#setAcctSec').hidden=!(a&&!a.hidden);$('#setClose').focus();if(sec){const el=$(sec);if(el)el.scrollIntoView({block:'start'})}}
function closeSettings(){$('#setScrim').hidden=true}
$('#openSettings').onclick=()=>openSettings();$('#setClose').onclick=closeSettings;
$('#setScrim').addEventListener('click',e=>{if(e.target.id==='setScrim')return closeSettings();if(e.target.closest('#openTrash,#pdfAll,#pdfAllImg,#openGuide,#setCmd'))closeSettings();if(e.target.closest('#setCmd'))openCmd();if(e.target.closest('#setTour')){closeSettings();openWelcome()}});
$('#sfGuide').onclick=()=>openGuide();$('#setGlossOpen').onclick=()=>{closeSettings();openGlossary()};$('#sfTrash').onclick=()=>{$('#side').classList.remove('open');openTrash()};
/* wiring */
$('#newNote').onclick=newNote;$('#pdfAll').onclick=()=>printNotes([...App.notes].sort((a,b)=>b.updated-a.updated),'bondline-notes');$('#pdfAllImg').onclick=()=>exportPDF([...App.notes].sort((a,b)=>b.updated-a.updated),'bondline-notes.pdf');
$('#pdfMenu').addEventListener('click',e=>{const b=e.target.closest('[data-pdf]');if(b&&$('#pdfMenu')._go)$('#pdfMenu')._go(b.dataset.pdf)});document.addEventListener('pointerdown',e=>{if(!$('#pdfMenu').hidden&&!e.target.closest('#pdfMenu,#pdfNote'))$('#pdfMenu').hidden=true});$('#newNote2').onclick=newNote;
$('#search').addEventListener('input',renderList);
window.addEventListener('resize',()=>{const t=$('#noteTitle');if(t){t.style.height='auto';t.style.height=t.scrollHeight+'px'}});
$('#noteList').addEventListener('click',e=>{const b=e.target.closest('.item');if(b){if(App.mode!=='notes')setMode('notes');openNote(b.dataset.id)}});
$('#homePage').addEventListener('click',homeClick);$('#cardsPage').addEventListener('click',cardsClick);$('#cardsSide').addEventListener('click',cardsClick);
$('#openGuide').onclick=()=>openGuide();$('#helpGuide').onclick=()=>{showHelp(false);openGuide('keys')};
$('#guideSide').addEventListener('click',e=>{const g=e.target.closest('[data-gd]');if(g){const el=$('#gd-'+g.dataset.gd);if(el)el.scrollIntoView({block:'start',behavior:'smooth'});$('#side').classList.remove('open')}if(e.target.closest('[data-mode-go]'))setMode('home')});
$('#outline').addEventListener('click',e=>{const b=e.target.closest('[data-ol]');const hs=$('#outline')._hs;if(b&&hs&&hs[+b.dataset.ol])hs[+b.dataset.ol].scrollIntoView({block:'start',behavior:'smooth'})});
$('#palette').addEventListener('click',e=>{const t=e.target.closest('.ctx-tab');if(t)setCtx(t.dataset.ctx)});
document.addEventListener('pointerdown',e=>{const t=e.target;if(!t.closest)return;if(t.closest('.block-scheme')){App.sketch=null;if(App.ctx!=='struct')setCtx('struct')}else if(t.closest('.block-text'))App.sketch=null;else if(t.closest('.block-sketch')){}},true);
$('#eqIn').addEventListener('input',()=>{clearTimeout(App._eqT);App._eqT=setTimeout(eqPreview,120)});
$('#eqIn').addEventListener('keydown',e=>{if(e.key==='Enter'&&(e.ctrlKey||e.metaKey)){e.preventDefault();eqSave()}});
$('#eqDisp').addEventListener('change',eqPreview);
$('#eqOk').onclick=eqSave;$('#eqCancel').onclick=closeEq;$('#eqDel').onclick=eqDelete;
$('#eqScrim').addEventListener('click',e=>{if(e.target.id==='eqScrim')closeEq()});
$('#eqSnips').addEventListener('click',e=>{const b=e.target.closest('[data-snip]');if(!b)return;const ta=$('#eqIn'),a=ta.selectionStart,z=ta.selectionEnd,t=b.dataset.snip;ta.value=ta.value.slice(0,a)+t+ta.value.slice(z);ta.focus();const br=t.indexOf('{}');const pos=a+(br>=0?br+1:t.length);ta.setSelectionRange(pos,pos);eqPreview()});
$('#blocks').addEventListener('dragover',e=>{if(e.dataTransfer&&[...e.dataTransfer.items||[]].some(i=>i.kind==='file')){e.preventDefault();$('#blocks').classList.add('drop-img')}});$('#blocks').addEventListener('dragleave',e=>{if(!$('#blocks').contains(e.relatedTarget))$('#blocks').classList.remove('drop-img')});$('#blocks').addEventListener('drop',e=>{$('#blocks').classList.remove('drop-img');const fs=[...(e.dataTransfer&&e.dataTransfer.files||[])].filter(f=>f.type.startsWith('image/'));if(!fs.length)return;e.preventDefault();const sec=e.target.closest&&e.target.closest('.block');const b=sec&&App.cur&&App.cur.blocks.find(x=>x.id===sec.dataset.id);addImages(fs,b)});
$('#addbar').addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(!b)return;if(b.dataset.add==='reaction')return openBuilder('end');if(b.dataset.add==='predict')return openPredictor();addBlock(b.dataset.add)});
$('#openSide').onclick=()=>$('#side').classList.add('open');

/* ---------- collapsible sidebar and clickable logo ---------- */
const SIDE_KEY='bondline.sidebar';
function sideIsOff(){return document.documentElement.getAttribute('data-side')==='off'}
function syncSideAria(){const off=sideIsOff();['#sideCollapse','#sideShow'].forEach(s=>{const b=$(s);if(b)b.setAttribute('aria-expanded',String(!off))})}
function setSideOff(off,focus){
  const r=document.documentElement;r.classList.add('side-moving');clearTimeout(setSideOff.t);setSideOff.t=setTimeout(()=>r.classList.remove('side-moving'),320);
  if(off)r.setAttribute('data-side','off');else r.removeAttribute('data-side');
  try{localStorage.setItem(SIDE_KEY,off?'off':'on')}catch(e){}
  syncSideAria();
  if(focus){const b=$(off?'#sideShow':'#sideCollapse');if(b)b.focus({preventScroll:true})}
}
function toggleSide(){if(innerWidth<=820){$('#side').classList.toggle('open');return}setSideOff(!sideIsOff(),true)}
$('#sideCollapse').onclick=()=>{if(innerWidth<=820)$('#side').classList.remove('open');else setSideOff(true,true)};
$('#sideShow').onclick=()=>setSideOff(false,true);
$('#brandHome').onclick=()=>setMode('home');
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&!e.altKey&&!e.shiftKey&&e.key==='\\'){e.preventDefault();toggleSide()}});
syncSideAria();
$('#main').addEventListener('pointerdown',e=>{if(!e.target.closest('#openSide'))$('#side').classList.remove('open')});
$('#helpClose').onclick=()=>showHelp(false);
$('#nameIn').addEventListener('input',()=>{clearTimeout(nmT);nmT=setTimeout(namePreview,180)});
$('#nameIn').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();clearTimeout(nmT);namePreview();if(!$('#nameIns').disabled)insertNamed()}});
$('#namePrev').addEventListener('click',e=>{const b=e.target.closest('[data-ex]');if(b){$('#nameIn').value=b.dataset.ex;namePreview();$('#nameIn').focus()}});
$('#nameIns').onclick=insertNamed;$('#nameCancel').onclick=closeNameDialog;$('#namePC').onclick=namePubchem;
$('#nameScrim').addEventListener('click',e=>{if(e.target.id==='nameScrim')closeNameDialog()});
$('#helpScrim').addEventListener('click',e=>{if(e.target.id==='helpScrim')showHelp(false)});
document.addEventListener('pointerdown',e=>{if(App.pop&&!e.target.closest('.pop')&&!e.target.closest('.scheme-svg'))closePop()});

function backupNotes(){
  const own=App.notes.filter(n=>!n.example);
  if(!own.length)return toast('Nothing to back up yet. Built-in notes are included in the app.');
  const data=JSON.stringify({app:'bondline',version:1,exported:new Date().toISOString(),folders:App.folders,notes:own});
  getDownloads().then(dl=>{if(!dl)return toast('Saving files isn\'t available in this view.');return dl.save({filename:'bondline-backup-'+new Date().toISOString().slice(0,10)+'.json',data}).then(()=>toast(`Backed up ${own.length} note${own.length>1?'s':''}`))}).catch(e=>{if(!e||e.code!=='declined')toast('Couldn\'t save the backup file.')});
}
async function restoreNotes(file){
  let data;try{data=JSON.parse(await file.text())}catch(e){return toast('That file isn\'t a Bondline backup.')}
  const list=data&&data.app==='bondline'&&Array.isArray(data.notes)?data.notes:null;
  if(!list)return toast('That file isn\'t a Bondline backup.');
  if(Array.isArray(data.folders)){const ids=new Set(App.folders.map(f=>f.id));const add=cleanFolders(data.folders).filter(f=>!ids.has(f.id));if(add.length){App.folders=cleanFolders([...App.folders,...add]);foldersChanged()}}
  let added=0,updated=0;const changed=[];
  for(const raw of list){if(!raw||!raw.id)continue;const n=normNote(JSON.parse(JSON.stringify(raw)));delete n.example;const i=App.notes.findIndex(x=>x.id===n.id);
    if(i<0){App.notes.push(n);added++;changed.push(n.id)}else if(App.notes[i].example||App.notes[i].updated<n.updated){App.notes[i]=n;updated++;changed.push(n.id)}}
  App.dismissed=new Set([...App.dismissed].filter(id=>!list.some(n=>n.id===id)));
  persistLocal();changed.forEach(id=>flush(id));
  const cur=App.cur&&App.notes.find(n=>n.id===App.cur.id),top=[...App.notes].sort((a,b)=>b.updated-a.updated)[0];openNote(cur?cur.id:top&&top.id);
  toast(added||updated?`Restored ${added} new and ${updated} updated note${added+updated===1?'':'s'}`:'Your notes were already up to date');
}
$('#backupNotes').onclick=backupNotes;
$('#restoreFile').addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)restoreNotes(f)});
document.querySelector('label[for="restoreFile"]').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();$('#restoreFile').click()}});
async function boot(){
  buildPalette();
  let local=null;try{local=JSON.parse(localStorage.getItem(LS_ACTIVE)||'null')}catch(e){}
  App.dismissed=new Set(local&&Array.isArray(local.dismissed)?local.dismissed:[]);App.folders=cleanFolders(local&&local.folders);App.foldersAt=+(local&&local.foldersAt)||0;App.trash=(local&&Array.isArray(local.trash)?local.trash:[]).filter(n=>n&&n.id&&n.deleted).map(n=>{const d=n.deleted;normNote(n);n.deleted=+d;return n});
  App.notes=local&&Array.isArray(local.notes)?local.notes.filter(n=>n&&!n.example).map(normNote):[];
  mergeLibrary();
  const first=[...App.notes].sort((a,b)=>b.updated-a.updated)[0];
  setTool('b1');openNote(first?first.id:null);
  loadQuiz();buildTextTools();wireWelcome();wireGloss();wirePredictor();wireShared();wireChem();wireOrg();wireComments();wireStudy();wireTrash();wireHistory();wireCmd();wireLibrary();wirePractice();wireRef();reconcileTrash();purgeTrash();renderTrashLink();renderFolders();setMode('home');
  setStatus('local');
  const ok=await Store.connect();
  if(!ok){setStatus('local');return}
  try{
    const{notes,meta,quiz}=await Store.loadAll();if(quiz){mergeQuiz(quiz);if(App.mode==='naming')renderNamingSide()}saveQuiz();
    if(meta&&Array.isArray(meta.dismissed))meta.dismissed.forEach(x=>App.dismissed.add(x));
    if(meta&&Array.isArray(meta.folders)&&(+meta.foldersAt||0)>(App.foldersAt||0)){App.folders=cleanFolders(meta.folders);App.foldersAt=+meta.foldersAt}else if(App.folders.length&&(!meta||(+meta.foldersAt||0)<App.foldersAt))Store.meta().catch(()=>{});renderFolders();
    const byId=new Map(notes.map(n=>[n.id,n])),up=[];
    for(const n of App.notes)if(!n.example&&(!byId.has(n.id)||byId.get(n.id).updated<n.updated)){byId.set(n.id,n);up.push(n.id)}
    const curId=App.cur&&App.cur.id;
    App.notes=[...byId.values()].filter(n=>!App.dismissed.has(n.id)||!n.id.startsWith('lib-'));reconcileTrash();purgeTrash();renderTrashLink();mergeLibrary();persistLocal();up.forEach(id=>flush(id));
    const keep=App.notes.find(n=>n.id===curId),focused=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('.page');
    if((keep&&focused)||App.mode==='naming'){if(!App.cur&&keep)App.cur=keep;renderList();if(App.mode==='naming'&&!keep){const f1=[...App.notes].sort((a,b)=>b.updated-a.updated)[0];if(f1)openNote(f1.id)}}else{const f1=keep||[...App.notes].sort((a,b)=>b.updated-a.updated)[0];openNote(f1?f1.id:null)}
    setStatus('cloud');
  }catch(e){Store.mode='local';setStatus('local')}
}

/* ---------- accounts: Firebase sign-in and sync ---------- */
const FB={cfg:window.BONDLINE_FIREBASE||null,ready:null,user:null,auth:null,db:null};
const UID_KEY='bondline.uid',PEND_KEY='bondline.pendingAuth';
const lsGet=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lsSet=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}},lsDel=k=>{try{localStorage.removeItem(k)}catch(e){}};
const uidHint=lsGet(UID_KEY);
let LS_ACTIVE=uidHint?LS_KEY+':'+uidHint:LS_KEY,QZ_ACTIVE=uidHint?QZ_KEY+':'+uidHint:QZ_KEY;
function loadScript(src){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=src;s.onload=res;s.onerror=()=>rej(new Error('load'));document.head.appendChild(s)})}
function fbLoad(){
  if(FB.ready)return FB.ready;
  FB.ready=(async()=>{
    if(!window.firebase||!window.firebase.auth)for(const n of['app','auth','firestore'])await loadScript('vendor/firebase-'+n+'-compat.js');
    if(!firebase.apps.length)firebase.initializeApp(FB.cfg);
    FB.auth=firebase.auth();FB.db=firebase.firestore();
    try{await FB.db.enablePersistence({synchronizeTabs:true})}catch(e){}
    return true;
  })();
  FB.ready.catch(()=>{FB.ready=null});
  return FB.ready;
}
const fbUser=()=>new Promise(res=>{const un=FB.auth.onAuthStateChanged(u=>{un();res(u)})});
Store.connect=async function(){
  renderAcct();
  if(!FB.cfg||(!uidHint&&!lsGet(PEND_KEY)))return false;
  setStatus('connecting');
  try{await fbLoad()}catch(e){return false}
  const u=await Promise.race([fbUser(),new Promise(r=>setTimeout(()=>r(undefined),8000))]);
  lsDel(PEND_KEY);
  if(u===undefined){setStatus('local');return false}
  if(!u){if(uidHint){lsDel(UID_KEY);location.reload();return new Promise(()=>{})}return false}
  if(u.uid!==uidHint){adoptGuestData(u.uid);location.reload();return new Promise(()=>{})}
  FB.user=u;this.col=FB.db.collection('users').doc(u.uid).collection('notes');this.mode='cloud';renderAcct();return true;
};
function adoptGuestData(uid){
  // Carry notes and quiz progress made on this device before signing in into the account.
  const read=k=>{try{return JSON.parse(lsGet(k)||'null')}catch(e){return null}};
  const g=read(LS_KEY),u=read(LS_KEY+':'+uid)||{notes:[],dismissed:[]};
  if(g&&Array.isArray(g.notes)){const by=new Map((u.notes||[]).map(n=>[n.id,n]));g.notes.forEach(n=>{if(n&&!n.example&&(!by.has(n.id)||by.get(n.id).updated<n.updated))by.set(n.id,n)});u.notes=[...by.values()];u.dismissed=[...new Set([...(u.dismissed||[]),...(g.dismissed||[])])];if(Array.isArray(g.folders)){const ids=new Set((u.folders||[]).map(f=>f.id));u.folders=[...(u.folders||[]),...g.folders.filter(f=>f&&!ids.has(f.id))];u.foldersAt=Date.now()}}
  lsSet(LS_KEY+':'+uid,JSON.stringify(u));
  const gq=read(QZ_KEY),uq=read(QZ_KEY+':'+uid)||{v:1,q:{}};
  if(gq&&gq.q)for(const[id,r]of Object.entries(gq.q)){const l=uq.q[id];if(!l||(r.at||0)>(l.at||0))uq.q[id]=r}
  lsSet(QZ_KEY+':'+uid,JSON.stringify(uq));
  lsDel(LS_KEY);lsDel(QZ_KEY);lsSet(UID_KEY,uid);
}
function syncAcctChip(){const c=$('#sfAcct');if(!c)return;if(!FB.cfg){c.hidden=true;return}c.hidden=false;
  if(FB.user){const u=FB.user,name=u.displayName||u.email||'Your account';c.innerHTML=`<span class="acct-av sm">${esc((name.trim()[0]||'?').toUpperCase())}</span>`;c.title='Account: '+name;c.setAttribute('aria-label','Account: '+name)}
  else{c.innerHTML='<span class="sf-in">Sign in</span>';c.title='Sign in to sync your notes';c.setAttribute('aria-label','Sign in to sync your notes')}}
function renderAcct(){
  setTimeout(syncAcctChip);const el=$('#acct');if(!el)return;
  if(!FB.cfg){el.hidden=true;return}
  el.hidden=false;
  if(FB.user){const u=FB.user,name=u.displayName||u.email||'Your account',ini=(name.trim()[0]||'?').toUpperCase();
    el.innerHTML=`<div class="acct-row"><span class="acct-av" aria-hidden="true">${esc(ini)}</span><span class="acct-who"><b>${esc(name)}</b>${u.displayName&&u.email?`<small>${esc(u.email)}</small>`:''}</span></div><button class="linkbtn plain" id="acctOut">Log out</button>`;
    armButton($('#acctOut'),'Click again to log out',logOut);
  }else if(uidHint){el.innerHTML=`<p class="acct-note">Connecting to your account…</p>`}
  else{el.innerHTML=`<button class="btn acct-in" id="acctIn">Sign in to sync</button><p class="acct-note">Keep your notes and quiz progress on all your devices.</p>`;$('#acctIn').onclick=()=>openAuth('in')}
}
let authMode='in';
function openAuth(mode){
  authMode=mode;const sc=$('#authScrim');sc.hidden=false;
  $('#authTitle').textContent=mode==='up'?'Create your account':'Sign in to Bondline';
  $('#authSubmit').textContent=mode==='up'?'Create account':'Sign in';
  $('#authPass').autocomplete=mode==='up'?'new-password':'current-password';
  $('#authPassHint').hidden=mode!=='up';$('#authForgot').hidden=mode==='up';
  $('#authSwitch').textContent=mode==='up'?'Already have an account? Sign in':'New here? Create an account';
  authErr('');setTimeout(()=>$('#authEmail').focus(),30);
  fbLoad().catch(()=>authErr('Sign-in couldn\'t load. Check your internet connection and try again.'));
}
function closeAuth(){$('#authScrim').hidden=true}
function authErr(msg,ok){const e=$('#authErr');e.textContent=msg;e.hidden=!msg;e.classList.toggle('ok',!!ok)}
function authMsg(e){
  const c=(e&&e.code)||'';
  return({'auth/invalid-credential':'That email and password don\'t match. Check them and try again.','auth/wrong-password':'That email and password don\'t match. Check them and try again.','auth/user-not-found':'There\'s no account with that email. Create one instead.',
    'auth/invalid-email':'That email address doesn\'t look right.','auth/email-already-in-use':'An account with that email already exists. Sign in instead.','auth/weak-password':'Use a password with at least 8 characters, mixing letters and numbers.','auth/password-does-not-meet-requirements':'Use a longer password (at least 8 characters) with letters and numbers.','auth/too-many-requests':'Too many attempts. Wait a few minutes, then try again.',
    'auth/missing-password':'Enter your password.','auth/too-many-requests':'Too many attempts. Wait a few minutes, then try again.','auth/network-request-failed':'You\'re offline. Connect to the internet to sign in.',
    'auth/unauthorized-domain':'This site\'s address isn\'t allowed to sign in yet. In Firebase, add it under Authentication → Settings → Authorized domains.',
    'auth/operation-not-allowed':'This sign-in method isn\'t turned on yet. In Firebase, enable it under Authentication → Sign-in method.','auth/popup-blocked':'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.'})[c]||'Sign-in didn\'t work. Try again.';
}
const authBusy=on=>{['#authSubmit','#authGoogle'].forEach(s=>$(s).disabled=on)};
async function afterSignIn(user){closeAuth();toast('Signed in. Loading your notes…');await flushAll();adoptGuestData(user.uid);setTimeout(()=>location.reload(),400)}
async function flushAll(){const ids=Object.keys(saveT);ids.forEach(id=>clearTimeout(saveT[id]));persistLocal();await Promise.all(ids.map(id=>flush(id).catch(()=>{})));try{localStorage.setItem(QZ_ACTIVE,JSON.stringify(App.quiz))}catch(e){}
  for(let k=0;k<24&&Object.values(busy).some(Boolean);k++)await new Promise(r=>setTimeout(r,250))}
$('#authForm').addEventListener('submit',async e=>{
  e.preventDefault();const em=$('#authEmail').value.trim(),pw=$('#authPass').value;if(!em||!pw)return authErr('Enter your email and a password.');if(authMode==='up'&&pw.length<8)return authErr('Use a password with at least 8 characters.');
  authBusy(true);authErr('');
  try{await fbLoad();const r=authMode==='up'?await FB.auth.createUserWithEmailAndPassword(em,pw):await FB.auth.signInWithEmailAndPassword(em,pw);await afterSignIn(r.user)}
  catch(err){authErr(authMsg(err))}finally{authBusy(false)}
});
$('#authGoogle').onclick=async()=>{
  authBusy(true);authErr('');
  try{await fbLoad();const p=new firebase.auth.GoogleAuthProvider();
    try{const r=await FB.auth.signInWithPopup(p);await afterSignIn(r.user)}
    catch(err){if(['auth/popup-blocked','auth/operation-not-supported-in-this-environment','auth/cancelled-popup-request'].includes(err.code)){lsSet(PEND_KEY,'1');await FB.auth.signInWithRedirect(p);return}if(err.code==='auth/popup-closed-by-user')return;throw err}}
  catch(err){authErr(authMsg(err))}finally{authBusy(false)}
};
$('#authSwitch').onclick=()=>openAuth(authMode==='up'?'in':'up');
$('#authForgot').onclick=async()=>{const em=$('#authEmail').value.trim();if(!em)return authErr('Enter your email above, then choose “Forgot password?” again.');
  try{await fbLoad();await FB.auth.sendPasswordResetEmail(em);authErr('Check your inbox for a link to reset your password.',true)}catch(err){authErr(authMsg(err))}};
$('#authClose').onclick=closeAuth;
$('#authScrim').addEventListener('click',e=>{if(e.target.id==='authScrim')closeAuth()});
async function logOut(){
  if(!FB.user)return;
  await flushAll();
  try{await Promise.race([FB.db.waitForPendingWrites(),new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),6000))])}
  catch(e){renderAcct();toast('Some changes haven\'t synced yet. Connect to the internet, wait a moment, then log out.');return}
  const uid=FB.user.uid;
  try{await FB.auth.signOut()}catch(e){}
  lsDel(LS_KEY+':'+uid);lsDel(QZ_KEY+':'+uid);lsDel(UID_KEY);
  try{await FB.db.terminate();await FB.db.clearPersistence()}catch(e){}
  location.reload();
}
let hiddenAt=0;
document.addEventListener('visibilitychange',()=>{
  if(document.hidden){hiddenAt=Date.now();return}
  if(Store.mode==='cloud'&&hiddenAt&&Date.now()-hiddenAt>30000)syncFromCloud();
});
async function syncFromCloud(){
  try{
    const{notes,quiz,meta}=await Store.loadAll();let changed=false;
    if(meta&&Array.isArray(meta.folders)&&(+meta.foldersAt||0)>(App.foldersAt||0)){App.folders=cleanFolders(meta.folders);App.foldersAt=+meta.foldersAt;renderFolders();changed=true}
    const editing=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#notesPage');
    for(const n of notes){const i=App.notes.findIndex(x=>x.id===n.id);
      if(i<0){App.notes.push(n);changed=true;continue}
      const l=App.notes[i];if(l.updated>=n.updated)continue;
      if(App.cur&&App.cur.id===n.id&&editing)continue;
      App.notes[i]=n;changed=true;if(App.cur&&App.cur.id===n.id){App.cur=n;if(App.mode!=='naming')openNoteKeep(n)}}
    if(quiz){mergeQuiz(quiz);if(App.mode==='naming')renderNamingSide()}
    if(changed){reconcileTrash();renderTrashLink();persistLocal();renderList();toast('Updated with changes from your other devices')}
  }catch(e){}
}
/* ---------- read-only share links (installed app with sign-in) ---------- */
const SHARE_COL='shares';
function shareURL(id){return location.origin+location.pathname.replace(/index\.html$/,'')+'#share='+id}
function shareSnapshot(n){return JSON.parse(JSON.stringify({title:String(n.title||'').slice(0,500),tags:noteTags(n),blocks:n.blocks,updated:n.updated}))}
window.BL_SHARE={
  wire(n){const b=$('#shareBtn');if(!b)return;b.hidden=!(FB.cfg&&FB.user)||!!n.example;b.classList.toggle('on',!!n.share);b.onclick=()=>openShare(n)}
};
function openShare(n){$('#shareScrim').hidden=false;renderShare(n)}
function renderShare(n){const box=$('#shareBody');
  if(!n.share){box.innerHTML=`<p>Make a read-only link to <b>${esc(n.title||'Untitled note')}</b>. Anyone with the link can view a copy of this note and save it to their own Bondline. They can't change yours.</p><p class="hm-muted">The link shows the note as it is now. Press “Update shared copy” after you edit it.</p><div class="np-row"><span class="np-sp"></span><button class="btn" data-sh="close">Cancel</button><button class="btn primary" data-sh="create">Create link</button></div>`}
  else{const url=shareURL(n.share);box.innerHTML=`<p>Anyone with this link can view a read-only copy of this note.</p><div class="sh-link"><input readonly value="${esc(url)}" aria-label="Share link"><button class="btn small" data-sh="copy">Copy</button></div><div class="np-row"><button class="linkbtn danger" data-sh="stop">Stop sharing</button><span class="np-sp"></span><button class="btn" data-sh="update">Update shared copy</button><button class="btn primary" data-sh="close">Done</button></div>`}
  box.onclick=async e=>{const a=e.target.closest('[data-sh]');if(!a)return;const k=a.dataset.sh;
    if(k==='close'){$('#shareScrim').hidden=true;return}
    if(k==='copy'){const v=box.querySelector('input').value;try{await navigator.clipboard.writeText(v);toast('Link copied')}catch(err){box.querySelector('input').select();toast('Press Ctrl+C to copy the link')}return}
    a.disabled=true;
    try{await fbLoad();if(!FB.user)throw{code:'auth'};
      if(k==='create'||k==='update'){const id=n.share||Array.from(crypto.getRandomValues(new Uint8Array(15)),x=>'abcdefghijklmnopqrstuvwxyz0123456789'[x%36]).join('');
        const data={owner:FB.user.uid,at:Date.now(),note:shareSnapshot(n)};if(JSON.stringify(data).length>950000)throw{code:'size'};
        await FB.db.collection(SHARE_COL).doc(id).set(data);if(!n.share){n.share=id;App.noteChanged(n)}toast(k==='create'?'Share link created':'Shared copy updated');renderShare(n);BL_SHARE.wire(n)}
      else if(k==='stop'){if(!a.classList.contains('armed')){a.classList.add('armed');a.textContent='Click again to stop sharing';a.disabled=false;return}
        await FB.db.collection(SHARE_COL).doc(n.share).delete();delete n.share;App.noteChanged(n);toast('Sharing stopped. The old link no longer works.');renderShare(n);BL_SHARE.wire(n)}}
    catch(err){a.disabled=false;toast(err&&err.code==='size'?'This note is too large to share.':err&&err.code==='auth'?'Sign in to share notes.':'Couldn\'t update the share link. Check your connection.')}}}
async function showSharedNote(id){
  if(!/^[a-z0-9]{10,40}$/.test(id))return;
  const V=$('#shareView');V.hidden=false;V.innerHTML='<div class="sv-top"><b>Bondline</b><span class="hm-muted">Loading shared note…</span></div>';
  try{await fbLoad();const snap=await FB.db.collection(SHARE_COL).doc(id).get();if(!snap.exists)throw{code:'gone'};
    const raw=snap.data().note||{},note=normNote({id:'shared',title:raw.title,tags:raw.tags||[],blocks:Array.isArray(raw.blocks)?raw.blocks:[],updated:+raw.updated||Date.now()});
    V.innerHTML=`<div class="sv-top"><b>Bondline</b><span class="hm-muted">Shared note · read-only</span><span class="np-sp"></span><button class="btn" id="svCopy">Save a copy to my notes</button><button class="btn primary" id="svClose">Open Bondline</button></div><div class="sv-page" id="svPage"></div>`;
    const root=await buildPrint(note);root.classList.add('view');$('#svPage').appendChild(root);if(root.querySelector('[data-tex]')&&await mathReady())renderMathIn(root);
    const leave=()=>{V.hidden=true;history.replaceState(null,'',location.pathname+location.search)};
    $('#svClose').onclick=leave;
    $('#svCopy').onclick=()=>{const n=normNote(JSON.parse(JSON.stringify({...note,id:uid(),title:note.title+' (copy)',updated:Date.now(),folder:'',comments:[]})));delete n.share;App.notes.push(n);App.noteChanged(n);leave();setMode('notes');openNote(n.id);toast('Saved to your notes')}}
  catch(err){V.innerHTML=`<div class="sv-top"><b>Bondline</b></div><div class="sv-page"><h2>This shared note isn't available</h2><p class="hm-muted">The link may have been turned off by its owner, or you may be offline.</p><button class="btn primary" id="svClose">Open Bondline</button></div>`;$('#svClose').onclick=()=>{V.hidden=true;history.replaceState(null,'',location.pathname)}}}
{const m=/[#&]share=([a-z0-9]+)/.exec(location.hash);if(m)setTimeout(()=>showSharedNote(m[1]),50)}
window.addEventListener('hashchange',()=>{const m=/[#&]share=([a-z0-9]+)/.exec(location.hash);if(m)showSharedNote(m[1])});

/* ---------- live sync: instant updates from other devices, conflict copies, offline status ---------- */
const SY={live:null,first:true,pending:{},conflicts:0};
const sameContent=(a,b)=>{try{return JSON.stringify([a.title||'',a.blocks||[],a.tags||[],a.folder||'',!!a.deleted])===JSON.stringify([b.title||'',b.blocks||[],b.tags||[],b.folder||'',!!b.deleted])}catch(e){return false}};
const isDirty=l=>l.base!=null&&l.updated>l.base;
setStatus=function(kind){const el=$('#store');if(!el)return;if(kind==='cloud'&&!navigator.onLine)kind='offline';
  const txt={local:'Saved',connecting:'Connecting…',saving:'Saving…',cloud:'Synced',offline:'Offline · will sync later',err:'Couldn\'t sync · back up your notes'}[kind]||'';
  const tip={local:'Notes are saved in this browser. Sign in to sync them across devices.',connecting:'Connecting to your account',saving:'Saving your changes',cloud:'Everything is saved to your account and synced to your other devices.',offline:'You\'re offline. Changes are saved on this device and will upload when you\'re back online.',err:'Some changes couldn\'t be saved to your account. They are still on this device.'}[kind]||'';
  el.className='store '+(kind==='cloud'?'ok':kind==='saving'||kind==='connecting'?'busy':kind==='err'?'err':kind==='offline'?'off':'');el.querySelector('span').textContent=txt;el.title=tip};
/* conflict: both this device and another one changed the note since the last sync */
function conflictCopy(l){const c=JSON.parse(JSON.stringify(l));c.id=uid();c.title=(l.title||'Untitled note')+' (edited on this device)';c.updated=Date.now();delete c.base;delete c.share;c.comments=c.comments||[];App.notes.push(c);SY.conflicts++;return c}
function noteConflictToast(){if(!SY.conflicts)return;const k=SY.conflicts;SY.conflicts=0;toast(k>1?`${k} notes were changed on two devices at once. Your versions from this device are kept as copies.`:'This note was changed on another device at the same time. Your version from this device is kept as a copy.')}
const _loadAll=Store.loadAll;
Store.loadAll=async function(){const r=await _loadAll.call(this);
  for(const c of r.notes){c.base=c.updated;const i=App.notes.findIndex(x=>x.id===c.id);if(i<0)continue;const l=App.notes[i];
    if(isDirty(l)&&c.updated>l.base&&!sameContent(l,c)){const cp=conflictCopy(l);App.notes[i]=c;if(App.cur===l)App.cur=c;flush(cp.id)}}
  noteConflictToast();if(!SY.live)setTimeout(startLive,1200);return r};
const _save=Store.save;
Store.save=async function(n){const u=n.updated;
  if(!navigator.onLine){_save.call(this,n).then(()=>{n.base=u;persistLocal()}).catch(()=>{});return}
  await _save.call(this,n);n.base=Math.max(n.base||0,u);persistLocal()};
function applyRemote(r){
  r.base=r.updated;const i=App.notes.findIndex(x=>x.id===r.id);
  if(i<0){App.notes.push(r);return true}
  const l=App.notes[i];if(r.updated<=l.updated&&!(isDirty(l)&&r.updated>l.base))return false;if(sameContent(l,r)){l.base=r.updated;l.updated=Math.max(l.updated,r.updated);return false}
  const editing=App.cur&&App.cur.id===r.id&&document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#notesPage');
  if(isDirty(l)&&r.updated>l.base){const cp=conflictCopy(l);App.notes[i]=r;if(App.cur===l){App.cur=r;if(App.mode==='notes')openNoteKeep(r)}flush(cp.id);return true}
  if(editing){SY.pending[r.id]=r;return false}
  App.notes[i]=r;if(App.cur===l){App.cur=r;if(App.mode==='notes')openNoteKeep(r)}return true}
function startLive(){if(SY.live||Store.mode!=='cloud'||!Store.col||!Store.col.onSnapshot)return;
  SY.live=Store.col.onSnapshot({includeMetadataChanges:false},snap=>{
    if(SY.first){SY.first=false;return}
    if(snap.metadata.hasPendingWrites)return;let changed=false,list=false;
    for(const ch of snap.docChanges()){const d=ch.doc;if(ch.type==='removed'){continue}
      const data=JSON.parse(JSON.stringify(d.data()));
      if(d.id==='_meta'){if(Array.isArray(data.dismissed))data.dismissed.forEach(x=>App.dismissed.add(x));if(Array.isArray(data.folders)&&(+data.foldersAt||0)>(App.foldersAt||0)){App.folders=cleanFolders(data.folders);App.foldersAt=+data.foldersAt;renderFolders();list=true}continue}
      if(d.id==='_quiz'){try{mergeQuiz(data);if(App.mode==='naming')renderNamingSide();if(App.mode==='spectra')renderSpecSide()}catch(e){}continue}
      if(d.id[0]==='_')continue;
      if(applyRemote(normNote({...data,id:d.id})))changed=true}
    if(changed||list){reconcileTrash();renderTrashLink();persistLocal();renderList();if(App.mode==='home'&&typeof renderHome==='function')renderHome()}
    noteConflictToast();if(changed&&!Object.values(busy).some(Boolean))setStatus('cloud');
  },()=>{SY.live=null;SY.first=true;setTimeout(startLive,15000)})}
/* apply changes that arrived while you were typing, once you leave the note */
document.addEventListener('focusout',()=>setTimeout(()=>{const a=document.activeElement;if(a&&a.closest&&a.closest('#notesPage'))return;let ch=false;for(const[id,r]of Object.entries(SY.pending)){delete SY.pending[id];if(applyRemote(r))ch=true}if(ch){reconcileTrash();persistLocal();renderList();noteConflictToast()}},60));
window.addEventListener('online',()=>{if(Store.mode!=='cloud')return;setStatus('saving');Store.col.firestore.waitForPendingWrites().then(()=>setStatus('cloud')).catch(()=>{})});
window.addEventListener('offline',()=>{if(Store.mode==='cloud')setStatus('offline')});

$('#sfAcct').onclick=()=>openSettings('#setAcctSec');
/* ---------- app shell: install, offline ---------- */
let installEvt=null;
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
const isIOS=/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvt=e;$('#installApp').hidden=false});
window.addEventListener('appinstalled',()=>{installEvt=null;$('#installApp').hidden=true;toast('Bondline is installed. Open it from your apps.')});
if(isIOS&&!standalone())$('#installApp').hidden=false;
$('#installApp').onclick=async()=>{
  if(installEvt){installEvt.prompt();const r=await installEvt.userChoice;if(r.outcome==='accepted'){installEvt=null;$('#installApp').hidden=true}}
  else if(isIOS)toast('In Safari, tap the Share button, then “Add to Home Screen”.');
  else toast('Use your browser menu and choose “Install app” or “Add to Home Screen”.');
};
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
if('serviceWorker' in navigator&&location.protocol!=='file:'){
  navigator.serviceWorker.register('sw.js').then(reg=>{
    reg.addEventListener('updatefound',()=>{const w=reg.installing;if(!w)return;w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)toast('A new version of Bondline is ready. Reopen the app to use it.')})});
  }).catch(()=>{});
}
/* ---------- chemistry glossary: built-in terms ---------- */
/* [term, other names (| separated), category, definition, SMILES for a structure picture (optional)]
   categories: s solvent, r reagent, a abbreviation, c concept, x named reaction, t technique */
const GLOSS_CATS={s:'Solvent',r:'Reagent',a:'Abbreviation',c:'Concept',x:'Reaction',t:'Technique',u:'My terms'};
const GLOSS_DATA=[
/* solvents */
['DMSO','dimethyl sulfoxide|dimethyl sulphoxide','s','Polar aprotic solvent (bp 189 °C). It solvates cations well but leaves anions “naked”, so it speeds up SN2 reactions. It is also the oxidant in the Swern oxidation.','CS(C)=O'],
['DMF','N,N-dimethylformamide|dimethylformamide','s','Polar aprotic solvent (bp 153 °C). Common for SN2 reactions, alkylations and amide couplings.','CN(C)C=O'],
['THF','tetrahydrofuran','s','Cyclic ether used as a polar aprotic solvent (bp 66 °C). The standard solvent for Grignard, organolithium and LiAlH₄ reactions: its oxygen lone pairs coordinate to Mg and Li.','C1CCOC1'],
['DCM','dichloromethane|methylene chloride|CH2Cl2','s','Weakly polar aprotic solvent (bp 40 °C). Used for extractions and many room-temperature reactions. It is denser than water, so it forms the lower layer.','ClCCl'],
['CHCl3','chloroform|trichloromethane','s','Weakly polar solvent (bp 61 °C). Its deuterated form, CDCl₃, is the most common NMR solvent.','ClC(Cl)Cl'],
['CDCl3','deuterochloroform','s','Chloroform with D in place of H. The usual solvent for ¹H and ¹³C NMR; it gives a small residual peak at 7.26 ppm.'],
['CCl4','carbon tetrachloride|tetrachloromethane','s','Non-polar solvent, now rarely used because it is toxic. The classic solvent for radical brominations with NBS and for adding Br₂ to alkenes.','ClC(Cl)(Cl)Cl'],
['MeCN','acetonitrile|CH3CN','s','Polar aprotic solvent (bp 82 °C) that mixes with water. Used for SN2 reactions and as an HPLC solvent.','CC#N'],
['Et2O','diethyl ether','s','Low-polarity aprotic solvent (bp 35 °C). The classic solvent for Grignard reagents and LiAlH₄. Very flammable, and it forms explosive peroxides on standing.','CCOCC'],
['EtOAc','ethyl acetate','s','Moderately polar aprotic solvent (bp 77 °C). Widely used for extractions and column chromatography.','CCOC(C)=O'],
['MeOH','methanol','s','Polar protic solvent (bp 65 °C). Used for NaBH₄ reductions and solvolysis; as a nucleophile it gives methyl ethers and methyl esters.','CO'],
['EtOH','ethanol','s','Polar protic solvent (bp 78 °C). Used with NaOEt for E2 eliminations and Claisen condensations, and for NaBH₄ reductions.','CCO'],
['acetone','propanone','s','Polar aprotic solvent (bp 56 °C). NaI dissolves in it but NaCl and NaBr do not, which drives the Finkelstein reaction.','CC(C)=O'],
['toluene','methylbenzene|PhMe','s','Non-polar aromatic solvent (bp 111 °C). Used for reactions that need heat and for removing water with a Dean–Stark trap.','Cc1ccccc1'],
['hexane','hexanes|n-hexane','s','Non-polar solvent (bp 69 °C) used in chromatography and recrystallisation. n-BuLi is sold as a solution in hexanes.','CCCCCC'],
['benzene','C6H6','s','The parent aromatic hydrocarbon: a planar ring of six sp² carbons sharing 6 π electrons. Rarely used as a solvent now because it causes cancer.','c1ccccc1'],
['HMPA','hexamethylphosphoramide','s','Very polar aprotic additive that binds cations strongly, which makes enolates and other anions more reactive. It is a carcinogen, so DMPU is often used instead.'],
['DME','1,2-dimethoxyethane|glyme','s','Ether solvent that wraps around metal cations (chelates). Common in Suzuki couplings.','COCCOC'],
['dioxane','1,4-dioxane','s','Cyclic diether solvent (bp 101 °C) that mixes with water.','C1COCCO1'],
['H2O','','s','Polar protic solvent. A weak nucleophile and weak base: it takes part in solvolysis (SN1/E1), hydrolysis and hydration reactions, and in workups.','O'],
['t-BuOH','tert-butanol|tBuOH|2-methylpropan-2-ol','s','Bulky polar protic solvent; the partner solvent for t-BuOK.','CC(C)(C)O'],
['AcOH','acetic acid|ethanoic acid|CH3COOH|HOAc','s','Weak acid (pKa 4.8) also used as a polar protic solvent, for example in α-bromination of ketones.','CC(=O)O'],
['NMP','N-methyl-2-pyrrolidone|N-methylpyrrolidone','s','Polar aprotic solvent with a high boiling point (202 °C).','CN1CCCC1=O'],
['pyridine','C5H5N','s','Aromatic amine (pKa of its conjugate acid is 5.2). Used as a mild base and solvent: it mops up the HCl made when acid chlorides, TsCl or SOCl₂ react.','c1ccncc1'],
/* reducing agents */
['LiAlH4','LAH|lithium aluminium hydride|lithium aluminum hydride|lithium tetrahydridoaluminate','r','Very strong hydride reducing agent. Reduces aldehydes, ketones, esters, carboxylic acids and acid chlorides to alcohols, and amides and nitriles to amines. Reacts violently with water, so it is used in dry ether or THF and followed by an aqueous workup.'],
['NaBH4','sodium borohydride|sodium tetrahydridoborate','r','Mild hydride reducing agent. Reduces aldehydes and ketones to alcohols but normally leaves esters, acids and amides alone. Works in methanol, ethanol or water.'],
['NaBH3CN','sodium cyanoborohydride','r','Mild, acid-tolerant hydride donor that reduces iminium ions faster than ketones, so it is the classic reagent for reductive amination.'],
['NaBH(OAc)3','STAB|sodium triacetoxyborohydride','r','Mild hydride donor used for reductive amination; less toxic than NaBH₃CN.'],
['DIBAL-H','DIBAL|DIBALH|diisobutylaluminium hydride|diisobutylaluminum hydride','r','Bulky, Lewis-acidic hydride. At −78 °C it adds only one hydride to esters and nitriles, giving aldehydes after workup. At higher temperatures it reduces further, to alcohols.'],
['BH3','borane|BH3·THF|BH3-THF','r','Adds H–B across C=C with boron on the less substituted carbon (syn addition). Oxidising with H₂O₂/NaOH then gives the anti-Markovnikov alcohol. Also reduces carboxylic acids to alcohols.'],
['9-BBN','9-borabicyclo[3.3.1]nonane','r','Bulky borane that gives very high anti-Markovnikov selectivity in hydroboration.'],
['Pd/C','palladium on carbon','r','Hydrogenation catalyst. With H₂ it reduces C=C and C≡C to alkanes (syn addition), nitro groups to amines, and removes benzyl (Bn) and Cbz groups. Benzene rings and C=O normally survive.'],
['Lindlar catalyst','Lindlar\'s catalyst|Lindlar','r','“Poisoned” palladium catalyst (Pd on CaCO₃ with lead and quinoline). With H₂ it reduces alkynes to cis (Z) alkenes and stops there.'],
['Raney nickel','Raney Ni','r','Spongy nickel catalyst for hydrogenation; also removes sulfur (desulfurisation of thioacetals gives CH₂).'],
['PtO2','Adams\' catalyst|platinum dioxide','r','Platinum hydrogenation catalyst; more active than Pd/C.'],
['Na/NH3','dissolving metal reduction|Na, NH3|sodium in liquid ammonia','r','Sodium dissolved in liquid ammonia. Reduces alkynes to trans (E) alkenes, and benzene rings to 1,4-cyclohexadienes (Birch reduction).'],
['Zn(Hg)','zinc amalgam','r','Zinc–mercury amalgam; with concentrated HCl it reduces aldehydes and ketones to CH₂ (Clemmensen reduction).'],
['N2H4','hydrazine','r','With KOH and heat it reduces aldehydes and ketones to CH₂ (Wolff–Kishner reduction). On its own it forms hydrazones.'],
['Sn/HCl','tin and hydrochloric acid|Fe/HCl|SnCl2','r','Metal and acid reduce aromatic nitro groups (ArNO₂) to anilines (ArNH₂).'],
['Bu3SnH','tributyltin hydride','r','Radical reducing agent: with AIBN it replaces C–Br or C–I with C–H.'],
/* oxidising agents */
['PCC','pyridinium chlorochromate','r','Mild chromium(VI) oxidant used in CH₂Cl₂. Oxidises primary alcohols to aldehydes (without going on to acids) and secondary alcohols to ketones.'],
['PDC','pyridinium dichromate','r','Chromium(VI) oxidant similar to PCC. In CH₂Cl₂ it gives aldehydes; in DMF it can take primary alcohols to carboxylic acids.'],
['DMP','Dess–Martin periodinane|Dess-Martin periodinane|Dess–Martin|Dess-Martin','r','Mild, chromium-free oxidant: primary alcohols to aldehydes and secondary alcohols to ketones at room temperature.'],
['Jones reagent','Jones oxidation','r','CrO₃ in aqueous H₂SO₄ and acetone. Oxidises primary alcohols to carboxylic acids and secondary alcohols to ketones. The orange Cr(VI) turns green as Cr(III) forms.'],
['CrO3','chromium trioxide','r','Chromium(VI) oxide; with H₂SO₄ it is the Jones reagent.'],
['K2Cr2O7','potassium dichromate|Na2Cr2O7|sodium dichromate','r','Orange chromium(VI) oxidant. With acid it oxidises primary alcohols to carboxylic acids (through the aldehyde) and secondary alcohols to ketones, turning green as Cr(III) forms.'],
['KMnO4','potassium permanganate','r','Strong oxidant. Cold, dilute and basic: alkenes give cis (syn) 1,2-diols. Hot or acidic: it cleaves alkenes, oxidises primary alcohols and aldehydes to carboxylic acids, and oxidises alkyl side chains on benzene rings to COOH.'],
['OsO4','osmium tetroxide','r','Adds to alkenes to give cis (syn) 1,2-diols. Toxic and expensive, so it is used in catalytic amounts with NMO to re-oxidise it.'],
['NMO','N-methylmorpholine N-oxide','r','Co-oxidant that regenerates OsO₄ (and TPAP) so they can be used in catalytic amounts.'],
['O3','ozone','r','Cleaves C=C bonds (ozonolysis). A reductive workup (Me₂S or Zn) gives aldehydes and ketones; an oxidative workup (H₂O₂) gives carboxylic acids and ketones.'],
['mCPBA','m-CPBA|MCPBA|meta-chloroperoxybenzoic acid|3-chloroperoxybenzoic acid','r','Peroxyacid. Converts alkenes to epoxides in one step (syn, stereospecific) and ketones to esters (Baeyer–Villiger oxidation).','OOC(=O)c1cccc(Cl)c1'],
['H2O2','hydrogen peroxide','r','Oxidant. Used with NaOH in the second step of hydroboration–oxidation, and in oxidative ozonolysis workups.'],
['NaIO4','sodium periodate','r','Cleaves 1,2-diols into two carbonyl compounds; also re-oxidises OsO₄.'],
['TEMPO','2,2,6,6-tetramethylpiperidinyloxyl','r','Stable nitroxide radical used as a catalyst (with bleach) for oxidising primary alcohols to aldehydes.'],
['(COCl)2','oxalyl chloride','r','Activates DMSO in the Swern oxidation; also converts carboxylic acids to acid chlorides.'],
['SeO2','selenium dioxide','r','Oxidises allylic C–H bonds and the α-CH₂ next to a ketone.'],
['Me2S','dimethyl sulfide|DMS','r','Mild reducing agent used to work up ozonolysis reactions (giving aldehydes and ketones). It is also the smelly by-product of the Swern oxidation.','CSC'],
['Tollens\' reagent','Tollens reagent|Tollens\' test|Tollens test','r','Ammoniacal silver nitrate, [Ag(NH₃)₂]⁺. Aldehydes reduce it to a silver mirror while being oxidised to carboxylates; ketones do not react.'],
['Fehling\'s solution','Fehling\'s test|Benedict\'s solution','r','Blue Cu(II) solution that aldehydes reduce to a red-brown Cu₂O precipitate. Ketones give no change.'],
['2,4-DNP','2,4-dinitrophenylhydrazine|Brady\'s reagent','r','Forms an orange or yellow precipitate (a hydrazone) with aldehydes and ketones; a test for C=O groups.'],
/* bases */
['LDA','lithium diisopropylamide','r','Very strong (pKa of the conjugate acid ≈ 36), bulky, non-nucleophilic base. Removes α-hydrogens quickly and irreversibly at −78 °C, giving the kinetic (less substituted) enolate.'],
['LiHMDS','LHMDS|KHMDS|NaHMDS|hexamethyldisilazide','r','Strong, bulky, non-nucleophilic amide bases (Li, Na or K salts of hexamethyldisilazane) used to make enolates.'],
['n-BuLi','nBuLi|BuLi|butyllithium|n-butyllithium','r','Very strong base and carbon nucleophile, sold as a solution in hexanes. Deprotonates terminal alkynes and many C–H acids, and swaps halogen for lithium.'],
['t-BuOK','KOtBu|tBuOK|KOt-Bu|potassium tert-butoxide|t-BuO−','r','Strong, bulky base. Favours E2 over SN2 and gives the less substituted (Hofmann) alkene.'],
['NaH','sodium hydride','r','Strong, non-nucleophilic base (the hydride leaves as H₂ gas). Used to deprotonate alcohols for the Williamson ether synthesis and to make enolates.'],
['NaNH2','sodium amide|sodamide','r','Very strong base. Deprotonates terminal alkynes and performs double eliminations of dihalides to make alkynes.'],
['NaOH','sodium hydroxide','r','Strong base and good nucleophile (HO⁻). Used for ester hydrolysis (saponification), SN2/E2 reactions and aldol reactions.'],
['KOH','potassium hydroxide','r','Strong base like NaOH. Used for E2 eliminations (often in ethanol) and in the Wolff–Kishner reduction.'],
['NaOEt','sodium ethoxide|EtONa|EtO−','r','Strong base and good nucleophile, usually used in ethanol. Gives E2 with secondary and tertiary halides, and is the base for Claisen condensations of ethyl esters.'],
['NaOMe','sodium methoxide|MeONa|MeO−','r','Strong base and good nucleophile, usually used in methanol.'],
['DBU','1,8-diazabicyclo[5.4.0]undec-7-ene','r','Strong, non-nucleophilic amidine base, popular for E2 eliminations.','C1CCC2=NCCCN2CC1'],
['Et3N','triethylamine|NEt3|TEA','r','Common organic base (pKa of the conjugate acid 10.7). Mops up the acid formed in acylations, mesylations and the Swern oxidation.','CCN(CC)CC'],
['DIPEA','Hünig\'s base|Hunig\'s base|iPr2NEt|diisopropylethylamine','r','Hindered amine base that is too crowded to act as a nucleophile.','CCN(C(C)C)C(C)C'],
['DMAP','4-dimethylaminopyridine','r','Nucleophilic catalyst for acylations: it attacks the acylating agent to make a very reactive acylpyridinium ion.','CN(C)c1ccncc1'],
['K2CO3','potassium carbonate|Cs2CO3|caesium carbonate|cesium carbonate','r','Mild inorganic base used to alkylate phenols, acids and amines.'],
['NaHCO3','sodium bicarbonate|sodium hydrogencarbonate|sodium hydrogen carbonate','r','Weak base used in workups to neutralise acid; it fizzes as CO₂ is released.'],
/* acids and Lewis acids */
['HCl','hydrochloric acid|hydrogen chloride','r','Strong acid. Adds to alkenes (Markovnikov) and converts tertiary alcohols to alkyl chlorides.'],
['HBr','hydrobromic acid|hydrogen bromide','r','Strong acid. Adds to alkenes with Markovnikov orientation; with peroxides (ROOR) it adds anti-Markovnikov by a radical chain. Converts alcohols to alkyl bromides.'],
['HI','hydroiodic acid|hydrogen iodide','r','The strongest hydrogen halide acid. Cleaves ethers and converts alcohols to alkyl iodides.'],
['H2SO4','sulfuric acid|sulphuric acid','r','Strong acid. Catalyses Fischer esterification and alkene hydration, dehydrates alcohols to alkenes on heating, and with HNO₃ makes the nitronium ion for nitration.'],
['HNO3','nitric acid','r','With H₂SO₄ it forms the nitronium ion (NO₂⁺), the electrophile in aromatic nitration.'],
['H3PO4','phosphoric acid','r','Non-nucleophilic acid used to dehydrate alcohols to alkenes (E1).'],
['H3O+','hydronium|aqueous acid|acidic workup','r','Aqueous acid. Often written as the last step to protonate alkoxides after a Grignard or hydride reaction, or to hydrolyse esters, amides, nitriles and acetals.'],
['TsOH','p-toluenesulfonic acid|PTSA|pTsOH|p-TsOH|tosic acid','r','Strong organic acid that dissolves in organic solvents. Used as a catalyst for acetal formation, esterification and dehydration.','Cc1ccc(cc1)S(=O)(=O)O'],
['TFA','trifluoroacetic acid','r','Strong, volatile acid used to remove Boc and tert-butyl protecting groups.','OC(=O)C(F)(F)F'],
['AlCl3','aluminium chloride|aluminum chloride','r','Strong Lewis acid; the catalyst for Friedel–Crafts alkylation and acylation.'],
['FeBr3','iron(III) bromide|ferric bromide','r','Lewis acid that polarises Br₂ so it can brominate aromatic rings.'],
['FeCl3','iron(III) chloride|ferric chloride','r','Lewis acid catalyst for aromatic chlorination. Also gives a purple colour with phenols.'],
['BF3','boron trifluoride|BF3·OEt2|BF3·Et2O','r','Lewis acid. BF₃·OEt₂ is a convenient liquid form.'],
['ZnCl2','zinc chloride','r','Lewis acid. With concentrated HCl it is the Lucas reagent, which tells primary, secondary and tertiary alcohols apart.'],
/* halogenation and leaving groups */
['Br2','bromine','r','Adds across alkenes to give anti 1,2-dibromides (through a bromonium ion). With FeBr₃ it brominates aromatic rings; with light it brominates alkanes by a radical chain.'],
['Cl2','chlorine','r','Adds to alkenes like Br₂. With AlCl₃ or FeCl₃ it chlorinates aromatic rings; with light it chlorinates alkanes (much less selectively than Br₂).'],
['I2','iodine','r','With NaOH it gives the iodoform test for methyl ketones.'],
['NBS','N-bromosuccinimide','r','Supplies a low, steady concentration of Br₂ and Br•. With light or AIBN it brominates allylic and benzylic positions; with water it makes bromohydrins.','O=C1CCC(=O)N1Br'],
['AIBN','azobisisobutyronitrile','r','Radical initiator: on heating it loses N₂ to make carbon radicals that start chain reactions.','CC(C)(C#N)N=NC(C)(C)C#N'],
['SOCl2','thionyl chloride','r','Converts alcohols to alkyl chlorides and carboxylic acids to acid chlorides. The by-products, SO₂ and HCl, are gases.'],
['PBr3','phosphorus tribromide','r','Converts primary and secondary alcohols to alkyl bromides with inversion of configuration (SN2).'],
['PCl5','phosphorus pentachloride|PCl3','r','Converts alcohols to alkyl chlorides and acids to acid chlorides.'],
['POCl3','phosphoryl chloride|phosphorus oxychloride','r','With pyridine it dehydrates alcohols to alkenes by E2, avoiding carbocation rearrangements.'],
['TsCl','tosyl chloride|p-toluenesulfonyl chloride','r','Turns an alcohol’s OH into a tosylate (OTs), an excellent leaving group, without changing the configuration at carbon.','Cc1ccc(cc1)S(Cl)(=O)=O'],
['MsCl','mesyl chloride|methanesulfonyl chloride','r','Turns an alcohol into a mesylate (OMs), an excellent leaving group. Used with Et₃N.','CS(Cl)(=O)=O'],
['Tf2O','triflic anhydride|trifluoromethanesulfonic anhydride','r','Makes triflates (OTf), among the best leaving groups known.'],
['NaI','sodium iodide|KI','r','Iodide is an excellent nucleophile. NaI in acetone converts alkyl chlorides and bromides to iodides (Finkelstein reaction).'],
['NaCN','sodium cyanide|KCN|potassium cyanide','r','Source of cyanide (CN⁻), a good nucleophile and weak base. SN2 on alkyl halides gives nitriles; addition to C=O gives cyanohydrins.'],
['NaN3','sodium azide','r','Azide (N₃⁻) is an excellent SN2 nucleophile. Reducing the alkyl azide gives a primary amine.'],
['NaNO2','sodium nitrite','r','With HCl at 0–5 °C it turns aromatic amines (ArNH₂) into diazonium salts (ArN₂⁺).'],
/* carbon nucleophiles and coupling */
['Grignard reagent','Grignard|Grignards|RMgBr|RMgX|RMgCl|organomagnesium','r','Organomagnesium halide (R–MgX), made from R–X and Mg in dry ether. The carbon is strongly nucleophilic and basic: it adds to aldehydes, ketones, esters, epoxides and CO₂, and is destroyed by water or any O–H or N–H.'],
['organolithium','RLi|organolithium reagent','r','R–Li reagents such as MeLi and n-BuLi. Like Grignard reagents but more reactive and more basic.'],
['Gilman reagent','organocuprate|R2CuLi|lithium dialkylcuprate|cuprate','r','Lithium dialkylcuprate (R₂CuLi), a soft carbon nucleophile. Adds 1,4 (conjugate addition) to enones, couples with alkyl halides and turns acid chlorides into ketones.'],
['Wittig reagent','phosphonium ylide|Ph3P=CH2','r','Phosphorus ylide (Ph₃P=CHR) that converts a C=O group into C=CHR.'],
['PPh3','triphenylphosphine','r','Used to make Wittig reagents (from alkyl halides) and as a ligand on palladium catalysts.'],
['Pd(PPh3)4','tetrakis(triphenylphosphine)palladium','r','Palladium(0) catalyst for cross-couplings such as the Suzuki, Heck and Sonogashira reactions.'],
['CH2N2','diazomethane','r','Converts carboxylic acids to methyl esters. Toxic and explosive; TMS-diazomethane is a safer substitute.'],
['DCC','dicyclohexylcarbodiimide|EDC|EDCI','r','Coupling agents that activate carboxylic acids to make amides and esters. DCC forms insoluble dicyclohexylurea as a by-product; EDC’s urea is water-soluble.'],
['Ac2O','acetic anhydride','r','Acetylating agent: turns alcohols into acetate esters and amines into acetamides (often with pyridine or DMAP).','CC(=O)OC(C)=O'],
['AcCl','acetyl chloride|CH3COCl','r','Reactive acetylating agent; also the acyl chloride for Friedel–Crafts acetylation.','CC(Cl)=O'],
['Hg(OAc)2','mercury(II) acetate|mercuric acetate','r','Used in oxymercuration: Markovnikov addition of water (or an alcohol) to an alkene without carbocation rearrangements, followed by NaBH₄.'],
['HgSO4','mercury(II) sulfate','r','Catalyst (with H₂SO₄) for Markovnikov hydration of alkynes, giving ketones through an enol.'],
['NH2OH','hydroxylamine','r','Reacts with aldehydes and ketones to give oximes.'],
['TBAF','tetra-n-butylammonium fluoride|tetrabutylammonium fluoride','r','Fluoride source used to remove silyl protecting groups (TBS, TIPS, TMS), because the Si–F bond is very strong.'],
['TBSCl','TBDMSCl|tert-butyldimethylsilyl chloride','r','Protects alcohols as TBS ethers (usually with imidazole in DMF).'],
['TMSCl','trimethylsilyl chloride|chlorotrimethylsilane','r','Makes TMS ethers and silyl enol ethers.'],
['Boc2O','di-tert-butyl dicarbonate|Boc anhydride','r','Protects amines as Boc carbamates.'],
/* abbreviations */
['Me','methyl','a','Methyl group, CH₃–.'],
['Et','ethyl','a','Ethyl group, CH₃CH₂–.'],
['Pr','n-Pr|propyl','a','Propyl group, CH₃CH₂CH₂–.'],
['iPr','i-Pr|isopropyl','a','Isopropyl group, (CH₃)₂CH–.'],
['Bu','n-Bu|butyl','a','Butyl group, CH₃CH₂CH₂CH₂–.'],
['tBu','t-Bu|tert-butyl','a','tert-Butyl group, (CH₃)₃C–. Very bulky, so it blocks SN2 and locks cyclohexanes with it equatorial.'],
['Ph','phenyl','a','Phenyl group, C₆H₅– (a benzene ring as a substituent).'],
['Bn','benzyl','a','Benzyl group, C₆H₅CH₂–. As a protecting group (OBn) it is removed by H₂ and Pd/C.'],
['Bz','benzoyl','a','Benzoyl group, C₆H₅C(=O)–.'],
['Ac','acetyl','a','Acetyl group, CH₃C(=O)–. OAc is acetate.'],
['Ar','aryl','a','Any aromatic ring used as a substituent.'],
['Ts','tosyl|OTs|tosylate','a','Tosyl, p-toluenesulfonyl (p-CH₃C₆H₄SO₂–). OTs, a tosylate, is an excellent leaving group.'],
['Ms','mesyl|OMs|mesylate','a','Mesyl, methanesulfonyl (CH₃SO₂–). OMs, a mesylate, is an excellent leaving group.'],
['Tf','triflyl|OTf|triflate','a','Triflyl, trifluoromethanesulfonyl (CF₃SO₂–). OTf, a triflate, is one of the best leaving groups.'],
['Boc','tert-butoxycarbonyl|NHBoc','a','tert-Butoxycarbonyl, a protecting group for amines. Removed with acid (TFA or HCl).'],
['Cbz','Z group|benzyloxycarbonyl','a','Benzyloxycarbonyl, a protecting group for amines. Removed by H₂ and Pd/C.'],
['Fmoc','fluorenylmethyloxycarbonyl','a','Amine protecting group removed by base (piperidine); standard in peptide synthesis.'],
['TBS','TBDMS|OTBS|tert-butyldimethylsilyl','a','tert-Butyldimethylsilyl, a protecting group for alcohols. Removed with TBAF or acid.'],
['TMS','trimethylsilyl','a','Trimethylsilyl, (CH₃)₃Si–. Also tetramethylsilane, the 0 ppm reference in NMR.'],
['THP','tetrahydropyranyl','a','Tetrahydropyranyl, an acid-labile protecting group for alcohols (an acetal).'],
['Nu','Nu−|Nu:','a','Any nucleophile.'],
['LG','','a','Leaving group: the atom or group that departs with the bonding pair of electrons.'],
['EWG','electron-withdrawing group','a','Electron-withdrawing group, such as NO₂, CN, C=O or CF₃. Pulls electron density away, stabilising anions and deactivating benzene rings.'],
['EDG','electron-donating group','a','Electron-donating group, such as OH, OR, NH₂ or alkyl. Pushes electron density in, stabilising cations and activating benzene rings.'],
['TS','','a','Transition state: the highest-energy point on a reaction step, often drawn in square brackets with ‡.'],
['rt','r.t.|RT|room temperature','a','Room temperature, about 20–25 °C.'],
['aq','(aq)','a','Aqueous: dissolved in water.'],
['equiv','eq.|equivalents','a','Equivalents: how many moles of a reagent are used per mole of starting material.'],
['hν','hv','a','Light (photochemical conditions), often used to start radical reactions.'],
['ee','enantiomeric excess','a','Enantiomeric excess: % of the major enantiomer minus % of the minor one. A racemate has 0% ee.'],
['NMR','nuclear magnetic resonance','t','Nuclear magnetic resonance spectroscopy. ¹H NMR shows the different hydrogen environments (chemical shift), how many H each has (integration) and their neighbours (splitting).'],
['IR','infrared spectroscopy|IR spectroscopy','t','Infrared spectroscopy: bonds absorb at characteristic wavenumbers, e.g. C=O near 1700 cm⁻¹ and broad O–H near 3300 cm⁻¹.'],
['TLC','thin-layer chromatography','t','Thin-layer chromatography: a quick way to follow a reaction or check purity by how far spots travel up a coated plate.'],
['Rf','Rf value|retardation factor','t','Retention factor in TLC: distance moved by the spot divided by distance moved by the solvent front.'],
['ppm','parts per million','t','Unit of chemical shift (δ) in NMR.'],
['HOMO','highest occupied molecular orbital','c','Highest occupied molecular orbital: the electrons a nucleophile donates come from here.'],
['LUMO','lowest unoccupied molecular orbital','c','Lowest unoccupied molecular orbital: an electrophile accepts electrons into this orbital.'],
['pKa','pKₐ|acid dissociation constant','c','−log Ka. The lower the pKa, the stronger the acid. An acid is deprotonated by the conjugate base of any acid with a higher pKa.'],
['sp3','sp2|sp hybridised|sp3 hybridised|sp2 hybridised','c','Hybridisation labels: sp³ is tetrahedral (109.5°, four groups), sp² is trigonal planar (120°, three groups plus a p orbital), sp is linear (180°, two groups plus two p orbitals).'],
/* concepts */
['nucleophile','nucleophilic','c','An electron-rich species that donates a pair of electrons to form a new bond, usually to carbon. It uses a lone pair, a π bond or a C–metal bond. Examples: HO⁻, CN⁻, NH₃, Grignard reagents.'],
['electrophile','electrophilic','c','An electron-poor species that accepts a pair of electrons. Examples: carbonyl carbons, carbocations, H⁺, Br₂ and alkyl halides.'],
['leaving group','leaving groups','c','The group that departs, taking the bonding electrons with it. Good leaving groups are weak bases: I⁻, Br⁻, Cl⁻, H₂O, tosylate. HO⁻ and RO⁻ are poor leaving groups unless protonated or converted to sulfonates.'],
['carbocation','carbenium ion|carbonium ion','c','A carbon with only six electrons and a positive charge; sp² and planar. Stability: tertiary > secondary > primary > methyl, and allylic or benzylic cations are stabilised by resonance. Intermediates in SN1, E1 and Markovnikov additions, and they can rearrange.'],
['carbanion','carbanions','c','A carbon bearing a negative charge and a lone pair. Strong bases and nucleophiles; stabilised by nearby C=O (enolates), nitriles or sp hybridisation (acetylides).'],
['radical','free radical','c','A species with an unpaired electron, made by homolysis. Stability follows the same order as carbocations: tertiary > secondary > primary, with allylic and benzylic best.'],
['enolate','enolate ion','c','The anion made by removing an α-hydrogen next to a C=O. The charge is shared between the α-carbon and oxygen; it usually reacts through carbon. Key nucleophile in aldol, Claisen and alkylation reactions.'],
['enol','enols','c','The C=C–OH tautomer of a carbonyl compound. Present in small amounts in equilibrium with the keto form; reacts with electrophiles at the α-carbon.'],
['tautomerism','tautomer|keto–enol tautomerism|keto-enol tautomerism|tautomerisation|tautomerization','c','Interconversion of isomers by moving a proton and a double bond, e.g. keto ⇌ enol. Tautomers are different compounds, not resonance forms.'],
['resonance','resonance structure|resonance structures|resonance form|contributing structure','c','When one Lewis structure isn’t enough, the real molecule is a hybrid of several resonance structures that differ only in where electrons are. Atoms don’t move. Spreading charge out (delocalisation) stabilises a species.'],
['conjugation','conjugated','c','Alternating single and multiple bonds (or a π bond next to a lone pair or empty p orbital) let p orbitals overlap and electrons spread out, which lowers the energy.'],
['aromaticity','aromatic compound','c','Extra stability of cyclic, planar, fully conjugated rings with 4n+2 π electrons (Hückel’s rule), e.g. benzene with 6. Aromatic rings prefer substitution to addition.'],
['Hückel\'s rule','Huckel\'s rule|Hückel rule|4n+2 rule','c','A planar, cyclic, fully conjugated ring is aromatic if it has 4n+2 π electrons (2, 6, 10…), and antiaromatic if it has 4n (4, 8…).'],
['antiaromatic','antiaromaticity','c','Planar, cyclic, fully conjugated with 4n π electrons; especially unstable (e.g. cyclobutadiene). Molecules twist out of planarity to avoid it.'],
['hybridisation','hybridization|hybrid orbital','c','Mixing atomic orbitals to make hybrid orbitals that point towards the bonded atoms. Count σ bonds plus lone pairs: 4 → sp³, 3 → sp², 2 → sp.'],
['sigma bond','σ bond|σ-bond|sigma bonds','c','A bond formed by head-on overlap of orbitals along the line joining the nuclei. Every single bond is a σ bond; free rotation is possible.'],
['pi bond','π bond|π-bond|pi bonds','c','A bond formed by side-on overlap of parallel p orbitals, above and below the σ bond. A double bond is σ + π; a triple bond is σ + 2π. π bonds prevent rotation and are more reactive than σ bonds.'],
['inductive effect','induction','c','Polarisation transmitted through σ bonds by electronegative atoms or alkyl groups. It weakens quickly with distance.'],
['mesomeric effect','resonance effect|M effect','c','Donation or withdrawal of electrons through π systems (resonance). Usually stronger than the inductive effect when the two compete, as with OH and OMe on benzene.'],
['hyperconjugation','hyperconjugative','c','Stabilisation from overlap of a filled C–H or C–C σ bond with a neighbouring empty p orbital or π*. Explains why more substituted carbocations and alkenes are more stable.'],
['steric hindrance','sterics|steric bulk','c','Crowding by large groups that slows or blocks a reaction. It is why SN2 fails at tertiary carbons and why bulky bases favour Hofmann elimination.'],
['chirality','chiral','c','A molecule is chiral if it can’t be superimposed on its mirror image. Usually caused by a carbon with four different groups.'],
['stereocentre','stereocenter|chiral centre|chiral center|stereogenic centre|stereogenic center|asymmetric carbon','c','An atom (usually carbon with four different groups) where swapping two groups gives a stereoisomer. Labelled R or S.'],
['enantiomer','enantiomers','c','Stereoisomers that are non-superimposable mirror images. They have identical physical properties except the direction in which they rotate plane-polarised light (and how they interact with other chiral things).'],
['diastereomer','diastereoisomer|diastereomers|diastereoisomers','c','Stereoisomers that are not mirror images, e.g. cis/trans isomers or compounds differing at some but not all stereocentres. They have different physical properties.'],
['meso compound','meso','c','A compound with stereocentres that is achiral because it has an internal mirror plane, e.g. (2R,3S)-butane-2,3-diol.'],
['racemic mixture','racemate|racemic','c','A 50:50 mixture of two enantiomers; optically inactive. SN1 reactions at a stereocentre give (nearly) racemic products.'],
['optical activity','optically active|specific rotation','c','Rotation of plane-polarised light by a chiral substance. Enantiomers rotate light by equal amounts in opposite directions.'],
['epimer','epimers','c','Diastereomers that differ at only one of several stereocentres.'],
['anomer','anomers|anomeric carbon','c','In cyclic sugars, the two diastereomers (α and β) that differ at the new stereocentre formed when the ring closes (the anomeric carbon).'],
['conformation','conformer|conformers|conformations','c','Different 3D shapes of the same molecule that interconvert by rotation about single bonds, such as staggered and eclipsed ethane or chair cyclohexane.'],
['Newman projection','Newman projections','c','A view straight down a C–C bond: the front carbon is a point, the back carbon a circle. Used to compare staggered, eclipsed, gauche and anti conformations.'],
['chair conformation','chair|ring flip|ring-flip','c','The strain-free shape of cyclohexane. Each carbon has one axial and one equatorial position; a ring flip swaps them. Big groups prefer equatorial.'],
['axial','axial position','c','In a chair cyclohexane, a bond parallel to the ring’s axis (straight up or down). Axial groups suffer 1,3-diaxial strain.'],
['equatorial','equatorial position','c','In a chair cyclohexane, a bond pointing out around the ring’s “equator”. Bulky groups prefer equatorial positions.'],
['E/Z','E/Z isomerism|cis–trans isomerism|cis/trans isomerism|geometric isomers|geometric isomerism','c','Stereoisomerism about a double bond. Using CIP priorities, Z means the higher-priority groups are on the same side, E on opposite sides.'],
['CIP rules','Cahn–Ingold–Prelog|Cahn-Ingold-Prelog|CIP priority|priority rules','c','Rules for ranking groups: higher atomic number at the first point of difference wins; multiple bonds count as duplicated atoms. Used to assign R/S and E/Z.'],
['Markovnikov\'s rule','Markovnikov|Markovnikov addition|Markovnikov product|Markovnikov\'s','c','When HX (or H₂O with acid) adds to an alkene, H goes to the carbon that already has more H, so X ends up on the more substituted carbon. The reason: that path goes through the more stable carbocation.'],
['anti-Markovnikov','anti-Markovnikov addition|anti-Markovnikov product','c','Addition with the H (or the smaller group) on the more substituted carbon. Seen in hydroboration–oxidation and HBr with peroxides.'],
['Zaitsev\'s rule','Zaitsev|Saytzeff|Zaitsev product|Saytzeff\'s rule','c','In eliminations, the more substituted (more stable) alkene is usually the major product.'],
['Hofmann product','Hofmann rule|Hofmann alkene','c','The less substituted alkene. It becomes the major product of E2 with bulky bases (t-BuOK, LDA) or with bulky leaving groups such as NR₃⁺.'],
['regioselectivity','regioselective','c','Preference for bond formation at one position over another, e.g. Markovnikov vs anti-Markovnikov, or Zaitsev vs Hofmann.'],
['stereoselectivity','stereoselective','c','Preference for forming one stereoisomer over others when more than one is possible.'],
['stereospecific','stereospecificity','c','A reaction where the stereochemistry of the starting material decides the stereochemistry of the product, e.g. SN2 inversion, anti addition of Br₂, syn epoxidation.'],
['chemoselectivity','chemoselective','c','Reacting with one functional group in the presence of others, e.g. NaBH₄ reducing a ketone but not an ester.'],
['kinetic control','kinetic product','c','Conditions (low temperature, short time, irreversible steps) under which the product that forms fastest dominates, even if it isn’t the most stable.'],
['thermodynamic control','thermodynamic product','c','Conditions (higher temperature, longer time, reversible steps) under which the most stable product dominates.'],
['transition state','transition states','c','The highest-energy arrangement along a reaction step, with bonds partly made and broken. It can’t be isolated; drawn in brackets with ‡.'],
['reactive intermediate','reaction intermediate','c','A short-lived species formed between steps, sitting in an energy well (e.g. carbocations, carbanions, radicals, tetrahedral intermediates). Unlike a transition state it can sometimes be detected.'],
['activation energy','Ea|energy barrier','c','The energy needed to reach the transition state from the starting materials. A lower barrier means a faster reaction; catalysts lower it.'],
['rate-determining step','rate-limiting step|RDS|slow step','c','The step with the highest transition state energy, which controls the overall rate. In SN1 it is ionisation to the carbocation.'],
['Hammond postulate','Hammond\'s postulate','c','A transition state resembles the species (reactant or product) closest to it in energy. So endothermic steps have late, product-like transition states.'],
['polar protic','protic solvent|polar protic solvent','c','Solvents with O–H or N–H bonds (water, alcohols, acetic acid). They hydrogen-bond to anions, which slows SN2 but stabilises the ions in SN1/E1.'],
['polar aprotic','aprotic solvent|polar aprotic solvent|dipolar aprotic','c','Polar solvents without O–H or N–H (DMSO, DMF, acetone, MeCN). They solvate cations but not anions, so nucleophiles are more reactive: they favour SN2.'],
['Lewis acid','Lewis acids','c','An electron-pair acceptor, such as AlCl₃, BF₃, FeBr₃ or H⁺.'],
['Lewis base','Lewis bases','c','An electron-pair donor, such as NH₃, H₂O or an alkoxide.'],
['Brønsted acid','Bronsted acid|Brønsted–Lowry acid|Bronsted-Lowry acid|proton donor','c','A proton (H⁺) donor.'],
['conjugate base','conjugate bases','c','What is left after an acid loses H⁺. The stronger the acid, the weaker (more stable) its conjugate base.'],
['conjugate acid','conjugate acids','c','What forms when a base gains H⁺.'],
['nucleophilicity','nucleophilic strength','c','How fast a species attacks an electrophile. Increases with negative charge and polarisability; decreases with steric bulk. In protic solvents I⁻ > Br⁻ > Cl⁻ > F⁻.'],
['Walden inversion','inversion of configuration|backside attack|back-side attack','c','The umbrella-like flip of configuration at carbon in an SN2 reaction, caused by the nucleophile attacking from the side opposite the leaving group.'],
['racemisation','racemization','c','Conversion of a single enantiomer into a racemic mixture, e.g. through a planar carbocation (SN1) or an enol.'],
['antiperiplanar','anti-periplanar|anti periplanar','c','H–C–C–LG arranged with H and the leaving group at 180° in the same plane. E2 needs this geometry; in cyclohexanes both must be axial.'],
['syn addition','','c','Both new groups add to the same face of a double bond (e.g. hydrogenation, hydroboration, OsO₄ dihydroxylation, epoxidation).'],
['anti addition','','c','The two new groups add to opposite faces of a double bond (e.g. Br₂ via a bromonium ion, halohydrin formation).'],
['tetrahedral intermediate','tetrahedral intermediates','c','The sp³ intermediate formed when a nucleophile adds to a C=O carbon. In acyl substitution it collapses, expelling a leaving group.'],
['carbonyl','carbonyl group','c','The C=O group. The carbon is electrophilic (δ+) and the oxygen is nucleophilic and basic (δ−). Found in aldehydes, ketones, acids and their derivatives.'],
['hemiacetal','hemiacetals|hemiketal','c','A carbon bearing both an OH and an OR, made by adding one alcohol to an aldehyde or ketone. Usually unstable unless it is in a ring (as in sugars).'],
['acetal','acetals|ketal','c','A carbon bearing two OR groups, made from an aldehyde or ketone and two alcohols (or a diol) with acid and water removal. Stable to base, so acetals protect C=O; aqueous acid removes them.'],
['hemiaminal','carbinolamine','c','Intermediate with OH and NR₂ on the same carbon, formed when an amine adds to C=O on the way to an imine or enamine.'],
['imine','imines|Schiff base','c','C=N compound made from an aldehyde or ketone and a primary amine with loss of water (best near pH 5). Hydrolysed back by aqueous acid.'],
['enamine','enamines','c','C=C–NR₂ compound made from an aldehyde or ketone and a secondary amine. A neutral enolate equivalent: it reacts with electrophiles at the α-carbon (Stork enamine reaction).'],
['iminium ion','iminium','c','C=N⁺ ion; a stronger electrophile than C=O. Intermediate in imine and enamine formation, reductive amination and the Mannich reaction.'],
['oxime','oximes','c','C=N–OH compound from an aldehyde or ketone and hydroxylamine.'],
['hydrazone','hydrazones','c','C=N–NH₂ compound from an aldehyde or ketone and hydrazine; the intermediate in the Wolff–Kishner reduction.'],
['cyanohydrin','cyanohydrins','c','A carbon bearing OH and CN, made by adding HCN (or CN⁻ then acid) to an aldehyde or ketone.'],
['hydrate','gem-diol|geminal diol','c','Two OH groups on one carbon, made by adding water to a C=O. Usually only significant for formaldehyde and aldehydes with electron-withdrawing groups.'],
['protecting group','protecting groups|protection|deprotection','c','A group temporarily attached to hide a reactive functional group, then removed later. E.g. TBS for alcohols, acetals for ketones, Boc for amines.'],
['acylium ion','acylium','c','R–C≡O⁺, the electrophile in Friedel–Crafts acylation. Stabilised by resonance, so it does not rearrange.'],
['arenium ion','sigma complex|σ-complex|Wheland intermediate','c','The carbocation formed when an electrophile adds to a benzene ring; it loses H⁺ to restore aromaticity.'],
['ortho/para director','ortho, para-director|ortho/para-director|o/p director','c','A substituent that makes electrophiles attack the positions next to it (ortho) and opposite it (para). All activating groups and the halogens are o/p directors.'],
['meta director','meta-director|meta directing','c','A substituent that directs electrophiles to the meta position: NO₂, CN, C=O groups, SO₃H, CF₃ and NR₃⁺. All are deactivating.'],
['activating group','activating groups|activator','c','A substituent that makes a benzene ring react faster than benzene in electrophilic substitution, by donating electrons (OH, OR, NH₂, alkyl).'],
['deactivating group','deactivating groups|deactivator','c','A substituent that makes a benzene ring react more slowly than benzene, by withdrawing electrons (NO₂, CN, C=O, halogens).'],
['electrophilic aromatic substitution','EAS|SEAr','x','Replacement of an H on an aromatic ring by an electrophile: the ring attacks E⁺ to form an arenium ion, which loses H⁺. Includes nitration, halogenation, sulfonation and Friedel–Crafts reactions.'],
['SNAr','nucleophilic aromatic substitution','x','Substitution on an aromatic ring by a nucleophile, through an anionic Meisenheimer complex. Needs a leaving group with strong EWGs (e.g. NO₂) ortho or para to it.'],
['benzyne','aryne','c','A highly reactive benzene with a strained “triple bond”, formed by elimination from an aryl halide with a very strong base such as NaNH₂.'],
['carbene','carbenes','c','A neutral carbon with two bonds and two non-bonding electrons, e.g. :CH₂ or :CCl₂. Adds to alkenes to make cyclopropanes.'],
['ylide','ylid|ylides','c','A neutral molecule with + and − charges on adjacent atoms, e.g. the phosphorus ylide Ph₃P⁺–CH₂⁻ used in the Wittig reaction.'],
['oxonium ion','oxonium','c','An oxygen with three bonds and a positive charge, e.g. a protonated alcohol (ROH₂⁺), which can lose water as a good leaving group.'],
['halonium ion','bromonium ion|chloronium ion|iodonium ion','c','A three-membered ring with a positively charged halogen, formed when X₂ adds to an alkene. Opening it from the back gives anti addition.'],
['epoxide','epoxides|oxirane','c','A strained three-membered cyclic ether. Ring-opened by nucleophiles: under basic conditions at the less substituted carbon; under acidic conditions at the more substituted carbon.'],
['Bürgi–Dunitz angle','Burgi-Dunitz angle|Bürgi-Dunitz angle|Bürgi–Dunitz trajectory','c','Nucleophiles approach a C=O carbon at about 107° to the C=O bond, so they overlap best with the π* orbital.'],
['α-carbon','alpha carbon|α carbon|alpha-carbon','c','The carbon next to a functional group, usually next to C=O. Its hydrogens (α-hydrogens) are acidic (pKa ≈ 20 for ketones).'],
['α-hydrogen','alpha hydrogen|α hydrogen|alpha-hydrogen|α-H','c','A hydrogen on the α-carbon. Removing it gives an enolate.'],
['β-hydrogen','beta hydrogen|β hydrogen|beta-hydrogen|β-H','c','A hydrogen on the carbon next to the carbon bearing the leaving group. Elimination (E1/E2) removes a β-hydrogen to form the C=C.'],
['chemical shift','δ value','t','The position of an NMR signal (δ, in ppm). Electronegative atoms and π systems nearby move signals downfield (higher δ).'],
['n+1 rule','n + 1 rule','t','In ¹H NMR, a signal is split into n+1 peaks by n equivalent neighbouring hydrogens (doublet, triplet, quartet…).'],
['coupling constant','J value','t','The spacing between lines of a split NMR signal (J, in Hz). Coupled hydrogens share the same J.'],
['deshielding','deshielded','t','Electron withdrawal near a nucleus reduces its shielding, moving its NMR signal downfield (larger δ).'],
['Michael acceptor','Michael acceptors','c','An α,β-unsaturated carbonyl (or nitrile, nitro) compound that accepts nucleophiles at the β-carbon.'],
['enone','enones|α,β-unsaturated carbonyl|alpha,beta-unsaturated','c','A C=C conjugated with a C=O. Electrophilic at the carbonyl carbon (1,2-addition) and the β-carbon (1,4-addition).'],
['dienophile','dienophiles','c','The alkene (2π) partner in a Diels–Alder reaction; electron-withdrawing groups make it react faster.'],
['diene','dienes|conjugated diene','c','A molecule with two C=C bonds. In a Diels–Alder reaction it must be conjugated and able to adopt the s-cis conformation.'],
['endo rule','endo product|endo selectivity','c','In Diels–Alder reactions, the substituent on the dienophile usually ends up endo (tucked under the new ring), because of secondary orbital overlap.'],
['pericyclic reaction','pericyclic','c','A reaction that happens in one step through a cyclic transition state, with no intermediates, e.g. Diels–Alder.'],
['homolysis','homolytic cleavage|homolytic fission','c','Breaking a bond so that each atom keeps one electron, forming two radicals. Shown with fishhook arrows.'],
['heterolysis','heterolytic cleavage|heterolytic fission','c','Breaking a bond so that one atom takes both electrons, forming a cation and an anion.'],
['curly arrow','curved arrow|curly arrows|curved arrows','c','Shows the movement of an electron pair, from a lone pair or bond (the tail) to an atom or bond (the head).'],
['fishhook arrow','half-headed arrow|fishhook arrows','c','A single-barbed curly arrow showing one electron moving, used for radical reactions.'],
['formal charge','formal charges','c','Charge assigned to an atom: valence electrons − lone-pair electrons − number of bonds.'],
['lone pair','lone pairs|non-bonding pair','c','A pair of valence electrons not used in bonding. Lone pairs make atoms nucleophilic and basic.'],
['electronegativity','electronegative','c','How strongly an atom attracts bonding electrons (Pauling scale: F 4.0, O 3.5, N 3.0, C 2.5, H 2.1).'],
['hydrogen bonding','hydrogen bond|H-bond|H-bonding','c','Attraction between an H on O, N or F and a lone pair on another O, N or F. Raises boiling points and helps water dissolve polar molecules.'],
['zwitterion','zwitterions','c','A neutral molecule containing both a + and a − charge, e.g. amino acids at neutral pH (H₃N⁺–CHR–COO⁻).'],
['solvolysis','solvolysis reaction','c','A substitution or elimination where the solvent (water or an alcohol) is the nucleophile or base, typically SN1/E1 at tertiary carbons.'],
['carbocation rearrangement','hydride shift|1,2-hydride shift|methyl shift|1,2-methyl shift|alkyl shift|1,2-shift','c','A carbocation can become more stable by moving an H (with its electrons) or an alkyl group from a neighbouring carbon, e.g. secondary → tertiary. Watch for it in SN1, E1, HX addition and acid hydration.'],
/* named reactions and mechanism types */
['SN2','SN2 reaction|bimolecular nucleophilic substitution','x','One-step substitution: the nucleophile attacks from the back as the leaving group leaves, inverting the configuration. Rate = k[R–X][Nu]. Fastest for methyl and primary carbons; favoured by strong nucleophiles and polar aprotic solvents.'],
['SN1','SN1 reaction|unimolecular nucleophilic substitution','x','Two-step substitution: the leaving group leaves to form a carbocation, then the nucleophile adds. Rate = k[R–X]. Favoured for tertiary, allylic and benzylic carbons, weak nucleophiles and polar protic solvents. Gives racemisation and possible rearrangements.'],
['E2','E2 reaction|bimolecular elimination','x','One-step elimination: a base removes a β-H as the leaving group leaves, forming C=C. Needs an antiperiplanar H and leaving group. Favoured by strong bases and heat; gives the Zaitsev alkene unless the base is bulky.'],
['E1','E1 reaction|unimolecular elimination','x','Two-step elimination through a carbocation, which then loses a β-H. Competes with SN1 for tertiary substrates with weak bases; heat favours E1. Gives the Zaitsev alkene.'],
['E1cB','E1cb|E1cB elimination','x','Elimination through a carbanion (conjugate base): deprotonation first, then loss of the leaving group. Typical when the H is acidic (next to C=O) and the leaving group is poor, as in aldol condensation.'],
['aldol reaction','aldol addition|aldol','x','An enolate (or enol) adds to the C=O of another aldehyde or ketone, giving a β-hydroxy carbonyl compound.'],
['aldol condensation','aldol condensations','x','An aldol reaction followed by loss of water (usually with heat) to give an α,β-unsaturated carbonyl (enone).'],
['Claisen condensation','Claisen','x','An ester enolate attacks another ester, expelling an alkoxide, to give a β-keto ester. Needs a full equivalent of base (e.g. NaOEt).'],
['Dieckmann condensation','Dieckmann','x','An intramolecular Claisen condensation of a diester, forming a 5- or 6-membered cyclic β-keto ester.'],
['Michael addition','Michael reaction|conjugate addition|1,4-addition','x','A nucleophile (often a stabilised enolate or a cuprate) adds to the β-carbon of an α,β-unsaturated carbonyl.'],
['Robinson annulation','Robinson ring formation','x','A Michael addition followed by an intramolecular aldol condensation, building a new six-membered ring with an enone.'],
['Diels–Alder reaction','Diels-Alder|Diels–Alder|Diels Alder|[4+2] cycloaddition','x','A conjugated diene and a dienophile combine in one step to make a cyclohexene, forming two new σ bonds. Stereospecific (suprafacial) and usually endo-selective.'],
['Wittig reaction','Wittig','x','A phosphorus ylide (Ph₃P=CHR) reacts with an aldehyde or ketone to give an alkene and Ph₃P=O, placing the C=C exactly where the C=O was.'],
['Horner–Wadsworth–Emmons','Horner-Wadsworth-Emmons|HWE reaction|HWE','x','A Wittig-type reaction using a phosphonate-stabilised carbanion; usually gives E-alkenes.'],
['Grignard reaction','Grignard addition','x','Addition of a Grignard reagent to a carbonyl (or epoxide, or CO₂) followed by acid workup, forming a new C–C bond and an alcohol (or acid).'],
['Friedel–Crafts alkylation','Friedel-Crafts alkylation|Friedel Crafts alkylation','x','Alkylation of an aromatic ring with an alkyl halide and AlCl₃. Problems: carbocations rearrange, the product reacts again (polyalkylation), and it fails on deactivated rings.'],
['Friedel–Crafts acylation','Friedel-Crafts acylation|Friedel Crafts acylation','x','Acylation of an aromatic ring with an acid chloride (or anhydride) and AlCl₃, giving an aryl ketone. No rearrangement and no over-reaction.'],
['Williamson ether synthesis','Williamson synthesis|Williamson ether','x','SN2 reaction of an alkoxide (RO⁻) with a methyl or primary alkyl halide to make an ether. With secondary or tertiary halides, E2 wins.'],
['Fischer esterification','Fischer–Speier esterification|Fischer esterification reaction','x','A carboxylic acid and an alcohol, with an acid catalyst, give an ester and water. Reversible; driven by excess alcohol or removing water.'],
['saponification','base hydrolysis of an ester|ester hydrolysis','x','Hydrolysis of an ester with NaOH or KOH to give a carboxylate salt and an alcohol. Irreversible, because the carboxylate is deprotonated.'],
['transesterification','trans-esterification','x','Swapping the alkoxy group of an ester by reaction with a different alcohol (with acid or base catalysis).'],
['Gabriel synthesis','Gabriel amine synthesis','x','Makes primary amines without over-alkylation: potassium phthalimide does SN2 on an alkyl halide, then hydrazine releases the amine.'],
['reductive amination','reductive aminations','x','An aldehyde or ketone and an amine form an imine or iminium ion, which is reduced (NaBH₃CN or NaBH(OAc)₃) to an amine.'],
['hydroboration–oxidation','hydroboration|hydroboration-oxidation|hydroboration oxidation','x','BH₃ then H₂O₂/NaOH adds H and OH across an alkene: syn, anti-Markovnikov (OH on the less substituted carbon), no rearrangement.'],
['ozonolysis','ozonolyses','x','O₃ cleaves C=C into two C=O groups. Me₂S or Zn workup gives aldehydes/ketones; H₂O₂ workup gives acids/ketones.'],
['epoxidation','epoxidations','x','Turning an alkene into an epoxide, usually with mCPBA. Syn and stereospecific: cis alkenes give cis epoxides.'],
['dihydroxylation','syn-dihydroxylation|anti-dihydroxylation','x','Adding two OH groups across a C=C. OsO₄ or cold KMnO₄ gives syn diols; epoxidation then acid hydrolysis gives anti diols.'],
['hydrogenation','catalytic hydrogenation','x','Adding H₂ across C=C or C≡C with a metal catalyst (Pd/C, Pt, Ni). Syn addition; Lindlar’s catalyst stops alkynes at cis alkenes.'],
['halohydrin','halohydrin formation|bromohydrin|chlorohydrin','x','X₂ in water adds X and OH across an alkene, anti, with OH on the more substituted carbon.'],
['oxymercuration','oxymercuration–demercuration|oxymercuration-demercuration','x','Hg(OAc)₂ and water, then NaBH₄: Markovnikov addition of water to an alkene without carbocation rearrangement.'],
['Baeyer–Villiger oxidation','Baeyer-Villiger|Baeyer–Villiger','x','A peroxyacid (mCPBA) inserts an O next to a ketone’s C=O, giving an ester. The group that migrates best: tertiary alkyl > secondary alkyl ≈ phenyl > primary > methyl.'],
['Cannizzaro reaction','Cannizzaro','x','Aldehydes without α-H, in concentrated NaOH, disproportionate: one molecule is reduced to an alcohol, another oxidised to a carboxylate.'],
['Clemmensen reduction','Clemmensen','x','Zn(Hg) and HCl reduce an aldehyde or ketone C=O to CH₂ (acidic conditions).'],
['Wolff–Kishner reduction','Wolff-Kishner|Wolff–Kishner|Wolff Kishner','x','Hydrazine with KOH and heat reduces an aldehyde or ketone C=O to CH₂ (basic conditions), via a hydrazone and loss of N₂.'],
['Birch reduction','Birch','x','Na or Li in liquid NH₃ with an alcohol reduces benzene rings to 1,4-cyclohexadienes.'],
['Swern oxidation','Swern','x','DMSO and oxalyl chloride, then Et₃N, at −78 °C: primary alcohols → aldehydes and secondary → ketones. By-products include smelly Me₂S.'],
['Hell–Volhard–Zelinsky','Hell-Volhard-Zelinsky|HVZ|HVZ reaction','x','Br₂ and PBr₃ brominate a carboxylic acid at the α-carbon.'],
['haloform reaction','iodoform test|iodoform reaction','x','A methyl ketone with X₂ and NaOH is converted to a carboxylate and CHX₃. With I₂, yellow iodoform (CHI₃) precipitates: a test for CH₃C=O and CH₃CH(OH) groups.'],
['Mannich reaction','Mannich','x','An enol, formaldehyde and an amine combine to form a β-amino carbonyl compound, via an iminium ion.'],
['Suzuki coupling','Suzuki reaction|Suzuki–Miyaura|Suzuki-Miyaura','x','Palladium-catalysed coupling of an organoboron compound with an aryl or vinyl halide, forming a new C–C bond. Needs a base.'],
['Heck reaction','Heck coupling','x','Palladium-catalysed coupling of an aryl or vinyl halide with an alkene.'],
['Sonogashira coupling','Sonogashira','x','Palladium/copper-catalysed coupling of a terminal alkyne with an aryl or vinyl halide.'],
['Hofmann elimination','Hofmann degradation','x','Exhaustive methylation of an amine (MeI) then heating with Ag₂O gives the less substituted alkene by E2.'],
['Beckmann rearrangement','Beckmann','x','Acid converts an oxime into an amide; the group anti to the OH migrates to nitrogen.'],
['pinacol rearrangement','pinacol','x','Acid converts a 1,2-diol into a ketone by a carbocation 1,2-shift.'],
['Sandmeyer reaction','Sandmeyer','x','An aryl diazonium salt with CuCl, CuBr or CuCN gives ArCl, ArBr or ArCN.'],
['diazotisation','diazotization|diazonium salt|diazonium','x','An aromatic amine with NaNO₂ and HCl at 0–5 °C gives a diazonium salt (ArN₂⁺), whose N₂ is an excellent leaving group.'],
['nitration','nitrations','x','Electrophilic aromatic substitution with NO₂⁺ (from HNO₃ and H₂SO₄), giving a nitroarene.'],
['sulfonation','sulphonation','x','Electrophilic aromatic substitution with SO₃ in H₂SO₄ (fuming sulfuric acid), giving ArSO₃H. Reversible.'],
['Finkelstein reaction','Finkelstein','x','NaI in acetone converts an alkyl chloride or bromide to the iodide by SN2; NaCl or NaBr precipitates and drives it forward.'],
['Strecker synthesis','Strecker','x','An aldehyde, ammonia and cyanide give an α-aminonitrile, which hydrolyses to an amino acid.'],
['Stork enamine reaction','Stork enamine|Stork enamine alkylation','x','An enamine is alkylated or acylated at the α-carbon, then hydrolysed back to the ketone.'],
['radical halogenation','free-radical halogenation|radical chlorination|radical bromination','x','X₂ and light substitute an alkane C–H with C–X by a chain: initiation, propagation, termination. Bromination is very selective for the most substituted C–H.'],
['acid chloride','acid chlorides|acyl chloride|acyl chlorides','c','RCOCl, the most reactive carboxylic acid derivative. Reacts with water, alcohols and amines to give acids, esters and amides.'],
['acid anhydride','anhydride|anhydrides','c','(RCO)₂O. Reactive acylating agent, a little less reactive than an acid chloride.'],
['nitrile','nitriles|cyano group','c','R–C≡N. Hydrolysed to carboxylic acids, reduced to amines (LiAlH₄) or aldehydes (DIBAL-H); attacked by Grignard reagents to give ketones.'],
];

/* ---------- glossary: highlight terms in notes, hover cards, glossary browser ---------- */
const GL={mode:'all',user:[],userAt:0,E:[],byId:new Map(),rx:[],map:new Map(),pop:null,hot:null,showT:0,hideT:0,raf:0,px:0,py:0,cat:'all',q:'',edit:null,dirty:new Set(),scanT:0};
try{const v=localStorage.getItem('bondline.glossMode');if(['all','first','off'].includes(v))GL.mode=v}catch(e){}
const GL_KEY=()=>'bondline.gloss'+(uidHint?':'+uidHint:'');
function glLoadLocal(){try{const o=JSON.parse(localStorage.getItem(GL_KEY())||'null');if(o&&Array.isArray(o.terms)){GL.user=glCleanUser(o.terms);GL.userAt=+o.at||0}}catch(e){}}
function glCleanUser(list){return(Array.isArray(list)?list:[]).slice(0,500).filter(x=>x&&x.t).map(x=>({id:String(x.id||uid()).replace(/[^a-z0-9]/gi,'').slice(0,24)||uid(),t:String(x.t).trim().slice(0,80),a:(Array.isArray(x.a)?x.a:[]).map(s=>String(s).trim().slice(0,80)).filter(Boolean).slice(0,10),d:String(x.d||'').trim().slice(0,1200)}))}
function glSaveUser(){GL.userAt=Date.now();try{localStorage.setItem(GL_KEY(),JSON.stringify({at:GL.userAt,terms:GL.user}))}catch(e){}
  if(Store.mode==='cloud'&&Store.col)Store.col.doc('_gloss').set(JSON.parse(JSON.stringify({v:1,at:GL.userAt,terms:GL.user}))).catch(()=>toast('Couldn\'t sync your glossary terms. They are saved on this device.'))}
async function glCloudLoad(){if(Store.mode!=='cloud'||!Store.col)return;try{const d=await Store.col.doc('_gloss').get();const r=d.exists?d.data():null;
  if(r&&(+r.at||0)>GL.userAt){GL.user=glCleanUser(r.terms);GL.userAt=+r.at;try{localStorage.setItem(GL_KEY(),JSON.stringify({at:GL.userAt,terms:GL.user}))}catch(e){}glBuild();glRefreshAll();if(!$('#glScrim').hidden)glRender()}
  else if(GL.user.length&&(!r||(+r.at||0)<GL.userAt))glSaveUser()}catch(e){}}
/* text normalisation keeps the length the same so offsets still line up */
const GL_NORM={'₀':'0','₁':'1','₂':'2','₃':'3','₄':'4','₅':'5','₆':'6','₇':'7','₈':'8','₉':'9','⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁺':'+','⁻':'-','−':'-','‐':'-','‑':'-','‒':'-','–':'-','—':'-','’':"'",'‘':"'",' ':' ','·':'·'};
const glNorm=s=>s.replace(/[₀-₉⁰¹²³⁴-⁹⁺⁻−‐‑‒–—’‘ ]/g,c=>GL_NORM[c]||c);
function glIsCS(n){return /\d/.test(n)||/[A-Z]/.test(n.slice(1))||(n.length<=4&&/[A-Z]/.test(n))}
const glEsc=s=>s.replace(/[.*+?^${}()|[\]\\\/]/g,'\\$&');
function glEntries(){const out=[];
  GLOSS_DATA.forEach((r,i)=>out.push({id:'b'+i,t:r[0],a:r[1]?r[1].split('|'):[],c:r[2],d:r[3],s:r[4]||''}));
  for(const u of GL.user)out.push({id:'u'+u.id,t:u.t,a:u.a,c:'u',d:u.d,s:''});
  return out}
function glBuild(){
  GL.E=glEntries();GL.byId=new Map(GL.E.map(e=>[e.id,e]));
  const cs=new Map(),ci=new Map();
  /* user terms first so they win over built-in ones with the same name */
  const order=[...GL.E.filter(e=>e.c==='u'),...GL.E.filter(e=>e.c!=='u')];
  for(const e of order)for(const raw of[e.t,...e.a]){const n=glNorm(String(raw||'').trim());if(n.length<2)continue;
    if(glIsCS(n)){if(!cs.has(n))cs.set(n,e)}else{const k=n.toLowerCase();if(!ci.has(k))ci.set(k,e)}}
  const pat=keys=>[...keys].sort((a,b)=>b.length-a.length).map(k=>glEsc(k).replace(/\s+/g,'\\s+')).join('|');
  GL.cs=cs;GL.ci=ci;GL.rx=[];
  try{if(cs.size)GL.rx.push({re:new RegExp(`(?<![\\p{L}\\p{N}])(?:${pat(cs.keys())})(?![\\p{L}\\p{N}])`,'gu'),cs:true});
    if(ci.size)GL.rx.push({re:new RegExp(`(?<![\\p{L}\\p{N}])(?:${pat(ci.keys())})(?:e?s)?(?![\\p{L}\\p{N}])`,'giu'),cs:false})}catch(err){console.warn('glossary pattern',err);GL.rx=[]}
}
function glLookup(m,cs){const t=m.replace(/\s+/g,' ');if(cs)return GL.cs.get(t);const k=t.toLowerCase();return GL.ci.get(k)||(k.endsWith('es')&&GL.ci.get(k.slice(0,-2)))||(k.endsWith('s')&&GL.ci.get(k.slice(0,-1)))||null}
const GL_SKIP='span[data-tex],code,pre,svg,mjx-container,.gl-skip,input,textarea,button';
const GL_BLOCK='p,div,li,h1,h2,h3,h4,h5,h6,blockquote,td,th,figcaption,dt,dd,section,article';
function glScanText(root){
  const starts=[],nodes=[];let txt='',last=null;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentElement;if(!p||!n.data)return NodeFilter.FILTER_REJECT;const s=p.closest(GL_SKIP);return s&&root.contains(s)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}});
  for(let n=w.nextNode();n;n=w.nextNode()){const b=n.parentElement.closest(GL_BLOCK);if(b!==last){txt+='\n';last=b}starts.push(txt.length);nodes.push(n);txt+=n.data}
  return{txt:glNorm(txt),starts,nodes}}
function glPos(S,i){let lo=0,hi=S.starts.length-1;while(lo<hi){const mid=(lo+hi+1)>>1;if(S.starts[mid]<=i)lo=mid;else hi=mid-1}return{node:S.nodes[lo],off:i-S.starts[lo]}}
function glFind(root){
  const S=glScanText(root);if(!S.nodes.length)return[];const hits=[];
  for(const{re,cs}of GL.rx){re.lastIndex=0;let m;while((m=re.exec(S.txt))){const e=glLookup(m[0],cs);if(e)hits.push({s:m.index,e:m.index+m[0].length,entry:e})}}
  hits.sort((a,b)=>a.s-b.s||(b.e-b.s)-(a.e-a.s));
  const out=[];let end=-1;
  for(const h of hits){if(h.s<end)continue;const a=glPos(S,h.s),z=glPos(S,h.e-1);if(!a.node||!z.node)continue;
    const r=document.createRange();try{r.setStart(a.node,a.off);r.setEnd(z.node,Math.min(z.node.data.length,z.off+1))}catch(err){continue}
    out.push({r,entry:h.entry});end=h.e}
  return out}
function glRoots(){return[...document.querySelectorAll('#blocks .text-body,#svPage,.gl-scan')]}
function glApply(){
  if(!window.Highlight||!CSS.highlights)return;
  const all=[];for(const[root,items]of GL.map){if(!root.isConnected){GL.map.delete(root);continue}for(const it of items)if(!it.hidden)all.push(it.r)}
  CSS.highlights.set('bl-gloss',new Highlight(...all));
}
function glRefreshAll(){GL.dirty.clear();GL.map.clear();if(GL.mode!=='off'&&GL.rx.length){const seen=new Set();for(const root of glRoots()){const items=glFind(root);if(GL.mode==='first')for(const it of items){if(seen.has(it.entry.id))it.hidden=true;else seen.add(it.entry.id)}GL.map.set(root,items)}}glApply();glHidePop(true)}
function glQueue(root){if(!root)return;GL.dirty.add(root);clearTimeout(GL.scanT);GL.scanT=setTimeout(()=>{if(GL.mode==='first'){glRefreshAll();return}for(const r of GL.dirty)if(r.isConnected&&GL.mode!=='off')GL.map.set(r,glFind(r));GL.dirty.clear();glApply()},260)}
function glObserve(){
  const mo=new MutationObserver(list=>{if(GL.mode==='off')return;for(const m of list){const el=m.target.nodeType===1?m.target:m.target.parentElement;if(!el)continue;
      const root=el.closest('.text-body,#svPage,.gl-scan');if(root){glQueue(root);continue}
      for(const n of m.addedNodes)if(n.nodeType===1){if(n.matches('.text-body,#svPage,.gl-scan'))glQueue(n);n.querySelectorAll&&n.querySelectorAll('.text-body,#svPage,.gl-scan').forEach(glQueue)}}});
  for(const id of['#blocks','#shareView'])if($(id))mo.observe($(id),{subtree:true,childList:true,characterData:true});
}
/* hover cards */
function glHit(x,y){const el=document.elementFromPoint(x,y);if(!el)return null;if(el.closest('.gl-pop'))return'pop';const root=el.closest('.text-body,#svPage,.gl-scan');if(!root)return null;const items=GL.map.get(root);if(!items)return null;
  for(const it of items){if(it.hidden)continue;for(const rc of it.r.getClientRects())if(x>=rc.left-1&&x<=rc.right+1&&y>=rc.top-2&&y<=rc.bottom+2)return it}return null}
const glF=(t,c)=>['s','r'].includes(c)?esc(t).replace(/([A-Za-z\)])(\d+)/g,'$1<sub>$2</sub>'):esc(t);
function glCard(e){const cat=GLOSS_CATS[e.c]||'';const aka=e.a.filter(x=>x&&x!==e.t).slice(0,4);let mol='';if(e.s){try{mol=`<div class="gl-mol" aria-hidden="true">${smilesSVG(e.s,0.82)}</div>`}catch(err){}}
  return`<div class="gl-h"><b>${glF(e.t,e.c)}</b><span class="gl-cat c-${e.c}">${esc(cat)}</span></div>${aka.length?`<div class="gl-aka">${aka.map(x=>glF(x,e.c)).join(' · ')}</div>`:''}${mol}<p>${esc(e.d||'No definition yet.')}</p>`}
function glShowPop(it,sticky){
  glHidePop(true);const e=it.entry,rc=it.r.getClientRects()[0]||it.r.getBoundingClientRect();if(!rc)return;
  const p=document.createElement('div');p.className='gl-pop';p.setAttribute('role','tooltip');p.id='glPop';
  p.innerHTML=glCard(e)+`<div class="gl-act"><button class="linkbtn" data-glopen="${esc(e.id)}">Open in glossary</button></div>`;
  document.body.appendChild(p);
  const w=p.offsetWidth,h=p.offsetHeight;let left=Math.max(8,Math.min(innerWidth-w-8,rc.left+rc.width/2-w/2)),top=rc.bottom+8;if(top+h>innerHeight-8)top=Math.max(8,rc.top-h-8);
  p.style.left=left+'px';p.style.top=top+'px';GL.pop=p;GL.hot=it;GL.sticky=!!sticky;
  if(window.Highlight&&CSS.highlights)CSS.highlights.set('bl-gloss-hot',new Highlight(it.r));
  p.addEventListener('pointerleave',()=>{if(!GL.sticky)glHideSoon()});p.addEventListener('pointerenter',()=>clearTimeout(GL.hideT));
  p.addEventListener('click',ev=>{const o=ev.target.closest('[data-glopen]');if(o){glHidePop(true);openGlossary(o.dataset.glopen)}});
}
function glHidePop(now){clearTimeout(GL.showT);clearTimeout(GL.hideT);if(!now){glHideSoon();return}if(GL.pop){GL.pop.remove();GL.pop=null}GL.hot=null;GL.sticky=false;if(window.Highlight&&CSS.highlights)CSS.highlights.delete('bl-gloss-hot')}
function glHideSoon(){clearTimeout(GL.hideT);GL.hideT=setTimeout(()=>glHidePop(true),220)}
function glHover(){GL.raf=0;if(GL.mode==='off'||!GL.map.size)return;const it=glHit(GL.px,GL.py);
  if(it==='pop'){clearTimeout(GL.hideT);return}
  if(!it){clearTimeout(GL.showT);if(GL.pop&&!GL.sticky)glHideSoon();return}
  if(GL.hot===it){clearTimeout(GL.hideT);return}
  clearTimeout(GL.showT);GL.showT=setTimeout(()=>{if(glHit(GL.px,GL.py)===it)glShowPop(it,false)},GL.pop?60:240)}
function wireGloss(){
  glLoadLocal();glBuild();glObserve();
  document.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;GL.px=e.clientX;GL.py=e.clientY;if(!GL.raf)GL.raf=requestAnimationFrame(glHover)},{passive:true});
  /* tap (touch) or click while holding Alt shows the card and keeps it open */
  document.addEventListener('click',e=>{if(GL.mode==='off')return;if(e.target.closest('.gl-pop'))return;const touch=e.pointerType==='touch'||(App.coarse&&!e.pointerType);
    if(touch||e.altKey){const it=glHit(e.clientX,e.clientY);if(it&&it!=='pop'){glShowPop(it,true);return}}if(GL.sticky)glHidePop(true)},true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&GL.pop)glHidePop(true)});
  $('#main').addEventListener('scroll',()=>{if(GL.pop)glHidePop(true)},{passive:true});
  addEventListener('resize',()=>{if(GL.pop)glHidePop(true)});
  const sel=$('#setGloss');if(sel){sel.value=GL.mode;sel.onchange=()=>setGlossMode(sel.value)}
  wireGlossBrowser();
  requestAnimationFrame(glRefreshAll);
}
function setGlossMode(m){GL.mode=m;try{localStorage.setItem('bondline.glossMode',m)}catch(e){}const sel=$('#setGloss');if(sel)sel.value=m;glRefreshAll();toast(m==='off'?'Glossary highlights are off':m==='first'?'Highlighting the first mention of each term':'Highlighting every glossary term')}
/* glossary browser */
function openGlossary(id,prefill){$('#glScrim').hidden=false;document.body.classList.add('sk-lock');if(prefill!=null){GL.edit={id:null,t:prefill,a:'',d:''}}GL.focus=id||null;if(id){GL.q='';GL.cat='all';$('#glSearch').value=''}glRender();
  if(id){const el=document.getElementById('gl-'+id);if(el){el.scrollIntoView({block:'center'});el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),1600)}}
  else if(GL.edit)$('#glForm [name="t"]')&&$('#glForm [name="t"]').focus();else $('#glSearch').focus()}
function closeGlossary(){$('#glScrim').hidden=true;document.body.classList.remove('sk-lock');GL.edit=null}
function glMatches(e,q){if(!q)return true;q=q.toLowerCase();return e.t.toLowerCase().includes(q)||e.a.some(a=>a.toLowerCase().includes(q))||(e.d||'').toLowerCase().includes(q)}
function glRender(){
  const q=GL.q.trim(),cats=['all',...Object.keys(GLOSS_CATS)];
  const counts={};for(const e of GL.E)counts[e.c]=(counts[e.c]||0)+1;
  $('#glCats').innerHTML=cats.filter(c=>c==='all'||counts[c]||c==='u').map(c=>`<button class="tf${GL.cat===c?' on':''}" data-glcat="${c}" aria-pressed="${GL.cat===c}">${c==='all'?'All':esc(GLOSS_CATS[c])}<span>${c==='all'?GL.E.length:counts[c]||0}</span></button>`).join('');
  const list=GL.E.filter(e=>(GL.cat==='all'||e.c===GL.cat)&&glMatches(e,q)).sort((a,b)=>a.t.localeCompare(b.t,undefined,{sensitivity:'base'}));
  const form=GL.edit?`<form class="gl-form" id="glForm"><h3>${GL.edit.id?'Edit your term':'Add a term'}</h3><label>Term<input name="t" required maxlength="80" value="${esc(GL.edit.t||'')}" placeholder="e.g. Jones reagent"></label><label>Other names or spellings <small>(separate with commas)</small><input name="a" maxlength="400" value="${esc(GL.edit.a||'')}" placeholder="e.g. CrO3/H2SO4"></label><label>Definition<textarea name="d" rows="3" maxlength="1200" placeholder="What it is and what it does">${esc(GL.edit.d||'')}</textarea></label><div class="np-row"><span class="np-sp"></span><button type="button" class="btn" data-glf="cancel">Cancel</button><button class="btn primary" type="submit">Save term</button></div></form>`:'';
  $('#glList').innerHTML=form+(list.length?list.map(e=>`<article class="gl-item" id="gl-${esc(e.id)}">${glCard(e)}${e.c==='u'?`<div class="gl-act"><button class="linkbtn" data-glf="edit" data-id="${esc(e.id)}">Edit</button><button class="linkbtn danger" data-glf="del" data-id="${esc(e.id)}">Delete</button></div>`:''}</article>`).join('')
    :`<p class="hm-muted gl-none">${GL.cat==='u'&&!q?'You haven\'t added any terms yet. Press “Add a term” to make your own.':'Nothing in the glossary matches that.'}</p>`);
  $('#glCount').textContent=`${list.length} term${list.length===1?'':'s'}`;
}
function wireGlossBrowser(){
  $('#glClose').onclick=closeGlossary;
  $('#glScrim').addEventListener('click',e=>{if(e.target.id==='glScrim')closeGlossary()});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape'||$('#glScrim').hidden)return;e.stopPropagation();e.preventDefault();if(GL.edit){GL.edit=null;glRender()}else closeGlossary()},true);
  $('#glSearch').addEventListener('input',e=>{GL.q=e.target.value;glRender()});
  $('#glAdd').onclick=()=>{GL.edit={id:null,t:'',a:'',d:''};glRender();$('#glList').scrollTop=0;$('#glForm [name="t"]').focus()};
  $('#glCats').addEventListener('click',e=>{const b=e.target.closest('[data-glcat]');if(!b)return;GL.cat=b.dataset.glcat;glRender()});
  $('#glList').addEventListener('click',e=>{const b=e.target.closest('[data-glf]');if(!b)return;const k=b.dataset.glf;
    if(k==='cancel'){GL.edit=null;glRender();return}
    const u=GL.user.find(x=>'u'+x.id===b.dataset.id);if(!u)return;
    if(k==='edit'){GL.edit={id:u.id,t:u.t,a:u.a.join(', '),d:u.d};glRender();$('#glList').scrollTop=0;return}
    if(k==='del'){if(!b.classList.contains('armed')){b.classList.add('armed');b.textContent='Click again to delete';return}GL.user=GL.user.filter(x=>x!==u);glSaveUser();glBuild();glRefreshAll();glRender();toast(`Deleted “${u.t}”`)}});
  $('#glList').addEventListener('submit',e=>{e.preventDefault();const f=e.target;const t=f.t.value.trim();if(!t)return;
    const a=f.a.value.split(/[,;\n]/).map(s=>s.trim()).filter(Boolean).slice(0,10),d=f.d.value.trim();
    if(GL.edit&&GL.edit.id){const u=GL.user.find(x=>x.id===GL.edit.id);if(u)Object.assign(u,{t,a,d})}else GL.user.push({id:uid(),t,a,d});
    GL.edit=null;GL.user=glCleanUser(GL.user);glSaveUser();glBuild();glRefreshAll();GL.cat='u';glRender();$('#glSearch').focus();toast(`Saved “${t}” to your glossary`)});
}
function glSelectionText(){const s=getSelection();const t=s&&s.rangeCount?String(s).trim():'';return t.length<=80?t:''}

/* ---------- reaction predictor ---------- */
/* A small, editable molecule graph built from SMILES. Hydrogens are implicit and recalculated with fixH(). */
class PM{
  constructor(){this.A=[];this.B=[]}
  static from(smi){const m=parseSmiles(smi),M=new PM();m.atoms.forEach(a=>M.A.push({el:a.el,ch:a.charge||0,h:a.hImp||0,ar:!!a.arom}));m.bonds.forEach(b=>M.B.push({a:b.a,b:b.b,o:b.order,ar:!!b.arom}));M.perceive();return M}
  perceive(){/* mark benzene-type rings written in Kekulé form as aromatic */const ok=i=>!this.A[i].dead&&['C','N'].includes(this.A[i].el);
    this.A.forEach((a,s)=>{if(!ok(s)||a.ar)return;const walk=path=>{const last=path[path.length-1];if(path.length===6){if(this.bond(last,s)<0)return false;const o=q=>this.order(path[q],path[(q+1)%6]);
        for(let q=0;q<6;q++){const x=o(q),y=o((q+1)%6);if(x+y!==3)return false}for(let q=0;q<6;q++){this.A[path[q]].ar=true;this.B[this.bond(path[q],path[(q+1)%6])].ar=true}return true}
      for(const n of this.nb(last))if(ok(n.to)&&!path.includes(n.to)&&walk([...path,n.to]))return true;return false};walk([s])})}
  clone(){const M=new PM();M.A=this.A.map(a=>({...a}));M.B=this.B.map(b=>({...b}));return M}
  live(i){return!this.A[i].dead}
  nb(i){const r=[];this.B.forEach((b,bi)=>{if(b.dead)return;if(b.a===i)r.push({to:b.b,o:b.o,bi});else if(b.b===i)r.push({to:b.a,o:b.o,bi})});return r}
  bond(i,j){return this.B.findIndex(b=>!b.dead&&((b.a===i&&b.b===j)||(b.a===j&&b.b===i)))}
  order(i,j){const k=this.bond(i,j);return k<0?0:this.B[k].o}
  add(el,ch=0){this.A.push({el,ch,h:0,ar:false});return this.A.length-1}
  link(i,j,o=1){this.B.push({a:i,b:j,o})}
  unlink(i,j){const k=this.bond(i,j);if(k>=0)this.B[k].dead=true}
  setO(i,j,o){const k=this.bond(i,j);if(k>=0)this.B[k].o=o;else this.link(i,j,o)}
  kill(i){this.A[i].dead=true;this.B.forEach(b=>{if(b.a===i||b.b===i)b.dead=true})}
  killBranch(i,from){/* remove atom i and everything reachable from it without passing through `from` */const seen=new Set([from]),st=[i];while(st.length){const x=st.pop();if(seen.has(x))continue;seen.add(x);for(const n of this.nb(x))if(!seen.has(n.to))st.push(n.to);this.kill(x)}}
  attach(at,frag,o=1){const F=PM.from(frag),base=this.A.length;F.A.forEach(a=>this.A.push({...a}));F.B.forEach(b=>this.B.push({...b,a:b.a+base,b:b.b+base}));this.link(at,base,o);return base}
  fixH(){this.A.forEach((a,i)=>{if(a.dead)return;const s=this.nb(i).reduce((t,n)=>t+n.o,0),c=a.ch||0;let v;
    switch(a.el){case'C':case'Si':v=c?3:4;break;case'N':v=3+c;break;case'O':v=2+c;break;case'S':v=[2,4,6].find(x=>x>=s)||s;break;case'P':v=[3,5].find(x=>x>=s)||s;break;case'B':v=3-c;break;case'F':case'Cl':case'Br':case'I':v=c?0:1;break;case'H':v=1;break;default:v=s}
    a.h=Math.max(0,v-s)})}
  G(){const map=new Map(),atoms=[];this.A.forEach((a,i)=>{if(a.dead)return;map.set(i,atoms.length);atoms.push({el:a.el,charge:a.ch||0,h:a.h||0})});
    const bonds=[];this.B.forEach(b=>{if(b.dead||!map.has(b.a)||!map.has(b.b))return;bonds.push({a:map.get(b.a),b:map.get(b.b),o:b.o,src:b})});
    const adj=atoms.map(()=>[]);bonds.forEach((b,bi)=>{adj[b.a].push({to:b.b,o:b.o,bi});adj[b.b].push({to:b.a,o:b.o,bi})});return{atoms,bonds,adj,map}}
  comps(){/* split into connected pieces */const out=[],seen=new Set();this.A.forEach((a,i)=>{if(a.dead||seen.has(i))return;const ids=[],st=[i];while(st.length){const x=st.pop();if(seen.has(x))continue;seen.add(x);ids.push(x);for(const n of this.nb(x))st.push(n.to)}
    const M=this.clone();M.A.forEach((q,k)=>{if(!ids.includes(k))q.dead=true});M.B.forEach(b=>{if(!ids.includes(b.a))b.dead=true});out.push(M)});return out}
  smiles(st){const G=this.G();const stereo={centres:{},dbs:{}};if(st)for(const[key,lab]of Object.entries(st)){const[i,j]=key.split('-').map(Number);const bi=G.bonds.findIndex(b=>(b.a===G.map.get(i)&&b.b===G.map.get(j))||(b.a===G.map.get(j)&&b.b===G.map.get(i)));if(bi>=0)stereo.dbs[bi]=lab}
    return toSmiles(G,stereo)}
}
const PRC={};
function prName(smi){if(PRC[smi]!==undefined)return PRC[smi];let r=null;try{const M=PM.from(smi);M.fixH();const G=M.G();const nm=nameMolecule(G,{centres:{},dbs:{}});r=nm&&nm.name?(nm.common?`${nm.name} (${nm.common})`:nm.name):null}catch(e){r=null}PRC[smi]=r;return r}
function prCanon(smi){try{const M=PM.from(smi);M.fixH();return M.smiles()}catch(e){return smi}}
/* ---- functional group helpers ---- */
const isC=(M,i)=>M.A[i].el==='C',isHal=(M,i)=>['Cl','Br','I'].includes(M.A[i].el);
const cNbrs=(M,i)=>M.nb(i).filter(n=>M.A[n.to].el==='C'&&!M.A[n.to].dead);
const pDeg=(M,i)=>cNbrs(M,i).length;
const sp3=(M,i)=>isC(M,i)&&!M.A[i].ar&&M.nb(i).every(n=>n.o===1);
const carbonylO=(M,i)=>{if(!isC(M,i))return-1;const n=M.nb(i).find(n=>n.o===2&&M.A[n.to].el==='O'&&!M.A[n.to].ch);return n?n.to:-1};
const pIsCO=(M,i)=>carbonylO(M,i)>=0;
const hetSingles=(M,i)=>M.nb(i).filter(n=>n.o===1&&!['C','H'].includes(M.A[n.to].el));
function acylKind(M,i){/* aldehyde, ketone, acid, ester, acylCl, amide, anhydride */if(!pIsCO(M,i))return null;const h=hetSingles(M,i);if(!h.length){const c=pDeg(M,i);return c>=2?'ketone':'aldehyde'}
  const x=h[0].to,el=M.A[x].el;if(el==='Cl'||el==='Br')return'acylCl';if(el==='N')return'amide';if(el==='O'){if(M.A[x].h>=1)return'acid';if(M.A[x].ch===-1)return'carboxylate';const o=M.nb(x).find(n=>n.to!==i);if(o&&pIsCO(M,o.to))return'anhydride';return'ester'}return null}
function fg(M){
  const F={alcohol:[],phenol:[],halide:[],sulfonate:[],alkene:[],alkyne:[],aldehyde:[],ketone:[],acid:[],ester:[],acylCl:[],amide:[],anhydride:[],nitrile:[],nitro:[],epoxide:[],amine:[],aniline:[],arom:prRings(M),ether:[]};
  M.A.forEach((a,i)=>{if(a.dead)return;
    if(a.el==='O'&&!a.ch){const n=M.nb(i);if(a.h===1&&n.length===1&&n[0].o===1&&isC(M,n[0].to)){const c=n[0].to;if(M.A[c].ar)F.phenol.push({o:i,c});else if(!pIsCO(M,c)&&sp3(M,c))F.alcohol.push({o:i,c,deg:pDeg(M,c)})}
      if(n.length===2&&n.every(x=>x.o===1&&isC(M,x.to))){const[p,q]=n.map(x=>x.to);if(M.bond(p,q)>=0)F.epoxide.push({o:i,c1:p,c2:q});else if(!pIsCO(M,p)&&!pIsCO(M,q))F.ether.push({o:i,c1:p,c2:q})}
      if(n.length===2){const s=n.find(x=>M.A[x.to].el==='S'),c=n.find(x=>isC(M,x.to));if(s&&c&&M.nb(s.to).filter(y=>y.o===2&&M.A[y.to].el==='O').length===2&&sp3(M,c.to))F.sulfonate.push({x:i,c:c.to,deg:pDeg(M,c.to)})}}
    if(isHal(M,i)&&!a.ch){const n=M.nb(i);if(n.length===1&&isC(M,n[0].to)){const c=n[0].to;if(sp3(M,c))F.halide.push({x:i,c,deg:pDeg(M,c)});else F.halide.push({x:i,c,deg:pDeg(M,c),bad:M.A[c].ar?'aryl':'vinyl'})}}
    if(isC(M,i)){const k=acylKind(M,i);if(k&&F[k])F[k].push({c:i,o:carbonylO(M,i)});const tn=M.nb(i).find(n=>n.o===3&&M.A[n.to].el==='N');if(tn)F.nitrile.push({c:i,n:tn.to})}
    if(a.el==='N'&&a.ch===1&&M.nb(i).some(n=>n.o===2&&M.A[n.to].el==='O')){const c=M.nb(i).find(n=>isC(M,n.to));if(c)F.nitro.push({n:i,c:c.to})}
    if(a.el==='N'&&!a.ch&&M.nb(i).every(n=>n.o===1)&&!a.ar&&!M.nb(i).some(n=>pIsCO(M,n.to))){const cs=cNbrs(M,i);if(cs.some(n=>M.A[n.to].ar))F.aniline.push({n:i,c:cs.find(n=>M.A[n.to].ar).to,k:cs.length});else F.amine.push({n:i,k:cs.length})}
  });
  M.B.forEach(b=>{if(b.dead||!isC(M,b.a)||!isC(M,b.b)||M.A[b.a].ar||M.A[b.b].ar)return;if(b.o===2)F.alkene.push({a:b.a,b:b.b});if(b.o===3)F.alkyne.push({a:b.a,b:b.b})});
  return F}
function prRings(M){/* benzene-type rings as ordered 6-cycles of aromatic carbons */const out=[],key=new Set();
  const ar=i=>!M.A[i].dead&&M.A[i].ar&&isC(M,i);
  M.A.forEach((a,s)=>{if(!ar(s))return;const walk=(path)=>{const last=path[path.length-1];if(path.length===6){if(M.bond(last,s)>=0){const k=[...path].sort((x,y)=>x-y).join(',');if(!key.has(k)){key.add(k);out.push(path.slice())}}return}
    for(const n of M.nb(last))if(ar(n.to)&&!path.includes(n.to))walk([...path,n.to])};walk([s])});
  return out}
/* ---- reagents ---- */
const PR_RG={
  nabh4:['nabh4','sodium borohydride'],nabh3cn:['nabh3cn','nabh(oac)3','stab','sodium cyanoborohydride','sodium triacetoxyborohydride'],
  lialh4:['lialh4','lah','lithium aluminium hydride','lithium aluminum hydride'],dibal:['dibal-h','dibal','dibalh'],
  h2:['h2','hydrogen'],cat:['pd/c','pd-c','pd','pt','pto2','ni','raney ni','raney nickel','palladium','platinum','rh'],lindlar:['lindlar','lindlar\'s catalyst','lindlar catalyst','pd/caco3','pd/baso4'],
  na:['na','li','sodium metal','lithium metal'],nh3:['nh3','ammonia','nh3(l)','liquid ammonia','liquid nh3'],
  hydrazine:['n2h4','nh2nh2','h2nnh2','hydrazine'],znhg:['zn(hg)','zn/hg','zinc amalgam'],zn:['zn'],snfe:['sn','fe','sncl2','tin','iron'],
  pcc:['pcc','pdc','pyridinium chlorochromate'],dmp:['dmp','dess-martin','dess-martin periodinane'],swern:['swern','(cocl)2','oxalyl chloride'],tempo:['tempo'],
  jones:['jones','jones reagent','cro3','h2cro4','na2cr2o7','k2cr2o7','chromic acid','dichromate','na2cr2o7'],kmno4:['kmno4','permanganate'],
  oso4:['oso4','osmium tetroxide'],nmo:['nmo'],o3:['o3','ozone'],dms:['dms','me2s','(ch3)2s','zn/acoh','pph3'],h2o2:['h2o2','hydrogen peroxide'],
  mcpba:['mcpba','m-cpba','peracid','peroxyacid','rco3h','mmpp','ch3co3h'],bh3:['bh3','b2h6','borane','9-bbn','bh3-thf','bh3thf','sia2bh','disiamylborane'],
  hgoac:['hg(oac)2','mercuric acetate','mercury(ii) acetate'],hgso4:['hgso4'],
  br2:['br2','bromine'],cl2:['cl2','chlorine'],i2:['i2','iodine'],nbs:['nbs'],hbr:['hbr'],hcl:['hcl'],hi:['hi'],
  roor:['roor','peroxide','peroxides','(phco2)2','bz2o2','(phcoo)2','tbuooh'],light:['hv','hν','light','uv'],
  febr3:['febr3'],fecl3:['fecl3'],alcl3:['alcl3','lewis acid'],fe:['fe filings'],
  h2so4:['h2so4','sulfuric acid','sulphuric acid','conc. h2so4'],hno3:['hno3','nitric acid'],so3:['so3','oleum','fuming sulfuric acid','fuming h2so4'],h3po4:['h3po4','phosphoric acid'],
  tsoh:['tsoh','ptsa','p-tsoh','ptsoh'],acid:['h+','h3o+','acid','dilute acid','aqueous acid','hcl(aq)','acidic workup'],
  h2o:['h2o','water','aqueous'],socl2:['socl2','thionyl chloride'],pbr3:['pbr3'],pcl3:['pcl3','pcl5'],pocl3:['pocl3'],py:['pyridine','py','pyr'],
  tscl:['tscl','tosyl chloride','p-tscl'],mscl:['mscl','mesyl chloride'],et3n:['et3n','net3','triethylamine','dipea','iprnet2','i-pr2net'],
  nah:['nah','sodium hydride'],naoh:['naoh','koh','lioh','hydroxide','oh-','ho-','sodium hydroxide','potassium hydroxide'],
  naome:['naome','meona','sodium methoxide','meo-','ch3ona','ch3o-'],naoet:['naoet','etona','sodium ethoxide','eto-','ch3ch2ona','ethoxide'],
  tbuok:['t-buok','tbuok','kotbu','kot-bu','potassium tert-butoxide','t-buo-','tbuo-','potassium t-butoxide'],lda:['lda','lithium diisopropylamide','lihmds','khmds','nahmds'],dbu:['dbu','dbn'],
  nanh2:['nanh2','sodium amide','sodamide'],k2co3:['k2co3','cs2co3','na2co3'],
  nacn:['nacn','kcn','cn-','hcn','cyanide','sodium cyanide'],nan3:['nan3','azide','n3-','sodium azide'],nai:['nai','ki','iodide','sodium iodide'],
  nash:['nash','hs-','sodium hydrosulfide'],nasme:['nasme','mesna','mes-','ch3sna','sodium thiomethoxide'],naoac:['naoac','acetate','ch3coona','ch3co2na'],
  mg:['mg','magnesium'],co2:['co2','dry ice','carbon dioxide'],
  dmso:['dmso'],dmf:['dmf'],acetone:['acetone'],thf:['thf'],ether:['et2o','ether','diethyl ether'],dcm:['ch2cl2','dcm'],mecn:['mecn','acetonitrile','ch3cn'],hexane:['hexane','hexanes'],
  meoh:['meoh','methanol','ch3oh'],etoh:['etoh','ethanol','ch3ch2oh'],tbuoh:['t-buoh','tbuoh'],acoh:['acoh','acetic acid','ch3co2h','ch3cooh','hoac'],
  glycol:['ethylene glycol','hoch2ch2oh','ethane-1,2-diol','(ch2oh)2'],
  tollens:['tollens','tollens\'','tollens\' reagent','ag2o','[ag(nh3)2]+','agno3','ag(nh3)2+'],
  nano2:['nano2','sodium nitrite','hono'],cucl:['cucl'],cubr:['cubr'],cucn:['cucn'],hbf4:['hbf4'],h3po2:['h3po2'],
  dcc:['dcc','edc','edci'],ch2n2:['ch2n2','diazomethane'],nh2oh:['nh2oh','hydroxylamine'],tbaf:['tbaf'],tfa:['tfa','trifluoroacetic acid'],
  bu3snh:['bu3snh','tributyltin hydride'],ac2o:['ac2o','acetic anhydride','(ch3co)2o'],heat:['heat','δ','reflux','hot','warm','high temperature','heating','boil'],cold:['cold','ice','ice bath','dilute'],
};
const PR_R=[['ch3ch2ch2ch2','CCCC'],['ch3ch2ch2','CCC'],['(ch3)2ch','C(C)C'],['(ch3)3c','C(C)(C)C'],['ch3ch2','CC'],['ch3','C'],['me','C'],['et','CC'],['n-pr','CCC'],['npr','CCC'],['pr','CCC'],['i-pr','C(C)C'],['ipr','C(C)C'],['n-bu','CCCC'],['nbu','CCCC'],['bu','CCCC'],['t-bu','C(C)(C)C'],['tbu','C(C)(C)C'],['sec-bu','C(C)CC'],['ph','c1ccccc1'],['c6h5','c1ccccc1'],['bn','Cc1ccccc1'],['phch2','Cc1ccccc1'],['c6h5ch2','Cc1ccccc1'],['benzyl','Cc1ccccc1'],['allyl','CC=C'],['vinyl','C=C']];
const PR_RNAME={C:'methyl',CC:'ethyl',CCC:'propyl','C(C)C':'isopropyl',CCCC:'butyl','C(C)(C)C':'tert-butyl','C(C)CC':'sec-butyl','c1ccccc1':'phenyl','Cc1ccccc1':'benzyl','CC=C':'allyl','C=C':'vinyl'};
const PR_AMINES=[['nh3',''],['ammonia',''],['ch3nh2','C'],['menh2','C'],['methylamine','C'],['etnh2','CC'],['ch3ch2nh2','CC'],['ethylamine','CC'],['me2nh','C.C'],['(ch3)2nh','C.C'],['dimethylamine','C.C'],['et2nh','CC.CC'],['diethylamine','CC.CC'],['pyrrolidine','ring5'],['piperidine','ring6'],['morpholine','morph'],['aniline','c1ccccc1'],['phnh2','c1ccccc1'],['bnnh2','Cc1ccccc1'],['benzylamine','Cc1ccccc1']];
function prNormText(s){return glNorm(String(s||'')).toLowerCase().replace(/[·•]/g,' ').replace(/[“”"]/g,'').replace(/\s+/g,' ').trim()}
function prParse(text){
  const t=prNormText(text),R=new Set(),found=[];
  const all=[];for(const[k,al]of Object.entries(PR_RG))for(const a of al)all.push([a,k]);all.sort((x,y)=>y[0].length-x[0].length);
  const used=new Array(t.length).fill(false);const bnd=c=>!c||!/[a-z0-9]/.test(c);
  for(const[a,k]of all){let i=t.indexOf(a);while(i>=0){const e=i+a.length;if(bnd(t[i-1])&&bnd(t[e])&&!used.slice(i,e).some(Boolean)){R.add(k);found.push(a);for(let j=i;j<e;j++)used[j]=true}i=t.indexOf(a,i+1)}}
  const free=t.split('').map((c,i)=>used[i]?' ':c).join('');
  const ctx={R,text:t,free,heat:R.has('heat'),cold:R.has('cold')};
  const temp=[...t.matchAll(/(-?\d{1,3})\s*°?\s*c\b/g)].map(m=>+m[1]);if(temp.some(x=>x>=60))ctx.heat=true;if(temp.some(x=>x<=0))ctx.cold=true;
  /* organometallics, alkyl halides, amines, ylides and acyl chlorides named in the reagents */
  const rg=PR_R.map(r=>glEsc(r[0])).join('|');
  let m=new RegExp(`(?:^|[^a-z0-9])(${rg})(mgbr|mgcl|mgi|li)(?![a-z0-9])`).exec(t);if(m){ctx.rm={frag:PR_R.find(r=>r[0]===m[1])[1],kind:m[2]==='li'?'RLi':'RMgX',txt:m[1]+m[2]}}
  else if(/grignard/.test(t))ctx.rmUnknown=true;
  m=new RegExp(`(?:^|[^a-z0-9])(${rg})2culi(?![a-z0-9])`).exec(t);if(m)ctx.cu={frag:PR_R.find(r=>r[0]===m[1])[1]};
  m=new RegExp(`(?:^|[^a-z0-9])(${rg})(i|br|cl|otf|ots|oms)(?![a-z0-9])`).exec(free);if(m)ctx.rx={frag:PR_R.find(r=>r[0]===m[1])[1],x:m[2]};
  else if(/methyl iodide|iodomethane/.test(t))ctx.rx={frag:'C',x:'i'};else if(/ethyl bromide|bromoethane/.test(t))ctx.rx={frag:'CC',x:'br'};else if(/benzyl bromide/.test(t))ctx.rx={frag:'Cc1ccccc1',x:'br'};
  m=/(?:^|[^a-z0-9])(ch3cocl|accl|acetyl chloride|ch3ch2cocl|propanoyl chloride|phcocl|bzcl|benzoyl chloride|c6h5cocl)(?![a-z0-9])/.exec(t);if(m)ctx.acyl={frag:/ph|bz|benzoyl|c6h5/.test(m[1])?'C(=O)c1ccccc1':/ch2|propanoyl/.test(m[1])?'C(=O)CC':'C(=O)C',src:'chloride'};
  else if(R.has('ac2o'))ctx.acyl={frag:'C(=O)C',src:'anhydride'};
  m=/ph3p=(ch2|chch3|chph|c\(ch3\)2|chco2et|chcooet|chch2ch3)/.exec(t);if(m)ctx.ylide={ch2:'C',chch3:'CC',chph:'Cc1ccccc1','c(ch3)2':'C(C)C',chco2et:'CC(=O)OCC',chcooet:'CC(=O)OCC',chch2ch3:'CCC'}[m[1]];else if(/wittig|ylide/.test(t))ctx.ylide='C';
  for(const[a,f]of PR_AMINES){if(new RegExp(`(?:^|[^a-z0-9])${glEsc(a)}(?![a-z0-9])`).test(t)&&!(a==='nh3'&&R.has('na'))){ctx.amine={frag:f,name:a};break}}
  if(/sodium acetylide|hc≡cna|nac≡ch|hc≡c-|lic≡ch/.test(t))ctx.alkynide='C#C';
  ctx.protic=R.has('h2o')||R.has('meoh')||R.has('etoh')||R.has('tbuoh')||R.has('acoh');
  ctx.aprotic=R.has('dmso')||R.has('dmf')||R.has('acetone')||R.has('thf')||R.has('mecn')||R.has('dcm')||R.has('ether');
  ctx.acidAny=['h2so4','hcl','hbr','hi','h3po4','tsoh','acid','hno3'].some(k=>R.has(k));
  ctx.has=(...ks)=>ks.some(k=>R.has(k));
  return ctx}
/* ---- outcome builders ---- */
const prOut=(title,type,extra)=>Object.assign({title,type,products:[],why:[],warn:[],lib:null},extra||{});
const prKey=smi=>smi.split('.').map(x=>prName(x)||prCanon(x)).sort().join('+');
function prPush(out,M,label,note,stereo){M.fixH();const parts=M.comps().map(c=>c.smiles(stereo)).filter(Boolean);const smi=parts.join('.');if(!smi)return;const k=prKey(smi)+(stereo?JSON.stringify(Object.values(stereo)):'');if(out.products.some(p=>p.key===k))return;out.products.push({smi,label,note:note||'',key:k,ez:stereo&&parts.length===1?Object.values(stereo)[0]:null})}
function prPushSmi(out,smi,label,note){if(!smi)return;const k=prKey(smi);if(out.products.some(p=>p.key===k))return;out.products.push({smi,label,note:note||'',key:k})}
/* carbocation: one 1,2-shift if it gives a more substituted cation */
function prShift(M,c){
  if(pDeg(M,c)>=3||M.nb(c).some(n=>M.A[n.to].ar))return{c,M,how:null};
  for(const n of cNbrs(M,c)){const j=n.to;if(!sp3(M,j))continue;
    if(M.A[j].h>=1&&pDeg(M,j)>pDeg(M,c)&&pDeg(M,j)>=3)return{c:j,M,how:'hydride'};}
  for(const n of cNbrs(M,c)){const j=n.to;if(!sp3(M,j)||pDeg(M,j)!==4)continue;const me=cNbrs(M,j).map(x=>x.to).find(k=>k!==c&&M.A[k].h===3&&pDeg(M,k)===1);if(me==null)continue;
    const M2=M.clone();M2.unlink(j,me);M2.link(c,me);M2.fixH();return{c:j,M:M2,how:'methyl'}}
  return{c,M,how:null}}
function prMarkov(M,a,b){/* carbon that carries the cation (more substituted; benzylic wins) */const sc=i=>pDeg(M,i)+(M.nb(i).some(n=>M.A[n.to].ar)?1.5:0);return sc(a)>=sc(b)?[a,b]:[b,a]}
/* elimination products from carbon c (which loses a group): returns [{M,subs,beta}] */
function prElims(M,c,removeFn){const out=[];for(const n of cNbrs(M,c)){const b=n.to;if(!sp3(M,b)||M.A[b].h<1)continue;const M2=M.clone();removeFn(M2);M2.setO(c,b,2);M2.fixH();const subs=pDeg(M2,c)-1+pDeg(M2,b)-1;out.push({M:M2,subs,beta:b})}
  const seen=new Set();return out.filter(o=>{const s=o.M.smiles(),k=prKey(s);if(seen.has(k))return false;seen.add(k);o.smi=s;return true}).sort((x,y)=>y.subs-x.subs)}
function prTransStereo(M,c,b){/* (E) label for a simple disubstituted alkene */const oc=cNbrs(M,c).filter(n=>n.to!==b),ob=cNbrs(M,b).filter(n=>n.to!==c);if(oc.length===1&&ob.length===1&&M.A[c].h===1&&M.A[b].h===1)return{[c+'-'+b]:'E'};return null}
/* ---- substitution vs elimination at an sp3 carbon with a leaving group ---- */
function prSubElim(M,site,ctx,lgName){
  const R=ctx.R,c=site.c,d=site.deg,betaH=cNbrs(M,c).some(n=>sp3(M,n.to)&&M.A[n.to].h>0),stab=M.nb(c).some(n=>M.A[n.to].ar)||cNbrs(M,c).some(n=>M.nb(n.to).some(x=>x.o===2&&isC(M,x.to)&&!M.A[x.to].ar));
  const neo=d===1&&cNbrs(M,c).some(n=>pDeg(M,n.to)===4);
  let base='none',nu=null,nuName='';
  if(R.has('tbuok')||R.has('lda')||R.has('dbu')){base='bulky';nuName=R.has('tbuok')?'tert-butoxide':R.has('lda')?'LDA':'DBU';nu=R.has('tbuok')?'OC(C)(C)C':null}
  else if(R.has('nanh2')){base='strong';nuName='amide (NH₂⁻)';nu='N'}
  else if(R.has('naoet')){base='strong';nuName='ethoxide';nu='OCC'}else if(R.has('naome')){base='strong';nuName='methoxide';nu='OC'}else if(R.has('naoh')){base='strong';nuName='hydroxide';nu='O'}
  else if(R.has('nai')){base='nuc';nuName='iodide';nu='I'}else if(R.has('nacn')){base='nuc';nuName='cyanide';nu='C#N'}else if(R.has('nan3')){base='nuc';nuName='azide';nu='N=[N+]=[N-]'}
  else if(R.has('nash')){base='nuc';nuName='hydrosulfide';nu='S'}else if(R.has('nasme')){base='nuc';nuName='methanethiolate';nu='SC'}else if(R.has('naoac')){base='nuc';nuName='acetate';nu='OC(C)=O'}
  else if(ctx.alkynide){base='strongnuc';nuName='acetylide';nu='C#C'}
  else if(ctx.amine){base='nuc';nuName=ctx.amine.name==='nh3'||ctx.amine.name==='ammonia'?'ammonia':ctx.amine.name;nu=ctx.amine.frag===''?'N':ctx.amine.frag.includes('.')?'N('+ctx.amine.frag.split('.')[0]+')'+ctx.amine.frag.split('.')[1]:ctx.amine.frag.startsWith('ring')||ctx.amine.frag==='morph'?null:'N'+ctx.amine.frag}
  else if(R.has('hbr')||R.has('hcl')||R.has('hi')){base='weak';}
  else if(R.has('h2o')||R.has('meoh')||R.has('etoh')||R.has('acoh')||R.has('tbuoh')||!R.size){base='weak'}
  if(base==='none')return null;
  /* solvent for SN1/E1 */
  const solv=R.has('meoh')?['OC','methanol']:R.has('etoh')?['OCC','ethanol']:R.has('acoh')?['OC(C)=O','acetic acid']:['O','water'];
  if(base==='weak'){nu=solv[0];nuName=solv[1]}
  const out=prOut('','',{mech:{scores:{SN2:0,SN1:0,E2:0,E1:0},reasons:[]}});const S=out.mech.scores,why=out.mech.reasons;
  const cls=['methyl','primary','secondary','tertiary'][Math.min(3,d)];
  why.push(`The carbon carrying the leaving group (${lgName}) is <b>${cls}</b>${stab?' and next to a C=C or benzene ring (allylic/benzylic), so a carbocation there is stabilised':''}.`);
  const bName={bulky:`${nuName} is a strong, bulky base`,strong:`${nuName} is a strong base and a good nucleophile`,strongnuc:`${nuName} is a strong base and a good nucleophile`,nuc:`${nuName} is a good nucleophile but a weak base`,weak:`${nuName} is a weak nucleophile and a weak base`}[base];why.push(bName+'.');
  if(d===0){if(base==='weak'){S.SN2=10}else S.SN2=100}
  else if(d===1){if(base==='bulky'){S.E2=90;S.SN2=15}else if(base==='strong'||base==='strongnuc'){S.SN2=85;S.E2=30}else if(base==='nuc'){S.SN2=100}else{if(stab){S.SN1=70;S.E1=20}else S.SN2=15}
    if(neo){S.SN2=Math.min(S.SN2,10);why.push('The neighbouring carbon is quaternary (neopentyl), which blocks backside attack, so SN2 is extremely slow.')}}
  else if(d===2){if(base==='bulky'){S.E2=95;S.SN2=5}else if(base==='strong'||base==='strongnuc'){S.E2=80;S.SN2=35}else if(base==='nuc'){S.SN2=85;S.E2=10}else{S.SN1=stab?70:55;S.E1=45}}
  else{if(base==='bulky'||base==='strong'||base==='strongnuc'){S.E2=100}else if(base==='nuc'){S.SN1=65;S.E1=35;why.push('A tertiary carbon is too crowded for SN2, so substitution has to go through a carbocation.')}else{S.SN1=60;S.E1=40}}
  if(ctx.heat){if(S.E1)S.E1+=30;if(S.E2)S.E2+=15;if(S.SN1)S.SN1-=15;if(S.SN2&&S.E2)S.SN2-=15;why.push('Heat favours elimination, because it makes more molecules (entropy).')}
  if(!betaH){S.E1=0;S.E2=0;why.push('There is no hydrogen on a neighbouring carbon (β-H), so elimination is impossible.')}
  if(base==='nuc'&&ctx.aprotic&&S.SN2)why.push('A polar aprotic solvent leaves the nucleophile unsolvated and speeds up SN2.');
  if((S.SN1||S.E1)&&ctx.protic)why.push('A polar protic solvent stabilises the carbocation and the leaving group, helping SN1/E1.');
  const rank=Object.entries(S).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
  if(!rank.length||rank[0][1]<20){out.title='Very slow or no reaction';out.type='Substitution / elimination';out.mech.winner=null;why.push(d===0||d===1?'A primary or methyl carbon cannot form a carbocation, and this nucleophile is too weak for SN2, so almost nothing happens.':'Neither substitution nor elimination is favourable here.');return out}
  const win=rank[0][0];out.mech.winner=win;out.title=`${win} ${win[0]==='S'?'substitution':'elimination'}`;out.type=win[0]==='S'?'Nucleophilic substitution':'Elimination';out.lib={SN2:'sn2',SN1:'sn1',E2:'e2',E1:'e1'}[win];
  const subst=(MM,cc,label,note)=>{if(!nu){out.warn.push(`Bondline can't draw the substitution product with ${nuName} yet.`);return}const M2=MM.clone();site.remove(M2);M2.attach(cc,nu);prPush(out,M2,label,note)};const shiftNote=h=>h?`After a 1,2-${h} shift. `:'';
  const elim=(MM,cc,label,hof,pre)=>{const E=prElims(MM,cc,M2=>site.remove(M2));if(!E.length)return;const pick=hof?E[E.length-1]:E[0];const st=prTransStereo(pick.M,cc,pick.beta);prPush(out,pick.M,label,(pre||'')+(E.length>1?(hof?'Hofmann product: the bulky base removes the most accessible H, giving the less substituted alkene.':'Zaitsev product: the more substituted alkene.'):''),st);if(E.length>1){const other=hof?E[0]:E[E.length-1];prPush(out,other.M,'Minor product',hof?'Zaitsev alkene':'Less substituted alkene')}};
  const order=rank.filter(x=>x[1]>=25||x===rank[0]);
  order.forEach(([k],ix)=>{const label=ix===0?'Major product':'Minor product';
    if(k==='SN2')subst(M,c,label,M.A[c].h<2&&d>=1?'Inversion of configuration at the carbon that was attacked.':'');
    else if(k==='E2')elim(M,c,label,base==='bulky','');
    else{const sh=prShift(M,c);const MM=sh.M,cc=sh.c;if(sh.how&&ix===0)why.push(`The ${cls} carbocation rearranges by a 1,2-${sh.how} shift to a more stable ${['','','secondary','tertiary'][Math.min(3,pDeg(MM,cc))]} carbocation before reacting.`);
      if(k==='SN1')subst(MM,cc,label,shiftNote(sh.how)+'If the carbon is a stereocentre, SN1 gives a racemic mixture.');else elim(MM,cc,label,false,shiftNote(sh.how))}});
  return out}
/* ---- the rules ---- */
function prRules(M,F,ctx){
  const R=ctx.R,has=ctx.has,res=[];const add=o=>{if(o&&o.products.length)res.push(o);return o};
  /* --- alkenes and alkynes --- */
  if(F.alkene.length||F.alkyne.length){
    if(has('o3')){const ox=has('h2o2');const o=prOut('Ozonolysis',ox?'Oxidative cleavage of C=C':'Cleavage of C=C (reductive workup)',{lib:null});const M2=M.clone();
      for(const e of F.alkene){M2.unlink(e.a,e.b);for(const x of[e.a,e.b]){M2.attach(x,'O',2)}}M2.fixH();if(ox)for(const e of F.alkene)for(const x of[e.a,e.b])if(M2.A[x].h>=1)M2.attach(x,'O');
      prPush(o,M2,'Products');o.why.push('Ozone cuts each C=C in two and puts a C=O on each carbon.',ox?'H₂O₂ oxidises any aldehyde carbon on to a carboxylic acid.':'Me₂S (or Zn) workup stops at aldehydes and ketones.');return[add(o)]}
    if(has('bh3')&&(has('h2o2')||has('naoh'))){const o=prOut('Hydroboration–oxidation','Anti-Markovnikov addition of H and OH (syn)');const M2=M.clone();
      for(const e of F.alkene){const[mk,less]=prMarkov(M2,e.a,e.b);M2.setO(e.a,e.b,1);M2.attach(less,'O')}
      for(const e of F.alkyne){M2.setO(e.a,e.b,2);const[mk,less]=prMarkov(M2,e.a,e.b);M2.unlink(e.a,e.b);M2.link(e.a,e.b,1);M2.attach(less,'O',2)}
      prPush(o,M2,'Product');o.why.push('Boron adds to the less substituted carbon (less crowded), and H to the other carbon, on the same face (syn).','Oxidation replaces C–B with C–OH with retention, so OH ends up on the less substituted carbon. No carbocation, so no rearrangement.');if(F.alkyne.length)o.why.push('With an alkyne the enol formed tautomerises to an aldehyde (terminal alkyne) or ketone.');return[add(o)]}
    if(has('hgoac')||(has('hgso4')&&F.alkyne.length)){const o=prOut(F.alkyne.length?'Mercury-catalysed hydration of an alkyne':'Oxymercuration–demercuration','Markovnikov addition of water, no rearrangement');const M2=M.clone();const rO=has('meoh')?'OC':has('etoh')?'OCC':'O';
      for(const e of F.alkene){const[mk]=prMarkov(M2,e.a,e.b);M2.setO(e.a,e.b,1);M2.attach(mk,rO)}
      for(const e of F.alkyne){const[mk]=prMarkov(M2,e.a,e.b);M2.setO(e.a,e.b,1);M2.attach(mk,'O',2)}
      prPush(o,M2,'Product');o.why.push('The mercurinium ion is opened at the more substituted carbon, so OH (or OR) goes there: Markovnikov.','Unlike acid-catalysed hydration there is no free carbocation, so no rearrangement.');if(F.alkyne.length)o.why.push('The enol tautomerises to a ketone.');return[add(o)]}
    if(has('oso4')||(has('kmno4')&&!ctx.heat&&!ctx.acidAny)){const o=prOut('Syn-dihydroxylation','Addition of two OH groups to the same face');const M2=M.clone();for(const e of F.alkene){M2.setO(e.a,e.b,1);M2.attach(e.a,'O');M2.attach(e.b,'O')}prPush(o,M2,'Product (cis/syn diol)');o.why.push(`${has('oso4')?'OsO₄':'Cold, dilute KMnO₄'} adds both oxygens at once through a cyclic ester, so both OH groups end up on the same face.`);if(F.alkene.length)return[add(o)]}
    if(has('kmno4')&&(ctx.heat||ctx.acidAny)&&F.alkene.length){const o=prOut('Oxidative cleavage with hot KMnO₄','Cleavage of C=C');const M2=M.clone();for(const e of F.alkene){M2.unlink(e.a,e.b);for(const x of[e.a,e.b])M2.attach(x,'O',2)}M2.fixH();for(const e of F.alkene)for(const x of[e.a,e.b])if(M2.A[x].h>=1)M2.attach(x,'O');
      M2.fixH();let co2=false;for(const C of M2.comps()){const cs=C.A.map((a,i)=>i).filter(i=>!C.A[i].dead&&C.A[i].el==='C');if(cs.length===1){co2=true;C.A.forEach((a,i)=>{if(!a.dead)M2.kill(i)})}}prPush(o,M2,'Products');if(co2)prPushSmi(o,'O=C=O','Also formed');o.why.push('Hot or acidic KMnO₄ cleaves the C=C completely. Carbons with H become carboxylic acids (a =CH₂ end becomes CO₂); fully substituted carbons become ketones.');return[add(o)]}
    if(has('mcpba')&&F.alkene.length){const o=prOut('Epoxidation','Syn addition of one O across C=C',{lib:'epoxidation'});const M2=M.clone();for(const e of F.alkene){M2.setO(e.a,e.b,1);const ox=M2.add('O');M2.link(e.a,ox);M2.link(e.b,ox)}prPush(o,M2,'Product (epoxide)');o.why.push('The peroxyacid delivers one oxygen to the same face of the alkene in one step, so the alkene geometry is kept (cis stays cis).');return[add(o)]}
    if((has('br2')||has('cl2'))&&!has('febr3','fecl3','alcl3','light')&&F.alkene.length){const X=has('br2')?'Br':'Cl',wet=has('h2o')||has('meoh');const o=prOut(wet?'Halohydrin formation':'Halogen addition',wet?`Anti addition of ${X} and OH`:`Anti addition of ${X}₂`,{lib:wet?null:'br2'});const M2=M.clone();
      for(const e of F.alkene){const[mk,less]=prMarkov(M2,e.a,e.b);M2.setO(e.a,e.b,1);if(wet){M2.attach(mk,has('meoh')?'OC':'O');M2.attach(less,X)}else{M2.attach(e.a,X);M2.attach(e.b,X)}}
      prPush(o,M2,'Product (anti addition)');o.why.push(`${X}₂ forms a cyclic ${X==='Br'?'bromonium':'chloronium'} ion on one face; it is opened from the other face, so the two new groups are anti.`);if(wet)o.why.push('Water is the solvent, so it opens the ion instead of halide, at the more substituted carbon (which carries more positive charge).');return[add(o)]}
    if((has('hbr')||has('hcl')||has('hi'))&&F.alkene.length&&!F.alcohol.length){const X=has('hbr')?'Br':has('hcl')?'Cl':'I',rad=X==='Br'&&(has('roor')||has('light'));const o=prOut(rad?'Radical addition of HBr':`Addition of H${X}`,rad?'Anti-Markovnikov addition (radical chain)':'Markovnikov addition',{lib:rad?null:'hbr'});
      for(const e of F.alkene.slice(0,1)){const[mk,less]=prMarkov(M,e.a,e.b);const M2=M.clone();M2.setO(e.a,e.b,1);
        if(rad){M2.attach(less,X);prPush(o,M2,'Product');o.why.push('Peroxides start a radical chain: Br• adds to the less substituted carbon to give the more stable radical, so Br ends up on the less substituted carbon (anti-Markovnikov).')}
        else{M2.fixH();const sh=prShift(M2,mk);sh.M.attach(sh.c,X);prPush(o,sh.M,sh.how?'Major product':'Product',sh.how?`After a 1,2-${sh.how} shift`:'');o.why.push(`H⁺ adds to give the more stable carbocation, then ${X}⁻ attacks it: Markovnikov.`);if(sh.how){o.why.push(`The carbocation first rearranges by a 1,2-${sh.how} shift to a tertiary carbocation.`);const M3=M.clone();M3.setO(e.a,e.b,1);M3.attach(mk,X);prPush(o,M3,'Minor product','Without rearrangement')}}}
      return[add(o)]}
    if((has('h2o')||has('acid'))&&has('h2so4','acid','h3po4','tsoh')&&!ctx.heat&&F.alkene.length&&!F.alcohol.length&&!ctx.rm&&!ctx.cu&&!has('lialh4','nabh4','dibal','nabh3cn','mg')){const o=prOut('Acid-catalysed hydration','Markovnikov addition of water',{lib:'hydration'});for(const e of F.alkene.slice(0,1)){const[mk]=prMarkov(M,e.a,e.b);const M2=M.clone();M2.setO(e.a,e.b,1);M2.fixH();const sh=prShift(M2,mk);sh.M.attach(sh.c,'O');prPush(o,sh.M,sh.how?'Major product':'Product',sh.how?`After a 1,2-${sh.how} shift`:'');o.why.push('Protonation gives the more stable carbocation, which water attacks: OH on the more substituted carbon.');if(sh.how)o.why.push(`The carbocation rearranges by a 1,2-${sh.how} shift first.`)}return[add(o)]}
    if(has('h2')&&has('lindlar')&&F.alkyne.length){const o=prOut('Partial hydrogenation (Lindlar)','Syn addition of H₂ to the alkyne');const M2=M.clone();let st=null;for(const e of F.alkyne){M2.setO(e.a,e.b,2);M2.fixH();const oa=cNbrs(M2,e.a).filter(n=>n.to!==e.b),ob=cNbrs(M2,e.b).filter(n=>n.to!==e.a);if(oa.length===1&&ob.length===1)st={[e.a+'-'+e.b]:'Z'}}prPush(o,M2,'Product (cis alkene)','',st);o.why.push('Lindlar’s poisoned catalyst adds both H atoms to the same face and stops at the alkene, so the alkene is cis (Z).');return[add(o)]}
    if(has('na')&&has('nh3')&&F.alkyne.length){const o=prOut('Dissolving-metal reduction','Anti addition of H₂ to the alkyne');const M2=M.clone();let st=null;for(const e of F.alkyne){M2.setO(e.a,e.b,2);M2.fixH();const oa=cNbrs(M2,e.a).filter(n=>n.to!==e.b),ob=cNbrs(M2,e.b).filter(n=>n.to!==e.a);if(oa.length===1&&ob.length===1)st={[e.a+'-'+e.b]:'E'}}prPush(o,M2,'Product (trans alkene)','',st);o.why.push('Electrons from Na add one at a time; the radical anion and vinyl anion prefer the trans arrangement, giving the (E) alkene.');return[add(o)]}
    if(has('h2')&&(has('cat')||!has('lindlar'))&&!has('lindlar')){const o=prOut('Catalytic hydrogenation','Syn addition of H₂');const M2=M.clone();for(const e of[...F.alkene,...F.alkyne])M2.setO(e.a,e.b,1);for(const nx of F.nitro){M2.kill(nx.n);M2.attach(nx.c,'N')}prPush(o,M2,'Product');o.why.push('H₂ on the metal surface adds to C=C and C≡C on the same face until the carbons are saturated.','Benzene rings and C=O groups are not reduced under these conditions.');if(F.nitro.length)o.why.push('Nitro groups are reduced to amines too.');return[add(o)]}
    if(has('nanh2')&&ctx.rx&&F.alkyne.length){const term=F.alkyne.flatMap(e=>[e.a,e.b]).filter(i=>M.A[i].h===1);if(term.length){const o=prOut('Alkylation of a terminal alkyne','SN2 by an acetylide ion');const M2=M.clone();M2.attach(term[0],ctx.rx.frag);prPush(o,M2,'Product');o.why.push('NaNH₂ removes the acidic alkyne H (pKa 25) to make an acetylide, which does SN2 on the alkyl halide.');return[add(o)]}}
  }
  /* --- aromatic rings: electrophilic substitution --- */
  if(F.arom.length&&!F.alkene.length){
    let E=null;
    if(has('hno3')&&has('h2so4'))E={frag:'[N+](=O)[O-]',t:'Nitration',e:'NO₂⁺ (nitronium ion)',lib:'nitration'};
    else if(has('br2')&&has('febr3','alcl3','fe','fecl3'))E={frag:'Br',t:'Bromination',e:'Br⁺ (from Br₂ and the Lewis acid)',lib:'brbenzene'};
    else if(has('cl2')&&has('alcl3','fecl3','febr3','fe'))E={frag:'Cl',t:'Chlorination',e:'Cl⁺ (from Cl₂ and the Lewis acid)'};
    else if(has('so3')||(has('h2so4')&&ctx.heat&&!has('hno3')&&!F.alcohol.length))E={frag:'S(=O)(=O)O',t:'Sulfonation',e:'SO₃'};
    else if(has('alcl3','fecl3')&&ctx.acyl)E={frag:ctx.acyl.frag,t:'Friedel–Crafts acylation',e:'an acylium ion',lib:'fcacyl',fc:true};
    else if(has('alcl3','fecl3')&&ctx.rx){let fr=ctx.rx.frag,re=null;if(fr==='CCC'){fr='C(C)C';re='propyl'}else if(fr==='CCCC'){fr='C(C)CC';re='butyl'}E={frag:fr,t:'Friedel–Crafts alkylation',e:'a carbocation',lib:'fcalkyl',fc:true,re}}
    if(E){const o=prOut(E.t,'Electrophilic aromatic substitution',{lib:E.lib});const ring=F.arom[0];
      const subs=ring.map((r,k)=>({k,r,s:M.nb(r).find(n=>!ring.includes(n.to))})).filter(x=>x.s);
      const kind=s=>{const a=M.A[s.to],i=s.to;if(a.el==='O'){return{d:'op',act:3,n:M.A[i].h?'OH':'OR'}}if(a.el==='N'){if(a.ch===1)return M.nb(i).some(n=>M.A[n.to].el==='O')?{d:'m',act:-3,n:'NO₂'}:{d:'m',act:-3,n:'NR₃⁺'};if(M.nb(i).some(n=>pIsCO(M,n.to)))return{d:'op',act:2,n:'NHC(O)R'};return{d:'op',act:3,n:'NH₂/NR₂',amine:true}}
        if(['F','Cl','Br','I'].includes(a.el))return{d:'op',act:-1,n:a.el};if(a.el==='S')return{d:'m',act:-3,n:'SO₃H'};if(a.el==='C'){if(pIsCO(M,i))return{d:'m',act:-2,n:'C=O'};if(M.nb(i).some(n=>n.o===3))return{d:'m',act:-3,n:'C≡N'};if(M.nb(i).filter(n=>M.A[n.to].el==='F').length===3)return{d:'m',act:-3,n:'CF₃'};return{d:'op',act:1,n:a.ar?'phenyl':'alkyl'}}return{d:'op',act:0,n:a.el}};
      const K=subs.map(x=>({...x,...kind(x.s)}));
      if(E.fc&&K.some(x=>x.act<=-2||x.amine)){o.title=E.t+': no reaction';o.why.push(K.some(x=>x.amine)?'The amine group binds to AlCl₃ and switches the ring off, so Friedel–Crafts reactions fail on anilines.':'The ring carries a strongly deactivating group, and Friedel–Crafts reactions fail on deactivated rings.');o.products=[];o.none=true;res.push(o);return res}
      const free=k=>M.A[ring[k]].h>=1;let major=[],minor=[];
      if(!K.length){major=[0]}
      else{const lead=K.slice().sort((a,b)=>b.act-a.act)[0];const at=k=>((lead.k+k)%6+6)%6;
        if(lead.d==='op'){const para=at(3),orthos=[at(1),at(-1)].filter(free);
          if(free(para))major=[para];if(orthos.length)(major.length?minor:major).push(orthos[0]);
          o.why.push(`The ${lead.n} group is ${lead.act>0?'activating':'deactivating'} and an ortho/para director, ${lead.act<=0?'because its lone pairs still stabilise ortho/para attack by resonance, even though it withdraws electrons overall':['alkyl','phenyl'].includes(lead.n)?'because it donates electron density (hyperconjugation) and stabilises the arenium ion best when the electrophile adds ortho or para':'because its lone pair stabilises the arenium ion by resonance when the electrophile adds ortho or para'}.`);if(major.length&&free(para))o.why.push('Para is usually major because the ortho positions are more crowded.')}
        else{const ms=[at(2),at(-2)].filter(free);if(ms.length)major=[ms[0]];o.why.push(`The ${lead.n} group withdraws electrons and is a meta director: ortho and para attack would put the positive charge next to it.`)}
        if(K.length>1)o.why.push('With several substituents, the strongest activating group decides where the new group goes.')}
      const mk=(k,label)=>{const M2=M.clone();M2.attach(ring[k],E.frag);prPush(o,M2,label)};
      major.forEach(k=>mk(k,'Major product'));minor.forEach(k=>mk(k,'Minor product'));
      o.why.unshift(`The electrophile is ${E.e}; the ring attacks it and then loses H⁺ to become aromatic again.`);
      if(E.re)o.warn.push(`The primary ${E.re} cation rearranges to a secondary one, so the ring gets a branched group. Use Friedel–Crafts acylation then reduction to add a straight chain.`);
      if(E.lib==='fcalkyl')o.warn.push('The alkylated product is more reactive than the starting material, so over-alkylation is common.');
      return[add(o)]}
    /* side-chain oxidation */
    if(has('kmno4','jones')&&(ctx.heat||has('kmno4'))){const o=prOut('Side-chain oxidation','Benzylic oxidation to a carboxylic acid');const M2=M.clone();let n=0;for(const ring of F.arom)for(const r of ring)for(const s of M.nb(r)){if(ring.includes(s.to)||!sp3(M,s.to)||M.A[s.to].h<1)continue;for(const x of M.nb(s.to))if(x.to!==r)M2.killBranch(x.to,s.to);M2.attach(s.to,'O',2);M2.attach(s.to,'O');n++}
      if(n){prPush(o,M2,'Product');o.why.push('Any alkyl group with at least one benzylic H is oxidised all the way down to COOH; the rest of the chain is lost. A tert-butyl group (no benzylic H) survives.');return[add(o)]}}
    if(F.nitro.length&&((has('snfe','zn')&&(has('hcl')||has('acid')))||(has('h2')&&has('cat')))){const o=prOut('Reduction of a nitro group','Nitro → amine');const M2=M.clone();for(const nx of F.nitro){M2.killBranch(nx.n,nx.c);M2.attach(nx.c,'N')}prPush(o,M2,'Product');o.why.push('Metal and acid transfer six electrons and six protons to the nitro group, giving the aniline (after neutralising).');return[add(o)]}
    if(F.aniline.length&&has('nano2')){const a=F.aniline.find(x=>x.k===1&&M.A[x.n].h===2);if(a){const tgt=has('cucl')?['Cl','Sandmeyer reaction (CuCl)']:has('cubr')?['Br','Sandmeyer reaction (CuBr)']:has('cucn')?['C#N','Sandmeyer reaction (CuCN)']:has('nai')?['I','Iodination (KI)']:has('hbf4')?['F','Schiemann reaction (HBF₄)']:has('h3po2')?[null,'Deamination (H₃PO₂)']:ctx.heat&&has('h2o')?['O','Hydrolysis to a phenol']:null;
      const o=prOut(tgt?tgt[1]:'Diazotisation',tgt?'Replacement of a diazonium group':'Aryl amine → diazonium salt');const M2=M.clone();M2.kill(a.n);if(tgt){if(tgt[0])M2.attach(a.c,tgt[0])}else M2.attach(a.c,'[N+]#N');prPush(o,M2,tgt?'Product':'Product (diazonium ion)');o.why.push('NaNO₂ and acid make HNO₂, which turns ArNH₂ into ArN₂⁺ at 0–5 °C.');if(tgt)o.why.push('N₂ is an excellent leaving group, so the diazonium group is replaced.');return[add(o)]}}
  }
  /* --- carbonyl compounds --- */
  const CO=[...F.aldehyde,...F.ketone];
  if(has('lialh4')&&!has('dibal')){const o=prOut('Reduction with LiAlH₄','Hydride reduction',{lib:F.ester.length?'lialh4':'nabh4'});const M2=M.clone();let any=false;
    for(const x of CO){M2.setO(x.c,x.o,1);any=true}
    for(const x of[...F.acid,...F.acylCl]){const lg=M.nb(x.c).find(n=>n.o===1&&['O','Cl','Br'].includes(M.A[n.to].el));if(lg)M2.kill(lg.to);M2.setO(x.c,x.o,1);any=true}
    for(const x of F.ester){const or=M.nb(x.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.unlink(x.c,or.to);M2.setO(x.c,x.o,1);any=true}
    for(const x of F.amide){M2.kill(x.o);any=true}
    for(const x of F.nitrile){M2.setO(x.c,x.n,1);any=true}
    for(const x of F.epoxide){const[a,b]=pDeg(M,x.c1)>=pDeg(M,x.c2)?[x.c1,x.c2]:[x.c2,x.c1];M2.unlink(b,x.o);any=true}
    if(any){prPush(o,M2,'Product');o.why.push('LiAlH₄ delivers H⁻ to C=O carbons. Esters and acids are reduced all the way to primary alcohols (an ester also releases its alcohol part); amides become amines and nitriles become primary amines.');if(F.epoxide.length)o.why.push('Hydride opens the epoxide at the less hindered carbon.');o.why.push('An aqueous acid workup protonates the alkoxides.');return[add(o)]}}
  if(has('dibal')&&(F.ester.length||F.nitrile.length)){const o=prOut('Partial reduction with DIBAL-H','Ester or nitrile → aldehyde');const M2=M.clone();for(const x of F.ester){const or=M.nb(x.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.unlink(x.c,or.to)}for(const x of F.nitrile){M2.kill(x.n);M2.attach(x.c,'O',2)}prPush(o,M2,'Product');o.why.push('At −78 °C DIBAL-H adds only one hydride; the tetrahedral intermediate survives until workup, which releases the aldehyde.');return[add(o)]}
  if(has('nabh4')&&!ctx.amine&&CO.length){const o=prOut('Reduction with NaBH₄','Aldehyde/ketone → alcohol',{lib:'nabh4'});const M2=M.clone();for(const x of CO)M2.setO(x.c,x.o,1);prPush(o,M2,'Product');o.why.push('NaBH₄ adds H⁻ to the C=O carbon; the solvent protonates the alkoxide. Aldehydes give primary alcohols and ketones give secondary alcohols.');if(F.ester.length||F.acid.length||F.amide.length)o.why.push('NaBH₄ is too mild to reduce the ester, acid or amide, which survive unchanged (chemoselectivity).');if(F.alkene.length)o.why.push('C=C bonds are not touched.');return[add(o)]}
  if((has('hydrazine')&&(has('naoh')||ctx.heat))||(has('znhg')&&has('hcl'))){if(CO.length){const wk=has('hydrazine');const o=prOut(wk?'Wolff–Kishner reduction':'Clemmensen reduction','C=O → CH₂');const M2=M.clone();for(const x of CO)M2.kill(x.o);prPush(o,M2,'Product');o.why.push(wk?'Hydrazine forms a hydrazone; strong base and heat then lose N₂, leaving CH₂ (basic conditions).':'Zinc amalgam and HCl remove the oxygen completely (acidic conditions).');return[add(o)]}}
  if((ctx.rm||ctx.rmUnknown)&&(CO.length||F.ester.length||F.acylCl.length||F.epoxide.length||F.nitrile.length||has('co2'))){
    if(!ctx.rm){const o=prOut('Grignard addition','Which Grignard reagent?');o.why.push('Name the Grignard reagent so Bondline knows which group adds, e.g. “CH3MgBr, then H3O+” or “PhMgBr”.');o.none=true;res.push(o);return res}
    const R1=ctx.rm.frag,nm=PR_RNAME[R1]||'R';const o=prOut(`${ctx.rm.kind==='RLi'?'Organolithium':'Grignard'} addition`,`Adds a ${nm} group to the carbonyl carbon`,{lib:'grignard'});const M2=M.clone();
    for(const x of CO){M2.setO(x.c,x.o,1);M2.attach(x.c,R1)}
    for(const x of[...F.ester,...F.acylCl]){const lg=M.nb(x.c).find(n=>n.o===1&&n.to!==x.o&&!isC(M,n.to));if(lg){M2.unlink(x.c,lg.to);if(M.A[lg.to].el!=='O')M2.kill(lg.to)}M2.setO(x.c,x.o,1);M2.attach(x.c,R1);M2.attach(x.c,R1)}
    for(const x of F.nitrile){M2.kill(x.n);M2.attach(x.c,'O',2);M2.attach(x.c,R1)}
    for(const x of F.epoxide){const[a,b]=pDeg(M,x.c1)>=pDeg(M,x.c2)?[x.c1,x.c2]:[x.c2,x.c1];M2.unlink(b,x.o);M2.attach(b,R1)}
    prPush(o,M2,'Product (after acid workup)');o.why.push(`The carbon of ${ctx.rm.txt||'the reagent'} is a strong nucleophile and adds to the electrophilic C=O carbon; acid workup protonates the alkoxide.`);
    if(CO.length)o.why.push(`${F.aldehyde.length&&!F.ketone.length?(F.aldehyde.some(x=>M.A[x.c].h===2)?'Formaldehyde gives a primary alcohol.':'An aldehyde gives a secondary alcohol.'):'A ketone gives a tertiary alcohol.'}`);
    if(F.ester.length||F.acylCl.length)o.why.push('Esters and acid chlorides react twice: the first addition expels the leaving group to give a ketone, which is more reactive and adds a second equivalent, giving a tertiary alcohol.');
    if(F.nitrile.length)o.why.push('With a nitrile the imine salt is hydrolysed in the workup to a ketone.');
    if(F.alcohol.length||F.acid.length)o.warn.push('The O–H group in the starting material would destroy the Grignard reagent first (an acid–base reaction), so it needs protecting or extra reagent.');
    return[add(o)]}
  if(ctx.cu&&(F.acylCl.length||CO.length||F.halide.length)){const o=prOut('Gilman (organocuprate) reaction','Soft carbon nucleophile');const M2=M.clone();const R1=ctx.cu.frag;let done=false;
    for(const x of F.acylCl){const cl=M.nb(x.c).find(n=>M.A[n.to].el==='Cl');M2.kill(cl.to);M2.attach(x.c,R1);done=true;o.why.push('Cuprates turn acid chlorides into ketones and, unlike Grignard reagents, stop there.')}
    if(!done)for(const x of CO){const a=M.nb(x.c).find(n=>isC(M,n.to)&&M.nb(n.to).some(y=>y.o===2&&isC(M,y.to)));if(a){const b=M.nb(a.to).find(y=>y.o===2&&isC(M,y.to)).to;M2.setO(a.to,b,1);M2.attach(b,R1);done=true;o.type='Conjugate (1,4-) addition';o.lib='michael';o.why.push('The soft cuprate adds to the β-carbon of the enone (1,4-addition) rather than to the C=O.')}}
    if(!done)for(const x of F.halide.filter(h=>!h.bad)){M2.kill(x.x);M2.attach(x.c,R1);done=true;o.why.push('Cuprates couple with alkyl halides, replacing the halogen with the R group.')}
    if(done){prPush(o,M2,'Product');return[add(o)]}}
  if(ctx.ylide&&CO.length){const o=prOut('Wittig reaction','C=O → C=C',{lib:'wittig'});const M2=M.clone();for(const x of CO){M2.kill(x.o);M2.attach(x.c,ctx.ylide,2)}prPush(o,M2,'Product');o.why.push('The ylide carbon attacks the C=O to form an oxaphosphetane, which falls apart to the alkene and Ph₃P=O. The new C=C sits exactly where the C=O was.');return[add(o)]}
  if(has('nacn')&&(has('acid','hcl','h2so4')||R.has('nacn'))&&CO.length&&!F.halide.length&&!F.sulfonate.length){const o=prOut('Cyanohydrin formation','Addition of HCN to C=O',{lib:'cyanohydrin'});const M2=M.clone();for(const x of CO){M2.setO(x.c,x.o,1);M2.attach(x.c,'C#N')}prPush(o,M2,'Product');o.why.push('Cyanide adds to the C=O carbon; the alkoxide is then protonated by HCN.');return[add(o)]}
  if(CO.length&&ctx.amine&&(has('nabh3cn')||(has('nabh4')&&ctx.amine))){const o=prOut('Reductive amination','C=O + amine → amine');const M2=M.clone();const am=ctx.amine.frag;for(const x of CO.slice(0,1)){M2.kill(x.o);if(am==='')M2.attach(x.c,'N');else if(am.includes('.')){const[p,q]=am.split('.');M2.attach(x.c,`N(${p})${q}`)}else if(am.startsWith('ring')||am==='morph')M2.attach(x.c,am==='ring5'?'N1CCCC1':am==='ring6'?'N1CCCCC1':'N1CCOCC1');else M2.attach(x.c,'N'+am)}prPush(o,M2,'Product');o.why.push('The amine and carbonyl form an imine (or iminium ion), which the mild hydride reduces faster than the C=O itself.');return[add(o)]}
  if(CO.length&&has('nh2oh')){const o=prOut('Oxime formation','C=O + NH₂OH → C=N–OH');const M2=M.clone();for(const x of CO){M2.kill(x.o);M2.attach(x.c,'NO',2)}prPush(o,M2,'Product');return[add(o)]}
  if(CO.length&&has('hydrazine')){const o=prOut('Hydrazone formation','C=O + N₂H₄ → C=N–NH₂');const M2=M.clone();for(const x of CO){M2.kill(x.o);M2.attach(x.c,'NN',2)}prPush(o,M2,'Product');o.why.push('Add KOH and heat to carry on to the Wolff–Kishner reduction (C=O → CH₂).');return[add(o)]}
  if(CO.length&&ctx.amine&&!has('lialh4','nabh4','nabh3cn')){const am=ctx.amine.frag;const sec=am.includes('.')||am.startsWith('ring')||am==='morph';const o=prOut(sec?'Enamine formation':'Imine formation',sec?'C=O + secondary amine → C=C–NR₂':'C=O + primary amine → C=N–R',{lib:sec?null:'imine'});const M2=M.clone();const x=CO[0];
    if(!sec){M2.kill(x.o);M2.attach(x.c,am===''?'N':'N'+am,2);prPush(o,M2,'Product');o.why.push('The amine adds to C=O, then water is lost (acid catalysis, best near pH 5) to give the C=N.')}
    else{const a=cNbrs(M,x.c).find(n=>sp3(M,n.to)&&M.A[n.to].h>0);if(!a){o.why.push('There is no α-hydrogen, so an enamine can’t form.');o.none=true;res.push(o);return res}M2.kill(x.o);const amS=am==='ring5'?'N1CCCC1':am==='ring6'?'N1CCCCC1':am==='morph'?'N1CCOCC1':`N(${am.split('.')[0]})${am.split('.')[1]}`;M2.attach(x.c,amS);M2.setO(x.c,a.to,2);prPush(o,M2,'Product');o.why.push('A secondary amine can’t form a neutral C=N, so the iminium ion loses an α-H instead, giving a C=C–N (enamine).')}
    return[add(o)]}
  if(CO.length&&(has('meoh','etoh','glycol'))&&(has('tsoh','h2so4','acid','hcl'))&&!F.acid.length){const gly=has('glycol');const o=prOut(gly?'Cyclic acetal formation':'Acetal formation','C=O → C(OR)₂',{lib:'acetal'});const M2=M.clone();for(const x of CO){M2.kill(x.o);if(gly){const o1=M2.attach(x.c,'OCCO');const o2=o1+3;M2.link(x.c,o2)}else{const r=has('meoh')?'OC':'OCC';M2.attach(x.c,r);M2.attach(x.c,r)}}prPush(o,M2,'Product');o.why.push('Acid catalysis: the alcohol adds to give a hemiacetal, which loses water to an oxocarbenium ion; a second alcohol adds to give the acetal. Removing water drives it forward.','Acetals are stable to bases, Grignard reagents and hydrides, so they are used to protect C=O groups.');return[add(o)]}
  if(CO.length&&has('jones','kmno4','tollens')&&F.aldehyde.length){const o=prOut(has('tollens')?'Tollens’ oxidation':'Oxidation of an aldehyde','Aldehyde → carboxylic acid');const M2=M.clone();for(const x of F.aldehyde)M2.attach(x.c,'O');prPush(o,M2,'Product');if(has('tollens'))o.why.push('Ag⁺ is reduced to a silver mirror; ketones don’t react, so this is a test for aldehydes.');else o.why.push('The aldehyde hydrate is oxidised to the carboxylic acid.');return[add(o)]}
  if(F.ketone.length&&has('mcpba')){const o=prOut('Baeyer–Villiger oxidation','Ketone → ester');const M2=M.clone();const x=F.ketone[0];const sides=cNbrs(M,x.c).filter(n=>n.to!==x.o).map(n=>n.to);const apt=i=>M.A[i].ar?3:pDeg(M,i);
    const mig=sides.sort((a,b)=>apt(b)-apt(a))[0];M2.unlink(x.c,mig);const ox=M2.add('O');M2.link(x.c,ox);M2.link(ox,mig);prPush(o,M2,'Product');o.why.push('The peroxyacid adds to C=O; then the group best able to carry positive charge migrates to oxygen. Order: tertiary > secondary ≈ phenyl > primary > methyl.');return[add(o)]}
  if(F.aldehyde.length&&has('naoh','naoet','naome')&&!ctx.rx&&!has('i2','br2','cl2')){const ald=F.aldehyde[0];const a=cNbrs(M,ald.c).find(n=>sp3(M,n.to)&&M.A[n.to].h>=1);
    if(a){const o=prOut(ctx.heat?'Aldol condensation':'Aldol reaction',ctx.heat?'Two aldehydes join, then lose water':'Two aldehydes join',{lib:ctx.heat?'aldolcond':'aldol'});const M2=M.clone();const n0=M.A.length;const B=M.clone();
      /* add a second copy of the molecule */B.A.forEach(q=>M2.A.push({...q}));B.B.forEach(b=>M2.B.push({...b,a:b.a+n0,b:b.b+n0}));M2.link(a.to+n0,ald.c);M2.setO(ald.c,ald.o,1);
      if(ctx.heat){M2.kill(ald.o);M2.setO(a.to+n0,ald.c,2)}prPush(o,M2,ctx.heat?'Product (α,β-unsaturated aldehyde)':'Product (β-hydroxy aldehyde)');o.why.push('Base removes an α-H to make an enolate, which attacks the C=O of a second molecule.');if(ctx.heat)o.why.push('Heating removes water (E1cB) to give the conjugated C=C–C=O.');return[add(o)]}}
  if(F.ester.length&&has('naoet','naome')&&!F.halide.length&&!ctx.rx&&!has('h2o')){const es=F.ester[0];const a=cNbrs(M,es.c).find(n=>sp3(M,n.to)&&M.A[n.to].h>=2);if(a){const o=prOut('Claisen condensation','Two esters join to a β-keto ester',{lib:'claisen'});const M2=M.clone();const n0=M.A.length;const B=M.clone();B.A.forEach(q=>M2.A.push({...q}));B.B.forEach(b=>M2.B.push({...b,a:b.a+n0,b:b.b+n0}));
    const or=M.nb(es.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.killBranch(or.to,es.c);M2.link(a.to+n0,es.c);prPush(o,M2,'Product (β-keto ester)');o.why.push('The ester enolate attacks a second ester; the tetrahedral intermediate expels the alkoxide. Deprotonating the acidic β-keto ester drives the reaction, so a full equivalent of base is needed; acid workup gives the neutral product.');return[add(o)]}}
  if(F.ketone.length&&ctx.rx&&has('lda','nah','naoet')){const k=F.ketone[0];const al=cNbrs(M,k.c).filter(n=>sp3(M,n.to)&&M.A[n.to].h>=1).sort((x,y)=>has('lda')?pDeg(M,x.to)-pDeg(M,y.to):pDeg(M,y.to)-pDeg(M,x.to));if(al.length){const o=prOut('Enolate alkylation','α-alkylation of a ketone');const M2=M.clone();M2.attach(al[0].to,ctx.rx.frag);prPush(o,M2,'Product');o.why.push(has('lda')?'LDA at −78 °C removes the more accessible α-H fastest, giving the kinetic (less substituted) enolate, which does SN2 on the alkyl halide.':'The enolate does SN2 on the alkyl halide at the α-carbon.');return[add(o)]}}
  if(F.ketone.length&&has('i2','br2','cl2')&&has('naoh')){const k=F.ketone.find(x=>cNbrs(M,x.c).some(n=>M.A[n.to].h===3));if(k){const me=cNbrs(M,k.c).find(n=>M.A[n.to].h===3).to;const o=prOut('Haloform reaction','Methyl ketone → carboxylic acid + CHX₃');const M2=M.clone();M2.kill(me);M2.attach(k.c,'O');prPush(o,M2,'Product (after acidification)');const X=has('i2')?'I':has('br2')?'Br':'Cl';prPushSmi(o,`${X}C(${X})${X}`,X==='I'?'By-product: iodoform (yellow precipitate)':'By-product: haloform');o.why.push('Base and halogen replace all three H of the CH₃ group; then hydroxide attacks the C=O and CX₃⁻ leaves.');return[add(o)]}}
  if(CO.length&&has('br2','cl2')&&has('acoh','acid','hbr')){const k=CO[0];const al=cNbrs(M,k.c).filter(n=>sp3(M,n.to)&&M.A[n.to].h>=1).sort((x,y)=>pDeg(M,y.to)-pDeg(M,x.to));if(al.length){const o=prOut('α-Halogenation (acid)','Halogen at the α-carbon');const M2=M.clone();M2.attach(al[0].to,has('br2')?'Br':'Cl');prPush(o,M2,'Product');o.why.push('Acid forms the enol (the more substituted one), which attacks the halogen; only one halogen adds under acidic conditions.');return[add(o)]}}
  /* --- carboxylic acids and derivatives --- */
  if(F.acid.length&&has('socl2','pcl3')){const o=prOut('Acid chloride formation','RCOOH → RCOCl');const M2=M.clone();for(const x of F.acid){const oh=M.nb(x.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.kill(oh.to);M2.attach(x.c,'Cl')}for(const x of F.alcohol){M2.kill(x.o);M2.attach(x.c,'Cl')}prPush(o,M2,'Product');o.why.push('SOCl₂ turns the OH into a chlorosulfite leaving group, which chloride replaces; SO₂ and HCl escape as gases.');return[add(o)]}
  if(F.acid.length&&has('meoh','etoh')&&has('h2so4','tsoh','acid','hcl')){const r=has('meoh')?'OC':'OCC';const o=prOut('Fischer esterification','Acid + alcohol → ester',{lib:'fischer'});const M2=M.clone();for(const x of F.acid){const oh=M.nb(x.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.kill(oh.to);M2.attach(x.c,r)}prPush(o,M2,'Product');o.why.push('Acid activates the C=O; the alcohol adds, and water is lost from the tetrahedral intermediate. It is an equilibrium, so excess alcohol is used.');return[add(o)]}
  if(F.acid.length&&has('ch2n2')){const o=prOut('Methyl ester formation','RCOOH + CH₂N₂ → RCOOMe');const M2=M.clone();for(const x of F.acid){const oh=M.nb(x.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.attach(oh.to,'C')}prPush(o,M2,'Product');return[add(o)]}
  if((F.acylCl.length||F.anhydride.length)&&(ctx.amine||has('meoh','etoh','h2o')||F.alcohol.length===0)){const nuc=ctx.amine?(ctx.amine.frag===''?'N':ctx.amine.frag.includes('.')?`N(${ctx.amine.frag.split('.')[0]})${ctx.amine.frag.split('.')[1]}`:ctx.amine.frag.startsWith('ring')?(ctx.amine.frag==='ring5'?'N1CCCC1':'N1CCCCC1'):ctx.amine.frag==='morph'?'N1CCOCC1':'N'+ctx.amine.frag):has('meoh')?'OC':has('etoh')?'OCC':has('h2o')?'O':null;
    if(nuc){const o=prOut(ctx.amine?'Amide formation':nuc==='O'?'Hydrolysis of an acid derivative':'Ester formation','Nucleophilic acyl substitution',{lib:ctx.amine?'amide':nuc==='O'?'acylhydrolysis':null});const M2=M.clone();
      for(const x of F.acylCl){const cl=M.nb(x.c).find(n=>M.A[n.to].el==='Cl'||M.A[n.to].el==='Br');M2.kill(cl.to);M2.attach(x.c,nuc)}
      for(const x of F.anhydride){const ob=M.nb(x.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.unlink(x.c,ob.to);M2.attach(x.c,nuc)}
      prPush(o,M2,'Products');o.why.push('The nucleophile adds to the C=O to form a tetrahedral intermediate, which collapses and expels the leaving group (Cl⁻ or a carboxylate).');if(ctx.amine)o.why.push('Two equivalents of amine (or pyridine/Et₃N) are used, to mop up the HCl formed.');return[add(o)]}}
  if((F.alcohol.length||F.phenol.length||F.amine.length||F.aniline.length)&&ctx.acyl&&!has('alcl3')){const o=prOut('Acylation','O- or N-acylation');const M2=M.clone();const tgt=[...F.amine.filter(x=>M.A[x.n].h>=1).map(x=>x.n),...F.aniline.filter(x=>M.A[x.n].h>=1).map(x=>x.n),...F.alcohol.map(x=>x.o),...F.phenol.map(x=>x.o)][0];M2.attach(tgt,ctx.acyl.frag);prPush(o,M2,'Product');o.why.push(`The ${M.A[tgt].el==='N'?'amine':'alcohol'} attacks the ${ctx.acyl.src==='anhydride'?'anhydride':'acid chloride'}, which loses its leaving group (nucleophilic acyl substitution).`);return[add(o)]}
  if((F.ester.length||F.amide.length||F.nitrile.length)&&(has('naoh')||((has('acid','h2so4','hcl'))&&(ctx.heat||has('h2o'))))){const basic=has('naoh');const o=prOut(basic&&F.ester.length?'Saponification':'Hydrolysis',basic?'Base hydrolysis':'Acid hydrolysis',{lib:basic&&F.ester.length?'saponification':null});const M2=M.clone();
    for(const x of F.ester){const or=M.nb(x.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.unlink(x.c,or.to);M2.attach(x.c,'O')}
    for(const x of F.amide){const nn=M.nb(x.c).find(n=>M.A[n.to].el==='N');M2.unlink(x.c,nn.to);M2.attach(x.c,'O')}
    for(const x of F.nitrile){M2.kill(x.n);M2.attach(x.c,'O',2);M2.attach(x.c,'O')}
    prPush(o,M2,basic?'Products (after acidifying)':'Products');o.why.push(basic?'Hydroxide attacks the C=O; the alkoxide leaves and immediately deprotonates the acid, which makes saponification irreversible. Adding acid at the end gives the free carboxylic acid.':'Acid and water (with heat) break the C–O, C–N or C≡N bonds to give the carboxylic acid.');return[add(o)]}
  if(F.acid.length&&ctx.amine&&has('dcc')){const o=prOut('Amide coupling','Acid + amine → amide');const M2=M.clone();const x=F.acid[0];const oh=M.nb(x.c).find(n=>n.o===1&&M.A[n.to].el==='O');M2.kill(oh.to);M2.attach(x.c,ctx.amine.frag===''?'N':'N'+ctx.amine.frag.replace('.',''));prPush(o,M2,'Product');o.why.push('DCC turns the acid OH into a good leaving group (an O-acylisourea), which the amine replaces.');return[add(o)]}
  /* --- alcohols --- */
  if(F.alcohol.length){const al=F.alcohol;
    if(has('pcc','dmp','swern','tempo')){const o=prOut('Mild oxidation','Alcohol → aldehyde or ketone');const M2=M.clone();let n=0;for(const x of al){if(x.deg===3)continue;M2.setO(x.c,x.o,2);n++}if(!n){o.title='No reaction';o.why.push('Tertiary alcohols have no H on the carbinol carbon, so they can’t be oxidised.');o.none=true;res.push(o);return res}prPush(o,M2,'Product');o.why.push(`${has('pcc')?'PCC':has('dmp')?'Dess–Martin periodinane':has('swern')?'The Swern oxidation':'TEMPO'} oxidises primary alcohols to aldehydes without going on to acids (no water present), and secondary alcohols to ketones.`);if(al.some(x=>x.deg===3))o.why.push('Any tertiary alcohol is left unchanged.');return[add(o)]}
    if(has('jones','kmno4')){const o=prOut('Strong oxidation','Alcohol → carboxylic acid or ketone');const M2=M.clone();let n=0;for(const x of al){if(x.deg===3)continue;M2.setO(x.c,x.o,2);if(M.A[x.c].h>=2)M2.attach(x.c,'O');n++}if(!n){o.title='No reaction';o.why.push('Tertiary alcohols can’t be oxidised.');o.none=true;res.push(o);return res}prPush(o,M2,'Product');o.why.push('Chromium(VI) in water (or KMnO₄) oxidises primary alcohols through the aldehyde hydrate on to carboxylic acids, and secondary alcohols to ketones.');return[add(o)]}
    if(has('socl2','pbr3','pcl3')||(has('hbr','hcl','hi')&&!F.alkene.length)){const X=has('pbr3')||has('hbr')?'Br':has('hi')?'I':'Cl';const viaHX=has('hbr','hcl','hi')&&!has('socl2','pbr3','pcl3');const x=al[0];
      if(viaHX&&x.deg>=2){const o=prOut(`Alcohol → alkyl ${X==='Br'?'bromide':X==='I'?'iodide':'chloride'} (SN1)`,'Substitution through a carbocation',{lib:'sn1'});const M2=M.clone();M2.kill(x.o);M2.fixH();const sh=prShift(M2,x.c);sh.M.attach(sh.c,X);prPush(o,sh.M,sh.how?'Major product':'Product',sh.how?`After a 1,2-${sh.how} shift`:'');o.why.push('H⁺ turns OH into H₂O, a good leaving group. A secondary or tertiary carbocation forms and halide attacks it.');if(sh.how)o.why.push(`The carbocation rearranges by a 1,2-${sh.how} shift first.`);return[add(o)]}
      const o=prOut(`Alcohol → alkyl ${X==='Br'?'bromide':X==='I'?'iodide':'chloride'}`,viaHX?'SN2 on the protonated alcohol':'Substitution with inversion (SN2)',{lib:'sn2'});const M2=M.clone();for(const y of al){if(y.deg===3&&!viaHX)continue;M2.kill(y.o);M2.attach(y.c,X)}prPush(o,M2,'Product');o.why.push(viaHX?'Primary alcohols are protonated, then halide displaces water by SN2.':`${has('socl2')?'SOCl₂':has('pbr3')?'PBr₃':'PCl₃'} converts OH into a good leaving group, which halide displaces by SN2, so no rearrangement and inversion at a stereocentre.`);return[add(o)]}
    if(has('tscl','mscl')){const ts=has('tscl');const o=prOut(ts?'Tosylate formation':'Mesylate formation','OH → good leaving group');const M2=M.clone();for(const x of al)M2.attach(x.o,ts?'S(=O)(=O)c1ccc(C)cc1':'S(=O)(=O)C');prPush(o,M2,'Product');o.why.push('The alcohol oxygen attacks the sulfonyl chloride; the C–O bond is not touched, so configuration at carbon is kept. The sulfonate is now an excellent leaving group for SN2 or E2.');return[add(o)]}
    if(has('pocl3')&&has('py')){const x=al[0];const o=prOut('Dehydration with POCl₃/pyridine','E2 elimination of water');const E=prElims(M,x.c,M2=>M2.kill(x.o));if(E.length){prPush(o,E[0].M,'Major product',E.length>1?'Zaitsev product: the more substituted alkene.':'');o.why.push('POCl₃ converts OH into a leaving group and pyridine removes a β-H in one E2 step: no carbocation, so no rearrangement.');return[add(o)]}}
    if(has('h2so4','h3po4','tsoh')&&ctx.heat){const x=al[0];const o=prOut('Acid-catalysed dehydration','E1 elimination of water',{lib:'e1'});const M2=M.clone();M2.kill(x.o);M2.fixH();const sh=x.deg>=2?prShift(M2,x.c):{M:M2,c:x.c,how:null};
      const E=prElims(sh.M,sh.c,()=>{});if(E.length){const st=prTransStereo(E[0].M,sh.c,E[0].beta);prPush(o,E[0].M,'Major product',(sh.how?`After a 1,2-${sh.how} shift. `:'')+(E.length>1?'Zaitsev product: the more substituted alkene.':''),st);if(E.length>1)prPush(o,E[E.length-1].M,'Minor product','Less substituted alkene');o.why.push('Acid protonates OH to give water, which leaves to form a carbocation; loss of a β-H gives the more substituted alkene.');if(sh.how)o.why.push(`The carbocation rearranges by a 1,2-${sh.how} shift first.`);if(x.deg===1)o.why.push('Primary alcohols need harsh conditions and react by E2 on the protonated alcohol.');return[add(o)]}}
    if(has('nah','naoh','k2co3','na')&&ctx.rx){const x=al[0];const o=prOut('Williamson ether synthesis','Alkoxide + alkyl halide → ether',{lib:'williamson'});const M2=M.clone();M2.attach(x.o,ctx.rx.frag);prPush(o,M2,'Product');o.why.push('The base removes the OH proton; the alkoxide does SN2 on the alkyl halide.');if(['C(C)C','C(C)(C)C','C(C)CC'].includes(ctx.rx.frag))o.warn.push('With a secondary or tertiary alkyl halide, E2 would compete strongly.');return[add(o)]}
  }
  if(F.phenol.length&&ctx.rx&&has('naoh','k2co3','nah')){const o=prOut('Williamson ether synthesis','Phenoxide + alkyl halide → aryl ether',{lib:'williamson'});const M2=M.clone();M2.attach(F.phenol[0].o,ctx.rx.frag);prPush(o,M2,'Product');o.why.push('Phenols (pKa 10) are acidic enough to be deprotonated by NaOH or K₂CO₃; the phenoxide does SN2 on the alkyl halide.');return[add(o)]}
  /* --- epoxides --- */
  if(F.epoxide.length){const x=F.epoxide[0];const acidic=ctx.acidAny;const nu=has('naome')?'OC':has('naoet')?'OCC':has('naoh')?'O':has('nacn')?'C#N':has('nan3')?'N=[N+]=[N-]':acidic?(has('meoh')?'OC':has('etoh')?'OCC':has('hbr')?'Br':has('hcl')?'Cl':'O'):null;
    if(nu){const[more,less]=pDeg(M,x.c1)>=pDeg(M,x.c2)?[x.c1,x.c2]:[x.c2,x.c1];const at=acidic?more:less;const o=prOut(`Epoxide ring opening (${acidic?'acid':'base'})`,'Anti addition across the ring',{lib:acidic?'epoxideacid':'epoxide'});const M2=M.clone();M2.unlink(at,x.o);M2.attach(at,nu);prPush(o,M2,'Product');o.why.push(acidic?'Acid protonates the epoxide oxygen; the C–O bond to the more substituted carbon is weaker and carries more positive charge, so the nucleophile attacks there (SN1-like).':'A strong nucleophile attacks the less hindered carbon by SN2, opening the strained ring.','Attack is from the back, so the OH and the nucleophile end up anti (trans).');return[add(o)]}}
  /* --- alkyl halides and sulfonates --- */
  const LG=[...F.halide.filter(h=>!h.bad).map(h=>({c:h.c,deg:h.deg,name:M.A[h.x].el==='Br'?'bromide':M.A[h.x].el==='Cl'?'chloride':'iodide',remove:M2=>M2.kill(h.x),x:h.x})),...F.sulfonate.map(s=>({c:s.c,deg:s.deg,name:'sulfonate',remove:M2=>M2.killBranch(s.x,s.c),x:s.x}))];
  if(LG.length){
    if(has('mg')&&F.halide.length){const h=F.halide[0];const o=prOut('Grignard reagent formation','R–X + Mg → R–MgX');const M2=M.clone();M2.kill(h.x);const mg=M2.add('Mg');M2.link(h.c,mg);const x=M2.add(M.A[h.x].el);M2.link(mg,x);if(has('co2')){const M3=M.clone();M3.kill(h.x);M3.attach(h.c,'C(=O)O');o.title='Grignard carboxylation';o.type='R–X → R–COOH';prPush(o,M3,'Product (after acid workup)');o.why.push('Mg inserts into C–X to form RMgX; it adds to CO₂ to give a carboxylate, protonated in the workup.')}else{prPush(o,M2,'Product (Grignard reagent)');o.why.push('Mg inserts into the C–X bond in dry ether or THF, reversing the polarity of the carbon: it becomes a strong nucleophile and base.')}return[add(o)]}
    if(has('bu3snh')){const h=LG[0];const o=prOut('Radical dehalogenation','C–X → C–H');const M2=M.clone();h.remove(M2);prPush(o,M2,'Product');o.why.push('Bu₃Sn• abstracts the halogen to give a carbon radical, which takes H from Bu₃SnH.');return[add(o)]}
    if(has('nanh2')&&F.halide.length>=2){const[h1,h2]=F.halide;if(h1.c===h2.c||M.bond(h1.c,h2.c)>=0){const o=prOut('Double elimination','Dihalide → alkyne');const M2=M.clone();M2.kill(h1.x);M2.kill(h2.x);let a=h1.c,b=h2.c;if(a===b){b=cNbrs(M,a).find(n=>sp3(M,n.to)&&M.A[n.to].h>=2).to}M2.setO(a,b,3);prPush(o,M2,'Product');o.why.push('Two successive E2 eliminations with the very strong base NaNH₂ remove two HX to form a C≡C.');return[add(o)]}}
    const site=LG.sort((a,b)=>b.deg-a.deg)[0];const r=prSubElim(M,site,ctx,site.name);if(r){if(!r.products.length&&r.mech&&r.mech.winner==null)r.none=true;res.push(r);if(LG.length>1)r.warn.push('Only one leaving group was considered; the others would react similarly.');return res}
  }
  if(F.halide.some(h=>h.bad)&&has('naoh','naoet','naome','nacn','nan3','nai')){const o=prOut('No SN1 or SN2','Aryl and vinyl halides');o.why.push('The C–X carbon is sp², so backside attack is blocked and the cation would be very unstable. Aryl and vinyl halides don’t do SN1 or SN2 (aryl halides only react by SNAr if strongly activated by NO₂ groups).');o.none=true;res.push(o);return res}
  /* --- radical halogenation of alkanes / allylic positions --- */
  if((has('br2','cl2')&&has('light','heat'))||(has('nbs')&&(has('light','roor')||has('heat')))){const X=has('cl2')?'Cl':'Br';const C=M.A.map((a,i)=>i).filter(i=>sp3(M,i)&&M.A[i].h>=1);if(C.length){const score=i=>pDeg(M,i)+(M.nb(i).some(n=>M.A[n.to].ar)?3:0)+(cNbrs(M,i).some(n=>M.nb(n.to).some(y=>y.o===2&&isC(M,y.to)))?2.5:0);const best=C.sort((a,b)=>score(b)-score(a))[0];
    const o=prOut(has('nbs')?'Allylic/benzylic bromination (NBS)':`Radical ${X==='Br'?'bromination':'chlorination'}`,'Radical chain substitution of C–H');const M2=M.clone();M2.attach(best,X);prPush(o,M2,'Major product');o.why.push('A halogen radical removes the H that gives the most stable carbon radical (benzylic/allylic > tertiary > secondary > primary), then the radical takes X from X₂.');if(X==='Cl')o.warn.push('Chlorination is much less selective than bromination, so expect a mixture of isomers.');return[add(o)]}}
  /* --- deprotections --- */
  if(has('tbaf')){const si=M.A.map((a,i)=>i).filter(i=>M.A[i].el==='Si');if(si.length){const o=prOut('Silyl ether deprotection','TBS/TMS removed with fluoride');const M2=M.clone();for(const s of si){const oo=M.nb(s).find(n=>M.A[n.to].el==='O');if(oo)M2.killBranch(s,oo.to)}prPush(o,M2,'Product');o.why.push('Fluoride attacks silicon (the Si–F bond is very strong), releasing the alcohol.');return[add(o)]}}
  return res}
/* ---- run a prediction ---- */
function prPredict(subText,reagText){
  const sub=String(subText||'').trim();if(!sub)return{err:'Type a starting material: a name like 2-bromobutane, or a SMILES string like CC(Br)CC.'};
  let smi=null,how='';
  try{const r=nameToSmiles(sub);if(r&&r.smiles){smi=r.smiles;how='name'}}catch(e){}
  if(!smi){try{const M=PM.from(sub.replace(/\s+/g,''));if(M.A.length){smi=sub.replace(/\s+/g,'');how='smiles'}}catch(e){}}
  if(!smi)return{err:`Bondline couldn't read “${sub}” as a name or a SMILES string.`};
  if(smi.includes('.'))return{err:'Use one starting material at a time. Put the second reactant in the reagents box (e.g. “CH3MgBr” or “MeOH, H2SO4”).',smi};
  const ctx=prParse(reagText);if(!ctx.R.size&&!ctx.rm&&!ctx.rx&&!ctx.amine&&!ctx.acyl&&!ctx.ylide&&!ctx.cu&&!ctx.rmUnknown)return{err:'Type the reagents and conditions, e.g. “NaOEt, EtOH, heat” or “1. BH3·THF 2. H2O2, NaOH”.',smi};
  let M;try{M=PM.from(smi);M.fixH()}catch(e){return{err:'Bondline couldn\'t read that structure.'}}
  const F=fg(M);let res=[];try{res=prRules(M,F,ctx)}catch(e){console.warn('predictor',e);return{err:'Something went wrong predicting this reaction.',smi}}
  return{smi:prCanon(smi),name:prName(prCanon(smi)),how,ctx,res:res.filter(Boolean)}}
/* ---- dialog ---- */
const PRD={last:null};
const PR_EXAMPLES=[['2-bromo-2-methylpropane','NaOEt, EtOH, heat'],['1-bromobutane','NaCN, DMSO'],['2-bromobutane','t-BuOK'],['2-bromo-2-methylpropane','H2O'],['propene','HBr'],['3-methylbut-1-ene','HBr'],['1-methylcyclohexene','1. BH3·THF 2. H2O2, NaOH'],['cyclohexanone','NaBH4, MeOH'],['ethyl benzoate','LiAlH4, then H3O+'],['butanal','CH3MgBr, then H3O+'],['toluene','HNO3, H2SO4'],['benzene','CH3COCl, AlCl3'],['butan-1-ol','PCC, CH2Cl2'],['pent-2-yne','H2, Lindlar'],['cyclohexene','mCPBA'],['propanoic acid','EtOH, H2SO4']];
function openPredictor(){
  $('#prdScrim').hidden=false;document.body.classList.add('sk-lock');
  const sel=$('#prdFromDraw');let opts=[];
  if(App.mode==='notes'&&App.active&&App.active.d&&App.active.d.atoms.length){try{opts=analyseDrawing(App.active.d).filter(x=>x.smiles).map(x=>({smi:x.smiles,name:x.name&&x.name.name||x.smiles}))}catch(e){}}
  sel.hidden=!opts.length;sel.innerHTML='<option value="">Use a molecule from the selected drawing…</option>'+opts.map(o=>`<option value="${esc(o.smi)}">${esc(o.name)}</option>`).join('');
  $('#prdEx').innerHTML=PR_EXAMPLES.map(([s,r],i)=>`<button class="tf" data-prex="${i}">${esc(s)} + ${esc(r)}</button>`).join('');
  prdPreview();setTimeout(()=>$('#prdSub').focus(),30)}
function closePredictor(){$('#prdScrim').hidden=true;document.body.classList.remove('sk-lock')}
let prdT;function prdPreview(){clearTimeout(prdT);prdT=setTimeout(()=>{const v=$('#prdSub').value.trim(),box=$('#prdSubPrev');if(!v){box.innerHTML='<span class="hm-muted">The starting material appears here.</span>';return}
  let smi=null;try{const r=nameToSmiles(v);if(r&&r.smiles)smi=r.smiles}catch(e){}if(!smi){try{PM.from(v.replace(/\s+/g,''));smi=v.replace(/\s+/g,'')}catch(e){}}
  if(!smi){box.innerHTML='<span class="hm-muted">Not recognised yet. Try an IUPAC name (2-bromobutane) or a SMILES string (CC(Br)CC).</span>';return}
  let svg='';try{svg=smilesSVG(smi,0.9)}catch(e){}const nm=prName(prCanon(smi));box.innerHTML=`<div class="prd-mol">${svg}</div><span>${esc(nm||smi)}</span>`},200)}
function prdRun(){
  const r=prPredict($('#prdSub').value,$('#prdReag').value);PRD.last=r;const out=$('#prdOut');
  if(r.err){out.innerHTML=`<p class="prd-err">${esc(r.err)}</p>`;return}
  if(!r.res.length){out.innerHTML=`<div class="prd-card"><h3>No prediction</h3><p>Bondline doesn't know a reaction between <b>${esc(r.name||r.smi)}</b> and these reagents. It may not react, or the reaction may not be in Bondline's set yet.</p><p class="hm-muted">Bondline can predict additions to alkenes and alkynes, oxidations and reductions, Grignard and Wittig reactions, acetal and imine formation, aldol and Claisen reactions, acid derivative chemistry, aromatic substitution, alcohol reactions and SN1/SN2/E1/E2 at alkyl halides.</p></div>`;return}
  out.innerHTML=r.res.map((o,k)=>{const mech=o.mech&&o.mech.winner!==undefined?`<div class="prd-mech"><h4>Which mechanism?</h4><div class="prd-bars">${['SN2','SN1','E2','E1'].map(m=>{const v=Math.max(0,Math.min(100,o.mech.scores[m]||0));return`<div class="prd-bar${o.mech.winner===m?' win':''}"><span>${m}</span><i><b style="width:${v}%"></b></i></div>`}).join('')}</div><ul>${o.mech.reasons.map(x=>`<li>${x}</li>`).join('')}</ul></div>`:'';
    return`<div class="prd-card"><div class="prd-head"><div><h3>${esc(o.title)}</h3><span class="hm-muted">${esc(o.type)}</span></div>${o.lib&&RXN.some(x=>x.id===o.lib)?`<button class="btn small" data-prlib="${o.lib}">Mechanism ↗</button>`:''}</div>
    ${o.products.length?`<div class="prd-prods">${o.products.map((p,i)=>{let svg='';try{svg=smilesSVG(p.smi,0.95)}catch(e){}const names=p.smi.split('.').map(s=>prName(s)).filter(Boolean).map(x=>p.ez&&!/^\(/.test(x)?`(${p.ez})-${x}`:x);return`<figure class="prd-prod"><figcaption class="prd-role${i===0?' major':''}">${esc(p.label)}</figcaption><div class="prd-mol">${svg}</div><div class="prd-name">${names.length?names.map(esc).join(' + '):'<span class="hm-muted">(no name available)</span>'}</div>${p.note?`<small>${esc(p.note)}</small>`:''}<button class="btn small" data-pradd="${k}:${i}">Add to note</button></figure>`}).join('')}</div>`:''}
    ${mech}${o.why.length&&!o.mech?`<ul class="prd-why">${o.why.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}${o.mech&&o.why.length?`<ul class="prd-why">${o.why.map(x=>`<li>${x}</li>`).join('')}</ul>`:''}${o.warn.map(w=>`<p class="prd-warn">⚠ ${w}</p>`).join('')}</div>`}).join('')+`<p class="hm-muted prd-foot">Predictions follow the standard rules taught in organic chemistry courses. Real reactions can give mixtures, so check against your course notes.</p>`;
}
function prdAdd(k,i){const r=PRD.last;if(!r||!r.res[k])return;const p=r.res[k].products[i];const reag=$('#prdReag').value.trim().slice(0,48);
  let d;try{d=mechRow({steps:[{s:r.smi,r:reag},{s:p.smi}]},0,{noCurls:true}).d}catch(e){toast('Couldn\'t draw this reaction.');return}
  let n=App.mode==='notes'&&App.cur&&!App.cur.readonly?App.cur:null;
  if(!n){n={id:uid(),title:r.res[k].title,tag:'',tags:[],updated:Date.now(),blocks:[]};App.notes.push(n)}
  const b={id:uid(),type:'scheme',data:normScheme(d)};const txt={id:uid(),type:'text',html:`<p><b>${esc(r.res[k].title)}</b>: ${esc(r.name||r.smi)} → ${esc(p.smi.split('.').map(s=>prName(s)||s).join(' + '))}</p>`};
  const at=App.active&&n===App.cur?n.blocks.findIndex(x=>x.data===App.active.d):-1;if(at>=0)n.blocks.splice(at+1,0,txt,b);else n.blocks.push(txt,b);
  App.noteChanged(n);closePredictor();setMode('notes');openNoteKeep(n);const el=document.querySelector(`.block[data-id="${b.id}"]`);if(el)el.scrollIntoView({block:'center'});toast('Reaction added to the note')}
function wirePredictor(){
  $('#prdClose').onclick=closePredictor;$('#prdScrim').addEventListener('click',e=>{if(e.target.id==='prdScrim')closePredictor()});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape'||$('#prdScrim').hidden)return;e.stopPropagation();e.preventDefault();closePredictor()},true);$('#prdScrim').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('#prdSub,#prdReag')){e.preventDefault();prdRun()}});
  $('#prdSub').addEventListener('input',prdPreview);$('#prdGo').onclick=prdRun;
  $('#prdFromDraw').onchange=e=>{if(e.target.value){$('#prdSub').value=e.target.value;prdPreview()}};
  $('#prdEx').addEventListener('click',e=>{const b=e.target.closest('[data-prex]');if(!b)return;const[s,r]=PR_EXAMPLES[+b.dataset.prex];$('#prdSub').value=s;$('#prdReag').value=r;prdPreview();prdRun()});
  $('#prdOut').addEventListener('click',e=>{const a=e.target.closest('[data-pradd]');if(a){const[k,i]=a.dataset.pradd.split(':').map(Number);prdAdd(k,i);return}const l=e.target.closest('[data-prlib]');if(l){closePredictor();openLibrary(l.dataset.prlib)}});
}

/* ---------- shared notebooks: collaborators, invites, live per-block sync ---------- */
const SH={nbs:new Map(),subs:new Map(),state:new Map(),last:new Map(),pres:new Map(),invites:[],root:null,inv:null,started:false,busy:{},again:{},presNb:null,dlg:null};
const NB_ROLE={owner:'Owner',editor:'Can edit',viewer:'Can view and comment'};
const FV=()=>firebase.firestore.FieldValue;
const shUid=()=>FB.user&&FB.user.uid;
function shMe(){const u=FB.user||{};return{n:String(u.displayName||(u.email||'').split('@')[0]||'Someone').slice(0,80),e:String(u.email||'').toLowerCase().slice(0,120)}}
const shRole=nb=>{const d=SH.nbs.get(nb);return d&&d.roles?d.roles[shUid()]||null:null};
const shCanEdit=nb=>['owner','editor'].includes(shRole(nb));
const shIsOwner=nb=>shRole(nb)==='owner';
const shRef=id=>FB.db.collection('notebooks').doc(id);
const shKey=n=>Array.from(crypto.getRandomValues(new Uint8Array(n)),x=>'abcdefghijklmnopqrstuvwxyz0123456789'[x%36]).join('');
/* stable JSON so key order never makes two equal blocks look different */
function stab(v){if(Array.isArray(v))return'['+v.map(stab).join(',')+']';if(v&&typeof v==='object')return'{'+Object.keys(v).filter(k=>v[k]!==undefined).sort().map(k=>JSON.stringify(k)+':'+stab(v[k])).join(',')+'}';return JSON.stringify(v===undefined?null:v)}
function shClean(b){const t=normNote({id:'x',title:'',blocks:[JSON.parse(JSON.stringify(b))]});return t.blocks[0]}
function shSnap(n){return{title:n.title,tags:stab(noteTags(n)),comments:stab(n.comments||[]),blocks:new Map(n.blocks.map((b,i)=>[b.id,{j:stab(b),pos:i}]))}}
function shErr(e){setStatus('err');const c=e&&e.code||'';toast(c==='permission-denied'?'You don\'t have permission to change that. Ask the notebook\'s owner.':c==='resource-exhausted'||c==='invalid-argument'?'That shared note is too large to save. Split it into smaller notes.':'Couldn\'t save to the shared notebook. Your changes are kept on this device.');console.warn('shared',e)}
/* ---- start listening once signed in ---- */
function shStart(){
  if(SH.started||Store.mode!=='cloud'||!FB.user||!FB.db)return;SH.started=true;
  SH.root=FB.db.collection('notebooks').where('memberIds','array-contains',shUid()).onSnapshot(snap=>{
    const seen=new Set();snap.forEach(doc=>{seen.add(doc.id);SH.nbs.set(doc.id,{id:doc.id,...doc.data()});shListen(doc.id)});
    for(const id of[...SH.nbs.keys()])if(!seen.has(id))shDrop(id);
    if(App.cur&&App.cur.nb&&App.mode==='notes')shAfterOpen();renderFolders();renderList();if(SH.dlg)renderNotebook();
  },e=>{console.warn('notebooks',e);SH.started=false});
  if(FB.user.email&&FB.user.emailVerified){SH.inv=FB.db.collection('notebooks').where('inviteEmails','array-contains',FB.user.email.toLowerCase()).onSnapshot(snap=>{SH.invites=snap.docs.map(d=>({id:d.id,...d.data()})).filter(d=>!SH.nbs.has(d.id));renderFolders()},()=>{})}
  shCheckJoin();
}
function shListen(nb){if(SH.subs.has(nb))return;const st={notes:new Map(),blocks:new Map(),ready:0};SH.state.set(nb,st);const ref=shRef(nb),subs=[];
  const lost=e=>{if(e&&e.code==='permission-denied')shDrop(nb)};
  subs.push(ref.collection('notes').onSnapshot(snap=>{const ch=new Set();snap.docChanges().forEach(c=>{if(c.type==='removed')st.notes.delete(c.doc.id);else st.notes.set(c.doc.id,c.doc.data());ch.add(c.doc.id)});st.ready|=1;shApply(nb,ch)},lost));
  subs.push(ref.collection('blocks').onSnapshot(snap=>{const ch=new Set();snap.docChanges().forEach(c=>{const d=c.doc.data()||{};const note=c.type==='removed'?(st.blocks.get(c.doc.id)||d).note:d.note;if(c.type==='removed')st.blocks.delete(c.doc.id);else st.blocks.set(c.doc.id,d);if(note)ch.add(note)});st.ready|=2;shApply(nb,ch)},lost));
  subs.push(ref.collection('presence').onSnapshot(snap=>{const m=new Map();snap.forEach(d=>m.set(d.id,d.data()));SH.pres.set(nb,m);shPresenceUI()},()=>{}));
  SH.subs.set(nb,subs)}
function shDrop(nb){(SH.subs.get(nb)||[]).forEach(u=>{try{u()}catch(e){}});SH.subs.delete(nb);SH.state.delete(nb);SH.pres.delete(nb);const had=SH.nbs.delete(nb);
  const gone=App.notes.filter(n=>n.nb===nb);if(gone.length){App.notes=App.notes.filter(n=>n.nb!==nb);gone.forEach(n=>SH.last.delete(n.id));if(App.cur&&App.cur.nb===nb){openNote(null);toast('You no longer have access to that shared notebook.')}}
  if(VIEW.folder==='nb:'+nb)VIEW.folder='all';if(had||gone.length){renderFolders();renderList()}}
/* ---- remote → local ---- */
function shApply(nb,ids){const st=SH.state.get(nb);if(!st||st.ready!==3)return;
  if(!st.init){st.init=true;ids=new Set([...st.notes.keys(),...App.notes.filter(n=>n.nb===nb).map(n=>n.id)])}
  let list=false;
  for(const id of ids){const meta=st.notes.get(id);const i=App.notes.findIndex(x=>x.id===id);let n=i>=0?App.notes[i]:null;
    if(!meta){if(n&&n.nb===nb&&SH.last.has(id)){App.notes.splice(i,1);SH.last.delete(id);list=true;if(App.cur===n){openNote(null);toast('Someone deleted this note from the shared notebook.')}}continue}
    const rb=[...st.blocks.entries()].filter(([,v])=>v.note===id&&v.b).map(([k,v])=>({id:k,...v})).sort((a,b)=>(a.pos-b.pos)||(a.u-b.u));
    const R={title:String(meta.title||'').slice(0,500),tags:Array.isArray(meta.tags)?meta.tags.map(String).slice(0,20):[],comments:Array.isArray(meta.comments)?meta.comments:[],updated:+meta.updated||Date.now(),by:meta.by,blocks:rb.map(b=>shClean({...b.b,id:b.id}))};
    if(!n){n=normNote({id,title:R.title,tags:R.tags,tag:R.tags[0]||'',comments:R.comments,updated:R.updated,blocks:R.blocks});n.nb=nb;App.notes.push(n);SH.last.set(id,shSnap(n));list=true;continue}
    if(n.nb!==nb)n.nb=nb;shMerge(n,R);list=true}
  if(list){renderList();renderFolders()}}
function shMerge(n,R){
  const L=SH.last.get(n.id)||{title:null,tags:null,comments:null,blocks:new Map()};
  const ae=document.activeElement,inPage=App.cur===n&&ae&&ae.closest&&ae.closest('#notesPage');
  const focusId=inPage&&ae.closest('.block')?ae.closest('.block').dataset.id:null,titleFocus=inPage&&ae.id==='noteTitle';
  const loc=new Map(n.blocks.map(b=>[b.id,b])),out=[],changed=new Set();
  for(const rb of R.blocks){const lb=loc.get(rb.id),was=L.blocks.get(rb.id);
    if(lb&&((was&&was.j!==stab(lb))||(!was&&L.title!==null&&stab(lb)!==stab(rb))||rb.id===focusId)){out.push(lb);continue}/* local edits not saved yet, or you're typing in it: keep yours */
    if(lb&&stab(lb)===stab(rb)){out.push(lb);continue}
    changed.add(rb.id);out.push(rb)}
  n.blocks.forEach((b,i)=>{if(R.blocks.some(r=>r.id===b.id))return;const was=L.blocks.get(b.id);
    if(was&&was.j===stab(b)&&b.id!==focusId){changed.add(b.id);return}/* deleted by someone else */
    const prev=i>0?n.blocks[i-1].id:null;const at=prev?out.findIndex(x=>x.id===prev)+1:0;out.splice(Math.max(0,at),0,b)});
  const metaCh={};
  if(!titleFocus&&(L.title===null||n.title===L.title)&&n.title!==R.title){n.title=R.title;metaCh.title=1}
  if((L.tags===null||stab(noteTags(n))===L.tags)&&stab(noteTags(n))!==stab(R.tags)){n.tags=R.tags;n.tag=R.tags[0]||'';metaCh.tags=1}
  if((L.comments===null||stab(n.comments||[])===L.comments)&&stab(n.comments||[])!==stab(R.comments)){n.comments=R.comments;metaCh.comments=1}
  const order=out.map(b=>b.id).join()!==n.blocks.map(b=>b.id).join();
  n.blocks=out;n.updated=Math.max(n.updated||0,R.updated);
  SH.last.set(n.id,{title:R.title,tags:stab(R.tags),comments:stab(R.comments),blocks:new Map(R.blocks.map((b,i)=>[b.id,{j:stab(b),pos:i}]))});
  if(App.cur===n&&App.mode==='notes'&&(changed.size||order||Object.keys(metaCh).length))shPatchOpen(n,changed,focusId,metaCh)}
function shPatchOpen(n,changed,focusId,metaCh){
  const ae=document.activeElement;if(!(ae&&ae.closest&&ae.closest('#notesPage'))){openNoteKeep(n);return}
  const ti=$('#noteTitle');if(ti&&ae!==ti&&ti.value!==n.title){ti.value=n.title;ti.style.height='auto';ti.style.height=ti.scrollHeight+'px'}
  const box=$('#blocks');
  [...box.children].forEach(sec=>{if(sec.classList.contains('block')&&!n.blocks.some(b=>b.id===sec.dataset.id)&&sec.dataset.id!==focusId)sec.remove()});
  let prev=null;
  for(const b of n.blocks){let sec=[...box.children].find(s=>s.dataset&&s.dataset.id===b.id);
    if(sec&&changed.has(b.id)&&b.id!==focusId){const ns=blockEl(b,n);sec.replaceWith(ns);sec=ns}
    else if(!sec){sec=blockEl(b,n);if(prev)prev.after(sec);else box.prepend(sec)}
    else if(b.id!==focusId&&sec!==(prev?prev.nextElementSibling:box.firstElementChild)){if(prev)prev.after(sec);else box.prepend(sec)}
    prev=sec}
  App.editors=App.editors.filter(e=>e.host.isConnected);App.sketches=(App.sketches||[]).filter(s=>s.host.isConnected);App.decks=(App.decks||[]).filter(d=>d.host.isConnected);
  if(App.active&&!App.active.host.isConnected)App.setActive(null);
  if(metaCh&&metaCh.comments&&CM.open)renderComments();syncCmtButton();markCommentSpans();refreshOutline();if(n.readonly)shApplyRO(n)}
/* ---- local → remote ---- */
async function shSave(n){
  const nb=n.nb,id=n.id;if(!nb||!FB.db||!FB.user)return;if(!shRole(nb)){setStatus('err');return}
  if(SH.busy[id]){SH.again[id]=true;return}SH.busy[id]=true;
  try{const ref=shRef(nb),L=SH.last.get(id)||{title:null,tags:null,comments:null,blocks:new Map()},me=shUid(),now=Date.now(),can=shCanEdit(nb),isNew=L.title===null;
    const meta={},w=[];
    if(can&&(isNew||n.title!==L.title))meta.title=String(n.title||'').slice(0,500);
    if(can&&(isNew||stab(noteTags(n))!==L.tags))meta.tags=noteTags(n).slice(0,20);
    if(isNew||stab(n.comments||[])!==L.comments)meta.comments=JSON.parse(JSON.stringify(n.comments||[]));
    const nextBlocks=new Map(L.blocks);
    if(can){n.blocks.forEach((b,i)=>{const x=L.blocks.get(b.id),j=stab(b);if(!x||x.j!==j||x.pos!==i){const{id:_,...body}=b;w.push(ref.collection('blocks').doc(b.id).set(JSON.parse(JSON.stringify({note:id,pos:i,b:body,u:now,by:me}))));nextBlocks.set(b.id,{j,pos:i})}});
      for(const bid of L.blocks.keys())if(!n.blocks.some(b=>b.id===bid)){w.push(ref.collection('blocks').doc(bid).delete());nextBlocks.delete(bid)}}
    if(Object.keys(meta).length||w.length){meta.updated=now;meta.by=me;w.unshift(ref.collection('notes').doc(id).set(meta,{merge:true}))}
    SH.last.set(id,{title:can?n.title:L.title,tags:can?stab(noteTags(n)):L.tags,comments:stab(n.comments||[]),blocks:nextBlocks});
    if(!w.length){setStatus('cloud');return}
    if(!navigator.onLine){Promise.all(w).then(()=>setStatus('cloud')).catch(shErr);setStatus('offline');return}
    await Promise.all(w);setStatus('cloud')}
  catch(e){SH.last.delete(id);shErr(e)}
  finally{SH.busy[id]=false;if(SH.again[id]){SH.again[id]=false;shSave(n)}}}
async function shDeleteDocs(nb,n){const ref=shRef(nb),ids=new Set([...(SH.last.get(n.id)||{blocks:new Map()}).blocks.keys(),...n.blocks.map(b=>b.id)]);
  const st=SH.state.get(nb);if(st)for(const[k,v]of st.blocks)if(v.note===n.id)ids.add(k);
  await Promise.all([...ids].map(b=>ref.collection('blocks').doc(b).delete()));await ref.collection('notes').doc(n.id).delete()}
/* ---- moving notes in and out ---- */
async function shMoveIn(n,nb,quiet){
  if(!SH.nbs.has(nb))return;if(!shCanEdit(nb)){toast('You can only view that notebook, so you can\'t add notes to it.');return}if(n.nb===nb)return;
  if(n.nb&&!shCanEdit(n.nb)){toast('You can only view the notebook this note is in.');return}
  clearTimeout(saveT[n.id]);const old=n.nb;
  if(old){try{await shDeleteDocs(old,n)}catch(e){shErr(e);return}}
  else if(Store.mode==='cloud'&&!n.example)Store.remove(n.id).catch(()=>{});
  delete n.folder;delete n.pinned;delete n.share;delete n.example;n.nb=nb;SH.last.delete(n.id);persistLocal();await shSave(n);
  renderFolders();renderList();if(App.cur===n)openNoteKeep(n);if(!quiet)toast(`Moved to “${SH.nbs.get(nb).name}”. Everyone in the notebook can see it now.`)}
async function shMoveOut(n,folder){const nb=n.nb,name=(SH.nbs.get(nb)||{}).name||'the notebook';
  try{await shDeleteDocs(nb,n)}catch(e){shErr(e);return}
  delete n.nb;delete n.readonly;SH.last.delete(n.id);n.folder=folder||'';App.noteChanged(n);renderFolders();renderList();if(App.cur===n)openNoteKeep(n);toast(`Moved to your own notes and removed from “${name}” for everyone.`)}
function shCopyOut(n){const c=normNote(JSON.parse(JSON.stringify({...n,id:uid(),title:(n.title||'Untitled note')+' (copy)',updated:Date.now(),comments:[]})));delete c.nb;delete c.readonly;delete c.share;App.notes.push(c);App.noteChanged(c);openNote(c.id);toast('Saved a copy to your own notes')}
/* ---- presence ---- */
function shPresence(){if(!SH.started||!FB.user)return;const n=App.cur,nb=n&&n.nb&&App.mode==='notes'?n.nb:null,me=shUid();
  if(SH.presNb&&SH.presNb!==nb&&SH.nbs.has(SH.presNb))shRef(SH.presNb).collection('presence').doc(me).delete().catch(()=>{});
  SH.presNb=nb;if(nb)shRef(nb).collection('presence').doc(me).set({note:n.id,at:Date.now(),n:shMe().n}).catch(()=>{});shPresenceUI()}
function shPresenceUI(){const box=$('#shPres');if(!box)return;const n=App.cur;if(!n||!n.nb){box.innerHTML='';return}const m=SH.pres.get(n.nb),me=shUid(),now=Date.now();
  const who=m?[...m.entries()].filter(([k,v])=>k!==me&&v&&v.note===n.id&&now-(+v.at||0)<100000).map(([,v])=>String(v.n||'Someone')):[];
  box.innerHTML=who.slice(0,4).map(nm=>`<span class="sh-av" title="${esc(nm)} is viewing this note">${esc((nm.trim()[0]||'?').toUpperCase())}</span>`).join('')+(who.length?`<span class="sh-here">${who.length===1?esc(who[0])+' is here':who.length+' others here'}</span>`:'')}
setInterval(()=>{if(document.visibilityState==='visible'&&App.cur&&App.cur.nb)shPresence()},45000);
addEventListener('pagehide',()=>{if(SH.presNb&&FB.user)shRef(SH.presNb).collection('presence').doc(shUid()).delete().catch(()=>{})});
/* ---- note header for shared notes; read-only for viewers ---- */
function shApplyRO(n){const ro=!!(n&&n.nb&&!shCanEdit(n.nb));n.readonly=ro;$('#notesPage').classList.toggle('ro',ro);if(!ro)return;
  document.querySelectorAll('#blocks .text-body').forEach(b=>{b.contentEditable='false';b.removeAttribute('role')});const ti=$('#noteTitle');if(ti)ti.readOnly=true;const fs=$('#noteFolder');if(fs)fs.disabled=true;const tg=$('#noteTags input');if(tg)tg.disabled=true;App.setActive(null)}
function shAfterOpen(){const page=$('#notesPage');if(!page)return;page.classList.remove('ro');page.classList.toggle('sh-on',!!(App.cur&&App.cur.nb));const old=$('#shBar');if(old)old.remove();const n=App.cur;
  if(!n||!n.nb){if(n)delete n.readonly;shPresence();return}
  const nb=SH.nbs.get(n.nb),role=shRole(n.nb)||'viewer',ro=!shCanEdit(n.nb);
  const bar=document.createElement('div');bar.className='sh-bar';bar.id='shBar';
  bar.innerHTML=`<span class="sh-nb"><span aria-hidden="true">👥</span> ${esc(nb?nb.name:'Shared notebook')}</span><span class="sh-role">${esc(NB_ROLE[role]||'')}</span><span class="sh-pres" id="shPres" aria-live="polite"></span><span class="np-sp"></span>${ro?'<button class="btn small" data-shcopy="1">Copy to my notes</button>':''}<button class="btn small" data-shmanage="1">People</button>`;
  const head=$('#noteHead .note-head');if(head)head.prepend(bar);
  bar.onclick=e=>{if(e.target.closest('[data-shcopy]'))shCopyOut(n);else if(e.target.closest('[data-shmanage]'))openNotebook(n.nb)};
  const fs=$('#noteFolder');if(fs)fs.value='nb:'+n.nb;
  const sb=$('#shareBtn');if(sb)sb.hidden=true;const del=$('#delNote');if(del)del.hidden=ro;
  shApplyRO(n);shPresence()}
/* ---- joining: invite links and email invitations ---- */
function shPendingJoin(){const m=/[#&]join=([a-z0-9]{20,40})/.exec(location.hash);if(m){try{localStorage.setItem('bondline.pendingJoin',m[1])}catch(e){}history.replaceState(null,'',location.pathname+location.search)}try{return localStorage.getItem('bondline.pendingJoin')}catch(e){return null}}
async function shCheckJoin(){const key=shPendingJoin();if(!key)return;
  if(!FB.cfg){toast('Shared notebooks need the installed Bondline app with sign-in.');try{localStorage.removeItem('bondline.pendingJoin')}catch(e){}return}
  if(!(Store.mode==='cloud'&&FB.user)){nbDialog(`<h2 id="nbTitle">Join a shared notebook</h2><p>Someone has invited you to a shared notebook in Bondline. Sign in (or create a free account) to join it.</p><div class="np-row"><span class="np-sp"></span><button class="btn" data-nb="close">Not now</button><button class="btn primary" data-nb="signin">Sign in</button></div>`);return}
  let inv=null;try{const d=await FB.db.collection('invites').doc(key).get();inv=d.exists?d.data():null}catch(e){}
  try{localStorage.removeItem('bondline.pendingJoin')}catch(e){}
  if(!inv||!inv.on){nbDialog(`<h2 id="nbTitle">This invite link doesn't work</h2><p>The link may have been turned off by the notebook's owner. Ask them for a new one.</p><div class="np-row"><span class="np-sp"></span><button class="btn primary" data-nb="close">OK</button></div>`);return}
  if(SH.nbs.has(inv.nb)){closeNotebook();shShowNb(inv.nb);toast(`You're already in “${inv.name}”`);return}
  nbDialog(`<h2 id="nbTitle">Join “${esc(inv.name)}”?</h2><p><b>${esc(inv.from||'Someone')}</b> invited you to this shared notebook. You'll be able to <b>${inv.role==='editor'?'view and edit':'view and comment on'}</b> its notes, and the other members will see your name.</p><div class="np-row"><span class="np-sp"></span><button class="btn" data-nb="close">Not now</button><button class="btn primary" data-nbjoinkey="${esc(key)}" data-nbid="${esc(inv.nb)}" data-role="${inv.role==='editor'?'editor':'viewer'}">Join notebook</button></div>`)}
async function shJoinLink(key,nb,role){const me=shUid(),F=FV();try{await shRef(nb).update({['roles.'+me]:role,['people.'+me]:shMe(),memberIds:F.arrayUnion(me),joinKey:key});closeNotebook();toast('Joined the shared notebook');setTimeout(()=>shShowNb(nb),800)}catch(e){shErr(e)}}
async function shJoinEmail(nb){const me=shUid(),F=FV(),inv=SH.invites.find(x=>x.id===nb),em=shMe().e;if(!inv)return;const role=(inv.inviteEditors||[]).includes(em)?'editor':'viewer';
  try{await shRef(nb).update({['roles.'+me]:role,['people.'+me]:shMe(),memberIds:F.arrayUnion(me),inviteEmails:F.arrayRemove(em),inviteEditors:F.arrayRemove(em)});SH.invites=SH.invites.filter(x=>x.id!==nb);toast(`Joined “${inv.name}”`);setTimeout(()=>shShowNb(nb),800)}catch(e){shErr(e)}}
async function shDecline(nb){const F=FV(),em=shMe().e;try{await shRef(nb).update({inviteEmails:F.arrayRemove(em),inviteEditors:F.arrayRemove(em)});SH.invites=SH.invites.filter(x=>x.id!==nb);renderFolders();toast('Invitation declined')}catch(e){shErr(e)}}
function shShowNb(nb){VIEW.folder='nb:'+nb;VIEW.tag=null;if(App.mode!=='notes'&&App.mode!=='home')setMode('notes');renderFolders();renderList();if(innerWidth<=820)$('#side').classList.add('open')}
/* ---- creating and managing notebooks ---- */
function nbDialog(html){$('#nbBody').innerHTML=html;$('#nbScrim').hidden=false;SH.dlg=SH.dlg||{};const f=$('#nbBody').querySelector('input:not([type=hidden]),button.primary');if(f)setTimeout(()=>f.focus(),40)}
function closeNotebook(){$('#nbScrim').hidden=true;SH.dlg=null}
function shNeedSignIn(){if(!FB.cfg){toast('Shared notebooks need the installed Bondline app with sign-in.');return true}if(!(Store.mode==='cloud'&&FB.user)){nbDialog(`<h2 id="nbTitle">Sign in to share</h2><p>Shared notebooks are stored in your Bondline account, so you and the people you invite need to be signed in.</p><div class="np-row"><span class="np-sp"></span><button class="btn" data-nb="close">Not now</button><button class="btn primary" data-nb="signin">Sign in</button></div>`);return true}return false}
function newNotebook(){if(shNeedSignIn())return;SH.dlg={mode:'new'};nbDialog(`<h2 id="nbTitle">New shared notebook</h2><p class="hm-muted">A shared notebook is a folder you share with classmates or colleagues. Everyone in it sees the same notes, and changes appear live.</p><label class="nb-f">Name<input id="nbName" maxlength="100" placeholder="e.g. Organic chemistry study group"></label><div class="np-row"><span class="np-sp"></span><button class="btn" data-nb="close">Cancel</button><button class="btn primary" data-nb="create">Create</button></div>`)}
async function shCreate(){const name=($('#nbName').value||'').trim().slice(0,100);if(!name){$('#nbName').focus();return}const me=shUid(),id=shKey(20);
  try{await shRef(id).set({name,owner:me,roles:{[me]:'owner'},people:{[me]:shMe()},memberIds:[me],inviteEmails:[],inviteEditors:[],at:Date.now()});SH.nbs.set(id,{id,name,owner:me,roles:{[me]:'owner'},people:{[me]:shMe()},memberIds:[me],inviteEmails:[],inviteEditors:[]});shListen(id);shShowNb(id);openNotebook(id);toast(`Created “${name}”. Invite people below.`)}catch(e){shErr(e)}}
function openNotebook(nb){if(!SH.nbs.has(nb))return;SH.dlg={mode:'manage',nb};renderNotebook();$('#nbScrim').hidden=false}
function shLink(key){return location.origin+location.pathname.replace(/index\.html$/,'')+'#join='+key}
function renderNotebook(){const D=SH.dlg;if(!D||D.mode!=='manage')return;const d=SH.nbs.get(D.nb);if(!d){closeNotebook();return}const own=shIsOwner(D.nb),me=shUid(),people=d.people||{},roles=d.roles||{};
  const ppl=(d.memberIds||[]).map(u=>({u,p:people[u]||{n:'Member',e:''},r:roles[u]||'viewer'})).sort((a,b)=>(a.r==='owner'?-1:b.r==='owner'?1:0)||String(a.p.n).localeCompare(String(b.p.n)));
  const inv=(d.inviteEmails||[]).map(e=>({e,r:(d.inviteEditors||[]).includes(e)?'editor':'viewer'}));
  const verifyNote=FB.user&&FB.user.email&&!FB.user.emailVerified?`<p class="nb-note">Your email address isn't verified yet, so you won't see email invitations others send you. <button class="linkbtn" data-nb="verify">Send a verification email</button></p>`:'';
  $('#nbBody').innerHTML=`<div class="nb-head">${own?`<input class="nb-title-in" id="nbRename" value="${esc(d.name)}" maxlength="100" aria-label="Notebook name">`:`<h2 id="nbTitle">${esc(d.name)}</h2>`}<span class="sh-role">${esc(NB_ROLE[roles[me]]||'')}</span></div>
   <section class="nb-sec"><h3>People (${ppl.length})</h3><div class="nb-ppl">${ppl.map(x=>`<div class="nb-p"><span class="acct-av sm" aria-hidden="true">${esc((String(x.p.n).trim()[0]||'?').toUpperCase())}</span><span class="nb-who"><b>${esc(x.p.n)}${x.u===me?' (you)':''}</b><small>${esc(x.p.e||'')}</small></span>${own&&x.r!=='owner'?`<select data-nbrole="${esc(x.u)}" aria-label="Role for ${esc(x.p.n)}"><option value="editor"${x.r==='editor'?' selected':''}>Can edit</option><option value="viewer"${x.r==='viewer'?' selected':''}>Can view</option></select><button class="linkbtn danger" data-nbkick="${esc(x.u)}">Remove</button>`:`<span class="nb-r">${esc(NB_ROLE[x.r]||'')}</span>`}</div>`).join('')}</div></section>
   ${own?`<section class="nb-sec"><h3>Invite by email</h3><p class="hm-muted">They'll see the invitation in their sidebar after signing in to Bondline with this email. Bondline doesn't send an email, so let them know.</p><div class="nb-inv-row"><input id="nbEmail" type="email" placeholder="name@example.com" aria-label="Email address"><select id="nbEmailRole" aria-label="Role"><option value="editor">Can edit</option><option value="viewer">Can view</option></select><button class="btn primary" data-nb="invite">Invite</button></div>${inv.length?`<div class="nb-pending">${inv.map(x=>`<div class="nb-p"><span class="nb-who"><b>${esc(x.e)}</b><small>Invited · ${x.r==='editor'?'can edit':'can view'}</small></span><button class="linkbtn danger" data-nbuninvite="${esc(x.e)}">Cancel</button></div>`).join('')}</div>`:''}</section>
   <section class="nb-sec"><h3>Invite link</h3>${d.linkKey?`<p class="hm-muted">Anyone signed in who opens this link can join as <b>${(d.linkRole||'editor')==='editor'?'an editor':'a viewer'}</b>.</p><div class="sh-link"><input readonly value="${esc(shLink(d.linkKey))}" aria-label="Invite link"><button class="btn small" data-nb="copy">Copy</button></div><button class="linkbtn danger" data-nb="linkoff">Turn off this link</button>`:`<p class="hm-muted">Make a link you can send in a group chat. Anyone signed in who opens it can join.</p><div class="nb-inv-row"><select id="nbLinkRole" aria-label="Role for people who join with the link"><option value="editor">People who join can edit</option><option value="viewer">People who join can only view</option></select><button class="btn" data-nb="link">Create link</button></div>`}</section>`:''}
   ${verifyNote}
   <div class="np-row nb-foot">${own?'<button class="linkbtn danger" data-nb="delete">Delete notebook</button>':'<button class="linkbtn danger" data-nb="leave">Leave notebook</button>'}<span class="np-sp"></span><button class="btn primary" data-nb="close">Done</button></div>`}
async function nbAction(e){const t=e.target;const F=()=>FV();const D=SH.dlg||{},nb=D.nb,ref=nb?shRef(nb):null;
  const a=t.closest('[data-nb]');const k=a&&a.dataset.nb;
  try{
    if(k==='close'){closeNotebook();return}
    if(k==='signin'){closeNotebook();if(typeof openAuth==='function')openAuth('in');return}
    if(k==='create'){a.disabled=true;await shCreate();a.disabled=false;return}
    if(k==='verify'){await FB.user.sendEmailVerification();toast('Verification email sent. Open the link in it, then sign in again.');return}
    if(k==='invite'){const em=($('#nbEmail').value||'').trim().toLowerCase(),role=$('#nbEmailRole').value;if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){toast('Type a valid email address');$('#nbEmail').focus();return}
      await ref.update({inviteEmails:F().arrayUnion(em),inviteEditors:role==='editor'?F().arrayUnion(em):F().arrayRemove(em)});toast(`Invited ${em}. Let them know to sign in to Bondline with that email.`);return}
    if(k==='link'){const key=shKey(28),role=$('#nbLinkRole').value==='viewer'?'viewer':'editor',d=SH.nbs.get(nb);a.disabled=true;
      await FB.db.collection('invites').doc(key).set({nb,role,by:shUid(),name:String(d.name).slice(0,100),from:shMe().n,on:true,at:Date.now()});await ref.update({linkKey:key,linkRole:role});return}
    if(k==='copy'){const v=$('#nbBody .sh-link input').value;try{await navigator.clipboard.writeText(v);toast('Invite link copied')}catch(err){$('#nbBody .sh-link input').select();toast('Press Ctrl+C to copy the link')}return}
    if(k==='linkoff'){const d=SH.nbs.get(nb);if(!a.classList.contains('armed')){a.classList.add('armed');a.textContent='Click again to turn the link off';return}if(d.linkKey)await FB.db.collection('invites').doc(d.linkKey).delete().catch(()=>{});await ref.update({linkKey:F().delete(),linkRole:F().delete()});toast('The invite link no longer works');return}
    if(k==='leave'){if(!a.classList.contains('armed')){a.classList.add('armed');a.textContent='Click again to leave';return}const me=shUid();await ref.collection('presence').doc(me).delete().catch(()=>{});await ref.update({['roles.'+me]:F().delete(),['people.'+me]:F().delete(),memberIds:F().arrayRemove(me)});closeNotebook();shDrop(nb);toast('You left the notebook');return}
    if(k==='delete'){if(!a.classList.contains('armed')){a.classList.add('armed');a.textContent='Delete it and all its notes for everyone? Click again';return}a.disabled=true;
      const d=SH.nbs.get(nb);for(const col of['blocks','notes','presence']){const s=await ref.collection(col).get();await Promise.all(s.docs.map(x=>x.ref.delete()))}if(d.linkKey)await FB.db.collection('invites').doc(d.linkKey).delete().catch(()=>{});await ref.delete();closeNotebook();shDrop(nb);toast(`Deleted “${d.name}”`);return}
    const kick=t.closest('[data-nbkick]');if(kick){if(!kick.classList.contains('armed')){kick.classList.add('armed');kick.textContent='Click again to remove';return}const u=kick.dataset.nbkick;await ref.update({['roles.'+u]:F().delete(),['people.'+u]:F().delete(),memberIds:F().arrayRemove(u)});toast('Removed from the notebook');return}
    const un=t.closest('[data-nbuninvite]');if(un){const em=un.dataset.nbuninvite;await ref.update({inviteEmails:F().arrayRemove(em),inviteEditors:F().arrayRemove(em)});return}
    const jk=t.closest('[data-nbjoinkey]');if(jk){jk.disabled=true;await shJoinLink(jk.dataset.nbjoinkey,jk.dataset.nbid,jk.dataset.role);return}
  }catch(err){shErr(err);if(a)a.disabled=false}}
/* ---- sidebar section ---- */
function shSideHTML(){if(!FB.cfg)return'';const signed=Store.mode==='cloud'&&FB.user;const nbs=[...SH.nbs.values()].sort((a,b)=>String(a.name).localeCompare(String(b.name)));
  const cnt=id=>App.notes.filter(n=>n.nb===id).length;
  return`<div class="fd-sec"><span>Shared</span><button class="org-add" data-nbnew="1" title="New shared notebook" aria-label="New shared notebook">+</button></div>`
    +nbs.map(d=>`<div class="fd-item fd-nb${VIEW.folder==='nb:'+d.id?' on':''}" data-folder="nb:${esc(d.id)}" tabindex="0" role="treeitem"><span class="fd-tw"></span><span class="fd-ic" aria-hidden="true">👥</span><span class="fd-name">${esc(d.name)}</span><span class="fd-n">${cnt(d.id)||''}</span><button class="fd-more" data-nbmenu="${esc(d.id)}" aria-label="Options for ${esc(d.name)}">⋯</button></div>`).join('')
    +SH.invites.map(d=>`<div class="fd-inv"><span><b>${esc(d.name)}</b><small>Invitation from ${esc(((d.people||{})[d.owner]||{}).n||'someone')}</small></span><span class="fd-inv-b"><button class="btn small primary" data-nbjoin="${esc(d.id)}">Join</button><button class="linkbtn" data-nbdecline="${esc(d.id)}">Decline</button></span></div>`).join('')
    +(!nbs.length&&!SH.invites.length?`<button class="fd-hint" data-nbnew="1">${signed?'Share a notebook with classmates':'Sign in to share notebooks'}</button>`:'')}
function shMenu(nb,anchor){closeFolderMenu();const own=shIsOwner(nb),can=shCanEdit(nb);const m=document.createElement('div');m.className='fd-menu';m.setAttribute('role','menu');
  m.innerHTML=`<button data-nbm="people">People and invites</button>${can?'<button data-nbm="note">New note here</button>':''}<button data-nbm="${own?'manage':'leave'}" class="danger">${own?'Delete or rename…':'Leave notebook…'}</button>`;
  document.body.appendChild(m);const r=anchor.getBoundingClientRect();m.style.left=Math.min(innerWidth-200,r.left)+'px';m.style.top=(r.bottom+4)+'px';App.fmenu=m;
  m.addEventListener('click',e=>{const b=e.target.closest('[data-nbm]');if(!b)return;closeFolderMenu();const k=b.dataset.nbm;if(k==='note'){VIEW.folder='nb:'+nb;newNote()}else openNotebook(nb)})}
/* ---- hooks into the rest of the app ---- */
const _renderFolders=renderFolders;renderFolders=function(){_renderFolders();const box=$('#folderTree');if(box&&FB.cfg)box.insertAdjacentHTML('beforeend',shSideHTML());
  if(VIEW.folder.startsWith('nb:')){const d=SH.nbs.get(VIEW.folder.slice(3)),lbl=$('#viewLabel');if(lbl)lbl.innerHTML=`<span aria-hidden="true">👥</span> ${esc(d?d.name:'Shared notebook')}`+(VIEW.tag?` · <span class="tag">${esc(VIEW.tag)}</span> <button class="linkbtn" data-cleartag="1" aria-label="Clear tag filter">✕</button>`:'')}};
const _inView=inView;inView=function(n){if(VIEW.folder.startsWith('nb:')){if(VIEW.tag&&!noteTags(n).includes(VIEW.tag))return false;return n.nb===VIEW.folder.slice(3)}if(n.nb&&VIEW.folder!=='all'&&VIEW.folder!=='pinned')return false;return _inView(n)};
const _flush=flush;flush=async function(id){const n=App.notes.find(x=>x.id===id);if(n&&n.nb){persistLocal();try{snapshot(n,false,'')}catch(e){}return shSave(n)}return _flush(id)};
const _persistLocal=persistLocal;persistLocal=function(){const all=App.notes;App.notes=all.filter(n=>!n.nb);try{return _persistLocal()}finally{App.notes=all}};
const _trashNote=trashNote;trashNote=function(n){if(!n.nb)return _trashNote(n);if(!shCanEdit(n.nb)){toast('Only editors can delete notes in this notebook.');return}
  const nb=n.nb,name=(SH.nbs.get(nb)||{}).name||'the notebook';const copy=normNote(JSON.parse(JSON.stringify(n)));delete copy.nb;delete copy.readonly;copy.id=uid();
  App.notes=App.notes.filter(x=>x!==n);copy.deleted=Date.now();copy.updated=copy.deleted;App.trash.unshift(copy);if(Store.mode==='cloud')Store.save(copy).catch(()=>{});persistLocal();
  shDeleteDocs(nb,n).catch(shErr);SH.last.delete(n.id);
  const next=sortedNotes(App.notes.filter(inView))[0]||sortedNotes(App.notes.slice())[0];openNote(next?next.id:null);renderTrashLink();renderFolders();
  toastAction(`Deleted from “${name}” for everyone. A copy is in your Trash.`,'Undo',()=>{App.trash=App.trash.filter(x=>x!==copy);if(Store.mode==='cloud')Store.remove(copy.id).catch(()=>{});n.nb=nb;App.notes.push(n);SH.last.delete(n.id);shSave(n);persistLocal();renderTrashLink();renderFolders();openNote(n.id)})};
const _moveNote=moveNote;moveNote=function(n,folder){folder=folder||'';if(folder.startsWith('nb:'))return shMoveIn(n,folder.slice(3));if(n.nb){if(!shCanEdit(n.nb)){toast('Only editors can move notes out of a shared notebook. Use “Copy to my notes” instead.');return}return shMoveOut(n,folder)}return _moveNote(n,folder)};
const _folderOptions=folderOptions;folderOptions=function(sel){let h=_folderOptions(sel);const nbs=[...SH.nbs.values()];if(nbs.length)h+=`<optgroup label="Shared notebooks">${nbs.map(d=>`<option value="nb:${esc(d.id)}"${shCanEdit(d.id)?'':' disabled'}>👥 ${esc(d.name)}</option>`).join('')}</optgroup>`;return h};
const _newNote=newNote;newNote=function(){const nb=VIEW.folder.startsWith('nb:')?VIEW.folder.slice(3):null;if(nb&&!shCanEdit(nb)){toast('You can only view this notebook.');return}_newNote();if(nb&&App.cur&&!App.cur.nb)shMoveIn(App.cur,nb,true)};
$('#newNote').onclick=()=>newNote();$('#newNote2').onclick=()=>newNote();
const _openNote=openNote;openNote=function(id){_openNote(id);try{shAfterOpen()}catch(e){console.warn(e)}};
const _loadAll2=Store.loadAll;Store.loadAll=async function(){const r=await _loadAll2.call(this);setTimeout(()=>{try{shStart()}catch(e){console.warn(e)}glCloudLoad()},300);return r};
function wireShared(){
  $('#nbScrim').addEventListener('click',e=>{if(e.target.id==='nbScrim'){closeNotebook();return}nbAction(e)});
  document.addEventListener('keydown',e=>{if(e.key!=='Escape'||$('#nbScrim').hidden)return;e.stopPropagation();e.preventDefault();closeNotebook()},true);$('#nbScrim').addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='nbName'){e.preventDefault();shCreate()}else if(e.key==='Enter'&&e.target.id==='nbEmail'){e.preventDefault();$('#nbBody [data-nb="invite"]').click()}});
  $('#nbScrim').addEventListener('change',async e=>{const s=e.target.closest('[data-nbrole]');if(s&&SH.dlg&&SH.dlg.nb){try{await shRef(SH.dlg.nb).update({['roles.'+s.dataset.nbrole]:s.value==='viewer'?'viewer':'editor'});toast('Role updated')}catch(err){shErr(err)}}});
  $('#nbScrim').addEventListener('focusout',async e=>{if(e.target.id==='nbRename'&&SH.dlg&&SH.dlg.nb){const v=e.target.value.trim().slice(0,100),d=SH.nbs.get(SH.dlg.nb);if(v&&d&&v!==d.name){try{await shRef(SH.dlg.nb).update({name:v});toast('Notebook renamed')}catch(err){shErr(err)}}}});
  $('#folderTree').addEventListener('click',e=>{const t=e.target;let b;
    if((b=t.closest('[data-nbnew]'))){e.stopPropagation();newNotebook();return}
    if((b=t.closest('[data-nbmenu]'))){e.stopPropagation();shMenu(b.dataset.nbmenu,b);return}
    if((b=t.closest('[data-nbjoin]'))){e.stopPropagation();b.disabled=true;shJoinEmail(b.dataset.nbjoin);return}
    if((b=t.closest('[data-nbdecline]'))){e.stopPropagation();shDecline(b.dataset.nbdecline);return}
    if(t.closest('.fd-inv'))e.stopPropagation()},true);
  addEventListener('hashchange',()=>{if(/[#&]join=/.test(location.hash)){if(SH.started)shCheckJoin();else{shPendingJoin();setTimeout(()=>{if(!SH.started)shCheckJoin()},1500)}}});
  if(/[#&]join=/.test(location.hash)||(()=>{try{return localStorage.getItem('bondline.pendingJoin')}catch(e){return null}})()){shPendingJoin();setTimeout(()=>{if(!SH.started)shCheckJoin()},4000)}
}

if(/[?&]bltest\b/.test(location.search))window.__bl={prPredict,prName,prParse,GL,SH,stab,glFind,PM};

/* ---------- v13: icon rail, sidebar sections, panel title ---------- */
const SEC_KEY='bondline.secs';
const SEC=(()=>{try{return JSON.parse(localStorage.getItem(SEC_KEY)||'{}')||{}}catch(e){return{}}})();
function secOpen(k){
  if(Object.prototype.hasOwnProperty.call(SEC,k))return !!SEC[k];
  if(k==='folders')return true;
  if(k==='shared')return String(VIEW.folder||'').startsWith('nb:')||(typeof SH!=='undefined'&&(SH.invites.length>0||SH.nbs.size>0));
  if(k==='tags')return !!VIEW.tag;
  return true;
}
function secToggle(k){SEC[k]=!secOpen(k);try{localStorage.setItem(SEC_KEY,JSON.stringify(SEC))}catch(e){}secApply()}
function secApply(){
  const org=$('#org'),box=$('#folderTree');if(!org||!box)return;
  for(const k of['folders','shared','tags']){const o=secOpen(k);org.classList.toggle('c-'+k,!o);org.querySelectorAll(`[data-sectg="${k}"]`).forEach(b=>b.setAttribute('aria-expanded',o))}
}
const secHead=(k,label,extra,n)=>`<div class="fd-sec sec-h" data-sechead="${k}"><button class="sec-tg" data-sectg="${k}" aria-expanded="true" type="button">${label}${n?`<span class="sec-n">${n}</span>`:''}</button>${extra||''}</div>`;
{
  const _rf=renderFolders;
  renderFolders=function(){
    _rf();
    const box=$('#folderTree');if(!box)return;
    // header above the user's own folders (and Unfiled)
    const top=[...box.children].filter(el=>el.matches('[data-folder="all"],[data-folder="pinned"]'));
    const after=top.length?top[top.length-1]:null;
    const fh=secHead('folders','Folders','<button class="org-add" data-secnew="folder" title="New folder" aria-label="New folder">+</button>',App.folders.length||'');
    if(after)after.insertAdjacentHTML('afterend',fh);else box.insertAdjacentHTML('afterbegin',fh);
    // turn the Shared label into a toggle
    const sh=[...box.querySelectorAll('.fd-sec')].find(el=>!el.dataset.sechead);
    if(sh){sh.dataset.sechead='shared';sh.classList.add('sec-h');const sp=sh.querySelector('span');const n=typeof SH!=='undefined'?SH.nbs.size+SH.invites.length:0;
      if(sp)sp.outerHTML=`<button class="sec-tg" data-sectg="shared" aria-expanded="true" type="button">Shared${n?`<span class="sec-n">${n}</span>`:''}</button>`}
    // mark which section each row belongs to
    let cur='top';for(const el of box.children){if(el.dataset.sechead){cur=el.dataset.sechead;continue}el.dataset.in=cur}
    const tf=$('#tagFilter'),th=$('#tagsHead');
    if(th){const n=tf?tf.querySelectorAll('[data-tagf]').length:0;th.hidden=!n;const c=th.querySelector('.sec-n');if(c)c.textContent=n&&!App.allTags&&tf.querySelector('[data-tagmore]')?'':n||''}
    secApply();
  };
}
function setPanelTitle(mode){const t=$('#pnTitle');if(t)t.textContent={cards:'Flashcards',naming:'Naming',guide:'Guide',spectra:'Spectroscopy',orbitals:'Orbitals'}[mode]||'Notes'}
{
  const _sm=setMode;
  setMode=function(mode){_sm(mode);setPanelTitle(App.mode)};
}
function wireV13(){
  const org=$('#org');
  org.classList.remove('closed');$('#orgToggle').setAttribute('aria-expanded','true');
  org.addEventListener('click',e=>{
    const t=e.target.closest('[data-sectg]');if(t){e.stopPropagation();secToggle(t.dataset.sectg);return}
    const nf=e.target.closest('[data-secnew]');if(nf){e.stopPropagation();SEC.folders=true;secApply();$('#newFolder').click()}
  },true);
  $('#railPredict').onclick=()=>{$('#side').classList.remove('open');openPredictor()};
  $('#railGloss').onclick=()=>{$('#side').classList.remove('open');openGlossary()};
  setPanelTitle(App.mode);
  secApply();
}


/* ---------- v14: spectroscopy data ----------
   Approximate literature values (CDCl3, 400 MHz for 1H). Each compound:
   h:  [shift, nH, multiplicity, J (Hz, number or list; for 'm' the spread in ppm), assignment, environments lumped (default 1)]
   c:  [shift, DEPT type, assignment]
   ir: [wavenumber, s|m|w, width ('b' broad, 'vb' very broad, number = half-width), label for key peaks]
   ms: [m/z, relative intensity, label] */
const SP_BANK=[
 {id:'etoh',n:'ethanol',s:'CCO',f:'C2H6O',M:46,cls:'alcohol',
  h:[[3.69,2,'q',7.0,'OCH₂, next to CH₃'],[2.6,1,'br s',0,'OH, exchanges'],[1.22,3,'t',7.0,'CH₃, next to CH₂']],
  c:[[58.3,'CH2','CH₂OH'],[18.4,'CH3','CH₃']],
  ir:[[3350,'s','b','O–H (H-bonded)'],[2975,'s'],[2885,'m'],[1450,'m'],[1380,'m'],[1090,'m'],[1050,'s',0,'C–O'],[880,'m']],
  ms:[[46,22,'M⁺'],[45,50],[31,100,'CH₂=OH⁺'],[29,25],[27,22]]},
 {id:'pr1ol',n:'propan-1-ol',s:'CCCO',f:'C3H8O',M:60,cls:'alcohol',
  h:[[3.58,2,'t',6.7,'OCH₂, next to CH₂'],[2.2,1,'br s',0,'OH'],[1.57,2,'sext',7.0,'CH₂ between CH₃ and CH₂'],[0.93,3,'t',7.4,'CH₃']],
  c:[[64.2,'CH2','CH₂OH'],[25.9,'CH2','CH₂'],[10.2,'CH3','CH₃']],
  ir:[[3330,'s','b','O–H'],[2960,'s'],[2875,'m'],[1460,'m'],[1060,'s',0,'C–O'],[970,'m']],
  ms:[[60,8,'M⁺'],[59,10],[42,15],[31,100,'CH₂=OH⁺'],[29,16],[27,15]]},
 {id:'pr2ol',n:'propan-2-ol',s:'CC(C)O',f:'C3H8O',M:60,cls:'alcohol',
  h:[[4.01,1,'sept',6.1,'CH–O, next to two CH₃'],[2.1,1,'br s',0,'OH'],[1.20,6,'d',6.1,'2 × CH₃, next to CH']],
  c:[[64.0,'CH','CH–OH'],[25.3,'CH3','2 × CH₃']],
  ir:[[3360,'s','b','O–H'],[2970,'s'],[2880,'m'],[1380,'m'],[1370,'m'],[1130,'s',0,'C–O'],[950,'m'],[820,'m']],
  ms:[[60,4,'M⁺'],[59,6],[45,100,'CH₃CH=OH⁺'],[43,16],[27,14]]},
 {id:'meoet',n:'methoxyethane',s:'CCOC',f:'C3H8O',M:60,cls:'ether',
  h:[[3.46,2,'q',7.0,'OCH₂, next to CH₃'],[3.31,3,'s',0,'OCH₃, no neighbours'],[1.18,3,'t',7.0,'CH₃ of ethyl']],
  c:[[67.9,'CH2','OCH₂'],[57.8,'CH3','OCH₃'],[14.9,'CH3','CH₃']],
  ir:[[2980,'s'],[2930,'m'],[2820,'m'],[1450,'m'],[1120,'s',0,'C–O–C'],[1000,'w']],
  ms:[[60,22,'M⁺'],[45,100,'CH₂=O⁺CH₃'],[31,18],[29,40],[15,10]]},
 {id:'acetone',n:'propanone (acetone)',s:'CC(C)=O',f:'C3H6O',M:58,cls:'ketone',
  h:[[2.17,6,'s',0,'2 × CH₃, no neighbouring H']],
  c:[[206.6,'C','C=O (ketone)'],[30.8,'CH3','2 × CH₃']],
  ir:[[3005,'w'],[2965,'m'],[2925,'w'],[1715,'s',0,'C=O (ketone)'],[1420,'m'],[1365,'s'],[1220,'s'],[1095,'m'],[530,'m']],
  ms:[[58,30,'M⁺'],[43,100,'CH₃CO⁺'],[42,8],[15,22]]},
 {id:'propanal',n:'propanal',s:'CCC=O',f:'C3H6O',M:58,cls:'aldehyde',
  h:[[9.79,1,'t',1.4,'CHO'],[2.46,2,'qd',[7.3,1.4],'CH₂ next to CH₃ and CHO'],[1.13,3,'t',7.3,'CH₃']],
  c:[[203.0,'CH','CHO'],[37.3,'CH2','CH₂'],[6.0,'CH3','CH₃']],
  ir:[[2980,'m'],[2940,'m'],[2820,'w',0,'C–H (aldehyde)'],[2720,'w',0,'C–H (aldehyde)'],[1730,'s',0,'C=O (aldehyde)'],[1460,'m'],[1395,'m'],[1100,'m']],
  ms:[[58,70,'M⁺'],[57,20],[29,100,'CHO⁺ / C₂H₅⁺'],[28,60],[27,40]]},
 {id:'butanone',n:'butan-2-one',s:'CCC(C)=O',f:'C4H8O',M:72,cls:'ketone',
  h:[[2.44,2,'q',7.3,'CH₂, next to CH₃'],[2.14,3,'s',0,'CH₃ on C=O, no neighbours'],[1.06,3,'t',7.3,'CH₃ of ethyl']],
  c:[[209.3,'C','C=O'],[36.9,'CH2','CH₂'],[29.4,'CH3','C(=O)CH₃'],[7.9,'CH3','CH₂CH₃']],
  ir:[[2980,'m'],[2940,'w'],[1715,'s',0,'C=O (ketone)'],[1460,'m'],[1415,'m'],[1365,'s'],[1170,'s'],[945,'m'],[760,'w']],
  ms:[[72,25,'M⁺'],[57,8],[43,100,'CH₃CO⁺'],[29,15],[27,10]]},
 {id:'butanal',n:'butanal',s:'CCCC=O',f:'C4H8O',M:72,cls:'aldehyde',
  h:[[9.77,1,'t',1.8,'CHO'],[2.42,2,'td',[7.3,1.8],'CH₂ next to CHO'],[1.68,2,'sext',7.4,'middle CH₂'],[0.97,3,'t',7.4,'CH₃']],
  c:[[202.7,'CH','CHO'],[45.8,'CH2','CH₂CHO'],[15.7,'CH2','CH₂'],[13.7,'CH3','CH₃']],
  ir:[[2965,'s'],[2875,'m'],[2820,'w',0,'C–H (aldehyde)'],[2720,'w',0,'C–H (aldehyde)'],[1728,'s',0,'C=O (aldehyde)'],[1460,'m'],[1390,'m'],[1120,'w']],
  ms:[[72,50,'M⁺'],[57,10],[44,100,'McLafferty'],[43,40],[29,50],[27,40]]},
 {id:'mepropanal',n:'2-methylpropanal',s:'CC(C)C=O',f:'C4H8O',M:72,cls:'aldehyde',
  h:[[9.62,1,'d',1.3,'CHO, next to CH'],[2.44,1,'m',0.05,'CH, next to 2 × CH₃ and CHO'],[1.12,6,'d',7.0,'2 × CH₃, next to CH']],
  c:[[204.9,'CH','CHO'],[41.1,'CH','CH'],[15.5,'CH3','2 × CH₃']],
  ir:[[2975,'s'],[2880,'m'],[2810,'w',0,'C–H (aldehyde)'],[2710,'w',0,'C–H (aldehyde)'],[1730,'s',0,'C=O (aldehyde)'],[1470,'m'],[1390,'w'],[910,'m']],
  ms:[[72,40,'M⁺'],[43,100,'(CH₃)₂CH⁺'],[41,50],[29,30],[27,35]]},
 {id:'thf',n:'tetrahydrofuran (oxolane)',s:'C1CCOC1',f:'C4H8O',M:72,cls:'ether',
  h:[[3.74,4,'m',0.05,'2 × OCH₂'],[1.85,4,'m',0.05,'2 × CH₂']],
  c:[[67.9,'CH2','OCH₂'],[25.7,'CH2','CH₂']],
  ir:[[2975,'s'],[2860,'s'],[1460,'m'],[1365,'w'],[1070,'s',0,'C–O–C'],[910,'m']],
  ms:[[72,35,'M⁺'],[71,25],[42,100],[41,40],[27,25]]},
 {id:'etoac',n:'ethyl ethanoate (ethyl acetate)',s:'CCOC(C)=O',f:'C4H8O2',M:88,cls:'ester',
  h:[[4.12,2,'q',7.1,'OCH₂, next to CH₃'],[2.05,3,'s',0,'CH₃ on C=O'],[1.26,3,'t',7.1,'CH₃ of ethyl']],
  c:[[171.1,'C','C=O (ester)'],[60.5,'CH2','OCH₂'],[21.0,'CH3','C(=O)CH₃'],[14.2,'CH3','CH₂CH₃']],
  ir:[[2985,'m'],[2940,'w'],[1742,'s',0,'C=O (ester)'],[1445,'m'],[1373,'s'],[1240,'s',0,'C–O'],[1047,'s'],[938,'m'],[848,'w']],
  ms:[[88,8,'M⁺'],[73,4],[70,12],[61,15],[45,15],[43,100,'CH₃CO⁺'],[29,25]]},
 {id:'meprop',n:'methyl propanoate',s:'CCC(=O)OC',f:'C4H8O2',M:88,cls:'ester',
  h:[[3.67,3,'s',0,'OCH₃'],[2.32,2,'q',7.6,'CH₂ on C=O, next to CH₃'],[1.14,3,'t',7.6,'CH₃']],
  c:[[174.9,'C','C=O (ester)'],[51.5,'CH3','OCH₃'],[27.5,'CH2','CH₂'],[9.2,'CH3','CH₃']],
  ir:[[2985,'m'],[2955,'m'],[1740,'s',0,'C=O (ester)'],[1440,'m'],[1360,'m'],[1200,'s',0,'C–O'],[1085,'m'],[810,'w']],
  ms:[[88,20,'M⁺'],[59,30],[57,100,'CH₃CH₂CO⁺'],[29,60],[27,30]]},
 {id:'butacid',n:'butanoic acid',s:'CCCC(=O)O',f:'C4H8O2',M:88,cls:'acid',
  h:[[11.8,1,'br s',0,'COOH'],[2.35,2,'t',7.4,'CH₂ on C=O'],[1.68,2,'sext',7.4,'middle CH₂'],[0.98,3,'t',7.4,'CH₃']],
  c:[[180.6,'C','COOH'],[36.0,'CH2','CH₂CO'],[18.4,'CH2','CH₂'],[13.7,'CH3','CH₃']],
  ir:[[3000,'m','vb','O–H (acid, very broad)'],[2965,'m'],[1710,'s',0,'C=O (acid)'],[1415,'m'],[1290,'m'],[1230,'m'],[935,'m',40]],
  ms:[[88,3,'M⁺'],[73,25],[60,100,'McLafferty'],[45,20],[41,25],[27,25]]},
 {id:'ibacid',n:'2-methylpropanoic acid',s:'CC(C)C(=O)O',f:'C4H8O2',M:88,cls:'acid',
  h:[[11.9,1,'br s',0,'COOH'],[2.58,1,'sept',7.0,'CH, next to 2 × CH₃'],[1.21,6,'d',7.0,'2 × CH₃']],
  c:[[184.0,'C','COOH'],[33.9,'CH','CH'],[18.8,'CH3','2 × CH₃']],
  ir:[[3000,'m','vb','O–H (acid, very broad)'],[2980,'m'],[1705,'s',0,'C=O (acid)'],[1470,'m'],[1280,'m'],[1230,'m'],[940,'m',40]],
  ms:[[88,10,'M⁺'],[73,20],[43,100,'(CH₃)₂CH⁺'],[41,40],[27,30]]},
 {id:'acoh',n:'ethanoic acid (acetic acid)',s:'CC(=O)O',f:'C2H4O2',M:60,cls:'acid',
  h:[[11.4,1,'br s',0,'COOH'],[2.10,3,'s',0,'CH₃']],
  c:[[178.0,'C','COOH'],[20.8,'CH3','CH₃']],
  ir:[[3000,'m','vb','O–H (acid, very broad)'],[1712,'s',0,'C=O (acid)'],[1410,'m'],[1295,'s'],[935,'m',40]],
  ms:[[60,75,'M⁺'],[45,90,'COOH⁺'],[43,100,'CH₃CO⁺'],[15,15]]},
 {id:'meoac',n:'methyl ethanoate (methyl acetate)',s:'CC(=O)OC',f:'C3H6O2',M:74,cls:'ester',
  h:[[3.67,3,'s',0,'OCH₃'],[2.06,3,'s',0,'CH₃ on C=O']],
  c:[[171.4,'C','C=O (ester)'],[51.6,'CH3','OCH₃'],[20.6,'CH3','C(=O)CH₃']],
  ir:[[2960,'w'],[1745,'s',0,'C=O (ester)'],[1440,'m'],[1375,'m'],[1245,'s',0,'C–O'],[1050,'m'],[845,'w']],
  ms:[[74,15,'M⁺'],[59,5],[43,100,'CH₃CO⁺'],[42,10],[15,15]]},
 {id:'propacid',n:'propanoic acid',s:'CCC(=O)O',f:'C3H6O2',M:74,cls:'acid',
  h:[[11.7,1,'br s',0,'COOH'],[2.38,2,'q',7.5,'CH₂, next to CH₃'],[1.16,3,'t',7.5,'CH₃']],
  c:[[181.5,'C','COOH'],[27.6,'CH2','CH₂'],[8.9,'CH3','CH₃']],
  ir:[[3000,'m','vb','O–H (acid, very broad)'],[2985,'m'],[1715,'s',0,'C=O (acid)'],[1420,'m'],[1240,'s'],[935,'m',40]],
  ms:[[74,80,'M⁺'],[73,40],[57,30],[45,50],[29,100],[28,80]]},
 {id:'pent2one',n:'pentan-2-one',s:'CCCC(C)=O',f:'C5H10O',M:86,cls:'ketone',
  h:[[2.41,2,'t',7.3,'CH₂ on C=O'],[2.13,3,'s',0,'CH₃ on C=O'],[1.60,2,'sext',7.4,'middle CH₂'],[0.92,3,'t',7.4,'CH₃ of propyl']],
  c:[[209.0,'C','C=O'],[45.7,'CH2','CH₂CO'],[29.9,'CH3','C(=O)CH₃'],[17.4,'CH2','CH₂'],[13.7,'CH3','CH₃']],
  ir:[[2960,'s'],[2875,'m'],[1717,'s',0,'C=O (ketone)'],[1460,'m'],[1365,'s'],[1165,'m']],
  ms:[[86,15,'M⁺'],[71,10],[58,15,'McLafferty'],[43,100,'CH₃CO⁺'],[27,15]]},
 {id:'pent3one',n:'pentan-3-one',s:'CCC(=O)CC',f:'C5H10O',M:86,cls:'ketone',
  h:[[2.44,4,'q',7.3,'2 × CH₂, next to CH₃'],[1.06,6,'t',7.3,'2 × CH₃']],
  c:[[211.9,'C','C=O'],[35.5,'CH2','2 × CH₂'],[7.9,'CH3','2 × CH₃']],
  ir:[[2980,'s'],[2940,'m'],[1715,'s',0,'C=O (ketone)'],[1460,'m'],[1375,'m'],[1110,'m'],[950,'m']],
  ms:[[86,20,'M⁺'],[57,100,'CH₃CH₂CO⁺'],[29,60],[27,25]]},
 {id:'mbutanone',n:'3-methylbutan-2-one',s:'CC(C)C(C)=O',f:'C5H10O',M:86,cls:'ketone',
  h:[[2.59,1,'sept',7.0,'CH, next to 2 × CH₃'],[2.14,3,'s',0,'CH₃ on C=O'],[1.10,6,'d',7.0,'2 × CH₃ on CH']],
  c:[[212.9,'C','C=O'],[41.6,'CH','CH'],[27.5,'CH3','C(=O)CH₃'],[18.1,'CH3','2 × CH₃']],
  ir:[[2970,'s'],[2875,'m'],[1715,'s',0,'C=O (ketone)'],[1465,'m'],[1355,'m'],[1180,'m']],
  ms:[[86,15,'M⁺'],[71,5],[43,100,'CH₃CO⁺ / C₃H₇⁺'],[41,20],[27,15]]},
 {id:'chexone',n:'cyclohexanone',s:'O=C1CCCCC1',f:'C6H10O',M:98,cls:'ketone',
  h:[[2.34,4,'m',0.04,'2 × CH₂ next to C=O'],[1.86,4,'m',0.05,'2 × CH₂'],[1.72,2,'m',0.05,'CH₂ opposite C=O']],
  c:[[212.0,'C','C=O'],[42.0,'CH2','2 × CH₂CO'],[27.1,'CH2','2 × CH₂'],[25.1,'CH2','CH₂']],
  ir:[[2940,'s'],[2860,'m'],[1715,'s',0,'C=O (ketone)'],[1450,'m'],[1310,'m'],[1220,'m'],[1120,'m']],
  ms:[[98,35,'M⁺'],[69,25],[55,100],[42,85]]},
 {id:'chexene',n:'cyclohexene',s:'C1=CCCCC1',f:'C6H10',M:82,cls:'alkene',
  h:[[5.67,2,'m',0.03,'CH=CH'],[1.99,4,'m',0.04,'2 × allylic CH₂'],[1.61,4,'m',0.04,'2 × CH₂']],
  c:[[127.3,'CH','CH=CH'],[25.3,'CH2','allylic CH₂'],[22.9,'CH2','CH₂']],
  ir:[[3025,'m',0,'=C–H'],[2930,'s'],[2860,'m'],[1650,'w',0,'C=C'],[1440,'m'],[1140,'w'],[720,'m']],
  ms:[[82,35,'M⁺'],[67,100],[54,60,'retro-Diels–Alder'],[41,30]]},
 {id:'hexyne',n:'hex-1-yne',s:'C#CCCCC',f:'C6H10',M:82,cls:'alkyne',
  h:[[2.18,2,'td',[7.1,2.6],'CH₂ next to C≡C'],[1.94,1,'t',2.6,'≡C–H'],[1.52,2,'m',0.04,'CH₂'],[1.42,2,'m',0.04,'CH₂'],[0.91,3,'t',7.2,'CH₃']],
  c:[[84.6,'C','–C≡'],[68.2,'CH','≡CH'],[30.7,'CH2','CH₂'],[21.9,'CH2','CH₂'],[18.2,'CH2','CH₂C≡'],[13.6,'CH3','CH₃']],
  ir:[[3310,'s',14,'≡C–H'],[2960,'s'],[2870,'m'],[2120,'w',0,'C≡C'],[1465,'m'],[630,'s',20]],
  ms:[[82,5,'M⁺'],[67,60],[54,40],[41,100],[39,50]]},
 {id:'hexene',n:'hex-1-ene',s:'C=CCCCC',f:'C6H12',M:84,cls:'alkene',
  h:[[5.81,1,'m',0.04,'=CH'],[4.97,2,'m',0.05,'=CH₂ (two different H)',2],[2.05,2,'m',0.03,'allylic CH₂'],[1.36,4,'m',0.05,'2 × CH₂',2],[0.90,3,'t',7.0,'CH₃']],
  c:[[139.2,'CH','=CH'],[114.2,'CH2','=CH₂'],[33.6,'CH2','CH₂'],[31.2,'CH2','CH₂'],[22.3,'CH2','CH₂'],[14.0,'CH3','CH₃']],
  ir:[[3080,'m',0,'=C–H'],[2960,'s'],[2925,'s'],[1640,'m',0,'C=C'],[1460,'m'],[990,'m'],[910,'s',0,'=CH₂ bend']],
  ms:[[84,30,'M⁺'],[69,25],[56,90],[55,60],[41,100]]},
 {id:'bromobutane',n:'1-bromobutane',s:'CCCCBr',f:'C4H9Br',M:136,cls:'haloalkane',
  h:[[3.41,2,'t',6.8,'CH₂Br'],[1.85,2,'quint',7.0,'CH₂ next to CH₂Br'],[1.47,2,'sext',7.3,'CH₂ next to CH₃'],[0.94,3,'t',7.3,'CH₃']],
  c:[[34.8,'CH2','CH₂'],[33.4,'CH2','CH₂Br'],[21.4,'CH2','CH₂'],[13.2,'CH3','CH₃']],
  ir:[[2960,'s'],[2875,'m'],[1465,'m'],[1250,'m'],[1210,'m'],[645,'m',0,'C–Br'],[560,'m']],
  ms:[[138,8,'M+2 (⁸¹Br)'],[136,8,'M⁺ (⁷⁹Br)'],[57,100,'C₄H₉⁺'],[41,60],[29,40],[27,35]]},
 {id:'bromobutane2',n:'2-bromobutane',s:'CCC(C)Br',f:'C4H9Br',M:136,cls:'haloalkane',
  h:[[4.11,1,'m',0.05,'CHBr'],[1.83,2,'m',0.06,'CH₂'],[1.71,3,'d',6.7,'CH₃ on CHBr'],[1.03,3,'t',7.3,'CH₃ of ethyl']],
  c:[[53.4,'CH','CHBr'],[34.3,'CH2','CH₂'],[26.1,'CH3','CH₃ on CHBr'],[12.2,'CH3','CH₃']],
  ir:[[2970,'s'],[2880,'m'],[1455,'m'],[1380,'m'],[1220,'m'],[600,'m',0,'C–Br']],
  ms:[[138,5,'M+2 (⁸¹Br)'],[136,5,'M⁺ (⁷⁹Br)'],[57,100,'C₄H₉⁺'],[41,45],[29,40]]},
 {id:'tbubr',n:'2-bromo-2-methylpropane',s:'CC(C)(C)Br',f:'C4H9Br',M:136,cls:'haloalkane',
  h:[[1.80,9,'s',0,'3 × CH₃, no neighbouring H']],
  c:[[62.5,'C','C–Br'],[36.4,'CH3','3 × CH₃']],
  ir:[[2975,'s'],[1460,'m'],[1370,'s'],[1160,'s'],[540,'m',0,'C–Br']],
  ms:[[138,1,'M+2'],[136,1,'M⁺'],[57,100,'(CH₃)₃C⁺'],[41,40],[29,25]]},
 {id:'chloropropane',n:'1-chloropropane',s:'CCCCl',f:'C3H7Cl',M:78,cls:'haloalkane',
  h:[[3.51,2,'t',6.6,'CH₂Cl'],[1.80,2,'sext',7.0,'middle CH₂'],[1.04,3,'t',7.4,'CH₃']],
  c:[[46.7,'CH2','CH₂Cl'],[26.0,'CH2','CH₂'],[11.4,'CH3','CH₃']],
  ir:[[2970,'s'],[2880,'m'],[1460,'m'],[1300,'m'],[730,'m',0,'C–Cl'],[650,'m']],
  ms:[[80,7,'M+2 (³⁷Cl)'],[78,20,'M⁺ (³⁵Cl)'],[63,5],[42,100],[29,40],[27,40]]},
 {id:'chloropropane2',n:'2-chloropropane',s:'CC(C)Cl',f:'C3H7Cl',M:78,cls:'haloalkane',
  h:[[4.17,1,'sept',6.5,'CHCl, next to 2 × CH₃'],[1.52,6,'d',6.5,'2 × CH₃']],
  c:[[53.8,'CH','CHCl'],[27.3,'CH3','2 × CH₃']],
  ir:[[2975,'s'],[2930,'m'],[1450,'m'],[1380,'m'],[1260,'m'],[610,'m',0,'C–Cl']],
  ms:[[80,7,'M+2 (³⁷Cl)'],[78,20,'M⁺ (³⁵Cl)'],[63,15],[43,100,'(CH₃)₂CH⁺'],[27,30]]},
 {id:'etbz',n:'ethylbenzene',s:'CCc1ccccc1',f:'C8H10',M:106,cls:'arene',
  h:[[7.22,5,'m',0.12,'5 aromatic H',3],[2.65,2,'q',7.6,'CH₂, next to CH₃'],[1.24,3,'t',7.6,'CH₃']],
  c:[[144.2,'C','ring C–CH₂'],[128.3,'CH','ring CH'],[127.8,'CH','ring CH'],[125.6,'CH','ring CH (para)'],[28.9,'CH2','CH₂'],[15.6,'CH3','CH₃']],
  ir:[[3060,'w',0,'aromatic C–H'],[3030,'w'],[2965,'m'],[2875,'w'],[1605,'w',0,'aromatic C=C'],[1495,'m'],[1455,'m'],[745,'s'],[695,'s',0,'monosubstituted ring']],
  ms:[[106,30,'M⁺'],[91,100,'C₇H₇⁺ (tropylium)'],[77,8],[65,10],[51,8]]},
 {id:'pxylene',n:'1,4-dimethylbenzene (p-xylene)',s:'Cc1ccc(C)cc1',f:'C8H10',M:106,cls:'arene',
  h:[[7.05,4,'s',0,'4 equivalent aromatic H'],[2.30,6,'s',0,'2 × ArCH₃']],
  c:[[134.7,'C','ring C–CH₃'],[129.0,'CH','ring CH'],[21.0,'CH3','CH₃']],
  ir:[[3020,'w',0,'aromatic C–H'],[2920,'m'],[2865,'w'],[1515,'s',0,'aromatic C=C'],[1450,'m'],[795,'s',0,'para-disubstituted ring']],
  ms:[[106,60,'M⁺'],[105,20],[91,100,'C₇H₇⁺'],[77,10],[51,8]]},
 {id:'acphen',n:'1-phenylethanone (acetophenone)',s:'CC(=O)c1ccccc1',f:'C8H8O',M:120,cls:'ketone',
  h:[[7.96,2,'d',7.6,'2 aromatic H next to C=O'],[7.56,1,'t',7.4,'para H'],[7.46,2,'t',7.6,'2 meta H'],[2.61,3,'s',0,'CH₃ on C=O']],
  c:[[198.1,'C','C=O (conjugated ketone)'],[137.1,'C','ring C–CO'],[133.1,'CH','para CH'],[128.6,'CH','ring CH'],[128.3,'CH','ring CH'],[26.6,'CH3','CH₃']],
  ir:[[3060,'w',0,'aromatic C–H'],[3005,'w'],[1685,'s',0,'C=O (conjugated)'],[1600,'m'],[1450,'m'],[1360,'m'],[1265,'s'],[760,'s'],[690,'s']],
  ms:[[120,30,'M⁺'],[105,100,'C₆H₅CO⁺'],[77,80,'C₆H₅⁺'],[51,30],[43,15]]},
 {id:'tolual',n:'4-methylbenzaldehyde',s:'Cc1ccc(C=O)cc1',f:'C8H8O',M:120,cls:'aldehyde',
  h:[[9.96,1,'s',0,'CHO'],[7.77,2,'d',8.0,'2 ring H next to CHO'],[7.33,2,'d',8.0,'2 ring H next to CH₃'],[2.43,3,'s',0,'ArCH₃']],
  c:[[192.0,'CH','CHO'],[145.5,'C','ring C–CH₃'],[134.2,'C','ring C–CHO'],[129.8,'CH','ring CH'],[129.7,'CH','ring CH'],[21.8,'CH3','CH₃']],
  ir:[[3030,'w'],[2920,'w'],[2820,'w',0,'C–H (aldehyde)'],[2730,'w',0,'C–H (aldehyde)'],[1700,'s',0,'C=O (conjugated aldehyde)'],[1605,'s'],[1210,'m'],[1170,'m'],[815,'s']],
  ms:[[120,75,'M⁺'],[119,100,'M–H'],[91,85,'C₇H₇⁺'],[65,25]]},
 {id:'bnoh',n:'phenylmethanol (benzyl alcohol)',s:'OCc1ccccc1',f:'C7H8O',M:108,cls:'alcohol',
  h:[[7.32,5,'m',0.08,'5 aromatic H',3],[4.65,2,'s',0,'CH₂O'],[2.1,1,'br s',0,'OH']],
  c:[[140.9,'C','ring C–CH₂'],[128.5,'CH','ring CH'],[127.6,'CH','ring CH (para)'],[127.0,'CH','ring CH'],[65.2,'CH2','CH₂OH']],
  ir:[[3330,'s','b','O–H'],[3030,'w',0,'aromatic C–H'],[2875,'w'],[1495,'m'],[1455,'m'],[1020,'s',0,'C–O'],[735,'s'],[700,'s']],
  ms:[[108,90,'M⁺'],[107,65],[91,20],[79,100],[77,70]]},
 {id:'anisole',n:'methoxybenzene (anisole)',s:'COc1ccccc1',f:'C7H8O',M:108,cls:'ether',
  h:[[7.29,2,'m',0.04,'2 meta H'],[6.93,3,'m',0.05,'ortho and para H',2],[3.80,3,'s',0,'OCH₃']],
  c:[[159.6,'C','ring C–O'],[129.5,'CH','meta CH'],[120.7,'CH','para CH'],[114.0,'CH','ortho CH'],[55.1,'CH3','OCH₃']],
  ir:[[3060,'w',0,'aromatic C–H'],[3000,'w'],[2950,'w'],[2835,'w'],[1600,'s'],[1495,'s'],[1250,'s',0,'aryl C–O'],[1040,'s'],[755,'s'],[690,'m']],
  ms:[[108,100,'M⁺'],[93,15],[78,40],[77,25],[65,40]]},
 {id:'mebenz',n:'methyl benzoate',s:'COC(=O)c1ccccc1',f:'C8H8O2',M:136,cls:'ester',
  h:[[8.04,2,'d',7.6,'2 ortho H'],[7.55,1,'t',7.4,'para H'],[7.43,2,'t',7.7,'2 meta H'],[3.91,3,'s',0,'OCH₃']],
  c:[[167.1,'C','C=O (ester)'],[132.9,'CH','para CH'],[130.2,'C','ring C–CO'],[129.6,'CH','ortho CH'],[128.4,'CH','meta CH'],[52.1,'CH3','OCH₃']],
  ir:[[3065,'w',0,'aromatic C–H'],[2955,'w'],[1725,'s',0,'C=O (conjugated ester)'],[1600,'m'],[1450,'m'],[1280,'s',0,'C–O'],[1110,'s'],[710,'s']],
  ms:[[136,30,'M⁺'],[105,100,'C₆H₅CO⁺'],[77,60,'C₆H₅⁺'],[51,25]]},
 {id:'phacoh',n:'phenylethanoic acid',s:'OC(=O)Cc1ccccc1',f:'C8H8O2',M:136,cls:'acid',
  h:[[11.5,1,'br s',0,'COOH'],[7.30,5,'m',0.08,'5 aromatic H',3],[3.64,2,'s',0,'CH₂']],
  c:[[178.0,'C','COOH'],[133.3,'C','ring C–CH₂'],[129.4,'CH','ring CH'],[128.7,'CH','ring CH'],[127.4,'CH','ring CH (para)'],[41.1,'CH2','CH₂']],
  ir:[[3000,'m','vb','O–H (acid, very broad)'],[3030,'w'],[1700,'s',0,'C=O (acid)'],[1495,'m'],[1410,'m'],[1250,'m'],[930,'m',40],[700,'s']],
  ms:[[136,40,'M⁺'],[91,100,'C₇H₇⁺'],[65,15],[45,8]]},
 {id:'propnitrile',n:'propanenitrile',s:'CCC#N',f:'C3H5N',M:55,cls:'nitrile',
  h:[[2.36,2,'q',7.6,'CH₂ next to C≡N'],[1.30,3,'t',7.6,'CH₃']],
  c:[[120.8,'C','C≡N'],[10.9,'CH2','CH₂'],[10.6,'CH3','CH₃']],
  ir:[[2990,'m'],[2950,'m'],[2250,'m',0,'C≡N'],[1465,'m'],[1430,'m'],[1075,'w'],[780,'w']],
  ms:[[55,15,'M⁺'],[54,100,'M–H'],[28,60],[27,30]]},
 {id:'butamine',n:'butan-1-amine',s:'CCCCN',f:'C4H11N',M:73,cls:'amine1',
  h:[[2.68,2,'t',7.0,'CH₂N'],[1.42,2,'m',0.03,'CH₂'],[1.33,2,'m',0.03,'CH₂'],[1.15,2,'br s',0,'NH₂, exchanges'],[0.91,3,'t',7.2,'CH₃']],
  c:[[42.2,'CH2','CH₂N'],[36.1,'CH2','CH₂'],[20.1,'CH2','CH₂'],[13.9,'CH3','CH₃']],
  ir:[[3370,'m',35,'N–H (two bands, NH₂)'],[3290,'m',35],[2960,'s'],[2870,'s'],[1600,'m',0,'N–H bend'],[1465,'m'],[1070,'m'],[800,'m','b']],
  ms:[[73,8,'M⁺'],[30,100,'CH₂=NH₂⁺']]},
 {id:'et2nh',n:'N-ethylethanamine (diethylamine)',s:'CCNCC',f:'C4H11N',M:73,cls:'amine2',
  h:[[2.65,4,'q',7.1,'2 × CH₂N'],[1.10,6,'t',7.1,'2 × CH₃'],[0.8,1,'br s',0,'NH']],
  c:[[44.1,'CH2','CH₂N'],[15.3,'CH3','CH₃']],
  ir:[[3290,'w',30,'N–H (one band, NH)'],[2965,'s'],[2810,'m'],[1450,'m'],[1140,'m'],[730,'m','b']],
  ms:[[73,25,'M⁺'],[58,100,'α-cleavage'],[44,20],[30,50]]},
 {id:'nmeacetamide',n:'N-methylethanamide',s:'CNC(C)=O',f:'C3H7NO',M:73,cls:'amide',
  h:[[6.3,1,'br s',0,'NH'],[2.80,3,'d',4.8,'NCH₃, next to NH'],[1.98,3,'s',0,'CH₃ on C=O']],
  c:[[171.0,'C','C=O (amide)'],[26.2,'CH3','NCH₃'],[22.8,'CH3','C(=O)CH₃']],
  ir:[[3290,'m',40,'N–H'],[3090,'w'],[2940,'w'],[1655,'s',0,'C=O (amide I)'],[1565,'s',0,'N–H bend (amide II)'],[1370,'m'],[1300,'m']],
  ms:[[73,70,'M⁺'],[58,35],[43,40,'CH₃CO⁺'],[30,100]]},
 {id:'phbr',n:'bromobenzene',s:'Brc1ccccc1',f:'C6H5Br',M:156,cls:'haloarene',
  h:[[7.50,2,'d',7.8,'2 ortho H'],[7.30,1,'t',7.5,'para H'],[7.23,2,'t',7.7,'2 meta H']],
  c:[[131.6,'CH','ortho CH'],[130.0,'CH','meta CH'],[126.9,'CH','para CH'],[122.6,'C','C–Br']],
  ir:[[3065,'w',0,'aromatic C–H'],[1580,'m'],[1475,'s'],[1070,'m'],[1020,'m'],[735,'s'],[685,'s']],
  ms:[[158,97,'M+2 (⁸¹Br)'],[156,100,'M⁺ (⁷⁹Br)'],[77,60,'C₆H₅⁺'],[51,30]]},
];
const SP_BY=Object.fromEntries(SP_BANK.map(c=>[c.id,c]));

const SP_TOPICS=[{id:'ir',title:'Infrared (IR)'},{id:'hnmr',title:'¹H NMR'},{id:'cnmr',title:'¹³C NMR'},{id:'ms',title:'Mass spectrometry'},{id:'combo',title:'Solving structures'}];

/* concept questions: q, options (first is correct), why */
const SP_CONCEPT=[
 ['ir','c-ir1','A strong, sharp absorption near 1715 cm⁻¹ most likely comes from:',['a C=O stretch (ketone)','a C=C stretch','an O–H stretch','a C–O stretch'],'Carbonyl stretches are strong and sit at 1650–1820 cm⁻¹. A simple ketone absorbs near 1715 cm⁻¹. C=C is weaker and lower (1620–1680), O–H is above 3000 and C–O is at 1000–1300.'],
 ['ir','c-ir2','Which feature tells a carboxylic acid apart from an alcohol in IR?',['a very broad O–H band from 2500 to 3300 cm⁻¹ together with C=O near 1710 cm⁻¹','a sharp band at 3600 cm⁻¹','a band at 1050 cm⁻¹','a weak band near 2100 cm⁻¹'],'Acids form strongly hydrogen-bonded dimers, so the O–H band is extremely broad and runs right through the C–H stretches. They also have a C=O band. Alcohols show a rounder O–H band at 3200–3550 cm⁻¹ and no C=O.'],
 ['ir','c-ir3','Two weak bands at about 2720 and 2820 cm⁻¹, together with C=O near 1730 cm⁻¹, suggest:',['an aldehyde','a ketone','an ester','an alkyne'],'The C–H bond of an aldehyde (O=C–H) gives a characteristic pair of weak bands near 2720 and 2820 cm⁻¹. Ketones and esters have no such C–H.'],
 ['ir','c-ir4','Conjugating a C=O group with a C=C or a benzene ring moves its IR stretch:',['to lower wavenumber, by about 20–30 cm⁻¹','to higher wavenumber, by about 20–30 cm⁻¹','it doesn\'t change','it disappears'],'Conjugation delocalises the π electrons, so the C=O bond has slightly less double-bond character and a smaller force constant. Acetophenone absorbs near 1685 cm⁻¹ against 1715 cm⁻¹ for acetone.'],
 ['ir','c-ir5','A sharp, strong band at 3300 cm⁻¹ and a weak band near 2120 cm⁻¹ point to:',['a terminal alkyne (R–C≡C–H)','an alcohol','a nitrile','an amine'],'The ≡C–H stretch is sharp at about 3300 cm⁻¹ and the C≡C stretch is weak at 2100–2260 cm⁻¹. An alcohol O–H band would be broad, and a nitrile absorbs near 2250 cm⁻¹ with no 3300 band.'],
 ['ir','c-ir6','Why are alcohol O–H bands broad?',['hydrogen bonding gives a range of slightly different O–H bond strengths','O–H bonds are very weak','oxygen is a heavy atom','alcohols absorb UV light'],'In a liquid or concentrated solution, molecules hydrogen-bond to each other in many ways. Each arrangement has a slightly different O–H stretching frequency, so the band smears out. A dilute solution in CCl₄ shows a sharp "free" O–H near 3600 cm⁻¹.'],
 ['ir','c-ir7','Which of these carbonyl compounds absorbs at the highest wavenumber?',['an acid chloride (RCOCl)','an amide (RCONH₂)','a ketone','a carboxylic acid'],'The electronegative Cl withdraws electrons and barely donates by resonance, so the C=O bond stays strong: about 1800 cm⁻¹. Amides are lowest (1650–1690 cm⁻¹) because nitrogen\'s lone pair donates strongly into the C=O.'],
 ['ir','c-ir8','In the N–H region, a primary amine (RNH₂) shows:',['two bands, from symmetric and asymmetric N–H stretches','one band','no bands','a very broad band from 2500 to 3300 cm⁻¹'],'An NH₂ group can stretch in phase and out of phase, giving two bands near 3300 and 3400 cm⁻¹. A secondary amine (R₂NH) has one N–H and one band; a tertiary amine has none.'],
 ['ir','c-ir9','A medium band near 2250 cm⁻¹ and nothing else unusual most likely means:',['a nitrile (C≡N)','a ketone','an alkene','an ether'],'Very little absorbs between 2000 and 2300 cm⁻¹. C≡N stretches appear at 2210–2260 cm⁻¹ with medium intensity; C≡C is in the same region but usually weaker.'],
 ['hnmr','c-h1','Which proton usually appears furthest downfield (highest δ)?',['a carboxylic acid O–H','an aldehyde C–H','an aromatic C–H','an alkene C–H'],'COOH protons appear at δ 10–13, aldehyde protons at δ 9–10, aromatic protons at δ 6.5–8.5 and alkene protons at δ 4.5–6.5.'],
 ['hnmr','c-h2','A ¹H NMR signal is a quartet. How many equivalent H are on the neighbouring carbons?',['3','4','2','1'],'The n + 1 rule: n equivalent neighbouring H split a signal into n + 1 lines. A quartet (4 lines) means 3 neighbours, typically a CH₃.'],
 ['hnmr','c-h3','What does the integration of a ¹H NMR signal tell you?',['the relative number of H giving that signal','how many neighbouring H there are','how electronegative the nearby atoms are','the coupling constant'],'The area under each signal is proportional to the number of protons in that environment. Splitting tells you about neighbours, and the chemical shift tells you about electronegative groups nearby.'],
 ['hnmr','c-h4','Why does an alcohol O–H often appear as a broad singlet that doesn\'t split its neighbours?',['the OH proton exchanges rapidly between molecules','oxygen has no nuclear spin, so it can\'t couple','the OH proton has no neighbours','OH protons are invisible in NMR'],'Traces of acid or water make OH protons hop between molecules faster than the NMR timescale, so coupling averages out. The same happens with NH protons.'],
 ['hnmr','c-h5','What happens to an O–H or N–H signal when you shake the sample with D₂O?',['it disappears, because H is replaced by D','it doubles in size','it splits into a doublet','it moves to δ 0'],'The exchangeable H swaps for deuterium, which doesn\'t show in a ¹H spectrum. This "D₂O shake" is a quick way to identify OH and NH signals.'],
 ['hnmr','c-h6','The classic pattern for an ethyl group (–CH₂CH₃) attached to a group with no H is:',['a 2H quartet and a 3H triplet','a 2H triplet and a 3H quartet','a 2H singlet and a 3H singlet','a 1H septet and a 6H doublet'],'The CH₂ has 3 neighbours (quartet) and the CH₃ has 2 neighbours (triplet). The septet-and-doublet pattern belongs to an isopropyl group.'],
 ['hnmr','c-h7','An isopropyl group, –CH(CH₃)₂, gives:',['a 1H septet and a 6H doublet','a 1H quartet and a 6H triplet','a 2H quartet and a 3H triplet','a 9H singlet'],'The CH has 6 equivalent neighbours (septet, 7 lines); each CH₃ has 1 neighbour (doublet), and both CH₃ groups are equivalent, so the doublet integrates to 6H.'],
 ['hnmr','c-h8','Protons on a benzene ring usually appear at about:',['δ 6.5–8.5','δ 0.9–1.5','δ 2–3','δ 9.5–10'],'The ring current of the aromatic π system deshields the ring protons strongly, moving them to δ 6.5–8.5.'],
 ['hnmr','c-h9','Why are H on a carbon attached to oxygen (H–C–O) found at δ 3.3–4.5?',['the electronegative oxygen pulls electron density away, deshielding them','oxygen shields them','they exchange with water','they are acidic'],'Less electron density around a proton means less shielding from the applied field, so it resonates at a higher δ. The more electronegative the neighbour, the bigger the effect.'],
 ['hnmr','c-h10','A benzene ring with two different groups in the 1,4 (para) positions often shows in its aromatic region:',['two doublets, 2H each','one singlet, 4H','a 5H multiplet','four separate 1H signals'],'The two H next to one group are equivalent, as are the two next to the other. Each pair couples to its neighbour, giving two doublets (as in 4-methylbenzaldehyde).'],
 ['cnmr','c-c1','In a routine (proton-decoupled) ¹³C NMR spectrum, each signal is:',['a single line (singlet)','split by the H on that carbon','split by neighbouring carbons','always the same height'],'Decoupling removes C–H splitting, and ¹³C–¹³C coupling is rare because only 1.1% of carbon is ¹³C. So each carbon environment gives one line.'],
 ['cnmr','c-c2','A ¹³C signal at δ 200–220 indicates:',['the C=O of a ketone or aldehyde','the C=O of an ester or acid','an aromatic carbon','a C–O single bond'],'Ketone and aldehyde carbonyls appear at δ 190–220. Ester, acid and amide carbonyls are lower, at δ 160–185, because the attached O or N donates electron density.'],
 ['cnmr','c-c3','In a DEPT-135 spectrum, CH₂ carbons appear:',['as negative (downward) peaks','as positive peaks, like CH and CH₃','not at all','twice'],'DEPT-135 shows CH and CH₃ pointing up and CH₂ pointing down. Carbons with no H (C=O, quaternary C) don\'t appear.'],
 ['cnmr','c-c4','Where do ester, acid and amide C=O carbons appear in ¹³C NMR?',['δ 160–185','δ 190–220','δ 100–150','δ 50–90'],'The lone pair on the O or N next to the carbonyl donates electron density and shields the carbon a little, compared with a ketone.'],
 ['cnmr','c-c5','Why don\'t you integrate a routine ¹³C spectrum to count carbons?',['peak heights depend on relaxation and the NOE, not just the number of carbons','¹³C signals are too broad','every peak is the same height','the solvent hides them'],'Carbons with no attached H relax slowly and get little NOE boost, so they give small peaks. Count environments, not peak sizes.'],
 ['cnmr','c-c6','Aromatic and alkene carbons appear in ¹³C NMR at about:',['δ 100–150','δ 0–40','δ 160–185','δ 190–220'],'sp² carbons of C=C and aromatic rings appear at δ 100–150. A nitrile carbon (115–125) also falls in this range.'],
 ['cnmr','c-c7','A carbon single-bonded to oxygen (C–O, as in alcohols and ethers) appears at about:',['δ 50–90','δ 0–30','δ 100–150','δ 190–220'],'Oxygen\'s electronegativity deshields the carbon. Halogen- and nitrogen-bearing carbons appear at somewhat lower δ (about 25–65).'],
 ['ms','c-m1','Peaks at M and M+2 in a ratio of about 3:1 show that the molecule contains:',['one chlorine atom','one bromine atom','one sulfur atom','one nitrogen atom'],'Chlorine is about 75% ³⁵Cl and 25% ³⁷Cl, so molecules with one Cl give M and M+2 peaks in a 3:1 ratio.'],
 ['ms','c-m2','Peaks at M and M+2 of almost equal height show that the molecule contains:',['one bromine atom','one chlorine atom','two oxygen atoms','one fluorine atom'],'Bromine is about 50.7% ⁷⁹Br and 49.3% ⁸¹Br, so M and M+2 are nearly 1:1. Fluorine and iodine have only one isotope.'],
 ['ms','c-m3','The base peak in a mass spectrum is:',['the tallest peak, set to 100% abundance','the molecular ion','the peak at the highest m/z','the peak at the lowest m/z'],'Heights are scaled to the tallest peak, which comes from the most stable or most easily formed ion. It is often a fragment rather than M⁺.'],
 ['ms','c-m4','A compound has M⁺ at m/z 73 (an odd number). It contains:',['an odd number of nitrogen atoms','no nitrogen','a halogen','an even number of nitrogen atoms'],'The nitrogen rule: a neutral molecule with an odd nominal mass has an odd number of N atoms, because nitrogen has an even mass but an odd valence.'],
 ['ms','c-m5','A strong peak at m/z 91 in the spectrum of an alkylbenzene is usually:',['C₇H₇⁺, the benzyl / tropylium cation','C₆H₅⁺, the phenyl cation','CH₃CO⁺','the molecular ion'],'Alkylbenzenes cleave at the benzylic bond. The benzyl cation rearranges to the very stable aromatic tropylium ion, C₇H₇⁺ at m/z 91.'],
 ['ms','c-m6','A strong peak at m/z 43 in the spectrum of a methyl ketone is usually:',['CH₃CO⁺, an acylium ion','CO₂⁺','C₆H₅⁺','CH₂=OH⁺'],'α-Cleavage next to the carbonyl gives a resonance-stabilised acylium ion. For methyl ketones, CH₃C≡O⁺ appears at m/z 43 (C₃H₇⁺ also has m/z 43).'],
 ['ms','c-m7','A peak 15 mass units below M⁺ corresponds to loss of:',['a methyl radical, CH₃•','water','an ethyl radical','CO'],'Common losses: 15 (CH₃), 18 (H₂O), 28 (CO or C₂H₄), 29 (C₂H₅ or CHO), 31 (OCH₃) and 45 (OC₂H₅ or COOH).'],
 ['ms','c-m8','The M+1 peak is mainly caused by:',['¹³C, which is about 1.1% of carbon','²H (deuterium)','loss of a hydrogen atom','¹⁵N'],'Each carbon has a 1.1% chance of being ¹³C, so the M+1 peak is roughly 1.1% × (number of carbons) of the M peak. An M+1 of 11% suggests about 10 carbons.'],
 ['combo','c-k1','A degree of unsaturation of 4 in a compound with at least six carbons often means:',['a benzene ring (one ring + three C=C)','four separate rings','a single triple bond','a carboxylic acid'],'Each ring or π bond counts as one degree of unsaturation. Benzene has one ring and three double bonds, so 4. A C=O on top would take it to 5, as in acetophenone.'],
 ['combo','c-k2','Which technique is quickest for telling an aldehyde from a ketone?',['¹H NMR (a CHO signal at δ 9–10) or IR (C–H bands at 2720/2820)','mass spectrometry only','counting ¹³C signals','UV–vis'],'The aldehyde C–H is unmistakable in ¹H NMR at δ 9–10 and gives two weak IR bands near 2720 and 2820 cm⁻¹. In DEPT-135 the aldehyde carbon is a CH, while a ketone carbon disappears.'],
 ['combo','c-k3','What is the best first step when you get a formula and a set of spectra?',['work out the degree of unsaturation from the formula','assign the smallest ¹H signal','guess a structure and check it','look at the fingerprint region'],'The degree of unsaturation tells you how many rings and π bonds you are looking for. Then use IR for functional groups, ¹³C for the number of carbon types and ¹H for how the pieces join.'],
];


/* ---------- v14: spectroscopy lessons and practice ---------- */
const SP={view:null,lesson:null,qz:null,setupSel:null,setupLen:10};
const fmlHTML=f=>esc(f).replace(/(\d+)/g,'<sub>$1</sub>');
function spSeed(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)}return()=>{h^=h<<13;h^=h>>>17;h^=h<<5;return((h>>>0)%100000)/100000}}
function spAtoms(f){const m={};for(const[,e,n]of String(f).matchAll(/([A-Z][a-z]?)(\d*)/g))m[e]=(m[e]||0)+(n===''?1:+n);return m}
function spDoU(f){const a=spAtoms(f),X=(a.F||0)+(a.Cl||0)+(a.Br||0)+(a.I||0);return(2*(a.C||0)+2+(a.N||0)-(a.H||0)-X)/2}
const SP_MULT={s:'singlet',d:'doublet',t:'triplet',q:'quartet',quint:'quintet',sext:'sextet',sept:'septet',dd:'doublet of doublets',td:'triplet of doublets',qd:'quartet of doublets',dt:'doublet of triplets',m:'multiplet','br s':'broad singlet'};
const SP_NEIGH={s:0,d:1,t:2,q:3,quint:4,sext:5,sept:6};
const spHEnv=c=>c.h.reduce((s,r)=>s+(r[5]||1),0);
/* --- line patterns for 1H multiplets: [offset (Hz or ppm), weight] --- */
function spPattern(r){
  const[sh,n,mu,J]=r,binom=k=>{let row=[1];for(let i=0;i<k;i++)row=row.map((v,j)=>v+(row[j-1]||0)).concat(1);return row};
  const split=(lines,k,j)=>{const b=binom(k),out=[];for(const[o,w]of lines)b.forEach((bw,i)=>out.push([o+(i-k/2)*j,w*bw]));return out};
  const Js=Array.isArray(J)?J:[J];
  const code={d:[[1,0]],t:[[2,0]],q:[[3,0]],quint:[[4,0]],sext:[[5,0]],sept:[[6,0]],dd:[[1,0],[1,1]],td:[[2,0],[1,1]],qd:[[3,0],[1,1]],dt:[[1,0],[2,1]]}[mu];
  if(mu==='m'){const rnd=spSeed(sh+':'+n),sp=J||.05,k=7+Math.floor(rnd()*4),out=[];for(let i=0;i<k;i++)out.push([(i/(k-1)-.5)*2*sp*400,.5+rnd()]);return{lines:out,ppm:false}}
  if(!code)return{lines:[[0,1]],ppm:false};
  let lines=[[0,1]];for(const[k,ji]of code)lines=split(lines,k,Js[ji]||Js[0]);return{lines,ppm:false};
}
const spAxis=(x0,x1,y,ticks,fmt,lbl,w)=>`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" class="sp-ax"/>${ticks.map(([x,v])=>`<line x1="${x}" y1="${y}" x2="${x}" y2="${y+4}" class="sp-ax"/><text x="${x}" y="${y+16}" class="sp-tk">${fmt(v)}</text>`).join('')}<text x="${(x0+x1)/2}" y="${y+31}" class="sp-al">${lbl}</text>`;
function spRows(items,maxRows){const ends=[];for(const it of items.sort((a,b)=>a.x-b.x)){let r=ends.findIndex(e=>e+6<it.x-it.w/2);if(r<0){r=ends.length<maxRows?ends.length:ends.indexOf(Math.min(...ends))}ends[r]=it.x+it.w/2;it.row=r}return Math.max(1,ends.length)}
function spSVG(w,h,inner,title){return`<svg class="sp-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}">${inner}</svg>`}
/* IR spectrum */
function spIR(c,o={}){
  const w=640,h=o.h||236,L=46,R=12,T=14,B=40,pw=w-L-R,ph=h-T-B,lo=450,hi=4000,x=nu=>L+(hi-nu)/(hi-lo)*pw;
  const pk=c.ir.map(p=>({nu:p[0],d:{s:.8,m:.5,w:.22}[p[1]]||.4,hw:p[2]==='vb'?300:p[2]==='b'?110:(typeof p[2]==='number'&&p[2]>0?p[2]:p[0]>2600?16:8),lab:p[3]}));
  const rnd=spSeed('ir'+c.id);for(let k=0;k<8;k++)pk.push({nu:620+rnd()*820,d:.06+rnd()*.16,hw:4+rnd()*6});
  const T_=nu=>{let t=.95-.04*(nu-lo)/(hi-lo);for(const p of pk){const dx=nu-p.nu;t*=1-p.d*p.hw*p.hw/(dx*dx+p.hw*p.hw)}return t};
  let d='';for(let nu=hi;nu>=lo;nu-=2){const X=x(nu),Y=T+ph*(1-T_(nu));d+=(d?'L':'M')+X.toFixed(1)+' '+Y.toFixed(1)}
  const ticks=[4000,3500,3000,2500,2000,1500,1000,500].map(v=>[x(v),v]);
  const labs=o.labels===false?'':pk.filter(p=>p.lab).map(p=>{const X=x(p.nu),Y=T+ph*(1-T_(p.nu));return`<text x="${X.toFixed(1)}" y="${Math.min(T+ph-2,Y+13).toFixed(1)}" class="sp-pl">${p.nu}</text>`}).join('');
  const grid=[0,50,100].map(v=>{const Y=T+ph*(1-v/100);return`<line x1="${L}" y1="${Y}" x2="${L+pw}" y2="${Y}" class="sp-gr"/><text x="${L-6}" y="${Y+4}" class="sp-tk" text-anchor="end">${v}</text>`}).join('');
  return spSVG(w,h,`${grid}<path d="${d}" class="sp-tr"/>${labs}${spAxis(L,L+pw,T+ph,ticks,v=>v,'Wavenumber (cm⁻¹)')}<text x="12" y="${T+ph/2}" class="sp-al" transform="rotate(-90 12 ${T+ph/2})">% T</text>`,'IR spectrum')}
/* 1H NMR spectrum */
function spH(c,o={}){
  const w=640,L=14,R=14,B=40,pw=w-L-R;
  const top=Math.max(10,Math.ceil(Math.max(...c.h.map(r=>r[0]))+.6)),lo=-.4,x=d=>L+(top-d)/(top-lo)*pw,pxHz=.55,pxPpm=pw/(top-lo);
  const lab=c.h.map(r=>{const t=`${r[1]}H${o.mult===false?'':', '+(r[2]==='br s'?'br s':r[2])}`;return{x:x(r[0]),t,w:t.length*6.8}}),nr=spRows(lab,3);
  const T=14+nr*14,h=(o.h||220)+nr*14,ph=h-T-B;
  const lines=[];
  c.h.forEach((r,si)=>{const br=r[2]==='br s',p=spPattern(r),sum=p.lines.reduce((s,l)=>s+l[1],0);const cx=x(r[0]);
    for(const[o2,wt]of p.lines)lines.push({x:cx+(r[2]==='m'?o2/400*pxPpm:o2*pxHz),a:r[1]*wt/sum,g:br?6:.75,si})});
  lines.push({x:x(0),a:.6,g:.7,si:-1});
  const xs=[];for(let X=L;X<=L+pw;X+=.5)xs.push(X);
  const ys=xs.map(X=>{let y=0;for(const l of lines){const dx=X-l.x;y+=l.a*l.g*l.g/(dx*dx+l.g*l.g)/(l.g>2?3.2:1)}return y});
  const mx=Math.max(...ys)||1;let d='';xs.forEach((X,i)=>{d+=(i?'L':'M')+X.toFixed(1)+' '+(T+ph-ys[i]/mx*ph*.92).toFixed(1)});
  const lt=lab.map(l=>`<text x="${l.x.toFixed(1)}" y="${12+l.row*14}" class="sp-pl">${esc(l.t)}</text>`).join('');
  const ticks=[];for(let v=Math.floor(top);v>=0;v--)ticks.push([x(v),v]);
  return spSVG(w,h,`<path d="${d}" class="sp-tr"/>${lt}<text x="${x(0)}" y="${T+ph-ph*.6*.92/mx-6}" class="sp-pl sp-tms">TMS</text>${spAxis(L,L+pw,T+ph,ticks,v=>v,'δ (ppm)')}`,'1H NMR spectrum')}
/* 13C NMR spectrum */
function spC(c,o={}){
  const w=640,L=14,R=14,B=40,pw=w-L-R,top=220,x=d=>L+(top-d)/top*pw,rnd=spSeed('c'+c.id),lh=o.dept?26:14;
  const sticks=c.c.map(r=>({x:x(r[0]),f:r[1]==='C'?.35:.72+rnd()*.28,r,w:o.dept?24:18})),nr=spRows(sticks,4);
  const T=14+nr*lh,h=(o.h||176)+nr*lh,ph=h-T-B;
  const s=sticks.map(k=>{const y0=12+k.row*lh,tag=o.dept?`<text x="${k.x.toFixed(1)}" y="${y0+12}" class="sp-dept">${k.r[1].replace(/(\d)/,'<tspan baseline-shift="sub" font-size="70%">$1</tspan>')}</text>`:'';
    return`<line x1="${k.x.toFixed(1)}" y1="${T+ph}" x2="${k.x.toFixed(1)}" y2="${(T+ph-k.f*ph*.92).toFixed(1)}" class="sp-st"/><line x1="${k.x.toFixed(1)}" y1="${y0+(o.dept?16:4)}" x2="${k.x.toFixed(1)}" y2="${(T+ph-k.f*ph*.92-3).toFixed(1)}" class="sp-lead"/><text x="${k.x.toFixed(1)}" y="${y0}" class="sp-pl">${k.r[0].toFixed(0)}</text>${tag}`}).join('');
  const ticks=[220,200,180,160,140,120,100,80,60,40,20,0].map(v=>[x(v),v]);
  return spSVG(w,h,`${s}${spAxis(L,L+pw,T+ph,ticks,v=>v,'δ (ppm)')}`,'13C NMR spectrum')}
/* mass spectrum */
function spMS(c,o={}){
  const w=640,h=o.h||220,L=40,R=14,T=30,B=40,pw=w-L-R,ph=h-T-B,hi=Math.ceil((Math.max(...c.ms.map(p=>p[0]))+12)/10)*10,lo=10,x=m=>L+(m-lo)/(hi-lo)*pw;
  const labs=c.ms.filter(p=>p[1]>=8||p[2]).map(p=>({x:x(p[0]),w:String(p[0]).length*7,p}));spRows(labs,3);const lr=new Map(labs.map(l=>[l.p,l.row]));
  const bars=c.ms.map(p=>{const X=x(p[0]),Y=T+ph*(1-p[1]/100),r=lr.get(p);return`<line x1="${X.toFixed(1)}" y1="${T+ph}" x2="${X.toFixed(1)}" y2="${Y.toFixed(1)}" class="sp-bar"/>${r!=null?`<text x="${X.toFixed(1)}" y="${(Y-5-r*12).toFixed(1)}" class="sp-pl sp-sm">${p[0]}</text>`:''}`}).join('');
  const rnd=spSeed('ms'+c.id);let noise='';for(let k=0;k<10;k++){const m=Math.round(lo+5+rnd()*(c.M-12));if(c.ms.some(p=>Math.abs(p[0]-m)<1))continue;const X=x(m);noise+=`<line x1="${X.toFixed(1)}" y1="${T+ph}" x2="${X.toFixed(1)}" y2="${(T+ph*(1-(1+rnd()*5)/100)).toFixed(1)}" class="sp-bar"/>`}
  const ticks=[];const step=hi>120?20:10;for(let v=Math.ceil(lo/step)*step;v<=hi;v+=step)ticks.push([x(v),v]);
  const grid=[0,50,100].map(v=>{const Y=T+ph*(1-v/100);return`<line x1="${L}" y1="${Y}" x2="${L+pw}" y2="${Y}" class="sp-gr"/><text x="${L-6}" y="${Y+4}" class="sp-tk" text-anchor="end">${v}</text>`}).join('');
  return spSVG(w,h,`${grid}${noise}${bars}${spAxis(L,L+pw,T+ph,ticks,v=>v,'m/z')}<text x="12" y="${T+ph/2}" class="sp-al" transform="rotate(-90 12 ${T+ph/2})">Rel. abundance</text>`,'Mass spectrum')}
function spFig(kind,id,cap,o){const c=SP_BY[id];if(!c)return'';const f={ir:spIR,h:spH,c:spC,dept:(c2,o2)=>spC(c2,{...o2,dept:true}),ms:spMS}[kind];
  return`<figure class="sp-fig"><figcaption><b>${esc(cap||c.n)}</b> <span>${fmlHTML(c.f)} · ${{ir:'IR',h:'¹H NMR',c:'¹³C NMR',dept:'¹³C NMR with DEPT',ms:'Mass spectrum'}[kind]}</span></figcaption>${f(c,o||{})}</figure>`}
function spTable(rows,head){return`<div class="nm-tablewrap"><table class="nm-table sp-table"><thead><tr>${head.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(x=>`<td>${x}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}
/* shift range chart */
function spRanges(rows,top,unit){
  const w=640,L=150,R=14,rh=20,h=rows.length*rh+44,pw=w-L-R,x=d=>L+(top-d)/top*pw;
  const bars=rows.map(([lbl,a,b],i)=>{const y=10+i*rh;return`<text x="${L-8}" y="${y+12}" class="sp-rl" text-anchor="end">${lbl}</text><rect x="${x(b).toFixed(1)}" y="${y+3}" width="${Math.max(4,x(a)-x(b)).toFixed(1)}" height="${rh-8}" rx="4" class="sp-rb"/>`}).join('');
  const ticks=[];const st=top>50?20:1;for(let v=top;v>=0;v-=st)ticks.push([x(v),v]);
  return spSVG(w,h,bars+spAxis(L,L+pw,10+rows.length*rh+4,ticks,v=>v,unit),'Chemical shift ranges')}
const SP_LESSONS=[
 {id:'intro',title:'How to solve a structure',lede:'Each technique answers a different question. Used together, they pin down a structure.',sections:[
  {h:'What each technique tells you',html:spTable([['Mass spectrometry','Molecular mass (M⁺), chlorine or bromine from isotope peaks, nitrogen from an odd mass, and pieces of the molecule from fragments.'],['Infrared (IR)','Which functional groups are present: O–H, N–H, C=O, C≡N, C≡C, C=C.'],['¹³C NMR','How many different carbon environments, and what type each is (C=O, aromatic, C–O, alkyl). DEPT shows CH₃, CH₂, CH and C.'],['¹H NMR','How many H environments, how many H in each (integration), what they are near (chemical shift) and how many neighbours they have (splitting).']],['Technique','What it tells you'])},
  {h:'Degree of unsaturation',html:'<p>Before looking at any spectrum, work out how many rings and π bonds the formula allows:</p><p class="sp-eq">DoU = C + 1 + N/2 − (H + X)/2</p><p>where X is the number of halogens. Oxygen and sulfur don\'t count. Each ring or double bond is 1, a triple bond is 2 and a benzene ring is 4.</p>'+spTable([['C₄H₈O','4 + 1 − 4 = <b>1</b>','one C=O, one C=C or one ring'],['C₈H₈O','8 + 1 − 4 = <b>5</b>','benzene ring (4) + C=O (1)'],['C₃H₅N','3 + 1 + 0.5 − 2.5 = <b>2</b>','C≡N'],['C₄H₉Br','4 + 1 − 5 = <b>0</b>','no rings, no π bonds']],['Formula','Calculation','Likely meaning'])},
  {h:'A step-by-step strategy',html:'<ol><li>Find the formula and work out the degree of unsaturation.</li><li>Use IR to spot the functional groups. Is there a C=O? An O–H or N–H?</li><li>Count the ¹³C signals. Look for C=O (160–220), aromatic or alkene (100–150) and C–O (50–90) carbons.</li><li>Use ¹H integration to count H in each environment, then chemical shift and splitting to see which groups are next to each other.</li><li>Draw candidate structures and check every signal against them, including the mass spectrum fragments.</li></ol>'}]},
 {id:'ir',title:'Infrared spectroscopy',lede:'Bonds absorb infrared light at frequencies that depend on how strong the bond is and how heavy its atoms are. Each functional group has tell-tale bands.',sections:[
  {h:'Reading an IR spectrum',html:'<p>The x-axis is the <b>wavenumber</b> (cm⁻¹), running from 4000 on the left to about 500 on the right. Absorptions point downwards (lower % transmittance). Stronger, stiffer bonds and lighter atoms absorb at higher wavenumbers: C≡C > C=C > C–C, and C–H > C–C.</p><p>The region above 1500 cm⁻¹ holds the diagnostic stretches. Below 1500 cm⁻¹ is the <b>fingerprint region</b>: complex, and unique to each compound, but hard to assign.</p>'},
  {h:'Key absorptions',html:spTable([['O–H (alcohol)','3200–3550','strong, broad'],['O–H (carboxylic acid)','2500–3300','strong, very broad'],['N–H','3300–3500','medium; two bands for NH₂, one for NH'],['≡C–H','≈ 3300','strong, sharp'],['=C–H (alkene, aromatic)','3000–3100','medium'],['C–H (alkyl)','2850–2960','strong'],['C–H (aldehyde)','2720 and 2820','two weak bands'],['C≡N','2210–2260','medium'],['C≡C','2100–2260','weak'],['C=O','1650–1820','strong (see below)'],['C=C (alkene)','1620–1680','weak to medium'],['C=C (aromatic)','1450–1600','several, medium'],['C–O','1000–1300','strong']],['Bond','Wavenumber (cm⁻¹)','Appearance'])},
  {h:'Telling carbonyls apart',html:'<p>Where a C=O absorbs depends on what is attached to it:</p>'+spTable([['Acid chloride','≈ 1800'],['Anhydride','≈ 1820 and 1760 (two bands)'],['Ester','1735–1750'],['Aldehyde','1720–1740'],['Ketone','≈ 1715'],['Carboxylic acid','1700–1725'],['Amide','1650–1690']],['Carbonyl','Wavenumber (cm⁻¹)'])+'<p>Conjugation with C=C or a benzene ring lowers each value by about 20–30 cm⁻¹.</p>'},
  {h:'Three examples',html:'<div class="sp-figs">{{ir:pr2ol:Alcohol: broad O–H, C–O}}{{ir:acetone:Ketone: strong C=O at 1715}}{{ir:propacid:Carboxylic acid: very broad O–H and C=O}}</div>'}]},
 {id:'hnmr',title:'¹H NMR spectroscopy',lede:'Proton NMR tells you how many kinds of hydrogen there are, how many of each, what is near them and how many neighbours they have.',sections:[
  {h:'Equivalent hydrogens',html:'<p>Hydrogens in the same environment (related by symmetry or by fast rotation) give one signal. The three H of a CH₃ are always equivalent. Both CH₃ groups of propan-2-ol are equivalent, so it shows just three signals.</p>'},
  {h:'Chemical shift',html:'<p>Shifts are measured in ppm (δ) from TMS at δ 0. Electronegative atoms, π bonds and aromatic rings pull electron density away from nearby H and move them <b>downfield</b> (higher δ).</p>'+spRanges([['R–CH₃, R–CH₂–R',0.8,1.6],['C=C–CH, Ar–CH₃',1.6,2.6],['O=C–CH',2.0,2.7],['N–CH',2.2,3.0],['Hal–CH',3.0,4.2],['O–CH',3.3,4.5],['C=C–H',4.5,6.5],['Ar–H',6.5,8.5],['O=C–H (aldehyde)',9.0,10.0],['COOH',10.0,13.0],['R–OH, R–NH (variable)',1.0,5.0]],13,'δ (ppm)')},
  {h:'Integration',html:'<p>The area under each signal is proportional to the number of H causing it. Spectra here print the result above each signal (for example "2H").</p>'},
  {h:'Splitting: the n + 1 rule',html:'<p>A signal is split by H on <b>neighbouring</b> carbons. With n equivalent neighbours it has n + 1 lines:</p>'+spTable([['0','singlet (s)','1'],['1','doublet (d)','1 : 1'],['2','triplet (t)','1 : 2 : 1'],['3','quartet (q)','1 : 3 : 3 : 1'],['4','quintet','1 : 4 : 6 : 4 : 1'],['6','septet','1 : 6 : 15 : 20 : 15 : 6 : 1']],['Neighbouring H','Pattern','Line ratio'])+'<p>Coupled signals share the same spacing (the coupling constant J, in Hz). OH and NH protons usually exchange quickly, so they appear as broad singlets and don\'t split their neighbours. Spectra here widen the splitting so you can see the lines.</p>'},
  {h:'Classic patterns',html:'<div class="sp-figs">{{h:etoac:Ethyl group: 2H quartet + 3H triplet}}{{h:pr2ol:Isopropyl group: 1H septet + 6H doublet}}{{h:tolual:Para-disubstituted ring: two 2H doublets}}</div>'}]},
 {id:'cnmr',title:'¹³C NMR spectroscopy',lede:'Carbon NMR counts the carbon environments in a molecule and tells you what kind of carbon each one is.',sections:[
  {h:'One line per carbon environment',html:'<p>Spectra are run with the hydrogens decoupled, so each different carbon gives a single line. Count the lines to count the environments: symmetry reduces the number, as in pentan-3-one (3 signals for 5 carbons).</p><p>Peak heights are not reliable: carbons with no H attached are usually small.</p>'},
  {h:'Chemical shift',html:spRanges([['C=O (ketone, aldehyde)',190,220],['C=O (acid, ester, amide)',160,185],['C=C, aromatic',100,150],['C≡N',115,125],['C≡C',65,90],['C–O',50,90],['C–N',30,65],['C–Hal',25,65],['alkyl C',0,50]],220,'δ (ppm)')},
  {h:'DEPT: how many H on each carbon',html:'<p>A DEPT-135 experiment shows CH and CH₃ carbons pointing up, CH₂ carbons pointing down, and leaves out carbons with no H. Here the type is printed above each line instead.</p><div class="sp-figs">{{dept:butanone:Butan-2-one}}{{dept:butanal:Butanal}}</div><p>Both are C₄H₈O carbonyl compounds, but the aldehyde\'s C=O carbon is a CH while the ketone\'s has no H.</p>'}]},
 {id:'ms',title:'Mass spectrometry',lede:'A mass spectrometer ionises molecules, breaks some of them into pieces and sorts the ions by mass.',sections:[
  {h:'The molecular ion and the base peak',html:'<p>The <b>molecular ion</b> (M⁺) is the molecule minus one electron, so its m/z is the molecular mass. It is usually the peak furthest to the right (ignoring small isotope peaks). The tallest peak, the <b>base peak</b>, is set to 100%.</p><p><b>Nitrogen rule</b>: an odd molecular mass means an odd number of nitrogen atoms.</p>'},
  {h:'Isotope patterns',html:'<p>Chlorine and bromine have two common isotopes two mass units apart:</p>'+spTable([['one Cl','M : M+2 ≈ 3 : 1'],['one Br','M : M+2 ≈ 1 : 1'],['carbon','M+1 ≈ 1.1% × number of C']],['Atoms','Pattern'])+'<div class="sp-figs">{{ms:chloropropane2:2-Chloropropane: 3 : 1 at m/z 78 / 80}}{{ms:phbr:Bromobenzene: 1 : 1 at m/z 156 / 158}}</div>'},
  {h:'Common fragments',html:spTable([['M − 15','loss of CH₃'],['M − 18','loss of H₂O (alcohols)'],['M − 29','loss of C₂H₅ or CHO'],['M − 31','loss of OCH₃ (methyl esters)'],['m/z 29','CHO⁺ or C₂H₅⁺'],['m/z 31','CH₂=OH⁺ (primary alcohols)'],['m/z 43','CH₃CO⁺ or C₃H₇⁺'],['m/z 57','C₄H₉⁺ or C₂H₅CO⁺'],['m/z 77','C₆H₅⁺'],['m/z 91','C₇H₇⁺ (tropylium, from benzyl groups)'],['m/z 105','C₆H₅CO⁺']],['Peak','Usually means'])+'<p>Cleavage next to a C=O or a heteroatom (α-cleavage) gives stabilised cations. Carbonyl compounds with an H three carbons away can also lose an alkene in a <b>McLafferty rearrangement</b>, as with butanal (m/z 44).</p>'}]},
 {id:'combo',title:'Putting it together',lede:'A worked example using every technique on one unknown.',sections:[
  {h:'The data',html:'<p>An unknown liquid has the formula <b>C₄H₈O₂</b>.</p><div class="sp-figs">{{ms:etoac:Mass spectrum}}{{ir:etoac:IR spectrum}}{{c:etoac:¹³C NMR}}{{h:etoac:¹H NMR}}</div>'},
  {h:'Working through it',html:'<ol><li><b>Degree of unsaturation</b>: 4 + 1 − 4 = 1, so one C=O, C=C or ring.</li><li><b>Mass spectrum</b>: M⁺ at m/z 88 fits C₄H₈O₂. The base peak at m/z 43 suggests CH₃CO⁺.</li><li><b>IR</b>: a strong band at 1742 cm⁻¹ (ester C=O) and a strong band at 1240 cm⁻¹ (C–O), but no O–H. So probably an ester.</li><li><b>¹³C</b>: four signals, so four different carbons. δ 171 is an ester C=O; δ 60 is a carbon on oxygen.</li><li><b>¹H</b>: a 2H quartet at δ 4.1 (OCH₂ next to CH₃), a 3H singlet at δ 2.0 (CH₃ on C=O, no neighbours) and a 3H triplet at δ 1.3 (CH₃ next to CH₂).</li></ol><p>Everything fits <b>ethyl ethanoate</b>, CH₃COOCH₂CH₃. Its isomer methyl propanoate would show an OCH₃ singlet at δ 3.7 and a quartet at δ 2.3 instead.</p>'}]},
];
function spLessonHTML(html){return html.replace(/\{\{(ir|h|c|dept|ms):([a-z0-9]+):([^}]*)\}\}/g,(m,k,id,cap)=>spFig(k,id,cap))}
/* question pool (stable ids for progress tracking) */
const SP_ISO=(()=>{const g={};SP_BANK.forEach(c=>(g[c.f]=g[c.f]||[]).push(c.id));return g})();
const SP_SPLIT_SKIP=new Set(['hexyne:1','nmeacetamide:1']);
function spPool(){
  const P=[];
  for(const c of SP_BANK){
    const iso=SP_ISO[c.f].length;
    if(!['haloalkane','haloarene'].includes(c.cls))P.push({id:'sp:ir:'+c.id,t:'ir',k:'idIR',c});
    if(iso>=2)P.push({id:'sp:h:'+c.id,t:'hnmr',k:'idH',c});
    if(c.id!=='hexene')P.push({id:'sp:nh:'+c.id,t:'hnmr',k:'countH',c});
    const si=c.h.findIndex((r,i)=>SP_NEIGH[r[2]]!=null&&r[0]<6.5&&!SP_SPLIT_SKIP.has(c.id+':'+i)&&r[2]!=='s');
    if(si>=0)P.push({id:'sp:sp:'+c.id,t:'hnmr',k:'split',c,si});
    P.push({id:'sp:nc:'+c.id,t:'cnmr',k:'countC',c});
    if(iso>=2)P.push({id:'sp:c:'+c.id,t:'cnmr',k:'idC',c});
    P.push({id:'sp:ms:'+c.id,t:'ms',k:'idMS',c});
    if(iso>=2)P.push({id:'sp:all:'+c.id,t:'combo',k:'idAll',c});
  }
  for(const f of Object.keys(SP_ISO))P.push({id:'sp:dou:'+f,t:'combo',k:'dou',f});
  for(const[t,id,q,opts,why]of SP_CONCEPT)P.push({id:'sp:'+id,t,k:'concept',q,opts,why});
  return P;
}
let SP_POOL=null;const spPoolGet=()=>SP_POOL||(SP_POOL=spPool());
function spTopicStats(t){const qs=spPoolGet().filter(q=>q.t===t);return{m:qs.filter(q=>(App.quiz.q[q.id]||{}).last===1).length,n:qs.length}}
function spAllStats(){const qs=spPoolGet();return{m:qs.filter(q=>(App.quiz.q[q.id]||{}).last===1).length,n:qs.length}}
/* build one question */
function spDistractors(c,pred,n){const pool=shuffle(SP_BANK.filter(x=>x.id!==c.id&&pred(x)));return pool.slice(0,n)}
function spStructOpts(c,k){
  let others=[];
  if(k==='idIR'){const iso=SP_BANK.filter(x=>x.f===c.f&&x.cls!==c.cls&&!['haloalkane','haloarene'].includes(x.cls));others=shuffle(iso).slice(0,3);
    if(others.length<3)others=others.concat(spDistractors(c,x=>x.cls!==c.cls&&!others.includes(x)&&!['haloalkane','haloarene'].includes(x.cls)&&Math.abs(x.M-c.M)<40,3-others.length))}
  else if(k==='idMS'){const used=new Set([c.M]);for(const x of shuffle(SP_BANK)){if(others.length>=3)break;if(x.id===c.id||used.has(x.M))continue;const sameHal=(/Cl|Br/.test(x.f))===(/Cl|Br/.test(c.f));if(Math.abs(x.M-c.M)>50&&!sameHal)continue;used.add(x.M);others.push(x)}}
  else{others=shuffle(SP_BANK.filter(x=>x.f===c.f&&x.id!==c.id)).slice(0,3);if(others.length<2)others=others.concat(spDistractors(c,x=>x.f!==c.f&&!others.includes(x)&&Math.abs(x.M-c.M)<=16&&x.cls!==c.cls,3-others.length))}
  return shuffle([c,...others])}
function spNumOpts(ans){const s=new Set([ans]);const cand=shuffle([ans-2,ans-1,ans+1,ans+2,ans+3].filter(v=>v>0));for(const v of cand){if(s.size>=4)break;s.add(v)}return[...s].sort((a,b)=>a-b)}
function spBuild(q){
  const c=q.c;
  if(q.k==='concept'){const o=shuffle(q.opts);return{prompt:esc(q.q),kind:'text',opts:o,ans:q.opts[0],why:q.why}}
  if(q.k==='dou'){const d=spDoU(q.f);return{prompt:`What is the degree of unsaturation of <b>${fmlHTML(q.f)}</b>?`,kind:'text',opts:spNumOpts(d).map(String),ans:String(d),why:`DoU = C + 1 + N/2 − (H + X)/2. For ${fmlHTML(q.f)}: ${(()=>{const a=spAtoms(q.f),X=(a.F||0)+(a.Cl||0)+(a.Br||0)+(a.I||0);return`${a.C||0} + 1${a.N?' + '+a.N+'/2':''} − (${a.H||0}${X?' + '+X:''})/2 = ${d}`})()}.`}}
  const sig=c.h.map(r=>`δ ${r[0]} (${r[1]}H, ${SP_MULT[r[2]]||r[2]}): ${esc(r[4])}`).join('<br>');
  const keyIR=c.ir.filter(p=>p[3]).map(p=>`${p[0]} cm⁻¹: ${esc(p[3])}`).join('<br>');
  const cs=c.c.map(r=>`δ ${r[0]} (${r[1].replace(/(\d)/,'<sub>$1</sub>')}): ${esc(r[2])}`).join('<br>');
  const msx=c.ms.filter(p=>p[2]).map(p=>`m/z ${p[0]}: ${esc(p[2])}`).join('<br>');
  if(q.k==='idIR')return{prompt:`This IR spectrum belongs to a compound with formula <b>${fmlHTML(c.f)}</b>. Which compound is it?`,figs:spIR(c),kind:'struct',opts:spStructOpts(c,q.k),ans:c,why:`The answer is <b>${esc(c.n)}</b>. Key bands:<br>${keyIR||'only C–H bands'}`}
  if(q.k==='idH')return{prompt:`This ¹H NMR spectrum belongs to a compound with formula <b>${fmlHTML(c.f)}</b>. Which compound is it?`,figs:spH(c),kind:'struct',opts:spStructOpts(c,q.k),ans:c,why:`The answer is <b>${esc(c.n)}</b>.<br>${sig}`}
  if(q.k==='idC')return{prompt:`This ¹³C NMR spectrum (with the DEPT type of each carbon) belongs to a compound with formula <b>${fmlHTML(c.f)}</b>. Which compound is it?`,figs:spC(c,{dept:true}),kind:'struct',opts:spStructOpts(c,q.k),ans:c,why:`The answer is <b>${esc(c.n)}</b>: ${c.c.length} carbon environment${c.c.length>1?'s':''}.<br>${cs}`}
  if(q.k==='idMS')return{prompt:'Which compound gives this mass spectrum?',figs:spMS(c),kind:'struct',opts:spStructOpts(c,q.k),ans:c,why:`The answer is <b>${esc(c.n)}</b>, ${fmlHTML(c.f)}, molecular mass ${c.M}.${msx?'<br>'+msx:''}`}
  if(q.k==='idAll')return{prompt:`An unknown has formula <b>${fmlHTML(c.f)}</b> (degree of unsaturation ${spDoU(c.f)}). Use all four spectra to identify it.`,figs:`<div class="sp-tabs" role="tablist">${['¹H NMR','¹³C NMR','IR','Mass spec'].map((t,i)=>`<button class="sp-tab${i?'':' on'}" data-sptab="${i}" role="tab" aria-selected="${!i}">${t}</button>`).join('')}</div><div class="sp-tabp">${spH(c)}</div><div class="sp-tabp" hidden>${spC(c,{dept:true})}</div><div class="sp-tabp" hidden>${spIR(c)}</div><div class="sp-tabp" hidden>${spMS(c)}</div>`,kind:'struct',opts:spStructOpts(c,q.k),ans:c,why:`The answer is <b>${esc(c.n)}</b>.<br><b>¹H:</b><br>${sig}${keyIR?'<br><b>IR:</b><br>'+keyIR:''}`}
  if(q.k==='countH'){const n=spHEnv(c);return{prompt:'How many signals would this compound give in its ¹H NMR spectrum (one per H environment)?',struct:c,kind:'text',opts:spNumOpts(n).map(String),ans:String(n),why:`${esc(c.n)} has ${n} hydrogen environments.<br>${sig}${c.h.some(r=>r[5]>1)?'<br>Aromatic H often overlap in a real spectrum, but they are still different environments.':''}`}}
  if(q.k==='countC'){const n=c.c.length,nc=spAtoms(c.f).C;return{prompt:'How many signals would this compound give in its ¹³C NMR spectrum?',struct:c,kind:'text',opts:spNumOpts(n).map(String),ans:String(n),why:`${esc(c.n)} has ${nc} carbons but ${n} carbon environment${n>1?'s':''}${n<nc?' because of symmetry':''}.<br>${cs}`}}
  if(q.k==='split'){const r=c.h[q.si],n=SP_NEIGH[r[2]],ans=SP_MULT[r[2]],names=['singlet','doublet','triplet','quartet','quintet','sextet','septet'],cand=new Set([ans]);for(const v of shuffle([n-1,n+1,n-2,n+2,0].filter(v=>v>=0&&v<=6)))if(cand.size<4)cand.add(names[v]);
    return{prompt:`In the ¹H NMR spectrum of this compound, how is the signal at <b>δ ${r[0]}</b> (${r[1]}H) split?`,struct:c,kind:'text',opts:[...cand].sort((a,b)=>names.indexOf(a)-names.indexOf(b)),ans,why:`That signal is the ${esc(r[4])}. It has ${n} neighbouring H, so by the n + 1 rule it is a ${ans} (${n+1} lines).`}}
}
function spPick(pool,len){const w=q=>{const r=App.quiz.q[q.id];return!r?0:r.last===0?1:2};const g=[0,1,2].map(k=>shuffle(pool.filter(q=>w(q)===k)));return g.flat().slice(0,len||pool.length)}
/* side pane + pages */
function renderSpecSide(){
  const cur=SP.view==='lesson'?SP.lesson:null;const box=$('#specList');if(!box)return;
  box.innerHTML=SP_LESSONS.map((l,i)=>{const t=SP_TOPICS.find(x=>x.id===l.id),s=t?spTopicStats(t.id):null;return`<button class="item${cur===l.id?' on':''}" data-splesson="${l.id}"><span class="t">${esc(l.title)}</span><span class="m">${s?`${s.m} of ${s.n} mastered`:'Start here'}</span>${s?`<span class="nm-meter" aria-hidden="true"><i style="width:${Math.round(100*s.m/s.n)}%"></i></span>`:''}</button>`}).join('');
}
function spOpen(){if(!SP.view)spLesson('intro');else renderSpecSide()}
function spLesson(id){
  const i=SP_LESSONS.findIndex(l=>l.id===id),l=SP_LESSONS[i];if(!l)return;SP.view='lesson';SP.lesson=id;const next=SP_LESSONS[i+1],topic=SP_TOPICS.find(t=>t.id===id);
  $('#specPage').innerHTML=`<article class="nm-lesson sp-lesson"><header class="nm-head"><div class="nm-kicker">${i===0?'Start here':`Lesson ${i} of ${SP_LESSONS.length-1}`}</div><h1>${esc(l.title)}</h1><p class="nm-lede">${esc(l.lede)}</p></header>
   ${l.sections.map(s=>`<section class="nm-sec"><h2>${esc(s.h)}</h2>${spLessonHTML(s.html)}</section>`).join('')}
   <div class="nm-actions"><button class="btn primary" data-sppractice="${topic?topic.id:''}">${topic?'Practise this topic':'Start practising'}</button>${next?`<button class="btn" data-splesson="${next.id}">Next: ${esc(next.title)}</button>`:''}<button class="btn" data-spref="1">Spectroscopy tables</button></div></article>`;
  renderSpecSide();$('#main').scrollTop=0;$('#side').classList.remove('open');
}
function spSetup(topics){
  SP.view='setup';const sel=new Set(topics&&topics.length?topics:SP_TOPICS.map(t=>t.id));SP.setupSel=sel;
  $('#specPage').innerHTML=`<section class="qz-setup"><header class="nm-head"><div class="nm-kicker">Practice</div><h1>Spectroscopy practice</h1><p class="nm-lede">Identify compounds from their spectra, count signals, predict splitting and read isotope patterns. Questions you haven't seen or got wrong come up first.</p></header>
   <h2 class="qz-h">Topics</h2><div class="qz-chips" id="spTopics">${SP_TOPICS.map(t=>{const s=spTopicStats(t.id);return`<button class="qz-chip${sel.has(t.id)?' on':''}" data-sptopic="${t.id}" aria-pressed="${sel.has(t.id)}"><span>${esc(t.title)}</span><small>${s.m}/${s.n}</small></button>`}).join('')}</div>
   <div class="qz-row"><button class="linkbtn" id="spAll">Select all</button><button class="linkbtn" id="spNone">Clear</button></div>
   <h2 class="qz-h">Length</h2><div class="qz-len">${[10,20].map(n=>`<label class="qz-lenopt"><input type="radio" name="splen" value="${n}"${SP.setupLen===n?' checked':''}><span>${n} questions</span></label>`).join('')}</div>
   <div class="nm-actions"><button class="btn primary" id="spStart">Start practice</button></div></section>`;
  const sync=()=>{document.querySelectorAll('#spTopics .qz-chip').forEach(b=>{const on=sel.has(b.dataset.sptopic);b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});$('#spStart').disabled=!sel.size};
  $('#spTopics').onclick=e=>{const b=e.target.closest('.qz-chip');if(!b)return;sel.has(b.dataset.sptopic)?sel.delete(b.dataset.sptopic):sel.add(b.dataset.sptopic);sync()};
  $('#spAll').onclick=()=>{SP_TOPICS.forEach(t=>sel.add(t.id));sync()};$('#spNone').onclick=()=>{sel.clear();sync()};
  $('#spStart').onclick=()=>{SP.setupLen=+document.querySelector('input[name="splen"]:checked').value;spStart({topics:[...sel],len:SP.setupLen})};
  sync();renderSpecSide();$('#main').scrollTop=0;$('#side').classList.remove('open');
}
function spStart(cfg){
  const pool=cfg.ids?spPoolGet().filter(q=>cfg.ids.includes(q.id)):spPoolGet().filter(q=>cfg.topics.includes(q.t));if(!pool.length)return toast('Choose at least one topic.');
  const items=(cfg.ids?shuffle(pool):spPick(pool,cfg.len)).map(q=>({q,b:spBuild(q)}));
  SP.qz={cfg,items,i:0,score:0,answered:false,results:[]};SP.view='quiz';spRenderQ();
}
function spRenderQ(){
  const Z=SP.qz,it=Z.items[Z.i],b=it.b,n=Z.items.length,topic=SP_TOPICS.find(t=>t.id===it.q.t);
  const opts=b.kind==='struct'?`<div class="qz-sopts" role="group" aria-label="Structures">${b.opts.map((c,k)=>`<button class="qz-sopt" data-spk="${k}" aria-label="Option ${k+1}"><span class="qz-key">${k+1}</span>${smilesSVG(c.s,.9)}</button>`).join('')}</div>`
    :`<div class="qz-opts" role="group" aria-label="Answers">${b.opts.map((o,k)=>`<button class="qz-opt" data-spk="${k}"><span class="qz-key">${k+1}</span><span>${esc(o)}</span></button>`).join('')}</div>`;
  $('#specPage').innerHTML=`<section class="qz sp-qz"><div class="qz-top"><span><b>Question ${Z.i+1}</b> of ${n}</span><span class="qz-topic">${esc(topic?topic.title:'')}</span><span class="qz-score">Score ${Z.score}</span><button class="linkbtn" id="spQuit">End practice</button></div>
   <div class="qz-bar" aria-hidden="true"><i style="width:${Math.round(100*Z.i/n)}%"></i></div><div class="qz-card"><p class="qz-prompt">${b.prompt}</p>${b.struct?`<div class="qz-struct">${smilesSVG(b.struct.s,1.2)}</div>`:''}${b.figs?`<div class="sp-qfig">${b.figs}</div>`:''}${opts}<div class="qz-fb" id="spFb" hidden></div></div></section>`;
  Z.answered=false;$('#spQuit').onclick=()=>spFinish(true);renderSpecSide();$('#main').scrollTop=0;
}
function spAnswer(k){
  const Z=SP.qz;if(!Z||Z.answered)return;const it=Z.items[Z.i],b=it.b,ok=b.opts[k]===b.ans;
  document.querySelectorAll('#specPage [data-spk]').forEach((el,j)=>{el.disabled=true;if(b.opts[j]===b.ans)el.classList.add('right');else if(j===k)el.classList.add('wrong')});
  const r=App.quiz.q[it.q.id]||{c:0,w:0};ok?r.c++:r.w++;r.last=ok?1:0;r.at=Date.now();App.quiz.q[it.q.id]=r;if(ok)Z.score++;Z.results.push({q:it.q,ok});Z.answered=true;saveQuiz();
  const last=Z.i===Z.items.length-1,fb=$('#spFb');fb.className='qz-fb '+(ok?'ok':'bad');fb.hidden=false;
  const ansTxt=b.kind==='struct'?esc(b.ans.n):esc(b.ans);
  fb.innerHTML=`<p class="qz-verdict">${ok?'Correct.':b.kind==='struct'?'Not quite.':`Not quite. The answer is <b>${ansTxt}</b>.`}</p><p class="qz-why">${b.why}</p><div class="qz-next"><button class="btn primary" id="spNext">${last?'See results':'Next question'}</button><span class="qz-hint">or press Enter</span></div>`;
  $('#spNext').onclick=spNext;$('.qz-score').textContent='Score '+Z.score;fb.scrollIntoView({block:'nearest',behavior:'smooth'});setTimeout(()=>{const x=$('#spNext');if(x)x.focus({preventScroll:true})},50);
}
function spNext(){const Z=SP.qz;if(!Z||!Z.answered)return;if(Z.i>=Z.items.length-1)return spFinish(false);Z.i++;spRenderQ()}
function spFinish(early){
  const Z=SP.qz;if(!Z)return;if(early&&!Z.results.length){SP.qz=null;return spSetup(Z.cfg.topics)}
  SP.view='summary';const res=Z.results,n=res.length,sc=res.filter(r=>r.ok).length,missed=res.filter(r=>!r.ok);
  const byT={};res.forEach(r=>{const b=byT[r.q.t]=byT[r.q.t]||{ok:0,n:0};b.n++;if(r.ok)b.ok++});
  const pct=n?Math.round(100*sc/n):0,msg=pct===100?'Perfect score.':pct>=80?'Strong work.':pct>=50?'Good progress. The lessons cover anything you missed.':'Keep going. Each lesson has tables and example spectra.';
  $('#specPage').innerHTML=`<section class="qz-sum"><header class="nm-head"><div class="nm-kicker">Practice results</div><h1>${sc} out of ${n}</h1><p class="nm-lede">${msg}</p></header>
   <div class="qz-break">${Object.entries(byT).map(([t,b])=>`<div class="qz-brow"><span>${esc((SP_TOPICS.find(x=>x.id===t)||{}).title||t)}</span><span class="nm-meter"><i style="width:${Math.round(100*b.ok/b.n)}%"></i></span><b>${b.ok}/${b.n}</b></div>`).join('')}</div>
   <div class="nm-actions">${missed.length?`<button class="btn primary" id="spRetry">Retry the ${missed.length} I missed</button>`:''}<button class="btn${missed.length?'':' primary'}" id="spNew">New practice</button><button class="btn" data-splesson="${Z.cfg.topics&&Z.cfg.topics.length===1?Z.cfg.topics[0]:'intro'}">Back to lessons</button></div></section>`;
  if(missed.length)$('#spRetry').onclick=()=>spStart({ids:missed.map(r=>r.q.id),topics:Z.cfg.topics});
  $('#spNew').onclick=()=>spSetup(Z.cfg.topics);SP.qz=null;renderSpecSide();$('#main').scrollTop=0;
}
function spKey(e){
  if(SP.view!=='quiz'||!SP.qz)return false;if(e.target.closest&&e.target.closest('input,textarea,[contenteditable="true"]'))return false;const Z=SP.qz;
  if(e.key==='Enter'&&Z.answered&&!(e.target&&e.target.id==='spNext')){e.preventDefault();spNext();return true}
  if(!Z.answered&&/^[1-4]$/.test(e.key)&&+e.key<=Z.items[Z.i].b.opts.length){spAnswer(+e.key-1);return true}
  return false}
function wireSpectra(){
  const go=e=>{const l=e.target.closest('[data-splesson]');if(l){spLesson(l.dataset.splesson);return}
    const p=e.target.closest('[data-sppractice]');if(p){spSetup(p.dataset.sppractice?[p.dataset.sppractice]:null);return}
    const s=e.target.closest('[data-spsetup]');if(s){spSetup();return}
    const r=e.target.closest('[data-spref]');if(r){openRef('spec');return}
    const k=e.target.closest('[data-spk]');if(k){spAnswer(+k.dataset.spk);return}
    const t=e.target.closest('[data-sptab]');if(t){const i=+t.dataset.sptab,box=t.closest('.sp-qfig');box.querySelectorAll('.sp-tab').forEach((b,j)=>{b.classList.toggle('on',j===i);b.setAttribute('aria-selected',j===i)});box.querySelectorAll('.sp-tabp').forEach((p2,j)=>p2.hidden=j!==i)}};
  $('#specPage').addEventListener('click',go);$('#specSide').addEventListener('click',go);
}


/* ---------- v14: orbitals, MO diagrams and 3D orbital viewer ---------- */
const OB={view:null,atomic:'2pz',hybrid:'sp3',hybP:true,hybOne:true,dia:'O2',diaMo:null,pi:'benzene',piMo:null,cut:false,axes:true};
const OB_PAGES=[{id:'intro',t:'MO theory basics',m:'Start here'},{id:'atomic',t:'Atomic orbitals in 3D',m:'s, p and d orbitals'},{id:'hybrid',t:'Hybrid orbitals',m:'sp, sp² and sp³'},{id:'dia',t:'Diatomic MO diagrams',m:'H₂ to Ne₂, CO and NO'},{id:'pi',t:'π molecular orbitals',m:'Conjugation and aromaticity'}];
const OB_POS='#3f7ff6',OB_NEG='#ef5b5b';
const SUP=s=>String(s).replace(/[0-9+\-−]/g,ch=>({'0':'⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹','+':'⁺','-':'⁻','−':'⁻'}[ch]));
/* ---- hydrogen-like atomic orbitals (Z = 1, distances in bohr) ---- */
const OS2=Math.SQRT2,OS3=Math.sqrt(3),OS6=Math.sqrt(6),OS30=Math.sqrt(30),YS=.28209479,YP=.48860251,YD=1.09254843,YD2=.54627422,YDZ=.31539157;
const AO={
 '1s':{n:1,l:0,lab:'1s',f:(x,y,z,r)=>2*Math.exp(-r)*YS},
 '2s':{n:2,l:0,lab:'2s',f:(x,y,z,r)=>(2-r)*Math.exp(-r/2)/(2*OS2)*YS},
 '2px':{n:2,l:1,lab:'2p<sub>x</sub>',f:(x,y,z,r)=>Math.exp(-r/2)/(2*OS6)*YP*x},
 '2py':{n:2,l:1,lab:'2p<sub>y</sub>',f:(x,y,z,r)=>Math.exp(-r/2)/(2*OS6)*YP*y},
 '2pz':{n:2,l:1,lab:'2p<sub>z</sub>',f:(x,y,z,r)=>Math.exp(-r/2)/(2*OS6)*YP*z},
 '3s':{n:3,l:0,lab:'3s',f:(x,y,z,r)=>2/(81*OS3)*(27-18*r+2*r*r)*Math.exp(-r/3)*YS},
 '3px':{n:3,l:1,lab:'3p<sub>x</sub>',f:(x,y,z,r)=>4/(81*OS6)*(6-r)*Math.exp(-r/3)*YP*x},
 '3py':{n:3,l:1,lab:'3p<sub>y</sub>',f:(x,y,z,r)=>4/(81*OS6)*(6-r)*Math.exp(-r/3)*YP*y},
 '3pz':{n:3,l:1,lab:'3p<sub>z</sub>',f:(x,y,z,r)=>4/(81*OS6)*(6-r)*Math.exp(-r/3)*YP*z},
 '3dxy':{n:3,l:2,lab:'3d<sub>xy</sub>',f:(x,y,z,r)=>4/(81*OS30)*Math.exp(-r/3)*YD*x*y},
 '3dxz':{n:3,l:2,lab:'3d<sub>xz</sub>',f:(x,y,z,r)=>4/(81*OS30)*Math.exp(-r/3)*YD*x*z},
 '3dyz':{n:3,l:2,lab:'3d<sub>yz</sub>',f:(x,y,z,r)=>4/(81*OS30)*Math.exp(-r/3)*YD*y*z},
 '3dx2y2':{n:3,l:2,lab:'3d<sub>x²−y²</sub>',f:(x,y,z,r)=>4/(81*OS30)*Math.exp(-r/3)*YD2*(x*x-y*y)},
 '3dz2':{n:3,l:2,lab:'3d<sub>z²</sub>',f:(x,y,z,r)=>4/(81*OS30)*Math.exp(-r/3)*YDZ*(3*z*z-r*r)},
};
const AO_INFO={
 '1s':'Spherical, with no nodes. The lowest-energy orbital: the one hydrogen\'s electron occupies.',
 '2s':'Spherical, with one radial node: a sphere where ψ = 0. The inner part has the opposite phase to the outer part. Turn on the cutaway to see it.',
 '2p':'Two lobes of opposite phase either side of a nodal plane through the nucleus. The three 2p orbitals point along x, y and z and have the same energy.',
 '3s':'Spherical, with two radial nodes, so three nested shells of alternating phase. Turn on the cutaway to see them.',
 '3p':'Like a 2p orbital, with a nodal plane through the nucleus, plus one radial node that gives each lobe a small inner lobe of opposite phase.',
 '3d':'Two angular nodes. Four of the d orbitals have four lobes between or along the axes; 3d<sub>z²</sub> has two lobes along z and a ring (torus) around the middle, separated by two nodal cones.'};
/* ---- Slater-type orbitals for molecules (three.js coordinates) ---- */
const sto1s=(z)=>{const N=Math.sqrt(z**3/Math.PI);return(dx,dy,dz)=>N*Math.exp(-z*Math.hypot(dx,dy,dz))};
const sto2s=(z)=>{const N=Math.sqrt(z**5/(3*Math.PI));return(dx,dy,dz)=>{const r=Math.hypot(dx,dy,dz);return N*r*Math.exp(-z*r)}};
const sto2p=(z,ax)=>{const N=Math.sqrt(z**5/Math.PI);return(dx,dy,dz)=>N*(ax==='x'?dx:ax==='y'?dy:dz)*Math.exp(-z*Math.hypot(dx,dy,dz))};
/* ---- symmetric eigenproblem (Jacobi) ---- */
function obEig(A){const n=A.length,a=A.map(r=>r.slice()),v=A.map((r,i)=>r.map((_,j)=>i===j?1:0));
  for(let sweep=0;sweep<100;sweep++){let off=0;for(let p=0;p<n;p++)for(let q=p+1;q<n;q++)off+=a[p][q]**2;if(off<1e-20)break;
    for(let p=0;p<n;p++)for(let q=p+1;q<n;q++){if(Math.abs(a[p][q])<1e-15)continue;const th=(a[q][q]-a[p][p])/(2*a[p][q]),t=Math.sign(th||1)/(Math.abs(th)+Math.sqrt(th*th+1)),c=1/Math.sqrt(t*t+1),s=t*c;
      for(let k=0;k<n;k++){const akp=a[k][p],akq=a[k][q];a[k][p]=c*akp-s*akq;a[k][q]=s*akp+c*akq}
      for(let k=0;k<n;k++){const apk=a[p][k],aqk=a[q][k];a[p][k]=c*apk-s*aqk;a[q][k]=s*apk+c*aqk}
      for(let k=0;k<n;k++){const vkp=v[k][p],vkq=v[k][q];v[k][p]=c*vkp-s*vkq;v[k][q]=s*vkp+c*vkq}}}
  return a.map((_,i)=>({x:a[i][i],c:v.map(r=>r[i])})).sort((p,q)=>q.x-p.x)}
/* fill orbitals (Aufbau + Hund). levels: [{deg}] in energy order → occupancy per orbital */
function obFill(levels,ne){let left=ne;return levels.map(L=>{const occ=new Array(L.deg).fill(0);for(let pass=0;pass<2;pass++)for(let i=0;i<L.deg&&left>0;i++){occ[i]++;left--}return occ})}
/* ---- diatomic species ---- */
const OB_DIA={
 'H2+':{l:'H₂⁺',A:'H',B:'H',e:1,s1:true},'H2':{l:'H₂',A:'H',B:'H',e:2,s1:true},'He2+':{l:'He₂⁺',A:'He',B:'He',e:3,s1:true},'He2':{l:'He₂',A:'He',B:'He',e:4,s1:true},
 'Li2':{l:'Li₂',A:'Li',e:2,mix:true},'Be2':{l:'Be₂',A:'Be',e:4,mix:true},'B2':{l:'B₂',A:'B',e:6,mix:true},'C2':{l:'C₂',A:'C',e:8,mix:true},'N2':{l:'N₂',A:'N',e:10,mix:true},'N2+':{l:'N₂⁺',A:'N',e:9,mix:true},
 'O2':{l:'O₂',A:'O',e:12},'O2+':{l:'O₂⁺',A:'O',e:11},'O2-':{l:'O₂⁻ (superoxide)',A:'O',e:13},'O22-':{l:'O₂²⁻ (peroxide)',A:'O',e:14},'F2':{l:'F₂',A:'F',e:14},'Ne2':{l:'Ne₂',A:'Ne',e:16},
 'CO':{l:'CO',A:'C',B:'O',e:10,mix:true,het:true},'CN-':{l:'CN⁻',A:'C',B:'N',e:10,mix:true,het:true},'NO+':{l:'NO⁺',A:'N',B:'O',e:10,mix:true,het:true},'NO':{l:'NO',A:'N',B:'O',e:11,mix:true,het:true}};
const OB_DIA_GROUPS=[['Hydrogen and helium',['H2+','H2','He2+','He2']],['Second row',['Li2','Be2','B2','C2','N2','O2','F2','Ne2']],['Ions',['N2+','O2+','O2-','O22-']],['Heteronuclear',['CO','CN-','NO+','NO']]];
const OB_DIA_NOTE={
 'H2+':'One electron in a bonding orbital gives a bond order of ½. H₂⁺ exists, but its bond is weaker and longer than H₂\'s.',
 'H2':'Both electrons are in the bonding σ orbital, so the bond order is 1: a single bond.',
 'He2+':'The third electron goes into σ*, cancelling half the bonding. He₂⁺ (bond order ½) can be made in a gas discharge.',
 'He2':'Two bonding and two antibonding electrons cancel: bond order 0. That is why helium stays as single atoms.',
 'Li2':'Two electrons in σ2s give a bond order of 1. Li₂ exists in lithium vapour.',
 'Be2':'σ2s and σ*2s are both full, so the bond order is 0. Be₂ is at best a very weakly bound pair.',
 'B2':'With s–p mixing, the π orbitals are lower than σ2p, so the last two electrons go one into each π orbital (Hund\'s rule). B₂ is paramagnetic, which proves the mixed ordering.',
 'C2':'Bond order 2, with both bonds π bonds and all electrons paired.',
 'N2':'Bond order 3: a triple bond (one σ, two π). This very strong bond (945 kJ mol⁻¹) makes N₂ unreactive. Its HOMO is σ2p.',
 'N2+':'Removing an electron from the σ2p HOMO lowers the bond order to 2½.',
 'O2':'Without s–p mixing, σ2p lies below π2p. The last two electrons go one into each π* orbital with parallel spins, so O₂ is paramagnetic: liquid oxygen sticks to a magnet. A Lewis structure (O=O, all paired) can\'t explain this.',
 'O2+':'Removing an antibonding π* electron strengthens the bond: bond order 2½, shorter than in O₂.',
 'O2-':'An extra π* electron lowers the bond order to 1½. Superoxide has one unpaired electron.',
 'O22-':'π* is full, so the bond order is 1: the O–O single bond of peroxides, which is weak.',
 'F2':'Bond order 1. The many antibonding electrons make the F–F bond unusually weak (159 kJ mol⁻¹).',
 'Ne2':'Every bonding orbital is matched by an antibonding one: bond order 0, so neon is monatomic.',
 'CO':'Isoelectronic with N₂, with bond order 3. The oxygen orbitals are lower in energy, so bonding MOs have more O character and antibonding MOs more C character. The HOMO is a σ orbital concentrated on carbon, which is why CO binds metals through C.',
 'CN-':'Isoelectronic with N₂ and CO: bond order 3. Cyanide also binds metals through carbon.',
 'NO+':'Isoelectronic with N₂: bond order 3. The nitrosonium ion is a strong electrophile, used in diazotisation.',
 'NO':'One more electron than N₂, in π*: bond order 2½ and one unpaired electron. NO is a stable radical, and a signalling molecule in the body.'};
function obDiaLevels(sp){
  const D=OB_DIA[sp];
  if(D.s1)return[{lab:'σ1s',b:1,deg:1,y:-1.3,kind:'1s'},{lab:'σ*1s',b:-1,deg:1,y:1.6,kind:'1s'}];
  return D.mix?[{lab:'σ2s',b:1,deg:1,y:-1.25,kind:'2s'},{lab:'σ*2s',b:-1,deg:1,y:.95,kind:'2s'},{lab:'π2p',b:1,deg:2,y:3.0,kind:'pi'},{lab:'σ2p',b:1,deg:1,y:3.65,kind:'sp'},{lab:'π*2p',b:-1,deg:2,y:5.25,kind:'pi'},{lab:'σ*2p',b:-1,deg:1,y:6.5,kind:'sp'}]
   :[{lab:'σ2s',b:1,deg:1,y:-1.45,kind:'2s'},{lab:'σ*2s',b:-1,deg:1,y:.85,kind:'2s'},{lab:'σ2p',b:1,deg:1,y:2.6,kind:'sp'},{lab:'π2p',b:1,deg:2,y:3.25,kind:'pi'},{lab:'π*2p',b:-1,deg:2,y:5.05,kind:'pi'},{lab:'σ*2p',b:-1,deg:1,y:6.65,kind:'sp'}]}
const OB_VAL={H:1,He:2,Li:1,Be:2,B:3,C:4,N:5,O:6,F:7,Ne:8};
function obDiaCalc(sp){const D=OB_DIA[sp],L=obDiaLevels(sp),occ=obFill(L,D.e);let bo=0,un=0;L.forEach((l,i)=>{const n=occ[i].reduce((a,b)=>a+b,0);bo+=l.b*n;un+=occ[i].filter(x=>x===1).length});
  let homo=-1;occ.forEach((o,i)=>{if(o.some(x=>x>0))homo=i});const lumo=occ.findIndex(o=>o.some(x=>x<2));
  const cfg=L.map((l,i)=>{const n=occ[i].reduce((a,b)=>a+b,0);return n?`(${l.lab})${SUP(n)}`:''}).join('');
  return{D,L,occ,bo:bo/2,un,homo,lumo,cfg}}
const arrow=(x,y,up,cls)=>up?`<path class="ob-e ${cls||''}" d="M${x} ${y+8}V${y-8}l-3.2 4.2"/>`:`<path class="ob-e ${cls||''}" d="M${x} ${y-8}V${y+8}l3.2 -4.2"/>`;
function obElectrons(cx,y,n,w){if(!n)return'';if(n===1)return arrow(cx,y,true);return arrow(cx-5,y,true)+arrow(cx+5,y,false)}
function obDiaSVG(sp,o={}){
  const R=obDiaCalc(sp),{D,L,occ}=R,W=560,H=o.small?300:440,top=26,bot=H-26,het=!!D.het;
  const ys=L.map(l=>l.y),aoY=D.s1?{s:0}:{s:0,p:4};const all=ys.concat(Object.values(aoY).map(v=>v+(het?.9:0)),Object.values(aoY).map(v=>v-(het?.7:0)));
  const lo=Math.min(...all)-.6,hi=Math.max(...all)+.6,Y=v=>bot-(v-lo)/(hi-lo)*(bot-top);
  const xA=90,xB=W-90,xM=W/2,lw=46,mw=50;
  const A=D.A,B=D.B||D.A,dA=het?.9:0,dB=het?-.7:0;let s='';
  /* correlation lines */
  const aoLines=(side)=>{const x=side<0?xA:xB,d=side<0?dA:dB;return Object.entries(aoY).map(([k,v])=>({k,x,y:Y(v+d)}))};
  const AOl=aoLines(-1),AOr=aoLines(1);
  L.forEach((l,i)=>{const yy=Y(l.y),key=l.kind==='1s'?'s':l.kind==='2s'?'s':'p';const la=AOl.find(a=>a.k===key),ra=AOr.find(a=>a.k===key);const half=l.deg===2?mw+6:mw/2;
    if(la)s+=`<line x1="${la.x+lw/2+(key==='p'?20:0)}" y1="${la.y}" x2="${xM-half}" y2="${yy}" class="ob-cor"/>`;
    if(ra)s+=`<line x1="${ra.x-lw/2-(key==='p'?20:0)}" y1="${ra.y}" x2="${xM+half}" y2="${yy}" class="ob-cor"/>`});
  /* AO levels with electrons of the neutral atoms */
  const aoE=(el)=>{const v=OB_VAL[el];if(D.s1)return{s:v};return{s:Math.min(2,v),p:Math.max(0,v-2)}};
  for(const[side,list,el]of[[-1,AOl,A],[1,AOr,B]]){const ne=aoE(el);for(const a of list){
    if(a.k==='s'){s+=`<line x1="${a.x-lw/2}" y1="${a.y}" x2="${a.x+lw/2}" y2="${a.y}" class="ob-lv"/>`+obElectrons(a.x,a.y,ne.s);s+=`<text x="${a.x+(side<0?-lw/2-8:lw/2+8)}" y="${a.y+4}" class="ob-t" text-anchor="${side<0?'end':'start'}">${D.s1?'1s':'2s'}</text>`}
    else{const occp=obFill([{deg:3}],ne.p)[0];[-1,0,1].forEach((k,j)=>{const cx=a.x+k*22;s+=`<line x1="${cx-9}" y1="${a.y}" x2="${cx+9}" y2="${a.y}" class="ob-lv"/>`+obElectrons(cx,a.y,occp[j])});s+=`<text x="${a.x+(side<0?-46:46)}" y="${a.y+4}" class="ob-t" text-anchor="${side<0?'end':'start'}">2p</text>`}}
    s+=`<text x="${side<0?xA:xB}" y="${top-8}" class="ob-h" text-anchor="middle">${el}</text>`}
  s+=`<text x="${xM}" y="${top-8}" class="ob-h" text-anchor="middle">${D.l}</text>`;
  /* MO levels */
  L.forEach((l,i)=>{const yy=Y(l.y),sel=!o.small&&OB.diaMo===i,tag=i===R.homo?(occ[i].some(x=>x===1)?'SOMO':'HOMO'):i===R.lumo&&i!==R.homo?'LUMO':'';
    const xs=l.deg===2?[xM-mw/2-4,xM+mw/2+4]:[xM];let g='';xs.forEach((cx,j)=>{g+=`<line x1="${cx-mw/2+(l.deg===2?6:0)}" y1="${yy}" x2="${cx+mw/2-(l.deg===2?6:0)}" y2="${yy}" class="ob-lv ob-mol${l.b<0?' anti':''}"/>`+obElectrons(cx,yy,occ[i][j])});
    const lx=xM+(l.deg===2?mw+12:mw/2+10);
    s+=`<g class="ob-mo${sel?' sel':''}"${o.small?'':` data-dmo="${i}" tabindex="0" role="button" aria-label="${l.lab}${tag?', '+tag:''}"`}><rect x="${xM-mw-14}" y="${yy-13}" width="${2*mw+80}" height="26" rx="6" class="ob-hit"/>${g}<text x="${lx}" y="${yy+4}" class="ob-t ob-ml">${l.lab.replace('*','<tspan class="ob-star">*</tspan>')}</text>${tag?`<text x="${xM-(l.deg===2?mw+12:mw/2+10)}" y="${yy+4}" class="ob-tag" text-anchor="end">${tag}</text>`:''}</g>`});
  s+=`<line x1="18" y1="${bot}" x2="18" y2="${top}" class="ob-ax"/><path d="M14 ${top+6}L18 ${top-2}L22 ${top+6}" class="ob-ax"/><text x="24" y="${top+4}" class="ob-t ob-sm">Energy</text>`;
  return`<svg class="ob-svg${o.small?' small':''}" viewBox="0 0 ${W} ${H}" role="img" aria-label="MO diagram of ${esc(D.l)}">${s}</svg>`}
/* ---- Hückel π systems ---- */
const obChain=n=>Array.from({length:n},(_,i)=>[i*1.212,i%2?.7:0]);
const obRing=n=>{const R=1.40/(2*Math.sin(Math.PI/n));return Array.from({length:n},(_,i)=>{const a=-Math.PI/2+2*Math.PI*i/n+Math.PI/n;return[R*Math.cos(a),R*Math.sin(a)]})};
const OB_PI={
 ethene:{l:'Ethene',n:2,e:2},allylp:{l:'Allyl cation',n:3,e:2},allyl:{l:'Allyl radical',n:3,e:3},allylm:{l:'Allyl anion',n:3,e:4},butadiene:{l:'Buta-1,3-diene',n:4,e:4},hexatriene:{l:'Hexa-1,3,5-triene',n:6,e:6},
 formald:{l:'Formaldehyde (C=O)',n:2,e:2,el:['C','O'],h:[0,1],k:1},
 cprop:{l:'Cyclopropenyl cation',ring:3,e:2},cbd:{l:'Cyclobutadiene',ring:4,e:4},cpm:{l:'Cyclopentadienyl anion',ring:5,e:6},cpp:{l:'Cyclopentadienyl cation',ring:5,e:4},
 benzene:{l:'Benzene',ring:6,e:6},pyridine:{l:'Pyridine',ring:6,e:6,el:['N','C','C','C','C','C'],h:[.5,0,0,0,0,0],k:1},trop:{l:'Tropylium cation',ring:7,e:6},cot:{l:'Cyclooctatetraene (planar)',ring:8,e:8}};
const OB_PI_GROUPS=[['Chains',['ethene','allylp','allyl','allylm','butadiene','hexatriene','formald']],['Rings',['cprop','cbd','cpm','cpp','benzene','pyridine','trop','cot']]];
const OB_PI_NOTE={
 ethene:'One bonding π orbital (α + β) and one antibonding π* (α − β). The two π electrons fill the bonding one.',
 allylp:'Three p orbitals give three MOs. The middle one (ψ₂) is nonbonding, with a node on the central carbon. In the cation ψ₂ is the empty LUMO, so the positive charge sits on the two end carbons.',
 allyl:'The odd electron is in nonbonding ψ₂, which has density only on the end carbons: the radical character is shared between them.',
 allylm:'ψ₂ is the HOMO. Its node on the middle carbon means the negative charge, and the nucleophilic reactivity, is on the end carbons.',
 butadiene:'Four MOs with 0, 1, 2 and 3 nodes. ψ₂ (HOMO) and ψ₃ (LUMO) are the frontier orbitals used in the Diels–Alder reaction. Delocalisation lowers the π energy by 0.47β compared with two separate C=C bonds.',
 hexatriene:'Six MOs, from no nodes up to five. The HOMO–LUMO gap shrinks as conjugation gets longer, which is why long polyenes absorb visible light and are coloured.',
 formald:'Oxygen is more electronegative, so the bonding π orbital is concentrated on O and the empty π* (LUMO) has its larger lobe on carbon. Nucleophiles attack C=O at carbon because that is where the LUMO is biggest.',
 cprop:'2 π electrons fit Hückel\'s 4n + 2 rule (n = 0). They fill the single low-lying bonding orbital, so the cyclopropenyl cation is aromatic, the smallest aromatic ion.',
 cbd:'4 π electrons (4n). After the bonding MO, two electrons go into a pair of nonbonding orbitals, one each: a diradical with no extra stability. Square cyclobutadiene is antiaromatic; the real molecule distorts to a rectangle and is extremely reactive.',
 cpm:'6 π electrons (4n + 2) fill all three bonding MOs, giving a closed shell. The cyclopentadienyl anion is aromatic, which is why cyclopentadiene is unusually acidic (pKa ≈ 16).',
 cpp:'4 π electrons: two are unpaired in a degenerate pair. The cyclopentadienyl cation is antiaromatic and very unstable.',
 benzene:'6 π electrons fill the three bonding MOs (one at α + 2β and a degenerate pair at α + β). The π energy is 2β lower than three separate C=C bonds: the aromatic stabilisation.',
 pyridine:'Like benzene, with 6 π electrons in three bonding MOs. Nitrogen lowers the orbital energies and pulls π density towards itself. Its lone pair lies in the ring plane and isn\'t part of the π system, so pyridine is basic.',
 trop:'6 π electrons in seven p orbitals: a closed shell, so the tropylium (cycloheptatrienyl) cation is aromatic. It is the stable C₇H₇⁺ ion at m/z 91 in mass spectra.',
 cot:'8 π electrons (4n) would leave two unpaired electrons in nonbonding orbitals if the ring were flat. Real cyclooctatetraene avoids this by folding into a tub shape, so it is non-aromatic, with ordinary alternating double bonds.'};
function obPiCalc(id){
  const P=OB_PI[id],n=P.ring||P.n,pos=P.ring?obRing(n):obChain(n),bonds=[];
  for(let i=0;i<n-1;i++)bonds.push([i,i+1]);if(P.ring)bonds.push([n-1,0]);
  const M=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?((P.h||[])[i]||0):0));for(const[a,b]of bonds){M[a][b]=M[b][a]=P.k||1}
  const ev=obEig(M);const levels=[];for(const e of ev){const last=levels[levels.length-1];if(last&&Math.abs(last.x-e.x)<1e-6){last.mos.push(e);last.deg++}else levels.push({x:e.x,deg:1,mos:[e]})}
  const occ=obFill(levels,P.e);const mos=[];levels.forEach((L,i)=>L.mos.forEach((m,j)=>mos.push({...m,lv:i,occ:occ[i][j]})));
  let homo=-1;mos.forEach((m,i)=>{if(m.occ>0)homo=i});const lumo=mos.findIndex(m=>m.occ<2&&m.occ===0)>=0?mos.findIndex(m=>m.occ===0):-1;
  const Epi=mos.reduce((s,m)=>s+m.occ*m.x,0),un=mos.filter(m=>m.occ===1).length;
  const hydro=!P.h&&P.e===n&&n%2===0;const de=hydro?Epi-P.e:null;
  let arom=null;if(P.ring){const closed=!un&&!levels.some((L,i)=>occ[i].some(x=>x>0)&&occ[i].some(x=>x<2)&&L.x>-1e-6);arom=(P.e-2)%4===0?'aromatic':P.e%4===0?'antiaromatic':null;if(id==='cot')arom='antiaromatic if planar'}
  return{P,n,pos,bonds,levels,occ,mos,homo,lumo,Epi,un,de,arom}}
const fmtX=x=>{const a=Math.abs(x);if(a<5e-4)return'α';const v=+a.toFixed(3);return`α ${x>0?'+':'−'} ${Math.abs(v-1)<5e-4?'':v}β`};
function obPiDiagram(R){
  const W=400,H=340,top=24,bot=H-24,xs=R.levels.map(l=>l.x),hi=Math.max(2.2,...xs)+.2,lo=Math.min(-2.2,...xs)-.2,Y=x=>top+(hi-x)/(hi-lo)*(bot-top),cx=230;
  let s=`<line x1="${cx-150}" y1="${Y(0)}" x2="${cx+110}" y2="${Y(0)}" class="ob-cor"/><text x="${cx-150}" y="${Y(0)-6}" class="ob-t ob-sm">nonbonding</text>`;
  let k=0;R.levels.forEach((L,i)=>{const yy=Y(L.x),w=L.deg>2?30:40,gap=8,tot=L.deg*w+(L.deg-1)*gap,x0=cx-tot/2;
    s+=`<text x="${cx-tot/2-12}" y="${yy+4}" class="ob-t" text-anchor="end">${fmtX(L.x)}</text>`;
    for(let j=0;j<L.deg;j++){const m=R.mos[k],mx=x0+j*(w+gap)+w/2,sel=OB.piMo===k,tag=k===R.homo?(m.occ===1?'SOMO':'HOMO'):k===R.lumo?'LUMO':'';
      s+=`<g class="ob-mo${sel?' sel':''}" data-pmo="${k}" tabindex="0" role="button" aria-label="ψ${k+1}${tag?', '+tag:''}"><rect x="${mx-w/2-4}" y="${yy-14}" width="${w+8}" height="28" rx="6" class="ob-hit"/><line x1="${mx-w/2}" y1="${yy}" x2="${mx+w/2}" y2="${yy}" class="ob-lv ob-mol${L.x<-1e-6?' anti':''}"/>${obElectrons(mx,yy,m.occ)}${tag&&j===L.deg-1?`<text x="${mx+w/2+8}" y="${yy+4}" class="ob-tag">${tag}</text>`:''}</g>`;k++}});
  s+=`<line x1="18" y1="${bot}" x2="18" y2="${top}" class="ob-ax"/><path d="M14 ${top+6}L18 ${top-2}L22 ${top+6}" class="ob-ax"/><text x="24" y="${top+4}" class="ob-t ob-sm">Energy</text>`;
  if(R.P.ring){const n=R.n,r=44,fx=W-58,fy=H-62;let poly='';for(let i=0;i<n;i++){const a=Math.PI/2+2*Math.PI*i/n;poly+=(i?'L':'M')+(fx+r*Math.cos(a)).toFixed(1)+' '+(fy+r*Math.sin(a)).toFixed(1)}
    s+=`<g class="ob-frost"><circle cx="${fx}" cy="${fy}" r="${r}"/><path d="${poly}Z"/><text x="${fx}" y="${fy+r+16}" class="ob-t ob-sm" text-anchor="middle">Frost circle</text></g>`}
  return`<svg class="ob-svg ob-pid" viewBox="0 0 ${W} ${H}" role="img" aria-label="π MO energy diagram">${s}</svg>`}
function obPiCard(R,k){
  const m=R.mos[k],xs=R.pos.map(p=>p[0]),ys=R.pos.map(p=>p[1]),mnx=Math.min(...xs),mxx=Math.max(...xs),mny=Math.min(...ys),mxy=Math.max(...ys),sc=Math.min(36,92/Math.max(1,mxx-mnx),60/Math.max(.7,mxy-mny));
  const W=150,H=112,cx=W/2-(mnx+mxx)/2*sc,cy=H/2-(mny+mxy)/2*sc+4,P=p=>[cx+p[0]*sc,cy+p[1]*sc];
  let s=R.bonds.map(([a,b])=>{const[x1,y1]=P(R.pos[a]),[x2,y2]=P(R.pos[b]);return`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="ob-bd"/>`}).join('');
  m.c.forEach((c,i)=>{const[x,y]=P(R.pos[i]),rr=Math.abs(c)<.02?0:4+17*Math.abs(c);s+=rr?`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rr.toFixed(1)}" class="ob-lobe ${c>0?'pos':'neg'}"/>`:`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5" class="ob-node"/>`;const el=(R.P.el||[])[i];if(el&&el!=='C')s+=`<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" class="ob-el" text-anchor="middle">${el}</text>`});
  const nodes=R.bonds.filter(([a,b])=>m.c[a]*m.c[b]<-1e-6).length,tag=k===R.homo?(m.occ===1?'SOMO':'HOMO'):k===R.lumo?'LUMO':'';
  return`<button class="ob-card${OB.piMo===k?' on':''}" data-pmo="${k}"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${s}</svg><b>ψ<sub>${k+1}</sub>${tag?` <span class="ob-ctag">${tag}</span>`:''}</b><small>${fmtX(m.x)} · ${nodes} node${nodes===1?'':'s'} · ${m.occ} e⁻</small></button>`}
/* ---- 3D engine ---- */
const OBV={r:null,scene:null,cam:null,pivot:null,world:null,zoom:1,fit:30,cache:new Map(),ro:null,stage:null,raf:0};
async function obEnsure(){
  await loadLib('THREE');if(OBV.r)return;
  const r=new THREE.WebGLRenderer({antialias:true});r.localClippingEnabled=true;r.setPixelRatio(Math.min(2,devicePixelRatio||1));r.domElement.className='ob-canvas';
  const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(35,1,.1,2000);scene.add(new THREE.HemisphereLight(0xffffff,0x40454f,.75));const dl=new THREE.DirectionalLight(0xffffff,.8);dl.position.set(4,6,8);cam.add(dl);scene.add(cam);
  const pivot=new THREE.Group(),world=new THREE.Group();pivot.add(world);scene.add(pivot);Object.assign(OBV,{r,scene,cam,pivot,world});
  OBV.plane=new THREE.Plane(new THREE.Vector3(0,0,-1),0);
  const cv=r.domElement,ptrs=new Map();let pinch=null;
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:OBV.zoom}}});
  cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;if(ptrs.size===2&&pinch){p.x=e.clientX;p.y=e.clientY;const[a,b]=[...ptrs.values()];OBV.zoom=Math.max(.4,Math.min(4,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d));obDraw();return}
    const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;const ang=Math.hypot(dx,dy)*.009;if(!ang)return;OBV.pivot.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(dy,dx,0).normalize(),ang));obDraw()});
  const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();OBV.zoom=Math.max(.4,Math.min(4,OBV.zoom*Math.exp(-e.deltaY*.0012)));obDraw()},{passive:false});
  cv.addEventListener('dblclick',()=>{obResetView();obDraw()});
  OBV.ro=window.ResizeObserver?new ResizeObserver(()=>obSize()):null;
}
function obSize(){const st=OBV.stage;if(!st||!OBV.r)return;const w=st.clientWidth||1,h=st.clientHeight||1;OBV.r.setSize(w,h,false);OBV.cam.aspect=w/h;OBV.cam.updateProjectionMatrix();obDraw()}
function obDraw(){if(OBV.raf)return;OBV.raf=requestAnimationFrame(()=>{OBV.raf=0;if(!OBV.r||!OBV.stage||!OBV.stage.isConnected)return;OBV.cam.position.set(0,0,OBV.fit/OBV.zoom);OBV.cam.lookAt(0,0,0);OBV.r.render(OBV.scene,OBV.cam)})}
function obResetView(){const t=OBV.tilt||[.35,-.5,0];OBV.pivot.quaternion.setFromEuler(new THREE.Euler(t[0],t[1],t[2]));OBV.zoom=1}
/* marching tetrahedra on a regular grid */
function obMesh(F,nx,ny,nz,o,h,t){
  const I=(i,j,k)=>i+nx*(j+ny*k),pos=[],nor=[];
  const grad=(i,j,k)=>{const i0=i>0?i-1:i,i1=i<nx-1?i+1:i,j0=j>0?j-1:j,j1=j<ny-1?j+1:j,k0=k>0?k-1:k,k1=k<nz-1?k+1:k;
    return[(F[I(i1,j,k)]-F[I(i0,j,k)])/((i1-i0)*h),(F[I(i,j1,k)]-F[I(i,j0,k)])/((j1-j0)*h),(F[I(i,j,k1)]-F[I(i,j,k0)])/((k1-k0)*h)]};
  const C=[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]],TET=[[0,5,1,6],[0,1,2,6],[0,2,3,6],[0,3,7,6],[0,7,4,6],[0,4,5,6]];
  const v=new Float64Array(8),P=[],G=[];for(let q=0;q<8;q++){P.push([0,0,0]);G.push(null)}
  const ed=(a,b)=>{const m=(t-v[a])/(v[b]-v[a]),pa=P[a],pb=P[b];G[a]=G[a]||grad(...P[a].ijk);G[b]=G[b]||grad(...P[b].ijk);const ga=G[a],gb=G[b];
    const n=[-(ga[0]+m*(gb[0]-ga[0])),-(ga[1]+m*(gb[1]-ga[1])),-(ga[2]+m*(gb[2]-ga[2]))],l=Math.hypot(...n)||1;return{p:[pa[0]+m*(pb[0]-pa[0]),pa[1]+m*(pb[1]-pa[1]),pa[2]+m*(pb[2]-pa[2])],n:[n[0]/l,n[1]/l,n[2]/l]}};
  const tri=(A,B,Cc)=>{const ux=B.p[0]-A.p[0],uy=B.p[1]-A.p[1],uz=B.p[2]-A.p[2],wx=Cc.p[0]-A.p[0],wy=Cc.p[1]-A.p[1],wz=Cc.p[2]-A.p[2];
    const cx=uy*wz-uz*wy,cy=uz*wx-ux*wz,cz=ux*wy-uy*wx,nx2=A.n[0]+B.n[0]+Cc.n[0],ny2=A.n[1]+B.n[1]+Cc.n[1],nz2=A.n[2]+B.n[2]+Cc.n[2];
    const vs=cx*nx2+cy*ny2+cz*nz2<0?[A,Cc,B]:[A,B,Cc];for(const q of vs){pos.push(q.p[0],q.p[1],q.p[2]);nor.push(q.n[0],q.n[1],q.n[2])}};
  for(let k=0;k<nz-1;k++)for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
    let inn=0;for(let q=0;q<8;q++){const c=C[q],ii=i+c[0],jj=j+c[1],kk=k+c[2];v[q]=F[I(ii,jj,kk)];if(v[q]>t)inn++}
    if(inn===0||inn===8)continue;
    for(let q=0;q<8;q++){const c=C[q],ii=i+c[0],jj=j+c[1],kk=k+c[2];P[q]=[o[0]+ii*h,o[1]+jj*h,o[2]+kk*h];P[q].ijk=[ii,jj,kk];G[q]=null}
    for(const T of TET){const ins=T.filter(q=>v[q]>t),out=T.filter(q=>v[q]<=t);
      if(ins.length===1){const a=ins[0];tri(ed(a,out[0]),ed(a,out[1]),ed(a,out[2]))}
      else if(ins.length===3){const d=out[0];tri(ed(ins[0],d),ed(ins[1],d),ed(ins[2],d))}
      else if(ins.length===2){const[a,b]=ins,[c,d]=out,ac=ed(a,c),ad=ed(a,d),bd=ed(b,d),bc=ed(b,c);tri(ac,ad,bd);tri(ac,bd,bc)}}}
  return{pos:new Float32Array(pos),nor:new Float32Array(nor)}}
function obGrid(box,fn,N){
  const ext=box.map(b=>b[1]-b[0]),h=Math.max(...ext)/(N||64),n=ext.map(e=>Math.max(2,Math.round(e/h)+1)),o=box.map(b=>b[0]),F=new Float32Array(n[0]*n[1]*n[2]);
  let q=0;for(let k=0;k<n[2];k++){const z=o[2]+k*h;for(let j=0;j<n[1];j++){const y=o[1]+j*h;for(let i=0;i<n[0];i++)F[q++]=fn(o[0]+i*h,y,z)}}return{F,n,o,h}}
function obThreshold(F,frac){const sq=new Float32Array(F.length);let tot=0;for(let i=0;i<F.length;i++){sq[i]=F[i]*F[i];tot+=sq[i]}sq.sort();let acc=0;for(let i=sq.length-1;i>=0;i--){acc+=sq[i];if(acc>=frac*tot)return Math.sqrt(sq[i])}return 0}
function obBuild(spec){
  const g=new THREE.Group();
  for(const it of spec.items){const Gd=obGrid(spec.box,it.fn,spec.N||64),t=it.t||obThreshold(Gd.F,it.frac||.9);if(!t)continue;
    const phases=[[1,it.pos],[-1,it.neg]];for(const[sg,col]of phases){if(!col)continue;const F=sg>0?Gd.F:Gd.F.map(x=>-x);const m=obMesh(F,Gd.n[0],Gd.n[1],Gd.n[2],Gd.o,Gd.h,t);if(!m.pos.length)continue;
      const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(m.pos,3));geo.setAttribute('normal',new THREE.BufferAttribute(m.nor,3));
      const op=it.op||.92,mat=new THREE.MeshPhongMaterial({color:new THREE.Color(col),side:THREE.DoubleSide,transparent:op<1,opacity:op,depthWrite:op>.6,shininess:28,specular:0x141414});mat.userData.clip=true;
      const mesh=new THREE.Mesh(geo,mat);mesh.renderOrder=op>.6?0:1;g.add(mesh)}}
  const am=new THREE.MeshPhongMaterial({color:0x8a919c,shininess:40}),sg=new THREE.SphereGeometry(1,20,14);
  for(const a of spec.atoms||[]){const s=new THREE.Mesh(sg,am);s.scale.setScalar(a[3]||.32);s.position.set(a[0],a[1],a[2]);g.add(s)}
  for(const[a,b]of spec.bonds||[]){const A=new THREE.Vector3(...spec.atoms[a].slice(0,3)),B=new THREE.Vector3(...spec.atoms[b].slice(0,3)),d=B.clone().sub(A),c=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,d.length(),10),am);c.position.copy(A).add(B).multiplyScalar(.5);c.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());g.add(c)}
  if(spec.axes){const L=spec.axLen||Math.max(...spec.box.map(b=>b[1]))*1.05,mat=new THREE.LineBasicMaterial({color:0x9099a6});
    for(const[dir,lab]of[[[1,0,0],'x'],[[0,1,0],'z'],[[0,0,-1],'y']]){const geo=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...dir.map(v=>-v*L)),new THREE.Vector3(...dir.map(v=>v*L))]);const ln=new THREE.Line(geo,mat);ln.userData.axis=true;g.add(ln);
      const cv=document.createElement('canvas');cv.width=cv.height=64;const cx=cv.getContext('2d');cx.font='600 40px sans-serif';cx.fillStyle='#8a93a0';cx.textAlign='center';cx.textBaseline='middle';cx.fillText(lab,32,34);
      const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(cv),depthTest:false}));sp.scale.setScalar(L*.09);sp.position.set(...dir.map(v=>v*L*1.07));sp.userData.axis=true;g.add(sp)}}
  return g}
async function obShow(stageSel,spec){
  const st=$(stageSel);if(!st)return;st.innerHTML='<div class="ob-load">Loading 3D…</div>';
  try{await obEnsure()}catch(e){st.innerHTML='<div class="ob-load">The 3D viewer couldn\'t load. Check your connection and try again.</div>';return}
  if(!OBV.r.getContext()){st.innerHTML='<div class="ob-load">3D needs WebGL, which this browser has turned off.</div>';return}
  st.innerHTML='<div class="ob-load">Calculating…</div>';await new Promise(r=>setTimeout(r,16));if(!st.isConnected)return;
  let g=OBV.cache.get(spec.key);if(!g){g=obBuild(spec);OBV.cache.set(spec.key,g);if(OBV.cache.size>24){const k0=OBV.cache.keys().next().value;OBV.cache.delete(k0)}}
  OBV.world.clear();OBV.world.add(g);obApplyOpts();
  st.innerHTML='';st.appendChild(OBV.r.domElement);OBV.stage=st;if(OBV.ro){OBV.ro.disconnect();OBV.ro.observe(st)}
  const bg=getComputedStyle(st).backgroundColor;try{OBV.r.setClearColor(new THREE.Color(bg),1)}catch(e){}
  OBV.fit=spec.fit||Math.max(...spec.box.map(b=>b[1]-b[0]))*(spec.kind==='atom'?1.5:1.3);OBV.tilt=spec.tilt;if(spec.reset!==false&&OBV.lastKind!==spec.kind)obResetView();OBV.lastKind=spec.kind;obSize();
}
function obApplyOpts(){if(!OBV.world)return;OBV.world.traverse(o=>{if(o.userData.axis)o.visible=OB.axes;if(o.material&&o.material.userData&&o.material.userData.clip){o.material.clippingPlanes=OB.cut?[OBV.plane]:[];o.material.needsUpdate=true}});obDraw()}
/* spec builders (three.js coordinates: chemistry x → X, y → −Z, z → Y) */
function obAtomicSpec(id){const A=AO[id],R={1:6,2:16,3:27}[A.n];return{key:'ao:'+id,kind:'atom',box:[[-R,R],[-R,R],[-R,R]],tilt:[.35,-.55,0],axes:true,N:A.n===3?72:64,items:[{fn:(X,Y,Z)=>{const x=X,y=-Z,z=Y;return A.f(x,y,z,Math.hypot(x,y,z))},pos:OB_POS,neg:OB_NEG,frac:.9}]}}
const OB_HYB={
 sp:{l:'sp',geo:'linear, 180°',ex:'the carbons of ethyne (HC≡CH) and CO₂, BeH₂',dirs:[[0,0,1],[0,0,-1]],s:1/OS2,left:['2px','2py']},
 sp2:{l:'sp²',geo:'trigonal planar, 120°',ex:'the carbons of ethene and benzene, the C of C=O, BF₃',dirs:[[1,0,0],[-.5,OS3/2,0],[-.5,-OS3/2,0]],s:1/OS3,left:['2pz']},
 sp3:{l:'sp³',geo:'tetrahedral, 109.5°',ex:'the carbon of CH₄, the N of NH₃, the O of H₂O',dirs:[[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]].map(d=>d.map(v=>v/OS3)),s:.5,left:[]}};
const OB_HCOL=['#3f7ff6','#20a77a','#e8962e','#9b6ef0'];
function obHybridSpec(id,showP,one){const H=OB_HYB[id],R=6.5,z=1,fs=sto2s(z),fx=sto2p(z,'x'),fy=sto2p(z,'y'),fz=sto2p(z,'z'),ps=Math.sqrt(1-H.s*H.s);
  /* chemistry (x,y,z) → three.js (X, −Z... ) : x = X, y = −Z, z = Y */
  const items=H.dirs.map((d,k)=>({fn:(X,Y,Z)=>{const x=X,y=-Z,zz=Y;return H.s*fs(x,y,zz)+ps*(d[0]*fx(x,y,zz)+d[1]*fy(x,y,zz)+d[2]*fz(x,y,zz))},pos:OB_HCOL[k],neg:one&&k?null:'#9aa3ae',frac:.6,op:one&&k?.16:.9}));
  if(showP)for(const p of H.left){const f=sto2p(z,p.slice(-1));items.push({fn:(X,Y,Z)=>f(X,-Z,Y),pos:OB_POS,neg:OB_NEG,frac:.42,op:.35})}
  return{key:'hy:'+id+':'+(showP?1:0)+(one?1:0),kind:'atom',box:[[-R,R],[-R,R],[-R,R]],tilt:[.35,-.55,0],axes:true,items}}
function obDiaSpec(sp,i){const D=OB_DIA[sp],L=obDiaLevels(sp)[i],h1=!!D.s1,R=h1?1.4:2.2,z=h1?1.24:1.55,xa=-R/2,xb=R/2,het=!!D.het;
  let cA=1,cB=L.b>0?1:-1;if(het){const big=.83,sm=.56;if(L.b>0){cA=sm;cB=big}else{cA=big;cB=-sm}}
  let fa,fb;if(L.kind==='1s'){const f=sto1s(z);fa=f;fb=f}else if(L.kind==='2s'){const f=sto2s(z);fa=f;fb=f}
  else if(L.kind==='sp'){const f=sto2p(z,'x');fa=f;fb=f;cB=-cB}else{const f=sto2p(z,'y');fa=f;fb=f}
  const ext=h1?4.2:6.5;return{key:'di:'+sp+':'+i,kind:'dia',box:[[xa-ext,xb+ext],[-ext,ext],[-ext,ext]],tilt:[.25,-.4,0],atoms:[[xa,0,0,h1?.22:.3],[xb,0,0,h1?.22:.3]],bonds:[[0,1]],
    items:[{fn:(X,Y,Z)=>cA*fa(X-xa,Y,Z)+cB*fb(X-xb,Y,Z),pos:OB_POS,neg:OB_NEG,frac:.88}]}}
function obPiSpec(id,k){const R=obPiCalc(id),B=1.8897,z=1.625,f=sto2p(z,'y'),m=R.mos[k];const xs=R.pos.map(p=>p[0]*B),zs=R.pos.map(p=>p[1]*B),cx=(Math.min(...xs)+Math.max(...xs))/2,cz=(Math.min(...zs)+Math.max(...zs))/2;
  const at=R.pos.map((p,i)=>[xs[i]-cx,0,zs[i]-cz,.28]),mg=4.2;
  return{key:'pi:'+id+':'+k,kind:'pi',box:[[Math.min(...at.map(a=>a[0]))-mg,Math.max(...at.map(a=>a[0]))+mg],[-5,5],[Math.min(...at.map(a=>a[2]))-mg,Math.max(...at.map(a=>a[2]))+mg]],tilt:[.75,0,0],atoms:at,bonds:R.bonds,
    items:[{fn:(X,Y,Z)=>{let s=0;for(let i=0;i<at.length;i++){const c=m.c[i];if(Math.abs(c)>1e-4)s+=c*f(X-at[i][0],Y,Z-at[i][2])}return s},pos:OB_POS,neg:OB_NEG,frac:.86}]}}
/* ---- pages ---- */
function renderOrbSide(){const box=$('#orbList');if(!box)return;box.innerHTML=OB_PAGES.map(p=>`<button class="item${OB.view===p.id?' on':''}" data-obpage="${p.id}"><span class="t">${esc(p.t)}</span><span class="m">${esc(p.m)}</span></button>`).join('')}
function obOpen(){obPage(OB.view||'intro')}
const obStage=(cap)=>`<div class="ob-viewer"><div class="ob-stage" id="obStage"></div><div class="ob-ctl"><label class="v3d-check"><input type="checkbox" id="obCut"${OB.cut?' checked':''}> Cutaway</label><label class="v3d-check"><input type="checkbox" id="obAxes"${OB.axes?' checked':''}> Axes</label><button class="btn small" id="obReset">Reset view</button><span class="ob-hint">Drag to rotate · scroll or pinch to zoom</span></div>${cap?`<p class="ob-cap" id="obCap">${cap}</p>`:''}</div>`;
const obLegend=`<span class="ob-leg"><i class="pos"></i>positive phase <i class="neg"></i>negative phase</span>`;
function obChips(groups,cur,attr,label){return groups.map(([g,ids])=>`<div class="ob-grp"><span>${esc(g)}</span><div class="qz-chips">${ids.map(id=>`<button class="qz-chip${cur===id?' on':''}" data-${attr}="${id}" aria-pressed="${cur===id}"><span>${label(id)}</span></button>`).join('')}</div></div>`).join('')}
function obPage(id){
  OB.view=id;const pg=$('#orbPage');
  if(id==='intro'){pg.innerHTML=`<article class="nm-lesson ob-lesson"><header class="nm-head"><div class="nm-kicker">Start here</div><h1>Molecular orbital theory</h1><p class="nm-lede">Electrons in molecules live in molecular orbitals that spread over the whole molecule. Building them from atomic orbitals explains bond strength, magnetism, colour, aromaticity and where reactions happen.</p></header>
   <section class="nm-sec"><h2>Atomic orbitals</h2><p>An orbital is a wavefunction, ψ. Its square, ψ², gives the probability of finding the electron at each point. Pictures show the surface that contains about 90% of that probability.</p><p>ψ can be positive or negative: its <b>phase</b>, shown here in blue and red. Where ψ changes sign there is a <b>node</b>, where the electron is never found. An orbital with quantum numbers n and l has <b>l angular nodes</b> (planes or cones) and <b>n − l − 1 radial nodes</b> (spheres).</p><div class="nm-actions"><button class="btn" data-obpage="atomic">Explore atomic orbitals in 3D</button></div></section>
   <section class="nm-sec"><h2>Combining orbitals</h2><p>When two atoms approach, their orbitals overlap and combine (a "linear combination of atomic orbitals", LCAO). Two atomic orbitals always make two molecular orbitals:</p><ul><li><b>In phase</b> (same colour overlapping): electron density builds up between the nuclei. This <b>bonding</b> orbital is lower in energy than the atomic orbitals.</li><li><b>Out of phase</b>: a node appears between the nuclei. This <b>antibonding</b> orbital (marked *) is higher in energy.</li></ul><p>Overlap along the bond axis gives <b>σ</b> orbitals; side-on overlap of p orbitals gives <b>π</b> orbitals, with a nodal plane containing the bond axis.</p></section>
   <section class="nm-sec"><h2>Filling the orbitals and bond order</h2><p>Electrons go into the lowest orbitals first, at most two per orbital with opposite spins, and spread out singly across orbitals of equal energy before pairing (Hund's rule).</p><p class="sp-eq">bond order = ½ (bonding electrons − antibonding electrons)</p><div class="ob-two">${obDiaSVG('H2',{small:true})}${obDiaSVG('He2',{small:true})}</div><p>H₂ has bond order 1. He₂ has 2 bonding and 2 antibonding electrons, so its bond order is 0 and it doesn't form.</p><div class="nm-actions"><button class="btn" data-obpage="dia">Open the MO diagrams</button></div></section>
   <section class="nm-sec"><h2>Why oxygen is magnetic</h2><p>The Lewis structure of O₂ has every electron paired, yet liquid oxygen is attracted to a magnet. The MO diagram explains it: the last two electrons occupy two π* orbitals of equal energy, one each, with parallel spins. O₂ is a diradical with bond order 2.</p></section>
   <section class="nm-sec"><h2>s–p mixing</h2><p>For B₂, C₂ and N₂ the 2s and 2p orbitals are close enough in energy to mix. This pushes σ2p above π2p. For O₂ and F₂ the 2s–2p gap is larger, mixing is small and σ2p stays below π2p. The diagrams here switch ordering automatically.</p></section>
   <section class="nm-sec"><h2>HOMO and LUMO: where reactions happen</h2><p>The highest occupied MO (<b>HOMO</b>) holds the most reactive electrons; the lowest unoccupied MO (<b>LUMO</b>) is where incoming electrons go. In a reaction, electrons flow from the HOMO of the nucleophile into the LUMO of the electrophile, and the new bond forms where those orbitals are largest.</p><ul><li>The π* LUMO of C=O is biggest on carbon, so nucleophiles add to the carbon.</li><li>In SN2 the nucleophile attacks the back lobe of the C–X σ* orbital, which is why the reaction inverts the stereocentre.</li><li>The Diels–Alder reaction joins the HOMO of the diene to the LUMO of the dienophile.</li></ul></section>
   <section class="nm-sec"><h2>Conjugation and aromaticity</h2><p>Hückel theory combines the p orbitals of a conjugated system into π MOs. In a flat ring of p orbitals, the MO energies follow the corners of a polygon drawn point-down inside a circle (the <b>Frost circle</b>). A ring with <b>4n + 2</b> π electrons fills its bonding orbitals exactly and is <b>aromatic</b>. One with <b>4n</b> electrons has two unpaired electrons in nonbonding orbitals and is <b>antiaromatic</b>.</p><div class="nm-actions"><button class="btn primary" data-obpage="pi">Explore π molecular orbitals</button></div></section></article>`}
  else if(id==='atomic'){const groups=[['n = 1',['1s']],['n = 2',['2s','2px','2py','2pz']],['n = 3',['3s','3px','3py','3pz','3dxy','3dxz','3dyz','3dx2y2','3dz2']]];
   const A=AO[OB.atomic],fam=A.l===0?OB.atomic:OB.atomic.slice(0,2),info=AO_INFO[fam]||'';
   pg.innerHTML=`<section class="ob-page"><header class="nm-head"><div class="nm-kicker">Orbitals</div><h1>Atomic orbitals in 3D</h1><p class="nm-lede">Hydrogen-atom orbitals, drawn as the surface that holds 90% of the electron probability. Turn on the cutaway to look inside.</p></header>
    ${obChips(groups,OB.atomic,'ao',k=>AO[k].lab)}
    <div class="ob-split"><div>${obStage(`<b>${A.lab}</b> · n = ${A.n}, l = ${A.l} · ${A.l} angular node${A.l===1?'':'s'}, ${A.n-A.l-1} radial node${A.n-A.l-1===1?'':'s'}`)}</div><div class="ob-info"><h2>${A.lab}</h2><p>${info}</p>${obLegend}<p class="hm-muted">Phase (the sign of ψ) matters when orbitals overlap: same-phase overlap makes a bond, opposite-phase overlap makes a node.</p></div></div></section>`;
   obShow('#obStage',obAtomicSpec(OB.atomic))}
  else if(id==='hybrid'){const H=OB_HYB[OB.hybrid];
   pg.innerHTML=`<section class="ob-page"><header class="nm-head"><div class="nm-kicker">Orbitals</div><h1>Hybrid orbitals</h1><p class="nm-lede">Mixing an atom's 2s orbital with one, two or three 2p orbitals gives hybrid orbitals that point towards the bonds. Each colour is one hybrid. Highlight one to see its shape: a large lobe pointing along the bond, and a small grey back lobe of opposite phase.</p></header>
    <div class="qz-chips">${Object.keys(OB_HYB).map(k=>`<button class="qz-chip${OB.hybrid===k?' on':''}" data-hyb="${k}" aria-pressed="${OB.hybrid===k}">${OB_HYB[k].l}</button>`).join('')}<label class="v3d-check ob-p"><input type="checkbox" id="obHybOne"${OB.hybOne?' checked':''}> Highlight one hybrid</label><label class="v3d-check ob-p"><input type="checkbox" id="obHybP"${OB.hybP?' checked':''}${H.left.length?'':' disabled'}> Show unhybridised p</label></div>
    <div class="ob-split"><div>${obStage(`<b>${H.l}</b>: ${H.dirs.length} hybrids, ${H.geo}`)}</div><div class="ob-info"><h2>${H.l} hybridisation</h2><p><b>Made from:</b> one 2s and ${H.dirs.length-1} 2p orbital${H.dirs.length-1>1?'s':''} (${Math.round(100*H.s*H.s)}% s character).</p><p><b>Shape:</b> ${H.geo}.</p><p><b>Examples:</b> ${H.ex}.</p>${H.left.length?`<p>The ${H.left.length===1?'leftover p orbital stands':'two leftover p orbitals stand'} at right angles to the hybrids and ${H.left.length===1?'forms':'form'} the π bond${H.left.length>1?'s':''}.</p>`:'<p>All three p orbitals are used, so sp³ atoms make only σ bonds.</p>'}<p class="hm-muted">More s character means electrons held closer to the nucleus: sp C–H bonds are shorter and more acidic (ethyne pKa ≈ 25, ethane ≈ 50).</p></div></div></section>`;
   obShow('#obStage',obHybridSpec(OB.hybrid,OB.hybP&&H.left.length>0,OB.hybOne))}
  else if(id==='dia'){const R=obDiaCalc(OB.dia);if(OB.diaMo==null||OB.diaMo>=R.L.length)OB.diaMo=Math.max(0,R.homo);const L=R.L[OB.diaMo];
   pg.innerHTML=`<section class="ob-page"><header class="nm-head"><div class="nm-kicker">Orbitals</div><h1>Diatomic MO diagrams</h1><p class="nm-lede">Pick a molecule or ion. Click any molecular orbital to see its shape in 3D.</p></header>
    ${obChips(OB_DIA_GROUPS,OB.dia,'dia',k=>OB_DIA[k].l.replace(/ \(.*\)/,''))}
    <div class="ob-split ob-dsplit"><div class="ob-dia">${obDiaSVG(OB.dia)}<div class="ob-facts"><div><span>Bond order</span><b>${R.bo%1?Math.floor(R.bo)+'½':R.bo}</b></div><div><span>Unpaired electrons</span><b>${R.un}</b></div><div><span>Magnetism</span><b>${R.un?'paramagnetic':'diamagnetic'}</b></div><div><span>${R.D.s1?'Electrons':'Valence electrons'}</span><b>${R.D.e}</b></div></div><p class="ob-cfg">${R.cfg}</p><p>${OB_DIA_NOTE[OB.dia]||''}</p>${R.D.s1?'':`<p class="hm-muted">Only valence orbitals are shown. ${R.D.mix?'s–p mixing puts π2p below σ2p.':'Without s–p mixing, σ2p is below π2p.'} The 3D shapes show the main atomic orbitals in each MO, without mixing.</p>`}</div>
    <div>${obStage(`<b>${L.lab}</b>: ${L.b>0?'bonding':'antibonding'} ${L.kind==='pi'?'π':'σ'} orbital${L.deg===2?' (one of a pair of equal energy)':''}`)}${obLegend}</div></div></section>`;
   obShow('#obStage',obDiaSpec(OB.dia,OB.diaMo))}
  else if(id==='pi'){const R=obPiCalc(OB.pi);if(OB.piMo==null||OB.piMo>=R.mos.length)OB.piMo=Math.max(0,R.homo);const m=R.mos[OB.piMo];
   const pe=`${R.P.e}α ${R.Epi<0?'−':'+'} ${(+Math.abs(R.Epi).toFixed(3)).toString()}β`;
   pg.innerHTML=`<section class="ob-page"><header class="nm-head"><div class="nm-kicker">Orbitals</div><h1>π molecular orbitals</h1><p class="nm-lede">Hückel calculations of the π MOs of conjugated molecules and rings. β is negative, so α + β is lower in energy than α. Click an orbital to see it in 3D.</p></header>
    ${obChips(OB_PI_GROUPS,OB.pi,'pi',k=>OB_PI[k].l.replace(/ \(.*\)/,''))}
    <div class="ob-split ob-dsplit"><div class="ob-dia">${obPiDiagram(R)}<div class="ob-facts"><div><span>π electrons</span><b>${R.P.e}</b></div><div><span>π energy</span><b>${pe}</b></div>${R.de!=null?`<div><span>Delocalisation energy</span><b>${Math.abs(R.de)<5e-4?'0':(+Math.abs(R.de).toFixed(2))+'β'}</b></div>`:''}${R.arom?`<div><span>Hückel rule</span><b>${R.arom}</b></div>`:''}</div><p>${OB_PI_NOTE[OB.pi]||''}</p></div>
    <div>${obStage(`<b>ψ<sub>${OB.piMo+1}</sub></b>: ${fmtX(m.x)}, ${m.occ} electron${m.occ===1?'':'s'}`)}${obLegend}</div></div>
    <h2 class="qz-h">All π orbitals, lowest energy first</h2><p class="hm-muted">Circle size shows the coefficient on each atom; colour shows its phase. Neighbouring atoms of opposite colour have a node between them.</p><div class="ob-cards">${R.mos.map((_,k)=>obPiCard(R,k)).join('')}</div></section>`;
   obShow('#obStage',obPiSpec(OB.pi,OB.piMo))}
  const wireOpts=()=>{const c=$('#obCut'),a=$('#obAxes'),r=$('#obReset');if(c)c.onchange=e=>{OB.cut=e.target.checked;obApplyOpts()};if(a)a.onchange=e=>{OB.axes=e.target.checked;obApplyOpts()};if(r)r.onclick=()=>{if(OBV.pivot){obResetView();obDraw()}};const hp=$('#obHybP');if(hp)hp.onchange=e=>{OB.hybP=e.target.checked;obPage('hybrid')};const h1=$('#obHybOne');if(h1)h1.onchange=e=>{OB.hybOne=e.target.checked;obPage('hybrid')}};
  wireOpts();renderOrbSide();$('#side').classList.remove('open');
}
function wireOrbitals(){
  const go=e=>{const p=e.target.closest('[data-obpage]');if(p){obPage(p.dataset.obpage);$('#main').scrollTop=0;return}
    const a=e.target.closest('[data-ao]');if(a){OB.atomic=a.dataset.ao;obPage('atomic');return}
    const h=e.target.closest('[data-hyb]');if(h){OB.hybrid=h.dataset.hyb;obPage('hybrid');return}
    const d=e.target.closest('[data-dia]');if(d){OB.dia=d.dataset.dia;OB.diaMo=null;obPage('dia');return}
    const dm=e.target.closest('[data-dmo]');if(dm){OB.diaMo=+dm.dataset.dmo;obPage('dia');return}
    const pi=e.target.closest('[data-pi]');if(pi){OB.pi=pi.dataset.pi;OB.piMo=null;obPage('pi');return}
    const pm=e.target.closest('[data-pmo]');if(pm){const y=$('#main').scrollTop;OB.piMo=+pm.dataset.pmo;obPage('pi');$('#main').scrollTop=y;return}};
  $('#orbPage').addEventListener('click',go);$('#orbSide').addEventListener('click',go);
  $('#orbPage').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.matches('[data-dmo],[data-pmo]')){e.preventDefault();e.target.dispatchEvent(new MouseEvent('click',{bubbles:true}))}});
}

if(/[?&]bltest\b/.test(location.search))Object.assign(window.__bl,{SP_BANK,spPoolGet,spBuild,spDoU,spHEnv,obPiCalc,obDiaCalc,obEig,obMesh,obGrid,obThreshold,AO});
wireV13();wireSpectra();wireOrbitals();
boot();
})();
