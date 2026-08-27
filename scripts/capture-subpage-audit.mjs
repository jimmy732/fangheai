import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const runtimeModules = process.env.CODEX_NODE_MODULES
  || join(process.env.USERPROFILE || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules');
const requireFromRuntime = createRequire(join(runtimeModules, 'subpage-audit-loader.cjs'));
const { chromium } = requireFromRuntime('playwright');

const baseUrl = process.env.FBOX_QA_URL || 'http://127.0.0.1:4174';
const prefix = process.env.AUDIT_PREFIX || 'before';
const outputDir = join(process.cwd(), 'qa', 'subpages-audit', '2026-08-26');
mkdirSync(outputDir, { recursive: true });

const executablePath = [
  process.env.QA_BROWSER_EXECUTABLE,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean).find(existsSync);
if (!executablePath) throw new Error('No Chromium browser executable found for visual audit.');

const browser = await chromium.launch({ headless: true, executablePath });
const report = { prefix, baseUrl, capturedAt: new Date().toISOString(), pages: [], issues: [] };

async function pageMetrics(page) {
  return page.evaluate(() => ({
    url: location.href,
    title: document.title,
    width: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyHeight: document.body.scrollHeight,
    bodyClass: document.body.className,
    h1: document.querySelector('h1')?.innerText?.trim() || '',
    headingFonts: [...document.querySelectorAll('h1,h2,h3')].slice(0, 8).map(element => ({
      text: element.innerText.trim().slice(0, 80),
      font: getComputedStyle(element).fontFamily,
      size: getComputedStyle(element).fontSize,
      weight: getComputedStyle(element).fontWeight
    }))
  }));
}

async function open(path, viewport, name, options = {}) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const localIssues = [];
  page.on('console', message => {
    if (message.type() === 'error') localIssues.push(`console: ${message.text()}`);
  });
  page.on('pageerror', error => localIssues.push(`pageerror: ${error.message}`));
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(options.wait || 850);
  if (options.action) await options.action(page);
  await page.waitForTimeout(250);
  const metrics = await pageMetrics(page);
  const screenshot = join(outputDir, `${prefix}-${name}.png`);
  await page.screenshot({ path: screenshot, fullPage: Boolean(options.fullPage) });
  report.pages.push({ name, path, viewport, screenshot, metrics, issues: localIssues });
  report.issues.push(...localIssues.map(issue => `${name}: ${issue}`));
  return page;
}

