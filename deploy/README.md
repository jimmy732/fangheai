# Production deployment

> [!IMPORTANT]
> Deployment identity is fixed. Do not deploy one domain from the other
> repository or branch.

| Public domain | Git repository | Production branch | Server checkout / service |
| --- | --- | --- | --- |
| `forcarbox.cn` | `https://github.com/jimmy732/fangheai.git` | `agent/f-box-site-deploy` | `/opt/fbox/fangheai` · `fbox.service` · `127.0.0.1:4174` |
| `crforged.cn` | `https://github.com/jimmy732/boxclaw5.15.git` | `codex/cerui-cn-site-4188` | Separate Chinese-site deployment; never deploy it through `fbox.service` |

Before every `forcarbox.cn` deployment, verify all three values below. Stop
immediately if any value differs:

```bash
git remote get-url origin
git branch --show-current
git rev-parse --show-toplevel
```

The expected results are the `fangheai` repository,
`agent/f-box-site-deploy`, and `/opt/fbox/fangheai`.

The public site and the independent F-Box admin are one Node service. Nginx
terminates TLS for `forcarbox.cn` and proxies both `/` and `/api/*` to the
private Node listener on `127.0.0.1:4174`. The model provider key is never
committed; `/admin` writes it to `/var/lib/fbox/runtime` on the server.

The service unit assumes the repository is checked out at
`/opt/fbox/fangheai` on the `agent/f-box-site-deploy` branch. Before the first
start, run `npm install --omit=dev` in the repository so the server-side image
cutout processor is installed, create `/var/lib/fbox/runtime`, make it writable
by `admin`, install the unit, and merge the locations from
`forcarbox.cn.nginx.conf` into the existing HTTPS server block. Keep the
existing Certbot certificate directives.

## Optional image CDN

Static storefront images can be switched to an HTTPS CDN without rebuilding
the frontend. Keep the switch disabled until the CDN domain, certificate and
origin files have been verified from both North America and Europe:

```ini
FBOX_ASSET_CDN_ENABLED=false
FBOX_ASSET_CDN_BASE_URL=https://img.forcarbox.cn
FBOX_ASSET_CDN_PATH_PREFIX=fbox/static/assets
FBOX_ASSET_CDN_MEDIA_PATH_PREFIX=fbox/media
```

The browser requests optimized WebP assets from the CDN only when
`FBOX_ASSET_CDN_ENABLED=true`. A failed CDN image automatically retries the
original image from `forcarbox.cn`, so a DNS, certificate, cache or object-sync
problem does not leave broken product cards. For Qiniu, use a dedicated custom
domain configured for foreign or global acceleration; do not reuse a
China-only source domain for the overseas storefront.

Qiniu mirroring is independent from the public CDN switch. This lets the
server upload and verify every object while the storefront continues serving
local files:

```ini
FBOX_QINIU_ENABLED=false
FBOX_QINIU_ACCESS_KEY=
FBOX_QINIU_SECRET_KEY=
FBOX_QINIU_BUCKET=
FBOX_QINIU_UPLOAD_URL=https://up-na0.qiniup.com
FBOX_QINIU_PUBLIC_BASE_URL=https://img.forcarbox.cn
FBOX_QINIU_STATIC_PREFIX=fbox/static/assets
FBOX_QINIU_MEDIA_PREFIX=fbox/media
```

Run `npm run optimize:assets` before `npm run sync:qiniu`. Admin image uploads
are always written locally first and then mirrored when Qiniu is enabled. A
Qiniu failure never rejects the local upload. Turn on
`FBOX_ASSET_CDN_ENABLED` only after `img.forcarbox.cn` is configured for
foreign/global acceleration, HTTPS is valid, and the synchronized WebP paths
return `200` from overseas test locations.

The `forcarbox` bucket is hosted in Qiniu's North America region, so its upload
endpoint must remain `https://up-na0.qiniup.com`. A bucket in another region
must use that region's matching upload endpoint.
