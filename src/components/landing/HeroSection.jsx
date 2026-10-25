import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Stamp } from '../stamps/Stamp';
import { ReceiptCard } from '../receipt/ReceiptCard';
import { Button } from '../ui/Button';
import { ArrowRight, GitCommit, Play, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { JobPostingIntakeModal } from '../posting/JobPostingIntakeModal';
import { DecryptedText } from '../ui/motion/DecryptedText';
import { BorderBeam } from '../ui/motion/BorderBeam';
import { ShinyText } from '../ui/motion/ShinyText';
import { KineticFlipText } from '../ui/motion/KineticFlipText';
gsap.registerPlugin(ScrollTrigger);
export const HeroSection = () => {
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();
    const heroRef = useRef(null);
    const heroLeftRef = useRef(null);
    const cardsScrollWrapperRef = useRef(null);
    const cardsContainerRef = useRef(null);
    const [stampLanded, setStampLanded] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [isIntakeOpen, setIsIntakeOpen] = useState(false);
    const [isSimulatingCommit, setIsSimulatingCommit] = useState(false);
    const [activeClaimIndex, setActiveClaimIndex] = useState(null);
    const [heroView, setHeroView] = useState('receipt');
    // Trigger tactile resume verification on the physical receipt
    const handleVerifyReceipt = () => {
        if (isSimulatingCommit)
            return;
        setIsSimulatingCommit(true);
        setStampLanded(false);
        setActiveClaimIndex(0);
        // Step 1: Sequential claim verification scan
        setTimeout(() => {
            setActiveClaimIndex(1);
        }, 150);
        setTimeout(() => {
            setActiveClaimIndex(2);
        }, 300);
        // Step 2: Final AST proof & rubber stamp slam impact
        setTimeout(() => {
            setActiveClaimIndex(null);
            setIsShaking(true);
            setStampLanded(true);
            if (heroRef.current && !shouldReduceMotion) {
                gsap.to(heroRef.current, {
                    x: '+=3',
                    y: '-=3',
                    yoyo: true,
                    repeat: 3,
                    duration: 0.04,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set(heroRef.current, { x: 0, y: 0 });
                        setIsShaking(false);
                        setIsSimulatingCommit(false);
                    },
                });
            }
            else {
                setIsShaking(false);
                setIsSimulatingCommit(false);
            }
        }, 480);
    };
    // Bidirectional GSAP Scrub & 3D Scroll Perspective Effect
    useEffect(() => {
        if (shouldReduceMotion)
            return;
        let targetRotX = 0;
        let targetRotY = 0;
        let currentRotX = 0;
        let currentRotY = 0;
        let animationFrameId;
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX / innerWidth - 0.5) * 2;
            const y = (e.clientY / innerHeight - 0.5) * 2;
            targetRotX = -y * 5.0;
            targetRotY = x * 6.5;
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        // GSAP ScrollTrigger context with bidirectional scrub
        const ctx = gsap.context(() => {
            // 1. Left Hero content smoothly recedes in 3D on scroll down and returns on scroll up
            if (heroLeftRef.current && heroRef.current) {
                gsap.to(heroLeftRef.current, {
                    y: -90,
                    opacity: 0.2,
                    scale: 0.94,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom 40%',
                        scrub: 0.8,
                    },
                });
            }
            // 2. Right Docket Card floats, rotates, and unrolls with depth scrub
            if (cardsScrollWrapperRef.current && heroRef.current) {
                gsap.fromTo(cardsScrollWrapperRef.current, {
                    y: 0,
                    rotateX: 2,
                    rotateY: -3,
                    scale: 1,
                }, {
                    y: 110,
                    rotateX: -6,
                    rotateY: 5,
                    scale: 1.04,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: heroRef.current,
                        start: 'top top',
                        end: 'bottom 25%',
                        scrub: 1,
                    },
                });
            }
        }, heroRef);
        // Continuous mouse tilt applied to inner container only (skips layout calculation when Hero is out of view)
        const updateParallax = () => {
            if (window.scrollY < window.innerHeight * 1.15) {
                currentRotX += (targetRotX - currentRotX) * 0.08;
                currentRotY += (targetRotY - currentRotY) * 0.08;
                if (cardsContainerRef.current) {
                    cardsContainerRef.current.style.transform = `perspective(1000px) rotateX(${currentRotX.toFixed(2)}deg) rotateY(${currentRotY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;
                }
            }
            animationFrameId = requestAnimationFrame(updateParallax);
        };
        animationFrameId = requestAnimationFrame(updateParallax);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            ctx.revert();
        };
    }, [shouldReduceMotion]);
    // Initial PROVEN stamp slam effect on mount
    useEffect(() => {
        if (shouldReduceMotion) {
            setStampLanded(true);
            return;
        }
        const timer = setTimeout(() => {
            setStampLanded(true);
            setIsShaking(true);
            if (heroRef.current) {
                gsap.to(heroRef.current, {
                    x: '+=3',
                    y: '-=3',
                    yoyo: true,
                    repeat: 3,
                    duration: 0.04,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        gsap.set(heroRef.current, { x: 0, y: 0 });
                        setIsShaking(false);
                    },
                });
            }
        }, 700);
        return () => clearTimeout(timer);
    }, [shouldReduceMotion]);
    const resumeClaims = [
        {
            claim: 'Architected idempotent order settlement handling 48,000 tx/sec with 0 duplicate transactions.',
            file: 'engine/settlement.rs:L142-168',
            commit: '7f83b16',
            badge: 'AST Hash Match',
        },
        {
            claim: 'Engineered zero-lock distributed state synchronizer using Raft consensus & Redis WAL failover.',
            file: 'consensus/raft_node.go:L84',
            commit: '3e91a0c',
            badge: 'Invariant Proven',
        },
        {
            claim: 'Reduced P99 query latency from 420ms to 24ms via partitioned B-Tree index optimization.',
            file: 'db/partition_index.sql:L45',
            commit: 'b4d8f21',
            badge: 'Benchmark Proven',
        },
    ];
    return (<section ref={heroRef} className={`relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden ${isShaking ? 'shake-active' : ''}`} aria-label="ProofStack Introduction Hero">
      {/* Directional workstation ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[380px] bg-gradient-to-b from-white/[0.03] to-transparent rounded-full blur-[100px] pointer-events-none -z-10"/>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Eyebrow, Word-by-word Headline, Subheading, CTAs */}
          <div ref={heroLeftRef} className="lg:col-span-6 space-y-7 z-10 will-change-transform">
            {/* Eyebrow Pill */}
            <motion.div initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-xs font-medium tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              <KineticFlipText 
                words={[
                  'DETERMINISTIC GIT EVIDENCE',
                  'ZERO RESUME KEYWORD FLUFF',
                  'PHYSICAL AST INVARIANTS',
                  'IMMUTABLE MERKLE LEDGER'
                ]} 
                className="text-emerald-400 font-mono text-xs font-semibold"
              />
            </motion.div>

            {/* Confident Human Headline */}
            <div className="space-y-2">
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[58px] font-bold text-white tracking-tight leading-[1.12] sm:leading-[1.08] break-words">
                Proof over prose.
                <br />
                <span className="text-neutral-400 font-normal">Stop guessing what </span>
                <span className="text-white underline decoration-emerald-500/40 decoration-2 underline-offset-8">
                  engineers
                </span>
                <span className="text-neutral-400 font-normal"> actually built.</span>
              </h1>
            </div>

            {/* Subheading Narrative */}
            <motion.p initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.2 }} className="text-sm sm:text-base md:text-lg text-[#9AA3AE] max-w-xl leading-relaxed font-sans">
              Everyone is a 10x architect on LinkedIn. ProofStack parses real git commits, test assertions,
              and AST call-graphs to generate verifiable proof receipts for technical talent.
            </motion.p>

            {/* Action Buttons */}
            <motion.div initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.3 }} className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 pt-2">
              <Button variant="solid_paper" size="lg" onClick={() => {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('ps_demo_mode', 'true');
            }
            navigate('/app?demo=1');
        }} icon={<ArrowRight className="w-4 h-4 text-[#14171A]"/>} aria-label="Analyze my repository now">
                Analyze My Repo
              </Button>

              <Button variant="ghost" size="lg" onClick={() => setIsIntakeOpen(true)} icon={<FileText className="w-4 h-4"/>} aria-label="Paste job posting to intake">
                Paste Job Posting
              </Button>

              <Button variant="ghost" size="lg" onClick={() => {
            if (window.lenis) {
                window.lenis.scrollTo('#problem', { offset: -70 });
            }
            else {
                const el = document.getElementById('problem');
                el?.scrollIntoView({ behavior: 'smooth' });
            }
        }} icon={<Play className="w-3.5 h-3.5"/>} aria-label="See How It Proves It">
                See Reality Check
              </Button>
            </motion.div>

            {/* Modal for Beat 2: Job Posting Intake */}
            <JobPostingIntakeModal isOpen={isIntakeOpen} onClose={() => setIsIntakeOpen(false)}/>

            {/* Quick Proof Metrics Micro-Strip */}
            <motion.div initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : 0.4 }} className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 sm:gap-6 pt-4 text-xs font-mono text-[#9AA3AE] border-t border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                <span>Zero keyword inflation</span>
              </div>
              <div className="flex items-center gap-2">
                <GitCommit className="w-3.5 h-3.5 text-emerald-400"/>
                <span>Deterministic Git Merkle verification</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Physical Receipt Card with Tactile Parallax & Interactive Verification */}
          <div ref={cardsScrollWrapperRef} className="lg:col-span-6 relative flex flex-col items-center lg:items-end will-change-transform w-full max-w-full" style={{ perspective: '1200px' }}>
            {/* View Switcher Controls */}
            <div className="flex items-center gap-1.5 p-1 mb-4 rounded-xl bg-[#090C12]/90 backdrop-blur-xl border border-white/[0.1] shadow-xl z-20">
              <button
                type="button"
                onClick={() => setHeroView('receipt')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  heroView === 'receipt'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>📄</span> Physical Docket
              </button>
              <button
                type="button"
                onClick={() => setHeroView('creative_3d')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  heroView === 'creative_3d'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>💎</span> 3D Proof Core
              </button>
            </div>

            {/* Dynamic Ambient Holographic Glow behind Receipt */}
            <div className="absolute -inset-6 bg-gradient-to-b from-white/[0.04] to-transparent rounded-3xl blur-3xl opacity-60 pointer-events-none -z-20"/>

            {heroView === 'creative_3d' ? (
              <div className="relative w-full max-w-[490px] rounded-2xl overflow-hidden border border-emerald-500/40 bg-[#0A0D15]/95 p-2 shadow-[0_35px_70px_-15px_rgba(0,0,0,0.8)] backdrop-blur-2xl group transition-all duration-300">
                <div className="relative rounded-xl overflow-hidden aspect-[16/10] bg-black">
                  <img 
                    src="/proofstack_3d_core.jpg" 
                    alt="ProofStack Holographic Proof Prism Monolith" 
                    className="w-full h-full object-cover rounded-xl transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D15] via-transparent to-transparent opacity-80" />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Holographic Proof Prism
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-mono text-neutral-300 bg-[#090C12]/80 backdrop-blur-md p-2.5 rounded-lg border border-white/[0.08]">
                    <span className="font-semibold text-white flex items-center gap-1.5">
                      <span className="text-emerald-400 font-mono">&lt; ↗ &gt;</span>
                      Prism AST Ledger
                    </span>
                    <span className="text-emerald-400 font-bold">100% Deterministic</span>
                  </div>
                </div>
              </div>
            ) : (
            <div ref={cardsContainerRef} className="relative w-full max-w-[490px] transition-transform duration-100 ease-out will-change-transform" style={{ transformStyle: 'preserve-3d' }}>
              {/* Secondary background card for authentic physical stacking illusion */}
              <div className="absolute inset-0 bg-[#F1F5F9] border border-[#CBD5E1] rounded-xl transform rotate-1 sm:rotate-3 translate-x-1 sm:translate-x-4 translate-y-1 sm:translate-y-3 shadow-2xl opacity-80 pointer-events-none -z-10" aria-hidden="true"/>

              {/* Primary Physical Receipt Card */}
              <div data-cursor="PROOF" className="w-full">
                <ReceiptCard serial="RESUME-DOCKET // ALEX_VANCE" timestamp="2026-10-23 14:02:18 UTC" tilt={false} showBarcode={true} className="relative overflow-visible shadow-[0_35px_70px_-15px_rgba(0,0,0,0.65)]">
                <div className="space-y-4">
                  {/* Candidate Profile Header on Receipt */}
                  <div className="flex flex-wrap sm:flex-nowrap items-start justify-between gap-2 pr-6 sm:pr-14">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-sans text-lg sm:text-xl text-[#0F172A] font-bold tracking-tight">
                          Alex Vance
                        </h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold uppercase tracking-wider">
                          Staff Candidate
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#475569] mt-0.5">
                        Lead Systems Architect • 3 AST-Verified Claims
                      </p>
                    </div>
                  </div>

                  {/* Dummy Resume Dossier with Circulating Border Beam & Live Laser Scanline */}
                  <div className="relative rounded-xl overflow-hidden border border-white/[0.08] bg-[#0D0F14] p-3.5 space-y-2.5 text-left shadow-inner">
                    <BorderBeam size={180} duration={6} colorFrom="#10B981" colorTo="#34D399"/>

                    {/* Active Laser Scanline sweep during simulation */}
                    {isSimulatingCommit && (<motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: [0, 260, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} className="absolute inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_rgba(52,211,153,1)] z-20 pointer-events-none"/>)}

                    {/* Resume Experience Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
                        <span className="font-semibold text-white">FinScale Systems</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-400">Lead Platform Eng</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">2023 – PRESENT</span>
                    </div>

                    {/* Resume Claims with Verifiable AST Footnotes */}
                    <div className="space-y-2">
                      {resumeClaims.map((item, idx) => {
            const isHighlighted = activeClaimIndex === idx;
            return (<div key={idx} className={`p-2.5 rounded-lg border transition-all duration-200 ${isHighlighted
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/50'
                    : 'bg-[#12141A] border-white/[0.08] hover:border-white/20'}`}>
                            <p className="text-xs text-slate-200 font-sans leading-relaxed">
                              {item.claim}
                            </p>
                            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono flex-wrap gap-1">
                              <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                                <GitCommit className="w-3 h-3 text-emerald-400"/>
                                {item.file}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-slate-500">#{item.commit}</span>
                                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400"/>
                                  {item.badge}
                                </span>
                              </div>
                            </div>
                          </div>);
        })}
                    </div>
                  </div>

                  {/* Human & AST Review Annotation Note */}
                  <div className="p-2.5 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] text-[#334155] font-mono text-[11px] flex items-start gap-2 shadow-sm">
                    <span className="text-xs shrink-0">📌</span>
                    <span>
                      <strong className="font-semibold text-[#0F172A]">Senior Reviewer & AST Note:</strong> All 3 resume claims cross-referenced with production AST call-graph. Zero keyword inflation detected.
                    </span>
                  </div>

                  {/* Receipt Footer Specs */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 pt-2.5 border-t border-dashed border-[#CBD5E1] font-mono text-[11px] text-[#475569]">
                    <span className="flex items-center gap-1.5 truncate">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                      <DecryptedText text="sha256:7f83b16" speed={28} maxIterations={8} animateOnHover={true} className="font-bold text-[#0F172A] truncate" encryptedClassName="text-emerald-600 font-mono font-bold"/>
                    </span>

                    {/* High-Voltage Interactive Verification Trigger Button */}
                    <button onClick={handleVerifyReceipt} disabled={isSimulatingCommit} className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-mono transition-all flex items-center gap-1.5 shadow-md active:scale-95 shrink-0 ${isSimulatingCommit
            ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.6)] ring-2 ring-emerald-300'
            : 'bg-[#0F172A] hover:bg-slate-900 text-[#F8FAFC] hover:ring-1 hover:ring-emerald-500/50'}`} title="Simulate AST verification scan">
                      <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isSimulatingCommit ? 'animate-spin' : ''}`}/>
                      <span className="font-semibold">{isSimulatingCommit ? 'Scanning Invariants...' : 'Run Live Check'}</span>
                    </button>
                  </div>
                </div>

                {/* PROVEN Slam Stamp (scale 2.2 -> 1, opacity 0 -> 1, rotation -12 -> -4, 350ms) */}
                <div className="absolute -top-3 -right-2 sm:-top-5 sm:-right-4 z-30 pointer-events-none select-none max-w-full" aria-hidden="true">
                  <motion.div initial={shouldReduceMotion
            ? { scale: 0.9, opacity: 1, rotate: -4 }
            : { scale: 2.2, opacity: 0, rotate: -12 }} animate={stampLanded
            ? { scale: 1, opacity: 1, rotate: -4 }
            : { scale: 2.2, opacity: 0, rotate: -12 }} transition={{
            duration: shouldReduceMotion ? 0 : 0.35,
            ease: [0.18, 0.89, 0.32, 1.28], // sharp impact curve
        }} className="relative">
                    <Stamp status="proven" size="md" className="sm:hidden" animate={false}/>
                    <Stamp status="proven" size="lg" className="hidden sm:inline-flex" animate={false}/>

                    {/* Expanding Ink Ring Ripple Effect on Impact */}
                    {stampLanded && !shouldReduceMotion && (<motion.span initial={{ scale: 0.6, opacity: 0.9 }} animate={{ scale: 2.4, opacity: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="absolute inset-0 rounded-lg border-2 border-emerald-400 pointer-events-none"/>)}
                  </motion.div>
                </div>
              </ReceiptCard>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  </section>);
};
