"use client";

import { useEffect } from "react";

const STORAGE_PREFIX = "scroll-pos:";

const isMobileSafari = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent.toLowerCase();
  const isSafari =
    ua.includes("safari") && !ua.includes("chrome") && !ua.includes("android");
  const isIOS =
    ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod");
  return isSafari && isIOS;
};

const getKeyForCurrentUrl = () =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

const ScrollManager = () => {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Let us control scroll restoration (except iOS Safari, which is weird)
    if ("scrollRestoration" in window.history && !isMobileSafari()) {
      window.history.scrollRestoration = "manual";
    }

    const saveScroll = () => {
      const key = STORAGE_PREFIX + getKeyForCurrentUrl();
      sessionStorage.setItem(key, String(window.scrollY));
    };

    let scrollTimeout: number | null = null;
    const onScroll = () => {
      if (scrollTimeout !== null) {
        window.clearTimeout(scrollTimeout);
      }
      scrollTimeout = window.setTimeout(saveScroll, 80);
    };

    const restoreScroll = () => {
      const key = STORAGE_PREFIX + getKeyForCurrentUrl();
      const stored = sessionStorage.getItem(key);
      if (stored == null) return;

      const y = Number(stored);
      if (Number.isNaN(y)) return;

      // Run after layout / slices / widgets / anchor jumps
      requestAnimationFrame(() => {
        window.scrollTo({ top: y, left: 0 });
      });
    };

    const onPopState = () => {
      restoreScroll();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("popstate", onPopState);

    // Try to restore on first mount (e.g. hard refresh on same URL)
    restoreScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("popstate", onPopState);
      if ("scrollRestoration" in window.history && !isMobileSafari()) {
        window.history.scrollRestoration = "auto";
      }
      if (scrollTimeout !== null) {
        window.clearTimeout(scrollTimeout);
      }
    };
  }, []);

  return null;
};

export default ScrollManager;