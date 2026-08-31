import { notFound } from "next/navigation";

import { AssessmentPlayer } from "@/feature/assessment-engine/components/AssessmentPlayer";
import { resolveWorkspaceComposition } from "@/feature/platform/composition/resolveWorkspaceComposition";
import { WorkspaceFeatureUnavailable } from "@/feature/platform/components/WorkspaceFeatureUnavailable";

type Props = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ invitation?: string }>;
};

export default async function AssessmentPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const { invitation: invitationToken } = await searchParams;

  if (!id) {
    notFound();
  }
  const resolution=await resolveWorkspaceComposition();if(resolution.status!=="resolved" || !("runtimes" in resolution.composition))return <WorkspaceFeatureUnavailable title="Assessment workspace"/>;
  const assessment = await resolution.composition.dependencies.assessments.getAssessmentById(id);
  if (!assessment) notFound();

  return (
    <main className="mx-auto max-w-4xl p-8">
      <AssessmentPlayer
        assessmentId={id}
        assessment={assessment}
        invitationToken={invitationToken}
        invitedIdentity={invitationToken ? (() => {
          const invitation = resolution.composition.runtimes.createAssessmentInvitations().getByToken(invitationToken);
          if (!invitation) return undefined;
          const [firstName, ...lastName] = invitation.candidateName.split(" ");
          return { firstName, lastName: lastName.join(" "), email: invitation.candidateEmail };
        })() : undefined}
      />
    </main>
  );
}
