import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Award,
  RefreshCw,
  ArrowRight,
  Check,
  Copy,
  Lock,
  GitBranch,
  Sparkles,
} from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { CodeQualityTestSession, CodeQualityTestSubmissionResult } from '../types/api';
import { getCodeQualityTests, submitCodeQualityTests } from '../lib/api';

export const CodeQualityTestsPage: React.FC = () => {
  const [session, setSession] = useState<CodeQualityTestSession | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submissionResult, setSubmissionResult] = useState<CodeQualityTestSubmissionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const fetchTests = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSubmissionResult(null);
    setAnswers({});
    try {
      const data = await getCodeQualityTests();
      setSession(data);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load code quality skill tests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submissionResult) return; // locked after submission
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitTest = async () => {
    if (!session) return;
    setIsSubmitting(true);
    try {
      const result = await submitCodeQualityTests(session.test_session_id, answers);
      setSubmissionResult(result);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit test.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText?.(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <AppLayout>
      <div className="max-w-[1240px] w-full mx-auto px-4 py-6 font-sans">
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-cyan-400">
              <Terminal className="w-4 h-4" />
              <span className="font-semibold uppercase tracking-wider">Candidate Skill Assessment Arena</span>
              <span className="text-white/20">•</span>
              <span className="text-[#9AA3AE]">Grounded in Connected GitHub Quality</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
              Code-Quality Skill Tests
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                Anti-Cheat • Repo-Tied
              </span>
            </h1>
            <p className="text-sm text-[#9AA3AE] mt-1 max-w-2xl font-mono">
              Unlike generic trivia, these assessments test your ability to refactor real anti-patterns, security gaps, and concurrency bottlenecks detected in your uploaded repositories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={fetchTests}
              variant="outline"
              size="sm"
              className="font-mono text-xs border-white/10 hover:border-cyan-500/40 text-neutral-300"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset Questions
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-[#111317] border border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center min-h-[380px] font-mono text-sm">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
            <span className="text-white font-medium text-base">Scanning Repository ASTs for Quality Anti-Patterns...</span>
            <span className="text-xs text-[#9AA3AE] mt-1">Generating personalized questions from your Python & TypeScript codebase</span>
          </div>
        )}

        {/* Error State */}
        {errorMessage && !isLoading && (
          <div className="bg-[#111317] border border-rose-500/20 rounded-2xl p-8 mb-6 font-mono">
            <div className="flex items-center gap-3 text-rose-400 font-bold mb-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Assessment Error</span>
            </div>
            <p className="text-xs text-rose-300 mb-4">{errorMessage}</p>
            <Button onClick={fetchTests} variant="outline" size="sm">
              Retry Load
            </Button>
          </div>
        )}

        {/* Active Test Arena */}
        {!isLoading && session && (
          <div className="space-y-8">
            {/* Top Bar: Connected Repo & Submission Result Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-[#9AA3AE]">TARGET CODEBASE:</span>
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5" />
                  {session.repo_name}
                </span>
                <span className="text-white/20">•</span>
                <span className="text-[#9AA3AE]">SESSION: #{session.test_session_id}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[#9AA3AE]">COMPLETION:</span>
                <span className="text-white font-bold">
                  {Object.keys(answers).length} of {session.total_questions} answered
                </span>
              </div>
            </div>

            {/* Submission Result Banner */}
            {submissionResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-6 rounded-2xl border ${
                  submissionResult.passed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-100'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-100'
                } relative overflow-hidden`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        submissionResult.passed ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
                      }`}
                    >
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-mono font-bold tracking-wider uppercase text-emerald-400">
                        OFFICIAL ATTESTATION OUTCOME
                      </div>
                      <div className="text-2xl font-black text-white flex items-center gap-2">
                        {submissionResult.mastery_label}
                        <span className="text-sm font-mono font-normal">
                          ({submissionResult.score_percent}% • {submissionResult.correct_count}/{submissionResult.total_questions} Correct)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase bg-black/40 border border-white/20 text-white">
                      {submissionResult.passed ? 'VERIFIED CLEARANCE' : 'PARTIAL REVIEW'}
                    </span>
                  </div>
                </div>

                {/* Cryptographic Proof Hash */}
                <div className="p-3 rounded-lg bg-black/40 border border-white/10 font-mono text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-[#9AA3AE]">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographic Attestation Digest:</span>
                    <span className="text-emerald-300 font-bold">{submissionResult.cryptographic_proof_hash.slice(0, 24)}...</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCopyHash(submissionResult.cryptographic_proof_hash)}
                    className="text-neutral-400 hover:text-white flex items-center gap-1.5 text-xs font-semibold"
                  >
                    {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedHash ? 'Hash Copied' : 'Copy Full Hash'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Questions Stepper */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {session.questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isActive = activeQuestionIndex === idx;
                const breakdownItem = submissionResult?.results_breakdown?.find((b) => b.question_id === q.id);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setActiveQuestionIndex(idx)}
                    className={`flex-1 min-w-[140px] p-3 rounded-xl border text-left font-mono transition-all ${
                      isActive
                        ? 'bg-cyan-500/10 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : isAnswered
                        ? 'bg-white/[0.04] border-white/20 hover:border-white/40'
                        : 'bg-white/[0.01] border-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-neutral-300">Q{idx + 1}</span>
                      {breakdownItem ? (
                        breakdownItem.is_correct ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        )
                      ) : isAnswered ? (
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      ) : null}
                    </div>
                    <div className="text-xs text-white truncate font-sans font-medium">
                      {q.category}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Question Display Card */}
            {session.questions[activeQuestionIndex] && (
              <div className="bg-[#111317] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6">
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-bold uppercase tracking-wider text-[10px]">
                      {session.questions[activeQuestionIndex].category}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-white/5 text-[#9AA3AE] text-[10px]">
                      {session.questions[activeQuestionIndex].difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-neutral-400">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-neutral-200 font-bold">
                      {session.questions[activeQuestionIndex].file_path}
                    </span>
                    <span className="text-[#9AA3AE]">({session.questions[activeQuestionIndex].line_target})</span>
                  </div>
                </div>

                {/* Question Prompt */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white font-sans leading-snug">
                    {session.questions[activeQuestionIndex].question}
                  </h3>
                </div>

                {/* Code Context from User Repo */}
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black/60 font-mono text-xs">
                  <div className="bg-white/5 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] text-[#9AA3AE]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500/60 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 inline-block" />
                      <span className="ml-2 text-neutral-300 font-semibold">Repository Code Snippet</span>
                    </div>
                    <span>Detected Anti-Pattern Target</span>
                  </div>
                  <pre className="p-4 text-emerald-300 overflow-x-auto leading-relaxed">
                    <code>{session.questions[activeQuestionIndex].code_context}</code>
                  </pre>
                </div>

                {/* Options Selection */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-mono text-[#9AA3AE] uppercase tracking-wider font-semibold">
                    Select the Production-Grade Engineering Fix:
                  </div>

                  {session.questions[activeQuestionIndex].options.map((opt, oIdx) => {
                    const qId = session.questions[activeQuestionIndex].id;
                    const isSelected = answers[qId] === oIdx;
                    const isSubmitted = !!submissionResult;
                    const isCorrectOption = session.questions[activeQuestionIndex].correct_option_index === oIdx;

                    let optionBorder = 'border-white/10 hover:border-cyan-400/40 bg-white/[0.02]';
                    if (isSubmitted) {
                      if (isCorrectOption) {
                        optionBorder = 'border-emerald-500 bg-emerald-500/10 text-emerald-200';
                      } else if (isSelected && !isCorrectOption) {
                        optionBorder = 'border-rose-500 bg-rose-500/10 text-rose-200';
                      } else {
                        optionBorder = 'border-white/5 bg-white/[0.01] opacity-60';
                      }
                    } else if (isSelected) {
                      optionBorder = 'border-cyan-400 bg-cyan-500/10 text-cyan-100 shadow-[0_0_15px_rgba(6,182,212,0.15)]';
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(qId, oIdx)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${optionBorder}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 text-xs font-mono font-bold ${
                            isSelected
                              ? 'border-cyan-400 bg-cyan-400 text-black'
                              : 'border-white/30 text-white/50'
                          }`}
                        >
                          {isSelected ? '✓' : String.fromCharCode(65 + oIdx)}
                        </div>
                        <div className="text-sm font-sans leading-relaxed text-white">
                          {opt}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Post-Submission Explanation */}
                {submissionResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-white/[0.03] border border-cyan-500/30 space-y-2 font-mono text-xs text-neutral-200"
                  >
                    <div className="flex items-center gap-2 text-cyan-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>AST Quality Rule Rationale:</span>
                    </div>
                    <p className="font-sans leading-relaxed text-sm text-neutral-300">
                      {session.questions[activeQuestionIndex].explanation}
                    </p>
                  </motion.div>
                )}

                {/* Action Buttons: Next / Submit */}
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <Button
                    onClick={() => setActiveQuestionIndex((prev) => Math.max(0, prev - 1))}
                    disabled={activeQuestionIndex === 0}
                    variant="outline"
                    size="sm"
                    className="font-mono text-xs border-white/10 text-[#9AA3AE]"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-3">
                    {activeQuestionIndex < session.questions.length - 1 ? (
                      <Button
                        onClick={() => setActiveQuestionIndex((prev) => prev + 1)}
                        variant="solid_emerald"
                        size="sm"
                        className="font-mono text-xs bg-cyan-500 hover:bg-cyan-400 text-black font-bold"
                      >
                        Next Challenge
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    ) : (
                      !submissionResult && (
                        <Button
                          onClick={handleSubmitTest}
                          disabled={isSubmitting || Object.keys(answers).length < session.questions.length}
                          variant="solid_emerald"
                          size="sm"
                          className="font-mono text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          {isSubmitting ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-2" />
                              Cryptographically Grading...
                            </>
                          ) : (
                            <>
                              <Award className="w-4 h-4 mr-2" />
                              Submit & Sign Attestation
                            </>
                          )}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
