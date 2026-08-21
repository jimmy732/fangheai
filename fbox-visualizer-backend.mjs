import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.resolve(process.env.FBOX_RUNTIME_DIR || path.join(moduleDir, '..', 'local-mall-dev', '.runtime'));
const configPath = path.join(runtimeDir, 'fbox-visualizer-config.json');
const defaultEndpoint = 'https://api.lk888.ai/v1';
const defaultModel = 'gpt-image-2';
const defaultChatModel = 'gpt-5.5';
const defaultPayPalMode = 'sandbox';
const defaultStorefrontSettings = {
  company_name: 'Fanghe Overseas Intelligent Technology Co., Ltd.',
  phone: '+86 14726178447',
  domain: 'forcarbox.cn',
  support_email: '',
  default_locale: 'en',
  language_auto_detect: true,
  preview_sponsored: true
};
const jobs = new Map();
const jobTtlMs = 60 * 60 * 1000;
const operationsPath = path.join(runtimeDir, 'fbox-operations.json');
const seedOperationsPath = path.join(moduleDir, 'data', 'fbox-operations.seed.json');
const seedReviewsPath = path.join(moduleDir, 'data', 'fbox-reviews-imported.json');
const storePath = path.join(runtimeDir, 'fbox-store.json');
const seedStorePath = path.join(moduleDir, 'data', 'fbox-store.seed.json');
const mediaDir = path.join(runtimeDir, 'fbox-media');
const adminSessions = new Map();
const adminSessionsPath = path.join(runtimeDir, 'fbox-admin-sessions.json');
const adminSessionTtlMs = 12 * 60 * 60 * 1000;
let adminSessionsLoaded = false;
let adminSessionsLoading = null;
let adminSessionsWriteQueue = Promise.resolve();
const customerSessions = new Map();
const customerSessionTtlMs = 30 * 24 * 60 * 60 * 1000;
const customerSessionsPath = path.join(runtimeDir, 'fbox-customer-sessions.json');
let customerSessionsLoaded = false;
let customerSessionsWriteQueue = Promise.resolve();

// ---------------------------------------------------------------------------
// Storefront analytics: privacy-conscious, first-party event log. Every event
// carries the country derived from the client IP plus coarse region/city when
// the (free, key-less) ipwho.is lookup succeeds. Raw IPs are kept only in the
// runtime file (outside the repo) so the owner can follow up with leads.
// ---------------------------------------------------------------------------
const analyticsPath = path.join(runtimeDir, 'fbox-analytics.json');
const analyticsMaxEvents = 50_000;
let analyticsCache = null;
let analyticsWriteQueue = Promise.resolve();
const geoCache = new Map();
const analyticsBotPattern = /bot|crawler|spider|wget|python-requests|headless|lighthouse|pingdom/i;

const analyticsCountryNames = {
  US: 'United States', CA: 'Canada', MX: 'Mexico', BR: 'Brazil', AR: 'Argentina', CL: 'Chile', CO: 'Colombia', PE: 'Peru',
  GB: 'United Kingdom', IE: 'Ireland', FR: 'France', DE: 'Germany', ES: 'Spain', PT: 'Portugal', IT: 'Italy', NL: 'Netherlands',
  BE: 'Belgium', CH: 'Switzerland', AT: 'Austria', SE: 'Sweden', NO: 'Norway', DK: 'Denmark', FI: 'Finland', PL: 'Poland',
  CZ: 'Czechia', HU: 'Hungary', RO: 'Romania', GR: 'Greece', TR: 'Turkey', UA: 'Ukraine', RU: 'Russia',
  AE: 'United Arab Emirates', SA: 'Saudi Arabia', QA: 'Qatar', KW: 'Kuwait', IL: 'Israel', EG: 'Egypt',
  ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya', MA: 'Morocco',
  CN: 'China', HK: 'Hong Kong', TW: 'Taiwan', JP: 'Japan', KR: 'South Korea', SG: 'Singapore', MY: 'Malaysia',
  TH: 'Thailand', VN: 'Vietnam', ID: 'Indonesia', PH: 'Philippines', IN: 'India', PK: 'Pakistan', AU: 'Australia', NZ: 'New Zealand'
};

async function loadAnalytics() {
  if (analyticsCache) return analyticsCache;
  try {
    const raw = JSON.parse(await fs.readFile(analyticsPath, 'utf8'));
    analyticsCache = { events: Array.isArray(raw?.events) ? raw.events : [] };
  } catch {
    analyticsCache = { events: [] };
  }
  return analyticsCache;
}

function saveAnalytics() {
  const write = async () => {
    await fs.mkdir(runtimeDir, { recursive: true });
    await fs.writeFile(analyticsPath, JSON.stringify(analyticsCache), 'utf8');
  };
  analyticsWriteQueue = analyticsWriteQueue.then(write, write);
  return analyticsWriteQueue;
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const raw = forwarded || String(req.socket?.remoteAddress || '').trim();
  const ip = raw.replace(/^::ffff:/, '');
  if (ip === '::1' || ip === '127.0.0.1') return '';
  return ip;
}

async function lookupIpCountry(ip) {
  if (!ip) return { ip: '', country: '', country_code: '', region: '', city: '' };
  if (geoCache.has(ip)) return { ip, ...geoCache.get(ip) };
  try {
    const response = await fetch(`http://ipwho.is/${encodeURIComponent(ip)}?fields=success,country,country_code,region,city`, { signal: AbortSignal.timeout(4_000) });
    const payload = await response.json().catch(() => ({}));
    if (payload && payload.success !== false && payload.country_code) {
      const geo = {
        country: String(payload.country || '').slice(0, 80),
        country_code: String(payload.country_code || '').slice(0, 4).toUpperCase(),
        region: String(payload.region || '').slice(0, 80),
        city: String(payload.city || '').slice(0, 80)
      };
      geoCache.set(ip, geo);
      return { ip, ...geo };
    }
  } catch {
    // geo lookup is best-effort; analytics must never block the storefront
  }
  const empty = { country: '', country_code: '', region: '', city: '' };
  geoCache.set(ip, empty);
  return { ip, ...empty };
}

function geoForRequest(req) {
  return lookupIpCountry(clientIp(req));
}

function analyticsCustomerId(req) {
  try { return currentCustomer(req)?.accountId || ''; } catch { return ''; }
}

async function recordAnalyticsEvent(req, { type = 'page_view', path: eventPath = '', title = '', referrer = '', locale = '', customer_id = '', product_id = '', product_name = '', meta = null, geo = null } = {}) {
  try {
    const userAgent = String(req.headers['user-agent'] || '').slice(0, 240);
    if (analyticsBotPattern.test(userAgent)) return null;
    const data = await loadAnalytics();
    const resolvedGeo = geo || await geoForRequest(req);
    const event = {
      id: operationId('event'),
      type: textValue(type, 24) || 'page_view',
      path: textValue(eventPath, 300),
      title: textValue(title, 160),
      referrer: textValue(referrer, 500),
      locale: textValue(locale, 16),
      customer_id: textValue(customer_id, 80),
      product_id: textValue(product_id, 100),
      product_name: textValue(product_name, 160),
      meta: meta && typeof meta === 'object' ? JSON.parse(JSON.stringify(meta)).constructor === Object ? meta : null : null,
      ip: resolvedGeo.ip || '',
      country: resolvedGeo.country || '',
      country_code: resolvedGeo.country_code || '',
      region: resolvedGeo.region || '',
      city: resolvedGeo.city || '',
      user_agent: userAgent,
      created_at: new Date().toISOString()
    };
    if (event.country_code && analyticsCountryNames[event.country_code] && !event.country) event.country = analyticsCountryNames[event.country_code];
    data.events.push(event);
    if (data.events.length > analyticsMaxEvents) data.events = data.events.slice(-analyticsMaxEvents);
    await saveAnalytics();
    return event;
  } catch (error) {
    console.error('[fbox-analytics] failed to record event:', error?.message || error);
    return null;
  }
}

function analyticsInRange(event, fromMs, toMs) {
  const time = Date.parse(event.created_at || '');
  if (!Number.isFinite(time)) return false;
  if (fromMs && time < fromMs) return false;
  if (toMs && time > toMs) return false;
  return true;
}

function analyticsSourceOf(event) {
  const ref = String(event.referrer || '');
  if (!ref) return 'Direct';
  try {
    const host = new URL(ref).hostname.toLowerCase();
    if (!host) return 'Direct';
    if (/(^|\.)google\./.test(host)) return 'Google';
    if (/(^|\.)bing\./.test(host)) return 'Bing';
    if (/(^|\.)facebook\.|(^|\.)fb\./.test(host)) return 'Facebook';
    if (/(^|\.)instagram\./.test(host)) return 'Instagram';
    if (/(^|\.)tiktok\./.test(host)) return 'TikTok';
    if (/(^|\.)youtube\.|(^|\.)youtu\.be/.test(host)) return 'YouTube';
    if (/(^|\.)x\.com|(^|\.)twitter\./.test(host)) return 'X / Twitter';
    if (/(^|\.)reddit\./.test(host)) return 'Reddit';
    if (/(^|\.)alibaba\./.test(host)) return 'Alibaba';
    if (/(^|\.)linkedin\./.test(host)) return 'LinkedIn';
    return host.replace(/^www\./, '');
  } catch {
    return 'Direct';
  }
}

function countBy(records, keyFn) {
  const map = new Map();
  for (const record of records) {
    const key = keyFn(record) || 'Unknown';
    map.set(key, (map.get(key) || 0) + 1);
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function buildAnalyticsDashboard(events, store, operations, fromMs, toMs) {
  const scoped = events.filter(event => analyticsInRange(event, fromMs, toMs));
  const pageViews = scoped.filter(event => event.type === 'page_view');
  const productViews = scoped.filter(event => event.type === 'product_view');
  const clicks = scoped.filter(event => event.type === 'click');
  const inquiries = (operations.inquiries || []).filter(item => analyticsInRange(item, fromMs, toMs));
  const orders = (store.orders || []).filter(item => analyticsInRange(item, fromMs, toMs));
  const accounts = store.accounts || [];
  const registrations = accounts.filter(item => analyticsInRange({ created_at: item.created_at }, fromMs, toMs));

  const dayMs = 24 * 60 * 60 * 1000;
  const days = [];
  const startDay = fromMs ? new Date(fromMs) : (scoped.length ? new Date(Date.parse(scoped[0].created_at)) : new Date());
  const endDay = toMs ? new Date(toMs) : new Date();
  for (let t = new Date(startDay.setHours(0, 0, 0, 0)).getTime(); t <= endDay.getTime(); t += dayMs) {
    const dayStart = t;
    const dayEnd = t + dayMs;
    const dayEvents = scoped.filter(event => { const time = Date.parse(event.created_at || ''); return time >= dayStart && time < dayEnd; });
    days.push({
      date: new Date(t).toISOString().slice(0, 10),
      page_views: dayEvents.filter(event => event.type === 'page_view').length,
      product_views: dayEvents.filter(event => event.type === 'product_view').length,
      clicks: dayEvents.filter(event => event.type === 'click').length,
      visitors: new Set(dayEvents.map(event => event.ip).filter(Boolean)).size
    });
  }

  const leadByCustomer = new Map();
  for (const event of scoped) {
    if (!event.customer_id) continue;
    leadByCustomer.set(event.customer_id, {
      customer_id: event.customer_id,
      country: event.country,
      country_code: event.country_code,
      last_seen_at: event.created_at,
      product_ids: new Set([...(leadByCustomer.get(event.customer_id)?.product_ids || []), event.product_id].filter(Boolean))
    });
  }

  const leads = accounts.map(account => {
    const behavior = leadByCustomer.get(account.id) || {};
    const accountOrders = orders.filter(order => order.customer_id === account.id);
    const accountInquiries = (operations.inquiries || []).filter(item => item.customer_id === account.id || (account.email && item.customer_email && String(item.customer_email).toLowerCase() === String(account.email).toLowerCase()));
    const interest = [...(behavior.product_ids || [])].map(id => store.products.find(p => p.id === id)?.name || id).slice(0, 4);
    let grade = 'C';
    if (accountOrders.length || accountInquiries.some(item => item.status === 'resolved' || item.quotes?.length)) grade = 'A';
    else if (accountInquiries.length || (behavior.product_ids?.size || 0) >= 2) grade = 'B';
    return {
      id: account.id,
      username: account.username,
      email: account.email || '',
      telephone: account.telephone || '',
      company: account.company || '',
      country: account.country || behavior.country || accountInquiries[0]?.country || '',
      country_code: account.country_code || behavior.country_code || accountInquiries[0]?.country_code || '',
      created_at: account.created_at,
      last_login_at: account.last_login_at || '',
      last_seen_at: behavior.last_seen_at || '',
      orders: accountOrders.length,
      inquiries: accountInquiries.length,
      interest,
      grade
    };
  }).sort((a, b) => (a.grade.charCodeAt(0) - b.grade.charCodeAt(0)) || String(b.last_seen_at || b.created_at).localeCompare(String(a.last_seen_at || a.created_at)));

  return {
    range: { from: fromMs ? new Date(fromMs).toISOString() : '', to: toMs ? new Date(toMs).toISOString() : '' },
    totals: {
      page_views: pageViews.length,
      product_views: productViews.length,
      clicks: clicks.length,
      unique_visitors: new Set(scoped.map(event => event.ip).filter(Boolean)).size,
      registered_customers: accounts.length,
      new_registrations: registrations.length,
      inquiries: inquiries.length,
      orders: orders.length
    },
    days,
    countries: countBy(scoped.filter(event => event.country), event => event.country),
    sources: countBy(pageViews, analyticsSourceOf),
    pages: countBy(pageViews, event => event.path || '/'),
    products: countBy(productViews, event => event.product_name || event.product_id),
    locales: countBy(pageViews, event => event.locale),
    leads,
    recent_events: [...scoped].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, 40).map(event => ({
      id: event.id,
      type: event.type,
      path: event.path,
      title: event.title,
      product_name: event.product_name,
      country: event.country,
      city: event.city,
      ip: event.ip,
      source: analyticsSourceOf(event),
      created_at: event.created_at
    }))
  };
}

function adminUsername() {
  return String(process.env.FBOX_ADMIN_USERNAME || 'admin').trim();
}

function adminPassword() {
  // The credential was explicitly set for this local F-Box installation. Keep
  // the environment variable as the production override, but make a fresh
  // local checkout usable before a process manager injects environment vars.
  return String(process.env.FBOX_ADMIN_PASSWORD || '3125002').trim();
}

function pruneAdminSessions() {
  const now = Date.now();
  for (const [token, session] of adminSessions.entries()) {
    if (!token || !session || Number(session.expires_at || 0) <= now) adminSessions.delete(token);
  }
}

function ensureAdminSessionsLoaded() {
  if (adminSessionsLoaded) return Promise.resolve();
  if (adminSessionsLoading) return adminSessionsLoading;
  adminSessionsLoading = (async () => {
    try {
      const payload = JSON.parse(await fs.readFile(adminSessionsPath, 'utf8'));
      const sessions = Array.isArray(payload?.sessions) ? payload.sessions : [];
      for (const session of sessions) {
        const token = String(session?.token || '').trim();
        const username = String(session?.username || '').trim();
        const expiresAt = Number(session?.expires_at || 0);
        if (token && username && Number.isFinite(expiresAt) && expiresAt > Date.now()) {
          adminSessions.set(token, { username, expires_at: expiresAt });
        }
      }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error;
    } finally {
      pruneAdminSessions();
      adminSessionsLoaded = true;
      adminSessionsLoading = null;
    }
  })();
  return adminSessionsLoading;
}

function saveAdminSessions() {
  const write = async () => {
    pruneAdminSessions();
    await fs.mkdir(runtimeDir, { recursive: true });
    const sessions = [...adminSessions.entries()].map(([token, session]) => ({
      token,
      username: session.username,
      expires_at: session.expires_at
    }));
    await fs.writeFile(adminSessionsPath, JSON.stringify({ sessions }, null, 2), 'utf8');
  };
  adminSessionsWriteQueue = adminSessionsWriteQueue.then(write, write);
  return adminSessionsWriteQueue;
}

async function createAdminSession() {
  await ensureAdminSessionsLoaded();
  const token = randomUUID();
  adminSessions.set(token, { username: adminUsername(), expires_at: Date.now() + adminSessionTtlMs });
  await saveAdminSessions();
  return token;
}

async function revokeAdminSession(token) {
  if (!token) return;
  await ensureAdminSessionsLoaded();
  if (adminSessions.delete(token)) await saveAdminSessions();
}

const defaultOperations = {
  vehicles: [
    { id: 'fit-audi-q3-2015-pp-fwd', year: 2015, make: 'Audi', model: 'Q3', trim: 'Premium Plus', drive: 'FWD', status: 'active', notes: '19 inch wheel baseline; verify brake package before order.', oem_wheel_specs: { diameter: '18', width: '7', pcd: '5x112', center_bore: '57.1', offset: '+43', source: 'F-Box fitment catalog' } },
    { id: 'fit-bmw-3-2021-m340i-awd', year: 2021, make: 'BMW', model: '3 Series', trim: 'M340i', drive: 'AWD', status: 'active', notes: 'Staggered fitment requires axle-specific confirmation.', oem_wheel_specs: { diameter: '19', width: '8.5 / 9.5', pcd: '5x112', center_bore: '66.6', offset: '+25 / +39', source: 'F-Box fitment catalog' } },
    { id: 'fit-honda-civic-2024-sport-fwd', year: 2024, make: 'Honda', model: 'Civic', trim: 'Sport', drive: 'FWD', status: 'active', notes: 'Check big-brake clearance with 17 inch options.', oem_wheel_specs: { diameter: '18', width: '8', pcd: '5x114.3', center_bore: '64.1', offset: '+50', source: 'F-Box fitment catalog' } },
    { id: 'fit-toyota-gr86-2023-premium-rwd', year: 2023, make: 'Toyota', model: 'GR86', trim: 'Premium', drive: 'RWD', status: 'active', notes: 'Common 5x100 platform; keep offset within approved range.', oem_wheel_specs: { diameter: '18', width: '7.5', pcd: '5x100', center_bore: '56.1', offset: '+48', source: 'F-Box fitment catalog' } },
    { id: 'fit-tesla-model3-2024-performance-awd', year: 2024, make: 'Tesla', model: 'Model 3', trim: 'Performance', drive: 'AWD', status: 'active', notes: 'Confirm brake and aero clearance before dispatch.', oem_wheel_specs: { diameter: '20', width: '9', pcd: '5x114.3', center_bore: '64.1', offset: '+34', source: 'F-Box fitment catalog' } },
    { id: 'fit-ford-mustang-2024-gt-rwd', year: 2024, make: 'Ford', model: 'Mustang', trim: 'GT', drive: 'RWD', status: 'active', notes: 'Rear axle load and brake package must be checked together.', oem_wheel_specs: { diameter: '19', width: '9', pcd: '5x114.3', center_bore: '70.5', offset: '+25', source: 'F-Box fitment catalog' } },
    { id: 'fit-volvo-xc60-2016-core-awd', year: 2016, make: 'Volvo', model: 'XC60', trim: 'Core', drive: 'AWD', status: 'active', notes: 'Use the selected trim and axle data when checking custom offsets.', oem_wheel_specs: { diameter: '18', width: '7.5', pcd: '5x108', center_bore: '63.4', offset: '+55', source: 'F-Box fitment catalog' } }
  ],
  jobs: [],
  reviews: [],
  cases: [],
  inquiries: []
};
let operationsCache = null;
let frontendVehicleLibraryCache = null;
let storeCache = null;

function vehicleLibraryKey(vehicle = {}) {
  return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim, vehicle.drive].map(value => String(value || '').trim().toLowerCase()).join('|');
}

