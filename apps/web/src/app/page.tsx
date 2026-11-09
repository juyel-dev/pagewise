import { Hero } from "@/components/landing/hero";
import { PublicFooter } from "@/components/layout/public-footer";
import { PublicHeader } from "@/components/layout/public-header";

export default function LandingPage() {
  return (
    <>
      <PublicHeader />
      <main id="main">
        <Hero />
      </main>
      <PublicFooter />
    </>
  );
}
