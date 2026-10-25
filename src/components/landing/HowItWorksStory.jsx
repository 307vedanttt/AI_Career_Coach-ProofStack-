import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { FileText, FolderTree, ShieldAlert, CheckCircle2, FileCode2, ArrowRight, GitCommit, Clock, Sparkles, ChevronRight, Play, Pause } from 'lucide-react';
import { SpotlightCard } from '../ui/motion/SpotlightCard';
import { BorderBeam } from '../ui/motion/BorderBeam';
import { ShinyText } from '../ui/motion/ShinyText';

const STEPS = [
    {
        id: 1,
        label: 'Role Intake',
        sub: 'Paste job specs or requirements',
        caption: 'Real job requirements mapped directly to verifiable engineering competencies.',
    },
    {
        id: 2,
        label: 'Git Audit',
        sub: 'Parse AST and commit tree',
        caption: 'Full codebase AST scan maps real routes, models, and dependencies.',
    },
    {
        id: 3,
        label: 'Test Invariants',
        sub: 'Verify active assertions',
        caption: 'Distinguishes genuine invariant tests from empty pass-through decoy suites.',
    },
    {
        id: 4,
        label: 'Proof Docket',
        sub: 'Issue cryptographic verdict',
        caption: 'Generates immutable evidence stamps backed by commit hashes.',
    },
    {
        id: 5,
        label: 'Commit Contract',
        sub: 'Targeted code challenge',
        caption: 'Prescribes the exact next commit needed to prove missing competencies.',
    },
    {
        id: 6,
        label: 'Continuous Sync',
        sub: 'Webhook auto-verification',
        caption: 'Push new commits to GitHub and watch proof coverage advance in real-time.',
    },
];

