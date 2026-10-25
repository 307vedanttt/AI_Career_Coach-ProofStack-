import React from 'react';
import { clsx } from 'clsx';
export const Button = React.forwardRef(({ children, variant = 'solid_ink', size = 'md', icon, iconPosition = 'left', isLoading = false, className, disabled, ...props }, ref) => {
    const variantStyles = {
        // 1. solid paper: architectural vellum #F8FAFC, text #0F172A, crisp border
        solid_paper: 'bg-[#F8FAFC] hover:bg-white text-[#0F172A] border border-[#CBD5E1] shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:shadow-[0_4px_14px_rgba(0,0,0,0.18)] active:scale-[0.985]',
        // 2. solid ink: obsidian carbon #0F172A, text slate-50, high contrast
        solid_ink: 'bg-[#0F172A] hover:bg-slate-900 text-white border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-[0.985]',
        // 3. ghost: translucent glass border
        ghost: 'bg-white/[0.04] hover:bg-white/[0.08] text-[#F1F5F9] border border-white/10 active:scale-[0.985]',
        // 4. quiet text: minimal text button
        quiet_text: 'bg-transparent hover:text-white text-[#94A3B8] border-transparent hover:underline underline-offset-4',
        // bonus verified action: electric mint #10B981
        emerald: 'bg-[#10B981] hover:bg-[#059669] text-[#0F172A] font-bold shadow-[0_0_16px_rgba(16,185,129,0.35)] active:scale-[0.985]',
        outline: 'bg-transparent hover:bg-white/5 text-[#F1F5F9] border border-white/20 active:scale-[0.985]',
        solid_emerald: 'bg-emerald-500 hover:bg-emerald-400 text-[#0F172A] font-bold shadow-[0_2px_12px_rgba(16,185,129,0.35)] active:scale-[0.985]',
    };
    const sizeStyles = {
        sm: 'h-8 px-3 text-xs gap-1.5 rounded-[6px]',
        md: 'h-10 px-4 text-xs font-semibold gap-2 rounded-[8px]',
        lg: 'h-12 px-6 text-sm font-semibold gap-2.5 rounded-[8px]',
    };
    return (<button ref={ref} disabled={disabled || isLoading} className={clsx('inline-flex items-center justify-center font-sans tracking-tight select-none transition-all duration-150', 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399]', 'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none', variantStyles[variant], sizeStyles[size], className)} {...props}>
        {isLoading && (<span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"/>)}
        {!isLoading && icon && iconPosition === 'left' && (<span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>)}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && (<span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>)}
      </button>);
});
Button.displayName = 'Button';
