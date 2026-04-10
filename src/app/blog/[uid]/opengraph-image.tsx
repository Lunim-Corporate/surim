import { createClient } from "../../../prismicio";
import { generateOgImageResponse } from "@/lib/ogImage";

// Options for the generated Open Graph image
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { uid: string };
}) {
  const client = createClient();
  const doc = await client.getByUID("blog_post", params.uid).catch(() => null);

  const title = doc?.data?.meta_title ?? "Blog Post";
  const backgroundImg = doc?.data?.meta_image?.url;

  return generateOgImageResponse(title, backgroundImg, size as { width: number; height: number });
}