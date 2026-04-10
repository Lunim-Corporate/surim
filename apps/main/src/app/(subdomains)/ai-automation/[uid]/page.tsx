// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { Content } from "@prismicio/client";
type AiAutomationPageDocument = Content.AiAutomationDocument;
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export const revalidate = false;

type Params = { uid: string };

export default async function AiAutomationDynamicPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { uid } = await params;

  const client = createClient();
  const doc = (await (client as any)
    .getByUID("ai_automation_page", uid)
    .catch(() => null)) as AiAutomationPageDocument | null;

  if (!doc) notFound();

  const slices = doc.data?.slices;

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={slices} components={components} />
    </main>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const docs = (await client.getAllByType(
    "ai_automation_page",
  )) as unknown as AiAutomationPageDocument[];
  return docs.map((d: AiAutomationPageDocument) => ({ uid: d.uid! }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const { uid } = await params;
  const doc = (await (client as any)
    .getByUID("ai_automation_page", uid)
    .catch(() => null)) as AiAutomationPageDocument | null;

  if (!doc) {
    return {
      title: "AI Automation",
      description: "Discover AI automation solutions from Surim.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, [
    "ai-automation",
    uid,
  ]);
}
