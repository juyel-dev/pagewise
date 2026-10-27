import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LogoMark } from "@/components/logo";
import { brand } from "@/config/brand";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 text-ink"><LogoMark /><span className="text-lg font-semibold">{brand.name}</span></Link>
      <h1 className="text-2xl font-semibold text-ink">Sign in</h1>
      <p className="mt-2 mb-6 text-sm text-ink-2">Join instantly with Google to save your progress and bookmarks.</p>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-surface-2" />}><SignInForm /></Suspense>
      <p className="mt-8 text-xs text-muted">By continuing you agree to our terms and privacy notice (published before public launch). Closed beta is for adults aged 18 and over.</p>
    </main>
  );
}
