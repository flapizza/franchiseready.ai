import { MissionControlPage } from "@/feature/mission-control/components/MissionControlPage";
import { MissionControlRuntime } from "@/feature/mission-control/runtime/MissionControlRuntime";

export default async function CRMPage() {
  const runtime =
    new MissionControlRuntime();

  const state =
    await runtime.build();

  return (
    <MissionControlPage
      state={state}
    />
  );
}
