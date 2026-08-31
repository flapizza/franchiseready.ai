import type { WorkspacePresentation } from "@/feature/layout/models/WorkspacePresentation";

export function DemoWorkspaceIndicator({
  indicator,
}: {
  indicator: NonNullable<WorkspacePresentation["temporaryDataIndicator"]>;
}) {
  return (
    <aside
      aria-label="Demo workspace data notice"
      className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-sm text-amber-950"
    >
      <strong>{indicator.label}</strong>
      <span aria-hidden="true"> — </span>
      <span>{indicator.detail}</span>
    </aside>
  );
}
