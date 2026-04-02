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
    .getSingle("our_team_page")
    .catch(() => null)) as Content.OurTeamPageDocument | null;

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">
        Our team page not published.
      </main>
    );
  }

  return (
    <main className="bg-black">
      <SliceZone slices={doc.data.slices} components={components} />
    </main>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = (await (client as any)
    .getSingle("our_team_page")
    .catch(() => null)) as any;
  if (!doc) {
    return {
      title: "Surim",
      description: "Welcome to Surim's official team page.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, [
    "our_team",
  ]);
}
