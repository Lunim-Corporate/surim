import type { MetadataRoute } from "next";

import { createClient } from "@/prismicio";

export const revalidate = 3600;

type PrismicDocWithDates = {
  last_publication_date?: string | null;
  first_publication_date?: string | null;
  uid?: string | null;
};

type CaseStudyDoc = PrismicDocWithDates & {
  data?: { digital_category?: string | null } | null;
};

type ChangeFrequency = MetadataRoute.Sitemap[number]["changeFrequency"];

const DEFAULT_HOST = "https://surim.io";

const SITE_URL = getBaseUrl();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const client = createClient();

  const [
    homepage,
    blogHome,
    academy,
    ourTeam,
    media,
    mediaTemp,
    digitalRoot,
    privacyPolicy,
    tabbPage,
    authorsLanding,
    caseStudiesPage,
  ] = await Promise.all([
    safeGetSingle<PrismicDocWithDates>(client, "homepage"),
    safeGetSingle<PrismicDocWithDates>(client, "blog_home_page"),
    safeGetSingle<PrismicDocWithDates>(client, "academy"),
    safeGetSingle<PrismicDocWithDates>(client, "our_team_page"),
    safeGetSingle<PrismicDocWithDates>(client, "film"),
    safeGetSingle<PrismicDocWithDates>(client, "media_temp"),
    safeGetSingle<PrismicDocWithDates>(client, "tech"),
    safeGetSingle<PrismicDocWithDates>(client, "privacy_policy_sm"),
    safeGetSingle<PrismicDocWithDates>(client, "tabb"),
    safeGetSingle<PrismicDocWithDates>(client, "authors"),
    safeGetSingle<PrismicDocWithDates>(client, "case_studies"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    buildEntry("/", homepage, "weekly"),
    buildEntry("/blog", blogHome, "daily"),
    buildEntry("/blog/authors", authorsLanding, "weekly"),
    buildEntry("/academy", academy, "weekly"),
    buildEntry("/our-team", ourTeam, "monthly"),
    buildEntry("/media", media, "weekly"),
    mediaTemp ? buildEntry("/media-temp", mediaTemp, "weekly") : null,
    buildEntry("/digital", digitalRoot, "weekly"),
    buildEntry("/privacy-policy", privacyPolicy, "yearly"),
    buildEntry("/tabb", tabbPage, "weekly"),
  ].filter(Boolean) as MetadataRoute.Sitemap;

  const [blogPosts, authors, academyCourses, digitalPages, caseStudies] =
    await Promise.all([
      safeGetAll<PrismicDocWithDates>(client, "blog_post"),
      safeGetAll<PrismicDocWithDates>(client, "author"),
      safeGetAll<PrismicDocWithDates>(client, "academy_course"),
      safeGetAll<PrismicDocWithDates>(client, "digital_page"),
      safeGetAll<CaseStudyDoc>(client, "case_study_sm"),
    ]);

  const blogEntries = blogPosts
    .map((doc) => {
      const slug = getUid(doc);
      if (!slug) return null;
      return buildEntry(`/blog/${slug}`, doc, "weekly");
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const authorEntries = authors
    .map((doc) => {
      const slug = getUid(doc);
      if (!slug) return null;
      return buildEntry(`/blog/authors/${slug}`, doc, "weekly");
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const academyEntries = academyCourses
    .map((doc) => {
      const slug = getUid(doc);
      if (!slug) return null;
      return buildEntry(`/academy/${slug}`, doc, "weekly");
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const digitalPageEntries = digitalPages
    .map((doc) => {
      const slug = getUid(doc);
      if (!slug) return null;
      return buildEntry(`/digital/${slug}`, doc, "weekly");
    })
    .filter(Boolean) as MetadataRoute.Sitemap;

  const digitalCategories = new Set<string>(
    digitalPages
      .map((doc) => getUid(doc))
      .filter((slug): slug is string => Boolean(slug))
  );

  const caseStudyCategoryEntries: MetadataRoute.Sitemap = [];
  const caseStudyEntries: MetadataRoute.Sitemap = [];

  const seenCategory = new Set<string>();

  for (const doc of caseStudies) {
    const slug = getUid(doc);
    const category = getCategorySlug(doc);
    if (category && !seenCategory.has(category)) {
      seenCategory.add(category);
      caseStudyCategoryEntries.push(
        buildEntry(`/digital/${category}/case-studies`, caseStudiesPage, "weekly")
      );
    }
    if (!slug || !category) continue;
    caseStudyEntries.push(
      buildEntry(
        `/digital/${category}/case-studies/${slug}`,
        doc,
        "weekly"
      )
    );
  }

  for (const slug of digitalCategories) {
    if (seenCategory.has(slug)) continue;
    seenCategory.add(slug);
    caseStudyCategoryEntries.push(
      buildEntry(`/digital/${slug}/case-studies`, caseStudiesPage, "weekly")
    );
  }

  return [
    ...staticEntries,
    ...blogEntries,
    ...authorEntries,
    ...academyEntries,
    ...digitalPageEntries,
    ...caseStudyCategoryEntries,
    ...caseStudyEntries,
  ];
}

function buildEntry(
  path: string,
  doc?: PrismicDocWithDates | null,
  changeFrequency?: ChangeFrequency
): MetadataRoute.Sitemap[number] {
  const entry: MetadataRoute.Sitemap[number] = {
    url: createAbsoluteUrl(path),
  };
  const lastModified = getLastModified(doc);
  if (lastModified) entry.lastModified = lastModified;
  if (changeFrequency) entry.changeFrequency = changeFrequency;
  return entry;
}

function getBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_WEBSITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    DEFAULT_HOST;
  const url =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  return url.replace(/\/+$/, "") || DEFAULT_HOST;
}

function createAbsoluteUrl(path: string) {
  const normalized =
    !path || path === "/"
      ? "/"
      : `/${path.replace(/^\/+/, "").replace(/\/+$/, "")}`;
  if (normalized === "/") return SITE_URL;
  return `${SITE_URL}${normalized}`;
}

function getLastModified(doc?: PrismicDocWithDates | null) {
  const raw = doc?.last_publication_date || doc?.first_publication_date;
  if (!raw) return undefined;
  const value = new Date(raw);
  return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
}

function getUid(doc: PrismicDocWithDates) {
  if (!doc || typeof doc.uid !== "string") return null;
  const trimmed = doc.uid.trim();
  return trimmed ? encodeURIComponent(trimmed) : null;
}

function getCategorySlug(doc: {
  data?: { digital_category?: string | null } | null;
}) {
  const category =
    typeof doc?.data?.digital_category === "string"
      ? doc.data.digital_category.trim()
      : "";
  return category ? encodeURIComponent(category) : null;
}

async function safeGetSingle<T extends PrismicDocWithDates = PrismicDocWithDates>(
  client: ReturnType<typeof createClient>,
  type: string
): Promise<T | null> {
  try {
    return (await (client as any).getSingle(type)) as T;
  } catch {
    return null;
  }
}

async function safeGetAll<T extends PrismicDocWithDates = PrismicDocWithDates>(
  client: ReturnType<typeof createClient>,
  type: string
): Promise<T[]> {
  try {
    return (await (client as any).getAllByType(type)) as T[];
  } catch {
    return [];
  }
}
