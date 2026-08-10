import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/ui/container";

type CtaProps = {
  title?: string;
  description?: string;
  href?: string;
  label?: string;
};

export function Cta({
  title = "Ready to Transform Your Franchise Consulting Business?",
  description = "Schedule a personalized demonstration and see how FranchiseReady AI helps consultants prepare for Discovery meetings, understand candidates faster, generate transparent recommendations, and deliver stronger candidates to franchisors.",
  href = "/request-demo",
  label = "Request a Demo",
}: CtaProps) {
  return (
    <section
      id="demo"
      className="bg-canvas py-20"
    >
      <Container>

        <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 px-8 py-16 text-center shadow-2xl sm:px-12">

          <p className="text-sm font-semibold uppercase tracking-[0.30em] text-blue-300">
            Built Exclusively for Franchise Consultants
          </p>

          <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-black tracking-tight text-white lg:text-5xl">
            {title}
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            {description}
          </p>

          <div className="mt-10">

            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-4 text-base font-semibold text-brand-foreground shadow-lg transition-all duration-200 hover:-translate-y-1 hover:bg-brand-strong hover:shadow-xl"
            >
              {label}

              <ArrowRight className="h-5 w-5" />
            </Link>

          </div>

          <p className="mt-8 text-sm text-slate-400">
            30-minute personalized demo • No obligation • Questions answered live
          </p>

        </div>

      </Container>
    </section>
  );
}
