// Bondline page-view counter. One small record per page view in Firestore (collection "visits"),
// readable only by the admin. No cookies and nothing from your notes. Skipped if you turned
// usage statistics off in Settings → Privacy, or if your browser sends Global Privacy Control.
(function(){'use strict';
  try{
    var ls=window.localStorage,ss=window.sessionStorage;
    if(ls.getItem('bondline.stats')==='off'||ls.getItem('bondline.notrack')==='1'||navigator.globalPrivacyControl)return;
    if(/bot|crawl|spider|slurp|lighthouse|headless|preview|facebookexternalhit|whatsapp|telegrambot/i.test(navigator.userAgent||''))return;
    var rid=function(n){var a=new Uint8Array(n),s='abcdefghijklmnopqrstuvwxyz0123456789',o='';(window.crypto||window.msCrypto).getRandomValues(a);for(var i=0;i<n;i++)o+=s[a[i]%36];return o};
    var vid=ls.getItem('bondline.vid'),isNew=false;if(!vid||!/^[a-z0-9]{16,40}$/.test(vid)){vid=rid(20);ls.setItem('bondline.vid',vid);isNew=true}
    var sid=ss.getItem('bondline.sid');if(!sid){sid=rid(12);ss.setItem('bondline.sid',sid)}
    var q=new URLSearchParams(location.search),ref='';
    try{if(document.referrer){var r=new URL(document.referrer);if(r.hostname!==location.hostname)ref=r.hostname.replace(/^www\./,'')}}catch(e){}
    var utm=(q.get('utm_source')||q.get('ref')||q.get('src')||'').slice(0,60).toLowerCase(),camp=(q.get('utm_campaign')||'').slice(0,80),med=(q.get('utm_medium')||'').slice(0,40);
    // Remember where this device first came from, so the app can link it to sign-ups and activity.
    if(!ls.getItem('bondline.first'))ls.setItem('bondline.first',JSON.stringify({u:utm,c:camp,m:med,r:ref,p:location.pathname,t:Date.now()}));
    var ua=navigator.userAgent||'',touchMac=/Macintosh/.test(ua)&&navigator.maxTouchPoints>1;
    var dev=/iPad/.test(ua)||touchMac||(/Android/.test(ua)&&!/Mobile/.test(ua))?'tablet':/Mobi|iPhone|Android/.test(ua)?'mobile':'desktop';
    var app=(window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone?'pwa':'web';
    var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||''}catch(e){}
    var d=new Date(),day=d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2);
    var path=location.pathname.slice(0,120);
    if(path==='/'||path==='/index.html'){path=document.documentElement.classList.contains('lp-off')?'/ (app)':'/ (landing)'}
    var f={t:{integerValue:String(Date.now())},d:{stringValue:day},v:{stringValue:vid},s:{stringValue:sid},p:{stringValue:path},dev:{stringValue:dev},app:{stringValue:app},tz:{stringValue:tz.slice(0,60)},lang:{stringValue:String(navigator.language||'').slice(0,20)},n:{booleanValue:isNew}};
    if(ref)f.r={stringValue:ref.slice(0,100)};if(utm)f.u={stringValue:utm};if(camp)f.c={stringValue:camp};if(med)f.m={stringValue:med};
    var uid=ls.getItem('bondline.uid');if(uid&&uid.length<=128)f.uid={stringValue:uid};
    // The Firebase settings come from /firebase-config.js (loaded here on pages that don't already have it).
    var post=function(cfg){fetch('https://firestore.googleapis.com/v1/projects/'+cfg.projectId+'/databases/(default)/documents/visits?key='+encodeURIComponent(cfg.apiKey),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:f}),keepalive:true}).catch(function(){})};
    var send=function(){if(window.BONDLINE_FIREBASE)return post(window.BONDLINE_FIREBASE);var sc=document.createElement('script');sc.src='/firebase-config.js';sc.onload=function(){if(window.BONDLINE_FIREBASE)post(window.BONDLINE_FIREBASE)};document.head.appendChild(sc)};
    if(document.readyState==='complete')setTimeout(send,300);else addEventListener('load',function(){setTimeout(send,300)});
  }catch(e){}
})();
