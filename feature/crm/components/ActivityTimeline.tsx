export type ActivityItem = {
  id: string;
  title: string;
  description: string;
  date: string;
};

type Props = {
  activities: ActivityItem[];
};

export function ActivityTimeline({
  activities,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <header className="border-b border-slate-100 px-6 py-5">

        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          Activity
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Candidate Timeline
        </h2>

      </header>

      <div className="space-y-6 p-6">

        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex gap-4"
          >
            <div className="mt-2 h-3 w-3 rounded-full bg-blue-600" />

            <div className="flex-1">

              <div className="flex items-center justify-between">

                <h3 className="font-semibold">
                  {activity.title}
                </h3>

                <span className="text-sm text-slate-500">
                  {activity.date}
                </span>

              </div>

              <p className="mt-2 text-slate-600">
                {activity.description}
              </p>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}