/* Bondline lesson: substitution mechanisms. SN2 and SN1 played by scrolling, with energy profiles, and an SN1-or-SN2 predictor. */
(function () {
  'use strict';
  function profile(g, x0, y0, w, h, humps, pos, col) {
    // humps: [[x(0–1), height(0–1)], …] with valleys between; pos 0–1 marks the progress dot
    var C = g.col, pts = [], f = function (u) { var y = 0; humps.forEach(function (hp) { y = Math.max(y, hp[1] * Math.exp(-Math.pow((u - hp[0]) / 0.11, 2))); }); var base = humps.length > 1 ? 0.35 * Math.exp(-Math.pow((u - 0.5) / 0.07, 2)) : 0; return Math.max(y, base) - 0.15 * u; };
    for (var u = 0; u <= 1.0001; u += 0.01) pts.push([x0 + u * w, y0 - (f(u) + 0.2) * h]);
    g.line(x0, y0, x0 + w, y0, { c: C.mut, w: 2 }); g.line(x0, y0, x0, y0 - h * 1.25, { c: C.mut, w: 2 });
    g.text('energy', x0 + 6, y0 - h * 1.25 - 12, { size: 14, c: C.mut, al: 'left' }); g.text('reaction progress →', x0 + w, y0 + 22, { size: 14, c: C.mut, al: 'right' });
    g.path(pts, { c: col || C.acc, w: 3 });
    g.circle(x0 + pos * w, y0 - (f(pos) + 0.2) * h, 9, { f: C.gold });
  }
  function centre(g, cx, cy, flip, planar, grp, a) { // carbon with three groups; flip −1…1 is the umbrella
    var C = g.col;
    var ang = [[-0.8, -0.9], [-0.8, 0.9], [0, 0]];
    grp.forEach(function (gname, i) {
      var dx = planar ? (i === 2 ? 0 : 0) : flip * 50, dy = i === 0 ? -70 : i === 1 ? 70 : 0, dz = i === 2 ? 1 : 0;
      var x = cx + (i === 2 ? flip * 40 - 0 : flip * 42), y = cy + (i === 0 ? -66 : i === 1 ? 62 : 0);
      if (i === 2) { x = cx + flip * 30; y = cy + 4; }
      g.line(cx, cy, x, y, { w: 4, a: a });
      g.atom(x + (i === 2 ? flip * 8 : 0), y, gname, gname === 'H' ? '#6b7690' : '#4a5578', gname === 'H' ? 18 : 24, a);
    });
    g.atom(cx, cy, 'C', '#4a5578', 24, a);
  }
  LX.scene('sn2', {
    draw: function (g, st) {
      var C = g.col, p = st.p, k = g.seg(p, 0.1, 0.9), cx = 400, cy = 200;
      var nuX = g.lerp(150, cx - 110, Math.min(1, k * 2)), lgX = cx + 110 + Math.max(0, k - 0.5) * 2 * 140, flip = Math.cos(Math.min(1, Math.max(0, (k - 0.35) / 0.3)) * Math.PI);
      // partial bonds at the transition state
      if (k > 0.35 && k < 0.65) { g.line(nuX + 26, cy, cx - 24, cy, { w: 3, dash: [6, 6] }); g.line(cx + 24, cy, lgX - 26, cy, { w: 3, dash: [6, 6] }); g.text('‡', cx, cy - 110, { size: 30, c: C.gold }); g.text('transition state: 5 groups around C', cx, cy + 120, { size: 16, c: C.gold }); }
      else if (k >= 0.65) g.line(nuX + 26, cy, cx - 24, cy, { w: 4 }); else g.line(cx + 24, cy, lgX - 26, cy, { w: 4 });
      // the three groups flip like an umbrella in the wind
      [['H', -66], ['H', 66], ['CH_3', 0]].forEach(function (gr, i) {
        var off = 46 * flip, y = cy + (i === 2 ? 0 : gr[1]) + (i === 2 ? 0 : 0), x = cx + (i === 2 ? off * 0.2 : off);
        if (i === 2) { x = cx + 12 * flip; y = cy + 78; }
        g.line(cx, cy, x, y, { w: 4 }); g.atom(x, y, gr[0], gr[0] === 'H' ? '#6b7690' : '#4a5578', gr[0] === 'H' ? 17 : 22);
      });
      g.atom(cx, cy, 'C', '#4a5578', 24);
      g.atom(nuX, cy, 'HO', '#c0444f', 26); if (k < 0.35) g.text('−', nuX + 24, cy - 24, { size: 22, w: 700, c: C.red });
      g.atom(lgX, cy, 'Br', '#a33a3a', 28); if (k > 0.65) g.text('−', lgX + 26, cy - 26, { size: 22, w: 700, c: C.red });
      if (k < 0.3) { g.curly(nuX + 10, cy - 30, cx - 20, cy - 22, -0.5, { k: 1 }); g.curly(cx + 34, cy - 10, lgX + 4, cy - 34, -0.6, { k: 1 }); }
      g.text(k < 0.3 ? 'Hydroxide attacks from the back, opposite the Br' : k < 0.65 ? 'One step: the new bond forms as the old one breaks' : 'Inversion: the carbon turned inside out (Walden inversion)', 400, 40, { size: 19, w: 700 });
      profile(g, 160, 560, 480, 110, [[0.5, 1]], k, C.acc);
      g.rich('rate = k[CH_3CH_2Br][OH^−]  (second order)', 400, 76, { size: 16, c: C.mut });
    }
  });
  LX.scene('sn1', {
    draw: function (g, st) {
      var C = g.col, p = st.p, k1 = g.seg(p, 0.05, 0.4), k2 = g.seg(p, 0.55, 0.92), cx = 400, cy = 210;
      var lgX = cx + 100 + k1 * 160;
      if (k1 < 1) g.line(cx + 24, cy, lgX - 26, cy, { w: 4, a: 1 - k1 });
      if (k1 < 0.3) g.curly(cx + 30, cy - 10, lgX + 2, cy - 34, -0.6);
      var flat = k1; // the cation is planar
      [['CH_3', 0], ['CH_3', 1], ['CH_3', 2]].forEach(function (gr, i) {
        var an = [-2.1, 2.1, Math.PI][i], r = 80, x = cx + r * Math.cos(an) * (0.6 + 0.4 * flat) - (1 - flat) * 10, y = cy + r * Math.sin(an) * (i === 2 ? 0 : 1) * (0.8 + 0.2 * flat);
        if (i === 2) { x = cx - 78; y = cy; }
        g.line(cx, cy, x, y, { w: 4 }); g.atom(x, y, gr[0], '#4a5578', 22);
      });
      g.atom(cx, cy, 'C', k1 > 0.9 && k2 < 0.2 ? '#b0503f' : '#4a5578', 24);
      g.atom(lgX, cy, 'Br', '#a33a3a', 28); if (k1 > 0.6) g.text('−', lgX + 26, cy - 26, { size: 22, w: 700, c: C.red });
      if (k1 > 0.9 && k2 < 0.3) { g.text('+', cx + 24, cy - 26, { size: 24, w: 700, c: C.acc }); g.text('planar carbocation', cx, cy + 110, { size: 16, c: C.acc }); }
      if (k2 > 0) {
        var a = Math.min(1, k2 * 1.4);
        g.atom(cx, g.lerp(cy - 200, cy - 70, k2), 'OH', '#c0444f', 22, a); g.atom(cx, g.lerp(cy + 200, cy + 70, k2), 'OH', '#c0444f', 22, a);
        g.text('attack from the top: 50%', cx + 120, cy - 120, { size: 15, c: C.mut, a: a }); g.text('attack from the bottom: 50%', cx + 120, cy + 130, { size: 15, c: C.mut, a: a });
      }
      g.text(k1 < 1 ? 'Step 1 (slow): Br⁻ leaves on its own' : k2 < 0.3 ? 'The flat carbocation waits for a nucleophile' : 'Step 2 (fast): water attacks either face → racemic mixture', 400, 40, { size: 19, w: 700 });
      profile(g, 160, 560, 480, 110, [[0.3, 1], [0.72, 0.7]], p < 0.5 ? k1 * 0.5 : 0.5 + k2 * 0.5, C.blue);
      g.rich('rate = k[(CH_3)_3CBr]  (first order)', 400, 76, { size: 16, c: C.mut });
    }
  });
  var SUB = { me: ['methyl', 'CH₃Br', 1, 0], p: ['primary', 'CH₃CH₂Br', 0.8, 0.02], s: ['secondary', '(CH₃)₂CHBr', 0.35, 0.4], t: ['tertiary', '(CH₃)₃CBr', 0, 1] };
  LX.scene('choose', {
    draw: function (g, st) {
      var C = g.col, s = st.ctl('sub') || 'p', nu = st.ctl('nu') || 'strong', sol = st.ctl('sol') || 'aprotic';
      var S = SUB[s], sn2 = S[2] * (nu === 'strong' ? 1 : 0.3) * (sol === 'aprotic' ? 1 : 0.6), sn1 = S[3] * (sol === 'protic' ? 1 : 0.3) * (nu === 'weak' ? 1 : 0.6);
      g.text(S[1], 400, 70, { size: 34, w: 700 }); g.text(S[0] + ' halogenoalkane', 400, 110, { size: 17, c: C.mut });
      var bar = function (y, v, lab, col) { g.text(lab, 170, y + 22, { size: 20, w: 700, al: 'right' }); g.rect(190, y, 460, 44, { f: '#141c38', r: 10 }); g.rect(190, y, Math.max(4, 460 * v), 44, { f: col, r: 10 }); };
      bar(180, sn2, 'SN2', C.acc); bar(250, sn1, 'SN1', C.blue);
      var win = sn2 > sn1 * 1.4 ? 'SN2' : sn1 > sn2 * 1.4 ? 'SN1' : 'a mixture of SN1 and SN2';
      g.text('Expect: ' + win, 400, 350, { size: 26, w: 700, c: win === 'SN2' ? C.acc : win === 'SN1' ? C.blue : C.gold });
      var why = [];
      why.push(s === 't' ? 'Tertiary: too crowded for a back-side attack, but the 3° carbocation is stable.' : s === 'me' || s === 'p' ? 'Little crowding at the carbon, and the carbocation would be unstable.' : 'Secondary: in between, so the conditions decide.');
      why.push(nu === 'strong' ? 'A strong nucleophile (e.g. OH⁻, CN⁻) favours SN2.' : 'A weak nucleophile (e.g. H₂O, ethanol) waits for a carbocation: SN1.');
      why.push(sol === 'aprotic' ? 'Polar aprotic solvents (acetone, DMSO) leave the nucleophile “naked” and reactive: SN2.' : 'Polar protic solvents (water, alcohols) stabilise the carbocation and leaving group: SN1.');
      why.forEach(function (w, i) { g.text(w, 400, 420 + i * 42, { size: 16, c: C.mut }); });
    }
  });
})();
