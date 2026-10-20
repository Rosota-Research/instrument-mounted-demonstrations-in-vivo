(function () {
  'use strict';
  var root = document.documentElement;

  // Theme toggle: explicit choice is stored; otherwise the OS setting applies.
  var toggle = document.getElementById('theme-toggle');
  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') root.setAttribute('data-theme', saved);
  } catch (e) {}
  if (toggle) {
    toggle.addEventListener('click', function () {
      var dark = root.getAttribute('data-theme') === 'dark' ||
        (!root.getAttribute('data-theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
      var next = dark ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  // Reading progress
  var bar = document.querySelector('.progress');
  function progress() {
    if (!bar) return;
    var h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? Math.min(100, (window.scrollY / h) * 100) : 0) + '%';
  }
  window.addEventListener('scroll', progress, { passive: true });
  progress();

  // Active section in the nav
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var targets = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    var current = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) current = en.target.id; });
      links.forEach(function (a) { a.setAttribute('aria-current', a.getAttribute('href') === '#' + current ? 'true' : 'false'); });
    }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });
    targets.forEach(function (t) { io.observe(t); });
  }

  // Entry rise for figures and cards; everything is visible without it.
  if ('IntersectionObserver' in window) {
    var ro = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); ro.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { ro.observe(el); });
  }

  // Muted loops play only while on screen
  var loops = document.querySelectorAll('video[data-loop]');
  if ('IntersectionObserver' in window && loops.length) {
    var vo = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.2 });
    loops.forEach(function (v) { vo.observe(v); });
  }

  // Lightbox for figures
  var dlg = document.getElementById('lightbox');
  if (dlg && typeof dlg.showModal === 'function') {
    var dimg = dlg.querySelector('img'), dcap = dlg.querySelector('p');
    document.querySelectorAll('.fig .media img').forEach(function (img) {
      img.addEventListener('click', function () {
        var full = img.getAttribute('data-full') || img.currentSrc || img.src;
        dimg.src = full; dimg.alt = img.alt;
        var cap = img.closest('figure').querySelector('figcaption');
        dcap.textContent = cap ? cap.textContent : '';
        dlg.showModal();
      });
    });
    dlg.addEventListener('click', function () { dlg.close(); });
  }

  // Copy BibTeX
  var copy = document.getElementById('copy-bib');
  if (copy) {
    copy.addEventListener('click', function () {
      var txt = document.getElementById('bibtex').textContent;
      function done() { copy.textContent = 'Copied'; copy.setAttribute('data-done', '1'); setTimeout(function () { copy.textContent = 'Copy'; copy.removeAttribute('data-done'); }, 1800); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () {});
      else {
        var r = document.createRange(); r.selectNodeContents(document.getElementById('bibtex'));
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        try { document.execCommand('copy'); done(); } catch (e) {}
      }
    });
  }

  // Unfreezing sweep chart (two small multiples on one x axis), drawn to scale from the paper's values.
  function sweep(id, values, yMin, yMax, fmt, ticks, title) {
    var svg = document.getElementById(id);
    if (!svg) return;
    var W = 420, H = 230, L = 46, R = 16, T = 34, B = 36;
    var pw = W - L - R, ph = H - T - B;
    var xs = values.map(function (_, i) { return L + (pw * i) / (values.length - 1); });
    var y = function (v) { return T + ph - ((v - yMin) / (yMax - yMin)) * ph; };
    var ns = 'http://www.w3.org/2000/svg';
    function el(tag, attrs, text) {
      var e = document.createElementNS(ns, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      if (text != null) e.textContent = text;
      svg.appendChild(e); return e;
    }
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    el('text', { x: L, y: 16, 'class': 'ptitle' }, title);
    ticks.forEach(function (t) {
      el('line', { x1: L, x2: W - R, y1: y(t), y2: y(t), 'class': 'grid' });
      el('text', { x: L - 8, y: y(t) + 4, 'text-anchor': 'end', 'class': 'axis-label' }, fmt(t));
    });
    el('line', { x1: L, x2: W - R, y1: T + ph, y2: T + ph, 'class': 'tick' });
    xs.forEach(function (x, i) {
      el('text', { x: x, y: T + ph + 18, 'text-anchor': 'middle', 'class': 'axis-label' }, String(i));
    });
    el('text', { x: L + pw / 2, y: H - 4, 'text-anchor': 'middle', 'class': 'axis-label' }, 'DINOv3 blocks unfrozen');
    var d = xs.map(function (x, i) { return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y(values[i]).toFixed(1); }).join(' ');
    el('path', { d: d, 'class': 'series' });
    xs.forEach(function (x, i) {
      el('circle', { cx: x, cy: y(values[i]), r: 5, 'class': 'dot' + (i === 1 ? ' dot--kept' : '') });
    });
    [0, 1, values.length - 1].forEach(function (i) {
      var anchor = i === 0 ? 'start' : i === values.length - 1 ? 'end' : 'middle';
      var dy = values[i] > (yMin + yMax) / 2 ? -11 : 20;
      el('text', { x: xs[i], y: y(values[i]) + dy, 'text-anchor': anchor, 'class': 'val' }, fmt(values[i]));
    });
  }
  sweep('chart-mae', [0.152, 0.148, 0.146, 0.143, 0.142], 0.138, 0.156,
    function (v) { return v.toFixed(3); }, [0.140, 0.145, 0.150, 0.155], 'Validation action error (MAE), lower is better');
  sweep('chart-viol', [6, 19, 19, 56, 69], 0, 80,
    function (v) { return v + '%'; }, [0, 20, 40, 60, 80], 'Episodes with a trocar violation');
})();
