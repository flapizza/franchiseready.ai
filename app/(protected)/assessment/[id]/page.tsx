import { notFound } from "next/navigation";

import { AssessmentPlayer } from "@/feature/assessment-engine/components/AssessmentPlayer";
import { AssessmentInvitationService } from "@/feature/crm/services/AssessmentInvitationService";
import { SeedCandidateRepository } from "@/feature/crm/repositories/SeedCandidateRepository";

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

  return (
    <main className="mx-auto max-w-4xl p-8">
      <AssessmentPlayer
        assessmentId={id}
        invitationToken={invitationToken}
        invitedIdentity={invitationToken ? (() => {
          const invitation = new AssessmentInvitationService(new SeedCandidateRepository()).getByToken(invitationToken);
          if (!invitation) return undefined;
          const [firstName, ...lastName] = invitation.candidateName.split(" ");
          return { firstName, lastName: lastName.join(" "), email: invitation.candidateEmail };
        })() : undefined}
      />
    </main>
  );
}
