import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
export const LaserConnector = ({ activeIndex, isFlagged = true, }) => {
    const shouldReduceMotion = useReducedMotion();
    const [pulseKey, setPulseKey] = useState(0);
    // Trigger pulse re-animation whenever activeIndex changes
    useEffect(() => {
        setPulseKey((k) => k + 1);
    }, [activeIndex]);
    if (shouldReduceMotion)
        return null;
    // Proportional vertical anchor inside 1000 x 560 coordinate space
    const startY = 100 + activeIndex * 98;
    const endY = 92 + activeIndex * 98;
    const coreColor = isFlagged ? '#F43F5E' : '#10B981';
    const glowColor = isFlagged ? 'rgba(244, 63, 94, 0.85)' : 'rgba(16, 185, 129, 0.85)';
    return (<div className="hidden lg:block absolute inset-0 pointer-events-none z-30" aria-hidden="true">
      <svg viewBox="0 0 1000 560" preserveAspectRatio="none" className="w-full h-full" style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id="electric-laser" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={coreColor} stopOpacity="0.4"/>
            <stop offset="25%" stopColor="#FFFFFF" stopOpacity="1"/>
            <stop offset="50%" stopColor={coreColor} stopOpacity="1"/>
            <stop offset="75%" stopColor="#FFFFFF" stopOpacity="1"/>
            <stop offset="100%" stopColor={coreColor} stopOpacity="0.4"/>
          </linearGradient>

          <filter id="intense-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur1"/>
            <feGaussianBlur stdDeviation="12" result="blur2"/>
            <feMerge>
              <feMergeNode in="blur2"/>
              <feMergeNode in="blur1"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Guide Arc */}
        <path d={`M 455 ${startY} C 485 ${startY - 18}, 515 ${endY + 18}, 545 ${endY}`} fill="none" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="2" strokeDasharray="6 6"/>

        {/* High-Voltage Outer Halo */}
        <motion.path key={`halo-${pulseKey}`} d={`M 455 ${startY} C 485 ${startY - 18}, 515 ${endY + 18}, 545 ${endY}`} fill="none" stroke={glowColor} strokeWidth="10" filter="url(#intense-glow)" opacity="0.75" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, ease: 'easeOut' }}/>

        {/* Intense Core Laser Beam */}
        <motion.path key={`core-${pulseKey}`} d={`M 455 ${startY} C 485 ${startY - 18}, 515 ${endY + 18}, 545 ${endY}`} fill="none" stroke="url(#electric-laser)" strokeWidth="4" filter="url(#intense-glow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: [0, 1, 0.95] }} transition={{ duration: 0.35, ease: 'easeOut' }}/>

        {/* Leading High-Energy Plasma Photon 1 */}
        <motion.g key={`photon-1-${pulseKey}`} initial={{ x: 455, y: startY, opacity: 0 }} animate={{
            x: [455, 500, 545],
            y: [startY, (startY + endY) / 2, endY],
            opacity: [0, 1, 1, 0],
        }} transition={{
            duration: 0.45,
            ease: 'easeInOut',
        }}>
          <circle cx="0" cy="0" r="7" fill="#FFFFFF" filter="url(#intense-glow)"/>
        </motion.g>

        {/* Trailing Energy Spark 2 */}
        <motion.g key={`photon-2-${pulseKey}`} initial={{ x: 455, y: startY, opacity: 0 }} animate={{
            x: [455, 500, 545],
            y: [startY, (startY + endY) / 2, endY],
            opacity: [0, 1, 1, 0],
        }} transition={{
            duration: 0.45,
            delay: 0.08,
            ease: 'easeInOut',
        }}>
          <circle cx="0" cy="0" r="4.5" fill={coreColor} filter="url(#intense-glow)"/>
        </motion.g>

        {/* Left Target Lock Reticle */}
        <g transform={`translate(455, ${startY})`}>
          <motion.circle key={`reticle-${pulseKey}`} cx="0" cy="0" r="12" fill="none" stroke={coreColor} strokeWidth="2.5" strokeDasharray="4 3" initial={{ rotate: 0, scale: 0.8 }} animate={{ rotate: 360, scale: [0.8, 1.25, 1] }} transition={{ duration: 0.5 }}/>
        </g>

        {/* Right Impact Burst */}
        <g transform={`translate(545, ${endY})`}>
          <motion.circle key={`impact-${pulseKey}`} cx="0" cy="0" r="14" fill="none" stroke="#FFFFFF" strokeWidth="3" initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: [0.5, 2.2], opacity: [1, 0] }} transition={{ duration: 0.5 }}/>
        </g>
      </svg>
    </div>);
};
