import { Client } from "@prismicio/client";
import type { ClientConfig } from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";

// ─── Types ────────────────────────────────────────────────────────────────────

type Route = { type: string; path: string; resolvers?: Record<string, string> };
type LinkResolverFunction = (link: any) => string | null | undefined;

export type AppKey = "main" | "ai" | "ux" | "video";

// ─── Repository name resolution ───────────────────────────────────────────────

function parseRepositoryName(value: string | undefined | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  const endpointMatch = trimmed.match(
    /^https?:\/\/([a-z0-9-]+)(?:\.[^/]+)?\.prismic\.io/i,
  );
  if (endpointMatch) return endpointMatch[1];

  if (/^[a-z0-9-]+$/i.test(trimmed)) return trimmed.toLowerCase();

  return undefined;
}

export const repositoryName: string =
  parseRepositoryName(process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT) ??
  parseRepositoryName(process.env.PRISMIC_REPOSITORY_NAME) ??
  parseRepositoryName(process.env.PRISMIC_ENVIRONMENT) ??
  parseRepositoryName(process.env.PRISMIC_API_ENDPOINT) ??
  "surim";

// ─── Route definitions per app ────────────────────────────────────────────────

/**
 * Full route map for apps/main (surim.io).
 * Includes all document types across the entire Prismic repo.
 */
export const mainRoutes: Route[] = [
  { type: "homepage", path: "/" },
  { type: "our_team_page", path: "/our-team" },
  { type: "tech", path: "/digital" },
  { type: "academy", path: "/academy" },
  { type: "academy_course", path: "/academy/:uid" },
  { type: "film", path: "/media" },
  { type: "media_temp", path: "/media-temp" },
  { type: "tabb", path: "/tabb" },
  { type: "privacy_policy_sm", path: "/privacy-policy" },
  { type: "blog_home_page", path: "/blog" },
  { type: "blog_post", path: "/blog/:uid" },
  { type: "author", path: "/blog/authors/:uid" },
  // Subdomain content — resolved to absolute URLs by the link resolver
  { type: "ai_automation", path: "/ai-automation" },
  { type: "ai_automation_page", path: "/ai-automation/:uid" },
  { type: "video", path: "/video" },
  { type: "video_page", path: "/video/:uid" },
  { type: "ux", path: "/ux" },
  { type: "ux_page", path: "/ux/:uid" },
];

/**
 * Route map for apps/ai (ai.surim.io).
 * All AI document types resolve to root-relative paths.
 */
export const aiRoutes: Route[] = [
  { type: "ai_automation", path: "/" },
  { type: "ai_automation_page", path: "/:uid" },
  { type: "our_team_page", path: "/our-team" },
];

/**
 * Route map for apps/ux (ux.surim.io).
 */
export const uxRoutes: Route[] = [
  { type: "ux", path: "/" },
  { type: "ux_page", path: "/:uid" },
  { type: "our_team_page", path: "/our-team" },
];

/**
 * Route map for apps/video (video-next.surim.io).
 */
export const videoRoutes: Route[] = [
  { type: "video", path: "/" },
  { type: "video_page", path: "/:uid" },
];

export const routesByApp: Record<AppKey, Route[]> = {
  main: mainRoutes,
  ai: aiRoutes,
  ux: uxRoutes,
  video: videoRoutes,
};

// ─── Link resolvers ───────────────────────────────────────────────────────────

/**
 * Link resolver for apps/main.
 * Handles special document types that need custom URL construction.
 */
export const mainLinkResolver: LinkResolverFunction = (link) => {
  if (link.type === "digital_page") {
    if (link.uid) return `/digital/${encodeURIComponent(link.uid)}`;
  }
  if (link.type === "case-studies") {
    if (link.uid) return `/digital/${encodeURIComponent(link.uid)}/case-studies`;
  }
  if (link.type === "case_study_sm") {
    const full = (link.data as { url_full_path?: string })?.url_full_path;
    if (typeof full === "string" && full.trim()) {
      const safe = full
        .split("/")
        .map((s) => encodeURIComponent(s.trim()))
        .filter(Boolean)
        .join("/");
      return `/digital/${safe}`;
    }
  }
  return undefined;
};

// ─── Client factory ───────────────────────────────────────────────────────────

/**
 * Creates a Prismic client factory pre-configured with the given route array.
 * Call this once per app to produce that app's `createClient` function.
 *
 * @example
 * // apps/main/src/prismicio.ts
 * import { createPrismicClientFactory, mainRoutes } from "@surim/prismic/client";
 * export const createClient = createPrismicClientFactory(mainRoutes);
 */
export function createPrismicClientFactory(routes: Route[]) {
  return function createClient(config: ClientConfig = {}) {
    const client = new Client(repositoryName, {
      routes,
      fetchOptions:
        process.env.NODE_ENV === "production"
          ? { next: { tags: ["prismic"] }, cache: "force-cache" }
          : { next: { revalidate: 5 } },
      ...config,
    });

    enableAutoPreviews({ client });

    return client;
  };
}

/**
 * Internal base client used by packages/prismic itself (e.g. siteContent.ts).
 * Uses a minimal route config sufficient for document fetching — not for URL resolution.
 */
export function createBaseClient(config: ClientConfig = {}) {
  return createPrismicClientFactory(mainRoutes)(config);
}
