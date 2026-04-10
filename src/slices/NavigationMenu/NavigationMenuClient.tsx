"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PrismicNextLink } from "@prismicio/next";
import { Menu, X, ChevronDown } from "lucide-react";
import type { LinkField } from "@prismicio/types";
import { asLink } from "@prismicio/helpers";
import { usePathname } from "next/navigation";

type ChildLink = { label: string; link: LinkField };
type Section = {
  id: string;
  label: string;
  link: LinkField | null;
  children: ChildLink[];
};

export function NavigationMenuClient({
  data,
}: {
  data: {
    logoUrl: string | null;
    logoAlt: string;
    ctaLabel: string | null;
    ctaLink: LinkField | null;
    sections: Section[];
  };
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const [openMobileSections, setOpenMobileSections] = useState<Record<string, boolean>>({});
  const [hasOnPageContactForm, setHasOnPageContactForm] = useState(false);
  const toggleMobileSection = (id: string) => setOpenMobileSections((prev) => ({ ...prev, [id]: !prev[id] }));

  useEffect(() => {
    const handleScroll = () => setIsAtTop(window.scrollY < 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;

    const targetId = "get-in-touch";
    const checkForForm = () => {
      const hasForm = Boolean(document.getElementById(targetId));
      setHasOnPageContactForm(hasForm);
      return hasForm;
    };

    if (checkForForm()) return;

    const observer = new MutationObserver(() => {
      if (checkForForm()) {
        observer.disconnect();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const resolveLinkField = (link: LinkField | null): string | null => {
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

  const rawCtaLink = resolveLinkField(data.ctaLink);

  const computedCtaHref = useMemo(() => {
    const anchor = "#get-in-touch";
    const currentPath = normalizePath(pathname) ?? "/";

    type MatchCandidate = { topLevel: string; length: number };
    const matches: MatchCandidate[] = [];

    const digitalFallbackRoots = [
      "/digital/discovery",
      "/digital/ux",
      "/digital/web3",
    ];

    data.sections.forEach((section) => {
      const sectionPath = normalizePath(resolveLinkField(section.link));
      section.children.forEach((child) => {
        const childPath = normalizePath(resolveLinkField(child.link));
        if (!childPath) return;
        if (
          currentPath === childPath ||
          currentPath.startsWith(`${childPath}/`)
        ) {
          matches.push({ topLevel: childPath, length: childPath.length });
        }
      });

      if (
        sectionPath &&
        (currentPath === sectionPath ||
          currentPath.startsWith(`${sectionPath}/`))
      ) {
        matches.push({ topLevel: sectionPath, length: sectionPath.length });
      }
    });

    const bestMatch = matches
      .sort((a, b) => b.length - a.length)
      .map((candidate) => candidate.topLevel)[0];

    let destination = normalizePath(bestMatch) ?? rawCtaLink ?? "/";

    const requiresDigitalFallback = Boolean(
      destination &&
        digitalFallbackRoots.some((root) =>
          destination === root || destination.startsWith(`${root}/`)
        )
    );

    if (requiresDigitalFallback && !hasOnPageContactForm) {
      destination = "/digital";
    }

    if (destination === "/tabb" || destination === "/our-team") {
      destination = "/";
    }

    if (!destination.startsWith("/")) {
      return destination;
    }

    if (destination === "/") {
      return `/${anchor}`;
    }

    return `${destination}${anchor}`;
  }, [data.sections, hasOnPageContactForm, pathname, rawCtaLink]);

  const finalCtaHref = useMemo(() => {
    if (computedCtaHref) return computedCtaHref;
    if (!rawCtaLink) return "/#get-in-touch";
    if (!rawCtaLink.startsWith("/")) return rawCtaLink;
    return rawCtaLink === "/" ? "/#get-in-touch" : `${rawCtaLink}#get-in-touch`;
  }, [computedCtaHref, rawCtaLink]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isAtTop
          ? "bg-transparent py-2"
          : "bg-[#0a0a1a]/95 py-2 shadow-2xl shadow-cyan-500/20"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
        {/* Logo */}
        <Link
          href="/"
          className="relative z-10 block h-12 no-underline"
          aria-label="Go to homepage"
        >
          {data.logoUrl ? (
            <Image
              src={data.logoUrl}
              alt={data.logoAlt}
              width={160}
              height={48}
              className="h-10 w-auto"
              priority
            />
          ) : (
            <span className="text-white text-lg font-bold">Logo</span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          {data.sections.map((section) => {
            const children = section.children.filter((c) => {
              const hasLabel =
                typeof c.label === "string" && c.label.trim().length > 0;
              // some Prismic groups may include an empty row; treat missing/empty link as falsy
              const hasLink =
                (c.link as unknown) !== null &&
                (c.link as unknown) !== undefined;
              return hasLabel && hasLink;
            });
            const hasRealChildren = children.length > 0;
            return (
              <div key={section.id} className="relative group">
                {section.link ? (
                  <PrismicNextLink
                    field={section.link}
                    className="flex items-center gap-4 px-4 py-3 text-white/80 hover:text-white transition-colors no-underline"
                  >
                    <span>{section.label}</span>
                    {hasRealChildren && (
                      <ChevronDown className="w-4 h-4 shrink-0 text-white/70 group-hover:text-white transition-colors" />
                    )}
                  </PrismicNextLink>
                ) : (
                  <span className="flex items-center gap-4 px-4 py-3 text-white/80">
                    {section.label}
                    {hasRealChildren && (
                      <ChevronDown className="w-4 h-4 shrink-0 text-white/70 group-hover:text-white transition-colors" />
                    )}
                  </span>
                )}
                {hasRealChildren && (
                  <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 absolute left-0 top-full mt-2 w-64 rounded-xl border border-white/10 bg-[#0a0a1a] shadow-xl transition-all duration-200">
                    <ul className="my-0 px-0 py-2 list-none m-0">
                      {children.map((child, idx) => (
                        <li key={`${section.id}-${idx}`} className="mb-0">
                          <PrismicNextLink
                            field={child.link}
                            className="block px-4 py-3 text-base text-white/80 hover:text-white hover:bg-white/5 transition-colors no-underline"
                          >
                            {child.label}
                          </PrismicNextLink>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* CTA + Mobile toggle */}
        <div className="flex items-center gap-3">
          {data.ctaLabel && finalCtaHref && (
            <Link
              href={finalCtaHref}
              className="hidden md:block px-6 py-3 rounded-full bg-cyan-500 font-bold text-black shadow-lg hover:shadow-cyan-500/50 transition-all duration-300 no-underline"
            >
              {data.ctaLabel}
            </Link>
          )}
          {data.ctaLabel && finalCtaHref && (
            <Link
              href={finalCtaHref}
              className="md:hidden flex items-center gap-4 px-4 py-3 text-white/80 hover:text-white transition-colors no-underline"
            >
              {data.ctaLabel}
            </Link>
          )}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="cursor-pointer md:hidden ml-4 p-3 rounded-full bg-black/30 border border-cyan-500/30"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-cyan-400" />
            ) : (
              <Menu className="w-6 h-6 text-cyan-400" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div
        ref={menuRef}
        className={`md:hidden fixed inset-0 bg-[#0a0a1a]/90 backdrop-blur-lg pt-24 pb-12 z-40 flex flex-col items-center transition-all duration-500 ${
          isMenuOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 backdrop-blur hover:bg-white/15"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
            <span className="text-sm">Close</span>
          </button>
        </div>
        <div className="w-full max-w-xs space-y-2">
          {data.sections.map((section) => {
            const children = section.children.filter((c) => {
              const hasLabel =
                typeof c.label === "string" && c.label.trim().length > 0;
              const hasLink =
                (c.link as unknown) !== null &&
                (c.link as unknown) !== undefined;
              return hasLabel && hasLink;
            });
            const hasRealChildren = children.length > 0;
            return (
              <div
                key={section.id}
                className="bg-white/5 rounded-xl border border-white/10 overflow-hidden"
              >
                <div>
                  <div
                    className={`flex items-center justify-between rounded-lg transition-colors ${
                      openMobileSections[section.id] ? "bg-white/10" : "hover:bg-white/10"
                    }`}
                  >
                    {section.link ? (
                      <PrismicNextLink
                        field={section.link}
                        className="flex-1 text-white/90 hover:text-white font-medium text-left p-4 no-underline"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {section.label}
                      </PrismicNextLink>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleMobileSection(section.id)}
                        className="flex-1 text-left text-white/90 font-medium"
                        aria-expanded={hasRealChildren ? !!openMobileSections[section.id] : undefined}
                      >
                        {section.label}
                      </button>
                    )}
                    {hasRealChildren && (
                      <button
                        type="button"
                        onClick={() => toggleMobileSection(section.id)}
                        className="mx-3 my-2 p-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors"
                        aria-expanded={!!openMobileSections[section.id]}
                        aria-label={`Toggle ${section.label} submenu`}
                      >
                        <ChevronDown
                          className={`w-5 h-5 transition-transform ${
                            openMobileSections[section.id] ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    )}
                  </div>
                </div>
                {hasRealChildren && openMobileSections[section.id] && (
                  <ul className="list-none my-0 m-0 px-2 pb-2 pt-2 space-y-1">
                    {children.map((child, idx) => (
                      <li key={`${section.id}-m-${idx}`} className="mb-0">
                        <PrismicNextLink
                          field={child.link}
                          className="block px-4 py-3 text-white/85 hover:text-white hover:bg-white/10 rounded-lg text-[14px] no-underline"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {child.label}
                        </PrismicNextLink>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
        {data.ctaLabel && finalCtaHref && (
          <div className="w-full max-w-xs px-2 mt-3">
            <Link
              href={finalCtaHref}
              onClick={() => setIsMenuOpen(false)}
              className="block w-full px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 font-bold text-black text-center shadow-lg md:hidden no-underline"
            >
              {data.ctaLabel}
            </Link>
          </div>
        )}
      </div>
      
    </header>
  );
}
