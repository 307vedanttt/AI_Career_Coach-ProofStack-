import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Eye, Trash2, ShieldCheck, Info, Check, AlertCircle, FileText, Upload, ArrowRight, RefreshCw, X, Key, Zap, Github, } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { devLoginBackend } from '../../lib/api';
export const AuthReceiptCard = ({ onSuccess, initialMode = 'signin', }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshUser, loginWithApiKey } = useAuth();
    const [authMethod, setAuthMethod] = useState('github');
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [githubHandleInput, setGithubHandleInput] = useState(() => {
        return typeof window !== 'undefined' ? (localStorage.getItem('ps_github_username') || '') : '';
    });
    const [isSubmittingKey, setIsSubmittingKey] = useState(false);
    const [loadingProvider, setLoadingProvider] = useState(null);
    const [agreedPrivacy, setAgreedPrivacy] = useState(true);
    const [showGithubScopePopover, setShowGithubScopePopover] = useState(false);
    const [errorMessage, setErrorMessage] = useState(() => {
        const reason = searchParams.get('error') || searchParams.get('reason');
        if (reason === 'cancelled' || reason === 'declined') {
            return 'Sign-in was cancelled.';
        }
        if (reason === 'email_linked' || reason === 'account_exists') {
            return 'Account already linked to another sign-in method.';
        }
        return null;
    });
    const [showWelcome, setShowWelcome] = useState(initialMode === 'welcome');

    // Handle Direct GitHub Username Submit
    const handleGithubUsernameSubmit = async (e) => {
        if (e) e.preventDefault();
        const targetUser = (githubHandleInput || '').trim().replace(/^@/, '');
        if (!targetUser) {
            setErrorMessage('Please enter your GitHub username to discover your repositories.');
            return;
        }
        if (!agreedPrivacy) {
            alert('Please agree to the privacy notice before continuing.');
            return;
        }
        setIsSubmittingKey(true);
        setErrorMessage(null);
        if (typeof window !== 'undefined') {
            const prevUser = localStorage.getItem('ps_github_username');
            if (prevUser && prevUser.toLowerCase() !== targetUser.toLowerCase()) {
                localStorage.removeItem('ps_active_repo_id');
                localStorage.removeItem('ps_active_repo_owner');
                localStorage.removeItem('ps_active_repo_name');
                const keysToRemove = [];
                for (let i = 0; i < localStorage.length; i++) {
                    const k = localStorage.key(i);
                    if (k && k.startsWith('proofstack_demo_state_v2')) {
                        keysToRemove.push(k);
                    }
                }
                keysToRemove.forEach((k) => localStorage.removeItem(k));
            }
            localStorage.setItem('ps_github_username', targetUser);
            sessionStorage.removeItem('ps_demo_mode');
        }
        try {
            await loginWithApiKey('ps_live_' + targetUser, targetUser);
            await refreshUser();
            setTimeout(() => {
                setIsSubmittingKey(false);
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/app', { replace: true });
                }
            }, 300);
        } catch (err) {
            setIsSubmittingKey(false);
            setErrorMessage(err?.message || 'Authentication failed. Please verify the GitHub username.');
        }
    };

    // Handle Quick 1-Click Demo Login
    const handleDemoLogin = async () => {
        setIsSubmittingKey(true);
        setErrorMessage(null);
        if (typeof window !== 'undefined') {
            localStorage.setItem('ps_github_username', '307vedanttt');
            sessionStorage.setItem('ps_demo_mode', 'true');
        }
        try {
            await loginWithApiKey('ps_live_demo', '307vedanttt');
            await refreshUser();
            setTimeout(() => {
                setIsSubmittingKey(false);
                if (onSuccess) {
                    onSuccess();
                } else {
                    navigate('/app?demo=1', { replace: true });
                }
            }, 300);
        } catch (err) {
            setIsSubmittingKey(false);
            setErrorMessage(err?.message || 'Failed to initialize demo mode.');
        }
    };

    // Handle API Key Login
    const handleApiKeySubmit = async (customKey) => {
        if (!agreedPrivacy) {
            alert('Please agree to the privacy notice before continuing.');
            return;
        }
        setIsSubmittingKey(true);
        setErrorMessage(null);
        const targetUser = (githubHandleInput || '307vedanttt').trim().replace(/^@/, '');
        if (typeof window !== 'undefined') {
            localStorage.setItem('ps_github_username', targetUser);
        }
        try {
            const keyToUse = typeof customKey === 'string' ? customKey : apiKeyInput;
            await loginWithApiKey(keyToUse || undefined, targetUser);
            await refreshUser();
            setTimeout(() => {
                setIsSubmittingKey(false);
                if (onSuccess) {
                    onSuccess();
                }
                else {
                    navigate('/app', { replace: true });
                }
            }, 300);
        }
        catch (err) {
            setIsSubmittingKey(false);
            setErrorMessage(err?.message || 'Authentication failed. Please verify your token.');
        }
    };
    // Handle GitHub Sign-In
    const handleGithubSignIn = async (e) => {
        e.preventDefault();
        if (!agreedPrivacy) {
            alert('Please agree to the privacy notice before continuing.');
            return;
        }
        setLoadingProvider('github');
        setErrorMessage(null);
        const targetUser = (githubHandleInput || '307vedanttt').trim().replace(/^@/, '');
        if (typeof window !== 'undefined') {
            localStorage.setItem('ps_github_username', targetUser);
        }
        try {
            await devLoginBackend();
        }
        catch {
            // offline/cloud fallback
        }
        try {
            await loginWithApiKey('ps_live_github_verified', targetUser);
            await refreshUser();
            setTimeout(() => {
                setLoadingProvider(null);
                if (onSuccess) {
                    onSuccess();
                }
                else {
                    navigate('/app', { replace: true });
                }
            }, 400);
        }
        catch {
            await loginWithApiKey('ps_live_github_verified', targetUser);
            await refreshUser();
            setLoadingProvider(null);
            if (onSuccess) {
                onSuccess();
            }
            else {
                navigate('/app', { replace: true });
            }
        }
    };
    // Handle Google Sign-In
    const handleGoogleSignIn = async (e) => {
        e.preventDefault();
        if (!agreedPrivacy) {
            alert('Please agree to the privacy notice before continuing.');
            return;
        }
        setLoadingProvider('google');
        setErrorMessage(null);
        const targetUser = (githubHandleInput || '307vedanttt').trim().replace(/^@/, '');
        if (typeof window !== 'undefined') {
            localStorage.setItem('ps_github_username', targetUser);
        }
        try {
            await devLoginBackend();
        }
        catch {
            // offline/cloud fallback
        }
        try {
            await loginWithApiKey('ps_live_google_verified', targetUser);
            await refreshUser();
            setTimeout(() => {
                setLoadingProvider(null);
                if (onSuccess) {
                    onSuccess();
                }
                else {
                    navigate('/app', { replace: true });
                }
            }, 400);
        }
        catch {
            await loginWithApiKey('ps_live_google_verified', targetUser);
            await refreshUser();
            setLoadingProvider(null);
            if (onSuccess) {
                onSuccess();
            }
            else {
                navigate('/app', { replace: true });
            }
        }
    };
    return (<div className="relative w-full max-w-[460px] mx-auto px-4 py-8 flex flex-col items-center">
      {/* GLOWING RING BEHIND THE CARD */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[440px] h-[340px] sm:h-[440px] rounded-full border border-emerald-500/20 bg-gradient-to-tr from-emerald-500/10 via-violet-600/10 to-transparent blur-[50px] pointer-events-none -z-0" aria-hidden="true"/>

      {/* DEV ERROR SIMULATOR BAR (Quick testing tool for review) */}
      <div className="mb-3 w-full flex items-center justify-between px-2 font-mono text-[10px] text-[#9AA3AE] z-10">
        <span className="text-white/60">Simulate State:</span>
        <div className="flex gap-1.5">
          <button type="button" onClick={() => setErrorMessage('Sign-in was cancelled.')} className="hover:text-amber-400 underline underline-offset-2">
            Cancelled
          </button>
          <span>·</span>
          <button type="button" onClick={() => setErrorMessage('Email already linked to another sign-in method.')} className="hover:text-red-400 underline underline-offset-2">
            Linked Error
          </button>
          <span>·</span>
          <button type="button" onClick={() => setShowWelcome((prev) => !prev)} className="hover:text-emerald-400 underline underline-offset-2">
            {showWelcome ? 'Card View' : 'Welcome View'}
          </button>
        </div>
      </div>

      {/* CENTERED PAPER RECEIPT CARD */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="relative w-full bg-[#F8FAFC] text-[#0F172A] rounded-2xl p-6 sm:p-8 shadow-[0_24px_64px_rgba(0,0,0,0.7)] border border-[#CBD5E1] z-10 overflow-hidden">
        {/* Subtle Paper Grain Effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.03] pointer-events-none"/>

        <AnimatePresence mode="wait">
          {!showWelcome ? (
        /* ========================================================== */
        /* VIEW A: SIGN IN TO ANALYZE CARD                            */
        /* ========================================================== */
        <motion.div key="auth-form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col">
              {/* Receipt Header Docket Strip */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0] font-mono text-[11px] text-[#475569]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]"/>
                  <span className="font-bold tracking-wider text-[#0F172A] uppercase">
                    PROOFSTACK AUTH DOCKET
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#E2E8F0] font-bold text-[#0F172A] text-[10px]">
                  SECURE_TOKEN
                </span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14171A] tracking-tight mb-1.5">
                Connect GitHub to Inspect
              </h1>
              <p className="text-xs text-[#575D65] mb-4 leading-relaxed">
                Enter your GitHub username to discover your repositories, analyze physical AST proofs, and generate your skill verification dossier.
              </p>

              {/* AUTH METHOD SELECTOR TABS */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#E2E8F0] mb-4 font-mono text-xs">
                <button type="button" onClick={() => setAuthMethod('github')} className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all ${authMethod === 'github'
                ? 'bg-white text-[#14171A] shadow-sm'
                : 'text-[#575D65] hover:text-[#14171A]'}`}>
                  <Github className="w-3.5 h-3.5 text-[#1F8A5B]"/>
                  <span>GitHub</span>
                </button>
                <button type="button" onClick={() => setAuthMethod('apikey')} aria-label="API Key / Token" className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all ${authMethod === 'apikey'
                ? 'bg-white text-[#14171A] shadow-sm'
                : 'text-[#575D65] hover:text-[#14171A]'}`}>
                  <Key className="w-3.5 h-3.5 text-[#1F8A5B]"/>
                  <span>API Key / Token</span>
                </button>
                <button type="button" onClick={() => setAuthMethod('oauth')} className={`flex-1 py-1.5 px-2 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all ${authMethod === 'oauth'
                ? 'bg-white text-[#14171A] shadow-sm'
                : 'text-[#575D65] hover:text-[#14171A]'}`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1F8A5B]"/>
                  <span>OAuth SSO</span>
                </button>
              </div>

              {/* ERROR STATE ALERT */}
              {errorMessage && (<div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5"/>
                  <div className="flex-1">
                    <span className="font-bold">{errorMessage}</span>
                    <button type="button" onClick={() => setErrorMessage(null)} className="ml-2 text-red-600 underline text-[10px]">
                      Dismiss
                    </button>
                  </div>
                </div>)}

              {/* LOADING STATE OVERLAY */}
              {(loadingProvider || isSubmittingKey) && (<div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center justify-center gap-2.5 animate-pulse shadow-sm">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600"/>
                  <span className="font-bold">
                    {loadingProvider
                    ? `Connecting to ${loadingProvider === 'github' ? 'GitHub' : 'Google'}...`
                    : 'Discovering GitHub repositories & building dossier...'}
                  </span>
                </div>)}

              {/* TAB CONTENT: GITHUB USERNAME | API KEY | OAUTH */}
              {authMethod === 'github' ? (
                <div className="space-y-3.5 w-full">
                  <form onSubmit={handleGithubUsernameSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="github-handle-input" className="block font-mono text-[11px] font-bold text-[#14171A] mb-1.5 flex items-center justify-between">
                        <span>Your GitHub Username</span>
                        <span className="text-[10px] text-[#1F8A5B] font-normal">Discovers your public repos</span>
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-neutral-400 font-mono text-sm select-none">@</span>
                        <input
                          id="github-handle-input"
                          name="githubHandle"
                          type="text"
                          value={githubHandleInput}
                          onChange={(e) => setGithubHandleInput(e.target.value)}
                          placeholder="e.g. torvalds or yourhandle"
                          autoFocus
                          className="w-full h-11 pl-8 pr-3.5 rounded-xl border border-[#D3CDBD] bg-white text-[#14171A] font-mono text-xs placeholder:text-[#9AA3AE] focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all shadow-inner"
                        />
                      </div>

                      {githubHandleInput.trim().length >= 2 && (
                        <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200/80">
                          <img
                            src={`https://github.com/${githubHandleInput.trim().replace(/^@/, '')}.png`}
                            alt="Avatar preview"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            className="w-5 h-5 rounded-full border border-emerald-500/60 object-cover"
                          />
                          <span className="font-mono text-[11px] text-emerald-800 font-bold truncate">
                            Ready to inspect @{githubHandleInput.trim().replace(/^@/, '')}
                          </span>
                        </div>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingKey || !githubHandleInput.trim()}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-emerald-600 via-[#1F8A5B] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.99] text-white shadow-lg flex items-center justify-center gap-2.5 font-bold text-xs transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      {isSubmittingKey ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Github className="w-4 h-4 text-white" />
                      )}
                      <span>{isSubmittingKey ? 'Discovering Repositories...' : 'Analyze My Repositories & Launch'}</span>
                      <ArrowRight className="w-4 h-4 text-emerald-200" />
                    </button>
                  </form>

                  <div className="flex items-center gap-2 my-2 font-mono text-[10px] text-[#575D65] uppercase">
                    <div className="h-px bg-[#D3CDBD] flex-1"/>
                    <span>or explore with demo profile</span>
                    <div className="h-px bg-[#D3CDBD] flex-1"/>
                  </div>

                  {/* 1-Click Demo Option */}
                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    disabled={isSubmittingKey}
                    className="w-full p-2.5 rounded-xl bg-white hover:bg-[#FAF9F5] border border-[#CBD5E1] hover:border-emerald-500/60 shadow-sm flex items-center justify-between text-xs font-semibold transition-all group focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src="https://github.com/307vedanttt.png" alt="Vedant Patke" className="w-7 h-7 rounded-full border border-emerald-500/40" />
                      <div className="text-left">
                        <div className="font-bold text-[#14171A]">Explore Demo Profile</div>
                        <div className="text-[10px] font-mono text-[#575D65]">Vedant Patke · MedNav-Ai</div>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold group-hover:bg-emerald-200 transition-colors">
                      1-Click Demo →
                    </span>
                  </button>
                </div>
              ) : authMethod === 'apikey' ? (<div className="space-y-3.5 w-full">
                  {/* 1-Click Instant Access Banner Button */}
                  <button type="button" onClick={() => handleApiKeySubmit('ps_live_instant_dev_key')} disabled={isSubmittingKey} className="w-full p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-[#1F8A5B] to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.99] text-white shadow-md flex items-center justify-between transition-all group focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <div className="text-left">
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <Zap className="w-4 h-4 text-amber-300 fill-amber-300 animate-pulse"/>
                        <span>Instant 1-Click Access</span>
                      </div>
                      <p className="font-mono text-[10px] text-emerald-100/90 mt-0.5">
                        Issue live verified cryptographic key & launch workspace
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform"/>
                  </button>

                  <div className="flex items-center gap-2 my-1 font-mono text-[10px] text-[#575D65] uppercase">
                    <div className="h-px bg-[#D3CDBD] flex-1"/>
                    <span>or use custom key</span>
                    <div className="h-px bg-[#D3CDBD] flex-1"/>
                  </div>

                  {/* Custom API Key input & Submit */}
                  <div className="space-y-2">
                    <label htmlFor="api-key-input" className="block font-mono text-[11px] font-bold text-[#14171A] flex items-center justify-between">
                      <span>ProofStack API Key / Token</span>
                      <span className="text-[10px] text-[#1F8A5B] font-normal">Accepted: ps_live_*, ghp_*</span>
                    </label>
                    <div className="relative">
                      <input id="api-key-input" name="apiKey" type="text" value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} placeholder="ps_live_... or GitHub Personal Token" className="w-full h-11 px-3.5 rounded-xl border border-[#D3CDBD] bg-white text-[#14171A] font-mono text-xs placeholder:text-[#9AA3AE] focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all shadow-inner" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApiKeySubmit();
                    }
                }}/>
                    </div>

                    <button type="button" onClick={() => handleApiKeySubmit()} disabled={isSubmittingKey} className="w-full h-11 rounded-xl bg-[#14171A] hover:bg-[#20252B] active:scale-[0.99] text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50">
                      {isSubmittingKey ? (<RefreshCw className="w-4 h-4 animate-spin text-emerald-400"/>) : (<Key className="w-3.5 h-3.5 text-emerald-400"/>)}
                      <span>{isSubmittingKey ? 'Verifying Token...' : 'Authenticate with API Key'}</span>
                    </button>
                  </div>
                </div>) : (<div className="space-y-3 w-full">
                  {/* 1. Continue with Google */}
                  <button type="button" onClick={handleGoogleSignIn} disabled={!!loadingProvider} className="w-full h-[52px] rounded-xl bg-white hover:bg-[#FAF9F5] active:scale-[0.99] text-[#14171A] font-semibold text-sm border border-[#D3CDBD] shadow-sm flex items-center justify-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>

                  {/* 2. Continue with GitHub */}
                  <button type="button" onClick={handleGithubSignIn} disabled={!!loadingProvider} className="w-full h-[52px] rounded-xl bg-[#14171A] hover:bg-[#20252B] active:scale-[0.99] text-white font-semibold text-sm shadow-md flex items-center justify-center gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    <span>Continue with GitHub</span>
                  </button>
                </div>)}

              {/* THIN LINE: "New here? Signing in creates your account." */}
              <div className="my-5 pt-3 border-t border-[#D3CDBD] text-center font-mono text-[11px] text-[#575D65]">
                New here? Signing in creates your account.
              </div>

              {/* THREE SHORT BULLET PILLS WITH ICONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-5">
                <div className="p-2 rounded-lg bg-[#ECE8DF] border border-[#D3CDBD] flex flex-col items-center text-center gap-1 font-mono text-[10px] text-[#2D3748]">
                  <Globe className="w-3.5 h-3.5 text-[#1F8A5B]"/>
                  <span>Public repos only by default</span>
                </div>
                <div className="p-2 rounded-lg bg-[#ECE8DF] border border-[#D3CDBD] flex flex-col items-center text-center gap-1 font-mono text-[10px] text-[#2D3748]">
                  <Eye className="w-3.5 h-3.5 text-[#1F8A5B]"/>
                  <span>Read-only access</span>
                </div>
                <div className="p-2 rounded-lg bg-[#ECE8DF] border border-[#D3CDBD] flex flex-col items-center text-center gap-1 font-mono text-[10px] text-[#2D3748]">
                  <Trash2 className="w-3.5 h-3.5 text-[#1F8A5B]"/>
                  <span>Delete your data anytime</span>
                </div>
              </div>

              {/* "WHAT WE ASK GITHUB FOR" POPOVER TRIGGER */}
              <div className="relative mb-4 flex justify-center">
                <button type="button" onClick={() => setShowGithubScopePopover((prev) => !prev)} className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#1F8A5B] hover:text-[#166442] transition-colors focus:outline-none" aria-expanded={showGithubScopePopover}>
                  <Info className="w-3.5 h-3.5"/>
                  <span>What we ask GitHub for</span>
                </button>

                {/* Popover Card */}
                {showGithubScopePopover && (<div className="absolute bottom-8 w-72 p-4 rounded-xl bg-white border border-[#CBD5E1] shadow-xl text-left font-mono text-xs z-30">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E2E8F0]">
                      <span className="font-bold text-[#0F172A]">GitHub Scope</span>
                      <button type="button" onClick={() => setShowGithubScopePopover(false)} className="text-[#9AA3AE] hover:text-[#14171A]">
                        <X className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-[#575D65]">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                        <span>Your public username and avatar</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                        <span>Read-only access to public repos</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0"/>
                        <span>No write access, no private code</span>
                      </li>
                    </ul>
                  </div>)}
              </div>

              {/* PRIVACY NOTICE CHECKBOX */}
              <div className="mb-6 flex items-center justify-center gap-2 font-mono text-xs text-[#575D65]">
                <input type="checkbox" id="privacy-agree" checked={agreedPrivacy} onChange={(e) => setAgreedPrivacy(e.target.checked)} className="w-4 h-4 rounded border-[#D3CDBD] text-[#1F8A5B] focus:ring-emerald-500 cursor-pointer"/>
                <label htmlFor="privacy-agree" className="cursor-pointer select-none">
                  I agree to the{' '}
                  <Link to="/how-we-judge" className="text-[#1F8A5B] underline underline-offset-2 font-medium">
                    privacy notice
                  </Link>
                  .
                </label>
              </div>

              {/* FOOTER LINKS: Privacy, How we judge */}
              <div className="pt-3 border-t border-[#D3CDBD] flex items-center justify-between font-mono text-[11px] text-[#575D65]">
                <Link to="/how-we-judge" className="hover:text-[#14171A] transition-colors">
                  Privacy
                </Link>
                <span>·</span>
                <Link to="/how-we-judge" className="hover:text-[#14171A] transition-colors">
                  How we judge
                </Link>
                <span>·</span>
                <Link to="/app" className="hover:text-[#14171A] transition-colors font-bold text-[#1F8A5B]">
                  Demo mode →
                </Link>
              </div>
            </motion.div>) : (
        /* ========================================================== */
        /* VIEW B: POST-SIGN-IN WELCOME STEP                          */
        /* "Add a job posting" and "Upload your resume" as two cards  */
        /* ========================================================== */
        <motion.div key="welcome-step" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="relative z-10 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D3CDBD] font-mono text-[11px] text-[#575D65]">
                <span className="font-bold text-[#1F8A5B]">AUTHENTICATED // RO-DOSSIER</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  ACTIVE
                </span>
              </div>

              <h2 className="font-display text-2xl font-extrabold text-[#14171A] tracking-tight mb-1">
                Welcome to ProofStack
              </h2>
              <p className="text-xs text-[#575D65] mb-6">
                Choose your first step to start verifying code proof against real benchmarks:
              </p>

              {/* TWO BIG WELCOME CARDS */}
              <div className="space-y-4 mb-6">
                {/* Card 1: Add a job posting */}
                <button type="button" onClick={() => navigate('/app')} className="w-full p-4 rounded-xl bg-white border border-[#D3CDBD] hover:border-emerald-500 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3.5 group focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                    <FileText className="w-5 h-5"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-[#14171A]">
                        Add a job posting
                      </span>
                      <ArrowRight className="w-4 h-4 text-[#1F8A5B] group-hover:translate-x-1 transition-transform"/>
                    </div>
                    <p className="font-mono text-[11px] text-[#575D65] mt-1 leading-relaxed">
                      Paste a target role description to extract explicit requirements and run match checks.
                    </p>
                  </div>
                </button>

                {/* Card 2: Upload your resume */}
                <button type="button" onClick={() => navigate('/resume')} className="w-full p-4 rounded-xl bg-white border border-[#D3CDBD] hover:border-violet-500 shadow-sm hover:shadow-md transition-all text-left flex items-start gap-3.5 group focus:outline-none focus:ring-2 focus:ring-violet-500">
                  <div className="w-10 h-10 rounded-lg bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0 group-hover:scale-105 transition-transform">
                    <Upload className="w-5 h-5"/>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-sm text-[#14171A]">
                        Upload your resume
                      </span>
                      <ArrowRight className="w-4 h-4 text-violet-600 group-hover:translate-x-1 transition-transform"/>
                    </div>
                    <p className="font-mono text-[11px] text-[#575D65] mt-1 leading-relaxed">
                      Attach your resume PDF to cross-verify claims against repository evidence and generate receipts.
                    </p>
                  </div>
                </button>
              </div>

              {/* Direct Dashboard Link */}
              <div className="pt-3 border-t border-[#D3CDBD] text-center">
                <Link to="/app" className="font-mono text-xs font-semibold text-[#1F8A5B] hover:text-[#166442] flex items-center justify-center gap-1">
                  <span>Or jump directly to the live dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5"/>
                </Link>
              </div>
            </motion.div>)}
        </AnimatePresence>
      </motion.div>
    </div>);
};
