"use client";

import { useEffect, useRef } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { withImageAlt } from "@/lib/prismicImage";
import { useIsMobile } from "@/hooks/useMediaQuery";

export type ParallaxTextImageProps = SliceComponentProps<any>;

const hasRT = (field: any): boolean => {
  if (!field) return false;
  if (Array.isArray(field)) return field.length > 0;
  if (typeof field === "string") return field.trim().length > 0;
  return !!field;
};

export default function ParallaxTextImage({ slice }: ParallaxTextImageProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const bgParallaxRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    const preset = (slice.primary.animation_preset as string) || "fade-up";
    let ctx: any;

    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          if (bgRef.current) {
            const enableParallax = slice.primary.enable_parallax !== false;
            const enableZoom = slice.primary.enable_zoom_effect !== false;

            if (enableParallax || enableZoom) {
              gsap.fromTo(
                bgRef.current,
                { scale: enableZoom ? 1.02 : 1 },
                {
                  scale: enableZoom ? 1.06 : 1,
                  ease: "none",
                  scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top bottom",
                    end: "center center",
                    scrub: 0.9,
                  },
                }
              );

              if (enableParallax && bgParallaxRef.current) {
                const getParallaxRange = () => (window.innerWidth < 640 ? 10 : 20);
                gsap.fromTo(
                  bgParallaxRef.current,
                  { yPercent: () => -getParallaxRange() },
                  {
                    yPercent: () => getParallaxRange(),
                    ease: "none",
                    force3D: true,
                    scrollTrigger: {
                      trigger: sectionRef.current,
                      start: "top bottom",
                      end: "bottom top",
                      scrub: true,
                      invalidateOnRefresh: true,
                    },
                  }
                );
              }
            }
          }

          const textEls = sectionRef.current?.querySelectorAll("[data-pt-text]");
          if (textEls?.length && preset !== "none") {
            const isStrong = preset === "stagger-strong";
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: sectionRef.current!,
                start: isMobile ? "top bottom" : "top 90%",
                end: isMobile ? "top center" : "center center",
                scrub: isMobile ? 0.45 : 0.6,
              },
            });
            if (preset === "slide-left") {
              tl.from(textEls, { opacity: 0, x: -40, filter: "blur(6px)", stagger: isStrong ? 0.2 : 0.12, ease: "none" });
            } else {
              tl.from(textEls, { opacity: 0, y: 48, filter: "blur(6px)", stagger: isStrong ? 0.2 : 0.12, ease: "none" });
            }
          }

          if (gridRef.current && preset !== "none") {
            const cards = gridRef.current.querySelectorAll("[data-pt-card]");
            if (cards.length) {
              gsap.timeline({
                scrollTrigger: { trigger: gridRef.current, start: "top 95%", end: "center center", scrub: 0.5 },
              }).from(cards, {
                opacity: 0,
                y: preset === "slide-left" ? 0 : 30,
                x: preset === "slide-left" ? -30 : 0,
                rotate: 0.001,
                filter: "blur(4px)",
                stagger: preset === "stagger-strong" ? 0.14 : 0.1,
                ease: "none",
              });
            }
          }
        }, sectionRef);
      }
    );

    return () => ctx?.revert();
  }, [
    slice.primary.enable_parallax,
    slice.primary.enable_zoom_effect,
    slice.primary.animation_preset,
    isMobile
  ]);

  const bgImage = withImageAlt(slice.primary.background_image, "");

  const variation = slice.variation || "default";
  const align = (slice.primary.text_alignment as string) || "left";
  const textAlignClass = align === "center" ? "text-center" : align === "right" ? "text-right" : "text-left";
  const contentPos = (slice.primary.content_position as string) || "top-left";
  const wrapperClass = variation === "faceGrid"
    ? "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
    : contentPos === "top-left" ? "max-w-2xl" : "max-w-2xl mx-auto";

  // Colors and spacing
  const accent = (slice.primary.accent_color as string) || "#8df6ff";
  const textColor = (slice.primary.text_color as string) || "#ffffff";
  const spacingTop = slice.primary.spacing_top as string;
  const spacingBottom = slice.primary.spacing_bottom as string;
  const ptClass = spacingTop === "tight" ? "pt-16 md:pt-20" : spacingTop === "relaxed" ? "pt-28 md:pt-36" : "pt-20 md:pt-28";
  const pbClass = spacingBottom === "tight" ? "pb-16 md:pb-20" : spacingBottom === "relaxed" ? "pb-36 md:pb-48" : "pb-20 md:pb-28";

  const stylePreset = (slice.primary.style_preset as string) || "default";
  const overlayStrength = (slice.primary.overlay_strength as string) || "medium";

  const cyanGlow = stylePreset === "cyanGlow";

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={variation}
      className={`relative ${ptClass} ${pbClass} overflow-hidden ${stylePreset === "noir" ? "bg-black" : "bg-black"}`}
      style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)' }}
    >
      {bgImage && (
        <div
          ref={bgRef}
          className="absolute inset-0 z-0 will-change-transform overflow-hidden"
        >
          <div
            ref={bgParallaxRef}
            className="absolute inset-0 sm:-top-[4%] sm:-bottom-[4%] sm:-left-[2%] sm:-right-[2%] md:-top-[12%] md:-bottom-[12%] md:-left-[6%] md:-right-[6%]"
          >
            <PrismicNextImage field={bgImage as any} fill priority className="object-cover" quality={90} alt="" />
          </div>
          {slice.primary.overlay_style === "gradient_dark" && (
            <div className={`absolute inset-0 bg-gradient-to-r ${overlayStrength === "subtle" ? "from-black/60 via-black/35" : overlayStrength === "strong" ? "from-black/90 via-black/70" : "from-black/80 via-black/50"} to-transparent`} />
          )}
          {slice.primary.overlay_style === "gradient_light" && (
            <div className={`absolute inset-0 bg-gradient-to-b ${overlayStrength === "subtle" ? "from-black/25 via-black/15" : overlayStrength === "strong" ? "from-black/55 via-black/35" : "from-black/40 via-black/25"} to-transparent`} />
          )}
          {cyanGlow && <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(141,246,255,0.12),transparent_60%)]" />}
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ color: textColor }}>
        <div className={wrapperClass}>
          {/* Left/Text column (or centered) */}
          <div className={textAlignClass}>
            {hasRT(slice.primary.eyebrow_text) && (
              <p data-pt-text className="text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-wide" style={{ color: accent }}>
                {slice.primary.eyebrow_text}
              </p>
            )}

            {hasRT(slice.primary.heading) && (
              <div data-pt-text className="mt-4">
                <PrismicRichText
                  field={slice.primary.heading}
                  components={{
                    heading1: ({ children }) => <h1 className="text-[#8df6ff] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold break-words">{children}</h1>,
                    heading2: ({ children }) => <h2 className="text-[#8df6ff] text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold break-words">{children}</h2>,
                  }}
                />
              </div>
            )}

            {hasRT(slice.primary.subtitle) && (
              <p data-pt-text className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-6 md:mb-8 leading-tight mt-4 break-words">
                {slice.primary.subtitle}
              </p>
            )}

            {hasRT(slice.primary.body_text) && (
              <div data-pt-text className="text-white text-base sm:text-lg md:text-xl leading-relaxed mt-4">
                <PrismicRichText field={slice.primary.body_text} />
              </div>
            )}
          </div>

          {/* Right column for faceGrid */}
          {variation === "faceGrid" && slice.items?.length ? (
            <div ref={gridRef} className="relative mt-8 lg:mt-0">
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-8 lg:grid-cols-9 gap-1 sm:gap-1.5 md:gap-2">
                {slice.items.map((item: any, index: number) => (
                  <div key={index} data-pt-card className="aspect-square overflow-hidden rounded-sm bg-[#8df6ff]/5">
                    {item.face_image?.url && (
                      <PrismicNextImage
                        field={withImageAlt(item.face_image, item.person_name || "Team member") as any}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Bullets variation */}
          {variation === "bullets" && slice.items?.length ? (
            <div className="mt-6 md:mt-8 space-y-3 md:space-y-4 max-w-2xl">
              {slice.items.map((item: any, i: number) => (
                <div key={i} data-pt-text className="flex items-start gap-3 md:gap-4">
                  <span className="flex-shrink-0 w-2 h-2 mt-1.5 sm:mt-2 rounded-full shadow-[0_0_8px_rgba(141,246,255,0.5)] sm:shadow-[0_0_10px_rgba(141,246,255,0.6)]" style={{ backgroundColor: accent }} />
                  <span className="text-white text-base sm:text-lg md:text-xl leading-relaxed">{item.bullet_point}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
