/**
 * ============================================================================
 * KELLY CORRÊA — NEUROPSICOPEDAGOGIA CLÍNICA
 * GALERIA REAL DO CONSULTÓRIO (QUINTA DOBRA EDITORIAL)
 * Motion Controller: Pinned Horizontal Track, Parallax, Depth, Cursor & FLIP Lightbox
 * ============================================================================
 */

// TIMING & EASING TOKENS (Expostos no topo para calibração)
const GALERIA_MOTION_CONFIG = {
  easings: {
    soft: "cubic-bezier(0.22, 1, 0.36, 1)", // --ease-soft
    mask: "cubic-bezier(0.65, 0, 0.35, 1)", // --ease-mask
    expoOut: "expo.out"
  },
  timings: {
    headingMask: 1.2,
    headingStagger: 0.12,
    italicFocus: 1.4,
    eyebrowLine: 0.9,
    photoCurtain: 1.4,
    photoScale: 1.8,
    captionReveal: 0.8,
    cursorScale: 0.5,
    lightboxFlip: 0.9,
    safetyTimeoutMs: 3000
  },
  cursor: {
    lerp: 0.18,
    size: 88
  },
  depth: {
    minScale: 0.94,
    minSaturate: 0.70
  }
};

(function () {
  'use strict';

  let galeriaAnimated = false;

  /**
   * SAFETY FALLBACK (Step 6)
   * Força todos os elementos visíveis caso o ScrollTrigger não dispare em 3s
   */
  function forceGaleriaVisible() {
    if (galeriaAnimated) return;
    galeriaAnimated = true;

    if (typeof gsap !== 'undefined') {
      gsap.set([
        '.galeria__eyebrow-line',
        '.galeria__eyebrow',
        '.galeria__headline .galeria__line-inner',
        '.galeria__em',
        '.galeria__intro',
        '.galeria__frame',
        '.galeria__img',
        '.galeria__caption-wrap'
      ], {
        opacity: 1,
        filter: 'none',
        transform: 'none',
        clipPath: 'none',
        clearProps: 'clipPath,transform,opacity,filter',
        willChange: 'auto'
      });
    }
  }

  function initGaleriaMotion() {
    const galeriaSection = document.querySelector('.galeria');
    if (!galeriaSection) return;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      forceGaleriaVisible();
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const cfg = GALERIA_MOTION_CONFIG;
    const track = galeriaSection.querySelector('[data-galeria-track]');
    const items = Array.from(galeriaSection.querySelectorAll('[data-galeria-item]'));
    const progressBar = galeriaSection.querySelector('.galeria__progress-bar');
    const cursor = galeriaSection.querySelector('.galeria__cursor');
    const lightbox = galeriaSection.querySelector('.galeria__lightbox');
    const lightboxImg = lightbox ? lightbox.querySelector('.galeria__lightbox-img') : null;
    const lightboxCaption = lightbox ? lightbox.querySelector('.galeria__lightbox-caption') : null;
    const lightboxDialog = lightbox ? lightbox.querySelector('.galeria__lightbox-dialog') : null;
    const closeBtns = lightbox ? Array.from(lightbox.querySelectorAll('[data-galeria-close]')) : [];

    // Mover o lightbox para o body para garantir cobertura global de viewport
    if (lightbox && lightbox.parentNode !== document.body) {
      document.body.appendChild(lightbox);
    }

    // Safety fallback timer de 3 segundos quando a seção entrar no viewport
    if ('IntersectionObserver' in window) {
      const safetyObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(forceGaleriaVisible, cfg.timings.safetyTimeoutMs);
            safetyObserver.disconnect();
          }
        });
      }, { threshold: 0.1 });
      safetyObserver.observe(galeriaSection);
    }

    // =========================================================================
    // STEP 6 — HEADING ENTRANCE (H2 Line-Mask & Italic Focus)
    // =========================================================================
    const headingTl = gsap.timeline({
      scrollTrigger: {
        id: 'galeria-heading',
        trigger: galeriaSection,
        start: 'top 75%',
        once: true,
        onStart: () => { galeriaAnimated = true; }
      }
    });

    headingTl
      .fromTo('.galeria__eyebrow-line', 
        { scaleX: 0 }, 
        { scaleX: 1, duration: cfg.timings.eyebrowLine, ease: cfg.easings.mask }
      )
      .fromTo('.galeria__eyebrow', 
        { opacity: 0, y: 14 }, 
        { opacity: 1, y: 0, duration: 0.8, ease: cfg.easings.soft }, 
        '-=0.7'
      )
      .fromTo('.galeria__headline .galeria__line-inner', 
        { yPercent: 110 }, 
        { yPercent: 0, duration: cfg.timings.headingMask, stagger: cfg.timings.headingStagger, ease: cfg.easings.mask }, 
        '-=0.6'
      )
      .fromTo('.galeria__em', 
        { filter: 'blur(12px)', opacity: 0.4 }, 
        { filter: 'blur(0px)', opacity: 1, duration: cfg.timings.italicFocus, ease: cfg.easings.soft }, 
        '-=1.0'
      )
      .fromTo('.galeria__intro', 
        { opacity: 0, y: 16 }, 
        { opacity: 1, y: 0, duration: 1.0, ease: cfg.easings.soft }, 
        '-=0.8'
      );

    // =========================================================================
    // STEP 7 — MATCH MEDIA (Desktop Pinned Track vs Tablet/Mobile vs Reduced Motion)
    // =========================================================================
    const mm = gsap.matchMedia();

    // 1. PREFERS-REDUCED-MOTION: Fallback estático
    mm.add('(prefers-reduced-motion: reduce)', () => {
      forceGaleriaVisible();
    });

    // 2. DESKTOP (acima de 1024px): Pinned Horizontal Gallery + Scrub + Depth + Curtains
    mm.add('(min-width: 1025px) and (prefers-reduced-motion: no-preference)', () => {
      if (!track) return;

      // Cálculo dinâmico da distância horizontal calibrado para ritmo editorial
      const getScrollDistance = () => {
        const baseDist = track.scrollWidth - window.innerWidth + 140;
        return Math.max(baseDist, window.innerHeight * 1.6);
      };

      const getTrackTranslate = () => {
        return -(track.scrollWidth - window.innerWidth + 140);
      };

      // P-01: Cache geométrico dos itens para eliminar Layout Thrashing (zero getBoundingClientRect no scroll)
      let trackInitialLeft = 0;
      let cachedItems = [];

      const updateCachedMetrics = () => {
        const currentX = (typeof gsap !== 'undefined' && track) ? (gsap.getProperty(track, "x") || 0) : 0;
        trackInitialLeft = track.getBoundingClientRect().left - currentX;
        cachedItems = items.map((item) => ({
          offsetLeft: item.offsetLeft,
          halfWidth: item.offsetWidth / 2,
          frame: item.querySelector('.galeria__frame')
        }));
      };
      updateCachedMetrics();
      window.addEventListener('resize', updateCachedMetrics, { passive: true });

      // Timeline principal pinada
      const horizontalTl = gsap.timeline({
        scrollTrigger: {
          id: 'galeria-pin',
          trigger: galeriaSection,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onRefresh: updateCachedMetrics,
          onUpdate: (self) => {
            // Atualiza barra de progresso (Step 2)
            if (progressBar) {
              progressBar.style.transform = `scaleX(${self.progress})`;
            }

            // Atualiza efeito de profundidade nos itens (Step 4) via cálculo analítico puro
            const vpCenter = window.innerWidth / 2;
            const currentTrackX = getTrackTranslate() * self.progress;
            const maxDist = window.innerWidth * 0.55;

            cachedItems.forEach((cached) => {
              const itemCenter = trackInitialLeft + currentTrackX + cached.offsetLeft + cached.halfWidth;
              const dist = Math.abs(vpCenter - itemCenter);
              const normDist = Math.min(dist / maxDist, 1);

              // Interpolação de escala e saturação com resultado visual idêntico
              const scale = 1 - (1 - cfg.depth.minScale) * normDist;
              const saturate = 1 - (1 - cfg.depth.minSaturate) * normDist;

              if (cached.frame) {
                cached.frame.style.transform = `scale(${scale.toFixed(4)})`;
                cached.frame.style.filter = `saturate(${saturate.toFixed(4)})`;
              }
            });
          }
        }
      });

      // Animação de translação horizontal da track
      horizontalTl.to(track, {
        x: getTrackTranslate,
        ease: 'none'
      });

      // STEP 4 — Photo Motion: Curtain Reveals & Parallax Scrubbing
      items.forEach((item, index) => {
        const frame = item.querySelector('.galeria__frame');
        const img = item.querySelector('.galeria__img');
        const caption = item.querySelector('.galeria__caption-wrap');

        // A primeira foto (já em tela) entra em sinfonia com a revelação do cabeçalho
        if (index === 0) {
          headingTl.fromTo(frame, 
            { clipPath: 'inset(0 0 100% 0)' }, 
            { clipPath: 'inset(0 0 0% 0)', duration: cfg.timings.photoCurtain, ease: cfg.easings.mask }, 
            '-=0.9'
          ).fromTo(img, 
            { scale: 1.15 }, 
            { scale: 1, duration: cfg.timings.photoScale, ease: cfg.easings.soft }, 
            '<'
          );
          const captionInner = item.querySelector('.galeria__caption-inner') || caption;
          if (captionInner) {
            headingTl.fromTo(captionInner, 
              { yPercent: 110, opacity: 0 }, 
              { yPercent: 0, opacity: 1, duration: cfg.timings.captionReveal, ease: cfg.easings.mask }, 
              '-=0.4'
            );
          }
        } else {
          // As fotos subsequentes revelam suavemente conforme entram na tela pelo scroll horizontal
          gsap.fromTo(frame, 
            { clipPath: 'inset(0 0 100% 0)' }, 
            {
              clipPath: 'inset(0 0 0% 0)',
              duration: cfg.timings.photoCurtain,
              ease: cfg.easings.mask,
              scrollTrigger: {
                trigger: item,
                containerAnimation: horizontalTl,
                start: 'left 92%',
                once: true
              }
            }
          );

          gsap.fromTo(img, 
            { scale: 1.15 }, 
            {
              scale: 1,
              duration: cfg.timings.photoScale,
              ease: cfg.easings.soft,
              scrollTrigger: {
                trigger: item,
                containerAnimation: horizontalTl,
                start: 'left 92%',
                once: true
              }
            }
          );

          const captionInner = item.querySelector('.galeria__caption-inner') || caption;
          if (captionInner) {
            gsap.fromTo(captionInner, 
              { yPercent: 110, opacity: 0 }, 
              {
                yPercent: 0,
                opacity: 1,
                duration: cfg.timings.captionReveal,
                ease: cfg.easings.mask,
                scrollTrigger: {
                  trigger: item,
                  containerAnimation: horizontalTl,
                  start: 'left 85%',
                  once: true
                }
              }
            );
          }
        }

        // Parallax horizontal interno da imagem (8% de velocidade relativa)
        gsap.fromTo(img, 
          { xPercent: -6 }, 
          {
            xPercent: 6,
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              containerAnimation: horizontalTl,
              start: 'left right',
              end: 'right left',
              scrub: true
            }
          }
        );
      });
    });

    // 3. TABLET & MOBILE (<= 1024px): Revelações verticais e scroll nativo
    mm.add('(max-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
      items.forEach((item) => {
        const frame = item.querySelector('.galeria__frame');
        const caption = item.querySelector('.galeria__caption-wrap');

        gsap.fromTo(frame, 
          { clipPath: 'inset(0 0 100% 0)', opacity: 0.4 }, 
          {
            clipPath: 'inset(0 0 0% 0)',
            opacity: 1,
            duration: 1.2,
            ease: cfg.easings.mask,
            scrollTrigger: {
              trigger: item,
              start: 'top 85%',
              once: true
            }
          }
        );

        if (caption) {
          gsap.fromTo(caption, 
            { opacity: 0, y: 10 }, 
            {
              opacity: 1,
              y: 0,
              duration: 0.8,
              ease: cfg.easings.soft,
              scrollTrigger: {
                trigger: item,
                start: 'top 85%',
                once: true
              }
            }
          );
        }
      });
    });

    // =========================================================================
    // STEP 5 — SURPRISE MOMENT: Context Cursor (Desktop Hover)
    // =========================================================================
    if (cursor && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let mouseX = -200;
      let mouseY = -200;
      let cursorX = -200;
      let cursorY = -200;
      let isOverPhoto = false;

      window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
      }, { passive: true });

      function renderCursor() {
        cursorX += (mouseX - cursorX) * cfg.cursor.lerp;
        cursorY += (mouseY - cursorY) * cfg.cursor.lerp;

        cursor.style.transform = `translate3d(${cursorX - cfg.cursor.size / 2}px, ${cursorY - cfg.cursor.size / 2}px, 0) scale(${isOverPhoto ? 1 : 0})`;
        requestAnimationFrame(renderCursor);
      }
      requestAnimationFrame(renderCursor);

      items.forEach((item) => {
        const frame = item.querySelector('.galeria__frame');
        if (!frame) return;

        frame.addEventListener('mouseenter', () => {
          isOverPhoto = true;
        });

        frame.addEventListener('mouseleave', () => {
          isOverPhoto = false;
        });
      });
    }

    // =========================================================================
    // STEP 5 — SURPRISE MOMENT: FLIP Lightbox Dialog
    // =========================================================================
    let activeTriggerFrame = null;
    let isLightboxOpen = false;

    function openLightbox(frame) {
      if (!lightbox || !lightboxImg || !lightboxDialog || isLightboxOpen) return;
      isLightboxOpen = true;
      activeTriggerFrame = frame;

      const img = frame.querySelector('.galeria__img');
      const captionText = frame.closest('.galeria__item')?.querySelector('.galeria__caption')?.textContent || '';

      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      if (lightboxCaption) {
        lightboxCaption.textContent = captionText;
      }

      // Parar Lenis smooth scroll durante o lightbox aberto
      if (window.lenis && typeof window.lenis.stop === 'function') {
        window.lenis.stop();
      }
      document.body.style.overflow = 'hidden';

      // Detecção de touch vs pointer fine para animação FLIP ou fade/scale
      const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      // Captura o rect original para o FLIP
      const originRect = frame.getBoundingClientRect();

      lightbox.removeAttribute('hidden');
      lightbox.classList.add('is-active');

      requestAnimationFrame(() => {
        gsap.fromTo('.galeria__lightbox-backdrop', 
          { opacity: 0 }, 
          { opacity: 1, duration: 0.5, ease: 'power2.out' }
        );

        if (isTouch) {
          // Em dispositivos móveis/touch: transição direta de fade e escala sutil
          gsap.fromTo(lightboxDialog, 
            { opacity: 0, scale: 0.92, x: 0, y: 0 }, 
            { opacity: 1, scale: 1, duration: 0.45, ease: cfg.easings.soft }
          );
        } else {
          // No desktop com ponteiro fino: FLIP animation a partir do bounding rect original
          const targetRect = lightboxDialog.getBoundingClientRect();

          const deltaX = originRect.left + originRect.width / 2 - (targetRect.left + targetRect.width / 2);
          const deltaY = originRect.top + originRect.height / 2 - (targetRect.top + targetRect.height / 2);
          const scaleX = originRect.width / targetRect.width;
          const scaleY = originRect.height / targetRect.height;

          gsap.fromTo(lightboxDialog, 
            {
              x: deltaX,
              y: deltaY,
              scaleX: scaleX,
              scaleY: scaleY,
              opacity: 0.8
            }, 
            {
              x: 0,
              y: 0,
              scaleX: 1,
              scaleY: 1,
              opacity: 1,
              duration: cfg.timings.lightboxFlip,
              ease: cfg.easings.mask
            }
          );
        }

        // Focus trap: foca no botão fechar
        const closeBtn = lightbox.querySelector('.galeria__lightbox-close');
        if (closeBtn) {
          closeBtn.focus();
        }
      });
    }

    function closeLightbox() {
      if (!lightbox || !lightboxDialog || !isLightboxOpen) return;

      const finishClose = () => {
        lightbox.classList.remove('is-active');
        lightbox.setAttribute('hidden', '');
        document.body.style.overflow = '';
        isLightboxOpen = false;

        if (window.lenis && typeof window.lenis.start === 'function') {
          window.lenis.start();
        }

        // Restaura o foco para o elemento disparador
        if (activeTriggerFrame) {
          activeTriggerFrame.focus();
          activeTriggerFrame = null;
        }
      };

      const isTouch = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      gsap.to('.galeria__lightbox-backdrop', { opacity: 0, duration: 0.4, ease: 'power2.out' });

      if (isTouch || !activeTriggerFrame) {
        gsap.to(lightboxDialog, {
          opacity: 0,
          scale: 0.92,
          duration: 0.35,
          ease: 'power2.inOut',
          onComplete: finishClose
        });
        return;
      }

      // Reverse FLIP animation no desktop
      const originRect = activeTriggerFrame.getBoundingClientRect();
      const currentRect = lightboxDialog.getBoundingClientRect();

      const deltaX = originRect.left + originRect.width / 2 - (currentRect.left + currentRect.width / 2);
      const deltaY = originRect.top + originRect.height / 2 - (currentRect.top + currentRect.height / 2);
      const scaleX = originRect.width / currentRect.width;
      const scaleY = originRect.height / currentRect.height;

      gsap.to(lightboxDialog, {
        x: deltaX,
        y: deltaY,
        scaleX: scaleX,
        scaleY: scaleY,
        opacity: 0,
        duration: 0.6,
        ease: cfg.easings.mask,
        onComplete: finishClose
      });
    }

    // Registra cliques e eventos de teclado para o Lightbox
    items.forEach((item) => {
      const frame = item.querySelector('.galeria__frame');
      if (!frame) return;

      frame.addEventListener('click', () => openLightbox(frame));
      frame.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(frame);
        }
      });
    });

    closeBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeLightbox();
      });
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isLightboxOpen) {
        closeLightbox();
      }
    });

    // Recalibra ScrollTrigger após carregamento de fontes e imagens
    const debouncedGaleriaRefresh = () => {
      if (typeof ScrollTrigger === 'undefined') return;
      if (window._stRefreshRaf) cancelAnimationFrame(window._stRefreshRaf);
      window._stRefreshRaf = requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        window._stRefreshRaf = null;
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(debouncedGaleriaRefresh);
    }

    window.addEventListener('load', debouncedGaleriaRefresh);
  }

  // Inicialização no DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGaleriaMotion);
  } else {
    initGaleriaMotion();
  }

})();
