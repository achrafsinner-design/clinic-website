/**
 * Scroll Reveal Animation System
 * IntersectionObserver-based animations with staggered reveals
 */

export function initScrollReveal(options = {}) {
  const {
    rootMargin = '0px 0px -10% 0px',
    threshold = 0.1,
    once = true,
    staggerBase = 50
  } = options;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Make all reveal elements visible immediately
    document.querySelectorAll('.reveal').forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.staggerDelay || '0', 10);

        setTimeout(() => {
          el.classList.add('visible');
        }, delay);

        if (once) {
          obs.unobserve(el);
        }
      } else if (!once) {
        entry.target.classList.remove('visible');
      }
    });
  }, { rootMargin, threshold });

  // Observe all reveal elements
  document.querySelectorAll('.reveal').forEach((el, index) => {
    // Auto-assign stagger delay if not set
    if (!el.dataset.staggerDelay) {
      const stagger = el.dataset.stagger || Math.min(index % 8 + 1, 8);
      el.dataset.staggerDelay = (stagger * staggerBase).toString();
      el.classList.add(`stagger-${stagger}`);
    }
    observer.observe(el);
  });

  return observer;
}

/**
 * Parallax effect for background elements
 */
export function initParallax(selector = '.parallax', speed = 0.3) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  const elements = document.querySelectorAll(selector);
  if (!elements.length) return;

  let ticking = false;

  function update() {
    const scrollY = window.scrollY;
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Only animate when element is in viewport vicinity
      if (scrollY + viewportHeight > elementTop && scrollY < elementTop + elementHeight) {
        const yPos = (scrollY - elementTop + viewportHeight) * speed;
        el.style.transform = `translate3d(0, ${yPos}px, 0)`;
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
  update(); // Initial

  return () => window.removeEventListener('scroll', onScroll);
}

/**
 * Counter animation for statistics
 */
export function initCounters(selector = '.counter') {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.dataset.target || el.textContent.replace(/[^\d.]/g, ''));
        const duration = parseInt(el.dataset.duration || '2000', 10);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const decimals = parseInt(el.dataset.decimals || '0', 10);

        if (prefersReducedMotion) {
          el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        } else {
          animateCounter(el, target, duration, prefix, suffix, decimals);
        }

        obs.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -20% 0px', threshold: 0.5 });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));

  return observer;
}

function animateCounter(el, target, duration, prefix, suffix, decimals) {
  const startTime = performance.now();
  const startValue = 0;

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = startValue + (target - startValue) * eased;

    el.textContent = `${prefix}${current.toFixed(decimals)}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
    }
  }

  requestAnimationFrame(update);
}

/**
 * Typewriter effect for text
 */
export function initTypewriter(selector = '.typewriter', speed = 50) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const text = el.dataset.text || el.textContent;
        el.textContent = '';

        if (prefersReducedMotion) {
          el.textContent = text;
        } else {
          typeWriter(el, text, speed);
        }

        obs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

function typeWriter(el, text, speed) {
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed + Math.random() * 50);
    }
  }
  type();
}

/**
 * Initialize all scroll animations
 */
export function initAllAnimations() {
  initScrollReveal();
  initParallax('.parallax-slow', 0.15);
  initParallax('.parallax-medium', 0.3);
  initCounters('.counter');
  initTypewriter('.typewriter');

  // Re-initialize on dynamic content (e.g., after fetch)
  document.addEventListener('astro:after-swap', () => {
    initScrollReveal({ once: false });
    initCounters('.counter');
  });
}

// Auto-init when DOM is ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllAnimations);
  } else {
    initAllAnimations();
  }
}