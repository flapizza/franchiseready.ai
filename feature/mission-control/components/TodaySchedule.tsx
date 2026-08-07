import type {
  TodayMeeting,
} from "../models/MissionControlState";

type Props = {
  meetings: TodayMeeting[];
};

export function TodaySchedule({
  meetings,
}: Props) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">

      <h2 className="text-2xl font-black">
        Today's Discovery
      </h2>

      <div className="mt-8 space-y-5">

        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            className="rounded-2xl border border-slate-200 p-5"
          >
            <div className="flex items-center justify-between">

              <div>

                <div className="text-xl font-bold">
                  {meeting.candidate}
                </div>

                <div className="mt-1 text-slate-500">
                  {meeting.time}
                </div>

              </div>

            </div>

            <div className="mt-5 rounded-xl bg-blue-50 p-4">

              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                AI Focus
              </div>

              <div className="mt-2 text-blue-900">
                {meeting.focus}
              </div>

            </div>

          </div>
        ))}

      </div>

    </section>
  );
}