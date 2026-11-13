/**
 * Kelly Corrêa — Neuropsicopedagogia Clínica
 * JavaScript Front-End Acessível, Otimizado e com Interações do Design System
 */

document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  const raiz = document.documentElement;
  const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const toque = window.matchMedia('(hover: none), (pointer: coarse)').matches;

  // 1. Atualização dinâmica do ano nos direitos autorais
  const yearElements = document.querySelectorAll('.js-current-year');
  const currentYear = new Date().getFullYear();
  yearElements.forEach((el) => {
    el.textContent = currentYear;
  });

  // 2. Menu Mobile Acessível (WCAG)
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navMenu = document.querySelector('.nav-menu');

  if (menuToggle && navMenu) {
    const toggleMenu = (open) => {
      const isExpanded = open !== undefined ? open : menuToggle.getAttribute('aria-expanded') === 'true';
      const targetState = !isExpanded;

      menuToggle.setAttribute('aria-expanded', String(targetState));
      navMenu.classList.toggle('open', targetState);
      
      if (targetState) {
        document.body.style.overflow = 'hidden';
        const firstLink = navMenu.querySelector('a');
        if (firstLink) firstLink.focus();
      } else {
        document.body.style.overflow = '';
        menuToggle.focus();
      }
    };

    menuToggle.addEventListener('click', () => toggleMenu());

    // Fechar ao teclar Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        toggleMenu(false);
      }
    });

    // Fechar ao clicar em links internos do menu
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 860) {
          toggleMenu(false);
        }
      });
    });
  }

  // 3. Efeito no Header ao Rolar gerenciado exclusivamente por nav-motion.js (P-07: desduplicação)

  // 4. Otimização do Vídeo da Hero (Economia de Bateria & Prefers-Reduced-Motion)
  const heroVideo = document.querySelector('.hero-video');
  if (heroVideo) {
    if (movimentoReduzido) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    } else if ('IntersectionObserver' in window) {
      const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heroVideo.play().catch(() => {});
          } else {
            heroVideo.pause();
          }
        });
      }, { threshold: 0.15 });

      videoObserver.observe(heroVideo);
    }
  }

  // 5. Accordions Acessíveis de FAQ (detalhes suaves)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) {
        faqItems.forEach((otherItem) => {
          if (otherItem !== item && otherItem.open) {
            otherItem.removeAttribute('open');
          }
        });
      }
    });
  });

  // 6. Cursor Magnético Personalizado & Seguidor com Inércia Suave (.cursor)
  if (!toque) {
    const cursor = document.querySelector('.cursor');
    const ponto = document.querySelector('.cursor__ponto');
    const anel = document.querySelector('.cursor__anel');
    const texto = document.querySelector('.cursor__texto');

    if (cursor && ponto && anel) {
      // Constantes de Decay do Anel (calibrado para ~0.37 efetivo a 60fps / 16.6ms)
      const RING_DECAY = 0.001;
      const RING_SPEED = 4.0; // factor = 1 - Math.pow(RING_DECAY, dt * RING_SPEED)

      let mx = -100, my = -100;
      let ax = -100, ay = -100;
      let seguindo = false;
      let tabAtiva = !document.hidden;
      let inicializado = false;
      let ultimoTempo = 0;
      let rafId = null;

      const pararLoop = () => {
        seguindo = false;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
      };

      const ativarCursor = () => {
        cursor.classList.add('ativo');
        document.documentElement.classList.add('cursor-ativo');
      };

      const desativarCursor = () => {
        pararLoop();
        cursor.classList.remove('ativo');
        document.documentElement.classList.remove('cursor-ativo');
      };

      // Loop único com requestAnimationFrame: ponto sincronizado e anel veloz frame-rate independent
      const tick = (agora) => {
        if (!tabAtiva || !seguindo) {
          seguindo = false;
          return;
        }

        const dt = Math.min((agora - ultimoTempo) / 1000, 0.1);
        ultimoTempo = agora;

        // Ponto: colado diretamente às coordenadas do ponteiro sem qualquer lerp
        ponto.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

        // Anel: perseguição suave, imediata e independente de taxa de quadros (60Hz, 120Hz, 144Hz)
        if (movimentoReduzido) {
          ax = mx;
          ay = my;
        } else {
          const fator = 1 - Math.pow(RING_DECAY, dt * RING_SPEED);
          ax += (mx - ax) * fator;
          ay += (my - ay) * fator;
        }
        anel.style.transform = `translate3d(${ax.toFixed(2)}px, ${ay.toFixed(2)}px, 0)`;

        // Pausa rAF quando o anel atinge a posição (economia de CPU)
        const distSq = (mx - ax) * (mx - ax) + (my - ay) * (my - ay);
        if (distSq > 0.04) {
          rafId = requestAnimationFrame(tick);
        } else {
          ax = mx;
          ay = my;
          anel.style.transform = `translate3d(${ax.toFixed(2)}px, ${ay.toFixed(2)}px, 0)`;
          seguindo = false;
        }
      };

      const iniciarLoop = () => {
        if (!seguindo && tabAtiva) {
          seguindo = true;
          ultimoTempo = performance.now();
          rafId = requestAnimationFrame(tick);
        }
      };

      window.addEventListener('pointermove', (e) => {
        if (e.pointerType && e.pointerType !== 'mouse') return;
        mx = e.clientX;
        my = e.clientY;

        // Se estiver sobre input/textarea/select, deixa o cursor nativo de texto
        if (e.target && typeof e.target.closest === 'function' && e.target.closest('input, textarea, select, [contenteditable="true"]')) {
          desativarCursor();
          return;
        }

        // Inicializa na primeira coordenada para evitar deslizar do canto da tela
        if (!inicializado) {
          ax = mx;
          ay = my;
          inicializado = true;
          ponto.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
          anel.style.transform = `translate3d(${ax.toFixed(2)}px, ${ay.toFixed(2)}px, 0)`;
          ativarCursor();
        } else if (!cursor.classList.contains('ativo')) {
          ativarCursor();
        }

        // Ponto responde instantaneamente ao evento de ponteiro
        ponto.style.transform = `translate3d(${mx}px, ${my}px, 0)`;

        iniciarLoop();
      }, { passive: true });

      document.addEventListener('pointerleave', desativarCursor);
      document.addEventListener('pointerenter', (e) => {
        if (e && e.clientX != null) {
          mx = e.clientX;
          my = e.clientY;
          if (!inicializado) {
            ax = mx;
            ay = my;
            inicializado = true;
          }
        }
        ativarCursor();
        iniciarLoop();
      });
      window.addEventListener('blur', desativarCursor);

      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          tabAtiva = false;
          desativarCursor();
        } else {
          tabAtiva = true;
        }
      });

      document.addEventListener('mouseover', (e) => {
        const target = e.target;
        if (!target || typeof target.closest !== 'function') return;

        // Verifica se é campo de texto
        if (target.closest('input, textarea, select, [contenteditable="true"]')) {
          desativarCursor();
          return;
        }

        const comTexto = target.closest('[data-cursor]');
        const clicavel = target.closest('a, button, summary, .hero__seal, .btn, .nav-cta, .whatsapp-float, [role="button"]');
        const emSecaoEscura = target.closest('.hero, .faixa, .site-footer, [data-tema="escuro"]');

        cursor.classList.toggle('tema-claro', !emSecaoEscura);
        cursor.classList.toggle('com-texto', !!comTexto);
        cursor.classList.toggle('sobre-link', !comTexto && !!clicavel);

        if (texto && comTexto) {
          texto.textContent = comTexto.getAttribute('data-cursor');
        }
      });
    }

    // Botões e Elementos com Efeito Magnético ([data-magnetico], .btn, .botao, .nav-cta, .whatsapp-float)
    const elementosMagneticos = document.querySelectorAll('[data-magnetico], .btn, .botao, .nav-cta, .whatsapp-float');
    elementosMagneticos.forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = `translate(${(dx * 0.22).toFixed(1)}px, ${(dy * 0.30).toFixed(1)}px)`;
      });

      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });

    // Revelação Suave no Scroll (Scroll Reveal com curva orgânica)
    if ('IntersectionObserver' in window) {
      const elementosRevelar = document.querySelectorAll('.service-card, .step-card, .testimonial-card, .contact-card, .highlight-box, .btn, .botao');
      const revelador = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revelado');
            revelador.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      elementosRevelar.forEach((el) => {
        if (!el.classList.contains('revelado')) {
          revelador.observe(el);
        }
      });
    }
  }

  // 7. Faixa de Marquee: Aceleração Reativa com a Rolagem (PlaybackRate) — Otimizado com IntersectionObserver (P-04)
  const trilhoDaFaixa = document.querySelector('[data-faixa]');
  const secaoFaixa = document.querySelector('.faixa') || trilhoDaFaixa;
  if (trilhoDaFaixa && !movimentoReduzido) {
    let animacaoDaFaixa = null;
    let yAnterior = window.scrollY;
    let velocidade = 0;
    let ritmoAtual = 1;
    let faixaVisivel = false;
    let rafFaixaId = null;

    if (trilhoDaFaixa.getAnimations) {
      const anims = trilhoDaFaixa.getAnimations();
      if (anims.length > 0) animacaoDaFaixa = anims[0];
    }

    const onScrollFaixa = () => {
      if (!faixaVisivel) return;
      const yAtual = window.scrollY;
      velocidade = Math.abs(yAtual - yAnterior);
      yAnterior = yAtual;
    };
    window.addEventListener('scroll', onScrollFaixa, { passive: true });

    const atualizarFaixa = () => {
      if (!faixaVisivel) {
        rafFaixaId = null;
        return;
      }

      if (!animacaoDaFaixa && trilhoDaFaixa.getAnimations) {
        const anims = trilhoDaFaixa.getAnimations();
        if (anims.length > 0) animacaoDaFaixa = anims[0];
      }

      if (animacaoDaFaixa) {
        const ritmoAlvo = 1 + Math.min(2.2, velocidade * 0.08);
        ritmoAtual += (ritmoAlvo - ritmoAtual) * 0.1;
        velocidade *= 0.88;

        if (Math.abs(ritmoAtual - animacaoDaFaixa.playbackRate) > 0.02) {
          animacaoDaFaixa.playbackRate = ritmoAtual;
        }
      }

      rafFaixaId = requestAnimationFrame(atualizarFaixa);
    };

    // P-04: Pausa loop e processamento da faixa quando fora do viewport
    if ('IntersectionObserver' in window && secaoFaixa) {
      const faixaObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          faixaVisivel = entry.isIntersecting;
          if (faixaVisivel && !rafFaixaId) {
            yAnterior = window.scrollY;
            rafFaixaId = requestAnimationFrame(atualizarFaixa);
          }
        });
      }, { threshold: 0.05 });
      faixaObserver.observe(secaoFaixa);
    } else {
      faixaVisivel = true;
      rafFaixaId = requestAnimationFrame(atualizarFaixa);
    }
  }

  // P-05: Pausa animação de blobs com desfoque profundo quando fora do viewport
  if ('IntersectionObserver' in window) {
    const secoesComBlobs = document.querySelectorAll('.servicos, .galeria, .relatos, .chamada-final');
    if (secoesComBlobs.length > 0) {
      const blobObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const blobs = entry.target.querySelectorAll('.servicos__blob, .galeria__blob, .relatos__blob, .chamada-final__blob');
          blobs.forEach((blob) => {
            blob.classList.toggle('p-paused', !entry.isIntersecting);
          });
        });
      }, { rootMargin: '100px 0px 100px 0px' });
      secoesComBlobs.forEach((s) => blobObserver.observe(s));
    }
  }

  // 8. Selo Giratório (.selo-giro) Interativo
  const seloGiro = document.querySelector('.selo-giro');
  if (seloGiro) {
    seloGiro.addEventListener('click', () => {
      // Rola suavemente até a próxima seção de informações
      const proximaSecao = document.querySelector('.second-fold') || document.querySelector('#sobre');
      if (proximaSecao) {
        proximaSecao.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
});
