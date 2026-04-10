// Prismic
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@/slices";
import { getSingleDocument } from "@/lib/siteContent";
// Next
import type { Metadata, ResolvingMetadata } from "next";
import Script from "next/script";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { notFound } from "next/navigation";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";
// Schema
import type { WithContext, Organization } from "schema-dts";

export const revalidate = false;

export default async function Page() {
  const doc = await getSingleDocument<Content.HomepageDocument>("homepage");
  if (!doc) notFound();

  const orgJsonLd: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Surim",
    alternateName: "Surim.io",
    url: "https://surim.io/",
    logo: "https://images.prismic.io/surim/aO4uRJ5xUNkB17lv_surim-logo.png",
    description: "Surim - Technology and innovation solutions",
    sameAs: [
      // Add your social media profile URLs here when available
      // "https://twitter.com/surim",
      // "https://linkedin.com/company/surim",
      // "https://facebook.com/surim"
    ],
  };

  // console.log("✅ Slices:", doc.data.slices.map((slice) => slice.slice_type)// );
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
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
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await getSingleDocument<Content.HomepageDocument>("homepage");
  if (!doc) {
    return {
      title: "Surim Home Page",
      description: "Welcome to Surim's official homepage.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, true);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/";

//   return getMetaDataInfo(pathname, parent);
//   }
