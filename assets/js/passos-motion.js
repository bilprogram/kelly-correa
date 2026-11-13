/**
 * ============================================================================
 * KELLY CORRÊA — NEUROPSICOPEDAGOGIA CLÍNICA
 * PRIMEIROS PASSOS / COMO INICIAR O CONTATO (.passos)
 * Motion Controller: Timeline Line, Node Pulses, Number Fill, Spotlight & Magnetic CTA
 * ============================================================================
 */

// TIMING & EASING TOKENS (Expostos no topo para calibração)
const PASSOS_MOTION_CONFIG = {
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
    cardCurtain: 1.3,
    cardContentStagger: 0.08,
    nodePulse: 1.2,
    numberFill: 0.8,
    ctaReveal: 0.8,
    safetyTimeoutMs: 3000
  },
  magnetic: {
    pullX: 0.22,
    pullY: 0.30
  }
};

(function () {
  'use strict';

  let passosAnimated = false;

  /**
   * SAFETY FALLBACK (Step 6)
   * Força todos os elementos visíveis caso o ScrollTrigger não dispare em 3s
   */
  function forcePassosVisible() {
    if (passosAnimated) return;
    passosAnimated = true;

    if (typeof gsap !== 'undefined') {
      gsap.set([
        '.passos__eyebrow-line',
        '.passos__eyebrow',
        '.passos__headline .passos__line-inner',
        '.passos__em',
        '.passos__lead',
        '.passos__card',
        '.passos__card-content > *',
        '.passos__node',
        '.passos__number-fill',
        '.passos__cta-wrap'
      ], {
        opacity: 1,
        filter: 'none',
        transform: 'none',
        clipPath: 'none',
        clearProps: 'clipPath,transform,opacity,filter',
        willChange: 'auto'
      });

      const path = document.querySelector('.passos__timeline-path');
      if (path) {
        path.style.strokeDashoffset = '0';
      }

      document.querySelectorAll('.passos__card').forEach(c => c.classList.add('is-active'));
      document.querySelectorAll('.passos__node').forEach(n => n.classList.add('is-active'));
    }
  }

  function initPassosMotion() {
    const passosSection = document.querySelector('.passos');
    if (!passosSection) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      forcePassosVisible();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const cfg = PASSOS_MOTION_CONFIG;
    const cards = Array.from(passosSection.querySelectorAll('.passos__card'));
    const timelineWrap = passosSection.querySelector('.passos__timeline-wrap');
    const timelinePath = passosSection.querySelector('.passos__timeline-path');
    const timelinePathBg = passosSection.querySelector('.passos__timeline-path-bg');
    const nodes = Array.from(passosSection.querySelectorAll('.passos__node'));
    const ctaWrap = passosSection.querySelector('.passos__cta-wrap');
    const ctaBtn = passosSection.querySelector('.passos__btn');
    const halo = passosSection.querySelector('.passos__halo');

    // Safety fallback timer de 3 segundos quando a seção entra no viewport
    if ('IntersectionObserver' in window) {
      const safetyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(forcePassosVisible, cfg.timings.safetyTimeoutMs);
            safetyObserver.disconnect();
          }
        });
      }, { threshold: 0.1 });
      safetyObserver.observe(passosSection);
    }

    // =========================================================================
    // STEP 6 — HEADING ENTRANCE (Left Aligned, Eyebrow Line, H2 Mask & Lead)
    // =========================================================================
    const headingElements = [
      '.passos__eyebrow-line',
      '.passos__eyebrow',
      '.passos__headline .passos__line-inner',
      '.passos__em',
      '.passos__lead'
    ];

    const headingTl = gsap.timeline({
      scrollTrigger: {
        id: 'passos-heading',
        trigger: passosSection,
        start: 'top 75%',
        once: true,
        onStart: () => { 
          passosAnimated = true; 
          gsap.set(headingElements, { willChange: 'transform,opacity,filter' });
        }
      },
      onComplete: () => {
        gsap.set(headingElements, { clearProps: 'willChange' });
      }
    });

    headingTl
      .fromTo('.passos__eyebrow-line', 
        { scaleX: 0 }, 
        { scaleX: 1, duration: cfg.timings.eyebrowLine, ease: cfg.easings.mask }
      )
      .fromTo('.passos__eyebrow', 
        { opacity: 0, x: -12 }, 
        { opacity: 1, x: 0, duration: cfg.timings.eyebrowText, ease: cfg.easings.soft }, 
        '-=0.7'
      )
      .fromTo('.passos__headline .passos__line-inner', 
        { yPercent: 110 }, 
        { yPercent: 0, duration: cfg.timings.headingMask, stagger: cfg.timings.headingStagger, ease: cfg.easings.mask }, 
        '-=0.6'
      )
      .fromTo('.passos__em', 
        { filter: 'blur(12px)', opacity: 0 }, 
        { filter: 'blur(0px)', opacity: 1, duration: cfg.timings.italicFocus, ease: cfg.easings.soft }, 
        '-=1.0'
      )
      .fromTo('.passos__lead', 
        { y: 24, filter: 'blur(6px)', opacity: 0 }, 
        { y: 0, filter: 'blur(0px)', opacity: 1, duration: cfg.timings.leadFade, ease: cfg.easings.soft }, 
        '-=1.1'
      );

    // =========================================================================
    // STEP 3 — BACKGROUND HALO PARALLAX
    // =========================================================================
    if (halo) {
      gsap.fromTo(halo, 
        { yPercent: -8 }, 
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: passosSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    }

    // =========================================================================
    // STEP 2 & 4 — TIMELINE PATH & NODE GEOMETRY UPDATE
    // =========================================================================
    let totalPathLength = 1000;

    function updateTimelinePath() {
      if (!timelineWrap || !timelinePath || nodes.length < 3) return;

      const wrapRect = timelineWrap.getBoundingClientRect();
      const isDesktop = window.innerWidth >= 1025;

      const pts = nodes.map(node => {
        const nRect = node.getBoundingClientRect();
        return {
          x: nRect.left + nRect.width / 2 - wrapRect.left,
          y: nRect.top + nRect.height / 2 - wrapRect.top
        };
      });

      let d = '';
      if (isDesktop) {
        // Trajetória diagonal em escada fluida com curvas bezier suaves
        const dx1 = pts[1].x - pts[0].x;
        const dx2 = pts[2].x - pts[1].x;
        d = `M ${pts[0].x} ${pts[0].y} ` +
            `C ${pts[0].x + dx1 * 0.5} ${pts[0].y}, ` +
            `  ${pts[0].x + dx1 * 0.5} ${pts[1].y}, ` +
            `  ${pts[1].x} ${pts[1].y} ` +
            `C ${pts[1].x + dx2 * 0.5} ${pts[1].y}, ` +
            `  ${pts[1].x + dx2 * 0.5} ${pts[2].y}, ` +
            `  ${pts[2].x} ${pts[2].y}`;
      } else {
        // Em mobile / tablet: linha vertical conectando os nós alinhados à esquerda
        d = `M ${pts[0].x} ${pts[0].y} L ${pts[1].x} ${pts[1].y} L ${pts[2].x} ${pts[2].y}`;
      }

      timelinePath.setAttribute('d', d);
      if (timelinePathBg) {
        timelinePathBg.setAttribute('d', d);
      }

      totalPathLength = timelinePath.getTotalLength() || 1000;
      timelinePath.style.strokeDasharray = `${totalPathLength} ${totalPathLength}`;
    }

    updateTimelinePath();

    // =========================================================================
    // STEP 7 — MATCH MEDIA (Desktop vs Mobile vs Reduced Motion)
    // =========================================================================
    const mm = gsap.matchMedia();

    // 1. PREFERS-REDUCED-MOTION: Fallback imediato e estático
    mm.add('(prefers-reduced-motion: reduce)', () => {
      forcePassosVisible();
    });

    // 2. TIMELINE SCROLL SCRUB & STEP ACTIVATION
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      updateTimelinePath();

      const stepStates = [false, false, false];

      function setStepActive(idx, active) {
        if (stepStates[idx] === active) return;
        stepStates[idx] = active;

        const card = cards[idx];
        const node = nodes[idx];
        if (!card || !node) return;

        const nodeDot = node.querySelector('.passos__node-dot');
        const nodeRing = node.querySelector('.passos__node-ring');
        const numFill = card.querySelector('.passos__number-fill');

        if (active) {
          card.classList.add('is-active');
          node.classList.add('is-active');

          if (nodeDot) {
            gsap.to(nodeDot, { scale: 1.8, backgroundColor: '#7B9E89', duration: 0.35, ease: cfg.easings.soft });
          }
          if (nodeRing) {
            gsap.fromTo(nodeRing, 
              { scale: 1, opacity: 0.4 }, 
              { scale: 2.4, opacity: 0, duration: cfg.timings.nodePulse, ease: 'power2.out' }
            );
          }
          if (numFill) {
            gsap.to(numFill, { clipPath: 'inset(0% 0 0 0)', duration: cfg.timings.numberFill, ease: cfg.easings.soft });
          }

          // Quando o terceiro passo é ativado, o CTA surge com elegância
          if (idx === 2 && ctaWrap) {
            gsap.to(ctaWrap, { opacity: 1, y: 0, duration: cfg.timings.ctaReveal, ease: cfg.easings.soft });
          }
        } else {
          card.classList.remove('is-active');
          node.classList.remove('is-active');

          if (nodeDot) {
            gsap.to(nodeDot, { scale: 1, backgroundColor: 'rgba(8, 18, 40, 0.25)', duration: 0.3 });
          }
          if (numFill) {
            gsap.to(numFill, { clipPath: 'inset(100% 0 0 0)', duration: 0.5, ease: 'power2.inOut' });
          }
        }
      }

      const isDesktop = window.matchMedia('(min-width: 769px)').matches;

      // Linha desenha com o scroll (stroke-dashoffset scrubbed)
      if (timelinePath && timelineWrap) {
        gsap.fromTo(timelinePath, 
          { strokeDashoffset: () => totalPathLength }, 
          {
            strokeDashoffset: 0,
            ease: 'none',
            scrollTrigger: {
              id: 'passos-line',
              trigger: timelineWrap,
              start: 'top 70%',
              end: 'bottom 60%',
              scrub: isDesktop ? 0.3 : 0.8,
              onUpdate: (self) => {
                const p = self.progress;
                setStepActive(0, p >= 0.08);
                setStepActive(1, p >= 0.45);
                setStepActive(2, p >= 0.82);
              }
            }
          }
        );
      }

      // STEP 4 — ENTRADA EM CORTINA POR STEP (ScrollTrigger.batch)
      ScrollTrigger.batch(cards, {
        start: 'top 80%',
        once: true,
        onEnter: (batch) => {
          batch.forEach((card, idx) => {
            const cardContent = card.querySelectorAll('.passos__card-content > *');
            const tl = gsap.timeline({
              onStart: () => {
                gsap.set(card, { willChange: 'clip-path' });
                if (cardContent.length > 0) gsap.set(cardContent, { willChange: 'transform,opacity,filter' });
              },
              onComplete: () => {
                gsap.set(card, { clearProps: 'willChange' });
                if (cardContent.length > 0) gsap.set(cardContent, { clearProps: 'willChange' });
              }
            });
            tl.fromTo(card, 
              { clipPath: 'inset(0 0 100% 0 round 28px)' }, 
              { clipPath: 'inset(0 0 0% 0 round 28px)', duration: cfg.timings.cardCurtain, ease: cfg.easings.mask, delay: idx * 0.12 }
            )
            .fromTo(cardContent, 
              { y: 24, filter: 'blur(6px)', opacity: 0 }, 
              { y: 0, filter: 'blur(0px)', opacity: 1, duration: 0.9, stagger: cfg.timings.cardContentStagger, ease: cfg.easings.soft }, 
              '-=0.8'
            );
          });
        }
      });
    });

    // =========================================================================
    // STEP 5 — STEP HOVER & SPOTLIGHT (Desktop fine pointer)
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

      // STEP 7 — BOTÃO CTA MAGNÉTICO
      if (ctaBtn) {
        ctaBtn.addEventListener('mousemove', (e) => {
          const rect = ctaBtn.getBoundingClientRect();
          const dx = e.clientX - (rect.left + rect.width / 2);
          const dy = e.clientY - (rect.top + rect.height / 2);
          gsap.to(ctaBtn, {
            x: dx * cfg.magnetic.pullX,
            y: dy * cfg.magnetic.pullY,
            duration: 0.3,
            ease: 'power2.out'
          });
        });

        ctaBtn.addEventListener('mouseleave', () => {
          gsap.to(ctaBtn, { x: 0, y: 0, duration: 0.7, ease: cfg.easings.soft });
        });
      }
    }

    // P-07: Recalcula geometria de traçado com ScrollTrigger.refresh debounced
    const debouncedRefresh = () => {
      if (typeof ScrollTrigger === 'undefined') return;
      if (window._stRefreshRaf) cancelAnimationFrame(window._stRefreshRaf);
      window._stRefreshRaf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        window._stRefreshRaf = null;
      });
    };

    const handleResize = () => {
      updateTimelinePath();
      debouncedRefresh();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        updateTimelinePath();
        debouncedRefresh();
      });
    }

    window.addEventListener('load', () => {
      updateTimelinePath();
      debouncedRefresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPassosMotion);
  } else {
    initPassosMotion();
  }
})();

