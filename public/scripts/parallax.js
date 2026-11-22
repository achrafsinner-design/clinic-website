// Parallax Effects System
// Multiple parallax types: scroll, mouse, cursor-following

interface ParallaxOptions {
  selector?: string;
  speed?: number;
  direction?: 'vertical' | 'horizontal' | 'both';
  wrapper?: Element | null;
}

interface MouseParallaxOptions {
  selector?: string;
  strength?: number;
  easing?: number;
  wrapper?: Element | null;
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Scroll-based parallax
export function initParallax(options: ParallaxOptions = {}) {
  const {
    selector = '.parallax',
    speed = 0.3,
    direction = 'vertical',
    wrapper = null
  } = options;

  if (prefersReducedMotion()) return () => {};

  const elements = (wrapper || document).querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

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
        const progress = (scrollY - elementTop + viewportHeight) / (viewportHeight + elementHeight);
        const yPos = (progress - 0.5) * elementHeight * speed * 2;

        if (direction === 'vertical' || direction === 'both') {
          el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        }
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

// Mouse/touch parallax (depth effect)
export function initMouseParallax(options: MouseParallaxOptions = {}) {
  const {
    selector = '.mouse-parallax',
    strength = 20,
    easing = 0.1,
    wrapper = null
  } = options;

  if (prefersReducedMotion()) return () => {};

  const elements = (wrapper || document).querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  // Store element data for smooth animation
  const elementData = Array.from(elements).map(el => {
    const depth = parseFloat(el.dataset.depth || '1');
    return {
      element: el,
      depth,
      targetX: 0,
      targetY: 0,
      currentX: 0,
      currentY: 0
    };
  });

  let mouseX = 0;
  let mouseY = 0;
  let centerX = window.innerWidth / 2;
  let centerY = window.innerHeight / 2;

  function onMouseMove(e: MouseEvent) {
    mouseX = e.clientX - centerX;
    mouseY = e.clientY - centerY;
  }

  function onTouchMove(e: TouchEvent) {
    if (e.touches[0]) {
      mouseX = e.touches[0].clientX - centerX;
      mouseY = e.touches[0].clientY - centerY;
    }
  }

  function onResize() {
    centerX = window.innerWidth / 2;
    centerY = window.innerHeight / 2;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  window.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('resize', onResize, { passive: true });

  // Animation loop
  let animationId: number;

  function animate() {
    elementData.forEach(({ element, depth, targetX, targetY, currentX, currentY }) => {
      // Update targets based on mouse position and depth
      const tx = (mouseX / centerX) * strength * depth;
      const ty = (mouseY / centerY) * strength * depth;

      // Smooth interpolation
      const newX = currentX + (tx - currentX) * easing;
      const newY = currentY + (ty - currentY) * easing;

      element.style.transform = `translate3d(${newX}px, ${newY}px, 0)`;

      // Update stored values
      // Note: we need to mutate the object, so we use a different approach
      (element as any)._parallaxCurrentX = newX;
      (element as any)._parallaxCurrentY = newY;
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();

  return () => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('resize', onResize);
  };
}

// Cursor-following elements (like custom cursors, glows)
export function initCursorFollow(options: {
  cursorSelector?: string;
  followerSelector?: string;
  easing?: number;
} = {}) {
  const {
    cursorSelector = '[data-cursor]',
    followerSelector = '[data-cursor-follower]',
    easing = 0.2
  } = options;

  if (prefersReducedMotion()) return () => {};

  const cursor = document.querySelector<HTMLElement>(cursorSelector);
  const follower = document.querySelector<HTMLElement>(followerSelector);

  if (!cursor || !follower) return () => {};

  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let followerX = 0;
  let followerY = 0;

  function onMouseMove(e: MouseEvent) {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  function animate() {
    // Main cursor - immediate
    cursorX = mouseX;
    cursorY = mouseY;
    cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;

    // Follower - delayed
    followerX += (cursorX - followerX) * easing;
    followerY += (cursorY - followerY) * easing;
    follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;

    requestAnimationFrame(animate);
  }

  animate();

  return () => window.removeEventListener('mousemove', onMouseMove);
}

// Scroll-linked animations (like progress indicators, morphing shapes)
export function initScrollLinked(options: {
  selector?: string;
  onProgress?: (progress: number, element: HTMLElement) => void;
} = {}) {
  const { selector = '[data-scroll-linked]', onProgress } = options;

  if (prefersReducedMotion()) return () => {};

  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  function update() {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(scrollY / maxScroll, 1);

    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementTop = rect.top + scrollY;
      const elementHeight = rect.height;
      const viewportHeight = window.innerHeight;

      // Element-specific progress (0 to 1 as element passes through viewport)
      const elProgress = Math.max(0, Math.min(1,
        (scrollY + viewportHeight - elementTop) / (viewportHeight + elementHeight)
      ));

      if (onProgress) {
        onProgress(elProgress, el);
      }

      // Default: CSS custom property for use in styles
      el.style.setProperty('--scroll-progress', elProgress.toFixed(3));
      el.style.setProperty('--scroll-progress-global', progress.toFixed(3));
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  update();

  return () => window.removeEventListener('scroll', update);
}

// 3D card tilt effect
export function initTiltEffect(selector = '.tilt-card', maxTilt = 15) {
  if (prefersReducedMotion()) return () => {};

  const cards = document.querySelectorAll<HTMLElement>(selector);
  if (!cards.length) return () => {};

  cards.forEach(card => {
    const shine = card.querySelector<HTMLElement>('.tilt-shine');

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt * -1;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;

      if (shine) {
        shine.style.opacity = '0.3';
        shine.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      if (shine) {
        shine.style.opacity = '0';
      }
    });
  });

  return () => {};
}

// Reveal on scroll with 3D perspective
export function initPerspectiveReveal(selector = '.perspective-reveal') {
  if (prefersReducedMotion()) return () => {};

  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseFloat(el.dataset.delay || '0');

        setTimeout(() => {
          el.style.transition = 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
          el.style.opacity = '1';
        }, delay * 1000);

        observer.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });

  elements.forEach(el => {
    el.style.transform = 'perspective(1000px) rotateX(20deg) rotateY(-10deg) translateZ(-100px)';
    el.style.opacity = '0';
    el.style.transformOrigin = 'center bottom';
    observer.observe(el);
  });

  return () => observer.disconnect();
}