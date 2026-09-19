(() => {
  const productId = 'cr-c8z06-track-001';
  const hostedButtonId = 'LB7ZA6K8HAL2C';
  const paymentUrl = `https://www.paypal.com/ncp/payment/${hostedButtonId}`;

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
      .paypal-direct-detail .paypal-direct-form { margin: 0; }
      .paypal-direct-detail .paypal-direct-link {
        display: flex;
        width: 100%;
        min-height: 54px;
        align-items: center;
        justify-content: center;
        gap: 10px;
        border: 0;
        border-radius: 999px;
        background: #ffc439;
        box-shadow: 0 7px 18px rgba(0, 48, 135, .14);
        color: #111820;
        cursor: pointer;
        font: 700 15px/1 'DM Sans', sans-serif;
      }
      .paypal-direct-detail .paypal-direct-link:hover { background: #f4b921; transform: translateY(-1px); }
      .paypal-direct-detail .paypal-direct-wordmark { color: #003087; font-size: 22px; font-style: italic; font-weight: 900; letter-spacing: -.07em; }
      .paypal-direct-detail .paypal-direct-link-note { text-align: center; }
      .paypal-direct-detail .paypal-direct-badge { display: inline-flex; width: fit-content; align-items: center; gap: 7px; color: #1c4f8a; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
      .paypal-direct-detail .paypal-direct-badge::before { width: 7px; height: 7px; border-radius: 50%; background: #0070ba; content: ''; }
      @media (max-width: 760px) {
        .paypal-direct-detail .paypal-direct-panel { padding: 18px; }
      }
    `;
    document.head.append(style);
  }

  function applyDirectCheckout() {
    if (!targetProductOpen()) return;
    const root = document.querySelector('.detail-wrap.forged-detail');
    const purchase = root?.querySelector('.detail-purchase');
    const titleNode = purchase?.querySelector('.detail-title');
    const imageNode = root?.querySelector('.main-image img');
    if (!root || !purchase || !titleNode || !imageNode) return;
    if (root.dataset.paypalDirectReady === 'true') return;

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
        <form class="paypal-direct-form" action="${paymentUrl}" method="post" target="_blank">
          <button class="paypal-direct-link" type="submit" aria-label="Pay securely with PayPal">
            <span class="paypal-direct-wordmark">PayPal</span>
            <span>Pay now</span>
          </button>
        </form>
        <p class="paypal-direct-link-note">Opens the official PayPal secure checkout page.</p>
      </section>`;
    imageNode.setAttribute('alt', imageAlt);
    root.dataset.paypalDirectReady = 'true';
  }

  function resetAfterRouteChange() {
    if (!targetProductOpen()) {
      document.querySelectorAll('.paypal-direct-detail').forEach(root => {
        delete root.dataset.paypalDirectReady;
        root.classList.remove('paypal-direct-detail');
      });
    }
  }

  const appRoot = document.querySelector('#app');
  const observer = new MutationObserver(() => {
    if (targetProductOpen()) applyDirectCheckout();
  });
  // Watch only top-level app renders. PayPal mutates its own iframe subtree heavily;
  // observing the whole document makes the browser process thousands of callbacks.
  if (appRoot) observer.observe(appRoot, { childList: true });
  window.addEventListener('hashchange', () => {
    resetAfterRouteChange();
    window.setTimeout(applyDirectCheckout, 0);
  });
  installStyles();
  applyDirectCheckout();
})();
