// app/academy/[uid]/page.tsx
// Marketing, Engineering, Design, Filmmaking, HR
// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { Content } from "@prismicio/client";
type AcademyCourseDocument = Content.AcademyCourseDocument;
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

type Params = { uid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  const doc = (await (client as any).getByUID("academy_course", uid).catch(() => null)) as AcademyCourseDocument | null;
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
  const docs = (await client.getAllByType('academy_course')) as unknown as AcademyCourseDocument[];
  return docs.map((d: AcademyCourseDocument) => ({ uid: d.uid! }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const { uid } = await params;
  const doc = (await (client as any)
  .getByUID("academy_course", uid)
  .catch(() => null)) as AcademyCourseDocument | null;
  if (!doc) {
    return {
      title: "Surim",
      description: "Welcome to Surim's official academy course page."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, ['academy', uid]);
}

// export async function generateMetadata({ params }: { params: Promise<Params> }, parent: ResolvingMetadata) {
//   const pathname = "/academy/[uid]";
//   const { uid } = await params; 

//   return getMetaDataInfo(pathname, parent, uid);
// }
