import type { FC } from "react";
import { Content } from "@prismicio/client";
import { PrismicLink } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import { asText } from "@prismicio/helpers";
import { PrismicNextImage, type PrismicNextImageProps } from "@prismicio/next";
import AskLunaButton from "../../AskLunaButton";
import ScrollDownButton from "../../ScrollDownButton";

const HERO_IMGIX_PARAMS: PrismicNextImageProps["imgixParams"] = {
  auto: ["format", "compress"],
  fit: "crop",
  q: 60,
  sat: -5,
};

/**
 * Props for `Hero`.
 */
export type HeroProps = SliceComponentProps<Content.HeroSlice>;

/**
 * Component for "Hero" Slices.
 */
const Hero: FC<HeroProps> = ({ slice }) => {
  const showAskLuna = slice.primary.show_ask_luna ?? true;
  const showMainCta = slice.primary.show_main_cta ?? true;
  const hasMainCta = showMainCta && Boolean((slice.primary.button_link as any)?.url);
  const shouldRenderCtas = hasMainCta || showAskLuna;
  const primaryCtaText = (slice.primary.button_link as any)?.text || "Learn more"
  const showDownScroll = slice.primary.show_down_scroll ?? true;

  return (
    <section
      className="min-h-screen flex items-center relative overflow-hidden bg-black"
      id="mainpage"
    >
      <PrismicNextImage
        field={slice.primary.background_image}
        fill
        priority
        sizes="100vw"
        imgixParams={HERO_IMGIX_PARAMS}
        className="object-cover object-center"
        alt=""
      />
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {asText(slice.primary.hero_main_heading)}
            <span
              className="block bg-gradient-to-r from-[#BBFEFF] to-cyan-500 bg-clip-text text-transparent px-4"
              style={{ lineHeight: 1.2 }}
            >
              {asText(slice.primary.hero_secondary_heading)}
            </span>
          </h1>

          <div className="text-xl text-white mb-8 max-w-3xl mx-auto leading-relaxed">
            {slice.primary.hero_description}
          </div>

          {shouldRenderCtas ? (
            <div className="flex flex-col gap-4 items-center justify-center mb-16 sm:flex-row">
              {hasMainCta ? (
                <PrismicLink
                  field={slice.primary.button_link as any}
                  className="max-w-xs bg-[#BBFEFF] text-black px-8 py-4 rounded-[0.3rem] font-semibold hover:from-[#a0f5f7] hover:to-cyan-400 transition-colors duration-300 shadow-lg items-center justify-center space-x-2 no-underline"
                >
                  {primaryCtaText}
                </PrismicLink>
              ) : null}
              {showAskLuna ? (
                <AskLunaButton
                  className="max-w-xs px-8 py-4 rounded-[0.3rem] border border-white/20 text-white font-semibold bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-lg backdrop-blur-sm cursor-pointer no-underline"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {/* Scroll-down chevron (absolute, bottom-centered) */}
      {showDownScroll ? (
        <ScrollDownButton
          className="cursor-pointer absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-full p-3 text-cyan-400 hover:text-cyan-300 ring-1 ring-white/15 bg-black/30 backdrop-blur-md shadow-lg animate-bounce"
        />
      ) : null}
    </section>
  );
};

export default Hero;
