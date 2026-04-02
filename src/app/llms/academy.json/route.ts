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
          courses: stats.courses,
          categories: collections.courseCategories.length,
        },
        categories: collections.courseCategories,
        courses: collections.courses,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300",
        },
      }
    );
  } catch (error) {
    console.error("Error generating llms/academy.json:", error);
    return NextResponse.json(
      {
        error: "Unable to generate academy dataset",
        generatedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
