type Props = {
  signals: string[];
};

export function BuyingSignalsPanel({
  signals,
}: Props) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold">
          Buying Signals
        </h2>

        <div className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
          LIVE
        </div>

      </div>

      <div className="mt-5 space-y-3">

        {signals.map((signal) => (
          <div
            key={signal}
            className="rounded-xl bg-emerald-50 p-4"
          >
            ✓ {signal}
          </div>
        ))}

      </div>

    </section>
  );
}