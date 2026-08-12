import type { NextConfig } from "next";

// Security headers applied to every response. See SECURITY-PLAN.md (G-sec).
// The safe set: none affect script/style/image loading, so they cannot break
// rendering. A full script-src CSP is NOT enforced yet (needs report-only
// staging against GTM, the Sanity CDN and the GHL iframe first).
const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
];

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
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
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
