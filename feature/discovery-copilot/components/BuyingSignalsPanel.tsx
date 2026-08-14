import type { BuyingSignal } from "../models/BuyingSignal";

type Props = {
  signals: BuyingSignal[];
};

const strengthStyles = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-emerald-100 text-emerald-700",
};

export function BuyingSignalsPanel({
  signals,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold">
          Buying Signals
        </h2>

        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase text-emerald-700">
          LIVE
        </div>

      </div>

      <div className="mt-6 space-y-4">

        {signals.map((signal) => (
          <div
            key={signal.id}
            className="rounded-2xl border border-slate-200 p-5"
          >

            <div className="flex items-center justify-between">

              <div className="font-semibold text-slate-900">
                {signal.title}
              </div>

              <div
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  strengthStyles[
                    signal.strength
                  ]
                }`}
              >
                {signal.strength.toUpperCase()}
              </div>

            </div>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {signal.explanation}
            </p>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">

              <div
                className="h-full rounded-full bg-emerald-500"
                style={{
                  width: `${signal.confidence}%`,
                }}
              />

            </div>

            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Confidence {signal.confidence}%
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}