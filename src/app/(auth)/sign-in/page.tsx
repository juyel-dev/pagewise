import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { brand } from "@/config/brand";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

/** Mock frame 3: centered card — Google mark, Sign in, single button, terms. */
export default function SignInPage() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="mx-auto mb-8 text-sm text-muted underline underline-offset-2 hover:text-ink">← Back to {brand.name}</Link>
      <div className="rounded-3xl border border-line bg-surface p-8 text-center shadow-window">
        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-line bg-surface-2">
          <svg viewBox="0 0 48 48" className="size-7" aria-hidden focusable="false">
            <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
            <path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z" />
            <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
          </svg>
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-ink">Sign in</h1>
        <p className="mt-1 text-sm text-ink-2">Continue to {brand.name}</p>
        <Suspense fallback={<div className="mt-6 h-32 animate-pulse rounded-2xl bg-surface-2" />}>
          <div className="mt-6"><SignInForm /></div>
        </Suspense>
        <p className="mt-6 text-xs leading-5 text-muted">
          By continuing, you agree to our{" "}
          <Link href="/legal/terms" className="font-medium text-brand-text underline underline-offset-2">Terms of Service</Link> and{" "}
          <Link href="/legal/privacy" className="font-medium text-brand-text underline underline-offset-2">Privacy Policy</Link>.
          Closed beta is for adults aged 18 and over.
        </p>
      </div>
    </main>
  );
}
