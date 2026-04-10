// app/blog/[uid]/page.tsx
// Next
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";
// Prismicio
import { createClient } from "@/prismicio";
import { asText } from "@prismicio/helpers";
import type { BlogPostDocument, BlogPostDocumentData, BlogPostDocumentDataSlicesSlice } from "../../../../../prismicio-types";
import { PrismicRichText } from "@prismicio/react";
import { RichTextField, SliceZone } from "@prismicio/types";
import { PrismicNextImage } from "@prismicio/next";
// Icons
import { ChevronDown, Eye } from "lucide-react";
// Types
import { Simplify } from "../../../../../prismicio-types";
// Utils
import { createID } from "@/utils/createId";
import { calculateReadingTime } from "@/utils/calcReadingTime";
import { formatDate } from "@/utils/formatDate";
// Components
import TableOfContents from "@/components/TableOfContents";
import ViewCounter from "@/components/ViewCounter";
// Utils
import { pickBaseMetadata } from "@/utils/metadata";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";
import { JsonLdServer } from "@/components/JsonLdServer";
import type { BlogPosting, BreadcrumbList, WithContext } from "schema-dts";
// import { getCanonicalUrl } from "@/utils/getCanonical";

const DEFAULT_SITE_URL = "https://surim.io";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || DEFAULT_SITE_URL;

// Must use 'force-dynamic' to show meta tags correctly for each blog post
// export const dynamic = 'force-dynamic';

type Params = { uid: string };

type ImageLikeField = {
  url?: string | null;
  alt?: string | null;
};