function vehicleSlug(value = '') {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'vehicle';
}

function catalogDriveOptions(make, model) {
  if (['Audi', 'Volkswagen', 'Subaru', 'Volvo', 'Porsche', 'Lexus'].includes(make)) return ['FWD', 'AWD'];
  if (['Ford', 'Jeep', 'Chevrolet', 'Toyota'].includes(make) && ['F-150', 'Bronco', '4Runner', 'Silverado', 'Wrangler', 'Gladiator'].includes(model)) return ['RWD', '4WD'];
  if (['BMW', 'Mercedes-Benz', 'Nissan', 'Mazda', 'Honda', 'Hyundai', 'Kia'].includes(make)) return ['FWD', 'RWD', 'AWD'];
  if (make === 'Tesla') return ['RWD', 'AWD'];
  return ['FWD', 'RWD', 'AWD'];
}

async function loadFrontendVehicleLibrary() {
  if (frontendVehicleLibraryCache) return frontendVehicleLibraryCache;
  const source = await fs.readFile(path.join(moduleDir, 'app.js'), 'utf8');
  const start = source.indexOf('const vehicleFamilies = ');
  const endMatch = start >= 0 ? source.slice(start).match(/\r?\n\r?\nfunction buildVehicleCatalog/) : null;
  const end = endMatch ? start + endMatch.index : -1;
  if (start < 0 || end < 0) throw new Error('The storefront vehicle catalog could not be read.');
  const objectSource = source.slice(start + 'const vehicleFamilies = '.length, end).replace(/;\s*$/, '');
  const families = vm.runInNewContext(`(${objectSource})`, Object.create(null));
  const records = [];
  for (const [make, models] of Object.entries(families)) {
    for (const [model, range] of Object.entries(models)) {
      const [from, to, trims] = range;
      for (let year = Number(from); year <= Number(to); year += 1) {
        for (const trim of trims) {
          for (const drive of catalogDriveOptions(make, model)) {
            records.push({
              id: `catalog-${year}-${vehicleSlug(make)}-${vehicleSlug(model)}-${vehicleSlug(trim)}-${vehicleSlug(drive)}`,
              year, make, model, trim, drive, status: 'active', notes: '',
              oem_wheel_specs: normalizeInquirySpecs(), spec_source: '', spec_status: 'pending', source_type: 'catalog'
            });
          }
        }
      }
    }
  }
  frontendVehicleLibraryCache = records;
  return records;
}

async function buildVehicleLibrary(data) {
  const catalog = await loadFrontendVehicleLibrary();
  const merged = new Map(catalog.map(item => [vehicleLibraryKey(item), item]));
  data.vehicles.forEach(item => {
    const key = vehicleLibraryKey(item);
    merged.set(key, { ...(merged.get(key) || {}), ...item, source_type: 'managed' });
  });
  return Array.from(merged.values());
}

function copyDefaultOperations() {
  return JSON.parse(JSON.stringify(defaultOperations));
}

async function loadOperations() {
  if (operationsCache) return operationsCache;
  let raw;
  try {
    raw = JSON.parse(await fs.readFile(operationsPath, 'utf8'));
  } catch {
    try {
      raw = JSON.parse(await fs.readFile(seedOperationsPath, 'utf8'));
    } catch {
      raw = null;
    }
  }
  if (raw) {
    operationsCache = {
      ...copyDefaultOperations(),
      ...raw,
      vehicles: (Array.isArray(raw.vehicles) && raw.vehicles.length ? raw.vehicles : copyDefaultOperations().vehicles).map(item => {
        const seed = copyDefaultOperations().vehicles.find(vehicle => vehicle.id === item.id);
        const specs = item.oem_wheel_specs && Object.keys(item.oem_wheel_specs).length ? item.oem_wheel_specs : seed?.oem_wheel_specs;
        return { ...item, oem_wheel_specs: normalizeInquirySpecs(specs), spec_source: item.spec_source || specs?.source || seed?.oem_wheel_specs?.source || '', spec_status: item.spec_status || (seed ? 'pending' : 'needs_review'), source_type: 'managed' };
      }),
      jobs: Array.isArray(raw.jobs) ? raw.jobs : [],
      // Imported review ids are reconciled with the deployable seed below;
      // customer-submitted and test records stay in the runtime file.
      reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
      cases: Array.isArray(raw.cases) ? raw.cases : [],
      inquiries: Array.isArray(raw.inquiries) ? raw.inquiries.map(item => ({
        customer_grade: 'C',
        vehicle_selection: normalizeVehicleSelection(item.vehicle_selection),
        official_wheel_specs: normalizeInquirySpecs(item.official_wheel_specs),
        product_display_price: Number(item.product_display_price || 0) || 0,
        quotes: [],
        active_quote_id: '',
        ...ensureInquiryMessages(item)
      })) : []
    };
    // Seed data is shipped with the deployable site so a fresh server starts
    // with the same fitment library. Runtime edits are still written outside
    // the repository and take precedence on the next request.
    const mergedReviews = await mergeImportedReviewSeed(operationsCache.reviews);
    const previousImported = operationsCache.reviews.filter(item => String(item?.id || '').startsWith('review-import-'));
    const currentImported = mergedReviews.filter(item => String(item?.id || '').startsWith('review-import-'));
    const importedReviewsChanged = JSON.stringify(previousImported) !== JSON.stringify(currentImported);
    if (mergedReviews.length !== operationsCache.reviews.length || importedReviewsChanged) {
      operationsCache.reviews = mergedReviews;
      await saveOperations(operationsCache);
    } else if (!await fs.access(operationsPath).then(() => true).catch(() => false)) await saveOperations(operationsCache);
  } else {
    operationsCache = copyDefaultOperations();
    operationsCache.vehicles = operationsCache.vehicles.map(item => ({ ...item, source_type: 'managed' }));
    operationsCache.reviews = await loadImportedReviewSeed();
    await saveOperations(operationsCache);
  }
  return operationsCache;
}

// The imported review set ships as its own seed file so the operations seed
// stays untouched. A deploy should update these records in place while leaving
// customer-submitted and test records from the runtime file alone.
async function loadImportedReviewSeed() {
  try {
    const records = JSON.parse(await fs.readFile(seedReviewsPath, 'utf8'));
    return Array.isArray(records) ? records : [];
  } catch {
    return [];
  }
}

async function mergeImportedReviewSeed(reviews) {
  const list = Array.isArray(reviews) ? reviews : [];
  const seed = await loadImportedReviewSeed();
  if (!seed.length) return list;
  const preservedRuntimeRecords = list.filter(item => !String(item?.id || '').startsWith('review-import-'));
  return [...seed, ...preservedRuntimeRecords];
}

async function saveOperations(data) {
  operationsCache = data;
  await fs.mkdir(runtimeDir, { recursive: true });
  await fs.writeFile(operationsPath, JSON.stringify(data, null, 2), 'utf8');
}

function copyDefaultStore() {
  return { products: [], accounts: [], orders: [] };
}

async function loadStore() {
  if (storeCache) return storeCache;
  let raw;
  try {
    raw = JSON.parse(await fs.readFile(storePath, 'utf8'));
  } catch {
    try { raw = JSON.parse(await fs.readFile(seedStorePath, 'utf8')); } catch { raw = null; }
  }
  storeCache = {
    ...copyDefaultStore(),
    ...(raw || {}),
    products: Array.isArray(raw?.products) ? raw.products : [],
    accounts: Array.isArray(raw?.accounts) ? raw.accounts : [],
    orders: Array.isArray(raw?.orders) ? raw.orders : []
  };
  if (!await fs.access(storePath).then(() => true).catch(() => false)) await saveStore(storeCache);
  return storeCache;
}

async function saveStore(data) {
  storeCache = data;
  await fs.mkdir(runtimeDir, { recursive: true });
  await fs.writeFile(storePath, JSON.stringify(data, null, 2), 'utf8');
}

function hashCustomerPassword(password) {
  return createHash('sha256').update(String(password || '')).digest('hex');
}

