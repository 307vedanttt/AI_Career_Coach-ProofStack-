import { test, expect } from '@playwright/test';
test.describe('ProofStack Master Judging Verification Scenario', () => {
    test('executes complete 10-step judging walkthrough', async ({ page }) => {
        // 1. Open the demo repository
        await page.goto('/app?demo=1');
        await expect(page.getByText('acme-labs/taskflow-api').first()).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Alex Chen' })).toBeVisible();
        await expect(page.getByText('[DEMO MODE — SAMPLE DATA]').first()).toBeVisible();
        // Verify 6 standalone metrics exist with zero fabricated trust score
        await expect(page.getByText('Assessed Skills')).toBeVisible();
        await expect(page.getByText('Demonstrated Strong').first()).toBeVisible();
        await expect(page.getByText('Demonstrated Basic').first()).toBeVisible();
        await expect(page.getByText('Not in Scope').first()).toBeVisible();
        await expect(page.getByText('Unclear Evidence').first()).toBeVisible();
        await expect(page.getByText('Requires Attention').first()).toBeVisible();
        // 2. Inspect a fork and contribution-history warning in Repository Audit
        await page.getByRole('link', { name: /audit/i }).first().click();
        await page.waitForURL('**/app/audit');
        await expect(page.getByText('FORKED REPOSITORY')).toBeVisible();
        await expect(page.getByText('upstream-org/core-taskflow').first()).toBeVisible();
        // Expand Initial Commit Pattern warning
        const initialPatternCheck = page.getByText(/Initial Upload & Codebase Evolution/i).first();
        await expect(initialPatternCheck).toBeVisible();
        await initialPatternCheck.click();
        await expect(page.getByText(/Initial commit imported 14,200 LOC/i).first()).toBeVisible();
        // 3. Open an API-testing evidence gap in Evidence Validation
        await page.getByRole('link', { name: /evidence/i }).first().click();
        await page.waitForURL('**/app/evidence');
        // Click on HTTP 200 Happy Path Task Dispatch Test
        const testingItem = page.getByText('HTTP 200 Happy Path Task Dispatch Test').first();
        await expect(testingItem).toBeVisible();
        await testingItem.click();
        // 4. Read why the evidence is insufficient (Observation, Interpretation, Limitation, Next Step)
        await expect(page.getByText('Why this decision?')).toBeVisible();
        await expect(page.getByText(/1\. Observation/i)).toBeVisible();
        await expect(page.getByText(/2\. Interpretation/i)).toBeVisible();
        await expect(page.getByText(/3\. Limitation/i)).toBeVisible();
        await expect(page.getByText(/4\. Next Step/i)).toBeVisible();
        // 5. Open the corresponding Commit Contract
        const resolveGapBtn = page.getByRole('button', { name: /resolve gap in commit contract/i });
        await expect(resolveGapBtn).toBeVisible();
        await resolveGapBtn.click();
        await page.waitForURL('**/app/contracts');
        // Verify contract detail is loaded
        await expect(page.getByRole('heading', { name: 'Implement Meaningful API Integration Tests' }).first()).toBeVisible();
        await expect(page.getByText(/Target Skill: Automated Testing/i)).toBeVisible();
        // 6. Start and submit the challenge
        const submitBtn = page.getByRole('button', { name: /submit code changes for review/i });
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
        }
        else {
            const startBtn = page.getByRole('button', { name: /start commit contract/i });
            await startBtn.click();
            await page.getByRole('button', { name: /submit code changes for review/i }).click();
        }
        // 7. Review the simulated acceptance criteria
        await expect(page.getByText(/Simulated Criteria Review Completed/i)).toBeVisible({ timeout: 5000 });
        await expect(page.getByText(/PASSED/i).first()).toBeVisible();
        // 8. Accept the new evidence in the demo workflow
        const acceptBtn = page.getByRole('button', { name: /accept evidence & upgrade skill/i });
        await expect(acceptBtn).toBeVisible();
        await acceptBtn.click();
        // 9. Confirm the skill assessment changes for the correct reason
        await expect(page.getByText(/Contract Fulfilled & Evidence Locked/i)).toBeVisible();
        await expect(page.getByText(/is now Demonstrated — Strong/i)).toBeVisible();
        // 10. Return to Proof Map & Overview and verify that the updates are consistent
        await page.getByRole('link', { name: /proofmap/i }).first().click();
        await page.waitForURL('**/app/proof-map');
        // Confirm Automated Testing node displays "Updated via Contract" and "Demonstrated — Strong"
        await expect(page.getByText('Updated via Contract').first()).toBeVisible();
        // Return to Overview
        await page.getByRole('link', { name: /overview/i }).first().click();
        await page.waitForURL(/.*\/app/);
        // Overview Demonstrated Strong count incremented
        await expect(page.getByText('Demonstrated Strong').first()).toBeVisible();
    });
});
