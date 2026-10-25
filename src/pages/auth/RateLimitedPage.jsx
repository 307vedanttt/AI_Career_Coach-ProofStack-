import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Clock, RefreshCw, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Stamp } from '../../components/stamps/Stamp';
export const RateLimitedPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const headingRef = useRef(null);
    // Validate retry_after query parameter strictly as a number
    const rawRetryAfter = searchParams.get('retry_after');
    const parsedSeconds = rawRetryAfter && !isNaN(Number(rawRetryAfter)) && Number(rawRetryAfter) > 0
        ? Math.min(Math.floor(Number(rawRetryAfter)), 3600) // cap to 1 hour
        : 45; // computed fallback
    const [secondsRemaining, setSecondsRemaining] = useState(parsedSeconds);
    useEffect(() => {
        headingRef.current?.focus();
    }, []);
    useEffect(() => {
        if (secondsRemaining <= 0)
            return;
        const timer = setInterval(() => {
            setSecondsRemaining((prev) => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [secondsRemaining]);
    const formatTime = (totalSeconds) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };
    return (<div className="min-h-screen bg-[#0A0C0F] text-[#F7F5F0] flex flex-col items-center justify-center p-4 sm:p-6 relative select-none">
      {/* Background Dot Grid */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px]" aria-hidden="true"/>

      {/* Amber Ambient Glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#B7791F]/10 rounded-full blur-[140px] pointer-events-none" aria-hidden="true"/>

      <div className="relative z-10 w-full max-w-md rounded-[18px] bg-[#12161B] border border-white/10 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        {/* Header Badge */}
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#F5A524]"/>
            <span className="font-mono text-[10px] tracking-wider text-[#F5A524] uppercase">
              Rate Limit In Effect
            </span>
          </div>
          <Stamp status="basic" size="sm" label="RATE LIMITED" animate={false}/>
        </div>

        {/* Heading */}
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight text-white mb-2 focus:outline-none">
          Too many attempts
        </h1>

        <p className="text-xs text-[#9AA3AE] leading-relaxed mb-6 font-sans">
          The verification throttle is active to preserve node integrity. Please wait before retrying.
        </p>

        {/* Countdown Box */}
        <div className="p-6 rounded-[12px] bg-white/[0.03] border border-white/10 text-center mb-6">
          <span className="font-mono text-[10px] tracking-wider text-[#9AA3AE] uppercase block mb-1">
            Cooldown Remaining
          </span>
          <div role="timer" aria-live="polite" className="font-mono text-4xl sm:text-5xl font-extrabold text-[#F5A524] tracking-tight">
            {formatTime(secondsRemaining)}
          </div>
          <span className="font-mono text-[11px] text-[#6B7280] mt-1 block">
            {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'Cooldown window elapsed'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button type="button" variant={secondsRemaining === 0 ? 'solid_paper' : 'solid_ink'} size="lg" disabled={secondsRemaining > 0} onClick={() => navigate('/login')} className={`w-full text-xs sm:text-sm font-semibold tracking-tight shadow-md min-h-[52px] ${secondsRemaining === 0 ? 'border-[#34D399]/40' : 'opacity-50'}`} icon={<RefreshCw className="w-4 h-4"/>}>
            {secondsRemaining === 0 ? 'Retry now' : 'Please wait for timer'}
          </Button>

          <Link to="/login" className="w-full block py-3 px-4 rounded-[8px] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-center text-xs text-[#9AA3AE] hover:text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399]">
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft className="w-3.5 h-3.5 text-[#34D399] group-hover:-translate-x-1 transition-transform"/>
              <span>Return to sign in</span>
            </div>
          </Link>
        </div>
      </div>
    </div>);
};
