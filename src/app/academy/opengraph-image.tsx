import { createClient } from "../../prismicio";
import { generateOgImageResponse } from "@/lib/ogImage";

// Options for the generated Open Graph image
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Fetch data for the Open Graph image
const client = createClient();
const doc = await client.getSingle("academy").catch(() => null);
const title = doc?.data?.meta_title ?? "Academy";
const backgroundImg = doc?.data?.meta_image?.url;

export default async function Image() {
    return generateOgImageResponse(title, backgroundImg, size as { width: number; height: number });
}