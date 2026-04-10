"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { asLink } from "@prismicio/helpers";
import type { LinkField } from "@prismicio/client";
import { JsonLd } from "@/components/JsonLd";
import { SITE_CONFIG } from "@/lib/siteContent";
import type { BreadcrumbList, ListItem, WithContext } from "schema-dts";

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

type BreadcrumbsClientProps = {
  siteData: {
    main: {
      sections: Section[];
      hiddenSegments: string[];
    };
  };
};

const DEFAULT_SITE_URL = "https://surim.io";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || DEFAULT_SITE_URL;

const resolveLinkField = (link: LinkField | null | undefined): string | null => {
  if (!link) return null;
  try {
    const url = asLink(link);
    if (!url) return null;
    const clean = url.split("#")[0]?.split("?")[0] ?? url;
    if (!clean) return "/";
    if (clean === "/") return "/";
    return clean.replace(/\/+$/, "");
  } catch {
    return null;
  }
};

const normalizePath = (value: string | null): string | null => {
  if (!value) return null;
  if (value === "/") return "/";
  return value.replace(/\/+$/, "");
};

const SEGMENT_LABEL_OVERRIDES: Record<string, string> = {
  digital: "Digital",
  ai: "AI",
  "case-studies": "Case Studies",
  marketing: "Marketing",
  "marketing-academy": "Marketing",
  web3: "Web3",
  tabb: "Community",
};

const labelFromSegment = (segment: string): string => {
  const decoded = decodeURIComponent(segment);
  const override = SEGMENT_LABEL_OVERRIDES[decoded.toLowerCase()];
  if (override) return override;

  return decoded
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

export default function BreadcrumbsClient({ siteData }: BreadcrumbsClientProps) {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname) ?? "/";

  const { sections, hiddenSegments } = siteData.main;

  const segments = useMemo(() => {
    if (currentPath === "/") return [];
    return currentPath.split("/").filter(Boolean);
  }, [currentPath]);

  const hiddenSet = useMemo(
    () => new Set((hiddenSegments ?? []).map((s) => s.toLowerCase())),
    [hiddenSegments]
  );

  const pathLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach((section) => {
      const sectionPath = normalizePath(resolveLinkField(section.link));
      if (sectionPath) map.set(sectionPath, section.label);

      section.children.forEach((child) => {
        const childPath = normalizePath(resolveLinkField(child.link));
        if (childPath) map.set(childPath, child.label);
      });
    });
    return map;
  }, [sections]);

  const crumbs = useMemo(() => {
    const items: { href: string; label: string }[] = [];
    items.push({ href: "/", label: "Home" });

    let acc = "";
    segments.forEach((seg) => {
      acc += `/${seg}`;
      if (hiddenSet.has(seg.toLowerCase())) return;

      const label =
        SEGMENT_LABEL_OVERRIDES[seg.toLowerCase()] ??
        pathLabelMap.get(acc) ??
        labelFromSegment(seg);

      items.push({ href: acc, label });
    });

    return items;
  }, [segments, pathLabelMap, hiddenSet]);

  const breadcrumbJsonLd = useMemo<WithContext<BreadcrumbList>>(() => {
    const baseUrl = SITE_CONFIG.main.baseUrl || SITE_URL;
    const toAbsoluteUrl = (path: string) =>
      path === "/" ? baseUrl : `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

    const itemListElement: ListItem[] = crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.label,
      item: toAbsoluteUrl(crumb.href),
    }));

    return {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement,
    };
  }, [crumbs]);

  if (segments.length < 1) return null;

  const lastIndex = crumbs.length - 1;

  return (
    <>
      <JsonLd data={breadcrumbJsonLd} id="breadcrumb-schema" />
      <nav
        aria-label="Breadcrumb"
        className="w-full border-b border-white/10 bg-black/30/80 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex flex-wrap items-center gap-1 text-[11px] sm:text-xs md:text-sm text-white/55">
            {crumbs.map((crumb, index) => {
              const isLast = index === lastIndex;
              return (
                <li key={crumb.href} className="mb-0 flex items-center min-w-0">
                  {index > 0 && (
                    <ChevronRight
                      className="w-3 h-3 sm:w-3.5 sm:h-3.5 mx-1 text-white/60"
                      aria-hidden="true"
                    />
                  )}
                  {isLast ? (
                    <span className="text-white/70 truncate max-w-[200px] sm:max-w-none lowercase">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-[#BBFEFF]/80 hover:text-white underline-offset-4 transition-colors truncate max-w-[140px] sm:max-w-none lowercase no-underline"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
