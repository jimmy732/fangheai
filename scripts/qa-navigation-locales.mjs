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

const outputDir = join(process.cwd(), 'qa', 'navigation-locales');
mkdirSync(outputDir, { recursive: true });
const checks = [];
const issues = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail: String(detail || '') });
const browser = await chromium.launch({ headless: true, executablePath: browserPath });

async function newPage(viewport, locale = 'en') {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  await page.route('**/api/fbox-content/translate', async route => {
    const payload = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ data: { locale: payload.locale, translations: payload.texts || [], upstream_available: false } })
    });
  });
  await page.addInitScript(selectedLocale => {
    if (sessionStorage.getItem('navigation-qa-initialized') === '1') return;
    localStorage.setItem('fbox-locale', selectedLocale);
    localStorage.setItem('fbox-locale-mode', 'manual');
    localStorage.setItem('fbox-cookie', 'dismissed');
    sessionStorage.setItem('navigation-qa-initialized', '1');
  }, locale);
  page.on('pageerror', error => issues.push(`pageerror: ${error.message}`));
  page.on('console', message => {
    if (message.type() === 'error' && !/favicon/i.test(message.text())) issues.push(`console: ${message.text()}`);
  });
  return page;
}

const desktop = await newPage({ width: 1440, height: 980 });
await desktop.goto(`${baseUrl}/fitment-lab#home`, { waitUntil: 'domcontentloaded' });
await desktop.waitForSelector('.fitment-entry-page');
check('Dedicated Fitment path ignores stale #home hash', await desktop.locator('.fitment-entry-page').isVisible(), desktop.url());

await desktop.locator('.cerui-brand').click();
await desktop.waitForSelector('.premium-global-home');
check('Brand returns from Fitment Lab to homepage route', new URL(desktop.url()).pathname === '/' && new URL(desktop.url()).hash === '#home', desktop.url());

await desktop.goto(`${baseUrl}/fitment-lab`, { waitUntil: 'domcontentloaded' });
await desktop.locator('.nav-link', { hasText: 'Customization' }).click();
await desktop.waitForTimeout(120);
check('Customization navigation crosses from dedicated path to hash route', new URL(desktop.url()).pathname === '/' && new URL(desktop.url()).hash === '#custom', desktop.url());

await desktop.goto(`${baseUrl}/fitment-lab`, { waitUntil: 'domcontentloaded' });
await desktop.locator('.nav-shop-toggle').click();
await desktop.locator('.mega-menu [data-action="catalog-collection"][data-collection="monoblock"]').click();
await desktop.waitForSelector('.forged-store-layout');
check('Mega-menu collection opens the real catalog route', new URL(desktop.url()).pathname === '/' && new URL(desktop.url()).hash === '#store', desktop.url());
check('Mega-menu collection changes catalog state', await desktop.locator('.catalog-collection-tabs .is-active').textContent().then(value => /Monoblock/i.test(value || '')), await desktop.locator('.catalog-collection-tabs .is-active').textContent());

await desktop.locator('a[data-app-path][href="/fitment-lab"]').first().click();
await desktop.waitForSelector('.fitment-entry-page');
check('Fitment link returns from catalog to dedicated path', new URL(desktop.url()).pathname === '/fitment-lab' && !new URL(desktop.url()).hash, desktop.url());

const localeExpectations = {
  'zh-CN': ['定制选项', '工厂', '外贸与 DDP'],
  'zh-TW': ['客製選項', '工廠', '外貿與 DDP'],
  ja: ['カスタマイズ', '工場', '取引・DDP'],
  ko: ['커스터마이징', '공장', '무역 및 DDP'],
  de: ['Individualisierung', 'Werk', 'Handel & DDP'],
  fr: ['Personnalisation', 'Usine', 'Commerce & DDP'],
  es: ['Personalización', 'Fábrica', 'Comercio y DDP'],
  it: ['Personalizzazione', 'Fabbrica', 'Commercio e DDP'],
  'pt-BR': ['Personalização', 'Fábrica', 'Comércio e DDP'],
  ru: ['Индивидуальная настройка', 'Завод', 'Торговля и DDP'],
  ar: ['التخصيص', 'المصنع', 'التجارة وDDP'],
  nl: ['Maatwerk', 'Fabriek', 'Handel & DDP'],
  tr: ['Özelleştirme', 'Fabrika', 'Ticaret ve DDP'],
  pl: ['Personalizacja', 'Fabryka', 'Handel i DDP'],
  vi: ['Tùy chỉnh', 'Nhà máy', 'Thương mại & DDP'],
  th: ['การปรับแต่ง', 'โรงงาน', 'การค้าและ DDP'],
  id: ['Kustomisasi', 'Pabrik', 'Perdagangan & DDP'],
  hi: ['कस्टमाइज़ेशन', 'फैक्ट्री', 'व्यापार और DDP']
};

