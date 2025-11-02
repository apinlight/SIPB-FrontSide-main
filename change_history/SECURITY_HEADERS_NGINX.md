# Security Headers for Frontend (Nginx)

Apply these headers in the Nginx server block that serves `dist/` (static SPA). TLS is terminated at Cloudflare, so enable HSTS at Cloudflare (Edge Certificates), not at origin.

```
# Security headers (origin)
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=(), payment=()" always;

# Content Security Policy (adjust API origin)
# If you use 3rd-party CDNs, extend the relevant directives accordingly.
add_header Content-Security-Policy "\
  default-src 'self'; \
  script-src 'self' 'unsafe-inline'; \
  style-src 'self' 'unsafe-inline'; \
  img-src 'self' data: blob: https:; \
  font-src 'self' data: https:; \
  connect-src 'self' https://sipb.crulxproject.com; \
  frame-ancestors 'none'; \
  base-uri 'self'; \
  form-action 'self' \
" always;

# Cache: long TTL for versioned assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ {
  expires 1y;
  add_header Cache-Control "public, max-age=31536000, immutable" always;
  try_files $uri =404;
}
```

Notes:
- For backend API at `https://sipb.crulxproject.com`, keep `connect-src` updated.
- Don’t set HSTS at origin when using Cloudflare Tunnel; enable it in Cloudflare dashboard instead.
