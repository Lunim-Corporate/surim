/**
 * Step 2: Import lunim-v3 export into surim
 *
 * Run AFTER export.ts has completed:
 *   npx tsx --env-file=.env.local import.ts
 */

import { readFile } from "node:fs/promises";
import * as path from "node:path";
import * as fs from "node:fs";

const TARGET_REPO = "surim";
const EXPORT_DIR = "./lunim-export";
const ASSET_API = "https://asset-api.prismic.io";
const MIGRATION_API = "https://migration.prismic.io";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("❌  PRISMIC_WRITE_TOKEN is required in .env.local");
  process.exit(1);
}

const baseHeaders = {
  Authorization: `Bearer ${writeToken}`,
  repository: TARGET_REPO,
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Downgrade heading1 → heading2 throughout (some slice fields don't allow heading1)
function downgradeHeadings(obj: any): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(downgradeHeadings);

  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "type" && v === "heading1") {
      result[k] = "heading2";
    } else {
      result[k] = downgradeHeadings(v);
    }
  }
  return result;
}

// Remap old asset IDs → new asset IDs throughout a document's data
function remapIds(obj: any, idMap: Map<string, string>): any {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((i) => remapIds(i, idMap));

  const result: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "id" && typeof v === "string" && idMap.has(v)) {
      result[k] = idMap.get(v);
    } else {
      result[k] = remapIds(v, idMap);
    }
  }
  return result;
}

async function uploadAsset(
  oldId: string,
  filename: string,
  alt: string | null
): Promise<string | null> {
  const filepath = path.join(EXPORT_DIR, "assets", filename);
  if (!fs.existsSync(filepath)) {
    console.error(`\n  ⚠  File not found: ${filename}`);
    return null;
  }

  const ext = path.extname(filename).slice(1) || "jpg";
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
    gif: "image/gif", webp: "image/webp", svg: "image/svg+xml",
    mp4: "video/mp4", pdf: "application/pdf",
  };
  const contentType = mimeTypes[ext] || "application/octet-stream";

  // Use form-data + node-fetch to avoid Node 22 EPIPE bug with multipart
  const FormData = require("form-data");
  const nodeFetch = require("node-fetch");

  const form = new FormData();
  form.append("file", fs.createReadStream(filepath), { filename, contentType });
  if (alt) form.append("alt", alt.slice(0, 500));

  try {
    const res = await nodeFetch(`${ASSET_API}/assets`, {
      method: "POST",
      headers: { ...baseHeaders, ...form.getHeaders() },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`\n  ⚠  Asset upload failed [${oldId}]: ${res.status} ${err}`);
      return null;
    }

    const json = await res.json();
    return json.id ?? null;
  } catch (e: any) {
    console.error(`\n  ⚠  Asset upload error [${oldId}]: ${e.message}`);
    return null;
  }
}

async function createDocument(doc: any): Promise<boolean> {
  const body: any = {
    title: doc.uid ?? doc.type,
    type: doc.type,
    lang: doc.lang,
    data: doc.data,
  };
  if (doc.uid) body.uid = doc.uid;
  if (doc.tags?.length) body.tags = doc.tags;

  const res = await fetch(`${MIGRATION_API}/documents`, {
    method: "POST",
    headers: { ...baseHeaders, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`\n  ❌ [${doc.type}] ${doc.uid ?? "(singleton)"}: ${res.status} ${err}`);
    return false;
  }
  return true;
}

async function main() {
  // Load export files
  const documents: any[] = JSON.parse(
    await readFile(path.join(EXPORT_DIR, "documents.json"), "utf-8")
  );
  const assetManifest: Record<string, { filename: string | null; url: string; alt: string | null }> =
    JSON.parse(await readFile(path.join(EXPORT_DIR, "assets.json"), "utf-8"));

  console.log(`\n📦  Loaded ${documents.length} documents, ${Object.keys(assetManifest).length} assets from export\n`);

  // Phase 1: Upload assets
  console.log(`⬆️   Phase 1: Uploading assets to "${TARGET_REPO}"...\n`);

  const idMap = new Map<string, string>(); // oldId → newId
  const entries = Object.entries(assetManifest);
  let assetCount = 0;

  for (const [oldId, { filename, alt }] of entries) {
    assetCount++;
    process.stdout.write(`\r  [${assetCount}/${entries.length}] ${oldId}   `);

    if (!filename) {
      console.error(`\n  ⚠  Skipping ${oldId} — not downloaded`);
      continue;
    }

    const newId = await uploadAsset(oldId, filename, alt);
    if (newId) idMap.set(oldId, newId);

    await sleep(1100); // Asset API: 1 req/sec
  }

  console.log(`\n\n  ✔  ${idMap.size}/${entries.length} assets uploaded\n`);

  // Phase 2: Create documents
  console.log(`📝  Phase 2: Creating documents in "${TARGET_REPO}"...\n`);

  let created = 0;
  let failed = 0;

  for (let i = 0; i < documents.length; i++) {
    const doc = documents[i];
    process.stdout.write(
      `\r  [${i + 1}/${documents.length}] [${doc.type}] ${doc.uid ?? "(singleton)"}   `
    );

    const remapped = { ...doc, data: downgradeHeadings(remapIds(doc.data, idMap)) };
    const ok = await createDocument(remapped);
    if (ok) created++; else failed++;

    await sleep(1100); // Migration API: 1 req/sec
  }

  console.log(`\n\n✅  Import complete!`);
  console.log(`   Assets:    ${idMap.size}/${entries.length} uploaded`);
  console.log(`   Documents: ${created}/${documents.length} created`);
  if (failed) console.log(`   Failed:    ${failed}`);
  console.log(`\n👉  Go to "${TARGET_REPO}" Prismic dashboard → Migration Releases → publish\n`);
}

main().catch((err) => {
  console.error("\n❌  Import failed:", err?.message ?? err);
  if (err?.cause) console.error("   Cause:", err.cause?.message ?? err.cause);
  process.exit(1);
});
