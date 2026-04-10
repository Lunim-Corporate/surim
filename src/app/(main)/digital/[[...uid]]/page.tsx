// digital/[[...uid]]/page.tsx
/* digital/[uid]
    Discovery - digital/discovery
    User Experience - digital/ux
    AI Workflows - digital/ai
    Web3 & Decentralisation - digital/web3
*/
/* digital/[uid]/case-studies
    e.g., digital/ai/case-studies
    Fetch all 'case_study_sm' documents and filter by `digital_category` based on parent route (e.g., discovery, ux, ai, web3)
*/
/* digital/[uid]/case-studies/[uid]
    e.g., digital/ai/case-studies/pizza-hut-checkout
 */
// Prismic
import { SliceZone } from "@prismicio/react";
import Head from "next/head";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import { DigitalPageDocument } from "../../../../../prismicio-types";
import CaseStudies from "@/components/CaseStudies";
import { CaseStudySmDocumentWithLegacy } from "../case-studies/types";
// Next
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";
import type { CaseStudyTextPanelProps } from "@/slices/CaseStudyTextPanel";

type Slice = {
  id: string;
  slice_type: string;
  variation: string;
  items: any[];
  primary: CaseStudyTextPanelProps['slice']['primary'];
};


type Params = { uid: string[] };
export const revalidate = false;

export default async function Page({ params }: { params: Promise<Params> }) {
    const { uid } = await params;
    
    const client = createClient();
    
    // /digital
    if (!uid) {
        // console.log("Root");
        const doc = await (client as any)
            .getSingle("tech")
            .catch(() => null);
        if (!doc) notFound()
        return (
            <main className="bg-black">
                <SliceZone slices={doc.data.slices} components={components} />
            </main>
        );
    }
    
    // /digital/[uid]
    else if (uid.length === 1) {
        // console.log("1", uid);
        const doc = (await (client as any).getByUID("digital_page", uid[0]).catch(() => null)) as DigitalPageDocument | null;
        if (!doc) notFound();
        const slices = doc.data?.slices;
        return (
            <main className="bg-black text-white min-h-screen">
                <SliceZone slices={slices} components={components} />
            </main>
        );
    }
    
    // /digital/[uid]/case-studies
    // E.g., ["ai", "case-studies"], ["web3", "case-studies"]
    else if (uid.length === 2) {
        // console.log("2", uid);
        if (uid[1] !== "case-studies") notFound();
        const allCaseStudies = (await (client as any).getAllByType("case_study_sm")) as CaseStudySmDocumentWithLegacy[];
        const filteredCaseStudies = allCaseStudies.filter((cs: any) => cs.data.digital_category === uid[0]);
        const caseStudyPage = await (client as any).getSingle("case_studies").catch(() => null);
        return <CaseStudies filteredCaseStudies={filteredCaseStudies} caseStudyPage={caseStudyPage} />;
    }
    
    // /digital/[uid]/case-studies/[uid]
    // E.g., ["ai", "case-studies", "pizza-hut-checkout"]
    else if (uid.length === 3) {
        // console.log("3", uid);
        const doc = await client.getByUID("case_study_sm", uid[2]).catch(() => null);
        if (!doc) notFound();

        // Ensure the fetched case study actually belongs to the requested category.
        // Without this check a case study with UID `pizza-hut-checkout` in category
        // `ux` would still render at `/digital/web3/case-studies/pizza-hut-checkout`.
        const caseStudyCategory = doc.data?.digital_category;
        if (caseStudyCategory !== uid[0]) 
            notFound();
    
        const slices = doc.data.slices as Slice[];


            // --- JSON-LD for SEO ---
        const challengeSlice = slices.find(
          s => s.slice_type === 'case_study_text_panel' && s.variation === 'default'
        );
        const solutionSlice = slices.find(
          s => s.slice_type === 'case_study_text_panel' && s.variation === 'solutionTextPanel'
        );
        const impactSlice = slices.find(
          s => s.slice_type === 'case_study_text_panel' && s.variation === 'impactTextPanel'
        );
        
        const jsonLD = {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "headline": challengeSlice?.primary.challenge_title[0]?.text || "",
          "description": challengeSlice?.primary.challenge_content[0]?.text || "",
          "about": solutionSlice?.primary.solution_content[0]?.text || "",
          "impact": impactSlice?.primary.impact_content[0]?.text || "",
          "author": { "@type": "Organization", "name": "Your Company Name" },
          "datePublished": doc.first_publication_date || new Date().toISOString()
        };
        
        return (
          <main className="bg-black text-white min-h-screen">
            <Head>
              <script type="application/ld+json">
                {JSON.stringify(jsonLD)}
              </script>
            </Head>
        
            <SliceZone slices={slices} components={components} />
          </main>
        );
        
    }
}

export async function generateStaticParams() {
    const client = createClient();

    const [digitalPages, caseStudies] = await Promise.all([
        client.getAllByType("digital_page").catch(() => []),
        client.getAllByType("case_study_sm").catch(() => []),
    ]);

    const paths: { uid: string[] }[] = [
        // /digital
        { uid: [] },
    ];

    for (const doc of digitalPages) {
        // /digital/[uid]
        paths.push({ uid: [doc.uid!] });
        // /digital/[uid]/case-studies
        paths.push({ uid: [doc.uid!, "case-studies"] });
    }

    for (const cs of caseStudies) {
        const category = (cs.data as any)?.digital_category;
        if (category && cs.uid) {
            // /digital/[category]/case-studies/[uid]
            paths.push({ uid: [category, "case-studies", cs.uid] });
        }
    }

    return paths;
}

export async function generateMetadata(
    { params }: { params: Promise<Params> },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { uid } = await params;
    const client = createClient();
    const parentMetaData = await pickBaseMetadata(parent);
    let doc;

    if (!uid) {
        doc = await client.getSingle("tech").catch(() => null);
    }
    else if (uid.length === 1) {
        doc = await client.getByUID("digital_page", uid[0]).catch(() => null);
    } else if (uid.length === 2 && uid[1] === "case-studies") {
        doc = await client.getSingle("case_studies").catch(() => null);
    } else if (uid.length === 3) {
        doc = await client.getByUID("case_study_sm", uid[2]).catch(() => null);
        // Ensure metadata generation respects the requested category.
        // If the fetched case study's category doesn't match the route's category,
        // treat it as not found to keep behavior consistent with the page renderer.
        if (doc) {
            const caseStudyCategory = String(doc.data?.digital_category || "").trim().toLowerCase();
            const requestedCategory = String(uid[0] || "").trim().toLowerCase();
            if (caseStudyCategory !== requestedCategory) notFound();
        }
    }

    if (!doc) {
        return {
            title: "Surim",
            description: "Welcome to Surim's official homepage."
        };
    }

    return generateMetaDataInfo(doc.data, parentMetaData, false, true, uid);
}

/* Notes
Why you cannot do `digital/[[...uid]]/opengraph-image.tsx` for OG images:
    Next.js can’t statically predict all possible paths (/, /docs/getting-started, /blog/hello-world, etc.).
    Because of that, it does not automatically inject OG meta tags for catch-all or optional catch-all routes.

    Instead, it assumes you might want to decide dynamically — so the automatic discovery is skipped.
*/
