import { Card } from "@/feature/ui";

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
    <Card
      title="Activity Timeline"
      subtitle="Chronological history generated throughout the candidate journey."
    >
      <div className="relative ml-4 border-l-2 border-slate-200">

        {activities.map((activity, index) => (
          <TimelineEvent
            key={activity.id}
            activity={activity}
            isLast={index === activities.length - 1}
          />
        ))}

      </div>
    </Card>
  );
}

type TimelineEventProps = {
  activity: ActivityItem;
  isLast: boolean;
};

function TimelineEvent({
  activity,
  isLast,
}: TimelineEventProps) {
  return (
    <div
      className={`relative pl-10 ${
        isLast ? "" : "pb-10"
      }`}
    >
      <div className="absolute -left-[13px] top-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-blue-600 shadow">
        <div className="h-2 w-2 rounded-full bg-white" />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="flex items-start justify-between gap-4">

          <div>

            <h3 className="text-lg font-semibold text-slate-900">
              {activity.title}
            </h3>

            <p className="mt-3 leading-7 text-slate-600">
              {activity.description}
            </p>

          </div>

          <div className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-600">
            {activity.date}
          </div>

        </div>

      </div>

    </div>
  );
}