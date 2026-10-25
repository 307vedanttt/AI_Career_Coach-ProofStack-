import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
export const HowWeJudgePage = () => {
    return (<AppLayout>
      <div className="max-w-[1200px] w-full mx-auto px-4 lg:px-8 py-8 flex flex-col space-y-10 select-none">
        {/* HERO TITLE */}
        <header className="space-y-3">
          <div className="flex items-center space-x-2 text-xs font-mono text-[#9AA3AE] uppercase tracking-wider">
            <span>PROOFSTACK AUDIT STANDARD</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/20"/>
            <span>SPEC.MD V2.4 SECTIONS 4.5–4.7 & 8.5</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight">
            How We Judge: Signal Weights, Caps & Invariant Rules
          </h1>

          <p className="text-sm md:text-base text-[#9AA3AE] max-w-3xl leading-relaxed">
            ProofStack does not use synthetic match scores or opaque LLM evaluations. All candidate
            verdicts are governed by deterministic invariant limits, explicit category weights, and
            anti-gaming contribution caps defined in the core verification specification.
          </p>
        </header>

        {/* SECTION 4.5: SIGNAL CALIBRATION & CAPS */}
        <section aria-labelledby="section-4-5" className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
              SPEC § 4.5
            </span>
            <h2 id="section-4-5" className="text-xl font-display font-bold text-white">
              Signal Tables & Contribution Caps
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#9AA3AE] leading-relaxed">
            To prevent candidates from gaming evaluation via thousands of shallow tests or synthetic
            commits, each evidence category is subject to a hard contribution ceiling.
          </p>

          <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03] text-[#9AA3AE]">
                  <th className="py-3 px-4 font-bold text-[11px] uppercase">Signal Category</th>
                  <th className="py-3 px-4 font-bold text-[11px] uppercase">Verification Target</th>
                  <th className="py-3 px-4 font-bold text-[11px] uppercase">Hard Cap</th>
                  <th className="py-3 px-4 font-bold text-[11px] uppercase">Gaming Defense Rule</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    01. Test Invariants
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA3AE]">
                    Executable assertion verification & state mutation tests
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    35% Max
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    Zero assertions or empty test blocks refused with no score granted.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    02. Runtime Assertions
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA3AE]">
                    High-throughput routes, rate limiters & transaction state
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    30% Max
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    Requires live route mount or schema validator signature.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    03. Interface Contracts
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA3AE]">
                    Exported public API types, Go structs & RPC signatures
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    20% Max
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    Docstring claims without interface adherence are ignored.
                  </td>
                </tr>

                <tr className="hover:bg-white/[0.02]">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    04. Monotonic Ratchet
                  </td>
                  <td className="py-3.5 px-4 text-[#9AA3AE]">
                    Linear commit progression without backdated timestamps
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    15% Max
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B]">
                    Backdated or rewrite force-pushes invalidate entire tree.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 4.6: CATEGORICAL WEIGHTS */}
        <section aria-labelledby="section-4-6" className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
              SPEC § 4.6
            </span>
            <h2 id="section-4-6" className="text-xl font-display font-bold text-white">
              Status Categorical Weights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel p-5 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  PROVEN
                </span>
                <div className="font-display text-2xl font-bold text-white mt-2">
                  1.0x Full Credit
                </div>
              </div>
              <p className="font-mono text-xs text-[#9AA3AE] mt-3 leading-relaxed">
                Complete executable proof with verifiable assertion and commit SHA.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-amber-500/30 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                  BASIC
                </span>
                <div className="font-display text-2xl font-bold text-white mt-2">
                  0.4x Partial Credit
                </div>
              </div>
              <p className="font-mono text-xs text-[#9AA3AE] mt-3 leading-relaxed">
                Shallow declaration or generic unit test missing edge invariants.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/10 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-white/10 text-[#9AA3AE] font-mono text-[10px] font-bold">
                  NOT IN SCOPE
                </span>
                <div className="font-display text-2xl font-bold text-white mt-2">
                  0.0x Neutral
                </div>
              </div>
              <p className="font-mono text-xs text-[#9AA3AE] mt-3 leading-relaxed">
                Not demonstrated in target repository scope; does not penalize candidate.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-red-500/30 flex flex-col justify-between">
              <div>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-mono text-[10px] font-bold">
                  REFUSED / HOLLOW
                </span>
                <div className="font-display text-2xl font-bold text-red-400 mt-2">
                  0.0x Refusal
                </div>
              </div>
              <p className="font-mono text-xs text-[#9AA3AE] mt-3 leading-relaxed">
                Forged assertions, stub pass-throughs, or docstring stuffing.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4.7: SENSITIVITY RANGE & ACCEPTANCE THRESHOLDS */}
        <section aria-labelledby="section-4-7" className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
              SPEC § 4.7
            </span>
            <h2 id="section-4-7" className="text-xl font-display font-bold text-white">
              Sensitivity Range & Thresholds
            </h2>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-emerald-400 font-bold block mb-1">
                  ≥ 70% · HIGH ASSURANCE ACCEPTANCE
                </span>
                <p className="text-[#9AA3AE] text-[11px] leading-relaxed">
                  Candidate demonstrates verified invariant backing across critical backend
                  contracts. Ready for direct interview docket generation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                <span className="text-amber-300 font-bold block mb-1">
                  50% – 69% · INTERMEDIATE SCOPE
                </span>
                <p className="text-[#9AA3AE] text-[11px] leading-relaxed">
                  Core capabilities proven; secondary invariants or infrastructure
                  requirements require targeted Commit Contract fulfillment.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[#9AA3AE] font-bold block mb-1">
                  &lt; 50% · INSUFFICIENT PROOF
                </span>
                <p className="text-[#64748B] text-[11px] leading-relaxed">
                  Insufficient code artifacts in targeted repository scope. Recommended to run
                  public scanner or submit code corrections.
                </p>
              </div>
            </div>

            {/* Formula Explanation */}
            <div className="pt-3 border-t border-white/10 font-mono text-xs text-[#9AA3AE] flex flex-col md:flex-row md:items-center justify-between gap-2">
              <span>
                Evidence Coverage Formula: <strong className="text-white">Coverage = Σ min(W_i * Credit_i, Cap_i) / Total_Requirements</strong>
              </span>
              <span className="text-emerald-400">Deterministic Monotonic Ratchet</span>
            </div>
          </div>
        </section>

        {/* SECTION 8.5: LIMITS IN PLAIN WORDS */}
        <section aria-labelledby="section-8-5" className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/20">
              SPEC § 8.5
            </span>
            <h2 id="section-8-5" className="text-xl font-display font-bold text-white">
              System Limits & Integrity Guarantees in Plain Words
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2">
              <span className="font-bold text-white text-sm block">
                1. No Hallucinated Claims
              </span>
              <p className="text-[#9AA3AE] text-[11px] leading-relaxed">
                LLMs assist in identifying syntax candidates, but cannot assign stamps. Every
                proven badge requires an underlying static signature with verifiable line numbers.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2">
              <span className="font-bold text-white text-sm block">
                2. Immutability of Records
              </span>
              <p className="text-[#9AA3AE] text-[11px] leading-relaxed">
                Receipts prove our record was not changed; they do not prove who wrote the code.
                Force-pushes or altered git commit histories immediately trigger broken ledger seals.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2">
              <span className="font-bold text-white text-sm block">
                3. Fail-Closed Rate Limiting
              </span>
              <p className="text-[#9AA3AE] text-[11px] leading-relaxed">
                If the analysis engine hits rate limits (HTTP 429), evaluation fails closed.
                No speculative status is ever issued without full token verification.
              </p>
            </div>

            <div className="glass-panel p-5 rounded-xl border border-white/10 space-y-2">
              <span className="font-bold text-white text-sm block">
                4. Full Proof Transparency
              </span>
              <p className="text-[#9AA3AE] text-[11px] leading-relaxed">
                Every positive claim has a clickable permalink to code evidence; every refused
                candidate has a plain-language explanation of which invariant was missing.
              </p>
            </div>
          </div>
        </section>
      </div>
    </AppLayout>);
};
