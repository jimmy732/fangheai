import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const runtimeModules = process.env.CODEX_NODE_MODULES
  || join(process.env.USERPROFILE || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules');
const requireFromRuntime = createRequire(join(runtimeModules, 'qa-loader.cjs'));
const { chromium } = requireFromRuntime('playwright');
const baseUrl = process.env.FBOX_QA_URL || 'http://127.0.0.1:4174';
const browserPath = [
  process.env.QA_BROWSER_EXECUTABLE,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean).find(existsSync);
if (!browserPath) throw new Error('No Chromium browser executable found.');

const outputDir = join(process.cwd(), 'qa', 'export-catalog');
mkdirSync(outputDir, { recursive: true });
const checks = [];
const issues = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail: String(detail || '') });
const browser = await chromium.launch({ headless: true, executablePath: browserPath });

async function pageAt(path, viewport) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.addInitScript(() => {
    localStorage.setItem('fbox-locale', 'en');
    localStorage.setItem('fbox-locale-mode', 'manual');
  });
  page.on('pageerror', error => issues.push(`pageerror ${path}: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') issues.push(`console ${path}: ${message.text()}`); });
  page.on('requestfailed', request => {
    if (request.url().startsWith(baseUrl) && request.failure()?.errorText !== 'net::ERR_ABORTED') issues.push(`request ${path}: ${request.url()} ${request.failure()?.errorText || ''}`);
  });
  page.on('response', response => {
    if (response.url().startsWith(baseUrl) && response.status() >= 400) issues.push(`response ${path}: ${response.status()} ${response.url()}`);
  });
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.forged-product-card').length > 0 || !location.hash.includes('store'), null, { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(500);
  return page;
}

const overflow = page => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
const cardData = page => page.locator('.forged-product-card').evaluateAll(cards => cards.map(card => ({
  title: card.querySelector('.product-title')?.textContent.trim() || '',
  badge: card.querySelector('.product-badge')?.textContent.trim() || '',
  moq: card.querySelector('.catalog-proof-row')?.textContent.trim() || '',
  ddp: card.querySelector('.product-deal')?.textContent.trim() || ''
})));

try {
  const desktop = await pageAt('/#store', { width: 1440, height: 900 });
  let cards = await cardData(desktop);
  check('public catalog renders exactly 48 forged directions', cards.length === 48, cards.length);
  check('every card exposes MOQ and Europe/North America DDP', cards.every(card => /MOQ\s*4/i.test(card.moq) && /Europe/i.test(card.ddp) && /North America/i.test(card.ddp)));
  check('desktop catalog has no horizontal overflow', await overflow(desktop) === 0, await overflow(desktop));

  await desktop.locator('[data-action="catalog-collection"][data-collection="two-piece"]').first().click();
  await desktop.waitForTimeout(220);
  cards = await cardData(desktop);
  check('2-piece filter visibly narrows the catalog to six confirmed directions', cards.length === 6 && cards.every(card => /2-piece/i.test(card.badge)), JSON.stringify(cards.map(card => card.badge)));

  await desktop.locator('[data-action="catalog-collection"][data-collection="monoblock"]').first().click();
  await desktop.waitForTimeout(220);
  cards = await cardData(desktop);
  check('monoblock filter visibly narrows the catalog to 36 directions', cards.length === 36 && cards.every(card => /monoblock/i.test(card.badge)), cards.length);

  await desktop.locator('[data-action="catalog-collection"][data-collection="aero-floating"]').first().click();
  await desktop.waitForTimeout(220);
  check('aero and floating filter opens its eight real directions', await desktop.locator('.forged-product-card').count() === 8, await desktop.locator('.forged-product-card').count());
  await desktop.locator('[data-action="catalog-collection"][data-collection="suv-off-road"]').first().click();
  await desktop.waitForTimeout(220);
  check('SUV and off-road filter opens the classified direction', await desktop.locator('.forged-product-card').count() === 1, await desktop.locator('.forged-product-card').count());

  await desktop.locator('[data-action="catalog-collection"][data-collection="all"]').first().click();
  await desktop.locator('[data-filter="ai"]').first().fill('CR-01');
  await desktop.locator('[data-filter="ai"]').first().dispatchEvent('input');
  await desktop.waitForTimeout(250);
  cards = await cardData(desktop);
  check('design search changes the visible result set', cards.length === 1 && /CR-01/i.test(cards[0].title), JSON.stringify(cards));

  await desktop.locator('[data-action="clear-filters"]').first().click();
  await desktop.waitForTimeout(250);
  await desktop.locator('.forged-product-card [data-action="add"]').first().click();
  await desktop.waitForTimeout(200);
  check('adding a design updates the RFQ count', await desktop.locator('.cart-count').innerText() === '1', await desktop.locator('.cart-count').innerText());
  await desktop.locator('[data-action="cart"]').first().click();
  await desktop.waitForTimeout(220);
  check('RFQ list replaces checkout semantics', await desktop.locator('.rfq-page').count() === 1 && /Request for quotation/i.test(await desktop.locator('.rfq-page').innerText()));
  check('RFQ list starts at the declared MOQ of four', /4\s*total wheels/i.test((await desktop.locator('.rfq-summary').innerText()).replace(/\s+/g, ' ')));
  await desktop.locator('[data-action="request-rfq"]').click();
  await desktop.waitForTimeout(180);
  const requiredFields = await desktop.locator('.rfq-form [required]').count();
  check('RFQ modal requires contact, vehicle, country and postcode', requiredFields >= 5, requiredFields);
  check('DDP request is selected and explains regional review', await desktop.locator('.rfq-form input[name="ddp_requested"]').isChecked() && /Europe and North America/i.test(await desktop.locator('.rfq-ddp-choice').innerText()));
  check('desktop RFQ modal has no horizontal overflow', await overflow(desktop) === 0, await overflow(desktop));
  await desktop.screenshot({ path: join(outputDir, 'desktop-rfq.png'), fullPage: true });
  await desktop.locator('.rfq-modal .modal-close').click();
  await desktop.close();

  const detail = await pageAt('/#product/fbox-sv100', { width: 1440, height: 900 });
  const detailText = await detail.locator('.forged-detail').innerText();
  check('product detail exposes construction, MOQ, load and DDP evidence', /2-piece/i.test(detailText) && /Minimum order/i.test(detailText) && /Load target/i.test(detailText) && /Europe\s*\+\s*North America/i.test(detailText));
  const detailActions = {
    add: await detail.locator('.detail-purchase [data-action="add"]').count(),
    request: await detail.locator('.detail-purchase [data-action="request-rfq"]').count(),
    legacyCheckoutText: (detailText.match(/Buy it now|PayPal/gi) || []),
    actions: await detail.locator('.forged-detail [data-action]').evaluateAll(nodes => nodes.map(node => `${node.dataset.action}:${node.className}`))
  };
  check('product detail uses RFQ actions rather than checkout', detailActions.add === 1 && detailActions.request === 1 && detailActions.legacyCheckoutText.length === 0, JSON.stringify(detailActions));
  check('product detail has no horizontal overflow', await overflow(detail) === 0, await overflow(detail));
  await detail.locator('[data-action="wheel-open"]').click();
  await detail.waitForTimeout(180);
  const layerOrder = await detail.evaluate(() => ({
    visualizer: Number.parseInt(getComputedStyle(document.querySelector('.wheel-visualizer-overlay')).zIndex, 10),
    header: Number.parseInt(getComputedStyle(document.querySelector('.site-header')).zIndex, 10)
  }));
  check('vehicle photo visualizer opens above the sticky header', await detail.locator('.wheel-visualizer-overlay').count() === 1 && layerOrder.visualizer > layerOrder.header, JSON.stringify(layerOrder));
  await detail.locator('.wheel-modal-close').click();
  await detail.close();

  for (const [name, path, selector] of [
    ['customization', '/#custom', '.customization-page'],
    ['trade and DDP', '/#trade', '.trade-page']
  ]) {
    const page = await pageAt(path, { width: 1440, height: 900 });
    check(`${name} page renders`, await page.locator(selector).count() === 1);
    check(`${name} page has no horizontal overflow`, await overflow(page) === 0, await overflow(page));
    if (name === 'trade and DDP') check('trade page states both DDP regions and postcode review', /Europe and North America/i.test(await page.locator('main').innerText()) && /postcode/i.test(await page.locator('main').innerText()));
    await page.close();
  }

  const locale = await pageAt('/#store', { width: 1440, height: 900 });
await locale.locator('.desktop-locale-control [data-locale]').selectOption('zh-CN');
  await locale.waitForTimeout(750);
  const localeText = await locale.locator('.forged-catalog-hero').innerText();
  const chineseCatalogText = `${localeText}\n${await locale.locator('.forged-filter-rail').innerText()}\n${await locale.locator('.forged-product-card').first().innerText()}`;
  check('new catalog route has explicit Simplified Chinese localization', /[\u3400-\u9fff]/.test(chineseCatalogText) && !/Forged wheel catalog|Choose the design|Every public wheel|Find the right starting design|Add to RFQ/i.test(chineseCatalogText), chineseCatalogText.slice(0, 260));
  await locale.screenshot({ path: join(outputDir, 'desktop-catalog-zh-CN.png'), fullPage: true });
  await locale.close();

  const mobile = await pageAt('/#store', { width: 390, height: 844 });
  check('mobile catalog has no horizontal overflow', await overflow(mobile) === 0, await overflow(mobile));
  check('mobile catalog cards remain usable', await mobile.locator('.forged-product-card').count() === 48);
  await mobile.locator('.forged-product-card [data-action="add"]').first().click();
  await mobile.locator('[data-action="cart"]').first().click();
  await mobile.waitForTimeout(200);
  await mobile.locator('[data-action="request-rfq"]').click();
  await mobile.waitForTimeout(180);
  check('mobile RFQ modal remains inside the viewport', await overflow(mobile) === 0, await overflow(mobile));
  const closeBox = await mobile.locator('.rfq-modal .modal-close').boundingBox();
  check('mobile RFQ has one unambiguous visible close control', await mobile.locator('.rfq-modal .modal-close').count() === 1 && closeBox && closeBox.x >= 0 && closeBox.x + closeBox.width <= 390, JSON.stringify(closeBox));
  await mobile.screenshot({ path: join(outputDir, 'mobile-rfq.png'), fullPage: true });
  await mobile.close();
} finally {
  await browser.close();
}

check('no same-origin browser errors', issues.length === 0, issues.join('\n'));
const failed = checks.filter(item => !item.pass);
const report = { generated_at: new Date().toISOString(), base_url: baseUrl, checks, issues, passed: failed.length === 0 };
writeFileSync(join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
for (const item of checks) console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` — ${item.detail}` : ''}`);
if (failed.length) process.exitCode = 1;
