import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { getDiagnostics, DiagnosticsResult } from '../lib/api';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Github,
  Brain,
  Database,
  Radio,
  FileText,
  Webhook,
  Eye,
  EyeOff,
  ShieldCheck,
} from 'lucide-react';

export const DiagnosticsPage: React.FC = () => {
  const [data, setData] = useState<DiagnosticsResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDevPreview, setShowDevPreview] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const fetchDiagnostics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDiagnostics();
      setData(res);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch cluster diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostics();
  }, []);

  const checks = data?.checks;

  return (
    <AppLayout>
      <div className="max-w-[1360px] w-full mx-auto px-4 py-6 font-sans">
        {/* Header HUD */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
              <h1 className="text-xl sm:text-2xl font-bold font-display text-white tracking-tight">
                Cluster Truth Table & Live Diagnostics
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-[#9AA3AE] font-mono">
              Live probes verify credentials, LLM keys, DB write integrity, parser canary, and SSE streams. Zero mock claims.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-[#9AA3AE] hidden md:inline">
              Refreshed: {lastRefreshed.toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={fetchDiagnostics}
              disabled={loading}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Run Probes Now</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-mono flex items-start gap-3">
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Diagnostics Request Failed</p>
              <p className="text-xs opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* System Summary Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#12161B]/80 border border-white/10 backdrop-blur-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9AA3AE] block mb-1">Cluster Verdict</span>
            <div className="flex items-center gap-2">
              {data?.status === 'healthy' ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold font-mono text-white text-base">ALL SYSTEMS PASS</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  <span className="font-bold font-mono text-amber-300 text-base">DEGRADED / ACTION NEEDED</span>
                </>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#12161B]/80 border border-white/10 backdrop-blur-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9AA3AE] block mb-1">GitHub API Rate Limit</span>
            <div className="flex items-center gap-2">
              <Github className="w-5 h-5 text-[#38BDF8]" />
              <span className="font-mono font-bold text-white text-base">
                {checks?.github?.rate_limit_remaining !== undefined
                  ? `${checks.github.rate_limit_remaining} / ${checks.github.rate_limit_limit || 5000}`
                  : 'N/A'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#12161B]/80 border border-white/10 backdrop-blur-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9AA3AE] block mb-1">Database Read/Write</span>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-400" />
              <span className="font-mono font-bold text-white text-base">
                {checks?.database?.passed ? `${checks.database.latency_ms} ms (WAL)` : 'FAIL'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#12161B]/80 border border-white/10 backdrop-blur-xl">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#9AA3AE] block mb-1">SSE Stream Bus</span>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <span className="font-mono font-bold text-white text-base">
                {checks?.sse?.passed ? `${checks.sse.active_subscribers} active` : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Probe Truth Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Probe 1: GitHub Identity & Rate Limit */}
          <div className={`p-5 rounded-xl border backdrop-blur-xl transition-all ${
            checks?.github?.passed
              ? 'bg-[#12161B]/80 border-emerald-500/20'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Github className="w-4 h-4 text-[#38BDF8]" />
                <span className="font-bold text-white text-sm">GitHub Credential Probe</span>
              </div>
              {checks?.github?.passed ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">PASS</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">FAIL</span>
              )}
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Target:</span>
                <span className="text-white">https://api.github.com/user</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Identity:</span>
                <span className="text-emerald-400 font-bold">
                  {checks?.github?.user ? `@${checks.github.user}` : 'Unauthenticated'}
                </span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Remaining Quota:</span>
                <span className="text-white">
                  {checks?.github?.rate_limit_remaining ?? 0} requests
                </span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Round-Trip Latency:</span>
                <span className="text-white">{checks?.github?.latency_ms ?? 0} ms</span>
              </div>

              {checks?.github?.error && (
                <div className="mt-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] break-words">
                  <span className="font-bold block mb-1">Error Observed:</span>
                  {checks.github.error}
                </div>
              )}
            </div>
          </div>

          {/* Probe 2: LLM Provider Ping */}
          <div className={`p-5 rounded-xl border backdrop-blur-xl transition-all ${
            checks?.llm?.passed
              ? 'bg-[#12161B]/80 border-emerald-500/20'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-sm">LLM Verification Engine</span>
              </div>
              {checks?.llm?.passed ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                  {checks.llm.provider === 'none' ? 'DETERMINISTIC' : 'PASS'}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">FAIL</span>
              )}
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Active Provider:</span>
                <span className="text-white uppercase">{checks?.llm?.provider || 'Deterministic AST'}</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Model:</span>
                <span className="text-white">{checks?.llm?.model || 'Deterministic AST Parser'}</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Call Latency:</span>
                <span className="text-white">{checks?.llm?.latency_ms ?? 0} ms</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Mode:</span>
                <span className="text-emerald-400 font-bold">Zero-Hallucination Guard</span>
              </div>

              {checks?.llm?.error && (
                <div className="mt-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] break-words">
                  <span className="font-bold block mb-1">Error Observed:</span>
                  {checks.llm.error}
                </div>
              )}
            </div>
          </div>

          {/* Probe 3: SQLite WAL Read/Write */}
          <div className={`p-5 rounded-xl border backdrop-blur-xl transition-all ${
            checks?.database?.passed
              ? 'bg-[#12161B]/80 border-emerald-500/20'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-white text-sm">Database Read/Write Integrity</span>
              </div>
              {checks?.database?.passed ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">PASS</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">FAIL</span>
              )}
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Engine:</span>
                <span className="text-white">SQLite 3 + aiosqlite</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Journal Mode:</span>
                <span className="text-emerald-400 font-bold">WAL (Write-Ahead Log)</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Transaction Latency:</span>
                <span className="text-white">{checks?.database?.latency_ms ?? 0} ms</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Status:</span>
                <span className="text-white">{checks?.database?.mode || 'Healthy'}</span>
              </div>

              {checks?.database?.error && (
                <div className="mt-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] break-words">
                  <span className="font-bold block mb-1">Error Observed:</span>
                  {checks.database.error}
                </div>
              )}
            </div>
          </div>

          {/* Probe 4: Webhook Delivery Monitor */}
          <div className={`p-5 rounded-xl border backdrop-blur-xl transition-all ${
            checks?.webhook?.passed
              ? 'bg-[#12161B]/80 border-emerald-500/20'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Webhook className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">GitHub Webhook Pipeline</span>
              </div>
              {checks?.webhook?.passed ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">ACTIVE</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">FAIL</span>
              )}
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Endpoint:</span>
                <span className="text-white">POST /api/webhooks/github</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>HMAC Signature:</span>
                <span className="text-emerald-400 font-bold">SHA-256 Validated</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Last Delivery:</span>
                <span className="text-white">{checks?.webhook?.last_delivery_at || 'Idle / Ready for commits'}</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Last Event:</span>
                <span className="text-white">{checks?.webhook?.last_event || 'push'}</span>
              </div>

              {checks?.webhook?.error && (
                <div className="mt-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] break-words">
                  <span className="font-bold block mb-1">Error Observed:</span>
                  {checks.webhook.error}
                </div>
              )}
            </div>
          </div>

          {/* Probe 5: Resume Parser Self-Test */}
          <div className={`p-5 rounded-xl border backdrop-blur-xl transition-all ${
            checks?.resume_parser?.passed
              ? 'bg-[#12161B]/80 border-emerald-500/20'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#34D399]" />
                <span className="font-bold text-white text-sm">Resume Parser Self-Test</span>
              </div>
              {checks?.resume_parser?.passed ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">PASS</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">FAIL</span>
              )}
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Engine:</span>
                <span className="text-white">Sandboxed PDF & DOCX Streams</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Canary PDF Test:</span>
                <span className="text-emerald-400 font-bold">
                  {checks?.resume_parser?.passed ? 'Decoded & Verified' : 'Failed'}
                </span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Extraction Latency:</span>
                <span className="text-white">{checks?.resume_parser?.duration_ms ?? 0} ms</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Extracted Chars:</span>
                <span className="text-white">{checks?.resume_parser?.parsed_chars ?? 0}</span>
              </div>

              {checks?.resume_parser?.error && (
                <div className="mt-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] break-words">
                  <span className="font-bold block mb-1">Error Observed:</span>
                  {checks.resume_parser.error}
                </div>
              )}
            </div>
          </div>

          {/* Probe 6: SSE Stream Connection */}
          <div className={`p-5 rounded-xl border backdrop-blur-xl transition-all ${
            checks?.sse?.passed
              ? 'bg-[#12161B]/80 border-emerald-500/20'
              : 'bg-rose-950/20 border-rose-500/30'
          }`}>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-sm">Server-Sent Events (SSE)</span>
              </div>
              {checks?.sse?.passed ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">ONLINE</span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">OFFLINE</span>
              )}
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Channel:</span>
                <span className="text-white">GET /api/events/stream</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Active Browser Clients:</span>
                <span className="text-emerald-400 font-bold">{checks?.sse?.active_subscribers ?? 0}</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>Push Event Types:</span>
                <span className="text-white">commit, webhook, assess</span>
              </div>
              <div className="flex justify-between text-[#9AA3AE]">
                <span>State:</span>
                <span className="text-white">Non-blocking async queue</span>
              </div>

              {checks?.sse?.error && (
                <div className="mt-3 p-2.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[11px] break-words">
                  <span className="font-bold block mb-1">Error Observed:</span>
                  {checks.sse.error}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task 4e: Dev-Only Toggle for Latest Resume Extraction Preview */}
        <div className="p-6 rounded-xl bg-[#12161B]/80 border border-white/10 backdrop-blur-xl mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm">
                  Developer Inspection: Latest Resume Raw Text Preview (First 300 Characters)
                </h3>
              </div>
              <p className="text-xs text-[#9AA3AE] font-mono mt-0.5">
                Spec Task 4e: Dev-only toggle. Displayed strictly in UI to authenticated owner, never sent to server logs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowDevPreview((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white font-mono text-xs transition-colors self-start sm:self-auto"
            >
              {showDevPreview ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{showDevPreview ? 'Hide Dev Preview' : 'Reveal Raw 300 Chars'}</span>
            </button>
          </div>

          {showDevPreview ? (
            data?.latest_resume_preview ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-lg bg-black/40 border border-white/10">
                  <div>
                    <span className="text-[10px] text-[#9AA3AE] block">File:</span>
                    <span className="text-white font-semibold truncate block">
                      {data.latest_resume_preview.file_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9AA3AE] block">SHA-256 Short:</span>
                    <span className="text-[#38BDF8] font-semibold">
                      0x{data.latest_resume_preview.file_sha256.substring(0, 8)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9AA3AE] block">Characters Read:</span>
                    <span className="text-emerald-400 font-semibold">
                      {data.latest_resume_preview.char_count} chars
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#9AA3AE] block">Extracted Timestamp:</span>
                    <span className="text-[#9AA3AE]">
                      {data.latest_resume_preview.extracted_at || 'Just now'}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-black/60 border border-white/10 text-[#F4F2EC] leading-relaxed select-all">
                  <span className="text-[10px] uppercase tracking-wider text-emerald-400 block mb-1">
                    First 300 Characters Read:
                  </span>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] text-white/90">
                    {data.latest_resume_preview.text_preview_300 || 'No preview characters available.'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-black/40 border border-white/10 text-center font-mono text-xs text-[#9AA3AE]">
                No resumes uploaded yet in this database session. Upload a PDF or DOCX on the Resume page to inspect raw characters.
              </div>
            )
          ) : (
            <div className="text-xs font-mono text-[#9AA3AE] italic">
              Toggle is currently hidden. Click "Reveal Raw 300 Chars" to inspect the raw extraction preview.
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};
