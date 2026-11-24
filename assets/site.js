/* Shared site script: smooth scroll, mobile side menu, sticky navbar, copper ribbon.
   Loaded by every page before any page-specific script. */
/* =====================================================================
   MOTION CORE — one smooth-scroll engine (Lenis) driven by GSAP's ticker,
   so ScrollTrigger and Lenis always agree on the scroll position.
   ===================================================================== */
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const HAS_GSAP = !!(window.gsap && window.ScrollTrigger && window.SplitText);
const lenis = (!REDUCED_MOTION && window.Lenis)
  ? new Lenis({ duration: 1.1, wheelMultiplier: 0.9, touchMultiplier: 1, smoothWheel: true, syncTouch: false, autoRaf: !HAS_GSAP })
  : null;
window.lenis = lenis;
if (HAS_GSAP) {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}

/* Smooth in-page anchors, leaving room for the sticky navbar */
function scrollToHash(hash) {
  const target = hash === '#' ? 0 : document.querySelector(hash);
  if (target === null) return;
  history.replaceState(null, '', hash === '#' ? location.pathname : hash);
  if (lenis) lenis.scrollTo(target, { offset: target === 0 ? 0 : -80 });
  else if (target === 0) window.scrollTo(0, 0);
  else target.scrollIntoView();
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || e.defaultPrevented) return;
  e.preventDefault();
  scrollToHash(a.getAttribute('href'));
});

/* ---------- Mobile side menu: the page shrinks to the left, links slide in ---------- */
(function sideMenu() {
  const root = document.documentElement;
  const app = document.getElementById('app');
  const menu = document.getElementById('side-menu');
  const buttons = [...document.querySelectorAll('.nav__menu, .sticky-nav__menu')];
  let btn = buttons[0];
  const links = [...menu.querySelectorAll('a')];
  let closing = null;

  const open = () => {
    if (closing) closing();                       // finish an unfinished close first
    lenis?.stop();
    const y = window.scrollY, vh = window.innerHeight;
    app.style.transformOrigin = `right ${y + vh / 2}px`;
    app.style.clipPath = `inset(${y}px 0 ${app.scrollHeight - y - vh}px 0 round 36px)`;
    root.classList.add('menu-open');
    app.inert = true;
    btn.setAttribute('aria-expanded', 'true');
    if (HAS_GSAP && !REDUCED_MOTION) {
      gsap.fromTo(links, { opacity: 0, x: 40, filter: 'blur(8px)' },
        { opacity: 1, x: 0, filter: 'blur(0px)', duration: 0.6, stagger: 0.06, delay: 0.15, ease: 'power3.out', clearProps: 'filter,transform' });
    }
    (links.find((l) => l.getAttribute('aria-current') === 'true') || links[0]).focus({ preventScroll: true });
  };

  // closes, waits for the page to grow back, then runs `then` (e.g. scroll to a section)
  const close = (focusButton = true, then) => {
    root.classList.remove('menu-open');
    root.classList.add('menu-closing');
    app.inert = false;
    btn.setAttribute('aria-expanded', 'false');
    const finish = () => {
      closing = null;
      root.classList.remove('menu-closing');
      app.style.transformOrigin = ''; app.style.clipPath = '';
      lenis?.start();
      btn.closest('.sticky-nav')?.classList.add('is-visible'); // menu was opened from the sticky bar
      if (focusButton) btn.focus({ preventScroll: true });
      if (then) then();
    };
    closing = finish;
    if (REDUCED_MOTION) return finish();
    const t = setTimeout(() => { if (closing === finish) finish(); }, 700);
    app.addEventListener('transitionend', (e) => {
      if (e.target === app && e.propertyName === 'transform' && closing === finish) { clearTimeout(t); finish(); }
    }, { once: true });
  };

  buttons.forEach((b) => b.addEventListener('click', () => { btn = b; open(); }));
  menu.querySelector('.side-menu__close').addEventListener('click', () => close());
  links.forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    links.forEach((l) => l.removeAttribute('aria-current'));
    a.setAttribute('aria-current', 'true');
    const href = a.getAttribute('href');
    // in-page anchors scroll; links to other pages navigate once the page has grown back
    close(false, () => (href.startsWith('#') ? scrollToHash(href) : (location.href = a.href)));
  }));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.classList.contains('menu-open')) close(); });
  window.matchMedia('(min-width: 1200px)').addEventListener('change', (m) => { if (m.matches && root.classList.contains('menu-open')) close(false); });
})();

