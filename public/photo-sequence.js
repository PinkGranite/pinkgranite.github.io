const region = document.querySelector('[data-photo-sequence]');
if (region) {
  const composition = region.querySelector('[data-photo-composition]');
  const cafe = region.querySelector('.photo-cafe-layer');
  const stage = region.querySelector('.photo-stage-layer');
  const caption = region.querySelector('[data-photo-caption]');
  const indexLabel = region.querySelector('.composition-index');
  const hint = region.querySelector('[data-photo-hint]');
  const motionButton = region.querySelector('[data-photo-motion]');
  const choices = [...region.querySelectorAll('[data-photo-select]')];
  const announcement = region.querySelector('[data-photo-announcement]');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const captions = ['01 / A wider perspective', '02 / A quieter moment', '03 / Another kind of expression'];
  let paused = false;
  let visible = false;
  let scheduled = 0;
  let phase = 0;
  let selected = -1;
  let distance = 480;
  let trigger = 240;
  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
  const ease = value => value * value * (3 - 2 * value);

  function paint(nextPhase) {
    phase = clamp(nextPhase, 0, 2);
    const cafeAmount = ease(clamp((phase - 0.14) / 0.76));
    const stageAmount = ease(clamp((phase - 1.14) / 0.76));
    cafe.style.opacity = String(cafeAmount);
    stage.style.opacity = String(stageAmount);
    const moves = !preference.matches && !paused;
    cafe.style.transform = moves ? `translate3d(${(1 - cafeAmount) * 34}px, ${(1 - cafeAmount) * 18}px, 0)` : 'none';
    stage.style.transform = moves ? `translate3d(${(1 - stageAmount) * 30}px, ${(1 - stageAmount) * 25}px, 0)` : 'none';
    composition.style.setProperty('--photo-progress', String(phase / 2));
    region.dataset.photoPhase = phase.toFixed(3);
    const nextSelected = phase < 0.62 ? 0 : phase < 1.62 ? 1 : 2;
    if (nextSelected !== selected) {
      selected = nextSelected;
      caption.textContent = captions[selected];
      indexLabel.textContent = `0${selected + 1} / 03`;
      region.dataset.photoState = ['mountain', 'cafe', 'stage'][selected];
      choices.forEach((button, i) => button.setAttribute('aria-pressed', String(i === selected)));
    }
  }

  function update() {
    scheduled = 0;
    if (!visible || paused || preference.matches) return;
    const top = region.getBoundingClientRect().top;
    paint(clamp((trigger - top) / distance) * 2);
  }

  function schedule() {
    if (!scheduled && visible && !paused && !preference.matches) scheduled = requestAnimationFrame(update);
  }

  function mode() {
    const manual = paused || preference.matches;
    region.classList.toggle('photo-manual', manual);
    motionButton.hidden = preference.matches;
    motionButton.textContent = paused ? 'Resume photo motion' : 'Pause photo motion';
    motionButton.setAttribute('aria-pressed', String(paused));
    hint.textContent = preference.matches ? 'Reduced motion · choose a photograph' : paused ? 'Manual composition · use arrows or dots' : 'Scroll to reveal · or choose a photograph';
    paint(phase);
  }

  function choose(value) {
    paused = true;
    mode();
    paint(clamp(value, 0, 2));
    announcement.textContent = captions[selected];
  }

  choices.forEach((button, i) => button.addEventListener('click', () => choose(i)));
  region.querySelector('[data-photo-prev]').addEventListener('click', () => choose((selected + 2) % 3));
  region.querySelector('[data-photo-next]').addEventListener('click', () => choose((selected + 1) % 3));
  motionButton.addEventListener('click', () => { paused = !paused; mode(); if (!paused) schedule(); });

  function measure() {
    const photoHeight = composition.getBoundingClientRect().height;
    distance = Math.round(clamp(photoHeight * 0.6, 160, 300));
    trigger = Math.round(Math.min(innerHeight * 0.32, photoHeight * 0.8));
    region.style.setProperty('--photo-run', `${distance}px`);
    region.style.setProperty('--photo-trigger', `${trigger}px`);
    schedule();
  }

  region.classList.add('photo-enhanced');
  paint(0);
  mode();
  new ResizeObserver(measure).observe(composition);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) schedule(); }, {rootMargin: '100px'}).observe(region);
  window.addEventListener('scroll', schedule, {passive: true});
  window.addEventListener('resize', measure, {passive: true});
  preference.addEventListener('change', () => { mode(); measure(); });
  measure();
}
