import { createClient } from "@/prismicio";
import { asText } from "@prismicio/helpers";
import { readdirSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

type SliceLike = { slice_type?: string; variation?: string; items?: unknown[] };

type SliceSummary = {
  sliceType: string;
  variation: string;
  itemCount: number;
};

type BlogPostSummary = {
  uid: string;
  title: string;
  heading: string;
  excerpt: string;
  authorUid: string | null;
  authorName: string | null;
  category: string | null;
  publicationDate: string | null;
  firstPublishedAt: string | null;
  url: string;
};

type CourseSummary = {
  uid: string;
  title: string;
  description: string;
  category: string | null;
  price: string | null;
  sliceCount: number;
  lastPublishedAt: string | null;
  url: string;
};

type AuthorSummary = {
  uid: string;
  name: string;
  bio: string;
  hasImage: boolean;
  articleCount: number;
  profileUrl: string;
};

type CaseStudySummary = {
  uid: string;
  title: string;
  client: string;
  industry: string;
  description: string;
  publishedAt: string | null;
};

export type LlmsSnapshot = {
  generatedAt: string;
  metadata: {
    changeHash: string;
  };
  site: {
    name: string;
    url: string;
    description: string;
    logo: string;
  };
  stats: {
    blogPosts: number;
    courses: number;
    authors: number;
    caseStudies: number;
    pages: number;
    apiRoutes: number;
    homepageSlices: number;
    academySlices: number;
    blogHomeSlices: number;
    ourTeamSlices: number;
  };
  apiRoutes: string[];
  pages: string[];
  structures: {
    homepage: SliceSummary[];
    academy: SliceSummary[];
    blogHome: SliceSummary[];
    ourTeam: SliceSummary[];
  };
  collections: {
    blogPosts: BlogPostSummary[];
    blogCategories: string[];
    courses: CourseSummary[];
    courseCategories: string[];
    authors: AuthorSummary[];
    caseStudies: CaseStudySummary[];
    sliceTypes: string[];
  };
};

const SITE_NAME = "Surim";
const SITE_DESCRIPTION =
  "Surim is a technology and innovation company providing cutting-edge solutions in software development, AI/ML integration, and digital transformation.";
const SITE_LOGO =
  "https://images.prismic.io/surim/aO4uRJ5xUNkB17lv_surim-logo.png";

function getBaseSiteUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_WEBSITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    "https://surim.io";
  const withProtocol =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "");
}

function summarizeSlices(slices?: SliceLike[] | null): SliceSummary[] {
  if (!Array.isArray(slices)) return [];
  return slices.map((slice) => ({
    sliceType: slice.slice_type || "unknown",
    variation: slice.variation || "default",
    itemCount: Array.isArray(slice.items) ? slice.items.length : 0,
  }));
}

function scanApiRoutes(): string[] {
  const apiRoutes: string[] = [];

  const scanDir = (dir: string, base = "/api") => {
    try {
      const entries = readdirSync(join(process.cwd(), "src/app", dir), {
        withFileTypes: true,
      });
      for (const entry of entries) {
        if (entry.isDirectory()) {
          scanDir(join(dir, entry.name), `${base}/${entry.name}`);
        } else if (entry.name === "route.ts" || entry.name === "route.tsx") {
          apiRoutes.push(base);
        }
      }
    } catch {
      // directory might not exist; ignore
    }
  };

  scanDir("api");
  return Array.from(new Set(apiRoutes)).sort();
}

function scanPages(): string[] {
  const pages = new Set<string>();

  const scanDir = (dir: string, base = "") => {
    try {
      const fullPath = join(process.cwd(), "src/app", dir);
      const entries = readdirSync(fullPath, { withFileTypes: true });

      for (const entry of entries) {
        const relativePath = dir ? join(dir, entry.name) : entry.name;
        if (entry.isDirectory()) {
          if (
            entry.name.startsWith("api") ||
            entry.name.startsWith("_") ||
            entry.name === "llms.txt" ||
            entry.name === "llms-full.txt"
          ) {
            continue;
          }

          let routeName = entry.name;
          if (entry.name.startsWith("[")) {
            routeName = entry.name.replace(/\[\.\.\.(\w+)\]/, "[...$1]");
          }
          const routePath = base ? `${base}/${routeName}` : `/${routeName}`;
          pages.add(routePath);

          scanDir(relativePath, routePath);
        } else if (entry.name === "page.tsx" || entry.name === "page.ts") {
          if (base) {
            pages.add(base);
          } else {
            pages.add("/");
          }
        }
      }
    } catch {
      // ignore
    }
  };

  scanDir("");
  pages.add("/");
  return Array.from(pages).sort();
}

function uniqueStrings(values: (string | null | undefined)[]) {
  return Array.from(
    new Set(
      values
        .map((value) => (typeof value === "string" ? value.trim() : ""))
        .filter(Boolean)
    )
  ).sort();
}

