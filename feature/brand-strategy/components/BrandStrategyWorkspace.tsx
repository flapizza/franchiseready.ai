import {
  ArrowRight,
  BrainCircuit,
  ShieldAlert,
  Star,
  TrendingUp,
} from "lucide-react";

import type { BrandRecommendation } from "../models/BrandRecommendation";

type Props = {
  recommendations: BrandRecommendation[];
};

export function BrandStrategyWorkspace({
  recommendations,
}: Props) {
  if (recommendations.length === 0) {
    return null;
  }

  const [topRecommendation, ...alternatives] = recommendations;

  return (
    <div className="space-y-8">

      {/* HERO */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 shadow-2xl">

        <div className="p-10">

          <div className="flex flex-wrap items-start justify-between gap-10">

            <div className="max-w-4xl">

              <div className="inline-flex items-center gap-3 rounded-full bg-blue-500/10 px-4 py-2">

                <BrainCircuit className="h-5 w-5 text-blue-300" />

                <span className="text-xs font-bold uppercase tracking-[0.35em] text-blue-300">
                  AI BRAND STRATEGY
                </span>

              </div>

              <h1 className="mt-6 text-5xl font-black tracking-tight text-white">
                {topRecommendation.brandName}
              </h1>

              <p className="mt-6 text-xl leading-9 text-slate-300">
                {topRecommendation.summary}
              </p>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <Metric
                title="Overall Fit"
                value={topRecommendation.overallFit}
                color="emerald"
              />

              <Metric
                title="AI Confidence"
                value={topRecommendation.confidence}
                color="blue"
              />

            </div>

          </div>

        </div>

      </section>

      {/* EXECUTIVE SUMMARY */}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-8 py-6">

          <h2 className="text-2xl font-bold">
            Executive Recommendation
          </h2>

          <p className="mt-2 text-slate-500">
            AI explanation of why this brand ranks first.
          </p>

        </div>

        <div className="p-8">

          <p className="text-lg leading-9 text-slate-700">
            {topRecommendation.explanation}
          </p>

        </div>

      </section>

      <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">

        <div className="space-y-8">

          <InfoCard
            title="Why This Brand"
            icon={<Star className="h-5 w-5 text-emerald-600" />}
          >
            <BulletList
              items={topRecommendation.strengths}
              color="emerald"
            />
          </InfoCard>

          <InfoCard
            title="Consultant Discussion Guide"
            icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          >
            <BulletList
              items={topRecommendation.discussionPoints}
              color="blue"
            />
          </InfoCard>

          <InfoCard
            title="Supporting Evidence"
            icon={<BrainCircuit className="h-5 w-5 text-indigo-600" />}
          >
            <div className="space-y-4">

              {topRecommendation.evidence.map((item) => (

                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="flex items-center justify-between">

                    <h3 className="font-bold">
                      {item.title}
                    </h3>

                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                      {item.confidence}%
                    </span>

                  </div>

                  <p className="mt-3 text-slate-600">
                    {item.summary}
                  </p>

                </div>

              ))}

            </div>
          </InfoCard>

        </div>

        <div className="space-y-8">

          <InfoCard
            title="Remaining Risks"
            icon={<ShieldAlert className="h-5 w-5 text-amber-600" />}
          >
            <BulletList
              items={topRecommendation.risks}
              color="amber"
            />
          </InfoCard>

          <section className="rounded-3xl border border-blue-200 bg-blue-50 p-8">

            <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
              Recommended Next Step
            </p>

            <p className="mt-5 text-lg leading-8 text-slate-700">
              {topRecommendation.nextStep}
            </p>

            <button
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700"
            >
              Generate Referral Package

              <ArrowRight className="h-4 w-4" />

            </button>

          </section>

          {alternatives.length > 0 && (

            <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

              <h3 className="text-xl font-bold">
                Other Strong Matches
              </h3>

              <div className="mt-6 space-y-4">

                {alternatives.map((brand) => (

                  <div
                    key={brand.id}
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-5 py-4"
                  >

                    <div>

                      <div className="font-semibold">
                        {brand.brandName}
                      </div>

                      <div className="text-sm text-slate-500">
                        {brand.score}% Match
                      </div>

                    </div>

                    <div className="text-sm font-semibold text-slate-400">
                      #{brand.score}
                    </div>

                  </div>

                ))}

              </div>

            </section>

          )}

        </div>

      </div>

    </div>
  );
}

function Metric({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: "emerald" | "blue";
}) {
  const styles = {
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-400/20",
      value: "text-emerald-400",
      text: "text-emerald-300",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-400/20",
      value: "text-blue-400",
      text: "text-blue-300",
    },
  }[color];

  return (
    <div className={`min-w-[210px] rounded-2xl border ${styles.border} ${styles.bg} p-6`}>
      <div className={`text-xs font-bold uppercase tracking-widest ${styles.text}`}>
        {title}
      </div>

      <div className={`mt-4 text-6xl font-black ${styles.value}`}>
        {value}%
      </div>
    </div>
  );
}

function InfoCard({
  title,
  icon,
  children,
}: React.PropsWithChildren<{
  title: string;
  icon: React.ReactNode;
}>) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center gap-3 border-b border-slate-200 px-8 py-6">

        {icon}

        <h2 className="text-2xl font-bold">
          {title}
        </h2>

      </div>

      <div className="p-8">
        {children}
      </div>

    </section>
  );
}

function BulletList({
  items,
  color,
}: {
  items: string[];
  color: "emerald" | "blue" | "amber";
}) {
  const dot = {
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
  }[color];

  return (
    <div className="space-y-4">

      {items.map((item) => (

        <div
          key={item}
          className="flex items-start gap-4"
        >

          <div className={`mt-2 h-2.5 w-2.5 rounded-full ${dot}`} />

          <p className="leading-7 text-slate-700">
            {item}
          </p>

        </div>

      ))}

    </div>
  );
}