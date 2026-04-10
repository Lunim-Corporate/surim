"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pageview } from "@/lib/gtag";

export default function AnalyticsProvider({
  children,
  disabled = false,
}: {
  children: React.ReactNode;
  disabled?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString();

  useEffect(() => {
    if (disabled) return;
    if (!pathname) return;

    const url = search
      ? `${pathname}?${search}`
      : pathname;

    // fire a page_view on every route change
    pageview(url);
  }, [pathname, search, disabled]);

  return <>{children}</>;
}
