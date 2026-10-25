import React from 'react';
import { GitBranch, FileText, Receipt, ShieldCheck } from 'lucide-react';
import { Stamp } from '../stamps/Stamp';
const steps = [
    {
        number: '01',
        title: 'Connect GitHub',
        description: 'Zero write permissions. Read-only audit.',
        icon: GitBranch,
    },
    {
        number: '02',
        title: 'Paste a real posting',
        description: 'Or test against curated industry benchmarks.',
        icon: FileText,
    },
    {
        number: '03',
        title: 'See your receipts',
        description: 'Attestation and verified coverage score.',
        icon: Receipt,
    },
];
export const StepPreview = () => {
    return (<div className="space-y-8 max-w-lg">
      <div className="space-y-6 relative">
        {/* Connecting Line */}
        <div className="absolute left-5 top-7 bottom-7 w-0.5 bg-gradient-to-b from-[#1F8A5B] via-white/20 to-white/10" aria-hidden="true"/>

        {steps.map((step) => {
            const Icon = step.icon;
            return (<div key={step.number} className="relative flex items-start gap-4 group">
              {/* Step indicator badge */}
              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-[8px] bg-[#12161B] border border-white/15 flex items-center justify-center shadow-lg group-hover:border-[#34D399]/60 transition-colors">
                <span className="font-mono text-xs font-bold text-[#34D399]">
                  {step.number}
                </span>
              </div>

              {/* Step text content */}
              <div className="pt-1.5 space-y-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-[#34D399]"/>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    {step.title}
                  </h3>
                </div>
                <p className="text-xs text-[#9AA3AE] leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>);
        })}
      </div>

      {/* ZK-Attestation Runtime Node Footer Badge */}
      <div className="p-4 rounded-[12px] bg-[#12161B]/80 border border-white/10 backdrop-blur-md flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1F8A5B]/15 border border-[#1F8A5B]/30 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-[#34D399]"/>
          </div>
          <div>
            <div className="font-mono text-[11px] font-bold text-white tracking-wider">
              ZK-ATTESTATION NODE
            </div>
            <div className="font-mono text-[10px] text-[#6B7280]">
              Ephemeral enclave runtime v4.19
            </div>
          </div>
        </div>
        <Stamp status="proven" size="sm" animate={false}/>
      </div>
    </div>);
};
