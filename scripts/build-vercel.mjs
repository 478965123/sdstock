/**
 * Vercel Build Output API v3 wrapper for TanStack Start + Cloudflare adapter.
 *
 * The Cloudflare Worker format (WinterCG fetch handler) is compatible with
 * Vercel Edge Functions — this script re-packages the build output so Vercel
 * can deploy it correctly.
 *
 * dist/client/  → .vercel/output/static/   (CDN-served assets)
 * dist/server/  → .vercel/output/functions/index.func/  (Edge Function)
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

// ── 4. Edge Function (SSR) ───────────────────────────────────────────────────
console.log("▶ Creating edge function…");
const funcDir = `${out}/functions/index.func`;
mkdirSync(funcDir, { recursive: true });

// Copy the self-contained server bundle
cpSync(resolve(root, "dist/server"), funcDir, { recursive: true });

// Vercel edge function config
writeFileSync(
  `${funcDir}/.vc-config.json`,
  JSON.stringify({ runtime: "edge", entrypoint: "index.js" }, null, 2),
);

// ── 5. Vercel routing config ──────────────────────────────────────────────────
console.log("▶ Writing Vercel config…");
writeFileSync(
  `${out}/config.json`,
  JSON.stringify(
    {
      version: 3,
      routes: [
        // Serve pre-built static assets directly from CDN
        { handle: "filesystem" },
        // Everything else → SSR edge function
        { src: "/(.*)", dest: "/index" },
      ],
    },
    null,
    2,
  ),
);

console.log("✅ Vercel output ready at .vercel/output/");
