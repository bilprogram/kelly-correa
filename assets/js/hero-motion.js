/**
 * ============================================================================
 * KELLY CORRÊA — NEUROPSICOPEDAGOGIA CLÍNICA
 * HERO & SECOND FOLD MOTION CONTROLLER (GSAP 3 + ScrollTrigger)
 * ============================================================================
 *
 * Conceito: Capa de revista de alto padrão com transição de cortina
 * e segunda dobra reconstruída (Manifesto scroll-fill + Grid editorial 5fr/7fr).
 */

// STEP 9.1 — VARIÁVEIS DE CONFIGURAÇÃO (TIMING & EASING EXPOSTAS)
const MOTION_CONFIG = {
  // Curvas de Aceleração Estritas do Design System (Step 6)
  easings: {
    soft: "cubic-bezier(0.22, 1, 0.36, 1)", // --ease-soft
    mask: "cubic-bezier(0.65, 0, 0.35, 1)", // --ease-mask
    linear: "none"
  },

  // Timings da Hero (Primeira Dobra mantida, calibrada -12% duracao e -20% stagger)
  hero: {
    videoScale: 2.8,
    videoFade: 1.2,
    gradientFade: 1.4,
    eyebrowLine: 0.8,
    eyebrowText: 0.8,
    headlineLine: 1.25,
    headlineStagger: 0.13,
    emFocus: 1.3,
    supportText: 0.95,
    ctaClip: 0.8,
    ctaLabels: 0.5,
    statusBadge: 0.6,
    secondaryLink: 0.7,
    secondaryUnderline: 0.7,
    bottomDividers: 1.05,
    bottomItems: 0.7,
    sealEntrance: 0.88,
    sealRotation: 22.0
  },

  // Efeito Magnético do Botão Primário e CTA da Segunda Dobra
  magnetic: {
    proximityRadius: 80,
    maxTranslation: 6.8,
    quickToDuration: 0.45
  },

  // Transição de Cortina da Hero (Step 3)
  curtain: {
    scrubSpeed: 0.8,
    videoScaleTarget: 0.94,
    overlayOpacityTarget: 0.6,
    textYPercentTarget: -14,
    badgeExitOpacity: 0
  },

  // Marquee como Ponte sobre o Vídeo (Step 2 & 4)
  marquee: {
    baseSpeedPxPerSec: 60,
    maxVelocityScale: 2.5,
    velocityScaleDuration: 0.3,
    velocityResetDuration: 0.8
  },

  // SEGUNDA DOBRA RECONSTRUÍDA (Step 6, calibrada -12% duracao e -20% stagger)
  secondFold: {
    manifestoStart: "top 80%",
    manifestoEnd: "bottom 45%",
    photoClipDuration: 1.4,
    photoScaleDuration: 1.6,
    photoInitialScale: 1.12,
    photoParallaxY: 3.4, // yPercent -3.4 a 3.4 (calibrado -15%)
    eyebrowHeadlineDuration: 1.05,
    headlineStagger: 0.10,
    emFocusDuration: 1.2,
    leadDuration: 0.95,
    dividerDuration: 0.88,
    dividerStagger: 0.08,
    microTextDuration: 0.7,
    microTextStagger: 0.10,
    quoteDuration: 0.8,
    ctaDuration: 0.7,
    reducedMotionFade: 0.4,
    safetyTimeoutMs: 3000 // Fallback contra H2 invisível (Bug #2)
  }
};

