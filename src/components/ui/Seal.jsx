import React from 'react';
import { clsx } from 'clsx';
import { ShieldCheck } from 'lucide-react';
export const Seal = ({ label = 'ATTESTED PROOF', sublabel = 'COMMIT INVARIANT SIGNED', size = 'md', status = 'proven', className, }) => {
    const sizeConfig = {
        sm: { diameter: 72, radius: 28, fontSize: 'text-[8px]', iconSize: 16 },
        md: { diameter: 104, radius: 42, fontSize: 'text-[10px]', iconSize: 22 },
        lg: { diameter: 140, radius: 56, fontSize: 'text-[12px]', iconSize: 28 },
    };
    const statusColors = {
        proven: {
            text: 'text-[#1F8A5B]',
            border: 'border-[#1F8A5B]',
            fill: 'fill-[#1F8A5B]',
            glow: 'shadow-[0_0_20px_rgba(52,211,153,0.3)]',
        },
        unclear: {
            text: 'text-[#6D5BD0]',
            border: 'border-[#6D5BD0]',
            fill: 'fill-[#6D5BD0]',
            glow: 'shadow-[0_0_20px_rgba(109,91,208,0.3)]',
        },
        attack: {
            text: 'text-[#C2362B]',
            border: 'border-[#C2362B]',
            fill: 'fill-[#C2362B]',
            glow: 'shadow-[0_0_20px_rgba(194,54,43,0.3)]',
        },
    };
    const currentSize = sizeConfig[size];
    const color = statusColors[status];
    return (<div role="img" aria-label={`${label} - ${sublabel}`} style={{ width: currentSize.diameter, height: currentSize.diameter }} className={clsx('relative rounded-full flex items-center justify-center select-none font-mono font-bold tracking-widest', color.text, color.glow, 'border-2 border-double', color.border, className)}>
      {/* Concentric Inner Ring */}
      <div className={clsx('absolute inset-1.5 rounded-full border border-dashed opacity-70', color.border)}/>

      {/* Center Content */}
      <div className="flex flex-col items-center justify-center text-center p-2 z-10">
        <ShieldCheck size={currentSize.iconSize} className={clsx('stroke-[2.2] mb-0.5', color.text)} aria-hidden="true"/>
        <span className={clsx('leading-tight font-black uppercase', currentSize.fontSize)}>
          {label}
        </span>
        {size !== 'sm' && (<span className="text-[8px] opacity-80 uppercase tracking-tighter mt-0.5 font-normal">
            {sublabel}
          </span>)}
      </div>
    </div>);
};
