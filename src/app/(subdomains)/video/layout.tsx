import type { Metadata } from "next";
import NavigationMenu from "@/slices/NavigationMenu";
import Footer from "@/slices/Footer";
import { SITE_CONFIG, getVideoLayoutContent } from "@/lib/siteContent";
import "./brand.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_CONFIG.video.siteName}`,
    default: SITE_CONFIG.video.siteName,
  },
  description: SITE_CONFIG.video.description,
  keywords:
    "technology, innovation, software, development, surim, AI, automation",
  metadataBase: new URL(SITE_CONFIG.video.baseUrl),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_CONFIG.video.siteName,
  },
};

export default async function VideoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navigationMenu, navigationSlices, footerSlice, footerSlices } =
    await getVideoLayoutContent();

  return (
    <>
      {navigationMenu ? (
        <NavigationMenu
          slice={navigationMenu}
          index={0}
          slices={navigationSlices}
          context={{ siteKey: "video" }}
        />
      ) : null}
      {children}
      {footerSlice ? (
        <Footer
          slice={footerSlice}
          index={0}
          slices={footerSlices}
          context={{ siteKey: "video" }}
        />
      ) : null}
    </>
  );
}
