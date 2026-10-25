import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { brand } from "@/config/brand";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
export const metadata: Metadata = {
 metadataBase: new URL(siteUrl),
 title: {default:`${brand.name} — NCERT page + NEET practice, side by side`,template:`%s · ${brand.name}`},
 description: brand.description, applicationName: brand.name,
 openGraph:{type:"website",siteName:brand.name,title:`${brand.name} — ${brand.tagline}`,description:brand.description},
 twitter:{card:"summary_large_image",title:`${brand.name} — ${brand.tagline}`,description:brand.description},
};
export const viewport: Viewport = {themeColor:[{media:"(prefers-color-scheme: light)",color:"#fafaf7"},{media:"(prefers-color-scheme: dark)",color:"#0c1210"}]};
export default function RootLayout({children}: LayoutProps<"/">) {
 return <html lang="en" suppressHydrationWarning><body className="min-h-dvh antialiased"><ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange><a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white">Skip to content</a>{children}</ThemeProvider></body></html>;
}
