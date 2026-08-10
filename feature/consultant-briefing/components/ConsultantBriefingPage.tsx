import type {
  ConsultantBriefing,
} from "../models/ConsultantBriefing";

type Props = {
  briefing: ConsultantBriefing;
};

function Card({
  title,
  children,
}: React.PropsWithChildren<{
  title: string;
}>) {
  return (
    <section className="rounded-3xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        {title}
      </h2>

      <div className="mt-5">
        {children}
      </div>
    </section>
  );
}

export function ConsultantBriefingPage({
  briefing,
}: Props) {
  return (
    <div className="space-y-8">

      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 p-10 text-white">

        <p className="text-sm uppercase tracking-[0.30em] text-blue-300">
          Consultant Briefing
        </p>

        <h1 className="mt-4 text-5xl font-black">
          {briefing.candidateName}
        </h1>

        <div className="mt-8 flex flex-wrap gap-6">

          <div>
            <div className="text-sm uppercase text-blue-300">
              AI Confidence
            </div>

            <div className="text-5xl font-black text-emerald-300">
              {briefing.aiConfidence}%
            </div>
          </div>

          <div>
            <div className="text-sm uppercase text-blue-300">
              Discovery Stage
            </div>

            <div className="text-3xl font-bold">
              {briefing.discoveryStage}
            </div>
          </div>

        </div>

      </section>

      <div className="grid gap-8 xl:grid-cols-2">

        <Card title="Today's Objective">
          <p className="leading-7">
            {briefing.meetingObjective}
          </p>
        </Card>

        <Card title="Next Best Action">
          <p className="text-xl font-bold text-blue-700">
            {briefing.nextBestAction}
          </p>
        </Card>

        <Card title="Discussion Topics">
          <ul className="space-y-3">
            {briefing.discussionTopics.map((topic) => (
              <li key={topic}>
                ✓ {topic}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Buying Signals">
          <ul className="space-y-3">
            {briefing.buyingSignals.map((signal) => (
              <li key={signal}>
                ✓ {signal}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Watch For">
          <ul className="space-y-3">
            {briefing.watchFor.map((risk) => (
              <li key={risk}>
                ⚠ {risk}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Suggested Closing">
          <p className="leading-7">
            {briefing.suggestedClosing}
          </p>
        </Card>

      </div>

    </div>
  );
}