import { chromium } from "playwright";
import path from "node:path";

const ARTIFACTS_DIR = "/Users/goktus/.gemini/antigravity-cli/brain/8d6420fe-16b7-4a45-b49e-7d9f319912fe";

async function main() {
  console.log("Testing new real-product cockpit UI...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:4400...");
  await page.goto("http://localhost:4400", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Check for forbidden demo phrases
  const bodyText = await page.innerText("body");
  const forbiddenPhrases = [
    "Ratio 1.586:1",
    "Hold euros. Spend dollars. Instantly.",
    "Institutional Outlay Protocol",
    "Launch Cockpit",
    "Inspect Wire",
    "Scenario 1",
    "Scenario 2",
    "Scenario 3",
    "RAW ON-CHAIN PAYLOAD",
    "Syncs with active terminal scenario",
  ];

  for (const phrase of forbiddenPhrases) {
    if (bodyText.includes(phrase)) {
      console.error(`FOUND FORBIDDEN DEMO PHRASE: "${phrase}"`);
      process.exit(1);
    }
  }
  console.log("All demo fluff successfully removed! Verified 0 occurrences of demo phrases.");

  // Screenshot 1: Full real-product page (1440px desktop)
  console.log("Capturing real-product dashboard screenshot...");
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "real-product-dashboard-1440.png"),
    fullPage: true,
  });

  // Test Disbursing an Outlay (Amazon Web Services)
  console.log("Clicking Authorize & Disburse...");
  const disburseBtn = page.locator('button:has-text("Authorize & Disburse")');
  await disburseBtn.click();

  console.log("Waiting for on-chain disbursement settlement...");
  await page.waitForSelector('text=Disbursement settled on Testnet.', { timeout: 40000 });
  console.log("Disbursement confirmed on Testnet!");

  await page.waitForTimeout(1000);

  // Screenshot 2: Post-disbursement dashboard
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "real-product-disbursed-1440.png"),
    fullPage: true,
  });

  // Mobile Viewport Test (390px iPhone)
  console.log("Testing mobile viewport 390px...");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  await page.screenshot({
    path: path.join(ARTIFACTS_DIR, "real-product-mobile-390.png"),
    fullPage: true,
  });

  await browser.close();
  console.log("Real product verification passed cleanly!");
}

main().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
