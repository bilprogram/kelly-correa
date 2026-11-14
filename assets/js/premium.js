/**
 * KELLY CORRÊA — PREMIUM SHARED MOTION (inner pages)
 * Reuses GSAP, ScrollTrigger and main.js from the home page.
 */
const PREMIUM_MOTION_CONFIG = {
  ease: { soft: 'cubic-bezier(0.22, 1, 0.36, 1)', mask: 'cubic-bezier(0.65, 0, 0.35, 1)' },
  heading: { duration: 1.05, stagger: 0.10 },
  reveal: { duration: 0.95, y: 21, blur: 4, start: 'top 85%' },
  curtain: { duration: 1.2 },
  faq: { duration: 480 },
  safetyMs: 3000
};

(function () {
  'use strict';
  var cfg = PREMIUM_MOTION_CONFIG;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  function show(el) {
    el.classList.add('p-shown');
    el.style.opacity = '1';
    el.style.transform = 'none';
    el.style.filter = 'none';
    el.style.clipPath = 'none';
  }

  // Safety fallback: after 3s from load, force all elements visible
  function armSafety() {
    setTimeout(function () {
      document.querySelectorAll('.line-mask .line-inner, .p-reveal, .p-curtain').forEach(show);
    }, cfg.safetyMs);
  }

  function initFaq() {
    document.querySelectorAll('details.p-faq-item').forEach(function (item) {
      var answer = item.querySelector('.faq-answer');
      if (!answer) return;
      item.addEventListener('toggle', function () {
        if (!item.open || reduced || !answer.animate) return;
        answer.animate(
          [{ height: '0px', opacity: 0 }, { height: answer.scrollHeight + 'px', opacity: 1 }],
          { duration: cfg.faq.duration, easing: cfg.ease.soft }
        );
      });
    });
  }

  function initBlobs() {
    var blobs = document.querySelectorAll('.p-blob');
    if (!blobs.length || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('p-paused', !e.isIntersecting); });
    });
    blobs.forEach(function (b) { io.observe(b); });
  }

  function initMotion() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);

    // Initial state set programmatically by GSAP
    var heroLines = gsap.utils.toArray('.page-hero .line-mask .line-inner, .p-page-hero .line-mask .line-inner');
    var otherLines = gsap.utils.toArray('.section .line-mask .line-inner, .p-secao .line-mask .line-inner');
    var reveals = gsap.utils.toArray('.p-reveal');
    var curtains = gsap.utils.toArray('.p-curtain');

    // 1. Hero headline animates immediately on page entrance
    if (heroLines.length > 0) {
      gsap.fromTo(heroLines,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: cfg.heading.duration,
          stagger: cfg.heading.stagger,
          ease: cfg.ease.soft,
          delay: 0.1,
          onComplete: function () { heroLines.forEach(show); }
        }
      );
    }

    // 2. Headings on sections below the fold
    otherLines.forEach(function (el) {
      gsap.fromTo(el,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: cfg.heading.duration,
          ease: cfg.ease.soft,
          scrollTrigger: {
            trigger: el.closest('.line-mask') || el,
            start: 'top 88%',
            once: true,
            onEnter: function () {
              gsap.to(el, {
                yPercent: 0,
                duration: cfg.heading.duration,
                ease: cfg.ease.soft,
                onComplete: function () { show(el); }
              });
            }
          }
        }
      );
    });

    // 3. Batched reveals for cards, highlight boxes, paragraphs
    if (reveals.length > 0) {
      gsap.set(reveals, { opacity: 0, y: cfg.reveal.y, filter: 'blur(' + cfg.reveal.blur + 'px)' });
      ST.batch(reveals, {
        start: cfg.reveal.start,
        once: true,
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: cfg.reveal.duration,
            stagger: 0.08,
            ease: cfg.ease.soft,
            onComplete: function () { batch.forEach(show); }
          });
        }
      });
    }

    // 4. Curtains for maps/images
    curtains.forEach(function (el) {
      gsap.fromTo(el,
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          duration: cfg.curtain.duration,
          ease: cfg.ease.mask,
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true
          },
          onComplete: function () { show(el); }
        }
      );
    });

    // 5. Timeline line drawing
    gsap.utils.toArray('.p-timeline-draw').forEach(function (el) {
      ST.create({
        trigger: el,
        start: 'top 80%',
        end: 'bottom 60%',
        scrub: true,
        onUpdate: function (self) {
          el.style.setProperty('--p-draw', self.progress.toFixed(3));
        }
      });
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ST.refresh(); });
    }
    window.addEventListener('load', function () { ST.refresh(); });
  }

  function boot() {
    initFaq();
    initBlobs();
    armSafety();
    if (hasGsap && !reduced) {
      initMotion();
    } else {
      document.querySelectorAll('.line-mask .line-inner, .p-reveal, .p-curtain').forEach(show);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
