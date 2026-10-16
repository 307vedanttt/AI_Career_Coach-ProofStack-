import React, { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { gsap } from 'gsap';
import { Stamp } from '../stamps/Stamp';
import { ReceiptCard } from '../receipt/ReceiptCard';
import { CodeBlock } from '../ui/CodeBlock';
import { Button } from '../ui/Button';
import { Shield, ArrowRight, GitCommit, Play, Sparkles, FileText } from 'lucide-react';
import { JobPostingIntakeModal } from '../posting/JobPostingIntakeModal';

export const HeroSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [stampLanded, setStampLanded] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);

  // Headline words for word-by-word reveal (blur 8px -> 0, translateY 20 -> 0, 60ms stagger)
  const headlineWords = [
    'Don’t',
    'claim',
    'it.',
    'Commit',
    'it.',
    'Evidence',
    'coverage',
    'for',
    'every',
    'commit.',
  ];

  // Mouse Parallax Effect on Hero Receipt Cards
  useEffect(() => {
    if (shouldReduceMotion) return;

    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;
    let animationFrameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const y = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

      // Rotate 1 to 2 degrees following mouse
      targetRotX = -y * 2; // slight tilt on X axis
      targetRotY = x * 2.5; // slight tilt on Y axis
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const updateParallax = () => {
      currentRotX += (targetRotX - currentRotX) * 0.08;
      currentRotY += (targetRotY - currentRotY) * 0.08;

      if (cardsContainerRef.current) {
        cardsContainerRef.current.style.transform = `perspective(1000px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`;
      }
      animationFrameId = requestAnimationFrame(updateParallax);
    };

    animationFrameId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shouldReduceMotion]);

  // PROVEN stamp slam effect:
  // scale 2.2 to 1, opacity 0 to 1, rotation -12 to -4 degrees, a 4px screen shake, and an ink ring that expands (350ms).
  useEffect(() => {
    if (shouldReduceMotion) {
      setStampLanded(true);
      return;
    }

    const timer = setTimeout(() => {
      setStampLanded(true);

      // Trigger 4px screen shake
      setIsShaking(true);
      if (heroRef.current) {
        gsap.to(heroRef.current, {
          x: '+=4',
          y: '-=4',
          yoyo: true,
          repeat: 3,
          duration: 0.05,
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

  const sampleSnippet = `from fastapi import APIRouter, Depends
from db.models import OrderReceipt

router = APIRouter(prefix="/orders")

@router.post("/", response_model=OrderReceipt)
async def create_order(payload: OrderPayload):
    # Verified invariant pipeline
    return await orderService.process(payload)`;

  return (
    <section
      ref={heroRef}
      className={`relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden ${
        isShaking ? 'shake-active' : ''
      }`}
      aria-label="ProofStack Introduction Hero"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[550px] bg-emerald-500/10 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 right-10 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[180px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Eyebrow, Word-by-word Headline, Subheading, CTAs */}
          <div className="lg:col-span-6 space-y-8 z-10">
            {/* Eyebrow Pill */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-semibold tracking-wider uppercase"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>DETERMINISTIC EVIDENCE LEDGER</span>
            </motion.div>

            {/* Word-by-word Headline Reveal */}
            <h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[64px] leading-[1.08] text-white tracking-tight flex flex-wrap gap-x-3 gap-y-1"
              aria-label="Don’t claim it. Commit it. Evidence coverage for every commit."
            >
              {headlineWords.map((word, idx) => {
                const isSpecial = word === 'Commit' || word === 'Evidence' || word === 'it.';
                return (
                  <motion.span
                    key={idx}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1, transform: 'translateY(0)' }
                        : { opacity: 0, transform: 'translateY(20px)', filter: 'blur(8px)' }
                    }
                    animate={{
                      opacity: 1,
                      transform: 'translateY(0px)',
                      filter: 'blur(0px)',
                    }}
                    transition={{
                      duration: 0.4,
                      delay: shouldReduceMotion ? 0 : idx * 0.06,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className={`inline-block ${
                      isSpecial
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-200 bg-clip-text text-transparent font-medium'
                        : 'text-white'
                    }`}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </h1>

            {/* Subheading Narrative */}
            <motion.p
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.4 }}
              className="text-base sm:text-lg text-[#9AA3AE] max-w-xl leading-relaxed"
            >
              ProofStack monitors your repository commits and generates physical, tamper-evident proof
              receipts. No inflated keyword resume bullet points — only irrefutable code evidence.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: shouldReduceMotion ? 0 : 0.5 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Button
                variant="solid_paper"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('how-it-works');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                icon={<ArrowRight className="w-4 h-4 text-[#14171A]" />}
                aria-label="Analyze my repository now"
              >
                Analyze My Repo
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => setIsIntakeOpen(true)}
                icon={<FileText className="w-4 h-4" />}
                aria-label="Paste job posting to intake"
              >
                Paste Job Posting
              </Button>

              <Button
                variant="ghost"
                size="lg"
                onClick={() => {
                  const el = document.getElementById('problem');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                icon={<Play className="w-3.5 h-3.5" />}
              >
                See How It Proves It
              </Button>
            </motion.div>

            {/* Modal for Beat 2: Job Posting Intake */}
            <JobPostingIntakeModal
              isOpen={isIntakeOpen}
              onClose={() => setIsIntakeOpen(false)}
            />


            {/* Quick Proof Metrics Micro-Strip */}
            <motion.div
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: shouldReduceMotion ? 0 : 0.6 }}
              className="flex items-center gap-6 pt-4 text-xs font-mono text-[#9AA3AE] border-t border-white/[0.06]"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Zero keyword inflation</span>
              </div>
              <div className="flex items-center gap-2">
                <GitCommit className="w-3.5 h-3.5 text-emerald-400" />
                <span>Deterministic Merkle root</span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Hero Physical Receipt Cards with Mouse Parallax & Stamp Slam */}
          <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
            <div
              ref={cardsContainerRef}
              className="relative w-full max-w-[480px] transition-transform duration-100 ease-out will-change-transform"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Secondary background card for physical stacking illusion */}
              <div
                className="absolute inset-0 bg-[#EFECE6] rounded-xl transform rotate-3 translate-x-4 translate-y-3 shadow-2xl opacity-70 pointer-events-none -z-10"
                aria-hidden="true"
              />

              {/* Primary Physical Receipt Card */}
              <ReceiptCard
                serial="CC-SPEC-0842 // COMMIT_CONTRACT"
                timestamp="2026-10-16 14:02:18 UTC"
                tilt={false}
                showBarcode={true}
                className="relative overflow-visible"
              >
                <div className="space-y-4">
                  <div>
                    <h3 className="font-display text-2xl text-[#14171A] font-bold tracking-tight">
                      Order Pipeline Verification
                    </h3>
                    <p className="text-xs font-mono text-[#6B7280] mt-0.5">
                      Checked against 3 invariant test assertions
                    </p>
                  </div>

                  {/* Clean Code Preview */}
                  <CodeBlock
                    code={sampleSnippet}
                    fileName="api/routes/orders.py"
                    highlightLines={[8]}
                    highlightType="emerald"
                  />

                  {/* Receipt Footer Specs */}
                  <div className="flex items-center justify-between pt-3 border-t border-dashed border-[#D3CDBD] font-mono text-[11px] text-[#6B7280]">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Invariant checks satisfied</span>
                    </span>
                    <span className="text-[#14171A] font-bold">sha256:9f3c2ab</span>
                  </div>
                </div>

                {/* PROVEN Slam Stamp (scale 2.2 -> 1, opacity 0 -> 1, rotation -12 -> -4, 350ms) */}
                <div
                  className="absolute -top-5 -right-5 z-30 pointer-events-none select-none"
                  aria-hidden="true"
                >
                  <motion.div
                    initial={
                      shouldReduceMotion
                        ? { scale: 1, opacity: 1, rotate: -4 }
                        : { scale: 2.2, opacity: 0, rotate: -12 }
                    }
                    animate={
                      stampLanded
                        ? { scale: 1, opacity: 1, rotate: -4 }
                        : { scale: 2.2, opacity: 0, rotate: -12 }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.35,
                      ease: [0.18, 0.89, 0.32, 1.28], // sharp impact curve
                    }}
                    className="relative"
                  >
                    <Stamp status="proven" size="lg" animate={false} />

                    {/* Expanding Ink Ring Ripple Effect on Impact */}
                    {stampLanded && !shouldReduceMotion && (
                      <motion.span
                        initial={{ scale: 0.6, opacity: 0.9 }}
                        animate={{ scale: 2.4, opacity: 0 }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        className="absolute inset-0 rounded-lg border-2 border-emerald-400 pointer-events-none"
                      />
                    )}
                  </motion.div>
                </div>
              </ReceiptCard>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
