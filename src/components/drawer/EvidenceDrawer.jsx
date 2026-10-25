import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft, CheckCircle, ShieldAlert, Sparkles, Copy, Check } from 'lucide-react';
import { Stamp } from '../stamps/Stamp';
import { CodeBlock } from '../ui/CodeBlock';
import { Button } from '../ui/Button';
export const EvidenceDrawer = ({ isOpen, onClose, evidence, rejectedCandidate, }) => {
    const [activeVariant, setActiveVariant] = useState('proven');
    const [copiedHash, setCopiedHash] = useState(false);
    const drawerRef = useRef(null);
    const closeButtonRef = useRef(null);
    useEffect(() => {
        if (evidence?.status === 'not_shown') {
            setActiveVariant('rejected');
        }
        else {
            setActiveVariant('proven');
        }
    }, [evidence]);
    // Esc key and focus trap
    useEffect(() => {
        if (!isOpen)
            return;
        // Focus close button on open
        setTimeout(() => {
            closeButtonRef.current?.focus();
        }, 50);
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
            }
            // Focus trap
            if (e.key === 'Tab' && drawerRef.current) {
                const focusable = drawerRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable.length === 0)
                    return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
                else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);
    const handleCopyMerkle = () => {
        if (evidence?.auditTrail.merkleRoot) {
            navigator.clipboard.writeText(evidence.auditTrail.merkleRoot);
            setCopiedHash(true);
            setTimeout(() => setCopiedHash(false), 2000);
        }
    };
    return (<AnimatePresence>
      {isOpen && (<>
          {/* Ambient Backdrop Overlay */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer" aria-hidden="true"/>

          {/* Drawer Panel: Slide-in on desktop, Bottom Sheet on mobile */}
          <motion.aside ref={drawerRef} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 260, damping: 28 }} className="fixed sm:top-0 bottom-0 right-0 sm:left-auto left-0 w-full sm:max-w-[540px] max-h-[90vh] sm:max-h-full h-full bg-[#0E1116]/95 backdrop-blur-2xl sm:border-l border-t sm:border-t-0 border-white/10 z-50 flex flex-col shadow-2xl overflow-hidden focus:outline-none rounded-t-3xl sm:rounded-none" role="dialog" aria-modal="true" aria-labelledby="drawer-title">
            {/* Mobile Sheet Drag Handle Pill */}
            <div className="sm:hidden w-12 h-1.5 rounded-full bg-white/25 mx-auto my-2.5 shrink-0"/>

            {/* Top Bar / Header */}
            <header className="h-14 px-6 border-b border-white/10 flex items-center justify-between bg-black/30 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]"/>
                <span className="font-mono text-xs font-semibold tracking-wider text-[#9AA3AE] uppercase">
                  ARTIFACT // AUDIT DOCKET
                </span>
              </div>

              {/* Mode Toggle: PROVEN vs REJECTED (HOLLOW) */}
              <div className="flex items-center bg-[#15191E] p-1 rounded-lg border border-white/10">
                <button type="button" onClick={() => setActiveVariant('proven')} className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-wide transition-all ${activeVariant === 'proven'
                ? 'bg-emerald-500 text-[#0A0C0F] shadow-[0_0_12px_rgba(31,138,91,0.4)]'
                : 'text-[#9AA3AE] hover:text-white'}`} aria-pressed={activeVariant === 'proven'}>
                  PROVEN
                </button>
                <button type="button" onClick={() => setActiveVariant('rejected')} className={`px-3 py-1 rounded text-xs font-mono font-bold tracking-wide transition-all ${activeVariant === 'rejected'
                ? 'bg-[#C2362B] text-white shadow-[0_0_12px_rgba(194,54,43,0.4)]'
                : 'text-[#9AA3AE] hover:text-white'}`} aria-pressed={activeVariant === 'rejected'}>
                  Candidate (HOLLOW)
                </button>
              </div>

              {/* Action buttons: Back arrow & Close X */}
              <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} className="h-8 px-2.5 rounded-lg bg-white/5 hover:bg-white/10 flex items-center gap-1.5 text-xs font-mono text-[#9AA3AE] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500" aria-label="Back to dashboard view">
                  <ArrowLeft className="w-3.5 h-3.5"/>
                  <span className="hidden sm:inline">Back</span>
                </button>
                <button ref={closeButtonRef} type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#9AA3AE] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500" aria-label="Close evidence inspection drawer">
                  <X className="w-4 h-4"/>
                </button>
              </div>
            </header>

            {/* Drawer Body / Physical Paper Docket */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              <AnimatePresence mode="wait">
                {activeVariant === 'proven' && evidence && (<motion.div key="proven-view" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.25 }} className="space-y-6">
                    {/* The perforated edge "prints" downward */}
                    <div className="relative bg-[#F8FAFC] text-[#0F172A] rounded-b-xl pt-6 px-6 pb-6 shadow-[0_30px_70px_rgba(0,0,0,0.65)] border border-[#CBD5E1]">
                      {/* Sawtooth Top Edge */}
                      <div className="absolute top-0 left-0 right-0 h-3 sawtooth-top bg-[#F8FAFC] -translate-y-2 pointer-events-none"/>

                      {/* PROVEN Rubber Stamp Overlay */}
                      <div className="absolute -top-3 -right-3 z-20 pointer-events-none select-none">
                        <Stamp status="proven" size="md" animate={false}/>
                      </div>

                      {/* Header metadata */}
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#475569] pb-2 border-b border-[#CBD5E1]">
                        <div className="flex items-center gap-1.5">
                          <span>SERIAL: {evidence.serial}</span>
                          <span>•</span>
                          <span>{evidence.timestamp}</span>
                        </div>
                        <div className="barcode-lines w-20 h-4 opacity-75" aria-hidden="true"/>
                      </div>

                      {/* Title & Subheading */}
                      <div className="mt-4 pr-24">
                        <h2 id="drawer-title" className="font-display text-3xl font-bold text-[#14171A] tracking-tight">
                          {evidence.title}
                        </h2>
                        <p className="font-mono text-xs text-[#6B7280] mt-1">{evidence.sublabel}</p>
                      </div>

                      {/* Dark Code Block */}
                      <div className="mt-4">
                        <CodeBlock code={evidence.code} fileName={evidence.fileName} highlightLines={evidence.highlightLines} highlightType={evidence.highlightType}/>
                      </div>

                      {/* Verified Invariant Chips */}
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        {evidence.chips.map((chip, i) => (<div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#EBF8F2] border border-emerald-500/30 text-emerald-900 font-mono text-xs font-semibold">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600"/>
                            <span>{chip}</span>
                          </div>))}
                      </div>

                      {/* Footer Attestation Row */}
                      <div className="mt-6 pt-4 border-t border-dashed border-[#D3CDBD] flex items-center justify-between font-mono text-xs text-[#6B7280]">
                        <span className="flex items-center gap-1 text-emerald-700 font-bold">
                          <Sparkles className="w-3.5 h-3.5"/>
                          <span>{evidence.auditTrail.verifiedAssertions} Invariants Attested</span>
                        </span>
                        <span className="text-[#14171A] font-bold">
                          commit {evidence.auditTrail.commitHash}
                        </span>
                      </div>
                    </div>

                    {/* Merkle Ledger Proof Details Card */}
                    <div className="bg-[#12161B] rounded-xl p-4 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-[#9AA3AE]">
                        <span>DETERMINISTIC MERKLE ROOT</span>
                        <button type="button" onClick={handleCopyMerkle} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold focus:outline-none">
                          {copiedHash ? (<>
                              <Check className="w-3.5 h-3.5"/>
                              <span>COPIED</span>
                            </>) : (<>
                              <Copy className="w-3.5 h-3.5"/>
                              <span>COPY</span>
                            </>)}
                        </button>
                      </div>
                      <div className="font-mono text-xs text-white bg-black/40 p-2.5 rounded border border-white/5 truncate">
                        {evidence.auditTrail.merkleRoot}
                      </div>
                    </div>
                  </motion.div>)}

                {/* Candidate (HOLLOW / REFUSED) Variant */}
                {activeVariant === 'rejected' && (<motion.div key="rejected-view" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.25 }} className="space-y-6">
                    <div className="relative bg-[#F8FAFC] text-[#0F172A] rounded-b-xl pt-6 px-6 pb-6 shadow-[0_30px_70px_rgba(0,0,0,0.65)] border border-[#CBD5E1]">
                      {/* Sawtooth Top Edge */}
                      <div className="absolute top-0 left-0 right-0 h-3 sawtooth-top bg-[#F8FAFC] -translate-y-2 pointer-events-none"/>

                      {/* HOLLOW Stamp Overlay */}
                      <div className="absolute -top-3 -right-3 z-20 pointer-events-none select-none">
                        <Stamp status="hollow" size="md" animate={false}/>
                      </div>

                      {/* Header */}
                      <div className="flex items-center justify-between font-mono text-[11px] text-[#475569] pb-2 border-b border-[#CBD5E1]">
                        <div className="flex items-center gap-1.5">
                          <span>SERIAL: {rejectedCandidate?.serial || 'AUDIT-REJECT-0091'}</span>
                          <span>•</span>
                          <span>2026-10-16 14:02:18 UTC</span>
                        </div>
                        <div className="barcode-lines w-20 h-4 opacity-75" aria-hidden="true"/>
                      </div>

                      {/* Title */}
                      <div className="mt-4 pr-24">
                        <h2 className="font-display text-3xl font-bold text-[#14171A] tracking-tight">
                          {rejectedCandidate?.title || 'Automated Testing Invariant'}
                        </h2>
                        <p className="font-mono text-xs text-[#C2362B] font-bold mt-1">
                          Refused from coverage: Test contains no assertions
                        </p>
                      </div>

                      {/* Code Block with Red Highlight */}
                      <div className="mt-4">
                        <CodeBlock code={rejectedCandidate?.code ||
                    `def test_orders_endpoint_status():\n    response = client.get("/orders")\n    # Test contains no assertions! Refused from proof ledger.\n    pass`} fileName={rejectedCandidate?.fileName || 'tests/test_orders.py'} highlightLines={rejectedCandidate?.highlightLines || [3, 4]} highlightType="red"/>
                      </div>

                      {/* Refusal Notice Banner */}
                      <div className="mt-4 p-3 rounded-lg bg-[#FF5C4D]/10 border border-[#FF5C4D]/30 text-xs font-mono text-[#14171A] space-y-1">
                        <div className="flex items-center gap-1.5 text-[#C2362B] font-bold uppercase">
                          <ShieldAlert className="w-4 h-4"/>
                          <span>Hollow Signal Guard Triggered</span>
                        </div>
                        <p className="text-[#575D65]">
                          The code executes but never asserts invariants. ProofStack requires
                          deterministic checks (`assert response.status_code == 200`).
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button variant="solid_ink" size="sm" onClick={onClose}>
                        Close Inspection
                      </Button>
                    </div>
                  </motion.div>)}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>)}
    </AnimatePresence>);
};
