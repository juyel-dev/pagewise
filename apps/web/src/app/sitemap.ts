import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

const PUBLIC_PATHS = ["/", "/sign-in", "/legal/terms", "/legal/privacy"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.map((path) => ({ url: `${env.siteUrl}${path === "/" ? "" : path}` }));
}
