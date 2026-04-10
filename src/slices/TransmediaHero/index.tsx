"use client";

import { useRef, useEffect } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { withImageAlt } from "@/lib/prismicImage";
import { useIsMobile } from "@/hooks/useMediaQuery";

/**
 * Props for `TransmediaHero`.
 */
export type TransmediaHeroProps = SliceComponentProps<any>;

/**
 * Component for "TransmediaHero" Slices.
 */
const TransmediaHero = ({ slice }: TransmediaHeroProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const backgroundImage = withImageAlt(slice.primary.background_image, "");
  const showDownScroll = slice.primary.show_down_scroll ?? true;
  const logoImage = withImageAlt(
    slice.primary.logo,
    slice.primary.subtitle || "Transmedia hero logo"
  );

  useEffect(() => {
    let ctx: any;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          if (sectionRef.current) {
            gsap.from(sectionRef.current, { autoAlpha: 0, y: 30, duration: 0.9, ease: "power2.out" });
          }

          const heroTl = gsap.timeline({
            scrollTrigger: { trigger: sectionRef.current, start: "top 85%", end: "top 25%", scrub: 0.5 },
          });

          if (bgRef.current) {
            heroTl.fromTo(bgRef.current, { scale: 1.04, yPercent: -6 }, { scale: 1, yPercent: 0, ease: "none" }, 0);
          }
          heroTl.fromTo(logoRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out" }, 0.05);
          heroTl.fromTo(titleRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "power2.out" }, 0.12);
          heroTl.fromTo(subtitleRef.current, { opacity: 0, y: 26 }, { opacity: 1, y: 0, ease: "power2.out" }, 0.18);
          heroTl.fromTo(taglineRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, ease: "power2.out" }, 0.24);

          if (slice.primary.enable_parallax && bgRef.current) {
            gsap.to(bgRef.current, {
              yPercent: 18,
              ease: "none",
              scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 0.8 },
            });
          }
        }, sectionRef);
      }
    );

    return () => ctx?.revert();
  }, [slice.primary.enable_parallax]);

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      data-device={isMobile ? "mobile" : "desktop"}
      className="relative max-h-[844px] sm:max-h-[1024px] md:max-h-[1125px] h-screen flex pt-55 sm:pt-62 md:pt-76 lg:pt-78 xl:pt-93 justify-center overflow-hidden bg-[#040a18] isolate"
      style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)' }}
    >
      {/* Background Image with Parallax */}
      {backgroundImage && (
        <div
          ref={bgRef}
          className="absolute flex items-top justify-center top-[0px] right-[67px] sm:top-[0px] sm:right-[66px] md:top-[0px] md:right-[62px] lg:top-[-24px] lg:right-[52px] xl:top-[4px] xl:right-[52px] -ml-[80px] -mr-[80px] inset-0 z-0 will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          <PrismicNextImage
            field={backgroundImage}
            className="w-[1500px] h-[844px] sm:w-[1820px] sm:h-[1024px] md:w-[2000px] md:h-[1125px] max-w-none"
            priority
            quality={90}
            alt=""
          />
        </div>
      )}

      {/* Content - Hidden initially, revealed by GSAP */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Logo  */}
        {logoImage && (
          <div
            ref={logoRef}
            className="mb-6 md:mb-8 flex justify-center w-full opacity-0 -mt-14 md:-mt-24 lg:-mt-32 xl:-mt-40"
          >
            <div className="relative z-30 w-[240px] sm:w-[360px] md:w-[440px] lg:w-[480px] mx-auto px-2 sm:px-4">
              <PrismicNextImage
                field={logoImage}
                sizes="(min-width: 1280px) 520px, (min-width: 1024px) 460px, (min-width: 768px) 380px, 80vw"
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        )}

        {/* Main Title */}
        {slice.primary.main_title && (
          <div
            ref={titleRef}
            className="mb-6 md:mb-8 w-full opacity-0 px-2"
          >
            <PrismicRichText
              field={slice.primary.main_title}
              components={{
                heading1: ({ children }) => (
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#FFFBD0] tracking-wider uppercase break-normal whitespace-normal lg:whitespace-nowrap">
                    {children}
                  </h1>
                ),
              }}
            />
          </div>
        )}

        {/* Subtitle */}
        {slice.primary.subtitle && (
          <p
            ref={subtitleRef}
            className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-white/90 mb-4 md:mb-6 max-w-4xl mx-auto font-light opacity-0 px-2"
          >
            {slice.primary.subtitle}
          </p>
        )}

        {/* Tagline */}
        {slice.primary.tagline && (
          <p
            ref={taglineRef}
            className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-[#8df6ff] font-medium tracking-wide opacity-0 px-2"
          >
            {slice.primary.tagline}
          </p>
        )}
      </div>

      {/* Scroll-down chevron (match primary Hero styling/behavior) */}
      {showDownScroll ? (
        <button
          onClick={() => {
            const current = sectionRef.current;
            if (!current) return;
            const next = current.nextElementSibling as HTMLElement | null;
            if (next) {
              next.scrollIntoView({ behavior: "smooth", block: "start" });
              return;
            }
            window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
          }}
          aria-label="Scroll down"
          className="cursor-pointer absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-full p-3 text-cyan-400 hover:text-cyan-300 ring-1 ring-white/15 bg-black/30 backdrop-blur-md shadow-lg animate-bounce"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-7 h-7"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      ) : null}
    </section>
  );
};

export default TransmediaHero;
