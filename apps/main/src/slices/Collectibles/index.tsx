"use client";

import { useEffect, useRef } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import { useIsMobile } from "@/hooks/useMediaQuery";

export type CollectiblesProps = SliceComponentProps<any>;

const Collectibles = ({ slice }: CollectiblesProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const backgroundImage = slice.primary.background_image?.url ? slice.primary.background_image : null;
  const isMobile = useIsMobile();

  useEffect(() => {
    let ctx: any;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          if (gridRef.current) {
            const cards = gridRef.current.querySelectorAll(".collectible-card");
            gsap.timeline({ scrollTrigger: { trigger: gridRef.current, start: isMobile ? "top bottom" : "top 90%", end: isMobile ? "bottom bottom" : "top 10%", scrub: 0.5 } })
              .from(cards, { opacity: 0, y: 30, filter: "blur(4px)", stagger: 0.08, ease: "none" });
          }
        }, sectionRef);
      }
    );
    return () => ctx?.revert();
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      data-device={isMobile ? "mobile" : "desktop"}
      className="relative py-20 md:py-28 overflow-hidden bg-[#03070f]"
      style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)', maskImage: 'linear-gradient(to bottom, transparent, black 6%, black 94%, transparent)' }}
    >
      {backgroundImage && (
        <div className="absolute inset-0 -z-10">
          <PrismicNextImage field={backgroundImage as any} fill className="object-cover" quality={85} fallbackAlt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {slice.primary.title && (
          <div className="mb-8 md:mb-10 px-2">
            <PrismicRichText field={slice.primary.title} components={{ heading2: ({ children }) => (
              <h2 className="text-[#8df6ff] text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-center break-words">{children}</h2>
            ) }} />
          </div>
        )}

        <div ref={gridRef} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {slice.items.map((item: any, idx: number) => (
            <article key={idx} className="collectible-card rounded-lg sm:rounded-xl overflow-hidden bg-[#0b1222] border border-white/5 shadow-[0_0_16px_rgba(141,246,255,0.08)] sm:shadow-[0_0_20px_rgba(141,246,255,0.1)] hover:shadow-[0_0_24px_rgba(141,246,255,0.2)] transition-shadow">
              <div className="aspect-[4/3] relative">
                {item.image?.url && (
                  <PrismicNextImage field={{ ...(item.image as any), alt: ((item.title as string) || "Collectible") }} fill className="object-cover" />
                )}
              </div>
              <div className="p-2 sm:p-3">
                <h3 className="text-white text-xs sm:text-sm font-semibold uppercase tracking-tight line-clamp-2 mb-1.5 sm:mb-2">{item.title}</h3>
                <div className="mt-1.5 sm:mt-2 flex items-center justify-between text-[10px] sm:text-xs text-white/70">
                  <span className="truncate mr-2">{item.price_label}</span>
                  {item.cta_label && (
                    <span className="flex-shrink-0 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[9px] sm:text-[10px] bg-[#8df6ff]/15 text-[#8df6ff] border border-[#8df6ff]/30 cursor-pointer hover:bg-[#8df6ff]/20 transition-colors">{item.cta_label}</span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Collectibles;
