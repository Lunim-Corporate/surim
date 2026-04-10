// src/slices/BlogList/index.tsx
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import { PrismicRichText } from "@prismicio/react";
import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import type { KeyTextField, RichTextField } from "@prismicio/types";
import { asText } from "@prismicio/helpers";

import { createClient } from "@surim/prismic";
// Utils
import { calculateReadingTime } from "@surim/utils";
import { formatDate } from "@surim/utils";
import { JsonLdServer } from "../../JsonLdServer";
import type { ItemList, Person, WithContext } from "schema-dts";

/** Slice context passed from the page (we read search params here). */
type BlogListSliceContext = {
  searchParams?: Record<string, string | string[] | undefined>;
};

type Props = SliceComponentProps<Content.BlogListSlice, BlogListSliceContext>;

const DEFAULT_SITE_URL = "https://surim.io";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || DEFAULT_SITE_URL;

function getFirstParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function normalizeCategory(value: string): string {
  return value.trim().toLowerCase();
}

function extractCategoryText(
  field: RichTextField | KeyTextField | null | undefined
): string {
  if (!field) return "";
  // If it's StructuredText (RichTextField), convert to plain text.
  if (Array.isArray(field)) return asText(field).trim();
  // Otherwise it's a KeyText string already.
  return field.trim();
}

const resolveDocumentUrl = (
  doc: Content.BlogPostDocument
): string | null => {
  if (doc.url) return doc.url;
  const uid = doc.uid?.trim();
  if (!uid) return null;
  return `${SITE_URL}/blog/${uid}`;
};

function formatAuthorNames(authors: { name: string }[]): string {
  if (authors.length === 0) return "";
  if (authors.length === 1) return authors[0].name;
  if (authors.length === 2) return `${authors[0].name} & ${authors[1].name}`;
  // 3+ authors: "Name1, Name2 +X more"
  const remaining = authors.length - 2;
  return `${authors[0].name}, ${authors[1].name} +${remaining} more`;
}

// Helper to get initials from name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "?";
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

