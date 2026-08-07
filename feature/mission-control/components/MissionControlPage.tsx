import type { MissionControlState } from "../models/MissionControlState";

import { AICommandCenter } from "./AICommandCenter";
import { CandidateSpotlight } from "./CandidateSpotlight";

type Props = {
  state: MissionControlState;
};

export function MissionControlPage({
  state,
}: Props) {
  return (
    <div className="space-y-8">

      {/* HERO */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-10 text-white shadow-2xl">

        <div className="flex flex-wrap items-start justify-between gap-8">

          <div>

            <div className="flex items-center gap-3">

              <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />

              <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
                AI ONLINE
              </span>

            </div>

            <h1 className="mt-6 text-5xl font-black tracking-tight">
              {state.greeting}, {state.consultant}
            </h1>

            <p className="mt-4 max-w-2xl text-xl text-slate-300">
              FranchiseReady AI is monitoring your pipeline,
              identifying buying signals, and prioritizing your next
              best actions.
            </p>

          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">

            <p className="text-sm uppercase tracking-widest text-slate-400">
              Portfolio Health
            </p>

            <div className="mt-3 text-5xl font-black text-emerald-400">
              92%
            </div>

            <p className="mt-2 text-sm text-slate-300">
              +4% this week
            </p>

          </div>

        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-4">

          <Metric
            value={state.activeCandidates.toString()}
            label="Active Candidates"
          />

          <Metric
            value="3"
            label="Ready Today"
          />

          <Metric
            value={state.discoveryToday.length.toString()}
            label="Meetings"
          />

          <Metric
            value="5"
            label="AI Opportunities"
          />

        </div>

      </section>

      <AICommandCenter />

      <CandidateSpotlight />

      {/* MAIN GRID */}

      <div className="grid gap-8 xl:grid-cols-3">

        {/* LEFT */}

        <div className="space-y-6 xl:col-span-2">

          <Card
            title="🔥 AI Priority Queue"
            subtitle="Highest priority opportunities"
          >

            {state.priorities.map((priority) => (

              <div
                key={priority.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-5"
              >

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <h3 className="text-lg font-bold">
                      {priority.title}
                    </h3>

                    <p className="mt-2 text-slate-600">
                      {priority.description}
                    </p>

                  </div>

                  <Badge
                    value={priority.priority}
                  />

                </div>

                <button
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  {priority.action}
                </button>

              </div>

            ))}

          </Card>

          <Card
            title="🤖 AI Activity Feed"
            subtitle="Latest intelligence"
          >

            <FeedItem
              title="Buying signal detected"
              detail="John Smith asked about funding timelines."
            />

            <FeedItem
              title="Confidence increased"
              detail="Sarah Williams moved from 91% to 97%."
            />

            <FeedItem
              title="Brand ranking updated"
              detail="ERA Group moved to the #1 recommendation."
            />

            <FeedItem
              title="Discovery completed"
              detail="Executive leadership validated."
            />

          </Card>

        </div>

        {/* RIGHT */}

        <div className="space-y-6">

          <Card
            title="📅 Today's Meetings"
            subtitle="Discovery schedule"
          >

            {state.discoveryToday.map((meeting) => (

              <div
                key={meeting.id}
                className="rounded-xl border border-slate-200 p-4"
              >

                <div className="font-bold">
                  {meeting.time}
                </div>

                <div className="mt-1 text-lg font-semibold">
                  {meeting.candidate}
                </div>

                <p className="mt-2 text-sm text-slate-600">
                  {meeting.focus}
                </p>

              </div>

            ))}

          </Card>

          <Card
            title="⭐ Ready for Introduction"
            subtitle="Highest confidence candidate"
          >

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">

              <div className="text-lg font-bold">
                Sarah Williams
              </div>

              <div className="mt-2 text-sm text-slate-600">
                ERA Group
              </div>

              <div className="mt-5 flex items-center justify-between">

                <span className="text-4xl font-black text-emerald-600">
                  97%
                </span>

                <button className="rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white">
                  Generate Package
                </button>

              </div>

            </div>

          </Card>

        </div>

      </div>

    </div>
  );
}

function Metric({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">

      <div className="text-4xl font-black">
        {value}
      </div>

      <div className="mt-2 text-sm text-slate-300">
        {label}
      </div>

    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: React.PropsWithChildren<{
  title: string;
  subtitle: string;
}>) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-2xl font-bold">
        {title}
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        {subtitle}
      </p>

      <div className="mt-6 space-y-4">
        {children}
      </div>

    </section>
  );
}

function Badge({
  value,
}: {
  value: string;
}) {
  return (
    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-bold uppercase text-red-700">
      {value}
    </span>
  );
}

function FeedItem({
  title,
  detail,
}: {
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-4">

      <div className="mt-2 h-3 w-3 rounded-full bg-emerald-500" />

      <div>

        <div className="font-semibold">
          {title}
        </div>

        <div className="text-sm text-slate-600">
          {detail}
        </div>

      </div>

    </div>
  );
}