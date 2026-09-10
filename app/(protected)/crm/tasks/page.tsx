import { TaskWorkspacePage } from "@/feature/tasks/components/TaskWorkspacePage";
import { resolveConsultantSchedule } from "@/feature/tasks/runtime/resolveConsultantSchedule";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const schedule = await resolveConsultantSchedule();
  if (!schedule) return <WorkspaceFeatureUnavailable title="Tasks" />;
  const state = await schedule.taskRuntime.build(schedule.consultantId);
  return <TaskWorkspacePage state={state} />;
}
