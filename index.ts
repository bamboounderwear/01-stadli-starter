/* eslint-disable @typescript-eslint/no-unused-vars */
import { Eta } from "eta";

// ---- Types & Bindings ----
export interface Env {
  STADLI_DB: D1Database;
  AI: Ai;
  AE: AnalyticsEngineDataset;
  ASSETS: Fetcher;
  // Uncomment if enabling these bindings:
  // SESSIONS: KVNamespace;
  // R2: R2Bucket;
  // VECTORS: VectorizeIndex;
}

type Ai = any; // Workers AI binding type
type AnalyticsEngineDataset = any; // Analytics Engine type

// ---- Minimal templates ----
import { BaseLayout, HomePage, NotFound } from "./templates.js";

// ---- Inlined Stadli spec (from prompt) ----
const STADLI_SPEC = {
  "summary": {
    "title": "Product Summary",
    "description": "Stadli is the all-in-one revenue + marketing OS for pro teams outside the big four. It launches with five integrated cores that work together from day one.",
    "cores": [
      {
        "name": "Web App / Website",
        "description": "A PWA-first team hub combining a modern web experience and branded app shell. Includes Game Day Central, sponsor surfaces, push notifications, and built-in checkout for tickets, merch, and experiences."
      },
      {
        "name": "CRM / 360\u00b0 Fan Profile",
        "description": "Unified fan database stitching ticketing, merch, and digital touchpoints into a single view. Enables live segmentation, lifecycle tracking, and identity resolution for every fan."
      },
      {
        "name": "Campaign Engine & Playbooks",
        "description": "Multi-channel campaign system with sports-ready templates and prebuilt revenue plays. Launch push/email automations, drive purchases, and measure closed-loop revenue attribution from message to checkout."
      },
      {
        "name": "Stadli Narratives & Analytics",
        "description": "Daily role-based digest (email + dashboard) with one-click, prefilled actions tailored to GM, Marketing, and Ops roles. Powered by Stadli Web Tag for standardized analytics, event tracking, and attribution."
      },
      {
        "name": "Commerce & Ticketing",
        "description": "Native ticketing and ecommerce layer with secure payment processing, unified checkout, fan wallet, and real-time reconciliation with Tixr and Shopify webhooks."
      }
    ]
  }
};

// ---- Eta setup ----
const eta = new Eta({ useWith: true });

function page(layoutData: Record<string, unknown>, bodyTpl: string, bodyData: Record<string, unknown>) {
  const body = eta.renderString(bodyTpl, bodyData);
  const html = eta.renderString(BaseLayout, { ...layoutData, body });
  return html;
}

// ---- Security helpers ----
function secHeaders(extra: Record<string, string> = {}) {
  return {
    "content-type": "text/html; charset=utf-8",
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-embedder-policy": "require-corp",
    "cross-origin-resource-policy": "same-origin",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "permissions-policy": "geolocation=(), microphone=(), camera=()",
    "cache-control": "no-store",
    ...extra,
  };
}

// ---- Simple router ----
type RouteHandler = (req: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;

const routes: Record<string, RouteHandler> = {
  "/": async (_req, _env, _ctx) => {
    const html = page({ title: "Stadli Admin – Home" }, HomePage, STADLI_SPEC);
    return new Response(html, { headers: secHeaders() });
  },
  "/home": async (_req, _env, _ctx) => {
    const html = page({ title: "Stadli Admin – Home" }, HomePage, STADLI_SPEC);
    return new Response(html, { headers: secHeaders() });
  },
  "/admin/spec": async (_req, _env, _ctx) => {
    return new Response(JSON.stringify(STADLI_SPEC, null, 2), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  },
  "/api/health": async (_req, _env, _ctx) => {
    return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  },
  "/api/ai/echo": async (req, env, _ctx) => {
    const { prompt = "hello" } = (await req.json().catch(() => ({}))) as any;
    // Minimal: return prompt; replace with real Workers AI call if needed.
    return new Response(JSON.stringify({ model: "workers-ai", echo: String(prompt) }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  },
  "/api/db/ping": async (_req, env, _ctx) => {
    // Create a minimal table if not exists, then return row count
    await env.STADLI_DB.exec(`CREATE TABLE IF NOT EXISTS pings (id INTEGER PRIMARY KEY, ts INTEGER)`);
    await env.STADLI_DB.exec(`INSERT INTO pings (ts) VALUES (${Date.now()})`);
    const row = await env.STADLI_DB.prepare("SELECT COUNT(*) as c FROM pings").first<any>();
    return new Response(JSON.stringify({ ok: true, rows: (row as any)?.c ?? 0 }), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  },
};

// ---- Fetch handler ----
export default {
  async fetch(req: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(req.url);

      // Serve static assets via ASSETS first
      if (url.pathname.startsWith("/public/") || url.pathname.match(/\.(css|js|png|jpg|svg|ico)$/)) {
        const assetResp = await env.ASSETS.fetch(req);
        if (assetResp.status !== 404) return assetResp;
      }

      // CORS preflight
      if (req.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET,POST,OPTIONS",
            "access-control-allow-headers": "content-type, authorization",
            "access-control-max-age": "86400",
          },
        });
      }

      // Route handling (exact matches)
      const handler = routes[url.pathname];
      if (handler) return await handler(req, env, ctx);

      // 404
      const html = page({ title: "Not found" }, NotFound, {});
      return new Response(html, { status: 404, headers: secHeaders() });
    } catch (err: any) {
      // Error boundary
      const msg = (err && err.stack) ? String(err.stack) : String(err);
      // Best-effort analytic breadcrumb (non-blocking)
      try { env.AE.writeDataPoint({ blobs: ["error", msg] }); } catch {}
      return new Response(
        JSON.stringify({ error: "Internal error", detail: String(err?.message || err) }),
        { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }
      );
    }
  },

  // Example cron alarm
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) {
    try { env.AE.writeDataPoint({ blobs: ["cron", "tick"] }); } catch {}
  },
};
