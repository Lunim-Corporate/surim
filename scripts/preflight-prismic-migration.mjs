import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { createClient } from "@prismicio/client";

const DEFAULT_SOURCE_REPOSITORY = "lunim-v3";
const DEFAULT_TARGET_REPOSITORY = "surim";

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

function richTextBlocks(value) {
  if (
    Array.isArray(value) &&
    value.every((item) => item && typeof item === "object" && "type" in item)
  ) {
    return value.map((item) => item.type).filter(Boolean);
  }

  return [];
}

function allowedRichTextTypes(field) {
  if (field?.type !== "StructuredText") return null;

  const config = field.config || {};
  const allowed = config.single || config.multi || "";
  return new Set(
    allowed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function validateRichTextField({ problems, document, location, field, value }) {
  const allowed = allowedRichTextTypes(field);
  if (!allowed) return;

  for (const blockType of richTextBlocks(value)) {
    if (!allowed.has(blockType)) {
      problems.push({
        document,
        location,
        fieldLabel: field.config?.label,
        blockType,
        allowed: [...allowed].join(","),
      });
    }
  }
}

function validateGroup({ problems, document, location, modelFields, value }) {
  if (!Array.isArray(value)) return;

  for (const [itemIndex, item] of value.entries()) {
    validateFields({
      problems,
      document,
      location: `${location}.${itemIndex}`,
      modelFields,
      data: item,
    });
  }
}

function validateSlice({ problems, document, location, sliceModels, slice }) {
  const sliceLocation = `${location}.${slice.slice_type}:${slice.variation || "default"}`;
  const model = sliceModels.get(slice.slice_type);
  if (!model) {
    problems.push({
      document,
      location: sliceLocation,
      blockType: "missing_slice_model",
      allowed: slice.slice_type,
    });
    return;
  }

  const variation =
    model.variations?.find((item) => item.id === slice.variation) ||
    model.variations?.find((item) => item.id === "default") ||
    model.variations?.[0];

  validateFields({
    problems,
    document,
    location: `${sliceLocation}.primary`,
    modelFields: variation?.primary || {},
    data: slice.primary || {},
  });

  if (Array.isArray(slice.items)) {
    for (const [itemIndex, item] of slice.items.entries()) {
      validateFields({
        problems,
        document,
        location: `${sliceLocation}.items.${itemIndex}`,
        modelFields: variation?.items || {},
        data: item,
      });
    }
  }
}

function validateSlices({ problems, document, location, sliceModels, value }) {
  if (!Array.isArray(value)) return;

  for (const [sliceIndex, slice] of value.entries()) {
    validateSlice({
      problems,
      document,
      location: `${location}.${sliceIndex}`,
      sliceModels,
      slice,
    });
  }
}

function validateFields({ problems, document, location, modelFields, data, sliceModels }) {
  if (!modelFields || !data) return;

  for (const [fieldID, field] of Object.entries(modelFields)) {
    const value = data[fieldID];
    const fieldLocation = `${location}.${fieldID}`;

    validateRichTextField({
      problems,
      document,
      location: fieldLocation,
      field,
      value,
    });

    if (field.type === "Group") {
      validateGroup({
        problems,
        document,
        location: fieldLocation,
        modelFields: field.config?.fields || {},
        value,
      });
    }

    if (field.type === "Slices" || field.type === "LegacySlices") {
      validateSlices({
        problems,
        document,
        location: fieldLocation,
        sliceModels,
        value,
      });
    }
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

const [customTypeModels, sharedSliceModels] = await Promise.all([
  readJSONFilesFromDirectories(resolve(process.cwd(), "customtypes"), "index.json"),
  readJSONFilesFromDirectories(resolve(process.cwd(), "src/slices"), "model.json"),
]);

const customTypes = new Map(customTypeModels.map((model) => [model.id, model]));
const sliceModels = new Map(sharedSliceModels.map((model) => [model.id, model]));

const [sourceDocuments, targetDocuments] = await Promise.all([
  getAllDocuments(createClient(sourceRepository)),
  getAllDocuments(createClient(targetRepository)),
]);

const problems = [];

for (const document of sourceDocuments) {
  const model = customTypes.get(document.type);
  if (!model) {
    problems.push({
      document: `${document.type}:${document.uid || document.id}`,
      location: "document",
      blockType: "missing_custom_type_model",
      allowed: document.type,
    });
    continue;
  }

  for (const [tabID, modelFields] of Object.entries(model.json || {})) {
    validateFields({
      problems,
      document: `${document.type}:${document.uid || document.id}`,
      location: tabID,
      modelFields,
      data: document.data,
      sliceModels,
    });
  }
}

console.log(`Source ${sourceRepository}: ${sourceDocuments.length} document(s).`);
console.log(`Target ${targetRepository}: ${targetDocuments.length} public document(s).`);
console.log(`Local models: ${customTypes.size} custom type(s), ${sliceModels.size} shared slice(s).`);

if (problems.length > 0) {
  console.log(JSON.stringify(problems, null, 2));
  throw new Error(`Preflight failed with ${problems.length} model/content mismatch(es).`);
}

console.log("Preflight passed: source content matches the local Surim rich text and slice models.");
