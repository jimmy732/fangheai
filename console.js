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
  reviewFilter: 'pending',
  blogPosts: [],
  blogStatus: 'all',
  blogEditingId: '',
  fitmentParts: [],
  fitmentFilter: { q: '', type: '', status: '' },
  fitmentEditingId: '',
  fitmentResult: null,
  fitmentCheckPayload: null
};

const viewTitles = {
  dashboard: '数据面板',
  customers: '客户管理',
  reviews: '评价管理',
  blog: '博客管理',
  fitment: '适配实验室',
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
  if (state.view === 'blog') return renderBlog();
  if (state.view === 'fitment') return renderFitment();
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

// ---------------------------------------------------------------------- blog
async function renderBlog() {
  const root = el('#console-view');
  root.innerHTML = '<div class="console-loading">正在读取博客内容…</div>';
  try {
    const payload = await api('/api/fbox-ops/blog');
    state.blogPosts = payload.data || [];
    root.innerHTML = blogMarkup(state.blogPosts);
    wireBlogView();
  } catch (error) {
    root.innerHTML = `<div class="console-error">${esc(error.message)}</div>`;
  }
}

function blogStatusLabel(status) {
  return { draft: '草稿', published: '已发布', archived: '已归档' }[status] || status || '草稿';
}

function localDateTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function blogEditorMarkup(post = {}) {
  const editing = Boolean(post.id);
  return `<div class="console-card blog-editor"><div class="blog-editor-head"><div><h3>${editing ? '编辑文章' : '新建文章'}</h3><p class="card-note">发布后文章会立即出现在前台 Journal；草稿不会公开。</p></div><button class="console-btn" type="button" data-blog-cancel>取消</button></div><form id="blog-form" class="blog-form"><input type="hidden" name="id" value="${esc(post.id || '')}"><div class="blog-form-grid"><label>标题<input name="title" required value="${esc(post.title || '')}" placeholder="例如: How to Read Wheel Specs"></label><label>Slug<input name="slug" value="${esc(post.slug || '')}" placeholder="留空则按标题生成"></label><label>分类<input name="category" value="${esc(post.category || 'Guides')}" placeholder="Fitment / Technical / Engineering"></label><label>封面图片<input name="cover_image" value="${esc(post.cover_image || 'halo-20-spoke-01.png')}" placeholder="assets/your-image.png"></label><label>作者<input name="author" value="${esc(post.author || 'F-Box Editorial')}"></label><label>阅读时间<input name="read_time" value="${esc(post.read_time || '5 min read')}"></label><label class="field-wide">摘要<textarea name="excerpt" rows="3" required placeholder="列表页和社交分享使用的短摘要">${esc(post.excerpt || '')}</textarea></label><label>状态<select name="status"><option value="draft" ${post.status === 'draft' || !post.status ? 'selected' : ''}>草稿</option><option value="published" ${post.status === 'published' ? 'selected' : ''}>发布</option><option value="archived" ${post.status === 'archived' ? 'selected' : ''}>归档</option></select></label><label>发布时间<input name="published_at" type="datetime-local" value="${esc(localDateTime(post.published_at))}"></label><label class="field-wide">标签<input name="tags" value="${esc((post.tags || []).join(', '))}" placeholder="fitment, custom wheels, brake clearance"></label><label class="blog-featured-toggle"><input name="featured" type="checkbox" ${post.featured ? 'checked' : ''}> 设为首页精选文章</label><label class="field-wide">正文<textarea name="body" rows="18" required placeholder="段落之间空一行；用 ## 开头表示小标题">${esc(post.body || '')}</textarea><span class="field-note">支持普通段落；单独一行以 ## 开头会显示为文章小标题。</span></label></div><div class="actions"><button class="console-btn is-primary" type="submit">${editing ? '保存修改' : '创建文章'}</button></div><p class="message" id="blog-form-message" role="status"></p></form></div>`;
}

function blogMarkup(posts) {
  const filtered = state.blogStatus === 'all' ? posts : posts.filter(post => post.status === state.blogStatus);
  const counts = { all: posts.length, draft: 0, published: 0, archived: 0 };
  posts.forEach(post => { counts[post.status] = (counts[post.status] || 0) + 1; });
  const editingPost = state.blogEditingId && state.blogEditingId !== 'new' ? posts.find(post => post.id === state.blogEditingId) : {};
  const rows = filtered.map(post => `<tr><td class="cell-main"><strong>${esc(post.title)}</strong><br><span class="cell-muted">/${esc(post.slug)}</span></td><td><span class="chip chip-${post.status === 'published' ? 'approved' : post.status === 'draft' ? 'pending' : 'hidden'}">${blogStatusLabel(post.status)}</span></td><td>${esc(post.category)}</td><td class="cell-muted">${esc(post.author)}</td><td class="cell-muted">${dateLabel(post.published_at || post.updated_at)}</td><td><button class="console-btn is-small" data-blog-edit="${esc(post.id)}">编辑</button><button class="console-btn is-small is-danger" data-blog-delete="${esc(post.id)}">删除</button></td></tr>`).join('');
  return `${state.blogEditingId ? blogEditorMarkup(editingPost) : ''}<div class="console-toolbar"><button class="console-btn is-primary" data-blog-new>新建文章</button><span class="spacer"></span>${['all', 'draft', 'published', 'archived'].map(status => `<button class="console-btn ${state.blogStatus === status ? 'is-primary' : ''}" data-blog-status="${status}">${status === 'all' ? '全部' : blogStatusLabel(status)} (${counts[status] || 0})</button>`).join('')}</div><p class="card-note">Journal 入口位于前台主导航和首页内容末端。文章可以先存为草稿，确认摘要、封面和正文后再发布。</p><div class="console-table-wrap"><table class="console-table"><thead><tr><th>文章</th><th>状态</th><th>分类</th><th>作者</th><th>更新时间</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="cell-muted">该状态下暂无文章。</td></tr>'}</tbody></table></div>`;
}

function wireBlogView() {
  el('[data-blog-new]')?.addEventListener('click', () => { state.blogEditingId = 'new'; renderBlog(); });
  el('[data-blog-cancel]')?.addEventListener('click', () => { state.blogEditingId = ''; renderBlog(); });
  document.querySelectorAll('[data-blog-status]').forEach(button => button.addEventListener('click', () => { state.blogStatus = button.dataset.blogStatus; renderBlog(); }));
  document.querySelectorAll('[data-blog-edit]').forEach(button => button.addEventListener('click', () => { state.blogEditingId = button.dataset.blogEdit; renderBlog(); }));
  document.querySelectorAll('[data-blog-delete]').forEach(button => button.addEventListener('click', async () => {
    if (!window.confirm('确认删除这篇文章？')) return;
    try { await api(`/api/fbox-ops/blog/${encodeURIComponent(button.dataset.blogDelete)}`, { method: 'DELETE' }); renderBlog(); }
    catch (error) { window.alert(error.message); }
  }));
  el('#blog-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    const id = String(values.get('id') || '').trim();
    const publishedAt = String(values.get('published_at') || '').trim();
    const payload = {
      title: values.get('title'), slug: values.get('slug'), category: values.get('category'), cover_image: values.get('cover_image'), author: values.get('author'), read_time: values.get('read_time'), excerpt: values.get('excerpt'), tags: String(values.get('tags') || '').split(',').map(item => item.trim()).filter(Boolean), status: values.get('status'), featured: values.get('featured') === 'on', published_at: publishedAt ? new Date(publishedAt).toISOString() : '', body: values.get('body')
    };
    const message = el('#blog-form-message');
    message.textContent = '正在保存…';
    try {
      await api(id ? `/api/fbox-ops/blog/${encodeURIComponent(id)}` : '/api/fbox-ops/blog', { method: id ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      state.blogEditingId = '';
      await renderBlog();
    } catch (error) { message.textContent = error.message; message.className = 'message error'; }
  });
}

// ---------------------------------------------------------------- fitment lab
const fitmentTypeLabels = { brake: '刹车套件', caliper: '刹车卡钳', rotor: '刹车盘', pad: '刹车片', suspension: '避震 / 绞牙', spacer: '法兰 / 垫片', 'control-arm': '控制臂', 'top-mount': '塔顶', tire: '轮胎', other: '其他' };
function fitmentTypeLabel(type) { return fitmentTypeLabels[type] || type || '其他'; }
function fitmentStatusLabel(status) { return { active: '启用', draft: '草稿', archived: '归档' }[status] || status || '草稿'; }
function fitmentConfidenceLabel(value) { return { 'source-listed': '来源已列出', 'operator-verified': '人工核验', 'customer-measured': '客户实测', 'catalog-extracted': '目录提取', 'marketplace-listed': '商城列出', 'needs-review': '待复核' }[value] || value || '待复核'; }
function fitmentVerificationLabel(value) { return { source_catalog: '来源目录', application_verified: '车型已核验', template_verified: '模板已核验', customer_measured: '客户实测', 'needs-review': '待复核' }[value] || value || '待复核'; }

function fitmentPartEditorMarkupLegacy(part = {}) {
  const editing = Boolean(part.id);
  return `<div class="console-card fitment-part-editor"><div class="fitment-admin-head"><div><h3>${editing ? '编辑适配部件' : '新增适配部件'}</h3><p class="card-note">品牌、型号和规则用于自动匹配；规格 JSON 保存制动尺寸、最低轮径、避震范围等工程数据。</p></div><button class="console-btn" type="button" data-fitment-cancel>取消</button></div><form id="fitment-part-form" class="fitment-admin-form"><input type="hidden" name="id" value="${esc(part.id || '')}"><div class="fitment-admin-form-grid"><label>类型<select name="type"><option value="brake" ${part.type === 'brake' ? 'selected' : ''}>刹车套件</option><option value="caliper" ${part.type === 'caliper' ? 'selected' : ''}>刹车卡钳</option><option value="rotor" ${part.type === 'rotor' ? 'selected' : ''}>刹车盘</option><option value="pad" ${part.type === 'pad' ? 'selected' : ''}>刹车片</option><option value="suspension" ${part.type === 'suspension' ? 'selected' : ''}>避震 / 绞牙</option><option value="spacer" ${part.type === 'spacer' ? 'selected' : ''}>法兰 / 垫片</option><option value="control-arm" ${part.type === 'control-arm' ? 'selected' : ''}>控制臂</option><option value="top-mount" ${part.type === 'top-mount' ? 'selected' : ''}>塔顶</option><option value="tire" ${part.type === 'tire' ? 'selected' : ''}>轮胎</option><option value="other" ${!part.type || part.type === 'other' ? 'selected' : ''}>其他</option></select></label><label>品牌<input name="brand" required value="${esc(part.brand || '')}" placeholder="Brembo / Wilwood / Bilstein"></label><label>型号<input name="model" required value="${esc(part.model || '')}" placeholder="GT / B14 / AERO6"></label><label>零件号<input name="part_number" value="${esc(part.part_number || '')}" placeholder="1A1.3004A"></label><label>适配轴<select name="axle"><option value="universal" ${!part.axle || part.axle === 'universal' ? 'selected' : ''}>通用</option><option value="front" ${part.axle === 'front' ? 'selected' : ''}>前轴</option><option value="rear" ${part.axle === 'rear' ? 'selected' : ''}>后轴</option><option value="both" ${part.axle === 'both' ? 'selected' : ''}>前后轴</option></select></label><label>状态<select name="status"><option value="active" ${part.status === 'active' ? 'selected' : ''}>启用</option><option value="draft" ${!part.status || part.status === 'draft' ? 'selected' : ''}>草稿</option><option value="archived" ${part.status === 'archived' ? 'selected' : ''}>归档</option></select></label><label>可信度<select name="confidence"><option value="source-listed" ${part.confidence === 'source-listed' ? 'selected' : ''}>来源已列出</option><option value="operator-verified" ${part.confidence === 'operator-verified' ? 'selected' : ''}>人工核验</option><option value="customer-measured" ${part.confidence === 'customer-measured' ? 'selected' : ''}>客户实测</option><option value="needs-review" ${!part.confidence || part.confidence === 'needs-review' ? 'selected' : ''}>待复核</option></select></label><label>来源名称<input name="source_label" value="${esc(part.source_label || '')}" placeholder="Brembo Gran Turismo application list"></label><label class="field-wide">来源链接<input name="source_url" value="${esc(part.source_url || '')}" placeholder="https://..."></label><label class="field-wide">适配规则 JSON<textarea name="fitment_rules" rows="5" placeholder='[{"year_from":2015,"year_to":2020,"make":"BMW","model":"M3"}]'>${esc(JSON.stringify(part.fitment_rules || [], null, 2))}</textarea></label><label class="field-wide">规格 JSON<textarea name="specs" rows="8" placeholder='{"caliper_pistons":6,"rotor_diameter_mm":380,"min_wheel_diameter_in":19}'>${esc(JSON.stringify(part.specs || {}, null, 2))}</textarea></label><label class="field-wide">备注<textarea name="notes" rows="3" placeholder="适配注意事项、模板要求、来源说明">${esc(part.notes || '')}</textarea></label></div><div class="actions"><button class="console-btn is-primary" type="submit">${editing ? '保存部件' : '新增部件'}</button></div><p class="message" id="fitment-part-message" role="status"></p></form></div>`;
}

function fitmentPartEditorMarkup(part = {}) {
  const editing = Boolean(part.id);
  const sourceRefs = JSON.stringify(part.source_refs || [], null, 2);
  const reviewReasons = JSON.stringify(part.review_reasons || [], null, 2);
  return `<div class="console-card fitment-part-editor"><div class="fitment-admin-head"><div><h3>${editing ? '编辑适配部件' : '新增适配部件'}</h3><p class="card-note">系列参数只用于初筛；只有车型、零件号和刹车 / 轮毂模板完成核验后，才允许自动匹配。</p></div><button class="console-btn" type="button" data-fitment-cancel>取消</button></div><form id="fitment-part-form" class="fitment-admin-form"><input type="hidden" name="id" value="${esc(part.id || '')}"><div class="fitment-admin-form-grid"><label>类型<select name="type"><option value="brake" ${part.type === 'brake' ? 'selected' : ''}>刹车套件</option><option value="caliper" ${part.type === 'caliper' ? 'selected' : ''}>刹车卡钳</option><option value="rotor" ${part.type === 'rotor' ? 'selected' : ''}>刹车盘</option><option value="pad" ${part.type === 'pad' ? 'selected' : ''}>刹车片</option><option value="suspension" ${part.type === 'suspension' ? 'selected' : ''}>避震 / 绞牙</option><option value="spacer" ${part.type === 'spacer' ? 'selected' : ''}>法兰 / 垫片</option><option value="control-arm" ${part.type === 'control-arm' ? 'selected' : ''}>控制臂</option><option value="top-mount" ${part.type === 'top-mount' ? 'selected' : ''}>塔顶</option><option value="tire" ${part.type === 'tire' ? 'selected' : ''}>轮胎</option><option value="other" ${!part.type || part.type === 'other' ? 'selected' : ''}>其他</option></select></label><label>品牌<input name="brand" required value="${esc(part.brand || '')}" placeholder="Brembo / Wilwood / Bilstein"></label><label>型号<input name="model" required value="${esc(part.model || '')}" placeholder="GT / B14 / AERO6"></label><label>零件号<input name="part_number" value="${esc(part.part_number || '')}" placeholder="1A1.3004A"></label><label>适配轴<select name="axle"><option value="universal" ${!part.axle || part.axle === 'universal' ? 'selected' : ''}>通用</option><option value="front" ${part.axle === 'front' ? 'selected' : ''}>前轴</option><option value="rear" ${part.axle === 'rear' ? 'selected' : ''}>后轴</option><option value="both" ${part.axle === 'both' ? 'selected' : ''}>前后轴</option></select></label><label>状态<select name="status"><option value="active" ${part.status === 'active' ? 'selected' : ''}>启用</option><option value="draft" ${!part.status || part.status === 'draft' ? 'selected' : ''}>草稿</option><option value="archived" ${part.status === 'archived' ? 'selected' : ''}>归档</option></select></label><label>可信度<select name="confidence"><option value="source-listed" ${part.confidence === 'source-listed' ? 'selected' : ''}>来源已列出</option><option value="operator-verified" ${part.confidence === 'operator-verified' ? 'selected' : ''}>人工核验</option><option value="customer-measured" ${part.confidence === 'customer-measured' ? 'selected' : ''}>客户实测</option><option value="catalog-extracted" ${part.confidence === 'catalog-extracted' ? 'selected' : ''}>目录提取</option><option value="marketplace-listed" ${part.confidence === 'marketplace-listed' ? 'selected' : ''}>商城列出</option><option value="needs-review" ${!part.confidence || part.confidence === 'needs-review' ? 'selected' : ''}>待复核</option></select></label><label>核验状态<select name="verification_status"><option value="source_catalog" ${part.verification_status === 'source_catalog' ? 'selected' : ''}>来源目录</option><option value="application_verified" ${part.verification_status === 'application_verified' ? 'selected' : ''}>车型已核验</option><option value="template_verified" ${part.verification_status === 'template_verified' ? 'selected' : ''}>模板已核验</option><option value="customer_measured" ${part.verification_status === 'customer_measured' ? 'selected' : ''}>客户实测</option><option value="needs-review" ${!part.verification_status || part.verification_status === 'needs-review' ? 'selected' : ''}>待复核</option></select></label><label>参数范围<select name="parameter_scope"><option value="application" ${part.parameter_scope === 'application' ? 'selected' : ''}>具体车型套件</option><option value="kit" ${part.parameter_scope === 'kit' ? 'selected' : ''}>套件</option><option value="family" ${!part.parameter_scope || part.parameter_scope === 'family' ? 'selected' : ''}>系列参数</option><option value="unknown" ${part.parameter_scope === 'unknown' ? 'selected' : ''}>未知</option></select></label><label>自动匹配<select name="auto_match_enabled"><option value="false" ${!part.auto_match_enabled ? 'selected' : ''}>仅人工复核</option><option value="true" ${part.auto_match_enabled ? 'selected' : ''}>允许自动匹配</option></select></label><label>需要轮毂 / 刹车模板<select name="clearance_template_required"><option value="true" ${part.clearance_template_required !== false ? 'selected' : ''}>需要</option><option value="false" ${part.clearance_template_required === false ? 'selected' : ''}>不需要</option></select></label><label>模板编号<input name="clearance_template_id" value="${esc(part.clearance_template_id || '')}" placeholder="template-id"></label><label>来源名称<input name="source_label" value="${esc(part.source_label || '')}" placeholder="Manufacturer catalogue / application list"></label><label class="field-wide">来源链接<input name="source_url" value="${esc(part.source_url || '')}" placeholder="https://..."></label><label class="field-wide">来源证据 / 核验说明<textarea name="source_evidence" rows="3" placeholder="记录来源页、参数范围、车型套件核验方式">${esc(part.source_evidence || '')}</textarea></label><label class="field-wide">来源引用 JSON<textarea name="source_refs" rows="5" placeholder='[{"label":"Manufacturer","url":"https://...","kind":"manufacturer-catalog","evidence":"Exact page / table"}]'>${esc(sourceRefs)}</textarea></label><label class="field-wide">待复核原因 JSON<textarea name="review_reasons" rows="4" placeholder='["Exact vehicle application required","Wheel clearance template required"]'>${esc(reviewReasons)}</textarea></label><label class="field-wide">适配规则 JSON<textarea name="fitment_rules" rows="5" placeholder='[{"year_from":2015,"year_to":2020,"make":"BMW","model":"M3"}]'>${esc(JSON.stringify(part.fitment_rules || [], null, 2))}</textarea></label><label class="field-wide">规格 JSON<textarea name="specs" rows="8" placeholder='{"caliper_pistons":6,"rotor_diameter_mm":380,"min_wheel_diameter_in":19}'>${esc(JSON.stringify(part.specs || {}, null, 2))}</textarea></label><label class="field-wide">备注<textarea name="notes" rows="3" placeholder="适配注意事项、模板要求、来源说明">${esc(part.notes || '')}</textarea></label></div><div class="actions"><button class="console-btn is-primary" type="submit">${editing ? '保存部件' : '新增部件'}</button></div><p class="message" id="fitment-part-message" role="status"></p></form></div>`;
}

function fitmentAdminAxleMarkup(axle, label) {
  const field = (name, fieldLabel, help = '', placeholder = '') => `<label><span>${fieldLabel}</span>${help ? `<small class="fitment-admin-help">${help}</small>` : ''}<input name="${axle}_${name}" placeholder="${placeholder}"></label>`;
  const fields = [
    field('diameter', '轮毂直径（英寸）', '填写轮圈胎唇座直径，不是轮胎外径。'),
    field('width', '轮毂宽度（英寸）', '填写轮毂图纸上的胎唇座宽度。'),
    field('offset', 'ET / 偏距（毫米）', '填写安装面偏距；正 ET 会让轮毂向车内移动。'),
    field('pcd', 'PCD', '填写孔数 × 孔距圆直径，例如 5x112。', '5x112'),
    field('center_bore', '中心孔（毫米）', '填写轮毂中心孔；小于车辆轴头就无法安装。'),
    field('spacer_mm', '垫片厚度（毫米）', '填写实际安装的垫片厚度，它会同时改变内外间隙。', '0'),
    field('inner_clearance_mm', '轮毂内桶到避震筒（毫米）', '量轮毂内桶到避震筒或弹簧座的最小距离。'),
    field('spoke_clearance_mm', '辐条背面到卡钳（毫米）', '量辐条背面到卡钳最高点；有模板时优先使用刹车模板。'),
    field('camber_deg', '倾角（度）', '负值表示轮胎上端向车内倾。', '-2.0'),
    field('toe_deg', '前束（度）', '降低车身后按四轮定位单填写该轴总前束。', '0.00'),
    field('fender_clearance_mm', '轮胎肩部到轮眉内缘（毫米）', '前轴打满方向时，量轮胎肩部到轮眉内缘的最小距离。'),
    field('compression_clearance_mm', '完全压缩最小间隙（毫米）', '悬挂完全压缩并受载时，量轮胎、轮眉、避震和轮毂内桶的最小间隙。')
  ].join(' ');
  return `<div class="fitment-admin-axle"><h4>${label}</h4><div class="fitment-admin-check-grid">${fields}<label><span>轮胎安装风格</span><small class="fitment-admin-help">标准或拉伸会改变胎唇和轮眉间隙，请填写实际安装方式。</small><select name="${axle}_tire_fitment_style"><option value="">未说明</option><option value="standard">标准安装</option><option value="mild-stretch">轻度拉伸</option><option value="aggressive-stretch">激进拉伸</option></select></label><label class="field-wide"><span>轮胎规格</span><small class="fitment-admin-help">填写当前轮胎规格，它决定滚动直径和胎壁位置。</small><input name="${axle}_tire" placeholder="255/35R19"></label></div></div>`;
}

function fitmentCheckFormMarkup() {
  const brakeParts = state.fitmentParts.filter(part => ['brake', 'caliper'].includes(part.type) && part.status === 'active');
  const rotorParts = state.fitmentParts.filter(part => part.type === 'rotor' && part.status === 'active');
  const padParts = state.fitmentParts.filter(part => part.type === 'pad' && part.status === 'active');
  const suspensionParts = state.fitmentParts.filter(part => part.type === 'suspension' && part.status === 'active');
  const options = parts => `<option value="">未选择</option><option value="oem">原厂（按准确配置核对）</option>${parts.map(part => `<option value="${esc(part.id)}">${esc(`${part.brand} ${part.model}`)}</option>`).join('')}`;
  return `<div class="console-card fitment-check-panel"><div class="fitment-admin-head"><div><h3>手动帮客户适配</h3><p class="card-note">后台可以直接输入没有收录的车型和测量值；已知品牌型号会进入同一套规则引擎。</p></div></div><form id="fitment-admin-check-form" class="fitment-admin-form"><div class="fitment-admin-form-grid"><label>年份<input name="year" type="number" placeholder="2021"></label><label>品牌<input name="make" placeholder="BMW"></label><label>车型<input name="model" placeholder="M3"></label><label>配置<input name="trim" placeholder="Competition"></label><label>驱动<input name="drive" placeholder="AWD / RWD"></label><label>用途<select name="usage"><option value="street">日常街道</option><option value="spirited">激烈驾驶</option><option value="show">展示 / 低趴</option><option value="track">赛道</option></select></label><label>前刹车 / 卡钳<select name="front_brake_id">${options(brakeParts)}</select></label><label>后刹车 / 卡钳<select name="rear_brake_id">${options(brakeParts)}</select></label><label>前刹车盘<select name="front_rotor_id">${options(rotorParts)}</select></label><label>后刹车盘<select name="rear_rotor_id">${options(rotorParts)}</select></label><label>前刹车片<select name="front_pad_id">${options(padParts)}</select></label><label>后刹车片<select name="rear_pad_id">${options(padParts)}</select></label><label>避震 / 绞牙<select name="suspension_id">${options(suspensionParts)}</select></label><label>当前降低高度 (mm)<input name="ride_height_drop_mm" type="number" step="1" min="0" placeholder="0"></label></div><div class="fitment-admin-axles">${fitmentAdminAxleMarkup('front', '前轴轮毂 + 轮胎')}${fitmentAdminAxleMarkup('rear', '后轴轮毂 + 轮胎')}</div><div class="actions"><button class="console-btn is-primary" type="submit">运行适配检查</button></div><p class="message" id="fitment-check-message" role="status"></p></form>${state.fitmentResult ? fitmentAdminResultMarkup(state.fitmentResult) : ''}</div>`;
}

function fitmentAdminResultMarkup(result) {
  const status = result?.status || 'needs_review';
  const statusText = status === 'pass' ? '已通过' : status === 'conflict' ? '有冲突' : '需要测量';
  const messages = [...(result?.issues || []), ...(result?.warnings || []), ...(result?.missing || [])];
  const axles = ['front', 'rear'].map(axle => {
    const item = result?.axles?.[axle] || {};
    const recommendation = item.recommendation || {};
    return `<div class="fitment-admin-result-axle"><strong>${axle === 'front' ? '前轴' : '后轴'}</strong><span>PCD ${esc(recommendation.pcd || '待确认')}</span><span>直径 ${recommendation.diameter_min_in ? `${esc(recommendation.diameter_min_in)} in 起` : '待确认'}</span><span>ET ${recommendation.et_estimate_range ? esc(recommendation.et_estimate_range.join(' ~ ')) : '待确认'}</span></div>`;
  }).join('');
  return `<div class="fitment-admin-result"><div class="fitment-admin-result-head"><strong>检查结果</strong><span class="fitment-admin-status fitment-admin-status-${status}">${statusText}</span></div><div class="fitment-admin-result-grid">${axles}</div>${messages.length ? `<ul>${messages.slice(0, 14).map(message => `<li>${esc(message)}</li>`).join('')}</ul>` : '<p class="fitment-result-clear">目前已知规则没有冲突，继续由工程人员确认最终轮毂图纸。</p>'}<div class="actions"><button class="console-btn is-primary" type="button" data-fitment-save-case>保存为客户适配案例</button></div></div>`;
}

async function renderFitment() {
  const root = el('#console-view');
  root.innerHTML = '<div class="console-loading">正在读取适配库…</div>';
  try {
    const params = new URLSearchParams();
    if (state.fitmentFilter.q) params.set('q', state.fitmentFilter.q);
    if (state.fitmentFilter.type) params.set('type', state.fitmentFilter.type);
    if (state.fitmentFilter.status) params.set('status', state.fitmentFilter.status);
    const payload = await api(`/api/fbox-ops/fitment/parts?${params}`);
    state.fitmentParts = payload.data || [];
    root.innerHTML = `${fitmentCheckFormMarkup()}${fitmentPartListMarkup(state.fitmentParts)}`;
    wireFitmentView();
  } catch (error) { root.innerHTML = `<div class="console-error">${esc(error.message)}</div>`; }
}

function fitmentPartListMarkupLegacy(parts) {
  const editing = state.fitmentEditingId && state.fitmentEditingId !== 'new' ? parts.find(part => part.id === state.fitmentEditingId) : {};
  const rows = parts.map(part => `<tr><td class="cell-main"><strong>${esc(part.brand)} ${esc(part.model)}</strong><br><span class="cell-muted">${esc(part.part_number || 'No part number')}</span></td><td>${fitmentTypeLabel(part.type)}</td><td>${esc(part.axle || 'universal')}</td><td><span class="chip chip-${part.status === 'active' ? 'approved' : part.status === 'draft' ? 'pending' : 'hidden'}">${fitmentStatusLabel(part.status)}</span></td><td class="cell-muted">${fitmentConfidenceLabel(part.confidence)}</td><td class="cell-muted">${esc(part.source_label || 'Manual')}</td><td><button class="console-btn is-small" data-fitment-edit="${esc(part.id)}">编辑</button><button class="console-btn is-small is-danger" data-fitment-delete="${esc(part.id)}">删除</button></td></tr>`).join('');
  return `${state.fitmentEditingId ? fitmentPartEditorMarkup(editing) : ''}<div class="console-toolbar"><button class="console-btn is-primary" data-fitment-new>新增适配部件</button><input id="fitment-q" placeholder="搜品牌 / 型号 / 零件号" value="${esc(state.fitmentFilter.q)}"><select id="fitment-type"><option value="">全部类型</option>${Object.entries(fitmentTypeLabels).map(([key, label]) => `<option value="${key}" ${state.fitmentFilter.type === key ? 'selected' : ''}>${label}</option>`).join('')}</select><select id="fitment-status"><option value="">全部状态</option><option value="active" ${state.fitmentFilter.status === 'active' ? 'selected' : ''}>启用</option><option value="draft" ${state.fitmentFilter.status === 'draft' ? 'selected' : ''}>草稿</option><option value="archived" ${state.fitmentFilter.status === 'archived' ? 'selected' : ''}>归档</option></select><span class="spacer"></span><span class="card-note">${parts.length} 条当前记录</span></div><p class="card-note">适配库先覆盖主要刹车和避震系列，后台可以继续加入品牌型号、车辆范围和测量模板；前台只读取“启用”记录。</p><div class="console-table-wrap"><table class="console-table"><thead><tr><th>部件</th><th>类型</th><th>轴位</th><th>状态</th><th>可信度</th><th>来源</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="7" class="cell-muted">还没有匹配记录。</td></tr>'}</tbody></table></div>`;
}

function fitmentPartListMarkup(parts) {
  const editing = state.fitmentEditingId && state.fitmentEditingId !== 'new' ? parts.find(part => part.id === state.fitmentEditingId) : {};
  const rows = parts.map(part => `<tr><td class="cell-main"><strong>${esc(part.brand)} ${esc(part.model)}</strong><br><span class="cell-muted">${esc(part.part_number || 'No part number')}</span></td><td>${fitmentTypeLabel(part.type)}</td><td>${esc(part.axle || 'universal')}</td><td><span class="chip chip-${part.status === 'active' ? 'approved' : part.status === 'draft' ? 'pending' : 'hidden'}">${fitmentStatusLabel(part.status)}</span></td><td class="cell-muted">${fitmentConfidenceLabel(part.confidence)}</td><td class="cell-muted">${fitmentVerificationLabel(part.verification_status)}</td><td><span class="chip chip-${part.auto_match_enabled ? 'approved' : 'pending'}">${part.auto_match_enabled ? '自动匹配' : '人工复核'}</span></td><td class="cell-muted">${esc(part.source_label || 'Manual')}</td><td><button class="console-btn is-small" data-fitment-edit="${esc(part.id)}">编辑</button><button class="console-btn is-small is-danger" data-fitment-delete="${esc(part.id)}">删除</button></td></tr>`).join('');
  return `${state.fitmentEditingId ? fitmentPartEditorMarkup(editing) : ''}<div class="console-toolbar"><button class="console-btn is-primary" data-fitment-new>新增适配部件</button><input id="fitment-q" placeholder="搜品牌 / 型号 / 零件号" value="${esc(state.fitmentFilter.q)}"><select id="fitment-type"><option value="">全部类型</option>${Object.entries(fitmentTypeLabels).map(([key, label]) => `<option value="${key}" ${state.fitmentFilter.type === key ? 'selected' : ''}>${label}</option>`).join('')}</select><select id="fitment-status"><option value="">全部状态</option><option value="active" ${state.fitmentFilter.status === 'active' ? 'selected' : ''}>启用</option><option value="draft" ${state.fitmentFilter.status === 'draft' ? 'selected' : ''}>草稿</option><option value="archived" ${state.fitmentFilter.status === 'archived' ? 'selected' : ''}>归档</option></select><span class="spacer"></span><span class="card-note">${parts.length} 条当前记录</span></div><p class="card-note">目录数据可以帮助筛选，但只要没有具体车型、零件号和刹车 / 轮毂模板核验，就只能人工复核，不能自动放行。</p><div class="console-table-wrap"><table class="console-table"><thead><tr><th>部件</th><th>类型</th><th>轴位</th><th>状态</th><th>可信度</th><th>核验状态</th><th>自动匹配</th><th>来源</th><th>操作</th></tr></thead><tbody>${rows || '<tr><td colspan="9" class="cell-muted">还没有匹配记录。</td></tr>'}</tbody></table></div>`;
}

function fitmentAdminPayload(form) {
  const values = Object.fromEntries(new FormData(form).entries());
  const axle = name => ({ diameter: values[`${name}_diameter`], width: values[`${name}_width`], offset: values[`${name}_offset`], pcd: values[`${name}_pcd`], center_bore: values[`${name}_center_bore`], spacer_mm: values[`${name}_spacer_mm`], inner_clearance_mm: values[`${name}_inner_clearance_mm`], spoke_clearance_mm: values[`${name}_spoke_clearance_mm`], camber_deg: values[`${name}_camber_deg`], toe_deg: values[`${name}_toe_deg`], fender_clearance_mm: values[`${name}_fender_clearance_mm`], compression_clearance_mm: values[`${name}_compression_clearance_mm`], tire_fitment_style: values[`${name}_tire_fitment_style`] });
  return { values, payload: { locale: 'zh-CN', vehicle: { year: values.year, make: values.make, model: values.model, trim: values.trim, drive: values.drive }, usage: values.usage, stance_profile: values.stance_profile || (values.usage === 'show' ? 'static-low' : Number(values.ride_height_drop_mm || 0) > 0 ? 'lowered' : 'oem'), front_brake_id: values.front_brake_id, rear_brake_id: values.rear_brake_id, front_rotor_id: values.front_rotor_id, rear_rotor_id: values.rear_rotor_id, front_pad_id: values.front_pad_id, rear_pad_id: values.rear_pad_id, suspension_id: values.suspension_id, suspension: { ride_height_drop_mm: values.ride_height_drop_mm }, wheels: { front: axle('front'), rear: axle('rear') }, tires: { front: values.front_tire, rear: values.rear_tire } } };
}

function wireFitmentView() {
  el('[data-fitment-new]')?.addEventListener('click', () => { state.fitmentEditingId = 'new'; renderFitment(); });
  el('[data-fitment-cancel]')?.addEventListener('click', () => { state.fitmentEditingId = ''; renderFitment(); });
  let timer = null;
  el('#fitment-q')?.addEventListener('input', event => { window.clearTimeout(timer); timer = window.setTimeout(() => { state.fitmentFilter.q = event.target.value.trim(); renderFitment(); }, 350); });
  el('#fitment-type')?.addEventListener('change', event => { state.fitmentFilter.type = event.target.value; renderFitment(); });
  el('#fitment-status')?.addEventListener('change', event => { state.fitmentFilter.status = event.target.value; renderFitment(); });
  document.querySelectorAll('[data-fitment-edit]').forEach(button => button.addEventListener('click', () => { state.fitmentEditingId = button.dataset.fitmentEdit; renderFitment(); }));
  document.querySelectorAll('[data-fitment-delete]').forEach(button => button.addEventListener('click', async () => { if (!window.confirm('确认删除这条适配部件？')) return; try { await api(`/api/fbox-ops/fitment/parts/${encodeURIComponent(button.dataset.fitmentDelete)}`, { method: 'DELETE' }); renderFitment(); } catch (error) { window.alert(error.message); } }));
  el('#fitment-part-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const message = el('#fitment-part-message');
    let fitmentRules;
    let specs;
    let sourceRefs;
    let reviewReasons;
    try { fitmentRules = JSON.parse(values.fitment_rules || '[]'); specs = JSON.parse(values.specs || '{}'); sourceRefs = JSON.parse(values.source_refs || '[]'); reviewReasons = JSON.parse(values.review_reasons || '[]'); } catch { message.textContent = '适配规则、规格、来源引用或待复核原因 JSON 格式不正确。'; message.className = 'message error'; return; }
    message.textContent = '正在保存…';
    const payload = { ...values, fitment_rules: fitmentRules, specs, source_refs: sourceRefs, review_reasons: reviewReasons };
    delete payload.id;
    try { await api(values.id ? `/api/fbox-ops/fitment/parts/${encodeURIComponent(values.id)}` : '/api/fbox-ops/fitment/parts', { method: values.id ? 'PUT' : 'POST', body: JSON.stringify(payload) }); state.fitmentEditingId = ''; await renderFitment(); } catch (error) { message.textContent = error.message; message.className = 'message error'; }
  });
  el('#fitment-admin-check-form')?.addEventListener('submit', async event => {
    event.preventDefault();
    const { values, payload } = fitmentAdminPayload(event.currentTarget);
    const message = el('#fitment-check-message');
    message.textContent = '正在运行规则…';
    try { const response = await api('/api/fbox-content/fitment/check', { method: 'POST', body: JSON.stringify(payload) }); state.fitmentResult = response.data || response; state.fitmentCheckPayload = payload; await renderFitment(); } catch (error) { message.textContent = error.message; message.className = 'message error'; }
  });
  el('[data-fitment-save-case]')?.addEventListener('click', async () => {
    if (!state.fitmentResult) return;
    try { await api('/api/fbox-ops/fitment/cases', { method: 'POST', body: JSON.stringify({ vehicle: state.fitmentCheckPayload?.vehicle || state.fitmentResult.vehicle || {}, part_ids: (state.fitmentResult.selected_parts || []).map(part => part.id), request: state.fitmentCheckPayload || {}, result: state.fitmentResult, status: 'open' }) }); state.fitmentCaseMessage = '适配案例已保存。'; renderFitment(); } catch (error) { window.alert(error.message); }
  });
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
