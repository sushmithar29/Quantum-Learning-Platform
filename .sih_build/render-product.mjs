import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  headless: true,
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1.5 });
  await page.route('https://fonts.googleapis.com/**', route => route.abort());
  await page.route('https://fonts.gstatic.com/**', route => route.abort());
  const errors = [];
  page.on('pageerror', err => errors.push(err.message));
  await page.goto(pathToFileURL(path.join(root, 'virtual-labs/circuit-lab.html')).href, { waitUntil: 'load' });
  await page.locator('#circuit-state-vector .state-ket-item').first().waitFor();
  const panel = await page.locator('#panel-simulation').boundingBox();
  const circuit = await page.locator('.vlab-sim-layout').boundingBox();
  const results = await page.locator('.vlab-analytics-grid').boundingBox();
  const clip = { x: panel.x, y: circuit.y, width: panel.width, height: results.y + results.height - circuit.y };
  await page.screenshot({ path: path.join(root, '.sih_build/product-demo.png'), clip, animations: 'disabled' });
  await page.screenshot({ path: path.join(root, '.sih_build/product-demo-full.png'), fullPage: true, animations: 'disabled' });
  const info = { viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1.5, clip, errors, stateVector: await page.locator('#circuit-state-vector').innerText(), histogram: await page.locator('#circuit-histogram').innerText() };
  await fs.writeFile(path.join(root, '.sih_build/product-demo.json'), JSON.stringify(info, null, 2));
  console.log(JSON.stringify(info));
} finally {
  await browser.close();
}
