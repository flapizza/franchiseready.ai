import type { LiveIntelligenceEvent } from "../models/LiveIntelligenceEvent";

type Props = {
  events: LiveIntelligenceEvent[];
};

export function LiveIntelligenceFeed({
  events,
}: Props) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold">
          Live Intelligence
        </h2>

        <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
          LIVE
        </div>

      </div>

      <div className="mt-6 space-y-4">

        {events.map((event) => (
          <div
            key={event.id}
            className="rounded-xl border-l-4 border-blue-600 bg-slate-50 p-4"
          >

            <div className="flex items-center justify-between">

              <div className="font-semibold">
                {event.title}
              </div>

              <div className="text-xs text-slate-400">
                {event.timestamp}
              </div>

            </div>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {event.description}
            </p>

            {event.impact && (
              <div className="mt-3 rounded-lg bg-blue-100 px-3 py-2 text-sm font-semibold text-blue-700">
                {event.impact}
              </div>
            )}

          </div>
        ))}

      </div>

    </section>
  );
}