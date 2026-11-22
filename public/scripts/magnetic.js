// Magnetic Button & Element Effects
// Interactive hover/touch effects with physics-based motion

interface MagneticOptions {
  selector?: string;
  strength?: number;
  easing?: number;
  maxDistance?: number;
  affectChildren?: boolean;
}

interface MagneticElement extends HTMLElement {
  _magneticData?: {
    currentX: number;
    currentY: number;
    targetX: number;
    targetY: number;
    animationId: number;
  };
}

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Initialize magnetic buttons
export function initMagneticButtons(options: MagneticOptions = {}) {
  const {
    selector = '.magnetic',
    strength = 0.3,
    easing = 0.15,
    maxDistance = 100,
    affectChildren = true
  } = options;

  if (prefersReducedMotion()) return () => {};

  const elements = document.querySelectorAll<MagneticElement>(selector);
  if (!elements.length) return () => {};

  elements.forEach(el => {
    const elStrength = parseFloat(el.dataset.magneticStrength || String(strength));
    const elEasing = parseFloat(el.dataset.magneticEasing || String(easing));
    const elMaxDistance = parseFloat(el.dataset.magneticMaxDistance || String(maxDistance));

    // Initialize magnetic data
    el._magneticData = {
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0,
      animationId: 0
    };

    // Handle mouse move
    el.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance <= elMaxDistance) {
        // Calculate attraction force (inverse square falloff)
        const force = Math.max(0, 1 - distance / elMaxDistance);
        const targetX = deltaX * elStrength * force;
        const targetY = deltaY * elStrength * force;

        if (el._magneticData) {
          el._magneticData.targetX = targetX;
          el._magneticData.targetY = targetY;
        }

        // Animate children in opposite direction for depth
        if (affectChildren) {
          const children = el.querySelectorAll<HTMLElement>('[data-magnetic-child]');
          children.forEach(child => {
            const childStrength = parseFloat(child.dataset.magneticChild || '0.15');
            const childX = -deltaX * childStrength * force;
            const childY = -deltaY * childStrength * force;
            child.style.transform = `translate3d(${childX}px, ${childY}px, 0)`;
          });
        }
      }
    }, { passive: true });

    // Handle mouse leave - spring back
    el.addEventListener('mouseleave', () => {
      if (el._magneticData) {
        el._magneticData.targetX = 0;
        el._magneticData.targetY = 0;
      }

      if (affectChildren) {
        const children = el.querySelectorAll<HTMLElement>('[data-magnetic-child]');
        children.forEach(child => {
          child.style.transform = 'translate3d(0, 0, 0)';
          child.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          setTimeout(() => { child.style.transition = ''; }, 500);
        });
      }
    });

    // Animation loop for smooth motion
    function animate() {
      if (!el._magneticData) return;

      const data = el._magneticData;

      // Spring physics
      data.currentX += (data.targetX - data.currentX) * elEasing;
      data.currentY += (data.targetY - data.currentY) * elEasing;

      // Apply transform
      if (Math.abs(data.currentX) > 0.01 || Math.abs(data.currentY) > 0.01) {
        el.style.transform = `translate3d(${data.currentX}px, ${data.currentY}px, 0)`;
      } else {
        data.currentX = 0;
        data.currentY = 0;
        el.style.transform = 'translate3d(0, 0, 0)';
      }

      data.animationId = requestAnimationFrame(animate);
    }

    // Start animation loop
    data.animationId = requestAnimationFrame(animate);

    // Touch support
    el.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches[0]) {
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
          clientX: touch.clientX,
          clientY: touch.clientY,
          bubbles: true,
          cancelable: true
        });
        el.dispatchEvent(mouseEvent);
      }
    }, { passive: true });

    el.addEventListener('touchend', () => {
      const mouseEvent = new MouseEvent('mouseleave', { bubbles: true, cancelable: true });
      el.dispatchEvent(mouseEvent);
    }, { passive: true });
  });

  // Cleanup function
  return () => {
    elements.forEach(el => {
      if (el._magneticData) {
        cancelAnimationFrame(el._magneticData.animationId);
      }
    });
  };
}

