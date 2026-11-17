/* Inner pages: FAQ accordion, header intro, section reveals, footer reveal.
   Needs assets/site.js (REDUCED_MOTION, HAS_GSAP) loaded first. */
(function faq() {
  document.querySelectorAll('.faq-item').forEach((it) => {
    const q = it.querySelector('button.faq-q'), a = it.querySelector('.faq-a');
    if (!q || !a) return;   // questions without an answer are static rows
    q.addEventListener('click', () => {
      const open = !it.classList.contains('is-open');
      it.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', String(open));
      a.hidden = !open;
    });
  });
})();

(async function pageIntro() {
  const root = document.documentElement;
  if (!HAS_GSAP || REDUCED_MOTION) { root.classList.remove('motion-pending'); return; }
  await Promise.race([document.fonts.load('400 64px Inter'), new Promise((r) => setTimeout(r, 300))]);

  const EASE = 'power3.out';
  const words = new SplitText('.page-hero h1', { type: 'words', wordsClass: 'split-word' }).words;

  gsap.timeline({ defaults: { ease: EASE } })
    .from('.page-hero', { opacity: 0, scale: 0.97, y: 16, duration: 0.9, clearProps: 'transform' })
    .from('.nav__logo', { opacity: 0, scale: 0.92, filter: 'blur(10px)', duration: 0.6, clearProps: 'filter' }, 0.15)
    .from('.nav__links li, .nav__right', { opacity: 0, y: -12, duration: 0.5, stagger: 0.04, clearProps: 'transform' }, 0.25)
    .from('.crumbs', { opacity: 0, y: 14, filter: 'blur(6px)', duration: 0.55, clearProps: 'filter,transform' }, 0.35)
    .from(words, { opacity: 0, yPercent: 70, filter: 'blur(14px)', duration: 0.8, stagger: 0.05, clearProps: 'filter' }, 0.45)
    .from('.page-hero__lead', { opacity: 0, y: 20, filter: 'blur(8px)', duration: 0.7, clearProps: 'filter,transform' }, '-=0.5');
  root.classList.remove('motion-pending');

  const once = (trigger, start = 'top 85%') => ({ trigger, start, once: true });
  if (document.querySelector('.svc-grid')) {
    gsap.from('.svc-grid > *', { opacity: 0, y: 40, filter: 'blur(8px)', duration: 0.8, stagger: 0.05, ease: EASE, clearProps: 'filter,transform', scrollTrigger: once('.svc-grid', 'top 82%') });
  }
  if (document.querySelector('.faq-item')) {
    gsap.from('.faq__intro, .faq-item', { opacity: 0, y: 30, filter: 'blur(6px)', duration: 0.6, stagger: 0.08, ease: 'power2.out', clearProps: 'filter,transform', scrollTrigger: once('#faq', 'top 80%') });
  }
  if (document.querySelector('.contact__grid')) {
    gsap.from('#contact .section-head, .office, .form', { opacity: 0, y: 40, duration: 0.9, stagger: 0.1, ease: EASE, clearProps: 'transform', scrollTrigger: once('#contact', 'top 82%') });
  }
  if (document.querySelector('.cta-band')) {
    gsap.from('.cta-band__body > *', { opacity: 0, y: 24, filter: 'blur(8px)', duration: 0.7, stagger: 0.1, ease: EASE, clearProps: 'filter,transform', scrollTrigger: once('.cta-band', 'top 85%') });
  }

  gsap.timeline({ scrollTrigger: { trigger: '.footer', start: 'top 88%', once: true }, defaults: { ease: EASE } })
    .fromTo('.footer', { clipPath: 'inset(100% 0% 0% 0% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 24px)', duration: 1, clearProps: 'clipPath' })
    .from('.footer__grid > *, .footer__bottom', { opacity: 0, y: 25, filter: 'blur(8px)', duration: 0.6, stagger: 0.08, ease: 'power2.out', clearProps: 'filter,transform' }, '-=0.45');
})();