/* ---------- Sticky navbar: hide on scroll down, show on scroll up ---------- */
(function stickyNav() {
  const bar = document.getElementById('sticky-nav');
  const hero = document.querySelector('.hero');
  let lastY = window.scrollY;
  const onScroll = () => {
    if (document.documentElement.classList.contains('menu-open')) return;
    const y = window.scrollY;
    const pastHero = y > hero.offsetTop + hero.offsetHeight - 64;
    if (!pastHero) bar.classList.remove('is-visible');          // the hero already has its own nav
    else if (y < lastY - 4) bar.classList.add('is-visible');    // scrolling up
    else if (y > lastY + 4) bar.classList.remove('is-visible'); // scrolling down
    if (Math.abs(y - lastY) > 4) lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  // jumping to a section from the bar scrolls down, so hide it right away
  bar.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener('click', () => bar.classList.remove('is-visible')));
})();

/* Copper ribbon: plays the CSS blur-in (.is-in) — the hero right away, the About card when it
   scrolls into view — and adds an eased pointer/scroll parallax to the hero ribbon. */
(() => {
  if (!document.documentElement.classList.contains('motion')) return;   // reduced motion: CSS shows it static

  const ribbons = [...document.querySelectorAll('.ribbon')].map((el) => ({ el, hero: !!el.closest('.hero'), played: false }));
  const play = (r) => {
    if (r.played) return;
    r.played = true;
    // let the hero shell finish its own intro first
    setTimeout(() => r.el.classList.add('is-in'), r.hero ? 450 : 0);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { play(ribbons.find((r) => r.el === e.target)); io.unobserve(e.target); }
  }), { threshold: 0.3 });
  ribbons.forEach((r) => {
    if (!r.hero) io.observe(r.el);
    else if (document.hidden) addEventListener('visibilitychange', () => play(r), { once: true });  // background tab
    else play(r);
  });
  // fail-safe: never leave the copper hidden on screen
  setTimeout(() => ribbons.forEach((r) => { if (r.el.getBoundingClientRect().top < innerHeight) play(r); }), 4000);

  const track = document.querySelector('.hero__ribbon .ribbon__track');
  const hero = document.querySelector('.hero');
  if (!track) return;
  let tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  const apply = () => {
    track.style.transform = `translate3d(${x.toFixed(2)}px, ${(y + Math.min(scrollY, 900) * 0.12).toFixed(2)}px, 0) rotate(${(x * 0.04).toFixed(3)}deg)`;
  };
  const tick = () => {
    x += (tx - x) * 0.06; y += (ty - y) * 0.06;   // ease 6% of the remaining distance per frame
    apply();
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.05 ? requestAnimationFrame(tick) : 0;
  };
  const wake = () => { if (!raf) raf = requestAnimationFrame(tick); };
  if (matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('pointermove', (e) => {
      const b = hero.getBoundingClientRect();
      tx = ((e.clientX - b.left) / b.width - 0.5) * -22;
      ty = ((e.clientY - b.top) / b.height - 0.5) * -16;
      wake();
    });
    hero.addEventListener('pointerleave', () => { tx = 0; ty = 0; wake(); });
  }
  addEventListener('scroll', apply, { passive: true });
})();

