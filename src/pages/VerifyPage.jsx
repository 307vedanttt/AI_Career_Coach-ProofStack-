import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { ShieldCheck, ShieldAlert, Link as LinkIcon, AlertTriangle, CheckCircle2, RefreshCw, } from 'lucide-react';
export const VerifyPage = () => {
    const [isTampered, setIsTampered] = useState(false);
    const [revealedCount, setRevealedCount] = useState(0);
    const [sealRotatedIn, setSealRotatedIn] = useState(false);
    // 8-block chain specification
    const blocks = [
        { height: 1, commit: '7a12b9c', prevHash: '00000000', rootHash: 'sha256:1a82bc...0041', invariants: 2, timestamp: '10:00:12' },
        { height: 2, commit: '8e41c0d', prevHash: '1a82bc00', rootHash: 'sha256:39fa01...88ab', invariants: 4, timestamp: '10:08:45' },
        { height: 3, commit: 'a182c4f', prevHash: '39fa0188', rootHash: 'sha256:7f83b1...d069', invariants: 7, timestamp: '10:14:22' },
        { height: 4, commit: 'a12bc4f', prevHash: '7f83b1d0', rootHash: 'sha256:44ef10...aa21', invariants: 9, timestamp: '10:20:01' },
        { height: 5, commit: 'b23cd5e', prevHash: '44ef10aa', rootHash: 'sha256:99c011...bc44', invariants: 11, timestamp: '10:25:30' },
        { height: 6, commit: 'c34de6f', prevHash: '99c011bc', rootHash: 'sha256:55aa32...ef90', invariants: 13, timestamp: '10:31:15' },
        { height: 7, commit: 'd45ef7a', prevHash: '55aa32ef', rootHash: 'sha256:88bb43...fa12', invariants: 15, timestamp: '10:37:04' },
        { height: 8, commit: 'e56fa8b', prevHash: '88bb43fa', rootHash: 'sha256:22cc54...bb78', invariants: 18, timestamp: '10:42:01' },
    ];
    // Draw in the 8 blocks one by one, then rotate in the seal
    useEffect(() => {
        setRevealedCount(0);
        setSealRotatedIn(false);
        let current = 0;
        const interval = setInterval(() => {
            current++;
            setRevealedCount(current);
            if (current >= 8) {
                clearInterval(interval);
                setTimeout(() => setSealRotatedIn(true), 250);
            }
        }, 120);
        return () => clearInterval(interval);
    }, [isTampered]);
    return (<AppLayout>
      <div className="max-w-[1360px] w-full mx-auto px-4 lg:px-8 py-8 flex flex-col space-y-8 select-none">
        {/* HEADER */}
        <header className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#9AA3AE] uppercase tracking-wider">
              <span>MONOTONIC MERKLE RATCHET</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"/>
              <span>8-BLOCK LINEAR LEDGER</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
              Chain Verification & Proof Ledger
            </h1>
            {/* REQUIRED PHRASE */}
            <p className="text-xs md:text-sm text-[#E2E8F0] font-medium leading-relaxed italic bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 max-w-2xl mt-2">
              "Receipts prove our record was not changed. They do not prove who wrote the code."
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Re-Verify Ledger Button */}
            <Button variant="solid_paper" size="sm" onClick={() => {
            setIsTampered(false);
            setRevealedCount(0);
            setSealRotatedIn(false);
            let current = 0;
            const interval = setInterval(() => {
                current++;
                setRevealedCount(current);
                if (current >= 8) {
                    clearInterval(interval);
                    setTimeout(() => setSealRotatedIn(true), 250);
                }
            }, 120);
        }} aria-label="Re-Verify Merkle Ledger Integrity" className="font-mono text-xs">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5"/>
              <span>Re-Verify Ledger</span>
            </Button>

            {/* Tamper Variant Toggle */}
            <Button variant={isTampered ? 'solid_ink' : 'ghost'} size="sm" onClick={() => setIsTampered(!isTampered)} aria-label={isTampered ? 'Restore valid chain' : 'Simulate broken tamper link'} className={`font-mono text-xs ${isTampered ? 'border-red-500 bg-red-500/20 text-red-300' : 'text-white border-white/10'}`}>
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-400"/>
              <span>{isTampered ? 'Tampered State (Active)' : 'Simulate Tamper'}</span>
            </Button>
          </div>
        </header>

        {/* SEAL WITH "CHAIN VALID" (OR TAMPERED BREAK) */}
        {/* The seal rotates in after links finish drawing */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className={`transition-all duration-700 transform flex flex-col items-center ${sealRotatedIn ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-45 scale-75'} ${isTampered ? 'animate-shake' : ''}`}>
            {isTampered ? (<div className="relative p-6 rounded-full border-4 border-dashed border-[#FF5C4D] bg-[#FF5C4D]/10 flex flex-col items-center justify-center text-center shadow-[0_0_35px_rgba(255,92,77,0.4)]">
                <ShieldAlert className="w-12 h-12 text-[#FF5C4D] mb-1"/>
                <span className="font-mono text-sm font-black text-[#FF5C4D] tracking-widest uppercase">
                  CHAIN BROKEN
                </span>
                <span className="font-mono text-[10px] text-red-300 font-bold">
                  HASH MISMATCH AT BLOCK #0004
                </span>
              </div>) : (<div className="relative p-6 rounded-full border-4 border-[#00BA81] bg-[#00BA81]/10 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(0,186,129,0.35)]">
                <ShieldCheck className="w-12 h-12 text-[#00BA81] mb-1"/>
                <span className="font-mono text-base font-black text-[#00BA81] tracking-widest uppercase">
                  CHAIN VALID
                </span>
                <span className="font-mono text-[10px] text-emerald-300 font-bold">
                  ALL 8 BLOCKS SEALED // MONOTONIC
                </span>
              </div>)}
          </div>
        </div>

        {/* 8-BLOCK CHAIN WITH SEQUENTIALLY DRAWN LINKS */}
        <section aria-label="8-Block Monotonic Chain" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#9AA3AE]">
              CHRONOLOGICAL RATIENT TRACE (8 BLOCKS SEQUENTIAL)
            </span>
            <span className="font-mono text-xs text-emerald-400">
              {revealedCount} / 8 BLOCKS CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {blocks.map((b, idx) => {
            const isRevealed = idx < revealedCount;
            // Tampered variant breaks at block 4
            const isBrokenLink = isTampered && b.height >= 4;
            return (<div key={b.height} className={`relative p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] ${!isRevealed
                    ? 'opacity-0 translate-y-3'
                    : isBrokenLink
                        ? 'bg-red-500/10 border-red-500/50 shadow-[0_0_20px_rgba(255,92,77,0.25)] animate-shake'
                        : 'bg-white/[0.03] border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.05]'}`}>
                  {/* Top Block Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="font-mono text-xs font-bold text-white tracking-tight">
                      BLOCK #000{b.height}
                    </span>
                    <span className="font-mono text-[10px] text-[#9AA3AE]">
                      {b.timestamp}
                    </span>
                  </div>

                  {/* Commit SHA & Link state */}
                  <div className="my-2 space-y-1 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Commit:</span>
                      <span className="font-bold text-white bg-white/5 px-1.5 py-0.5 rounded">
                        {b.commit}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Prev:</span>
                      <span className={`text-[11px] ${isBrokenLink ? 'text-red-400 line-through' : 'text-[#9AA3AE]'}`}>
                        {b.prevHash}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#64748B]">Invariants:</span>
                      <span className="text-emerald-400 font-bold">
                        +{b.invariants} Proven
                      </span>
                    </div>
                  </div>

                  {/* Connecting Link Indicator */}
                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <LinkIcon className={`w-3.5 h-3.5 ${isBrokenLink ? 'text-red-400' : 'text-emerald-400'}`}/>
                      <span className={isBrokenLink ? 'text-red-400 font-bold' : 'text-[#9AA3AE]'}>
                        {isBrokenLink ? 'LINK BROKEN' : 'HASH LINKED'}
                      </span>
                    </div>
                    {isBrokenLink ? (<span className="text-[10px] px-1 rounded bg-red-500/20 text-red-300 font-bold">
                        INVALID
                      </span>) : (<CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/>)}
                  </div>
                </div>);
        })}
          </div>
        </section>
      </div>
    </AppLayout>);
};
