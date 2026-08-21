// F-Box operator console: traffic analytics, customer management and review
// moderation. Runs alongside the visualizer-route admin page; talks only to
// the same-origin F-Box backend.

const state = {
  token: localStorage.getItem('fbox-console-token') || '',
  view: 'dashboard',
  range: '30d',
  dashboard: null,
  customers: [],
  customerFilter: { q: '', country: '', grade: '' },
  reviews: [],
  reviewFilter: 'pending'
};

const viewTitles = {
  dashboard: '数据面板',
  customers: '客户管理',
  reviews: '评价管理',
  visualizer: '效果图配置'
};

const el = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const num = value => Number(value || 0).toLocaleString('en-US');
const dateLabel = value => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(state.token ? { Authorization: state.token.startsWith('Bearer ') ? state.token : `Bearer ${state.token}` } : {}),
      ...(options.headers || {})
    }
  });
  if (response.status === 401 && state.token) {
    state.token = '';
    localStorage.removeItem('fbox-console-token');
    showAuth();
    throw new Error('登录已过期，请重新登录。');
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail || payload.message || `请求失败 (${response.status})`);
  return payload;
}

function showAuth() {
  el('#console-auth').hidden = false;
  el('#console-app').hidden = true;
}

function showApp() {
  el('#console-auth').hidden = true;
  el('#console-app').hidden = false;
  el('#console-operator').textContent = 'admin';
}

async function ensureSession() {
  if (!state.token) { showAuth(); return false; }
  try {
    await api('/api/fbox-auth/info');
    showApp();
    return true;
  } catch {
    showAuth();
    return false;
  }
}

function setView(view) {
  state.view = view;
  document.querySelectorAll('.console-nav-item').forEach(button => button.classList.toggle('is-active', button.dataset.view === view));
  el('#console-view-title').textContent = viewTitles[view] || view;
  el('#console-range').style.display = view === 'dashboard' ? '' : 'none';
  renderView();
}

async function renderView() {
  if (state.view === 'dashboard') return renderDashboard();
  if (state.view === 'customers') return renderCustomers();
  if (state.view === 'reviews') return renderReviews();
  if (state.view === 'visualizer') return renderVisualizerNote();
}

// ---------------------------------------------------------------- dashboard
async function renderDashboard() {
  const root = el('#console-view');
  root.innerHTML = '<div class="console-loading">正在读取流量数据…</div>';
  try {
    const payload = await api(`/api/fbox-ops/analytics?range=${state.range}`);
    state.dashboard = payload.data;
    root.innerHTML = dashboardMarkup(payload.data);
    drawCharts(payload.data);
  } catch (error) {
    root.innerHTML = `<div class="console-error">${esc(error.message)}</div>`;
  }
}

function kpi(label, value, note = '', accent = false) {
  return `<article class="kpi-card ${accent ? 'is-accent' : ''}"><span>${label}</span><strong>${value}</strong>${note ? `<small>${note}</small>` : ''}</article>`;
}

function barList(rows, emptyText) {
  if (!rows || !rows.length) return `<div class="empty-console">${emptyText}</div>`;
  const max = Math.max(...rows.map(row => row.value), 1);
  return `<div class="bar-list">${rows.slice(0, 10).map(row => `<div class="bar-row"><span class="bar-label" title="${esc(row.label)}">${esc(row.label)}</span><span class="bar-track"><span class="bar-fill" style="width:${Math.round((row.value / max) * 100)}%"></span></span><span class="bar-value">${num(row.value)}</span></div>`).join('')}</div>`;
}

