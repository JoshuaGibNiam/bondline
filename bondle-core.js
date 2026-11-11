// Bondle engine: answer matching and the daily puzzle schedule. Shared by the app and the admin page.
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
function norm(s){
  s=String(s==null?'':s);
  s=s.replace(/[øØæÆßłŁđœ]/g,function(c){return SPECIAL[c]}).replace(/[αβγδπσωμλ]/g,function(c){return GREEK[c]});
  s=s.normalize('NFKD').replace(/[̀-ͯ]/g,'').toLowerCase();
  s=s.replace(/^\s*(the|a|an)\s+/,'');
  s=s.replace(/sulph/g,'sulf').replace(/aluminium/g,'aluminum').replace(/caesium/g,'cesium').replace(/oestr/g,'estr').replace(/haem/g,'hem')
     .replace(/isation/g,'ization').replace(/ise\b/g,'ize').replace(/yse\b/g,'yze').replace(/colour/g,'color').replace(/vapour/g,'vapor')
     .replace(/litre/g,'liter').replace(/metre/g,'meter').replace(/centre/g,'center').replace(/fibre/g,'fiber').replace(/ae(?=[a-z])/g,'e');
  var tok=s.split(/[^a-z0-9+*]+/).filter(Boolean);
  while(tok.length>1&&STRIP_TAIL.indexOf(tok[tok.length-1])>=0)tok.pop();
  s=tok.join('').replace(/[+*]/g,'');
  if(s.length>4&&/s$/.test(s)&&!/ss$/.test(s))s=s.slice(0,-1);
  return s;
}
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
// Parse one prompt's answer list into [{name, tier, keys:[normalised aliases]}].
function parse(p){
  if(p._ans)return p._ans;
  var out=[],seen={};
  String(p.a||'').split(/\n|;/).forEach(function(line){
    line=line.trim();if(!line)return;
    var k=line.lastIndexOf('=');if(k<1)return;
    var tier=parseInt(line.slice(k+1),10);if(!(tier>=1&&tier<=5))return;
    var names=line.slice(0,k).split('|').map(function(x){return x.trim()}).filter(Boolean);if(!names.length)return;
    var keys=[];names.forEach(function(nm){var n=norm(nm);if(n&&!seen[n]){seen[n]=1;keys.push(n)}});
    if(keys.length)out.push({name:names[0],tier:tier,keys:keys});
  });
  try{Object.defineProperty(p,'_ans',{value:out,enumerable:false,configurable:true})}catch(e){}
  return out;
}
var LEX={n:-1,set:null};
function lexicon(){var B=window.BONDLE_BANK||[];if(LEX.n!==B.length){var o=Object.create(null);for(var i=0;i<B.length;i++){var a=parse(B[i]);for(var j=0;j<a.length;j++)for(var k=0;k<a[j].keys.length;k++)o[a[j].keys[k]]=1;
    if(B[i].x)String(B[i].x).split('|').forEach(function(w){var n=norm(w);if(n)o[n]=1})}LEX={n:B.length,set:o}}return LEX.set}
function matchOne(p,input){
  var ans=parse(p),q=norm(input);if(!q)return null;
  // Known wrong answers (p.x) never count, even as a typo of a right one.
  if(p.x&&String(p.x).split('|').map(norm).indexOf(q)>=0)return null;
  for(var i=0;i<ans.length;i++)if(ans[i].keys.indexOf(q)>=0)return ans[i];
  // Typos are forgiven only for words that aren't themselves a real answer somewhere in Bondle,
  // so "ethene" never counts as a typo of "ethane", or "amine" of "amide".
  if(q.length<5||lexicon()[q])return null;
  var best=null,bd=99;
  for(i=0;i<ans.length;i++)for(var j=0;j<ans[i].keys.length;j++){var key=ans[i].keys[j];if(key.length<5)continue;
    if(/\d/.test(q)||/\d/.test(key))continue;var max=Math.min(q.length,key.length)>=10?2:1,dd=dist(q,key,max);
    if(dd<=max&&(dd<bd||(dd===bd&&best&&ans[i].tier<best.tier))){bd=dd;best=ans[i]}}
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
var MIX={chem:4,sci:2}; // rounds per day from each pool
var schedCache={sig:'',days:[],last:null};
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
  var sig=bankSig(bank);if(schedCache.sig!==sig)schedCache={sig:sig,days:[],last:{}};
  var S=schedCache,chem=bank.filter(isChem),sci=bank.filter(function(p){return!isChem(p)});
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
function practice(bank,seed,kind){var r=rng(seed>>>0),shuf=function(L){L=L.slice();for(var i=L.length-1;i>0;i--){var j=Math.floor(r()*(i+1)),t=L[i];L[i]=L[j];L[j]=t}return L};
  var chem=shuf(bank.filter(isChem)),sci=shuf(bank.filter(function(p){return!isChem(p)})),out;
  if(kind==='chem'||!sci.length)out=chem.slice(0,ROUNDS);else if(kind==='sci')out=sci.slice(0,ROUNDS);else out=chem.slice(0,3).concat(sci.slice(0,3));
  return out.sort(function(x,y){return (x.lv||2)-(y.lv||2)})}
function bondFor(total){var b=BONDS[0];for(var i=0;i<BONDS.length;i++)if(total>=BONDS[i][0])b=BONDS[i];return b}
function maxPts(p){var a=parse(p),m=0;for(var i=0;i<a.length;i++)m=Math.max(m,TIERS[a[i].tier].pts);return m}
window.BondleCore={TOPICS:TOPICS,topic:topic,EPOCH:EPOCH,ROUNDS:ROUNDS,TIERS:TIERS,BONDS:BONDS,norm:norm,parse:parse,match:match,dayKey:dayKey,keyToIndex:keyToIndex,indexToKey:indexToKey,daily:daily,dailyIds:dailyIds,practice:practice,bondFor:bondFor,maxPts:maxPts,dist:dist};
})();
