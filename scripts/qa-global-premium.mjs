import { createRequire } from 'node:module';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const runtimeModules = process.env.CODEX_NODE_MODULES
  || join(process.env.USERPROFILE || '', '.cache', 'codex-runtimes', 'codex-primary-runtime', 'dependencies', 'node', 'node_modules');
const requireFromRuntime = createRequire(join(runtimeModules, 'qa-loader.cjs'));
const { chromium } = requireFromRuntime('playwright');

const baseUrl = process.env.FBOX_QA_URL || 'http://127.0.0.1:4174';
const edgeCandidates = [
  process.env.QA_BROWSER_EXECUTABLE,
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
].filter(Boolean);
const executablePath = edgeCandidates.find(existsSync);
if (!executablePath) throw new Error('No Chromium browser executable found for QA.');

const outputDir = join(process.cwd(), 'qa', 'global-premium');
mkdirSync(outputDir, { recursive: true });

const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass: Boolean(pass), detail: String(detail || '') });
const pageIssues = [];

const browser = await chromium.launch({ headless: true, executablePath });

async function openPage(viewport, path = '/') {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  page.on('console', message => {
    if (message.type() === 'error') pageIssues.push(`console ${path}: ${message.text()}`);
  });
  page.on('requestfailed', request => {
    const isTestNavigationAbort = request.failure()?.errorText === 'net::ERR_ABORTED';
    if (request.url().startsWith(baseUrl) && !isTestNavigationAbort) pageIssues.push(`request ${path}: ${request.url()} (${request.failure()?.errorText || 'failed'})`);
  });
  page.on('response', response => {
    if (response.status() >= 400 && response.url().startsWith(baseUrl)) {
      pageIssues.push(`response ${path}: ${response.status()} ${response.url()}`);
    }
  });
  await page.goto(`${baseUrl}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(900);
  return page;
}

async function activatePartnerReferral(page) {
  await page.evaluate(() => {
    localStorage.setItem('fbox-workshop-referral', JSON.stringify({
      share_token: 'qa-partner-layout',
      shop_name: 'DAS PERFORMANCE WORKSHOP',
      expires_at: Date.now() + 24 * 60 * 60 * 1000
    }));
  });
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(450);
}

async function partnerHeaderLayout(page) {
  return page.evaluate(() => {
    const rect = selector => {
      const element = document.querySelector(selector);
      const bounds = element?.getBoundingClientRect();
      return bounds ? { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right, height: bounds.height } : null;
    };
    const announcement = rect('.announcement');
    const attribution = rect('.partner-attribution');
    const header = rect('.site-header');
    return {
      announcement,
      attribution,
      header,
      ordered: Boolean(announcement && attribution && header && announcement.bottom <= attribution.top + 1 && attribution.bottom <= header.top + 1),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
}

try {
  const desktop = await openPage({ width: 1440, height: 900 });
  await desktop.waitForFunction(() => {
    const video = document.querySelector('.premium-hero-video');
    return Boolean(video && video.readyState >= 2 && video.videoWidth > 0);
  }, null, { timeout: 12000 }).catch(() => {});
  const desktopVideo = await desktop.locator('.premium-hero-video').evaluate(video => ({
    readyState: video.readyState,
    paused: video.paused,
    width: video.videoWidth,
    height: video.videoHeight,
    src: video.currentSrc
  }));
  const headerAtRest = await desktop.evaluate(() => {
    const bounds = selector => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? { top: rect.top, bottom: rect.bottom } : null;
    };
    return {
      announcement: bounds('.announcement'),
      siteHeader: bounds('.site-header'),
      headerMain: bounds('.header-main'),
      nav: bounds('.nav-row')
    };
  });
  check('homepage shows the complete header stack at rest', Boolean(
    headerAtRest.announcement
    && headerAtRest.siteHeader
    && headerAtRest.headerMain
    && headerAtRest.nav
    && headerAtRest.announcement.bottom <= headerAtRest.siteHeader.top + 1
    && headerAtRest.headerMain.bottom <= headerAtRest.nav.top + 1
  ), JSON.stringify(headerAtRest));
  await desktop.evaluate(() => window.scrollTo(0, 760));
  await desktop.waitForTimeout(300);
  const stickyHeader = await desktop.evaluate(() => {
    const bounds = selector => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? { top: rect.top, bottom: rect.bottom } : null;
    };
    return {
      announcement: bounds('.announcement'),
      siteHeader: bounds('.site-header'),
      headerMain: bounds('.header-main'),
      nav: bounds('.nav-row')
    };
  });
  check('scroll keeps only the brand and navigation rows fixed', Boolean(
    stickyHeader.announcement?.bottom < 0
    && Math.abs(stickyHeader.siteHeader?.top || 0) <= 1
    && Math.abs(stickyHeader.headerMain?.top || 0) <= 1
    && stickyHeader.headerMain?.bottom <= stickyHeader.nav?.top + 1
  ), JSON.stringify(stickyHeader));
  await desktop.evaluate(() => window.scrollTo(0, 0));
  await desktop.locator('.premium-engineering').scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(600);
  const desktopLayout = await desktop.evaluate(() => ({
    bodyClass: document.body.className,
    home: Boolean(document.querySelector('.premium-global-home')),
    headline: document.querySelector('.premium-hero h1')?.innerText || '',
    headlineAccent: document.querySelector('.premium-hero h1 em')?.innerText || '',
    sections: document.querySelectorAll('.premium-hero, .premium-proof, .premium-fitment, .premium-products, .premium-engineering, .premium-evidence-grid, .premium-delivery').length,
    selectors: document.querySelectorAll('.premium-fitment .fitment-select').length,
    products: document.querySelectorAll('.premium-product-grid .product-card').length,
    factoryImages: [...document.querySelectorAll('.premium-engineering img')].map(image => [image.complete, image.naturalWidth, image.naturalHeight]),
    evidence: Boolean(document.querySelector('.premium-evidence-grid #resources')) && Boolean(document.querySelector('.premium-evidence-grid #gallery')),
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  check('premium body class', desktopLayout.bodyClass.includes('fbox-global-premium'));
  check('premium homepage renders', desktopLayout.home);
  check('approved localized two-line headline renders', Boolean(desktopLayout.headline.trim()) && Boolean(desktopLayout.headlineAccent.trim()), desktopLayout.headline);
  check('seven-part homepage hierarchy', desktopLayout.sections === 7, desktopLayout.sections);
  check('desktop repaired hero video decodes', desktopVideo.readyState >= 2 && desktopVideo.width === 1920 && desktopVideo.height === 1080, JSON.stringify(desktopVideo));
  check('desktop repaired hero video plays', !desktopVideo.paused, JSON.stringify(desktopVideo));
  check('five-field fitment selector retained', desktopLayout.selectors === 5, desktopLayout.selectors);
  check('four premium product directions render', desktopLayout.products === 4, desktopLayout.products);
  check('three real factory images load', desktopLayout.factoryImages.length === 3 && desktopLayout.factoryImages.every(([, width, height]) => width > 0 && height > 0), JSON.stringify(desktopLayout.factoryImages));
  check('customer reviews and real builds retained', desktopLayout.evidence);
  check('desktop homepage has no horizontal overflow', desktopLayout.overflow === 0, desktopLayout.overflow);

  await desktop.locator('[data-action="open-fitment-lab"]').click();
  await desktop.waitForTimeout(450);
  check('fitment button opens the retained lab', desktop.url().endsWith('/fitment-lab') && await desktop.locator('.fitment-entry-page').count() === 1, desktop.url());
  check('both fitment starting routes remain', await desktop.locator('.fitment-entry-path').count() === 2, await desktop.locator('.fitment-entry-path').count());
  await desktop.locator('.fitment-entry-path').first().click();
  await desktop.waitForTimeout(350);
  check('fitment workflow modal opens', await desktop.locator('.fitment-flow-overlay').count() === 1);
  await desktop.close();

  const store = await openPage({ width: 1440, height: 900 }, '/#store');
  const storeStyle = await store.evaluate(() => {
    const heading = document.querySelector('.store-hero h1');
    const card = document.querySelector('.product-card');
    return {
      headingSize: heading ? Number.parseFloat(getComputedStyle(heading).fontSize) : 999,
      cardRadius: card ? Number.parseFloat(getComputedStyle(card).borderRadius) : 999
    };
  });
  check('catalog uses the restrained premium type and square card system', storeStyle.headingSize <= 84 && storeStyle.cardRadius <= 4, JSON.stringify(storeStyle));
  const initialCartCount = Number(await store.locator('.cart-count').innerText());
  await store.locator('.product-card [data-action="quick-view"]').first().click();
  await store.waitForTimeout(250);
  check('product quick view opens', await store.locator('.overlay').count() === 1);
  await store.locator('.overlay .modal-close').click();
  await store.waitForTimeout(150);
  await store.locator('.product-card [data-action="wishlist"]').first().click();
  await store.waitForTimeout(180);
  check('wishlist interaction remains', await store.locator('.product-card [data-action="wishlist"]').first().evaluate(button => button.classList.contains('is-saved')));
  // The public catalog is now entirely forged-wheel RFQ inventory. Exercise
  // the retained list behavior with the first visible public direction.
  await store.locator('.product-card [data-action="add"]').first().click();
  await store.waitForTimeout(250);
  const updatedCartCount = Number(await store.locator('.cart-count').innerText());
  check('add-to-RFQ interaction remains', updatedCartCount === initialCartCount + 1, `${initialCartCount} -> ${updatedCartCount}`);
  await store.locator('.product-card a[href^="#product/"]').first().click();
  await store.waitForTimeout(300);
  check('product detail route remains', /#product\//.test(store.url()) && await store.locator('.wheel-visualizer-entry').count() === 1, store.url());
  const productHierarchy = await store.evaluate(() => {
    const title = document.querySelector('.detail-title');
    const meta = document.querySelector('.detail-fitment-meta');
    return {
      titleExists: Boolean(title),
      metaExists: Boolean(meta),
      titleSize: title ? Number.parseFloat(getComputedStyle(title).fontSize) : 999,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  check('product detail separates the product title from fitment metadata', productHierarchy.titleExists && productHierarchy.metaExists && productHierarchy.titleSize <= 72 && productHierarchy.overflow === 0, JSON.stringify(productHierarchy));
  await store.locator('[data-action="wheel-open"]').click();
  await store.waitForTimeout(250);
  check('vehicle photo effect generator opens', await store.locator('.wheel-visualizer-overlay, .visualizer-overlay, [data-wheel-visualizer]').count() > 0 && await store.locator('input[type="file"]').count() > 0);
  await store.close();

  for (const [name, path, selector] of [
    ['account', '/#account', '.workshop-account-page'],
    ['cart', '/#cart', '.cart-page, .cart-empty'],
    ['journal', '/#blog', '.blog-main'],
    ['about', '/#about', '.cerui-about']
  ]) {
    const page = await openPage({ width: 1440, height: 900 }, path);
    check(`${name} route renders`, await page.locator(selector).count() > 0, page.url());
    check(`${name} route has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
    await page.close();
  }

  const partnerDesktop = await openPage({ width: 1440, height: 900 });
  await activatePartnerReferral(partnerDesktop);
  const partnerDesktopLayout = await partnerHeaderLayout(partnerDesktop);
  check('partner desktop header layers are ordered', partnerDesktopLayout.ordered, JSON.stringify(partnerDesktopLayout));
  check('partner desktop header has no horizontal overflow', partnerDesktopLayout.overflow === 0, partnerDesktopLayout.overflow);
  await partnerDesktop.evaluate(() => window.scrollTo(0, 760));
  await partnerDesktop.waitForTimeout(300);
  const partnerDesktopSticky = await partnerDesktop.evaluate(() => {
    const bounds = selector => {
      const rect = document.querySelector(selector)?.getBoundingClientRect();
      return rect ? { top: rect.top, bottom: rect.bottom } : null;
    };
    return {
      announcement: bounds('.announcement'),
      attribution: bounds('.partner-attribution'),
      header: bounds('.site-header'),
      main: bounds('.header-main'),
      nav: bounds('.nav-row')
    };
  });
  check('partner attribution scrolls away while the lower two rows stay fixed', Boolean(
    partnerDesktopSticky.announcement?.bottom < 0
    && partnerDesktopSticky.attribution?.bottom < 0
    && Math.abs(partnerDesktopSticky.header?.top || 0) <= 1
    && Math.abs(partnerDesktopSticky.main?.top || 0) <= 1
    && partnerDesktopSticky.main?.bottom <= partnerDesktopSticky.nav?.top + 1
  ), JSON.stringify(partnerDesktopSticky));
  await partnerDesktop.evaluate(() => window.scrollTo(0, 0));
  await partnerDesktop.waitForTimeout(150);
  const anchoredLinks = await partnerDesktop.evaluate(() => [...document.querySelectorAll('a[href^="#home#"]')].map(anchor => {
    const id = anchor.getAttribute('href').split('#home#')[1];
    return { id, target: Boolean(document.getElementById(id)) };
  }));
  check('all home navigation anchors have live targets', anchoredLinks.every(item => item.target), JSON.stringify(anchoredLinks));
  await partnerDesktop.locator('[data-action="mega"]').click();
  const megaMenuBox = await partnerDesktop.locator('.mega-menu').boundingBox();
  check('shop mega menu opens below the complete header stack', Boolean(megaMenuBox && megaMenuBox.y >= partnerDesktopLayout.header.bottom - 1), JSON.stringify(megaMenuBox));
  await partnerDesktop.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await partnerDesktop.locator('.nav-row a[href="#custom"]').click();
  await partnerDesktop.waitForTimeout(300);
  check('customization navigation reaches its functional page', partnerDesktop.url().includes('#custom') && await partnerDesktop.locator('.customization-page').count() === 1, partnerDesktop.url());
  await partnerDesktop.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
  await partnerDesktop.locator('.header-action[data-action="account"]').click();
  await partnerDesktop.waitForTimeout(150);
  check('account control opens the login workflow', await partnerDesktop.locator('[data-form="account"]').count() === 1);
  await partnerDesktop.locator('.overlay .modal-close').click();
  await partnerDesktop.locator('.header-action[data-action="cart"]').click();
  await partnerDesktop.waitForTimeout(180);
  check('RFQ control remains usable with partner attribution', partnerDesktop.url().includes('#cart') && await partnerDesktop.locator('.cart-page, .cart-empty').count() > 0, partnerDesktop.url());
  await partnerDesktop.close();

  const partnerMobile = await openPage({ width: 390, height: 844 });
  await activatePartnerReferral(partnerMobile);
  const partnerMobileLayout = await partnerHeaderLayout(partnerMobile);
  check('partner mobile header layers are ordered', partnerMobileLayout.ordered, JSON.stringify(partnerMobileLayout));
  check('partner mobile header has no horizontal overflow', partnerMobileLayout.overflow === 0, partnerMobileLayout.overflow);
  await partnerMobile.evaluate(() => window.scrollTo(0, 500));
  await partnerMobile.waitForTimeout(250);
  const partnerMobileSticky = await partnerMobile.evaluate(() => {
    const announcement = document.querySelector('.announcement')?.getBoundingClientRect();
    const attribution = document.querySelector('.partner-attribution')?.getBoundingClientRect();
    const header = document.querySelector('.site-header')?.getBoundingClientRect();
    return {
      announcementBottom: announcement?.bottom,
      attributionBottom: attribution?.bottom,
      headerTop: header?.top
    };
  });
  check('mobile scroll removes the upper notices and keeps the main header fixed', partnerMobileSticky.announcementBottom < 0 && partnerMobileSticky.attributionBottom < 0 && Math.abs(partnerMobileSticky.headerTop || 0) <= 1, JSON.stringify(partnerMobileSticky));
  await partnerMobile.evaluate(() => window.scrollTo(0, 0));
  await partnerMobile.waitForTimeout(150);
  await partnerMobile.locator('[data-action="mobile-nav"]').click();
  check('open mobile navigation exposes an unambiguous close control', await partnerMobile.locator('.hamburger.is-open[aria-expanded="true"]').count() === 1);
  check('shop uses a separate collapsed catalog control', await partnerMobile.locator('.nav-shop-toggle[aria-expanded="false"] .nav-shop-mobile-symbol').innerText() === '+');
  await partnerMobile.locator('.nav-shop-toggle').click();
  await partnerMobile.waitForTimeout(100);
  check('mobile shop catalog expands directly below the shop row', await partnerMobile.locator('.nav-shop > .mega-menu').count() === 1 && await partnerMobile.locator('.nav-shop-toggle[aria-expanded="true"] .nav-shop-mobile-symbol').innerText() === '−');
  await partnerMobile.locator('.nav-shop-toggle').click();
  await partnerMobile.locator('.nav-row.is-open a[href="/fitment-lab"]').click();
  await partnerMobile.waitForTimeout(180);
  check('partner mobile navigation reaches the fitment calculator and closes', partnerMobile.url().endsWith('/fitment-lab') && await partnerMobile.locator('.fitment-entry-page').count() === 1 && await partnerMobile.locator('.nav-row.is-open, .hamburger.is-open').count() === 0, partnerMobile.url());
  await partnerMobile.locator('.fitment-entry-path[data-mode="style-first"]').click();
  await partnerMobile.waitForTimeout(150);
  await partnerMobile.locator('[data-action="fitment-wizard-next"]').click();
  await partnerMobile.waitForTimeout(150);
  check('style-first calculator enforces wheel selection', await partnerMobile.locator('.fitment-flow-error').count() === 1);
  await partnerMobile.locator('.fitment-flow-wheel').first().click();
  await partnerMobile.waitForTimeout(150);
  await partnerMobile.locator('[data-action="fitment-wizard-next"]').click();
  await partnerMobile.waitForTimeout(150);
  check('style-first calculator advances after selection', await partnerMobile.locator('.fitment-flow-form[data-step="2"]').count() === 1);
  check('partner mobile calculator modal has no horizontal overflow', await partnerMobile.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth && document.querySelector('.fitment-flow-modal')?.scrollWidth === document.querySelector('.fitment-flow-modal')?.clientWidth));
  await partnerMobile.screenshot({ path: join(outputDir, 'partner-mobile-fitment-final.png'), fullPage: false });
  await partnerMobile.close();

  const fitmentEndToEnd = await openPage({ width: 1440, height: 900 }, '/fitment-lab');
  await fitmentEndToEnd.evaluate(() => {
    localStorage.setItem('fbox-vehicle', JSON.stringify({ year: '2022', make: 'BMW', model: 'M3', trim: 'Competition', drive: 'AWD' }));
    localStorage.setItem('fbox-fitment-draft', JSON.stringify({
      workflow_mode: 'fitment-first', usage: 'street', fitment_goal: 'oem_safe', stance_profile: 'oem', calibration_basis: 'current_vehicle_measured',
      current_front_diameter: '19', current_front_width: '9.5', current_front_offset: '20', current_front_spacer_mm: '0', current_front_tire: '275/35R19',
      current_rear_diameter: '19', current_rear_width: '10.5', current_rear_offset: '20', current_rear_spacer_mm: '0', current_rear_tire: '285/35R19',
      front_inner_clearance_mm: '12', front_spoke_clearance_mm: '8', front_fender_clearance_mm: '14', front_compression_clearance_mm: '14', front_camber_deg: '-1.5',
      rear_inner_clearance_mm: '12', rear_spoke_clearance_mm: '8', rear_fender_clearance_mm: '14', rear_compression_clearance_mm: '14', rear_camber_deg: '-1.5',
      front_diameter: '19', front_width: '9.5', front_offset: '20', front_pcd: '5x112', front_center_bore: '66.6', front_spacer_mm: '0', front_tire: '275/35R19', front_tire_maker: 'Michelin', front_tire_model: 'Pilot Sport 4 S', front_tire_load_index: '100', front_tire_speed_rating: 'Y', front_tire_rim_min: '9', front_tire_rim_max: '11',
      rear_diameter: '19', rear_width: '10.5', rear_offset: '20', rear_pcd: '5x112', rear_center_bore: '66.6', rear_spacer_mm: '0', rear_tire: '285/35R19', rear_tire_maker: 'Michelin', rear_tire_model: 'Pilot Sport 4 S', rear_tire_load_index: '103', rear_tire_speed_rating: 'Y', rear_tire_rim_min: '9.5', rear_tire_rim_max: '11'
    }));
    localStorage.setItem('fbox-workshop-referral', JSON.stringify({ share_token: 'qa-partner-layout', shop_name: 'DAS PERFORMANCE WORKSHOP', expires_at: Date.now() + 24 * 60 * 60 * 1000 }));
  });
  await fitmentEndToEnd.reload({ waitUntil: 'domcontentloaded' });
  await fitmentEndToEnd.waitForTimeout(450);
  await fitmentEndToEnd.locator('.fitment-entry-path[data-mode="fitment-first"]').click();
  const visitedFitmentSteps = [];
  for (let expected = 1; expected <= 4; expected += 1) {
    await fitmentEndToEnd.locator(`.fitment-flow-form[data-step="${expected}"]`).waitFor();
    visitedFitmentSteps.push(Number(await fitmentEndToEnd.locator('.fitment-flow-form').getAttribute('data-step')));
    await fitmentEndToEnd.locator('[data-action="fitment-wizard-next"]').click();
    await fitmentEndToEnd.waitForTimeout(180);
  }
  await fitmentEndToEnd.locator('.fitment-flow-form[data-step="5"]').waitFor();
  visitedFitmentSteps.push(5);
  check('fitment-first calculator traverses all five steps', visitedFitmentSteps.join(',') === '1,2,3,4,5', visitedFitmentSteps.join(','));
  check('desktop calculator modal has no horizontal overflow', await fitmentEndToEnd.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth && document.querySelector('.fitment-flow-modal')?.scrollWidth === document.querySelector('.fitment-flow-modal')?.clientWidth));
  const fitmentResponsePromise = fitmentEndToEnd.waitForResponse(response => response.url().includes('/api/fbox-content/fitment/check'), { timeout: 15_000 }).catch(() => null);
  await fitmentEndToEnd.locator('[data-form="fitment-wizard"] button[type="submit"]').click();
  const fitmentResponse = await fitmentResponsePromise;
  await fitmentEndToEnd.waitForURL('**/fitment-lab/result', { timeout: 15_000 }).catch(async error => {
    const responseBody = fitmentResponse ? await fitmentResponse.text().catch(() => '') : '';
    const visibleError = await fitmentEndToEnd.locator('.fitment-flow-error').allTextContents();
    throw new Error(`${error.message}\nFitment response: ${fitmentResponse?.status() || 'none'} ${responseBody}\nVisible errors: ${JSON.stringify(visibleError)}`);
  });
  check('fitment calculator submits and renders proposals', await fitmentEndToEnd.locator('.fitment-result-page').count() === 1 && await fitmentEndToEnd.locator('.fitment-flow-error').count() === 0, fitmentEndToEnd.url());
  await fitmentEndToEnd.screenshot({ path: join(outputDir, 'fitment-end-to-end-final.png'), fullPage: false });
  await fitmentEndToEnd.close();

  const mobile = await openPage({ width: 390, height: 844 });
  await mobile.waitForTimeout(700);
  const mobileFirstPaint = await mobile.evaluate(() => {
    const copy = document.querySelector('.premium-hero-copy');
    const rect = copy?.getBoundingClientRect();
    return {
      copyVisible: Boolean(rect && rect.top >= 0 && rect.top < innerHeight && rect.bottom > 0 && getComputedStyle(copy).opacity !== '0'),
      copyRect: rect ? [rect.x, rect.y, rect.width, rect.height] : [],
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
    };
  });
  await mobile.waitForFunction(() => {
    const video = document.querySelector('.premium-hero-video');
    return video?.readyState >= 2 && video.videoWidth > 0;
  }, null, { timeout: 7000 }).catch(() => undefined);
  const mobileVideo = await mobile.evaluate(() => {
    const video = document.querySelector('.premium-hero-video');
    return video ? { readyState: video.readyState, paused: video.paused, width: video.videoWidth, height: video.videoHeight, src: video.currentSrc } : null;
  });
  check('mobile hero copy is visible in the first screen', mobileFirstPaint.copyVisible, JSON.stringify(mobileFirstPaint.copyRect));
  check('mobile repaired hero video decodes', mobileVideo?.readyState >= 2 && mobileVideo?.width === 1280 && mobileVideo?.height === 720, JSON.stringify(mobileVideo));
  check('mobile repaired hero video plays', mobileVideo && !mobileVideo.paused, JSON.stringify(mobileVideo));
  check('mobile homepage has no horizontal overflow', mobileFirstPaint.overflow === 0, mobileFirstPaint.overflow);
  await mobile.locator('[data-action="mobile-nav"]').click();
  await mobile.waitForTimeout(150);
  check('mobile navigation opens', await mobile.locator('.nav-row.is-open').count() === 1);
  await mobile.screenshot({ path: join(outputDir, 'global-premium-mobile-final.png'), fullPage: false });
  await mobile.close();

  for (const path of ['/#store', '/fitment-lab', '/#account', '/#cart', '/#blog', '/#about']) {
    const page = await openPage({ width: 390, height: 844 }, path);
    check(`mobile ${path} has no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth === document.documentElement.clientWidth));
    await page.close();
  }

  const languagePage = await openPage({ width: 390, height: 844 });
  const localeCodes = ['en', 'zh-CN', 'zh-TW', 'ja', 'ko', 'de', 'fr', 'es', 'it', 'pt-BR', 'ru', 'ar', 'nl', 'tr', 'pl', 'vi', 'th', 'id', 'hi'];
  const englishFallbacks = ['Forged for your', 'Start with the car.', 'Factory production', 'About 30 business days', 'Build my exact fitment'];
  for (const locale of localeCodes) {
    await languagePage.evaluate(code => {
      localStorage.setItem('fbox-locale', code);
      localStorage.setItem('fbox-locale-mode', 'manual');
    }, locale);
    await languagePage.reload({ waitUntil: 'domcontentloaded' });
    await languagePage.waitForTimeout(180);
    const languageState = await languagePage.evaluate(() => {
      const copy = [
        document.querySelector('.premium-hero-copy')?.innerText || '',
        document.querySelector('.premium-section-copy h2')?.innerText || '',
        document.querySelector('.premium-engineering-copy h2')?.innerText || '',
        document.querySelector('.premium-delivery h2')?.innerText || ''
      ].join(' | ');
      return {
        copy,
        lang: document.documentElement.lang,
        dir: document.documentElement.dir,
        selected: document.querySelector('[data-locale]')?.value || '',
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      };
    });
    const untranslated = locale === 'en' ? [] : englishFallbacks.filter(value => languageState.copy.includes(value));
    const correctDirection = locale === 'ar' ? languageState.dir === 'rtl' : languageState.dir === 'ltr';
    check(`premium homepage localizes in ${locale}`, languageState.lang === locale && languageState.selected === locale && correctDirection && languageState.overflow === 0 && untranslated.length === 0, JSON.stringify({ ...languageState, copy: undefined, untranslated }));
  }
  await languagePage.close();

  const rangeResponse = await fetch(`${baseUrl}/assets/domestic/videos/cerui-global-hero-hd-montage-1080p30-web.mp4`, { headers: { Range: 'bytes=0-1023' } });
  check('hero video supports byte-range streaming', rangeResponse.status === 206 && Number(rangeResponse.headers.get('content-length')) === 1024, `${rangeResponse.status} ${rangeResponse.headers.get('content-range')}`);
  check('browser console and same-origin requests are clean', pageIssues.length === 0, JSON.stringify(pageIssues));
} finally {
  await browser.close();
}

const report = {
  generatedAt: new Date().toISOString(),
  url: baseUrl,
  passed: checks.filter(item => item.pass).length,
  failed: checks.filter(item => !item.pass).length,
  checks
};
writeFileSync(join(outputDir, 'functional-qa.json'), `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report, null, 2));
if (report.failed) process.exitCode = 1;
