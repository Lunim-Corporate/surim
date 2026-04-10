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
import { SITE_CONFIG, getAiLayoutContent } from "@surim/prismic/siteContent";
import { repositoryName } from "../prismicio";
import "./brand.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_CONFIG.ai.siteName}`,
    default: SITE_CONFIG.ai.siteName,
  },
  description: SITE_CONFIG.ai.description,
  keywords: "technology, innovation, software, development, surim, AI, automation",
  metadataBase: new URL(SITE_CONFIG.ai.baseUrl),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_CONFIG.ai.siteName,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navigationMenu, navigationSlices, footerSlice, footerSlices } =
    await getAiLayoutContent();

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
              context={{ siteKey: "ai" }}
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
              context={{ siteKey: "ai" }}
            />
          ) : null}
        </PrismicPreview>
      </body>
    </html>
  );
}
