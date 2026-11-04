(function(){var c=window.BONDLINE_PRO||{};var p=c.price||{};
document.querySelectorAll('[data-price]').forEach(function(e){var v=p[e.getAttribute('data-price')];if(v)e.textContent=v});
var d=c.passDays||150;document.querySelectorAll('[data-days]').forEach(function(e){e.textContent=Math.round(d/30)+' months'});
var pv=document.getElementById('pv');if(pv&&!c.enforce)pv.hidden=false;})();
