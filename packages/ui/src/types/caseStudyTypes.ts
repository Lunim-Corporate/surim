import type { Content } from "@prismicio/client";

type LegacyHeroFields = Partial<Pick<Content.CaseStudyDocumentData, "hero_image" | "hero_title">>;

export type CaseStudySmDocumentWithLegacy = Content.CaseStudySmDocument & {
  data: Content.CaseStudySmDocument["data"] & LegacyHeroFields;
};

export type HeroPrimaryFields =
  LegacyHeroFields &
  Record<string, unknown>;

export type HeroLikeSlice = {
  slice_type?: string | null;
  primary?: HeroPrimaryFields | null;
};