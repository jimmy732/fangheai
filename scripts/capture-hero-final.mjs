import { createRequire } from 'node:module';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const runtimeModules = process.env.CODEX_NODE_MODULES
  || join(process.env.USERPROFILE || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules');
const requireFromRuntime = createRequire(join(runtimeModules, 'hero-capture-loader.cjs'));
const { chromium } = requireFromRuntime('playwright');

const baseUrl = process.env.FBOX_QA_URL || 'http://127.0.0.1:4174';
const outputDir = join(process.cwd(), 'qa', 'video-review', '2026-08-27', 'site-final');
mkdirSync(outputDir, { recursive: true });

const executablePath = [
  process.env.QA_BROWSER_EXECUTABLE,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean).find(existsSync);
if (!executablePath) throw new Error('No Chromium browser executable found for hero capture.');

const browser = await chromium.launch({ headless: true, executablePath });

async function capture(name, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.setItem('fbox-cookie', 'dismissed');
    localStorage.setItem('fbox-locale', 'zh-CN');
    localStorage.setItem('fbox-locale-mode', 'manual');
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const video = document.querySelector('.premium-hero-video');
    return Boolean(video && video.readyState >= 2 && video.videoWidth > 0);
  }, null, { timeout: 15000 });
  await page.locator('.premium-hero-video').evaluate(async video => {
    video.pause();
    if (Math.abs(video.currentTime - 2.6) < 0.05) return;
    await new Promise(resolve => {
      video.addEventListener('seeked', resolve, { once: true });
      video.currentTime = 2.6;
    });
  });
  await page.screenshot({ path: join(outputDir, `${name}.png`), fullPage: false });
  const state = await page.locator('.premium-hero-video').evaluate(video => ({
    source: video.currentSrc,
    width: video.videoWidth,
    height: video.videoHeight,
    currentTime: video.currentTime,
    paused: video.paused
  }));
  await page.close();
  return state;
}

try {
  const desktop = await capture('homepage-desktop-1440x900.png'.replace('.png', ''), { width: 1440, height: 900 });
  const mobile = await capture('homepage-mobile-390x844.png'.replace('.png', ''), { width: 390, height: 844 });
  console.log(JSON.stringify({ outputDir, desktop, mobile }, null, 2));
} finally {
  await browser.close();
}
