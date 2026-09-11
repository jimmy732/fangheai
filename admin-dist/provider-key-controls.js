(function installProviderKeyControls() {
  'use strict';

  const nativeFetch = window.fetch.bind(window);
  const state = {
    authorization: '',
    configured: false,
    keyPreview: '',
    preference: 'saved',
    preferenceTouched: false,
    manager: null,
    keyInput: null,
    revealedKey: ''
  };

  function requestUrl(resource) {
    try {
      const value = typeof resource === 'string' ? resource : resource?.url;
      return new URL(value || '', window.location.href);
    } catch {
      return null;
    }
  }

  function storedAuthorization() {
    if (state.authorization) return state.authorization;
    const findToken = (value, depth = 0) => {
      if (!value || depth > 5) return '';
      if (typeof value === 'string') return /^Bearer\s+\S+/i.test(value) ? value : '';
      if (Array.isArray(value)) {
        for (const item of value) {
          const match = findToken(item, depth + 1);
          if (match) return match;
        }
        return '';
      }
      if (typeof value === 'object') {
        for (const [key, item] of Object.entries(value)) {
          if (key === 'token' && typeof item === 'string' && item.trim()) {
            return /^Bearer\s+/i.test(item) ? item.trim() : `Bearer ${item.trim()}`;
          }
          const match = findToken(item, depth + 1);
          if (match) return match;
        }
      }
      return '';
    };
    for (let index = 0; index < window.localStorage.length; index += 1) {
      try {
        const raw = window.localStorage.getItem(window.localStorage.key(index));
        const token = findToken(JSON.parse(raw));
        if (token) return token;
      } catch {
        // Ignore unrelated local-storage entries.
      }
    }
    return '';
  }

  function setInputValue(input, value) {
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
    if (setter) setter.call(input, value);
    else input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function feedback(message, kind = '') {
    const output = state.manager?.querySelector('[data-key-feedback]');
    if (!output) return;
    output.textContent = message;
    output.dataset.kind = kind;
  }

  function hideSecret() {
    state.revealedKey = '';
    const value = state.manager?.querySelector('[data-key-secret]');
    const reveal = state.manager?.querySelector('[data-key-reveal]');
    const copy = state.manager?.querySelector('[data-key-copy]');
    if (value) {
      value.textContent = '';
      value.hidden = true;
    }
    if (copy) copy.hidden = true;
    if (reveal) reveal.textContent = '显示完整 Key';
  }

  function setPreference(preference, announce = true) {
    const wantsSaved = preference === 'saved' && state.configured;
    state.preference = wantsSaved ? 'saved' : 'new';
    const savedChoice = state.manager?.querySelector('input[value="saved"]');
    const newChoice = state.manager?.querySelector('input[value="new"]');
    if (savedChoice) {
      savedChoice.disabled = !state.configured;
      savedChoice.checked = wantsSaved;
    }
    if (newChoice) newChoice.checked = !wantsSaved;
    const badge = state.manager?.querySelector('[data-key-badge]');
    if (badge) {
      badge.textContent = !state.configured ? '不可用' : wantsSaved ? '当前优先' : '已保存可选';
      badge.dataset.active = wantsSaved ? 'true' : 'false';
    }
    if (state.keyInput) {
      state.keyInput.disabled = wantsSaved;
      state.keyInput.setAttribute('aria-disabled', wantsSaved ? 'true' : 'false');
      state.keyInput.placeholder = wantsSaved
        ? `优先使用已保存 Key${state.keyPreview ? `：${state.keyPreview}` : ''}`
        : '粘贴新的 LingkeAI 接口密钥';
      if (wantsSaved) setInputValue(state.keyInput, '');
    }
    state.manager?.classList.toggle('is-using-saved', wantsSaved);
    if (announce) {
      state.preferenceTouched = true;
      feedback(wantsSaved ? '保存时会继续使用服务器中已保存的 Key。' : '请输入新 Key；验证成功后会替换服务器保存值。', 'info');
    }
  }

  function applyStatus(payload) {
    const data = payload?.data || payload || {};
    state.configured = Boolean(data.configured);
    state.keyPreview = String(data.key_preview || '');
    const preview = state.manager?.querySelector('[data-key-preview]');
    const badge = state.manager?.querySelector('[data-key-badge]');
    if (preview) preview.textContent = state.configured ? state.keyPreview || '已保存（脱敏）' : '尚未保存';
    if (badge) {
      badge.dataset.ready = state.configured ? 'true' : 'false';
    }
    setPreference(state.preferenceTouched ? state.preference : state.configured ? 'saved' : 'new', false);
  }

  window.fetch = async function fboxKeyAwareFetch(resource, options = {}) {
    const url = requestUrl(resource);
    const request = typeof Request !== 'undefined' && resource instanceof Request ? resource : null;
    const headers = new Headers(options.headers || request?.headers || {});
    const authorization = headers.get('Authorization');
    if (authorization && url?.pathname.startsWith('/api/')) state.authorization = authorization;

    let nextOptions = options;
    const method = String(options.method || request?.method || 'GET').toUpperCase();
    if (url?.pathname.replace(/\/$/, '') === '/api/fbox-admin/config' && method === 'PUT' && typeof options.body === 'string') {
      try {
        const body = JSON.parse(options.body);
        body.credential_preference = state.preference;
        if (state.preference === 'saved') body.api_key = '';
        nextOptions = { ...options, body: JSON.stringify(body) };
      } catch {
        // Leave non-JSON requests untouched.
      }
    }

    const response = await nativeFetch(resource, nextOptions);
    if (url?.pathname.replace(/\/$/, '') === '/api/fbox-admin/status' && response.ok) {
      response.clone().json().then(applyStatus).catch(() => {});
    }
    if (url?.pathname.replace(/\/$/, '') === '/api/fbox-admin/config' && method === 'PUT' && response.ok) {
      response.clone().json().then(payload => {
        state.preferenceTouched = false;
        applyStatus(payload);
        hideSecret();
        feedback('配置已保存，服务器已保存 Key 继续作为优先凭证。', 'success');
      }).catch(() => {});
    }
    return response;
  };

  async function revealSecret() {
    if (state.revealedKey) {
      hideSecret();
      return;
    }
    const authorization = storedAuthorization();
    if (!authorization) {
      feedback('无法读取管理员登录状态，请刷新页面后重试。', 'error');
      return;
    }
    const button = state.manager?.querySelector('[data-key-reveal]');
    if (button) button.disabled = true;
    feedback('正在从服务器读取已保存 Key…', 'info');
    try {
      const response = await nativeFetch('/api/fbox-admin/config/secret', {
        headers: { Accept: 'application/json', Authorization: authorization },
        cache: 'no-store'
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.detail || payload.message || '读取已保存 Key 失败。');
      state.revealedKey = String(payload?.data?.api_key || payload?.api_key || '');
      if (!state.revealedKey) throw new Error('服务器没有返回已保存 Key。');
      const value = state.manager?.querySelector('[data-key-secret]');
      const copy = state.manager?.querySelector('[data-key-copy]');
      if (value) {
        value.textContent = state.revealedKey;
        value.hidden = false;
      }
      if (copy) copy.hidden = false;
      if (button) button.textContent = '隐藏完整 Key';
      feedback('完整 Key 仅在当前管理员页面临时显示；离开页面后会清除。', 'success');
    } catch (error) {
      hideSecret();
      feedback(error instanceof Error ? error.message : '读取已保存 Key 失败。', 'error');
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function copySecret() {
    if (!state.revealedKey) return;
    try {
      await navigator.clipboard.writeText(state.revealedKey);
      feedback('完整 Key 已复制到剪贴板。', 'success');
    } catch {
      feedback('浏览器不允许自动复制，请手动选择上方 Key。', 'error');
    }
  }

  function managerTemplate() {
    return `
      <section class="fbox-provider-key-manager" aria-label="API Key 使用优先级">
        <div class="fbox-provider-key-title">
          <strong>优先使用哪个 Key</strong>
          <span>图片生成与 GPT-5.5 客服助手共用所选凭证</span>
        </div>
        <label class="fbox-provider-key-choice">
          <input type="radio" name="fbox-provider-key-preference" value="saved">
          <span><b>服务器已保存 Key</b><small data-key-preview>读取中…</small></span>
          <em data-key-badge>读取中</em>
        </label>
        <label class="fbox-provider-key-choice">
          <input type="radio" name="fbox-provider-key-preference" value="new">
          <span><b>输入新 Key</b><small>验证成功后替换服务器保存值</small></span>
        </label>
        <div class="fbox-provider-key-secret-row">
          <button type="button" data-key-reveal>显示完整 Key</button>
          <button type="button" data-key-copy hidden>复制 Key</button>
          <code data-key-secret hidden></code>
        </div>
        <p class="fbox-provider-key-feedback" data-key-feedback role="status"></p>
      </section>`;
  }

  function findKeyFormItem() {
    return [...document.querySelectorAll('.config-form .el-form-item')].find(item => {
      const label = item.querySelector('.el-form-item__label');
      return label && /接口密钥|API Key/i.test(label.textContent || '');
    });
  }

  function reconcile() {
    if (!window.location.hash.startsWith('#/fbox/visualizer')) {
      if (state.manager) hideSecret();
      state.preferenceTouched = false;
      state.manager = null;
      state.keyInput = null;
      return;
    }
    const item = findKeyFormItem();
    if (!item) return;
    const input = item.querySelector('.el-input__inner[type="password"], input[type="password"]');
    if (!input) return;
    const existingManager = item.querySelector('.fbox-provider-key-manager');
    if (existingManager) {
      state.manager = existingManager;
      state.keyInput = input;
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.innerHTML = managerTemplate().trim();
    const manager = wrapper.firstElementChild;
    const content = item.querySelector('.el-form-item__content') || item;
    let inputShell = input;
    while (inputShell.parentElement && inputShell.parentElement !== content) inputShell = inputShell.parentElement;
    if (inputShell.parentElement === content) content.insertBefore(manager, inputShell);
    else content.prepend(manager);
    state.manager = manager;
    state.keyInput = input;

    const oldHint = item.querySelector('.field-hint');
    if (oldHint) oldHint.textContent = '已保存 Key 默认脱敏。只有登录后的管理员主动点击“显示完整 Key”时才会临时取回，且不会进入公开前台构建文件。';
    manager.addEventListener('change', event => {
      if (event.target instanceof HTMLInputElement && event.target.name === 'fbox-provider-key-preference') setPreference(event.target.value);
    });
    manager.querySelector('[data-key-reveal]')?.addEventListener('click', revealSecret);
    manager.querySelector('[data-key-copy]')?.addEventListener('click', copySecret);
    applyStatus({ configured: state.configured, key_preview: state.keyPreview });

    const authorization = storedAuthorization();
    if (authorization) {
      nativeFetch('/api/fbox-admin/status', { headers: { Accept: 'application/json', Authorization: authorization }, cache: 'no-store' })
        .then(response => response.ok ? response.json() : null)
        .then(payload => payload && applyStatus(payload))
        .catch(() => {});
    }
  }

  function blockInvalidSave(event) {
    if (!state.manager?.isConnected) return;
    const isSubmit = event.type === 'submit';
    const button = event.target instanceof Element ? event.target.closest('button') : null;
    if (!isSubmit && (!button || !/保存并验证实时路由/.test(button.textContent || ''))) return;
    const missingSaved = state.preference === 'saved' && !state.configured;
    const missingNew = state.preference === 'new' && !String(state.keyInput?.value || '').trim();
    if (!missingSaved && !missingNew) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    feedback(missingSaved ? '服务器还没有保存 Key，请选择“输入新 Key”。' : '请输入新的 LingkeAI API Key 后再保存。', 'error');
    if (missingNew) state.keyInput?.focus();
  }

  document.addEventListener('click', blockInvalidSave, true);
  document.addEventListener('submit', blockInvalidSave, true);
  window.addEventListener('hashchange', () => {
    if (!window.location.hash.startsWith('#/fbox/visualizer')) hideSecret();
    window.setTimeout(reconcile, 0);
  });
  const observer = new MutationObserver(() => window.requestAnimationFrame(reconcile));
  observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', reconcile, { once: true });
  else reconcile();
})();
