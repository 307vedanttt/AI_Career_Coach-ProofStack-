import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
export const CustomCheckbox = ({ id, checked, onChange, label, describedBy, disabled = false, }) => {
    const shouldReduceMotion = useReducedMotion();
    const handleKeyDown = (e) => {
        if (disabled)
            return;
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
        }
    };
    return (<label htmlFor={id} className={`group flex items-start gap-3 cursor-pointer select-none text-xs sm:text-sm text-[#F7F5F0]/90 hover:text-white transition-colors py-1 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <div className="relative mt-0.5 flex-shrink-0">
        <input type="checkbox" id={id} checked={checked} onChange={(e) => !disabled && onChange(e.target.checked)} disabled={disabled} aria-describedby={describedBy} onKeyDown={handleKeyDown} className="sr-only"/>
        <div className={`w-5 h-5 rounded-[4px] border transition-all duration-200 flex items-center justify-center ${checked
            ? 'bg-[#1F8A5B] border-[#34D399] shadow-[0_0_12px_rgba(52,211,153,0.35)]'
            : 'bg-[#12161B] border-white/20 group-hover:border-white/40'} group-focus-within:ring-2 group-focus-within:ring-[#34D399] group-focus-within:ring-offset-2 group-focus-within:ring-offset-[#0A0C0F]`}>
          {checked && (<svg className="w-3.5 h-3.5 text-[#0A0C0F]" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <motion.path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" initial={shouldReduceMotion ? { pathLength: 1 } : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: shouldReduceMotion ? 0 : 0.22, ease: 'easeOut' }}/>
            </svg>)}
        </div>
      </div>
      <span className="leading-snug select-none">{label}</span>
    </label>);
};
