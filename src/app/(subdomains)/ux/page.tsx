// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import type { Metadata, ResolvingMetadata } from "next";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export const revalidate = false;

export default async function UxPage() {
  const client = createClient();
  const doc = (await (client as any)
    .getByUID("digital_page", "ux")
    .catch(() => null)) as Content.DigitalPageDocument | null;

  if (!doc) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <h1 className="text-5xl font-bold mb-4">UX</h1>
          <p className="text-xl mb-8">
            This page will be powered by Prismic CMS. Please create a
            &ldquo;Digital Page&rdquo; document with the UID
            <span className="font-semibold"> ux</span> to see content here.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-black text-white">
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
  const doc = (await (client as any)
    .getByUID("digital_page", "ux")
    .catch(() => null)) as Content.DigitalPageDocument | null;

  if (!doc) {
    return {
      title: "UX",
      description: "UX design services and experiences from Surim.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, true);
}
