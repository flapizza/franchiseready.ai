type MetricProps = {
  title: string;
  score: number;
};

function DNAMetric({
  title,
  score,
}: MetricProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center justify-between">

        <span className="font-semibold text-slate-700">
          {title}
        </span>

        <span className="text-2xl font-black text-blue-700">
          {score}%
        </span>

      </div>

      <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
          style={{
            width: `${score}%`,
          }}
        />

      </div>

    </div>
  );
}

export function FranchiseDNAReport() {
  return (
    <div className="space-y-10">

      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 p-10 text-white shadow-2xl">

        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">
          Franchise DNA
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Candidate Intelligence Report
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-blue-100">
          FranGroove AI analyzed your assessment and
          generated your initial Franchise DNA profile.
        </p>

      </section>

      <section className="grid gap-6 md:grid-cols-2">

        <DNAMetric
          title="Leadership Intelligence"
          score={94}
        />

        <DNAMetric
          title="Financial Readiness"
          score={91}
        />

        <DNAMetric
          title="Sales Intelligence"
          score={93}
        />

        <DNAMetric
          title="Operations Intelligence"
          score={82}
        />

        <DNAMetric
          title="Lifestyle Alignment"
          score={88}
        />

        <DNAMetric
          title="Buying Confidence"
          score={90}
        />

      </section>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold">
          Executive Summary
        </h2>

        <p className="mt-5 leading-8 text-slate-600">
          Based on your assessment,
          FranGroove AI believes you possess
          strong executive leadership,
          excellent consultative communication skills,
          and financial readiness for professional
          service franchise opportunities.
        </p>

      </section>

      <section className="rounded-3xl border bg-white p-8 shadow-sm">

        <h2 className="text-2xl font-bold">
          Best Initial Franchise Categories
        </h2>

        <div className="mt-6 flex flex-wrap gap-3">

          {[
            "Executive Consulting",
            "B2B Services",
            "Professional Services",
            "Business Coaching",
            "Recurring Revenue",
          ].map((category) => (
            <div
              key={category}
              className="rounded-full bg-blue-100 px-5 py-3 font-medium text-blue-700"
            >
              {category}
            </div>
          ))}

        </div>

      </section>

    </div>
  );
}
