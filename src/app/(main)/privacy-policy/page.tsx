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
    .getSingle("privacy_policy_sm")
    .catch(() => null)) as Content.PrivacyPolicySmDocument | null;

  if (!doc || !Array.isArray(doc.data.slices)) {
    return (
      <main className="p-6 text-white bg-black">
        Privacy Policy not published.
      </main>
    );
  }

  return (
    <main className="bg-[#0f172a] text-white min-h-screen p-8">
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
  .getSingle("privacy_policy_sm")
  .catch(() => null)) as any;
  if (!doc) {
    return {
      title: "Surim",
      description: "Welcome to Surim's official privacy policy page."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, ['privacy_policy']);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/privacy-policy";

//   return getMetaDataInfo(pathname, parent);
//   }