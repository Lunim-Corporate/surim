// Prismic
import { createClient } from "../prismicio";
import { SliceZone } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { components } from "@surim/ui/slices";
// Next
import type { Metadata, ResolvingMetadata } from "next";
import Script from "next/script";
// Utils
import { pickBaseMetadata } from "@surim/utils";
import { generateMetaDataInfo } from "@surim/utils";
// Schema
import type { WithContext, Organization } from "schema-dts";

export const revalidate = false;

export default async function AiAutomationPage() {
  const client = createClient();
  const doc = (await (client as any)
    .getByUID("digital_page", "ai")
    .catch(() => null)) as Content.DigitalPageDocument | null;

  if (!doc) {
    // If no Prismic document exists yet, show a placeholder
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center p-8">
          <h1 className="text-5xl font-bold mb-4">AI Automation</h1>
          <p className="text-xl mb-8">
            This page will be powered by Prismic CMS. Please create an &ldquo;AI Automation&rdquo; document in Prismic to see content here.
          </p>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-left">
            <h2 className="text-2xl font-semibold mb-4">Setup Instructions:</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Open Prismic Slice Machine: <code className="bg-black/30 px-2 py-1 rounded">npm run slicemachine</code></li>
              <li>Create a new &ldquo;AI Automation&rdquo; document</li>
              <li>Add slices (Hero, Service Grid, FAQ, etc.)</li>
              <li>Publish the document</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </div>
      </main>
    );
  }

  const orgJsonLd: WithContext<Organization> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Surim AI Automation",
    alternateName: "Surim AI",
    url: "https://ai.surim.io/",
    logo: "https://images.prismic.io/surim/aO4uRJ5xUNkB17lv_surim-logo.png",
    description: "AI-powered automation solutions from Surim",
    parentOrganization: {
      "@type": "Organization",
      name: "Surim",
      url: "https://surim.io/"
    }
  };

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <main className="bg-black text-white">
        <SliceZone slices={doc.data.slices} components={components} />
      </main>
    </>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = (await (client as any)
    .getByUID("digital_page", "ai")
    .catch(() => null)) as Content.DigitalPageDocument | null;

  if (!doc) {
    return {
      title: "AI Automation",
      description: "Transform your business with AI automation solutions from Surim.",
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, true);
}
