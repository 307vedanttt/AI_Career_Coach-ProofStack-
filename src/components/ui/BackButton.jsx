import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
/**
 * Calculates parent route when browser history is empty (e.g. direct link or fresh tab)
 */
export const getParentRoute = (pathname) => {
    if (pathname === '/' || pathname === '/app')
        return '/';
    if (pathname.startsWith('/app/contracts/'))
        return '/app/contracts';
    if (pathname.startsWith('/app/contracts'))
        return '/app';
    if (pathname.startsWith('/app/break-me') || pathname === '/breakme')
        return '/app';
    if (pathname.startsWith('/app/resume') || pathname === '/resume')
        return '/app';
    if (pathname.startsWith('/app/verify') || pathname === '/verify')
        return '/app';
    if (pathname.startsWith('/app/scanner') || pathname === '/scan')
        return '/app';
    if (pathname === '/how-we-judge')
        return '/app';
    if (pathname === '/styleguide')
        return '/app';
    if (pathname.startsWith('/app/'))
        return '/app';
    return '/app';
};
/**
 * Large (44px) ink-white tactile Back button with mechanical pressed physics,
 * focus ring, hover glow, disabled state, and intelligent history stack fallback.
 */
export const BackButton = ({ label, fallbackTo, disabled = false, className = '', sticky = false, showIconOnly = false, onClick, }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isRootFlow = location.pathname === '/app' || location.pathname === '/';
    const displayLabel = label || (isRootFlow ? 'Home' : 'Back');
    const handleBack = () => {
        if (disabled)
            return;
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
        }
        else {
            const parent = fallbackTo || getParentRoute(location.pathname);
            navigate(parent);
        }
    };
    return (<button type="button" onClick={handleBack} disabled={disabled} aria-label={`Go back to ${isRootFlow ? 'Home' : 'previous page'}`} className={`
        group relative min-w-[34px] min-h-[34px] h-[34px] px-2.5 rounded-lg
        flex items-center justify-center gap-1.5
        bg-[#12141A] text-neutral-300 font-mono text-xs font-medium tracking-tight
        border border-white/[0.08] shadow-sm
        transition-all duration-150 select-none
        hover:bg-[#181B23] hover:text-white hover:border-white/20 hover:scale-[1.01]
        active:scale-95 active:bg-[#0E1015]
        focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-[#08090B]
        ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}
        ${sticky ? 'sticky top-3 z-40' : ''}
        ${className}
      `} data-testid="app-back-button">
      {isRootFlow ? (<Home className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-400 transition-colors"/>) : (<ArrowLeft className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors"/>)}
      {!showIconOnly && (<span className="text-xs">{displayLabel}</span>)}
    </button>);
};
