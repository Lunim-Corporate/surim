import type { FC } from "react";
import { PrismicNextImage, type PrismicNextImageProps } from "@prismicio/next";
import type { Content } from "@prismicio/client";
import type { ImageField, RichTextField, LinkField, KeyTextField } from "@prismicio/types";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText, PrismicLink } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import AskLunaButton from "../../AskLunaButton";

const HERO_IMGIX_PARAMS: PrismicNextImageProps["imgixParams"] = {
  auto: ["format", "compress"],
  fit: "crop",
  q: 60,
  sat: -5,
};

/**
 * Props for `CompactHero`.
 */
export type CompactHeroProps = SliceComponentProps<Content.CompactHeroSlice>;

type LegacyHomepageHeroFields = Partial<{
  background_image: ImageField;
  hero_title_part1: RichTextField;
  hero_title_part2: RichTextField;
  hero_description: RichTextField;
  button_1_link: LinkField;
  button_1_label: KeyTextField;
}>;

type CompactHeroPrimary = Content.CompactHeroSlice["primary"] & LegacyHomepageHeroFields;

/**
 * Helper to extract metadata (OG image & title) from this slice.
 */
export const pickMetaFromCompactHero = (slice: Content.CompactHeroSlice) => {
  const primary: CompactHeroPrimary = slice.primary;
  const heroTitleText = (asText(primary.hero_title || []) || "").trim();
  const splitTitleText = [
    asText(primary.hero_title_part1 || []) || "",
    asText(primary.hero_title_part2 || []) || "",
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const ogImage =
    primary.hero_image?.url || primary.background_image?.url || "";

  const titleFromHero =
    heroTitleText ||
    splitTitleText ||
    "";

  return { ogImage, titleFromHero };
};

/**
 * Component for "CompactHero" Slice.
 * Works with the current model.json:
 *  - hero_image (Image)
 *  - hero_title (StructuredText)
 * And also accepts older fields:
 *  - background_image, hero_title_part1, hero_title_part2, hero_description, button_1_link, button_1_label
 */
const CompactHero: FC<CompactHeroProps> = ({ slice }) => {
  const primary: CompactHeroPrimary = slice.primary;

  // Prefer new schema fields
  const bg = primary.hero_image?.url || primary.background_image?.url;
  const titleNew = primary.hero_title; // StructuredText
  const title1Old = primary.hero_title_part1;
  const title2Old = primary.hero_title_part2;
  const description = primary.hero_description;
  const legacyCtaLink = primary.button_1_link;
  const legacyCtaLabel = primary.button_1_label;
  const primaryCtaLink = primary.button_link;
  const showMainCta = primary.show_main_cta ?? true;
  const showAskLuna = primary.show_ask_luna ?? true;
  const resolvedCtaLink = (primaryCtaLink as any)?.url ? primaryCtaLink : legacyCtaLink;
  const resolvedCtaLabel = (primaryCtaLink as any)?.text || legacyCtaLabel || "Learn more";
  const canShowMainCta = showMainCta && Boolean((resolvedCtaLink as any)?.url);
  const shouldShowCtaRow = canShowMainCta || showAskLuna;

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative min-h-[56vh] flex items-center overflow-hidden bg-black"
    >
      {bg ? (
        <PrismicNextImage
          field={primary.hero_image?.url ? primary.hero_image : primary.background_image}
          fill
          priority
          sizes="100vw"
          imgixParams={HERO_IMGIX_PARAMS}
          className="object-cover object-center"
          alt=""
        />
      ) : null}
      {/* dark overlay to ensure text contrast */}
      <div className="absolute inset-0 bg-black/60" />

      <div className="relative z-10 max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto py-16">
        <div className="text-center">
          <div role="heading" aria-level={1} className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {/* New single-title field (may already render an <h1>) */}
            {titleNew ? <PrismicRichText field={titleNew} /> : null}

            {/* Old split title fields (kept for backward-compat) */}
            {!titleNew && title1Old ? <PrismicRichText field={title1Old} /> : null}
            {!titleNew && title2Old ? (
              <span className="block bg-gradient-to-r from-[#BBFEFF] to-cyan-500 bg-clip-text text-transparent">
                <PrismicRichText field={title2Old} />
              </span>
            ) : null}
          </div>

          {/* Optional description (legacy) */}
          {description ? (
            <div className="text-lg md:text-xl text-gray-200/90 mb-8 max-w-3xl mx-auto leading-relaxed">
              <PrismicRichText field={description} />
            </div>
          ) : null}

          {/* CTA row */}
          {shouldShowCtaRow ? (
            <div className="flex flex-col gap-4 items-center justify-center sm:flex-row">
              {canShowMainCta && resolvedCtaLink ? (
                <PrismicLink
                  field={resolvedCtaLink as any}
                  className="max-w-xs bg-[#BBFEFF] text-black px-8 py-4 rounded-[0.3rem] font-semibold hover:from-[#a0f5f7] hover:to-cyan-400 transition-colors duration-300 shadow-lg items-center justify-center space-x-2 no-underline"
                >
                  {resolvedCtaLabel}
                </PrismicLink>
              ) : null}
              {showAskLuna ? (
                <AskLunaButton
                  className="inline-flex items-center justify-center px-8 py-4 rounded-md border border-white/20 text-white font-semibold bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-lg backdrop-blur-sm cursor-pointer no-underline"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {/* subtle decorative glows */}
      <div className="pointer-events-none absolute -top-10 -left-10 w-40 h-40 rounded-full bg-cyan-400/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl" />
    </section>
  );
};

export default CompactHero;
