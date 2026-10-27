import { Accuracy } from "@/components/landing/accuracy";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { flags } from "@/lib/flags";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Problem } from "@/components/landing/problem";
import { Roadmap } from "@/components/landing/roadmap";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";
import { StartCta } from "@/components/landing/start-cta";
import { Waitlist } from "@/components/landing/waitlist";
export default function HomePage() {
  return <><SiteHeader/><main id="main"><Hero/><Problem/><HowItWorks/><Features/><Accuracy/><Roadmap/><Faq/>{flags.appOpen ? <StartCta/> : <Waitlist/>}</main><SiteFooter/></>;
}
