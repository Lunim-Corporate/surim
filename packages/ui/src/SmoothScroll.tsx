"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isSamePath(a: URL, b: URL): boolean {
  const ap = a.pathname.replace(/\/+$/, "") || "/";
  const bp = b.pathname.replace(/\/+$/, "") || "/";
  return ap === bp;
}

function findAnchorTarget(hash: string): HTMLElement | null {
  const id = hash.replace(/^#/, "");
  if (!id) return null;
  return document.getElementById(id);
}

export default function SmoothScroll() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // 1) On initial load (or soft navigations) if a hash is present, scroll to it.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const { hash } = window.location;
    const target = hash ? findAnchorTarget(hash) : null;
    if (target) {
      // allow layout to paint before scrolling
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [pathname, searchParams]);

  // 2) Intercept clicks on <a> and Next/Prismic links once, globally.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClick = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      if (!el) return;

      // Walk up to a real <a> element if a child inside was clicked
      const anchor = el.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore non-hash links
      // (Examples we DO handle: "#contact", "/tech#case-studies")
      const base = window.location.origin;
      const current = new URL(window.location.href);
      const target = new URL(href, base);

      // Only smooth-scroll when staying on the same page and a hash exists
      if (target.hash && isSamePath(current, target)) {
        const targetEl = findAnchorTarget(target.hash);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          // keep the URL hash in sync without a jump
          window.history.replaceState({}, "", target.hash);
        }
      }
    };

    // capture = true to fire before Next’s internal link handling
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}