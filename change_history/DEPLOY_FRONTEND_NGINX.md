# Frontend Deployment (Nginx + Cloudflared)

This guide serves the built Vite app (`dist/`) from Nginx locally and exposes it via Cloudflared Tunnel.

## 1) Build the production bundle

- From the frontend folder: `npm ci` then `npm run build` (emits `dist/`).

## 2) Nginx server block (static SPA)

Adjust paths/ports for your machine; Windows file paths shown as example.

```
server {
    listen       8081;
    server_name  fe-sipb.crulxproject.com;
    root         D:/KULAIH/ALL_PROJECT/KP_SistemInformasidanPencatatanBarang/frontend/SIPB-FrontSide-main/dist;
    index        index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Long-term cache for assets (immutable file names)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable" always;
        try_files $uri =404;
    }

    # Optional: Gzip (enable only if not using Cloudflare compression)
    gzip on;
    gzip_types text/plain application/javascript application/json text/css image/svg+xml;
    gzip_min_length 1024;
}
```

- Start/reload Nginx and confirm the site is reachable locally: http://127.0.0.1:8081

## 3) Cloudflared route

Update your tunnel config (YAML) so that:

- `fe-sipb.crulxproject.com` → `http://127.0.0.1:8081`
- `sipb.crulxproject.com` → your backend origin (Nginx → PHP-FPM)

Restart the tunnel.

## 4) Security headers (Phase 2)

Prefer to set HSTS at Cloudflare.
Add origin-side headers and CSP as in `SECURITY_HEADERS_NGINX.md`.

## 5) Re-test Lighthouse (desktop and mobile)

- Run Lighthouse against https://fe-sipb.crulxproject.com
- Expect improved Speed Index/LCP with production static serving (HTTP/2 + cache).
