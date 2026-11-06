import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/logo";
import { brand } from "@/config/brand";
import { StartCarousel } from "./start-carousel";

export const metadata: Metadata = { title: "Getting started", robots: { index: false } };

/** Public 3-screen intro before Google sign-in (architecture spec §2 step 3). */
export default function StartPage() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-ink"><LogoMark className="size-7" /><span className="text-lg font-semibold">{brand.name}</span></Link>
      <Suspense fallback={<div className="h-[26rem] animate-pulse rounded-3xl bg-surface" />}>
        <StartCarousel />
      </Suspense>
    </main>
  );
}
