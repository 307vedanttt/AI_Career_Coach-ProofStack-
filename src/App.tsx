import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ContractsPage } from './pages/ContractsPage';
import { BreakMePage } from './pages/BreakMePage';
import { ResumePage } from './pages/ResumePage';
import { VerifyPage } from './pages/VerifyPage';
import { ScannerPage } from './pages/ScannerPage';
import { HowWeJudgePage } from './pages/HowWeJudgePage';
import { StyleguidePage } from './pages/StyleguidePage';

// Auth Pages & Route Guard
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { RedirectingPage } from './pages/auth/RedirectingPage';
import { ConsentPage } from './pages/auth/ConsentPage';
import { AuthErrorPage } from './pages/auth/AuthErrorPage';
import { RateLimitedPage } from './pages/auth/RateLimitedPage';
import { AuthGuard } from './components/auth/AuthGuard';
import { AuthProvider } from './context/AuthContext';

const DemoModeManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const isDemo = params.get('demo') === '1' || sessionStorage.getItem('ps_demo_mode') === 'true';
    if (params.get('demo') === '1') {
      sessionStorage.setItem('ps_demo_mode', 'true');
    }
    
    if (isDemo) {
      document.documentElement.classList.add('demo-mode');
      document.documentElement.setAttribute('data-demo', 'true');
    } else {
      document.documentElement.classList.remove('demo-mode');
      document.documentElement.removeAttribute('data-demo');
    }
  }, [location.search]);

  return null;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* WCAG Accessible Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#34D399] focus:text-[#0A0C0F] focus:font-mono focus:font-bold focus:rounded-sm focus:shadow-xl focus:outline-none"
        >
          Skip to main content
        </a>
        <DemoModeManager />
        <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/auth/redirecting" element={<RedirectingPage />} />
        <Route path="/auth/consent" element={<ConsentPage />} />
        <Route path="/auth/error" element={<AuthErrorPage />} />
        <Route path="/auth/rate-limited" element={<RateLimitedPage />} />

        {/* Protected App Routes (/app/*) */}
        <Route
          path="/app"
          element={
            <AuthGuard>
              <DashboardPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/contracts"
          element={
            <AuthGuard>
              <ContractsPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/break-me"
          element={
            <AuthGuard>
              <BreakMePage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/resume"
          element={
            <AuthGuard>
              <ResumePage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/verify"
          element={
            <AuthGuard>
              <VerifyPage />
            </AuthGuard>
          }
        />
        <Route
          path="/app/scanner"
          element={
            <AuthGuard>
              <ScannerPage />
            </AuthGuard>
          }
        />
        
        {/* Direct Spec Public Routes */}
        <Route path="/breakme" element={<BreakMePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/scan" element={<ScannerPage />} />
        <Route path="/how-we-judge" element={<HowWeJudgePage />} />
        <Route path="/styleguide" element={<StyleguidePage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;


