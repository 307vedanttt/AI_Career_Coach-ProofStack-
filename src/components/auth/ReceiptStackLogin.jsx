import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Stamp } from '../stamps/Stamp';
export const ReceiptStackLogin = () => {
    const shouldReduceMotion = useReducedMotion();
    const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
    useEffect(() => {
        if (shouldReduceMotion)
            return;
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 3; // -1.5 to +1.5 deg
            const y = (e.clientY / innerHeight - 0.5) * 3;
            setMouseOffset({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [shouldReduceMotion]);
    return (<div className="relative w-full max-w-xl mx-auto flex flex-col items-center select-none">
      {/* Background Soft Green Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] bg-[#1F8A5B]/15 rounded-full blur-[100px] pointer-events-none" aria-hidden="true"/>

      {/* Layered Receipts Stack */}
      <div className="relative w-full max-w-[480px] h-[480px] flex items-center justify-center" style={{
            transform: shouldReduceMotion
                ? 'none'
                : `perspective(1000px) rotateY(${mouseOffset.x}deg) rotateX(${-mouseOffset.y}deg)`,
            transition: 'transform 0.15s ease-out',
        }}>
        {/* Layer 3 (Deepest, faded) */}
        <div className="absolute inset-0 bg-[#E8E4DA] rounded-[8px] opacity-40 shadow-lg transform -rotate-6 scale-95 translate-y-6" aria-hidden="true"/>

        {/* Layer 2 (Middle, slightly faded) */}
        <div className="absolute inset-0 bg-[#F2EFE9] rounded-[8px] opacity-70 shadow-xl transform rotate-3 scale-[0.98] translate-y-3" aria-hidden="true"/>

        {/* Layer 1 (Foreground Main Physical Receipt) */}
        <motion.div className="relative z-10 w-full bg-[#F8FAFC] text-[#0F172A] rounded-b-[8px] p-6 sm:p-7 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.65)] sawtooth-top paper-grain border-x border-b border-[#CBD5E1]" initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Header strip */}
          <div className="flex items-center justify-between border-b-2 border-dashed border-[#CBD5E1] pb-3 mb-4 font-mono text-[11px] text-[#475569]">
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#0F172A]">SERIAL: REC-0042</span>
              <div className="w-16 h-3 barcode-lines opacity-70" aria-hidden="true"/>
            </div>
            <span className="text-[#64748B]">BLOCK #1049201</span>
          </div>

          {/* Subheading & Title */}
          <div className="mb-4">
            <span className="font-mono text-[10px] tracking-wider text-[#64748B] uppercase block mb-1">
              ASSERTION NODE
            </span>
            <h3 className="font-serif italic text-2xl text-[#0F172A] tracking-tight">
              REST API Specification
            </h3>
          </div>

          {/* Invariant Code Block Box */}
          <div className="relative rounded-[8px] bg-[#0A0C0F] text-[#F7F5F0] p-4 font-mono text-xs border border-white/10 shadow-inner mb-4 overflow-hidden">
            {/* Window Dots & Badge */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <div className="flex gap-1.5" aria-hidden="true">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C4D]"/>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F5A524]"/>
                <span className="w-2.5 h-2.5 rounded-full bg-[#34D399]"/>
              </div>
              <span className="text-[10px] tracking-wider text-[#34D399] uppercase font-bold">
                VERIFIED INVARIANT
              </span>
            </div>

            {/* Code lines */}
            <div className="space-y-1 text-[11px] sm:text-xs">
              <div className="text-[#6B7280]">
                <span className="select-none text-[#4A5568] mr-3">01</span>
                <span className="text-[#34D399]">@route</span>("/api/v1/orders")
              </div>
              <div className="text-[#A0AEC0]">
                <span className="select-none text-[#4A5568] mr-3">02</span>
                <span className="text-[#8B7CFF]">def</span> get_order_batch(session: AuthCtx):
              </div>
              <div className="bg-[#1F8A5B]/25 -mx-4 px-4 py-0.5 border-l-2 border-[#34D399] text-white font-semibold">
                <span className="select-none text-[#34D399] mr-3">03</span>
                assert session.has_proven_token() == True
              </div>
              <div className="text-[#A0AEC0]">
                <span className="select-none text-[#4A5568] mr-3">04</span>
                <span className="text-[#8B7CFF]">return</span> orders.secure_serialize()
              </div>
            </div>
          </div>

          {/* Code Footer meta */}
          <div className="flex items-center justify-between font-mono text-[10px] text-[#6B7280]">
            <span>src/api/routes/orders.py</span>
            <span className="font-semibold text-[#14171A]">verified head commit</span>
          </div>

          {/* PROVEN Slam Stamp (Framer Motion Slam) */}
          <motion.div className="absolute top-8 right-6 pointer-events-none" initial={shouldReduceMotion
            ? { scale: 1, opacity: 1, rotate: -6 }
            : { scale: 2.2, opacity: 0, rotate: -12 }} animate={shouldReduceMotion
            ? { scale: 1, opacity: 1, rotate: -6 }
            : {
                scale: 1,
                opacity: 1,
                rotate: -6,
                x: [0, -3, 3, -1, 0],
            }} transition={shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 0.35,
                ease: [0.175, 0.885, 0.32, 1.275],
            }}>
            <div className="relative">
              <Stamp status="proven" size="md" animate={false}/>
              
              {/* Expanding Ink Ring Effect */}
              {!shouldReduceMotion && (<motion.div className="absolute inset-0 rounded-sm border-2 border-[#34D399] pointer-events-none" initial={{ scale: 1, opacity: 0.8 }} animate={{ scale: 1.6, opacity: 0 }} transition={{ duration: 0.6, delay: 0.2 }}/>)}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Audit line */}
      <div className="mt-4 flex items-center gap-2 font-mono text-xs text-[#9AA3AE]">
        <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse"/>
        <span>Evidence coverage verified — cryptographic audit ledger</span>
      </div>
    </div>);
};
