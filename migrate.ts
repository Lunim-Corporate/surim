/**
 * Prismic content migration: lunim-v3 → surim
 * Uses node-fetch + form-data to avoid Node 22 EPIPE bug with multipart uploads.
 *
 * Run: npx tsx --env-file=.env.local migrate.ts
 */

// @ts-nocheck
const nodeFetch = require("node-fetch");
const FormData = require("form-data");
const prismic = require("@prismicio/client");

const SOURCE_REPO = "lunim-v3";
const TARGET_REPO = "surim";
const ASSET_API = "https://asset-api.prismic.io";
const MIGRATION_API = "https://migration.prismic.io";

const writeToken = process.env.PRISMIC_WRITE_TOKEN;
if (!writeToken) {
  console.error("❌  PRISMIC_WRITE_TOKEN is required");
  process.exit(1);
}

const authHeaders = {
  Authorization: `Bearer ${writeToken}`,
  "x-api-key": writeToken,
  repository: TARGET_REPO,
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// Extract all image asset IDs + URLs from a document
function extractImages(obj, out = new Map()) {
  if (!obj || typeof obj !== "object") return out;
  if (Array.isArray(obj)) { obj.forEach((i) => extractImages(i, out)); return out; }

  if (obj.url && obj.dimensions && typeof obj.url === "string" && obj.url.includes("prismic.io")) {
    const baseUrl = obj.url.split("?")[0];
    const idMatch = baseUrl.match(/\/([a-zA-Z0-9_-]{15,})(?:\.[a-z]+)?$/);
    if (idMatch && !out.has(idMatch[1])) {
      out.set(idMatch[1], { url: baseUrl, alt: obj.alt ?? null });
    }
  }

  Object.values(obj).forEach((v) => extractImages(v, out));
  return out;
}

// Remap old asset IDs → new asset IDs in document data
function remapIds(obj, idMap) {
  if (!obj || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map((i) => remapIds(i, idMap));

  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === "id" && typeof v === "string" && idMap.has(v)) {
      result[k] = idMap.get(v);
    } else {
      result[k] = remapIds(v, idMap);
    }
  }
  return result;
}

async function uploadAsset(oldId, url, alt) {
  try {
    const imgRes = await nodeFetch(url);
    if (!imgRes.ok) { console.error(`\n  ⚠  Could not fetch ${oldId}: ${imgRes.status}`); return null; }

    const buffer = await imgRes.buffer();
    const contentType = imgRes.headers.get("content-type") || "image/jpeg";
    const ext = contentType.split("/")[1]?.split(";")[0] || "jpg";

    const form = new FormData();
    form.append("file", buffer, { filename: `${oldId}.${ext}`, contentType });
    if (alt) form.append("alt", alt);

    const res = await nodeFetch(`${ASSET_API}/assets`, {
      method: "POST",
      headers: { ...authHeaders, ...form.getHeaders() },
      body: form,
    });

    if (!res.ok) {
      const err = await res.text();
      console.error(`\n  ⚠  Asset upload failed ${oldId}: ${res.status} ${err}`);
      return null;
    }

    const json = await res.json();
    return json.id ?? null;
  } catch (e) {
    console.error(`\n  ⚠  Asset error ${oldId}: ${e.message}`);
    return null;
  }
}

async function createDocument(doc) {
  const body = {
    title: doc.uid ?? doc.type,
    type: doc.type,
    lang: doc.lang,
    data: doc.data,
  };
  if (doc.uid) body.uid = doc.uid;
  if (doc.tags?.length) body.tags = doc.tags;

  const res = await nodeFetch(`${MIGRATION_API}/documents`, {
    method: "POST",
    headers: { ...authHeaders, "Content-Type": "application/json" },
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
  // Fetch all source documents
  const sourceClient = prismic.createClient(SOURCE_REPO, { fetchOptions: { cache: "no-store" } });
  console.log(`\n📦  Fetching documents from "${SOURCE_REPO}"...`);
  const docs = await sourceClient.dangerouslyGetAll();
  console.log(`✅  Found ${docs.length} documents\n`);

  // Collect all unique images
  const allImages = new Map();
  for (const doc of docs) extractImages(doc.data, allImages);
  console.log(`🖼   Found ${allImages.size} unique assets\n`);

  // Phase 1: Upload assets
  const idMap = new Map();
  let assetCount = 0;
  for (const [oldId, { url, alt }] of allImages) {
    assetCount++;
    process.stdout.write(`\r  ⬆  Asset ${assetCount}/${allImages.size}: ${oldId}   `);
    const newId = await uploadAsset(oldId, url, alt);
    if (newId) idMap.set(oldId, newId);
    await sleep(1100);
  }
  console.log(`\n\n  ✔  ${idMap.size}/${allImages.size} assets uploaded\n`);

  // Phase 2: Create documents with remapped IDs
  console.log(`📝  Creating documents in "${TARGET_REPO}"...\n`);
  let created = 0, failed = 0;

  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    process.stdout.write(`\r  [${i + 1}/${docs.length}] [${doc.type}] ${doc.uid ?? "(singleton)"}   `);
    const remapped = { ...doc, data: remapIds(doc.data, idMap) };
    const ok = await createDocument(remapped);
    if (ok) created++; else failed++;
    await sleep(1100);
  }

  console.log(`\n\n✅  Migration complete!`);
  console.log(`   Assets:    ${idMap.size}/${allImages.size} uploaded`);
  console.log(`   Documents: ${created}/${docs.length} created`);
  if (failed) console.log(`   Failed:    ${failed}`);
  console.log(`\n👉  Go to "${TARGET_REPO}" Prismic dashboard → Migration Releases → publish\n`);
}

main().catch((err) => {
  console.error("\n❌  Unexpected error:", err?.message ?? err);
  if (err?.cause) console.error("   Cause:", err.cause?.message ?? err.cause);
  process.exit(1);
});