try {
  const desktop = { width: 1440, height: 900 };
  const mobile = { width: 390, height: 844 };

  const home = await open('/', desktop, 'home-desktop');
  await home.evaluate(() => window.scrollTo(0, 760));
  await home.waitForTimeout(350);
  report.homeHeaderScrolled = await home.evaluate(() => ['.announcement', '.partner-attribution', '.site-header', '.header-main', '.nav-row'].map(selector => {
    const element = document.querySelector(selector);
    const box = element?.getBoundingClientRect();
    return { selector, exists: Boolean(element), top: box?.top ?? null, bottom: box?.bottom ?? null, position: element ? getComputedStyle(element).position : '' };
  }));
  await home.screenshot({ path: join(outputDir, `${prefix}-home-header-scrolled.png`), fullPage: false });
  await home.close();

  const about = await open('/#about', desktop, 'about-desktop');
  const topHeader = await about.evaluate(() => {
    const rows = ['.announcement', '.partner-attribution', '.header-main', '.nav-row'];
    return rows.map(selector => {
      const element = document.querySelector(selector);
      const box = element?.getBoundingClientRect();
      return { selector, exists: Boolean(element), top: box?.top ?? null, bottom: box?.bottom ?? null, position: element ? getComputedStyle(element).position : '' };
    });
  });
  await about.evaluate(() => window.scrollTo(0, 760));
  await about.waitForTimeout(350);
  const scrolledHeader = await about.evaluate(() => {
    const rows = ['.announcement', '.partner-attribution', '.site-header', '.header-main', '.nav-row'];
    return rows.map(selector => {
      const element = document.querySelector(selector);
      const box = element?.getBoundingClientRect();
      return { selector, exists: Boolean(element), top: box?.top ?? null, bottom: box?.bottom ?? null, position: element ? getComputedStyle(element).position : '' };
    });
  });
  report.header = { top: topHeader, scrolled: scrolledHeader };
  await about.screenshot({ path: join(outputDir, `${prefix}-about-header-scrolled.png`), fullPage: false });
  await about.close();

  const aboutPartner = await open('/#about', desktop, 'about-partner-desktop', {
    action: async page => {
      await page.evaluate(() => localStorage.setItem('fbox-workshop-referral', JSON.stringify({
        share_token: 'audit-partner-header',
        shop_name: 'DAS PERFORMANCE WORKSHOP',
        expires_at: Date.now() + 24 * 60 * 60 * 1000
      })));
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(450);
    }
  });
  const partnerTop = await aboutPartner.evaluate(() => ['.announcement', '.partner-attribution', '.site-header', '.header-main', '.nav-row'].map(selector => {
    const element = document.querySelector(selector);
    const box = element?.getBoundingClientRect();
    return { selector, exists: Boolean(element), top: box?.top ?? null, bottom: box?.bottom ?? null, position: element ? getComputedStyle(element).position : '' };
  }));
  await aboutPartner.evaluate(() => window.scrollTo(0, 760));
  await aboutPartner.waitForTimeout(350);
  const partnerScrolled = await aboutPartner.evaluate(() => ['.announcement', '.partner-attribution', '.site-header', '.header-main', '.nav-row'].map(selector => {
    const element = document.querySelector(selector);
    const box = element?.getBoundingClientRect();
    return { selector, exists: Boolean(element), top: box?.top ?? null, bottom: box?.bottom ?? null, position: element ? getComputedStyle(element).position : '' };
  }));
  report.partnerHeader = { top: partnerTop, scrolled: partnerScrolled };
  await aboutPartner.screenshot({ path: join(outputDir, `${prefix}-about-partner-header-scrolled.png`), fullPage: false });
  await aboutPartner.close();

  const store = await open('/#store', desktop, 'store-desktop');
  const firstProduct = await store.locator('.product-card a[href^="#product/"]').first().getAttribute('href').catch(() => null);
  await store.close();
  if (firstProduct) {
    const product = await open(`/${firstProduct}`, desktop, 'product-desktop');
    await product.close();
  }

  const blog = await open('/#blog', desktop, 'journal-desktop');
  await blog.close();
  const account = await open('/#account', desktop, 'account-desktop');
  await account.close();
  const cart = await open('/#cart', desktop, 'cart-desktop');
  await cart.close();

  const fitment = await open('/fitment-lab', desktop, 'fitment-entry-desktop');
  await fitment.locator('.fitment-entry-path[data-mode="fitment-first"]').click();
  await fitment.waitForTimeout(300);
  await fitment.screenshot({ path: join(outputDir, `${prefix}-fitment-modal-desktop.png`), fullPage: false });
  report.pages.push({ name: 'fitment-modal-desktop', screenshot: join(outputDir, `${prefix}-fitment-modal-desktop.png`), metrics: await pageMetrics(fitment), issues: [] });
  await fitment.close();

  const aboutMobile = await open('/#about', mobile, 'about-mobile');
  await aboutMobile.evaluate(() => window.scrollTo(0, 720));
  await aboutMobile.waitForTimeout(250);
  await aboutMobile.screenshot({ path: join(outputDir, `${prefix}-about-mobile-scrolled.png`), fullPage: false });
  await aboutMobile.close();

  const fitmentMobile = await open('/fitment-lab', mobile, 'fitment-entry-mobile');
  await fitmentMobile.locator('.fitment-entry-path[data-mode="fitment-first"]').click();
  await fitmentMobile.waitForTimeout(250);
  await fitmentMobile.screenshot({ path: join(outputDir, `${prefix}-fitment-modal-mobile.png`), fullPage: false });
  await fitmentMobile.close();
} finally {
  await browser.close();
  writeFileSync(join(outputDir, `${prefix}-audit.json`), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify({ pages: report.pages.length, issues: report.issues.length, outputDir, header: report.header }, null, 2));
