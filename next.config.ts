import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.prismic.io",
        pathname: "/surim/**",
      },
    ],
    qualities: [85, 90],
  },

  turbopack: {
    root: path.resolve(__dirname),
  },

  async redirects() {
    return [
      {
        source: "/:path*/case-studies",
        destination: "/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