async function ensureCustomerSessionsLoaded() {
  if (customerSessionsLoaded) return;
  try {
    const payload = JSON.parse(await fs.readFile(customerSessionsPath, 'utf8'));
    const sessions = Array.isArray(payload?.sessions) ? payload.sessions : [];
    for (const session of sessions) {
      const token = String(session?.token || '').trim();
      const accountId = String(session?.accountId || '').trim();
      const createdAt = Number(session?.createdAt || 0);
      if (token && accountId && Date.now() - createdAt <= customerSessionTtlMs) {
        customerSessions.set(token, { accountId, createdAt });
      }
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  } finally {
    customerSessionsLoaded = true;
  }
}

function saveCustomerSessions() {
  const write = async () => {
    await fs.mkdir(runtimeDir, { recursive: true });
    const sessions = [...customerSessions.entries()].map(([token, session]) => ({ token, accountId: session.accountId, createdAt: session.createdAt }));
    await fs.writeFile(customerSessionsPath, JSON.stringify({ sessions }, null, 2), 'utf8');
  };
  customerSessionsWriteQueue = customerSessionsWriteQueue.then(write, write);
  return customerSessionsWriteQueue;
}

function customerToken(req) {
  const authorization = String(req.headers.authorization || '');
  if (/^Bearer\s+/i.test(authorization)) return authorization.replace(/^Bearer\s+/i, '').trim();
  return String(req.headers['x-fbox-customer-token'] || '').trim();
}

function currentCustomer(req) {
  const token = customerToken(req);
  const session = customerSessions.get(token);
  if (!session) return null;
  if (Date.now() - session.createdAt > customerSessionTtlMs) {
    customerSessions.delete(token);
    void saveCustomerSessions();
    return null;
  }
  return session;
}

function publicCustomer(account) {
  return {
    id: account.id,
    username: account.username,
    email: account.email || '',
    telephone: account.telephone || '',
    company: account.company || '',
    country: account.country || '',
    country_code: account.country_code || '',
    created_at: account.created_at,
    last_login_at: account.last_login_at || ''
  };
}

function requireCustomer(req, res) {
  const customer = currentCustomer(req);
  if (!customer) {
    json(res, 401, { detail: 'F-Box customer authentication is required.' });
    return null;
  }
  return customer;
}

function storeProduct(data, productId) {
  return data.products.find(item => String(item.id) === String(productId) && item.status !== 'archived');
}

function orderTotal(data, items = []) {
  return items.reduce((sum, item) => {
    const product = storeProduct(data, item.product_id);
    const quantity = Math.max(1, Number(item.quantity || 1));
    return sum + (product ? Number(product.price || 0) * quantity : 0);
  }, 0);
}

function operationId(prefix) {
  return `fbox_${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function textValue(value, max = 240) {
  return String(value || '').trim().slice(0, max);
}

function hasOwn(object, key) {
  return Object.prototype.hasOwnProperty.call(object || {}, key);
}

function normalizeProductImages(value, legacyImage = '') {
  const source = Array.isArray(value) ? value : [];
  const seen = new Set();
  const images = source.map((entry, index) => {
    const sourceEntry = typeof entry === 'string' ? { url: entry } : (entry && typeof entry === 'object' ? entry : {});
    const url = textValue(sourceEntry.url || sourceEntry.image, 800);
    if (!url || seen.has(url)) return null;
    seen.add(url);
    return {
      id: textValue(sourceEntry.id, 120) || `image-${index + 1}`,
      url,
      original_url: textValue(sourceEntry.original_url || sourceEntry.originalUrl, 800),
      alt: textValue(sourceEntry.alt, 220),
      cutout: sourceEntry.cutout !== false
    };
  }).filter(Boolean).slice(0, 12);
  const fallback = textValue(legacyImage, 800);
  if (!images.length && fallback) images.push({ id: 'image-1', url: fallback, original_url: '', alt: '', cutout: false });
  return images;
}

function publicProductImageUrl(value = '') {
  const source = String(value || '').trim();
  if (!source) return '';
  if (/^(?:https?:|data:|\/)/i.test(source)) return source;
  if (/^(?:\.\.\/)+api\//i.test(source)) return `/${source.replace(/^(?:\.\.\/)+/i, '')}`;
  if (/^\.\/api\//i.test(source)) return `/${source.replace(/^\.\//i, '')}`;
  if (/^\.?\/?assets\//i.test(source)) return `/${source.replace(/^\.\//i, '').replace(/^\/?/i, '')}`;
  return `/assets/${source.replace(/^\/+/, '')}`;
}

function publicProduct(record = {}) {
  const images = Array.isArray(record.images)
    ? record.images.map(image => ({
      ...image,
      url: publicProductImageUrl(image?.url || image?.image),
      original_url: publicProductImageUrl(image?.original_url || image?.originalUrl)
    }))
    : record.images;
  return {
    ...record,
    image: publicProductImageUrl(record.image),
    image_original: publicProductImageUrl(record.image_original),
    ...(Array.isArray(record.images) ? { images } : {})
  };
}

function normalizeProductPayload(payload = {}, existing = {}) {
  const legacyImage = textValue(hasOwn(payload, 'image') ? payload.image : existing.image, 800);
  const images = normalizeProductImages(hasOwn(payload, 'images') ? payload.images : existing.images, legacyImage);
  const existingPriceMode = existing.price_mode === 'from' ? 'from' : 'fixed';
  const requestedPriceMode = hasOwn(payload, 'price_mode') ? payload.price_mode : existingPriceMode;
  const priceMode = requestedPriceMode === 'from' ? 'from' : 'fixed';
  const oldPriceInput = hasOwn(payload, 'oldPrice') ? payload.oldPrice : existing.oldPrice;
  const stockInput = hasOwn(payload, 'stock') ? payload.stock : existing.stock;
  const priceInput = hasOwn(payload, 'price') ? payload.price : existing.price;
  const statusInput = hasOwn(payload, 'status') ? payload.status : existing.status;
  const sortInput = hasOwn(payload, 'sort') ? payload.sort : existing.sort;
  const currencyInput = hasOwn(payload, 'currency') ? payload.currency : existing.currency;
  const visualizerEnabledInput = hasOwn(payload, 'visualizer_enabled') ? payload.visualizer_enabled : existing.visualizer_enabled;
  const dynamicWheelEffectInput = hasOwn(payload, 'dynamic_wheel_effect') ? payload.dynamic_wheel_effect : existing.dynamic_wheel_effect;
  const visualizerModeInput = hasOwn(payload, 'visualizer_mode') ? payload.visualizer_mode : existing.visualizer_mode;
  const sort = Math.floor(Number(sortInput || 0));
  const cover = images[0];
  const boolValue = (value, fallback = true) => {
    if (typeof value === 'boolean') return value;
    if (['false', '0', 'no', 'off'].includes(String(value || '').toLowerCase())) return false;
    if (['true', '1', 'yes', 'on'].includes(String(value || '').toLowerCase())) return true;
    return fallback;
  };
  return {
    ...existing,
    ...payload,
    price: Number(priceInput || 0),
    oldPrice: oldPriceInput === null || oldPriceInput === '' || oldPriceInput === undefined ? null : Number(oldPriceInput || 0),
    stock: Math.max(0, Number(stockInput || 0)),
    status: ['draft', 'published', 'archived'].includes(statusInput) ? statusInput : 'draft',
    // A positive value is a deliberate catalog priority. Products without one
    // stay in their natural newest-uploaded order on the storefront.
    sort: Number.isFinite(sort) && sort > 0 ? sort : 0,
    price_mode: priceMode,
    currency: textValue(currencyInput || 'USD', 8).toUpperCase() || 'USD',
    visualizer_enabled: boolValue(visualizerEnabledInput, existing.visualizer_enabled !== false),
    dynamic_wheel_effect: boolValue(dynamicWheelEffectInput, existing.dynamic_wheel_effect !== false),
    visualizer_mode: textValue(visualizerModeInput || 'dynamic-wheel', 40) || 'dynamic-wheel',
    images,
    image: cover?.url || legacyImage,
    image_original: cover?.original_url || textValue(hasOwn(payload, 'image_original') ? payload.image_original : existing.image_original, 800),
    image_cutout: cover?.cutout ?? Boolean(hasOwn(payload, 'image_cutout') ? payload.image_cutout : existing.image_cutout),
    updated_at: new Date().toISOString()
  };
}

function sortProductsForDisplay(records = []) {
  return records.slice().sort((left, right) => {
    const leftSort = Math.max(0, Math.floor(Number(left?.sort || 0)));
    const rightSort = Math.max(0, Math.floor(Number(right?.sort || 0)));
    if (leftSort || rightSort) {
      if (!leftSort) return 1;
      if (!rightSort) return -1;
      if (leftSort !== rightSort) return leftSort - rightSort;
    }
    const leftCreated = String(left?.created_at || left?.updated_at || '');
    const rightCreated = String(right?.created_at || right?.updated_at || '');
    return rightCreated.localeCompare(leftCreated);
  });
}

function normalizeChatMessage(payload = {}, role = 'customer', id = operationId('message')) {
  const text = textValue(payload.text || payload.message, 4000);
  if (!text) throw new Error('消息内容不能为空。');
  return {
    id,
    role: ['customer', 'admin', 'assistant'].includes(role) ? role : 'customer',
    text,
    kind: payload.kind === 'quote' ? 'quote' : 'text',
    quote: payload.quote && typeof payload.quote === 'object' ? payload.quote : undefined,
    operator_text: textValue(payload.operator_text, 4000),
    source_language: textValue(payload.source_language || payload.locale || 'auto', 40),
    target_language: textValue(payload.target_language || 'en', 40),
    created_at: payload.created_at || new Date().toISOString(),
    read: role !== 'customer'
  };
}

function ensureInquiryMessages(record) {
  if (Array.isArray(record.messages) && record.messages.length) return record;
  const first = normalizeChatMessage({
    text: record.message || 'Customer inquiry',
    source_language: record.locale || 'auto',
    created_at: record.created_at
  }, 'customer', `${record.id || operationId('inquiry')}_message`);
  return { ...record, messages: [first] };
}

function inquiryUnreadCount(record) {
  return ensureInquiryMessages(record).messages.filter(message => message.role === 'customer' && !message.read).length;
}

function normalizeVehicle(payload = {}, id = operationId('fit')) {
  const vehicle = {
    id,
    year: Number(payload.year || 0),
    make: textValue(payload.make, 60),
    model: textValue(payload.model, 80),
    trim: textValue(payload.trim, 80),
    drive: textValue(payload.drive, 20),
    status: ['active', 'inactive'].includes(payload.status) ? payload.status : 'active',
    notes: textValue(payload.notes, 500),
    oem_wheel_specs: normalizeInquirySpecs(payload.oem_wheel_specs),
    spec_source: textValue(payload.spec_source || payload.oem_wheel_specs?.source, 180),
    spec_status: ['verified', 'pending', 'needs_review'].includes(payload.spec_status) ? payload.spec_status : 'pending',
    source_type: 'managed'
  };
  if (!vehicle.year || vehicle.year < 1980 || vehicle.year > 2035 || !vehicle.make || !vehicle.model || !vehicle.trim) {
    throw new Error('车型适配至少需要填写年份、品牌、车型和配置。');
  }
  return vehicle;
}

function normalizeReview(payload = {}, id = operationId('review'), existing = {}) {
  const rating = Math.min(5, Math.max(1, Number(payload.rating || 5)));
  const sourceInput = hasOwn(payload, 'source') ? payload.source : existing.source;
  const source = ['customer', 'imported', 'test'].includes(sourceInput) ? sourceInput : 'customer';
  const statusInput = hasOwn(payload, 'status') ? payload.status : existing.status;
  const requestedStatus = ['pending', 'approved', 'rejected', 'hidden'].includes(statusInput) ? statusInput : 'pending';
  const review = {
    id,
    product_id: textValue(payload.product_id, 80),
    product_name: textValue(payload.product_name, 120),
    title: textValue(payload.title, 120),
    body: textValue(payload.body, 2000),
    vehicle: textValue(payload.vehicle, 160),
    customer_country: textValue(hasOwn(payload, 'customer_country') ? payload.customer_country : existing.customer_country, 80),
    customer_country_code: textValue(hasOwn(payload, 'customer_country_code') ? payload.customer_country_code : existing.customer_country_code, 8).toUpperCase(),
    source_platform: textValue(hasOwn(payload, 'source_platform') ? payload.source_platform : existing.source_platform, 80),
    source_url: textValue(hasOwn(payload, 'source_url') ? payload.source_url : existing.source_url, 400),
    review_images_count: Math.max(0, Math.min(12, Number(hasOwn(payload, 'review_images_count') ? payload.review_images_count : existing.review_images_count) || 0)),
    customer_name: textValue(payload.customer_name || payload.name || existing.customer_name, 80),
    customer_email: textValue(
      hasOwn(payload, 'customer_email')
        ? payload.customer_email
        : (hasOwn(payload, 'email') ? payload.email : existing.customer_email),
      160
    ),
    order_id: textValue(hasOwn(payload, 'order_id') ? payload.order_id : existing.order_id, 80),
    rating,
    status: source === 'test' ? 'pending' : requestedStatus,
    source,
    verified_purchase: source === 'test' ? false : Boolean(hasOwn(payload, 'verified_purchase') ? payload.verified_purchase : existing.verified_purchase),
    consent_confirmed: source === 'test' ? false : Boolean(hasOwn(payload, 'consent_confirmed') ? payload.consent_confirmed : existing.consent_confirmed),
    admin_note: textValue(hasOwn(payload, 'admin_note') ? payload.admin_note : existing.admin_note, 500),
    admin_reply: textValue(hasOwn(payload, 'admin_reply') ? payload.admin_reply : existing.admin_reply, 1600),
    created_at: existing.created_at || payload.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  if (!review.title || !review.body) throw new Error('评价标题和内容不能为空。');
  if (!review.customer_name) throw new Error('评价需要填写客户名称。');
  return review;
}

function normalizeCase(payload = {}, id = operationId('case')) {
  const record = {
    id,
    title: textValue(payload.title, 160),
    vehicle: textValue(payload.vehicle, 160),
    product_name: textValue(payload.product_name, 120),
    image_url: textValue(payload.image_url, 1000),
    summary: textValue(payload.summary, 600),
    status: ['draft', 'published', 'archived'].includes(payload.status) ? payload.status : 'draft',
    sort: Number(payload.sort || 0),
    created_at: payload.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  if (!record.title || !record.image_url) throw new Error('案例标题和图片地址不能为空。');
  return record;
}

function normalizeInquirySpecs(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    diameter: textValue(source.diameter, 80),
    width: textValue(source.width, 40),
    pcd: textValue(source.pcd, 30),
    offset: textValue(source.offset, 20),
    center_bore: textValue(source.center_bore, 30),
    quantity: textValue(source.quantity, 10),
    source: textValue(source.source, 180),
    oem_diameter: textValue(source.oem_diameter, 20),
    oem_width: textValue(source.oem_width, 20),
    oem_pcd: textValue(source.oem_pcd, 30),
    oem_center_bore: textValue(source.oem_center_bore, 30),
    oem_offset: textValue(source.oem_offset, 20)
  };
}
function normalizeVehicleSelection(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    year: Number(source.year || 0) || '',
    make: textValue(source.make, 60),
    model: textValue(source.model, 80),
    trim: textValue(source.trim, 80),
    drive: textValue(source.drive, 20)
  };
}
function normalizeInquiry(payload = {}, id = operationId('inquiry')) {
  const record = {
    id,
    topic: textValue(payload.topic || 'fitment', 80),
    channel: textValue(payload.channel || 'inquiry', 40),
    locale: textValue(payload.locale || payload.source_language || 'auto', 40),
    message: textValue(payload.message, 2000),
    customer_name: textValue(payload.customer_name || payload.name || 'Website visitor', 80),
    customer_email: textValue(payload.customer_email || payload.email, 160),
    customer_phone: textValue(payload.customer_phone || payload.phone, 60),
    country: textValue(payload.country, 80),
    country_code: textValue(payload.country_code, 8).toUpperCase(),
    vehicle: textValue(payload.vehicle, 160),
    vehicle_selection: normalizeVehicleSelection(payload.vehicle_selection),
    official_wheel_specs: normalizeInquirySpecs(payload.official_wheel_specs),
    vehicle_file_name: textValue(payload.vehicle_file_name, 180),
    product_id: textValue(payload.product_id, 80),
    product_name: textValue(payload.product_name, 120),
    product_category: textValue(payload.product_category, 80),
    product_finish: textValue(payload.product_finish, 80),
    product_image: textValue(payload.product_image, 1000),
    product_display_price: Number(payload.product_display_price || payload.product_price || 0) || 0,
    preview_images: Array.isArray(payload.preview_images) ? payload.preview_images.map(image => textValue(image, 1000)).filter(Boolean).slice(0, 3) : [],
    wheel_specs: normalizeInquirySpecs(payload.wheel_specs),
    customer_note: textValue(payload.customer_note, 1000),
    customer_grade: ['A', 'B', 'C'].includes(payload.customer_grade) ? payload.customer_grade : 'C',
    quotes: Array.isArray(payload.quotes) ? payload.quotes.slice(0, 20) : [],
    active_quote_id: textValue(payload.active_quote_id, 120),
    messages: [],
    status: ['open', 'in_progress', 'resolved', 'closed'].includes(payload.status) ? payload.status : 'open',
    admin_note: textValue(payload.admin_note, 500),
    created_at: payload.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  if (!record.message) throw new Error('咨询内容不能为空。');
  record.messages = Array.isArray(payload.messages) && payload.messages.length
    ? payload.messages.map(item => normalizeChatMessage(item, item?.role === 'admin' ? 'admin' : 'customer', item?.id || operationId('message')))
    : [normalizeChatMessage({ text: record.message, source_language: record.locale, created_at: record.created_at }, 'customer', `${record.id}_message`)];
  return record;
}

function publicContent(record) {
  const { customer_email, admin_note, source, consent_confirmed, ...safe } = record;
  return safe;
}

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type, Accept',
    'access-control-allow-methods': 'GET, PUT, POST, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(payload));
}

async function readJson(req, maxBytes = 55 * 1024 * 1024) {
  const chunks = [];
  let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBytes) {
      const error = new Error('Request body is too large.');
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    const error = new Error('Request body must be valid JSON.');
    error.status = 400;
    throw error;
  }
}

function imageMimeExtension(mime = '') {
  const normalized = String(mime).toLowerCase();
  if (normalized === 'image/jpeg' || normalized === 'image/jpg') return { mime: 'image/jpeg', extension: 'jpg' };
  if (normalized === 'image/webp') return { mime: 'image/webp', extension: 'webp' };
  return { mime: 'image/png', extension: 'png' };
}

function parseImageDataUrl(value, label = '商品图片') {
  const match = String(value || '').match(/^data:(image\/(?:png|jpe?g|webp));base64,([a-z0-9+/=\s]+)$/i);
  if (!match) {
    const error = new Error(`${label}必须是 PNG、JPG 或 WebP 图片。`);
    error.status = 422;
    throw error;
  }
  const { mime, extension } = imageMimeExtension(match[1]);
  const bytes = Buffer.from(match[2].replace(/\s+/g, ''), 'base64');
  if (!bytes.length || bytes.length > 14 * 1024 * 1024) {
    const error = new Error(`${label}不能超过 14MB。`);
    error.status = 413;
    throw error;
  }
  return { mime, extension, bytes };
}

function safeAssetFilename(value) {
  const filename = decodeURIComponent(String(value || ''));
  return /^[a-zA-Z0-9_-]{3,120}\.(?:png|jpg|jpeg|webp)$/i.test(filename) ? filename : '';
}

export async function handleFBoxAssetApi(req, res, url) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const pathName = url.pathname.replace(/\/$/, '');

  if (req.method === 'POST' && pathName === '/api/fbox-assets/upload') {
    if (!(await requireOperationsAdmin(req, res))) return;
    try {
      const payload = await readJson(req, 20 * 1024 * 1024);
      const parsed = parseImageDataUrl(payload.data_url);
      const filename = `fbox_asset_${Date.now()}_${randomUUID().slice(0, 8)}.${parsed.extension}`;
      await fs.mkdir(mediaDir, { recursive: true });
      await fs.writeFile(path.join(mediaDir, filename), parsed.bytes);
      return json(res, 200, {
        data: {
          id: filename,
          // Keep this relative so the same URL works from / and /admin/ and
          // with the storefront's legacy ./assets/ image prefix.
          url: `../api/fbox-assets/${encodeURIComponent(filename)}`,
          mime_type: parsed.mime,
          bytes: parsed.bytes.length,
          processed: String(payload.process || 'cutout') === 'cutout'
        }
      });
    } catch (error) {
      return json(res, error.status || 422, { detail: error.message || '商品图片上传失败。' });
    }
  }

  const match = pathName.match(/^\/api\/fbox-assets\/([^/]+)$/);
  if (req.method === 'GET' && match) {
    const filename = safeAssetFilename(match[1]);
    if (!filename) return json(res, 404, { detail: '商品图片不存在。' });
    try {
      const filePath = path.join(mediaDir, filename);
      const bytes = await fs.readFile(filePath);
      const extension = path.extname(filename).toLowerCase();
      const contentType = extension === '.webp' ? 'image/webp' : extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : 'image/png';
      res.writeHead(200, {
        'content-type': contentType,
        'cache-control': 'public, max-age=31536000, immutable',
        'content-length': bytes.length
      });
      res.end(bytes);
      return;
    } catch {
      return json(res, 404, { detail: '商品图片不存在。' });
    }
  }

  return json(res, 404, { detail: 'F-Box 商品图片接口不存在。' });
}

async function loadConfig() {
  try {
    const raw = JSON.parse(await fs.readFile(configPath, 'utf8'));
    return {
      endpoint: String(raw.endpoint || defaultEndpoint).replace(/\/$/, ''),
      provider: String(raw.provider || 'lk888'),
      model: defaultModel,
      chat_model: String(raw.chat_model || defaultChatModel),
      api_key: String(raw.api_key || ''),
      paypal_mode: ['sandbox', 'live'].includes(raw.paypal_mode) ? raw.paypal_mode : defaultPayPalMode,
      paypal_client_id: String(raw.paypal_client_id || ''),
      paypal_client_secret: String(raw.paypal_client_secret || ''),
      storefront: { ...defaultStorefrontSettings, ...(raw.storefront || {}) }
    };
  } catch {
    return { endpoint: defaultEndpoint, provider: 'lk888', model: defaultModel, chat_model: defaultChatModel, api_key: '', paypal_mode: defaultPayPalMode, paypal_client_id: '', paypal_client_secret: '', storefront: { ...defaultStorefrontSettings } };
  }
}

function publicStatus(config) {
  const configured = Boolean(config.api_key);
  return {
    configured,
    provider: config.provider,
    endpoint: config.endpoint,
    model: config.model,
    chat_model: config.chat_model || defaultChatModel,
    chat_ready: configured,
    paypal_configured: Boolean(config.paypal_client_id && config.paypal_client_secret),
    paypal_mode: config.paypal_mode || defaultPayPalMode,
    mode: configured ? 'live' : 'not-configured',
    route: 'fbox-independent-backend',
    customer_billing: 'sponsored'
  };
}

function validateEndpoint(value) {
  const endpoint = String(value || '').trim().replace(/\/$/, '');
  let parsed;
  try { parsed = new URL(endpoint); } catch { throw new Error('Base URL is not a valid URL.'); }
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Base URL must use HTTP or HTTPS.');
  if (!endpoint.endsWith('/v1')) throw new Error('LingkeAI Base URL must end with /v1.');
  return endpoint;
}

async function verifyProvider(endpoint, apiKey) {
  try {
    const response = await fetch(`${endpoint}/models`, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(20_000)
    });
    if (!response.ok) throw new Error('LingkeAI rejected the API key or endpoint.');
  } catch (error) {
    if (error?.message?.startsWith('LingkeAI rejected')) throw error;
    throw new Error('LingkeAI could not be reached. Check the endpoint and API key.');
  }
}

function keyPreview(apiKey) {
  if (apiKey.length <= 8) return '••••••••';
  return `${apiKey.slice(0, 4)}${'•'.repeat(Math.max(4, apiKey.length - 8))}${apiKey.slice(-4)}`;
}

async function saveConfig(payload) {
  const endpoint = validateEndpoint(payload.endpoint || defaultEndpoint);
  const current = await loadConfig();
  const apiKey = String(payload.api_key || '').trim() || current.api_key;
  if (apiKey.length < 8) throw new Error('Paste a valid LingkeAI API key before saving.');
  await verifyProvider(endpoint, apiKey);
  const paypalMode = ['sandbox', 'live'].includes(payload.paypal_mode) ? payload.paypal_mode : current.paypal_mode || defaultPayPalMode;
  const paypalClientId = String(payload.paypal_client_id || current.paypal_client_id || '').trim();
  const paypalClientSecret = String(payload.paypal_client_secret || current.paypal_client_secret || '').trim();
  await fs.mkdir(runtimeDir, { recursive: true });
  const next = { endpoint, provider: 'lk888', model: defaultModel, chat_model: current.chat_model || defaultChatModel, api_key: apiKey, paypal_mode: paypalMode, paypal_client_id: paypalClientId, paypal_client_secret: paypalClientSecret, storefront: current.storefront };
  await fs.writeFile(configPath, JSON.stringify(next, null, 2), 'utf8');
  return { ...publicStatus(next), saved: true, key_preview: keyPreview(apiKey) };
}

function normalizeStorefrontSettings(payload = {}) {
  const values = {
    company_name: String(payload.company_name || defaultStorefrontSettings.company_name).trim().slice(0, 160),
    phone: String(payload.phone || defaultStorefrontSettings.phone).trim().slice(0, 40),
    domain: String(payload.domain || defaultStorefrontSettings.domain).trim().slice(0, 120),
    support_email: String(payload.support_email || '').trim().slice(0, 160),
    default_locale: String(payload.default_locale || defaultStorefrontSettings.default_locale).trim().slice(0, 16),
    language_auto_detect: Boolean(payload.language_auto_detect),
    preview_sponsored: Boolean(payload.preview_sponsored)
  };
  if (values.support_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.support_email)) throw new Error('Support email is not valid.');
  if (!/^[a-z]{2}(?:-[A-Z]{2})?$/.test(values.default_locale)) throw new Error('Default language code is not valid.');
  return values;
}

