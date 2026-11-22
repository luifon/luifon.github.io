// Behaviour shared by every page.
(() => {
  // Highlight the section link of the section that is in view.
  const links = [...document.querySelectorAll('nav.sections a')];
  const sections = [...document.querySelectorAll('main section[id]')];
  if (links.length && sections.length) {
    const markActive = () => {
      const line = window.innerHeight * 0.35;
      let current = sections[0];
      for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) current = sections[sections.length - 1];
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + current.id));
    };
    window.addEventListener('scroll', markActive, { passive: true });
    window.addEventListener('resize', markActive);
    markActive();
  }

  // Soft light that follows the mouse pointer. Only for a fine pointer that can
  // hover, and never when the operating system asks for reduced motion.
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let frame = 0, x = 0, y = 0;
  const paint = () => {
    frame = 0;
    root.style.setProperty('--spot-x', x + 'px');
    root.style.setProperty('--spot-y', y + 'px');
  };
  const onMove = e => {
    x = e.clientX; y = e.clientY;
    if (!frame) frame = requestAnimationFrame(paint);
  };
  const update = () => {
    const on = pointer.matches && !reduce.matches;
    root.classList.toggle('spotlight', on);
    if (on) window.addEventListener('pointermove', onMove, { passive: true });
    else window.removeEventListener('pointermove', onMove);
  };
  pointer.addEventListener('change', update);
  reduce.addEventListener('change', update);
  update();
})();
