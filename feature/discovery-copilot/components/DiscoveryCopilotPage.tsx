import type { DiscoveryCopilotState } from "../models/DiscoveryCopilotState";

import { BuyingSignalsPanel } from "./BuyingSignalsPanel";
import { RiskDetectionPanel } from "./RiskDetectionPanel";

type Props = {
  state: DiscoveryCopilotState;
};

export function DiscoveryCopilotPage({
  state,
}: Props) {
  return (
    <div className="space-y-8">

      <section className="rounded-3xl bg-gradient-to-r from-slate-950 via-blue-900 to-indigo-900 p-10 text-white shadow-xl">

        <p className="text-sm uppercase tracking-[0.30em] text-blue-300">
          Discovery Copilot
        </p>

        <h1 className="mt-4 text-5xl font-black">
          Live AI Guidance
        </h1>

        <p className="mt-6 max-w-3xl text-xl leading-8 text-blue-100">
          FranGroove AI is continuously analyzing the Discovery
          conversation and helping you ask better questions,
          identify buying signals, and detect risks before they
          become objections.
        </p>

      </section>

      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">

        <section className="rounded-3xl border bg-white p-8 shadow-sm">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Conversation Intelligence
            </h2>

            <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              {state.confidence}% Confidence
            </div>

          </div>

          <div className="mt-8 space-y-4">

            {state.insights.map((insight) => (
              <div
                key={insight.id}
                className="rounded-xl border border-slate-200 p-5"
              >
                <div className="font-semibold text-slate-900">
                  {insight.title}
                </div>

                <div className="mt-2 text-sm leading-6 text-slate-600">
                  {insight.summary}
                </div>

              </div>
            ))}

          </div>

        </section>

        <div className="space-y-6">

          <BuyingSignalsPanel
            signals={state.buyingSignals}
          />

          <RiskDetectionPanel
            risks={state.risks}
          />

          <section className="rounded-3xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Recommended Topic
            </h2>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              {state.recommendedTopic}
            </div>

          </section>

          <section className="rounded-3xl border bg-white p-6 shadow-sm">

            <h2 className="text-xl font-bold">
              Suggested Next Question
            </h2>

            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-5">

              <div className="font-semibold text-blue-900">
                {state.suggestedQuestion.question}
              </div>

              <div className="mt-3 text-sm leading-6 text-slate-600">
                {state.suggestedQuestion.reason}
              </div>

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}