// Shopify remains the source of product, variant and checkout information.
const SHOP = 'https://shop.forcarbox.cn';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const idText = value => String(value ?? '');

export function numericVariantId(value) {
  const raw = idText(value).replace(/^gid:\/\/shopify\/ProductVariant\//, '');
  return /^[1-9]\d*$/.test(raw) && (typeof value !== 'number' || Number.isSafeInteger(value)) ? raw : '';
}

export function productIdentity(value) {
  return idText(value).replace(/^gid:\/\/shopify\/Product\//, '');
}

export function resolveVariant(product, selected = []) {
  const options = Array.isArray(product?.options) ? product.options : [];
  if (options.some((_, index) => typeof selected[index] !== 'string' || !selected[index])) return null;
  const matches = (product?.variants || []).filter(variant => options.every((_, index) => idText(variant.options?.[index]) === selected[index]));
  return matches.length === 1 && numericVariantId(matches[0].id) ? matches[0] : null;
}

export function buildShopifyLinks(product, variant, quantity = 1) {
  const handle = idText(product?.handle);
  const validHandle = /^[\p{L}\p{N}][\p{L}\p{N}\p{M}-]*$/u.test(handle);
  const productUrl = validHandle ? `${SHOP}/products/${encodeURIComponent(handle)}` : `${SHOP}/collections/all`;
  const id = numericVariantId(variant?.id);
  const member = id && (product?.variants || []).find(item => numericVariantId(item.id) === id);
  const belongs = Boolean(member);
  const validQuantity = Number.isSafeInteger(quantity) && quantity > 0;
  return {
    product: belongs ? `${productUrl}?variant=${id}` : productUrl,
    checkout: validHandle && belongs && member.available === true && validQuantity ? `${SHOP}/cart/${id}:${quantity}` : ''
  };
}

export function checkoutValidationUrl(product, variant, quantity = 1) {
  const links = buildShopifyLinks(product, variant, quantity);
  if (!links.checkout || quantity > 99) return '';
  return `/api/shopify/checkout?product=${encodeURIComponent(product.handle)}&variant=${numericVariantId(variant.id)}&quantity=${quantity}`;
}

export function exactProductReviews(reviews, productId) {
  const id = productIdentity(productId);
  return id ? reviews.filter(review => review.scope === 'product' && productIdentity(review.product_id) === id) : [];
}

function mediaUrl(value) {
  const raw = idText(value).trim();
  if (/^\/(?!\/)/.test(raw)) return raw;
  try { const url = new URL(raw); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
}

function sourceUrl(value) {
  try { const url = new URL(idText(value)); return ['https:', 'http:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}

function money(value, currency = 'USD') {
  const amount = Number(value);
  if (!Number.isFinite(amount) || value === null || value === '') return 'View price on Shopify';
  try { return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount); } catch { return `$${amount.toFixed(2)}`; }
}

function priceMarkup(product, currency) {
  const min = product.price_min ?? product.variants?.[0]?.price;
  const max = product.price_max ?? min;
  return Number(max) > Number(min) ? `${escape(money(min, currency))} <span>– ${escape(money(max, currency))}</span>` : escape(money(min, currency));
}

function imageMarkup(image, title, className = '', loading = 'lazy') {
  const url = mediaUrl(image?.url);
  return url ? `<img class="${className}" src="${escape(url)}" alt="${escape(image.alt || title)}" loading="${loading}" decoding="async"${image.width ? ` width="${Number(image.width) || 1200}"` : ''}${image.height ? ` height="${Number(image.height) || 1200}"` : ''}>` : `<span class="sp-image-empty">Image coming soon</span>`;
}

async function readJson(url) {
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(response.status === 404 ? 'This product is no longer available.' : 'The catalog could not be loaded. Please try again.');
  if (!payload.data) throw new Error('The catalog is temporarily unavailable.');
  return payload.data;
}

export function createShopifyCatalogUI({ onChange = () => {}, getSearch = () => '' } = {}) {
  const state = { catalog: null, catalogLoading: false, catalogError: '', products: new Map(), pending: new Set(), productErrors: new Map(), reviews: null, reviewsLoading: false, reviewsError: '', selections: new Map(), quantities: new Map(), imageIds: new Map(), storeReviewLimit: 4, productReviewLimits: new Map(), filters: new Map() };
  const handles = route => ['store', 'collections', 'collection', 'shopify-product'].includes(route?.name);
  const currency = () => state.catalog?.currency || 'USD';
  const notify = () => onChange();
  const routeKey = route => route.name === 'collection' ? `collection/${route.handle}` : 'store';
  const filterFor = route => {
    const key = routeKey(route);
    if (!state.filters.has(key)) state.filters.set(key, { search: route.name === 'store' ? getSearch() : '', sort: 'featured' });
    return state.filters.get(key);
  };

  async function loadCatalog(force = false) {
    if (state.catalogLoading || (state.catalog && !force)) return;
    state.catalogLoading = true; state.catalogError = '';
    try {
      const data = await readJson('/api/shopify/catalog');
      if (!Array.isArray(data.products) || !Array.isArray(data.collections)) throw new Error('The catalog is temporarily unavailable.');
      state.catalog = data;
    }
    catch (error) { state.catalogError = error.message; }
    finally { state.catalogLoading = false; notify(); }
  }

  async function loadProduct(handle, force = false) {
    if (state.pending.has(handle) || (state.products.has(handle) && !force)) return;
    state.pending.add(handle); state.productErrors.delete(handle);
    try {
      const product = await readJson(`/api/shopify/products/${encodeURIComponent(handle)}`);
      if (product.handle !== handle || !Array.isArray(product.variants)) throw new Error('This product is temporarily unavailable.');
      state.products.set(handle, product);
      if (!state.selections.has(handle)) {
        const variantQuery = new URLSearchParams(location.hash.split('?')[1] || '').get('variant');
        const requested = (product.variants || []).find(item => numericVariantId(item.id) === numericVariantId(variantQuery));
        const onlyVariant = product.variants.length === 1 ? product.variants[0] : null;
        state.selections.set(handle, (requested || onlyVariant)?.options?.map(idText) || (product.options || []).map(() => ''));
      }
    } catch (error) { state.productErrors.set(handle, error.message); }
    finally { state.pending.delete(handle); notify(); }
  }

  async function loadReviews(force = false) {
    if (state.reviewsLoading || (state.reviews !== null && !force)) return;
    state.reviewsLoading = true; state.reviewsError = '';
    try { const data = await readJson('/api/shopify/reviews'); state.reviews = Array.isArray(data) ? data : []; }
    catch { state.reviewsError = 'Customer feedback is temporarily unavailable.'; }
    finally { state.reviewsLoading = false; notify(); }
  }

  function notice(message, retry = '') {
    return `<div class="sp-notice" role="status"><p>${escape(message)}</p>${retry ? `<button type="button" class="btn btn-dark" data-sp-action="${retry}">Try again</button>` : ''}<a class="sp-text-link" href="${SHOP}/collections/all">Browse the Shopify store ↗</a></div>`;
  }

  function card(product) {
    const images = (product.images || []).filter(item => mediaUrl(item.url));
    return `<article class="sp-product-card"><a class="sp-product-link" href="#shopify-product/${encodeURIComponent(product.handle)}"><div class="sp-card-media${images[1] ? ' has-hover-image' : ''}">${imageMarkup(images[0], product.title, 'sp-card-primary')}${images[1] ? imageMarkup(images[1], `${product.title} on vehicle`, 'sp-card-hover') : ''}<span class="sp-card-view">View design <span aria-hidden="true">↗</span></span></div><div class="sp-card-copy"><p class="sp-card-meta">CIRUI FORGED${Number(product.variant_count) > 1 ? ` · ${Number(product.variant_count)} configurations` : ''}</p><h2>${escape(product.title)}</h2><p class="sp-card-price">${priceMarkup(product, currency())}</p><p class="sp-availability">${product.available === true ? 'Available to order' : product.available === false ? 'Currently unavailable' : 'Check availability'}</p></div></a></article>`;
  }

  function collectionProducts(collection) {
    const ids = new Set((collection.product_ids || []).map(productIdentity));
    return (state.catalog?.products || []).filter(product => ids.has(productIdentity(product.id)) || (product.collection_ids || []).some(id => idText(id) === idText(collection.id)));
  }

  function productsFor(route) {
    if (route.name !== 'collection') return state.catalog?.products || [];
    const collection = state.catalog?.collections?.find(item => item.handle === route.handle);
    return collection ? collectionProducts(collection) : [];
  }

  function filteredProducts(route) {
    const filter = filterFor(route);
    const term = filter.search.trim().toLowerCase();
    const products = productsFor(route).filter(product => !term || `${product.title} ${product.handle}`.toLowerCase().includes(term));
    if (filter.sort === 'price-low') products.sort((a, b) => Number(a.price_min) - Number(b.price_min));
    if (filter.sort === 'price-high') products.sort((a, b) => Number(b.price_min) - Number(a.price_min));
    if (filter.sort === 'title') products.sort((a, b) => a.title.localeCompare(b.title));
    return products;
  }

  function gridContent(products) {
    return products.length ? products.map(card).join('') : '<div class="sp-grid-empty"><h2>No designs found</h2><p>Try another search or browse all wheel designs.</p><a class="sp-text-link" href="#store">All wheels</a></div>';
  }

  function reviewsMarkup(reviews, { store = false, product = null } = {}) {
    const limit = store ? state.storeReviewLimit : (state.productReviewLimits.get(product.handle) || 4);
    const average = reviews.length ? reviews.reduce((sum, review) => sum + Math.min(5, Math.max(1, Number(review.rating) || 1)), 0) / reviews.length : 0;
    return `<section class="sp-feedback" id="${store ? 'store-feedback' : 'product-feedback'}" aria-labelledby="sp-feedback-title"><div class="sp-section-head"><div><p class="sp-eyebrow">${store ? 'CUSTOMER FEEDBACK' : 'THIS DESIGN'}</p><h2 id="sp-feedback-title">${store ? 'From our customers' : 'Product reviews'}</h2></div>${reviews.length ? `<p class="sp-rating-summary"><span aria-hidden="true">★</span> ${average.toFixed(1)} / 5 <span>· ${reviews.length} ${store ? 'customer reviews' : 'reviews'}</span></p>` : ''}</div>${store ? '<p class="sp-feedback-intro">Customer product reviews collected through Judge.me, shown here across different orders and wheel designs.</p>' : ''}${state.reviewsError ? `<p role="status">${escape(state.reviewsError)}</p>` : state.reviews === null ? '<p role="status">Loading customer feedback…</p>' : !reviews.length ? `<div class="sp-review-empty"><p>No reviews for this design yet.</p><a class="sp-text-link" href="#store?feedback=1">Read customer feedback ↗</a></div>` : `<div class="sp-review-grid">${reviews.slice(0, limit).map(review => reviewCard(review)).join('')}</div>${reviews.length > limit ? `<button type="button" class="btn btn-outline sp-reviews-more" data-sp-action="more-reviews" data-sp-scope="${store ? 'store' : 'product'}">Show more reviews (${reviews.length - limit})</button>` : ''}`}</section>`;
  }

  function reviewCard(review) {
    const rating = Math.min(5, Math.max(1, Number(review.rating) || 1));
    const date = new Date(review.created_at);
    const dateText = Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const pictures = (Array.isArray(review.pictures) ? review.pictures : []).map(item => mediaUrl(typeof item === 'string' ? item : item?.url)).filter(Boolean);
    const origin = sourceUrl(review.source_url);
    return `<article class="sp-review-card"><div class="sp-review-stars" aria-label="${rating} out of 5 stars">${'★'.repeat(Math.round(rating))}<span aria-hidden="true">${'☆'.repeat(5 - Math.round(rating))}</span></div><h3>${escape(review.title || 'Customer feedback')}</h3><p class="sp-review-body">${escape(review.body)}</p>${pictures.length ? `<div class="sp-review-pictures">${pictures.slice(0, 4).map(url => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Open customer review photo"><img src="${escape(url)}" alt="Customer review photo" loading="lazy"></a>`).join('')}</div>` : ''}<footer><strong>${escape(review.reviewer_name || 'Customer')}</strong>${review.verified === true ? '<span class="sp-verified">Verified purchase</span>' : ''}${dateText ? `<time>${escape(dateText)}</time>` : ''}${origin ? `<a href="${escape(origin)}" target="_blank" rel="noopener noreferrer">${escape(review.source || 'Review source')} ↗</a>` : review.source ? `<span>${escape(review.source)}</span>` : ''}</footer></article>`;
  }

  function catalogPage(route) {
    if (!state.catalog) return `<main class="sp-page" data-shopify-root>${notice(state.catalogError || 'Loading wheel designs…', state.catalogError ? 'reload-catalog' : '')}</main>`;
    const collection = route.name === 'collection' ? state.catalog.collections.find(item => item.handle === route.handle) : null;
    if (route.name === 'collection' && !collection) return `<main class="sp-page" data-shopify-root>${notice('This collection is not available.')}<a href="#collections">Explore all collections</a></main>`;
    const title = collection?.title || 'All wheel designs';
    const filter = filterFor(route);
    const products = filteredProducts(route);
    return `<main class="sp-page" data-shopify-root><section class="sp-catalog-hero"><div class="container"><nav class="sp-breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span>${collection ? '<a href="#collections">Collections</a><span>/</span>' : ''}<span>${escape(title)}</span></nav><p class="sp-eyebrow">CIRUI FORGED COLLECTION</p><h1>${escape(title)}</h1>${collection?.description_html ? `<div class="sp-collection-description">${collection.description_html}</div>` : '<p>Explore the wheel, see it on the car, and choose your exact configuration.</p>'}<div class="sp-hero-links"><a class="sp-text-link" href="#collections">Explore collections ↗</a><a class="sp-text-link" href="#rfq-catalog">Bespoke / RFQ catalog ↗</a></div></div></section><div class="container sp-catalog-body"><div class="sp-toolbar"><form class="sp-search" data-sp-search-form><label class="sp-sr-only" for="sp-product-search">Search wheel designs</label><input id="sp-product-search" type="search" name="query" placeholder="Search wheel designs…" value="${escape(filter.search)}" data-sp-search><button type="submit" aria-label="Search wheel designs">Search</button></form><label class="sp-sort">Sort by<select data-sp-sort><option value="featured"${filter.sort === 'featured' ? ' selected' : ''}>Featured</option><option value="price-low"${filter.sort === 'price-low' ? ' selected' : ''}>Price: low to high</option><option value="price-high"${filter.sort === 'price-high' ? ' selected' : ''}>Price: high to low</option><option value="title"${filter.sort === 'title' ? ' selected' : ''}>Name</option></select></label><p class="sp-result-count" aria-live="polite"><span data-sp-count>${products.length}</span> designs</p></div><div class="sp-products-grid" data-sp-grid>${gridContent(products)}</div>${reviewsMarkup(state.reviews || [], { store: true })}</div></main>`;
  }

  function collectionsPage() {
    if (!state.catalog) return `<main class="sp-page" data-shopify-root>${notice(state.catalogError || 'Loading collections…', state.catalogError ? 'reload-catalog' : '')}</main>`;
    const collections = state.catalog.collections || [];
    return `<main class="sp-page" data-shopify-root><section class="sp-catalog-hero"><div class="container"><nav class="sp-breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><span>Collections</span></nav><p class="sp-eyebrow">FIND YOUR DIRECTION</p><h1>Wheel collections</h1><p>Browse by vehicle, construction, or finish. Find the design that belongs on your build.</p><a class="sp-text-link" href="#store">Browse all wheels ↗</a></div></section><div class="container sp-catalog-body"><div class="sp-collections-grid">${collections.map(collection => { const products = collectionProducts(collection); const image = collection.image_url ? { url: collection.image_url, alt: collection.title } : products[0]?.images?.[0]; return `<a class="sp-collection-card" href="#collection/${encodeURIComponent(collection.handle)}"><div class="sp-collection-media">${imageMarkup(image, collection.title)}</div><div><p>${products.length} designs</p><h2>${escape(collection.title)}</h2><span aria-hidden="true">↗</span></div></a>`; }).join('')}</div>${!collections.length ? notice('New collections are being prepared.') : ''}${reviewsMarkup(state.reviews || [], { store: true })}</div></main>`;
  }

  function productPage(route) {
    const product = state.products.get(route.handle);
    if (!product) return `<main class="sp-page" data-shopify-root>${notice(state.productErrors.get(route.handle) || 'Loading this wheel design…', state.productErrors.has(route.handle) ? 'reload-product' : '')}</main>`;
    const images = product.images || [];
    const selected = state.selections.get(product.handle) || [];
    const variant = resolveVariant(product, selected);
    const imageId = state.imageIds.get(product.handle) || variant?.image_id || images[0]?.id;
    const activeImage = images.find(image => idText(image.id) === idText(imageId)) || images[0];
    const options = product.options || [];
    const onlyDefault = options.length === 1 && options[0].name === 'Title' && options[0].values?.length === 1 && options[0].values[0] === 'Default Title';
    const matchingReviews = exactProductReviews(state.reviews || [], product.id);
    const quantity = state.quantities.get(product.handle) || 1;
    const links = buildShopifyLinks(product, variant, quantity);
    return `<main class="sp-page sp-product-page" data-shopify-root><div class="container"><nav class="sp-breadcrumbs" aria-label="Breadcrumb"><a href="#home">Home</a><span>/</span><a href="#store">All wheels</a><span>/</span><span>${escape(product.title)}</span></nav><div class="sp-product-layout"><div class="sp-gallery"><div class="sp-gallery-hero" data-sp-main-image>${imageMarkup(activeImage, product.title, '', 'eager')}</div>${images.length > 1 ? `<div class="sp-gallery-thumbs" aria-label="Product images">${images.map((image, index) => `<button type="button" data-sp-action="image" data-sp-image="${escape(image.id)}" aria-label="View image ${index + 1}" aria-pressed="${idText(image.id) === idText(activeImage?.id)}">${imageMarkup(image, `${product.title}, image ${index + 1}`)}</button>`).join('')}</div>` : ''}</div><section class="sp-product-purchase" aria-labelledby="sp-product-title"><p class="sp-eyebrow">CIRUI FORGED</p><h1 id="sp-product-title">${escape(product.title)}</h1><p class="sp-detail-price" data-sp-price>${variant ? escape(money(variant.price, currency())) : priceMarkup(product, currency())}</p><p class="sp-selection-status" data-sp-status role="status">${variant ? variant.available === true ? 'Available to order' : 'This configuration is currently unavailable.' : 'Choose each option to see the exact price and availability.'}</p><form data-sp-product-form><div class="sp-option-fields">${onlyDefault ? '' : options.map((option, index) => `<label class="sp-option" for="sp-option-${index}"><span>${escape(option.name)}</span><select id="sp-option-${index}" data-sp-option="${index}" required><option value="">Choose ${escape(option.name.toLowerCase())}</option>${(option.values || []).map(value => `<option value="${escape(value)}"${selected[index] === idText(value) ? ' selected' : ''}>${escape(value)}</option>`).join('')}</select></label>`).join('')}</div><label class="sp-quantity" for="sp-quantity">Quantity<input id="sp-quantity" type="number" inputmode="numeric" min="1" max="99" step="1" value="${quantity}" data-sp-quantity required></label><p class="sp-unit-note">Quantity 1 is the item or set described in this listing.</p><p class="sp-variant-summary" data-sp-summary>${variant ? escape(variant.title === 'Default Title' ? 'Standard configuration' : variant.title) : 'Select your configuration above.'}</p><a class="btn btn-dark sp-checkout${links.checkout ? '' : ' is-disabled'}" data-sp-checkout${links.checkout ? ` href="${escape(checkoutValidationUrl(product, variant, quantity))}"` : ' aria-disabled="true" tabindex="-1"'}>Continue to Shopify <span aria-hidden="true">↗</span></a><p class="sp-checkout-note">Review shipping, taxes and available payment methods in Shopify before paying.</p><a class="sp-text-link" data-sp-shopify-link href="${escape(links.product)}">View this product on Shopify ↗</a></form><div class="sp-fitment-help"><strong>Need help with fitment?</strong><p>Confirm your vehicle, brake package and final wheel specification before ordering.</p><a href="/fitment-lab" data-app-path>Open Fitment Lab ↗</a><a href="#custom">Discuss a custom build ↗</a></div></section></div><section class="sp-product-description" aria-labelledby="sp-product-details"><p class="sp-eyebrow">DESIGN & SPECIFICATION</p><h2 id="sp-product-details">Product details</h2>${product.description_html || '<p>View this design on Shopify for the latest specifications.</p>'}</section>${reviewsMarkup(matchingReviews, { product })}</div></main>`;
  }

  function refreshGrid(root, route) {
    const products = filteredProducts(route);
    const grid = root.querySelector('[data-sp-grid]');
    if (grid) grid.innerHTML = gridContent(products);
    const count = root.querySelector('[data-sp-count]');
    if (count) count.textContent = products.length;
  }

  function updateSelection(root, product) {
    const selected = [...root.querySelectorAll('[data-sp-option]')].map(select => select.value);
    if (selected.length) state.selections.set(product.handle, selected);
    const variant = resolveVariant(product, state.selections.get(product.handle) || []);
    const input = root.querySelector('[data-sp-quantity]');
    const quantity = Number(input?.value);
    const validQuantity = Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 99;
    input?.setCustomValidity(validQuantity ? '' : 'Enter a whole-number quantity from 1 to 99.');
    if (validQuantity) state.quantities.set(product.handle, quantity);
    const links = buildShopifyLinks(product, variant, validQuantity ? quantity : 0);
    root.querySelector('[data-sp-price]').textContent = variant ? money(variant.price, currency()) : `${money(product.price_min, currency())}${Number(product.price_max) > Number(product.price_min) ? ` – ${money(product.price_max, currency())}` : ''}`;
    const allSelected = (product.options || []).every((_, index) => (state.selections.get(product.handle) || [])[index]);
    root.querySelector('[data-sp-status]').textContent = !validQuantity ? 'Enter a whole-number quantity from 1 to 99.' : variant ? variant.available === true ? 'Available to order' : 'This configuration is currently unavailable.' : allSelected ? 'This combination is unavailable. Please choose another configuration.' : 'Choose each option to see the exact price and availability.';
    root.querySelector('[data-sp-summary]').textContent = variant ? variant.title === 'Default Title' ? 'Standard configuration' : variant.title : 'Select your configuration above.';
    const checkout = root.querySelector('[data-sp-checkout]');
    checkout.classList.toggle('is-disabled', !links.checkout);
    if (links.checkout) { checkout.href = checkoutValidationUrl(product, variant, quantity); checkout.removeAttribute('aria-disabled'); checkout.removeAttribute('tabindex'); }
    else { checkout.removeAttribute('href'); checkout.setAttribute('aria-disabled', 'true'); checkout.setAttribute('tabindex', '-1'); }
    root.querySelector('[data-sp-shopify-link]').href = links.product;
    if (variant?.image_id && idText(state.imageIds.get(product.handle)) !== idText(variant.image_id)) setImage(root, product, variant.image_id);
  }

  function setImage(root, product, id) {
    const image = product.images?.find(item => idText(item.id) === idText(id));
    if (!image) return;
    state.imageIds.set(product.handle, image.id);
    root.querySelector('[data-sp-main-image]').innerHTML = imageMarkup(image, product.title, '', 'eager');
    root.querySelectorAll('[data-sp-image]').forEach(button => button.setAttribute('aria-pressed', idText(button.dataset.spImage) === idText(id) ? 'true' : 'false'));
  }

  return {
    handles,
    homeMarkup() {
      const products = (state.catalog?.products || []).slice(0, 8);
      return `<section class="sp-home-block sp-home-products" id="vehicles" data-shopify-root><div class="container"><div class="sp-home-heading"><div><p class="sp-eyebrow">THE CURRENT COLLECTION</p><h2>Find your next<br>wheel design.</h2></div><div><p>${state.catalog ? `${state.catalog.products.length} wheel designs. ${state.catalog.collections.length} collections.` : 'Explore our wheel designs, finishes and vehicle collections.'}</p><div class="sp-hero-links"><a class="sp-text-link" href="#store">Shop all wheels ↗</a><a class="sp-text-link" href="#collections">All collections ↗</a></div></div></div>${products.length ? `<div class="sp-products-grid">${products.map(card).join('')}</div>` : notice(state.catalogError || 'Loading wheel designs…', state.catalogError ? 'reload-catalog' : '')}</div></section>`;
    },
    homeReviewsMarkup() {
      return `<section class="sp-home-block sp-home-feedback" id="resources" data-shopify-root><div class="container">${reviewsMarkup(state.reviews || [], { store: true })}<a class="sp-text-link sp-home-feedback-link" href="#store?feedback=1">Explore all customer feedback ↗</a></div></section>`;
    },
    homePhotoMarkup() {
      const withPhotos = (state.reviews || []).filter(review => Array.isArray(review.pictures) && review.pictures.some(picture => mediaUrl(typeof picture === 'string' ? picture : picture?.url))).slice(0, 6);
      return `<section class="sp-home-block sp-home-photos" id="gallery" data-shopify-root><div class="container"><div class="sp-home-heading"><div><p class="sp-eyebrow">FROM CUSTOMER ORDERS</p><h2>Customer review photos.</h2></div><div><p>Photos shared with customer feedback across different wheel designs and orders.</p><a class="sp-text-link" href="#store?feedback=1">Read customer feedback ↗</a></div></div>${withPhotos.length ? `<div class="sp-home-photo-grid">${withPhotos.map(review => { const picture = review.pictures.find(item => mediaUrl(typeof item === 'string' ? item : item?.url)); const url = mediaUrl(typeof picture === 'string' ? picture : picture?.url); return `<article><a href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="Open customer review photo"><img src="${escape(url)}" alt="Customer review photo" loading="lazy" decoding="async"></a><div><strong>${escape(review.title || 'Customer feedback')}</strong><p>${escape(review.reviewer_name || 'Customer')} · ${escape(review.source || 'Judge.me')}</p></div></article>`; }).join('')}</div>` : `<p class="sp-feedback-intro" role="status">${state.reviews === null && !state.reviewsError ? 'Loading customer photos…' : 'Customer photos will appear here when shared with a review.'}</p>`}</div></section>`;
    },
    render(route) {
      if (route.name === 'shopify-product') return productPage(route);
      return route.name === 'collections' ? collectionsPage() : catalogPage(route);
    },
    syncSearch(search) { const filter = filterFor({ name: 'store' }); filter.search = idText(search); },
    mount(root, route) {
      if (!root) return;
      if (!state.catalog && !state.catalogError) void loadCatalog();
      if (state.reviews === null && !state.reviewsError) void loadReviews();
      if (route.name === 'shopify-product' && !state.products.has(route.handle) && !state.productErrors.has(route.handle)) void loadProduct(route.handle);
      const product = state.products.get(route.handle);
      root.addEventListener('submit', event => { if (event.target.matches('[data-sp-search-form], [data-sp-product-form]')) { event.preventDefault(); if (event.target.matches('[data-sp-search-form]')) refreshGrid(root, route); } });
      root.addEventListener('input', event => {
        if (event.target.matches('[data-sp-search]')) { filterFor(route).search = event.target.value; refreshGrid(root, route); }
        if (product && event.target.matches('[data-sp-quantity]')) updateSelection(root, product);
      });
      root.addEventListener('change', event => {
        if (event.target.matches('[data-sp-sort]')) { filterFor(route).sort = event.target.value; refreshGrid(root, route); }
        if (product && event.target.matches('[data-sp-option]')) updateSelection(root, product);
      });
      root.addEventListener('click', event => {
        const target = event.target.closest('[data-sp-action], [data-sp-checkout]');
        if (!target) return;
        if (target.matches('[data-sp-checkout]')) { if (target.getAttribute('aria-disabled') === 'true') event.preventDefault(); return; }
        const action = target.dataset.spAction;
        if (action === 'reload-catalog') void loadCatalog(true);
        if (action === 'reload-product') void loadProduct(route.handle, true);
        if (action === 'image' && product) setImage(root, product, target.dataset.spImage);
        if (action === 'more-reviews') {
          if (target.dataset.spScope === 'store') state.storeReviewLimit += 8;
          else state.productReviewLimits.set(route.handle, (state.productReviewLimits.get(route.handle) || 4) + 8);
          const scroll = window.scrollY; notify(); window.scrollTo(0, scroll);
        }
      });
      if (route.name === 'store' && new URLSearchParams(location.hash.split('?')[1] || '').get('feedback') === '1') requestAnimationFrame(() => root.querySelector('#store-feedback')?.scrollIntoView({ block: 'start' }));
      const name = handles(route) ? product?.title || (route.name === 'collections' ? 'Wheel collections' : route.name === 'collection' ? state.catalog?.collections?.find(item => item.handle === route.handle)?.title : 'All wheel designs') : '';
      if (name) document.title = `${name} | CIRUI Forged`;
    }
  };
}
