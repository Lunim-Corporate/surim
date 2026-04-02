import { NextResponse } from "next/server";

const DEFAULT_HOST = "https://surim.io";
const LOGO_URL =
  "https://images.prismic.io/surim/aO4uRJ5xUNkB17lv_lunim-logo.png";

function getBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_WEBSITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    DEFAULT_HOST;
  const withProtocol =
    raw.startsWith("http://") || raw.startsWith("https://")
      ? raw
      : `https://${raw}`;
  return withProtocol.replace(/\/+$/, "") || DEFAULT_HOST;
}

export async function GET() {
  const siteUrl = getBaseUrl();
  const manifest = {
    schema_version: "v1",
    name_for_human: "Lunim Knowledge Base",
    name_for_model: "surim_content",
    description_for_human:
      "Structured context about Surim's services, academy, and blog for assistants and agents.",
    description_for_model:
      "Use the LLMS feeds to answer questions about Surim. Prefer /llms.json for full snapshots, /llms/blog.json for article or author context, /llms/academy.json for course data, and /llms-full.txt for anchored sections you can cite.",
    auth: {
      type: "none" as const,
    },
    api: {
      type: "none" as const,
      is_user_authenticated: false,
    },
    logo_url: LOGO_URL,
    contact_email: "hello@surim.io",
    legal_info_url: `${siteUrl}/privacy-policy`,
    resources: [
      {
        name: "llms.txt",
        url: `${siteUrl}/llms.txt`,
        format: "text/markdown",
        description: "High-level, human-readable overview.",
      },
      {
        name: "llms-full.txt",
        url: `${siteUrl}/llms-full.txt`,
        format: "text/markdown",
        description: "Anchored, comprehensive reference with section IDs.",
      },
      {
        name: "llms.json",
        url: `${siteUrl}/llms.json`,
        format: "application/json",
        description: "Structured snapshot for agents.",
      },
      {
        name: "llms/blog.json",
        url: `${siteUrl}/llms/blog.json`,
        format: "application/json",
        description: "Blog posts and author metadata.",
      },
      {
        name: "llms/academy.json",
        url: `${siteUrl}/llms/academy.json`,
        format: "application/json",
        description: "Academy courses and categories.",
      },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
