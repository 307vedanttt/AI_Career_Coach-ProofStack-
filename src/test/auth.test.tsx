import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { AuthErrorPage } from '../pages/auth/AuthErrorPage';
import { AuthGuard } from '../components/auth/AuthGuard';
import { AuthContext } from '../context/AuthContext';
import { setMockSignedIn } from '../lib/api';

describe('Auth Screens Component & Security Tests', () => {
  beforeEach(async () => {
    // Ensure starting in logged-out state for tests
    await setMockSignedIn(false);
  });

  // 1. Password and Email Field Absence Verification
  it('strictly contains NO password fields and NO email fields on Login page', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    // No password input
    const passwordInputs = document.querySelectorAll('input[type="password"]');
    expect(passwordInputs.length).toBe(0);

    // No email input
    const emailInputs = document.querySelectorAll('input[type="email"]');
    expect(emailInputs.length).toBe(0);

    // No text input with name or id containing 'password' or 'email'
    const allInputs = document.querySelectorAll('input');
    allInputs.forEach((input) => {
      const name = (input.getAttribute('name') || '').toLowerCase();
      const id = (input.getAttribute('id') || '').toLowerCase();
      expect(name).not.toContain('password');
      expect(name).not.toContain('email');
      expect(id).not.toContain('password');
      expect(id).not.toContain('email');
    });
  });

  it('strictly contains NO password fields and NO email fields on Signup page', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </MemoryRouter>
    );

    const passwordInputs = document.querySelectorAll('input[type="password"]');
    expect(passwordInputs.length).toBe(0);

    const emailInputs = document.querySelectorAll('input[type="email"]');
    expect(emailInputs.length).toBe(0);
  });

  // 2. Signup Button Gating by Checkboxes
  it('keeps signup button disabled until BOTH checkboxes are ticked', () => {
    render(
      <MemoryRouter initialEntries={['/signup']}>
        <Routes>
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </MemoryRouter>
    );

    const signupButton = screen.getByRole('button', { name: /sign up with github/i });
    expect(signupButton).toBeDisabled();
    expect(signupButton.closest('a')).toHaveAttribute('aria-disabled', 'true');

    const readonlyCheckbox = screen.getByLabelText(/reads my code, never changes it/i);
    const privacyCheckbox = screen.getByLabelText(/privacy notice/i);

    // Tick first checkbox only
    fireEvent.click(readonlyCheckbox);
    expect(signupButton).toBeDisabled();

    // Untick first, tick second
    fireEvent.click(readonlyCheckbox);
    fireEvent.click(privacyCheckbox);
    expect(signupButton).toBeDisabled();

    // Tick BOTH checkboxes
    fireEvent.click(readonlyCheckbox);
    expect(signupButton).not.toBeDisabled();
    expect(signupButton.closest('a')).toHaveAttribute('aria-disabled', 'false');
  });

  // 3. XSS escaping & Safe dynamic rendering
  it('renders dynamic strings strictly escaped and never executes XSS payloads', () => {
    const maliciousScript = '<script>alert(1)</script>';

    render(
      <MemoryRouter initialEntries={[`/auth/error?reason=${encodeURIComponent(maliciousScript)}`]}>
        <Routes>
          <Route path="/auth/error" element={<AuthErrorPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Ensure raw script tag is not injected into the DOM
    const scripts = document.querySelectorAll('script:not([type])');
    scripts.forEach((s) => {
      expect(s.textContent).not.toContain('alert(1)');
    });

    // Content is safely handled by allowlist fallback
    expect(screen.getByTestId('error-message')).toHaveTextContent('Authentication could not be completed.');
  });

  // 4. Unknown query param reason fallback
  it('falls back to a generic message when an unknown reason is provided in query params', () => {
    render(
      <MemoryRouter initialEntries={['/auth/error?reason=random_injected_code_or_garbage']}>
        <Routes>
          <Route path="/auth/error" element={<AuthErrorPage />} />
        </Routes>
      </MemoryRouter>
    );

    const statusElement = screen.getByTestId('error-message');
    expect(statusElement).toHaveTextContent('Authentication could not be completed.');
  });

  it('renders specific message for known reason in allowlist', () => {
    render(
      <MemoryRouter initialEntries={['/auth/error?reason=declined']}>
        <Routes>
          <Route path="/auth/error" element={<AuthErrorPage />} />
        </Routes>
      </MemoryRouter>
    );

    const statusElement = screen.getByTestId('error-message');
    expect(statusElement).toHaveTextContent('The authorization request was declined.');
  });

  it('renders security handshake token mismatch for reason=state', () => {
    render(
      <MemoryRouter initialEntries={['/auth/error?reason=state']}>
        <Routes>
          <Route path="/auth/error" element={<AuthErrorPage />} />
        </Routes>
      </MemoryRouter>
    );

    const statusElement = screen.getByTestId('error-message');
    expect(statusElement).toHaveTextContent('Security handshake token mismatch.');
  });

  it('redirects unauthenticated users accessing /app to /login via AuthGuard', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <Routes>
          <Route
            path="/app"
            element={
              <AuthGuard>
                <div data-testid="protected-content">Protected Enclave</div>
              </AuthGuard>
            }
          />
          <Route path="/login" element={<div data-testid="login-screen">Login Screen</div>} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-screen')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('redirects signed-in users away from /login to /app', () => {
    const mockAuthValue: any = {
      user: {
        id: 'usr-alice',
        login: 'alice',
        name: 'Alice Dev',
        avatarUrl: '',
        publicRepos: 5,
        scopes: ['read:user'],
        sessionStartedAt: new Date().toISOString(),
      },
      loading: false,
      error: null,
      refreshUser: async () => null,
      logout: async () => {},
      deleteMyData: async () => {},
    };

    render(
      <AuthContext.Provider value={mockAuthValue}>
        <MemoryRouter initialEntries={['/login']}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/app" element={<div data-testid="dashboard-screen">Dashboard Enclave</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );

    expect(screen.getByTestId('dashboard-screen')).toBeInTheDocument();
  });

  it('renders API Key login controls and allows instant 1-click token authentication', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Verify API Key tab is rendered and active by default
    expect(screen.getByRole('button', { name: /API Key \/ Token/i })).toBeInTheDocument();
    expect(screen.getByText(/Instant 1-Click Access/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ps_live_... or GitHub Personal Token/i)).toBeInTheDocument();
  });

  it('allows switching between API Key tab and OAuth SSO tab', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>
    );

    const oauthTabButton = screen.getByRole('button', { name: /OAuth SSO/i });
    fireEvent.click(oauthTabButton);

    expect(screen.getByText(/Continue with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Continue with GitHub/i)).toBeInTheDocument();

    const apiKeyTabButton = screen.getByRole('button', { name: /API Key \/ Token/i });
    fireEvent.click(apiKeyTabButton);

    expect(screen.getByText(/Instant 1-Click Access/i)).toBeInTheDocument();
  });
});

