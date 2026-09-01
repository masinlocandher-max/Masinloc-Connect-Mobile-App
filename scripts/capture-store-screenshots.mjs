import fs from 'node:fs/promises';
import { chromium } from 'playwright';

const baseUrl = process.env.APP_URL || 'http://127.0.0.1:4173';
const screens = [
  ['home', 'Home'],
  ['marketplace', 'Marketplace'],
  ['jobs', 'Jobs'],
  ['report', 'Report'],
  ['more', 'More'],
];
const devices = [
  { name: 'ios', viewport: { width: 430, height: 932 }, deviceScaleFactor: 3 },
  { name: 'android', viewport: { width: 360, height: 800 }, deviceScaleFactor: 3 },
];

const browser = await chromium.launch({ headless: true });
const failures = [];

for (const device of devices) {
  await fs.mkdir(`store/screenshots/${device.name}`, { recursive: true });
  const context = await browser.newContext({
    viewport: device.viewport,
    deviceScaleFactor: device.deviceScaleFactor,
    isMobile: true,
    hasTouch: true,
    locale: 'en-PH',
    timezoneId: 'Asia/Manila',
  });
  const page = await context.newPage();
  page.on('pageerror', (error) => failures.push(`${device.name}: page error: ${error.message}`));

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.locator('.app-shell').waitFor({ state: 'visible', timeout: 15000 });
  await page.waitForTimeout(2200);

  for (let index = 0; index < screens.length; index += 1) {
    const [id, label] = screens[index];
    if (id !== 'home') {
      const buttons = page.getByRole('button', { name: label, exact: true });
      const count = await buttons.count();
      if (!count) throw new Error(`Could not find ${label} navigation control`);
      await buttons.last().click();
      await page.waitForTimeout(1800);
    }

    await page.screenshot({
      path: `store/screenshots/${device.name}/${String(index + 1).padStart(2, '0')}-${id}.png`,
      fullPage: false,
      animations: 'disabled',
    });
  }

  await context.close();
}

await browser.close();
if (failures.length) {
  throw new Error(`Store screenshot QA found browser errors:\n${failures.join('\n')}`);
}
console.log('Store screenshot QA passed for iOS and Android portrait layouts.');
