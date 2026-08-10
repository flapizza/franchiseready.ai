type Props = {
  risks: string[];
};

export function RiskDetectionPanel({
  risks,
}: Props) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold">
          Risk Detection
        </h2>

        <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          WATCHING
        </div>

      </div>

      <div className="mt-5 space-y-3">

        {risks.map((risk) => (
          <div
            key={risk}
            className="rounded-xl bg-amber-50 p-4"
          >
            ⚠ {risk}
          </div>
        ))}

      </div>

    </section>
  );
}