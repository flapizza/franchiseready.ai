import { Card } from "@/feature/ui";

type BrandMatch = {
  id: string;
  name: string;

  overallFit: number;

  leadership: number;
  sales: number;
  operations: number;
  financial: number;

  reasons: string[];
};

type Props = {
  brands: BrandMatch[];
};

export function BrandMatchMatrix({
  brands,
}: Props) {
  return (
    <Card
      title="Brand Compatibility"
      subtitle="AI-ranked franchise opportunities based on the candidate's complete intelligence profile."
    >
      <div className="space-y-8">
        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
          />
        ))}
      </div>
    </Card>
  );
}

type BrandCardProps = {
  brand: BrandMatch;
};

function BrandCard({
  brand,
}: BrandCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            {brand.name}
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Overall Compatibility
          </p>

        </div>

        <div className="text-right">

          <div className="text-5xl font-bold text-blue-600">
            {brand.overallFit}%
          </div>

          <p className="text-sm text-slate-500">
            AI Match
          </p>

        </div>

      </div>

      <div className="mt-8 space-y-5">

        <ScoreBar
          label="Leadership"
          score={brand.leadership}
        />

        <ScoreBar
          label="Sales"
          score={brand.sales}
        />

        <ScoreBar
          label="Operations"
          score={brand.operations}
        />

        <ScoreBar
          label="Financial"
          score={brand.financial}
        />

      </div>

      <div className="mt-8 rounded-2xl bg-slate-50 p-5">

        <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Why This Brand Fits
        </h4>

        <div className="mt-4 space-y-3">

          {brand.reasons.map((reason) => (
            <div
              key={reason}
              className="flex items-start gap-3"
            >
              <span className="mt-1 text-emerald-600">
                ✓
              </span>

              <span className="leading-7 text-slate-700">
                {reason}
              </span>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
}

type ScoreBarProps = {
  label: string;
  score: number;
};

function ScoreBar({
  label,
  score,
}: ScoreBarProps) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="font-medium text-slate-700">
          {label}
        </span>

        <span className="font-semibold text-slate-900">
          {score}%
        </span>

      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">

        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-700"
          style={{
            width: `${score}%`,
          }}
        />

      </div>

    </div>
  );
}