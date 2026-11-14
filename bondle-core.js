// Bondle engine: answer matching and the daily puzzle schedule (general science from Bondle #7). Shared by the app and the admin page.
(function(){'use strict';
var EPOCH=Date.UTC(2026,10,8); // Bondle #1 = 8 November 2026
var ROUNDS=6;
var TIERS=[
  {n:0,name:'No bond',pts:0,emo:'⬛'},
  {n:1,name:'Tap Water',pts:10,emo:'💧'},
  {n:2,name:'Lab Grade',pts:25,emo:'🧪'},
  {n:3,name:'Analytical',pts:50,emo:'⚗️'},
  {n:4,name:'Rare Earth',pts:75,emo:'💎'},
  {n:5,name:'One in a Mole',pts:100,emo:'⚛️'}
];
// Real average bond enthalpies (kJ/mol) used to describe a day's total.
var BONDS=[[0,'nothing at all','a noble gas'],[20,'H···O','a hydrogen bond'],[151,'I–I','an iodine–iodine bond'],[158,'F–F','a fluorine–fluorine bond'],[193,'Br–Br','a bromine–bromine bond'],[242,'Cl–Cl','a chlorine–chlorine bond'],[348,'C–C','a carbon–carbon single bond'],[413,'C–H','a carbon–hydrogen bond'],[436,'H–H','a hydrogen–hydrogen bond'],[463,'O–H','an oxygen–hydrogen bond'],[600,'C=C','almost a C=C double bond (614)']];

var GREEK={'α':'alpha','β':'beta','γ':'gamma','δ':'delta','π':'pi','σ':'sigma','ω':'omega','μ':'mu','λ':'lambda'};
var SPECIAL={'ø':'o','Ø':'o','æ':'ae','Æ':'ae','ß':'ss','ł':'l','Ł':'l','đ':'d','œ':'oe'};
var STRIP_TAIL=['reaction','reagent','rxn','process','law','rule','principle','test','method','solution','ion'];
// Words that are dropped wherever they appear, and number words / Roman numerals that are read as digits.
var STOP={of:1,the:1,and:1};
var NUMW={zero:'0',one:'1',two:'2',three:'3',four:'4',five:'5',six:'6',seven:'7',eight:'8',nine:'9',ten:'10',eleven:'11',twelve:'12',thirteen:'13',fourteen:'14',
  ii:'2',iii:'3',iv:'4',vi:'6',vii:'7',viii:'8',ix:'9'};
// Words people add around an answer ("I think it's …"), ignored when matching.
var FILLER={it:1,its:1,is:1,called:1,i:1,think:1,maybe:1,probably:1,guess:1,um:1,eg:1,like:1,element:1,gas:1,metal:1,atom:1};
// Words too vague to count as an answer on their own ("acid" is not "sulfuric acid").
var GENERIC={};('acid base salt oxide hydroxide chloride sulfate nitrate carbonate gas metal ion energy wave ray cell force law theory effect star planet moon sea ocean lake river mount mountain '
 +'new old big small great little north south east west northern southern eastern western upper lower inner outer red white blue green black yellow super hyper micro macro mini hot cold dark light heavy '
 +'high low water air group type kind form system element compound body human plant animal blood test unit number scale order class st saint lord sir dr von van de la le du da del al el')
 .split(' ').forEach(function(w){GENERIC[w]=1});
// Split an answer into normalised words. Capitals, accents, hyphens, subscripts, plurals, British/US
// spellings, "&", "of/the/and", number words and Roman numerals all stop mattering.
function tokens(s){
  s=String(s==null?'':s);
  s=s.replace(/[øØæÆßłŁđœ]/g,function(c){return SPECIAL[c]}).replace(/[αβγδπσωμλ]/g,function(c){return GREEK[c]});
  s=s.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/&/g,' and ').replace(/['’‘`]s\b/g,'').replace(/['’‘`]/g,'');
  s=s.replace(/sulph/g,'sulf').replace(/aluminium/g,'aluminum').replace(/caesium/g,'cesium').replace(/oestr/g,'estr').replace(/haem/g,'hem')
     .replace(/aeroplane/g,'airplane').replace(/\bgrey/g,'gray').replace(/mould/g,'mold').replace(/foet/g,'fet').replace(/paed/g,'ped').replace(/anaes/g,'anes')
     .replace(/programme/g,'program').replace(/plough/g,'plow').replace(/([a-z]{3})our\b/g,'$1or').replace(/([a-z]{3})ours\b/g,'$1ors')
     .replace(/isation/g,'ization').replace(/ise\b/g,'ize').replace(/ising\b/g,'izing').replace(/yse\b/g,'yze').replace(/colour/g,'color').replace(/vapour/g,'vapor')
     .replace(/litre/g,'liter').replace(/metre/g,'meter').replace(/centre/g,'center').replace(/fibre/g,'fiber').replace(/ae(?=[a-z])/g,'e');
  var tok=s.split(/[^a-z0-9]+/).filter(Boolean),out=[],i,w;
  if(tok.length>1&&(tok[0]==='a'||tok[0]==='an'))tok.shift();
  for(i=0;i<tok.length;i++){w=tok[i];
    if(STOP[w]&&tok.length>1)continue;
    if(w==='mt'&&tok.length>1)w='mount';
    if(NUMW[w]&&tok.length>1)w=NUMW[w];
    else if(w.length>4&&/ies$/.test(w))w=w.slice(0,-3)+'y';
    else if(w.length>3&&/s$/.test(w)&&!/(ss|us|is)$/.test(w))w=w.slice(0,-1);
    out.push(w)}
  if(!out.length)out=tok;
  while(out.length>1&&STRIP_TAIL.indexOf(out[out.length-1])>=0)out.pop();
  return out;
}
function norm(s){return tokens(s).join('')}
// Optimal string alignment distance, stopping early once it exceeds max.
function dist(a,b,max){
  if(Math.abs(a.length-b.length)>max)return max+1;
  var m=a.length,n=b.length,d=[],i,j;
  for(i=0;i<=m;i++){d[i]=[i];}
  for(j=0;j<=n;j++)d[0][j]=j;
  for(i=1;i<=m;i++){var rowMin=1e9;for(j=1;j<=n;j++){var c=a[i-1]===b[j-1]?0:1;
    var v=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+c);
    if(i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1])v=Math.min(v,d[i-2][j-2]+1);
    d[i][j]=v;if(v<rowMin)rowMin=v}
    if(rowMin>max)return max+1}
  return d[m][n];
}
// Parse one prompt's answer list into [{name, tier, keys:[normalised aliases], toks:[their words]}].
function parse(p){
  if(p._ans)return p._ans;
  var out=[],seen={};
  String(p.a||'').split(/\n|;/).forEach(function(line){
    line=line.trim();if(!line)return;
    var k=line.lastIndexOf('=');if(k<1)return;
    var tier=parseInt(line.slice(k+1),10);if(!(tier>=1&&tier<=5))return;
    var names=line.slice(0,k).split('|').map(function(x){return x.trim()}).filter(Boolean);if(!names.length)return;
    var keys=[],toks=[];names.forEach(function(nm){var t=tokens(nm),n=t.join('');if(n&&!seen[n]){seen[n]=1;keys.push(n);toks.push(t)}});
    if(keys.length)out.push({name:names[0],tier:tier,keys:keys,toks:toks});
  });
  try{Object.defineProperty(p,'_ans',{value:out,enumerable:false,configurable:true})}catch(e){}
  return out;
}
var LEX={n:-1,set:null,things:null};
// set: every accepted answer in Bondle. things: the same without people's names (so "Bunsen" can still mean a Bunsen burner).
function lexicon(){var B=window.BONDLE_BANK||[];if(LEX.n!==B.length){var o=Object.create(null),th=Object.create(null);for(var i=0;i<B.length;i++){var a=parse(B[i]),ppl=B[i].g==='people';for(var j=0;j<a.length;j++)for(var k=0;k<a[j].keys.length;k++){o[a[j].keys[k]]=1;if(!ppl)th[a[j].keys[k]]=1}
    if(B[i].x)String(B[i].x).split('|').forEach(function(w){var n=norm(w);if(n){o[n]=1;th[n]=1}})}LEX={n:B.length,set:o,things:th}}return LEX}
// The words of the question itself ("planet" in "Name a planet"): repeating them in an answer changes nothing.
function echo(p){
  if(p._echo)return p._echo;
  var o=Object.create(null);tokens(String(p.q||'').replace(/\(|\)/g,' ')).forEach(function(w){o[w]=1});
  for(var w in FILLER)o[w]=1;
  if(o.energy)o.power=1;if(o.power)o.energy=1;
  try{Object.defineProperty(p,'_echo',{value:o,enumerable:false,configurable:true})}catch(e){}
  return o;
}
function strip(t,e){var out=t.filter(function(w){return!e[w]});return out.length?out:t}
function lowest(list){var best=null;for(var i=0;i<list.length;i++)if(!best||list[i].tier<best.tier)best=list[i];return best}
function uniq(list){var out=[];list.forEach(function(a){if(out.indexOf(a)<0)out.push(a)});return out}
function matchOne(p,input){
  var ans=parse(p),qt=tokens(input),q=qt.join('');if(!q)return null;
  var e=echo(p),st=strip(qt,e),qs=st.join(''),i,j,hit;
  // 1. Exactly an accepted answer.
  for(i=0;i<ans.length;i++)if(ans[i].keys.indexOf(q)>=0)return ans[i];
  // Known wrong answers (p.x) never count, even as a typo of a right one.
  if(p.x){var bad=String(p.x).split('|').map(norm);if(bad.indexOf(q)>=0||bad.indexOf(qs)>=0)return null}
  // 2. The same once the question's own words and filler are ignored: "the planet Mars", "kinetic energy".
  hit=[];
  for(i=0;i<ans.length;i++)for(j=0;j<ans[i].toks.length;j++){var ks=strip(ans[i].toks[j],e).join('');if(ks===qs||ks===q||ans[i].keys[j]===qs){hit.push(ans[i]);break}}
  if(hit.length)return lowest(hit);
  var L=lexicon(),lex=L.set,real=lex[q]||lex[qs],thing=L.things[q]||L.things[qs];
  // 3. Part of a longer answer, or its words in another order: "Fuji" for "Mount Fuji", "sulfuric" for
  //    "sulfuric acid". Only when it points to one answer, and never for a vague word or a word that is
  //    a real answer to some other Bondle question.
  var specific=st.some(function(w){return!GENERIC[w]&&!STOP[w]&&/[a-z]/.test(w)&&(w.length>=3||(w.length===2&&/\d/.test(w)))});
  var same=[],part=[];
  for(i=0;i<ans.length;i++)for(j=0;j<ans[i].toks.length;j++){var kt=strip(ans[i].toks[j],e);
    if(kt.length<2&&st.length<2)continue;
    if(!st.every(function(w){return kt.indexOf(w)>=0}))continue;
    if(st.length===kt.length&&kt.every(function(w){return st.indexOf(w)>=0}))same.push(ans[i]);else part.push(ans[i])}
  same=uniq(same);part=uniq(part);
  if(same.length)return lowest(same);
  if(part.length===1&&specific&&!thing)return part[0];
  // 4. Initials of a longer answer: "ISS", "BEC", "LED".
  if(!thing&&/^[a-z]{2,6}$/.test(q)&&qt.length===1){hit=[];
    for(i=0;i<ans.length;i++)for(j=0;j<ans[i].toks.length;j++){var t=ans[i].toks[j];
      if(t.length===q.length&&t.map(function(w){return w.charAt(0)}).join('')===q){hit.push(ans[i]);break}}
    hit=uniq(hit);if(hit.length===1)return hit[0]}
  // 5. Typos are forgiven only for words that aren't themselves a real answer somewhere in Bondle,
  //    so "ethene" never counts as a typo of "ethane", or "amine" of "amide".
  if(real)return null;
  var best=null,bd=99,forms=q===qs?[q]:[q,qs];
  for(var f=0;f<forms.length;f++){var s=forms[f];if(s.length<5)continue;
    for(i=0;i<ans.length;i++)for(j=0;j<ans[i].keys.length;j++){var cand=[ans[i].keys[j]],k2=strip(ans[i].toks[j],e).join('');if(k2!==cand[0])cand.push(k2);
      for(var c=0;c<cand.length;c++){var key=cand[c];if(key.length<5)continue;
        if(/\d/.test(s)||/\d/.test(key))continue;var len=Math.min(s.length,key.length),max=len>=14?3:len>=8?2:1,dd=dist(s,key,max);
        if(dd>1&&s.charAt(0)!==key.charAt(0))continue;
        if(dd<=max&&(dd<bd||(dd===bd&&best&&ans[i].tier<best.tier))){bd=dd;best=ans[i]}}}}
  return best;
}
// Several answers typed at once ("NaBH4 / LiAlH4") only score the lowest of them.
function match(p,input){
  var s=String(input||''),whole=matchOne(p,s),SEP=/[,/;&+]|\s(?:or|and|then)\s/i;
  if(whole||!SEP.test(s))return whole;
  var parts=s.split(new RegExp(SEP.source,'gi')).map(function(x){return x.trim()}).filter(Boolean);
  if(parts.length<2)return whole;
  var found=parts.map(function(x){return matchOne(p,x)}).filter(Boolean);
  if(whole&&!found.length)return whole;
  if(!found.length)return null;
  var distinct={};found.forEach(function(a){distinct[a.name]=a});var list=Object.keys(distinct).map(function(k){return distinct[k]});
  if(whole&&list.length===1&&list[0]===whole)return whole;
  if(list.length===1)return list[0];
  return list.sort(function(a,b){return a.tier-b.tier})[0];
}
function dayKey(t){var d=new Date(t==null?Date.now():t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function keyToIndex(k){var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(k);if(!m)return 0;return Math.round((Date.UTC(+m[1],+m[2]-1,+m[3])-EPOCH)/864e5)}
function indexToKey(i){var d=new Date(EPOCH+i*864e5);return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0')}
function rng(seed){var s=seed>>>0;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
// Schedule: walk forward from day 0. Each day takes the 6 prompts used longest ago (ties broken by a
// seeded shuffle), with at most one prompt from the same group (e.g. "name an element in group X"),
// at least one easy prompt and no more than two hard ones. Deterministic for a given bank.
var TOPICS={chem:'Chemistry',phys:'Physics',bio:'Biology',earth:'Earth science',space:'Space',sci:'Science'};
function topic(p){return(p&&p.t)||'chem'}
function isChem(p){return topic(p)==='chem'}
var MIX={chem:4,sci:2}; // the first days of Bondle (before GENERAL_FROM): four chemistry rounds, two science
// From GENERAL_FROM on, Bondle is a general science puzzle: one round from each topic every day.
// Chemistry rounds come only from everyday chemistry (GEN_CHEM, or any prompt marked gen:1);
// the specialist organic prompts stay in Practice → Chemistry.
var GENERAL_FROM=6; // Bondle #7 = 14 November 2026
var DAY_TOPICS=['chem','phys','bio','earth','space','sci'];
var GEN_CHEM={};('halogen noble alkali strongacid glassware airgas sugar polymer tm crudeoil rxntype painkiller flame carbonallo household placeelement foodacid units bonds radioactive '
 +'labgas vitamin metalloid mineral alloy gaselement biomolecule fuel safety exo endo scientist oddsymbol sublime indicator seawater lanthanide catalyst hormone').split(' ').forEach(function(k){GEN_CHEM[k]=1});
function isGeneral(p){return!isChem(p)||!!(p.gen||GEN_CHEM[p.id])}
var schedCache={sig:'',days:[],last:null,gdays:[],glast:null};
function bankSig(bank){var s=bank.length+':';for(var i=0;i<bank.length;i++)s+=bank[i].id+',';return s}
// Pick `want` prompts from `pool`: used longest ago first (ties by a seeded shuffle), at most one per
// group, no more than two hard ones a day, and at least one easy one across the day.
function pickFrom(pool,want,last,r,state){
  var order=pool.map(function(p){return{p:p,k:(last[p.id]==null?-1:last[p.id]),t:r()}});
  order.sort(function(a,b){return a.k-b.k||a.t-b.t});
  var pick=[];want=Math.min(want,pool.length);
  for(var pass=0;pass<2&&pick.length<want;pass++)for(var i=0;i<order.length&&pick.length<want;i++){var p=order[i].p;if(pick.indexOf(p)>=0)continue;var lv=p.lv||2;
    if(pass===0){if(p.g&&state.groups[p.g+':'+topic(p).slice(0,1)])continue;if(lv>=3&&state.hard>=2)continue;if(state.last&&pick.length===want-1&&!state.easy&&lv>1)continue}
    pick.push(p);if(p.g)state.groups[p.g+':'+topic(p).slice(0,1)]=1;if(lv>=3)state.hard++;if(lv<=1)state.easy++}
  return pick;
}
function dailyIds(bank,idx){
  var N=bank.length;if(!N||idx<0)return[];
  var sig=bankSig(bank);if(schedCache.sig!==sig)schedCache={sig:sig,days:[],last:{},gdays:[],glast:{}};
  var S=schedCache;
  if(idx>=GENERAL_FROM){
    // General science: one prompt per topic, each the one used longest ago; at most one "people" round a day.
    var pools=DAY_TOPICS.map(function(t){return bank.filter(function(p){return topic(p)===t&&isGeneral(p)})}).filter(function(L){return L.length});
    if(pools.length){
      while(S.gdays.length<=idx-GENERAL_FROM){var gd=S.gdays.length,gr=rng(40503*(gd+1)+977),gs={groups:{},hard:0,easy:0,last:false},gp=[];
        var ord=pools.map(function(L,i){return{L:L,t:gr(),i:i}}).sort(function(a,b){return a.t-b.t});
        ord.forEach(function(o,n){gs.last=n===ord.length-1;
          var one=pickFrom(o.L.filter(function(p){return!(p.g==='people'&&gs.people)}),1,S.glast,gr,gs)[0]||pickFrom(o.L,1,S.glast,gr,gs)[0];
          if(one){gp.push(one);if(one.g==='people')gs.people=1}});
        // Top up to six rounds if a topic has no prompts.
        if(gp.length<ROUNDS){var rest=bank.filter(function(p){return isGeneral(p)&&gp.indexOf(p)<0});gp=gp.concat(pickFrom(rest,ROUNDS-gp.length,S.glast,gr,gs))}
        gp.forEach(function(p){S.glast[p.id]=gd});S.gdays.push(gp.map(function(p){return p.id}))}
      return S.gdays[idx-GENERAL_FROM].slice();
    }
  }
  // The original schedule. It only looks at the original prompts (no n: flag), so days already played never change.
  var old=bank.filter(function(p){return!p.n}),chem=old.filter(isChem),sci=old.filter(function(p){return!isChem(p)});
  var wantSci=sci.length?Math.min(MIX.sci,sci.length):0,wantChem=Math.min(ROUNDS-wantSci,chem.length);
  while(S.days.length<=idx){var d=S.days.length,r=rng(2654435761*(d+1)),state={groups:{},hard:0,easy:0,last:false};
    var a=pickFrom(chem,wantChem,S.last,r,state);state.last=true;var b=pickFrom(sci,wantSci,S.last,r,state);
    var pick=a.concat(b);pick.forEach(function(p){S.last[p.id]=d});S.days.push(pick.map(function(p){return p.id}))}
  return S.days[idx].slice();
}
function daily(bank,idx,override){
  var by={};bank.forEach(function(p){by[p.id]=p});
  var picked=dailyIds(bank,idx).map(function(id){return by[id]});
  var rounds=picked.slice().sort(function(a,b){return (a.lv||2)-(b.lv||2)});
  var theme='';
  if(override&&Array.isArray(override.rounds)&&override.rounds.length){
    theme=override.theme||'';
    var custom=override.rounds.filter(function(r){return r&&r.q&&r.a}).slice(0,ROUNDS).map(function(r,i){return{id:r.id||('x'+idx+'_'+i),lv:r.lv||2,t:r.t&&r.t!=='chem'?String(r.t):undefined,q:String(r.q),h:r.h||'',f:r.f||'',a:String(r.a)}});
    var ex={};custom.forEach(function(r){ex[r.id]=1});
    rounds=custom.concat(rounds.filter(function(r){return !ex[r.id]})).slice(0,ROUNDS);
  }
  return{idx:idx,num:idx+1,key:indexToKey(idx),theme:theme,rounds:rounds};
}
// Practice: 'mix' = general science (one round per topic), 'sci' = everything but chemistry, 'chem' = all chemistry.
function practice(bank,seed,kind){var r=rng(seed>>>0),shuf=function(L){L=L.slice();for(var i=L.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=L[i];L[i]=L[j];L[j]=t}return L};
  var chem=shuf(bank.filter(isChem)),sci=shuf(bank.filter(function(p){return!isChem(p)})),out;
  if(kind==='chem'||!sci.length)out=chem.slice(0,ROUNDS);else if(kind==='sci')out=sci.slice(0,ROUNDS);
  else{out=[];DAY_TOPICS.forEach(function(t){var L=shuf(bank.filter(function(p){return topic(p)===t&&isGeneral(p)}));if(L.length)out.push(L[0])});
    if(out.length<ROUNDS)out=out.concat(shuf(bank.filter(function(p){return isGeneral(p)&&out.indexOf(p)<0})).slice(0,ROUNDS-out.length))}
  return out.sort(function(x,y){return (x.lv||2)-(y.lv||2)})}
function bondFor(total){var b=BONDS[0];for(var i=0;i<BONDS.length;i++)if(total>=BONDS[i][0])b=BONDS[i];return b}
function maxPts(p){var a=parse(p),m=0;for(var i=0;i<a.length;i++)m=Math.max(m,TIERS[a[i].tier].pts);return m}
window.BondleCore={TOPICS:TOPICS,topic:topic,EPOCH:EPOCH,ROUNDS:ROUNDS,TIERS:TIERS,BONDS:BONDS,norm:norm,tokens:tokens,isGeneral:isGeneral,GENERAL_FROM:GENERAL_FROM,parse:parse,match:match,dayKey:dayKey,keyToIndex:keyToIndex,indexToKey:indexToKey,daily:daily,dailyIds:dailyIds,practice:practice,bondFor:bondFor,maxPts:maxPts,dist:dist};
})();
