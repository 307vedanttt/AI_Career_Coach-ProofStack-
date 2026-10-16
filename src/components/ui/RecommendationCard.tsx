import React from 'react';
import { clsx } from 'clsx';
import { ArrowRight } from 'lucide-react';
import { Stamp, StampStatus } from '../stamps/Stamp';

export interface RecommendationCardProps {
  title: string;
  delta?: string;
  description?: string;
  targetRequirement?: string;
  targetStatus?: StampStatus;
  buttonLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  title,
  delta = '+13% DELTA',
  description,
  targetRequirement,
  targetStatus = 'proven',
  buttonLabel = 'Open contract',
  onAction,
  className,
}) => {
  return (
    <div
      role="region"
      aria-label="Actionable Recommendation"
      className={clsx(
        'relative rounded-panel p-4 bg-white/[0.03] backdrop-blur-2xl',
        'border-2 border-dashed border-[#1F8A5B] shadow-[0_0_30px_rgba(31,138,91,0.15)]',
        'flex flex-col justify-between transition-all duration-200',
        className
      )}
    >
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#34D399] font-mono tracking-wider px-2 py-0.5 rounded bg-[#1F8A5B]/15 border border-[#1F8A5B]/30">
            RECOMMENDATION
          </span>
          {delta && (
            <span className="text-[11px] font-mono text-[#9AA3AE] font-semibold">
              {delta}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white tracking-tight leading-snug">
          {title}
        </h3>

        {/* Optional Description */}
        {description && (
          <p className="text-xs text-[#9AA3AE] mt-1 leading-relaxed">
            {description}
          </p>
        )}

        {/* Target Status Transition Preview */}
        {targetRequirement && (
          <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-white/5">
            <span className="text-xs text-[#9AA3AE]">{targetRequirement} becomes</span>
            <Stamp status={targetStatus} size="sm" />
          </div>
        )}
      </div>

      {/* Primary Action Button */}
      {buttonLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 w-full h-[40px] rounded-lg bg-[#1F8A5B] hover:bg-[#19754c] active:scale-[0.99] text-[#0A0C0F] font-bold text-xs tracking-tight flex items-center justify-center space-x-2 shadow-[0_0_16px_rgba(52,211,153,0.35)] transition-all"
        >
          <span>{buttonLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
        </button>
      )}
    </div>
  );
};
