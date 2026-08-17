# Production deployment

The public site and the independent F-Box admin are one Node service. Nginx
terminates TLS for `forcarbox.cn` and proxies both `/` and `/api/*` to the
private Node listener on `127.0.0.1:4174`. The model provider key is never
committed; `/admin` writes it to `/var/lib/fbox/runtime` on the server.

The service unit assumes the repository is checked out at
`/opt/fbox/fangheai` on the `agent/f-box-site-deploy` branch. Before the first
start, create `/var/lib/fbox/runtime`, make it writable by `admin`, install the
unit, and merge the locations from `forcarbox.cn.nginx.conf` into the existing
HTTPS server block. Keep the existing Certbot certificate directives.
