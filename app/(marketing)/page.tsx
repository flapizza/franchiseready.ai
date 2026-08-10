import { ConsultantTrust } from "@/components/marketing/consultant-trust";
import { Cta } from "@/components/marketing/cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { PlatformOverview } from "@/components/marketing/platform-overview";
import { ProductShowcase } from "@/components/marketing/product-showcase";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";

import { footerNavigation } from "@/content/footer";

import {
  ctaContent,
  heroContent,
  howItWorksContent,
} from "@/content/homepage";

import { primaryNavigation } from "@/content/navigation";

import { AUTH_ROUTES } from "@/lib/auth/constants";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Navbar
        items={primaryNavigation}
        loginHref={AUTH_ROUTES.login}
      />

      <main className="flex-1">

        <Hero {...heroContent} />

        <ConsultantTrust />

        <PlatformOverview />

        <HowItWorks {...howItWorksContent} />

        <ProductShowcase />

        <Cta {...ctaContent} />

      </main>

      <Footer groups={footerNavigation} />

    </div>
  );
}