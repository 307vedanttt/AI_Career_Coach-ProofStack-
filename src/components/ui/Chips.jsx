import React from 'react';
import { clsx } from 'clsx';
export const Chip = ({ label, variant = 'neutral', icon, className, }) => {
    const variantStyles = {
        neutral: 'bg-white/5 border-white/10 text-[#9AA3AE]',
        proven: 'bg-[#1F8A5B]/15 border-[#1F8A5B]/40 text-[#34D399]',
        basic: 'bg-[#B7791F]/15 border-[#B7791F]/40 text-[#F5A524]',
        notshown: 'bg-[#64748B]/15 border-[#64748B]/40 text-[#94A3B8]',
        unclear: 'bg-[#6D5BD0]/15 border-[#6D5BD0]/40 text-[#8B7CFF]',
        attack: 'bg-[#C2362B]/15 border-[#C2362B]/40 text-[#FF5C4D]',
        dashed: 'bg-transparent border-dashed border-[#14171A]/40 text-[#14171A]',
    };
    return (<span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono border font-medium select-none', variantStyles[variant], className)}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </span>);
};
export const HealthChip = ({ label, isHealthy = true, pulse = true, className, }) => {
    return (<div role="status" aria-label={`${label} service is ${isHealthy ? 'operational' : 'degraded'}`} className={clsx('inline-flex items-center space-x-2 text-xs font-medium text-[#9AA3AE] select-none', className)}>
      <span className="relative flex h-2 w-2">
        {pulse && isHealthy && (<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34D399] opacity-75"/>)}
        <span className={clsx('relative inline-flex rounded-full h-2 w-2', isHealthy
            ? 'bg-[#1F8A5B] shadow-[0_0_8px_#34D399]'
            : 'bg-[#C2362B] shadow-[0_0_8px_#FF5C4D]')}/>
      </span>
      <span className="text-[#F4F2EC]">{label}</span>
    </div>);
};
export const CounterChip = ({ label, count, variant = 'attack', className, }) => {
    const styles = {
        attack: {
            container: 'bg-[#FF5C4D]/10 border-[#FF5C4D]/30 text-[#FF5C4D]',
            dot: 'bg-[#FF5C4D] shadow-[0_0_10px_#FF5C4D]',
            badge: 'text-[#FF5C4D]',
        },
        proven: {
            container: 'bg-[#1F8A5B]/10 border-[#1F8A5B]/30 text-[#34D399]',
            dot: 'bg-[#1F8A5B] shadow-[0_0_10px_#34D399]',
            badge: 'text-[#34D399]',
        },
        neutral: {
            container: 'bg-white/5 border-white/10 text-[#9AA3AE]',
            dot: 'bg-white/40',
            badge: 'text-white',
        },
    };
    const current = styles[variant];
    return (<div role="status" aria-label={`${label}: ${count}`} className={clsx('inline-flex items-center space-x-2 px-3 py-1 rounded-full border backdrop-blur-sm select-none', current.container, className)}>
      <span className={clsx('w-2 h-2 rounded-full animate-pulse', current.dot)}/>
      <span className="text-xs font-medium text-[#9AA3AE]">{label}</span>
      <span className={clsx('text-sm font-bold font-mono', current.badge)}>{count}</span>
    </div>);
};
