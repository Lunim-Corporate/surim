"use client";

import React, { useEffect, useRef } from "react";
import type { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage } from "@prismicio/next";
import { withImageAlt } from "@/lib/prismicImage";
import { useIsMobile } from "@/hooks/useMediaQuery";

export type ParallaxLineProps = SliceComponentProps<any>;

const ParallaxLine = ({ slice }: ParallaxLineProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  const desktopLineRef = useRef<SVGPathElement>(null);
  const mobileLineRef = useRef<SVGPathElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const backgroundImage = withImageAlt(slice.primary.background_image, "");
  const brandLogo = withImageAlt(slice.primary.brand_logo, "");
  const itemCount = slice.items?.length || 0;

  // Used to give the mobile vertical timeline enough height so side content
  // never collides/overlaps even with many items.
  const mobileTimelineHeight = Math.max(650, ((itemCount || 1) * 100));

  useEffect(() => {
    if (!sectionRef.current) return;

    let ctx: any;
    Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(
      ([{ default: gsap }, { ScrollTrigger }]) => {
        gsap.registerPlugin(ScrollTrigger);
        ctx = gsap.context(() => {
          gsap
            .timeline({ scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "top 50%", scrub: 0.6 } })
            .from(titleRef.current, { opacity: 0, y: 40, filter: "blur(6px)" })
            .from(subtitleRef.current, { opacity: 0, y: 30, filter: "blur(4px)" }, "-=0.1")
            .from(descriptionRef.current, { opacity: 0, y: 20, filter: "blur(3px)" }, "-=0.1");

          const nodeCount = itemCount;
          const tl = gsap.timeline({
            scrollTrigger: { trigger: sectionRef.current, start: "top 40%", end: "center 40%", scrub: 0.7 },
          });

          if (!isMobile && desktopLineRef.current) {
            const length = desktopLineRef.current.getTotalLength();
            const desktopNodes = sectionRef.current?.querySelectorAll(".desktop-timeline-node");
            tl.set(desktopLineRef.current, { strokeDasharray: length, strokeDashoffset: length }, 0);
            tl.to(desktopLineRef.current, { strokeDashoffset: 0, duration: 0.5, ease: "none" }, 0);

            for (let i = 0; i < nodeCount; i++) {
              const node = desktopNodes?.[i];
              const connectors = sectionRef.current?.querySelectorAll(`.connector-${i}`);
              const content = sectionRef.current?.querySelector(`.content-${i}`);
              const baseTime = 0.5 + i * 0.18;
              if (node) tl.from(node, { scale: 0, opacity: 0, duration: 0.28, ease: "back.out(1.7)" }, baseTime);
              if (connectors?.length) connectors.forEach((c) => tl.from(c, { scaleY: 0, transformOrigin: "top", duration: 0.2, ease: "none" }, baseTime + 0.04));
              if (content) tl.from(content, { opacity: 0, x: -15, duration: 0.26, ease: "power2.out" }, baseTime + 0.06);
            }
          }

          if (isMobile && mobileLineRef.current) {
            const length = mobileLineRef.current.getTotalLength();
            const mobileNodes = sectionRef.current?.querySelectorAll(".mobile-timeline-node");
            tl.set(mobileLineRef.current, { strokeDasharray: length, strokeDashoffset: length }, 0);
            tl.to(mobileLineRef.current, { strokeDashoffset: 0, duration: 0.5, ease: "none" }, 0);

            for (let i = 0; i < nodeCount; i++) {
              const node = mobileNodes?.[i];
              const connectors = sectionRef.current?.querySelectorAll(`.mobile-connector-${i}`);
              const contents = sectionRef.current?.querySelectorAll(`.mobile-content-${i}`);
              const baseTime = 0.5 + i * 0.2;
              if (node) tl.from(node, { opacity: 0, y: -15, scale: 0.85, duration: 0.3, ease: "power2.out" }, baseTime);
              if (connectors?.length) connectors.forEach((c) => tl.from(c, { scaleX: 0, transformOrigin: "left", duration: 0.22, ease: "power1.out" }, baseTime + 0.02));
              if (contents?.length) contents.forEach((c) => tl.from(c, { opacity: 0, y: -15, duration: 0.28, ease: "power2.out" }, baseTime + 0.02));
            }
          }
        }, sectionRef);
      }
    );

    return () => ctx?.revert();
  }, [isMobile, itemCount]);

  const hasRichText = (field: any): boolean => {
    if (!field) return false;
    if (Array.isArray(field)) return field.length > 0;
    return typeof field === "string" ? field.trim().length > 0 : !!field;
  };

  return (
    <section
      ref={sectionRef}
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="relative bg-[#00121f] overflow-x-hidden overflow-y-visible"
    >
      {/* Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 z-0">
          <PrismicNextImage 
            field={backgroundImage as any} 
            fill 
            priority
            className="object-cover" 
            quality={90} 
            alt="" 
          />
          <div className="absolute inset-0 bg-[#00121f]/70" />
        </div>
      )}
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12 md:mb-16 text-center">
          {slice.primary.title && (
            <div ref={titleRef}>
              <PrismicRichText
                field={slice.primary.title}
                components={{
                  heading2: ({ children }) => (
                    <h2 className="text-[#8df6ff] text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold mb-4 md:mb-6 break-words px-2">
                      {children}
                    </h2>
                  ),
                }}
              />
            </div>
          )}
          {slice.primary.subtitle && (
            <p
              ref={subtitleRef}
              className="text-white/90 text-lg sm:text-xl lg:text-2xl max-w-4xl mx-auto px-2"
            >
              {slice.primary.subtitle}
            </p>
          )}
          {slice.primary.description && (
            <div
              ref={descriptionRef}
              className="mt-3 md:mt-4 text-white/80 text-base sm:text-lg max-w-4xl mx-auto px-2"
            >
              <PrismicRichText field={slice.primary.description} />
            </div>
          )}
        </div>

        {/* Desktop Timeline - Straight "|" connectors alternating up/down */}
        <div className="hidden md:block relative" style={{ height: "500px" }}>
          {/* Horizontal Line SVG */}
          <svg
            className="absolute left-0 right-0 w-full"
            style={{ top: "50%", transform: "translateY(-50%)", height: "4px" }}
            viewBox="0 0 1000 4"
            preserveAspectRatio="none"
          >
            <path
              ref={desktopLineRef}
              d="M 0 2 L 1000 2"
              stroke="#8df6ff"
              strokeWidth="4"
              fill="none"
            />
          </svg>

          {/* Nodes and Content Container */}
          <div className="relative flex justify-between items-center" style={{ height: "500px" }}>
            {slice.items.map((item: any, idx: number) => {
              const count = slice.items.length;
              const leftPct = count === 1 ? 50 : (idx / (count - 1)) * 100;
              const hasTopContent = item.top_title || hasRichText(item.top_description);
              const hasBottomContent = item.bottom_title || hasRichText(item.bottom_description);

              return (
                <div
                  key={idx}
                  className="absolute"
                  style={{
                    left: `${leftPct}%`,
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  {/* Node Circle */}
                  <div className="timeline-node desktop-timeline-node relative z-20 w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-full bg-[#001428] border-3 md:border-4 border-[#8df6ff] overflow-hidden shadow-[0_0_30px_rgba(141,246,255,0.6)] md:shadow-[0_0_40px_rgba(141,246,255,0.7)]">
                    {item.node_image?.url && (
                      <PrismicNextImage 
                        field={withImageAlt(item.node_image, item.top_title || item.bottom_title || "Node") as any}
                        fill 
                        className="object-cover" 
                      />
                    )}
                  </div>

                  {/* Top Content - Straight "|" connector, content on RIGHT */}
                  {hasTopContent && (
                    <>
                      {/* Straight Vertical Connector - height set dynamically */}
                      <div
                        className={`connector-${idx} timeline-connector absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#8df6ff]`}
                        style={{ 
                          bottom: "calc(50% + 18px)", 
                          height: "130px" 
                        }}
                      />
                      {/* Text Content on RIGHT side with gap from node - PUSHED UP */}
                      <div 
                        className={`content-${idx} absolute text-left`}
                        style={{ 
                          bottom: "calc(50% + 80px)", 
                          left: "calc(50% + 20px)",
                          width: "180px"
                        }}
                      >
                        {item.top_title && (
                          <h3 className="text-white font-bold text-sm lg:text-base mb-1">{item.top_title}</h3>
                        )}
                        {hasRichText(item.top_description) && (
                          <div className="text-white/80 text-xs lg:text-sm leading-relaxed">
                            <PrismicRichText field={item.top_description} />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Bottom Content - Straight "|" connector, content on RIGHT */}
                  {hasBottomContent && (
                    <>
                      {/* Straight Vertical Connector - height set dynamically */}
                      <div
                        className={`connector-${idx} timeline-connector absolute left-1/2 -translate-x-1/2 w-0.5 bg-[#8df6ff]`}
                        style={{ 
                          top: "calc(50% + 18px)", 
                          height: "130px" 
                        }}
                      />
                      {/* Text Content on RIGHT side with gap from node - PUSHED DOWN */}
                      <div 
                        className={`content-${idx} absolute text-left`}
                        style={{ 
                          top: "calc(50% + 80px)", 
                          left: "calc(50% + 20px)",
                          width: "180px"
                        }}
                      >
                        {item.bottom_title && (
                          <h3 className="text-white font-bold text-sm lg:text-base mb-1">{item.bottom_title}</h3>
                        )}
                        {hasRichText(item.bottom_description) && (
                          <div className="text-white/80 text-xs lg:text-sm leading-relaxed">
                            <PrismicRichText field={item.bottom_description} />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile Timeline - Vertical with alternating left/right content */}
        <div className="md:hidden relative flex justify-center" style={{ height: `${mobileTimelineHeight}px` }}>
          <svg
            className="absolute top-0 bottom-0 h-full"
            style={{ left: "50%", transform: "translateX(-50%)", width: "4px" }}
            viewBox="0 0 4 1000"
            preserveAspectRatio="none"
          >
            <path
              ref={mobileLineRef}
              d="M 2 0 L 2 1000"
              stroke="#8df6ff"
              strokeWidth="4"
              fill="none"
            />
          </svg>

          <div className="relative w-full" style={{ height: `${mobileTimelineHeight}px` }}>
            {slice.items.map((item: any, idx: number) => {
              const count = slice.items.length;

              let topPct = 50;
              if (count === 1) {
                topPct = 50;
              } else {
                // Keep all nodes safely within 10%–90% band vertically so
                // connectors/content never crash into the very top or bottom.
                const innerRange = 100; // percent
                const step = innerRange / (count - 1);
                topPct = 2 + step * idx;
              }
              const hasTopContent = item.top_title || hasRichText(item.top_description);
              const hasBottomContent = item.bottom_title || hasRichText(item.bottom_description);
              return (
                <div
                  key={idx}
                  className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{
                    top: `${topPct}%`,
                  }}
                >
                  {/* Node Circle */}
                  <div className="timeline-node mobile-timeline-node relative z-20 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#001428] border-3 border-[#8df6ff] overflow-hidden shadow-[0_0_30px_rgba(141,246,255,0.7)]">
                    {item.node_image?.url && (
                      <PrismicNextImage 
                        field={withImageAlt(item.node_image, item.top_title || item.bottom_title || "Node") as any}
                        fill 
                        className="object-cover" 
                      />
                    )}
                  </div>

                  {/* Right side content (maps from top content on desktop) */}
                  {hasTopContent && (
                    <>
                      <div
                        className={`mobile-connector-${idx} absolute top-1/2 -translate-y-1/2 h-0.5 bg-[#8df6ff]`}
                        style={{
                          left: "calc(50% + 10px)",
                          width: "28px",
                        }}
                      />                      <div
                        className={`mobile-content-${idx} absolute top-1/2 -translate-y-1/2`}
                        style={{
                          left: "calc(50% + 42px)",
                          width: "110px",
                          textAlign: "left",
                        }}
                      >
                        {item.top_title && (
                          <h3 className="text-white font-bold text-sm mb-1">
                            {item.top_title}
                          </h3>
                        )}
                        {hasRichText(item.top_description) && (
                          <div className="">
                            <PrismicRichText
                              field={item.top_description}
                              components={{
                                paragraph: ({ children }) => <p className="text-white/80 text-sm leading-snug">{children}</p>,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Left side content (maps from bottom content on desktop) */}
                  {hasBottomContent && (
                    <>
                      <div
                        className={`mobile-connector-${idx} absolute top-1/2 -translate-y-1/2 h-0.5 bg-[#8df6ff]`}
                        style={{
                          right: "calc(50% + 10px)",
                          width: "28px",
                        }}
                      />                      <div
                        className={`mobile-content-${idx} absolute top-1/2 -translate-y-1/2`}
                        style={{
                          right: "calc(50% + 42px)",
                          width: "110px",
                          textAlign: "right",
                        }}
                      >
                        {item.bottom_title && (
                          <h3 className="text-white font-bold text-sm sm:text-sm mb-1">
                            {item.bottom_title}
                          </h3>
                        )}
                        {hasRichText(item.bottom_description) && (
                          <div>
                            <PrismicRichText
                              field={item.bottom_description}
                              components={{
                                paragraph: ({ children }) => <p className="text-white/80 text-sm leading-snug">{children}</p>,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Brand Logo */}
      {brandLogo && (
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-10 z-20">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 opacity-60 hover:opacity-100 transition-opacity">
            <PrismicNextImage field={brandLogo as any} fill className="object-contain" alt="" />
          </div>
        </div>
      )}
    </section>
  );
};

export default ParallaxLine;
