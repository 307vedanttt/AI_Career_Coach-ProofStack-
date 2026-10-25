import React from 'react';
export const BorderBeam = ({ className = '', size = 200, duration = 8, borderWidth = 1.5, colorFrom = '#34D399', colorTo = '#10B981', delay = 0, }) => {
    return (<div style={{
            '--size': `${size}px`,
            '--duration': `${duration}s`,
            '--anchor': '90deg',
            '--border-width': `${borderWidth}px`,
            '--color-from': colorFrom,
            '--color-to': colorTo,
            '--delay': `-${delay}s`,
        }} className={`pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)] after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)] after:[offset-anchor:calc(var(--anchor)*1deg)_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))] ${className}`} aria-hidden="true"/>);
};
