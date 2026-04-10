import {
  repositoryName,
  mainRoutes,
  mainLinkResolver,
  createPrismicClientFactory,
} from "@surim/prismic/client";

export { repositoryName };
export { mainLinkResolver as linkResolver };

/**
 * Prismic client for apps/main (surim.io).
 * Uses the full route map covering all document types.
 */
export const createClient = createPrismicClientFactory(mainRoutes);
