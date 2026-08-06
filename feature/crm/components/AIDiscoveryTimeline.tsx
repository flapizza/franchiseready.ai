import { Card } from "@/feature/ui";

export type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  description: string;
  type:
    | "info"
    | "success"
    | "warning";
};

type Props = {
  events: TimelineEvent[];
};

export function AIDiscoveryTimeline({
  events,
}: Props) {
  return (
    <Card
      title="AI Discovery Timeline"
      subtitle="Real-time intelligence generated throughout the conversation."
    >
      <div className="space-y-6">

        {events.map((event) => (
          <TimelineItem
            key={event.id}
            event={event}
          />
        ))}

      </div>
    </Card>
  );
}

type TimelineItemProps = {
  event: TimelineEvent;
};

function TimelineItem({
  event,
}: TimelineItemProps) {
  const styles = {
    info: {
      dot: "bg-blue-600",
      border: "border-blue-200",
      bg: "bg-blue-50",
    },
    success: {
      dot: "bg-emerald-600",
      border: "border-emerald-200",
      bg: "bg-emerald-50",
    },
    warning: {
      dot: "bg-amber-500",
      border: "border-amber-200",
      bg: "bg-amber-50",
    },
  } as const;

  const style = styles[event.type];

  return (
    <div className="flex gap-5">

      <div className="flex flex-col items-center">

        <div
          className={`h-4 w-4 rounded-full ${style.dot}`}
        />

        <div className="mt-2 h-full w-px bg-slate-200" />

      </div>

      <section
        className={`flex-1 rounded-2xl border p-5 ${style.border} ${style.bg}`}
      >

        <p className="text-xs font-semibold uppercase tracking-[0.20em] text-slate-500">
          {event.time}
        </p>

        <h3 className="mt-2 text-lg font-bold text-slate-900">
          {event.title}
        </h3>

        <p className="mt-3 leading-7 text-slate-700">
          {event.description}
        </p>

      </section>

    </div>
  );
}