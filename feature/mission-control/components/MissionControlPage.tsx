import type {
  MissionControlState,
} from "../models/MissionControlState";

import { PriorityCard } from "./PriorityCard";
import { TodaySchedule } from "./TodaySchedule";

type Props = {
  state: MissionControlState;
};

export function MissionControlPage({
  state,
}: Props) {
  return (
    <div className="space-y-8">

      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 p-10 text-white">

        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">
          Mission Control
        </p>

        <h1 className="mt-4 text-5xl font-black">
          {state.greeting}, {state.consultant}
        </h1>

        <p className="mt-6 text-xl text-blue-100">
          {state.activeCandidates} active candidates are currently being
          monitored by FranchiseReady AI.
        </p>

      </section>

      <div className="grid gap-8 xl:grid-cols-[1.3fr_0.9fr]">

        <section className="space-y-6">

          {state.priorities.map((item) => (
            <PriorityCard
              key={item.id}
              title={item.title}
              description={item.description}
              action={item.action}
              priority={item.priority}
            />
          ))}

        </section>

        <TodaySchedule
          meetings={state.discoveryToday}
        />

      </div>

    </div>
  );
}