/* Bondline lesson: spectroscopy. Scenes for learn.js (800 × 600 drawing box). */
(function () {
  'use strict';
  var PI = Math.PI;
  function gauss(x, m, s) { return Math.exp(-Math.pow((x - m) / s, 2)); }
  function lor(x, m, w) { return w * w / ((x - m) * (x - m) + w * w); }

  // ---------- 1. light and energy ----------
  var REG = { radio: { lam: 260, name: 'Radio waves', does: 'flip the spin of nuclei in a magnet', tech: 'NMR', x: 120 }, ir: { lam: 70, name: 'Infrared', does: 'make bonds stretch and bend', tech: 'IR spectroscopy', x: 330 }, uv: { lam: 22, name: 'Ultraviolet / visible', does: 'push electrons up to higher orbitals', tech: 'UV–vis spectroscopy', x: 520 } };
  LX.scene('em', {
    draw: function (g, st) {
      var reg = st.s === 'intro' ? 'ir' : (st.ctl('region') || 'ir'), R = REG[reg], t = st.t, C = g.col;
      // spectrum bar
      var bands = [['Radio', '#3b4a7a'], ['Microwave', '#46578c'], ['Infrared', '#8a3b4a'], ['Visible', null], ['UV', '#5b3f9a'], ['X-ray', '#3d3566']];
      bands.forEach(function (b, i) {
        var x0 = 60 + i * 113;
        if (b[1]) g.rect(x0, 60, 113, 34, { f: b[1] });
        else { var gr = g.x.createLinearGradient(x0, 0, x0 + 113, 0); ['#ff3b3b', '#ffb03b', '#f6f23b', '#3bdc6a', '#3b8cff', '#8a3bff'].forEach(function (c, k) { gr.addColorStop(k / 5, c); }); g.x.fillStyle = gr; g.x.fillRect(x0, 60, 113, 34); }
        g.text(b[0], x0 + 56, 112, { size: 15, c: C.mut });
      });
      g.text('longer wavelength, lower energy', 60, 36, { size: 14, c: C.mut, al: 'left' });
      g.text('shorter wavelength, higher energy', 740, 36, { size: 14, c: C.mut, al: 'right' });
      g.arrow(330, 36, 470, 36, { c: C.mut, w: 1.5, head: 8 });
      var mk = { radio: 116, ir: 286, uv: 626 }[reg];
      g.rect(mk - 56, 56, 112, 42, { s: C.acc, w: 3, r: 6 });
      // wave travelling to the molecule
      var reach = st.s === 'intro' ? g.seg(st.p, 0, 0.5) : 1, xEnd = 60 + 380 * reach, pts = [];
      for (var x = 60; x <= xEnd; x += 2) pts.push([x, 330 + 46 * Math.sin((x - t * 140) / R.lam * 2 * PI)]);
      g.path(pts, { c: C.acc, w: 3 });
      var hit = reach >= 1, k = hit ? 1 : 0;
      // molecule and its response
      var cx = 590, cy = 330;
      if (reg === 'ir') {
        var d = 70 + (hit ? 16 * Math.sin(t * 14) : 0);
        for (var i = 0; i < 2; i++) g.line(cx - d / 2, cy + (i ? 5 : -5), cx + d / 2, cy + (i ? 5 : -5), { c: C.ink, w: 4 });
        g.atom(cx - d / 2 - 10, cy, 'C', '#4a5578', 30); g.atom(cx + d / 2 + 10, cy, 'O', '#c0444f', 30);
        if (hit) { g.arrow(cx - d / 2 - 50, cy - 60, cx - d / 2 - 80, cy - 60, { c: C.gold, w: 2 }); g.arrow(cx + d / 2 + 50, cy - 60, cx + d / 2 + 80, cy - 60, { c: C.gold, w: 2 }); }
      } else if (reg === 'radio') {
        g.arrow(cx - 120, cy + 90, cx - 120, cy - 90, { c: C.mut, w: 3 }); g.rich('B_0', cx - 140, cy - 100, { size: 18, c: C.mut });
        g.circle(cx, cy, 44, { f: '#2b3760' }); g.text('H', cx, cy, { size: 30, w: 700 });
        var flip = hit ? (Math.sin(t * 3) > 0 ? 1 : -1) : 1, ang = hit ? Math.sin(t * 3) * PI / 2 * 0 : 0;
        g.arrow(cx + 70, cy + 40 * flip, cx + 70, cy - 40 * flip, { c: flip > 0 ? C.green : C.red, w: 5, head: 16 });
        g.text(flip > 0 ? 'spin aligned (low energy)' : 'spin flipped (high energy)', cx, cy + 90, { size: 16, c: C.mut });
      } else {
        g.line(cx - 90, cy + 50, cx + 90, cy + 50, { c: C.ink, w: 3 }); g.line(cx - 90, cy - 50, cx + 90, cy - 50, { c: C.ink, w: 3 });
        g.text('ground state', cx + 100, cy + 50, { size: 15, c: C.mut, al: 'left' }); g.text('excited state', cx + 100, cy - 50, { size: 15, c: C.mut, al: 'left' });
        var up = hit ? (Math.sin(t * 2.5) > -0.2) : false;
        g.circle(cx, up ? cy - 50 : cy + 50, 12, { f: C.blue }); g.text('e⁻', cx, (up ? cy - 50 : cy + 50) - 26, { size: 16 });
        if (hit && up) g.arrow(cx - 40, cy + 40, cx - 40, cy - 40, { c: C.gold, w: 2 });
      }
      g.text(R.name, 400, 470, { size: 28, w: 700 });
      g.text(hit ? R.name.split(' ')[0] + ' ' + R.does + '.' : '…', 400, 506, { size: 19, c: C.mut });
      g.text(hit ? 'That is ' + R.tech + '.' : '', 400, 540, { size: 19, c: C.acc, w: 700 });
    }
  });

  // ---------- 2. IR ----------
  var BOND = { 1: 500, 2: 1150, 3: 1750 }, MASS = { H: 1, C: 12, N: 14, O: 16, Cl: 35 };
  function wn(b, a) { var m1 = 12, m2 = MASS[a], mu = m1 * m2 / (m1 + m2); return 130.3 * Math.sqrt(BOND[b] / mu); }
  function irX(v) { return 80 + (4000 - v) / 3600 * 640; }
  function irAxis(g, y0) {
    var C = g.col; g.line(80, y0, 720, y0, { c: C.mut, w: 2 });
    [4000, 3500, 3000, 2500, 2000, 1500, 1000, 500].forEach(function (v) { g.line(irX(v), y0, irX(v), y0 + 8, { c: C.mut, w: 2 }); g.text(String(v), irX(v), y0 + 24, { size: 14, c: C.mut }); });
    g.rich('wavenumber / cm^{−1}', 720, y0 + 46, { size: 14, c: C.mut, al: 'right' });
  }
  function irSpec(g, peaks, reveal, y0, H, labels) {
    var C = g.col, pts = [];
    for (var v = 4000; v >= 400 && irX(v) <= 80 + 640 * reveal + 0.5; v -= 4) {
      var T = 0.94; peaks.forEach(function (p) { T -= p[1] * gauss(v, p[0], p[2]); });
      pts.push([irX(v), y0 - H + (1 - T) * H]);
    }
    g.path(pts, { c: C.acc, w: 2.5 });
    (labels || []).forEach(function (l) { if (irX(l[0]) <= 80 + 640 * reveal) g.text(l[1], irX(l[0]), y0 - H + l[2], { size: 16, w: 700, c: C.gold }); });
  }
  LX.scene('ir', {
    fmt: {},
    // H and Cl only form single bonds: keep the two button rows consistent
    on: function (name, v, ch) {
      var pick = function (ctl, val) { var b = ch.sec.querySelector('[data-ctl="' + ctl + '"] [data-v="' + val + '"]'); if (b && !b.classList.contains('on')) b.click(); };
      if (name === 'atom' && (v === 'H' || v === 'Cl')) pick('bond', '1');
      if (name === 'bond' && v !== '1') { var a = ch.ctl('atom'); if (a === 'H' || a === 'Cl') pick('atom', 'C'); }
    },
    draw: function (g, st) {
      var C = g.col, t = st.t;
      if (st.s === 'spring') {
        var b = +(st.ctl('bond') || 1), a = st.ctl('atom') || 'H', v = wn(b, a), f = v / 900;
        var r2 = 16 + Math.sqrt(MASS[a]) * 5, amp = 18 / Math.sqrt(MASS[a] / 4 + 1), L = 150 + amp * Math.sin(t * f * 4);
        var x1 = 400 - L / 2 - 20, x2 = 400 + L / 2 + 20, y = 210;
        // spring(s)
        for (var s = 0; s < b; s++) { var off = (s - (b - 1) / 2) * 16, pts = []; for (var i = 0; i <= 60; i++) { var xx = g.lerp(x1 + 34, x2 - r2, i / 60); pts.push([xx, y + off + (i % 2 ? 8 : -8) * (i > 2 && i < 58 ? 1 : 0)]); } g.path(pts, { c: C.ink, w: 2.5 }); }
        g.atom(x1, y, 'C', '#4a5578', 34); g.atom(x2, y, a, a === 'H' ? '#6b7690' : a === 'O' ? '#c0444f' : a === 'N' ? '#3d63c9' : a === 'Cl' ? '#2f9a5e' : '#4a5578', r2);
        g.text((b === 1 ? 'single' : b === 2 ? 'double' : 'triple') + ' bond C' + ['', '–', '=', '≡'][b] + a, 400, 300, { size: 20, c: C.mut });
        irAxis(g, 430);
        [[4000, 2500, 'X–H'], [2500, 2000, 'triple'], [2000, 1500, 'double'], [1500, 400, 'fingerprint']].forEach(function (r, k) { g.rect(irX(r[0]), 370, irX(r[1]) - irX(r[0]), 50, { f: ['#24305a', '#2b2a55', '#33284f', '#1c2340'][k] }); g.text(r[2], (irX(r[0]) + irX(r[1])) / 2, 395, { size: 14, c: C.mut }); });
        var mx = irX(Math.min(4000, Math.max(400, v)));
        g.line(mx, 350, mx, 430, { c: C.acc, w: 4 }); g.circle(mx, 350, 7, { f: C.acc });
        g.rich('≈ ' + Math.round(v / 10) * 10 + ' cm^{−1}', mx, 330, { size: 22, w: 700, c: C.acc });
        g.text('Stiffer bond or lighter atom → vibrates faster → higher wavenumber', 400, 540, { size: 17, c: C.mut });
      } else {
        var quiz = st.s === 'quiz';
        var peaks = quiz ? [[2970, 0.22, 40], [1715, 0.8, 22], [1360, 0.35, 15], [1220, 0.45, 20]] : [[3340, 0.62, 160], [2970, 0.42, 30], [2900, 0.25, 25], [1450, 0.2, 18], [1050, 0.7, 22], [880, 0.3, 12]];
        var lab = quiz ? [] : [[3340, 'O–H (broad)', 120], [2950, 'C–H', 30], [1050, 'C–O', 110]];
        irAxis(g, 470);
        g.text('transmittance', 60, 160, { size: 14, c: C.mut, al: 'left' });
        irSpec(g, peaks, quiz ? 1 : Math.max(0.02, g.seg(st.p, 0.05, 0.85)), 470, 330, lab);
        g.text(quiz ? 'Mystery compound, C₃H₆O' : 'IR spectrum of ethanol', 400, 80, { size: 24, w: 700 });
      }
    }
  });

  // ---------- 3. mass spec ----------
  function msAxis(g, y0, a, b) { var C = g.col; g.line(80, y0, 720, y0, { c: C.mut, w: 2 }); for (var m = Math.ceil(a / 10) * 10; m <= b; m += 10) { var x = 80 + (m - a) / (b - a) * 640; g.line(x, y0, x, y0 + 8, { c: C.mut, w: 2 }); g.text(String(m), x, y0 + 24, { size: 14, c: C.mut }); } g.text('m/z', 720, y0 + 46, { size: 15, c: C.mut, al: 'right' }); }
  function bar(g, m, h, a, b, y0, H, col, lab) { var x = 80 + (m - a) / (b - a) * 640; g.rect(x - 6, y0 - h * H, 12, h * H, { f: col }); if (lab) g.text(lab, x, y0 - h * H - 18, { size: 16, w: 700, c: col }); }
  LX.scene('ms', {
    draw: function (g, st) {
      var C = g.col, p = st.p, t = st.t;
      if (st.s === 'ionise') {
        var y = 170;
        // electron beam
        var eb = g.seg(p, 0, 0.22);
        if (p < 0.3) { var ex = g.lerp(60, 330, eb); g.circle(ex, y - 40, 9, { f: C.blue }); g.text('e⁻', ex, y - 66, { size: 15 }); }
        var ion = g.seg(p, 0.22, 0.32), frag = g.seg(p, 0.45, 0.72);
        var cx = 400, glow = ion * (1 - frag);
        if (glow > 0) g.circle(cx, y, 110, { f: 'rgba(255,158,143,' + (0.15 * glow) + ')' });
        var dx = 120 * frag;
        // CH3-CH(Cl)-CH3 as balls
        g.line(cx - 70, y + 20, cx, y - 10, { w: 4 }); g.line(cx, y - 10, cx + 70, y + 20, { w: 4 });
        if (frag < 1) g.line(cx, y - 10, cx + dx * 0.6, y - 60 - dx * 0.6, { w: 4, a: 1 - frag });
        g.atom(cx - 70, y + 20, 'CH_3', '#4a5578', 26); g.atom(cx, y - 10, 'CH', '#4a5578', 26); g.atom(cx + 70, y + 20, 'CH_3', '#4a5578', 26);
        g.atom(cx + dx * 0.9, y - 80 - dx * 0.6, 'Cl', '#2f9a5e', 26);
        if (ion > 0.5 && frag < 0.5) g.text('M⁺•  (lost one electron)', cx, y + 80, { size: 18, c: C.acc, w: 700 });
        if (frag > 0.5) { g.text('C₃H₇⁺  m/z 43', cx - 10, y + 80, { size: 18, c: C.gold, w: 700 }); g.text('Cl•  (neutral: not detected)', cx + 170, y - 150, { size: 15, c: C.mut }); }
        msAxis(g, 520, 20, 90);
        var gr = g.seg(p, 0.62, 0.95);
        [[27, 0.32], [41, 0.36], [43, 1, '43'], [63, 0.09], [65, 0.03], [78, 0.22, 'M⁺ 78'], [80, 0.07]].forEach(function (b) { bar(g, b[0], b[1] * gr, 20, 90, 520, 220, b[0] === 43 ? C.gold : b[0] >= 78 ? C.acc : C.blue, gr > 0.9 ? b[2] : null); });
        g.text('electron beam (70 eV)', 120, 60, { size: 15, c: C.mut });
      } else {
        var quiz = st.s === 'quiz', hal = quiz ? 'Br' : (st.ctl('hal') || 'Cl');
        var base = quiz ? 136 : 78, a = base - 6, b = base + 8, pat = { none: [[0, 1], [1, 0.04]], Cl: [[0, 1], [2, 0.32]], Br: [[0, 1], [2, 0.97]], Cl2: [[0, 1], [2, 0.64], [4, 0.1]] }[hal];
        msAxis(g, 470, a, b);
        pat.forEach(function (q, i) { bar(g, base + q[0], q[1], a, b, 470, 300, i === 0 ? C.acc : C.green, (i === 0 ? 'M' : 'M+' + q[0]) + (q[1] < 0.06 ? '' : '')); });
        var txt = { none: 'No Cl or Br: just a tiny M+1 from ¹³C.', Cl: 'One Cl: M : M+2 = 3 : 1 (³⁵Cl is 3× as common as ³⁷Cl).', Br: 'One Br: M : M+2 = 1 : 1 (⁷⁹Br and ⁸¹Br are about 50 : 50).', Cl2: 'Two Cl: M : M+2 : M+4 = 9 : 6 : 1.' }[hal];
        g.text(quiz ? 'Mystery: molecular ion region' : 'Molecular ion region', 400, 90, { size: 24, w: 700 });
        if (!quiz) g.text(txt, 400, 560, { size: 18, c: C.mut });
      }
    }
  });

  // ---------- 4. NMR ----------
  var XS = { H: [0.23, 'CH₄', 2.2], C: [0.86, 'CH₃–CH₃', 2.55], N: [2.42, 'CH₃–NH₂', 3.04], Cl: [3.05, 'CH₃–Cl', 3.16], O: [3.38, 'CH₃–OH', 3.44], F: [4.26, 'CH₃–F', 3.98] };
  var shiftNow = 3.38;
  function ppmX(d, a, b) { a = a == null ? 10 : a; b = b == null ? 0 : b; return 80 + (a - d) / (a - b) * 640; }
  function ppmAxis(g, y0, a, b) { var C = g.col; a = a == null ? 10 : a; b = b == null ? 0 : b; g.line(80, y0, 720, y0, { c: C.mut, w: 2 }); for (var d = Math.ceil(b); d <= a; d++) { g.line(ppmX(d, a, b), y0, ppmX(d, a, b), y0 + 8, { c: C.mut, w: 2 }); g.text(String(d), ppmX(d, a, b), y0 + 24, { size: 14, c: C.mut }); } g.text('δ / ppm', 720, y0 + 46, { size: 15, c: C.mut, al: 'right' }); }
  function binom(n) { var r = [1]; for (var i = 0; i < n; i++) { var nx = [1]; for (var j = 1; j < r.length; j++) nx.push(r[j - 1] + r[j]); nx.push(1); r = nx; } return r; }
  function multiplet(g, d, n, h, y0, H, col, J, a, b) {
    var co = binom(n), mx = Math.max.apply(null, co), pts = [];
    var lo = d - (n / 2 + 1.5) * J, hi = d + (n / 2 + 1.5) * J;
    for (var x = hi; x >= lo; x -= J / 40) { var y = 0; co.forEach(function (c, i) { y += c / mx * lor(x, d + (i - n / 2) * J, J / 9); }); pts.push([ppmX(x, a, b), y0 - y * H * h]); }
    g.path(pts, { c: col, w: 2.5 });
  }
  LX.scene('nmr', {
    on: function (k, v) { },
    draw: function (g, st) {
      var C = g.col, p = st.p, t = st.t;
      if (st.s === 'spin') {
        var field = g.seg(p, 0.05, 0.3), pulse = g.seg(p, 0.42, 0.55), relax = g.seg(p, 0.62, 0.95);
        g.arrow(70, 480, 70, 140, { c: field > 0.5 ? C.acc : C.dim, w: 5, head: 16 }); g.rich('B_0', 70, 120, { size: 20, c: field > 0.5 ? C.acc : C.mut });
        for (var i = 0; i < 15; i++) {
          var col = i % 5, row = Math.floor(i / 5), x = 160 + col * 80, y = 200 + row * 110, rnd = Math.sin(i * 12.9898) * 43758.5453 % 1;
          var down = i % 5 === 2 || i === 9; var free = (rnd + 1) * PI + t * (0.3 + i % 3 * 0.2);
          var ang0 = free, ang1 = down ? PI / 2 : -PI / 2;
          var flipped = pulse > 0.5 && !down && i % 2 === 0 && relax < (i % 4) / 4 + 0.25;
          var ang = g.lerp(ang0, flipped ? PI / 2 : ang1, field);
          g.circle(x, y, 24, { f: '#2b3760' }); g.text('¹H', x, y, { size: 13, c: C.mut });
          g.arrow(x - 30 * Math.cos(ang), y - 30 * Math.sin(ang), x + 30 * Math.cos(ang), y + 30 * Math.sin(ang), { c: Math.sin(ang) < -0.5 ? C.green : Math.sin(ang) > 0.5 ? C.red : C.ink, w: 3 });
          if (relax > 0 && relax < 1 && i % 2 === 0 && !down) { var r0 = 30 + 40 * ((t * 2 + i * 0.3) % 1); g.circle(x, y, r0, { s: C.gold, w: 2, a: (1 - (r0 - 30) / 40) * 0.6 }); }
        }
        if (pulse > 0 && pulse < 1) { var pts = []; for (var xx = 100; xx < 560; xx += 3) pts.push([xx, 120 + 14 * Math.sin(xx / 12 - t * 20)]); g.path(pts, { c: C.gold, w: 3 }); g.text('radio-frequency pulse', 330, 90, { size: 16, c: C.gold }); }
        // energy levels
        var gap = 10 + 120 * field, ex = 640;
        g.line(ex - 60, 330 - gap / 2, ex + 60, 330 - gap / 2, { c: C.red, w: 3 }); g.line(ex - 60, 330 + gap / 2, ex + 60, 330 + gap / 2, { c: C.green, w: 3 });
        g.text('spin against B₀', ex, 330 - gap / 2 - 18, { size: 14, c: C.mut }); g.text('spin with B₀', ex, 330 + gap / 2 + 20, { size: 14, c: C.mut });
        g.arrow(ex + 80, 330 + gap / 2, ex + 80, 330 - gap / 2, { c: C.gold, w: 2, head: 8 }); g.text('ΔE', ex + 100, 330, { size: 16, c: C.gold, al: 'left' });
        g.text(field < 0.5 ? 'No field: spins point anywhere' : pulse < 0.5 ? 'In a magnet, spins line up with or against B₀' : relax < 0.5 ? 'A radio pulse with exactly ΔE flips some spins' : 'They relax back, giving off the signal we record', 400, 560, { size: 18, c: C.mut });
      } else if (st.s === 'shift') {
        var X = st.ctl('x') || 'O', target = XS[X][0]; shiftNow += (target - shiftNow) * 0.12;
        var cx = 300, cy = 200, en = XS[X][2], cloud = 1 - (en - 2.2) / 1.9;
        g.circle(cx - 40, cy, 70 + 24 * cloud, { f: 'rgba(111,168,255,' + (0.1 + 0.12 * cloud) + ')' });
        g.line(cx - 40, cy, cx + 90, cy, { w: 5 });
        [[-60], [60], [0]].forEach(function (a) { var r = a[0] * PI / 180; g.line(cx - 40, cy, cx - 40 - 70 * Math.cos(r), cy - 70 * Math.sin(r), { w: 4 }); g.atom(cx - 40 - 80 * Math.cos(r), cy - 80 * Math.sin(r), 'H', '#6b7690', 18); });
        g.atom(cx - 40, cy, 'C', '#4a5578', 26); g.atom(cx + 100, cy, X, X === 'F' ? '#3fae8a' : X === 'O' ? '#c0444f' : X === 'Cl' ? '#2f9a5e' : X === 'N' ? '#3d63c9' : X === 'C' ? '#4a5578' : '#6b7690', 28);
        g.text(XS[X][1] + '   electronegativity of ' + X + ': ' + en.toFixed(2), 400, 70, { size: 20, w: 700 });
        g.text(cloud > 0.6 ? 'Electrons stay near the H: shielded' : 'X pulls electrons away: H is deshielded', 520, 200, { size: 16, c: C.mut, al: 'left' });
        ppmAxis(g, 480, 6, 0);
        var px = ppmX(shiftNow, 6, 0); g.rect(px - 4, 300, 8, 180, { f: C.acc }); g.text('δ ' + shiftNow.toFixed(2), px, 282, { size: 18, w: 700, c: C.acc });
        g.text('← downfield (deshielded)', 90, 560, { size: 15, c: C.mut, al: 'left' }); g.text('upfield (shielded) →', 710, 560, { size: 15, c: C.mut, al: 'right' });
      } else if (st.s === 'split') {
        var n = Math.round(st.ctl('n') == null ? 3 : st.ctl('n')), co = binom(n), names = ['singlet', 'doublet', 'triplet', 'quartet', 'quintet', 'sextet', 'septet'];
        for (var r = 0; r <= 6; r++) { var row = binom(r); g.text(row.join('   '), 400, 70 + r * 30, { size: r === n ? 20 : 16, w: r === n ? 700 : 500, c: r === n ? C.acc : C.dim }); }
        var J = 0.07, base = 470, mxh = Math.max.apply(null, co);
        co.forEach(function (c, i) { var x = 400 + (i - n / 2) * 60; g.rect(x - 4, base - c / mxh * 200, 8, c / mxh * 200, { f: C.acc }); g.text(String(c), x, base + 22, { size: 15, c: C.mut }); });
        g.text(n + ' neighbouring H → ' + (n + 1) + ' peaks: ' + names[n], 400, 545, { size: 22, w: 700 });
      } else if (st.s === 'integ' || st.s === 'quiz') {
        var q = st.s === 'quiz', a = 6, b = 0;
        var env = q ? [[1.51, 1, 6, 6.5 / 400], [4.14, 6, 1, 6.5 / 400]] : [[1.22, 2, 3, 7 / 400], [3.69, 3, 2, 7 / 400], [2.61, 0, 1, 0]];
        ppmAxis(g, 470, a, b);
        var sumH = env.reduce(function (s, e) { return s + e[2]; }, 0);
        env.forEach(function (e, k) {
          var col = [C.acc, C.blue, C.green][k];
          if (e[1] === 0) { var pts = []; for (var x = e[0] + 0.3; x >= e[0] - 0.3; x -= 0.004) pts.push([ppmX(x, a, b), 470 - 60 * lor(x, e[0], 0.04)]); g.path(pts, { c: col, w: 2.5 }); }
          else { var co2 = binom(e[1]), mx2 = Math.max.apply(null, co2), pts2 = []; for (var x2 = e[0] + 0.15; x2 >= e[0] - 0.15; x2 -= 0.001) { var yy = 0; co2.forEach(function (c, i) { yy += c / mx2 * lor(x2, e[0] + (i - e[1] / 2) * e[3], 0.0025); }); pts2.push([ppmX(x2, a, b), 470 - yy * 260 * Math.min(1, e[2] / 3) / (e[1] > 3 ? 1 : 1)]); } g.path(pts2, { c: col, w: 2 }); }
          if (!q) { var ip = g.seg(st.p, 0.15 + k * 0.2, 0.35 + k * 0.2); if (ip > 0) { var x0 = ppmX(e[0] + 0.25, a, b), x1 = ppmX(e[0] - 0.25, a, b), hh = 40 * e[2]; g.path([[x0, 180], [g.lerp(x0, x1, 0.4), 180], [g.lerp(x0, x1, 0.6), 180 - hh * ip], [x1, 180 - hh * ip]], { c: col, w: 3 }); g.text(e[2] + 'H', (x0 + x1) / 2, 210, { size: 18, w: 700, c: col, a: ip }); } }
        });
        g.text(q ? 'Mystery: C₃H₇Cl' : 'Ethanol, CH₃CH₂OH: integrals 3 : 2 : 1', 400, 70, { size: 22, w: 700 });
        if (!q) { g.text('triplet', ppmX(1.22, a, b), 330, { size: 14, c: C.acc }); g.text('quartet', ppmX(3.69, a, b), 330, { size: 14, c: C.blue }); g.text('O–H', ppmX(2.61, a, b), 380, { size: 14, c: C.green }); }
        else { g.text('6H', ppmX(1.51, a, b), 180, { size: 18, w: 700, c: C.acc }); g.text('1H', ppmX(4.14, a, b), 180, { size: 18, w: 700, c: C.blue }); }
      }
    }
  });
})();
