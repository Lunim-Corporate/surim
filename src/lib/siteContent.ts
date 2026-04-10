import { cache } from "react";
import type { Content } from "@prismicio/client";
import type { LinkField } from "@prismicio/types";
import { createClient } from "@/prismicio";

export type SiteKey = "main" | "ai" | "ux" | "video";

export type ChildLink = {
  label: string;
  link: LinkField;
};

export type Section = {
  id: string;
  label: string;
  link: LinkField;
  children: ChildLink[];
};

type LayoutContent = {
  navigationMenu: Content.NavigationMenuSlice | null;
  navigationSlices: any[];
  footerSlice: Content.FooterSlice | null;
  footerSlices: any[];
};

export const SITE_CONFIG: Record<
  SiteKey,
  {
    siteName: string;
    title: string;
    description: string;
    baseUrl: string;
    homePath: string;
    domain?: string;
  }
> = {
  main: {
    siteName: "Surim",
    title: "Surim.io",
    description:
      "Surim.io creates seamless digital experiences with cutting-edge technology and design.",
    baseUrl: process.env.NEXT_PUBLIC_WEBSITE_URL || "https://surim.io",
    homePath: "/",
  },
  ai: {
    siteName: "Surim AI Automation",
    title: "Surim AI Automation",
    description:
      "Transform your business with AI automation solutions from Surim.",
    baseUrl: "https://ai.surim.io",
    homePath: "/ai-automation",
    domain: "ai-automation",
  },
  ux: {
    siteName: "Surim UX",
    title: "Surim UX",
    description: "Design better product experiences with Surim UX.",
    baseUrl: "https://ux.surim.io",
    homePath: "/ux",
    domain: "ux",
  },
  video: {
    siteName: "Surim Video Production",
    title: "Surim Video Production",
    description:
      "Create compelling visual stories with professional video production from Surim.",
    baseUrl: "https://video-next.surim.io",
    homePath: "/video",
    domain: "video",
  },
};

export const getSingleDocument = cache(async <T>(type: string) => {
  const client = createClient();
  return (await (client as any).getSingle(type).catch(() => null)) as T | null;
});

function extractLayoutContent(navDoc: any, footerDoc: any): LayoutContent {
  const navigationSlices = navDoc?.data?.slices || [];
  const footerSlices = footerDoc?.data?.slices || [];

  return {
    navigationSlices,
    navigationMenu:
      navigationSlices.find(
        (slice: any) => slice.slice_type === "navigation_menu",
      ) ?? null,
    footerSlices,
    footerSlice:
      footerSlices.find((slice: any) => slice.slice_type === "footer") ?? null,
  };
}

async function getGenericSiteLayoutContent(domainValue: string) {
  const client = createClient();
  const [navDocs, footerDocs] = await Promise.all([
    (client as any).getAllByType("primary_navigation_generic").catch(() => []),
    (client as any).getAllByType("footer_generic").catch(() => []),
  ]);

  const navDoc = navDocs.find((doc: any) => doc.data?.domain === domainValue);
  const footerDoc = footerDocs.find(
    (doc: any) => doc.data?.domain === domainValue,
  );

  return extractLayoutContent(navDoc, footerDoc);
}

export const getMainLayoutContent = cache(async (): Promise<LayoutContent> => {
  const client = createClient();
  const [primaryNav, footer] = await Promise.all([
    (client as any).getSingle("primary_navigation").catch(() => null),
    (client as any).getSingle("footer").catch(() => null),
  ]);

  return extractLayoutContent(primaryNav, footer);
});

export const getAiLayoutContent = cache(async (): Promise<LayoutContent> => {
  return getGenericSiteLayoutContent("ai-automation");
});

export const getUxLayoutContent = cache(async (): Promise<LayoutContent> => {
  return getGenericSiteLayoutContent("ux");
});

export const getVideoLayoutContent = cache(async (): Promise<LayoutContent> => {
  return getGenericSiteLayoutContent("video");
});

function isUsableLink(link: LinkField | null | undefined): link is LinkField {
  return !!link && link.link_type !== "Any";
}