for (const [locale, expected] of Object.entries(localeExpectations)) {
  await desktop.locator('.desktop-locale-control [data-locale]').selectOption(locale);
  await desktop.waitForFunction(code => document.documentElement.lang === code, locale);
  const labels = await desktop.locator('.nav-links > .nav-link').allTextContents();
  const normalized = labels.map(value => value.trim());
  const forgedLabel = (await desktop.locator('.nav-shop-toggle > span').first().textContent() || '').trim();
  const rfqLabel = (await desktop.locator('.header-action[data-action="cart"] > span').textContent() || '').trim();
  check(`${locale} top navigation is immediate and static`, expected.every(value => normalized.includes(value)) && forgedLabel !== 'Forged wheels' && rfqLabel !== 'RFQ list', `${forgedLabel} | ${normalized.join(' | ')} | ${rfqLabel}`);
  check(`${locale} document language metadata`, await desktop.evaluate(code => document.documentElement.lang === code && document.documentElement.dir === (code === 'ar' ? 'rtl' : 'ltr'), locale));
}

await desktop.locator('.desktop-locale-control [data-locale]').selectOption('zh-CN');
await desktop.locator('.nav-shop-toggle').click();
const chineseMega = (await desktop.locator('.mega-menu').innerText()).replace(/\s+/g, ' ');
check('Chinese mega menu has no English fallback labels', ['轮毂结构', '适配工具', '表面处理与颜色', '工厂与外贸', '打开询价清单'].every(value => chineseMega.includes(value)), chineseMega.slice(0, 360));
await desktop.reload({ waitUntil: 'domcontentloaded' });
check('Manual language persists after reload', await desktop.evaluate(() => document.documentElement.lang === 'zh-CN' && localStorage.getItem('fbox-locale') === 'zh-CN'));
await desktop.screenshot({ path: join(outputDir, 'desktop-zh-navigation.png'), fullPage: false });

const mobile = await newPage({ width: 390, height: 844 });
await mobile.goto(`${baseUrl}/fitment-lab`, { waitUntil: 'domcontentloaded' });
await mobile.locator('.hamburger').click();
await mobile.waitForSelector('.nav-row.is-open');
check('Mobile menu opens from a single toggle', await mobile.locator('.nav-row.is-open').isVisible());
check('Mobile toggle becomes the single close control', await mobile.locator('.hamburger[aria-label="Close navigation"]').count() === 1);
check('Mobile language selector is visible inside menu', await mobile.locator('.mobile-locale-control [data-locale]').isVisible());
check('Mobile account and RFQ shortcuts are visible', await mobile.locator('.mobile-nav-shortcut').count() === 2);
await mobile.locator('.mobile-locale-control [data-locale]').selectOption('de');
await mobile.waitForFunction(() => document.documentElement.lang === 'de');
check('Mobile language changes without losing the open menu', await mobile.locator('.nav-row.is-open').isVisible());
check('Mobile navigation switches language immediately', await mobile.locator('.nav-link', { hasText: 'Individualisierung' }).isVisible());
await mobile.screenshot({ path: join(outputDir, 'mobile-de-navigation-open.png'), fullPage: false });
await mobile.locator('.nav-link', { hasText: 'Individualisierung' }).click();
await mobile.waitForTimeout(120);
check('Mobile navigation closes after route selection', await mobile.locator('.nav-row.is-open').count() === 0);
check('Mobile route selection leaves dedicated Fitment path', new URL(mobile.url()).pathname === '/' && new URL(mobile.url()).hash === '#custom', mobile.url());
const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
check('Mobile localized navigation has no horizontal overflow', overflow <= 1, `${overflow}px`);
await mobile.screenshot({ path: join(outputDir, 'mobile-de-navigation.png'), fullPage: false });

await desktop.close();
await mobile.close();
await browser.close();

const report = { passed: checks.every(item => item.pass) && issues.length === 0, checks, issues };
writeFileSync(join(outputDir, 'report.json'), JSON.stringify(report, null, 2));
for (const item of checks) console.log(`${item.pass ? 'PASS' : 'FAIL'} ${item.name}${item.detail ? ` :: ${item.detail}` : ''}`);
for (const issue of issues) console.log(`ISSUE ${issue}`);
console.log(`PASSED=${report.passed} CHECKS=${checks.length} FAILED=${checks.filter(item => !item.pass).length} ISSUES=${issues.length}`);
if (!report.passed) process.exitCode = 1;
