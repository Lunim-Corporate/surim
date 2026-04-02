// src/app/(subdomains)/ai-automation/discovery/page.tsx

// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";

// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { DigitalPageDocument } from "../../../../../prismicio-types";

// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export default async function AiDiscoveryPage() {
  const client = createClient();

  // 🔑 Reuse MAIN SITE Discovery page
  const doc = (await client
    .getByUID("digital_page", "discovery")
    .catch(() => null)) as DigitalPageDocument | null;

  if (!doc) notFound();

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);

  const doc = (await client
    .getByUID("digital_page", "discovery")
    .catch(() => null)) as DigitalPageDocument | null;

  if (!doc) {
    return {
      title: "Discovery | Lunim AI",
      description:
        "Discover how Lunim helps businesses define and shape AI solutions.",
    };
  }

  return generateMetaDataInfo(
    doc.data,
    parentMetaData,
    true, // treat as top-level page
    false,
    ["discovery"],
  );
}
