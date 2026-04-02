/**
 * Step 1: Export all content from lunim-v3 to a local folder
 * Run: npx tsx export.ts
 */

import { writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import * as path from "node:path";

const SOURCE_REPO = "lunim-v3";
const EXPORT_DIR = "./lunim-export";
const ASSETS_DIR = "./lunim-export/assets";

async function getMasterRef(): Promise<string> {
  const res = await fetch(`https://${SOURCE_REPO}.cdn.prismic.io/api/v2`);
  const json: any = await res.json();
  return json.refs.find((r: any) => r.isMasterRef)?.ref;
}

async function fetchAllDocuments(ref: string): Promise<any[]> {
  const docs: any[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const res = await fetch(
      `https://${SOURCE_REPO}.cdn.prismic.io/api/v2/documents/search?ref=${ref}&pageSize=100&page=${page}`
    );
    const json: any = await res.json();
    docs.push(...json.results);
    totalPages = json.total_pages;
    process.stdout.write(`\r  Fetched ${docs.length}/${json.total_results_size} documents...`);
    page++;
  }
  console.log();
  return docs;
}

function extractImages(obj: any, out = new Map<string, { url: string; alt: string | null }>()) {
  if (!obj || typeof obj !== "object") return out;
  if (Array.isArray(obj)) { obj.forEach((i) => extractImages(i, out)); return out; }

  if (
    obj.url && obj.dimensions &&
    typeof obj.url === "string" &&
    obj.url.includes("prismic.io")
  ) {
    const baseUrl = obj.url.split("?")[0];
    // Prismic asset URL pattern: /{id}_{filename}.ext — id ends at first underscore-then-lowercase
    // Also handles IDs that end with - or _ (special chars in Prismic IDs)
    const idMatch = baseUrl.match(/\/([A-Za-z0-9_-]{10,?})_[^/]+\.[a-z]+$/) ||
                    baseUrl.match(/\/([a-zA-Z0-9_-]{10,})(?:\.[a-z]+)?$/);
    if (idMatch && !out.has(idMatch[1])) {
      out.set(idMatch[1], { url: baseUrl, alt: obj.alt ?? null });
    }
  }

  Object.values(obj).forEach((v) => extractImages(v, out));
  return out;
}

async function downloadAsset(id: string, url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) { console.error(`  ⚠  Failed to fetch ${id}: ${res.status}`); return null; }

    const contentType = res.headers.get("content-type") || "image/jpeg";
    const ext = contentType.split("/")[1]?.split(";")[0]?.split("+")[0] || "jpg";
    const filename = `${id}.${ext}`;
    const filepath = path.join(ASSETS_DIR, filename);

    const buffer = Buffer.from(await res.arrayBuffer());
    await writeFile(filepath, buffer);
    return filename;
  } catch (e: any) {
    console.error(`  ⚠  Error downloading ${id}: ${e.message}`);
    return null;
  }
}

async function main() {
  // Create export directories
  if (!existsSync(EXPORT_DIR)) await mkdir(EXPORT_DIR, { recursive: true });
  if (!existsSync(ASSETS_DIR)) await mkdir(ASSETS_DIR, { recursive: true });

  console.log(`\n📦  Fetching documents from "${SOURCE_REPO}"...`);
  const ref = await getMasterRef();
  const docs = await fetchAllDocuments(ref);
  console.log(`✅  Found ${docs.length} documents\n`);

  // Save all documents to JSON
  await writeFile(
    path.join(EXPORT_DIR, "documents.json"),
    JSON.stringify(docs, null, 2)
  );
  console.log(`💾  Saved documents.json\n`);

  // Collect all unique images
  const allImages = new Map<string, { url: string; alt: string | null }>();
  for (const doc of docs) extractImages(doc.data, allImages);
  console.log(`🖼   Found ${allImages.size} unique assets — downloading...\n`);

  // Download each asset
  const assetManifest: Record<string, { filename: string | null; url: string; alt: string | null }> = {};
  let count = 0;

  for (const [id, { url, alt }] of allImages) {
    count++;
    process.stdout.write(`\r  [${count}/${allImages.size}] ${id}   `);
    const filename = await downloadAsset(id, url);
    assetManifest[id] = { filename, url, alt };
  }

  console.log(`\n`);

  // Save asset manifest
  await writeFile(
    path.join(EXPORT_DIR, "assets.json"),
    JSON.stringify(assetManifest, null, 2)
  );

  const downloaded = Object.values(assetManifest).filter((a) => a.filename).length;
  console.log(`✅  Export complete!`);
  console.log(`   Documents: ${docs.length} → ${EXPORT_DIR}/documents.json`);
  console.log(`   Assets:    ${downloaded}/${allImages.size} → ${ASSETS_DIR}/`);
  console.log(`   Manifest:  ${EXPORT_DIR}/assets.json\n`);
}

main().catch((err) => {
  console.error("\n❌  Export failed:", err?.message ?? err);
  process.exit(1);
});
