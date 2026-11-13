/**
 * ============================================================================
 * KELLY CORRÊA — NEUROPSICOPEDAGOGIA CLÍNICA
 * DÚVIDAS FREQUENTES / PERGUNTAS FREQUENTES (.duvidas)
 * Motion Controller: Web Animations API Smooth Accordion, Entrance Masks, Spotlight
 * ============================================================================
 */

// TIMING & EASING TOKENS (Expostos no topo para calibração)
const DUVIDAS_MOTION_CONFIG = {
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
    linkFade: 0.9,
    borderDraw: 1.2,
    borderStagger: 0.10,
    itemContentStagger: 0.06,
    accordionOpenMs: 550,
    accordionCloseMs: 450,
    safetyTimeoutMs: 3000
  }
};

(function () {
  'use strict';

  let duvidasAnimated = false;
  let isReducedMotion = false;

  /**
   * SAFETY FALLBACK (Step 6)
   * Força todos os elementos visíveis caso o ScrollTrigger não dispare em 3s
   */
  function forceDuvidasVisible() {
    if (duvidasAnimated) return;
    duvidasAnimated = true;

    if (typeof gsap !== 'undefined') {
      gsap.set([
        '.duvidas__eyebrow-line',
        '.duvidas__eyebrow',
        '.duvidas__headline .duvidas__line-inner',
        '.duvidas__em',
        '.duvidas__lead',
        '.duvidas__link',
        '.duvidas__item-line',
        '.duvidas__item-content > *'
      ], {
        opacity: 1,
        filter: 'none',
        transform: 'none',
        clipPath: 'none',
        clearProps: 'clipPath,transform,filter',
        willChange: 'auto'
      });

      document.querySelectorAll('.duvidas__item-line').forEach(line => {
        line.style.transform = 'scaleX(1)';
      });
    }
  }

  function initDuvidasMotion() {
    const duvidasSection = document.querySelector('.duvidas');
    if (!duvidasSection) return;

    isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      forceDuvidasVisible();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const cfg = DUVIDAS_MOTION_CONFIG;
    const items = Array.from(duvidasSection.querySelectorAll('.duvidas__item'));
    const halo = duvidasSection.querySelector('.duvidas__halo');
    const borderLines = Array.from(duvidasSection.querySelectorAll('.duvidas__item-line'));

    // Safety fallback timer de 3 segundos quando a seção entra no viewport
    if ('IntersectionObserver' in window) {
      const safetyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(forceDuvidasVisible, cfg.timings.safetyTimeoutMs);
            safetyObserver.disconnect();
          }
        });
      }, { threshold: 0.1 });
      safetyObserver.observe(duvidasSection);
    }

    // =========================================================================
    // STEP 6 — ENTRANCE MOTION (Left Sticky Column Reveal)
    // =========================================================================
    const headingTl = gsap.timeline({
      scrollTrigger: {
        id: 'duvidas-heading',
        trigger: duvidasSection,
        start: 'top 75%',
        once: true,
        onStart: () => { duvidasAnimated = true; }
      }
    });

    headingTl
      .fromTo('.duvidas__eyebrow-line', 
        { scaleX: 0 }, 
        { scaleX: 1, duration: cfg.timings.eyebrowLine, ease: cfg.easings.mask }
      )
      .fromTo('.duvidas__eyebrow', 
        { opacity: 0, x: -12 }, 
        { opacity: 1, x: 0, duration: cfg.timings.eyebrowText, ease: cfg.easings.soft }, 
        '-=0.7'
      )
      .fromTo('.duvidas__headline .duvidas__line-inner', 
        { yPercent: 110 }, 
        { yPercent: 0, duration: cfg.timings.headingMask, stagger: cfg.timings.headingStagger, ease: cfg.easings.expoOut }, 
        '-=0.6'
      )
      .fromTo('.duvidas__em', 
        { filter: 'blur(12px)', opacity: 0 }, 
        { filter: 'blur(0px)', opacity: 1, duration: cfg.timings.italicFocus, ease: cfg.easings.soft }, 
        '-=1.0'
      )
      .fromTo('.duvidas__lead', 
        { y: 24, filter: 'blur(6px)', opacity: 0 }, 
        { y: 0, filter: 'blur(0px)', opacity: 1, duration: cfg.timings.leadFade, ease: cfg.easings.soft }, 
        '-=1.1'
      )
      .fromTo('.duvidas__link', 
        { opacity: 0, y: 16 }, 
        { opacity: 1, y: 0, duration: cfg.timings.linkFade, ease: cfg.easings.soft }, 
        '-=0.7'
      );

    // Linhas de borda e conteúdo dos itens via ScrollTrigger.batch
    if (borderLines.length > 0) {
      ScrollTrigger.batch(duvidasSection.querySelectorAll('.duvidas__item'), {
        start: 'top 80%',
        once: true,
        onEnter: (batch) => {
          batch.forEach((item, idx) => {
            const line = item.querySelector('.duvidas__item-line');
            const bottomLine = item.querySelector('.duvidas__item-line--bottom');
            const rowContent = item.querySelectorAll('.duvidas__row-content > *');

            const itemTl = gsap.timeline({ delay: idx * cfg.timings.borderStagger });
            if (line) {
              itemTl.fromTo(line, 
                { scaleX: 0 }, 
                { scaleX: 1, duration: cfg.timings.borderDraw, ease: cfg.easings.mask }
              );
            }
            if (bottomLine) {
              itemTl.fromTo(bottomLine,
                { scaleX: 0 },
                { scaleX: 1, duration: cfg.timings.borderDraw, ease: cfg.easings.mask },
                '-=1.0'
              );
            }
            itemTl.fromTo(rowContent, 
              { y: 20, opacity: 0 }, 
              { y: 0, opacity: 1, duration: 0.8, stagger: cfg.timings.itemContentStagger, ease: cfg.easings.soft }, 
              '-=0.9'
            );
          });
        }
      });
    }

    // Step 3: Background Halo Parallax
    if (halo) {
      gsap.fromTo(halo, 
        { yPercent: -8 }, 
        {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: duvidasSection,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        }
      );
    }

    // P-07: Refresh debounced para evitar recálculos em cascata
    function debouncedRefresh() {
      if (typeof ScrollTrigger === 'undefined') return;
      if (window._stRefreshRaf) cancelAnimationFrame(window._stRefreshRaf);
      window._stRefreshRaf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        window._stRefreshRaf = null;
      });
    }

    // =========================================================================
    // STEP 4 — ACCORDION MOTION (GSAP Smooth Height & State Control)
    // =========================================================================
    let currentOpenItem = null;

    function closeAccordionItem(item) {
      if (!item || !item.hasAttribute('open')) return;

      const panel = item.querySelector('.duvidas__panel');
      const answer = item.querySelector('.duvidas__answer');

      item.classList.remove('is-open');

      if (isReducedMotion) {
        item.removeAttribute('open');
        if (currentOpenItem === item) currentOpenItem = null;
        debouncedRefresh();
        return;
      }

      if (panel) {
        gsap.to(panel, {
          height: 0,
          opacity: 0.2,
          duration: 0.45,
          ease: cfg.easings.soft,
          onComplete: () => {
            item.removeAttribute('open');
            gsap.set(panel, { clearProps: 'height,opacity,overflow' });
            if (currentOpenItem === item) currentOpenItem = null;
            debouncedRefresh();
          }
        });
      } else {
        item.removeAttribute('open');
        if (currentOpenItem === item) currentOpenItem = null;
        debouncedRefresh();
      }
    }

    function openAccordionItem(item) {
      if (!item) return;

      // Fecha todos os outros itens abertos (apenas um aberto por vez)
      items.forEach(other => {
        if (other !== item && other.hasAttribute('open')) {
          closeAccordionItem(other);
        }
      });

      currentOpenItem = item;
      item.setAttribute('open', '');
      item.classList.add('is-open');

      const panel = item.querySelector('.duvidas__panel');
      const answer = item.querySelector('.duvidas__answer');

      if (isReducedMotion) {
        debouncedRefresh();
        return;
      }

      if (panel) {
        gsap.fromTo(panel, 
          { height: 0, opacity: 1, overflow: 'hidden' }, 
          {
            height: 'auto',
            duration: 0.55,
            ease: cfg.easings.soft,
            onComplete: () => {
              gsap.set(panel, { clearProps: 'overflow' });
              debouncedRefresh();
            }
          }
        );

        if (answer) {
          gsap.fromTo(answer,
            { opacity: 0, y: 12, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, delay: 0.08, ease: cfg.easings.soft }
          );
        }
      }
    }

    items.forEach((item) => {
      const summary = item.querySelector('.duvidas__summary');
      if (!summary) return;

      summary.addEventListener('click', (e) => {
        e.preventDefault();
        if (item.hasAttribute('open')) {
          closeAccordionItem(item);
        } else {
          openAccordionItem(item);
        }
      });
    });

    // Step 4: Suporte a links com hash (URL apontando para pergunta específica)
    function checkHashTarget() {
      const hash = window.location.hash;
      if (!hash) return;
      const targetEl = document.querySelector(hash);
      if (targetEl && targetEl.classList.contains('duvidas__item')) {
        setTimeout(() => {
          openAccordionItem(targetEl);
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 400);
      }
    }

    checkHashTarget();
    window.addEventListener('hashchange', checkHashTarget);

    // =========================================================================
    // STEP 5 — HOVER & SPOTLIGHT (Desktop fine pointer)
    // =========================================================================
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      items.forEach(item => {
        let rafId = null;
        item.addEventListener('mousemove', (e) => {
          const rect = item.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => {
            item.style.setProperty('--mx', `${x}px`);
            item.style.setProperty('--my', `${y}px`);
          });
        }, { passive: true });
      });
    }

    // Refresh debounced em redimensionamento e fontes carregadas (P-07)
    const handleRefresh = () => {
      debouncedRefresh();
    };

    window.addEventListener('resize', handleRefresh);

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(handleRefresh);
    }

    window.addEventListener('load', handleRefresh);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDuvidasMotion);
  } else {
    initDuvidasMotion();
  }
})();
