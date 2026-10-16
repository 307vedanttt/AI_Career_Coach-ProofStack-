import React from 'react';
import { clsx } from 'clsx';

export interface ReceiptCardProps {
  children: React.ReactNode;
  className?: string;
  serial?: string;
  timestamp?: string;
  tilt?: boolean | number;
  showBarcode?: boolean;
  headerAction?: React.ReactNode;
  variant?: 'white' | 'cream';
  ariaLabel?: string;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  children,
  className,
  serial,
  timestamp,
  tilt = false,
  showBarcode = true,
  headerAction,
  variant = 'cream',
  ariaLabel = 'Physical Proof Receipt',
}) => {
  const rotationDegrees =
    typeof tilt === 'number' ? `${tilt}deg` : tilt ? '-0.35deg' : '0deg';

  return (
    <article
      aria-label={ariaLabel}
      style={{
        transform: `rotate(${rotationDegrees})`,
      }}
      className={clsx(
        'relative text-[#14171A] rounded-b-[8px] px-6 sm:px-8 pt-7 pb-6',
        'sawtooth-top paper-grain shadow-paper transition-transform duration-200',
        variant === 'cream' ? 'bg-[#FAF8F3]' : 'bg-[#FFFFFF]',
        className
      )}
    >
      {/* Header Docket Strip if serial/timestamp/barcode provided */}
      {(serial || timestamp || showBarcode || headerAction) && (
        <header className="flex items-center justify-between border-b-2 border-dashed border-[#D3CDBD] pb-3 mb-4 text-[#575D65] font-mono select-none">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-[11px]">
            {serial && (
              <span className="font-semibold tracking-wider text-[#14171A]">
                {serial}
              </span>
            )}
            {serial && timestamp && <span>•</span>}
            {timestamp && <span className="text-[#6B7280]">{timestamp}</span>}
          </div>

          <div className="flex items-center gap-3">
            {showBarcode && (
              <div
                className="barcode-lines w-20 h-4 opacity-75"
                title="Signed Invariant Barcode"
                aria-hidden="true"
              />
            )}
            {headerAction}
          </div>
        </header>
      )}

      {/* Receipt Body Content */}
      <div className="relative">{children}</div>
    </article>
  );
};
