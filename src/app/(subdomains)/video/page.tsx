import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";
import { pickBaseMetadata } from "@/utils/metadata";

export default async function VideoPage() {
  const client = createClient();
  const doc = await client.getSingle("video").catch(() => null);

  if (!doc) {
    notFound();
  }

  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client.getSingle("video").catch(() => null);

  if (!doc) {
    return {
      title: "Video Production",
      description: "Professional video production services from Surim.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, true);
}
