import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

// TODO(design): installability on some browsers needs 192/512 PNG icons; only the SVG icon exists today.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: brand.name,
    short_name: brand.name,
    description: brand.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563eb",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
