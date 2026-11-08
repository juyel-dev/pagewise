import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{
      userAgent: "*",
      allow: ["/", "/start", "/legal/"],
      // Signed-in/guest workspace and staff routes carry no public content.
      disallow: ["/home", "/study", "/review", "/admin", "/auth/", "/settings", "/bookmarks", "/progress", "/library", "/practice", "/onboarding", "/dev"],
    }],
    sitemap: `${env.siteUrl}/sitemap.xml`,
  };
}
