import { TaskWorkspacePage } from "@/feature/tasks/components/TaskWorkspacePage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const resolution = await resolveWorkspaceComposition();
  if (resolution.status !== "resolved" || !("runtimes" in resolution.composition)) return <WorkspaceFeatureUnavailable title="Tasks" />;
  const state = await resolution.composition.runtimes.createTasks().build(resolution.composition.runtimes.consultant.id);
  return <TaskWorkspacePage state={state} />;
}
