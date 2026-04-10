import type { Metadata } from "next";
import NavigationMenu from "@/slices/NavigationMenu";
import Footer from "@/slices/Footer";
import { SITE_CONFIG, getAiLayoutContent } from "@/lib/siteContent";
import "./brand.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_CONFIG.ai.siteName}`,
    default: SITE_CONFIG.ai.siteName,
  },
  description: SITE_CONFIG.ai.description,
  keywords:
    "technology, innovation, software, development, surim, AI, automation",
  metadataBase: new URL(SITE_CONFIG.ai.baseUrl),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_CONFIG.ai.siteName,
  },
};

export default async function AiAutomationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navigationMenu, navigationSlices, footerSlice, footerSlices } =
    await getAiLayoutContent();

  return (
    <>
      {navigationMenu ? (
        <NavigationMenu
          slice={navigationMenu}
          index={0}
          slices={navigationSlices}
          context={{ siteKey: "ai" }}
        />
      ) : null}
      {children}
      {footerSlice ? (
        <Footer
          slice={footerSlice}
          index={0}
          slices={footerSlices}
          context={{ siteKey: "ai" }}
        />
      ) : null}
    </>
  );
}