function getNavSectionIds(navDoc: any): string[] {
  const navigationMenu = navDoc?.data?.slices?.find(
    (slice: any) => slice.slice_type === "navigation_menu",
  ) as Content.NavigationMenuSlice | undefined;

  if (!navigationMenu) {
    return [];
  }

  const sectionsGroup = Array.isArray(navigationMenu.primary.sections)
    ? navigationMenu.primary.sections
    : [];

  const ids = sectionsGroup
    .map((row: any) => row.section_ref)
    .map((ref: any) =>
      ref && ref.link_type === "Document" && typeof ref.id === "string"
        ? ref.id
        : null,
    )
    .filter((id: any): id is string => !!id);

  return ids;
}

async function resolveSectionsForNavDoc(navDoc: any): Promise<Section[]> {
  if (!navDoc) return [];

  const ids = getNavSectionIds(navDoc);
  if (!ids.length) return [];

  const client = createClient();

  try {
    const fetched = (await (client as any).getAllByIDs(ids as any)) as any[];
    const byId = new Map(fetched.map((doc: any) => [doc.id, doc]));

    return ids
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((doc: any) => {
        const data = doc.data;
        const children: ChildLink[] = (
          Array.isArray(data.child_links) ? data.child_links : []
        )
          .map((row: any, idx: number) => {
            const label =
              typeof row.child_label === "string" && row.child_label.trim()
                ? row.child_label.trim()
                : `Item ${idx + 1}`;
            const link = isUsableLink(row.child_link) ? row.child_link : null;
            return { label, link: link as LinkField };
          })
          .filter((row: any): row is ChildLink => !!row.link);

        const topLink = isUsableLink(data.section_link)
          ? data.section_link
          : null;
        const resolvedLink: LinkField | undefined = topLink ?? children[0]?.link;

        if (!resolvedLink) return null;

        return {
          id: doc.id,
          label:
            typeof data.section_label === "string" ? data.section_label : "",
          link: resolvedLink,
          children,
        } satisfies Section;
      })
      .filter((section: Section | null): section is Section => !!section);
  } catch {
    return [];
  }
}

type BreadcrumbData = {
  sections: Section[];
  hiddenSegments: string[];
};

async function getBreadcrumbSettings() {
  const client = createClient();
  const breadcrumbSettings = (await (client as any)
    .getSingle("breadcrumb_settings")
    .catch(() => null)) as any;

  return (
    breadcrumbSettings?.data?.hidden_segments
      ?.map((row: any) =>
        typeof row.segment === "string" ? row.segment.trim().toLowerCase() : "",
      )
      .filter((slug: any): slug is string => slug.length > 0) ?? []
  );
}

async function getNavDocForSite(siteKey: SiteKey) {
  const client = createClient();

  if (siteKey === "main") {
    return (client as any).getSingle("primary_navigation").catch(() => null);
  }

  const domainValue = SITE_CONFIG[siteKey].domain;
  const navDocs = await (client as any)
    .getAllByType("primary_navigation_generic")
    .catch(() => []);

  return navDocs.find((doc: any) => doc.data?.domain === domainValue) ?? null;
}

async function getBreadcrumbDataForSite(siteKey: SiteKey): Promise<BreadcrumbData> {
  const [navDoc, hiddenSegments] = await Promise.all([
    getNavDocForSite(siteKey),
    getBreadcrumbSettings(),
  ]);

  const sections = await resolveSectionsForNavDoc(navDoc);
  const finalHiddenSegments = [...hiddenSegments];
  const routingPrefix = SITE_CONFIG[siteKey].domain;

  if (routingPrefix && !finalHiddenSegments.includes(routingPrefix)) {
    finalHiddenSegments.push(routingPrefix);
  }

  return {
    sections,
    hiddenSegments: finalHiddenSegments,
  };
}

export const getAllBreadcrumbData = cache(async () => {
  const [main, ai, ux, video] = await Promise.all([
    getBreadcrumbDataForSite("main"),
    getBreadcrumbDataForSite("ai"),
    getBreadcrumbDataForSite("ux"),
    getBreadcrumbDataForSite("video"),
  ]);

  return { main, ai, ux, video };
});