(function () {
  'use strict';

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    if (window.matchMedia('(max-width: 768px)').matches) {
      ScrollTrigger.config({ ignoreMobileResize: true });
    }
  }

  let heroTimelineStarted = false;
  let secondFoldAnimated = false;
  let marqueeTween = null;

  /**
   * SAFETY FALLBACK (Bug #2)
   * Garante que o H2, foto e todos os elementos da Segunda Dobra fiquem 100% visíveis
   * se o ScrollTrigger não disparar em 3 segundos após a seção entrar no viewport.
   */
  function forceSecondFoldVisible() {
    if (secondFoldAnimated) return;
    secondFoldAnimated = true;

    if (typeof gsap !== 'undefined') {
      gsap.set([
        '.manifesto__word',
        '.profile-photo-img',
        '.sobre__eyebrow',
        '.sobre__headline .line-inner',
        '.sobre__em',
        '.sobre__lead',
        '.sobre__micro-divider',
        '.sobre__micro-content',
        '.sobre__quote',
        '.sobre__quote-mark',
        '.sobre__cta-link',
        '.sobre__cta-underline',
        '.faixa__divider'
      ], {
        opacity: 1,
        filter: 'none',
        transform: 'none',
        clipPath: 'none',
        clearProps: 'transform,clipPath,opacity,filter',
        willChange: 'auto'
      });

      // Garante clip-path aberto permanente na foto (não remove inline para evitar fallback do CSS)
      gsap.set('.profile-photo-reveal', {
        clipPath: 'none',
        opacity: 1,
        willChange: 'auto'
      });
    }
  }

  function forceAllHeroVisible() {
    if (heroTimelineStarted) return;
    heroTimelineStarted = true;

    if (typeof gsap !== 'undefined') {
      gsap.set([
        '.hero__media-wrapper', '.hero__video', '.hero__gradient', '.hero__curtain-overlay',
        '.hero__eyebrow-line', '.hero__eyebrow', '.hero__headline .line-inner', '.hero__em',
        '.hero__support', '.hero__btn-primary', '.hero__btn-primary *', '.hero__status-badge',
        '.hero__link-secondary', '.hero__link-underline', '.hero__bottom-divider', '.hero__bottom-item',
        '.hero__seal'
      ], {
        opacity: 1, filter: 'none', transform: 'none', clipPath: 'none', clearProps: 'transform,clipPath,opacity,filter'
      });
    }
  }

  const heroSafetyTimer = setTimeout(forceAllHeroVisible, 3000);

  /**
   * Inicialização do Motion
   */
  function initEditorialMotion() {
    if (typeof gsap === 'undefined') {
      forceAllHeroVisible();
      forceSecondFoldVisible();
      return;
    }

    const heroSection = document.querySelector('.hero');
    const secondFold = document.querySelector('.second-fold');
    if (!heroSection) return;

    heroTimelineStarted = true;
    clearTimeout(heroSafetyTimer);

    const mm = gsap.matchMedia();
    const cfg = MOTION_CONFIG;

    // ========================================================================
    // CASO A: PREFERS-REDUCED-MOTION (Acessibilidade WCAG - Step 7)
    // ========================================================================
    mm.add('(prefers-reduced-motion: reduce)', () => {
      // Hero simples fade
      gsap.to([
        '.hero__media-wrapper', '.hero__gradient', '.hero__eyebrow-line', '.hero__eyebrow',
        '.hero__headline .line-inner', '.hero__em', '.hero__support', '.hero__btn-primary',
        '.hero__link-secondary', '.hero__bottom-item', '.hero__seal'
      ], { opacity: 1, filter: 'none', transform: 'none', clipPath: 'none', duration: cfg.secondFold.reducedMotionFade, stagger: 0.04 });

      // Segunda Dobra simples fade (sem scrub, sem clip-path, sem blur, sem parallax)
      gsap.to([
        '.manifesto__word', '.profile-photo-reveal', '.profile-photo-img',
        '.sobre__eyebrow', '.sobre__headline .line-inner', '.sobre__em',
        '.sobre__lead', '.sobre__micro-divider', '.sobre__micro-content',
        '.sobre__quote', '.sobre__cta-link'
      ], {
        opacity: 1,
        filter: 'none',
        transform: 'none',
        clipPath: 'none',
        duration: cfg.secondFold.reducedMotionFade,
        stagger: 0.04
      });

      const faixaTrack = document.querySelector('[data-faixa-marquee]');
      if (faixaTrack) gsap.set(faixaTrack, { transform: 'none' });
      const faixaDivider = document.querySelector('.faixa__divider');
      if (faixaDivider) gsap.set(faixaDivider, { scaleX: 1 });

      const sealEl = document.querySelector('.hero__seal');
      if (sealEl) {
        sealEl.addEventListener('click', (e) => {
          if (e) e.preventDefault();
          const target = document.getElementById('sobre') || document.querySelector('.second-fold');
          if (!target) return;
          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight : 68;
          if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(target, { offset: -headerHeight, immediate: true });
          } else {
            const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({ top: targetY, behavior: 'auto' });
          }
          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', '#sobre');
          }
        });
      }
    });

    // ========================================================================
    // CASO B: EXPERIÊNCIA CINEMATOGRÁFICA COMPLETA (Motion Design Editorial)
    // ========================================================================
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      let heroEntranceDone = false;
      const isMobile = window.matchMedia('(max-width: 768px)').matches;
      const isDesktop = !isMobile;

      // ----------------------------------------------------------------------
      // 1. TIMELINE DE ENTRADA DA HERO (Preservada estritamente)
      // ----------------------------------------------------------------------
      const tlHero = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          heroEntranceDone = true;
          document.querySelectorAll('.hero [style*="will-change"]').forEach((el) => {
            el.style.willChange = 'auto';
          });
          gsap.set('.hero__headline .line-inner', { clearProps: 'transform' });
        }
      });

      tlHero.fromTo('.hero__media-wrapper', { opacity: 0 }, { opacity: 1, duration: cfg.hero.videoFade }, 0);
      tlHero.fromTo('.hero__video', { scale: 1.12 }, { scale: 1, duration: cfg.hero.videoScale, ease: "power3.out" }, 0);
      tlHero.fromTo('.hero__gradient', { opacity: 0 }, { opacity: 1, duration: cfg.hero.gradientFade }, 0.2);
      tlHero.fromTo('.hero__eyebrow-line', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: cfg.hero.eyebrowLine }, 0.35);
      tlHero.fromTo('.hero__eyebrow', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: cfg.hero.eyebrowText }, 0.35);
      tlHero.fromTo('.hero__headline .line-inner', { yPercent: 115, rotate: 3, skewY: 4, transformOrigin: 'left bottom' }, { yPercent: 0, rotate: 0, skewY: 0, duration: cfg.hero.headlineLine, stagger: cfg.hero.headlineStagger }, 0.55);
      tlHero.fromTo('.hero__em', { opacity: 0, filter: isMobile ? 'blur(5px)' : 'blur(8px)', letterSpacing: '0.06em', y: 7 }, { opacity: 1, filter: 'blur(0px)', letterSpacing: '-0.025em', y: 0, duration: cfg.hero.emFocus, ease: "power3.out" }, 1.05);
      tlHero.fromTo('.hero__support', { opacity: 0, y: isMobile ? 18 : 21, filter: isMobile ? 'blur(3px)' : 'blur(4px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: cfg.hero.supportText }, 1.2);
      tlHero.fromTo('.hero__btn-primary', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: cfg.hero.ctaClip }, 1.4);
      tlHero.fromTo(['.hero__btn-primary .hero__btn-label', '.hero__btn-primary .hero__btn-icon'], { opacity: 0 }, { opacity: 1, duration: cfg.hero.ctaLabels }, 1.7);
      tlHero.fromTo('.hero__status-badge', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: cfg.hero.statusBadge }, 1.6);
      tlHero.fromTo('.hero__link-secondary', { opacity: 0, y: isMobile ? 12 : 14 }, { opacity: 1, y: 0, duration: cfg.hero.secondaryLink }, 1.5);
      tlHero.fromTo('.hero__link-underline', { scaleX: 0, transformOrigin: 'left center' }, { scaleX: 1, duration: cfg.hero.secondaryUnderline }, 1.7);
      tlHero.fromTo('.hero__bottom-item', { opacity: 0, y: isMobile ? 8 : 9 }, { opacity: 1, y: 0, duration: cfg.hero.bottomItems }, 1.7);
      tlHero.fromTo('.hero__seal', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: cfg.hero.sealEntrance, ease: 'back.out(1.2)' }, 1.9);

      // 1.1 Rotação e Interações do Selo Hero (Change 1)
      const sealEl = document.querySelector('.hero__seal');
      const sealRotationTween = gsap.to('.hero__seal-svg', { rotation: 360, duration: cfg.hero.sealRotation, ease: 'none', repeat: -1 });

      if (sealEl) {
        // Scroll suave para #sobre ao clicar ou via teclado
        const rolarParaSegundaDobra = (e) => {
          if (e) e.preventDefault();
          const target = document.getElementById('sobre') || document.querySelector('.second-fold');
          if (!target) return;

          const header = document.querySelector('.site-header');
          const headerHeight = header ? header.offsetHeight : 68;

          if (window.lenis && typeof window.lenis.scrollTo === 'function') {
            window.lenis.scrollTo(target, {
              offset: -headerHeight,
              duration: 1.4,
              easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
          } else {
            const targetY = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            window.scrollTo({
              top: targetY,
              behavior: 'smooth'
            });
          }

          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', '#sobre');
          }
        };

        sealEl.addEventListener('click', rolarParaSegundaDobra);

        sealEl.addEventListener('keydown', (e) => {
          if (e.key === ' ' || e.key === 'Spacebar') {
            e.preventDefault();
            rolarParaSegundaDobra(e);
          }
        });

        // Hover Desktop: Reduz rotação em x0.5 e tração magnética
        const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isFine) {
          sealEl.addEventListener('mouseenter', () => {
            gsap.to(sealRotationTween, { timeScale: 0.5, duration: 0.6, ease: 'power2.out' });
          });

          sealEl.addEventListener('mouseleave', () => {
            gsap.to(sealRotationTween, { timeScale: 1.0, duration: 0.6, ease: 'power2.out' });
            gsap.to(sealEl, { x: 0, y: 0, duration: 0.6, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' });
          });

          sealEl.addEventListener('mousemove', (e) => {
            const r = sealEl.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            gsap.to(sealEl, {
              x: dx * 0.22,
              y: dy * 0.30,
              duration: 0.3,
              ease: 'power2.out'
            });
          });
        }

        // Fade-out aos 60% do viewport da hero (opacity 1 -> 0, 0.4s), pausa de rotação e disable pointer-events (P-05)
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.create({
            trigger: '.hero',
            start: '60% top',
            onEnter: () => {
              if (sealRotationTween) sealRotationTween.pause();
              gsap.to(sealEl, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => { sealEl.style.pointerEvents = 'none'; }
              });
            },
            onLeaveBack: () => {
              if (sealRotationTween) sealRotationTween.resume();
              sealEl.style.pointerEvents = 'auto';
              gsap.to(sealEl, {
                opacity: 1,
                duration: 0.4,
                ease: 'power2.out'
              });
            }
          });
        }
      }

      // ----------------------------------------------------------------------
      // 2. FAIXA DE ESPECIALIDADES — MARQUEE ENTRE FOLD 2 E FOLD 3 (STEP 5)
      // ----------------------------------------------------------------------
      const faixaSection = document.querySelector('.faixa');
      const faixaTrack = document.querySelector('[data-faixa-marquee]');
      if (faixaTrack) {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const firstGroup = faixaTrack.querySelector('.faixa__marquee-group');
        let duration = 32;
        if (firstGroup) {
          const groupWidth = firstGroup.offsetWidth || 1800;
          const baseDuration = groupWidth / cfg.marquee.baseSpeedPxPerSec;
          duration = isMobile ? (baseDuration * 1.8) : baseDuration;
        }

        marqueeTween = gsap.to(faixaTrack, { xPercent: -50, ease: "none", duration: duration, repeat: -1 });

        if (typeof ScrollTrigger !== 'undefined') {
          let isFaixaVisible = false;

          ScrollTrigger.create({
            onUpdate: (self) => {
              if (!isFaixaVisible) return;
              const velocity = self.getVelocity();
              const maxBoost = isMobile ? 0.2 : cfg.marquee.maxVelocityScale;
              const boostDivisor = isMobile ? 1200 : 400;
              const boost = Math.min(Math.abs(velocity) / boostDivisor, maxBoost);
              gsap.to(marqueeTween, {
                timeScale: 1 + boost,
                duration: cfg.marquee.velocityScaleDuration,
                overwrite: true,
                onComplete: () => {
                  gsap.to(marqueeTween, { timeScale: 1, duration: cfg.marquee.velocityResetDuration, ease: "power2.out" });
                }
              });
            }
          });

          if ('IntersectionObserver' in window && faixaSection) {
            const observer = new IntersectionObserver((entries) => {
              entries.forEach((entry) => {
                isFaixaVisible = entry.isIntersecting;
                if (entry.isIntersecting) marqueeTween.play();
                else marqueeTween.pause();
              });
            }, { threshold: 0.05 });
            observer.observe(faixaSection);
          } else {
            isFaixaVisible = true;
          }
        }

        // STEP 3: Divisor animado (escala X de 0 a 1 em 1.2s com --ease-mask ativado em 85% do viewport)
        const faixaDivider = document.querySelector('.faixa__divider');
        if (faixaDivider && typeof ScrollTrigger !== 'undefined') {
          gsap.fromTo(faixaDivider, {
            scaleX: 0,
            transformOrigin: 'left center'
          }, {
            scaleX: 1,
            duration: 1.2,
            ease: cfg.easings.mask,
            scrollTrigger: {
              trigger: faixaSection,
              start: "top 85%",
              once: true
            }
          });
        }
      }

      // ----------------------------------------------------------------------
      // 3. TRANSIÇÃO DE CORTINA (STEP 2 & 3)
      // ----------------------------------------------------------------------
      if (secondFold && typeof ScrollTrigger !== 'undefined') {
        const isDesktop = window.matchMedia('(min-width: 768px)').matches;

        const updateHeroVisibility = (progress) => {
          // O hero só deve ficar hidden quando a segunda dobra cobriu 100% (progress >= 1)
          // Em qualquer momento durante a cortina ou acima dela (progress < 1), o hero permanece visible
          const shouldBeVisible = progress < 1;
          const currentVis = heroSection.style.visibility;
          if (shouldBeVisible && currentVis !== 'visible') {
            heroSection.style.visibility = 'visible';
          } else if (!shouldBeVisible && currentVis !== 'hidden') {
            heroSection.style.visibility = 'hidden';
          }
        };

        const curtainTl = gsap.timeline({
          scrollTrigger: {
            trigger: secondFold,
            start: "top bottom",
            end: "top top",
            scrub: isDesktop ? 0.25 : cfg.curtain.scrubSpeed,
            // Estado derivado continuamente do progresso da rolagem para eliminar glitches em scroll rápido
            onUpdate: (self) => {
              updateHeroVisibility(self.progress);
            },
            onLeave: () => { heroSection.style.visibility = 'hidden'; },
            onEnterBack: () => { heroSection.style.visibility = 'visible'; },
            onLeaveBack: () => { 
              heroSection.style.visibility = 'visible'; 
              curtainTl.progress(0);
              gsap.set('.hero__block', { opacity: 1, yPercent: 0, clearProps: 'opacity,transform' });
              gsap.set('.hero__curtain-overlay', { opacity: 0, clearProps: 'opacity' });
              const sealEl = document.querySelector('.hero__seal');
              if (sealEl) gsap.set(sealEl, { opacity: 1, clearProps: 'opacity' });
            }
          }
        });

        // Garante restauração absoluta da hero somente ao chegar ao topo da página (scrollTop <= 5)
        window.addEventListener('scroll', () => {
          if (window.scrollY <= 5) {
            heroSection.style.visibility = 'visible';
            if (curtainTl) {
              curtainTl.progress(0);
              gsap.set('.hero__block', { opacity: 1, yPercent: 0, clearProps: 'opacity,transform' });
              gsap.set('.hero__curtain-overlay', { opacity: 0, clearProps: 'opacity' });
              const sealEl = document.querySelector('.hero__seal');
              if (sealEl) gsap.set(sealEl, { opacity: 1, clearProps: 'opacity' });
            }
          }
        }, { passive: true });

        // Re-sincronização de segurança em scrollEnd e refresh
        ScrollTrigger.addEventListener("scrollEnd", () => {
          if (curtainTl && curtainTl.scrollTrigger) {
            updateHeroVisibility(curtainTl.scrollTrigger.progress);
          }
        });
        ScrollTrigger.addEventListener("refresh", () => {
          if (curtainTl && curtainTl.scrollTrigger) {
            updateHeroVisibility(curtainTl.scrollTrigger.progress);
          }
        });

        if (isDesktop) {
          curtainTl.to('.hero__video', { scale: cfg.curtain.videoScaleTarget, transformOrigin: "center center", ease: "none" }, 0);
        }
        curtainTl.to('.hero__curtain-overlay', { opacity: cfg.curtain.overlayOpacityTarget, ease: "none" }, 0);
        curtainTl.to('.hero__block', { yPercent: cfg.curtain.textYPercentTarget, opacity: 0, ease: "none" }, 0);
        curtainTl.to('.hero__seal', { opacity: cfg.curtain.badgeExitOpacity, ease: "none" }, 0);
      }

      // ----------------------------------------------------------------------
      // 4. SEGUNDA DOBRA — PARTE A: MANIFESTO SCROLL-FILL (STEP 6)
      // ----------------------------------------------------------------------
      const manifestoSection = document.querySelector('.second-fold__manifesto');
      const manifestoWords = document.querySelectorAll('.manifesto__word');

      if (manifestoSection && manifestoWords.length > 0 && typeof ScrollTrigger !== 'undefined') {
        gsap.fromTo(manifestoWords, {
          opacity: 0.15
        }, {
          opacity: 1,
          stagger: 0.08,
          ease: "none",
          scrollTrigger: {
            trigger: manifestoSection,
            start: cfg.secondFold.manifestoStart,
            end: cfg.secondFold.manifestoEnd,
            scrub: true
          }
        });
      }

      // ----------------------------------------------------------------------
      // 5. SEGUNDA DOBRA — PARTE B: FOTO EDITORIAL & CLIP-PATH (STEP 6)
      // ----------------------------------------------------------------------
      const photoReveal = document.querySelector('.profile-photo-reveal');
      const photoImg = document.querySelector('.profile-photo-img');

      if (photoReveal && typeof ScrollTrigger !== 'undefined') {
        const photoCol = document.querySelector('.second-fold__col-photo') || photoReveal;

        // Revelação de cortina na foto em 1.6s com curva mask (trigger no container não-sticky)
        let photoRevealed = false;
        gsap.to(photoReveal, {
          clipPath: 'inset(0 0 0% 0)',
          duration: cfg.secondFold.photoClipDuration,
          ease: cfg.easings.mask,
          scrollTrigger: {
            trigger: photoCol,
            start: "top 75%",
            onEnter: (self) => {
              if (photoRevealed) {
                gsap.set(photoReveal, { clipPath: 'none' });
                self.kill();
              }
            },
            onLeave: (self) => {
              photoRevealed = true;
              gsap.set(photoReveal, { clipPath: 'none' });
              self.kill();
            }
          },
          onComplete: () => {
            photoRevealed = true;
            gsap.set(photoReveal, { clipPath: 'none' });
          }
        });

        // Escala interna da foto 1.12 -> 1 em 1.8s
        if (photoImg) {
          gsap.to(photoImg, {
            scale: 1,
            duration: cfg.secondFold.photoScaleDuration,
            ease: "power3.out",
            scrollTrigger: {
              trigger: photoCol,
              start: "top 75%",
              toggleActions: "play none none none",
              onLeave: () => gsap.set(photoImg, { scale: 1 })
            },
            onComplete: () => {
              gsap.set(photoImg, { scale: 1 });
            }
          });

          // Parallax suave da foto (yPercent: -4 a 4, scrub: 0.6) ancorado à coluna estática (somente desktop >768px)
          if (window.matchMedia('(min-width: 769px)').matches) {
            gsap.fromTo(photoImg, {
              yPercent: -cfg.secondFold.photoParallaxY
            }, {
              yPercent: cfg.secondFold.photoParallaxY,
              ease: "none",
              scrollTrigger: {
                trigger: photoCol,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6
              }
            });
          }
        }
      }

      // Highlight sutil que segue o ponteiro no desktop
      const photoHighlight = document.querySelector('.profile-photo-highlight');
      if (photoReveal && photoHighlight) {
        photoReveal.addEventListener('mousemove', (e) => {
          const rect = photoReveal.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width) * 100;
          const y = ((e.clientY - rect.top) / rect.height) * 100;
          photoHighlight.style.setProperty('--mouse-x', `${x}%`);
          photoHighlight.style.setProperty('--mouse-y', `${y}%`);
        });
      }

      // ----------------------------------------------------------------------
      // 6. SEGUNDA DOBRA — CONTEÚDO EDITORIAL (LINE-MASK, LEAD, LISTA, QUOTE, CTA)
      // ----------------------------------------------------------------------
      const textCol = document.querySelector('.second-fold__col-text');

      if (textCol && typeof ScrollTrigger !== 'undefined') {
        const sobreAnimatedEls = [
          '.sobre__eyebrow',
          '.sobre__headline .line-inner',
          '.sobre__em',
          '.sobre__lead',
          '.sobre__micro-divider',
          '.sobre__micro-content',
          '.sobre__quote',
          '.sobre__quote-mark',
          '.sobre__cta-link',
          '.sobre__cta-underline'
        ];

        const sobreTl = gsap.timeline({
          scrollTrigger: {
            trigger: textCol,
            start: isDesktop ? "top 80%" : "top 75%",
            once: true,
            onStart: () => {
              gsap.set(sobreAnimatedEls, { willChange: 'transform,opacity,filter' });
            },
            onComplete: () => {
              secondFoldAnimated = true;
              gsap.set(sobreAnimatedEls, { clearProps: 'willChange' });
            }
          }
        });

        // Eyebrow e Headline (Line-Mask reveal com yPercent 110 -> 0 em 1.05s)
        sobreTl.fromTo(['.sobre__eyebrow', '.sobre__headline .line-inner'], {
          yPercent: 110
        }, {
          yPercent: 0,
          duration: cfg.secondFold.eyebrowHeadlineDuration,
          stagger: cfg.secondFold.headlineStagger,
          ease: "expo.out"
        }, 0);

        // Palavra em itálico "vivência familiar" entra em foco com blur calibrado (8px desktop / 5px mobile)
        sobreTl.fromTo('.sobre__em', {
          opacity: 0,
          filter: isMobile ? 'blur(5px)' : 'blur(8px)'
        }, {
          opacity: 1,
          filter: 'blur(0px)',
          duration: cfg.secondFold.emFocusDuration,
          ease: "power3.out"
        }, 0.3);

        // Lead (y: 21/18 -> 0, blur: 4px/3px -> 0, opacity: 0 -> 1 em 0.95s)
        sobreTl.fromTo('.sobre__lead', {
          opacity: 0,
          y: isMobile ? 18 : 21,
          filter: isMobile ? 'blur(3px)' : 'blur(4px)'
        }, {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: cfg.secondFold.leadDuration,
          ease: "expo.out"
        }, 0.4);

        // Micro Itens (Divisores scaleX: 0 -> 1 e Textos y: 14/12 -> 0)
        sobreTl.fromTo('.sobre__micro-divider', {
          scaleX: 0
        }, {
          scaleX: 1,
          duration: cfg.secondFold.dividerDuration,
          stagger: cfg.secondFold.dividerStagger,
          ease: "expo.out"
        }, 0.6);

        sobreTl.fromTo('.sobre__micro-content', {
          opacity: 0,
          y: isMobile ? 12 : 14
        }, {
          opacity: 1,
          y: 0,
          duration: cfg.secondFold.microTextDuration,
          stagger: cfg.secondFold.microTextStagger,
          ease: "expo.out"
        }, 0.7);

        // Quote (Fade up e quote mark scale: 0.8 -> 1)
        sobreTl.fromTo('.sobre__quote', {
          opacity: 0,
          y: isMobile ? 15 : 17
        }, {
          opacity: 1,
          y: 0,
          duration: cfg.secondFold.quoteDuration,
          ease: "expo.out"
        }, 0.9);

        sobreTl.fromTo('.sobre__quote-mark', {
          scale: 0.8
        }, {
          scale: 1,
          duration: 0.6,
          ease: "power2.out"
        }, 0.95);

        // CTA Underline e Arrow
        sobreTl.fromTo('.sobre__cta-link', {
          opacity: 0,
          y: isMobile ? 9 : 10
        }, {
          opacity: 1,
          y: 0,
          duration: cfg.secondFold.ctaDuration,
          ease: "expo.out"
        }, 1.1);

        sobreTl.fromTo('.sobre__cta-underline', {
          scaleX: 0
        }, {
          scaleX: 1,
          duration: 0.8,
          ease: "expo.out"
        }, 1.3);
      }

      // Safety Fallback via IntersectionObserver para Segunda Dobra (Bug #2)
      if (secondFold && 'IntersectionObserver' in window) {
        let secondFoldTimer = null;
        const secondFoldObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !secondFoldAnimated) {
              secondFoldTimer = setTimeout(forceSecondFoldVisible, cfg.secondFold.safetyTimeoutMs);
            } else if (!entry.isIntersecting && secondFoldTimer) {
              clearTimeout(secondFoldTimer);
            }
          });
        }, { threshold: 0.1 });
        secondFoldObserver.observe(secondFold);
      }

      // ----------------------------------------------------------------------
      // 7. INTERAÇÕES CONTÍNUAS: BOTÕES MAGNÉTICOS (HERO & SEGUNDA DOBRA)
      // ----------------------------------------------------------------------
      const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

      if (isFinePointer) {
        const setupMagnetic = (el) => {
          if (!el) return;
          const xTo = gsap.quickTo(el, 'x', { duration: cfg.magnetic.quickToDuration, ease: "power3.out" });
          const yTo = gsap.quickTo(el, 'y', { duration: cfg.magnetic.quickToDuration, ease: "power3.out" });

          let cachedRect = null;
          let isNear = false;
          const updateRect = () => { cachedRect = el.getBoundingClientRect(); };

          const onPointerMove = (e) => {
            if (!cachedRect) updateRect();
            const centerX = cachedRect.left + cachedRect.width / 2;
            const centerY = cachedRect.top + cachedRect.height / 2;
            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const maxInfluence = cfg.magnetic.proximityRadius + cachedRect.width / 2;

            if (Math.abs(dx) > maxInfluence || Math.abs(dy) > maxInfluence) {
              if (isNear) {
                isNear = false;
                xTo(0);
                yTo(0);
              }
              return;
            }

            const dist = Math.hypot(dx, dy);
            if (dist < maxInfluence) {
              isNear = true;
              const factor = 1 - (dist / maxInfluence);
              const intensity = Math.min(cfg.magnetic.maxTranslation, cfg.magnetic.maxTranslation * factor);
              const angle = Math.atan2(dy, dx);
              xTo(Math.cos(angle) * intensity);
              yTo(Math.sin(angle) * intensity);
            } else if (isNear) {
              isNear = false;
              xTo(0);
              yTo(0);
            }
          };

          const onPointerLeave = () => { isNear = false; cachedRect = null; xTo(0); yTo(0); };
          window.addEventListener('scroll', () => { cachedRect = null; }, { passive: true });
          window.addEventListener('resize', () => { cachedRect = null; }, { passive: true });
          window.addEventListener('pointermove', onPointerMove, { passive: true });
          el.addEventListener('pointerleave', onPointerLeave);
        };

        setupMagnetic(document.querySelector('.hero__btn-primary'));
        setupMagnetic(document.querySelector('.sobre__cta-link'));
      }

      // Resize Listener Debounced (condicionado a mudanca real de largura no mobile para evitar refresh na barra de endereco)
      let resizeTimeout;
      let lastWinWidth = window.innerWidth;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          if (!heroEntranceDone || typeof ScrollTrigger === 'undefined') return;
          const isMobile = window.matchMedia('(max-width: 768px)').matches;
          if (isMobile) {
            if (window.innerWidth !== lastWinWidth) {
              lastWinWidth = window.innerWidth;
              ScrollTrigger.refresh();
            }
          } else {
            lastWinWidth = window.innerWidth;
            ScrollTrigger.refresh();
          }
        }, 200);
      }, { passive: true });

      window.addEventListener('orientationchange', () => {
        lastWinWidth = window.innerWidth;
        if (typeof ScrollTrigger !== 'undefined') {
          requestAnimationFrame(() => {
            ScrollTrigger.refresh();
          });
        }
      }, { passive: true });

      // Refresh no load e após fonts ready para cálculos precisos de pinning e scroll
      const debouncedHeroRefresh = () => {
        if (typeof ScrollTrigger === 'undefined') return;
        if (window._stRefreshRaf) cancelAnimationFrame(window._stRefreshRaf);
        window._stRefreshRaf = requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          window._stRefreshRaf = null;
        });
      };

      window.addEventListener('load', debouncedHeroRefresh, { passive: true });

      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(debouncedHeroRefresh);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initEditorialMotion());
  } else {
    initEditorialMotion();
  }
})();
