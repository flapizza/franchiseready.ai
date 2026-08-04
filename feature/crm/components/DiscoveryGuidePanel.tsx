import { Card } from "@/feature/ui";

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
    <Card
      title="AI Discovery Guide"
      subtitle="Preparation guidance generated from the FranchiseReady Intelligence Engine."
    >
      <div className="space-y-10">

        <GuideSection
          title="Candidate Strengths"
          subtitle="Topics you should reinforce during the meeting."
          color="emerald"
          icon="✓"
          items={strengths}
        />

        <GuideSection
          title="Discovery Priorities"
          subtitle="Areas requiring additional validation."
          color="amber"
          icon="!"
          items={concerns}
        />

        <GuideSection
          title="Suggested Discovery Questions"
          subtitle="Questions recommended by the Intelligence Engine."
          color="blue"
          icon="?"
          items={questions}
        />

      </div>
    </Card>
  );
}

type GuideSectionProps = {
  title: string;
  subtitle: string;
  items: string[];
  icon: string;
  color: "emerald" | "amber" | "blue";
};

function GuideSection({
  title,
  subtitle,
  items,
  icon,
  color,
}: GuideSectionProps) {
  const styles = {
    emerald: {
      badge: "bg-emerald-100 text-emerald-700",
      border: "border-emerald-200",
      background: "bg-emerald-50",
      heading: "text-emerald-700",
    },
    amber: {
      badge: "bg-amber-100 text-amber-700",
      border: "border-amber-200",
      background: "bg-amber-50",
      heading: "text-amber-700",
    },
    blue: {
      badge: "bg-blue-100 text-blue-700",
      border: "border-blue-200",
      background: "bg-blue-50",
      heading: "text-blue-700",
    },
  } as const;

  const style = styles[color];

  return (
    <section>

      <div className="flex items-center gap-4">

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${style.badge}`}
        >
          {icon}
        </div>

        <div>

          <h3
            className={`text-xl font-semibold ${style.heading}`}
          >
            {title}
          </h3>

          <p className="text-sm text-slate-500">
            {subtitle}
          </p>

        </div>

      </div>

      <div className="mt-6 space-y-4">

        {items.map((item) => (
          <div
            key={item}
            className={`rounded-2xl border p-5 ${style.border} ${style.background}`}
          >
            <p className="leading-7 text-slate-700">
              {item}
            </p>
          </div>
        ))}

      </div>

    </section>
  );
}