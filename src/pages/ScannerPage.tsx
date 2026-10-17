import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { scanPublicRepo } from '../lib/api';
import { RepoScanResult } from '../types/api';
import {
  Terminal,
  Play,
  Check,
  ShieldCheck,
} from 'lucide-react';

export const ScannerPage: React.FC = () => {
  const [username, setUsername] = useState('octocat');
  const [isSelfProfile, setIsSelfProfile] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<RepoScanResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isScanning || !username.trim()) return;

    setIsScanning(true);
    setScanProgress(20);

    const timer = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    try {
      const res = await scanPublicRepo(username);
      clearInterval(timer);
      setScanProgress(100);
      setScanResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <AppLayout>
      {/* MOBILE FIRST CONTAINER: STRICTLY 390px WIDTH ON MOBILE */}
      <div className="w-full max-w-[390px] mx-auto px-3 py-6 flex flex-col space-y-5 select-none">
        {/* Scope Header */}
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-widest font-bold">
              Target Verification / GitHub Scan
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">
            Audit Public Proof
          </h1>
          <p className="text-xs text-[#9AA3AE] leading-snug">
            Run zero-knowledge inspection against public repository artifacts.
          </p>
        </div>

        {/* Interactive Terminal Scanner Form */}
        <form
          onSubmit={handleScan}
          className="glass-panel rounded-xl p-4 border border-white/10 space-y-3.5 shadow-xl"
        >
          <div className="space-y-1">
            <label
              htmlFor="gh-user-input"
              className="font-mono text-[11px] uppercase text-[#9AA3AE] flex items-center justify-between"
            >
              <span>Public GitHub Username</span>
              <span className="text-emerald-400 font-semibold">[TARGET READY]</span>
            </label>

            <div className="relative flex items-center w-full bg-[#08090C] border border-white/10 rounded-lg focus-within:border-emerald-500/50 transition-colors">
              <span className="pl-3 pr-1 font-mono text-sm text-emerald-400 font-bold select-none">
                @
              </span>
              <input
                id="gh-user-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. torvalds or octocat"
                spellCheck={false}
                className="w-full bg-transparent py-2.5 pr-3 text-white font-mono text-xs placeholder-[#64748B] focus:outline-none"
              />
              <div className="pr-3 text-[#64748B]">
                <Terminal className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Self Profile Checkbox */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-[#9AA3AE] hover:text-white transition-colors">
            <input
              type="checkbox"
              checked={isSelfProfile}
              onChange={(e) => setIsSelfProfile(e.target.checked)}
              className="rounded bg-white/10 border-white/20 text-emerald-500 focus:ring-0 w-3.5 h-3.5"
            />
            <span>This is my own public profile</span>
          </label>

          {/* Scan Button */}
          <Button
            type="submit"
            variant="solid_paper"
            size="md"
            disabled={isScanning}
            className="w-full font-display font-bold text-xs justify-center shadow-md active:scale-[0.985] py-2.5"
          >
            <Play className={`w-3.5 h-3.5 mr-1.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Auditing Invariants...' : 'Scan & Attest Invariants'}</span>
          </Button>
        </form>

        {/* Queue Position with Progress Line */}
        {isScanning && (
          <div className="glass-panel p-4 rounded-xl border border-white/10 space-y-2.5 animate-fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center space-x-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-white font-medium text-[11px]">
                  Queue Position 2 · Scanning Tree
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                SYNCING
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono text-[#9AA3AE]">
              <span>Indexing remote commit tree...</span>
              <span className="text-white font-medium">{scanProgress}%</span>
            </div>

            {/* Micro Progress Bar Line */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-200"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Result Receipt (Thermal Physical Paper Card) */}
        {scanResult && !isScanning && (
          <article
            aria-label="Result Thermal Receipt"
            className="relative w-full rounded-xl shadow-2xl overflow-hidden pt-1 select-text"
          >
            {/* Top Jagged Tear Edge */}
            <div className="sawtooth-top -mt-1 h-3 bg-[#FAF8F3]" />

            {/* Paper Receipt Body */}
            <div className="bg-[#FAF8F3] text-[#14171A] px-4 py-4 flex flex-col space-y-4 border border-neutral-300">
              {/* Header & Barcode */}
              <div className="flex items-start justify-between border-b border-[#E6E2D8] pb-2">
                <div>
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[#656461] block">
                    Audit Receipt {scanResult.auditReceiptId}
                  </span>
                  <span className="font-mono text-xs text-[#111317] font-bold">
                    Target: @{scanResult.targetUser}
                  </span>
                </div>
                {/* Barcode line mock */}
                <div className="barcode-lines h-6 w-20 opacity-80" />
              </div>

              {/* Rubber Stamp Overlay */}
              <div className="absolute top-10 right-4 pointer-events-none transform -rotate-6">
                <div className="border border-[#00BA81] p-0.5 rounded-sm bg-emerald-50">
                  <div className="border border-[#00BA81] px-2 py-0.5 flex flex-col items-center">
                    <span className="font-mono text-[9px] text-[#00422C] font-black tracking-wider">
                      AUDIT SEALED
                    </span>
                    <span className="font-mono text-[7px] text-[#00BA81] font-bold">
                      PROOFSTACK // PROVEN
                    </span>
                  </div>
                </div>
              </div>

              {/* Core Evidence Coverage Metric */}
              <div className="space-y-0.5 pt-0.5">
                <span className="font-mono text-[9px] uppercase text-[#656461] tracking-wider block">
                  Formal Verification Assurance
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-3xl font-bold tracking-tight text-[#111317]">
                    {scanResult.coveragePct}%
                  </span>
                  <span className="font-sans text-xs font-semibold text-[#474744]">
                    Evidence Coverage
                  </span>
                </div>
                <p className="font-sans text-[11px] text-[#656461] leading-tight">
                  {scanResult.assessedCount} requirements matched against {scanResult.organization} spec.
                </p>
              </div>

              {/* Status Chips Breakdown */}
              <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
                <div className="flex items-center gap-1 bg-[#EFECE6] rounded px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00BA81]" />
                  <span className="font-medium text-[#111317]">
                    {scanResult.breakdown.proven} Proven
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#EFECE6] rounded px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFB957]" />
                  <span className="font-medium text-[#111317]">
                    {scanResult.breakdown.basic} Basic
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#EFECE6] rounded px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#90918A]" />
                  <span className="font-medium text-[#111317]">
                    {scanResult.breakdown.notShown} Not Shown
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#EFECE6] rounded px-2 py-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B7CFF]" />
                  <span className="font-medium text-[#111317]">
                    {scanResult.breakdown.unclear} Unclear
                  </span>
                </div>
              </div>

              {/* Verified Files */}
              <div className="pt-2 border-t border-[#E6E2D8] space-y-1">
                <span className="font-mono text-[9px] text-[#656461] uppercase tracking-wider block font-bold">
                  Verified Files:
                </span>
                {scanResult.verifiedFiles.map((f) => (
                  <div key={f} className="flex items-center space-x-1.5 text-[10px] font-mono text-[#14171A]">
                    <Check className="w-3 h-3 text-[#00BA81]" />
                    <span className="truncate">{f}</span>
                  </div>
                ))}
              </div>

              {/* Add to Attestation Docket */}
              <Button
                variant="solid_ink"
                size="sm"
                onClick={() => alert('Receipt #0492-ZK added to attestation docket.')}
                className="w-full text-xs font-mono justify-center"
              >
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                <span>Add to Docket</span>
              </Button>
            </div>
          </article>
        )}
      </div>
    </AppLayout>
  );
};
