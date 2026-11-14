// "Pay for a student" page. The student's link carries ?for=<their Bondline account ID>&n=<first name>.
(function(){
  var q=new URLSearchParams(location.search),uid=q.get('for')||'',name=(q.get('n')||'').replace(/[<>&"]/g,'').slice(0,30);
  var ok=/^[A-Za-z0-9_-]{6,128}$/.test(uid),cfg=window.BONDLINE_PRO||{},sale=cfg.checkout||{};
  var $=function(id){return document.getElementById(id)};
  if(name){$('gName').textContent=name;document.querySelectorAll('[data-gname]').forEach(function(e){e.textContent=name})}
  if(q.get('done')){$('gDone').hidden=false;return}
  if(!ok){$('gNeed').hidden=false;
    $('gUse').addEventListener('click',function(){var v=$('gLink').value.trim(),m=v.match(/[?&]for=([A-Za-z0-9_-]{6,128})/);
      if(!m){$('gErr').hidden=false;return}
      var n=(v.match(/[?&]n=([^&#]*)/)||[])[1]||'';location.href='/gift/?for='+m[1]+(n?'&n='+n:'')});
    return}
  $('gPay').hidden=false;
  document.querySelectorAll('[data-gplan]').forEach(function(b){var plan=b.getAttribute('data-gplan');
    if(!sale[plan]){b.disabled=true;b.textContent='Not on sale yet';return}
    b.addEventListener('click',function(){var t=b.textContent;b.disabled=true;b.textContent='Opening checkout…';$('gFail').hidden=true;
      fetch('/api/checkout',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({plan:plan,uid:uid,from:'gift',n:name})})
        .then(function(r){return r.json().then(function(j){return{ok:r.ok,j:j}})})
        .then(function(x){if(x.ok&&x.j.url){location.href=x.j.url;return}throw new Error(x.j.error||'')})
        .catch(function(e){b.disabled=false;b.textContent=t;$('gFail').textContent=e.message||'Couldn’t open the checkout. Please try again.';$('gFail').hidden=false})})});
})();
