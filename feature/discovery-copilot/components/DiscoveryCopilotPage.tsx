import type {
  DiscoveryCopilotState,
} from "../models/DiscoveryCopilotState";

import { BuyingSignalsPanel } from "./BuyingSignalsPanel";
import { LiveIntelligenceFeed } from "./LiveIntelligenceFeed";
import { LiveTranscriptPanel } from "./LiveTranscriptPanel";
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
          {state.candidate}
        </h1>

        <p className="mt-6 max-w-3xl text-xl leading-8 text-blue-100">
          FranchiseReady AI is actively monitoring the
          Discovery conversation, identifying buying
          signals, highlighting risks, and recommending
          the next best questions in real time.
        </p>

      </section>

      <div className="grid gap-8 xl:grid-cols-[1.5fr_1fr]">

        <LiveTranscriptPanel
          transcript={state.transcript}
        />

        <div className="space-y-6">

          <section className="rounded-3xl border bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold">
                AI Insights
              </h2>

              <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold uppercase text-blue-700">
                LIVE
              </div>

            </div>

            <div className="mt-6 space-y-4">

              {state.insights.map((insight) => (
                <div
                  key={insight.id}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="font-semibold">
                    {insight.title}
                  </div>

                  <div className="mt-2 text-sm leading-6 text-slate-600">
                    {insight.description}
                  </div>

                </div>
              ))}

            </div>

          </section>

          <BuyingSignalsPanel
            signals={state.buyingSignals}
          />

          <RiskDetectionPanel
            risks={state.risks}
          />

          <LiveIntelligenceFeed
            events={state.liveFeed}
          />

          <section className="rounded-3xl border bg-white p-6 shadow-sm">

            <div className="flex items-center justify-between">

              <h2 className="text-xl font-bold">
                Suggested Questions
              </h2>

              <div className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase text-indigo-700">
                AI
              </div>

            </div>

            <div className="mt-6 space-y-4">

              {state.suggestedQuestions.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-xl bg-slate-50 p-4 leading-7"
                  >
                    {item.question}
                  </div>
                ),
              )}

            </div>

          </section>

        </div>

      </div>

    </div>
  );
}