import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

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

      <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-teal-400/20 blur-3xl" />

      <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_40px_120px_rgba(15,23,42,.18)]">

        <div className="flex items-center justify-between border-b border-slate-200 px-8 py-6">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-600">
              Mission Control
            </p>

            <h3 className="mt-2 text-2xl font-black text-slate-900">
              Welcome back, Jim.
            </h3>

          </div>

          <div className="rounded-full bg-emerald-100 px-5 py-2 text-sm font-bold text-emerald-700">
            AI Copilot Active
          </div>

        </div>

        <div className="space-y-5 p-8">

          <div className="rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-bold text-slate-900">
                  Sarah Williams
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Ready for Introduction
                </p>

              </div>

              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                READY
              </span>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-bold text-slate-900">
                  John Smith
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Family alignment requires follow-up
                </p>

              </div>

              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                FOLLOW UP
              </span>

            </div>

          </div>

          <div className="rounded-2xl border border-slate-200 p-5">

            <div className="flex items-center gap-4">

              <Calendar className="h-5 w-5 text-teal-500" />

              <div>

                <p className="font-bold text-slate-900">
                  Discovery Meeting
                </p>

                <p className="text-sm text-slate-500">
                  Chris Martin • 2:00 PM
                </p>

              </div>

            </div>

          </div>

          <div className="rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">

            <div className="flex items-center gap-2">

              <Sparkles className="h-5 w-5 text-teal-400" />

              <span className="font-bold">
                AI Recommendation
              </span>

            </div>

            <p className="mt-4 text-sm leading-7 text-slate-300">
              Schedule a follow-up with John today. Every buying signal
              remains positive, and family alignment is the final step
              before generating a referral package.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
}

export function Hero({
  eyebrow = "Introducing a New Category of Franchise Software",
  title = "The AI Operating System for Franchise Consultants.",
  description = "FranGroove AI helps franchise consultants acquire better candidates, conduct smarter Discovery meetings, generate transparent brand recommendations, automate referral packages, and win more awards—all from one intelligent platform.",
  primaryCta = {
    label: "Book a Live Demo",
    href: "#demo",
  },
  secondaryCta = {
    label: "Watch 3-Minute Overview",
    href: "#overview",
  },
}: HeroProps) {
  return (
    <section className="overflow-hidden bg-canvas py-20 lg:py-28">

      <Container>

        <div className="grid items-center gap-20 lg:grid-cols-[1fr_1.05fr]">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-5 py-2">

              <TrendingUp className="h-4 w-4 text-teal-600" />

              <span className="text-sm font-bold text-teal-700">
                {eyebrow}
              </span>

            </div>

            <h1 className="mt-8 text-6xl font-black tracking-tight text-slate-900 lg:text-7xl">

              Fran<span className="text-teal-500">Groove</span> AI

              <span className="mt-6 block text-5xl leading-tight lg:text-6xl">
                {title}
              </span>

            </h1>

            <p className="mt-8 max-w-2xl text-xl leading-9 text-slate-600">
              {description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">

              <Link
                href={primaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-8 py-4 font-semibold text-white transition hover:bg-slate-800"
              >
                {primaryCta.label}

                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href={secondaryCta.href}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white px-8 py-4 font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                {secondaryCta.label}
              </Link>

            </div>

            <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="flex items-center gap-3">

                <ShieldCheck className="h-5 w-5 text-teal-500" />

                <h3 className="font-bold text-slate-900">
                  Independent AI Intelligence
                </h3>

              </div>

              <p className="mt-4 leading-8 text-slate-600">
                FranGroove AI is built exclusively for franchise consultants.
                Our recommendation engine is never influenced by paid placement,
                sponsorships, or franchisor preferences—every recommendation is
                driven by candidate fit and consultant success.
              </p>

            </div>

          </div>

          <MissionControlPreview />

        </div>

      </Container>

    </section>
  );
}