// Opens an image or a video at full window size over the page.
// Any element with data-gallery and data-full (an image URL) or data-video (a
// video path without extension) opens it on click. Elements that share a
// data-gallery value form one group; the arrow keys and the side buttons move
// inside that group. Esc or a click outside the image or video closes it.
//
// A video item names its files by data-video: <path>.webm and <path>.mp4, and
// <path>-800.webm and <path>-800.mp4 for windows up to 800 px wide. data-poster,
// data-width and data-height give its poster and size. It plays muted with
// controls; when the operating system asks for reduced motion it does not
// start by itself. It loops unless data-loop is "false". data-from names the
// id of an inline video with the same content (a walkthrough): the viewer
// starts at that video's position and pauses it, and gives its own position
// back to it when the viewer leaves the item. The lightbox:open and lightbox:close events on document let
// assets/clips.js pause the inline videos while the lightbox is open.
(() => {
  const items = [...document.querySelectorAll('[data-gallery][data-full], [data-gallery][data-video]')];
  if (!items.length) return;

  const lb = document.createElement('div');
  lb.id = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Image and video viewer');
  lb.innerHTML = '<button class="nav prev" type="button" aria-label="Previous item">&larr;</button>'
    + '<img alt="" hidden><video controls muted loop playsinline preload="metadata" hidden></video><div class="cap"></div>'
    + '<button class="nav next" type="button" aria-label="Next item">&rarr;</button>';
  document.body.append(lb);
  const img = lb.querySelector('img');
  const video = lb.querySelector('video');
  const cap = lb.querySelector('.cap');
  const prev = lb.querySelector('.prev');
  const next = lb.querySelector('.next');
  const narrow = window.matchMedia('(max-width: 800px)');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  let group = [];
  let index = 0;
  let opener = null;
  let shown = null;
  let startAt = 0;
  video.addEventListener('loadedmetadata', () => {
    if (startAt) video.currentTime = startAt;
    startAt = 0;
  });
  const inlineOf = el => (el && el.dataset.from ? document.getElementById(el.dataset.from) : null);

  const stopVideo = () => {
    const inline = inlineOf(shown);
    if (inline && inline.readyState >= 1 && video.readyState >= 1) inline.currentTime = video.currentTime;
    shown = null;
    startAt = 0;
    video.pause();
    video.replaceChildren();
    video.removeAttribute('poster');
    video.load();
    video.hidden = true;
  };
  const showVideo = el => {
    const base = el.dataset.video + (narrow.matches ? '-800' : '');
    video.replaceChildren(...[['webm', 'video/webm'], ['mp4', 'video/mp4']].map(([ext, type]) => {
      const s = document.createElement('source');
      s.src = `${base}.${ext}`;
      s.type = type;
      return s;
    }));
    if (el.dataset.poster) video.poster = el.dataset.poster;
    if (el.dataset.width) video.width = +el.dataset.width;
    if (el.dataset.height) video.height = +el.dataset.height;
    video.setAttribute('aria-label', el.dataset.caption || '');
    video.loop = el.dataset.loop !== 'false';
    const inline = inlineOf(el);
    if (inline) {
      startAt = inline.currentTime;
      inline.pause();
    }
    shown = el;
    video.hidden = false;
    video.load();
    if (!reduce.matches) video.play().catch(() => {});
  };

  const show = () => {
    const el = group[index];
    stopVideo();
    if (el.dataset.video) {
      img.hidden = true;
      img.removeAttribute('src');
      showVideo(el);
    } else {
      img.src = el.dataset.full;
      img.alt = el.dataset.caption || '';
      img.hidden = false;
    }
    cap.textContent = el.dataset.caption || '';
    const several = group.length > 1;
    prev.hidden = next.hidden = !several;
    if (several) cap.textContent += `  (${index + 1} / ${group.length})`;
  };
  const open = el => {
    group = items.filter(i => i.dataset.gallery === el.dataset.gallery);
    index = group.indexOf(el);
    opener = el;
    lb.classList.add('on');
    document.body.classList.add('lb-open');
    document.dispatchEvent(new CustomEvent('lightbox:open'));
    show();
  };
  const close = () => {
    lb.classList.remove('on');
    document.body.classList.remove('lb-open');
    stopVideo();
    img.removeAttribute('src');
    document.dispatchEvent(new CustomEvent('lightbox:close'));
    if (opener && opener.focus) opener.focus();
  };
  const step = d => { index = (index + d + group.length) % group.length; show(); };

  items.forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(el); }));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  // Capture phase, so that the arrow keys move between items even when the
  // video's controls have focus, instead of seeking inside the video.
  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('on')) return;
    if (e.key === 'Escape') { close(); e.preventDefault(); }
    else if (e.key === 'ArrowRight' && group.length > 1) { step(1); e.preventDefault(); e.stopPropagation(); }
    else if (e.key === 'ArrowLeft' && group.length > 1) { step(-1); e.preventDefault(); e.stopPropagation(); }
  }, true);
})();
