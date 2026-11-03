// Bondline landing page: scroll and pointer animations. Loaded with `defer`; does nothing for returning users.
(function () {
  'use strict';
  var root = document.documentElement;
  var lp = document.getElementById('landing');
  if (!lp || root.classList.contains('lp-off')) return;

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, r) { return (r || lp).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || lp).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var easeQ = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };
  var ease = function (t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };

  // Keep the app underneath out of reach while the landing page is open.
  var others = Array.prototype.slice.call(document.body.children).filter(function (el) { return el !== lp && el.tagName !== 'SCRIPT'; });
  others.forEach(function (el) { el.setAttribute('inert', ''); });
  function stopKeys(e) { if (!lp.contains(e.target) && e.target !== document.body) return; if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Escape' || e.key === '?' || e.key === '/') e.stopImmediatePropagation(); }
  window.addEventListener('keydown', stopKeys, true);

  // ---------- open the app ----------
  var leaving = false;
  function openApp() {
    if (leaving) return; leaving = true;
    try { localStorage.setItem('bondline.landing', 'seen'); } catch (e) {}
    if (/[?&]about\b/.test(location.search)) { try { history.replaceState(null, '', location.pathname); } catch (e) {} }
    others.forEach(function (el) { el.removeAttribute('inert'); });
    window.removeEventListener('keydown', stopKeys, true);
    var done = function () {
      root.classList.add('lp-off'); running = false;
      var h = document.getElementById('hello');
      if (h && !h.hidden) h.focus({ preventScroll: true });
    };
    if (reduce) { done(); return; }
    lp.classList.add('lp-leave');
    setTimeout(done, 760);
  }
  $$('[data-lp-open]').forEach(function (b) { b.addEventListener('click', openApp); });
  $$('[data-lp-top]').forEach(function (a) { a.addEventListener('click', function (e) { e.preventDefault(); lp.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }); });
  $$('a[href^="#lp-"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var t = document.getElementById(a.getAttribute('href').slice(1)); if (!t) return;
      e.preventDefault(); lp.scrollTo({ top: t.getBoundingClientRect().top + lp.scrollTop - 10, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  // ---------- intro ----------
  var introSeen = false;
  try { introSeen = sessionStorage.getItem('bondline.intro') === '1'; sessionStorage.setItem('bondline.intro', '1'); } catch (e) {}
  if (reduce || introSeen) { $('.lp-intro').style.display = 'none'; lp.classList.add('lp-go'); }
  else setTimeout(function () { lp.classList.add('lp-go'); }, 850);

  // ---------- statement: split into words ----------
  var words = $('.lp-words');
  if (words) {
    words.innerHTML = words.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + w.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</span>'; }).join(' ');
  }
  var wordEls = words ? $$('.w', words) : [];

  // ---------- reveal on scroll + counters ----------
  function count(el) {
    var to = +el.dataset.count, pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce || !to) { el.textContent = pre + to + suf; return; }
    var t0 = performance.now(), dur = 1400;
    (function tick(t) { var k = clamp((t - t0) / dur, 0, 1); el.textContent = pre + Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(tick); })(t0);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in'); io.unobserve(e.target);
        var c = e.target.querySelector('[data-count]'); if (c) count(c);
      });
    }, { root: lp, threshold: .2 });
    $$('.rv, .lp-final').forEach(function (el) { io.observe(el); });
    $$('[data-count]').forEach(function (el) { el.textContent = (el.dataset.prefix || '') + '0' + (el.dataset.suffix || ''); });
  } else $$('.rv').forEach(function (el) { el.classList.add('in'); });

  // ---------- SN2 mechanism, driven by scroll ----------
  var sn = $('.lp-sn2');
  var S = sn && {
    co: $('.sn2-co', sn), cbr: $('.sn2-cbr', sn), h1: $('.sn2-h1', sn), wedge: $('.sn2-wedge', sn), hash: $('.sn2-hash', sn),
    ha: $('.sn2-ha', sn), hb: $('.sn2-hb', sn), hc: $('.sn2-hc', sn), o: $('.sn2-o', sn), br: $('.sn2-br', sn),
    oq: $('.sn2-o .sn2-q', sn), brq: $('.sn2-br .sn2-q', sn), lp: $('.sn2-lp', sn),
    a1: $('.sn2-a1', sn), a2: $('.sn2-a2', sn), ts: $('.sn2-ts', sn), cap: $('.sn2-cap', sn), steps: $$('.lp-steps li')
  };
  function setLine(l, x1, y1, x2, y2) { l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); }
  function pos(g, x, y) { g.setAttribute('transform', 'translate(' + x.toFixed(1) + ' ' + y.toFixed(1) + ')'); }
  var lastStep = -1;
  function drawSN2(p) {
    var a = clamp(p / .2, 0, 1);                  // arrows draw in, then hold
    var m = easeQ(clamp((p - .32) / .58, 0, 1));  // atoms move; 0.5 = transition state
    var s = 1 - 2 * m;                            // umbrella: +1 reactant, -1 product
    var ox = -250 + 160 * (1 - (1 - m) * (1 - m)); // HO comes in
    var bx = 80 + 190 * m * m;                     // Br leaves
    var L = 78;
    // Hydrogens in 3D (x along the axis, a ring of three around it), projected obliquely.
    var hx = -0.34 * L * s, H = [[hx, -L * .94, 0], [hx, L * .47, -L * .82], [hx, L * .47, L * .82]].map(function (v) { return [v[0] + .38 * v[2], v[1] + .16 * v[2]]; });
    var top = H[0], back = H[1], front = H[2];
    setLine(S.h1, 0, 0, top[0], top[1]); pos(S.ha, top[0] * 1.38, top[1] * 1.3);
    setLine(S.hash, 0, 0, back[0] * .82, back[1] * .82); pos(S.hb, back[0] * 1.32, back[1] * 1.3);
    var fx = front[0] * .82, fy = front[1] * .82, nx = -fy, ny = fx, nl = Math.hypot(nx, ny) || 1;
    S.wedge.setAttribute('points', '0,0 ' + (fx + nx / nl * 7).toFixed(1) + ',' + (fy + ny / nl * 7).toFixed(1) + ' ' + (fx - nx / nl * 7).toFixed(1) + ',' + (fy - ny / nl * 7).toFixed(1));
    pos(S.hc, front[0] * 1.3, front[1] * 1.3);
    pos(S.o, ox, 0); pos(S.br, bx, 0);
    // bonds: dashed partial bonds near the transition state
    var ts = clamp(1 - Math.abs(m - .5) * 4, 0, 1);
    setLine(S.co, -21, 0, ox + 21, 0); setLine(S.cbr, 17, 0, bx - 21, 0);
    S.co.style.opacity = m < .25 ? 0 : 1; S.co.style.strokeDasharray = m < .75 ? '7 7' : 'none';
    S.cbr.style.opacity = m > .75 ? 0 : 1; S.cbr.style.strokeDasharray = m > .25 ? '7 7' : 'none';
    S.ts.style.opacity = ts;
    S.oq.style.opacity = m < .25 ? 1 : 0; S.brq.style.opacity = m > .75 ? 1 : 0; S.lp.style.opacity = m < .25 ? 1 : 0;
    // curly arrows, fixed to the reactant positions
    S.a1.setAttribute('d', 'M' + (ox + 4) + ' -34 C' + (ox + 50) + ' -110 ' + (-80) + ' -105 ' + (-28) + ' -26');
    S.a2.setAttribute('d', 'M' + 42 + ' -8 C' + 52 + ' -60 ' + (bx - 30) + ' -70 ' + (bx - 2) + ' -28');
    var fade = 1 - clamp((p - .34) / .1, 0, 1);
    S.a1.style.strokeDashoffset = 1 - a; S.a2.style.strokeDashoffset = 1 - clamp(a * 1.4 - .4, 0, 1);
    S.a1.style.opacity = S.a2.style.opacity = fade;
    S.a1.setAttribute('marker-end', a > .96 ? 'url(#lpHead)' : ''); S.a2.setAttribute('marker-end', a > .96 ? 'url(#lpHead)' : '');
    S.cap.textContent = m < .25 ? 'CH₃Br + HO⁻' : m < .75 ? '[HO···CH₃···Br]⁻ ‡' : 'CH₃OH + Br⁻';
    var st = p < .32 ? 0 : m < .36 ? 1 : m < .7 ? 2 : 3;
    if (st !== lastStep) { S.steps.forEach(function (li, i) { li.classList.toggle('on', i === st); }); lastStep = st; }
  }
  if (sn) {
    sn.insertAdjacentHTML('afterbegin', '<defs><marker id="lpHead" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ff5a5f"/></marker></defs>');
    drawSN2(0);
  }

  // ---------- horizontal features ----------
  var feat = $('.lp-feat'), track = $('.lp-feat-track');
  var horiz = function () { return !reduce && innerWidth > 900; };
  function sizeFeat() {
    if (!feat) return;
    if (horiz()) feat.style.height = (track.scrollWidth - innerWidth + innerHeight * 1.15) + 'px';
    else { feat.style.height = ''; track.style.transform = ''; }
  }

  // ---------- marquee ----------
  var mq = $('.lp-mq-track'), mqX = 0, mqW = 0, vel = 0, dir = 1;
  if (mq) { mq.innerHTML += mq.innerHTML; }
  function sizeMq() { if (mq) mqW = mq.scrollWidth / 2; }

  // ---------- pointer ----------
  var cur = $('.lp-cursor'), curDot = cur && cur.firstElementChild, mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, px = 0, py = 0, moved = false;
  if (fine && !reduce) {
    lp.classList.add('lp-cur');
    lp.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY; if (!moved) { moved = true; cx = mx; cy = my; lp.classList.add('lp-moved'); }
      var t = e.target.closest && e.target.closest('a, button, summary, .lp-card');
      var lbl = t && t.getAttribute('data-cursor');
      cur.classList.toggle('lbl', !!lbl); cur.classList.toggle('big', !!t && !lbl);
      if (lbl) curDot.setAttribute('data-t', lbl);
    });
    lp.addEventListener('pointerleave', function () { cur.style.opacity = 0; });
    lp.addEventListener('pointerenter', function () { cur.style.opacity = ''; });
    // magnetic buttons
    $$('.lp-btn, .lp-big').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); var k = b.classList.contains('lp-big') ? .06 : .25; b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * k).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * k).toFixed(1) + 'px)'; });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    // card tilt
    $$('.lp-card').forEach(function (c) {
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; c.style.transform = 'perspective(900px) rotateY(' + (x * 10).toFixed(2) + 'deg) rotateX(' + (-y * 10).toFixed(2) + 'deg) translateY(-6px)'; });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
  }

  // ---------- main loop ----------
  var hero = $('.lp-hero-in'), mol = $('.lp-mol-r'), bar = $('.lp-progress'), mech = $('.lp-mech');
  var lastY = lp.scrollTop, running = true;
  function frame() {
    if (!running) return;
    var y = lp.scrollTop, vh = innerHeight, dy = y - lastY; lastY = y;
    var max = lp.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(4) + ')';

    if (!reduce) {
      // hero drifts and the molecule turns as you leave it
      var hp = clamp(y / vh, 0, 1.2);
      px = lerp(px, (mx / innerWidth - .5), .06); py = lerp(py, (my / innerHeight - .5), .06);
      if (hp < 1.2) {
        hero.style.transform = 'translate3d(0,' + (hp * -90).toFixed(1) + 'px,0)';
        hero.style.opacity = (1 - hp * .9).toFixed(3);
        mol.style.transform = 'translate(' + (px * -30).toFixed(1) + 'px,' + (py * -30 + hp * 60).toFixed(1) + 'px) rotate(' + (hp * 35 + px * 6).toFixed(2) + 'deg) scale(' + (1 + hp * .15).toFixed(3) + ')';
      }
      // marquee speeds up with scroll and follows its direction
      if (mq && mqW) {
        if (dy) dir = dy > 0 ? 1 : -1;
        vel = lerp(vel, Math.abs(dy), .12);
        mqX -= (1.1 + vel * .35) * dir;
        if (mqX <= -mqW) mqX += mqW; if (mqX > 0) mqX -= mqW;
        mq.style.transform = 'translate3d(' + mqX.toFixed(1) + 'px,0,0)';
      }
      if (fine) { cx = lerp(cx, mx, .2); cy = lerp(cy, my, .2); cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)'; }
    }

    // statement words light up
    if (words) {
      var r = words.getBoundingClientRect();
      var wp = clamp((vh * .85 - r.top) / (r.height + vh * .35), 0, 1), n = Math.round(wp * wordEls.length);
      for (var i = 0; i < wordEls.length; i++) { var on = i < n; if (wordEls[i]._on !== on) { wordEls[i]._on = on; wordEls[i].classList.toggle('on', on); } }
    }
    // mechanism
    if (sn) {
      var mr = mech.getBoundingClientRect(), mp;
      if (innerWidth > 900) mp = clamp(-mr.top / (mr.height - vh), 0, 1);
      else { var sr = sn.getBoundingClientRect(); mp = clamp((vh * .8 - sr.top) / (vh * .75), 0, 1); }
      if (Math.abs(mp - (drawSN2.last || -1)) > .0005) { drawSN2.last = mp; drawSN2(mp); }
    }
    // features slide sideways
    if (feat && horiz()) {
      var fr = feat.getBoundingClientRect(), fp = clamp(-fr.top / (fr.height - vh), 0, 1);
      track.style.transform = 'translate3d(' + (-fp * Math.max(0, track.scrollWidth - innerWidth)).toFixed(1) + 'px,0,0)';
    }
    requestAnimationFrame(frame);
  }

  function resize() { sizeFeat(); sizeMq(); }
  addEventListener('resize', resize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  resize();
  requestAnimationFrame(frame);
})();
