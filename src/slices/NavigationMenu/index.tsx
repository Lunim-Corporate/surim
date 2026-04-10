import type { SliceComponentProps } from "@prismicio/react";
import type { Content } from "@prismicio/client";
import type { LinkField, KeyTextField } from "@prismicio/types";
import { createClient } from "@/prismicio";

// ⬇️ import only the client component, no types
import { NavigationMenuClient } from "./NavigationMenuClient";

// local type definitions for ChildLink and Section
type ChildLink = {
  label: string;
  link: LinkField;
};

type Section = {
  id: string;
  label: string;
  link: LinkField;
  children: ChildLink[];
};

export type NavigationMenuProps =
  SliceComponentProps<Content.NavigationMenuSlice>;

function isUsableLink(link: LinkField | null | undefined): link is LinkField {
  return !!link && link.link_type !== "Any";
}

export default async function NavigationMenuServer({
  slice,
}: NavigationMenuProps) {
  const client = createClient();

  // --- Logo & CTA ---
  const logoUrl = slice.primary.logo?.url ?? null;
  const logoAlt = slice.primary.logo?.alt ?? "Logo";
  const ctaLabel: KeyTextField =
    typeof slice.primary.cta_label === "string"
      ? slice.primary.cta_label
      : null;
  const ctaLink = isUsableLink(slice.primary.cta_link)
    ? slice.primary.cta_link
    : null;

  // --- Resolve referenced Nav Section documents in authored order ---
  const sectionsGroup: any[] = Array.isArray(slice.primary.sections)
    ? (slice.primary.sections as any[])
    : [];

  const ids = sectionsGroup
    .map((row: any) => row.section_ref)
    .map((ref: any) =>
      ref && ref.link_type === "Document" && typeof ref.id === "string"
        ? ref.id
        : null
    )
    .filter((id): id is string => !!id);

  let orderedDocs: Content.NavSectionDocument[] = [];
  if (ids.length) {
    try {
      const fetched = (await client.getAllByIDs(ids as any)) as any[];
      const byId = new Map(fetched.map((d: any) => [d.id, d]));
      orderedDocs = ids
        .map((id) => byId.get(id))
        .filter((d): d is Content.NavSectionDocument => !!d);
    } catch {
      orderedDocs = [];
    }
  }

  // --- Build payload that matches the client’s types (no null links) ---
  const sections: Section[] = orderedDocs
    .map((doc: any) => {
      const data = doc.data;

      // children: keep only rows with a usable link
      const children: ChildLink[] = (
        Array.isArray(data.child_links) ? data.child_links : []
      )
        .map((row: any, idx: number) => {
          const label =
            typeof row.child_label === "string" && row.child_label.trim()
              ? row.child_label.trim()
              : `Item ${idx + 1}`;
          const link = isUsableLink(row.child_link) ? row.child_link : null;
          return { label, link: link as LinkField };
        })
        .filter((r: any): r is ChildLink => !!r.link);

      // section link: require non-null; if empty, fall back to first child link
      const topLink = isUsableLink(data.section_link)
        ? data.section_link
        : null;
      const resolvedLink: LinkField | undefined = topLink ?? children[0]?.link;

      // if still no link, drop this section entirely
      if (!resolvedLink) return null;

      return {
        id: doc.id,
        label: typeof data.section_label === "string" ? data.section_label : "",
        link: resolvedLink, // non-null
        children, // array with non-null links
      } as Section;
    })
    .filter((s): s is Section => !!s);

  return (
    <NavigationMenuClient
      data={{
        logoUrl,
        logoAlt,
        ctaLabel: typeof ctaLabel === "string" ? ctaLabel : null,
        ctaLink, // LinkField | null (the client likely allows null here)
        sections, // strictly typed to local Section[]
      }}
    />
  );
}
