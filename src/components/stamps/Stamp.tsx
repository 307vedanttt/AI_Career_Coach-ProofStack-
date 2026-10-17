import React from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  HelpCircle,
  MinusCircle,
  AlertTriangle,
  ShieldAlert,
  XCircle,
  CircleDot,
} from 'lucide-react';
import { clsx } from 'clsx';

export type StampStatus =
  | 'proven'
  | 'basic'
  | 'not_shown'
  | 'unclear'
  | 'attack'
  | 'refused'
  | 'hollow'
  | 'fulfilled'
  | 'partly'
  | 'not_fulfilled'
  | 'pending';

export type StampSize = 'sm' | 'md' | 'lg';

export interface StampProps {
  status: StampStatus;
  size?: StampSize;
  animate?: boolean;
  className?: string;
  label?: string;
}

interface StatusConfig {
  defaultLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: string;
  borderStyle: string;
  glow?: string;
}

const statusConfigs: Record<StampStatus, StatusConfig> = {
  proven: {
    defaultLabel: 'PROVEN',
    icon: Check,
    colors: 'text-[#1F8A5B] bg-[#1F8A5B]/10',
    borderStyle: 'border-[#1F8A5B]',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.35)]',
  },
  basic: {
    defaultLabel: 'BASIC',
    icon: Clock,
    colors: 'text-[#B7791F] bg-[#B7791F]/10',
    borderStyle: 'border-[#B7791F]',
    glow: 'shadow-[0_0_12px_rgba(245,165,36,0.35)]',
  },
  not_shown: {
    defaultLabel: 'NOT SHOWN IN SCOPE',
    icon: MinusCircle,
    colors: 'text-[#64748B] bg-[#64748B]/10',
    borderStyle: 'border-[#64748B] border-dashed',
    glow: 'shadow-[0_0_8px_rgba(100,116,139,0.2)]',
  },
  unclear: {
    defaultLabel: 'UNCLEAR',
    icon: HelpCircle,
    colors: 'text-[#6D5BD0] bg-[#6D5BD0]/10',
    borderStyle: 'border-[#6D5BD0]',
    glow: 'shadow-[0_0_12px_rgba(109,91,208,0.35)]',
  },
  attack: {
    defaultLabel: 'ATTACK',
    icon: AlertTriangle,
    colors: 'text-[#C2362B] bg-[#C2362B]/10',
    borderStyle: 'border-[#C2362B]',
    glow: 'shadow-[0_0_14px_rgba(194,54,43,0.4)]',
  },
  refused: {
    defaultLabel: 'REFUSED',
    icon: ShieldAlert,
    colors: 'text-[#FF5C4D] bg-[#FF5C4D]/10',
    borderStyle: 'border-[#FF5C4D]',
    glow: 'shadow-[0_0_14px_rgba(255,92,77,0.45)]',
  },
  hollow: {
    defaultLabel: 'HOLLOW',
    icon: AlertTriangle,
    colors: 'text-[#FF5C4D] bg-[#FF5C4D]/10',
    borderStyle: 'border-[#FF5C4D]',
    glow: 'shadow-[0_0_16px_rgba(255,92,77,0.45)]',
  },
  fulfilled: {
    defaultLabel: 'FULFILLED',
    icon: CheckCircle2,
    colors: 'text-[#1F8A5B] bg-[#1F8A5B]/10',
    borderStyle: 'border-[#1F8A5B]',
    glow: 'shadow-[0_0_12px_rgba(52,211,153,0.3)]',
  },
  partly: {
    defaultLabel: 'PARTLY',
    icon: CircleDot,
    colors: 'text-[#B7791F] bg-[#B7791F]/10',
    borderStyle: 'border-[#B7791F]',
    glow: 'shadow-[0_0_10px_rgba(245,165,36,0.3)]',
  },
  not_fulfilled: {
    defaultLabel: 'NOT FULFILLED',
    icon: XCircle,
    colors: 'text-[#64748B] bg-[#64748B]/10',
    borderStyle: 'border-[#64748B]',
    glow: 'shadow-[0_0_8px_rgba(100,116,139,0.2)]',
  },
  pending: {
    defaultLabel: 'PENDING',
    icon: Clock,
    colors: 'text-[#64748B] bg-[#64748B]/10',
    borderStyle: 'border-[#64748B]',
    glow: 'shadow-[0_0_8px_rgba(100,116,139,0.2)]',
  },
};

const sizeClasses: Record<StampSize, { outer: string; inner: string; text: string; icon: string }> = {
  sm: {
    outer: 'p-[1px]',
    inner: 'px-1.5 py-0.5 gap-1',
    text: 'text-[10px] tracking-wider',
    icon: 'w-2.5 h-2.5 stroke-[2.5]',
  },
  md: {
    outer: 'p-[1.5px]',
    inner: 'px-2.5 py-1 gap-1.5',
    text: 'text-[11px] tracking-widest',
    icon: 'w-3.5 h-3.5 stroke-[2.5]',
  },
  lg: {
    outer: 'p-[2px]',
    inner: 'px-3.5 py-1.5 gap-2',
    text: 'text-[13px] tracking-[0.16em]',
    icon: 'w-4 h-4 stroke-[2.5]',
  },
};

export const Stamp: React.FC<StampProps> = ({
  status,
  size = 'md',
  animate = false,
  className,
  label,
}) => {
  const config = statusConfigs[status] || statusConfigs.not_shown;
  const sizeStyle = sizeClasses[size];
  const IconComponent = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      role="status"
      aria-label={`${displayLabel} status`}
      className={clsx(
        'inline-flex items-center select-none font-mono font-extrabold uppercase rounded-stamp transition-transform duration-150',
        '-rotate-[4deg]',
        sizeStyle.outer,
        'border',
        config.borderStyle,
        config.colors,
        config.glow,
        animate && 'animate-pulse',
        className
      )}
    >
      <span
        className={clsx(
          'inline-flex items-center rounded-[2px] border border-current',
          sizeStyle.inner
        )}
      >
        <IconComponent className={sizeStyle.icon} aria-hidden="true" />
        <span className={clsx('leading-none font-bold', sizeStyle.text)}>{displayLabel}</span>
      </span>
    </span>
  );
};
