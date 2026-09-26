import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const seedPath = path.join(siteDir, 'data', 'fbox-store.seed.json');
const outputPath = path.join(siteDir, 'data', 'shopify-catalog-prices.json');
const appPath = path.join(siteDir, 'app.js');
const source = 'https://shop.forcarbox.cn';

const seedSource = await fs.readFile(seedPath, 'utf8');
const seed = JSON.parse(seedSource);
const publicWheels = seed.products.filter(item => item.category === 'Wheels' && item.public_scope !== false && item.status === 'published');
const expectedSkus = new Set(publicWheels.map(item => String(item.part || '').trim().toUpperCase()));
if (expectedSkus.size !== publicWheels.length) throw new Error('Public wheel SKUs must be unique and nonempty.');

const listings = [];
for (let page = 1; page <= 20; page += 1) {
  const response = await fetch(`${source}/products.json?limit=250&page=${page}`, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(`Shopify catalog returned HTTP ${response.status}.`);
  const payload = await response.json();
  const products = Array.isArray(payload?.products) ? payload.products : [];
  listings.push(...products);
  if (products.length < 250) break;
}

const bySku = new Map();
for (const listing of listings) {
  for (const variant of listing.variants || []) {
    const sku = String(variant.sku || '').trim().toUpperCase();
    if (!expectedSkus.has(sku)) continue;
    const price = Number(variant.price);
    if (!Number.isFinite(price) || price <= 0) throw new Error(`Invalid Shopify price for ${sku}.`);
    const cents = Math.round(price * 100);
    const previous = bySku.get(sku);
    if (previous && previous.price_cents !== cents) throw new Error(`Conflicting Shopify prices for ${sku}.`);
    bySku.set(sku, { price_cents: cents, handle: listing.handle, title: listing.title });
  }
}

const missing = [...expectedSkus].filter(sku => !bySku.has(sku));
if (missing.length) throw new Error(`Missing Shopify prices for: ${missing.join(', ')}`);

const snapshot = {
  source,
  currency: 'USD',
  synced_at: new Date().toISOString(),
  products: Object.fromEntries([...bySku].sort(([a], [b]) => a.localeCompare(b)))
};
let appSource = await fs.readFile(appPath, 'utf8');
for (const wheel of publicWheels.filter(item => item.id.startsWith('fbox-'))) {
  const line = appSource.split(/\r?\n/).find(value => value.includes(`{ id: '${wheel.id}',`));
  if (!line || !/price: [\d.]+,/.test(line) || !/price_mode: '(from|fixed)'/.test(line)) {
    throw new Error(`Cannot locate the storefront fallback for ${wheel.id}.`);
  }
  const updated = line.replace(/price: [\d.]+,/, `price: ${bySku.get(String(wheel.part).trim().toUpperCase()).price_cents / 100},`).replace(/price_mode: '(from|fixed)'/, "price_mode: 'fixed'");
  appSource = appSource.replace(line, updated);
}
for (const wheel of publicWheels) {
  wheel.price = bySku.get(String(wheel.part).trim().toUpperCase()).price_cents / 100;
  wheel.oldPrice = null;
  wheel.price_mode = 'fixed';
}
const newline = seedSource.includes('\r\n') ? '\r\n' : '\n';
await fs.writeFile(seedPath, `${JSON.stringify(seed, null, 2).replaceAll('\n', newline)}${newline}`, 'utf8');
await fs.writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
await fs.writeFile(appPath, appSource, 'utf8');
console.log(`Saved ${bySku.size} Shopify prices to the snapshot, seed catalog and storefront fallback.`);
