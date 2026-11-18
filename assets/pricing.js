(function(){var c=window.BONDLINE_PRO||{};var p=c.price||{};
var W=c.was||{},was=function(e,k){if(c.saleOn&&W[k]&&!(e.previousElementSibling&&e.previousElementSibling.classList.contains('was'))){var s=document.createElement('s');s.className='was';s.textContent=W[k];s.setAttribute('aria-label','was '+W[k]);e.parentNode.insertBefore(s,e)}};
document.querySelectorAll('[data-price]').forEach(function(e){var k=e.getAttribute('data-price'),v=p[k];if(v)e.textContent=v;was(e,k)});
document.querySelectorAll('[data-sale]').forEach(function(e){if(c.saleOn){e.innerHTML='<b>'+c.saleText+'.</b> '+(e.getAttribute('data-sale')||'');e.hidden=false}});
var d=c.passDays||150;document.querySelectorAll('[data-days]').forEach(function(e){e.textContent=Math.round(d/30)+' months'});
var x=c.examDays||60;document.querySelectorAll('[data-xweeks]').forEach(function(e){e.textContent=Math.round(x/7)+' weeks'});
var ce=c.centre||{};document.querySelectorAll('[data-cprice]').forEach(function(e){if(ce.price)e.textContent=ce.price;was(e,'centre')});
document.querySelectorAll('[data-cmonths]').forEach(function(e){e.textContent=Math.round((ce.days||150)/30)+' months'});
var pv=document.getElementById('pv');if(pv&&!c.enforce)pv.hidden=false;})();
