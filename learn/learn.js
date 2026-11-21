/* Bondline interactive lessons (v39): a small scroll-story engine.
   Markup: <section class="lx-chap" data-scene="name" data-title="…"> with .lx-stage and .lx-steps > .lx-step[data-s=key] > .lx-card.
   Scenes register with LX.scene(name, {init(g), draw(g, st), act(name, st)}). st = {s: active step key, p: 0–1 progress through
   that step, t: seconds, ctl(name): control value, chap}. Every scene draws in a fixed 800 × 600 box, letterboxed to the stage.
   Controls: <input type=range data-ctl=x>, button groups <div data-ctl=x><button data-v=…>, buttons with data-act=…
   Quizzes: <div class="lx-quiz"><div class="lx-row"><button class="lx-btn" data-ok data-why="…">… */
(function () {
  'use strict';
  var scenes = {}, chaps = [], reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LX = window.LX = { scene: function (n, d) { scenes[n] = d; }, reduce: reduce, _chaps: chaps };
  var VW = 800, VH = 600;
  // ---------- drawing helpers bound to a chapter's canvas ----------
  function G(canvas) {
    var x = canvas.getContext('2d'), g = { x: x, c: canvas, s: 1, ox: 0, oy: 0 };
    g.fit = function () {
      var r = canvas.parentNode.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
      var w = Math.max(10, r.width), h = Math.max(10, Math.min(r.height, innerHeight) * (innerWidth < 860 ? 0.98 : 0.9));
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'; canvas.width = w * dpr; canvas.height = h * dpr;
      g.s = Math.min(w / VW, h / VH) * dpr; g.ox = (w * dpr - VW * g.s) / 2; g.oy = (h * dpr - VH * g.s) / 2;
      g.mf = Math.max(15, 11 / (g.s / dpr)); // at least 11 CSS px on small screens
    };
    g.begin = function () { x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, canvas.width, canvas.height); x.setTransform(g.s, 0, 0, g.s, g.ox, g.oy); x.lineCap = 'round'; x.lineJoin = 'round'; };
    g.col = { ink: '#e9edf6', mut: '#8d98b3', dim: '#2c3650', acc: getComputedStyle(document.body).getPropertyValue('--acc').trim() || '#ff9e8f', red: '#ff6b6b', blue: '#6fa8ff', green: '#5fd39a', gold: '#ffc857', purple: '#b18cff', bg: '#0b1020' };
    g.font = function (sz, w) { x.font = (w || 600) + ' ' + sz + 'px "Bricolage Grotesque", system-ui, sans-serif'; };
    g.text = function (t, X, Y, o) {
      o = o || {}; g.font(Math.max(g.mf || 15, o.size || 20), o.w); x.fillStyle = o.c || g.col.ink; x.globalAlpha = o.a == null ? 1 : o.a;
      x.textAlign = o.al || 'center'; x.textBaseline = o.bl || 'middle'; x.fillText(t, X, Y); x.globalAlpha = 1;
    };
    g.rich = function (t, X, Y, o) { // H_2O and Na^+ style sub/superscripts
      o = o || {}; var sz = Math.max((g.mf || 15) * 0.95, o.size || 20), parts = [], m, re = /([_^])(\{[^}]*\}|[0-9+\-−δ]+)|([^_^]+)/g;
      while ((m = re.exec(t))) parts.push(m[3] ? { t: m[3], k: 0 } : { t: m[2].replace(/[{}]/g, ''), k: m[1] === '_' ? 1 : -1 });
      var W = 0; parts.forEach(function (p) { g.font(p.k ? sz * 0.62 : sz, o.w); p.w = x.measureText(p.t).width; W += p.w; });
      var cx = (o.al === 'left') ? X : (o.al === 'right' ? X - W : X - W / 2);
      x.fillStyle = o.c || g.col.ink; x.globalAlpha = o.a == null ? 1 : o.a; x.textAlign = 'left'; x.textBaseline = 'middle';
      parts.forEach(function (p) { g.font(p.k ? sz * 0.62 : sz, o.w); x.fillText(p.t, cx, Y + (p.k === 1 ? sz * 0.3 : p.k === -1 ? -sz * 0.35 : 0)); cx += p.w; });
      x.globalAlpha = 1; return W;
    };
    g.line = function (a, b, c, d, o) { o = o || {}; x.strokeStyle = o.c || g.col.ink; x.lineWidth = o.w || 3; x.globalAlpha = o.a == null ? 1 : o.a; if (o.dash) x.setLineDash(o.dash); x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); x.setLineDash([]); x.globalAlpha = 1; };
    g.circle = function (X, Y, r, o) { o = o || {}; x.globalAlpha = o.a == null ? 1 : o.a; x.beginPath(); x.arc(X, Y, r, 0, Math.PI * 2); if (o.f) { x.fillStyle = o.f; x.fill(); } if (o.s) { x.strokeStyle = o.s; x.lineWidth = o.w || 2; x.stroke(); } x.globalAlpha = 1; };
    g.atom = function (X, Y, t, col, r, a) { r = r || 22; g.circle(X, Y, r, { f: col || '#2b3760', a: a }); g.circle(X, Y, r, { s: 'rgba(255,255,255,.25)', w: 1.5, a: a }); g.rich(t, X, Y + 1, { size: r * 0.85, w: 700, c: '#fff', a: a }); };
    g.arrow = function (a, b, c, d, o) { o = o || {}; g.line(a, b, c, d, o); var an = Math.atan2(d - b, c - a), L = o.head || 12; x.fillStyle = o.c || g.col.ink; x.globalAlpha = o.a == null ? 1 : o.a; x.beginPath(); x.moveTo(c, d); x.lineTo(c - L * Math.cos(an - 0.4), d - L * Math.sin(an - 0.4)); x.lineTo(c - L * Math.cos(an + 0.4), d - L * Math.sin(an + 0.4)); x.closePath(); x.fill(); x.globalAlpha = 1; };
    g.curly = function (a, b, c, d, bend, o) { // curly arrow from (a,b) to (c,d)
      o = o || {}; var mx = (a + c) / 2 - (d - b) * (bend || 0.4), my = (b + d) / 2 + (c - a) * (bend || 0.4), k = o.k == null ? 1 : o.k;
      x.strokeStyle = o.c || g.col.red; x.lineWidth = o.w || 3; x.globalAlpha = o.a == null ? 1 : o.a; x.beginPath(); x.moveTo(a, b);
      var N = 30, px = a, py = b, pxp = a, pyp = b; for (var i = 1; i <= N * k; i++) { var t = i / N; pxp = px; pyp = py; px = (1 - t) * (1 - t) * a + 2 * (1 - t) * t * mx + t * t * c; py = (1 - t) * (1 - t) * b + 2 * (1 - t) * t * my + t * t * d; x.lineTo(px, py); }
      x.stroke(); if (k >= 1) { var an = Math.atan2(py - pyp, px - pxp), L = 13; x.fillStyle = o.c || g.col.red; x.beginPath(); x.moveTo(px, py); x.lineTo(px - L * Math.cos(an - 0.45), py - L * Math.sin(an - 0.45)); x.lineTo(px - L * Math.cos(an + 0.45), py - L * Math.sin(an + 0.45)); x.closePath(); x.fill(); } x.globalAlpha = 1;
    };
    g.rect = function (X, Y, W, H, o) { o = o || {}; x.globalAlpha = o.a == null ? 1 : o.a; if (o.r) { x.beginPath(); x.roundRect ? x.roundRect(X, Y, W, H, o.r) : x.rect(X, Y, W, H); } else { x.beginPath(); x.rect(X, Y, W, H); } if (o.f) { x.fillStyle = o.f; x.fill(); } if (o.s) { x.strokeStyle = o.s; x.lineWidth = o.w || 2; x.stroke(); } x.globalAlpha = 1; };
    g.path = function (pts, o) { o = o || {}; if (!pts.length) return; x.strokeStyle = o.c || g.col.ink; x.lineWidth = o.w || 2.5; x.globalAlpha = o.a == null ? 1 : o.a; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); if (o.close) x.closePath(); if (o.f) { x.fillStyle = o.f; x.fill(); } x.stroke(); x.globalAlpha = 1; };
    g.lerp = function (a, b, t) { return a + (b - a) * t; };
    g.ease = function (t) { t = Math.max(0, Math.min(1, t)); return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
    g.seg = function (p, a, b) { return g.ease((p - a) / (b - a)); };
    return g;
  }
  LX.G = G;

  function initChap(sec) {
    var name = sec.dataset.scene, def = scenes[name] || {}, stage = sec.querySelector('.lx-stage'), c = stage.querySelector('canvas');
    if (!c && !def.own) { c = document.createElement('canvas'); stage.appendChild(c); }
    var ch = { sec: sec, def: def, g: c ? G(c) : null, steps: Array.prototype.slice.call(sec.querySelectorAll('.lx-step')), s: null, p: 0, vis: false, vals: {}, t0: performance.now() };
    ch.ctl = function (n) {
      if (n in ch.vals) return ch.vals[n];
      var el = sec.querySelector('[data-ctl="' + n + '"]'); if (!el) return null;
      if (el.tagName === 'INPUT') return +el.value;
      var on = el.querySelector('.on'); return on ? on.dataset.v : null;
    };
    sec.querySelectorAll('input[data-ctl]').forEach(function (inp) {
      var out = sec.querySelector('output[for="' + inp.id + '"]');
      var upd = function () { delete ch.vals[inp.dataset.ctl]; if (out) out.textContent = def.fmt && def.fmt[inp.dataset.ctl] ? def.fmt[inp.dataset.ctl](+inp.value) : inp.value; if (def.on) def.on(inp.dataset.ctl, +inp.value, ch); };
      inp.addEventListener('input', upd); upd();
    });
    sec.querySelectorAll('div[data-ctl]').forEach(function (grp) {
      grp.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-v]'); if (!b) return;
        grp.querySelectorAll('button').forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        if (def.on) def.on(grp.dataset.ctl, b.dataset.v, ch);
      });
    });
    sec.querySelectorAll('[data-act]').forEach(function (b) { b.addEventListener('click', function () { if (def.act) def.act(b.dataset.act, ch, b); }); });
    if (def.init) def.init(ch.g, ch);
    if (ch.g) ch.g.fit();
    chaps.push(ch);
    new IntersectionObserver(function (es) { es.forEach(function (e) { ch.vis = e.isIntersecting; }); }, { rootMargin: '100px' }).observe(sec);
  }

  function quizzes() {
    document.querySelectorAll('.lx-quiz').forEach(function (q) {
      var fb = q.querySelector('.lx-fb');
      q.querySelectorAll('.lx-btn').forEach(function (b) {
        b.addEventListener('click', function () {
          if (q.dataset.done) return;
          if (b.hasAttribute('data-ok')) { b.classList.add('right'); q.dataset.done = 1; fb.textContent = '✓ ' + (b.dataset.why || 'Correct!'); }
          else { b.classList.add('wrong'); fb.textContent = b.dataset.why || 'Not quite. Try again.'; }
        });
      });
    });
  }

  function frame(now) {
    var mid = innerHeight * (innerWidth < 860 ? 0.72 : 0.55);
    chaps.forEach(function (ch) {
      var br = ch.sec.getBoundingClientRect(); if (br.bottom < -100 || br.top > innerHeight + 100) return;
      var act = null, p = 0;
      for (var i = 0; i < ch.steps.length; i++) {
        var r = ch.steps[i].getBoundingClientRect();
        if (r.top <= mid) { act = ch.steps[i]; p = Math.max(0, Math.min(1, (mid - r.top) / Math.max(1, r.height))); }
      }
      if (!act) { act = ch.steps[0]; p = 0; }
      if (ch.cur !== act) { ch.steps.forEach(function (s) { s.classList.toggle('on', s === act); }); ch.cur = act; ch.s = act.dataset.s; if (ch.def.enter) ch.def.enter(ch.s, ch); }
      ch.p = reduce ? 1 : p;
      if (ch.def.draw) { try { if (ch.g) ch.g.begin(); ch.def.draw(ch.g, { s: ch.s, p: ch.p, t: (now - ch.t0) / 1000, ctl: ch.ctl, ch: ch }); } catch (e) { if (!ch.err) { ch.err = 1; console.error('Lesson scene ' + ch.sec.dataset.scene + ': ' + (e && e.stack || e)); } } }
    });
    var doc = document.documentElement, pr = doc.scrollTop / Math.max(1, doc.scrollHeight - innerHeight);
    var bar = document.querySelector('.lx-progress'); if (bar) bar.style.width = (pr * 100).toFixed(1) + '%';
    var dots = document.querySelectorAll('.lx-toc a'); if (dots.length) { var k = -1; chaps.forEach(function (c, i) { if (c.sec.getBoundingClientRect().top < innerHeight * 0.5) k = i; }); dots.forEach(function (d, i) { d.classList.toggle('on', i === k); }); }
    requestAnimationFrame(frame);
  }

  function start() {
    document.querySelectorAll('.lx-chap').forEach(initChap);
    quizzes();
    var toc = document.querySelector('.lx-toc');
    if (toc) chaps.forEach(function (c, i) { var a = document.createElement('a'); a.href = '#' + (c.sec.id || (c.sec.id = 'ch' + i)); a.title = c.sec.dataset.title || ''; a.setAttribute('aria-label', c.sec.dataset.title || 'Chapter ' + (i + 1)); toc.appendChild(a); });
    addEventListener('resize', function () { chaps.forEach(function (c) { if (c.g) c.g.fit(); if (c.def.resize) c.def.resize(c); }); });
    requestAnimationFrame(frame);
    try { var k = 'bondline.learn', L = JSON.parse(localStorage.getItem(k) || '{}'); L[location.pathname] = Date.now(); localStorage.setItem(k, JSON.stringify(L)); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
})();
