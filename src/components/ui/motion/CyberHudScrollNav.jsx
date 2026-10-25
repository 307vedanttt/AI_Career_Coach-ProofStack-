import React, { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
const WAYPOINTS = [
    { id: 'main-content', label: 'Overview', tag: '01 // HERO' },
    { id: 'problem', label: 'Reality Audit', tag: '02 // AST_SCAN' },
    { id: 'how-it-works', label: 'Pipeline Tour', tag: '03 // CI_CD' },
    { id: 'capabilities', label: 'Capabilities', tag: '04 // BENTO' },
    { id: 'metrics', label: 'Live Metrics', tag: '05 // STATS' },
    { id: 'cta-receipt', label: 'Proof Docket', tag: '06 // DOCKET' },
];
export const CyberHudScrollNav = () => {
    const shouldReduceMotion = useReducedMotion();
    const [scrollPercent, setScrollPercent] = useState(0);
    const [activeSection, setActiveSection] = useState('main-content');
    const [hoveredSection, setHoveredSection] = useState(null);
    useEffect(() => {
        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
            const totalScrollable = scrollHeight - clientHeight;
            const progress = totalScrollable > 0 ? (scrollTop / totalScrollable) * 100 : 0;
            setScrollPercent(Math.min(100, Math.max(0, Math.round(progress))));
            // Determine active section based on waypoint offsets
            const scrollPos = window.scrollY + window.innerHeight * 0.35;
            for (let i = WAYPOINTS.length - 1; i >= 0; i--) {
                const el = document.getElementById(WAYPOINTS[i].id);
                if (el && el.offsetTop <= scrollPos) {
                    setActiveSection(WAYPOINTS[i].id);
                    break;
                }
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const scrollToWaypoint = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: shouldReduceMotion ? 'auto' : 'smooth' });
        }
    };
    return (<aside className="fixed right-5 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-center select-none pointer-events-auto" aria-label="Interactive Cyber HUD Scroll Navigation">
      {/* HUD Header Readout */}
      <div className="flex flex-col items-center mb-3">
        <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#6B7280]">
          DEPTH
        </span>
        <span className="font-mono text-xs font-bold text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.6)] tabular-nums">
          {scrollPercent.toString().padStart(3, '0')}%
        </span>
      </div>

      {/* Vertical Laser Progress Rail Container */}
      <div className="relative py-2 flex flex-col items-center">
        {/* Ambient Backing Line */}
        <div className="absolute top-0 bottom-0 w-[2px] bg-white/[0.08] rounded-full"/>

        {/* Dynamic Glowing Laser Progress Bar */}
        <div className="absolute top-0 w-[2px] bg-gradient-to-b from-emerald-400 via-teal-300 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all duration-75" style={{ height: `${scrollPercent}%` }}/>

        {/* Waypoint Interactive Nodes */}
        <div className="relative z-10 flex flex-col items-center gap-7">
          {WAYPOINTS.map((wp) => {
            const isActive = activeSection === wp.id;
            const isHovered = hoveredSection === wp.id;
            return (<div key={wp.id} className="relative flex items-center justify-center group" onMouseEnter={() => setHoveredSection(wp.id)} onMouseLeave={() => setHoveredSection(null)}>
                {/* Node Button */}
                <button type="button" onClick={() => scrollToWaypoint(wp.id)} aria-label={`Scroll to ${wp.label} section`} className={`relative w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none ${isActive
                    ? 'scale-125'
                    : 'hover:scale-110'}`}>
                  {/* Concentric Pulsing Radar Ring for Active Section */}
                  {isActive && (<span className="absolute inset-0 rounded-full bg-emerald-400/40 animate-ping pointer-events-none"/>)}

                  {/* Core Node Dot */}
                  <span className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${isActive
                    ? 'bg-emerald-400 ring-2 ring-emerald-300 shadow-[0_0_12px_#34D399]'
                    : 'bg-[#161B22] border border-white/20 group-hover:border-emerald-400 group-hover:bg-emerald-500/30'}`}/>
                </button>

                {/* Cyber Tooltip Callout */}
                <div className={`absolute right-7 px-3 py-1.5 rounded-lg bg-[#0F1318]/95 border border-emerald-500/30 shadow-[0_0_20px_rgba(0,0,0,0.8)] backdrop-blur-md pointer-events-none whitespace-nowrap transition-all duration-200 flex flex-col items-end ${isHovered
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 translate-x-2'}`}>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-emerald-400 font-bold">
                    {wp.tag}
                  </span>
                  <span className="font-sans text-xs font-semibold text-white">
                    {wp.label}
                  </span>
                </div>
              </div>);
        })}
        </div>
      </div>

      {/* HUD Footer Status */}
      <div className="mt-3 flex items-center gap-1 font-mono text-[9px] text-[#6B7280] tracking-widest uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
        <span>SYNC</span>
      </div>
    </aside>);
};
