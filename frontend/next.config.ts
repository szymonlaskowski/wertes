import type { NextConfig } from "next";
import { CART_PROXY_PATH } from "./src/lib/cart";

const wordpressUrl = process.env.WP_URL;
if (!wordpressUrl) {
  throw new Error("WP_URL is missing, copy .env.example to .env");
}

const nextConfig: NextConfig = {
  devIndicators: false,
  trailingSlash: true,
  images: {
    remotePatterns: [new URL(`${wordpressUrl}/wp-content/uploads/**`)],
  },
  cacheComponents: true,
  partialPrefetching: true,
  async rewrites() {
    return [{ source: `${CART_PROXY_PATH}/:path*`, destination: `${wordpressUrl}/wp-json/wc/store/v1/cart/:path*` }];
  },
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
