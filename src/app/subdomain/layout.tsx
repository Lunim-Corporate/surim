import AnalyticsProvider from "./AnalyticsProvider";
import { GA_ID } from "@/lib/gtag";
// React
import { Suspense } from "react";
// Next
import Script from "next/script";
import { draftMode } from "next/headers";
import { Metadata } from "next";
// Prismic
import { createClient, repositoryName } from "@/prismicio";
import { PrismicPreview } from "@prismicio/next";
import NavigationMenu from "@/slices/NavigationMenu";
import Footer from "@/slices/Footer";
import { Content } from "@prismicio/client";
// Styles
import "./globals.css";
import "./brand.css";
// Components
import SmoothScroll from "@/components/SmoothScroll";
import ScrollManager from "@/components/ScrollManager";


export const metadata: Metadata = {
  title: {
    template: "%s | Surim",
    default: "Surim", // Fall back when no title is provided
  },
  // Default description
  description: "Surim website page",
  keywords: "technology, innovation, software, development, surim",
  // Base URL prefix for metadata fields that require a fully qualified URL
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL || "https://surim-progress.netlify.app/"),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: "Surim",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isEnabled: isDraft } = await draftMode();
  const client = createClient();
  const primaryNav = (await (client as any)
    .getSingle("primary_navigation")
    .catch(() => null)) as Content.PrimaryNavigationDocument | null;
  // Extract the navigation_menu slice from the slices array
  const navigationMenu = primaryNav?.data?.slices.find(
    (slice: any) => slice.slice_type === "navigation_menu"
  );
  // Fetch the footer slice
  const footer = (await (client as any)
    .getSingle("footer")
    .catch(() => null)) as Content.FooterDocument | null;
  const footerSlice = footer?.data?.slices.find(
    (slice: any) => slice.slice_type === "footer"
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {!isDraft && GA_ID ? (
          <>
            {/* gtag loader */}
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            {/* init gtag */}
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
        <script
          async
          defer
          src="https://static.cdn.prismic.io/prismic.js?new=true&repo=surim"
        ></script>
      </head>
      <body className="bg-black">
        <ScrollManager />
        <Suspense fallback={null}>
          <SmoothScroll />
        </Suspense>
        <PrismicPreview repositoryName={repositoryName}>
          {navigationMenu && (
            <NavigationMenu
              slice={navigationMenu}
              index={0} // Default index
              slices={primaryNav?.data?.slices || []} // Pass the full slices array
              context={{}} // Provide an empty context object
            />
          )}
          <Suspense fallback={null}>
            <AnalyticsProvider disabled={isDraft || !GA_ID}>
              {children}
            </AnalyticsProvider>
          </Suspense>
          {footerSlice && (
            <Footer
              slice={footerSlice}
              index={0}
              slices={footer?.data?.slices || []}
              context={{}}
            />
          )}
        </PrismicPreview>
      </body>
    </html>
  );
}
