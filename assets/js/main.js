(function () {
  'use strict';
  // Muted loops play only while on screen.
  var loops = document.querySelectorAll('video[data-loop]');
  if ('IntersectionObserver' in window && loops.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); } else { v.pause(); }
      });
    }, { threshold: 0.25 });
    loops.forEach(function (v) { io.observe(v); });
  }
})();
