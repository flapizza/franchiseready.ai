import Link from "next/link";
import { ArrowRight, Calendar, ShieldCheck, Sparkles } from "lucide-react";

import { Container } from "@/components/ui/container";

type HeroProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCta?: {
    label: string;
    href: string;
  };
  secondaryCta?: {
    label: string;
    href: string;
  };
};

function MissionControlPreview() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-brand/20 blur-3xl" />

      <div className="overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl">

        <div className="flex items-center justify-between border-b border-border px-6 py-5">

          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-brand">
              Mission Control
            </p>

            <h3 className="mt-1 text-xl font-bold text-ink">
              Good Afternoon, Jim
            </h3>
          </div>

          <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            18 Active Candidates
          </div>

        </div>

        <div className="space-y-4 p-6">

          <div className="rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">
                  Sarah Williams
                </p>

                <p className="mt-1 text-sm text-muted">
                  Ready for Brand Strategy
                </p>
              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                READY
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-ink">
                  John Smith
                </p>

                <p className="mt-1 text-sm text-muted">
                  Buying confidence dropped 8%
                </p>
              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                FOLLOW UP
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-border p-5">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-brand" />

              <div>
                <p className="font-semibold text-ink">
                  Discovery Meeting
                </p>

                <p className="text-sm text-muted">
                  Chris Martin • 2:00 PM
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-brand-soft p-5">

            <div className="flex items-center gap-2">

              <Sparkles className="h-5 w-5 text-brand" />

              <p className="font-semibold text-brand">
                AI Recommendation
              </p>

            </div>

            <p className="mt-3 text-sm leading-7 text-ink">
              Schedule a follow-up with John Smith today. Family alignment
              remains the only obstacle before presenting brand recommendations.
            </p>

          </div>

        </div>

      </div>
    </div>
  );
}

export function Hero({
  eyebrow = "Built Exclusively for Franchise Consultants",
  title = "The AI Operating System for Franchise Consultants.",
  description = "FranchiseReady AI helps franchise consultants prepare for Discovery meetings, understand candidates faster, generate transparent brand recommendations, and deliver higher-quality candidates—all from one intelligent platform.",
  primaryCta = {
    label: "See the Platform",
    href: "#platform",
  },
  secondaryCta = {
    label: "Request a Demo",
    href: "#demo",
  },
}: HeroProps) {
  return (
    <section className="overflow-hidden bg-canvas py-16 lg:py-24">

      <Container>

        <div className="grid items-center gap-20 lg:grid-cols-[1fr_1.05fr]">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-brand-soft px-4 py-2">

              <ShieldCheck className="h-4 w-4 text-brand" />

              <span className="text-sm font-semibold text-brand">
                {eyebrow}
              </span>

            </div>

            <h1 className="mt-8 max-w-4xl text-5xl font-black tracking-tight text-ink lg:text-7xl">
              {title}
            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-9 text-muted">
              {description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">

              <Link
                href={primaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-8 py-4 font-semibold text-brand-foreground transition hover:bg-brand-strong"
              >
                {primaryCta.label}

                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-xl border border-border bg-surface px-8 py-4 font-semibold text-ink transition hover:bg-muted-surface"
              >
                {secondaryCta.label}
              </Link>

            </div>

            <div className="mt-10 rounded-2xl border border-border bg-surface p-6">

              <div className="flex items-center gap-3">

                <ShieldCheck className="h-5 w-5 text-brand" />

                <h3 className="font-bold text-ink">
                  Independent Intelligence
                </h3>

              </div>

              <p className="mt-4 leading-8 text-muted">
                FranchiseReady AI is available exclusively to franchise
                consultants. Our recommendation engine is intentionally not
                licensed to franchisors, ensuring every recommendation is based
                solely on candidate fit—not sponsorships, paid placement, or
                commercial influence.
              </p>

            </div>

          </div>

          <MissionControlPreview />

        </div>

      </Container>

    </section>
  );
}