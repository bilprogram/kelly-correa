/**
 * ============================================================================
 * KELLY CORRÊA — NEUROPSICOPEDAGOGIA CLÍNICA
 * MOTION CONTROLLER: FAIXA DE CTA FINAL (.chamada-final) & RODAPÉ (.rodape)
 * ============================================================================
 */

// TIMING & MOTION TOKENS
const FOOTER_MOTION_CONFIG = {
  easings: {
    soft: "cubic-bezier(0.22, 1, 0.36, 1)", // --ease-soft
    mask: "cubic-bezier(0.65, 0, 0.35, 1)",  // --ease-mask
    expoOut: "power3.out"
  },
  timings: {
    eyebrowDur: 0.9,
    h2Dur: 1.2,
    h2Stagger: 0.12,
    emFocusDur: 1.4,
    leadDur: 1.1,
    buttonCurtainDur: 1.1,
    footerCascadeDur: 1.0,
    footerStagger: 0.08,
    symbolFloatDur: 8.0,
    safetyTimeout: 3000
  },
  magnetic: {
    pullX: 0.22,
    pullY: 0.30
  }
};

(function initFooterMotion() {
  'use strict';

  function init() {
    const ctaSection = document.querySelector('.chamada-final');
    const footerSection = document.querySelector('.rodape');
    if (!ctaSection && !footerSection) return;

    const cfg = FOOTER_MOTION_CONFIG;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // Safety Fallback: força visibilidade se ScrollTrigger falhar ou demorar mais de 3s
    let ctaAnimated = false;
    let footerAnimated = false;

    function forceCtaVisible() {
      if (ctaAnimated || !ctaSection) return;
      ctaAnimated = true;
      if (typeof gsap !== 'undefined') {
        gsap.set([
          '.chamada-final__eyebrow-line',
          '.chamada-final__eyebrow',
          '.chamada-final__title .line-inner',
          '.chamada-final__em',
          '.chamada-final__lead',
          '.btn-cta-final'
        ], {
          opacity: 1,
          x: 0,
          y: 0,
          yPercent: 0,
          filter: 'none',
          scaleX: 1,
          clipPath: 'none',
          clearProps: 'transform,clipPath,filter,opacity'
        });
      }
    }

    function forceFooterVisible() {
      if (footerAnimated || !footerSection) return;
      footerAnimated = true;
      if (typeof gsap !== 'undefined') {
        gsap.set([
          '.rodape__divider-top',
          '.rodape__col-brand',
          '.rodape__col',
          '.rodape__base'
        ], {
          opacity: 1,
          y: 0,
          scaleX: 1,
          filter: 'none',
          clearProps: 'transform,filter,opacity'
        });
      }
    }

    // Safety timeout de 3s
    setTimeout(() => {
      forceCtaVisible();
      forceFooterVisible();
    }, cfg.timings.safetyTimeout);

    // =========================================================================
    // 1. CASO A: PREFERS-REDUCED-MOTION (Acessibilidade)
    // =========================================================================
    if (isReducedMotion || typeof gsap === 'undefined') {
      forceCtaVisible();
      forceFooterVisible();

      // Voltar ao topo com scroll nativo imediato
      const backToTopBtn = document.getElementById('voltarAoTopo');
      if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: 'auto' });
          if (history.pushState) history.pushState(null, '', '#topo');
        });
      }
      return;
    }

    // =========================================================================
    // 2. FAIXA DE CTA FINAL (.chamada-final) — MOTION & REVEALS
    // =========================================================================
    if (ctaSection) {
      // Blobs e Marca d'água: Paralaxe lenta no scroll
      if (typeof ScrollTrigger !== 'undefined') {
        gsap.to('.chamada-final__blob--navy', {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: ctaSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });

        gsap.to('.chamada-final__blob--sage', {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: ctaSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });

        gsap.to('.chamada-final__watermark', {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: ctaSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });
      }

      // Timeline de Entrada: Dispara uma vez em 'top 75%'
      const ctaTl = gsap.timeline({
        scrollTrigger: {
          trigger: ctaSection,
          start: 'top 75%',
          once: true,
          onEnter: () => { ctaAnimated = true; }
        }
      });

      // Eyebrow line scaleX 0 -> 1 e texto fade (x -12 -> 0)
      ctaTl.fromTo('.chamada-final__eyebrow-line', 
        { scaleX: 0, transformOrigin: 'left center' }, 
        { scaleX: 1, duration: cfg.timings.eyebrowDur, ease: cfg.easings.soft }, 
        0
      );
      ctaTl.fromTo('.chamada-final__eyebrow', 
        { opacity: 0, x: -12 }, 
        { opacity: 1, x: 0, duration: cfg.timings.eyebrowDur, ease: cfg.easings.soft }, 
        0.05
      );

      // Headline Line-Mask reveal (yPercent 110 -> 0)
      ctaTl.fromTo('.chamada-final__title .line-inner', 
        { yPercent: 110 }, 
        { yPercent: 0, duration: cfg.timings.h2Dur, stagger: cfg.timings.h2Stagger, ease: cfg.easings.expoOut }, 
        0.15
      );

      // Palavra em itálico com foco suave (blur 12px -> 0, opacity 0 -> 1)
      ctaTl.fromTo('.chamada-final__em', 
        { opacity: 0, filter: 'blur(12px)' }, 
        { opacity: 1, filter: 'blur(0px)', duration: cfg.timings.emFocusDur, ease: 'power2.out' }, 
        0.35
      );

      // Lead textual fade up (y 24 -> 0, blur 6px -> 0)
      ctaTl.fromTo('.chamada-final__lead', 
        { opacity: 0, y: 24, filter: 'blur(6px)' }, 
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: cfg.timings.leadDur, ease: cfg.easings.soft }, 
        0.45
      );

      // Botão Pílula entra por cortina clip-path
      ctaTl.fromTo('.btn-cta-final', 
        { clipPath: 'inset(0 100% 0 0 round 999px)' }, 
        { 
          clipPath: 'inset(0 0% 0 0 round 999px)', 
          duration: cfg.timings.buttonCurtainDur, 
          ease: cfg.easings.mask,
          clearProps: 'clipPath'
        }, 
        0.65
      );

      // Efeito Magnético no Botão de CTA Desktop
      const ctaBtn = ctaSection.querySelector('.btn-cta-final');
      if (isFinePointer && ctaBtn) {
        let rect = null;
        ctaBtn.addEventListener('mouseenter', () => {
          rect = ctaBtn.getBoundingClientRect();
        });
        ctaBtn.addEventListener('mousemove', (e) => {
          if (!rect) rect = ctaBtn.getBoundingClientRect();
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
          rect = null;
          gsap.to(ctaBtn, { x: 0, y: 0, duration: 0.6, ease: cfg.easings.soft });
        });
      }
    }

    // =========================================================================
    // 3. RODAPÉ INSTITUCIONAL (.rodape) — MOTION & CASCATA
    // =========================================================================
    if (footerSection) {
      // Linha divisória superior desenha da esquerda para direita
      const footerTl = gsap.timeline({
        scrollTrigger: {
          trigger: footerSection,
          start: 'top 85%',
          once: true,
          onEnter: () => { footerAnimated = true; }
        }
      });

      footerTl.fromTo('.rodape__divider-top',
        { scaleX: 0, transformOrigin: 'left center' },
        { scaleX: 1, duration: 1.2, ease: cfg.easings.soft },
        0
      );

      // Cascata das 4 colunas (y 24 -> 0, blur 6px -> 0, stagger 0.08)
      const footerCols = footerSection.querySelectorAll('.rodape__col-brand, .rodape__col');
      footerTl.fromTo(footerCols,
        { opacity: 0, y: 24, filter: 'blur(6px)' },
        { 
          opacity: 1, 
          y: 0, 
          filter: 'blur(0px)', 
          duration: cfg.timings.footerCascadeDur, 
          stagger: cfg.timings.footerStagger, 
          ease: cfg.easings.soft,
          clearProps: 'filter,transform'
        },
        0.2
      );

      footerTl.fromTo('.rodape__base',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.8, ease: cfg.easings.soft, clearProps: 'transform' },
        0.6
      );

      // Flutuação sutil contínua no símbolo da marca (translateY 0 -> -6px, 8s alternate)
      const brandSymbol = footerSection.querySelector('.rodape__brand-symbol');
      if (brandSymbol) {
        const floatTween = gsap.to(brandSymbol, {
          y: -6,
          duration: cfg.timings.symbolFloatDur,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });

        // Pausa a flutuação quando o rodapé sai da viewport
        if ('IntersectionObserver' in window) {
          const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
              if (entry.isIntersecting) {
                floatTween.play();
              } else {
                floatTween.pause();
              }
            });
          });
          obs.observe(footerSection);
        }
      }

      // Link "Voltar ao topo" com Lenis ou scroll nativo
      const backToTopBtn = document.getElementById('voltarAoTopo');
      if (backToTopBtn) {
        backToTopBtn.addEventListener('click', (e) => {
          e.preventDefault();
          if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(0, {
              duration: 1.4,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          } else {
            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });
          }
          if (history.pushState) {
            history.pushState(null, '', '#topo');
          }
        });
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // P-07: Recalibra ScrollTrigger de forma debounced após fontes e carregamento completo
  const debouncedFooterRefresh = () => {
    if (typeof ScrollTrigger === 'undefined') return;
    if (window._stRefreshRaf) cancelAnimationFrame(window._stRefreshRaf);
    window._stRefreshRaf = requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      window._stRefreshRaf = null;
    });
  };

  if (document.fonts && typeof document.fonts.ready !== 'undefined') {
    document.fonts.ready.then(debouncedFooterRefresh);
  }

  window.addEventListener('load', debouncedFooterRefresh);
})();

