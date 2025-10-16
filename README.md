# Stadli Minimal Cloudflare Stack

Empty-but-configured starter to deploy on Cloudflare Workers (modules, TypeScript, no build step).

**Goals**: HTML-first (Eta templates), file-ish routing, D1, Workers AI, Analytics Engine, Static Assets. KV/R2/Vectorize are optional and can be enabled later.

## Quick start

```bash
pnpm i # or npm i / yarn
npm run dev
# then
npm run deploy
```

## One-time resource setup (optional)

Uncomment bindings in `wrangler.jsonc` then run:

```bash
# KV
wrangler kv namespace create SESSIONS
# R2
wrangler r2 bucket create stadli-assets
# Vectorize
wrangler vectorize create stadli-index
# Queues
wrangler queues create stadli-jobs
```

## Routes

- `/` → home
- `/home` → same as `/`
- `/admin/spec` → dumps the provided Stadli JSON spec
- `/api/health` → health probe
- `/api/ai/echo` → Workers AI echo (requires `AI` binding)
- `/api/db/ping` → ensures D1 is reachable, creates a seed table if missing
- Static assets under `/public` are served via `ASSETS`

## Security & headers

- Strict security headers
- Basic CORS (GET/POST)
- Simple in-memory rate limiting for demo (per colo instance; replace with KV for prod)

## Sessions

For zero-config, sessions use signed cookies. To use KV-backed sessions, uncomment KV in wrangler.jsonc and flip `USE_KV_SESSIONS` in code.

## Testing

```bash
npm test
```

## Deploy

```bash
npm run deploy
```
