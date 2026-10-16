import React, { useRef, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Stamp } from '../../components/stamps/Stamp';
import { Button } from '../../components/ui/Button';

// Safe allowlist of known reason keys and human-readable explanations
const ALLOWED_REASONS: Record<string, string> = {
  declined: 'The authorization request was declined.',
  access_denied: 'Access was denied by GitHub provider.',
  session_expired: 'The sign-in window timed out.',
  state_mismatch: 'Security handshake token mismatch.',
  state: 'Security handshake token mismatch.',
  network_error: 'Unable to reach identity provider.',
};

const DEFAULT_ERROR_MESSAGE = 'Authentication could not be completed.';

export const AuthErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Validate reason query param strictly against allowlist
  const rawReason = searchParams.get('reason');
  const sanitizedReason = rawReason && ALLOWED_REASONS[rawReason] 
    ? ALLOWED_REASONS[rawReason] 
    : DEFAULT_ERROR_MESSAGE;

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0C0F] text-[#F7F5F0] flex flex-col items-center justify-center p-4 sm:p-6 relative select-none">
      {/* Background Dot Grid */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" 
        aria-hidden="true" 
      />

      {/* Red Ambient Glow (allowed strictly on error screen) */}
      <div 
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#C2362B]/15 rounded-full blur-[140px] pointer-events-none" 
        aria-hidden="true" 
      />

      {/* Error Card with single 4px horizontal shake */}
      <motion.div
        initial={shouldReduceMotion ? false : { x: 0 }}
        animate={
          shouldReduceMotion
            ? {}
            : { x: [0, -4, 4, -4, 4, 0] }
        }
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-md rounded-[18px] bg-[#12161B] border border-[#C2362B]/40 p-6 sm:p-8 shadow-[0_24px_50px_-12px_rgba(194,54,43,0.3)] backdrop-blur-xl"
      >
        {/* Top Header Badge */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#FF5C4D]" />
            <span className="font-mono text-[10px] tracking-wider text-[#FF5C4D] uppercase">
              Authentication Refused
            </span>
          </div>
          <Stamp status="refused" size="sm" animate={false} />
        </div>

        {/* Heading & Live Error Announcement */}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="text-2xl font-bold tracking-tight text-white mb-2 focus:outline-none"
        >
          Sign in failed
        </h1>

        <div
          data-testid="error-message"
          role="status"
          aria-live="polite"
          className="p-3.5 rounded-[8px] bg-[#C2362B]/10 border border-[#C2362B]/30 mb-6 font-mono text-xs text-[#FF5C4D]"
        >
          {sanitizedReason}
        </div>


        <p className="text-xs text-[#9AA3AE] leading-relaxed mb-6 font-sans">
          Your credentials were not verified. You can retry with GitHub or inspect public repositories without signing in.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            type="button"
            variant="solid_paper"
            size="lg"
            onClick={() => navigate('/login')}
            className="w-full text-xs sm:text-sm font-semibold tracking-tight shadow-md min-h-[52px]"
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Try again
          </Button>

          <Link
            to="/scan"
            className="w-full block py-3 px-4 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-center text-xs text-[#9AA3AE] hover:text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399]"
          >
            <div className="flex items-center justify-center gap-2">
              <span>Scan without signing in</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#34D399] group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
