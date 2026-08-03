type Props = {
  executiveSummary: string;
  recommendedApproach: string;
  objectives: string[];
  openingQuestions: string[];
  nextActions: string[];
};

export function ConsultantBriefPanel({
  executiveSummary,
  recommendedApproach,
  objectives,
  openingQuestions,
  nextActions,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <header className="border-b border-slate-100 px-6 py-5">

        <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">
          AI Consultant
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Discovery Call Brief
        </h2>

      </header>

      <div className="space-y-8 p-6">

        <Section
          title="Executive Summary"
          content={executiveSummary}
        />

        <Section
          title="Recommended Approach"
          content={recommendedApproach}
        />

        <ListSection
          title="Discovery Objectives"
          items={objectives}
        />

        <ListSection
          title="Suggested Opening Questions"
          items={openingQuestions}
        />

        <ListSection
          title="Recommended Next Steps"
          items={nextActions}
        />

      </div>

    </section>
  );
}

type SectionProps = {
  title: string;
  content: string;
};

function Section({
  title,
  content,
}: SectionProps) {
  return (
    <div>

      <h3 className="mb-3 text-lg font-semibold">
        {title}
      </h3>

      <p className="leading-7 text-slate-600">
        {content}
      </p>

    </div>
  );
}

type ListSectionProps = {
  title: string;
  items: string[];
};

function ListSection({
  title,
  items,
}: ListSectionProps) {
  return (
    <div>

      <h3 className="mb-3 text-lg font-semibold">
        {title}
      </h3>

      <ul className="space-y-3">

        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-slate-50 p-3"
          >
            {item}
          </li>
        ))}

      </ul>

    </div>
  );
}