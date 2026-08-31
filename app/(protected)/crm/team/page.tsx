import { TeamMissionControlPage } from "@/feature/team-mission-control/components/TeamMissionControlPage";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";
import { CreateInvitationForm } from "@/feature/membership-invitations/components/CreateInvitationForm";

export default async function TeamPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const scope = typeof query.scope === "string" ? query.scope : "all";
  const resolution=await resolveWorkspaceComposition();
  if(resolution.status!=="resolved")return <WorkspaceFeatureUnavailable title="Team Command Center"/>;
  if(resolution.session.kind === "production") return ["owner","admin"].includes(resolution.session.membership.role) ? <CreateInvitationForm canInviteAdmin={resolution.session.membership.role === "owner"}/> : <WorkspaceFeatureUnavailable title="Team Command Center" detail="Organization leadership is required to invite members."/>;
  if (!("runtimes" in resolution.composition)) return <WorkspaceFeatureUnavailable title="Team Command Center"/>;
  return <TeamMissionControlPage state={await resolution.composition.runtimes.createTeamMissionControl().build(scope)} />;
}
