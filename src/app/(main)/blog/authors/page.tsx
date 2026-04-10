// app/blog/authors/page.tsx
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import type { Metadata, ResolvingMetadata } from "next";

import { createClient } from "@/prismicio";
import { type Content } from "@prismicio/client";
import { pickBaseMetadata } from "@/utils/metadata";
import { withImageAlt } from "@/lib/prismicImage";
import { generateMetaDataInfo } from "@/utils/generateMetaDataInfo";

export const dynamic = "force-static";

export default async function Page() {
  const client = createClient();

  const authors = (await (client as any).getAllByType("author", {
    orderings: [{ field: "my.author.author_name", direction: "asc" }],
  })) as Content.AuthorDocument[];

  return (
    <main className="bg-black text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <header className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-semibold mb-4">
            Meet Our Authors
          </h1>
          <p className="text-white/70">
            Explore articles written by our expert contributors. Browse their
            profiles to learn more and discover their latest posts.
          </p>
        </header>

        {authors.length ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {authors.map((author: Content.AuthorDocument) => {
              const name =
                author.data.author_name?.trim() || author.uid || "Author";
              const bio = author.data.author_bio?.trim() || "";
              const imageField = withImageAlt(
                author.data.author_image,
                name
              );
              const placeholderInitial =
                name && name.length > 0 ? name.charAt(0).toUpperCase() : "A";

              return (
                <article
                  key={author.id}
                  className="flex flex-col border border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors overflow-hidden"
                >
                  {imageField?.url ? (
                    <PrismicNextImage
                      field={imageField}
                      className="w-full h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-56 bg-white/10 flex items-center justify-center text-white/40 text-xl">
                      {placeholderInitial}
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-6 gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold mb-2">{name}</h2>
                      {bio ? (
                        <p className="text-white/70 line-clamp-4">{bio}</p>
                      ) : null}
                    </div>

                    <div className="mt-auto">
                      <PrismicNextLink
                        document={author}
                        className="inline-flex items-center justify-center px-5 py-2 rounded-full bg-cyan-300 text-black font-semibold hover:bg-cyan-200 transition-colors"
                      >
                        View profile
                      </PrismicNextLink>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border border-white/10 rounded-2xl p-10 text-center text-white/70">
            No authors found. Check back soon for new contributors.
          </div>
        )}
      </div>
    </main>
  );
}

export async function generateMetadata(
  _context: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // fetch data
  const client = createClient();
  const parentMetaData = await pickBaseMetadata(parent);
  const doc = (await (client as any)
  .getSingle("authors")
  .catch(() => null)) as any;
  if (!doc) {
    return {
      title: "Surim",
      description: "Welcome to Surim's official authors page."
    };
  }

  return generateMetaDataInfo(doc.data, parentMetaData);
}

// export async function generateMetadata(_context: unknown, parent: ResolvingMetadata) {
//   const pathname = "/blog/authors";

//   return getMetaDataInfo(pathname, parent);
//   }
