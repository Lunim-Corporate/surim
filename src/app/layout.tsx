import AnalyticsProvider from "./AnalyticsProvider";
import { GA_ID } from "@/lib/gtag";
import { Suspense } from "react";
import Script from "next/script";
import type { Metadata } from "next";
import { repositoryName } from "@/prismicio";
import { PrismicPreview } from "@prismicio/next";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import ScrollManager from "@/components/ScrollManager";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_URL || "https://surim.io"),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Suspense fallback={null}>
            <AnalyticsProvider disabled={!GA_ID} />
          </Suspense>
          {children}
        </PrismicPreview>
      </body>
    </html>
  );
}