function withFallbackAlt<T extends ImageLikeField>(
  field: T | null | undefined,
  fallback: string
): T | null | undefined {
  if (!field?.url) return field ?? null;
  const existingAlt = typeof field.alt === "string" ? field.alt.trim() : "";
  if (existingAlt) return field;
  const fallbackAlt = fallback.trim() || "Blog image";
  return { ...field, alt: fallbackAlt } as T;
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

// Avatar component with fallback to initials
function AuthorAvatar({ name, image, size = 40 }: { name: string; image: ImageLikeField | null | undefined; size?: number }) {
  const imageWithAlt = withFallbackAlt(image, name);

  if (imageWithAlt?.url) {
    return (
      <PrismicNextImage
        field={imageWithAlt}
        className={`rounded-full inline-block object-cover`}
        style={{ width: size, height: size }}
      />
    );
  }

  // Fallback to initials
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <div
      className={`rounded-full ${bgColor} flex items-center justify-center text-white font-semibold`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { uid } = await params;

  const client = createClient();
  // Pass custom name of linked document type 'author'
  const doc = (await (client as any)
    .getByUID("blog_post", uid, {
      fetchLinks: ["author.author_name", "author.author_image", "author.author_bio"],
    })
    .catch(() => null)) as BlogPostDocument | null;
  if (!doc) notFound();
  const docData: Simplify<BlogPostDocumentData> = doc.data;

  const faqSlice: SliceZone<BlogPostDocumentDataSlicesSlice> = docData.slices
  const faqs = (faqSlice[0] as any)?.items as any[] | undefined
  const faqHeading: RichTextField | undefined = (faqSlice[0] as any)?.primary?.title
  const readingTime: number = calculateReadingTime(docData.main_article_content);

  // Parse multiple authors from the authors group field
  const authorsGroup = docData.authors || [];
  const authors = authorsGroup.map((authorItem: any) => {
    const authorInfo = authorItem.author_info;
    const authorData =
      authorInfo && "data" in authorInfo ? authorInfo.data : undefined;
    const authorUid =
      authorInfo && "uid" in authorInfo && typeof authorInfo.uid === "string"
        ? authorInfo.uid
        : null;
    const authorName =
      (typeof authorData?.author_name === "string"
        ? authorData.author_name.trim()
        : "") || "";
    const authorBio = authorData?.author_bio;
    const authorImage = authorData?.author_image ?? null;

    return {
      uid: authorUid,
      name: authorName || "Surim",
      bio: authorBio,
      image: authorImage,
    };
  }).filter((author: any) => author.name);

  // For backwards compatibility and single-author display
  const primaryAuthor = authors[0] || { uid: null, name: "Surim", bio: undefined, image: null };

  // Smart formatting for author names
  const formatAuthorNames = (authorsList: typeof authors): string => {
    if (authorsList.length === 0) return "Surim";
    if (authorsList.length === 1) return authorsList[0].name;
    if (authorsList.length === 2) return `${authorsList[0].name} & ${authorsList[1].name}`;
    // 3+ authors: "Name1, Name2 +X more"
    const remaining = authorsList.length - 2;
    return `${authorsList[0].name}, ${authorsList[1].name} +${remaining} more`;
  };

  const authorDisplayNames = formatAuthorNames(authors);

  const headingText = (asText(docData.blog_article_heading || []) || "").trim();
  const articleImageWithAlt = withFallbackAlt(
    docData.article_main_image,
    headingText || "Blog article image"
  );

  const canonicalUrl =
    (docData.meta_url && docData.meta_url.trim()) ||
    doc.url ||
    `${SITE_URL}/blog/${uid}`;
  const mainContentText = asText(docData.main_article_content);
  const articleBody = mainContentText || undefined;

  // Build author JSON-LD - support multiple authors
  const authorJsonLd = authors.length > 1
    ? authors.map((author: any) => {
        const authorImageWithAlt = withFallbackAlt(author.image, author.name || "Author");
        return {
          "@type": "Person" as const,
          name: author.name,
          ...(authorImageWithAlt?.url ? { image: authorImageWithAlt.url } : {}),
        };
      })
    : {
        "@type": "Person" as const,
        name: primaryAuthor.name,
        ...(primaryAuthor.image?.url ? { image: withFallbackAlt(primaryAuthor.image, primaryAuthor.name)?.url } : {}),
      };

  const blogPostingJsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: headingText || doc.uid,
    description:
      docData.meta_description ||
      (mainContentText ? mainContentText.slice(0, 320) : undefined),
    url: canonicalUrl,
    mainEntityOfPage: canonicalUrl,
    datePublished: docData.publication_date || undefined,
    dateModified: docData.publication_date || undefined,
    image: articleImageWithAlt?.url || undefined,
    author: authorJsonLd,
    publisher: {
      "@type": "Organization",
      name: "Surim",
      url: SITE_URL,
    },
    ...(articleBody ? { articleBody } : {}),
  };

  const breadcrumbJsonLd: WithContext<BreadcrumbList> = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${SITE_URL}/blog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: headingText || doc.uid,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <JsonLdServer data={blogPostingJsonLd} />
      <JsonLdServer data={breadcrumbJsonLd} />
      <main className="bg-black text-white mb-15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen mt-50">
        <article>
          <div className="container grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Hero text content wrapper */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div>{asText(docData.category)}</div>
                <div className="flex gap-2">
                  <div className="italic">
                    <time dateTime={`${docData.publication_date}`}>{formatDate(docData.publication_date)}</time>
                  </div>
                  <span aria-hidden="true">&#8226;</span>
                  <div>
                    <span>{readingTime >= 10 ? `${readingTime}+` : readingTime} min read</span>
                  </div>
                </div>
              </div>
              <div className="mb-10">
                <PrismicRichText
                  field={docData.blog_article_heading}
                  components={{heading1: ({children}) => <h1 className="text-6xl">{children}</h1>}}/>
              </div>
              <div className="flex gap-10">
                <div className="flex items-center gap-2">
                  {authors.length === 1 ? (
                    <>
                      <AuthorAvatar name={authors[0].name} image={authors[0].image} size={40} />
                      <span>By {authors[0].name}</span>
                    </>
                  ) : authors.length > 1 ? (
                    <>
                      <div className="flex -space-x-2">
                        {authors.slice(0, 3).map((author: any, index: number) => (
                          <div key={index} className="border-2 border-black rounded-full">
                            <AuthorAvatar name={author.name} image={author.image} size={40} />
                          </div>
                        ))}
                      </div>
                      <span>By {authorDisplayNames}</span>
                    </>
                  ) : (
                    <span>By Surim</span>
                  )}
                </div>
                <div className="flex items-center">
                  <Eye className="mr-1" />
                  <ViewCounter articleUid={uid} />
                </div>
              </div>
            </div>
            {/* Hero Image Wrapper */}
            <div>
              {articleImageWithAlt?.url ? (
                <PrismicNextImage
                  field={articleImageWithAlt}
                  className="rounded-2xl"
                />
              ) : null}
            </div>
          </div>
          {/* Table of Contents and Main content */}
          <div className="container grid grid-cols-1 gap-20 lg:grid-cols-[1fr_1.5fr_5%] lg:gap-10 mt-20">
            {/* Table of Contents and share links */}
            <TableOfContents
              mainArticleContent={docData.main_article_content}
            />
            <div>
              <div className="mb-20">
                <PrismicRichText
                  field={docData.main_article_content}
                  // Add ids to headings for linking from TOC
                  // Define scroll offset for headings
                  components={{
                    heading2: ({ text, children}) => <h2 className="scroll-mt-28" id={createID(text || "")}>{children}</h2>,
                    heading3: ({ text, children}) => <h3 className="scroll-mt-28" id={createID(text || "")}>{children}</h3>,
                    heading4: ({ text, children}) => <h4 className="scroll-mt-28" id={createID(text || "")}>{children}</h4>,
                    heading5: ({ text, children}) => <h5 className="scroll-mt-28" id={createID(text || "")}>{children}</h5>,
                    heading6: ({ text, children}) => <h6 className="scroll-mt-28" id={createID(text || "")}>{children}</h6>,
                    list: ({ children }) => <ul className="ms-8 my-8 list-inside list-disc">{children}</ul>,
                    oList: ({ children }) => <ol className="ms-8 my-8 list-inside list-decimal">{children}</ol>,
                    listItem: ({ children }) => <li className="my-5 first:my-0 last:my-0">{children}</li>,
                    oListItem: ({ children }) => <li className="my-5 first:my-0 last:my-0">{children}</li>,
                  }}/>
              </div>
              {/* FAQs: see `faq/index.ts` */}
              <div className="mb-16">
                <div className="mx-auto">
                  <div className="text-3xl font-bold text-white mb-12">
                    <PrismicRichText field={faqHeading} />
                  </div>

                  <div className="space-y-4">
                    {faqs?.map((item, index) => (
                      <div
                        key={index}
                        className="bg-[#1f2937] rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
                      >
                        <details className="group">
                          <summary className="w-full flex justify-between items-center p-6 text-left cursor-pointer focus:outline-none list-none">
                            <h3 className="text-lg font-semibold text-white pr-4">
                              {item.question}
                            </h3>
                            <ChevronDown className="w-6 h-6 text-white flex-shrink-0 transition-transform duration-300 group-open:rotate-180" />
                          </summary>
                          <div className="p-6 pt-0 text-gray-300 prose prose-invert max-w-none">
                            <PrismicRichText field={item.answer} />
                          </div>
                        </details>
                      </div>
                  ))}
                </div>
              </div>
              </div>
              {/* End FAQs section */}
              {/* Article written by section */}
              {authors.length > 0 ? (
                <div className="space-y-6">
                  <h4 className="text-2xl font-bold">
                    {authors.length === 1 ? "Article Written by" : "Co-Authors"}
                  </h4>
                  {authors.map((author: any, index: number) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 sm:grid-cols-[3fr_1fr] sm:gap-x-2 p-6 bg-[#1f2937] rounded-lg"
                    >
                      <div className="order-2 sm:order-1">
                        <h3 className="mt-0! font-bold">{author.name}</h3>
                        {author.bio ? <p>{author.bio}</p> : null}
                        {author.uid ? (
                          <Link
                            href={`/blog/authors/${author.uid}`}
                            className="inline-flex items-center justify-center px-5 py-2 mt-4 text-sm font-semibold text-black bg-cyan-300 rounded-full hover:bg-cyan-200 transition-colors no-underline"
                          >
                            More from {author.name}
                          </Link>
                        ) : null}
                      </div>
                      <div className="order-1 sm:order-2 flex justify-center sm:justify-end">
                        <AuthorAvatar name={author.name} image={author.image} size={150} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {/* End Article written by section */}
            </div>
          </div>
        </article>
      </div>
      </main>
    </>
  );
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const { uid } = await params;
  const doc = (await (client as any)
  .getByUID("blog_post", uid)
  .catch(() => null)) as BlogPostDocument | null;
  if (!doc) {
    return {
      title: "Surim",
      description: "Welcome to Surim's official blog post page."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData, false, false, ['blog',uid]);
}

// Static generation for known UIDs (optional)
export async function generateStaticParams() {
  const client = createClient();
  const docs = (await (client as any).getAllByType("blog_post")) as BlogPostDocument[];
  return docs.map((d: BlogPostDocument) => ({ uid: d.uid! }));
}
