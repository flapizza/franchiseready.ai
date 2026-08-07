import type {
  ConsultantHomeState,
} from "../models/ConsultantHomeState";

type Props = {
  state: ConsultantHomeState;
};

export function ConsultantHomeHero({
  state,
}: Props) {
  return (
    <section className="rounded-3xl bg-slate-950 p-10 text-white shadow-xl">

      <p className="text-sm uppercase tracking-[0.25em] text-blue-300">
        FranchiseReady AI
      </p>

      <h1 className="mt-3 text-5xl font-black">
        {state.greeting}
      </h1>

      <p className="mt-6 text-xl text-slate-300">
        {state.activeCandidates} active candidates
      </p>

      <div className="mt-10 rounded-2xl bg-blue-600 p-6">

        <p className="text-sm uppercase tracking-wide">
          Weekly Insight
        </p>

        <p className="mt-3 text-2xl font-bold">
          {state.weeklyInsight}
        </p>

      </div>

    </section>
  );
}