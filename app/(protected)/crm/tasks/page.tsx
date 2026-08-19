import { TaskWorkspacePage } from "@/feature/tasks/components/TaskWorkspacePage";
import { TaskRuntime } from "@/feature/tasks/runtime/TaskRuntime";
import { DemoTaskRepository } from "@/feature/tasks/repositories/DemoTaskRepository";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";
import { demoConsultant } from "@/feature/demo/data/demoConsultant";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const state = await new TaskRuntime(new DemoTaskRepository(), new SeedCandidateRepository()).build(demoConsultant.id);
  return <TaskWorkspacePage state={state} />;
}
