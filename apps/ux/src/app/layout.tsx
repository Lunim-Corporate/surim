import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { PrismicPreview } from "@prismicio/next";
import NavigationMenu from "@surim/ui/slices/NavigationMenu";
import Footer from "@surim/ui/slices/Footer";
import ScrollManager from "@surim/ui/ScrollManager";
import SmoothScroll from "@surim/ui/SmoothScroll";
import AnalyticsProvider from "@surim/ui/AnalyticsProvider";
import { GA_ID } from "@surim/lib/gtag";
import { SITE_CONFIG, getUxLayoutContent } from "@surim/prismic/siteContent";
import { repositoryName } from "../prismicio";
import "./brand.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_CONFIG.ux.siteName}`,
    default: SITE_CONFIG.ux.siteName,
  },
  description: SITE_CONFIG.ux.description,
  keywords: "technology, innovation, software, development, surim, UX, design",
  metadataBase: new URL(SITE_CONFIG.ux.baseUrl),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_CONFIG.ux.siteName,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navigationMenu, navigationSlices, footerSlice, footerSlices } =
    await getUxLayoutContent();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {GA_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}', {
                  anonymize_ip: true,
                  allow_ad_personalization_signals: false
                });
              `}
            </Script>
          </>
        ) : null}
      </head>
      <body className="bg-black">
        <ScrollManager />
        <Suspense fallback={null}>
          <SmoothScroll />
        </Suspense>
        <PrismicPreview repositoryName={repositoryName}>
          {navigationMenu ? (
            <NavigationMenu
              slice={navigationMenu}
              index={0}
              slices={navigationSlices}
              context={{ siteKey: "ux" }}
            />
          ) : null}
          <Suspense fallback={null}>
            <AnalyticsProvider disabled={!GA_ID} />
          </Suspense>
          {children}
          {footerSlice ? (
            <Footer
              slice={footerSlice}
              index={0}
              slices={footerSlices}
              context={{ siteKey: "ux" }}
            />
          ) : null}
        </PrismicPreview>
      </body>
    </html>
  );
}
