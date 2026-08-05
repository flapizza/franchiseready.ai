import { Button, Card } from "@/feature/ui";

type Props = {
  notes: string;
};

export function LiveNotesPanel({
  notes,
}: Props) {
  return (
    <Card
      title="Live Meeting Notes"
      subtitle="Capture important discussion points while AI generates insights."
    >
      <div className="space-y-6">

        <textarea
          defaultValue={notes}
          placeholder="Start typing your meeting notes..."
          className="min-h-[420px] w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-6 text-base leading-8 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
        />

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.20em] text-slate-500">
              AI Status
            </p>

            <div className="mt-2 flex items-center gap-3">

              <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />

              <span className="font-medium text-slate-700">
                Listening for new insights...
              </span>

            </div>

          </div>

          <div className="flex gap-3">

            <Button variant="secondary">
              Save Draft
            </Button>

            <Button>
              Generate Summary
            </Button>

          </div>

        </div>

      </div>
    </Card>
  );
}