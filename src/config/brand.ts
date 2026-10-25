/** Single source of truth for brand + site copy that may change. */
export const brand = {
  name: "PageWise",
  tagline: "Read the page. Practise the page.",
  description: "PageWise puts the NCERT page and exam-style NEET practice questions from that exact page side by side. Biology first, English first, more languages next.",
  exam: "NEET UG",
  /** Google Apps Script web-app URL (see docs/ops/02-waitlist-apps-script.md). */
  waitlistUrl: process.env.NEXT_PUBLIC_WAITLIST_URL ?? "",
} as const;
export const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#accuracy", label: "Accuracy" },
  { href: "#roadmap", label: "Roadmap" },
  { href: "#faq", label: "FAQ" },
] as const;
