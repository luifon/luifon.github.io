// The walkthrough video of a project page (figure.walkthrough).
// The video has native controls and preload="none", so no video data loads
// before the viewer plays it. Its <source> elements choose the -800 files for
// windows up to 800 px wide by their media attribute; this script chooses the
// poster the same way (data-poster and data-poster-narrow), so that only one
// poster file loads, and only when the video is near the viewport.
// A chapter button (data-t, in seconds) moves the video to that time and plays
// it. The button of the chapter that is playing gets aria-current. The video
// pauses while the lightbox is open (assets/lightbox.js).
(() => {
  const figures = [...document.querySelectorAll('figure.walkthrough')];
  if (!figures.length) return;
  const narrow = window.matchMedia('(max-width: 800px)');

  for (const fig of figures) {
    const v = fig.querySelector('video');
    const chapters = [...fig.querySelectorAll('button[data-t]')];

    // The poster loads when the video comes within 600 px of the viewport, so
    // that it does not compete with the first paint of the page.
    const setPoster = () => {
      const poster = narrow.matches ? v.dataset.posterNarrow : v.dataset.poster;
      if (poster && !v.poster) v.poster = poster;
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        if (entries.some(e => e.isIntersecting)) { setPoster(); io.disconnect(); }
      }, { rootMargin: '600px 0px' });
      io.observe(v);
    } else {
      setPoster();
    }

    // Before the metadata has loaded, a time cannot be set: keep it and set it
    // when the metadata arrives.
    let pending = null;
    v.addEventListener('loadedmetadata', () => {
      if (pending !== null) v.currentTime = pending;
      pending = null;
    });
    const seek = t => {
      if (v.readyState >= 1) v.currentTime = t; else pending = t;
      v.play().catch(() => {});
    };

    const mark = () => {
      const started = v.currentTime > 0 || !v.paused;
      let current = null;
      if (started) for (const b of chapters) if (+b.dataset.t <= v.currentTime + 0.25) current = b;
      for (const b of chapters) {
        if (b === current) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      }
    };

    chapters.forEach(b => b.addEventListener('click', () => seek(+b.dataset.t)));
    ['timeupdate', 'seeked', 'play'].forEach(e => v.addEventListener(e, mark));
    document.addEventListener('lightbox:open', () => v.pause());
  }
})();
