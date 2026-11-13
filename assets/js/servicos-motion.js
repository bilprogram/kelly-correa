/**
 * ============================================================================
 * KELLY CORRÊA — NEUROPSICOPEDAGOGIA CLÍNICA
 * SERVIÇOS & MODALIDADES DE ATUAÇÃO (QUARTA DOBRA EDITORIAL)
 * Motion Controller: Stacking Cards, Living Aurora & Neural Thread
 * ============================================================================
 */

// STEP 1 — VARIÁVEIS DE CONFIGURAÇÃO (TIMING & EASING EXPOSTAS)
const SERVICOS_MOTION_CONFIG = {
  easings: {
    soft: "cubic-bezier(0.22, 1, 0.36, 1)", // --ease-soft
    mask: "cubic-bezier(0.65, 0, 0.35, 1)", // --ease-mask
    expoOut: "expo.out"
  },
  timings: {
    eyebrowLine: 0.9,
    eyebrowText: 0.9,
    headlineLine: 1.2,
    headlineStagger: 0.12,
    emFocus: 1.4,
    introText: 1.1,
    cardClipDuration: 1.4,
    cardContentStagger: 0.1,
    counterRoll: 0.7,
    ghostRoll: 0.9,
    ringPulse: 1.2,
    safetyTimeoutMs: 3000
  }
};

