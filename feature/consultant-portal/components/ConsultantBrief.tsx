import { Card } from "@/feature/ui";

import type { ConsultantBrief } from "../models/ConsultantBrief";

type Props = {
  brief: ConsultantBrief;
};

export function ConsultantBrief({
  brief,
}: Props) {
  return (
    <Card
      title="Consultant Brief"
      subtitle={`Prepared ${brief.preparedAt}`}
    >
      <div className="space-y-8">

        <section>

          <h3 className="text-lg font-semibold text-slate-900">
            Executive Snapshot
          </h3>

          <div className="mt-4 grid gap-4 md:grid-cols-3">

            <Metric
              label="Readiness"
              value={brief.executiveSnapshot.readiness}
            />

            <Metric
              label="Confidence"
              value={`${brief.executiveSnapshot.confidence}%`}
            />

            <Metric
              label="Award Probability"
              value={`${brief.executiveSnapshot.awardProbability}%`}
            />

          </div>

        </section>

        <Section
          title="Candidate Overview"
          items={brief.overview}
        />

        <Section
          title="Today's Objectives"
          items={brief.objectives}
        />

        <Section
          title="Strengths"
          items={brief.strengths}
        />

        <Section
          title="Potential Risks"
          items={brief.risks}
        />

        <section>

          <h3 className="font-semibold text-slate-900">
            Suggested Opening Question
          </h3>

          <div className="mt-3 rounded-xl bg-blue-50 p-5 text-slate-800 italic">
            "{brief.openingQuestion}"
          </div>

        </section>

        <Section
          title="Reminders"
          items={brief.reminders}
        />

      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <section>

      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <ul className="mt-3 space-y-2">

        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-slate-50 px-4 py-3 text-slate-700"
          >
            • {item}
          </li>
        ))}

      </ul>

    </section>
  );
}