type Change = {
  id: string;
  title: string;
  description: string;
};

type Props = {
  changes: Change[];
};

export function WhatChangedFeed({
  changes,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-bold">
        What Changed?
      </h2>

      <p className="mt-2 text-slate-600">
        Live AI updates during Discovery.
      </p>

      <div className="mt-8 space-y-5">

        {changes.map((change) => (
          <div
            key={change.id}
            className="rounded-2xl border border-slate-200 p-5"
          >

            <h3 className="font-bold">
              {change.title}
            </h3>

            <p className="mt-2 text-slate-600">
              {change.description}
            </p>

          </div>
        ))}

      </div>

    </section>
  );
}