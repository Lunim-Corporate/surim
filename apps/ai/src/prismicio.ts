import {
  repositoryName,
  aiRoutes,
  createPrismicClientFactory,
} from "@surim/prismic/client";

export { repositoryName };

/**
 * Prismic client for apps/ai (ai.surim.io).
 * Routes: ai_automation → /, ai_automation_page → /:uid
 */
export const createClient = createPrismicClientFactory(aiRoutes);
