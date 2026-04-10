"use client";
import {
  PrismicRichText,
  type SliceComponentProps,
} from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { asLink, asText } from "@prismicio/helpers";
// React
import { FC } from "react";
import { PrismicNextLink } from "@prismicio/next";
import { JsonLd } from "@/components/JsonLd";
import type { ItemList, ListItem, WithContext } from "schema-dts";

type ProjectShowcaseProps = SliceComponentProps<Content.ProjectShowcaseSlice>;

const DEFAULT_SITE_URL = "https://surim.io";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || DEFAULT_SITE_URL;

const toAbsoluteUrl = (value?: string | null): string | null => {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  return `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`;
};

const ProjectShowcase: FC<ProjectShowcaseProps> = ({ slice }) => {
  const caseStudies = (slice.primary.case_study as any[]) ?? [];
  const showcaseJsonLd: WithContext<ItemList> | null = caseStudies.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: caseStudies.reduce<ListItem[]>((acc, item: any, index: number) => {
          const name = asText(item.project_title) || `Project ${index + 1}`;
          if (!name) {
            return acc;
          }
          const description = asText(item.project_description);
          const projectLink = toAbsoluteUrl(asLink(item.project_link));
          const image = item.project_image?.url || undefined;
          const tagsArray: string[] = item.tags
            ? item.tags.split(",").map((tag: string) => tag.trim())
            : [];
          const keywords = tagsArray.filter(Boolean).join(", ");
          acc.push({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "CreativeWork",
              name,
              ...(description ? { description } : {}),
              ...(projectLink ? { url: projectLink } : {}),
              ...(image ? { image } : {}),
              ...(keywords ? { keywords } : {}),
            },
          });
          return acc;
        }, []),
      }
    : null;

  return (
    <>
      {showcaseJsonLd ? <JsonLd data={showcaseJsonLd} id="project-showcase-schema" /> : null}
      <section
        id="case-studies"
        className="bg-[#0f172a] py-16"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-[#0f172a]">
        {/* Only show title for this slice */}
        {slice.variation === "projectShowcaseHero" && (
          <div className="mb-22">
            <PrismicRichText
              field={slice.primary.title}
              components={{
                heading2: ({ children }) => <h2 className="text-3xl font-bold text-white text-center ">{children}</h2>
              }}
              />
          </div>
        )}
        {/* Heading (for example, UX, Web3, AI) */}
        <div className="text-3xl font-bold text-white mb-18 text-center">
          <PrismicRichText field={slice.primary.heading} />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {caseStudies.length > 0 && (
          caseStudies.map((item: any, index: number) => {
            const tagsArray: string[] = item.tags
                  ? item.tags.split(",").map((tag: string) => tag.trim())
                  : [];

            return (
              <PrismicNextLink
                field={item.project_link}
                key={index}
                className="rounded-lg shadow-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 flex flex-col h-full no-underline"
            >
            <div
                className="bg-gray-800 h-48 flex items-center justify-center"
                style={
                    item.project_image
                    ? {
                    backgroundImage: `url(${item.project_image.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    }
                    : {}
                }
            />

            <div className="bg-[#1f2937] p-4 md:p-6 flex-1 flex flex-col">
                <div className="flex-1">
                    {item.show_cta_button ? (
                    <div className="grid pt-4 pb-8">
                        <h3 className="text-white font-bold text-xl m-0! text-left">
                        {asText(item.project_title)}
                        </h3>
                    </div>
                    ) : (
                        <div className="grid grid-cols-1 pt-4 pb-8">
                          <h3 className="text-white font-bold text-xl m-0! text-left">
                          {asText(item.project_title)}
                          </h3>
                        </div>
                      )}
                    <PrismicRichText 
                      field={item.project_description}
                      components={{
                        paragraph: ({ children }) => <p className="text-gray-200 text-base text-left">{children} <span className="after:content-['_>'] cursor-pointer rounded-[0.3rem] text-base text-[#BBFEFF] hover:text-cyan-300">{item.button_cta_text}</span></p>
                      }}
                    />
                </div>

                {tagsArray.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                    {tagsArray.map((tag, tagIndex) => (
                      <span
                      key={tagIndex}
                      className="bg-white/10 text-white px-3 py-1 rounded-full"
                      >
                          {tag}
                      </span>
                    ))}
                </div>
                )}
            </div>
            </PrismicNextLink>
            )
          })
        )}
      </div>
      {/* Case Study Link */}
      {slice.primary.show_case_study_page_link && (
      <div className="mt-16 text-center text-white">
        <PrismicNextLink
            field={slice.primary.case_study_page_link}
            className='bg-[#BBFEFF] text-black px-8 py-4 rounded-[0.3rem] font-semibold hover:bg-cyan-300 transition-colors duration-300 no-underline'
          />
        </div>
        )}
      </div>
      </section>
    </>
  );
};

export default ProjectShowcase;
