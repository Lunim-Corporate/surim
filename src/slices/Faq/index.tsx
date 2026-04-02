"use client";
import { ChevronDown } from "lucide-react";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { JsonLd } from "@/components/JsonLd";
import type { FAQPage, WithContext } from "schema-dts";

/**
 * Props for `Faq`.
 */
export type FaqProps = SliceComponentProps<Content.FaqSlice>;

/**
 * Component for "Faq" Slices.
 */
const Faq: React.FC<FaqProps> = ({ slice }) => {
  const items = (slice.items as any[]) ?? [];

  const jsonLd: WithContext<FAQPage> = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: Array.isArray(item.answer)
          ? item.answer.map((block: any) => block.text).join("\n")
          : "",
      },
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} id="faq-schema" />
      <section className="bg-[#0f172a] py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-3xl font-bold text-white mb-12 text-center">
          <PrismicRichText field={slice.primary.title} />
        </div>

        <div className="space-y-4">
          {items.map((item: any, index: number) => (
            <div
              key={index}
              className="bg-[#1f2937] rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
            >
              <details className="group">
                <summary className="w-full flex justify-between items-center p-4 md:p-6 text-left cursor-pointer focus:outline-none list-none">
                  <h3 className="text-lg font-semibold text-white pr-4 mt-0 mb-0">
                    {/* Use the Key Text field directly for the question */}
                    {item.question}
                  </h3>
                  <ChevronDown className="w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
                </summary>
                {/* Use PrismicRichText for the answer, which handles paragraphs automatically */}
                <div className="p-4 md:p-6 pt-0 text-gray-300 prose prose-invert max-w-none">
                  <PrismicRichText field={item.answer} />
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </section>
    </>
  );
};

export default Faq;
