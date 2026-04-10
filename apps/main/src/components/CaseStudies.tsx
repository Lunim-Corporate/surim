import type { CaseStudySmDocumentWithLegacy } from "@/app/digital/case-studies/types";
import { HeroLikeSlice } from "@/app/digital/case-studies/types";
// Prismic
import { asText } from "@prismicio/helpers";
import { PrismicRichText } from "@prismicio/react";
// Next
import Image from "next/image";
import Link from "next/link";

// Try to find a hero-like slice and return its image + title
function extractHeroFromSlices(slices: ReadonlyArray<HeroLikeSlice> | null | undefined) {
  if (!Array.isArray(slices)) return { img: undefined, title: undefined };
  const hero =
    slices.find((s) => s.slice_type === "compact_hero") ||
    slices.find((s) => s.slice_type === "case_study_hero") ||
    slices.find((s) => s.slice_type === "herosection");

  const primary = hero?.primary;
  const img =
    primary?.hero_image?.url ||
    primary?.background_image?.url ||
    undefined;

  const title =
    primary?.hero_title ||
    primary?.hero_title_part1 ||
    undefined;

  return { img, title };
}

type CaseStudiesProps = {
  filteredCaseStudies: CaseStudySmDocumentWithLegacy[];
  caseStudyPage?: any;
};

export default function CaseStudies({ filteredCaseStudies, caseStudyPage }: CaseStudiesProps) {
  return (
    <main className="bg-black min-h-screen text-white">
      <section className="max-w-7xl mx-auto px-6 py-16">
        <PrismicRichText
          field={caseStudyPage?.data.heading}
          components={{ heading1: ({ children }) => (<h1 className="text-4xl mb-8">{children}</h1>) }}
        />

        {filteredCaseStudies.length === 0 ? (
            <p className="text-gray-400">No case studies yet.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCaseStudies.map((cs: CaseStudySmDocumentWithLegacy) => {
                const slices = cs.data.slices;
                // Prefer top-level hero_image (if present), else look inside hero-like slices
                const fromSlices = extractHeroFromSlices(slices);
                const imageUrl =
                  cs.data.hero_image?.url || fromSlices.img;
  
                const titleText =
                  asText(cs.data.hero_title) ||
                  asText(fromSlices.title) ||
                  cs.uid;
  
                return (
                  <li
                    key={cs.id}
                    className="rounded-lg border border-white/10 overflow-hidden hover:border-cyan-400/50 transition"
                  >
                    <Link href={`/digital/case-studies/${cs.uid}`} className="block">
                      {imageUrl ? (
                        <div className="relative w-full aspect-[16/9]">
                          <Image
                            src={imageUrl}
                            alt={cs.uid}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            priority={false}
                          />
                        </div>
                      ) : null}
                      <div className="p-5">
                        <h2 className="text-xl font-semibold mb-2">{titleText}</h2>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    );
}
