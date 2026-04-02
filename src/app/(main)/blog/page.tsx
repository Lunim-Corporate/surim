// Next
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismic
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page({ searchParams }: PageProps) {
  const client = createClient();

  const doc = await client.getSingle("blog_home_page").catch(() => null);
  if (!doc) return notFound();

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <main className="bg-black min-h-screen">
      <SliceZone
        slices={doc.data.slices}
        components={components}
        context={{ searchParams: resolvedSearchParams }}
      />
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
  .getSingle("blog_home_page")
  .catch(() => null)) as any;
  if (!doc) {
    return {
      title: "Surim",
      description: "Welcome to Lunim's official blog page."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, ['blog']);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/blog";

//   return getMetaDataInfo(pathname, parent);
//   }
