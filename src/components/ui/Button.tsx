import React from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'solid_paper' | 'solid_ink' | 'ghost' | 'quiet_text' | 'emerald';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'solid_ink',
      size = 'md',
      icon,
      iconPosition = 'left',
      isLoading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantStyles: Record<ButtonVariant, string> = {
      // 1. solid paper: paper substrate #F7F5F0, text #14171A, tactile shadow
      solid_paper:
        'bg-[#F7F5F0] hover:bg-[#FAF8F3] text-[#14171A] border border-[#E6E1D6] shadow-[0_2px_6px_rgba(0,0,0,0.15)] active:scale-[0.985]',

      // 2. solid ink: carbon ink #14171A, text white, high contrast
      solid_ink:
        'bg-[#14171A] hover:bg-[#20252A] text-white border border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.4)] active:scale-[0.985]',

      // 3. ghost: translucent glass border
      ghost:
        'bg-white/[0.04] hover:bg-white/[0.08] text-[#F4F2EC] border border-white/10 active:scale-[0.985]',

      // 4. quiet text: minimal text button
      quiet_text:
        'bg-transparent hover:text-white text-[#9AA3AE] border-transparent hover:underline underline-offset-4',

      // bonus verified action: deep emerald
      emerald:
        'bg-[#1F8A5B] hover:bg-[#19754c] text-[#0A0C0F] font-bold shadow-[0_0_16px_rgba(52,211,153,0.35)] active:scale-[0.985]',
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: 'h-8 px-3 text-xs gap-1.5 rounded-[6px]',
      md: 'h-10 px-4 text-xs font-semibold gap-2 rounded-[8px]',
      lg: 'h-12 px-6 text-sm font-semibold gap-2.5 rounded-[8px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center font-sans tracking-tight select-none transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
