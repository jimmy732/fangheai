import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.FBOX_PORT || process.env.PORT || 4174);
const boxclawBase = String(process.env.BOXCLAW_VISUALIZER_API || 'http://127.0.0.1:8001/api/v1/fbox/wheel-visualizer').replace(/\/$/, '');
const integrationToken = String(process.env.FBOX_VISUALIZER_INTEGRATION_TOKEN || 'fbox-wheel-local-dev');
const maxBodyBytes = 55 * 1024 * 1024;

const contentTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        reject(new Error('The visualizer payload is larger than 55 MB.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function proxyVisualizer(req, res, pathname) {
  const upstream = `${boxclawBase}${pathname.replace('/api/wheel-visualizer', '')}`;
  const init = {
    method: req.method,
    headers: {
      Accept: 'application/json',
      'X-F-Box-Visualizer-Token': integrationToken
    }
  };
  if (req.method === 'POST') {
    init.headers['Content-Type'] = 'application/json';
    init.body = await readBody(req);
  }
  let response;
  try {
    response = await fetch(upstream, init);
  } catch {
    return json(res, 502, { message: 'The local BoxClaw Admin API is unavailable. Start the 8001 backend first.' });
  }
  const text = await response.text();
  res.writeHead(response.status, { 'Content-Type': response.headers.get('content-type') || 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(text);
}

function serveStatic(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, relative);
  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== path.join(root, 'index.html')) return json(res, 403, { message: 'Forbidden' });
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) return json(res, 404, { message: 'Not found' });
    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (url.pathname === '/api/wheel-visualizer/jobs' || url.pathname.startsWith('/api/wheel-visualizer/jobs/')) {
    if (!['GET', 'POST'].includes(req.method || '')) return json(res, 405, { message: 'Method not allowed' });
    try {
      return await proxyVisualizer(req, res, url.pathname);
    } catch (error) {
      return json(res, 400, { message: error?.message || 'Invalid request.' });
    }
  }
  return serveStatic(req, res, url.pathname);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`F-Box storefront listening on http://127.0.0.1:${port}`);
  console.log(`BoxClaw visualizer bridge: ${boxclawBase}`);
});
