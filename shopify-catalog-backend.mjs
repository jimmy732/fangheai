import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import xss from 'xss';

const root = path.dirname(fileURLToPath(import.meta.url));
export const SHOPIFY_ORIGIN = 'https://shop.forcarbox.cn';
const customerPaymentOnlyIds = new Set(['15424655458347', '15426073886763', '15431334068267']);
const numericId = value => String(value || '').replace(/^gid:\/\/shopify\/[^/]+\//, '');
const handlePattern = /^[\p{L}\p{N}][\p{L}\p{N}-]*$/u;
const text = value => String(value ?? '').trim();

function safeUrl(value, base = SHOPIFY_ORIGIN) {
  if (!text(value)) return '';
  try {
    const url = new URL(text(value), base);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

const htmlAllowlist = Object.fromEntries([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'small', 'span', 'div', 'section',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'hr',
  'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'figure', 'figcaption', 'details', 'summary'
].map(tag => [tag, []]));
Object.assign(htmlAllowlist, {
  a: ['href', 'title'], img: ['src', 'alt', 'width', 'height', 'loading'],
  video: ['src', 'poster', 'controls', 'preload', 'playsinline'], source: ['src', 'type'],
  iframe: ['src', 'title', 'width', 'height', 'loading', 'allowfullscreen'],
  td: ['colspan', 'rowspan'], th: ['colspan', 'rowspan', 'scope'], ol: ['start'], details: ['open']
});
const escapeAttribute = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const htmlFilter = new xss.FilterXSS({
  whiteList: htmlAllowlist,
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'textarea', 'noscript', 'template', 'title', 'svg', 'math', 'object', 'embed'],
  onTagAttr(tag, name, value, allowed) {
    if (!allowed) return;
    if (tag === 'a' && name === 'href') {
      const href = /^(mailto:|tel:)/i.test(value) ? value : safeUrl(value);
      return href ? 'href="' + escapeAttribute(href) + '" target="_blank" rel="noopener noreferrer"' : '';
    }
    if (['src', 'poster'].includes(name)) {
      const url = safeUrl(value);
      if (!url) return '';
      if (tag === 'iframe' && !['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com'].includes(new URL(url).hostname)) return '';
      return name + '="' + escapeAttribute(url) + '"';
    }
    if (['width', 'height', 'rowspan', 'colspan', 'start'].includes(name) && !/^\d{1,5}$/.test(value)) return '';
    if (name === 'type' && !/^video\/(mp4|webm)$/.test(value)) return '';
    if (name === 'loading') return 'loading="lazy"';
    if (name === 'preload') return 'preload="none"';
  }
});

export function sanitizeProductHtml(value = '') {
  return htmlFilter.process(String(value));
}

export function normalizePublicCatalog(raw) {
  if (!Array.isArray(raw?.products) || !raw.products.length || !Array.isArray(raw.collections)) throw new Error('Invalid catalog snapshot');
  const ids = new Set(), handles = new Set(), variantIds = new Set();
  const products = raw.products.filter(p => !customerPaymentOnlyIds.has(numericId(p.id))).map(p => {
    const id = numericId(p.id), handle = text(p.handle);
    if (!/^\d+$/.test(id) || !handlePattern.test(handle) || ids.has(id) || handles.has(handle)) throw new Error('Invalid product identity');
    ids.add(id); handles.add(handle);
    if (!Array.isArray(p.variants) || !p.variants.length) throw new Error('Product variants missing');
    const images = (p.images || []).map(i => ({ id: numericId(i.id), url: safeUrl(i.url), alt: text(i.alt),
      width: Number(i.width) || null, height: Number(i.height) || null,
      variant_ids: (i.variant_ids || []).map(numericId).filter(x => /^\d+$/.test(x))
    })).filter(i => i.url);
    const variants = p.variants.map(v => {
      const variantId = numericId(v.id), price = Number(v.price);
      if (!/^\d+$/.test(variantId) || variantIds.has(variantId) || !Number.isFinite(price) || price < 0) throw new Error('Invalid variant');
      variantIds.add(variantId);
      const compare = v.compare_at_price === null || v.compare_at_price === undefined ? null : Number(v.compare_at_price);
      return { id: variantId, title: text(v.title), sku: text(v.sku), price: price.toFixed(2),
        compare_at_price: Number.isFinite(compare) && compare >= 0 ? compare.toFixed(2) : null,
        available: v.available === true, options: (v.options || []).map(text), image_id: numericId(v.image_id) || null };
    });
    return { id, handle, title: text(p.title), description_html: sanitizeProductHtml(p.description_html),
      vendor: text(p.vendor), product_type: text(p.product_type),
      tags: (p.tags || []).map(text).filter(t => !/^current project\b/i.test(t)),
      images, videos: (p.videos || []).map(v => ({ ...v, url: safeUrl(v.url) })).filter(v => v.url),
      options: (p.options || []).map((o, index) => ({ name: text(o.name), position: Number(o.position) || index + 1, values: (o.values || []).map(text) })),
      variants, available: variants.some(v => v.available),
      price_min: Math.min(...variants.map(v => Number(v.price))).toFixed(2),
      price_max: Math.max(...variants.map(v => Number(v.price))).toFixed(2),
      variant_count: variants.length, published_at: text(p.published_at), updated_at: text(p.updated_at),
      shopify_url: SHOPIFY_ORIGIN + '/products/' + encodeURIComponent(handle) };
  });
  const collections = raw.collections.map(c => {
    const id = numericId(c.id), handle = text(c.handle);
    if (!/^\d+$/.test(id) || !handlePattern.test(handle)) throw new Error('Invalid collection identity');
    const product_ids = [...new Set((c.product_ids || []).map(numericId))].filter(id => ids.has(id));
    return { id, handle, title: text(c.title), description_html: sanitizeProductHtml(c.description_html),
      image_url: safeUrl(c.image_url), product_ids, product_count: product_ids.length };
  });
  for (const product of products) product.collection_ids = collections.filter(c => c.product_ids.includes(product.id)).map(c => c.id);
  return { source: SHOPIFY_ORIGIN, currency: text(raw.currency || 'USD'), synced_at: text(raw.synced_at), products, collections };
}

export function normalizePublicReviews(raw, catalog) {
  const ids = new Set(catalog.products.map(p => p.id)), seen = new Set();
  const normalize = (review, scope) => {
    if (review.source && !/^judge\.me$/i.test(text(review.source))) return null;
    if (review.status && !['approved', 'published'].includes(text(review.status).toLowerCase())) return null;
    if (review.hidden === true || review.published === false) return null;
    const id = text(review.id), product_id = numericId(review.product_id), rating = Number(review.rating);
    if (!id || seen.has(id) || !Number.isInteger(rating) || rating < 1 || rating > 5 || (scope === 'product' && !ids.has(product_id))) return null;
    seen.add(id);
    let name = text(review.reviewer_name);
    if (!name || /^(verified (buyer|customer)|customer)\s*#?\d+/i.test(name) || /@/.test(name)) name = 'Customer';
    return { id, product_id: scope === 'product' ? product_id : null, scope, rating, title: text(review.title),
      body: text(review.body), reviewer_name: name, created_at: text(review.created_at),
      pictures: (review.pictures || []).map(p => safeUrl(typeof p === 'string' ? p : p?.url)).filter(Boolean),
      verified: review.verified === true, source: 'Judge.me',
      source_url: safeUrl(review.source_url) || SHOPIFY_ORIGIN };
  };
  return {
    source: 'Judge.me', synced_at: text(raw?.synced_at),
    review_source_snapshot_date: text(raw?.review_source_snapshot_date),
    moderation_revalidated: raw?.review_moderation_full_revalidated_at_sync === true,
    reviews: [
      ...(raw?.reviews || []).map(r => normalize(r, 'product')),
      ...(raw?.store_reviews || []).map(r => normalize(r, 'store'))
    ].filter(Boolean)
  };
}

export function buildShopifyCheckoutUrl(product, variantId, quantity = '1') {
  const id = text(variantId), q = text(quantity);
  if (!/^\d+$/.test(id) || !/^[1-9]\d?$/.test(q)) throw new Error('Choose a valid quantity from 1 to 99');
  const variant = product?.variants?.find(v => v.id === id);
  if (!variant || !variant.available) throw new Error('Select an available product option');
  return SHOPIFY_ORIGIN + '/cart/' + id + ':' + q;
}

export function createSnapshotStore({
  catalogPath = path.join(root, 'data', 'shopify-public-catalog.json'),
  reviewsPath = path.join(root, 'data', 'shopify-public-reviews.json'),
  checkIntervalMs = 5000
} = {}) {
  let lastGood = null, stamp = '', checkedAt = 0, pending = null;
  return {
    async get({ force = false } = {}) {
      if (!force && lastGood && Date.now() - checkedAt < checkIntervalMs) return lastGood;
      if (pending) return pending;
      pending = (async () => {
        checkedAt = Date.now();
        try {
          const stats = await Promise.all([fs.stat(catalogPath), fs.stat(reviewsPath)]);
          const nextStamp = stats.map(s => s.mtimeMs + ':' + s.size).join('|');
          if (lastGood && nextStamp === stamp) return lastGood;
          const [catalogRaw, reviewsRaw] = await Promise.all([fs.readFile(catalogPath, 'utf8'), fs.readFile(reviewsPath, 'utf8')]);
          const catalog = normalizePublicCatalog(JSON.parse(catalogRaw.replace(/^\uFEFF/, '')));
          const reviews = normalizePublicReviews(JSON.parse(reviewsRaw.replace(/^\uFEFF/, '')), catalog);
          const summary = { ...catalog, products: catalog.products.map(({ variants, description_html, videos, ...product }) => ({ ...product, images: product.images.slice(0, 2) })) };
          lastGood = { catalog, summary, reviews, stale: false };
          stamp = nextStamp;
          return lastGood;
        } catch (error) {
          if (!lastGood) throw error;
          lastGood = { ...lastGood, stale: true };
          return lastGood;
        }
      })();
      try { return await pending; } finally { pending = null; }
    }
  };
}

const snapshots = createSnapshotStore();
function sendJson(req, res, status, payload) {
  const body = Buffer.from(JSON.stringify(payload));
  const etag = '"' + createHash('sha256').update(body).digest('hex').slice(0, 24) + '"';
  const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'public, max-age=60, must-revalidate',
    'X-Content-Type-Options': 'nosniff', ETag: etag, Vary: 'Accept-Encoding' };
  if (req.headers['if-none-match'] === etag && status === 200) { res.writeHead(304, headers); return res.end(); }
  const zipped = /\bgzip\b/.test(req.headers['accept-encoding'] || '') && body.length > 1024;
  const bytes = zipped ? gzipSync(body) : body;
  if (zipped) headers['Content-Encoding'] = 'gzip';
  headers['Content-Length'] = bytes.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : bytes);
}

export async function handleShopifyCatalogApi(req, res, url) {
  if (!['GET', 'HEAD'].includes(req.method)) return sendJson(req, res, 405, { detail: 'Read-only catalog endpoint' });
  try {
    const state = await snapshots.get();
    const meta = { source: SHOPIFY_ORIGIN, synced_at: state.catalog.synced_at, snapshot_stale: state.stale,
      availability_note: 'Availability, delivery, tax and payment options are confirmed in Shopify checkout.' };
    if (url.pathname === '/api/shopify/catalog') return sendJson(req, res, 200, { data: state.summary, meta });
    if (url.pathname === '/api/shopify/reviews') {
      const productId = numericId(url.searchParams.get('product_id'));
      const data = productId ? state.reviews.reviews.filter(r => r.scope === 'product' && r.product_id === productId) : state.reviews.reviews;
      return sendJson(req, res, 200, { data, meta: { ...meta, review_source_snapshot_date: state.reviews.review_source_snapshot_date,
        moderation_revalidated: state.reviews.moderation_revalidated, source: 'Judge.me' } });
    }
    if (url.pathname === '/api/shopify/checkout') {
      const handle = text(url.searchParams.get('product'));
      const product = state.catalog.products.find(p => p.handle === handle);
      if (!product) return sendJson(req, res, 404, { detail: 'Product not found' });
      let location;
      try { location = buildShopifyCheckoutUrl(product, url.searchParams.get('variant'), url.searchParams.get('quantity') || '1'); }
      catch (error) { return sendJson(req, res, 400, { detail: error.message }); }
      res.writeHead(302, { Location: location, 'Cache-Control': 'no-store', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
      return res.end();
    }
    const match = url.pathname.match(/^\/api\/shopify\/products\/([^/]+)$/);
    if (match) {
      let handle;
      try { handle = decodeURIComponent(match[1]); } catch { return sendJson(req, res, 404, { detail: 'Product not found' }); }
      const product = state.catalog.products.find(p => p.handle === handle);
      return sendJson(req, res, product ? 200 : 404, product ? { data: product, meta } : { detail: 'Product not found' });
    }
    return sendJson(req, res, 404, { detail: 'Catalog route not found' });
  } catch {
    return sendJson(req, res, 503, { detail: 'Catalog is temporarily unavailable. Please visit our Shopify store.', shopify_url: SHOPIFY_ORIGIN + '/collections/all' });
  }
}
