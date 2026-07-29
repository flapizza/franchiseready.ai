import { Cta } from "@/components/marketing/cta";
import { Features } from "@/components/marketing/features";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { footerNavigation } from "@/content/footer";
import {
  ctaContent,
  featuresContent,
  heroContent,
  howItWorksContent,
} from "@/content/homepage";
import { primaryNavigation } from "@/content/navigation";
import { AUTH_ROUTES } from "@/lib/auth/constants";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar items={primaryNavigation} loginHref={AUTH_ROUTES.login} />
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
