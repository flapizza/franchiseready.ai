import type { BrandRecommendation } from "../models/BrandRecommendation";

type Props = {
  recommendations: BrandRecommendation[];
};

export function BrandStrategyWorkspace({
  recommendations,
}: Props) {
  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-bold">
          AI Brand Strategy
        </h2>

        <p className="mt-2 text-slate-600">
          FranchiseReady AI continuously ranks franchise opportunities
          based on the candidate's evolving Discovery profile.
        </p>
      </div>

      <div className="space-y-5">

        {recommendations.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
          />
        ))}

      </div>

    </div>
  );
}

function BrandCard({
  brand,
}: {
  brand: BrandRecommendation;
}) {
  const movement =
    brand.score - brand.previousScore;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <h3 className="text-xl font-bold">
            {brand.brandName}
          </h3>

          <p className="mt-2 text-slate-600">
            {brand.explanation}
          </p>

        </div>

        <div className="text-right">

          <div className="text-3xl font-black">
            {brand.score}%
          </div>

          <div
            className={
              movement > 0
                ? "font-semibold text-emerald-600"
                : movement < 0
                ? "font-semibold text-red-600"
                : "font-semibold text-slate-500"
            }
          >
            {movement > 0
              ? `▲ +${movement}`
              : movement < 0
              ? `▼ ${movement}`
              : "—"}
          </div>

        </div>

      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">

        <div>

          <h4 className="font-semibold text-emerald-700">
            Strengths
          </h4>

          <ul className="mt-3 space-y-2">

            {brand.strengths.map((item) => (
              <li key={item}>
                ✓ {item}
              </li>
            ))}

          </ul>

        </div>

        <div>

          <h4 className="font-semibold text-amber-700">
            Remaining Concerns
          </h4>

          <ul className="mt-3 space-y-2">

            {brand.concerns.map((item) => (
              <li key={item}>
                • {item}
              </li>
            ))}

          </ul>

        </div>

      </div>

    </section>
  );
}