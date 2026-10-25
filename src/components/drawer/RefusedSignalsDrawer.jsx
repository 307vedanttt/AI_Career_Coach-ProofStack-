import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Filter, Code2, AlertTriangle, RefreshCw } from 'lucide-react';
import { getRepoRejections } from '../../lib/api';
export const RefusedSignalsDrawer = ({ isOpen, onClose, repoId = 'default' }) => {
    const [rejections, setRejections] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [detectorCounts, setDetectorCounts] = useState({});
    const [activeFilter, setActiveFilter] = useState('all');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchRejections = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getRepoRejections(repoId, activeFilter === 'all' ? undefined : activeFilter);
            setRejections(data.items || []);
            setTotalCount(data.total_refused_count || (data.items || []).length);
            setDetectorCounts(data.detector_counts || {});
        }
        catch (err) {
            setError(err.message || 'Failed to load refused signals.');
        }
        finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        if (isOpen) {
            fetchRejections();
        }
    }, [isOpen, activeFilter, repoId]);
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0E1318] border-l border-white/10 shadow-2xl flex flex-col h-full text-white font-sans overflow-hidden" data-testid="refused-signals-drawer">
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-[#131920]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5"/>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-white tracking-tight">Refused Signals Ledger</h2>
                <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 font-mono text-[11px] font-bold">
                  {totalCount} Refused
                </span>
              </div>
              <p className="font-mono text-xs text-[#9AA3AE] mt-0.5">
                Zero-trust audit log of hollow, stubbed, or disconnected candidates denied skill credit
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#9AA3AE] hover:text-white transition-colors">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-3 border-b border-white/5 bg-[#10151B] flex items-center gap-2 overflow-x-auto no-scrollbar font-mono text-xs">
          <Filter className="w-3.5 h-3.5 text-[#9AA3AE] shrink-0"/>
          <button type="button" onClick={() => setActiveFilter('all')} className={`px-3 py-1 rounded-full shrink-0 transition-colors ${activeFilter === 'all'
            ? 'bg-red-500/20 text-red-300 border border-red-500/40 font-bold'
            : 'bg-white/5 text-[#9AA3AE] hover:text-white'}`}>
            All Refusals ({totalCount})
          </button>
          {Object.entries(detectorCounts).map(([det, cnt]) => (<button key={det} type="button" onClick={() => setActiveFilter(det)} className={`px-3 py-1 rounded-full shrink-0 transition-colors ${activeFilter === det
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                : 'bg-white/5 text-[#9AA3AE] hover:text-white'}`}>
              {det.replace('_detector', '')} ({cnt})
            </button>))}
          <button type="button" onClick={fetchRejections} className="ml-auto text-[#9AA3AE] hover:text-white p-1" title="Refresh rejections">
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}/>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {isLoading ? (<div className="p-12 text-center font-mono text-xs text-[#9AA3AE]">
              Scanning persisted rejection events...
            </div>) : error ? (<div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs">
              {error}
            </div>) : rejections.length === 0 ? (<div className="p-12 text-center rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <Code2 className="w-8 h-8 text-[#9AA3AE] mx-auto opacity-50"/>
              <div className="text-white font-medium text-sm">No Refused Signals Found</div>
              <p className="font-mono text-xs text-[#9AA3AE] max-w-sm mx-auto">
                All candidates survived the hollow-evidence guard, or the repository has not yet undergone full invariant evaluation.
              </p>
            </div>) : (rejections.map((item) => (<div key={item.id} className="p-4 rounded-xl bg-[#141A22] border border-white/10 hover:border-red-500/30 transition-all space-y-3">
                {/* Top Row: File & Detector Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="font-mono text-xs text-white font-semibold truncate flex items-center gap-1.5">
                    <span className="text-red-400 font-bold">File:</span>
                    <span className="underline decoration-white/20">{item.file_path}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[#9AA3AE] font-mono text-[10px] border border-white/10">
                      {item.detector} v{item.detector_version}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                      DENIED
                    </span>
                  </div>
                </div>

                {/* What We Saw: Code Snippet */}
                {item.rejected_snippet && (<div className="space-y-1">
                    <div className="font-mono text-[10px] uppercase text-[#9AA3AE] font-bold">
                      What we saw:
                    </div>
                    <pre className="p-2.5 rounded-lg bg-[#0B0E12] border border-white/5 font-mono text-xs text-amber-200/90 overflow-x-auto">
                      <code>{item.rejected_snippet}</code>
                    </pre>
                  </div>)}

                {/* Why It Does Not Count: Guard Reason */}
                <div className="space-y-1 bg-red-500/[0.04] p-3 rounded-lg border border-red-500/20">
                  <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase text-red-400 font-bold">
                    <AlertTriangle className="w-3.5 h-3.5"/>
                    <span>Why it does not count:</span>
                  </div>
                  <p className="font-sans text-xs text-red-200/90 leading-relaxed">
                    {item.guard_reason}
                  </p>
                </div>

                {/* Footer: Commit Permalink */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono text-[11px] text-[#9AA3AE]">
                  <span>Commit: {item.commit_sha.slice(0, 7)}</span>
                  <span className="text-[10px] text-[#575D65]">
                    {item.created_at ? new Date(item.created_at).toLocaleTimeString() : ''}
                  </span>
                </div>
              </div>)))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#10151B] flex items-center justify-between font-mono text-xs text-[#9AA3AE]">
          <span>Enforced by EvidenceGuard AST Analyzer</span>
          <button type="button" onClick={onClose} className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
            Close Ledger
          </button>
        </div>
      </div>
    </div>);
};
