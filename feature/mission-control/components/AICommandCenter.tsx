"use client";

const suggestions = [
  "Who should I call first today?",
  "Generate John's referral package",
  "Show candidates ready for Discovery",
  "Which candidates are losing momentum?",
];

const actions = [
  {
    title: "Call John Smith",
    reason: "Buying confidence dropped 8%",
    color: "bg-red-500",
  },
  {
    title: "Generate ERA referral package",
    reason: "Sarah Williams reached 97% AI confidence",
    color: "bg-emerald-500",
  },
  {
    title: "Schedule Discovery",
    reason: "Michael completed assessment yesterday",
    color: "bg-blue-500",
  },
];

export function AICommandCenter() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 text-white shadow-2xl">

      <div className="border-b border-slate-800 p-8">

        <div className="flex items-center gap-3">

          <div className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />

          <span className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-300">
            AI COMMAND CENTER
          </span>

        </div>

        <h2 className="mt-6 text-3xl font-black">
          What would you like FranchiseReady AI to do?
        </h2>

        <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900 px-6 py-5 text-slate-400">
          Ask anything...
        </div>

      </div>

      <div className="grid gap-8 p-8 lg:grid-cols-2">

        <div>

          <h3 className="text-lg font-bold">
            Suggested Questions
          </h3>

          <div className="mt-5 space-y-3">

            {suggestions.map((question) => (

              <button
                key={question}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-5 py-4 text-left transition hover:border-blue-500 hover:bg-slate-800"
              >
                {question}
              </button>

            ))}

          </div>

        </div>

        <div>

          <h3 className="text-lg font-bold">
            AI Recommendations
          </h3>

          <div className="mt-5 space-y-4">

            {actions.map((action) => (

              <div
                key={action.title}
                className="rounded-xl border border-slate-700 bg-slate-900 p-5"
              >

                <div className="flex items-center gap-3">

                  <div
                    className={`h-3 w-3 rounded-full ${action.color}`}
                  />

                  <div className="font-bold">
                    {action.title}
                  </div>

                </div>

                <p className="mt-3 text-sm text-slate-400">
                  {action.reason}
                </p>

                <button className="mt-5 rounded-xl bg-blue-600 px-5 py-2 font-semibold hover:bg-blue-700">
                  Execute
                </button>

              </div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}