// Ripple effect on click
export function initRippleEffect(selector = '.ripple') {
  if (prefersReducedMotion()) return () => {};

  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  elements.forEach(el => {
    el.addEventListener('click', (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Create ripple element
      const ripple = document.createElement('span');
      ripple.className = 'ripple-effect';
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: currentColor;
        opacity: 0.3;
        pointer-events: none;
        width: 0;
        height: 0;
        left: ${x}px;
        top: ${y}px;
        transform: translate(-50%, -50%);
        animation: ripple-animate 0.6s ease-out forwards;
      `;

      // Add animation keyframes if not exists
      if (!document.getElementById('ripple-keyframes')) {
        const style = document.createElement('style');
        style.id = 'ripple-keyframes';
        style.textContent = `
          @keyframes ripple-animate {
            to {
              width: 300px;
              height: 300px;
              opacity: 0;
            }
          }
        `;
        document.head.appendChild(style);
      }

      // Ensure relative positioning
      const computedStyle = window.getComputedStyle(el);
      if (computedStyle.position === 'static') {
        el.style.position = 'relative';
      }
      el.style.overflow = 'hidden';

      el.appendChild(ripple);

      // Cleanup
      setTimeout(() => ripple.remove(), 600);
    });
  });

  return () => {};
}

// Magnetic focus ring for accessibility
export function initMagneticFocus(selector = '.magnetic-focus') {
  if (prefersReducedMotion()) return () => {};

  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  elements.forEach(el => {
    const focusRing = document.createElement('div');
    focusRing.className = 'magnetic-focus-ring';
    focusRing.style.cssText = `
      position: absolute;
      inset: -4px;
      border-radius: inherit;
      border: 2px solid var(--glow-cyan, #06b6d4);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: -1;
    `;

    // Ensure relative positioning
    const computedStyle = window.getComputedStyle(el);
    if (computedStyle.position === 'static') {
      el.style.position = 'relative';
    }

    el.appendChild(focusRing);

    el.addEventListener('focus', () => {
      focusRing.style.opacity = '1';
      focusRing.style.transform = 'scale(1)';
    });

    el.addEventListener('blur', () => {
      focusRing.style.opacity = '0';
      focusRing.style.transform = 'scale(1.1)';
    });

    // Mouse tracking for focus ring
    el.addEventListener('mousemove', (e: MouseEvent) => {
      if (document.activeElement === el) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        focusRing.style.transform = `translate(${x - rect.width / 2}px, ${y - rect.height / 2}px) scale(1.2)`;
      }
    });

    el.addEventListener('mouseleave', () => {
      if (document.activeElement === el) {
        focusRing.style.transform = 'scale(1)';
      }
    });
  });

  return () => {};
}

// Hover lift effect with shadow
export function initHoverLift(selector = '.hover-lift', liftDistance = 8) {
  if (prefersReducedMotion()) return () => {};

  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  elements.forEach(el => {
    const distance = parseFloat(el.dataset.liftDistance || String(liftDistance));

    el.style.transition = 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1)';

    el.addEventListener('mouseenter', () => {
      el.style.transform = `translate3d(0, -${distance}px, 0)`;
      el.style.boxShadow = `
        0 ${distance * 2}px ${distance * 4}px -${distance}px rgba(0, 0, 0, 0.15),
        0 0 0 1px rgba(6, 182, 212, 0.2)
      `;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate3d(0, 0, 0)';
      el.style.boxShadow = '';
    });
  });

  return () => {};
}

// 3D card flip on hover
export function initCardFlip(selector = '.card-flip') {
  if (prefersReducedMotion()) return () => {};

  const cards = document.querySelectorAll<HTMLElement>(selector);
  if (!cards.length) return () => {};

  cards.forEach(card => {
    const front = card.querySelector<HTMLElement>('.card-front');
    const back = card.querySelector<HTMLElement>('.card-back');

    if (!front || !back) return;

    card.style.perspective = '1000px';
    card.style.transformStyle = 'preserve-3d';

    front.style.position = 'absolute';
    front.style.inset = '0';
    front.style.backfaceVisibility = 'hidden';
    front.style.transform = 'rotateY(0deg)';
    front.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

    back.style.position = 'absolute';
    back.style.inset = '0';
    back.style.backfaceVisibility = 'hidden';
    back.style.transform = 'rotateY(180deg)';
    back.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';

    card.addEventListener('mouseenter', () => {
      front.style.transform = 'rotateY(-180deg)';
      back.style.transform = 'rotateY(0deg)';
    });

    card.addEventListener('mouseleave', () => {
      front.style.transform = 'rotateY(0deg)';
      back.style.transform = 'rotateY(180deg)';
    });

    // Touch support
    let flipped = false;
    card.addEventListener('click', (e) => {
      // Don't flip on link/button clicks
      if (e.target.closest('a, button, [role="button"]')) return;

      flipped = !flipped;
      if (flipped) {
        front.style.transform = 'rotateY(-180deg)';
        back.style.transform = 'rotateY(0deg)';
      } else {
        front.style.transform = 'rotateY(0deg)';
        back.style.transform = 'rotateY(180deg)';
      }
    });
  });

  return () => {};
}

// Floating particles on hover
export function initHoverParticles(selector = '.hover-particles', particleCount = 10) {
  if (prefersReducedMotion()) return () => {};

  const elements = document.querySelectorAll<HTMLElement>(selector);
  if (!elements.length) return () => {};

  elements.forEach(el => {
    const count = parseInt(el.dataset.particleCount || String(particleCount), 10);
    const color = el.dataset.particleColor || 'currentColor';
    const particles: HTMLSpanElement[] = [];

    // Create particles
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.style.cssText = `
        position: absolute;
        width: 4px;
        height: 4px;
        border-radius: 50%;
        background: ${color};
        opacity: 0;
        pointer-events: none;
        z-index: 10;
      `;
      el.appendChild(particle);
      particles.push(particle);
    }

    let animationId: number;
    let animating = false;

    function animateParticles(mouseX: number, mouseY: number) {
      if (!animating) return;

      particles.forEach((particle, i) => {
        const angle = (i / count) * Math.PI * 2;
        const radius = 20 + Math.random() * 30;
        const x = Math.cos(angle + Date.now() * 0.001) * radius;
        const y = Math.sin(angle + Date.now() * 0.001) * radius;

        particle.style.transform = `translate(${mouseX + x}px, ${mouseY + y}px) scale(${0.5 + Math.sin(Date.now() * 0.005 + i) * 0.5})`;
        particle.style.opacity = String(0.5 + Math.sin(Date.now() * 0.003 + i) * 0.3);
      });

      animationId = requestAnimationFrame(() => animateParticles(mouseX, mouseY));
    }

    el.addEventListener('mouseenter', (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      particles.forEach(p => {
        p.style.left = `${x}px`;
        p.style.top = `${y}px`;
        p.style.opacity = '0';
      });

      animating = true;
      animateParticles(x, y);
    });

    el.addEventListener('mousemove', (e) => {
      if (animating) {
        const rect = el.getBoundingClientRect();
        // Update handled by animation loop
      }
    });

    el.addEventListener('mouseleave', () => {
      animating = false;
      cancelAnimationFrame(animationId);
      particles.forEach(p => {
        p.style.opacity = '0';
      });
    });
  });

  return () => {};
}

// Initialize all magnetic effects
export function initAllMagnetic() {
  initMagneticButtons();
  initRippleEffect();
  initMagneticFocus();
  initHoverLift();
  initCardFlip();
  initHoverParticles();
}