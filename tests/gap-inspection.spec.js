import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
const VIEWPORT_WIDTHS = [1440, 1024, 820, 390];
test.describe('Task 5: Empty space inspection between How It Works and Core Capabilities', () => {
    for (const width of VIEWPORT_WIDTHS) {
        test(`verifies vertical gap < 160px and no empty bounding boxes at ${width}px`, async ({ page }) => {
            await page.setViewportSize({ width, height: 900 });
            await page.goto('/', { waitUntil: 'networkidle' });
            await page.waitForTimeout(600);
            const howItWorks = page.locator('#how-it-works');
            const capabilities = page.locator('#capabilities');
            await expect(howItWorks).toBeVisible();
            await expect(capabilities).toBeVisible();
            // Bounding box checks: neither section must have an empty bounding box
            const hBox = await howItWorks.boundingBox();
            const cBox = await capabilities.boundingBox();
            expect(hBox).not.toBeNull();
            expect(cBox).not.toBeNull();
            expect(hBox.height).toBeGreaterThan(100);
            expect(cBox.height).toBeGreaterThan(100);
            // DOM coordinate checks: vertical gap between How It Works and Core Capabilities
            const measurements = await page.evaluate(() => {
                const h = document.querySelector('#how-it-works');
                const c = document.querySelector('#capabilities');
                const hRect = h.getBoundingClientRect();
                const cRect = c.getBoundingClientRect();
                const scrollY = window.scrollY;
                const hBottom = hRect.bottom + scrollY;
                const cTop = cRect.top + scrollY;
                const verticalGap = cTop - hBottom;
                const docWidth = document.documentElement.scrollWidth;
                const winWidth = window.innerWidth;
                const hasHorizontalScroll = docWidth > winWidth;
                return {
                    verticalGap,
                    hasHorizontalScroll,
                    docWidth,
                    winWidth,
                };
            });
            // Assert vertical gap <= 160px
            expect(measurements.verticalGap).toBeLessThanOrEqual(160);
            // Assert no horizontal scroll at 390px (and all widths)
            if (width === 390) {
                expect(measurements.hasHorizontalScroll).toBe(false);
                expect(measurements.docWidth).toBeLessThanOrEqual(measurements.winWidth);
            }
            // Scroll to junction and take verified screenshot
            await page.evaluate(() => {
                const h = document.querySelector('#how-it-works');
                const rect = h.getBoundingClientRect();
                window.scrollTo(0, window.scrollY + rect.bottom - 400);
            });
            await page.waitForTimeout(400);
            const screenshotDir = path.resolve(process.cwd(), 'test-results', 'screenshots');
            if (!fs.existsSync(screenshotDir)) {
                fs.mkdirSync(screenshotDir, { recursive: true });
            }
            await page.screenshot({
                path: path.join(screenshotDir, `verified_gap_${width}px.png`),
                fullPage: false,
            });
        });
    }
});
