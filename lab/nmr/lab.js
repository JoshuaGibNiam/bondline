/* Bondline virtual NMR lab (v39). A 3D spectrometer you operate step by step:
   choose a sample, put the tube in the magnet, switch on, lock and shim, acquire the FID, Fourier transform it, then read the spectrum.
   Uses /vendor/three.min.js (r128). Sample data is in data.js (window.NMR_DATA). Spectra are simulated from first-order coupling rules. */
(function () {
  'use strict';
  var D = window.NMR_DATA, T = window.THREE;
  var $ = function (s) { return document.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(document.querySelectorAll(s)); };
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------------- state ----------------
  var S = { step: 0, sample: null, inMagnet: false, power: false, shim: 0, locked: false, fid: null, spec: false, nuc: 'H', scans: 8, mystery: false, myst: [], busy: false };
  var STEPS = ['Choose a sample', 'Put it in the magnet', 'Switch on the spectrometer', 'Lock and shim', 'Acquire the FID', 'Fourier transform', 'Read the spectrum'];
  function setStep(n) {
    S.step = n;
    $$('.nl-steps li').forEach(function (li, i) { li.className = i < n ? 'done' : (i === n ? 'on' : ''); });
    var hints = ['Click a coloured tube in the rack (or pick a sample on the right).', 'Click the top of the magnet to lower the tube in on its air cushion.', 'Press the red power button on the console.',
      'Turn Z1 and Z2 until the lock signal is as high as it goes (or press Auto-shim).', 'Choose ¹H or ¹³C, then press Acquire.', 'The FID is a mix of frequencies. Press Fourier transform to split it into a spectrum.',
      'Click a peak to see which hydrogens make it and why it is split.'];
    $('.nl-hint').textContent = (hints[n] || '').replace('on the right', innerWidth < 860 ? 'below' : 'on the right');
    $('#bIns').disabled = !(S.sample && !S.inMagnet && !S.busy);
    $('#bPow').disabled = !(S.inMagnet && !S.power && !S.busy);
    $('#bAuto').disabled = !(S.power && !S.busy);
    $('#bAcq').disabled = !(S.power && S.shim >= 0.85 && !S.busy);
    $('#bFT').disabled = !(S.fid && !S.spec && !S.busy);
    $('#bEj').disabled = !(S.inMagnet && !S.busy);
    $('.nl-shim').classList.toggle('show', S.power);
  }
  function log(t) { var el = $('.nl-log'); el.textContent += t + '\n'; el.scrollTop = 1e6; }

  // ---------------- sample list ----------------
  var COL = ['#d33f49', '#1f5fd1', '#1f8a5b', '#c27a12', '#7b4fc9', '#0e9fb3', '#e26d1b', '#6c7a91', '#b83280', '#3f8f2f'];
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function listSamples() {
    var box = $('.nl-samples'); box.innerHTML = '';
    var L = S.mystery ? S.myst : D;
    L.forEach(function (m, i) {
      var b = document.createElement('button');
      b.innerHTML = S.mystery ? 'Unknown ' + 'ABCD'[i] + '<small>' + m.f + '</small>' : m.name + '<small>' + m.f + '</small>';
      b.addEventListener('click', function () { choose(m, i); });
      if (S.sample === m) b.className = 'on';
      box.appendChild(b);
    });
  }
  $('#mystery').addEventListener('change', function (e) {
    if (S.busy) { e.target.checked = S.mystery; return; }
    S.mystery = e.target.checked; S.myst = shuffle(D).slice(0, 4);
    resetAll(); buildRack(); listSamples();
  });

  // ---------------- 3D scene ----------------
  var wrap = $('.nl-scene'), canvas = $('#cv');
  var R;
  try { R = new T.WebGLRenderer({ canvas: canvas, antialias: true }); }
  catch (e) { wrap.innerHTML = '<p style="padding:80px 24px;text-align:center;color:#aeb9d3">This lab needs 3D graphics (WebGL), which this browser has turned off. Try another browser, or use the <a href="/learn/spectroscopy/">spectroscopy lesson</a>.</p>'; return; }
  R.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  R.outputEncoding = T.sRGBEncoding; R.shadowMap.enabled = true; R.shadowMap.type = T.PCFSoftShadowMap;
  var scene = new T.Scene(); scene.background = new T.Color(0x0b1020); scene.fog = new T.Fog(0x0b1020, 9, 20);
  var cam = new T.PerspectiveCamera(42, 1, 0.05, 60);
  var target = new T.Vector3(0.05, 1.15, 0.5), orb = { th: 0.18, ph: 1.16, r: 6.9 };
  function placeCam() { cam.position.set(target.x + orb.r * Math.sin(orb.ph) * Math.sin(orb.th), target.y + orb.r * Math.cos(orb.ph), target.z + orb.r * Math.sin(orb.ph) * Math.cos(orb.th)); cam.lookAt(target); }
  scene.add(new T.HemisphereLight(0xdfe8ff, 0x1a2030, 0.75));
  var key = new T.DirectionalLight(0xffffff, 0.9); key.position.set(3, 6, 4); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4; scene.add(key);
  var rim = new T.PointLight(0xff9e8f, 0.5, 12); rim.position.set(-3, 3, -2); scene.add(rim);
  var mat = function (c, o) { return new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.45, metalness: 0.1 }, o || {})); };
  function mesh(g, m, x, y, z, parent) { var o = new T.Mesh(g, m); o.position.set(x || 0, y || 0, z || 0); o.castShadow = true; o.receiveShadow = true; (parent || scene).add(o); return o; }

  // floor + grid
  var floor = mesh(new T.CircleGeometry(12, 64), mat(0x141b34, { roughness: 0.95 }), 0, 0, 0); floor.rotation.x = -Math.PI / 2; floor.castShadow = false;
  var grid = new T.GridHelper(16, 32, 0x24305a, 0x1a2244); grid.position.y = 0.002; scene.add(grid);

  // the magnet
  var magnet = new T.Group(); scene.add(magnet);
  var white = mat(0xeef1f6, { roughness: 0.32, metalness: 0.25 });
  mesh(new T.CylinderGeometry(0.92, 0.92, 1.9, 64), white, 0, 1.25, 0, magnet);
  mesh(new T.CylinderGeometry(0.95, 0.95, 0.08, 64), mat(0xb8c0d0, { metalness: 0.6 }), 0, 2.2, 0, magnet);
  mesh(new T.CylinderGeometry(0.95, 0.95, 0.08, 64), mat(0xb8c0d0, { metalness: 0.6 }), 0, 0.3, 0, magnet);
  var band = mesh(new T.TorusGeometry(0.93, 0.03, 12, 64), mat(0x1f5fd1, { emissive: 0x0, metalness: 0.3 }), 0, 1.5, 0, magnet); band.rotation.x = Math.PI / 2;
  mesh(new T.CylinderGeometry(0.2, 0.24, 0.55, 32), white, 0, 2.5, 0, magnet);
  var boreTop = mesh(new T.CylinderGeometry(0.09, 0.09, 0.05, 32), mat(0x2a3350, { metalness: 0.7 }), 0, 2.79, 0, magnet);
  mesh(new T.CylinderGeometry(0.045, 0.045, 0.06, 24), mat(0x05070d), 0, 2.81, 0, magnet);
  for (var i = 0; i < 3; i++) { var a = i * Math.PI * 2 / 3 + 0.4; mesh(new T.CylinderGeometry(0.05, 0.06, 0.3, 12), mat(0x7f8aa3, { metalness: 0.6 }), Math.cos(a) * 0.7, 0.15, Math.sin(a) * 0.7, magnet); }
  // helium ports on top
  [[0.45, 0.25], [-0.4, 0.35], [0.1, -0.55]].forEach(function (p) { mesh(new T.CylinderGeometry(0.04, 0.04, 0.22, 12), mat(0xb8c0d0, { metalness: 0.7 }), p[0], 2.34, p[1], magnet); });
  function label(text, w, h, size, col, bg) {
    var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d');
    if (bg) { x.fillStyle = bg; x.fillRect(0, 0, w, h); }
    x.fillStyle = col || '#121a24'; x.font = '700 ' + size + 'px "Bricolage Grotesque", system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2, h / 2);
    var t = new T.CanvasTexture(c); t.encoding = T.sRGBEncoding; t.anisotropy = 4; return t;
  }
  var tag = mesh(new T.PlaneGeometry(0.8, 0.2), new T.MeshBasicMaterial({ map: label('BONDLINE 400 MHz', 512, 128, 54, '#1f5fd1'), transparent: true }), 0, 1.85, 0.925, magnet); tag.castShadow = false;
  // hotspot over the bore
  var boreHot = mesh(new T.SphereGeometry(0.22, 16, 12), new T.MeshBasicMaterial({ color: 0xff9e8f, transparent: true, opacity: 0 }), 0, 2.86, 0); boreHot.userData.act = 'insert'; boreHot.castShadow = false;
  var rf = mesh(new T.TorusGeometry(0.98, 0.045, 12, 64), new T.MeshBasicMaterial({ color: 0xff9e8f, transparent: true, opacity: 0 }), 0, 1.25, 0); rf.rotation.x = Math.PI / 2; rf.castShadow = false;

  // console desk
  var desk = new T.Group(); desk.position.set(1.95, 0, 1.0); desk.rotation.y = -0.45; scene.add(desk);
  var dk = mat(0x2a3350, { roughness: 0.6 });
  mesh(new T.BoxGeometry(1.5, 0.06, 0.75), mat(0xd9dee8, { roughness: 0.5 }), 0, 0.78, 0, desk);
  [[-0.68, -0.32], [0.68, -0.32], [-0.68, 0.32], [0.68, 0.32]].forEach(function (p) { mesh(new T.BoxGeometry(0.05, 0.78, 0.05), dk, p[0], 0.39, p[1], desk); });
  mesh(new T.BoxGeometry(0.06, 0.32, 0.06), dk, 0, 0.97, -0.25, desk);
  var mon = mesh(new T.BoxGeometry(1.02, 0.62, 0.05), mat(0x111522, { roughness: 0.4 }), 0, 1.35, -0.25, desk);
  var scr = document.createElement('canvas'); scr.width = 768; scr.height = 448; var sx = scr.getContext('2d');
  var scrTex = new T.CanvasTexture(scr); scrTex.encoding = T.sRGBEncoding;
  var screen = mesh(new T.PlaneGeometry(0.96, 0.56), new T.MeshBasicMaterial({ map: scrTex }), 0, 1.35, -0.223, desk); screen.castShadow = false;
  mesh(new T.BoxGeometry(0.6, 0.025, 0.2), mat(0x1b2033), 0, 0.825, 0.1, desk);
  var btn = mesh(new T.CylinderGeometry(0.06, 0.06, 0.04, 24), mat(0xd33f49, { emissive: 0x330000 }), 0.55, 0.83, 0.15, desk); btn.userData.act = 'power';
  var led = mesh(new T.SphereGeometry(0.02, 12, 8), new T.MeshBasicMaterial({ color: 0x552222 }), 0.55, 0.83, 0.03, desk);
  var btnHot = mesh(new T.SphereGeometry(0.14, 12, 8), new T.MeshBasicMaterial({ visible: false }), 0.55, 0.86, 0.12, desk); btnHot.userData.act = 'power';

  // sample rack
  var rackG = new T.Group(); rackG.position.set(-1.75, 0, 1.15); rackG.rotation.y = 0.42; scene.add(rackG);
  mesh(new T.BoxGeometry(1.1, 0.05, 0.5), mat(0xd9dee8), 0, 0.72, 0, rackG);
  [[-0.5, -0.2], [0.5, -0.2], [-0.5, 0.2], [0.5, 0.2]].forEach(function (p) { mesh(new T.BoxGeometry(0.04, 0.72, 0.04), dk, p[0], 0.36, p[1], rackG); });
  mesh(new T.BoxGeometry(1.0, 0.1, 0.14), mat(0x1f5fd1), 0, 0.8, 0, rackG);
  var tubes = [];
  function makeTube(col) {
    var g = new T.Group();
    var glass = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 0.42, 16), new T.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.35, roughness: 0.05, metalness: 0, clearcoat: 1 }));
    glass.position.y = 0.21; g.add(glass);
    var liq = new T.Mesh(new T.CylinderGeometry(0.019, 0.019, 0.1, 16), new T.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.25, roughness: 0.3 }));
    liq.position.y = 0.055; g.add(liq);
    var cap = new T.Mesh(new T.CylinderGeometry(0.026, 0.026, 0.05, 16), mat(0xf4f6fb)); cap.position.y = 0.44; g.add(cap);
    var spin = new T.Mesh(new T.CylinderGeometry(0.05, 0.035, 0.08, 20), mat(0x2b3350, { metalness: 0.4 })); spin.position.y = 0.3; spin.visible = false; g.add(spin);
    g.userData.spinner = spin;
    var hot = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.5, 8), new T.MeshBasicMaterial({ visible: false })); hot.position.y = 0.22; g.add(hot);
    return { g: g, hot: hot };
  }
  function buildRack() {
    tubes.forEach(function (t) { t.g.parent && t.g.parent.remove(t.g); }); tubes = [];
    var L = S.mystery ? S.myst : D;
    L.forEach(function (m, i) {
      var t = makeTube(new T.Color(S.mystery ? ['#d33f49', '#1f5fd1', '#1f8a5b', '#c27a12'][i] : COL[i]));
      var n = L.length, x = (i - (n - 1) / 2) * (0.9 / Math.max(n - 1, 1));
      t.home = new T.Vector3(x, 0.82, 0); t.g.position.copy(t.home); rackG.add(t.g);
      t.hot.userData.act = 'tube'; t.hot.userData.i = i; t.m = m; tubes.push(t);
      var lb = new T.Mesh(new T.PlaneGeometry(0.09, 0.05), new T.MeshBasicMaterial({ map: label(S.mystery ? 'ABCD'[i] : String(i + 1), 64, 36, 30, '#fff'), transparent: true }));
      lb.position.set(x, 0.8, 0.075); rackG.add(lb); t.lb = lb;
    });
  }

  // ---------------- tweens ----------------
  var tweens = [];
  function tween(d, fn, done) { tweens.push({ t0: performance.now(), d: reduce ? 1 : d, fn: fn, done: done }); }
  var ease = function (t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };

  // ---------------- actions ----------------
  function tubeOf(m) { for (var i = 0; i < tubes.length; i++) if (tubes[i].m === m) return tubes[i]; return null; }
  function choose(m) {
    if (S.busy || S.inMagnet) { if (S.inMagnet) flash('Eject the current sample first.'); return; }
    var prev = S.sample && tubeOf(S.sample); if (prev) lift(prev, false);
    S.sample = m; S.spec = false; S.fid = null; lift(tubeOf(m), true);
    log('Sample: ' + (S.mystery ? 'unknown ' + 'ABCD'[S.myst.indexOf(m)] : m.name) + ' in CDCl₃');
    listSamples(); setStep(1); drawScreen();
  }
  function lift(t, up) { var y0 = t.g.position.y, y1 = up ? t.home.y + 0.16 : t.home.y; tween(300, function (k) { t.g.position.y = y0 + (y1 - y0) * ease(k); }); }
  function insert() {
    if (!S.sample || S.inMagnet || S.busy) return;
    var t = tubeOf(S.sample); S.busy = true; setStep(1);
    var w0 = new T.Vector3(); t.g.getWorldPosition(w0);
    rackG.remove(t.g); scene.add(t.g); t.g.position.copy(w0); t.g.rotation.set(0, 0, 0);
    var p1 = new T.Vector3(w0.x, 3.25, w0.z), p2 = new T.Vector3(0, 3.25, 0), p3 = new T.Vector3(0, 2.74, 0), p4 = new T.Vector3(0, 1.4, 0);
    t.g.userData.spinner.visible = true;
    tween(500, function (k) { t.g.position.lerpVectors(w0, p1, ease(k)); }, function () {
      tween(900, function (k) { t.g.position.lerpVectors(p1, p2, ease(k)); }, function () {
        tween(500, function (k) { t.g.position.lerpVectors(p2, p3, ease(k)); }, function () {
          log('Air lift off: the sample floats down into the probe…');
          tween(1800, function (k) { t.g.position.lerpVectors(p3, p4, ease(k)); t.g.rotation.y += 0.25; }, function () {
            t.g.visible = false; S.inMagnet = true; S.busy = false; log('Sample is in the probe at the centre of the magnet (9.4 T). Spinning at 20 Hz.'); setStep(S.power ? 3 : 2); drawScreen();
          });
        });
      });
    });
  }
  function eject() {
    if (!S.inMagnet || S.busy) return;
    var t = tubeOf(S.sample); S.busy = true; t.g.visible = true;
    var p4 = new T.Vector3(0, 1.4, 0), p3 = new T.Vector3(0, 3.0, 0);
    tween(1200, function (k) { t.g.position.lerpVectors(p4, p3, ease(k)); }, function () {
      var w1 = new T.Vector3(); rackG.localToWorld(w1.copy(t.home));
      var from = t.g.position.clone();
      tween(1100, function (k) { t.g.position.lerpVectors(from, w1, ease(k)); t.g.position.y += Math.sin(k * Math.PI) * 0.4; }, function () {
        scene.remove(t.g); rackG.add(t.g); t.g.position.copy(t.home); t.g.userData.spinner.visible = false;
        S.inMagnet = false; S.busy = false; S.fid = null; S.spec = false; S.sample = null; S.shim = S.power ? 0.35 : 0; S.locked = false;
        $('.nl-spec').classList.remove('show'); $('.nl-guess').hidden = true; listSamples(); setStep(0); updShim(); drawScreen(); log('Sample ejected.');
      });
    });
  }
  function power() {
    if (!S.inMagnet || S.power || S.busy) return;
    S.power = true; led.material.color.set(0x2fbf7a); btn.material.emissive.set(0x000000); btn.material.color.set(0x7a2a30);
    S.busy = true; S.shim = 0.3; log('Console on. RF amplifier warming up…');
    var t0 = performance.now(); (function boot() { var k = (performance.now() - t0) / 1400; drawScreen(Math.min(1, k)); if (k < 1) requestAnimationFrame(boot); else { S.busy = false; setStep(3); updShim(); log('Deuterium lock found on CDCl₃. Now shim the field.'); } })();
  }
  // shim: lock level depends on how close Z1 and Z2 are to the (random) best values
  var opt = { z1: 0, z2: 0 };
  function newOpt() { opt.z1 = Math.round((Math.random() * 1.4 - 0.7) * 100); opt.z2 = Math.round((Math.random() * 1.4 - 0.7) * 100); }
  newOpt();
  function shimLevel() { var a = (+$('#z1').value - opt.z1) / 100, b = (+$('#z2').value - opt.z2) / 100; return Math.exp(-(a * a * 3.2 + b * b * 2.2)); }
  function updShim() {
    if (!S.power) { $('.nl-meter i').style.width = '0'; return; }
    S.shim = shimLevel();
    $('.nl-meter i').style.width = Math.round(S.shim * 100) + '%';
    $('#lockv').textContent = Math.round(S.shim * 100) + '%' + (S.shim >= 0.85 ? ' · good' : '');
    drawLock();
    if (S.shim >= 0.85 && S.step === 3) { setStep(4); log('Field is homogeneous. Ready to acquire.'); }
    else if (S.step >= 3) setStep(S.step);
    drawScreen();
  }
  $('#z1').addEventListener('input', updShim); $('#z2').addEventListener('input', updShim);
  $('#bAuto').addEventListener('click', function () {
    if (S.busy) return; S.busy = true; setStep(S.step);
    var a0 = +$('#z1').value, b0 = +$('#z2').value;
    tween(1600, function (k) { $('#z1').value = Math.round(a0 + (opt.z1 - a0) * ease(Math.min(1, k * 1.3))); $('#z2').value = Math.round(b0 + (opt.z2 - b0) * ease(Math.max(0, k * 1.3 - 0.3))); updShim(); }, function () { S.busy = false; updShim(); log('Auto-shim done.'); });
  });
  function drawLock() {
    var c = $('.nl-lock'), x = c.getContext('2d'), w = c.width = c.clientWidth * 2, h = c.height = c.clientHeight * 2;
    x.clearRect(0, 0, w, h); x.strokeStyle = '#2fbf7a'; x.lineWidth = 3; x.beginPath();
    var amp = S.shim, wob = 1 - S.shim;
    for (var i = 0; i <= w; i += 3) { var t = i / w; var y = h * 0.85 - amp * h * 0.7 * Math.exp(-Math.pow((t - 0.5) / 0.08, 2)) - wob * h * 0.12 * Math.sin(t * 40 + performance.now() / 300) * Math.exp(-Math.pow((t - 0.5) / 0.25, 2)); i ? x.lineTo(i, y) : x.moveTo(i, y); }
    x.stroke();
  }

  // ---------------- spectrum simulation ----------------
  function lines(m, nuc) {
    var L = [];
    if (nuc === 'C') {
      m.c13.forEach(function (c) { L.push({ d: c.d, h: 1, env: -1 }); });
      [-0.24, 0, 0.24].forEach(function (o) { L.push({ d: 77.16 + o, h: 0.25, env: -2 }); });
      return L;
    }
    m.env.forEach(function (e, k) {
      var pat = [{ o: 0, h: 1 }];
      e.c.forEach(function (cp) {
        var n = cp[0], J = cp[1] / 400, coef = [1]; for (var i = 0; i < n; i++) { var nx = [1]; for (var j = 1; j < coef.length; j++) nx.push(coef[j - 1] + coef[j]); nx.push(1); coef = nx; }
        var np = []; pat.forEach(function (p) { coef.forEach(function (cf, i) { np.push({ o: p.o + (i - n / 2) * J, h: p.h * cf }); }); }); pat = np;
      });
      var tot = pat.reduce(function (s, p) { return s + p.h; }, 0);
      pat.forEach(function (p) { L.push({ d: e.d + p.o, h: e.n * p.h / tot, env: k, br: e.br }); });
    });
    L.push({ d: 7.26, h: 0.06, env: -2 }); L.push({ d: 0, h: 0.25, env: -3 });
    return L;
  }
  function width(br) { var base = S.nuc === 'C' ? 0.012 : 0.0016; base *= 1 + (1 - S.shim) * 6; return br ? 0.05 : base; }
  function specAt(x, L) { var y = 0; for (var i = 0; i < L.length; i++) { var g = width(L[i].br), dx = x - L[i].d; y += L[i].h * g * g / (dx * dx + g * g); } return y; }
  var noiseSeed = []; for (var q = 0; q < 4096; q++) noiseSeed.push(Math.random() - 0.5);

  // ---------------- screen (3D monitor) ----------------
  function drawScreen(boot) {
    var w = scr.width, h = scr.height; sx.fillStyle = S.power || boot ? '#07122a' : '#020308'; sx.fillRect(0, 0, w, h);
    if (!S.power && boot == null) { scrTex.needsUpdate = true; return; }
    sx.fillStyle = '#9fb3e0'; sx.font = '600 26px "JetBrains Mono", monospace';
    sx.fillText('BONDLINE NMR · 400.13 MHz', 24, 40);
    if (boot != null && boot < 1) { sx.fillStyle = '#2fbf7a'; sx.fillRect(24, 200, (w - 48) * boot, 16); sx.fillStyle = '#9fb3e0'; sx.fillText('Starting console…', 24, 260); scrTex.needsUpdate = true; return; }
    sx.font = '500 22px "JetBrains Mono", monospace';
    sx.fillText('Sample: ' + (S.sample ? (S.mystery ? 'Unknown ' + 'ABCD'[S.myst.indexOf(S.sample)] : S.sample.name) : '—'), 24, 76);
    sx.fillText('Lock: ' + Math.round(S.shim * 100) + '%   Nucleus: ' + (S.nuc === 'H' ? '1H' : '13C') + '   Scans: ' + S.scans, 24, 106);
    if (S.fidDraw != null) {
      sx.strokeStyle = '#ffc857'; sx.lineWidth = 2; sx.beginPath();
      var n = Math.floor(S.fidDraw * (w - 48));
      for (var i = 0; i < n; i++) { var y = 280 - fidAt(i / (w - 48)) * 120; i ? sx.lineTo(24 + i, y) : sx.moveTo(24, y); }
      sx.stroke(); sx.fillStyle = '#ffc857'; sx.fillText('FID (time →)', 24, 430);
    }
    if (S.spec) {
      sx.fillStyle = '#07122a'; sx.fillRect(0, 120, w, h);
      plot(sx, 24, 140, w - 48, 270, '#9fd0ff', true);
      sx.fillStyle = '#9fd0ff'; sx.fillText('Spectrum (δ / ppm)', 24, 436);
    }
    scrTex.needsUpdate = true;
  }
  function fidAt(t) {
    var L = S.fid; if (!L) return 0; var y = 0;
    for (var i = 0; i < L.length; i++) { var f = (L[i].d - (S.nuc === 'H' ? 5 : 100)) * (S.nuc === 'H' ? 9 : 0.45) + 3; y += L[i].h * Math.cos(2 * Math.PI * f * t * 6); }
    var decay = Math.exp(-t * (2.2 + (1 - S.shim) * 6));
    return y / S.fidNorm * decay + noiseSeed[Math.floor(t * 4000) % 4096] * 0.25 / Math.sqrt(S.scans);
  }

  // ---------------- spectrum plot (panel) ----------------
  var view = null;
  function range() {
    if (S.nuc === 'C') return [220, -5];
    var mx = Math.max.apply(null, S.sample.env.map(function (e) { return e.d; }));
    return [Math.max(10, Math.ceil(mx + 1)), -0.5];
  }
  function plot(x, X, Y, W, H, col, dark, r) {
    var L = S.fid, rg = r || range(), a = rg[0], b = rg[1];
    var N = Math.max(600, Math.round(W * 2)), ys = [], mx = 0;
    for (var i = 0; i <= N; i++) { var d = a + (b - a) * i / N; var y = specAt(d, L); ys.push(y); if (y > mx) mx = y; }
    var nz = 0.012 / Math.sqrt(S.scans);
    x.strokeStyle = dark ? '#2a3a66' : '#ccd3df'; x.lineWidth = 1; x.beginPath(); x.moveTo(X, Y + H); x.lineTo(X + W, Y + H); x.stroke();
    x.fillStyle = dark ? '#6f7fa8' : '#5a6878'; x.font = (dark ? '18px' : '10px') + ' "JetBrains Mono", monospace'; x.textAlign = 'center';
    var step = (a - b) > 50 ? 20 : (a - b) > 6 ? 1 : (a - b) > 1 ? 0.2 : 0.05;
    for (var t = Math.ceil(b / step) * step; t <= a; t += step) { var px = X + (a - t) / (a - b) * W; x.fillText(String(step < 1 ? t.toFixed(step < 0.1 ? 2 : 1) : Math.round(t)).replace('-', '−'), px, Y + H + (dark ? 20 : 12)); }
    x.textAlign = 'left';
    x.strokeStyle = col; x.lineWidth = dark ? 2 : 1.2; x.beginPath();
    for (var j = 0; j <= N; j++) { var yy = ys[j] / mx + noiseSeed[j % 4096] * nz; var py = Y + H - yy * H * 0.92; var pxx = X + j / N * W; j ? x.lineTo(pxx, py) : x.moveTo(pxx, py); }
    x.stroke();
    return { a: a, b: b, mx: mx };
  }
  function drawPanel() {
    var c = $('#spc'), x = c.getContext('2d'), dpr = 2, w = c.clientWidth, h = c.clientHeight;
    c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
    var rg = view || range();
    var info = plot(x, 6, 34, w - 12, h - 52, '#121a24', false, rg);
    // integrals and env markers (1H only)
    if (S.nuc === 'H') {
      var tot = S.sample.env.reduce(function (s, e) { return s + e.n; }, 0);
      var placed = [], groups = {};
      S.sample.env.forEach(function (e, k) {
        if (e.d > rg[0] || e.d < rg[1]) return;
        var px = 6 + (rg[0] - e.d) / (rg[0] - rg[1]) * (w - 12), row = 0;
        while (placed.some(function (p) { return p.row === row && Math.abs(p.x - px) < 46; })) row++;
        placed.push({ x: px, row: row });
        x.fillStyle = e.col; x.font = '700 11px "Bricolage Grotesque", sans-serif'; x.textAlign = 'center';
        x.fillText(e.l + ' · ' + e.n + 'H', px, 12 + row * 13); x.textAlign = 'left';
      });
    } else {
      x.fillStyle = '#5a6878'; x.font = '10px "JetBrains Mono", monospace';
      var cx = 6 + (rg[0] - 77.16) / (rg[0] - rg[1]) * (w - 12); if (77 < rg[0] && 77 > rg[1]) x.fillText('CDCl₃', cx - 14, 12);
    }
    c._info = { rg: rg, w: w };
  }
  function detail(k) {
    var e = S.sample.env[k]; var mult = ['singlet', 'doublet', 'triplet', 'quartet', 'quintet', 'sextet', 'septet'];
    var nN = e.c.reduce(function (s, c) { return s + c[0]; }, 0);
    var name = e.br ? 'broad singlet' : e.c.length > 1 ? mult[e.c[0][0]] + ' of ' + mult[e.c[1][0]].replace('et', 'ets') : (mult[nN] || 'multiplet');
    $('.nl-peak').innerHTML = '<b style="color:' + e.col + '">' + e.l + ': δ ' + e.d.toFixed(2) + ' ppm · ' + e.n + 'H · ' + name + '</b><br>' + e.t;
    view = [e.d + (e.br ? 0.4 : 0.09), e.d - (e.br ? 0.4 : 0.09)]; drawPanel();
    $('#bZoom').hidden = false;
  }
  $('#spc').addEventListener('click', function (ev) {
    if (!S.spec) return; var c = $('#spc'), r = c.getBoundingClientRect(), inf = c._info; if (!inf) return;
    var d = inf.rg[0] - (ev.clientX - r.left - 6) / (inf.w - 12) * (inf.rg[0] - inf.rg[1]);
    if (S.nuc === 'C') {
      var best = null; S.sample.c13.forEach(function (c13) { if (!best || Math.abs(c13.d - d) < Math.abs(best.d - d)) best = c13; });
      if (Math.abs(77.16 - d) < Math.abs(best.d - d)) { $('.nl-peak').innerHTML = '<b>δ 77.2: CDCl₃</b><br>The solvent. Its carbon couples to deuterium (spin 1), so it shows as a 1:1:1 triplet.'; return; }
      $('.nl-peak').innerHTML = '<b>δ ' + best.d.toFixed(1) + ' ppm</b><br>' + c13text(best.d); return;
    }
    var bk = -1, bd = 1e9; S.sample.env.forEach(function (e, k) { var dd = Math.abs(e.d - d); if (dd < bd) { bd = dd; bk = k; } });
    if (Math.abs(d - 7.26) < bd && Math.abs(d - 7.26) < 0.05 && !S.sample.env.some(function (e) { return Math.abs(e.d - 7.26) < 0.2; })) { $('.nl-peak').innerHTML = '<b>δ 7.26: CHCl₃</b><br>A trace of undeuterated chloroform in the solvent.'; return; }
    if (Math.abs(d) < 0.15 && bd > 0.3) { $('.nl-peak').innerHTML = '<b>δ 0.00: TMS</b><br>Tetramethylsilane, the reference. Every shift is measured from it.'; return; }
    if (bd < (view ? 1 : 0.6)) detail(bk);
  });
  function c13text(d) {
    if (d > 190) return 'C=O of an aldehyde or ketone (190–220 ppm).';
    if (d > 160) return 'C=O of an acid or ester (160–185 ppm).';
    if (d > 110) return 'Aromatic or alkene carbon (110–160 ppm).';
    if (d > 50) return 'Carbon bonded to O or Cl (50–90 ppm).';
    if (d > 30) return 'CH₂ or CH next to an electronegative group or C=O (25–50 ppm).';
    return 'Alkyl carbon (CH₃ or CH₂), 0–30 ppm.';
  }
  $('#bZoom').addEventListener('click', function () { view = null; drawPanel(); $('#bZoom').hidden = true; });

  // ---------------- acquire + FT ----------------
  $$('[data-nuc]').forEach(function (b) { b.addEventListener('click', function () { if (S.busy) return; S.nuc = b.dataset.nuc; $$('[data-nuc]').forEach(function (x) { x.classList.toggle('on', x === b); }); drawScreen(); }); });
  $$('[data-scans]').forEach(function (b) { b.addEventListener('click', function () { if (S.busy) return; S.scans = +b.dataset.scans; $$('[data-scans]').forEach(function (x) { x.classList.toggle('on', x === b); }); drawScreen(); }); });
  $('#bAcq').addEventListener('click', function () {
    if (S.busy || !S.sample) return;
    S.busy = true; S.spec = false; view = null; $('.nl-spec').classList.remove('show'); $('#bZoom').hidden = true; $('.nl-guess').hidden = true;
    S.fid = lines(S.sample, S.nuc); S.fidNorm = S.fid.reduce(function (s, l) { return s + l.h; }, 0);
    log('Pulse 90°, ' + S.scans + ' scan' + (S.scans > 1 ? 's' : '') + ' on ' + (S.nuc === 'H' ? '¹H' : '¹³C (proton-decoupled)') + '…');
    var dur = (S.nuc === 'C' ? 2600 : 1600) + S.scans * 60;
    tween(dur, function (k) { S.fidDraw = k; rf.material.opacity = 0.75 * Math.abs(Math.sin(k * Math.PI * (2 + S.scans / 2))); band.material.emissive.setRGB(0.3 * rf.material.opacity, 0.1 * rf.material.opacity, 0.1 * rf.material.opacity); drawScreen(); },
      function () { rf.material.opacity = 0; band.material.emissive.set(0); S.busy = false; setStep(5); drawScreen(); log('FID recorded: the nuclei relaxing back, ringing at their own frequencies.'); });
    setStep(4);
  });
  $('#bFT').addEventListener('click', function () {
    if (!S.fid || S.busy) return; S.busy = true;
    log('Fourier transform: time domain → frequency domain.');
    tween(700, function (k) { S.fidDraw = 1 - k; drawScreen(); }, function () {
      S.fidDraw = null; S.spec = true; S.busy = false; drawScreen();
      $('.nl-spec').classList.add('show'); $('.nl-mol .sv').innerHTML = S.mystery ? '<p style="font-size:13px;color:#5a6878;margin:0">Structure hidden until you identify the unknown.</p>' : S.sample.svg;
      $('.nl-peak').innerHTML = S.nuc === 'H' ? 'Click a peak. The letters match the coloured hydrogens in the structure.' : 'Proton-decoupled ¹³C: one line per carbon environment. Click a peak.';
      drawPanel(); setStep(6);
      if (S.mystery) askGuess();
      $('.nl-spec').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
    });
  });
  function askGuess() {
    var g = $('.nl-guess'); g.hidden = false;
    var opts = shuffle([S.sample].concat(shuffle(D.filter(function (m) { return m !== S.sample; })).slice(0, 3)));
    var row = g.querySelector('.lx-row'); row.innerHTML = ''; $('.nl-fb').textContent = '';
    opts.forEach(function (m) {
      var b = document.createElement('button'); b.textContent = m.name;
      b.addEventListener('click', function () {
        if (row.dataset.done) return;
        if (m === S.sample) { b.className = 'right'; row.dataset.done = 1; $('.nl-fb').textContent = 'Correct! It\'s ' + m.name + '.'; $('.nl-mol .sv').innerHTML = m.svg; }
        else { b.className = 'wrong'; $('.nl-fb').textContent = 'Not quite. Check the number of signals, their integrals and splitting.'; }
      });
      row.appendChild(b);
    });
    delete row.dataset.done;
  }
  $('#bIns').addEventListener('click', insert);
  $('#bPow').addEventListener('click', power);
  $('#bEj').addEventListener('click', eject);
  function flash(t) { var h = $('.nl-hint'); h.textContent = t; }
  function resetAll() {
    if (S.inMagnet) { var t = tubeOf(S.sample); if (t) t.g.visible = true; }
    S.sample = null; S.inMagnet = false; S.fid = null; S.spec = false; S.fidDraw = null; view = null;
    $('.nl-spec').classList.remove('show'); $('.nl-guess').hidden = true; setStep(0); drawScreen();
  }

  // ---------------- pointer: orbit + click ----------------
  var ray = new T.Raycaster(), ptr = new T.Vector2(), drag = null, moved = 0, pinch = null;
  function pick(ev) {
    var r = canvas.getBoundingClientRect(); ptr.set((ev.clientX - r.left) / r.width * 2 - 1, -(ev.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(ptr, cam);
    var objs = [boreHot, btn, btnHot].concat(tubes.map(function (t) { return t.hot; }));
    var hit = ray.intersectObjects(objs, false)[0]; return hit && hit.object;
  }
  canvas.addEventListener('pointerdown', function (e) { drag = { x: e.clientX, y: e.clientY, th: orb.th, ph: orb.ph }; moved = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', function (e) {
    if (drag && !pinch) { var dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy)); orb.th = drag.th - dx * 0.006; orb.ph = Math.max(0.45, Math.min(1.45, drag.ph - dy * 0.005)); placeCam(); }
    else { var o = pick(e); canvas.style.cursor = o && o.userData.act ? 'pointer' : 'grab'; }
  });
  canvas.addEventListener('pointerup', function (e) {
    if (drag && moved < 6) {
      var o = pick(e);
      if (o && o.userData.act === 'tube') { var L = S.mystery ? S.myst : D; choose(L[o.userData.i]); }
      else if (o && o.userData.act === 'insert') insert();
      else if (o && o.userData.act === 'power') power();
    }
    drag = null;
  });
  canvas.addEventListener('wheel', function (e) { e.preventDefault(); orb.r = Math.max(2.6, Math.min(9, orb.r * (1 + Math.sign(e.deltaY) * 0.08))); placeCam(); }, { passive: false });
  canvas.addEventListener('touchstart', function (e) { if (e.touches.length === 2) pinch = { d: Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY), r: orb.r }; }, { passive: true });
  canvas.addEventListener('touchmove', function (e) { if (pinch && e.touches.length === 2) { var d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY); orb.r = Math.max(2.6, Math.min(9, pinch.r * pinch.d / d)); placeCam(); } }, { passive: true });
  canvas.addEventListener('touchend', function () { pinch = null; });

  function resize() { var w = wrap.clientWidth, h = wrap.clientHeight; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); if (cam.aspect < 1) { orb.r = Math.max(orb.r, 10.5); placeCam(); } if (S.spec) drawPanel(); }
  addEventListener('resize', resize);

  // ---------------- loop ----------------
  var last = performance.now();
  function loop(now) {
    var dt = now - last; last = now;
    for (var i = tweens.length - 1; i >= 0; i--) { var tw = tweens[i], k = Math.min(1, (now - tw.t0) / tw.d); tw.fn(k); if (k >= 1) { tweens.splice(i, 1); tw.done && tw.done(); } }
    var pulse = 0.25 + 0.2 * Math.sin(now / 300);
    boreHot.material.opacity = S.sample && !S.inMagnet && !S.busy ? pulse : 0;
    btn.scale.y = S.inMagnet && !S.power ? 1 + 0.4 * (0.5 + 0.5 * Math.sin(now / 250)) : 1;
    tubes.forEach(function (t) { if (!S.sample && S.step === 0) t.g.rotation.y += dt * 0.0006; });
    if (S.power && S.step === 3) drawLock();
    R.render(scene, cam); requestAnimationFrame(loop);
  }
  buildRack(); listSamples(); placeCam(); resize(); setStep(0); drawScreen(); updShim(); requestAnimationFrame(loop);
  // deep link: ?s=ethanol picks a sample
  var qs = new URLSearchParams(location.search).get('s'); if (qs) { var m0 = D.filter(function (m) { return m.id === qs; })[0]; if (m0) setTimeout(function () { choose(m0); }, 400); }
})();
