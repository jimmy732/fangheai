(function () {
  'use strict';

  const state = { jobs: [], observer: null, queued: false, lastTrigger: null };

  const cleanUrl = value => {
    const source = String(value || '').trim();
    if (!source) return '';
    if (source.startsWith('/')) return source;
    try {
      const parsed = new URL(source, window.location.origin);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : '';
    } catch {
      return '';
    }
  };

  const fileSize = value => {
    const bytes = Number(value || 0);
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const imageMeta = job => {
    const dimensions = Number(job.vehicle_image_width) && Number(job.vehicle_image_height)
      ? `${job.vehicle_image_width} × ${job.vehicle_image_height}`
      : '';
    return [dimensions, fileSize(job.vehicle_image_bytes), job.vehicle_image_mime?.replace('image/', '').toUpperCase()]
      .filter(Boolean)
      .join(' · ');
  };

  function ensureViewer() {
    let viewer = document.getElementById('fbox-job-photo-viewer');
    if (viewer) return viewer;
    viewer = document.createElement('div');
    viewer.id = 'fbox-job-photo-viewer';
    viewer.className = 'fbox-job-photo-viewer';
    viewer.hidden = true;
    viewer.innerHTML = `
      <div class="fbox-job-photo-dialog" role="dialog" aria-modal="true" aria-labelledby="fbox-job-photo-title">
        <header>
          <div>
            <span id="fbox-job-photo-kicker">客户上传原图</span>
            <h2 id="fbox-job-photo-title">车辆照片</h2>
            <p id="fbox-job-photo-meta"></p>
          </div>
          <button type="button" class="fbox-job-photo-close" aria-label="关闭大图预览">×</button>
        </header>
        <div class="fbox-job-photo-stage"><img alt=""></div>
        <footer>
          <span>可放大查看车身角度、光线和轮比例</span>
          <a target="_blank" rel="noopener noreferrer">在新窗口打开 ↗</a>
        </footer>
      </div>`;
    viewer.addEventListener('click', event => {
      if (event.target === viewer || event.target.closest('.fbox-job-photo-close')) closeViewer();
    });
    document.body.appendChild(viewer);
    return viewer;
  }

  function openViewer(url, title, meta, fallback, trigger) {
    const source = cleanUrl(url);
    if (!source) return;
    const viewer = ensureViewer();
    const image = viewer.querySelector('img');
    viewer.querySelector('#fbox-job-photo-title').textContent = title || '车辆照片';
    viewer.querySelector('#fbox-job-photo-kicker').textContent = fallback ? '历史任务 · 原图未留存' : '客户上传原图';
    viewer.querySelector('#fbox-job-photo-meta').textContent = fallback
      ? '该旧任务只保存了文件名，当前展示第 1 张生成结果供追溯。'
      : (meta || '原始车辆照片');
    image.src = source;
    image.alt = title || '车辆照片';
    viewer.querySelector('a').href = source;
    viewer.hidden = false;
    state.lastTrigger = trigger || document.activeElement;
    document.body.classList.add('fbox-job-photo-viewer-open');
    viewer.querySelector('.fbox-job-photo-close').focus({ preventScroll: true });
  }

  function closeViewer() {
    const viewer = document.getElementById('fbox-job-photo-viewer');
    if (!viewer || viewer.hidden) return;
    viewer.hidden = true;
    viewer.querySelector('img').removeAttribute('src');
    document.body.classList.remove('fbox-job-photo-viewer-open');
    state.lastTrigger?.focus?.({ preventScroll: true });
  }

  function jobForRow(row) {
    const firstCellText = row.querySelector('td')?.textContent || '';
    return state.jobs.find(job => firstCellText.includes(job.job_id || job.id || '')) || null;
  }

  function photoCellIndex(table) {
    const headers = Array.from(table.querySelectorAll('.el-table__header-wrapper thead th'));
    return headers.findIndex(header => header.textContent.trim().includes('车辆照片'));
  }

  function decorateTable(table) {
    const columnIndex = photoCellIndex(table);
    if (columnIndex < 0) return;
    table.querySelectorAll('.el-table__body-wrapper tbody tr').forEach(row => {
      const job = jobForRow(row);
      const cell = row.querySelectorAll(':scope > td')[columnIndex];
      if (!job || !cell || cell.dataset.fboxPhotoJob === (job.job_id || job.id)) return;
      const filename = job.vehicle_file_name || job.vehicle_name || '匿名上传';
      const originalUrl = cleanUrl(job.vehicle_image_url);
      const fallbackUrl = cleanUrl(job.results?.[0]?.image_url || job.results?.[0]?.imageUrl || job.results?.[0]?.url);
      const url = originalUrl || fallbackUrl;
      const fallback = !originalUrl && Boolean(fallbackUrl);
      cell.dataset.fboxPhotoJob = job.job_id || job.id;
      const content = cell.querySelector('.cell') || cell;
      content.textContent = '';

      if (!url) {
        const empty = document.createElement('div');
        empty.className = 'fbox-job-photo-empty';
        empty.innerHTML = `<span></span><div><strong></strong><small>历史任务未保存原图</small></div>`;
        empty.querySelector('strong').textContent = filename;
        content.appendChild(empty);
        return;
      }

      const button = document.createElement('button');
      button.type = 'button';
      button.className = `fbox-job-photo-thumb${fallback ? ' is-history-fallback' : ''}`;
      button.setAttribute('aria-label', `放大查看 ${filename}`);
      button.innerHTML = `<span class="fbox-job-photo-image"><img loading="lazy" alt=""><i>放大</i></span><span class="fbox-job-photo-copy"><strong></strong><small></small></span>`;
      const image = button.querySelector('img');
      image.src = url;
      image.alt = filename;
      image.addEventListener('error', () => button.classList.add('is-broken'), { once: true });
      button.querySelector('strong').textContent = filename;
      button.querySelector('small').textContent = fallback
        ? '历史任务 · 点击查看生成结果'
        : (imageMeta(job) || '原始车辆照片 · 点击放大');
      button.addEventListener('click', () => openViewer(url, filename, imageMeta(job), fallback, button));
      content.appendChild(button);
    });
  }

  function decorate() {
    state.queued = false;
    if (!state.jobs.length) return;
    document.querySelectorAll('.el-table').forEach(decorateTable);
  }

  function scheduleDecorate() {
    if (state.queued) return;
    state.queued = true;
    window.requestAnimationFrame(decorate);
  }

  const nativeFetch = window.fetch.bind(window);
  window.fetch = async function (...args) {
    const response = await nativeFetch(...args);
    const requestUrl = String(typeof args[0] === 'string' ? args[0] : args[0]?.url || '');
    if (/\/api\/fbox-ops\/jobs(?:\?|$)/.test(requestUrl) && response.ok) {
      response.clone().json().then(payload => {
        state.jobs = Array.isArray(payload?.data) ? payload.data : [];
        scheduleDecorate();
      }).catch(() => {});
    }
    return response;
  };

  window.FBoxAdminPhotoViewer = { open: openViewer, close: closeViewer };
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeViewer();
  });
  window.addEventListener('hashchange', scheduleDecorate);
  document.addEventListener('DOMContentLoaded', () => {
    state.observer = new MutationObserver(scheduleDecorate);
    state.observer.observe(document.body, { childList: true, subtree: true });
    scheduleDecorate();
  });
})();
