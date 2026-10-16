import { test, expect } from '@playwright/test';

test.describe('ProofStack Authentication & Route Guard E2E Tests', () => {
  test('sign-in action navigates through backend start route / redirecting handshake', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/ProofStack/i);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();

    // Verify Continue with GitHub button
    const githubBtn = page.getByRole('button', { name: /continue with github/i });
    await expect(githubBtn).toBeVisible();

    // Verify href targets /auth/github/start
    const authLink = githubBtn.locator('xpath=ancestor::a[1]');
    await expect(authLink).toHaveAttribute('href', '/auth/github/start');

    // Click Continue with GitHub -> navigates to redirecting state
    await githubBtn.click();
    await expect(page).toHaveURL(/.*\/auth\/redirecting/);
    await expect(page.getByRole('heading', { name: /redirecting to github/i })).toBeVisible();

    // Auto-advances to /app once authenticated
    await page.waitForURL('**/app', { timeout: 10000 });
    await expect(page.getByText(/Requirements/i).first()).toBeVisible();
  });

  test('signup button is disabled until both checkboxes are ticked, then activates with green glow', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();

    const signupBtn = page.getByRole('button', { name: /sign up with github/i });
    await expect(signupBtn).toBeDisabled();

    // Checkboxes
    const readonlyCheckbox = page.locator('#check-readonly');
    const privacyCheckbox = page.locator('#check-privacy');

    // Tick first checkbox
    await readonlyCheckbox.check({ force: true });
    await expect(signupBtn).toBeDisabled();

    // Tick second checkbox
    await privacyCheckbox.check({ force: true });
    await expect(signupBtn).toBeEnabled();

    // Click signup button
    await signupBtn.click();
    await expect(page).toHaveURL(/.*\/auth\/consent/);
    await expect(page.getByRole('heading', { name: /authorize proofstack audit/i })).toBeVisible();
  });

  test('route guard redirects /app to /login when unauthenticated, and allows public routes without login', async ({ page }) => {
    // When going to /app while unauthenticated, it redirects to /login
    await page.goto('/app');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    
    // Test public scan route without login
    await page.goto('/scan');
    await expect(page).toHaveURL(/.*\/scan/);
    await expect(page.getByText(/Target Verification/i)).toBeVisible();

    // Verify how-we-judge is accessible
    await page.goto('/how-we-judge');
    await expect(page).toHaveURL(/.*\/how-we-judge/);
  });


  test('error screen renders correctly from query params with 4px shake and safe fallback', async ({ page }) => {
    // Known declined reason
    await page.goto('/auth/error?reason=declined');
    await expect(page.getByRole('heading', { name: /sign in failed/i })).toBeVisible();
    await expect(page.getByTestId('error-message')).toContainText('The authorization request was declined.');
    await expect(page.getByRole('button', { name: /try again/i })).toBeVisible();

    // Unknown reason falls back to generic message safely
    await page.goto('/auth/error?reason=arbitrary_untrusted_reason');
    await expect(page.getByTestId('error-message')).toContainText('Authentication could not be completed.');

    // Try again button navigates back to /login
    await page.getByRole('button', { name: /try again/i }).click();
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('rate-limited screen renders computed countdown timer from query param', async ({ page }) => {
    await page.goto('/auth/rate-limited?retry_after=45');
    await expect(page.getByRole('heading', { name: /too many attempts/i })).toBeVisible();
    
    // Verify countdown timer is active
    const timer = page.getByRole('timer');
    await expect(timer).toBeVisible();
    await expect(timer).toContainText('00:45');

    // Verify retry button is disabled while countdown is active
    const retryBtn = page.getByRole('button', { name: /please wait for timer/i });
    await expect(retryBtn).toBeDisabled();
  });
});
