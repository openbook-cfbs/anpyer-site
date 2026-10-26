/* AnPyer site — shared behaviour. Zero dependencies; every page works without it. */
(function () {
  'use strict';

  // ---- Language menu (<details class="lang-menu">) ----
  // The menu is a native <details>, so it opens/closes without JS.
  // Here we only add: close on outside click, close on Escape, one-open-at-a-time.
  function closeMenus(except) {
    document.querySelectorAll('details.lang-menu[open]').forEach(function (d) {
      if (d !== except) d.removeAttribute('open');
    });
  }
  document.addEventListener('click', function (e) {
    var inside = e.target.closest ? e.target.closest('details.lang-menu') : null;
    closeMenus(inside);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenus(null);
  });

  // ---- Package rail (landing section 2): the mouse wheel scrolls it sideways ----
  // Progressive enhancement only: without JS the rail is still a plain horizontally scrollable
  // box (touch swipe, shift+wheel, and the arrow keys once it has focus via tabindex).
  // Rules:
  //   · a trackpad's horizontal gesture (|deltaX| > |deltaY|) is left to the browser;
  //   · at either end the wheel event is NOT consumed, so the page keeps scrolling — never trap
  //     the reader inside the package block;
  //   · arrow keys move roughly one card, animated only when the user allows motion.
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.pkg-wall').forEach(function (rail) {
    function maxScroll() { return rail.scrollWidth - rail.clientWidth; }

    rail.addEventListener('wheel', function (e) {
      if (e.ctrlKey || Math.abs(e.deltaX) > Math.abs(e.deltaY)) return; // zoom / trackpad swipe
      var unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? rail.clientWidth : 1;
      var delta = e.deltaY * unit;
      if (!delta) return;
      var max = maxScroll();
      if (max <= 0) return;                       // nothing to scroll: let the page have it
      if (delta < 0 && rail.scrollLeft <= 0) return;
      if (delta > 0 && rail.scrollLeft >= max - 1) return;
      e.preventDefault();
      rail.scrollLeft = Math.max(0, Math.min(max, rail.scrollLeft + delta));
    }, { passive: false });

    rail.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      var max = maxScroll();
      if (max <= 0) return;
      var step = Math.max(240, rail.clientWidth * 0.8);
      var target = rail.scrollLeft + (e.key === 'ArrowRight' ? step : -step);
      e.preventDefault();
      rail.scrollTo({
        left: Math.max(0, Math.min(max, target)),
        behavior: reduceMotion ? 'auto' : 'smooth'
      });
    });
  });

  // ---- Scroll reveal (.reveal → .in) ----
  // Landing page only; no-ops elsewhere. Disabled when the user prefers reduced motion.
  var targets = document.querySelectorAll('.reveal');
  if (!targets.length) return;
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  targets.forEach(function (el) { io.observe(el); });
})();
