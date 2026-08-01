/* ============================================================
   SPORT CRIME — REDESIGN / interactions
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  /* ---------------- PRELOADER ---------------- */
  const preloader = $('#preloader');
  const preCount = $('#preloader-count');
  const preFill = $('#preloader-fill');
  let progress = 0;

  function tickPreloader() {
    progress = Math.min(100, progress + Math.random() * 16 + 8);
    const val = Math.round(progress);
    if (preCount) preCount.textContent = String(val).padStart(2, '0');
    if (preFill) preFill.style.width = progress + '%';
    if (progress < 100) {
      setTimeout(tickPreloader, 130 + Math.random() * 160);
    } else {
      finishPreloader();
    }
  }
  function finishPreloader() {
    preloader.classList.add('done');
    document.body.classList.add('loaded');
    document.body.style.overflow = '';
    if (reduced) return;
    $$('#hero .reveal', document.body).forEach(el => el.classList.add('in'));
    $$('#hero .hero-title .line', document.body).forEach(el => el.classList.add('in'));
    animateHero();
  }

  if (reduced) {
    preloader.classList.add('done');
    document.body.classList.add('loaded');
  } else {
    document.body.style.overflow = 'hidden';
    tickPreloader();
  }

  /* ---------------- HERO VIDEO ---------------- */
  const heroVideo = $('#heroVideo');
  function animateHero() {
    if (!heroVideo) return;
    if (reduced) return;
    try {
      const p = heroVideo.play();
      if (p && p.then) {
        p.then(() => heroVideo.classList.add('is-live')).catch(() => {});
      }
    } catch (e) {
      heroVideo.classList.remove('is-live');
    }
    heroVideo.addEventListener('playing', () => heroVideo.classList.add('is-live'), { once: true });
    if (heroVideo.readyState >= 3) heroVideo.classList.add('is-live');
  }

  /* ---------------- CUSTOM CURSOR ---------------- */
  const dot = $('#cursorDot');
  const ring = $('#cursorRing');
  if (dot && ring && !isCoarse && !reduced) {
    let mx = -100, my = -100, rx = -100, ry = -100;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
    });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(loop);
    })();
    const hoverable = 'a, button, .cast-card, .g-item, .platform, input, textarea, [data-reveal], .video-wrap';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(hoverable)) document.body.classList.add('has-ring');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(hoverable)) document.body.classList.remove('has-ring');
    });
  } else if (dot && ring) {
    dot.style.display = 'none';
    ring.style.display = 'none';
  }

  /* ---------------- NAV SCROLL STATE ---------------- */
  const nav = $('#nav');
  let lastY = 0;
  function onScrollNav() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (y > 600 && y > lastY + 6 && !$('#mobileMenu').classList.contains('open')) {
      nav.classList.add('hidden');
    } else if (y < lastY - 4 || y < 600) {
      nav.classList.remove('hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  /* ---------------- MOBILE MENU ---------------- */
  const burger = $('#navBurger');
  const menu = $('#mobileMenu');
  burger.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#mobileMenu a').forEach(a =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      burger.classList.remove('open');
      document.body.style.overflow = '';
    })
  );

  /* ---------------- SCROLL REVEAL ---------------- */
  const revealEls = $$('.reveal, [data-reveal]');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(en => {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('in'));
  }

  /* ---------------- TITLE LINES (about/cast etc.) ---------------- */
  const lineIO = new IntersectionObserver(
    entries => entries.forEach(en => en.isIntersecting && en.target.classList.add('in')),
    { threshold: 0.4 }
  );
  $$('.sec-title .line').forEach(l => lineIO.observe(l));

  /* ---------------- VIDEO LIGHTBOX ---------------- */
  const lightbox = $('#lightbox');
  const lv = $('#lightboxVideo');
  function openLightbox() {
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    const p = lv.play();
    if (p && p.then) p.catch(() => {});
  }
  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    lv.pause();
    lv.currentTime = 0;
    document.body.style.overflow = '';
  }
  $('#playTeaser').addEventListener('click', openLightbox);
  const aboutPoster = $('#aboutVideoPoster');
  const aboutPlay = $('#aboutPlay');
  if (aboutPoster) aboutPoster.addEventListener('click', openLightbox);
  if (aboutPlay) aboutPlay.addEventListener('click', e => {
    e.stopPropagation();
    openLightbox();
  });
  $('#lightboxClose').addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (lightbox.classList.contains('open')) closeLightbox();
      if (disclaimer.classList.contains('open')) closeDisclaimer();
    }
  });

  /* ---------------- DISCLAIMER ---------------- */
  const disclaimer = $('#disclaimer');
  function openDisclaimer() {
    disclaimer.classList.add('open');
    disclaimer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeDisclaimer() {
    disclaimer.classList.remove('open');
    disclaimer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  $('#disclaimerBtn').addEventListener('click', openDisclaimer);
  $$('[data-close-disclaimer]').forEach(b => b.addEventListener('click', closeDisclaimer));
  disclaimer.addEventListener('click', e => {
    if (e.target === disclaimer) closeDisclaimer();
  });

  /* ---------------- DRAG SCROLLERS ---------------- */
  function makeDraggable(scroller) {
    let down = false, startX = 0, startScroll = 0, moved = 0;
    scroller.addEventListener('pointerdown', e => {
      down = true;
      moved = 0;
      startX = e.clientX;
      startScroll = scroller.scrollLeft;
      scroller.classList.add('dragging');
      scroller.setPointerCapture(e.pointerId);
    });
    scroller.addEventListener('pointermove', e => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      scroller.scrollLeft = startScroll - dx;
    });
    const end = () => {
      down = false;
      scroller.classList.remove('dragging');
    };
    scroller.addEventListener('pointerup', end);
    scroller.addEventListener('pointercancel', end);
    scroller.addEventListener('click', e => {
      if (moved > 6) e.preventDefault();
    }, true);
  }
  const castScroller = $('#castScroller');
  const galleryScroller = $('#galleryScroller');
  if (castScroller) makeDraggable(castScroller);
  if (galleryScroller) makeDraggable(galleryScroller);

  /* ---------------- CAST ARROWS ---------------- */
  function scrollCastBy(dir) {
    if (!castScroller) return;
    const card = castScroller.querySelector('.cast-card');
    const step = (card ? card.offsetWidth : 340) + 16;
    castScroller.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  $('#castPrev')?.addEventListener('click', () => scrollCastBy(-1));
  $('#castNext')?.addEventListener('click', () => scrollCastBy(1));

  /* ---------------- GALLERY PROGRESS ---------------- */
  const galleryBar = $('#galleryBar');
  const galleryCount = $('#galleryCount');
  function galleryProgress() {
    if (!galleryScroller) return;
    const max = galleryScroller.scrollWidth - galleryScroller.clientWidth;
    const ratio = max > 0 ? galleryScroller.scrollLeft / max : 0;
    if (galleryBar) galleryBar.style.width = ratio * 100 + '%';
    if (galleryCount) {
      const items = $$('.g-item', galleryScroller).length;
      const idx = Math.min(items, Math.max(1, Math.round((ratio * (items - 1)) + 1)));
      galleryCount.textContent = String(idx).padStart(2, '0') + ' / ' + String(items).padStart(2, '0');
    }
  }
  if (galleryScroller) {
    galleryScroller.addEventListener('scroll', galleryProgress, { passive: true });
    window.addEventListener('resize', galleryProgress);
    galleryProgress();
  }

  /* ---------------- HASHTAG PARALLAX ---------------- */
  const hashtagTitle = $('#hashtagTitle');
  function hashtagParallax() {
    if (!hashtagTitle || reduced) return;
    const r = hashtagTitle.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;
    const center = r.top + r.height / 2 - vh / 2;
    const range = 70;
    const t = Math.max(-range, Math.min(range, center * -0.35));
    hashtagTitle.style.transform = 'translateX(' + t + 'px)';
  }
  window.addEventListener('scroll', hashtagParallax, { passive: true });
  hashtagParallax();

  /* ---------------- FOOTER YEAR ---------------- */
  $$('.footer-year').forEach(el => (el.textContent = new Date().getFullYear()));
})();