async function saveStorefrontSettings(payload) {
  const current = await loadConfig();
  const storefront = normalizeStorefrontSettings(payload);
  await fs.mkdir(runtimeDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify({ endpoint: current.endpoint, provider: current.provider, model: current.model, chat_model: current.chat_model || defaultChatModel, api_key: current.api_key, paypal_mode: current.paypal_mode || defaultPayPalMode, paypal_client_id: current.paypal_client_id || '', paypal_client_secret: current.paypal_client_secret || '', storefront }, null, 2), 'utf8');
  return storefront;
}

function chatResponseText(payload = {}) {
  const content = payload?.choices?.[0]?.message?.content;
  if (Array.isArray(content)) return content.map(item => item?.text || '').join('').trim();
  return String(content || '').trim();
}

function parseAssistantJson(value) {
  const raw = String(value || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try { return JSON.parse(raw); } catch { return { translation: raw, reply: raw, chinese_summary: '' }; }
}

async function callChatModel(config, messages) {
  if (!config.api_key) throw new Error('GPT-5.5 客服助手尚未配置，请先在图片生成配置中保存 API Key。');
  const response = await fetch(`${config.endpoint}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.api_key}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: config.chat_model || defaultChatModel, messages, temperature: 0.2, max_tokens: 1200, response_format: { type: 'json_object' } }),
    signal: AbortSignal.timeout(60_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || payload?.message || `GPT-5.5 request failed (${response.status}).`);
  const content = chatResponseText(payload);
  if (!content) throw new Error('GPT-5.5 returned an empty response.');
  return parseAssistantJson(content);
}

function publicChatRecord(record) {
  const safe = ensureInquiryMessages(record);
  const safeQuote = quote => publicQuote(quote);
  return {
    id: safe.id,
    status: safe.status,
    quote: safeQuote(safe.quotes?.find(quote => quote.id === safe.active_quote_id) || safe.quotes?.[0]),
    messages: safe.messages.map(message => ({
      id: message.id,
      role: message.role,
      text: message.text,
      kind: message.kind || 'text',
      quote: safeQuote(message.quote),
      created_at: message.created_at
    }))
  };
}

function normalizeQuote(payload = {}, inquiry, id = operationId('quote')) {
  const quantity = Math.max(1, Number(payload.quantity || inquiry?.wheel_specs?.quantity || 4) || 4);
  const unitPrice = Math.max(0, Number(payload.unit_price ?? payload.display_price ?? inquiry?.product_display_price ?? 0) || 0);
  const shippingFee = Math.max(0, Number(payload.shipping_fee || 0) || 0);
  const subtotal = Number((unitPrice * quantity).toFixed(2));
  const total = Number((subtotal + shippingFee).toFixed(2));
  if (!unitPrice || !total) throw new Error('报价必须包含大于 0 的展示单价。');
  return {
    id,
    inquiry_id: inquiry.id,
    status: 'sent',
    currency: 'USD',
    product_id: textValue(payload.product_id || inquiry.product_id, 80),
    product_name: textValue(payload.product_name || inquiry.product_name || inquiry.product_id, 160),
    product_image: textValue(payload.product_image || inquiry.product_image, 1000),
    product_category: textValue(payload.product_category || inquiry.product_category, 80),
    product_finish: textValue(payload.product_finish || inquiry.product_finish, 80),
    cost_price: Math.max(0, Number(payload.cost_price || 0) || 0),
    unit_price: unitPrice,
    quantity,
    subtotal,
    shipping_fee: shippingFee,
    total,
    logistics_method: textValue(payload.logistics_method || 'DHL / FedEx international delivery', 120),
    production_time_days: Math.max(0, Number(payload.production_time_days || 0) || 0),
    shipping_estimate_days: Math.max(0, Number(payload.shipping_estimate_days || 0) || 0),
    expires_at: textValue(payload.expires_at, 40),
    note: textValue(payload.note, 1000),
    official_wheel_specs: normalizeInquirySpecs(inquiry.official_wheel_specs),
    customer_wheel_specs: normalizeInquirySpecs(inquiry.wheel_specs),
    vehicle_selection: normalizeVehicleSelection(inquiry.vehicle_selection),
    payment_provider: 'paypal',
    payment_status: 'unpaid',
    payment_token: randomUUID(),
    paypal_order_id: '',
    paypal_approval_url: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

function quoteMessageText(quote) {
  return `F-Box quotation: ${quote.product_name} × ${quote.quantity}. Total ${quote.currency} ${quote.total.toFixed(2)}. ${quote.logistics_method}.`;
}

function publicQuote(quote) {
  if (!quote) return null;
  const { cost_price, payment_token, paypal_order_id, paypal_approval_url, ...safe } = quote;
  return { ...safe, checkout_token: payment_token || '', payment_ready: quote.payment_status !== 'paid' };
}

function paypalApiBase(mode = defaultPayPalMode) {
  return mode === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function paypalAccessToken(config) {
  if (!config.paypal_client_id || !config.paypal_client_secret) throw new Error('PayPal 尚未配置 Client ID 和 Client Secret。');
  const response = await fetch(`${paypalApiBase(config.paypal_mode)}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.paypal_client_id}:${config.paypal_client_secret}`).toString('base64')}`,
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials',
    signal: AbortSignal.timeout(20_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || `PayPal 鉴权失败（${response.status}）。`);
  return payload.access_token;
}

async function paypalRequest(config, endpoint, options = {}) {
  const token = await paypalAccessToken(config);
  const response = await fetch(`${paypalApiBase(config.paypal_mode)}${endpoint}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(30_000)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.message || payload?.details?.[0]?.description || `PayPal 请求失败（${response.status}）。`);
  return payload;
}

async function createPayPalOrder(config, quote, origin) {
  if (!quote || Number(quote.total || 0) <= 0) throw new Error('报价金额无效。');
  const returnUrl = `${origin}/?paypal_quote=${encodeURIComponent(quote.id)}&paypal_token=${encodeURIComponent(quote.payment_token)}`;
  const cancelUrl = `${origin}/?paypal_cancel=${encodeURIComponent(quote.id)}`;
  const payload = await paypalRequest(config, '/v2/checkout/orders', {
    method: 'POST',
    headers: { 'PayPal-Request-Id': `fbox-${quote.id}` },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: quote.id,
        description: `${quote.product_name} × ${quote.quantity}`.slice(0, 127),
        amount: { currency_code: 'USD', value: Number(quote.total).toFixed(2) }
      }],
      application_context: { brand_name: 'F-Box', user_action: 'PAY_NOW', return_url: returnUrl, cancel_url: cancelUrl }
    })
  });
  const approval = Array.isArray(payload.links) ? payload.links.find(link => link.rel === 'approve')?.href : '';
  if (!payload.id || !approval) throw new Error('PayPal 未返回付款跳转地址。');
  return { id: payload.id, approval_url: approval };
}

async function capturePayPalOrder(config, orderId) {
  return paypalRequest(config, `/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
    method: 'POST',
    headers: { 'PayPal-Request-Id': `fbox-capture-${orderId}` },
    body: JSON.stringify({})
  });
}

async function isAdminRequest(req) {
  await ensureAdminSessionsLoaded();
  const authorization = String(req.headers.authorization || '').trim();
  const token = authorization.replace(/^Bearer\s+/i, '').trim() || String(req.headers['x-fbox-admin-token'] || '').trim();
  if (token) {
    const session = adminSessions.get(token);
    if (session && session.expires_at > Date.now()) return true;
    if (session) {
      adminSessions.delete(token);
      await saveAdminSessions();
    }
  }
  const verifyUrl = String(process.env.FBOX_ADMIN_AUTH_URL || '').trim();
  if (!verifyUrl || !authorization) return false;
  try {
    const response = await fetch(verifyUrl, { headers: { Authorization: authorization, Accept: 'application/json' }, signal: AbortSignal.timeout(8_000) });
    const payload = await response.json().catch(() => ({}));
    return response.ok && payload.code === 200;
  } catch {
    return false;
  }
}

function publicAdminUser() {
  return {
    username: adminUsername(),
    icon: '',
    roles: ['super-admin'],
    menus: []
  };
}

