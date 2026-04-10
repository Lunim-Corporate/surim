import { NextResponse } from "next/server";
import { buildLlmsSnapshot } from "@/lib/llmsSnapshot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const snapshot = await buildLlmsSnapshot();
    return NextResponse.json(snapshot, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Error generating llms.json:", error);
    return NextResponse.json(
      {
        error: "Unable to generate LLMS snapshot",
        generatedAt: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}
