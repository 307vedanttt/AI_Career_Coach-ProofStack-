import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface AuthPanelProps {
  children: React.ReactNode;
  className?: string;
  badge?: string;
  icon?: React.ReactNode;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({
  children,
  className = '',
  badge = 'AUTH_V3.8',
  icon,
}) => {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`relative w-full max-w-[460px] mx-auto rounded-[18px] bg-[#12161B]/95 border border-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.7)] ${className}`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6 select-none">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-mono text-[10px] tracking-wider text-[#34D399] uppercase">
            ProofStack Ledger Terminal
          </span>
        </div>
        <span className="font-mono text-[10px] font-semibold text-[#6B7280] px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
          {badge}
        </span>
      </div>

      {children}
    </motion.div>
  );
};

export const AuthItem: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.3, ease: 'easeOut' },
    },
  };

  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  );
};
