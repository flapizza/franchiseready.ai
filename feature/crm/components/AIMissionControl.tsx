type Mission = {
  priority: "critical" | "high" | "medium";

  title: string;

  description: string;

  action: string;
};

type Props = {
  missions: Mission[];
};

export function AIMissionControl({
  missions,
}: Props) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-slate-950 p-8 text-white shadow-xl">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-300">
            FranGroove AI
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Mission Control
          </h2>

          <p className="mt-3 max-w-2xl text-slate-300">
            The AI has analyzed the assessment, Discovery history,
            Candidate Evolution and current buying signals.
            These are the highest-priority recommendations.
          </p>

        </div>

      </div>

      <div className="mt-10 space-y-5">

        {missions.map((mission) => (
          <MissionCard
            key={mission.title}
            mission={mission}
          />
        ))}

      </div>

    </section>
  );
}

function MissionCard({
  mission,
}: {
  mission: Mission;
}) {
  const color =
    mission.priority === "critical"
      ? "border-red-500"
      : mission.priority === "high"
      ? "border-amber-500"
      : "border-blue-500";

  return (
    <div
      className={`rounded-2xl border-l-4 ${color} bg-white/5 p-6`}
    >

      <h3 className="text-xl font-bold">
        {mission.title}
      </h3>

      <p className="mt-3 text-slate-300 leading-7">
        {mission.description}
      </p>

      <div className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold">
        Recommended Action

        <div className="mt-2 font-normal">
          {mission.action}
        </div>

      </div>

    </div>
  );
}
