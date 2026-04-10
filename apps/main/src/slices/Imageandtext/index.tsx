"use client";
// Next
import Image from "next/image";
// Prismic
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import { asText } from "@prismicio/helpers";
import { PrismicNextLink } from "@prismicio/next";

export type ImageandtextProps = SliceComponentProps<Content.ImageandtextSlice>;

const Imageandtext: React.FC<ImageandtextProps> = ({ slice }) => {

  const buttonLinkField = slice.primary.buttonlink;
  const buttonLinkFieldText = slice.primary.buttonlink?.text;

  return (
  <section className="bg-black py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-start gap-10">
      
      <div className="bg-[#1e293b] rounded-lg w-full md:w-1/2 flex justify-center items-center h-64 overflow-hidden relative">
        {slice.primary.image?.url ? (
          <Image
            src={slice.primary.image.url}
            alt={slice.primary.image.alt || "Content image"}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover rounded-lg"
            unoptimized
          />
        ) : null}
      </div>

      <div className="w-full md:w-1/2 text-white">
        <h2 className="text-3xl font-bold mb-4">
          {asText(slice.primary.title)}
        </h2>
        <p className="text-xl font-medium mb-4">
          {asText(slice.primary.subtitle)}
        </p>
        <div className="text-gray-200 mb-4">
          <PrismicRichText field={slice.primary.description} />
        </div>
        {slice.primary.show_link && (
          <PrismicNextLink field={buttonLinkField}>
            <button
              className="cursor-pointer bg-[#BBFEFF] text-black px-8 py-2.5 rounded-[0.3rem] font-semibold hover:bg-cyan-300 transition-colors duration-300"
            >{buttonLinkFieldText}</button>
          </PrismicNextLink>
        )}
      </div>
    </div>
  </section>
  )
};

export default Imageandtext;