/* ---------- Offices: Abu Dhabi (HQ) · Riyadh · Muscat — tabs + autoplay with a smooth swap ---------- */
(function offices() {
  const box = document.querySelector('.office[data-offices]');
  if (!box) return;
  const OFFICES = {
    ae: { label: 'HEADQUARTERS', addr: 'Office 207, Al Nahyan Camp, Muroor Road, Abu Dhabi, United Arab Emirates P.O.BOX 110620',
          maps: 'Al+Nahyan+Camp+Muroor+Road+Abu+Dhabi', tel: '+971543711199', phone: '+971 54 371 1199' },
    sa: { label: 'SAUDI ARABIA OFFICE', addr: '7161 Alshaikh Hassan Bin Hussian Bin Ali, Ishbiliyah Dist, Kingdom of Saudi Arabia',
          maps: '7161+Alshaikh+Hassan+Bin+Hussian+Bin+Ali+Ishbiliyah+Riyadh+Saudi+Arabia', tel: '+966561112912', phone: '+966 56 111 2912' },
    // placeholder until the Muscat office address and phone are confirmed
    om: { label: 'OMAN OFFICE', addr: 'Muscat, Sultanate of Oman', maps: 'Muscat+Oman', tel: '', phone: '' },
  };
  const ORDER = ['ae', 'sa', 'om'];
  const DWELL = 6500;                                   // ms each office stays before the next one
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const card = box.querySelector('.office__card');
  const swap = box.querySelector('.office__swap');
  const label = box.querySelector('.office__label');
  const addr = box.querySelector('.office__addr');
  const dir = box.querySelector('.office__dir');
  const phone = box.querySelector('.office__phone');
  const map = box.querySelector('.office__map');
  const tabs = [...box.querySelectorAll('.office__tab')];
  const pins = [...box.querySelectorAll('.office__pin')];
  const hls = [...box.querySelectorAll('.office__hl')];
  let current = 'ae', busy = false;

  const fill = (k) => {
    const o = OFFICES[k];
    label.textContent = o.label;
    addr.textContent = o.addr;
    dir.href = 'https://www.google.com/maps/search/?api=1&query=' + o.maps;
    phone.hidden = !o.tel;
    if (o.tel) { phone.href = 'tel:' + o.tel; phone.querySelector('span').textContent = o.phone; }
  };
  const mark = (k) => {
    tabs.forEach((t) => { const on = t.dataset.office === k; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    pins.forEach((p) => p.classList.toggle('is-active', p.dataset.office === k));
    hls.forEach((h) => h.classList.toggle('is-active', h.dataset.office === k));
    const pin = pins.find((p) => p.dataset.office === k);
    map.style.setProperty('--fx', pin.style.getPropertyValue('--x'));
    map.style.setProperty('--fy', pin.style.getPropertyValue('--y'));
  };

  const show = (k) => {
    if (k === current || busy) return;
    current = k;
    mark(k);
    if (reduced) { fill(k); return; }
    busy = true;
    const from = card.offsetHeight;
    swap.classList.remove('is-in');
    swap.classList.add('is-out');
    setTimeout(() => {
      card.style.height = from + 'px';                      // freeze, swap the text, then ease to the new height
      fill(k);
      card.style.height = 'auto';
      const to = card.offsetHeight;
      card.style.height = from + 'px';
      card.offsetHeight;                                    // reflow
      card.style.height = to + 'px';
      swap.classList.remove('is-out');
      swap.classList.add('is-in');
      setTimeout(() => { card.style.height = ''; busy = false; }, 520);
    }, 260);
  };

  /* autoplay: runs while the card is on screen, pauses on hover / focus, stops after a manual pick */
  let timer = 0, start = 0, left = DWELL, visible = false, hovered = false, stopped = reduced, raf = 0;
  const bar = () => tabs.find((t) => t.dataset.office === current).querySelector('.office__tab-bar');
  const draw = () => {
    tabs.forEach((t) => { const b = t.querySelector('.office__tab-bar'); if (t.dataset.office !== current) b.style.transform = 'scaleX(0)'; });
    if (stopped) { bar().style.transform = 'scaleX(0)'; return; }
    const done = DWELL - left + (timer ? performance.now() - start : 0);
    bar().style.transform = `scaleX(${Math.min(1, done / DWELL)})`;
    if (timer) raf = requestAnimationFrame(draw);
  };
  const run = () => {
    if (stopped || !visible || hovered || timer) return;
    start = performance.now();
    timer = setTimeout(() => { timer = 0; left = DWELL; show(ORDER[(ORDER.indexOf(current) + 1) % ORDER.length]); run(); }, left);
    cancelAnimationFrame(raf); raf = requestAnimationFrame(draw);
  };
  const pause = () => {
    if (!timer) return;
    clearTimeout(timer); timer = 0; left = Math.max(0, left - (performance.now() - start));
    cancelAnimationFrame(raf); draw();
  };
  const stop = () => { stopped = true; pause(); draw(); };

  tabs.forEach((t, i) => {
    t.addEventListener('click', () => { stop(); show(t.dataset.office); });
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); stop(); show(n.dataset.office);
    });
  });
  box.addEventListener('pointerenter', () => { hovered = true; pause(); });
  box.addEventListener('pointerleave', () => { hovered = false; run(); });
  box.addEventListener('focusin', () => { hovered = true; pause(); });
  box.addEventListener('focusout', () => { hovered = false; run(); });
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? run() : pause(); }, { threshold: 0.4 }).observe(box);
  document.addEventListener('visibilitychange', () => (document.hidden ? pause() : run()));
  mark(current);
})();
