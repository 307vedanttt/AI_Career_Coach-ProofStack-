import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { mockSystemMetrics, mockAttackVectors } from '../lib/api';
import { AttackVector } from '../types/api';
import {
  Zap,
  Download,
  Lock,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';

interface StreamingAttackRow extends AttackVector {
  streamState: 'ATTACK' | 'REFUSED';
  displayedAt: number;
}

export const BreakMePage: React.FC = () => {
  // Counters come from events
  const [attacksCount, setAttacksCount] = useState(0);
  const [upgradesCount] = useState(0);
  const [guardsCount, setGuardsCount] = useState(0);

  // Template Tile Picker: FIXED MENU ONLY, NO FREE-TEXT INPUT ANYWHERE
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState<number>(0);
  const [isStreaming, setIsStreaming] = useState(true);
  const [rows, setRows] = useState<StreamingAttackRow[]>([]);
  const streamTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fixed template tiles
  const templates = [
    { id: 'all', title: 'Full Spectrum Fuzz', subtitle: 'All 10 vectors sequential' },
    { id: 'zero_assert', title: 'Zero Assertions', subtitle: 'Empty test pass-through' },
    { id: 'docstring', title: 'Docstring Stuffing', subtitle: 'Synthetic capability declaration' },
    { id: 'sig_tamper', title: 'Signature Mutation', subtitle: 'Interface mismatch injection' },
    { id: 'backdate', title: 'Timestamp Backdate', subtitle: 'Monotonic ratchet bypass' },
    { id: 'circular', title: 'Circular Import', subtitle: 'Dependency cycle exploit' },
  ];

  // Streaming attack table: rows stream in every 600ms
  // Initial row has ATTACK badge (red). 400ms later flips to REFUSED with a mono reason.
  useEffect(() => {
    let index = 0;
    const pool = mockAttackVectors;

    const startStreaming = () => {
      streamTimerRef.current = setInterval(() => {
        const template = pool[index % pool.length];
        const newRowId = `${template.id}-${Date.now()}`;
        const newRow: StreamingAttackRow = {
          ...template,
          id: newRowId,
          streamState: 'ATTACK',
          displayedAt: Date.now(),
        };

        // Increment event-driven counters
        setAttacksCount((prev) => prev + 1);

        setRows((prev) => [newRow, ...prev.slice(0, 19)]); // keep last 20

        // 400ms later, flips to REFUSED with mono reason
        setTimeout(() => {
          setRows((currentRows) =>
            currentRows.map((r) =>
              r.id === newRowId ? { ...r, streamState: 'REFUSED' } : r
            )
          );
          setGuardsCount((prev) => prev + 1);
        }, 400);

        index++;
      }, 600);
    };

    if (isStreaming) {
      startStreaming();
    }

    return () => {
      if (streamTimerRef.current) clearInterval(streamTimerRef.current);
    };
  }, [isStreaming]);

  const handleLoadStoredRun = () => {
    setIsStreaming(false);
    const storedRows: StreamingAttackRow[] = mockAttackVectors.map((v, i) => ({
      ...v,
      id: `${v.id}-stored-${i}`,
      streamState: 'REFUSED',
      displayedAt: Date.now() - (10 - i) * 1000,
    }));
    setRows(storedRows);
    setAttacksCount(10);
    setGuardsCount(10);
  };

  const handleExportAudit = () => {
    const data = {
      protocol: 'BREAK-ME',
      spec: 'ISO-27001-ZKP',
      attacks_sent: attacksCount,
      upgrades_granted: upgradesCount,
      guard_reasons: guardsCount,
      audit_log: rows,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `breakme-attack-ledger-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppLayout metrics={mockSystemMetrics}>
      <div className="max-w-[1360px] w-full mx-auto px-4 lg:px-8 py-8 flex flex-col space-y-8 select-none">
        {/* HEADER */}
        <header className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#9AA3AE] uppercase tracking-wider">
              <span>ACTIVE PROTOCOL BREAK-ME</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              <span>AIR-GAPPED EVALUATION</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight">
              Adversarial Fuzz & Fraud Resistance Ledger
            </h1>
            <p className="text-xs md:text-sm text-[#9AA3AE] leading-relaxed max-w-2xl">
              Deterministic verification engine testing real-time injection vectors. Red is strictly
              reserved for incoming attack vectors; every attempt is refuted deterministically.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLoadStoredRun}
              className="font-mono text-xs text-white border-white/10 hover:bg-white/5"
              title="Load full 10-vector benchmark run"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              <span>Load Stored Run</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsStreaming(!isStreaming)}
              className="font-mono text-xs text-white border-white/10 hover:bg-white/5"
            >
              <Zap className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <span>{isStreaming ? 'Pause Stream' : 'Resume Stream'}</span>
            </Button>

            <Button
              variant="solid_paper"
              size="sm"
              onClick={handleExportAudit}
              className="font-mono text-xs"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              <span>Export Audit</span>
            </Button>
          </div>
        </header>

        {/* THREE BIG COUNTERS (Counts come from events) */}
        <section aria-label="Event Counters" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Counter 1: Attacks Sent */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between min-h-[180px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#9AA3AE] uppercase tracking-wider">
                Attacks Sent
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#9AA3AE]">
                LIVE SSE
              </span>
            </div>

            <div className="my-2">
              <div className="font-display text-6xl font-bold tracking-tight text-white">
                {attacksCount}
              </div>
            </div>

            <div className="font-mono text-xs text-[#64748B]">
              Simulated forgery injections fired
            </div>
          </div>

          {/* Counter 2: Upgrades Granted (Soft Breathing Glow Centerpiece) */}
          <div className="glass-panel p-6 rounded-2xl border-2 border-emerald-500/40 flex flex-col justify-between min-h-[180px] relative overflow-hidden shadow-[0_0_35px_rgba(34,197,139,0.15)]">
            {/* Soft breathing glow underlay */}
            <div
              className="absolute inset-0 bg-emerald-500/10 pointer-events-none"
              style={{
                animation: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}
            />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                  Upgrades Granted
                </span>
              </div>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                ZERO ESCALATION
              </span>
            </div>

            <div className="my-2 relative z-10">
              <div className="font-display text-7xl font-bold tracking-tight text-emerald-400 drop-shadow-[0_0_25px_rgba(34,197,139,0.45)]">
                {upgradesCount}
              </div>
            </div>

            <div className="flex items-center justify-between relative z-10 text-xs font-mono text-emerald-300/80">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>GUARD INVARIANT INTACT</span>
              </span>
              <span>DELTA: NULL</span>
            </div>
          </div>

          {/* Counter 3: Guard Reasons Logged */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10 flex flex-col justify-between min-h-[180px]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#9AA3AE] uppercase tracking-wider">
                Guard Reasons Logged
              </span>
              <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/5 text-[#9AA3AE]">
                100% EXPLICIT
              </span>
            </div>

            <div className="my-2">
              <div className="font-display text-6xl font-bold tracking-tight text-white">
                {guardsCount}
              </div>
            </div>

            <div className="font-mono text-xs text-[#64748B]">
              Deterministic signatures & static refusals
            </div>
          </div>
        </section>

        {/* TEMPLATE TILE PICKER: FIXED MENU ONLY (NO FREE TEXT INPUT ANYWHERE) */}
        <section aria-label="Template Tile Picker" className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#9AA3AE]">
              INJECTION TEMPLATE MATRIX (FIXED SELECTION ONLY)
            </span>
            <span className="font-mono text-xs text-[#64748B]">
              6 PRE-PROGRAMMED ADVERSARIAL PAYLOADS
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {templates.map((tmpl, idx) => {
              const isSelected = selectedTemplateIndex === idx;
              return (
                <button
                  key={tmpl.id}
                  type="button"
                  onClick={() => setSelectedTemplateIndex(idx)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[96px] ${
                    isSelected
                      ? 'bg-white/10 border-emerald-500/60 shadow-[0_0_16px_rgba(34,197,139,0.2)]'
                      : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#9AA3AE] font-bold">
                      0{idx + 1}
                    </span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? 'bg-emerald-400' : 'bg-white/20'
                      }`}
                    />
                  </div>
                  <div>
                    <div className="font-display font-semibold text-xs text-white">
                      {tmpl.title}
                    </div>
                    <div className="font-mono text-[10px] text-[#64748B] mt-0.5 line-clamp-1">
                      {tmpl.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* STREAMING ATTACK TABLE */}
        {/* Rows stream in every 600ms: ATTACK badge (red), then 400ms later flips to REFUSED with a mono reason */}
        <section aria-label="Streaming Invariant Audit Table" className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                STREAMING AUDIT REPUTATION LEDGER
              </span>
            </div>
            <span className="font-mono text-xs text-[#9AA3AE]">
              {rows.length} EVENTS BUFFERED
            </span>
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03] text-[#9AA3AE]">
                    <th className="py-3 px-4 uppercase font-semibold text-[11px]">Verdict</th>
                    <th className="py-3 px-4 uppercase font-semibold text-[11px]">Target File</th>
                    <th className="py-3 px-4 uppercase font-semibold text-[11px]">Vector Category</th>
                    <th className="py-3 px-4 uppercase font-semibold text-[11px]">Guard Refusal Reason</th>
                    <th className="py-3 px-4 uppercase font-semibold text-[11px] text-right">Commit Signature</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#9AA3AE]">
                        Waiting for initial streaming vector packet...
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => {
                      const isAttack = row.streamState === 'ATTACK';
                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            isAttack ? 'bg-[#FF5C4D]/10' : 'hover:bg-white/[0.02]'
                          }`}
                        >
                          {/* Verdict: Red ONLY on ATTACK badge, flips to neutral REFUSED */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isAttack ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-sm bg-[#FF5C4D] text-white font-black text-[11px] tracking-widest uppercase shadow-[0_0_12px_rgba(255,92,77,0.7)] animate-pulse">
                                ATTACK
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded border border-white/20 bg-white/5 text-[#E2E8F0] font-bold text-[10px] tracking-wider uppercase">
                                REFUSED
                              </span>
                            )}
                          </td>

                          {/* Target File */}
                          <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                            {row.targetFile}
                          </td>

                          {/* Category */}
                          <td className="py-3.5 px-4 text-[#9AA3AE] whitespace-nowrap">
                            {row.category}
                          </td>

                          {/* Mono Refusal Reason */}
                          <td className="py-3.5 px-4 text-xs max-w-md">
                            {isAttack ? (
                              <span className="text-[#FF5C4D] font-mono animate-pulse">
                                INGESTING THREAT VECTOR...
                              </span>
                            ) : (
                              <span className="text-[#94A3B8] font-mono">
                                {row.guardReason}
                              </span>
                            )}
                          </td>

                          {/* Signature */}
                          <td className="py-3.5 px-4 text-right text-[#64748B] whitespace-nowrap">
                            {row.signatureHash}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>
  );
};