function dashboardMarkup(data) {
  const t = data.totals || {};
  const kpis = [
    kpi('独立访客', num(t.unique_visitors), '按 IP 去重', true),
    kpi('页面浏览', num(t.page_views)),
    kpi('商品详情浏览', num(t.product_views)),
    kpi('关键点击', num(t.clicks), '加购 / 询价 / 效果图'),
    kpi('注册客户', num(t.registered_customers), `本期新增 ${num(t.new_registrations)}`),
    kpi('询价线索', num(t.inquiries)),
    kpi('订单', num(t.orders))
  ].join('');

  const recentRows = (data.recent_events || []).map(event => `<tr>
    <td class="cell-muted">${dateLabel(event.created_at)}</td>
    <td><span class="chip ${event.type === 'product_view' ? 'chip-country' : event.type === 'click' ? 'chip-grade-b' : 'chip-grade-c'}">${esc(event.type)}</span></td>
    <td class="cell-main">${esc(event.product_name || event.title || event.path || '/')}</td>
    <td>${event.country ? `<span class="chip chip-country">${esc(event.country)}</span>` : '<span class="cell-muted">—</span>'}</td>
    <td class="cell-muted">${esc(event.city || '')}</td>
    <td class="cell-muted">${esc(event.ip || 'local')}</td>
    <td class="cell-muted">${esc(event.source || 'Direct')}</td>
  </tr>`).join('');

  return `
    <div class="kpi-grid">${kpis}</div>
    <div class="panel-grid">
      <div class="console-card span-2"><h3>流量趋势</h3><p class="card-note">按天统计浏览、商品浏览与访客。用来判断推广活动和市场的节奏。</p><canvas id="chart-trend" height="120"></canvas></div>
      <div class="console-card"><h3>访客国家 / 地区</h3><p class="card-note">IP 解析出的客户所在地，决定营销优先级。</p>${barList(data.countries, '还没有识别出国家的访客。')}</div>
      <div class="console-card"><h3>流量来源</h3><p class="card-note">客户从哪里点进来（搜索引擎 / 社媒 / 直接访问）。</p>${barList(data.sources, '目前全部是直接访问。')}</div>
      <div class="console-card"><h3>热门页面</h3><p class="card-note">客户落地的页面分布。</p>${barList(data.pages, '暂无页面数据。')}</div>
      <div class="console-card"><h3>热门商品</h3><p class="card-note">商品详情页浏览量，最接近购买意向。</p>${barList(data.products, '暂无商品浏览。')}</div>
      <div class="console-card"><h3>访客语言</h3><p class="card-note">浏览器/界面语言分布，辅助决定客服与文案语言。</p>${barList(data.locales, '暂无语言数据。')}</div>
    </div>
    <div class="console-card"><h3>实时事件</h3><p class="card-note">最近 40 条访客行为。点击“客户管理”看沉淀下来的线索。</p>
      <div class="console-table-wrap"><table class="console-table"><thead><tr><th>时间</th><th>类型</th><th>内容</th><th>国家</th><th>城市</th><th>IP</th><th>来源</th></tr></thead><tbody>${recentRows || '<tr><td colspan="7" class="cell-muted">暂无事件。打开前台页面逛一圈，这里就会动起来。</td></tr>'}</tbody></table></div>
    </div>`;
}

let trendChart = null;
function drawCharts(data) {
  const canvas = el('#chart-trend');
  if (!canvas || typeof Chart === 'undefined') return;
  if (trendChart) { trendChart.destroy(); trendChart = null; }
  const days = data.days || [];
  trendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: days.map(day => day.date.slice(5)),
      datasets: [
        { label: '页面浏览', data: days.map(day => day.page_views), borderColor: '#a98cff', backgroundColor: 'rgba(169,140,255,0.14)', tension: 0.35, fill: true, pointRadius: 0 },
        { label: '商品浏览', data: days.map(day => day.product_views), borderColor: '#c8ff1a', backgroundColor: 'rgba(200,255,26,0.1)', tension: 0.35, fill: true, pointRadius: 0 },
        { label: '独立访客', data: days.map(day => day.visitors), borderColor: '#6ea8fe', backgroundColor: 'transparent', tension: 0.35, pointRadius: 0, borderDash: [5, 4] }
      ]
    },
    options: {
      plugins: { legend: { labels: { color: '#8b96a3', boxWidth: 12, font: { size: 11 } } } },
      scales: {
        x: { ticks: { color: '#8b96a3', font: { size: 10 }, maxTicksLimit: 12 }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { beginAtZero: true, ticks: { color: '#8b96a3', font: { size: 10 }, precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' } }
      },
      interaction: { mode: 'index', intersect: false }
    }
  });
}

// ---------------------------------------------------------------- customers
async function renderCustomers() {
  const root = el('#console-view');
  root.innerHTML = '<div class="console-loading">正在汇总客户线索…</div>';
  try {
    const params = new URLSearchParams();
    if (state.customerFilter.q) params.set('q', state.customerFilter.q);
    if (state.customerFilter.country) params.set('country', state.customerFilter.country);
    if (state.customerFilter.grade) params.set('grade', state.customerFilter.grade);
    const payload = await api(`/api/fbox-ops/customers?${params}`);
    state.customers = payload.data || [];
    root.innerHTML = customersMarkup(state.customers);
    wireCustomerToolbar();
  } catch (error) {
    root.innerHTML = `<div class="console-error">${esc(error.message)}</div>`;
  }
}

