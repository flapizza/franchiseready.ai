import { DailyBriefEngine } from "../runtime/DailyBriefEngine";
import type { MissionControlState } from "../models/MissionControlState";

import { AICommandCenter } from "./AICommandCenter";
import { CandidateSpotlight } from "./CandidateSpotlight";

type Props = {
  state: MissionControlState;
};

export function MissionControlPage({
  state,
}: Props) {
    const dailyBrief = new DailyBriefEngine().generate(state);
  return (
    <div className="space-y-8">

      {/* ===========================================================
          HERO
      ============================================================ */}

      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 shadow-2xl">

        <div className="p-10">

          <div className="flex flex-wrap items-start justify-between gap-10">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-3 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2">

                <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />

                <span className="text-xs font-bold uppercase tracking-[0.35em] text-emerald-300">
                  AI ONLINE
                </span>

              </div>

              <h1 className="mt-8 text-5xl font-black tracking-tight text-white xl:text-6xl">
                {state.greeting}, {state.consultant}
              </h1>

              <p className="mt-5 text-xl leading-9 text-slate-300">
                Here's what deserves your attention today.
              </p>

            </div>

            <div className="min-w-[280px] rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur">

              <p className="text-sm font-semibold uppercase tracking-[0.30em] text-slate-400">
                Overall Pipeline Health
              </p>

              <div className="mt-5 flex items-end gap-3">

                <span className="text-6xl font-black text-emerald-400">
                  92
                </span>

                <span className="pb-2 text-lg font-semibold text-emerald-300">
                  Excellent
                </span>

              </div>

              <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-700">

                <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-emerald-400 to-blue-400" />

              </div>

              <p className="mt-4 text-sm text-slate-400">
                Up 4% from last week
              </p>

            </div>

          </div>

          {/* =======================================================
              AI DAILY BRIEF
          ======================================================== */}

          <div className="mt-10 rounded-3xl border border-blue-400/20 bg-blue-500/10 p-8">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-lg font-bold text-white">
                AI
              </div>

              <div>

                <h2 className="text-xl font-bold text-white">
  AI Daily Brief
</h2>

<p className="text-sm text-blue-200">
  Generated automatically from today's pipeline
</p>
  </div>

</div>

<p className="mt-6 max-w-4xl text-lg leading-9 text-slate-200">
  {dailyBrief.summary}
</p>

<div className="mt-8 space-y-3">

  {dailyBrief.priorities.map((priority) => (

    <div
      key={priority}
      className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"
    >
      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />

      <span className="text-slate-200">
        {priority}
      </span>

    </div>

  ))}

</div>

<div className="mt-8 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-5">

  <div className="text-sm font-semibold uppercase tracking-wider text-emerald-300">
    AI Recommendation
  </div>

  <p className="mt-3 text-lg text-white">
    {dailyBrief.recommendation}
  </p>

</div>

         </div>
          {/* =======================================================
              KPI RIBBON
          ======================================================== */}

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">

            <Metric
              value={state.activeCandidates.toString()}
              label="Active Candidates"
            />

            <Metric
              value={state.discoveryToday.length.toString()}
              label="Discovery Meetings"
            />

            <Metric
              value="3"
              label="Ready for Brand Strategy"
            />

            <Metric
              value="5"
              label="AI Priority Actions"
            />

          </div>

        </div>

      </section>

            {/* ===========================================================
          AI COMMAND CENTER
      ============================================================ */}

      <AICommandCenter />

      {/* ===========================================================
          CANDIDATE SPOTLIGHT
      ============================================================ */}

      <CandidateSpotlight />

      {/* ===========================================================
          MAIN WORKSPACE
      ============================================================ */}

      <div className="grid gap-8 xl:grid-cols-[1.7fr_1fr]">

        {/* =======================================================
            LEFT COLUMN
        ======================================================== */}

        <div className="space-y-8">

          <Card
            title="Today's Highest Priority Candidates"
            subtitle="AI ranked by urgency and business impact"
          >

            {state.priorities.map((priority) => (

              <div
                key={priority.id}
                className="rounded-2xl border border-slate-200 bg-gradient-to-r from-white to-slate-50 p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex flex-wrap items-start justify-between gap-6">

                  <div className="flex-1">

                    <div className="flex items-center gap-3">

                      <Badge value={priority.priority} />

                      <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
                        AI Priority
                      </span>

                    </div>

                    <h3 className="mt-4 text-2xl font-bold text-slate-900">
                      {priority.title}
                    </h3>

                    <p className="mt-4 leading-7 text-slate-600">
                      {priority.description}
                    </p>

                  </div>

                  <div className="w-full max-w-xs rounded-2xl bg-slate-100 p-5">

                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Recommended Action
                    </p>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {priority.action}
                    </p>

                    <button className="mt-5 w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700">
                      Open Candidate
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </Card>

          <Card
            title="Live Intelligence Feed"
            subtitle="Everything AI has learned since your last login"
          >

            <FeedItem
              time="9:42 AM"
              title="Buying confidence decreased"
              detail="John Smith delayed selecting a Discovery Day. Follow-up recommended before noon."
            />

            <FeedItem
              time="9:18 AM"
              title="Candidate promoted"
              detail="Sarah Williams reached 97% readiness and is ready for Brand Strategy."
            />

            <FeedItem
              time="8:56 AM"
              title="Recommendation updated"
              detail="ERA Group moved into the #1 position after leadership scoring increased."
            />

            <FeedItem
              time="8:31 AM"
              title="Discovery intelligence saved"
              detail="Executive leadership validation completed and candidate profile updated."
            />

          </Card>

        </div>

        {/* =======================================================
            RIGHT COLUMN
        ======================================================== */}

        <div className="space-y-8">

          <Card
            title="Today's Agenda"
            subtitle="AI prepared every meeting"
          >

            {state.discoveryToday.map((meeting) => (

              <div
                key={meeting.id}
                className="rounded-2xl border border-slate-200 bg-white p-5"
              >

                <div className="flex items-center justify-between">

                  <span className="text-lg font-bold">
                    {meeting.time}
                  </span>

                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase text-blue-700">
                    Ready
                  </span>

                </div>

                <h3 className="mt-3 text-xl font-semibold">
                  {meeting.candidate}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {meeting.focus}
                </p>

                <button className="mt-5 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 font-semibold text-blue-700 transition hover:bg-blue-100">
                  Prepare Briefing
                </button>

              </div>

            ))}

          </Card>

          <Card
            title="Ready for Introduction"
            subtitle="Highest confidence candidate"
          >

            <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">

              <h3 className="text-2xl font-bold">
                Sarah Williams
              </h3>

              <p className="mt-2 text-slate-600">
                ERA Group
              </p>

              <div className="mt-8 flex items-center justify-between">

                <div>

                  <div className="text-5xl font-black text-emerald-600">
                    97%
                  </div>

                  <div className="text-sm text-slate-500">
                    Recommendation Confidence
                  </div>

                </div>

                <button className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700">
                  Generate Referral
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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">

      <div className="text-5xl font-black text-white">
        {value}
      </div>

      <div className="mt-3 text-sm font-medium uppercase tracking-wide text-slate-300">
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
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 bg-slate-50 px-8 py-6">

        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {subtitle}
        </p>

      </div>

      <div className="space-y-5 p-8">
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
  const styles = {
    High:
      "bg-red-100 text-red-700 border-red-200",
    Medium:
      "bg-amber-100 text-amber-700 border-amber-200",
    Low:
      "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase ${
        styles[value as keyof typeof styles] ??
        "bg-slate-100 text-slate-700 border-slate-200"
      }`}
    >
      {value}
    </span>
  );
}

function FeedItem({
  time,
  title,
  detail,
}: {
  time: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="flex gap-5">

      <div className="flex flex-col items-center">

        <div className="h-3 w-3 rounded-full bg-emerald-500" />

        <div className="mt-1 h-full w-px bg-slate-200" />

      </div>

      <div className="flex-1 pb-5">

        <div className="flex items-center justify-between">

          <h3 className="font-semibold text-slate-900">
            {title}
          </h3>

          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {time}
          </span>

        </div>

        <p className="mt-2 leading-7 text-slate-600">
          {detail}
        </p>

      </div>

    </div>
  );
}