export async function handleFBoxStoreApi(req, res, url) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const pathName = url.pathname.replace(/\/$/, '');
  const data = await loadStore();
  await ensureCustomerSessionsLoaded();
  const geo = await geoForRequest(req);

  if (req.method === 'GET' && pathName === '/api/fbox-store/products') {
    const query = textValue(url.searchParams.get('q'), 120).toLowerCase();
    const category = textValue(url.searchParams.get('category'), 80);
    const products = sortProductsForDisplay(data.products.filter(item => item.status === 'published' && (!category || item.category === category) && (!query || [item.name, item.brand, item.part, item.meta].some(value => String(value || '').toLowerCase().includes(query)))));
    return json(res, 200, { code: 200, data: products, meta: { total: products.length } });
  }

  if (req.method === 'POST' && pathName === '/api/fbox-store/auth/register') {
    try {
      const payload = await readJson(req, 64 * 1024);
      const username = textValue(payload.username, 80);
      const password = String(payload.password || '');
      const email = textValue(payload.email, 160).toLowerCase();
      const telephone = textValue(payload.telephone || payload.phone, 60);
      const company = textValue(payload.company, 120);
      if (!username || password.length < 6) return json(res, 422, { detail: 'Username and a password of at least 6 characters are required.' });
      if (data.accounts.some(account => account.username.toLowerCase() === username.toLowerCase() || (email && account.email?.toLowerCase() === email))) return json(res, 409, { detail: 'This F-Box account already exists.' });
      const now = new Date().toISOString();
      const account = {
        id: operationId('customer'),
        username,
        email,
        telephone,
        company,
        country: geo.country,
        country_code: geo.country_code,
        signup_ip: geo.ip,
        password_hash: hashCustomerPassword(password),
        wishlist: [],
        cart: [],
        created_at: now,
        last_login_at: now
      };
      data.accounts.push(account);
      await saveStore(data);
      await recordAnalyticsEvent(req, { type: 'register', customer_id: account.id, geo });
      const token = `fbox_customer_${randomUUID()}`;
      customerSessions.set(token, { accountId: account.id, createdAt: Date.now() });
      await saveCustomerSessions();
      return json(res, 200, { code: 200, data: { tokenHead: 'Bearer ', token, member: publicCustomer(account) } });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || 'F-Box account registration failed.' }); }
  }

  if (req.method === 'POST' && pathName === '/api/fbox-store/auth/login') {
    try {
      const payload = await readJson(req, 64 * 1024);
      const identity = textValue(payload.username || payload.email, 160).toLowerCase();
      const account = data.accounts.find(item => item.username.toLowerCase() === identity || (item.email && item.email.toLowerCase() === identity));
      if (!account || account.password_hash !== hashCustomerPassword(payload.password)) return json(res, 401, { detail: 'Invalid F-Box account or password.' });
      const token = `fbox_customer_${randomUUID()}`;
      customerSessions.set(token, { accountId: account.id, createdAt: Date.now() });
      account.last_login_at = new Date().toISOString();
      if (!account.country && geo.country) { account.country = geo.country; account.country_code = geo.country_code; }
      await saveStore(data);
      await saveCustomerSessions();
      await recordAnalyticsEvent(req, { type: 'login', customer_id: account.id, geo });
      return json(res, 200, { code: 200, data: { tokenHead: 'Bearer ', token, member: publicCustomer(account) } });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || 'F-Box account login failed.' }); }
  }

  if (req.method === 'GET' && pathName === '/api/fbox-store/auth/info') {
    const session = currentCustomer(req);
    if (!session) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    const account = data.accounts.find(item => item.id === session.accountId);
    return account ? json(res, 200, { code: 200, data: { member: publicCustomer(account) } }) : json(res, 401, { detail: 'F-Box account was not found.' });
  }

  if (req.method === 'POST' && pathName === '/api/fbox-store/auth/logout') {
    const token = customerToken(req);
    if (token && customerSessions.delete(token)) await saveCustomerSessions();
    return json(res, 200, { code: 200, data: { signed_out: true } });
  }

  if (req.method === 'PUT' && pathName === '/api/fbox-store/auth/profile') {
    const session = currentCustomer(req);
    if (!session) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    try {
      const payload = await readJson(req, 64 * 1024);
      const account = data.accounts.find(item => item.id === session.accountId);
      if (!account) return json(res, 401, { detail: 'F-Box account was not found.' });
      if (hasOwn(payload, 'username')) account.username = textValue(payload.username, 80) || account.username;
      if (hasOwn(payload, 'telephone')) account.telephone = textValue(payload.telephone, 60);
      if (hasOwn(payload, 'company')) account.company = textValue(payload.company, 120);
      if (hasOwn(payload, 'email')) account.email = textValue(payload.email, 160).toLowerCase();
      await saveStore(data);
      return json(res, 200, { code: 200, data: { member: publicCustomer(account) } });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || 'F-Box profile update failed.' }); }
  }

  const customer = currentCustomer(req);
  if (pathName === '/api/fbox-store/wishlist' && req.method === 'GET') {
    if (!customer) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    const account = data.accounts.find(item => item.id === customer.accountId);
    return json(res, 200, { code: 200, data: (account?.wishlist || []).map(product_id => ({ product_id })) });
  }
  if (pathName === '/api/fbox-store/wishlist' && req.method === 'POST') {
    if (!customer) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    const payload = await readJson(req, 64 * 1024);
    if (!storeProduct(data, payload.product_id)) return json(res, 404, { detail: 'Product not found.' });
    const account = data.accounts.find(item => item.id === customer.accountId);
    account.wishlist ||= [];
    if (!account.wishlist.includes(String(payload.product_id))) account.wishlist.push(String(payload.product_id));
    await saveStore(data);
    return json(res, 200, { code: 200, data: { saved: true } });
  }
  const wishlistMatch = pathName.match(/^\/api\/fbox-store\/wishlist\/([^/]+)$/);
  if (wishlistMatch && req.method === 'DELETE') {
    if (!customer) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    const account = data.accounts.find(item => item.id === customer.accountId);
    account.wishlist = (account.wishlist || []).filter(product_id => product_id !== decodeURIComponent(wishlistMatch[1]));
    await saveStore(data);
    return json(res, 200, { code: 200, data: { saved: false } });
  }

  if (pathName === '/api/fbox-store/cart' && req.method === 'GET') {
    if (!customer) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    const account = data.accounts.find(item => item.id === customer.accountId);
    return json(res, 200, { code: 200, data: { items: account?.cart || [] } });
  }
  if (pathName === '/api/fbox-store/cart/items' && req.method === 'POST') {
    if (!customer) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    const payload = await readJson(req, 64 * 1024);
    const product_id = textValue(payload.product_id, 100);
    if (!storeProduct(data, product_id)) return json(res, 404, { detail: 'Product not found.' });
    const account = data.accounts.find(item => item.id === customer.accountId);
    account.cart ||= [];
    const existing = account.cart.find(item => item.product_id === product_id);
    if (existing) existing.quantity = Math.max(1, Number(existing.quantity || 1) + Number(payload.quantity || 1));
    else account.cart.push({ id: operationId('cart'), product_id, quantity: Math.max(1, Number(payload.quantity || 1)) });
    await saveStore(data);
    return json(res, 200, { code: 200, data: { items: account.cart } });
  }
  const cartItemMatch = pathName.match(/^\/api\/fbox-store\/cart\/items\/([^/]+)$/);
  if (cartItemMatch && ['PUT', 'DELETE'].includes(req.method)) {
    if (!customer) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    const product_id = decodeURIComponent(cartItemMatch[1]);
    const account = data.accounts.find(item => item.id === customer.accountId);
    account.cart ||= [];
    if (req.method === 'DELETE') account.cart = account.cart.filter(item => item.product_id !== product_id);
    else {
      const payload = await readJson(req, 64 * 1024);
      const item = account.cart.find(row => row.product_id === product_id);
      if (item) item.quantity = Math.max(1, Number(payload.quantity || 1));
    }
    await saveStore(data);
    return json(res, 200, { code: 200, data: { items: account.cart } });
  }

  if (pathName === '/api/fbox-store/orders' && req.method === 'GET') {
    if (!customer) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    return json(res, 200, { code: 200, data: data.orders.filter(order => order.customer_id === customer.accountId).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))) });
  }
  if (pathName === '/api/fbox-store/orders' && req.method === 'POST') {
    if (!customer) return json(res, 401, { detail: 'F-Box customer authentication is required.' });
    try {
      const payload = await readJson(req, 128 * 1024);
      const account = data.accounts.find(item => item.id === customer.accountId);
      const items = Array.isArray(payload.items) && payload.items.length ? payload.items.map(item => ({ product_id: textValue(item.product_id, 100), quantity: Math.max(1, Number(item.quantity || 1)) })) : (account?.cart || []).map(item => ({ product_id: item.product_id, quantity: item.quantity }));
      if (!items.length || items.some(item => !storeProduct(data, item.product_id))) return json(res, 422, { detail: 'The order has no valid F-Box products.' });
      const total = orderTotal(data, items);
      const order = { id: operationId('order'), orderSn: `FBOX${Date.now()}`, customer_id: customer.accountId, customer: payload.customer || {}, shipping: payload.shipping || {}, items, productName: items.length === 1 ? storeProduct(data, items[0].product_id).name : `${items.length} F-Box items`, totalAmount: total, payAmount: total, currency: 'USD', status: 0, status_label: 'pending_payment', payment_provider: 'paypal', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      data.orders.push(order);
      account.cart = [];
      await saveStore(data);
      return json(res, 200, { code: 200, data: { order } });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || 'F-Box order creation failed.' }); }
  }

  return json(res, 404, { detail: 'F-Box store endpoint not found.' });
}

export async function handleFBoxAuthApi(req, res, url) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const pathName = url.pathname.replace(/\/$/, '');
  const isLogin = pathName === '/api/admin/login' || pathName === '/api/fbox-auth/login';
  const isInfo = pathName === '/api/admin/info' || pathName === '/api/fbox-auth/info';
  const isLogout = pathName === '/api/admin/logout' || pathName === '/api/fbox-auth/logout';
  if (isLogin && req.method === 'POST') {
    const payload = await readJson(req, 64 * 1024).catch(() => ({}));
    if (!adminPassword() || String(payload.username || '').trim() !== adminUsername() || String(payload.password || '') !== adminPassword()) {
      return json(res, 401, { code: 401, message: '管理员账号或密码错误。' });
    }
    const token = await createAdminSession();
    return json(res, 200, { code: 200, message: '登录成功', data: { tokenHead: 'Bearer ', token } });
  }
  if (isInfo && req.method === 'GET') {
    if (!(await isAdminRequest(req))) return json(res, 401, { code: 401, message: '管理员登录已失效。' });
    return json(res, 200, { code: 200, data: publicAdminUser() });
  }
  if (isLogout && req.method === 'POST') {
    const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '').trim();
    await revokeAdminSession(token);
    return json(res, 200, { code: 200, message: '已退出登录' });
  }
  return json(res, 404, { code: 404, message: 'F-Box authentication endpoint not found.' });
}

function legacyFixedPrompt(payload, angle) {
  return `You are the F-Box photorealistic vehicle visualization worker.\n\nCreate one realistic automotive photograph showing the selected F-Box wheel installed on the user's actual vehicle. The uploaded vehicle photo is the primary identity and geometry reference. The selected wheel reference image is authoritative for the exact wheel design and finish. The fitment data is authoritative: ${payload.product_fitment}.\n\nSelected product: ${payload.product_name} (${payload.product_finish}); product id: ${payload.product_id}. Required view: ${angle}.\n\nHard requirements:\n- Preserve the actual vehicle identity, body panels, paint, trim, badges, glass, lights, mirrors, wheel arches, tire sidewalls, environment and camera realism.\n- Install the exact wheel from the reference image. Do not invent spokes, alter spoke count, change the lip or concavity, replace the center cap, change the finish or add unrelated hardware.\n- Make the installation physically plausible and seamless: correct scale inside the arch, natural perspective, elliptic foreshortening, hub centering, tire contact patch, brake/caliper occlusion, wheel-well shadow, reflections and matching light.\n- Match the vehicle suspension height and stance. Never create floating wheels, doubled tires, disconnected hubs, impossible tire stretch or incorrect axle depth.\n- Keep the final image photographic. No AI-looking edges, warped spokes, melted lug holes, duplicated body parts, text, extra cars, logos, watermark, illustration, CGI showroom look or halo.\n- Preserve the original camera intent and scene composition. Make only the minimum change needed to install the selected wheel.\n\nReturn one clean 3:2 image with no explanatory text inside the image.`;
}

function fixedPrompt(payload, angle) {
  const category = String(payload.product_category || 'Wheels');
  const isWheel = category === 'Wheels';
  const finish = String(payload.product_finish || 'the selected product finish');
  const hasProductReference = Boolean(payload.product_image);
  const referenceInstruction = hasProductReference
    ? 'Use the attached product image only as a reference for the selected product. It never overrides the uploaded vehicle photo or the edit boundaries below.'
    : 'No reliable product photo is attached for this brake component. Use the written product specification and finish as authoritative, and do not invent or modify any unrelated vehicle part.';
  let targetInstruction = '';
  let lockedInstruction = '';
  if (isWheel) {
    targetInstruction = 'Install the exact selected wheel from the product reference image. Preserve the selected wheel design, spoke count, lip, concavity, center cap, finish and proportions.';
    lockedInstruction = 'The only intended change is the wheel installation. Keep the vehicle body, paint, tires, brake calipers, rotors, suspension, badges, lights, environment and camera perspective unchanged.';
  } else if (category === 'Calipers') {
    targetInstruction = `Replace only the visible brake caliper body behind the vehicle's ORIGINAL wheels with the selected F-Box ${payload.product_name || 'caliper kit'}. The required caliper finish is ${finish}; render it as the specified finish exactly. For this request, Ceramic White means a clean white/ceramic-white caliper, never black, red, blue or gray.`;
    lockedInstruction = 'This is a localized brake-caliper edit, not a wheel redesign. Keep the original wheel spokes, wheel face, wheel barrel, center cap, lug nuts, tires, tire sidewalls, brake rotors, hubs, vehicle body, paint, suspension, badges, lights, environment and camera perspective unchanged. Do not recolor or replace the wheels.';
  } else if (category === 'Rotors') {
    targetInstruction = `Replace or show only the brake rotor specified by ${payload.product_name || 'the selected rotor'} behind the vehicle's ORIGINAL wheel, respecting the stated specification and finish ${finish}.`;
    lockedInstruction = 'Keep the original wheel design, wheel finish, calipers, pads, tires, body, suspension, environment and camera perspective unchanged. Do not turn the wheel or caliper into the product.';
  } else {
    targetInstruction = `Show only the selected brake-pad application, ${payload.product_name || 'the selected brake pads'}, in its physically correct location. Treat the stated finish ${finish} as product metadata, not as a reason to recolor the wheel or caliper.`;
    lockedInstruction = 'Keep the original wheel, caliper, rotor, tire, body, suspension, environment and camera perspective unchanged. Brake pads may be partly or completely hidden; never invent a visible colored component.';
  }
  return `You are the F-Box photorealistic vehicle visualization worker.\n\nPerform a restrained, localized edit of the user's uploaded vehicle photograph. The uploaded vehicle photo is the ground truth for vehicle identity, geometry, wheel design, wheel finish and camera perspective. Do not redesign the car. The fitment data is authoritative: ${payload.product_fitment || 'application-specific fitment'}.\n\nSelected product: ${payload.product_name || 'F-Box performance part'}; category: ${category}; finish: ${finish}; product id: ${payload.product_id || 'not provided'}; required view: ${angle}.\n\n${referenceInstruction}\n\nHard requirements:\n- ${targetInstruction}\n- ${lockedInstruction}\n- Treat the product category as a strict mask: edit only the product's physical location and nothing outside that mask.\n- Make the installation physically plausible: correct scale, axle position, perspective, occlusion, shadows, reflections, brake clearance and tire contact.\n- If any attached product image shows a wheel while the selected category is a brake component, ignore the wheel content completely; it is not an instruction to change the vehicle's wheels.\n- Never change the vehicle's wheel color, wheel spoke pattern, wheel size, tire, body panels, paint, trim, badges, lights or background while editing a brake component.\n- Keep the final image photographic and clean: no AI-looking edges, warped spokes, melted hardware, duplicated parts, text, extra cars, logos, watermark, illustration, CGI showroom look or halo.\n- Preserve the original camera intent and scene composition. Make the minimum pixel-area change needed to show the selected product.\n\nReturn one clean 3:2 image with no explanatory text inside the image.`;
}

