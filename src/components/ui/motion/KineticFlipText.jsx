import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Vengeance UI-inspired 3D Kinetic Flip Text
 * Flips characters or words in 3D space with authentic spring physics.
 */
export const KineticFlipText = ({
  words = ['AST VERIFIED', 'ZERO KEYWORD FLUFF', 'DETERMINISTIC PROOF', 'IMMUTABLE MERKLE ROOT'],
  interval = 3200,
  className = 'text-emerald-400 font-mono font-bold'
}) => {
  const [index, setIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion || words.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval, shouldReduceMotion]);

  if (shouldReduceMotion) {
    return <span className={className}>{words[index]}</span>;
  }

  const currentWord = words[index];

  return (
    <span className="inline-flex overflow-hidden py-0.5" style={{ perspective: '800px' }}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 14, rotateX: -70 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          exit={{ opacity: 0, y: -14, rotateX: 70 }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 28,
            mass: 0.8
          }}
          className={`inline-block ${className}`}
          style={{ transformStyle: 'preserve-3d' }}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </span>
  );
};
