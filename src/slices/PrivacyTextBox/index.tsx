"use client";
import { FC } from "react";
import { Content } from "@prismicio/client";
import { SliceComponentProps } from "@prismicio/react";
import { PrismicRichText } from "@prismicio/react";

/**
 * Props for `PrivacyTextBox`.
 */
export type PrivacyTextBoxProps =
  SliceComponentProps<Content.PrivacyTextBoxSlice>;

/**
 * Component for "PrivacyTextBox" Slices.
 */
const PrivacyTextBox: FC<PrivacyTextBoxProps> = ({ slice }) => {
  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="pt-24 md:pt-16 bg-[#0f172a] text-white min-h-screen p-8"
    >
      <div className="max-w-4xl mx-auto p-8">
        <div
          className="text-4xl font-bold mb-8 text-center"
          style={{ color: "#BBFEFF" }}
        >
          <PrismicRichText field={slice.primary.title} />
        </div>

        <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
          <PrismicRichText field={slice.primary.page_content} />
        </div>
      </div>
    </section>
  );
};

export default PrivacyTextBox;
