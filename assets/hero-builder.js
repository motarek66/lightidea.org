/* Home hero "Builder" board — Figma 1495:30760.
   A port of the SwarmPanel animation from "Home Hero.html", drawn on a <canvas>:
   three cursors build a dashboard, wipe it, build a list page, then an AI workflow, and loop.
   Same geometry, timing (680ms steps) and easing as the original CSS transitions. */
(function heroBuilder() {
  const board = document.querySelector('.hero__board');
  const canvas = board && board.querySelector('canvas');
  if (!canvas || !canvas.getContext) return;
  const ctx = canvas.getContext('2d');

  /* ---------- Board geometry (Figma units: board is 926.39 × 695.39, rulers at x 38.1 / y 47.63) ---------- */
  const BOARD_W = 926.39, RULER_X = 38.1, RULER_Y = 47.63;
  const STEP_MS = 680;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Easing: CSS cubic-bezier ---------- */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const sx = (t) => ((ax * t + bx) * t + cx) * t, sy = (t) => ((ay * t + by) * t + cy) * t;
    const dx = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x;
      for (let i = 0; i < 6; i++) { const e = sx(t) - x, d = dx(t); if (Math.abs(e) < 1e-4 || !d) break; t -= e / d; }
      return sy(Math.min(1, Math.max(0, t)));
    };
  }
  const OUT = bezier(0.22, 1, 0.36, 1), CUR_EASE = bezier(0.45, 0.05, 0.25, 1), EASE = bezier(0.25, 0.1, 0.25, 1);

  /* A value that eases toward its target like a CSS transition (restarts from where it is). */
  class Tween {
    constructor(v) { this.from = this.to = v; this.t0 = 0; this.dur = 0; this.delay = 0; this.ease = OUT; }
    set(v, now, dur, delay = 0, ease = OUT) {
      if (v === this.to) return;
      this.from = this.get(now); this.to = v; this.t0 = now; this.dur = dur; this.delay = delay; this.ease = ease;
    }
    get(now) {
      if (!this.dur) return this.to;
      const p = (now - this.t0 - this.delay) / this.dur;
      if (p <= 0) return this.from; if (p >= 1) return this.to;
      return this.from + (this.to - this.from) * this.ease(p);
    }
    busy(now) { return this.dur && now - this.t0 - this.delay < this.dur; }
  }

  /* ---------- Lucide icons (lucide-static 0.460.0, 24×24, stroke 2) ---------- */
  const ICONS = {
    'layout-grid': ['M4 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M15 3h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z', 'M15 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z', 'M4 14h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1z'],
    house: ['M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8', 'M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z'],
    'chart-column': ['M3 3v16a2 2 0 0 0 2 2h16', 'M18 17V9', 'M13 17V5', 'M8 17v-3'],
    users: ['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2', 'M13 7a4 4 0 1 1-8 0a4 4 0 1 1 8 0', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    'file-text': ['M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z', 'M14 2v4a2 2 0 0 0 2 2h4', 'M10 9H8', 'M16 13H8', 'M16 17H8'],
    bell: ['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9', 'M10.3 21a1.94 1.94 0 0 0 3.4 0'],
    ellipsis: ['M13 12a1 1 0 1 1-2 0a1 1 0 1 1 2 0', 'M20 12a1 1 0 1 1-2 0a1 1 0 1 1 2 0', 'M6 12a1 1 0 1 1-2 0a1 1 0 1 1 2 0'],
    'ellipsis-vertical': ['M13 12a1 1 0 1 1-2 0a1 1 0 1 1 2 0', 'M13 5a1 1 0 1 1-2 0a1 1 0 1 1 2 0', 'M13 19a1 1 0 1 1-2 0a1 1 0 1 1 2 0'],
    search: ['M19 11a8 8 0 1 1-16 0a8 8 0 1 1 16 0', 'm21 21-4.3-4.3'],
    play: ['M6 3 20 12 6 21 6 3z'],
    'git-branch': ['M6 3v12', 'M21 6a3 3 0 1 1-6 0a3 3 0 1 1 6 0', 'M9 18a3 3 0 1 1-6 0a3 3 0 1 1 6 0', 'M18 9a9 9 0 0 1-9 9'],
    bot: ['M12 8V4H8', 'M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2z', 'M2 14h2', 'M20 14h2', 'M15 13v2', 'M9 13v2'],
  };
  const ICON_PATHS = {};
  for (const k in ICONS) ICON_PATHS[k] = ICONS[k].map((d) => new Path2D(d));
  const CURSOR = new Path2D('M2 2 L17 8.5 L10.5 10.5 L8 17.5 Z');

  /* ---------- The three pages (verbatim from SwarmPanel) ---------- */
  const DEFS = [
    { blocks: [
      { k: 'side', x: 0, y: 0, w: 76, h: 640, c: 0 }, { k: 'title', x: 104, y: 30, w: 220, h: 44, c: 1 }, { k: 'btn', x: 600, y: 32, w: 80, h: 36, c: 2 },
      { k: 'kpi', x: 104, y: 92, w: 184, h: 92, c: 1 }, { k: 'kpi', x: 300, y: 92, w: 184, h: 92, c: 1, dup: 3 }, { k: 'kpi', x: 496, y: 92, w: 184, h: 92, c: 1, dup: 4 },
      { k: 'chart', x: 104, y: 200, w: 576, h: 184, c: 0 }, { k: 'rows', x: 104, y: 400, w: 380, h: 170, c: 2 }, { k: 'donut', x: 496, y: 400, w: 184, h: 170, c: 0 },
    ] },
    { blocks: [
      { k: 'title', x: 24, y: 26, w: 240, h: 44, c: 0 }, { k: 'btn', x: 600, y: 30, w: 88, h: 36, c: 2 }, { k: 'search', x: 24, y: 84, w: 300, h: 40, c: 1 },
      { k: 'chip', x: 340, y: 88, w: 84, h: 32, c: 2 }, { k: 'chip', x: 434, y: 88, w: 84, h: 32, c: 2, dup: 3 }, { k: 'chip', x: 528, y: 88, w: 84, h: 32, c: 2, dup: 4 },
      { k: 'thead', x: 24, y: 140, w: 664, h: 40, c: 0 }, { k: 'row', x: 24, y: 188, w: 664, h: 56, c: 1 },
      { k: 'row', x: 24, y: 252, w: 664, h: 56, c: 1, dup: 7 }, { k: 'row', x: 24, y: 316, w: 664, h: 56, c: 1, dup: 8 },
      { k: 'row', x: 24, y: 380, w: 664, h: 57, c: 0, dup: 9 }, { k: 'row', x: 24, y: 444, w: 664, h: 56, c: 0, dup: 10 }, { k: 'row', x: 24, y: 508, w: 664, h: 57, c: 2, dup: 11 },
    ] },
    { blocks: [
      { k: 'node', x: 32, y: 40, w: 190, h: 72, c: 0 }, { k: 'ai', x: 262, y: 196, w: 214, h: 104, c: 1 },
      { k: 'node', x: 510, y: 70, w: 180, h: 72, c: 2 }, { k: 'node', x: 510, y: 340, w: 180, h: 72, c: 2, dup: 2 },
      { k: 'node', x: 274, y: 430, w: 190, h: 72, c: 0 }, { k: 'prompt', x: 32, y: 300, w: 190, h: 180, c: 1 },
    ], edges: [[0, 1], [1, 2], [1, 3], [1, 4], [5, 1]] },
  ];

  function parts(k, w, h) {
    const G = '#eef0f3', D = '#e2e6eb', A = '#9cc8ea', P = [];
    const r = (x, y, pw, ph, rad, bg, extra) => P.push({ x, y, w: pw, h: ph, r: ph <= 24 && !(extra && extra.ic) ? ph / 2 : rad, bg, ...(extra || {}) });
    const ic = (x, y, s, name) => r(x, y, s, s, 0, 'transparent', { ic: name, fs: s - 6 });
    if (k === 'side') { ic(w / 2 - 15, 24, 30, 'layout-grid'); ['house', 'chart-column', 'users', 'file-text', 'bell'].forEach((n, i) => ic(w / 2 - 13, 88 + i * 54, 26, n)); }
    if (k === 'title') { r(0, 6, w * 0.78, 14, 7, D); r(0, 30, w * 0.5, 10, 5, G); }
    if (k === 'kpi') { r(18, 18, 64, 10, 5, G); r(18, 40, 96, 16, 8, D); r(18, h - 26, 48, 10, 5, G); }
    if (k === 'chart') { r(20, 20, 130, 12, 6, D); const H = [0.42, 0.55, 0.48, 0.66, 0.58, 0.74, 0.62, 0.8, 0.7, 0.92, 0.76, 0.84, 0.68, 0.88], n = H.length, bw = (w - 40) / n; H.forEach((v, i) => r(20 + i * bw, h - 18 - v * (h - 70), bw - 10, v * (h - 70), 6, i === 9 ? A : G)); }
    if (k === 'rows') { r(18, 18, 110, 12, 6, D); for (let i = 0; i < 3; i++) { const y = 46 + i * 38; r(18, y, 26, 26, 13, G); r(56, y + 2, w * 0.36, 10, 5, D); r(56, y + 16, w * 0.22, 8, 4, G); ic(w - 42, y + 1, 24, 'ellipsis'); } }
    if (k === 'donut') { r(18, 18, 80, 12, 6, D); r(w / 2 - 44, 46, 88, 88, 44, 'transparent', { ring: 12, ringBg: G, ringAccent: A }); }
    if (k === 'search') { ic(12, h / 2 - 11, 22, 'search'); r(42, h / 2 - 5, w * 0.45, 10, 5, G); }
    if (k === 'chip') { r(16, h / 2 - 5, w - 32, 10, 5, D); }
    if (k === 'thead') { [18, 232, 402, 562].forEach((x, i) => r(x, h / 2 - 5, i ? 56 : 80, 10, 5, D)); }
    if (k === 'row') { r(18, h / 2 - 15, 30, 30, 15, G); r(62, h / 2 - 10, 130, 10, 5, D); r(62, h / 2 + 5, 84, 8, 4, G); r(232, h / 2 - 5, 90, 10, 5, G); r(402, h / 2 - 5, 70, 10, 5, G); ic(w - 44, h / 2 - 12, 24, 'ellipsis-vertical'); }
    if (k === 'node') { ic(16, 20, 32, w > 185 ? 'play' : 'git-branch'); r(62, 24, w - 90, 10, 5, D); r(62, 42, (w - 90) * 0.6, 8, 4, G); }
    if (k === 'ai') { ic(18, 22, 40, 'bot'); r(70, 28, w - 98, 12, 6, D); r(70, 48, (w - 98) * 0.6, 10, 5, G); r(18, h - 26, w - 36, 8, 4, G); r(18, h - 26, (w - 36) * 0.64, 8, 4, A); }
    if (k === 'prompt') { r(14, 16, w * 0.7, 28, 14, G); r(w * 0.26, 54, w * 0.64, 40, 14, G); r(14, 106, w * 0.54, 28, 14, G); r(14, h - 42, w - 28, 30, 15, 'transparent', { stroke: D }); }
    return P;
  }

  const period = (def) => { const q = [0, 0, 0]; def.blocks.forEach((b) => q[b.c]++); return Math.max(...q.map((n, c) => c + 2 * n)) + 8; };
  const PERIODS = DEFS.map(period), TOTAL = PERIODS.reduce((a, b) => a + b, 0);

  function blockStyle(k) {
    if (k === 'title') return { bg: null, bd: null, r: 0 };
    if (k === 'side') return { bg: '#fff', bd: null, r: 0, inset: '#eceef1' };
    if (k === 'btn') return { bg: '#f0f1f4', bd: null, r: 99 };
    if (k === 'chip') return { bg: '#fff', bd: '#eceef1', r: 99 };
    if (k === 'thead') return { bg: '#f7f8fa', bd: null, r: 12 };
    return { bg: '#fff', bd: '#eceef1', r: 16 };
  }

  /* Target state for step t (the original build() + cycle()). */
  function frame(t) {
    let r = t % TOTAL, i = 0;
    while (r >= PERIODS[i]) { r -= PERIODS[i]; i++; }
    const def = DEFS[i], B = def.blocks, q = [[], [], []];
    B.forEach((b, bi) => q[b.c].push(bi));
    const t0 = r % PERIODS[i];
    const built = B.map(() => false), active = B.map(() => -1);
    const cursors = [0, 1, 2].map((c) => {
      const lt = t0 - c, rest = { x: 700, y: 140 + c * 130 };
      if (lt < 0) return rest;
      const step = Math.floor(lt / 2), ph = lt % 2;
      q[c].forEach((bi, k) => { if (k < step || (k === step && ph === 1)) built[bi] = true; if (k === step && ph === 1) active[bi] = c; });
      if (step >= q[c].length) { const lb = B[q[c][q[c].length - 1]]; return { x: lb.x + lb.w * 0.5 + 24, y: lb.y + lb.h * 0.5 + 18 }; }
      const b = B[q[c][step]], s = b.dup != null ? B[b.dup] : null;
      if (s) return ph ? { x: b.x + b.w / 2, y: b.y + b.h / 2 } : { x: s.x + s.w / 2, y: s.y + s.h / 2 };
      return ph ? { x: b.x + b.w, y: b.y + b.h } : { x: b.x, y: b.y };
    });
    const blocks = B.map((b, bi) => {
      const on = built[bi], s = b.dup != null ? B[b.dup] : null, pos = on || !s ? b : s;
      const st = blockStyle(b.k);
      const act = active[bi] >= 0 && b.k !== 'title';
      return {
        k: b.k, x: pos.x, y: pos.y, w: on || s ? b.w : 0, h: on || s ? b.h : 0, op: on ? 1 : 0,
        bg: act ? '#f6faff' : st.bg, bd: act ? 'rgba(1,106,180,.35)' : st.bd, r: st.r, inset: st.inset, act,
        parts: parts(b.k, b.w, b.h).map((p, j) => ({ ...p, tw: on ? p.w : 0, op: on ? 1 : 0, dl: on ? 250 + j * 45 : 0 })),
      };
    });
    const sels = B.map((b, bi) => (active[bi] < 0 ? null : { x: b.x, y: b.y, w: b.w, h: b.h })).filter(Boolean);
    const edges = (def.edges || []).map(([a, z]) => {
      const A = B[a], Z = B[z]; let x1, y1, x2, y2, c;
      if (Z.y > A.y + A.h && Math.abs((Z.x + Z.w / 2) - (A.x + A.w / 2)) < 60) { x1 = A.x + A.w / 2; y1 = A.y + A.h; x2 = Z.x + Z.w / 2; y2 = Z.y; c = [x1, (y1 + y2) / 2, x2, (y1 + y2) / 2]; }
      else { const fwd = Z.x > A.x; x1 = fwd ? A.x + A.w : A.x; y1 = A.y + A.h / 2; x2 = fwd ? Z.x : Z.x + Z.w; y2 = Z.y + Z.h / 2; const mx = (x1 + x2) / 2; c = [mx, y1, mx, y2]; }
      const on = built[a] && built[z];
      return { path: new Path2D(`M${x1} ${y1} C${c[0]} ${c[1]} ${c[2]} ${c[3]} ${x2} ${y2}`), x2, y2, off: on ? 0 : 700, op: on ? 1 : 0 };
    });
    return { blocks, sels, edges, cursors };
  }

  /* ---------- Live state: tweens keyed by index, like the original's keyed-by-index DOM ---------- */
  const live = { blocks: [], sels: [], edges: [], cursors: [0, 1, 2].map((c) => ({ x: new Tween(700), y: new Tween(140 + c * 130) })) };

  function apply(f, now, instant) {
    const T = (tw, v, dur, delay, ease) => (instant ? (tw.from = tw.to = v, tw.dur = 0) : tw.set(v, now, dur, delay, ease));
    live.blocks.length = f.blocks.length;
    f.blocks.forEach((b, i) => {
      let L = live.blocks[i];
      if (!L) L = live.blocks[i] = { x: new Tween(b.x), y: new Tween(b.y), w: new Tween(b.w), h: new Tween(b.h), op: new Tween(0), parts: [] };
      T(L.x, b.x, 700); T(L.y, b.y, 700); T(L.w, b.w, 600); T(L.h, b.h, 600); T(L.op, b.op, 300, 0, EASE);
      Object.assign(L, { k: b.k, bg: b.bg, bd: b.bd, r: b.r, inset: b.inset, act: b.act });
      L.parts.length = b.parts.length;
      b.parts.forEach((p, j) => {
        let P = L.parts[j];
        if (!P) P = L.parts[j] = { w: new Tween(0), op: new Tween(0) };
        T(P.w, p.tw, 500, p.dl); T(P.op, p.op, 300, p.dl, EASE);
        P.spec = p;
      });
    });
    live.sels.length = f.sels.length;
    f.sels.forEach((s, i) => {
      let S = live.sels[i];
      if (!S) S = live.sels[i] = { x: new Tween(s.x), y: new Tween(s.y), w: new Tween(s.w), h: new Tween(s.h) };
      T(S.x, s.x, 600); T(S.y, s.y, 600); T(S.w, s.w, 600); T(S.h, s.h, 600);
    });
    live.edges.length = f.edges.length;
    f.edges.forEach((e, i) => {
      let E = live.edges[i];
      if (!E) E = live.edges[i] = { off: new Tween(700), op: new Tween(0) };
      T(E.off, e.off, 1000); T(E.op, e.op, 400, 600, EASE);
      Object.assign(E, { path: e.path, x2: e.x2, y2: e.y2 });
    });
    f.cursors.forEach((c, i) => { T(live.cursors[i].x, c.x, 620, 0, CUR_EASE); T(live.cursors[i].y, c.y, 620, 0, CUR_EASE); });
  }

  /* ---------- Drawing ---------- */
  const rr = (x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.max(0, Math.min(r, w / 2, h / 2))); };

  function drawIcon(name, cx, cy, size) {
    const k = size / 24;
    ctx.save();
    ctx.translate(cx - size / 2, cy - size / 2); ctx.scale(k, k);
    ctx.strokeStyle = '#b9bfc8'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ICON_PATHS[name].forEach((p) => ctx.stroke(p));
    ctx.restore();
  }

  function drawBlock(L, now) {
    const x = L.x.get(now), y = L.y.get(now), w = L.w.get(now), h = L.h.get(now), op = L.op.get(now);
    if (op <= 0.001 || w < 0.5 || h < 0.5) return;
    ctx.save();
    ctx.globalAlpha = op;
    rr(x, y, w, h, L.r);
    if (L.bg) {
      if (L.act) { ctx.save(); ctx.shadowColor = 'rgba(1,106,180,.28)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 12; ctx.fillStyle = L.bg; ctx.fill(); ctx.restore(); }
      else { ctx.fillStyle = L.bg; ctx.fill(); }
    }
    ctx.save();
    rr(x, y, w, h, L.r); ctx.clip();
    if (L.inset) { ctx.fillStyle = L.inset; ctx.fillRect(x + w - 1, y, 1, h); }
    L.parts.forEach((P) => {
      const s = P.spec, pw = P.w.get(now), pop = P.op.get(now);
      if (pop <= 0.001 || pw < 0.5) return;
      const px = x + s.x, py = y + s.y;
      ctx.save();
      ctx.globalAlpha = op * pop;
      if (s.ic) {
        ctx.beginPath(); ctx.rect(px, py, pw, s.h); ctx.clip();
        drawIcon(s.ic, px + pw / 2, py + s.h / 2, s.fs);
      } else if (s.ring) {
        ctx.beginPath(); ctx.rect(px, py, pw, s.h); ctx.clip();
        const cx = px + s.w / 2, cy = py + s.h / 2, rad = s.w / 2 - s.ring / 2;
        ctx.lineWidth = s.ring;
        ctx.strokeStyle = s.ringBg; ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = s.ringAccent; ctx.beginPath(); ctx.arc(cx, cy, rad, -Math.PI * 0.75, Math.PI * 0.25); ctx.stroke();
      } else if (s.stroke) {
        rr(px + 0.5, py + 0.5, pw - 1, s.h - 1, s.r); ctx.strokeStyle = s.stroke; ctx.lineWidth = 1; ctx.stroke();
      } else {
        rr(px, py, pw, s.h, s.r); ctx.fillStyle = s.bg; ctx.fill();
      }
      ctx.restore();
    });
    ctx.restore();
    if (L.bd) { rr(x + 0.5, y + 0.5, w - 1, h - 1, Math.max(0, L.r - 0.5)); ctx.strokeStyle = L.bd; ctx.lineWidth = 1; ctx.stroke(); }
    ctx.restore();
  }

  function drawSel(S, now, cw, ch) {
    const x = S.x.get(now), y = S.y.get(now), w = S.w.get(now), h = S.h.get(now), C = '#016ab4';
    ctx.save();
    ctx.strokeStyle = C; ctx.lineWidth = 1;
    ctx.globalAlpha = 0.18; ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(-RULER_X, y + 0.5); ctx.lineTo(cw, y + 0.5); ctx.moveTo(x + 0.5, -RULER_Y); ctx.lineTo(x + 0.5, ch); ctx.stroke();
    ctx.globalAlpha = 1; ctx.setLineDash([]);
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.lineWidth = 1.5; ctx.fillStyle = '#fff';
    [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([hx, hy]) => { ctx.fillRect(hx - 4, hy - 4, 7, 7); ctx.strokeRect(hx - 4, hy - 4, 7, 7); });
    const label = Math.round(w) + ' × ' + Math.round(h);
    ctx.font = '500 11px Inter, system-ui, sans-serif';
    const bw = ctx.measureText(label).width + 14;
    rr(x + w / 2 - bw / 2, y + h + 8, bw, 20, 5); ctx.fillStyle = C; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h + 18.5);
    ctx.restore();
  }

  function drawCursor(c, now) {
    const x = c.x.get(now), y = c.y.get(now);
    ctx.save();
    ctx.translate(x - 2, y - 2); ctx.scale(1.3, 1.3);
    ctx.shadowColor = 'rgba(2,7,26,.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#14181f'; ctx.fill(CURSOR);
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.lineJoin = 'round'; ctx.stroke(CURSOR);
    ctx.restore();
  }

  let cssW = 0, cssH = 0, dpr = 1, units = BOARD_W;
  function resize() {
    const r = canvas.getBoundingClientRect();
    units = parseFloat(getComputedStyle(board).getPropertyValue('--board-units')) || BOARD_W;   /* 926.39 on desktop, 780 when stacked */
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    cssW = r.width; cssH = r.height;
    canvas.width = Math.round(cssW * dpr); canvas.height = Math.round(cssH * dpr);
  }

  function draw(now) {
    if (!cssW) return;
    const k = cssW / units;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);
    ctx.scale(k, k);
    const bw = units, bh = cssH / k;
    /* ruler guides */
    ctx.save();
    ctx.strokeStyle = 'rgba(1,106,180,.2)'; ctx.lineWidth = 1.19; ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, RULER_Y); ctx.lineTo(bw, RULER_Y); ctx.moveTo(RULER_X, 0); ctx.lineTo(RULER_X, bh); ctx.stroke();
    ctx.restore();
    /* artboard: content coordinates start at the ruler origin */
    ctx.translate(RULER_X, RULER_Y);
    const cw = bw - RULER_X, ch = bh - RULER_Y;
    live.edges.forEach((E) => {
      ctx.save();
      ctx.strokeStyle = '#e1e4e9'; ctx.lineWidth = 1.5; ctx.setLineDash([700, 700]); ctx.lineDashOffset = E.off.get(now);
      ctx.stroke(E.path);
      ctx.restore();
      const op = E.op.get(now);
      if (op > 0.001) { ctx.save(); ctx.globalAlpha = op; ctx.beginPath(); ctx.arc(E.x2, E.y2, 4, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#cdd2d9'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore(); }
    });
    live.blocks.forEach((L) => drawBlock(L, now));
    live.sels.forEach((S) => drawSel(S, now, cw, ch));
    live.cursors.forEach((c) => drawCursor(c, now));
  }

  /* ---------- Loop: step every 680ms, paused off-screen and in background tabs ---------- */
  let t = 0, acc = 0, last = 0, raf = 0, visible = false;
  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (last) acc += Math.min(now - last, 100);
    last = now;
    while (acc >= STEP_MS) { acc -= STEP_MS; t++; apply(frame(t), now - acc, false); }
    draw(now);
  }
  const start = () => { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  resize();
  if (REDUCED) {
    /* Static: the finished dashboard */
    apply(frame(PERIODS[0] - 1), 0, true);
    draw(0);
    new ResizeObserver(() => { resize(); draw(0); }).observe(canvas);
    return;
  }
  apply(frame(0), 0, true);
  new ResizeObserver(() => { resize(); draw(performance.now()); }).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting && e.boundingClientRect.width > 0; visible ? start() : stop(); }).observe(board);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (document.fonts) document.fonts.ready.then(() => draw(performance.now()));
})();
