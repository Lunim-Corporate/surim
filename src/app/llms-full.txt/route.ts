import { NextResponse } from "next/server";
import { buildLlmsSnapshot } from "@/lib/llmsSnapshot";

export const dynamic = "force-dynamic";

const CORE_SERVICES = [
  "Custom Software Development",
  "AI/ML Integration and Consulting",
  "Digital Transformation Solutions",
  "Technology Training and Academy Programs",
  "Luna AI Assistant Integration",
];

const FRONTEND_STACK = [
  "**Framework**: Next.js 15.5.4 with App Router",
  "**React**: 19.1.0",
  "**Styling**: Tailwind CSS v4.1.14",
  "**Animations**: GSAP 3.13.0, Framer Motion 12.23.22, React TSParticles 2.12.2",
  "**Icons**: Lucide React 0.545.0",
  "**Fonts**: Inter + Noto Sans Display via @fontsource",
];

const BACKEND_STACK = [
  "**CMS**: Prismic with SliceMachine",
  "**Database**: Supabase 2.74.0",
  "**Payments**: Stripe 19.1.0",
  "**Email**: Resend 6.4.2 + React Email 2.0.0",
  "**Events**: Eventbrite API Integration",
  "**Deployment**: Netlify with Next.js plugin",
  "**Build Tooling**: Next.js / Turbopack",
];

const KEY_FEATURES = [
  "Dynamic, slice-driven content management",
  "Stripe checkout for academy enrollments",
  "Luna AI assistant endpoints (conversation, TTS, Whisper)",
  "Real-time analytics + view tracking via Supabase",
  "Course management with Eventbrite",
  "Contact form with Resend-powered notifications",
  "Rich SEO metadata + schema generation",
  "Performance optimizations (ISR, image/font optimization)",
];

const DOCUMENT_TYPES = [
  "homepage (single)",
  "academy (single)",
  "academy_course (repeatable)",
  "blog_home_page (single)",
  "blog_post (repeatable)",
  "author (repeatable)",
  "our_team_page (single)",
  "case_study_sm (repeatable)",
  "privacy_policy (single)",
  "digital_page (repeatable)",
  "footer (single)",
  "primary_navigation (single)",
];

const MACHINE_FEEDS = [
  { path: "/llms.txt", detail: "High-level Markdown summary" },
  { path: "/llms.json", detail: "Structured JSON snapshot" },
  { path: "/llms/blog.json", detail: "Blog + author focused dataset" },
  { path: "/llms/academy.json", detail: "Academy course dataset" },
  { path: "/llms-full.txt", detail: "This comprehensive reference" },
];

function truncate(text: string, limit = 150) {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
}

function formatSliceSection(title: string, slices: { sliceType: string; variation: string; itemCount: number; }[]) {
  if (!slices.length) return `### ${title}\nNo slices available.\n`;
  const rows = slices
    .map(
      (slice, index) =>
        `  ${index + 1}. **${slice.sliceType}** (variation: ${slice.variation})\n     - Items: ${slice.itemCount}`
    )
    .join("\n");
  return `### ${title}\n${rows}\n`;
}

function formatListSection(id: string, title: string, body: string) {
  return `## [${id}] ${title}\n${body}\n`;
}

