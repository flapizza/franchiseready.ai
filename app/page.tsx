import { Cta } from "@/components/marketing/cta";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import {
  ctaContent,
  featuresContent,
  heroContent,
  howItWorksContent,
} from "@/content/homepage";
import { footerNavigation, primaryNavigation } from "@/content/navigation";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar items={primaryNavigation} />
      <main className="flex-1">
        <Hero {...heroContent} />
        <Features {...featuresContent} />
        <HowItWorks {...howItWorksContent} />
        <Cta {...ctaContent} />
      </main>
      <Footer groups={footerNavigation} />
    </div>
  );
}