function customersMarkup(customers) {
  const countries = [...new Set(customers.map(item => item.country).filter(Boolean))];
  const rows = customers.map(item => `<tr>
    <td><span class="chip chip-grade-${item.grade.toLowerCase()}">${item.grade}</span></td>
    <td class="cell-main">${esc(item.username)}</td>
    <td class="cell-muted">${esc(item.email || '—')}</td>
    <td class="cell-muted">${esc(item.telephone || '—')}</td>
    <td class="cell-muted">${esc(item.company || '—')}</td>
    <td>${item.country ? `<span class="chip chip-country">${esc(item.country)}</span>` : '<span class="cell-muted">—</span>'}</td>
    <td class="cell-muted">${num(item.orders)} 单 / ${num(item.inquiries)} 询价</td>
    <td class="cell-muted">${esc((item.interest || []).slice(0, 2).join('、') || '—')}</td>
    <td class="cell-muted">${dateLabel(item.created_at)}</td>
    <td class="cell-muted">${dateLabel(item.last_seen_at)}</td>
  </tr>`).join('');

  return `
    <div class="console-toolbar">
      <input id="customer-q" placeholder="搜用户名 / 邮箱 / 公司" value="${esc(state.customerFilter.q)}">
      <select id="customer-country"><option value="">全部国家</option>${countries.map(country => `<option ${state.customerFilter.country === country ? 'selected' : ''}>${esc(country)}</option>`).join('')}</select>
      <select id="customer-grade"><option value="">全部等级</option><option value="A" ${state.customerFilter.grade === 'A' ? 'selected' : ''}>A · 高意向</option><option value="B" ${state.customerFilter.grade === 'B' ? 'selected' : ''}>B · 有互动</option><option value="C" ${state.customerFilter.grade === 'C' ? 'selected' : ''}>C · 新注册</option></select>
      <span class="spacer"></span>
      <button class="console-btn" id="customer-export">导出 CSV</button>
    </div>
    <p class="card-note">等级规则：A = 有订单或已报价询价；B = 有询价或浏览过 2 个以上商品；C = 新注册。CSV 可直接导入邮件营销工具做分国家触达。</p>
    <div class="console-table-wrap"><table class="console-table"><thead><tr><th>等级</th><th>用户名</th><th>邮箱</th><th>电话</th><th>公司</th><th>国家</th><th>订单/询价</th><th>关注商品</th><th>注册时间</th><th>最近活跃</th></tr></thead><tbody>${rows || '<tr><td colspan="10" class="cell-muted">还没有注册客户。前台注册功能已上线，第一批客户进来后会列在这里。</td></tr>'}</tbody></table></div>`;
}

