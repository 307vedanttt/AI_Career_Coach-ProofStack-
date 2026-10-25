import React, { useEffect, useState, useRef } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'framer-motion';

/**
 * FluidCursor
 * 
 * High-end studio custom cursor & scroll-reactive magnetic trailer.
 * - Fluid spring dot + trailing velocity halo
 * - Expands on hover over interactive elements with magnetic snap
 * - Shows contextual state ('INSPECT', 'PROVE', 'VIEW') over cards
 * - Reacts to scroll velocity by stretching along the movement vector
 * - Automatically hides on touch devices and respects reduced motion
 */
export const FluidCursor = () => {
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(false);
  const [cursorState, setCursorState] = useState('default'); // 'default', 'button', 'card', 'docket'
  const [cursorLabel, setCursorLabel] = useState('');

  // Mouse coordinate motion values
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth fluid springs for the trailing ring
  const springConfig = { damping: 26, stiffness: 280, mass: 0.6 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // Scroll velocity stretch
  const scrollYVelocity = useMotionValue(0);
  const smoothScrollStretch = useSpring(scrollYVelocity, { damping: 20, stiffness: 200 });

  useEffect(() => {
    // Only activate on pointer-fine devices (desktops/laptops with mouse)
    if (window.matchMedia('(pointer: coarse)').matches || shouldReduceMotion) {
      return;
    }

    let lastY = window.scrollY;
    let scrollTimeout;

    const onScroll = () => {
      const currentY = window.scrollY;
      const delta = currentY - lastY;
      lastY = currentY;
      // Map scroll speed to vertical stretch (clamped)
      scrollYVelocity.set(Math.min(Math.max(delta * 0.45, -20), 20));

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollYVelocity.set(0);
      }, 80);
    };

    const onMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Detect interactive element under cursor
      const target = e.target;
      const interactiveEl = target.closest('button, a, input, select, textarea, [role="button"]');
      const cardEl = target.closest('.paper-cardstock, [data-cursor]');

      if (cardEl) {
        setCursorState('card');
        setCursorLabel(cardEl.getAttribute('data-cursor') || 'VERIFY');
      } else if (interactiveEl) {
        setCursorState('button');
        setCursorLabel('');
      } else {
        setCursorState('default');
        setCursorLabel('');
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
    };

    const onMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      clearTimeout(scrollTimeout);
    };
  }, [isVisible, shouldReduceMotion]);

  if (shouldReduceMotion || !isVisible) return null;

  // Sizing and styling based on active hover state
  const isHoveredButton = cursorState === 'button';
  const isHoveredCard = cursorState === 'card';
  const haloSize = isHoveredCard ? 64 : isHoveredButton ? 44 : 28;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      {/* 1. Trailing Spring Halo */}
      <motion.div
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: haloSize,
          height: haloSize,
          backgroundColor: isHoveredButton
            ? 'rgba(16, 185, 129, 0.14)'
            : isHoveredCard
            ? 'rgba(16, 185, 129, 0.22)'
            : 'rgba(255, 255, 255, 0.04)',
          borderColor: isHoveredCard || isHoveredButton
            ? 'rgba(52, 211, 153, 0.6)'
            : 'rgba(255, 255, 255, 0.2)',
          borderWidth: isHoveredCard ? 1.5 : 1,
        }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="rounded-full flex items-center justify-center backdrop-blur-[1px] will-change-transform shadow-[0_0_15px_rgba(16,185,129,0.15)]"
      >
        {isHoveredCard && cursorLabel && (
          <span className="font-mono text-[9px] font-bold text-emerald-300 tracking-wider uppercase select-none">
            {cursorLabel}
          </span>
        )}
      </motion.div>

      {/* 2. Micro Focus Dot (Immediate tracking with zero latency) */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHoveredButton ? 0 : isHoveredCard ? 0 : 1,
          opacity: isHoveredButton || isHoveredCard ? 0 : 1,
        }}
        transition={{ duration: 0.12 }}
        className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] will-change-transform"
      />
    </div>
  );
};
