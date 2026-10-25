import React from 'react';

/**
 * ProofStackLogo
 * Professional developer-infrastructure brand logo component.
 * Grounded directly in code evidence, git commits, and career progression.
 *
 * Concepts supported:
 * - 'git-branch' (default): Git commit graph forming a 'P' with the highlighted Emerald Predictive Commit node.
 * - 'proof-stack': 3 stacked architectural code evidence slabs (Repo AST -> Hollow Filter -> Verified Contract).
 * - 'code-trajectory': Developer code brackets < > enclosing an ascending career trajectory vector.
 */
export const ProofStackLogo = ({ 
  size = 'md', 
  concept = 'code-trajectory',
  showWordmark = true, 
  variant = 'glow',
  className = '' 
}) => {
  // Dimensions map
  const sizeMap = {
    xs: { icon: 20, font: 'text-sm', badge: 'text-[9px]' },
    sm: { icon: 24, font: 'text-base', badge: 'text-[9px]' },
    md: { icon: 32, font: 'text-lg', badge: 'text-[10px]' },
    lg: { icon: 40, font: 'text-xl', badge: 'text-[10px]' },
    xl: { icon: 56, font: 'text-2xl', badge: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const iconDim = currentSize.icon;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Mark */}
      <div 
        className="relative shrink-0 flex items-center justify-center"
        style={{ width: iconDim, height: iconDim }}
      >
        {concept === 'code-trajectory' && (
          <svg 
            viewBox="0 0 48 48" 
            width={iconDim} 
            height={iconDim} 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 hover:scale-105"
          >
            <defs>
              <filter id="ps-glow-vector" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="ps-vec-grad" x1="18" y1="26" x2="33" y2="13" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* Subtle Matte Squircle Container */}
            <rect 
              x="2" 
              y="2" 
              width="44" 
              height="44" 
              rx="12" 
              fill="#0A0D14" 
              stroke="rgba(255, 255, 255, 0.09)" 
              strokeWidth="1.2" 
            />

            {/* Left Developer Angle Bracket '<' */}
            <path 
              d="M 17 15 L 10 24 L 17 33" 
              stroke="#94A3B8" 
              strokeWidth="2.8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Right Developer Angle Bracket '>' */}
            <path 
              d="M 31 15 L 38 24 L 31 33" 
              stroke="#94A3B8" 
              strokeWidth="2.8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Stepping Ledger Proof Lines */}
            <line x1="16" y1="29" x2="24" y2="29" stroke="#475569" strokeWidth="2.4" strokeLinecap="round" />
            <line x1="18" y1="23.5" x2="27" y2="23.5" stroke="#64748B" strokeWidth="2.4" strokeLinecap="round" />

            {/* Upward Career Trajectory Vector (Emerald Glow) */}
            <g filter={variant === 'glow' ? 'url(#ps-glow-vector)' : undefined}>
              <path 
                d="M 19 25.5 L 25.5 19 L 32.5 12" 
                stroke="url(#ps-vec-grad)" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
              <path 
                d="M 26 12 H 32.5 V 18.5" 
                stroke="url(#ps-vec-grad)" 
                strokeWidth="3.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            </g>
          </svg>
        )}

        {concept === 'git-branch' && (
          <svg 
            viewBox="0 0 48 48" 
            width={iconDim} 
            height={iconDim} 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 hover:scale-105"
          >
            <defs>
              <filter id="ps-glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="ps-branch-grad" x1="16" y1="28.5" x2="31" y2="15" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="#0A0D14" stroke="rgba(255, 255, 255, 0.09)" strokeWidth="1.2" />
            <path d="M 16 38 L 16 14" stroke="#94A3B8" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M 16 14 C 25 14, 34 15, 34 21.5 C 34 28, 25 28.5, 16 28.5" stroke="#94A3B8" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 16 28.5 C 21 28.5, 23 25, 25 20 C 26.5 16.5, 28 15, 31 15" stroke="url(#ps-branch-grad)" strokeWidth="2.4" strokeLinecap="round" />
            <circle cx="16" cy="35" r="2.5" fill="#0A0D14" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="16" cy="27" r="2.5" fill="#0A0D14" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="16" cy="14" r="2.5" fill="#0A0D14" stroke="#94A3B8" strokeWidth="2" />
            <circle cx="24.5" cy="21" r="2" fill="#10B981" />
            <circle cx="31" cy="15" r="4" fill="#10B981" filter={variant === 'glow' ? 'url(#ps-glow-emerald)' : undefined} />
            <circle cx="31" cy="15" r="1.8" fill="#FFFFFF" />
          </svg>
        )}

        {concept === 'proof-stack' && (
          <svg 
            viewBox="0 0 48 48" 
            width={iconDim} 
            height={iconDim} 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 hover:scale-105"
          >
            <defs>
              <filter id="ps-glow-stack" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect x="2" y="2" width="44" height="44" rx="12" fill="#0A0D14" stroke="rgba(255,255,255,0.09)" strokeWidth="1.2" />
            <rect x="12" y="14" width="4.5" height="22" rx="2.25" fill="#F8FAFC" />
            <rect x="12" y="14" width="22" height="4.5" rx="2.25" fill="#10B981" filter="url(#ps-glow-stack)" />
            <rect x="12" y="22.5" width="16" height="4" rx="2" fill="#64748B" />
            <rect x="12" y="30.5" width="22" height="4" rx="2" fill="#334155" />
            <path d="M 30 14 C 35 14, 36 17, 36 20.5 C 36 24, 33 26.5, 27 26.5" stroke="#10B981" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        )}
      </div>

      {/* Brand Typography Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <div className={`font-display font-bold tracking-tight text-white flex items-center gap-1.5 ${currentSize.font}`}>
            <span>Proof</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Stack
            </span>
            <span className={`${currentSize.badge} font-mono font-semibold px-1.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300 uppercase tracking-wider`}>
              v2.4
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-[#8C919D] uppercase mt-0.5">
            Git Provenance & Predictive Invariants
          </span>
        </div>
      )}
    </div>
  );
};
