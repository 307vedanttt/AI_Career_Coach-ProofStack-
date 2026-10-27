import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

export const DossierScrollHud = () => {
  const shouldReduceMotion = useReducedMotion();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [scrollPercent, setScrollPercent] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
          const totalScrollable = scrollHeight - clientHeight;
          const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
          setScrollPercent(Math.min(100, Math.max(0, Math.round(progress))));
          setShowBackToTop(scrollTop > 260);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' });
  };

  const radius = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollPercent / 100) * circumference;

  return (
    <AnimatePresence>
      {showBackToTop && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 16, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.85 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          aria-label="Scroll back to top"
          className="fixed bottom-6 right-6 z-40 p-2 rounded-full bg-[#0D0F14]/90 border border-white/[0.12] hover:border-emerald-500/50 shadow-2xl backdrop-blur-xl group transition-all flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-400 hover:scale-105 active:scale-95"
          title="Scroll to top"
        >
          <svg className="w-9 h-9 -rotate-90 pointer-events-none" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r={radius}
              className="stroke-white/10"
              strokeWidth="2.5"
              fill="none"
            />
            <circle
              cx="18"
              cy="18"
              r={radius}
              className="stroke-emerald-400 transition-all duration-150"
              strokeWidth="2.5"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="none"
            />
          </svg>
          <ArrowUp className="w-4 h-4 text-neutral-300 group-hover:text-emerald-300 absolute transition-transform group-hover:-translate-y-0.5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};
