import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, UserCheck } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { AuthSplitLayout } from '../../components/layout/AuthSplitLayout';
import { AuthPanel, AuthItem } from '../../components/auth/AuthPanel';
import { StepPreview } from '../../components/auth/StepPreview';
import { WhatWeAskGithubCard } from '../../components/auth/WhatWeAskGithubCard';
import { CustomCheckbox } from '../../components/auth/CustomCheckbox';
import { Button } from '../../components/ui/Button';
import { getMockAuthPath } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
export const SignupPage = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const headingRef = useRef(null);
    const shouldReduceMotion = useReducedMotion();
    const [agreedReadOnly, setAgreedReadOnly] = useState(false);
    const [agreedPrivacy, setAgreedPrivacy] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submittingProvider, setSubmittingProvider] = useState(null);
    const [githubHandle, setGithubHandle] = useState(() => {
        return typeof window !== 'undefined' ? (localStorage.getItem('ps_github_username') || '307vedanttt') : '307vedanttt';
    });
    const { refreshUser, loginWithApiKey } = useAuth();
    const isFormComplete = agreedReadOnly && agreedPrivacy;
    useEffect(() => {
        // Redirect signed-in users away from /signup
        if (!loading && user) {
            navigate('/app', { replace: true });
        }
        // Move focus to heading on route load
        headingRef.current?.focus();
    }, [user, loading, navigate]);
    const handleGithubSignup = async (e) => {
        e.preventDefault();
        if (!isFormComplete)
            return;
        setIsSubmitting(true);
        setSubmittingProvider('github');
        const authPath = getMockAuthPath();
        if (authPath === 'declined') {
            navigate('/auth/error?reason=declined');
            return;
        }
        else if (authPath === 'rate_limited') {
            navigate('/auth/rate-limited?retry_after=45');
            return;
        }
        const targetUser = (githubHandle || '307vedanttt').trim().replace(/^@/, '');
        if (typeof window !== 'undefined') {
            localStorage.setItem('ps_github_username', targetUser);
        }
        try {
            await loginWithApiKey('ps_live_github_verified', targetUser);
            await refreshUser();
            navigate('/app', { replace: true });
        }
        catch {
            navigate('/auth/consent');
        }
        finally {
            setIsSubmitting(false);
            setSubmittingProvider(null);
        }
    };
    const handleGoogleSignup = async (e) => {
        e.preventDefault();
        if (!isFormComplete)
            return;
        setIsSubmitting(true);
        setSubmittingProvider('google');
        const targetUser = (githubHandle || '307vedanttt').trim().replace(/^@/, '');
        if (typeof window !== 'undefined') {
            localStorage.setItem('ps_github_username', targetUser);
        }
        try {
            await loginWithApiKey('ps_live_google_verified', targetUser);
            await refreshUser();
            navigate('/app', { replace: true });
        }
        catch {
            navigate('/app', { replace: true });
        }
        finally {
            setIsSubmitting(false);
            setSubmittingProvider(null);
        }
    };
    return (<AuthSplitLayout tagline="TERMINAL HANDSHAKE // ACCESS TIER" headline={<>
          Start with what your code{' '}
          <span className="font-serif italic font-normal text-[#34D399] tracking-normal">
            already proves
          </span>
          .
        </>} leftContent={<StepPreview />} rightContent={<div className="w-full flex justify-center">
          <AuthPanel badge="REGISTER_V3.8" icon={<UserCheck className="w-4 h-4 text-[#34D399]"/>}>
            {/* Header */}
            <AuthItem className="mb-4">
              <h2 ref={headingRef} tabIndex={-1} className="text-2xl font-bold tracking-tight text-white mb-1 focus:outline-none">
                Create your account
              </h2>
              <p className="text-xs text-[#9AA3AE]">
                Sign up strictly through GitHub or Google OAuth. Zero passwords.
              </p>
            </AuthItem>

            {/* What We Ask GitHub For Receipt Card */}
            <AuthItem className="mb-4">
              <WhatWeAskGithubCard />
            </AuthItem>

            {/* Optional GitHub Username input for immediate repo discovery */}
            <AuthItem className="mb-4">
              <label htmlFor="github-handle-input" className="block text-[11px] font-mono text-[#9AA3AE] mb-1.5 flex items-center justify-between">
                <span>GitHub Username (Optional)</span>
                <span className="text-[#34D399] text-[10px]">Auto-discovers repos</span>
              </label>
              <input id="github-handle-input" name="githubHandle" type="text" value={githubHandle} onChange={(e) => setGithubHandle(e.target.value)} placeholder="e.g. 307vedanttt or your username" className="w-full h-10 px-3.5 rounded-lg bg-[#0E1528] border border-white/10 text-white font-mono text-xs placeholder-[#9AA3AE]/40 focus:outline-none focus:border-[#34D399] transition-colors"/>
            </AuthItem>

            {/* Interactive Custom Checkboxes */}
            <AuthItem className="space-y-3 mb-5">
              <CustomCheckbox id="check-readonly" checked={agreedReadOnly} onChange={setAgreedReadOnly} describedBy="signup-button-helper" label="I understand ProofStack only reads my code, never changes it."/>
              <CustomCheckbox id="check-privacy" checked={agreedPrivacy} onChange={setAgreedPrivacy} describedBy="signup-button-helper" label={<span>
                    I agree to the{' '}
                    <span className="text-[#34D399] underline underline-offset-2">
                      Privacy notice
                    </span>
                    .
                  </span>}/>
            </AuthItem>

            {/* Helper description for screen readers */}
            <div id="signup-button-helper" className="sr-only">
              {isFormComplete
                ? 'Both terms accepted. Sign up with GitHub or Google is enabled.'
                : 'Both checkboxes must be accepted before connecting GitHub or Google.'}
            </div>

            {/* Primary Action Button 1: Sign up with GitHub */}
            <AuthItem className="mb-3">
              <motion.div animate={isFormComplete && !shouldReduceMotion
                ? {
                    boxShadow: [
                        '0 0 0 rgba(52,211,153,0)',
                        '0 0 24px rgba(52,211,153,0.5)',
                        '0 0 10px rgba(52,211,153,0.2)',
                    ],
                }
                : {}} transition={{ duration: 0.6 }} className="rounded-[8px]">
                <a href="/auth/github/start" onClick={handleGithubSignup} aria-disabled={!isFormComplete} aria-describedby="signup-button-helper" className={`w-full block focus-visible:outline-none ${!isFormComplete ? 'pointer-events-none' : ''}`}>
                  <Button type="button" variant={isFormComplete ? 'solid_paper' : 'solid_ink'} size="lg" disabled={!isFormComplete || isSubmitting} isLoading={isSubmitting && submittingProvider === 'github'} className={`w-full text-xs sm:text-sm font-semibold tracking-tight min-h-[50px] transition-all duration-300 ${isFormComplete
                ? 'border-[#34D399]/40 shadow-lg'
                : 'opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-[#6B7280]'}`} icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                      </svg>}>
                    Sign up with GitHub
                  </Button>
                </a>
              </motion.div>
            </AuthItem>

            {/* Primary Action Button 2: Sign up with Google */}
            <AuthItem className="mb-4">
              <a href="/auth/google/start" onClick={handleGoogleSignup} aria-disabled={!isFormComplete} aria-describedby="signup-button-helper" className={`w-full block focus-visible:outline-none ${!isFormComplete ? 'pointer-events-none' : ''}`}>
                <Button type="button" variant={isFormComplete ? 'solid_paper' : 'solid_ink'} size="lg" disabled={!isFormComplete || isSubmitting} isLoading={isSubmitting && submittingProvider === 'google'} className={`w-full text-xs sm:text-sm font-semibold tracking-tight min-h-[50px] transition-all duration-300 ${!isFormComplete
                ? 'opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-[#6B7280]'
                : 'shadow-md border-[#34D399]/30'}`} icon={<svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>}>
                  Sign up with Google
                </Button>
              </a>
            </AuthItem>

            {/* Privacy & Instant Deletion Guarantee */}
            <AuthItem className="mb-5 flex items-center justify-center gap-1.5 font-mono text-[11px] text-[#9AA3AE]">
              <Lock className="w-3.5 h-3.5 text-[#34D399]"/>
              <span>Only GitHub & Google OAuth supported. No passwords or email collection.</span>
            </AuthItem>

            {/* Footer Navigation Link */}
            <AuthItem className="text-center text-xs text-[#6B7280] border-t border-white/[0.06] pt-4">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-white hover:text-[#34D399] transition-colors underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#34D399] rounded px-1">
                Sign in
              </Link>
            </AuthItem>
          </AuthPanel>
        </div>}/>);
};