function wireCustomerToolbar() {
  const q = el('#customer-q');
  const country = el('#customer-country');
  const grade = el('#customer-grade');
  let timer = null;
  q?.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => { state.customerFilter.q = q.value.trim(); renderCustomers(); }, 350);
  });
  country?.addEventListener('change', () => { state.customerFilter.country = country.value; renderCustomers(); });
  grade?.addEventListener('change', () => { state.customerFilter.grade = grade.value; renderCustomers(); });
  el('#customer-export')?.addEventListener('click', async () => {
    try {
      const response = await fetch('/api/fbox-ops/customers/export', { headers: { Authorization: `Bearer ${state.token}` } });
      if (!response.ok) throw new Error('导出失败');
      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `fbox-customers-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch { /* toast-free: button click already gave feedback via download */ }
  });
}

// ------------------------------------------------------------------ reviews
async function renderReviews() {
  const root = el('#console-view');
  root.innerHTML = '<div class="console-loading">正在读取评价…</div>';
  try {
    const payload = await api('/api/fbox-ops/reviews');
    state.reviews = payload.data || [];
    root.innerHTML = reviewsMarkup(state.reviews);
    wireReviewToolbar();
  } catch (error) {
    root.innerHTML = `<div class="console-error">${esc(error.message)}</div>`;
  }
}

function reviewsMarkup(reviews) {
  const filtered = state.reviewFilter === 'all' ? reviews : reviews.filter(item => item.status === state.reviewFilter);
  const counts = { pending: 0, approved: 0, hidden: 0, rejected: 0 };
  reviews.forEach(item => { counts[item.status] = (counts[item.status] || 0) + 1; });
  const rows = filtered.map(item => `<tr>
    <td><span class="chip chip-${item.status}">${esc(item.status)}</span></td>
    <td class="cell-main">${esc(item.product_name || item.product_id || '—')}</td>
    <td class="cell-muted">${'★'.repeat(Math.round(Number(item.rating || 5)))}</td>
    <td class="review-admin-body"><strong>${esc(item.title)}</strong><br>${esc(item.body)}</td>
    <td class="cell-muted">${esc(item.customer_name || '—')}${item.customer_country ? `<br><span class="chip chip-country">${esc(item.customer_country)}</span>` : ''}</td>
    <td class="cell-muted">${esc(item.source_platform || item.source || '')}</td>
    <td class="cell-muted">${dateLabel(item.created_at)}</td>
    <td>
      ${item.status !== 'approved' ? `<button class="console-btn is-small" data-review-approve="${esc(item.id)}">发布</button>` : ''}
      ${item.status !== 'hidden' ? `<button class="console-btn is-small" data-review-hide="${esc(item.id)}">隐藏</button>` : ''}
      <button class="console-btn is-small is-danger" data-review-delete="${esc(item.id)}">删除</button>
    </td>
  </tr>`).join('');

  return `
    <div class="console-toolbar">
      ${['pending', 'approved', 'hidden', 'all'].map(key => `<button class="console-btn ${state.reviewFilter === key ? 'is-primary' : ''}" data-review-filter="${key}">${{ pending: '待审核', approved: '已发布', hidden: '已隐藏', all: '全部' }[key]}${key === 'all' ? '' : ` (${counts[key] || 0})`}</button>`).join('')}
    </div>
    <p class="card-note">已发布评价会实时出现在对应商品详情页；导入的 100 条真实客户评价已经按商品分配并发布。</p>
    <div class="console-table-wrap"><table class="console-table"><thead><tr><th>状态</th><th>商品</th><th>评分</th><th>评价内容</th><th>客户</th><th>来源</th><th>时间</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="8" class="cell-muted">该状态下暂无评价。</td></tr>'}</tbody></table></div>`;
}

function wireReviewToolbar() {
  document.querySelectorAll('[data-review-filter]').forEach(button => button.addEventListener('click', () => { state.reviewFilter = button.dataset.reviewFilter; renderReviews(); }));
  document.querySelectorAll('[data-review-approve]').forEach(button => button.addEventListener('click', () => updateReview(button.dataset.reviewApprove, { status: 'approved', consent_confirmed: true })));
  document.querySelectorAll('[data-review-hide]').forEach(button => button.addEventListener('click', () => updateReview(button.dataset.reviewHide, { status: 'hidden' })));
  document.querySelectorAll('[data-review-delete]').forEach(button => button.addEventListener('click', async () => {
    if (!window.confirm('确认删除这条评价？')) return;
    try { await api(`/api/fbox-ops/reviews/${encodeURIComponent(button.dataset.reviewDelete)}`, { method: 'DELETE' }); renderReviews(); }
    catch (error) { window.alert(error.message); }
  }));
}

async function updateReview(id, payload) {
  try {
    await api(`/api/fbox-ops/reviews/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(payload) });
    renderReviews();
  } catch (error) { window.alert(error.message); }
}

// --------------------------------------------------------------- visualizer
function renderVisualizerNote() {
  el('#console-view').innerHTML = `<div class="console-card"><h3>效果图通道</h3><p class="card-note">LingkeAI gpt-image-2 的密钥配置在本页下方的「GPT Image 2 connection」面板中，保存后即时生效。当前状态见下方状态卡。</p><p class="card-note">效果图任务记录、询价和报价在完整版管理端（_mall-admin-web）中维护；本控制台聚焦外贸获客数据。</p></div>`;
}

// -------------------------------------------------------------------- wire
el('#console-login-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const values = new FormData(event.currentTarget);
  const messageEl = el('#console-login-message');
  messageEl.textContent = '正在登录…';
  try {
    const response = await fetch('/api/fbox-auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username: values.get('username'), password: values.get('password') })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(payload.message || payload.detail || '登录失败');
    state.token = `${payload?.data?.tokenHead || 'Bearer '}${payload?.data?.token || ''}`.trim();
    localStorage.setItem('fbox-console-token', state.token);
    messageEl.textContent = '';
    showApp();
    setView('dashboard');
  } catch (error) {
    messageEl.textContent = error.message;
    messageEl.className = 'message error';
  }
});

document.querySelectorAll('.console-nav-item').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
el('#console-range')?.addEventListener('change', event => { state.range = event.target.value; renderDashboard(); });
el('#console-refresh')?.addEventListener('click', () => renderView());
el('#console-logout')?.addEventListener('click', async () => {
  try { await api('/api/fbox-auth/logout', { method: 'POST' }); } catch { /* best-effort */ }
  state.token = '';
  localStorage.removeItem('fbox-console-token');
  showAuth();
});

ensureSession().then(ok => { if (ok) setView('dashboard'); });
