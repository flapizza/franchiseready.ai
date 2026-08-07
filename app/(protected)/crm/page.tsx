import { MissionControlPage } from "@/feature/mission-control/components/MissionControlPage";
import { MissionControlRuntime } from "@/feature/mission-control/runtime/MissionControlRuntime";

export default function CRMPage() {
  const runtime =
    new MissionControlRuntime();

  const state =
    runtime.build();

  return (
    <MissionControlPage
      state={state}
    />
  );
}