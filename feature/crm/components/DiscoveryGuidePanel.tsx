type Props = {
  strengths: string[];
  concerns: string[];
  questions: string[];
};

export function DiscoveryGuidePanel({
  strengths,
  concerns,
  questions,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <header className="border-b border-slate-100 px-6 py-5">

        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
          Discovery Guide
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Conversation Preparation
        </h2>

      </header>

      <div className="space-y-8 p-6">

        <GuideSection
          title="Candidate Strengths"
          icon="✓"
          items={strengths}
          color="text-green-600"
        />

        <GuideSection
          title="Areas to Validate"
          icon="!"
          items={concerns}
          color="text-amber-600"
        />

        <GuideSection
          title="Recommended Questions"
          icon="?"
          items={questions}
          color="text-blue-600"
        />

      </div>

    </section>
  );
}

type GuideSectionProps = {
  title: string;
  items: string[];
  icon: string;
  color: string;
};

function GuideSection({
  title,
  items,
  icon,
  color,
}: GuideSectionProps) {
  return (
    <div>

      <h3 className="mb-4 flex items-center gap-3 text-lg font-semibold">

        <span className={color}>
          {icon}
        </span>

        {title}

      </h3>

      <ul className="space-y-3">

        {items.map((item) => (
          <li
            key={item}
            className="rounded-lg bg-slate-50 p-3 text-slate-700"
          >
            {item}
          </li>
        ))}

      </ul>

    </div>
  );
}