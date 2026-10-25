import { test, expect } from '@playwright/test';
test.describe('ProofStack Five-Beat Demo Walkthrough', () => {
    test('walks through landing, paste posting, dashboard, break-me, and contract fulfillment', async ({ page }) => {
        // =========================================================================
        // BEAT 1: LANDING PAGE
        // =========================================================================
        await page.goto('/?demo=1');
        await expect(page).toHaveTitle(/ProofStack/i);
        await expect(page.locator('h1')).toContainText('Don’t');
        await expect(page.getByText('DETERMINISTIC EVIDENCE LEDGER')).toBeVisible();
        // =========================================================================
        // BEAT 2: PASTE POSTING
        // =========================================================================
        const pastePostingBtn = page.getByRole('button', { name: /paste job posting/i });
        await expect(pastePostingBtn).toBeVisible();
        await pastePostingBtn.click();
        // Verify Modal Opens
        await expect(page.getByRole('heading', { name: /paste job posting/i })).toBeVisible();
        const textarea = page.locator('#posting-textarea');
        await expect(textarea).toBeVisible();
        await expect(textarea).toHaveValue(/Senior Backend Engineer/i);
        // Map Evidence to Dashboard
        const mapEvidenceBtn = page.getByRole('button', { name: /map evidence to dashboard/i });
        await mapEvidenceBtn.click();
        // =========================================================================
        // BEAT 3: DASHBOARD
        // =========================================================================
        await page.waitForURL('**/app', { timeout: 15000 });
        await expect(page.getByText(/Requirements/i).first()).toBeVisible();
        await expect(page.getByText(/Proof Map/i)).toBeVisible();
        await expect(page.getByText(/Evidence coverage/i)).toBeVisible();
        // Click on SQL requirement to inspect rejected candidate in Evidence Drawer
        const sqlReq = page.getByRole('button', { name: /SQL/i }).first();
        await sqlReq.click();
        // Switch to Candidate (HOLLOW) variant if not already selected
        const candidateBtn = page.getByRole('button', { name: /candidate/i });
        if (await candidateBtn.isVisible()) {
            await candidateBtn.click();
        }
        // Verify Evidence Drawer reveals refused hollow signal
        await expect(page.getByText(/Hollow Signal Guard Triggered/i)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/Refused from coverage/i)).toBeVisible();
        // Close drawer
        await page.keyboard.press('Escape');
        // =========================================================================
        // BEAT 4: BREAK-ME ADVERSARIAL LEDGER
        // =========================================================================
        await page.goto('/breakme');
        await expect(page.getByText(/Adversarial Fuzz/i)).toBeVisible();
        // Check three big counters
        await expect(page.getByText(/Attacks Sent/i)).toBeVisible();
        await expect(page.getByText(/Upgrades Granted/i)).toBeVisible();
        await expect(page.getByText(/Guard Reasons Logged/i)).toBeVisible();
        // Verify zero free-text input: only template tiles
        await expect(page.locator('input[type="text"]')).toHaveCount(0);
        await expect(page.locator('textarea')).toHaveCount(0);
        // Trigger an attack template
        const templateTile = page.getByRole('button', { name: /Zero Assertions/i }).first();
        if (await templateTile.isVisible()) {
            await templateTile.click();
        }
        // Wait for streaming attack table to have REFUSED stamps
        await expect(page.getByText(/REFUSED/i).first()).toBeVisible({ timeout: 10000 });
        // =========================================================================
        // BEAT 5: REAL PUSH & CONTRACT FLIPPING TO FULFILLED
        // =========================================================================
        await page.goto('/app/contracts');
        await expect(page.getByText(/COMMIT CONTRACT PREDICTION/i)).toBeVisible();
        await expect(page.getByText(/Add SQLite query and assertion test/i).first()).toBeVisible();
        // Trigger Dry Run via exact accessible label
        const dryRunBtn = page.getByRole('button', { name: /Execute Dry Run on Contract/i });
        await expect(dryRunBtn).toBeVisible();
        await dryRunBtn.click();
        // Verify contract invariant flips to FULFILLED stamp
        await expect(page.getByText(/FULFILLED/i)).toBeVisible({ timeout: 10000 });
        // Verify coverage jumps to 72%
        await expect(page.getByText(/72%/i)).toBeVisible();
    });
});
