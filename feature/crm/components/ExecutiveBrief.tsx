import { Card } from "@/feature/ui";

import type {
  ExecutiveRecommendation,
  ExecutiveEvidence,
  ExecutiveRisk,
} from "@/feature/intelligence/models/ExecutiveRecommendation";

type Props = {
  recommendation: ExecutiveRecommendation;
};

export function ExecutiveBrief({
  recommendation,
}: Props) {
  return (
    <Card className="overflow-hidden rounded-3xl">

      <div className="border-b border-slate-200 bg-white px-10 py-8">

        <p className="text-xs font-semibold uppercase tracking-[0.30em] text-blue-600">
          Executive Brief
        </p>

        <div className="mt-3 flex items-center justify-between">

          <div>

            <h2 className="text-4xl font-black tracking-tight text-slate-900">
              Prepared by FranGroove AI
            </h2>

            <p className="mt-3 max-w-3xl text-lg leading-8 text-slate-600">
              Executive assessment generated from the candidate’s
              Discovery conversation, assessment profile, and AI
              intelligence engine.
            </p>

          </div>

          <div className="rounded-3xl bg-blue-600 px-8 py-6 text-center text-white shadow-lg">

            <div className="text-5xl font-black">
              {recommendation.confidence}%
            </div>

            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.25em]">
              AI Confidence
            </p>

          </div>

        </div>

      </div>

      <div className="space-y-10 p-10">

        <section>

          <StatusBadge
            status={recommendation.status}
          />

          <h3 className="mt-6 text-2xl font-bold text-slate-900">
            Executive Summary
          </h3>

          <p className="mt-5 text-lg leading-9 text-slate-700">
            {recommendation.summary}
          </p>

        </section>

        <div className="grid gap-8 lg:grid-cols-2">

          <EvidenceSection
            evidence={recommendation.evidence}
          />

          <RiskSection
            risks={recommendation.risks}
          />

        </div>
                <section className="rounded-3xl border border-blue-100 bg-blue-50 p-8">

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-blue-700">
            Recommended Next Actions
          </p>

          <div className="mt-6 space-y-4">

            <ActionRow
              number={1}
              text="Schedule Validation Call"
            />

            <ActionRow
              number={2}
              text="Present Top Three Franchise Brands"
            />

            <ActionRow
              number={3}
              text="Introduce Financing Resources"
            />

          </div>

        </section>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-8">

          <p className="text-xs font-semibold uppercase tracking-[0.20em] text-slate-600">
            Why AI Reached This Conclusion
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">

            <FactorCard
              title="Leadership"
              score={96}
            />

            <FactorCard
              title="Financial"
              score={91}
            />

            <FactorCard
              title="Behavior"
              score={94}
            />

            <FactorCard
              title="Discovery"
              score={95}
            />

          </div>

        </section>

      </div>

    </Card>
  );
}

function StatusBadge({
  status,
}: {
  status: ExecutiveRecommendation["status"];
}) {
  const config = {
    ready: {
      text: "Ready for Brand Matching",
      classes:
        "bg-emerald-100 text-emerald-800 border border-emerald-300",
    },
    developing: {
      text: "Continue Discovery",
      classes:
        "bg-amber-100 text-amber-800 border border-amber-300",
    },
    "high-risk": {
      text: "High Risk",
      classes:
        "bg-red-100 text-red-800 border border-red-300",
    },
    "not-ready": {
      text: "Not Ready",
      classes:
        "bg-slate-200 text-slate-700 border border-slate-300",
    },
  }[status];

  return (
    <span
      className={`inline-flex rounded-full px-5 py-2 text-sm font-semibold uppercase tracking-wide ${config.classes}`}
    >
      {config.text}
    </span>
  );
}

function EvidenceSection({
  evidence,
}: {
  evidence: ExecutiveEvidence[];
}) {
  return (
    <section>

      <h3 className="text-xl font-bold text-slate-900">
        Key Strengths
      </h3>

      <div className="mt-5 space-y-4">

        {evidence.map((item) => (
          <div
            key={item.id}
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
          >
            <div className="flex items-center justify-between">

              <h4 className="font-semibold text-slate-900">
                {item.title}
              </h4>

              <span className="rounded-full bg-emerald-600 px-3 py-1 text-sm font-bold text-white">
                {item.score}
              </span>

            </div>

            <p className="mt-3 leading-7 text-slate-700">
              {item.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}

function RiskSection({
  risks,
}: {
  risks: ExecutiveRisk[];
}) {
  return (
    <section>

      <h3 className="text-xl font-bold text-slate-900">
        Remaining Risks
      </h3>

      <div className="mt-5 space-y-4">

        {risks.length === 0 ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
            <p className="font-medium text-emerald-800">
              No significant risks identified.
            </p>
          </div>
        ) : (
          risks.map((risk) => (
            <div
              key={risk.id}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
            >
              <div className="flex items-center justify-between">

                <h4 className="font-semibold text-slate-900">
                  {risk.title}
                </h4>

                <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold uppercase text-white">
                  {risk.severity}
                </span>

              </div>

              <p className="mt-3 leading-7 text-slate-700">
                {risk.description}
              </p>

            </div>
          ))
        )}

      </div>

    </section>
  );
}

function ActionRow({
  number,
  text,
}: {
  number: number;
  text: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">

      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
        {number}
      </div>

      <p className="font-medium text-slate-700">
        {text}
      </p>

    </div>
  );
}

function FactorCard({
  title,
  score,
}: {
  title: string;
  score: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center">

      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </p>

      <div className="mt-3 text-4xl font-black text-blue-700">
        {score}
      </div>

    </div>
  );
}
