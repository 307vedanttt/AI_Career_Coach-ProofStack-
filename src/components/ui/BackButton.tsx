import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export interface BackButtonProps {
  label?: string;
  fallbackTo?: string;
  disabled?: boolean;
  className?: string;
  sticky?: boolean;
  showIconOnly?: boolean;
  onClick?: () => void;
}

/**
 * Calculates parent route when browser history is empty (e.g. direct link or fresh tab)
 */
export const getParentRoute = (pathname: string): string => {
  if (pathname === '/' || pathname === '/app') return '/';
  if (pathname.startsWith('/app/contracts/')) return '/app/contracts';
  if (pathname.startsWith('/app/contracts')) return '/app';
  if (pathname.startsWith('/app/break-me') || pathname === '/breakme') return '/app';
  if (pathname.startsWith('/app/resume') || pathname === '/resume') return '/app';
  if (pathname.startsWith('/app/verify') || pathname === '/verify') return '/app';
  if (pathname.startsWith('/app/scanner') || pathname === '/scan') return '/app';
  if (pathname === '/how-we-judge') return '/app';
  if (pathname === '/styleguide') return '/app';
  if (pathname.startsWith('/app/')) return '/app';
  return '/app';
};

/**
 * Large (44px) ink-white tactile Back button with mechanical pressed physics,
 * focus ring, hover glow, disabled state, and intelligent history stack fallback.
 */
export const BackButton: React.FC<BackButtonProps> = ({
  label,
  fallbackTo,
  disabled = false,
  className = '',
  sticky = false,
  showIconOnly = false,
  onClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isRootFlow = location.pathname === '/app' || location.pathname === '/';
  const displayLabel = label || (isRootFlow ? 'Home' : 'Back');

  const handleBack = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
      return;
    }

    if (isRootFlow) {
      navigate('/');
      return;
    }

    // Check if we have previous history in this session
    const hasHistory = window.history.length > 1;
    if (hasHistory) {
      navigate(-1);
    } else {
      const parent = fallbackTo || getParentRoute(location.pathname);
      navigate(parent);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      disabled={disabled}
      aria-label={`Go back to ${isRootFlow ? 'Home' : 'previous page'}`}
      className={`
        group relative min-w-[44px] min-h-[44px] h-[44px] px-3.5 rounded-full
        flex items-center justify-center gap-2
        bg-[#F7F5F0] text-[#14171A] font-mono text-xs font-bold tracking-tight
        border border-[#E6E1D6] shadow-[0_2px_8px_rgba(0,0,0,0.18)]
        transition-all duration-200 select-none
        hover:bg-white hover:border-emerald-500/60 hover:shadow-[0_4px_16px_rgba(52,211,153,0.25)] hover:scale-[1.02]
        active:scale-95 active:bg-[#ECE8DF] active:shadow-inner
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#0A0C0F]
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${sticky ? 'sticky top-3 z-40' : ''}
        ${className}
      `}
      data-testid="app-back-button"
    >
      {isRootFlow ? (
        <Home className="w-4 h-4 text-[#14171A] group-hover:-translate-x-0.5 transition-transform" />
      ) : (
        <ArrowLeft className="w-4 h-4 text-[#14171A] group-hover:-translate-x-0.5 transition-transform" />
      )}
      {!showIconOnly && (
        <span className="font-semibold">{displayLabel}</span>
      )}
    </button>
  );
};
