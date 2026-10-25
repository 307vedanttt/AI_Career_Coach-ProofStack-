import { test, expect } from '@playwright/test';
const widths = [1440, 1024, 820, 390];
test.describe('ProofStack Responsive Multi-Width Inspection', () => {
    for (const width of widths) {
        test(`renders cleanly without horizontal scroll at ${width}px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 });
            await page.goto('/app?demo=1');
            // Verify no horizontal overflow
            const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
            const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
            expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 2); // 2px margin tolerance
            // Verify header and primary elements are visible
            await expect(page.getByText('acme-labs/taskflow-api').first()).toBeVisible();
            await expect(page.getByRole('heading', { name: 'Alex Chen' })).toBeVisible();
            // Check Repository Audit responsive layout
            await page.goto('/app/audit?demo=1');
            await expect(page.getByText('FORKED REPOSITORY')).toBeVisible();
            // Check Evidence Validation responsive layout
            await page.goto('/app/evidence?demo=1');
            await expect(page.getByRole('heading', { name: 'Evidence Validation Workspace' })).toBeVisible();
            // Check Commit Contracts responsive layout
            await page.goto('/app/contracts?demo=1');
            await expect(page.getByRole('heading', { name: 'Implement Meaningful API Integration Tests' }).first()).toBeVisible();
            // Check Proof Map responsive layout
            await page.goto('/app/proof-map?demo=1');
            await expect(page.getByRole('heading', { name: 'Interactive Proof Map' })).toBeVisible();
        });
    }
});
