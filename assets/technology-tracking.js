// Coordinates belong to the supplied source photographs, before their CSS crop.
// Only the vehicle moves. Labels and the blue route remain illustrative artwork.
export async function initTechnologyTracking() {
  const map = document.querySelector('[data-technology-tracking]');
  if (!map || map.dataset.trackingInitialized) return;
  map.dataset.trackingInitialized = 'true';
  const control = map.querySelector('.technology-motion-toggle');
  const mobile = window.matchMedia('(max-width: 767px)');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const load = async (source) => {
    const image = new Image();
    image.src = source;
    await image.decode();
    if (!image.naturalWidth) throw new Error('Tracking artwork unavailable');
  };
  try {
    await Promise.all([
      load('assets/technology-route-desktop-clean.png'),
      load('assets/technology-route-mobile-clean.png'),
      load('assets/technology-vehicle.svg'),
    ]);
  } catch {
    // Keep the original photograph and its static vehicle; no empty map or controls.
    return;
  }

  let userPaused = reduced.matches;
  let visible = false;
  let frame = null;
  let previousTime = null;
  let elapsed = 0;
  let path, vehicle, length;
  const travel = 12000;
  const hold = 700;
  const fade = 450;
  const cycle = travel + hold + fade * 2;

  function selectRoute() {
    const route = map.querySelector(mobile.matches ? '.technology-route-mobile' : '.technology-route-desktop');
    path = route.querySelector('.technology-route-path');
    vehicle = route.querySelector('.technology-vehicle');
    length = path.getTotalLength();
    map.dataset.route = mobile.matches ? 'mobile' : 'desktop';
    paint();
  }

  function paint() {
    const progress = Math.min(elapsed / travel, 1);
    const distance = progress * length;
    const position = path.getPointAtLength(distance);
    const before = path.getPointAtLength(Math.max(0, distance - 2));
    const after = path.getPointAtLength(Math.min(length, distance + 2));
    const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    vehicle.setAttribute('transform', `translate(${position.x} ${position.y}) rotate(${angle})`);
    // Fade at the destination, reset while invisible, then fade into the start.
    const fadeOutStart = travel + hold;
    const fadeInStart = fadeOutStart + fade;
    let opacity = 1;
    if (elapsed >= fadeInStart) {
      const start = path.getPointAtLength(0);
      const next = path.getPointAtLength(2);
      const startAngle = Math.atan2(next.y - start.y, next.x - start.x) * 180 / Math.PI;
      vehicle.setAttribute('transform', `translate(${start.x} ${start.y}) rotate(${startAngle})`);
      opacity = (elapsed - fadeInStart) / fade;
    } else if (elapsed > fadeOutStart) opacity = 1 - (elapsed - fadeOutStart) / fade;
    vehicle.style.opacity = String(opacity);
    map.dataset.progress = (elapsed >= fadeInStart ? 0 : progress).toFixed(4);
  }

  function tick(time) {
    if (previousTime !== null) elapsed = (elapsed + Math.min(time - previousTime, 100)) % cycle;
    previousTime = time;
    paint();
    frame = requestAnimationFrame(tick);
  }

  function reconcile() {
    const running = !userPaused && visible && !document.hidden;
    map.classList.toggle('is-moving', running);
    map.classList.toggle('is-paused', userPaused);
    map.dataset.motion = running ? 'running' : 'paused';
    const label = userPaused ? 'Retomar animação do veículo' : 'Pausar animação do veículo';
    control.setAttribute('aria-label', label);
    control.querySelector('span').textContent = label;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    previousTime = null;
    if (running) frame = requestAnimationFrame(tick);
  }

  selectRoute();
  map.classList.add('is-tracking-ready');
  control.hidden = false;
  control.addEventListener('click', () => {
    userPaused = !userPaused;
    reconcile();
  });
  mobile.addEventListener('change', () => {
    selectRoute();
    reconcile();
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) userPaused = true;
    reconcile();
  });
  document.addEventListener('visibilitychange', reconcile);
  window.addEventListener('pagehide', () => {
    visible = false;
    reconcile();
  });
  window.addEventListener('pageshow', () => {
    const bounds = map.getBoundingClientRect();
    visible = bounds.bottom > 0 && bounds.top < window.innerHeight;
    reconcile();
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      reconcile();
    });
    observer.observe(map);
  } else visible = true;
  reconcile();
}
