const { chromium } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

async function capture() {
  const artifactDir = 'C:\\Users\\Vedant\\.gemini\\antigravity-ide\\brain\\37804228-d806-4da0-808b-fb1e017e5722';
  if (!fs.existsSync(artifactDir)) {
    fs.mkdirSync(artifactDir, { recursive: true });
  }

  const browser = await chromium.launch({ channel: 'msedge' });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const screens = [
    { url: 'http://127.0.0.1:5173/app?demo=1', name: 'screen1_overview.png' },
    { url: 'http://127.0.0.1:5173/app/audit?demo=1', name: 'screen2_repository_audit.png' },
    { url: 'http://127.0.0.1:5173/app/evidence?demo=1', name: 'screen3_evidence_validation.png' },
    { url: 'http://127.0.0.1:5173/app/contracts?demo=1', name: 'screen4_commit_contract.png' },
    { url: 'http://127.0.0.1:5173/app/proof-map?demo=1', name: 'screen5_proof_map.png' },
  ];

  for (const s of screens) {
    console.log(`Navigating to ${s.url}...`);
    await page.goto(s.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    const savePath = path.join(artifactDir, s.name);
    await page.screenshot({ path: savePath, fullPage: false });
    console.log(`Captured ${s.name} at ${savePath}`);
  }

  await browser.close();
}

capture().catch(console.error);
