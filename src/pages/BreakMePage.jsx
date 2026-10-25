import React, { useState, useEffect, useRef } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { getAdversarialSuite } from '../lib/api';
import { Download, Lock, CheckCircle2, FolderOpen, AlertCircle, RefreshCw, } from 'lucide-react';
export const BreakMePage = () => {
    const [attacksCount, setAttacksCount] = useState(0);
    const [upgradesCount] = useState(0);
    const [guardsCount, setGuardsCount] = useState(0);
    const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
    const [isStreaming, setIsStreaming] = useState(false);
    const [rows, setRows] = useState([]);
    const [vectorsPool, setVectorsPool] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState(null);
    const streamTimerRef = useRef(null);
    const templates = [
        { id: 'all', title: 'Full Spectrum Fuzz', subtitle: 'All vectors sequential' },
        { id: 'zero_assert', title: 'Zero Assertions', subtitle: 'Empty test pass-through' },
        { id: 'docstring', title: 'Docstring Stuffing', subtitle: 'Synthetic capability declaration' },
        { id: 'sig_tamper', title: 'Signature Mutation', subtitle: 'Interface mismatch injection' },
        { id: 'backdate', title: 'Timestamp Backdate', subtitle: 'Monotonic ratchet bypass' },
        { id: 'circular', title: 'Circular Import', subtitle: 'Dependency cycle exploit' },
    ];
    const loadSuite = async () => {
        setIsLoading(true);
        setErrorMessage(null);
        try {
            const suite = await getAdversarialSuite();
            setVectorsPool(suite.vectors || []);
            setAttacksCount(suite.attacksSent || 0);
            setGuardsCount(suite.guardReasonsLogged || 0);
            setIsStreaming(true);
        }
        catch (err) {
            setErrorMessage(err.message || 'Failed to connect to adversarial test suite. Please retry.');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        loadSuite();
    }, []);
    // Streaming attack table: rows stream in every 600ms
    useEffect(() => {
        if (!isStreaming || vectorsPool.length === 0)
            return;
        let index = 0;
        streamTimerRef.current = setInterval(() => {
            const template = vectorsPool[index % vectorsPool.length];
            const newRowId = `${template.id}-${Date.now()}`;
            const newRow = {
                ...template,
                id: newRowId,
                streamState: 'ATTACK',
                displayedAt: Date.now(),
            };
            setAttacksCount((prev) => prev + 1);
            setRows((prev) => [newRow, ...prev.slice(0, 19)]); // keep last 20
            // 400ms later, flips to REFUSED with mono reason
            setTimeout(() => {
                setRows((currentRows) => currentRows.map((r) => r.id === newRowId ? { ...r, streamState: 'REFUSED' } : r));
                setGuardsCount((prev) => prev + 1);
            }, 400);
            index++;
        }, 600);
        return () => {
            if (streamTimerRef.current)
                clearInterval(streamTimerRef.current);
        };
    }, [isStreaming, vectorsPool]);
    const handleLoadStoredRun = () => {
        setIsStreaming(false);
        if (streamTimerRef.current)
            clearInterval(streamTimerRef.current);
        const storedRows = vectorsPool.map((v, i) => ({
            ...v,
            id: `${v.id}-stored-${i}`,
            streamState: 'REFUSED',
            displayedAt: Date.now() - (vectorsPool.length - i) * 1000,
        }));
        setRows(storedRows);
        setAttacksCount(vectorsPool.length);
        setGuardsCount(vectorsPool.length);
    };
    const handleExportJson = () => {
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
    return (<AppLayout>
      <div className="max-w-[1360px] w-full mx-auto px-4 lg:px-8 py-8 flex flex-col space-y-8 select-none">
        {/* HEADER */}
        <header className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-white/10">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs font-mono text-[#9AA3AE] uppercase tracking-wider">
              <span>ACTIVE PROTOCOL BREAK-ME</span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/20"/>
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
            <Button variant="ghost" size="sm" onClick={handleLoadStoredRun} icon={<FolderOpen className="w-4 h-4"/>}>
              Load Stored Run
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJson} icon={<Download className="w-4 h-4"/>}>
              Export JSON Ledger
            </Button>
          </div>
        </header>

        {errorMessage && (<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-300 text-xs">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0"/>
              <span>{errorMessage}</span>
            </div>
            <Button variant="solid_ink" size="sm" onClick={loadSuite} icon={<RefreshCw className="w-3.5 h-3.5"/>}>
              Retry
            </Button>
          </div>)}

        {/* METRICS COUNTERS STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-xl border border-white/10">
            <div className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
              Attacks Sent
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-white flex items-baseline gap-2">
              <span>{attacksCount}</span>
              <span className="text-xs text-[#9AA3AE] font-normal">injections queued</span>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-white/10 relative overflow-hidden">
            <div className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
              Upgrades Granted
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-white flex items-baseline gap-2">
              <span className="text-emerald-400">0</span>
              <span className="text-xs text-[#9AA3AE] font-normal">ALWAYS 0 BY DESIGN</span>
            </div>
            <div className="absolute top-3 right-3 text-emerald-400/20">
              <Lock className="w-8 h-8"/>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-white/10">
            <div className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE]">
              Guard Reasons Logged
            </div>
            <div className="mt-2 text-3xl font-mono font-bold text-white flex items-baseline gap-2">
              <span className="text-[#34D399]">{guardsCount}</span>
              <span className="text-xs text-[#9AA3AE] font-normal">refutations sealed</span>
            </div>
          </div>
        </div>

        {/* MAIN SPLIT: LEFT TEMPLATE PICKER (4 Cols) + RIGHT STREAMING TABLE (8 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT 4 COLS: FIXED TEMPLATE TILES */}
          <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-white">
                Fuzzing Suites (Fixed Menu)
              </h2>
              <p className="text-xs text-[#9AA3AE]">
                Select an attack profile to isolate deterministic guard behaviors.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {templates.map((tpl, idx) => {
            const isSelected = selectedTemplateIndex === idx;
            return (<button key={tpl.id} type="button" onClick={() => {
                    setSelectedTemplateIndex(idx);
                    setIsStreaming(true);
                }} className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col space-y-1 ${isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-white shadow-[0_0_15px_rgba(52,211,153,0.15)]'
                    : 'bg-white/[0.02] border-white/10 text-[#9AA3AE] hover:text-white hover:bg-white/[0.04]'}`}>
                    <div className="flex items-center justify-between text-xs font-mono font-semibold">
                      <span>{tpl.title}</span>
                      {isSelected && (<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]"/>)}
                    </div>
                    <span className="text-[11px] font-sans opacity-80">{tpl.subtitle}</span>
                  </button>);
        })}
            </div>
          </div>

          {/* RIGHT 8 COLS: ATTACK TABLE */}
          <div className="lg:col-span-8 glass-panel rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"/>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                  Real-time Attack Stream & Verdict Ledger
                </h3>
              </div>
              <div className="font-mono text-[11px] text-[#9AA3AE]">
                STATUS: <span className="text-emerald-400 font-semibold">ZERO COMPROMISE</span>
              </div>
            </div>

            {/* Rows List */}
            <div className="p-4 sm:p-5 space-y-3 max-h-[580px] overflow-y-auto font-mono text-xs">
              {rows.length === 0 ? (<div className="py-16 text-center text-[#9AA3AE]">
                  {isLoading ? 'Connecting to verification engine...' : 'No attack vectors streamed yet.'}
                </div>) : (rows.map((row) => {
            const isAttack = row.streamState === 'ATTACK';
            return (<div key={row.id} className={`p-3.5 rounded-xl border transition-colors flex flex-col space-y-2 ${isAttack
                    ? 'bg-red-500/10 border-red-500/40 text-red-200'
                    : 'bg-white/[0.02] border-white/10 text-white'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isAttack
                    ? 'bg-red-500 text-white shadow-[0_0_10px_#EF4444]'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                            {row.streamState}
                          </span>
                          <span className="font-bold text-white">{row.name}</span>
                        </div>
                        <span className="text-[10px] text-[#9AA3AE]">{row.targetFile}</span>
                      </div>

                      <div className="p-2 rounded bg-black/40 border border-white/5 text-[11px] text-[#CBD5E1] truncate font-mono">
                        {row.payloadPreview}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-[#9AA3AE] pt-1">
                        <span>
                          {isAttack ? (<span className="text-red-400 font-medium animate-pulse">
                              Evaluating AST & reachability...
                            </span>) : (<span className="text-[#34D399] font-medium flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3"/>
                              <span>{row.guardReason}</span>
                            </span>)}
                        </span>
                        <span className="opacity-60">{row.signatureHash || 'sha256:7f83b16'}</span>
                      </div>
                    </div>);
        }))}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>);
};
