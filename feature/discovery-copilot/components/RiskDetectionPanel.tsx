import type { MeetingRisk } from "../models/MeetingRisk";

type Props = {
  risks: MeetingRisk[];
};

const severityStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-rose-100 text-rose-700",
};

export function RiskDetectionPanel({
  risks,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold">
          Risk Detection
        </h2>

        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase text-amber-700">
          WATCHING
        </div>

      </div>

      <div className="mt-6 space-y-4">

        {risks.map((risk) => (
          <div
            key={risk.id}
            className="rounded-2xl border border-slate-200 p-5"
          >

            <div className="flex items-center justify-between">

              <div className="font-semibold text-slate-900">
                {risk.title}
              </div>

              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  severityStyles[
                    risk.severity
                  ]
                }`}
              >
                {risk.severity.toUpperCase()}
              </div>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {risk.explanation}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-rose-500"
                style={{
                  width: `${risk.confidence}%`,
                }}
              />

            </div>

            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Confidence {risk.confidence}%
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}