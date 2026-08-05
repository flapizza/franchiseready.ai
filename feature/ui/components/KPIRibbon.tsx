type KPIItem = {
  label: string;
  value: string | number;
  description?: string;
};

type Props = {
  items: KPIItem[];
};

export function KPIRibbon({
  items,
}: Props) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="grid divide-y divide-slate-200 lg:grid-cols-4 lg:divide-x lg:divide-y-0">

        {items.map((item) => (
          <Metric
            key={item.label}
            {...item}
          />
        ))}

      </div>

    </section>
  );
}

type MetricProps = KPIItem;

function Metric({
  label,
  value,
  description,
}: MetricProps) {
  return (
    <div className="px-8 py-7">

      <p className="text-xs font-semibold uppercase tracking-[0.20em] text-slate-500">
        {label}
      </p>

      <div className="mt-3 text-4xl font-bold tracking-tight text-blue-600">
        {value}
      </div>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {description}
        </p>
      )}

    </div>
  );
}