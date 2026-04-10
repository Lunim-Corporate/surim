// Prismic
import { createClient } from "@/prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
// Next
import { Metadata, ResolvingMetadata } from "next";
import { JsonLdServer } from "@/components/JsonLdServer";
import type { WithContext, Organization } from "schema-dts";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export const revalidate = false;

export default async function Page() {
  const client = createClient();
  const doc = (await (client as any)
    .getSingle("tabb")
    .catch(() => null)) as Content.TabbDocument | null;

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">Tabb page not published.</main>
    );
  }

  const orgJsonLd: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Surim",
    alternateName: "Surim.io",
    url: "https://surim.io/",
    logo: "https://surim.io/_next/image?url=https%3A%2F%2Fimages.prismic.io%2Fsurim%2FaO4uRJ5xUNkB17lv_surim-logo.png%3Fauto%3Dformat%2Ccompress&w=384&q=75",
  };

  // console.log(
  //   "✅ Slices:",
  //   doc.data.slices.map((slice) => slice.slice_type)
  // );
  return (
    <>
      <JsonLdServer data={orgJsonLd} />
      <main className="bg-black">
        <SliceZone slices={doc.data.slices} components={components} />
      </main>
    </>
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
  .getSingle("tabb")
  .catch(() => null)) as any;
  if (!doc) {
    return {
      title: "Surim Home Page",
      description: "Welcome to Surim's official homepage."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, ['tabb']);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/tabb";

//   return getMetaDataInfo(pathname, parent);
//   }