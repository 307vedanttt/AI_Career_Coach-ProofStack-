import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, X, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { createJobPosting } from '../../lib/api';
const DEFAULT_POSTING_PROMPT = `Senior Backend Engineer — Distributed Systems

Requirements:
- Production persistence with SQL (SQLite / PostgreSQL schema migrations)
- High-throughput REST API with FastAPI or Go
- Zero-trust authentication & HMAC signature verification
- Continuous integration with automated invariant unit & integration tests
- Containerized deployment infrastructure with Docker`;
export const JobPostingIntakeModal = ({ isOpen, onClose, onIntakeComplete, }) => {
    const navigate = useNavigate();
    const [postingText, setPostingText] = useState(DEFAULT_POSTING_PROMPT);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedCount, setExtractedCount] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const handleParse = async (e) => {
        if (e)
            e.preventDefault();
        if (!postingText.trim())
            return;
        setIsProcessing(true);
        setErrorMsg(null);
        try {
            const res = await createJobPosting({
                title: 'Senior Backend Engineer',
                description: postingText,
                company: 'Distributed Systems',
            });
            const count = res.requirements_count || (res.requirements?.length ?? 5);
            setExtractedCount(count);
            if (onIntakeComplete) {
                onIntakeComplete('Senior Backend Engineer');
            }
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('ps_demo_mode', 'true');
            }
            setTimeout(() => {
                setIsProcessing(false);
                onClose();
                navigate('/app?demo=1');
            }, 500);
        }
        catch (err) {
            setIsProcessing(false);
            setErrorMsg(err.message || 'Failed to ingest job posting. Please check your backend connection and try again.');
        }
    };
    if (!isOpen)
        return null;
    return (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="intake-modal-title">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-2xl bg-[#12161B] border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5"/>
            </div>
            <div>
              <h3 id="intake-modal-title" className="font-display text-xl font-bold text-white tracking-tight">
                Job Posting Intake
              </h3>
              <p className="font-mono text-xs text-[#9AA3AE] mt-0.5">
                Deterministic regex & schema parser maps posting sentences into formal invariants.
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#9AA3AE] hover:text-white transition-colors" aria-label="Close dialog">
            <X className="w-4 h-4"/>
          </button>
        </div>

        {errorMsg && (<div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5"/>
            <div className="flex-1">
              <p className="font-semibold">{errorMsg}</p>
            </div>
          </div>)}

        {/* Text Area */}
        <form onSubmit={handleParse} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="posting-textarea" className="font-mono text-xs font-semibold text-white/80 uppercase tracking-wider flex items-center justify-between">
              <span>Raw Job Posting Text</span>
              <span className="text-[10px] text-[#9AA3AE] lowercase">markdown or plain text</span>
            </label>
            <textarea id="posting-textarea" rows={8} value={postingText} onChange={(e) => setPostingText(e.target.value)} placeholder="Paste job posting text here..." className="w-full p-4 rounded-xl bg-black/40 border border-white/15 font-mono text-xs text-[#F4F2EC] placeholder:text-[#9AA3AE]/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-all resize-none"/>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2">
            <div className="font-mono text-xs text-emerald-400 flex items-center gap-2">
              {extractedCount !== null && (<>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400"/>
                  <span>{extractedCount} Invariant Requirements Extracted</span>
                </>)}
            </div>

            <div className="flex items-center space-x-3">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="solid_emerald" disabled={isProcessing || !postingText.trim()}>
                {isProcessing ? (<span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin text-emerald-950"/>
                    <span>Extracting Invariants...</span>
                  </span>) : (<span className="flex items-center gap-2">
                    <span>Extract & Save Invariants</span>
                    <ArrowRight className="w-4 h-4"/>
                  </span>)}
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>);
};
