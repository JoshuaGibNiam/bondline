// Bondline amino acid flashcards (v39). Data comes from the #aa-data block; structures are cloned from the table.
// Leitner boxes 1–5 per card and mode, saved in localStorage 'bondline.aaflash'. Lower boxes come up more often.
(function () {
  'use strict';
  var D = JSON.parse(document.getElementById('aa-data').textContent);
  var root = document.getElementById('flashcards'); if (!root) return;
  var $ = function (s) { return root.querySelector(s); };
  var GROUP = { np: 'Nonpolar', ar: 'Aromatic', po: 'Polar, uncharged', ac: 'Acidic (−)', ba: 'Basic (+)' };
  var KEY = 'bondline.aaflash', S = {};
  try { S = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { S = {}; }
  var mode = 's2n', set = 'all', cur = null, shown = false, last = null, streak = 0;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function svgOf(a) { var r = document.getElementById('aa-' + a.t.toLowerCase()); var s = r && r.querySelector('svg'); return s ? s.outerHTML : ''; }
  function box(a) { return (S[mode] && S[mode][a.t]) || 1; }
  function pool() { return D.filter(function (a) { return set === 'all' || (set === 'ess' ? a.e : a.g === set); }); }
  function pick() {
    var P = pool(); if (P.length > 1 && last) P = P.filter(function (a) { return a !== last; });
    var w = P.map(function (a) { return Math.pow(2, 5 - box(a)); }), tot = w.reduce(function (x, y) { return x + y; }, 0), r = Math.random() * tot;
    for (var i = 0; i < P.length; i++) { r -= w[i]; if (r <= 0) return P[i]; } return P[P.length - 1];
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function front(a) {
    if (mode === 's2n') return '<div class="fc-sv">' + svgOf(a) + '</div><p class="fc-q">Which amino acid is this?</p>';
    if (mode === 'n2s') return '<p class="fc-big">' + esc(a.n) + '</p><p class="fc-q">Picture its structure, then check.</p>';
    if (mode === 'code') return '<p class="fc-big">' + esc(a.n) + '</p><p class="fc-q">Three-letter and one-letter codes?</p>';
    return '<div class="fc-sv">' + svgOf(a) + '</div><p class="fc-q">' + esc(a.n) + ': which type of side chain?</p>';
  }
  function back(a) {
    var codes = '<p class="fc-codes"><b>' + a.t + '</b> · <b>' + a.o + '</b></p>';
    var meta = '<p class="fc-meta">' + GROUP[a.g] + (a.k ? ' · side-chain pKₐ ' + a.k : '') + ' · pI ' + a.p.toFixed(2) + (a.e ? ' · essential' : '') + '</p>';
    var head = mode === 'n2s' ? '<div class="fc-sv">' + svgOf(a) + '</div>' : '<p class="fc-big">' + esc(a.n) + '</p>';
    var extra = mode === 'code' ? '<p class="fc-hint">' + esc(a.h) + '</p>' : '<p class="fc-hint">' + esc(a.f) + '</p>';
    return head + codes + meta + extra;
  }
  function stats() {
    var P = pool(), m = S[mode] || {}, known = P.filter(function (a) { return (m[a.t] || 1) >= 3; }).length;
    $('.fc-prog').textContent = known + ' of ' + P.length + ' learned' + (streak > 2 ? ' · streak ' + streak : '');
  }
  function next() {
    cur = pick(); shown = false;
    $('.fc-front').innerHTML = front(cur); $('.fc-back').hidden = true; $('.fc-back').innerHTML = '';
    $('.fc-flip').hidden = false; $('.fc-again').hidden = true; $('.fc-good').hidden = true;
    root.querySelector('.fc-card').classList.remove('flip'); stats();
  }
  function flip() {
    if (shown) return; shown = true;
    $('.fc-back').innerHTML = back(cur); $('.fc-back').hidden = false;
    root.querySelector('.fc-card').classList.add('flip');
    $('.fc-flip').hidden = true; $('.fc-again').hidden = false; $('.fc-good').hidden = false; $('.fc-good').focus({ preventScroll: true });
  }
  function grade(ok) {
    if (!shown) return; S[mode] = S[mode] || {};
    var b = box(cur); S[mode][cur.t] = ok ? Math.min(5, b + 1) : 1; streak = ok ? streak + 1 : 0;
    save(); last = cur; next();
  }
  root.querySelectorAll('[data-mode]').forEach(function (b) {
    b.addEventListener('click', function () {
      mode = b.dataset.mode; root.querySelectorAll('[data-mode]').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); }); last = null; next();
    });
  });
  $('.fc-set').addEventListener('change', function (e) { set = e.target.value; last = null; next(); });
  $('.fc-flip').addEventListener('click', flip);
  root.querySelector('.fc-card').addEventListener('click', flip);
  $('.fc-again').addEventListener('click', function () { grade(false); });
  $('.fc-good').addEventListener('click', function () { grade(true); });
  $('.fc-reset').addEventListener('click', function () { if (confirmReset()) { S = {}; save(); next(); } });
  function confirmReset() { var b = $('.fc-reset'); if (b.dataset.sure) { delete b.dataset.sure; b.textContent = 'Reset progress'; return true; } b.dataset.sure = '1'; b.textContent = 'Click again to reset'; setTimeout(function () { delete b.dataset.sure; b.textContent = 'Reset progress'; }, 3000); return false; }
  document.addEventListener('keydown', function (e) {
    if (e.target.closest && e.target.closest('input,select,textarea')) return;
    var r = root.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
    if (e.key === ' ' && !shown) { e.preventDefault(); flip(); }
    else if (e.key === '1') grade(false); else if (e.key === '2') grade(true);
  });
  // table filter chips
  var chips = document.querySelectorAll('.aa-chip');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.toggle('on', x === c); });
      var f = c.dataset.f;
      document.querySelectorAll('.aa-table tbody tr').forEach(function (tr) {
        var a = D.filter(function (x) { return 'aa-' + x.t.toLowerCase() === tr.id; })[0];
        tr.hidden = !(f === 'all' || (f === 'ess' ? a.e : a.g === f));
      });
    });
  });
  next();
})();
