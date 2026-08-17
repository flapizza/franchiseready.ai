"use client";

const steps = [
  "Analyzing leadership profile...",
  "Evaluating financial readiness...",
  "Building Candidate DNA...",
  "Identifying buying signals...",
  "Generating executive summary...",
  "Creating Discovery Guide...",
  "Ranking franchise categories...",
  "Preparing consultant briefing...",
];

export function AIAnalysisScreen() {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 p-12 text-white shadow-2xl">

      <div className="mx-auto max-w-3xl">

        <div className="flex items-center gap-3">

          <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-400" />

          <p className="text-sm uppercase tracking-[0.35em] text-emerald-300">
            FranGroove AI
          </p>

        </div>

        <h1 className="mt-6 text-5xl font-black">
          Building Your Franchise DNA
        </h1>

        <p className="mt-6 text-xl leading-8 text-blue-100">
          Please wait while our AI analyzes your responses
          and prepares your personalized intelligence report.
        </p>

        <div className="mt-12 space-y-5">

          {steps.map((step) => (

            <div
              key={step}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-black">
                ✓
              </div>

              <div className="text-lg">
                {step}
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}
