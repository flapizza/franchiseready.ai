export function CandidateSpotlight() {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 text-white shadow-2xl">

      <div className="p-8">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-blue-200">
              Candidate Spotlight
            </p>

            <h2 className="mt-3 text-4xl font-black">
              John Smith
            </h2>

            <p className="mt-3 max-w-xl text-blue-100">
              AI believes John has the highest probability of
              becoming your next franchise owner if family
              alignment is confirmed this week.
            </p>

          </div>

          <div className="rounded-3xl bg-white/10 px-8 py-6 text-center backdrop-blur">

            <div className="text-6xl font-black text-emerald-300">
              96%
            </div>

            <div className="mt-2 text-sm uppercase tracking-widest">
              AI Confidence
            </div>

          </div>

        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-4">

          <Metric
            title="Readiness"
            value="92%"
          />

          <Metric
            title="Buying"
            value="High"
          />

          <Metric
            title="Best Brand"
            value="ERA"
          />

          <Metric
            title="Timeline"
            value="60 Days"
          />

        </div>

      </div>

      <div className="grid gap-px bg-white/10 md:grid-cols-3">

        <Action
          title="Open Candidate"
        />

        <Action
          title="Generate Referral Package"
        />

        <Action
          title="Launch Discovery"
        />

      </div>

    </section>
  );
}

function Metric({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white/5 p-5">

      <div className="text-3xl font-black">
        {value}
      </div>

      <div className="mt-2 text-sm text-blue-100">
        {title}
      </div>

    </div>
  );
}

function Action({
  title,
}: {
  title: string;
}) {
  return (
    <button className="bg-slate-900/70 p-6 text-left transition hover:bg-blue-700">

      <div className="font-bold">
        {title}
      </div>

    </button>
  );
}