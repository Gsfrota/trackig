// Progressive enhancement: the motorcycle remains visible without JavaScript
// or when either photographic asset cannot be decoded.
export function initHeroMobileCarousel() {
  const carousel = document.querySelector('.hero-mobile-carousel');
  if (!carousel || carousel.dataset.initialized) return;
  carousel.dataset.initialized = 'true';
  const hero = carousel.closest('.hero-shell');
  const controls = carousel.querySelector('.hero-mobile-controls');
  const toggle = carousel.querySelector('[data-hero-toggle]');
  const announcement = carousel.querySelector('.hero-mobile-announcement');
  const picture = carousel.querySelector('.hero-mobile-base');
  const mobile = matchMedia('(max-width:767px)');
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let manuallyPaused = reduced.matches;
  let visible = false;
  let hovering = false;
  let ready = false;
  let loading = false;
  let timer = null;
  let gesture = null;

  function blocked() {
    return !ready || !mobile.matches || !visible || document.hidden || manuallyPaused || hovering
      || hero.contains(document.activeElement)
      || hero.querySelector('.menu-toggle')?.getAttribute('aria-expanded') === 'true'
      || Boolean(document.querySelector('dialog[open]'));
  }

  function schedule() {
    clearTimeout(timer);
    timer = null;
    carousel.dataset.paused = String(manuallyPaused);
    toggle.setAttribute('aria-pressed', String(manuallyPaused));
    toggle.setAttribute('aria-label', manuallyPaused ? 'Iniciar alternância automática' : 'Pausar alternância automática');
    if (!blocked()) timer = setTimeout(() => { change(false); }, 5000);
  }

  function change(manual) {
    if (!ready || !mobile.matches) return;
    const car = carousel.dataset.vehicle !== 'car';
    carousel.dataset.vehicle = car ? 'car' : 'motorcycle';
    picture.setAttribute('aria-label', `${car ? 'Carro' : 'Moto'} com rastreamento TrackIG e celular ilustrativo, em cenário escuro.`);
    if (manual) announcement.textContent = `${car ? 'Carro' : 'Moto'}, veículo ${car ? '2' : '1'} de 2.`;
    schedule();
  }

  const loadImage = (url) => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => img.decode().then(resolve, reject);
    img.onerror = reject;
    img.src = new URL(url, import.meta.url).href;
  });

  async function prepare() {
    if (loading || !mobile.matches) { schedule(); return; }
    loading = true;
    try {
      await Promise.all([loadImage('./hero-mobile-motorcycle.jpg'), loadImage('./hero-mobile-car.jpg'), loadImage('./hero-mobile-vehicle-mask.svg')]);
      // Unsupported masks would replace the fixed phone, so retain the fallback.
      if (!CSS.supports('mask-image', 'url("x.svg")')) return;
      ready = true;
      controls.hidden = false;
      schedule();
    } catch {
      controls.hidden = true;
      carousel.dataset.vehicle = 'motorcycle';
    }
  }

  carousel.querySelector('[data-hero-previous]').addEventListener('click', () => change(true));
  carousel.querySelector('[data-hero-next]').addEventListener('click', () => change(true));
  toggle.addEventListener('click', () => { manuallyPaused = !manuallyPaused; schedule(); });
  carousel.addEventListener('pointerdown', (event) => {
    if (event.target.closest('button') || !event.isPrimary) return;
    gesture = { x: event.clientX, y: event.clientY, id: event.pointerId };
  });
  carousel.addEventListener('pointerup', (event) => {
    if (!gesture || gesture.id !== event.pointerId) return;
    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(dx) >= 45 && Math.abs(dx) > Math.abs(dy) * 1.3) change(true);
  });
  carousel.addEventListener('pointercancel', () => { gesture = null; });
  hero.addEventListener('pointerenter', (event) => { if (event.pointerType === 'mouse') { hovering = true; schedule(); } });
  hero.addEventListener('pointerleave', () => { hovering = false; schedule(); });
  hero.addEventListener('focusin', schedule);
  hero.addEventListener('focusout', () => queueMicrotask(schedule));
  document.addEventListener('visibilitychange', schedule);
  mobile.addEventListener('change', prepare);
  reduced.addEventListener('change', () => { if (reduced.matches) manuallyPaused = true; schedule(); });
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: .1 }).observe(carousel);
  const stateObserver = new MutationObserver(schedule);
  document.querySelectorAll('dialog,.menu-toggle').forEach((element) => {
    stateObserver.observe(element, { attributes: true, attributeFilter: ['open', 'aria-expanded'] });
  });
  prepare();
  schedule();
}
