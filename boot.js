(function(){try{var a=JSON.parse(localStorage.getItem('bondline.appearance')||'{}'),r=document.documentElement;if(a.scheme&&a.scheme!=='copper')r.setAttribute('data-scheme',a.scheme);if(a.mode==='light'||a.mode==='dark')r.setAttribute('data-mode',a.mode)}catch(e){}})();
(function(){try{if(localStorage.getItem('bondline.sidebar')==='off')document.documentElement.setAttribute('data-side','off')}catch(e){}})();
// Landing page: shown to first-time visitors (and search engines). Returning users, the installed app,
// share/invite links and ?app go straight to the notebook. Add ?about to the address to see it again.
(function(){var off=true;try{var q=location.search,h=location.hash,ls=localStorage;
if(/[?&]about\b/.test(q))off=false;
else if(/[?&](app|welcome)\b/.test(q)||/[#&](share|join)=/.test(h))off=true;
else if((window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone)off=true;
else off=!!(ls.getItem('bondline.landing')||ls.getItem('bondline.welcomed')||ls.getItem('bondline.uid')||ls.getItem('bondline.pendingAuth')||ls.getItem('bondline.pendingJoin'));
}catch(e){off=true}if(off)document.documentElement.classList.add('lp-off')})();
