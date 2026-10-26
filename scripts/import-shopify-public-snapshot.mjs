import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { normalizePublicCatalog, normalizePublicReviews } from '../shopify-catalog-backend.mjs';

const siteDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [catalogSource, reviewSource] = process.argv.slice(2);
if (!catalogSource || !reviewSource) throw new Error('Usage: node scripts/import-shopify-public-snapshot.mjs CATALOG_JSON REVIEWS_JSON');
const rawCatalog = JSON.parse((await fs.readFile(path.resolve(catalogSource), 'utf8')).replace(/^\uFEFF/, ''));
const rawReviews = JSON.parse((await fs.readFile(path.resolve(reviewSource), 'utf8')).replace(/^\uFEFF/, ''));
const catalog = normalizePublicCatalog(rawCatalog);
const normalized = normalizePublicReviews(rawReviews, catalog);
if (catalog.products.some(p => !p.published_at)) throw new Error('Every product must have an Online Store publication timestamp');
const reviews = {
  source: 'Judge.me', synced_at: rawReviews.synced_at,
  review_source_snapshot_date: rawReviews.review_source_snapshot_date,
  review_moderation_full_revalidated_at_sync: rawReviews.review_moderation_full_revalidated_at_sync === true,
  reviews: normalized.reviews.filter(r => r.scope === 'product'),
  store_reviews: normalized.reviews.filter(r => r.scope === 'store')
};
const dir = path.join(siteDir, 'data');
await fs.mkdir(dir, { recursive: true });
for (const [filename, content] of [['shopify-public-catalog.json', catalog], ['shopify-public-reviews.json', reviews]]) {
  const destination = path.join(dir, filename), pending = destination + '.pending';
  await fs.writeFile(pending, JSON.stringify(content) + '\n', 'utf8');
  await fs.rename(pending, destination);
  console.log(filename + ': ' + createHash('sha256').update(await fs.readFile(destination)).digest('hex'));
}
console.log(JSON.stringify({ products: catalog.products.length, collections: catalog.collections.length,
  variants: catalog.products.reduce((n, p) => n + p.variants.length, 0),
  reviews: reviews.reviews.length, store_reviews: reviews.store_reviews.length,
  moderation_revalidated: reviews.review_moderation_full_revalidated_at_sync }));
