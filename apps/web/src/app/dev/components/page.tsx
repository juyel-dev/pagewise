import { notFound } from "next/navigation";
import { Gallery } from "./gallery";

export const metadata = { title: "Components", robots: { index: false, follow: false } };

/** Design-system gallery. Available in development; in production only when NEXT_PUBLIC_DEV_COMPONENTS=true. */
export default function ComponentsPage() {
  if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_DEV_COMPONENTS !== "true") notFound();
  return <Gallery />;
}
