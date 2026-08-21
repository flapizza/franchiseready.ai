import { TeamMissionControlPage } from "@/feature/team-mission-control/components/TeamMissionControlPage";
import { TeamMissionControlRuntime } from "@/feature/team-mission-control/runtime/TeamMissionControlRuntime";

export default async function TeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const scope = typeof query.scope === "string" ? query.scope : "all";
  return <TeamMissionControlPage state={await new TeamMissionControlRuntime().build(scope)} />;
}
