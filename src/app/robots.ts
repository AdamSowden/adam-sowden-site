import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /try-sms is the unlisted beta door for the Speed-to-Lead
        // Agent. It carries noindex metadata too; this is belt and
        // braces so it never surfaces in search while in beta.
        disallow: ["/api/", "/studio/", "/studio", "/try-sms"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
