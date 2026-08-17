import type {
  AgendaMeetingState,
} from "../models/MissionControlState";

type Props = {
  meetings: AgendaMeetingState[];
};

export function TodaySchedule({
  meetings,
}: Props) {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-950">
            Today&apos;s Agenda
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            AI prepared every meeting
          </p>
        </div>

        <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
          {meetings.length} Meetings
        </div>
      </div>

      <div className="mt-8 space-y-5">
        {meetings.map((meeting) => (
          <article
            key={meeting.id}
            className="rounded-2xl border border-slate-200 p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-black text-slate-950">
                  {meeting.time}
                </div>

                <div className="mt-2 text-xl font-bold text-slate-900">
                  {meeting.candidateName}
                </div>
              </div>

              <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                {meeting.status}
              </div>
            </div>

            <p className="mt-3 leading-6 text-slate-600">
              {meeting.objective}
            </p>

            <a
              href={meeting.briefingHref}
              className="mt-5 flex w-full items-center justify-center rounded-xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
            >
              Prepare Briefing
            </a>
          </article>
        ))}

        {meetings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
            No meetings scheduled for today.
          </div>
        )}
      </div>
    </section>
  );
}