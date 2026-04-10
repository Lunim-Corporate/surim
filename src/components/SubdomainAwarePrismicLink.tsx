"use client";

import { PrismicNextLink, PrismicNextLinkProps } from "@prismicio/next";
import { asLink } from "@prismicio/helpers";
import { useMemo, useEffect, useState } from "react";

/**
 * A wrapper around PrismicNextLink that strips subdomain routing prefixes
 * when displaying URLs on the subdomain itself.
 *
 * Example: On ai.surim.io, /ai-automation/page becomes /page
 * Example: On video.surim.io, /video/page becomes /page
 */
export function SubdomainAwarePrismicLink(props: PrismicNextLinkProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const transformedProps = useMemo(() => {
    // If no field prop, return as-is
    if (!("field" in props) || !props.field) return props;

    // Only transform after client hydration
    if (!isClient) return props;

    const hostname = window.location.hostname;
    const subdomain = hostname.split(".")[0];

    // Define prefix mapping
    const subdomainPrefixMap: Record<string, string> = {
      "ai": "/ai-automation",
      "ux": "/ux",
      "video-next": "/video",
    };

    // Only transform for known subdomains
    if (!(subdomain in subdomainPrefixMap) || hostname.startsWith("www")) {
      return props;
    }

    const prefix = subdomainPrefixMap[subdomain];

    // Get the resolved URL
    const url = asLink(props.field);
    if (!url || typeof url !== "string") return props;

    // Strip prefix if present
    if (url.startsWith(prefix)) {
      const newUrl = url.replace(new RegExp(`^${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), "") || "/";

      // Return modified props with transformed field
      return {
        ...props,
        field: {
          ...props.field,
          url: newUrl,
        },
      } as PrismicNextLinkProps;
    }

    return props;
  }, [props, isClient]);

  return <PrismicNextLink {...(transformedProps as any)} />;
}
