import { Card } from "@/feature/ui";

import type {
  ExecutiveRecommendation,
  ExecutiveEvidence,
  ExecutiveRisk,
} from "@/feature/intelligence/models/ExecutiveRecommendation";

type Props = {
  recommendation: ExecutiveRecommendation;
};

export function ExecutiveRecommendationPanel({
  recommendation,
}: Props) {
  const status = {
    ready: {
      label: "Ready for Brand Matching",
      badge:
        "bg-emerald-100 text-emerald-800 border border-emerald-300",
    },
    developing: {
      label: "Continue Discovery",
      badge:
        "bg-amber-100 text-amber-800 border border-amber-300",
    },
    "high-risk": {
      label: "High Risk",
      badge:
        "bg-red-100 text-red-700 border border-red-300",
    },
    "not-ready": {
      label: "Not Ready",
      badge:
        "bg-slate-200 text-slate-700 border border-slate-300",
    },
  }[recommendation.status];

  return (
    <Card className="overflow-hidden">

      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 px-10 py-12 text-center">

        <p className="text-xs font-semibold uppercase tracking-[0.30em] text-blue-200">
          AI Executive Recommendation
        </p>

        <h2 className="mt-4 text-4xl font-bold text-white">
          Discovery Intelligence Engine
        </h2>

        <div className="mt-10">

          <span
            className={`inline-flex rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] ${status.badge}`}
          >
            {status.label}
          </span>

        </div>

        <div className="mt-12">

          <div className="text-7xl font-black text-white">
            {recommendation.confidence}%
          </div>

          <p className="mt-3 text-sm font-semibold uppercase tracking-[0.30em] text-blue-200">
            AI Confidence
          </p>

        </div>

      </div>

      <div className="space-y-10 p-10">

        <section>

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-600">
            Executive Summary
          </p>

          <p className="mt-5 text-lg leading-9 text-slate-700">
            {recommendation.summary}
          </p>

        </section>

        <div className="grid gap-8 xl:grid-cols-2">

          <EvidencePanel
            evidence={recommendation.evidence}
          />

          <RiskPanel
            risks={recommendation.risks}
          />

        </div>
                <section className="rounded-3xl border border-blue-100 bg-blue-50 p-8">

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-700">
            Recommended Next Step
          </p>

          <h3 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
            {recommendation.recommendation}
          </h3>

          <div className="mt-8 grid gap-6 md:grid-cols-2">

            <MetricCard
              label="Award Probability"
              value="91%"
            />

            <MetricCard
              label="AI Confidence"
              value={`${recommendation.confidence}%`}
            />

          </div>

        </section>

      </div>

    </Card>
  );
}

type EvidencePanelProps = {
  evidence: ExecutiveEvidence[];
};

function EvidencePanel({
  evidence,
}: EvidencePanelProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8">

      <p className="text-xs font-semibold uppercase tracking-[0.20em] text-emerald-700">
        Evidence
      </p>

      <div className="mt-6 space-y-5">

        {evidence.map((item) => (
          <div
            key={item.id}
            className="flex gap-4"
          >
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white">
              ✓
            </div>

            <div>

              <h3 className="font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {item.description}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}

type RiskPanelProps = {
  risks: ExecutiveRisk[];
};

function RiskPanel({
  risks,
}: RiskPanelProps) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8">

      <p className="text-xs font-semibold uppercase tracking-[0.20em] text-amber-700">
        Remaining Risks
      </p>

      <div className="mt-6 space-y-5">

        {risks.map((risk) => (
          <div
            key={risk.id}
            className="flex gap-4"
          >
            <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
              !
            </div>

            <div>

              <h3 className="font-semibold text-slate-900">
                {risk.title}
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                {risk.description}
              </p>

            </div>

          </div>
        ))}

        {risks.length === 0 && (
          <p className="leading-7 text-slate-600">
            No significant risks were identified during the
            current discovery session.
          </p>
        )}

      </div>

    </section>
  );
}

type MetricCardProps = {
  label: string;
  value: string;
};

function MetricCard({
  label,
  value,
}: MetricCardProps) {
  return (
    <section className="rounded-2xl bg-white p-6 text-center shadow-sm">

      <p className="text-xs font-semibold uppercase tracking-[0.20em] text-slate-500">
        {label}
      </p>

      <div className="mt-3 text-4xl font-black text-blue-700">
        {value}
      </div>

    </section>
  );
}