function wheelSwapPrompt(payload, angle) {
  const cameraInstruction = angle === 'front-left three-quarter view'
    ? 'CAMERA 1 / FRONT-LEFT THREE-QUARTER: place the camera outside the front-left corner of the vehicle at approximately 35–45 degrees from the nose. Show the front face, left side, front-left wheel and enough of the rear-left quarter. This must be a materially different composition from a right-front or side-profile view.'
    : angle === 'front-right three-quarter view'
      ? 'CAMERA 2 / FRONT-RIGHT THREE-QUARTER: place the camera outside the front-right corner of the vehicle at approximately 35–45 degrees from the nose. Show the front face, right side, front-right wheel and enough of the rear-right quarter. Mirror the vehicle side and perspective from the left-front view; do not reuse the same composition.'
      : 'CAMERA 3 / FULL SIDE PROFILE: place the camera perpendicular to the vehicle side at a true 85–90 degree side angle and a natural vehicle-height viewpoint. Show the complete side silhouette and both visible wheels in profile. Do not return another front three-quarter view.';
  return `You are the F-Box photorealistic wheel-installation worker. Create one realistic automotive photograph for the requested view: ${angle}.

ATTACHED IMAGE ORDER IS STRICT AND MUST NOT BE REINTERPRETED:
- IMAGE 1 / FIRST ATTACHED IMAGE = the user's actual vehicle photo. This is the ground-truth car identity, body, paint, tires, existing wheels, brakes and environment. Use its camera perspective as a visual reference only; the requested camera position below must override the source composition.
- IMAGE 2 / SECOND ATTACHED IMAGE = the selected F-Box wheel product reference. This is the wheel that must be installed on the vehicle in IMAGE 1.

PRIMARY TASK:
Replace the wheel or wheels currently visible on IMAGE 1 with the exact wheel shown in IMAGE 2. Put the IMAGE 2 wheel in the original wheel locations on the vehicle from IMAGE 1. This is a wheel replacement / fitment edit, not a collage, overlay, floating product shot or new-car generation.

PRODUCT CONTEXT: ${payload.product_name || 'F-Box selected wheel'}; finish: ${payload.product_finish || 'the finish shown in IMAGE 2'}; fitment: ${payload.product_fitment || 'application-specific fitment'}; requested view: ${angle}.

MANDATORY CAMERA DIRECTION:
${cameraInstruction}
The three requested outputs must be genuinely different camera views, not three crops, color variations or near-duplicates of IMAGE 1. Preserve the same vehicle identity, wheel design and scene realism while changing the camera position and visible vehicle surfaces according to the requested view.

NON-NEGOTIABLE EDIT RULES:
- Use IMAGE 1 as the car identity and IMAGE 2 as the exact wheel design reference.
- Preserve the IMAGE 2 wheel's spoke count, spoke shape, wheel face, lip, concavity, center cap, lug-hole layout, finish, color and proportions. Do not invent a different wheel.
- REFERENCE FIDELITY LOCK: treat the wheel in IMAGE 2 as immutable product geometry. The installed wheel must be the same make/model and the same visual design as IMAGE 2, not a similar or AI-interpreted wheel.
- Preserve the exact outer silhouette, spoke topology, spoke thickness, negative-space pattern, rim lip, barrel depth, center-cap shape/mark, lug-hole arrangement, machining lines and all visible design details from IMAGE 2.
- Preserve the intrinsic product color and surface finish from IMAGE 2 exactly. Do not turn it black, silver, gray, bronze, gold, red, blue, chrome or matte/gloss unless that exact appearance is already present in IMAGE 2. Scene lighting may add realistic highlights and shadows, but it must never change the wheel's base hue or finish.
- The only allowed changes to the IMAGE 2 wheel are physically necessary installation changes: perspective, foreshortening, scale, partial occlusion by the tire/body/brakes, contact shadow and reflections from the scene. Never redesign, recolor, simplify, add, remove or morph any part of the wheel.
- Install the wheel at the original hub centers with correct diameter, width, offset, perspective, elliptic foreshortening, tire contact, wheel-arch depth, brake clearance, shadows, reflections and lighting.
- Keep the original tires, tire sidewalls, body panels, paint, trim, badges, lights, mirrors, windows, suspension height, brake calipers, brake rotors, hubs, environment and scene style unchanged. The camera framing and visible vehicle surfaces must change according to the mandatory camera direction; do not lock the output to IMAGE 1's original viewpoint.
- Do not recolor the calipers. Do not recolor the original vehicle. Do not replace the tire. Do not change the car model. Do not alter the background.
- The wheel from IMAGE 2 must visibly replace the original wheel in IMAGE 1. Never leave the original wheel unchanged and never place the product beside the car.
- Before returning the image, compare every visible wheel against IMAGE 2. If the spoke layout, silhouette, color, center cap or finish does not match IMAGE 2, correct it before returning the result.
- If the product metadata mentions brake pads, calipers or rotors, the default visualizer task remains this explicit IMAGE 1 vehicle + IMAGE 2 wheel replacement. Product metadata must never override the two-image order.
- Output a natural, seamless, photorealistic result with no AI-looking edges, warped spokes, melted lug holes, doubled wheels, duplicated tires, floating wheels, halos, text, logo, watermark, illustration or CGI showroom appearance.
- Make the minimum product change needed to install the exact wheel, but allow the full camera repositioning and re-composition required by the requested view. Do not preserve IMAGE 1's composition when it conflicts with the requested camera direction.

Return one clean 3:2 image with no explanatory text inside the image.`;
}
function imageFromPayload(payload) {
  const values = [];
  const add = value => {
    if (!value) return;
    if (typeof value === 'string') values.push(value);
    else if (Array.isArray(value)) value.forEach(add);
    else if (typeof value === 'object') {
      add(value.url || value.image_url || value.b64_json || value.result_url);
      add(value.data);
      add(value.output);
      add(value.result);
    }
  };
  add(payload?.result_url);
  add(payload?.url);
  add(payload?.data);
  add(payload?.result);
  return values[0] || '';
}

function taskIdFromPayload(payload) {
  if (payload?.task_id !== undefined && payload?.task_id !== null) return String(payload.task_id);
  if (payload?.data && !Array.isArray(payload.data) && payload.data.task_id !== undefined) return String(payload.data.task_id);
  return '';
}

async function pollProviderTask(config, taskId) {
  const pollIntervalMs = 4000;
  const deadline = Date.now() + 360000;
  while (Date.now() < deadline) {
    await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    const url = new URL(`${config.endpoint}/media/status`);
    url.searchParams.set('task_id', taskId);
    const remainingMs = Math.max(5000, Math.min(15_000, deadline - Date.now()));
    let response;
    try {
      response = await fetch(url, { headers: { Authorization: `Bearer ${config.api_key}`, Accept: 'application/json' }, signal: AbortSignal.timeout(remainingMs) });
    } catch (error) {
      if (Date.now() < deadline) continue;
      throw new Error('LingkeAI image status polling timed out.');
    }
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('LingkeAI could not read the image task status.');
    const imageUrl = imageFromPayload(payload);
    if (payload.is_final === true) {
      if (payload.state === 'success' && imageUrl) return imageUrl;
      const providerError = typeof payload.error === 'string' ? payload.error : payload.error?.message;
      throw new Error(providerError || 'LingkeAI image generation failed.');
    }
  }
  throw new Error('LingkeAI image generation timed out.');
}

async function createProviderTask(config, payload, angle) {
  const response = await fetch(`${config.endpoint}/media/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.api_key}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt: wheelSwapPrompt(payload, angle),
      params: {
        aspect_ratio: '3:2',
        images: [payload.vehicle_image, ...(payload.product_image ? [payload.product_image] : [])],
        n: 1,
        quality: 'auto',
        resolution: '1K',
        response_format: 'url',
        size: 'auto'
      }
    }),
    signal: AbortSignal.timeout(60_000)
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error('LingkeAI rejected the F-Box image request.');
  const immediate = imageFromPayload(result);
  if (immediate) return immediate;
  const taskId = taskIdFromPayload(result);
  if (!taskId) throw new Error('LingkeAI returned no image task id.');
  return pollProviderTask(config, taskId);
}

async function runJob(jobId, payload) {
  const job = jobs.get(jobId);
  if (!job) return;
  job.status = 'running';
  const operations = await loadOperations();
  const persistedJob = operations.jobs.find(item => item.id === jobId || item.job_id === jobId);
  if (persistedJob) {
    persistedJob.status = 'running';
    persistedJob.updated_at = new Date().toISOString();
    await saveOperations(operations);
  }
  try {
    const config = await loadConfig();
    if (!config.api_key) throw new Error('F-Box image routing is not configured. Open /admin and save the LingkeAI API key first.');
    const angleSpecs = [
      ['front-left', 'front-left three-quarter view'],
      ['front-right', 'front-right three-quarter view'],
      ['side-profile', 'full side profile view']
    ];
    const results = [];
    for (const [id, angle] of angleSpecs) {
      results.push({ id, angle, image_url: await createProviderTask(config, payload, angle) });
    }
    job.status = 'succeeded';
    job.mode = 'fbox-lingkeai';
    job.results = results;
    if (persistedJob) {
      persistedJob.status = 'succeeded';
      persistedJob.mode = job.mode;
      persistedJob.results = results;
      persistedJob.updated_at = new Date().toISOString();
      await saveOperations(operations);
    }
  } catch (error) {
    job.status = 'failed';
    job.message = error?.message || 'The F-Box image route could not finish this preview.';
    if (persistedJob) {
      persistedJob.status = 'failed';
      persistedJob.message = job.message;
      persistedJob.updated_at = new Date().toISOString();
      await saveOperations(operations);
    }
  } finally {
    job.updated_at = Date.now();
  }
}

function pruneJobs() {
  const cutoff = Date.now() - jobTtlMs;
  for (const [id, job] of jobs) if (job.created_at < cutoff) jobs.delete(id);
}

export async function handleFBoxAdminApi(req, res, url) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  if (!(await isAdminRequest(req))) return json(res, 401, { detail: 'F-Box admin authentication is required.' });
  if (req.method === 'GET' && (url.pathname === '/api/fbox-admin/status' || url.pathname === '/api/fbox-admin/status/')) {
    return json(res, 200, { data: publicStatus(await loadConfig()) });
  }
  if (req.method === 'GET' && (url.pathname === '/api/fbox-admin/settings' || url.pathname === '/api/fbox-admin/settings/')) {
    return json(res, 200, { data: (await loadConfig()).storefront });
  }
  if (req.method === 'PUT' && (url.pathname === '/api/fbox-admin/settings' || url.pathname === '/api/fbox-admin/settings/')) {
    try { return json(res, 200, { data: await saveStorefrontSettings(await readJson(req, 2 * 1024 * 1024)) }); }
    catch (error) { return json(res, error.status || 422, { detail: error.message || 'F-Box system settings could not be saved.' }); }
  }
  if (req.method === 'PUT' && (url.pathname === '/api/fbox-admin/config' || url.pathname === '/api/fbox-admin/config/')) {
    try { return json(res, 200, { data: await saveConfig(await readJson(req, 2 * 1024 * 1024)) }); }
    catch (error) { return json(res, error.status || 502, { detail: error.message || 'The F-Box route could not be configured.' }); }
  }
  return json(res, 404, { detail: 'F-Box admin endpoint not found.' });
}

export async function handleWheelVisualizerApi(req, res, url) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const match = url.pathname.match(/^\/api\/wheel-visualizer\/jobs(?:\/([^/]+))?\/?$/);
  if (!match) return json(res, 404, { detail: 'F-Box visualizer endpoint not found.' });
  if (req.method === 'POST' && !match[1]) {
    try {
      const payload = await readJson(req);
      if (!String(payload.vehicle_image || '').startsWith('data:image/')) throw new Error('Upload a vehicle image first.');
      if (!String(payload.product_image || '').startsWith('data:image/')) throw new Error('Select a product reference image first.');
      parseImageDataUrl(payload.vehicle_image, '车辆图片');
      parseImageDataUrl(payload.product_image, '产品参考图片');
      const store = await loadStore();
      const selectedProduct = store.products.find(item => item.id === textValue(payload.product_id, 80));
      const visualizerEnabled = selectedProduct ? selectedProduct.visualizer_enabled !== false : true;
      const dynamicWheelEffect = selectedProduct ? selectedProduct.dynamic_wheel_effect !== false : true;
      const visualizerMode = textValue(selectedProduct?.visualizer_mode || 'dynamic-wheel', 40) || 'dynamic-wheel';
      const config = await loadConfig();
      if (!config.api_key) return json(res, 503, { detail: 'F-Box image routing is not configured. Open /admin and save the LingkeAI API key first.' });
      const jobId = `fbox_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      const now = new Date().toISOString();
      jobs.set(jobId, { job_id: jobId, status: 'queued', mode: 'fbox-lingkeai', results: [], visualizer_enabled: visualizerEnabled, dynamic_wheel_effect: dynamicWheelEffect, visualizer_mode: visualizerMode, created_at: Date.now(), updated_at: Date.now() });
      const operations = await loadOperations();
      operations.jobs.unshift({
        id: jobId,
        job_id: jobId,
        status: 'queued',
        mode: 'fbox-lingkeai',
        product_id: textValue(payload.product_id, 80),
        product_name: textValue(payload.product_name, 120),
        product_category: textValue(payload.product_category, 80),
        product_finish: textValue(payload.product_finish, 80),
        product_fitment: textValue(payload.product_fitment, 240),
        visualizer_enabled: visualizerEnabled,
        dynamic_wheel_effect: dynamicWheelEffect,
        visualizer_mode: visualizerMode,
        vehicle_name: textValue(payload.vehicle_name || payload.vehicle_label, 160),
        vehicle_file_name: textValue(payload.vehicle_file_name || payload.vehicle_name, 180),
        angles: 3,
        results: [],
        created_at: now,
        updated_at: now,
        admin_note: ''
      });
      operations.jobs = operations.jobs.slice(0, 300);
      await saveOperations(operations);
      await recordAnalyticsEvent(req, { type: 'click', path: '/visualizer', title: 'AI visualizer job', product_id: payload.product_id, product_name: payload.product_name, customer_id: analyticsCustomerId(req), meta: { action: 'visualizer-job' } });
      void runJob(jobId, payload);
      return json(res, 202, { data: { job_id: jobId, status: 'queued', mode: 'fbox-lingkeai', visualizer_enabled: visualizerEnabled, dynamic_wheel_effect: dynamicWheelEffect, visualizer_mode: visualizerMode, results: [] } });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || 'Invalid visualizer request.' }); }
  }
  if (req.method === 'GET' && match[1]) {
    pruneJobs();
    const job = jobs.get(match[1]);
    if (!job) return json(res, 404, { detail: 'The visualizer job was not found.' });
    const response = { job_id: job.job_id, status: job.status, mode: job.mode, visualizer_enabled: job.visualizer_enabled !== false, dynamic_wheel_effect: job.dynamic_wheel_effect !== false, visualizer_mode: job.visualizer_mode || 'dynamic-wheel', results: job.results };
    if (job.status === 'failed') response.message = job.message;
    return json(res, 200, { data: response });
  }
  return json(res, 405, { detail: 'Method not allowed.' });
}

async function requireOperationsAdmin(req, res) {
  if (await isAdminRequest(req)) return true;
  json(res, 401, { detail: 'F-Box admin authentication is required.' });
  return false;
}

function sortNewest(records) {
  return records.slice().sort((a, b) => String(b.updated_at || b.created_at).localeCompare(String(a.updated_at || a.created_at)));
}

