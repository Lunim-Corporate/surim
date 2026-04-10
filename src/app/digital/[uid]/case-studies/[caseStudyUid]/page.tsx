// app/digital/[uid]/case-studies/[caseStudyUid]/page.tsx
import { notFound, redirect } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
import { SliceZone } from "@prismicio/react";
import { createClient } from "@/prismicio";
import { components } from "@/slices";
import type { CaseStudySmDocumentWithLegacy } from "@/app/digital/case-studies/types";
import { pickBaseMetadata } from "@/utils/metadata";
import { digitalCategoryToSlug } from "@/app/digital/case-studies/utils";

type Params = { uid: string; caseStudyUid: string };

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid, caseStudyUid } = await params;

  const client = createClient();
  const doc = await client
    .getByUID<CaseStudySmDocumentWithLegacy>("case_study_sm", caseStudyUid)
    .catch(() => null);
  if (!doc) notFound();

  const docCategorySlug = digitalCategoryToSlug(doc.data.digital_category);
  const paramCategorySlug = digitalCategoryToSlug(uid);
  if (!docCategorySlug || !paramCategorySlug || docCategorySlug !== paramCategorySlug) {
    notFound();
  }

  if (uid !== docCategorySlug) {
    redirect(`/digital/${docCategorySlug}/case-studies/${caseStudyUid}`);
  }

  const slices = doc.data.slices;

  return (
    <main className="bg-black text-white min-h-screen">
      <SliceZone slices={slices} components={components} />
    </main>
  );
}

export async function generateStaticParams() {
  const client = createClient();
  const docs = await client.getAllByType<CaseStudySmDocumentWithLegacy>("case_study_sm");

  return docs
    .map((doc) => {
      const categorySlug = digitalCategoryToSlug(doc.data.digital_category);
      const caseStudyUid = doc.uid ?? undefined;
      if (!categorySlug || !caseStudyUid) return null;
      return { uid: categorySlug, caseStudyUid };
    })
    .filter((value): value is { uid: string; caseStudyUid: string } => Boolean(value));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { uid, caseStudyUid } = await params;
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = await client
    .getByUID<CaseStudySmDocumentWithLegacy>("case_study_sm", caseStudyUid)
    .catch(() => null);

  const docCategorySlug = digitalCategoryToSlug(doc?.data.digital_category);
  const paramCategorySlug = digitalCategoryToSlug(uid);
  if (!doc || !docCategorySlug || !paramCategorySlug || docCategorySlug !== paramCategorySlug) {
    return {
      title: "Surim Case Study | Surim",
      description: "Welcome to Surim's official case study page.",
    };
  }

  const parentKeywords = parentMetaData.keywords || "";
  const keywords =
    doc.data?.meta_keywords.filter((val) => Boolean(val.meta_keywords_text)).length >= 1
      ? `${doc.data.meta_keywords.map((k) => k.meta_keywords_text?.toLowerCase()).join(", ")}, ${parentKeywords}`
      : parentKeywords;
  const title = doc.data?.meta_title || parentMetaData.title;
  const description = doc.data?.meta_description || parentMetaData.description;

  return {
    ...parentMetaData,
    title: title,
    description: description,
    keywords: keywords,
    openGraph: {
      ...parentMetaData.openGraph,
      title: typeof title === "string" ? `${title}` : doc.uid,
      description: `${description}`,
    },
  };
}

