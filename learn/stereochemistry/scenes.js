/* Bondline lesson: stereochemistry. A 3D chiral centre (three.js r128) plus 2D scenes for optical activity, E/Z and diastereomers. */
(function () {
  'use strict';
  var PI = Math.PI;

  // ---------- 1. 3D chiral centre ----------
  var GROUPS = { Br: { c: 0xa33a3a, r: 0.42, pr: 1, z: 35 }, Cl: { c: 0x2f9a5e, r: 0.36, pr: 2, z: 17 }, F: { c: 0xb7d86b, r: 0.3, pr: 3, z: 9 }, H: { c: 0xe8ecf4, r: 0.24, pr: 4, z: 1 } };
  var DIRS = [[0, 1, 0], [0.943, -0.333, 0], [-0.471, -0.333, 0.816], [-0.471, -0.333, -0.816]];
  LX.scene('chiral', {
    own: true,
    init: function (g, ch) {
      var T = window.THREE, stage = ch.sec.querySelector('.lx-stage'), box = document.createElement('div');
      box.style.cssText = 'position:relative;width:100%;height:86vh;max-height:760px';
      stage.appendChild(box);
      var cv = document.createElement('canvas'), ov = document.createElement('canvas');
      cv.style.cssText = ov.style.cssText = 'position:absolute;inset:0;width:100%;height:100%';
      ov.style.pointerEvents = 'none'; box.appendChild(cv); box.appendChild(ov);
      var R; try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { box.innerHTML = '<p style="color:#aeb9d3;padding:40px">3D graphics (WebGL) are turned off in this browser.</p>'; return; }
      R.setPixelRatio(Math.min(2, devicePixelRatio || 1)); R.outputEncoding = T.sRGBEncoding;
      var scene = new T.Scene(), cam = new T.PerspectiveCamera(36, 1, 0.1, 50); cam.position.set(0, 0.4, 9); cam.lookAt(0, 0, 0);
      scene.add(new T.HemisphereLight(0xffffff, 0x223355, 0.85)); var dl = new T.DirectionalLight(0xffffff, 0.8); dl.position.set(3, 5, 6); scene.add(dl);
      function mol(groups) {
        var m = new T.Group(), parts = {};
        var c = new T.Mesh(new T.SphereGeometry(0.34, 32, 24), new T.MeshStandardMaterial({ color: 0x4a5578, roughness: 0.35 })); m.add(c);
        groups.forEach(function (gname, i) {
          var d = new T.Vector3().fromArray(DIRS[i]), G0 = GROUPS[gname];
          var bond = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 1.25, 12), new T.MeshStandardMaterial({ color: 0xc9d1e3, roughness: 0.5 }));
          bond.position.copy(d.clone().multiplyScalar(0.62)); bond.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d); m.add(bond);
          var s = new T.Mesh(new T.SphereGeometry(G0.r, 32, 24), new T.MeshStandardMaterial({ color: G0.c, roughness: 0.3 }));
          s.position.copy(d.clone().multiplyScalar(1.3)); m.add(s); s.userData = { name: gname, i: i }; parts[i] = s;
        });
        m.userData.parts = parts; return m;
      }
      var A = mol(['H', 'Br', 'Cl', 'F']), B = mol(['H', 'Br', 'Cl', 'F']);
      B.scale.set(-1, 1, 1); // mirror image
      scene.add(A); scene.add(B);
      var mirror = new T.Mesh(new T.PlaneGeometry(0.04, 4.2), new T.MeshBasicMaterial({ color: 0x9fc0ff, transparent: true, opacity: 0.5 })); scene.add(mirror);
      var mglass = new T.Mesh(new T.PlaneGeometry(4, 4.2), new T.MeshBasicMaterial({ color: 0x9fc0ff, transparent: true, opacity: 0.06, side: T.DoubleSide })); mglass.rotation.y = PI / 2; scene.add(mglass);
      ch.three = { T: T, R: R, scene: scene, cam: cam, A: A, B: B, mirror: mirror, mglass: mglass, ov: ov, box: box, sup: null, two: false };
      this.resize(ch);
    },
    resize: function (ch) { var k = ch.three; if (!k) return; var w = k.box.clientWidth, h = k.box.clientHeight; k.R.setSize(w, h, false); k.cam.aspect = w / h; k.cam.updateProjectionMatrix(); var d = Math.min(2, devicePixelRatio || 1); k.ov.width = w * d; k.ov.height = h * d; },
    on: function (name, v, ch) { if (name === 'sub') { var k = ch.three; k.B.scale.set(-1, 1, 1); k.two = v === 'F2'; [k.A, k.B].forEach(function (m) { var s = m.userData.parts[1]; s.material.color.set(k.two ? GROUPS.F.c : GROUPS.Br.c); s.scale.setScalar(k.two ? GROUPS.F.r / GROUPS.Br.r : 1); }); k.sup = null; } },
    act: function (name, ch) { if (name === 'super') ch.three.sup = { t0: performance.now() }; },
    enter: function (s, ch) { if (ch.three) { ch.three.sup = null; ch.three.B.scale.set(-1, 1, 1); } },
    draw: function (g, st) {
      var k = st.ch.three; if (!k) return; var T = k.T, t = st.t, s = st.s, p = st.p;
      var ox = k.ov.getContext('2d'), W = k.ov.width, H = k.ov.height, d = Math.min(2, devicePixelRatio || 1);
      ox.clearRect(0, 0, W, H);
      var spread = 1.9, showB = s !== 'rs' || st.ctl('which') === 'B';
      var rot = t * 0.5;
      k.mirror.visible = k.mglass.visible = (s === 'hands' || s === 'four');
      k.A.visible = s !== 'rs' || st.ctl('which') !== 'B';
      k.B.visible = s === 'hands' || s === 'four' || (s === 'rs' && showB);
      if (s === 'hands' || s === 'four') {
        k.A.position.set(-spread, 0, 0); k.B.position.set(spread, 0, 0);
        k.A.rotation.set(0.25, rot, 0); k.B.rotation.set(0.25, -rot, 0);
        if (k.sup) {
          var e = Math.min(1, (performance.now() - k.sup.t0) / 2200), ee = e < .5 ? 2 * e * e : 1 - Math.pow(-2 * e + 2, 2) / 2;
          k.B.position.x = spread - 2 * spread * ee; k.mirror.visible = k.mglass.visible = e < 0.3;
          k.A.rotation.set(0.25, 0.6, 0); k.B.rotation.set(0.25, 0.6, 0);
          // with two identical F groups the mirror image is the same molecule turned round, so it lines up exactly
          if (k.two && e >= 1) k.B.scale.set(1, 1, 1); else k.B.scale.set(-1, 1, 1);
          if (e >= 1) {
            ox.font = '700 ' + 26 * d + 'px "Bricolage Grotesque",sans-serif'; ox.textAlign = 'center';
            ox.fillStyle = k.two ? '#5fd39a' : '#ff6b6b';
            ox.fillText(k.two ? '✓ They match: superimposable, so achiral' : '✗ Can’t be made to match: chiral', W / 2, H * 0.88);
          }
        }
        label(k, k.A, ox, d, s === 'four' || true);
        if (k.B.visible) label(k, k.B, ox, d, true);
        ox.font = '600 ' + 15 * d + 'px "Bricolage Grotesque",sans-serif'; ox.fillStyle = '#8d98b3'; ox.textAlign = 'center'; ox.fillText('mirror', W / 2, H * 0.12);
      } else if (s === 'cip' || s === 'rs') {
        k.A.position.set(0, 0, 0); k.B.position.set(0, 0, 0);
        var m = k.B.visible ? k.B : k.A;
        // rotate so that H (index 0, pointing +y) points away from the viewer (-z)
        var q = s === 'rs' ? Math.min(1, p / 0.4) : 0, qe = q < .5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2;
        var spin = s === 'cip' ? rot : (1 - qe) * rot;
        m.rotation.set(-PI / 2 * qe + 0.25 * (1 - qe), spin, 0);
        label(k, m, ox, d, true, true);
        if (s === 'rs') {
          var sw = Math.max(0, Math.min(1, (p - 0.45) / 0.4));
          if (q >= 1 && sw > 0) {
            var P = [1, 2, 3].map(function (pr) { var i = idxOfPr(m, pr); return scr(k, m.userData.parts[i], W, H); });
            var cx = (P[0].x + P[1].x + P[2].x) / 3, cy = (P[0].y + P[1].y + P[2].y) / 3;
            var a0 = Math.atan2(P[0].y - cy, P[0].x - cx), a1 = Math.atan2(P[1].y - cy, P[1].x - cx), a2 = Math.atan2(P[2].y - cy, P[2].x - cx);
            var cross = (P[1].x - P[0].x) * (P[2].y - P[0].y) - (P[1].y - P[0].y) * (P[2].x - P[0].x), cw = cross > 0; // screen y points down
            var norm = function (a) { while (a < 0) a += 2 * PI; return a; };
            var span = cw ? norm(a2 - a0) : -norm(a0 - a2), rad = Math.min(W, H) * 0.3;
            ox.strokeStyle = '#ffc857'; ox.lineWidth = 5 * d; ox.beginPath();
            var end = a0 + span * sw; ox.arc(cx, cy, rad, a0, end, !cw); ox.stroke();
            var hx = cx + rad * Math.cos(end), hy = cy + rad * Math.sin(end), tang = end + (cw ? PI / 2 : -PI / 2);
            ox.fillStyle = '#ffc857'; ox.beginPath(); ox.moveTo(hx + 14 * d * Math.cos(tang), hy + 14 * d * Math.sin(tang)); ox.lineTo(hx + 10 * d * Math.cos(tang + 2.3), hy + 10 * d * Math.sin(tang + 2.3)); ox.lineTo(hx + 10 * d * Math.cos(tang - 2.3), hy + 10 * d * Math.sin(tang - 2.3)); ox.fill();
            if (sw >= 1) { ox.font = '700 ' + 30 * d + 'px "Bricolage Grotesque",sans-serif'; ox.textAlign = 'center'; ox.fillStyle = '#ffc857'; ox.fillText((cw ? 'Clockwise → R' : 'Anticlockwise → S'), W / 2, H * 0.9); }
          } else if (q < 1) { ox.font = '600 ' + 18 * d + 'px "Bricolage Grotesque",sans-serif'; ox.fillStyle = '#8d98b3'; ox.textAlign = 'center'; ox.fillText('Turning the molecule so H (priority 4) points away from you…', W / 2, H * 0.9); }
        }
      }
      k.R.render(k.scene, k.cam);
    }
  });
  function idxOfPr(m, pr) { var P = m.userData.parts; for (var i = 0; i < 4; i++) if (GROUPS[P[i].userData.name].pr === pr) return i; return 0; }
  function scr(k, obj, W, H) { var v = new k.T.Vector3(); obj.getWorldPosition(v); v.project(k.cam); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, z: v.z }; }
  function label(k, m, ox, d, show, prio) {
    if (!show) return; var W = ox.canvas.width, H = ox.canvas.height;
    for (var i = 0; i < 4; i++) {
      var s = m.userData.parts[i], nm = s.userData.name; if (k.two && i === 1) nm = 'F';
      var P = scr(k, s, W, H), G0 = GROUPS[nm];
      ox.font = '700 ' + 17 * d + 'px "Bricolage Grotesque",sans-serif'; ox.textAlign = 'center'; ox.textBaseline = 'middle';
      ox.fillStyle = nm === 'H' ? '#1a2240' : '#fff'; ox.fillText(nm, P.x, P.y);
      if (prio) { ox.fillStyle = '#ffc857'; ox.font = '700 ' + 15 * d + 'px "Bricolage Grotesque",sans-serif'; ox.fillText(String(G0.pr), P.x + 28 * d, P.y - 24 * d); }
    }
  }

  // ---------- 2. optical activity ----------
  var rotNow = 0;
  LX.scene('polar', {
    fmt: { c: function (v) { return v.toFixed(2) + ' g cm⁻³'; } },
    draw: function (g, st) {
      var C = g.col, t = st.t, c = st.ctl('c') || 0, form = st.ctl('form') || 'p', spec = 66.5; // sucrose-like specific rotation
      var target = (form === 'rac' ? 0 : (form === 'p' ? 1 : -1)) * spec * c * 1; rotNow += (target - rotNow) * 0.1;
      // light source, polariser, tube, analyser
      g.rect(30, 250, 60, 100, { f: '#2b3760', r: 10 }); g.text('lamp', 60, 370, { size: 15, c: C.mut });
      for (var x = 90; x < 180; x += 3) g.circle(x, 300 + 30 * Math.sin((x - t * 200) / 10) * Math.cos(x), 1.3, { f: C.gold, a: 0.6 });
      g.rect(180, 220, 18, 160, { f: '#46578c', r: 4 }); g.line(189, 230, 189, 370, { c: '#9fc0ff', w: 2 }); g.text('polariser', 189, 400, { size: 15, c: C.mut });
      var pts = []; for (var x2 = 200; x2 < 300; x2 += 2) pts.push([x2, 300 + 40 * Math.sin((x2 - t * 200) / 14)]); g.path(pts, { c: C.gold, w: 2.5 });
      g.rect(300, 255, 260, 90, { f: 'rgba(111,168,255,' + (0.08 + 0.3 * c) + ')', s: '#6f7fa8', r: 40 }); g.text('sample tube, 1 dm', 430, 375, { size: 15, c: C.mut });
      var pts2 = []; for (var x3 = 300; x3 < 560; x3 += 2) { var a = rotNow * (x3 - 300) / 260 * PI / 180; pts2.push([x3, 300 + 40 * Math.cos(a) * Math.sin((x3 - t * 200) / 14)]); } g.path(pts2, { c: C.gold, w: 2.5 });
      // dial
      var dx = 680, dy = 300, rr = 90; g.circle(dx, dy, rr, { s: C.mut, w: 3 });
      for (var d = -90; d <= 90; d += 30) { var an = (d - 90) * PI / 180; g.line(dx + (rr - 10) * Math.cos(an), dy + (rr - 10) * Math.sin(an), dx + rr * Math.cos(an), dy + rr * Math.sin(an), { c: C.mut, w: 2 }); }
      var an2 = (rotNow - 90) * PI / 180; g.line(dx - rr * 0.8 * Math.cos(an2), dy - rr * 0.8 * Math.sin(an2), dx + rr * 0.8 * Math.cos(an2), dy + rr * 0.8 * Math.sin(an2), { c: C.gold, w: 5 });
      g.text('analyser', dx, dy + rr + 26, { size: 15, c: C.mut });
      g.text('α = ' + (rotNow >= 0 ? '+' : '−') + Math.abs(rotNow).toFixed(1) + '°', 400, 470, { size: 30, w: 700, c: C.acc });
      g.text(form === 'rac' ? 'Racemic: the two enantiomers cancel out' : (form === 'p' ? 'The (+) enantiomer rotates the light clockwise' : 'Its mirror image rotates it the same amount the other way (−)'), 400, 515, { size: 18, c: C.mut });
      g.text('α = [α] × c × l', 400, 90, { size: 22, w: 700 });
    }
  });

  // ---------- 3. E/Z ----------
  var SUBS = ['H', 'CH₃', 'OH', 'Br'], PR = { 'H': 1, 'CH₃': 6, 'OH': 8, 'Br': 35 };
  var ez = { tl: 'CH₃', bl: 'H', tr: 'CH₃', br: 'H' };
  LX.scene('ez', {
    act: function (n) { if (ez[n]) ez[n] = SUBS[(SUBS.indexOf(ez[n]) + 1) % SUBS.length]; },
    draw: function (g, st) {
      var C = g.col, cx = 400, cy = 260;
      g.line(cx - 70, cy - 6, cx + 70, cy - 6, { w: 5 }); g.line(cx - 70, cy + 6, cx + 70, cy + 6, { w: 5 });
      var pos = { tl: [cx - 150, cy - 90], bl: [cx - 150, cy + 90], tr: [cx + 150, cy - 90], br: [cx + 150, cy + 90] };
      var hiL = PR[ez.tl] > PR[ez.bl] ? 'tl' : PR[ez.tl] < PR[ez.bl] ? 'bl' : null, hiR = PR[ez.tr] > PR[ez.br] ? 'tr' : PR[ez.tr] < PR[ez.br] ? 'br' : null;
      Object.keys(pos).forEach(function (k) {
        var P = pos[k], sx = k[1] === 'l' ? cx - 70 : cx + 70; g.line(sx, cy, P[0] + (k[1] === 'l' ? 30 : -30), P[1] + (k[0] === 't' ? 20 : -20), { w: 4 });
        var hi = k === hiL || k === hiR; g.circle(P[0], P[1], 40, { f: hi ? 'rgba(255,200,87,.25)' : '#1a2446', s: hi ? C.gold : '#2e3a60', w: 2 });
        g.text(ez[k], P[0], P[1], { size: 24, w: 700, c: hi ? C.gold : C.ink });
      });
      var res;
      if (!hiL || !hiR) res = 'Not E/Z: one carbon has two identical groups';
      else res = (hiL[0] === hiR[0]) ? 'Z (zusammen): higher priorities on the same side' : 'E (entgegen): higher priorities on opposite sides';
      g.text(res, 400, 450, { size: 22, w: 700, c: hiL && hiR ? C.acc : C.mut });
      var ct = '';
      if (hiL && hiR && ((ez.tl === 'H' || ez.bl === 'H') && (ez.tr === 'H' || ez.br === 'H'))) { var hl = ez.tl === 'H' ? 't' : 'b', hr = ez.tr === 'H' ? 't' : 'b'; ct = 'Also ' + (hl === hr ? 'cis' : 'trans') + ' (comparing the two non-H groups)'; }
      g.text(ct, 400, 490, { size: 17, c: C.mut });
      g.text('Tap a group in the card to change it. Gold = higher priority on that carbon.', 400, 560, { size: 15, c: C.mut });
      g.text('No rotation about C=C: the π bond would have to break', 400, 80, { size: 18, c: C.mut });
    }
  });

  // ---------- 4. diastereomers ----------
  var MOLS = {
    bc: { name: '2-bromo-3-chlorobutane', top: 'CH₃', bot: 'CH₃', x2: 'Br', x3: 'Cl', meso: false,
      // priorities at C2: Br > C3 > CH3(top) > H ; at C3: Cl > C2 > CH3(bottom) > H
      pr2: { X: 1, B: 2, T: 3, H: 4 }, pr3: { X: 1, T: 2, B: 3, H: 4 } },
    ta: { name: 'tartaric acid', top: 'COOH', bot: 'COOH', x2: 'OH', x3: 'OH', meso: true,
      // C2: OH > COOH(top) > C3 > H ; C3: OH > COOH(bottom) > C2 > H
      pr2: { X: 1, T: 2, B: 3, H: 4 }, pr3: { X: 1, B: 2, T: 3, H: 4 } }
  };
  var V = { T: [0, 1, -1], B: [0, -1, -1], L: [-1, 0, 1], R: [1, 0, 1] };
  function label3(side, pr) { // Fischer centre: X on side ('L' or 'R'), H opposite; returns 'R' or 'S'
    var pos = { X: side, H: side === 'L' ? 'R' : 'L', T: 'T', B: 'B' }, by = {};
    Object.keys(pr).forEach(function (k) { by[pr[k]] = V[pos[k]]; });
    var a = by[1], b = by[2], c = by[3], cr = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    return (cr[0] * c[0] + cr[1] * c[1] + cr[2] * c[2]) < 0 ? 'R' : 'S';
  }
  var sel = [];
  var COMBOS = [['R', 'L'], ['L', 'R'], ['R', 'R'], ['L', 'L']];
  LX.scene('dia', {
    on: function () { sel = []; },
    act: function (n) { var i = +n.slice(1); if (sel.indexOf(i) >= 0) sel = sel.filter(function (x) { return x !== i; }); else { sel.push(i); if (sel.length > 2) sel.shift(); } },
    draw: function (g, st) {
      var C = g.col, M = MOLS[st.ctl('mol') || 'bc'];
      g.text(M.name, 400, 40, { size: 22, w: 700 });
      var labs = COMBOS.map(function (cmb) { return label3(cmb[0], M.pr2) + label3(cmb[1], M.pr3); });
      COMBOS.forEach(function (cmb, i) {
        var bx = 30 + i * 187, by = 80, on = sel.indexOf(i) >= 0;
        g.rect(bx, by, 175, 330, { f: on ? 'rgba(255,200,87,.12)' : '#141c38', s: on ? C.gold : '#2e3a60', w: 2, r: 14 });
        var x = bx + 87, y1 = by + 120, y2 = by + 200;
        g.line(x, by + 50, x, by + 270, { w: 3 }); g.line(x - 55, y1, x + 55, y1, { w: 3 }); g.line(x - 55, y2, x + 55, y2, { w: 3 });
        g.text(M.top, x, by + 36, { size: 17 }); g.text(M.bot, x, by + 286, { size: 17 });
        g.text(cmb[0] === 'L' ? M.x2 : 'H', x - 72, y1, { size: 17, w: 700, c: cmb[0] === 'L' ? C.acc : C.ink }); g.text(cmb[0] === 'R' ? M.x2 : 'H', x + 72, y1, { size: 17, w: 700, c: cmb[0] === 'R' ? C.acc : C.ink });
        g.text(cmb[1] === 'L' ? M.x3 : 'H', x - 72, y2, { size: 17, w: 700, c: cmb[1] === 'L' ? C.blue : C.ink }); g.text(cmb[1] === 'R' ? M.x3 : 'H', x + 72, y2, { size: 17, w: 700, c: cmb[1] === 'R' ? C.blue : C.ink });
        g.text('(' + labs[i][0] + ',' + labs[i][1] + ')', x, by + 316, { size: 18, w: 700, c: C.gold });
        if (M.meso && labs[i][0] !== labs[i][1]) g.text('meso', x, by + 70, { size: 14, w: 700, c: C.green });
      });
      var msg = 'Tap two boxes in the card to compare them.';
      if (sel.length === 2) {
        var a = labs[sel[0]], b = labs[sel[1]], flip = function (s) { return s.replace(/R/g, 'x').replace(/S/g, 'R').replace(/x/g, 'S'); };
        var same = a === b || (M.meso && a[0] !== a[1] && b[0] !== b[1]);
        msg = same ? (M.meso && a[0] !== a[1] ? 'Identical: both are the meso compound (it has a mirror plane, so it is achiral)' : 'Identical') : (flip(a) === b ? 'Enantiomers: every centre is inverted' : 'Diastereomers: some centres differ, others are the same');
      }
      g.text(msg, 400, 470, { size: 19, w: 700, c: sel.length === 2 ? C.acc : C.mut });
      g.text(M.meso ? 'Only 3 stereoisomers: (R,R), (S,S) and one meso form' : '2 stereocentres → up to 2² = 4 stereoisomers', 400, 520, { size: 17, c: C.mut });
    }
  });
})();
