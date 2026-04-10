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

export const revalidate = false;

export default async function Page() {
  const client = createClient();
  const doc = (await (client as any)
    .getSingle("media_temp")
    .catch(() => null)) as Content.FilmDocument | null;

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">Media page not published.</main>
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
    .getSingle("film")
    .catch(() => null)) as any;
  if (!doc) {
    return {
      title: "Surim",
      description: "Welcome to Surim's official media page.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, [
    "media",
  ]);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/media";

//   return getMetaDataInfo(pathname, parent);
//   }
