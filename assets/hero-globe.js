/* Home hero globe (Figma 1507:28100) with country pins.
   - Scales the Figma-px stage to the hero (bottom-anchored on desktop, cropped to the region when stacked).
   - Places a pin on each country, links every office to the HQ with a soft arc.
   - Cycles through the countries on its own; hovering, focusing or tapping a pin shows that country
     and pauses the cycle until the pointer leaves. */
(function heroGlobe() {
  const globe = document.querySelector('.globe');
  if (!globe) return;
  const stage = globe.querySelector('.globe__stage');
  const svg = globe.querySelector('.globe__links');
  const pins = [...globe.querySelectorAll('.pin')];
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const STACKED = window.matchMedia('(max-width: 1099px)');
  const FIG_W = 1888, FIG_H = 948;
  const CROP = { x0: 1000, y0: 150, w: 888 };     /* region shown when the hero stacks */
  const CYCLE_MS = 2800;
  const NS = 'http://www.w3.org/2000/svg';

  const data = pins.map((el) => ({ el, x: +el.dataset.x, y: +el.dataset.y, lift: +el.dataset.lift, sx: 0, sy: 0 }));
  const hq = data.find((d) => d.el.classList.contains('pin--hq')) || data[0];

  /* ---------- SVG: gradient, one arc per office (HQ → office), comet ---------- */
  svg.innerHTML = '<defs><linearGradient id="globe-link" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f2762e"/><stop offset="1" stop-color="#5ee0ff"/></linearGradient></defs>';
  const grad = svg.querySelector('#globe-link');
  data.forEach((d) => {
    if (d === hq) return;
    d.link = document.createElementNS(NS, 'path');
    d.link.setAttribute('class', 'link');
    svg.appendChild(d.link);
  });
  const comet = document.createElementNS(NS, 'circle');
  comet.setAttribute('class', 'comet'); comet.setAttribute('r', '2.6'); comet.style.opacity = '0';
  svg.appendChild(comet);

  /* ---------- Layout ---------- */
  let k = 1;
  function layout() {
    const W = globe.clientWidth, H = globe.clientHeight;
    if (!W || !H) return;
    let ox, oy;
    if (STACKED.matches) { k = W / CROP.w; ox = -CROP.x0 * k; oy = -CROP.y0 * k; }
    else { k = W / FIG_W; ox = 0; oy = Math.max(0, H - FIG_H * k); }   /* exact Figma frame at 1888 × 948; taller heroes keep the globe on the bottom edge */
    globe.style.setProperty('--k', k);
    globe.style.setProperty('--ox', ox + 'px');
    globe.style.setProperty('--oy', oy + 'px');
    const s = Math.max(0.45, Math.min(1, k * 1.15));   /* line length scale for small screens */
    const EDGE = 10, ANCHOR = 22;                       /* label inset from the frame; flag centre over the line */
    data.forEach((d) => {
      d.sx = d.x * k + ox; d.sy = d.y * k + oy;
      d.el.style.transform = `translate(${d.sx}px, ${d.sy}px)`;
      const label = d.el.querySelector('.pin__label');
      const lw = label.offsetWidth, lh = label.offsetHeight;
      /* line length: scaled, but the label never rises above the top of the globe area */
      const lift = Math.max(24, Math.min(Math.round(d.lift * s), Math.floor(d.sy - lh - 12 - EDGE)));
      d.el.style.setProperty('--lift', lift + 'px');
      /* label sits to the right of its line; flips to the left near the right edge; always inside the frame */
      let left = d.sx - ANCHOR, flip = false;
      if (left + lw > W - EDGE) { left = d.sx + ANCHOR - lw; flip = true; }
      left = Math.max(EDGE, Math.min(left, W - EDGE - lw));
      d.el.classList.toggle('pin--flip', flip);
      label.style.left = (left - d.sx) + 'px';
      label.style.transformOrigin = `${d.sx - left}px 100%`;
    });
    data.forEach((d) => {
      if (!d.link) return;
      const x1 = hq.sx, y1 = hq.sy, x2 = d.sx, y2 = d.sy;
      const dist = Math.hypot(x2 - x1, y2 - y1), mx = (x1 + x2) / 2, my = Math.min(y1, y2) - Math.max(18, dist * 0.32);
      d.link.setAttribute('d', `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`);
      d.len = d.link.getTotalLength();
    });
    grad.setAttribute('x1', hq.sx); grad.setAttribute('y1', hq.sy);
    if (active) setGrad(active);
  }
  const setGrad = (d) => { grad.setAttribute('x2', d.sx); grad.setAttribute('y2', d.sy); };

  /* ---------- Active country ---------- */
  let active = null, idx = 0, timer = 0, paused = false, visible = true, cometT0 = 0, raf = 0;
  function activate(d) {
    if (active === d) return;
    if (active) { active.el.classList.remove('is-active'); if (active.link) active.link.classList.remove('link--on'); }
    active = d;
    d.el.classList.add('is-active');
    idx = data.indexOf(d);
    if (d.link) {
      setGrad(d);
      d.link.classList.add('link--on');
      if (!REDUCED) {   /* draw the arc in, then send a comet along it */
        d.link.style.transition = 'none';
        d.link.style.strokeDasharray = d.len; d.link.style.strokeDashoffset = d.len;
        d.link.getBoundingClientRect();
        d.link.style.transition = 'stroke-dashoffset 0.9s cubic-bezier(0.22, 1, 0.36, 1)';
        d.link.style.strokeDashoffset = 0;
        cometT0 = performance.now();
        if (!raf) raf = requestAnimationFrame(tick);
      }
    } else {
      comet.style.opacity = '0';
    }
    data.forEach((o) => { if (o.link && o !== d) { o.link.style.strokeDasharray = ''; o.link.style.strokeDashoffset = ''; o.link.style.transition = ''; } });
  }
  function tick(now) {
    raf = 0;
    const d = active;
    if (!d || !d.link || !visible) { comet.style.opacity = '0'; return; }
    const t = ((now - cometT0) % 1800) / 1800;          /* HQ → country, every 1.8s */
    const p = d.link.getPointAtLength(d.len * t);
    comet.setAttribute('cx', p.x); comet.setAttribute('cy', p.y);
    comet.style.opacity = String(Math.sin(Math.PI * t));
    raf = requestAnimationFrame(tick);
  }

  const next = () => activate(data[(idx + 1) % data.length]);
  function schedule() {
    clearInterval(timer);
    if (REDUCED || paused || !visible) return;
    timer = setInterval(next, CYCLE_MS);
  }

  /* hover: by distance to the pin anywhere over the hero, so the copy's boxes never block it */
  const hero = globe.closest('.hero') || document;
  const enter = (d) => { paused = true; clearInterval(timer); activate(d); };
  const leave = () => { paused = false; schedule(); };
  let hovered = null;
  const HOVER_R = 20;
  hero.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = globe.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    let best = null, bd = HOVER_R;
    data.forEach((d) => { const dd = Math.hypot(d.sx - x, d.sy - y); if (dd < bd) { bd = dd; best = d; } });
    if (best === hovered) return;
    hovered = best;
    hero.classList.toggle('is-pin-hover', !!best);
    best ? enter(best) : leave();
  });
  hero.addEventListener('pointerleave', () => { if (hovered) { hovered = null; hero.classList.remove('is-pin-hover'); leave(); } });

  /* keyboard focus and tap */
  data.forEach((d) => {
    const hit = d.el.querySelector('.pin__hit');
    hit.addEventListener('focus', () => enter(d));
    hit.addEventListener('blur', leave);
    hit.addEventListener('click', () => { activate(d); paused = false; schedule(); });
  });

  /* pause when the hero is off screen or the tab is hidden */
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) { schedule(); if (active && active.link && !REDUCED && !raf) raf = requestAnimationFrame(tick); }
    else clearInterval(timer);
  }).observe(globe);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearInterval(timer); else schedule(); });

  new ResizeObserver(layout).observe(globe);
  STACKED.addEventListener('change', layout);
  if (document.fonts) document.fonts.ready.then(layout);
  layout();

  /* start on the HQ once the globe has risen in */
  setTimeout(() => { activate(hq); schedule(); }, REDUCED ? 0 : 1700);
})();
