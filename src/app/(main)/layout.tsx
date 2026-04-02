import type { Metadata } from "next";
import NavigationMenu from "@/slices/NavigationMenu";
import Footer from "@/slices/Footer";
import {
  SITE_CONFIG,
  getMainLayoutContent,
} from "@/lib/siteContent";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_CONFIG.main.siteName}`,
    default: SITE_CONFIG.main.siteName,
  },
  description: SITE_CONFIG.main.description,
  keywords:
    "technology, innovation, software, development, lunim, AI, automation",
  metadataBase: new URL(SITE_CONFIG.main.baseUrl),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_CONFIG.main.siteName,
  },
};

export default async function MainSiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navigationMenu, navigationSlices, footerSlice, footerSlices } =
    await getMainLayoutContent();

  return (
    <>
      {navigationMenu ? (
        <NavigationMenu
          slice={navigationMenu}
          index={0}
          slices={navigationSlices}
          context={{ siteKey: "main" }}
        />
      ) : null}
      {children}
      {footerSlice ? (
        <Footer
          slice={footerSlice}
          index={0}
          slices={footerSlices}
          context={{ siteKey: "main" }}
        />
      ) : null}
    </>
  );
}
