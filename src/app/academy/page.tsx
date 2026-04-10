// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import { Metadata, ResolvingMetadata } from "next";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export const revalidate = 60;

export default async function Page() {
  const client = createClient();
  const doc = (await (client as any)
    .getSingle("academy")
    .catch(() => null)) as Content.AcademyDocument | null;

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">Academy page not published.</main>
    );
  }

  // console.log(
  //   "✅ Slices:",
  //   doc.data.slices.map((slice) => slice.slice_type)
  // );
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
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = (await (client as any)
  .getSingle("academy")
  .catch(() => null)) as Content.AcademyDocument | null;
  if (!doc) {
    return {
      title: "Surim",
      description: "Welcome to Surim's official academy page."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, ['academy']);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/academy";

//   return getMetaDataInfo(pathname, parent);
//   }