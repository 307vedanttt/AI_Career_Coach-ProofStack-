import React from 'react';
import { Shield, Check } from 'lucide-react';
export const WhatWeAskGithubCard = () => {
    return (<div className="relative text-[#0F172A] bg-[#F8FAFC] rounded-b-[8px] p-5 sawtooth-top paper-grain shadow-md border-x border-b border-[#CBD5E1]">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-[#0F172A]"/>
          <span className="font-mono text-[11px] font-bold tracking-wider text-[#0F172A] uppercase">
            What We Ask GitHub For
          </span>
        </div>
        <span className="font-mono text-[10px] text-[#575D65]">
          OAUTH_V2
        </span>
      </div>

      <ul className="space-y-1.5 font-mono text-xs text-[#2D3748] mb-4">
        <li className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-[#1F8A5B] flex-shrink-0 mt-0.5"/>
          <span><strong className="text-[#14171A]">read:user</strong> — your public profile</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-[#1F8A5B] flex-shrink-0 mt-0.5"/>
          <span>Public repos only by default</span>
        </li>
        <li className="flex items-start gap-2">
          <Check className="w-3.5 h-3.5 text-[#1F8A5B] flex-shrink-0 mt-0.5"/>
          <span>Private repos only if you choose</span>
        </li>
      </ul>

      <div className="flex items-center justify-between border-t border-dashed border-[#D3CDBD] pt-2 font-mono text-[10px]">
        <span className="text-[#6B7280]">REF: 0X88F-R0</span>
        <span className="px-2 py-0.5 border border-[#14171A] text-[#14171A] font-bold rounded-[3px] tracking-wider uppercase">
          Audit Only
        </span>
      </div>
    </div>);
};