export async function handleFBoxOperationsApi(req, res, url) {
  if (req.method === 'OPTIONS') return json(res, 204, {});
  const pathName = url.pathname.replace(/\/$/, '');
  const isAdminPath = pathName.startsWith('/api/fbox-ops');

  if (!isAdminPath) {
    if (req.method === 'GET' && pathName === '/api/fbox-content/vehicles') {
      const data = await loadOperations();
      const library = await buildVehicleLibrary(data);
      const year = Number(url.searchParams.get('year') || 0);
      const make = textValue(url.searchParams.get('make'), 60);
      const model = textValue(url.searchParams.get('model'), 80);
      const trim = textValue(url.searchParams.get('trim'), 80);
      const activeVehicles = library.filter(item => item.status === 'active');
      const filtered = activeVehicles.filter(item =>
        (!year || Number(item.year) === year)
        && (!make || item.make === make)
        && (!model || item.model === model)
        && (!trim || item.trim === trim)
      );
      const populatedSpecs = activeVehicles.filter(item => item.oem_wheel_specs && (item.oem_wheel_specs.diameter || item.oem_wheel_specs.pcd || item.oem_wheel_specs.center_bore)).length;
      const verifiedSpecs = activeVehicles.filter(item => item.spec_status === 'verified' && item.oem_wheel_specs && (item.oem_wheel_specs.diameter || item.oem_wheel_specs.pcd || item.oem_wheel_specs.center_bore)).length;
      return json(res, 200, {
        data: filtered,
        meta: {
          total: activeVehicles.length,
          returned: filtered.length,
          populated_specs: populatedSpecs,
          verified_specs: verifiedSpecs,
          source: 'F-Box vehicle library',
          catalog_records: library.length,
          managed_records: data.vehicles.length,
          note: 'Wheel geometry is shown only when entered and verified by the F-Box operator.'
        }
      });
    }
  if (req.method === 'GET' && pathName === '/api/fbox-content/reviews') {
      const data = await loadOperations();
      const productId = textValue(url.searchParams.get('product_id'), 80);
      const reviews = data.reviews.filter(item => item.status === 'approved' && item.source !== 'test' && (!productId || item.product_id === productId)).map(publicContent);
      return json(res, 200, { data: sortNewest(reviews) });
    }
    if (req.method === 'POST' && pathName === '/api/fbox-content/track') {
      try {
        const payload = await readJson(req, 32 * 1024);
        const type = ['page_view', 'product_view', 'click'].includes(String(payload.type || '')) ? String(payload.type) : 'page_view';
        await recordAnalyticsEvent(req, {
          type,
          path: payload.path,
          title: payload.title,
          referrer: payload.referrer,
          locale: payload.locale,
          product_id: payload.product_id,
          product_name: payload.product_name,
          meta: payload.meta,
          customer_id: analyticsCustomerId(req)
        });
        return json(res, 201, { data: { recorded: true } });
      } catch (error) {
        console.error('[fbox-track] error:', error?.message || error);
        return json(res, 201, { data: { recorded: false } });
      }
    }
    if (req.method === 'GET' && pathName === '/api/fbox-content/cases') {
      const data = await loadOperations();
      return json(res, 200, { data: data.cases.filter(item => item.status === 'published').sort((a, b) => Number(a.sort || 0) - Number(b.sort || 0)).map(publicContent) });
    }
    if (req.method === 'POST' && pathName === '/api/fbox-content/reviews') {
      try {
        const data = await loadOperations();
        const payload = await readJson(req, 512 * 1024);
        const geo = await geoForRequest(req);
        const review = normalizeReview({ ...payload, status: 'pending', source: 'customer', verified_purchase: false, customer_country: payload.customer_country || geo.country, customer_country_code: payload.customer_country_code || geo.country_code });
        data.reviews.unshift(review);
        data.reviews = data.reviews.slice(0, 1000);
        await saveOperations(data);
        return json(res, 201, { data: publicContent(review) });
      } catch (error) { return json(res, error.status || 422, { detail: error.message || '评价提交失败。' }); }
    }
    if (req.method === 'POST' && pathName === '/api/fbox-content/inquiries') {
      try {
        const data = await loadOperations();
      const inquiryPayload = await readJson(req, 512 * 1024);
      const inquiryGeo = await geoForRequest(req);
      if (!inquiryPayload.country && inquiryGeo.country) { inquiryPayload.country = inquiryGeo.country; inquiryPayload.country_code = inquiryGeo.country_code; }
      const inquiry = normalizeInquiry(inquiryPayload);
        data.inquiries.unshift(inquiry);
        data.inquiries = data.inquiries.slice(0, 1000);
        await saveOperations(data);
        await recordAnalyticsEvent(req, { type: 'click', path: '/inquiry', title: 'Inquiry submitted', product_id: inquiry.product_id, product_name: inquiry.product_name, customer_id: analyticsCustomerId(req), meta: { action: 'inquiry', inquiry_id: inquiry.id } });
        return json(res, 201, { data: { id: inquiry.id, status: inquiry.status } });
      } catch (error) { return json(res, error.status || 422, { detail: error.message || '咨询提交失败。' }); }
    }
    if (req.method === 'POST' && pathName === '/api/fbox-content/chat') {
      try {
        const data = await loadOperations();
        const payload = await readJson(req, 256 * 1024);
        const conversationId = textValue(payload.conversation_id, 120);
        const message = normalizeChatMessage({ text: payload.message, locale: payload.locale || 'auto', source_language: payload.source_language || payload.locale || 'auto' }, 'customer');
        let inquiry = conversationId ? data.inquiries.find(item => item.id === conversationId) : null;
        if (!inquiry) {
          inquiry = normalizeInquiry({
            topic: 'website-chat',
            channel: 'online-chat',
            locale: payload.locale || 'auto',
            message: message.text,
            customer_name: payload.customer_name || 'Website visitor',
            customer_email: payload.customer_email,
            customer_phone: payload.customer_phone,
            vehicle: payload.vehicle,
            vehicle_selection: payload.vehicle_selection,
            official_wheel_specs: payload.official_wheel_specs,
            product_id: payload.product_id,
            product_name: payload.product_name,
            product_category: payload.product_category,
            product_finish: payload.product_finish,
            product_image: payload.product_image,
            product_display_price: payload.product_display_price,
            status: 'open',
            messages: [message]
          });
          data.inquiries.unshift(inquiry);
        } else {
          inquiry = ensureInquiryMessages(inquiry);
          inquiry.messages.push(message);
          inquiry.message = message.text;
          if (payload.vehicle_selection) inquiry.vehicle_selection = normalizeVehicleSelection(payload.vehicle_selection);
          if (payload.official_wheel_specs) inquiry.official_wheel_specs = normalizeInquirySpecs(payload.official_wheel_specs);
          inquiry.status = inquiry.status === 'closed' ? 'open' : inquiry.status;
          inquiry.updated_at = new Date().toISOString();
        }
        data.inquiries = data.inquiries.slice(0, 1000);
        await saveOperations(data);
        return json(res, 201, { data: publicChatRecord(inquiry) });
      } catch (error) { return json(res, error.status || 422, { detail: error.message || '在线消息发送失败。' }); }
    }
    const publicChatMatch = pathName.match(/^\/api\/fbox-content\/chat\/([^/]+)$/);
    if (publicChatMatch && req.method === 'GET') {
      const data = await loadOperations();
      const record = data.inquiries.find(item => item.id === decodeURIComponent(publicChatMatch[1]));
      if (!record) return json(res, 404, { detail: '在线会话不存在。' });
      return json(res, 200, { data: publicChatRecord(record) });
    }
    const publicQuotePayMatch = pathName.match(/^\/api\/fbox-content\/quotes\/([^/]+)\/paypal$/);
    if (publicQuotePayMatch && req.method === 'POST') {
      try {
        const payload = await readJson(req, 64 * 1024);
        const data = await loadOperations();
        const quoteId = decodeURIComponent(publicQuotePayMatch[1]);
        const owner = data.inquiries.find(item => item.quotes?.some(quote => quote.id === quoteId));
        const quote = owner?.quotes?.find(item => item.id === quoteId);
        if (!owner || !quote || quote.payment_token !== textValue(payload.payment_token, 120)) return json(res, 404, { detail: '报价付款链接无效或已失效。' });
        if (quote.payment_status === 'paid') return json(res, 409, { detail: '这份报价已经支付完成。' });
        const config = await loadConfig();
        const host = req.headers['x-forwarded-host'] || req.headers.host || '127.0.0.1:4174';
        const protocol = req.headers['x-forwarded-proto'] || (String(host).startsWith('localhost') || String(host).startsWith('127.') ? 'http' : 'https');
        const payment = await createPayPalOrder(config, quote, `${protocol}://${host}`);
        quote.paypal_order_id = payment.id;
        quote.paypal_approval_url = payment.approval_url;
        quote.payment_status = 'pending';
        quote.updated_at = new Date().toISOString();
        owner.updated_at = quote.updated_at;
        await saveOperations(data);
        return json(res, 200, { data: { quote_id: quote.id, order_id: payment.id, approval_url: payment.approval_url, mode: config.paypal_mode || defaultPayPalMode } });
      } catch (error) { return json(res, error.status || 502, { detail: error.message || 'PayPal 付款跳转创建失败。' }); }
    }
    if (pathName === '/api/fbox-content/paypal/capture' && req.method === 'POST') {
      try {
        const payload = await readJson(req, 64 * 1024);
        const data = await loadOperations();
        const owner = data.inquiries.find(item => item.quotes?.some(quote => quote.id === textValue(payload.quote_id, 120)));
        const quote = owner?.quotes?.find(item => item.id === textValue(payload.quote_id, 120));
        if (!owner || !quote || quote.payment_token !== textValue(payload.payment_token, 120)) return json(res, 404, { detail: '报价付款凭证无效。' });
        if (quote.payment_status === 'paid') return json(res, 200, { data: publicChatRecord(owner) });
        const orderId = textValue(payload.order_id || quote.paypal_order_id, 120);
        if (!orderId || (quote.paypal_order_id && quote.paypal_order_id !== orderId)) return json(res, 422, { detail: 'PayPal 订单号不匹配。' });
        const result = await capturePayPalOrder(await loadConfig(), orderId);
        const completed = result.status === 'COMPLETED' || result?.purchase_units?.[0]?.payments?.captures?.[0]?.status === 'COMPLETED';
        quote.payment_status = completed ? 'paid' : 'pending';
        quote.status = completed ? 'paid' : quote.status;
        quote.updated_at = new Date().toISOString();
        owner.status = completed ? 'resolved' : owner.status;
        owner.updated_at = quote.updated_at;
        await saveOperations(data);
        return json(res, 200, { data: { status: completed ? 'paid' : 'pending', inquiry: publicChatRecord(owner) } });
      } catch (error) { return json(res, error.status || 502, { detail: error.message || 'PayPal 付款确认失败。' }); }
    }
    return json(res, 404, { detail: 'F-Box public content endpoint not found.' });
  }

  if (!(await requireOperationsAdmin(req, res))) return;
  const data = await loadOperations();
  const store = await loadStore();

  if (req.method === 'GET' && pathName === '/api/fbox-ops/analytics') {
    const analytics = await loadAnalytics();
    const range = String(url.searchParams.get('range') || '30d');
    const nowMs = Date.now();
    const fromMs = range === 'all' ? 0 : nowMs - ({ '24h': 1, '7d': 7, '30d': 30, '90d': 90 }[range] || 30) * 24 * 60 * 60 * 1000;
    return json(res, 200, { data: buildAnalyticsDashboard(analytics.events, store, data, fromMs, nowMs) });
  }

  if (req.method === 'GET' && pathName === '/api/fbox-ops/analytics/events') {
    const analytics = await loadAnalytics();
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get('limit') || 50)));
    const events = [...analytics.events].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at))).slice(0, limit);
    return json(res, 200, { data: events, meta: { total: analytics.events.length } });
  }

  if (req.method === 'GET' && pathName === '/api/fbox-ops/customers') {
    const analytics = await loadAnalytics();
    const dashboard = buildAnalyticsDashboard(analytics.events, store, data, 0, Date.now());
    const q = textValue(url.searchParams.get('q'), 120).toLowerCase();
    const country = textValue(url.searchParams.get('country'), 80);
    const grade = textValue(url.searchParams.get('grade'), 4).toUpperCase();
    let leads = dashboard.leads;
    if (q) leads = leads.filter(item => [item.username, item.email, item.company, item.country].some(value => String(value || '').toLowerCase().includes(q)));
    if (country) leads = leads.filter(item => item.country === country || item.country_code === country);
    if (grade) leads = leads.filter(item => item.grade === grade);
    return json(res, 200, { data: leads, meta: { total: leads.length } });
  }

  if (req.method === 'GET' && pathName === '/api/fbox-ops/customers/export') {
    const analytics = await loadAnalytics();
    const dashboard = buildAnalyticsDashboard(analytics.events, store, data, 0, Date.now());
    const escCell = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const header = ['username', 'email', 'telephone', 'company', 'country', 'grade', 'orders', 'inquiries', 'interested_products', 'registered_at', 'last_seen_at'];
    const rows = dashboard.leads.map(lead => [lead.username, lead.email, lead.telephone, lead.company, lead.country, lead.grade, lead.orders, lead.inquiries, (lead.interest || []).join(' | '), lead.created_at, lead.last_seen_at].map(escCell).join(','));
    res.writeHead(200, {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="fbox-customers-' + new Date().toISOString().slice(0, 10) + '.csv"',
      'cache-control': 'no-store'
    });
    res.end('\uFEFF' + header.join(',') + '\n' + rows.join('\n'));
    return;
  }
  if (req.method === 'GET' && pathName === '/api/fbox-ops/products') {
    const q = textValue(url.searchParams.get('q'), 120).toLowerCase();
    const category = textValue(url.searchParams.get('category'), 80);
    const products = sortProductsForDisplay(store.products.filter(item => (!category || item.category === category) && (!q || [item.id, item.name, item.brand, item.part].some(value => String(value || '').toLowerCase().includes(q))))).map(publicProduct);
    return json(res, 200, { data: products, meta: { total: products.length } });
  }
  if (req.method === 'POST' && pathName === '/api/fbox-ops/products') {
    try {
      const payload = await readJson(req, 128 * 1024);
      const id = textValue(payload.id || operationId('product'), 100);
      const existing = store.products.find(item => item.id === id) || {};
      const product = { ...normalizeProductPayload({ ...payload, id }, existing), id };
      if (!product.name || !product.category || !product.price) return json(res, 422, { detail: '商品名称、分类和美元售价不能为空。' });
      const index = store.products.findIndex(item => item.id === id);
      if (index >= 0) store.products[index] = { ...store.products[index], ...product };
      else store.products.push({ ...product, created_at: new Date().toISOString() });
      await saveStore(store);
      return json(res, 200, { data: publicProduct(store.products.find(item => item.id === id)) });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '商品保存失败。' }); }
  }
  const storeProductMatch = pathName.match(/^\/api\/fbox-ops\/products\/([^/]+)$/);
  if (storeProductMatch && req.method === 'PUT') {
    try {
      const index = store.products.findIndex(item => item.id === decodeURIComponent(storeProductMatch[1]));
      if (index < 0) return json(res, 404, { detail: '商品不存在。' });
      const payload = await readJson(req, 128 * 1024);
      store.products[index] = { ...normalizeProductPayload(payload, store.products[index]), id: store.products[index].id };
      await saveStore(store);
      return json(res, 200, { data: publicProduct(store.products[index]) });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '商品更新失败。' }); }
  }
  if (req.method === 'GET' && pathName === '/api/fbox-ops/orders') {
    const status = textValue(url.searchParams.get('status'), 40);
    const orders = store.orders.filter(order => !status || String(order.status_label || order.status) === status).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
    return json(res, 200, { data: orders, meta: { total: orders.length } });
  }
  const storeOrderMatch = pathName.match(/^\/api\/fbox-ops\/orders\/([^/]+)$/);
  if (storeOrderMatch && req.method === 'PUT') {
    try {
      const index = store.orders.findIndex(item => item.id === decodeURIComponent(storeOrderMatch[1]));
      if (index < 0) return json(res, 404, { detail: '订单不存在。' });
      const payload = await readJson(req, 64 * 1024);
      const allowedStatus = ['pending_payment', 'paid', 'processing', 'shipped', 'completed', 'closed'];
      if (payload.status_label && !allowedStatus.includes(payload.status_label)) return json(res, 422, { detail: '订单状态不受支持。' });
      store.orders[index] = { ...store.orders[index], ...payload, status_label: payload.status_label || store.orders[index].status_label, updated_at: new Date().toISOString() };
      if (store.orders[index].status_label === 'paid') store.orders[index].status = 1;
      if (store.orders[index].status_label === 'shipped') store.orders[index].status = 2;
      if (store.orders[index].status_label === 'completed') store.orders[index].status = 3;
      if (store.orders[index].status_label === 'closed') store.orders[index].status = 4;
      await saveStore(store);
      return json(res, 200, { data: store.orders[index] });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '订单更新失败。' }); }
  }
  if (req.method === 'GET' && pathName === '/api/fbox-ops/summary') {
    const config = await loadConfig();
    const library = await buildVehicleLibrary(data);
    const analytics = await loadAnalytics();
    return json(res, 200, { data: {
      vehicles_total: library.length,
      vehicles_active: library.filter(item => item.status === 'active').length,
      jobs_total: data.jobs.length,
      jobs_pending: data.jobs.filter(item => ['queued', 'running'].includes(item.status)).length,
      jobs_failed: data.jobs.filter(item => item.status === 'failed').length,
      reviews_pending: data.reviews.filter(item => item.status === 'pending').length,
      reviews_approved: data.reviews.filter(item => item.status === 'approved').length,
      cases_published: data.cases.filter(item => item.status === 'published').length,
      inquiries_open: data.inquiries.filter(item => ['open', 'in_progress'].includes(item.status)).length,
      inquiries_unread: data.inquiries.reduce((total, item) => total + inquiryUnreadCount(item), 0),
      products_total: store.products.filter(item => item.status !== 'archived').length,
      orders_total: store.orders.length,
      orders_pending_payment: store.orders.filter(item => item.status_label === 'pending_payment').length,
      customers_total: store.accounts.length,
      visitors_total: new Set(analytics.events.map(event => event.ip).filter(Boolean)).size,
      analytics_events_total: analytics.events.length,
      image_route_ready: Boolean(config.api_key),
      generated_at: new Date().toISOString()
    } });
  }
  if (req.method === 'GET' && pathName === '/api/fbox-ops/vehicles') {
    const library = await buildVehicleLibrary(data);
    const q = textValue(url.searchParams.get('q'), 120).toLowerCase();
    const year = Number(url.searchParams.get('year') || 0);
    const make = textValue(url.searchParams.get('make'), 60).toLowerCase();
    const model = textValue(url.searchParams.get('model'), 80).toLowerCase();
    const status = textValue(url.searchParams.get('status'), 20);
    const specStatus = textValue(url.searchParams.get('spec_status'), 20);
    const page = Math.max(1, Number(url.searchParams.get('page') || 1));
    const pageSize = Math.min(200, Math.max(20, Number(url.searchParams.get('page_size') || 50)));
    const filtered = library.filter(item => {
      const searchText = [item.year, item.make, item.model, item.trim, item.drive].join(' ').toLowerCase();
      return (!q || searchText.includes(q))
        && (!year || Number(item.year) === year)
        && (!make || String(item.make).toLowerCase() === make)
        && (!model || String(item.model).toLowerCase() === model)
        && (!status || item.status === status)
        && (!specStatus || item.spec_status === specStatus);
    }).sort((a, b) => Number(b.year) - Number(a.year) || String(a.make).localeCompare(String(b.make)) || String(a.model).localeCompare(String(b.model)) || String(a.trim).localeCompare(String(b.trim)) || String(a.drive).localeCompare(String(b.drive)));
    const start = (page - 1) * pageSize;
    return json(res, 200, { data: {
      items: filtered.slice(start, start + pageSize),
      meta: { total: filtered.length, page, page_size: pageSize, catalog_total: library.length, managed_total: data.vehicles.length }
    } });
  }
  if (req.method === 'POST' && pathName === '/api/fbox-ops/vehicles') {
    try {
      const vehicle = normalizeVehicle(await readJson(req, 128 * 1024));
      data.vehicles.unshift(vehicle);
      await saveOperations(data);
      return json(res, 201, { data: vehicle });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '车型适配保存失败。' }); }
  }
  const vehicleMatch = pathName.match(/^\/api\/fbox-ops\/vehicles\/([^/]+)$/);
  if (vehicleMatch && req.method === 'PUT') {
    try {
      const id = decodeURIComponent(vehicleMatch[1]);
      const index = data.vehicles.findIndex(item => item.id === id);
      const payload = await readJson(req, 128 * 1024);
      if (index < 0 && !id.startsWith('catalog-')) return json(res, 404, { detail: '车型适配不存在。' });
      if (index < 0) {
        const catalog = (await loadFrontendVehicleLibrary()).find(item => item.id === id);
        if (!catalog) return json(res, 404, { detail: '车型目录记录不存在。' });
        const vehicle = normalizeVehicle({ ...catalog, ...payload });
        data.vehicles.unshift(vehicle);
        await saveOperations(data);
        return json(res, 200, { data: vehicle });
      }
      const vehicle = normalizeVehicle(payload, data.vehicles[index].id);
      data.vehicles[index] = vehicle;
      await saveOperations(data);
      return json(res, 200, { data: vehicle });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '车型适配更新失败。' }); }
  }
  if (vehicleMatch && req.method === 'DELETE') {
    const index = data.vehicles.findIndex(item => item.id === decodeURIComponent(vehicleMatch[1]));
    if (index < 0) return json(res, 404, { detail: '车型适配不存在。' });
    data.vehicles.splice(index, 1);
    await saveOperations(data);
    return json(res, 200, { data: { deleted: true } });
  }
  if (req.method === 'GET' && pathName === '/api/fbox-ops/jobs') return json(res, 200, { data: sortNewest(data.jobs) });
  const jobMatch = pathName.match(/^\/api\/fbox-ops\/jobs\/([^/]+)$/);
  if (jobMatch && req.method === 'PUT') {
    const record = data.jobs.find(item => item.id === decodeURIComponent(jobMatch[1]) || item.job_id === decodeURIComponent(jobMatch[1]));
    if (!record) return json(res, 404, { detail: '效果图任务不存在。' });
    try {
      const payload = await readJson(req, 128 * 1024);
      record.admin_note = textValue(payload.admin_note, 500);
      if (['queued', 'running', 'succeeded', 'failed', 'reviewed'].includes(payload.status)) record.status = payload.status;
      record.updated_at = new Date().toISOString();
      await saveOperations(data);
      return json(res, 200, { data: record });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '效果图任务更新失败。' }); }
  }
  if (req.method === 'GET' && pathName === '/api/fbox-ops/reviews') return json(res, 200, { data: sortNewest(data.reviews) });
  if (req.method === 'POST' && pathName === '/api/fbox-ops/reviews/seed-test-drafts') {
    const existingProductIds = new Set(data.reviews.filter(item => item.source === 'test').map(item => item.product_id));
    const drafts = sortProductsForDisplay(store.products)
      .filter(item => item.status === 'published' && !existingProductIds.has(item.id))
      .slice(0, 8)
      .map(item => normalizeReview({
        product_id: item.id,
        product_name: item.name,
        customer_name: 'Internal test record',
        title: 'Internal review workflow test',
        body: 'This internal record exists only to test moderation, sorting, replies and product mapping. It is blocked from storefront publication.',
        vehicle: '',
        rating: 5,
        source: 'test',
        status: 'pending'
      }));
    if (drafts.length) {
      data.reviews.unshift(...drafts);
      data.reviews = data.reviews.slice(0, 1000);
      await saveOperations(data);
    }
    return json(res, 200, { data: drafts, meta: { created: drafts.length } });
  }
  if (req.method === 'POST' && pathName === '/api/fbox-ops/reviews') {
    try {
      const record = normalizeReview(await readJson(req, 512 * 1024));
      if (record.status === 'approved' && !record.consent_confirmed) {
        return json(res, 422, { detail: '发布前需要确认客户已授权公开该评价。' });
      }
      data.reviews.unshift(record);
      data.reviews = data.reviews.slice(0, 1000);
      await saveOperations(data);
      return json(res, 201, { data: record });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '评价保存失败。' }); }
  }
  const reviewMatch = pathName.match(/^\/api\/fbox-ops\/reviews\/([^/]+)$/);
  if (reviewMatch && req.method === 'PUT') {
    const index = data.reviews.findIndex(item => item.id === decodeURIComponent(reviewMatch[1]));
    if (index < 0) return json(res, 404, { detail: '评价不存在。' });
    try {
      const payload = await readJson(req, 128 * 1024);
      const record = data.reviews[index];
      if (record.source === 'test' && payload.status === 'approved') {
        return json(res, 422, { detail: '内部测试评价不能发布到前台。请先录入客户授权的真实反馈。' });
      }
      const source = record.source === 'test' ? 'test' : (hasOwn(payload, 'source') ? payload.source : record.source);
      const nextRecord = normalizeReview({ ...record, ...payload, source, created_at: record.created_at }, record.id, record);
      if (nextRecord.status === 'approved' && !nextRecord.consent_confirmed) {
        return json(res, 422, { detail: '发布前需要确认客户已授权公开该评价。' });
      }
      data.reviews[index] = nextRecord;
      await saveOperations(data);
      return json(res, 200, { data: data.reviews[index] });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '评价审核失败。' }); }
  }
  if (reviewMatch && req.method === 'DELETE') {
    const index = data.reviews.findIndex(item => item.id === decodeURIComponent(reviewMatch[1]));
    if (index < 0) return json(res, 404, { detail: '评价不存在。' });
    data.reviews.splice(index, 1);
    await saveOperations(data);
    return json(res, 200, { data: { deleted: true } });
  }
  if (req.method === 'GET' && pathName === '/api/fbox-ops/cases') return json(res, 200, { data: sortNewest(data.cases) });
  if (req.method === 'POST' && pathName === '/api/fbox-ops/cases') {
    try {
      const record = normalizeCase(await readJson(req, 512 * 1024));
      data.cases.unshift(record);
      await saveOperations(data);
      return json(res, 201, { data: record });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '案例保存失败。' }); }
  }
  const caseMatch = pathName.match(/^\/api\/fbox-ops\/cases\/([^/]+)$/);
  if (caseMatch && req.method === 'PUT') {
    const index = data.cases.findIndex(item => item.id === decodeURIComponent(caseMatch[1]));
    if (index < 0) return json(res, 404, { detail: '案例不存在。' });
    try {
      const record = normalizeCase(await readJson(req, 512 * 1024), data.cases[index].id);
      data.cases[index] = record;
      await saveOperations(data);
      return json(res, 200, { data: record });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '案例更新失败。' }); }
  }
  if (req.method === 'GET' && pathName === '/api/fbox-ops/inquiries') return json(res, 200, { data: sortNewest(data.inquiries) });
  const inquiryMatch = pathName.match(/^\/api\/fbox-ops\/inquiries\/([^/]+)$/);
  const inquiryMessagesMatch = pathName.match(/^\/api\/fbox-ops\/inquiries\/([^/]+)\/messages$/);
  const inquiryQuotesMatch = pathName.match(/^\/api\/fbox-ops\/inquiries\/([^/]+)\/quotes$/);
  if (inquiryQuotesMatch && req.method === 'POST') {
    const record = data.inquiries.find(item => item.id === decodeURIComponent(inquiryQuotesMatch[1]));
    if (!record) return json(res, 404, { detail: '咨询线索不存在。' });
    try {
      const quote = normalizeQuote(await readJson(req, 128 * 1024), record);
      record.quotes = [...(record.quotes || []), quote].slice(-20);
      record.active_quote_id = quote.id;
      const message = normalizeChatMessage({ text: quoteMessageText(quote), kind: 'quote', quote }, 'admin');
      record.messages = [...ensureInquiryMessages(record).messages, message].slice(-200);
      record.message = message.text;
      record.status = 'in_progress';
      record.updated_at = new Date().toISOString();
      await saveOperations(data);
      return json(res, 201, { data: { quote, message } });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '报价保存失败。' }); }
  }
  if (inquiryMessagesMatch && req.method === 'POST') {
    const record = data.inquiries.find(item => item.id === decodeURIComponent(inquiryMessagesMatch[1]));
    if (!record) return json(res, 404, { detail: '咨询线索不存在。' });
    try {
      const payload = await readJson(req, 128 * 1024);
      const message = normalizeChatMessage({
        text: payload.message,
        operator_text: payload.operator_text,
        source_language: payload.source_language || 'zh-CN',
        target_language: payload.target_language || 'en'
      }, 'admin');
      record.messages = [...ensureInquiryMessages(record).messages, message].slice(-200);
      record.message = message.text;
      record.status = 'in_progress';
      record.updated_at = new Date().toISOString();
      await saveOperations(data);
      return json(res, 201, { data: message });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '客服消息发送失败。' }); }
  }
  const inquiryAiMatch = pathName.match(/^\/api\/fbox-ops\/inquiries\/([^/]+)\/ai$/);
  if (inquiryAiMatch && req.method === 'POST') {
    const record = data.inquiries.find(item => item.id === decodeURIComponent(inquiryAiMatch[1]));
    if (!record) return json(res, 404, { detail: '咨询线索不存在。' });
    try {
      const payload = await readJson(req, 128 * 1024);
      const action = ['translate', 'suggest'].includes(payload.action) ? payload.action : 'translate';
      const config = await loadConfig();
      const messages = ensureInquiryMessages(record).messages;
      const lastCustomer = [...messages].reverse().find(message => message.role === 'customer');
      const context = [record.product_name, record.vehicle, record.wheel_specs?.diameter && `${record.wheel_specs.diameter}x${record.wheel_specs.width}`, record.wheel_specs?.pcd].filter(Boolean).join(' · ') || 'No product context';
      const system = action === 'translate'
        ? 'You are the F-Box export sales translator. Translate the Chinese operator draft into natural, concise English for an overseas customer. Preserve product names, wheel specifications, prices, quantities, dates, and units exactly. Do not add promises, discounts, fitment guarantees, or new facts. Return JSON only: {"translation":"...","detected_language":"zh-CN","notes":""}.'
        : 'You are the F-Box export sales assistant. Read the customer message and prepare a safe, concise English reply for an overseas auto-parts buyer. Be helpful and commercial, but never invent stock, delivery time, fitment certainty, warranty, discount, or price. Ask for missing wheel data when needed. Return JSON only: {"reply":"...","chinese_summary":"...","customer_language":"..."}.';
      const user = action === 'translate'
        ? `Operator draft in Chinese:\n${textValue(payload.text, 4000)}\nContext: ${context}`
        : `Customer message:\n${lastCustomer?.text || record.message}\nConversation context: ${context}\nCustomer locale: ${record.locale || 'auto'}`;
      const result = await callChatModel(config, [{ role: 'system', content: system }, { role: 'user', content: user }]);
      return json(res, 200, { data: { action, model: config.chat_model || defaultChatModel, ...result } });
    } catch (error) { return json(res, error.status || 502, { detail: error.message || 'GPT-5.5 客服辅助暂时不可用。' }); }
  }
  if (inquiryMatch && req.method === 'PUT') {
    const record = data.inquiries.find(item => item.id === decodeURIComponent(inquiryMatch[1]));
    if (!record) return json(res, 404, { detail: '咨询线索不存在。' });
    try {
      const payload = await readJson(req, 128 * 1024);
      if (['open', 'in_progress', 'resolved', 'closed'].includes(payload.status)) record.status = payload.status;
      if (['A', 'B', 'C'].includes(payload.customer_grade)) record.customer_grade = payload.customer_grade;
      if (payload.mark_read) record.messages = ensureInquiryMessages(record).messages.map(message => ({ ...message, read: true }));
      record.admin_note = textValue(payload.admin_note, 500);
      record.updated_at = new Date().toISOString();
      await saveOperations(data);
      return json(res, 200, { data: record });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || '咨询线索更新失败。' }); }
  }
  return json(res, 404, { detail: 'F-Box operations endpoint not found.' });
}
