import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, Lock, Database, ArrowLeft, Check } from 'lucide-react';
import { ReceiptCard } from '../../components/receipt/ReceiptCard';
import { Button } from '../../components/ui/Button';
import { setMockSignedIn } from '../../lib/api';
export const ConsentPage = () => {
    const navigate = useNavigate();
    const headingRef = useRef(null);
    useEffect(() => {
        headingRef.current?.focus();
    }, []);
    const handleAllow = async () => {
        await setMockSignedIn(true);
        navigate('/app', { replace: true });
    };
    const handleCancel = () => {
        navigate('/login', { replace: true });
    };
    return (<div className="min-h-screen bg-[#0A0C0F] text-[#F7F5F0] flex flex-col items-center justify-center p-4 sm:p-6 relative">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden="true"/>

      <div className="relative z-10 w-full max-w-[480px]">
        {/* Physical Notarized Consent Receipt */}
        <ReceiptCard serial="RECEIPT: OAUTH-0089" timestamp="2026-10-17 00:22 UTC" showBarcode={true} variant="cream" className="shadow-2xl border-x border-b border-[#CBD5E1]">
          {/* Header */}
          <div className="mb-4">
            <span className="font-mono text-[10px] tracking-wider text-[#64748B] uppercase block mb-1">
              CONSENT AUDIT RECORD
            </span>
            <h1 ref={headingRef} tabIndex={-1} className="font-serif italic text-2xl text-[#0F172A] tracking-tight focus:outline-none">
              Authorize ProofStack Audit
            </h1>
            <p className="font-mono text-xs text-[#575D65] mt-1">
              Read-only enclave access requested for your account.
            </p>
          </div>

          {/* Scope Item Grid */}
          <div className="space-y-3 border-y border-dashed border-[#D3CDBD] py-4 my-4 font-mono text-xs">
            {/* Account scope */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-[#1F8A5B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-[#1F8A5B]"/>
              </div>
              <div>
                <span className="font-bold text-[#14171A] block">Account identity</span>
                <span className="text-[#575D65] text-[11px]">read:user (public profile info)</span>
              </div>
            </div>

            {/* Access Level */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-[#1F8A5B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Eye className="w-3.5 h-3.5 text-[#1F8A5B]"/>
              </div>
              <div>
                <span className="font-bold text-[#14171A] block">Access permissions</span>
                <span className="text-[#575D65] text-[11px]">Strictly read-only; zero write capability</span>
              </div>
            </div>

            {/* Repos Scope */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-[#1F8A5B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-[#1F8A5B]"/>
              </div>
              <div>
                <span className="font-bold text-[#14171A] block">Target repositories</span>
                <span className="text-[#575D65] text-[11px]">Public repositories only by default</span>
              </div>
            </div>

            {/* Storage Policy */}
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded bg-[#1F8A5B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Database className="w-3.5 h-3.5 text-[#1F8A5B]"/>
              </div>
              <div>
                <span className="font-bold text-[#14171A] block">Storage policy</span>
                <span className="text-[#575D65] text-[11px]">Code snippets and verified hashes only</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="solid_ink" size="md" onClick={handleCancel} className="flex-1 text-xs" icon={<ArrowLeft className="w-3.5 h-3.5"/>}>
              Cancel
            </Button>
            <Button type="button" variant="emerald" size="md" onClick={handleAllow} className="flex-1 text-xs font-bold" icon={<Check className="w-3.5 h-3.5"/>}>
              Allow & Continue
            </Button>
          </div>
        </ReceiptCard>
      </div>
    </div>);
};
