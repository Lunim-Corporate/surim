import { NextResponse } from "next/server";
import { buildLlmsSnapshot } from "@/lib/llmsSnapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await buildLlmsSnapshot();
    const { site, stats, apiRoutes, pages, collections, generatedAt, metadata } =
      snapshot;

    const coreServices = [
      "Custom Software Development",
      "AI/ML Integration and Consulting",
      "Digital Transformation Solutions",
      "Technology Training and Academy Programs",
      "Luna AI Assistant Integration",
    ];

    const techStack = [
      "**Framework**: Next.js 15 with App Router",
      "**CMS**: Prismic (Headless CMS)",
      "**Payment Processing**: Stripe",
      "**Database**: Supabase",
      "**Email**: Resend + React Email",
      "**Animation**: GSAP, Framer Motion",
      "**UI Components**: React 19, Lucide Icons",
      "**Styling**: Tailwind CSS v4",
    ];

    const keyFeatures = [
      "Dynamic Content Management via Prismic",
      "Stripe Payment Integration for Academy",
      "Luna AI Assistant with Voice Capabilities",
      "Real-time Analytics and View Tracking",
      "Course Management via Eventbrite Integration",
      "Contact Form with Email Notifications",
      "SEO-Optimized with Schema.org Markup",
      "Performance-Optimized with Image/Font Optimization",
    ];

    const machineFeeds = [
      { path: "/llms.txt", detail: "Human-readable snapshot (this file)" },
      { path: "/llms.json", detail: "Structured JSON snapshot" },
      { path: "/llms/blog.json", detail: "Blog + author specific dataset" },
      { path: "/llms/academy.json", detail: "Course and academy dataset" },
      { path: "/llms-full.txt", detail: "Comprehensive reference with anchors" },
    ];

    const displayedPages = pages.slice(0, 25);
    const remainingPages = pages.length - displayedPages.length;

    const content = `# Surim.io - Technology and Innovation Solutions

> Snapshot ID: ${metadata.changeHash}
> Generated: ${generatedAt}

## Site Overview
${site.description} We offer custom development services, consulting, and educational programs through our academy.

## Core Services
${coreServices.map((service) => `- ${service}`).join("\n")}

## Technology Stack
${techStack.map((item) => `- ${item}`).join("\n")}

## Key Features
${keyFeatures.map((item) => `- ${item}`).join("\n")}

## Content Statistics (Real-time)
- Active Courses: ${stats.courses}
- Published Blog Posts: ${stats.blogPosts}
- Content Authors: ${stats.authors}
- Homepage Sections: ${stats.homepageSlices}
- Academy Sections: ${stats.academySlices}
- Blog Home Sections: ${stats.blogHomeSlices}
- Our Team Sections: ${stats.ourTeamSlices}
- Case Studies: ${stats.caseStudies}

## Machine-Readable Feeds
${machineFeeds.map((feed) => `- ${feed.path} — ${feed.detail}`).join("\n")}

## API Endpoints (${apiRoutes.length} total)
${apiRoutes.map((route) => `- ${route}`).join("\n")}

## Page Map (${pages.length} entries)
${displayedPages.map((page) => `- ${page}`).join("\n")}${
      remainingPages > 0
        ? `\n- ...and ${remainingPages} more (see /llms-full.txt for the complete list)`
        : ""
    }

## Taxonomy
- Blog Categories: ${collections.blogCategories.join(", ") || "n/a"}
- Course Categories: ${collections.courseCategories.join(", ") || "n/a"}

## Contact Information
- Website: ${site.url}
- Organization Name: ${site.name}
- Logo: ${site.logo}
- Legal: ${site.url}/privacy-policy

## Development
- Repository: Private Git repository
- Build System: Next.js with Turbopack
- Deployment: Netlify
- Revalidation: ISR with 60-second intervals

---
This file is dynamically generated for AI/LLM optimization (AIO).
Snapshot: ${metadata.changeHash}
Generated on-demand at: ${generatedAt}
Content freshness: Real-time data from Prismic CMS
`;

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=300", // 5 minutes cache
      },
    });
  } catch (error) {
    console.error("Error generating llms.txt:", error);

    // Fallback static content if dynamic generation fails
    const fallbackContent = `# Surim.io - Technology and Innovation Solutions

> Human-readable description of the website
Lunim is a technology and innovation company providing cutting-edge solutions in software development, AI/ML integration, and digital transformation.

---
Error generating dynamic content. Please try again later.
Generated at: ${new Date().toISOString()}
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
