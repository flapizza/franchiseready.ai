import {
  ArrowRight,
  BrainCircuit,
  LayoutDashboard,
  Presentation,
  Users,
} from "lucide-react";

import { Container } from "@/components/ui/container";

type ShowcaseCardProps = {
  preview: React.ReactNode;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
};

function MissionControlPreview() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

        <div>

          <p className="text-xs uppercase tracking-[0.30em] text-blue-400">
            Mission Control
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Good Afternoon, Jim
          </h3>

        </div>

        <div className="rounded-full bg-emerald-500/20 px-4 py-2 text-sm font-semibold text-emerald-300">
          18 Active Candidates
        </div>

      </div>

      <div className="space-y-4 p-5">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex justify-between">

            <div>

              <div className="font-semibold text-white">
                Sarah Williams
              </div>

              <div className="mt-1 text-sm text-slate-400">
                Ready for Brand Strategy
              </div>

            </div>

            <div className="text-right">

              <div className="text-2xl font-black text-emerald-400">
                97%
              </div>

              <div className="text-xs uppercase text-slate-500">
                READY
              </div>

            </div>

          </div>

        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="flex justify-between">

            <div>

              <div className="font-semibold text-white">
                John Smith
              </div>

              <div className="mt-1 text-sm text-slate-400">
                Buying Confidence ↓ 8%
              </div>

            </div>

            <div className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300">
              FOLLOW UP
            </div>

          </div>

        </div>

        <div className="rounded-2xl bg-blue-600/10 p-5">

          <div className="text-sm font-semibold uppercase tracking-wide text-blue-300">
            AI Recommendation
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            Schedule a follow-up with John Smith today. AI predicts a high
            probability of re-engagement if contacted within 48 hours.
          </p>

        </div>

      </div>

    </div>
  );
}

function DiscoveryCopilotPreview() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

        <div>

          <p className="text-xs uppercase tracking-[0.30em] text-blue-400">
            Discovery Copilot
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Live Meeting Intelligence
          </h3>

        </div>

        <div className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300">
          LIVE
        </div>

      </div>

      <div className="space-y-4 p-5">

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">

          <div className="text-sm text-slate-400">
            Candidate
          </div>

          <p className="mt-3 text-white">
            “I’ve managed more than 300 employees across multiple states.”
          </p>

        </div>

        <div className="grid gap-3 sm:grid-cols-2">

          <div className="rounded-2xl bg-emerald-500/15 p-4">

            <div className="text-xs uppercase tracking-wide text-emerald-300">
              Buying Signal
            </div>

            <div className="mt-2 text-lg font-bold text-white">
              Executive Leadership
            </div>

          </div>

          <div className="rounded-2xl bg-amber-500/15 p-4">

            <div className="text-xs uppercase tracking-wide text-amber-300">
              Suggested Question
            </div>

            <div className="mt-2 text-sm text-white">
              Tell me about your most difficult leadership decision.
            </div>

          </div>

        </div>

        <div className="rounded-2xl bg-blue-600/10 p-5">

          <div className="text-sm font-semibold uppercase tracking-wide text-blue-300">
            AI Insight
          </div>

          <p className="mt-3 text-sm leading-7 text-slate-300">
            Leadership experience strongly aligns with executive coaching,
            consulting, and B2B franchise models.
          </p>

        </div>

      </div>

    </div>
  );
}

function Candidate360Preview() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

        <div>

          <p className="text-xs uppercase tracking-[0.30em] text-blue-400">
            Candidate 360
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Sarah Williams
          </h3>

        </div>

        <div className="rounded-full bg-blue-500/20 px-4 py-2 text-sm font-semibold text-blue-300">
          Executive Profile
        </div>

      </div>

      <div className="grid grid-cols-2 gap-4 p-5">

        <div className="rounded-2xl bg-slate-900 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Readiness
          </div>

          <div className="mt-3 text-4xl font-black text-emerald-400">
            91%
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            AI Confidence
          </div>

          <div className="mt-3 text-4xl font-black text-blue-400">
            96%
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Award Probability
          </div>

          <div className="mt-3 text-4xl font-black text-white">
            89%
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 p-5">
          <div className="text-xs uppercase tracking-wide text-slate-500">
            Top Brand
          </div>

          <div className="mt-3 text-xl font-bold text-white">
            ERA Group
          </div>
        </div>

      </div>

    </div>
  );
}

