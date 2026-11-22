// Plays the inline videos (video.clip) only while they are on screen.
// A clip is muted and loops. It plays while at least a quarter of it is in the
// viewport and pauses when it leaves, when the page is hidden and while the
// lightbox is open. When the operating system asks for reduced motion, no clip
// plays and the poster image stays.
(() => {
  const clips = [...document.querySelectorAll('video.clip')];
  if (!clips.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const visible = new Set();
  let lightboxOpen = false;

  const allowed = () => !reduce.matches && !lightboxOpen && document.visibilityState === 'visible';
  const sync = v => {
    if (allowed() && visible.has(v)) {
      // play() rejects when the browser blocks it or a pause() follows at once.
      if (v.paused) v.play().catch(() => {});
    } else if (!v.paused) {
      v.pause();
    }
  };
  const syncAll = () => clips.forEach(sync);

  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target); else visible.delete(e.target);
        sync(e.target);
      }
    }, { threshold: 0.25 });
    clips.forEach(v => io.observe(v));
  }

  reduce.addEventListener('change', syncAll);
  document.addEventListener('visibilitychange', syncAll);
  document.addEventListener('lightbox:open', () => { lightboxOpen = true; syncAll(); });
  document.addEventListener('lightbox:close', () => { lightboxOpen = false; syncAll(); });
})();