export async function buildLlmsSnapshot(): Promise<LlmsSnapshot> {
  const client = createClient();

  const [
    homepage,
    blogHomePage,
    academyPage,
    ourTeamPage,
    blogPosts,
    courses,
    authors,
    caseStudies,
  ] = await Promise.all([
    (client as any).getSingle("homepage").catch(() => null),
    (client as any).getSingle("blog_home_page").catch(() => null),
    (client as any).getSingle("academy").catch(() => null),
    (client as any).getSingle("our_team_page").catch(() => null),
    client.getAllByType("blog_post").catch(() => []),
    client.getAllByType("academy_course").catch(() => []),
    client.getAllByType("author").catch(() => []),
    client.getAllByType("case_study_sm").catch(() => []),
  ]);

  const homepageSlices = summarizeSlices(homepage?.data?.slices);
  const academySlices = summarizeSlices(academyPage?.data?.slices);
  const blogHomeSlices = summarizeSlices(blogHomePage?.data?.slices);
  const ourTeamSlices = summarizeSlices(ourTeamPage?.data?.slices);

  const blogEntries: BlogPostSummary[] = blogPosts.map((post: any) => {
    const heading = asText(post.data?.blog_article_heading || []) || "";
    const mainBodyText =
      asText(post.data?.main_article_content || []) || "";
    const excerpt =
      post.data?.meta_description ||
      mainBodyText.slice(0, 200) ||
      "";
    const category =
      typeof post.data?.category === "string"
        ? post.data.category
        : asText(post.data?.category || []) || null;
    const authorUid =
      typeof post.data?.author_info?.uid === "string"
        ? post.data.author_info.uid
        : null;
    const authorName =
      typeof post.data?.author_info?.data?.author_name === "string"
        ? post.data.author_info.data.author_name
        : null;
    const uid = post.uid || heading || "";
    return {
      uid,
      title: post.data?.title || heading || uid || "Untitled Post",
      heading,
      excerpt,
      authorUid,
      authorName,
      category,
      publicationDate: post.data?.publication_date || null,
      firstPublishedAt: post.first_publication_date || null,
      url: uid ? `/blog/${uid}` : "/blog",
    };
  });

  const courseEntries: CourseSummary[] = courses.map((course: any) => {
    const title =
      course.data?.course_title || course.uid || "Untitled Course";
    const description =
      typeof course.data?.course_description === "string"
        ? course.data.course_description
        : asText(course.data?.course_description || []) || "No description";
    return {
      uid: course.uid || title,
      title,
      description,
      category: course.data?.course_category || null,
      price: course.data?.course_price || null,
      sliceCount: Array.isArray(course.data?.slices)
        ? course.data.slices.length
        : 0,
      lastPublishedAt: course.last_publication_date || null,
      url: course.uid ? `/academy/${course.uid}` : "/academy",
    };
  });

  const authorEntries: AuthorSummary[] = authors.map((author: any) => {
    const name =
      author.data?.author_name || author.uid || "Unknown Author";
    const bio =
      typeof author.data?.author_bio === "string"
        ? author.data.author_bio
        : asText(author.data?.author_bio || []) || "";
    const articleCount = blogEntries.filter(
      (post) => post.authorUid === author.uid
    ).length;
    return {
      uid: author.uid || name,
      name,
      bio,
      hasImage: Boolean(author.data?.author_image?.url),
      articleCount,
      profileUrl: author.uid ? `/blog/authors/${author.uid}` : "/blog/authors",
    };
  });

  const caseStudyEntries: CaseStudySummary[] = caseStudies.map(
    (study: any) => {
      const title =
        study.data?.case_study_title || study.uid || "Untitled Case Study";
      const description =
        typeof study.data?.description === "string"
          ? study.data.description
          : asText(study.data?.description || []) || "";
      return {
        uid: study.uid || title,
        title,
        client: study.data?.client_name || "Confidential",
        industry: study.data?.industry || "Various",
        description,
        publishedAt: study.first_publication_date || null,
      };
    }
  );

  const blogCategories = uniqueStrings(
    blogEntries.map((post) => post.category)
  );
  const courseCategories = uniqueStrings(
    courseEntries.map((course) => course.category)
  );

  const collectSliceTypes = (docs: any[]): string[] => {
    const result: string[] = [];
    docs.forEach((doc) => {
      if (Array.isArray(doc?.data?.slices)) {
        doc.data.slices.forEach((slice: any) => {
          if (slice?.slice_type) {
            result.push(String(slice.slice_type));
          }
        });
      }
    });
    return result;
  };

  const allSliceTypes = uniqueStrings([
    ...homepageSlices.map((s) => s.sliceType),
    ...academySlices.map((s) => s.sliceType),
    ...blogHomeSlices.map((s) => s.sliceType),
    ...ourTeamSlices.map((s) => s.sliceType),
    ...collectSliceTypes(courses as any[]),
    ...collectSliceTypes(blogPosts as any[]),
    ...collectSliceTypes(caseStudies as any[]),
  ]);

  const apiRoutes = scanApiRoutes();
  const pages = scanPages();

  const hashPayload = JSON.stringify({
    blogEntries,
    courseEntries,
    authorEntries,
    caseStudyEntries,
    apiRoutes,
    pages,
  });
  const changeHash = createHash("sha1").update(hashPayload).digest("hex");

  const generatedAt = new Date().toISOString();

  return {
    generatedAt,
    metadata: {
      changeHash,
    },
    site: {
      name: SITE_NAME,
      url: getBaseSiteUrl(),
      description: SITE_DESCRIPTION,
      logo: SITE_LOGO,
    },
    stats: {
      blogPosts: blogEntries.length,
      courses: courseEntries.length,
      authors: authorEntries.length,
      caseStudies: caseStudyEntries.length,
      pages: pages.length,
      apiRoutes: apiRoutes.length,
      homepageSlices: homepageSlices.length,
      academySlices: academySlices.length,
      blogHomeSlices: blogHomeSlices.length,
      ourTeamSlices: ourTeamSlices.length,
    },
    apiRoutes,
    pages,
    structures: {
      homepage: homepageSlices,
      academy: academySlices,
      blogHome: blogHomeSlices,
      ourTeam: ourTeamSlices,
    },
    collections: {
      blogPosts: blogEntries,
      blogCategories,
      courses: courseEntries,
      courseCategories,
      authors: authorEntries,
      caseStudies: caseStudyEntries,
      sliceTypes: allSliceTypes,
    },
  };
}
