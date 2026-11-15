// Bondline landing page: the scroll-driven 3D story (version 31).
// One persistent three.js scene behind a pinned section. Scroll position drives four chapters:
//   1. atoms fly together into a real molecule (4-hydroxybenzoic acid)
//   2. an SN2 reaction plays in 3D: hydroxide attacks, the carbon inverts like an umbrella, bromide leaves
//   3. a C=O bond vibrates and its IR absorption appears
//   4. a swarm of particles forms the Bondline hexagon
// three.js is loaded only when the section is close. With reduced motion, or without WebGL, the chapters are shown as plain text.
(function () {
  'use strict';
  var lp = document.getElementById('landing'), sec = document.getElementById('lp-3d');
  if (!lp || !sec || document.documentElement.classList.contains('lp-off')) return;
  var pin = sec.querySelector('.lp-3d-pin'), cv = sec.querySelector('.lp-3d-cv');
  var chs = [].slice.call(sec.querySelectorAll('.lp-3d-ch')), dots = [].slice.call(sec.querySelectorAll('.lp-3d-prog i'));
  var ir = sec.querySelector('.lp-3d-ir'), irPath = ir && ir.querySelector('path.t'), irPeak = ir && ir.querySelector('.pk');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function flat() { sec.classList.add('flat'); chs.forEach(function (c) { c.classList.add('on'); }); }
  if (reduce) return flat();
  var gl = null; try { gl = cv.getContext('webgl2') || cv.getContext('webgl'); } catch (e) {}
  if (!gl) return flat();

  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var ease = function (t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var seg = function (p, a, b) { return clamp((p - a) / (b - a), 0, 1); };
  // chapter boundaries, as fractions of the section's scroll length
  var CH = [0, .26, .54, .78, 1];

  function load(cb) {
    if (window.THREE) return cb();
    var s = document.createElement('script'); s.src = 'vendor/three.min.js'; s.onload = cb; s.onerror = flat; document.head.appendChild(s);
  }
  var started = false;
  function maybeStart() {
    if (started) return; var r = sec.getBoundingClientRect();
    if (r.top < innerHeight * 2.5) { started = true; load(init); }
  }
  lp.addEventListener('scroll', maybeStart, { passive: true }); maybeStart();

  function init() {
    var T = window.THREE; if (!T) return flat();
    var renderer;
    try { renderer = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch (e) { return flat(); }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    renderer.outputEncoding = T.sRGBEncoding;
    var scene = new T.Scene(), cam = new T.PerspectiveCamera(38, 1, .1, 200);
    scene.fog = new T.Fog(0x0b0f19, 14, 34);
    scene.add(new T.HemisphereLight(0xdfe8ff, 0x1a1d2b, .75));
    var key = new T.DirectionalLight(0xffffff, 1.1); key.position.set(5, 8, 7); scene.add(key);
    var rim = new T.PointLight(0xff5a5f, 1.6, 30); rim.position.set(-6, -2, -4); scene.add(rim);
    var cool = new T.PointLight(0x5b8cff, 1.2, 30); cool.position.set(6, 3, -5); scene.add(cool);

    // ---------- shared pieces ----------
    var COL = { C: 0x9aa3b5, H: 0xf3f5fa, O: 0xff5a5f, N: 0x5b8cff, Br: 0xc8793a };
    var RAD = { C: .36, H: .22, O: .36, N: .35, Br: .48 };
    var sph = new T.SphereGeometry(1, 32, 24), cyl = new T.CylinderGeometry(1, 1, 1, 16, 1);
    var mats = {};
    function mat(el) { if (!mats[el]) mats[el] = new T.MeshStandardMaterial({ color: COL[el], roughness: .35, metalness: .08, transparent: true }); return mats[el]; }
    var bondMat = new T.MeshStandardMaterial({ color: 0xc9d1e2, roughness: .5, metalness: .05, transparent: true });
    function atom(el, parent) { var m = new T.Mesh(sph, mat(el).clone()); m.scale.setScalar(RAD[el]); m.userData.el = el; parent.add(m); return m; }
    var UP = new T.Vector3(0, 1, 0), tmp = new T.Vector3();
    function bond(parent) { var m = new T.Mesh(cyl, bondMat.clone()); parent.add(m); return m; }
    // place a cylinder between two points, with radius r and fraction f of its full length drawn from the a end
    function setBond(m, a, b, r, f) {
      f = f == null ? 1 : f; tmp.subVectors(b, a); var len = tmp.length();
      if (len < 1e-4 || f <= 0.001) { m.visible = false; return; }
      m.visible = true; m.scale.set(r, len * f, r);
      m.position.copy(a).addScaledVector(tmp, f / 2);
      m.quaternion.setFromUnitVectors(UP, tmp.normalize());
    }
    function rnd(seed) { var x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); }

    // ---------- chapter 1: 4-hydroxybenzoic acid assembles ----------
    var g1 = new T.Group(); scene.add(g1);
    var M1 = [], B1 = [];
    (function () {
      var R = 1.4, i, pts = [];
      for (i = 0; i < 6; i++) { var a = Math.PI / 2 + i * Math.PI / 3; pts.push(['C', R * Math.cos(a), R * Math.sin(a), 0]); }
      // ring C0 at top carries COOH; C3 at bottom carries OH; the others carry H
      var out = function (k, d) { var a = Math.PI / 2 + k * Math.PI / 3; return [(R + d) * Math.cos(a), (R + d) * Math.sin(a), 0]; };
      var cA = out(0, 1.48); pts.push(['C'].concat(cA));                       // 6 carboxyl C
      pts.push(['O', cA[0] - 1.05, cA[1] + .72, 0]);                            // 7 C=O
      pts.push(['O', cA[0] + 1.05, cA[1] + .72, 0]);                            // 8 O–H
      pts.push(['H', cA[0] + 1.85, cA[1] + .25, 0]);                            // 9
      var oP = out(3, 1.36); pts.push(['O'].concat(oP));                        // 10 phenol O
      pts.push(['H', oP[0] + .8, oP[1] - .55, 0]);                              // 11
      [1, 2, 4, 5].forEach(function (k) { pts.push(['H'].concat(out(k, 1.08))); }); // 12–15
      pts.forEach(function (p, k) {
        var m = atom(p[0], g1); m.userData.to = new T.Vector3(p[1], p[2] - .35, p[3]);
        var th = rnd(k + 1) * Math.PI * 2, ph = rnd(k + 7) * Math.PI - Math.PI / 2, d = 9 + rnd(k + 3) * 7;
        m.userData.from = new T.Vector3(d * Math.cos(th) * Math.cos(ph), d * Math.sin(ph), d * Math.sin(th) * Math.cos(ph) - 4);
        M1.push(m);
      });
      var pairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [6, 7], [6, 8], [8, 9], [3, 10], [10, 11], [1, 12], [2, 13], [4, 14], [5, 15]];
      var dbl = { '0,1': 1, '2,3': 1, '4,5': 1, '6,7': 1 };
      pairs.forEach(function (pq) { B1.push({ a: pq[0], b: pq[1], m: bond(g1), d: dbl[pq.join(',')] ? bond(g1) : null }); });
    })();
    function drawCh1(t, spin) {
      M1.forEach(function (m, k) { var s = ease(seg(t, k * .012, .55 + k * .012)); m.position.lerpVectors(m.userData.from, m.userData.to, s); m.material.opacity = Math.min(1, s * 3); });
      var bf = ease(seg(t, .5, .85)), off = new T.Vector3(0, 0, .09);
      B1.forEach(function (b) {
        var A = M1[b.a].position, Bp = M1[b.b].position;
        if (b.d) {
          // a double bond: two thinner rods, side by side
          var side = new T.Vector3().subVectors(Bp, A).cross(new T.Vector3(0, 0, 1)).normalize().multiplyScalar(.09);
          setBond(b.m, A.clone().add(side), Bp.clone().add(side), .055, bf); setBond(b.d, A.clone().sub(side), Bp.clone().sub(side), .055, bf);
          b.d.material.opacity = bf;
        } else setBond(b.m, A, Bp, .085, bf);
        b.m.material.opacity = bf;
      });
      g1.rotation.set(-.15 + spin * .25, -.55 + spin * 1.1, .05);
    }

    // ---------- chapter 2: SN2, HO⁻ + CH₃Br → CH₃OH + Br⁻ ----------
    var g2 = new T.Group(); scene.add(g2);
    var C2 = atom('C', g2), Br = atom('Br', g2), O2 = atom('O', g2), HO = atom('H', g2), Hs = [atom('H', g2), atom('H', g2), atom('H', g2)];
    var bCBr = bond(g2), bCO = bond(g2), bOH = bond(g2), bCH = Hs.map(function () { return bond(g2); });
    var halo = new T.Mesh(sph, new T.MeshBasicMaterial({ color: 0xff5a5f, transparent: true, opacity: .0, depthWrite: false })); g2.add(halo);
    var haloBr = new T.Mesh(sph, new T.MeshBasicMaterial({ color: 0xc8793a, transparent: true, opacity: .0, depthWrite: false })); g2.add(haloBr);
    // dashed "partial bond" look for the transition state: a ring of small beads along each forming/breaking bond
    var beads = []; for (var bi = 0; bi < 14; bi++) { var bd = new T.Mesh(sph, new T.MeshBasicMaterial({ color: 0xffd0a8, transparent: true, opacity: 0 })); bd.scale.setScalar(.05); g2.add(bd); beads.push(bd); }
    function drawCh2(t, spin) {
      var at = ease(seg(t, .0, .42)), inv = ease(seg(t, .3, .7)), lv = ease(seg(t, .55, 1));
      var c = new T.Vector3(0, 0, 0);
      var ox = lerp(-7, -1.43, at), brx = lerp(1.94, 7.5, lv);
      O2.position.set(ox, 0, 0); HO.position.set(ox - .96, .0, 0); Br.position.set(brx, 0, 0);
      var hx = lerp(-.36, .36, inv), r = 1.03 * Math.sqrt(1 - (hx * hx) / (1.09 * 1.09));
      Hs.forEach(function (h, k) { var a = k * 2 * Math.PI / 3 + .4; h.position.set(hx, r * Math.cos(a), r * Math.sin(a)); setBond(bCH[k], c, h.position, .075, 1); });
      C2.position.copy(c);
      var forming = clamp((at - .82) / .18, 0, 1), breaking = 1 - clamp((brx - 2.2) / 1.6, 0, 1);
      setBond(bCO, c, O2.position, .085, inv > .55 ? 1 : 0); bCO.material.opacity = clamp((inv - .55) / .2, 0, 1);
      setBond(bCBr, c, Br.position, .085, inv < .5 ? 1 : 0); bCBr.material.opacity = 1 - clamp((inv - .3) / .2, 0, 1);
      setBond(bOH, O2.position, HO.position, .075, 1);
      // transition state beads (dashed partial bonds) around the middle of the inversion
      var ts = Math.sin(Math.PI * clamp((inv - .15) / .7, 0, 1));
      beads.forEach(function (b, k) { var on = k < 7, f = (k % 7 + 1) / 8; var A = on ? O2.position : Br.position; b.position.lerpVectors(c, A, f); b.material.opacity = ts * .9 * (on ? forming || at : breaking); });
      halo.position.copy(O2.position); halo.scale.setScalar(.75 + .08 * Math.sin(spin * 40)); halo.material.opacity = .22 * (1 - inv);
      haloBr.position.copy(Br.position); haloBr.scale.setScalar(.9); haloBr.material.opacity = .25 * lv;
      g2.rotation.set(.35, -.5 + spin * 1.6, 0);
    }

    // ---------- chapter 3: propanone, the C=O stretch ----------
    var g3 = new T.Group(); scene.add(g3);
    var cC = atom('C', g3), oC = atom('O', g3), cM = [atom('C', g3), atom('C', g3)], hM = [];
    for (var hi = 0; hi < 6; hi++) hM.push(atom('H', g3));
    var b3 = { co1: bond(g3), co2: bond(g3), cm: [bond(g3), bond(g3)], ch: hM.map(function () { return bond(g3); }) };
    var glow = new T.PointLight(0xff5a5f, 0, 6); g3.add(glow);
    function drawCh3(t, time) {
      var amp = .12 * ease(seg(t, .05, .4)), w = Math.sin(time * 14) * amp;
      cC.position.set(0, -w * .35, 0); oC.position.set(0, 1.22 + w, 0);
      cM[0].position.set(-1.3, -.75, 0); cM[1].position.set(1.3, -.75, 0);
      var side = new T.Vector3(.09, 0, 0);
      setBond(b3.co1, cC.position.clone().add(side), oC.position.clone().add(side), .055, 1); setBond(b3.co2, cC.position.clone().sub(side), oC.position.clone().sub(side), .055, 1);
      cM.forEach(function (m, k) { setBond(b3.cm[k], cC.position, m.position, .085, 1); });
      hM.forEach(function (h, k) { var m = cM[k < 3 ? 0 : 1], j = k % 3, a = j * 2 * Math.PI / 3, sx = k < 3 ? -1 : 1;
        h.position.set(m.position.x + sx * .36, m.position.y - .35 + .95 * Math.cos(a) * .55, .95 * Math.sin(a)); setBond(b3.ch[k], m.position, h.position, .06, 1); });
      b3.co1.material.color.setHex(amp > .02 ? 0xff8a7a : 0xc9d1e2); b3.co2.material.color.copy(b3.co1.material.color);
      glow.position.set(0, .6, .6); glow.intensity = 3 * amp / .12;
      g3.rotation.set(.2, -.6 + t * 1.2, 0);
    }

    // ---------- chapter 4: a swarm becomes the Bondline hexagon ----------
    var N = 900, pos = new Float32Array(N * 3), from = [], to = [], cols = new Float32Array(N * 3);
    (function () {
      var hex = [], k, i;
      for (k = 0; k < 6; k++) { var a = Math.PI / 2 + k * Math.PI / 3; hex.push([3.2 * Math.cos(a), 3.2 * Math.sin(a)]); }
      for (i = 0; i < N; i++) {
        var th = rnd(i + 11) * Math.PI * 2, ph = Math.acos(2 * rnd(i + 29) - 1), d = 6 + rnd(i + 5) * 12;
        from.push([d * Math.sin(ph) * Math.cos(th), d * Math.cos(ph), d * Math.sin(ph) * Math.sin(th)]);
        var x, y, z = (rnd(i + 3) - .5) * .25, arrow = i > N * .78;
        if (!arrow) { var e = Math.floor(rnd(i + 17) * 6), f = rnd(i + 23), A = hex[e], B = hex[(e + 1) % 6]; x = lerp(A[0], B[0], f); y = lerp(A[1], B[1], f); x += (rnd(i + 31) - .5) * .12; y += (rnd(i + 37) - .5) * .12; }
        else { var u = rnd(i + 41); var ax = -1.4, ay = -.6, cx = 0, cy = 1.9, bx = 1.5, by = .3;
          if (u < .85) { var v = u / .85; x = (1 - v) * (1 - v) * ax + 2 * (1 - v) * v * cx + v * v * bx; y = (1 - v) * (1 - v) * ay + 2 * (1 - v) * v * cy + v * v * by; }
          else { var w2 = (u - .85) / .15; x = bx - w2 * .55 * (rnd(i) > .5 ? 1 : .3); y = by + w2 * (rnd(i) > .5 ? .45 : -.25); } }
        to.push([x, y, z]);
        var coral = arrow || rnd(i + 51) < .12, c = new T.Color(coral ? 0xff5a5f : rnd(i + 61) < .5 ? 0xdfe6f5 : 0x7fa2ff);
        cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
      }
    })();
    var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pos, 3)); pg.setAttribute('color', new T.BufferAttribute(cols, 3));
    var pts = new T.Points(pg, new T.PointsMaterial({ size: .075, vertexColors: true, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true }));
    scene.add(pts);
    function drawCh4(t, time) {
      var s = ease(seg(t, .05, .75));
      for (var i = 0; i < N; i++) { var F = from[i], Tt = to[i], wob = (1 - s) * .3 * Math.sin(time * 1.3 + i); pos[i * 3] = lerp(F[0], Tt[0], s) + wob; pos[i * 3 + 1] = lerp(F[1], Tt[1], s); pos[i * 3 + 2] = lerp(F[2], Tt[2], s); }
      pg.attributes.position.needsUpdate = true;
      pts.rotation.set(0, (1 - s) * 1.4 + Math.sin(time * .4) * .08 * s, 0);
    }

    // dust in the background for depth, visible throughout
    var dN = 260, dp = new Float32Array(dN * 3);
    for (var di = 0; di < dN; di++) { dp[di * 3] = (rnd(di + 101) - .5) * 40; dp[di * 3 + 1] = (rnd(di + 203) - .5) * 24; dp[di * 3 + 2] = -6 - rnd(di + 307) * 20; }
    var dg = new T.BufferGeometry(); dg.setAttribute('position', new T.BufferAttribute(dp, 3));
    var dust = new T.Points(dg, new T.PointsMaterial({ color: 0x8aa0d6, size: .05, transparent: true, opacity: .45, depthWrite: false })); scene.add(dust);

    // ---------- sizing ----------
    function size() {
      var w = pin.clientWidth, h = pin.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h;
      cam.fov = w < 700 ? 52 : 38; cam.updateProjectionMatrix();
    }
    addEventListener('resize', size); size();

    // ---------- loop ----------
    var t0 = performance.now(), lastCh = -1, visible = true;
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { root: lp }).observe(sec);
    function frame(now) {
      if (document.documentElement.classList.contains('lp-off')) { renderer.dispose(); return; }
      requestAnimationFrame(frame);
      if (!visible) return;
      var time = (now - t0) / 1000;
      var r = sec.getBoundingClientRect(), p = clamp(-r.top / Math.max(1, r.height - innerHeight), 0, 1);
      var ch = p < CH[1] ? 0 : p < CH[2] ? 1 : p < CH[3] ? 2 : 3;
      if (ch !== lastCh) { chs.forEach(function (c, i) { c.classList.toggle('on', i === ch); }); dots.forEach(function (d, i) { d.classList.toggle('on', i <= ch); }); lastCh = ch; sec.dataset.ch = ch; }
      var l = [seg(p, CH[0], CH[1]), seg(p, CH[1], CH[2]), seg(p, CH[2], CH[3]), seg(p, CH[3], CH[4])];
      // each chapter fades in at its start and out at its end, so neighbouring chapters cross-fade
      var vis = function (i) { var a = CH[i], b = CH[i + 1], w = .035; return clamp((p - a + w) / w, 0, 1) * clamp((b + w - p) / w, 0, 1); };
      var v = [vis(0), vis(1), vis(2), vis(3)];
      g1.visible = v[0] > .01; if (g1.visible) { reset(g1); drawCh1(l[0], l[0]); scaleFade(g1, v[0]); }
      g2.visible = v[1] > .01; if (g2.visible) { reset(g2); drawCh2(l[1], time * .02 + l[1]); scaleFade(g2, v[1]); }
      g3.visible = v[2] > .01; if (g3.visible) { reset(g3); drawCh3(l[2], time); scaleFade(g3, v[2]); }
      pts.visible = v[3] > .01; if (pts.visible) { drawCh4(l[3], time); pts.material.opacity = v[3] * .95; }
      // camera glides between chapter set-ups
      var mob = innerWidth <= 900, camZ = [15, 12.5, 10.5, 14][ch] * (mob ? 1.25 : 1), camY = [0, .6, .4, 0][ch];
      cam.position.x = lerp(cam.position.x, Math.sin(time * .15) * .6 + (innerWidth > 900 ? -2.2 : 0), .05);
      cam.position.y = lerp(cam.position.y, camY + (innerWidth > 900 ? 0 : -1.6), .06);
      cam.position.z = lerp(cam.position.z, camZ, .06);
      cam.lookAt(innerWidth > 900 ? -2.2 : 0, innerWidth > 900 ? 0 : -1.2, 0);
      dust.rotation.y = time * .01 + p * .6;
      if (ir) { var k = ch === 2 ? ease(seg(l[2], .25, .8)) : 0; ir.style.opacity = ch === 2 ? Math.min(1, l[2] * 4) * v[2] : 0; if (irPath) irPath.style.strokeDashoffset = (1 - k).toFixed(3); if (irPeak) irPeak.style.opacity = k > .55 ? 1 : 0; }
      renderer.render(scene, cam);
    }
    // Each frame: every material starts opaque, the chapter sets its own fades, then the whole group is faded for the cross-fade.
    function reset(g) { g.children.forEach(function (c) { if (c.material && c.material.type !== 'MeshBasicMaterial') c.material.opacity = 1; }); }
    function scaleFade(g, o) { g.scale.setScalar(.85 + .15 * o); g.children.forEach(function (c) { if (c.material) c.material.opacity = Math.min(c.material.opacity, o); }); }
    requestAnimationFrame(frame);
    sec.classList.add('live');
  }
})();
