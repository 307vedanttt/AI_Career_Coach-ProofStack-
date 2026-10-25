import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, HelpCircle, RefreshCw, Download, ArrowRight, Shield, Code2, Copy, Check, FileSearch, Sparkles, UploadCloud, } from 'lucide-react';
import { Button } from '../ui/Button';
import { runAtsAnalysis, getLatestAtsAnalysis } from '../../lib/api';
export const AtsReadabilityPanel = ({ resumeId = 'latest', postingId, initialData, onUploadNewVersion, }) => {
    const [data, setData] = useState(initialData || null);
    const [previousData, setPreviousData] = useState(null);
    const [loading, setLoading] = useState(!initialData);
    const [error, setError] = useState(null);
    // Sensitivity weight mode
    const [weightMode, setWeightMode] = useState('standard');
    // Filter tabs for readability checks
    const [checkFilter, setCheckFilter] = useState('all');
    // Filter tabs for keyword terms
    const [keywordFilter, setKeywordFilter] = useState('all');
    // Comparison modal state
    const [showComparison, setShowComparison] = useState(false);
    // Accepted suggestions tracker
    const [acceptedSuggestions, setAcceptedSuggestions] = useState(new Set());
    const [copiedSuggestionId, setCopiedSuggestionId] = useState(null);
    const [copiedPlainText, setCopiedPlainText] = useState(false);
    // Fetch initial ATS analysis if not provided
    const loadAtsData = async (forceRerun = false) => {
        setLoading(true);
        setError(null);
        try {
            if (!forceRerun) {
                const latest = await getLatestAtsAnalysis(resumeId);
                if (latest) {
                    setData(latest);
                    setLoading(false);
                    return;
                }
            }
            const res = await runAtsAnalysis(resumeId, postingId);
            if (data && res.id !== data.id) {
                setPreviousData(data);
                setShowComparison(true);
            }
            setData(res);
        }
        catch (err) {
            setError(err?.message || 'Failed to calculate ATS readability analysis.');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (!initialData) {
            loadAtsData(false);
        }
    }, [resumeId, postingId]);
    // Handle sensitivity score display
    const activeScore = (() => {
        if (!data?.score_data)
            return null;
        if (data.score_data.cannot_assess || data.score_data.score === null)
            return null;
        if (weightMode === 'structure')
            return data.score_data.sensitivity_ranges?.structure_80_20 ?? data.score_data.score;
        if (weightMode === 'content')
            return data.score_data.sensitivity_ranges?.content_60_40 ?? data.score_data.score;
        return data.score_data.sensitivity_ranges?.standard_70_30 ?? data.score_data.score;
    })();
    const activeWeights = (() => {
        if (weightMode === 'structure')
            return { r: 80, k: 20 };
        if (weightMode === 'content')
            return { r: 60, k: 40 };
        return { r: 70, k: 30 };
    })();
    // Filtered checks
    const filteredChecks = (data?.readability_checks || []).filter((c) => {
        if (checkFilter === 'all')
            return true;
        return c.status === checkFilter;
    });
    // Filtered keyword terms
    const filteredTerms = (data?.keyword_coverage?.terms || []).filter((t) => {
        if (keywordFilter === 'found')
            return t.status === 'found';
        if (keywordFilter === 'not_found')
            return t.status === 'not_found';
        if (keywordFilter === 'unproven') {
            const isDemonstrated = t.code_status.toLowerCase().includes('demonstrated') && !t.code_status.toLowerCase().includes('not demonstrated');
            return t.status === 'found' && !isDemonstrated;
        }
        return true;
    });
    // Handle plain text export download
    const handleDownloadPlainText = () => {
        if (!data?.plain_text_export)
            return;
        const blob = new Blob([data.plain_text_export], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${data.file_name.replace(/\.[^/.]+$/, '')}_ats_friendly.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    // Copy plain text to clipboard
    const handleCopyPlainText = () => {
        if (!data?.plain_text_export)
            return;
        navigator.clipboard.writeText(data.plain_text_export);
        setCopiedPlainText(true);
        setTimeout(() => setCopiedPlainText(false), 2000);
    };
    // Copy suggestion text
    const handleAcceptSuggestion = (sug) => {
        navigator.clipboard.writeText(sug.after);
        setAcceptedSuggestions((prev) => new Set([...prev, sug.id]));
        setCopiedSuggestionId(sug.id);
        setTimeout(() => setCopiedSuggestionId(null), 2500);
    };
    // Score color helper
    const getScoreColor = (score) => {
        if (score === null)
            return 'text-[#9AA3AE]';
        if (score >= 80)
            return 'text-emerald-400';
        if (score >= 60)
            return 'text-amber-400';
        return 'text-rose-400';
    };
    const getScoreBorderColor = (score) => {
        if (score === null)
            return 'stroke-neutral-700';
        if (score >= 80)
            return 'stroke-emerald-500';
        if (score >= 60)
            return 'stroke-amber-500';
        return 'stroke-rose-500';
    };
    if (loading) {
        return (<div className="w-full bg-[#111317] border border-white/10 rounded-xl p-8 sm:p-12 flex flex-col items-center justify-center text-center my-6">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-4"/>
        <h3 className="text-lg font-semibold text-white mb-2">Analyzing ATS Readability & Parsing Layout...</h3>
        <p className="text-xs text-[#9AA3AE] max-w-md font-mono">
          Extracting text hierarchy, validating column flow, inspecting margin headers, and matching posting requirements.
        </p>
      </div>);
    }
    if (error || !data) {
        return (<div className="w-full bg-[#181113] border border-rose-500/30 rounded-xl p-6 sm:p-8 my-6">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <AlertTriangle className="w-6 h-6"/>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-white mb-1">ATS Friendliness Check Unavailable</h3>
            <p className="text-xs text-rose-300 font-mono mb-4">{error || 'Could not load analysis.'}</p>
            <Button onClick={() => loadAtsData(true)} variant="outline" className="text-xs border-rose-500/40 text-rose-300 hover:bg-rose-500/10">
              <RefreshCw className="w-3.5 h-3.5 mr-2"/>
              Retry Analysis
            </Button>
          </div>
        </div>
      </div>);
    }
    const { score_data, layout_metadata, extraction_preview, keyword_coverage, suggestions } = data;
    return (<div className="w-full space-y-8 select-text">
      {/* ======================================================== */}
      {/* 1. SCORE HEADER PANEL & SENSITIVITY RANGE                */}
      {/* ======================================================== */}
      <section className="bg-[#111317] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-3xl pointer-events-none rounded-full"/>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
              <span>DETERMINISTIC HEURISTIC PARSER • v{data.ruleset_version}</span>
              {data.cached && (<span className="bg-white/5 border border-white/10 text-neutral-400 px-2 py-0.5 rounded text-[10px]">
                  VERIFIED CACHE
                </span>)}
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              ATS Readability & Structural Parsing
            </h2>
            {/* EXACT MANDATED LABEL */}
            <p className="text-xs sm:text-sm text-[#9AA3AE] mt-1 font-mono">
              {score_data.score_label}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => loadAtsData(true)} variant="outline" className="text-xs bg-white/5 border-white/10 text-[#9AA3AE] hover:text-white">
              <RefreshCw className="w-3.5 h-3.5 mr-2"/>
              Re-run
            </Button>

            {onUploadNewVersion && (<Button onClick={onUploadNewVersion} className="text-xs bg-emerald-500 text-[#0A0C0F] font-semibold hover:bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                <UploadCloud className="w-3.5 h-3.5 mr-2"/>
                Upload New Version
              </Button>)}

            <Button onClick={handleDownloadPlainText} variant="outline" className="text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10">
              <Download className="w-3.5 h-3.5 mr-2"/>
              Export Plain Text (.txt)
            </Button>
          </div>
        </div>

        {/* Score Ring & Arithmetic Presentation */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6 items-center">
          {/* Ring Widget */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-xl text-center">
            {score_data.cannot_assess ? (<div className="flex flex-col items-center justify-center py-4">
                <AlertTriangle className="w-12 h-12 text-amber-400 mb-2"/>
                <span className="text-base font-bold text-amber-400">Cannot assess: no readable text</span>
                <span className="text-xs text-[#9AA3AE] mt-1 max-w-xs font-mono">
                  {score_data.cannot_assess_reason || 'Document contains no parsable text layer.'}
                </span>
              </div>) : (<>
                <div className="relative w-36 h-36 flex items-center justify-center mb-3">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" className="stroke-neutral-800" strokeWidth="8" fill="transparent"/>
                    <circle cx="50" cy="50" r="40" className={`${getScoreBorderColor(activeScore)} transition-all duration-700 ease-out`} strokeWidth="8" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * (activeScore || 0)) / 100} strokeLinecap="round" fill="transparent"/>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-4xl font-bold font-mono tracking-tight ${getScoreColor(activeScore)}`}>
                      {activeScore?.toFixed(0)}%
                    </span>
                    <span className="text-[10px] uppercase font-mono text-neutral-400">Readability</span>
                  </div>
                </div>

                {/* EXACT MANDATED COUNT LABEL */}
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-emerald-300">
                  {score_data.counts_label}
                </div>
              </>)}
          </div>

          {/* Formula & Sensitivity Presets */}
          <div className="md:col-span-8 flex flex-col justify-between h-full space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-[#9AA3AE] uppercase tracking-wider">
                  Weight Sensitivity Presets
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Readability ({activeWeights.r}%) + Keywords ({activeWeights.k}%)
                </span>
              </div>

              {/* Weight Presets Toggle */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-white/5 rounded-xl border border-white/10">
                <button type="button" onClick={() => setWeightMode('standard')} className={`py-2 px-3 rounded-lg text-xs font-mono transition-all text-center ${weightMode === 'standard'
            ? 'bg-emerald-500 text-[#0A0C0F] font-bold shadow-md'
            : 'text-[#9AA3AE] hover:text-white'}`}>
                  <div>Standard Heuristic</div>
                  <div className="text-[10px] opacity-80">
                    70/30 • {score_data.sensitivity_ranges?.standard_70_30 ?? 'N/A'}%
                  </div>
                </button>

                <button type="button" onClick={() => setWeightMode('structure')} className={`py-2 px-3 rounded-lg text-xs font-mono transition-all text-center ${weightMode === 'structure'
            ? 'bg-emerald-500 text-[#0A0C0F] font-bold shadow-md'
            : 'text-[#9AA3AE] hover:text-white'}`}>
                  <div>Structure Focus</div>
                  <div className="text-[10px] opacity-80">
                    80/20 • {score_data.sensitivity_ranges?.structure_80_20 ?? 'N/A'}%
                  </div>
                </button>

                <button type="button" onClick={() => setWeightMode('content')} className={`py-2 px-3 rounded-lg text-xs font-mono transition-all text-center ${weightMode === 'content'
            ? 'bg-emerald-500 text-[#0A0C0F] font-bold shadow-md'
            : 'text-[#9AA3AE] hover:text-white'}`}>
                  <div>Content Focus</div>
                  <div className="text-[10px] opacity-80">
                    60/40 • {score_data.sensitivity_ranges?.content_60_40 ?? 'N/A'}%
                  </div>
                </button>
              </div>
            </div>

            {/* Arithmetic Formula Display */}
            <div className="p-3.5 bg-black/40 border border-white/5 rounded-xl font-mono text-xs">
              <div className="text-[#9AA3AE] text-[11px] mb-1 flex items-center justify-between">
                <span>Deterministic Arithmetic Breakdown</span>
                <span>Versioned Rule Engine</span>
              </div>
              <div className="text-emerald-400 font-semibold break-all">
                {score_data.formula}
              </div>
              <div className="mt-2 text-[11px] text-neutral-400 flex flex-wrap gap-4">
                <span>
                  Readability Base: <strong className="text-white">{score_data.readability_score ?? 'N/A'}%</strong>
                </span>
                <span>
                  Keyword Coverage: <strong className="text-white">{score_data.keyword_score ?? 'N/A'}%</strong>
                </span>
                {score_data.excluded_count > 0 && (<span className="text-amber-400">
                    Excluded (Cannot Assess): {score_data.excluded_count}
                  </span>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. EXTRACTION PREVIEW: WHAT AN ATS WOULD LIKELY READ     */}
      {/* ======================================================== */}
      <section className="bg-[#111317] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
              <FileSearch className="w-3.5 h-3.5 text-emerald-400"/>
              <span>PARSER EXTRACTION PREVIEW</span>
            </div>
            <h3 className="text-xl font-display font-bold text-white">
              What an ATS Would Likely Read
            </h3>
            <p className="text-xs text-[#9AA3AE] mt-0.5 font-mono">
              Raw plain-text stream ordered by reading column coordinates and detected section landmarks.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={handleCopyPlainText} variant="outline" className="text-xs bg-white/5 border-white/10 text-neutral-300 hover:text-white">
              {copiedPlainText ? <Check className="w-3.5 h-3.5 text-emerald-400 mr-1.5"/> : <Copy className="w-3.5 h-3.5 mr-1.5"/>}
              {copiedPlainText ? 'Copied' : 'Copy Plain Text'}
            </Button>
          </div>
        </div>

        {/* Side-by-Side: Left Layout Facts vs Right Extracted Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Document Layout Metadata Facts */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE] mb-3">
              Document Layout Facts
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-neutral-400 block text-[10px] uppercase">Format & Size</span>
                <span className="text-white font-semibold uppercase">{layout_metadata.file_type}</span>
                <span className="text-neutral-400 text-[10px] block">
                  {Math.round(layout_metadata.file_size_bytes / 1024)} KB
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-neutral-400 block text-[10px] uppercase">Page Count</span>
                <span className={`font-semibold ${layout_metadata.page_count <= 2 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {layout_metadata.page_count} {layout_metadata.page_count === 1 ? 'Page' : 'Pages'}
                </span>
                <span className="text-neutral-400 text-[10px] block">
                  {layout_metadata.page_count <= 2 ? 'Ideal 1-2 pages' : 'Over standard length'}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-neutral-400 block text-[10px] uppercase">Columns Detected</span>
                <span className={`font-semibold ${layout_metadata.columns_detected === 1 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {layout_metadata.columns_detected}-Column Flow
                </span>
                <span className="text-neutral-400 text-[10px] block">
                  {layout_metadata.columns_detected === 1 ? 'Reading order safe' : 'Scramble risk'}
                </span>
              </div>

              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                <span className="text-neutral-400 block text-[10px] uppercase">Tables & Boxes</span>
                <span className="text-white font-semibold">
                  {layout_metadata.tables_count} Tables • {layout_metadata.text_boxes_count} Boxes
                </span>
                <span className="text-neutral-400 text-[10px] block">
                  {layout_metadata.tables_count === 0 && layout_metadata.text_boxes_count === 0 ? 'Clean flow' : 'Check parser order'}
                </span>
              </div>
            </div>

            {/* Trapped Headers Warning */}
            {layout_metadata.headers_footers_content.length > 0 && (<div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-mono">
                <span className="text-amber-400 font-semibold block mb-1">Margin Content Detected</span>
                <p className="text-amber-300/80 text-[11px] leading-relaxed">
                  {layout_metadata.headers_footers_content.join(' • ')}
                </p>
              </div>)}

            {/* Hidden Text Warning */}
            {layout_metadata.hidden_or_white_text.length > 0 && (<div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-xs font-mono">
                <span className="text-purple-400 font-semibold block mb-1">
                  Hidden / White Text ({layout_metadata.hidden_or_white_text.length} items flagged)
                </span>
                <p className="text-purple-300/80 text-[11px]">
                  Informational review: tiny or matching font color detected in document layer.
                </p>
              </div>)}

            {/* Detected Sections */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE] block mb-2">
                Detected Headings ({extraction_preview.detected_sections.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {extraction_preview.detected_sections.map((sec, idx) => (<span key={idx} className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                    {sec.heading} ({sec.standard_name})
                  </span>))}
              </div>
            </div>
          </div>

          {/* Right: Plain Extracted Text Stream */}
          <div className="lg:col-span-7 flex flex-col">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE] mb-3">
              Extracted Linear Text Stream
            </h4>
            <div className="w-full h-[380px] bg-black/60 border border-white/10 rounded-xl p-4 font-mono text-xs text-neutral-300 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text shadow-inner">
              {extraction_preview.plain_text || 'Cannot assess: no readable text'}
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. READABILITY CHECKS BREAKDOWN                          */}
      {/* ======================================================== */}
      <section className="bg-[#111317] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              Deterministic Readability Checks
            </h3>
            <p className="text-xs text-[#9AA3AE] mt-0.5 font-mono">
              Evaluated strictly against published ruleset v{data.ruleset_version}. The LLM never sets or alters scores.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10 text-xs font-mono">
            <button type="button" onClick={() => setCheckFilter('all')} className={`px-2.5 py-1 rounded-md transition-all ${checkFilter === 'all' ? 'bg-emerald-500 text-[#0A0C0F] font-semibold' : 'text-[#9AA3AE] hover:text-white'}`}>
              All ({data.readability_checks.length})
            </button>
            <button type="button" onClick={() => setCheckFilter('pass')} className={`px-2.5 py-1 rounded-md transition-all ${checkFilter === 'pass' ? 'bg-emerald-500 text-[#0A0C0F] font-semibold' : 'text-[#9AA3AE] hover:text-white'}`}>
              Pass ({data.readability_checks.filter((c) => c.status === 'pass').length})
            </button>
            <button type="button" onClick={() => setCheckFilter('needs_attention')} className={`px-2.5 py-1 rounded-md transition-all ${checkFilter === 'needs_attention' ? 'bg-amber-500 text-[#0A0C0F] font-semibold' : 'text-[#9AA3AE] hover:text-white'}`}>
              Needs Attention ({data.readability_checks.filter((c) => c.status === 'needs_attention').length})
            </button>
            <button type="button" onClick={() => setCheckFilter('cannot_assess')} className={`px-2.5 py-1 rounded-md transition-all ${checkFilter === 'cannot_assess' ? 'bg-neutral-600 text-white font-semibold' : 'text-[#9AA3AE] hover:text-white'}`}>
              Cannot Assess ({data.readability_checks.filter((c) => c.status === 'cannot_assess').length})
            </button>
          </div>
        </div>

        {/* Checks List */}
        <div className="space-y-3">
          {filteredChecks.map((check) => {
            const isPass = check.status === 'pass';
            const isAttention = check.status === 'needs_attention';
            const isCannotAssess = check.status === 'cannot_assess';
            return (<div key={check.code} className={`p-4 rounded-xl border transition-all ${isPass
                    ? 'bg-emerald-500/[0.02] border-emerald-500/20'
                    : isAttention
                        ? 'bg-amber-500/[0.03] border-amber-500/30'
                        : 'bg-white/[0.02] border-white/10'}`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    {isPass && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0"/>}
                    {isAttention && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0"/>}
                    {isCannotAssess && <HelpCircle className="w-4 h-4 text-neutral-400 shrink-0"/>}

                    <span className="font-semibold text-white text-sm">{check.title}</span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
                      {check.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="text-neutral-500 text-[11px]">weight: {check.weight}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isPass
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : isAttention
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-white/10 text-neutral-300'}`}>
                      {check.status === 'needs_attention' ? 'Needs Attention' : check.status === 'pass' ? 'Pass' : 'Cannot Assess'}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#9AA3AE] font-mono mb-2">{check.reason}</p>

                {check.evidence && (<div className="bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono text-[11px] text-neutral-300 mb-2">
                    <span className="text-neutral-500 uppercase text-[10px] block mb-0.5">Evidence:</span>
                    {check.evidence}
                  </div>)}

                {check.concrete_fix && isAttention && (<div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 font-mono text-[11px] text-amber-300">
                    <span className="text-amber-400 uppercase text-[10px] font-bold block mb-0.5">Concrete Fix:</span>
                    {check.concrete_fix}
                  </div>)}
              </div>);
        })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. KEYWORD COVERAGE AGAINST REAL POSTING                 */}
      {/* ======================================================== */}
      <section className="bg-[#111317] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
              <Code2 className="w-3.5 h-3.5 text-emerald-400"/>
              <span>POSTING REQUIREMENT EXTRACTION</span>
            </div>
            {/* EXACT MANDATED SUMMARY LINE */}
            <h3 className="text-xl font-display font-bold text-white">
              {keyword_coverage.summary}
            </h3>
            {/* EXACT MANDATED DISCLAIMER LINE */}
            <p className="text-xs text-emerald-400 mt-1 font-mono font-medium">
              {keyword_coverage.disclaimer}
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white/5 rounded-lg border border-white/10 text-xs font-mono">
            <button type="button" onClick={() => setKeywordFilter('all')} className={`px-2.5 py-1 rounded-md transition-all ${keywordFilter === 'all' ? 'bg-emerald-500 text-[#0A0C0F] font-semibold' : 'text-[#9AA3AE] hover:text-white'}`}>
              All ({keyword_coverage.terms.length})
            </button>
            <button type="button" onClick={() => setKeywordFilter('found')} className={`px-2.5 py-1 rounded-md transition-all ${keywordFilter === 'found' ? 'bg-emerald-500 text-[#0A0C0F] font-semibold' : 'text-[#9AA3AE] hover:text-white'}`}>
              Found ({keyword_coverage.terms.filter((t) => t.status === 'found').length})
            </button>
            <button type="button" onClick={() => setKeywordFilter('not_found')} className={`px-2.5 py-1 rounded-md transition-all ${keywordFilter === 'not_found' ? 'bg-amber-500 text-[#0A0C0F] font-semibold' : 'text-[#9AA3AE] hover:text-white'}`}>
              Not Found ({keyword_coverage.terms.filter((t) => t.status === 'not_found').length})
            </button>
            <button type="button" onClick={() => setKeywordFilter('unproven')} className={`px-2.5 py-1 rounded-md transition-all ${keywordFilter === 'unproven' ? 'bg-purple-600 text-white font-semibold' : 'text-[#9AA3AE] hover:text-white'}`}>
              Claimed / Unproven
            </button>
          </div>
        </div>

        {/* Requirements Terms Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTerms.map((term, idx) => {
            const isFound = term.status === 'found';
            const isDemonstrated = term.code_status.toLowerCase().includes('demonstrated') &&
                !term.code_status.toLowerCase().includes('not demonstrated');
            const isClaimedUnproven = isFound && !isDemonstrated;
            return (<div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between font-mono text-xs ${isFound
                    ? 'bg-emerald-500/[0.02] border-emerald-500/20'
                    : 'bg-white/[0.02] border-white/10'}`}>
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-sm font-bold text-white block">{term.label}</span>
                      {term.matched_alias && (<span className="text-[10px] text-emerald-400">
                          Matched alias: "{term.matched_alias}"
                        </span>)}
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isFound
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/10 text-neutral-400'}`}>
                        {isFound ? 'Found in text' : 'Not found in the resume text'}
                      </span>

                      {/* ProofStack Cross-Link Status */}
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${isDemonstrated
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-neutral-800 text-neutral-400'}`}>
                        Code: {term.code_status}
                      </span>
                    </div>
                  </div>

                  {/* Context Quote */}
                  {isFound && term.resume_sentence && (<div className="bg-black/30 p-2 rounded-lg border border-white/5 text-[11px] text-neutral-300 mb-2">
                      <span className="text-[10px] text-neutral-500 block">Resume Context:</span>
                      "{term.resume_sentence}"
                    </div>)}

                  {!isFound && term.job_sentence && (<div className="bg-black/30 p-2 rounded-lg border border-white/5 text-[11px] text-neutral-400 mb-2">
                      <span className="text-[10px] text-neutral-500 block">Posting Requirement:</span>
                      "{term.job_sentence}"
                    </div>)}

                  {/* Wording for gaps (Never says 'lacks') */}
                  {!isFound && (<div className="text-[11px] text-neutral-400">
                      <span>{term.wording} </span>
                      <span className="text-emerald-400 block mt-0.5">{term.note}</span>
                    </div>)}
                </div>

                {/* Claimed, not shown in repos warning */}
                {isClaimedUnproven && (<div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[10px] text-amber-300">
                    <strong className="block text-amber-400 uppercase">Claimed, not shown in your repos</strong>
                    This term appears in your resume but lacks verified commit artifacts in your connected repository.
                    Never encouraged for artificial stuffing.
                  </div>)}
              </div>);
        })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. RECOMMENDATIONS & CODE-PROVEN SUGGESTIONS            */}
      {/* ======================================================== */}
      <section className="bg-[#111317] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-400 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400"/>
              <span>DETERMINISTIC & CODE-PROVEN SUGGESTIONS</span>
            </div>
            <h3 className="text-xl font-display font-bold text-white">
              Actionable Recommendations
            </h3>
            <p className="text-xs text-[#9AA3AE] mt-0.5 font-mono">
              Recommendations only. Never counted as evidence and never auto-applied to your file.
            </p>
          </div>
        </div>

        {suggestions.length === 0 ? (<div className="p-8 text-center bg-white/[0.02] border border-white/5 rounded-xl text-neutral-400 font-mono text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2"/>
            No structural fixes or missing code-proven skills detected. Your resume structure conforms to standard parsing order.
          </div>) : (<div className="space-y-4">
            {suggestions.map((sug) => {
                const isAccepted = acceptedSuggestions.has(sug.id);
                const isCopied = copiedSuggestionId === sug.id;
                return (<div key={sug.id} className={`p-5 rounded-xl border-2 border-dashed transition-all ${isAccepted
                        ? 'bg-emerald-500/[0.03] border-emerald-500/40'
                        : 'bg-white/[0.02] border-white/15 hover:border-white/30'}`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <span className="text-sm font-bold text-white block">{sug.title}</span>
                      <span className="text-xs text-[#9AA3AE] font-mono">{sug.reason}</span>
                    </div>

                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
                      {sug.category}
                    </span>
                  </div>

                  {/* Before / After comparison */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 font-mono text-xs">
                    <div className="p-3 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                        Current / Before:
                      </span>
                      <p className="text-neutral-300 text-[11px] leading-relaxed">{sug.before}</p>
                    </div>

                    <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg">
                      <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                        Recommended Fix / After:
                      </span>
                      <p className="text-white text-[11px] leading-relaxed font-medium">{sug.after}</p>
                    </div>
                  </div>

                  {sug.proven_evidence_ref && (<div className="flex items-center gap-2 mb-3 font-mono text-[10px] text-emerald-400">
                      <Shield className="w-3 h-3"/>
                      <span>Verified against repository invariant: {sug.proven_evidence_ref}</span>
                    </div>)}

                  {/* User Action: User must manually accept/copy */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
                    <Button onClick={() => handleAcceptSuggestion(sug)} variant="outline" className={`text-xs ${isAccepted
                        ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10'
                        : 'border-white/10 text-neutral-300 hover:text-white'}`}>
                      {isCopied ? (<>
                          <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400"/>
                          Copied Fix to Clipboard
                        </>) : isAccepted ? (<>
                          <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400"/>
                          Accepted Recommendation
                        </>) : (<>
                          <Copy className="w-3.5 h-3.5 mr-1.5"/>
                          Accept & Copy Fix
                        </>)}
                    </Button>
                  </div>
                </div>);
            })}
          </div>)}
      </section>

      {/* ======================================================== */}
      {/* 6. BEFORE / AFTER COMPARISON MODAL                      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showComparison && previousData && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-[#111317] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Before vs. After Comparison</h3>
                  <p className="text-xs text-[#9AA3AE] font-mono">
                    Evaluation of changed check statuses across versions.
                  </p>
                </div>
                <button type="button" onClick={() => setShowComparison(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5">
                  ✕
                </button>
              </div>

              {/* Score Shift */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-white/[0.02] border border-white/10 rounded-xl mb-4 font-mono text-center">
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase block">Previous Version</span>
                  <span className="text-2xl font-bold text-neutral-300">
                    {previousData.score_data.score?.toFixed(1) ?? 'N/A'}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-400 uppercase block">Current Version</span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {data.score_data.score?.toFixed(1) ?? 'N/A'}%
                  </span>
                </div>
              </div>

              {/* Check Status Diff */}
              <div className="space-y-2 mb-6">
                <span className="text-xs font-mono uppercase tracking-wider text-[#9AA3AE] block mb-2">
                  Checks with Changed Status
                </span>
                {data.readability_checks.map((curr) => {
                const prev = previousData.readability_checks.find((p) => p.code === curr.code);
                if (!prev || prev.status === curr.status)
                    return null;
                return (<div key={curr.code} className="p-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between font-mono text-xs">
                      <span className="text-white font-medium">{curr.title}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-400 line-through">{prev.status}</span>
                        <ArrowRight className="w-3 h-3 text-emerald-400"/>
                        <span className={curr.status === 'pass' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                          {curr.status}
                        </span>
                      </div>
                    </div>);
            })}
              </div>

              <Button onClick={() => setShowComparison(false)} className="w-full bg-emerald-500 text-[#0A0C0F] font-semibold">
                Close Comparison
              </Button>
            </motion.div>
          </motion.div>)}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 7. EXACT MANDATED FOOTER DISCLAIMER                      */}
      {/* ======================================================== */}
      <footer className="pt-4 pb-8 border-t border-white/10 text-center font-mono text-xs text-[#9AA3AE]">
        Heuristic checks, not a score from any real ATS. Evidence of use, not proficiency or authorship.
      </footer>
    </div>);
};
