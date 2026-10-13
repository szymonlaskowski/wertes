import type { NextConfig } from "next";

const wordpressUrl = process.env.WP_URL;
if (!wordpressUrl) {
  throw new Error("WP_URL is missing, copy .env.example to .env");
}

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: {
    remotePatterns: [new URL(`${wordpressUrl}/wp-content/uploads/**`)],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
