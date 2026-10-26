import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const ARTIFACTS_DIR = "/Users/goktus/.gemini/antigravity-cli/brain/8d6420fe-16b7-4a45-b49e-7d9f319912fe";

async function main() {
  console.log("Launching browser for live end-to-end verification...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:4400...");
  await page.goto("http://localhost:4400", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // 1. Initial State Screenshot
  console.log("Taking initial cockpit screenshot...");
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "live-cockpit-initial-1440.png"),
    fullPage: false,
  });

  // 2. Open Passkey Authentication Modal
  console.log("Opening CFO Passkey Authentication dialog...");
  const authBtn = page.locator("header button").last();
  await authBtn.click();
  await page.waitForTimeout(600);

  // Verify modal is visible
  const modalHeader = page.locator("#dialog-title");
  const modalVisible = await modalHeader.isVisible();
  console.log("Passkey modal visible:", modalVisible);

  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "live-passkey-modal-1440.png"),
    fullPage: false,
  });

  // 3. Click Instant Judge P-256 sign in
  console.log("Executing Instant Judge P-256 signature...");
  const instantSignBtn = page.locator('button:has-text("Instant Judge"), button:has-text("Sign with Instant Judge")').first();
  if (await instantSignBtn.isVisible()) {
    await instantSignBtn.click();
    await page.waitForTimeout(800);
  }

  // Close dialog if open
  const closeBtn = page.locator('button[aria-label="Close dialog"], button:has-text("Close Session")').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(500);
  }

  // 4. Test Scenario Execution (Live on Testnet)
  console.log("Executing Scenario on live Testnet...");
  const runScenarioBtn = page.locator('button:has-text("Run Scenario")');
  await runScenarioBtn.click();

  console.log("Waiting for on-chain block confirmation...");
  // Wait up to 35 seconds for on-chain Soroban block confirmation
  await page.waitForSelector('text=On-chain transaction settled on Testnet', { timeout: 40000 });
  console.log("On-chain settlement confirmed!");

  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "live-cockpit-executed-1440.png"),
    fullPage: false,
  });

  // 5. Test Circuit Breaker toggle
  console.log("Toggling Emergency Circuit Breaker on-chain...");
  const breakerSwitch = page.locator('button[role="switch"]');
  await breakerSwitch.click();

  console.log("Waiting for on-chain freeze...");
  await page.waitForSelector('text=ALL SPEND FROZEN', { timeout: 25000 });
  console.log("Circuit breaker active on-chain!");

  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "live-cockpit-frozen-1440.png"),
    fullPage: false,
  });

  // Unpause
  console.log("Unpausing vault...");
  await breakerSwitch.click();
  await page.waitForTimeout(15000);

  await browser.close();
  console.log("Verification completed successfully!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
