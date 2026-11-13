/**
 * ============================================================================
 * KELLY CORRÊA — NEUROPSICOPEDAGOGIA CLÍNICA
 * RELAÇÕES DE CONFIANÇA / VIVÊNCIAS E RELATOS (.relatos)
 * Motion Controller: Word Fill, Mask Reveals, Parallax Blobs, Spotlight & Safety Fallback
 * ============================================================================
 */

// TIMING & EASING TOKENS (Expostos no topo para calibração)
const RELATOS_MOTION_CONFIG = {
  easings: {
    soft: "cubic-bezier(0.22, 1, 0.36, 1)", // --ease-soft
    mask: "cubic-bezier(0.65, 0, 0.35, 1)", // --ease-mask
    expoOut: "expo.out"
  },
  timings: {
    eyebrowLine: 0.9,
    eyebrowText: 0.9,
    headingMask: 1.2,
    headingStagger: 0.12,
    italicFocus: 1.4,
    leadFade: 1.1,
    quoteMarkFade: 1.2,
    cardCurtain: 1.3,
    cardStagger: 0.14,
    cardContentFade: 0.9,
    dividerDraw: 1.2,
    ethicalFade: 1.0,
    safetyTimeoutMs: 3000
  }
};

(function () {
  'use strict';

  let relatosAnimated = false;

  /**
   * SAFETY FALLBACK (Step 6)
   * Força todos os elementos visíveis caso o ScrollTrigger não dispare em 3s
   */
  function forceRelatosVisible() {
    if (relatosAnimated) return;
    relatosAnimated = true;

    if (typeof gsap !== 'undefined') {
      gsap.set([
        '.relatos__eyebrow-line',
        '.relatos__eyebrow',
        '.relatos__headline .relatos__line-inner',
        '.relatos__em',
        '.relatos__lead',
        '.relatos__quote-mark',
        '.relatos__featured-author',
        '.relatos__card',
        '.relatos__card-content > *',
        '.relatos__divider',
        '.relatos__ethical'
      ], {
        opacity: 1,
        filter: 'none',
        transform: 'none',
        clipPath: 'none',
        clearProps: 'clipPath,transform,filter',
        willChange: 'auto'
      });

      gsap.set('.relatos__word', { color: 'rgba(247, 244, 238, 1)' });

      const cards = document.querySelectorAll('.relatos__card');
      cards.forEach((c, idx) => {
        if (window.innerWidth >= 1025 && idx === 1) {
          c.style.transform = 'translateY(24px)';
        } else {
          c.style.transform = 'none';
        }
      });

      const divider = document.querySelector('.relatos__divider');
      if (divider) divider.style.transform = 'scaleX(1)';
    }
  }

  function initRelatosMotion() {
    const relatosSection = document.querySelector('.relatos');
    if (!relatosSection) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      forceRelatosVisible();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const cfg = RELATOS_MOTION_CONFIG;
    const cards = Array.from(relatosSection.querySelectorAll('.relatos__card'));
    const quoteMark = relatosSection.querySelector('.relatos__quote-mark');
    const featuredQuote = relatosSection.querySelector('.relatos__featured-quote');
    const featuredWords = Array.from(relatosSection.querySelectorAll('.relatos__word'));
    const featuredAuthor = relatosSection.querySelector('.relatos__featured-author');
    const divider = relatosSection.querySelector('.relatos__divider');
    const ethicalNote = relatosSection.querySelector('.relatos__ethical');
    const blobs = Array.from(relatosSection.querySelectorAll('.relatos__blob'));

    // Safety fallback timer de 3 segundos quando a seção entra no viewport
    if ('IntersectionObserver' in window) {
      const safetyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(forceRelatosVisible, cfg.timings.safetyTimeoutMs);
            safetyObserver.disconnect();
          }
        });
      }, { threshold: 0.1 });
      safetyObserver.observe(relatosSection);

      // Pausa animação dos blobs quando a seção estiver fora de tela
      const blobObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          blobs.forEach(b => {
            b.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
          });
        });
      }, { threshold: 0 });
      blobObserver.observe(relatosSection);
    }

    // =========================================================================
    // STEP 6 — HEADING ENTRANCE (Left Aligned, Eyebrow Line, H2 Mask & Lead)
    // =========================================================================
    const headingTl = gsap.timeline({
      scrollTrigger: {
        id: 'relatos-heading',
        trigger: relatosSection,
        start: 'top 75%',
        once: true,
        onStart: () => { relatosAnimated = true; }
      }
    });

    headingTl
      .fromTo('.relatos__eyebrow-line', 
        { scaleX: 0 }, 
        { scaleX: 1, duration: cfg.timings.eyebrowLine, ease: cfg.easings.mask }
      )
      .fromTo('.relatos__eyebrow', 
        { opacity: 0, x: -12 }, 
        { opacity: 1, x: 0, duration: cfg.timings.eyebrowText, ease: cfg.easings.soft }, 
        '-=0.7'
      )
      .fromTo('.relatos__headline .relatos__line-inner', 
        { yPercent: 110 }, 
        { yPercent: 0, duration: cfg.timings.headingMask, stagger: cfg.timings.headingStagger, ease: cfg.easings.expoOut }, 
        '-=0.6'
      )
      .fromTo('.relatos__em', 
        { filter: 'blur(12px)', opacity: 0 }, 
        { filter: 'blur(0px)', opacity: 1, duration: cfg.timings.italicFocus, ease: cfg.easings.soft }, 
        '-=1.0'
      )
      .fromTo('.relatos__lead', 
        { y: 24, filter: 'blur(6px)', opacity: 0 }, 
        { y: 0, filter: 'blur(0px)', opacity: 1, duration: cfg.timings.leadFade, ease: cfg.easings.soft }, 
        '-=1.1'
      )
      .fromTo(divider,
        { scaleX: 0 },
        { scaleX: 1, duration: cfg.timings.dividerDraw, ease: cfg.easings.mask },
        '-=0.8'
      )
      .fromTo(ethicalNote,
        { opacity: 0 },
        { opacity: 1, duration: cfg.timings.ethicalFade, ease: cfg.easings.soft },
        '-=0.6'
      );

    // =========================================================================
    // STEP 3 & 4 — BACKGROUND BLOBS & GIANT QUOTATION MARK PARALLAX
    // =========================================================================
    blobs.forEach((blob, idx) => {
      gsap.fromTo(blob, 
        { yPercent: idx % 2 === 0 ? -8 : 8 }, 
        {
          yPercent: idx % 2 === 0 ? 8 : -8,
          ease: 'none',
          scrollTrigger: {
            trigger: relatosSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    });

    if (quoteMark) {
      gsap.fromTo(quoteMark, 
        { opacity: 0 }, 
        {
          opacity: 0.08,
          duration: cfg.timings.quoteMarkFade,
          ease: cfg.easings.soft,
          scrollTrigger: {
            trigger: quoteMark,
            start: 'top 85%',
            once: true
          }
        }
      );

      gsap.fromTo(quoteMark,
        { yPercent: 0 },
        {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: featuredQuote,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    }

    // =========================================================================
    // STEP 7 — MATCH MEDIA (Desktop vs Mobile vs Reduced Motion)
    // =========================================================================
    const mm = gsap.matchMedia();

    // 1. PREFERS-REDUCED-MOTION: Fallback imediato e estático
    mm.add('(prefers-reduced-motion: reduce)', () => {
      forceRelatosVisible();
    });

    // 2. SCROLL MOTION (No preference)
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Step 4: Word-by-word fill no relato em destaque (data-preenche)
      if (featuredWords.length > 0 && featuredQuote) {
        gsap.to(featuredWords, {
          color: 'rgba(247, 244, 238, 1)',
          stagger: 0.05,
          ease: 'none',
          scrollTrigger: {
            trigger: featuredQuote,
            start: 'top 75%',
            end: 'bottom 55%',
            scrub: 0.6
          }
        });

        if (featuredAuthor) {
          gsap.fromTo(featuredAuthor,
            { opacity: 0, y: 16 },
            {
              opacity: 1,
              y: 0,
              duration: 0.9,
              ease: cfg.easings.soft,
              scrollTrigger: {
                trigger: featuredAuthor,
                start: 'top 85%',
                once: true
              }
            }
          );
        }
      }

      // Step 4: Entrada em cortina dos dois cards compactos
      if (cards.length > 0) {
        ScrollTrigger.batch(cards, {
          start: 'top 80%',
          once: true,
          onEnter: (batch) => {
            batch.forEach((card, idx) => {
              const tl = gsap.timeline();
              tl.fromTo(card, 
                { clipPath: 'inset(0 0 100% 0 round 28px)' }, 
                { clipPath: 'inset(0 0 0% 0 round 28px)', duration: cfg.timings.cardCurtain, ease: cfg.easings.mask, delay: idx * cfg.timings.cardStagger }
              )
              .fromTo(card.querySelectorAll('.relatos__card-content > *'), 
                { y: 20, filter: 'blur(6px)', opacity: 0 }, 
                { y: 0, filter: 'blur(0px)', opacity: 1, duration: cfg.timings.cardContentFade, stagger: 0.08, ease: cfg.easings.soft }, 
                '-=0.8'
              );
            });
          }
        });
      }
    });

    // =========================================================================
    // STEP 5 — CARD HOVER & SPOTLIGHT (Desktop fine pointer)
    // =========================================================================
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      cards.forEach(card => {
        let rafId = null;
        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            card.style.setProperty('--mx', `${x}px`);
            card.style.setProperty('--my', `${y}px`);
          });
        }, { passive: true });
      });
    }

    // Refresh em redimensionamento e fontes carregadas
    const handleRefresh = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleRefresh);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(handleRefresh);
    }

    window.addEventListener('load', handleRefresh);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRelatosMotion);
  } else {
    initRelatosMotion();
  }
})();
