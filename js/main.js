/* =============================================
   PARTNER BOOL — MAIN JS v2
   Base + 6 UI/UX upgrades
   ============================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============ PRELOADER ============
  const preloader = document.getElementById('preloader');
  window.addEventListener('load', () => {
    setTimeout(() => {
      preloader.classList.add('is-hidden');
    }, prefersReducedMotion ? 200 : 1400);
  });

  // ============ LENIS SMOOTH SCROLL ============
  let lenis;
  if (!prefersReducedMotion) {
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      touchMultiplier: 1.5,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Helper: scroll to target
  function scrollToTarget(target, offset) {
    if (lenis) {
      lenis.scrollTo(target, { offset: offset || -40, duration: 1.2 });
    } else {
      const el = typeof target === 'string' ? document.querySelector(target) : target;
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }

  // ============ NAVBAR ============
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = mobileMenu.querySelectorAll('a');

  ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
      if (self.direction === 1 && self.scroll() > 80) {
        navbar.classList.add('is-scrolled');
      } else if (self.scroll() <= 80) {
        navbar.classList.remove('is-scrolled');
      }
    },
  });

  hamburger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.contains('is-open');
    if (isOpen) {
      closeMobileMenu();
    } else {
      mobileMenu.classList.add('is-open');
      hamburger.classList.add('is-active');
      if (lenis) lenis.stop();
    }
  });

  function closeMobileMenu() {
    mobileMenu.classList.remove('is-open');
    hamburger.classList.remove('is-active');
    if (lenis) lenis.start();
  }

  mobileLinks.forEach((link) => {
    link.addEventListener('click', () => closeMobileMenu());
  });

  // ============ NAV ACTIVE SECTION INDICATOR ============
  const navIndicator = document.getElementById('nav-indicator');
  const navLinksContainer = document.querySelector('.nav-links');
  const navLinkEls = navLinksContainer ? navLinksContainer.querySelectorAll('a') : [];

  function updateNavIndicator(activeLink) {
    if (!navIndicator || !activeLink || !navLinksContainer) return;
    const containerRect = navLinksContainer.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();
    navIndicator.style.left = (linkRect.left - containerRect.left) + 'px';
    navIndicator.style.width = linkRect.width + 'px';
    navIndicator.classList.add('is-visible');
  }

  function clearNavIndicator() {
    if (navIndicator) navIndicator.classList.remove('is-visible');
  }

  // Track active section via ScrollTrigger
  const sectionIds = ['problema', 'diferencial', 'proceso', 'equipo'];
  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;

    ScrollTrigger.create({
      trigger: section,
      start: 'top 40%',
      end: 'bottom 40%',
      onEnter: () => {
        const link = navLinksContainer.querySelector(`a[href="#${id}"]`);
        if (link) updateNavIndicator(link);
      },
      onEnterBack: () => {
        const link = navLinksContainer.querySelector(`a[href="#${id}"]`);
        if (link) updateNavIndicator(link);
      },
    });
  });

  // Clear indicator when at very top (hero)
  ScrollTrigger.create({
    trigger: '#inicio',
    start: 'top top',
    end: 'bottom 40%',
    onEnter: clearNavIndicator,
    onEnterBack: clearNavIndicator,
  });

  // ============ HERO TEXT ANIMATION ============
  const heroTitle = document.getElementById('hero-title');
  if (heroTitle && !prefersReducedMotion) {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = heroTitle.innerHTML;

    function wrapWords(node) {
      const result = [];
      node.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          child.textContent.split(/(\s+)/).forEach((word) => {
            if (word.trim()) {
              result.push(`<span class="word"><span class="word-inner">${word}</span></span>`);
            } else if (word) {
              result.push(word);
            }
          });
        } else if (child.tagName === 'BR') {
          result.push('<br>');
        } else if (child.tagName === 'EM') {
          child.textContent.split(/(\s+)/).forEach((word) => {
            if (word.trim()) {
              result.push(`<span class="word"><span class="word-inner"><em>${word}</em></span></span>`);
            } else if (word) {
              result.push(word);
            }
          });
        }
      });
      return result.join('');
    }

    heroTitle.innerHTML = wrapWords(tempDiv);

    setTimeout(() => {
      gsap.to(heroTitle.querySelectorAll('.word-inner'), {
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.06,
      });
    }, 1500);
  }

  // ============ SCROLL REVEAL ANIMATIONS ============
  function initRevealAnimations() {
    if (prefersReducedMotion) return;
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const type = el.getAttribute('data-reveal');
      const delay = parseFloat(el.getAttribute('data-reveal-delay') || 0);
      let fromVars = { opacity: 0, duration: 0.8, ease: 'power3.out', delay };

      switch (type) {
        case 'up': fromVars.y = 50; break;
        case 'left': fromVars.x = -50; break;
        case 'right': fromVars.x = 50; break;
        case 'scale': fromVars.scale = 0.92; fromVars.y = 30; break;
      }

      gsap.from(el, {
        ...fromVars,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
  }

  setTimeout(initRevealAnimations, 1600);

  // ============ HERO PARALLAX ============
  if (!prefersReducedMotion) {
    const heroBgImg = document.getElementById('hero-bg-img');
    if (heroBgImg) {
      gsap.to(heroBgImg, {
        y: 120, scale: 1.08,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.2 },
      });
    }

    document.querySelectorAll('.hero-glow').forEach((glow, i) => {
      gsap.to(glow, {
        y: -60 - i * 25,
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1.5 },
      });
    });

    // Manifiesto parallax
    const manifiestoImg = document.getElementById('manifiesto-bg-img');
    if (manifiestoImg) {
      gsap.to(manifiestoImg, {
        y: 60,
        scrollTrigger: { trigger: '.manifiesto', start: 'top bottom', end: 'bottom top', scrub: 1 },
      });
    }
  }

  // ============ STATS COUNTER ============
  document.querySelectorAll('.stat-number[data-count]').forEach((el) => {
    const target = parseInt(el.getAttribute('data-count'), 10);
    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => {
        if (prefersReducedMotion) { el.textContent = target.toLocaleString('es-AR'); return; }
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target, duration: 2, ease: 'power2.out',
          onUpdate: () => { el.textContent = Math.round(obj.val).toLocaleString('es-AR'); },
        });
      },
    });
  });

  // ============ TESTIMONIAL CAROUSEL (scroll-snap) ============
  const carousel = document.getElementById('testimonial-carousel');
  if (carousel) {
    const viewport = carousel.querySelector('.carousel-viewport');
    const track = carousel.querySelector('.carousel-track');
    const cards = track.querySelectorAll('.testimonio-card');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-arrow--prev');
    const nextBtn = carousel.querySelector('.carousel-arrow--next');
    let currentPage = 0;
    let autoplayTimer;

    function getCardsPerView() {
      if (window.innerWidth <= 640) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    }

    function getTotalPages() {
      return Math.max(1, cards.length - getCardsPerView() + 1);
    }

    function scrollToPage(page) {
      const perView = getCardsPerView();
      const maxPage = getTotalPages() - 1;
      currentPage = Math.max(0, Math.min(page, maxPage));
      const card = cards[currentPage];
      if (card && viewport) {
        viewport.scrollTo({ left: card.offsetLeft - viewport.offsetLeft, behavior: 'smooth' });
      }
      updateDots();
    }

    function updateDots() {
      const totalPages = getTotalPages();
      dots.forEach((dot, i) => {
        dot.classList.toggle('is-active', i === currentPage);
        dot.style.display = i < totalPages ? '' : 'none';
      });
    }

    function startAutoplay() { autoplayTimer = setInterval(() => scrollToPage(currentPage >= getTotalPages() - 1 ? 0 : currentPage + 1), 5000); }
    function stopAutoplay() { clearInterval(autoplayTimer); }

    if (nextBtn) nextBtn.addEventListener('click', () => { stopAutoplay(); scrollToPage(currentPage + 1); startAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { stopAutoplay(); scrollToPage(currentPage - 1); startAutoplay(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAutoplay(); scrollToPage(i); startAutoplay(); }));

    carousel.addEventListener('mouseenter', stopAutoplay);
    carousel.addEventListener('mouseleave', startAutoplay);

    // Sync dots on manual scroll
    if (viewport) {
      let scrollTimeout;
      viewport.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          const scrollLeft = viewport.scrollLeft;
          let closest = 0;
          let minDist = Infinity;
          cards.forEach((card, i) => {
            const dist = Math.abs(card.offsetLeft - viewport.offsetLeft - scrollLeft);
            if (dist < minDist) { minDist = dist; closest = i; }
          });
          currentPage = closest;
          updateDots();
        }, 100);
      }, { passive: true });
    }

    updateDots();
    startAutoplay();
  }

  // ============ FAQ ACCORDION ============
  document.querySelectorAll('.faq-item').forEach((item) => {
    item.querySelector('.faq-question').addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach((o) => o.classList.remove('is-open'));
      if (!isOpen) item.classList.add('is-open');
    });
  });

  // ============ CONTACT FORM ============
  const form = document.getElementById('bool-form');
  const formBtn = document.getElementById('form-btn');
  const successMsg = document.getElementById('form-success');
  const errorMsg = document.getElementById('form-error');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const action = form.getAttribute('action');
      if (!action || action === 'FORMSPREE_ENDPOINT') {
        errorMsg.textContent = 'El formulario aún no está configurado.';
        errorMsg.classList.add('visible');
        return;
      }
      formBtn.disabled = true;
      formBtn.textContent = 'Enviando...';
      errorMsg.classList.remove('visible');
      try {
        const res = await fetch(action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (res.ok) { form.style.display = 'none'; successMsg.classList.add('visible'); }
        else throw new Error();
      } catch {
        formBtn.disabled = false;
        formBtn.textContent = 'Quiero saber más →';
        errorMsg.classList.add('visible');
      }
    });
  }

  // ============ FLOATING ELEMENTS ============
  const whatsappBtn = document.getElementById('whatsapp-float');
  const backToTopBtn = document.getElementById('back-to-top');

  ScrollTrigger.create({
    start: 'top -600',
    onUpdate: (self) => {
      const visible = self.scroll() > 600;
      whatsappBtn.classList.toggle('is-visible', visible);
      backToTopBtn.classList.toggle('is-visible', visible);
    },
  });

  backToTopBtn.addEventListener('click', () => scrollToTarget(0));

  // ============ MAGNETIC BUTTONS ============
  if (!prefersReducedMotion) {
    document.querySelectorAll('.btn--magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - rect.left - rect.width / 2) * 0.2,
          y: (e.clientY - rect.top - rect.height / 2) * 0.2,
          duration: 0.4, ease: 'power2.out',
        });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });
  }

  // ============ SMOOTH ANCHOR LINKS ============
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) scrollToTarget(target);
    });
  });

  // ============ CUSTOM CURSOR — Crosshair ============
  const cursor = document.getElementById('custom-cursor');
  if (cursor && window.matchMedia('(hover: hover)').matches && !prefersReducedMotion) {
    // Track mouse position
    document.addEventListener('mousemove', (e) => {
      gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1, ease: 'power2.out' });
      if (!cursor.classList.contains('is-visible')) cursor.classList.add('is-visible');

      // Detect light vs dark section under cursor
      const elUnder = document.elementFromPoint(e.clientX, e.clientY);
      if (elUnder) {
        const section = elUnder.closest('.section--warm, .section--white, .marquee, .footer, .section--dark, .section--black, .hero, .manifiesto, .preloader, .mobile-menu, nav');
        if (section) {
          const isLight = section.classList.contains('section--warm') ||
                          section.classList.contains('section--white') ||
                          section.classList.contains('marquee');
          cursor.classList.toggle('on-light', isLight);
        }
      }
    });

    document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
    document.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));

    // Hover targets — ring expands
    const hoverTargets = document.querySelectorAll('a, button, .pillar, .pain-card, .team-card, .stat-card, .faq-question, .testimonio-card, .compare-card');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
    });

    // Text inputs — thin line
    const textTargets = document.querySelectorAll('input, textarea');
    textTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('is-text'); cursor.classList.remove('is-hover'); });
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-text'));
    });
  }

  // ============ FIX SCROLL JUMPS ============
  // Refresh ScrollTrigger after preloader + reveals settle
  setTimeout(() => {
    ScrollTrigger.refresh(true);
  }, 2200);

  // Also refresh after all images load
  window.addEventListener('load', () => {
    setTimeout(() => ScrollTrigger.refresh(true), 200);
  });
})();
