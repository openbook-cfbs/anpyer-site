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
