/* AID motion-plus — additive, dependency-free.
   Scroll progress bar · page transition curtain · link prefetch · magnetic
   buttons · label scramble. Never touches the home building/lift journey or the
   company journey (those keep building-journey.js / lift-journey.js / site.js).
   Does nothing under prefers-reduced-motion. */
(function () {
  "use strict";
  if (window.__aidMotionPlus) return;
  window.__aidMotionPlus = true;

  var root = document.documentElement;
  var reduce = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  if (reduce) { root.classList.remove("mp-enter"); return; }

  var finePointer = false;
  try { finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) {}

  /* ---------- 1 · scroll progress bar ---------- */
  var rail = document.createElement("div");
  rail.className = "mp-progress";
  rail.setAttribute("aria-hidden", "true");
  var fill = document.createElement("i");
  rail.appendChild(fill);
  document.body.appendChild(rail);

  var ticking = false;
  function paint() {
    ticking = false;
    var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    var r = Math.min(1, Math.max(0, window.scrollY / max));
    fill.style.transform = "scaleX(" + r.toFixed(4) + ")";
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  paint();

  /* ---------- 2 · page transition curtain ---------- */
  var shutter = document.createElement("div");
  shutter.className = "mp-shutter";
  shutter.setAttribute("aria-hidden", "true");
  shutter.innerHTML = "<b></b><b></b><b></b><b></b>";
  document.body.appendChild(shutter);

  // Arriving from another page: lift the cover that the head script put up.
  if (root.classList.contains("mp-enter")) {
    var lift = function () {
      requestAnimationFrame(function () {
        setTimeout(function () {
          root.classList.add("mp-reveal");
          setTimeout(function () { root.classList.remove("mp-enter", "mp-reveal"); }, 800);
        }, 90);
      });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", lift, { once: true });
    else lift();
  }

  var leaving = false;
  function go(href) {
    if (leaving) return;
    leaving = true;
    try { sessionStorage.setItem("mpS", "1"); } catch (e) {}
    shutter.classList.add("is-closing");
    setTimeout(function () { window.location.href = href; }, 440);
  }
  // Back/forward cache: never come back to a stuck curtain.
  window.addEventListener("pageshow", function (e) {
    if (e.persisted) { leaving = false; shutter.classList.remove("is-closing"); root.classList.remove("mp-enter", "mp-reveal"); }
  });

  function internalPage(a) {
    if (!a || !a.href) return null;
    if (a.target && a.target !== "_self") return null;
    if (a.hasAttribute("download")) return null;
    var u;
    try { u = new URL(a.href, location.href); } catch (e) { return null; }
    if (u.protocol !== location.protocol || u.host !== location.host) return null;
    if (u.pathname === location.pathname) return null; // same page: hash / query changes stay instant
    var last = u.pathname.split("/").pop();
    if (last && !/\.html?$/i.test(last)) return null;  // only real pages
    return u;
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    var u = internalPage(a);
    if (!u) return;
    e.preventDefault();
    go(u.href);
  });

  /* ---------- link prefetch (makes the curtain land on a ready page) ---------- */
  var fetched = {};
  var saveData = false;
  try { saveData = !!(navigator.connection && navigator.connection.saveData); } catch (e) {}
  function prefetch(e) {
    if (saveData) return;
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    var u = internalPage(a);
    if (!u || fetched[u.pathname]) return;
    fetched[u.pathname] = 1;
    var l = document.createElement("link");
    l.rel = "prefetch";
    l.href = u.href;
    document.head.appendChild(l);
  }
  document.addEventListener("mouseover", prefetch, { passive: true });
  document.addEventListener("touchstart", prefetch, { passive: true });

  /* ---------- magnetic buttons (mouse only) ---------- */
  if (finePointer) {
    Array.prototype.forEach.call(document.querySelectorAll("main .button-primary, main .button-dark"), function (btn) {
      btn.classList.add("mp-mag");
      btn.addEventListener("mousemove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.22;
        btn.style.translate = dx.toFixed(1) + "px " + (dy - 2).toFixed(1) + "px";
      });
      btn.addEventListener("mouseleave", function () { btn.style.translate = ""; });
    });
  }

  /* ---------- section label scramble (decorative, once, then exact text) ---------- */
  if ("IntersectionObserver" in window) {
    var chars = "0123456789/·ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var scramble = function (el) {
      var target = el.textContent;
      if (!target || !target.trim()) return;
      var frame = 0, total = 14;
      var t = setInterval(function () {
        frame++;
        if (frame >= total) { el.textContent = target; clearInterval(t); return; }
        var keep = Math.floor(target.length * (frame / total));
        var out = target.slice(0, keep);
        for (var i = keep; i < target.length; i++) {
          out += /[\s]/.test(target[i]) ? target[i] : chars[(i + frame) % chars.length];
        }
        el.textContent = out;
      }, 28);
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        setTimeout(function () { scramble(en.target); }, 140);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(document.querySelectorAll("main .section-top > span"), function (s) {
      if (s.closest(".aid-legacy-journey, .company-journey")) return;
      io.observe(s);
    });
  }
})();
