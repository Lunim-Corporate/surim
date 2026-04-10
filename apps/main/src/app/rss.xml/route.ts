import { createClient } from "@/prismicio";
import { asText, asHTML } from "@prismicio/helpers";
import type { Content } from "@prismicio/client";
type BlogPostDocument = Content.BlogPostDocument;

const DEFAULT_HOST = "https://surim.io";
const SITE_URL = getBaseUrl();

export const revalidate = 3600; // Revalidate every hour

export async function GET() {
  const client = createClient();
  const feedSelfUrl = `${DEFAULT_HOST}/rss.xml`;

  // Fetch all blog posts sorted by publication date
  const blogPosts = (await (client as any)
    .getAllByType("blog_post", {
      orderings: [
        { field: "my.blog_post.publication_date", direction: "desc" },
      ],
      fetchLinks: ["author.author_name"],
    })
    .catch(() => [])) as BlogPostDocument[];

  const rssItems = await Promise.all(
    blogPosts.map(async (post) => {
      const uid = post.uid;
      if (!uid) return null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const postData = post.data as any;

      const title = asText(postData.blog_article_heading || []) || uid;
      const rawArticleText = asText(postData.main_article_content || []) || "";
      const description =
        postData.meta_description ||
        rawArticleText.slice(0, 320) ||
        "";
      const contentHtmlRaw =
        asHTML(postData.main_article_content || []) || "";
      const contentHtml = absolutizeUrls(contentHtmlRaw);
      const link = `${SITE_URL}/blog/${encodeURIComponent(uid)}`;

      // Use first_publication_date if publication_date is in the future or missing
      const publicationDate = postData.publication_date
        ? new Date(postData.publication_date)
        : new Date(post.first_publication_date);

      const now = new Date();
      const pubDate = publicationDate > now
        ? new Date(post.first_publication_date).toUTCString()
        : publicationDate.toUTCString();

      // Get author name
      const authorInfo = postData.author_info;
      const authorData =
        authorInfo && "data" in authorInfo ? authorInfo.data : undefined;
      const authorName =
        (typeof authorData?.author_name === "string"
          ? authorData.author_name.trim()
          : "") || "Surim";

      // Get image URL and fetch content length for enclosure
      const imageField = postData.article_main_image;
      const imageUrl = imageField?.url || "";
      let imageLength = 0;
      let imageType = "image/jpeg";

      if (imageUrl) {
        try {
          const response = await fetch(imageUrl, { method: "HEAD" });
          const contentLength = response.headers.get("content-length");
          const contentType = response.headers.get("content-type");
          if (contentLength) imageLength = parseInt(contentLength, 10);
          if (contentType) imageType = contentType;
        } catch {
          // Fallback to estimate if HEAD request fails
          imageLength = 0;
        }
      }

      const categoryText = asText(postData.category || []);
      const imageAlt = imageField?.alt || title;
      const imageWidth = imageField?.dimensions?.width;
      const imageHeight = imageField?.dimensions?.height;

      return `
    <item>
      <title><![CDATA[${escapeXml(title)}]]></title>
      <description><![CDATA[${escapeXml(description)}]]></description>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <dc:creator><![CDATA[${escapeXml(authorName)}]]></dc:creator>${imageUrl && imageLength > 0 ? `
      <enclosure url="${escapeXml(imageUrl)}" length="${imageLength}" type="${imageType}" />` : ""}${categoryText ? `
      <category><![CDATA[${escapeXml(categoryText)}]]></category>` : ""}${contentHtml ? `
      <content:encoded>${wrapCdata(contentHtml)}</content:encoded>` : ""}${imageUrl ? `
      <media:content url="${escapeXml(imageUrl)}" type="${imageType}" medium="image"${imageWidth ? ` width="${imageWidth}"` : ""}${imageHeight ? ` height="${imageHeight}"` : ""}>
        ${imageAlt ? `<media:description>${wrapCdata(imageAlt)}</media:description>` : ""}
      </media:content>` : ""}
    </item>`;
    })
  );

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Surim Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Latest articles from Surim - Insights on technology, digital transformation, and innovation</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedSelfUrl}" rel="self" type="application/rss+xml" />
    ${rssItems.filter(Boolean).join("")}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
    },
  });
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapCdata(value: string): string {
  const safeValue = value.replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safeValue}]]>`;
}

function getBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_WEBSITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    DEFAULT_HOST;
  const normalized =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  return normalized.replace(/\/+$/, "") || DEFAULT_HOST;
}

function absolutizeUrls(html: string) {
  if (!html) return html;
  return html.replace(
    /(href|src)="\/(?!\/)([^"]*)"/g,
    (_match, attr, path) => {
      const normalizedPath = path ? `/${path}` : "/";
      return `${attr}="${SITE_URL}${normalizedPath}"`;
    }
  );
}
