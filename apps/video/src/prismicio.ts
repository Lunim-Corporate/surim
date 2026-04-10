import {
  repositoryName,
  videoRoutes,
  createPrismicClientFactory,
} from "@surim/prismic/client";

export { repositoryName };

/**
 * Prismic client for apps/video (video-next.surim.io).
 * Routes: video → /, video_page → /:uid
 */
export const createClient = createPrismicClientFactory(videoRoutes);
