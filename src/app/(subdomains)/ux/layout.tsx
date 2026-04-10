import type { Metadata } from "next";
import NavigationMenu from "@/slices/NavigationMenu";
import Footer from "@/slices/Footer";
import { SITE_CONFIG, getUxLayoutContent } from "@/lib/siteContent";
import "./brand.css";

export const metadata: Metadata = {
  title: {
    template: `%s | ${SITE_CONFIG.ux.siteName}`,
    default: SITE_CONFIG.ux.siteName,
  },
  description: SITE_CONFIG.ux.description,
  keywords:
    "technology, innovation, software, development, surim, AI, automation",
  metadataBase: new URL(SITE_CONFIG.ux.baseUrl),
  openGraph: {
    type: "website",
    locale: "en_GB",
    siteName: SITE_CONFIG.ux.siteName,
  },
};

export default async function UxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { navigationMenu, navigationSlices, footerSlice, footerSlices } =
    await getUxLayoutContent();

  return (
    <>
      {navigationMenu ? (
        <NavigationMenu
          slice={navigationMenu}
          index={0}
          slices={navigationSlices}
          context={{ siteKey: "ux" }}
        />
      ) : null}
      {children}
      {footerSlice ? (
        <Footer
          slice={footerSlice}
          index={0}
          slices={footerSlices}
          context={{ siteKey: "ux" }}
        />
      ) : null}
    </>
  );
}
