import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  asText,
  createClient,
  createMigration,
  createWriteClient,
} from "@prismicio/client";

const DEFAULT_SOURCE_REPOSITORY = "lunim-v3";
const DEFAULT_TARGET_REPOSITORY = "surim";

const args = new Set(process.argv.slice(2));
const execute = args.has("--execute");
const allowExistingTarget = args.has("--allow-existing-target");

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
      continue;
    }

    const [key, ...valueParts] = trimmed.split("=");
    const value = valueParts.join("=").replace(/^['"]|['"]$/g, "");
    process.env[key] ??= value;
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const sourceRepository =
  process.env.SOURCE_PRISMIC_REPOSITORY || DEFAULT_SOURCE_REPOSITORY;
const targetRepository =
  process.env.TARGET_PRISMIC_REPOSITORY ||
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT ||
  process.env.PRISMIC_REPOSITORY_NAME ||
  DEFAULT_TARGET_REPOSITORY;

const writeToken = process.env.PRISMIC_WRITE_TOKEN;

function getDocumentTitle(document) {
  const data = document.data || {};
  const candidates = [
    data.meta_title,
    data.blog_article_heading,
    data.heading,
    data.title,
    data.name,
    data.author_name,
    data.company_name,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }

    if (Array.isArray(candidate)) {
      const text = asText(candidate).trim();
      if (text) return text;
    }
  }

  return document.uid || document.type;
}

async function getAllDocuments(client) {
  const documents = [];
  let page = 1;
  let totalPages = 1;

  do {
    const response = await client.get({ page, pageSize: 100 });
    documents.push(...response.results);
    totalPages = response.total_pages;
    page += 1;
  } while (page <= totalPages);

  return documents;
}

const sourceClient = createClient(sourceRepository);
const targetClient = createClient(targetRepository);

const [sourceDocuments, targetDocuments] = await Promise.all([
  getAllDocuments(sourceClient),
  getAllDocuments(targetClient),
]);

console.log(
  `Source ${sourceRepository}: ${sourceDocuments.length} document(s). Target ${targetRepository}: ${targetDocuments.length} document(s).`,
);

if (sourceDocuments.length === 0) {
  throw new Error(`No documents found in source repository "${sourceRepository}".`);
}

if (targetDocuments.length > 0 && !allowExistingTarget) {
  throw new Error(
    `Target repository "${targetRepository}" already has ${targetDocuments.length} document(s). Re-run with --allow-existing-target if you intentionally want to migrate into a non-empty repository.`,
  );
}

const migration = createMigration();

for (const document of sourceDocuments) {
  migration.createDocumentFromPrismic(document, getDocumentTitle(document));
}

console.log(
  `Prepared ${sourceDocuments.length} document(s) for migration from ${sourceRepository} to ${targetRepository}.`,
);

if (!execute) {
  console.log("Dry run only. Re-run with --execute to create the Prismic migration release.");
  process.exit(0);
}

if (!writeToken) {
  throw new Error("Missing PRISMIC_WRITE_TOKEN in the environment or .env.local.");
}

const writeClient = createWriteClient(targetRepository, { writeToken });

await writeClient.migrate(migration, {
  reporter(event) {
    if (event.type === "start") {
      console.log(
        `Starting migration: ${event.data.pending.documents} document(s), ${event.data.pending.assets} asset(s).`,
      );
    }

    if (event.type === "assets:created") {
      console.log(`Created ${event.data.created} asset(s).`);
    }

    if (event.type === "documents:created") {
      console.log(`Created ${event.data.created} document(s).`);
    }

    if (event.type === "documents:updated") {
      console.log(`Updated ${event.data.updated} document(s).`);
    }

    if (event.type === "end") {
      console.log(
        `Finished migration: ${event.data.migrated.documents} document(s), ${event.data.migrated.assets} asset(s).`,
      );
    }
  },
});
