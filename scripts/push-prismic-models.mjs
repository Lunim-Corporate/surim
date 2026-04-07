import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createClient } from "@prismicio/custom-types-client";

const args = new Set(process.argv.slice(2));
const execute = args.has("--execute");

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

async function readJSONFilesFromDirectories(root, filename) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const file = join(root, entry.name, filename);
    if (existsSync(file)) {
      files.push(JSON.parse(readFileSync(file, "utf8")));
    }
  }

  return files;
}

async function upsert(client, model, getExisting, update, insert) {
  try {
    await getExisting(model.id);
    await update(model);
    return "updated";
  } catch (error) {
    if (error?.name !== "NotFoundError") {
      throw error;
    }

    await insert(model);
    return "inserted";
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"));

const repositoryName =
  process.env.TARGET_PRISMIC_REPOSITORY ||
  process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT ||
  process.env.PRISMIC_REPOSITORY_NAME ||
  "surim";

const token =
  process.env.PRISMIC_CUSTOM_TYPES_API_TOKEN ||
  process.env.PRISMIC_WRITE_TOKEN;

const customTypes = await readJSONFilesFromDirectories(
  resolve(process.cwd(), "customtypes"),
  "index.json",
);
const sharedSlices = await readJSONFilesFromDirectories(
  resolve(process.cwd(), "src/slices"),
  "model.json",
);

console.log(
  `Prepared ${customTypes.length} custom type model(s) and ${sharedSlices.length} shared slice model(s) for ${repositoryName}.`,
);

if (!execute) {
  console.log("Dry run only. Re-run with --execute to push models to Prismic.");
  process.exit(0);
}

if (!token) {
  throw new Error(
    "Missing PRISMIC_CUSTOM_TYPES_API_TOKEN or PRISMIC_WRITE_TOKEN in the environment or .env.local.",
  );
}

const client = createClient({ repositoryName, token });

for (const model of customTypes) {
  const action = await upsert(
    client,
    model,
    (id) => client.getCustomTypeByID(id),
    (nextModel) => client.updateCustomType(nextModel),
    (nextModel) => client.insertCustomType(nextModel),
  );
  console.log(`${action} custom type: ${model.id}`);
}

for (const model of sharedSlices) {
  const action = await upsert(
    client,
    model,
    (id) => client.getSharedSliceByID(id),
    (nextModel) => client.updateSharedSlice(nextModel),
    (nextModel) => client.insertSharedSlice(nextModel),
  );
  console.log(`${action} shared slice: ${model.id}`);
}
