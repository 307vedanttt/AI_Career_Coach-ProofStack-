import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FileText, Sparkles, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { setMockSignedIn } from '../../lib/api';


interface JobPostingIntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIntakeComplete?: (jobTitle: string) => void;
}

const SAMPLE_POSTING = `Senior Backend Engineer — Northwind Labs

Requirements:
- Production persistence with SQL (SQLite / PostgreSQL schema migrations)
- High-throughput REST API with FastAPI or Go
- Zero-trust authentication & HMAC signature verification
- Continuous integration with automated invariant unit & integration tests
- Containerized deployment infrastructure with Docker`;

export const JobPostingIntakeModal: React.FC<JobPostingIntakeModalProps> = ({
  isOpen,
  onClose,
  onIntakeComplete,
}) => {
  const navigate = useNavigate();
  const [postingText, setPostingText] = useState(SAMPLE_POSTING);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedCount, setExtractedCount] = useState<number | null>(null);

  const handleParse = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!postingText.trim()) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setExtractedCount(5);
      setTimeout(async () => {
        if (onIntakeComplete) {
          onIntakeComplete('Senior Backend Engineer');
        }
        await setMockSignedIn(true);
        onClose();
        navigate('/app');
      }, 500);
    }, 600);
  };


  const handleLoadSample = () => {
    setPostingText(SAMPLE_POSTING);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="intake-title"
    >
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-2xl bg-[#12161B] border border-white/15 rounded-2xl shadow-2xl p-6 sm:p-8 text-[#F4F2EC] z-10 space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px] uppercase font-bold tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>BEAT 2: REQUIREMENT INTAKE</span>
            </div>
            <h2 id="intake-title" className="font-display text-2xl text-white font-bold">
              Paste Job Posting
            </h2>
            <p className="text-xs text-[#9AA3AE] font-mono">
              ProofStack extracts hard technical invariants and maps them against verified code commits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#9AA3AE] hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Textarea Form */}
        <form onSubmit={handleParse} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-[#9AA3AE]">
              <label htmlFor="posting-textarea" className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Job Description or Requirements Spec</span>
              </label>
              <button
                type="button"
                onClick={handleLoadSample}
                className="text-[11px] text-emerald-400 hover:underline focus:outline-none"
              >
                Insert Sample Posting
              </button>
            </div>

            <textarea
              id="posting-textarea"
              rows={8}
              value={postingText}
              onChange={(e) => setPostingText(e.target.value)}
              placeholder="Paste job posting text here..."
              className="w-full bg-[#08090C] border border-white/10 rounded-xl p-3.5 text-xs font-mono text-white placeholder-[#64748B] focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500 leading-relaxed resize-none"
              autoFocus
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-[11px] font-mono text-[#9AA3AE] flex items-center gap-1.5">
              {extractedCount !== null ? (
                <span className="text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>5 requirements mapped to repo ledger</span>
                </span>
              ) : (
                <span>Zero hallucination: only commits matching AST invariants will count</span>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                size="md"
                onClick={onClose}
                className="flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="solid_paper"
                size="md"
                isLoading={isProcessing}
                icon={<ArrowRight className="w-4 h-4 text-[#14171A]" />}
                className="flex-1 sm:flex-none"
                aria-label="Map evidence to dashboard"
              >
                Map Evidence to Dashboard
              </Button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
