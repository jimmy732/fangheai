import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import os from 'node:os';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repoDir = path.dirname(siteDir);
const options = Object.fromEntries(process.argv.slice(2).map(value => {
  const index = value.indexOf('=');
  return index < 0 ? [value.replace(/^--/, ''), true] : [value.slice(0, index).replace(/^--/, ''), value.slice(index + 1)];
}));
if (options.help) {
  console.log('node scripts/qa-shopify-sync.mjs --base=http://127.0.0.1:PORT [--catalog=PATH] [--reviews=PATH] [--backend=PATH] [--report=PATH]');
  console.log('Starts no server. Performs only local HTTP GETs and isolated local fixtures; no cart/order writes. Root must start the test server first.');
  process.exit(0);
}
const origin = new URL(options.base || 'http://127.0.0.1:4174');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(origin.hostname)) throw new Error('This independent QA script only accepts an explicitly local test server.');
const sourceDir = path.join(repoDir, 'outputs/official-site-sync-20261027/data-audit');
const catalogFile = path.resolve(options.catalog || path.join(sourceDir, 'shopify-public-catalog.json'));
const reviewsFile = path.resolve(options.reviews || path.join(sourceDir, 'shopify-public-reviews.json'));
const backendFile = path.resolve(options.backend || path.join(siteDir, 'shopify-catalog-backend.mjs'));
const reportFile = path.resolve(options.report || path.join(repoDir, 'outputs/official-site-sync-20261027/qa/qa-shopify-sync.json'));
const shop = 'https://shop.forcarbox.cn';
const checks = [];
const check = (name, passed, detail = {}) => checks.push({ name, passed: !!passed, detail });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sortedIds = list => [...list].map(value => String(value)).sort();
const identity = value => String(value ?? '').replace(/^gid:\/\/shopify\/(?:Product|ProductVariant|Collection|MediaImage)\//, '');
const optionDefinitions = list => (list || []).map(item => ({ name: item.name, values: item.values }));
const hash = value => createHash('sha256').update(value).digest('hex');
const jsonFile = async file => JSON.parse((await fs.readFile(file, 'utf8')).replace(/^\uFEFF/, ''));

async function request(relative) {
  const url = new URL(relative, origin);
  if (url.origin !== origin.origin) throw new Error('Cross-origin request refused by local QA.');
  const response = await fetch(url, { method: 'GET', redirect: 'manual', headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000) });
  const text = await response.text();
  let payload;
  try { payload = JSON.parse(text); } catch { payload = null; }
  return { status: response.status, headers: response.headers, text, payload };
}

function privateFields(value, location = '') {
  if (!value || typeof value !== 'object') return [];
  const found = [];
  for (const [key, item] of Object.entries(value)) {
    if (/^(?:reviewer_email|customer_email|admin_note|password|password_hash|access_token|refresh_token|client_secret|api_key|api_keys|authorization)$/i.test(key)) found.push(`${location}/${key}`);
    if (item && typeof item === 'object') found.push(...privateFields(item, `${location}/${key}`));
  }
  return found;
}

