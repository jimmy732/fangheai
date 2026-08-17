import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
const runtimeDir = path.resolve(process.env.FBOX_RUNTIME_DIR || path.join(moduleDir, '..', 'local-mall-dev', '.runtime'));
const configPath = path.join(runtimeDir, 'fbox-visualizer-config.json');
const defaultEndpoint = 'https://api.lk888.ai/v1';
const defaultModel = 'gpt-image-2';
const jobs = new Map();
const jobTtlMs = 60 * 60 * 1000;

function json(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
    'access-control-allow-origin': '*',
    'access-control-allow-headers': 'Content-Type, Accept',
    'access-control-allow-methods': 'GET, PUT, POST, OPTIONS'
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

async function loadConfig() {
  try {
    const raw = JSON.parse(await fs.readFile(configPath, 'utf8'));
    return {
      endpoint: String(raw.endpoint || defaultEndpoint).replace(/\/$/, ''),
      provider: String(raw.provider || 'lk888'),
      model: defaultModel,
      api_key: String(raw.api_key || '')
    };
  } catch {
    return { endpoint: defaultEndpoint, provider: 'lk888', model: defaultModel, api_key: '' };
  }
}

function publicStatus(config) {
  const configured = Boolean(config.api_key);
  return {
    configured,
    provider: config.provider,
    endpoint: config.endpoint,
    model: config.model,
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
  const apiKey = String(payload.api_key || '').trim();
  if (apiKey.length < 8) throw new Error('Paste a valid LingkeAI API key before saving.');
  await verifyProvider(endpoint, apiKey);
  await fs.mkdir(runtimeDir, { recursive: true });
  await fs.writeFile(configPath, JSON.stringify({ endpoint, provider: 'lk888', model: defaultModel, api_key: apiKey }, null, 2), 'utf8');
  return { ...publicStatus({ endpoint, provider: 'lk888', model: defaultModel, api_key: apiKey }), saved: true, key_preview: keyPreview(apiKey) };
}

function fixedPrompt(payload, angle) {
  return `You are the F-Box photorealistic vehicle visualization worker.\n\nCreate one realistic automotive photograph showing the selected F-Box wheel installed on the user's actual vehicle. The uploaded vehicle photo is the primary identity and geometry reference. The selected wheel reference image is authoritative for the exact wheel design and finish. The fitment data is authoritative: ${payload.product_fitment}.\n\nSelected product: ${payload.product_name} (${payload.product_finish}); product id: ${payload.product_id}. Required view: ${angle}.\n\nHard requirements:\n- Preserve the actual vehicle identity, body panels, paint, trim, badges, glass, lights, mirrors, wheel arches, tire sidewalls, environment and camera realism.\n- Install the exact wheel from the reference image. Do not invent spokes, alter spoke count, change the lip or concavity, replace the center cap, change the finish or add unrelated hardware.\n- Make the installation physically plausible and seamless: correct scale inside the arch, natural perspective, elliptic foreshortening, hub centering, tire contact patch, brake/caliper occlusion, wheel-well shadow, reflections and matching light.\n- Match the vehicle suspension height and stance. Never create floating wheels, doubled tires, disconnected hubs, impossible tire stretch or incorrect axle depth.\n- Keep the final image photographic. No AI-looking edges, warped spokes, melted lug holes, duplicated body parts, text, extra cars, logos, watermark, illustration, CGI showroom look or halo.\n- Preserve the original camera intent and scene composition. Make only the minimum change needed to install the selected wheel.\n\nReturn one clean 3:2 image with no explanatory text inside the image.`;
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
  for (let attempt = 0; attempt < 45; attempt += 1) {
    await new Promise(resolve => setTimeout(resolve, 4000));
    const url = new URL(`${config.endpoint}/media/status`);
    url.searchParams.set('task_id', taskId);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${config.api_key}`, Accept: 'application/json' }, signal: AbortSignal.timeout(30_000) });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error('LingkeAI could not read the image task status.');
    const imageUrl = imageFromPayload(payload);
    if (imageUrl && (payload.is_final || payload.state === 'success')) return imageUrl;
    if (payload.state === 'failed' || (payload.is_final && !imageUrl)) throw new Error('LingkeAI image generation failed.');
  }
  throw new Error('LingkeAI image generation timed out.');
}

async function createProviderTask(config, payload, angle) {
  const response = await fetch(`${config.endpoint}/media/generate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.api_key}`, Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt: fixedPrompt(payload, angle),
      params: {
        aspect_ratio: '3:2',
        images: [payload.vehicle_image, payload.product_image],
        n: 1,
        quality: 'high',
        resolution: '1K',
        response_format: 'url',
        size: '1536x1024'
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
  try {
    const config = await loadConfig();
    if (!config.api_key) throw new Error('F-Box image routing is not configured. Open /admin and save the LingkeAI API key first.');
    const angleSpecs = [
      ['front-left', 'front-left three-quarter view'],
      ['front-right', 'front-right three-quarter view'],
      ['side-profile', 'full side profile view']
    ];
    const results = await Promise.all(angleSpecs.map(async ([id, angle]) => ({ id, angle, image_url: await createProviderTask(config, payload, angle) })));
    job.status = 'succeeded';
    job.mode = 'fbox-lingkeai';
    job.results = results;
  } catch (error) {
    job.status = 'failed';
    job.message = error?.message || 'The F-Box image route could not finish this preview.';
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
  if (req.method === 'GET' && (url.pathname === '/api/fbox-admin/status' || url.pathname === '/api/fbox-admin/status/')) {
    return json(res, 200, { data: publicStatus(await loadConfig()) });
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
      if (!String(payload.product_image || '').startsWith('data:image/')) throw new Error('Select a wheel reference image first.');
      const config = await loadConfig();
      if (!config.api_key) return json(res, 503, { detail: 'F-Box image routing is not configured. Open /admin and save the LingkeAI API key first.' });
      const jobId = `fbox_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      jobs.set(jobId, { job_id: jobId, status: 'queued', mode: 'fbox-lingkeai', results: [], created_at: Date.now(), updated_at: Date.now() });
      void runJob(jobId, payload);
      return json(res, 202, { data: { job_id: jobId, status: 'queued', mode: 'fbox-lingkeai', results: [] } });
    } catch (error) { return json(res, error.status || 422, { detail: error.message || 'Invalid visualizer request.' }); }
  }
  if (req.method === 'GET' && match[1]) {
    pruneJobs();
    const job = jobs.get(match[1]);
    if (!job) return json(res, 404, { detail: 'The visualizer job was not found.' });
    const response = { job_id: job.job_id, status: job.status, mode: job.mode, results: job.results };
    if (job.status === 'failed') response.message = job.message;
    return json(res, 200, { data: response });
  }
  return json(res, 405, { detail: 'Method not allowed.' });
}
