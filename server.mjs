import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleFBoxAdminApi, handleWheelVisualizerApi } from './fbox-visualizer-backend.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.FBOX_PORT || process.env.PORT || 4174);

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

function serveStatic(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : pathname === '/admin' || pathname === '/admin/' ? 'admin.html' : pathname.replace(/^\/+/, '');
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
  if (url.pathname === '/api/fbox-admin' || url.pathname.startsWith('/api/fbox-admin/')) return handleFBoxAdminApi(req, res, url);
  if (url.pathname === '/api/wheel-visualizer' || url.pathname.startsWith('/api/wheel-visualizer/')) return handleWheelVisualizerApi(req, res, url);
  return serveStatic(req, res, url.pathname);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`F-Box storefront listening on http://127.0.0.1:${port}`);
  console.log(`F-Box independent admin: http://127.0.0.1:${port}/admin`);
  console.log('F-Box visualizer backend: direct LingkeAI gpt-image-2 route');
});
