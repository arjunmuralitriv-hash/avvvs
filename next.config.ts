import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withAnalyzer = bundleAnalyzer({ enabled: process.env.ANALYZE === "true" });

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "cdn.shopify.com" },
      { protocol: "https", hostname: "avvvsglobal.com", pathname: "/cdn/shop/**" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
    ],
  },
  experimental: {
    optimizePackageImports: ["@react-three/drei", "motion"],
  },
  // Agent E fills this with the 301 map from the old WordPress URLs.
  async redirects() {
    return [];
  },
  turbopack: {
    rules: {
      // Tailwind runs on plain stylesheets only. CSS Modules must keep their module type,
      // otherwise `styles.x` resolves to undefined (found by Agent D).
      "*.css": {
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default withAnalyzer(nextConfig);