function BrandStrategyPreview() {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">

      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

        <div>

          <p className="text-xs uppercase tracking-[0.30em] text-blue-400">
            Brand Strategy
          </p>

          <h3 className="mt-1 text-lg font-bold text-white">
            Recommended Match
          </h3>

        </div>

        <div className="text-3xl font-black text-emerald-400">
          97%
        </div>

      </div>

      <div className="space-y-4 p-5">

        {[
          ["Executive Leadership", "+8"],
          ["Financial Readiness", "+7"],
          ["Ownership Motivation", "+6"],
          ["Family Alignment", "-2"],
        ].map(([title, score]) => (
          <div
            key={title}
            className="flex items-center justify-between rounded-2xl bg-slate-900 p-4"
          >
            <div className="font-medium text-white">
              {title}
            </div>

            <div
              className={`text-xl font-black ${
                score.startsWith("-")
                  ? "text-amber-400"
                  : "text-emerald-400"
              }`}
            >
              {score}
            </div>
          </div>
        ))}

      </div>

    </div>
  );
}

function ShowcaseCard({
  preview,
  icon,
  title,
  subtitle,
  description,
}: ShowcaseCardProps) {
  return (
    <div className="grid items-center gap-16 py-24 lg:grid-cols-[1fr_1.2fr]">

      <div>

        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-soft">
          {icon}
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.30em] text-brand">
          {subtitle}
        </p>

        <h3 className="mt-4 text-5xl font-black tracking-tight text-ink">
          {title}
        </h3>

        <p className="mt-6 max-w-xl text-lg leading-9 text-muted">
          {description}
        </p>

        <button
          type="button"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-semibold text-brand-foreground transition-all hover:gap-3 hover:bg-brand-strong"
        >
          Learn More

          <ArrowRight className="h-4 w-4" />
        </button>

      </div>

      {preview}

    </div>
  );
}

export function ProductShowcase() {
  return (
    <section
  id="features"
  className="bg-surface py-24"
>

      <Container>

        <div className="mx-auto max-w-4xl text-center">

          <p className="text-sm font-semibold uppercase tracking-[0.30em] text-brand">
            See FranGroove AI
          </p>

          <h2 className="mt-6 text-5xl font-black tracking-tight text-ink">
            Built for the way franchise
            consultants actually work.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-muted">
            Every screen has been designed around the
            real workflow of professional franchise
            consultants—from first assessment to
            successful franchise award.
          </p>

        </div>

        <div className="mt-20">

          <ShowcaseCard
  preview={<MissionControlPreview />}
  icon={<LayoutDashboard className="h-8 w-8 text-brand" />}
  subtitle="Mission Control"
  title="Start every day with clarity."
  description="Know exactly who needs follow-up, who is ready for Brand Strategy, which candidates are losing momentum, and what AI recommends next."
/>

<ShowcaseCard
  preview={<DiscoveryCopilotPreview />}
  icon={<Presentation className="h-8 w-8 text-brand" />}
  subtitle="Discovery Copilot"
  title="Never conduct another Discovery meeting alone."
  description="AI provides live buying signals, suggested questions, meeting intelligence, risk detection, and continuously updates candidate understanding."
/>

<ShowcaseCard
  preview={<Candidate360Preview />}
  icon={<Users className="h-8 w-8 text-brand" />}
  subtitle="Candidate 360"
  title="Everything important in one screen."
  description="Executive summaries, financial readiness, candidate intelligence, AI confidence, and recommendation readiness—all immediately available."
/>

<ShowcaseCard
  preview={<BrandStrategyPreview />}
  icon={<BrainCircuit className="h-8 w-8 text-brand" />}
  subtitle="Brand Strategy"
  title="Transparent recommendations you can defend."
  description="Every recommendation includes supporting evidence, consultant talking points, potential concerns, and the reasoning behind every decision."
/>

        </div>

      </Container>

    </section>
  );
}