(function () {
  'use strict';

  let servicosAnimated = false;

  /**
   * SAFETY FALLBACK (Step 7)
   * Força todos os elementos visíveis caso o ScrollTrigger não dispare em 3s
   */
  function forceServicosVisible() {
    if (servicosAnimated) return;
    servicosAnimated = true;

    if (typeof gsap !== 'undefined') {
      gsap.set([
        '.servicos__eyebrow-line',
        '.servicos__eyebrow',
        '.servicos__headline .line-inner',
        '.servicos__em',
        '.servicos__intro',
        '.servicos__counter',
        '.servicos__ghost-num',
        '.servicos__card',
        '.servicos__card-inner',
        '.servicos__card-top',
        '.servicos__card-title',
        '.servicos__card-text',
        '.servicos__card-action'
      ], {
        opacity: 1,
        filter: 'none',
        transform: 'none',
        clipPath: 'none',
        clearProps: 'transform,clipPath,opacity,filter',
        willChange: 'auto'
      });
    }
  }

  function initServicosMotion() {
    const servicosSection = document.querySelector('.servicos');
    if (!servicosSection) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      forceServicosVisible();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const cfg = SERVICOS_MOTION_CONFIG;
    const cards = Array.from(servicosSection.querySelectorAll('.servicos__card'));
    const counterTrack = servicosSection.querySelector('[data-counter-track]');
    const ghostTrack = servicosSection.querySelector('[data-ghost-track]');
    const threadPath = servicosSection.querySelector('.servicos__thread-path');
    const threadNodes = Array.from(servicosSection.querySelectorAll('.servicos__thread-node'));

    // Safety fallback timer de 3 segundos quando a seção entrar no viewport
    if ('IntersectionObserver' in window) {
      const safetyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(forceServicosVisible, cfg.timings.safetyTimeoutMs);
            safetyObserver.disconnect();
          }
        });
      }, { threshold: 0.1 });
      safetyObserver.observe(servicosSection);
    }

    // Pausar/retomar animação CSS da aurora quando a seção estiver fora da tela
    const auroraContainer = servicosSection.querySelector('.servicos__aurora');
    if (auroraContainer && 'IntersectionObserver' in window) {
      const auroraObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            auroraContainer.style.animationPlayState = 'running';
          } else {
            auroraContainer.style.animationPlayState = 'paused';
          }
        });
      }, { threshold: 0.05 });
      auroraObserver.observe(servicosSection);
    }

    const mm = gsap.matchMedia();

    // ========================================================================
    // CASO A: PREFERS-REDUCED-MOTION (Acessibilidade WCAG - Step 9)
    // ========================================================================
    mm.add('(prefers-reduced-motion: reduce)', () => {
      servicosAnimated = true;
      gsap.to([
        '.servicos__eyebrow-line',
        '.servicos__eyebrow',
        '.servicos__headline .line-inner',
        '.servicos__em',
        '.servicos__intro',
        '.servicos__counter',
        '.servicos__card'
      ], {
        opacity: 1,
        filter: 'none',
        transform: 'none',
        clipPath: 'none',
        duration: 0.4,
        stagger: 0.04
      });
    });

    // ========================================================================
    // CASO B: EXPERIÊNCIA CINEMATOGRÁFICA COMPLETA (Motion Design Editorial)
    // ========================================================================
    mm.add('(prefers-reduced-motion: no-preference)', () => {

      // ----------------------------------------------------------------------
      // STEP 7: ENTRADA DO CABEÇALHO EDITORIAL & TEXTOS
      // ----------------------------------------------------------------------
      const headerElements = [
        '.servicos__eyebrow-line',
        '.servicos__eyebrow',
        '.servicos__headline .line-inner',
        '.servicos__em',
        '.servicos__intro',
        '.servicos__counter'
      ];

      const tlHeader = gsap.timeline({
        scrollTrigger: {
          trigger: servicosSection,
          start: "top 75%",
          once: true,
          onStart: () => {
            gsap.set(headerElements, { willChange: 'transform,opacity,filter' });
          },
          onComplete: () => {
            servicosAnimated = true;
            gsap.set(headerElements, { clearProps: 'willChange' });
          }
        }
      });

      tlHeader.fromTo('.servicos__eyebrow-line', 
        { scaleX: 0, transformOrigin: 'left center' }, 
        { scaleX: 1, duration: cfg.timings.eyebrowLine, ease: cfg.easings.soft }, 
        0
      );
      tlHeader.fromTo('.servicos__eyebrow', 
        { opacity: 0, x: -12 }, 
        { opacity: 1, x: 0, duration: cfg.timings.eyebrowText, ease: cfg.easings.soft }, 
        0.1
      );
      tlHeader.fromTo('.servicos__headline .line-inner', 
        { yPercent: 110 }, 
        { yPercent: 0, duration: cfg.timings.headlineLine, stagger: cfg.timings.headlineStagger, ease: cfg.easings.expoOut }, 
        0.2
      );
      tlHeader.fromTo('.servicos__em', 
        { opacity: 0, filter: 'blur(12px)' }, 
        { opacity: 1, filter: 'blur(0px)', duration: cfg.timings.emFocus, ease: "power3.out" }, 
        0.5
      );
      tlHeader.fromTo('.servicos__intro', 
        { opacity: 0, y: 24, filter: 'blur(6px)' }, 
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: cfg.timings.introText, ease: cfg.easings.soft }, 
        0.6
      );
      tlHeader.fromTo('.servicos__counter', 
        { opacity: 0, y: 16 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: cfg.easings.soft }, 
        0.75
      );

      // ----------------------------------------------------------------------
      // STEP 3: PARALLAX DA LIVING AURORA NO SCROLL
      // ----------------------------------------------------------------------
      const blobNavy = servicosSection.querySelector('.servicos__blob--navy');
      const blobSage = servicosSection.querySelector('.servicos__blob--sage');
      const blobIvory = servicosSection.querySelector('.servicos__blob--ivory');

      if (blobNavy) {
        gsap.to(blobNavy, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: servicosSection,
            start: "top bottom",
            end: "bottom top",
            scrub: 1
          }
        });
      }
      if (blobSage) {
        gsap.to(blobSage, {
          yPercent: -10,
          ease: "none",
          scrollTrigger: {
            trigger: servicosSection,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2
          }
        });
      }
      if (blobIvory) {
        gsap.to(blobIvory, {
          yPercent: 8,
          ease: "none",
          scrollTrigger: {
            trigger: servicosSection,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.9
          }
        });
      }

      // ----------------------------------------------------------------------
      // STEP 4: ENTRADA DOS CARDS (CLIP-PATH INSET REVEAL)
      // ----------------------------------------------------------------------
      cards.forEach((card) => {
        const cardInner = card.querySelectorAll('.servicos__card-top, .servicos__card-title, .servicos__card-text, .servicos__card-action');
        
        const tlCardEntrance = gsap.timeline({
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            once: true,
            onStart: () => {
              gsap.set(card, { willChange: 'clip-path' });
              if (cardInner.length > 0) gsap.set(cardInner, { willChange: 'transform,opacity,filter' });
            },
            onComplete: () => {
              gsap.set(card, { clearProps: 'willChange' });
              if (cardInner.length > 0) gsap.set(cardInner, { clearProps: 'willChange' });
            }
          }
        });

        tlCardEntrance.fromTo(card, 
          { clipPath: 'inset(0 0 100% 0 round 28px)' }, 
          { clipPath: 'inset(0 0 0% 0 round 28px)', duration: cfg.timings.cardClipDuration, ease: cfg.easings.mask }, 
          0
        );

        if (cardInner.length > 0) {
          tlCardEntrance.fromTo(cardInner, 
            { opacity: 0, y: 24, filter: 'blur(6px)' }, 
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: cfg.timings.cardContentStagger, ease: cfg.easings.soft }, 
            0.2
          );
        }
      });

      // ======================================================================
      // COMPORTAMENTOS EXCLUSIVOS DESKTOP (>= 1025px)
      // ======================================================================
      mm.add('(min-width: 1025px)', () => {
        
        // --------------------------------------------------------------------
        // STEP 5: NEURAL THREAD SCROLL DRAW
        // --------------------------------------------------------------------
        if (threadPath) {
          let pathLen = 1000;
          try {
            pathLen = threadPath.getTotalLength();
          } catch (e) {
            pathLen = 1000;
          }

          gsap.set(threadPath, {
            strokeDasharray: pathLen,
            strokeDashoffset: pathLen
          });

          gsap.to(threadPath, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: servicosSection.querySelector('.servicos__cards-list'),
              start: "top 60%",
              end: "bottom 70%",
              scrub: 0.25
            }
          });
        }

        // --------------------------------------------------------------------
        // STEP 4: STACKING CARDS SCROLL CONTRACTION & OVERLAY
        // --------------------------------------------------------------------
        cards.forEach((card, idx) => {
          if (idx < cards.length - 1) {
            const nextCard = cards[idx + 1];
            const overlay = card.querySelector('.servicos__card-overlay');

            gsap.to(card, {
              scale: 0.94,
              y: -16,
              transformOrigin: "center top",
              ease: "none",
              scrollTrigger: {
                trigger: nextCard,
                start: "top 75%",
                end: "top 220px",
                scrub: 0.25
              }
            });

            if (overlay) {
              gsap.to(overlay, {
                opacity: 0.10,
                ease: "none",
                scrollTrigger: {
                  trigger: nextCard,
                  start: "top 75%",
                  end: "top 220px",
                  scrub: 0.25
                }
              });
            }
          }
        });

        // --------------------------------------------------------------------
        // STEP 4 & 5: ACTIVE CARD DETECTION (COUNTER, GHOST & THREAD NODES)
        // --------------------------------------------------------------------
        function setActiveCard(index) {
          // 1. Roll Counter (0.7s --ease-mask)
          if (counterTrack) {
            gsap.to(counterTrack, {
              yPercent: -25 * index,
              duration: cfg.timings.counterRoll,
              ease: cfg.easings.mask,
              overwrite: 'auto'
            });
          }

          // 2. Roll Ghost Numeral (0.9s --ease-mask)
          if (ghostTrack) {
            gsap.to(ghostTrack, {
              yPercent: -25 * index,
              duration: cfg.timings.ghostRoll,
              ease: cfg.easings.mask,
              overwrite: 'auto'
            });
          }

          // 3. Neural Thread Node update
          threadNodes.forEach((node, nIdx) => {
            const core = node.querySelector('.node-core');
            const ring = node.querySelector('.node-ring');

            if (nIdx === index) {
              // Active node: scale 1 -> 1.8 e sage fill
              if (core) {
                gsap.to(core, {
                  scale: 1.8,
                  fill: '#72928A',
                  duration: 0.5,
                  ease: cfg.easings.soft,
                  overwrite: 'auto'
                });
              }
              // Ring pulse: scale 1 -> 2.4, opacity 0.4 -> 0 (1.2s)
              if (ring) {
                gsap.fromTo(ring, 
                  { scale: 1, opacity: 0.4, transformOrigin: 'center center' }, 
                  { scale: 2.4, opacity: 0, duration: cfg.timings.ringPulse, ease: 'power2.out', overwrite: 'auto' }
                );
              }
            } else if (nIdx < index) {
              // Previous nodes: stay filled at smaller size
              if (core) {
                gsap.to(core, {
                  scale: 1.2,
                  fill: '#72928A',
                  duration: 0.4,
                  overwrite: 'auto'
                });
              }
              if (ring) gsap.set(ring, { opacity: 0 });
            } else {
              // Future nodes: reset
              if (core) {
                gsap.to(core, {
                  scale: 1,
                  fill: 'rgba(8, 18, 40, 0.25)',
                  duration: 0.4,
                  overwrite: 'auto'
                });
              }
              if (ring) gsap.set(ring, { opacity: 0 });
            }
          });
        }

        cards.forEach((card, idx) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top 45%",
            end: "bottom 45%",
            onToggle: (self) => {
              if (self.isActive) {
                setActiveCard(idx);
              }
            }
          });
        });

        // --------------------------------------------------------------------
        // STEP 6: HOVER SPOTLIGHT (POINTER LISTENER VIA RAF)
        // --------------------------------------------------------------------
        const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isFinePointer) {
          cards.forEach((card) => {
            let rafId = null;
            card.addEventListener('pointermove', (e) => {
              if (rafId) cancelAnimationFrame(rafId);
              rafId = requestAnimationFrame(() => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mx', `${x}px`);
                card.style.setProperty('--my', `${y}px`);
              });
            }, { passive: true });
          });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initServicosMotion);
  } else {
    initServicosMotion();
  }
})();

