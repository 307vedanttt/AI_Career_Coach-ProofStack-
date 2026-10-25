import React from 'react';
import { clsx } from 'clsx';

export const ReceiptCard = ({
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
    const rotationDegrees = typeof tilt === 'number' ? `${tilt}deg` : tilt ? '-0.35deg' : '0deg';

    return (
        <article
            aria-label={ariaLabel}
            style={{
                transform: `rotate(${rotationDegrees})`,
            }}
            className={clsx(
                'relative text-[#0F172A] rounded-b-[8px] px-4 sm:px-8 pt-6 sm:pt-7 pb-5 sm:pb-6 max-w-full',
                'sawtooth-top paper-grain shadow-paper transition-transform duration-200 border-x border-b border-[#E2E8F0]',
                variant === 'cream' ? 'bg-[#F8FAFC]' : 'bg-[#FFFFFF]',
                className
            )}
        >
            {/* Header Docket Strip if serial/timestamp/barcode provided */}
            {(serial || timestamp || showBarcode || headerAction) && (
                <header className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 border-b-2 border-dashed border-[#CBD5E1] pb-3 mb-4 text-[#475569] font-mono select-none">
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] truncate">
                        {serial && (
                            <span className="font-semibold tracking-wider text-[#0F172A] truncate">
                                {serial}
                            </span>
                        )}
                        {serial && timestamp && <span className="hidden xs:inline">•</span>}
                        {timestamp && <span className="text-[#475569] truncate">{timestamp}</span>}
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        {showBarcode && (
                            <div className="barcode-lines w-16 sm:w-20 h-3.5 sm:h-4 opacity-75" title="Signed Invariant Barcode" aria-hidden="true" />
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
