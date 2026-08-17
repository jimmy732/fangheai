import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleFBoxAdminApi, handleFBoxOperationsApi, handleWheelVisualizerApi } from './fbox-visualizer-backend.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.FBOX_PORT || process.env.PORT || 4174);
const adminDist = path.join(root, 'admin-dist');
const developmentAdminDist = path.resolve(root, '..', '_mall-admin-web', 'dist');
const routes = {
  '/api': 'http://127.0.0.1:8086',
  '/admin-api': 'http://127.0.0.1:8080'
};

function resolveAdminDist() {
  if (fs.existsSync(adminDist)) return adminDist;
  if (fs.existsSync(developmentAdminDist)) return developmentAdminDist;
  return null;
}

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

function proxy(req, res, targetBase, prefix) {
  const suffix = req.url.slice(prefix.length) || '/';
  const target = new URL(targetBase);
  target.pathname = `${target.pathname.replace(/\/$/, '')}/${suffix.replace(/^\/+/, '')}`;
  const headers = { ...req.headers, host: target.host };
  delete headers.origin;
  delete headers.referer;
  const upstream = http.request(target, { method: req.method, headers }, upstreamRes => {
    res.writeHead(upstreamRes.statusCode || 502, {
      ...upstreamRes.headers,
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true'
    });
    upstreamRes.pipe(res);
  });
  upstream.on('error', error => json(res, 502, { code: 502, message: `Local mall service unavailable: ${error.message}` }));
  req.pipe(upstream);
}

function serveStatic(req, res, pathname) {
  const useAdmin = pathname === '/admin' || pathname === '/admin/' || pathname.startsWith('/admin/');
  const resolvedAdminDist = useAdmin ? resolveAdminDist() : null;
  const staticRoot = resolvedAdminDist || root;
  const relative = resolvedAdminDist
    ? (pathname === '/admin' || pathname === '/admin/' ? 'index.html' : pathname.slice('/admin/'.length))
    : (pathname === '/' ? 'index.html' : pathname === '/admin' || pathname === '/admin/' ? 'admin.html' : pathname.replace(/^\/+/, ''));
  let filePath = path.resolve(staticRoot, relative);
  if (resolvedAdminDist && (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory())) filePath = path.join(resolvedAdminDist, 'index.html');
  if (!filePath.startsWith(`${staticRoot}${path.sep}`) && filePath !== path.join(staticRoot, 'index.html')) return json(res, 403, { message: 'Forbidden' });
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) return json(res, 404, { message: 'Not found' });
    res.writeHead(200, { 'Content-Type': contentTypes[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'GET' && url.pathname === '/admin') {
    res.writeHead(301, { Location: '/admin/' });
    res.end();
    return;
  }
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'access-control-allow-origin': '*',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'access-control-allow-headers': 'Content-Type, Authorization, X-F-Box-Visualizer-Token'
    });
    res.end();
    return;
  }
  if (url.pathname === '/api/fbox-admin' || url.pathname.startsWith('/api/fbox-admin/')) return handleFBoxAdminApi(req, res, url);
  if (url.pathname === '/api/fbox-ops' || url.pathname.startsWith('/api/fbox-ops/') || url.pathname === '/api/fbox-content' || url.pathname.startsWith('/api/fbox-content/')) return handleFBoxOperationsApi(req, res, url);
  if (url.pathname === '/api/wheel-visualizer' || url.pathname.startsWith('/api/wheel-visualizer/')) return handleWheelVisualizerApi(req, res, url);
  for (const [prefix, target] of Object.entries(routes)) {
    if (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)) return proxy(req, res, target, prefix);
  }
  return serveStatic(req, res, url.pathname);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`F-Box storefront listening on http://127.0.0.1:${port}`);
  console.log(`F-Box independent mall-admin: http://127.0.0.1:${port}/admin`);
  console.log('F-Box visualizer backend: direct LingkeAI gpt-image-2 route');
});
