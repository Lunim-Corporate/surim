import { NextRequest } from "next/server";
import { redirectToPreviewURL } from "@prismicio/next";

import { createClient, linkResolver } from "../../../prismicio";

export async function GET(request: NextRequest) {
  const client = createClient();

  // Pass the linkResolver so Prismic can build complex/catch-all preview URLs
  return await redirectToPreviewURL({ client, request, linkResolver });
}
