import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { createBrotliCompress, createGzip, constants as zlibConstants } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { handleFBoxAdminApi, handleFBoxAssetApi, handleFBoxAuthApi, handleFBoxOperationsApi, handleFBoxStoreApi, handleWheelVisualizerApi } from './fbox-visualizer-backend.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.FBOX_PORT || process.env.PORT || 4174);
const assetCdnBaseUrl = String(process.env.FBOX_ASSET_CDN_BASE_URL || '').trim().replace(/\/+$/, '');
const assetCdnPathPrefix = String(process.env.FBOX_ASSET_CDN_PATH_PREFIX || 'fbox/static/assets').trim().replace(/^\/+|\/+$/g, '');
const assetCdnMediaPathPrefix = String(process.env.FBOX_ASSET_CDN_MEDIA_PATH_PREFIX || process.env.FBOX_QINIU_MEDIA_PREFIX || 'fbox/media').trim().replace(/^\/+|\/+$/g, '');
const assetCdnEnabled = String(process.env.FBOX_ASSET_CDN_ENABLED || '').toLowerCase() === 'true' && /^https:\/\/[^/]+/i.test(assetCdnBaseUrl);
const adminDist = path.join(root, 'admin-dist');
const developmentAdminDist = path.resolve(root, '..', '_mall-admin-web', 'dist');
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
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon'
};

function json(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function staticCacheControl(filePath, useAdmin) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === '.html') return 'no-cache';
  if (useAdmin && /-[a-zA-Z0-9_-]{8,}\./.test(path.basename(filePath))) return 'public, max-age=31536000, immutable';
  if (['.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff', '.woff2'].includes(extension)) return 'public, max-age=86400, stale-while-revalidate=604800';
  return 'public, max-age=300, stale-while-revalidate=86400';
}

function serveRuntimeConfig(req, res) {
  const body = Buffer.from(`window.__FBOX_RUNTIME__ = Object.freeze(${JSON.stringify({
    assetCdnEnabled,
    assetCdnBaseUrl: assetCdnEnabled ? assetCdnBaseUrl : '',
    assetCdnPathPrefix: assetCdnEnabled ? assetCdnPathPrefix : '',
    assetCdnMediaPathPrefix: assetCdnEnabled ? assetCdnMediaPathPrefix : ''
  }).replace(/</g, '\\u003c')});\n`);
  res.writeHead(200, {
    'Content-Type': 'text/javascript; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': body.length
  });
  if (req.method === 'HEAD') return res.end();
  res.end(body);
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
    const extension = path.extname(filePath).toLowerCase();
    const etag = `W/\"${stat.size.toString(16)}-${Math.trunc(stat.mtimeMs).toString(16)}\"`;
    const headers = {
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Cache-Control': staticCacheControl(filePath, Boolean(resolvedAdminDist)),
      'Last-Modified': stat.mtime.toUTCString(),
      ETag: etag
    };
    if (req.headers['if-none-match'] === etag) {
      res.writeHead(304, headers);
      return res.end();
    }
    if (req.method === 'HEAD') {
      res.writeHead(200, { ...headers, 'Content-Length': stat.size });
      return res.end();
    }
    const compressible = ['.html', '.js', '.css', '.json', '.svg'].includes(extension);
    const acceptedEncoding = String(req.headers['accept-encoding'] || '');
    let compressor = null;
    if (compressible && /\bbr\b/.test(acceptedEncoding)) {
      headers['Content-Encoding'] = 'br';
      compressor = createBrotliCompress({ params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 5 } });
    } else if (compressible && /\bgzip\b/.test(acceptedEncoding)) {
      headers['Content-Encoding'] = 'gzip';
      compressor = createGzip({ level: 6 });
    } else {
      headers['Content-Length'] = stat.size;
    }
    if (compressible) headers.Vary = 'Accept-Encoding';
    res.writeHead(200, headers);
    const stream = fs.createReadStream(filePath);
    if (compressor) stream.pipe(compressor).pipe(res);
    else stream.pipe(res);
  });
}

function serveIndependentConsole(res) {
  const filePath = path.join(root, 'admin.html');
  fs.stat(filePath, (error, stat) => {
    if (error || !stat.isFile()) return json(res, 404, { message: 'Console not found' });
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if ((req.method === 'GET' || req.method === 'HEAD') && url.pathname === '/fbox-runtime-config.js') return serveRuntimeConfig(req, res);
  if (req.method === 'GET' && ['/fbox-console', '/fbox-console/'].includes(url.pathname)) return serveIndependentConsole(res);
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
  if (url.pathname === '/api/admin' || url.pathname.startsWith('/api/admin/') || url.pathname === '/api/fbox-auth' || url.pathname.startsWith('/api/fbox-auth/')) return handleFBoxAuthApi(req, res, url);
  if (url.pathname === '/api/fbox-store' || url.pathname.startsWith('/api/fbox-store/')) return handleFBoxStoreApi(req, res, url);
  if (url.pathname === '/api/fbox-assets' || url.pathname.startsWith('/api/fbox-assets/')) return handleFBoxAssetApi(req, res, url);
  if (url.pathname === '/api/fbox-admin' || url.pathname.startsWith('/api/fbox-admin/')) return handleFBoxAdminApi(req, res, url);
  if (url.pathname === '/api/fbox-ops' || url.pathname.startsWith('/api/fbox-ops/') || url.pathname === '/api/fbox-content' || url.pathname.startsWith('/api/fbox-content/')) return handleFBoxOperationsApi(req, res, url);
  if (url.pathname === '/api/wheel-visualizer' || url.pathname.startsWith('/api/wheel-visualizer/')) return handleWheelVisualizerApi(req, res, url);
  return serveStatic(req, res, url.pathname);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`F-Box storefront listening on http://127.0.0.1:${port}`);
  console.log(`F-Box independent admin: http://127.0.0.1:${port}/admin`);
  console.log('F-Box visualizer backend: direct LingkeAI gpt-image-2 route');
});