export async function GET() {
  try {
    const snapshot = await buildLlmsSnapshot();
    const {
      site,
      stats,
      structures,
      collections,
      apiRoutes,
      pages,
      generatedAt,
      metadata,
    } = snapshot;

    const courseDetails =
      collections.courses
        .map(
          (course) => `### ${course.title}
- UID: ${course.uid}
- Category: ${course.category || "Uncategorized"}
- Price: ${course.price || "Contact for pricing"}
- Description: ${truncate(course.description, 200)}
- Slices: ${course.sliceCount}
- Last Published: ${course.lastPublishedAt || "N/A"}
- URL: ${course.url}`
        )
        .join("\n\n") || "No courses available.";

    const blogDetails =
      collections.blogPosts
        .slice(0, 20)
        .map(
          (post, index) => `  ${index + 1}. **${post.heading || post.title}**
     - UID: ${post.uid}
     - Author: ${post.authorUid || "Unknown"}
     - Category: ${post.category || "Uncategorized"}
     - Published: ${post.firstPublishedAt || "N/A"}
     - Excerpt: ${truncate(post.excerpt || "", 180)}
     - URL: ${post.url}`
        )
        .join("\n\n") || "  No blog posts available.";

    const authorDetails =
      collections.authors
        .map(
          (author) => `### ${author.name}
- UID: ${author.uid}
- Bio: ${truncate(author.bio || "", 200)}
- Has Profile Image: ${author.hasImage ? "Yes" : "No"}
- Articles Written: ${author.articleCount}
- Profile URL: ${author.profileUrl}`
        )
        .join("\n\n") || "No authors available.";

    const caseStudyDetails =
      collections.caseStudies
        .map(
          (study) => `### ${study.title}
- UID: ${study.uid}
- Client: ${study.client}
- Industry: ${study.industry}
- Description: ${truncate(study.description || "", 200)}
- Published: ${study.publishedAt || "N/A"}`
        )
        .join("\n\n") || "No case studies available.";

    const sliceSections = [
      formatSliceSection("Homepage Slices", structures.homepage),
      formatSliceSection("Academy Page Slices", structures.academy),
      formatSliceSection("Blog Home Page Slices", structures.blogHome),
      formatSliceSection("Our Team Page Slices", structures.ourTeam),
    ].join("\n");

    const header = `# Surim.io - Complete Site Documentation (LLMs Full)

> Snapshot generated: ${generatedAt}
> Snapshot ID: ${metadata.changeHash}
> Machine feeds: ${MACHINE_FEEDS.map((feed) => `${feed.path}`).join(", ")}
`;

    const metaSection = formatListSection(
      "meta",
      "Snapshot Metadata",
      `- Source URL: ${site.url}
- Snapshot ID: ${metadata.changeHash}
- Generated At: ${generatedAt}
- Blog Posts: ${stats.blogPosts}
- Courses: ${stats.courses}
- Authors: ${stats.authors}
- Case Studies: ${stats.caseStudies}
- Pages Indexed: ${stats.pages}
- API Endpoints: ${stats.apiRoutes}`
    );

    const overviewSection = formatListSection(
      "site_overview",
      "Site Overview",
      `${site.description}`
    );

    const servicesSection = formatListSection(
      "core_services",
      "Core Services",
      CORE_SERVICES.map((service) => `- ${service}`).join("\n")
    );

    const techSection = formatListSection(
      "technology_stack",
      "Technology Stack",
      `### Frontend
${FRONTEND_STACK.map((item) => `- ${item}`).join("\n")}

### Backend & Infrastructure
${BACKEND_STACK.map((item) => `- ${item}`).join("\n")}
`
    );

    const featuresSection = formatListSection(
      "key_features",
      "Key Features",
      KEY_FEATURES.map((item) => `- ${item}`).join("\n")
    );

    const contentSection = formatListSection(
      "content_management",
      "Content Management (Prismic CMS)",
      `### Document Types
${DOCUMENT_TYPES.map((doc) => `- ${doc}`).join("\n")}

### Unique Slice Types (${collections.sliceTypes.length})
${collections.sliceTypes.map((type) => `- ${type}`).join("\n")}
`
    );

    const academySection = formatListSection(
      "academy_courses",
      `Academy Courses (${stats.courses})`,
      `### Course Categories (${collections.courseCategories.length})
${collections.courseCategories.length ? collections.courseCategories.map((cat) => `- ${cat}`).join("\n") : "No categories"}

### Course Listings
${courseDetails}
`
    );

    const blogSection = formatListSection(
      "blog_content",
      `Blog Content (${stats.blogPosts} posts)`,
      `### Blog Categories (${collections.blogCategories.length})
${collections.blogCategories.length ? collections.blogCategories.map((cat) => `- ${cat}`).join("\n") : "No categories"}

### Recent Posts (Latest 20)
${blogDetails}
`
    );

    const authorSection = formatListSection(
      "authors",
      `Content Authors (${stats.authors})`,
      authorDetails
    );

    const caseStudySection = formatListSection(
      "case_studies",
      `Case Studies (${stats.caseStudies})`,
      caseStudyDetails
    );

    const structureSection = formatListSection(
      "page_structures",
      "Slice Structures",
      sliceSections
    );

    const pagesSection = formatListSection(
      "site_pages",
      `Site Pages (${pages.length})`,
      pages.map((page) => `- ${page}`).join("\n")
    );

    const apiSection = formatListSection(
      "api_endpoints",
      `API Endpoints (${apiRoutes.length})`,
      apiRoutes.map((route) => `- ${route}`).join("\n")
    );

    const seoSection = formatListSection(
      "seo_metadata",
      "SEO & Metadata Configuration",
      `- Organization, Article, Course schema via schema-dts components
- Dynamic metadata per page via Prismic fields
- Automatic sitemap at /sitemap.xml
- robots.txt with API restrictions
- Open Graph + Twitter Card support
- Incremental Static Regeneration (60s revalidate)`
    );

    const feedsSection = formatListSection(
      "machine_feeds",
      "Machine-Readable Feeds",
      MACHINE_FEEDS.map((feed) => `- ${feed.path} — ${feed.detail}`).join("\n")
    );

    const workflowSection = formatListSection(
      "content_workflow",
      "Content Update Workflow",
      `1. Editors create/edit in Prismic\n2. Preview via /api/preview\n3. Publish in Prismic\n4. Webhook triggers revalidation (/api/revalidate)\n5. ISR refreshes pages within ~60 seconds`
    );

    const securitySection = formatListSection(
      "security_accessibility",
      "Security & Accessibility",
      `- Secure environment variables + webhook signature verification\n- HTTPS enforced across deployment\n- CORS controlled for API endpoints\n- Semantic HTML, headings, and ARIA-aware components`
    );

    const contactSection = formatListSection(
      "contact",
      "Contact Information",
      `- Website: ${site.url}\n- Organization: ${site.name}\n- Logo: ${site.logo}\n- Legal: ${site.url}/privacy-policy`
    );

    const content = [
      header,
      metaSection,
      overviewSection,
      servicesSection,
      techSection,
      featuresSection,
      contentSection,
      academySection,
      blogSection,
      authorSection,
      caseStudySection,
      structureSection,
      pagesSection,
      apiSection,
      seoSection,
      feedsSection,
      workflowSection,
      securitySection,
      contactSection,
    ].join("\n");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Error generating llms-full.txt:", error);

    const fallbackContent = `# Surim.io - Complete Site Documentation (Error)

An error occurred while generating the full site documentation.

## Error Details
Generated at: ${new Date().toISOString()}
Error: ${error instanceof Error ? error.message : "Unknown error"}

Please try accessing /llms.txt for basic site information, or contact support if this error persists.
`;

    return new NextResponse(fallbackContent, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
      status: 500,
    });
  }
}
