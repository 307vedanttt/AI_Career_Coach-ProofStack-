import React from 'react';
import { clsx } from 'clsx';
export const CoverageGauge = ({ percentage, assessedCount, totalCount, baseline = 50, target = 78, size = 180, strokeWidth = 7, className, }) => {
    // 270 degree arc setup
    const radius = (size - strokeWidth * 2) / 2;
    const circumference = 2 * Math.PI * radius;
    // 270 deg is 75% of full circle
    const arcLength = circumference * 0.75;
    const offset = arcLength - (arcLength * Math.min(Math.max(percentage, 0), 100)) / 100;
    return (<div role="meter" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Evidence coverage ${percentage}%`} className={clsx('glass-panel rounded-panel p-4 flex flex-col items-center justify-center text-center select-none', className)}>
      {/* SVG Arc Gauge */}
      <div className="relative flex items-center justify-center py-2" style={{ width: size, height: size * 0.9 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-[135deg] overflow-visible" aria-hidden="true">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1F8A5B"/>
              <stop offset="100%" stopColor="#34D399"/>
            </linearGradient>
          </defs>

          {/* Background Track (270 deg) */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth={strokeWidth} strokeDasharray={`${arcLength} ${circumference}`} strokeLinecap="round"/>

          {/* Active Value Arc */}
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#gaugeGradient)" strokeWidth={strokeWidth} strokeDasharray={`${arcLength} ${circumference}`} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-700 ease-out drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"/>
        </svg>

        {/* Center Number in Instrument Serif */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
          <span className="font-display text-[64px] leading-none font-normal text-transparent bg-clip-text bg-gradient-to-b from-white to-[#34D399] tracking-tight drop-shadow-[0_0_24px_rgba(52,211,153,0.3)]">
            {percentage}%
          </span>
        </div>
      </div>

      {/* Labels & Range Indicator */}
      <div className="w-full mt-1">
        <h3 className="text-xs font-semibold text-[#F4F2EC] tracking-tight">
          Evidence coverage
        </h3>
        <p className="text-[11px] text-[#9AA3AE] mt-0.5 font-medium">
          assessed {assessedCount} of {totalCount} requirements
        </p>

        {/* Target Range Bar */}
        <div className="relative w-full h-[5px] bg-white/10 rounded-full mt-2.5 overflow-hidden">
          {baseline !== undefined && target !== undefined && (<div className="absolute top-0 bottom-0 bg-[#1F8A5B]/30" style={{
                left: `${baseline}%`,
                width: `${target - baseline}%`,
            }}/>)}
          <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#1F8A5B] to-[#34D399] rounded-full shadow-[0_0_8px_#34D399]" style={{ width: `${Math.min(percentage, 100)}%` }}/>
        </div>

        <div className="flex justify-between text-[10px] font-mono text-[#9AA3AE] mt-1.5 px-0.5">
          <span>baseline {baseline}%</span>
          <span className="text-[#34D399] font-bold">target {target}%</span>
        </div>
      </div>
    </div>);
};
