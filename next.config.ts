import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vanity URL for Irene, the AI marketing department product. The canonical
  // page stays at /products/ai-marketing-team so it keeps the keyword-bearing
  // URL and stays inside the /products hub, breadcrumbs, and internal linking.
  // /irene exists for talks, email signatures, and print.
  async redirects() {
    return [
      {
        source: "/irene",
        destination: "/products/ai-marketing-team",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/**",
      },
    ],
  },
};

export default nextConfig;
