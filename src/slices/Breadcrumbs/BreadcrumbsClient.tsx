"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { asLink } from "@prismicio/helpers";
import type { LinkField } from "@prismicio/types";
import { JsonLd } from "@/components/JsonLd";
import { SITE_CONFIG, type SiteKey } from "@/lib/siteContent";
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
  siteData: Record<
    SiteKey,
    {
      sections: Section[];
      hiddenSegments: string[];
    }
  >;
};

const DEFAULT_SITE_URL = "https://surim.io";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || DEFAULT_SITE_URL;
const INTERNAL_PREFIX_BY_SITE: Partial<Record<SiteKey, string>> = {
  ai: "/ai-automation",
  ux: "/ux",
  video: "/video",
};

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

// Optional nice labels for known segments
const SEGMENT_LABEL_OVERRIDES: Record<string, string> = {
  digital: "Digital",
  ai: "AI",
  "case-studies": "Case Studies",
  marketing: "Marketing",
  "marketing-academy": "Marketing",
  web3: "Web3",
  tabb: "Community",
};
// Add more slug-based overrides here if needed, e.g. "ai-whatsapp-interactor": "AI Whatsapp Interactor",

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

export default function BreadcrumbsClient({
  siteData,
}: BreadcrumbsClientProps) {
  const pathname = usePathname();
  const currentPath = normalizePath(pathname) ?? "/";
  const hostInfo = useMemo(() => {
    if (typeof window === "undefined") {
      return {
        hostname: "",
        siteKey: null as SiteKey | null,
      };
    }

    const hostname = window.location.hostname;
    const subdomain = hostname.split(".")[0];

    if (subdomain === "ai" && !hostname.startsWith("www")) {
      return { hostname, siteKey: "ai" as SiteKey };
    }
    if (subdomain === "ux" && !hostname.startsWith("www")) {
      return { hostname, siteKey: "ux" as SiteKey };
    }
    if (subdomain === "video-next" && !hostname.startsWith("www")) {
      return { hostname, siteKey: "video" as SiteKey };
    }

    return { hostname, siteKey: null };
  }, []);

  const segments = useMemo(() => {
    if (currentPath === "/") {
      return [];
    }
    return currentPath.split("/").filter(Boolean);
  }, [currentPath]);

  const resolvedSiteKey = useMemo<SiteKey>(() => {
    if (hostInfo.siteKey) {
      return hostInfo.siteKey;
    }

    if (currentPath === "/ai-automation" || currentPath.startsWith("/ai-automation/")) {
      return "ai";
    }
    if (currentPath === "/ux" || currentPath.startsWith("/ux/")) {
      return "ux";
    }
    if (currentPath === "/video" || currentPath.startsWith("/video/")) {
      return "video";
    }

    return "main";
  }, [currentPath, hostInfo.siteKey]);

  const { sections, hiddenSegments } = siteData[resolvedSiteKey];
  const isSubdomainHost = hostInfo.siteKey === resolvedSiteKey && resolvedSiteKey !== "main";
  const internalPrefix = INTERNAL_PREFIX_BY_SITE[resolvedSiteKey] ?? "";

  const toPublicPath = useMemo(
    () => (path: string | null): string | null => {
      if (!path) return null;
      if (!isSubdomainHost || !internalPrefix) return path;
      if (path === internalPrefix) return "/";
      if (path.startsWith(`${internalPrefix}/`)) {
        return path.slice(internalPrefix.length) || "/";
      }
      return path;
    },
    [internalPrefix, isSubdomainHost]
  );

  const hiddenSet = useMemo(
    () => new Set((hiddenSegments ?? []).map((s) => s.toLowerCase())),
    [hiddenSegments]
  );

  const showBreadcrumbs = segments.length >= 1;

  // Determine home path and label based on site context
  const homeConfig = useMemo(() => {
    if (resolvedSiteKey === "ai") {
      return { href: isSubdomainHost ? "/" : "/ai-automation", label: "Home" };
    }
    if (resolvedSiteKey === "ux") {
      return { href: isSubdomainHost ? "/" : "/ux", label: "Home" };
    }
    if (resolvedSiteKey === "video") {
      return { href: isSubdomainHost ? "/" : "/video", label: "Home" };
    }
    return { href: "/", label: "Home" };
  }, [isSubdomainHost, resolvedSiteKey]);

  // Build a path -> label map from navigation
  const pathLabelMap = useMemo(() => {
    const map = new Map<string, string>();

    sections.forEach((section) => {
      const sectionPath = normalizePath(
        toPublicPath(resolveLinkField(section.link))
      );
      if (sectionPath) {
        map.set(sectionPath, section.label);
      }

      section.children.forEach((child) => {
        const childPath = normalizePath(
          toPublicPath(resolveLinkField(child.link))
        );
        if (childPath) {
          map.set(childPath, child.label);
        }
      });
    });

    return map;
  }, [sections, toPublicPath]);

  const crumbs = useMemo(() => {
    const items: { href: string; label: string }[] = [];

    // Home
    items.push({ href: "/", label: "Home" });

    let acc = "";
    segments.forEach((seg) => {
      acc += `/${seg}`;
      const href = acc;

      const segLower = seg.toLowerCase();

      // Skip routing-only segments that should not appear as separate crumbs.
      if (hiddenSet.has(segLower)) {
        return;
      }

      const overrideLabel = SEGMENT_LABEL_OVERRIDES[segLower];
      const navLabel = pathLabelMap.get(href);
      const baseLabel = labelFromSegment(seg);
      const label = overrideLabel ?? navLabel ?? baseLabel;

      items.push({ href, label });
    });

    return items;
  }, [segments, pathLabelMap, hiddenSet]);

  const breadcrumbJsonLd = useMemo<WithContext<BreadcrumbList>>(() => {
    const siteBaseUrl = SITE_CONFIG[resolvedSiteKey].baseUrl || SITE_URL;
    const toAbsoluteUrl = (path: string): string => {
      if (!path || path === "/") {
        return siteBaseUrl;
      }
      return `${siteBaseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    };

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
  }, [crumbs, resolvedSiteKey]);

  if (!showBreadcrumbs) {
    return null;
  }

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
