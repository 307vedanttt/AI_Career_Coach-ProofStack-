import React, { useEffect, useState, useRef } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

export const AnimatedNumber = ({ 
  value, 
  duration = 1.2, 
  suffix = '', 
  prefix = '', 
  className = '' 
}) => {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const [displayValue, setDisplayValue] = useState(shouldReduceMotion ? value : 0);

  // Parse numeric part
  const numericTarget = typeof value === 'number' ? value : parseFloat(value) || 0;

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(numericTarget);
      return;
    }

    if (!isInView) return;

    let startTimestamp = null;
    let animationFrameId = null;

    const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const elapsed = (timestamp - startTimestamp) / (duration * 1000);
      const progress = Math.min(Math.max(elapsed, 0), 1);
      const easedProgress = easeOutExpo(progress);
      const current = Math.round(easedProgress * numericTarget);

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setDisplayValue(numericTarget);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);

    return () => {
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, numericTarget, duration, shouldReduceMotion]);

  return (
    <span ref={ref} className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  );
};
