// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";

// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
type UxDocument = any;

// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export const revalidate = false;

type Params = { uid: string };

export default async function UxDynamicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;

  const client = createClient();
  const doc = (await (client as any)
    .getByUID("ux_page", uid)
    .catch(() => null)) as UxDocument | null;

  if (!doc) notFound();

  const slices = doc.data?.slices;

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={slices} components={components} />
    </main>
  );
}

/* ---------- Static Params ---------- */
export async function generateStaticParams() {
  const client = createClient();
  const docs = (await client.getAllByType(
    "ux_page",
  )) as unknown as UxDocument[];

  return docs.map((d) => ({
    uid: d.uid!,
  }));
}

/* ---------- Metadata ---------- */
export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const { uid } = await params;

  const doc = (await (client as any)
    .getByUID("ux_page", uid)
    .catch(() => null)) as UxDocument | null;

  if (!doc) {
    return {
      title: "UX",
      description: "Discover UX solutions from Surim.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, [
    "ux",
    uid,
  ]);
}
