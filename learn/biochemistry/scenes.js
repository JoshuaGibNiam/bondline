/* Bondline lesson: biochemistry. Zwitterions, peptide bonds, protein folding, enzyme kinetics and DNA base pairing. */
(function () {
  'use strict';
  var PI = Math.PI;

  // ---------- 1. zwitterions and pH ----------
  var pHnow = 6;
  LX.scene('zwit', {
    fmt: { ph: function (v) { return v.toFixed(1); } },
    draw: function (g, st) {
      var C = g.col, pH = st.ctl('ph'); if (pH == null) pH = 6; pHnow += (pH - pHnow) * 0.15;
      var k1 = 2.34, k2 = 9.60, h = Math.pow(10, -pHnow), K1 = Math.pow(10, -k1), K2 = Math.pow(10, -k2), den = h * h + h * K1 + K1 * K2;
      var fc = h * h / den, fz = h * K1 / den, fa = K1 * K2 / den;
      // species card
      var sp = fc > fz && fc > fa ? 0 : fa > fz ? 2 : 1;
      var forms = [['H_3N^+', 'COOH', '+1', C.blue], ['H_3N^+', 'COO^−', '0', C.green], ['H_2N', 'COO^−', '−1', C.red]][sp];
      g.rich(forms[0] + '–CH_2–' + forms[1], 400, 90, { size: 34, w: 700 });
      g.text(['cation (low pH)', 'zwitterion', 'anion (high pH)'][sp] + '   ·   overall charge ' + forms[2], 400, 135, { size: 18, c: forms[3], w: 700 });
      // fraction plot
      var X0 = 90, X1 = 710, Y0 = 400, Hh = 200, px = function (v) { return X0 + v / 14 * (X1 - X0); };
      g.line(X0, Y0, X1, Y0, { c: C.mut, w: 2 }); for (var q = 0; q <= 14; q += 2) { g.line(px(q), Y0, px(q), Y0 + 8, { c: C.mut, w: 2 }); g.text(String(q), px(q), Y0 + 24, { size: 14, c: C.mut }); }
      g.text('pH', X1, Y0 + 46, { size: 15, c: C.mut, al: 'right' });
      [[C.blue, 'c'], [C.green, 'z'], [C.red, 'a']].forEach(function (s) {
        var pts = []; for (var v = 0; v <= 14; v += 0.1) { var hh = Math.pow(10, -v), dd = hh * hh + hh * K1 + K1 * K2, f = s[1] === 'c' ? hh * hh / dd : s[1] === 'z' ? hh * K1 / dd : K1 * K2 / dd; pts.push([px(v), Y0 - f * Hh]); }
        g.path(pts, { c: s[0], w: 3 });
      });
      g.line(px(pHnow), Y0 - Hh - 10, px(pHnow), Y0, { c: C.gold, w: 2, dash: [6, 6] });
      g.line(px(5.97), Y0 - Hh - 10, px(5.97), Y0, { c: C.mut, w: 1, dash: [3, 5] }); g.text('pI 5.97', px(5.97), Y0 - Hh - 22, { size: 14, c: C.mut });
      g.text('cation', px(0.8), Y0 - Hh + 10, { size: 15, c: C.blue }); g.text('zwitterion', px(6), Y0 - Hh + 30, { size: 15, c: C.green }); g.text('anion', px(13), Y0 - Hh + 10, { size: 15, c: C.red });
      // electrophoresis
      var net = fc - fa, ex = 400 + net * 200 * Math.sin(st.t * 1.5) * 0 + net * 220;
      g.rect(150, 500, 500, 40, { f: '#141c38', s: '#2e3a60', r: 8 }); g.text('−', 130, 520, { size: 30, w: 700, c: C.blue }); g.text('+', 670, 520, { size: 30, w: 700, c: C.red });
      var drift = 400 - net * 200 * (0.5 + 0.5 * Math.sin(st.t)); g.circle(drift, 520, 12, { f: forms[3] });
      g.text(Math.abs(net) < 0.05 ? 'At the pI it does not move in electrophoresis' : net > 0 ? 'Positive: moves to the negative electrode' : 'Negative: moves to the positive electrode', 400, 570, { size: 16, c: C.mut });
    }
  });

  // ---------- 2. peptide bond ----------
  var chain = ['G', 'A'], AAC = { G: '#8d98b3', A: '#c27a12', S: '#1f8a5b', F: '#7b4fc9', K: '#1f5fd1', D: '#d33f49', C: '#2fbf7a', W: '#9b59b6' };
  LX.scene('peptide', {
    act: function (n) { if (n === 'clear') chain = ['G']; else if (n.indexOf('add-') === 0 && chain.length < 12) chain.push(n.slice(4)); },
    draw: function (g, st) {
      var C = g.col, p = st.p;
      if (st.s === 'join') {
        var m = g.seg(p, 0.15, 0.55), w = g.seg(p, 0.55, 0.85), y = 250;
        var ax = 130 + 60 * m, bx = 470 - 60 * m;
        // glycine
        g.rich('H_2N', ax, y, { size: 26, w: 700 }); g.line(ax + 32, y, ax + 62, y, { w: 3 }); g.rich('CH_2', ax + 92, y, { size: 26, w: 700 }); g.line(ax + 124, y, ax + 154, y, { w: 3 });
        g.text('C', ax + 166, y, { size: 26, w: 700 }); g.line(ax + 162, y - 14, ax + 162, y - 50, { w: 3 }); g.line(ax + 170, y - 14, ax + 170, y - 50, { w: 3 }); g.text('O', ax + 166, y - 66, { size: 26, w: 700, c: '#ff8a8a' });
        // the OH that leaves
        var ohx = ax + 220 + w * 60, ohy = y + w * 130;
        if (w < 1) g.line(ax + 180, y, ax + 200, y, { w: 3, a: 1 - w });
        g.text('OH', ohx, ohy, { size: 26, w: 700, c: '#ff8a8a' });
        // alanine
        var hx = bx + 30 + w * -60, hy = y + w * 130;
        g.text('H', hx + (w ? 0 : 0), hy, { size: 26, w: 700, c: '#ff8a8a' }); if (w < 1) g.line(bx + 42, y, bx + 62, y, { w: 3, a: 1 - w });
        g.text('N', bx + 76, y, { size: 26, w: 700, c: '#8fb3ff' }); g.line(bx + 76, y + 16, bx + 76, y + 46, { w: 3 }); g.text('H', bx + 76, y + 62, { size: 22, w: 700 });
        g.line(bx + 92, y, bx + 122, y, { w: 3 }); g.text('CH', bx + 146, y, { size: 26, w: 700 }); g.line(bx + 146, y - 16, bx + 146, y - 46, { w: 3 }); g.rich('CH_3', bx + 150, y - 64, { size: 22, w: 700 });
        g.line(bx + 172, y, bx + 202, y, { w: 3 }); g.text('COOH', bx + 244, y, { size: 26, w: 700 });
        if (w > 0) { g.circle((ohx + hx) / 2 + 10, ohy, 46, { s: C.blue, w: 2, a: w }); g.rich('H_2O', (ohx + hx) / 2 + 10, ohy + 70, { size: 22, w: 700, c: C.blue, a: w }); }
        if (w >= 0.99) { g.line(ax + 180, y, bx + 62, y, { w: 3 }); g.rect(ax + 150, y - 90, (bx + 92) - (ax + 150), 130, { s: C.acc, w: 3, r: 14 }); g.text('peptide bond', (ax + 150 + bx + 92) / 2, y - 110, { size: 18, w: 700, c: C.acc }); }
        if (m < 1 && p < 0.15) g.text('glycine + alanine', 400, 470, { size: 20, c: C.mut });
        g.text(w >= 0.99 ? 'Gly-Ala: a dipeptide. Condensation: water is lost.' : 'COOH of one + NH₂ of the next', 400, 520, { size: 20, w: 700 });
      } else {
        var n = chain.length, bw = Math.min(60, 640 / n), x0 = 400 - (n - 1) * bw / 2;
        for (var i = 0; i < n; i++) {
          var x = x0 + i * bw, y2 = 260 + 30 * Math.sin(i * 0.9 + st.t);
          if (i) g.line(x - bw, 260 + 30 * Math.sin((i - 1) * 0.9 + st.t), x, y2, { c: C.acc, w: 4 });
          g.circle(x, y2, Math.min(24, bw * 0.42), { f: AAC[chain[i]] }); g.text(chain[i], x, y2, { size: 18, w: 700, c: '#fff' });
        }
        g.text('N-terminus', x0 - 20, 350, { size: 14, c: C.mut, al: 'right' }); g.text('C-terminus', x0 + (n - 1) * bw + 20, 350, { size: 14, c: C.mut, al: 'left' });
        g.text(n + ' amino acids · ' + (n - 1) + ' peptide bond' + (n === 2 ? '' : 's') + ' · ' + (n - 1) + ' water' + (n === 2 ? '' : 's') + ' released', 400, 440, { size: 21, w: 700 });
        g.text('Sequence: ' + chain.join('-'), 400, 480, { size: 18, c: C.mut });
        g.text('The order of amino acids is the protein’s primary structure', 400, 540, { size: 16, c: C.mut });
      }
    }
  });

  // ---------- 3. protein folding ----------
  var N = 26, TYPES = 'hpphhpchphhpcphhpphhpchhp'.split('').concat(['p']).slice(0, N); // h hydrophobic, p polar, c charged
  var lay = { line: [], helix: [], fold: [] }, temp = 37;
  (function build() {
    for (var i = 0; i < N; i++) {
      lay.line.push([100 + i * (600 / (N - 1)), 300]);
      var a = i * 100 * PI / 180; // 3.6 residues per turn of an α-helix
      lay.helix.push([150 + i * 19 + 26 * Math.cos(a), 300 + 75 * Math.sin(a)]);
      // compact fold: a spiral in sequence order, hydrophobic residues pulled into the core, polar ones pushed out
      var an = i * 0.62, r = 28 + 5.6 * i, ty = TYPES[i];
      r *= ty === 'h' ? 0.62 : ty === 'c' ? 1.12 : 1.05;
      lay.fold.push([400 + r * Math.cos(an), 300 + r * 0.9 * Math.sin(an)]);
    }
  })();
  LX.scene('fold', {
    fmt: { temp: function (v) { return Math.round(v) + ' °C'; } },
    draw: function (g, st) {
      var C = g.col, p = st.p, t = st.t, s = st.s, A, B, k;
      if (s === 'primary') { A = lay.line; B = lay.line; k = 0; }
      else if (s === 'secondary') { A = lay.line; B = lay.helix; k = g.seg(p, 0.1, 0.7); }
      else if (s === 'tertiary') { A = lay.helix; B = lay.fold; k = g.seg(p, 0.1, 0.7); }
      else { A = lay.fold; B = lay.line; var T0 = st.ctl('temp') || 37; temp += (T0 - temp) * 0.08; k = Math.max(0, Math.min(1, (temp - 50) / 30)); }
      var P = []; for (var i = 0; i < N; i++) { var j = s === 'denature' ? Math.sin(i * 7.3 + t * 3) * 25 * k : 0; P.push([g.lerp(A[i][0], B[i][0], k) + j, g.lerp(A[i][1], B[i][1], k) + j * Math.cos(i)]); }
      // bonds within the chain
      for (var i2 = 1; i2 < N; i2++) g.line(P[i2 - 1][0], P[i2 - 1][1], P[i2][0], P[i2][1], { c: '#5d6a8f', w: 4 });
      // interactions in the folded state
      var fk = s === 'tertiary' ? k : s === 'denature' ? 1 - k : 0;
      if (fk > 0.6) { [[2, 21], [9, 17]].forEach(function (pr) { g.line(P[pr[0]][0], P[pr[0]][1], P[pr[1]][0], P[pr[1]][1], { c: C.gold, w: 2, dash: [4, 6], a: (fk - 0.6) / 0.4 }); }); }
      if (s === 'secondary' && k > 0.7) for (var h = 0; h + 4 < N; h += 4) g.line(P[h][0], P[h][1], P[h + 4][0], P[h + 4][1], { c: C.blue, w: 1.5, dash: [3, 5], a: (k - 0.7) / 0.3 });
      for (var b = 0; b < N; b++) { var ty = TYPES[b]; g.circle(P[b][0], P[b][1], 15, { f: ty === 'h' ? '#c27a12' : ty === 'c' ? '#d33f49' : '#1f8a5b', s: 'rgba(255,255,255,.3)', w: 1.5 }); }
      var cap = { primary: 'Primary: just the sequence, a chain of amino acids', secondary: 'Secondary: an α-helix, held by H-bonds between C=O and N–H (blue)', tertiary: 'Tertiary: hydrophobic side chains (orange) hide inside; polar ones face the water', denature: temp > 60 ? 'Denatured: heat broke the weak interactions and the chain unfolded' : 'Folded and working. Heat it up to see what happens.' }[s];
      g.text(cap, 400, 530, { size: 18, w: 700 });
      g.text('● hydrophobic   ● polar   ● charged', 400, 570, { size: 15, c: C.mut });
    }
  });

  // ---------- 4. enzymes ----------
  LX.scene('enzyme', {
    fmt: { s: function (v) { return v.toFixed(1) + ' mM'; } },
    draw: function (g, st) {
      var C = g.col, t = st.t;
      if (st.s === 'fit') {
        var p = st.p, k = g.seg(p, 0.1, 0.5), clamp = g.seg(p, 0.5, 0.75), split = g.seg(p, 0.78, 0.98);
        // enzyme with an active site pocket
        var ex = 400, ey = 330, open = 1 - clamp * 0.45;
        g.x.save(); g.x.fillStyle = '#2b5a8a'; g.x.beginPath(); g.x.arc(ex, ey, 140, PI * (0.5 + 0.18 * open) + PI, PI * (0.5 - 0.18 * open) + PI + 2 * PI, false); g.x.lineTo(ex, ey - 40); g.x.closePath(); g.x.fill(); g.x.restore();
        g.text('enzyme', ex, ey + 70, { size: 20, w: 700 });
        var sx = g.lerp(150, ex, k), sy = g.lerp(110, ey - 130, k);
        if (split < 0.05) { g.rect(sx - 34, sy - 22, 68, 44, { f: C.acc, r: 8 }); g.text('substrate', sx, sy - 40, { size: 15, c: C.mut }); }
        else { g.rect(ex - 70 - 120 * split, ey - 160 - 80 * split, 34, 44, { f: C.gold, r: 8 }); g.rect(ex + 36 + 120 * split, ey - 160 - 80 * split, 34, 44, { f: C.gold, r: 8 }); g.text('products', ex, ey - 250, { size: 16, c: C.gold, a: split }); }
        g.text(k < 1 ? 'The substrate fits the active site…' : split > 0 ? '…the products leave; the enzyme is unchanged' : '…which closes around it (induced fit), straining bonds', 400, 540, { size: 19, w: 700 });
      } else {
        var S = st.ctl('s'); if (S == null) S = 2; var inh = st.ctl('inh') || 'none', Vm = 10, Km = 2, I = 1;
        var Kapp = inh === 'comp' ? Km * (1 + 2 * I) : Km, Vapp = inh === 'non' ? Vm / (1 + 2 * I) : Vm;
        var X0 = 100, X1 = 700, Y0 = 470, H = 330, sx2 = function (v) { return X0 + v / 20 * (X1 - X0); }, sy2 = function (v) { return Y0 - v / 11 * H; };
        g.line(X0, Y0, X1, Y0, { c: C.mut, w: 2 }); g.line(X0, Y0, X0, Y0 - H - 10, { c: C.mut, w: 2 });
        g.text('[S] / mM', X1, Y0 + 30, { size: 15, c: C.mut, al: 'right' }); g.text('rate', X0 - 10, Y0 - H - 20, { size: 15, c: C.mut, al: 'left' });
        var base = []; for (var v = 0; v <= 20; v += 0.2) base.push([sx2(v), sy2(Vm * v / (Km + v))]); g.path(base, { c: inh === 'none' ? C.acc : C.dim, w: 3 });
        if (inh !== 'none') { var cur = []; for (var v2 = 0; v2 <= 20; v2 += 0.2) cur.push([sx2(v2), sy2(Vapp * v2 / (Kapp + v2))]); g.path(cur, { c: C.acc, w: 3 }); }
        g.line(X0, sy2(Vapp), X1, sy2(Vapp), { c: C.gold, w: 1.5, dash: [6, 6] }); g.rich('V_{max}', X1 - 4, sy2(Vapp) - 16, { size: 16, c: C.gold, al: 'right' });
        g.line(sx2(Kapp), Y0, sx2(Kapp), sy2(Vapp / 2), { c: C.blue, w: 1.5, dash: [6, 6] }); g.line(X0, sy2(Vapp / 2), sx2(Kapp), sy2(Vapp / 2), { c: C.blue, w: 1.5, dash: [6, 6] }); g.rich('K_m', sx2(Kapp), Y0 + 18, { size: 16, c: C.blue });
        var r = Vapp * S / (Kapp + S); g.circle(sx2(S), sy2(r), 9, { f: C.acc });
        g.text('rate = ' + r.toFixed(1) + '  (' + Math.round(r / Vapp * 100) + '% of Vmax)', 400, 100, { size: 20, w: 700 });
        g.text({ none: 'No inhibitor', comp: 'Competitive: Km goes up, Vmax unchanged', non: 'Non-competitive: Vmax goes down, Km unchanged' }[inh], 400, 135, { size: 17, c: C.mut });
        g.text(S < Kapp ? 'Low [S]: rate rises almost in proportion to [S]' : S > 5 * Kapp ? 'High [S]: active sites saturated, rate levels off' : 'In between', 400, 540, { size: 17, c: C.mut });
      }
    }
  });

  // ---------- 5. DNA ----------
  var TPL = 'ATGCGTAC'.split(''), made = [], wrong = -1, wrongT = 0;
  var PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' }, BC = { A: '#d33f49', T: '#c27a12', G: '#1f8a5b', C: '#1f5fd1' };
  LX.scene('dna', {
    act: function (n) { if (n === 'reset') { made = []; return; } var b = n.slice(2); if (made.length >= TPL.length) return; if (PAIR[TPL[made.length]] === b) made.push(b); else { wrong = made.length; wrongT = performance.now(); } },
    draw: function (g, st) {
      var C = g.col, t = st.t, n = TPL.length;
      for (var i = 0; i < n; i++) {
        var x = 120 + i * 80, top = 170, bot = 390;
        g.rect(x - 26, top - 70, 52, 70, { f: BC[TPL[i]], r: 6 }); g.text(TPL[i], x, top - 35, { size: 24, w: 700, c: '#fff' });
        if (i < made.length) {
          g.rect(x - 26, bot, 52, 70, { f: BC[made[i]], r: 6 }); g.text(made[i], x, bot + 35, { size: 24, w: 700, c: '#fff' });
          var hb = (TPL[i] === 'G' || TPL[i] === 'C') ? 3 : 2;
          for (var k = 0; k < hb; k++) { var ox = (k - (hb - 1) / 2) * 12; g.line(x + ox, top + 10, x + ox, bot - 10, { c: C.mut, w: 2, dash: [5, 6] }); }
        } else if (i === made.length) {
          g.rect(x - 26, bot, 52, 70, { s: C.acc, w: 2, r: 6, a: 0.5 + 0.5 * Math.sin(t * 5) }); g.text('?', x, bot + 35, { size: 24, w: 700, c: C.acc });
          if (wrong === i && performance.now() - wrongT < 900) g.text('✗ doesn’t pair', x, bot + 100, { size: 16, w: 700, c: C.red });
        }
      }
      g.line(90, 100, 90 + n * 80 - 20, 100, { c: '#5d6a8f', w: 6 }); g.line(90, 460, 90 + n * 80 - 20, 460, { c: '#5d6a8f', w: 6 });
      g.text('template strand  5′ → 3′', 400, 70, { size: 16, c: C.mut }); g.text('new strand  3′ → 5′', 400, 500, { size: 16, c: C.mut });
      g.text(made.length >= n ? 'Done! A–T pairs have 2 H-bonds, G–C pairs have 3.' : 'Add the base that pairs with ' + TPL[made.length], 400, 555, { size: 20, w: 700, c: made.length >= n ? C.green : C.ink });
    }
  });
})();
