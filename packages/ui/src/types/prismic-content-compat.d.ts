// Compatibility shims for legacy slice component typings using Content namespace.
// These provide loose types so production builds succeed even if prismic-ts-codegen
// does not augment the Content namespace.

declare module "@prismicio/client" {
  export namespace Content {
    // Core site slices
    type AuthorInfoSlice = any;
    type BlogArticleCardSlice = any;
    type BlogListSlice = any;
    type CaseStudyTextPanelSlice = any;
    type CompactHeroSlice = any;
    type ContactSlice = any;
    type ExpertiseareasSlice = any;
    type FaqSlice = any;
    type FooterSlice = any;
    type HeroSlice = any;
    type ImageandtextSlice = any;
    type NavigationMenuSlice = any;
    type OurTeamSlice = any;
    type PrivacyTextBoxSlice = any;
    type ProcessSlice = any;
    type ProjectShowcaseSlice = any;
    type ServiceGridSlice = any;

    // Media homepage custom slices
    type TransmediaHeroSlice = any;
    type GlobalCommunitySlice = any;
    type VirtualTeamCircleSlice = any;
    type TheShootSlice = any;
    type VirtualProductionSlice = any;
    type AlternateRealitySlice = any;
    type EducationWorldSlice = any;
    type GamingAssetsSlice = any;
    type CollectiblesSlice = any;
    type ParallaxLineSlice = any;
    type MediaFinaleSlice = any;
  }
}