// Helper to generate consistent color from name
function getColorFromName(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-teal-500",
  ];
  const hash = name.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function BlogCard({ doc }: { doc: Content.BlogPostDocument }) {
  const d = doc.data;
  const title = asText(d.blog_article_heading) || doc.uid || "Untitled";
  const img = d.article_main_image;
  const articleImageField =
    img && !img.alt ? { ...img, alt: title } : img ?? null;

  // Parse multiple authors from the authors group field (maintains Prismic order)
  const authorsGroup = d.authors || [];
  const authors = authorsGroup.map((authorItem: any) => {
    const authorInfo = authorItem.author_info;
    const authorData =
      authorInfo && typeof authorInfo === "object" && "data" in authorInfo
        ? authorInfo.data
        : null;
    const authorName = authorData?.author_name?.trim() || "";
    const authorImage = authorData?.author_image ?? null;
    const authorImageField =
      authorImage && !authorImage.alt
        ? { ...authorImage, alt: authorName || "Author" }
        : authorImage;
    return {
      name: authorName,
      image: authorImageField,
    };
  }).filter((author: any) => author.name);

  const authorDisplayNames = formatAuthorNames(authors);
  const readingTime: number = calculateReadingTime(d.main_article_content);

  return (
    <PrismicNextLink document={doc} className="block rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-colors no-underline">
      {articleImageField?.url ? (
        <PrismicNextImage
          field={articleImageField}
          className="w-full h-48 object-cover"
        />
      ) : null}

      <div className="p-5">
        <h3 className="text-white text-xl font-semibold mb-2">{title}</h3>

        <div className="flex flex-wrap gap-3 text-sm text-gray-300 mb-4">
          {d.publication_date ? (
            <time dateTime={d.publication_date}>
              {formatDate(d.publication_date)}
            </time>
          ) : null}
          {d.category ? <span>• {asText(d.category)}</span> : null}
          {readingTime ? <span>• {readingTime >= 10 ? `${readingTime}+` : readingTime} min read</span> : null}
        </div>

        {authors.length > 0 ? (
          <div className="flex items-center gap-3 mb-4">
            {authors.length === 1 ? (
              authors[0].image?.url ? (
                <PrismicNextImage
                  field={authors[0].image}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-8 h-8 rounded-full ${getColorFromName(authors[0].name)} flex items-center justify-center text-white font-semibold text-xs`}
                >
                  {getInitials(authors[0].name)}
                </div>
              )
            ) : authors.length > 1 ? (
              <div className="flex -space-x-2">
                {authors.slice(0, 2).map((author: any, index: number) => (
                  <div key={index} className="border-2 border-black rounded-full">
                    {author.image?.url ? (
                      <PrismicNextImage
                        field={author.image}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-8 h-8 rounded-full ${getColorFromName(author.name)} flex items-center justify-center text-white font-semibold text-xs`}
                      >
                        {getInitials(author.name)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
            <span className="text-white/90 text-sm">{authorDisplayNames}</span>
          </div>
        ) : null}
      </div>
    </PrismicNextLink>
  );
}

export default async function BlogList({ slice, context }: Props) {
  const client = createClient();

  // ----- Settings controlled by Slice fields -----
  const pageSize =
    typeof slice.primary.page_size === "number" && slice.primary.page_size > 0
      ? slice.primary.page_size
      : 12;

  const defaultCategory =
    typeof slice.primary.category_filter === "string"
      ? slice.primary.category_filter.trim()
      : "";

  // ----- Read query params from context -----
  const rawPage = getFirstParam(context?.searchParams?.page);
  const rawCategory = getFirstParam(context?.searchParams?.cat);

  // current page
  const pageRawNumber = Number(rawPage ?? "1");
  const currentPage =
    Number.isFinite(pageRawNumber) && pageRawNumber > 0 ? pageRawNumber : 1;

  // user-requested category (falls back to the slice default)
  const selectedCategoryRaw = rawCategory ?? defaultCategory;

  // ----- Fetch a single page of posts (newest first) -----
  const response = await client.getByType("blog_post", {
    pageSize,
    page: currentPage,
    orderings: [{ field: "my.blog_post.publication_date", direction: "desc" }],
    fetchLinks: ["author.author_name", "author.author_image"],
  });

  const posts = response.results;
  const totalPages = response.total_pages || 1;

  // ----- Build category map from the fetched posts -----
  const categoriesMap = new Map<string, string>();
  for (const p of posts) {
    const rawCategory = extractCategoryText(p.data.category);
    const normalizedCategory = normalizeCategory(rawCategory);
    if (normalizedCategory && !categoriesMap.has(normalizedCategory)) {
      categoriesMap.set(normalizedCategory, rawCategory);
    }
  }
  const categories = Array.from(categoriesMap.entries()).sort(([, aLabel], [, bLabel]) =>
    aLabel.localeCompare(bLabel, undefined, { sensitivity: "base" })
  );

  // ----- Decide the effective filter (only if it exists on this page) -----
  const normalizedRequested = normalizeCategory(selectedCategoryRaw || "");
  const filterExistsOnPage = normalizedRequested
    ? categoriesMap.has(normalizedRequested)
    : false;

  // Only apply filter if it is valid for this page; else show all.
  const effectiveFilter = filterExistsOnPage ? normalizedRequested : "";

  // ----- Visible posts -----
  const visiblePosts = (effectiveFilter
    ? posts.filter((doc) =>
        normalizeCategory(extractCategoryText((doc.data as Content.BlogPostDocumentData).category)) ===
        effectiveFilter
      )
    : posts) as Content.BlogPostDocument[];

  // ----- Helper to build query strings for pagination & filters -----
  const withParams = (params: {
    page?: number;
    cat?: string | undefined;
  }): string => {
    const usp = new URLSearchParams();
    if (params.cat) usp.set("cat", normalizeCategory(params.cat));
    if (typeof params.page === "number") usp.set("page", String(params.page));
    const qs = usp.toString();
    return qs ? `?${qs}` : "";
  };

  const prevHref =
    currentPage > 1
      ? withParams({ page: currentPage - 1, cat: effectiveFilter || undefined })
      : null;

  const nextHref =
    currentPage < totalPages
      ? withParams({ page: currentPage + 1, cat: effectiveFilter || undefined })
      : null;

  const blogListJsonLd: WithContext<ItemList> | null = visiblePosts.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: visiblePosts.map(
          (doc: Content.BlogPostDocument, index: number) => {
          const data = doc.data;
          const title =
            asText(data.blog_article_heading) ||
            doc.uid ||
            `Article ${index + 1}`;
          const url = resolveDocumentUrl(doc);
          const description =
            data.meta_description || asText(data.main_article_content);
          const image = data.article_main_image?.url || undefined;
          const datePublished = data.publication_date || undefined;

          // Parse multiple authors for JSON-LD
          const authorsGroup = data.authors || [];
          const authorsList = authorsGroup.map((authorItem: any) => {
            const authorInfo = authorItem.author_info;
            const authorData =
              authorInfo && typeof authorInfo === "object" && "data" in authorInfo
                ? authorInfo.data
                : null;
            const authorName = authorData?.author_name?.trim() || "";
            return authorName;
          }).filter(Boolean);

          const author: Person | Person[] | undefined =
            authorsList.length === 1
              ? { "@type": "Person", name: authorsList[0] }
              : authorsList.length > 1
              ? authorsList.map((name: string) => ({ "@type": "Person" as const, name }))
              : undefined;

          return {
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "Article",
              headline: title,
              ...(description ? { description } : {}),
              ...(url ? { url } : {}),
              ...(image ? { image } : {}),
              ...(datePublished ? { datePublished } : {}),
              ...(author ? { author } : {}),
            },
          };
        }),
      }
    : null;

  return (
    <>
      {blogListJsonLd ? <JsonLdServer data={blogListJsonLd} /> : null}
      <section className="py-16 bg-black">
      <div className="max-w-7xl mx-auto px-6">
        {slice.primary.heading?.length ? (
          <h2 className="text-3xl font-bold text-white mb-3">
            <PrismicRichText field={slice.primary.heading} />
          </h2>
        ) : null}

        {slice.primary.intro?.length ? (
          <div className="text-gray-300 mb-6">
            <PrismicRichText field={slice.primary.intro} />
          </div>
        ) : null}

        {/* Category chips */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <a
            href={withParams({ page: 1 })}
            className={`px-3 py-1 rounded-full text-sm border no-underline ${
              !effectiveFilter
                ? "bg-cyan-300 text-black border-cyan-300"
                : "border-white/20 text-white/80 hover:text-white"
            }`}
          >
            All
          </a>
          {categories.map(([normalizedCat, label]) => (
            <a
              key={normalizedCat}
              href={withParams({ page: 1, cat: normalizedCat })}
              className={`px-3 py-1 rounded-full text-sm border no-underline ${
                normalizedCat === effectiveFilter
                  ? "bg-cyan-300 text-black border-cyan-300"
                  : "border-white/20 text-white/80 hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Grid / empty state */}
        {visiblePosts.length ? (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePosts.map((doc: Content.BlogPostDocument) => (
              <BlogCard key={doc.id} doc={doc} />
            ))}
          </div>
        ) : (
          <div className="text-white/70 border border-white/10 rounded-xl p-6">
            No posts found for this filter.
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between mt-10">
          <div className="text-white/60 text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <div className="flex gap-3">
            <a
              aria-disabled={!prevHref}
              href={prevHref ?? "#"}
              className={`px-4 py-2 rounded border ${
                prevHref
                  ? "border-white/20 text-white/90 hover:text-white"
                  : "border-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              ← Newer
            </a>
            <a
              aria-disabled={!nextHref}
              href={nextHref ?? "#"}
              className={`px-4 py-2 rounded border ${
                nextHref
                  ? "border-white/20 text-white/90 hover:text-white"
                  : "border-white/10 text-white/30 cursor-not-allowed"
              }`}
            >
              Older →
            </a>
          </div>
        </div>
      </div>
    </section>
    </>
  );
}
