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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <header className="border-b border-slate-100 px-6 py-5">

        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Franchise Intelligence
        </p>

        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          Recommended Brand Matches
        </h2>

      </header>

      <div className="divide-y divide-slate-100">

        {brands.map((brand) => (
          <BrandCard
            key={brand.id}
            brand={brand}
          />
        ))}

      </div>

    </section>
  );
}

type BrandCardProps = {
  brand: BrandMatch;
};

function BrandCard({
  brand,
}: BrandCardProps) {
  return (
    <div className="space-y-6 p-6">

      <div className="flex items-center justify-between">

        <div>

          <h3 className="text-xl font-bold">
            {brand.name}
          </h3>

          <p className="text-sm text-slate-500">
            Overall Compatibility
          </p>

        </div>

        <div className="text-right">

          <p className="text-4xl font-bold text-blue-600">
            {brand.overallFit}%
          </p>

        </div>

      </div>

      <ScoreBar
        label="Leadership"
        value={brand.leadership}
      />

      <ScoreBar
        label="Sales"
        value={brand.sales}
      />

      <ScoreBar
        label="Operations"
        value={brand.operations}
      />

      <ScoreBar
        label="Financial"
        value={brand.financial}
      />

      <div>

        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Why this brand fits
        </p>

        <ul className="space-y-2">

          {brand.reasons.map((reason) => (
            <li
              key={reason}
              className="flex items-start gap-3"
            >
              <span className="mt-1 text-green-600">
                ✓
              </span>

              <span className="text-slate-700">
                {reason}
              </span>

            </li>
          ))}

        </ul>

      </div>

    </div>
  );
}

type ScoreBarProps = {
  label: string;
  value: number;
};

function ScoreBar({
  label,
  value,
}: ScoreBarProps) {
  return (
    <div>

      <div className="mb-2 flex items-center justify-between">

        <span className="text-sm font-medium text-slate-600">
          {label}
        </span>

        <span className="text-sm font-semibold">
          {value}
        </span>

      </div>

      <div className="h-2 rounded-full bg-slate-200">

        <div
          className="h-2 rounded-full bg-blue-600 transition-all"
          style={{
            width: `${value}%`,
          }}
        />

      </div>

    </div>
  );
}