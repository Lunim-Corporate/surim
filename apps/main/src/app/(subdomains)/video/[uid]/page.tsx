import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import { components } from "@/slices";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";
type VideoPageDocument = any;

export const revalidate = false;

type Params = { uid: string };

export default async function VideoDynamicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;
  const client = createClient();
  const doc = await client.getByUID("video_page", uid).catch(() => null);

  if (!doc) notFound();

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={doc.data?.slices} components={components} />
    </main>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType("video_page");
  return docs.map((d: VideoPageDocument) => ({ uid: d.uid! }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { uid } = await params;
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client.getByUID("video_page", uid).catch(() => null);

  if (!doc) {
    return {
      title: "Video Production",
      description: "Professional video production services from Surim.",
    };
  }

  return generateMetaDataInfo(
    doc.data,
    parentMetaData,
    false,
    false,
    ["video", uid]
  );
}
