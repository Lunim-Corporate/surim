import type { ImageField, ImageFieldImage } from "@prismicio/types";

type ImageLike = (ImageField | ImageFieldImage) & {
  alt?: string | null;
  url?: string | null;
};

/**
 * Ensures a Prismic image field includes alternative text by returning a copy
 * with a fallback value when needed. Returns null when the field is empty.
 */
export const withImageAlt = <T extends ImageLike | null | undefined>(
  field: T,
  fallback: string = ""
): (T & ImageLike) | null => {
  if (!field || !("url" in field) || !field.url) return null;

  return {
    ...field,
    alt: field.alt ?? fallback,
  } as T & ImageLike;
};
