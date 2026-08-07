type RadarItem = {
  id: string;

  type:
    | "opportunity"
    | "risk"
    | "pattern"
    | "momentum";

  title: string;

  description: string;
};

type Props = {
  items: RadarItem[];
};

export function AIOpportunityRadar({
  items,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold">
        AI Opportunity Radar
      </h2>

      <p className="mt-2 text-slate-600">
        Real-time observations generated throughout Discovery.
      </p>

      <div className="mt-8 space-y-5">

        {items.map((item) => (
          <RadarCard
            key={item.id}
            item={item}
          />
        ))}

      </div>

    </section>
  );
}

function RadarCard({
  item,
}: {
  item: RadarItem;
}) {
  const color =
    item.type === "opportunity"
      ? "bg-emerald-500"
      : item.type === "risk"
      ? "bg-red-500"
      : item.type === "pattern"
      ? "bg-blue-500"
      : "bg-amber-500";

  return (
    <div className="rounded-2xl border border-slate-200 p-5">

      <div className="flex items-start gap-4">

        <div
          className={`mt-1 h-3 w-3 rounded-full ${color}`}
        />

        <div>

          <h3 className="font-bold">
            {item.title}
          </h3>

          <p className="mt-2 text-slate-600">
            {item.description}
          </p>

        </div>

      </div>

    </div>
  );
}