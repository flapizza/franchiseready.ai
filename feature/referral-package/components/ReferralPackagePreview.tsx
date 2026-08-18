import {
  ArrowRight,
  Award,
  BrainCircuit,
  ShieldAlert,
  Star,
} from "lucide-react";

import type { ReferralPackage } from "../models/ReferralPackage";

type Props = {
  referral: ReferralPackage;
};

export function ReferralPackagePreview({
  referral,
}: Props) {
  return (
    <div className="space-y-8">

      {/* HERO */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 shadow-2xl">

        <div className="p-10">

          <div className="flex flex-wrap items-start justify-between gap-10">

            <div>

              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-blue-300">
                AI REFERRAL PACKAGE
              </p>

              <h1 className="mt-5 text-5xl font-black tracking-tight text-white">
                {referral.candidate.fullName}
              </h1>

              <p className="mt-5 text-xl text-slate-300">
                Prepared for{" "}
                <span className="font-semibold text-white">
                  {referral.brand.name}
                </span>
              </p>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              <Metric
                label="Readiness"
                value={referral.candidate.readiness}
                color="emerald"
              />

              <Metric
                label="AI Confidence"
                value={referral.candidate.confidence}
                color="blue"
              />

            </div>

          </div>

        </div>

      </section>

      {/* SNAPSHOT */}

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

        <div className="border-b border-slate-200 px-8 py-6">

          <h2 className="text-2xl font-bold">
            Candidate Snapshot
          </h2>

        </div>

        <div className="grid gap-8 p-8 md:grid-cols-3">

          <Info
            label="Consultant"
            value={referral.consultant.consultantName}
          />

          <Info
            label="Company"
            value={referral.consultant.companyName}
          />

          <Info
            label="Brand Fit"
            value={`${referral.brand.overallFit}%`}
          />

        </div>

      </section>

      <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">

        <div className="space-y-8">

          <Panel
            title="Executive Summary"
            icon={<BrainCircuit className="h-5 w-5 text-blue-600" />}
          >

            <p className="text-lg leading-9 text-slate-700">
              {referral.executiveSummary}
            </p>

          </Panel>

          <Panel
            title="Candidate Strengths"
            icon={<Award className="h-5 w-5 text-emerald-600" />}
          >

            <BulletList
              items={referral.strengths}
              color="emerald"
            />

          </Panel>

        </div>

        <div className="space-y-8">

          <Panel
            title="Remaining Risks"
            icon={<ShieldAlert className="h-5 w-5 text-amber-600" />}
          >

            <BulletList
              items={referral.remainingRisks}
              color="amber"
            />

          </Panel>

          <Panel
            title="Consultant Recommendation"
            icon={<Star className="h-5 w-5 text-blue-600" />}
          >

            <p className="leading-8 text-slate-700">
              {referral.consultantRecommendation}
            </p>

          </Panel>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Generate PDF

            <ArrowRight className="h-4 w-4" />

          </button>

        </div>

      </div>

    </div>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "emerald" | "blue";
}) {
  const theme = {
    emerald: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-400/20",
      text: "text-emerald-300",
      value: "text-emerald-400",
    },
    blue: {
      bg: "bg-blue-500/10",
      border: "border-blue-400/20",
      text: "text-blue-300",
      value: "text-blue-400",
    },
  }[color];

  return (
    <div className={`min-w-[210px] rounded-2xl border ${theme.border} ${theme.bg} p-6`}>

      <div className={`text-xs font-bold uppercase tracking-widest ${theme.text}`}>
        {label}
      </div>

      <div className={`mt-4 text-6xl font-black ${theme.value}`}>
        {value}%
      </div>

    </div>
  );
}

function Panel({
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
  color: "emerald" | "amber";
}) {
  const dot =
    color === "emerald"
      ? "bg-emerald-500"
      : "bg-amber-500";

  return (
    <div className="space-y-4">

      {items.map((item, index) => (

        <div
          key={`${index}:${item}`}
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

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>

      <div className="text-xs font-semibold uppercase tracking-widest text-slate-500">
        {label}
      </div>

      <div className="mt-2 text-lg font-semibold text-slate-900">
        {value}
      </div>

    </div>
  );
}
