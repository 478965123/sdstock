/**
 * Vercel Build Output API v3 wrapper for TanStack Start + Cloudflare adapter.
 *
 * The Cloudflare adapter emits a WinterCG `fetch(request, env, ctx)` handler.
 * Vercel Edge Runtime does NOT support node:stream / node:stream/web (used by
 * TanStack Start internals), so we deploy as a Node.js Serverless Function
 * instead and bridge the two formats with a thin adapter.
 *
 * dist/client/  → .vercel/output/static/             (CDN-served assets)
 * dist/server/  → .vercel/output/functions/index.func/ (Node.js function)
 */

import { execSync } from "node:child_process";
import { cpSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const out = resolve(root, ".vercel/output");

// ── 1. Normal vite build ──────────────────────────────────────────────────────
console.log("▶ Building app…");
execSync("bun run build", { stdio: "inherit", cwd: root });

// ── 2. Clean previous Vercel output ──────────────────────────────────────────
rmSync(out, { recursive: true, force: true });

// ── 3. Static assets (CDN) ───────────────────────────────────────────────────
console.log("▶ Copying static assets…");
mkdirSync(`${out}/static`, { recursive: true });
cpSync(resolve(root, "dist/client"), `${out}/static`, { recursive: true });

// ── 4. Node.js Serverless Function (SSR) ─────────────────────────────────────
console.log("▶ Creating Node.js serverless function…");
const funcDir = `${out}/functions/index.func`;
mkdirSync(funcDir, { recursive: true });

// Copy the self-contained server bundle (Cloudflare Worker format)
cpSync(resolve(root, "dist/server"), funcDir, { recursive: true });

// Thin adapter: converts Cloudflare Worker fetch handler → Node.js HTTP handler.
// Uses a cached dynamic import so the ESM bundle is only loaded once.
writeFileSync(
  `${funcDir}/entry.js`,
  `"use strict";
// Cache the ESM worker module so it is only imported once per cold start.
let _worker;
async function getWorker() {
  if (!_worker) {
    const mod = await import("./index.js");
    _worker = mod.default ?? mod;
  }
  return _worker;
}

module.exports = async function handler(req, res) {
  const worker = await getWorker();

  // Build a full URL from the incoming Node.js request.
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host  = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  const url   = new URL(req.url, proto + "://" + host);

  // Convert Node.js headers to WHATWG Headers.
  const headers = new Headers();
  for (const [key, val] of Object.entries(req.headers)) {
    if (val == null) continue;
    headers.set(key, Array.isArray(val) ? val.join(", ") : val);
  }

  // Buffer request body (skip for bodyless methods).
  let body;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await new Promise((resolve) => {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body: body && body.length ? body : undefined,
  });

  // Call the Cloudflare Worker fetch handler.
  const response = await worker.fetch(request, {}, {
    waitUntil: () => {},
    passThroughOnException: () => {},
  });

  // Forward status + headers to Node.js response.
  res.statusCode = response.status;
  for (const [key, val] of response.headers.entries()) {
    res.setHeader(key, val);
  }

  res.end(Buffer.from(await response.arrayBuffer()));
};
`,
);

// Node.js Serverless Function config (Nodejs launcher, NOT edge).
writeFileSync(
  `${funcDir}/.vc-config.json`,
  JSON.stringify(
    { runtime: "nodejs20.x", handler: "entry.js", launcherType: "Nodejs" },
    null,
    2,
  ),
);

// ── 5. Vercel routing config ──────────────────────────────────────────────────
console.log("▶ Writing Vercel config…");
writeFileSync(
  `${out}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        { handle: "filesystem" },
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2,
  ),
);

console.log("✅ Vercel output ready at .vercel/output/");
