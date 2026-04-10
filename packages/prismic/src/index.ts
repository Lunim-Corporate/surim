export {
  repositoryName,
  mainRoutes,
  aiRoutes,
  uxRoutes,
  videoRoutes,
  routesByApp,
  mainLinkResolver,
  createPrismicClientFactory,
  createBaseClient,
  // Alias so shared components/slices can import createClient from @surim/prismic
  createBaseClient as createClient,
} from "./client";
export type { AppKey } from "./client";

export {
  SITE_CONFIG,
  getSingleDocument,
  getMainLayoutContent,
  getAiLayoutContent,
  getUxLayoutContent,
  getVideoLayoutContent,
  getAllBreadcrumbData,
} from "./siteContent";
export type { SiteKey, Section, ChildLink } from "./siteContent";

export { withImageAlt } from "./prismicImage";
