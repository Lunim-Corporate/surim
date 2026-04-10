export { formatDate } from "./formatDate";
export { calculateReadingTime } from "./calcReadingTime";
export { createID } from "./createId";
export { UID_REGEX, isValidUidServer, isValidUidClient } from "./validators";
export { generateMetaDataInfo } from "./generateMetaDataInfo";
export { pickBaseMetadata, metaDataInfoArr, getMetaDataInfo } from "./metadata";
export { navigationCardsData } from "./navigationCardsData";
export type { NavigationCard } from "./navigationCardsData";

// Hardcoded site data (main site only — re-exported from packages/utils for convenience)
export {
  heroContent,
  sprintPackages,
  expertiseAreas,
  expertiseSection,
  devProcess,
  ourServices,
  faqData,
  imageTextContent,
  processSectionTitle,
} from "./homeData";
export type {
  HeroContent,
  ServiceItem,
  ProjectItem,
  FAQItem,
  ProcessItem,
} from "./homeData";

export { team } from "./teamData";
export type { TeamMember, SocialLink } from "./teamData";

export * from "./aboutData";
export * from "./analytics";

// Hooks
export { useContactForm } from "./hooks/useContactForm";
export type { ContactVariant } from "./hooks/useContactForm";
export {
  useMediaQuery,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
} from "./hooks/useMediaQuery";
