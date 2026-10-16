import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Globe, Trash2, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import { AuthSplitLayout } from '../../components/layout/AuthSplitLayout';
import { AuthPanel, AuthItem } from '../../components/auth/AuthPanel';
import { ReceiptStackLogin } from '../../components/auth/ReceiptStackLogin';
import { Button } from '../../components/ui/Button';
import { getMockAuthPath, setMockAuthPath, MockAuthPath } from '../../lib/api';


import { useAuth } from '../../context/AuthContext';
import { buildUrl } from '../../lib/api/client';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [authPath, setAuthPath] = useState<MockAuthPath>(getMockAuthPath());
  const [isRedirecting, setIsRedirecting] = useState(false);
  const isUsingMocks = import.meta.env.VITE_USE_MOCKS === 'true';

  useEffect(() => {
    // Redirect signed-in users away from /login
    if (!loading && user) {
      navigate('/app', { replace: true });
    }

    // Move focus to heading on route load for accessibility
    headingRef.current?.focus();
  }, [user, loading, navigate]);

  const handleAuthPathChange = (path: MockAuthPath) => {
    setAuthPath(path);
    setMockAuthPath(path);
  };

  const handleContinueWithGithub = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRedirecting(true);

    if (!isUsingMocks) {
      // Direct real OAuth handshake with backend
      window.location.href = buildUrl('/auth/github/start');
      return;
    }

    // In dev mock mode, simulate based on dev selector
    setTimeout(() => {
      if (authPath === 'declined') {
        navigate('/auth/error?reason=declined');
      } else if (authPath === 'rate_limited') {
        navigate('/auth/rate-limited?retry_after=45');
      } else {
        // Success path goes through redirecting handshake
        navigate('/auth/redirecting');
      }
    }, 300);
  };

  return (
    <AuthSplitLayout
      tagline="CRYPTOGRAPHIC DOSSIER ENGINE"
      headline={
        <>
          Welcome back. Your{' '}
          <span className="font-serif italic font-normal text-[#34D399] tracking-normal">
            receipts
          </span>{' '}
          are waiting.
        </>
      }
      leftContent={<ReceiptStackLogin />}
      rightContent={
        <div className="w-full flex flex-col items-center">
          {/* Dev Mock Path Switcher (only for testing/preview) */}
          <div className="mb-4 w-full max-w-[460px] p-2.5 rounded-[8px] bg-white/[0.03] border border-white/10 flex items-center justify-between text-[11px] font-mono text-[#9AA3AE]">
            <span className="flex items-center gap-1.5 text-[#34D399]">
              <Terminal className="w-3.5 h-3.5" />
              <span>Dev Mock Path:</span>
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => handleAuthPathChange('success')}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  authPath === 'success'
                    ? 'bg-[#1F8A5B] text-white font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-[#9AA3AE]'
                }`}
              >
                Success
              </button>
              <button
                type="button"
                onClick={() => handleAuthPathChange('declined')}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  authPath === 'declined'
                    ? 'bg-[#C2362B] text-white font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-[#9AA3AE]'
                }`}
              >
                Declined
              </button>
              <button
                type="button"
                onClick={() => handleAuthPathChange('rate_limited')}
                className={`px-2 py-0.5 rounded text-[10px] ${
                  authPath === 'rate_limited'
                    ? 'bg-[#B7791F] text-white font-bold'
                    : 'bg-white/5 hover:bg-white/10 text-[#9AA3AE]'
                }`}
              >
                Rate Limit
              </button>
            </div>
          </div>

          <AuthPanel
            badge="AUTH_V3.8"
            icon={<ShieldCheck className="w-4 h-4 text-[#34D399]" />}
          >
            {/* Title & Subtitle */}
            <AuthItem className="mb-6">
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="text-2xl font-bold tracking-tight text-white mb-1.5 focus:outline-none"
              >
                Sign in
              </h2>
              <p className="text-xs text-[#9AA3AE]">
                Connect GitHub to see your own repos.
              </p>
            </AuthItem>

            {/* Primary Action: Continue with GitHub (NO EMAIL OR PASSWORD FIELDS) */}
            <AuthItem className="mb-4">
              <a
                href="/auth/github/start"
                onClick={handleContinueWithGithub}
                className="w-full block focus-visible:outline-none"
              >
                <Button
                  type="button"
                  variant="solid_paper"
                  size="lg"
                  isLoading={isRedirecting}
                  className="w-full text-xs sm:text-sm font-semibold tracking-tight shadow-md min-h-[52px]"
                  icon={
                    <svg
                      className="w-4 h-4 text-[#14171A]"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                  }
                >
                  Continue with GitHub
                </Button>
              </a>
            </AuthItem>

            {/* Divider OR */}
            <AuthItem className="my-5">
              <div className="relative flex items-center justify-center">
                <div className="w-full border-t border-white/[0.08]" />
                <span className="absolute bg-[#12161B] px-3 font-mono text-[10px] text-[#575D65] uppercase tracking-wider">
                  OR
                </span>
              </div>
            </AuthItem>

            {/* Secondary Action: Scan a public profile, no sign in */}
            <AuthItem className="mb-6">
              <Link
                to="/scan"
                className="w-full block py-2.5 px-3 rounded-[8px] bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] text-center text-xs text-[#9AA3AE] hover:text-white transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#34D399]"
              >
                <div className="flex items-center justify-center gap-2">
                  <span>Scan a public profile, no sign in</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#34D399] group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </AuthItem>

            {/* 3-Column Micro Trust Grid */}
            <AuthItem className="border-t border-white/[0.06] pt-5 mb-5">
              <div className="grid grid-cols-3 gap-2 text-center font-mono text-[11px]">
                <div className="flex flex-col items-center gap-1.5 text-[#9AA3AE]">
                  <Eye className="w-4 h-4 text-[#34D399]" />
                  <span>Read only</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-[#9AA3AE]">
                  <Globe className="w-4 h-4 text-[#34D399]" />
                  <span>Public repos</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-[#9AA3AE]">
                  <Trash2 className="w-4 h-4 text-[#34D399]" />
                  <span>Delete anytime</span>
                </div>
              </div>
            </AuthItem>

            {/* Footer Navigation Link */}
            <AuthItem className="text-center text-xs text-[#6B7280]">
              New here?{' '}
              <Link
                to="/signup"
                className="font-semibold text-white hover:text-[#34D399] transition-colors underline underline-offset-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#34D399] rounded px-1"
              >
                Create an account
              </Link>
            </AuthItem>
          </AuthPanel>
        </div>
      }
    />
  );
};
