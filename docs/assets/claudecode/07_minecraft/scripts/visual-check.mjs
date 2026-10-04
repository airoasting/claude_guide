import { chromium } from "playwright";

// 화면 상태별 스크린샷과 프레임 비용을 찍는 점검 스크립트.
// 사용법: node scripts/visual-check.mjs <url> <출력 폴더>
const url = process.argv[2] ?? "http://127.0.0.1:4173/";
const out = process.argv[3] ?? ".";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text()));

try {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(window.__mindCraftDebug));
  await sleep(2500);
  await page.screenshot({ path: `${out}/01-title.png` });

  await page.evaluate(() => window.__mindCraftDebug.forceLock());
  await sleep(2500);
  await page.screenshot({ path: `${out}/02-play.png` });
  const stats = await page.evaluate(() => window.__mindCraftDebug.getStats());

  await page.evaluate(() => window.__mindCraftDebug.setPlayerState({ x: -2, y: 1.7, z: 26, yaw: Math.PI * 0.82, pitch: -0.05 }));
  await sleep(2000);
  await page.screenshot({ path: `${out}/03-orb.png` });

  await page.evaluate(() => window.__mindCraftDebug.collectAll());
  await sleep(900);
  await page.screenshot({ path: `${out}/04-clear-start.png` });
  await sleep(3200);
  await page.screenshot({ path: `${out}/05-clear-fireworks.png` });
  await sleep(3500);
  await page.screenshot({ path: `${out}/06-clear-late.png` });
  await page.waitForFunction(() => window.__mindCraftDebug.getStage() === "results", null, { timeout: 15000 });
  await sleep(1500);
  await page.screenshot({ path: `${out}/07-results.png` });
  const orbs = await page.evaluate(() => window.__mindCraftDebug.getOrbs());

  await page.getByRole("button", { name: "다시 도전" }).click();
  await sleep(500);
  const afterRestart = await page.evaluate(() => ({
    stage: window.__mindCraftDebug.getStage(),
    collected: window.__mindCraftDebug.getOrbs().filter((orb) => orb.collected).length,
  }));

  console.log(JSON.stringify({ stats, collected: orbs.filter((orb) => orb.collected).length, afterRestart, errors }, null, 2));
} finally {
  await browser.close();
}