function decodedAttribute(value) {
  return String(value).replace(/&#(?:x([\da-f]+)|(\d+));?/gi, (_, hex, dec) => String.fromCodePoint(parseInt(hex || dec, hex ? 16 : 10)))
    .replace(/&colon;/gi, ':').replace(/&tab;/gi, '\t').replace(/&newline;/gi, '\n').replace(/[\u0000-\u0020\u007f]+/g, '');
}

function unsafeHtml(value) {
  const html = String(value || '');
  const findings = [];
  if (/<\s*(?:script|object|embed|svg|math|form|base|meta|link)\b/i.test(html)) findings.push('active or foreign-content tag');
  if (/<[^>]*\s(?:on[a-z]+|srcdoc)\s*=/i.test(html)) findings.push('event/srcdoc attribute');
  for (const match of html.matchAll(/\b(?:href|src|poster|xlink:href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    if (/^(?:javascript|vbscript|data):/i.test(decodedAttribute(match[1] ?? match[2] ?? match[3]))) findings.push('unsafe URL protocol');
  }
  if (/style\s*=\s*["'][^"']*(?:expression\s*\(|javascript\s*:|@import)/i.test(html)) findings.push('active inline CSS');
  for (const match of html.matchAll(/<iframe\b([^>]*)>/gi)) {
    const src = match[1].match(/\bsrc\s*=\s*["']([^"']*)["']/i)?.[1];
    if (!src) continue;
    try {
      const url = new URL(src);
      if (url.protocol !== 'https:' || !['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'youtube-nocookie.com', 'player.vimeo.com'].includes(url.hostname)) findings.push('unapproved iframe');
    } catch { findings.push('invalid iframe source'); }
  }
  return [...new Set(findings)];
}

function sourceReviews(snapshot) {
  return [
    ...(snapshot.reviews || []).map(review => ({ ...review, scope: 'product' })),
    ...(snapshot.store_reviews || []).map(review => ({ ...review, scope: 'store' }))
  ];
}

function comparableReview(review) {
  return {
    id: String(review.id), scope: review.scope, product_id: identity(review.product_id),
    title: review.title, body: review.body, reviewer_name: review.reviewer_name,
    rating: Number(review.rating), created_at: review.created_at, verified: review.verified === true,
    pictures: review.pictures || []
  };
}

async function checkBackendHelpers() {
  let backend;
  try { backend = await import(pathToFileURL(backendFile).href); }
  catch (error) { check('Backend pure helper module available', false, { file: backendFile, error: error.message }); return; }
  const sanitize = backend.sanitizeShopifyHtml || backend.sanitizeProductHtml || backend.sanitizeHtml;
  check('Backend exposes actual product HTML sanitizer', typeof sanitize === 'function');
  if (typeof sanitize === 'function') {
    const attacks = [
      '<p>KEEP_SAFE_TEXT</p><script>alert(1)</script>',
      '<img src="https://cdn.shopify.com/test.png" onerror="alert(1)"><p>KEEP_SAFE_TEXT</p>',
      '<svg/onload=alert(1)><p>KEEP_SAFE_TEXT</p>',
      '<a href="jav&#x61;script:alert(1)">KEEP_SAFE_TEXT</a>',
      '<a href="data:text/html;base64,PHNjcmlwdD4=">KEEP_SAFE_TEXT</a>',
      '<iframe src="https://evil.example/" srcdoc="<script>alert(1)</script>"></iframe><p>KEEP_SAFE_TEXT</p>',
      '<div style="background:url(javascript:alert(1))" onclick="alert(1)">KEEP_SAFE_TEXT</div>',
      '<math><mtext><img src=x onerror=alert(1)></mtext></math><p>KEEP_SAFE_TEXT</p>',
      '<a href="https://shop.forcarbox.cn/products/safe">KEEP_SAFE_TEXT</a>'
    ];
    for (let index = 0; index < attacks.length; index++) {
      const output = await sanitize(attacks[index]);
      check(`XSS fixture ${index + 1}`, typeof output === 'string' && output.includes('KEEP_SAFE_TEXT') && unsafeHtml(output).length === 0, { findings: unsafeHtml(output) });
    }
  }
  if (typeof backend.normalizePublicReviews === 'function' && typeof backend.normalizePublicCatalog === 'function') {
    const product = { id: '11', handle: 'qa-wheel', title: 'QA wheel', description_html: '<p>KEEP_SAFE_TEXT</p>', images: [], options: [{ name: 'Finish', values: ['Silver'] }], variants: [{ id: '111', title: 'Silver', sku: 'QA', price: '100.00', options: ['Silver'], available: true }] };
    const catalog = backend.normalizePublicCatalog({ currency: 'USD', synced_at: 'fixture-good-1', products: [product], collections: [] });
    const review = { id: 'fixture-approved', product_id: '11', rating: 5, title: 'Fixture', body: 'Only local test data', reviewer_name: 'Customer', created_at: '2026-01-01T00:00:00.000Z', pictures: [], verified: false, status: 'approved' };
    const rejected = backend.normalizePublicReviews({ reviews: [review, { ...review, id: 'fixture-pending', status: 'pending' }, { ...review, id: 'fixture-hidden', status: 'hidden' }, { ...review, id: 'fixture-test', source: 'test' }], store_reviews: [] }, catalog);
    check('Explicit pending/hidden/test review fixtures cannot publish', same(rejected.reviews.map(item => item.id), ['fixture-approved']), { returnedIDs: rejected.reviews.map(item => item.id) });
  }
  if (typeof backend.createSnapshotStore === 'function') {
    const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'forcarbox-sync-qa-'));
    const catalogPath = path.join(directory, 'catalog.json');
    const reviewsPath = path.join(directory, 'reviews.json');
    const product = { id: '11', handle: 'qa-wheel', title: 'Isolated local fixture', images: [], options: [{ name: 'Finish', values: ['Silver'] }], variants: [{ id: '111', title: 'Silver', sku: 'QA', price: '100.00', options: ['Silver'], available: true }] };
    const catalog = { currency: 'USD', synced_at: 'fixture-good-1', products: [product], collections: [{ id: '21', handle: 'qa-collection', title: 'Local QA', product_ids: ['11'] }] };
    const reviews = { synced_at: 'fixture-reviews-1', reviews: [], store_reviews: [] };
    try {
      await Promise.all([fs.writeFile(catalogPath, JSON.stringify(catalog)), fs.writeFile(reviewsPath, JSON.stringify(reviews))]);
      const store = backend.createSnapshotStore({ catalogPath, reviewsPath, checkIntervalMs: 0 });
      const good = await store.get({ force: true });
      check('Initial good fixture loads without stale flag', good.stale === false && good.catalog.products[0].variants[0].price === '100.00');
      await fs.writeFile(catalogPath, '{');
      const bad = await store.get({ force: true });
      check('Malformed catalog preserves exact last-good data', bad.stale === true && same(bad.catalog, good.catalog) && same(bad.reviews, good.reviews));
      const recovered = structuredClone(catalog);
      recovered.synced_at = 'fixture-recovered-after-corruption';
      recovered.products[0].variants[0].price = '123.45';
      await fs.writeFile(catalogPath, JSON.stringify(recovered));
      const next = await store.get({ force: true });
      check('Valid recovery clears stale and loads changed price', next.stale === false && next.catalog.synced_at === recovered.synced_at && next.catalog.products[0].variants[0].price === '123.45');
      await fs.writeFile(reviewsPath, '{');
      const badReviews = await store.get({ force: true });
      check('Malformed reviews preserve whole last-good snapshot', badReviews.stale === true && same(badReviews.catalog, next.catalog) && same(badReviews.reviews, next.reviews));
      const cold = backend.createSnapshotStore({ catalogPath, reviewsPath, checkIntervalMs: 0 });
      let coldRejected = false;
      try { await cold.get({ force: true }); } catch { coldRejected = true; }
      check('Cold invalid snapshot rejects rather than inventing catalog', coldRejected);
    } finally {
      const target = path.resolve(directory);
      if (path.dirname(target) !== path.resolve(os.tmpdir()) || !path.basename(target).startsWith('forcarbox-sync-qa-')) throw new Error('Refusing to clean a fixture outside the verified temporary directory.');
      await fs.rm(target, { recursive: true, force: true });
    }
  } else {
    check('Last-good snapshot retention independently exercised', false, { reason: 'Await root-provided configurable snapshot loader; do not alter the real catalog to inject bad data.' });
  }
}

async function main() {
  const expected = await jsonFile(catalogFile);
  const expectedReviews = await jsonFile(reviewsFile);
  const ui = await import(pathToFileURL(path.join(siteDir, 'shopify-catalog-ui.js')).href);
  const publicIds = new Set(expected.products.map(item => identity(item.id)));
  const expectedVariantCount = expected.products.reduce((sum, item) => sum + item.variants.length, 0);
  check('Authoritative export unique public product IDs', publicIds.size === expected.products.length, { products: expected.products.length, variants: expectedVariantCount, collections: expected.collections.length });
  check('Curated source reviews have 28 product / 68 store scope', expectedReviews.reviews.length === 28 && expectedReviews.store_reviews.length === 68);
  check('Current review moderation was fully revalidated', expectedReviews.review_moderation_full_revalidated_at_sync === true);

  const index = await request('/api/shopify/catalog');
  check('Catalog public GET responds safely', index.status === 200 && index.payload?.data && /json/i.test(index.headers.get('content-type') || ''), { status: index.status });
  if (index.status !== 200 || !index.payload?.data) throw new Error('Catalog HTTP contract is not ready. Start only the root-authorized local server and rerun.');
  const actual = index.payload.data;
  check('Public product ID set exactly matches approved export', same(sortedIds((actual.products || []).map(item => identity(item.id))), sortedIds(publicIds)));
  check('Collection count matches approved export', actual.collections?.length === expected.collections.length, { expected: expected.collections.length, actual: actual.collections?.length });
  check('No private fields in catalog response', privateFields(index.payload).length === 0, { fields: privateFields(index.payload) });
  for (const source of expected.products) {
    const summary = actual.products?.find(item => identity(item.id) === identity(source.id));
    const prices = source.variants.map(item => Number(item.price));
    check(`Catalog price/availability ${source.handle}`, !!summary
      && summary.available === source.available
      && Number(summary.variant_count) === source.variants.length
      && Number(summary.price_min) === Math.min(...prices)
      && Number(summary.price_max) === Math.max(...prices));
  }
  for (const source of expected.collections) {
    const collection = actual.collections?.find(item => identity(item.id) === identity(source.id));
    check(`Collection membership ${source.handle}`, !!collection && collection.handle === source.handle && same(sortedIds(collection.product_ids || []), sortedIds(source.product_ids || [])) && (collection.product_ids || []).every(id => publicIds.has(identity(id))));
  }

  let cursor = 0;
  let variantsCompared = 0;
  let exactOptionsResolved = 0;
  let checkoutLinksMatched = 0;
  const mismatches = [];
  const details = [];
  const worker = async () => {
    while (cursor < expected.products.length) {
      const source = expected.products[cursor++];
      const result = await request(`/api/shopify/products/${encodeURIComponent(source.handle)}`);
      const product = result.payload?.data;
      if (result.status !== 200 || !product || !Array.isArray(product.variants)) { mismatches.push({ handle: source.handle, field: 'detail response', status: result.status }); continue; }
      details.push(product);
      if (identity(product.id) !== identity(source.id) || product.handle !== source.handle || product.title !== source.title) mismatches.push({ handle: source.handle, field: 'identity/title' });
      if (!same(optionDefinitions(product.options), optionDefinitions(source.options))) mismatches.push({ handle: source.handle, field: 'option definitions' });
      if (!same((product.images || []).map(item => item.url), (source.images || []).map(item => item.url))) mismatches.push({ handle: source.handle, field: 'ordered image gallery' });
      if ((source.images || []).some((image, index) => image.alt && product.images?.[index]?.alt !== image.alt)) mismatches.push({ handle: source.handle, field: 'source image alt/visualization disclosure' });
      if (!same(sortedIds(product.variants.map(item => identity(item.id))), sortedIds(source.variants.map(item => identity(item.id))))) mismatches.push({ handle: source.handle, field: 'variant ID set' });
      if (privateFields(product).length) mismatches.push({ handle: source.handle, field: 'private fields' });
      if (unsafeHtml(product.description_html).length) mismatches.push({ handle: source.handle, field: 'unsafe product HTML', findings: unsafeHtml(product.description_html) });
      const actualById = new Map(product.variants.map(variant => [identity(variant.id), variant]));
      for (const sourceVariant of source.variants) {
        variantsCompared++;
        const variant = actualById.get(identity(sourceVariant.id));
        if (!variant || !same(variant.options, sourceVariant.options) || Number(variant.price) !== Number(sourceVariant.price) || variant.available !== sourceVariant.available || String(variant.sku ?? '') !== String(sourceVariant.sku ?? '') || identity(variant.image_id) !== identity(sourceVariant.image_id)) {
          mismatches.push({ handle: source.handle, variant: identity(sourceVariant.id), field: 'options/price/available/SKU/image ID' });
          continue;
        }
        const resolved = ui.resolveVariant(product, sourceVariant.options);
        if (identity(resolved?.id) === identity(sourceVariant.id)) exactOptionsResolved++;
        else mismatches.push({ handle: source.handle, variant: identity(sourceVariant.id), field: 'UI exact option resolution' });
        const links = ui.buildShopifyLinks(product, variant, 1);
        const id = identity(sourceVariant.id);
        if (links.product === `${shop}/products/${encodeURIComponent(source.handle)}?variant=${id}` && links.checkout === (variant.available ? `${shop}/cart/${id}:1` : '')) checkoutLinksMatched++;
        else mismatches.push({ handle: source.handle, variant: id, field: 'exact Shopify purchase URL' });
      }
      if (ui.resolveVariant(product, product.options.map(() => '__NO_SUCH_OPTION_VALUE__')) !== null) mismatches.push({ handle: source.handle, field: 'invalid combination resolves to another variant' });
    }
  };
  await Promise.all(Array.from({ length: 4 }, worker));
  check('All detail responses and every variant match export', mismatches.length === 0 && variantsCompared === expectedVariantCount, { expectedVariants: expectedVariantCount, variantsCompared, mismatchCount: mismatches.length, mismatches: mismatches.slice(0, 30) });
  check('Every option combination resolves the exact variant', exactOptionsResolved === expectedVariantCount, { exactOptionsResolved, expectedVariantCount });
  check('Every buy URL uses correct Shopify variant and quantity one', checkoutLinksMatched === expectedVariantCount, { checkoutLinksMatched, expectedVariantCount });

  const fiveFinish = details.find(item => identity(item.id) === '15450334232619');
  const sourceFive = expected.products.find(item => identity(item.id) === '15450334232619');
  const finish = fiveFinish?.options?.find(item => /finish/i.test(item.name));
  check('New Corvette has actual five finishes and twenty variants', !!fiveFinish && finish?.values?.length === 5 && fiveFinish.variants.length === 20 && same(optionDefinitions(fiveFinish.options), optionDefinitions(sourceFive?.options)), { finishCount: finish?.values?.length, variantCount: fiveFinish?.variants?.length });
  for (const unsafe of [0, -1, '1.5', 'javascript:alert(1)', 'gid://shopify/Product/123', Number.MAX_SAFE_INTEGER + 1]) check(`Invalid variant ID blocked (${typeof unsafe}:${String(unsafe).slice(0, 30)})`, ui.numericVariantId(unsafe) === '');
  const sample = details.find(item => item.variants?.some(variant => variant.available));
  if (sample) {
    const variant = sample.variants.find(item => item.available);
    const unavailableProduct = { ...sample, variants: sample.variants.map(item => item.id === variant.id ? { ...item, available: false } : item) };
    check('Unavailable configuration has no checkout', ui.buildShopifyLinks(unavailableProduct, { ...variant, available: false }, 1).checkout === '');
    check('Foreign variant cannot check out on another product', ui.buildShopifyLinks(sample, { id: '1', available: true }, 1).checkout === '');
    for (const quantity of [0, -1, 1.5, NaN]) check(`Invalid quantity blocked (${quantity})`, ui.buildShopifyLinks(sample, variant, quantity).checkout === '');
    check('Checkout validation endpoint caps quantity at 99', ui.checkoutValidationUrl(sample, variant, 100) === '');
    check('UI sends exact product and variant to validation endpoint', ui.checkoutValidationUrl(sample, variant, 1) === `/api/shopify/checkout?product=${encodeURIComponent(sample.handle)}&variant=${identity(variant.id)}&quantity=1`);
    const redirected = await request(ui.checkoutValidationUrl(sample, variant, 1));
    check('Checkout GET returns exact Shopify 302 without following', redirected.status === 302 && redirected.headers.get('location') === `${shop}/cart/${identity(variant.id)}:1?checkout`, { status: redirected.status, location: redirected.headers.get('location') });
    const invalidCheckout = await request(`/api/shopify/checkout?product=${encodeURIComponent(sample.handle)}&variant=1&quantity=1`);
    check('Backend rejects foreign variant without redirect', invalidCheckout.status === 400 && !invalidCheckout.headers.get('location'));
    for (const quantity of ['0', '1.5', '100']) {
      const invalid = await request(`/api/shopify/checkout?product=${encodeURIComponent(sample.handle)}&variant=${identity(variant.id)}&quantity=${quantity}`);
      check(`Backend rejects invalid quantity ${quantity}`, invalid.status === 400 && !invalid.headers.get('location'));
    }
  }
  if (fiveFinish) {
    const responses = await Promise.all(fiveFinish.variants.map(variant => request(ui.checkoutValidationUrl(fiveFinish, variant, 1))));
    check('All twenty new Corvette options redirect to their exact variant', responses.every((response, index) => response.status === 302 && response.headers.get('location') === `${shop}/cart/${identity(fiveFinish.variants[index].id)}:1?checkout`));
  }

  const reviewResponse = await request('/api/shopify/reviews');
  const reviews = reviewResponse.payload?.data;
  const sourceReviewList = sourceReviews(expectedReviews);
  check('Public review response exactly contains approved source IDs', reviewResponse.status === 200 && Array.isArray(reviews) && same(sortedIds(reviews.map(item => item.id)), sortedIds(sourceReviewList.map(item => item.id))), { expected: sourceReviewList.length, actual: reviews?.length });
  check('Public review response exposes current moderation metadata', reviewResponse.payload?.meta?.moderation_revalidated === true);
  if (Array.isArray(reviews)) {
    const expectedById = new Map(sourceReviewList.map(review => [String(review.id), comparableReview(review)]));
    const bad = reviews.filter(review => !same(comparableReview(review), expectedById.get(String(review.id))));
    check('Review bodies/dates/verification/pictures/scopes preserved', bad.length === 0, { mismatchIDs: bad.map(item => item.id) });
    check('Review response has no private fields or moderation leakage', privateFields(reviews).length === 0 && reviews.every(item => !item.status || ['approved', 'published'].includes(item.status)), { privateFields: privateFields(reviews) });
    check('Product reviews bind only to public product IDs', reviews.every(item => item.scope !== 'product' || publicIds.has(identity(item.product_id))));
    check('Store reviews never appear as exact product reviews', expected.products.every(product => ui.exactProductReviews(reviews, product.id).every(review => review.scope === 'product' && identity(review.product_id) === identity(product.id))));
  }
  const missing = await request('/api/shopify/products/__qa_unknown_product__');
  check('Unknown product safely returns 404 without fallback product', missing.status === 404 && !missing.payload?.data?.variants);
  const home = await request('/');
  check('Homepage does not load legacy direct PayPal override', home.status === 200 && !/\bsrc\s*=\s*["'][^"']*paypal-product-direct\.js/i.test(home.text));
  const uiSource = await fs.readFile(path.join(siteDir, 'shopify-catalog-ui.js'), 'utf8');
  check('New Shopify UI has no direct PayPal host or SDK', !/(?:paypal\.com|paypalobjects\.com|window\.paypal|HostedButtons)/i.test(uiSource));
  await checkBackendHelpers();
  return { expectedProducts: expected.products.length, expectedVariants: expectedVariantCount, expectedCollections: expected.collections.length, expectedReviews: sourceReviewList.length };
}

let counts;
try { counts = await main(); }
catch (error) { check('QA completed without execution error', false, { error: error.message }); }
const result = {
  generated_at: new Date().toISOString(), origin: origin.origin, readOnlyHttp: true,
  sourceCatalog: catalogFile, sourceReviews: reviewsFile,
  sourceHashes: {}, testedFileHashes: {}, ...counts,
  passed: checks.length > 0 && checks.every(item => item.passed),
  passedChecks: checks.filter(item => item.passed).length, failedChecks: checks.filter(item => !item.passed).length, checks
};
for (const [name, file] of [['catalog', catalogFile], ['reviews', reviewsFile]]) {
  try { result.sourceHashes[name] = hash(await fs.readFile(file)); } catch {}
}
for (const file of [fileURLToPath(import.meta.url), path.join(siteDir, 'shopify-catalog-ui.js'), backendFile]) {
  try { result.testedFileHashes[file] = hash(await fs.readFile(file)); } catch {}
}
await fs.mkdir(path.dirname(reportFile), { recursive: true });
await fs.writeFile(reportFile, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify({ passed: result.passed, passedChecks: result.passedChecks, failedChecks: result.failedChecks, report: reportFile, failures: checks.filter(item => !item.passed) }, null, 2));
process.exitCode = result.passed ? 0 : 1;
