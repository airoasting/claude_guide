import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5174/";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(window.__mindCraftDebug));
  await page.evaluate(() => window.__mindCraftDebug.forceLock());
  await page.click("body");

  const read = () => page.evaluate(() => window.__mindCraftDebug.getPlayerState());
  const place = (state) => page.evaluate((next) => window.__mindCraftDebug.setPlayerState(next), state);

  const results = [];

  const initial = await read();
  await page.keyboard.down("w");
  await sleep(400);
  await page.keyboard.up("w");
  const moved = await read();
  results.push({
    name: "forward-move",
    pass: Math.abs(moved.z - initial.z) > 1,
    before: initial,
    after: moved,
  });

  await place({ x: 0, y: 1.7, z: 34, yaw: Math.PI, pitch: -0.15 });
  await sleep(50);
  const jumpStart = await read();
  await page.keyboard.press(" ");
  await sleep(180);
  const jumpPeak = await read();
  await sleep(250);
  const jumpEnd = await read();
  results.push({
    name: "jump-lift",
    pass: jumpPeak.y > jumpStart.y + 0.2 && jumpEnd.y >= 1.7,
    before: jumpStart,
    peak: jumpPeak,
    after: jumpEnd,
  });

  await place({ x: 0, y: 1.7, z: 15.8, yaw: Math.PI, pitch: -0.15 });
  await sleep(50);
  await page.keyboard.down("w");
  await sleep(1300);
  await page.keyboard.up("w");
  const stairs = await read();
  results.push({
    name: "stairs-climb",
    pass: stairs.y > 2.4,
    after: stairs,
  });

  await place({ x: 0, y: 4.5, z: 7.1, yaw: Math.PI, pitch: -0.15 });
  await sleep(50);
  await page.keyboard.down("w");
  await sleep(700);
  await page.keyboard.up("w");
  const templeIn = await read();
  await page.keyboard.down("s");
  await sleep(700);
  await page.keyboard.up("s");
  const templeOut = await read();
  results.push({
    name: "temple-in-out",
    pass: templeIn.z < 6.2 && templeOut.z > templeIn.z + 1,
    entered: templeIn,
    exited: templeOut,
  });

  console.log(JSON.stringify(results, null, 2));

  if (results.some((result) => !result.pass)) {
    process.exitCode = 1;
  }
} finally {
  await browser.close();
}
