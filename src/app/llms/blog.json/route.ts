import { NextResponse } from "next/server";
import { buildLlmsSnapshot } from "@/lib/llmsSnapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await buildLlmsSnapshot();
    const { generatedAt, metadata, stats, collections } = snapshot;

    return NextResponse.json(
      {
        generatedAt,
        snapshotId: metadata.changeHash,
        totals: {
          blogPosts: stats.blogPosts,
          authors: stats.authors,
          categories: collections.blogCategories.length,
        },
        categories: collections.blogCategories,
        posts: collections.blogPosts,
        authors: collections.authors,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (error) {
    console.error("Error generating llms/blog.json:", error);
    return NextResponse.json(
      {
        error: "Unable to generate blog dataset",
        generatedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