export const HowItWorksStory = () => {
    const shouldReduceMotion = useReducedMotion();
    const [activeStep, setActiveStep] = useState(1);
    const [isPaused, setIsPaused] = useState(false);

    // Smooth auto-advancing pipeline (pauses on hover)
    useEffect(() => {
        if (isPaused || shouldReduceMotion) return;
        const interval = setInterval(() => {
            setActiveStep((prev) => (prev >= STEPS.length ? 1 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [isPaused, shouldReduceMotion]);

    const handleStepSelect = (stepId) => {
        setActiveStep(stepId);
    };

    const handleNext = () => {
        setActiveStep((prev) => (prev >= STEPS.length ? 1 : prev + 1));
    };

    const handlePrev = () => {
        setActiveStep((prev) => (prev <= 1 ? STEPS.length : prev - 1));
    };

    return (
    <section id="how-it-works" className="relative w-full bg-[#08090B] py-20 lg:py-28 border-t border-white/[0.08]" aria-label="How ProofStack Works">
      <div 
        className="w-full flex flex-col justify-between px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto space-y-8"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Top Header Strip with Pipeline Badge */}
        <div className="w-full flex items-center justify-between z-20 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold tracking-[0.2em] text-[#34D399] uppercase">
              <ShinyText text="HOW IT WORKS" speed={3.5}/>
            </span>
            <span className="text-white/20 hidden sm:inline">|</span>
            <span className="text-xs font-mono text-[#9AA3AE] hidden sm:inline">
              Step-by-step verification pipeline
            </span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-[#F4F2EC] shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]"/>
            <span className="truncate">Live CI/CD & GitHub Webhook Sync</span>
          </div>
        </div>

        {/* Main Stage: Left Stepper (Desktop) + Right Big Visual Panel */}
        <div className="flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center my-auto max-w-7xl mx-auto z-10">
          {/* LEFT: Sticky Vertical Stepper (Desktop) */}
          <div className="hidden lg:flex lg:col-span-4 flex-col justify-center relative py-6">
            {/* Glowing vertical progress line */}
            <div className="absolute left-[19px] top-6 bottom-6 w-[2px] bg-white/[0.08]">
              <motion.div className="w-full bg-gradient-to-b from-[#10B981] via-emerald-400 to-[#38BDF8] shadow-[0_0_12px_rgba(16,185,129,0.5)]" initial={false} animate={{
            height: `${((activeStep - 1) / (STEPS.length - 1)) * 100}%`,
        }} transition={{ duration: 0.35, ease: 'easeOut' }}/>
            </div>

            {/* Stepper items */}
            <div className="space-y-6">
              {STEPS.map((step) => {
            const isActive = step.id === activeStep;
            const isPast = step.id < activeStep;
            return (<button key={step.id} type="button" onClick={() => handleStepSelect(step.id)} className="group relative flex items-center gap-4 text-left focus:outline-none w-full" aria-current={isActive ? 'step' : undefined}>
                    {/* Step Indicator Dot / Ring */}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-mono font-bold text-xs transition-all duration-300 ${isActive
                    ? 'bg-emerald-400 text-[#0A0C0F] scale-110 shadow-[0_0_20px_rgba(16,185,129,0.5)] ring-4 ring-emerald-400/20'
                    : isPast
                        ? 'bg-[#12161B] border border-emerald-500/50 text-emerald-400'
                        : 'bg-[#12161B] border border-white/10 text-[#575D65] group-hover:border-white/30 group-hover:text-white'}`}>
                      {step.id}
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="flex flex-col transition-all duration-300">
                      <span className={`font-display transition-all duration-300 ${isActive
                    ? 'text-white font-bold text-xl tracking-tight'
                    : 'text-[#575D65] text-sm group-hover:text-[#9AA3AE]'}`}>
                        {step.label}
                      </span>
                      {isActive && (<motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-[11px] text-[#34D399]">
                          {step.sub}
                        </motion.span>)}
                    </div>
                  </button>);
        })}
            </div>
          </div>

          {/* RIGHT: Very Large Visual Panel (Changes per step) */}
          <div className="col-span-1 lg:col-span-8 w-full flex flex-col justify-center relative">
            {/* Ambient Backdrop Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-emerald-500/10 rounded-3xl blur-3xl opacity-50 pointer-events-none -z-10"/>

            <SpotlightCard spotlightColor="rgba(16, 185, 129, 0.12)" borderColor="rgba(16, 185, 129, 0.35)" className="relative w-full min-h-[460px] sm:aspect-[16/10] max-h-[620px] rounded-2xl bg-[#10141B]/95 border border-white/20 p-4 sm:p-8 flex flex-col justify-between shadow-[0_30px_70px_rgba(0,0,0,0.7)] overflow-hidden backdrop-blur-2xl">
              <BorderBeam size={280} duration={7} colorFrom="#10B981" colorTo="#38BDF8"/>

              {/* Dynamic Step Content */}
              <div className="relative z-10 flex-1 flex items-center justify-center w-full min-h-[300px] sm:min-h-[400px]">
                <AnimatePresence mode="popLayout" initial={false}>
                  {activeStep === 1 && <PostingVisual key="step-1"/>}
                  {activeStep === 2 && <EvidenceVisual key="step-2"/>}
                  {activeStep === 3 && <ChecksVisual key="step-3"/>}
                  {activeStep === 4 && <StatusVisual key="step-4"/>}
                  {activeStep === 5 && <ContractVisual key="step-5"/>}
                  {activeStep === 6 && <UpdateVisual key="step-6"/>}
                </AnimatePresence>
              </div>

              {/* Caption (Max 8 words per requirement) */}
              <div className="relative z-10 pt-4 mt-2 border-t border-white/[0.08] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                  <p className="font-mono text-xs sm:text-sm font-medium text-white tracking-tight">
                    {STEPS[activeStep - 1].caption}
                  </p>
                </div>
                <span className="font-mono text-[11px] text-[#575D65]">
                  0{activeStep} / 06
                </span>
              </div>
            </SpotlightCard>
          </div>
        </div>

        {/* BOTTOM: Timeline bar & Controls */}
        <div className="w-full pt-4 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3 z-20">
          {/* Thin Glowing Timeline Bar */}
          <div className="flex-1 max-w-xl h-1.5 rounded-full bg-white/[0.08] overflow-hidden mr-4">
            <motion.div className="h-full bg-gradient-to-r from-emerald-400 to-[#38BDF8] shadow-[0_0_8px_rgba(16,185,129,0.5)]" initial={false} animate={{ width: `${(activeStep / STEPS.length) * 100}%` }} transition={{ duration: 0.3 }}/>
          </div>

          {/* Controls: Prev, Play/Pause, Next */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#9AA3AE] hover:text-white transition-all border border-white/10"
              title={isPaused ? "Resume auto-play" : "Pause auto-play"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
            <button 
              type="button" 
              onClick={handlePrev} 
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white font-mono text-xs font-semibold transition-all border border-white/10"
            >
              Prev
            </button>
            <span className="font-mono text-xs text-[#9AA3AE] px-1">
              {activeStep} / 6
            </span>
            <button 
              type="button" 
              onClick={handleNext} 
              className="px-4 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30"
            >
              <span>{activeStep === 6 ? 'Restart' : 'Next'}</span>
              <ChevronRight className="w-3.5 h-3.5"/>
            </button>
          </div>
        </div>
      </div>
    </section>);
};
/* -------------------------------------------------------------------------- */
/* PANEL 1: Posting                                                           */
/* Job posting card with three requirement sentences highlighted and linked   */
/* by thin lines to chips SQL, API, Testing                                    */
/* -------------------------------------------------------------------------- */
const PostingVisual = () => {
    return (<motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      {/* Job Card (Left 7 cols) */}
      <div className="md:col-span-7 bg-[#1A1F26] rounded-xl border border-white/15 p-4 sm:p-5 shadow-2xl relative font-sans">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 font-mono text-[11px] text-[#9AA3AE]">
          <span className="text-white font-bold">STAFF BACKEND ENGINEER</span>
          <span className="text-emerald-400 font-mono">REQ_INTAKE</span>
        </div>

        <div className="space-y-3 text-xs leading-relaxed text-[#CBD5E1]">
          {/* Sentence 1 */}
          <div className="p-2 rounded bg-emerald-500/10 border-l-2 border-emerald-400 text-white">
            <span className="font-medium">1. Design high-performance PostgreSQL schema</span> with
            indexed transactional queries.
          </div>

          {/* Sentence 2 */}
          <div className="p-2 rounded bg-violet-500/10 border-l-2 border-violet-400 text-white">
            <span className="font-medium">2. Build resilient REST APIs</span> with JWT authentication
            and rate limiting.
          </div>

          {/* Sentence 3 */}
          <div className="p-2 rounded bg-amber-500/10 border-l-2 border-amber-400 text-white">
            <span className="font-medium">3. Write automated unit and integration tests</span> with
            thorough coverage.
          </div>
        </div>
      </div>

      {/* Linked Chips (Right 5 cols) */}
      <div className="md:col-span-5 flex flex-col justify-around gap-3 pl-2">
        <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs shadow-[0_0_15px_rgba(52,211,153,0.2)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400"/>
          <span className="font-bold">SQL</span>
          <span className="text-[10px] text-emerald-400/80 ml-auto">PostgreSQL AST</span>
        </motion.div>

        <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-2 p-2.5 rounded-lg bg-violet-500/15 border border-violet-500/40 text-violet-300 font-mono text-xs shadow-[0_0_15px_rgba(109,91,208,0.2)]">
          <span className="w-2 h-2 rounded-full bg-violet-400"/>
          <span className="font-bold">API</span>
          <span className="text-[10px] text-violet-400/80 ml-auto">Route Invariants</span>
        </motion.div>

        <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-mono text-xs shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <span className="w-2 h-2 rounded-full bg-amber-400"/>
          <span className="font-bold">Testing</span>
          <span className="text-[10px] text-amber-400/80 ml-auto">Test Coverage</span>
        </motion.div>
      </div>
    </motion.div>);
};
/* -------------------------------------------------------------------------- */
/* PANEL 2: Evidence                                                          */
/* Repo file tree on the left fading into a colorful Proof Map mosaic         */
/* -------------------------------------------------------------------------- */
const EvidenceVisual = () => {
    return (<motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
      {/* File Tree (Left 5 cols) */}
      <div className="md:col-span-5 bg-[#0B0D10] rounded-xl border border-white/10 p-4 font-mono text-[11px] text-[#CBD5E1] shadow-xl">
        <div className="flex items-center gap-1.5 text-white font-bold pb-2 mb-2 border-b border-white/10">
          <FolderTree className="w-3.5 h-3.5 text-emerald-400"/>
          <span>candidate/service-api</span>
        </div>
        <div className="space-y-1.5 text-[#9AA3AE]">
          <div className="text-white">📁 src/</div>
          <div className="pl-3 text-emerald-400">📄 db/queries.py</div>
          <div className="pl-3 text-violet-400">📄 api/routes.py</div>
          <div className="text-white">📁 tests/</div>
          <div className="pl-3 text-amber-400">📄 test_orders.py</div>
          <div className="pl-3 text-amber-400">📄 test_auth.py</div>
        </div>
      </div>

      {/* Gradient Transition Arrow */}
      <div className="hidden md:flex md:col-span-1 justify-center text-white/30">
        <ArrowRight className="w-5 h-5 text-emerald-400 animate-pulse"/>
      </div>

      {/* Proof Map Mosaic (Right 6 cols) */}
      <div className="md:col-span-6 bg-[#0B0D10]/80 rounded-xl border border-white/10 p-4 shadow-xl">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10 font-mono text-[10px] text-[#9AA3AE]">
          <span className="text-white font-bold">PROOF MAP MOSAIC</span>
          <span className="text-emerald-400">92% COVERAGE</span>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[
            { tag: 'SQL', val: '94%', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            { tag: 'API', val: '100%', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            { tag: 'TEST', val: '88%', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            { tag: 'AUTH', val: '91%', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            { tag: 'DOCS', val: '75%', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
            { tag: 'LINT', val: '100%', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
            { tag: 'SEC', val: '82%', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
            { tag: 'PERF', val: '90%', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
        ].map((item, idx) => (<motion.div key={item.tag} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: idx * 0.05 }} className={`p-2 rounded border flex flex-col items-center justify-center font-mono ${item.color}`}>
              <span className="text-[9px] font-bold">{item.tag}</span>
              <span className="text-xs font-black">{item.val}</span>
            </motion.div>))}
        </div>
      </div>
    </motion.div>);
};
/* -------------------------------------------------------------------------- */
/* PANEL 3: Checks                                                            */
/* Three code files going through a gate: one passes (green tick),            */
/* two are stopped with red HOLLOW tags                                       */
/* -------------------------------------------------------------------------- */
const ChecksVisual = () => {
    return (<motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} className="w-full max-w-xl flex flex-col items-center gap-4">
      <div className="w-full space-y-3">
        {/* File 1: Passing */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1A1F26] border border-emerald-500/40 shadow-lg">
          <div className="flex items-center gap-3 font-mono text-xs text-white">
            <FileCode2 className="w-4 h-4 text-emerald-400"/>
            <span>src/db/transaction_manager.py</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/40">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400"/>
            <span>PASS · AST VERIFIED</span>
          </div>
        </div>

        {/* Central Inspection Gate Graphic */}
        <div className="flex items-center justify-center gap-2 py-1 font-mono text-[10px] text-[#9AA3AE] uppercase tracking-widest">
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
          <span className="px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-white font-bold">
            DETERMINISTIC GATE
          </span>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"/>
        </div>

        {/* File 2: Stopped with HOLLOW tag */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1A1F26] border border-red-500/30 shadow-lg opacity-80">
          <div className="flex items-center gap-3 font-mono text-xs text-[#9AA3AE]">
            <FileText className="w-4 h-4 text-red-400"/>
            <span>resume_claim_distributed_sql.pdf</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/20 text-red-400 font-mono text-[11px] font-bold border border-red-500/50">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400"/>
            <span>STOPPED · HOLLOW (NO CODE)</span>
          </div>
        </div>

        {/* File 3: Stopped with HOLLOW tag */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1A1F26] border border-red-500/30 shadow-lg opacity-80">
          <div className="flex items-center gap-3 font-mono text-xs text-[#9AA3AE]">
            <FileCode2 className="w-4 h-4 text-red-400"/>
            <span>stubs/mock_oauth_provider.ts</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-500/20 text-red-400 font-mono text-[11px] font-bold border border-red-500/50">
            <ShieldAlert className="w-3.5 h-3.5 text-red-400"/>
            <span>STOPPED · HOLLOW (MOCK ONLY)</span>
          </div>
        </div>
      </div>
    </motion.div>);
};
/* -------------------------------------------------------------------------- */
/* PANEL 4: Status                                                            */
/* Four rubber stamps (PROVEN, BASIC, NOT SHOWN IN SCOPE, UNCLEAR) landing    */
/* on four requirement rows                                                   */
/* -------------------------------------------------------------------------- */
const StatusVisual = () => {
    return (<motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} className="w-full max-w-xl space-y-3 font-mono text-xs">
      {/* Row 1: PROVEN */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#151921] border border-white/10">
        <span className="text-white font-medium">PostgreSQL Transaction Isolation</span>
        <motion.div initial={{ scale: 1.5, rotate: -8, opacity: 0 }} animate={{ scale: 1, rotate: -3, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }} className="px-3 py-1 rounded border-2 border-emerald-400 text-emerald-400 font-black tracking-wider uppercase bg-emerald-500/10 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
          PROVEN
        </motion.div>
      </div>

      {/* Row 2: BASIC */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#151921] border border-white/10">
        <span className="text-white font-medium">REST API Endpoint Architecture</span>
        <motion.div initial={{ scale: 1.5, rotate: 6, opacity: 0 }} animate={{ scale: 1, rotate: 2, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }} className="px-3 py-1 rounded border-2 border-blue-400 text-blue-400 font-black tracking-wider uppercase bg-blue-500/10">
          BASIC
        </motion.div>
      </div>

      {/* Row 3: NOT SHOWN IN SCOPE */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#151921] border border-white/10">
        <span className="text-[#9AA3AE]">Distributed Cache & Sharding</span>
        <motion.div initial={{ scale: 1.5, rotate: -5, opacity: 0 }} animate={{ scale: 1, rotate: -2, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.2 }} className="px-3 py-1 rounded border-2 border-white/40 text-white/70 font-black tracking-wider uppercase bg-white/5">
          NOT SHOWN IN SCOPE
        </motion.div>
      </div>

      {/* Row 4: UNCLEAR */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-[#151921] border border-white/10">
        <span className="text-[#9AA3AE]">Event-Driven Microservices</span>
        <motion.div initial={{ scale: 1.5, rotate: 8, opacity: 0 }} animate={{ scale: 1, rotate: 3, opacity: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }} className="px-3 py-1 rounded border-2 border-amber-400 text-amber-400 font-black tracking-wider uppercase bg-amber-500/10">
          UNCLEAR
        </motion.div>
      </div>
    </motion.div>);
};
/* -------------------------------------------------------------------------- */
/* PANEL 5: Contract                                                          */
/* A dashed card "If you add one query and one test" with an arrow from       */
/* NOT SHOWN to PROVEN                                                        */
/* -------------------------------------------------------------------------- */
const ContractVisual = () => {
    return (<motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} className="w-full max-w-lg">
      <div className="rounded-2xl border-2 border-dashed border-emerald-400/60 bg-[#141922] p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 font-mono text-xs">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Sparkles className="w-4 h-4"/>
            <span>CONTRACT_PREDICTION #3</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
            +18% READINESS
          </span>
        </div>

        <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-2">
          &ldquo;If you add one query and one test&rdquo;
        </h3>
        <p className="font-mono text-xs text-[#9AA3AE] mb-5">
          Deterministic path to satisfy requirement: PostgreSQL Transactions.
        </p>

        {/* Status Flip Arrow */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/10 font-mono text-xs">
          <span className="px-2.5 py-1 rounded border border-white/30 text-[#9AA3AE] line-through">
            NOT SHOWN IN SCOPE
          </span>
          <ArrowRight className="w-4 h-4 text-emerald-400 animate-pulse"/>
          <span className="px-2.5 py-1 rounded border-2 border-emerald-400 text-emerald-300 font-bold bg-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.3)]">
            PROVEN
          </span>
        </div>
      </div>
    </motion.div>);
};
/* -------------------------------------------------------------------------- */
/* PANEL 6: Update                                                            */
/* A push icon, a pulsing tile, a stamp flipping, a timer "verdict in seconds"*/
/* -------------------------------------------------------------------------- */
const UpdateVisual = () => {
    return (<motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.3 }} className="w-full max-w-lg space-y-4 font-mono">
      {/* Push Icon + Branch Commit Card */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#151921] border border-white/15 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            <GitCommit className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }}/>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-xs">git push origin main</span>
            <span className="text-[11px] text-[#9AA3AE]">commit 8f3a9e1: feat(db): add isolation test</span>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-white/10 text-emerald-300 text-[10px] font-bold">
          LIVE HOOK
        </span>
      </div>

      {/* Pulsing Tile with Stamp Flipping & Timer */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Pulsing Tile with Flipping Stamp */}
        <div className="p-4 rounded-xl bg-[#151921] border border-emerald-500/40 flex flex-col items-center justify-center gap-2 shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"/>
          <span className="text-[10px] text-[#9AA3AE] uppercase">STAMP FLIPPED</span>
          <motion.div initial={{ rotateX: 90, opacity: 0 }} animate={{ rotateX: 0, opacity: 1 }} transition={{ type: 'spring', damping: 15 }} className="px-3 py-1 rounded border-2 border-emerald-400 text-emerald-300 font-black text-sm bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.4)]">
            PROVEN ✓
          </motion.div>
        </div>

        {/* Timer "verdict in seconds" */}
        <div className="p-4 rounded-xl bg-[#151921] border border-white/10 flex flex-col items-center justify-center gap-2 shadow-lg">
          <Clock className="w-4 h-4 text-violet-400"/>
          <span className="text-white font-black text-base">4.2s</span>
          <span className="text-[10px] text-[#9AA3AE] uppercase">VERDICT IN SECONDS</span>
        </div>
      </div>
    </motion.div>);
};
