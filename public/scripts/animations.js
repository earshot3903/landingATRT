const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

function animateCounter(el, target, duration = 1300) {
  if (prefersReducedMotion()) {
    el.textContent = target;
    return;
  }

  const startTime = performance.now();
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutExpo(progress);
    const current = Math.floor(target * eased);
    el.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
    }
  }

  requestAnimationFrame(tick);
}

function initCounterObserver() {
  if (prefersReducedMotion()) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const value = Number(el.dataset.value || el.textContent.replace(/[^0-9.]/g, ''));
          if (!isNaN(value) && !el.dataset.animated) {
            el.dataset.animated = 'true';
            animateCounter(el, value);
          }
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.4, rootMargin: '0px 0px -50px 0px' }
  );

  document.querySelectorAll('[data-counter]').forEach((el) => observer.observe(el));
}

function initRevealObserver() {
  if (prefersReducedMotion()) {
    document
      .querySelectorAll(
        '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .hero-reveal, .fade-up, .fade-up-delay, .fade-up-soft'
      )
      .forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
    return;
  }

  if (!('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('animations-ready');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = Math.min(Number(el.dataset.delay || 0), 240);
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );

  document
    .querySelectorAll(
      '.reveal, .reveal-up, .reveal-left, .reveal-right, .reveal-scale, .hero-reveal, .fade-up, .fade-up-delay, .fade-up-soft'
    )
    .forEach((el) => observer.observe(el));
}

function initParallax() {
  if (prefersReducedMotion()) return;

  const parallaxElements = document.querySelectorAll('.parallax-slow');
  if (!parallaxElements.length) return;

  let ticking = false;

  function update() {
    parallaxElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const speed = Number(el.dataset.speed || 0.15);
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        const offset = (window.innerHeight - rect.top) * speed;
        el.style.transform = `translateY(${offset}px)`;
      }
    });
    ticking = false;
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(update);
      ticking = true;
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

function initNavbarScroll() {
  const navbar = document.querySelector('header.sticky');
  if (!navbar) return;

  let ticking = false;

  function onScroll() {
    const scrollY = window.scrollY;
    if (scrollY > 20) {
      navbar.classList.add('navbar-scrolled');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }

  window.addEventListener('scroll', requestTick, { passive: true });
}

function init() {
  initRevealObserver();
  initCounterObserver();
  initNavbarScroll();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
