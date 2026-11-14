/**
 * ============================================================================
 * KELLY CORRÊA — NEUROPSICOPEDAGOGIA CLÍNICA
 * HEADER / NAVEGAÇÃO INSTITUCIONAL (.site-header)
 * Motion Controller: Header Scroll Compact, Magnetic CTA, Link Underlines & Mobile Panel
 * ============================================================================
 */

// TIMING & EASING TOKENS (Expostos no topo para calibração)
const NAV_MOTION_CONFIG = {
  easings: {
    soft: "cubic-bezier(0.22, 1, 0.36, 1)", // --ease-soft
    mask: "cubic-bezier(0.65, 0, 0.35, 1)"  // --ease-mask
  },
  timings: {
    entranceDuration: 0.8,
    entranceStagger: 0.05,
    mobileItemStagger: 0.06,
    scrollThreshold: 40
  },
  magnetic: {
    pullX: 0.18,
    pullY: 0.25
  }
};

(function () {
  'use strict';

  function initNavMotion() {
    const header = document.querySelector('.site-header');
    if (!header) return;

    const cfg = NAV_MOTION_CONFIG;
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const navMenu = header.querySelector('.nav-menu');
    const menuToggle = header.querySelector('.mobile-menu-toggle');
    const navLinks = Array.from(header.querySelectorAll('.nav-link'));
    const navCta = header.querySelector('.nav-cta');
    const brandLink = header.querySelector('.brand-link');

    // =========================================================================
    // STEP 5 — SCROLL COMPACT STATE (Past 40px)
    // =========================================================================
    let ticking = false;
    function updateScrollState() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      if (scrollY > cfg.timings.scrollThreshold) {
        header.classList.add('site-header--scrolled');
      } else {
        header.classList.remove('site-header--scrolled');
      }
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollState);
        ticking = true;
      }
    }, { passive: true });

    updateScrollState();

    // =========================================================================
    // STEP 5 — ENTRANCE ANIMATION ON LOAD (Fade Down)
    // =========================================================================
    if (typeof gsap !== 'undefined' && !isReducedMotion) {
      const entranceItems = [brandLink, ...navLinks, navCta].filter(Boolean);
      gsap.fromTo(entranceItems,
        { y: -10, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: cfg.timings.entranceDuration,
          stagger: cfg.timings.entranceStagger,
          ease: cfg.easings.soft,
          clearProps: 'transform,opacity'
        }
      );
    }

    // =========================================================================
    // STEP 4 — LINK UNDERLINE INTERACTION (Draw Left -> Retract Right)
    // =========================================================================
    navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        link.style.setProperty('--line-origin', 'left center');
      });
      link.addEventListener('mouseleave', () => {
        link.style.setProperty('--line-origin', 'right center');
      });
    });

    // =========================================================================
    // STEP 3 — CTA BUTTON MAGNETIC PULL (Desktop Fine Pointer Only)
    // =========================================================================
    if (isFinePointer && navCta && typeof gsap !== 'undefined') {
      navCta.addEventListener('mousemove', (e) => {
        const rect = navCta.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        gsap.to(navCta, {
          x: dx * cfg.magnetic.pullX,
          y: dy * cfg.magnetic.pullY,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      navCta.addEventListener('mouseleave', () => {
        gsap.to(navCta, { x: 0, y: 0, duration: 0.6, ease: cfg.easings.soft });
      });
    }

    // =========================================================================
    // STEP 2 — MOBILE FULL-SCREEN PANEL (< 1100px), FOCUS TRAP & ESC
    // =========================================================================
    if (menuToggle && navMenu) {
      // Sincroniza estado de expansão com Lenis, lock de scroll e animação
      const menuObserver = new MutationObserver(() => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        if (isExpanded) {
          navMenu.classList.add('is-open');
          header.classList.add('menu-open');

          if (window.lenis && typeof window.lenis.stop === 'function') {
            window.lenis.stop();
          }
          document.body.style.overflow = 'hidden';

          // Animação de entrada dos links com line-mask stagger
          if (typeof gsap !== 'undefined' && !isReducedMotion) {
            const mobileLinks = navMenu.querySelectorAll('.nav-link, .nav-cta-mobile');
            gsap.fromTo(mobileLinks,
              { y: 32, opacity: 0 },
              {
                y: 0,
                opacity: 1,
                duration: 0.6,
                stagger: cfg.timings.mobileItemStagger,
                ease: cfg.easings.soft
              }
            );
          }

          const firstLink = navMenu.querySelector('a');
          if (firstLink) firstLink.focus();
        } else {
          navMenu.classList.remove('is-open');
          header.classList.remove('menu-open');

          if (window.lenis && typeof window.lenis.start === 'function') {
            window.lenis.start();
          }
          document.body.style.overflow = '';
        }
      });

      menuObserver.observe(menuToggle, { attributes: true, attributeFilter: ['aria-expanded'] });

      // Fechar ao teclar Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
          menuToggle.click();
        }
      });

      // Focus Trap acessível dentro do menu aberto
      navMenu.addEventListener('keydown', (e) => {
        if (menuToggle.getAttribute('aria-expanded') !== 'true' || e.key !== 'Tab') return;
        const focusable = Array.from(navMenu.querySelectorAll('a[href], button:not([disabled])'));
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      });

      // Fechar ao clicar em qualquer link interno abaixo de 1100px
      navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          if (menuToggle.getAttribute('aria-expanded') === 'true') {
            menuToggle.click();
          }
        });
      });
    }

    // =========================================================================
    // STEP 4 — ATUALIZAÇÃO DO ITEM ATIVO POR SCROLL (IntersectionObserver)
    // =========================================================================
    if ('IntersectionObserver' in window) {
      const sectionMap = {
        '#consultorio': 'a[href*="#consultorio"]',
        '#servicos': 'a[href*="#servicos"]',
        '#como-iniciar': 'a[href*="#como-iniciar"]',
        '#relatos': 'a[href*="#relatos"]',
        '#faq': 'a[href*="#faq"]'
      };

      const sections = document.querySelectorAll(Object.keys(sectionMap).join(', '));
      if (sections.length > 0) {
        const navObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const id = '#' + entry.target.id;
              const linkSelector = sectionMap[id];
              const matchingLink = header.querySelector(linkSelector);
              if (matchingLink) {
                navLinks.forEach(l => l.classList.remove('active'));
                matchingLink.classList.add('active');
              }
            }
          });
        }, { rootMargin: '-20% 0px -60% 0px' });

        sections.forEach(s => navObserver.observe(s));
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavMotion);
  } else {
    initNavMotion();
  }
})();
