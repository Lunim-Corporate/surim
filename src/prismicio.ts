import * as prismic from "@prismicio/client";
import { enableAutoPreviews } from "@prismicio/next";
import sm from "../slicemachine.config.json";

// Local type fallbacks to avoid CLI/type version mismatches
type ClientConfig = any;
type Route = any;
type LinkResolverFunction = (link: any) => string | null | undefined;

/**
 * Supports direct repository names or full API endpoints. Returns `undefined`
 * if the value does not resemble a valid name.
 */
const parseRepositoryName = (value: string | undefined | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;

  // Handle full Prismic URLs such as https://repo-name.cdn.prismic.io/api/v2
  const endpointMatch = trimmed.match(
    /^https?:\/\/([a-z0-9-]+)(?:\.[^/]+)?\.prismic\.io/i,
  );
  if (endpointMatch) {
    return endpointMatch[1];
  }

  // Accept plain repository names containing only alphanumerics and hyphens.
  if (/^[a-z0-9-]+$/i.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  return undefined;
};

const envRepositoryName =
  parseRepositoryName(process.env.NEXT_PUBLIC_PRISMIC_ENVIRONMENT) ??
  parseRepositoryName(process.env.PRISMIC_REPOSITORY_NAME) ??
  parseRepositoryName(process.env.PRISMIC_ENVIRONMENT) ??
  parseRepositoryName(process.env.PRISMIC_API_ENDPOINT);

/**
 * The project's Prismic repository name.
 */
export const repositoryName = envRepositoryName || sm.repositoryName;

export const linkResolver: LinkResolverFunction = (link) => {
  // Will handle all routes under /digital
  if (link.type === "digital_page") {
    if (link.uid === "ux") return "/ux";
    if (link.uid) return `/digital/${encodeURIComponent(link.uid)}`;
  }
  if (link.type === "case-studies") {
    if (link.uid)
      return `/digital/${encodeURIComponent(link.uid)}/case-studies`;
  }
  if (link.type === "case_study_sm") {
    const full = (link.data as { url_full_path?: string })?.url_full_path;
    // Defensive check for non-empty string
    if (typeof full === "string" && full.trim()) {
      const safe = full
        .split("/")
        .map((s) => encodeURIComponent(s.trim()))
        .filter(Boolean)
        .join("/");
      return `/digital/${safe}`;
    }
  }
  // Handle AI Automation pages
  if (link.type === "ai_automation_page") {
    if (link.uid) return `/ai-automation/${encodeURIComponent(link.uid)}`;
  }
  if (link.type === "ai_automation") {
    return "/ai-automation";
  }
  // TODO: Handle UX pages
  if (link.type === "ux_page") {
    if (link.uid) return `/ux/${encodeURIComponent(link.uid)}`;
  }
  if (link.type === "ux") {
    return "/ux";
  }
  // Handle Video pages
  if (link.type === "video_page") {
    if (link.uid) return `/video/${encodeURIComponent(link.uid)}`;
  }
  if (link.type === "video") {
    return "/video";
  }
  // return undefined to let the client's route resolvers handle the rest
  return undefined;
};

/**
 * A list of Route Resolver objects that define how a document's `url` field is resolved.
 *
 * {@link https://prismic.io/docs/route-resolver#route-resolver}
 */
// TODO: Update the routes array to match your project's route structure.
const routes: Route[] = [
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
  { type: "ai_automation", path: "/ai-automation" },
  { type: "ai_automation_page", path: "/ai-automation/:uid" },
  { type: "video", path: "/video" },
  { type: "video_page", path: "/video/:uid" },
  { type: "ux", path: "/ux" },
  { type: "ux", path: "/ux/:uid" },
];

/**
 * Creates a Prismic client for the project's repository. The client is used to
 * query content from the Prismic API.
 *
 * @param config - Configuration for the Prismic client.
 */
export const createClient = (config: ClientConfig = {}) => {
  const client = (prismic as any).createClient(repositoryName, {
    routes,
    fetchOptions:
      process.env.NODE_ENV === "production"
        ? { next: { tags: ["prismic"] }, cache: "force-cache" }
        : // ? { next: { tags: ["prismic"], revalidate: 60 } }
          { next: { revalidate: 5 } },
    ...config,
  });

  enableAutoPreviews({ client, ...config });

  return client;
};
