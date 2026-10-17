// Motion only starts on visible content: no stylesheet ever hides pending items.
let initialized = false;

export function initSiteMotion() {
  if (initialized) return;
  initialized = true;
  const root = document.documentElement;
  const preference = window.matchMedia?.('(prefers-reduced-motion: reduce)');
  const active = new Map();
  const seen = new WeakSet();
  const targets = new Map();
  let observer;
  let frame = 0;
  let pageHeight = 0;
  const progress = document.querySelector('.site-scroll-progress');
  const reduced = () => Boolean(preference?.matches);

  function finish(element) {
    seen.add(element);
    observer?.unobserve(element);
    active.get(element)?.cancel();
    active.delete(element);
  }

  function revealTree(target) {
    if (!(target instanceof Element)) return;
    for (const element of targets.keys()) {
      if (element === target || element.contains(target) || target.contains(element)) finish(element);
    }
    for (const element of active.keys()) {
      if (element === target || element.contains(target) || target.contains(element)) finish(element);
    }
  }

  function enter(element, delay = 0, distance = 20, duration = 600) {
    if (reduced() || document.hidden || !element.animate || element.contains(document.activeElement)) return;
    active.get(element)?.cancel();
    try {
      const animation = element.animate([
        { opacity: 0.12, transform: `translateY(${distance}px)` },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration, delay, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
      active.set(element, animation);
      const cleanup = () => {
        if (active.get(element) === animation) active.delete(element);
      };
      animation.onfinish = cleanup;
      animation.oncancel = cleanup;
    } catch { /* Unsupported animation leaves the original element fully visible. */ }
  }

  const groups = [
    '.hero-content h1, .hero-description, .hero-actions > .cta',
    '.technology-label, .technology-heading, .technology-description',
    '.technology-map',
    '.technology-features > li',
    '.technology-cta',
    '.operation-label, .operation-heading, .operation-description',
    '.operation-card',
    '.operation-coverage',
    '.contact-label, .contact-heading',
    '.contact-field',
    '.contact-submit, .contact-privacy',
    '.footer-brand, .footer-column',
    '.footer-copyright, .footer-tagline, .footer-socials',
  ];
  for (const selector of groups) {
    document.querySelectorAll(selector).forEach((element, index) => {
      targets.set(element, Math.min(index * 80, 240));
    });
  }

  function revealHash() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (id) revealTree(document.getElementById(id));
  }
  document.addEventListener('focusin', (event) => revealTree(event.target));
  // Reveal the destination before the browser starts its native anchor navigation.
  document.addEventListener('click', (event) => {
    const link = event.target.closest?.('a[href^="#"]');
    if (!link) return;
    try { revealTree(document.getElementById(decodeURIComponent(link.hash.slice(1)))); } catch { /* Invalid fragment. */ }
  }, true);
  window.addEventListener('hashchange', revealHash);
  revealHash();

  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target)) continue;
        finish(entry.target);
        enter(entry.target, targets.get(entry.target));
      }
    }, { threshold: 0.08 });
    for (const element of targets.keys()) if (!seen.has(element)) observer.observe(element);
  }

  // Animate children only; the header/nav retain their original blend contexts.
  const nav = document.querySelector('#main-nav');
  const dialog = document.querySelector('#info-dialog');
  if ('MutationObserver' in window) {
    const openings = new MutationObserver((records) => {
      for (const record of records) {
        const container = record.target;
        const open = container === dialog ? dialog.open : nav.classList.contains('is-open');
        [...container.children].forEach((child, index) => {
          active.get(child)?.cancel();
          if (open) enter(child, Math.min(index * 40, 120), 12, 450);
        });
      }
    });
    if (nav) openings.observe(nav, { attributes: true, attributeFilter: ['class'] });
    if (dialog) openings.observe(dialog, { attributes: true, attributeFilter: ['open'] });
  }

  function drawProgress() {
    frame = 0;
    if (!progress) return;
    const fraction = pageHeight > 0 ? Math.max(0, Math.min(1, window.scrollY / pageHeight)) : 0;
    progress.style.transform = `scaleX(${fraction})`;
  }
  function queueProgress() {
    if (!frame && !document.hidden) frame = requestAnimationFrame(drawProgress);
  }
  function measureProgress() {
    pageHeight = Math.max(0, root.scrollHeight - window.innerHeight);
    queueProgress();
  }
  window.addEventListener('scroll', queueProgress, { passive: true });
  window.addEventListener('resize', measureProgress, { passive: true });
  window.addEventListener('load', measureProgress, { once: true });
  if ('ResizeObserver' in window) new ResizeObserver(measureProgress).observe(document.body);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      for (const element of active.keys()) finish(element);
      cancelAnimationFrame(frame);
      frame = 0;
    } else measureProgress();
  });
  function syncPreference() {
    root.classList.toggle('site-motion-reduced', reduced());
    if (reduced()) {
      for (const element of targets.keys()) finish(element);
      for (const element of active.keys()) finish(element);
      observer?.disconnect();
      // End an in-flight native smooth scroll when the preference changes.
      window.scrollTo({ top: window.scrollY, left: window.scrollX, behavior: 'instant' });
    }
  }
  preference?.addEventListener?.('change', syncPreference);
  syncPreference();
  root.classList.add('site-motion-ready');
  if (progress) progress.hidden = false;
  measureProgress();
}
