import {
  repositoryName,
  uxRoutes,
  createPrismicClientFactory,
} from "@surim/prismic/client";

export { repositoryName };

/**
 * Prismic client for apps/ux (ux.surim.io).
 * Routes: ux → /, ux_page → /:uid
 */
export const createClient = createPrismicClientFactory(uxRoutes);
