import { Button, Card } from "@/feature/ui";

type Props = {
  onGenerateSummary?: () => void;
  onGenerateBrief?: () => void;
  onGenerateEmail?: () => void;
  onRecommendBrands?: () => void;
  onScheduleFollowUp?: () => void;
};

export function MeetingActionsBar({
  onGenerateSummary,
  onGenerateBrief,
  onGenerateEmail,
  onRecommendBrands,
  onScheduleFollowUp,
}: Props) {
  return (
    <Card
      title="Meeting Actions"
      subtitle="Everything the consultant needs after the discovery conversation."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

        <ActionButton
          title="Generate Summary"
          description="AI meeting recap"
          onClick={onGenerateSummary}
        />

        <ActionButton
          title="Consultant Brief"
          description="Update CRM"
          onClick={onGenerateBrief}
        />

        <ActionButton
          title="Follow-up Email"
          description="Draft automatically"
          onClick={onGenerateEmail}
        />

        <ActionButton
          title="Recommend Brands"
          description="Best franchise matches"
          onClick={onRecommendBrands}
        />

        <ActionButton
          title="Schedule Next Step"
          description="Continue the process"
          onClick={onScheduleFollowUp}
        />

      </div>
    </Card>
  );
}

type ActionButtonProps = {
  title: string;
  description: string;
  onClick?: () => void;
};

function ActionButton({
  title,
  description,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-2xl border border-slate-200 bg-white p-6 text-left transition-all duration-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
    >
      <h3 className="font-semibold text-slate-900">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {description}
      </p>

      <div className="mt-5">
        
      </div>

    </button>
  );
}