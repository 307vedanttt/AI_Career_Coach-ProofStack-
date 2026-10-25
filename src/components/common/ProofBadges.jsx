import React from 'react';
import { CheckCircle2, Clock, HelpCircle, MinusCircle, AlertTriangle, Activity, ShieldCheck, Cpu, Sparkles, } from 'lucide-react';
export const SkillStatusBadge = ({ status, size = 'md', showIcon = true, className = '', }) => {
    let colorClasses = '';
    let Icon = MinusCircle;
    switch (status) {
        case 'Demonstrated — Strong':
            colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
            Icon = CheckCircle2;
            break;
        case 'Demonstrated — Basic':
            colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
            Icon = Clock;
            break;
        case 'Not demonstrated in this scope':
            colorClasses = 'bg-slate-500/10 text-slate-400 border-slate-500/30 border-dashed';
            Icon = MinusCircle;
            break;
        case 'Unclear':
            colorClasses = 'bg-purple-500/10 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
            Icon = HelpCircle;
            break;
    }
    const sizeClasses = {
        sm: 'text-[10px] px-2 py-0.5 gap-1 font-mono',
        md: 'text-xs px-2.5 py-1 gap-1.5 font-mono',
        lg: 'text-sm px-3.5 py-1.5 gap-2 font-mono font-semibold',
    }[size];
    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-3.5 h-3.5',
        lg: 'w-4 h-4',
    }[size];
    return (<span className={`inline-flex items-center font-medium border rounded-md uppercase tracking-wider select-none ${colorClasses} ${sizeClasses} ${className}`} title={`Assessment State: ${status}`}>
      {showIcon && <Icon className={`${iconSizes} shrink-0`}/>}
      <span>{status}</span>
    </span>);
};
export const HonestyBadge = ({ label, size = 'sm', className = '' }) => {
    let styleClasses = '';
    let Icon = Activity;
    switch (label) {
        case 'Live Check':
            styleClasses = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
            Icon = ShieldCheck;
            break;
        case 'Derived Signal':
            styleClasses = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20';
            Icon = Cpu;
            break;
        case 'Simulated Demo':
            styleClasses = 'bg-violet-500/10 text-violet-300 border-violet-500/20';
            Icon = Sparkles;
            break;
    }
    const sizeClass = size === 'sm' ? 'text-[10px] px-1.5 py-0.5 gap-1' : 'text-xs px-2 py-1 gap-1.5';
    return (<span className={`inline-flex items-center font-mono font-semibold border rounded ${styleClasses} ${sizeClass} ${className}`} title={`Implementation Transparency: ${label}`}>
      <Icon className="w-2.5 h-2.5 shrink-0"/>
      <span>[{label}]</span>
    </span>);
};
export const ProvenanceStateBadge = ({ state, size = 'sm' }) => {
    let style = '';
    let label = '';
    let Icon = CheckCircle2;
    switch (state) {
        case 'verified':
            style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
            label = 'Verified';
            Icon = CheckCircle2;
            break;
        case 'review_recommended':
            style = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
            label = 'Review Recommended';
            Icon = AlertTriangle;
            break;
        case 'attention':
            style = 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
            label = 'Context Signal';
            Icon = Activity;
            break;
        case 'informational':
            style = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
            label = 'Info';
            Icon = HelpCircle;
            break;
    }
    const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5 gap-1' : 'text-xs px-2.5 py-1 gap-1.5';
    return (<span className={`inline-flex items-center font-mono uppercase font-bold border rounded ${style} ${sizeClass}`}>
      <Icon className="w-3 h-3 shrink-0"/>
      <span>{label}</span>
    </span>);
};
