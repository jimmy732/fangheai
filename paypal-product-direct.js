(() => {
  const productId = 'cr-c8z06-track-001';
  const hostedButtonId = 'LB7ZA6K8HAL2C';
  const containerId = `paypal-container-${hostedButtonId}`;
  const sdkId = 'fbox-paypal-direct-sdk';
  const sdkUrl = 'https://www.paypal.com/sdk/js?client-id=BAA8s4HvB-lyiiKYKM_GT6F_AebG4mRT6fQP9ZEHYZ17BU9vy9KaSahJUqK8hVYyCRKWYqeVl-u6H7D9Qg&components=hosted-buttons&disable-funding=venmo&currency=USD';
  let mountAttempts = 0;

  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));

  function targetProductOpen() {
    return decodeURIComponent(window.location.hash || '') === `#product/${productId}`;
  }

  function installStyles() {
    if (document.getElementById('fbox-paypal-direct-styles')) return;
    const style = document.createElement('style');
    style.id = 'fbox-paypal-direct-styles';
    style.textContent = `
      .paypal-direct-detail .detail-purchase { align-self: start; }
      .paypal-direct-detail .paypal-direct-panel {
        display: grid;
        gap: 18px;
        margin-top: 30px;
        padding: 24px;
        border: 1px solid #dbe3eb;
        border-radius: 16px;
        background: linear-gradient(145deg, #f8fafc 0%, #fff 100%);
        box-shadow: 0 18px 44px rgba(12, 25, 38, .08);
      }
      .paypal-direct-detail .paypal-direct-panel h2 { margin: 0; font-size: 22px; }
      .paypal-direct-detail .paypal-direct-panel p { margin: 0; color: var(--muted); font-size: 12px; line-height: 1.55; }
      .paypal-direct-detail .paypal-direct-container { min-height: 52px; width: 100%; }
      .paypal-direct-detail .paypal-direct-fallback { padding: 12px; border: 1px dashed #cbd5e1; border-radius: 9px; background: #fff; color: var(--muted); }
      .paypal-direct-detail .paypal-direct-badge { display: inline-flex; width: fit-content; align-items: center; gap: 7px; color: #1c4f8a; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      .paypal-direct-detail .paypal-direct-badge::before { width: 7px; height: 7px; border-radius: 50%; background: #0070ba; content: ''; }
      @media (max-width: 760px) {
        .paypal-direct-detail .paypal-direct-panel { padding: 18px; }
      }
    `;
    document.head.append(style);
  }

  function showPayPalFailure() {
    const container = document.getElementById(containerId);
    if (!container || !container.isConnected) return;
    container.dataset.paypalRendered = 'failed';
    container.innerHTML = '<p class="paypal-direct-fallback">PayPal is temporarily unavailable. Please refresh and try again.</p>';
  }

  function mountPayPal() {
    const container = document.getElementById(containerId);
    if (!container || !container.isConnected || container.dataset.paypalRendered === 'true') return;
    if (!window.paypal?.HostedButtons) {
      mountAttempts += 1;
      if (mountAttempts < 80) window.setTimeout(mountPayPal, 250);
      else showPayPalFailure();
      return;
    }
    try {
      container.dataset.paypalRendered = 'true';
      const rendered = window.paypal.HostedButtons({ hostedButtonId }).render(`#${containerId}`);
      Promise.resolve(rendered).catch(showPayPalFailure);
    } catch {
      showPayPalFailure();
    }
  }

  function loadPayPal() {
    mountAttempts = 0;
    const existing = document.getElementById(sdkId);
    if (!existing) {
      const script = document.createElement('script');
      script.id = sdkId;
      script.src = sdkUrl;
      script.async = true;
      script.addEventListener('load', mountPayPal, { once: true });
      script.addEventListener('error', showPayPalFailure, { once: true });
      document.head.append(script);
    }
    mountPayPal();
  }

  function applyDirectCheckout() {
    if (!targetProductOpen()) return;
    const root = document.querySelector('.detail-wrap.forged-detail');
    const purchase = root?.querySelector('.detail-purchase');
    const titleNode = purchase?.querySelector('.detail-title');
    const imageNode = root?.querySelector('.main-image img');
    if (!root || !purchase || !titleNode || !imageNode) return;
    if (root.dataset.paypalDirectReady === 'true') {
      mountPayPal();
      return;
    }

    const title = titleNode.textContent.trim();
    const imageAlt = imageNode.getAttribute('alt') || title;
    const rawPrice = purchase.querySelector('.detail-price')?.textContent.trim() || '';
    const price = rawPrice.match(/(?:US|USD)?\$[\d,]+(?:\.\d{2})?/)?.[0] || rawPrice;
    root.classList.add('paypal-direct-detail');
    root.querySelectorAll('.forged-specs, .detail-section, .detail-construction-stamp').forEach(element => element.remove());
    purchase.innerHTML = `
      <div class="detail-kicker">CIRUI DIRECT CHECKOUT</div>
      <h1 class="detail-title">${escapeHtml(title)}</h1>
      <p class="detail-fitment-meta">Secure payment for this product through PayPal.</p>
      <div class="detail-price">${escapeHtml(price)} <small>USD</small></div>
      <section class="paypal-direct-panel" aria-labelledby="paypal-direct-title">
        <span class="paypal-direct-badge">PayPal secure checkout</span>
        <div>
          <h2 id="paypal-direct-title">Complete your payment</h2>
          <p>This product uses the fixed PayPal payment configured for CIRUI. No vehicle or customization details are required on this page.</p>
        </div>
        <div class="paypal-direct-container" id="${containerId}" aria-live="polite"></div>
      </section>`;
    imageNode.setAttribute('alt', imageAlt);
    root.dataset.paypalDirectReady = 'true';
    loadPayPal();
  }

  function resetAfterRouteChange() {
    if (!targetProductOpen()) {
      document.querySelectorAll('.paypal-direct-detail').forEach(root => {
        delete root.dataset.paypalDirectReady;
        root.classList.remove('paypal-direct-detail');
      });
    }
  }

  const observer = new MutationObserver(() => {
    resetAfterRouteChange();
    applyDirectCheckout();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => {
    resetAfterRouteChange();
    window.setTimeout(applyDirectCheckout, 0);
  });
  installStyles();
  applyDirectCheckout();
})();
