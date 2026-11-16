
/* ==========================================================================
   AID — motion layer (v2)
   Text, background, scroll-reveal and scroll-linked animation for all six
   pages. Additive: remove motion.css + motion.js (+ the head tags) and the
   site is the plain static site again.

   · Never touches #construction-journey, .aid-legacy-journey,
     .aid-lift-journey, .company-journey or the site header's behaviour.
   · Does nothing under prefers-reduced-motion, or when the browser lacks
     IntersectionObserver / translate / clip-path.
   · Fail-safe: any error → layer switches itself off and the page shows
     exactly as authored. Elements that never get observed are revealed
     after 3.5 s.
   ========================================================================== */
(() => {
  'use strict';
  if (window.__aidMotion) return;
  window.__aidMotion = true;

  const root = document.documentElement;
  const rm = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  let supported = false;
  try {
    supported = !!(window.IntersectionObserver && window.CSS && CSS.supports &&
      CSS.supports('translate', '0 0') && CSS.supports('clip-path', 'inset(0)'));
  } catch (e) { /* unsupported */ }
  if (rm.matches || !supported) { root.classList.remove('m-pre'); return; }

  /* ---------- helpers ---------------------------------------------------- */
  const $ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const EX = '#construction-journey,.aid-legacy-journey,.aid-lift-journey,.company-journey,.site-header,[data-no-motion]';
  const SKIP = EX + ',.project-detail-panel,.form-result,.no-results';
  const CONTAINER = '[data-m="pop"],[data-m="slide"],[data-m="curtain"],[data-m="row"]';
  const page = ((location.pathname.split('/').pop() || 'index.html').replace(/\.html?$/, '')) || 'index';

  const S = { io: null, live: null, targets: [], scrubs: [], raf: 0, fired: false, off: false, timer: 0, mo: [] };
  const blocked = (el) => !!el.closest(SKIP);
  const covered = (el) => !!(el.parentElement && el.parentElement.closest(CONTAINER));

  const mark = (el, type, o) => {
    o = o || {};
    if (!el || el.hasAttribute('data-m') || blocked(el)) return false;
    if (type !== 'head' && covered(el)) return false;
    el.setAttribute('data-m', type);
    if (o.dir) el.setAttribute('data-dir', o.dir);
    if (o.d != null) el.style.setProperty('--d', o.d + 'ms');
    S.targets.push(el);
    return true;
  };
  const markAll = (sel, type, o) => $(sel).filter((el) => mark(el, type, o));

  /* Stagger siblings by their column so a row of cards ripples left → right */
  const stagger = (items, step) => {
    const vis = items.filter((e) => e.getClientRects().length);
    let cols = 1;
    if (vis.length > 1) {
      const t0 = vis[0].getBoundingClientRect().top;
      cols = vis.filter((e) => Math.abs(e.getBoundingClientRect().top - t0) < 8).length || 1;
    }
    items.forEach((e) => {
      const k = vis.indexOf(e);
      e.style.setProperty('--d', (k < 0 ? 0 : (k % cols) * step) + 'ms');
    });
  };
  const staggerGroups = (els, step) => {
    const groups = new Map();
    els.forEach((e) => { const p = e.parentElement; if (!groups.has(p)) groups.set(p, []); groups.get(p).push(e); });
    groups.forEach((g) => stagger(g, step));
  };

  /* ---------- text: word-by-word masked headline ------------------------- */
  const split = (el) => {
    let i = 0;
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const walk = (node) => {
      Array.from(node.childNodes).forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            const w = document.createElement('span');
            const wi = document.createElement('span');
            w.className = 'm-w';
            wi.className = 'm-wi';
            wi.textContent = p;
            wi.style.setProperty('--i', i++);
            w.appendChild(wi);
            frag.appendChild(w);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1 && !/^(br|svg|img|script)$/i.test(n.nodeName)) {
          walk(n);
        }
      });
    };
    walk(el);
    el.setAttribute('aria-label', label);
  };

  /* ---------- count-up --------------------------------------------------- */
  const COUNT = '.stats-inline strong,.projects-highlight strong,.fleet-spec-grid strong';
  const countUp = (el) => {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    const tn = Array.from(el.childNodes).find((n) => n.nodeType === 3 && /\d/.test(n.textContent));
    if (!tn) return;
    const m = tn.textContent.match(/^(\s*)(\d[\d,]*)([\s\S]*)$/);
    if (!m) return;
    const target = parseInt(m[2].replace(/,/g, ''), 10);
    if (!isFinite(target) || target < 2) return;
    const comma = m[2].indexOf(',') > -1;
    const fmt = (n) => (comma ? n.toLocaleString('en-US') : String(n));
    const t0 = performance.now();
    const dur = 1500;
    const step = (now) => {
      if (S.off) { tn.textContent = m[0]; return; }
      const t = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - t, 3);
      tn.textContent = t < 1 ? m[1] + fmt(Math.round(target * e)) + m[3] : m[0];
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- reveal ----------------------------------------------------- */
  const reveal = (el, instant) => {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    if (el.matches('.page-cta')) el.classList.add('cta-in');
    if (S.io) S.io.unobserve(el);
    $(COUNT, el.matches(COUNT) ? el.parentElement : el).forEach((c) => {
      if (instant) { c.dataset.counted = '1'; return; }
      const d = parseFloat(getComputedStyle(c.closest('[data-m]') || c).getPropertyValue('--d')) || 0;
      setTimeout(() => countUp(c), d + 250);
    });
  };
  const revealAll = () => $('[data-m]:not(.is-in)').forEach((e) => reveal(e, true));

  /* ---------- per-page hero line art (inline SVG, decorative) ------------ */
  const P = (d, k) => '<path class="m-s" pathLength="1" style="--k:' + (k || 0) + '" d="' + d + '"/>';
  const svg = (inner) =>
    '<svg class="m-art" data-live viewBox="0 0 520 420" fill="none" stroke="currentColor" stroke-width="1.5" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + inner + '</svg>';

  const ART = {
    /* tower crane beside a rising frame */
    company: () => svg(
      P('M20 400H500', 0) +
      P('M140 400V70M160 400V70', 1) +
      P('M140 400L160 370L140 340L160 310L140 280L160 250L140 220L160 190L140 160L160 130L140 100L160 70', 2) +
      '<g class="m-jib m-idle">' +
        P('M40 70H470', 3) + P('M150 40L470 70M150 40L40 70M150 40V70', 4) +
        P('M130 70V52H170V70', 5) + P('M40 70V92H78V70', 6) +
        P('M250 70V150', 7) +
        '<g class="m-load m-idle">' + P('M236 150h28v22h-28z', 8) + '</g>' +
      '</g>' +
      P('M300 400V240M360 400V240M420 400V240', 9) +
      P('M300 240H420M300 280H420M300 320H420M300 360H420', 10) +
      '<g class="m-win m-f"><path d="M308 380H412M308 340H412M308 300H412M308 260H412"/></g>'
    ),
    /* excavator digging cycle */
    capabilities: () => svg(
      P('M20 400H500', 0) + P('M40 400Q85 366 130 400', 1) +
      P('M300 360H460Q482 380 460 400H300Q278 380 300 360Z', 2) +
      P('M320 380m-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0M380 380m-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0M440 380m-12 0a12 12 0 1 0 24 0a12 12 0 1 0-24 0', 3) +
      P('M320 360V300H400V360M340 300V268H400V300M400 330H452V360', 4) +
      '<g class="m-win m-f"><path d="M350 284H392"/></g>' +
      '<g class="m-boom m-idle">' +
        P('M296 338L230 256L238 248L306 330Z', 5) +
        '<g class="m-stick m-idle">' +
          P('M230 250L141 319L149 328L238 258Z', 6) +
          '<g class="m-bucket m-idle">' + P('M145 323L118 340L124 364L156 358L168 334Z', 7) + '</g>' +
        '</g>' +
      '</g>'
    ),
    /* skyline whose windows switch on */
    projects: () => {
      const b = [[40, 60, 150], [110, 50, 230], [170, 80, 110], [260, 60, 280], [330, 70, 190], [410, 50, 140]];
      let s = P('M20 400H500', 0), w = '', k = 0;
      b.forEach((q, bi) => {
        const x = q[0], wd = q[1], y = 400 - q[2];
        s += P('M' + x + ' 400V' + y + 'H' + (x + wd) + 'V400', bi + 1);
        if (bi % 2 === 0) s += P('M' + (x + wd / 2) + ' ' + y + 'V' + (y - 18), bi + 1);
        for (let yy = y + 16; yy < 388; yy += 22) {
          for (let xx = x + 10; xx < x + wd - 8; xx += 18) {
            w += '<rect class="m-lit" style="--b:' + ((k++ * 7) % 11) + '" x="' + xx + '" y="' + yy +
              '" width="8" height="8" fill="#f47721" stroke="none"/>';
          }
        }
      });
      return svg(s + '<g class="m-f">' + w + '</g>');
    },
    /* a steady climb */
    careers: () => svg(
      P('M30 400H520', 0) +
      P('M30 400V370H100V338H170V306H240V274H310V242H380V210H450V178H520', 1) +
      P('M100 370V400M170 338V400M240 306V400M310 274V400M380 242V400M450 210V400', 2) +
      P('M485 170V118', 3) + P('M485 118H512L498 130L512 142H485', 4) +
      '<g class="m-f"><circle class="m-climb m-idle" r="7" fill="#f47721" stroke="none"/></g>'
    ),
    /* topographic map with a pinned office */
    contact: () => {
      let c = '';
      for (let i = 0; i < 6; i++) {
        c += '<ellipse cx="302" cy="228" rx="' + (38 + i * 36) + '" ry="' + (24 + i * 24) +
          '" transform="rotate(-14 302 228)" class="m-s" pathLength="1" style="--k:' + i + '"/>';
      }
      c += '<ellipse cx="120" cy="320" rx="54" ry="30" transform="rotate(10 120 320)" class="m-s" pathLength="1" style="--k:6"/>';
      c += '<ellipse cx="120" cy="320" rx="26" ry="14" transform="rotate(10 120 320)" class="m-s" pathLength="1" style="--k:7"/>';
      return svg(c +
        '<g class="m-f">' +
          '<path class="m-flow" d="M60 380C140 350 190 270 302 228" stroke="#f47721" stroke-dasharray="6 6"/>' +
          '<circle class="m-pulse m-idle" cx="302" cy="228" r="5" stroke="#f47721"/>' +
          '<circle cx="302" cy="228" r="5" fill="#f47721" stroke="none"/>' +
        '</g>');
    }
  };

  /* ---------- 9.8 · final CTA skyline ----------------------------------- */
  const skyMarkup = () => {
    /* Preserve the original six .m-bar buildings and their .is-in reveal.
       Windows and infrastructure lines are added as decorative layers. */
    const b = [[0, 70, 150], [80, 56, 230], [146, 90, 120], [246, 64, 200], [320, 76, 260], [404, 50, 160]];
    let windows = '';
    let windowIndex = 0;

    b.forEach((q) => {
      const x = q[0], width = q[1], height = q[2];
      const top = 300 - height;
      const columns = width >= 70 ? 3 : 2;
      const rows = Math.max(2, Math.floor((height - 24) / 25));
      const cellWidth = 6;
      const gap = (width - columns * cellWidth) / (columns + 1);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
          const wx = x + gap + col * (cellWidth + gap);
          const wy = top + 12 + row * ((height - 24) / rows);
          windows += '<rect class="m-sky-window" style="--w:' + windowIndex++ +
            '" x="' + wx + '" y="' + wy + '" width="' + cellWidth +
            '" height="7" rx="0.5"/>';
        }
      }
    });

    return '<svg class="m-sky" data-m="sky" viewBox="0 0 470 340" aria-hidden="true" focusable="false">' +
      '<g class="m-sky-buildings">' +
        b.map((q, i) => '<rect class="m-bar" style="--n:' + i + '" x="' + q[0] +
          '" y="' + (300 - q[2]) + '" width="' + q[1] + '" height="' + q[2] +
          '" fill="#fff"/>').join('') +
      '</g>' +
      '<g class="m-sky-windows">' + windows + '</g>' +
      '<g class="m-sky-infrastructure">' +
        '<path class="m-sky-road" d="M0 301H470"/>' +
        '<path class="m-sky-road-detail" d="M0 316H470"/>' +
        '<path class="m-sky-road-marking" d="M18 308H88M125 308H195M232 308H302M339 308H409"/>' +
        '<path class="m-sky-connection" d="M35 301V332M435 301V332M0 332H470"/>' +
      '</g>' +
    '</svg>';
  };

  /* ---------- scroll-linked engine --------------------------------------- */
  const hdr = document.querySelector('.site-header');
  let hero = null;
  const rows = [];

  const addScrub = (el, type, o) => {
    if (!el || blocked(el)) return;
    el.setAttribute('data-scrub', type);
    S.scrubs.push(Object.assign({ el: el, type: type }, o || {}));
  };

  const tick = () => {
    S.raf = 0;
    if (S.off) return;
    const vh = window.innerHeight;
    const y = window.pageYOffset || 0;

    if (hdr) hdr.classList.toggle('is-scrolled', y > 8);

    if (hero) {
      const r = hero.getBoundingClientRect();
      if (r.bottom > -60) {
        const p = clamp(-r.top / Math.max(r.height, 1), 0, 1);
        hero.style.setProperty('--hy', (p * 28).toFixed(1) + 'px');
        hero.style.setProperty('--ay', (p * 56).toFixed(1) + 'px');
        hero.style.setProperty('--mp', (p * (hero.classList.contains('home-section') ? 30 : 40)).toFixed(1) + 'px');
      }
    }

    S.scrubs.forEach((s) => {
      const r = s.el.getBoundingClientRect();
      if (r.bottom < -150 || r.top > vh + 150) return;
      if (s.type === 'rule') {
        s.el.style.setProperty('--rp', clamp((vh * 0.92 - r.top) / (vh * 0.3), 0, 1).toFixed(3));
      } else if (s.type === 'parallax') {
        const p = clamp(((r.top + r.height / 2) - vh / 2) / vh, -1, 1);
        s.el.style.setProperty('--py', (p * r.height * 0.065).toFixed(1) + 'px');
      } else if (s.type === 'drift') {
        const p = clamp(((r.top + r.height / 2) - vh / 2) / vh, -1, 1);
        s.el.style.setProperty('--dx', (p * s.speed).toFixed(1) + 'px');
      }
    });

    if (rows.length) {
      let best = null, bd = Infinity;
      rows.forEach((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.abs(r.top + r.height / 2 - vh * 0.5);
        if (d < bd) { bd = d; best = el; }
      });
      rows.forEach((el) => el.classList.toggle('is-active', el === best && bd < vh * 0.28));
    }

    /* Short pages / anchors: never leave something unrevealed at the very bottom */
    if (vh + y >= document.documentElement.scrollHeight - 4) revealAll();
  };
  const schedule = () => { if (!S.raf && !S.off) S.raf = requestAnimationFrame(tick); };

  /* ---------- filter replay (projects) ----------------------------------- */
  const watchFilters = () => {
    if (!window.MutationObserver) return;
    $('.client-project-grid,.home-project-grid').forEach((grid) => {
      let queued = false;
      const mo = new MutationObserver(() => {
        if (queued) return;
        queued = true;
        requestAnimationFrame(() => {
          queued = false;
          if (S.off) return;
          const cards = $('[data-m="pop"]', grid).filter((c) => !c.hidden && c.getClientRects().length);
          stagger(cards, 70);
          cards.forEach((c) => c.classList.remove('is-in'));
          void grid.offsetWidth;
          cards.forEach((c) => c.classList.add('is-in'));
        });
      });
      mo.observe(grid, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
      S.mo.push(mo);
    });
  };

  /* ---------- off switch ------------------------------------------------- */
  const disable = () => {
    S.off = true;
    clearTimeout(S.timer);
    if (S.io) S.io.disconnect();
    if (S.live) S.live.disconnect();
    S.mo.forEach((m) => m.disconnect());
    root.classList.remove('js-motion', 'm-pre');
    $('.m-art,.m-sky').forEach((e) => e.remove());
  };

  /* ---------- init ------------------------------------------------------- */
  const init = () => {
    S.io = new IntersectionObserver((entries) => {
      S.fired = true;
      entries.forEach((e) => { if (e.isIntersecting) reveal(e.target); });
    }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
    S.live = new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-live', e.isIntersecting));
    }, { threshold: 0, rootMargin: '120px 0px' });

    /* 1 · hero: sequenced entrance (home + page heroes) */
    $('.home-content,.page-hero').forEach((h) => {
      if (blocked(h)) return;
      let n = 0;
      Array.from(h.children).forEach((c) => {
        if (/^(script|style|svg)$/i.test(c.tagName)) return;
        const d = 80 + n++ * 110;
        if (/^h[12]$/i.test(c.tagName)) {
          if (mark(c, 'head', { d: d })) split(c);
        } else if (mark(c, 'rise', { d: d })) {
          $('h1,h2', c).forEach((hh) => { if (mark(hh, 'head', { d: d })) split(hh); });
        }
      });
    });

    /* 2 · containers (marked first so their contents are not double-animated) */
    const pops = markAll('.sector-card,.values-grid>*,.fleet-spec-grid>*,.client-project-card,.home-project-card,.stats-inline>*,.projects-highlight', 'pop');
    markAll('.company-index-art', 'pop');
    staggerGroups(pops, 100);
    $('.contact-static').forEach((s) => {
      Array.from(s.children).forEach((c, i) => mark(c, 'slide', { dir: i === 0 ? 'left' : 'right', d: i * 120 }));
    });
    $('.upcoming-card').forEach((c, i) => mark(c, 'slide', { dir: i % 2 === 0 ? 'left' : 'right', d: 0 }));

    $('.fleet-row,.location-list>div').forEach((r, i) => {
      if (mark(r, 'row', { d: 0 })) {
        r.setAttribute('data-rule', 'bottom');
        addScrub(r, 'rule');
      }
    });
    $('.fleet-row').forEach((r) => rows.push(r));
    staggerGroups($('[data-m="row"]'), 70);

    $('.vertical-detail').forEach((vd, i) => {
      const img = vd.querySelector('.vertical-image');
      if (!img) return;
      const left = !(i % 2); /* even details place the image on the right (see styles.css) */
      if (mark(img, 'curtain', { dir: left ? 'left' : 'right' })) addScrub(img, 'parallax');
    });
    $('.page-two-col>img,.page-two-col>video').forEach((m) => {
      const second = m === m.parentElement.children[1];
      mark(m, 'curtain', { dir: second ? 'right' : 'left' });
    });

    /* 3 · display type & text */
    markAll('h1,h2', 'head').forEach(split);
    markAll('.section-top', 'rise');
    markAll('.eyebrow,.mini-label,.intro-lede,.page-lede,.content-note,.project-disclaimer,.portfolio-data-note,' +
      '.project-tools,.home-actions,.home-meta,.home-bottom,.careers-note,.leader-placeholder,' +
      '.button-primary,.button-dark,.text-link,.arrow-link,main p', 'rise');
    $('.careers-values').forEach((v) => Array.from(v.children).forEach((c, i) => mark(c, 'rise', { d: i * 110 })));
    $('.site-footer').forEach((f) => mark(f, 'rise', { d: 0 }));

    /* Careers display type: wipe in, then drift against the scroll */
    $('.careers-mark').forEach((m) => {
      Array.from(m.children).forEach((c, i) => {
        if (mark(c, 'wipe', { d: i * 160 })) addScrub(c, 'drift', { speed: [70, -70, 70][i % 3] });
      });
    });
    $('.careers-note').forEach((e) => { if (!e.hasAttribute('data-scrub')) { e.setAttribute('data-rule', 'top'); addScrub(e, 'rule'); } });

    /* 4 · line art, CTA skyline, backgrounds */
    hero = document.querySelector('.page-hero') || document.querySelector('.home-section');
    if (hero && ART[page] && hero.classList.contains('page-hero')) {
      hero.insertAdjacentHTML('beforeend', ART[page]());
      const art = hero.lastElementChild;
      art.setAttribute('data-m', 'draw');
      S.targets.push(art);
      S.live.observe(art);
    }
    $('.page-cta').forEach((c) => {
      if (blocked(c)) return;
      c.insertAdjacentHTML('beforeend', skyMarkup());
      const sky = c.lastElementChild;
      S.targets.push(sky);
      mark(c, 'cta');
    });

    const bg = (sel, kind) => $(sel).forEach((el) => {
      if (el.matches(EX) || el.querySelector(EX) || el.hasAttribute('data-bg')) return;
      el.setAttribute('data-bg', kind);
      el.setAttribute('data-live', '');
      S.live.observe(el);
    });
    bg('.page-hero', 'grid');
    bg('.fleet-strip,.page-cta', 'grid-light');
    bg('.company-profile,.company-section,.capabilities-section,.careers-section,.locations-section,.home-client-projects', 'dots');
    bg('.projects-section,.upcoming-section,.client-portfolio-section', 'hatch');
    bg('.sustainability-section', 'glow');

    /* scroll cue arrow in the home hero bar */
    $('.home-bottom').forEach((hb) => {
      if (blocked(hb)) return;
      const w = document.createTreeWalker(hb, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (w.nextNode()) nodes.push(w.currentNode);
      nodes.forEach((n) => {
        const i = n.textContent.indexOf('↓');
        if (i < 0) return;
        const f = document.createDocumentFragment();
        const a = n.textContent.slice(0, i), b = n.textContent.slice(i + 1);
        const el = document.createElement('i');
        el.className = 'm-bob';
        el.textContent = '↓';
        if (a) f.appendChild(document.createTextNode(a));
        f.appendChild(el);
        if (b) f.appendChild(document.createTextNode(b));
        n.parentNode.replaceChild(f, n);
      });
    });

    /* 5 · go live: hidden states switch on in the same task the guard comes off */
    root.classList.add('js-motion');
    root.classList.remove('m-pre');
    S.targets.forEach((t) => S.io.observe(t));
    watchFilters();

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    document.addEventListener('focusin', (e) => {
      const t = e.target.closest && e.target.closest('[data-m]:not(.is-in)');
      if (t) reveal(t, true);
    });
    schedule();

    /* If the observer never reports back, never leave content hidden */
    S.timer = setTimeout(() => { if (!S.fired) revealAll(); }, 3500);

    /* Layout shifts after fonts load → keep ScrollTrigger (home journey) in sync */
    const after = () => {
      schedule();
      try { if (window.ScrollTrigger && typeof ScrollTrigger.refresh === 'function') ScrollTrigger.refresh(); } catch (e) { /* ignore */ }
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(after);
    window.addEventListener('load', after, { once: true });
  };

  const boot = () => {
    try { init(); } catch (err) {
      if (window.console) console.error('[aid-motion] disabled:', err);
      disable();
    }
  };

  if (rm.addEventListener) rm.addEventListener('change', (e) => { if (e.matches) disable(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
